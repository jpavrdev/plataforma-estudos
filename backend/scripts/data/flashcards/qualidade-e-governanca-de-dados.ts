import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Qualidade e Governança de Dados, do roadmap de Engenharia de
 * Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * processo; as cartas guardam as definições fechadas, as divisões de
 * papel e as regras que a aula enuncia de passagem.
 */
export const qualidadeEGovernancaDeDados: CartasDaTrilha = {
    trilha: "Qualidade e Governança de Dados",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que duas propriedades diferentes um pipeline tem?",
                        verso: "Disponibilidade e corretude.",
                    },
                    {
                        frente: "O que só a corretude garante?",
                        verso: "Que o dado é confiável.",
                    },
                    {
                        frente: "Um pipeline pode estar no ar e errado ao mesmo tempo?",
                        verso: "Pode, e é o caso mais perigoso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a completude mede?",
                        verso: "Se o campo esperado está preenchido.",
                    },
                    {
                        frente: "O que a unicidade mede?",
                        verso: "Se o registro aparece uma vez só.",
                    },
                    {
                        frente: "O que a validade garante?",
                        verso: "A forma, e não a verdade do dado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a validade pergunta?",
                        verso: "Se o dado segue as regras.",
                    },
                    {
                        frente: "O que a acurácia pergunta?",
                        verso: "Se o dado ainda é verdade.",
                    },
                    {
                        frente: "O que a atualidade mede?",
                        verso: "Há quanto tempo o dado foi atualizado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é uma regra que ninguém consegue testar?",
                        verso: "Uma intenção, e não uma regra de qualidade.",
                    },
                    {
                        frente: "O que separa a intenção do contrato?",
                        verso: "O limite numérico declarado.",
                    },
                    {
                        frente: "Que qualidade uma boa regra precisa ter?",
                        verso: "Ser mensurável de forma automática.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é escrever regra sem perfilar o dado?",
                        verso: "Apostar no limite certo.",
                    },
                    {
                        frente: "O que o profiling entrega no lugar da aposta?",
                        verso: "Um número visto de verdade.",
                    },
                    {
                        frente: "O que o profiling mostra sobre uma coluna?",
                        verso: "Distribuição, nulos, valores distintos e extremos.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Contra o que protege o teste que só roda na integração?",
                        verso: "Contra o código quebrar o pipeline.",
                    },
                    {
                        frente: "Contra o que ele não protege?",
                        verso: "Contra o dado quebrar sozinho, em silêncio.",
                    },
                    {
                        frente: "Que diferença separa teste de software de teste de dado?",
                        verso: "Um valida o código; o outro valida o que chegou.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é testar apenas no mart?",
                        verso: "Conferir a carga depois que o caminhão já descarregou.",
                    },
                    {
                        frente: "O que testar cedo permite decidir?",
                        verso: "Se o problema segue adiante ou para ali mesmo.",
                    },
                    {
                        frente: "Onde o primeiro teste deve ficar?",
                        verso: "Na entrada, logo depois da ingestão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que uma suíte de expectations é, além de uma lista?",
                        verso: "A definição explícita do que dado bom significa ali.",
                    },
                    {
                        frente: "Que qualidade essa definição tem?",
                        verso: "Fica visível para todos, não só para quem escreveu.",
                    },
                    {
                        frente: "O que uma expectation declara?",
                        verso: "Uma afirmação que a tabela precisa satisfazer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que caso o teste genérico resolve?",
                        verso: "O caso comum.",
                    },
                    {
                        frente: "Que caso o teste singular resolve?",
                        verso: "O caso único daquela tabela.",
                    },
                    {
                        frente: "Que caso o teste customizado resolve?",
                        verso: "O que se repete, mas não vem pronto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "No que bloquear demais transforma o pipeline?",
                        verso: "Num alarme que ninguém mais escuta.",
                    },
                    {
                        frente: "No que bloquear de menos transforma o teste?",
                        verso: "Numa formalidade que ninguém corrige.",
                    },
                    {
                        frente: "O que decide entre avisar e bloquear?",
                        verso: "A criticidade daquele dado.",
                    },
                ],
            },
        },
    },
};
