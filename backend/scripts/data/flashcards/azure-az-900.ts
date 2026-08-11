import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE AZ-900, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". Cada módulo tem uma aula só,
 * então as três cartas de cada um cobrem o tema inteiro: as separações
 * entre serviços parecidos e as regras que a prova cobra de cor.
 */
export const azureAz900: CartasDaTrilha = {
    trilha: "AZURE AZ-900",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Do que a Microsoft cuida no modelo compartilhado?",
                        verso: "Da segurança da nuvem: data center, hardware e rede física.",
                    },
                    {
                        frente: "Do que o cliente cuida?",
                        verso: "Da segurança na nuvem: dados, acesso e configuração.",
                    },
                    {
                        frente: "Que modelos de nuvem a prova compara?",
                        verso: "Pública, privada e híbrida.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Por onde toda operação no Azure passa?",
                        verso: "Pelo Azure Resource Manager.",
                    },
                    {
                        frente: "Onde o Resource Manager autentica você?",
                        verso: "No Microsoft Entra ID.",
                    },
                    {
                        frente: "Que caminhos chegam ao Resource Manager?",
                        verso: "Portal, CLI, PowerShell, SDK e chamada REST.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que regra prática guia a escolha do serviço de computação?",
                        verso: "Começar pelo mais gerenciado que resolve o problema.",
                    },
                    {
                        frente: "Quando descer para a máquina virtual?",
                        verso: "Só quando App Service ou Functions não dão conta.",
                    },
                    {
                        frente: "O que o Azure Functions cobra?",
                        verso: "A execução, e não o servidor parado.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o ExpressRoute não usa?",
                        verso: "A internet pública.",
                    },
                    {
                        frente: "O que o ExpressRoute é, então?",
                        verso: "Um circuito privado e dedicado.",
                    },
                    {
                        frente: "O que o VPN Gateway Site-to-Site sobe?",
                        verso: "Um túnel criptografado pela internet.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Contra o que a redundância protege?",
                        verso: "Contra falhas de infraestrutura.",
                    },
                    {
                        frente: "Contra o que ela não protege?",
                        verso: "Contra exclusão acidental ou ransomware.",
                    },
                    {
                        frente: "O que protege contra exclusão acidental?",
                        verso: "O backup, com retenção própria.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que caso pede banco relacional no Azure?",
                        verso: "Schema fixo, com transações e junções.",
                    },
                    {
                        frente: "Que caso pede NoSQL?",
                        verso: "Dado flexível, com escala global e baixa latência.",
                    },
                    {
                        frente: "Que serviço atende esse caso NoSQL global?",
                        verso: "O Azure Cosmos DB.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a regra de ouro da autorização?",
                        verso: "O menor privilégio.",
                    },
                    {
                        frente: "Que função atribuir primeiro?",
                        verso: "A de leitor, subindo só quando for realmente preciso.",
                    },
                    {
                        frente: "Que serviço cuida da identidade no Azure?",
                        verso: "O Microsoft Entra ID.",
                    },
                ],
            },
        },
        8: {
            1: {
                neutra: [
                    {
                        frente: "O que o controle de acesso por função diz?",
                        verso: "Quem pode agir.",
                    },
                    {
                        frente: "O que o Azure Policy diz?",
                        verso: "Como o recurso pode ser configurado.",
                    },
                    {
                        frente: "O que um bloqueio de recurso impede?",
                        verso: "Exclusão ou alteração acidental.",
                    },
                ],
            },
        },
        9: {
            1: {
                neutra: [
                    {
                        frente: "O que acontece com serviços em série no SLA?",
                        verso: "Os valores se multiplicam e o total cai.",
                    },
                    {
                        frente: "Onde o total fica em relação ao serviço mais fraco?",
                        verso: "Sempre abaixo dele.",
                    },
                    {
                        frente: "O que menos peças no caminho fazem pelo SLA?",
                        verso: "Deixam o número final mais alto.",
                    },
                ],
            },
        },
        10: {
            1: {
                neutra: [
                    {
                        frente: "O que o Azure Status mostra?",
                        verso: "O painel público de todos os serviços.",
                    },
                    {
                        frente: "O que o Azure Service Health mostra?",
                        verso: "O que afeta as suas assinaturas.",
                    },
                    {
                        frente: "Que pista aponta para o Service Health na prova?",
                        verso: "A questão falar dos meus recursos.",
                    },
                ],
            },
        },
    },
};
