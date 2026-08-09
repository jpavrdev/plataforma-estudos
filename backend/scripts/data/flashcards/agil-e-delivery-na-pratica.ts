import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Ágil e Delivery na Prática, sexta trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas ficam com os números do Guia do Scrum, as listas fechadas
 * e as definições que a aula enuncia de passagem.
 */
export const agilEDeliveryNaPratica: CartasDaTrilha = {
    trilha: "Ágil e Delivery na Prática",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quais são as fases sequenciais do modelo cascata?",
                        verso: "Requisitos, design, implementação, testes e entrega.",
                    },
                    {
                        frente: "Como é ser iterativo sem ser incremental?",
                        verso: "Refinar protótipo pra sempre sem entregar nada usável.",
                    },
                    {
                        frente: "O que sobra quando um projeto ágil é cancelado no meio?",
                        verso: "Um produto parcial funcionando, não uma pilha de documento.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando e por quantas pessoas o Manifesto Ágil foi escrito?",
                        verso: "Em 2001, por dezessete profissionais reunidos em Utah.",
                    },
                    {
                        frente: "Quantos valores e princípios o Manifesto tem?",
                        verso: "Quatro valores e doze princípios.",
                    },
                    {
                        frente: "Que teste aplicar a uma prática que se diz ágil?",
                        verso: "Ela encurta o caminho até o feedback e barateia mudar de rumo?",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando o controle definido de processo funciona?",
                        verso: "Com entradas e saídas previsíveis, como uma linha de montagem.",
                    },
                    {
                        frente: "O que a Sprint Review inspeciona e o que ela adapta?",
                        verso: "Inspeciona o incremento e adapta o Product Backlog.",
                    },
                    {
                        frente: "Que papel os artefatos do Scrum cumprem no empirismo?",
                        verso: "Dar transparência: o que se pretende, o plano e o que já existe.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que nome a aula dá ao projeto de fases fixas picado em sprints?",
                        verso: "Cascata com sprint: parcelas de cronograma com nome do Scrum.",
                    },
                    {
                        frente: "Qual é o custo duplo do ágil de fachada?",
                        verso: "Paga o processo sem o benefício e o time conclui que não funciona.",
                    },
                    {
                        frente: "Que três incentivos costumam sustentar a fachada?",
                        verso: "Contrato que pune mudança, bônus pelo cronograma e medo de expor.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que ainda ajuda num contexto regulado, apesar do limite?",
                        verso: "Iterações internas e integração contínua no desenvolvimento.",
                    },
                    {
                        frente: "Que arranjos contratuais substituem o escopo e preço fechados?",
                        verso: "Contrato por fase, orçamento fixo com escopo variável e troca item a item.",
                    },
                    {
                        frente: "Qual regra geral fecha o módulo sobre quando usar empirismo?",
                        verso: "Quanto mais incerteza sobre o valor, mais o empirismo se paga.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que mudou de papéis para accountabilities em 2020?",
                        verso: "O mercado lia papel como cargo; accountability é responsabilidade.",
                    },
                    {
                        frente: "O que a organização define, fora do auto-gerenciamento?",
                        verso: "Orçamento, restrição legal e padrão de arquitetura e segurança.",
                    },
                    {
                        frente: "O que significa um time ser cross-functional?",
                        verso: "Ter as habilidades pra virar ideia em incremento sem depender de fora.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas valem durante toda a Sprint?",
                        verso: "Nada ameaça o Sprint Goal, escopo renegocia e a qualidade não cai.",
                    },
                    {
                        frente: "Que trade-off uma Sprint mais curta traz?",
                        verso: "Mais feedback e menos risco por ciclo, mais tempo gasto em eventos.",
                    },
                    {
                        frente: "O que deixou de ser regra na Daily a partir de 2020?",
                        verso: "O formato das três perguntas: o time escolhe a estrutura.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o compromisso do Increment?",
                        verso: "A Definition of Done: sem ela, não existe incremento.",
                    },
                    {
                        frente: "Qual é a diferença entre utilizável e publicado?",
                        verso: "Publicar é decisão do PO; estar pronto pra publicar é do time.",
                    },
                    {
                        frente: "Quantas Definitions of Done um time pode ter?",
                        verso: "Uma só: não existe DoD por item nem que muda com o prazo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são os quatro deveres concretos do Product Owner?",
                        verso: "Comunicar o Product Goal, criar itens, ordená-los e dar transparência.",
                    },
                    {
                        frente: "Quais três distorções costumam atingir o posto de PO?",
                        verso: "PO sem autoridade, PO sem tempo e PO virado analista.",
                    },
                    {
                        frente: "Que três coisas ninguém faz no lugar do PO?",
                        verso: "Falar com usuário, medir resultado e decidir o que não será feito.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que acontece com os pilares sem confiança no time?",
                        verso: "Transparência vira exposição, inspeção vira auditoria e adaptação, briga.",
                    },
                    {
                        frente: "O que significa respeito, na definição do Scrum?",
                        verso: "Tratar as pessoas como capazes e independentes.",
                    },
                    {
                        frente: "Qual valor é o mais atacado pelo dia a dia de interrupções?",
                        verso: "O foco, que é concentrar-se no trabalho da Sprint.",
                    },
                ],
            },
        },
    },
};
