// Seed da trilha Sistemas Operacionais e Concorrência, estagio 5 do roadmap.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-sistemas-operacionais-e-concorrencia.ts
import { pathToFileURL } from "node:url";
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

export const NOME = "Sistemas Operacionais e Concorrência";
const CARGA_HORARIA = 20;
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "O sistema operacional sem mistério: processos e threads, corridas de dados e como o mutex salva, semáforos, variáveis de condição e atomics, o escalonador por dentro, memória virtual de verdade e a E/S que domina o tempo dos programas. A base de concorrência que todo backend e todo firmware cobram.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Processos",
    aulas: [
        {
            titulo: "O que é um processo",
            blocks: [
                {
                    type: "text",
                    value: "# Um programa em execução\n\nO arquivo executável no disco é uma receita: bytes de código e dados, parados. O processo é a receita em execução: o código carregado na memória mais todo o estado que a execução acumula, o contador de programa apontando a próxima instrução, os registradores, a pilha de chamadas, o heap, os arquivos abertos. Rode o mesmo binário três vezes e você tem três processos independentes, cada um com seu PID, seu estado e sua memória.\n\nEssa separação é a primeira grande entrega do sistema operacional: isolamento. Um processo não lê a memória do outro, não corrompe as variáveis do vizinho e, quando trava, cai sozinho. É por isso que um bug no navegador não derruba o editor de texto ao lado: cada um vive num mundo que o kernel mantém separado com ajuda do hardware, não por boa vontade dos programas.\n\nNo Linux, você enxerga essa população com ps aux ou top: centenas de processos numa máquina comum, a maioria dormindo à espera de algum evento. Cada linha dessas é um mundo isolado, com contabilidade própria mantida pelo kernel.",
                },
                {
                    type: "table",
                    value: '[["Estado","Significado","Exemplo típico"],["Rodando","Na CPU neste instante","Loop de cálculo pesado"],["Pronto","Quer CPU, esperando a vez","CPU ocupada; fila do escalonador"],["Bloqueado","Espera evento, sem gastar CPU","read() aguardando disco ou rede"],["Zumbi","Terminou; pai não leu o status","Filho encerrado sem wait()"],["Parado","Suspenso por sinal","Ctrl+Z no terminal"]]',
                },
                {
                    type: "quote",
                    value: "Isolamento não é educação entre processos: é imposição do kernel com ajuda do hardware. O vizinho não lê a sua memória nem que queira.",
                },
                {
                    type: "text",
                    value: "## O PCB: a ficha do processo no kernel\n\nPara administrar essa população, o kernel mantém uma estrutura por processo, o PCB (Process Control Block), que no Linux é a task_struct. É ali que vivem o PID, o estado atual, os registradores salvos quando o processo sai da CPU, o ponteiro para a tabela de páginas, a tabela de arquivos abertos e as credenciais de usuário. Quando o escalonador troca de processo, é o PCB que permite congelar um exatamente onde parou e descongelar o outro exatamente de onde tinha parado.\n\n## A ilusão de exclusividade\n\nSeu programa roda como se a CPU fosse toda dele, mas com 8 núcleos e 300 processos a conta não fecha. O kernel reveza a CPU em fatias de milissegundos, salvando e restaurando contexto a cada troca, rápido demais para você perceber. A mesma mágica vale para a memória: todo processo enxerga um espaço de endereços contínuo e gigante, só dele. Essas duas ilusões, CPU exclusiva e memória exclusiva, são o contrato que esta trilha vai abrir para você ver o mecanismo por dentro: escalonador nos próximos módulos, memória virtual logo depois.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença entre um programa e um processo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O programa é o arquivo; o processo é ele em execução, com estado",
                            isCorrect: true,
                        },
                        {
                            text: "O programa roda no kernel; o processo roda no espaço do usuário",
                            isCorrect: false,
                        },
                        {
                            text: "O programa é o código fonte; o processo é o binário já compilado",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos: dois nomes que o kernel usa para a mesma estrutura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o kernel guarda no PCB (a task_struct do Linux)?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "PID, estado, registradores salvos e recursos do processo",
                            isCorrect: true,
                        },
                        {
                            text: "Somente o código executável carregado do binário do disco",
                            isCorrect: false,
                        },
                        {
                            text: "O histórico de todas as instruções que o processo executou",
                            isCorrect: false,
                        },
                        {
                            text: "As variáveis locais de cada função em execução no momento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um processo bloqueado em read() de disco gasta CPU enquanto espera?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não: ele sai da fila da CPU e só volta quando o evento chega",
                            isCorrect: true,
                        },
                        {
                            text: "Sim: ele fica girando em loop, conferindo o disco sem parar",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, mas gastando apenas metade do quantum a que tem direito",
                            isCorrect: false,
                        },
                        {
                            text: "Não, porque o kernel move o processo direto para o swap antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um bug que trava o navegador não derruba o editor de texto aberto ao lado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada processo tem memória isolada, imposta pelo kernel",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o editor roda com prioridade maior que o navegador",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o kernel reinicia na hora o processo que travou",
                            isCorrect: false,
                        },
                        {
                            text: "Porque aplicativos gráficos rodam em máquinas virtuais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 300 processos e 8 núcleos, por que cada programa parece ter a CPU inteira só para si?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O kernel reveza a CPU em fatias de milissegundos entre eles",
                            isCorrect: true,
                        },
                        {
                            text: "A CPU moderna executa os 300 ao mesmo tempo em micronúcleos",
                            isCorrect: false,
                        },
                        {
                            text: "Só 8 processos existem de fato; o resto fica em hibernação",
                            isCorrect: false,
                        },
                        {
                            text: "Cada processo recebe do hardware um núcleo virtual dedicado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Nascimento e morte",
            blocks: [
                {
                    type: "text",
                    value: "# fork e exec: o modelo de criação\n\nNo Unix, criar processo é uma dupla de operações com papéis separados. O fork() duplica o processo atual: o filho nasce como uma cópia quase idêntica do pai, rodando o mesmo código, no mesmo ponto. A chamada retorna duas vezes: devolve 0 no filho e o PID do filho no pai, e é esse retorno que permite aos dois seguirem caminhos diferentes no mesmo if. O exec() faz a outra metade: troca a imagem do processo por um programa novo, mantendo o mesmo PID. O processo continua o mesmo aos olhos do kernel; o conteúdo é outro.\n\nO shell é o exemplo canônico desse modelo. Quando você digita ls -l, o bash faz fork() de si mesmo, o filho chama exec() do ls, e o pai fica em wait() até o filho terminar e entregar seu código de saída. Três chamadas, e você tem o ciclo de vida completo: nascer como cópia, virar outro programa, morrer entregando um número. Esse desenho de duas peças permite ao filho ajustar o próprio ambiente entre o fork e o exec, e é assim que o shell implementa redirecionamento.",
                },
                {
                    type: "code",
                    value: 'pid_t pid = fork();          // duplica o processo\nif (pid == 0) {\n    // so o filho entra aqui\n    execlp("ls", "ls", "-l", (char*) NULL);  // vira outro programa\n    _exit(127);              // so roda se o exec falhar\n} else {\n    int status;\n    waitpid(pid, &status, 0);   // pai espera e coleta o exit code\n    // WEXITSTATUS(status) tem o codigo: 0 = sucesso\n}',
                },
                {
                    type: "table",
                    value: '[["Chamada","O que faz","Retorno"],["fork()","Duplica o processo atual","0 no filho; PID do filho no pai"],["exec*()","Troca a imagem por outro programa","Só retorna se falhar"],["wait()/waitpid()","Espera um filho e coleta o status","PID do filho colhido"],["exit(n)","Encerra entregando o código n","Não retorna"]]',
                },
                {
                    type: "quote",
                    value: "Zumbi não é um processo rodando fora de controle: é só a certidão de óbito que o pai ainda não leu. Quem assusta de verdade é o pai que nunca lê.",
                },
                {
                    type: "text",
                    value: "## Zumbis, órfãos e o número final\n\nQuando um processo termina, o kernel não pode apagar tudo na hora: precisa guardar o código de saída até o pai perguntar com wait(). Nesse intervalo o filho é um zumbi: não roda, não ocupa memória de verdade, mas mantém uma entrada na tabela de processos, marcada com Z no ps. Zumbi em quantidade é bug clássico de servidor: um pai que dispara filhos e nunca coleta esgota a tabela de PIDs. O órfão é o caso inverso: o pai morre primeiro, e o filho é adotado pelo init (ou systemd), que faz wait() por ofício e evita zumbis perpétuos.\n\nO código de saída é o contrato final: 0 significa sucesso, qualquer outro valor de 1 a 255 significa erro, com o significado definido por cada programa. No shell, $? mostra o código do último comando, e morte por sinal aparece como 128 mais o número do sinal: um processo morto com SIGKILL (9) devolve 137, valor que você reencontra em contêiner derrubado por falta de memória. Scripts, CI e orquestradores decidem tudo com base nesse número: trate o seu com o mesmo cuidado.",
                },
            ],
            questions: [
                {
                    statement: "No modelo do Unix, o que o fork() faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Duplica o processo atual, criando um filho quase idêntico",
                            isCorrect: true,
                        },
                        {
                            text: "Carrega um programa novo por cima do processo chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Cria uma thread nova dentro do mesmo processo chamador",
                            isCorrect: false,
                        },
                        {
                            text: "Reserva memória para o exec seguinte, sem criar processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um processo zumbi?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um que terminou, mas cujo status o pai ainda não coletou",
                            isCorrect: true,
                        },
                        {
                            text: "Um que ignora SIGKILL e continua rodando indefinidamente",
                            isCorrect: false,
                        },
                        {
                            text: "Um órfão que o init ainda não conseguiu adotar de volta",
                            isCorrect: false,
                        },
                        {
                            text: "Um que ficou preso em espera de disco e parou de responder",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O pai de um processo morre primeiro. O que acontece com o filho no Linux?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É adotado pelo init/systemd, que coleta seu status ao fim",
                            isCorrect: true,
                        },
                        {
                            text: "É encerrado pelo kernel junto com o pai, por consistência",
                            isCorrect: false,
                        },
                        {
                            text: "Vira zumbi imediatamente e some no próximo boot da máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Continua rodando, mas sem direito a abrir novos arquivos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um contêiner terminou com exit code 137. O que esse número indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Morte por sinal 9 (SIGKILL): 128 somado ao número do sinal",
                            isCorrect: true,
                        },
                        {
                            text: "Sucesso parcial: 137 tarefas concluídas antes do encerramento",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de sintaxe no entrypoint, código fixo da especificação",
                            isCorrect: false,
                        },
                        {
                            text: "Falta de espaço em disco no volume montado pelo contêiner",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que criar processo é fork() seguido de exec(), e não uma chamada única?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O filho ajusta o próprio ambiente entre as duas chamadas",
                            isCorrect: true,
                        },
                        {
                            text: "Compatibilidade: o exec() só surgiu décadas depois do fork",
                            isCorrect: false,
                        },
                        {
                            text: "Uma chamada única exigiria privilégios de root no Linux",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel não consegue copiar e carregar na mesma operação",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "O espaço de endereçamento",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa da memória de um processo\n\nTodo processo enxerga a memória como uma régua enorme de endereços que começa perto do zero e vai a valores astronômicos. Esse espaço tem um layout clássico, de baixo para cima: text, o código de máquina, marcado como somente leitura e executável; data e bss, as variáveis globais e estáticas (inicializadas e zeradas); o heap, que cresce para cima conforme malloc e new pedem memória; e lá no alto a stack, que cresce para baixo, guardando um frame por chamada de função com locais, argumentos e endereço de retorno. No meio, mapeadas, entram as bibliotecas compartilhadas como a libc.\n\nCada região tem permissões próprias, e é isso que transforma bugs em avisos claros: escrever num endereço da região text gera segfault na hora, executar dados idem. O layout também explica comportamentos que você já viu: uma variável local morre quando a função retorna porque o frame dela é desempilhado; um new sem delete vive para sempre porque o heap não desaloca sozinho. No Linux, cat /proc/PID/maps mostra esse mapa real, região por região, com permissões rwx.",
                },
                {
                    type: "code",
                    value: '#include <cstdio>\n#include <cstdlib>\n\nint global = 42;                       // regiao data\n\nint main() {\n    int local = 7;                     // stack\n    int* dinamico = (int*) std::malloc(sizeof(int));  // heap\n    std::printf("codigo:  %p\\n", (void*) &main);\n    std::printf("global:  %p\\n", (void*) &global);\n    std::printf("heap:    %p\\n", (void*) dinamico);\n    std::printf("stack:   %p\\n", (void*) &local);\n    std::free(dinamico);\n}\n// Quatro enderecos em regioes bem separadas; rode duas vezes\n// e os numeros mudam: ASLR sorteia as bases a cada execucao.',
                },
                {
                    type: "table",
                    value: '[["Região","O que mora","Cresce","Erro clássico"],["text","Código de máquina, só leitura","Fixa","Escrever aqui: segfault"],["data/bss","Globais e estáticas","Fixa","Global virando estado oculto"],["heap","Alocações de malloc e new","Para cima","Vazamento; use-after-free"],["stack","Frames, locais, retornos","Para baixo","Recursão infinita: stack overflow"]]',
                },
                {
                    type: "quote",
                    value: "O endereço que você imprime não é um lugar físico: é uma coordenada dentro do seu processo. O mesmo número, no processo vizinho, aponta para outro mundo.",
                },
                {
                    type: "text",
                    value: "## Cada processo no seu mundo\n\nEsses endereços são virtuais: uma abstração por processo que o módulo 5 destrincha. A consequência prática importa desde já: um ponteiro não atravessa processos. Enviar 0x55e31c2b50a0 pelo pipe para outro programa é enviar um número sem sentido, porque a tradução de endereço para memória física é privada de cada processo. É essa privacidade que faz o isolamento da aula 1 funcionar, e é por ela que compartilhar dados entre processos exige mecanismos explícitos, o assunto da aula 5.\n\nDois limites merecem números. A stack tem teto: 8 MB por padrão no Linux (ulimit -s), e recursão sem caso base estoura isso com milhares de frames, o famoso stack overflow. O heap é grande, mas administrado pelo alocador em cima de pedidos ao kernel; alocar e liberar em padrões ruins fragmenta, e vazar de pouco em pouco num servidor que roda semanas termina em processo devorando gigabytes. Quando o módulo 2 introduzir threads, guarde este mapa: threads do mesmo processo compartilham tudo isso, cada uma com apenas a própria stack separada.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em qual região da memória vivem as alocações feitas com new e malloc?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No heap, que cresce conforme o programa pede memória",
                            isCorrect: true,
                        },
                        {
                            text: "Na stack, junto dos frames das funções que as pediram",
                            isCorrect: false,
                        },
                        {
                            text: "Na região text, ao lado do código de máquina gerado",
                            isCorrect: false,
                        },
                        {
                            text: "Na região data, junto das variáveis globais e estáticas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que escrever num ponteiro para a região text causa segfault?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A região do código é marcada como somente leitura",
                            isCorrect: true,
                        },
                        {
                            text: "A região do código fica fora do espaço de endereços",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador remove qualquer escrita nessa região",
                            isCorrect: false,
                        },
                        {
                            text: "Endereços de código só aceitam escrita vinda do kernel",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma recursão sem caso base derruba o programa. Qual limite ela estourou?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A stack, que no Linux tem por padrão uns 8 MB por processo",
                            isCorrect: true,
                        },
                        {
                            text: "O heap, que o kernel limita a 8 MB para cada processo novo",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela de processos, que esgota PIDs a cada nova chamada",
                            isCorrect: false,
                        },
                        {
                            text: "O quantum de CPU, que a recursão consome antes do retorno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Enviar um ponteiro por pipe para outro processo não funciona. Por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O endereço é virtual e só faz sentido no processo de origem",
                            isCorrect: true,
                        },
                        {
                            text: "O pipe corrompe valores numéricos maiores que 32 bits no envio",
                            isCorrect: false,
                        },
                        {
                            text: "Ponteiros perdem as permissões rwx ao atravessar descritores",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel bloqueia o envio de endereços por segurança, com erro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Rodando o mesmo binário duas vezes, os endereços impressos mudam. O que explica isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "ASLR: o kernel sorteia as bases das regiões a cada execução",
                            isCorrect: true,
                        },
                        {
                            text: "O heap devolve endereços em ordem aleatória por eficiência",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU renumera os endereços físicos a cada novo processo",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador embute um deslocamento diferente a cada build",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sinais",
            blocks: [
                {
                    type: "text",
                    value: "# Interrupções de software para processos\n\nSinal é o mecanismo mais antigo de avisar um processo de que algo aconteceu: um número pequeno entregue de forma assíncrona, no meio de qualquer instrução. Ctrl+C no terminal envia SIGINT; kill PID envia SIGTERM; um acesso inválido à memória vira SIGSEGV entregue pelo kernel. Para cada sinal existe uma ação padrão (na maioria, encerrar o processo), e o processo pode substituí-la registrando um handler, uma função chamada quando o sinal chega.\n\nA distinção mais importante da aula cabe numa linha: SIGTERM é um pedido, SIGKILL é uma execução. O SIGTERM (15) chega ao processo, que pode tratá-lo, salvar estado, fechar conexões e sair limpo, ou até ignorá-lo. O SIGKILL (9) nunca chega ao processo: o kernel simplesmente o remove da existência, sem handler, sem despedida, sem flush de buffers. O mesmo vale para SIGSTOP, que congela sem consulta. Por isso a liturgia correta de desligar um serviço é enviar SIGTERM, dar um prazo e só então apelar para o 9: é exatamente o que docker stop faz, com 10 segundos de prazo por padrão.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Número","Ação padrão","Tratável?"],["SIGINT","2","Encerra (Ctrl+C no terminal)","Sim"],["SIGTERM","15","Encerra; é o pedido educado","Sim"],["SIGKILL","9","Mata sem avisar o processo","Não"],["SIGSTOP","19","Congela até chegar SIGCONT","Não"],["SIGSEGV","11","Encerra com core dump","Sim, mas raramente vale"]]',
                },
                {
                    type: "code",
                    value: '#include <atomic>\n#include <csignal>\n\nstd::atomic<bool> parar{false};\n\nextern "C" void trata_sigterm(int) {\n    parar = true;   // handler minimo: so marca a flag e retorna\n}\n\nint main() {\n    std::signal(SIGTERM, trata_sigterm);\n    while (!parar) {\n        // trabalho normal; o loop confere a flag a cada volta\n    }\n    // caminho de saida limpa: fechar arquivos, drenar filas, exit(0)\n}',
                },
                {
                    type: "quote",
                    value: "SIGTERM pede; SIGKILL executa. O processo nunca vê o 9 chegar, e a sujeira que ele deixou (locks, arquivos temporários, transações) vira problema seu no reinício seguinte.",
                },
                {
                    type: "text",
                    value: "## Handlers: quanto menos, melhor\n\nHandler roda em contexto estranho: o sinal interrompe o programa em qualquer ponto, inclusive no meio de um malloc ou de um printf. Se o handler chamar essas mesmas funções, pode corromper estruturas internas pela reentrância. A regra prática é usar no handler apenas funções async-signal-safe, uma lista curta, e a disciplina profissional é ainda mais simples: o handler escreve numa flag atômica e retorna; quem age é o loop principal, em contexto normal, como no código acima. É o desenho que o projeto do módulo 7 vai usar para shutdown sem perder dados.\n\nDois detalhes completam o quadro. Primeiro, o que não dá para tratar: além de SIGKILL e SIGSTOP, tratar SIGSEGV para seguir rodando é quase sempre má ideia, porque o processo já está num estado corrompido; deixe o core dump nascer e depure. Segundo, sinais são também a ponte com a operação: systemd e Kubernetes desligam serviços com SIGTERM e prazo antes do SIGKILL, e nohup existe para blindar um processo do SIGHUP que chega quando o terminal fecha. Tratar sinal bem é requisito de produção, não luxo.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença essencial entre SIGTERM e SIGKILL?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "SIGTERM pode ser tratado; SIGKILL nem chega ao processo",
                            isCorrect: true,
                        },
                        {
                            text: "SIGTERM é mais rápido; SIGKILL espera o quantum terminar",
                            isCorrect: false,
                        },
                        {
                            text: "SIGTERM só funciona no terminal; SIGKILL só via chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "SIGTERM exige root; SIGKILL qualquer usuário pode enviar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o Ctrl+C no terminal envia ao processo em primeiro plano?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "SIGINT, cujo padrão é encerrar, mas que pode ser tratado",
                            isCorrect: true,
                        },
                        {
                            text: "SIGKILL, que encerra o processo sem chance de reação",
                            isCorrect: false,
                        },
                        {
                            text: "SIGSTOP, que congela o processo até o próximo comando",
                            isCorrect: false,
                        },
                        {
                            text: "SIGHUP, que avisa o processo de que o terminal fechou",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a boa prática num handler de sinal é só marcar uma flag e retornar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O sinal interrompe qualquer ponto; função comum não é segura ali",
                            isCorrect: true,
                        },
                        {
                            text: "Handlers têm limite de 100 microssegundos imposto pelo kernel do Linux",
                            isCorrect: false,
                        },
                        {
                            text: "Flags são a única memória que um handler tem permissão de enxergar",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel descarta os próximos sinais enquanto o handler não retornar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o docker stop faz, na prática, com o processo principal do contêiner?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Envia SIGTERM, espera um prazo e só então envia SIGKILL",
                            isCorrect: true,
                        },
                        {
                            text: "Envia SIGKILL de imediato para garantir a parada na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Envia SIGSTOP e mantém o contêiner congelado no disco",
                            isCorrect: false,
                        },
                        {
                            text: "Fecha os descritores do processo e espera ele perceber",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que tratar SIGSEGV para continuar rodando é geralmente má ideia?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O processo já está corrompido; seguir esconde o defeito",
                            isCorrect: true,
                        },
                        {
                            text: "O handler de SIGSEGV roda com prioridade baixa demais",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel reenvia o sinal a cada quantum até o processo cair",
                            isCorrect: false,
                        },
                        {
                            text: "Depois do SIGSEGV o processo perde acesso ao heap inteiro",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "IPC panorama",
            blocks: [
                {
                    type: "text",
                    value: "# Mundos isolados precisam conversar\n\nO isolamento que protege os processos cria o problema seguinte: como dois mundos separados trocam dados? Toda comunicação entre processos (IPC) passa pelo kernel, que atua como carteiro ou como cartório, e cada mecanismo faz um contrato diferente entre simplicidade, velocidade e alcance.\n\nO pipe é o mais simples: um cano unidirecional de bytes entre processos aparentados, criado pelo pai antes do fork. É ele que o shell usa em cat log.txt | grep erro. A FIFO (pipe nomeado) remove a exigência de parentesco dando nome no sistema de arquivos. A fila de mensagens entrega pacotes delimitados em vez de fluxo contínuo: o leitor recebe mensagens inteiras, com prioridade. A memória compartilhada é o extremo de velocidade: uma região que dois processos mapeiam ao mesmo tempo, sem cópia nenhuma depois de montada, mas sem nenhuma sincronização de brinde. E o socket local (Unix domain) é o canivete: bidirecional, sem parentesco, com a mesma API dos sockets de rede, o que torna trivial migrar a conversa para outra máquina depois.",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Forma","Exige parentesco?","Velocidade","Use quando"],["pipe","Fluxo de bytes, uma direção","Sim","Boa","Encadear filtros, shell"],["FIFO","Fluxo com nome no filesystem","Não","Boa","Pipe entre processos avulsos"],["Fila de mensagens","Mensagens delimitadas","Não","Boa","Comandos e eventos discretos"],["Memória compartilhada","Região mapeada em comum","Não","Máxima, zero cópia","Alto volume; latência mínima"],["Socket local","Fluxo bidirecional","Não","Boa","Cliente-servidor na mesma máquina"]]',
                },
                {
                    type: "quote",
                    value: "Memória compartilhada é o IPC mais rápido e o único que não vem com sincronização de fábrica: o kernel entrega a região e o problema de corrida junto. Os módulos 2 e 3 existem por causa dessa conta.",
                },
                {
                    type: "text",
                    value: "## O critério de escolha\n\nA decisão sai de três perguntas. Primeira: fluxo ou mensagens? Logs e streams casam com pipe e socket; comandos discretos casam com fila. Segunda: qual o volume? Pipe e socket copiam os dados duas vezes (do produtor para o kernel, do kernel para o consumidor); para megabytes por segundo isso é irrelevante, para gigabytes é o gargalo, e aí a memória compartilhada paga seu preço de complexidade. Terceira: os processos são aparentados e ficarão na mesma máquina? Se a resposta pode virar não, o socket ganha, porque a mudança para rede é quase só trocar o endereço.\n\nOs exemplos reais ajudam a fixar. O PostgreSQL guarda seu cache de páginas em memória compartilhada entre os processos de backend. O Docker expõe a API num socket Unix, /var/run/docker.sock. O pipeline do shell segue sendo a interface de composição mais usada do mundo. E o Chrome conversa entre seus processos por canais de mensagens sobre socketpair. Nenhum mecanismo é o melhor: cada um está no lugar em que seu contrato fecha a conta.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que o shell usa para ligar os comandos em cat log.txt | grep erro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um pipe: cano unidirecional de bytes entre os processos",
                            isCorrect: true,
                        },
                        {
                            text: "Um arquivo temporário que o grep apaga quando termina",
                            isCorrect: false,
                        },
                        {
                            text: "Memória compartilhada montada pelo terminal para os dois",
                            isCorrect: false,
                        },
                        {
                            text: "Um socket de rede local aberto na porta reservada do shell",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual mecanismo de IPC dispensa cópias de dados depois de configurado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A memória compartilhada, mapeada pelos dois processos",
                            isCorrect: true,
                        },
                        {
                            text: "O pipe, porque o kernel envia os bytes por referência",
                            isCorrect: false,
                        },
                        {
                            text: "A fila de mensagens, que move pacotes sem duplicá-los",
                            isCorrect: false,
                        },
                        {
                            text: "O socket local, que entrega ponteiros diretos ao leitor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o socket local é a escolha certa quando a conversa pode um dia sair da máquina?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A API é a mesma dos sockets de rede; migrar é trocar o endereço",
                            isCorrect: true,
                        },
                        {
                            text: "É o único IPC que o kernel permite atravessar para outra máquina",
                            isCorrect: false,
                        },
                        {
                            text: "Sockets locais já trafegam pela placa de rede, só que em loopback",
                            isCorrect: false,
                        },
                        {
                            text: "Ele comprime os dados no mesmo formato usado pelos protocolos web",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Fluxo contínuo de bytes ou mensagens delimitadas: qual par de mecanismos representa cada lado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Pipe é fluxo; fila de mensagens entrega pacotes inteiros",
                            isCorrect: true,
                        },
                        {
                            text: "Pipe entrega pacotes; fila de mensagens é fluxo contínuo",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois são fluxo: mensagens só existem sobre sockets TCP",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois entregam pacotes; a diferença é apenas o tamanho",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um processo produz 2 GB/s para outro consumir na mesma máquina. Por que pipe é má escolha?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O pipe copia tudo duas vezes via kernel; nesse volume, é gargalo",
                            isCorrect: true,
                        },
                        {
                            text: "Pipes têm teto fixo de 1 MB/s imposto pelo kernel desde o Unix original",
                            isCorrect: false,
                        },
                        {
                            text: "O pipe fragmenta os dados em blocos que chegam fora de ordem ao leitor",
                            isCorrect: false,
                        },
                        {
                            text: "Acima de 1 GB/s o pipe exige privilégios de root para seguir aberto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Threads e o problema da corrida",
    aulas: [
        {
            titulo: "Thread vs processo",
            blocks: [
                {
                    type: "text",
                    value: "# Fluxos de execução dentro do mesmo mundo\n\nUma thread é um fluxo de execução dentro de um processo. O processo continua sendo a caixa: espaço de endereços, arquivos abertos, credenciais. As threads são o que corre dentro dela, e podem ser várias: todas enxergam o mesmo heap, as mesmas globais e os mesmos descritores, e cada uma carrega apenas o que é seu por natureza, a própria stack e os próprios registradores.\n\nOs custos explicam quando usar cada um. Criar uma thread no Linux custa dezenas de microssegundos; criar um processo com fork custa de centenas de microssegundos a milissegundos, porque envolve duplicar estruturas e montar outro espaço de endereços. Trocar a CPU entre threads do mesmo processo é mais barato que trocar entre processos: a tabela de páginas é a mesma, então o TLB (o cache de traduções que o módulo 5 apresenta) não precisa ser descartado. E comunicar é a diferença brutal: entre threads, basta escrever numa variável que a outra lê; entre processos, tudo passa pelos mecanismos de IPC do módulo 1.\n\nEssa conveniência tem o outro lado da moeda, e ele é o assunto deste módulo inteiro.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Processo","Thread"],["Memória","Isolada por padrão","Compartilhada por padrão"],["Criação","Centenas de µs a ms","Dezenas de µs"],["Troca de contexto","Mais cara; TLB descartado","Mais barata; mesmo espaço"],["Comunicação","IPC explícito via kernel","Variáveis em comum, direto"],["Falha grave","Cai sozinho","Derruba o processo inteiro"]]',
                },
                {
                    type: "quote",
                    value: "A memória compartilhada é o motivo de a thread ser rápida e o motivo de ela ser perigosa. É a mesma propriedade, vista de dois lados.",
                },
                {
                    type: "text",
                    value: "## O critério de escolha\n\nUse processos quando o isolamento vale mais que a velocidade de comunicação. O Chrome roda cada aba em um processo: uma aba que trava não leva as outras, e um site malicioso fica preso na caixa dele. O nginx usa processos de trabalho pelo mesmo motivo, robustez: um worker que morre é substituído sem drama. Falha em processo é acidente local; falha em thread é acidente coletivo, porque uma thread que corrompe o heap corrompe o heap de todas.\n\nUse threads quando os fluxos precisam compartilhar dados quentes com frequência e latência mínima: um servidor que mantém um cache em memória consultado por todas as requisições, um jogo em que física, renderização e áudio leem o mesmo estado de mundo, um pipeline que processa blocos de um mesmo buffer gigante. A regra de bolso para trabalho pesado de CPU é um pool com um número de threads próximo ao de núcleos (std::thread::hardware_concurrency() informa quantos há), e o módulo 4 explica por que passar muito disso só gera troca de contexto inútil.",
                },
            ],
            questions: [
                {
                    statement: "O que as threads de um mesmo processo compartilham?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Heap, globais e descritores; cada uma tem a própria stack",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: cada thread recebe uma cópia isolada da memória toda",
                            isCorrect: false,
                        },
                        {
                            text: "Somente a região de código; dados ficam separados por thread",
                            isCorrect: false,
                        },
                        {
                            text: "A stack, que é única; heap e globais ficam isolados por thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que criar uma thread é mais barato que criar um processo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Não há novo espaço de endereços: a thread reusa o do processo",
                            isCorrect: true,
                        },
                        {
                            text: "Threads são criadas pelo hardware, sem participação do kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel mantém um estoque de threads prontas para distribuir",
                            isCorrect: false,
                        },
                        {
                            text: "Threads não têm stack própria, o que elimina qualquer alocação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o Chrome roda cada aba em um processo, e não em uma thread?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Isolamento: aba que trava ou é maliciosa fica presa na caixa dela",
                            isCorrect: true,
                        },
                        {
                            text: "Velocidade: processos trocam dados entre si mais rápido que threads",
                            isCorrect: false,
                        },
                        {
                            text: "Limite do Linux: um processo não pode ter mais que oito threads",
                            isCorrect: false,
                        },
                        {
                            text: "Renderização: só processos separados podem desenhar em paralelo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que trocar a CPU entre threads do mesmo processo custa menos que entre processos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O espaço de endereços é o mesmo e o TLB segue aproveitável",
                            isCorrect: true,
                        },
                        {
                            text: "Threads dispensam salvar registradores na troca de contexto",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador ignora threads e só contabiliza os processos",
                            isCorrect: false,
                        },
                        {
                            text: "Threads rodam em modo kernel, onde a troca é instantânea",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma thread escreve fora dos limites e corrompe o heap. Qual é o efeito sobre as demais?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Todas ficam em risco: o heap corrompido é o de todo o processo",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhum: o kernel isola o heap em fatias privadas por thread",
                            isCorrect: false,
                        },
                        {
                            text: "As demais recebem SIGSEGV preventivo e reiniciam mais tarde",
                            isCorrect: false,
                        },
                        {
                            text: "Só a thread vizinha na tabela do escalonador sofre o efeito",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Criar e coordenar",
            blocks: [
                {
                    type: "text",
                    value: "# std::thread: a referência concreta\n\nEm C++, criar uma thread é construir um objeto std::thread com uma função e seus argumentos; a execução começa na hora. A partir daí você tem uma obrigação: antes de o objeto ser destruído, decidir entre join(), que espera a thread terminar e recolhe seus recursos, e detach(), que a solta para viver por conta própria. Não decidir é erro fatal literal: o destrutor de um std::thread ainda ligado chama std::terminate e derruba o programa.\n\nNa prática, join é a escolha padrão e detach é quase sempre má ideia: uma thread solta não pode mais ser esperada, e se tocar qualquer recurso do programa durante o encerramento do main, o comportamento é indefinido. O C++20 trouxe o std::jthread, que faz join sozinho no destrutor e aceita um pedido cooperativo de parada via stop_token; se o seu compilador de 2026 o oferece, prefira-o. A regra de ouro da coordenação: quem cria threads é dono delas e responde pelo ciclo de vida completo, do construtor ao join, inclusive na presença de exceções.",
                },
                {
                    type: "code",
                    value: "#include <thread>\n#include <vector>\n#include <iostream>\n\nvoid soma_parcial(const std::vector<int>& v, size_t ini, size_t fim, long& saida) {\n    long total = 0;\n    for (size_t i = ini; i < fim; i++) total += v[i];\n    saida = total;   // escreve so no slot desta thread\n}\n\nint main() {\n    std::vector<int> dados(2'000'000, 1);\n    long r1 = 0, r2 = 0;\n    std::thread t1(soma_parcial, std::cref(dados), 0, 1'000'000, std::ref(r1));\n    std::thread t2(soma_parcial, std::cref(dados), 1'000'000, 2'000'000, std::ref(r2));\n    t1.join();   // espera terminar\n    t2.join();\n    std::cout << (r1 + r2) << \"\\n\";   // 2000000\n}",
                },
                {
                    type: "table",
                    value: '[["Operação","O que faz","Quando usar"],["join()","Bloqueia até a thread terminar","Padrão: quase sempre"],["detach()","Solta a thread para o fundo","Raro; ciclo de vida vira problema"],["jthread (C++20)","join automático no destrutor","Sempre que disponível"],["Nenhum dos dois","Destrutor chama std::terminate","Nunca: é o bug"]]',
                },
                {
                    type: "quote",
                    value: "Passar referência para uma thread é assinar um contrato de vida útil: o dado precisa existir até o join. A lambda que captura local por referência e sobrevive ao escopo é o jeito mais popular de quebrar esse contrato.",
                },
                {
                    type: "text",
                    value: "## Passar dados com cuidado\n\nO construtor de std::thread copia os argumentos por padrão, e isso é uma proteção: cada thread trabalha sobre a própria cópia, sem conflito. Quando você quer mesmo compartilhar, precisa pedir explicitamente com std::ref (mutável) ou std::cref (somente leitura), como no código acima, e aí o contrato é seu: o objeto referenciado tem que viver até o join, e escritas simultâneas nele são a corrida que a próxima aula disseca.\n\nO erro clássico tem cara de código inocente: uma lambda que captura uma variável local por referência e é entregue a uma thread que sobrevive à função. A função retorna, o frame morre com a stack, e a thread segue lendo um endereço que agora guarda outra coisa: comportamento indefinido, do tipo que passa nos testes e explode em produção. Na dúvida, capture por valor. Note ainda o desenho do exemplo: cada thread escreve num slot separado (r1 e r2), e a agregação acontece depois dos joins, no main. Repartir a escrita para não disputar é a primeira técnica de concorrência, e a mais barata de todas.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece se um std::thread for destruído sem join() nem detach()?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O destrutor chama std::terminate e o programa cai na hora",
                            isCorrect: true,
                        },
                        {
                            text: "A thread continua rodando em segundo plano normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador insere um join automático no fim do escopo",
                            isCorrect: false,
                        },
                        {
                            text: "A thread é pausada até outro objeto assumir o controle dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o join() de uma thread?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Esperar a thread terminar antes de o fluxo atual seguir",
                            isCorrect: true,
                        },
                        {
                            text: "Unir duas threads em uma só para economizar memória",
                            isCorrect: false,
                        },
                        {
                            text: "Aumentar a prioridade da thread na fila do escalonador",
                            isCorrect: false,
                        },
                        {
                            text: "Transferir a thread para outro núcleo com cache quente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que passar dados a uma thread com std::ref exige atenção com a vida útil do objeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A thread usa o objeto original, que deve existir até o join",
                            isCorrect: true,
                        },
                        {
                            text: "std::ref cria uma cópia extra que precisa ser liberada à mão",
                            isCorrect: false,
                        },
                        {
                            text: "Referências só funcionam se a thread rodar no mesmo núcleo",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel invalida referências a cada troca de contexto feita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a vantagem do std::jthread (C++20) sobre o std::thread?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Faz join no destrutor e aceita pedido cooperativo de parada",
                            isCorrect: true,
                        },
                        {
                            text: "Roda em modo kernel, com troca de contexto mais econômica",
                            isCorrect: false,
                        },
                        {
                            text: "Cria a thread só no primeiro uso, poupando a inicialização",
                            isCorrect: false,
                        },
                        {
                            text: "Permite mover a thread entre processos diferentes em execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma lambda captura uma variável local por referência e roda numa thread que sobrevive à função. Qual é o defeito?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A thread passa a ler um frame de stack que já foi destruído",
                            isCorrect: true,
                        },
                        {
                            text: "A captura por referência impede o compilador de criar a thread",
                            isCorrect: false,
                        },
                        {
                            text: "A lambda mantém a stack da função viva e vaza memória sempre",
                            isCorrect: false,
                        },
                        {
                            text: "O join da thread devolve o valor errado, mas a memória é válida",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Corrida de dados",
            blocks: [
                {
                    type: "text",
                    value: "# O contador que perde incrementos\n\nO experimento mais importante da trilha cabe em vinte linhas: duas threads, cada uma incrementando um contador global um milhão de vezes. O resultado esperado é 2.000.000. O resultado real, numa máquina qualquer, é algo como 1.203.417, e muda a cada execução. Nenhuma exceção, nenhum aviso: o programa roda, termina e devolve um número errado com toda a confiança do mundo.\n\nA causa está no que contador++ realmente é. Não existe instrução mágica de incrementar memória de forma coordenada entre núcleos: o que a CPU executa são três passos, ler o valor da memória para um registrador, somar 1 no registrador, escrever o resultado de volta. Cada thread faz esse ciclo no seu núcleo, com seus registradores. Quando os ciclos das duas se entrelaçam no tempo, as duas leem o mesmo valor antigo, as duas somam 1 sobre ele, e as duas escrevem o mesmo resultado: dois incrementos viram um. Repetido milhares de vezes por segundo, é assim que 2 milhões derretem para 1,2 milhão.",
                },
                {
                    type: "code",
                    value: "#include <thread>\n#include <iostream>\n\nlong contador = 0;   // compartilhado, sem protecao\n\nvoid incrementa() {\n    for (int i = 0; i < 1'000'000; i++)\n        contador++;          // le, soma, escreve: tres passos\n}\n\nint main() {\n    std::thread a(incrementa);\n    std::thread b(incrementa);\n    a.join();\n    b.join();\n    std::cout << contador << \"\\n\";\n    // esperado: 2000000; observado: ~1200000, e varia a cada execucao\n}",
                },
                {
                    type: "table",
                    value: '[["Passo","Thread A","Thread B","Valor na memória"],["1","lê 41","","41"],["2","","lê 41","41"],["3","soma: 42 no registrador","","41"],["4","","soma: 42 no registrador","41"],["5","escreve 42","","42"],["6","","escreve 42","42 (um incremento sumiu)"]]',
                },
                {
                    type: "quote",
                    value: "Corrida de dados não é azar nem caso raro: é o comportamento esperado quando dois ler-modificar-escrever encontram a mesma variável sem coordenação. O azar é quando ela não aparece nos testes.",
                },
                {
                    type: "text",
                    value: "## O nome técnico e por que às vezes funciona\n\nA definição formal: há uma corrida de dados quando duas threads acessam a mesma posição de memória, ao menos um dos acessos é escrita, e não existe sincronização ordenando os dois. Em C++, corrida de dados é comportamento indefinido: o padrão não promete nem o valor errado estável, promete nada. O compilador otimiza assumindo que não há corrida, e por isso o sintoma pode mudar entre compilar com -O0 e -O2.\n\nO mais traiçoeiro é que o programa da corrida frequentemente passa nos testes. Com pouca carga, o entrelaçamento fatal pode não acontecer; num laptop com dois núcleos livres, as threads podem rodar quase em sequência. Aí o código vai para produção, encontra 32 núcleos e tráfego real, e o contador de faturamento começa a perder vendas. Para caçar isso existe ferramenta dedicada: compile com -fsanitize=thread e o ThreadSanitizer aponta a corrida com arquivo e linha, mesmo quando o resultado por acaso deu certo. A partir da próxima aula, o arsenal de correção: mutex primeiro, atomics no módulo 3.",
                },
            ],
            questions: [
                {
                    statement: "Por que contador++ executado por duas threads perde incrementos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "São três passos (ler, somar, escrever) que se entrelaçam",
                            isCorrect: true,
                        },
                        {
                            text: "O cache da CPU descarta escritas quando está sobrecarregado",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador remove incrementos repetidos por otimização",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel limita a taxa de escritas por thread em variáveis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quais são os três ingredientes de uma corrida de dados?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Mesma memória, ao menos uma escrita, nenhuma sincronização",
                            isCorrect: true,
                        },
                        {
                            text: "Duas escritas, dois núcleos e prioridade igual das threads",
                            isCorrect: false,
                        },
                        {
                            text: "Mesma memória, duas leituras e caches separados por núcleo",
                            isCorrect: false,
                        },
                        {
                            text: "Heap compartilhado, exceção em voo e um join fora de ordem",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Duas threads leem 41, somam e escrevem de volta. Que valor fica na memória e o que se perdeu?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fica 42: um dos dois incrementos foi sobrescrito e sumiu",
                            isCorrect: true,
                        },
                        {
                            text: "Fica 43: o hardware soma as duas escritas na mesma linha",
                            isCorrect: false,
                        },
                        {
                            text: "Fica 41: escritas simultâneas se cancelam por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Fica 42 ou 43, dependendo do tamanho do cache de cada núcleo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que um programa com corrida de dados pode passar nos testes e falhar em produção?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O entrelaçamento fatal depende de carga e de número de núcleos",
                            isCorrect: true,
                        },
                        {
                            text: "Ambientes de teste desligam threads extras automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "Em produção o compilador recompila o binário com menos cuidado",
                            isCorrect: false,
                        },
                        {
                            text: "Testes rodam em modo kernel, onde corridas não podem ocorrer",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual ferramenta aponta corridas de dados com arquivo e linha, mesmo quando o resultado saiu certo?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O ThreadSanitizer, compilando com -fsanitize=thread",
                            isCorrect: true,
                        },
                        {
                            text: "O valgrind com a opção padrão de checagem de memória",
                            isCorrect: false,
                        },
                        {
                            text: "O gdb, executando o programa passo a passo por thread",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador com -Wall, que emite aviso para corridas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Mutex",
            blocks: [
                {
                    type: "text",
                    value: "# Exclusão mútua e a seção crítica\n\nO mutex (mutual exclusion) é o cadeado do código: entre lock() e unlock(), no máximo uma thread por vez. O trecho protegido é a seção crítica, e dentro dela o ler-modificar-escrever da aula anterior volta a ser uma operação inteira: quem chega enquanto outra thread segura o cadeado dorme até ele abrir. Com um std::mutex ao redor do contador++, o experimento devolve 2.000.000 sempre.\n\nO detalhe que separa quem entende de quem decora: o mutex não protege dados, protege trechos de código, e a associação entre o cadeado e os dados que ele guarda é uma convenção sua. Se uma função acessa o contador segurando o mutex e outra acessa sem, a corrida continua lá, e o compilador não reclama. Disciplina mínima: todo acesso ao dado compartilhado passa pelo mesmo mutex, sem exceção, e o par dado-mutex vive junto (idealmente na mesma classe, com o dado privado). Em custo, o caminho feliz é barato: travar um mutex sem disputa custa uns 20 nanossegundos; com disputa, a thread dorme e acorda pelo futex do kernel, e a conta sobe para microssegundos.",
                },
                {
                    type: "code",
                    value: "#include <mutex>\n#include <thread>\n#include <iostream>\n\nlong contador = 0;\nstd::mutex m;\n\nvoid incrementa() {\n    for (int i = 0; i < 1'000'000; i++) {\n        std::lock_guard<std::mutex> trava(m);  // lock aqui\n        contador++;\n    }                                          // unlock no fim do escopo\n}\n\nint main() {\n    std::thread a(incrementa), b(incrementa);\n    a.join(); b.join();\n    std::cout << contador << \"\\n\";   // 2000000, sempre\n}",
                },
                {
                    type: "table",
                    value: '[["Ferramenta","O que faz","Quando usar"],["lock_guard","Trava no construtor, solta no destrutor","Padrão para seção simples"],["unique_lock","Igual, mas permite soltar e retravar","Com condvar; travas móveis"],["scoped_lock","Trava vários mutexes de uma vez","Dois ou mais cadeados juntos"],["lock()/unlock() na mão","Controle manual do par","Evite: exceção pula o unlock"]]',
                },
                {
                    type: "quote",
                    value: "RAII é a diferença entre prometer o unlock e garantir o unlock. Exceção, return no meio, continue no loop: o destrutor do lock_guard cobre todos os caminhos de saída, inclusive os que você esqueceu.",
                },
                {
                    type: "text",
                    value: "## RAII e granularidade\n\nChamar lock() e unlock() na mão é convite a bug: qualquer return antecipado ou exceção entre os dois deixa o mutex travado para sempre, e o programa inteiro para na próxima tentativa. A resposta do C++ é RAII: o std::lock_guard trava no construtor e destrava no destrutor, amarrando o cadeado ao escopo. O std::unique_lock faz o mesmo com flexibilidade extra (soltar e retravar no meio, mover a posse), necessária quando entra a variável de condição no módulo 3.\n\nA segunda decisão de projeto é a granularidade. Um cadeado só para a estrutura inteira (lock grosso) é simples de acertar, mas serializa tudo: dez threads viram uma fila indiana. Cadeados menores por parte da estrutura (lock fino) liberam paralelismo e multiplicam o risco de erro e de deadlock. Comece grosso, meça, afine onde doer. E duas regras absolutas dentro da seção crítica: segure o cadeado pelo menor tempo possível, e nunca faça E/S (disco, rede, log) segurando um mutex, porque milissegundos de E/S com o cadeado fechado significam todas as outras threads dormindo por milissegundos.",
                },
            ],
            questions: [
                {
                    statement: "O que um mutex garante para a seção crítica que ele protege?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No máximo uma thread por vez executa aquele trecho",
                            isCorrect: true,
                        },
                        {
                            text: "O trecho roda mais rápido por ganhar prioridade de CPU",
                            isCorrect: false,
                        },
                        {
                            text: "O trecho nunca é interrompido pelo escalonador do kernel",
                            isCorrect: false,
                        },
                        {
                            text: "As variáveis do trecho passam a viver em cache separado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a vantagem do lock_guard sobre chamar lock() e unlock() manualmente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O destrutor solta o mutex em qualquer caminho de saída",
                            isCorrect: true,
                        },
                        {
                            text: "Ele trava mais rápido por dispensar chamadas ao kernel",
                            isCorrect: false,
                        },
                        {
                            text: "Ele permite que duas threads travem juntas sem conflito",
                            isCorrect: false,
                        },
                        {
                            text: "Ele detecta deadlocks em tempo de execução e os desfaz",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma função acessa o contador com o mutex travado; outra acessa o mesmo contador sem travar. Qual é a situação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A corrida continua: todo acesso deve passar pelo mesmo mutex",
                            isCorrect: true,
                        },
                        {
                            text: "Está tudo certo: basta uma das funções travar para proteger",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador rejeita o código por acesso sem cadeado ao dado",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel bloqueia a segunda função até o mutex ser liberado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que fazer E/S (disco, rede) segurando um mutex é um erro sério?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Milissegundos de espera com o cadeado fechado param as outras",
                            isCorrect: true,
                        },
                        {
                            text: "A E/S falha quando executada dentro de qualquer seção crítica",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex expira durante a E/S e solta a trava no meio do trecho",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel proíbe syscalls de quem estiver segurando um cadeado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Lock grosso versus lock fino: qual é o trade-off real?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Grosso é simples e serializa; fino paraleliza e arrisca mais",
                            isCorrect: true,
                        },
                        {
                            text: "Grosso gasta mais memória; fino gasta mais CPU por travamento",
                            isCorrect: false,
                        },
                        {
                            text: "Grosso só funciona com poucas threads; fino exige mais de oito",
                            isCorrect: false,
                        },
                        {
                            text: "Grosso é recurso do kernel; fino é implementado pelo compilador",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Deadlock",
            blocks: [
                {
                    type: "text",
                    value: "# O abraço mortal\n\nDois cadeados bastam para travar um sistema inteiro. A thread 1 transfere da conta A para a B: trava A, vai travar B. No mesmo instante, a thread 2 transfere de B para A: trava B, vai travar A. Agora a thread 1 espera o cadeado que a 2 segura, e a 2 espera o que a 1 segura. Nenhuma solta o que tem, nenhuma consegue o que falta: deadlock. O processo não cai, não loga erro, não gasta CPU. Fica ali, parado, educadamente, para sempre.\n\nA teoria mapeou as quatro condições que precisam valer ao mesmo tempo para um deadlock existir, as condições de Coffman: exclusão mútua (o recurso só serve a um por vez), posse e espera (a thread segura um recurso enquanto espera outro), sem preempção (ninguém arranca um cadeado à força de quem o segura) e espera circular (A espera B, que espera A, num ciclo fechado). Quebre uma delas, qualquer uma, e o deadlock fica impossível. Toda técnica de prevenção que existe é um jeito de quebrar uma dessas quatro.",
                },
                {
                    type: "code",
                    value: "std::mutex conta_a, conta_b;\n\nvoid transfere_ab() {\n    std::lock_guard<std::mutex> l1(conta_a);\n    // ...neste instante, a outra thread trava conta_b...\n    std::lock_guard<std::mutex> l2(conta_b);   // espera para sempre\n}\n\nvoid transfere_ba() {\n    std::lock_guard<std::mutex> l1(conta_b);\n    std::lock_guard<std::mutex> l2(conta_a);   // espera para sempre\n}\n\n// Correcao 1: mesma ordem nos dois lados (ordem total).\n// Correcao 2: adquirir os dois de uma vez, sem deadlock possivel:\nvoid transfere_ok() {\n    std::scoped_lock ambos(conta_a, conta_b);\n    // ...transfere com os dois cadeados seguros...\n}",
                },
                {
                    type: "table",
                    value: '[["Condição de Coffman","Significado","Como quebrar"],["Exclusão mútua","Recurso atende um por vez","Estruturas imutáveis ou atômicas"],["Posse e espera","Segura um e espera outro","Adquirir tudo de uma vez"],["Sem preempção","Cadeado não é arrancado","try_lock com desistência e recuo"],["Espera circular","Ciclo fechado de esperas","Ordem total de aquisição"]]',
                },
                {
                    type: "quote",
                    value: "Deadlock não faz barulho: CPU em zero, logs parados, threads dormindo em fila. O sistema não morreu; só combinou de nunca mais andar.",
                },
                {
                    type: "text",
                    value: "## Prevenção por ordem total\n\nA técnica mais usada na prática ataca a espera circular: defina uma ordem global para os cadeados e trave sempre nessa ordem, em todo o código. Nas contas do exemplo, ordene pelo identificador: qualquer transferência trava primeiro a conta de id menor, depois a maior, não importa a direção do dinheiro. Com ordem total, um ciclo de espera é impossível por construção. O C++ oferece a alternativa pronta: std::scoped_lock(m1, m2) adquire os dois mutexes com um algoritmo interno livre de deadlock, quebrando a posse e espera.\n\nQuando a prevenção falha, o diagnóstico tem assinatura clara: o serviço para de responder com CPU perto de zero. Anexe o gdb (ou colete as stacks com pstack ou eu-stack) e olhe onde cada thread está: num deadlock, duas ou mais dormem dentro de lock(), cada uma esperando um mutex que outra da lista segura. Em 2026 os deadlocks continuam nascendo do mesmo jeito de sempre: dois caminhos de código que adquirem os mesmos cadeados em ordens opostas, cada um escrito por alguém que não leu o outro. A ordem total documentada é a vacina barata.",
                },
            ],
            questions: [
                {
                    statement:
                        "No deadlock clássico de dois locks, o que cada thread está fazendo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Cada uma segura um cadeado e espera o que a outra segura",
                            isCorrect: true,
                        },
                        {
                            text: "As duas seguram o mesmo cadeado e disputam o unlock dele",
                            isCorrect: false,
                        },
                        {
                            text: "As duas giram em busy-wait queimando CPU no mesmo núcleo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma delas travou e a outra espera o kernel matá-la por tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o sintoma típico de um deadlock em produção?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Serviço parado com CPU perto de zero e threads dormindo",
                            isCorrect: true,
                        },
                        {
                            text: "CPU em 100% com o serviço respondendo cada vez mais devagar",
                            isCorrect: false,
                        },
                        {
                            text: "Crash imediato do processo com core dump e stack trace",
                            isCorrect: false,
                        },
                        {
                            text: "Consumo de memória crescendo até o OOM killer intervir",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a ordem total de aquisição previne deadlocks?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Travando sempre na mesma ordem, o ciclo de esperas não se forma",
                            isCorrect: true,
                        },
                        {
                            text: "Ela limita cada thread a um único cadeado por vez, sem exceção",
                            isCorrect: false,
                        },
                        {
                            text: "Ela faz o kernel arrancar à força o cadeado de quem esperar",
                            isCorrect: false,
                        },
                        {
                            text: "Ela transforma os mutexes em atomics, que não podem travar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual condição de Coffman o std::scoped_lock(m1, m2) quebra?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Posse e espera: adquire os dois cadeados de uma vez só",
                            isCorrect: true,
                        },
                        {
                            text: "Exclusão mútua: permite as duas threads na seção crítica",
                            isCorrect: false,
                        },
                        {
                            text: "Sem preempção: autoriza roubar cadeados de outra thread",
                            isCorrect: false,
                        },
                        {
                            text: "Espera circular: reordena as threads na fila do escalonador",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um serviço travou sem consumir CPU. Como confirmar que é deadlock?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Coletar as stacks e ver threads paradas em lock() em ciclo",
                            isCorrect: true,
                        },
                        {
                            text: "Medir a temperatura da CPU: deadlock esquenta os núcleos",
                            isCorrect: false,
                        },
                        {
                            text: "Conferir o uso de swap: deadlock sempre esgota a memória",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar strace e procurar chamadas de exec repetidas em loop",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Sincronização além do mutex",
    aulas: [
        {
            titulo: "Semáforos",
            blocks: [
                {
                    type: "text",
                    value: "# Um contador de vagas\n\nO semáforo é um contador com duas operações atômicas: acquire() decrementa, e bloqueia se o contador está em zero; release() incrementa, e acorda alguém que esteja esperando. É a abstração perfeita para recursos contáveis: vagas num estacionamento, conexões num pool, espaços num buffer. Inicialize com N e o semáforo garante sozinho que nunca haverá mais de N usuários simultâneos do recurso.\n\nO caso de uso clássico é o produtor-consumidor com buffer limitado. Dois semáforos contam os dois lados da mesma moeda: vagas começa no tamanho do buffer e itens começa em zero. O produtor faz vagas.acquire() antes de depositar (se o buffer está cheio, dorme) e itens.release() depois. O consumidor espelha: itens.acquire() antes de retirar (buffer vazio, dorme) e vagas.release() depois. O resultado é um fluxo que se autorregula sem nenhum busy-wait: quem não tem o que fazer dorme, quem produz acorda quem consome. Desde o C++20 a biblioteca padrão traz std::counting_semaphore; antes disso, todo mundo montava o seu com mutex e variável de condição.",
                },
                {
                    type: "code",
                    value: "#include <semaphore>\n\nstd::counting_semaphore<8> vagas(8);   // espacos livres no buffer\nstd::counting_semaphore<8> itens(0);   // itens prontos para consumo\n\nvoid produtor() {\n    while (true) {\n        auto item = produz();\n        vagas.acquire();     // buffer cheio? dorme aqui\n        deposita(item);      // o buffer em si ainda precisa de mutex\n        itens.release();     // avisa: ha item novo\n    }\n}\n\nvoid consumidor() {\n    while (true) {\n        itens.acquire();     // buffer vazio? dorme aqui\n        auto item = retira();\n        vagas.release();     // devolve a vaga\n        consome(item);\n    }\n}",
                },
                {
                    type: "table",
                    value: '[["Ferramenta","Conta até","Tem dono?","Uso típico"],["Mutex","1 (travado ou livre)","Sim: quem trava destrava","Proteger seção crítica"],["Semáforo binário","1","Não: qualquer um dá release","Sinalizar evento entre threads"],["Semáforo de contagem","N","Não","Vagas, pools, buffer limitado"]]',
                },
                {
                    type: "quote",
                    value: "Mutex responde quem pode entrar agora; semáforo responde quantos podem estar dentro. Parecem primos, mas um protege código e o outro conta recursos.",
                },
                {
                    type: "text",
                    value: "## Semáforo binário não é mutex\n\nUm semáforo inicializado em 1 parece um mutex, e a confusão é armadilha de prova e de produção. A diferença é posse. O mutex tem dono: a thread que travou é a única que deve destravar, e é essa disciplina que casa com RAII e com a ideia de seção crítica. O semáforo não tem dono nenhum: uma thread pode dar acquire e outra, completamente diferente, dar release. Isso é um defeito para proteger seção crítica e uma qualidade para sinalizar eventos: a thread A dorme em acquire esperando o trabalho ficar pronto, a thread B termina o trabalho e dá release. O semáforo funciona aí como uma campainha com memória: se o release veio antes do acquire, o sinal não se perde, fica guardado no contador.\n\nNote no código que os semáforos controlam a contagem, mas o acesso à estrutura do buffer em si (os ponteiros, os índices) continua precisando de um mutex por fora: são responsabilidades diferentes. Na aula 4 você monta essa fila completa, peça por peça, e ela vira o coração do projeto do módulo 7.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece num acquire() quando o contador do semáforo está em zero?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A thread dorme até alguém dar release e liberar uma vaga",
                            isCorrect: true,
                        },
                        {
                            text: "A chamada retorna erro e a thread precisa tentar de novo",
                            isCorrect: false,
                        },
                        {
                            text: "O contador fica negativo e a thread segue sem bloquear",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel encerra a thread para proteger o recurso contado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No produtor-consumidor com buffer limitado, por que são usados dois semáforos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um conta as vagas livres e o outro conta os itens prontos",
                            isCorrect: true,
                        },
                        {
                            text: "Um serve para as threads pares e o outro para as ímpares",
                            isCorrect: false,
                        },
                        {
                            text: "Um protege o código do produtor e o outro o do consumidor",
                            isCorrect: false,
                        },
                        {
                            text: "Um mede a velocidade de produção e o outro a de consumo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença central entre um mutex e um semáforo binário?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mutex tem dono; no semáforo, qualquer thread pode dar release",
                            isCorrect: true,
                        },
                        {
                            text: "O mutex conta até um; o semáforo binário conta até dois núcleos",
                            isCorrect: false,
                        },
                        {
                            text: "O semáforo é estrutura do kernel; o mutex vive só no processo",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex bloqueia threads; o semáforo binário apenas as avisa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o semáforo funciona como sinalização que não se perde entre threads?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um release antes do acquire fica guardado no contador",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel reenvia o sinal a cada quantum até ser consumido",
                            isCorrect: false,
                        },
                        {
                            text: "O acquire varre o histórico completo de releases passados",
                            isCorrect: false,
                        },
                        {
                            text: "Cada release grava um registro em disco até alguém o ler",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No código do buffer limitado, por que ainda é preciso um mutex além dos dois semáforos?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Semáforos contam vagas; a estrutura do buffer segue disputada",
                            isCorrect: true,
                        },
                        {
                            text: "Sem um mutex, os dois semáforos podem trocar de contador entre si",
                            isCorrect: false,
                        },
                        {
                            text: "O counting_semaphore exige um mutex registrado no construtor",
                            isCorrect: false,
                        },
                        {
                            text: "Porque release() só funciona dentro de uma seção crítica ativa",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Variável de condição",
            blocks: [
                {
                    type: "text",
                    value: "# Esperar sem girar\n\nComo uma thread espera uma condição ficar verdadeira, por exemplo, a fila deixar de estar vazia? A resposta ingênua é o busy-wait: um while que testa em loop, queimando um núcleo inteiro para descobrir, milhões de vezes por segundo, que nada mudou. A resposta certa é a variável de condição: a thread adquire o mutex, verifica a condição e, se falsa, chama wait(), que faz três coisas numa operação só: solta o mutex, põe a thread para dormir e, quando ela é acordada, readquire o mutex antes de retornar.\n\nQuem muda o estado avisa: altera os dados protegido pelo mutex e chama notify_one() para acordar uma thread esperando, ou notify_all() para acordar todas. A variável de condição não guarda nenhum estado própria: ela é só um ponto de encontro entre quem espera e quem avisa. Todo o estado (a fila, o contador, a flag) vive fora, protegido pelo mutex que a acompanha. Essa trinca, mutex, condição e o dado, anda sempre junta, e é o motivo de o wait exigir um unique_lock: ele precisa soltar e retravar o mutex por dentro.",
                },
                {
                    type: "code",
                    value: "#include <condition_variable>\n#include <mutex>\n#include <deque>\n\nstd::mutex m;\nstd::condition_variable cv;\nstd::deque<int> fila;\n\nvoid consumidor() {\n    while (true) {\n        std::unique_lock<std::mutex> trava(m);\n        cv.wait(trava, [] { return !fila.empty(); });  // predicado obrigatorio\n        int item = fila.front();\n        fila.pop_front();\n        trava.unlock();      // solta antes do trabalho pesado\n        processa(item);\n    }\n}\n\nvoid produtor(int item) {\n    {\n        std::lock_guard<std::mutex> trava(m);\n        fila.push_back(item);\n    }\n    cv.notify_one();         // acorda um consumidor\n}",
                },
                {
                    type: "table",
                    value: '[["Chamada","Efeito","Use quando"],["wait(lock, pred)","Dorme até pred ser verdadeiro","Sempre; o predicado protege"],["notify_one()","Acorda uma thread esperando","Um item novo, um trabalhador"],["notify_all()","Acorda todas as que esperam","Estado global mudou; shutdown"]]',
                },
                {
                    type: "quote",
                    value: "A variável de condição não tem memória: notificação sem ninguém esperando evapora. O predicado sobre o estado real é o que salva a thread que chegou atrasada.",
                },
                {
                    type: "text",
                    value: "## Spurious wakeup e a escolha do notify\n\nO padrão POSIX e o C++ permitem que uma thread em wait() acorde sem notificação nenhuma: é o spurious wakeup, um acordar espúrio que existe por razões de implementação nos vários sistemas. Por isso o wait com predicado não é estilo, é obrigação: cv.wait(trava, pred) equivale a um while que reconfere a condição a cada despertar e volta a dormir se ela ainda for falsa. O mesmo predicado resolve também a notificação perdida: se o produtor notificou antes de o consumidor chegar ao wait, o consumidor testa o predicado na entrada, vê que há item e nem dorme.\n\nA escolha entre notify_one e notify_all é de eficiência e de correção. Chegou um item e qualquer trabalhador serve? notify_one, acordar todo mundo para um item só é estouro de manada, todos disputam o mutex e um leva. O estado mudou para todos (a fila fechou, o shutdown começou, um lote inteiro chegou)? notify_all, porque cada thread precisa reavaliar a própria condição. Na dúvida entre corretude e economia, notify_all com bom predicado é sempre correto, apenas menos eficiente.",
                },
            ],
            questions: [
                {
                    statement: "O que o cv.wait(trava) faz ao ser chamado?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Solta o mutex, dorme e retrava ao acordar, tudo numa operação",
                            isCorrect: true,
                        },
                        {
                            text: "Mantém o mutex travado e dorme ali até a notificação chegar",
                            isCorrect: false,
                        },
                        {
                            text: "Gira testando a condição em loop até ela ficar verdadeira",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve o controle ao escalonador por um quantum e retorna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que esperar com busy-wait (while testando em loop) é ruim?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Queima um núcleo inteiro só para conferir que nada mudou",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador transforma o loop em wait() automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "O loop impede as outras threads de alterarem a condição",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel derruba threads que rodam o mesmo teste repetido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é um spurious wakeup e como o código deve se defender dele?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acordar sem notificação; o predicado reconfere e volta a dormir",
                            isCorrect: true,
                        },
                        {
                            text: "Acordar duas threads de uma vez; usar notify_one elimina o problema",
                            isCorrect: false,
                        },
                        {
                            text: "Notificação duplicada do kernel; basta contar os notifies recebidos",
                            isCorrect: false,
                        },
                        {
                            text: "Acordar com o mutex já roubado; usar lock_guard no lugar do unique",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Chegou um item na fila e há dez trabalhadores idênticos esperando. Qual notify usar e por quê?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "notify_one: acordar os dez para um item é disputa inútil",
                            isCorrect: true,
                        },
                        {
                            text: "notify_all: só acordando todos o item certo é encontrado",
                            isCorrect: false,
                        },
                        {
                            text: "notify_one dez vezes, para dar chance igual a cada thread",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: com predicado no wait as threads acordam sozinhas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O produtor notificou antes de o consumidor chegar ao wait. Por que o item não fica esquecido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O predicado é testado na entrada do wait: há item, nem dorme",
                            isCorrect: true,
                        },
                        {
                            text: "A condition_variable guarda a notificação até alguém chegar",
                            isCorrect: false,
                        },
                        {
                            text: "O notify_one repete a cada quantum até achar uma thread livre",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex mantém a notificação pendente enquanto estiver travado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Atomics",
            blocks: [
                {
                    type: "text",
                    value: "# Operações que o hardware não divide\n\nO contador do módulo 2 perdia incrementos porque ler-somar-escrever eram três passos separáveis. O std::atomic ataca a raiz: transforma a operação inteira numa única instrução indivisível do processador. Um contador.fetch_add(1) compila para uma instrução como lock xadd no x86, e o hardware garante que nenhum outro núcleo enxerga o meio da operação: não existe mais meio. O contador de 2 milhões volta a dar 2 milhões, sem mutex, sem threads dormindo.\n\nO custo fica entre o acesso comum e o mutex: um fetch_add sem disputa custa poucos nanossegundos; sob disputa pesada de vários núcleos, a linha de cache do contador vira uma batata quente que viaja entre eles, e a conta sobe para dezenas de nanossegundos por operação. Ainda assim, segue muito abaixo de um mutex disputado, que envolve pôr threads para dormir e acordar via kernel, na casa dos microssegundos. Por isso atomics são o padrão para contadores de métricas, flags de parada, geradores de id e referências contadas (o contador interno do shared_ptr é um atomic).",
                },
                {
                    type: "code",
                    value: "#include <atomic>\n#include <thread>\n#include <iostream>\n\nstd::atomic<long> contador{0};\n\nvoid incrementa() {\n    for (int i = 0; i < 1'000'000; i++)\n        contador.fetch_add(1);   // ler-somar-escrever numa instrucao so\n}\n\nint main() {\n    std::thread a(incrementa), b(incrementa);\n    a.join(); b.join();\n    std::cout << contador << \"\\n\";   // 2000000, sempre, sem mutex\n}",
                },
                {
                    type: "table",
                    value: '[["Cenário","Ferramenta certa","Por quê"],["Contador de métricas","atomic fetch_add","Uma variável, uma operação"],["Flag de parada","atomic<bool>","Escrita simples, leitura em loop"],["Dois campos que mudam juntos","Mutex","Invariante envolve mais de um dado"],["Fila com estrutura interna","Mutex e condvar","Vários ponteiros, uma consistência"]]',
                },
                {
                    type: "quote",
                    value: "Atomic sincroniza uma operação sobre uma variável. No instante em que a regra de consistência abraça duas variáveis, o atomic não tem mais como ajudar: a invariante pede mutex.",
                },
                {
                    type: "text",
                    value: "## Quando o atomic basta, e quando ele engana\n\nO critério é a invariante. Se a regra de consistência do seu dado cabe numa única variável e numa única operação (incrementar, trocar, comparar e trocar), o atomic resolve com elegância. Se a regra amarra duas ou mais variáveis (saldo e histórico, ponteiro e tamanho, cabeça e cauda de uma lista), atomics separados não bastam: cada um é atômico sozinho, mas o conjunto continua tendo estados intermediários visíveis, e outra thread pode ler o par no meio da mudança. Consistência multi-variável é território do mutex.\n\nUma palavra honesta sobre memory_order: as operações atômicas do C++ aceitam um parâmetro de ordenação de memória (relaxed, acquire, release, seq_cst) que controla o que outras threads enxergam ao redor da operação. O padrão, seq_cst, é o mais forte e o mais seguro, e deve ser a sua escolha até você ter uma razão medida para afinar. Otimizar memory_order sem domínio profundo é a fonte clássica de bugs que aparecem só numa arquitetura, só com otimização ligada, anos depois. Em 2026, a orientação segue a mesma: comece com o padrão, meça, e só então estude o resto.",
                },
            ],
            questions: [
                {
                    statement: "Por que o fetch_add de um atomic não perde incrementos?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A operação vira uma instrução indivisível do processador",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador insere um mutex invisível ao redor da soma",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel serializa as threads que usam a mesma variável",
                            isCorrect: false,
                        },
                        {
                            text: "Cada thread recebe uma cópia local somada no final do run",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é um uso adequado de std::atomic<bool>?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Flag de parada que uma thread escreve e outras leem em loop",
                            isCorrect: true,
                        },
                        {
                            text: "Proteger a reorganização interna de uma árvore de busca",
                            isCorrect: false,
                        },
                        {
                            text: "Garantir que duas listas sejam atualizadas em conjunto",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir o join na espera pelo término de outra thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Saldo e histórico precisam mudar juntos. Por que dois atomics separados não resolvem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada um é atômico sozinho; o par ainda expõe estado intermediário",
                            isCorrect: true,
                        },
                        {
                            text: "Atomics não podem coexistir em número maior que um por estrutura",
                            isCorrect: false,
                        },
                        {
                            text: "O hardware só oferece atomicidade para variáveis de até 8 bits",
                            isCorrect: false,
                        },
                        {
                            text: "Dois atomics no mesmo cache disparam deadlock entre os núcleos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em custo, onde o atomic disputado se encaixa entre o acesso comum e o mutex disputado?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No meio: dezenas de ns, contra µs do mutex que dorme no kernel",
                            isCorrect: true,
                        },
                        {
                            text: "Acima do mutex: a instrução com lock trava o barramento inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Igual ao acesso comum: o hardware esconde o custo por completo",
                            isCorrect: false,
                        },
                        {
                            text: "Imprevisível: depende só da prioridade das threads envolvidas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a orientação prática sobre memory_order nas operações atômicas?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ficar no seq_cst padrão até uma medição justificar afinar",
                            isCorrect: true,
                        },
                        {
                            text: "Usar relaxed em tudo: o ganho é grande e o risco é apenas teórico",
                            isCorrect: false,
                        },
                        {
                            text: "Usar acquire nas escritas e release nas leituras, como regra fixa",
                            isCorrect: false,
                        },
                        {
                            text: "Evitar seq_cst, que é aceito apenas em processadores antigos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fila thread-safe",
            blocks: [
                {
                    type: "text",
                    value: "# O padrão completo, peça por peça\n\nEsta aula junta o módulo inteiro numa estrutura só: a fila thread-safe, o utilitário de concorrência mais reutilizado que existe. Produtores chamam push de um lado; consumidores chamam pop do outro e dormem quando não há nada. As peças: um deque como armazenamento, um mutex protegendo toda a estrutura, uma variável de condição para os consumidores esperarem, e uma flag fechada para o encerramento limpo.\n\nO push trava o mutex, insere e, já fora do cadeado, notifica um consumidor. O pop trava e espera no predicado a fila ter item ou estar fechada; ao acordar com item, retira e devolve. Cada método é uma seção crítica curta: nada de processar o item com o mutex preso, o trabalho pesado acontece depois, com o cadeado já solto. Esse desenho transforma o problema difícil (N threads disputando estado) num problema resolvido uma única vez, dentro de uma classe testável: quem usa a fila não escreve mais nenhuma linha de sincronização. É exatamente a fronteira que o projeto do módulo 7 põe no centro do servidor de log.",
                },
                {
                    type: "code",
                    value: "#include <condition_variable>\n#include <deque>\n#include <mutex>\n#include <optional>\n\ntemplate <typename T>\nclass FilaSegura {\n    std::mutex m;\n    std::condition_variable cv;\n    std::deque<T> fila;\n    bool fechada = false;\n\npublic:\n    void push(T item) {\n        {\n            std::lock_guard<std::mutex> trava(m);\n            fila.push_back(std::move(item));\n        }\n        cv.notify_one();\n    }\n\n    std::optional<T> pop() {\n        std::unique_lock<std::mutex> trava(m);\n        cv.wait(trava, [&] { return !fila.empty() || fechada; });\n        if (fila.empty()) return std::nullopt;   // fechada e ja drenada\n        T item = std::move(fila.front());\n        fila.pop_front();\n        return item;\n    }\n\n    void fecha() {\n        {\n            std::lock_guard<std::mutex> trava(m);\n            fechada = true;\n        }\n        cv.notify_all();   // acorda todo mundo para encerrar\n    }\n};",
                },
                {
                    type: "table",
                    value: '[["Peça","Papel no padrão","Erro se faltar"],["Mutex","Protege deque e flag","Corrida na estrutura interna"],["Condition variable","Consumidor dorme sem girar","Busy-wait queimando CPU"],["Predicado do wait","Reconfere item ou fechamento","Spurious wakeup quebra o pop"],["Flag fechada","Sinaliza fim aos consumidores","Threads dormindo para sempre"],["optional no pop","Distingue item de encerramento","Consumidor não sabe quando sair"]]',
                },
                {
                    type: "quote",
                    value: "A fila fechada ainda entrega o que tem: fechar interrompe as entradas, não o esvaziamento. Shutdown que descarta a fila cheia é shutdown que perde trabalho.",
                },
                {
                    type: "text",
                    value: "## Shutdown limpo: o detalhe que separa o exemplo do produto\n\nO encerramento é onde filas ingênuas quebram. Se os consumidores esperam com o predicado apenas fila não vazia, no shutdown eles dormem para sempre: ninguém vai produzir de novo, e o processo não termina. Por isso o predicado é duplo (item disponível OU fila fechada), e o fecha() usa notify_all: todos os consumidores precisam acordar para perceber o fim. O pop devolve std::optional para dizer duas coisas com um retorno só: um item, ou o aviso honesto de que acabou.\n\nRepare na ordem dentro do fecha e do push: a flag e o dado mudam com o mutex travado, e a notificação sai depois de soltar. Notificar segurando o cadeado não é errado, mas faz a thread acordada esbarrar no mutex ainda preso e voltar a esperar, um vai-e-vem inútil. E note o que a fila ainda não tem: limite de tamanho. Um produtor rápido demais enche a memória até o processo cair. A versão com capacidade máxima, em que o push também bloqueia (backpressure), aparece no módulo 7, onde a pergunta o que fazer quando a fila enche vira decisão de produto.",
                },
            ],
            questions: [
                {
                    statement:
                        "Na fila thread-safe, por que o predicado do wait é fila com item OU fechada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem o lado fechada, consumidores dormem para sempre no fim",
                            isCorrect: true,
                        },
                        {
                            text: "O wait de C++ exige dois termos em qualquer predicado usado",
                            isCorrect: false,
                        },
                        {
                            text: "O lado fechada acelera o pop nos momentos de fila cheia",
                            isCorrect: false,
                        },
                        {
                            text: "É uma otimização: um termo só forçaria o uso de notify_all",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o pop devolve std::optional em vez de devolver T direto?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para distinguir item entregue de fila encerrada e vazia",
                            isCorrect: true,
                        },
                        {
                            text: "Para evitar cópia do item na saída da seção crítica",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o deque interno só armazena tipos empacotados",
                            isCorrect: false,
                        },
                        {
                            text: "Para permitir dois consumidores lerem o mesmo item juntos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o fecha() usa notify_all em vez de notify_one?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Todos os consumidores precisam acordar para ver o encerramento",
                            isCorrect: true,
                        },
                        {
                            text: "notify_one não funciona depois que a flag interna vira true",
                            isCorrect: false,
                        },
                        {
                            text: "notify_all esvazia a fila automaticamente antes de fechar",
                            isCorrect: false,
                        },
                        {
                            text: "É apenas estilo: notify_one teria exatamente o mesmo efeito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que processar o item dentro do pop, com o mutex travado, seria um erro de projeto?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A seção crítica ficaria longa e serializaria os consumidores",
                            isCorrect: true,
                        },
                        {
                            text: "O processamento apagaria o item da fila antes da retirada",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex não permite chamadas de função no trecho protegido",
                            isCorrect: false,
                        },
                        {
                            text: "A condition variable expiraria durante o processamento longo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de fecha(), o que acontece com os itens que ainda estavam na fila?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Seguem sendo entregues: fechar barra entradas, não a drenagem",
                            isCorrect: true,
                        },
                        {
                            text: "São descartados na hora: fechar limpa o deque por segurança",
                            isCorrect: false,
                        },
                        {
                            text: "Ficam presos: pop retorna vazio assim que a flag vira true",
                            isCorrect: false,
                        },
                        {
                            text: "São devolvidos aos produtores por um callback de estorno",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Spinlock vs mutex",
            blocks: [
                {
                    type: "text",
                    value: "# Girar ou dormir\n\nQuando a trava está ocupada, existem duas filosofias de espera. O mutex põe a thread para dormir: o kernel a tira da CPU e a acorda quando a trava abrir, com um custo fixo de dois chaveamentos de contexto, na casa de 1 a 10 microssegundos no total. O spinlock gira: fica num loop apertado testando a trava com uma operação atômica até conseguir, queimando CPU o tempo inteiro, mas pegando a trava nanossegundos depois de ela abrir.\n\nA aposta é essa: se a seção crítica do outro lado dura menos que o custo de dormir e acordar, girar ganha; se dura mais, girar é desperdício puro. Seções de algumas centenas de nanossegundos (atualizar dois ponteiros, incrementar contadores) são o habitat do spinlock; qualquer coisa que possa durar microssegundos ou mais, e qualquer coisa que faça E/S, é território do mutex. E há uma condição eliminatória: spinlock só faz sentido se quem segura a trava está rodando em outro núcleo agora. Se o dono foi preemptado, você gira esperando alguém que nem está na CPU, no pior caso o quantum inteiro, milissegundos jogados fora.",
                },
                {
                    type: "code",
                    value: "#include <atomic>\n\n// Spinlock minimo, para ver o mecanismo (nao use em producao).\nclass Spin {\n    std::atomic_flag ocupado = ATOMIC_FLAG_INIT;\n\npublic:\n    void lock() {\n        while (ocupado.test_and_set(std::memory_order_acquire)) {\n            // gira: queima CPU ate a trava abrir\n        }\n    }\n    void unlock() {\n        ocupado.clear(std::memory_order_release);\n    }\n};",
                },
                {
                    type: "table",
                    value: '[["Critério","Spinlock","Mutex"],["Espera","Gira queimando CPU","Dorme via kernel (futex)"],["Custo de pegar trava livre","Nanossegundos","Nanossegundos também"],["Custo de esperar","CPU cheia o tempo todo","1 a 10 µs de chaveamento"],["Seção crítica ideal","Centenas de ns, sem E/S","Qualquer duração"],["Dono preemptado","Desastre: gira à toa","Indiferente: já dormia"]]',
                },
                {
                    type: "quote",
                    value: "Girar é apostar que a espera será mais curta que dois chaveamentos de contexto. Acertou, ganhou nanossegundos; errou, queimou um núcleo para assistir a uma trava fechada.",
                },
                {
                    type: "text",
                    value: "## Quem usa cada um, na prática\n\nO spinlock é a trava padrão dentro do kernel do Linux para seções curtíssimas, e lá ele funciona porque o kernel controla a preempção: pode desligá-la enquanto segura a trava, garantindo que o dono nunca é tirado da CPU no meio. É o cenário ideal do girar, e não existe no espaço do usuário, onde o escalonador pode preemptar qualquer thread a qualquer momento, inclusive a dona do spinlock.\n\nPor isso, em código de aplicação, a resposta padrão é o mutex, e ela é melhor do que parece: as implementações modernas (o futex do Linux por baixo do std::mutex) são híbridas. Com a trava livre, pegar custa uma operação atômica no espaço do usuário, sem kernel nenhum; sob disputa, muitas fazem um giro breve antes de dormir, colhendo o melhor dos dois mundos. Ou seja: você já tem um quase-spinlock embutido no mutex que usa. Escrever um spinlock próprio em aplicação é justificável em nichos raros (motores de jogo, HFT, estruturas lock-free) e depois de medir; para o resto, é otimização prematura com cara de sofisticação. Regra final do módulo: comece com mutex, meça a contenção, e mude com números na mão.",
                },
            ],
            questions: [
                {
                    statement: "O que um spinlock faz quando encontra a trava ocupada?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Gira em loop testando a trava, queimando CPU até abrir",
                            isCorrect: true,
                        },
                        {
                            text: "Dorme no kernel e é acordado quando a trava for solta",
                            isCorrect: false,
                        },
                        {
                            text: "Desiste na hora e devolve erro para quem tentou travar",
                            isCorrect: false,
                        },
                        {
                            text: "Rouba a trava da thread dona depois de um tempo limite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o custo típico de esperar num mutex que dorme via kernel?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Uns 1 a 10 µs, o preço de dois chaveamentos de contexto",
                            isCorrect: true,
                        },
                        {
                            text: "Alguns milissegundos fixos, o tamanho de um quantum inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Praticamente zero: dormir e acordar não passam pelo kernel",
                            isCorrect: false,
                        },
                        {
                            text: "Um segundo de penalidade imposto pelo escalonador à thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Em que cenário o spinlock vence o mutex?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Seção curtíssima, sem E/S, com o dono rodando em outro núcleo",
                            isCorrect: true,
                        },
                        {
                            text: "Seção longa com E/S, em que dormir atrapalharia o throughput",
                            isCorrect: false,
                        },
                        {
                            text: "Máquina de um núcleo só, onde o giro termina mais depressa",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer seção com mais de quatro threads disputando a trava",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o dono do spinlock ser preemptado é um desastre para quem espera?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os outros giram esperando alguém que nem está na CPU",
                            isCorrect: true,
                        },
                        {
                            text: "A trava é liberada à força e a seção crítica se corrompe",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel converte o spinlock em mutex e perde o histórico",
                            isCorrect: false,
                        },
                        {
                            text: "O giro passa a consumir memória em vez de tempo de CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o kernel do Linux pode usar spinlocks com segurança onde a aplicação não pode?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele desliga a preempção enquanto segura a trava curta",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel roda num núcleo reservado, livre de concorrência",
                            isCorrect: false,
                        },
                        {
                            text: "Spinlocks de kernel são emulados por mutexes mais seguros",
                            isCorrect: false,
                        },
                        {
                            text: "No kernel o giro é feito pela controladora de memória, sem CPU",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - O escalonador",
    aulas: [
        {
            titulo: "Escalonamento",
            blocks: [
                {
                    type: "text",
                    value: "# Quem roda agora\n\nCom mais threads prontas do que núcleos, alguém tem que decidir quem ocupa a CPU a cada instante. Esse alguém é o escalonador, e a primeira palavra do vocabulário é preempção: o kernel pode tirar uma thread da CPU sem pedir licença. O mecanismo é um relógio de hardware que interrompe a CPU em intervalos regulares (o tick); a cada interrupção, o kernel confere se a thread atual já rodou o suficiente e, se sim, troca. A fatia de tempo que cada thread recebe antes de ser trocada é o quantum, tipicamente na casa de poucos milissegundos no Linux atual, e é a preempção que impede um loop infinito de sequestrar a máquina.\n\nSem preempção, um sistema cooperativo depende de cada programa devolver a CPU por boa vontade, e um único while(true) congela tudo: foi o mundo do Windows 3.x, e é o mundo dentro de um event loop bloqueado até hoje. Com preempção, o pior programa do mundo perde a CPU alguns milissegundos depois de recebê-la. A troca em si, porém, não é grátis, e é essa conta que fecha a aula.",
                },
                {
                    type: "table",
                    value: '[["Operação","Custo típico em 2026","Escala"],["Chamada de sistema simples","100 a 300 ns","Nanossegundos"],["Troca entre threads do mesmo processo","1 a 2 µs diretos","Microssegundos"],["Troca entre processos","2 a 5 µs diretos","Microssegundos"],["Efeito indireto (caches frios, TLB)","10 a 50 µs de trabalho degradado","Dezenas de µs"],["Quantum usual","1 a 6 ms","Milissegundos"]]',
                },
                {
                    type: "quote",
                    value: "O custo visível da troca de contexto é salvar e restaurar registradores. O custo real é voltar para uma CPU que esqueceu você: cache frio, TLB frio, e milhares de misses até reaquecer.",
                },
                {
                    type: "text",
                    value: "## O preço de trocar\n\nUma troca de contexto salva os registradores da thread que sai no seu PCB, escolhe a próxima na fila de prontos, restaura os registradores dela e, se for de outro processo, troca também a tabela de páginas. O custo direto é de 1 a 5 microssegundos. O custo indireto é maior e mais traiçoeiro: a thread que entra encontra os caches da CPU cheios dos dados de quem saiu, e passa as primeiras dezenas de microssegundos pagando miss atrás de miss até reaquecer o seu conjunto de trabalho.\n\nEssa conta explica uma regra que você já ouviu sem o porquê: threads demais pioram o desempenho. Se 200 threads CPU-bound disputam 8 núcleos, o tempo se pulveriza em trocas e reaquecimentos; com 8 a 16 threads fazendo o mesmo trabalho em fila, o throughput sobe. Vale o contraste com a alternativa: alternar entre duas tarefas na mesma thread (uma chamada de função) custa nanossegundos, e é por isso que event loops e corrotinas escalam onde threads não conseguem. O vmstat mostra a coluna cs (context switches por segundo): dezenas de milhares numa máquina de servidor são normais; centenas de milhares merecem investigação.",
                },
            ],
            questions: [
                {
                    statement: "O que é preempção no contexto do escalonador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O kernel tira a thread da CPU sem que ela precise concordar",
                            isCorrect: true,
                        },
                        {
                            text: "A thread devolve a CPU voluntariamente ao terminar sua fase",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel promove a thread mais antiga ao topo da fila de espera",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU desliga o núcleo ocioso para economizar energia na hora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o quantum de uma thread?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A fatia de tempo de CPU que ela recebe antes da troca",
                            isCorrect: true,
                        },
                        {
                            text: "A quantidade de memória que ela pode alocar por segundo",
                            isCorrect: false,
                        },
                        {
                            text: "O número de núcleos em que ela pode rodar ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo máximo que ela pode dormir esperando um evento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o custo real de uma troca de contexto vai além de salvar e restaurar registradores?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A thread volta a caches e TLB frios e paga misses até reaquecer",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel recompila a tabela de syscalls a cada troca realizada",
                            isCorrect: false,
                        },
                        {
                            text: "A troca zera o quantum de todas as outras threads do processo",
                            isCorrect: false,
                        },
                        {
                            text: "Os registradores são gravados em disco, o que custa milissegundos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que 200 threads CPU-bound em 8 núcleos rendem menos que 16 fazendo o mesmo trabalho?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O tempo se pulveriza em trocas de contexto e reaquecimento",
                            isCorrect: true,
                        },
                        {
                            text: "O escalonador reserva um núcleo inteiro para si nesse cenário",
                            isCorrect: false,
                        },
                        {
                            text: "Threads acima do número de núcleos rodam em modo interpretado",
                            isCorrect: false,
                        },
                        {
                            text: "A memória das 200 stacks não cabe no cache L1 da CPU usada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um loop infinito num sistema preemptivo não congela a máquina. Qual mecanismo garante isso?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O tick do relógio interrompe a CPU e o kernel troca a thread",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador insere pontos de pausa dentro de todos os loops",
                            isCorrect: false,
                        },
                        {
                            text: "A CPU detecta repetição de instruções e reduz a frequência",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel mata automaticamente threads que rodam sem syscalls",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Políticas",
            blocks: [
                {
                    type: "text",
                    value: "# Do rodízio à justiça proporcional\n\nA política mais simples é o round-robin: fila circular, cada thread roda um quantum e vai para o fim da fila. É justo no sentido burro, todo mundo recebe o mesmo, inclusive quem não precisa. A evolução óbvia é dar prioridades: números que ordenam quem merece a CPU primeiro. Prioridade fixa resolve o urgente e cria o problema clássico: com um fluxo constante de tarefas de prioridade alta, as de prioridade baixa nunca rodam.\n\nO Linux moderno segue outra filosofia: fair share, a justiça proporcional. A ideia consagrada pelo CFS (Completely Fair Scheduler): cada thread acumula vruntime, o tempo virtual que já consumiu de CPU, e o escalonador escolhe sempre quem tem o menor vruntime, ou seja, quem está mais para trás na corrida. Quem dormiu esperando E/S acumulou pouco e ganha a CPU assim que acorda, o que beneficia exatamente as tarefas interativas. O nice de um processo entra como peso nessa conta: nice baixo faz o relógio virtual andar devagar (mais CPU real), nice alto faz andar depressa. Em 2026 o escalonador default do kernel é o EEVDF, sucessor que herda a mesma base de justiça proporcional e melhora as garantias de latência.",
                },
                {
                    type: "code",
                    value: "// A ideia do fair share, em pseudocodigo:\nproximo = tarefa_com_menor_vruntime(fila)\nroda(proximo, fatia)\nproximo.vruntime += tempo_rodado * peso(nice)\n\n// Consequencias diretas:\n// - quem rodou pouco tem vruntime baixo e volta logo para a CPU\n// - quem dormiu em E/S volta na frente: otimo para interatividade\n// - nice alto infla o vruntime: a tarefa cede a vez com frequencia",
                },
                {
                    type: "table",
                    value: '[["Política","Ideia central","Ponto forte","Ponto fraco"],["Round-robin","Rodízio de quantum igual","Simples e previsível","Ignora urgência e interatividade"],["Prioridade fixa","Número decide quem vai antes","Atende o urgente","Faminto na prioridade baixa"],["Fair share (CFS/EEVDF)","CPU proporcional via vruntime","Interativo responde bem","Não dá garantias de prazo"]]',
                },
                {
                    type: "quote",
                    value: "O fair share não pergunta quem é mais importante, pergunta quem está mais atrasado na corrida. É uma troca de pergunta que elimina o faminto por construção.",
                },
                {
                    type: "text",
                    value: "## Ler o sistema com esses olhos\n\nEssa mecânica explica comportamentos do dia a dia. Por que o terminal responde instantaneamente mesmo com uma compilação usando todos os núcleos? O shell passou o tempo dormindo à espera do teclado, tem vruntime baixíssimo e fura a fila no momento em que você digita. Por que a compilação com nice 19 quase não atrapalha? O peso alto infla o vruntime dela a cada fatia, então ela roda com folga quando a máquina está ociosa e cede na primeira disputa.\n\nVale nomear o que o fair share não promete: prazo. Ele garante proporção justa de CPU ao longo do tempo, não que uma tarefa específica rode antes de um instante específico. Para quase tudo (servidores, desktops, build farms) isso basta e sobra. Quando não basta (controle industrial, áudio profissional), entram as classes de tempo real do kernel, como SCHED_FIFO, que passam por cima da justiça e trazem seus próprios perigos; a aula 5 volta a essa fronteira. Para inspecionar na prática: top mostra PR e NI por processo, e chrt -p PID mostra a classe de escalonamento. O padrão que você verá em quase tudo: SCHED_OTHER, a classe do fair share.",
                },
            ],
            questions: [
                {
                    statement:
                        "No fair share do Linux, qual thread o escalonador escolhe para rodar?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A de menor vruntime: quem consumiu menos CPU virtual",
                            isCorrect: true,
                        },
                        {
                            text: "A de maior prioridade numérica declarada no código fonte",
                            isCorrect: false,
                        },
                        {
                            text: "A que está há mais tempo na fila, em ordem de chegada",
                            isCorrect: false,
                        },
                        {
                            text: "A que possui mais threads filhas esperando por resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a fraqueza do round-robin puro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Trata igual quem é interativo e quem só mastiga CPU",
                            isCorrect: true,
                        },
                        {
                            text: "Deixa threads famintas para sempre no fim da fila dele",
                            isCorrect: false,
                        },
                        {
                            text: "Exige hardware dedicado para girar a fila de processos",
                            isCorrect: false,
                        },
                        {
                            text: "Só funciona quando todas as tarefas têm a mesma duração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma tarefa que dormiu muito esperando E/S ganha a CPU rapidamente ao acordar?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dormindo ela não acumulou vruntime e está atrás na corrida",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel dá um bônus fixo de prioridade a quem faz mais E/S",
                            isCorrect: false,
                        },
                        {
                            text: "Tarefas de E/S rodam numa fila exclusiva com quantum dobrado",
                            isCorrect: false,
                        },
                        {
                            text: "O disco envia uma interrupção que força a troca imediata",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o nice de um processo entra na conta do fair share?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Como peso: nice alto infla o vruntime e o processo cede a vez",
                            isCorrect: true,
                        },
                        {
                            text: "Como teto: nice define o máximo de núcleos que ele pode usar",
                            isCorrect: false,
                        },
                        {
                            text: "Como reserva: nice baixo garante uma fração fixa de memória",
                            isCorrect: false,
                        },
                        {
                            text: "Como filtro: nice negativo tira o processo da fila de prontos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o fair share garante e o que ele não garante?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Garante proporção justa de CPU; não garante prazo de execução",
                            isCorrect: true,
                        },
                        {
                            text: "Garante prazo de execução; não garante proporção entre tarefas",
                            isCorrect: false,
                        },
                        {
                            text: "Garante os dois, desde que o número de threads caiba nos núcleos",
                            isCorrect: false,
                        },
                        {
                            text: "Não garante nenhum dos dois: é apenas uma heurística de fila",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Prioridade e starvation",
            blocks: [
                {
                    type: "text",
                    value: "# O risco de morrer de fome\n\nStarvation é a tarefa pronta para rodar que nunca recebe CPU porque sempre existe alguém na frente. Em escalonadores de prioridade estrita, é um modo de falha estrutural: basta um fluxo constante de tarefas de prioridade maior e a de baixo espera para sempre. O sintoma engana: a máquina parece saudável, os gráficos bonitos, e um job específico simplesmente não anda há horas.\n\nO remédio clássico é o aging: a prioridade efetiva de quem espera cresce com o tempo de espera. Cedo ou tarde, até a tarefa mais humilde acumula prioridade suficiente para furar a fila, rodar um pouco e recomeçar de baixo. É um imposto de justiça sobre os privilegiados, cobrado em milissegundos. O fair share do Linux chega ao mesmo efeito por outro caminho, sem precisar de gambiarra por cima: como o escalonador sempre escolhe o menor vruntime e quem não roda não acumula vruntime, a tarefa parada fica cada vez mais atrás na corrida e sua vez chega por construção. Mesmo um processo com nice 19 numa máquina lotada recebe sua fatia pequena, porém diferente de zero.",
                },
                {
                    type: "table",
                    value: '[["Valor de nice","Significado","Uso típico"],["-20","Peso máximo de CPU","Raro; exige root; áudio, latência"],["0","Padrão de todo processo","Aplicações em geral"],["10","Peso reduzido","Tarefas de fundo educadas"],["19","Peso mínimo","Backup, indexação, batch noturno"]]',
                },
                {
                    type: "quote",
                    value: "Starvation raramente aparece no gráfico de CPU: a máquina está ocupada e produtiva. Quem denuncia é o job que não termina nunca, e o tempo de espera na fila que ninguém estava medindo.",
                },
                {
                    type: "text",
                    value: "## A fome fora do escalonador\n\nA lição da starvation vale além da CPU, e é aí que ela morde times de backend. Uma fila de trabalhos com prioridades em que a classe alta nunca esvazia deixa a classe baixa apodrecer: relatórios que nunca saem, e-mails que nunca partem. Um mutex muito disputado não garante ordem de chegada: uma thread azarada pode perder a corrida do lock dezenas de vezes seguidas para vizinhas mais rápidas. Reader-writer locks com preferência a leitores deixam o escritor esperando indefinidamente enquanto leitores não param de chegar. Em todos os casos, o padrão é o mesmo: um critério de escolha que ignora o tempo de espera fabrica famintos.\n\nAs defesas também se repetem. Meça idade, não só vazão: a métrica que pega starvation é o tempo do item mais velho na fila, não a taxa de processamento. Aplique aging onde houver prioridade explícita. Reserve capacidade mínima para a classe baixa (por exemplo, um trabalhador dedicado a ela). E desconfie de todo desenho em que ser importante é absoluto: prioridade saudável é peso na balança, como o nice no fair share, e não um passe para passar na frente eternamente.",
                },
            ],
            questions: [
                {
                    statement: "O que é starvation num escalonador?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tarefa pronta que nunca roda: sempre há alguém na frente",
                            isCorrect: true,
                        },
                        {
                            text: "Tarefa que trava esperando um lock que nunca é liberado",
                            isCorrect: false,
                        },
                        {
                            text: "Tarefa que consome tanta CPU que derruba o resto da fila",
                            isCorrect: false,
                        },
                        {
                            text: "Tarefa encerrada pelo kernel por exceder o uso de memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o aging combate a starvation?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A prioridade efetiva de quem espera cresce com o tempo",
                            isCorrect: true,
                        },
                        {
                            text: "As tarefas antigas são movidas para outra máquina da rede",
                            isCorrect: false,
                        },
                        {
                            text: "O quantum das tarefas novas encolhe até chegar perto de zero",
                            isCorrect: false,
                        },
                        {
                            text: "As prioridades são sorteadas de novo a cada tick do relógio",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o fair share evita starvation sem precisar de aging explícito?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quem não roda fica para trás no vruntime e a vez sempre chega",
                            isCorrect: true,
                        },
                        {
                            text: "Ele reserva um núcleo físico exclusivo para a prioridade baixa",
                            isCorrect: false,
                        },
                        {
                            text: "Ele descarta tarefas de prioridade alta quando a espera cresce",
                            isCorrect: false,
                        },
                        {
                            text: "Ele limita cada processo a um número fixo de fatias por segundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual métrica denuncia starvation numa fila de trabalhos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A idade do item mais velho esperando na fila",
                            isCorrect: true,
                        },
                        {
                            text: "A taxa média de processamento por minuto da fila",
                            isCorrect: false,
                        },
                        {
                            text: "O tamanho total da fila no horário de pico do dia",
                            isCorrect: false,
                        },
                        {
                            text: "O uso agregado de CPU dos trabalhadores da fila",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num reader-writer lock com preferência a leitores, quem corre risco de fome e por quê?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O escritor: leitores chegando sem parar o deixam esperando sempre",
                            isCorrect: true,
                        },
                        {
                            text: "Os leitores: o escritor monopoliza o lock a cada nova escrita feita",
                            isCorrect: false,
                        },
                        {
                            text: "Ninguém: esse tipo de lock elimina starvation por especificação",
                            isCorrect: false,
                        },
                        {
                            text: "Ambos igualmente: a preferência alterna entre os lados a cada uso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Afinidade e migração",
            blocks: [
                {
                    type: "text",
                    value: "# Cache quente é patrimônio\n\nEnquanto uma thread roda, ela vai enchendo os caches daquele núcleo com seus dados: L1 (uns 32 a 64 KB, latência de ~1 ns), L2 (512 KB a 2 MB, ~4 ns) e o L3 compartilhado entre núcleos (dezenas de MB, ~10 a 20 ns). Esse estado aquecido é patrimônio: com ele, a maioria dos acessos custa nanossegundos; sem ele, cada acesso desce até a RAM e paga ~80 a 100 ns. Migrar a thread para outro núcleo joga fora L1 e L2 inteiros, e a thread recomeça pagando misses até reconstruir tudo.\n\nO escalonador do Linux sabe disso e pratica afinidade natural: tenta devolver cada thread ao núcleo onde rodou por último, e só migra quando o desequilíbrio de carga compensa o prejuízo. Na maioria das aplicações, essa heurística acerta e você não deveria interferir. A interferência manual existe e tem nome: afinidade explícita, fixar uma thread num conjunto de CPUs, via taskset no shell ou pthread_setaffinity_np no código. É uma ferramenta de nicho, e a segunda metade da aula é sobre reconhecer o nicho.",
                },
                {
                    type: "table",
                    value: '[["Nível","Tamanho típico em 2026","Latência","Migrou de núcleo, perde?"],["L1","32 a 64 KB por núcleo","~1 ns","Sim, inteiro"],["L2","512 KB a 2 MB por núcleo","~4 ns","Sim, inteiro"],["L3","16 a 96 MB compartilhado","10 a 20 ns","Não, se ficar no mesmo chip"],["RAM","Dezenas de GB","80 a 100 ns","Não, mas é a lenta"]]',
                },
                {
                    type: "quote",
                    value: "Fixar CPU não torna o código mais rápido: torna o desempenho mais previsível. Só vale quando a variação, e não a média, é o inimigo, e depois de medir.",
                },
                {
                    type: "text",
                    value: "## Quando fixar importa de verdade\n\nOs casos legítimos de afinidade explícita são poucos e específicos. Benchmarks: fixar o processo numa CPU elimina o ruído de migração e torna os números reproduzíveis. Sistemas de latência extrema (trading, áudio profissional, telecom): isola-se um núcleo do resto do sistema e roda-se ali a thread crítica, sozinha, com cache inteirinho para ela e sem vizinho para causar jitter. Máquinas NUMA (múltiplos soquetes, cada um com sua memória local): manter a thread no soquete onde seus dados foram alocados evita que cada acesso atravesse a interconexão e pague 30 a 50% a mais de latência; o numactl controla isso.\n\nFora desses nichos, fixar CPU costuma piorar as coisas: você amarra as mãos do escalonador, que deixa núcleos ociosos enquanto o seu escolhido vive congestionado. A heurística automática balanceia carga o dia inteiro, considera a topologia real (núcleos irmãos de hyperthreading, caches compartilhados) e melhora a cada versão do kernel. A ordem certa das ferramentas: primeiro meça (perf stat mostra migrações e cache misses), depois melhore a localidade dos dados no seu código, e só então, com números na mão, considere afinidade.",
                },
            ],
            questions: [
                {
                    statement: "O que uma thread perde ao migrar de um núcleo para outro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Os caches L1 e L2 aquecidos, que ficam no núcleo antigo",
                            isCorrect: true,
                        },
                        {
                            text: "A stack e os registradores, que precisam ser realocados",
                            isCorrect: false,
                        },
                        {
                            text: "Os arquivos abertos, que são fechados na hora da migração",
                            isCorrect: false,
                        },
                        {
                            text: "O quantum acumulado, que volta a contar do zero na fila",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o comportamento padrão do escalonador do Linux quanto à afinidade?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Tenta devolver a thread ao núcleo onde ela rodou por último",
                            isCorrect: true,
                        },
                        {
                            text: "Sorteia um núcleo diferente a cada quantum para equilibrar",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém cada processo preso ao núcleo em que ele foi criado",
                            isCorrect: false,
                        },
                        {
                            text: "Roda todas as threads de um processo no mesmo núcleo sempre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que fixar a CPU é prática comum em benchmarks?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Elimina o ruído de migração e torna os números reproduzíveis",
                            isCorrect: true,
                        },
                        {
                            text: "Dobra a frequência do núcleo escolhido durante toda a medição",
                            isCorrect: false,
                        },
                        {
                            text: "Impede o kernel de coletar métricas que atrapalham o resultado",
                            isCorrect: false,
                        },
                        {
                            text: "Libera o benchmark do teto de quantum imposto às tarefas comuns",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Numa máquina NUMA, por que manter a thread perto da memória que ela usa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Acesso remoto atravessa a interconexão e custa até 50% mais",
                            isCorrect: true,
                        },
                        {
                            text: "Threads em soquete errado são rebaixadas de prioridade na fila",
                            isCorrect: false,
                        },
                        {
                            text: "A memória de outro soquete é somente leitura para a thread",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel copia os dados inteiros a cada acesso de outro soquete",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que fixar afinidade sem medir costuma piorar o desempenho geral?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Amarra o balanceador: núcleos ficam ociosos e o seu congestiona",
                            isCorrect: true,
                        },
                        {
                            text: "A afinidade desliga os caches L1 do núcleo escolhido por padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Threads fixadas perdem o direito ao quantum estendido do kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O escalonador pune com nice 19 os processos que pedem afinidade",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Latência vs throughput",
            blocks: [
                {
                    type: "text",
                    value: "# O trade central do escalonamento\n\nLatência é o tempo entre o evento e a resposta: o toque na tecla e a letra na tela. Throughput é o volume de trabalho concluído por unidade de tempo: os builds da noite, as requisições servidas por segundo. O escalonador não consegue maximizar os dois ao mesmo tempo, porque a ferramenta que melhora um piora o outro: o quantum. Quantum curto e trocas frequentes deixam todo mundo responder logo (latência boa), mas gastam uma fração crescente da CPU em trocas de contexto e caches frios (throughput pior). Quantum longo amortiza o custo das trocas e deixa os caches quentinhos (throughput ótimo), mas quem chega espera mais para ser atendido (latência pior).\n\nCargas interativas (desktop, API atendendo usuários) vivem do lado da latência: o dono do sistema é um humano esperando, e 50 ms de atraso se percebem. Cargas batch (compilação, ETL, treino de modelo) vivem do lado do throughput: ninguém olha requisição por requisição, o que importa é terminar o lote. O fair share equilibra os dois automaticamente ao favorecer quem dorme (interativo acorda na frente) sem confiscar a CPU de quem mastiga.",
                },
                {
                    type: "table",
                    value: '[["Perfil de carga","O que otimizar","Quantum ideal","Exemplos"],["Interativa","Latência de resposta","Curto; trocas frequentes","Desktop, shell, API de usuário"],["Batch","Throughput do lote","Longo; poucas trocas","Build, ETL, treino de modelo"],["Tempo real","Prazo garantido","Prioridade estrita, sem rodízio","Áudio, controle industrial"]]',
                },
                {
                    type: "quote",
                    value: "Interativo e batch discutem quem espera menos ou quem produz mais. Tempo real muda a pergunta: não é chegar rápido em média, é nunca chegar depois do prazo. Média excelente com um atraso fatal é reprovação.",
                },
                {
                    type: "text",
                    value: "## A mesma tensão em todo o stack\n\nEsse trade não é folclore de kernel: ele reaparece em cada camada que você opera. Um servidor web que processa requisições uma a uma tem latência mínima por requisição; agrupá-las em lotes (batching) multiplica o throughput ao custo de cada uma esperar o lote fechar. O garbage collector oferece o mesmo menu: coletas pequenas e frequentes (pausas curtas, overhead total maior) ou raras e grandes (pausas longas, overhead menor). Kafka com linger, GPU com batch de inferência, banco com commit em grupo: o mesmo dial, girado para lados diferentes.\n\nA disciplina de engenharia é escolher conscientemente. Primeiro, classifique a carga: alguém espera cada resposta individualmente? Otimize latência, e meça o p99, não a média. Ninguém espera item por item? Otimize throughput e meça vazão sustentada. Segundo, não misture as cargas sem proteção: batch pesado junto de interativo no mesmo recurso é receita de p99 ruim, e a solução clássica é separar (filas, pools ou máquinas distintas) ou rebaixar o batch com nice. E fica plantada a semente para outro momento: quando existe um prazo físico inegociável, nem latência média nem vazão resolvem; esse é o mundo do tempo real, com escalonamento próprio.",
                },
            ],
            questions: [
                {
                    statement: "Como quantum curto e quantum longo afetam latência e throughput?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Curto melhora a latência; longo favorece o throughput",
                            isCorrect: true,
                        },
                        {
                            text: "Curto melhora os dois; longo só existe por compatibilidade",
                            isCorrect: false,
                        },
                        {
                            text: "Curto favorece o throughput; longo melhora a resposta média",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum efeito: quantum só define a ordem da fila de prontos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual métrica acompanhar num serviço interativo com usuários esperando?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A latência de cauda, como o p99, e não apenas a média",
                            isCorrect: true,
                        },
                        {
                            text: "A vazão total de requisições somada ao longo do dia todo",
                            isCorrect: false,
                        },
                        {
                            text: "O uso médio de CPU dos núcleos durante o horário comercial",
                            isCorrect: false,
                        },
                        {
                            text: "O número de threads criadas por segundo pelo processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que agrupar requisições em lotes aumenta o throughput e piora a latência individual?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O custo fixo se dilui no lote, mas cada uma espera o lote fechar",
                            isCorrect: true,
                        },
                        {
                            text: "Lotes rodam em núcleos dedicados, mais rápidos porém distantes",
                            isCorrect: false,
                        },
                        {
                            text: "O lote comprime os dados, ganhando banda e perdendo precisão",
                            isCorrect: false,
                        },
                        {
                            text: "Cada lote reinicia o quantum, o que atrasa as demais threads",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Batch pesado e serviço interativo dividem a mesma máquina. Qual é o risco e a mitigação clássica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O p99 do interativo piora; separar recursos ou dar nice ao batch",
                            isCorrect: true,
                        },
                        {
                            text: "O batch trava de vez; conceder a ele prioridade de tempo real",
                            isCorrect: false,
                        },
                        {
                            text: "Deadlock entre as cargas; usar um mutex global entre os processos",
                            isCorrect: false,
                        },
                        {
                            text: "A RAM se fragmenta; reiniciar o serviço interativo a cada hora",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que distingue tempo real de interativo rápido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O prazo é garantia dura: atrasar uma vez já é falha do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "É apenas marketing: tempo real é interativo com hardware caro",
                            isCorrect: false,
                        },
                        {
                            text: "Tempo real busca média menor; interativo se contenta com o p50",
                            isCorrect: false,
                        },
                        {
                            text: "Tempo real só existe em sistemas embarcados, nunca em servidores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Memória virtual",
    aulas: [
        {
            titulo: "Páginas e tabelas de páginas",
            blocks: [
                {
                    type: "text",
                    value: "# A tradução por trás de cada acesso\n\nO módulo 1 prometeu explicar como cada processo enxerga um espaço de endereços só seu. O mecanismo é a memória virtual: nenhum endereço que seu programa manipula é físico. A memória é dividida em páginas de tamanho fixo, 4 KB no x86 por padrão, e cada processo tem sua tabela de páginas, mantida pelo kernel, que mapeia página virtual para moldura física (frame). Em todo acesso, o hardware (a MMU) divide o endereço em número de página e deslocamento, consulta a tabela do processo atual, e monta o endereço físico: mesma posição dentro da moldura encontrada.\n\nEssa camada compra três coisas de uma vez. Isolamento: a tabela do seu processo simplesmente não contém as molduras do vizinho, então não existe instrução capaz de alcançá-las. Flexibilidade: páginas virtuais contíguas podem morar em molduras físicas espalhadas, acabando com o problema de achar memória contínua. E compartilhamento seletivo: a mesma moldura física pode aparecer na tabela de dois processos, que é como a libc é carregada uma vez só para o sistema inteiro.",
                },
                {
                    type: "code",
                    value: "// Traducao de um acesso, em pseudocodigo (paginas de 4 KB):\nvirtual = 0x00007f3a1c2b5c48\nvpn     = virtual >> 12         // numero da pagina virtual\noffset  = virtual & 0xFFF       // posicao dentro da pagina (12 bits)\n\npte = tabela_do_processo_atual[vpn]   // page table entry\nif (!pte.presente)            -> page fault (aula 3)\nif (escrita && !pte.gravavel) -> violacao: SIGSEGV\nif (execucao && pte.nx)       -> violacao: dado nao executa\n\nfisico = pte.frame * 4096 + offset",
                },
                {
                    type: "table",
                    value: '[["Bit da entrada (PTE)","Pergunta que responde","Quando barra o acesso"],["Presente","A página está na RAM?","Ausente: dispara page fault"],["Gravável (W)","Pode escrever?","Escrita em página só leitura"],["NX","Pode executar?","Executar dados: barrado"],["Usuário/kernel","Quem pode tocar?","Usuário tocando área do kernel"],["Acessada/suja","Foi lida? Foi escrita?","Não barra; informa o kernel"]]',
                },
                {
                    type: "quote",
                    value: "A proteção de memória não é uma checagem que o kernel roda de vez em quando: é o hardware conferindo bits da tabela em cada acesso, sem exceção e sem custo extra visível.",
                },
                {
                    type: "text",
                    value: "## O formato real da tabela\n\nUma tabela plana seria inviável: o espaço virtual de 48 bits úteis tem 68 bilhões de páginas possíveis, e ninguém pode gastar terabytes de tabela por processo. A solução é a tabela multinível: no x86-64 são 4 níveis (5 nas máquinas mais novas), uma árvore em que cada nível cobre uma fatia do endereço e só os ramos realmente usados existem. Um processo comum, com seus poucos GB mapeados, gasta só alguns MB de tabelas. O preço: uma tradução completa exige caminhar a árvore, 4 acessos à memória para achar 1, e a aula 2 mostra o cache que salva essa conta.\n\nOs bits de proteção da tabela são a linha de frente da segurança: é a combinação W e NX que impede a pilha de executar código injetado, e o bit usuário/kernel que blinda a metade alta do espaço, onde o kernel mora mapeado em todo processo. Quando o hardware encontra um acesso que viola os bits, ele levanta uma exceção e o kernel decide: violação real vira SIGSEGV no processo; página apenas ausente vira page fault legítimo, o mecanismo produtivo da aula 3.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o tamanho padrão de uma página de memória no x86?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "4 KB, com o deslocamento ocupando 12 bits do endereço",
                            isCorrect: true,
                        },
                        {
                            text: "64 bytes, o mesmo tamanho de uma linha de cache da CPU",
                            isCorrect: false,
                        },
                        {
                            text: "1 MB, herdado do tamanho dos segmentos do modo antigo",
                            isCorrect: false,
                        },
                        {
                            text: "Variável a cada boot, conforme a quantidade de RAM livre",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como a memória virtual impede um processo de ler a memória do outro?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A tabela dele não mapeia as molduras físicas do vizinho",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel criptografa a RAM de cada processo com chave própria",
                            isCorrect: false,
                        },
                        {
                            text: "Um firewall de memória inspeciona cada acesso entre processos",
                            isCorrect: false,
                        },
                        {
                            text: "Os processos usam pentes de RAM fisicamente separados na placa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a tabela de páginas é multinível, e qual é o preço disso?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tabela plana seria gigante; a árvore custa acessos extras",
                            isCorrect: true,
                        },
                        {
                            text: "Níveis extras adicionam redundância contra corrupção de RAM nos frames",
                            isCorrect: false,
                        },
                        {
                            text: "O multinível permite páginas de tamanhos mistos; o preço é fragmentar",
                            isCorrect: false,
                        },
                        {
                            text: "É exigência de compatibilidade de 32 bits; o preço é limitar o espaço",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como duas cópias do mesmo programa compartilham a libc na RAM?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As tabelas dos dois apontam para as mesmas molduras físicas",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel copia a libc para cada processo em molduras irmãs",
                            isCorrect: false,
                        },
                        {
                            text: "A libc roda num processo próprio e atende os dois por IPC",
                            isCorrect: false,
                        },
                        {
                            text: "O loader reescreve os binários para embutir a libc em cada um",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que par de proteções impede a pilha de executar código injetado por um ataque?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Bits W e NX: a página é gravável, porém nunca executável",
                            isCorrect: true,
                        },
                        {
                            text: "Bits presente e sujo: a página injetada nunca chega à RAM",
                            isCorrect: false,
                        },
                        {
                            text: "ASLR e o bit acessada: o endereço muda a cada leitura feita",
                            isCorrect: false,
                        },
                        {
                            text: "O bit usuário/kernel: a pilha pertence só ao espaço do kernel",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "TLB",
            blocks: [
                {
                    type: "text",
                    value: "# O cache que salva a tradução\n\nA aula anterior deixou uma conta assustadora: com tabela de 4 níveis, cada acesso à memória exigiria 4 acessos extras só para traduzir o endereço. Se fosse assim, a memória virtual quintuplicaria o custo de tudo. A salvação é o TLB (Translation Lookaside Buffer): um cache pequeno e absurdamente rápido, dentro da CPU, que guarda as traduções recentes de página virtual para moldura física.\n\nOs números de um processador de 2026: um TLB de primeiro nível com 64 a 128 entradas por núcleo, e um de segundo nível com 1.500 a 3.000 entradas. Um hit no TLB custa efetivamente zero, resolvido dentro do pipeline; um miss dispara o page walk, a caminhada pelos 4 níveis da tabela, na faixa de 20 a 100 ns dependendo de onde os níveis estão no cache. Parece raro, mas faça a conta da cobertura: 1.536 entradas vezes 4 KB são apenas 6 MB de memória cobertos pelo TLB. Um programa que passeia por 1 GB de dados estoura essa cobertura o tempo inteiro, e cada estouro é um page walk no meio do seu loop.",
                },
                {
                    type: "table",
                    value: '[["Evento","Custo típico em 2026","Observação"],["TLB hit","~0 ns, dentro do pipeline","O caso comum que você quer"],["TLB miss (page walk)","20 a 100 ns","4 acessos de tabela, amortecidos pelo cache"],["Cobertura do TLB (4 KB)","~6 MB","1.536 entradas vezes 4 KB"],["Cobertura com hugepages de 2 MB","GBs","Mesmas entradas, 512x mais alcance"]]',
                },
                {
                    type: "quote",
                    value: "Localidade paga duas vezes: o dado que você acabou de usar está no cache, e a tradução da página dele está no TLB. Espalhar acessos custa nas duas contas ao mesmo tempo.",
                },
                {
                    type: "text",
                    value: "## Por que a localidade ajuda duas vezes\n\nO TLB é a segunda razão para o conselho mais repetido de performance: acesse memória com localidade. Percorrer um array em sequência toca a mesma página 4 KB por vez: uma tradução serve 4.096 bytes, e o TLB quase não trabalha. Pular aleatoriamente por uma estrutura espalhada (uma lista ligada com nós soltos pelo heap, um hash gigante) troca de página a cada salto: cada acesso arrisca um miss de cache E um miss de TLB, e os dois custos se somam. É comum um algoritmo O(n) sequencial bater um O(log n) saltitante em dados grandes exatamente por essa dupla conta.\n\nQuando o conjunto de dados é grande demais, existe uma alavanca específica: hugepages, páginas de 2 MB (ou 1 GB) em vez de 4 KB. Cada entrada de TLB passa a cobrir 512 vezes mais memória, e a cobertura salta de megabytes para gigabytes. Bancos de dados como o PostgreSQL e JVMs de heap grande têm flags para isso, e o Linux tenta aplicar transparent hugepages sozinho quando consegue. O diagnóstico antes do remédio: perf stat -e dTLB-load-misses mostra se o TLB é mesmo o seu problema.",
                },
            ],
            questions: [
                {
                    statement: "O que o TLB armazena?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Traduções recentes de página virtual para moldura física",
                            isCorrect: true,
                        },
                        {
                            text: "As instruções mais executadas do programa em cada núcleo",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados das páginas mais acessadas, copiados da memória",
                            isCorrect: false,
                        },
                        {
                            text: "A lista de processos prontos ordenada pelo menor vruntime",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece num TLB miss?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O hardware caminha pelos níveis da tabela de páginas",
                            isCorrect: true,
                        },
                        {
                            text: "O processo recebe SIGSEGV por acessar página inválida",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel move a página inteira para um cache mais perto",
                            isCorrect: false,
                        },
                        {
                            text: "A instrução é cancelada e o escalonador troca a thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que percorrer um array em sequência quase não gera TLB miss?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Uma tradução cobre a página inteira: 4.096 bytes por entrada",
                            isCorrect: true,
                        },
                        {
                            text: "Arrays ficam numa região especial que dispensa a tradução",
                            isCorrect: false,
                        },
                        {
                            text: "O prefetcher desativa o TLB em acessos sequenciais longos",
                            isCorrect: false,
                        },
                        {
                            text: "O compilador converte os acessos em endereços físicos fixos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que as hugepages de 2 MB mudam na prática?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada entrada de TLB cobre 512x mais memória que com 4 KB",
                            isCorrect: true,
                        },
                        {
                            text: "A RAM passa a responder mais rápido por usar molduras largas",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel elimina os page faults nas regiões marcadas assim",
                            isCorrect: false,
                        },
                        {
                            text: "O espaço virtual do processo cresce de 48 para 57 bits úteis",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma lista ligada com nós espalhados pelo heap paga duas penalidades por salto?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Cada salto arrisca miss de cache e de TLB, custos somados",
                            isCorrect: true,
                        },
                        {
                            text: "Cada nó carrega dois ponteiros, dobrando o tráfego de memória",
                            isCorrect: false,
                        },
                        {
                            text: "O alocador trava um mutex global a cada nó que for visitado",
                            isCorrect: false,
                        },
                        {
                            text: "Listas ligadas forçam o kernel a criar tabela extra por nó",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Page fault e demand paging",
            blocks: [
                {
                    type: "text",
                    value: "# A falta que constrói\n\nPage fault soa como erro, mas é o mecanismo mais produtivo da memória virtual: a CPU tentou usar uma página cuja entrada diz não presente, o hardware levanta a exceção, e o kernel decide o que fazer. Se o acesso é legítimo, o kernel materializa a página e reexecuta a instrução como se nada tivesse acontecido; o processo nem fica sabendo. Só o acesso realmente inválido vira SIGSEGV.\n\nEm cima disso o Linux constrói o demand paging: quase nada é carregado antes da hora. Um executável de 80 MB não é lido inteiro no exec: o kernel apenas anota o mapeamento e cada página de código entra na RAM na primeira vez que é executada. Um malloc de 1 GB retorna na hora: você recebeu endereço virtual, e as molduras físicas só serão alocadas página a página, conforme a escrita acontecer. Os faults têm dois preços muito diferentes: o minor fault resolve sem tocar disco (só alocar moldura ou ajustar a tabela, alguns microssegundos) e o major fault precisa ler do disco (dezenas de µs num NVMe, milissegundos num HDD). O ps e o /usr/bin/time -v reportam os dois separados, e a diferença entre eles é a aula 4.",
                },
                {
                    type: "table",
                    value: '[["Tipo de fault","O que o kernel faz","Custo típico"],["Minor","Aloca moldura ou ajusta tabela; sem disco","1 a 5 µs"],["Major","Lê a página do disco antes de mapear","20 a 100 µs em NVMe; ms em HDD"],["Inválido","Nenhum conserto possível: envia SIGSEGV","Processo cai (ou trata o sinal)"]]',
                },
                {
                    type: "quote",
                    value: "O fork copia o mapa, não o território: pai e filho saem apontando para as mesmas molduras, e a cópia real só acontece, página a página, quando alguém escreve.",
                },
                {
                    type: "text",
                    value: "## Copy-on-write: o truque que barateia o fork\n\nO módulo 1 mostrou o fork duplicando um processo inteiro, e ficou devendo a explicação de por que isso não é caro. A resposta é copy-on-write (COW). No fork, o kernel não copia a memória: copia a tabela de páginas, faz pai e filho apontarem para as mesmas molduras físicas e marca tudo como somente leitura. Enquanto os dois apenas leem, compartilham tudo de graça. Quando um deles escreve numa página, o hardware dispara um fault de proteção, o kernel percebe que é COW, copia aquela página (4 KB, não gigabytes), dá a cópia privada a quem escreveu e libera a escrita. Um processo de 2 GB faz fork em milissegundos, e só paga cópia pelas páginas que realmente modificar.\n\nO mesmo princípio, geral, se chama alocação preguiçosa: o kernel promete e só entrega no uso. É por isso que existe a distância entre memória virtual (VSZ, o prometido) e memória residente (RSS, o entregue) que você vê no top: um processo com VSZ de 10 GB e RSS de 300 MB não está mentindo, está apenas cheio de promessas ainda não cobradas. Meça consumo real por RSS, nunca por VSZ.",
                },
            ],
            questions: [
                {
                    statement: "O que é um page fault legítimo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acesso a página válida ainda não presente; o kernel a materializa",
                            isCorrect: true,
                        },
                        {
                            text: "Acesso a endereço proibido, que encerra o processo com SIGSEGV",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de paridade na RAM detectado e corrigido pelo próprio hardware",
                            isCorrect: false,
                        },
                        {
                            text: "Tentativa de alocar mais memória do que o limite de VSZ permite",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre minor e major page fault?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Minor resolve sem disco; major precisa ler do disco",
                            isCorrect: true,
                        },
                        {
                            text: "Minor ocorre em leitura; major ocorre apenas em escrita",
                            isCorrect: false,
                        },
                        {
                            text: "Minor é tratado pela CPU; major é tratado pelo compilador",
                            isCorrect: false,
                        },
                        {
                            text: "Minor afeta uma página; major afeta o processo por inteiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um malloc de 1 GB retorna em microssegundos. O que realmente aconteceu?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Só o endereço virtual foi reservado; molduras chegam no uso",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel zerou 1 GB de RAM adiantado usando o DMA da placa",
                            isCorrect: false,
                        },
                        {
                            text: "A alocação veio inteira do swap, que é mais rápido de mapear",
                            isCorrect: false,
                        },
                        {
                            text: "O alocador devolveu memória de outro processo já encerrado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No copy-on-write do fork, quando uma página é de fato copiada?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Na primeira escrita: o fault de proteção aciona a cópia",
                            isCorrect: true,
                        },
                        {
                            text: "Na primeira leitura feita pelo processo filho após o fork",
                            isCorrect: false,
                        },
                        {
                            text: "Imediatamente no fork, mas em segundo plano pelo kernel",
                            isCorrect: false,
                        },
                        {
                            text: "Somente quando o filho chama exec para trocar de programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Um processo mostra VSZ de 10 GB e RSS de 300 MB. Como interpretar?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "10 GB prometidos no espaço virtual; 300 MB de fato na RAM",
                            isCorrect: true,
                        },
                        {
                            text: "Vazamento claro: 9,7 GB de memória já foram perdidos pelo heap",
                            isCorrect: false,
                        },
                        {
                            text: "O processo mantém 9,7 GB comprimidos e 300 MB descomprimidos",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de medição do top: VSZ nunca pode ser maior do que o RSS",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Swap e thrashing",
            blocks: [
                {
                    type: "text",
                    value: "# Quando a RAM acaba\n\nA memória virtual permite prometer mais do que existe, e uma hora a promessa é cobrada: a RAM enche. O kernel então despeja páginas para liberar espaço, escolhendo pelo critério de frieza: páginas não acessadas há mais tempo saem primeiro (a aproximação de LRU do Linux, guiada pelos bits de acessada que o hardware marca). Páginas de arquivo que não mudaram são simplesmente descartadas, dá para reler do disco; páginas anônimas (heap, stack) precisam ser escritas na área de swap antes de liberar a moldura.\n\nUsar swap não é doença: uma máquina saudável mantém no disco páginas realmente frias (aquela aba esquecida, o daemon que roda uma vez por dia) e usa a RAM ganha para cache de arquivo. O parâmetro vm.swappiness (0 a 200, padrão 60) regula o apetite por trocar páginas anônimas versus soltar cache. A doença tem outro nome e outra assinatura: é quando as páginas no swap não são frias, porque o conjunto de trabalho ativo dos processos, somado, não cabe na RAM. Aí cada página que sai é uma página que alguém vai pedir de volta em segundos, e começa o círculo vicioso da segunda metade da aula.",
                },
                {
                    type: "table",
                    value: '[["Sinal","Onde ver","Máquina saudável","Thrashing"],["si/so (swap in/out)","vmstat 1","Perto de zero","Milhares, contínuos"],["Major faults","ps, sar, /usr/bin/time -v","Raros após aquecer","Constantes em todo processo"],["iowait da CPU","top, coluna wa","Baixo","Alto com CPU user baixa"],["Latência percebida","Aplicação","Estável","Tudo demora; até o ssh engasga"]]',
                },
                {
                    type: "quote",
                    value: "No thrashing, todo mundo trabalha e nada anda: a máquina virou uma transportadora de páginas, ocupadíssima, com throughput útil de quase zero.",
                },
                {
                    type: "text",
                    value: "## Thrashing: o círculo vicioso\n\nA mecânica do colapso: o processo A precisa de uma página que está no swap; o kernel a traz, mas para isso despeja uma página quente do processo B; B roda e falta exatamente a página despejada; para trazê-la, sai uma quente de A. Cada passo custa um major fault, dezenas de microssegundos a milissegundos de disco, contra os 100 ns que um acesso à RAM custaria. A CPU aparece ociosa ou em iowait, o disco trabalha no limite, e o sistema inteiro anda na velocidade do swap. O nome descreve o som: thrashing, o debater-se de quem se afoga.\n\nAs saídas, em ordem de honestidade: reduzir o conjunto de trabalho (menos processos na máquina, menos cache na aplicação, menos abas), adicionar RAM, ou aceitar que a carga não cabe ali e movê-la. O Linux moderno tem dois amortecedores que valem conhecer: zswap comprime páginas antes de mandá-las ao disco, e o OOM killer, quando tudo falha, mata o processo de pior pontuação para salvar a máquina, o famoso exit code 137 dos contêineres estourando limite de memória. Kubernetes e Docker transformam essa física em política com limites de memória por contêiner: melhor um pod reiniciado que um nó inteiro se afogando.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual critério o kernel usa para escolher as páginas que saem da RAM?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "As mais frias: sem acesso há mais tempo, numa aproximação de LRU",
                            isCorrect: true,
                        },
                        {
                            text: "As maiores primeiro, para liberar mais espaço por operação feita",
                            isCorrect: false,
                        },
                        {
                            text: "As do processo mais novo, que ainda tem pouco estado acumulado",
                            isCorrect: false,
                        },
                        {
                            text: "Aleatórias, para distribuir o custo com justiça entre os processos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que caracteriza o thrashing?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O conjunto de trabalho não cabe na RAM e o swap gira sem parar",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer uso de swap, mesmo que as páginas trocadas estejam frias",
                            isCorrect: false,
                        },
                        {
                            text: "CPU em 100% de tempo de usuário com o disco praticamente parado",
                            isCorrect: false,
                        },
                        {
                            text: "Muitos processos zumbis acumulados esgotando a tabela de PIDs",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "No vmstat, qual assinatura aponta thrashing?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "si/so altos e contínuos com iowait alto e CPU útil baixa",
                            isCorrect: true,
                        },
                        {
                            text: "cs alto com si/so zerados e tempo de usuário dominando",
                            isCorrect: false,
                        },
                        {
                            text: "Memória livre alta com o número de processos crescendo",
                            isCorrect: false,
                        },
                        {
                            text: "Load average baixo com o disco ocioso na coluna de I/O",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que usar swap para páginas realmente frias é saudável?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Libera RAM de dados dormentes para trabalho e cache úteis",
                            isCorrect: true,
                        },
                        {
                            text: "O swap em disco responde tão rápido quanto a RAM nos NVMe",
                            isCorrect: false,
                        },
                        {
                            text: "Páginas no swap ficam imunes ao OOM killer e a corrupção",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel exige um mínimo de swap em uso para ligar o cache",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que limitar a memória de cada contêiner ajuda contra o thrashing do nó?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Um estourador é morto cedo, antes de afogar a máquina inteira",
                            isCorrect: true,
                        },
                        {
                            text: "O limite comprime a memória do contêiner e ela passa a caber",
                            isCorrect: false,
                        },
                        {
                            text: "Contêineres limitados ganham swap dedicado em disco separado",
                            isCorrect: false,
                        },
                        {
                            text: "O limite desliga o demand paging dentro daquele contêiner",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "mmap e memória compartilhada",
            blocks: [
                {
                    type: "text",
                    value: "# Arquivo com cara de memória\n\nO mmap fecha o módulo unindo tudo: ele mapeia um arquivo direto no espaço de endereços. Depois do mapeamento, não existe mais read nem write: você lê o arquivo indexando um ponteiro e escreve atribuindo a ele, e o demand paging faz o resto. Cada primeira visita a uma página do arquivo gera um fault, o kernel traz aquele pedaço do disco para o page cache e mapeia; páginas modificadas ficam sujas e o kernel as escreve de volta depois.\n\nA elegância está no que desaparece: a cópia dupla. No caminho read(), o dado vai do disco para o page cache do kernel e de lá é copiado para o seu buffer; com mmap, seu processo enxerga o próprio page cache, cópia nenhuma. Para acesso aleatório a arquivos grandes (um banco de dados consultando índices, um leitor de formato colunar pulando entre blocos) isso economiza memória e tempo. Não é bala de prata: para leitura sequencial única, o read tradicional com buffer costuma empatar ou ganhar (o kernel faz readahead agressivo nos dois casos), e cada página tocada via mmap continua pagando fault e TLB. Como sempre no módulo: meça.",
                },
                {
                    type: "code",
                    value: "#include <fcntl.h>\n#include <sys/mman.h>\n#include <unistd.h>\n\nint fd = open(\"dados.bin\", O_RDWR);\nsize_t tam = 1 << 30;   // 1 GB\n\nchar* p = (char*) mmap(NULL, tam, PROT_READ | PROT_WRITE,\n                       MAP_SHARED, fd, 0);\nclose(fd);              // o mapeamento sobrevive ao descritor\n\nchar c = p[500'000'000];  // primeira visita: fault traz a pagina\np[42] = 'X';              // escrever na memoria e escrever no arquivo\n\nmsync(p, tam, MS_SYNC);   // forca as paginas sujas para o disco\nmunmap(p, tam);",
                },
                {
                    type: "table",
                    value: '[["Escolha","O que significa","Consequência"],["MAP_SHARED","Escritas vão para o arquivo real","Outros processos veem as mudanças"],["MAP_PRIVATE","Escritas viram cópias COW privadas","O arquivo original fica intocado"],["MAP_ANONYMOUS","Sem arquivo por trás, memória pura","Base de alocadores e de shm entre pai e filho"],["read() clássico","Cópia do page cache para seu buffer","Simples; ótimo para sequencial único"]]',
                },
                {
                    type: "quote",
                    value: "MAP_SHARED entre dois processos é a memória compartilhada do módulo 1 com nome e sobrenome: as mesmas molduras físicas em duas tabelas, e nenhum byte copiado entre elas.",
                },
                {
                    type: "text",
                    value: "## Compartilhar entre processos, de verdade\n\nO mmap com MAP_SHARED é como a memória compartilhada do panorama de IPC se materializa. Dois processos que mapeiam o mesmo arquivo recebem, nas suas tabelas de páginas, as mesmas molduras físicas: uma escrita de um lado aparece do outro instantaneamente, porque não existem dois lados, existe uma única memória com dois nomes. Para compartilhar sem arquivo em disco, o shm_open cria um objeto de memória nomeado (vive em /dev/shm, um tmpfs) que os processos mapeiam do mesmo jeito.\n\nAs regras de concorrência voltam inteiras: dois processos escrevendo na mesma região compartilhada correm exatamente como duas threads, e a sincronização precisa morar dentro da própria região (mutexes e semáforos POSIX aceitam ser inicializados como compartilhados entre processos para isso). Os usos reais estão por toda parte: o PostgreSQL mantém seus buffers em memória compartilhada entre os backends; interpretadores e runtimes mapeiam seus binários e caches; sistemas de observabilidade exportam contadores por segmentos compartilhados. Quando alguém disser processo é isolado demais para compartilhar rápido, a resposta técnica é esta aula: isolamento é o padrão, não uma prisão.",
                },
            ],
            questions: [
                {
                    statement: "O que muda no acesso a um arquivo depois de um mmap bem-sucedido?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Ele passa a ser lido e escrito como memória, via ponteiro",
                            isCorrect: true,
                        },
                        {
                            text: "Ele é copiado inteiro para a RAM no momento da chamada",
                            isCorrect: false,
                        },
                        {
                            text: "Ele fica travado contra qualquer acesso de outros processos",
                            isCorrect: false,
                        },
                        {
                            text: "Ele passa a aceitar apenas leituras, nunca mais escritas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual cópia o mmap elimina em relação ao read() tradicional?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "A do page cache do kernel para o buffer do processo",
                            isCorrect: true,
                        },
                        {
                            text: "A do disco para o page cache mantido pelo kernel",
                            isCorrect: false,
                        },
                        {
                            text: "A do buffer do processo para os registradores da CPU",
                            isCorrect: false,
                        },
                        {
                            text: "A da RAM para o swap durante a pressão de memória",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre MAP_SHARED e MAP_PRIVATE para as escritas?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "SHARED altera o arquivo real; PRIVATE cria cópias COW privadas",
                            isCorrect: true,
                        },
                        {
                            text: "SHARED é atômico por página; PRIVATE exige mutex a cada escrita",
                            isCorrect: false,
                        },
                        {
                            text: "SHARED aceita vários processos; PRIVATE só o que criou o arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "SHARED grava direto no disco; PRIVATE grava apenas no page cache",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma escrita em região MAP_SHARED aparece instantaneamente para o outro processo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "As tabelas dos dois apontam para as mesmas molduras físicas",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel replica cada escrita para a cópia do outro processo",
                            isCorrect: false,
                        },
                        {
                            text: "Um daemon sincroniza as duas regiões a cada milissegundo",
                            isCorrect: false,
                        },
                        {
                            text: "A escrita passa pelo disco, que notifica os dois mapeamentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois processos escrevem na mesma região compartilhada. O que continua sendo necessário?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sincronização explícita, como nas threads: a corrida voltou",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: o kernel serializa escritas em regiões compartilhadas",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas alinhar as escritas ao tamanho de página de 4 KB",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar MAP_SHARED por MAP_PRIVATE nos momentos de escrita",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Arquivos e E/S",
    aulas: [
        {
            titulo: "Descritores",
            blocks: [
                {
                    type: "text",
                    value: "# Um inteiro para governar tudo\n\nQuando um processo abre um arquivo, o kernel devolve um descritor: um inteiro pequeno que serve de índice numa tabela por processo. A partir dali, toda operação (read, write, close) recebe esse número, e o kernel resolve o resto. Três descritores nascem abertos em todo processo: 0 é a entrada padrão, 1 a saída padrão, 2 a saída de erro, e é só por convenção que o shell os liga ao terminal.\n\nA ideia poderosa é a uniformidade: no Unix, quase tudo se apresenta como descritor. Arquivo, pipe, socket, dispositivo, e nas versões modernas do Linux até timers (timerfd), sinais (signalfd) e eventos entre threads (eventfd). O mesmo read que lê um arquivo lê um socket; o mesmo write escreve num pipe. Essa uniformidade é o que permite ao grep não saber nem se importar se sua entrada vem de um arquivo ou de um pipe, e é a fundação da multiplexação da aula 4: se tudo é descritor, uma única espera consegue vigiar fontes completamente diferentes de eventos com a mesma ferramenta.",
                },
                {
                    type: "table",
                    value: '[["Descritor","Convenção","O que pode ser por trás"],["0 (stdin)","Entrada padrão","Terminal, pipe, arquivo redirecionado"],["1 (stdout)","Saída padrão","Terminal, pipe, arquivo de log"],["2 (stderr)","Saída de erro","Terminal, mesmo com stdout desviado"],["3 em diante","O que o processo abrir","Arquivos, sockets, timers, eventos"]]',
                },
                {
                    type: "quote",
                    value: "O redirecionamento do shell não é truque de string: é cirurgia de tabela de descritores feita entre o fork e o exec, sem o programa redirecionado ficar sabendo.",
                },
                {
                    type: "text",
                    value: "## Herança no fork e a mágica do redirecionamento\n\nNo fork, o filho herda uma cópia da tabela de descritores do pai: os mesmos arquivos abertos, apontando para as mesmas entradas na tabela global de arquivos do kernel, inclusive compartilhando o offset de leitura. É essa herança que faz o redirecionamento funcionar: para executar ls > saida.txt, o shell faz fork, e o filho, antes do exec, abre saida.txt e usa dup2 para copiá-lo por cima do descritor 1. Quando o ls nasce, seu stdout já é o arquivo; ele imprime como sempre, sem saber de nada. O pipeline da aula 5 do módulo 1 é a mesma cirurgia com um pipe no lugar do arquivo.\n\nDescritores são recurso finito: o limite clássico é 1024 por processo (ulimit -n), elevável por configuração, e servidores de rede modernos rodam com centenas de milhares. Vazar descritores (abrir e nunca fechar) é o cousin do vazamento de memória: o processo funciona por horas e um dia morre com too many open files. Em C++, o mesmo RAII que fecha mutex fecha arquivo: um wrapper cujo destrutor chama close cobre todos os caminhos de saída, e a flag O_CLOEXEC evita que descritores vazem para dentro de programas executados via exec.",
                },
            ],
            questions: [
                {
                    statement: "O que é um descritor de arquivo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Um índice na tabela de arquivos abertos do processo",
                            isCorrect: true,
                        },
                        {
                            text: "O caminho absoluto do arquivo no sistema de arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "Um ponteiro direto para os dados do arquivo no disco",
                            isCorrect: false,
                        },
                        {
                            text: "O identificador global do arquivo, único na máquina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais descritores todo processo tem abertos por convenção ao nascer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "0 para entrada, 1 para saída e 2 para a saída de erro",
                            isCorrect: true,
                        },
                        {
                            text: "1 para entrada, 2 para saída e 3 para a saída de erro",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: o processo precisa abrir até o próprio terminal",
                            isCorrect: false,
                        },
                        {
                            text: "Um único descritor 0, que acumula entrada, saída e erro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o shell faz o stdout do ls virar o arquivo em ls > saida.txt?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "No filho, antes do exec, abre o arquivo e o dup2 sobre o fd 1",
                            isCorrect: true,
                        },
                        {
                            text: "Passa o nome do arquivo ao ls por uma variável de ambiente",
                            isCorrect: false,
                        },
                        {
                            text: "Intercepta cada printf do ls em tempo real e regrava no disco",
                            isCorrect: false,
                        },
                        {
                            text: "Monta o arquivo como terminal virtual e conecta o ls a ele",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a uniformidade tudo é descritor importa para ferramentas como o grep?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O mesmo read atende arquivo, pipe ou socket, sem código especial",
                            isCorrect: true,
                        },
                        {
                            text: "Ela permite ao grep abrir qualquer arquivo sem checar permissões",
                            isCorrect: false,
                        },
                        {
                            text: "Ela garante que o grep leia o disco sempre na velocidade máxima",
                            isCorrect: false,
                        },
                        {
                            text: "Ela faz o kernel indexar o conteúdo dos arquivos para a busca",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um servidor morre após horas com too many open files. Qual é o diagnóstico mais provável?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Vazamento de descritores: conexões ou arquivos nunca fechados",
                            isCorrect: true,
                        },
                        {
                            text: "O disco encheu e o kernel converteu o erro em limite de arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "A tabela global do kernel esgotou; nenhum processo abre mais nada",
                            isCorrect: false,
                        },
                        {
                            text: "Excesso de threads: cada thread consome um descritor por quantum",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Buffering",
            blocks: [
                {
                    type: "text",
                    value: "# As camadas entre o printf e o disco\n\nEntre o seu printf e os pratos do disco existem duas salas de espera. A primeira é o buffer da biblioteca C, dentro do seu processo: o printf acumula bytes num buffer (tipicamente 4 a 8 KB) e só chama write quando ele enche, quando aparece um \\n em modo linha, ou num fflush explícito. Existe para economizar syscalls: cada write custa centenas de nanossegundos de travessia ao kernel, e escrever byte a byte seria um desperdício brutal.\n\nA segunda sala é o page cache do kernel: o write copia seus bytes para lá e retorna imediatamente, e o kernel escreve no disco depois, em lotes, quando for conveniente (o writeback). É uma otimização excelente para throughput e péssima para quem não a conhece: o write retornou sucesso e o dado ainda não está em lugar nenhum que sobreviva a uma queda de energia. Entre o buffer da libc e o prato do disco há duas fronteiras a cruzar, e cada uma tem sua chamada: fflush cruza a primeira (processo para kernel), fsync cruza a segunda (kernel para o hardware, de verdade).",
                },
                {
                    type: "code",
                    value: '#include <cstdio>\n#include <unistd.h>\n\nFILE* f = fopen("log.txt", "w");\nfprintf(f, "linha importante\\n");  // 1: buffer da libc, no processo\n\nfflush(f);                         // 2: empurra para o page cache do kernel\nfsync(fileno(f));                  // 3: forca o kernel a gravar no disco\n\n// Sem o passo 2, o dado morre com o processo (crash do programa).\n// Sem o passo 3, o dado morre com a maquina (queda de energia).\n// Bancos de dados chamam fsync no commit por exatamente essa razao.',
                },
                {
                    type: "table",
                    value: '[["Camada","Onde vive","Quem esvazia","O que mata o dado aqui"],["Buffer da libc","Memória do processo","Encher, \\\\n em modo linha, fflush","Crash do processo"],["Page cache","Memória do kernel","Writeback periódico, fsync","Queda de energia, panic"],["Cache do disco","Controladora/SSD","fsync honesto atravessa","Energia, se o disco mentir"],["Mídia persistente","Pratos ou células flash","Já está seguro","Defeito físico"]]',
                },
                {
                    type: "quote",
                    value: "O write que retornou rápido é uma promessa do kernel, não um fato do disco. Quem precisa do fato chama fsync e paga o preço dele em milissegundos.",
                },
                {
                    type: "text",
                    value: "## Durabilidade custa caro, e é por isso que ela é rara\n\nO fsync num SSD NVMe custa tipicamente de 0,5 a 2 ms; num HDD, 5 a 20 ms. Compare com o write no page cache, alguns microssegundos: são três ordens de grandeza. Essa é a razão de o fsync ser a operação mais respeitada do mundo dos bancos de dados: o commit só confirma depois do fsync no log de transações (WAL), porque confirmar antes seria mentir sobre durabilidade. E é a razão de ninguém dar fsync em cada linha de log: um serviço que loga mil linhas por segundo com fsync linha a linha passa a viver para o disco.\n\nAs consequências práticas para o seu dia: logs que somem no crash geralmente estavam presos no buffer da libc (stderr é sem buffer por padrão; stdout para arquivo é bufferizado em bloco, e o clássico print que não aparece é isso). Ferramentas de cópia que terminam rápido demais deixaram tudo no page cache, e a energia caindo no minuto seguinte corrompe a festa. A escolha profissional é explícita: dados que não podem se perder recebem fsync no ponto de confirmação; o resto aceita a janela de writeback em troca de velocidade. O projeto do módulo 7 fecha exatamente essa decisão para um servidor de log.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o buffer da biblioteca C na escrita?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Acumular bytes e economizar chamadas de sistema caras",
                            isCorrect: true,
                        },
                        {
                            text: "Comprimir os dados antes de o kernel gravar no disco",
                            isCorrect: false,
                        },
                        {
                            text: "Proteger o arquivo contra escritas de outros processos",
                            isCorrect: false,
                        },
                        {
                            text: "Ordenar as linhas do arquivo por ordem de chegada real",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O write() retornou sucesso. Onde o dado está garantido de existir?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No page cache do kernel; o disco fica para depois",
                            isCorrect: true,
                        },
                        {
                            text: "Na mídia do disco, gravado de forma já permanente",
                            isCorrect: false,
                        },
                        {
                            text: "No buffer da libc, aguardando o próximo fflush",
                            isCorrect: false,
                        },
                        {
                            text: "Em nenhum lugar: o retorno só valida os argumentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre fflush e fsync?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "fflush leva do processo ao kernel; fsync leva do kernel ao disco",
                            isCorrect: true,
                        },
                        {
                            text: "fflush grava no disco; fsync apenas esvazia o buffer da biblioteca",
                            isCorrect: false,
                        },
                        {
                            text: "São sinônimos; fsync é o nome antigo da mesma chamada da libc",
                            isCorrect: false,
                        },
                        {
                            text: "fflush age no arquivo inteiro; fsync age numa única página suja",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um banco de dados chama fsync antes de confirmar o commit?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Confirmar sem fsync seria prometer durabilidade que não existe",
                            isCorrect: true,
                        },
                        {
                            text: "O fsync valida o checksum das páginas alteradas pela transação",
                            isCorrect: false,
                        },
                        {
                            text: "Sem fsync o kernel não permite novas escritas no mesmo arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O fsync notifica as réplicas de leitura sobre a transação nova",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um programa morre num crash e as últimas linhas de log somem, mas o write delas nem chegou a acontecer. Onde elas estavam?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "No buffer da libc, que morreu junto com o processo",
                            isCorrect: true,
                        },
                        {
                            text: "No page cache do kernel, descartado quando o PID sumiu",
                            isCorrect: false,
                        },
                        {
                            text: "Na fila do escalonador de E/S, cancelada pelo encerramento",
                            isCorrect: false,
                        },
                        {
                            text: "No cache da controladora do disco, que se perdeu sem energia",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Bloqueante vs não bloqueante",
            blocks: [
                {
                    type: "text",
                    value: "# O que a thread faz enquanto espera\n\nUm read num socket sem dados disponíveis é o retrato da E/S bloqueante: a thread entra no kernel, não encontra nada e dorme. Sai da fila de prontos, não gasta CPU nenhuma, e é acordada pela interrupção que anuncia a chegada dos dados. Bloquear não é ineficiência, é o mecanismo civilizado de esperar: a CPU fica livre para quem tem trabalho.\n\nO custo aparece na arquitetura, não no relógio: se cada conexão precisa de uma thread esperando nela, um servidor com 10 mil conexões precisa de 10 mil threads. Cada uma reserva stack (8 MB virtuais, dezenas de KB tocados), ocupa o escalonador e contribui para trocas de contexto. Funciona bem até alguns milhares; depois, a conta de memória e de trocas cresce mais rápido que o tráfego útil. Historicamente esse foi o problema C10K: como servir dez mil conexões simultâneas sem dez mil threads. A resposta tem duas partes, e esta aula traz a primeira: o modo não bloqueante, em que as chamadas de E/S nunca dormem. Com O_NONBLOCK ligado no descritor, um read sem dados retorna na hora com o erro EAGAIN, transferindo para você a decisão do que fazer enquanto isso.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","Bloqueante","Não bloqueante"],["read sem dados","Thread dorme até chegar","Retorna EAGAIN na hora"],["Uso de CPU na espera","Zero","Zero, se esperar direito (aula 4)"],["Threads para N conexões","N threads","Uma ou poucas threads"],["Complexidade do código","Linear, simples de ler","Máquina de estados, callbacks"],["Escala confortável","Centenas a poucos milhares","Dezenas a centenas de milhares"]]',
                },
                {
                    type: "quote",
                    value: "Não bloquear não é não esperar: é escolher onde a espera acontece. Quem espera girando em EAGAIN só trocou dormir de graça por queimar CPU.",
                },
                {
                    type: "text",
                    value: "## EAGAIN não é convite para girar\n\nA armadilha do modo não bloqueante é óbvia em retrospecto: se o read retorna EAGAIN e você o chama de novo imediatamente, num loop, criou um busy-wait de syscalls, queimando um núcleo inteiro para perguntar tem dado? milhões de vezes por segundo. É pior que bloquear: mesma espera, com conta de luz. O modo não bloqueante só faz sentido acompanhado de um mecanismo que avise quando vale a pena tentar, e esse mecanismo (select, poll, epoll) é a aula 4.\n\nVale mapear o meio-termo que o mundo real usa o tempo todo: threads bloqueantes em pool. Um servidor com 200 threads bloqueantes atendendo 200 requisições simultâneas é um desenho perfeitamente respeitável em 2026, simples de escrever e de depurar, e cobre a esmagadora maioria dos serviços internos, cujo limite real é o banco de dados, não o número de conexões. A escala extrema (gateways, proxies, chats com centenas de milhares de conexões ociosas) é que exige o modelo não bloqueante. Regra de bolso honesta: comece bloqueante e simples; migre para não bloqueante quando os números de conexões simultâneas mandarem, e não antes.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que acontece com uma thread num read bloqueante sem dados disponíveis?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dorme sem gastar CPU até os dados chegarem e a acordarem",
                            isCorrect: true,
                        },
                        {
                            text: "Gira dentro do kernel conferindo o socket a cada instante",
                            isCorrect: false,
                        },
                        {
                            text: "Recebe EAGAIN e precisa decidir sozinha quando reler o fd",
                            isCorrect: false,
                        },
                        {
                            text: "É encerrada por timeout depois de esperar alguns segundos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Com O_NONBLOCK ligado, o que um read sem dados retorna?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O erro EAGAIN, imediatamente, sem pôr a thread para dormir",
                            isCorrect: true,
                        },
                        {
                            text: "Zero bytes, o mesmo retorno usado para indicar fim de arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados parciais que o kernel conseguir inventar na hora",
                            isCorrect: false,
                        },
                        {
                            text: "Um descritor novo para acompanhar a chegada dos dados depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que uma thread por conexão deixa de escalar em dezenas de milhares de conexões?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Stacks e trocas de contexto crescem mais que o tráfego útil",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel do Linux impõe um teto fixo de 1024 threads por processo",
                            isCorrect: false,
                        },
                        {
                            text: "Threads bloqueadas continuam consumindo o quantum inteiro na fila",
                            isCorrect: false,
                        },
                        {
                            text: "Cada thread exige um núcleo físico dedicado enquanto estiver viva",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que reler um descritor em loop após cada EAGAIN é pior que bloquear?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É a mesma espera, agora queimando um núcleo em syscalls",
                            isCorrect: true,
                        },
                        {
                            text: "Cada EAGAIN invalida o descritor e força reabrir o socket",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel pune o processo baixando sua prioridade ao mínimo",
                            isCorrect: false,
                        },
                        {
                            text: "Os dados que chegarem durante o loop acabam descartados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um serviço interno atende 150 conexões simultâneas e o gargalo é o banco. Qual desenho faz mais sentido?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Pool de threads bloqueantes: simples e suficiente para a escala",
                            isCorrect: true,
                        },
                        {
                            text: "Epoll com uma thread: qualquer serviço abaixo disso desperdiça",
                            isCorrect: false,
                        },
                        {
                            text: "Uma thread não bloqueante por conexão, girando sobre o EAGAIN",
                            isCorrect: false,
                        },
                        {
                            text: "Um processo fork por requisição, herdando o socket do processo pai",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Multiplexação",
            blocks: [
                {
                    type: "text",
                    value: "# Uma thread, milhares de conexões\n\nA peça que faltava: um jeito de UMA thread esperar por muitos descritores ao mesmo tempo, dormindo até qualquer um deles ter novidade. É a multiplexação de E/S, e a história dela é uma aula de engenharia. O select (1983) recebe os conjuntos de descritores a vigiar e dorme até algum ficar pronto; a cada chamada, você repassa a lista inteira, o kernel varre tudo (O(n)) e o limite clássico é 1024 descritores. O poll remove o teto, mas mantém a varredura linear a cada chamada.\n\nO epoll, do Linux, muda a estrutura do problema: você registra os descritores de interesse uma vez (epoll_ctl), o kernel mantém essa lista, e cada epoll_wait devolve apenas os descritores prontos. Com 100 mil conexões ociosas e 200 ativas, o select varreria 100 mil a cada volta; o epoll entrega as 200. É a diferença entre O(n) por chamada e O(prontos), e foi ela que enterrou o problema C10K: em 2026, um único processo com epoll segura centenas de milhares de conexões, e o mesmo desenho existe em cada sistema (kqueue no BSD e macOS, IOCP no Windows).",
                },
                {
                    type: "code",
                    value: "// O esqueleto de um event loop com epoll, em pseudocodigo:\nepfd = epoll_create1()\nepoll_ctl(epfd, ADD, socket_escuta, EPOLLIN)\n\nloop:\n    eventos = epoll_wait(epfd)        // UNICO lugar que dorme\n    para cada ev em eventos:\n        se ev.fd == socket_escuta:\n            cliente = accept()\n            marca_nao_bloqueante(cliente)\n            epoll_ctl(epfd, ADD, cliente, EPOLLIN)\n        senao:\n            dados = read(ev.fd)       // pronto: nao vai bloquear\n            processa_rapido(dados)    // nunca demorar aqui dentro\n// nginx, Redis e todo event loop de runtime seguem este formato.",
                },
                {
                    type: "table",
                    value: '[["Mecanismo","Custo por espera","Limite prático","Situação em 2026"],["select","Varre todos: O(n)","1024 descritores","Legado; evite em código novo"],["poll","Varre todos: O(n)","Sem teto fixo","Aceitável para poucos fds"],["epoll","Devolve só os prontos","Centenas de milhares","Padrão no Linux"],["io_uring","Filas de submissão/conclusão","Além do epoll; E/S de arquivo","Crescendo; base de runtimes novos"]]',
                },
                {
                    type: "quote",
                    value: "O contrato do event loop tem uma cláusula dura: ninguém demora. Um handler que bloqueia por 200 ms atrasa as dez mil conexões da fila, e o loop inteiro vira refém do mais lento.",
                },
                {
                    type: "text",
                    value: "## O modelo e seu contrato\n\nO event loop resultante é o coração de meio mundo do software: nginx, Redis, HAProxy, os runtimes assíncronos das linguagens que você usa. O desenho força um contrato: os handlers precisam ser rápidos, porque tudo compartilha a mesma thread. Um handler que faz uma consulta lenta de forma síncrona bloqueia todas as conexões; por isso os event loops empurram trabalho pesado para pools de threads auxiliares, e por isso o Redis, single-threaded no comando, pede comandos curtos (um KEYS num banco grande trava todo mundo, e a documentação avisa).\n\nA fronteira em 2026: o io_uring leva a ideia adiante com duas filas compartilhadas entre processo e kernel (submissão e conclusão), reduzindo syscalls e cobrindo com eficiência também a E/S de arquivo, que o epoll nunca atendeu bem (arquivos regulares estão sempre prontos aos olhos dele; a espera real acontece no read). Runtimes e bancos vêm adotando, e a mecânica de filas prepara o terreno conceitual para o projeto do módulo 7. O critério de escolha permanece: epoll para rede em escala, io_uring quando arquivo e syscall importarem, e nenhum dos dois se um pool de threads simples já resolve o seu tamanho de problema.",
                },
            ],
            questions: [
                {
                    statement: "O que a multiplexação de E/S permite a uma única thread fazer?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dormir vigiando muitos descritores e acordar com os prontos",
                            isCorrect: true,
                        },
                        {
                            text: "Executar os handlers de várias conexões em paralelo real",
                            isCorrect: false,
                        },
                        {
                            text: "Ler vários arquivos diferentes com uma única chamada de read",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhar descritores com processos de outra máquina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual limitação clássica o select carrega?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Teto de 1024 descritores e varredura completa por chamada",
                            isCorrect: true,
                        },
                        {
                            text: "Funciona somente com sockets TCP, nunca com pipes locais",
                            isCorrect: false,
                        },
                        {
                            text: "Exige uma thread dedicada para cada descritor vigiado",
                            isCorrect: false,
                        },
                        {
                            text: "Só está disponível no Linux, sem equivalente nos demais",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com 100 mil conexões ociosas e 200 ativas, por que o epoll bate o select?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O epoll devolve só os 200 prontos; o select varre os 100 mil",
                            isCorrect: true,
                        },
                        {
                            text: "O epoll comprime as conexões ociosas e economiza memória de kernel",
                            isCorrect: false,
                        },
                        {
                            text: "O select acorda a cada milissegundo; o epoll dorme para sempre",
                            isCorrect: false,
                        },
                        {
                            text: "O epoll fecha sozinho as conexões ociosas depois de um tempo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que um handler lento é grave dentro de um event loop?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Tudo divide uma thread: o lento atrasa todas as conexões",
                            isCorrect: true,
                        },
                        {
                            text: "O epoll remove da lista os descritores de handlers lentos",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel converte o loop para select como forma de punição",
                            isCorrect: false,
                        },
                        {
                            text: "Handlers lentos estouram a stack da thread do event loop",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Que lacuna do epoll o io_uring veio cobrir melhor?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "E/S de arquivo regular e o custo de syscalls por operação",
                            isCorrect: true,
                        },
                        {
                            text: "Vigiar sockets TCP, que o epoll trata só em modo bloqueante",
                            isCorrect: false,
                        },
                        {
                            text: "Funcionar com mais de um núcleo, limite herdado do select",
                            isCorrect: false,
                        },
                        {
                            text: "Acordar handlers em ordem de prioridade definida pelo processo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "E/S domina o tempo",
            blocks: [
                {
                    type: "text",
                    value: "# Os números que todo dev deveria saber\n\nEsta aula é uma tabela e uma mudança de postura. Os números de latência do hardware têm ordens de grandeza tão diferentes que a intuição humana falha: 1 nanossegundo e 1 milissegundo parecem vizinhos na frase e são um milhão de vezes diferentes na física. Para calibrar, use a escala humana: se um acesso ao L1 (1 ns) durasse 1 segundo, um acesso à RAM (100 ns) levaria 2 minutos, uma leitura de NVMe (50 µs) levaria 14 horas, e uma ida e volta São Paulo-Virgínia (140 ms) levaria quatro anos e meio.\n\nA consequência prática tem nome: em quase todo sistema de informação, a E/S domina o tempo total, não a CPU. Um endpoint que gasta 200 µs de CPU e faz três consultas de 2 ms ao banco é 97% espera. Otimizar o código desse endpoint é polir a maçaneta de uma porta trancada: o ganho possível é o 3%. A postura profissional é pensar em E/S primeiro: contar as idas à rede e ao disco antes de contar instruções, e tratar cada ida como o item caro do orçamento.",
                },
                {
                    type: "table",
                    value: '[["Operação (2026)","Latência típica","Na escala 1 ns = 1 s"],["Cache L1","~1 ns","1 segundo"],["RAM","~100 ns","2 minutos"],["SSD NVMe, leitura 4K","20 a 100 µs","6 horas a 1 dia"],["HDD, seek","5 a 10 ms","2 a 4 meses"],["Rede no mesmo datacenter, ida e volta","~0,5 ms","6 dias"],["São Paulo a Virgínia, ida e volta","~140 ms","4,5 anos"]]',
                },
                {
                    type: "quote",
                    value: "Uma ida à rede custa o mesmo que centenas de milhares de instruções. A pergunta de performance quase nunca é como calcular mais rápido; é como ir menos vezes.",
                },
                {
                    type: "text",
                    value: "## Pensar em E/S primeiro\n\nCom a tabela na cabeça, as otimizações clássicas deixam de ser truques e viram aritmética. O problema N+1 (buscar uma lista e depois um item por elemento, 101 consultas onde cabiam 2) é trocar 2 viagens de milissegundos por 101: a correção, juntar em lote, vale 50 vezes mais que qualquer ajuste de CPU. Cache em memória local transforma 2 ms de banco em 100 ns de RAM: quatro ordens de grandeza, o maior multiplicador disponível na engenharia comum. Paralelizar três chamadas independentes de 100 ms transforma 300 ms somados no máximo delas. E o batching de escrita, que o buffering da aula 2 já mostrou, amortiza o custo fixo de cada ida.\n\nO fechamento do módulo é o hábito: diante de qualquer lentidão, pergunte primeiro quantas idas a disco e rede este caminho faz, e quanto custa cada uma, antes de abrir o profiler de CPU. Os números desta tabela mudam devagar (a latência da luz não negocia; a do NVMe cai aos poucos), mas as proporções entre as camadas persistem há décadas, e são as proporções que sustentam o raciocínio. No projeto do módulo 7, elas decidem o desenho inteiro do servidor de log: a E/S no centro, o resto ao redor.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quantas ordens de grandeza separam um acesso à RAM de uma ida e volta na rede do datacenter?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Milhares de vezes: ~100 ns contra ~0,5 ms de ida e volta",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca de dez vezes: ~100 ns contra perto de 1 µs de rede",
                            isCorrect: false,
                        },
                        {
                            text: "São praticamente iguais nos datacenters modernos de 2026",
                            isCorrect: false,
                        },
                        {
                            text: "Um milhão de vezes: ~100 ns contra 100 s de rede interna",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um endpoint gasta 200 µs de CPU e 6 ms esperando o banco. Onde está o ganho real?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Em reduzir as idas ao banco: a espera é 97% do tempo",
                            isCorrect: true,
                        },
                        {
                            text: "Em vetorizar o código, que domina o custo do endpoint",
                            isCorrect: false,
                        },
                        {
                            text: "Em subir a prioridade do processo no escalonador do nó",
                            isCorrect: false,
                        },
                        {
                            text: "Em trocar a linguagem por uma com compilador mais novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o problema N+1 de consultas é tão caro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Cada consulta paga uma viagem de rede; N+1 multiplica esse custo",
                            isCorrect: true,
                        },
                        {
                            text: "O banco bloqueia a tabela inteira a cada consulta repetida do lote",
                            isCorrect: false,
                        },
                        {
                            text: "As N consultas extras invalidam o cache do banco a cada execução",
                            isCorrect: false,
                        },
                        {
                            text: "O driver reabre a conexão do zero a cada consulta da sequência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que ganho um cache em RAM local traz sobre uma consulta de 2 ms ao banco?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Quatro ordens de grandeza: de milissegundos para ~100 ns",
                            isCorrect: true,
                        },
                        {
                            text: "Cerca do dobro: a rede continua sendo paga na consulta local",
                            isCorrect: false,
                        },
                        {
                            text: "Dez por cento, pois a serialização domina o custo do acesso",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum: RAM e banco respondem na mesma faixa de latência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Três chamadas independentes de 100 ms cada, em sequência, somam 300 ms. O que a paralelização muda?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O total cai para perto do máximo delas: cerca de 100 ms",
                            isCorrect: true,
                        },
                        {
                            text: "Nada: latência de rede não se paraleliza entre chamadas",
                            isCorrect: false,
                        },
                        {
                            text: "O total cai para 150 ms, o teto teórico de duas por vez",
                            isCorrect: false,
                        },
                        {
                            text: "O total dobra: o overhead de threads supera o ganho aqui",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Projeto: um servidor de log concorrente no papel (leitura guiada)",
    aulas: [
        {
            titulo: "Requisitos e riscos",
            blocks: [
                {
                    type: "text",
                    value: "# O problema em uma frase\n\nO projeto que fecha a trilha é deliberadamente pequeno no enunciado e cheio de armadilhas no meio: um servidor em que N threads de trabalho (as que atendem requisições) produzem linhas de log, e tudo precisa terminar num único arquivo, em ordem razoável, sem linhas picotadas e sem perder nada no desligamento. É o problema de concorrência mais comum do mundo real: muitos produtores, um recurso destino.\n\nOs requisitos, escritos como um contrato: cada linha aparece inteira no arquivo (atomicidade de linha); logar precisa ser barato para quem loga, microssegundos, porque acontece no caminho quente das requisições; a ordem entre linhas da mesma thread se preserva; um pico de tráfego não pode derrubar o processo por memória; e o SIGTERM do orquestrador resulta em arquivo completo, com tudo que foi logado até ali. Note o que NÃO está no contrato: ordem global perfeita entre threads (custaria caro e não vale o preço para log) e durabilidade por linha via fsync (o módulo 6 mostrou que seria pagar milissegundos por linha). Requisito de menos é tão perigoso quanto de mais: escrever esse contrato antes do código é o primeiro entregável do projeto.",
                },
                {
                    type: "table",
                    value: '[["Risco de corrida","Onde nasce","Sintoma em produção"],["Linhas entrelaçadas","Dois writes simultâneos no mesmo fd","Log ilegível, parser quebrando"],["Linhas perdidas no fim","Buffers não drenados no SIGTERM","O minuto do crash some do arquivo"],["Latência no caminho quente","Produtor esperando E/S de disco","p99 das requisições degrada"],["Memória sem teto","Fila crescendo mais que o consumo","OOM kill no pico, exit 137"],["Contadores errados","Métricas somadas sem atomics","Dashboards mentindo com convicção"]]',
                },
                {
                    type: "quote",
                    value: "Todo requisito de concorrência esquecido vira uma corrida descoberta em produção. O papel é o lugar barato de achar essas corridas; o pager é o caro.",
                },
                {
                    type: "text",
                    value: "## O inventário das corridas\n\nCom o contrato na mão, o exercício é listar onde a concorrência morde, e a trilha inteira vira lente de leitura. O arquivo é um recurso único: writes de threads diferentes no mesmo descritor podem se entrelaçar (módulo 6), e linha picotada é a primeira corrida. Buffers da libc por thread esvaziam em momentos imprevisíveis e embaralham tudo. O contador de linhas escritas e de bytes, se for um long comum, perde incrementos como o contador do módulo 2. A rotação do arquivo (fechar o atual, abrir o próximo) no meio de escritas alheias é uma corrida de descritor. E o desligamento é a corrida mestra: SIGTERM chega num handler restrito (módulo 1), threads estão no meio de trabalho, e o que estiver só em memória evapora se a sequência de parada não drenar tudo.\n\nEsse inventário decide o desenho. Não se resolve cada corrida com um band-aid local: escolhe-se uma arquitetura que elimine classes inteiras delas de uma vez. É o assunto da próxima aula, e a resposta tem uma peça no centro que você já construiu neste curso.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a forma geral do problema do servidor de log?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Muitos produtores concorrendo por um único recurso destino",
                            isCorrect: true,
                        },
                        {
                            text: "Um produtor lento alimentando muitos consumidores rápidos",
                            isCorrect: false,
                        },
                        {
                            text: "Dois processos disputando a mesma região de memória mapeada",
                            isCorrect: false,
                        },
                        {
                            text: "Uma thread única saturada por excesso de E/S de rede pendente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que logar precisa custar microssegundos para as threads de trabalho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "O log roda no caminho quente e não pode atrasar as requisições",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel descarta linhas de processos que logam devagar demais",
                            isCorrect: false,
                        },
                        {
                            text: "Logs mais rápidos consomem menos espaço final em disco no dia",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo trava se uma escrita levar mais de um milissegundo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a ordem global perfeita entre threads ficou fora do contrato?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Custaria sincronização cara demais para o valor que traz num log",
                            isCorrect: true,
                        },
                        {
                            text: "É impossível em qualquer sistema com mais de um núcleo físico",
                            isCorrect: false,
                        },
                        {
                            text: "O formato de log não tem campo capaz de expressar ordenação",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem global exigiria fsync a cada linha, e o disco não aceita",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual corrida explica linhas picotadas e misturadas no arquivo final?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Writes simultâneos de threads diferentes no mesmo descritor",
                            isCorrect: true,
                        },
                        {
                            text: "O escalonador executando as threads fora da ordem de criação",
                            isCorrect: false,
                        },
                        {
                            text: "O page cache reordenando os blocos antes de gravar no disco",
                            isCorrect: false,
                        },
                        {
                            text: "A rotação do arquivo acontecendo sempre no mesmo horário fixo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que fsync a cada linha foi descartado desde o contrato?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Milissegundos por linha fariam o log dominar o tempo do serviço",
                            isCorrect: true,
                        },
                        {
                            text: "O fsync por linha corrompe o arquivo quando há vários produtores",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel ignora fsyncs repetidos no mesmo arquivo por proteção",
                            isCorrect: false,
                        },
                        {
                            text: "SSDs modernos proíbem sincronizações menores que uma página",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A fila no centro",
            blocks: [
                {
                    type: "text",
                    value: "# Uma dona para o arquivo, uma fila na fronteira\n\nO desenho que elimina classes inteiras de corrida: as N threads de trabalho não tocam o arquivo. Elas formatam a linha e a depositam numa fila thread-safe (a do módulo 3, com limite de capacidade); uma única thread escritora consome a fila e é a única no processo inteiro que escreve no descritor. Linhas entrelaçadas: impossíveis, só existe uma escritora. Rotação de arquivo: trivial, a dona fecha e abre sem disputar com ninguém. Custo para o produtor: um push com mutex e condvar, na casa de poucos microssegundos, sem nenhuma E/S no caminho quente.\n\nEsse padrão tem nome de princípio: confinamento. Em vez de proteger o recurso com um cadeado que todo mundo pega (compartilhar o arquivo), confina-se o recurso a uma única thread e transforma-se todo acesso em mensagem para ela. A sincronização fica concentrada num único ponto já resolvido e testado, a fila, e o restante do código nem sabe que concorrência existe. A escritora ainda ganha um bônus de performance: consumindo em rajadas, ela agrupa dezenas de linhas num único write (batching do módulo 6), amortizando a syscall.",
                },
                {
                    type: "code",
                    value: "FilaSegura<std::string> fila(64 * 1024);   // limitada: modulo 3 + aula 3\n\nvoid thread_de_trabalho() {                // N produtores\n    // ...atende a requisicao...\n    fila.push(formata_linha(evento));      // microssegundos, sem E/S\n}\n\nvoid escritora() {                         // UNICA dona do arquivo\n    std::string lote;\n    while (auto linha = fila.pop()) {      // dorme se nao ha nada\n        lote += *linha;\n        lote += '\\n';\n        if (lote.size() >= 64 * 1024 || fila.vazia())\n            escreve(fd, lote), lote.clear();   // write em rajada\n    }\n    if (!lote.empty()) escreve(fd, lote);  // resto final (aula 4)\n}",
                },
                {
                    type: "table",
                    value: '[["Alternativa","Como funciona","Por que perde"],["Mutex no write","Cada thread trava e escreve","E/S de ms dentro do lock serializa o caminho quente"],["Um arquivo por thread","N arquivos, juntar depois","Ordem e leitura viram problema; N fsyncs no fim"],["stdio sem nada","Cada thread dá fprintf","Entrelaçamento e buffers imprevisíveis"],["Fila e escritora única","Produtores enfileiram; uma escreve","É o desenho escolhido"]]',
                },
                {
                    type: "quote",
                    value: "Quando um recurso tem uma única dona, metade das corridas do inventário morre por construção, sem um lock sequer no caminho de quem produz. Confinar é mais barato que coordenar.",
                },
                {
                    type: "text",
                    value: "## Por que não as alternativas\n\nVale enterrar as alternativas com números. Mutex em volta do write: cada thread de trabalho pagaria, sob o cadeado, a latência da syscall e às vezes do disco; com dez threads logando forte, forma-se um comboio atrás de cada escrita lenta, exatamente o erro nunca E/S segurando mutex do módulo 2. Um arquivo por thread parece esperto até o primeiro incidente: quem investiga precisa intercalar N arquivos por timestamp para reconstruir a história, a rotação multiplica por N, e o custo se paga todo dia para economizar uma fila. O fprintf direto sem coordenação é o caos do inventário da aula 1.\n\nA fila com escritora única concentra os custos onde eles são baratos: o produtor paga nanossegundos a microssegundos; a escritora, que já vive no mundo lento da E/S, absorve as rajadas. Sobra uma pergunta honesta, e ela é a diferença entre um desenho de brinquedo e um de produção: o que acontece quando a fila enche? Essa decisão, backpressure, é importante o suficiente para ter uma aula inteira, a próxima.",
                },
            ],
            questions: [
                {
                    statement: "No desenho escolhido, quem escreve no arquivo de log?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Somente a thread escritora, única dona do descritor",
                            isCorrect: true,
                        },
                        {
                            text: "Qualquer thread, desde que segure o mutex do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel, que serializa writes de todas as threads",
                            isCorrect: false,
                        },
                        {
                            text: "Cada thread de trabalho, no próprio arquivo separado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a thread de trabalho faz para logar, nesse desenho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Formata a linha e a deposita na fila, sem nenhuma E/S",
                            isCorrect: true,
                        },
                        {
                            text: "Escreve direto no arquivo e sinaliza a escritora depois",
                            isCorrect: false,
                        },
                        {
                            text: "Grava a linha num buffer do kernel via chamada especial",
                            isCorrect: false,
                        },
                        {
                            text: "Envia a linha por socket para um processo coletor externo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que o mutex em volta do write perde para a fila com escritora única?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "E/S de milissegundos dentro do lock enfileira os produtores",
                            isCorrect: true,
                        },
                        {
                            text: "Mutexes não podem proteger chamadas de sistema no Linux",
                            isCorrect: false,
                        },
                        {
                            text: "O mutex obriga cada linha a passar por fsync antes do unlock",
                            isCorrect: false,
                        },
                        {
                            text: "Com mutex, o arquivo precisa reabrir a cada troca de thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Que princípio o desenho aplica ao dar o arquivo a uma única thread?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Confinamento: uma thread é dona; as outras enviam mensagens",
                            isCorrect: true,
                        },
                        {
                            text: "Replicação: cada thread mantém uma cópia do recurso sincronizada depois",
                            isCorrect: false,
                        },
                        {
                            text: "Preempção: a dona do arquivo toma a CPU das produtoras quando precisa",
                            isCorrect: false,
                        },
                        {
                            text: "Particionamento: o arquivo é dividido em regiões fixas, uma por thread",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como a escritora amortiza o custo das syscalls de escrita?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Agrupa dezenas de linhas num write só, consumindo em rajada",
                            isCorrect: true,
                        },
                        {
                            text: "Usa um write especial do kernel que dispensa a troca de modo",
                            isCorrect: false,
                        },
                        {
                            text: "Escreve apenas quando o arquivo é rotacionado pelo operador",
                            isCorrect: false,
                        },
                        {
                            text: "Mantém o descritor em modo não bloqueante com retry infinito",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Backpressure",
            blocks: [
                {
                    type: "text",
                    value: "# Quando a fila enche\n\nToda fila limitada tem um momento da verdade: produtores mais rápidos que a consumidora, capacidade esgotada, e um push chegando. Não existe resposta indolor, existe escolha de qual dor aceitar, e ela tem três formas. Bloquear: o push espera vaga, nada se perde, e a lentidão do disco se propaga para trás, freando as threads de trabalho (é o backpressure literal: a pressão volta). Descartar: o push falha ou joga fora o mais antigo, o caminho quente segue rápido, e informação se perde. Amostrar ou agregar: descartar com critério, mantendo 1 em cada N linhas repetidas ou um contador do que foi suprimido.\n\nA escolha errada é não escolher: fila sem limite. Ela transforma qualquer desequilíbrio sustentado em crescimento de memória sem teto, e o processo morre de OOM no pior momento possível, o pico, levando junto os logs que explicariam o pico. O limite da fila não é um detalhe de implementação: é a declaração explícita de quanto atraso de log o sistema tolera guardar em memória antes de tomar uma atitude.",
                },
                {
                    type: "table",
                    value: '[["Política","O que preserva","O que sacrifica","Use para"],["Bloquear o produtor","Todas as linhas","Latência do caminho quente","ERROR e auditoria"],["Descartar novos","Latência e memória","As linhas do pico","DEBUG e INFO verboso"],["Descartar antigos","As linhas recentes","O começo da história","Telemetria de estado atual"],["Amostrar/agregar","Um resumo honesto","O detalhe linha a linha","Eventos repetitivos em massa"]]',
                },
                {
                    type: "quote",
                    value: "Fila sem teto não é generosidade: é um OOM agendado para a hora do pico, com direito a levar junto os logs que explicariam o incidente.",
                },
                {
                    type: "text",
                    value: "## O critério por tipo de log\n\nA sofisticação que o projeto pede não é uma política, é uma política por classe de mensagem, porque o valor de cada linha é diferente. Logs de ERROR e de auditoria não podem se perder: para eles, bloquear o produtor é aceitável e correto, porque erro é raro (se ERROR está enchendo a fila, o log é o menor dos seus problemas) e o custo de bloquear quase nunca é pago. DEBUG e INFO verboso são o oposto: valem pouco individualmente, chegam em massa, e descartá-los sob pressão com um contador de suprimidos é a escolha adulta. O contador é inegociável: descarte silencioso é mentira por omissão; uma linha dropped 12843 debug lines conta a verdade barato.\n\nRepare que a mesma decisão aparece em cada sistema com fila que você encontrar: brokers de mensagens com retenção e descarte, proxies com limites de buffer, roteadores de rede jogando pacotes fora, APIs respondendo 429 para o cliente reduzir o ritmo. Backpressure é o mecanismo pelo qual um sistema finito diz a verdade sobre a própria capacidade. No nosso servidor, o push da fila ganha duas variantes: push que bloqueia (para as classes preciosas) e try_push que retorna falso e incrementa o contador (para as descartáveis).",
                },
            ],
            questions: [
                {
                    statement: "Quais são as três respostas possíveis para a fila cheia?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Bloquear o produtor, descartar linhas ou amostrar/agregar",
                            isCorrect: true,
                        },
                        {
                            text: "Crescer a fila, comprimir as linhas ou duplicar a escritora",
                            isCorrect: false,
                        },
                        {
                            text: "Reiniciar o processo, trocar o disco ou desligar o logging",
                            isCorrect: false,
                        },
                        {
                            text: "Priorizar a escritora, migrar de CPU ou dobrar o quantum dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é o problema da fila sem limite de tamanho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Desequilíbrio sustentado vira memória sem teto e OOM no pico",
                            isCorrect: true,
                        },
                        {
                            text: "O mutex interno da fila deixa de funcionar acima de um milhão",
                            isCorrect: false,
                        },
                        {
                            text: "A condvar perde notificações quando a fila passa da capacidade",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel limita filas de usuário a 64 KB e trunca o excedente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que bloquear o produtor é aceitável para logs de ERROR?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Erro é raro e valioso: quase nunca bloqueia, e nada se perde",
                            isCorrect: true,
                        },
                        {
                            text: "Linhas de ERROR são pequenas e nunca chegam a encher fila alguma",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel prioriza threads bloqueadas em push de mensagens de erro",
                            isCorrect: false,
                        },
                        {
                            text: "Bloquear em ERROR força o fsync imediato, garantindo durabilidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ao descartar DEBUG sob pressão, por que o contador de suprimidos é obrigatório?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Descarte silencioso mente por omissão; o contador conta a verdade",
                            isCorrect: true,
                        },
                        {
                            text: "Sem o contador a fila não sabe quando pode voltar a aceitar linhas",
                            isCorrect: false,
                        },
                        {
                            text: "O contador reserva espaço na fila para os descartes do próximo pico",
                            isCorrect: false,
                        },
                        {
                            text: "Auditores externos exigem contadores para qualquer log em produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um broker que descarta por retenção e uma API que responde 429 têm o que em comum com a nossa fila?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Backpressure: sistemas finitos declarando sua capacidade real",
                            isCorrect: true,
                        },
                        {
                            text: "Confinamento: um único dono para cada recurso compartilhado",
                            isCorrect: false,
                        },
                        {
                            text: "Copy-on-write: só materializam o dado quando alguém escreve",
                            isCorrect: false,
                        },
                        {
                            text: "Aging: a prioridade das mensagens cresce com o tempo de espera",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Shutdown limpo",
            blocks: [
                {
                    type: "text",
                    value: "# Os últimos cinco segundos\n\nO orquestrador manda SIGTERM e o relógio começa a correr: em geral dez segundos até o SIGKILL (módulo 1). O que acontece nesse intervalo separa o servidor que perde o final da história do que entrega o arquivo completo. E o final da história é exatamente a parte que mais importa: se o processo está sendo desligado por causa de um incidente, as últimas linhas são as que explicam tudo.\n\nA sequência correta usa cada módulo da trilha na ordem. O handler de SIGTERM faz o mínimo async-signal-safe: marca a flag atômica de parada. O loop principal vê a flag e inicia a coreografia: primeiro avisa as threads de trabalho para concluírem a requisição atual e não aceitarem novas; espera cada uma com join, garantindo que ninguém mais vai produzir; então chama fila.fecha(), o mecanismo do módulo 3, e a partir daqui o pop da escritora continua entregando o que já estava na fila e devolve vazio quando ela secar de verdade. A escritora drena tudo, escreve o último lote, chama fsync uma única vez (a durabilidade do módulo 6, no único momento em que ela vale o preço) e retorna. O main dá join na escritora e sai com exit(0).",
                },
                {
                    type: "code",
                    value: "// A coreografia do desligamento, em pseudocodigo:\n// (handler de SIGTERM ja rodou: parar = true, nada alem disso)\n\nprincipal:\n    avisa_trabalhadoras()          // parem de aceitar trabalho novo\n    para cada trabalhadora: join() // terminam a requisicao atual\n    fila.fecha()                   // ninguem mais entra; drenagem segue\n    join(escritora)                // ela seca a fila e retorna\n    exit(0)\n\nescritora:\n    while (auto linha = fila.pop())    // recebe ate a fila secar\n        acumula_e_escreve(linha)\n    escreve(fd, lote_final)            // o resto do buffer proprio\n    fsync(fd)                          // UMA vez, no fim: agora e fato\n// Ordem importa: fechar a fila antes dos joins das produtoras\n// arriscaria push em fila fechada; drenar antes de fsync e obvio\n// escrito assim, e raro de acertar de improviso as tres da manha.",
                },
                {
                    type: "table",
                    value: '[["Passo","Ferramenta usada","Módulo de origem"],["Handler marca flag atômica","signal + atomic<bool>","Módulos 1 e 3"],["Trabalhadoras terminam e join","std::thread::join","Módulo 2"],["Fila fecha e drena","fecha() + pop com optional","Módulo 3"],["Último lote e fsync único","write em rajada + fsync","Módulo 6"],["Prazo antes do SIGKILL","Drenagem com limite de tempo","Módulos 1 e 4"]]',
                },
                {
                    type: "quote",
                    value: "Shutdown limpo é um protocolo com ordem: parar de produzir, esperar produtores, fechar a fila, drenar, sincronizar, sair. Cada passo fora de ordem é uma classe de linhas perdidas.",
                },
                {
                    type: "text",
                    value: "## O plano B do prazo\n\nFalta a cláusula realista: e se a drenagem não couber no prazo? Uma fila de 64 mil linhas com um disco momentaneamente lento pode não escoar em dez segundos. O desenho adulto põe um limite de tempo na drenagem: a escritora drena com um olho no relógio e, faltando uma margem (digamos, dois segundos), para de esperar a fila secar, escreve o que tem, registra uma linha honesta (shutdown com fila não drenada: N linhas ficaram) e faz o fsync do que conseguiu. Perder N linhas anunciadas é incomparavelmente melhor que o SIGKILL levar tudo que estava em memória, incluindo a informação de que algo se perdeu.\n\nDois detalhes de produção fecham a aula. Primeiro: teste o shutdown como se testa o caminho feliz, mandando SIGTERM no meio de carga sintética e conferindo o arquivo; desligamento é a funcionalidade menos testada e mais executada do mundo. Segundo: o mesmo protocolo serve para a rotação de log (fechar arquivo, abrir novo) e para o reload de configuração, que são desligamentos parciais. Quem domina a coreografia de parar domina também as de pausar e trocar de marcha.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o papel do handler de SIGTERM no desligamento limpo?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Só marcar a flag atômica; a coreografia roda fora dele",
                            isCorrect: true,
                        },
                        {
                            text: "Drenar a fila inteira antes de o processo perder a CPU",
                            isCorrect: false,
                        },
                        {
                            text: "Chamar fsync imediatamente para não perder o que há em RAM",
                            isCorrect: false,
                        },
                        {
                            text: "Dar join em todas as threads antes de o sinal ser retornado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a fila só é fechada depois do join nas threads de trabalho?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Para garantir que ninguém tente push numa fila já fechada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o fecha() bloqueia até todas as threads terminarem",
                            isCorrect: false,
                        },
                        {
                            text: "Para a escritora ganhar prioridade no escalonador primeiro",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o join falha quando existe fila fechada no processo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que o fsync acontece uma única vez, no final da drenagem?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "É o único ponto em que a durabilidade vale seus milissegundos",
                            isCorrect: true,
                        },
                        {
                            text: "O kernel só aceita um fsync por descritor durante o desligamento",
                            isCorrect: false,
                        },
                        {
                            text: "Chamar antes esvaziaria a fila sem escrever o conteúdo restante",
                            isCorrect: false,
                        },
                        {
                            text: "O fsync fecha o arquivo, então só pode acontecer no último passo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a escritora faz quando a drenagem não vai caber no prazo do SIGKILL?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escreve o que tem, registra quantas linhas ficaram e sincroniza",
                            isCorrect: true,
                        },
                        {
                            text: "Ignora o prazo: o orquestrador espera enquanto houver drenagem",
                            isCorrect: false,
                        },
                        {
                            text: "Move a fila restante para o swap e sai imediatamente do processo",
                            isCorrect: false,
                        },
                        {
                            text: "Reabre a fila para os produtores enquanto o disco não acelera",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Depois do fila.fecha(), o que o pop() da escritora devolve?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os itens restantes até secar; depois, o vazio que a encerra",
                            isCorrect: true,
                        },
                        {
                            text: "Vazio imediatamente: fechar a fila descarta o que ainda havia",
                            isCorrect: false,
                        },
                        {
                            text: "Uma exceção de fila fechada, capturada pelo loop da escritora",
                            isCorrect: false,
                        },
                        {
                            text: "Os itens em ordem invertida, para priorizar as linhas recentes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento",
            blocks: [
                {
                    type: "text",
                    value: "# O mapa de decisões de concorrência\n\nO servidor de log ficou pequeno de propósito: cada decisão dele é um padrão que você vai reusar pelo resto da carreira. Vale destilar o mapa. Primeira pergunta diante de qualquer problema concorrente: dá para compartilhar menos? Dado imutável não tem corrida; dado que cada thread possui sozinha (como os slots r1 e r2 do módulo 2) também não. A melhor sincronização é a que o desenho tornou desnecessária.\n\nSegunda pergunta: o que precisa mesmo ser compartilhado tem um dono natural? Confinar o recurso a uma thread e conversar por fila transforma concorrência em mensagens, e mensagens são raciocináveis: foi o coração do projeto. Terceira: sobrou estado genuinamente compartilhado? Escolha a ferramenta pelo tamanho da invariante: uma variável e uma operação, atomic; uma estrutura com consistência interna, mutex com RAII e seções curtas; espera por condição, condvar com predicado; contagem de recursos, semáforo. E quarta: onde dois domínios se encontram, uma fila com limite e política de cheia explícita é a fronteira honesta, com o desligamento fazendo parte do contrato desde o primeiro dia.",
                },
                {
                    type: "table",
                    value: '[["Situação","Primeira escolha","Por quê"],["Dado que não muda","Imutabilidade","Sem escrita, sem corrida"],["Cada thread com sua parte","Posse exclusiva por thread","Agrega no fim, sem locks no caminho"],["Recurso único (arquivo, conexão)","Confinamento + fila","Um dono; o resto envia mensagens"],["Contador ou flag","atomic","Uma variável, uma operação"],["Invariante multi-variável","Mutex RAII, seção curta","Consistência exige exclusão"],["Fronteira entre domínios","Fila limitada com política","Backpressure declara a capacidade"]]',
                },
                {
                    type: "quote",
                    value: "Concorrência boa raramente parece esperta: parece um desenho em que quase nada se compartilha, o pouco compartilhado tem dono claro, e as fronteiras dizem a verdade sobre seus limites.",
                },
                {
                    type: "text",
                    value: "## O que levar daqui\n\nO trajeto completo: processos e seu isolamento, threads e a corrida que a memória compartilhada cobra, o arsenal de sincronização do mutex ao semáforo, o escalonador que reparte a CPU com justiça, a memória virtual que sustenta as ilusões, a E/S que domina o tempo de quase tudo, e um projeto que amarrou as pontas num sistema pequeno e honesto. Você agora lê um vmstat, um deadlock e um OOM kill sabendo o que há por trás, e desenha um sistema concorrente começando pelas perguntas certas em vez de pelos locks.\n\nDois hábitos valem mais que qualquer ferramenta específica. Medir antes de otimizar: os números desta trilha (nanossegundos de atomic, microssegundos de troca de contexto, milissegundos de fsync) existem para você estimar de cabeça e conferir com perf, vmstat e sanitizers no alvo real. E projetar para o desligamento e para o limite desde o início: fila com teto, política de cheia, protocolo de parada. Sistemas quebram nas bordas, e as bordas se desenham no papel, baratas, ou se descobrem em produção, caras. O papel, você acabou de provar, funciona.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é a primeira pergunta do mapa de decisões diante de um problema concorrente?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Dá para compartilhar menos, tornando dados imutáveis ou próprios?",
                            isCorrect: true,
                        },
                        {
                            text: "Qual mutex proteger primeiro, o mais interno ou o mais externo?",
                            isCorrect: false,
                        },
                        {
                            text: "Quantas threads o hardware da máquina de produção suporta hoje?",
                            isCorrect: false,
                        },
                        {
                            text: "Qual biblioteca de concorrência tem mais adoção no mercado atual?",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que dado imutável dispensa sincronização?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Sem escrita não existe corrida: só leituras convivem em paz",
                            isCorrect: true,
                        },
                        {
                            text: "O compilador insere locks automáticos em dados constantes",
                            isCorrect: false,
                        },
                        {
                            text: "O kernel move dados imutáveis para páginas fora do alcance",
                            isCorrect: false,
                        },
                        {
                            text: "Leituras simultâneas são serializadas pelo cache da CPU",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sobrou um contador compartilhado e nada mais. Qual ferramenta o mapa indica?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Um atomic: uma variável, uma operação, sem cadeado",
                            isCorrect: true,
                        },
                        {
                            text: "Um mutex grosso protegendo o módulo inteiro do contador",
                            isCorrect: false,
                        },
                        {
                            text: "Uma condvar para as threads esperarem a vez de somar",
                            isCorrect: false,
                        },
                        {
                            text: "Um semáforo contando quantas threads podem incrementar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que faz da fila limitada uma fronteira honesta entre dois domínios de threads?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Teto e política de cheia declaram a capacidade real do sistema",
                            isCorrect: true,
                        },
                        {
                            text: "Ela criptografa as mensagens que atravessam os domínios de thread",
                            isCorrect: false,
                        },
                        {
                            text: "Ela garante ordem global de processamento entre todos os produtores",
                            isCorrect: false,
                        },
                        {
                            text: "Ela elimina a necessidade de protocolo de desligamento nas bordas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que projetar o desligamento e os limites desde o primeiro dia, e não no final?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sistemas quebram nas bordas, e no papel elas custam quase nada",
                            isCorrect: true,
                        },
                        {
                            text: "Porque depois do primeiro deploy o código não deve mais mudar",
                            isCorrect: false,
                        },
                        {
                            text: "Ferramentas de teste só cobrem caminhos escritos no início",
                            isCorrect: false,
                        },
                        {
                            text: "O SIGTERM só funciona em processos que o registram no boot",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
            .where(eq(trails.id, trilha.id));
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluido: " +
            MODULOS.length +
            " modulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questoes.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
