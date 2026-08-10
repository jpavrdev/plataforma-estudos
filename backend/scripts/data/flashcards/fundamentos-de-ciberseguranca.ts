import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de Cibersegurança, primeira trilha do roadmap de
 * Segurança.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento de
 * cenário; as cartas guardam as siglas abertas, as listas fechadas de fases
 * e os nomes próprios de framework que a aula cita de passagem.
 */
export const fundamentosDeCiberseguranca: CartasDaTrilha = {
    trilha: "Fundamentos de Cibersegurança",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que a cibersegurança protege, na definição da aula?",
                        verso: "Sistemas, dados e pessoas contra ataques e acessos indevidos.",
                    },
                    {
                        frente: "De quem é o assunto da cibersegurança?",
                        verso: "De todo mundo, não só do especialista de tecnologia.",
                    },
                    {
                        frente: "Que três coisas a cibersegurança sustenta no dia a dia?",
                        verso: "O dinheiro, a privacidade e o funcionamento das empresas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que diferença separa dado de informação?",
                        verso: "O dado é fato bruto; a informação é o dado com significado.",
                    },
                    {
                        frente: "Que nome a informação recebe por merecer proteção?",
                        verso: "Ativo.",
                    },
                    {
                        frente: "Que alcance a segurança da informação tem além do digital?",
                        verso: "Protege também o papel, a conversa e o ambiente físico.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que três pilares a tríade CIA reúne?",
                        verso: "Confidencialidade, integridade e disponibilidade.",
                    },
                    {
                        frente: "O que a confidencialidade garante?",
                        verso: "Que só quem tem permissão acessa a informação.",
                    },
                    {
                        frente: "O que a integridade garante?",
                        verso: "Que a informação não foi alterada indevidamente.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a autenticidade garante?",
                        verso: "Que algo ou alguém é genuíno, veio mesmo de quem diz.",
                    },
                    {
                        frente: "O que o não-repúdio impede?",
                        verso: "Que alguém negue depois uma ação que praticou.",
                    },
                    {
                        frente: "Que tecnologia sustenta o não-repúdio na prática?",
                        verso: "A assinatura digital.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que produto aproximado define o risco?",
                        verso: "Ameaça vezes vulnerabilidade vezes impacto.",
                    },
                    {
                        frente: "Que analogia a aula usa para ameaça e vulnerabilidade?",
                        verso: "O ladrão e a janela aberta.",
                    },
                    {
                        frente: "O que faz o risco despencar nessa relação?",
                        verso: "Faltar a ameaça, ou faltar a vulnerabilidade.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que três coisas separam um ator de ameaça de outro?",
                        verso: "Motivação, capacidade e persistência.",
                    },
                    {
                        frente: "Que ator usa ferramenta pronta sem entender o fundo?",
                        verso: "O script kiddie.",
                    },
                    {
                        frente: "Que ator combina recurso alto e persistência longa?",
                        verso: "O grupo patrocinado por Estado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um vetor de ataque representa?",
                        verso: "O caminho ou método usado para chegar até o alvo.",
                    },
                    {
                        frente: "Que exemplos de vetor de ataque a aula lista?",
                        verso: "Phishing, senha roubada, software com falha e pendrive.",
                    },
                    {
                        frente: "O que a superfície de ataque soma?",
                        verso: "Todos os pontos por onde alguém poderia tentar entrar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas fases a Cyber Kill Chain descreve?",
                        verso: "Sete fases, em ordem.",
                    },
                    {
                        frente: "Quem publicou a Cyber Kill Chain?",
                        verso: "A Lockheed Martin.",
                    },
                    {
                        frente: "Que quatro fases abrem a Cyber Kill Chain?",
                        verso: "Reconhecimento, armamento, entrega e exploração.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três fases fecham a Cyber Kill Chain?",
                        verso: "Instalação, comando e controle, e ações no objetivo.",
                    },
                    {
                        frente: "O que a fase de instalação deixa para trás?",
                        verso: "Um backdoor, para o atacante persistir na máquina.",
                    },
                    {
                        frente: "Que vantagem a defesa tira da cadeia de fases?",
                        verso: "Quebrar um elo já frustra o plano inteiro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o MITRE ATT&CK cataloga?",
                        verso: "As táticas e técnicas usadas por atacantes reais.",
                    },
                    {
                        frente: "Que diferença separa tática de técnica?",
                        verso: "A tática é o objetivo; a técnica é como se chega nele.",
                    },
                    {
                        frente: "Que ideia a sigla ATT&CK resume?",
                        verso: "Táticas, técnicas e conhecimento comum do adversário.",
                    },
                ],
            },
        },
    },
};
