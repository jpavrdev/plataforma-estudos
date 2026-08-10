import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Orquestração de Pipelines, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto do pipeline; as cartas guardam as definições fechadas, os nomes
 * dos componentes e as regras que a aula enuncia de passagem.
 */
export const orquestracaoDePipelines: CartasDaTrilha = {
    trilha: "Orquestração de Pipelines",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que combinação derruba um pipeline em silêncio?",
                        verso: "Depender da duração de cada job para definir a ordem.",
                    },
                    {
                        frente: "O que o agendamento por horário fixo não garante?",
                        verso: "Que o job anterior já terminou.",
                    },
                    {
                        frente: "O que a orquestração resolve, no fundo?",
                        verso: "A dependência entre tarefas, e não apenas o horário.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o orquestrador decide?",
                        verso: "Quando e em que ordem o trabalho acontece.",
                    },
                    {
                        frente: "Quem processa os dados de fato?",
                        verso: "O motor por trás de cada tarefa.",
                    },
                    {
                        frente: "Que exemplos de motor a aula cita?",
                        verso: "Um script, uma consulta no warehouse ou um cluster.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que aconteceria se um ciclo fosse permitido?",
                        verso: "Nenhuma das tarefas poderia começar.",
                    },
                    {
                        frente: "O que a sigla DAG descreve?",
                        verso: "Um grafo dirigido e sem ciclos.",
                    },
                    {
                        frente: "O que as setas desse grafo representam?",
                        verso: "As dependências entre as tarefas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O tempo total do pipeline é a soma das tarefas?",
                        verso: "Não: é a soma das tarefas no caminho crítico.",
                    },
                    {
                        frente: "O que é o caminho crítico?",
                        verso: "O caminho mais longo entre as dependências.",
                    },
                    {
                        frente: "Que tarefa acelerar não adianta?",
                        verso: "A que está fora do caminho crítico.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que muda de uma ferramenta de orquestração para outra?",
                        verso: "A sintaxe e o ponto de partida.",
                    },
                    {
                        frente: "O que não muda entre elas?",
                        verso: "O problema: quando, em que ordem e com que garantias.",
                    },
                    {
                        frente: "Que critério escolhe o orquestrador?",
                        verso: "O encaixe com o time e com o ambiente já em uso.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que componente é o ponto de encontro no Airflow?",
                        verso: "O banco de metadados.",
                    },
                    {
                        frente: "Quem enxerga o mesmo estado por esse banco?",
                        verso: "Scheduler, webserver e workers.",
                    },
                    {
                        frente: "O que o scheduler faz?",
                        verso: "Decide o que precisa rodar, e quando.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que acontece se o arquivo Python não importar?",
                        verso: "O DAG simplesmente não existe para o scheduler.",
                    },
                    {
                        frente: "Existe execução parcial de um arquivo quebrado?",
                        verso: "Não existe.",
                    },
                    {
                        frente: "Em que linguagem o DAG é definido no Airflow?",
                        verso: "Em Python.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é um sensor?",
                        verso: "Um operator especializado em esperar.",
                    },
                    {
                        frente: "Onde um hook mora?",
                        verso: "Dentro do código de uma task.",
                    },
                    {
                        frente: "O que um hook nunca é?",
                        verso: "Uma task sozinha no grafo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma task presa na fila indica?",
                        verso: "Que ela espera capacidade, e não que está com defeito.",
                    },
                    {
                        frente: "Que confusão esse estado provoca?",
                        verso: "Parece task travada, mas a causa é outra.",
                    },
                    {
                        frente: "Quem move a task da fila para a execução?",
                        verso: "O executor, quando aparece capacidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que trocar de executor muda?",
                        verso: "Como e onde as tasks rodam.",
                    },
                    {
                        frente: "O que trocar de executor não muda?",
                        verso: "O que cada DAG faz.",
                    },
                    {
                        frente: "Que ganho essa separação traz?",
                        verso: "A decisão de escala fica isolada da lógica do pipeline.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o schedule de um DAG descreve?",
                        verso: "Um intervalo que se repete, e não um instante isolado.",
                    },
                    {
                        frente: "O que cada disparo representa?",
                        verso: "A passagem de um desses intervalos.",
                    },
                    {
                        frente: "Que sintaxe descreve o agendamento clássico?",
                        verso: "A expressão cron, com cinco campos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que período uma run processa?",
                        verso: "O anterior, que acabou de fechar.",
                    },
                    {
                        frente: "Que período ela nunca processa?",
                        verso: "Aquele em que ela dispara.",
                    },
                    {
                        frente: "O que a run da meia-noite do dia 10 processa?",
                        verso: "Os dados do dia 9.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o catchup tenta ser?",
                        verso: "Consistente, rodando as execuções que faltaram.",
                    },
                    {
                        frente: "O que o Airflow entende quando faltam execuções?",
                        verso: "Que ainda deve aquelas runs a você.",
                    },
                    {
                        frente: "Que pergunta o catchup obriga a responder?",
                        verso: "Se faz sentido reprocessar todo o período pendente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quando limitar a uma run ativa deixa de ser opção?",
                        verso: "Quando uma run depende do resultado da anterior.",
                    },
                    {
                        frente: "Que outro caso exige execução não sobreposta?",
                        verso: "Duas runs escrevendo na mesma tabela ao mesmo tempo.",
                    },
                    {
                        frente: "Que cuidado o fuso horário exige no agendamento?",
                        verso: "Declarar o fuso, para o horário não variar no verão.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a escolha certa de forma de disparo?",
                        verso: "A que corresponde a quem sabe quando a DAG deve rodar.",
                    },
                    {
                        frente: "Que três gatilhos a aula lista?",
                        verso: "O relógio, uma pessoa, ou o próprio dado.",
                    },
                    {
                        frente: "Qual não é o critério dessa escolha?",
                        verso: "O gatilho mais familiar para o time.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "A ordem no arquivo Python define a execução?",
                        verso: "Não: quem manda é o grafo de dependências declarado.",
                    },
                    {
                        frente: "Que formas declaram dependência entre tasks?",
                        verso: "As setas duplas, ou os métodos de upstream e downstream.",
                    },
                    {
                        frente: "O que uma dependência declarada garante?",
                        verso: "Que a task só começa depois da anterior terminar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a trigger rule muda?",
                        verso: "A condição para a task ser liberada.",
                    },
                    {
                        frente: "O que a trigger rule não muda?",
                        verso: "O que a task faz.",
                    },
                    {
                        frente: "Que regra de disparo vale por padrão?",
                        verso: "Todas as anteriores terem terminado com sucesso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o estado pulado significa?",
                        verso: "Que aquela task não era necessária desta vez.",
                    },
                    {
                        frente: "O que o estado pulado não é?",
                        verso: "Uma falha.",
                    },
                    {
                        frente: "O que uma junção depois de um branch precisa?",
                        verso: "Uma trigger rule que aceite ramos pulados.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Para que o XCom foi feito?",
                        verso: "Para pequenos pedaços de metadado entre as tasks.",
                    },
                    {
                        frente: "Para que o XCom não serve?",
                        verso: "Para carregar o dado em si.",
                    },
                    {
                        frente: "Onde o dado grande deve trafegar?",
                        verso: "Por armazenamento externo, com a task passando o caminho.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o TaskGroup oferece?",
                        verso: "Organização visual e lógica.",
                    },
                    {
                        frente: "O que o TaskGroup não oferece?",
                        verso: "Isolamento de execução.",
                    },
                    {
                        frente: "Como as tasks de um grupo são executadas?",
                        verso: "Como tasks normais do mesmo DAG.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que tipo de falha o retry resolve?",
                        verso: "A transitória, que depende do momento em que rodou.",
                    },
                    {
                        frente: "Que falha o retry não resolve?",
                        verso: "A determinística, que falha sempre pelo mesmo motivo.",
                    },
                    {
                        frente: "O que o intervalo entre tentativas evita?",
                        verso: "Bater na origem que ainda não se recuperou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando uma task é idempotente?",
                        verso: "Quando rodar uma ou dez vezes deixa o destino igual.",
                    },
                    {
                        frente: "O que o retry sem idempotência produz?",
                        verso: "Duplicata, a cada nova tentativa.",
                    },
                    {
                        frente: "Que prática a idempotência viabiliza?",
                        verso: "Reprocessar sem medo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o tempo limite de execução faz?",
                        verso: "Mata a task que passou do tempo permitido.",
                    },
                    {
                        frente: "O que o SLA faz?",
                        verso: "Avisa que a execução está mais lenta que o esperado.",
                    },
                    {
                        frente: "O que o SLA não faz?",
                        verso: "Matar a task.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "No que vira o alerta que dispara toda hora?",
                        verso: "Em ruído, que a equipe aprende a ignorar.",
                    },
                    {
                        frente: "Quando a falha importante passa despercebida?",
                        verso: "Exatamente quando o alerta já virou ruído.",
                    },
                    {
                        frente: "Que critério um bom alerta cumpre?",
                        verso: "Exigir uma ação de quem o recebe.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Sobre o que o backfill só é seguro?",
                        verso: "Sobre uma task idempotente.",
                    },
                    {
                        frente: "Que teste simples confirma a segurança do backfill?",
                        verso: "Rodar um único dia dez vezes e comparar o resultado.",
                    },
                    {
                        frente: "Que cuidado o backfill grande pede?",
                        verso: "Limitar quantas runs acontecem ao mesmo tempo.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que um sensor bem configurado não faz?",
                        verso: "Segurar um worker refém da condição externa.",
                    },
                    {
                        frente: "Como um sensor espera de forma barata?",
                        verso: "Liberando o worker entre uma checagem e outra.",
                    },
                    {
                        frente: "Que limites todo sensor precisa ter?",
                        verso: "Tempo máximo de espera e uma saída clara.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando dividir um pipeline em várias DAGs compensa?",
                        verso: "Quando o ganho em clareza supera o custo de coordenar.",
                    },
                    {
                        frente: "Que custo essa divisão traz?",
                        verso: "Coordenar a execução entre as DAGs.",
                    },
                    {
                        frente: "Que ganho ela pode trazer?",
                        verso: "Isolamento e clareza.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que o mapeamento dinâmico existe?",
                        verso: "Para descrever o formato do trabalho uma vez só.",
                    },
                    {
                        frente: "Quem decide quantas instâncias criar?",
                        verso: "O próprio orquestrador, em tempo de execução.",
                    },
                    {
                        frente: "O que o mapeamento dinâmico substitui?",
                        verso: "Escrever manualmente uma task para cada item.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde senha, token e chave não podem ficar?",
                        verso: "No código da DAG nem em variável de texto puro.",
                    },
                    {
                        frente: "Onde essas credenciais moram em produção?",
                        verso: "Num backend de segredos dedicado.",
                    },
                    {
                        frente: "O que a parametrização evita?",
                        verso: "Valor fixo espalhado pelo código do pipeline.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Se a task está lenta processando dados, qual é o problema?",
                        verso: "O lugar onde o processamento foi colocado.",
                    },
                    {
                        frente: "O que o orquestrador deve fazer?",
                        verso: "Coordenar, e não processar.",
                    },
                    {
                        frente: "Para onde o processamento pesado deve ir?",
                        verso: "Para o motor de dados, fora do orquestrador.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que é um DAG que nunca foi importado na integração?",
                        verso: "Um incidente esperando a próxima janela de implantação.",
                    },
                    {
                        frente: "Que teste mínimo todo DAG merece?",
                        verso: "A importação sem erro, feita automaticamente.",
                    },
                    {
                        frente: "Que outra checagem um teste de DAG costuma fazer?",
                        verso: "Conferir que não há ciclo e que as dependências existem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando uma DAG está de fato pronta?",
                        verso: "Quando o caminho do commit até o scheduler é automático.",
                    },
                    {
                        frente: "Que qualidade esse caminho precisa ter?",
                        verso: "Ser testado e igual em todo ambiente.",
                    },
                    {
                        frente: "Que risco a implantação manual traz?",
                        verso: "Ambientes que divergem sem ninguém notar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é um pipeline sem observabilidade?",
                        verso: "Sortudo, e não confiável.",
                    },
                    {
                        frente: "Quando essa sorte acaba?",
                        verso: "No dia em que perguntam por que o número está errado.",
                    },
                    {
                        frente: "Que sinais a observabilidade acompanha?",
                        verso: "Duração, volume, falhas e atraso das execuções.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Sobre o que o desempenho em orquestração raramente é?",
                        verso: "Sobre a task individual.",
                    },
                    {
                        frente: "Sobre o que ele é, então?",
                        verso: "Sobre quantas coisas o ambiente deixa acontecer juntas.",
                    },
                    {
                        frente: "Que ajuste costuma destravar o ambiente?",
                        verso: "Rever os limites de paralelismo e as filas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que orquestrar não é?",
                        verso: "Apenas rodar tarefas na hora certa.",
                    },
                    {
                        frente: "O que orquestrar é, então?",
                        verso: "Dar ao time confiança no comportamento do pipeline.",
                    },
                    {
                        frente: "Que três garantias essa confiança inclui?",
                        verso: "Repetir igual, falhar de forma previsível e se recuperar.",
                    },
                ],
            },
        },
    },
};
