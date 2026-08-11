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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que forma o Acesso Condicional tem?",
                        verso: "A de uma regra se-então.",
                    },
                    {
                        frente: "Que sinais ele reúne?",
                        verso: "Usuário, dispositivo, localização e risco.",
                    },
                    {
                        frente: "Que decisões ele pode tomar?",
                        verso: "Bloquear, ou conceder exigindo mais controles.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que os papéis do Entra gerenciam?",
                        verso: "Identidades e o diretório.",
                    },
                    {
                        frente: "O que o controle de acesso por função do Azure gerencia?",
                        verso: "Os recursos: assinaturas, máquinas e armazenamento.",
                    },
                    {
                        frente: "Que erro a prova cobra nessa dupla?",
                        verso: "Confundir o escopo de cada um.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Entra ID Governance promete?",
                        verso: "O acesso certo, à pessoa certa, na hora certa.",
                    },
                    {
                        frente: "O que um pacote de acesso faz?",
                        verso: "Concede um conjunto de acessos sob solicitação.",
                    },
                    {
                        frente: "O que uma revisão de acesso produz?",
                        verso: "A decisão de manter ou remover cada acesso.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o PIM troca?",
                        verso: "O acesso permanente pelo acesso sob demanda.",
                    },
                    {
                        frente: "Como o administrador fica no PIM?",
                        verso: "Apenas elegível, até ativar o papel.",
                    },
                    {
                        frente: "O que a ativação costuma exigir?",
                        verso: "MFA, justificativa e prazo limitado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o risco de entrada avalia?",
                        verso: "Se o login atual é do dono legítimo.",
                    },
                    {
                        frente: "Que sinais indicam risco de entrada?",
                        verso: "Endereço anônimo e viagem atípica.",
                    },
                    {
                        frente: "O que o risco de usuário avalia?",
                        verso: "Se a conta em si já está comprometida.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que é uma rede virtual no Azure?",
                        verso: "A sua rede privada e isolada.",
                    },
                    {
                        frente: "O que dividir em sub-redes permite?",
                        verso: "Separar os recursos por função.",
                    },
                    {
                        frente: "Que movimento essa separação limita?",
                        verso: "O movimento lateral de um invasor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Como o grupo de segurança de rede decide?",
                        verso: "Por regras de prioridade, na entrada e na saída.",
                    },
                    {
                        frente: "Que comportamento ele tem quanto ao estado?",
                        verso: "É stateful: a resposta volta sozinha.",
                    },
                    {
                        frente: "O que ele protege?",
                        verso: "O tráfego que chega e sai dos recursos da sub-rede.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o Azure Firewall protege?",
                        verso: "O tráfego da rede virtual, de forma central e gerenciada.",
                    },
                    {
                        frente: "O que o firewall de aplicação web protege?",
                        verso: "As aplicações web, contra ataques de camada 7.",
                    },
                    {
                        frente: "Que ataques ele barra?",
                        verso: "Injeção e execução de script no navegador, entre outros.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a proteção contra DDoS faz?",
                        verso: "Absorve e mitiga ataques que inundam a rede.",
                    },
                    {
                        frente: "Com que frequência ela monitora o tráfego?",
                        verso: "O tempo todo.",
                    },
                    {
                        frente: "Que objetivo o ataque de DDoS tem?",
                        verso: "Derrubar o serviço pelo volume.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o Azure Bastion dá?",
                        verso: "Acesso remoto seguro sem endereço público na máquina.",
                    },
                    {
                        frente: "O que o Key Vault centraliza?",
                        verso: "Segredos, chaves e certificados.",
                    },
                    {
                        frente: "O que os dois têm em comum?",
                        verso: "Tiram do caminho a exposição direta do recurso.",
                    },
                ],
            },
        },
    },
};
