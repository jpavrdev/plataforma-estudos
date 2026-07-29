// Seed do simulado AZ-104 (Microsoft Azure Administrator), no formato da prova:
// 50 questoes por tentativa, 100 minutos, corte de 65%. O banco tem 125 questoes
// (fator 2,5x), distribuidas pelo peso oficial de cada dominio do skills measured
// de 17/04/2026. O topic e o dominio oficial, entao o filtro de assuntos funciona
// de imediato.
//
// Aditivo por enunciado: re-rodar acrescenta as questoes novas sem duplicar.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-az-104.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "az-104";

type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma administradora precisa conceder a um grupo de suporte permissão para reiniciar máquinas virtuais de um resource group, sem permitir criar ou excluir recursos. Qual é a abordagem correta?",
        explanation:
            "Atribuir a função interna Virtual Machine Contributor no escopo do resource group concede gerenciamento de VMs, incluindo reiniciar, sem permitir gerenciar a rede virtual nem conceder acesso a outras pessoas. Owner e Contributor são amplos demais, e Reader não permite nenhuma ação de escrita, então não deixaria reiniciar.",
        options: [
            ["Atribuir Virtual Machine Contributor no escopo do resource group.", true],
            [
                "Atribuir Contributor no escopo da assinatura, que permite gerenciar todos os recursos.",
                false,
            ],
            [
                "Atribuir Reader no resource group, suficiente para operações de reinício das máquinas.",
                false,
            ],
            [
                "Criar uma função personalizada com a ação Microsoft.Authorization/roleAssignments/write.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual é a diferença entre as funções Owner e User Access Administrator no Azure RBAC?",
        explanation:
            "Owner concede acesso total a todos os recursos e inclui o direito de delegar acesso a outras pessoas. User Access Administrator permite apenas gerenciar o acesso de usuários aos recursos do Azure, sem permitir gerenciar os próprios recursos. Contributor gerencia recursos mas não pode conceder acesso.",
        options: [
            ["Owner gerencia recursos e delega acesso; a outra apenas gerencia acesso.", true],
            [
                "Owner gerencia apenas os recursos e a outra gerencia recursos e concede acesso a eles.",
                false,
            ],
            [
                "As duas são equivalentes, mudando apenas o escopo em que podem ser atribuídas no Azure.",
                false,
            ],
            [
                "Owner atua no nível de assinatura e a outra atua exclusivamente no nível do tenant.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma função foi atribuída a um usuário no escopo do management group, e uma negação explícita foi configurada no escopo do resource group. Qual é o resultado efetivo?",
        explanation:
            "No Azure RBAC, as atribuições de função são herdadas dos escopos superiores e são acumulativas, mas as atribuições de negação têm precedência sobre as de concessão. Por isso a negação no escopo mais específico prevalece e o acesso é bloqueado naquele resource group, mesmo com a concessão herdada acima.",
        options: [
            ["O acesso é bloqueado no resource group, porque a negação tem precedência.", true],
            [
                "O acesso é concedido, porque a atribuição no escopo mais amplo tem precedência sobre a outra.",
                false,
            ],
            [
                "O acesso fica indefinido e depende da ordem em que as atribuições foram criadas na conta.",
                false,
            ],
            [
                "O acesso é concedido apenas para operações de leitura, bloqueando as operações de escrita.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma empresa precisa que os usuários possam redefinir a própria senha sem acionar o suporte, incluindo o desbloqueio de conta. Qual recurso do Microsoft Entra ID atende a isso?",
        explanation:
            "O self-service password reset (SSPR) permite que usuários redefinam ou desbloqueiem a própria senha usando métodos de autenticação configurados, sem envolver administradores. Ele é habilitado por grupo ou para todos, e exige registro dos métodos. Acesso condicional trata de condições de acesso, e a proteção de senha bloqueia senhas fracas.",
        options: [
            ["Self-service password reset (SSPR).", true],
            [
                "Acesso condicional, que avalia sinais de risco antes de permitir a autenticação do usuário.",
                false,
            ],
            [
                "Proteção de senha do Entra ID, que bloqueia senhas fracas e termos proibidos pela empresa.",
                false,
            ],
            [
                "Privileged Identity Management, que concede acesso administrativo por tempo limitado.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Ao configurar o SSPR, qual configuração define quantos métodos de autenticação o usuário precisa fornecer para redefinir a senha?",
        explanation:
            "A configuração de número de métodos exigidos para redefinição define se o usuário precisa comprovar um ou dois métodos de autenticação registrados. Ela é definida nas configurações de SSPR do Entra ID, junto com os métodos disponíveis e o número de métodos que o usuário deve registrar.",
        options: [
            ["O número de métodos exigidos para redefinição, definido como um ou dois.", true],
            [
                "A política de expiração de senha configurada no domínio do Active Directory local.",
                false,
            ],
            [
                "O número de tentativas de bloqueio antes de a conta ser suspensa por tempo determinado.",
                false,
            ],
            [
                "A política de acesso condicional aplicada ao aplicativo de redefinição de senha do Entra.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual é a diferença entre um grupo de segurança e um grupo do Microsoft 365 no Entra ID?",
        explanation:
            "Grupos de segurança são usados para conceder acesso a recursos e podem conter usuários, dispositivos, entidades de serviço e outros grupos. Grupos do Microsoft 365 são voltados à colaboração e criam recursos compartilhados como caixa de correio e site, aceitando apenas usuários como membros.",
        options: [
            [
                "O de segurança concede acesso a recursos; o do Microsoft 365 é para colaboração.",
                true,
            ],
            [
                "O de segurança aceita apenas usuários e o do Microsoft 365 aceita também dispositivos.",
                false,
            ],
            [
                "O de segurança existe apenas no Active Directory local e o outro apenas na nuvem.",
                false,
            ],
            [
                "O de segurança usa associação dinâmica e o do Microsoft 365 usa apenas associação atribuída.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma empresa quer que usuários entrem automaticamente em um grupo quando o atributo de departamento for igual a Vendas. Qual tipo de associação de grupo atende a isso?",
        explanation:
            "A associação dinâmica de usuário usa uma regra baseada em atributos para incluir e remover membros automaticamente conforme os atributos mudam. Ela exige licença Entra ID P1 ou superior. A associação atribuída exige adicionar cada membro manualmente, e a dinâmica de dispositivo avalia atributos de dispositivo.",
        options: [
            [
                "Associação dinâmica de usuário, com regra baseada no atributo de departamento.",
                true,
            ],
            [
                "Associação atribuída, adicionando os membros do departamento de vendas manualmente.",
                false,
            ],
            [
                "Associação dinâmica de dispositivo, avaliando os atributos dos equipamentos cadastrados.",
                false,
            ],
            [
                "Associação aninhada, incluindo o grupo do departamento como membro de outro grupo maior.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma parceira externa precisa acessar um aplicativo no tenant da empresa usando a própria identidade corporativa. Qual recurso do Entra ID atende a isso?",
        explanation:
            "A colaboração B2B do Entra ID permite convidar usuários externos como convidados, que acessam recursos usando as próprias credenciais do tenant de origem. Não é necessário criar contas locais nem gerenciar senhas para eles. B2C atende clientes de aplicativos voltados ao consumidor.",
        options: [
            ["Colaboração B2B, convidando a pessoa como usuária convidada do tenant.", true],
            [
                "Entra ID B2C, criando um diretório separado para autenticação de clientes externos.",
                false,
            ],
            [
                "Sincronização com o Entra Connect, replicando o diretório local da empresa parceira.",
                false,
            ],
            [
                "Criação de uma conta local no tenant, com senha gerenciada pela equipe de suporte.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Qual afirmação sobre licenças no Microsoft Entra ID está correta?",
        explanation:
            "Licenças podem ser atribuídas diretamente a usuários ou por meio de grupos, com o licenciamento baseado em grupo aplicando e removendo licenças conforme a associação muda. Alguns serviços exigem que o local de uso do usuário esteja definido antes da atribuição, o que costuma causar erro de atribuição.",
        options: [
            ["Podem ser atribuídas a usuários diretamente ou por meio de grupos.", true],
            [
                "Só podem ser atribuídas individualmente a cada usuário do diretório da organização.",
                false,
            ],
            [
                "São herdadas automaticamente de todos os grupos aos quais o usuário pertencer no tenant.",
                false,
            ],
            ["São vinculadas à assinatura do Azure e não ao usuário do Microsoft Entra ID.", false],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma organização precisa impedir que qualquer recurso seja criado fora das regiões Brazil South e East US. Qual serviço atende a isso?",
        explanation:
            "O Azure Policy avalia recursos contra regras e pode negar a criação daqueles que não atendem, e a política interna de localizações permitidas restringe as regiões. Bloqueios de recursos impedem exclusão ou alteração, mas não restringem região. RBAC controla quem pode agir, não onde os recursos podem existir.",
        options: [
            ["Azure Policy, com a política de localizações permitidas.", true],
            [
                "Bloqueio de recurso do tipo ReadOnly aplicado no escopo da assinatura da organização.",
                false,
            ],
            [
                "Azure RBAC, atribuindo funções apenas para as regiões que a empresa quer permitir.",
                false,
            ],
            [
                "Azure Blueprints, que replica a configuração aprovada para as demais assinaturas.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual é o efeito de uma atribuição de Azure Policy com o efeito DeployIfNotExists?",
        explanation:
            "O efeito DeployIfNotExists implanta um recurso relacionado quando a condição não é atendida, por exemplo criando uma configuração de diagnóstico ausente. Ele exige uma identidade gerenciada com permissão para implantar e só age em recursos criados ou atualizados, exigindo tarefa de remediação para os já existentes.",
        options: [
            ["Implanta um recurso relacionado quando a condição não é atendida.", true],
            [
                "Bloqueia a criação do recurso que não atende à condição definida pela regra da política.",
                false,
            ],
            [
                "Adiciona um campo ao recurso durante a criação, sem impedir que ele seja provisionado.",
                false,
            ],
            [
                "Registra o recurso como não conforme, sem realizar nenhuma alteração no ambiente.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma equipe aplicou um bloqueio do tipo ReadOnly em um resource group. Qual operação passa a ser impedida?",
        explanation:
            "O bloqueio ReadOnly impede qualquer alteração e qualquer exclusão nos recursos do escopo, permitindo apenas leitura. O bloqueio CanNotDelete permite alterações e impede exclusão. Bloqueios são herdados pelos recursos filhos, e o mais restritivo prevalece quando há mais de um.",
        options: [
            ["Alterar a configuração de um recurso do grupo, além de excluí-lo.", true],
            [
                "Apenas a exclusão dos recursos, permitindo alterar as configurações existentes deles.",
                false,
            ],
            [
                "Apenas a leitura das propriedades, exigindo permissão adicional para consultar recursos.",
                false,
            ],
            [
                "A atribuição de novas funções de RBAC aos usuários naquele escopo do resource group.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Um resource group tem um bloqueio CanNotDelete e um recurso dentro dele tem um bloqueio ReadOnly. O que acontece ao tentar alterar esse recurso?",
        explanation:
            "Quando bloqueios diferentes se aplicam ao mesmo recurso, o mais restritivo prevalece. ReadOnly é mais restritivo que CanNotDelete, então a alteração é impedida. Bloqueios são herdados do escopo pai para os filhos e se acumulam, valendo sempre o mais restritivo entre eles.",
        options: [
            ["A alteração é impedida, porque o bloqueio mais restritivo prevalece.", true],
            [
                "A alteração é permitida, porque o bloqueio do resource group só impede a exclusão dele.",
                false,
            ],
            [
                "A alteração é permitida apenas para quem tem a função Owner naquele escopo do recurso.",
                false,
            ],
            [
                "A alteração depende da ordem em que os dois bloqueios foram criados na assinatura.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma administradora aplicou uma tag de centro de custo em um resource group e percebeu que os recursos dentro dele não receberam a tag. Por quê?",
        explanation:
            "Tags aplicadas a um resource group não são herdadas pelos recursos dentro dele. Para propagar, é necessário aplicar a tag em cada recurso, usar Azure Policy com o efeito Modify e uma tarefa de remediação, ou aplicar via script. Essa é uma diferença importante em relação aos bloqueios, que são herdados.",
        options: [
            ["Tags não são herdadas pelos recursos do grupo; precisam ser aplicadas neles.", true],
            [
                "A herança de tags leva até 24 horas para ser processada pelo Azure Resource Manager.",
                false,
            ],
            [
                "A tag precisa ser criada primeiro no escopo da assinatura para poder ser propagada.",
                false,
            ],
            [
                "Somente tags aplicadas por Azure Policy são herdadas pelos recursos do resource group.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Qual é o limite de tags que um recurso do Azure pode ter?",
        explanation:
            "Cada recurso, resource group e assinatura pode ter no máximo 50 pares de nome e valor de tag. O nome da tag aceita até 512 caracteres e o valor até 256, com exceção das contas de armazenamento, em que o nome aceita até 128. Não é uma limitação por assinatura, e sim por recurso.",
        options: [
            ["50 pares de nome e valor por recurso.", true],
            [
                "15 pares de nome e valor por recurso, com nome limitado a 128 caracteres cada um.",
                false,
            ],
            [
                "Ilimitado, desde que o total não exceda o limite de metadados da assinatura utilizada.",
                false,
            ],
            [
                "100 pares por assinatura, distribuídos livremente entre os recursos existentes nela.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma equipe precisa mover uma máquina virtual de um resource group para outro na mesma assinatura. O que é necessário observar?",
        explanation:
            "Ao mover recursos entre resource groups, os recursos dependentes precisam ser movidos juntos, e alguns tipos não suportam a operação. Durante a movimentação, o grupo de origem e o de destino ficam bloqueados para operações de escrita e exclusão. O recurso continua na mesma região, porque mover não altera a localização.",
        options: [
            [
                "Os recursos dependentes precisam ir juntos e a região não muda com a operação.",
                true,
            ],
            [
                "A máquina virtual precisa estar em execução para que a operação possa ser concluída.",
                false,
            ],
            [
                "A movimentação altera a região do recurso conforme a localização do grupo de destino.",
                false,
            ],
            [
                "É necessário recriar todas as atribuições de função, que são perdidas na movimentação.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Qual é a finalidade dos management groups no Azure?",
        explanation:
            "Management groups fornecem um escopo acima das assinaturas para aplicar governança, permitindo que políticas e atribuições de função sejam herdadas por todas as assinaturas contidas. Eles podem ser aninhados em até seis níveis, sem contar o grupo raiz do tenant, e toda assinatura pertence a exatamente um deles.",
        options: [
            [
                "Aplicar governança acima das assinaturas, com herança para as que estão contidas.",
                true,
            ],
            [
                "Agrupar recursos de tipos diferentes que compartilham o mesmo ciclo de vida no projeto.",
                false,
            ],
            [
                "Separar ambientes de rede, isolando o tráfego entre as assinaturas de cada área.",
                false,
            ],
            [
                "Consolidar a cobrança de várias assinaturas em uma única fatura mensal da organização.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Quantos níveis de aninhamento os management groups suportam, sem contar o grupo raiz do tenant?",
        explanation:
            "A hierarquia de management groups suporta até seis níveis de profundidade, sem contar o nível raiz nem o nível de assinatura. Cada management group pode ter um único pai e vários filhos, e cada diretório suporta até dez mil management groups.",
        options: [
            ["Seis.", true],
            [
                "Três, o que limita a hierarquia a raiz, intermediário e o nível das assinaturas.",
                false,
            ],
            [
                "Dez, permitindo modelar estruturas organizacionais complexas com muitas divisões.",
                false,
            ],
            [
                "Ilimitado, desde que cada management group tenha apenas um pai na hierarquia criada.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma organização quer ser avisada quando o gasto de uma assinatura atingir 80% do valor planejado no mês. Qual recurso atende a isso?",
        explanation:
            "Um orçamento do Cost Management define um valor e limites de alerta em percentuais do consumo, disparando notificação para grupos de ação ou destinatários quando os limites são atingidos. Ele monitora o gasto sem interromper serviços. O Azure Advisor traz recomendações, e as alterações de recurso não geram alerta de custo.",
        options: [
            ["Um orçamento no Cost Management com alerta em 80% do valor definido.", true],
            [
                "Uma recomendação do Azure Advisor configurada para monitorar o gasto da assinatura.",
                false,
            ],
            [
                "Um bloqueio de recurso que impede novas implantações após o valor ser atingido.",
                false,
            ],
            [
                "Uma regra de alerta do Azure Monitor sobre a métrica de custo total da assinatura.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual é o comportamento de um orçamento do Azure Cost Management ao atingir o valor definido?",
        explanation:
            "O orçamento é uma ferramenta de acompanhamento e notificação: ao atingir os limites configurados, ele dispara alertas, mas não interrompe nem impede a criação de recursos. Para agir automaticamente, é preciso combiná-lo com um grupo de ação que execute uma automação, como desligar recursos.",
        options: [
            ["Dispara alertas, sem interromper serviços nem bloquear novas implantações.", true],
            [
                "Bloqueia automaticamente a criação de novos recursos até o início do período seguinte.",
                false,
            ],
            [
                "Desliga os recursos de maior custo para manter o gasto abaixo do valor configurado.",
                false,
            ],
            [
                "Cancela a assinatura e move os recursos para o estado desalocado até nova autorização.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Quais categorias de recomendação o Azure Advisor oferece?",
        explanation:
            "O Azure Advisor oferece recomendações em cinco categorias: confiabilidade, segurança, excelência operacional, desempenho e otimização de custo. Ele analisa a telemetria de configuração e uso dos recursos e sugere melhorias, mas não aplica as mudanças automaticamente.",
        options: [
            ["Confiabilidade, segurança, excelência operacional, desempenho e custo.", true],
            [
                "Custo, conformidade e governança, alinhadas às políticas definidas pela organização.",
                false,
            ],
            [
                "Rede, computação, armazenamento e identidade, agrupadas por tipo de recurso do Azure.",
                false,
            ],
            [
                "Disponibilidade, escalabilidade e recuperação de desastre para cargas de produção.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma administradora precisa transferir a propriedade de uma assinatura do Azure para outra conta. Qual operação atende a isso?",
        explanation:
            "A transferência de propriedade de faturamento move a assinatura para outra conta de cobrança ou proprietário, mantendo os recursos. Ela é feita nas configurações de faturamento e requer aceitação de quem recebe. Mover recursos entre resource groups não muda a propriedade da assinatura.",
        options: [
            [
                "Transferir a propriedade de faturamento da assinatura, com aceite do destinatário.",
                true,
            ],
            [
                "Mover todos os recursos para um resource group da assinatura de destino desejada.",
                false,
            ],
            [
                "Atribuir a função Owner à nova conta no escopo da assinatura que será transferida.",
                false,
            ],
            [
                "Criar uma nova assinatura e refazer as implantações a partir de templates exportados.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual escopo de atribuição de função de RBAC é o mais amplo disponível no Azure?",
        explanation:
            "A hierarquia de escopos vai de management group, o mais amplo, para assinatura, resource group e recurso, o mais específico. Atribuições feitas em escopo superior são herdadas pelos inferiores, e a atribuição no management group raiz alcança todas as assinaturas do tenant.",
        options: [
            ["Management group.", true],
            [
                "Assinatura, que contém os resource groups e os recursos individuais do ambiente.",
                false,
            ],
            [
                "Resource group, que agrupa os recursos que compartilham o mesmo ciclo de vida.",
                false,
            ],
            [
                "Tenant do Microsoft Entra ID, que é o escopo mais amplo da estrutura do Azure.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma empresa precisa criar uma função de RBAC que permita apenas iniciar e parar máquinas virtuais, sem outras permissões. Como proceder?",
        explanation:
            "Quando nenhuma função interna atende exatamente, cria-se uma função personalizada com as ações necessárias, no caso as ações de start e deallocate do provedor de computação. A definição usa JSON com Actions, NotActions e AssignableScopes, e a função pode ser atribuída nos escopos declarados.",
        options: [
            ["Criar uma função personalizada com as ações de start e deallocate de VMs.", true],
            [
                "Atribuir Virtual Machine Contributor, que já limita as permissões a essas duas ações.",
                false,
            ],
            [
                "Atribuir Reader e complementar com um bloqueio de recurso do tipo ReadOnly no grupo.",
                false,
            ],
            [
                "Usar o Privileged Identity Management para conceder acesso administrativo temporário.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Em uma definição de função personalizada, para que serve a propriedade AssignableScopes?",
        explanation:
            "AssignableScopes define os escopos em que a função personalizada pode ser atribuída, por exemplo assinaturas ou resource groups específicos. Ela não concede permissão, apenas delimita onde a função fica disponível. Actions e NotActions definem as operações permitidas e as excluídas.",
        options: [
            ["Define os escopos em que a função pode ser atribuída.", true],
            [
                "Define as operações que a função concede a quem a recebe no escopo escolhido.",
                false,
            ],
            [
                "Define as operações excluídas do conjunto concedido pela lista de ações permitidas.",
                false,
            ],
            [
                "Define os usuários e grupos que já recebem a função automaticamente ao criá-la.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Qual afirmação sobre a herança de Azure Policy está correta?",
        explanation:
            "Atribuições de Azure Policy são herdadas pelos escopos inferiores: uma política atribuída no management group vale para as assinaturas contidas, e uma atribuída na assinatura vale para seus resource groups e recursos. É possível definir exclusões para retirar escopos específicos da avaliação.",
        options: [
            ["A atribuição feita em um escopo vale para os escopos contidos nele.", true],
            [
                "A atribuição vale apenas no escopo exato em que foi criada, sem herança para os filhos.",
                false,
            ],
            [
                "A herança acontece apenas quando a política usa o efeito Deny na sua definição.",
                false,
            ],
            [
                "A herança acontece de baixo para cima, do recurso até o management group da hierarquia.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement: "Uma iniciativa (conjunto de políticas) do Azure Policy serve para quê?",
        explanation:
            "Uma iniciativa, também chamada de policy set, agrupa várias definições de política para serem atribuídas em conjunto e avaliadas como uma unidade, o que simplifica a gestão de conformidade. Ela permite parâmetros compartilhados e produz um resultado de conformidade agregado.",
        options: [
            ["Agrupar várias definições de política para atribuir e avaliar em conjunto.", true],
            [
                "Definir a ordem em que as políticas atribuídas serão avaliadas em cada escopo.",
                false,
            ],
            [
                "Remediar automaticamente os recursos não conformes encontrados na avaliação feita.",
                false,
            ],
            [
                "Substituir as atribuições individuais existentes nos escopos filhos da hierarquia.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Recursos criados antes de uma política com efeito Deny ser atribuída continuam existindo. Como o Azure Policy os trata?",
        explanation:
            "O efeito Deny impede novas criações e atualizações que violem a regra, mas não remove recursos existentes. Eles passam a ser avaliados e aparecem como não conformes no painel de conformidade, e a correção depende de ação manual ou de tarefa de remediação quando o efeito permite.",
        options: [
            ["Passam a aparecer como não conformes, sem serem removidos automaticamente.", true],
            [
                "São excluídos automaticamente na próxima avaliação de conformidade do escopo.",
                false,
            ],
            [
                "Ficam bloqueados para leitura até que sejam ajustados conforme a regra definida.",
                false,
            ],
            [
                "São ignorados pela política, que avalia apenas os recursos criados após a atribuição.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma administradora precisa garantir que toda máquina virtual criada receba a tag de ambiente automaticamente. Qual efeito de Azure Policy usar?",
        explanation:
            "O efeito Modify adiciona, atualiza ou remove tags e outras propriedades durante a criação ou a atualização do recurso, e permite remediar recursos existentes por meio de tarefa de remediação. Ele exige identidade gerenciada com permissão adequada. Append adiciona campos apenas na criação e não remedia o que já existe.",
        options: [
            ["Modify, que também permite remediar os recursos já existentes.", true],
            [
                "Deny, que impede a criação de qualquer máquina virtual que venha sem a tag exigida.",
                false,
            ],
            [
                "Audit, que registra a não conformidade e permite acompanhar a adoção da tag no painel.",
                false,
            ],
            [
                "DeployIfNotExists, que implanta um recurso relacionado quando a condição não é atendida.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Qual é a diferença entre as funções do Microsoft Entra ID e as funções do Azure RBAC?",
        explanation:
            "As funções do Entra ID controlam o acesso a recursos do diretório, como criar usuários e gerenciar domínios. As funções do Azure RBAC controlam o acesso a recursos do Azure, como máquinas virtuais e contas de armazenamento. Por padrão um Global Administrator do Entra ID não tem acesso aos recursos do Azure, e precisa elevar o acesso para gerenciá-los.",
        options: [
            ["As do Entra ID atuam no diretório; as do RBAC atuam nos recursos do Azure.", true],
            [
                "As do Entra ID atuam nos recursos do Azure e as do RBAC atuam apenas no diretório criado.",
                false,
            ],
            [
                "São o mesmo conjunto de funções, apresentado em dois lugares diferentes do portal.",
                false,
            ],
            [
                "As do Entra ID valem para o tenant e as do RBAC valem apenas para management groups.",
                false,
            ],
        ],
        topic: "Identidades e governança",
    },
    {
        statement:
            "Uma empresa precisa que os dados de uma conta de armazenamento sobrevivam à perda completa de uma região do Azure. Qual opção de redundância atende a isso com o menor custo?",
        explanation:
            "O GRS replica os dados de forma síncrona três vezes na região primária e de forma assíncrona para uma região secundária emparelhada, protegendo contra falha regional. O ZRS protege contra falha de zona, mas não de região inteira. O RA-GRS acrescenta leitura na secundária e custa mais. O LRS protege apenas contra falha de hardware no mesmo datacenter.",
        options: [
            ["GRS.", true],
            [
                "ZRS, que replica os dados entre três zonas de disponibilidade da região primária.",
                false,
            ],
            [
                "RA-GRS, que replica para a região secundária e permite leitura a partir dela.",
                false,
            ],
            [
                "LRS, que mantém três cópias dos dados dentro de um único datacenter da região.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement: "Quantas cópias dos dados o LRS mantém e onde?",
        explanation:
            "O LRS mantém três cópias síncronas dos dados dentro de um único local físico da região primária, protegendo contra falhas de servidor e de rack. Ele não protege contra a perda do datacenter inteiro nem da região. O ZRS mantém três cópias em zonas diferentes, e o GRS acrescenta a região secundária.",
        options: [
            ["Três cópias, em um único local físico da região primária.", true],
            [
                "Três cópias, distribuídas entre três zonas de disponibilidade da mesma região.",
                false,
            ],
            [
                "Seis cópias, sendo três na região primária e três na região secundária emparelhada.",
                false,
            ],
            [
                "Duas cópias, uma no local primário e outra em um local secundário da mesma região.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual opção de redundância combina proteção contra falha de zona na região primária com replicação para uma região secundária?",
        explanation:
            "O GZRS replica de forma síncrona entre três zonas de disponibilidade na região primária e de forma assíncrona para a região secundária, unindo as proteções do ZRS e do GRS. O RA-GZRS acrescenta leitura na secundária. GRS usa LRS na primária, e ZRS não sai da região.",
        options: [
            ["GZRS.", true],
            [
                "GRS, que replica três vezes na primária e de forma assíncrona para a secundária.",
                false,
            ],
            [
                "ZRS, que distribui as três cópias entre zonas de disponibilidade da mesma região.",
                false,
            ],
            [
                "RA-GRS, que replica para a secundária e permite leitura dos dados a partir dela.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma equipe precisa dar acesso temporário de leitura a um único blob, para uma aplicação externa, sem compartilhar as chaves da conta. Qual recurso atende a isso?",
        explanation:
            "Um shared access signature (SAS) concede acesso delegado, limitado por recurso, permissão, intervalo de validade e opcionalmente por faixa de IP e protocolo, sem expor as chaves da conta. Chaves de acesso dão controle total. Acesso anônimo público não permite limitar por tempo nem por permissão.",
        options: [
            ["Um token SAS de serviço, com permissão de leitura e validade definida.", true],
            [
                "Uma das duas chaves de acesso da conta de armazenamento, enviada à aplicação externa.",
                false,
            ],
            [
                "Acesso anônimo de leitura no contêiner, permitindo que qualquer pessoa baixe o blob.",
                false,
            ],
            [
                "Uma identidade gerenciada atribuída à aplicação externa que precisa ler o blob.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual é a vantagem de uma política de acesso armazenada (stored access policy) sobre um SAS avulso?",
        explanation:
            "A política de acesso armazenada é definida no contêiner e agrupa as restrições do SAS, permitindo alterar ou revogar o acesso de todos os tokens associados sem precisar regerar as chaves da conta. Um SAS avulso só pode ser invalidado antes do vencimento regerando a chave que o assinou.",
        options: [
            ["Permite revogar o acesso sem regerar as chaves da conta.", true],
            [
                "Permite conceder acesso a recursos de contas de armazenamento diferentes ao mesmo tempo.",
                false,
            ],
            [
                "Permite validade ilimitada, dispensando a definição de uma data de expiração do token.",
                false,
            ],
            [
                "Permite autenticação com identidade do Microsoft Entra ID em vez de chave compartilhada.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma conta de armazenamento tem duas chaves de acesso. Qual é a razão de existirem duas?",
        explanation:
            "As duas chaves permitem a rotação sem indisponibilidade: as aplicações passam a usar a segunda chave, a primeira é regerada, e o ciclo se repete na próxima rotação. Ambas dão acesso total à conta, e por isso a recomendação é preferir SAS ou identidade do Entra ID no lugar delas quando possível.",
        options: [
            ["Permitir a rotação das chaves sem indisponibilidade para as aplicações.", true],
            [
                "Separar as permissões de leitura das de escrita entre as duas chaves geradas.",
                false,
            ],
            [
                "Permitir que uma seja usada pelo portal e a outra pelas chamadas via API REST.",
                false,
            ],
            [
                "Atender aos dois protocolos suportados pela conta, um para HTTP e outro para HTTPS.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma empresa precisa que uma conta de armazenamento aceite tráfego apenas de uma sub-rede específica de uma VNet. Qual configuração atende a isso?",
        explanation:
            "O firewall da conta de armazenamento permite restringir o acesso a redes virtuais e sub-redes selecionadas, e a sub-rede precisa ter o service endpoint de Microsoft.Storage habilitado. Também é possível liberar faixas de IP públicos. Private endpoint é outra abordagem, que traz a conta para dentro da VNet com IP privado.",
        options: [
            [
                "Restringir o firewall da conta a redes selecionadas, com service endpoint na sub-rede.",
                true,
            ],
            [
                "Aplicar um NSG na conta de armazenamento com regra que libere apenas aquela sub-rede.",
                false,
            ],
            [
                "Criar uma política de acesso armazenada limitando o acesso pelo IP da sub-rede indicada.",
                false,
            ],
            [
                "Desabilitar as chaves de acesso e permitir apenas autenticação com Microsoft Entra ID.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual é a diferença entre um service endpoint e um private endpoint para uma conta de armazenamento?",
        explanation:
            "O service endpoint mantém o tráfego na rede da Microsoft e permite ao firewall da conta reconhecer a sub-rede de origem, mas a conta continua acessível por seu endpoint público. O private endpoint cria uma interface de rede com IP privado dentro da VNet, e o acesso passa a acontecer por esse IP, permitindo bloquear todo o acesso público.",
        options: [
            [
                "O private endpoint dá à conta um IP privado dentro da VNet; o service endpoint não.",
                true,
            ],
            [
                "O service endpoint cria um IP privado na VNet e o private endpoint apenas filtra a origem.",
                false,
            ],
            [
                "Os dois são equivalentes, mudando apenas o nome usado em cada tipo de serviço do Azure.",
                false,
            ],
            [
                "O service endpoint funciona entre regiões e o private endpoint apenas na mesma região.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma aplicação precisa acessar um compartilhamento do Azure Files usando as credenciais do Active Directory, com permissões de NTFS por pasta. Qual configuração é necessária?",
        explanation:
            "O acesso baseado em identidade para Azure Files usa autenticação Kerberos com Active Directory Domain Services local, Microsoft Entra Domain Services ou Microsoft Entra Kerberos, e permite aplicar permissões de compartilhamento por RBAC e permissões de nível de arquivo e pasta por NTFS. A chave da conta não permite permissão granular por pasta.",
        options: [
            [
                "Habilitar acesso baseado em identidade no Azure Files, com autenticação de domínio.",
                true,
            ],
            [
                "Montar o compartilhamento com a chave da conta, que respeita as permissões NTFS locais.",
                false,
            ],
            [
                "Gerar um SAS por pasta, com as permissões correspondentes de cada grupo de usuários.",
                false,
            ],
            [
                "Habilitar o acesso anônimo de leitura e controlar o acesso pelo firewall da conta.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual camada de acesso do Blob Storage tem o menor custo de armazenamento e o maior custo de recuperação, exigindo reidratação antes da leitura?",
        explanation:
            "A camada Archive tem o menor custo de armazenamento e exige reidratação para as camadas Hot ou Cool antes que os dados possam ser lidos, o que pode levar horas. Cool e Cold armazenam dados acessados com pouca frequência e permitem leitura imediata. Hot é para acesso frequente.",
        options: [
            ["Archive.", true],
            [
                "Cool, indicada para dados acessados com pouca frequência e mantidos por pelo menos 30 dias.",
                false,
            ],
            [
                "Cold, indicada para dados raramente acessados e mantidos por pelo menos 90 dias.",
                false,
            ],
            [
                "Hot, indicada para dados acessados com frequência e que precisam de leitura imediata.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Um blob foi movido para a camada Archive e precisa ser lido. O que é necessário fazer?",
        explanation:
            "Blobs na camada Archive estão offline e não podem ser lidos nem modificados. É necessário reidratá-los, alterando a camada para Hot, Cool ou Cold, ou copiando para outro blob em camada online. A reidratação tem prioridade padrão ou alta, e pode levar horas conforme o tamanho e a prioridade escolhida.",
        options: [
            ["Reidratar o blob para uma camada online, ou copiá-lo para outro blob.", true],
            [
                "Aguardar o tempo mínimo de retenção da camada antes de tentar a leitura novamente.",
                false,
            ],
            [
                "Gerar um SAS com permissão de leitura específica para blobs arquivados na conta.",
                false,
            ],
            [
                "Alterar a redundância da conta para GRS, o que libera a leitura dos blobs arquivados.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma equipe precisa que blobs sejam movidos automaticamente para Cool após 30 dias e excluídos após 365 dias. Qual recurso atende a isso?",
        explanation:
            "O gerenciamento do ciclo de vida do Blob Storage permite definir regras baseadas em idade que movem blobs entre camadas e os excluem automaticamente. As regras são avaliadas uma vez por dia e podem filtrar por prefixo e por tags de blob. Soft delete protege contra exclusão acidental, sem automatizar transições.",
        options: [
            ["Gerenciamento do ciclo de vida, com regras baseadas na idade do blob.", true],
            [
                "Soft delete para blobs, com período de retenção configurado em 365 dias na conta.",
                false,
            ],
            [
                "Versionamento de blob, que mantém as versões anteriores conforme o blob é alterado.",
                false,
            ],
            [
                "Replicação de objetos, que copia os blobs para outra conta conforme regras definidas.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement: "Qual é a função do soft delete para blobs?",
        explanation:
            "O soft delete retém os blobs excluídos por um período configurado, permitindo restaurá-los antes que sejam removidos em definitivo. Ele protege contra exclusão e sobrescrita acidental. O versionamento mantém versões anteriores a cada alteração, e os snapshots são cópias somente leitura criadas manualmente.",
        options: [
            ["Retém os blobs excluídos por um período, permitindo restaurá-los.", true],
            [
                "Mantém uma versão anterior automaticamente a cada alteração feita no blob existente.",
                false,
            ],
            [
                "Cria uma cópia somente leitura do blob no momento em que o comando é executado.",
                false,
            ],
            [
                "Replica os blobs excluídos para a região secundária antes da remoção definitiva.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement: "Qual é a diferença entre versionamento de blob e snapshot?",
        explanation:
            "O versionamento é automático: o Azure cria uma versão do blob a cada modificação, sem ação da aplicação. O snapshot é criado sob demanda, gerando uma cópia somente leitura no momento em que o comando é executado. Os dois podem ser usados juntos, e ambos consomem armazenamento.",
        options: [
            [
                "O versionamento é automático a cada alteração; o snapshot é criado sob demanda.",
                true,
            ],
            [
                "O versionamento é criado sob demanda e o snapshot acontece automaticamente na alteração.",
                false,
            ],
            [
                "O versionamento vale para contêineres e o snapshot vale apenas para blobs individuais.",
                false,
            ],
            [
                "O versionamento é somente leitura e o snapshot permite escrita na cópia que foi gerada.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma empresa precisa copiar automaticamente blobs de uma conta de armazenamento em uma região para outra conta em região diferente, de forma assíncrona. Qual recurso atende a isso?",
        explanation:
            "A replicação de objetos copia blobs de forma assíncrona de um contêiner de origem para um contêiner de destino, possivelmente em outra conta e outra região, conforme regras que podem filtrar por prefixo. Ela exige versionamento e feed de alterações habilitados na origem. GRS replica para a região emparelhada, sem escolha de destino.",
        options: [
            ["Replicação de objetos entre contas, com regras por contêiner.", true],
            [
                "GRS, que replica automaticamente para a região secundária emparelhada da conta atual.",
                false,
            ],
            [
                "AzCopy agendado por uma automação que roda periodicamente e sincroniza os contêineres.",
                false,
            ],
            [
                "Gerenciamento do ciclo de vida, com regra que move os blobs para a conta de destino.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement: "Qual pré-requisito a replicação de objetos exige na conta de origem?",
        explanation:
            "A replicação de objetos exige que o versionamento de blob e o feed de alterações estejam habilitados na conta de origem, e o versionamento também no destino. Sem esses recursos o Azure não consegue acompanhar as modificações a replicar. Soft delete e camadas de acesso não são pré-requisitos.",
        options: [
            ["Versionamento de blob e feed de alterações habilitados.", true],
            [
                "Soft delete habilitado com período mínimo de retenção de sete dias na conta de origem.",
                false,
            ],
            [
                "Redundância GRS ou GZRS configurada, para permitir a cópia entre regiões diferentes.",
                false,
            ],
            [
                "Camada de acesso Hot em todos os blobs que serão replicados para a conta de destino.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma equipe precisa transferir 500 GB de arquivos de um servidor local para o Blob Storage, com retomada em caso de interrupção. Qual ferramenta é a mais indicada?",
        explanation:
            "O AzCopy é a ferramenta de linha de comando para cópia em alto desempenho, com suporte a sincronização, retomada de transferências interrompidas e uso de SAS ou credenciais do Entra ID. O Storage Explorer é gráfico e útil para operações interativas menores, e o portal não é adequado para volumes grandes.",
        options: [
            ["AzCopy, pela linha de comando, com retomada de transferência.", true],
            [
                "Azure Storage Explorer, arrastando as pastas do servidor para o contêiner de destino.",
                false,
            ],
            [
                "Upload pelo portal do Azure, selecionando os arquivos em lotes até completar o volume.",
                false,
            ],
            [
                "Azure File Sync, que sincroniza compartilhamentos de arquivos entre local e nuvem.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement: "Qual é a finalidade do Azure Storage Explorer?",
        explanation:
            "O Storage Explorer é uma aplicação gráfica de desktop para navegar e gerenciar recursos de armazenamento, incluindo blobs, arquivos, filas e tabelas, em várias contas e assinaturas. Ele serve para operações interativas de gestão e transferência, e usa o AzCopy internamente para transferências grandes.",
        options: [
            ["Navegar e gerenciar recursos de armazenamento por uma interface gráfica.", true],
            [
                "Monitorar as métricas de desempenho e disponibilidade das contas de armazenamento.",
                false,
            ],
            [
                "Definir as regras de ciclo de vida e as camadas de acesso aplicadas a cada contêiner.",
                false,
            ],
            [
                "Configurar a redundância e o failover entre a região primária e a secundária da conta.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual tipo de criptografia em repouso é aplicado por padrão a uma conta de armazenamento do Azure?",
        explanation:
            "Todos os dados em contas de armazenamento são criptografados em repouso por padrão com chaves gerenciadas pela Microsoft, sem custo adicional e sem possibilidade de desativação. A conta pode ser configurada para usar chaves gerenciadas pelo cliente no Key Vault, e há também a opção de chave fornecida pelo cliente por requisição de blob.",
        options: [
            [
                "Criptografia com chaves gerenciadas pela Microsoft, sem possibilidade de desativar.",
                true,
            ],
            [
                "Nenhuma por padrão: a criptografia precisa ser habilitada explicitamente na criação.",
                false,
            ],
            [
                "Criptografia com chave gerenciada pelo cliente, obrigatoriamente armazenada no Key Vault.",
                false,
            ],
            [
                "Criptografia apenas dos blobs, deixando filas e tabelas sem proteção em repouso.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma empresa precisa controlar a rotação e a revogação das chaves usadas para criptografar uma conta de armazenamento. Qual configuração atende a isso?",
        explanation:
            "As chaves gerenciadas pelo cliente ficam em um Azure Key Vault ou Managed HSM, sob controle da organização, que pode rotacioná-las e revogá-las. A conta usa uma identidade gerenciada para acessar o cofre. Chaves gerenciadas pela Microsoft são rotacionadas pela plataforma, sem controle do cliente.",
        options: [
            ["Chaves gerenciadas pelo cliente, armazenadas em um Azure Key Vault.", true],
            [
                "Chaves gerenciadas pela Microsoft, com solicitação de rotação por ticket de suporte.",
                false,
            ],
            [
                "As duas chaves de acesso da conta, regeradas periodicamente por uma automação própria.",
                false,
            ],
            [
                "Tokens SAS com validade curta, renovados automaticamente por uma função do Azure.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma administradora criou uma conta de armazenamento e agora precisa alterar a redundância de LRS para GRS. Isso é possível?",
        explanation:
            "A conversão entre algumas opções de redundância é possível diretamente no portal, incluindo LRS para GRS. Outras conversões, como para ZRS, podem exigir migração manual ou solicitação de conversão. O que não é possível é alterar a região da conta, nem o tipo de conta em todos os casos.",
        options: [
            ["Sim, a conversão de LRS para GRS pode ser feita na configuração da conta.", true],
            [
                "Não, a redundância é definida na criação e não pode ser alterada em nenhum caso.",
                false,
            ],
            [
                "Sim, mas apenas criando uma conta nova e copiando os dados com o AzCopy manualmente.",
                false,
            ],
            [
                "Não, a alteração exige que a conta esteja vazia e sem nenhum contêiner criado nela.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Qual é o efeito de configurar a propriedade de acesso público de um contêiner de blobs como Blob?",
        explanation:
            "Com o nível de acesso público definido como Blob, os blobs podem ser lidos anonimamente por quem tem a URL, mas não é possível listar o conteúdo do contêiner. O nível Container também permite listar. O nível Private, que é o padrão, exige autenticação para qualquer operação.",
        options: [
            ["Os blobs podem ser lidos anonimamente, mas o contêiner não pode ser listado.", true],
            [
                "O contêiner pode ser listado anonimamente, mas os blobs exigem autenticação para leitura.",
                false,
            ],
            [
                "Tanto a listagem quanto a leitura exigem autenticação com chave, SAS ou identidade.",
                false,
            ],
            [
                "Os blobs podem ser lidos e gravados anonimamente por quem conhecer a URL do contêiner.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Uma equipe de segurança exige que nenhuma conta de armazenamento da assinatura permita acesso público anônimo. Qual é a forma mais eficaz de garantir isso?",
        explanation:
            "Uma política do Azure Policy com efeito Deny sobre a propriedade allowBlobPublicAccess impede que contas com acesso anônimo habilitado sejam criadas ou atualizadas, e as existentes aparecem como não conformes. Desabilitar manualmente em cada conta não impede que novas sejam criadas fora do padrão.",
        options: [
            ["Uma política do Azure Policy negando contas com acesso público habilitado.", true],
            [
                "Desabilitar a propriedade em cada conta existente, uma a uma, pelo portal do Azure.",
                false,
            ],
            [
                "Aplicar um bloqueio ReadOnly nas contas para impedir alteração dessa configuração.",
                false,
            ],
            [
                "Configurar o firewall de cada conta para recusar todo o tráfego de redes públicas.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Um compartilhamento do Azure Files precisa de retenção de versões anteriores dos arquivos, com restauração pelo próprio usuário. Qual recurso atende a isso?",
        explanation:
            "Os snapshots de compartilhamento no Azure Files criam cópias somente leitura em um ponto no tempo, e ficam acessíveis pela guia de versões anteriores no Windows, permitindo restauração pelo próprio usuário. O soft delete protege o compartilhamento excluído, e o backup usa o Recovery Services vault.",
        options: [
            ["Snapshots de compartilhamento, expostos como versões anteriores no Windows.", true],
            [
                "Soft delete de compartilhamento, que retém o share excluído pelo período configurado.",
                false,
            ],
            [
                "Versionamento de blob, que mantém as versões anteriores a cada alteração de arquivo.",
                false,
            ],
            [
                "Replicação de objetos entre contas, que copia os arquivos para um destino secundário.",
                false,
            ],
        ],
        topic: "Armazenamento",
    },
    {
        statement:
            "Em um template ARM, qual seção declara valores que quem implanta pode informar no momento da implantação?",
        explanation:
            "A seção parameters declara os valores que podem ser fornecidos na implantação, com tipo, valor padrão opcional e restrições. A seção variables define valores calculados internamente, resources declara o que será criado, e outputs devolve valores após a implantação.",
        options: [
            ["parameters.", true],
            [
                "variables, que define valores construídos internamente para reuso dentro do template.",
                false,
            ],
            [
                "outputs, que devolve valores calculados após a conclusão da implantação executada.",
                false,
            ],
            [
                "resources, que declara os recursos que o template vai criar ou atualizar no Azure.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Qual é a relação entre um arquivo Bicep e um template ARM?",
        explanation:
            "Bicep é uma linguagem declarativa específica de domínio que compila para JSON de template ARM, oferecendo sintaxe mais concisa e melhor experiência de autoria. Qualquer coisa possível no template ARM é possível em Bicep, e existem comandos para converter nos dois sentidos com decompile e build.",
        options: [
            ["Bicep é uma linguagem que compila para JSON de template ARM.", true],
            [
                "Bicep substitui o Resource Manager por outro mecanismo de implantação no Azure.",
                false,
            ],
            [
                "Bicep é um formato somente de exportação, sem suporte a implantação direta de recursos.",
                false,
            ],
            [
                "Bicep serve apenas para recursos de computação, e o JSON cobre os demais serviços.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é o comportamento do modo de implantação Complete em uma implantação de template ARM?",
        explanation:
            "No modo Complete, o Resource Manager exclui os recursos que existem no resource group e não estão declarados no template. No modo Incremental, que é o padrão, os recursos existentes não declarados permanecem inalterados. Isso torna o modo Complete arriscado em grupos compartilhados.",
        options: [
            ["Exclui do resource group os recursos que não estão declarados no template.", true],
            [
                "Mantém os recursos existentes que não estão no template, alterando apenas os declarados.",
                false,
            ],
            [
                "Cria os recursos declarados e falha se algum recurso não declarado existir no grupo.",
                false,
            ],
            [
                "Recria todos os recursos do resource group a partir do zero na ordem do template.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma equipe precisa transformar a configuração atual de um resource group em um template reutilizável. Qual operação atende a isso?",
        explanation:
            "A exportação de template gera o JSON correspondente aos recursos existentes no resource group ou em uma implantação anterior, servindo de ponto de partida para reuso. O template exportado costuma exigir ajustes manuais, e pode ser convertido para Bicep com o comando de decompile.",
        options: [
            ["Exportar o template do resource group pelo portal ou pela CLI.", true],
            [
                "Implantar em modo Complete, o que gera automaticamente o template dos recursos atuais.",
                false,
            ],
            [
                "Criar um Azure Blueprint, que replica a configuração aprovada para outras assinaturas.",
                false,
            ],
            [
                "Habilitar o histórico de implantações, que armazena a configuração de cada recurso.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma máquina virtual precisa ser movida para outra região do Azure. Qual é a abordagem suportada?",
        explanation:
            "Mover uma VM entre regiões usa o Azure Resource Mover ou o Site Recovery, que replicam a máquina para a região de destino e concluem com um failover ou commit. A operação de mover recurso entre resource groups não altera a região. Redimensionar não muda localização, e recriar do zero perde a configuração.",
        options: [
            ["Usar o Azure Resource Mover ou o Site Recovery para replicar a VM.", true],
            ["Mover o recurso para um resource group criado na região de destino desejada.", false],
            [
                "Redimensionar a máquina escolhendo um tamanho disponível apenas na nova região.",
                false,
            ],
            ["Alterar a propriedade de localização da máquina virtual pela CLI do Azure.", false],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é a diferença entre um availability set e uma availability zone para máquinas virtuais?",
        explanation:
            "O availability set distribui as VMs entre domínios de falha e de atualização dentro de um único datacenter, protegendo contra falha de hardware e manutenção. As availability zones distribuem as VMs entre locais fisicamente separados da mesma região, protegendo contra a perda de um datacenter inteiro.",
        options: [
            [
                "O set protege dentro de um datacenter; as zonas protegem entre datacenters da região.",
                true,
            ],
            [
                "O set distribui as máquinas entre regiões e as zonas distribuem dentro da mesma região.",
                false,
            ],
            [
                "O set oferece SLA maior que as zonas, por usar domínios de falha independentes no rack.",
                false,
            ],
            [
                "O set é gratuito e as zonas exigem licença adicional por máquina virtual implantada.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "O que é um update domain em um availability set?",
        explanation:
            "Um update domain agrupa VMs que podem ser reiniciadas juntas durante manutenção planejada da plataforma. O Azure reinicia um update domain por vez, garantindo que as demais permaneçam disponíveis. O fault domain agrupa máquinas que compartilham a mesma fonte de energia e switch de rede.",
        options: [
            ["Um grupo de VMs que pode ser reiniciado junto durante manutenção planejada.", true],
            [
                "Um grupo de VMs que compartilha a mesma fonte de energia e o mesmo switch de rede.",
                false,
            ],
            [
                "Um grupo de VMs que recebe a mesma versão de sistema operacional em cada atualização.",
                false,
            ],
            [
                "Um grupo de VMs distribuídas entre zonas de disponibilidade diferentes da região.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma aplicação precisa aumentar e reduzir automaticamente a quantidade de máquinas virtuais conforme o uso de CPU. Qual recurso atende a isso?",
        explanation:
            "Um Virtual Machine Scale Set gerencia um conjunto de VMs idênticas e ajusta a quantidade automaticamente conforme regras de escala baseadas em métricas ou em agenda. Um availability set não escala automaticamente, e redimensionar uma VM é escala vertical e exige reinício.",
        options: [
            ["Virtual Machine Scale Set, com regras de escala automática.", true],
            [
                "Availability set, distribuindo as máquinas entre domínios de falha e de atualização.",
                false,
            ],
            [
                "Redimensionamento automático da máquina virtual conforme o consumo observado de CPU.",
                false,
            ],
            [
                "App Service plan com escala automática configurada por regra de uso de processador.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é a diferença entre escala vertical e escala horizontal para máquinas virtuais?",
        explanation:
            "A escala vertical altera o tamanho da máquina, aumentando ou reduzindo CPU e memória, e normalmente exige reinício. A escala horizontal altera a quantidade de instâncias, o que é feito por Scale Sets e não exige reiniciar as instâncias existentes.",
        options: [
            [
                "Vertical altera o tamanho da máquina; horizontal altera a quantidade de instâncias.",
                true,
            ],
            [
                "Vertical altera a quantidade de instâncias e horizontal altera o tamanho de cada uma.",
                false,
            ],
            [
                "Vertical acontece entre regiões diferentes e horizontal dentro da mesma região do Azure.",
                false,
            ],
            [
                "Vertical é automática por padrão e horizontal precisa ser configurada manualmente sempre.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma máquina virtual precisa de um disco de dados com desempenho previsível para um banco de dados exigente. Qual tipo de disco gerenciado é o mais indicado?",
        explanation:
            "O Premium SSD oferece desempenho previsível com IOPS e throughput garantidos por tamanho de disco, e é indicado para cargas de produção exigentes. O Ultra Disk oferece o desempenho mais alto e configurável, com restrições de região e tamanho de VM. Standard HDD e Standard SSD não garantem desempenho consistente.",
        options: [
            ["Premium SSD.", true],
            [
                "Standard SSD, que oferece latência menor que o HDD com custo mais baixo que o premium.",
                false,
            ],
            [
                "Standard HDD, indicado para cargas com acesso pouco frequente e sem exigência de latência.",
                false,
            ],
            [
                "Disco temporário da máquina, que oferece o menor tempo de resposta entre as opções.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Qual é a característica do disco temporário de uma máquina virtual do Azure?",
        explanation:
            "O disco temporário é armazenamento local do host, montado normalmente como D no Windows e como sdb no Linux, e serve para arquivos de paginação e dados descartáveis. Seu conteúdo é perdido em operações de desalocação, redimensionamento e manutenção do host, por isso nunca deve guardar dados que precisem persistir.",
        options: [
            [
                "Seu conteúdo é perdido em desalocação, redimensionamento e manutenção do host.",
                true,
            ],
            [
                "Ele é replicado com a mesma redundância configurada para os discos gerenciados da VM.",
                false,
            ],
            [
                "Ele pode ser convertido em disco gerenciado sem perda de dados por meio de snapshot.",
                false,
            ],
            [
                "Ele é criptografado com chave gerenciada pelo cliente e mantém os dados após o reinício.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma empresa precisa criptografar os dados de uma máquina virtual no próprio host, antes de chegarem ao armazenamento. Qual recurso atende a isso?",
        explanation:
            "A criptografia no host criptografa os dados em repouso nos discos, nos discos temporários e nos caches diretamente no host que executa a VM, e o tráfego até o armazenamento já sai criptografado. O Azure Disk Encryption usa BitLocker ou dm-crypt dentro do sistema operacional convidado, que é um mecanismo diferente.",
        options: [
            ["Criptografia no host (encryption at host).", true],
            [
                "Azure Disk Encryption, que usa BitLocker no Windows e dm-crypt no Linux convidado.",
                false,
            ],
            [
                "Criptografia do lado do serviço com chave gerenciada pela Microsoft nos discos da VM.",
                false,
            ],
            [
                "Criptografia de rede em trânsito entre a máquina virtual e a conta de armazenamento.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual serviço é indicado para executar um contêiner único, sem orquestração, com cobrança por segundo de execução?",
        explanation:
            "O Azure Container Instances executa contêineres sob demanda, sem exigir orquestrador nem gerenciamento de infraestrutura, com cobrança por segundo. Container Apps acrescenta escala automática, ingresso e microserviços com Dapr e KEDA. AKS é um orquestrador Kubernetes gerenciado.",
        options: [
            ["Azure Container Instances.", true],
            [
                "Azure Container Apps, que oferece escala automática e ingresso gerenciado para contêineres.",
                false,
            ],
            [
                "Azure Kubernetes Service, que entrega um cluster Kubernetes gerenciado pela plataforma.",
                false,
            ],
            [
                "Azure App Service, que hospeda aplicações web e também aceita imagens de contêiner.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é a diferença principal entre Azure Container Instances e Azure Container Apps?",
        explanation:
            "O Container Instances executa contêineres isolados sem orquestração e sem escala automática. O Container Apps é uma plataforma serverless de contêineres com escala automática baseada em eventos, incluindo escala a zero, ingresso HTTP gerenciado, revisões e suporte a microserviços. Os dois dispensam gerenciar máquinas.",
        options: [
            [
                "O Container Apps traz escala automática, revisões e ingresso; o Instances não.",
                true,
            ],
            [
                "O Container Instances traz escala automática e o Container Apps executa uma instância só.",
                false,
            ],
            [
                "O Container Apps exige um cluster Kubernetes provisionado previamente pela equipe.",
                false,
            ],
            [
                "O Container Instances suporta apenas imagens Windows e o Container Apps apenas Linux.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma equipe precisa de um repositório privado para armazenar imagens de contêiner no Azure, com controle de acesso por RBAC. Qual serviço atende a isso?",
        explanation:
            "O Azure Container Registry é o registro privado gerenciado para imagens e artefatos OCI, com autenticação integrada ao Microsoft Entra ID e controle por RBAC. Ele oferece camadas Basic, Standard e Premium, com geo-replicação disponível na Premium.",
        options: [
            ["Azure Container Registry.", true],
            [
                "Azure Container Instances, que também armazena as imagens usadas pelos contêineres.",
                false,
            ],
            [
                "Blob Storage em um contêiner privado, com as camadas de imagem gravadas como blobs.",
                false,
            ],
            [
                "Azure Artifacts, o serviço de pacotes que faz parte do Azure DevOps da organização.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Qual camada do Azure Container Registry oferece geo-replicação?",
        explanation:
            "A geo-replicação está disponível apenas na camada Premium, e permite manter réplicas do registro em várias regiões, com um único nome de host. As camadas Basic e Standard diferem em armazenamento incluído e throughput, sem geo-replicação.",
        options: [
            ["Premium.", true],
            [
                "Standard, que já inclui maior throughput e armazenamento em relação à camada básica.",
                false,
            ],
            [
                "Basic, indicada para cenários de desenvolvimento e avaliação do serviço de registro.",
                false,
            ],
            [
                "Todas as camadas oferecem geo-replicação, mudando apenas o número de réplicas incluídas.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "O que um App Service plan define?",
        explanation:
            "O App Service plan define o conjunto de recursos de computação em que as aplicações rodam: a camada de preço, o tamanho da instância, a quantidade de instâncias, o sistema operacional e a região. Várias aplicações podem compartilhar o mesmo plano, dividindo esses recursos.",
        options: [
            ["Os recursos de computação: camada, tamanho, instâncias, sistema e região.", true],
            [
                "As configurações de aplicação, como variáveis de ambiente e cadeias de conexão usadas.",
                false,
            ],
            [
                "As regras de roteamento e os domínios personalizados vinculados a cada aplicação criada.",
                false,
            ],
            [
                "As permissões de acesso das pessoas que administram cada aplicação hospedada no plano.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma aplicação em App Service precisa de slot de implantação para validar a versão nova antes de trocar com a produção. A partir de qual camada esse recurso está disponível?",
        explanation:
            "Os slots de implantação estão disponíveis a partir da camada Standard, e as camadas superiores oferecem mais slots. As camadas Free e Shared não têm slots, escala automática nem domínio personalizado com TLS. O Basic oferece domínio personalizado e escala manual, mas não slots.",
        options: [
            ["Standard.", true],
            [
                "Basic, que já permite escala manual e associação de domínio personalizado à aplicação.",
                false,
            ],
            [
                "Free, com um único slot adicional disponível para validação antes da publicação final.",
                false,
            ],
            [
                "Premium, sendo a única camada que oferece slots de implantação para as aplicações web.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "O que acontece com o tráfego ao executar uma operação de swap entre o slot de staging e o de produção?",
        explanation:
            "O swap troca os endereços virtuais dos dois slots depois de aquecer as instâncias do slot de origem, o que evita reinício frio e permite uma troca sem tempo de indisponibilidade. Configurações marcadas como de slot permanecem no slot, e as demais acompanham a aplicação na troca.",
        options: [
            ["O tráfego passa para o slot aquecido, sem tempo de indisponibilidade.", true],
            [
                "A aplicação fica indisponível pelo tempo necessário para reiniciar as duas instâncias.",
                false,
            ],
            [
                "O tráfego é dividido igualmente entre os dois slots até a conclusão da operação de troca.",
                false,
            ],
            [
                "As configurações de aplicação são apagadas e precisam ser reconfiguradas após o swap.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma aplicação em App Service precisa responder em um domínio próprio com HTTPS. Quais passos são necessários?",
        explanation:
            "É preciso validar a propriedade do domínio com registros DNS, mapear o domínio personalizado na aplicação e vincular um certificado TLS ao domínio, que pode ser gerenciado pelo App Service, importado do Key Vault ou carregado. Domínio personalizado com TLS exige camada Basic ou superior.",
        options: [
            [
                "Validar o domínio por DNS, mapeá-lo na aplicação e vincular um certificado TLS.",
                true,
            ],
            [
                "Apenas apontar um registro CNAME do domínio para o endereço padrão da aplicação criada.",
                false,
            ],
            [
                "Contratar um certificado externo e instalá-lo no servidor web que hospeda a aplicação.",
                false,
            ],
            [
                "Habilitar o Application Gateway com terminação TLS, o que dispensa o certificado no App.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é a diferença entre escala manual e escala automática em um App Service plan?",
        explanation:
            "Na escala manual a quantidade de instâncias é fixada pela pessoa que administra. Na escala automática, regras baseadas em métricas ou em agenda ajustam a quantidade dentro de limites mínimo e máximo. A escala automática exige camada Standard ou superior.",
        options: [
            [
                "Na manual a contagem é fixa; na automática regras ajustam entre mínimo e máximo.",
                true,
            ],
            [
                "Na manual o tamanho da instância muda e na automática muda a quantidade de instâncias.",
                false,
            ],
            [
                "A manual está disponível em todas as camadas e a automática apenas na camada Free.",
                false,
            ],
            [
                "A manual atua na aplicação e a automática atua no plano que hospeda as aplicações.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma equipe precisa que uma aplicação em App Service acesse um banco de dados que só aceita conexões de uma sub-rede da VNet. Qual configuração atende a isso?",
        explanation:
            "A integração com rede virtual permite que o tráfego de saída da aplicação use uma sub-rede delegada da VNet, o que faz o banco de dados ver a origem como interna. Private endpoint trata do tráfego de entrada para a aplicação. Restrições de acesso filtram quem pode chamar a aplicação.",
        options: [
            ["Integração com VNet, usando uma sub-rede delegada para o tráfego de saída.", true],
            [
                "Private endpoint na aplicação, que traz o tráfego de entrada para dentro da rede virtual.",
                false,
            ],
            [
                "Restrições de acesso na aplicação, liberando apenas o intervalo de IP do banco de dados.",
                false,
            ],
            [
                "Service endpoint na sub-rede do banco, que reconhece a aplicação como origem confiável.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Qual é a finalidade do backup do App Service?",
        explanation:
            "O backup do App Service cria cópias do conteúdo da aplicação, da configuração e opcionalmente de bancos de dados vinculados, gravando em uma conta de armazenamento, com agendamento e retenção configuráveis. Ele está disponível a partir da camada Standard e permite restauração para a mesma aplicação ou para outra.",
        options: [
            [
                "Copiar conteúdo, configuração e bancos vinculados para uma conta de armazenamento.",
                true,
            ],
            [
                "Criar um slot de implantação com a versão anterior da aplicação para permitir reversão.",
                false,
            ],
            [
                "Replicar a aplicação para outra região, mantendo as duas instâncias sincronizadas.",
                false,
            ],
            [
                "Guardar apenas as variáveis de ambiente e as cadeias de conexão configuradas na aplicação.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Uma máquina virtual está desalocada. O que a empresa continua pagando?",
        explanation:
            "Com a VM desalocada, não há cobrança de computação, mas os discos gerenciados continuam sendo cobrados, assim como IPs públicos estáticos reservados e outros recursos associados. Apenas parar o sistema operacional pela linha de comando de dentro da VM não desaloca e mantém a cobrança de computação.",
        options: [
            ["Os discos gerenciados e os IPs públicos estáticos reservados.", true],
            [
                "Nada: a desalocação encerra a cobrança de todos os recursos ligados à máquina virtual.",
                false,
            ],
            [
                "Apenas a computação, que continua sendo cobrada até a exclusão definitiva do recurso.",
                false,
            ],
            [
                "Os discos e também a computação, com desconto proporcional ao tempo desalocado no mês.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual é a diferença entre parar a VM pelo sistema operacional convidado e desalocar pelo portal?",
        explanation:
            "Parar pelo sistema operacional convidado deixa a máquina no estado stopped, mas os recursos de computação continuam reservados e cobrados. Desalocar pelo portal ou pela CLI libera os recursos de computação e encerra essa cobrança, deixando a máquina no estado stopped deallocated.",
        options: [
            ["Desalocar libera a computação e encerra a cobrança dela; parar não faz isso.", true],
            [
                "Parar libera a computação e desalocar mantém os recursos reservados para religar rápido.",
                false,
            ],
            [
                "As duas operações são equivalentes, mudando apenas a ferramenta usada para executá-las.",
                false,
            ],
            [
                "Desalocar exclui os discos gerenciados e parar preserva o conteúdo deles na conta.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma equipe precisa que as instâncias de um Scale Set sejam distribuídas entre três zonas de disponibilidade. Quando essa configuração pode ser definida?",
        explanation:
            "A escolha das zonas de disponibilidade de um Scale Set é feita na criação e não pode ser alterada depois. O mesmo vale para VMs individuais: a zona é definida no provisionamento. Para mudar, é preciso recriar o recurso ou usar replicação para outra configuração.",
        options: [
            ["Na criação do Scale Set, e não pode ser alterada depois.", true],
            [
                "A qualquer momento, editando a propriedade de zonas na configuração do Scale Set.",
                false,
            ],
            [
                "Somente quando o Scale Set estiver com zero instâncias em execução no momento.",
                false,
            ],
            [
                "Automaticamente pela plataforma, conforme a capacidade disponível em cada zona.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Qual política de atualização de um Scale Set aplica novas versões da imagem às instâncias automaticamente, respeitando lotes e verificações de saúde?",
        explanation:
            "A política de upgrade automático de imagem do sistema operacional atualiza as instâncias em lotes, respeitando verificações de saúde e pausando quando falhas são detectadas. Na política manual, quem administra precisa acionar a atualização de cada instância. A política rolling exige extensão de saúde configurada.",
        options: [
            ["Upgrade automático de imagem do sistema operacional.", true],
            [
                "Política manual, em que cada instância precisa ser atualizada por quem administra o conjunto.",
                false,
            ],
            [
                "Escala automática baseada em métricas, que substitui as instâncias conforme a demanda muda.",
                false,
            ],
            [
                "Política de reimplantação, que recria as instâncias em outro host do mesmo datacenter.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Um template ARM precisa criar uma máquina virtual somente quando um parâmetro booleano for verdadeiro. Qual recurso do template atende a isso?",
        explanation:
            "A propriedade condition em um recurso do template avalia uma expressão e cria o recurso apenas quando ela é verdadeira. O laço copy repete a criação de recursos, dependsOn declara ordem de dependência, e outputs devolve valores após a implantação.",
        options: [
            ["A propriedade condition no recurso.", true],
            [
                "O laço copy, que repete a criação do recurso conforme a quantidade informada em parâmetro.",
                false,
            ],
            [
                "A propriedade dependsOn, que declara a ordem em que os recursos devem ser provisionados.",
                false,
            ],
            [
                "A seção outputs, que devolve os identificadores dos recursos criados na implantação atual.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement: "Qual é a finalidade da propriedade dependsOn em um template ARM?",
        explanation:
            "A propriedade dependsOn declara que um recurso só pode ser criado depois de outro, controlando a ordem quando o Resource Manager não consegue inferir a dependência automaticamente. Referências implícitas via funções de referência já criam dependência, e o excesso de dependsOn deixa a implantação mais lenta.",
        options: [
            ["Declarar que um recurso só pode ser criado depois de outro.", true],
            [
                "Declarar que o recurso só será criado se a condição informada for avaliada como verdadeira.",
                false,
            ],
            [
                "Declarar quantas cópias do recurso o template deve criar durante a mesma implantação.",
                false,
            ],
            [
                "Declarar os valores que a implantação devolve depois de concluir a criação dos recursos.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Uma administradora precisa alterar o tamanho de uma máquina virtual em produção para um tamanho de outra família de hardware. O que esperar?",
        explanation:
            "Mudar para um tamanho disponível no mesmo cluster de hardware pode ser feito com reinício. Quando o tamanho pertence a outra família não disponível no cluster atual, é necessário desalocar a máquina antes de redimensionar, o que implica indisponibilidade maior. O tamanho alvo também precisa existir na região.",
        options: [
            ["Pode ser necessário desalocar a máquina antes de aplicar o novo tamanho.", true],
            [
                "A alteração é aplicada sem reinício, porque o Azure migra a máquina ao vivo entre hosts.",
                false,
            ],
            [
                "A alteração exige recriar a máquina, porque o tamanho é definido apenas na criação dela.",
                false,
            ],
            [
                "A alteração exige mover a máquina para outro resource group da mesma assinatura antes.",
                false,
            ],
        ],
        topic: "Computação",
    },
    {
        statement:
            "Duas VNets em regiões diferentes precisam se comunicar por IP privado, sem passar pela internet. Qual recurso atende a isso?",
        explanation:
            "O peering global de rede virtual conecta VNets em regiões diferentes, com tráfego privado pela rede da Microsoft. O peering não é transitivo: se A faz peering com B e B com C, A não alcança C sem uma conexão própria ou um dispositivo de roteamento. VPN gateway também conecta, mas com custo e latência maiores.",
        options: [
            ["Peering global de rede virtual.", true],
            [
                "Peering local de rede virtual, que conecta redes virtuais dentro da mesma região do Azure.",
                false,
            ],
            [
                "Service endpoint configurado nas sub-redes das duas redes virtuais que vão se comunicar.",
                false,
            ],
            [
                "Azure Bastion implantado em cada uma das redes virtuais envolvidas na comunicação.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "A VNet A tem peering com a VNet B, e a VNet B tem peering com a VNet C. A VNet A consegue alcançar a VNet C?",
        explanation:
            "O peering de rede virtual não é transitivo. Para que A alcance C, é necessário criar peering direto entre elas, ou usar um dispositivo de roteamento, como uma NVA ou um gateway, com rotas definidas pelo usuário. A topologia hub and spoke depende disso quando os spokes precisam se falar.",
        options: [
            ["Não, porque o peering não é transitivo.", true],
            [
                "Sim, porque o peering propaga automaticamente as rotas de todas as redes conectadas.",
                false,
            ],
            [
                "Sim, desde que as três redes virtuais estejam na mesma região e na mesma assinatura.",
                false,
            ],
            [
                "Não, a menos que o peering seja configurado como global em vez de local nas conexões.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma sub-rede tem o espaço 10.0.1.0/24. Quantos endereços IP ficam disponíveis para os recursos?",
        explanation:
            "Uma sub-rede /24 tem 256 endereços, e o Azure reserva cinco: o primeiro para o endereço de rede, os três seguintes para uso interno da plataforma e o último para broadcast. Restam 251 endereços utilizáveis. Essa reserva de cinco vale para qualquer tamanho de sub-rede no Azure.",
        options: [
            ["251.", true],
            [
                "254, descontando apenas o endereço de rede e o endereço de broadcast do intervalo.",
                false,
            ],
            [
                "256, porque o Azure não reserva endereços dentro do espaço definido para a sub-rede.",
                false,
            ],
            [
                "250, porque o Azure reserva seis endereços em cada sub-rede criada na rede virtual.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "Qual é o menor prefixo de sub-rede permitido em uma rede virtual do Azure?",
        explanation:
            "O Azure permite sub-redes de /2 até /29. Um /29 oferece oito endereços, dos quais três ficam utilizáveis depois das cinco reservas da plataforma. Prefixos menores que /29, como /30 e /31, não são aceitos porque não sobrariam endereços utilizáveis.",
        options: [
            ["/29.", true],
            [
                "/30, que oferece quatro endereços e é comum em enlaces ponto a ponto de redes locais.",
                false,
            ],
            [
                "/28, para garantir ao menos onze endereços utilizáveis após as reservas da plataforma.",
                false,
            ],
            [
                "/24, que é o menor prefixo aceito pelo Azure em qualquer rede virtual criada na conta.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma equipe precisa bloquear o tráfego de entrada na porta 3389 para uma sub-rede inteira. Qual recurso atende a isso?",
        explanation:
            "Um network security group associado à sub-rede filtra o tráfego de entrada e saída por regras com prioridade, origem, destino, porta e protocolo. NSGs podem ser associados a sub-redes e a interfaces de rede. O application security group agrupa NICs para simplificar as regras, sem filtrar por si só.",
        options: [
            [
                "Um network security group associado à sub-rede, com regra de negação na porta.",
                true,
            ],
            [
                "Um application security group contendo as interfaces de rede das máquinas da sub-rede.",
                false,
            ],
            [
                "Uma rota definida pelo usuário descartando o tráfego destinado àquela porta específica.",
                false,
            ],
            [
                "Um service endpoint na sub-rede, que restringe a origem do tráfego aceito pelos recursos.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Um NSG está associado à sub-rede e outro à interface de rede da máquina virtual. Como o tráfego de entrada é avaliado?",
        explanation:
            "Para o tráfego de entrada, o NSG da sub-rede é avaliado primeiro e o da interface de rede depois. O tráfego precisa ser permitido pelos dois para chegar à máquina. Para o tráfego de saída a ordem se inverte: primeiro a interface, depois a sub-rede.",
        options: [
            ["Primeiro o NSG da sub-rede, depois o da interface de rede.", true],
            [
                "Primeiro o NSG da interface de rede, depois o da sub-rede em que ela está associada.",
                false,
            ],
            [
                "Apenas o NSG mais restritivo entre os dois é avaliado durante a passagem do tráfego.",
                false,
            ],
            [
                "Os dois são avaliados em paralelo e basta que um deles permita para o tráfego passar.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Em um NSG, duas regras se aplicam ao mesmo tráfego: uma de negação com prioridade 200 e uma de permissão com prioridade 300. Qual prevalece?",
        explanation:
            "As regras de NSG são avaliadas por prioridade, do número menor para o maior, e a primeira que corresponde ao tráfego é aplicada, encerrando a avaliação. Como 200 é menor que 300, a regra de negação prevalece. Prioridades válidas vão de 100 a 4096.",
        options: [
            ["A regra de negação, porque tem o número de prioridade menor.", true],
            [
                "A regra de permissão, porque regras de permissão têm precedência sobre as de negação.",
                false,
            ],
            [
                "A regra de prioridade maior, porque o Azure avalia do número maior para o menor.",
                false,
            ],
            [
                "Nenhuma: o conflito faz o Azure aplicar a regra padrão do NSG para aquele tráfego.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "Para que serve um application security group (ASG)?",
        explanation:
            "O ASG agrupa interfaces de rede por função de aplicação, permitindo escrever regras de NSG que referenciam o grupo em vez de faixas de IP. Isso simplifica a manutenção quando máquinas entram e saem, porque a regra continua válida sem edição. O ASG não filtra tráfego por si só.",
        options: [
            ["Agrupar interfaces de rede para usar como origem ou destino em regras de NSG.", true],
            [
                "Filtrar o tráfego de entrada e saída das máquinas virtuais associadas ao grupo criado.",
                false,
            ],
            [
                "Agrupar sub-redes de redes virtuais diferentes sob uma mesma política de segurança.",
                false,
            ],
            [
                "Substituir o NSG em cenários em que o filtro por endereço IP não é suficiente.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma administradora precisa descobrir por que uma máquina virtual não recebe tráfego na porta 443, considerando todas as regras aplicadas. Qual recurso do Azure ajuda?",
        explanation:
            "A visualização de regras de segurança efetivas mostra a combinação das regras dos NSGs da sub-rede e da interface de rede aplicadas à VM, incluindo as regras padrão. O Network Watcher também oferece verificação de fluxo de IP e diagnóstico de próximo salto para investigar conectividade.",
        options: [
            ["As regras de segurança efetivas da interface de rede da máquina virtual.", true],
            [
                "O log de atividade da assinatura, que registra as alterações feitas nos grupos de segurança.",
                false,
            ],
            [
                "O Azure Advisor, que recomenda ajustes de configuração nos recursos de rede do ambiente.",
                false,
            ],
            [
                "A tabela de rotas efetivas da sub-rede, que mostra o caminho escolhido para cada destino.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma empresa precisa acessar máquinas virtuais por RDP e SSH sem expor IP público nem abrir portas de gerenciamento na internet. Qual serviço atende a isso?",
        explanation:
            "O Azure Bastion oferece conectividade RDP e SSH pelo portal, por TLS na porta 443, sem que as máquinas precisem de IP público nem de portas de gerenciamento abertas. Ele é implantado em uma sub-rede dedicada chamada AzureBastionSubnet, com prefixo mínimo /26.",
        options: [
            ["Azure Bastion, implantado em uma sub-rede dedicada da rede virtual.", true],
            [
                "Just-in-time VM access, que abre as portas de gerenciamento por tempo limitado quando pedido.",
                false,
            ],
            [
                "Um NSG com regra de permissão restrita ao intervalo de IP público da rede corporativa.",
                false,
            ],
            [
                "Um load balancer interno publicando as portas de gerenciamento apenas para a VNet.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "Qual é o nome e o tamanho mínimo exigidos para a sub-rede do Azure Bastion?",
        explanation:
            "A sub-rede precisa se chamar exatamente AzureBastionSubnet e ter prefixo /26 ou maior, ou seja, /26, /25 e assim por diante. Nomes diferentes fazem a implantação falhar. A sub-rede não pode ter NSG que bloqueie o tráfego exigido pelo serviço, e não deve conter outros recursos.",
        options: [
            ["AzureBastionSubnet, com prefixo /26 ou maior.", true],
            [
                "BastionSubnet, com prefixo /27 ou maior, conforme o número de sessões simultâneas previsto.",
                false,
            ],
            [
                "GatewaySubnet, com prefixo /27, compartilhada com o gateway de rede virtual da conta.",
                false,
            ],
            [
                "AzureBastionSubnet, com prefixo exatamente /24 para acomodar a escala do serviço.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma equipe precisa que todo o tráfego de saída de uma sub-rede passe por um firewall virtual antes de sair. Qual recurso atende a isso?",
        explanation:
            "Uma rota definida pelo usuário em uma tabela de rotas associada à sub-rede envia o tráfego para o próximo salto do tipo appliance virtual, com o IP privado do firewall. A máquina do firewall precisa ter o encaminhamento de IP habilitado na interface de rede.",
        options: [
            ["Uma rota definida pelo usuário apontando o firewall como próximo salto.", true],
            [
                "Um NSG na sub-rede com regra de permissão apenas para o endereço IP do firewall virtual.",
                false,
            ],
            [
                "Um service endpoint na sub-rede, que direciona o tráfego pela rede troncal da Microsoft.",
                false,
            ],
            [
                "Um peering de rede virtual entre a sub-rede de origem e a sub-rede do firewall virtual.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "O que é necessário habilitar na interface de rede de uma máquina virtual que atua como appliance de roteamento?",
        explanation:
            "O encaminhamento de IP (IP forwarding) precisa ser habilitado na interface de rede para que a máquina aceite e encaminhe pacotes cujo destino não é o próprio endereço. Sem isso o Azure descarta o tráfego, mesmo com as rotas definidas apontando para a máquina.",
        options: [
            ["O encaminhamento de IP na configuração da interface de rede.", true],
            [
                "O IP público estático, para que as rotas possam referenciar um endereço permanente.",
                false,
            ],
            [
                "A rede acelerada, que aumenta o desempenho de pacotes por segundo na interface da máquina.",
                false,
            ],
            [
                "O endereço IP privado dinâmico, para que o Azure atualize as rotas automaticamente.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "Qual é a diferença entre um IP público básico e um standard no Azure?",
        explanation:
            "O SKU standard é sempre estático, é seguro por padrão (fechado até que um NSG permita), suporta zonas de disponibilidade e é exigido pelo load balancer standard. O SKU básico permite alocação dinâmica, é aberto por padrão e está em caminho de aposentadoria.",
        options: [
            ["O standard é sempre estático, fechado por padrão e suporta zonas.", true],
            [
                "O básico é sempre estático e o standard permite escolher entre dinâmico e estático.",
                false,
            ],
            [
                "O standard é aberto por padrão e o básico exige um NSG para permitir qualquer tráfego.",
                false,
            ],
            [
                "O básico suporta zonas de disponibilidade e o standard atende apenas recursos regionais.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma aplicação precisa distribuir tráfego TCP entre três máquinas virtuais dentro da mesma VNet, sem exposição à internet. Qual recurso atende a isso?",
        explanation:
            "Um load balancer interno distribui tráfego de camada 4 entre instâncias usando um IP privado da VNet, sem exposição pública. O load balancer público usa IP público. O Application Gateway opera na camada 7 com recursos como roteamento por URL e WAF, e o Traffic Manager atua por DNS.",
        options: [
            ["Um load balancer interno, com IP privado da rede virtual.", true],
            [
                "Um load balancer público, restringindo o acesso por regras de grupo de segurança de rede.",
                false,
            ],
            [
                "Um Application Gateway, que distribui o tráfego HTTP entre as instâncias configuradas.",
                false,
            ],
            [
                "Um Traffic Manager, que distribui o tráfego entre os destinos por meio de respostas DNS.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Em que camada do modelo OSI o Azure Load Balancer e o Application Gateway operam, respectivamente?",
        explanation:
            "O Load Balancer opera na camada 4, distribuindo tráfego TCP e UDP sem inspecionar o conteúdo. O Application Gateway opera na camada 7, entendendo HTTP e permitindo roteamento por caminho e por host, terminação TLS e firewall de aplicação web. A escolha depende do tipo de decisão de roteamento necessária.",
        options: [
            ["Camada 4 e camada 7.", true],
            [
                "Camada 7 e camada 4, com o Application Gateway atuando no transporte do tráfego TCP.",
                false,
            ],
            [
                "Camada 3 e camada 4, com decisões baseadas apenas em endereço IP e porta de destino.",
                false,
            ],
            [
                "Camada 7 nos dois casos, mudando apenas o conjunto de recursos oferecido por cada um.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "O que uma sonda de saúde (health probe) faz em um load balancer do Azure?",
        explanation:
            "A sonda de saúde verifica periodicamente as instâncias do pool de back-end e retira da distribuição as que não respondem conforme esperado, evitando enviar tráfego para instâncias indisponíveis. A sonda pode ser TCP, HTTP ou HTTPS, com intervalo e limite de falhas configuráveis.",
        options: [
            ["Verifica as instâncias e retira da distribuição as que não respondem.", true],
            [
                "Distribui o tráfego entre as instâncias conforme o algoritmo de balanceamento escolhido.",
                false,
            ],
            [
                "Registra as métricas de latência de cada instância para uso no painel de monitoramento.",
                false,
            ],
            [
                "Escala automaticamente o pool de back-end quando todas as instâncias ficam sobrecarregadas.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma equipe precisa resolver nomes internos como app.contoso.local para IPs privados dentro de uma VNet, sem servidor DNS próprio. Qual recurso atende a isso?",
        explanation:
            "Uma zona DNS privada do Azure resolve nomes para IPs privados e é vinculada a uma ou mais VNets, com registro automático opcional das máquinas virtuais. A zona DNS pública do Azure atende nomes na internet. O DNS fornecido pelo Azure resolve apenas nomes internos padrão da VNet.",
        options: [
            ["Uma zona DNS privada do Azure, vinculada à rede virtual.", true],
            [
                "Uma zona DNS pública do Azure, com registros apontando para os endereços privados.",
                false,
            ],
            [
                "O DNS padrão fornecido pelo Azure, que resolve qualquer nome personalizado na VNet.",
                false,
            ],
            [
                "Um service endpoint de DNS habilitado nas sub-redes que precisam da resolução interna.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Qual configuração permite que máquinas virtuais de uma VNet registrem automaticamente seus nomes em uma zona DNS privada?",
        explanation:
            "O registro automático é habilitado no vínculo entre a zona DNS privada e a rede virtual. Com ele, o Azure cria e remove registros A conforme as máquinas são criadas e excluídas. Só um vínculo por zona pode ter registro automático para a mesma VNet.",
        options: [
            ["O registro automático no vínculo entre a zona e a rede virtual.", true],
            [
                "A delegação da zona para os servidores de nome padrão fornecidos pelo Azure na região.",
                false,
            ],
            [
                "A criação de registros CNAME apontando para o nome interno padrão de cada máquina.",
                false,
            ],
            [
                "A habilitação do service endpoint de DNS na sub-rede em que as máquinas estão criadas.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma empresa registrou um domínio em outro provedor e quer gerenciar os registros no Azure DNS. Qual passo é necessário?",
        explanation:
            "É preciso criar a zona DNS pública no Azure e delegar o domínio, alterando os servidores de nome no registrador para os quatro servidores atribuídos à zona. Sem a delegação, a zona existe mas não é consultada pela internet. O Azure DNS não faz registro de domínio.",
        options: [
            [
                "Delegar o domínio, apontando os servidores de nome do registrador para os da zona.",
                true,
            ],
            [
                "Importar o arquivo de zona no Azure DNS, o que redireciona as consultas automaticamente.",
                false,
            ],
            [
                "Criar uma zona privada e vinculá-la à rede virtual em que os recursos estão publicados.",
                false,
            ],
            [
                "Transferir o registro do domínio para o Azure, porque a delegação não é suportada.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Duas VNets precisam ter peering, mas os espaços de endereço 10.0.0.0/16 e 10.0.0.0/16 são idênticos. O que acontece?",
        explanation:
            "O peering de rede virtual exige espaços de endereço que não se sobreponham. Com prefixos idênticos ou sobrepostos, a criação do peering falha. A solução é alterar o espaço de uma das redes, o que pode exigir recriar recursos, ou usar outra forma de conectividade com tradução de endereços.",
        options: [
            ["O peering falha, porque os espaços de endereço não podem se sobrepor.", true],
            [
                "O peering é criado e o Azure aplica tradução de endereços automaticamente entre as redes.",
                false,
            ],
            [
                "O peering é criado, mas apenas o tráfego de saída funciona em uma das duas direções.",
                false,
            ],
            [
                "O peering é criado e a segunda rede recebe um espaço alternativo atribuído pelo Azure.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Qual ferramenta do Network Watcher verifica se um pacote de uma origem para um destino específico seria permitido ou negado pelas regras aplicadas?",
        explanation:
            "A verificação de fluxo de IP avalia origem, destino, porta e protocolo contra as regras de NSG aplicadas e informa se o tráfego é permitido ou negado, indicando a regra responsável. O próximo salto mostra o caminho de roteamento, e o monitor de conexão acompanha conectividade ao longo do tempo.",
        options: [
            ["Verificação de fluxo de IP.", true],
            [
                "Próximo salto, que indica por qual caminho o tráfego destinado a um endereço será enviado.",
                false,
            ],
            [
                "Monitor de conexão, que acompanha a conectividade e a latência entre origens e destinos.",
                false,
            ],
            [
                "Captura de pacotes, que grava o tráfego que passa pela interface de rede da máquina.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma administradora precisa saber por qual caminho o tráfego de uma VM sai ao acessar um IP na internet, considerando as rotas definidas. Qual ferramenta usar?",
        explanation:
            "O diagnóstico de próximo salto do Network Watcher informa o tipo de próximo salto e o endereço para um destino específico, mostrando o efeito das rotas do sistema e das rotas definidas pelo usuário. A verificação de fluxo de IP avalia regras de segurança, não rotas.",
        options: [
            ["Próximo salto (next hop) do Network Watcher.", true],
            [
                "Verificação de fluxo de IP, que avalia se o tráfego é permitido pelas regras de segurança.",
                false,
            ],
            [
                "Log de fluxo de NSG, que registra o tráfego permitido e negado pelas regras aplicadas.",
                false,
            ],
            [
                "Topologia do Network Watcher, que desenha os recursos de rede virtual e suas conexões.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement:
            "Uma sub-rede precisa que o tráfego para o Azure Storage permaneça na rede da Microsoft e que a conta reconheça a sub-rede como origem confiável. Qual configuração atende a isso?",
        explanation:
            "O service endpoint para Microsoft.Storage na sub-rede faz o tráfego usar a rede troncal da Microsoft e permite que o firewall da conta de armazenamento reconheça e libere aquela sub-rede. O private endpoint é a alternativa que traz a conta para a VNet com IP privado.",
        options: [
            ["Habilitar o service endpoint de Microsoft.Storage na sub-rede.", true],
            [
                "Criar um private endpoint para a conta na sub-rede, com registro em zona DNS privada.",
                false,
            ],
            [
                "Configurar uma rota definida pelo usuário com próximo salto do tipo internet para o serviço.",
                false,
            ],
            [
                "Habilitar o peering global entre a rede virtual e a rede em que a conta está publicada.",
                false,
            ],
        ],
        topic: "Rede virtual",
    },
    {
        statement: "Qual é a diferença entre métricas e logs no Azure Monitor?",
        explanation:
            "Métricas são valores numéricos coletados em intervalos regulares, leves e otimizados para alerta quase em tempo real. Logs são registros com estrutura variável armazenados em um workspace do Log Analytics, consultados com KQL e adequados para análise detalhada e correlação. Os dois alimentam alertas, com latências diferentes.",
        options: [
            ["Métricas são numéricas e periódicas; logs são registros consultados com KQL.", true],
            [
                "Métricas são textuais e logs são numéricos, coletados em intervalos fixos pela plataforma.",
                false,
            ],
            [
                "Métricas ficam no workspace do Log Analytics e logs ficam na conta de armazenamento.",
                false,
            ],
            [
                "Métricas servem apenas para painéis e logs servem apenas para retenção de auditoria.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Onde os logs de diagnóstico de um recurso do Azure precisam ser enviados para serem consultados com KQL?",
        explanation:
            "Para consulta com KQL, os logs devem ser enviados a um workspace do Log Analytics por meio de uma configuração de diagnóstico. Os outros destinos possíveis são conta de armazenamento, para arquivamento de baixo custo, e Event Hubs, para envio a sistemas externos, mas nenhum deles permite consulta com KQL.",
        options: [
            ["Para um workspace do Log Analytics.", true],
            [
                "Para uma conta de armazenamento, que é o destino padrão dos logs de diagnóstico do recurso.",
                false,
            ],
            [
                "Para um Event Hub, que encaminha os registros ao mecanismo de consulta do Azure Monitor.",
                false,
            ],
            [
                "Para o Azure Monitor Metrics, que armazena tanto as métricas quanto os registros de log.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Qual linguagem é usada para consultar logs no Azure Monitor?",
        explanation:
            "As consultas de log no Azure Monitor usam a Kusto Query Language (KQL), com operadores como where, summarize, project e join, encadeados por barra vertical. Não é SQL nem PowerShell, embora existam formas de executar consultas KQL a partir de scripts.",
        options: [
            ["Kusto Query Language (KQL).", true],
            [
                "Transact-SQL, a mesma linguagem usada nas consultas ao Azure SQL Database do ambiente.",
                false,
            ],
            [
                "PowerShell, por meio dos cmdlets do módulo de monitoramento instalado na estação de trabalho.",
                false,
            ],
            [
                "JMESPath, a linguagem de consulta usada para filtrar as saídas da CLI do Azure.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Uma administradora precisa ser notificada por email e por webhook quando o uso de CPU de uma VM passar de 90% por cinco minutos. Quais componentes são necessários?",
        explanation:
            "É preciso uma regra de alerta com a condição sobre a métrica e um grupo de ação com as ações de notificação, no caso email e webhook. O grupo de ação é reutilizável por várias regras. As regras de processamento de alerta permitem suprimir ou rotear alertas sem alterar as regras.",
        options: [
            ["Uma regra de alerta com a condição e um grupo de ação com as notificações.", true],
            [
                "Apenas uma regra de alerta, que já contém os endereços de notificação na configuração.",
                false,
            ],
            [
                "Uma configuração de diagnóstico enviando a métrica para o workspace do Log Analytics.",
                false,
            ],
            [
                "Uma regra de processamento de alerta, que dispara as notificações conforme a condição.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Para que serve uma regra de processamento de alerta (alert processing rule)?",
        explanation:
            "As regras de processamento de alerta modificam o comportamento dos alertas depois que eles são disparados, permitindo suprimir notificações durante uma janela de manutenção ou aplicar um grupo de ação a um conjunto de alertas. Elas não definem a condição que dispara o alerta.",
        options: [
            [
                "Suprimir notificações em janelas de manutenção ou aplicar grupos de ação em conjunto.",
                true,
            ],
            [
                "Definir a condição de métrica ou de log que faz o alerta ser disparado pelo Azure Monitor.",
                false,
            ],
            [
                "Escalar automaticamente os recursos quando a condição de alerta permanece ativa por tempo.",
                false,
            ],
            [
                "Encaminhar os logs de diagnóstico para o destino configurado na regra de processamento.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Qual recurso do Azure Monitor oferece painéis prontos com análise de desempenho e dependências para máquinas virtuais?",
        explanation:
            "O VM Insights, parte do Azure Monitor Insights, oferece painéis prontos de desempenho, mapa de dependências entre processos e conexões, e coleta padronizada de dados por meio do agente. Ele reduz o esforço de montar consultas e painéis manualmente para cenários comuns.",
        options: [
            ["VM Insights.", true],
            [
                "Network Watcher, que reúne as ferramentas de diagnóstico de conectividade e roteamento.",
                false,
            ],
            [
                "Azure Advisor, que apresenta recomendações de confiabilidade, segurança, custo e desempenho.",
                false,
            ],
            [
                "Log Analytics workspace, que armazena os registros consultados pelas expressões em KQL.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Uma equipe precisa acompanhar continuamente a latência e a perda de pacotes entre uma VM no Azure e um servidor local. Qual ferramenta atende a isso?",
        explanation:
            "O Connection Monitor do Network Watcher acompanha conectividade, latência e perda de pacotes ao longo do tempo entre origens e destinos, incluindo recursos locais e do Azure, com alertas e histórico. A verificação de fluxo de IP e o próximo salto são diagnósticos pontuais, não contínuos.",
        options: [
            ["Connection Monitor do Network Watcher.", true],
            [
                "Verificação de fluxo de IP, que avalia se o tráfego é permitido pelas regras de segurança.",
                false,
            ],
            [
                "Diagnóstico de próximo salto, que informa o caminho escolhido para um destino específico.",
                false,
            ],
            [
                "Captura de pacotes, que grava o tráfego da interface de rede durante um intervalo definido.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Qual é a diferença entre um Recovery Services vault e um Azure Backup vault?",
        explanation:
            "O Recovery Services vault atende cargas como VMs do Azure, SQL em VM, Azure Files e agentes locais, e também o Site Recovery. O Backup vault atende cargas mais novas, como blobs, discos gerenciados, PostgreSQL e Kubernetes. A escolha depende do que será protegido.",
        options: [
            ["Cada um suporta um conjunto diferente de cargas de trabalho protegidas.", true],
            [
                "O Recovery Services vault é regional e o Backup vault é global, atendendo qualquer região.",
                false,
            ],
            [
                "O Recovery Services vault guarda os dados e o Backup vault guarda apenas as políticas.",
                false,
            ],
            [
                "O Backup vault substitui o Recovery Services vault, que está sendo aposentado pela Microsoft.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "O que uma política de backup define no Azure Backup?",
        explanation:
            "A política de backup define a frequência dos pontos de recuperação e por quanto tempo eles são retidos, incluindo retenção diária, semanal, mensal e anual. Ela é aplicada aos itens protegidos e pode ser compartilhada por vários deles, o que padroniza a proteção.",
        options: [
            ["A frequência dos backups e o período de retenção dos pontos de recuperação.", true],
            [
                "A região em que os dados protegidos serão armazenados e replicados pelo serviço de backup.",
                false,
            ],
            [
                "As permissões de quem pode executar a restauração dos itens protegidos pelo cofre.",
                false,
            ],
            [
                "O tipo de criptografia aplicada aos dados de backup armazenados dentro do cofre criado.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Uma máquina virtual protegida por Azure Backup precisa ser restaurada, mas sem sobrescrever a original. Quais opções existem?",
        explanation:
            "As opções de restauração incluem criar uma nova máquina virtual a partir do ponto de recuperação, restaurar os discos para depois anexá-los a uma VM, ou restaurar arquivos individuais montando o ponto de recuperação. Substituir a máquina existente também é possível, mas não é o pedido aqui.",
        options: [
            ["Criar uma VM nova, restaurar os discos ou restaurar arquivos individuais.", true],
            [
                "Apenas substituir a máquina original, que é a única forma suportada pelo Azure Backup.",
                false,
            ],
            [
                "Apenas restaurar arquivos individuais, porque a restauração completa exige o Site Recovery.",
                false,
            ],
            [
                "Apenas criar uma VM nova em outra região, sem possibilidade de restaurar na mesma região.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Qual é a diferença de propósito entre Azure Backup e Azure Site Recovery?",
        explanation:
            "O Azure Backup protege dados contra perda e corrupção, com pontos de recuperação retidos por longos períodos e objetivo de restaurar informação. O Site Recovery é continuidade de negócio: replica cargas para outra região e permite failover para manter o serviço disponível durante uma interrupção.",
        options: [
            [
                "Backup protege dados para restauração; Site Recovery mantém o serviço disponível.",
                true,
            ],
            [
                "Backup replica para outra região e o Site Recovery guarda pontos de recuperação históricos.",
                false,
            ],
            [
                "Os dois têm o mesmo propósito, mudando apenas o tipo de cofre usado em cada caso.",
                false,
            ],
            [
                "Backup atende apenas cargas locais e o Site Recovery apenas cargas nativas do Azure.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Ao configurar o Azure Site Recovery para VMs do Azure, o que a replicação exige na região de destino?",
        explanation:
            "A replicação exige recursos na região de destino, como rede virtual, contas de cache na origem e configuração de mapeamento de rede e de recursos. O Site Recovery cria os recursos de destino no momento do failover, mas a rede e os mapeamentos precisam existir para a replicação ser configurada.",
        options: [
            ["Rede virtual de destino e mapeamentos de rede e de recursos configurados.", true],
            [
                "As máquinas virtuais de destino já criadas e desalocadas, prontas para o failover ocorrer.",
                false,
            ],
            [
                "Um Backup vault na região de destino, além do Recovery Services vault na origem.",
                false,
            ],
            [
                "Uma conta de armazenamento premium na região de destino para receber os discos replicados.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Qual é a diferença entre um failover de teste e um failover no Site Recovery?",
        explanation:
            "O failover de teste valida o plano de recuperação criando as máquinas em uma rede isolada, sem afetar a produção nem interromper a replicação. O failover real direciona a carga para a região secundária e interrompe a replicação a partir da origem, exigindo commit e depois reproteção para voltar.",
        options: [
            ["O de teste usa uma rede isolada e não interrompe a replicação em andamento.", true],
            [
                "O de teste interrompe a replicação e o failover real mantém a origem sincronizada.",
                false,
            ],
            [
                "O de teste só pode ser executado uma vez por plano de recuperação criado no cofre.",
                false,
            ],
            [
                "O de teste exige que as máquinas de origem estejam desligadas durante a execução dele.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Depois de um failover para a região secundária, qual operação torna a mudança definitiva e descarta os demais pontos de recuperação?",
        explanation:
            "O commit finaliza o failover, descartando os outros pontos de recuperação disponíveis e consolidando o estado na região secundária. Depois dele é preciso executar a reproteção para replicar de volta e, mais tarde, o failback para retornar à região original.",
        options: [
            ["O commit do failover.", true],
            [
                "A reproteção, que passa a replicar da região secundária de volta para a região original.",
                false,
            ],
            [
                "O failback, que devolve a carga de trabalho para a região primária depois da interrupção.",
                false,
            ],
            [
                "A exclusão do item protegido do cofre, o que consolida o estado atual da carga replicada.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Uma equipe precisa receber relatório periódico sobre o status dos backups de várias assinaturas, incluindo jobs com falha. Qual recurso atende a isso?",
        explanation:
            "Os relatórios de backup usam um workspace do Log Analytics como destino dos dados de diagnóstico dos cofres e apresentam painéis com histórico de jobs, uso de armazenamento e conformidade das políticas, com suporte a várias assinaturas e cofres. Alertas de backup notificam eventos pontuais, sem consolidar histórico.",
        options: [
            ["Relatórios de backup, com os dados enviados a um workspace do Log Analytics.", true],
            [
                "Alertas de backup configurados no cofre, que notificam por email a cada job com falha.",
                false,
            ],
            [
                "O painel de visão geral do cofre, que consolida o status de todas as assinaturas da conta.",
                false,
            ],
            [
                "O Azure Advisor, que apresenta recomendações de confiabilidade sobre as cargas protegidas.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement: "Qual é o propósito da exclusão reversível (soft delete) no Azure Backup?",
        explanation:
            "A exclusão reversível retém os dados de backup por um período depois de o item protegido ser excluído, permitindo desfazer a operação. Ela protege contra exclusão acidental e maliciosa, e durante o período de retenção os dados não podem ser removidos em definitivo sem passar pela recuperação.",
        options: [
            [
                "Reter os dados por um período após a exclusão, permitindo desfazer a operação.",
                true,
            ],
            [
                "Reduzir o custo de armazenamento movendo os pontos antigos para uma camada mais barata.",
                false,
            ],
            [
                "Replicar os dados de backup para a região secundária emparelhada do cofre criado.",
                false,
            ],
            [
                "Impedir que a política de backup seja alterada por quem não tem permissão adequada.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
    {
        statement:
            "Um alerta precisa ser disparado quando uma consulta de log retornar mais de dez resultados em quinze minutos. Que tipo de regra de alerta usar?",
        explanation:
            "Uma regra de alerta de log, também chamada de alerta de pesquisa de log, executa uma consulta KQL em intervalos definidos e dispara conforme o número de resultados ou o valor de uma medida. Alertas de métrica avaliam séries numéricas coletadas pela plataforma, e alertas de log de atividade tratam de eventos de gerenciamento.",
        options: [
            ["Alerta de log, com consulta KQL avaliada periodicamente.", true],
            [
                "Alerta de métrica, comparando o valor coletado com o limite definido na configuração.",
                false,
            ],
            [
                "Alerta de log de atividade, que observa as operações de gerenciamento na assinatura.",
                false,
            ],
            [
                "Alerta de integridade do serviço, que informa incidentes e manutenções da plataforma.",
                false,
            ],
        ],
        topic: "Monitoramento e manutenção",
    },
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Azure Administrator (AZ-104)",
                provider: "azure",
                code: "AZ-104",
                level: "Associate",
                description:
                    "Simulado no formato da prova AZ-104: 50 questoes, 100 minutos, corte de 65%.",
                durationMinutes: 100,
                questionCount: 50,
                passPercent: 65,
                published: true,
            })
            .returning();
        console.log("Simulado criado: " + simulado.slug);
    }
    await db
        .update(simulados)
        .set({ provider: "azure", code: "AZ-104", level: "Associate" })
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
        console.log("Simulado ja tem " + n + " questoes, nada a fazer.");
        return;
    }

    for (const q of QUESTOES) {
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
    console.log(
        "Seed: " + inseridas + " questoes novas inseridas (" + QUESTOES.length + " no banco).",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
