// Seed do simulado Microsoft Security, Compliance, and Identity Fundamentals (SC-900).
// Idempotente: se o simulado já tiver questões, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-sc-900.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "sc-900";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    {
        "statement": "Uma empresa avalia mover cargas de trabalho para a nuvem e pergunta quem fica responsável pela segurança física dos datacenters. No modelo de responsabilidade compartilhada, de quem é essa responsabilidade?",
        "explanation": "No modelo de responsabilidade compartilhada, a segurança física dos datacenters, dos hosts e da rede física é sempre do provedor de nuvem, independentemente de SaaS, PaaS ou IaaS. O cliente não tem acesso físico às instalações, então não pode auditá-las; a divisão meio a meio e a exceção só no IaaS não existem.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Do provedor de nuvem (a Microsoft), em qualquer modelo de serviço",
                true
            ],
            [
                "Do cliente, que deve auditar fisicamente os datacenters",
                false
            ],
            [
                "É sempre dividida meio a meio entre cliente e provedor",
                false
            ],
            [
                "Do cliente, mas apenas no modelo IaaS",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe provisiona máquinas virtuais no Azure (modelo IaaS) para hospedar um sistema legado. Quem é responsável por aplicar as atualizações e correções do sistema operacional convidado dessas VMs?",
        "explanation": "No IaaS o provedor cuida da infraestrutura física e da virtualização, mas o sistema operacional convidado, as aplicações e os dados ficam sob responsabilidade do cliente, inclusive os patches do SO. Em PaaS e SaaS a Microsoft assume mais camadas, o que não ocorre no IaaS; e dizer que VMs não precisam de atualização é incorreto.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "O cliente, pois no IaaS a manutenção do sistema operacional convidado é dele",
                true
            ],
            [
                "A Microsoft, que aplica todos os patches automaticamente no IaaS",
                false
            ],
            [
                "Ninguém: máquinas virtuais no Azure não precisam de atualização",
                false
            ],
            [
                "O provedor, porque o sistema operacional é sempre responsabilidade da nuvem",
                false
            ]
        ]
    },
    {
        "statement": "Ao explicar o modelo de responsabilidade compartilhada, um arquiteto quer destacar o que permanece com o cliente em SaaS, PaaS e IaaS, sem exceção. Qual item é sempre responsabilidade do cliente?",
        "explanation": "Independentemente do modelo de serviço, os dados, os dispositivos (endpoints) e o gerenciamento de contas e identidades são sempre do cliente. Segurança física, hosts e rede física são sempre do provedor, por isso as demais opções descrevem responsabilidades da Microsoft, não do cliente.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Os dados, os dispositivos e as contas e identidades",
                true
            ],
            [
                "Os controles de segurança física do datacenter",
                false
            ],
            [
                "A camada de virtualização e os hosts físicos",
                false
            ],
            [
                "A rede física que interliga os servidores",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização adota várias camadas de proteção (segurança física, identidade, perímetro, rede, aplicação e dados) para que a falha de uma camada não comprometa tudo. Que abordagem de segurança é essa?",
        "explanation": "Defesa em profundidade usa múltiplas camadas independentes de controles, de modo que um invasor precise vencer várias barreiras. Responsabilidade compartilhada trata de quem cuida do quê na nuvem; federação é confiança entre provedores de identidade; e criptografia é apenas uma das camadas, não a estratégia em camadas em si.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Defesa em profundidade (defense in depth)",
                true
            ],
            [
                "Responsabilidade compartilhada",
                false
            ],
            [
                "Federação de identidade",
                false
            ],
            [
                "Criptografia de ponta a ponta",
                false
            ]
        ]
    },
    {
        "statement": "Um modelo de segurança parte da premissa de que nenhuma solicitação é confiável por padrão, mesmo vinda de dentro da rede corporativa, e exige validação a cada acesso. Qual modelo descreve isso?",
        "explanation": "Zero Trust adota o lema 'nunca confie, sempre verifique', não presumindo confiança nem para o tráfego interno. O modelo tradicional de perímetro (castelo e fosso) confia em quem já está na rede, o oposto do Zero Trust. Defesa em profundidade e responsabilidade compartilhada tratam de outros aspectos.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Zero Trust",
                true
            ],
            [
                "Rede de perímetro tradicional (castelo e fosso)",
                false
            ],
            [
                "Defesa em profundidade",
                false
            ],
            [
                "Responsabilidade compartilhada",
                false
            ]
        ]
    },
    {
        "statement": "Ao implantar Zero Trust, uma empresa quer seguir os três princípios orientadores do modelo. Qual conjunto representa esses princípios?",
        "explanation": "Os três princípios do Zero Trust são verificar explicitamente (validar cada acesso pelos sinais disponíveis), privilégio mínimo (limitar o acesso ao necessário) e assumir a violação (agir como se o ambiente já estivesse comprometido). Confiar na rede interna contraria o modelo; criptografia com backup e o modelo AAA são conceitos distintos.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Verificar explicitamente, usar acesso com privilégio mínimo e assumir a violação",
                true
            ],
            [
                "Confiar na rede interna, abrir acesso amplo e auditar depois",
                false
            ],
            [
                "Criptografar, fazer backup e replicar geograficamente",
                false
            ],
            [
                "Autenticar, autorizar e contabilizar (modelo AAA)",
                false
            ]
        ]
    },
    {
        "statement": "Para reduzir o impacto de um eventual comprometimento, uma equipe passa a segmentar o acesso, limitar o raio de explosão e tratar cada requisição como se a rede já estivesse invadida. Qual princípio do Zero Trust está sendo aplicado?",
        "explanation": "Segmentar, minimizar o raio de explosão e presumir que o ambiente já está comprometido são a essência do princípio 'assumir a violação'. Verificar explicitamente foca em validar cada acesso pelos sinais; privilégio mínimo foca em conceder só o necessário; e federação não é um princípio do Zero Trust.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Assumir a violação (assume breach)",
                true
            ],
            [
                "Verificar explicitamente",
                false
            ],
            [
                "Usar acesso com privilégio mínimo",
                false
            ],
            [
                "Federar identidades",
                false
            ]
        ]
    },
    {
        "statement": "Um desenvolvedor precisa entender a diferença entre criptografia simétrica e assimétrica. Qual afirmação está correta?",
        "explanation": "Na criptografia simétrica a mesma chave cifra e decifra; na assimétrica há um par (chave pública e chave privada). A segunda opção inverte os conceitos; nem sempre usam a mesma chave; e uma função unidirecional que não pode ser revertida descreve hashing, não criptografia assimétrica.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "A simétrica usa a mesma chave para cifrar e decifrar; a assimétrica usa um par de chaves pública e privada",
                true
            ],
            [
                "A simétrica usa um par de chaves pública e privada; a assimétrica usa a mesma chave nos dois lados",
                false
            ],
            [
                "Ambas usam sempre a mesma chave, diferindo apenas no tamanho dela",
                false
            ],
            [
                "A assimétrica é uma função unidirecional que não pode ser revertida",
                false
            ]
        ]
    },
    {
        "statement": "Uma aplicação precisa armazenar senhas de forma que, mesmo se o banco de dados vazar, os valores originais não possam ser recuperados a partir do que foi guardado. Qual técnica é a mais adequada?",
        "explanation": "Hashing transforma a entrada em um valor de tamanho fixo por um processo unidirecional, ideal para armazenar senhas, pois não há como reverter o hash à senha original. As criptografias simétrica e assimétrica são reversíveis com a chave correta; e Base64 é apenas codificação, facilmente revertida, sem oferecer proteção.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Hashing, por ser uma função unidirecional",
                true
            ],
            [
                "Criptografia simétrica com uma única chave",
                false
            ],
            [
                "Criptografia assimétrica com chave pública e privada",
                false
            ],
            [
                "Codificação Base64 do texto da senha",
                false
            ]
        ]
    },
    {
        "statement": "Em uma reunião sobre segurança e conformidade, alguém menciona a sigla GRC. O que ela representa?",
        "explanation": "GRC significa Governança, Risco e Conformidade (Governance, Risk, and Compliance): o conjunto de práticas para dirigir a organização, gerenciar riscos e atender a normas e regulamentos. As demais expansões não correspondem à sigla.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Governança, Risco e Conformidade",
                true
            ],
            [
                "Gestão, Rede e Criptografia",
                false
            ],
            [
                "Governança, Recuperação e Continuidade",
                false
            ],
            [
                "Gerenciamento de Redes Corporativas",
                false
            ]
        ]
    },
    {
        "statement": "Ao acessar um sistema, o usuário primeiro informa credenciais para comprovar que é quem diz ser. Como se chama esse processo de verificação da identidade?",
        "explanation": "Autenticação (AuthN) é o processo de provar que você é quem afirma ser. Autorização (AuthZ) vem depois e define o que você pode fazer ou acessar. Auditoria registra atividades, e federação estabelece confiança entre provedores de identidade.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Autenticação",
                true
            ],
            [
                "Autorização",
                false
            ],
            [
                "Auditoria",
                false
            ],
            [
                "Federação",
                false
            ]
        ]
    },
    {
        "statement": "Com o trabalho remoto e os aplicativos em nuvem, os recursos deixam de estar apenas atrás do firewall corporativo. Nesse cenário, o que passa a ser considerado o principal perímetro de segurança?",
        "explanation": "Quando usuários e recursos estão espalhados fora da rede corporativa, a identidade se torna o novo perímetro de segurança, pois controlar quem acessa o quê passa a ser o principal ponto de defesa. Firewall, VPN e datacenter continuam úteis, mas já não delimitam sozinhos o perímetro.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "A identidade",
                true
            ],
            [
                "O firewall de rede local",
                false
            ],
            [
                "A rede privada virtual (VPN)",
                false
            ],
            [
                "O datacenter físico",
                false
            ]
        ]
    },
    {
        "statement": "Vários aplicativos de uma empresa passam a delegar o login a um serviço central que valida as credenciais e emite tokens de segurança, permitindo que o usuário faça um único login e acesse todos eles. Que componente exerce esse papel?",
        "explanation": "O provedor de identidade autentica os usuários e emite tokens que os aplicativos confiam, viabilizando o logon único (SSO). DNS resolve nomes, o balanceador distribui tráfego e o WAF filtra requisições HTTP; nenhum deles autentica identidades nem emite tokens.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Um provedor de identidade (identity provider)",
                true
            ],
            [
                "Um servidor DNS",
                false
            ],
            [
                "Um balanceador de carga",
                false
            ],
            [
                "Um firewall de aplicação web (WAF)",
                false
            ]
        ]
    },
    {
        "statement": "Uma universidade quer permitir que seus pesquisadores usem as próprias contas institucionais para acessar um portal de outra instituição parceira, sem criar novas contas, com base em uma relação de confiança entre as duas organizações. Qual conceito habilita esse acesso entre domínios distintos?",
        "explanation": "A federação estabelece uma relação de confiança entre provedores de identidade de organizações diferentes, permitindo que usuários de um domínio acessem recursos de outro com as próprias credenciais. Sincronização de senhas e SSO atuam tipicamente dentro de um mesmo ambiente, e RBAC define quais permissões cada função tem, não a confiança entre domínios.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Federação",
                true
            ],
            [
                "Sincronização de hashes de senha",
                false
            ],
            [
                "Controle de acesso baseado em função (RBAC)",
                false
            ],
            [
                "Logon único (SSO) dentro de um único domínio",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa que usa o Microsoft 365 quer um serviço de nuvem para gerenciar identidades e controlar o acesso a aplicativos do Microsoft 365, do Azure e a milhares de aplicativos SaaS. Qual serviço da Microsoft atende a isso?",
        "explanation": "O Microsoft Entra ID (antigo Azure Active Directory) é o serviço de gerenciamento de identidade e acesso baseado em nuvem, que controla o acesso ao Microsoft 365, ao Azure e a apps SaaS. O Intune gerencia dispositivos, o Sentinel é o SIEM/SOAR e o Purview cuida de conformidade e governança de dados.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Microsoft Entra ID",
                true
            ],
            [
                "Microsoft Intune",
                false
            ],
            [
                "Microsoft Sentinel",
                false
            ],
            [
                "Microsoft Purview",
                false
            ]
        ]
    },
    {
        "statement": "Um administrador acostumado com o Active Directory Domain Services (AD DS) local pergunta o que muda no Microsoft Entra ID. Qual afirmação descreve corretamente o Entra ID?",
        "explanation": "O Entra ID é um serviço de identidade em nuvem, projetado para autenticação de aplicativos modernos (web e SaaS) via protocolos como OAuth, OpenID Connect e SAML, e não usa domínios, florestas ou GPO como o AD DS local. Por isso ele não é a versão local do AD DS, não é idêntico a ele e não é apenas rede.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "É um serviço de identidade baseado em nuvem, voltado a aplicativos web e SaaS, sem os conceitos de domínio, floresta e GPO do AD DS",
                true
            ],
            [
                "É a versão local do AD DS, instalada em servidores da própria empresa",
                false
            ],
            [
                "É idêntico ao AD DS, usando unidades organizacionais e Group Policy (GPO) da mesma forma",
                false
            ],
            [
                "É um serviço apenas de rede, sem relação com identidades",
                false
            ]
        ]
    },
    {
        "statement": "Uma aplicação hospedada no Azure precisa acessar segredos no Azure Key Vault sem armazenar usuário e senha no código. Qual tipo de identidade do Entra é indicado para isso?",
        "explanation": "A identidade gerenciada dá ao recurso do Azure uma identidade no Entra ID para se autenticar em serviços como o Key Vault sem credenciais no código, com a rotação de credenciais feita pela plataforma. Conta com senha compartilhada é insegura; identidade de convidado (B2B) é para pessoas de fora; e identidade de dispositivo representa a máquina, não a aplicação.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Uma identidade gerenciada (managed identity)",
                true
            ],
            [
                "Uma conta de usuário nomeada com senha compartilhada",
                false
            ],
            [
                "Uma identidade externa de convidado (B2B)",
                false
            ],
            [
                "Uma identidade de dispositivo registrada",
                false
            ]
        ]
    },
    {
        "statement": "Ao registrar um aplicativo no Microsoft Entra ID, é criada uma identidade que representa esse aplicativo/serviço para que ele possa se autenticar e receber permissões, em vez de representar uma pessoa. Como se chama esse tipo de identidade de carga de trabalho?",
        "explanation": "A entidade de serviço (service principal) é a identidade de uma aplicação ou serviço no Entra, usada por identidades de carga de trabalho (workload identities) para autenticar e receber permissões. Conta de usuário representa pessoas, grupo agrupa identidades para atribuir acesso em conjunto, e unidade organizacional é um conceito do AD DS local.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Entidade de serviço (service principal)",
                true
            ],
            [
                "Conta de usuário membro",
                false
            ],
            [
                "Grupo de segurança",
                false
            ],
            [
                "Unidade organizacional",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa começa a implantar agentes de IA que executam ações automatizadas em seus sistemas e quer que cada agente tenha identidade própria no Entra, para conceder acesso, aplicar políticas e governar essas identidades como faz com usuários e aplicativos. Qual recurso do Microsoft Entra atende a essa necessidade?",
        "explanation": "O Agent ID é o tipo de identidade do Entra criado para representar agentes de IA, permitindo conceder acesso, aplicar políticas e governar essas identidades como as de usuários e aplicativos. Caixa de correio compartilhada é do Exchange; o Conditional Access aplica políticas de acesso, mas não é uma identidade; e grupo dinâmico apenas agrupa membros por regras, sem dar identidade ao agente.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Microsoft Entra Agent ID (identidade para agentes de IA)",
                true
            ],
            [
                "Uma caixa de correio compartilhada do Exchange Online",
                false
            ],
            [
                "Uma política de Conditional Access nomeada por agente",
                false
            ],
            [
                "Um grupo dinâmico do Microsoft 365",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização tem seu Active Directory local e adota o Microsoft 365. Ela quer que os usuários usem as mesmas credenciais nos ambientes local e de nuvem, sincronizando as identidades entre o AD DS e o Entra ID. Que abordagem descreve isso?",
        "explanation": "A identidade híbrida conecta o AD DS local ao Entra ID (por meio do Entra Connect ou do Cloud Sync), permitindo aos usuários usar as mesmas credenciais nos dois mundos. Manter identidades separadas anula esse objetivo; a identidade híbrida coexiste com o AD DS local em vez de desativá-lo; e contas B2B são para usuários externos, não para os próprios funcionários.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Identidade híbrida, com sincronização feita pelo Microsoft Entra Connect",
                true
            ],
            [
                "Identidades totalmente separadas, uma para cada ambiente",
                false
            ],
            [
                "Uma migração que desativa o AD DS local imediatamente",
                false
            ],
            [
                "Uso exclusivo de contas de convidado B2B para os funcionários",
                false
            ]
        ]
    },
    {
        "statement": "Para reduzir o risco associado a senhas, uma empresa quer adotar autenticação sem senha (passwordless). Qual conjunto de métodos é adequado para isso no Microsoft Entra?",
        "explanation": "Windows Hello for Business, chaves FIDO2 e o login sem senha pelo Microsoft Authenticator são métodos passwordless suportados pelo Entra, que substituem a senha por biometria, chave ou dispositivo. As demais opções continuam baseadas em senha ou em segredos compartilhados, portanto não são autenticação sem senha.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Windows Hello for Business, chaves de segurança FIDO2 e o aplicativo Microsoft Authenticator (entrada por telefone)",
                true
            ],
            [
                "Senha longa com números e símbolos, trocada a cada 30 dias",
                false
            ],
            [
                "Pergunta de segurança com resposta secreta",
                false
            ],
            [
                "Nome de usuário e senha enviados por e-mail",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer que, além da senha, o login exija uma segunda comprovação, como um código no aplicativo do celular. Que recurso de segurança implementa essa exigência de mais de um fator?",
        "explanation": "A autenticação multifator (MFA) exige dois ou mais fatores de categorias diferentes (algo que você sabe, algo que você tem, algo que você é), como senha mais código no celular. O SSO reduz o número de logins, a criptografia em repouso protege dados armazenados e o RBAC define permissões; nenhum deles adiciona um segundo fator.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Autenticação multifator (MFA)",
                true
            ],
            [
                "Logon único (SSO)",
                false
            ],
            [
                "Criptografia em repouso",
                false
            ],
            [
                "Controle de acesso baseado em função (RBAC)",
                false
            ]
        ]
    },
    {
        "statement": "O help desk de uma empresa recebe muitos chamados de usuários que esqueceram a senha. A empresa quer que os próprios usuários redefinam a senha com segurança, sem abrir chamado. Qual recurso do Microsoft Entra atende a isso?",
        "explanation": "A redefinição de senha self-service (SSPR) permite que o usuário redefina a própria senha após verificar sua identidade, reduzindo chamados ao help desk. O PIM gerencia acesso privilegiado just-in-time, o Conditional Access aplica políticas de acesso e as access reviews revisam permissões; nenhum é o autoatendimento de senha.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Redefinição de senha self-service (SSPR)",
                true
            ],
            [
                "Privileged Identity Management (PIM)",
                false
            ],
            [
                "Conditional Access",
                false
            ],
            [
                "Access reviews",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização quer impedir que os usuários criem senhas fracas ou previsíveis, como variações do nome da empresa (por exemplo 'Empresa@2026'), tanto no Entra ID quanto no AD DS local. Qual recurso atende a essa necessidade?",
        "explanation": "O Entra Password Protection bloqueia senhas fracas ou banidas usando uma lista global da Microsoft mais uma lista personalizada da organização, e pode ser estendido ao AD DS local. O SSPR apenas permite redefinir a senha; a MFA adiciona um fator, mas não avalia a força da senha; e o Defender for Identity detecta ameaças em identidade, sem impor regras de senha.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Microsoft Entra Password Protection, com listas de senhas banidas global e personalizada",
                true
            ],
            [
                "Redefinição de senha self-service (SSPR)",
                false
            ],
            [
                "Autenticação multifator (MFA)",
                false
            ],
            [
                "Microsoft Defender for Identity",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer aplicar regras do tipo 'se um usuário acessar de um local incomum, então exigir MFA ou bloquear', avaliando sinais como usuário, dispositivo, local e risco no momento do login. Qual recurso do Microsoft Entra faz isso?",
        "explanation": "O Conditional Access avalia sinais (usuário, dispositivo, localização, aplicativo e risco) e aplica decisões como conceder, bloquear ou exigir MFA ou dispositivo em conformidade. O SSPR trata de redefinição de senha, o Entra Connect sincroniza identidades híbridas e as managed identities são identidades de recursos do Azure.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Conditional Access (Acesso Condicional)",
                true
            ],
            [
                "Redefinição de senha self-service (SSPR)",
                false
            ],
            [
                "Microsoft Entra Connect",
                false
            ],
            [
                "Managed identities",
                false
            ]
        ]
    },
    {
        "statement": "Uma política deve permitir o acesso ao portal financeiro sem MFA quando o usuário está na rede corporativa, mas exigir MFA quando o acesso vem de fora dela. Qual recurso do Entra permite definir essa política baseada em sinais como a localização?",
        "explanation": "O Conditional Access permite condicionar o controle de acesso (por exemplo, exigir MFA) a sinais como a localização de rede, aplicando MFA apenas fora da rede corporativa. O PIM trata da ativação temporária de papéis privilegiados; o ID Protection avalia risco e pode alimentar políticas, mas quem aplica a decisão é o Conditional Access; e as access reviews revisam acessos existentes.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Conditional Access, usando o local de rede como condição",
                true
            ],
            [
                "Privileged Identity Management (PIM)",
                false
            ],
            [
                "Entra ID Protection isoladamente",
                false
            ],
            [
                "Access reviews",
                false
            ]
        ]
    },
    {
        "statement": "Para seguir o princípio do privilégio mínimo, um administrador precisa dar a um analista do help desk permissão apenas para redefinir senhas de usuários, sem conceder controle total do tenant. Qual abordagem é a mais adequada no Microsoft Entra?",
        "explanation": "O RBAC do Entra oferece papéis com escopo de permissões; conceder o papel de Administrador de Senha dá exatamente o necessário, seguindo o privilégio mínimo. Administrador Global concede poder excessivo; compartilhar credenciais é uma péssima prática de segurança; e Administrador de Cobrança cuida de faturamento, não de redefinir senhas.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Atribuir um papel específico e limitado, como Administrador de Senha, em vez de Administrador Global",
                true
            ],
            [
                "Atribuir o papel de Administrador Global para simplificar",
                false
            ],
            [
                "Compartilhar as credenciais de uma conta de Administrador Global",
                false
            ],
            [
                "Adicionar o analista ao papel de Administrador de Cobrança",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer revisar periodicamente se os membros de um grupo com acesso a um sistema sensível ainda precisam desse acesso, removendo quem não precisa mais. Qual recurso do Microsoft Entra ID Governance atende a isso?",
        "explanation": "As access reviews permitem revisar periodicamente acessos (membros de grupos, acesso a aplicativos e atribuições de papel) e remover o que não é mais necessário, apoiando a governança de identidade. O Conditional Access controla o acesso no momento do login, a MFA adiciona um fator e o Password Protection avalia senhas; nenhum faz a recertificação periódica de acessos.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Access reviews (revisões de acesso)",
                true
            ],
            [
                "Conditional Access",
                false
            ],
            [
                "Autenticação multifator (MFA)",
                false
            ],
            [
                "Microsoft Entra Password Protection",
                false
            ]
        ]
    },
    {
        "statement": "Os administradores de uma empresa precisam de papéis privilegiados apenas ocasionalmente. A empresa quer que esses papéis fiquem elegíveis e sejam ativados só quando necessário, por tempo limitado, com aprovação e registro, reduzindo o acesso permanente. Qual recurso do Microsoft Entra atende a isso?",
        "explanation": "O PIM oferece acesso privilegiado just-in-time: os papéis ficam elegíveis e são ativados temporariamente, com aprovação, justificativa e auditoria, reduzindo o acesso permanente (standing access). O Conditional Access aplica políticas no login, o SSPR trata de senhas e o Entra Connect sincroniza identidades híbridas; nenhum faz elevação temporária de privilégios.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Privileged Identity Management (PIM)",
                true
            ],
            [
                "Conditional Access",
                false
            ],
            [
                "Redefinição de senha self-service (SSPR)",
                false
            ],
            [
                "Microsoft Entra Connect",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer detectar automaticamente credenciais vazadas e logins suspeitos (por exemplo, de locais improváveis) e classificar esses eventos por nível de risco para tratá-los. Qual recurso do Microsoft Entra é o mais indicado?",
        "explanation": "O Entra ID Protection usa sinais e detecções para identificar riscos de identidade (como credenciais vazadas e entradas suspeitas), classificando risco de usuário e de entrada para remediação, inclusive alimentando políticas baseadas em risco. O PIM cuida de acesso privilegiado, as access reviews recertificam acessos e o Purview trata de conformidade de dados.",
        "topic": "Conceitos de SCI e Microsoft Entra",
        "options": [
            [
                "Microsoft Entra ID Protection",
                true
            ],
            [
                "Privileged Identity Management (PIM)",
                false
            ],
            [
                "Access reviews",
                false
            ],
            [
                "Microsoft Purview",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe de desenvolvimento guarda senhas de banco de dados, chaves de API e certificados diretamente no código-fonte da aplicação e quer centralizar esses segredos em um cofre gerenciado pela Azure. Qual serviço atende a essa necessidade?",
        "explanation": "Azure Key Vault é o serviço para armazenar e gerenciar de forma centralizada segredos (senhas, strings de conexão), chaves criptográficas e certificados, tirando esses dados sensíveis do código. Azure Bastion dá acesso RDP/SSH seguro a VMs; o NSG filtra tráfego de rede por IP/porta; e o Azure DDoS Protection defende contra ataques de negação de serviço. Nenhum deles guarda segredos.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Key Vault",
                true
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Network Security Group (NSG)",
                false
            ],
            [
                "Azure DDoS Protection",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa precisa acessar suas máquinas virtuais via RDP e SSH sem expor portas nem atribuir IP público às VMs, conectando-se com segurança diretamente pelo portal do Azure. Qual serviço oferece isso?",
        "explanation": "Azure Bastion fornece conectividade RDP e SSH segura às VMs diretamente pelo portal do Azure via TLS, sem precisar de IP público na VM nem expor essas portas à internet. Key Vault guarda segredos; Azure Firewall filtra tráfego de rede de forma centralizada; e o WAF protege aplicações web de ataques como injeção de SQL. Nenhum desses provê o acesso administrativo seguro às VMs.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Bastion",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Azure Firewall",
                false
            ],
            [
                "Web Application Firewall (WAF)",
                false
            ]
        ]
    },
    {
        "statement": "Um administrador quer permitir ou negar tráfego de rede de/para recursos em uma sub-rede de uma rede virtual (VNet), com regras simples baseadas em endereço IP de origem/destino, porta e protocolo. Qual recurso do Azure faz esse filtro básico?",
        "explanation": "O Network Security Group (NSG) contém regras de segurança que permitem ou negam tráfego de entrada e saída com base em IP de origem/destino, porta e protocolo, sendo o filtro básico associado a sub-redes ou interfaces de rede. Key Vault guarda segredos; Microsoft Sentinel é a solução de SIEM/SOAR; e Azure Bastion dá acesso RDP/SSH. Nenhum deles é o filtro de pacotes da VNet.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Network Security Group (NSG)",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Microsoft Sentinel",
                false
            ],
            [
                "Azure Bastion",
                false
            ]
        ]
    },
    {
        "statement": "Uma loja online quer proteger seu site contra explorações comuns da camada de aplicação, como injeção de SQL (SQL injection) e cross-site scripting (XSS). Qual serviço da Azure é projetado para isso?",
        "explanation": "O Web Application Firewall (WAF) protege aplicações web contra vulnerabilidades e explorações comuns da camada de aplicação, como injeção de SQL e cross-site scripting, tipicamente com base no conjunto de regras do OWASP. Azure DDoS Protection defende contra floods de tráfego; Azure Bastion dá acesso seguro a VMs; e o NSG faz filtro básico por IP/porta, sem inspecionar ataques web.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Web Application Firewall (WAF)",
                true
            ],
            [
                "Azure DDoS Protection",
                false
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Network Security Group (NSG)",
                false
            ]
        ]
    },
    {
        "statement": "Um site de vendas sofre ataques em que uma enxurrada de tráfego malicioso tenta sobrecarregar seus recursos até deixá-los indisponíveis. Qual serviço da Azure é voltado a mitigar esse tipo de ataque de negação de serviço distribuído?",
        "explanation": "Azure DDoS Protection detecta e mitiga ataques de negação de serviço distribuído (DDoS), em que grandes volumes de tráfego tentam esgotar os recursos e derrubar o serviço. Key Vault guarda segredos; Azure Bastion dá acesso RDP/SSH; e o Defender for Cloud cuida da postura de segurança e proteção de workloads, não da mitigação de floods de tráfego de rede.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure DDoS Protection",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe de segurança quer uma solução nativa de nuvem que colete e correlacione logs de toda a organização para detectar e responder a ameaças, combinando SIEM e SOAR. Qual serviço da Microsoft oferece isso?",
        "explanation": "Microsoft Sentinel é a solução nativa de nuvem que reúne SIEM (coleta e correlação de dados de segurança em escala) e SOAR (orquestração e automação de resposta), permitindo detectar, investigar e responder a ameaças em toda a organização. Azure Firewall filtra tráfego; Key Vault guarda segredos; e Azure Bastion provê acesso a VMs.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Sentinel",
                true
            ],
            [
                "Azure Firewall",
                false
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Azure Bastion",
                false
            ]
        ]
    },
    {
        "statement": "Um gestor quer um painel que mostre uma pontuação geral da postura de segurança do ambiente na nuvem e recomendações priorizadas para melhorá-la. Qual serviço fornece o secure score e essas recomendações?",
        "explanation": "Microsoft Defender for Cloud avalia continuamente o ambiente e apresenta o secure score (uma medida da postura de segurança) junto de recomendações priorizadas para reduzir riscos. Azure Bastion dá acesso a VMs; DDoS Protection mitiga floods de tráfego; e o WAF protege aplicações web — nenhum entrega a pontuação de postura de segurança.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Defender for Cloud",
                true
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Azure DDoS Protection",
                false
            ],
            [
                "Web Application Firewall (WAF)",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização quer um firewall gerenciado, altamente disponível e centralizado, oferecido como serviço, para controlar o tráfego de rede que entra e sai de suas redes virtuais no Azure. Qual serviço atende?",
        "explanation": "Azure Firewall é um firewall de rede gerenciado, stateful, altamente disponível e centralizado, oferecido como serviço para proteger recursos das redes virtuais (VNets). Key Vault guarda segredos; Microsoft Sentinel é SIEM/SOAR; e Azure Bastion dá acesso RDP/SSH — nenhum é o firewall de rede gerenciado.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Firewall",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Microsoft Sentinel",
                false
            ],
            [
                "Azure Bastion",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa já usa NSGs para filtragem básica de tráfego, mas agora precisa de filtragem centralizada mais avançada, com regras baseadas em nomes de domínio (FQDN) e filtragem por inteligência contra ameaças (threat intelligence). Qual serviço é o mais indicado?",
        "explanation": "Azure Firewall oferece filtragem centralizada e avançada, incluindo regras de aplicação por FQDN e filtragem baseada em threat intelligence — capacidades além do NSG, que faz apenas filtro básico por IP, porta e protocolo. Adicionar outro NSG não traz filtragem por FQDN nem threat intel; Bastion dá acesso a VMs; e Key Vault guarda segredos.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Firewall",
                true
            ],
            [
                "Outro Network Security Group (NSG)",
                false
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Azure Key Vault",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe quer avaliar a postura de segurança dos recursos de nuvem e proteger workloads específicos (VMs, bancos, armazenamento) contra ameaças. Uma segunda necessidade, separada, é agregar logs de toda a empresa em um SIEM para investigação. Qual serviço atende à PRIMEIRA necessidade?",
        "explanation": "Microsoft Defender for Cloud cuida da postura de segurança (CSPM) e da proteção de workloads (CWPP) dos recursos de nuvem. Microsoft Sentinel é o SIEM/SOAR que agrega logs de toda a organização para detecção e investigação — atende à segunda necessidade, não à primeira. Azure Firewall filtra tráfego e o DDoS Protection mitiga floods; nenhum avalia postura nem protege workloads.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Defender for Cloud",
                true
            ],
            [
                "Microsoft Sentinel",
                false
            ],
            [
                "Azure Firewall",
                false
            ],
            [
                "Azure DDoS Protection",
                false
            ]
        ]
    },
    {
        "statement": "Dentro do Microsoft Defender for Cloud, qual capacidade avalia continuamente os recursos em busca de configurações inseguras e fornece recomendações para corrigir esses problemas de postura?",
        "explanation": "O Cloud Security Posture Management (CSPM) avalia continuamente os recursos contra boas práticas, identifica configurações inseguras e gera recomendações e o secure score. A proteção de workloads (CWPP) foca em detectar ameaças em cargas específicas; o WAF protege aplicações web; e o Microsoft Sentinel é o SIEM/SOAR — nenhum é a avaliação de postura em si.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Cloud Security Posture Management (CSPM)",
                true
            ],
            [
                "Proteção de workloads na nuvem (CWPP)",
                false
            ],
            [
                "Web Application Firewall (WAF)",
                false
            ],
            [
                "Microsoft Sentinel",
                false
            ]
        ]
    },
    {
        "statement": "No Microsoft Defender for Cloud, uma equipe acompanha o secure score ao longo do tempo. O que uma pontuação de secure score MAIS ALTA indica?",
        "explanation": "O secure score resume a postura de segurança: quanto mais alto, melhor a postura, refletindo recomendações de segurança atendidas. Ele não mede ataques DDoS bloqueados, volume de logs ingeridos em SIEM nem quantidade de segredos no Key Vault — esses não são o que o score representa.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Uma postura de segurança melhor, com mais recomendações atendidas",
                true
            ],
            [
                "Um número maior de ataques DDoS bloqueados",
                false
            ],
            [
                "Mais dados de log ingeridos no SIEM",
                false
            ],
            [
                "Maior quantidade de segredos armazenados no Key Vault",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer proteção contra ameaças e alertas de segurança específicos para cargas de trabalho como servidores, bancos de dados SQL, armazenamento e contêineres. Qual capacidade do Microsoft Defender for Cloud oferece essas proteções por meio de planos dedicados?",
        "explanation": "A proteção de workloads na nuvem (CWPP) do Defender for Cloud oferece detecção de ameaças e alertas por meio de planos dedicados (Defender para Servidores, para SQL, para Armazenamento, para Contêineres etc.). O secure score mede postura, não protege cargas; Azure Bastion dá acesso a VMs; e o NSG faz filtro de rede básico.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Proteção de workloads na nuvem (Cloud Workload Protection)",
                true
            ],
            [
                "Secure score",
                false
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Network Security Group (NSG)",
                false
            ]
        ]
    },
    {
        "statement": "Após detectar um incidente, a equipe de segurança quer automatizar a resposta — por exemplo, isolar uma conta e abrir um chamado — usando playbooks. Qual capacidade do Microsoft Sentinel provê essa automação e orquestração?",
        "explanation": "A capacidade SOAR (Security Orchestration, Automation, and Response) do Microsoft Sentinel automatiza e orquestra respostas por meio de playbooks. O SIEM é a coleta e correlação de dados para detecção; o CSPM avalia a postura no Defender for Cloud; e a threat intelligence do Azure Firewall filtra tráfego. Só o SOAR trata da automação de resposta.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "SOAR (orquestração, automação e resposta de segurança)",
                true
            ],
            [
                "SIEM (gerenciamento de eventos e informações de segurança)",
                false
            ],
            [
                "CSPM (gerenciamento da postura de segurança)",
                false
            ],
            [
                "Threat intelligence do Azure Firewall",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer eliminar os IPs públicos das VMs e parar de abrir as portas 3389 (RDP) e 22 (SSH) para a internet, mas ainda precisa que os administradores acessem essas VMs com segurança. Qual serviço resolve isso?",
        "explanation": "Azure Bastion permite acesso RDP/SSH seguro às VMs pelo portal via TLS, sem IP público na VM e sem expor as portas 3389/22 à internet, reduzindo a superfície de ataque. Key Vault guarda segredos; o WAF protege aplicações web; e o Microsoft Sentinel é SIEM/SOAR — nenhum provê esse acesso administrativo seguro.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Bastion",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Web Application Firewall (WAF)",
                false
            ],
            [
                "Microsoft Sentinel",
                false
            ]
        ]
    },
    {
        "statement": "Duas necessidades: (1) filtrar o tráfego de rede geral que entra e sai das VNets e (2) proteger especificamente um aplicativo web contra injeção de SQL e XSS. Qual par de serviços atende, respectivamente, a essas necessidades?",
        "explanation": "Azure Firewall faz a filtragem de tráfego de rede geral das VNets, enquanto o WAF é especializado em proteger aplicações web contra explorações da camada de aplicação, como injeção de SQL e XSS. A ordem inversa troca os papéis; e os pares Bastion/DDoS e NSG/Key Vault não correspondem a essas duas funções.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Firewall e Web Application Firewall (WAF)",
                true
            ],
            [
                "Web Application Firewall (WAF) e Azure Firewall",
                false
            ],
            [
                "Azure Bastion e Azure DDoS Protection",
                false
            ],
            [
                "Network Security Group (NSG) e Azure Key Vault",
                false
            ]
        ]
    },
    {
        "statement": "Uma arquiteta quer isolar cargas de trabalho em segmentos de rede separados na nuvem — por exemplo, separando servidores de front-end dos de banco de dados — para conter movimentação lateral. Qual é o recurso fundamental do Azure para criar essa segmentação de rede privada?",
        "explanation": "As redes virtuais (VNets), divididas em sub-redes, são o bloco fundamental para criar redes privadas e segmentar cargas de trabalho, isolando-as e ajudando a conter movimentação lateral. Key Vault guarda segredos; o secure score mede postura; e playbooks do Sentinel automatizam respostas — nenhum é o recurso de segmentação de rede.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Redes virtuais (VNets) e sub-redes",
                true
            ],
            [
                "Azure Key Vault",
                false
            ],
            [
                "Secure score do Defender for Cloud",
                false
            ],
            [
                "Playbooks do Microsoft Sentinel",
                false
            ]
        ]
    },
    {
        "statement": "Uma aplicação precisa de um repositório gerenciado para criar e controlar chaves de criptografia e armazenar certificados TLS com respaldo de módulos de segurança de hardware (HSM). Qual serviço da Azure é indicado?",
        "explanation": "Azure Key Vault centraliza a criação e o gerenciamento de chaves de criptografia, segredos e certificados, com opção de respaldo por HSM (módulos de segurança de hardware). DDoS Protection mitiga floods de tráfego; Defender for Cloud cuida de postura e proteção de workloads; e Azure Bastion dá acesso a VMs — nenhum é o cofre de chaves e certificados.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure Key Vault",
                true
            ],
            [
                "Azure DDoS Protection",
                false
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ],
            [
                "Azure Bastion",
                false
            ]
        ]
    },
    {
        "statement": "Uma equipe precisa diferenciar duas defesas: uma mitiga ataques volumétricos de negação de serviço que inundam a rede com tráfego; a outra inspeciona requisições da camada de aplicação para bloquear injeção de SQL e XSS. Qual alternativa associa CORRETAMENTE cada defesa?",
        "explanation": "Azure DDoS Protection atua contra ataques volumétricos de negação de serviço que inundam a rede, enquanto o Web Application Firewall (WAF) inspeciona a camada de aplicação para bloquear explorações como injeção de SQL e XSS. A opção que inverte os papéis está errada; o NSG faz apenas filtro básico por IP/porta e o Bastion dá acesso a VMs — nenhum dos dois cumpre esses papéis.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Azure DDoS Protection mitiga os ataques volumétricos; o WAF bloqueia SQL injection e XSS",
                true
            ],
            [
                "O WAF mitiga os ataques volumétricos; o Azure DDoS Protection bloqueia SQL injection e XSS",
                false
            ],
            [
                "Ambos os papéis são cumpridos pelo Network Security Group (NSG)",
                false
            ],
            [
                "Ambos os papéis são cumpridos pelo Azure Bastion",
                false
            ]
        ]
    },
    {
        "statement": "Um Centro de Operações de Segurança (SOC) precisa reunir sinais e logs de fontes híbridas e multinuvem — usuários, dispositivos, aplicativos e infraestrutura, inclusive de outras nuvens e do on-premises — em um único lugar para correlacionar e investigar incidentes de toda a empresa. Qual serviço é o mais adequado?",
        "explanation": "Microsoft Sentinel, como SIEM nativo de nuvem, coleta dados em escala de fontes híbridas e multinuvem (usuários, dispositivos, aplicativos e infraestrutura) e os correlaciona para detecção e investigação de incidentes em toda a empresa. Defender for Cloud foca em postura e proteção de workloads de nuvem (e pode enviar alertas ao Sentinel); Azure Firewall filtra tráfego e Key Vault guarda segredos — nenhum é o SIEM corporativo.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Sentinel",
                true
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ],
            [
                "Azure Firewall",
                false
            ],
            [
                "Azure Key Vault",
                false
            ]
        ]
    },
    {
        "statement": "Duas capacidades do Microsoft Defender for Cloud costumam ser confundidas: uma foca em identificar configurações inseguras e melhorar o secure score (função preventiva de postura); a outra detecta ameaças ativas e gera alertas em cargas específicas como VMs e bancos. Como elas se chamam, respectivamente?",
        "explanation": "No Defender for Cloud, o CSPM cuida da postura — encontrar configurações inseguras e elevar o secure score —, enquanto a proteção de workloads (CWPP) detecta ameaças ativas e gera alertas em cargas específicas. SIEM/SOAR são capacidades do Microsoft Sentinel; WAF e DDoS Protection são defesas de rede/aplicação; e Bastion e NSG tratam de acesso e filtro de tráfego — nenhum desses pares descreve postura x proteção de workloads.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "CSPM (postura) e proteção de workloads / CWPP (detecção de ameaças)",
                true
            ],
            [
                "SIEM (postura) e SOAR (detecção de ameaças)",
                false
            ],
            [
                "WAF (postura) e DDoS Protection (detecção de ameaças)",
                false
            ],
            [
                "Azure Bastion (postura) e NSG (detecção de ameaças)",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa executa recursos no Azure, na AWS e no Google Cloud e quer uma visão unificada da postura de segurança, com secure score e recomendações abrangendo os três provedores. Qual serviço da Microsoft entrega esse gerenciamento de postura multinuvem?",
        "explanation": "Microsoft Defender for Cloud faz gerenciamento de postura (CSPM) de forma multinuvem, avaliando recursos no Azure, na AWS e no Google Cloud e apresentando secure score e recomendações unificadas. Azure Firewall e o WAF são defesas de rede/aplicação, e o Bastion dá acesso a VMs; nenhum entrega a visão de postura entre múltiplas nuvens.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Defender for Cloud",
                true
            ],
            [
                "Azure Firewall",
                false
            ],
            [
                "Azure Bastion",
                false
            ],
            [
                "Web Application Firewall (WAF)",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização já usa o Microsoft Defender for Cloud para proteger recursos, mas quer uma camada de operações de segurança que INGIRA os alertas do Defender e de muitas outras fontes, agrupe-os em incidentes, permita caça a ameaças (threat hunting) e automatize a resposta. Qual serviço cumpre esse papel de SIEM/SOAR?",
        "explanation": "Microsoft Sentinel é o SIEM/SOAR que ingere alertas do Defender for Cloud e de muitas outras fontes, agrupa-os em incidentes, apoia a caça a ameaças e automatiza respostas com playbooks. Outro plano do Defender for Cloud continuaria focado em proteger cargas, não em ser o SIEM corporativo; DDoS Protection mitiga floods e Key Vault guarda segredos.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Microsoft Sentinel",
                true
            ],
            [
                "Outro plano do Microsoft Defender for Cloud",
                false
            ],
            [
                "Azure DDoS Protection",
                false
            ],
            [
                "Azure Key Vault",
                false
            ]
        ]
    },
    {
        "statement": "Um arquiteto compara duas opções de controle de rede: o recurso A é gratuito, distribuído e associado a sub-redes/interfaces, filtrando por IP, porta e protocolo; o recurso B é um serviço gerenciado e centralizado, com filtragem por FQDN e threat intelligence. Quais são, respectivamente, A e B?",
        "explanation": "O recurso A descreve o Network Security Group (NSG) — filtro básico, gratuito e distribuído, associado a sub-redes/interfaces —, e o recurso B descreve o Azure Firewall — serviço gerenciado e centralizado, com regras por FQDN e threat intelligence. A ordem inversa troca os papéis; e os pares Bastion/Key Vault e WAF/DDoS não correspondem a essa comparação.",
        "topic": "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        "options": [
            [
                "Network Security Group (NSG) e Azure Firewall",
                true
            ],
            [
                "Azure Firewall e Network Security Group (NSG)",
                false
            ],
            [
                "Azure Bastion e Azure Key Vault",
                false
            ],
            [
                "Web Application Firewall (WAF) e Azure DDoS Protection",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer proteger as caixas de e-mail dos funcionários contra mensagens de phishing, anexos maliciosos e links perigosos. Qual serviço do Microsoft Defender XDR é o indicado?",
        "explanation": "O Microsoft Defender for Office 365 protege contra ameaças em e-mail e ferramentas de colaboração (Teams, SharePoint, OneDrive), incluindo phishing, anexos maliciosos (Safe Attachments) e URLs perigosas (Safe Links). Defender for Endpoint cuida de dispositivos, Defender for Identity do Active Directory local e Defender for Cloud Apps dos aplicativos SaaS.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Office 365",
                true
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Identity",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ]
        ]
    },
    {
        "statement": "O time de segurança precisa prevenir, detectar e investigar ameaças avançadas em notebooks, desktops e servidores da organização. Qual serviço atende a essa necessidade?",
        "explanation": "O Microsoft Defender for Endpoint é a plataforma de segurança de endpoints (dispositivos como notebooks, desktops e servidores), com recursos de EDR (detecção e resposta em endpoints), redução de superfície de ataque e investigação de ameaças. Os demais protegem e-mail, aplicativos SaaS e identidades do AD local, respectivamente.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Endpoint",
                true
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ],
            [
                "Microsoft Defender for Identity",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização quer descobrir quais aplicativos SaaS (como Dropbox, Salesforce e Box) os funcionários usam, incluindo o shadow IT, e controlar como os dados trafegam nesses apps. Qual serviço oferece esse tipo de CASB?",
        "explanation": "O Microsoft Defender for Cloud Apps é um CASB (Cloud Access Security Broker): dá visibilidade sobre aplicativos em nuvem/SaaS, descobre o shadow IT e controla o tráfego de dados nesses apps. Cuidado com o nome parecido: o Defender for Cloud protege recursos e cargas de trabalho do Azure e de multinuvem, não os apps SaaS.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Cloud Apps",
                true
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa mantém um Active Directory local (AD DS) e quer detectar contas comprometidas e ações maliciosas de invasores nesse ambiente. Qual serviço do Defender XDR é o indicado?",
        "explanation": "O Microsoft Defender for Identity usa sinais do Active Directory local (AD DS) para identificar, detectar e investigar ameaças avançadas, identidades comprometidas e ações de insiders maliciosos. É voltado ao AD local; não confunda com o Entra ID Protection, que protege identidades na nuvem (Entra ID).",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Identity",
                true
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ]
        ]
    },
    {
        "statement": "O SOC quer um único portal que reúna alertas, incidentes e investigações dos vários serviços Defender (e-mail, endpoints, identidades e apps) em um só lugar. Qual portal deve ser usado?",
        "explanation": "O portal do Microsoft Defender é a experiência unificada do Defender XDR: consolida alertas, incidentes e investigações dos serviços Defender em um só lugar. O portal do Azure gerencia recursos de nuvem, o centro do Entra cuida de identidades e o portal do Purview trata de conformidade.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Portal do Microsoft Defender (Microsoft Defender portal)",
                true
            ],
            [
                "Portal do Azure",
                false
            ],
            [
                "Centro de administração do Microsoft Entra",
                false
            ],
            [
                "Portal do Microsoft Purview",
                false
            ]
        ]
    },
    {
        "statement": "O que melhor descreve o Microsoft Defender XDR?",
        "explanation": "O Microsoft Defender XDR (antes chamado de Microsoft 365 Defender) é uma suíte de defesa que coordena de forma nativa a detecção, a prevenção, a investigação e a resposta a ameaças entre endpoints, identidades, e-mail e aplicativos, correlacionando os sinais em incidentes. As outras opções descrevem firewall, backup e rotulagem de dados.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Uma solução que coordena, de forma nativa, a detecção e a resposta a ameaças entre endpoints, identidades, e-mail e aplicativos",
                true
            ],
            [
                "Um firewall de rede para filtrar o tráfego de entrada e saída do Azure",
                false
            ],
            [
                "Um serviço de backup e recuperação de máquinas virtuais",
                false
            ],
            [
                "Uma ferramenta de rotulagem e classificação de documentos confidenciais",
                false
            ]
        ]
    },
    {
        "statement": "Ao receber e-mails, os funcionários costumam clicar em links que só depois se revelam maliciosos e abrir anexos com malware. A empresa quer que links e anexos sejam verificados automaticamente antes de causarem dano, inclusive no Teams e no SharePoint. Qual serviço atende?",
        "explanation": "Safe Links e Safe Attachments são recursos do Microsoft Defender for Office 365 que verificam URLs e anexos em tempo real, protegendo o e-mail e as ferramentas de colaboração (Teams, SharePoint, OneDrive). Os demais serviços tratam de dispositivos, apps SaaS e vulnerabilidades, respectivamente.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Office 365, com Safe Links e Safe Attachments",
                true
            ],
            [
                "Microsoft Defender for Endpoint, com redução de superfície de ataque",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps, com políticas de sessão",
                false
            ],
            [
                "Microsoft Defender Vulnerability Management, com avaliação de risco",
                false
            ]
        ]
    },
    {
        "statement": "Após um incidente, o time precisa investigar em um servidor exatamente quais processos foram executados, isolar o dispositivo da rede e responder à ameaça diretamente na máquina. Qual serviço oferece essas capacidades de EDR?",
        "explanation": "O EDR (detecção e resposta em endpoints), incluindo a investigação de processos e o isolamento do dispositivo da rede, é capacidade do Microsoft Defender for Endpoint. O Defender for Identity foca no AD local, o Defender for Office 365 no e-mail e o Defender TI fornece inteligência sobre ameaças, não resposta no dispositivo.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Endpoint",
                true
            ],
            [
                "Microsoft Defender for Identity",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ],
            [
                "Microsoft Defender Threat Intelligence",
                false
            ]
        ]
    },
    {
        "statement": "Um invasor que já entrou na rede tenta se mover lateralmente usando técnicas como pass-the-hash contra os controladores de domínio do Active Directory local. Qual serviço é especializado em detectar esse tipo de ataque a identidades locais?",
        "explanation": "O Microsoft Defender for Identity monitora os sinais dos controladores de domínio do AD local para detectar movimentação lateral, pass-the-hash e outras ameaças a identidades locais. O Entra ID Protection é parecido, mas protege identidades na nuvem (Entra ID), não o Active Directory local.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Identity",
                true
            ],
            [
                "Microsoft Entra ID Protection",
                false
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ]
        ]
    },
    {
        "statement": "A área de segurança percebe que funcionários enviam arquivos corporativos para serviços de nuvem não aprovados pela empresa. Ela quer visibilidade e controle sobre esses aplicativos em nuvem e sobre o uso de dados neles. Qual serviço resolve?",
        "explanation": "Descobrir aplicativos em nuvem não sancionados (shadow IT) e controlar o uso de dados neles é papel do Microsoft Defender for Cloud Apps, um CASB. O Defender for Cloud (nome parecido) protege recursos de infraestrutura em nuvem, como VMs, bancos e containers, não os apps SaaS usados pelos funcionários.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Cloud Apps",
                true
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ]
        ]
    },
    {
        "statement": "O time de TI quer descobrir continuamente vulnerabilidades e configurações incorretas nos dispositivos da empresa e priorizar a correção com base no risco real. Qual serviço é o mais indicado?",
        "explanation": "O Microsoft Defender Vulnerability Management oferece visibilidade contínua de ativos, avaliação de vulnerabilidades e configurações incorretas baseada em risco e ferramentas de remediação para priorizar as correções mais críticas. O Defender TI foca em inteligência sobre ameaças, não na correção de vulnerabilidades dos ativos.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender Vulnerability Management",
                true
            ],
            [
                "Microsoft Defender Threat Intelligence",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ],
            [
                "Microsoft Defender for Identity",
                false
            ]
        ]
    },
    {
        "statement": "Durante uma investigação, um analista quer pesquisar um grupo de invasores específico, entender sua infraestrutura na internet e obter indicadores de comprometimento (IOCs) para enriquecer a caça a ameaças. Qual serviço fornece esse tipo de inteligência?",
        "explanation": "O Microsoft Defender Threat Intelligence (Defender TI) agrega e enriquece inteligência sobre ameaças, mapeando a internet para expor invasores, sua infraestrutura e IOCs, apoiando a caça a ameaças e a resposta a incidentes. Os demais protegem endpoints, apps SaaS e cuidam de vulnerabilidades, respectivamente.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender Threat Intelligence (Defender TI)",
                true
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ],
            [
                "Microsoft Defender Vulnerability Management",
                false
            ]
        ]
    },
    {
        "statement": "Um mesmo ataque gerou alertas separados: um no e-mail, um no dispositivo do usuário e um nas identidades. O SOC quer ver tudo agrupado como um único incidente correlacionado, em vez de alertas isolados. O que torna isso possível?",
        "explanation": "O Microsoft Defender XDR correlaciona automaticamente os alertas dos diferentes serviços (e-mail, endpoint, identidade, apps) em incidentes unificados, dando ao SOC a visão completa do ataque. Firewall, Purview e Bastion tratam de rede, conformidade e acesso remoto, não de correlação de alertas de segurança.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "O Microsoft Defender XDR, que correlaciona os sinais dos serviços em incidentes unificados",
                true
            ],
            [
                "O Azure Firewall, que registra o tráfego bloqueado",
                false
            ],
            [
                "O Microsoft Purview, que classifica os dados envolvidos",
                false
            ],
            [
                "O Azure Bastion, que dá acesso remoto seguro às máquinas",
                false
            ]
        ]
    },
    {
        "statement": "Golpistas se passam por executivos da empresa em e-mails para enganar o time financeiro, fraude conhecida como comprometimento de e-mail corporativo (BEC). Qual serviço ajuda a proteger contra personificação e esse tipo de golpe por e-mail?",
        "explanation": "A proteção contra personificação (impersonation) e comprometimento de e-mail corporativo (BEC) faz parte das políticas anti-phishing do Microsoft Defender for Office 365, que protege o e-mail e a colaboração. Os demais serviços cuidam de dispositivos, identidades do AD local e vulnerabilidades.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Office 365",
                true
            ],
            [
                "Microsoft Defender for Endpoint",
                false
            ],
            [
                "Microsoft Defender for Identity",
                false
            ],
            [
                "Microsoft Defender Vulnerability Management",
                false
            ]
        ]
    },
    {
        "statement": "Um ataque começou com um e-mail de phishing, comprometeu o notebook do usuário e depois usou credenciais roubadas do Active Directory local para se mover pela rede. A liderança quer uma solução que una a detecção e a resposta desses diferentes domínios em uma investigação coordenada, e não vários produtos isolados. Qual solução descreve melhor esse objetivo?",
        "explanation": "Cada Defender individual cobre um domínio (e-mail, endpoint, identidade), mas quem une detecção e resposta entre todos eles, correlacionando os sinais em uma investigação coordenada, é o Microsoft Defender XDR. Escolher só um dos serviços não daria a visão integrada do ataque de ponta a ponta.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender XDR",
                true
            ],
            [
                "Apenas o Microsoft Defender for Office 365",
                false
            ],
            [
                "Apenas o Microsoft Defender for Endpoint",
                false
            ],
            [
                "Apenas o Microsoft Defender for Identity",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa tem identidades na nuvem no Microsoft Entra ID e também um Active Directory local (AD DS) com controladores de domínio. Ela precisa detectar ameaças e comprometimento especificamente nas identidades do ambiente local. Qual serviço é o correto para essa parte local?",
        "explanation": "Para ameaças às identidades do Active Directory local (AD DS), o serviço correto é o Microsoft Defender for Identity. O Entra ID Protection detecta riscos em identidades na nuvem (Entra ID), sendo o par de confusão clássico. Os dois podem coexistir, mas a parte local é do Defender for Identity.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender for Identity",
                true
            ],
            [
                "Microsoft Entra ID Protection",
                false
            ],
            [
                "Microsoft Defender for Cloud Apps",
                false
            ],
            [
                "Microsoft Defender for Cloud",
                false
            ]
        ]
    },
    {
        "statement": "Dois pedidos chegam ao time de segurança: (1) monitorar ameaças e o uso de dados em apps SaaS de terceiros como Salesforce e Dropbox; (2) avaliar a postura de segurança e proteger máquinas virtuais e bancos de dados no Azure. Quais serviços atendem, respectivamente, a cada pedido?",
        "explanation": "Apesar dos nomes parecidos: o Microsoft Defender for Cloud Apps (CASB) trata de apps SaaS como Salesforce e Dropbox (pedido 1); o Microsoft Defender for Cloud cuida da postura de segurança e da proteção de cargas de trabalho na nuvem, como VMs e bancos de dados no Azure (pedido 2).",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Defender for Cloud Apps para (1) e Defender for Cloud para (2)",
                true
            ],
            [
                "Defender for Cloud para (1) e Defender for Cloud Apps para (2)",
                false
            ],
            [
                "Defender for Endpoint para (1) e Defender for Cloud Apps para (2)",
                false
            ],
            [
                "Defender for Cloud Apps para os dois pedidos",
                false
            ]
        ]
    },
    {
        "statement": "O CISO pede um inventário contínuo das fraquezas técnicas dos ativos, como softwares desatualizados e configurações inseguras, com uma priorização baseada em risco para orientar as correções. Ele NÃO quer, neste momento, inteligência sobre grupos de invasores nem resposta a incidentes em endpoints. Qual serviço atende exatamente a esse pedido?",
        "explanation": "Inventário contínuo de vulnerabilidades e configurações incorretas com priorização baseada em risco é a proposta do Microsoft Defender Vulnerability Management. O Defender TI entrega inteligência sobre invasores (explicitamente descartada no pedido), o EDR do Defender for Endpoint foca em resposta no dispositivo e o Defender for Office 365 protege o e-mail.",
        "topic": "Defender XDR e proteção contra ameaças",
        "options": [
            [
                "Microsoft Defender Vulnerability Management",
                true
            ],
            [
                "Microsoft Defender Threat Intelligence",
                false
            ],
            [
                "Microsoft Defender for Endpoint (recursos de EDR)",
                false
            ],
            [
                "Microsoft Defender for Office 365",
                false
            ]
        ]
    },
    {
        "statement": "A equipe jurídica de uma empresa precisa dos relatórios de auditoria independentes (como ISO 27001, SOC 1 e SOC 2) e das certificações de conformidade dos data centers da própria Microsoft para uma avaliação de fornecedor. Onde esses documentos oficiais estão disponíveis?",
        "explanation": "O Service Trust Portal é o repositório onde a Microsoft publica relatórios de auditoria independentes, certificações e documentação de conformidade sobre suas próprias nuvens. O Compliance Manager mede a conformidade da SUA organização; o portal do Purview e o Content explorer lidam com os seus próprios dados, não com a documentação da Microsoft.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Service Trust Portal",
                true
            ],
            [
                "Compliance Manager",
                false
            ],
            [
                "Content explorer",
                false
            ],
            [
                "Portal do Microsoft Purview",
                false
            ]
        ]
    },
    {
        "statement": "Uma organização quer um painel que liste ações de melhoria recomendadas para atender a regulamentações e resuma o progresso da conformidade em uma única pontuação. Qual recurso do Microsoft Purview oferece isso?",
        "explanation": "O Compliance Manager reúne as ações de melhoria (improvement actions) e calcula o compliance score. O Service Trust Portal apenas hospeda documentos da Microsoft; risco interno e eDiscovery têm outros propósitos.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Service Trust Portal",
                false
            ],
            [
                "Compliance Manager",
                true
            ],
            [
                "Gestão de risco interno",
                false
            ],
            [
                "eDiscovery",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer que documentos classificados como 'Confidencial' recebam automaticamente uma marca d'água e criptografia que restringe quem pode abri-los. Que recurso do Purview aplica essa proteção diretamente ao conteúdo?",
        "explanation": "Rótulos de confidencialidade aplicam proteção ao conteúdo: criptografia, marcação (marca d'água, cabeçalho/rodapé) e restrições de acesso. Rótulos de retenção controlam por quanto tempo o dado é mantido, não sua proteção; a DLP controla o compartilhamento, mas não aplica criptografia nem marcação ao arquivo.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Rótulos de retenção",
                false
            ],
            [
                "Prevenção de perda de dados (DLP)",
                false
            ],
            [
                "Rótulos de confidencialidade (sensitivity labels)",
                true
            ],
            [
                "Compliance Manager",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer impedir que funcionários enviem por e-mail planilhas contendo números de cartão de crédito para destinatários externos. Qual recurso do Purview atende a essa necessidade?",
        "explanation": "A DLP detecta informações sensíveis (como cartões de crédito) e pode bloquear ou alertar sobre o compartilhamento. Rótulos de confidencialidade protegem e classificam o conteúdo, mas o recurso feito para impedir o vazamento em ações de compartilhamento é a DLP.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Prevenção de perda de dados (DLP)",
                true
            ],
            [
                "Rótulos de confidencialidade",
                false
            ],
            [
                "Gestão de registros",
                false
            ],
            [
                "Auditoria",
                false
            ]
        ]
    },
    {
        "statement": "Por exigência regulatória, uma empresa precisa manter e-mails financeiros por sete anos e depois excluí-los automaticamente. Qual recurso do Purview atende a esse requisito?",
        "explanation": "Políticas e rótulos de retenção definem por quanto tempo o conteúdo deve ser mantido e o que fazer ao fim do prazo (reter, excluir ou ambos). Confidencialidade protege o conteúdo e DLP controla o compartilhamento — nenhum deles gerencia o ciclo de vida por tempo.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Rótulos de confidencialidade",
                false
            ],
            [
                "Prevenção de perda de dados (DLP)",
                false
            ],
            [
                "Gestão de risco interno",
                false
            ],
            [
                "Políticas e rótulos de retenção",
                true
            ]
        ]
    },
    {
        "statement": "Diante de um processo judicial, o time jurídico precisa localizar, preservar (colocar em espera legal) e coletar e-mails e documentos relevantes de determinados funcionários. Qual solução do Purview foi feita para isso?",
        "explanation": "O eDiscovery (descoberta eletrônica) identifica, preserva com holds e coleta conteúdo para casos legais ou investigações. A Auditoria registra atividades, mas não gerencia o fluxo de um caso jurídico com custodiantes e conjuntos de revisão.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Auditoria",
                false
            ],
            [
                "eDiscovery",
                true
            ],
            [
                "Gestão de risco interno",
                false
            ],
            [
                "Compliance Manager",
                false
            ]
        ]
    },
    {
        "statement": "Um administrador precisa descobrir quem acessou, moveu ou excluiu determinado arquivo no SharePoint e em que momento a ação ocorreu. Qual recurso do Purview registra esse histórico de ações?",
        "explanation": "A Auditoria registra eventos e atividades de usuários e administradores (quem fez o quê e quando), permitindo pesquisar o log. O eDiscovery serve a casos legais; o Content explorer mostra onde há conteúdo sensível, não o histórico de ações.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Auditoria (Audit)",
                true
            ],
            [
                "eDiscovery",
                false
            ],
            [
                "Content explorer",
                false
            ],
            [
                "Prevenção de perda de dados (DLP)",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer detectar comportamentos internos arriscados — por exemplo, um funcionário que, após anunciar a saída, baixa um grande volume de arquivos confidenciais. Qual solução do Purview é indicada?",
        "explanation": "A gestão de risco interno usa sinais de atividade para identificar riscos vindos de dentro da organização, como roubo de dados por funcionários de saída. A DLP bloqueia ações específicas de compartilhamento, mas não correlaciona padrões de comportamento de risco do usuário.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Prevenção de perda de dados (DLP)",
                false
            ],
            [
                "eDiscovery",
                false
            ],
            [
                "Gestão de risco interno (insider risk management)",
                true
            ],
            [
                "Service Trust Portal",
                false
            ]
        ]
    },
    {
        "statement": "A área de segurança quer ver, em um único lugar, um retrato atual de ONDE está armazenado o conteúdo que já foi rotulado como confidencial ou que contém informações sensíveis na organização. Qual recurso mostra isso?",
        "explanation": "O Content explorer oferece um instantâneo atual de onde reside o conteúdo rotulado ou classificado como sensível. O Activity explorer mostra ações realizadas ao longo do tempo, não a localização atual do conteúdo.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Content explorer",
                true
            ],
            [
                "Activity explorer",
                false
            ],
            [
                "Compliance Manager",
                false
            ],
            [
                "Service Trust Portal",
                false
            ]
        ]
    },
    {
        "statement": "Um analista quer entender O QUE foi feito com os documentos rotulados ao longo do tempo — por exemplo, quando um rótulo foi rebaixado ou quando um arquivo rotulado foi compartilhado externamente. Qual recurso mostra esse histórico de atividades?",
        "explanation": "O Activity explorer mostra as atividades relacionadas a conteúdo rotulado e classificado ao longo do tempo (rótulo alterado, arquivo compartilhado etc.). O Content explorer, por outro lado, mostra apenas onde o conteúdo está agora, sem o histórico de ações.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Content explorer",
                false
            ],
            [
                "Activity explorer",
                true
            ],
            [
                "eDiscovery",
                false
            ],
            [
                "Compliance Manager",
                false
            ]
        ]
    },
    {
        "statement": "Qual afirmação distingue corretamente um rótulo de confidencialidade de um rótulo de retenção no Purview?",
        "explanation": "Rótulos de confidencialidade tratam de PROTEÇÃO segundo o grau de sensibilidade (criptografia, marca d'água, acesso). Rótulos de retenção tratam do CICLO DE VIDA: por quanto tempo reter e quando excluir. São dimensões diferentes e podem ser usadas juntas no mesmo item.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "O de confidencialidade protege o conteúdo (criptografia, marcação e controle de acesso) conforme a sensibilidade; o de retenção controla por quanto tempo o conteúdo é mantido e quando é excluído.",
                true
            ],
            [
                "O de confidencialidade define o prazo de exclusão; o de retenção aplica criptografia ao arquivo.",
                false
            ],
            [
                "Ambos aplicam criptografia; a diferença é apenas a cor exibida ao usuário.",
                false
            ],
            [
                "O de confidencialidade só funciona em e-mails e o de retenção só em documentos.",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa já bloqueia o compartilhamento externo de dados sensíveis, mas agora quer identificar padrões de comportamento de risco dos usuários (como exfiltração de dados antes de um pedido de demissão), correlacionando vários sinais ao longo do tempo em vez de bloquear uma ação isolada. Qual solução atende?",
        "explanation": "A DLP age sobre ações específicas de compartilhamento de conteúdo sensível. Para correlacionar sinais e comportamentos de risco do usuário ao longo do tempo, a solução é a gestão de risco interno, que foca no padrão de conduta e não em uma única transação.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Prevenção de perda de dados (DLP)",
                false
            ],
            [
                "Gestão de risco interno (insider risk management)",
                true
            ],
            [
                "Rótulos de retenção",
                false
            ],
            [
                "eDiscovery",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa precisa declarar certos documentos como 'registros' (records) que não podem ser editados nem excluídos até o fim do prazo legal, com uma revisão de descarte (disposition) antes da exclusão. Qual recurso do Purview atende?",
        "explanation": "A gestão de registros permite declarar itens como registros — tornando-os imutáveis durante a retenção — e conduzir a revisão de descarte antes da exclusão. Rótulos de confidencialidade protegem o conteúdo, mas não impõem a imutabilidade regulatória de registros.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Rótulos de confidencialidade",
                false
            ],
            [
                "Gestão de risco interno",
                false
            ],
            [
                "Gestão de registros (records management)",
                true
            ],
            [
                "Content explorer",
                false
            ]
        ]
    },
    {
        "statement": "No Compliance Manager, o que o compliance score (pontuação de conformidade) representa?",
        "explanation": "O compliance score é uma pontuação baseada em risco que mostra o quanto a organização avançou nas ações de melhoria recomendadas para atingir seus objetivos de conformidade. Não mede MFA, SLA nem licenciamento.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Uma medida baseada em risco que reflete o progresso na conclusão das ações de melhoria recomendadas.",
                true
            ],
            [
                "O percentual de usuários da organização com MFA habilitado.",
                false
            ],
            [
                "O tempo de disponibilidade (uptime) garantido pelo SLA dos serviços da Microsoft.",
                false
            ],
            [
                "A quantidade de licenças do Microsoft Purview já atribuídas.",
                false
            ]
        ]
    },
    {
        "statement": "Onde uma organização define e visualiza os tipos de informação sensível (como CPF ou número de passaporte) e os classificadores treináveis usados por rótulos e políticas de DLP para reconhecer dados sigilosos?",
        "explanation": "A classificação de dados no Purview abrange os tipos de informação sensível (SITs) e os classificadores treináveis que identificam dados sigilosos, servindo de base para rótulos e DLP. Os demais recursos não definem esses classificadores.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Classificação de dados (data classification)",
                true
            ],
            [
                "Service Trust Portal",
                false
            ],
            [
                "Auditoria",
                false
            ],
            [
                "Compliance Manager",
                false
            ]
        ]
    },
    {
        "statement": "Qual afirmação distingue corretamente o eDiscovery da Auditoria no Purview?",
        "explanation": "O eDiscovery gira em torno de um CASO legal: localizar, preservar (hold) e coletar conteúdo. A Auditoria mantém o LOG de atividades e eventos (quem fez o quê e quando). São ferramentas complementares, mas com propósitos distintos.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "O eDiscovery identifica, preserva e coleta conteúdo para casos legais; a Auditoria registra o histórico de atividades e eventos para consulta e investigação.",
                true
            ],
            [
                "O eDiscovery registra logs de atividade; a Auditoria coleta provas para processos judiciais.",
                false
            ],
            [
                "Ambos servem apenas para excluir dados após o prazo de retenção.",
                false
            ],
            [
                "O eDiscovery protege arquivos com criptografia; a Auditoria aplica rótulos de confidencialidade.",
                false
            ]
        ]
    },
    {
        "statement": "Onde um administrador de conformidade acessa, de forma unificada, soluções como rótulos de confidencialidade, DLP, gestão de registros, risco interno e eDiscovery?",
        "explanation": "O portal do Microsoft Purview reúne as soluções de conformidade e governança de dados em um só lugar. O Entra admin center gerencia identidade, o portal do Defender trata de segurança e o Service Trust Portal hospeda a documentação da própria Microsoft.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Microsoft Entra admin center",
                false
            ],
            [
                "Service Trust Portal",
                false
            ],
            [
                "Portal do Microsoft Purview",
                true
            ],
            [
                "Portal do Microsoft Defender",
                false
            ]
        ]
    },
    {
        "statement": "De acordo com os princípios de privacidade da Microsoft, qual é a postura declarada sobre o uso do conteúdo do cliente (e-mails, chats, arquivos) para publicidade?",
        "explanation": "Um dos princípios de privacidade da Microsoft é não usar o conteúdo do cliente para publicidade direcionada. Os princípios também incluem controle, transparência, segurança, fortes proteções legais e uso dos dados em benefício do cliente.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "A Microsoft não usa o conteúdo do cliente para direcionar publicidade.",
                true
            ],
            [
                "A Microsoft usa o conteúdo para anúncios, desde que anonimizado.",
                false
            ],
            [
                "A Microsoft compartilha o conteúdo com parceiros de publicidade mediante contrato.",
                false
            ],
            [
                "A Microsoft usa o conteúdo para anúncios apenas em contas gratuitas.",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa quer que qualquer documento armazenado no SharePoint que CONTENHA um determinado tipo de informação sensível seja automaticamente classificado e criptografado, mesmo que nenhum usuário o rotule manualmente. Qual capacidade atende exatamente a isso?",
        "explanation": "A rotulagem automática aplica rótulos de confidencialidade — e a proteção associada, como criptografia — com base no conteúdo, sem ação do usuário. A DLP detecta e controla o compartilhamento, mas não aplica criptografia nem marcação ao arquivo; retenção e eDiscovery têm outros fins.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Rótulos de confidencialidade com rotulagem automática (auto-labeling)",
                true
            ],
            [
                "Uma política de DLP que bloqueia o compartilhamento externo",
                false
            ],
            [
                "Um rótulo de retenção que declara o item como registro",
                false
            ],
            [
                "Uma pesquisa de eDiscovery com hold",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa aplica a um documento um rótulo de retenção configurado para marcá-lo como 'registro' (record). Qual é o efeito prático em comparação a um rótulo de retenção comum?",
        "explanation": "Declarar o item como registro (via gestão de registros) impõe imutabilidade: ele não pode ser editado nem excluído durante a retenção, com descarte controlado ao final. Um rótulo de retenção comum apenas retém ou exclui, sem esse bloqueio de alteração. A marcação de registro não criptografa o conteúdo — isso seria papel de um rótulo de confidencialidade.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Nenhuma diferença prática; a marcação como registro é apenas visual para o usuário.",
                false
            ],
            [
                "O item passa a ter restrições adicionais e não pode ser editado nem excluído durante o período de retenção, comportando-se como um registro imutável.",
                true
            ],
            [
                "O item passa a ser criptografado e só abre com credenciais especiais.",
                false
            ],
            [
                "O item deixa de ser retido e é excluído imediatamente.",
                false
            ]
        ]
    },
    {
        "statement": "Uma empresa lista três necessidades: (1) bloquear o envio externo de dados de cartão de crédito; (2) detectar funcionários de saída exfiltrando dados; (3) coletar e preservar e-mails para um processo judicial. Qual combinação de soluções do Purview atende, respectivamente?",
        "explanation": "Bloquear o compartilhamento de conteúdo sensível é DLP; identificar comportamento de risco de usuários internos é a gestão de risco interno; localizar, preservar e coletar conteúdo para um caso legal é o eDiscovery. Cada solução resolve um tipo distinto de problema.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "DLP; gestão de risco interno; eDiscovery",
                true
            ],
            [
                "Gestão de risco interno; DLP; Auditoria",
                false
            ],
            [
                "eDiscovery; DLP; gestão de registros",
                false
            ],
            [
                "DLP; eDiscovery; gestão de risco interno",
                false
            ]
        ]
    },
    {
        "statement": "Além de proteger documentos e e-mails individuais, uma empresa quer usar rótulos de confidencialidade para controlar configurações de sites do SharePoint, equipes do Teams e Grupos do Microsoft 365 — por exemplo, se o contêiner permite acesso de usuários convidados. Isso é possível?",
        "explanation": "Rótulos de confidencialidade podem ser aplicados tanto a itens (arquivos e e-mails) quanto a contêineres — sites, Teams e Grupos — controlando configurações como privacidade e acesso de convidados. Retenção e DLP não configuram esse tipo de proteção do contêiner.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "Sim, rótulos de confidencialidade também podem ser aplicados a contêineres (sites, Teams e Grupos) para controlar configurações como acesso externo.",
                true
            ],
            [
                "Não, rótulos de confidencialidade só se aplicam a arquivos e e-mails individuais.",
                false
            ],
            [
                "Não, esse controle exige uma política de retenção.",
                false
            ],
            [
                "Não, isso só é possível com uma política de DLP.",
                false
            ]
        ]
    },
    {
        "statement": "Uma multinacional quer avaliar sua conformidade com várias regulamentações (LGPD, ISO 27001, NIST) usando modelos pré-construídos que já trazem os controles e as ações de melhoria mapeados. Qual recurso oferece esses modelos de avaliação?",
        "explanation": "O Compliance Manager traz avaliações baseadas em modelos que mapeiam controles a regulamentações e regem as ações de melhoria. O Service Trust Portal apenas hospeda a documentação de conformidade da própria Microsoft, sem gerenciar as avaliações da sua organização.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "As avaliações e modelos (assessments/templates) do Compliance Manager",
                true
            ],
            [
                "Os documentos de auditoria publicados no Service Trust Portal",
                false
            ],
            [
                "O Content explorer",
                false
            ],
            [
                "A gestão de risco interno",
                false
            ]
        ]
    },
    {
        "statement": "Tanto uma política de retenção quanto um hold de eDiscovery conseguem preservar conteúdo. Qual afirmação distingue corretamente seus propósitos?",
        "explanation": "A política de retenção é uma ferramenta de GOVERNANÇA contínua: retém e/ou exclui conteúdo segundo regras de conformidade. O hold de eDiscovery é pontual e ligado a um CASO: preserva o conteúdo enquanto durar a investigação ou o litígio. Preservar é comum aos dois, mas o motivo e o ciclo de vida são diferentes.",
        "topic": "Conformidade com o Microsoft Purview",
        "options": [
            [
                "A política de retenção preserva e gerencia conteúdo para governança e conformidade contínuas; o hold de eDiscovery preserva conteúdo especificamente por causa de um caso legal ou investigação.",
                true
            ],
            [
                "A política de retenção serve a casos legais; o hold de eDiscovery é usado para governança de rotina.",
                false
            ],
            [
                "Ambos existem apenas para excluir conteúdo assim que o prazo termina.",
                false
            ],
            [
                "A política de retenção criptografa o conteúdo; o hold de eDiscovery apenas o rotula.",
                false
            ]
        ]
    },
    // ===== Questões adicionais (banco ampliado para variar as tentativas) =====
    {
        statement: "Um time de segurança organiza seus controles em torno de três objetivos fundamentais da segurança da informação, conhecidos como tríade CIA. Quais são esses três pilares?",
        explanation: "A tríade CIA reúne confidencialidade (evitar acesso não autorizado), integridade (evitar alterações indevidas) e disponibilidade (garantir o acesso quando necessário).",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Confidencialidade, integridade e disponibilidade", true],
            ["Confidencialidade, identidade e autorização", false],
            ["Criptografia, integridade e autenticação", false],
            ["Confidencialidade, disponibilidade e o não repúdio garantido por assinaturas digitais e trilhas de auditoria", false],
        ],
    },
    {
        statement: "Uma empresa quer proteger tanto os dados gravados nos discos dos servidores quanto os dados que trafegam entre o navegador do cliente e a aplicação. Como se classificam essas duas formas de proteção por criptografia?",
        explanation: "Criptografia em repouso protege dados gravados em disco ou banco de dados; criptografia em trânsito protege os dados enquanto trafegam pela rede, por exemplo via TLS.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Criptografia simétrica para os discos e criptografia assimétrica para a rede", false],
            ["Criptografia em repouso para o que está armazenado e criptografia em trânsito para o que trafega", true],
            ["Hashing para os discos e criptografia em trânsito para a rede", false],
            ["Criptografia em trânsito para os dados gravados nos discos e criptografia em repouso para os dados que circulam pela rede entre cliente e servidor", false],
        ],
    },
    {
        statement: "Uma varejista está lançando um aplicativo público de compras e quer que os clientes finais se cadastrem e façam login com contas próprias, como e-mail ou provedores sociais, sem se tornarem usuários internos do diretório corporativo. Qual recurso do Microsoft Entra atende a esse cenário?",
        explanation: "O Azure AD B2C, parte do Microsoft Entra External ID, oferece cadastro e login para clientes finais com e-mail, contas locais ou provedores sociais, separado do diretório de funcionários.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Microsoft Entra B2B, para colaboração com parceiros de negócio externos", false],
            ["Identidade híbrida, sincronizando as contas dos clientes a partir do Active Directory local para o Microsoft Entra ID", false],
            ["Microsoft Entra External ID para consumidores (Azure AD B2C)", true],
            ["Privileged Identity Management (PIM)", false],
        ],
    },
    {
        statement: "Ao planejar a autenticação multifator, um analista precisa combinar fatores de categorias diferentes para aumentar a segurança. Quais são as três categorias de fatores de autenticação?",
        explanation: "Os fatores se dividem em algo que você sabe (senha ou PIN), algo que você tem (telefone ou token) e algo que você é (biometria); a MFA combina categorias diferentes.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Algo que você sabe, algo que você vê e algo que você assina", false],
            ["Usuário, senha e código de verificação", false],
            ["Uma senha memorizada, um token físico registrado previamente e uma pergunta de segurança respondida no primeiro acesso", false],
            ["Algo que você sabe, algo que você tem e algo que você é", true],
        ],
    },
    {
        statement: "Ao assinar o Microsoft 365, uma organização recebe uma instância dedicada e isolada do Microsoft Entra ID, onde ficam seus usuários, grupos e aplicativos. Como se chama essa instância?",
        explanation: "Cada organização possui seu próprio locatário (tenant) do Microsoft Entra ID, uma instância dedicada e isolada que hospeda suas identidades e o acesso aos recursos.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Assinatura (subscription)", false],
            ["Locatário (tenant)", true],
            ["Unidade organizacional (OU)", false],
            ["Floresta do Active Directory Domain Services sincronizada com a nuvem pelo Microsoft Entra Connect", false],
        ],
    },
    {
        statement: "Uma pequena empresa sem licenças avançadas quer ativar rapidamente proteções básicas de identidade, como exigir MFA de todos os usuários e bloquear a autenticação legada, sem criar políticas individuais. Qual recurso do Microsoft Entra oferece esse conjunto pré-configurado?",
        explanation: "Os padrões de segurança aplicam um conjunto básico e gratuito de proteções, como exigir MFA de todos e bloquear a autenticação legada, sem precisar criar políticas individuais.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Políticas de Acesso Condicional personalizadas, criadas uma a uma para cada grupo de usuários e aplicativo da organização", false],
            ["Privileged Identity Management (PIM)", false],
            ["Redefinição de senha self-service (SSPR)", false],
            ["Padrões de segurança (security defaults)", true],
        ],
    },
    {
        statement: "Uma empresa quer que parceiros externos solicitem, por autoatendimento, um pacote de acessos (grupos, aplicativos e sites) com aprovação e prazo de expiração automáticos. Qual recurso do Microsoft Entra ID Governance atende a isso?",
        explanation: "O gerenciamento de direitos usa pacotes de acesso para agrupar recursos e concedê-los com solicitação, aprovação e expiração automáticas, inclusive para usuários externos.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Gerenciamento de direitos (entitlement management), com pacotes de acesso", true],
            ["Acesso Condicional", false],
            ["Redefinição de senha self-service, com registro dos métodos de autenticação e notificação aos administradores a cada uso", false],
            ["Proteção de senha (password protection)", false],
        ],
    },
    {
        statement: "Seguindo o privilégio mínimo, uma organização quer restringir ao menor número possível de pessoas a função que concede controle total sobre todos os recursos do Microsoft Entra ID e do Microsoft 365. Qual função é essa?",
        explanation: "O Administrador global tem controle total sobre o locatário e deve ser dado a pouquíssimas pessoas; para o dia a dia, a recomendação é usar funções mais específicas.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["Leitor global (Global Reader)", false],
            ["Administrador de suporte técnico (Helpdesk Administrator)", false],
            ["Administrador global (Global Administrator)", true],
            ["Administrador de autenticação, que redefine métodos de autenticação e senhas apenas de usuários sem privilégios administrativos", false],
        ],
    },
    {
        statement: "Uma organização com Active Directory local quer sincronizar contas e hashes de senha para o Microsoft Entra ID, permitindo login com as mesmas credenciais nos serviços de nuvem. Qual componente realiza essa sincronização?",
        explanation: "O Microsoft Entra Connect sincroniza as identidades do Active Directory local com o Microsoft Entra ID, viabilizando a identidade híbrida e o uso das mesmas credenciais na nuvem.",
        topic: "Conceitos de SCI e Microsoft Entra",
        options: [
            ["O Microsoft Defender for Identity, instalado nos controladores de domínio para monitorar e replicar as contas para a nuvem", false],
            ["O Microsoft Entra Connect", true],
            ["O Privileged Identity Management (PIM)", false],
            ["O Acesso Condicional", false],
        ],
    },
    {
        statement: "Uma analista de SOC quer, de forma proativa, pesquisar sinais de ataque escrevendo consultas personalizadas sobre até 30 dias de dados brutos de e-mails, dispositivos e identidades no portal do Defender. Qual recurso ela deve usar?",
        explanation: "A caça avançada permite consultar proativamente grandes volumes de dados brutos com a linguagem KQL, enquanto a análise de ameaças traz relatórios curados sobre campanhas conhecidas.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["Caça avançada (advanced hunting), com consultas na linguagem KQL", true],
            ["Análise de ameaças (threat analytics), com relatórios prontos sobre campanhas conhecidas", false],
            ["Secure score do ambiente", false],
            ["A fila de incidentes, que apenas lista os alertas já correlacionados automaticamente pelo Defender para a triagem manual", false],
        ],
    },
    {
        statement: "Para reduzir a carga do time de segurança, uma empresa quer que o Defender XDR investigue automaticamente certos alertas, determine se há ameaça real e execute correções, como remover arquivos maliciosos, sem intervenção manual. Qual capacidade oferece isso?",
        explanation: "A investigação e resposta automatizadas (AIR) examinam alertas sozinhas, decidem se há ameaça real e aplicam correções, reduzindo o trabalho manual do SOC.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["A caça avançada, em que analistas escrevem manualmente consultas KQL para localizar e depois remediar cada ameaça encontrada", false],
            ["A análise de ameaças (threat analytics)", false],
            ["A investigação e resposta automatizadas (AIR)", true],
            ["O gerenciamento de vulnerabilidades", false],
        ],
    },
    {
        statement: "Uma empresa quer bloquear preventivamente comportamentos de risco nos dispositivos, como documentos do Office que iniciam processos filhos ou execução de conteúdo vindo de e-mail. Qual capacidade do Microsoft Defender for Endpoint atende a isso?",
        explanation: "As regras de redução da superfície de ataque (ASR) do Defender for Endpoint bloqueiam preventivamente comportamentos explorados por malware, como o Office iniciando processos filhos.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["Isolamento do dispositivo da rede", false],
            ["O Defender for Cloud Apps, que atua como CASB para descobrir e controlar o uso de aplicativos SaaS não aprovados pela empresa", false],
            ["Análise de ameaças (threat analytics)", false],
            ["Regras de redução da superfície de ataque (ASR)", true],
        ],
    },
    {
        statement: "No Microsoft Defender for Office 365, um administrador quer entender a diferença entre os recursos Anexos Seguros (Safe Attachments) e Links Seguros (Safe Links). Qual afirmação os distingue corretamente?",
        explanation: "Anexos Seguros abre anexos em uma sandbox antes da entrega; Links Seguros reescreve e verifica as URLs no momento do clique para proteger contra links maliciosos.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["Ambos apenas colocam em quarentena qualquer e-mail vindo de remetentes externos à organização", false],
            ["Anexos Seguros abre os anexos em uma sandbox para detonar ameaças; Links Seguros verifica as URLs no momento do clique", true],
            ["Anexos Seguros verifica URLs no clique; Links Seguros procura contas comprometidas no Active Directory local", false],
            ["Anexos Seguros e Links Seguros bloqueiam a movimentação lateral entre controladores de domínio usando técnicas como pass-the-hash e pass-the-ticket no ambiente local", false],
        ],
    },
    {
        statement: "Dois produtos têm nomes parecidos e são confundidos: um é um CASB que dá visibilidade e controle sobre aplicativos SaaS; o outro protege a postura e as cargas de trabalho em nuvem no Azure, AWS e Google Cloud. Qual associação está correta?",
        explanation: "O Defender for Cloud Apps é o CASB que dá visibilidade e controle sobre apps SaaS; o Defender for Cloud avalia a postura e protege cargas de trabalho em Azure, AWS e GCP.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["Defender for Cloud Apps é o CASB; Defender for Cloud cuida da postura e das cargas de trabalho em nuvem", true],
            ["Defender for Cloud é o CASB para aplicativos SaaS, e Defender for Cloud Apps protege as máquinas virtuais e os bancos de dados hospedados em Azure, AWS e Google Cloud", false],
            ["Os dois são o mesmo produto, apenas com nomes diferentes conforme o portal usado", false],
            ["Defender for Cloud Apps protege caixas de e-mail contra phishing; Defender for Cloud verifica anexos maliciosos", false],
        ],
    },
    {
        statement: "Para reduzir o sucesso de ataques de phishing, uma empresa quer enviar aos próprios funcionários e-mails simulados de phishing e, com base em quem cair, direcioná-los a treinamentos. Qual recurso do Microsoft Defender for Office 365 oferece isso?",
        explanation: "O treinamento de simulação de ataque executa campanhas de phishing simuladas para medir a vulnerabilidade dos usuários e direcionar treinamentos a quem precisa.",
        topic: "Defender XDR e proteção contra ameaças",
        options: [
            ["Anexos Seguros (Safe Attachments)", false],
            ["A investigação e resposta automatizadas, que isolam o dispositivo do funcionário assim que ele clica em um link de phishing real", false],
            ["O gerenciamento de vulnerabilidades e configurações", false],
            ["O treinamento de simulação de ataque (attack simulation training)", true],
        ],
    },
    {
        statement: "Uma instituição financeira precisa demonstrar aderência a padrões como PCI DSS e ISO 27001 e visualizar, para os recursos no Azure, quais controles já estão atendidos e quais ainda exigem ação. Qual recurso atende a essa necessidade?",
        explanation: "O painel de conformidade regulatória do Defender for Cloud mapeia a configuração dos recursos para padrões como PCI DSS e ISO 27001, mostrando os controles atendidos e as ações pendentes. O Secure Score mede a postura geral, não a aderência a uma norma específica.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["O Microsoft Sentinel, coletando e correlacionando logs de segurança de toda a organização para investigação de incidentes.", false],
            ["O painel de conformidade regulatória do Microsoft Defender for Cloud.", true],
            ["O Secure Score do Defender for Cloud, que resume a postura geral em uma única pontuação percentual.", false],
            ["O Compliance Manager do Microsoft Purview, restrito a serviços do Microsoft 365 e sem visibilidade sobre os recursos do Azure.", false],
        ],
    },
    {
        statement: "Uma equipe acabou de habilitar o Microsoft Sentinel e precisa começar a ingerir sinais de fontes como Microsoft Entra ID, Office 365, Azure Activity e firewalls de terceiros. Qual componente do Sentinel é usado para trazer esses dados para análise?",
        explanation: "Os conectores de dados integram o Sentinel a fontes internas e externas, ingerindo logs e eventos para análise. Playbooks respondem a incidentes, workbooks visualizam dados e regras de análise geram alertas.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["Os conectores de dados (data connectors).", true],
            ["Os playbooks, que executam ações automatizadas de resposta usando o Azure Logic Apps quando um incidente é disparado.", false],
            ["As pastas de trabalho (workbooks), que criam painéis visuais e relatórios interativos sobre os dados já ingeridos.", false],
            ["As regras de análise, que correlacionam eventos para gerar alertas e incidentes de segurança.", false],
        ],
    },
    {
        statement: "Ao apresentar o Microsoft Sentinel, um arquiteto quer diferenciar suas capacidades de SIEM e de SOAR. Qual afirmação faz essa distinção corretamente?",
        explanation: "O SIEM (Security Information and Event Management) reúne e correlaciona sinais para detectar ameaças; o SOAR (Security Orchestration, Automation and Response) automatiza a resposta. O Sentinel combina as duas capacidades.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["O SIEM automatiza e orquestra as ações de resposta com playbooks, enquanto o SOAR apenas armazena logs para consulta futura.", false],
            ["SIEM e SOAR são termos equivalentes; ambos se referem exclusivamente à coleta de logs de máquinas virtuais no Azure.", false],
            ["O SIEM coleta e correlaciona dados para detectar ameaças, e o SOAR automatiza e orquestra a resposta a incidentes.", true],
            ["O SIEM protege apenas cargas de trabalho locais, ao passo que o SOAR se limita a recursos hospedados exclusivamente na nuvem pública.", false],
        ],
    },
    {
        statement: "Depois de conectar suas fontes de dados ao Microsoft Sentinel, uma equipe de SOC quer que o sistema correlacione automaticamente os eventos ingeridos e gere incidentes sempre que identificar padrões que indiquem uma ameaça. O que a equipe deve configurar?",
        explanation: "As regras de análise avaliam e correlacionam os dados ingeridos e geram alertas e incidentes quando detectam atividades suspeitas. Conectores apenas coletam dados e workbooks apenas os visualizam.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["Conectores de dados adicionais, que apenas trazem mais logs para o workspace, sem avaliar ou correlacionar o conteúdo.", false],
            ["Pastas de trabalho (workbooks), voltadas à visualização e à criação de painéis, sem capacidade de disparar incidentes.", false],
            ["Grupos de segurança de rede (NSG), que filtram o tráfego de entrada e saída no nível da sub-rede.", false],
            ["Regras de análise (analytics rules).", true],
        ],
    },
    {
        statement: "Uma empresa quer centralizar suas chaves de criptografia e certificados em um serviço gerenciado do Azure que permita proteger chaves por hardware (HSM), controlar o acesso por meio do Microsoft Entra ID e registrar cada operação para auditoria. Qual serviço atende a esses requisitos?",
        explanation: "O Azure Key Vault armazena e gerencia de forma centralizada segredos, chaves e certificados, com suporte a proteção por HSM, controle de acesso via Entra ID e registro de operações para auditoria.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["O Azure Bastion, que fornece conectividade RDP e SSH às máquinas virtuais pelo portal, sem expor portas à internet.", false],
            ["O Azure Key Vault.", true],
            ["Um grupo de segurança de rede (NSG), aplicado à sub-rede para permitir ou negar o tráfego que chega aos recursos.", false],
            ["O Microsoft Defender for Cloud, que avalia a postura de segurança e emite recomendações para reduzir configurações incorretas.", false],
        ],
    },
    {
        statement: "Uma arquiteta precisa explicar a diferença entre o Web Application Firewall (WAF) e o Azure Firewall. Qual afirmação descreve corretamente essa diferença?",
        explanation: "O WAF (em Application Gateway ou Front Door) atua na camada de aplicação, protegendo aplicações web contra explorações como SQL injection e XSS. O Azure Firewall é um firewall de rede gerenciado que controla o tráfego das redes virtuais.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["Ambos operam apenas na camada de rede (camadas 3 e 4) e são intercambiáveis para qualquer cenário de filtragem.", false],
            ["O WAF filtra o tráfego geral de entrada e saída entre redes virtuais usando apenas regras de porta e protocolo, enquanto o Azure Firewall se dedica a inspecionar requisições HTTP em busca de injeção de SQL e scripts maliciosos.", false],
            ["O WAF protege aplicações web contra ataques da camada de aplicação, como SQL injection e XSS; o Azure Firewall filtra o tráfego de rede das redes virtuais.", true],
            ["O Azure Firewall é um recurso gratuito associado a interfaces de rede, ao passo que o WAF é um appliance físico instalado no datacenter do cliente.", false],
        ],
    },
    {
        statement: "Uma organização quer controlar, de forma centralizada, para quais nomes de domínio (FQDN) as máquinas virtuais de suas redes virtuais podem abrir conexões de saída, permitindo apenas destinos aprovados. Qual serviço permite criar essas regras de aplicação?",
        explanation: "O Azure Firewall permite regras de aplicação que liberam ou bloqueiam o tráfego de saída com base em FQDNs, controlando de forma centralizada os destinos permitidos. O DDoS Protection e o Bastion tratam de outros problemas.",
        topic: "Segurança de infraestrutura, Defender for Cloud e Sentinel",
        options: [
            ["O Azure Firewall, por meio de regras de aplicação baseadas em FQDN.", true],
            ["O Azure DDoS Protection, que monitora o tráfego para mitigar ataques volumétricos de negação de serviço contra os recursos publicados.", false],
            ["O Azure Key Vault, que armazena de forma segura as credenciais usadas pelas máquinas virtuais para autenticar nesses domínios.", false],
            ["O Azure Bastion, que intermedia o acesso administrativo às máquinas virtuais sem a necessidade de IP público.", false],
        ],
    },
    {
        statement: "Uma empresa quer identificar automaticamente documentos por categoria de conteúdo, como contratos, currículos e código-fonte, mesmo quando não há um padrão fixo como número de cartão ou CPF. Que recurso do Microsoft Purview reconhece esse tipo de conteúdo com base em aprendizado de máquina?",
        explanation: "Os classificadores treináveis usam aprendizado de máquina para reconhecer categorias de conteúdo por exemplos, e não por padrões fixos. Tipos de informação sensível, ao contrário, detectam dados com formato conhecido, como números de cartão.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["Os tipos de informação sensível, que localizam dados por padrões predefinidos, como expressões regulares e somas de verificação.", false],
            ["Os rótulos de retenção, que definem por quanto tempo o conteúdo é mantido antes de ser excluído automaticamente.", false],
            ["A prevenção contra perda de dados (DLP), que bloqueia o compartilhamento externo de informações sensíveis por e-mail e outros canais.", false],
            ["Os classificadores treináveis (trainable classifiers).", true],
        ],
    },
    {
        statement: "Além de bloquear e-mails com dados sensíveis, uma empresa quer impedir que usuários copiem arquivos confidenciais para pen drives USB ou os enviem a aplicativos de nuvem não aprovados diretamente nos computadores corporativos. Qual capacidade do Microsoft Purview atende a isso?",
        explanation: "A DLP de ponto de extremidade estende as políticas de prevenção contra perda de dados aos dispositivos, controlando ações como cópia para USB, impressão e upload para serviços não aprovados.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["O gerenciamento de risco interno, que gera alertas sobre comportamentos potencialmente arriscados de usuários, mas não impõe controles de bloqueio nos dispositivos.", false],
            ["A prevenção contra perda de dados de ponto de extremidade (Endpoint DLP).", true],
            ["Os rótulos de confidencialidade, que aplicam criptografia e marca d'água a documentos e e-mails individuais conforme a classificação.", false],
            ["O eDiscovery, usado para localizar e preservar conteúdo relevante a investigações e processos judiciais.", false],
        ],
    },
    {
        statement: "Uma empresa quer detectar mensagens internas inadequadas, como assédio, linguagem ofensiva ou compartilhamento de informações confidenciais, trocadas por e-mail e no Microsoft Teams, para que as áreas de RH e conformidade possam revisá-las. Qual solução do Microsoft Purview é indicada?",
        explanation: "A conformidade de comunicações analisa mensagens em canais como e-mail e Teams para identificar violações de políticas, como assédio ou vazamento de dados, encaminhando-as para revisão. A DLP foca em impedir a saída de dados sensíveis.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["A conformidade de comunicações (Communication Compliance).", true],
            ["A prevenção contra perda de dados (DLP), voltada a impedir o vazamento de dados sensíveis por canais como e-mail, e não a avaliar o teor das conversas.", false],
            ["O gerenciamento do ciclo de vida de dados, que define políticas de retenção e exclusão de conteúdo ao longo do tempo.", false],
            ["As barreiras de informação, que impedem a comunicação entre determinados grupos de usuários.", false],
        ],
    },
    {
        statement: "Ao planejar a retenção no Microsoft Purview, uma equipe precisa entender a diferença entre uma política de retenção e um rótulo de retenção. Qual afirmação está correta?",
        explanation: "Políticas de retenção atuam sobre locais inteiros, como Exchange, SharePoint e Teams; rótulos de retenção são atribuídos a itens individuais e podem ser aplicados manual ou automaticamente. Ambos podem reter e depois excluir o conteúdo.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["Rótulos de retenção criptografam o conteúdo, enquanto políticas de retenção aplicam marca d'água aos documentos afetados.", false],
            ["Ambos só podem ser aplicados manualmente pelo usuário final e nunca de forma automática por regras da organização.", false],
            ["A política de retenção é aplicada de forma ampla a locais, como caixas de correio e sites; o rótulo de retenção é aplicado a itens específicos, como um documento ou e-mail.", true],
            ["A política de retenção serve apenas para excluir conteúdo imediatamente, ao passo que o rótulo de retenção serve unicamente para reter, jamais permitindo exclusão automática ao fim do período.", false],
        ],
    },
    {
        statement: "Uma corretora precisa impedir que os funcionários da mesa de operações troquem mensagens no Teams com os analistas de pesquisa, evitando conflitos de interesse exigidos pela regulação. Qual solução do Microsoft Purview permite restringir essa comunicação entre grupos?",
        explanation: "As barreiras de informação restringem ou bloqueiam a comunicação e a colaboração entre grupos específicos de usuários, ajudando a evitar conflitos de interesse. A DLP foca no vazamento de dados, não na separação entre grupos internos.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["A prevenção contra perda de dados (DLP), que inspeciona o conteúdo das mensagens para impedir o vazamento de dados sensíveis para fora da organização.", false],
            ["As barreiras de informação (information barriers).", true],
            ["Os rótulos de confidencialidade, que classificam e protegem documentos e e-mails de acordo com o nível de sensibilidade do conteúdo.", false],
            ["A auditoria, que registra as atividades dos usuários para investigação posterior, sem bloquear a comunicação em tempo real.", false],
        ],
    },
    {
        statement: "Para que uma política de DLP reconheça que um documento contém, por exemplo, um número de cartão de crédito válido, o Microsoft Purview precisa de um componente que detecte esse dado por padrões como formato, palavras-chave próximas e soma de verificação. Que componente é esse?",
        explanation: "Os tipos de informação sensível identificam dados com formato reconhecível, como cartões de crédito, CPF ou passaportes, usando padrões, palavras-chave e somas de verificação, e servem de base para DLP e rotulagem automática. Classificadores treináveis, por outro lado, reconhecem categorias por aprendizado de máquina.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["Um rótulo de confidencialidade, que aplica criptografia e restrições de acesso ao documento depois que ele é classificado pelo usuário ou automaticamente.", false],
            ["Um classificador treinável, que aprende a reconhecer categorias de conteúdo a partir de exemplos, e não a partir de um formato conhecido.", false],
            ["Um rótulo de retenção, que determina o tempo de guarda do documento antes da exclusão.", false],
            ["Um tipo de informação sensível (sensitive information type).", true],
        ],
    },
    {
        statement: "Uma organização quer agrupar, em uma única solução do Microsoft Purview, as políticas e os rótulos que controlam por quanto tempo o conteúdo é mantido e quando ele deve ser excluído automaticamente. Qual solução cumpre esse papel?",
        explanation: "O gerenciamento do ciclo de vida de dados reúne as políticas e os rótulos de retenção que definem por quanto tempo manter o conteúdo e quando excluí-lo. eDiscovery e DLP resolvem problemas distintos.",
        topic: "Conformidade com o Microsoft Purview",
        options: [
            ["O gerenciamento do ciclo de vida de dados (Data Lifecycle Management).", true],
            ["O eDiscovery, que identifica, preserva e coleta conteúdo relevante para investigações internas e processos judiciais em andamento.", false],
            ["A prevenção contra perda de dados (DLP), que detecta e impede o compartilhamento indevido de informações sensíveis.", false],
            ["O gerenciamento de risco interno, que analisa sinais de atividade para identificar comportamentos potencialmente arriscados de usuários.", false],
        ],
    },
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Security, Compliance, and Identity Fundamentals (SC-900)",
                provider: "azure",
                code: "SC-900",
                level: "Fundamental",
                description:
                    "Simulado no formato da prova SC-900: 45 minutos, corte de 70%.",
                durationMinutes: 45,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "azure", code: "SC-900", level: "Fundamental" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    const jaExistem = new Set(
        (
            await db
                .select({ statement: simuladoQuestions.statement })
                .from(simuladoQuestions)
                .where(eq(simuladoQuestions.simuladoId, simulado.id))
        ).map((r) => r.statement),
    );
    const inseridas = QUESTOES.filter((q) => !jaExistem.has(q.statement)).length;
    if (inseridas === 0) {
        console.log("Simulado já tem " + n + " questões, nada a fazer.");
        return;
    }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        if (jaExistem.has(q.statement)) continue;
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({
                simuladoId: simulado.id,
                statement: q.statement,
                explanation: q.explanation,
                topic: q.topic,
            })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: idx + 1,
            })),
        );
    }
    console.log("Seed: " + inseridas + " questões novas inseridas (" + QUESTOES.length + " no banco).");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
