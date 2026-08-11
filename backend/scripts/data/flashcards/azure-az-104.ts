import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE AZ-104, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário de
 * administração; as cartas guardam as pegadinhas de prova, as regras de
 * herança e as separações entre recursos parecidos.
 */
export const azureAz104: CartasDaTrilha = {
    trilha: "AZURE AZ-104",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que é herdado de cima para baixo no Azure?",
                        verso: "As atribuições de função e de política.",
                    },
                    {
                        frente: "O que não é herdado?",
                        verso: "As tags.",
                    },
                    {
                        frente: "Que níveis a hierarquia do Azure tem?",
                        verso: "Grupo de gerenciamento, assinatura, grupo de recursos e recurso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quando a zona de uma máquina virtual é definida?",
                        verso: "Na criação.",
                    },
                    {
                        frente: "Dá para alterar a zona depois?",
                        verso: "Não: é preciso recriar ou replicar a máquina.",
                    },
                    {
                        frente: "O que o Resource Manager faz em toda operação?",
                        verso: "Autentica e autoriza antes de aplicar a mudança.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o comando de parar a máquina não faz?",
                        verso: "Não libera a cobrança da computação.",
                    },
                    {
                        frente: "Que comando libera essa cobrança?",
                        verso: "O de desalocar a máquina.",
                    },
                    {
                        frente: "O que a desalocação libera?",
                        verso: "Os recursos de computação reservados para a máquina.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como garantir que todo recurso receba uma tag?",
                        verso: "Com política de efeito Modify e tarefa de remediação.",
                    },
                    {
                        frente: "Por que a política é necessária nesse caso?",
                        verso: "Porque as tags não são herdadas.",
                    },
                    {
                        frente: "O que a tarefa de remediação alcança?",
                        verso: "Os recursos que já existiam antes da política.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que ler primeiro num estudo de caso?",
                        verso: "O cenário inteiro, antes de responder.",
                    },
                    {
                        frente: "Por que essa ordem importa?",
                        verso: "As questões seguintes dependem do mesmo contexto.",
                    },
                    {
                        frente: "Que formatos o exame mistura?",
                        verso: "Questões avulsas e estudos de caso.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que um grupo de segurança faz?",
                        verso: "Concede acesso.",
                    },
                    {
                        frente: "Para que serve o grupo do Microsoft 365?",
                        verso: "Para colaboração.",
                    },
                    {
                        frente: "O que a associação dinâmica exige?",
                        verso: "Licença P1.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o SSPR precisa para alterar a senha no diretório local?",
                        verso: "A escrita de volta de senha habilitada.",
                    },
                    {
                        frente: "O que acontece sem essa configuração?",
                        verso: "A troca não chega ao Active Directory local.",
                    },
                    {
                        frente: "Que tipo de conta o convidado recebe?",
                        verso: "A de usuário externo, vinda de outro diretório.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que separa Owner de Contributor?",
                        verso: "Delegar acesso.",
                    },
                    {
                        frente: "O que separa Owner de User Access Administrator?",
                        verso: "Um administra os recursos; o outro, apenas o acesso.",
                    },
                    {
                        frente: "O que a função Reader permite?",
                        verso: "Ver, sem alterar nada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que ordem o Azure segue ao avaliar acesso?",
                        verso: "Soma as atribuições aplicáveis e depois aplica as negações.",
                    },
                    {
                        frente: "O que acontece com as concessões?",
                        verso: "Somam.",
                    },
                    {
                        frente: "O que acontece com as negações?",
                        verso: "Vencem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Do que o Entra ID cuida?",
                        verso: "De quem você é.",
                    },
                    {
                        frente: "Do que o controle de acesso por função cuida?",
                        verso: "Do que você pode fazer nos recursos.",
                    },
                    {
                        frente: "Que frase resume a avaliação de acesso?",
                        verso: "Concessões somam, negações vencem.",
                    },
                ],
            },
        },
    },
};
