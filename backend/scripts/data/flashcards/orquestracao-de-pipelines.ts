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
    },
};
