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
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que dois trabalhos o Defender for Cloud tem?",
                        verso: "Gerir a postura e proteger as cargas em execução.",
                    },
                    {
                        frente: "Como a gestão de postura age?",
                        verso: "De forma proativa, antes do incidente.",
                    },
                    {
                        frente: "Como a proteção de cargas age?",
                        verso: "De forma reativa, detectando ameaça em execução.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde nascem as recomendações de postura?",
                        verso: "Da comparação dos recursos com padrões de referência.",
                    },
                    {
                        frente: "O que corrigir uma recomendação eleva?",
                        verso: "O secure score.",
                    },
                    {
                        frente: "O que o secure score resume?",
                        verso: "A postura de segurança, numa métrica única.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que os planos do Defender ativam?",
                        verso: "A proteção das cargas de trabalho.",
                    },
                    {
                        frente: "O que cada plano gera ao detectar ameaça?",
                        verso: "Alertas de segurança.",
                    },
                    {
                        frente: "Que diferença separa alerta de recomendação?",
                        verso: "O alerta aponta ameaça agora; a recomendação, uma fraqueza.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que dois papéis o Microsoft Sentinel acumula?",
                        verso: "SIEM e SOAR, na nuvem.",
                    },
                    {
                        frente: "O que ele faz como SIEM?",
                        verso: "Coleta e correlaciona eventos de toda a organização.",
                    },
                    {
                        frente: "O que ele faz como SOAR?",
                        verso: "Automatiza a resposta aos incidentes.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que os conectores fazem no Sentinel?",
                        verso: "Coletam os dados das fontes.",
                    },
                    {
                        frente: "O que as regras de análise fazem?",
                        verso: "Detectam e agrupam alertas em incidentes.",
                    },
                    {
                        frente: "Para que serve a caça a ameaças no Sentinel?",
                        verso: "Investigar além do que as regras já preveem.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que sinais o Defender XDR correlaciona?",
                        verso: "E-mail, dispositivos, identidades e apps de nuvem.",
                    },
                    {
                        frente: "O que ele faz com alertas relacionados?",
                        verso: "Agrupa num único incidente.",
                    },
                    {
                        frente: "Onde ele é operado?",
                        verso: "No portal do Defender.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que os Anexos Seguros fazem?",
                        verso: "Testam o arquivo numa área isolada.",
                    },
                    {
                        frente: "O que os Links Seguros fazem?",
                        verso: "Checam a URL no momento do clique.",
                    },
                    {
                        frente: "Para que serve a simulação de ataque?",
                        verso: "Treinar as pessoas contra phishing.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a proteção de próxima geração faz?",
                        verso: "Barra malware no dispositivo.",
                    },
                    {
                        frente: "O que a redução da superfície de ataque faz?",
                        verso: "Fecha portas e comportamentos de risco.",
                    },
                    {
                        frente: "O que o EDR faz?",
                        verso: "Detecta e investiga o que passou pelas barreiras.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o Defender for Cloud Apps revela?",
                        verso: "O shadow IT, com os aplicativos usados sem aprovação.",
                    },
                    {
                        frente: "Que papel ele cumpre?",
                        verso: "O de intermediário de acesso às aplicações em nuvem.",
                    },
                    {
                        frente: "O que o Defender for Identity detecta?",
                        verso: "Ataques às identidades do Active Directory local.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Para onde o Vulnerability Management olha?",
                        verso: "Para dentro: acha e prioriza as suas vulnerabilidades.",
                    },
                    {
                        frente: "Para onde o Threat Intelligence olha?",
                        verso: "Para fora: perfila atacantes e seus indicadores.",
                    },
                    {
                        frente: "Que decisão a priorização de vulnerabilidade apoia?",
                        verso: "O que corrigir primeiro.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o Service Trust Portal traz?",
                        verso: "A documentação de conformidade da própria Microsoft.",
                    },
                    {
                        frente: "O que o portal do Purview administra?",
                        verso: "A conformidade da sua organização.",
                    },
                    {
                        frente: "Que confusão a prova cobra entre os dois portais?",
                        verso: "Trocar a conformidade do fornecedor pela sua.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o compliance score reflete?",
                        verso: "As ações da Microsoft e também as suas.",
                    },
                    {
                        frente: "Como se ganha ponto nesse score?",
                        verso: "Concluindo ações de melhoria.",
                    },
                    {
                        frente: "Que tipos de ação de melhoria existem?",
                        verso: "Preventivas, de detecção e de correção.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que classificar faz?",
                        verso: "Identifica os dados sensíveis.",
                    },
                    {
                        frente: "O que o rótulo de confidencialidade faz?",
                        verso: "Protege: criptografa e marca o conteúdo.",
                    },
                    {
                        frente: "O que a prevenção de perda de dados impede?",
                        verso: "Que esses dados vazem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde a política de retenção age?",
                        verso: "Em locais inteiros, sem ação do usuário.",
                    },
                    {
                        frente: "Onde o rótulo de retenção age?",
                        verso: "Em itens, e pode declarar registros.",
                    },
                    {
                        frente: "O que acontece com um registro regulatório?",
                        verso: "Fica bloqueado, sem poder ser alterado nem removido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Do que a gestão de risco interno cuida?",
                        verso: "Das ameaças vindas de dentro.",
                    },
                    {
                        frente: "O que o eDiscovery faz?",
                        verso: "Preserva e exporta conteúdo para processos legais.",
                    },
                    {
                        frente: "O que a auditoria registra?",
                        verso: "Quem fez o quê, e quando.",
                    },
                ],
            },
        },
    },
};
