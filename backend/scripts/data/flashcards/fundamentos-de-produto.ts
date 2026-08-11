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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que pergunta cada cadeira do trio leva?",
                        verso: "Produto se vale a pena, design se dá para entender, engenharia se dá para construir.",
                    },
                    {
                        frente: "Que risco a cadeira de design ajuda a evitar?",
                        verso: "Solução usável só por quem a criou.",
                    },
                    {
                        frente: "Por que a cascata interna prejudica o time?",
                        verso: "O contexto se perde e o risco só aparece tarde.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que caracteriza um time organizado por jornada?",
                        verso: "Cuida de um caminho do usuário de ponta a ponta.",
                    },
                    {
                        frente: "Quem são os clientes de um time de plataforma?",
                        verso: "Outros times da empresa, que dependem daquele serviço.",
                    },
                    {
                        frente: "Qual é a diferença entre time empoderado e feature team?",
                        verso: "Um recebe problema e responde por resultado; o outro recebe escopo.",
                    },
                    {
                        frente: "Qual é o ponto fraco do recorte por feature?",
                        verso: "Perde o resultado de ponta a ponta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que justifica manter um ritual no calendário?",
                        verso: "Ele produzir decisão ou alinhamento que o texto não daria.",
                    },
                    {
                        frente: "Qual é o sinal de que o sync do trio virou teatro?",
                        verso: "Vira relatório de status individual.",
                    },
                    {
                        frente: "Qual é o sinal de que a review virou teatro?",
                        verso: "Vira demo para impressionar diretor, sem ajuste.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é dívida técnica?",
                        verso: "O custo futuro de um atalho técnico tomado hoje.",
                    },
                    {
                        frente: "Como o PM deve tratar uma estimativa da engenharia?",
                        verso: "Como leitura de incerteza, não como promessa fechada.",
                    },
                    {
                        frente: "Que pergunta transforma um pedido de refatoração em decisão?",
                        verso: "O que acontece com o negócio se não fizermos isso agora?",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é pesquisa compartilhada entre PM e design?",
                        verso: "Os dois acompanham as mesmas conversas com usuários.",
                    },
                    {
                        frente: "Que crítica de design é útil para o time?",
                        verso: "A que liga objetivo da tela, observação e pergunta aberta.",
                    },
                    {
                        frente: "Como um PM atrapalha o design no início do problema?",
                        verso: "Chegando com a tela pronta em vez do problema e do resultado.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o espaço do problema descreve?",
                        verso: "Quem sofre, quando e a que custo hoje.",
                    },
                    {
                        frente: "Qual é a armadilha da solução apaixonante?",
                        verso: "Procurar um problema que justifique a ideia amada.",
                    },
                    {
                        frente: "Por que a gambiarra do usuário é sinal valioso?",
                        verso: "Mostra dor real que a pessoa já contorna sozinha.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a ideia de Jobs To Be Done propõe?",
                        verso: "As pessoas contratam soluções para fazer um progresso.",
                    },
                    {
                        frente: "Quais eram os concorrentes reais do milkshake?",
                        verso: "Banana, rosquinha e barra de cereal no trajeto.",
                    },
                    {
                        frente: "Por que a circunstância explica mais que a demografia?",
                        verso: "A mesma pessoa contrata coisas diferentes em situações diferentes.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve uma persona?",
                        verso: "Alinhar o time sobre quem está do outro lado.",
                    },
                    {
                        frente: "O que é um segmento de usuários?",
                        verso: "Recorte com comportamento e necessidade parecidos.",
                    },
                    {
                        frente: "Qual é o sinal mais claro de persona decorativa?",
                        verso: "Ela nunca ajudou o time a rejeitar nenhuma ideia.",
                    },
                    {
                        frente: "Quantas personas uma persona útil costuma acompanhar?",
                        verso: "Duas ou três, revisadas de tempos em tempos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é a minoria barulhenta?",
                        verso: "Grupo pequeno e ativo que parece consenso.",
                    },
                    {
                        frente: "Por que preferência declarada vale pouco sozinha?",
                        verso: "Responder é barato e mudar de comportamento é caro.",
                    },
                    {
                        frente: "Que grupo fica invisível nos canais de feedback?",
                        verso: "Quem tentou usar, não entendeu e desistiu calado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que são deficiências situacionais?",
                        verso: "Limitações do contexto, como sol forte ou uma mão ocupada.",
                    },
                    {
                        frente: "Que referência técnica orienta acessibilidade na web?",
                        verso: "As diretrizes WCAG, padrão do setor.",
                    },
                    {
                        frente: "Por que deixar acessibilidade para o fim sai caro?",
                        verso: "Vira reforma de fluxos já construídos.",
                    },
                ],
            },
        },
    },
};
