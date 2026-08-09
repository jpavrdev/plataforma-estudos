import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de Produto, primeira trilha do roadmap de Produto.
 *
 * Sem trilhos de linguagem: tudo em "neutra". Trilha de vocabulário e de
 * distinções entre papéis, onde o quiz trabalha muito com caso aplicado. As
 * cartas ficam com as definições e com o que separa cada papel do vizinho.
 */
export const fundamentosDeProduto: CartasDaTrilha = {
    trilha: "Fundamentos de Produto",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com o time num projeto, e num produto?",
                        verso: "No projeto ele é desmontado na entrega; no produto, permanece.",
                    },
                    {
                        frente: "Como o escopo se comporta em cada um?",
                        verso: "Fechado no início no projeto; aposta revisada com feedback no produto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é output?",
                        verso: "Aquilo que o time entrega: features, telas e lançamentos.",
                    },
                    {
                        frente: "O que é outcome?",
                        verso: "A mudança de resultado ou comportamento causada pelo uso.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são as quatro fases do ciclo de vida do produto?",
                        verso: "Introdução, crescimento, maturidade e declínio.",
                    },
                    {
                        frente: "Qual é o foco do time na fase de maturidade?",
                        verso: "Eficiência, retenção e defesa da posição.",
                    },
                    {
                        frente: "Qual é o sinal típico da fase de crescimento?",
                        verso: "Demanda puxando e canais abrindo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a pegadinha clássica de um produto B2B?",
                        verso: "Quem usa raramente é quem assina o contrato.",
                    },
                    {
                        frente: "O que é o problema do ovo e da galinha em marketplace?",
                        verso: "Sem oferta não vem demanda, e sem demanda não vem oferta.",
                    },
                    {
                        frente: "Por que estabilidade vale mais que novidade numa plataforma?",
                        verso: "Quem constrói em cima depende do contrato não quebrar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é a relação hierárquica do PM com engenharia e design?",
                        verso: "Nenhuma: produto coordena sem ser chefe dessas áreas.",
                    },
                    {
                        frente: "Por que a fila do suporte é valiosa para produto?",
                        verso: "Mostra a dor real dos usuários, sem filtro.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De que o PM é dono, afinal?",
                        verso: "Do problema a resolver, não do backlog de tarefas.",
                    },
                    {
                        frente: "O que o mito do PM como mini-CEO erra?",
                        verso: "CEO manda; o PM influencia sem autoridade sobre o time.",
                    },
                    {
                        frente: "O PM precisa saber programar?",
                        verso: "Não. Precisa entender o suficiente para decidir bem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde vem o papel de Product Owner?",
                        verso: "Do Scrum, como responsável por maximizar o valor do backlog.",
                    },
                    {
                        frente: "Que horizonte separa PO de PM no uso brasileiro?",
                        verso: "O PO olha sprint e trimestre; o PM, trimestre e ano.",
                    },
                    {
                        frente: "Com quem cada um conversa mais?",
                        verso: "O PO com o time de desenvolvimento; o PM com usuários e stakeholders.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é o papel central de um Product Analyst?",
                        verso: "Sustentar decisões de produto com dados e análises.",
                    },
                    {
                        frente: "O que caracteriza um programa de APM?",
                        verso: "Porta de entrada estruturada, com rotação e mentoria.",
                    },
                    {
                        frente: "Como o Analyst evolui rumo a PM?",
                        verso: "Da análise à recomendação, e da recomendação à decisão.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o foco do Scrum Master ou Agile Coach?",
                        verso: "O processo do time e a remoção de impedimentos.",
                    },
                    {
                        frente: "O que faz um Product Marketing Manager?",
                        verso: "Posicionamento, mensagem e lançamento no mercado.",
                    },
                    {
                        frente: "Qual é a sobreposição clássica entre PM e Product Designer?",
                        verso: "Os dois pesquisam usuários e desenham a descoberta.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que de fato muda ao subir a escada de produto?",
                        verso: "O escopo e a ambiguidade dos problemas, não o status.",
                    },
                    {
                        frente: "Qual é o degrau típico de entrada?",
                        verso: "APM ou Product Analyst, executando com supervisão.",
                    },
                    {
                        frente: "O que caracteriza o escopo de um PM senior?",
                        verso: "Problemas sem enunciado: ele define o problema.",
                    },
                ],
            },
        },
    },
};
