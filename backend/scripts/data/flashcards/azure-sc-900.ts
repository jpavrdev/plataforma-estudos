import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de AZURE SC-900, trilha de certificação sem roadmap.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o cenário; as
 * cartas guardam as definições fechadas, as listas de princípios e a
 * ligação entre a necessidade e o serviço da Microsoft.
 */
export const azureSc900: CartasDaTrilha = {
    trilha: "AZURE SC-900",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que é sempre responsabilidade sua no modelo compartilhado?",
                        verso: "Dados, identidades e dispositivos.",
                    },
                    {
                        frente: "O que a defesa em profundidade faz?",
                        verso: "Empilha camadas de proteção independentes.",
                    },
                    {
                        frente: "O que muda entre os modelos de serviço em nuvem?",
                        verso: "Quanto da pilha o provedor assume.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o lema do Zero Trust?",
                        verso: "Nunca confie, sempre verifique.",
                    },
                    {
                        frente: "Que três princípios o guiam?",
                        verso: "Verificar explicitamente, privilégio mínimo e assumir a violação.",
                    },
                    {
                        frente: "O que assumir a violação muda no projeto?",
                        verso: "Limita o estrago, presumindo o invasor já dentro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a criptografia protege?",
                        verso: "A confidencialidade, e é reversível com a chave certa.",
                    },
                    {
                        frente: "Como o hashing funciona?",
                        verso: "De mão única, e sem usar chave.",
                    },
                    {
                        frente: "Para que o hashing serve?",
                        verso: "Guardar senhas e verificar integridade.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a governança define?",
                        verso: "As regras e os controles.",
                    },
                    {
                        frente: "O que a gestão de risco faz?",
                        verso: "Identifica, avalia e responde às ameaças.",
                    },
                    {
                        frente: "O que a conformidade garante?",
                        verso: "Que a organização siga leis e normas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a autenticação prova?",
                        verso: "Quem você é.",
                    },
                    {
                        frente: "O que a autorização define?",
                        verso: "O que você pode fazer.",
                    },
                    {
                        frente: "O que o provedor de identidade habilita?",
                        verso: "O logon único entre aplicações.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "O que o Microsoft Entra ID faz?",
                        verso: "Autentica e autoriza pessoas, aplicativos e dispositivos.",
                    },
                    {
                        frente: "Onde ele vive?",
                        verso: "Na nuvem, como serviço de identidade.",
                    },
                    {
                        frente: "O que virou o novo perímetro?",
                        verso: "A identidade.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que tipos de identidade o Entra ID gerencia?",
                        verso: "Usuários, grupos, entidades de serviço e identidades gerenciadas.",
                    },
                    {
                        frente: "O que uma identidade gerenciada evita?",
                        verso: "Guardar credencial no código da aplicação.",
                    },
                    {
                        frente: "O que uma entidade de serviço representa?",
                        verso: "Uma aplicação dentro do diretório.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a identidade híbrida entrega?",
                        verso: "Uma só identidade para o mundo local e a nuvem.",
                    },
                    {
                        frente: "Que componente sincroniza as contas?",
                        verso: "O Microsoft Entra Connect.",
                    },
                    {
                        frente: "De onde as contas vêm nessa sincronização?",
                        verso: "Do Active Directory local.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a MFA exige?",
                        verso: "Duas ou mais provas de categorias diferentes.",
                    },
                    {
                        frente: "Que categorias existem?",
                        verso: "Algo que você sabe, algo que tem e algo que é.",
                    },
                    {
                        frente: "O que a MFA impede com a senha vazada?",
                        verso: "Que o atacante entre sem o segundo fator.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o SSPR devolve ao usuário?",
                        verso: "O poder de redefinir a própria senha.",
                    },
                    {
                        frente: "O que a proteção de senha barra?",
                        verso: "As senhas fracas, por listas de banidas.",
                    },
                    {
                        frente: "O que o smart lockout trava?",
                        verso: "O atacante, sem bloquear o usuário legítimo.",
                    },
                ],
            },
        },
    },
};
