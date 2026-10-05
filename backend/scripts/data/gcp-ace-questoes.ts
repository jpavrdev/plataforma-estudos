// Banco de questões do simulado Google Cloud Associate Cloud Engineer (ACE).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: enunciado de cenário,
// distratores da mesma categoria da resposta e a correta não pode ser a única
// opção mais longa, nem a única mais curta por folga visível. Questões de
// múltipla escolha terminam com "(Selecione DUAS opções.)" e têm cinco opções
// com duas corretas.
//
// O topic é a seção do guia oficial do exame, usada na revisão por assunto
// depois da prova.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Uma empresa brasileira acabou de assinar o Cloud Identity e quer agrupar os recursos do Google Cloud por diretoria e, dentro de cada diretoria, por equipe, antes de chegar aos projetos. Qual estrutura da hierarquia de recursos atende a esse desenho?",
        explanation:
            "A organização é o nó raiz, e as pastas, que só existem sob uma organização, podem ser aninhadas para representar diretoria e equipe. Projeto não contém pasta e todo recurso tem exatamente um pai, por isso não cabe projeto com pastas dentro nem projeto em duas pastas.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Pastas por diretoria sob a organização, com pastas aninhadas por equipe dentro de cada uma",
                true,
            ],
            [
                "Um nó de organização por diretoria, com uma pasta por equipe criada dentro de cada um deles",
                false,
            ],
            [
                "Um projeto por diretoria, com uma pasta por equipe criada dentro do projeto da diretoria",
                false,
            ],
            [
                "Pastas por diretoria, com cada projeto de equipe vinculado a duas pastas ao mesmo tempo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma recebeu o ID da pasta 735512345678 e precisa criar o projeto dados-bi-prod já dentro dessa pasta, com o nome de exibição Dados BI. Qual comando resolve isso em uma única chamada?",
        explanation:
            "O comando gcloud projects create aceita --folder para apontar a pasta pai e --name para o nome de exibição, que pode ter espaço. A flag --organization colocaria o projeto direto na organização, não existe --parent nesse comando e projeto não fica no grupo resource-manager.",
        topic: "Configuração do ambiente",
        options: [
            ['gcloud projects create dados-bi-prod --folder=735512345678 --name="Dados BI"', true],
            [
                'gcloud projects create dados-bi-prod --parent=folders/735512345678 --name="Dados BI"',
                false,
            ],
            [
                'gcloud projects create dados-bi-prod --organization=735512345678 --name="Dados BI"',
                false,
            ],
            ["gcloud resource-manager projects create dados-bi-prod --folder=735512345678", false],
        ],
    },
    {
        statement:
            "Um administrador precisa criar a pasta Engenharia diretamente abaixo da organização de ID 418899001122, pela linha de comando. Qual comando cria essa pasta?",
        explanation:
            "O comando é gcloud resource-manager folders create, com --display-name obrigatório e --organization indicando a organização pai. A flag --folder serve quando o pai é outra pasta, não existe --parent nesse comando e o verbo correto é create, não add.",
        topic: "Configuração do ambiente",
        options: [
            [
                "gcloud resource-manager folders create --display-name=Engenharia --organization=418899001122",
                true,
            ],
            [
                "gcloud resource-manager folders create --display-name=Engenharia --parent=organizations/418899001122",
                false,
            ],
            [
                "gcloud resource-manager folders create --display-name=Engenharia --folder=418899001122",
                false,
            ],
            [
                "gcloud resource-manager folders add --display-name=Engenharia --organization=418899001122",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa definiu no nó da organização uma política que bloqueia a criação de chaves de conta de serviço. Semanas depois uma equipe cria um projeto novo dentro de uma pasta e descobre que também não consegue gerar chaves. Qual é a explicação?",
        explanation:
            "Política da organização definida em um nó é herdada por todos os descendentes, mesmo os criados depois. Ela cuida do que pode ser configurado, enquanto o IAM cuida de quem pode agir. A herança não exige repetir a política em cada nível nem depende de papel concedido no projeto.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Todo descendente da organização herda a política por padrão, inclusive projeto criado depois",
                true,
            ],
            [
                "A política vale somente para os projetos que já existiam no momento em que ela foi definida ali",
                false,
            ],
            [
                "A política vale apenas no nó onde foi definida e precisa ser repetida em cada pasta filha",
                false,
            ],
            [
                "A política passa a valer quando alguém recebe o papel de administrador dentro do projeto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora assinou um contrato que obriga manter os recursos novos em regiões dos Estados Unidos. A regra precisa valer para a organização inteira, sem revisão manual projeto a projeto. Qual configuração atende a isso?",
        explanation:
            "A restrição de lista constraints/gcp.resourceLocations limita os locais onde recursos de serviços compatíveis podem ser criados e aceita grupos de valores como in:us-locations. As outras restrições tratam de IP externo e de porta serial, e rótulo com relatório não impede a criação.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Política da organização com a restrição constraints/gcp.resourceLocations e os valores permitidos",
                true,
            ],
            [
                "Política da organização com a restrição constraints/compute.vmExternalIpAccess no nó raiz da empresa",
                false,
            ],
            [
                "Política da organização com a restrição constraints/compute.disableSerialPortAccess em cada pasta",
                false,
            ],
            [
                "Rótulo de região em cada projeto, com revisão mensal do relatório de faturamento por região",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de proibir IP externo em VMs de toda a organização, o time de segurança quer descobrir quais projetos seriam afetados sem interromper quem usa o recurso hoje. Qual recurso da política da organização atende a isso?",
        explanation:
            "O modo de simulação, chamado dry run, avalia a política e registra as violações em log sem bloquear nada, o que revela o impacto antes da aplicação real. Desligar a herança não simula, orçamento trata de custo e condição do IAM não testa política da organização.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Publicar a política em modo de simulação, que registra as violações em log sem bloquear",
                true,
            ],
            [
                "Publicar a política com a herança do pai desligada, para valer só nos projetos vazios",
                false,
            ],
            [
                "Publicar a política junto de um orçamento com alerta, para avisar o dono de cada projeto",
                false,
            ],
            [
                "Publicar a política com condição de tempo no IAM, para valer só na janela de manutenção",
                false,
            ],
        ],
    },
    {
        statement:
            "O grupo do Cloud Identity dados-analistas@empresa.com.br precisa de leitura nos conjuntos do BigQuery do projeto analytics-prod. Qual comando concede o papel predefinido roles/bigquery.dataViewer a esse grupo no projeto?",
        explanation:
            "O membro precisa do prefixo do tipo de identidade, group: para grupo, e o papel vai com o caminho completo roles/bigquery.dataViewer. Membro sem prefixo é rejeitado, user: trataria o grupo como usuário e o grupo gcloud iam roles cria papéis, não concede vínculo em projeto.",
        topic: "Configuração do ambiente",
        options: [
            [
                "gcloud projects add-iam-policy-binding analytics-prod --member=group:dados-analistas@empresa.com.br --role=roles/bigquery.dataViewer",
                true,
            ],
            [
                "gcloud iam roles add-iam-policy-binding analytics-prod --member=group:dados-analistas@empresa.com.br --role=roles/bigquery.dataViewer",
                false,
            ],
            [
                "gcloud projects add-iam-policy-binding analytics-prod --member=dados-analistas@empresa.com.br --role=roles/bigquery.dataViewer",
                false,
            ],
            [
                "gcloud projects add-iam-policy-binding analytics-prod --member=user:dados-analistas@empresa.com.br --role=bigquery.dataViewer",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa entrou no time de suporte e precisa apenas ver as instâncias de Compute Engine do projeto de produção. O analista pensou em conceder o papel básico de Visualizador no projeto. Qual é a objeção correta a essa escolha?",
        explanation:
            "Visualizador é papel básico e dá leitura em praticamente todo o projeto, muito além do necessário. O menor privilégio pede um papel predefinido como roles/compute.viewer. Papel básico pode ser concedido no projeto, inclui leitura no Compute Engine e não expira por conta própria.",
        topic: "Configuração do ambiente",
        options: [
            [
                "O papel básico dá leitura em todos os serviços do projeto, e um papel predefinido já resolveria",
                true,
            ],
            [
                "O papel básico só pode ser concedido no nó da organização, nunca dentro de um projeto isolado",
                false,
            ],
            [
                "O papel básico não cobre a leitura de nenhum recurso do Compute Engine e precisa ser complementado",
                false,
            ],
            [
                "O papel básico vence sozinho em noventa dias e precisa ser renovado pelo dono da organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa com mil funcionários cadastrados no Active Directory vai adotar o Google Cloud e quer que as contas e os grupos do Cloud Identity sejam criados e atualizados sem digitação manual. Quais abordagens atendem a esse provisionamento automatizado? (Selecione DUAS opções.)",
        explanation:
            "O Google Cloud Directory Sync é a ferramenta gratuita do Google que replica usuários e grupos do LDAP para o Cloud Identity em um sentido só, e a API Directory do Admin SDK faz o mesmo por código. Admin console e planilha são trabalho manual, e papel do IAM não cria conta.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Instalar o Google Cloud Directory Sync e agendar a sincronização a partir do Active Directory",
                true,
            ],
            [
                "Escrever uma integração com a API Directory do Admin SDK para criar e atualizar as contas",
                true,
            ],
            [
                "Cadastrar cada funcionário na página de usuários do Admin console e repetir a cada mudança",
                false,
            ],
            [
                "Exportar o Active Directory para planilha e pedir que cada pessoa crie a própria conta do Gmail",
                false,
            ],
            [
                "Conceder o papel roles/iam.serviceAccountUser ao grupo do Active Directory em cada projeto novo",
                false,
            ],
        ],
    },
    {
        statement:
            "Para parar de conceder papéis do IAM pessoa por pessoa, o time de plataforma quer criar o grupo plataforma-sre@empresa.com.br na organização empresa.com.br pela linha de comando. Qual comando cria esse grupo?",
        explanation:
            "O comando gcloud identity groups create cria grupos do Cloud Identity e exige --organization com o domínio, ou --customer com o ID do cliente. Grupo não pertence a projeto, por isso --project não serve, não existe gcloud iam groups e add-iam-policy-binding só usa grupo já criado.",
        topic: "Configuração do ambiente",
        options: [
            [
                'gcloud identity groups create plataforma-sre@empresa.com.br --organization="empresa.com.br"',
                true,
            ],
            [
                "gcloud projects add-iam-policy-binding empresa-plataforma --member=group:plataforma-sre@empresa.com.br",
                false,
            ],
            [
                'gcloud identity groups create plataforma-sre@empresa.com.br --project="empresa-plataforma"',
                false,
            ],
            [
                'gcloud iam groups create plataforma-sre@empresa.com.br --organization="empresa.com.br"',
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai publicar uma aplicação que grava no Pub/Sub e consulta o BigQuery no projeto app-prod, criado há pouco. O primeiro teste falha porque os serviços não estão habilitados. Qual comando habilita as duas APIs de uma vez?",
        explanation:
            "O comando gcloud services enable aceita vários serviços na mesma chamada, sempre pelo nome completo terminado em googleapis.com, e --project escolhe onde habilitar. Não existe o verbo activate, não existe o grupo gcloud services api e gcloud projects update não habilita API.",
        topic: "Configuração do ambiente",
        options: [
            [
                "gcloud services enable pubsub.googleapis.com bigquery.googleapis.com --project=app-prod",
                true,
            ],
            [
                "gcloud services api enable pubsub.googleapis.com bigquery.googleapis.com --project=app-prod",
                false,
            ],
            [
                "gcloud services activate pubsub.googleapis.com bigquery.googleapis.com --project=app-prod",
                false,
            ],
            [
                "gcloud projects update app-prod --enable-apis=pubsub.googleapis.com,bigquery.googleapis.com",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe instalou o Ops Agent em uma VM do Compute Engine, mas nem os logs nem as métricas do sistema aparecem no projeto. A conta de serviço anexada à VM foi criada sem nenhum papel. Quais papéis do IAM resolvem o problema? (Selecione DUAS opções.)",
        explanation:
            "O Ops Agent envia logs pela API do Cloud Logging e métricas pela API do Cloud Monitoring, então a conta de serviço da VM precisa de Gravador de logs e de Gravador de métricas. Os papéis de leitura e o de editar painéis apenas consultam ou montam visualizações, sem permitir ingestão.",
        topic: "Configuração do ambiente",
        options: [
            ["roles/logging.logWriter", true],
            ["roles/monitoring.metricWriter", true],
            ["roles/monitoring.viewer", false],
            ["roles/logging.privateLogViewer", false],
            ["roles/monitoring.dashboardEditor", false],
        ],
    },
    {
        statement:
            "Uma empresa mantém projetos separados para desenvolvimento, homologação e produção e quer um único painel do Cloud Monitoring com as métricas dos três ambientes. Qual configuração entrega esse painel?",
        explanation:
            "O escopo de métricas define quais projetos um projeto de escopo consegue consultar e exibir, então adicionar os três ao escopo de um projeto dá o painel único. Pasta não soma métricas, painel por projeto não unifica nada e sink agregado roteia logs, não métricas.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Eleger um projeto para hospedar o painel e incluir os três no escopo de métricas",
                true,
            ],
            [
                "Criar um painel igual em cada projeto e juntar as capturas em um relatório semanal",
                false,
            ],
            [
                "Mover os três projetos para a mesma pasta, que passa a somar as métricas dos filhos",
                false,
            ],
            [
                "Criar um sink de log agregado na organização apontando para um conjunto do BigQuery",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe recebeu erro de cota ao tentar reservar mais endereços IP externos em uma região e precisa pedir um limite maior. Qual caminho no console e qual papel do IAM permitem fazer esse pedido?",
        explanation:
            "O pedido sai da página Cotas e limites do sistema, no console, e exige a permissão serviceusage.quotas.update, que vem no papel Administrador de cotas. Leitor de cotas apenas consulta, orçamento trata de custo e cota regional pode sim ser aumentada depois de análise.",
        topic: "Configuração do ambiente",
        options: [
            [
                "A página Cotas e limites do sistema, com o papel de Administrador de cotas no projeto",
                true,
            ],
            [
                "A página Cotas e limites do sistema, com o papel de Leitor de cotas concedido no projeto",
                false,
            ],
            [
                "A página de faturamento, aumentando o orçamento do projeto para liberar mais endereços",
                false,
            ],
            [
                "A página de projetos, criando outro projeto porque cota regional não pode ser aumentada",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao planejar uma migração, um arquiteto lista valores de serviço que gostaria de ampliar. O suporte avisa que parte deles é limite do sistema, e não cota. O que isso significa na prática?",
        explanation:
            "Limite do sistema é restrição fixa do serviço, como tamanho máximo de arquivo ou detalhe de esquema, e não pode ser aumentado nem reduzido. Cota, essa sim, é ajustável por pedido. As outras opções descrevem comportamento de cota de taxa e de alocação, que seguem regras próprias.",
        topic: "Configuração do ambiente",
        options: [
            [
                "São restrições fixas do serviço e não aceitam pedido de aumento nem de redução",
                true,
            ],
            [
                "São restrições por região e aceitam pedido de aumento com justificativa técnica",
                false,
            ],
            [
                "São restrições por projeto e crescem sozinhas conforme o histórico de consumo",
                false,
            ],
            [
                "São restrições de taxa e deixam de valer quando o projeto tem faturamento ativo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que o time financeiro consiga abrir novas contas de faturamento de autoatendimento sem depender do administrador da organização. Qual papel do IAM deve ser concedido e em que nível?",
        explanation:
            "Abrir conta de faturamento de autoatendimento exige o papel Criador de contas de faturamento no nó da organização, porque a conta nasce fora de qualquer projeto. Administrador de faturamento cuida de contas que já existem, Usuário vincula projetos e Leitor apenas consulta custo.",
        topic: "Configuração do ambiente",
        options: [
            ["Conceder roles/billing.creator no nó da organização", true],
            ["Conceder roles/billing.admin em cada projeto existente", false],
            ["Conceder roles/billing.user no nó da organização", false],
            ["Conceder roles/billing.viewer em cada pasta de diretoria", false],
        ],
    },
    {
        statement:
            "Uma revenda brasileira atende dezenas de clientes no Google Cloud e precisa separar os custos de cada cliente dentro da mesma fatura mensal que recebe do Google. Qual recurso do Cloud Billing resolve esse agrupamento?",
        explanation:
            "Subconta de faturamento pertence à conta principal da revenda, que precisa ser faturada por nota, e agrupa os custos do cliente em uma seção própria da fatura. Conta de autoatendimento por cliente quebra a fatura única, rótulo só classifica e orçamento apenas avisa do gasto.",
        topic: "Configuração do ambiente",
        options: [
            ["Subcontas de faturamento sob a conta de faturamento principal da revenda", true],
            ["Contas de faturamento de autoatendimento separadas, uma por cliente final", false],
            ["Rótulos de projeto por cliente na conta de faturamento única da revenda", false],
            ["Orçamentos por cliente com alerta no total do valor que foi contratado", false],
        ],
    },
    {
        statement:
            "O projeto marketing-site acabou de ser criado e precisa ser vinculado à conta de faturamento de ID 0X0X0X-0X0X0X-0X0X0X. Qual comando faz esse vínculo?",
        explanation:
            "O vínculo é feito com gcloud billing projects link, passando o ID do projeto e --billing-account com o ID da conta em três blocos. O grupo accounts descreve e lista contas, sem vincular projeto, não existe gcloud projects link nem o verbo set-billing-info nesse grupo.",
        topic: "Configuração do ambiente",
        options: [
            [
                "gcloud billing projects link marketing-site --billing-account=0X0X0X-0X0X0X-0X0X0X",
                true,
            ],
            [
                "gcloud billing projects set-billing-info marketing-site --account=0X0X0X-0X0X0X-0X0X0X",
                false,
            ],
            [
                "gcloud billing accounts link marketing-site --billing-account=0X0X0X-0X0X0X-0X0X0X",
                false,
            ],
            ["gcloud projects link marketing-site --billing-account=0X0X0X-0X0X0X-0X0X0X", false],
        ],
    },
    {
        statement:
            "Uma pessoa precisa poder vincular e desvincular projetos de uma conta de faturamento específica, sem ganhar acesso aos recursos que ficam dentro desses projetos. Quais papéis do IAM atendem exatamente a isso? (Selecione DUAS opções.)",
        explanation:
            "Vincular projeto exige a dupla Usuário da conta de faturamento, concedido na conta, e Gerente de faturamento do projeto, concedido no projeto. Leitor só consulta, Gerente de custos cuida de orçamento e exportação, e proprietário daria o acesso total que o enunciado quer evitar.",
        topic: "Configuração do ambiente",
        options: [
            ["roles/billing.user na conta de faturamento", true],
            ["roles/billing.projectManager no projeto", true],
            ["roles/billing.viewer na conta de faturamento", false],
            ["roles/owner no projeto a ser vinculado", false],
            ["roles/billing.costsManager na conta de faturamento", false],
        ],
    },
    {
        statement:
            "Um projeto de pesquisa consome verba de dois centros de custo e o financeiro pediu que metade da fatura saísse de cada conta de faturamento. O que o time de plataforma deve responder?",
        explanation:
            "Um projeto se vincula a uma conta de faturamento por vez, embora uma conta pague muitos projetos. Para separar centros de custo, divida em dois projetos com contas diferentes ou use rótulos no relatório. Não existe divisão por porcentagem e o vínculo pode ser trocado depois.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Cada projeto fica em uma única conta de faturamento, então o custo precisa ser separado em dois projetos",
                true,
            ],
            [
                "Cada projeto aceita duas contas de faturamento e a divisão é definida por porcentagem na configuração",
                false,
            ],
            [
                "Cada projeto aceita duas contas de faturamento desde que ambas pertençam à mesma organização do Cloud Identity",
                false,
            ],
            [
                "Cada projeto fica em uma única conta de faturamento, e esse vínculo não pode mais ser trocado depois",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma startup quer ser avisada quando o gasto do mês na conta de faturamento 123456-7890AB-CDEF01 chegar a setenta por cento do orçamento e também quando a previsão de gasto passar do valor total. Qual comando cria esse orçamento?",
        explanation:
            "O comando é gcloud billing budgets create, com --budget-amount e uma --threshold-rule por alerta. O percentual entra como fração, 0.7 e 1.0, e a base prevista é basis=forecasted-spend. Percentual inteiro viraria setenta vezes o valor, e as demais opções usam flags que não existem.",
        topic: "Configuração do ambiente",
        options: [
            [
                'gcloud billing budgets create --billing-account=123456-7890AB-CDEF01 --display-name="Mensal" --budget-amount=5000BRL --threshold-rule=percent=0.7 --threshold-rule=percent=1.0,basis=forecasted-spend',
                true,
            ],
            [
                'gcloud billing budgets create --billing-account=123456-7890AB-CDEF01 --display-name="Mensal" --budget-amount=5000BRL --threshold-rule=percent=70,basis=current-spend --threshold-rule=percent=100,basis=forecasted-spend',
                false,
            ],
            [
                'gcloud billing accounts budgets create 123456-7890AB-CDEF01 --display-name="Mensal" --budget-amount=5000BRL --threshold=0.7 --threshold=1.0,basis=forecasted-spend',
                false,
            ],
            [
                'gcloud billing budgets create --billing-account=123456-7890AB-CDEF01 --display-name="Mensal" --budget-limit=5000BRL --alerta=0.7 --alerta=1.0,base=prevista',
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de criar um orçamento com alerta no valor total, o time financeiro perguntou se o Google Cloud vai desligar os recursos quando esse limite for atingido. Qual é a resposta correta?",
        explanation:
            "Orçamento com alerta é informativo e não interrompe uso nem cobrança. Para reagir de fato, aponte o orçamento a um tópico do Pub/Sub e trate a mensagem em código, por exemplo desabilitando o faturamento do projeto. O alerta não desliga, não bloqueia e não desvincula nada sozinho.",
        topic: "Configuração do ambiente",
        options: [
            [
                "O orçamento apenas notifica, e reagir exige automação com Pub/Sub e código próprio",
                true,
            ],
            [
                "O orçamento desliga os recursos do projeto assim que o valor do mês é atingido",
                false,
            ],
            [
                "O orçamento bloqueia a criação de recursos novos e mantém de pé os que já rodam",
                false,
            ],
            [
                "O orçamento desvincula o projeto da conta de faturamento no dia seguinte ao estouro",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe criou um orçamento na conta de faturamento e ninguém configurou canal de notificação no Cloud Monitoring. Quem recebe o e-mail de alerta por padrão?",
        explanation:
            "Por padrão o alerta vai por e-mail para os papéis Administrador da conta de faturamento e Usuário da conta de faturamento. Em orçamento de um projeto só é possível incluir os proprietários do projeto, e qualquer outro destino exige canal de notificação do Cloud Monitoring.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Quem tem Administrador da conta de faturamento e quem tem Usuário da conta de faturamento",
                true,
            ],
            [
                "Quem tem Leitor da conta de faturamento e quem tem Visualizador em todos os projetos vinculados",
                false,
            ],
            [
                "Somente quem criou o orçamento, porque os outros destinos exigem convite por e-mail",
                false,
            ],
            [
                "Qualquer pessoa com o papel básico de Proprietário em um projeto vinculado à conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de FinOps precisa saber quanto cada instância de VM custou, e não apenas o total por SKU e por projeto. A exportação do faturamento para o BigQuery já roda no modo de custo de uso padrão. O que falta fazer?",
        explanation:
            "A exportação de custo de uso detalhado inclui tudo da padrão mais dados no nível do recurso, que é o que permite ver o custo por instância. A exportação de preço traz preço de lista, rateio por consulta é estimativa e trocar a localização do conjunto não cria campo de recurso.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Habilitar também a exportação de custo de uso detalhado, que traz dados no nível do recurso",
                true,
            ],
            [
                "Habilitar também a exportação de dados de preço, que traz o preço de lista de cada SKU",
                false,
            ],
            [
                "Criar uma consulta agendada que divide o custo do projeto pelo número de instâncias ativas",
                false,
            ],
            [
                "Trocar a localização do conjunto do BigQuery por uma multirregião e aguardar o preenchimento",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa ativou hoje a exportação do faturamento para um conjunto do BigQuery criado em uma região única e esperava ver os custos dos meses anteriores. Nenhum dado histórico apareceu. Qual é a explicação?",
        explanation:
            "Com conjunto em região única, a exportação reflete só os custos gerados a partir da ativação. Em multirregião EU ou US o Google inclui também o mês anterior à ativação no preenchimento inicial. Papel do IAM e consulta agendada não trazem dado que o Google nunca exportou.",
        topic: "Configuração do ambiente",
        options: [
            [
                "Em conjunto regional a exportação traz apenas o custo gerado a partir da data de ativação",
                true,
            ],
            [
                "Em conjunto regional a exportação traz todo o histórico depois do preenchimento inicial",
                false,
            ],
            [
                "Em conjunto regional a exportação exige o papel de Leitor da conta de faturamento no projeto",
                false,
            ],
            [
                "Em conjunto regional a exportação precisa de uma consulta agendada para copiar o histórico",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma startup tem uma API HTTP sem estado empacotada em contêiner. O tráfego cai a zero durante a madrugada e dispara de manhã, e a equipe não quer administrar nós nem cluster. Qual opção de computação atende ao requisito?",
        explanation:
            "O Cloud Run roda a imagem de contêiner sem administração de servidor e escala conforme as requisições, chegando a zero instância quando não há tráfego. GKE e Compute Engine cobram pelos nós ou pelas VMs provisionados mesmo ociosos e ainda exigem gerenciar cluster ou máquina.",
        topic: "Planejamento da solução",
        options: [
            [
                "Cloud Run, que executa a imagem de contêiner como serviço gerenciado e escala pelas requisições, até zero instância",
                true,
            ],
            [
                "Google Kubernetes Engine no modo Standard, com um pool de nós e autoescalador de cluster dimensionado para o pico da manhã",
                false,
            ],
            [
                "Compute Engine com grupo gerenciado de instâncias e autoescalamento pela utilização de CPU atrás de um balanceador",
                false,
            ],
            [
                "Compute Engine com um tipo de máquina personalizado dimensionado para o pico de tráfego do início da manhã",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai migrar microsserviços que já têm manifestos do Kubernetes, incluem componentes com estado e exigem políticas de rede e um agente em cada nó. Qual opção de computação atende ao requisito?",
        explanation:
            "O GKE entrega orquestração do Kubernetes com controle dos nós, o que viabiliza políticas de rede, agente em todos os nós e cargas com estado. O Cloud Run e as funções do Cloud Run servem a serviços sem estado e não expõem a configuração da infraestrutura.",
        topic: "Planejamento da solução",
        options: [
            [
                "Google Kubernetes Engine, que entrega orquestração do Kubernetes com controle dos nós, políticas de rede e cargas com estado",
                true,
            ],
            [
                "Cloud Run, que executa cada contêiner como serviço gerenciado e escala pelo número de requisições que o serviço recebe",
                false,
            ],
            [
                "Funções do Cloud Run acionadas pelo Eventarc, com uma função publicada para cada microsserviço do conjunto migrado",
                false,
            ],
            [
                "Compute Engine com um grupo gerenciado de instâncias para cada microsserviço e script de inicialização subindo os contêineres",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa hospedar um sistema legado que exige um módulo de kernel próprio, uma versão específica de sistema operacional e acesso administrativo ao servidor. Qual opção de computação atende ao requisito?",
        explanation:
            "Só o Compute Engine entrega a máquina virtual com acesso de administrador, o que permite carregar módulo de kernel e fixar a versão do sistema operacional. Cloud Run, funções do Cloud Run e o modo Autopilot do GKE abstraem o sistema operacional e não aceitam essa personalização.",
        topic: "Planejamento da solução",
        options: [
            [
                "Compute Engine, que dá controle administrativo do sistema operacional e do kernel da máquina virtual criada",
                true,
            ],
            [
                "Cloud Run, que recebe a imagem de contêiner e deixa o Google cuidar de todo o ambiente de execução do serviço",
                false,
            ],
            [
                "Google Kubernetes Engine no modo Autopilot, em que o Google gerencia os nós e as configurações do cluster criado",
                false,
            ],
            [
                "Funções do Cloud Run, que empacotam o código em contêiner automaticamente e escalam por evento recebido",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer executar um trecho curto de código sempre que um arquivo novo chega a um bucket do Cloud Storage, sem manter nada em execução entre os eventos. Qual opção de computação atende ao requisito?",
        explanation:
            "As funções do Cloud Run são acionadas por eventos, como a criação de objeto no Cloud Storage, e não mantêm nada em execução entre as chamadas. As outras opções deixam VMs ou nós ligados fazendo consulta periódica, pagando pelo tempo ocioso.",
        topic: "Planejamento da solução",
        options: [
            [
                "Funções do Cloud Run, acionadas pelo evento de criação do objeto e cobradas apenas pelo tempo de execução",
                true,
            ],
            [
                "Compute Engine com uma máquina virtual pequena rodando um processo que consulta o bucket em intervalos regulares",
                false,
            ],
            [
                "Google Kubernetes Engine com um CronJob que lista o bucket e processa os objetos novos a cada minuto",
                false,
            ],
            [
                "Compute Engine com grupo gerenciado de instâncias escalando pela profundidade de uma fila de arquivos pendentes",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma produtora roda uma renderização em lote que grava o progresso em disco e pode ser retomada do último quadro concluído. A prioridade é o menor custo de computação. Qual configuração de máquina virtual atende?",
        explanation:
            "As Spot VMs custam bem menos que as sob demanda justamente porque o Compute Engine pode interrompê-las a qualquer momento, e a renderização com progresso salvo tolera isso. As opções sob demanda e o tipo personalizado não reduzem o preço na mesma proporção.",
        topic: "Planejamento da solução",
        options: [
            [
                "Spot VMs em um grupo gerenciado de instâncias, aceitando que o Compute Engine interrompa as máquinas a qualquer momento",
                true,
            ],
            [
                "Máquinas virtuais sob demanda em grupo gerenciado, com autoescalamento pela utilização média de CPU do grupo",
                false,
            ],
            [
                "Máquinas virtuais sob demanda com compromisso de uso de três anos, que cobra o período todo mesmo sem uso",
                false,
            ],
            [
                "Máquinas virtuais com tipo personalizado e memória estendida, dimensionadas para o maior projeto da fila de renderização",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma quer reduzir custo migrando cargas para Spot VMs e precisa escolher quais delas podem ir. Quais duas cargas são boas candidatas? (Selecione DUAS opções.)",
        explanation:
            "As Spot VMs podem ser interrompidas a qualquer momento e ficam fora do acordo de nível de serviço do Compute Engine, então servem a cargas tolerantes a falha, como lote com checkpoint e trabalhadores sem estado. Banco principal, servidor de licença e estação de trabalho precisam de continuidade.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um processamento em lote noturno que grava checkpoints e pode ser reiniciado do último ponto salvo em disco",
                true,
            ],
            [
                "Uma frota de trabalhadores sem estado que consome uma fila e tolera perder uma instância em andamento",
                true,
            ],
            [
                "O banco de dados principal da aplicação, com gravação contínua e sem réplica em outra zona",
                false,
            ],
            [
                "Um servidor de licença que precisa de endereço fixo e de tempo de atividade coberto por acordo de nível de serviço",
                false,
            ],
            [
                "A estação de desenvolvimento que a equipe mantém ligada por dias, com arquivos locais fora do controle de versão",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de análise usa muita memória e pouca CPU. O tipo predefinido com memória suficiente traz o dobro de vCPUs do necessário, e a licença do software é cobrada por vCPU. Qual configuração atende ao requisito?",
        explanation:
            "O tipo de máquina personalizado permite escolher vCPUs e memória de forma independente, o que evita pagar vCPU e licença que a carga não usa. As séries predefinidas impõem a proporção fixa, e o Local SSD não substitui memória nem reduz a contagem de vCPUs.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um tipo de máquina personalizado, definido com a quantidade de vCPUs e de memória que a carga realmente usa",
                true,
            ],
            [
                "Um tipo de máquina predefinido da série otimizada para computação, que entrega mais desempenho por vCPU",
                false,
            ],
            [
                "Um tipo de máquina predefinido maior com disco Local SSD usado como área de troca da memória da aplicação",
                false,
            ],
            [
                "Um grupo gerenciado de instâncias com tipos predefinidos pequenos, somando memória pela quantidade de réplicas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer continuar usando a API do Kubernetes e os manifestos que já mantém, porém sem dimensionar, atualizar nem pagar por nós ociosos. Qual configuração de cluster atende ao requisito?",
        explanation:
            "No modo Autopilot o Google provisiona e gerencia os nós, e a cobrança dos pods de uso geral segue os recursos que eles solicitam, sem nó ocioso na conta. Nos clusters Standard a equipe continua responsável pelos pools de nós e paga pela capacidade provisionada.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um cluster do GKE no modo Autopilot, em que o Google gerencia os nós e a cobrança acompanha os pods",
                true,
            ],
            [
                "Um cluster do GKE no modo Standard com autoescalador de cluster e atualização automática de nós ativada",
                false,
            ],
            [
                "Um cluster do GKE no modo Standard com pools de Spot VMs, para baixar o preço dos nós que ficam ociosos",
                false,
            ],
            [
                "Um cluster do GKE no modo Standard com nós de tipo personalizado ajustados ao consumo real dos pods",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema financeiro precisa de transações relacionais com consistência forte para usuários em três continentes e vai crescer além da capacidade de um servidor único, sem particionamento feito na aplicação. Qual produto de dados atende?",
        explanation:
            "O Spanner é o banco relacional do Google Cloud que escala horizontalmente mantendo consistência forte, inclusive em configuração multirregional. O Cloud SQL escala dentro de uma instância por região, e Bigtable e Firestore não oferecem o modelo relacional com transações entre tabelas.",
        topic: "Planejamento da solução",
        options: [
            [
                "Spanner, que é relacional, escala horizontalmente e mantém consistência forte na configuração multirregional",
                true,
            ],
            [
                "Cloud SQL para PostgreSQL com alta disponibilidade regional e réplicas de leitura criadas em outras regiões do mundo",
                false,
            ],
            [
                "Bigtable com um cluster em cada continente, replicando as linhas entre os clusters da mesma instância",
                false,
            ],
            [
                "Firestore no modo nativo com banco multirregional e as bibliotecas de cliente para web e dispositivos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de medidores inteligentes grava milhões de leituras por segundo e consulta sempre por chave de dispositivo e janela de tempo, exigindo latência de poucos milissegundos. Qual produto de dados atende?",
        explanation:
            "O Bigtable é a loja NoSQL de coluna larga desenhada para séries temporais, com altíssima taxa de escrita e leitura por chave de linha em poucos milissegundos. O Cloud SQL não acompanha esse volume de escrita e o BigQuery é analítico, com latência de consulta bem maior.",
        topic: "Planejamento da solução",
        options: [
            [
                "Bigtable, loja NoSQL de coluna larga feita para alta taxa de escrita e leitura por chave com baixa latência",
                true,
            ],
            [
                "Cloud SQL para MySQL com tabela particionada por data e índices nas colunas de dispositivo e de horário",
                false,
            ],
            [
                "BigQuery com tabelas particionadas por tempo e agrupadas por dispositivo, recebendo as leituras por streaming",
                false,
            ],
            [
                "Firestore no modo nativo com uma coleção por dispositivo e um documento para cada leitura registrada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de dados quer consultar com SQL vários terabytes de eventos históricos para relatórios e exploração sob demanda, sem provisionar nem dimensionar servidores. Qual produto de dados atende?",
        explanation:
            "O BigQuery é o data warehouse sem servidor do Google Cloud: a equipe envia SQL padrão e não provisiona capacidade para varrer terabytes. Cloud SQL e AlloyDB são bancos transacionais com instância provisionada, e o Bigtable não responde a consulta analítica livre.",
        topic: "Planejamento da solução",
        options: [
            [
                "BigQuery, data warehouse sem servidor que consulta grandes volumes de dados com SQL padrão",
                true,
            ],
            [
                "Cloud SQL para PostgreSQL com muitos vCPUs e réplicas de leitura dedicadas aos relatórios",
                false,
            ],
            [
                "AlloyDB para PostgreSQL com pool de leitura e mecanismo colunar ativado nas tabelas de eventos",
                false,
            ],
            [
                "Bigtable com uma instância de vários nós e esquema desenhado para varredura das faixas de chave",
                false,
            ],
        ],
    },
    {
        statement:
            "Um aplicativo móvel precisa que os usuários leiam e escrevam dados mesmo sem conexão, com sincronização automática e atualização em tempo real quando a rede volta. Qual produto de dados atende?",
        explanation:
            "A persistência offline do Firestore existe nas bibliotecas de Android, Apple e web: o aplicativo lê, escreve e observa o cache local e o Firestore sincroniza as alterações ao reconectar. Nas outras opções a equipe teria que construir o cache e a resolução de conflitos.",
        topic: "Planejamento da solução",
        options: [
            [
                "Firestore, cujas bibliotecas para Android, Apple e web guardam cache local e sincronizam ao reconectar",
                true,
            ],
            [
                "Cloud SQL para MySQL acessado por uma API intermediária que grava as alterações pendentes do aplicativo",
                false,
            ],
            [
                "Bigtable acessado pelo aplicativo por meio de uma camada de cache mantida no próprio dispositivo móvel",
                false,
            ],
            [
                "BigQuery consultado pelo aplicativo a cada abertura de tela, com os resultados guardados no dispositivo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa roda PostgreSQL autogerenciado em máquinas virtuais e quer um serviço gerenciado compatível com PostgreSQL, sem reescrever a aplicação. Quais dois produtos de dados atendem? (Selecione DUAS opções.)",
        explanation:
            "Cloud SQL para PostgreSQL e AlloyDB para PostgreSQL são os serviços gerenciados compatíveis com PostgreSQL, então a aplicação continua usando os mesmos drivers e ferramentas. Bigtable, Firestore e BigQuery têm outro modelo de dados e exigiriam reescrever o acesso.",
        topic: "Planejamento da solução",
        options: [
            [
                "Cloud SQL para PostgreSQL, serviço gerenciado que roda o PostgreSQL com backup e alta disponibilidade",
                true,
            ],
            [
                "AlloyDB para PostgreSQL, serviço gerenciado compatível com PostgreSQL e com mecanismo colunar opcional",
                true,
            ],
            [
                "Bigtable, loja NoSQL de coluna larga acessada por chave de linha e desenhada para séries temporais",
                false,
            ],
            [
                "Firestore no modo Datastore, banco de documentos com índices criados para cada propriedade gravada",
                false,
            ],
            [
                "BigQuery, data warehouse sem servidor que responde consultas analíticas em SQL padrão sobre vários terabytes",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa guarda backups mensais no Cloud Storage e lê cada arquivo no máximo uma vez por trimestre, nos testes de restauração. A equipe quer a classe que a documentação indica para esse padrão de acesso. Qual classe atende?",
        explanation:
            "A documentação do Cloud Storage associa a Coldline a dados que serão lidos ou alterados no máximo uma vez por trimestre, exatamente o teste de restauração descrito. A Nearline mira acesso mensal, a Archive acesso menor que anual e a Standard dados quentes.",
        topic: "Planejamento da solução",
        options: [
            [
                "Coldline, indicada para dados que serão lidos ou alterados no máximo uma vez por trimestre",
                true,
            ],
            [
                "Nearline, indicada para dados que serão lidos ou alterados em média uma vez por mês ou menos",
                false,
            ],
            [
                "Archive, indicada para dados cujo acesso previsto é menor que uma vez por ano durante a guarda",
                false,
            ],
            [
                "Standard, indicada para dados acessados com frequência e para dados guardados por períodos curtos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe roda um banco autogerenciado em uma máquina virtual e precisa que os dados sigam disponíveis se a zona inteira falhar, sem depender de restauração de backup. Qual opção de armazenamento atende?",
        explanation:
            "O disco permanente regional replica as gravações de forma sincrônica em duas zonas da mesma região, então o volume pode ser anexado a uma instância na zona que continuou de pé. Snapshot e espelho de Local SSD dependem de restauração ou morrem junto com a zona.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um disco permanente regional, que replica as gravações de forma sincrônica entre duas zonas da região",
                true,
            ],
            [
                "Um disco permanente zonal com snapshots frequentes, restaurados em outra zona assim que a falha aparecer",
                false,
            ],
            [
                "Discos Local SSD em espelho de software, montados na mesma máquina virtual que executa o banco",
                false,
            ],
            [
                "Um disco permanente zonal maior, com política de recursos de snapshot agendada de hora em hora",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe cria instâncias de processamento cujo volume guarda arquivos que podem ser regerados a partir de um bucket, mas que precisam continuar lá depois de parar e iniciar a instância. A prioridade é o menor custo por gigabyte com desempenho estável. Qual opção de armazenamento atende?",
        explanation:
            "O disco permanente zonal é o mais barato por gigabyte entre as opções com desempenho estável e mantém o conteúdo quando a instância é parada e iniciada. O Local SSD perde os dados nessa parada, o disco regional cobra pela replicação em duas zonas e o Filestore existe para compartilhar arquivos por NFS, não para baixar o custo.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um disco permanente zonal, suficiente porque os arquivos podem ser regerados a partir do bucket de origem",
                true,
            ],
            [
                "Um disco permanente regional, que replica as gravações entre duas zonas e cobra mais por gigabyte",
                false,
            ],
            [
                "Um disco Local SSD, anexado ao servidor anfitrião e perdido quando a instância para ou é encerrada por falha",
                false,
            ],
            [
                "Um volume do Filestore montado por NFS em todas as instâncias de processamento do grupo gerenciado",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa serve um site HTTPS para usuários de vários continentes e quer um único endereço IP que leve cada usuário para a região de back-end mais próxima. Qual balanceador de carga atende?",
        explanation:
            "O Application Load Balancer externo global usa um endereço IP anycast único e envia cada usuário para a região de back-end mais próxima, trabalhando no nível 7. O regional só atende back-ends de uma região e o de passagem atua no nível 4, sem interpretar HTTP.",
        topic: "Planejamento da solução",
        options: [
            [
                "O Application Load Balancer externo global, que distribui tráfego HTTP e HTTPS para back-ends em várias regiões",
                true,
            ],
            [
                "O Application Load Balancer externo regional, que atende tráfego HTTP e HTTPS apenas de back-ends de uma única região",
                false,
            ],
            [
                "O Network Load Balancer de passagem externo, que entrega pacotes TCP e UDP preservando o IP de origem",
                false,
            ],
            [
                "O Application Load Balancer interno entre regiões, que distribui tráfego HTTP e HTTPS dentro da rede VPC",
                false,
            ],
        ],
    },
    {
        statement:
            "Um estúdio precisa balancear tráfego UDP para servidores de jogo em uma região, e o aplicativo precisa enxergar o endereço IP de origem de cada jogador. Qual balanceador de carga atende?",
        explanation:
            "O Network Load Balancer de passagem externo é o único da lista que balanceia UDP e entrega os pacotes sem proxy, de modo que o servidor enxerga o IP de origem do jogador. Os Application Load Balancers só tratam HTTP e HTTPS, e o de proxy encerra a conexão.",
        topic: "Planejamento da solução",
        options: [
            [
                "O Network Load Balancer de passagem externo regional, que trata UDP sem proxy e preserva o IP de origem",
                true,
            ],
            [
                "O Application Load Balancer externo global, que termina HTTP e HTTPS e encaminha para back-ends regionais",
                false,
            ],
            [
                "O Network Load Balancer de proxy externo global, que termina a conexão TCP e aceita descarga de SSL",
                false,
            ],
            [
                "O Application Load Balancer externo regional, que inspeciona cabeçalhos HTTP e roteia por caminho de URL",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação interna chama um serviço HTTP de outro time na mesma rede VPC e na mesma região, com roteamento por caminho de URL e sem nenhuma exposição à internet. Qual balanceador de carga atende?",
        explanation:
            "O Application Load Balancer interno regional faz balanceamento de nível 7 com roteamento por caminho de URL para clientes de dentro da rede VPC. Os balanceadores externos expõem a aplicação à internet e o de passagem interno atua no nível 4, sem ler a URL.",
        topic: "Planejamento da solução",
        options: [
            [
                "O Application Load Balancer interno regional, que roteia tráfego HTTP e HTTPS dentro da rede VPC",
                true,
            ],
            [
                "O Application Load Balancer externo regional, que recebe tráfego HTTP e HTTPS vindo da internet",
                false,
            ],
            [
                "O Network Load Balancer de passagem interno, que distribui pacotes de nível 4 dentro da rede VPC",
                false,
            ],
            [
                "O Network Load Balancer de proxy externo global, que encerra conexões TCP vindas da internet pública",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe está desenhando o projeto e quer separar os recursos pelo escopo que cada um ocupa no Google Cloud. Quais dois recursos são globais? (Selecione DUAS opções.)",
        explanation:
            "A rede VPC e as regras de firewall são recursos globais, ou seja, valem em qualquer região do projeto. A sub-rede e o grupo gerenciado regional vivem dentro de uma região, e o disco permanente zonal só pode ser anexado a instâncias da mesma zona.",
        topic: "Planejamento da solução",
        options: [
            [
                "A rede VPC, que vale em qualquer região do projeto, mesmo com as sub-redes sendo recursos regionais",
                true,
            ],
            [
                "As regras de firewall da VPC, que se aplicam à rede inteira e não a uma região específica dela",
                true,
            ],
            [
                "A sub-rede, que segmenta o espaço de endereços IP dentro de uma única região da rede VPC",
                false,
            ],
            [
                "O disco permanente zonal, que só pode ser anexado a instâncias que estejam na mesma zona",
                false,
            ],
            [
                "O grupo gerenciado de instâncias regional, que distribui as instâncias entre as zonas de uma região",
                false,
            ],
        ],
    },
    {
        statement:
            "Um processamento em lote roda em uma única região e envia resultados para a internet, sem sensibilidade a latência, e a equipe quer reduzir o custo de saída de rede. Qual nível de serviço de rede atende?",
        explanation:
            "O nível Standard entrega o tráfego por redes de trânsito e provedores, com preço de saída menor, e a documentação o indica justamente para cargas de uma região que não são sensíveis a latência. O nível Premium usa a rede do Google e é exigido pelos balanceadores globais.",
        topic: "Planejamento da solução",
        options: [
            [
                "O nível Standard, que usa redes de trânsito e de provedores para alcançar os usuários, com custo menor",
                true,
            ],
            [
                "O nível Premium, que carrega o tráfego pela rede do Google até o ponto de presença mais próximo do usuário",
                false,
            ],
            [
                "O nível Premium com Application Load Balancer externo global e endereço IP anycast para o lote",
                false,
            ],
            [
                "O nível Standard com Application Load Balancer externo global e back-ends em três regiões distintas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer que uma frota de servidores web sem estado continue atendendo se uma zona inteira da região ficar indisponível, sem nenhuma intervenção manual. Qual configuração atende ao requisito?",
        explanation:
            "O grupo gerenciado de instâncias regional cria instâncias em várias zonas da região, então a perda de uma zona deixa as demais atendendo. Os grupos zonais ficam presos a uma zona, e reparo automático ou disco regional não resolvem a queda da zona inteira.",
        topic: "Planejamento da solução",
        options: [
            [
                "Um grupo gerenciado de instâncias regional, que espalha as instâncias pelas zonas da região",
                true,
            ],
            [
                "Um grupo gerenciado de instâncias zonal com autoescalamento por utilização de CPU configurado",
                false,
            ],
            [
                "Um grupo gerenciado de instâncias zonal com política de reparo automático de instâncias ativada",
                false,
            ],
            [
                "Um grupo gerenciado de instâncias zonal com disco permanente regional anexado a cada instância",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai criar uma VM no Compute Engine com um disco persistente adicional de 500 GB que precisa continuar existindo depois que a instância for excluída. Qual trecho do comando gcloud compute instances create atende ao pedido?",
        explanation:
            "A opção --create-disk cria um disco novo junto com a VM e aceita a chave auto-delete; com auto-delete=no o disco sobrevive à exclusão da instância. Com yes ele é apagado junto, --boot-disk-size só mexe no disco de inicialização, e --disk anexa um disco que já existe em vez de criar.",
        topic: "Implantação",
        options: [
            ["--create-disk=name=dados,size=500GB,auto-delete=no", true],
            ["--create-disk=name=dados,size=500GB,auto-delete=yes", false],
            ["--boot-disk-size=500GB --no-boot-disk-auto-delete", false],
            ["--disk=name=dados,size=500GB,auto-delete=no", false],
        ],
    },
    {
        statement:
            "Uma empresa roda um processamento em lote tolerante a interrupções e quer que a VM seja encerrada durante a manutenção do host, sem reinício automático depois. Quais opções do comando de criação da instância configuram essa política de disponibilidade? (Selecione DUAS opções.)",
        explanation:
            "A política de disponibilidade tem duas partes: --maintenance-policy define o comportamento na manutenção do host, e TERMINATE encerra em vez de migrar ao vivo; --no-restart-on-failure desliga o reinício automático. MIGRATE e --restart-on-failure são os padrões, e SPOT muda o modelo de provisionamento, não a política.",
        topic: "Implantação",
        options: [
            ["Usar --maintenance-policy=TERMINATE no comando", true],
            ["Usar --no-restart-on-failure no comando", true],
            ["Usar --restart-on-failure", false],
            ["Usar --maintenance-policy=MIGRATE, o valor padrão", false],
            ["Usar --provisioning-model=SPOT", false],
        ],
    },
    {
        statement:
            "Uma empresa quer centralizar no IAM o acesso SSH às VMs do Compute Engine, em vez de distribuir chaves públicas pelos metadados. Qual configuração habilita o OS Login em todas as instâncias do projeto?",
        explanation:
            "O OS Login é ligado pelo metadado enable-oslogin=TRUE, que vale para o projeto inteiro ou para uma instância, e faz o agente ignorar as chaves guardadas em ssh-keys. O metadado ssh-keys faz o oposto, enable-osconfig ativa o VM Manager, e os papéis do IAM só surtem efeito depois que o OS Login está habilitado.",
        topic: "Implantação",
        options: [
            ["Adicionar o metadado enable-oslogin=TRUE ao projeto", true],
            ["Adicionar o metadado ssh-keys ao projeto", false],
            ["Adicionar o metadado enable-osconfig=TRUE ao projeto", false],
            ["Conceder roles/compute.osAdminLogin aos usuários do projeto", false],
        ],
    },
    {
        statement:
            "Uma equipe criou o template de instância api-tpl e precisa subir um grupo gerenciado zonal chamado api-mig com três VMs a partir dele. Qual comando cria o grupo?",
        explanation:
            "O grupo gerenciado nasce de um template com instance-groups managed create, informando --template, --size e a zona. O grupo não gerenciado não aceita template nem cria VMs, instances create sobe uma única VM a partir do template, e create-instance apenas acrescenta uma VM a um grupo que já existe.",
        topic: "Implantação",
        options: [
            [
                "gcloud compute instance-groups managed create api-mig --template=api-tpl --size=3 --zone=us-central1-a",
                true,
            ],
            [
                "gcloud compute instance-groups unmanaged create api-mig --template=api-tpl --size=3 --zone=us-central1-a",
                false,
            ],
            [
                "gcloud compute instances create api-mig --source-instance-template=api-tpl --zone=us-central1-a",
                false,
            ],
            [
                "gcloud compute instance-groups managed create-instance api-mig --template=api-tpl",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe criou o grupo gerenciado de instâncias assim:\n\n```\ngcloud compute instance-groups managed create web-mig \\\n  --template=web-tpl --size=3 --zone=us-central1-a\n```\n\nAgora o grupo precisa crescer até vinte VMs quando a CPU média passar de 60 por cento, com noventa segundos de espera para a VM inicializar. Qual comando configura o autoscaling?",
        explanation:
            "O autoscaler de um grupo gerenciado é criado com set-autoscaling, onde --max-num-replicas é obrigatório, --target-cpu-utilization recebe uma fração como 0.6 e --cool-down-period dá tempo de inicialização à VM. Não existe update-autoscaling, resize fixa o tamanho sem escalar, e o template não guarda regra de escala.",
        topic: "Implantação",
        options: [
            [
                "gcloud compute instance-groups managed set-autoscaling web-mig --max-num-replicas=20 --target-cpu-utilization=0.6 --cool-down-period=90",
                true,
            ],
            [
                "gcloud compute instance-groups managed update-autoscaling web-mig --max-num-replicas=20 --target-cpu-utilization=0.6 --cool-down-period=90",
                false,
            ],
            [
                "gcloud compute instance-groups managed resize web-mig --size=20 --target-cpu-utilization=0.6",
                false,
            ],
            [
                "gcloud compute instance-templates create web-tpl --max-num-replicas=20 --cool-down-period=90",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer aplicar correções de sistema operacional em lote nas VMs do Compute Engine e consultar o inventário de pacotes instalados, sem ferramentas de terceiros. O que precisa estar configurado nas instâncias?",
        explanation:
            "O VM Manager cuida de patch, inventário e políticas de SO, e depende do agente do OS Config, que vem nas imagens suportadas mas só entra em ação com o metadado enable-osconfig=TRUE. O agente Ops coleta métricas e logs, enable-oslogin trata de acesso SSH, e a porta 22 não tem relação com patch.",
        topic: "Implantação",
        options: [
            [
                "O agente do OS Config ativo, com o metadado enable-osconfig=TRUE nas instâncias",
                true,
            ],
            ["O agente Ops ativo, com o metadado enable-oslogin=TRUE nas instâncias", false],
            ["O agente convidado padrão, com a API do Compute Engine habilitada no projeto", false],
            [
                "O agente do OS Config ativo e uma política de firewall de saída liberando a porta 22",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa acabou de instalar a gcloud CLI em uma máquina nova e precisa administrar um cluster regional do GKE pela linha de comando. Qual sequência prepara o ambiente?",
        explanation:
            "O kubectl e o plugin gke-gcloud-auth-plugin são componentes da gcloud CLI, instalados com gcloud components install, e o contexto do cluster vem de gcloud container clusters get-credentials com --location. O describe só mostra o cluster, set-cluster à mão ignora a autenticação, e gcloud auth login não cria contexto.",
        topic: "Implantação",
        options: [
            [
                "Instalar os componentes kubectl e gke-gcloud-auth-plugin e rodar gcloud container clusters get-credentials com --location",
                true,
            ],
            [
                "Instalar o componente kubectl e rodar gcloud container clusters describe para gerar o arquivo kubeconfig",
                false,
            ],
            [
                "Instalar os componentes kubectl e gke-gcloud-auth-plugin e rodar kubectl config set-cluster apontando para o plano de controle",
                false,
            ],
            [
                "Instalar o componente kubectl e rodar gcloud auth login, que já escreve o contexto do cluster no kubeconfig",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma startup quer um cluster do GKE em que o Google cuide do provisionamento e do dimensionamento dos nós, cobrando pelos recursos que os pods pedem, e não quer gerenciar pools de nós. Qual comando cria esse cluster?",
        explanation:
            "O modo Autopilot é criado com clusters create-auto: o Google gerencia nós e capacidade, e a cobrança segue os recursos que os pods pedem. O clusters create monta um cluster Standard, onde --enable-autoscaling e --enable-autoprovisioning ainda deixam os pools sob sua responsabilidade, e node-pools create-auto não existe.",
        topic: "Implantação",
        options: [
            [
                "gcloud container clusters create-auto loja --location=us-central1 --project=loja-prod",
                true,
            ],
            [
                "gcloud container clusters create loja --location=us-central1 --enable-autoscaling",
                false,
            ],
            [
                "gcloud container clusters create loja --location=us-central1 --enable-autoprovisioning",
                false,
            ],
            [
                "gcloud container node-pools create-auto loja --cluster=loja --location=us-central1",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa de um cluster Standard do GKE cujos nós só tenham endereços IP internos e cujo endpoint externo do plano de controle fique desativado. Quais opções do comando de criação atendem a isso? (Selecione DUAS opções.)",
        explanation:
            "Nós sem IP externo vêm de --enable-private-nodes, e desativar o endpoint externo do plano de controle vem de --enable-private-endpoint. As redes autorizadas apenas restringem quem alcança o endpoint externo, a política de rede filtra tráfego entre pods, e basic-auth trata de autenticação.",
        topic: "Implantação",
        options: [
            ["--enable-private-nodes", true],
            ["--enable-private-endpoint", true],
            ["--enable-master-authorized-networks", false],
            ["--enable-network-policy", false],
            ["--no-enable-basic-auth", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que o plano de controle do cluster do GKE continue disponível se uma zona cair, e que os nós fiquem distribuídos em três zonas da mesma região. Qual comando cria o cluster?",
        explanation:
            "Um cluster regional nasce quando --location recebe uma região, e não uma zona: o plano de controle é replicado em várias zonas e, por padrão, cada pool espalha nós por três zonas, com --num-nodes contando nós por zona. Uma zona em --location gera cluster zonal, e não existe --enable-multi-zonal.",
        topic: "Implantação",
        options: [
            ["gcloud container clusters create vendas --location=us-central1 --num-nodes=2", true],
            [
                "gcloud container clusters create vendas --location=us-central1-a --num-nodes=6",
                false,
            ],
            [
                "gcloud container clusters create vendas --location=us-central1-a --node-locations=us-central1-b,us-central1-c",
                false,
            ],
            [
                "gcloud container clusters create vendas --location=us-central1 --num-nodes=2 --enable-multi-zonal",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tem clusters do Kubernetes no Google Cloud, em outra nuvem e no próprio datacenter, e quer gerenciar configuração, política e malha de serviços de todos em um lugar só. Qual produto atende?",
        explanation:
            "O GKE Enterprise é a camada de gerenciamento multicluster do GKE, antes chamada de Anthos: os clusters, estejam no Google Cloud, em outra nuvem ou no datacenter, são registrados em uma frota e recebem configuração, política e malha de serviços de forma central. Autopilot é um modo de cluster.",
        topic: "Implantação",
        options: [
            ["GKE Enterprise, com os clusters registrados em uma frota", true],
            ["GKE Autopilot, com os clusters registrados em uma frota", false],
            ["Cloud Service Mesh, com um cluster Standard por ambiente", false],
            ["Config Connector, instalado como complemento em cada cluster", false],
        ],
    },
    {
        statement:
            "Uma equipe já criou o Deployment web no cluster do GKE a partir de uma imagem do Artifact Registry. O contêiner escuta na porta 8080 e a aplicação precisa receber tráfego da internet na porta 80. Qual comando publica o acesso?",
        explanation:
            "O kubectl expose cria um Service; com --type LoadBalancer o GKE provisiona um balanceador com IP público, onde --port é a porta do Service e --target-port a do contêiner. ClusterIP só atende dentro do cluster, NodePort com as portas trocadas não encaixa, e port-forward é um túnel local temporário.",
        topic: "Implantação",
        options: [
            [
                "kubectl expose deployment web --type LoadBalancer --port 80 --target-port 8080",
                true,
            ],
            ["kubectl expose deployment web --type ClusterIP --port 80 --target-port 8080", false],
            ["kubectl expose deployment web --type NodePort --port 8080 --target-port 80", false],
            [
                "kubectl port-forward deployment/web 80:8080 --address 0.0.0.0 --namespace default",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe tem o código de um serviço HTTP em um diretório local, sem Dockerfile e sem Docker instalado na máquina, e quer publicá-lo no Cloud Run. Qual comando resolve?",
        explanation:
            "Com --source o Cloud Run manda o código para o Cloud Build, que usa buildpacks para gerar a imagem e a guarda em um repositório do Artifact Registry chamado cloud-run-source-deploy, sem exigir Dockerfile. A opção --image espera imagem já publicada, builds submit só constrói, e services update não aceita código.",
        topic: "Implantação",
        options: [
            ["gcloud run deploy loja --source . --region=us-central1", true],
            ["gcloud run deploy loja --image . --region=us-central1", false],
            ["gcloud builds submit --tag loja --region=us-central1", false],
            ["gcloud run services update loja --source . --region=us-central1", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que um serviço do Cloud Run processe cada arquivo novo gravado em um bucket do Cloud Storage. Qual configuração de gatilho do Eventarc atende ao pedido?",
        explanation:
            "Arquivo novo no bucket gera o evento google.cloud.storage.object.v1.finalized, e o gatilho do Eventarc filtra por esse tipo mais o bucket. O evento deleted dispara na exclusão, o filtro de log de auditoria responde a chamadas de API, e a assinatura push do Pub/Sub não observa mudanças de objeto sozinha.",
        topic: "Implantação",
        options: [
            [
                'Um gatilho com --event-filters="type=google.cloud.storage.object.v1.finalized" e --event-filters="bucket=NOME"',
                true,
            ],
            [
                'Um gatilho com --event-filters="type=google.cloud.storage.object.v1.deleted" e --event-filters="bucket=NOME"',
                false,
            ],
            [
                'Um gatilho com --event-filters="type=google.cloud.audit.log.v1.written" e --event-filters="bucket=NOME"',
                false,
            ],
            [
                "Uma assinatura push do Pub/Sub apontando para a URL do serviço, com --push-auth-service-account e --ack-deadline",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe escreveu em Python uma função que recebe um CloudEvent e quer publicá-la como função do Cloud Run, a partir do código do diretório atual, com o ponto de entrada processa_msg. Qual comando faz a implantação?",
        explanation:
            "Na documentação atual as Cloud Functions aparecem como funções do Cloud Run e são implantadas com gcloud run deploy, usando --function para o ponto de entrada e --base-image para o ambiente de execução. Não existe --entry-point nesse comando, services create não constrói código, e o Eventarc só cria gatilhos.",
        topic: "Implantação",
        options: [
            [
                "gcloud run deploy fila --source . --function processa_msg --base-image python312 --region=us-central1",
                true,
            ],
            [
                "gcloud run deploy fila --source . --entry-point processa_msg --base-image python312 --region=us-central1",
                false,
            ],
            [
                "gcloud run services create fila --source . --function processa_msg --region=us-central1",
                false,
            ],
            [
                "gcloud eventarc triggers create fila --source . --function processa_msg --region=us-central1",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que mensagens de um tópico do Pub/Sub cheguem a um serviço privado do Cloud Run por assinatura push autenticada. O que falta, além de criar a assinatura com --push-endpoint?",
        explanation:
            "Em push autenticado, a assinatura assina um token com a conta indicada em --push-auth-service-account, e essa conta precisa de roles/run.invoker no serviço do Cloud Run. O papel de publicador serve para enviar mensagens ao tópico, abrir o serviço a todos elimina a autenticação, e dead letter trata de falhas.",
        topic: "Implantação",
        options: [
            [
                "Informar --push-auth-service-account e conceder roles/run.invoker a essa conta no serviço",
                true,
            ],
            [
                "Informar --push-auth-service-account e conceder roles/pubsub.publisher a essa conta no tópico",
                false,
            ],
            [
                "Publicar o serviço com --allow-unauthenticated e deixar a assinatura sem conta de serviço",
                false,
            ],
            [
                "Informar --dead-letter-topic e conceder roles/iam.serviceAccountUser à conta do Pub/Sub",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe tem uma API HTTP sem estado em contêiner, com tráfego muito irregular, e não quer administrar servidores nem pagar por capacidade ociosa. Onde implantar essa API?",
        explanation:
            "O Cloud Run roda contêineres sem estado, escala conforme as requisições, pode cair a zero instâncias e cobra pelo uso, o que encaixa em tráfego irregular. GKE Standard e grupo gerenciado mantêm nós ligados e exigem administração, e instâncias mínimas reservadas pagam capacidade ociosa.",
        topic: "Implantação",
        options: [
            ["No Cloud Run, que escala por requisição e pode ir a zero instâncias", true],
            ["No GKE Standard, com um pool de nós e autoscaling de cluster", false],
            ["Em um grupo gerenciado do Compute Engine, com autoscaling por CPU", false],
            ["No App Engine ambiente flexível, com instâncias mínimas sempre reservadas", false],
        ],
    },
    {
        statement:
            "Uma empresa vai implantar um banco PostgreSQL gerenciado que precisa continuar atendendo se a zona principal falhar, com failover automático para outra zona da mesma região. Qual comando cria a instância?",
        explanation:
            "A alta disponibilidade do Cloud SQL vem de --availability-type=REGIONAL, que mantém uma instância em espera em outra zona da mesma região e faz failover automático. O valor ZONAL deixa tudo em uma zona, a recuperação pontual trata de backup, e --master-instance-name cria réplica de leitura.",
        topic: "Implantação",
        options: [
            [
                "gcloud sql instances create pedidos --database-version=POSTGRES_16 --region=us-central1 --availability-type=REGIONAL",
                true,
            ],
            [
                "gcloud sql instances create pedidos --database-version=POSTGRES_16 --region=us-central1 --availability-type=ZONAL",
                false,
            ],
            [
                "gcloud sql instances create pedidos --database-version=POSTGRES_16 --region=us-central1 --enable-point-in-time-recovery",
                false,
            ],
            [
                "gcloud sql instances create pedidos --database-version=POSTGRES_16 --region=us-central1 --master-instance-name=pedidos-2",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe tem um arquivo CSV com cabeçalho em gs://loja-dados/vendas.csv e quer carregá-lo em uma tabela nova do BigQuery, deixando o esquema ser descoberto automaticamente. Qual comando faz a carga?",
        explanation:
            "No bq load a ordem dos argumentos é fixa: primeiro dataset.tabela, depois o caminho de origem. A opção --autodetect descobre o esquema e --skip_leading_rows=1 ignora o cabeçalho. Inverter destino e origem falha, bq mk apenas cria o recurso vazio, e gcloud storage cp copia objetos.",
        topic: "Implantação",
        options: [
            [
                "bq load --autodetect --source_format=CSV --skip_leading_rows=1 loja.vendas gs://loja-dados/vendas.csv",
                true,
            ],
            [
                "bq load --autodetect --source_format=CSV --skip_leading_rows=1 gs://loja-dados/vendas.csv loja.vendas",
                false,
            ],
            [
                "bq mk --autodetect --source_format=CSV --skip_leading_rows=1 loja.vendas gs://loja-dados/vendas.csv",
                false,
            ],
            [
                "gcloud storage cp gs://loja-dados/vendas.csv bq://loja.vendas --source_format=CSV",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa mover vários petabytes de um bucket do Amazon S3 para o Cloud Storage, de forma recorrente e sem escrever código. Quais afirmações sobre o Storage Transfer Service descrevem esse cenário? (Selecione DUAS opções.)",
        explanation:
            "O Storage Transfer Service é indicado para volumes grandes e move objetos direto do Amazon S3, do Azure Blob Storage, de listas HTTP ou de outro bucket, com jobs que podem rodar em agenda. Agentes só entram quando a origem é sistema de arquivos ou HDFS, e para um arquivo pequeno basta gcloud storage cp.",
        topic: "Implantação",
        options: [
            ["O serviço transfere direto do Amazon S3 para um bucket do Cloud Storage", true],
            ["O serviço aceita agendamento recorrente do job de transferência de dados", true],
            [
                "O serviço exige instalar agentes de transferência em máquinas da própria empresa",
                false,
            ],
            ["O serviço grava os objetos em uma tabela do BigQuery em vez de um bucket", false],
            [
                "O serviço é a forma recomendada de subir um arquivo único pequeno da máquina local",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai implantar um banco de documentos gerenciado para um aplicativo móvel, no modo nativo do Firestore, usando a linha de comando. Qual comando cria o banco?",
        explanation:
            "O comando é gcloud firestore databases create, com --location obrigatório e --type=firestore-native para o modo nativo. O valor datastore-mode serve a cargas que vinham do Datastore, --region não é aceito nesse comando, e não existe um grupo gcloud datastore databases para criar o banco.",
        topic: "Implantação",
        options: [
            ["gcloud firestore databases create --location=nam5 --type=firestore-native", true],
            ["gcloud firestore databases create --location=nam5 --type=datastore-mode", false],
            [
                "gcloud firestore databases create --region=us-central1 --type=firestore-native",
                false,
            ],
            ["gcloud datastore databases create --location=nam5 --type=firestore-native", false],
        ],
    },
    {
        statement:
            "Uma fintech precisa de um banco relacional gerenciado com transações fortemente consistentes, esquema SQL e escrita distribuída em várias regiões, sem fragmentar a aplicação à mão. Qual produto implantar?",
        explanation:
            "O Spanner combina esquema SQL, transações fortemente consistentes e escrita distribuída, e a configuração multirregional é escolhida em --config na criação da instância. Cloud SQL e AlloyDB mantêm uma instância primária por região, e o Bigtable não é relacional nem oferece SQL completo.",
        topic: "Implantação",
        options: [
            ["Spanner, com uma configuração de instância multirregional", true],
            ["Cloud SQL, com --availability-type=REGIONAL e réplicas de leitura", false],
            ["AlloyDB, com um cluster e uma instância primária por região", false],
            ["Bigtable, com um cluster em cada região e replicação ativa", false],
        ],
    },
    {
        statement:
            "Uma equipe quer implantar um pipeline que lê mensagens de um tópico do Pub/Sub e grava em uma tabela do BigQuery, usando um modelo pronto do Google e sem compilar código. Qual comando inicia o job?",
        explanation:
            "Modelos clássicos do Dataflow são executados com gcloud dataflow jobs run, apontando --gcs-location para o modelo no Cloud Storage e passando os parâmetros do pipeline. Não existe jobs create nem --template-file nesse comando, e flex-template build apenas empacota um modelo novo em vez de iniciar o job.",
        topic: "Implantação",
        options: [
            [
                "gcloud dataflow jobs run fila-bq --gcs-location=gs://dataflow-templates/latest/PubSub_to_BigQuery --region=us-central1",
                true,
            ],
            [
                "gcloud dataflow jobs create fila-bq --gcs-location=gs://dataflow-templates/latest/PubSub_to_BigQuery --region=us-central1",
                false,
            ],
            [
                "gcloud dataflow jobs run fila-bq --template-file=PubSub_to_BigQuery --region=us-central1",
                false,
            ],
            [
                "gcloud dataflow flex-template build fila-bq --image-gcr-path=gcr.io/loja/fila --region=us-central1",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer criar uma VPC em que nenhuma sub-rede apareça automaticamente, para escolher à mão cada faixa de IP e cada região. Qual comando cria essa rede?",
        explanation:
            "Em modo personalizado nenhuma sub-rede nasce com a VPC, e isso vem de --subnet-mode=custom; as sub-redes entram depois com networks subnets create informando --range e --region. No modo auto o Google cria uma sub-rede por região, --bgp-routing-mode trata do alcance das rotas dinâmicas, e --purpose classifica sub-rede reservada.",
        topic: "Implantação",
        options: [
            ["gcloud compute networks create corp --subnet-mode=custom", true],
            ["gcloud compute networks create corp --subnet-mode=auto", false],
            ["gcloud compute networks create corp --bgp-routing-mode=global", false],
            ["gcloud compute networks subnets create corp --purpose=PRIVATE", false],
        ],
    },
    {
        statement:
            "Uma organização quer que equipes de projetos diferentes usem sub-redes de uma única VPC mantida por um projeto central. Quais passos montam essa VPC compartilhada? (Selecione DUAS opções.)",
        explanation:
            "A VPC compartilhada começa com shared-vpc enable no projeto host e segue com associated-projects add para cada projeto de serviço, que depois recebe roles/compute.networkUser na rede ou em sub-redes. Peering liga redes distintas, o papel xpnAdmin é concedido na organização ou pasta, e sub-rede não muda de projeto.",
        topic: "Implantação",
        options: [
            ["Habilitar o projeto host com o comando gcloud compute shared-vpc enable", true],
            [
                "Anexar cada projeto de serviço com gcloud compute shared-vpc associated-projects add",
                true,
            ],
            ["Criar um peering de VPC entre o projeto host e cada projeto de serviço", false],
            ["Conceder roles/compute.xpnAdmin a cada projeto de serviço na própria VPC", false],
            [
                "Mover as sub-redes para cada projeto de serviço com gcloud compute networks subnets update",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa liberar a porta 8080 de entrada apenas nas VMs que rodam com a conta de serviço app-sa, sem depender de alguém marcar a instância corretamente. Qual comando cria a regra?",
        explanation:
            "Para a regra valer nas VMs de uma conta de serviço, o alvo é --target-service-accounts, que não depende de tag aplicada à instância. A opção --target-tags filtra por tag de rede, --source-service-accounts descreve quem origina o tráfego, e EGRESS trataria da saída em vez da entrada.",
        topic: "Implantação",
        options: [
            [
                "gcloud compute firewall-rules create app-in --direction=INGRESS --allow=tcp:8080 --target-service-accounts=app-sa@proj.iam.gserviceaccount.com",
                true,
            ],
            [
                "gcloud compute firewall-rules create app-in --direction=INGRESS --allow=tcp:8080 --target-tags=app-sa",
                false,
            ],
            [
                "gcloud compute firewall-rules create app-in --direction=INGRESS --allow=tcp:8080 --source-service-accounts=app-sa@proj.iam.gserviceaccount.com",
                false,
            ],
            [
                "gcloud compute firewall-rules create app-in --direction=EGRESS --allow=tcp:8080 --target-service-accounts=app-sa@proj.iam.gserviceaccount.com",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer bloquear toda a saída das VMs marcadas com a tag restrita, liberando apenas a faixa 10.20.0.0/16. Qual combinação de regras de firewall produz esse comportamento?",
        explanation:
            "Em regras de firewall, prioridade com número menor vence. Negar 0.0.0.0/0 na saída com prioridade 1000 e permitir 10.20.0.0/16 com 900 deixa passar só a faixa desejada. Inverter as prioridades bloqueia tudo, --source-ranges não define destino na saída, e regra de entrada não controla a saída.",
        topic: "Implantação",
        options: [
            [
                "Uma regra de saída de negação para 0.0.0.0/0 com prioridade 1000 e uma de permissão para 10.20.0.0/16 com prioridade 900, ambas com --target-tags=restrita",
                true,
            ],
            [
                "Uma regra de saída de negação para 0.0.0.0/0 com prioridade 900 e uma de permissão para 10.20.0.0/16 com prioridade 1000, ambas com --target-tags=restrita",
                false,
            ],
            [
                "Uma regra de saída de permissão para 10.20.0.0/16 com --source-ranges=10.20.0.0/16 e --target-tags=restrita, sem regra de negação",
                false,
            ],
            [
                "Uma regra de entrada de negação para 0.0.0.0/0 e uma de entrada de permissão para 10.20.0.0/16, ambas com --target-tags=restrita",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa ligar a VPC do Google Cloud ao datacenter próprio por um túnel IPsec, com o maior nível de disponibilidade contratual oferecido pelo Cloud VPN. O que a implantação exige?",
        explanation:
            "O nível mais alto de disponibilidade do Cloud VPN é da HA VPN, que usa um gateway com duas interfaces, dois túneis e roteamento dinâmico por BGP em um Cloud Router. A VPN clássica aceita somente rota estática, o peering de VPC liga duas redes do Google Cloud e não é transitivo, e um túnel só não alcança o compromisso maior.",
        topic: "Implantação",
        options: [
            [
                "Um gateway de HA VPN com dois túneis e um Cloud Router anunciando rotas por BGP",
                true,
            ],
            [
                "Um gateway de VPN clássica com rotas estáticas e dois túneis para o mesmo par de IPs",
                false,
            ],
            ["Um peering de VPC entre a rede do Google Cloud e a rede do datacenter", false],
            ["Um gateway de HA VPN com um túnel e rotas estáticas definidas à mão na VPC", false],
        ],
    },
    {
        statement:
            "Uma empresa quer executar configurações do Terraform pelo próprio Google Cloud, com o estado guardado e gerenciado pelo provedor, sem manter um servidor de automação. Qual serviço usar?",
        explanation:
            "O Infrastructure Manager é o serviço gerenciado que executa Terraform no Google Cloud, guarda o estado em um bucket do Cloud Storage e é acionado por gcloud infra-manager deployments apply. O Deployment Manager foi encerrado, o Config Connector trabalha com recursos do Kubernetes, e o Cloud Build só executaria o Terraform.",
        topic: "Implantação",
        options: [
            [
                "Infrastructure Manager, aplicando a configuração com gcloud infra-manager deployments apply",
                true,
            ],
            [
                "Deployment Manager, aplicando a configuração com gcloud deployment-manager deployments create",
                false,
            ],
            [
                "Config Connector, aplicando a configuração com kubectl apply em um cluster do GKE",
                false,
            ],
            ["Cloud Build, aplicando a configuração com um passo que roda terraform apply", false],
        ],
    },
    {
        statement:
            "Uma equipe de plataforma já descreve tudo em manifestos do Kubernetes e quer criar buckets e instâncias do Cloud SQL com os mesmos manifestos e o mesmo fluxo de revisão. Qual ferramenta atende?",
        explanation:
            "O Config Connector é um complemento do Kubernetes que traduz manifestos em recursos do Google Cloud e os mantém reconciliados, então bucket e instância do Cloud SQL passam pelo mesmo kubectl apply. O Config Sync cuida de GitOps dentro do cluster, e as outras duas opções são caminhos de Terraform.",
        topic: "Implantação",
        options: [
            [
                "O Config Connector, um complemento do GKE que reconcilia recursos do Google Cloud",
                true,
            ],
            ["O Config Sync, que sincroniza manifestos de um repositório Git com o cluster", false],
            [
                "O Cloud Foundation Toolkit, um conjunto de módulos do Terraform para o Google Cloud",
                false,
            ],
            [
                "O Infrastructure Manager, que executa configurações do Terraform de forma gerenciada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está começando a escrever Terraform para o Google Cloud e quer reaproveitar módulos mantidos pelo Google para rede, projetos e IAM, em vez de partir do zero. Onde buscar esses módulos?",
        explanation:
            "O Cloud Foundation Toolkit reúne módulos e blueprints de Terraform mantidos pelo Google para rede, projetos e IAM, publicados no GitHub e no Terraform Registry. O Config Connector é o caminho via Kubernetes, o Infrastructure Manager executa a configuração em vez de publicar módulos, e o Artifact Registry não hospeda módulos.",
        topic: "Implantação",
        options: [
            ["No Cloud Foundation Toolkit, que publica módulos e blueprints do Terraform", true],
            ["No Config Connector, que cria recursos do Google Cloud via Kubernetes", false],
            [
                "No Infrastructure Manager, que publica os módulos junto com o estado da implantação",
                false,
            ],
            [
                "No Artifact Registry, que publica módulos do Terraform em um repositório por projeto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa abrir uma sessão SSH em uma VM Linux do Compute Engine que não tem endereço IP externo, sem criar um host bastião. Qual caminho atende?",
        explanation:
            "Sem IP externo, o caminho suportado é o encaminhamento TCP do IAP: a flag --tunnel-through-iap faz o gcloud abrir o túnel, e a VPC precisa liberar a faixa de origem do IAP na porta 22. A flag --internal-ip só funciona de dentro da rede, e abrir a porta 22 para a internet expõe a VM sem resolver o caso.",
        topic: "Operação",
        options: [
            [
                "Rodar `gcloud compute ssh VM --zone=ZONA --tunnel-through-iap` e liberar a faixa do IAP no firewall",
                true,
            ],
            [
                "Rodar `gcloud compute ssh VM --zone=ZONA --internal-ip` de um notebook fora da rede VPC do projeto",
                false,
            ],
            [
                "Anexar um IP externo efêmero à VM e abrir a porta 22 para 0.0.0.0/0 na regra de firewall da VPC",
                false,
            ],
            [
                "Rodar `gcloud compute config-ssh` e acessar a VM pelo nome público publicado em uma zona do Cloud DNS",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa de plantão precisa da lista das VMs do projeto que estão em execução, em todas as zonas, direto no terminal. Qual comando atende?",
        explanation:
            "O instances list percorre todas as zonas do projeto e aceita --filter para deixar só o status RUNNING. O describe trata uma instância por vez e exige a zona, o zones list devolve zonas e não instâncias, e o filtro por TERMINATED traz justamente as VMs que estão paradas.",
        topic: "Operação",
        options: [
            [
                'Rodar `gcloud compute instances list --filter="status=RUNNING"`, que varre todas as zonas',
                true,
            ],
            [
                'Rodar `gcloud compute instances describe --filter="status=RUNNING"` sem informar a zona',
                false,
            ],
            [
                'Rodar `gcloud compute zones list --filter="instances.status=RUNNING"` no projeto inteiro',
                false,
            ],
            [
                'Rodar `gcloud compute instances list --zones=ZONA --filter="status=TERMINATED"` zona a zona',
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa criou a política abaixo para gerar snapshots diários de um disco, mas nenhum snapshot apareceu depois de dois dias.\n\n```\ngcloud compute resource-policies create snapshot-schedule diario \\\n  --region=us-central1 --daily-schedule --start-time=03:00 \\\n  --max-retention-days=14\n```\n\nO que falta para o agendamento funcionar?",
        explanation:
            "A política de snapshot é regional e só passa a agir depois de ser anexada ao disco, o que o add-resource-policies faz. O agendamento não é um recurso zonal, não depende de um snapshot manual anterior e o Compute Engine já cuida das permissões do próprio agendador.",
        topic: "Operação",
        options: [
            [
                "Anexar a política ao disco com `gcloud compute disks add-resource-policies DISCO --resource-policies=diario`",
                true,
            ],
            [
                "Recriar a política na zona do disco, porque o agendamento de snapshot é um recurso zonal e não regional",
                false,
            ],
            [
                "Criar um primeiro snapshot manual com `gcloud compute disks snapshot DISCO`, que serve de base do agendamento",
                false,
            ],
            [
                "Conceder o papel Compute Storage Admin ao agente de serviço do Compute Engine antes do primeiro ciclo diário",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa criar uma imagem personalizada a partir do disco de inicialização de uma VM que não pode ser parada agora. Qual comando cria a imagem?",
        explanation:
            "Por padrão o images create falha quando o disco está anexado a uma instância em execução, e a flag --force manda seguir mesmo assim, com o risco de a imagem sair inconsistente. A flag --source-snapshot espera o nome de um snapshot, e o disks snapshot cria um snapshot, não uma imagem.",
        topic: "Operação",
        options: [
            [
                "`gcloud compute images create base-web --source-disk=DISCO --source-disk-zone=ZONA --force`",
                true,
            ],
            [
                "`gcloud compute images create base-web --source-disk=DISCO --source-disk-zone=ZONA` sem flag extra",
                false,
            ],
            [
                "`gcloud compute images create base-web --source-snapshot=DISCO --storage-location=ZONA --force`",
                false,
            ],
            [
                "`gcloud compute disks snapshot DISCO --snapshot-names=base-web --zone=ZONA --guest-flush`",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa acabou de entrar no time e precisa rodar kubectl contra um cluster regional do GKE pela primeira vez na própria máquina. Qual passo vem antes?",
        explanation:
            "O get-credentials grava a entrada do cluster no kubeconfig local e precisa do componente gke-gcloud-auth-plugin, exigido pelos clientes atuais. Em cluster regional a localização é a região. O describe só mostra dados do cluster, e o contexto do kubectl não aparece sozinho na máquina.",
        topic: "Operação",
        options: [
            [
                "Rodar `gcloud container clusters get-credentials CLUSTER --location=us-central1` com o gke-gcloud-auth-plugin",
                true,
            ],
            [
                "Rodar `gcloud container clusters describe CLUSTER --location=us-central1` e copiar o endpoint para o kubeconfig",
                false,
            ],
            [
                "Rodar `kubectl config use-context CLUSTER` apontando para o contexto que o GKE publica em todas as máquinas",
                false,
            ],
            [
                "Rodar `gcloud auth application-default login` e deixar o kubectl achar o cluster pela API do Compute Engine",
                false,
            ],
        ],
    },
    {
        statement:
            "Os pods de um cluster do GKE ficam em ImagePullBackOff ao buscar uma imagem de um repositório do Artifact Registry que vive em outro projeto. O que corrige o acesso?",
        explanation:
            "A imagem é baixada com a identidade da conta de serviço dos nós, então ela precisa do papel Artifact Registry Reader no projeto que hospeda o repositório. Papel de escrita para o Cloud Build não resolve leitura, o Container Registry foi desativado e o agente de serviço do GKE não faz o download.",
        topic: "Operação",
        options: [
            [
                "Conceder o papel Artifact Registry Reader à conta de serviço dos nós, no projeto do repositório",
                true,
            ],
            [
                "Conceder o papel Artifact Registry Writer à conta de serviço do Cloud Build, no projeto do cluster",
                false,
            ],
            [
                "Conceder o papel Storage Object Viewer à conta de serviço dos nós, no bucket do Container Registry",
                false,
            ],
            [
                "Conceder o papel Artifact Registry Administrator ao agente de serviço do GKE, no projeto do cluster",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa trocar o tipo de máquina dos nós de um cluster do GKE em produção sem derrubar as cargas de trabalho. Qual caminho atende?",
        explanation:
            "O tipo de máquina faz parte da configuração do node pool e não muda no lugar: a prática indicada é criar um pool novo, aplicar cordon e drain nos nós antigos para reagendar os pods e só então excluir o pool antigo. Mexer no grupo gerenciado por fora sai do controle do GKE.",
        topic: "Operação",
        options: [
            [
                "Criar um node pool com o tipo novo, marcar os nós antigos com cordon, drenar os pods e excluir o pool antigo",
                true,
            ],
            [
                "Rodar `gcloud container node-pools update` com a flag --machine-type e aguardar a troca em janela de manutenção",
                false,
            ],
            [
                "Rodar `gcloud container clusters resize --num-nodes=0` no pool antigo e recriar o cluster já com o tipo desejado",
                false,
            ],
            [
                "Editar o tipo de máquina no grupo gerenciado de instâncias do pool e reiniciar os nós um a um pelo Compute Engine",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação no GKE fica com pods pendentes nos picos e, ao mesmo tempo, declara requisições de CPU muito acima do consumo real. Quais recursos atacam esses dois problemas? (Selecione DUAS opções.)",
        explanation:
            "Pod pendente é sinal de falta de nó, e o autoscaler de cluster cresce o node pool nesse caso. Requisição exagerada é ajuste vertical, trabalho do Vertical Pod Autoscaler. O Horizontal Pod Autoscaler muda o número de réplicas e não de nós, e o Managed Service for Prometheus apenas coleta métricas.",
        topic: "Operação",
        options: [
            [
                "O autoscaler de cluster, que acrescenta nós ao node pool quando existem pods sem onde ser agendados",
                true,
            ],
            [
                "O Vertical Pod Autoscaler, que ajusta as requisições de CPU e memória dos contêineres pelo consumo",
                true,
            ],
            [
                "O Horizontal Pod Autoscaler, que acrescenta nós ao node pool conforme a utilização média de CPU dos pods",
                false,
            ],
            [
                "O Managed Service for Prometheus, que redimensiona as réplicas a partir das séries coletadas via PromQL",
                false,
            ],
            [
                "O provisionamento automático de nós, que reduz as requisições declaradas no manifesto de cada contêiner",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer publicar uma revisão nova de um serviço do Cloud Run, testá-la em uma URL própria e só depois mandar uma fatia pequena do tráfego para ela. Qual sequência atende?",
        explanation:
            "O deploy com --no-traffic cria a revisão sem receber requisições, e --tag dá a ela uma URL de teste própria. Depois o update-traffic com --to-tags envia a fatia escolhida para essa tag. A flag --to-latest joga tudo na revisão mais recente, e revisions create com set-traffic não existem.",
        topic: "Operação",
        options: [
            [
                "`gcloud run deploy --no-traffic --tag=canario` e depois `gcloud run services update-traffic --to-tags=canario=10`",
                true,
            ],
            [
                "`gcloud run deploy --no-traffic --tag=canario` e depois `gcloud run services update-traffic --to-latest` no serviço",
                false,
            ],
            [
                "`gcloud run deploy --tag=canario` sozinho, porque a revisão nova já começa com 10% do tráfego do serviço",
                false,
            ],
            [
                "`gcloud run revisions create --tag=canario` e depois `gcloud run services set-traffic --split=canario=10`",
                false,
            ],
        ],
    },
    {
        statement:
            "Um serviço do Cloud Run com pouco movimento responde devagar na primeira requisição depois de ficar um tempo parado. Qual ajuste de escala reduz esse atraso?",
        explanation:
            "A lentidão da primeira requisição é a partida a frio. Instâncias mínimas mantêm contêineres de prontidão, e passa a haver cobrança mesmo sem requisição, em taxa menor enquanto a instância está ociosa. Instância máxima limita o crescimento, e concorrência e tempo limite não removem a partida a frio.",
        topic: "Operação",
        options: [
            [
                "Definir instâncias mínimas com `gcloud run services update SERVICO --min-instances=1`",
                true,
            ],
            [
                "Definir instâncias máximas com `gcloud run services update SERVICO --max-instances=1`",
                false,
            ],
            [
                "Elevar a concorrência com `gcloud run services update SERVICO --concurrency=1000`",
                false,
            ],
            [
                "Ampliar o tempo limite com `gcloud run services update SERVICO --timeout=300s`",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer se proteger de exclusão acidental de objetos em um bucket do Cloud Storage e poder recuperar o conteúdo depois. Quais recursos atendem? (Selecione DUAS opções.)",
        explanation:
            "O soft delete já vem ligado com uma janela de retenção e permite restaurar o objeto excluído; o versionamento guarda as versões não atuais depois de sobrescrita ou exclusão. Classe de armazenamento e chave do Cloud KMS não barram exclusão, e a regra de ciclo de vida com Delete faz o contrário.",
        topic: "Operação",
        options: [
            [
                "O soft delete do bucket, que guarda o objeto excluído por uma janela de retenção e permite restaurar",
                true,
            ],
            [
                "O versionamento de objetos, ligado com `gcloud storage buckets update gs://BUCKET --versioning`",
                true,
            ],
            [
                "A classe Archive, que impede a exclusão do objeto até o fim da duração mínima de armazenamento",
                false,
            ],
            [
                "A regra de ciclo de vida com ação Delete por idade, que recria o objeto na avaliação diária seguinte",
                false,
            ],
            [
                "A chave gerenciada pelo cliente no Cloud KMS, que barra a exclusão do objeto enquanto a chave existir",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que os objetos de um bucket passem para Coldline com 90 dias e sejam excluídos com 365 dias, sem script próprio. Como configurar?",
        explanation:
            "O ciclo de vida é uma configuração do bucket, aplicada com --lifecycle-file: uma regra com ação SetStorageClass e condição age de 90 dias, outra com ação Delete e age de 365. A política de retenção impede a exclusão em vez de provocá-la, e o ciclo de vida não é definido objeto a objeto.",
        topic: "Operação",
        options: [
            [
                "Escrever as regras em um arquivo JSON e aplicar com `gcloud storage buckets update gs://BUCKET --lifecycle-file=regras.json`",
                true,
            ],
            [
                "Escrever as regras em um arquivo JSON e aplicar com `gcloud storage objects update gs://BUCKET/** --lifecycle-file=regras.json`",
                false,
            ],
            [
                "Definir a política de retenção do bucket com `gcloud storage buckets update gs://BUCKET --retention-period=365d`",
                false,
            ],
            [
                "Agendar dois jobs no Storage Transfer Service, um para mudar a classe com 90 dias e outro para excluir com 365",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma analista precisa rodar uma consulta SQL rápida em um banco do Spanner direto pelo terminal, sem instalar nenhum driver. Qual comando atende?",
        explanation:
            "O execute-sql roda a consulta no Spanner pela linha de comando, informando a instância e o banco. O gcloud spanner instances query não existe, o bq query fala com o BigQuery e o gcloud sql connect abre o cliente de uma instância do Cloud SQL, que é outro serviço.",
        topic: "Operação",
        options: [
            [
                '`gcloud spanner databases execute-sql BANCO --instance=INSTANCIA --sql="SELECT ..."`',
                true,
            ],
            [
                '`gcloud spanner instances query INSTANCIA --database=BANCO --sql="SELECT ..."`',
                false,
            ],
            [
                '`bq query --use_legacy_sql=false "SELECT ... FROM spanner.BANCO.tabela"` no projeto do banco',
                false,
            ],
            [
                "`gcloud sql connect BANCO --user=admin` e digitar a consulta no prompt interativo",
                false,
            ],
        ],
    },
    {
        statement:
            "Antes de criar o bucket, uma equipe quer estimar o custo mensal de guardar um arquivo histórico lido quase nunca no Cloud Storage, aceitando taxa de recuperação alta. O que atende?",
        explanation:
            "A calculadora de preços estima o gasto antes de existir consumo; relatórios do Cloud Billing e a exportação de faturamento só mostram o que já foi cobrado. Entre as classes, a Archive tem o menor custo de armazenamento, duração mínima de 365 dias e a maior taxa de recuperação.",
        topic: "Operação",
        options: [
            [
                "A calculadora de preços do Google Cloud com a classe Archive, de duração mínima de 365 dias",
                true,
            ],
            [
                "A calculadora de preços do Google Cloud com a classe Nearline, de menor custo de armazenamento",
                false,
            ],
            [
                "Os relatórios de custo do Cloud Billing com a classe Archive, de duração mínima de 30 dias",
                false,
            ],
            [
                "A exportação de faturamento para o BigQuery com a classe Coldline, que não cobra recuperação",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de um UPDATE sem WHERE, uma empresa quer restaurar um backup do Cloud SQL em outra instância para conferir os dados antes de apontar a aplicação. Qual comando atende?",
        explanation:
            "O backups restore indica o backup e a instância de destino com --restore-instance, o que deixa a origem intacta. Restaurar sobre a própria instância sobrescreve os dados atuais e os logs de recuperação pontual, e exige excluir as réplicas antes. Os outros comandos não restauram backup.",
        topic: "Operação",
        options: [
            [
                "`gcloud sql backups restore ID --restore-instance=NOVA --backup-instance=ORIGEM`",
                true,
            ],
            [
                "`gcloud sql backups create ID --target-instance=NOVA --backup-instance=ORIGEM --async`",
                false,
            ],
            ["`gcloud sql instances clone ORIGEM NOVA --backup-id=ID --restore-backup`", false],
            ["`gcloud sql backups describe ID --instance=ORIGEM --restore-instance=NOVA`", false],
        ],
    },
    {
        statement:
            "Um pipeline de streaming do Dataflow precisa ser encerrado sem perder os dados que já entraram na fila, e a equipe quer conferir o estado final do job. Qual ação atende?",
        explanation:
            "O drain para a entrada de dados novos e deixa o pipeline terminar o que já estava na fila, fechando em JOB_STATE_DRAINED. O cancel interrompe na hora e descarta os dados em voo, indo para JOB_STATE_CANCELLED. Não existe jobs delete, e o bq trata de jobs do BigQuery.",
        topic: "Operação",
        options: [
            [
                "Rodar `gcloud dataflow jobs drain ID --region=REGIAO` e aguardar o estado JOB_STATE_DRAINED",
                true,
            ],
            [
                "Rodar `gcloud dataflow jobs cancel ID --region=REGIAO` e aguardar o estado JOB_STATE_CANCELLED",
                false,
            ],
            [
                "Rodar `gcloud dataflow jobs delete ID --region=REGIAO` e aguardar o estado JOB_STATE_STOPPED",
                false,
            ],
            [
                "Rodar `bq cancel ID --location=REGIAO` e aguardar o estado JOB_STATE_DONE no painel do Dataflow",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma VPC em modo personalizado precisa de uma sub-rede nova em southamerica-east1 para o ambiente de testes. Qual comando cria a sub-rede?",
        explanation:
            "A sub-rede nasce com networks subnets create, informando a VPC em --network, a faixa CIDR em --range e a região. O networks create cria a VPC e não aceita faixa, o expand-ip-range só amplia sub-rede existente e o addresses create reserva endereço, não cria sub-rede.",
        topic: "Operação",
        options: [
            [
                "`gcloud compute networks subnets create testes --network=app --range=10.20.0.0/20 --region=southamerica-east1`",
                true,
            ],
            [
                "`gcloud compute networks create testes --subnet-mode=custom --range=10.20.0.0/20 --region=southamerica-east1`",
                false,
            ],
            [
                "`gcloud compute networks subnets expand-ip-range testes --prefix-length=20 --region=southamerica-east1`",
                false,
            ],
            [
                "`gcloud compute addresses create testes --subnet=app --addresses=10.20.0.0/20 --region=southamerica-east1` na VPC",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma sub-rede /24 em uso ficou sem endereços livres e a equipe quer mais espaço sem recriar as VMs. O que a documentação permite?",
        explanation:
            "A ampliação troca a máscara por um prefixo menor, de /24 para /20, e a faixa nova tem de conter a antiga. A operação não volta atrás e não dá para encolher a faixa primária. Não existe update --range para trocar a faixa, e excluir a sub-rede derrubaria os endereços já em uso.",
        topic: "Operação",
        options: [
            [
                "Ampliar a faixa primária com `gcloud compute networks subnets expand-ip-range --prefix-length=20`",
                true,
            ],
            [
                "Reduzir a faixa primária com `gcloud compute networks subnets expand-ip-range --prefix-length=28`",
                false,
            ],
            [
                "Trocar a faixa primária por outra sem sobreposição com `gcloud compute networks subnets update --range`",
                false,
            ],
            [
                "Excluir a sub-rede e recriá-la com `gcloud compute networks subnets create` guardando os IPs atribuídos",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa mantém VMs sem IP externo que precisam baixar pacotes da internet e quer um endereço fixo para o balanceador global que publica a API. Quais ações atendem? (Selecione DUAS opções.)",
        explanation:
            "O Cloud NAT, apoiado em um Cloud Router, dá saída para a internet às VMs sem IP externo e não aceita conexões iniciadas de fora. Endereço global é o que o balanceador global usa; o regional serve a VM e a balanceador regional. Zona privada do Cloud DNS não resolve nome público.",
        topic: "Operação",
        options: [
            [
                "Criar um Cloud Router na região e um gateway de Cloud NAT que cubra todas as faixas da sub-rede",
                true,
            ],
            [
                "Reservar um IP externo estático com `gcloud compute addresses create api --global` para o balanceador",
                true,
            ],
            [
                "Reservar um IP externo estático regional para cada VM da sub-rede e anexá-lo à placa de rede principal",
                false,
            ],
            [
                "Criar uma zona privada no Cloud DNS para que as VMs resolvam os repositórios públicos de pacotes",
                false,
            ],
            [
                "Liberar a porta 443 de saída no firewall da VPC, o que já dá às VMs um endereço de saída comum",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer ser avisada por e-mail quando o uso de memória do sistema operacional das VMs passar de 90% por dez minutos. O que a política de alerta precisa ter?",
        explanation:
            "Alerta de limite compara a métrica com um valor ao longo de uma janela e dispara nos canais de notificação configurados. Memória do convidado vem do Ops Agent e não do hipervisor. Condição de ausência avisa quando a série para de chegar, e painel com gráfico não notifica ninguém.",
        topic: "Operação",
        options: [
            [
                "Uma condição de limite sobre a métrica do Ops Agent, com janela de dez minutos, e um canal de notificação",
                true,
            ],
            [
                "Uma condição de ausência de métrica sobre a série do Ops Agent, com janela de dez minutos, e canal de e-mail",
                false,
            ],
            [
                "Uma condição de limite sobre a métrica de CPU do hipervisor, mais um filtro de severidade ERROR nos logs",
                false,
            ],
            [
                "Um painel com o gráfico de memória das VMs, mais um relatório diário enviado pelo Cloud Billing ao plantão",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer no Cloud Monitoring um contador de pedidos criado pela própria aplicação e as métricas que os pods do GKE já expõem no formato Prometheus. Quais ações atendem? (Selecione DUAS opções.)",
        explanation:
            "Métrica própria nasce com prefixo de usuário, como custom.googleapis.com, escrita pela API do Monitoring ou por OpenTelemetry; prefixos como compute.googleapis.com são das métricas definidas pelo Google. A coleta gerenciada do Managed Service for Prometheus leva as séries dos pods para o Monitoring.",
        topic: "Operação",
        options: [
            [
                "Publicar o contador em uma métrica com prefixo custom.googleapis.com pela API do Monitoring",
                true,
            ],
            [
                "Ativar a coleta gerenciada com `gcloud container clusters update CLUSTER --enable-managed-prometheus`",
                true,
            ],
            [
                "Publicar o contador em uma métrica com prefixo compute.googleapis.com pela API do Monitoring",
                false,
            ],
            [
                "Criar uma métrica baseada em logs do tipo contador, que também soma as entradas gravadas antes dela",
                false,
            ],
            [
                "Instalar o Prometheus autogerenciado em cada nó e mandar as séries para o Cloud Logging por um sink de logs",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa enviar os logs de auditoria de todos os projetos de uma pasta para o Splunk, que roda fora do Google Cloud. Qual desenho atende?",
        explanation:
            "Para sistema externo o destino do sink é um tópico do Pub/Sub, de onde um job do Dataflow entrega no coletor do Splunk, e o sink agregado com --include-children pega todos os projetos da pasta de uma vez. Bucket do Cloud Storage, BigQuery e bucket de logs guardam dentro do Google Cloud.",
        topic: "Operação",
        options: [
            [
                "Um sink agregado na pasta, com --include-children, destino em um tópico do Pub/Sub e um job do Dataflow entregando no Splunk",
                true,
            ],
            [
                "Um sink por projeto, com destino em um bucket do Cloud Storage, e o Splunk lendo os arquivos pelo console de cada projeto da pasta",
                false,
            ],
            [
                "Um sink agregado na pasta, com destino em um conjunto de dados do BigQuery, e o Splunk consultando a tabela por SSH",
                false,
            ],
            [
                "Um bucket de logs na pasta com retenção longa, e o Splunk puxando as entradas pela API do Cloud Monitoring",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa guardar os logs de produção por 400 dias e consultá-los em SQL sem sair do Cloud Logging. O que atende?",
        explanation:
            "A retenção é configuração do bucket de logs, que aceita de 1 a 3650 dias, e a interface SQL dentro do Cloud Logging vem do upgrade do bucket para o Observability Analytics, antigo Log Analytics. A retenção do bucket _Required é fixa, e métrica baseada em logs não consulta entradas.",
        topic: "Operação",
        options: [
            [
                "Criar um bucket de logs com `--retention-days=400` e fazer o upgrade dele para o Observability Analytics",
                true,
            ],
            [
                "Criar um bucket de logs com `--retention-days=400` e criar nele uma métrica baseada em logs de distribuição",
                false,
            ],
            [
                "Alterar a retenção do bucket _Required para 400 dias e consultá-lo pelo editor de consultas do BigQuery",
                false,
            ],
            [
                "Criar um sink para um conjunto de dados do BigQuery e deixar o bucket _Default com a retenção padrão",
                false,
            ],
        ],
    },
    {
        statement:
            "Durante uma investigação, a equipe precisa ver no Logs Explorer apenas as entradas de erro de uma VM específica. Qual filtro atende?",
        explanation:
            "A linguagem de consulta do Cloud Logging usa = e >= com AND em maiúsculas, e severity>=ERROR pega ERROR e as severidades acima. Trocar AND por OR amplia o resultado em vez de restringir, o operador in não existe nessa linguagem e SQL só vale no Observability Analytics.",
        topic: "Operação",
        options: [
            [
                '`resource.type="gce_instance" AND resource.labels.instance_id="ID" AND severity>=ERROR`',
                true,
            ],
            [
                '`resource.type="gce_instance" OR resource.labels.instance_id="ID" OR severity>="WARNING"`',
                false,
            ],
            [
                "`resource.type:gce_instance and instance_id=ID and severity in (ERROR, CRITICAL)`",
                false,
            ],
            [
                '`SELECT * FROM gce_instance WHERE instance_id = "ID" AND severity >= "ERROR"`',
                false,
            ],
        ],
    },
    {
        statement:
            "Uma auditoria pede o registro de quem leu os objetos de um bucket do Cloud Storage. O que a equipe precisa fazer?",
        explanation:
            "Leitura de objeto é acesso a dados, e esses logs vêm desligados por padrão: é preciso ativar DATA_READ na configuração de auditoria da política de IAM do projeto, da pasta ou da organização. Atividade do administrador registra mudanças e já é sempre gravada, e evento do sistema cobre ações do Google.",
        topic: "Operação",
        options: [
            [
                "Ativar os logs de auditoria de acesso a dados do Cloud Storage para DATA_READ na política de IAM",
                true,
            ],
            [
                "Ativar os logs de auditoria de atividade do administrador para ADMIN_WRITE na política de IAM do projeto",
                false,
            ],
            [
                "Ativar os logs de auditoria de evento do sistema para DATA_READ no roteador de logs do projeto",
                false,
            ],
            [
                "Criar uma métrica baseada em logs de contador sobre o acesso ao bucket e ligar um alerta no Monitoring",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma administradora precisa aplicar de uma só vez um conjunto grande de mudanças de papéis na política do IAM de um projeto e não quer sobrescrever o que outra pessoa alterar durante a edição. Qual procedimento atende a essa necessidade?",
        explanation:
            "O fluxo recomendado é ler com get-iam-policy, editar o arquivo e gravar com set-iam-policy. O campo etag identifica a versão da política e faz a gravação falhar se alguém alterou nesse intervalo, então apagar o etag ou enviar um arquivo sem a política atual sobrescreve o que estava lá.",
        topic: "Acesso e segurança",
        options: [
            [
                "Exportar com gcloud projects get-iam-policy, editar o arquivo preservando o campo etag e aplicar com gcloud projects set-iam-policy",
                true,
            ],
            [
                "Exportar com gcloud projects get-iam-policy, remover o campo etag do arquivo antes de editar e aplicar com gcloud projects set-iam-policy",
                false,
            ],
            [
                "Aplicar com gcloud projects set-iam-policy um arquivo novo que contenha apenas as concessões de papéis que estão sendo adicionadas",
                false,
            ],
            [
                "Editar as concessões pelo console na página do IAM, porque o console mescla as edições simultâneas automaticamente",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma analista precisa receber o papel de leitura de objetos do Cloud Storage em um projeto, e a administradora quer fazer isso com um comando só. Qual comando concede esse papel?",
        explanation:
            "O comando add-iam-policy-binding no recurso projeto adiciona uma concessão sem reescrever a política inteira, e o membro exige o prefixo do tipo, como user:, além do papel no formato roles/. O set-iam-policy substitui a política a partir de um arquivo e não aceita esses argumentos.",
        topic: "Acesso e segurança",
        options: [
            [
                "gcloud projects add-iam-policy-binding meu-projeto --member=user:ana@exemplo.com --role=roles/storage.objectViewer",
                true,
            ],
            [
                "gcloud iam service-accounts add-iam-policy-binding meu-projeto --member=user:ana@exemplo.com --role=roles/storage.objectViewer",
                false,
            ],
            [
                "gcloud projects set-iam-policy meu-projeto --member=user:ana@exemplo.com --role=roles/storage.objectViewer",
                false,
            ],
            [
                "gcloud projects add-iam-policy-binding meu-projeto --member=ana@exemplo.com --role=storage.objectViewer",
                false,
            ],
        ],
    },
    {
        statement:
            "Um time de suporte precisa listar e reiniciar instâncias do Compute Engine, e nenhum papel predefinido entrega esse conjunto sem trazer permissões extras. Qual é a recomendação do Google Cloud?",
        explanation:
            "Papel personalizado existe exatamente para o caso em que nenhum predefinido atende, porque reúne só as permissões necessárias e sustenta o menor privilégio. Compute Admin e o papel basic Editor entregam muito mais permissão do que listar e reiniciar instância.",
        topic: "Acesso e segurança",
        options: [
            [
                "Criar um papel personalizado com apenas as permissões necessárias e conceder esse papel ao time",
                true,
            ],
            [
                "Conceder roles/compute.admin ao time, porque é o papel predefinido que mais se aproxima do pedido",
                false,
            ],
            [
                "Conceder roles/editor ao time, porque o papel basic cobre reinício de instância sem configuração extra",
                false,
            ],
            [
                "Conceder roles/compute.viewer ao time e abrir uma solicitação à plataforma para cada reinício",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa agrupa projetos em pastas e quer um papel personalizado que possa ser concedido em qualquer projeto dessas pastas. Onde esse papel deve ser criado?",
        explanation:
            "A documentação é explícita: não é possível definir papel personalizado no nível de pasta. Ele é criado no projeto, com a flag --project, ou na organização, com --organization, e o papel da organização fica disponível para concessão em qualquer pasta ou projeto abaixo dela.",
        topic: "Acesso e segurança",
        options: [
            [
                "Na organização, porque papel personalizado existe apenas no nível de projeto ou de organização",
                true,
            ],
            [
                "Na pasta, porque o papel personalizado criado na pasta passa a valer para todos os projetos contidos nela",
                false,
            ],
            [
                "Na pasta e na organização, para que a herança do papel funcione nos dois sentidos",
                false,
            ],
            [
                "Em um dos projetos da pasta, porque o papel personalizado sobe para os níveis acima",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma analista recebeu roles/compute.viewer em uma pasta que contém oito projetos. Qual é o efeito prático dessa concessão?",
        explanation:
            "A política de permissão é herdada de cima para baixo, e a política efetiva de um recurso é a união da política dele com a herdada do pai. Concedido na pasta, o papel já alcança todos os projetos abaixo, sem repetir a concessão projeto por projeto.",
        topic: "Acesso e segurança",
        options: [
            [
                "Ela consegue ver os recursos do Compute Engine nos oito projetos, porque o projeto herda a política da pasta",
                true,
            ],
            [
                "Ela não consegue ver nada até que o mesmo papel seja concedido dentro de cada um dos oito projetos",
                false,
            ],
            [
                "Ela consegue ver os recursos do Compute Engine apenas no projeto definido como padrão na gcloud CLI",
                false,
            ],
            [
                "Ela consegue ver os recursos do Compute Engine nos oito projetos somente depois de repetir a concessão na organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Um time herdou roles/editor de uma concessão feita na organização, e a auditoria pediu que esse acesso não valha em um projeto específico. O que resolve o problema?",
        explanation:
            "A política efetiva é a união da política do recurso com a herdada, então o projeto não revoga o que veio da organização. O caminho é remover a concessão no nó em que ela foi feita ou usar política de recusa, que o IAM avalia antes das políticas de permissão.",
        topic: "Acesso e segurança",
        options: [
            [
                "Remover a concessão no nó em que ela foi feita ou criar uma política de recusa, porque o filho não revoga o que herdou",
                true,
            ],
            [
                "Executar gcloud projects remove-iam-policy-binding no projeto, que apaga a concessão herdada da organização apenas nesse projeto",
                false,
            ],
            [
                "Conceder roles/viewer ao time no projeto, porque no IAM o papel mais restrito do filho substitui o herdado do pai",
                false,
            ],
            [
                "Mover o projeto para outra pasta da mesma organização, porque a troca de pai cancela as concessões herdadas",
                false,
            ],
        ],
    },
    {
        statement:
            "Um aplicativo precisa apenas ler objetos de um bucket do Cloud Storage e nada além disso. Qual papel segue o princípio do menor privilégio?",
        explanation:
            "Storage Object Viewer dá exatamente a leitura de objetos e dos metadados deles, que é o que o aplicativo faz. Object Admin e Storage Admin incluem escrita e administração, e o papel basic Editor alcança quase todo o projeto, bem além do necessário.",
        topic: "Acesso e segurança",
        options: [
            ["roles/storage.objectViewer, que permite ler objetos e os metadados deles", true],
            [
                "roles/storage.objectAdmin, que permite ler, criar, sobrescrever e excluir objetos",
                false,
            ],
            ["roles/storage.admin, que permite administrar buckets e objetos do projeto", false],
            ["roles/editor, que permite alterar a maioria dos recursos do projeto", false],
        ],
    },
    {
        statement:
            "Uma pessoa vai administrar quem tem acesso a um projeto, concedendo e revogando papéis, mas não deve poder criar nem excluir recursos. Qual papel atende a esse pedido?",
        explanation:
            "Project IAM Admin concede e revoga papéis na política do projeto sem dar acesso aos recursos. Owner faz o mesmo, porém carrega permissão sobre tudo; Role Admin trata dos papéis personalizados, e Project Creator serve para criar projetos novos.",
        topic: "Acesso e segurança",
        options: [
            [
                "roles/resourcemanager.projectIamAdmin, que administra as políticas de permissão do projeto",
                true,
            ],
            [
                "roles/owner, que administra as políticas de permissão e também todos os recursos do projeto",
                false,
            ],
            [
                "roles/iam.roleAdmin, que cria e altera os papéis personalizados definidos no projeto",
                false,
            ],
            [
                "roles/resourcemanager.projectCreator, que permite criar projetos novos na organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está revisando as políticas do IAM para reduzir excesso de permissão sem travar as equipes. Quais duas práticas o Google Cloud recomenda? (Selecione DUAS opções.)",
        explanation:
            "A lista de uso seguro do IAM pede trocar papéis basic pelos predefinidos mais limitados e conceder papéis a grupos, o que facilita a manutenção da política. Dar Owner por equipe, Editor por padrão ou juntar tudo em um papel só amplia o excesso de permissão.",
        topic: "Acesso e segurança",
        options: [
            [
                "Substituir papéis basic como Editor pelos papéis predefinidos mais limitados que atendem a tarefa",
                true,
            ],
            [
                "Conceder os papéis a grupos do Google, e não a cada usuário, para facilitar a manutenção",
                true,
            ],
            [
                "Conceder roles/owner aos líderes de cada equipe para que eles mesmos distribuam o acesso internamente",
                false,
            ],
            [
                "Reunir as permissões de todas as equipes em um papel personalizado único na organização",
                false,
            ],
            [
                "Conceder roles/editor por padrão e revisar depois pelos registros de auditoria do projeto",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma auditora precisa listar os recursos de um projeto e as políticas de permissão deles, sem poder alterar nenhuma. Qual papel atende a esse pedido?",
        explanation:
            "Security Reviewer é descrito como o papel que permite listar todos os recursos e as políticas de permissão sobre eles, sem gravar nada. Security Admin também grava política, Role Viewer só lê papéis personalizados e Organization Role Admin os administra.",
        topic: "Acesso e segurança",
        options: [
            [
                "roles/iam.securityReviewer, que permite listar todos os recursos e as políticas de permissão deles",
                true,
            ],
            [
                "roles/iam.securityAdmin, que permite ler e também gravar qualquer política de permissão do projeto",
                false,
            ],
            [
                "roles/iam.roleViewer, que dá leitura apenas sobre os papéis personalizados do projeto",
                false,
            ],
            [
                "roles/iam.organizationRoleAdmin, que administra os papéis personalizados da organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe vai implantar um serviço novo que lê de um bucket e publica no Pub/Sub, e precisa definir a identidade que o serviço vai usar. Qual abordagem o Google Cloud recomenda?",
        explanation:
            "A recomendação é criar uma conta de serviço dedicada por aplicação e conceder só os papéis necessários, o que melhora o menor privilégio e a auditoria. A conta padrão pode nascer com Editor, e chave distribuída junto com o código é o cenário que a documentação pede para evitar.",
        topic: "Acesso e segurança",
        options: [
            [
                "Criar uma conta de serviço dedicada com gcloud iam service-accounts create e conceder só os papéis do serviço",
                true,
            ],
            [
                "Usar a conta de serviço padrão do Compute Engine do projeto, que já costuma vir com acesso suficiente para as duas tarefas",
                false,
            ],
            [
                "Gerar uma chave JSON de uma conta de serviço existente e distribuir o arquivo junto com o código do serviço",
                false,
            ],
            [
                "Reaproveitar uma conta de serviço que já tem roles/editor no projeto para poupar trabalho de configuração",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um projeto, as pessoas de plataforma precisam criar contas de serviço, mas não devem excluir contas nem administrar o IAM delas. Qual papel atende a esse pedido?",
        explanation:
            "Create Service Accounts é o papel predefinido com acesso apenas para criar contas de serviço, o que respeita o pedido. Service Account Admin inclui exclusão e administração do IAM da conta, Service Account User serve para anexar a conta e Key Admin trata de chaves.",
        topic: "Acesso e segurança",
        options: [
            [
                "roles/iam.serviceAccountCreator, que dá acesso somente para criar contas de serviço",
                true,
            ],
            [
                "roles/iam.serviceAccountAdmin, que cria, exclui e administra o IAM das contas de serviço",
                false,
            ],
            [
                "roles/iam.serviceAccountUser, que anexa contas de serviço existentes a recursos",
                false,
            ],
            [
                "roles/iam.serviceAccountKeyAdmin, que cria e exclui chaves das contas de serviço",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa tenta criar uma instância do Compute Engine com uma conta de serviço anexada e recebe erro de permissão. Quais dois acessos ela precisa ter? (Selecione DUAS opções.)",
        explanation:
            "Anexar conta de serviço a um recurso exige a permissão iam.serviceAccounts.actAs, que vem no papel Service Account User, somada às permissões para criar o recurso. Token Creator gera credenciais de curta duração e Key Admin trata de chaves, e nenhum dos dois anexa a conta.",
        topic: "Acesso e segurança",
        options: [
            [
                "Permissão para criar a instância, por exemplo com roles/compute.instanceAdmin.v1 no projeto",
                true,
            ],
            [
                "roles/iam.serviceAccountUser na conta de serviço, que traz a permissão iam.serviceAccounts.actAs",
                true,
            ],
            [
                "roles/iam.serviceAccountTokenCreator na conta de serviço, para emitir o token que a instância usa",
                false,
            ],
            [
                "roles/iam.serviceAccountKeyAdmin na conta de serviço, para gerar a chave que a instância carrega",
                false,
            ],
            [
                "roles/iam.serviceAccountAdmin no projeto, porque anexar conta de serviço administra a conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor implanta um serviço no Cloud Run com uma conta de serviço que já tem roles/storage.objectViewer no bucket, mas a implantação falha com erro de permissão na conta de serviço. O que falta?",
        explanation:
            "Quem implanta precisa de permissão NA conta de serviço: Service Account User traz iam.serviceAccounts.actAs e deixa anexar a conta ao serviço. Os papéis DA conta de serviço, como a leitura no bucket, já estavam corretos, e run.invoker define quem pode chamar o serviço.",
        topic: "Acesso e segurança",
        options: [
            [
                "Conceder roles/iam.serviceAccountUser ao desenvolvedor na conta de serviço que será anexada",
                true,
            ],
            [
                "Conceder roles/storage.objectViewer ao desenvolvedor no bucket que o serviço vai ler",
                false,
            ],
            [
                "Conceder roles/run.invoker à conta de serviço no serviço do Cloud Run que está sendo criado",
                false,
            ],
            [
                "Conceder roles/iam.serviceAccountTokenCreator à conta de serviço nela mesma antes de implantar",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função do Cloud Run roda com uma conta de serviço dedicada e precisa gravar objetos em um bucket. Onde o papel deve ser concedido?",
        explanation:
            "O que a conta de serviço alcança vem dos papéis concedidos a ela nos recursos, com o membro no formato serviceAccount:email. Papéis concedidos na própria conta de serviço definem quem pode usá-la, não o que ela acessa, e Token Creator trata de credenciais de curta duração.",
        topic: "Acesso e segurança",
        options: [
            [
                "No bucket, com roles/storage.objectAdmin para a conta de serviço como membro serviceAccount:",
                true,
            ],
            [
                "Na própria conta de serviço, com roles/storage.objectAdmin concedido a ela mesma como membro",
                false,
            ],
            [
                "Na conta de serviço, com roles/iam.serviceAccountUser concedido à equipe que mantém a função",
                false,
            ],
            [
                "No projeto do bucket, com roles/iam.serviceAccountTokenCreator concedido à conta de serviço",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma administradora quer permitir que um grupo use uma conta de serviço de produção específica, sem alcançar as outras contas de serviço do projeto. Qual comando atende?",
        explanation:
            "Quem pode usar uma conta de serviço é definido na política da própria conta, então o binding vai no recurso conta de serviço. Concedido no projeto, o papel valeria para todas as contas de serviço, e Service Account Admin daria administração da conta, não uso.",
        topic: "Acesso e segurança",
        options: [
            [
                "gcloud iam service-accounts add-iam-policy-binding prod@meu-projeto.iam.gserviceaccount.com --member=group:sre@exemplo.com --role=roles/iam.serviceAccountUser",
                true,
            ],
            [
                "gcloud iam service-accounts add-iam-policy-binding prod@meu-projeto.iam.gserviceaccount.com --member=group:sre@exemplo.com --role=roles/iam.serviceAccountAdmin",
                false,
            ],
            [
                "gcloud projects add-iam-policy-binding meu-projeto --member=group:sre@exemplo.com --role=roles/iam.serviceAccountUser",
                false,
            ],
            [
                "gcloud projects add-iam-policy-binding meu-projeto --member=serviceAccount:prod@meu-projeto.iam.gserviceaccount.com --role=roles/iam.serviceAccountUser",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma pessoa de plantão precisa de acesso elevado por algumas horas para investigar um incidente, sem que a política do projeto seja alterada para ela. Qual abordagem o Google Cloud indica?",
        explanation:
            "Impersonation entrega acesso elevado temporário sem mudar a política do usuário: com Service Account Token Creator na conta de serviço, ela gera credenciais de curta duração e usa a flag --impersonate-service-account. Service Account User serve para anexar a conta a recursos.",
        topic: "Acesso e segurança",
        options: [
            [
                "Conceder a ela roles/iam.serviceAccountTokenCreator em uma conta de serviço com os papéis do plantão",
                true,
            ],
            [
                "Conceder a ela roles/iam.serviceAccountUser em uma conta de serviço com os papéis do plantão",
                false,
            ],
            [
                "Gerar uma chave JSON da conta de serviço do plantão e enviar o arquivo para ela pelo canal da equipe",
                false,
            ],
            [
                "Conceder roles/editor a ela no projeto e combinar a remoção do papel no fim do turno de plantão",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor tem roles/iam.serviceAccountUser em uma conta de serviço e tenta rodar um comando da gcloud CLI com a flag --impersonate-service-account, mas recebe erro de permissão. Qual é a causa?",
        explanation:
            "A documentação diz que Service Account User deixa anexar a conta a um recurso, mas não permite criar credenciais de curta duração nem usar a flag --impersonate-service-account. Para isso é preciso Service Account Token Creator na conta de serviço que será personificada.",
        topic: "Acesso e segurança",
        options: [
            [
                "Service Account User não cria credenciais de curta duração, o que exige roles/iam.serviceAccountTokenCreator",
                true,
            ],
            [
                "Service Account User só passa a valer depois que a conta de serviço recebe uma chave JSON ativa",
                false,
            ],
            [
                "A flag --impersonate-service-account exige roles/iam.serviceAccountAdmin no projeto da conta",
                false,
            ],
            [
                "A flag --impersonate-service-account só funciona em um comando executado dentro de uma VM com a conta anexada",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe emite tokens de acesso de curta duração para uma conta de serviço e precisa que eles durem mais do que o máximo padrão. O que precisa ser feito?",
        explanation:
            "Por padrão o tempo máximo do token de acesso é de uma hora, e só a restrição de lista constraints/iam.allowServiceAccountCredentialLifetimeExtension estende esse máximo. O campo lifetime respeita o limite vigente, e a outra restrição citada trata de criação de chave.",
        topic: "Acesso e segurança",
        options: [
            [
                "Adicionar a conta de serviço a uma política da organização com constraints/iam.allowServiceAccountCredentialLifetimeExtension",
                true,
            ],
            [
                "Adicionar a conta de serviço a uma política da organização com constraints/iam.disableServiceAccountKeyCreation e reemitir o token",
                false,
            ],
            [
                "Informar o tempo desejado no campo lifetime da chamada generateAccessToken, que não tem limite superior",
                false,
            ],
            [
                "Trocar a chamada generateAccessToken pela generateIdToken, que emite token sem prazo de expiração",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer eliminar as chaves estáticas de conta de serviço do ambiente. Quais duas alternativas o Google Cloud recomenda? (Selecione DUAS opções.)",
        explanation:
            "Para cargas dentro do Google Cloud a recomendação é anexar a conta de serviço ao recurso, e para cargas de fora é usar a Workload Identity Federation, de modo que nenhuma chave seja distribuída. Guardar, enviar ou cifrar a chave mantém uma credencial de longa duração.",
        topic: "Acesso e segurança",
        options: [
            [
                "Anexar uma conta de serviço aos recursos do Google Cloud que executam a carga de trabalho",
                true,
            ],
            [
                "Configurar a Workload Identity Federation para cargas que rodam fora do Google Cloud",
                true,
            ],
            [
                "Guardar a chave JSON no Secret Manager e lê-la na inicialização de cada carga de trabalho",
                false,
            ],
            [
                "Trocar a chave gerada pelo Google por uma chave enviada pela própria empresa com upload",
                false,
            ],
            [
                "Converter a chave JSON em variável de ambiente cifrada na imagem do contêiner da carga",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois de uma auditoria, uma organização quer impedir que novas chaves de conta de serviço sejam criadas em qualquer projeto. Qual recurso atende a isso?",
        explanation:
            "A restrição constraints/iam.disableServiceAccountKeyCreation em política da organização bloqueia a criação de chave em tudo que estiver abaixo. A outra restrição citada impede criar contas de serviço, e papel personalizado não tira permissão de quem já tem outro papel.",
        topic: "Acesso e segurança",
        options: [
            [
                "A política da organização com a restrição constraints/iam.disableServiceAccountKeyCreation",
                true,
            ],
            [
                "A política da organização com a restrição constraints/iam.disableServiceAccountCreation",
                false,
            ],
            [
                "Uma política de recusa que bloqueie a permissão iam.serviceAccounts.getAccessToken nos projetos",
                false,
            ],
            [
                "Um papel personalizado sem a permissão iam.serviceAccountKeys.create concedido na organização",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação em um cluster do GKE precisa acessar um bucket sem usar chave de conta de serviço. Como ligar a conta de serviço do Kubernetes à conta de serviço do IAM?",
        explanation:
            "Com a Workload Identity Federation para GKE, a ligação é feita concedendo roles/iam.workloadIdentityUser na conta de serviço do IAM ao identificador da conta do Kubernetes, no formato com svc.id.goog. Nenhuma chave é criada nem montada dentro do cluster.",
        topic: "Acesso e segurança",
        options: [
            [
                "Conceder roles/iam.workloadIdentityUser na conta do IAM ao membro serviceAccount:PROJETO.svc.id.goog[namespace/ksa]",
                true,
            ],
            [
                "Conceder roles/iam.serviceAccountUser na conta de serviço do IAM ao membro serviceAccount:PROJETO.svc.id.goog[namespace/ksa]",
                false,
            ],
            [
                "Conceder roles/iam.serviceAccountTokenCreator na conta de serviço do Kubernetes ao membro da conta do IAM",
                false,
            ],
            [
                "Montar a chave JSON da conta de serviço do IAM como um Secret do Kubernetes e referenciar no pod",
                false,
            ],
        ],
    },
];
