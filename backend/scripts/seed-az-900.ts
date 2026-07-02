// Seed do simulado Microsoft Azure Fundamentals (AZ-900). Idempotente: se o
// simulado já tiver questões, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-az-900.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-az-900.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "az-900";

type Questao = { statement: string; explanation: string; options: [string, boolean][] };

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma empresa precisa migrar servidores legados para a nuvem, mas exige controle total sobre o sistema operacional, os pacotes instalados e as configurações de rede das máquinas. Qual modelo de serviço de nuvem atende diretamente a esse requisito?",
        explanation:
            "No IaaS o provedor gerencia o hardware físico e a virtualização, enquanto o cliente mantém controle sobre o sistema operacional e o software. No PaaS e no SaaS o sistema operacional é abstraído pelo provedor, removendo esse controle.",
        options: [
            ["IaaS (Infraestrutura como Serviço)", true],
            ["PaaS (Plataforma como Serviço)", false],
            ["SaaS (Software como Serviço)", false],
            ["Serverless (sem servidor)", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento quer publicar uma aplicação web e uma API sem provisionar máquinas virtuais, aplicar patches no sistema operacional ou instalar o runtime, focando apenas no código. O Azure App Service é um exemplo de qual modelo de serviço?",
        explanation:
            "O PaaS entrega uma plataforma gerenciada para desenvolver e hospedar aplicações, cuidando de sistema operacional, patches e runtime. O IaaS exigiria gerenciar a VM, e o SaaS entregaria um software pronto, não uma plataforma de desenvolvimento.",
        options: [
            ["PaaS (Plataforma como Serviço)", true],
            ["IaaS (Infraestrutura como Serviço)", false],
            ["SaaS (Software como Serviço)", false],
            ["Colocation (colocação)", false],
        ],
    },
    {
        statement:
            "O Microsoft 365, com serviços como Exchange Online e Microsoft Teams acessados pelo navegador, é um exemplo clássico de qual modelo de serviço de nuvem?",
        explanation:
            "No SaaS o provedor entrega um software completo e pronto para uso, gerenciando toda a pilha subjacente. PaaS e IaaS exigiriam que o cliente desenvolvesse ou gerenciasse parte da solução.",
        options: [
            ["SaaS (Software como Serviço)", true],
            ["PaaS (Plataforma como Serviço)", false],
            ["IaaS (Infraestrutura como Serviço)", false],
            ["FaaS (Função como Serviço)", false],
        ],
    },
    {
        statement:
            "Ao implantar máquinas virtuais em um modelo de Infraestrutura como Serviço (IaaS) no Azure, quais responsabilidades permanecem com o cliente? (Selecione DUAS opções.)",
        explanation:
            "No IaaS o cliente é responsável pelo sistema operacional convidado e pelos aplicativos que executa. A segurança física, o hardware dos servidores e a camada de virtualização são sempre responsabilidade da Microsoft.",
        options: [
            ["Aplicar patches e atualizações no sistema operacional convidado", true],
            ["Instalar e configurar os aplicativos executados na VM", true],
            ["Manter a segurança física dos data centers", false],
            ["Substituir o hardware de servidores com falha", false],
            ["Gerenciar o hipervisor e a camada de virtualização", false],
        ],
    },
    {
        statement: "Qual afirmação descreve corretamente o modelo de implantação de nuvem pública?",
        explanation:
            "A nuvem pública usa infraestrutura de um provedor terceirizado, compartilhada de forma segura entre vários clientes (multilocação). As demais opções descrevem nuvem privada (dedicada/local) e nuvem híbrida.",
        options: [
            [
                "Os recursos de computação são de propriedade e operados por um provedor terceirizado e compartilhados entre múltiplos clientes",
                true,
            ],
            ["Todo o hardware fica no data center local da própria organização", false],
            [
                "Os recursos são dedicados fisicamente a uma única organização e ficam sob sua gestão exclusiva",
                false,
            ],
            [
                "Combina recursos locais com recursos de um provedor de nuvem conectados entre si",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma instituição financeira precisa manter certos sistemas em uma infraestrutura de nuvem de uso exclusivo, sob seu próprio controle, para atender a exigências regulatórias. Qual modelo de implantação isso descreve?",
        explanation:
            "A nuvem privada oferece recursos dedicados a uma única organização, com maior controle e isolamento. A nuvem pública é compartilhada e a híbrida combina os dois modelos.",
        options: [
            ["Nuvem privada", true],
            ["Nuvem pública", false],
            ["Nuvem híbrida", false],
            ["Nuvem comunitária multilocatária", false],
        ],
    },
    {
        statement:
            "Uma empresa mantém um aplicativo em seu data center local, mas usa o Azure para absorver picos sazonais de demanda, mantendo os dois ambientes conectados. Que modelo de implantação de nuvem essa arquitetura representa?",
        explanation:
            "A nuvem híbrida combina infraestrutura local (privada) com nuvem pública, conectadas para trabalhar em conjunto, como no cloud bursting. Multinuvem seria o uso de dois provedores públicos diferentes, o que não é o caso.",
        options: [
            ["Nuvem híbrida", true],
            ["Nuvem pública", false],
            ["Nuvem privada", false],
            ["Multinuvem (multicloud)", false],
        ],
    },
    {
        statement:
            "Quais DOIS cenários são motivos típicos para adotar um modelo de nuvem híbrida? (Selecione DUAS opções.)",
        explanation:
            "A nuvem híbrida combina ambientes local e público, útil para manter dados sob conformidade no local e para absorver picos de demanda. Eliminar todo o local descreve nuvem pública pura, e usar dois provedores públicos é multinuvem.",
        options: [
            [
                "Manter dados sensíveis em um data center local por conformidade, usando a nuvem pública para o restante da carga",
                true,
            ],
            [
                "Estender a capacidade local para a nuvem pública durante picos de demanda (cloud bursting)",
                true,
            ],
            ["Eliminar completamente qualquer infraestrutura local da organização", false],
            ["Distribuir cargas entre dois provedores de nuvem pública concorrentes", false],
            ["Usar exclusivamente recursos compartilhados de um único provedor público", false],
        ],
    },
    {
        statement:
            "No modelo de nuvem baseado em consumo (pay-as-you-go), como o cliente normalmente paga pelos recursos?",
        explanation:
            "O modelo baseado em consumo cobra conforme o uso real, sem desembolso inicial de capital. As outras opções descrevem licenças perpétuas, contratos fixos ou compra de hardware (CapEx).",
        options: [
            [
                "Paga apenas pelos recursos que efetivamente utiliza, sem grande investimento inicial",
                true,
            ],
            ["Paga uma licença perpétua única que cobre uso ilimitado", false],
            ["Paga um valor fixo anual, independentemente do consumo", false],
            ["Compra antecipadamente o hardware e o amortiza ao longo dos anos", false],
        ],
    },
    {
        statement:
            "Quais DOIS benefícios estão diretamente associados ao modelo de nuvem baseado em consumo? (Selecione DUAS opções.)",
        explanation:
            "O modelo baseado em consumo evita grandes gastos iniciais (CapEx) e cobra conforme o uso, permitindo escalar sob demanda. Ele não torna o serviço gratuito nem exige a compra antecipada de toda a capacidade.",
        options: [
            ["Eliminar ou reduzir o investimento inicial (CapEx) em hardware", true],
            ["Pagar apenas pelos recursos consumidos, escalando conforme a necessidade", true],
            ["Garantir que nenhum custo será cobrado, independentemente do uso", false],
            ["Comprar antecipadamente toda a capacidade máxima esperada", false],
            ["Fixar o custo mensal mesmo quando o uso varia bastante", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é um exemplo de despesa de capital (CapEx)?",
        explanation:
            "CapEx é o investimento inicial em ativos físicos, como servidores e infraestrutura de data center. As demais são despesas operacionais recorrentes (OpEx), típicas da nuvem.",
        options: [
            ["A compra antecipada de servidores físicos e equipamentos de data center", true],
            ["A assinatura mensal de máquinas virtuais no Azure", false],
            ["O pagamento por GB de dados armazenados a cada mês", false],
            ["A cobrança por segundo de execução de uma função sem servidor", false],
        ],
    },
    {
        statement:
            "A migração para a nuvem costuma transformar os gastos de TI de despesas de capital (CapEx) em despesas operacionais (OpEx). Qual é a principal característica do modelo OpEx?",
        explanation:
            "OpEx é o gasto recorrente com serviços consumidos ao longo do tempo, sem a compra de ativos. As demais opções descrevem características de CapEx, como o investimento inicial e a depreciação de hardware.",
        options: [
            [
                "Gastar com serviços de forma contínua, pagando conforme o uso, sem adquirir ativos físicos",
                true,
            ],
            ["Realizar um único grande investimento inicial em infraestrutura própria", false],
            ["Depreciar equipamentos de hardware ao longo de vários anos", false],
            ["Construir e manter um data center físico próprio", false],
        ],
    },
    {
        statement:
            "Uma startup com pouco caixa inicial avalia usar a nuvem. Qual vantagem financeira da computação em nuvem é mais relevante para esse cenário?",
        explanation:
            "A nuvem converte CapEx em OpEx, permitindo começar pequeno e pagar os recursos conforme o crescimento. Ela não transfere a propriedade do hardware, não garante por si só o menor custo absoluto e não elimina a necessidade de monitorar gastos.",
        options: [
            [
                "Evitar grandes desembolsos iniciais em hardware, pagando os recursos como despesa operacional conforme cresce",
                true,
            ],
            ["Obter a propriedade perpétua de todo o hardware utilizado", false],
            ["Garantir que o custo total será sempre menor que o de qualquer solução local", false],
            ["Eliminar totalmente a necessidade de monitorar gastos", false],
        ],
    },
    {
        statement:
            "Qual benefício da nuvem está mais diretamente relacionado a manter os aplicativos e serviços em funcionamento pelo maior tempo possível, minimizando o tempo de inatividade?",
        explanation:
            "Alta disponibilidade trata de manter os serviços acessíveis o máximo de tempo possível, com redundância e SLAs. Elasticidade e escalabilidade tratam de ajuste de capacidade, e governança trata de controle e conformidade.",
        options: [
            ["Alta disponibilidade", true],
            ["Elasticidade", false],
            ["Escalabilidade horizontal", false],
            ["Governança", false],
        ],
    },
    {
        statement:
            "Uma máquina virtual está com desempenho insuficiente e a equipe decide aumentar a quantidade de vCPUs e a memória RAM da própria VM, alterando seu tamanho. Que tipo de dimensionamento foi aplicado?",
        explanation:
            "A escalabilidade vertical (scale up) significa adicionar mais recursos, como CPU e RAM, a uma instância existente. A escalabilidade horizontal seria adicionar mais instâncias, e o balanceamento de carga apenas distribui o tráfego.",
        options: [
            ["Escalabilidade vertical (scale up)", true],
            ["Escalabilidade horizontal (scale out)", false],
            ["Elasticidade automática", false],
            ["Balanceamento de carga", false],
        ],
    },
    {
        statement:
            "Para lidar com o aumento de acessos, uma aplicação passa a rodar em mais instâncias de máquinas virtuais idênticas atrás de um balanceador de carga, em vez de tornar uma única VM maior. Esse tipo de dimensionamento é chamado de:",
        explanation:
            "A escalabilidade horizontal (scale out) consiste em adicionar mais instâncias para distribuir a carga. A escalabilidade vertical aumentaria os recursos de uma única instância, e as demais opções tratam de resiliência, não de dimensionamento de capacidade.",
        options: [
            ["Escalabilidade horizontal (scale out)", true],
            ["Escalabilidade vertical (scale up)", false],
            ["Redundância geográfica", false],
            ["Tolerância a falhas", false],
        ],
    },
    {
        statement:
            "Qual conceito descreve a capacidade de adicionar e remover recursos automaticamente para acompanhar as variações de demanda em tempo real, evitando pagar por capacidade ociosa?",
        explanation:
            "Elasticidade é o ajuste automático da capacidade (para cima e para baixo) conforme a demanda muda. A escalabilidade vertical é aplicada por instância e costuma ser manual, e as outras opções tratam de disponibilidade e recuperação.",
        options: [
            ["Elasticidade", true],
            ["Escalabilidade vertical", false],
            ["Alta disponibilidade", false],
            ["Recuperação de desastres", false],
        ],
    },
    {
        statement:
            "No Microsoft Azure Well-Architected Framework, qual benefício se refere à capacidade de um sistema resistir a falhas e se recuperar delas, continuando a funcionar?",
        explanation:
            "Confiabilidade (reliability) é a capacidade de resistir e se recuperar de falhas, mantendo o funcionamento. As demais opções tratam de previsão de gastos, ajuste de capacidade e facilidade de administração.",
        options: [
            ["Confiabilidade", true],
            ["Previsibilidade de custo", false],
            ["Escalabilidade", false],
            ["Gerenciabilidade", false],
        ],
    },
    {
        statement:
            "Qual ferramenta do Azure ajuda a estimar antecipadamente o custo mensal de uma solução antes de implantá-la, favorecendo a previsibilidade de custos?",
        explanation:
            "A Calculadora de Preços permite estimar o custo dos serviços antes da implantação, apoiando a previsibilidade financeira. O Azure Monitor observa desempenho, o Microsoft Entra ID trata de identidade e o Azure Policy trata de governança.",
        options: [
            ["Calculadora de Preços do Azure (Azure Pricing Calculator)", true],
            ["Azure Monitor", false],
            ["Microsoft Entra ID", false],
            ["Azure Policy", false],
        ],
    },
    {
        statement:
            "O benefício de previsibilidade de desempenho na nuvem está relacionado principalmente a qual capacidade?",
        explanation:
            "A previsibilidade de desempenho trata de antecipar e sustentar o desempenho esperado, apoiada por autoescala, balanceamento de carga e monitoramento. Prever faturas é previsibilidade de custos, e as outras opções tratam de recuperação e segurança.",
        options: [
            [
                "Prever e manter o desempenho necessário aos usuários, usando recursos como dimensionamento automático e balanceamento de carga",
                true,
            ],
            ["Prever exatamente a fatura de cada serviço no fim do mês", false],
            ["Garantir a recuperação dos dados após um desastre", false],
            ["Impedir acessos não autorizados aos recursos", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure oferece uma visão unificada da postura de segurança dos recursos e recomendações para fortalecê-la, reforçando o benefício de segurança da nuvem?",
        explanation:
            "O Microsoft Defender for Cloud avalia a postura de segurança e recomenda melhorias por meio da pontuação de segurança (secure score). Os demais serviços tratam de hospedagem de aplicativos, armazenamento e distribuição de tráfego.",
        options: [
            ["Microsoft Defender for Cloud", true],
            ["Azure App Service", false],
            ["Azure Blob Storage", false],
            ["Azure Load Balancer", false],
        ],
    },
    {
        statement:
            "Uma organização quer impor que todos os recursos criados no Azure recebam determinadas etiquetas (tags) e sejam implantados apenas em regiões permitidas. Qual serviço apoia esse objetivo de governança?",
        explanation:
            "O Azure Policy aplica e audita regras de conformidade sobre os recursos, como regiões permitidas e etiquetas obrigatórias, apoiando a governança. Os demais serviços tratam de backup, resolução de nomes e cache.",
        options: [
            ["Azure Policy", true],
            ["Azure Backup", false],
            ["Azure DNS", false],
            ["Azure Cache for Redis", false],
        ],
    },
    {
        statement:
            "O benefício de gerenciabilidade na nuvem inclui provisionar e administrar recursos de forma automatizada e consistente. Qual recurso do Azure é um exemplo de gerenciamento por meio de modelos declarativos (infraestrutura como código)?",
        explanation:
            "Os modelos do Azure Resource Manager (ARM) e o Bicep descrevem a infraestrutura como código, permitindo implantações repetíveis e gerenciáveis. As demais opções são recursos de rede, armazenamento e resiliência, não ferramentas de gerenciamento declarativo.",
        options: [
            ["Modelos do Azure Resource Manager (ARM) / Bicep", true],
            ["Azure Virtual Network", false],
            ["Azure Files", false],
            ["Zona de disponibilidade", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada do Azure, o que determina a divisão de responsabilidades de segurança entre o cliente e a Microsoft?",
        explanation:
            "A divisão depende do modelo de serviço: quanto mais gerenciado (SaaS), mais responsabilidades ficam com a Microsoft; no IaaS, mais responsabilidades ficam com o cliente. Número de usuários, região e idioma não alteram essa divisão.",
        options: [
            [
                "O tipo de serviço adotado (IaaS, PaaS ou SaaS), que desloca mais responsabilidades ao provedor conforme se vai de IaaS para SaaS",
                true,
            ],
            ["O número de usuários da assinatura, independentemente do serviço", false],
            ["A região do Azure escolhida para a implantação", false],
            ["O idioma configurado no portal do Azure", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada, quais responsabilidades permanecem SEMPRE com o cliente, independentemente de o serviço ser IaaS, PaaS ou SaaS? (Selecione DUAS opções.)",
        explanation:
            "As informações e os dados, os dispositivos e as contas e identidades são sempre responsabilidade do cliente em qualquer modelo. Segurança física, rede física e hardware são sempre responsabilidade da Microsoft.",
        options: [
            ["As informações e os dados armazenados no serviço", true],
            ["As contas e as identidades dos usuários", true],
            ["A segurança física dos data centers", false],
            ["A manutenção da rede física do provedor", false],
            ["O funcionamento do hardware dos hosts físicos", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada do Azure, qual responsabilidade é SEMPRE da Microsoft, em qualquer modelo de serviço?",
        explanation:
            "A camada física (data centers, hosts e rede física) é sempre responsabilidade da Microsoft. A classificação dos dados, as contas de usuário e as permissões de acesso permanecem sempre com o cliente.",
        options: [
            ["A segurança física dos data centers e dos hosts físicos", true],
            ["A classificação e a proteção dos dados do cliente", false],
            ["O gerenciamento das contas de usuário do cliente", false],
            ["A configuração de permissões de acesso aos recursos", false],
        ],
    },
    {
        statement:
            "Quais DOIS dos serviços a seguir são exemplos de ofertas de Software como Serviço (SaaS)? (Selecione DUAS opções.)",
        explanation:
            "Microsoft 365 e Dynamics 365 são softwares completos entregues como serviço (SaaS). As Máquinas Virtuais do Azure são IaaS, enquanto o AKS e a Virtual Network são serviços de plataforma e infraestrutura, não aplicativos prontos para o usuário final.",
        options: [
            ["Microsoft 365 (Office na Web)", true],
            ["Dynamics 365", true],
            ["Máquinas Virtuais do Azure (Azure Virtual Machines)", false],
            ["Azure Kubernetes Service (AKS)", false],
            ["Azure Virtual Network", false],
        ],
    },
    {
        statement:
            "Uma empresa adota o Microsoft 365 (SaaS) para e-mail e colaboração. Nesse cenário, qual responsabilidade continua sendo do cliente?",
        explanation:
            "Mesmo em SaaS, o cliente permanece responsável por seus dados, contas e identidades e por controlar quem tem acesso. Sistema operacional, hardware e virtualização do serviço são responsabilidade da Microsoft.",
        options: [
            ["Gerenciar as identidades dos usuários e definir quem tem acesso aos dados", true],
            ["Aplicar patches no sistema operacional dos servidores do serviço", false],
            ["Manter e substituir o hardware do data center", false],
            ["Gerenciar a camada de virtualização e o hipervisor", false],
        ],
    },
    {
        statement: "O que melhor descreve uma região do Azure?",
        explanation:
            "Uma região é um conjunto de datacenters próximos conectados por uma rede regional dedicada de baixa latência. Um único datacenter descreve apenas parte de uma região; limite de cobrança é assinatura; e container lógico é grupo de recursos.",
        options: [
            [
                "Um conjunto de datacenters implantados dentro de um perímetro definido por latência e conectados por uma rede regional dedicada de baixa latência.",
                true,
            ],
            [
                "Um único datacenter físico que hospeda todos os serviços de uma área geográfica.",
                false,
            ],
            [
                "Um limite de cobrança que agrupa várias assinaturas para faturamento consolidado.",
                false,
            ],
            [
                "Um container lógico usado para organizar recursos relacionados de uma solução.",
                false,
            ],
        ],
    },
    {
        statement: "Qual afirmação sobre pares de região (region pairs) do Azure está correta?",
        explanation:
            "Regiões emparelhadas ficam a pelo menos ~300 milhas quando possível e, na maioria dos casos, dentro da mesma geografia, o que ajuda em residência de dados e recuperação. Zonas de disponibilidade ficam dentro de uma região, não formam um par; e energia/resfriamento compartilhados descrevem risco, não pares.",
        options: [
            [
                "As duas regiões de um par ficam, sempre que possível, a pelo menos 300 milhas de distância e, na maioria dos casos, dentro da mesma geografia.",
                true,
            ],
            [
                "As duas regiões de um par estão sempre no mesmo datacenter para reduzir a latência.",
                false,
            ],
            [
                "Um par de região é formado por duas zonas de disponibilidade da mesma região.",
                false,
            ],
            [
                "Regiões emparelhadas compartilham a mesma fonte de energia e o mesmo resfriamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais são benefícios de usar pares de região (paired regions) do Azure? (Selecione DUAS opções.)",
        explanation:
            "Em pares de região as atualizações planejadas da plataforma são sequenciais (uma região por vez) e a recuperação é priorizada em uma das regiões durante grandes interrupções. A replicação não é automática para todos os recursos, não há IP público compartilhado e o tráfego entre regiões não é sempre gratuito.",
        options: [
            [
                "Atualizações planejadas da plataforma Azure são aplicadas a apenas uma região do par por vez.",
                true,
            ],
            [
                "Em uma interrupção ampla, a recuperação de uma das regiões do par é priorizada pela Microsoft.",
                true,
            ],
            [
                "Todos os recursos são replicados automaticamente entre as duas regiões, sem custo.",
                false,
            ],
            [
                "As duas regiões compartilham o mesmo endereço IP público para failover instantâneo.",
                false,
            ],
            [
                "O tráfego de rede entre as regiões emparelhadas é sempre gratuito e ilimitado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma agência do governo dos EUA precisa de uma instância do Azure fisicamente isolada da nuvem pública global para atender a requisitos de conformidade. Qual opção atende a essa necessidade?",
        explanation:
            "Nuvens soberanas como o Azure Government são instâncias fisicamente isoladas do Azure global, voltadas a requisitos governamentais e de conformidade. Zonas, grupos de recursos e pares de região ficam dentro do Azure público global, sem esse isolamento.",
        options: [
            ["Azure Government (uma nuvem soberana / sovereign).", true],
            ["Uma zona de disponibilidade dedicada em uma região pública.", false],
            ["Um grupo de recursos separado dentro da assinatura.", false],
            ["Um par de região dentro da geografia dos EUA.", false],
        ],
    },
    {
        statement:
            "Qual das opções é um exemplo de região soberana (sovereign) do Azure, operada de forma independente da nuvem global e por um parceiro local?",
        explanation:
            "O Azure na China é uma instância soberana operada pela 21Vianet, separada do Azure global. West Europe, Brazil South e East US 2 são regiões do Azure público global.",
        options: [
            ["Azure operado pela 21Vianet (Azure na China).", true],
            ["Azure West Europe.", false],
            ["Azure Brazil South.", false],
            ["Azure East US 2.", false],
        ],
    },
    {
        statement: "O que são zonas de disponibilidade (availability zones) no Azure?",
        explanation:
            "Zonas de disponibilidade são locais fisicamente separados dentro de uma mesma região, com energia, resfriamento e rede independentes, para proteger contra falhas de datacenter. Elas ficam dentro de uma região (não entre geografias ou regiões) e não são construções lógicas de backup.",
        options: [
            [
                "Locais fisicamente separados dentro de uma região, cada um com energia, resfriamento e rede independentes.",
                true,
            ],
            ["Regiões diferentes localizadas em geografias distintas.", false],
            ["Cópias lógicas de um grupo de recursos usadas para backup.", false],
            ["Datacenters compartilhados entre duas regiões emparelhadas.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre zonas de disponibilidade do Azure estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Em regiões habilitadas há no mínimo três zonas separadas, e cada zona é formada por um ou mais datacenters. Nem toda região oferece zonas, as zonas têm energia independente e uma zona não abrange várias regiões.",
        options: [
            [
                "Uma região habilitada para zonas tem no mínimo três zonas de disponibilidade separadas.",
                true,
            ],
            ["Cada zona de disponibilidade é composta por um ou mais datacenters.", true],
            ["Todas as regiões do Azure oferecem zonas de disponibilidade.", false],
            ["As zonas de uma região compartilham a mesma infraestrutura de energia.", false],
            ["Uma zona de disponibilidade abrange várias regiões para tolerância a falhas.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que um serviço continue disponível mesmo se uma zona de disponibilidade inteira falhar, replicando automaticamente entre zonas. Que abordagem descreve isso?",
        explanation:
            "Serviços com redundância de zona (zone-redundant) replicam automaticamente entre várias zonas, sobrevivendo à falha de uma zona. Um serviço zonal fica preso a uma única zona, e a implantação em um único datacenter não tolera falha de zona.",
        options: [
            ["Serviço com redundância de zona (zone-redundant).", true],
            ["Serviço zonal fixado (pinned) a uma única zona.", false],
            ["Serviço não regional implantado fora de qualquer região.", false],
            ["Serviço implantado em um único datacenter.", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente a relação entre datacenters, zonas de disponibilidade e regiões no Azure?",
        explanation:
            "A hierarquia física vai da região para as zonas de disponibilidade e destas para os datacenters. As demais opções invertem a hierarquia ou tratam os termos como sinônimos.",
        options: [
            [
                "Uma região contém uma ou mais zonas de disponibilidade, e cada zona é formada por um ou mais datacenters físicos.",
                true,
            ],
            ["Um datacenter contém várias regiões, e cada região contém várias zonas.", false],
            [
                "Uma zona de disponibilidade contém várias regiões, cada uma com um datacenter.",
                false,
            ],
            ["Datacenter, zona e região são termos equivalentes para o mesmo conceito.", false],
        ],
    },
    {
        statement: "No Azure, o que é um 'recurso' (resource)?",
        explanation:
            "Um recurso é uma instância gerenciável de um serviço do Azure (máquina virtual, conta de armazenamento, banco de dados, etc.). As outras opções descrevem assinatura, grupo de gerenciamento e conceitos físicos, não um recurso.",
        options: [
            [
                "Uma instância gerenciável de um serviço, como uma máquina virtual, uma conta de armazenamento ou um banco de dados.",
                true,
            ],
            ["Um limite de cobrança que agrupa várias assinaturas.", false],
            ["Um container lógico que organiza várias assinaturas.", false],
            ["Uma cópia física de uma região do Azure.", false],
        ],
    },
    {
        statement: "Qual afirmação sobre grupos de recursos (resource groups) está correta?",
        explanation:
            "Cada recurso vive em exatamente um grupo de recursos, e recursos do mesmo grupo podem estar em regiões diferentes. Recursos não pertencem a vários grupos, não precisam ficar na região do grupo e grupos de recursos não podem ser aninhados.",
        options: [
            [
                "Um recurso pertence a exatamente um grupo de recursos, mas os recursos de um mesmo grupo podem estar em regiões diferentes.",
                true,
            ],
            ["Um recurso pode pertencer a vários grupos de recursos ao mesmo tempo.", false],
            [
                "Todos os recursos de um grupo de recursos precisam estar na mesma região do grupo.",
                false,
            ],
            ["Grupos de recursos podem ser aninhados uns dentro dos outros.", false],
        ],
    },
    {
        statement:
            "O que acontece com os recursos contidos em um grupo de recursos quando esse grupo de recursos é excluído?",
        explanation:
            "Excluir um grupo de recursos exclui todos os recursos contidos nele. Eles não são movidos para outro grupo, não continuam ativos sem cobrança e não permanecem existindo após a exclusão do grupo.",
        options: [
            ["Todos os recursos dentro do grupo de recursos são excluídos.", true],
            [
                "Os recursos são movidos automaticamente para o grupo de recursos padrão da assinatura.",
                false,
            ],
            ["Os recursos permanecem ativos, mas ficam sem cobrança.", false],
            ["Apenas os metadados do grupo são removidos; os recursos continuam existindo.", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre grupos de recursos são verdadeiras? (Selecione DUAS opções.)",
        explanation:
            "É possível atribuir RBAC no nível do grupo de recursos (com herança para os recursos) e recursos podem ser movidos entre grupos. Um grupo pode conter tipos de serviço e regiões variados, e excluí-lo remove os recursos dentro dele.",
        options: [
            [
                "É possível aplicar controle de acesso baseado em função (RBAC) no nível do grupo de recursos, e os recursos herdam essas atribuições.",
                true,
            ],
            ["Recursos podem ser movidos de um grupo de recursos para outro.", true],
            ["Um grupo de recursos só pode conter recursos de um único tipo de serviço.", false],
            ["Um grupo de recursos só pode conter recursos de uma única região.", false],
            [
                "Excluir um grupo de recursos preserva automaticamente os recursos dentro dele.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma organização quer separar as faturas de dois projetos para receber relatórios de custo independentes, mantendo-os no mesmo locatário (tenant) do Microsoft Entra ID. Qual limite do Azure atende melhor a isso?",
        explanation:
            "A assinatura é um limite de cobrança: assinaturas separadas geram faturas e relatórios de custo independentes dentro do mesmo locatário. Zonas, pares de região e regiões soberanas não são limites de faturamento.",
        options: [
            ["Criar uma assinatura (subscription) separada para cada projeto.", true],
            ["Criar uma zona de disponibilidade separada para cada projeto.", false],
            ["Criar um par de região separado para cada projeto.", false],
            ["Criar uma região soberana separada para cada projeto.", false],
        ],
    },
    {
        statement:
            "Qual afirmação sobre assinaturas do Azure e locatários (tenants) do Microsoft Entra ID está correta?",
        explanation:
            "Um locatário pode conter várias assinaturas, e cada assinatura confia em um único locatário para autenticação. Assinatura e locatário não são a mesma coisa, e uma assinatura não confia em vários locatários simultaneamente.",
        options: [
            [
                "Um locatário do Microsoft Entra ID pode conter várias assinaturas, mas cada assinatura confia em um único locatário.",
                true,
            ],
            [
                "Cada assinatura pode estar associada a vários locatários do Microsoft Entra ID ao mesmo tempo.",
                false,
            ],
            ["Uma assinatura é o mesmo que um locatário do Microsoft Entra ID.", false],
            ["Um locatário do Microsoft Entra ID só pode ter exatamente uma assinatura.", false],
        ],
    },
    {
        statement:
            "Por que uma organização com uso muito grande pode precisar de mais de uma assinatura do Azure?",
        explanation:
            "Assinaturas têm limites e cotas (como núcleos de vCPU por região); usar várias assinaturas ajuda a escalar além desses limites. Uma assinatura pode ter vários grupos de recursos, atuar em várias regiões e conter tipos variados de recursos.",
        options: [
            [
                "Porque as assinaturas têm limites e cotas (por exemplo, de núcleos de vCPU), e criar outra assinatura ajuda a contornar esses limites.",
                true,
            ],
            ["Porque cada assinatura só pode conter um único grupo de recursos.", false],
            ["Porque cada assinatura só funciona em uma única região do Azure.", false],
            [
                "Porque uma assinatura não pode conter máquinas virtuais e contas de armazenamento juntas.",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual é a principal finalidade dos grupos de gerenciamento (management groups) no Azure?",
        explanation:
            "Grupos de gerenciamento organizam várias assinaturas para aplicar acesso, políticas e conformidade de forma centralizada, com herança. Agrupar recursos é papel do grupo de recursos; energia e resfriamento são infraestrutura física; e modelos ARM não têm arquivo de estado gerenciado pelo usuário.",
        options: [
            [
                "Gerenciar acesso, políticas e conformidade de várias assinaturas de forma centralizada.",
                true,
            ],
            ["Agrupar recursos individuais para implantação conjunta.", false],
            ["Fornecer energia e resfriamento redundantes a uma região.", false],
            ["Armazenar os arquivos de estado dos modelos ARM.", false],
        ],
    },
    {
        statement:
            "Qual é a ordem correta da hierarquia de gerenciamento do Azure, do nível mais alto (mais amplo) para o mais baixo?",
        explanation:
            "A hierarquia vai de grupos de gerenciamento para assinaturas, depois grupos de recursos e, por fim, recursos. As demais ordens estão trocadas.",
        options: [
            ["Grupos de gerenciamento, assinaturas, grupos de recursos, recursos.", true],
            ["Assinaturas, grupos de gerenciamento, recursos, grupos de recursos.", false],
            ["Recursos, grupos de recursos, assinaturas, grupos de gerenciamento.", false],
            ["Grupos de recursos, grupos de gerenciamento, assinaturas, recursos.", false],
        ],
    },
    {
        statement:
            "Uma política do Azure (Azure Policy) é atribuída a um grupo de gerenciamento. Qual é o efeito sobre as assinaturas que estão dentro desse grupo de gerenciamento?",
        explanation:
            "Configurações aplicadas em um nível superior são herdadas pelos níveis inferiores, então as assinaturas e os recursos abaixo herdam a política automaticamente. A herança não exige recriação manual nem se limita a recursos criados antes da atribuição.",
        options: [
            ["As assinaturas e os recursos abaixo herdam a política automaticamente.", true],
            [
                "A política se aplica somente ao grupo de gerenciamento e nunca às assinaturas.",
                false,
            ],
            [
                "Cada assinatura precisa recriar manualmente a política para que ela tenha efeito.",
                false,
            ],
            ["A política só vale para recursos criados antes da atribuição.", false],
        ],
    },
    {
        statement:
            "Qual afirmação sobre o grupo de gerenciamento raiz (root management group) está correta?",
        explanation:
            "Há um único grupo de gerenciamento raiz por diretório (locatário), do qual todos os outros grupos de gerenciamento e assinaturas descendem; ele fica no topo e não pode ser excluído nem movido. As demais opções contrariam isso.",
        options: [
            [
                "Existe um único grupo de gerenciamento raiz por diretório, e todos os demais grupos e assinaturas descendem dele.",
                true,
            ],
            ["Cada assinatura tem seu próprio grupo de gerenciamento raiz exclusivo.", false],
            [
                "O grupo de gerenciamento raiz pode ser excluído para reorganizar a hierarquia.",
                false,
            ],
            ["O grupo de gerenciamento raiz fica abaixo das assinaturas na hierarquia.", false],
        ],
    },
    {
        statement: "O que é o Azure Resource Manager (ARM)?",
        explanation:
            "O ARM é a camada de implantação e gerenciamento do Azure, por onde passam todas as solicitações para criar, atualizar e excluir recursos, independentemente da ferramenta. Não é um serviço de VM, um banco de dados nem uma região soberana.",
        options: [
            [
                "A camada de implantação e gerenciamento do Azure, por onde passam as solicitações do portal, da CLI, do PowerShell e das APIs.",
                true,
            ],
            ["Um serviço de máquina virtual otimizado para cargas de alto desempenho.", false],
            ["Um banco de dados relacional gerenciado do Azure.", false],
            ["Uma região soberana voltada para órgãos governamentais.", false],
        ],
    },
    {
        statement:
            "Uma equipe cria recursos pelo portal do Azure e outra usa a CLI do Azure e o PowerShell. Por que o resultado é consistente independentemente da ferramenta usada?",
        explanation:
            "Portal, CLI, PowerShell, SDKs e REST enviam as requisições para a mesma camada de API do Azure Resource Manager, garantindo resultados consistentes. As outras opções descrevem comportamentos que não existem.",
        options: [
            [
                "Porque todas as ferramentas enviam as solicitações para a mesma camada do Azure Resource Manager.",
                true,
            ],
            ["Porque cada ferramenta mantém sua própria cópia isolada dos recursos.", false],
            ["Porque o portal converte tudo em zonas de disponibilidade.", false],
            ["Porque a CLI e o PowerShell só funcionam em regiões soberanas.", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente os modelos do Azure Resource Manager (ARM templates)?",
        explanation:
            "Modelos ARM são arquivos JSON declarativos (você descreve o estado desejado, não os passos) e idempotentes, podendo ser reimplantados com o mesmo resultado. Não são scripts imperativos, imagens de VM nem relatórios de custo.",
        options: [
            [
                "São arquivos JSON declarativos que definem a infraestrutura como código e são idempotentes.",
                true,
            ],
            [
                "São scripts imperativos que exigem descrever cada passo da criação dos recursos.",
                false,
            ],
            ["São imagens de máquina virtual usadas para implantação rápida.", false],
            ["São relatórios de custo gerados por assinatura.", false],
        ],
    },
    {
        statement:
            "Quais são vantagens de usar modelos ARM (ou Bicep) para implantar recursos no Azure? (Selecione DUAS opções.)",
        explanation:
            "Os modelos permitem implantações repetíveis e consistentes (infraestrutura como código), e o ARM resolve a ordem de dependências e paraleliza a criação dos recursos. Eles não eliminam custos, não criam recursos em todas as regiões nem dispensam uma assinatura.",
        options: [
            [
                "Implantações repetíveis e consistentes por meio de infraestrutura como código.",
                true,
            ],
            ["O ARM cuida da ordem de dependência e paraleliza a criação dos recursos.", true],
            ["Eliminam completamente qualquer cobrança pelos recursos implantados.", false],
            [
                "Garantem que todos os recursos sejam criados em todas as regiões automaticamente.",
                false,
            ],
            ["Dispensam a necessidade de uma assinatura do Azure.", false],
        ],
    },
    {
        statement: "O que é o Bicep no Azure?",
        explanation:
            "Bicep é uma linguagem específica de domínio (DSL) declarativa, mais concisa que o JSON, que é transpilada para modelos ARM e usa o mesmo mecanismo de implantação. Não é um balanceador de carga, não substitui o ARM nem é um tipo de assinatura.",
        options: [
            [
                "Uma linguagem específica de domínio (DSL) declarativa que simplifica a criação de modelos e é convertida (transpilada) em JSON do ARM.",
                true,
            ],
            ["Um serviço de balanceamento de carga para máquinas virtuais.", false],
            ["Uma linguagem imperativa que substitui totalmente o Azure Resource Manager.", false],
            ["Um tipo de assinatura voltado para grandes empresas.", false],
        ],
    },
    {
        statement:
            "Uma equipe acha os modelos ARM em JSON verbosos e difíceis de ler. Qual opção oferece a mesma capacidade de implantação com uma sintaxe mais concisa e legível, além de suporte imediato a novos tipos de recurso?",
        explanation:
            "O Bicep oferece sintaxe mais concisa e legível que o JSON do ARM, transpila para ARM e costuma ter suporte imediato a novos tipos de recurso. Armazenamento GRS, grupos de gerenciamento e zonas de disponibilidade não têm relação com a autoria de modelos.",
        options: [
            ["Bicep.", true],
            ["Uma conta de armazenamento com redundância geográfica (GRS).", false],
            ["Um grupo de gerenciamento adicional.", false],
            ["Uma zona de disponibilidade extra.", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa migrar um aplicativo legado para o Azure mantendo acesso administrativo total ao sistema operacional, com permissão para instalar drivers e componentes personalizados. Qual serviço de computação atende melhor a esse requisito?",
        explanation:
            "As Máquinas Virtuais são IaaS e dão controle total sobre o sistema operacional convidado, permitindo instalar drivers e software. App Service e Functions são PaaS/serverless que abstraem o SO, e o ACI executa contêineres sem acesso administrativo ao host.",
        options: [
            ["Azure App Service", false],
            ["Máquinas Virtuais do Azure", true],
            ["Azure Functions", false],
            ["Azure Container Instances", false],
        ],
    },
    {
        statement:
            "Qual serviço permite criar e gerenciar um grupo de máquinas virtuais idênticas com balanceamento de carga, aumentando ou reduzindo automaticamente o número de instâncias conforme a demanda?",
        explanation:
            "Os conjuntos de dimensionamento (VMSS) criam VMs idênticas com balanceamento de carga e autoescala horizontal. O conjunto de disponibilidade apenas distribui VMs em domínios de falha/atualização, sem autoescala; o App Service é PaaS; e zonas de disponibilidade são datacenters isolados.",
        options: [
            ["Conjunto de dimensionamento de máquinas virtuais (VMSS)", true],
            ["Conjunto de disponibilidade", false],
            ["Azure App Service", false],
            ["Zonas de disponibilidade", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente a finalidade de um conjunto de disponibilidade (availability set) no Azure?",
        explanation:
            "O conjunto de disponibilidade agrupa VMs em domínios de falha (energia/rede/hardware) e domínios de atualização (manutenção), reduzindo pontos únicos de falha dentro de um datacenter. Ele não abrange várias regiões, nem executa contêineres ou desktops.",
        options: [
            [
                "Distribui as VMs por domínios de falha e de atualização dentro de um datacenter, reduzindo o impacto de falhas de hardware e de manutenções planejadas",
                true,
            ],
            ["Distribui as VMs entre regiões do Azure geograficamente distantes", false],
            ["Executa contêineres sem a necessidade de gerenciar máquinas virtuais", false],
            ["Fornece desktops virtuais do Windows para usuários remotos", false],
        ],
    },
    {
        statement:
            "Uma aplicação crítica precisa permanecer disponível mesmo que um datacenter inteiro dentro de uma região do Azure fique indisponível. Qual recurso oferece essa proteção?",
        explanation:
            "As zonas de disponibilidade são datacenters fisicamente separados dentro de uma região, cada um com energia, refrigeração e rede independentes, protegendo contra a falha de um datacenter inteiro. O conjunto de disponibilidade protege apenas dentro de um datacenter, e escala vertical não trata de disponibilidade.",
        options: [
            ["Zonas de disponibilidade (Availability Zones)", true],
            ["Conjunto de disponibilidade dentro de um único datacenter", false],
            ["Domínios de atualização", false],
            ["Escala vertical da VM (scale up)", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento quer hospedar um site e uma API REST sem gerenciar o sistema operacional nem a infraestrutura, contando com HTTPS, escalonamento e balanceamento de carga integrados. Qual serviço PaaS é indicado?",
        explanation:
            "O Azure App Service é uma plataforma PaaS para hospedar aplicativos web e APIs sem gerenciar o SO, com escalonamento, balanceamento e HTTPS integrados. VMs e VMSS exigem gerenciar o SO, e o Azure Virtual Desktop é voltado à virtualização de desktops.",
        options: [
            ["Azure App Service", true],
            ["Máquinas Virtuais do Azure", false],
            ["Azure Virtual Desktop", false],
            ["Conjunto de dimensionamento de máquinas virtuais", false],
        ],
    },
    {
        statement:
            "Qual é a maneira mais rápida e simples de executar um único contêiner no Azure, sem gerenciar máquinas virtuais nem adotar um orquestrador?",
        explanation:
            "O Azure Container Instances executa contêineres sob demanda, com cobrança por segundo, sem gerenciar VMs nem orquestração. O AKS envolve a complexidade de um cluster Kubernetes; VMs exigem gerenciar o SO; e o App Service é voltado a aplicações web.",
        options: [
            ["Azure Kubernetes Service (AKS)", false],
            ["Azure Container Instances (ACI)", true],
            ["Máquinas Virtuais do Azure", false],
            ["Azure App Service", false],
        ],
    },
    {
        statement:
            "Uma organização deseja disponibilizar desktops e aplicativos do Windows na nuvem, acessíveis remotamente a partir de diversos dispositivos. Qual serviço do Azure atende a essa necessidade?",
        explanation:
            "O Azure Virtual Desktop é o serviço de virtualização de desktops e aplicativos (VDI) do Azure, entregando áreas de trabalho do Windows acessíveis de qualquer lugar. Os demais serviços destinam-se a aplicações web, código serverless e contêineres.",
        options: [
            ["Azure Virtual Desktop", true],
            ["Azure App Service", false],
            ["Azure Functions", false],
            ["Azure Container Instances", false],
        ],
    },
    {
        statement:
            "Aumentar a quantidade de CPU e memória de uma máquina virtual existente para suportar mais carga é um exemplo de qual tipo de escalabilidade?",
        explanation:
            "Aumentar os recursos (CPU/RAM) de uma mesma instância é escala vertical (scale up). A escala horizontal (scale out) adiciona mais instâncias; balanceamento de carga distribui tráfego; e georreplicação copia dados entre regiões.",
        options: [
            ["Escala vertical (scale up)", true],
            ["Escala horizontal (scale out)", false],
            ["Balanceamento de carga", false],
            ["Georreplicação", false],
        ],
    },
    {
        statement:
            "Um conjunto de dimensionamento adiciona mais instâncias de VM idênticas quando a demanda aumenta e as remove quando ela diminui. Como esse tipo de escalabilidade é chamado?",
        explanation:
            "Adicionar ou remover instâncias é escala horizontal (scale out/in), característica dos VMSS. A escala vertical altera o tamanho de uma única instância; failover e redundância de armazenamento tratam de outros aspectos.",
        options: [
            ["Escala horizontal (scale out/in)", true],
            ["Escala vertical (scale up/down)", false],
            ["Failover manual", false],
            ["Redundância de armazenamento", false],
        ],
    },
    {
        statement:
            "Ao utilizar Máquinas Virtuais do Azure (IaaS), quem é o responsável por aplicar patches e atualizações no sistema operacional convidado?",
        explanation:
            "No modelo IaaS, o cliente é responsável por manter e atualizar o sistema operacional convidado e o software instalado. A Microsoft gerencia a infraestrutura física subjacente, não o SO da VM.",
        options: [
            ["O cliente", true],
            ["A Microsoft, de forma totalmente automática", false],
            ["O provedor de conectividade de rede", false],
            ["Ninguém; VMs não precisam de atualizações", false],
        ],
    },
    {
        statement:
            "No Azure Kubernetes Service (AKS), qual é o modelo de cobrança relacionado ao plano de controle (control plane) do Kubernetes?",
        explanation:
            "No AKS, o Azure gerencia o plano de controle gratuitamente e o cliente paga somente pelos nós de trabalho e recursos como armazenamento e rede. Não há cobrança pelo control plane padrão, e o AKS não é gratuito por completo.",
        options: [
            [
                "O plano de controle gerenciado é gratuito; o cliente paga pelos nós de trabalho (VMs) e recursos associados",
                true,
            ],
            ["O cliente paga pelo plano de controle, mas os nós de trabalho são gratuitos", false],
            ["Tudo no AKS é totalmente gratuito", false],
            ["A cobrança é feita apenas por segundo de execução de cada contêiner", false],
        ],
    },
    {
        statement:
            "Quais são duas características do plano de Consumo (Consumption) do Azure Functions? (Selecione DUAS opções.)",
        explanation:
            "No plano de Consumo, você paga apenas pela execução (tempo e recursos) e o serviço escala automaticamente com a demanda. Não há VMs para provisionar, não há instância fixa 24/7 nem necessidade de cluster Kubernetes.",
        options: [
            ["Você paga apenas pelos recursos consumidos enquanto o código está em execução", true],
            ["Escala automaticamente conforme o número de eventos ou solicitações", true],
            ["Exige provisionar e manter máquinas virtuais manualmente", false],
            ["Mantém uma instância dedicada ligada 24 horas por dia com custo fixo", false],
            ["Requer a configuração prévia de um cluster Kubernetes", false],
        ],
    },
    {
        statement:
            "Quais recursos são fornecidos nativamente pelo Azure App Service? (Selecione DUAS opções.)",
        explanation:
            "O App Service oferece escalonamento automático, balanceamento de carga e slots de implantação de forma integrada. Ele não dá acesso administrativo ao SO (é PaaS), não orquestra Kubernetes (isso é o AKS) nem virtualiza desktops (isso é o Azure Virtual Desktop).",
        options: [
            ["Escalonamento automático e balanceamento de carga integrados", true],
            ["Slots de implantação (deployment slots) para preparo (staging) e produção", true],
            ["Acesso administrativo completo ao sistema operacional do host", false],
            ["Orquestração de contêineres com Kubernetes", false],
            ["Virtualização de desktops Windows multissessão", false],
        ],
    },
    {
        statement:
            "Qual é uma vantagem dos contêineres em comparação com máquinas virtuais tradicionais?",
        explanation:
            "Contêineres compartilham o kernel do SO do host, o que os torna mais leves e rápidos para iniciar do que VMs, que carregam um SO convidado completo. Por isso costumam consumir menos recursos e podem ser executados no ACI e no AKS.",
        options: [
            [
                "São mais leves e iniciam mais rápido, pois compartilham o kernel do sistema operacional do host",
                true,
            ],
            ["Cada contêiner inclui uma cópia completa de um sistema operacional convidado", false],
            ["Sempre consomem mais recursos do que uma VM equivalente", false],
            ["Não podem ser executados em nenhum serviço do Azure", false],
        ],
    },
    {
        statement:
            "Sempre que um arquivo é carregado no Armazenamento de Blobs, um pequeno código deve ser executado para gerar uma miniatura da imagem. Os envios são esporádicos e imprevisíveis, e a empresa quer pagar apenas quando o código roda. Qual serviço é o mais indicado?",
        explanation:
            "O Azure Functions, acionado por um gatilho de Blob, executa o código apenas quando há um upload e cobra somente pela execução, ideal para cargas esporádicas. Uma VM sempre ligada geraria custo ocioso, e AKS ou VMSS seriam excessivos para essa tarefa.",
        options: [
            ["Azure Functions", true],
            ["Uma Máquina Virtual sempre ligada", false],
            ["Azure Kubernetes Service", false],
            ["Conjunto de dimensionamento de máquinas virtuais", false],
        ],
    },
    {
        statement:
            "Uma aplicação composta por dezenas de microsserviços em contêineres precisa de orquestração automática, autorrecuperação e escalonamento independente de cada serviço. Qual serviço é o mais adequado?",
        explanation:
            "O AKS oferece orquestração completa de contêineres (agendamento, autorrecuperação e escalonamento) para arquiteturas de microsserviços complexas. O ACI não orquestra, o Functions é para código orientado a eventos e o App Service é focado em aplicações web.",
        options: [
            ["Azure Kubernetes Service (AKS)", true],
            ["Azure Container Instances (ACI)", false],
            ["Azure Functions", false],
            ["Azure App Service", false],
        ],
    },
    {
        statement:
            "Quais são duas características dos conjuntos de dimensionamento de máquinas virtuais (VMSS)? (Selecione DUAS opções.)",
        explanation:
            "Os VMSS criam instâncias idênticas a partir da mesma imagem e oferecem autoescala horizontal conforme a demanda. As instâncias não têm sistemas operacionais distintos, o serviço não virtualiza desktops e trabalha justamente em conjunto com balanceamento de carga.",
        options: [
            ["Todas as instâncias são criadas a partir da mesma configuração e imagem base", true],
            [
                "Podem aumentar ou diminuir automaticamente o número de instâncias conforme a demanda",
                true,
            ],
            [
                "Cada instância executa um sistema operacional diferente, escolhido individualmente",
                false,
            ],
            ["Fornecem virtualização de desktops para usuários finais", false],
            ["Eliminam a necessidade de qualquer forma de balanceamento de carga", false],
        ],
    },
    {
        statement:
            "Quais são duas características do Azure Virtual Desktop? (Selecione DUAS opções.)",
        explanation:
            "O Azure Virtual Desktop entrega desktops e aplicativos Windows na nuvem e oferece o exclusivo Windows 10/11 Enterprise multissessão. Ele não orquestra contêineres, não é serverless e continua dependendo de identidade (Microsoft Entra ID/Active Directory) para autenticar usuários.",
        options: [
            [
                "Oferece virtualização de desktops e aplicativos do Windows na nuvem, acessíveis remotamente",
                true,
            ],
            ["Suporta o Windows 10/11 Enterprise multissessão", true],
            ["É um serviço de orquestração de contêineres baseado em Kubernetes", false],
            ["Executa código sem servidor em resposta a eventos", false],
            ["Substitui a necessidade de autenticação e identidade dos usuários", false],
        ],
    },
    {
        statement:
            "Para aumentar a disponibilidade de uma aplicação executada em máquinas virtuais e obter um SLA mais alto, qual é a prática recomendada?",
        explanation:
            "Distribuir várias VMs em um conjunto de disponibilidade ou entre zonas de disponibilidade elimina pontos únicos de falha e eleva o SLA. Uma única VM é um ponto único de falha, e desligar a VM ou aumentar o disco não melhora a disponibilidade.",
        options: [
            [
                "Implantar várias instâncias de VM distribuídas em um conjunto de disponibilidade ou entre zonas de disponibilidade",
                true,
            ],
            ["Executar uma única VM de grande porte em um único datacenter", false],
            ["Desligar a VM fora do horário comercial", false],
            ["Aumentar apenas o tamanho do disco da VM", false],
        ],
    },
    {
        statement:
            "Entre os serviços de computação a seguir, qual é um exemplo de PaaS (Plataforma como Serviço), em que o provedor gerencia o sistema operacional e a infraestrutura subjacente?",
        explanation:
            "O App Service é PaaS: a plataforma gerencia o SO e a infraestrutura, e o cliente foca na aplicação. VMs, VMSS e conjuntos de disponibilidade fazem parte do modelo IaaS, no qual o cliente gerencia o sistema operacional.",
        options: [
            ["Azure App Service", true],
            ["Máquinas Virtuais do Azure", false],
            ["Conjunto de dimensionamento de máquinas virtuais (VMSS)", false],
            ["Conjunto de disponibilidade", false],
        ],
    },
    {
        statement: "Qual e a funcao principal de uma Rede Virtual (VNet) no Azure?",
        explanation:
            "A VNet e o bloco fundamental de redes privadas no Azure e permite que recursos como maquinas virtuais se comuniquem com seguranca entre si, com a internet e com redes locais. As outras opcoes descrevem Armazenamento de Blobs, Azure Front Door/Traffic Manager e Azure Functions.",
        options: [
            ["Fornecer armazenamento de objetos altamente escalavel para arquivos e blobs", false],
            [
                "Habilitar a comunicacao privada e segura entre recursos do Azure, com a internet e com redes locais",
                true,
            ],
            ["Distribuir automaticamente o trafego HTTP entre varias regioes do mundo", false],
            ["Executar funcoes sem servidor em resposta a eventos", false],
        ],
    },
    {
        statement:
            "Uma empresa vai implantar recursos em Brazil South e em East US. Qual afirmacao sobre Redes Virtuais esta correta?",
        explanation:
            "Uma VNet reside em uma unica regiao (podendo abranger todas as zonas de disponibilidade dessa regiao); para conectar VNets de regioes diferentes usa-se o peering global de VNets. Por isso as demais afirmacoes estao incorretas.",
        options: [
            [
                "Uma VNet esta limitada a uma unica regiao; para conectar VNets em regioes diferentes usa-se o peering global de VNets",
                true,
            ],
            ["Uma unica VNet pode abranger varias regioes do Azure simultaneamente", false],
            ["VNets funcionam apenas dentro de uma unica zona de disponibilidade", false],
            ["E obrigatorio um ExpressRoute para conectar duas VNets da mesma assinatura", false],
        ],
    },
    {
        statement: "Qual e o proposito de dividir uma Rede Virtual em sub-redes?",
        explanation:
            "As sub-redes dividem o espaco de enderecos da VNet para organizar e isolar recursos, por exemplo separando camadas de aplicacao. Elas nao alteram a largura de banda, nao fazem backup nem convertem enderecos IP.",
        options: [
            ["Segmentar o espaco de enderecos da VNet para organizar e isolar recursos", true],
            ["Aumentar automaticamente a largura de banda disponivel na VNet", false],
            ["Criar copias de backup automaticas dos recursos da VNet", false],
            ["Converter enderecos IP privados em publicos para acesso a internet", false],
        ],
    },
    {
        statement:
            "Ao criar sub-redes dentro de uma VNet cujo espaco de enderecos e 10.0.0.0/16, qual regra deve ser respeitada?",
        explanation:
            "Os intervalos das sub-redes precisam estar contidos no espaco de enderecos da VNet e nao podem se sobrepor entre si. As sub-redes podem ter tamanhos diferentes e uma VNet comporta varias sub-redes.",
        options: [
            ["Todas as sub-redes precisam ter exatamente o mesmo tamanho de intervalo", false],
            [
                "Os intervalos das sub-redes devem estar contidos no espaco da VNet e nao podem se sobrepor",
                true,
            ],
            ["Cada sub-rede deve usar um espaco de enderecos fora do intervalo da VNet", false],
            ["Uma VNet pode conter no maximo uma sub-rede", false],
        ],
    },
    {
        statement:
            "Duas VNets na mesma regiao precisam que suas VMs se comuniquem usando enderecos IP privados, com baixa latencia e sem passar pela internet. Qual recurso atende a esse requisito?",
        explanation:
            "O peering de VNets conecta as redes e permite comunicacao por IPs privados atraves da rede backbone da Microsoft, com baixa latencia. Azure DNS apenas resolve nomes, o IP publico expoe a internet e o Bastion fornece acesso RDP/SSH.",
        options: [
            ["Peering de VNets", true],
            ["Azure DNS", false],
            ["Endereco IP publico", false],
            ["Azure Bastion", false],
        ],
    },
    {
        statement:
            "Quais afirmacoes descrevem corretamente o peering de VNets? (Selecione DUAS opcoes.)",
        explanation:
            "O peering permite comunicacao por IPs privados e mantem o trafego na rede backbone da Microsoft, sem passar pela internet publica. Ele nao adiciona criptografia IPsec por padrao, nao e transitivo e nao exige um VPN Gateway.",
        options: [
            ["Permite a comunicacao por enderecos IP privados entre as VNets", true],
            [
                "O trafego trafega pela rede backbone da Microsoft, sem passar pela internet publica",
                true,
            ],
            ["Criptografa todo o trafego com IPsec por padrao", false],
            [
                "E transitivo por padrao, portanto a VNet A alcanca a VNet C atraves da VNet B",
                false,
            ],
            ["Exige a implantacao de um VPN Gateway em cada VNet emparelhada", false],
        ],
    },
    {
        statement: "O que e um VPN Gateway no Azure?",
        explanation:
            "O VPN Gateway e um tipo de gateway de rede virtual que envia trafego criptografado entre uma VNet e um local remoto atraves da internet publica. As demais opcoes descrevem Azure DNS, um firewall de aplicacao e um equipamento fisico, o que nao corresponde ao servico.",
        options: [
            [
                "Um tipo de gateway de rede virtual que envia trafego criptografado entre uma VNet e um local remoto pela internet publica",
                true,
            ],
            ["Um servico que hospeda zonas DNS e resolve nomes de dominio", false],
            ["Um firewall de camada de aplicacao (L7) com filtragem de URL", false],
            ["Um dispositivo fisico instalado no datacenter da Microsoft", false],
        ],
    },
    {
        statement:
            "Funcionarios remotos, trabalhando de casa em computadores individuais, precisam de acesso seguro aos recursos de uma VNet. Qual configuracao do VPN Gateway e mais adequada?",
        explanation:
            "O Point-to-Site (P2S) conecta computadores clientes individuais a uma VNet, ideal para trabalhadores remotos. O Site-to-Site liga redes inteiras, o ExpressRoute usa conexao privada dedicada e o peering conecta VNets entre si.",
        options: [
            ["ExpressRoute", false],
            ["Site-to-Site (S2S)", false],
            ["Point-to-Site (P2S)", true],
            ["Peering de VNets", false],
        ],
    },
    {
        statement:
            "Uma empresa quer conectar toda a rede do seu datacenter local a uma VNet do Azure por meio de um tunel criptografado. Qual tipo de conexao do VPN Gateway atende a isso?",
        explanation:
            "A conexao Site-to-Site (S2S) do VPN Gateway liga toda a rede local a uma VNet por um tunel IPsec criptografado. O Point-to-Site atende clientes individuais, e o peering global e o Azure DNS tem outras finalidades.",
        options: [
            ["Site-to-Site (S2S)", true],
            ["Point-to-Site (P2S)", false],
            ["Peering global de VNets", false],
            ["Azure DNS", false],
        ],
    },
    {
        statement:
            "Quais dois servicos podem ser usados para conectar uma rede local (on-premises) ao Azure? (Selecione DUAS opcoes.)",
        explanation:
            "Tanto o VPN Gateway (Site-to-Site) quanto o ExpressRoute conectam a rede local ao Azure. O peering de VNets conecta VNets entre si, o Azure DNS resolve nomes e o NSG apenas filtra trafego.",
        options: [
            ["VPN Gateway (Site-to-Site)", true],
            ["ExpressRoute", true],
            ["Peering de VNets", false],
            ["Azure DNS", false],
            ["Grupo de Seguranca de Rede (NSG)", false],
        ],
    },
    {
        statement: "Qual afirmacao descreve corretamente o ExpressRoute?",
        explanation:
            "O ExpressRoute estende a rede local ate o Azure por uma conexao privada, facilitada por um provedor de conectividade, sem trafegar pela internet publica. A VPN usa tuneis IPsec sobre a internet, e as demais opcoes nao correspondem ao servico.",
        options: [
            [
                "Estende a rede local ao Azure por uma conexao privada, via provedor de conectividade, sem passar pela internet publica",
                true,
            ],
            ["Usa tuneis IPsec criptografados sobre a internet publica", false],
            ["Conecta duas sub-redes dentro da mesma VNet", false],
            ["E um servico de resolucao de nomes DNS", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa conectar sua rede local ao Azure com rapidez, aceita que o trafego passe pela internet publica desde que criptografado e quer manter o menor custo. Qual solucao e mais adequada?",
        explanation:
            "Quando o trafego pode ir pela internet publica desde que criptografado, e o objetivo e rapidez e menor custo, a VPN Site-to-Site e a escolha adequada. O ExpressRoute e uma conexao privada de maior custo, o peering conecta VNets e o Azure DNS resolve nomes.",
        options: [
            ["ExpressRoute", false],
            ["VPN Gateway com conexao Site-to-Site", true],
            ["Peering global de VNets", false],
            ["Azure DNS", false],
        ],
    },
    {
        statement: "O que o Azure DNS oferece?",
        explanation:
            "O Azure DNS hospeda dominios DNS e faz a resolucao de nomes usando a infraestrutura do Azure. Ele nao registra nem compra dominios, nao e balanceador global (isso e o Traffic Manager) e nao e um firewall de aplicacao web.",
        options: [
            [
                "Hospedagem de dominios DNS e resolucao de nomes usando a infraestrutura do Azure",
                true,
            ],
            ["Registro e compra de novos nomes de dominio", false],
            ["Balanceamento de carga global baseado em DNS entre regioes", false],
            ["Protecao de aplicacoes web por meio de um firewall (WAF)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer resolucao de nomes personalizada entre as VMs dentro de suas VNets, sem expor os registros a internet. Qual recurso deve usar?",
        explanation:
            "As zonas DNS privadas do Azure (Azure Private DNS) fornecem resolucao de nomes dentro e entre VNets sem expor os registros a internet. A zona DNS publica exporia os registros e o NSG apenas filtra trafego, nao resolve nomes.",
        options: [
            ["Zona DNS publica do Azure", false],
            ["Zona DNS privada do Azure (Azure Private DNS)", true],
            ["Grupo de Seguranca de Rede (NSG)", false],
            ["O Azure DNS nao oferece resolucao de nomes dentro de VNets", false],
        ],
    },
    {
        statement:
            "Qual afirmacao distingue corretamente enderecos IP privados de publicos no Azure?",
        explanation:
            "Enderecos IP privados sao usados para comunicacao dentro da VNet e com redes locais; enderecos IP publicos sao usados para comunicacao com a internet. As demais opcoes invertem ou confundem esses papeis.",
        options: [
            [
                "Enderecos IP publicos sao usados apenas dentro da VNet, e os privados apenas com a internet",
                false,
            ],
            ["Ambos sao roteaveis pela internet publica sem diferenca de uso", false],
            [
                "Enderecos IP privados servem para comunicacao dentro da VNet e com redes locais; os publicos, para comunicacao com a internet",
                true,
            ],
            ["Enderecos IP privados so podem ser usados por recursos de PaaS", false],
        ],
    },
    {
        statement:
            "Em qual cenario um recurso do Azure obrigatoriamente precisa de um endereco IP publico?",
        explanation:
            "Uma VM que precisa ser acessada diretamente da internet requer um endereco IP publico. As comunicacoes internas (na mesma VNet, entre sub-redes ou via peering) utilizam enderecos IP privados.",
        options: [
            ["Duas VMs na mesma VNet que se comunicam entre si", false],
            ["Comunicacao entre duas sub-redes da mesma VNet", false],
            ["Uma VM que acessa outra VNet por meio de peering", false],
            ["Uma VM que precisa ser acessada diretamente pela internet", true],
        ],
    },
    {
        statement:
            "Uma aplicacao de terceiros exige que o endereco IP publico associado a uma VM nao mude quando ela for reiniciada ou desalocada. Qual metodo de alocacao deve ser usado?",
        explanation:
            "A alocacao estatica garante um endereco IP publico que nao muda quando a VM e reiniciada ou desalocada. A alocacao dinamica pode mudar, e peering ou Azure DNS nao tem relacao com o metodo de alocacao do IP.",
        options: [
            ["Alocacao dinamica", false],
            ["Alocacao estatica", true],
            ["Peering de VNets", false],
            ["Azure DNS", false],
        ],
    },
    {
        statement: "Qual e a funcao de um Grupo de Seguranca de Rede (NSG)?",
        explanation:
            "O NSG filtra o trafego de rede de entrada e de saida de recursos do Azure por meio de regras de permissao e negacao. Ele nao criptografa dados em repouso, nao balanceia carga (isso e o Load Balancer) nem resolve nomes DNS.",
        options: [
            [
                "Filtrar o trafego de entrada e de saida de recursos do Azure com regras de permissao e negacao",
                true,
            ],
            ["Criptografar dados em repouso nos discos das maquinas virtuais", false],
            ["Distribuir a carga de rede entre varias maquinas virtuais", false],
            ["Resolver nomes de dominio em enderecos IP", false],
        ],
    },
    {
        statement:
            "Sobre as regras de um Grupo de Seguranca de Rede (NSG), qual afirmacao esta correta?",
        explanation:
            "As regras do NSG sao processadas por ordem de prioridade, e o numero de prioridade mais baixo e avaliado primeiro. Alem disso, um NSG pode ser associado a sub-redes e a interfaces de rede, e permite criar regras personalizadas alem das padrao.",
        options: [
            ["Regras com numero de prioridade maior sao sempre avaliadas primeiro", false],
            ["Um NSG so pode ser associado a uma interface de rede, nunca a uma sub-rede", false],
            [
                "As regras sao processadas por prioridade, e o numero de prioridade mais baixo e avaliado primeiro",
                true,
            ],
            ["Nao e possivel criar regras personalizadas, apenas usar as regras padrao", false],
        ],
    },
    {
        statement:
            "Quais afirmacoes descrevem corretamente um Grupo de Seguranca de Rede (NSG)? (Selecione DUAS opcoes.)",
        explanation:
            "Um NSG pode ser associado a sub-redes e a interfaces de rede (NICs) e suas regras sao avaliadas por prioridade, do menor para o maior numero. Ele atua nas camadas 3/4 (nao faz inspecao L7 de URL), filtra trafego de entrada e de saida e nao tem custo por regra.",
        options: [
            ["Pode ser associado a sub-redes e a interfaces de rede (NICs)", true],
            ["As regras sao avaliadas por prioridade, do menor para o maior numero", true],
            ["Fornece inspecao de trafego na camada de aplicacao (L7) com filtragem de URL", false],
            ["Filtra apenas o trafego de saida, nunca o de entrada", false],
            ["Possui cobranca fixa por cada regra criada", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa provisionar, sob um mesmo namespace e com a mesma configuração de redundância, um contêiner de blobs, um compartilhamento de arquivos, uma fila e uma tabela. Qual recurso do Azure agrupa esses serviços de dados?",
        explanation:
            "A conta de armazenamento fornece um namespace exclusivo e agrupa os serviços Blob, File, Queue e Table sob a mesma configuração. O grupo de recursos apenas organiza recursos logicamente, sem fornecer o namespace de dados; VM e rede virtual não armazenam esses serviços.",
        options: [
            ["Conta de armazenamento (Storage account)", true],
            ["Grupo de recursos (Resource group)", false],
            ["Máquina virtual do Azure", false],
            ["Rede virtual (Virtual Network)", false],
        ],
    },
    {
        statement:
            "Qual serviço de armazenamento do Azure é otimizado para guardar grandes volumes de dados não estruturados, como imagens, vídeos, documentos e backups?",
        explanation:
            "O Blob Storage é o armazenamento de objetos do Azure, ideal para dados não estruturados. O Table Storage guarda dados NoSQL estruturados, o Queue Storage armazena mensagens e os discos gerenciados servem como discos de máquinas virtuais.",
        options: [
            ["Azure Blob Storage", true],
            ["Azure Table Storage", false],
            ["Azure Queue Storage", false],
            ["Discos gerenciados (Managed Disks)", false],
        ],
    },
    {
        statement:
            "Um aplicativo lê e grava arquivos várias vezes ao dia e precisa do menor custo por transação/acesso, mesmo que o custo de armazenamento seja mais alto. Qual camada de acesso do Blob Storage é a mais adequada?",
        explanation:
            "A camada Hot tem o maior custo de armazenamento, porém o menor custo de acesso, sendo ideal para dados acessados com frequência. Cool, Cold e Archive reduzem o custo de armazenamento mas aumentam o custo de acesso, penalizando dados usados diariamente.",
        options: [
            ["Hot (Quente)", true],
            ["Cool (Fria)", false],
            ["Cold (Gelada)", false],
            ["Archive (Arquivo morto)", false],
        ],
    },
    {
        statement:
            "Dados serão acessados com pouca frequência e permanecerão armazenados por pelo menos 30 dias, mas ainda precisam estar disponíveis online imediatamente. Qual camada de acesso equilibra menor custo de armazenamento com acesso imediato nesse cenário?",
        explanation:
            "A camada Cool foi projetada para dados acessados com pouca frequência e mantidos por no mínimo 30 dias, com custo de armazenamento menor que a Hot e acesso online imediato. A Hot é mais cara para armazenar, a Archive é offline e Premium é um nível de desempenho, não uma camada de acesso frio.",
        options: [
            ["Cool (Fria)", true],
            ["Hot (Quente)", false],
            ["Archive (Arquivo morto)", false],
            ["Premium", false],
        ],
    },
    {
        statement:
            "A Microsoft disponibiliza a camada de acesso Cold (Gelada) no Blob Storage. Como ela se posiciona em relação às demais camadas?",
        explanation:
            "A camada Cold tem custo de armazenamento inferior ao da Cool e mantém os dados online, posicionando-se entre Cool e Archive. Diferente da Archive, ela não deixa os dados offline, e não se destina a dados de acesso frequente como a Hot.",
        options: [
            [
                "Fica entre Cool e Archive: custo de armazenamento menor que o da Cool, com os dados ainda online e acessíveis imediatamente",
                true,
            ],
            ["Fica acima da Hot, oferecendo o maior custo de armazenamento de todas", false],
            ["É equivalente à Archive, mantendo os dados offline até a reidratação", false],
            ["Substitui a Hot para dados acessados muitas vezes por dia", false],
        ],
    },
    {
        statement:
            "Um conjunto de dados de conformidade quase nunca é acessado e será retido por vários anos com o menor custo de armazenamento possível. Qual afirmação sobre a camada Archive (Arquivo morto), adequada a esse caso, está correta?",
        explanation:
            "A camada Archive tem o menor custo de armazenamento, mas mantém os dados offline; para lê-los é preciso reidratá-los, o que pode levar horas. Por isso ela tem alta latência e alto custo de recuperação, e não é a camada padrão de uma conta.",
        options: [
            [
                "Os dados ficam offline e precisam ser reidratados (rehydrated) antes da leitura, o que pode levar horas",
                true,
            ],
            ["Oferece a menor latência de leitura entre todas as camadas", false],
            ["É a camada padrão aplicada a novas contas de armazenamento", false],
            ["Tem o maior custo de armazenamento e o menor custo de recuperação", false],
        ],
    },
    {
        statement:
            "Dentro de uma conta de armazenamento, como os blobs são organizados no Azure Blob Storage?",
        explanation:
            "Os blobs são armazenados em contêineres dentro da conta de armazenamento. Linhas e colunas descrevem o Table Storage, filas de mensagens descrevem o Queue Storage e compartilhamentos SMB descrevem o Azure Files.",
        options: [
            [
                "Em contêineres (containers), que funcionam de forma semelhante a diretórios para agrupar blobs",
                true,
            ],
            ["Em tabelas compostas por linhas e colunas", false],
            ["Em filas de mensagens no formato FIFO", false],
            ["Em compartilhamentos montados por meio do protocolo SMB", false],
        ],
    },
    {
        statement:
            "Uma organização quer fazer o lift-and-shift de um compartilhamento de arquivos corporativo para a nuvem e montá-lo simultaneamente em servidores Windows e Linux usando o protocolo SMB. Qual serviço atende diretamente a esse requisito?",
        explanation:
            "O Azure Files oferece compartilhamentos de arquivos totalmente gerenciados, acessíveis por SMB (e NFS) e montáveis em vários sistemas operacionais. Blob é armazenamento de objetos, Queue é mensageria e Table é NoSQL, nenhum deles é um compartilhamento de arquivos montável.",
        options: [
            ["Azure Files", true],
            ["Azure Blob Storage", false],
            ["Azure Queue Storage", false],
            ["Azure Table Storage", false],
        ],
    },
    {
        statement:
            "Qual serviço de armazenamento do Azure é indicado para armazenar um grande número de mensagens e desacoplar componentes de um aplicativo, permitindo o processamento assíncrono entre eles?",
        explanation:
            "O Queue Storage armazena mensagens e permite comunicação assíncrona entre componentes, desacoplando produtores e consumidores. Table guarda dados estruturados, Files fornece compartilhamentos de arquivos e Blob armazena objetos, nenhum voltado à mensageria.",
        options: [
            ["Azure Queue Storage", true],
            ["Azure Table Storage", false],
            ["Azure Files", false],
            ["Azure Blob Storage", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa armazenar dados NoSQL estruturados no formato de chave/atributo (key/attribute), sem esquema fixo e com baixo custo. Qual serviço de armazenamento do Azure é o mais indicado?",
        explanation:
            "O Table Storage é um armazenamento NoSQL de chave/atributo, sem esquema rígido e de baixo custo. Queue é para mensagens, Blob para objetos não estruturados e Files para compartilhamentos de arquivos.",
        options: [
            ["Azure Table Storage", true],
            ["Azure Queue Storage", false],
            ["Azure Blob Storage", false],
            ["Azure Files", false],
        ],
    },
    {
        statement:
            "Qual opção de redundância mantém três cópias síncronas dos dados dentro de um único local físico (data center) na região primária, sendo a alternativa de menor custo?",
        explanation:
            "O LRS replica os dados três vezes dentro de um único data center, protegendo contra falhas de disco ou rack ao menor custo. ZRS distribui entre zonas, e GRS/GZRS replicam também para uma região secundária, com custo maior.",
        options: [
            ["LRS (armazenamento com redundância local)", true],
            ["ZRS (armazenamento com redundância de zona)", false],
            ["GRS (armazenamento com redundância geográfica)", false],
            ["GZRS (redundância geográfica de zona)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer proteger seus dados contra a falha de um data center inteiro dentro da região primária, sem replicar para outra região. Qual opção de redundância replica os dados de forma síncrona entre três zonas de disponibilidade?",
        explanation:
            "O ZRS replica os dados de forma síncrona entre três zonas de disponibilidade da região primária, tolerando a perda de um data center inteiro. O LRS fica em um único data center, e GRS/RA-GRS focam em replicação para uma região secundária.",
        options: [
            ["ZRS (armazenamento com redundância de zona)", true],
            ["LRS (armazenamento com redundância local)", false],
            ["GRS (armazenamento com redundância geográfica)", false],
            ["RA-GRS (leitura-acesso com redundância geográfica)", false],
        ],
    },
    {
        statement:
            "Sua aplicação precisa poder LER os dados a partir da região secundária a qualquer momento, mesmo sem um failover iniciado pela Microsoft. Qual opção de redundância oferece esse acesso de leitura ao endpoint secundário?",
        explanation:
            "O RA-GRS acrescenta ao GRS o acesso de leitura ao endpoint da região secundária, disponível mesmo sem failover. O GRS comum só permite ler a secundária após um failover; ZRS e LRS mantêm os dados apenas na região primária.",
        options: [
            ["RA-GRS (leitura-acesso com redundância geográfica)", true],
            ["GRS (armazenamento com redundância geográfica)", false],
            ["ZRS (armazenamento com redundância de zona)", false],
            ["LRS (armazenamento com redundância local)", false],
        ],
    },
    {
        statement:
            "Qual opção de redundância combina a replicação síncrona entre três zonas de disponibilidade na região primária COM a replicação assíncrona para uma região secundária emparelhada?",
        explanation:
            "O GZRS usa ZRS na região primária (três zonas) e ainda replica para uma região secundária, unindo redundância de zona e geográfica. O ZRS não replica para outra região, enquanto GRS e RA-GRS usam LRS na primária (um único data center), sem redundância de zona.",
        options: [
            ["GZRS (redundância geográfica de zona)", true],
            ["LRS (armazenamento com redundância local)", false],
            ["ZRS (armazenamento com redundância de zona)", false],
            ["GRS (armazenamento com redundância geográfica)", false],
            ["RA-GRS (leitura-acesso com redundância geográfica)", false],
        ],
    },
    {
        statement:
            "Qual ferramenta de linha de comando é usada para copiar blobs e arquivos de e para contas de armazenamento do Azure de forma otimizada, pela rede (online)?",
        explanation:
            "O AzCopy é o utilitário de linha de comando para transferências online de blobs e arquivos com o armazenamento do Azure. O Data Box é um dispositivo físico offline, o File Sync sincroniza servidores locais e o Azure Migrate coordena migração de servidores e cargas de trabalho.",
        options: [
            ["AzCopy", true],
            ["Azure Data Box", false],
            ["Azure File Sync", false],
            ["Azure Migrate", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa transferir 500 TB de dados para o Azure, mas sua conexão de internet é lenta e uma transferência online levaria meses. Qual serviço envia um dispositivo físico para copiar os dados e devolvê-los à Microsoft (transferência offline)?",
        explanation:
            "O Azure Data Box é um appliance físico usado para mover grandes volumes de dados de forma offline quando a transferência pela rede é inviável. AzCopy e Storage Explorer dependem da rede, e o File Sync sincroniza compartilhamentos, não faz transporte offline em massa.",
        options: [
            ["Azure Data Box", true],
            ["AzCopy", false],
            ["Azure File Sync", false],
            ["Azure Storage Explorer", false],
        ],
    },
    {
        statement:
            "Qual serviço permite centralizar os compartilhamentos de arquivos da organização no Azure Files, mantendo um cache local em servidores Windows Server on-premises com camadas para a nuvem (cloud tiering)?",
        explanation:
            "O Azure File Sync sincroniza compartilhamentos de arquivos de servidores Windows Server locais com o Azure Files, oferecendo cache local e cloud tiering. Data Box faz transporte físico, AzCopy copia via linha de comando e Azure Migrate coordena migração de servidores.",
        options: [
            ["Azure File Sync", true],
            ["Azure Data Box", false],
            ["AzCopy", false],
            ["Azure Migrate", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure fornece um hub centralizado para descobrir, avaliar e migrar servidores locais, máquinas virtuais, bancos de dados e aplicativos para o Azure?",
        explanation:
            "O Azure Migrate é o hub centralizado para descoberta, avaliação e migração de servidores, VMs, bancos de dados e aplicativos. File Sync sincroniza arquivos, AzCopy copia dados e Data Box faz transporte físico offline, sem o papel de avaliação e orquestração.",
        options: [
            ["Azure Migrate", true],
            ["Azure File Sync", false],
            ["AzCopy", false],
            ["Azure Data Box", false],
        ],
    },
    {
        statement:
            "Para se proteger contra a indisponibilidade de uma região inteira, os dados precisam ser copiados para uma região secundária emparelhada, a centenas de quilômetros de distância. Quais opções de redundância replicam os dados entre regiões? (Selecione DUAS opções.)",
        explanation:
            "GRS e GZRS (e suas variantes RA) copiam os dados para uma região secundária, protegendo contra desastres regionais. LRS e ZRS mantêm todas as cópias apenas na região primária, sem replicação entre regiões.",
        options: [
            ["GRS (armazenamento com redundância geográfica)", true],
            ["GZRS (redundância geográfica de zona)", true],
            ["LRS (armazenamento com redundância local)", false],
            ["ZRS (armazenamento com redundância de zona)", false],
        ],
    },
    {
        statement:
            "O Azure Files oferece suporte a quais protocolos padrão de mercado para montar compartilhamentos de arquivos em clientes Windows e Linux? (Selecione DUAS opções.)",
        explanation:
            "O Azure Files disponibiliza compartilhamentos por meio dos protocolos SMB e NFS. FTP é um protocolo de transferência de arquivos e RDP é usado para área de trabalho remota, nenhum deles serve para montar compartilhamentos do Azure Files.",
        options: [
            ["SMB", true],
            ["NFS", true],
            ["FTP", false],
            ["RDP", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre os discos gerenciados (managed disks) do Azure estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Os discos gerenciados são volumes de bloco para VMs, gerenciados pelo Azure e disponíveis em vários níveis de desempenho (Standard HDD/SSD, Premium SSD, Ultra). Eles não são compartilhamentos SMB (isso é o Azure Files) nem armazenamento de objetos (isso é o Blob Storage).",
        options: [
            [
                "São gerenciados pelo Azure, que cuida automaticamente das contas de armazenamento subjacentes",
                true,
            ],
            [
                "Estão disponíveis em diferentes níveis de desempenho, como Standard HDD, Standard SSD e Premium SSD",
                true,
            ],
            [
                "São compartilhamentos de arquivos acessados exclusivamente por meio do protocolo SMB",
                false,
            ],
            [
                "São um armazenamento de objetos destinado a dados não estruturados como vídeos e imagens",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais métodos podem ser usados para autorizar o acesso aos dados de uma conta de armazenamento do Azure? (Selecione DUAS opções.)",
        explanation:
            "O acesso a uma conta de armazenamento pode ser autorizado pelo Microsoft Entra ID e por chaves de acesso da conta ou tokens SAS. Endereço MAC e nome DNS da rede virtual não são mecanismos de autorização de acesso a dados.",
        options: [
            ["Microsoft Entra ID", true],
            [
                "Chaves de acesso da conta de armazenamento (access keys) ou assinaturas de acesso compartilhado (SAS)",
                true,
            ],
            ["O endereço MAC físico do dispositivo cliente", false],
            ["O nome DNS da rede virtual do cliente", false],
        ],
    },
    {
        statement:
            "Uma equipe vai desenvolver um novo aplicativo nativo de nuvem que precisa de um banco de dados relacional totalmente gerenciado, baseado no mecanismo mais recente do SQL Server, sem ter que gerenciar o sistema operacional nem aplicar patches. Qual serviço atende melhor a esse requisito?",
        explanation:
            "O Azure SQL Database e um servico PaaS relacional totalmente gerenciado, baseado no mecanismo do SQL Server, ideal para novos aplicativos de nuvem. O SQL Server em VM e IaaS e exige gestao do SO; o Cosmos DB e NoSQL; e o MySQL nao usa o mecanismo do SQL Server.",
        options: [
            ["SQL Server em uma maquina virtual do Azure", false],
            ["Azure SQL Database", true],
            ["Azure Cosmos DB", false],
            ["Azure Database for MySQL", false],
        ],
    },
    {
        statement:
            "Um aplicativo de comercio eletronico global precisa de um banco de dados NoSQL com distribuicao em varias regioes e tempos de resposta de milissegundos de um digito para usuarios em qualquer parte do mundo. Qual servico do Azure e o mais adequado?",
        explanation:
            "O Azure Cosmos DB oferece distribuicao global chave-na-mao e latencia de milissegundos de um digito garantida por SLA, sendo ideal para cargas NoSQL globais. Os demais sao servicos relacionais ou de analise e nao fornecem esse modelo de distribuicao global NoSQL.",
        options: [
            ["Azure Cosmos DB", true],
            ["Azure SQL Database", false],
            ["Azure Synapse Analytics", false],
            ["Azure Database for PostgreSQL", false],
            ["Azure SQL Managed Instance", false],
        ],
    },
    {
        statement:
            "Uma empresa quer migrar um banco de dados SQL Server local para a nuvem com o minimo de alteracoes, mantendo recursos no nivel de instancia como SQL Server Agent, consultas entre bancos de dados e CLR. Qual opcao oferece a maior compatibilidade com o SQL Server local?",
        explanation:
            "O Azure SQL Managed Instance oferece compatibilidade quase total com o SQL Server, incluindo recursos de instancia como o SQL Server Agent, sendo ideal para migracoes lift-and-shift. O banco unico do SQL Database nao expoe todos esses recursos de instancia, e os demais nao sao compativeis com o SQL Server.",
        options: [
            ["Azure SQL Database (banco de dados unico)", false],
            ["Azure Database for MySQL", false],
            ["Azure SQL Managed Instance", true],
            ["Azure Cosmos DB", false],
        ],
    },
    {
        statement:
            "Qual opcao de banco de dados no Azure e classificada como IaaS e exige que o cliente seja responsavel por aplicar patches no sistema operacional e no proprio mecanismo do SQL Server?",
        explanation:
            "O SQL Server em uma maquina virtual e uma oferta IaaS: a Microsoft gerencia a infraestrutura fisica, mas o cliente e responsavel pelo SO e pelo SQL Server. As opcoes PaaS (SQL Database, Managed Instance e Cosmos DB) tem o patching gerenciado pela Microsoft.",
        options: [
            ["Azure SQL Database", false],
            ["Azure SQL Managed Instance", false],
            ["Azure Cosmos DB", false],
            ["SQL Server em uma maquina virtual do Azure", true],
        ],
    },
    {
        statement:
            "Qual servico do Azure foi projetado para armazenamento de dados corporativos (data warehousing) e analise de grandes volumes, combinando Big Data e recursos de data warehouse em uma unica plataforma?",
        explanation:
            "O Azure Synapse Analytics e a plataforma de analise e data warehousing do Azure, voltada a cargas OLAP em larga escala. Os demais sao bancos operacionais (OLTP) ou NoSQL, nao projetados para data warehouse.",
        options: [
            ["Azure Synapse Analytics", true],
            ["Azure Cosmos DB", false],
            ["Azure Database for MySQL", false],
            ["Azure SQL Managed Instance", false],
        ],
    },
    {
        statement:
            "Uma organizacao mantem um aplicativo de codigo aberto que ja utiliza o PostgreSQL e deseja move-lo para um servico gerenciado no Azure, preservando a compatibilidade com o mecanismo PostgreSQL. Qual servico deve ser escolhido?",
        explanation:
            "O Azure Database for PostgreSQL e o servico PaaS gerenciado compativel com o mecanismo PostgreSQL, ideal para migrar aplicacoes que ja o utilizam. O Azure SQL Database usa o mecanismo do SQL Server, e os demais nao sao bancos relacionais PostgreSQL.",
        options: [
            ["Azure SQL Database", false],
            ["Azure Database for PostgreSQL", true],
            ["Azure Cosmos DB", false],
            ["Azure Synapse Analytics", false],
        ],
    },
    {
        statement:
            "Quais das seguintes APIs sao compativeis com o Azure Cosmos DB? (Selecione DUAS opcoes.)",
        explanation:
            "O Azure Cosmos DB oferece varias APIs, incluindo NoSQL, MongoDB, Apache Cassandra, Gremlin e Table. Nao existem APIs do Cosmos DB para Oracle, SQL Server ou IBM Db2.",
        options: [
            ["API para MongoDB", true],
            ["API para Apache Cassandra", true],
            ["API para Oracle Database", false],
            ["API para Microsoft SQL Server", false],
            ["API para IBM Db2", false],
        ],
    },
    {
        statement:
            "Uma empresa esta comparando o SQL Server em uma VM (IaaS) com o Azure SQL Database (PaaS). Quais DUAS tarefas sao gerenciadas pela Microsoft no Azure SQL Database, mas seriam responsabilidade do cliente na VM? (Selecione DUAS opcoes.)",
        explanation:
            "No modelo PaaS do Azure SQL Database, a Microsoft cuida do patching e dos backups automaticos, o que na VM (IaaS) seria responsabilidade do cliente. Definir o esquema e escrever consultas sao sempre responsabilidade do cliente, em qualquer modelo.",
        options: [
            ["Aplicar patches no sistema operacional e no mecanismo do banco", true],
            ["Configurar e executar backups automaticos do banco de dados", true],
            ["Definir o esquema das tabelas e os indices do aplicativo", false],
            ["Escrever as consultas SQL usadas pelo aplicativo", false],
        ],
    },
    {
        statement:
            "Uma aplicacao precisa armazenar documentos JSON com esquema flexivel, sem uma estrutura rigida de tabelas e colunas. Qual servico de banco de dados e o mais apropriado?",
        explanation:
            "O Azure Cosmos DB e um banco NoSQL adequado para dados semiestruturados, como documentos JSON com esquema flexivel. Os demais sao bancos relacionais que exigem um esquema definido de tabelas e colunas.",
        options: [
            ["Azure SQL Database", false],
            ["Azure SQL Managed Instance", false],
            ["Azure Cosmos DB", true],
            ["Azure Database for MySQL", false],
        ],
    },
    {
        statement:
            "Uma equipe tem um banco no Azure SQL Database com uso intermitente e imprevisivel e quer pagar pela computacao apenas quando o banco estiver em uso, pausando-o automaticamente quando ocioso. Qual opcao atende a esse cenario?",
        explanation:
            "A camada de computacao sem servidor (serverless) do Azure SQL Database escala a computacao automaticamente e pausa o banco quando ocioso, cobrando apenas pelo uso. As outras opcoes mantem recursos alocados ou ativos e nao pausam automaticamente dessa forma.",
        options: [
            ["A camada de computacao sem servidor (serverless) do Azure SQL Database", true],
            ["SQL Server em uma maquina virtual sempre ligada", false],
            ["Um pool dedicado do Azure Synapse Analytics", false],
            ["Azure Cosmos DB com throughput provisionado manualmente", false],
        ],
    },
    {
        statement:
            "Um provedor de SaaS hospeda centenas de bancos no Azure SQL Database, cada um com picos de uso em horarios diferentes, e quer compartilhar e otimizar os recursos de computacao entre eles para reduzir custos. Qual recurso ele deve usar?",
        explanation:
            "Os pools elasticos permitem que varios bancos do Azure SQL Database compartilhem um conjunto de recursos, otimizando custos quando os picos ocorrem em momentos diferentes. As outras opcoes nao oferecem esse compartilhamento de recursos entre muitos bancos relacionais.",
        options: [
            ["SQL Server em uma unica maquina virtual", false],
            ["Azure Cosmos DB com distribuicao global", false],
            ["Azure Synapse Analytics", false],
            ["Pools elasticos (elastic pools) do Azure SQL Database", true],
        ],
    },
    {
        statement:
            "Qual servico do Azure e projetado especificamente para migrar bancos de dados de origens locais para servicos de dados do Azure com o minimo de tempo de inatividade?",
        explanation:
            "O Azure Database Migration Service foi criado para migrar bancos de dados locais para o Azure com tempo de inatividade minimo. O Synapse e para analise, o Azure Monitor e para monitoramento e o Azure Policy e para governanca.",
        options: [
            ["Azure Database Migration Service", true],
            ["Azure Synapse Analytics", false],
            ["Azure Monitor", false],
            ["Azure Policy", false],
        ],
    },
    {
        statement:
            "A distribuicao global 'chave-na-mao' (turnkey) e um dos principais beneficios do Azure Cosmos DB. O que esse recurso permite?",
        explanation:
            "A distribuicao global chave-na-mao do Cosmos DB permite replicar os dados e adicionar ou remover regioes a qualquer momento, sem tempo de inatividade da aplicacao. As demais alternativas descrevem o Synapse, o SQL Managed Instance e o modelo IaaS, respectivamente.",
        options: [
            ["Executar consultas OLAP em um data warehouse dedicado", false],
            [
                "Adicionar ou remover regioes do Azure associadas a conta a qualquer momento, sem indisponibilidade da aplicacao",
                true,
            ],
            ["Garantir compatibilidade total com os recursos de instancia do SQL Server", false],
            ["Hospedar maquinas virtuais Windows e Linux para o banco de dados", false],
        ],
    },
    {
        statement:
            "Uma empresa executa um site WordPress que depende de um banco de dados MySQL e deseja um servico totalmente gerenciado no Azure, sem administrar servidores. Qual servico e o mais indicado?",
        explanation:
            "O Azure Database for MySQL e o servico PaaS gerenciado compativel com o mecanismo MySQL, ideal para aplicacoes como o WordPress. As demais opcoes nao sao compativeis com o mecanismo MySQL.",
        options: [
            ["Azure SQL Database", false],
            ["Azure Cosmos DB", false],
            ["Azure Database for MySQL", true],
            ["Azure SQL Managed Instance", false],
        ],
    },
    {
        statement:
            "Qual afirmacao descreve corretamente a diferenca entre as cargas de trabalho OLTP e OLAP no contexto dos bancos de dados do Azure?",
        explanation:
            "O OLTP (processamento de transacoes) trata de muitas transacoes curtas e frequentes, como no Azure SQL Database, enquanto o OLAP (processamento analitico) foca em analises complexas sobre grandes volumes, como no Azure Synapse Analytics. As demais afirmacoes invertem ou confundem os conceitos.",
        options: [
            [
                "O OLTP lida com muitas transacoes pequenas e frequentes, enquanto o OLAP e voltado a consultas analiticas complexas sobre grandes volumes de dados",
                true,
            ],
            [
                "O OLTP e usado apenas para data warehouses, enquanto o OLAP processa transacoes em tempo real",
                false,
            ],
            ["OLTP e OLAP sao sinonimos e descrevem o mesmo tipo de carga de trabalho", false],
            [
                "O OLAP e exclusivo de bancos NoSQL, enquanto o OLTP e exclusivo de bancos relacionais",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais das seguintes opcoes sao servicos de banco de dados relacional totalmente gerenciados (PaaS) baseados em mecanismos de codigo aberto no Azure? (Selecione DUAS opcoes.)",
        explanation:
            "O Azure Database for MySQL e o Azure Database for PostgreSQL sao servicos PaaS gerenciados baseados em mecanismos de codigo aberto. O SQL Server em VM e IaaS, e o Cosmos DB e um banco NoSQL, nao um servico relacional de codigo aberto.",
        options: [
            ["Azure Database for MySQL", true],
            ["Azure Database for PostgreSQL", true],
            ["SQL Server em uma maquina virtual do Azure", false],
            ["Azure Cosmos DB", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure oferece gerenciamento de identidade e acesso baseado em nuvem, permitindo que usuários façam login e acessem recursos internos e externos?",
        explanation:
            "O Microsoft Entra ID (antigo Azure Active Directory) é o serviço de gerenciamento de identidade e acesso em nuvem. Azure Policy trata governança, Azure Monitor trata observabilidade e o Defender for Cloud trata postura de segurança.",
        options: [
            ["Microsoft Entra ID", true],
            ["Azure Policy", false],
            ["Azure Monitor", false],
            ["Microsoft Defender for Cloud", false],
        ],
    },
    {
        statement: "No contexto de identidade, o que a autenticação (authentication) verifica?",
        explanation:
            "A autenticação (AuthN) prova a identidade, confirmando que você é quem diz ser. Determinar o que você pode acessar é papel da autorização (AuthZ); as demais opções não se referem a identidade.",
        options: [
            [
                "A identidade de quem está tentando acessar, confirmando que a pessoa é quem diz ser",
                true,
            ],
            ["Quais recursos e ações a pessoa tem permissão de usar", false],
            ["O custo dos recursos consumidos pelo usuário", false],
            ["A região onde os dados do usuário estão armazenados", false],
        ],
    },
    {
        statement:
            "Depois que um usuário é autenticado no Microsoft Entra ID, qual processo determina a quais recursos ele pode acessar e quais ações pode executar?",
        explanation:
            "A autorização define o nível de acesso e as permissões de um usuário já autenticado. A autenticação apenas prova a identidade; criptografia e federação são outros conceitos.",
        options: [
            ["Autorização (authorization)", true],
            ["Autenticação (authentication)", false],
            ["Criptografia", false],
            ["Federação", false],
        ],
    },
    {
        statement:
            "A autenticação multifator (MFA) exige duas ou mais formas de verificação de categorias diferentes. Quais dos itens a seguir são exemplos válidos desses fatores? (Selecione DUAS opções.)",
        explanation:
            "A MFA combina fatores de categorias distintas: algo que você sabe (senha) e algo que você tem (celular/token) ou algo que você é (biometria). Nome de usuário, e-mail e nome de grupo de recursos são apenas identificadores, não fatores de autenticação.",
        options: [
            ["Uma senha memorizada (algo que você sabe)", true],
            [
                "Um código gerado pelo aplicativo Microsoft Authenticator no celular (algo que você tem)",
                true,
            ],
            ["O nome de usuário da conta", false],
            ["O endereço de e-mail corporativo", false],
            ["O nome do grupo de recursos", false],
        ],
    },
    {
        statement:
            "Qual é o principal benefício do logon único (SSO - single sign-on) para os usuários?",
        explanation:
            "O SSO permite que o usuário se autentique uma vez e reutilize essa sessão para acessar vários aplicativos. Ele não elimina a autenticação, não criptografa discos nem reduz custos de assinatura.",
        options: [
            [
                "Autenticar-se uma única vez e acessar vários aplicativos sem precisar informar as credenciais novamente",
                true,
            ],
            ["Eliminar totalmente a necessidade de autenticação", false],
            ["Criptografar automaticamente todos os discos das máquinas virtuais", false],
            ["Reduzir o custo das assinaturas do Azure", false],
        ],
    },
    {
        statement:
            "Qual recurso do Microsoft Entra ID usa políticas do tipo se-então para conceder ou bloquear o acesso com base em sinais como usuário, localização, dispositivo e risco?",
        explanation:
            "O Acesso Condicional avalia sinais e aplica decisões (permitir, bloquear ou exigir MFA). O RBAC trata permissões em recursos do Azure, NSGs filtram tráfego de rede e o Entra Connect sincroniza identidades híbridas.",
        options: [
            ["Acesso Condicional (Conditional Access)", true],
            ["Azure RBAC", false],
            ["Grupos de segurança de rede (NSG)", false],
            ["Microsoft Entra Connect", false],
        ],
    },
    {
        statement:
            "Quais dos seguintes sinais o Acesso Condicional do Microsoft Entra ID pode avaliar para decidir se concede acesso? (Selecione DUAS opções.)",
        explanation:
            "O Acesso Condicional considera sinais como localização/IP, estado do dispositivo, aplicativo, usuário/grupo e risco em tempo real. Tema do portal, núcleos de CPU e nome DNS não são sinais de identidade.",
        options: [
            ["A localização de rede (endereço IP) de onde parte a solicitação", true],
            ["O estado do dispositivo usado no acesso, por exemplo, se está em conformidade", true],
            ["A cor do tema do portal escolhida pelo usuário", false],
            ["O número de núcleos de CPU da máquina virtual de destino", false],
            ["O nome DNS público do balanceador de carga", false],
        ],
    },
    {
        statement:
            "Qual serviço permite conceder permissões granulares a usuários, grupos e aplicativos sobre recursos do Azure por meio da atribuição de funções?",
        explanation:
            "O Azure RBAC atribui funções (roles) em escopos para conceder acesso granular a recursos. MFA e SSO tratam de autenticação, e o Defender for Cloud trata de postura e proteção contra ameaças.",
        options: [
            ["Controle de acesso baseado em função do Azure (Azure RBAC)", true],
            ["Autenticação multifator (MFA)", false],
            ["Logon único (SSO)", false],
            ["Microsoft Defender for Cloud", false],
        ],
    },
    {
        statement: "Em qual dos escopos a seguir NÃO é possível atribuir uma função do Azure RBAC?",
        explanation:
            "As funções do RBAC são atribuídas em quatro níveis de escopo: grupo de gerenciamento, assinatura, grupo de recursos e recurso. O usuário é quem recebe a atribuição, não é um escopo onde a função se aplica.",
        options: [
            ["Em um usuário individual do Microsoft Entra ID", true],
            ["Em um grupo de gerenciamento (management group)", false],
            ["Em uma assinatura (subscription)", false],
            ["Em um grupo de recursos (resource group)", false],
            ["Em um recurso individual", false],
        ],
    },
    {
        statement:
            "A um usuário foi atribuída a função interna Leitor (Reader) em um grupo de recursos. O que esse usuário pode fazer?",
        explanation:
            "A função Leitor concede acesso somente de visualização. Criar ou excluir recursos exige Colaborador ou Proprietário, e gerenciar o acesso de outros exige Proprietário ou Administrador de Acesso de Usuário.",
        options: [
            ["Apenas visualizar os recursos existentes no grupo de recursos, sem alterá-los", true],
            ["Criar e excluir recursos no grupo de recursos", false],
            ["Gerenciar o acesso de outros usuários ao grupo de recursos", false],
            ["Alterar as configurações de todos os recursos, mas não excluí-los", false],
        ],
    },
    {
        statement:
            "Qual é a principal diferença entre as funções internas Proprietário (Owner) e Colaborador (Contributor) no Azure RBAC?",
        explanation:
            "O Proprietário tem acesso total, incluindo delegar acesso (atribuir funções). O Colaborador pode criar e gerenciar recursos, mas não pode conceder acesso a outros usuários.",
        options: [
            [
                "O Proprietário pode gerenciar o acesso de outros usuários (atribuir funções); o Colaborador pode gerenciar recursos, mas não conceder acesso a outros",
                true,
            ],
            ["O Colaborador tem acesso total e o Proprietário tem apenas leitura", false],
            [
                "O Proprietário só pode ver os recursos, enquanto o Colaborador pode alterá-los",
                false,
            ],
            ["Não há diferença; as duas funções são idênticas", false],
        ],
    },
    {
        statement:
            "Quais dos itens a seguir são princípios orientadores do modelo de segurança Zero Trust? (Selecione DUAS opções.)",
        explanation:
            "Os três princípios do Zero Trust são verificar explicitamente, usar o acesso de menor privilégio e assumir violação. Confiar na rede interna, dar acesso de administrador a todos ou desativar a autenticação contrariam diretamente o modelo.",
        options: [
            ["Verificar explicitamente cada solicitação de acesso", true],
            ["Usar o acesso de menor privilégio", true],
            ["Confiar automaticamente em tudo que vem da rede interna", false],
            ["Conceder acesso de administrador a todos os usuários", false],
            ["Desativar a autenticação dentro do perímetro corporativo", false],
        ],
    },
    {
        statement:
            "No modelo de segurança moderno adotado pela Microsoft, o que passou a ser considerado o principal perímetro de segurança de uma organização?",
        explanation:
            "Com usuários e recursos frequentemente fora da rede corporativa tradicional, a identidade tornou-se o novo plano de controle e o principal perímetro de segurança. Firewalls, cabos e senhas de BIOS protegem elementos específicos, mas não são o perímetro primário no modelo atual.",
        options: [
            ["A identidade (identity)", true],
            ["O firewall físico do datacenter", false],
            ["O cabeamento de rede", false],
            ["A senha de BIOS dos servidores", false],
        ],
    },
    {
        statement:
            "O que descreve corretamente a abordagem de defesa em profundidade (defense in depth)?",
        explanation:
            "A defesa em profundidade usa múltiplas camadas independentes (física, identidade, perímetro, rede, computação, aplicativo e dados) para retardar e conter ataques. Depender de uma única camada é justamente o que a abordagem evita.",
        options: [
            [
                "Usar várias camadas de proteção, de modo que, se uma for comprometida, outras ainda protejam os dados",
                true,
            ],
            [
                "Concentrar todo o investimento de segurança em um único firewall de perímetro",
                false,
            ],
            ["Depender exclusivamente da criptografia de dados como única proteção", false],
            ["Proteger apenas a camada física do datacenter", false],
        ],
    },
    {
        statement:
            "Quais dos itens a seguir são camadas do modelo de defesa em profundidade? (Selecione DUAS opções.)",
        explanation:
            "As camadas incluem física, identidade e acesso, perímetro, rede, computação, aplicativo e dados. Faturamento, suporte técnico e marketing não são camadas de segurança do modelo.",
        options: [
            ["Camada de identidade e acesso", true],
            ["Camada de rede", true],
            ["Camada de faturamento", false],
            ["Camada de suporte técnico", false],
            ["Camada de marketing", false],
        ],
    },
    {
        statement:
            "Qual serviço monitora continuamente a postura de segurança de recursos no Azure, no ambiente local e em outras nuvens, oferecendo recomendações e proteção contra ameaças?",
        explanation:
            "O Microsoft Defender for Cloud (antigo Azure Security Center) avalia a postura de segurança e protege cargas de trabalho em ambientes híbridos e multinuvem. O Entra ID trata identidade, o Backup trata cópias e o DNS trata resolução de nomes.",
        options: [
            ["Microsoft Defender for Cloud", true],
            ["Microsoft Entra ID", false],
            ["Azure Backup", false],
            ["Azure DNS", false],
        ],
    },
    {
        statement:
            "No Microsoft Defender for Cloud, o que a Pontuação de Segurança (Secure Score) representa?",
        explanation:
            "A Secure Score resume a postura de segurança e orienta a priorização de melhorias; quanto maior a pontuação, menor o nível de risco identificado. Ela não mede custo, contagem de VMs nem SLA.",
        options: [
            [
                "Uma medida da postura de segurança que ajuda a priorizar ações; quanto maior a pontuação, menor o nível de risco identificado",
                true,
            ],
            ["O custo mensal estimado dos recursos de segurança", false],
            ["A quantidade de máquinas virtuais em execução na assinatura", false],
            ["O tempo de atividade garantido pelo SLA dos serviços", false],
        ],
    },
    {
        statement: "Uma empresa quer entender o Microsoft Entra ID. Qual afirmação está correta?",
        explanation:
            "O Entra ID é um serviço de identidade em nuvem com protocolos web (SAML, OAuth, OpenID Connect) e estrutura própria; não é o AD DS local hospedado na nuvem nem usa unidades organizacionais e Group Policy. Ele também não elimina a autenticação.",
        options: [
            [
                "O Microsoft Entra ID é um serviço de identidade em nuvem e não é simplesmente o Active Directory Domain Services (AD DS) local hospedado na nuvem",
                true,
            ],
            [
                "O Microsoft Entra ID é idêntico ao AD DS local, apenas executado em uma máquina virtual",
                false,
            ],
            [
                "O Microsoft Entra ID usa unidades organizacionais (OUs) e Group Policy da mesma forma que o AD DS",
                false,
            ],
            ["O Microsoft Entra ID substitui a necessidade de qualquer autenticação", false],
        ],
    },
    {
        statement:
            "Qual dos métodos a seguir é um exemplo de autenticação sem senha (passwordless) com o Microsoft Entra ID?",
        explanation:
            "Os métodos passwordless incluem chaves de segurança FIDO2, Windows Hello for Business e o aplicativo Microsoft Authenticator. Usar senha não é passwordless, e assinatura ou IP não são métodos de autenticação de usuário.",
        options: [
            ["Entrar usando uma chave de segurança FIDO2", true],
            ["Digitar apenas o nome de usuário e a senha", false],
            ["Informar o número da assinatura do Azure", false],
            ["Usar o endereço IP público da máquina", false],
        ],
    },
    {
        statement:
            "Qual recurso do Microsoft Entra ID permite que os próprios usuários redefinam suas senhas sem acionar o suporte técnico?",
        explanation:
            "O SSPR permite que os usuários redefinam suas senhas de forma autônoma, reduzindo chamados de suporte. O Acesso Condicional controla acesso, o RBAC concede permissões e o Defender for Cloud trata postura de segurança.",
        options: [
            ["Redefinição de senha self-service (SSPR - self-service password reset)", true],
            ["Acesso Condicional", false],
            ["Azure RBAC", false],
            ["Microsoft Defender for Cloud", false],
        ],
    },
    {
        statement:
            "Sua organização precisa dar a parceiros externos acesso a alguns aplicativos, permitindo que usem as próprias credenciais. Qual recurso do Microsoft Entra ID atende a isso?",
        explanation:
            "As Identidades Externas (colaboração B2B) permitem convidar usuários externos, que se autenticam com as próprias credenciais para acessar recursos. Máquinas virtuais, DNS e contas de armazenamento não gerenciam colaboração de identidades externas.",
        options: [
            ["Colaboração B2B com identidades externas (usuários convidados)", true],
            ["Máquinas virtuais do Azure", false],
            ["Zonas do Azure DNS", false],
            ["Contas de armazenamento", false],
        ],
    },
    {
        statement: "O princípio do menor privilégio (least privilege) recomenda que:",
        explanation:
            "O menor privilégio limita o acesso ao mínimo necessário para a tarefa, reduzindo a superfície de ataque. Dar acesso de administrador a todos ou nunca revisar permissões aumenta o risco, e negar todo acesso inviabilizaria o trabalho.",
        options: [
            [
                "Os usuários recebam apenas as permissões necessárias para realizar suas tarefas, e nada além disso",
                true,
            ],
            ["Todos os usuários recebam permissões de administrador para evitar bloqueios", false],
            ["As permissões sejam concedidas de forma permanente e nunca revisadas", false],
            ["Ninguém tenha qualquer permissão nos recursos", false],
        ],
    },
    {
        statement: "O que são os padrões de segurança (security defaults) do Microsoft Entra ID?",
        explanation:
            "Os padrões de segurança oferecem proteções básicas e gratuitas, como exigir o registro e o uso de MFA e bloquear autenticação legada. Não são um relatório de custos nem um balanceador, e, embora mais simples que o Acesso Condicional, não o substituem por completo.",
        options: [
            [
                "Um conjunto gratuito de configurações básicas de segurança, que inclui exigir o registro e o uso de MFA",
                true,
            ],
            ["Um serviço pago que substitui totalmente o Acesso Condicional", false],
            ["Um relatório de custos das assinaturas", false],
            ["Uma ferramenta de balanceamento de carga de rede", false],
        ],
    },
    {
        statement:
            "Qual recurso permite que um recurso do Azure (como uma máquina virtual) se autentique em serviços que suportam o Microsoft Entra ID sem armazenar credenciais no código?",
        explanation:
            "As identidades gerenciadas fornecem uma identidade automática para recursos do Azure se autenticarem sem credenciais no código. NSGs filtram rede, Blueprints padronizam implantações e tags apenas organizam recursos.",
        options: [
            ["Identidades gerenciadas (managed identities) do Microsoft Entra ID", true],
            ["Grupos de segurança de rede (NSG)", false],
            ["Azure Blueprints", false],
            ["Marcadores (tags) de recursos", false],
        ],
    },
    {
        statement:
            "Uma empresa tem um Active Directory local e quer sincronizar essas identidades com o Microsoft Entra ID para habilitar a identidade híbrida. Qual ferramenta é usada?",
        explanation:
            "O Microsoft Entra Connect sincroniza identidades do AD local com o Entra ID, habilitando cenários híbridos e SSO. O Bastion trata acesso remoto seguro, o Load Balancer distribui tráfego e o Cost Management trata custos.",
        options: [
            ["Microsoft Entra Connect", true],
            ["Azure Bastion", false],
            ["Azure Load Balancer", false],
            ["Azure Cost Management", false],
        ],
    },
    {
        statement:
            "Por que habilitar a autenticação multifator (MFA) melhora significativamente a segurança das contas?",
        explanation:
            "A MFA adiciona uma camada extra; mesmo que a senha seja comprometida, o invasor ainda precisaria do segundo fator para entrar. Ela não elimina o uso de senha, não é um mecanismo de criptografia de rede nem reduz custos de licença.",
        options: [
            [
                "Mesmo que a senha seja comprometida, o invasor ainda precisaria do segundo fator para entrar",
                true,
            ],
            ["Ela torna as senhas desnecessárias e elimina qualquer risco", false],
            ["Ela criptografa todo o tráfego de rede da assinatura", false],
            ["Ela reduz automaticamente o custo das licenças do Microsoft Entra ID", false],
        ],
    },
    {
        statement:
            "Uma empresa deseja impor que os recursos sejam criados apenas em regiões aprovadas e avaliar continuamente se os recursos existentes seguem os padrões corporativos. Qual serviço do Azure atende diretamente a esse objetivo?",
        explanation:
            "O Azure Policy cria, atribui e gerencia políticas que impõem regras aos recursos e avaliam continuamente a conformidade, inclusive restringindo as regiões permitidas. O Advisor apenas recomenda, o Entra ID cuida de identidade e o Cost Management, de custos.",
        options: [
            ["Azure Policy", true],
            ["Azure Advisor", false],
            ["Microsoft Entra ID", false],
            ["Microsoft Cost Management", false],
        ],
    },
    {
        statement:
            "Qual efeito (effect) de uma definição do Azure Policy bloqueia a criação ou a atualização de um recurso que não cumpre a regra definida?",
        explanation:
            "O efeito Deny impede a criação/atualização de recursos não conformes. Audit apenas registra a não conformidade, Append adiciona campos ao recurso e Disabled desativa a atribuição da política.",
        options: [
            ["Deny", true],
            ["Audit", false],
            ["Append", false],
            ["Disabled", false],
        ],
    },
    {
        statement:
            "Como é chamado o agrupamento de várias definições de política do Azure organizadas para atingir um objetivo de conformidade maior e atribuídas em conjunto?",
        explanation:
            "Uma iniciativa (policy set/initiative) reúne várias definições de política com um objetivo comum, facilitando a atribuição e o acompanhamento. Blueprint empacota artefatos, grupo de gerenciamento organiza assinaturas e bloqueio protege recursos contra alterações ou exclusões.",
        options: [
            ["Iniciativa (conjunto de políticas)", true],
            ["Azure Blueprint", false],
            ["Grupo de gerenciamento", false],
            ["Bloqueio de recurso", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente a diferença entre o Azure Policy e o controle de acesso baseado em função (RBAC) do Azure?",
        explanation:
            "O Azure Policy foca nas propriedades dos recursos (conformidade), enquanto o RBAC foca no que cada identidade pode fazer; eles são complementares. As demais opções trocam os papéis dos serviços ou os tratam como substitutos.",
        options: [
            [
                "O Azure Policy avalia as propriedades dos recursos para garantir conformidade, enquanto o RBAC define quais ações cada identidade pode executar.",
                true,
            ],
            [
                "O Azure Policy concede permissões a usuários, enquanto o RBAC audita as propriedades dos recursos.",
                false,
            ],
            [
                "Ambos servem exclusivamente para conceder permissões a usuários em diferentes escopos.",
                false,
            ],
            ["O Azure Policy substitui totalmente o RBAC em ambientes corporativos.", false],
        ],
    },
    {
        statement:
            "Uma equipe quer que o Azure Policy, além de detectar recursos não conformes, implante automaticamente a configuração ausente (por exemplo, habilitar as configurações de diagnóstico). Qual efeito de política possibilita essa remediação automática?",
        explanation:
            "O efeito DeployIfNotExists implanta a configuração relacionada quando ela está ausente, viabilizando a remediação automática. Deny bloqueia, Audit apenas registra e Disabled desativa a atribuição da política.",
        options: [
            ["DeployIfNotExists", true],
            ["Deny", false],
            ["Audit", false],
            ["Disabled", false],
        ],
    },
    {
        statement:
            "Quais são os dois tipos de bloqueio de recursos (resource locks) disponíveis no Azure? (Selecione DUAS opções.)",
        explanation:
            "Existem apenas dois tipos: ReadOnly (permite ler, mas não modificar nem excluir) e CanNotDelete/Delete (permite ler e modificar, mas não excluir). WriteOnly, NoRead e OwnerOnly não existem no Azure.",
        options: [
            ["Somente leitura (ReadOnly)", true],
            ["Não é possível excluir (CanNotDelete/Delete)", true],
            ["Somente gravação (WriteOnly)", false],
            ["Sem leitura (NoRead)", false],
            ["Somente proprietário (OwnerOnly)", false],
        ],
    },
    {
        statement:
            "Um administrador aplica um bloqueio do tipo Somente Leitura (ReadOnly) a um grupo de recursos. O que os usuários autorizados podem fazer com os recursos desse grupo?",
        explanation:
            "O bloqueio ReadOnly restringe as ações à leitura, impedindo modificações e exclusões. A opção 'ler e modificar, mas não excluir' descreve o bloqueio CanNotDelete, não o ReadOnly.",
        options: [
            ["Podem ler os recursos, mas não podem modificá-los nem excluí-los.", true],
            ["Podem ler e modificar, mas não excluir os recursos.", false],
            ["Podem excluir os recursos, mas não modificá-los.", false],
            ["Podem realizar qualquer operação normalmente.", false],
        ],
    },
    {
        statement:
            "Por padrão, quais funções internas do Azure têm permissão para criar e excluir bloqueios de recursos (resource locks)?",
        explanation:
            "Gerenciar bloqueios exige a ação Microsoft.Authorization/locks/*, concedida por padrão às funções Proprietário e Administrador de Acesso de Usuário. Contributor e Reader não possuem essa permissão.",
        options: [
            [
                "Proprietário (Owner) e Administrador de Acesso de Usuário (User Access Administrator)",
                true,
            ],
            ["Colaborador (Contributor) e Leitor (Reader)", false],
            ["Leitor (Reader) e Colaborador de Máquina Virtual", false],
            ["Somente o Administrador Global do Microsoft Entra", false],
        ],
    },
    {
        statement:
            "Um bloqueio Somente Leitura é aplicado no escopo da assinatura e um bloqueio 'Não é possível excluir' é aplicado a um grupo de recursos dentro dela. Qual bloqueio prevalece para os recursos desse grupo?",
        explanation:
            "Bloqueios são herdados dos escopos superiores e, havendo mais de um, o mais restritivo prevalece. Portanto, o ReadOnly herdado da assinatura tem precedência sobre o CanNotDelete do grupo de recursos.",
        options: [
            ["O mais restritivo, ou seja, o Somente Leitura.", true],
            ["O aplicado mais recentemente.", false],
            ["O do grupo de recursos, que sempre substitui o da assinatura.", false],
            ["Nenhum, pois bloqueios em escopos diferentes se anulam.", false],
        ],
    },
    {
        statement: "O que são tags (marcas) de recursos no Azure?",
        explanation:
            "Tags são metadados de nome-valor usados para organizar e categorizar recursos, por exemplo por centro de custo ou ambiente. Impedir exclusão é papel dos bloqueios e conceder permissões é papel do RBAC.",
        options: [
            [
                "Pares de nome-valor (metadados) aplicados a recursos para organizá-los e categorizá-los logicamente.",
                true,
            ],
            ["Regras que impedem a exclusão acidental de recursos.", false],
            ["Modelos que implantam recursos automaticamente.", false],
            ["Funções que concedem permissões de acesso a usuários.", false],
        ],
    },
    {
        statement:
            "Uma organização quer relatar os custos do Azure por departamento (RH, Vendas e TI), mesmo com recursos espalhados por vários grupos de recursos. Qual abordagem atende a esse objetivo?",
        explanation:
            "Tags categorizam os recursos por departamento e o Microsoft Cost Management permite agrupar/filtrar os custos por essas tags. Bloqueios, blueprints e mudança de região não realizam esse rateio de custos.",
        options: [
            [
                "Aplicar tags de recursos e agrupar/filtrar os custos por tag no Microsoft Cost Management.",
                true,
            ],
            ["Aplicar um bloqueio Somente Leitura em cada grupo de recursos.", false],
            ["Criar um Azure Blueprint para cada departamento.", false],
            ["Mover todos os recursos para uma única região.", false],
        ],
    },
    {
        statement:
            "Por padrão, um recurso do Azure herda automaticamente as tags aplicadas ao seu grupo de recursos ou à assinatura?",
        explanation:
            "As tags não são herdadas por padrão do grupo de recursos ou da assinatura; para propagá-las usa-se o Azure Policy (efeitos como modify/append). Grupos de recursos podem, sim, receber tags.",
        options: [
            [
                "Não; as tags não são herdadas por padrão, sendo necessário aplicá-las ao recurso ou usar o Azure Policy para forçar a herança.",
                true,
            ],
            ["Sim; todos os recursos herdam automaticamente as tags do grupo de recursos.", false],
            ["Sim; porém apenas as tags aplicadas à assinatura são herdadas.", false],
            ["Não; o Azure não permite aplicar tags a grupos de recursos.", false],
        ],
    },
    {
        statement:
            "Quais são finalidades válidas para o uso de tags de recursos no Azure? (Selecione DUAS opções.)",
        explanation:
            "Tags servem para organização, relatórios de custo, automação e operação, pois são metadados. Elas não criptografam dados, não impedem exclusão (função dos bloqueios) nem concedem permissões (função do RBAC).",
        options: [
            ["Organizar recursos para relatórios de custo e cobrança.", true],
            [
                "Agrupar recursos por ambiente (produção, desenvolvimento) para operação e automação.",
                true,
            ],
            ["Criptografar automaticamente os dados armazenados no recurso.", false],
            ["Impedir a exclusão acidental de um recurso.", false],
            ["Conceder permissões administrativas a um usuário.", false],
        ],
    },
    {
        statement:
            "Qual solução da Microsoft oferece governança unificada de dados, permitindo descobrir, mapear, classificar e catalogar dados em ambientes locais, multinuvem e SaaS?",
        explanation:
            "O Microsoft Purview fornece governança de dados unificada com mapa de dados, catálogo e classificação em ambientes híbridos e multinuvem. O Entra ID cuida de identidade, o Azure Policy da conformidade de recursos e o Service Trust Portal de documentos de auditoria.",
        options: [
            ["Microsoft Purview", true],
            ["Microsoft Entra ID", false],
            ["Azure Policy", false],
            ["Service Trust Portal", false],
        ],
    },
    {
        statement:
            "Quais recursos fazem parte do Microsoft Purview para governança de dados? (Selecione DUAS opções.)",
        explanation:
            "O Microsoft Purview inclui o mapa de dados (verificação e classificação automatizadas) e o catálogo de dados pesquisável com linhagem. Balanceamento de carga e provisionamento de VMs pertencem a serviços de rede e computação, não à governança de dados.",
        options: [
            ["Mapa de dados que verifica e classifica automaticamente os ativos de dados.", true],
            ["Catálogo de dados unificado e pesquisável, com linhagem de dados.", true],
            ["Balanceamento de carga do tráfego de rede entre máquinas virtuais.", false],
            ["Provisionamento automático de clusters de máquinas virtuais.", false],
        ],
    },
    {
        statement:
            "Onde um cliente pode obter relatórios de auditoria independentes (como ISO e SOC) e documentos de conformidade sobre os serviços de nuvem da Microsoft?",
        explanation:
            "O Service Trust Portal disponibiliza relatórios de auditoria de terceiros, documentos de segurança/privacidade e materiais de conformidade da Microsoft. As demais ferramentas não fornecem relatórios de auditoria independentes.",
        options: [
            ["Service Trust Portal", true],
            ["Painel de Bloqueios do Azure Portal", false],
            ["Centro de administração do Microsoft Entra", false],
            ["Azure Resource Graph Explorer", false],
        ],
    },
    {
        statement:
            "No contexto do Azure, o que são as 'ofertas de conformidade' (compliance offerings), como ISO 27001, PCI DSS e HIPAA?",
        explanation:
            "As ofertas de conformidade são certificações e atestados (globais, regionais e setoriais) que demonstram a aderência do Azure a normas. Não são SKUs de VM, planos de suporte nem bloqueios de recursos.",
        options: [
            [
                "Certificações e atestados que comprovam que os serviços atendem a padrões regulatórios e do setor.",
                true,
            ],
            ["Tipos de máquinas virtuais otimizadas para cargas reguladas.", false],
            ["Planos de suporte pagos da Microsoft.", false],
            ["Bloqueios que impedem alterações em recursos regulados.", false],
        ],
    },
    {
        statement:
            "Qual ferramenta ajuda a avaliar e gerenciar a conformidade regulatória, fornecendo uma pontuação de conformidade (compliance score) e recomendações de melhoria?",
        explanation:
            "O Gerenciador de Conformidade (Compliance Manager), disponível no portal de conformidade do Microsoft Purview e no Service Trust Portal, calcula uma pontuação de conformidade e recomenda ações. O Advisor foca em custo/desempenho/segurança e o Monitor em telemetria, não em pontuação regulatória.",
        options: [
            ["Gerenciador de Conformidade (Compliance Manager)", true],
            ["Azure Advisor", false],
            ["Azure Monitor", false],
            ["Bloqueios de recursos", false],
        ],
    },
    {
        statement:
            "Uma empresa possui 30 assinaturas e precisa aplicar as mesmas políticas e atribuições de acesso a todas elas de uma só vez. Qual recurso do Azure deve ser utilizado?",
        explanation:
            "Grupos de gerenciamento organizam várias assinaturas em uma hierarquia, permitindo aplicar políticas e RBAC que são herdados por todas as assinaturas contidas. Grupos de recursos agrupam recursos dentro de uma assinatura, não assinaturas inteiras.",
        options: [
            ["Grupos de gerenciamento (management groups)", true],
            ["Grupos de recursos", false],
            ["Bloqueios de recursos", false],
            ["Tags de recursos", false],
        ],
    },
    {
        statement:
            "Quais dos seguintes fatores podem influenciar o custo dos recursos no Azure? (Selecione DUAS opções.)",
        explanation:
            "O preço varia conforme a região do datacenter e o tipo/tamanho (SKU) do recurso. Nome de grupo de recursos, quantidade de tags e o tema do portal não alteram o valor cobrado.",
        options: [
            ["A região (localização do datacenter) onde o recurso é implantado", true],
            ["O tipo e o tamanho (SKU) do recurso provisionado", true],
            ["O nome atribuído ao grupo de recursos", false],
            ["A quantidade de etiquetas (tags) aplicadas ao recurso", false],
            ["O tema visual (claro ou escuro) do portal do Azure", false],
        ],
    },
    {
        statement:
            "Uma empresa transfere grandes volumes de dados para dentro e para fora do Azure. O que geralmente ocorre com a cobrança dessa transferência?",
        explanation:
            "No Azure, a entrada de dados (ingress) costuma ser gratuita e a saída pela internet (egress) é cobrada acima das franquias. As demais opções invertem ou generalizam de forma incorreta.",
        options: [
            [
                "A entrada de dados (ingress) costuma ser gratuita, enquanto a saída de dados (egress) pela internet pode ser cobrada",
                true,
            ],
            ["A entrada de dados é cobrada e a saída é sempre gratuita", false],
            ["Toda transferência de dados é gratuita em qualquer situação", false],
            ["Apenas a transferência entre recursos da mesma região é cobrada", false],
        ],
    },
    {
        statement:
            "Antes de provisionar qualquer recurso, você precisa montar uma estimativa detalhada do custo mensal de um conjunto de serviços do Azure. Qual ferramenta é a mais indicada?",
        explanation:
            "A Calculadora de Preços estima custos de serviços antes da implantação. O Cost Management analisa gastos já existentes, enquanto Advisor e Monitor são de recomendação e monitoramento.",
        options: [
            ["Calculadora de Preços do Azure", true],
            ["Microsoft Cost Management", false],
            ["Azure Advisor", false],
            ["Azure Monitor", false],
        ],
    },
    {
        statement:
            "Uma organização deseja comparar o custo de manter suas cargas de trabalho no ambiente local (on-premises) com o custo de executá-las no Azure, estimando a possível economia. Qual ferramenta usar?",
        explanation:
            "A Calculadora de TCO compara custos on-premises com o Azure e estima a economia da migração. A Calculadora de Preços apenas estima custos no Azure, e o Cost Management analisa gastos já incorridos.",
        options: [
            ["Calculadora de TCO (Custo Total de Propriedade)", true],
            ["Calculadora de Preços do Azure", false],
            ["Microsoft Cost Management", false],
            ["Application Insights", false],
        ],
    },
    {
        statement:
            "No Microsoft Cost Management, qual recurso permite definir um valor de orçamento e receber alertas quando os custos se aproximam ou ultrapassam esse valor?",
        explanation:
            "Os orçamentos (budgets) do Cost Management disparam alertas ao atingir limites definidos, mas não bloqueiam automaticamente o gasto. Tags organizam recursos, grupos de recursos agregam recursos e zonas de disponibilidade tratam de resiliência, não de alertas de custo.",
        options: [
            ["Orçamentos (budgets)", true],
            ["Etiquetas (tags)", false],
            ["Grupos de recursos", false],
            ["Zonas de disponibilidade", false],
        ],
    },
    {
        statement:
            "De que forma as etiquetas (tags) aplicadas aos recursos auxiliam na gestão de custos no Azure?",
        explanation:
            "Tags são metadados que ajudam a organizar e detalhar custos por critérios como projeto ou departamento no Cost Management. Elas não reduzem preços, não alteram SLA nem criptografam dados.",
        options: [
            [
                "Permitem agrupar e filtrar os custos por critérios como projeto, departamento ou ambiente nos relatórios de custo",
                true,
            ],
            ["Reduzem automaticamente o preço dos recursos etiquetados", false],
            ["Aumentam o SLA de disponibilidade dos recursos", false],
            ["Criptografam automaticamente os dados dos recursos", false],
        ],
    },
    {
        statement:
            "O que descreve corretamente um SLA (Contrato de Nível de Serviço) da Microsoft para um serviço do Azure?",
        explanation:
            "O SLA é um compromisso formal de disponibilidade/desempenho que prevê créditos de serviço quando a meta não é cumprida. As demais opções descrevem segurança, controle de gasto e disponibilidade regional, que não são a definição de SLA.",
        options: [
            [
                "Um compromisso formal de disponibilidade/desempenho que prevê créditos de serviço caso a meta não seja cumprida",
                true,
            ],
            ["Um relatório automático de vulnerabilidades de segurança do recurso", false],
            ["Um limite máximo de gasto mensal da assinatura", false],
            ["Uma lista das regiões do Azure disponíveis para o cliente", false],
        ],
    },
    {
        statement:
            "Qual SLA de disponibilidade a Microsoft normalmente oferece para serviços no nível gratuito (Free) ou em versão prévia (preview)?",
        explanation:
            "Serviços gratuitos e em preview geralmente não possuem SLA financeiramente garantido. Percentuais como 99,9% ou 99,99% aplicam-se a serviços pagos já em disponibilidade geral (GA).",
        options: [
            ["Nenhum SLA financeiramente garantido", true],
            ["99,99%", false],
            ["99,9%", false],
            ["100%", false],
        ],
    },
    {
        statement:
            "Uma aplicação depende de dois serviços do Azure encadeados (em série), cada um com SLA de 99,9%. Qual é o efeito no SLA composto da aplicação?",
        explanation:
            "Serviços dependentes em série têm seus SLAs multiplicados (0,999 x 0,999 ≈ 0,998), reduzindo o resultado combinado. Combinar serviços em série nunca aumenta o SLA.",
        options: [
            [
                "O SLA composto fica menor que 99,9% (cerca de 99,8%), pois os valores se multiplicam",
                true,
            ],
            ["O SLA composto sobe para 99,99%", false],
            ["O SLA composto permanece exatamente 99,9%", false],
            ["O SLA composto passa a ser 100%", false],
        ],
    },
    {
        statement:
            "Um recurso do Azure está em versão prévia pública (public preview). O que é verdadeiro sobre esse estágio do ciclo de vida?",
        explanation:
            "Recursos em preview público podem mudar, geralmente não têm SLA e não são recomendados para produção. Acesso por convite descreve o preview privado, e o suporte completo só ocorre na disponibilidade geral (GA).",
        options: [
            ["Pode não ter SLA e não é recomendado para cargas de trabalho de produção", true],
            ["Possui o SLA mais alto oferecido pelo Azure", false],
            ["É totalmente suportado para produção, com garantias completas", false],
            ["Só pode ser acessado mediante convite privado da Microsoft", false],
        ],
    },
    {
        statement:
            "Quais estratégias podem reduzir os custos de máquinas virtuais com cargas de trabalho estáveis e de longo prazo? (Selecione DUAS opções.)",
        explanation:
            "Instâncias Reservadas (compromisso de 1 ou 3 anos) e o Benefício Híbrido do Azure (reaproveitar licenças) reduzem custos de computação. Tags e nomes de grupos de recursos não afetam preço, e a região mais cara aumenta o gasto.",
        options: [
            ["Adquirir Instâncias Reservadas do Azure com compromisso de 1 ou 3 anos", true],
            [
                "Aplicar o Benefício Híbrido do Azure para reaproveitar licenças do Windows Server",
                true,
            ],
            ["Aumentar o número de etiquetas (tags) aplicadas às VMs", false],
            ["Renomear os grupos de recursos periodicamente", false],
            ["Escolher sempre a região de maior custo", false],
        ],
    },
    {
        statement:
            "Qual ação ajuda a aumentar a disponibilidade (uptime) de uma aplicação e a elevar o SLA efetivo alcançado?",
        explanation:
            "Distribuir instâncias redundantes por várias Zonas de Disponibilidade protege contra falhas de datacenter e eleva a disponibilidade. Uma única VM cria ponto único de falha, preview reduz garantias e tags não afetam disponibilidade.",
        options: [
            [
                "Implantar instâncias redundantes distribuídas em várias Zonas de Disponibilidade",
                true,
            ],
            ["Concentrar toda a carga em uma única máquina virtual", false],
            ["Migrar a aplicação para serviços em preview", false],
            ["Aplicar mais etiquetas (tags) aos recursos", false],
        ],
    },
    {
        statement:
            "Sua equipe já tem recursos em execução e precisa analisar os custos REAIS acumulados no mês, detalhando-os por serviço e por grupo de recursos. Qual ferramenta atende melhor?",
        explanation:
            "O Microsoft Cost Management mostra e detalha os gastos reais já incorridos. As calculadoras apenas estimam custos futuros, e o Service Health informa a saúde dos serviços, não os custos.",
        options: [
            ["Análise de custos do Microsoft Cost Management", true],
            ["Calculadora de Preços do Azure", false],
            ["Calculadora de TCO", false],
            ["Azure Service Health", false],
        ],
    },
    {
        statement:
            "Uma máquina virtual ficará ociosa por várias semanas. Qual ação evita a cobrança de computação (capacidade de processamento) durante esse período?",
        explanation:
            "Parar e desalocar (deallocate) a VM libera os recursos de computação e cessa essa cobrança (o disco continua sendo cobrado). Desligar pelo sistema operacional mantém a VM alocada e cobrada; tags e renomeação não afetam a cobrança.",
        options: [
            ["Parar e desalocar (deallocate) a máquina virtual pelo portal do Azure", true],
            ["Desligar a VM apenas pelo sistema operacional, mantendo-a alocada", false],
            ["Aplicar uma etiqueta (tag) com o valor 'desligada'", false],
            ["Renomear a máquina virtual", false],
        ],
    },
    {
        statement:
            "Qual ferramenta oferece uma interface gráfica, baseada em navegador, para criar, configurar e gerenciar recursos do Azure sem exigir linha de comando?",
        explanation:
            "O portal do Azure é a interface gráfica web para gerenciar recursos. Azure CLI e Azure PowerShell são baseados em linha de comando, e o Azure Arc estende o gerenciamento a recursos fora do Azure.",
        options: [
            ["Portal do Azure", true],
            ["Azure CLI", false],
            ["Azure PowerShell", false],
            ["Azure Arc", false],
        ],
    },
    {
        statement: "O que melhor descreve o Azure Cloud Shell?",
        explanation:
            "O Cloud Shell é um shell interativo executado no navegador, já autenticado, com os ambientes Bash e PowerShell. As outras opções descrevem um banco de dados, uma ferramenta local exclusiva de Windows e um firewall.",
        options: [
            [
                "Um shell interativo, executado no navegador e já autenticado, que oferece os ambientes Bash e PowerShell",
                true,
            ],
            ["Um serviço gerenciado de banco de dados relacional", false],
            ["Um aplicativo de linha de comando que só funciona instalado no Windows", false],
            ["Um firewall para filtrar tráfego de rede", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre a Azure CLI e o Azure PowerShell estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Ambas as ferramentas são multiplataforma e a Azure CLI usa comandos iniciados por 'az'. Elas são de linha de comando (não gráficas) e funcionam tanto localmente quanto no Azure Cloud Shell.",
        options: [
            ["Ambos são multiplataforma, podendo ser executados em Windows, Linux e macOS", true],
            ["Os comandos da Azure CLI começam com 'az' (por exemplo, az vm create)", true],
            ["Só podem ser executados dentro do portal gráfico do Azure", false],
            ["São interfaces exclusivamente gráficas, sem linha de comando", false],
            ["Não podem ser utilizados no Azure Cloud Shell", false],
        ],
    },
    {
        statement:
            "Um administrador automatiza tarefas usando cmdlets no formato Verbo-Substantivo, como Get-AzVM e New-AzResourceGroup. Qual ferramenta ele está utilizando?",
        explanation:
            "Os cmdlets Verbo-Substantivo como Get-AzVM são característicos do Azure PowerShell (módulo Az). A Azure CLI usa comandos 'az', o portal é gráfico e o Application Insights é de monitoramento de aplicações.",
        options: [
            ["Azure PowerShell (módulo Az)", true],
            ["Azure CLI", false],
            ["Portal do Azure", false],
            ["Application Insights", false],
        ],
    },
    {
        statement:
            "Uma empresa quer aplicar políticas, RBAC e etiquetas de forma centralizada a servidores locais (on-premises) e a recursos hospedados em outras nuvens, usando o plano de gerenciamento do Azure. Qual serviço possibilita isso?",
        explanation:
            "O Azure Arc estende o gerenciamento do Azure (políticas, RBAC, tags) a recursos on-premises e multicloud. O Cloud Shell é um terminal, e Monitor e Service Health tratam de telemetria e saúde de serviços.",
        options: [
            ["Azure Arc", true],
            ["Azure Cloud Shell", false],
            ["Azure Monitor", false],
            ["Azure Service Health", false],
        ],
    },
    {
        statement:
            "Um administrador precisa acompanhar a saúde e as métricas dos recursos do Azure e receber alertas diretamente pelo smartphone. Qual opção atende melhor a essa necessidade?",
        explanation:
            "O aplicativo móvel do Azure permite monitorar recursos, ver a saúde e receber alertas pelo celular. O Azure Arc gerencia recursos híbridos, a Calculadora de TCO estima custos e o Log Analytics consulta logs.",
        options: [
            ["Aplicativo móvel do Azure (Azure mobile app)", true],
            ["Azure Arc", false],
            ["Calculadora de TCO", false],
            ["Log Analytics", false],
        ],
    },
    {
        statement:
            "Qual serviço avalia continuamente suas configurações e telemetria de uso e fornece recomendações personalizadas de confiabilidade, segurança, desempenho, custo e excelência operacional?",
        explanation:
            "O Azure Advisor gera recomendações personalizadas nessas cinco categorias. O Service Health informa incidentes de serviço, o Cloud Shell é um terminal e o Cost Management foca somente em custos.",
        options: [
            ["Azure Advisor", true],
            ["Azure Service Health", false],
            ["Azure Cloud Shell", false],
            ["Microsoft Cost Management", false],
        ],
    },
    {
        statement:
            "Você quer ser avisado sobre incidentes de serviço e manutenções planejadas do Azure que afetam especificamente os recursos da sua assinatura. Qual serviço usar?",
        explanation:
            "O Azure Service Health oferece uma visão personalizada de incidentes e manutenções que impactam seus recursos. O Advisor dá recomendações, o Application Insights monitora aplicações e o Cost Management trata de custos.",
        options: [
            ["Azure Service Health", true],
            ["Azure Advisor", false],
            ["Application Insights", false],
            ["Microsoft Cost Management", false],
        ],
    },
    {
        statement:
            "Qual serviço é a plataforma central do Azure para coletar, analisar e agir sobre a telemetria de ambientes de nuvem e locais, servindo de base para recursos como o Log Analytics e o Application Insights?",
        explanation:
            "O Azure Monitor é a plataforma abrangente de telemetria que sustenta o Log Analytics e o Application Insights. O Advisor dá recomendações, o Arc gerencia recursos híbridos e o Service Health informa a saúde dos serviços.",
        options: [
            ["Azure Monitor", true],
            ["Azure Advisor", false],
            ["Azure Arc", false],
            ["Azure Service Health", false],
        ],
    },
    {
        statement:
            "Quais são os dois tipos fundamentais de dados de telemetria coletados e analisados pelo Azure Monitor? (Selecione DUAS opções.)",
        explanation:
            "O Azure Monitor baseia-se em métricas (valores numéricos ao longo do tempo) e logs (registros de eventos). Faturas, tags e contratos de SLA não são tipos de telemetria coletada por ele.",
        options: [
            ["Métricas", true],
            ["Logs", true],
            ["Faturas de cobrança", false],
            ["Etiquetas (tags)", false],
            ["Contratos de SLA", false],
        ],
    },
    {
        statement:
            "Qual ferramenta é usada para escrever e executar consultas em linguagem KQL (Kusto Query Language) sobre os dados de log coletados pelo Azure Monitor?",
        explanation:
            "O Log Analytics permite consultar, com KQL, os logs armazenados pelo Azure Monitor. O Service Health mostra a saúde dos serviços, a Calculadora de Preços estima custos e o Cloud Shell é um terminal de comandos.",
        options: [
            ["Log Analytics", true],
            ["Azure Service Health", false],
            ["Calculadora de Preços do Azure", false],
            ["Azure Cloud Shell", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento precisa monitorar desempenho, disponibilidade e exceções de uma aplicação web em produção, com recursos de APM (gerenciamento de desempenho de aplicações). Qual recurso do Azure Monitor é o mais indicado?",
        explanation:
            "O Application Insights é o recurso de APM do Azure Monitor, focado em desempenho, disponibilidade e exceções de aplicações. O Advisor dá recomendações, o Service Health mostra a saúde da plataforma e o Arc gerencia recursos híbridos.",
        options: [
            ["Application Insights", true],
            ["Azure Advisor", false],
            ["Azure Service Health", false],
            ["Azure Arc", false],
        ],
    },
    {
        statement:
            "O Azure Advisor fornece recomendações personalizadas em quais das categorias a seguir? (Selecione DUAS opções.)",
        explanation:
            "As cinco categorias do Advisor são confiabilidade, segurança, desempenho, custo e excelência operacional; portanto custo e segurança estão corretas. As demais opções não são categorias de recomendação do Advisor.",
        options: [
            ["Custo", true],
            ["Segurança", true],
            ["Cor do tema do portal", false],
            ["Número máximo de assinaturas permitidas", false],
            ["Fuso horário do usuário", false],
        ],
    },
    {
        statement:
            "Qual página oferece uma visão GLOBAL do status de todos os serviços do Azure, em todas as regiões, sem relação com uma assinatura específica?",
        explanation:
            "A página Status do Azure mostra o estado global dos serviços, independentemente da assinatura. O Service Health é personalizado para seus recursos, o Resource Health foca em um recurso específico e o Advisor dá recomendações.",
        options: [
            ["Status do Azure (Azure Status)", true],
            ["Azure Service Health, que oferece uma visão personalizada da sua assinatura", false],
            ["Resource Health (Integridade do Recurso)", false],
            ["Azure Advisor", false],
        ],
    },
];

// Tema de cada questão, na mesma ordem de QUESTOES (para agrupar erros e recomendar revisão).
const TEMAS: string[] = [
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Conceitos de nuvem",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Arquitetura do Azure",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Rede",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Armazenamento",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Identidade e segurança",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Governança e conformidade",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Custos e SLA",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
    "Monitoramento e ferramentas",
];

if (TEMAS.length !== QUESTOES.length) {
    throw new Error(`TEMAS (${TEMAS.length}) e QUESTOES (${QUESTOES.length}) fora de sincronia`);
}

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "Microsoft Azure Fundamentals (AZ-900)",
                description:
                    "Simulado no formato da prova AZ-900: 45 minutos, corte de 70%. Mistura resposta única e múltipla.",
                durationMinutes: 45,
                questionCount: 50,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log(`Simulado já tem ${n} questões, nada a fazer.`);
        return;
    }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({
                simuladoId: simulado.id,
                statement: q.statement,
                explanation: q.explanation,
                topic: TEMAS[i],
            })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], i) => ({
                questionId: questao.id,
                text,
                isCorrect,
                position: i + 1,
            })),
        );
    }
    console.log(`Seed concluído: ${QUESTOES.length} questões inseridas.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
