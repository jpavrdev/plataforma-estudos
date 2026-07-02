// Seed do simulado AWS Certified Cloud Practitioner (questões 4 a 50 do gabarito
// comentado). Idempotente: se o simulado já tiver questões, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-aws-ccp.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node --env-file=.env.prod scripts/seed-aws-ccp.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "aws-cloud-practitioner";

type Questao = { statement: string; explanation: string; options: [string, boolean][] };

const QUESTOES: Questao[] = [
    {
        statement: "Quais tarefas são responsabilidades da AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS é responsável pela segurança da nuvem (hardware, virtualização, infraestrutura física). Grupos de segurança, usuários IAM e treinamento são responsabilidades do cliente (segurança na nuvem).",
        options: [
            ["Configuração de grupos de segurança em instâncias do Amazon EC2", false],
            ["Manutenção da infraestrutura de virtualização", true],
            ["Configuração de dispositivos de infraestrutura da AWS", true],
            ["Criação de usuários e grupos do IAM", false],
            ["Treinamento de funcionários da empresa sobre como usar os serviços da AWS", false],
        ],
    },
    {
        statement:
            "Um engenheiro de nuvem está executando uma instância EC2 e deseja armazenar dados em um recurso anexado à instância. Qual serviço deve ser utilizado?",
        explanation:
            "O EBS é o armazenamento em bloco persistente que se anexa a uma instância EC2. O armazenamento de instância é efêmero, o S3 é de objetos via API e sub-rede é rede.",
        options: [
            ["Volume do Amazon Elastic Block Store (Amazon EBS)", true],
            ["Armazenamento de instância", false],
            ["Bucket do Amazon S3", false],
            ["Sub-rede", false],
        ],
    },
    {
        statement:
            "Qual componente da nuvem privada virtual (VPC) controla o tráfego de entrada e saída para instâncias do Amazon EC2?",
        explanation:
            "O grupo de segurança atua no nível da instância (firewall stateful). A Network ACL controla tráfego no nível da sub-rede; como o enunciado fala em instâncias EC2, a resposta é grupo de segurança.",
        options: [
            ["Lista de controle de acesso de rede", false],
            ["Sub-rede", false],
            ["Gateway de internet", false],
            ["Grupo de segurança", true],
        ],
    },
    {
        statement:
            "Qual opção de preço do Amazon EC2 reduz o custo quando você assume um compromisso de gasto por hora com uma família de instâncias?",
        explanation:
            'A palavra-chave é "compromisso de gasto por hora" com uma família de instâncias, definição do EC2 Instance Savings Plans. As Reservadas comprometem-se com configuração específica de instância.',
        options: [
            ["Instâncias reservadas", false],
            ["Savings Plans da instância do EC2", true],
            ["Instâncias spot", false],
            ["Hosts dedicados", false],
        ],
    },
    {
        statement: "Qual das afirmações a seguir melhor descreve as Zonas de Disponibilidade?",
        explanation:
            "Uma AZ é um ou mais data centers isolados dentro de uma Região. A opção sobre localização geográfica descreve uma Região; as demais descrevem a origem e os edge locations do CloudFront.",
        options: [
            ["Uma parte totalmente isolada da infraestrutura global da AWS", true],
            [
                "Uma localização geográfica separada com vários locais isolados uns dos outros",
                false,
            ],
            ["O servidor do qual o Amazon CloudFront obtém os arquivos", false],
            [
                "Um site que o Amazon CloudFront usa para armazenar em cache cópias de conteúdo para entrega mais rápida",
                false,
            ],
        ],
    },
    {
        statement: "Quais ações você pode executar no Amazon Route 53? (Selecione DUAS opções.)",
        explanation:
            "O Route 53 é o DNS da AWS: gerencia registros DNS e roteia solicitações para recursos na AWS e externos. Monitorar é CloudWatch, automatizar é CloudFormation e conformidade é o AWS Artifact.",
        options: [
            ["Gerenciar registros DNS para nomes de domínio", true],
            ["Conectar solicitações de usuários à infraestrutura na AWS e fora da AWS", true],
            [
                "Monitorar as aplicações e responder a alterações de desempenho em todo o sistema",
                false,
            ],
            ["Automatizar a implantação de cargas de trabalho no ambiente AWS", false],
            [
                "Acessar relatórios de segurança e conformidade da AWS e selecionar contratos on-line",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual categoria do AWS Trusted Advisor inclui verificações para baixa utilização de instâncias do Amazon EC2?",
        explanation:
            "O Trusted Advisor sinaliza instâncias EC2 subutilizadas (baixa utilização) na categoria de otimização de custos.",
        options: [
            ["Segurança", false],
            ["Desempenho", false],
            ["Tolerância a falhas", false],
            ["Otimização de custos", true],
        ],
    },
    {
        statement:
            "Qual ferramenta realiza ações de automação para serviços e aplicações da AWS por meio de scripts?",
        explanation:
            "A AWS CLI automatiza e gerencia serviços via linha de comando/scripts. QLDB é banco ledger, Redshift é data warehouse e Snowball é transferência física de dados.",
        options: [
            ["Amazon QLDB", false],
            ["Amazon Redshift", false],
            ["AWS Command Line Interface", true],
            ["AWS Snowball", false],
        ],
    },
    {
        statement: "Qual serviço é usado para transferência até 100 PB de dados para a AWS?",
        explanation:
            "O Snowmobile move até ~100 PB por unidade (escala de exabytes). O Snowball move dezenas de TB. Neptune é banco de grafos, DeepRacer é ML e CloudFront é CDN.",
        options: [
            ["Amazon Neptune", false],
            ["AWS Snowmobile", true],
            ["AWS DeepRacer", false],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement: "Qual afirmação melhor descreve o Elastic Load Balancing?",
        explanation:
            "Definição exata do ELB. As outras opções descrevem o ElastiCache, o Trusted Advisor/CloudWatch e o EC2 Auto Scaling.",
        options: [
            [
                "Um serviço que permite criar, configurar, gerenciar e dimensionar na nuvem um ambiente de cache ou em memória distribuído",
                false,
            ],
            [
                "Um serviço que fornece dados para monitorar aplicações, otimizar a utilização dos recursos e responder a mudanças sistêmicas de desempenho",
                false,
            ],
            [
                "Um serviço que monitora aplicações e automaticamente adiciona ou remove capacidade dos Resource Groups em resposta a mudanças na demanda",
                false,
            ],
            [
                "Um serviço que distribui o tráfego de entrada entre vários destinos, como instâncias do Amazon EC2",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual serviço apresenta revisão de detalhes de atividades de usuário e chamadas de API que ocorreram no ambiente AWS?",
        explanation:
            "O CloudTrail registra chamadas de API e atividades de usuário (auditoria/governança). CloudWatch monitora desempenho e Inspector avalia vulnerabilidades.",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS CloudTrail", true],
            ["Amazon CloudWatch", false],
            ["Amazon Inspector", false],
        ],
    },
    {
        statement:
            "Qual componente ou serviço estabelece uma conexão privada dedicada entre o data center on-premises e a nuvem privada virtual (VPC)?",
        explanation:
            "O Direct Connect cria um link físico dedicado (sem internet pública). O Gateway Privado Virtual é apenas o lado AWS de uma VPN/Direct Connect.",
        options: [
            ["Gateway privado virtual", false],
            ["AWS Direct Connect", true],
            ["Amazon CloudFront", false],
            ["Gateway de internet", false],
        ],
    },
    {
        statement: "Qual declaração descreve melhor o Amazon GuardDuty?",
        explanation:
            "GuardDuty é detecção de ameaças baseada em ML. As outras opções descrevem o AWS Shield (DDoS), o Inspector e o AWS WAF.",
        options: [
            [
                "Um serviço que protege as aplicações contra ataques distribuídos de negação de serviço (DDoS)",
                false,
            ],
            [
                "Um serviço que verifica as aplicações quanto a vulnerabilidades de segurança e desvios das práticas recomendadas de segurança",
                false,
            ],
            ["Um serviço que monitora as solicitações de rede para aplicações web", false],
            [
                "Um serviço que realiza detecção inteligente de ameaças na infraestrutura e nos recursos da AWS",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual serviço permite consolidar e gerenciar várias contas AWS em um local central?",
        explanation:
            "O Organizations centraliza várias contas (faturamento consolidado, SCPs). KMS gerencia chaves, Artifact dá relatórios de conformidade e IAM gerencia identidades dentro de uma conta.",
        options: [
            ["AWS Organizations", true],
            ["AWS Key Management Service (AWS KMS)", false],
            ["AWS Artifact", false],
            ["AWS Identity and Access Management (IAM)", false],
        ],
    },
    {
        statement: "Qual ação pode ser executada no Amazon CloudFront?",
        explanation:
            "O CloudFront é a CDN da AWS (edge locations). As outras opções descrevem a VPC, o CloudFormation e nuvem híbrida (Outposts/Direct Connect).",
        options: [
            [
                "Provisão de uma seção isolada da nuvem AWS para iniciar recursos em uma rede virtual definida por alguém",
                false,
            ],
            ["Provisão de recursos usando linguagens de programação ou um arquivo de texto", false],
            ["Entregar conteúdo aos clientes por uma rede global de locais de borda", true],
            ["Executar a infraestrutura em uma abordagem de nuvem híbrida", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor de aplicação deseja armazenar dados em um banco de dados de chave-valor. Qual serviço deve ser utilizado?",
        explanation:
            "O DynamoDB é o banco NoSQL chave-valor. Aurora e RDS são relacionais e DocumentDB é orientado a documentos.",
        options: [
            ["Amazon DynamoDB", true],
            ["Amazon Aurora", false],
            ["Amazon RDS", false],
            ["Amazon DocumentDB", false],
        ],
    },
    {
        statement: "Qual serviço permite implantar e dimensionar rapidamente aplicações na AWS?",
        explanation:
            "O Beanstalk (PaaS) faz deploy e escala automático (provisiona EC2, Load Balancer, Auto Scaling). Snowball é transferência de dados, Outposts é on-premises e CloudFront é CDN.",
        options: [
            ["AWS Snowball", false],
            ["AWS Outposts", false],
            ["AWS Elastic Beanstalk", true],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement: "Qual serviço executa aplicações em contêineres na AWS?",
        explanation:
            "O EKS roda contêineres com Kubernetes. Aurora é banco, SageMaker é ML e Redshift é data warehouse.",
        options: [
            ["Amazon Elastic Kubernetes Service (Amazon EKS)", true],
            ["Amazon Aurora", false],
            ["Amazon SageMaker", false],
            ["Amazon Redshift", false],
        ],
    },
    {
        statement:
            "Qual serviço permite criar fluxos de trabalho necessários para a revisão humana das previsões de machine learning?",
        explanation:
            "O Amazon A2I (Augmented AI) é o serviço de human-in-the-loop. Aurora é banco, Lex faz chatbots e Textract extrai texto de documentos.",
        options: [
            ["Amazon Augmented AI", true],
            ["Amazon Aurora", false],
            ["Amazon Lex", false],
            ["Amazon Textract", false],
        ],
    },
    {
        statement: "Qual declaração descreve melhor o AWS Marketplace?",
        explanation:
            "O Marketplace é a loja/catálogo de software de terceiros (ISVs). As outras opções descrevem suporte, o Trusted Advisor e o AWS Support enterprise.",
        options: [
            [
                "Um recurso que pode responder a perguntas sobre práticas recomendadas e ajudar na solução de problemas",
                false,
            ],
            [
                "Uma ferramenta on-line que inspeciona o ambiente AWS e faz recomendações em tempo real de acordo com as práticas recomendadas da AWS",
                false,
            ],
            [
                "Um recurso que oferece orientação, revisões de arquitetura e comunicação contínua com sua empresa durante o planejamento, a implantação e a otimização das aplicações",
                false,
            ],
            [
                "Um catálogo digital que inclui milhares de ofertas de software de fornecedores independentes de software",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual estratégia de migração envolve alterar a forma como uma aplicação é arquitetada e desenvolvida, normalmente usando recursos nativos da nuvem?",
        explanation:
            "Refatorar (re-architecting) reescreve a aplicação para recursos cloud-native. Replatform faz ajustes pequenos, Repurchase troca por SaaS e Rehost é o lift-and-shift.",
        options: [
            ["Redefinir plataforma", false],
            ["Recomprar", false],
            ["Refatorar", true],
            ["Redefinir hospedagem", false],
        ],
    },
    {
        statement:
            "Um engenheiro de nuvem deseja armazenar dados em um volume anexado a uma instância do Amazon EC2. Qual serviço deve ser utilizado?",
        explanation:
            'Palavra-chave: "volume anexado" = armazenamento em bloco = EBS. S3 é objetos via API, ElastiCache é cache e Lambda é serverless.',
        options: [
            ["Amazon Elastic Block Store (Amazon EBS)", true],
            ["Amazon Simple Storage Service (Amazon S3)", false],
            ["Amazon ElastiCache", false],
            ["AWS Lambda", false],
        ],
    },
    {
        statement:
            "Qual perspectiva do AWS Cloud Adoption Framework se concentra na recuperação de cargas de trabalho de TI para atender aos requisitos dos stakeholders da empresa?",
        explanation:
            "A perspectiva de Operações cuida de executar, monitorar e recuperar cargas de trabalho. As demais perspectivas tratam de governança, pessoas e negócio.",
        options: [
            ["Perspectiva de governança", false],
            ["Perspectiva de pessoas", false],
            ["Perspectiva de negócio", false],
            ["Perspectiva de operações", true],
        ],
    },
    {
        statement:
            "Qual pilar do AWS Well-Architected Framework tem foco em usar recursos de computação de maneiras que atendam aos requisitos do sistema?",
        explanation:
            "Eficiência de Desempenho trata de usar recursos computacionais adequados à demanda. Confiabilidade é recuperação, Segurança é proteção e Excelência Operacional é executar/melhorar processos.",
        options: [
            ["Confiabilidade", false],
            ["Segurança", false],
            ["Excelência operacional", false],
            ["Eficiência de desempenho", true],
        ],
    },
    {
        statement:
            "Na storage class S3 Intelligent-Tiering, o Amazon S3 move objetos entre um nível de acesso frequente e um nível de acesso pouco frequente. Quais classes de armazenamento são usadas? (Selecione DUAS opções.)",
        explanation:
            "O Intelligent-Tiering move objetos entre o tier de acesso frequente (S3 Standard) e o de acesso infrequente (S3 Standard-IA). As demais são classes de arquivamento separadas.",
        options: [
            ["S3 One Zone – IA", false],
            ["S3 Glacier Flexible Retrieval", false],
            ["S3 Standard-IA", true],
            ["S3 Standard", true],
            ["S3 Glacier Deep Archive", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor de aplicação deseja enviar e receber mensagens entre componentes distribuídos de aplicações. Qual serviço deve ser utilizado?",
        explanation:
            "O SQS é o serviço de filas que desacopla componentes distribuídos. Snowball é transferência, ElastiCache é cache e Route 53 é DNS.",
        options: [
            ["AWS Snowball", false],
            ["Amazon ElastiCache", false],
            ["Amazon Route 53", false],
            ["Amazon Simple Queue Service (Amazon SQS)", true],
        ],
    },
    {
        statement:
            "Quais recomendações estão incluídas nas verificações do AWS Trusted Advisor? (Selecione DUAS respostas.)",
        explanation:
            "Verificações clássicas de Segurança do Trusted Advisor: buckets S3 abertos e MFA no root. Interrupções é o Health Dashboard, patches é Systems Manager/Inspector e número de usuários não é verificação.",
        options: [
            ["Permissões de bucket do Amazon S3", true],
            ["Interrupções de produtos da AWS para serviços", false],
            ["Uso de autenticação multifator (MFA) no usuário raiz da conta da AWS", true],
            ["Patches de software disponíveis para instâncias Amazon EC2", false],
            ["Número de usuários na conta", false],
        ],
    },
    {
        statement:
            "Qual princípio de design da arquitetura da Nuvem AWS é compatível com a distribuição de cargas de trabalho em várias zonas de disponibilidade?",
        explanation:
            "Distribuir cargas em múltiplas AZs é projetar para falhas (alta disponibilidade). Automação reduz esforço manual, agilidade é velocidade e elasticidade é escalar conforme demanda.",
        options: [
            ["Implementação de automação", false],
            ["Design para agilidade", false],
            ["Design à prova de falhas", true],
            ["Implementação de elasticidade", false],
        ],
    },
    {
        statement:
            "Uma empresa tem um servidor de aplicações em execução em uma instância Amazon EC2. O servidor precisa acessar o conteúdo em um bucket privado do Amazon S3. Qual é a abordagem recomendada?",
        explanation:
            "Prática recomendada: IAM role anexada à instância, sem credenciais codificadas. Peering de VPC conecta VPCs; chaves codificadas ou armazenadas devem ser evitadas.",
        options: [
            [
                "Crie uma IAM role com as permissões apropriadas e associe a role à instância EC2.",
                true,
            ],
            [
                "Configure uma conexão de peering de VPC para permitir a comunicação privada entre a instância EC2 e o bucket do S3.",
                false,
            ],
            [
                "Crie uma chave de acesso compartilhada e configure a instância EC2 para usar a chave codificada.",
                false,
            ],
            ["Configure a aplicação para ler uma chave de acesso de uma fonte segura.", false],
        ],
    },
    {
        statement:
            "Quais recursos ou serviços relacionados à segurança a AWS oferece? (Selecione DUAS respostas.)",
        explanation:
            'Verificações de segurança do Trusted Advisor e criptografia são recursos reais. "Compliance completa com PCI" é falso (responsabilidade compartilhada); pentest automatizado e detecção de direitos autorais não são serviços oferecidos.',
        options: [
            ["Compliance completa com PCI para aplicações do cliente executadas na AWS", false],
            ["Verificações de segurança do AWS Trusted Advisor", true],
            ["Criptografia dos dados", true],
            ["Teste de penetração automatizado", false],
            ["Detecção de conteúdo protegido por direitos autorais do Amazon S3", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de acesso ininterrupto por telefone, e-mail e chat. O tempo de resposta deverá ser inferior a uma hora se um sistema de produção tiver uma interrupção de serviço. Qual plano do AWS Support atende a esse requisito pelo MENOR custo?",
        explanation:
            "Suporte 24/7 por telefone/chat e resposta menor que 1 h para produção inoperante começa no plano Business. Developer não tem telefone nem esse SLA; Enterprise atende mas custa mais.",
        options: [
            ["AWS Basic Support", false],
            ["AWS Developer Support", false],
            ["AWS Business Support", true],
            ["AWS Enterprise Support", false],
        ],
    },
    {
        statement:
            "Uma empresa está hospedando um site estático por meio de um único bucket do Amazon S3. Qual produto da AWS atingirá latência mais baixa e alta velocidade de transferência?",
        explanation:
            "O CloudFront (CDN) entrega conteúdo de edge locations próximas, reduzindo latência. Beanstalk é deploy, DAX acelera o DynamoDB e Route 53 é DNS.",
        options: [
            ["AWS Elastic Beanstalk", false],
            ["Amazon DynamoDB Accelerator (DAX)", false],
            ["Amazon Route 53", false],
            ["Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "Uma empresa precisa monitorar e receber alertas sobre eventos de login do Console de Gerenciamento da AWS que envolvem o usuário raiz da conta. Qual produto da AWS a empresa deve usar?",
        explanation:
            "O CloudWatch cria o alarme que dispara o alerta (alimentado pelo CloudTrail). Config avalia conformidade, Trusted Advisor faz recomendações e IAM gerencia identidades.",
        options: [
            ["Amazon CloudWatch", true],
            ["AWS Config", false],
            ["AWS Trusted Advisor", false],
            ["AWS Identity and Access Management (IAM)", false],
        ],
    },
    {
        statement:
            "Qual das opções a seguir descreve uma melhor prática de segurança que pode ser implementada usando o AWS Identity and Access Management (IAM)?",
        explanation:
            "Princípio do menor privilégio (least privilege). As demais são práticas ruins: desativar console para todos, gerar chaves para cada usuário e armazenar credenciais em EC2 (o correto é usar IAM roles).",
        options: [
            ["Desativar o acesso ao Console de Gerenciamento da AWS para todos os usuários", false],
            ["Gerar chaves secretas para cada usuário do IAM", false],
            [
                "Conceder permissões a usuários que precisam executar apenas uma tarefa específica",
                true,
            ],
            ["Armazenar credenciais da AWS em instâncias Amazon EC2", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma conexão privada dedicada entre suas operações locais e a Nuvem AWS. Qual recurso ou produto da AWS fornecerá essa conexão?",
        explanation:
            "O Direct Connect cria um link físico dedicado (sem internet). VPN e VPN endpoint usam a internet pública; PrivateLink conecta serviços/VPCs dentro da AWS.",
        options: [
            ["AWS VPN", false],
            ["AWS PrivateLink", false],
            ["VPN endpoint", false],
            ["AWS Direct Connect", true],
        ],
    },
    {
        statement:
            "Uma empresa exige isolamento físico de suas instâncias Amazon EC2 das instâncias de outros clientes. Qual opção de compra de instâncias atende a esse requisito?",
        explanation:
            "Palavra-chave: isolamento físico. O Dedicated Host fornece um servidor físico inteiro dedicado. Reservadas, On-Demand e Spot são modelos de preço em hardware compartilhado.",
        options: [
            ["Hosts dedicados", true],
            ["Instâncias reservadas", false],
            ["Instâncias On-Demand", false],
            ["Instâncias Spot", false],
        ],
    },
    {
        statement:
            "Qual das seguintes opções é uma responsabilidade da AWS de acordo com o modelo de responsabilidade compartilhada da AWS?",
        explanation:
            "A AWS é responsável pela segurança da nuvem (infraestrutura física). Projetar DR, atualizar SO convidado e configurar recursos são responsabilidades do cliente.",
        options: [
            ["Projetar a aplicação de um cliente para recuperação de desastres", false],
            [
                "Atualizar os sistemas operacionais convidados em instâncias Amazon EC2 implantadas",
                false,
            ],
            ["Configurar novos recursos em uma conta da AWS", false],
            ["Proteger a infraestrutura física", true],
        ],
    },
    {
        statement:
            "Quais recursos ou produtos da AWS são compatíveis com a replicação de dados em todas as regiões AWS? (Selecione DUAS respostas.)",
        explanation:
            "S3 (Cross-Region Replication) e RDS (réplicas de leitura entre regiões) replicam dados entre regiões. EBS é por AZ, Instance Store é efêmero/local e Storage Gateway é híbrido.",
        options: [
            ["Amazon S3", true],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["Amazon EC2 Instance store", false],
            ["Amazon Storage Gateway", false],
            ["Amazon RDS", true],
        ],
    },
    {
        statement:
            "Qual modelo de preço do Amazon EC2 se ajusta com base na oferta e na demanda de instâncias EC2?",
        explanation:
            "As Spot usam capacidade ociosa e o preço varia conforme oferta e demanda. On-Demand tem preço fixo; reservadas e conversíveis têm preço fixo com compromisso de prazo.",
        options: [
            ["Instâncias On-Demand", false],
            ["Instâncias reservadas", false],
            ["Instâncias Spot", true],
            ["Instâncias reservadas conversíveis", false],
        ],
    },
    {
        statement:
            "Qual produto da AWS pode criar um alarme que envia uma notificação quando um limite de faturamento é excedido?",
        explanation:
            "Os billing alarms são criados no CloudWatch (métrica EstimatedCharges + notificação via SNS). CloudTrail apenas audita chamadas de API; Trusted Advisor recomenda; QuickSight é BI.",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS CloudTrail", false],
            ["Amazon CloudWatch", true],
            ["Amazon QuickSight", false],
        ],
    },
    {
        statement:
            "Qual produto da AWS fornece uma solução de armazenamento de arquivos compartilhado, simples e escalável para uso com servidores locais e instâncias Amazon EC2?",
        explanation:
            "Palavra-chave: armazenamento de arquivos compartilhado (NFS, montável em várias instâncias). AMS é operações, Glacier é arquivamento e EBS é bloco anexado a uma única instância.",
        options: [
            ["AWS Managed Services (AMS)", false],
            ["Amazon S3 Glacier", false],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["Amazon Elastic File System (Amazon EFS)", true],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são vantagens da Nuvem AWS? (Selecione DUAS respostas.)",
        explanation:
            "A AWS cuida da manutenção da infraestrutura e do planejamento de capacidade dos servidores físicos. Segurança das aplicações do cliente, desenvolvimento e planejamento de custos são do cliente.",
        options: [
            ["A AWS gerencia a manutenção da infraestrutura de nuvem", true],
            ["A AWS gerencia a segurança de aplicações criadas na AWS", false],
            ["A AWS gerencia o planejamento de capacidade para servidores físicos", true],
            ["A AWS gerencia o desenvolvimento de aplicações na AWS", false],
            ["A AWS gerencia o planejamento de custos para servidores virtuais", false],
        ],
    },
    {
        statement:
            "Quais das seguintes opções são benefícios da Nuvem AWS? (Selecione DUAS respostas.)",
        explanation:
            'Trocar CapEx por OpEx e ganhar agilidade são benefícios clássicos da nuvem. "Segurança na nuvem" é do cliente e não é um benefício; equipe de TI maior e fatura fixa são falsos.',
        options: [
            ["As empresas precisam de uma equipe de TI maior", false],
            ["As despesas de capital são substituídas por despesas variáveis", true],
            [
                "Os clientes recebem a mesma fatura mensal, independentemente de quais recursos eles usam",
                false,
            ],
            ["As empresas ganham maior agilidade", true],
            ["A AWS é responsável pela segurança na nuvem", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é uma vantagem do faturamento consolidado na AWS?",
        explanation:
            "O faturamento consolidado junta o uso de todas as contas, atingindo descontos por volume mais cedo. Permissões é IAM; várias faturas é o oposto; marcação de recursos não tem relação.",
        options: [
            ["Qualificação de preços por volume", true],
            ["Permissões de acesso compartilhado", false],
            ["Várias faturas para cada conta", false],
            ["Eliminação da necessidade de marcar recursos", false],
        ],
    },
    {
        statement:
            "Qual aspecto da infraestrutura da AWS fornece implementação global de computação e armazenamento?",
        explanation:
            "As Regiões espalhadas pelo mundo dão o alcance global. Várias AZs em uma região dão disponibilidade regional. Tags e Resource Groups organizam recursos.",
        options: [
            ["Várias zonas de disponibilidade em uma região da AWS", false],
            ["Várias regiões AWS", true],
            ["Tags", false],
            ["Resource Groups", false],
        ],
    },
    {
        statement: "Qual declaração é VERDADEIRA sobre o AWS Lambda?",
        explanation:
            "Essência do serverless: paga-se só pelo tempo de execução. As demais contradizem o modelo (pagar antecipado, configurar/provisionar servidores).",
        options: [
            ["A empresa paga apenas pelo tempo de computação durante a execução do código", true],
            [
                "Para usar o AWS Lambda, uma empresa precisa pagar antecipadamente pelo tempo estimado de computação",
                false,
            ],
            [
                "Para usar o AWS Lambda, uma empresa precisa configurar os servidores que executam o código",
                false,
            ],
            ["A primeira etapa ao usar o AWS Lambda é provisionar um servidor", false],
        ],
    },
    {
        statement:
            "Qual princípio da arquitetura da Nuvem AWS afirma que os sistemas devem reduzir as interdependências?",
        explanation:
            '"Reduzir interdependências" = acoplamento fraco (loose coupling), via SQS, Load Balancer etc. "Serviços, não servidores" é sobre serverless; escalabilidade e automação tratam de outros aspectos.',
        options: [
            ["Escalabilidade", false],
            ["Serviços, não servidores", false],
            ["Automação", false],
            ["Acoplamento fraco", true],
        ],
    },
    {
        statement:
            "Qual recurso da AWS permite testar diversos serviços sem custo, dentro de certos limites?",
        explanation:
            "O AWS Free Tier oferece uso gratuito limitado (alguns por 12 meses, outros sempre grátis). Budgets, Cost Explorer e Pricing Calculator são ferramentas de custo, não de uso gratuito.",
        options: [
            ["AWS Free Tier", true],
            ["AWS Budgets", false],
            ["AWS Cost Explorer", false],
            ["AWS Pricing Calculator", false],
        ],
    },
    {
        statement:
            "Qual serviço protege aplicações contra ataques distribuídos de negação de serviço (DDoS)?",
        explanation:
            "O AWS Shield é a proteção contra DDoS (Standard grátis, Advanced pago). O WAF filtra tráfego web na camada 7, o GuardDuty detecta ameaças e o KMS gerencia chaves.",
        options: [
            ["AWS WAF", false],
            ["AWS Shield", true],
            ["Amazon GuardDuty", false],
            ["AWS Key Management Service (AWS KMS)", false],
        ],
    },
    {
        statement:
            "Qual serviço permite provisionar a infraestrutura da AWS como código, a partir de templates?",
        explanation:
            "O CloudFormation provisiona recursos via templates (infraestrutura como código). CodeDeploy faz deploy de aplicações, Config avalia conformidade e OpsWorks é gestão de configuração com Chef/Puppet.",
        options: [
            ["AWS CloudFormation", true],
            ["AWS CodeDeploy", false],
            ["AWS Config", false],
            ["AWS OpsWorks", false],
        ],
    },
    {
        statement:
            "Qual serviço gerenciado facilita executar bancos de dados relacionais, como MySQL e PostgreSQL, na AWS?",
        explanation:
            "O Amazon RDS gerencia bancos relacionais (MySQL, PostgreSQL, MariaDB etc.). DynamoDB é NoSQL, Redshift é data warehouse e ElastiCache é cache em memória.",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon RDS", true],
            ["Amazon Redshift", false],
            ["Amazon ElastiCache", false],
        ],
    },
    {
        statement:
            "Qual recurso ajusta automaticamente a quantidade de instâncias do Amazon EC2 conforme a demanda?",
        explanation:
            "O Amazon EC2 Auto Scaling adiciona e remove instâncias conforme a demanda (elasticidade). O Elastic Load Balancing distribui o tráfego, mas não muda a quantidade de instâncias.",
        options: [
            ["Elastic Load Balancing", false],
            ["Amazon EC2 Auto Scaling", true],
            ["AWS Lambda", false],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement: "Quais são pilares do AWS Well-Architected Framework? (Selecione DUAS opções.)",
        explanation:
            "Os seis pilares são: Excelência Operacional, Segurança, Confiabilidade, Eficiência de Desempenho, Otimização de Custos e Sustentabilidade. Portabilidade e escalabilidade automática não são pilares.",
        options: [
            ["Excelência operacional", true],
            ["Sustentabilidade", true],
            ["Portabilidade", false],
            ["Escalabilidade automática", false],
            ["Marketing", false],
        ],
    },
    {
        statement:
            "Qual é uma prática recomendada para proteger o usuário raiz (root) de uma conta AWS?",
        explanation:
            "Ative o MFA no root e use-o apenas para tarefas que exigem o root, criando usuários IAM para o dia a dia. Compartilhar credenciais, usar o root sempre ou criar chaves de acesso do root são práticas ruins.",
        options: [
            ["Compartilhar as credenciais do root com a equipe", false],
            ["Ativar MFA e usar o root apenas para tarefas específicas", true],
            ["Usar o root para todas as tarefas do dia a dia", false],
            ["Criar chaves de acesso do root para automação", false],
        ],
    },
    {
        statement:
            "Qual serviço coleta métricas e logs para monitorar o desempenho de recursos e aplicações da AWS?",
        explanation:
            "O Amazon CloudWatch coleta métricas, logs e dispara alarmes. O CloudTrail audita chamadas de API, o Config avalia conformidade e o Trusted Advisor faz recomendações.",
        options: [
            ["AWS CloudTrail", false],
            ["Amazon CloudWatch", true],
            ["AWS Config", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual serviço é indicado para armazenar e hospedar arquivos de um site estático com alta durabilidade?",
        explanation:
            "O Amazon S3 armazena objetos com durabilidade de 99,999999999% (11 noves) e pode hospedar sites estáticos. O EBS é bloco anexado a uma instância e o RDS é banco relacional.",
        options: [
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["Amazon Simple Storage Service (Amazon S3)", true],
            ["AWS Lambda", false],
            ["Amazon RDS", false],
        ],
    },
    {
        statement: "Qual característica descreve melhor o AWS Lambda?",
        explanation:
            "O Lambda é serverless: executa código sem que você provisione ou gerencie servidores, cobrando pelo tempo de execução. Não há SO para gerenciar nem capacidade mínima mensal.",
        options: [
            ["Você gerencia o sistema operacional dos servidores", false],
            ["Executa código sem provisionar ou gerenciar servidores", true],
            ["Cobra sempre por instância reservada", false],
            ["Exige uma capacidade mínima contratada por mês", false],
        ],
    },
    {
        statement: "O que é uma Amazon Virtual Private Cloud (VPC)?",
        explanation:
            "A VPC é uma rede virtual isolada, sua, dentro da AWS, onde você provisiona recursos e controla sub-redes, rotas e gateways. Não é CDN, banco de dados nem fila de mensagens.",
        options: [
            ["Um serviço de rede de entrega de conteúdo (CDN)", false],
            ["Uma rede virtual isolada na AWS onde você provisiona recursos", true],
            ["Um banco de dados relacional gerenciado", false],
            ["Um serviço de fila de mensagens", false],
        ],
    },
    {
        statement:
            "Qual serviço permite definir orçamentos e receber alertas quando os custos ou o uso ultrapassam um limite?",
        explanation:
            "O AWS Budgets define orçamentos com alertas. O Cost Explorer analisa e visualiza custos já incorridos e o Pricing Calculator estima custos antes de usar.",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Budgets", true],
            ["AWS Pricing Calculator", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement: "Qual plano do AWS Support inclui um Technical Account Manager (TAM) dedicado?",
        explanation:
            "O TAM dedicado faz parte do plano Enterprise Support. Basic e Developer não têm TAM, e o Business também não tem um TAM dedicado.",
        options: [
            ["AWS Basic Support", false],
            ["AWS Developer Support", false],
            ["AWS Business Support", false],
            ["AWS Enterprise Support", true],
        ],
    },
    {
        statement:
            "Qual serviço gerencia cadastro, login e identidade de usuários para aplicações web e mobile?",
        explanation:
            "O Amazon Cognito faz sign-up, sign-in e federação de identidade para aplicações. O IAM controla o acesso à conta AWS, o KMS gerencia chaves e o Secrets Manager guarda segredos.",
        options: [
            ["AWS Identity and Access Management (IAM)", false],
            ["Amazon Cognito", true],
            ["AWS Key Management Service (AWS KMS)", false],
            ["AWS Secrets Manager", false],
        ],
    },
    {
        statement:
            "Qual conceito da nuvem descreve aumentar ou reduzir recursos automaticamente conforme a demanda, pagando apenas pelo que usa?",
        explanation:
            "Elasticidade é escalar recursos conforme a demanda, pagando pelo uso. Alta disponibilidade trata de continuar operando apesar de falhas; capacidade fixa é o oposto da nuvem.",
        options: [
            ["Elasticidade", true],
            ["Alta disponibilidade", false],
            ["Colocation", false],
            ["Capacidade fixa provisionada", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa transferir 80 TB de dados para a AWS sem depender da conexão de internet. Qual serviço usar?",
        explanation:
            "O AWS Snowball é um dispositivo físico para mover dezenas de TB offline. Transfer Acceleration e Direct Connect dependem da rede, e o CloudFront é uma CDN.",
        options: [
            ["AWS Snowball", true],
            ["Amazon S3 Transfer Acceleration", false],
            ["AWS Direct Connect", false],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada, quais itens são responsabilidade DO CLIENTE? (Selecione DUAS opções.)",
        explanation:
            "O cliente cuida da segurança NA nuvem: seus dados, criptografia do lado do cliente e configuração de rede (como grupos de segurança). A AWS cuida da segurança DA nuvem: infraestrutura física, hardware e rede global.",
        options: [
            ["Gerenciar os dados e a criptografia do lado do cliente", true],
            ["Manter a segurança física dos data centers", false],
            ["Configurar grupos de segurança e regras de firewall", true],
            ["Manter o hardware da infraestrutura", false],
            ["Manter a rede global da AWS", false],
        ],
    },
    {
        statement: "Por que implantar uma aplicação em múltiplas Zonas de Disponibilidade (AZs)?",
        explanation:
            "Distribuir a aplicação em múltiplas AZs aumenta a disponibilidade e a tolerância a falhas: se uma AZ ficar indisponível, as outras continuam atendendo. Não é para reduzir custo nem contornar o modelo de responsabilidade compartilhada.",
        options: [
            ["Para reduzir o custo de armazenamento", false],
            ["Para aumentar a disponibilidade e a tolerância a falhas", true],
            ["Para contornar o modelo de responsabilidade compartilhada", false],
            ["Para dispensar o uso de IAM", false],
        ],
    },
    {
        statement:
            "Uma empresa está encerrando seu data center próprio e migrando as cargas de trabalho para a Nuvem AWS. Qual mudança no modelo financeiro essa decisão representa?",
        explanation:
            "Na nuvem, o grande investimento inicial em hardware (CapEx) dá lugar a um custo variável baseado no consumo (OpEx), pagando apenas pelo que se usa. As demais opções invertem ou distorcem esse modelo, pois a nuvem não elimina custos nem aumenta o investimento inicial.",
        options: [
            ["Troca de despesas de capital (CapEx) por despesas variáveis (OpEx).", true],
            ["Troca de despesas variáveis (OpEx) por despesas de capital (CapEx).", false],
            ["Eliminação de todos os custos, tornando a infraestrutura gratuita.", false],
            ["Aumento do investimento inicial em servidores físicos.", false],
        ],
    },
    {
        statement:
            "Por que a AWS consegue reduzir os preços de seus serviços ao longo do tempo e repassar essa economia aos clientes?",
        explanation:
            "Com um grande número de clientes usando a nuvem, a AWS alcança enormes economias de escala e repassa a redução de custos na forma de preços menores. As outras opções contrariam o modelo de nuvem gerenciada e de pagamento pelo uso.",
        options: [
            [
                "Porque o grande volume de uso agregado de muitos clientes gera economias de escala.",
                true,
            ],
            ["Porque cada cliente adquire e mantém o próprio hardware dedicado.", false],
            ["Porque os serviços passam a ser gratuitos após 12 meses de uso.", false],
            ["Porque a AWS transfere os custos de manutenção física para o cliente.", false],
        ],
    },
    {
        statement:
            "Antes de migrar para a nuvem, uma empresa comprava servidores em excesso para suportar picos de acesso e mantinha grande parte da capacidade ociosa no restante do tempo. Qual vantagem da computação em nuvem elimina essa necessidade?",
        explanation:
            "Na nuvem você provisiona a capacidade necessária no momento e ajusta conforme a demanda, sem precisar prever o pico com antecedência nem manter recursos ociosos. As demais opções tratam de cobrança, isolamento e segurança, não de dimensionamento de capacidade.",
        options: [
            ["Parar de adivinhar a capacidade.", true],
            ["Faturamento consolidado.", false],
            ["Isolamento físico das instâncias.", false],
            ["Modelo de responsabilidade compartilhada.", false],
        ],
    },
    {
        statement:
            "Uma empresa deseja disponibilizar sua aplicação para clientes em novos países, implantando-a em diferentes partes do mundo com poucos cliques e em minutos. Qual vantagem da nuvem AWS descreve essa capacidade?",
        explanation:
            "A infraestrutura global da AWS permite implantar aplicações em várias Regiões do mundo rapidamente, aproximando-as dos usuários, o que corresponde a tornar-se global em minutos. As outras opções descrevem custo, preços e resiliência, não expansão geográfica.",
        options: [
            ["Tornar-se global em minutos.", true],
            ["Troca de despesa operacional por despesa de capital.", false],
            ["Economia de escala.", false],
            ["Tolerância a falhas.", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento passou a provisionar servidores e bancos de dados em minutos, em vez de esperar semanas pela compra e instalação de hardware. Qual benefício da nuvem AWS isso representa?",
        explanation:
            "Agilidade é a capacidade de disponibilizar recursos de TI em minutos, reduzindo o tempo para experimentar, inovar e lançar produtos. Economia de escala e faturamento consolidado referem-se a custos, e isolamento físico à forma de alocação de hardware.",
        options: [
            ["Aumento da agilidade.", true],
            ["Economia de escala.", false],
            ["Faturamento consolidado.", false],
            ["Isolamento físico de recursos.", false],
        ],
    },
    {
        statement:
            "Durante a Black Friday, uma loja online usa a elasticidade da nuvem para adicionar servidores no pico e removê-los assim que o movimento diminui. Qual é o principal benefício financeiro dessa elasticidade?",
        explanation:
            "A elasticidade permite escalar os recursos para cima e para baixo conforme a demanda, de modo que se paga apenas pelo que é usado no pico, sem manter nem pagar capacidade ociosa. As demais opções descrevem cobrança fixa, superprovisionamento antecipado ou gratuidade, que não correspondem à elasticidade.",
        options: [
            [
                "Paga-se apenas pela capacidade extra enquanto ela é realmente necessária, evitando custos com recursos ociosos.",
                true,
            ],
            ["Passa-se a pagar um valor fixo mensal, independentemente do uso.", false],
            ["É preciso comprar antecipadamente servidores para o pico anual.", false],
            ["Elimina-se qualquer custo de computação durante o evento.", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve corretamente a diferença entre alta disponibilidade e tolerância a falhas?",
        explanation:
            "Alta disponibilidade reduz ao mínimo o tempo de inatividade, mas admite uma breve interrupção durante a recuperação, enquanto tolerância a falhas mantém o sistema em operação contínua mesmo diante de falhas, geralmente por redundância. Não são sinônimos nem dependem do tipo de ambiente.",
        options: [
            [
                "Alta disponibilidade busca minimizar o tempo de inatividade, admitindo uma breve interrupção durante a recuperação, enquanto tolerância a falhas permite que o sistema continue operando sem interrupção mesmo com a falha de um componente.",
                true,
            ],
            ["São termos idênticos e podem ser usados como sinônimos.", false],
            [
                "Tolerância a falhas significa que o sistema pode ficar indisponível por longos períodos, enquanto alta disponibilidade não.",
                false,
            ],
            [
                "Alta disponibilidade só existe em ambientes on-premises, e tolerância a falhas só existe na nuvem.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema de pagamentos é projetado com componentes redundantes de modo que, se um componente falhar, o sistema continua funcionando sem qualquer interrupção perceptível para o usuário. Qual conceito isso exemplifica?",
        explanation:
            "Tolerância a falhas é a capacidade de continuar operando sem interrupção mesmo quando um componente falha, normalmente por meio de redundância. Elasticidade trata de ajustar a capacidade à demanda, e as demais opções são conceitos de custo.",
        options: [
            ["Tolerância a falhas.", true],
            ["Economia de escala.", false],
            ["Elasticidade.", false],
            ["Troca de CapEx por OpEx.", false],
        ],
    },
    {
        statement:
            "Qual é uma vantagem de executar cargas de trabalho na Nuvem AWS em comparação com uma infraestrutura on-premises tradicional?",
        explanation:
            "Na nuvem não há investimento inicial em hardware, paga-se apenas pelo uso e a AWS é responsável pela infraestrutura física, o oposto do modelo on-premises. As demais opções descrevem características do on-premises, não vantagens da nuvem.",
        options: [
            [
                "Não é necessário investir antecipadamente em hardware, paga-se apenas pelos recursos consumidos e a AWS cuida da infraestrutura física.",
                true,
            ],
            [
                "O cliente passa a ser responsável por comprar e manter os servidores físicos.",
                false,
            ],
            ["É obrigatório dimensionar toda a capacidade com anos de antecedência.", false],
            ["A empresa precisa construir os próprios data centers em cada país.", false],
            ["A empresa precisa manter uma equipe dedicada à operação do hardware físico.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer deixar de dedicar tempo e dinheiro à instalação, energização e manutenção de servidores físicos para concentrar seus recursos naquilo que diferencia o negócio. Qual vantagem da computação em nuvem atende a esse objetivo?",
        explanation:
            "Ao mover cargas para a nuvem, a empresa deixa o trabalho pesado indiferenciado, como instalação, energia e manutenção, sob responsabilidade da AWS e foca no que diferencia o negócio. As demais opções descrevem o oposto de vantagens da nuvem.",
        options: [
            ["Parar de gastar dinheiro executando e mantendo data centers.", true],
            ["Adivinhar a capacidade com anos de antecedência.", false],
            ["Trocar despesas variáveis por despesas de capital.", false],
            ["Aumentar a latência para usuários globais.", false],
        ],
    },
    {
        statement:
            "Uma empresa afirma que seu sistema de e-commerce foi projetado para operar de forma confiável, com o mínimo de tempo de inatividade e recuperação rápida em caso de falhas. Qual característica de arquitetura está sendo descrita?",
        explanation:
            "Alta disponibilidade é a capacidade de um sistema permanecer operacional com o mínimo de indisponibilidade e se recuperar rapidamente de falhas. As demais opções tratam de custos e cobrança, não de disponibilidade.",
        options: [
            ["Alta disponibilidade.", true],
            ["Economia de escala.", false],
            ["Troca de CapEx por OpEx.", false],
            ["Faturamento consolidado.", false],
        ],
    },
    {
        statement:
            "Uma equipe usa um ambiente de testes apenas durante o horário comercial e o desliga à noite e nos fins de semana. Qual característica do modelo de preços da AWS permite reduzir custos nesse cenário?",
        explanation:
            "Com o pagamento conforme o uso, você paga apenas pelos recursos enquanto estão em execução, então desligar o ambiente fora do horário reduz a conta. As demais opções descrevem modelos de custo fixo ou antecipado, que não se aplicam ao pagamento sob demanda.",
        options: [
            [
                "Pagamento conforme o uso, cobrando apenas pelos recursos enquanto estão em execução.",
                true,
            ],
            ["Cobrança de uma taxa fixa mensal, independentemente do uso.", false],
            ["Necessidade de um contrato de longo prazo com pagamento antecipado.", false],
            ["Cobrança pela capacidade máxima provisionada, mesmo quando ociosa.", false],
        ],
    },
    {
        statement:
            "Uma aplicação tem usuários na América do Sul, na Europa e na Ásia e sofre com alta latência porque roda em uma única localidade. Qual característica da nuvem AWS ajuda a reduzir a latência para esses usuários?",
        explanation:
            "Com o alcance global da AWS, é possível implantar a aplicação em várias Regiões próximas dos usuários, reduzindo a latência. As demais opções tratam de custo e cobrança, sem relação com o desempenho geográfico.",
        options: [
            [
                "Implantar a aplicação em Regiões da AWS próximas dos usuários, aproveitando o alcance global.",
                true,
            ],
            ["Trocar o modelo de despesas operacionais por despesas de capital.", false],
            ["Beneficiar-se das economias de escala da AWS.", false],
            ["Consolidar o faturamento de várias contas.", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir estão entre as seis vantagens da computação em nuvem apresentadas pela AWS? (Selecione DUAS opções.)",
        explanation:
            "Entre as seis vantagens da computação em nuvem estão parar de adivinhar a capacidade e tornar-se global em minutos. Aumentar o investimento inicial, manter data centers próprios e superprovisionar recursos são justamente práticas que a nuvem elimina.",
        options: [
            ["Parar de adivinhar a capacidade.", true],
            ["Tornar-se global em minutos.", true],
            ["Aumentar o investimento inicial em hardware.", false],
            ["Manter e operar data centers próprios.", false],
            ["Superprovisionar recursos para garantir capacidade.", false],
        ],
    },
    {
        statement:
            "Quais práticas de arquitetura ajudam a aumentar a disponibilidade de uma aplicação e a reduzir pontos únicos de falha? (Selecione DUAS opções.)",
        explanation:
            "Redundância, que elimina pontos únicos de falha, e balanceamento de carga, que redireciona o tráfego de recursos com falha para recursos íntegros, aumentam a disponibilidade. Servidor único, ausência de backups e recuperação manual reduzem a disponibilidade.",
        options: [
            ["Adicionar componentes redundantes para eliminar pontos únicos de falha.", true],
            [
                "Usar balanceamento de carga para desviar o tráfego de instâncias com falha para instâncias íntegras.",
                true,
            ],
            ["Executar toda a aplicação em um único servidor para reduzir custos.", false],
            ["Desativar os backups para economizar espaço de armazenamento.", false],
            ["Depender apenas de recuperação manual após cada falha.", false],
        ],
    },
    {
        statement:
            "Quais afirmações descrevem corretamente o modelo de despesa variável (OpEx) da Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "No modelo de despesa variável, paga-se apenas pelo que se consome e não há grande investimento inicial em hardware. Compra antecipada, custo fixo independente do uso e depreciação de data centers próprios são características do modelo de capital (CapEx) do on-premises.",
        options: [
            ["Paga-se apenas pelos recursos efetivamente consumidos.", true],
            ["Não é necessário um grande investimento inicial (upfront) em hardware.", true],
            ["Exige a compra antecipada de servidores para os próximos anos.", false],
            ["Os custos independem do volume de uso e são sempre fixos.", false],
            ["O cliente deprecia em seu balanço os data centers que possui.", false],
        ],
    },
    {
        statement: "Qual das afirmações a seguir descreve corretamente uma Região da AWS?",
        explanation:
            "Uma Região da AWS é uma área geográfica que reúne várias Zonas de Disponibilidade isoladas e fisicamente separadas. As demais opções descrevem, respectivamente, um único data center, uma edge location e uma sub-rede dentro de uma VPC.",
        options: [
            [
                "Uma área geográfica isolada que contém várias Zonas de Disponibilidade fisicamente separadas.",
                true,
            ],
            ["Um único data center dedicado exclusivamente a um cliente.", false],
            ["Um ponto de presença usado apenas para armazenar conteúdo em cache.", false],
            ["Um segmento de rede virtual dentro de uma nuvem privada virtual (VPC).", false],
        ],
    },
    {
        statement:
            "Uma empresa vai implantar uma nova aplicação e precisa decidir em qual Região da AWS hospedá-la. Quais fatores são relevantes para essa escolha? (Selecione DUAS opções.)",
        explanation:
            "A latência para os usuários finais e os requisitos de conformidade/residência de dados estão entre os principais critérios para escolher uma Região, junto de custo e disponibilidade do serviço. As demais opções não influenciam a escolha da Região.",
        options: [
            ["A latência percebida pelos usuários finais da aplicação.", true],
            [
                "Requisitos de conformidade e residência de dados que exijam manter os dados em determinada localidade.",
                true,
            ],
            ["A quantidade de pilares do AWS Well-Architected Framework.", false],
            ["A linguagem de programação usada para desenvolver a aplicação.", false],
            ["O número de perspectivas do AWS Cloud Adoption Framework.", false],
        ],
    },
    {
        statement:
            "Uma empresa observou que o custo por hora de um mesmo tipo de instância do Amazon EC2 difere entre a Região Norte da Virgínia e a Região São Paulo. Qual afirmação explica essa diferença?",
        explanation:
            "Os preços dos serviços da AWS podem variar de uma Região para outra, por isso o custo é um dos fatores a considerar ao escolher onde implantar cargas de trabalho. Os serviços não têm preço único global, não são gratuitos e o custo não é definido apenas pelo número de AZs.",
        options: [
            ["O preço dos serviços da AWS pode variar de uma Região para outra.", true],
            ["O preço dos serviços é idêntico em todas as Regiões da AWS.", false],
            ["As instâncias EC2 são gratuitas na Região Norte da Virgínia.", false],
            ["O custo depende apenas do número de Zonas de Disponibilidade utilizadas.", false],
        ],
    },
    {
        statement:
            "Um arquiteto deseja usar um serviço da AWS recém-lançado, mas percebe que ele ainda não aparece na Região que a empresa utiliza. O que isso indica sobre a escolha de uma Região?",
        explanation:
            "A disponibilidade de serviços varia entre Regiões, e novos serviços costumam chegar a algumas Regiões antes de outras; por isso a disponibilidade do serviço é um fator de escolha. Os serviços não estão todos em todas as Regiões, não ficam restritos à Região de lançamento nem dependem do plano de Support.",
        options: [
            [
                "Nem todos os serviços estão disponíveis em todas as Regiões, então a disponibilidade do serviço deve ser verificada ao escolher uma Região.",
                true,
            ],
            [
                "Todos os serviços da AWS estão disponíveis simultaneamente em todas as Regiões.",
                false,
            ],
            ["Um serviço só pode ser utilizado na Região onde foi lançado primeiro.", false],
            ["A disponibilidade de serviços depende do plano do AWS Support contratado.", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve melhor a finalidade das edge locations (pontos de presença) da AWS?",
        explanation:
            "As edge locations são usadas por serviços como o Amazon CloudFront para entregar conteúdo em cache próximo aos usuários finais, reduzindo a latência. Elas não hospedam cargas de trabalho de produção, não substituem uma Zona de Disponibilidade nem servem como repositório de backup.",
        options: [
            [
                "Armazenar conteúdo em cache mais perto dos usuários finais para reduzir a latência de entrega.",
                true,
            ],
            ["Executar instâncias do Amazon EC2 de longa duração para cargas de produção.", false],
            [
                "Fornecer isolamento físico equivalente ao de uma Zona de Disponibilidade para bancos de dados.",
                false,
            ],
            ["Servir como local principal de backup de longo prazo dos dados da conta.", false],
        ],
    },
    {
        statement:
            "Qual pilar do AWS Well-Architected Framework se concentra em executar e monitorar sistemas para entregar valor ao negócio e em melhorar continuamente processos e procedimentos de suporte?",
        explanation:
            "O pilar de Excelência operacional trata de executar, monitorar e aprimorar continuamente processos e operações para gerar valor de negócio. Os demais tratam de proteção (Segurança), gasto eficiente (Otimização de custos) e recuperação de falhas (Confiabilidade).",
        options: [
            ["Excelência operacional.", true],
            ["Segurança.", false],
            ["Otimização de custos.", false],
            ["Confiabilidade.", false],
        ],
    },
    {
        statement:
            "Qual pilar do AWS Well-Architected Framework aborda a proteção de informações e sistemas por meio de gerenciamento de identidades, controles de detecção e proteção de dados?",
        explanation:
            "O pilar de Segurança trata de proteger dados, sistemas e ativos usando identidade e acesso, controles de detecção e proteção de dados. Os demais focam em operações, uso eficiente de recursos de computação e impacto ambiental, respectivamente.",
        options: [
            ["Segurança.", true],
            ["Excelência operacional.", false],
            ["Eficiência de desempenho.", false],
            ["Sustentabilidade.", false],
        ],
    },
    {
        statement:
            "Uma aplicação de missão crítica precisa se recuperar automaticamente de falhas de infraestrutura e continuar atendendo à demanda dos usuários. Qual pilar do AWS Well-Architected Framework está mais diretamente relacionado a esse objetivo?",
        explanation:
            "O pilar de Confiabilidade trata da capacidade de a carga de trabalho se recuperar de falhas e continuar atendendo à demanda de forma consistente. Os demais focam em reduzir custos, aprimorar operações e usar recursos de computação de forma eficiente.",
        options: [
            ["Confiabilidade.", true],
            ["Otimização de custos.", false],
            ["Excelência operacional.", false],
            ["Eficiência de desempenho.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer evitar gastos desnecessários, entender para onde vai o dinheiro e usar apenas os recursos de que realmente precisa. Qual pilar do AWS Well-Architected Framework orienta esse objetivo?",
        explanation:
            "O pilar de Otimização de custos ajuda a evitar despesas desnecessárias e a executar sistemas entregando valor de negócio pelo menor preço. Os demais focam em recuperação de falhas, proteção de dados e melhoria de operações.",
        options: [
            ["Otimização de custos.", true],
            ["Confiabilidade.", false],
            ["Segurança.", false],
            ["Excelência operacional.", false],
        ],
    },
    {
        statement:
            "Qual pilar do AWS Well-Architected Framework tem como foco minimizar os impactos ambientais da execução de cargas de trabalho na nuvem?",
        explanation:
            "O pilar de Sustentabilidade orienta a reduzir o impacto ambiental, por exemplo maximizando a utilização dos recursos e escolhendo opções mais eficientes. Os demais tratam de recuperação de falhas, uso eficiente de computação e melhoria de operações.",
        options: [
            ["Sustentabilidade.", true],
            ["Confiabilidade.", false],
            ["Eficiência de desempenho.", false],
            ["Excelência operacional.", false],
        ],
    },
    {
        statement:
            "Qual recurso da AWS permite revisar cargas de trabalho de forma consistente em relação às boas práticas dos pilares e identificar oportunidades de melhoria, sem custo adicional?",
        explanation:
            "O AWS Well-Architected Tool, disponível no Console de Gerenciamento, avalia cargas de trabalho em relação aos pilares do framework e gera recomendações de melhoria sem custo. O Trusted Advisor foca em verificações da conta, o Amazon Inspector avalia vulnerabilidades e o AWS Config controla conformidade de configurações.",
        options: [
            ["AWS Well-Architected Tool.", true],
            ["AWS Trusted Advisor.", false],
            ["Amazon Inspector.", false],
            ["AWS Config.", false],
        ],
    },
    {
        statement:
            "Qual princípio de design de arquitetura na nuvem recomenda substituir tarefas manuais e repetitivas por processos automatizados, aumentando a consistência e reduzindo erros humanos?",
        explanation:
            "A automação é um princípio de design da nuvem que reduz erros humanos e melhora a consistência ao automatizar implantações e operações repetitivas. As demais opções descrevem práticas manuais ou frágeis, contrárias às boas práticas.",
        options: [
            ["Automação.", true],
            ["Provisionamento manual de cada recurso individualmente.", false],
            ["Aumento contínuo do tamanho de um único servidor.", false],
            ["Concentração de toda a aplicação em um único ponto de falha.", false],
        ],
    },
    {
        statement:
            "Ao arquitetar aplicações resilientes na Nuvem AWS, quais práticas refletem princípios de design recomendados? (Selecione DUAS opções.)",
        explanation:
            "Projetar presumindo falhas (design for failure) e escalar horizontalmente com redundância aumentam a resiliência e a disponibilidade. Acoplamento forte, superprovisionamento fixo e um único servidor criam pontos únicos de falha e desperdício, contrariando as boas práticas.",
        options: [
            [
                "Projetar presumindo que componentes irão falhar e construir tolerância a falhas (design for failure).",
                true,
            ],
            [
                "Escalar horizontalmente, adicionando mais recursos, em vez de depender do aumento de um único recurso.",
                true,
            ],
            [
                "Manter todos os componentes fortemente acoplados para simplificar a comunicação.",
                false,
            ],
            [
                "Provisionar permanentemente a capacidade máxima estimada para nunca precisar ajustar.",
                false,
            ],
            [
                "Concentrar toda a aplicação em um único servidor para reduzir a complexidade.",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são perspectivas do AWS Cloud Adoption Framework (CAF)? (Selecione DUAS opções.)",
        explanation:
            "As seis perspectivas do CAF são Negócios, Pessoas, Governança, Plataforma, Segurança e Operações. Confiabilidade e Sustentabilidade são pilares do Well-Architected Framework, e elasticidade é um conceito de nuvem, não perspectivas do CAF.",
        options: [
            ["Negócios (Business).", true],
            ["Plataforma (Platform).", true],
            ["Confiabilidade.", false],
            ["Sustentabilidade.", false],
            ["Elasticidade.", false],
        ],
    },
    {
        statement:
            "Qual perspectiva do AWS Cloud Adoption Framework (CAF) ajuda a garantir que os investimentos em nuvem acelerem os resultados de negócio e a transformação digital, envolvendo stakeholders como executivos e áreas financeiras?",
        explanation:
            "A perspectiva de Negócios foca em alinhar os investimentos em nuvem aos resultados de negócio e à transformação digital. Plataforma trata da engenharia da plataforma, Segurança da proteção de dados e Operações da entrega e continuidade dos serviços.",
        options: [
            ["Perspectiva de Negócios (Business).", true],
            ["Perspectiva de Plataforma (Platform).", false],
            ["Perspectiva de Segurança (Security).", false],
            ["Perspectiva de Operações (Operations).", false],
        ],
    },
    {
        statement:
            "Qual perspectiva do AWS Cloud Adoption Framework (CAF) atua como ponte entre tecnologia e negócio, apoiando a evolução da cultura organizacional, a estrutura das equipes, a liderança e o desenvolvimento de talentos?",
        explanation:
            "A perspectiva de Pessoas conecta tecnologia e negócio, cuidando de cultura, estrutura organizacional, liderança e talentos. Governança trata de gestão de riscos e portfólio, Plataforma da arquitetura técnica e Segurança da proteção de ativos.",
        options: [
            ["Perspectiva de Pessoas (People).", true],
            ["Perspectiva de Governança (Governance).", false],
            ["Perspectiva de Plataforma (Platform).", false],
            ["Perspectiva de Segurança (Security).", false],
        ],
    },
    {
        statement:
            "Uma empresa executa uma aplicação de processamento em lote com uso intensivo de CPU, incluindo transcodificação de mídia e servidores de jogos dedicados. Qual família de instâncias do Amazon EC2 é a MAIS adequada para essa carga de trabalho?",
        explanation:
            "As instâncias otimizadas para computação (família C) oferecem alta capacidade de processamento por vCPU, ideais para cargas com uso intensivo de CPU, como transcodificação e servidores de jogos. As de memória (R) servem a bancos em memória, as de armazenamento (I) a alto IOPS local e as aceleradas (P) usam GPU para machine learning.",
        options: [
            ["Instâncias otimizadas para computação (família C)", true],
            ["Instâncias otimizadas para memória (família R)", false],
            ["Instâncias otimizadas para armazenamento (família I)", false],
            ["Instâncias de computação acelerada com GPU (família P)", false],
        ],
    },
    {
        statement:
            "Um site de baixo tráfego e ambientes de desenvolvimento apresentam uso de CPU baixo na maior parte do tempo, com picos ocasionais. Qual tipo de instância do Amazon EC2 oferece o melhor custo-benefício, fornecendo desempenho de linha de base e capacidade de picos (burst)?",
        explanation:
            "As instâncias burstable de uso geral (família T) fornecem desempenho de CPU de linha de base e acumulam créditos para picos ocasionais, sendo econômicas para cargas de baixa utilização. As demais são especializadas em CPU, memória ou GPU e mais caras para esse perfil.",
        options: [
            ["Instâncias burstable de uso geral (família T)", true],
            ["Instâncias otimizadas para computação (família C)", false],
            ["Instâncias otimizadas para memória (família X)", false],
            ["Instâncias de computação acelerada (família G)", false],
        ],
    },
    {
        statement:
            "Um administrador quer um modelo pré-configurado contendo o sistema operacional, o servidor de aplicação e as configurações necessárias para lançar rapidamente várias instâncias idênticas do Amazon EC2. Qual recurso da AWS fornece esse modelo?",
        explanation:
            "A Amazon Machine Image (AMI) contém o sistema operacional, as aplicações e as configurações necessárias para lançar instâncias EC2, permitindo replicar instâncias idênticas. Um snapshot do EBS guarda apenas os dados de um volume, o security group é um firewall virtual e a Instância Reservada é um modelo de compra.",
        options: [
            ["Amazon Machine Image (AMI)", true],
            ["Um snapshot do Amazon Elastic Block Store (EBS)", false],
            ["Um grupo de segurança (security group)", false],
            ["Uma Instância Reservada (Reserved Instance)", false],
        ],
    },
    {
        statement:
            "Uma startup vai lançar uma aplicação nova com demanda imprevisível e deseja pagar pela capacidade de computação por hora ou por segundo, sem compromisso de longo prazo nem pagamento antecipado, podendo encerrar as instâncias a qualquer momento. Qual modelo de compra do Amazon EC2 atende a esses requisitos?",
        explanation:
            "O modelo On-Demand cobra pela capacidade por hora ou por segundo, sem compromisso nem pagamento antecipado, sendo ideal para cargas novas e imprevisíveis. Instâncias Reservadas e Savings Plans exigem compromisso de 1 ou 3 anos, e Dedicated Hosts destinam-se a isolamento físico e licenciamento.",
        options: [
            ["On-Demand (sob demanda)", true],
            ["Instâncias Reservadas Standard de 3 anos", false],
            ["Compute Savings Plans de 1 ano", false],
            ["Dedicated Hosts", false],
        ],
    },
    {
        statement:
            'Uma empresa precisa reutilizar licenças de software vinculadas a soquetes e núcleos físicos do servidor (modelo "traga sua própria licença") e exige visibilidade sobre o hardware físico subjacente para atender a requisitos de conformidade. Qual opção de compra do Amazon EC2 atende MELHOR a esse requisito?',
        explanation:
            "Os Dedicated Hosts fornecem um servidor físico dedicado com visibilidade de soquetes e núcleos, permitindo usar licenças por soquete/núcleo (BYOL) e atender à conformidade. Spot e On-Demand em locação compartilhada usam hardware compartilhado, e Savings Plans trata apenas de preço, sem essa visibilidade.",
        options: [
            ["Amazon EC2 Dedicated Hosts", true],
            ["Instâncias Spot", false],
            ["Instâncias On-Demand em locação compartilhada", false],
            ["Compute Savings Plans", false],
        ],
    },
    {
        statement:
            "Uma empresa quer reduzir custos de computação assumindo um compromisso de uso de 1 ou 3 anos, mas precisa de flexibilidade para mudar a família de instância, o tamanho, o sistema operacional e a região ao longo do tempo, além de aplicar o desconto também ao AWS Fargate e ao AWS Lambda. Qual opção de preço é a MAIS adequada?",
        explanation:
            "Os Compute Savings Plans concedem desconto por um compromisso de gasto (1 ou 3 anos) com máxima flexibilidade, aplicando-se automaticamente a qualquer família, tamanho, SO e região, além do Fargate e do Lambda. Instâncias Reservadas Standard são menos flexíveis, Spot não envolve compromisso e Dedicated Hosts tratam de isolamento e licenciamento.",
        options: [
            ["Compute Savings Plans", true],
            ["Instâncias Reservadas Standard (Standard Reserved Instances)", false],
            ["Instâncias Spot", false],
            ["Dedicated Hosts", false],
        ],
    },
    {
        statement:
            "Uma aplicação usa o AWS Lambda para processar imagens apenas quando um arquivo é enviado, o que ocorre de forma esporádica ao longo do dia. Como a AWS cobra por esse uso do Lambda?",
        explanation:
            "O AWS Lambda cobra pelo número de solicitações e pela duração da execução (GB-segundo), sem custo quando o código não está sendo executado. Não há taxa por tempo ocioso, capacidade provisionada fixa nem instâncias EC2, pois é um serviço totalmente gerenciado e sem servidor.",
        options: [
            [
                "Pelo número de solicitações e pelo tempo de computação (duração) consumido, sem cobrança quando o código não está em execução",
                true,
            ],
            ["Uma taxa horária fixa enquanto a função estiver implantada, mesmo ociosa", false],
            [
                "Por uma quantidade de vCPU e memória provisionada mensalmente, independentemente do uso",
                false,
            ],
            [
                "Pelo número de instâncias Amazon EC2 que a função mantém em execução continuamente",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer executar suas aplicações em contêineres na AWS sem precisar provisionar, corrigir ou gerenciar os servidores (instâncias EC2) subjacentes. Qual mecanismo de computação atende a esse objetivo, funcionando com o Amazon ECS e o Amazon EKS?",
        explanation:
            "O AWS Fargate é um mecanismo de computação sem servidor para contêineres que funciona com o Amazon ECS e o Amazon EKS, eliminando a necessidade de gerenciar servidores. As demais opções exigem provisionar e gerenciar instâncias EC2 ou não executam contêineres.",
        options: [
            ["AWS Fargate", true],
            ["Amazon EC2 no tipo de lançamento (launch type) de instância", false],
            ["AWS Elastic Beanstalk", false],
            ["Amazon EC2 Auto Scaling", false],
        ],
    },
    {
        statement:
            "Uma equipe de DevOps já executa cargas de trabalho no Kubernetes em seu data center e deseja movê-las para a AWS usando um serviço gerenciado compatível com o Kubernetes de código aberto. Qual serviço da AWS deve utilizar?",
        explanation:
            "O Amazon EKS é um serviço gerenciado que executa o Kubernetes de código aberto na AWS, ideal para quem já usa Kubernetes. O ECR apenas armazena imagens de contêiner, o Elastic Beanstalk orquestra aplicações web e o Lightsail oferece servidores virtuais simplificados.",
        options: [
            ["Amazon Elastic Kubernetes Service (EKS)", true],
            ["Amazon Elastic Container Registry (ECR)", false],
            ["AWS Elastic Beanstalk", false],
            ["Amazon Lightsail", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor quer apenas enviar o código de uma aplicação web e deixar a AWS provisionar automaticamente a capacidade, o balanceamento de carga, o Auto Scaling e o monitoramento de integridade, sem custo adicional além dos recursos utilizados e mantendo acesso e controle total sobre esses recursos. Qual serviço atende MELHOR a esse cenário?",
        explanation:
            "O AWS Elastic Beanstalk implanta e gerencia automaticamente capacidade, balanceamento de carga, Auto Scaling e monitoramento a partir do código enviado, sem custo adicional além dos recursos usados, e mantém o controle total sobre eles. Lambda é orientado a eventos e sem servidor, Lightsail é um servidor virtual simplificado e Batch destina-se a processamento em lote.",
        options: [
            ["AWS Elastic Beanstalk", true],
            ["AWS Lambda", false],
            ["Amazon Lightsail", false],
            ["AWS Batch", false],
        ],
    },
    {
        statement:
            "O proprietário de uma pequena empresa, com pouca experiência em nuvem, quer lançar um site WordPress simples usando um servidor virtual pré-configurado com um preço mensal previsível e agrupado. Qual serviço da AWS é o MAIS adequado?",
        explanation:
            "O Amazon Lightsail oferece servidores virtuais pré-configurados (incluindo modelos prontos como WordPress) com preço mensal previsível e agrupado, ideal para iniciantes e projetos simples. As outras opções exigem mais conhecimento e não têm esse preço mensal empacotado.",
        options: [
            ["Amazon Lightsail", true],
            ["Amazon EC2 com Instâncias Spot", false],
            ["AWS Batch", false],
            ["Amazon Elastic Kubernetes Service (EKS)", false],
        ],
    },
    {
        statement:
            "Uma empresa de pesquisa precisa executar centenas de milhares de tarefas de computação em lote, com a AWS provisionando dinamicamente a quantidade e o tipo ideais de recursos de computação conforme o volume e os requisitos das tarefas. Qual serviço da AWS é projetado especificamente para isso?",
        explanation:
            "O AWS Batch planeja, agenda e executa cargas de trabalho de computação em lote, provisionando dinamicamente os recursos (incluindo instâncias EC2 e Spot) conforme o volume das tarefas. As demais opções destinam-se a servidores simplificados, aplicações web e distribuição de tráfego.",
        options: [
            ["AWS Batch", true],
            ["Amazon Lightsail", false],
            ["AWS Elastic Beanstalk", false],
            ["Elastic Load Balancing", false],
        ],
    },
    {
        statement:
            "Além de ajustar a capacidade conforme a demanda, qual benefício o Amazon EC2 Auto Scaling oferece ao monitorar a integridade das instâncias de um grupo?",
        explanation:
            "O EC2 Auto Scaling executa verificações de integridade e substitui automaticamente instâncias não íntegras para manter a capacidade desejada, aumentando a disponibilidade e a tolerância a falhas. As demais opções descrevem criptografia (EBS/KMS), rede de entrega de conteúdo (CloudFront) e firewall de aplicação (AWS WAF).",
        options: [
            [
                "Melhora a disponibilidade da aplicação substituindo automaticamente instâncias não íntegras por novas instâncias íntegras para manter a capacidade desejada",
                true,
            ],
            [
                "Criptografa automaticamente todos os dados em repouso nos volumes do Amazon EBS",
                false,
            ],
            [
                "Distribui o conteúdo estático em locais de borda para reduzir a latência global",
                false,
            ],
            ["Fornece um firewall de aplicação web (WAF) gerenciado para as instâncias", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são serviços de computação sem servidor (serverless), nos quais você não provisiona nem gerencia os servidores subjacentes? (Selecione DUAS opções.)",
        explanation:
            "O AWS Lambda (funções sem servidor) e o AWS Fargate (contêineres sem servidor) não exigem provisionar ou gerenciar servidores. O Amazon EC2 e o Amazon Lightsail fornecem servidores virtuais gerenciados por você, e o EC2 Auto Scaling apenas ajusta a quantidade de instâncias EC2 existentes.",
        options: [
            ["AWS Lambda", true],
            ["AWS Fargate", true],
            ["Amazon EC2", false],
            ["Amazon Lightsail", false],
            ["Amazon EC2 Auto Scaling", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre os modelos de compra do Amazon EC2 estão corretas? (Selecione DUAS opções.)",
        explanation:
            "As Instâncias Spot usam capacidade ociosa com grandes descontos e podem ser recuperadas com aviso de 2 minutos, sendo ideais para cargas tolerantes a falhas; as Instâncias Reservadas dão desconto por um compromisso de 1 ou 3 anos. On-Demand não exige pagamento antecipado, Spot não serve a bancos de produção sempre disponíveis e Spot (não Dedicated Hosts) é a opção econômica para cargas interrompíveis.",
        options: [
            [
                "As Instâncias Spot são adequadas para cargas de trabalho tolerantes a falhas, pois a AWS pode recuperá-las com um aviso de dois minutos, em troca de descontos elevados",
                true,
            ],
            [
                "As Instâncias Reservadas oferecem desconto em relação ao On-Demand em troca de um compromisso de uso de 1 ou 3 anos",
                true,
            ],
            ["As Instâncias On-Demand exigem um pagamento adiantado obrigatório de 3 anos", false],
            [
                "As Instâncias Spot são recomendadas para bancos de dados de produção que exigem disponibilidade contínua",
                false,
            ],
            [
                "Os Dedicated Hosts são sempre a opção mais barata para cargas de trabalho interrompíveis",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais afirmações sobre o Elastic Load Balancing (ELB) estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Application Load Balancer atua na camada 7 (HTTP/HTTPS) e roteia por conteúdo, como o caminho da URL, enquanto o Network Load Balancer atua na camada 4 (TCP/UDP) com latência ultrabaixa. O ELB distribui tráfego entre várias Zonas de Disponibilidade, é totalmente gerenciado (sem software para instalar) e o ALB inspeciona sim os cabeçalhos HTTP.",
        options: [
            [
                "O Application Load Balancer (ALB) atua na camada de aplicação (camada 7) e roteia o tráfego HTTP/HTTPS com base no conteúdo da solicitação, como o caminho da URL",
                true,
            ],
            [
                "O Network Load Balancer (NLB) atua na camada de transporte (camada 4) para tráfego TCP/UDP com latência ultrabaixa e altíssima taxa de transferência",
                true,
            ],
            [
                "O Elastic Load Balancing só consegue distribuir tráfego para instâncias em uma única Zona de Disponibilidade",
                false,
            ],
            [
                "O Application Load Balancer opera na camada 4 e não consegue inspecionar cabeçalhos HTTP",
                false,
            ],
            [
                "O Elastic Load Balancing exige que o cliente instale e gerencie manualmente o software de balanceamento em cada instância EC2",
                false,
            ],
        ],
    },
    {
        statement:
            "O Amazon S3 Standard foi projetado para qual nível de durabilidade dos objetos armazenados?",
        explanation:
            "O Amazon S3 foi projetado para 99,999999999% (onze noves) de durabilidade, replicando cada objeto de forma redundante em vários dispositivos e Zonas de Disponibilidade. Os demais valores são baixos demais e correspondem a metas de disponibilidade, não de durabilidade.",
        options: [
            ["99,9% (três noves)", false],
            ["99,99% (quatro noves)", false],
            ["99,999999999% (onze noves)", true],
            ["99,5%", false],
        ],
    },
    {
        statement:
            "Qual classe de armazenamento do Amazon S3 mantém os dados em uma ÚNICA Zona de Disponibilidade, sendo indicada para dados de acesso pouco frequente que podem ser recriados facilmente caso sejam perdidos?",
        explanation:
            "A S3 One Zone-IA guarda os dados em apenas uma Zona de Disponibilidade e custa menos que a Standard-IA, sendo ideal para dados pouco acessados e facilmente recriáveis. Standard e Standard-IA usam múltiplas AZs, e a Glacier Deep Archive é voltada a arquivamento de longo prazo.",
        options: [
            ["S3 Standard", false],
            ["S3 One Zone-IA", true],
            ["S3 Standard-IA", false],
            ["S3 Glacier Deep Archive", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa arquivar registros regulatórios por 10 anos. O acesso é raríssimo e a empresa aceita um tempo de recuperação de até 12 horas. Qual classe do Amazon S3 oferece o MENOR custo de armazenamento?",
        explanation:
            "A S3 Glacier Deep Archive é a classe de menor custo, projetada para retenção de longo prazo com acesso muito raro e recuperação padrão em até 12 horas. As demais têm custo de armazenamento maior por priorizarem recuperação mais rápida.",
        options: [
            ["S3 Glacier Instant Retrieval", false],
            ["S3 Standard-IA", false],
            ["S3 Glacier Deep Archive", true],
            ["S3 Intelligent-Tiering", false],
        ],
    },
    {
        statement:
            "Uma clínica mantém imagens médicas de arquivo acessadas cerca de uma vez por trimestre, mas que, quando necessárias, exigem recuperação em milissegundos. Qual classe do Amazon S3 é a mais adequada?",
        explanation:
            "A S3 Glacier Instant Retrieval oferece o menor custo de armazenamento entre as opções com acesso imediato (milissegundos), ideal para dados de arquivo acessados poucas vezes ao ano. Deep Archive e Flexible Retrieval recuperam em horas ou minutos, e One Zone-IA não é uma classe de arquivamento.",
        options: [
            ["S3 Glacier Deep Archive", false],
            ["S3 Glacier Flexible Retrieval", false],
            ["S3 Glacier Instant Retrieval", true],
            ["S3 One Zone-IA", false],
        ],
    },
    {
        statement:
            "O que uma política de ciclo de vida (lifecycle) de um bucket do Amazon S3 permite automatizar?",
        explanation:
            "As regras de ciclo de vida movem automaticamente os objetos para classes mais baratas (por exemplo, de Standard para Glacier) e/ou os expiram após um prazo definido, otimizando custos. Criptografia, replicação e cache em edge locations são funções de outros mecanismos (SSE, replicação e CloudFront).",
        options: [
            ["A replicação síncrona dos objetos para outra conta AWS", false],
            [
                "A transição de objetos para classes de menor custo e sua exclusão (expiração) após um período definido",
                true,
            ],
            ["A criptografia dos objetos com chaves gerenciadas pelo cliente", false],
            ["A distribuição em cache dos objetos em edge locations", false],
        ],
    },
    {
        statement:
            "Uma empresa tem arquivos de backup acessados apenas algumas vezes por mês, mas que exigem acesso rápido e alta disponibilidade em várias Zonas de Disponibilidade quando solicitados. Qual classe do Amazon S3 equilibra menor custo de armazenamento com esses requisitos?",
        explanation:
            "A S3 Standard-IA reduz o custo de armazenamento para dados de acesso pouco frequente, mantendo acesso em milissegundos e redundância em múltiplas AZs. A Standard é para acesso frequente, a One Zone-IA usa uma única AZ e a Glacier é voltada a arquivamento.",
        options: [
            ["S3 Standard", false],
            ["S3 Standard-IA", true],
            ["S3 One Zone-IA", false],
            ["S3 Glacier Flexible Retrieval", false],
        ],
    },
    {
        statement:
            "Quais são benefícios de habilitar o versionamento em um bucket do Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "O versionamento mantém várias versões de um mesmo objeto, permitindo recuperar itens excluídos por engano e restaurar versões sobrescritas. Ele tende a aumentar o custo (mais versões armazenadas), não altera a durabilidade projetada e não influencia a latência de entrega.",
        options: [
            ["Recuperar objetos que foram excluídos acidentalmente", true],
            ["Preservar e restaurar versões anteriores de um objeto que foi sobrescrito", true],
            ["Reduzir automaticamente o custo total de armazenamento", false],
            ["Aumentar a durabilidade dos objetos além de onze noves", false],
            ["Entregar o conteúdo com menor latência para usuários globais", false],
        ],
    },
    {
        statement:
            "Um banco de dados relacional crítico exige o desempenho de IOPS mais alto e consistente possível. Qual tipo de volume do Amazon EBS é o mais adequado?",
        explanation:
            "Os volumes SSD de IOPS provisionadas (io1/io2) são projetados para cargas com uso intenso de I/O e IOPS altas e consistentes, como bancos de dados críticos. Os volumes HDD (st1 e sc1) priorizam throughput e custo, e o gp3 é de uso geral, com teto de IOPS menor.",
        options: [
            ["HDD otimizado para throughput (st1)", false],
            ["SSD de uso geral (gp3)", false],
            ["SSD de IOPS provisionadas (io1/io2)", true],
            ["HDD frio (sc1)", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre snapshots do Amazon EBS estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Os snapshots do EBS são backups incrementais armazenados no Amazon S3 gerenciado pela AWS e podem originar novos volumes em outra Zona de Disponibilidade ou até em outra Região. Eles não usam o instance store, não exigem encerrar a instância e não ficam presos à instância de origem.",
        options: [
            ["São armazenados de forma incremental no Amazon S3", true],
            ["Podem ser usados para criar um novo volume em outra Zona de Disponibilidade", true],
            ["São gravados no armazenamento de instância (instance store) da EC2", false],
            ["Exigem que a instância EC2 seja encerrada (terminated) para serem criados", false],
            ["Só podem ser restaurados na mesma instância que os originou", false],
        ],
    },
    {
        statement:
            "Várias instâncias EC2 Linux, distribuídas em diferentes Zonas de Disponibilidade, precisam ler e gravar simultaneamente no MESMO sistema de arquivos compartilhado, que deve crescer e diminuir automaticamente conforme os dados. Qual serviço atende a esse requisito?",
        explanation:
            "O Amazon EFS é um sistema de arquivos elástico (NFS) que escala automaticamente e pode ser montado por muitas instâncias Linux ao mesmo tempo, em várias AZs. Um volume EBS se anexa a uma instância por vez, o instance store é efêmero e local, e o Glacier é para arquivamento de objetos.",
        options: [
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["Amazon Elastic File System (Amazon EFS)", true],
            ["Armazenamento de instância (instance store)", false],
            ["Amazon S3 Glacier", false],
        ],
    },
    {
        statement:
            "Uma aplicação corporativa baseada em Windows precisa de um sistema de arquivos totalmente gerenciado compatível com o protocolo SMB e integrado ao Active Directory. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon FSx for Windows File Server oferece armazenamento de arquivos nativo do Windows, com protocolo SMB e integração ao Active Directory. O EFS usa NFS (Linux), o S3 é armazenamento de objetos e o EBS é armazenamento em bloco anexado a uma instância.",
        options: [
            ["Amazon Elastic File System (Amazon EFS)", false],
            ["Amazon S3", false],
            ["Amazon FSx for Windows File Server", true],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer aposentar sua infraestrutura física de fitas de backup, mas continuar usando o software de backup atual e armazenar os backups na nuvem AWS. Qual solução é a mais adequada?",
        explanation:
            "O Tape Gateway do AWS Storage Gateway apresenta uma biblioteca de fitas virtuais ao software de backup existente e guarda os dados no Amazon S3/Glacier, substituindo as fitas físicas. Snowmobile é transferência em escala de exabytes, FSx for Lustre é para HPC e o Transfer Acceleration apenas acelera uploads ao S3.",
        options: [
            ["AWS Snowmobile", false],
            ["AWS Storage Gateway (Tape Gateway)", true],
            ["Amazon FSx for Lustre", false],
            ["Amazon S3 Transfer Acceleration", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve melhor a família de dispositivos AWS Snow (por exemplo, o AWS Snowball Edge)?",
        explanation:
            "A família Snow são dispositivos físicos e resistentes enviados ao cliente para transferir grandes volumes de dados de forma offline e executar computação de borda onde a rede é limitada ou inexistente. As demais opções descrevem, respectivamente, o Amazon RDS, o Amazon CloudFront e o Elastic Load Balancing.",
        options: [
            ["Um serviço totalmente gerenciado de banco de dados relacional", false],
            [
                "Dispositivos físicos e resistentes para migrar grandes volumes de dados para a AWS e executar computação de borda em locais com conectividade de rede limitada ou inexistente",
                true,
            ],
            ["Uma rede global de entrega de conteúdo (CDN)", false],
            ["Um serviço de balanceamento de carga para instâncias Amazon EC2", false],
        ],
    },
    {
        statement:
            "Uma empresa quer centralizar, automatizar e aplicar políticas de backup para vários serviços AWS (como Amazon EBS, Amazon RDS e Amazon EFS) a partir de um único painel. Qual serviço deve utilizar?",
        explanation:
            "O AWS Backup centraliza e automatiza a criação, a retenção e a governança de backups de diversos serviços (EBS, RDS, EFS, DynamoDB, entre outros) em um só lugar. O Storage Gateway é armazenamento híbrido, snapshots manuais não são centralizados e o AWS Config avalia a conformidade de configurações, sem fazer backups.",
        options: [
            ["AWS Storage Gateway", false],
            ["AWS Backup", true],
            ["Snapshots manuais criados individualmente em cada serviço", false],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Uma empresa executa um banco de dados relacional no Amazon RDS e precisa de alta disponibilidade com failover automático para uma instância em espera (standby) em outra Zona de Disponibilidade. Qual recurso do Amazon RDS atende a esse requisito?",
        explanation:
            "A implantação Multi-AZ mantém uma réplica síncrona em espera em outra Zona de Disponibilidade e faz o failover automaticamente em caso de falha. A réplica de leitura serve para escalar leituras (a promoção é manual), o snapshot é backup e o RDS Proxy apenas gerencia pools de conexões.",
        options: [
            ["Réplica de leitura (Read Replica) do Amazon RDS", false],
            ["Implantação Multi-AZ do Amazon RDS", true],
            ["Snapshot manual do banco de dados", false],
            ["Amazon RDS Proxy", false],
        ],
    },
    {
        statement:
            "Qual banco de dados relacional totalmente gerenciado da AWS é compatível com MySQL e PostgreSQL e foi projetado para oferecer desempenho superior e replicação automática dos dados entre várias Zonas de Disponibilidade?",
        explanation:
            "O Amazon Aurora é compatível com MySQL e PostgreSQL, oferece desempenho superior ao dos bancos tradicionais e replica os dados automaticamente entre várias AZs. DynamoDB é NoSQL, Redshift é data warehouse e Neptune é banco de grafos.",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon Aurora", true],
            ["Amazon Redshift", false],
            ["Amazon Neptune", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa executar consultas analíticas complexas sobre petabytes de dados históricos para gerar relatórios de business intelligence (BI). Qual serviço da AWS é um data warehouse projetado para essa finalidade?",
        explanation:
            "O Amazon Redshift é o data warehouse gerenciado da AWS, otimizado para consultas analíticas (OLAP) em grandes volumes e integração com ferramentas de BI. RDS e DynamoDB são voltados a cargas transacionais e o ElastiCache é um cache em memória.",
        options: [
            ["Amazon Redshift", true],
            ["Amazon RDS", false],
            ["Amazon ElastiCache", false],
            ["Amazon DynamoDB", false],
        ],
    },
    {
        statement:
            "Uma aplicação web repete com frequência as mesmas consultas de leitura ao banco de dados, aumentando a latência e a carga do banco. Qual serviço da AWS oferece um cache em memória (compatível com Redis ou Memcached) para melhorar o desempenho das leituras?",
        explanation:
            "O Amazon ElastiCache é um cache em memória compatível com Redis e Memcached, que reduz a latência e a carga do banco ao servir dados acessados com frequência. RDS, Redshift e DynamoDB não são serviços de cache em memória.",
        options: [
            ["Amazon RDS", false],
            ["Amazon Redshift", false],
            ["Amazon ElastiCache", true],
            ["Amazon DynamoDB", false],
        ],
    },
    {
        statement:
            "Uma empresa deseja migrar uma aplicação que usa o MongoDB para um serviço de banco de dados de documentos totalmente gerenciado e compatível com o MongoDB. Qual serviço da AWS deve escolher?",
        explanation:
            "O Amazon DocumentDB é um banco de documentos gerenciado e compatível com o MongoDB, ideal para migrar cargas de trabalho MongoDB. DynamoDB é chave-valor, Aurora é relacional e Keyspaces é compatível com o Apache Cassandra.",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon Aurora", false],
            ["Amazon DocumentDB (compatível com MongoDB)", true],
            ["Amazon Keyspaces (para Apache Cassandra)", false],
        ],
    },
    {
        statement:
            "Uma aplicação precisa armazenar e consultar dados altamente conectados, como os relacionamentos de uma rede social e um mecanismo de recomendação. Qual banco de dados gerenciado da AWS é otimizado para esse tipo de carga?",
        explanation:
            "O Amazon Neptune é um banco de dados de grafos gerenciado, indicado para dados altamente conectados como redes sociais, recomendações e detecção de fraudes. DynamoDB é chave-valor, RDS é relacional e Redshift é data warehouse.",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon Neptune", true],
            ["Amazon RDS", false],
            ["Amazon Redshift", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de um banco de dados em memória compatível com Redis que ofereça durabilidade (persistência) dos dados para ser usado como banco de dados primário, e não apenas como cache. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon MemoryDB é um banco de dados em memória durável e compatível com Redis, adequado como banco de dados primário com persistência. O ElastiCache é voltado a cache (não à persistência como banco primário) e RDS e Redshift não são bancos em memória.",
        options: [
            ["Amazon ElastiCache for Redis", false],
            ["Amazon MemoryDB", true],
            ["Amazon RDS for PostgreSQL", false],
            ["Amazon Redshift", false],
        ],
    },
    {
        statement:
            "Uma empresa usa o Apache Cassandra em seu data center e quer executar essas cargas na AWS sem gerenciar servidores, mantendo a compatibilidade com o Cassandra. Qual serviço deve utilizar?",
        explanation:
            "O Amazon Keyspaces é um serviço gerenciado e sem servidor compatível com o Apache Cassandra (CQL), permitindo executar cargas Cassandra sem administrar a infraestrutura. DynamoDB (chave-valor), DocumentDB (MongoDB) e Aurora (relacional) não são compatíveis com o Cassandra.",
        options: [
            ["Amazon Keyspaces (para Apache Cassandra)", true],
            ["Amazon DynamoDB", false],
            ["Amazon DocumentDB", false],
            ["Amazon Aurora", false],
        ],
    },
    {
        statement:
            "Uma empresa quer migrar seus bancos de dados on-premises para a AWS com o mínimo de tempo de inatividade, mantendo o banco de origem em operação durante a migração. Qual serviço da AWS deve ser utilizado?",
        explanation:
            "O AWS Database Migration Service (DMS) migra bancos de dados para a AWS com mínimo tempo de inatividade, mantendo a origem em operação e suportando migrações homogêneas e heterogêneas. O RDS é um possível destino, o Snowball transfere dados em massa off-line e o CloudWatch faz monitoramento.",
        options: [
            ["AWS Database Migration Service (AWS DMS)", true],
            ["Amazon RDS", false],
            ["AWS Snowball", false],
            ["Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Quais afirmações descrevem corretamente o Amazon DynamoDB? (Selecione DUAS opções.)",
        explanation:
            "O DynamoDB é um banco de dados NoSQL de chave-valor totalmente gerenciado e sem servidor, com latência de milissegundos de um dígito em qualquer escala. Ele não é relacional, não exige gerenciar instâncias EC2 e não é um data warehouse (isso é o Redshift).",
        options: [
            [
                "É um banco de dados NoSQL sem servidor (serverless), sem infraestrutura para provisionar ou gerenciar",
                true,
            ],
            [
                "Oferece desempenho com latência de milissegundos de um dígito em qualquer escala",
                true,
            ],
            [
                "É um banco de dados relacional otimizado para consultas SQL com JOINs complexos",
                false,
            ],
            ["Exige que o cliente provisione e aplique patches em instâncias Amazon EC2", false],
            ["É um data warehouse para análises de business intelligence em petabytes", false],
        ],
    },
    {
        statement:
            "Quais dos serviços a seguir são bancos de dados relacionais gerenciados da AWS? (Selecione DUAS opções.)",
        explanation:
            "O Amazon RDS e o Amazon Aurora são serviços de banco de dados relacional gerenciados. DynamoDB é NoSQL, ElastiCache é cache em memória e Neptune é banco de grafos.",
        options: [
            ["Amazon RDS", true],
            ["Amazon Aurora", true],
            ["Amazon DynamoDB", false],
            ["Amazon ElastiCache", false],
            ["Amazon Neptune", false],
        ],
    },
    {
        statement:
            "Uma empresa quer reduzir o esforço operacional de administrar bancos de dados. Qual é uma vantagem de usar o Amazon RDS (banco de dados gerenciado) em vez de instalar e operar o banco em uma instância Amazon EC2 gerenciada pela própria empresa?",
        explanation:
            "Com um banco gerenciado como o Amazon RDS, a AWS assume tarefas operacionais como aplicação de patches, backups automáticos e failover, reduzindo o esforço de administração. O serviço não é gratuito, a modelagem de dados e as consultas continuam sendo do cliente e o hardware físico é sempre responsabilidade da AWS.",
        options: [
            [
                "A AWS assume tarefas operacionais como aplicação de patches, backups automáticos e failover",
                true,
            ],
            ["O uso do banco de dados passa a ser totalmente gratuito", false],
            [
                "A empresa deixa de precisar modelar os dados e escrever as consultas da aplicação",
                false,
            ],
            [
                "A empresa passa a ser responsável por manter o hardware físico dos servidores",
                false,
            ],
        ],
    },
    {
        statement: "O que caracteriza uma sub-rede como pública dentro de uma Amazon VPC?",
        explanation:
            "Uma sub-rede é considerada pública quando sua tabela de rotas tem uma rota direcionando o tráfego para um Internet Gateway, permitindo comunicação com a internet. Usar apenas IPs privados ou associar um NAT Gateway não torna a sub-rede pública, e uma Network ACL restritiva não define o tipo da sub-rede.",
        options: [
            ["A sub-rede utiliza apenas endereços IP privados da faixa 10.0.0.0/8.", false],
            ["A sub-rede está associada a um NAT Gateway.", false],
            [
                "A tabela de rotas associada à sub-rede contém uma rota para um Internet Gateway.",
                true,
            ],
            ["A sub-rede possui uma Network ACL que nega todo o tráfego de entrada.", false],
        ],
    },
    {
        statement:
            "Instâncias Amazon EC2 em uma sub-rede privada precisam baixar atualizações de software da internet, mas não devem aceitar conexões iniciadas a partir da internet. Qual recurso atende a esse requisito?",
        explanation:
            "O NAT Gateway permite que instâncias em sub-redes privadas iniciem tráfego de saída para a internet (por exemplo, para atualizações), impedindo conexões iniciadas de fora. Um Internet Gateway exporia as instâncias a conexões de entrada, um Security Group filtra tráfego mas não fornece acesso à internet, e o VPC Peering conecta VPCs entre si.",
        options: [
            ["Internet Gateway", false],
            ["NAT Gateway", true],
            ["Security Group", false],
            ["VPC Peering", false],
        ],
    },
    {
        statement:
            "Qual componente precisa ser anexado a uma Amazon VPC para permitir a comunicação entre os recursos em sub-redes públicas e a internet?",
        explanation:
            "O Internet Gateway é o componente, anexado à VPC, que permite a comunicação bidirecional entre os recursos das sub-redes públicas e a internet. O Virtual Private Gateway e o Direct Connect servem para conectividade privada com redes on-premises, e o NAT Gateway apenas habilita a saída de sub-redes privadas.",
        options: [
            ["Virtual Private Gateway", false],
            ["NAT Gateway", false],
            ["Internet Gateway", true],
            ["AWS Direct Connect", false],
        ],
    },
    {
        statement: "Qual é a função de uma tabela de rotas (route table) em uma Amazon VPC?",
        explanation:
            "A tabela de rotas contém um conjunto de regras (rotas) que determinam para onde o tráfego de rede de uma sub-rede é encaminhado. A distribuição de tráfego é feita pelo Elastic Load Balancing, a filtragem por Security Groups e Network ACLs e a criptografia de rede por serviços como VPN.",
        options: [
            ["Distribuir automaticamente o tráfego entre várias instâncias EC2.", false],
            ["Definir para onde o tráfego de rede de uma sub-rede deve ser direcionado.", true],
            ["Filtrar o tráfego de entrada e saída com base em regras de permitir e negar.", false],
            ["Criptografar o tráfego que trafega entre duas VPCs.", false],
        ],
    },
    {
        statement:
            "Quais afirmações descrevem corretamente diferenças entre Security Groups e Network ACLs em uma Amazon VPC? (Selecione DUAS opções.)",
        explanation:
            "Security Groups são stateful (o tráfego de retorno é permitido automaticamente) e atuam no nível da instância/ENI; Network ACLs são stateless e atuam no nível da sub-rede. As demais opções invertem esses conceitos ou atribuem às NACLs uma função de criptografia que elas não possuem.",
        options: [
            ["Security Groups são stateful, enquanto Network ACLs são stateless.", true],
            [
                "Security Groups e Network ACLs são ambos stateless e exigem regras de entrada e saída separadas.",
                false,
            ],
            ["Network ACLs criptografam automaticamente todo o tráfego entre as sub-redes.", false],
            [
                "Security Groups operam no nível da instância, enquanto Network ACLs operam no nível da sub-rede.",
                true,
            ],
            [
                "Security Groups são associados a sub-redes, enquanto Network ACLs são associadas a instâncias individuais.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança precisa bloquear explicitamente o tráfego de um intervalo específico de endereços IP no nível da sub-rede de uma VPC. Qual recurso é adequado, por oferecer suporte a regras de negação (deny)?",
        explanation:
            "As Network ACLs, aplicadas no nível da sub-rede, suportam regras de permissão e de negação, permitindo bloquear explicitamente faixas de IP. Security Groups só permitem regras de permissão (allow), a tabela de rotas apenas direciona tráfego e políticas do IAM controlam permissões de API, não tráfego de rede.",
        options: [
            ["Security Group", false],
            ["Network ACL", true],
            ["Tabela de rotas", false],
            ["Política do IAM", false],
        ],
    },
    {
        statement:
            "Uma aplicação é executada em várias Regiões AWS em diferentes continentes. A empresa quer que cada usuário seja direcionado para a Região que oferece o menor tempo de resposta. Qual política de roteamento do Amazon Route 53 atende a esse requisito?",
        explanation:
            "O roteamento baseado em latência direciona o usuário para a Região que oferece a menor latência (menor tempo de resposta). O roteamento por geolocalização baseia-se na localização geográfica do usuário, o ponderado distribui o tráfego por pesos definidos e o de failover é usado para alta disponibilidade ativo-passivo.",
        options: [
            ["Roteamento ponderado (weighted)", false],
            ["Roteamento por geolocalização", false],
            ["Roteamento baseado em latência", true],
            ["Roteamento de failover", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que o Amazon Route 53 redirecione automaticamente os usuários para um ambiente de backup sempre que o ambiente principal ficar indisponível. Quais recursos do Route 53 possibilitam essa configuração? (Selecione DUAS opções.)",
        explanation:
            "As verificações de integridade monitoram a saúde do endpoint principal, e a política de roteamento de failover redireciona o tráfego para o recurso de backup quando o principal é considerado não íntegro. As demais políticas não implementam o comportamento ativo-passivo, e o registro de domínio não tem relação com failover.",
        options: [
            ["Política de roteamento por geolocalização", false],
            ["Verificações de integridade (health checks)", true],
            ["Política de roteamento baseada em latência", false],
            ["Política de roteamento de failover", true],
            ["Registro de domínio", false],
        ],
    },
    {
        statement:
            "Uma empresa quer comprar e gerenciar o nome de domínio da sua nova aplicação usando o mesmo serviço da AWS que já utiliza para o DNS. Qual serviço permite registrar o nome de domínio?",
        explanation:
            "O Amazon Route 53 é um serviço de DNS que também funciona como registrador de domínios, permitindo comprar e gerenciar nomes de domínio. CloudFront é uma CDN, o Global Accelerator melhora o desempenho de rede e a VPC é a rede virtual isolada, nenhum deles registra domínios.",
        options: [
            ["Amazon CloudFront", false],
            ["Amazon Route 53", true],
            ["AWS Global Accelerator", false],
            ["Amazon VPC", false],
        ],
    },
    {
        statement: "Qual afirmação descreve melhor o Amazon CloudFront?",
        explanation:
            "O CloudFront é a rede de entrega de conteúdo (CDN) da AWS: ele armazena cópias em cache do conteúdo em edge locations próximas aos usuários, reduzindo a latência. A distribuição de tráfego entre instâncias é função do Elastic Load Balancing, a filtragem de requisições é do AWS WAF e a conexão dedicada é do Direct Connect.",
        options: [
            ["Um serviço que distribui o tráfego de entrada entre várias instâncias EC2.", false],
            [
                "Uma rede de entrega de conteúdo (CDN) que armazena conteúdo em cache em edge locations para reduzir a latência aos usuários finais.",
                true,
            ],
            ["Um firewall que filtra requisições HTTP maliciosas na camada de aplicação.", false],
            [
                "Um serviço que fornece uma conexão privada dedicada com o data center on-premises.",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais afirmações sobre o AWS Global Accelerator estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Global Accelerator fornece endereços IP estáticos (anycast) como ponto de entrada fixo e direciona o tráfego pela rede global e privada da AWS, melhorando desempenho e disponibilidade. Armazenar conteúdo em cache é função do CloudFront, banco NoSQL é o DynamoDB e o túnel VPN criptografado é o Site-to-Site VPN.",
        options: [
            [
                "Fornece endereços IP estáticos que funcionam como um ponto de entrada fixo para as aplicações.",
                true,
            ],
            [
                "Armazena conteúdo estático em cache em edge locations para reduzir a latência.",
                false,
            ],
            [
                "Roteia o tráfego dos usuários pela rede global da AWS para melhorar o desempenho e a disponibilidade.",
                true,
            ],
            ["Fornece um banco de dados NoSQL totalmente gerenciado.", false],
            ["Cria um túnel VPN criptografado sobre a internet pública.", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa estabelecer rapidamente uma conexão criptografada entre seu data center on-premises e a VPC, utilizando a conexão de internet já existente e com baixo custo inicial. Qual solução da AWS atende melhor a esse cenário?",
        explanation:
            "O AWS Site-to-Site VPN cria um túnel IPsec criptografado sobre a internet pública, sendo rápido de configurar e de baixo custo inicial. O Direct Connect oferece uma conexão física dedicada, porém exige mais tempo de provisionamento; Global Accelerator e CloudFront não conectam redes on-premises à VPC dessa forma.",
        options: [
            ["AWS Direct Connect", false],
            ["AWS Site-to-Site VPN", true],
            ["AWS Global Accelerator", false],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS é totalmente gerenciado e permite criar, publicar, manter e proteger APIs em qualquer escala, funcionando como uma porta de entrada para aplicações acessarem a lógica de back-end?",
        explanation:
            "O Amazon API Gateway é um serviço totalmente gerenciado para criar, publicar, manter, monitorar e proteger APIs (REST, HTTP e WebSocket) em qualquer escala. Direct Connect é conectividade física, Route 53 é DNS e Transit Gateway interconecta redes, nenhum deles gerencia APIs.",
        options: [
            ["AWS Transit Gateway", false],
            ["Amazon Route 53", false],
            ["Amazon API Gateway", true],
            ["AWS Direct Connect", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que suas aplicações em uma VPC acessem um serviço da AWS de forma privada, sem que o tráfego passe pela internet pública e sem exigir um Internet Gateway ou NAT Gateway. Qual tecnologia oferece essa conectividade privada?",
        explanation:
            "O AWS PrivateLink fornece conectividade privada entre VPCs e serviços da AWS por meio de endpoints de interface, mantendo o tráfego dentro da rede da AWS, sem expô-lo à internet. CloudFront é uma CDN, a VPN conecta redes on-premises e o Internet Gateway justamente direciona tráfego para a internet pública.",
        options: [
            ["Amazon CloudFront", false],
            ["AWS PrivateLink (endpoints de interface da VPC)", true],
            ["AWS Site-to-Site VPN", false],
            ["Internet Gateway", false],
        ],
    },
    {
        statement:
            "Uma empresa possui centenas de VPCs e várias conexões com redes on-premises e quer interconectá-las por meio de um único hub central, em vez de criar muitas conexões ponto a ponto. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O AWS Transit Gateway funciona como um hub central que interconecta milhares de VPCs e redes on-premises, simplificando a topologia da rede. O VPC Peering cria conexões ponto a ponto (que não escalam bem para centenas de VPCs), o Internet Gateway dá acesso à internet e o Route 53 é um serviço de DNS.",
        options: [
            ["VPC Peering", false],
            ["AWS Transit Gateway", true],
            ["Internet Gateway", false],
            ["Amazon Route 53", false],
        ],
    },
    {
        statement:
            "Uma empresa tem exatamente duas VPCs e quer que os recursos de uma se comuniquem com os da outra usando endereços IP privados, sem trafegar pela internet pública. Qual é a forma mais simples de conectar essas duas VPCs?",
        explanation:
            "Um VPC Peering estabelece uma conexão de rede direta entre duas VPCs, permitindo a comunicação por endereços IP privados sem passar pela internet. Internet Gateway e NAT Gateway lidam com acesso à internet, e o CloudFront é uma CDN para entrega de conteúdo.",
        options: [
            ["Anexar um Internet Gateway a cada VPC.", false],
            ["Configurar um NAT Gateway em cada VPC.", false],
            ["Configurar um VPC Peering entre as duas VPCs.", true],
            ["Criar uma distribuição do Amazon CloudFront.", false],
        ],
    },
    {
        statement: "Qual afirmação descreve corretamente uma função (role) do AWS IAM?",
        explanation:
            "Uma função (role) do IAM é uma identidade com permissões que fornece credenciais de segurança temporárias e pode ser assumida por usuários, aplicações ou serviços confiáveis. A opção do usuário permanente descreve um usuário do IAM; o documento JSON descreve uma política; e o agrupamento de usuários descreve um grupo.",
        options: [
            [
                "É uma identidade que fornece credenciais de segurança temporárias e pode ser assumida por usuários, aplicações ou serviços confiáveis.",
                true,
            ],
            [
                "É um usuário permanente, com senha e chaves de acesso de longa duração, usado para login diário no console.",
                false,
            ],
            ["É um documento JSON que lista as permissões concedidas ou negadas.", false],
            [
                "É um agrupamento de usuários que compartilham o mesmo conjunto de permissões.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tem 30 desenvolvedores que precisam exatamente do mesmo conjunto de permissões no IAM. Qual é a maneira MAIS eficiente de gerenciar essas permissões?",
        explanation:
            "Grupos do IAM permitem anexar as políticas uma única vez e aplicá-las a todos os membros, simplificando o gerenciamento. Anexar políticas individualmente é trabalhoso, e compartilhar um usuário ou usar o usuário raiz viola as boas práticas de segurança.",
        options: [
            [
                "Criar um grupo do IAM com as políticas necessárias e adicionar os 30 usuários a esse grupo.",
                true,
            ],
            ["Anexar as políticas individualmente a cada um dos 30 usuários.", false],
            ["Compartilhar um único usuário do IAM entre os 30 desenvolvedores.", false],
            ["Usar o usuário raiz (root) da conta para todas as 30 pessoas.", false],
        ],
    },
    {
        statement:
            "De acordo com o princípio do menor privilégio (least privilege), como as permissões devem ser concedidas aos usuários do IAM?",
        explanation:
            "O princípio do menor privilégio recomenda conceder apenas as permissões estritamente necessárias para executar a tarefa exigida. Conceder acesso total, permissões iguais a todos por padrão ou permissões amplas para reduzir depois aumenta desnecessariamente a superfície de risco.",
        options: [
            [
                "Conceder apenas as permissões necessárias para executar a tarefa exigida, e nada além disso.",
                true,
            ],
            [
                "Conceder acesso total de administrador para evitar que o trabalho seja bloqueado.",
                false,
            ],
            ["Conceder o mesmo conjunto de permissões a todos os usuários por padrão.", false],
            [
                "Conceder permissões amplas inicialmente e removê-las apenas se causarem problemas.",
                false,
            ],
        ],
    },
    {
        statement:
            "O que a autenticação multifator (MFA) acrescenta ao processo de login em uma conta AWS?",
        explanation:
            "O MFA adiciona um segundo fator de autenticação (algo que você tem, como um código gerado por um dispositivo) além da senha (algo que você sabe). Ele não substitui a senha, não criptografa dados no S3 e não permite login apenas com o e-mail.",
        options: [
            [
                "Uma camada extra de proteção que, além da senha, exige um código de um dispositivo de autenticação.",
                true,
            ],
            ["Substitui a senha por uma chave de acesso programática.", false],
            ["Criptografa automaticamente todos os dados armazenados no Amazon S3.", false],
            ["Permite o login usando apenas o endereço de e-mail, sem senha.", false],
        ],
    },
    {
        statement:
            "Quais tarefas só podem ser executadas pelo usuário raiz (root) de uma conta AWS e não podem ser delegadas a um usuário do IAM? (Selecione DUAS opções.)",
        explanation:
            "Encerrar a conta AWS e alterar as configurações do usuário raiz (e-mail e senha) são tarefas exclusivas do usuário raiz. Gerenciar buckets do S3, instâncias EC2 e recursos do IAM pode ser delegado a usuários ou funções do IAM com as permissões adequadas.",
        options: [
            ["Encerrar (fechar) a conta AWS.", true],
            [
                "Alterar as configurações da conta, como o endereço de e-mail e a senha do usuário raiz.",
                true,
            ],
            ["Criar e gerenciar buckets do Amazon S3.", false],
            ["Iniciar e interromper instâncias do Amazon EC2.", false],
            ["Criar usuários, grupos e políticas do IAM.", false],
        ],
    },
    {
        statement:
            "Qual é a finalidade das políticas de controle de serviço (SCPs) no AWS Organizations?",
        explanation:
            "As SCPs definem o teto de permissões (guardrails) disponível para as contas de uma organização, mas não concedem permissões por si só; ainda são necessárias políticas do IAM para conceder acesso. Elas não criptografam tráfego de rede nem consolidam faturas.",
        options: [
            [
                "Definir o limite máximo de permissões disponíveis para as contas de uma organização, sem conceder permissões por si só.",
                true,
            ],
            ["Conceder diretamente permissões aos usuários do IAM nas contas-membro.", false],
            ["Criptografar o tráfego de rede entre as contas da organização.", false],
            ["Consolidar o faturamento de todas as contas em uma única fatura.", false],
        ],
    },
    {
        statement:
            "No Amazon Cognito, qual recurso fornece credenciais temporárias da AWS que permitem aos usuários de um aplicativo acessar serviços como o Amazon S3 ou o DynamoDB?",
        explanation:
            "Os grupos de identidades (identity pools) do Cognito fornecem credenciais temporárias da AWS para acessar serviços diretamente. Os grupos de usuários (user pools) cuidam do cadastro e login; grupos do IAM e SCPs não se aplicam a usuários finais de aplicativos.",
        options: [
            ["Grupos de identidades (identity pools).", true],
            ["Grupos de usuários (user pools), responsáveis pelo cadastro e login.", false],
            ["Grupos do IAM.", false],
            ["Políticas de controle de serviço (SCPs).", false],
        ],
    },
    {
        statement:
            "Uma empresa executa suas aplicações em instâncias Amazon EC2 com Linux. Segundo o modelo de responsabilidade compartilhada, quem é responsável por aplicar patches (correções de segurança) no sistema operacional convidado (guest OS) dessas instâncias?",
        explanation:
            "Em instâncias EC2 (modelo de infraestrutura como serviço), o cliente é responsável por aplicar patches no sistema operacional convidado. A AWS cuida da infraestrutura física e do hipervisor subjacente, mas não do SO convidado das instâncias do cliente.",
        options: [
            [
                "O cliente é responsável por aplicar os patches no sistema operacional convidado das instâncias EC2.",
                true,
            ],
            [
                "A AWS aplica automaticamente todos os patches do sistema operacional convidado.",
                false,
            ],
            ["A responsabilidade é sempre da AWS, independentemente do serviço utilizado.", false],
            ["Nenhum patch é necessário em instâncias do Amazon EC2.", false],
        ],
    },
    {
        statement:
            "Uma empresa utiliza o Amazon RDS, um serviço de banco de dados gerenciado. Segundo o modelo de responsabilidade compartilhada, qual tarefa é de responsabilidade DA AWS?",
        explanation:
            "No Amazon RDS, que é um serviço gerenciado, a AWS é responsável por aplicar patches no sistema operacional e no mecanismo do banco de dados subjacente. O cliente continua responsável por gerenciar os dados, as permissões de acesso e a configuração de rede (como grupos de segurança e criptografia).",
        options: [
            [
                "Aplicar patches no sistema operacional e no mecanismo do banco de dados subjacente.",
                true,
            ],
            [
                "Definir as permissões de acesso dos usuários ao banco de dados e proteger os dados.",
                false,
            ],
            ["Configurar os grupos de segurança que controlam o acesso à instância.", false],
            ["Gerenciar a criptografia do lado do cliente dos dados da aplicação.", false],
        ],
    },
    {
        statement:
            "Um usuário do IAM tem uma política que permite (Allow) o acesso ao Amazon S3 e, simultaneamente, outra política anexada que nega (Deny) explicitamente esse mesmo acesso. O que acontece quando o usuário tenta acessar o S3?",
        explanation:
            "Na avaliação de políticas do IAM, uma negação explícita (Deny) sempre prevalece sobre qualquer permissão (Allow). A ordem de criação das políticas não importa e não existe um acesso parcial como 'meio-termo' nesse cenário.",
        options: [
            [
                "O acesso é negado, pois uma negação explícita (Deny) sempre prevalece sobre uma permissão (Allow).",
                true,
            ],
            [
                "O acesso é permitido, pois a permissão (Allow) tem prioridade sobre a negação.",
                false,
            ],
            ["O resultado depende da ordem em que as políticas foram criadas.", false],
            ["O usuário recebe acesso somente de leitura como meio-termo.", false],
        ],
    },
    {
        statement:
            "Uma empresa já gerencia as identidades de seus funcionários em um Microsoft Active Directory local e quer que eles acessem a AWS sem precisar criar um usuário do IAM separado para cada pessoa. Qual abordagem é recomendada?",
        explanation:
            "A federação de identidades permite que os funcionários usem suas credenciais corporativas existentes (por exemplo, do Active Directory) para acessar a AWS, sem criar um usuário do IAM para cada pessoa. Criar usuários manualmente, compartilhar credenciais do usuário raiz ou distribuir chaves de acesso contraria as boas práticas.",
        options: [
            [
                "Usar federação de identidades, permitindo que os usuários acessem a AWS com suas credenciais corporativas existentes.",
                true,
            ],
            [
                "Criar um usuário do IAM para cada funcionário e sincronizar as senhas manualmente.",
                false,
            ],
            ["Compartilhar as credenciais do usuário raiz com o Active Directory.", false],
            [
                "Desativar o Active Directory e migrar todos os funcionários para chaves de acesso.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um administrador de segurança precisa auditar todos os usuários do IAM de uma conta, verificando o status das senhas, das chaves de acesso e se o MFA está habilitado. Qual recurso do IAM fornece essas informações em um único arquivo?",
        explanation:
            "O relatório de credenciais (credential report) do IAM lista todos os usuários e o status de suas credenciais, incluindo senhas, chaves de acesso e MFA. O Cost Explorer trata de custos, grupos do IAM organizam permissões e o Amazon Inspector avalia vulnerabilidades.",
        options: [
            ["O relatório de credenciais (credential report) do IAM.", true],
            ["O AWS Cost Explorer.", false],
            ["Os grupos do IAM.", false],
            ["O Amazon Inspector.", false],
        ],
    },
    {
        statement:
            "Quais afirmações descrevem corretamente o AWS IAM Identity Center (sucessor do AWS Single Sign-On)? (Selecione DUAS opções.)",
        explanation:
            "O AWS IAM Identity Center gerencia de forma centralizada o acesso a várias contas AWS e oferece login único (SSO) para as contas e aplicações atribuídas aos usuários. Ele é voltado à força de trabalho, diferentemente do Amazon Cognito, que atende usuários finais de aplicativos; ele não é um serviço de armazenamento nem elimina a necessidade de criptografia.",
        options: [
            [
                "Permite gerenciar de forma centralizada o acesso a várias contas AWS a partir de um único local.",
                true,
            ],
            [
                "Oferece uma experiência de login único (SSO) para os usuários acessarem as contas e aplicações atribuídas.",
                true,
            ],
            [
                "É usado principalmente para gerenciar o cadastro e o login dos usuários finais de aplicativos móveis.",
                false,
            ],
            ["Fornece armazenamento de objetos altamente durável para arquivos e backups.", false],
            ["Elimina a necessidade de criptografar os dados em trânsito entre as contas.", false],
        ],
    },
    {
        statement:
            "Uma organização quer exigir que todos os usuários do IAM criem senhas com um número mínimo de caracteres, incluindo números e símbolos, e que as troquem periodicamente. Qual recurso permite impor essas regras?",
        explanation:
            "A política de senhas (password policy) da conta no IAM permite impor requisitos de complexidade e expiração para os usuários do IAM. As SCPs não definem regras de senha, os grupos de segurança controlam tráfego de rede e o Amazon Cognito gerencia usuários finais de aplicativos, não usuários do IAM.",
        options: [
            ["A política de senhas (password policy) da conta no IAM.", true],
            ["Uma política de controle de serviço (SCP).", false],
            ["Um grupo de segurança (security group).", false],
            ["O Amazon Cognito.", false],
        ],
    },
    {
        statement:
            "Uma empresa tem uma conta AWS de produção e outra de desenvolvimento. Ela quer que alguns usuários da conta de desenvolvimento acessem recursos específicos na conta de produção, sem criar novos usuários do IAM na conta de produção. Qual é a abordagem recomendada?",
        explanation:
            "Criar uma função (role) do IAM na conta de produção que possa ser assumida por usuários da conta de desenvolvimento permite o acesso entre contas de forma segura e temporária, sem duplicar usuários nem compartilhar chaves. Compartilhar chaves de acesso ou usar o usuário raiz viola as boas práticas de segurança.",
        options: [
            [
                "Criar uma função (role) do IAM na conta de produção que possa ser assumida por usuários da conta de desenvolvimento.",
                true,
            ],
            [
                "Compartilhar as chaves de acesso de um usuário da conta de produção com a equipe de desenvolvimento.",
                false,
            ],
            ["Usar o usuário raiz da conta de produção para executar todas as ações.", false],
            ["Criar um usuário do IAM na conta de produção para cada desenvolvedor.", false],
        ],
    },
    {
        statement:
            "Quais das seguintes opções podem ser usadas como dispositivo de autenticação multifator (MFA) em uma conta AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS aceita como MFA aplicativos autenticadores virtuais e chaves de segurança físicas compatíveis com FIDO, entre outros. O endereço de e-mail, a senha (que é o primeiro fator de autenticação) e o ID da conta de 12 dígitos não são dispositivos de MFA.",
        options: [
            ["Um aplicativo autenticador virtual em um smartphone (MFA virtual).", true],
            ["Uma chave de segurança física compatível com o padrão FIDO.", true],
            ["O endereço de e-mail cadastrado na conta.", false],
            ["A senha do usuário do IAM.", false],
            ["O ID da conta AWS de 12 dígitos.", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, a que se referem as expressões 'segurança DA nuvem' (security of the cloud) e 'segurança NA nuvem' (security in the cloud)?",
        explanation:
            "A AWS é responsável pela 'segurança DA nuvem' (infraestrutura física, hardware, virtualização e instalações), enquanto o cliente é responsável pela 'segurança NA nuvem' (seus dados, configurações, sistema operacional convidado e gerenciamento de acesso). As demais opções invertem ou atribuem incorretamente essas responsabilidades.",
        options: [
            [
                "'Segurança DA nuvem' é responsabilidade da AWS; 'segurança NA nuvem' é responsabilidade do cliente.",
                true,
            ],
            ["Ambas as expressões referem-se a responsabilidades exclusivas da AWS.", false],
            ["Ambas as expressões referem-se a responsabilidades exclusivas do cliente.", false],
            [
                "'Segurança DA nuvem' é responsabilidade do cliente; 'segurança NA nuvem' é responsabilidade da AWS.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um administrador cria um usuário do IAM enquanto está na região us-east-1. Em quais regiões da AWS esse usuário poderá ser usado?",
        explanation:
            "O IAM é um serviço global: usuários, grupos, funções e políticas não estão vinculados a uma região específica e valem para toda a conta. Não é necessário recriar o usuário em cada região nem ele fica restrito a uma única região.",
        options: [
            [
                "Em todas as regiões, pois o IAM é um serviço global e não está vinculado a uma região específica.",
                true,
            ],
            ["Apenas na região us-east-1, onde o usuário foi criado.", false],
            ["Apenas nas regiões localizadas nos Estados Unidos.", false],
            ["O usuário precisa ser recriado manualmente em cada região.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer criar, gerenciar e controlar de forma centralizada as chaves de criptografia usadas para proteger seus dados na AWS, com controle de acesso por políticas. Qual serviço deve ser utilizado?",
        explanation:
            "O AWS KMS cria e gerencia chaves de criptografia com controle de acesso centralizado e integra-se a diversos serviços da AWS. O ACM cuida de certificados TLS, o Macie descobre dados sensíveis no S3 e o Secrets Manager guarda segredos de aplicações, não chaves de criptografia.",
        options: [
            ["AWS Key Management Service (AWS KMS)", true],
            ["AWS Certificate Manager (ACM)", false],
            ["Amazon Macie", false],
            ["AWS Secrets Manager", false],
        ],
    },
    {
        statement:
            "Uma instituição financeira precisa de módulos de segurança de hardware (HSM) dedicados e de locatário único, com validação FIPS 140-2 Nível 3, para ter controle exclusivo sobre suas chaves criptográficas. Qual serviço atende a esse requisito?",
        explanation:
            "O AWS CloudHSM oferece HSMs dedicados de locatário único com validação FIPS 140-2 Nível 3, dando ao cliente controle exclusivo das chaves. O KMS é um serviço gerenciado multilocatário, o Secrets Manager armazena segredos e o Inspector avalia vulnerabilidades.",
        options: [
            ["AWS Key Management Service (AWS KMS)", false],
            ["AWS CloudHSM", true],
            ["AWS Secrets Manager", false],
            ["Amazon Inspector", false],
        ],
    },
    {
        statement:
            "Qual serviço permite armazenar, recuperar e rotacionar automaticamente credenciais de banco de dados, chaves de API e outros segredos usados pelas aplicações?",
        explanation:
            "O AWS Secrets Manager armazena segredos e faz a rotação automática deles (por exemplo, senhas de bancos RDS), evitando credenciais fixas no código. O Config avalia conformidade de recursos, o Detective investiga incidentes e o CloudTrail audita chamadas de API.",
        options: [
            ["AWS Config", false],
            ["Amazon Detective", false],
            ["AWS Secrets Manager", true],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Qual serviço provisiona, gerencia e renova automaticamente certificados SSL/TLS para uso com recursos como Elastic Load Balancing, Amazon CloudFront e Amazon API Gateway?",
        explanation:
            "O AWS Certificate Manager (ACM) emite, gerencia e renova certificados TLS automaticamente, eliminando a renovação manual e integrando-se ao ELB, CloudFront e API Gateway. O KMS gerencia chaves de criptografia, o CloudHSM oferece HSMs dedicados e o WAF filtra tráfego web.",
        options: [
            ["AWS Key Management Service (AWS KMS)", false],
            ["AWS CloudHSM", false],
            ["AWS Certificate Manager (ACM)", true],
            ["AWS WAF", false],
        ],
    },
    {
        statement:
            "Uma empresa quer proteger sua aplicação web contra explorações comuns, como injeção de SQL (SQL injection) e cross-site scripting (XSS), filtrando as requisições HTTP e HTTPS. Qual serviço deve ser utilizado?",
        explanation:
            "O AWS WAF é um firewall de aplicações web que cria regras para bloquear ataques como SQL injection e XSS na camada 7. O Shield protege contra DDoS, o Macie descobre dados sensíveis no S3 e o Firewall Manager apenas administra regras centralmente, sem inspecionar o tráfego por si só.",
        options: [
            ["AWS WAF", true],
            ["AWS Shield", false],
            ["Amazon Macie", false],
            ["AWS Firewall Manager", false],
        ],
    },
    {
        statement:
            "Um administrador precisa configurar e aplicar centralmente regras do AWS WAF e proteções do AWS Shield Advanced em várias contas e recursos gerenciados pelo AWS Organizations. Qual serviço deve ser utilizado?",
        explanation:
            "O AWS Firewall Manager administra centralmente regras de WAF, proteções do Shield Advanced e grupos de segurança em todas as contas de uma organização no AWS Organizations. O WAF sozinho é configurado por recurso, o Config avalia conformidade e o Security Hub agrega alertas de segurança.",
        options: [
            ["AWS Config", false],
            ["AWS Firewall Manager", true],
            ["AWS WAF", false],
            ["AWS Security Hub", false],
        ],
    },
    {
        statement:
            "Qual serviço avalia automaticamente instâncias Amazon EC2, imagens de contêiner no Amazon ECR e funções do AWS Lambda em busca de vulnerabilidades de software e exposição de rede não intencional?",
        explanation:
            "O Amazon Inspector faz avaliação contínua e automatizada de vulnerabilidades em EC2, imagens no ECR e funções Lambda. O Macie protege dados sensíveis no S3, o Detective investiga incidentes e o Trusted Advisor faz recomendações gerais de boas práticas.",
        options: [
            ["Amazon Macie", false],
            ["Amazon Inspector", true],
            ["Amazon Detective", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual serviço usa machine learning para descobrir, classificar e proteger dados sensíveis, como informações de identificação pessoal (PII), armazenados no Amazon S3?",
        explanation:
            "O Amazon Macie usa machine learning para localizar e classificar dados sensíveis (como PII) em buckets do Amazon S3. O Inspector avalia vulnerabilidades, o GuardDuty faz detecção de ameaças e o KMS gerencia chaves de criptografia.",
        options: [
            ["Amazon Inspector", false],
            ["Amazon GuardDuty", false],
            ["Amazon Macie", true],
            ["AWS Key Management Service (AWS KMS)", false],
        ],
    },
    {
        statement:
            "Qual serviço analisa e correlaciona automaticamente dados de logs para ajudar a investigar a causa raiz de possíveis problemas de segurança e atividades suspeitas?",
        explanation:
            "O Amazon Detective correlaciona dados de logs (como VPC Flow Logs, CloudTrail e descobertas do GuardDuty) para investigar a causa raiz de incidentes de segurança. O GuardDuty detecta as ameaças, o Security Hub agrega os alertas e o Config avalia configurações de recursos.",
        options: [
            ["Amazon GuardDuty", false],
            ["Amazon Detective", true],
            ["AWS Security Hub", false],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Qual serviço oferece uma visão central e priorizada do estado de segurança na AWS, agregando e normalizando descobertas de serviços como Amazon GuardDuty, Amazon Inspector e Amazon Macie?",
        explanation:
            "O AWS Security Hub centraliza, normaliza e prioriza as descobertas de vários serviços de segurança e executa verificações automáticas contra padrões do setor. O Detective investiga incidentes, o Firewall Manager administra firewalls e o Config avalia a conformidade de recursos.",
        options: [
            ["AWS Security Hub", true],
            ["Amazon Detective", false],
            ["AWS Firewall Manager", false],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa registrar continuamente as configurações dos seus recursos AWS e avaliar automaticamente se elas permanecem em conformidade com as políticas internas ao longo do tempo. Qual serviço deve ser utilizado?",
        explanation:
            "O AWS Config registra o histórico de configuração dos recursos e avalia continuamente a conformidade deles com regras definidas. O CloudTrail registra chamadas de API (quem fez o quê), o CloudWatch monitora métricas e logs e o Trusted Advisor faz recomendações pontuais.",
        options: [
            ["AWS CloudTrail", false],
            ["AWS Config", true],
            ["Amazon CloudWatch", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual serviço oferece acesso sob demanda a relatórios de conformidade e segurança da própria AWS, como os relatórios SOC e as certificações PCI DSS, além de acordos legais como o BAA?",
        explanation:
            "O AWS Artifact é o portal de autoatendimento para baixar relatórios de conformidade da AWS e revisar acordos legais. O Audit Manager audita o ambiente do cliente, o Config avalia configurações e o Trusted Advisor faz recomendações de boas práticas.",
        options: [
            ["AWS Audit Manager", false],
            ["AWS Config", false],
            ["AWS Artifact", true],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Qual serviço automatiza a coleta contínua de evidências para simplificar auditorias e avaliar se os controles do ambiente do cliente estão em conformidade com frameworks como PCI DSS e GDPR?",
        explanation:
            "O AWS Audit Manager coleta evidências automaticamente e as mapeia para frameworks de conformidade, facilitando auditorias do ambiente do cliente. O Artifact apenas fornece os relatórios de conformidade da AWS, o Config avalia configurações e o CloudTrail registra chamadas de API.",
        options: [
            ["AWS Artifact", false],
            ["AWS Audit Manager", true],
            ["AWS Config", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement: "Qual afirmação sobre o AWS Shield Standard está correta?",
        explanation:
            "O AWS Shield Standard é habilitado automaticamente, sem custo adicional, e defende contra os ataques DDoS mais comuns nas camadas de rede e de transporte (camadas 3 e 4). O acesso à equipe de resposta e às proteções avançadas pagas é do Shield Advanced; filtrar SQL injection/XSS é o WAF e classificar dados sensíveis é o Macie.",
        options: [
            [
                "É ativado automaticamente e sem custo adicional para todos os clientes, protegendo contra os ataques DDoS mais comuns nas camadas de rede e de transporte.",
                true,
            ],
            [
                "Exige assinatura paga e dá acesso a uma equipe de resposta a incidentes DDoS disponível 24 horas por dia.",
                false,
            ],
            ["Protege aplicações web contra injeção de SQL e cross-site scripting (XSS).", false],
            ["Descobre e classifica dados sensíveis armazenados no Amazon S3.", false],
        ],
    },
    {
        statement:
            "Como a AWS comprova que a infraestrutura da sua nuvem está em conformidade com padrões e regulamentações como ISO 27001 e PCI DSS?",
        explanation:
            "Os programas de conformidade da AWS são validados por auditores independentes de terceiros, e os clientes podem obter os relatórios (por exemplo, no AWS Artifact). Os clientes não auditam os data centers da AWS, a validação não é apenas interna e certificar a infraestrutura física é responsabilidade DA AWS.",
        options: [
            [
                "Por meio de auditorias conduzidas por auditores independentes de terceiros, cujos relatórios ficam disponíveis aos clientes.",
                true,
            ],
            ["Cada cliente precisa auditar pessoalmente os data centers físicos da AWS.", false],
            [
                "A conformidade é garantida apenas por autoavaliação interna da AWS, sem qualquer validação externa.",
                false,
            ],
            [
                "A certificação da infraestrutura é responsabilidade exclusiva do cliente no modelo de responsabilidade compartilhada.",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais afirmações sobre o AWS Key Management Service (AWS KMS) estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O KMS integra-se a serviços como Amazon S3 e Amazon EBS para criptografia em repouso e registra o uso das chaves no AWS CloudTrail para auditoria. Certificados TLS são do ACM, detecção de ameaças é do GuardDuty e a AWS não oferece testes de penetração automatizados como serviço.",
        options: [
            [
                "Integra-se a serviços como Amazon S3 e Amazon EBS para criptografar dados em repouso.",
                true,
            ],
            [
                "Registra o uso das chaves no AWS CloudTrail, permitindo a auditoria dessas operações.",
                true,
            ],
            ["Substitui a necessidade de certificados SSL/TLS nos balanceadores de carga.", false],
            ["Detecta automaticamente ameaças e comportamentos maliciosos na conta.", false],
            ["Executa testes de penetração automatizados nas instâncias Amazon EC2.", false],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer diferenciar as funções do AWS CloudTrail e do AWS Config. Quais afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O CloudTrail mantém o registro de auditoria das chamadas de API (quem fez o quê e quando), enquanto o Config acompanha e avalia como as configurações dos recursos mudam ao longo do tempo. O CloudTrail não bloqueia chamadas, o Config não protege contra DDoS e nenhum dos dois criptografa volumes EBS por padrão.",
        options: [
            ["O AWS CloudTrail registra quem fez cada chamada de API e quando ela ocorreu.", true],
            [
                "O AWS Config registra e avalia como as configurações dos recursos mudam ao longo do tempo.",
                true,
            ],
            [
                "O AWS CloudTrail bloqueia automaticamente as chamadas de API consideradas suspeitas.",
                false,
            ],
            ["O AWS Config protege aplicações web contra ataques DDoS.", false],
            ["Ambos os serviços criptografam volumes do Amazon EBS por padrão.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer proteger uma aplicação web pública tanto contra ataques DDoS quanto contra explorações comuns da web. Quais afirmações sobre os serviços indicados estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O AWS Shield oferece proteção gerenciada contra DDoS e o AWS WAF filtra o tráfego web contra explorações como SQL injection e XSS; juntos protegem a aplicação na borda. O Macie descobre dados sensíveis no S3, o Secrets Manager guarda segredos e o Config avalia configurações, nenhum deles inspeciona o tráfego web.",
        options: [
            [
                "O AWS Shield oferece proteção gerenciada contra ataques distribuídos de negação de serviço (DDoS).",
                true,
            ],
            [
                "O AWS WAF permite criar regras para filtrar requisições web e bloquear padrões como injeção de SQL.",
                true,
            ],
            ["O Amazon Macie protege a aplicação contra ataques DDoS na camada de rede.", false],
            [
                "O AWS Secrets Manager filtra o tráfego HTTP em busca de cross-site scripting (XSS).",
                false,
            ],
            [
                "O AWS Config bloqueia as requisições maliciosas antes que cheguem à aplicação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer estimar o custo mensal de uma nova arquitetura na AWS ANTES de provisionar qualquer recurso. Qual ferramenta fornece essa estimativa de custos?",
        explanation:
            "O AWS Pricing Calculator estima custos de forma antecipada, antes de criar recursos. Cost Explorer e Cost and Usage Report analisam gastos que já ocorreram, e o AWS Budgets define limites e alertas sobre o consumo real.",
        options: [
            ["AWS Cost Explorer", false],
            ["AWS Pricing Calculator", true],
            ["AWS Cost and Usage Report", false],
            ["AWS Budgets", false],
        ],
    },
    {
        statement:
            "Qual ferramenta permite visualizar e analisar graficamente os custos e o uso da AWS ao longo do tempo, além de gerar previsões de gastos futuros com base no histórico?",
        explanation:
            "O Cost Explorer oferece gráficos e análise do histórico de custos e uso, com previsões baseadas nesse histórico. O Pricing Calculator estima custos antes do provisionamento, o Trusted Advisor verifica boas práticas e o CloudTrail registra chamadas de API.",
        options: [
            ["AWS Cost Explorer", true],
            ["AWS Pricing Calculator", false],
            ["AWS Trusted Advisor", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "O AWS Free Tier (nível gratuito) é composto por diferentes tipos de ofertas gratuitas. Quais das opções a seguir são tipos de oferta do AWS Free Tier? (Selecione DUAS opções.)",
        explanation:
            "O Free Tier possui três tipos de oferta: gratuito por 12 meses, sempre gratuito (Always Free) e testes gratuitos (free trials). As demais alternativas não existem no modelo do nível gratuito da AWS.",
        options: [
            ["12 meses gratuitos a partir da criação da conta", true],
            ["Sempre gratuito (Always Free)", true],
            ["Gratuito pelos primeiros 5 anos", false],
            ["Uso ilimitado gratuito após o pagamento de uma taxa de ativação", false],
            ["Gratuito apenas para instituições de ensino", false],
        ],
    },
    {
        statement:
            "Uma organização utiliza o faturamento consolidado no AWS Organizations com várias contas membro. Em relação aos preços por volume (faixas de desconto por uso), como o consumo das contas é tratado?",
        explanation:
            "No faturamento consolidado, o uso agregado das contas é combinado para alcançar mais rapidamente as faixas de preços por volume, reduzindo o custo total. As demais afirmações contrariam o funcionamento do recurso.",
        options: [
            ["Cada conta é cobrada isoladamente, sem qualquer combinação de uso", false],
            [
                "O uso de todas as contas é somado, ajudando o grupo a atingir faixas de preço com maior desconto por volume",
                true,
            ],
            ["Os descontos por volume são desativados quando há faturamento consolidado", false],
            [
                "Apenas o uso da conta de gerenciamento é considerado para os descontos por volume",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe financeira precisa do conjunto MAIS detalhado e abrangente de dados de custo e uso da AWS, com itens de linha por serviço e granularidade horária, para carregar em ferramentas como Amazon Athena, Amazon Redshift ou Amazon QuickSight. Qual recurso atende a essa necessidade?",
        explanation:
            "O Cost and Usage Report (CUR) fornece os dados de faturamento mais granulares e completos, integráveis a Athena, Redshift e QuickSight. O Budgets foca em limites e alertas, o Pricing Calculator estima custos futuros e o painel resumido não oferece esse nível de detalhe.",
        options: [
            ["AWS Cost and Usage Report (CUR)", true],
            ["AWS Budgets", false],
            ["AWS Pricing Calculator", false],
            ["Painel de faturamento (Billing Dashboard) resumido", false],
        ],
    },
    {
        statement:
            "Tanto os Savings Plans quanto as Instâncias Reservadas oferecem desconto em relação ao On-Demand mediante compromisso de 1 ou 3 anos. Qual afirmação descreve corretamente uma diferença relevante para o planejamento de custos?",
        explanation:
            "Os Compute Savings Plans comprometem um valor por hora e cobrem EC2 de qualquer família, além de Fargate e Lambda, oferecendo mais flexibilidade; as Instâncias Reservadas ficam atreladas a atributos específicos da instância. As demais alternativas trazem informações incorretas.",
        options: [
            [
                "As Instâncias Reservadas não exigem compromisso, ao passo que os Savings Plans exigem obrigatoriamente 3 anos",
                false,
            ],
            ["Os Savings Plans são sempre mais caros do que o preço On-Demand", false],
            [
                "Os Compute Savings Plans baseiam o desconto em um compromisso de gasto por hora e cobrem automaticamente o uso entre diferentes famílias de instâncias, além de Fargate e Lambda, enquanto as Instâncias Reservadas se aplicam a configurações específicas de instância",
                true,
            ],
            [
                "As Instâncias Reservadas podem ser aplicadas ao uso do AWS Lambda, mas os Savings Plans não",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa deseja categorizar e acompanhar seus custos da AWS por centro de custo, projeto e ambiente, aplicando metadados aos recursos para depois filtrar os gastos no faturamento. Qual recurso deve ser utilizado?",
        explanation:
            "As tags de alocação de custos permitem rotular recursos e organizar/filtrar os custos por projeto, centro de custo ou ambiente no faturamento e no Cost Explorer. Grupos de segurança e funções do IAM tratam de rede e permissões, e Zonas de Disponibilidade referem-se à infraestrutura física.",
        options: [
            ["Tags de alocação de custos (cost allocation tags)", true],
            ["Grupos de segurança", false],
            ["Funções do IAM", false],
            ["Zonas de Disponibilidade", false],
        ],
    },
    {
        statement:
            "Qual afirmação descreve melhor o modelo de precificação de pagamento por uso (pay-as-you-go) adotado pela maioria dos serviços da AWS?",
        explanation:
            "No modelo pay-as-you-go, você paga somente pelos recursos que consome, sem investimento inicial obrigatório nem contratos de longo prazo para começar. As demais opções contrariam esse princípio de precificação da AWS.",
        options: [
            ["O cliente paga uma licença anual fixa, independentemente do quanto utiliza", false],
            [
                "O cliente paga apenas pelos recursos que consome, sem investimento inicial obrigatório nem contratos de longo prazo para começar",
                true,
            ],
            [
                "O cliente é obrigado a pagar três anos de uso antecipadamente para qualquer serviço",
                false,
            ],
            ["Todos os serviços são gratuitos e ilimitados após a abertura da conta", false],
        ],
    },
    {
        statement:
            "O plano AWS Basic Support está disponível para todos os clientes da AWS sem custo adicional. Quais recursos estão incluídos no Basic Support? (Selecione DUAS opções.)",
        explanation:
            "O Basic Support inclui documentação, whitepapers, o Support Center para questões de conta/cobrança, o Personal Health Dashboard e o conjunto core de verificações do Trusted Advisor. Suporte técnico 24/7, TAM e SLAs rápidos exigem planos pagos.",
        options: [
            [
                "Acesso ao AWS Personal Health Dashboard (painel personalizado de saúde da conta)",
                true,
            ],
            ["Um conjunto básico (core) de verificações do AWS Trusted Advisor", true],
            ["Acesso 24/7 a engenheiros de suporte da nuvem por telefone e chat", false],
            ["Um Technical Account Manager (TAM) designado", false],
            ["Tempo de resposta inferior a 15 minutos para casos críticos de negócio", false],
        ],
    },
    {
        statement:
            "Uma startup está desenvolvendo e testando uma aplicação na AWS e deseja acesso a suporte técnico por e-mail em horário comercial pelo MENOR custo possível acima do Basic. Qual plano do AWS Support é o mais indicado?",
        explanation:
            "O plano Developer oferece contato por e-mail com o suporte em horário comercial pelo menor preço entre os planos pagos, ideal para ambientes de desenvolvimento e teste. Business e Enterprise custam mais e agregam telefone/chat 24/7, TAM e outros recursos.",
        options: [
            ["Developer", true],
            ["Business", false],
            ["Enterprise On-Ramp", false],
            ["Enterprise", false],
        ],
    },
    {
        statement:
            "Uma empresa quer acesso ao conjunto COMPLETO de verificações do AWS Trusted Advisor (boas práticas em todas as categorias, incluindo otimização de custos e tolerância a falhas). Qual é o plano de suporte MÍNIMO necessário?",
        explanation:
            "O conjunto completo de verificações do Trusted Advisor passa a estar disponível a partir do plano Business; Basic e Developer têm acesso apenas às verificações core. O Enterprise também as inclui, mas não é o plano mínimo exigido.",
        options: [
            ["Basic", false],
            ["Business", true],
            ["Developer", false],
            ["Enterprise", false],
        ],
    },
    {
        statement:
            "Uma grande empresa deseja um contato técnico designado da AWS que atue de forma proativa, conduza revisões de arquitetura e ajude a otimizar continuamente o ambiente, servindo como principal ponto de contato técnico. O que descreve esse papel?",
        explanation:
            "O Technical Account Manager (TAM), disponível nos planos Enterprise On-Ramp e Enterprise, é um contato técnico designado que oferece orientação proativa e ajuda a otimizar o ambiente. Trusted Advisor, Personal Health Dashboard e Support Center são ferramentas automatizadas, não uma pessoa dedicada.",
        options: [
            ["Technical Account Manager (TAM)", true],
            ["AWS Trusted Advisor", false],
            ["AWS Personal Health Dashboard", false],
            ["AWS Support Center", false],
        ],
    },
    {
        statement:
            "Qual serviço oferece uma visão PERSONALIZADA do estado dos serviços da AWS e envia alertas sobre eventos que podem afetar especificamente os SEUS recursos, como uma manutenção programada em uma instância EC2 da sua conta?",
        explanation:
            "O Personal Health Dashboard mostra uma visão personalizada e alertas relacionados aos recursos e à conta do próprio cliente. O Service Health Dashboard exibe o status geral e público dos serviços; o CloudWatch monitora métricas e o Trusted Advisor avalia boas práticas.",
        options: [
            ["AWS Personal Health Dashboard (AWS Health Dashboard – sua conta)", true],
            ["AWS Service Health Dashboard (status geral e público dos serviços)", false],
            ["Amazon CloudWatch", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement:
            "Onde os clientes podem encontrar respostas para as dúvidas técnicas MAIS frequentes sobre a AWS, com conteúdo curado pela própria AWS, gratuitamente e sem abrir um caso de suporte?",
        explanation:
            "O AWS Knowledge Center é um recurso público e gratuito com respostas às perguntas técnicas mais frequentes. O Support Center é o console para abrir e acompanhar casos de suporte; os demais serviços têm outras finalidades.",
        options: [
            ["AWS Support Center", false],
            ["AWS Knowledge Center", true],
            ["AWS Systems Manager", false],
            ["AWS Cost Explorer", false],
        ],
    },
    {
        statement:
            "Uma empresa vai adotar uma estrutura com várias contas AWS e quer configurar e governar rapidamente um ambiente multiconta seguro e em conformidade (landing zone), aplicando guardrails e boas práticas. Qual serviço é o mais indicado?",
        explanation:
            "O AWS Control Tower configura e governa um ambiente multiconta (landing zone) com guardrails e boas práticas de forma automatizada, apoiando-se no Organizations. Config avalia conformidade de recursos individuais, Inspector avalia vulnerabilidades e Batch executa cargas de processamento em lote.",
        options: [
            ["AWS Control Tower", true],
            ["AWS Config", false],
            ["Amazon Inspector", false],
            ["AWS Batch", false],
        ],
    },
    {
        statement:
            "Uma equipe deseja revisar suas cargas de trabalho comparando-as sistematicamente com as boas práticas dos pilares do AWS Well-Architected Framework e receber um plano de melhorias. Qual recurso da AWS deve ser utilizado?",
        explanation:
            "A AWS Well-Architected Tool guia a revisão das cargas de trabalho em relação aos pilares do framework e gera um plano de melhorias. Trusted Advisor faz verificações automatizadas pontuais, Compute Optimizer recomenda dimensionamento de recursos e CloudFormation provisiona infraestrutura.",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS Well-Architected Tool", true],
            ["AWS Compute Optimizer", false],
            ["AWS CloudFormation", false],
        ],
    },
    {
        statement:
            "Quais tarefas o AWS Systems Manager permite realizar na gestão operacional de recursos? (Selecione DUAS opções.)",
        explanation:
            "O Systems Manager permite gestão operacional, como aplicação centralizada de patches (Patch Manager) e acesso seguro a instâncias sem abrir portas nem usar chaves SSH (Session Manager). Distribuição por borda é do CloudFront, escalonamento é do EC2 Auto Scaling e provisionamento de VPC não é função do Systems Manager.",
        options: [
            [
                "Aplicar patches de sistema operacional em uma frota de instâncias EC2 de forma centralizada",
                true,
            ],
            [
                "Conectar-se com segurança a instâncias EC2 sem abrir portas de entrada nem gerenciar chaves SSH, usando o Session Manager",
                true,
            ],
            ["Distribuir conteúdo estático a partir de locais de borda (edge locations)", false],
            ["Ajustar automaticamente a quantidade de instâncias EC2 conforme a demanda", false],
            ["Provisionar automaticamente uma VPC com sub-redes e tabelas de rotas", false],
        ],
    },
    {
        statement:
            "Uma equipe quer implantar de forma repetível o MESMO conjunto de recursos AWS em várias contas e Regiões, gerenciando-os como uma única unidade que pode ser atualizada ou removida por completo de uma só vez. Qual serviço oferece esse recurso?",
        explanation:
            "O CloudFormation provisiona e gerencia um conjunto de recursos como pilhas (stacks) a partir de modelos e, com StackSets, replica essas pilhas de forma repetível em várias contas e Regiões, permitindo atualizá-las ou removê-las em conjunto. CloudTrail audita chamadas de API, Config acompanha configurações e CodeCommit hospeda repositórios Git.",
        options: [
            ["AWS CloudFormation", true],
            ["AWS CloudTrail", false],
            ["AWS Config", false],
            ["AWS CodeCommit", false],
        ],
    },
    {
        statement:
            "Um cliente com um plano de suporte pago precisa abrir e acompanhar um caso técnico com a AWS pelo Console de Gerenciamento. Qual recurso deve utilizar?",
        explanation:
            "O AWS Support Center (Central de Suporte) é onde se abrem e acompanham casos de suporte técnico e de conta/cobrança no console. O Knowledge Center traz respostas às dúvidas mais frequentes, o Personal Health Dashboard mostra a saúde dos seus recursos e a Well-Architected Tool revisa cargas de trabalho.",
        options: [
            ["AWS Knowledge Center", false],
            ["AWS Support Center (Central de Suporte)", true],
            ["AWS Personal Health Dashboard", false],
            ["AWS Well-Architected Tool", false],
        ],
    },
    {
        statement:
            "Uma empresa executa cargas de trabalho de produção críticas para o negócio e exige o MENOR tempo de resposta do AWS Support quando um sistema crítico fica indisponível (meta inferior a 15 minutos). Qual plano de suporte atende a esse requisito?",
        explanation:
            "O plano Enterprise oferece o menor tempo de resposta, com meta inferior a 15 minutos para casos de sistemas críticos de negócio indisponíveis. O Enterprise On-Ramp tem meta de 30 minutos, o Business de 1 hora para produção indisponível, e o Developer não cobre sistemas de produção com essa urgência.",
        options: [
            ["Enterprise", true],
            ["Enterprise On-Ramp", false],
            ["Business", false],
            ["Developer", false],
        ],
    },
];

// Tema de cada questão, na mesma ordem de QUESTOES (para agrupar erros e recomendar revisão).
const TEMAS: string[] = [
    "Segurança e identidade",
    "Armazenamento",
    "Rede e entrega de conteúdo",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Rede e entrega de conteúdo",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Armazenamento",
    "Rede e entrega de conteúdo",
    "Ferramentas e suporte",
    "Rede e entrega de conteúdo",
    "Segurança e identidade",
    "Segurança e identidade",
    "Rede e entrega de conteúdo",
    "Banco de dados",
    "Computação",
    "Computação",
    "Machine learning",
    "Ferramentas e suporte",
    "Migração",
    "Armazenamento",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Armazenamento",
    "Computação",
    "Ferramentas e suporte",
    "Conceitos e arquitetura",
    "Segurança e identidade",
    "Segurança e identidade",
    "Ferramentas e suporte",
    "Rede e entrega de conteúdo",
    "Ferramentas e suporte",
    "Segurança e identidade",
    "Rede e entrega de conteúdo",
    "Preços e faturamento",
    "Segurança e identidade",
    "Armazenamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Armazenamento",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Computação",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Segurança e identidade",
    "Ferramentas e suporte",
    "Banco de dados",
    "Computação",
    "Conceitos e arquitetura",
    "Segurança e identidade",
    "Ferramentas e suporte",
    "Armazenamento",
    "Computação",
    "Rede e entrega de conteúdo",
    "Preços e faturamento",
    "Ferramentas e suporte",
    "Segurança e identidade",
    "Conceitos e arquitetura",
    "Migração",
    "Segurança e identidade",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Rede e entrega de conteúdo",
    "Conceitos e arquitetura",
    "Segurança e identidade",
    "Conceitos e arquitetura",
    "Preços e faturamento",
    "Conceitos e arquitetura",
    "Ferramentas e suporte",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Conceitos e arquitetura",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Preços e faturamento",
    "Preços e faturamento",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
    "Computação",
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
    "Migração",
    "Banco de dados",
    "Banco de dados",
    "Banco de dados",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Rede e entrega de conteúdo",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Segurança e identidade",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Preços e faturamento",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
    "Ferramentas e suporte",
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
                name: "AWS Certified Cloud Practitioner",
                description:
                    "Simulado no formato da prova CLF-C02: 90 minutos, corte de 70%. Mistura resposta única e múltipla.",
                durationMinutes: 90,
                questionCount: 65,
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
