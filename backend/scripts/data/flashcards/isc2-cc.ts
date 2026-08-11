import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de ISC2 Certified in Cybersecurity, trilha de certificação sem
 * roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam as definições fechadas, as listas de fases e controles e
 * as separações entre conceitos parecidos.
 */
export const isc2Cc: CartasDaTrilha = {
    trilha: "ISC2 Certified in Cybersecurity (CC)",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três pilares a tríade CIA reúne?",
                        verso: "Confidencialidade, integridade e disponibilidade.",
                    },
                    {
                        frente: "Que pergunta a tríade ajuda a responder num incidente?",
                        verso: "Qual dos pilares foi violado.",
                    },
                    {
                        frente: "O que a integridade garante?",
                        verso: "Que o dado não foi alterado indevidamente.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é a identificação?",
                        verso: "A afirmação de quem você é.",
                    },
                    {
                        frente: "O que é a autenticação?",
                        verso: "A prova dessa afirmação.",
                    },
                    {
                        frente: "Que três fatores sustentam essa prova?",
                        verso: "Algo que você sabe, algo que tem e algo que é.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a MFA combina?",
                        verso: "Fatores de categorias diferentes.",
                    },
                    {
                        frente: "Que risco ela reduz?",
                        verso: "O de um único ponto de falha.",
                    },
                    {
                        frente: "Como a inteligência artificial reforça essa proteção?",
                        verso: "Calculando o risco de cada tentativa de acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o não repúdio garante?",
                        verso: "Que a ação não pode ser negada por quem a praticou.",
                    },
                    {
                        frente: "De que ele depende?",
                        verso: "De identidade comprovada, integridade e registro.",
                    },
                    {
                        frente: "Que tecnologia costuma sustentá-lo?",
                        verso: "A assinatura digital.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a privacidade regula?",
                        verso: "Como os dados pessoais são coletados, usados e compartilhados.",
                    },
                    {
                        frente: "De que ela depende para se tornar real?",
                        verso: "Dos mesmos controles de segurança da informação.",
                    },
                    {
                        frente: "Que cuidado a inteligência artificial acrescenta?",
                        verso: "O dado usado no treino também precisa de base legal.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De onde o risco nasce?",
                        verso: "Do encontro entre uma ameaça e uma vulnerabilidade.",
                    },
                    {
                        frente: "O que é a ameaça?",
                        verso: "O agente capaz de causar o dano.",
                    },
                    {
                        frente: "O que gerenciar risco não significa?",
                        verso: "Eliminar todo o risco.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o apetite a risco define?",
                        verso: "Quanto risco a organização topa correr.",
                    },
                    {
                        frente: "O que a tolerância marca?",
                        verso: "Os limites aceitáveis para um risco específico.",
                    },
                    {
                        frente: "Que respostas ao risco existem?",
                        verso: "Aceitar, mitigar, transferir e evitar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o controle físico protege?",
                        verso: "O ambiente.",
                    },
                    {
                        frente: "O que o controle técnico protege?",
                        verso: "Os sistemas.",
                    },
                    {
                        frente: "O que o controle administrativo orienta?",
                        verso: "As pessoas e os processos.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que valor abre o preâmbulo do código de ética?",
                        verso: "A segurança e o bem-estar da sociedade.",
                    },
                    {
                        frente: "Quantos cânones o código de ética tem?",
                        verso: "Quatro.",
                    },
                    {
                        frente: "Que dever o código cita junto do interesse público?",
                        verso: "O dever para com quem contrata o profissional.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que uma política diz?",
                        verso: "O quê e por quê.",
                    },
                    {
                        frente: "O que um padrão diz?",
                        verso: "O quanto.",
                    },
                    {
                        frente: "O que um procedimento diz?",
                        verso: "O como.",
                    },
                ],
            },
        },
    },
};
