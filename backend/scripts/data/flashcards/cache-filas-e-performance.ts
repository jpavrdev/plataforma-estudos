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
    },
};
