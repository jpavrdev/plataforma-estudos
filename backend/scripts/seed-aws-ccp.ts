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
