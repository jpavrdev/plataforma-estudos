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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que permissão cria o primeiro grupo de gerenciamento?",
                        verso: "A de Management Group Contributor.",
                    },
                    {
                        frente: "Que alternativa existe para gerenciar a hierarquia raiz?",
                        verso: "Elevar o acesso a partir do diretório.",
                    },
                    {
                        frente: "O que um grupo de gerenciamento agrupa?",
                        verso: "Assinaturas, para aplicar governança de uma vez.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que efeitos de política exigem uma identidade gerenciada?",
                        verso: "Modify e DeployIfNotExists.",
                    },
                    {
                        frente: "Por que essa identidade é necessária?",
                        verso: "Ela precisa de permissão para alterar ou implantar.",
                    },
                    {
                        frente: "O que o efeito Deny faz?",
                        verso: "Impede a criação do recurso fora do padrão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que fazer antes de excluir um grupo de recursos protegido?",
                        verso: "Remover o bloqueio.",
                    },
                    {
                        frente: "Quem não pode remover bloqueios?",
                        verso: "O Contributor.",
                    },
                    {
                        frente: "O que o bloqueio de exclusão ainda permite?",
                        verso: "Alterar o recurso, mas não apagá-lo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que um orçamento faz ao ser atingido?",
                        verso: "Notifica.",
                    },
                    {
                        frente: "O que ele não faz?",
                        verso: "Não bloqueia a criação nem desliga nada.",
                    },
                    {
                        frente: "O que o Advisor recomenda?",
                        verso: "Ações de custo, segurança, desempenho e confiabilidade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Sobre o que o controle de acesso por função é?",
                        verso: "Sobre pessoas.",
                    },
                    {
                        frente: "Sobre o que a política é?",
                        verso: "Sobre recursos.",
                    },
                    {
                        frente: "Sobre o que o bloqueio é?",
                        verso: "Sobre operações, e ele fica acima do controle de acesso.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o namespace hierárquico transforma na conta?",
                        verso: "Vira Data Lake Storage, com diretórios e permissões reais.",
                    },
                    {
                        frente: "Quando ele pode ser habilitado?",
                        verso: "Só na criação da conta.",
                    },
                    {
                        frente: "O que a conta de armazenamento reúne?",
                        verso: "Blob, arquivos, filas e tabelas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como a replicação para a região secundária acontece?",
                        verso: "De forma assíncrona.",
                    },
                    {
                        frente: "O que essa assincronia implica?",
                        verso: "Uma janela de possível perda de dados no failover.",
                    },
                    {
                        frente: "O que a redundância local protege?",
                        verso: "Contra falha dentro do próprio data center.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como invalidar um SAS avulso antes do vencimento?",
                        verso: "Regerando a chave que o assinou.",
                    },
                    {
                        frente: "Que efeito colateral isso tem?",
                        verso: "Invalida todos os outros tokens assinados por ela.",
                    },
                    {
                        frente: "Que alternativa evita esse efeito?",
                        verso: "A política de acesso armazenada, revogável sozinha.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Contra o que o soft delete protege?",
                        verso: "Contra exclusão.",
                    },
                    {
                        frente: "Contra o que o versionamento protege?",
                        verso: "Contra sobrescrita.",
                    },
                    {
                        frente: "O que é um snapshot?",
                        verso: "Uma foto tirada de propósito, num instante escolhido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que porta o protocolo SMB usa?",
                        verso: "A porta 445.",
                    },
                    {
                        frente: "Que problema essa porta costuma dar?",
                        verso: "Muitos provedores a bloqueiam, e a montagem falha de fora.",
                    },
                    {
                        frente: "Que ferramenta copia dados em massa para o armazenamento?",
                        verso: "O AzCopy.",
                    },
                ],
            },
        },
    },
};
