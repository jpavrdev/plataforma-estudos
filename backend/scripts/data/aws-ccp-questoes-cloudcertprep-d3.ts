// Questões do simulado AWS Certified Cloud Practitioner (CLF-C02), domínio 3 da prova
// (Cloud Technology and Services), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aws-ccp-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D3: Questao[] = [
    {
        statement:
            "A AWS permite que os usuários gerenciem seus recursos por meio de uma interface web. Qual é o nome dessa interface?",
        explanation:
            "O Console de Gerenciamento da AWS é a interface gráfica, acessada pelo navegador, para gerenciar os recursos. A AWS CLI funciona por comandos digitados no terminal, a API é acessada por requisições HTTP feitas por programas e os SDKs são bibliotecas usadas no código das aplicações.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Command Line Interface (AWS CLI)", false],
            ["API de serviços da AWS", false],
            ["SDKs da AWS", false],
            ["Console de Gerenciamento da AWS", true],
        ],
    },
    {
        statement:
            "Uma aplicação é executada em instâncias do Amazon EC2. Qual das opções a seguir é um exemplo de escalabilidade horizontal?",
        explanation:
            "Escalar horizontalmente é adicionar mais instâncias do mesmo tamanho para dividir a carga entre elas. Trocar a instância por uma maior, aumentar a capacidade de computação de uma única instância ou adicionar memória RAM a ela são exemplos de escalabilidade vertical.",
        topic: "Computação",
        options: [
            ["Substituir a instância atual por outra maior e mais potente", false],
            [
                "Aumentar a capacidade de computação de uma única instância conforme a demanda cresce",
                false,
            ],
            ["Adicionar mais memória RAM a uma das instâncias existentes", false],
            ["Adicionar mais instâncias do mesmo tamanho para atender ao aumento de tráfego", true],
        ],
    },
    {
        statement:
            "Quais medidas ajudam a manter protegidos os dados armazenados em volumes do Amazon EBS? (Selecione DUAS opções.)",
        explanation:
            "Os snapshots criam cópias pontuais dos volumes, guardadas no Amazon S3, e a criptografia em repouso com o AWS KMS protege os dados contra acesso indevido. O EBS não replica volumes entre zonas (a replicação ocorre dentro da própria zona), o Multi-Attach só compartilha o volume entre instâncias e aumentar o tamanho não protege os dados.",
        topic: "Armazenamento",
        options: [
            ["Criar snapshots periódicos de cada volume do EBS", true],
            ["Ativar a criptografia dos dados do EBS em repouso", true],
            ["Replicar os volumes do EBS entre Zonas de Disponibilidade", false],
            ["Ativar o Multi-Attach do volume em várias instâncias", false],
            ["Aumentar regularmente o tamanho do volume do EBS", false],
        ],
    },
    {
        statement:
            "O que o Amazon CloudFront utiliza para distribuir conteúdo com baixa latência a usuários do mundo todo?",
        explanation:
            "O CloudFront guarda o conteúdo em cache nos locais de borda, pontos de presença espalhados pelo mundo e próximos dos usuários. O Global Accelerator é outro serviço, que roteia o tráfego pela rede da AWS até endpoints regionais sem fazer cache, e Regiões e Zonas de Disponibilidade são onde as cargas de trabalho são implantadas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Global Accelerator", false],
            ["Regiões da AWS", false],
            ["Locais de borda da AWS", true],
            ["Zonas de Disponibilidade da AWS", false],
        ],
    },
    {
        statement: "Qual serviço fornece DNS (Sistema de Nomes de Domínio) na Nuvem AWS?",
        explanation:
            "O Amazon Route 53 é o serviço de DNS da AWS, escalável e altamente disponível, que traduz nomes de domínio em endereços IP e direciona os usuários às aplicações. O AWS Config registra a configuração dos recursos, o CloudFront é a rede de entrega de conteúdo (CDN) e o Amazon EMR processa big data.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon Route 53", true],
            ["AWS Config", false],
            ["Amazon CloudFront", false],
            ["Amazon EMR", false],
        ],
    },
    {
        statement:
            "Para eliminar pontos únicos de falha, a boa prática é automatizar ao máximo tanto a detecção quanto a reação a falhas. Quais serviços da AWS ajudam nisso? (Selecione DUAS opções.)",
        explanation:
            "O Elastic Load Balancing faz verificações de integridade e para de enviar tráfego a destinos com falha, e o Amazon EC2 Auto Scaling substitui automaticamente as instâncias não íntegras. O Athena consulta dados no S3, o ECR guarda imagens de contêiner e o Inspector procura vulnerabilidades de software, não falhas de infraestrutura.",
        topic: "Computação",
        options: [
            ["Elastic Load Balancing", true],
            ["Amazon EC2 Auto Scaling", true],
            ["Amazon Athena", false],
            ["Amazon Elastic Container Registry", false],
            ["Amazon Inspector", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor vai criar uma aplicação web de duas camadas cuja camada de dados usa MySQL. Qual opção oferece um banco de dados compatível com MySQL com backups automáticos feitos pela AWS?",
        explanation:
            "O Amazon Aurora é um banco de dados relacional gerenciado e compatível com MySQL, e a AWS faz os backups automáticos contínuos. No MySQL instalado no EC2, os backups ficam por conta do cliente, o DynamoDB é um banco NoSQL de chave-valor e o Neptune é um banco de grafos, nenhum dos dois compatível com MySQL.",
        topic: "Banco de dados",
        options: [
            ["MySQL instalado em uma instância do Amazon EC2", false],
            ["Amazon Aurora", true],
            ["Amazon DynamoDB", false],
            ["Amazon Neptune", false],
        ],
    },
    {
        statement: "O que o AWS Health Dashboard oferece? (Selecione DUAS opções.)",
        explanation:
            "O AWS Health Dashboard mostra uma visão personalizada de como os eventos da AWS afetam os serviços e recursos da sua conta e traz orientações para agir sobre eles. As verificações de integridade de instâncias são do EC2 Auto Scaling, as recomendações de custo vêm do Trusted Advisor e a busca de vulnerabilidades é do Amazon Inspector.",
        topic: "Ferramentas e suporte",
        options: [
            ["Orientações para resolver eventos da AWS que afetam seus recursos", true],
            ["Uma visão personalizada do estado dos serviços da AWS que você utiliza", true],
            ["Verificações de integridade das instâncias de um grupo do Auto Scaling", false],
            ["Recomendações de otimização de custos para os recursos da conta", false],
            ["Um painel com as vulnerabilidades encontradas nas suas aplicações", false],
        ],
    },
    {
        statement: "Quais afirmações sobre o Amazon S3 estão INCORRETAS? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 é armazenamento de objetos, então não executa aplicações (isso é papel de serviços de computação como o EC2 e o Lambda), e escala automaticamente, sem ajuste manual. As demais são verdadeiras: capacidade praticamente ilimitada, qualquer número de objetos com tamanho máximo por objeto e durabilidade de 11 noves.",
        topic: "Armazenamento",
        options: [
            ["Oferece armazenamento praticamente ilimitado para qualquer tipo de dado", false],
            ["É capaz de executar qualquer tipo de aplicação ou sistema de back-end", true],
            ["Armazena qualquer número de objetos, mas limita o tamanho de cada um", false],
            ["Precisa ser escalado manualmente para armazenar e recuperar mais dados", true],
            ["Foi projetado para oferecer 99,999999999% (11 noves) de durabilidade", false],
        ],
    },
    {
        statement: "Quais são recursos do Amazon CloudWatch Logs? (Selecione DUAS opções.)",
        explanation:
            "O CloudWatch Logs permite monitorar os logs em tempo real, com filtros e alarmes, e configurar por quanto tempo cada grupo de logs é mantido. O serviço é cobrado por ingestão e armazenamento, não gera resumos pelo Amazon SNS (que só envia notificações) e o OpenSearch Service é um destino opcional e pago.",
        topic: "Ferramentas e suporte",
        options: [
            ["Resumos dos logs enviados pelo Amazon SNS", false],
            ["Análises gratuitas no Amazon OpenSearch Service", false],
            ["Armazenamento dos logs sem nenhum custo", false],
            ["Monitoramento dos dados de log em tempo real", true],
            ["Período de retenção dos logs configurável", true],
        ],
    },
    {
        statement:
            "Quais serviços da AWS são indicados para leitura e gravação de dados que mudam constantemente? (Selecione DUAS opções.)",
        explanation:
            "O Amazon RDS lida com leituras e gravações frequentes em bancos relacionais, e o Amazon EFS oferece um sistema de arquivos compartilhado com leitura e gravação simultâneas por várias instâncias. O S3 Glacier Deep Archive é para arquivamento raro, o DataSync só transfere dados e o Redshift é um data warehouse voltado a análises.",
        topic: "Armazenamento",
        options: [
            ["S3 Glacier Deep Archive", false],
            ["Amazon RDS", true],
            ["AWS DataSync", false],
            ["Amazon Redshift", false],
            ["Amazon EFS", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite executar consultas interativas com SQL padrão diretamente sobre dados armazenados no Amazon S3, pagando por consulta?",
        explanation:
            "O Amazon Athena é um serviço de consultas interativas sem servidor que roda SQL padrão direto sobre os dados no S3, cobrando pelo volume lido em cada consulta. O AWS Glue prepara e transforma dados (ETL), o Amazon EMR executa frameworks de big data como Spark e Hadoop e o Amazon QuickSight cria painéis de BI.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Glue", false],
            ["Amazon EMR", false],
            ["Amazon QuickSight", false],
            ["Amazon Athena", true],
        ],
    },
    {
        statement:
            "Qual das opções a seguir descreve corretamente a relação entre Regiões, Zonas de Disponibilidade e locais de borda da AWS?",
        explanation:
            "Cada Região é uma área geográfica com várias Zonas de Disponibilidade, e cada zona reúne um ou mais data centers. Os locais de borda são pontos de presença à parte, usados por serviços como o CloudFront, e não ficam dentro das zonas nem contêm Regiões.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Os data centers contêm as Regiões", false],
            ["As Regiões contêm Zonas de Disponibilidade", true],
            ["As Zonas de Disponibilidade contêm locais de borda", false],
            ["Os locais de borda contêm Regiões", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa transcodificar um grande número de arquivos de vídeo independentes. Qual abordagem segue os princípios de arquitetura da AWS?",
        explanation:
            "Como os arquivos são independentes, processá-los em várias instâncias ao mesmo tempo aplica a escalabilidade horizontal e o paralelismo recomendados pela AWS, reduzindo o tempo total. Uma única instância, mesmo grande ou com GPU, processa em sequência, e hardware dedicado atende a isolamento e licenças, não à vazão.",
        topic: "Computação",
        options: [
            ["Processar os arquivos em várias instâncias em paralelo", true],
            ["Usar uma única instância grande fora do horário de pico", false],
            ["Usar servidores com hardware dedicado ao cliente", false],
            ["Usar uma única instância grande com GPU", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem executar um banco de dados Microsoft SQL Server? (Selecione DUAS opções.)",
        explanation:
            "O SQL Server pode rodar em instâncias do Amazon EC2, com o cliente instalando e administrando o banco, ou no Amazon RDS for SQL Server, em que a AWS cuida de patches e backups. O Aurora só é compatível com MySQL e PostgreSQL, o Redshift é um data warehouse e o S3 é armazenamento de objetos.",
        topic: "Banco de dados",
        options: [
            ["Amazon EC2", true],
            ["Amazon RDS", true],
            ["Amazon Aurora", false],
            ["Amazon Redshift", false],
            ["Amazon S3", false],
        ],
    },
    {
        statement: "Qual vantagem de economia de tempo o Amazon Rekognition oferece?",
        explanation:
            "O Amazon Rekognition usa deep learning para detectar automaticamente objetos, cenas, rostos e textos em imagens e vídeos, dispensando a revisão manual. Ele não aplica marcas-d'água nem redimensiona imagens (tarefas de edição) e não depende de pessoas no Mechanical Turk, já que a análise é feita por modelos treinados.",
        topic: "Machine learning",
        options: [
            ["Aplica marcas-d'água automaticamente em imagens", false],
            ["Detecta automaticamente os objetos que aparecem em imagens", true],
            ["Redimensiona milhões de imagens de forma automática", false],
            ["Distribui a detecção de objetos para pessoas pelo Amazon Mechanical Turk", false],
        ],
    },
    {
        statement:
            "Qual serviço armazena objetos, oferece acesso a eles em tempo real e tem recursos de versionamento e de ciclo de vida?",
        explanation:
            "O Amazon S3 guarda dados como objetos com acesso imediato, permite ativar o versionamento para recuperar versões anteriores e usa políticas de ciclo de vida para mover ou excluir objetos. O EFS é armazenamento de arquivos, o EBS oferece volumes em bloco para o EC2 e o Storage Gateway conecta ambientes locais ao armazenamento da AWS.",
        topic: "Armazenamento",
        options: [
            ["Amazon EFS", false],
            ["AWS Storage Gateway", false],
            ["Amazon S3", true],
            ["Amazon EBS", false],
        ],
    },
    {
        statement:
            "Uma empresa quer expandir sua operação de uma Região da AWS para uma segunda Região. O que a empresa precisa fazer para começar a usar a nova Região?",
        explanation:
            "As Regiões ficam disponíveis para qualquer conta no modelo de autoatendimento: basta começar a criar recursos nela pelo console, pela CLI ou pela API (as Regiões desativadas por padrão só precisam ser ativadas antes na própria conta). Não há contrato por Região, Zonas de Disponibilidade não podem ser movidas e o console é acessado pelo navegador.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Pedir a um gerente de contas da AWS um novo contrato para a Região", false],
            ["Mover uma das Zonas de Disponibilidade para a nova Região", false],
            ["Começar a criar e implantar os recursos na segunda Região", true],
            ["Baixar o Console de Gerenciamento da AWS da nova Região", false],
        ],
    },
    {
        statement: "Por que é vantajoso usar o Elastic Load Balancing com as aplicações?",
        explanation:
            "O Elastic Load Balancing distribui o tráfego entre vários destinos e se adapta sozinho às variações constantes no volume e no padrão das requisições. Quem adiciona ou remove instâncias é o EC2 Auto Scaling, não há conversão de Application Load Balancer para Classic Load Balancer e o serviço é cobrado por hora e por uso.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Permite converter Application Load Balancers em Classic Load Balancers", false],
            ["Consegue lidar com mudanças constantes nos padrões de tráfego de rede", true],
            [
                "Adiciona e remove instâncias do Amazon EC2 automaticamente conforme a demanda",
                false,
            ],
            ["É oferecido sem nenhum custo para os usuários", false],
        ],
    },
    {
        statement:
            "Entre as opções abaixo, qual é o armazenamento durável de menor custo para guardar backups de banco de dados que precisam estar disponíveis para recuperação imediata?",
        explanation:
            "A classe S3 Standard guarda os backups com alta durabilidade, recuperação em milissegundos e custo por GB bem menor que o de volumes do EBS (classes como a S3 Standard-IA saem ainda mais baratas para acesso raro). O S3 Glacier Flexible Retrieval leva de minutos a horas e o armazenamento de instância é temporário.",
        topic: "Armazenamento",
        options: [
            ["S3 Standard", true],
            ["S3 Glacier Flexible Retrieval", false],
            ["Amazon EBS", false],
            ["Armazenamento de instância do Amazon EC2", false],
        ],
    },
    {
        statement:
            "Qual tipo de armazenamento da AWS é temporário e tem os dados apagados quando a instância é interrompida ou encerrada?",
        explanation:
            "O armazenamento de instância fica em discos fisicamente ligados ao host e é efêmero: os dados se perdem quando a instância é interrompida, hibernada ou encerrada. Volumes do EBS persistem independentemente da instância, e o EFS e o S3 guardam os dados até que sejam excluídos, sem depender de nenhuma instância.",
        topic: "Armazenamento",
        options: [
            ["Volume do Amazon EBS", false],
            ["Armazenamento de instância", true],
            ["Sistema de arquivos do Amazon EFS", false],
            ["Bucket do Amazon S3", false],
        ],
    },
    {
        statement:
            "Qual grupo reúne apenas serviços da plataforma sem servidor (serverless) da AWS?",
        explanation:
            "Step Functions, DynamoDB e SNS são totalmente sem servidor: não há instâncias para provisionar e a escala é automática. Nos outros grupos há um serviço baseado em servidores: o Amazon EC2 exige gerenciar instâncias, o Lightsail oferece servidores virtuais e o Elastic Beanstalk implanta a aplicação em instâncias do EC2.",
        topic: "Computação",
        options: [
            ["Amazon EC2, Amazon S3 e Amazon Athena", false],
            ["Amazon Kinesis, Amazon SQS e Amazon Lightsail", false],
            ["AWS Step Functions, Amazon DynamoDB e Amazon SNS", true],
            ["Amazon Athena, Amazon Cognito e AWS Elastic Beanstalk", false],
        ],
    },
    {
        statement:
            "Qual opção da AWS deve ser usada para guardar backups de dados por longo prazo e com baixo custo?",
        explanation:
            "A classe S3 Glacier Flexible Retrieval foi feita para arquivamento e backups de longo prazo, com custo de armazenamento muito baixo e recuperação em minutos ou horas. O Amazon RDS é um banco de dados transacional, o DataSync apenas transfere dados e os volumes do EBS custam bem mais por GB para guardar backups pouco acessados.",
        topic: "Armazenamento",
        options: [
            ["Amazon Relational Database Service (Amazon RDS)", false],
            ["S3 Glacier Flexible Retrieval", true],
            ["AWS DataSync", false],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
        ],
    },
    {
        statement: "Qual serviço tem como finalidade PRINCIPAL o controle de versão de software?",
        explanation:
            "O AWS CodeCommit é um serviço gerenciado de repositórios Git privados, feito para versionar código com segurança. O CodeBuild compila o código e roda testes, o CodeDeploy automatiza implantações e a AWS CLI é a ferramenta de linha de comando para gerenciar serviços; nenhum deles é voltado a controle de versão.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CodeBuild", false],
            ["AWS Command Line Interface (AWS CLI)", false],
            ["AWS CodeDeploy", false],
            ["AWS CodeCommit", true],
        ],
    },
    {
        statement:
            "Qual componente da infraestrutura global da AWS consiste em um ou mais data centers distintos, com energia e rede redundantes, e se conecta a outros do mesmo tipo por links de baixa latência?",
        explanation:
            "Uma Zona de Disponibilidade reúne um ou mais data centers com energia, rede e conectividade redundantes, ligada às outras zonas da mesma Região por links de baixa latência. A Região é a área geográfica que agrupa várias zonas, os locais de borda são pontos de presença para entrega de conteúdo e a VPC é uma rede virtual, não um componente físico.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Zona de Disponibilidade", true],
            ["Local de borda da AWS", false],
            ["Região da AWS", false],
            ["Rede privada virtual (VPC)", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é um componente da infraestrutura global da AWS?",
        explanation:
            "As Regiões são componentes físicos da infraestrutura global da AWS, cada uma com várias Zonas de Disponibilidade isoladas entre si. Contas e unidades organizacionais servem para organizar e governar o uso da AWS, e grupos de segurança são firewalls virtuais das instâncias; nada disso faz parte da infraestrutura física.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Contas da AWS", false],
            ["Regiões da AWS", true],
            ["Grupos de segurança", false],
            ["Unidades organizacionais", false],
        ],
    },
    {
        statement:
            "Uma empresa vai migrar suas aplicações para uma nuvem privada virtual (VPC) na AWS, e essas aplicações precisarão acessar recursos on-premises. Quais ações permitem essa conectividade? (Selecione DUAS opções.)",
        explanation:
            "Uma VPN Site-to-Site com um gateway privado virtual cria um túnel criptografado pela internet até a VPC, e o AWS Direct Connect oferece um link de rede privado e dedicado; os dois estendem a rede local até a AWS. O Service Catalog gerencia portfólios de produtos aprovados, o Athena consulta dados no S3 e o CloudFront é uma CDN.",
        topic: "Rede e entrega de conteúdo",
        options: [
            [
                "Usar o AWS Service Catalog para listar os recursos on-premises que podem ser migrados",
                false,
            ],
            [
                "Criar uma conexão VPN entre um dispositivo on-premises e um gateway privado virtual da VPC",
                true,
            ],
            [
                "Usar o Amazon Athena para consultar os dados nos servidores de banco de dados on-premises",
                false,
            ],
            [
                "Conectar o data center on-premises da empresa à VPC por meio do AWS Direct Connect",
                true,
            ],
            [
                "Usar o Amazon CloudFront para restringir o acesso ao conteúdo estático dos servidores web on-premises",
                false,
            ],
        ],
    },
    {
        statement:
            "Como os grupos do Amazon EC2 Auto Scaling ajudam a manter uma aplicação web altamente disponível?",
        explanation:
            "Um grupo do Auto Scaling abrange várias Zonas de Disponibilidade da mesma Região e adiciona ou substitui instâncias com falha para manter a capacidade desejada. Ele não atua entre Regiões; aproximar conteúdo dos usuários é papel do Amazon CloudFront, e distribuir requisições é função do Elastic Load Balancing.",
        topic: "Computação",
        options: [
            [
                "Adicionando automaticamente instâncias em várias Regiões da AWS conforme a demanda global",
                false,
            ],
            [
                "Adicionando ou substituindo instâncias automaticamente em várias Zonas de Disponibilidade",
                true,
            ],
            [
                "Mantendo o conteúdo estático da aplicação em locais mais próximos dos usuários finais",
                false,
            ],
            [
                "Distribuindo as requisições de entrada entre as instâncias da camada de servidores web",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais serviços da AWS permitem estender uma arquitetura on-premises para a Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS Direct Connect cria uma conexão de rede dedicada entre o data center e a AWS, e o AWS Storage Gateway integra o armazenamento local ao armazenamento na nuvem. O EBS é armazenamento em bloco usado só dentro da AWS, o CloudFront é uma CDN e o Amazon Connect é uma central de atendimento.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["AWS Direct Connect", true],
            ["Amazon CloudFront", false],
            ["AWS Storage Gateway", true],
            ["Amazon Connect", false],
        ],
    },
    {
        statement:
            "Uma empresa pretende hospedar por conta própria um banco de dados na AWS e precisa desligá-lo todas as noites para manutenção e economia de custos, sem perder os dados. Qual opção a empresa deve usar?",
        explanation:
            "Os volumes do EBS são persistentes e independentes do ciclo de vida da instância, então os dados continuam lá quando a instância EC2 é interrompida à noite. O armazenamento de instância é temporário e perde os dados ao parar a instância, e Redshift e DynamoDB são serviços gerenciados, que não permitem hospedar o próprio banco.",
        topic: "Armazenamento",
        options: [
            ["Amazon Redshift", false],
            ["Amazon DynamoDB", false],
            ["Amazon EC2 com armazenamento de instância", false],
            ["Amazon EC2 com volumes do Amazon EBS", true],
        ],
    },
    {
        statement: "Qual serviço fornece armazenamento de objetos na AWS?",
        explanation:
            "O Amazon S3 é o serviço de armazenamento de objetos: cada item fica em um bucket como objeto, com dados, metadados e uma chave única. O EBS e o armazenamento de instância oferecem armazenamento em bloco para instâncias EC2 (o segundo é temporário), e o EFS é armazenamento de arquivos.",
        topic: "Armazenamento",
        options: [
            ["Amazon EBS", false],
            ["Armazenamento de instância do Amazon EC2", false],
            ["Amazon EFS", false],
            ["Amazon S3", true],
        ],
    },
    {
        statement:
            "Qual classe de armazenamento do Amazon S3 é a mais indicada para dados com padrões de acesso imprevisíveis?",
        explanation:
            "O S3 Intelligent-Tiering move os objetos automaticamente entre níveis de acesso conforme o uso muda, sem taxa de recuperação, o que otimiza o custo quando não se sabe a frequência de acesso. O S3 Standard é caro para dados parados, o S3 Standard-IA cobra por recuperação e o S3 Glacier Flexible Retrieval serve para arquivamento com recuperação lenta.",
        topic: "Armazenamento",
        options: [
            ["S3 Intelligent-Tiering", true],
            ["S3 Glacier Flexible Retrieval", false],
            ["S3 Standard", false],
            ["S3 Standard-IA", false],
        ],
    },
    {
        statement:
            "Qual serviço garante que as mensagens trocadas entre componentes de software não se percam se um ou mais componentes falharem?",
        explanation:
            "O Amazon SQS é uma fila de mensagens gerenciada: as mensagens ficam armazenadas até que um consumidor as processe, então nada se perde se um componente estiver fora do ar. O SES envia e-mails, o Direct Connect é uma conexão de rede dedicada e o Amazon Connect é uma central de atendimento em nuvem.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SQS", true],
            ["Amazon SES", false],
            ["AWS Direct Connect", false],
            ["Amazon Connect", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser usados como recurso de computação? (Selecione DUAS opções.)",
        explanation:
            "O Amazon EC2 fornece servidores virtuais redimensionáveis e o AWS Lambda executa código sem servidor em resposta a eventos; os dois entregam capacidade de computação. A Amazon VPC é rede isolada, o CloudWatch coleta métricas e logs e o S3 armazena objetos; nenhum deles executa código.",
        topic: "Computação",
        options: [
            ["Amazon VPC", false],
            ["Amazon CloudWatch", false],
            ["Amazon S3", false],
            ["Amazon EC2", true],
            ["AWS Lambda", true],
        ],
    },
    {
        statement:
            "Sua empresa está criando uma aplicação que vai armazenar e recuperar fotos e vídeos. Qual serviço você deve recomendar como mecanismo de armazenamento subjacente?",
        explanation:
            "O Amazon S3 armazena qualquer volume de dados não estruturados, como fotos e vídeos, com alta durabilidade e escala praticamente ilimitada. O EBS é armazenamento em bloco anexado a instâncias, o armazenamento de instância é temporário e se perde quando a instância para, e o SQS é uma fila de mensagens, que não guarda arquivos.",
        topic: "Armazenamento",
        options: [
            ["Amazon EBS", false],
            ["Amazon SQS", false],
            ["Amazon S3", true],
            ["Armazenamento de instância do Amazon EC2", false],
        ],
    },
    {
        statement: "O que o Amazon ElastiCache oferece?",
        explanation:
            "O Amazon ElastiCache é um cache em memória gerenciado que guarda dados acessados com frequência na RAM e entrega leituras com latência de submilissegundos. Banco relacional gerenciado descreve o Amazon RDS, a loja de softwares é o AWS Marketplace e o DNS na nuvem é o Amazon Route 53.",
        topic: "Banco de dados",
        options: [
            ["Um cache em memória para aplicações com grande volume de leitura", true],
            ["Um serviço gerenciado de banco de dados relacional", false],
            ["Uma loja on-line de softwares prontos para iniciar com poucos cliques", false],
            ["Um sistema de nomes de domínio (DNS) na nuvem", false],
        ],
    },
    {
        statement:
            "Você trabalha em dois projetos que exigem configurações de rede completamente diferentes. O que você deve usar na AWS para isolar os recursos e as configurações de rede de cada projeto?",
        explanation:
            "A Amazon VPC cria redes virtuais logicamente isoladas, cada uma com seus próprios intervalos de IP, sub-redes, tabelas de rotas e gateways, o que permite configurações de rede independentes por projeto. Gateway de internet e grupo de segurança são componentes dentro de uma VPC, e o CloudFront é uma CDN.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Um gateway de internet dedicado a cada projeto", false],
            ["Uma nuvem privada virtual (Amazon VPC) para cada projeto", true],
            ["Um grupo de segurança dedicado a cada projeto", false],
            ["Uma distribuição do Amazon CloudFront dedicada a cada projeto", false],
        ],
    },
    {
        statement:
            "Uma organização precisa analisar e processar um grande número de conjuntos de dados. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon EMR é uma plataforma gerenciada de big data que executa frameworks de processamento distribuído, como Apache Spark e Hadoop, para analisar grandes volumes de dados. O Amazon MQ é um broker de mensagens, o SNS envia notificações no modelo pub/sub e o SQS é uma fila de mensagens; nenhum deles processa dados em escala.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon EMR", true],
            ["Amazon MQ", false],
            ["Amazon SNS", false],
            ["Amazon SQS", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece o maior nível de controle sobre a infraestrutura virtual subjacente?",
        explanation:
            "No Amazon EC2 o cliente escolhe o sistema operacional, o tipo de instância, a rede e o armazenamento, e pode instalar e configurar qualquer software, o que dá o maior controle sobre a infraestrutura. Redshift, DynamoDB e RDS são serviços gerenciados em que a AWS cuida da infraestrutura e esconde essas camadas do cliente.",
        topic: "Computação",
        options: [
            ["Amazon Redshift", false],
            ["Amazon DynamoDB", false],
            ["Amazon EC2", true],
            ["Amazon RDS", false],
        ],
    },
    {
        statement:
            "Como parte da sua infraestrutura global, a AWS mantém um grande número de locais de borda, usados pelo Amazon CloudFront. Qual das opções a seguir NÃO é um benefício do uso desses locais de borda?",
        explanation:
            "Distribuir o tráfego entre várias instâncias é função do Elastic Load Balancing, não dos locais de borda. Os locais de borda guardam respostas em cache perto dos usuários, entregam conteúdo com baixa latência e também aceleram o envio de arquivos, como no S3 Transfer Acceleration e nas requisições de envio que passam pelo CloudFront.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Manter em cache as respostas mais requisitadas", false],
            ["Agilizar o envio de arquivos pelos usuários", false],
            ["Distribuir o tráfego entre várias instâncias", true],
            ["Entregar conteúdo a usuários globais com baixa latência", false],
        ],
    },
    {
        statement:
            "Qual serviço permite executar aplicações em contêineres em um cluster de instâncias do Amazon EC2?",
        explanation:
            "O Amazon ECS é um serviço gerenciado de orquestração que executa e gerencia contêineres Docker em um cluster de instâncias EC2 ou no AWS Fargate. O AWS Glue é um serviço de integração e ETL de dados, o AWS CloudShell é um terminal no navegador e o AWS Health Dashboard informa eventos que afetam os serviços da AWS.",
        topic: "Computação",
        options: [
            ["Amazon ECS", true],
            ["AWS Glue", false],
            ["AWS CloudShell", false],
            ["AWS Health Dashboard", false],
        ],
    },
    {
        statement:
            "Quais práticas ajudam a reduzir os custos do Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "Classes como S3 Standard-IA e S3 Glacier custam menos para dados pouco acessados, então combiná-las por caso de uso e automatizar a transição com regras de ciclo de vida reduz a conta. O preço do S3 não varia por Zona de Disponibilidade, o EBS custa mais por GB provisionado e o versionamento aumenta o volume armazenado.",
        topic: "Armazenamento",
        options: [
            [
                "Criar regras de ciclo de vida que movam arquivos antigos para uma classe S3 Glacier",
                true,
            ],
            ["Usar a combinação certa de classes de armazenamento para cada caso de uso", true],
            ["Escolher a Zona de Disponibilidade certa para o bucket do S3", false],
            ["Mover todos os dados do S3 Standard para volumes do Amazon EBS", false],
            [
                "Ativar o versionamento em todos os buckets para guardar as versões antigas dos arquivos",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais serviços ou recursos da AWS ajudam a manter uma arquitetura altamente disponível e tolerante a falhas? (Selecione DUAS opções.)",
        explanation:
            "O AWS Auto Scaling adiciona e substitui instâncias conforme a demanda ou quando alguma falha, e o Elastic Load Balancing envia o tráfego só para destinos íntegros. O Direct Connect é conectividade dedicada, o CloudFormation provisiona infraestrutura mas não reage a falhas em execução e as ACLs de rede filtram tráfego nas sub-redes.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Direct Connect", false],
            ["AWS Auto Scaling", true],
            ["Elastic Load Balancing", true],
            ["AWS CloudFormation", false],
            ["Listas de controle de acesso (ACLs) de rede", false],
        ],
    },
    {
        statement:
            "Qual recurso da AWS usa os locais de borda do Amazon CloudFront, distribuídos pelo mundo, para acelerar o envio de arquivos para o Amazon S3?",
        explanation:
            "O S3 Transfer Acceleration recebe os envios no local de borda mais próximo do usuário e leva os dados até o bucket pela rede global da AWS, mais rápida que a internet pública. O AWS WAF é um firewall de aplicações web, o AWS DataSync transfere dados pela rede sem usar locais de borda e a replicação entre Regiões copia objetos entre buckets.",
        topic: "Armazenamento",
        options: [
            ["S3 Transfer Acceleration", true],
            ["AWS WAF", false],
            ["AWS DataSync", false],
            ["S3 Cross-Region Replication", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser usados para melhorar o desempenho de uma aplicação global e reduzir a latência para os usuários? (Selecione DUAS opções.)",
        explanation:
            "O AWS Global Accelerator leva o tráfego dos usuários pela rede global da AWS até o endpoint íntegro mais próximo, e o Amazon CloudFront entrega conteúdo em cache a partir de locais de borda perto dos usuários. O KMS gerencia chaves de criptografia, o Direct Connect liga o data center à AWS e o Glue é um serviço de ETL.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Key Management Service (AWS KMS)", false],
            ["AWS Global Accelerator", true],
            ["AWS Direct Connect", false],
            ["AWS Glue", false],
            ["Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "Qual serviço sem servidor (serverless) da AWS permite executar aplicações sem nenhuma carga administrativa de servidores?",
        explanation:
            "O AWS Lambda executa código em resposta a eventos sem que você provisione, gerencie ou escale servidores. O Amazon Lightsail oferece servidores virtuais simplificados que ainda precisam ser administrados, o Amazon RDS é um banco gerenciado baseado em instâncias e no Amazon EC2 você configura e mantém as próprias instâncias.",
        topic: "Computação",
        options: [
            ["Amazon Lightsail", false],
            ["AWS Lambda", true],
            ["Amazon RDS", false],
            ["Amazon EC2", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser usados para armazenar arquivos de uma aplicação executada em instâncias do Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "O Amazon EFS é um sistema de arquivos gerenciado que várias instâncias EC2 podem montar ao mesmo tempo, e o Amazon EBS fornece volumes em bloco anexados a uma instância, onde os arquivos ficam gravados. O SNS envia notificações, o ECS orquestra contêineres e o EMR processa big data; nenhum deles é um destino para armazenar arquivos.",
        topic: "Armazenamento",
        options: [
            ["Amazon EFS", true],
            ["Amazon SNS", false],
            ["Amazon EBS", true],
            ["Amazon ECS", false],
            ["Amazon EMR", false],
        ],
    },
    {
        statement:
            "Qual serviço de armazenamento as instâncias de banco de dados do Amazon RDS usam como armazenamento principal?",
        explanation:
            "As instâncias do Amazon RDS guardam os dados e os logs do banco em volumes do Amazon EBS, armazenamento em bloco persistente e de baixa latência. O S3 Glacier Flexible Retrieval é para arquivamento, o EFS é um sistema de arquivos compartilhado e o S3 é armazenamento de objetos acessado por API; nenhum serve de disco para o banco.",
        topic: "Armazenamento",
        options: [
            ["S3 Glacier Flexible Retrieval", false],
            ["Amazon EBS", true],
            ["Amazon EFS", false],
            ["Amazon S3", false],
        ],
    },
    {
        statement:
            "Uma empresa está desenvolvendo uma nova aplicação baseada em microsserviços, que apresenta problemas de desempenho e latência. Qual serviço da AWS deve ser usado para investigar esses problemas?",
        explanation:
            "O AWS X-Ray faz rastreamento distribuído: mostra o caminho de cada requisição entre os microsserviços e ajuda a achar gargalos e a causa da latência. O AWS Config registra mudanças de configuração dos recursos, o Amazon Inspector procura vulnerabilidades e o AWS CloudTrail registra chamadas de API para auditoria.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Config", false],
            ["AWS X-Ray", true],
            ["Amazon Inspector", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS foram projetados com tolerância a falhas Multi-AZ nativa, replicando os dados entre várias Zonas de Disponibilidade sem configuração adicional? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 guarda os objetos de forma redundante em pelo menos três Zonas de Disponibilidade (fora as classes de uma só zona, como S3 One Zone-IA e S3 Express One Zone), e o Amazon DynamoDB replica as tabelas automaticamente entre três AZs da Região. Volumes do EBS e sistemas de arquivos do FSx for Lustre ficam em uma única AZ, e uma instância EC2 também roda em uma só AZ.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Amazon FSx for Lustre", false],
            ["Amazon EC2", false],
            ["Amazon S3", true],
            ["Amazon EBS", false],
            ["Amazon DynamoDB", true],
        ],
    },
    {
        statement:
            "Quais recursos do Amazon RDS ajudam a manter o banco de dados disponível quando a instância principal falha? (Selecione DUAS opções.)",
        explanation:
            "A implantação Multi-AZ mantém uma instância em espera sincronizada em outra Zona de Disponibilidade, com failover automático, e uma réplica de leitura pode ser promovida a banco independente se a principal falhar. Locais de borda servem à entrega de conteúdo, grupos de parâmetros ajustam o mecanismo e a aplicação automática de patches só o mantém atualizado.",
        topic: "Banco de dados",
        options: [
            ["Grupos de parâmetros do banco", false],
            ["Implantação Multi-AZ", true],
            ["Aplicação automática de patches", false],
            ["Réplicas de leitura", true],
            ["Locais de borda", false],
        ],
    },
    {
        statement:
            "Uma desenvolvedora implantou uma aplicação na Região us-west-1 (Norte da Califórnia) e percebeu que cerca de 30% do tráfego vem da Ásia. Sem tirar a aplicação dessa Região, o que ela pode fazer para reduzir a latência dos usuários asiáticos?",
        explanation:
            "O Amazon CloudFront guarda o conteúdo em cache em locais de borda próximos aos usuários da Ásia, que passam a ser atendidos perto de onde estão, sem mover a origem. Várias Zonas de Disponibilidade aumentam a disponibilidade, mas ficam na mesma Região; instâncias maiores e sub-redes privadas não encurtam a distância até a Ásia.",
        topic: "Rede e entrega de conteúdo",
        options: [
            [
                "Replicar os recursos atuais em várias Zonas de Disponibilidade da mesma Região",
                false,
            ],
            ["Trocar as instâncias por um tipo de instância com mais CPU e memória", false],
            ["Mover o banco de dados da aplicação para uma sub-rede privada", false],
            ["Usar o Amazon CloudFront com cache em locais de borda na Ásia", true],
        ],
    },
    {
        statement:
            "As classes de armazenamento S3 Glacier são indicadas para guardar quais tipos de dados? (Selecione DUAS opções.)",
        explanation:
            "As classes S3 Glacier custam pouco para dados raramente acessados que precisam ser mantidos por muito tempo, como arquivamento ativo e dados históricos guardados para análises futuras. Arquivos de site acessados o tempo todo pedem uma classe de acesso frequente, registros de banco em uso exigem RDS ou DynamoDB e dados em cache ficam no ElastiCache.",
        topic: "Armazenamento",
        options: [
            ["Arquivamento ativo de dados que ainda são consultados de vez em quando", true],
            ["Dados analíticos históricos guardados por anos para análises futuras", true],
            ["Arquivos de um site dinâmico que são acessados o tempo todo pelos usuários", false],
            ["Registros de um banco de dados transacional em uso ativo pela aplicação", false],
            ["Dados em cache que a aplicação precisa ler em submilissegundos", false],
        ],
    },
    {
        statement: "O que o AWS Elastic Beanstalk oferece?",
        explanation:
            "O AWS Elastic Beanstalk é uma plataforma como serviço (PaaS): você envia o código e ele cuida da implantação, do provisionamento de capacidade, do balanceamento de carga, do Auto Scaling e do monitoramento. O mecanismo sem servidor do ECS é o AWS Fargate, o armazenamento de arquivos escalável é o Amazon EFS e o NoSQL gerenciado é o DynamoDB.",
        topic: "Computação",
        options: [
            ["Uma solução PaaS que automatiza a implantação de aplicações", true],
            ["Um mecanismo de computação sem servidor para o Amazon ECS", false],
            [
                "Uma solução escalável de armazenamento de arquivos para a AWS e servidores locais",
                false,
            ],
            ["Um serviço de banco de dados NoSQL totalmente gerenciado", false],
        ],
    },
    {
        statement:
            "Uma empresa implantou uma nova aplicação web em várias instâncias do Amazon EC2 e precisa distribuir o tráfego HTTP de entrada entre elas, encaminhando cada requisição conforme o caminho da URL. O que a empresa deve usar?",
        explanation:
            "O Application Load Balancer atua na camada 7 e distribui o tráfego HTTP e HTTPS entre as instâncias com regras por caminho da URL ou cabeçalho de host. A recuperação automática restaura uma instância com falha, o Auto Scaling ajusta a quantidade de instâncias e o Network Load Balancer atua na camada 4, sem ler o caminho da URL.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Recuperação automática do Amazon EC2", false],
            ["Amazon EC2 Auto Scaling", false],
            ["Network Load Balancer", false],
            ["Application Load Balancer", true],
        ],
    },
    {
        statement:
            "Um cliente passou muito tempo configurando uma instância do Amazon EC2 recém-implantada. Com o aumento da carga de trabalho, ele decidiu provisionar outra instância com configuração idêntica. Como ele pode fazer isso?",
        explanation:
            "Uma AMI criada a partir da instância configurada guarda o sistema operacional, os softwares e as configurações, e serve de modelo para lançar instâncias idênticas. O AWS Config avalia a conformidade das configurações e não gera imagens, o snapshot do EBS copia só um volume e grupos de segurança são regras de firewall, não a configuração do servidor.",
        topic: "Computação",
        options: [
            [
                "Criando um modelo do AWS Config a partir da instância antiga e lançando a nova com ele",
                false,
            ],
            ["Criando um snapshot do Amazon EBS a partir da instância antiga", false],
            ["Copiando os grupos de segurança da instância antiga para uma instância nova", false],
            [
                "Criando uma AMI a partir da instância antiga e lançando a nova instância com ela",
                true,
            ],
        ],
    },
    {
        statement:
            "Quais vantagens o Amazon Relational Database Service (Amazon RDS) oferece? (Selecione DUAS opções.)",
        explanation:
            "O Amazon RDS reduz a carga administrativa ao automatizar backups, patches e failover, e permite redimensionar a capacidade de computação da instância quando a carga muda. O controle total do host é característica do EC2, a troca de tipo de instância no RDS é uma modificação feita pelo cliente, e documentos e chave-valor são modelos do DynamoDB.",
        topic: "Banco de dados",
        options: [
            ["Menor carga administrativa na operação do banco", true],
            ["Controle total sobre o host subjacente", false],
            ["Capacidade de computação redimensionável", true],
            [
                "Troca automática para tipos de instância maiores ou menores conforme a demanda",
                false,
            ],
            ["Suporte a estruturas de dados de documentos e chave-valor", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS mostra o status atual de todos os serviços da AWS em todas as Regiões?",
        explanation:
            "A página de integridade dos serviços do AWS Health Dashboard mostra o status operacional de todos os serviços da AWS em todas as Regiões, e a visão da conta avisa sobre eventos que afetam os seus recursos. O Service Catalog gerencia catálogos de produtos aprovados, o console é só a interface web e o CloudWatch monitora os seus próprios recursos.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Service Catalog", false],
            ["Console de Gerenciamento da AWS", false],
            ["Amazon CloudWatch", false],
            ["AWS Health Dashboard", true],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS permite chamar os serviços da AWS a partir de diferentes linguagens de programação?",
        explanation:
            "Os AWS SDKs oferecem bibliotecas para linguagens como Python, Java, JavaScript e .NET, que permitem chamar os serviços da AWS direto do código da aplicação. A AWS CLI usa comandos no terminal, o AWS CodeDeploy automatiza implantações e o Console de Gerenciamento é a interface gráfica no navegador.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS SDKs (kits de desenvolvimento)", true],
            ["Interface de linha de comando da AWS (AWS CLI)", false],
            ["AWS CodeDeploy", false],
            ["Console de Gerenciamento da AWS", false],
        ],
    },
    {
        statement:
            "Empresas de desenvolvimento de aplicações migram para a AWS para reduzir o tempo de lançamento e aumentar a satisfação dos clientes. Quais ferramentas de automação da AWS ajudam a implantar aplicações mais rápido? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudFormation implanta a infraestrutura automaticamente a partir de modelos de código, e o AWS Elastic Beanstalk implanta a aplicação a partir do código enviado, cuidando da capacidade e do balanceamento. O Application Migration Service faz migrações lift and shift de servidores, o IAM controla acessos e o Macie encontra dados sensíveis no S3.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CloudFormation", true],
            ["AWS Application Migration Service", false],
            ["AWS Identity and Access Management (IAM)", false],
            ["AWS Elastic Beanstalk", true],
            ["Amazon Macie", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS escalam automaticamente, sem nenhuma intervenção sua? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 absorve qualquer volume de dados e taxa de requisições sem ajuste manual, e o AWS Lambda aumenta sozinho as execuções simultâneas conforme chegam eventos. O EC2 só escala se você configurar o Auto Scaling, os planos do Lightsail têm capacidade fixa e um volume do EBS tem tamanho provisionado que só muda se você alterar.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Amazon EC2", false],
            ["Amazon S3", true],
            ["AWS Lambda", true],
            ["Amazon Lightsail", false],
            ["Amazon EBS", false],
        ],
    },
    {
        statement: "Como o Elastic Load Balancing melhora a confiabilidade de uma aplicação?",
        explanation:
            "O Elastic Load Balancing faz verificações de integridade nos destinos registrados e só encaminha requisições para os que respondem bem, então instâncias com falha deixam de receber tráfego. Ele não distribui tráfego entre buckets do S3, não replica dados entre AZs e não cria réplicas de leitura, que são recurso do Amazon RDS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Distribuindo o tráfego entre vários buckets do Amazon S3", false],
            ["Replicando os dados em várias Zonas de Disponibilidade", false],
            ["Criando réplicas de leitura do banco de dados", false],
            ["Garantindo que só destinos íntegros recebam tráfego", true],
        ],
    },
    {
        statement:
            "Uma empresa planeja migrar uma grande quantidade de dados arquivados para a AWS. Os dados precisam ser mantidos por 5 anos e devem poder ser recuperados em até 5 horas após a solicitação. Qual é a opção de armazenamento mais econômica?",
        explanation:
            "O S3 Glacier Flexible Retrieval tem armazenamento de baixo custo e recuperação padrão de 3 a 5 horas, o que atende ao prazo. O S3 Glacier Deep Archive é mais barato, mas a recuperação padrão leva até 12 horas; o S3 Standard e o Amazon EFS atendem ao prazo, mas custam bem mais para guardar dados arquivados por anos.",
        topic: "Armazenamento",
        options: [
            ["S3 Glacier Flexible Retrieval", true],
            ["S3 Glacier Deep Archive", false],
            ["S3 Standard", false],
            ["Amazon Elastic File System (Amazon EFS)", false],
        ],
    },
    {
        statement: "Para quais finalidades o Amazon S3 pode ser usado? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 pode hospedar sites estáticos servindo HTML, CSS e JavaScript direto do bucket e é uma origem comum para o CloudFront entregar mídia pelos locais de borda. Sites com uso intenso de CPU pedem computação como o EC2, volume de inicialização é papel do EBS e processamento de fluxos de dados é função do Amazon Kinesis.",
        topic: "Armazenamento",
        options: [
            ["Hospedagem de sites estáticos com HTML, CSS e JavaScript", true],
            ["Hospedagem de sites que exigem uso intenso e contínuo de CPU", false],
            ["Volume de inicialização para instâncias do Amazon EC2", false],
            ["Origem de mídia para distribuições do Amazon CloudFront", true],
            ["Processamento de fluxos de dados em qualquer escala", false],
        ],
    },
    {
        statement:
            "Uma empresa planeja migrar para a AWS um banco de dados com alta atividade de leitura e gravação. Qual é a opção de armazenamento mais adequada?",
        explanation:
            "O Amazon EBS oferece volumes de armazenamento em bloco anexados a instâncias EC2, com a baixa latência de E/S que bancos com muita leitura e gravação exigem. O Storage Gateway conecta ambientes on-premises à nuvem, o S3 é armazenamento de objetos e o S3 Glacier Deep Archive serve para arquivamento de longo prazo.",
        topic: "Armazenamento",
        options: [
            ["AWS Storage Gateway", false],
            ["Amazon S3", false],
            ["Amazon EBS", true],
            ["Amazon S3 Glacier Deep Archive", false],
        ],
    },
    {
        statement: "O que o AWS Service Catalog oferece às organizações?",
        explanation:
            "O AWS Service Catalog permite criar e gerenciar catálogos de serviços de TI aprovados, padronizando a governança e o autoatendimento. Descrições e casos de uso estão na documentação da AWS, explorar catálogos de software lembra o AWS Marketplace e usar linguagens de programação para definir infraestrutura é o AWS CDK.",
        topic: "Ferramentas e suporte",
        options: [
            ["Permite encontrar rapidamente descrições e casos de uso dos serviços da AWS", false],
            ["Permite explorar os diferentes catálogos de serviços oferecidos pela AWS", false],
            ["Simplifica a organização e a governança de serviços de TI comumente usados", true],
            ["Permite implantar infraestrutura usando linguagens de programação conhecidas", false],
        ],
    },
    {
        statement:
            "Quais fatores devem ser considerados ao escolher a tecnologia de banco de dados mais adequada para uma carga de trabalho? (Selecione DUAS opções.)",
        explanation:
            "O volume de leituras e gravações por segundo define a vazão necessária, e a natureza das consultas indica se o melhor é um banco relacional (JOINs complexos) ou NoSQL (buscas por chave). Zonas de Disponibilidade tratam de alta disponibilidade, soberania dos dados influencia a escolha da Região e usuários do IAM tratam de acesso.",
        topic: "Banco de dados",
        options: [
            ["A quantidade de Zonas de Disponibilidade da Região", false],
            ["Os requisitos de soberania dos dados", false],
            ["O número de leituras e gravações por segundo", true],
            ["A natureza das consultas que serão executadas", true],
            ["O número de usuários do IAM da conta da AWS", false],
        ],
    },
    {
        statement:
            "Qual das opções a seguir NÃO é uma característica do Amazon Elastic Compute Cloud (Amazon EC2)?",
        explanation:
            "O Amazon EC2 fornece servidores virtuais cujo sistema operacional e software ficam sob gestão do cliente, então é um serviço baseado em servidor, e não serverless como o AWS Lambda. Eliminar o investimento inicial em hardware, iniciar quantos servidores forem necessários e escalar a capacidade são características reais do EC2.",
        topic: "Computação",
        options: [
            ["O Amazon EC2 é considerado um serviço sem servidor (serverless)", true],
            ["O Amazon EC2 elimina a necessidade de investir em hardware antecipadamente", false],
            ["O Amazon EC2 permite iniciar quantos servidores virtuais forem necessários", false],
            ["O Amazon EC2 oferece capacidade de computação escalável", false],
        ],
    },
    {
        statement:
            "Qual serviço de computação da AWS executa código somente quando é acionado por eventos?",
        explanation:
            "O AWS Lambda é o serviço de computação sem servidor que executa código em resposta a eventos, como uma requisição HTTP ou o upload de um arquivo, e cobra só pelo tempo de execução. Amazon Lightsail, AWS Elastic Beanstalk e Amazon EC2 mantêm servidores em funcionamento contínuo, mesmo sem eventos.",
        topic: "Computação",
        options: [
            ["AWS Lambda", true],
            ["Amazon Lightsail", false],
            ["AWS Elastic Beanstalk", false],
            ["Amazon EC2", false],
        ],
    },
    {
        statement:
            "Assim como os fornecedores tradicionais de TI, a AWS oferece uma grande variedade de servidores virtuais para atender às necessidades dos clientes. Como esses servidores virtuais são chamados na AWS?",
        explanation:
            "Na AWS, os servidores virtuais são as instâncias do Amazon EC2, que oferecem capacidade de computação redimensionável. Snapshots do EBS são cópias pontuais de volumes, a VPC é uma rede virtual isolada e uma AMI é o modelo usado para iniciar instâncias, e não o servidor em si.",
        topic: "Computação",
        options: [
            ["Snapshots do Amazon EBS", false],
            ["Amazon VPC", false],
            ["Imagens de máquina da Amazon (AMIs)", false],
            ["Instâncias do Amazon EC2", true],
        ],
    },
    {
        statement: "Quais são os benefícios de usar o Amazon DynamoDB? (Selecione DUAS opções.)",
        explanation:
            "O DynamoDB é um banco NoSQL sem servidor que ajusta automaticamente a vazão conforme o tráfego e mantém latência de milissegundos de um dígito em qualquer escala. Ele não tem instâncias para redimensionar, não é relacional e não executa mecanismos de terceiros como CouchDB ou MongoDB.",
        topic: "Banco de dados",
        options: [
            ["Escala automaticamente para atender à vazão de leitura e gravação", true],
            ["Oferece instâncias redimensionáveis que acompanham a demanda atual", false],
            ["Suporta modelos de dados relacionais e não relacionais na mesma tabela", false],
            ["Oferece latência extremamente baixa, de milissegundos de um dígito", true],
            ["Suporta mecanismos NoSQL populares, como CouchDB e MongoDB", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode ser usado para enviar mensagens de texto (SMS) promocionais para clientes em diversos países?",
        explanation:
            "O Amazon SNS envia notificações por SMS, e-mail e push para assinantes e usuários finais em diversos países, inclusive mensagens promocionais. O Amazon SES envia apenas e-mails, o Amazon MQ é um broker de mensagens entre aplicações e o Amazon SQS é uma fila para desacoplar componentes.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SES", false],
            ["Amazon MQ", false],
            ["Amazon SNS", true],
            ["Amazon SQS", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir permitem criar novas instâncias do Amazon RDS? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudFormation cria instâncias do RDS a partir de modelos de infraestrutura como código, e o Console de Gerenciamento da AWS permite criá-las pela interface gráfica. O CodeDeploy implanta código de aplicação, o CloudTrail só registra as chamadas de API e o AWS DMS migra dados para um banco que já existe.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CodeDeploy", false],
            ["AWS CloudTrail", false],
            ["AWS CloudFormation", true],
            ["AWS Database Migration Service (AWS DMS)", false],
            ["Console de Gerenciamento da AWS", true],
        ],
    },
    {
        statement:
            "Qual recurso do Amazon RDS permite tirar parte da carga de leitura da instância principal do banco de dados?",
        explanation:
            "As réplicas de leitura do Amazon RDS são cópias somente leitura que atendem consultas e aliviam a instância principal. Snapshots e backups automatizados servem para recuperar dados, e a instância em espera de uma implantação Multi-AZ existe para failover e não atende leituras.",
        topic: "Banco de dados",
        options: [
            ["Snapshots do banco de dados", false],
            ["Implantação Multi-AZ com uma instância em espera", false],
            ["Backups automatizados", false],
            ["Réplicas de leitura", true],
        ],
    },
    {
        statement:
            "Uma empresa hospeda uma aplicação web em uma única instância do Amazon EC2, que chega perto de 100% de uso de CPU nos horários de pico. Em vez de aumentar o servidor verticalmente, a empresa decidiu executar três instâncias EC2 em paralelo e dividir o tráfego entre elas. Qual serviço da AWS deve ser usado para distribuir o tráfego de forma equilibrada?",
        explanation:
            "O Application Load Balancer distribui as requisições HTTP e HTTPS entre várias instâncias EC2 saudáveis, equilibrando a carga. O Global Accelerator direciona usuários globais pela rede da AWS, o CloudFront entrega conteúdo em cache nos locais de borda e o Auto Scaling ajusta a quantidade de instâncias, sem distribuir o tráfego.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Global Accelerator", false],
            ["Application Load Balancer", true],
            ["Amazon CloudFront", false],
            ["Grupo do Amazon EC2 Auto Scaling", false],
        ],
    },
    {
        statement:
            "Qual abordagem ajuda a eliminar o erro humano e a automatizar a criação e a atualização do ambiente na AWS?",
        explanation:
            "Com infraestrutura como código, ferramentas como o AWS CloudFormation criam e atualizam recursos a partir de modelos, de forma repetível e sem passos manuais. Testes automatizados validam código de aplicação, o CodeDeploy só implanta aplicações e um host dedicado muda o isolamento físico, sem automatizar nada.",
        topic: "Ferramentas e suporte",
        options: [
            ["Usar ferramentas de automação de testes de software", false],
            ["Usar o AWS CodeDeploy para criar e automatizar o ambiente na AWS", false],
            ["Usar código para provisionar e operar a infraestrutura na AWS", true],
            ["Migrar todas as aplicações para um host dedicado", false],
        ],
    },
    {
        statement:
            "Ao planejar uma nova implantação, uma equipe precisa escolher a Região da AWS que vai hospedar os recursos. Quais fatores devem ser considerados? (Selecione DUAS opções.)",
        explanation:
            "A soberania dos dados pode exigir que as informações fiquem em determinado país, e os preços dos serviços variam entre Regiões. Todas as Regiões seguem o mesmo padrão de segurança, a quantidade de VPCs é decidida depois da escolha e a conta da AWS é global, sem vínculo com uma Região.",
        topic: "Conceitos e arquitetura",
        options: [
            ["O nível de segurança oferecido pela Região", false],
            ["Os requisitos de soberania dos dados", true],
            ["O custo dos serviços na Região", true],
            ["O número planejado de VPCs", false],
            ["A Região em que a conta da AWS foi criada", false],
        ],
    },
    {
        statement: "Qual é uma vantagem de usar grupos do Amazon EC2 Auto Scaling?",
        explanation:
            "Um grupo do Auto Scaling mantém e ajusta a quantidade de instâncias EC2 distribuídas em várias Zonas de Disponibilidade, o que aumenta a disponibilidade e a tolerância a falhas. Cache em locais de borda é o CloudFront, o grupo atua dentro de uma única Região e distribuir tráfego é papel do Elastic Load Balancing.",
        topic: "Computação",
        options: [
            ["Armazena respostas em cache nos locais de borda para reduzir a latência", false],
            [
                "Escala instâncias EC2 em várias Zonas de Disponibilidade, aumentando a tolerância a falhas",
                true,
            ],
            [
                "Escala instâncias EC2 em várias Regiões para reduzir a latência de usuários globais",
                false,
            ],
            [
                "Distribui o tráfego da aplicação entre várias Zonas de Disponibilidade para melhorar o desempenho",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer estender o armazenamento do seu data center para a AWS de forma econômica, dando às aplicações locais acesso ao armazenamento na nuvem. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O AWS Storage Gateway é um serviço de armazenamento híbrido que dá às aplicações on-premises acesso ao armazenamento na AWS, estendendo a capacidade local a baixo custo. O Transfer Family e o DataSync apenas movem arquivos entre ambientes, e os volumes do Amazon EBS só podem ser anexados a instâncias EC2.",
        topic: "Armazenamento",
        options: [
            ["AWS Transfer Family", false],
            ["AWS Storage Gateway", true],
            ["AWS DataSync", false],
            ["Amazon EBS", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma plataforma de armazenamento em nuvem para seus clientes e precisa de um serviço cuja capacidade cresça automaticamente, com o menor custo possível. Qual serviço de armazenamento da AWS deve ser usado?",
        explanation:
            "O Amazon S3 oferece armazenamento de objetos praticamente ilimitado, que cresce automaticamente e cobra apenas pelo que está armazenado. Volumes do EBS e sistemas do FSx for Windows File Server têm capacidade provisionada, e o Storage Gateway conecta ambientes on-premises à nuvem, sem servir de base para a plataforma.",
        topic: "Armazenamento",
        options: [
            ["Amazon S3", true],
            ["Amazon EBS", false],
            ["Amazon FSx for Windows File Server", false],
            ["AWS Storage Gateway", false],
        ],
    },
    {
        statement:
            "Quais das ofertas da AWS a seguir são serviços sem servidor (serverless)? (Selecione DUAS opções.)",
        explanation:
            "O AWS Lambda executa código sem servidores para provisionar, e o Amazon DynamoDB é um banco NoSQL sem servidor que escala sozinho. No Amazon EC2 o cliente gerencia as instâncias, o Elastic Beanstalk cria instâncias EC2 para a aplicação e o RDS for MySQL roda em classes de instância escolhidas pelo cliente.",
        topic: "Computação",
        options: [
            ["Amazon EC2", false],
            ["AWS Lambda", true],
            ["Amazon DynamoDB", true],
            ["AWS Elastic Beanstalk", false],
            ["Amazon RDS for MySQL", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite automatizar a configuração, o gerenciamento e a aplicação de patches em instâncias do Amazon EC2 em grande escala?",
        explanation:
            "O AWS Systems Manager automatiza tarefas operacionais em frotas de instâncias, como gerenciamento de configuração, aplicação de patches (Patch Manager) e execução de comandos, sem acessar cada servidor. O AWS Config registra e avalia configurações, o Auto Scaling ajusta a quantidade de instâncias e o CloudFormation provisiona recursos.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Config", false],
            ["AWS Systems Manager", true],
            ["Amazon EC2 Auto Scaling", false],
            ["AWS CloudFormation", false],
        ],
    },
    {
        statement:
            "Um cliente quer armazenar objetos no ambiente da AWS e permitir que eles sejam baixados pela internet. Qual serviço da AWS pode ser usado para isso?",
        explanation:
            "O Amazon S3 armazena objetos que podem ser disponibilizados para download pela internet por meio de URLs, controlados por políticas de acesso ou URLs pré-assinadas. Volumes do EBS e o armazenamento de instância são discos de instâncias EC2, e o EFS é um sistema de arquivos montado via NFS, sem acesso público direto.",
        topic: "Armazenamento",
        options: [
            ["Amazon EBS", false],
            ["Amazon EFS", false],
            ["Amazon S3", true],
            ["Armazenamento de instância do EC2", false],
        ],
    },
    {
        statement:
            "Uma equipe quer acompanhar métricas das requisições HTTP e HTTPS feitas a uma distribuição do Amazon CloudFront, como o total de requisições e a taxa de erros, e criar alarmes com base nelas. Qual serviço deve ser usado?",
        explanation:
            "O Amazon CloudWatch recebe as métricas do CloudFront, como número de requisições e taxas de erro 4xx e 5xx, e permite criar painéis e alarmes. O AWS WAF filtra e bloqueia requisições conforme regras, o AWS Trusted Advisor recomenda boas práticas e o AWS CloudTrail registra chamadas de API.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS WAF", false],
            ["Amazon CloudWatch", true],
            ["AWS Trusted Advisor", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Uma organização tem uma aplicação legada monolítica e quer desacoplar seus componentes: cada parte deve enviar mensagens para uma fila, onde elas ficam armazenadas até que outro componente as processe no próprio ritmo. Qual serviço da AWS atende a esse requisito?",
        explanation:
            "O Amazon SQS é uma fila de mensagens gerenciada: as mensagens ficam armazenadas até serem consumidas, o que permite que os componentes funcionem de forma independente. O SNS envia cada mensagem a vários assinantes (pub/sub), o EventBridge roteia eventos por regras e o Step Functions orquestra fluxos de trabalho.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SQS", true],
            ["Amazon SNS", false],
            ["Amazon EventBridge", false],
            ["AWS Step Functions", false],
        ],
    },
    {
        statement:
            "As Zonas de Disponibilidade de uma Região são interligadas por conexões de baixa latência. Qual é um benefício dessas conexões?",
        explanation:
            "A baixa latência entre as Zonas de Disponibilidade permite replicar dados de forma síncrona, confirmando a gravação em outra zona sem prejudicar o desempenho. Conexão privada com o data center é o AWS Direct Connect, alta disponibilidade global exige várias Regiões e provisionar recursos automaticamente é papel do Auto Scaling.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Criar uma conexão privada com o data center da empresa", false],
            ["Alcançar alta disponibilidade em escala global", false],
            ["Automatizar o provisionamento de novos recursos de computação", false],
            ["Tornar possível a replicação síncrona dos dados", true],
        ],
    },
    {
        statement:
            "Quais afirmações sobre as linguagens de programação compatíveis com o AWS Lambda são verdadeiras? (Selecione DUAS opções.)",
        explanation:
            "O Lambda tem runtimes nativos para linguagens como Node.js, Python, Java, .NET e Ruby, e aceita outras linguagens por meio de runtimes personalizados que usam a Runtime API. Ele não depende de plugins de conversão, não é uma linguagem e sua função principal é justamente executar código.",
        topic: "Computação",
        options: [
            [
                "O Lambda só aceita Python e Node.js, mas plugins de terceiros convertem outras linguagens",
                false,
            ],
            [
                "O Lambda oferece suporte nativo a várias linguagens, como Node.js, Python e Java",
                true,
            ],
            [
                "O Lambda é a linguagem de programação proprietária da AWS para microsserviços",
                false,
            ],
            [
                "O Lambda não trabalha com linguagens de programação, pois é um serviço sem servidor",
                false,
            ],
            [
                "O Lambda aceita qualquer linguagem por meio de um runtime personalizado (Runtime API)",
                true,
            ],
        ],
    },
    {
        statement: "O que o AWS X-Ray permite fazer? (Selecione DUAS opções.)",
        explanation:
            "O AWS X-Ray rastreia as requisições enquanto elas passam pelos componentes da aplicação, mostrando gargalos e erros, o que ajuda a analisar e melhorar o desempenho. Desacoplar componentes é uma decisão de arquitetura, com filas como o SQS, e implantar aplicações em instâncias EC2 ou em servidores on-premises é papel do AWS CodeDeploy.",
        topic: "Ferramentas e suporte",
        options: [
            ["Desacoplar automaticamente os componentes de uma aplicação monolítica", false],
            ["Rastrear requisições para identificar problemas na aplicação", true],
            ["Ajudar a analisar e melhorar o desempenho da aplicação", true],
            ["Implantar aplicações em instâncias do Amazon EC2", false],
            ["Implantar aplicações em servidores on-premises", false],
        ],
    },
    {
        statement:
            "Qual afirmação sobre as Zonas de Disponibilidade e os locais de borda da AWS é verdadeira?",
        explanation:
            "Uma Zona de Disponibilidade é um conjunto isolado de data centers dentro de uma Região, enquanto os locais de borda formam uma rede separada, espalhada por mais de cem cidades e usada por serviços como o CloudFront. Locais de borda não ficam dentro de Zonas de Disponibilidade, nem o contrário, e área geográfica com várias zonas é a definição de Região.",
        topic: "Conceitos e arquitetura",
        options: [
            [
                "Os locais de borda ficam em Zonas de Disponibilidade separadas pelo mundo para atender clientes globais",
                false,
            ],
            [
                "Uma Zona de Disponibilidade fica dentro de um local de borda para distribuir conteúdo com baixa latência",
                false,
            ],
            [
                "Uma Zona de Disponibilidade é uma área geográfica com vários locais de borda isolados",
                false,
            ],
            [
                "Zonas de Disponibilidade ficam dentro de Regiões, e locais de borda existem em várias cidades do mundo",
                true,
            ],
        ],
    },
    {
        statement:
            "Um cliente planeja migrar seus bancos de dados Microsoft SQL Server para a AWS. Quais serviços da AWS ele pode usar para executar o SQL Server? (Selecione DUAS opções.)",
        explanation:
            "O SQL Server pode rodar no Amazon EC2, instalado e gerenciado pelo cliente, ou no Amazon RDS for SQL Server, com patches e backups gerenciados pela AWS. O DynamoDB é um banco NoSQL próprio da AWS, o AWS DMS apenas migra os dados e o Lambda executa funções orientadas a eventos, sem hospedar bancos.",
        topic: "Banco de dados",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon EC2", true],
            ["Amazon RDS", true],
            ["AWS Database Migration Service (AWS DMS)", false],
            ["AWS Lambda", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS monitora a disponibilidade de endpoints e desvia automaticamente o tráfego dos recursos que apresentam falha?",
        explanation:
            "O Amazon Route 53 faz verificações de integridade (health checks) nos endpoints e, com o roteamento de failover, deixa de direcionar usuários para os recursos que falharam. O CloudWatch monitora métricas mas não roteia tráfego, o Direct Connect cria um link dedicado com o data center e o API Gateway publica APIs.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Direct Connect", false],
            ["Amazon Route 53", true],
            ["Amazon CloudWatch", false],
            ["Amazon API Gateway", false],
        ],
    },
    {
        statement:
            "Uma empresa está desenvolvendo uma aplicação que vai usar reconhecimento facial para marcar pessoas em fotos automaticamente. Qual serviço da AWS deve ser usado para o reconhecimento facial?",
        explanation:
            "O Amazon Rekognition analisa imagens e vídeos com deep learning e oferece detecção e comparação de rostos, o que permite marcar pessoas em fotos automaticamente. O Comprehend analisa textos, o Textract extrai texto de documentos digitalizados e o Personalize gera recomendações personalizadas.",
        topic: "Machine learning",
        options: [
            ["Amazon Comprehend", false],
            ["Amazon Textract", false],
            ["Amazon Personalize", false],
            ["Amazon Rekognition", true],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são exemplos de bancos de dados gerenciados pela AWS? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Neptune (grafos) e o Amazon RDS for MySQL (relacional) são bancos gerenciados: a AWS cuida de provisionamento, patches, backups e recuperação. SQL Server ou MySQL instalados no EC2 e MongoDB em contêineres no EKS são bancos autogerenciados, em que essas tarefas ficam com o cliente.",
        topic: "Banco de dados",
        options: [
            ["Amazon Neptune", true],
            ["Microsoft SQL Server no EC2", false],
            ["MySQL no EC2", false],
            ["Amazon RDS for MySQL", true],
            ["MongoDB em contêineres no Amazon EKS", false],
        ],
    },
    {
        statement:
            "Quais são os principais benefícios de usar o AWS CloudFormation? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudFormation permite descrever toda a infraestrutura em um modelo de texto (JSON ou YAML) e provisionar e atualizar os recursos de forma repetível e controlada. Implantar aplicações sem cuidar da infraestrutura é o Elastic Beanstalk, permissões do IAM continuam definidas pelo cliente e compilar código é papel do AWS CodeBuild.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "Permite implantar aplicações sem se preocupar com a infraestrutura subjacente",
                false,
            ],
            ["Aplica automaticamente recursos avançados de segurança do IAM", false],
            ["Automatiza o provisionamento e a atualização da infraestrutura com segurança", true],
            ["Permite modelar toda a infraestrutura em um simples arquivo de texto", true],
            ["Compila e gera o build do código da aplicação rapidamente", false],
        ],
    },
    {
        statement:
            "Uma empresa hospeda cargas de trabalho críticas em uma Região da AWS. Para evitar perda de dados e garantir a continuidade do negócio, ela precisa manter uma cópia espelhada do ambiente atual em outra Região, e a política interna exige que esse ambiente de contingência fique disponível em minutos se a Região principal sofrer uma interrupção. Qual serviço da AWS atende a esses requisitos?",
        explanation:
            "O AWS Elastic Disaster Recovery replica continuamente os servidores para uma área de preparação em outra Região e inicia instâncias prontas em minutos durante uma interrupção. O Application Migration Service migra servidores, o AWS Backup restaura cópias de backup, sem ambiente em espera, e o DataSync só transfere arquivos.",
        topic: "Armazenamento",
        options: [
            ["AWS Elastic Disaster Recovery", true],
            ["AWS Application Migration Service", false],
            ["AWS Backup", false],
            ["AWS DataSync", false],
        ],
    },
    {
        statement:
            "Qual classe de armazenamento do Amazon S3 é a mais adequada para hospedar os arquivos estáticos de um site de e-commerce popular, com padrão de acesso estável e frequente?",
        explanation:
            "O S3 Standard é feito para dados acessados com frequência, com baixa latência e sem taxa de recuperação, ideal para arquivos de um site muito visitado. O Standard-IA cobra por recuperação, o Intelligent-Tiering compensa quando o padrão de acesso é imprevisível e o Glacier Deep Archive é para arquivamento raramente acessado.",
        topic: "Armazenamento",
        options: [
            ["S3 Standard-IA", false],
            ["S3 Intelligent-Tiering", false],
            ["S3 Glacier Deep Archive", false],
            ["S3 Standard", true],
        ],
    },
    {
        statement: "Qual das afirmações a seguir sobre a Amazon VPC é verdadeira?",
        explanation:
            "Na Amazon VPC, o cliente controla todo o ambiente de rede virtual: intervalos de IP, sub-redes, tabelas de rotas, gateways e grupos de segurança. Controlar o acesso de usuários aos recursos é papel do IAM, a configuração da VPC é responsabilidade do cliente e revisar a arquitetura é função da AWS Well-Architected Tool.",
        topic: "Rede e entrega de conteúdo",
        options: [
            [
                "A Amazon VPC permite controlar como os usuários interagem com todos os outros recursos da AWS",
                false,
            ],
            [
                "Os clientes da AWS têm controle total sobre o ambiente de rede virtual da sua Amazon VPC",
                true,
            ],
            [
                "A AWS é responsável por todos os detalhes de gerenciamento e configuração da Amazon VPC",
                false,
            ],
            [
                "A Amazon VPC ajuda os clientes a revisar a arquitetura na AWS e adotar boas práticas",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são baseadas em servidores, com instâncias que o cliente escolhe e dimensiona? (Selecione DUAS opções.)",
        explanation:
            "O Amazon RDS for PostgreSQL roda em classes de instância escolhidas pelo cliente, e os clusters do Amazon EMR são formados por instâncias EC2 para processar big data. Tabelas do DynamoDB, funções do Lambda e tarefas do Fargate são sem servidor: a AWS provisiona e gerencia toda a capacidade.",
        topic: "Computação",
        options: [
            ["Amazon RDS for PostgreSQL", true],
            ["Tabelas do Amazon DynamoDB", false],
            ["Funções do AWS Lambda", false],
            ["Tarefas do AWS Fargate", false],
            ["Clusters do Amazon EMR", true],
        ],
    },
    {
        statement: "Quais são casos de uso do Amazon EMR? (Selecione DUAS opções.)",
        explanation:
            "O Amazon EMR é uma plataforma gerenciada de clusters para executar frameworks de big data como Apache Spark e Hadoop, processando e analisando grandes volumes de dados. Backup barato é caso das classes S3 Glacier, mover exabytes do data center cabe a serviços de transferência de dados e contêineres Docker ficam com o Amazon ECS.",
        topic: "Ferramentas e suporte",
        options: [
            ["Fazer backup de grandes volumes de dados a um custo muito baixo", false],
            ["Mover dados em escala de exabytes de data centers on-premises para a AWS", false],
            ["Analisar e processar volumes muito grandes de dados em tempo hábil", true],
            ["Executar e escalar Apache Spark, Hadoop e outros frameworks de big data", true],
            ["Executar e gerenciar com facilidade contêineres Docker", false],
        ],
    },
    {
        statement:
            "No Amazon RDS, quais tarefas a AWS executa em nome do cliente? (Selecione DUAS opções.)",
        explanation:
            "No Amazon RDS, a AWS provisiona e configura a instância do banco e cuida do sistema operacional, incluindo patches e manutenção. Continuam com o cliente as regras dos grupos de segurança, os usuários e permissões de acesso ao banco e a otimização das consultas feitas pela aplicação.",
        topic: "Banco de dados",
        options: [
            ["Configuração inicial do banco de dados", true],
            ["Otimização das consultas SQL da aplicação", false],
            ["Gerenciamento do sistema operacional", true],
            ["Gerenciamento de usuários e permissões de acesso ao banco", false],
            ["Definição das regras dos grupos de segurança", false],
        ],
    },
    {
        statement: "Qual é o principal benefício do AWS Storage Gateway?",
        explanation:
            "O AWS Storage Gateway conecta aplicações on-premises ao armazenamento da AWS por protocolos padrão como NFS, SMB e iSCSI, guardando os dados no Amazon S3 e em outros serviços. Jobs de ETL são do AWS Glue, transferência por SFTP é do AWS Transfer Family e chaves em hardware dedicado são do AWS CloudHSM.",
        topic: "Armazenamento",
        options: [
            ["Automatiza a criação, a manutenção e a execução de jobs de ETL", false],
            ["Transfere arquivos por SFTP diretamente para o Amazon S3", false],
            ["Integra ambientes de TI on-premises ao armazenamento na nuvem", true],
            ["Oferece armazenamento de chaves em hardware para conformidade regulatória", false],
        ],
    },
    {
        statement:
            "Qual serviço pode ser usado para direcionar o tráfego dos usuários de todo o mundo ao endpoint que oferece o melhor desempenho para a aplicação?",
        explanation:
            "O AWS Global Accelerator leva o tráfego dos usuários pela rede global da AWS até o endpoint saudável com melhor desempenho, usando IPs estáticos. O Transit Gateway interliga VPCs e redes on-premises, o DAX é um cache em memória para o DynamoDB e o S3 Transfer Acceleration só acelera transferências para buckets do S3.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Global Accelerator", true],
            ["AWS Transit Gateway", false],
            ["Amazon DynamoDB Accelerator (DAX)", false],
            ["Amazon S3 Transfer Acceleration", false],
        ],
    },
    {
        statement:
            "Uma aplicação de IoT em tempo real precisa de latência inferior a um milissegundo no acesso aos dados. Qual serviço da AWS deve ser utilizado?",
        explanation:
            "O Amazon ElastiCache é um armazenamento de dados em memória que responde em menos de um milissegundo, ideal para aplicações em tempo real. O Redshift é um data warehouse para análises, o Athena consulta dados no S3 com SQL em segundos e o OpenSearch Service é voltado a busca e análise de logs.",
        topic: "Banco de dados",
        options: [
            ["Amazon Redshift", false],
            ["Amazon Athena", false],
            ["Amazon OpenSearch Service", false],
            ["Amazon ElastiCache", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS ajuda os desenvolvedores a compilar e testar o código de suas aplicações?",
        explanation:
            "O AWS CodeBuild é um serviço de integração contínua totalmente gerenciado que compila o código-fonte, executa testes e gera pacotes prontos para implantação. O CodeDeploy automatiza implantações, o CodeCommit hospeda repositórios Git e o CodePipeline orquestra as etapas do pipeline de entrega.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CodeDeploy", false],
            ["AWS CodeCommit", false],
            ["AWS CodePipeline", false],
            ["AWS CodeBuild", true],
        ],
    },
    {
        statement:
            "Uma empresa enfrenta muitos problemas com sua central de atendimento atual e quer oferecer um serviço melhor aos clientes. Qual serviço da AWS fornece uma central de atendimento baseada na nuvem?",
        explanation:
            "O Amazon Connect é uma central de atendimento em nuvem que pode ser configurada em minutos, com cobrança pelo uso e sem infraestrutura para gerenciar. O Direct Connect é uma conexão de rede dedicada com a AWS, o WorkSpaces oferece desktops virtuais e o Amazon SES envia e-mails em grande volume.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Direct Connect", false],
            ["Amazon Connect", true],
            ["Amazon WorkSpaces", false],
            ["Amazon Simple Email Service (Amazon SES)", false],
        ],
    },
    {
        statement:
            "Você gerencia um blog na AWS com três ambientes: desenvolvimento, teste e produção. O que permite agrupar os recursos de cada ambiente para visualizá-los e gerenciá-los em um só lugar?",
        explanation:
            "O AWS Resource Groups agrupa recursos por tags ou por pilha do CloudFormation, permitindo ver e gerenciar juntos os recursos de cada ambiente. Grupos de posicionamento definem como as instâncias EC2 ficam no hardware, o console sozinho não cria visões por ambiente e o Service Catalog publica produtos aprovados.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Resource Groups", true],
            ["Grupos de posicionamento do Amazon EC2", false],
            ["Console de Gerenciamento da AWS", false],
            ["AWS Service Catalog", false],
        ],
    },
    {
        statement:
            "Uma aplicação web está com problemas de desempenho e demora muito para carregar. Qual serviço da AWS ajuda a identificar os gargalos para corrigir esses problemas?",
        explanation:
            "O AWS X-Ray rastreia as requisições enquanto elas passam pelos componentes da aplicação e mostra onde estão os gargalos e a origem da latência. O Detective investiga achados de segurança, o Security Hub centraliza alertas de segurança e o Shield protege contra ataques DDoS.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Detective", false],
            ["AWS X-Ray", true],
            ["AWS Security Hub", false],
            ["AWS Shield", false],
        ],
    },
    {
        statement:
            "O Amazon RDS oferece vários mecanismos de banco de dados à escolha. Qual das opções a seguir NÃO é um mecanismo compatível com o Amazon RDS?",
        explanation:
            "O Teradata não está disponível no Amazon RDS. Os mecanismos compatíveis são Amazon Aurora (MySQL e PostgreSQL), MySQL, MariaDB, PostgreSQL, Oracle, Microsoft SQL Server e Db2, então PostgreSQL, Oracle e SQL Server podem ser escolhidos ao criar uma instância de banco de dados no RDS.",
        topic: "Banco de dados",
        options: [
            ["PostgreSQL", false],
            ["Oracle", false],
            ["Microsoft SQL Server", false],
            ["Teradata", true],
        ],
    },
    {
        statement:
            "Uma empresa usa um software de banco de dados relacional que não está entre os mecanismos oferecidos pelos serviços gerenciados da AWS e quer instalá-lo e administrá-lo por conta própria. Qual serviço deve usar?",
        explanation:
            "O Amazon EC2 oferece servidores virtuais com acesso ao sistema operacional, onde o cliente instala e administra qualquer software de banco de dados. O RDS e o Aurora são gerenciados e aceitam só os mecanismos oferecidos pela AWS, e o DynamoDB é um banco NoSQL gerenciado, sem instalação de software.",
        topic: "Banco de dados",
        options: [
            ["Amazon EC2", true],
            ["Amazon RDS", false],
            ["Amazon Aurora", false],
            ["Amazon DynamoDB", false],
        ],
    },
    {
        statement:
            "Em alguns serviços, a AWS replica os dados automaticamente em várias Zonas de Disponibilidade para manter a tolerância a falhas se um servidor ou uma Zona de Disponibilidade inteira falhar. Quais serviços fazem essa replicação automaticamente? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 Standard grava os objetos em pelo menos três Zonas de Disponibilidade e o DynamoDB replica as tabelas em várias zonas da Região, sem configuração extra. Volumes do EBS e o EFS One Zone ficam em uma única zona, e o armazenamento de instância é efêmero e não tem réplica.",
        topic: "Armazenamento",
        options: [
            ["Armazenamento de instância do Amazon EC2", false],
            ["Amazon S3 (classe S3 Standard)", true],
            ["Tabelas do Amazon DynamoDB", true],
            ["Volumes do Amazon EBS", false],
            ["Sistemas de arquivos do Amazon EFS One Zone", false],
        ],
    },
    {
        statement:
            "Como é possível recuperar objetos do Amazon S3 que foram excluídos ou sobrescritos por engano?",
        explanation:
            "Com o versionamento do S3, o bucket guarda todas as versões de cada objeto, então uma exclusão ou sobrescrita acidental pode ser desfeita restaurando a versão anterior. A política de bucket controla permissões, o ciclo de vida move ou expira objetos e a criptografia protege a confidencialidade, sem recuperar dados.",
        topic: "Armazenamento",
        options: [
            ["Habilitando o versionamento do S3 no bucket", true],
            ["Configurando uma política de bucket do S3", false],
            ["Configurando uma política de ciclo de vida do S3", false],
            ["Ativando a criptografia padrão do bucket com o AWS KMS", false],
        ],
    },
    {
        statement: "Qual das opções a seguir NÃO é um benefício do AWS Lambda?",
        explanation:
            "O Lambda é sem servidor: a AWS cuida da infraestrutura e o cliente não tem acesso ao sistema operacional, o que é característica do Amazon EC2. Executar código sem gerenciar servidores, escalar automaticamente conforme as requisições e não cobrar quando o código está parado são benefícios reais do Lambda.",
        topic: "Computação",
        options: [
            ["Executa código sem provisionar nem gerenciar servidores", false],
            ["Escala automaticamente conforme o número de requisições", false],
            ["Não cobra nada enquanto o código não está em execução", false],
            ["Permite administrar o sistema operacional do servidor", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS é um sistema gerenciado de repositórios que permite armazenar, versionar e gerenciar o código das aplicações?",
        explanation:
            "O AWS CodeCommit é um serviço gerenciado de controle de versão que hospeda repositórios Git privados, com armazenamento seguro e histórico do código. O CodePipeline orquestra as etapas de entrega, o CodeBuild compila e testa o código e o CodeDeploy automatiza a implantação das aplicações.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CodePipeline", false],
            ["AWS CodeCommit", true],
            ["AWS CodeBuild", false],
            ["AWS CodeDeploy", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode direcionar os usuários finais para a Região da AWS que oferece a menor latência, reduzindo o tempo de resposta da aplicação?",
        explanation:
            "O Amazon Route 53 oferece roteamento baseado em latência, que responde às consultas DNS com o endpoint da Região que dá a menor latência ao usuário. O CloudFront entrega conteúdo em cache nos locais de borda, o Elastic Load Balancing distribui tráfego dentro de uma Região e o Direct Connect liga o data center à AWS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon CloudFront", false],
            ["Elastic Load Balancing", false],
            ["AWS Direct Connect", false],
            ["Amazon Route 53", true],
        ],
    },
    {
        statement:
            "Quais procedimentos podem reduzir a latência quando os usuários finais baixam os arquivos de mídia de uma aplicação? (Selecione DUAS opções.)",
        explanation:
            "Guardar a mídia na Região mais próxima encurta a distância percorrida pelos dados, e o CloudFront entrega os arquivos do S3 a partir de locais de borda perto dos usuários. Mais capacidade no servidor e réplicas em várias zonas não mudam essa distância, e o S3 Glacier Flexible Retrieval deixa a recuperação mais lenta.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Armazenar os arquivos de mídia na Região mais próxima dos usuários finais", true],
            [
                "Guardar os arquivos em um volume EBS adicional e aumentar a capacidade do servidor",
                false,
            ],
            ["Replicar os arquivos de mídia em pelo menos duas Zonas de Disponibilidade", false],
            ["Mover os arquivos de mídia para a classe S3 Glacier Flexible Retrieval", false],
            ["Armazenar os arquivos no Amazon S3 e distribuí-los com o Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "Uma empresa quer usar o Amazon Elastic Container Service (Amazon ECS) para executar suas aplicações em contêineres. Por exigência de conformidade, ela precisa manter visibilidade e controle totais sobre o cluster de servidores subjacente. Qual tipo de inicialização do Amazon ECS atende a esses requisitos?",
        explanation:
            "No tipo de inicialização EC2, os contêineres rodam em instâncias EC2 que a própria empresa provisiona e gerencia, com controle sobre tipo de instância, sistema operacional e configuração do cluster. No Fargate a AWS gerencia os servidores e esconde o cluster, e Lightsail e Lambda não são tipos de inicialização do ECS.",
        topic: "Computação",
        options: [
            ["Tipo de inicialização EC2", true],
            ["Tipo de inicialização Fargate", false],
            ["Tipo de inicialização Lightsail", false],
            ["Tipo de inicialização Lambda", false],
        ],
    },
    {
        statement:
            "As instâncias do Amazon EC2 são conceitualmente parecidas com servidores tradicionais, mas usá-las da mesma forma que um servidor físico é só o ponto de partida. Quais são os principais benefícios de usar instâncias do Amazon EC2 em vez de servidores tradicionais? (Selecione DUAS opções.)",
        explanation:
            "Com o EC2, a empresa distribui instâncias por várias Zonas de Disponibilidade e as substitui rapidamente, o que facilita arquiteturas tolerantes a falhas, e ajusta a capacidade em minutos, e não em semanas de compra de hardware. Acesso remoto e controle de acesso à rede existem nos dois cenários, e backups exigem configuração.",
        topic: "Computação",
        options: [
            ["Facilitam arquiteturas com tolerância a falhas", true],
            ["Oferecem acesso remoto transparente à empresa", false],
            ["Impedem que usuários não autorizados entrem na rede", false],
            ["Fazem backup automático dos dados sem configuração", false],
            ["Podem ser dimensionadas manualmente em menos tempo", true],
        ],
    },
    {
        statement:
            "Uma empresa executa uma grande aplicação web que precisa estar sempre disponível. A aplicação fica lenta quando o uso de CPU passa de 60%. Como a empresa pode ser avisada quando o uso de CPU de qualquer instância EC2 da conta atingir 60%?",
        explanation:
            "Os alarmes do Amazon CloudWatch acompanham métricas como a utilização de CPU e disparam notificações ou ações quando um limite é atingido. O CloudFront é uma rede de entrega de conteúdo, o AWS Config registra configurações dos recursos e não métricas de desempenho, e o SNS só entrega a notificação que o alarme gera.",
        topic: "Ferramentas e suporte",
        options: [
            ["Usar o Amazon CloudFront para monitorar o uso de CPU das instâncias", false],
            ["Definir no AWS Config um limite de CPU de 60% para receber notificações", false],
            ["Criar alarmes do Amazon CloudWatch que avisem quando a CPU atingir 60%", true],
            ["Usar o Amazon SNS para monitorar a utilização de CPU dos servidores", false],
        ],
    },
    {
        statement:
            "Uma aplicação usa um esquema de dados relacional e precisa de consultas com junções (joins) entre tabelas e de transações complexas executadas com frequência. Qual serviço é o mais indicado?",
        explanation:
            "O Amazon RDS é um banco de dados relacional gerenciado, com SQL, junções entre tabelas e transações ACID para cargas transacionais. O Redshift é um data warehouse para análises, o Athena consulta arquivos no S3 sem processar transações e o DynamoDB é um banco NoSQL de chave-valor que não faz junções.",
        topic: "Banco de dados",
        options: [
            ["Amazon RDS", true],
            ["Amazon Redshift", false],
            ["Amazon Athena", false],
            ["Amazon DynamoDB", false],
        ],
    },
    {
        statement:
            "O que deve ser considerado ao armazenar dados na classe S3 Glacier Deep Archive?",
        explanation:
            "O S3 Glacier Deep Archive é a classe mais barata do S3, feita para arquivamento de longo prazo, e a restauração de um objeto leva até 12 horas (ou até 48 horas na opção em lote). Ela aceita dados em qualquer formato, não serve para acesso frequente e é usada pela API do S3, sem anexar nada a instâncias.",
        topic: "Armazenamento",
        options: [
            ["Os dados precisam estar compactados antes do envio", false],
            ["A classe é indicada para dados acessados com frequência", false],
            ["A recuperação dos dados não é imediata e pode levar horas", true],
            ["É preciso anexar a classe a uma instância EC2 para gravar", false],
        ],
    },
    {
        statement:
            "Os volumes do Amazon EBS são replicados automaticamente dentro da mesma Zona de Disponibilidade. Qual benefício essa replicação oferece?",
        explanation:
            "Como cada volume do EBS é replicado dentro da sua Zona de Disponibilidade, a falha de um componente de hardware não causa perda de dados, o que garante durabilidade. Elasticidade é ajustar a capacidade à demanda, rastreabilidade é auditar ações e mudanças, e agilidade é a rapidez para provisionar recursos.",
        topic: "Armazenamento",
        options: [
            ["Elasticidade", false],
            ["Durabilidade", true],
            ["Rastreabilidade", false],
            ["Agilidade", false],
        ],
    },
    {
        statement: "Para que é usado o Amazon ElastiCache? (Selecione DUAS opções.)",
        explanation:
            "O Amazon ElastiCache é um serviço gerenciado de cache em memória (Valkey, Memcached e Redis OSS) que guarda dados acessados com frequência e reduz a latência, melhorando o desempenho das aplicações. Locais de borda são do CloudFront, backups de longo prazo ficam no S3 Glacier e distribuir requisições é papel do Elastic Load Balancing.",
        topic: "Banco de dados",
        options: [
            ["Fornecer um armazenamento de dados em memória", true],
            ["Reduzir custos de entrega usando locais de borda", false],
            ["Melhorar o desempenho de aplicações web com cache", true],
            ["Guardar arquivos de backup de longo prazo com baixo custo", false],
            ["Distribuir as requisições entre várias instâncias", false],
        ],
    },
    {
        statement:
            "A elasticidade da Nuvem AWS permite que os clientes economizem em comparação com provedores de hospedagem tradicionais. O que os clientes podem fazer para aproveitar essa elasticidade? (Selecione DUAS opções.)",
        explanation:
            "O EC2 Auto Scaling adiciona e remove instâncias conforme a demanda, e a computação sem servidor cobra só pelo tempo de execução, então nos dois casos o cliente paga apenas pelo que usa. Várias zonas ou outra Região melhoram a disponibilidade, e Instâncias Reservadas para o pico fixam uma capacidade que fica ociosa.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Implantar os recursos em várias Zonas de Disponibilidade", false],
            ["Usar o Amazon EC2 Auto Scaling conforme a demanda", true],
            ["Implantar os recursos em outra Região da AWS", false],
            ["Comprar Instâncias Reservadas para toda a capacidade de pico", false],
            ["Usar computação sem servidor sempre que possível", true],
        ],
    },
    {
        statement:
            "Qual é a quantidade máxima de dados que pode ser armazenada no Amazon S3 em uma única conta da AWS?",
        explanation:
            "O Amazon S3 oferece capacidade praticamente ilimitada: não há teto para o total de dados ou de objetos em uma conta, em um bucket ou em uma Região, e o serviço escala sozinho. O único limite de tamanho vale para cada objeto (até 50 TB), e não para o volume total armazenado.",
        topic: "Armazenamento",
        options: [
            ["100 petabytes por Região", false],
            ["Praticamente ilimitada", true],
            ["5 terabytes por bucket", false],
            ["10 exabytes por conta", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS entrega dados, vídeos, aplicações e APIs a usuários do mundo todo com baixa latência e altas velocidades de transferência?",
        explanation:
            "O Amazon CloudFront é a rede de entrega de conteúdo (CDN) da AWS: guarda cópias em cache em locais de borda pelo mundo e entrega dados, vídeos, aplicações e APIs com baixa latência. O Route 53 resolve nomes DNS, o Elastic Load Balancing distribui tráfego dentro de uma Região e o Direct Connect liga o data center à AWS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon Route 53", false],
            ["Elastic Load Balancing", false],
            ["Amazon CloudFront", true],
            ["AWS Direct Connect", false],
        ],
    },
    {
        statement:
            "Qual elemento da infraestrutura global da AWS é formado por um ou mais data centers distintos, cada um com energia, rede e conectividade redundantes, instalados em estruturas separadas?",
        explanation:
            "Uma Zona de Disponibilidade é formada por um ou mais data centers distintos, com energia, rede e conectividade redundantes, em instalações separadas dentro de uma Região. A Região é a área geográfica que reúne várias zonas, e os locais de borda e os caches regionais de borda guardam conteúdo do CloudFront perto dos usuários.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Regiões da AWS", false],
            ["Zonas de Disponibilidade", true],
            ["Locais de borda (pontos de presença)", false],
            ["Caches regionais de borda", false],
        ],
    },
    {
        statement: "A existência de várias Regiões na Nuvem AWS é um exemplo de qual conceito?",
        explanation:
            "As Regiões espalhadas pelo mundo fazem parte da infraestrutura global da AWS, junto com as Zonas de Disponibilidade e os locais de borda. Agilidade é a rapidez para provisionar e experimentar, elasticidade é ajustar os recursos à demanda e pagamento conforme o uso é um modelo de cobrança.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Agilidade", false],
            ["Infraestrutura global", true],
            ["Elasticidade", false],
            ["Pagamento conforme o uso", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode ser usado para iniciar instâncias manualmente, escolhendo a configuração conforme os requisitos de recursos?",
        explanation:
            "O Amazon EC2 permite iniciar manualmente instâncias de servidores virtuais, escolhendo tipo de instância, sistema operacional e demais configurações. O EBS fornece volumes de armazenamento em bloco para essas instâncias, o S3 guarda objetos e o ECS orquestra contêineres, sem ser a forma de iniciar instâncias.",
        topic: "Computação",
        options: [
            ["Amazon EBS", false],
            ["Amazon S3", false],
            ["Amazon EC2", true],
            ["Amazon ECS", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS permitem conectar uma nuvem privada virtual (Amazon VPC) a um data center on-premises? (Selecione DUAS opções.)",
        explanation:
            "O AWS Site-to-Site VPN cria um túnel criptografado pela internet entre a rede local e a VPC, e o AWS Direct Connect oferece uma conexão física dedicada e privada até a AWS. O CloudFront entrega conteúdo em locais de borda, o API Gateway publica APIs e o emparelhamento de VPC só liga uma VPC a outra.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Site-to-Site VPN", true],
            ["Amazon CloudFront", false],
            ["Amazon API Gateway", false],
            ["AWS Direct Connect", true],
            ["Emparelhamento de VPC (VPC peering)", false],
        ],
    },
    {
        statement:
            "Uma empresa implantou vários bancos de dados relacionais em instâncias do Amazon EC2. Todo mês, o fornecedor do software de banco de dados lança novos patches de segurança que precisam ser aplicados. Qual é a forma MAIS eficiente de aplicar esses patches?",
        explanation:
            "O AWS Systems Manager (com o Patch Manager e as janelas de manutenção) aplica patches nas instâncias EC2 de forma automática e agendada, sem acesso manual a cada servidor. Aplicar à mão não escala, o console do RDS só vale para bancos gerenciados pelo RDS e o AWS Config apenas avalia a conformidade, sem aplicar patches.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "Conectar-se a cada instância todo mês e aplicar manualmente os patches do fornecedor",
                false,
            ],
            [
                "Ativar a aplicação automática de patches das instâncias no console do Amazon RDS",
                false,
            ],
            [
                "Criar uma regra no AWS Config com o nível de patch exigido para as instâncias",
                false,
            ],
            [
                "Usar o AWS Systems Manager para automatizar os patches conforme um agendamento",
                true,
            ],
        ],
    },
    {
        statement:
            "Qual mecanismo permite que os desenvolvedores acessem os serviços da AWS a partir do código de suas aplicações?",
        explanation:
            "Os SDKs da AWS oferecem bibliotecas para linguagens como Python, Java, JavaScript e Go, que permitem chamar os serviços da AWS diretamente no código da aplicação. O console é uma interface gráfica no navegador, o CloudShell é um terminal no navegador para comandos e o CodePipeline automatiza pipelines de entrega.",
        topic: "Ferramentas e suporte",
        options: [
            ["SDKs da AWS", true],
            ["Console de Gerenciamento da AWS", false],
            ["AWS CodePipeline", false],
            ["AWS CloudShell", false],
        ],
    },
    {
        statement: "O que é o Amazon CloudWatch?",
        explanation:
            "O Amazon CloudWatch é o serviço de monitoramento da AWS: coleta métricas, logs e eventos dos recursos e aplicações e permite criar alarmes com limites e notificações. Registrar chamadas de API é papel do CloudTrail, rastrear requisições é do X-Ray e processar fluxos de dados em tempo real é do Amazon Kinesis.",
        topic: "Ferramentas e suporte",
        options: [
            [
                "Um serviço que registra as chamadas de API e a atividade da conta para fins de auditoria",
                false,
            ],
            [
                "Um serviço que rastreia as requisições entre os componentes da aplicação para achar gargalos",
                false,
            ],
            [
                "Um serviço que coleta métricas e dados operacionais dos recursos, com alarmes configuráveis",
                true,
            ],
            [
                "Um serviço que captura e processa fluxos de dados em tempo real de aplicações e sistemas",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual dos serviços a seguir escala automaticamente para acompanhar um aumento esperado no tráfego web?",
        explanation:
            "O Elastic Load Balancing aumenta sozinho a capacidade de receber requisições conforme o tráfego cresce e distribui a carga entre destinos saudáveis. O CodePipeline automatiza entregas de software, volumes do EBS são redimensionados manualmente e o Direct Connect tem velocidade de porta fixa, sem escalar com o tráfego.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS CodePipeline", false],
            ["Elastic Load Balancing", true],
            ["Volumes do Amazon EBS", false],
            ["Conexões do AWS Direct Connect", false],
        ],
    },
    {
        statement:
            "Qual serviço oferece armazenamento de objetos online, altamente durável e com capacidade praticamente ilimitada?",
        explanation:
            "O Amazon S3 é o armazenamento de objetos da AWS, com capacidade praticamente ilimitada e durabilidade projetada de 99,999999999% (11 noves). O Amazon EBS oferece volumes de armazenamento em bloco para instâncias EC2, e o Amazon EFS e o Amazon FSx fornecem sistemas de arquivos compartilhados.",
        topic: "Armazenamento",
        options: [
            ["Amazon S3", true],
            ["Amazon EBS", false],
            ["Amazon EFS", false],
            ["Amazon FSx", false],
        ],
    },
    {
        statement:
            "Quais são os principais componentes da infraestrutura global da AWS? (Selecione DUAS opções.)",
        explanation:
            "Regiões e Zonas de Disponibilidade são a base da infraestrutura global: cada Região é uma área geográfica com várias Zonas de Disponibilidade isoladas. Resource Groups organizam recursos por tags, grupos de segurança são firewalls virtuais e AMIs são modelos para iniciar instâncias.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Zonas de Disponibilidade", true],
            ["Resource Groups", false],
            ["Grupos de segurança", false],
            ["Regiões da AWS", true],
            ["Imagens de máquina da Amazon (AMIs)", false],
        ],
    },
    {
        statement:
            "Quais serviços ou recursos da AWS ajudam a integrar a Nuvem AWS a um data center on-premises, conectando as redes ou resolvendo nomes entre os dois ambientes? (Selecione DUAS opções.)",
        explanation:
            "O Route 53 pode direcionar usuários tanto para recursos na AWS quanto para servidores on-premises, e o gateway privado virtual é o lado da VPC na conexão VPN com o data center. O Classic Load Balancer só registra instâncias EC2, o Auto Scaling age apenas dentro da AWS e as métricas padrão do CloudWatch cobrem só recursos da AWS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon Route 53 (DNS)", true],
            ["Gateway privado virtual", true],
            ["Classic Load Balancer", false],
            ["Amazon EC2 Auto Scaling", false],
            ["Métricas padrão do Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Quais das opções a seguir são características do Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 guarda dados como objetos em buckets e foi projetado para 99,999999999% de durabilidade. Sistemas de arquivos em rede ou compartilhados descrevem serviços como o Amazon EFS, e o armazenamento local corresponde ao armazenamento de instância do EC2, que é temporário.",
        topic: "Armazenamento",
        options: [
            ["Um sistema de arquivos global", false],
            ["Um armazenamento de objetos", true],
            ["Um armazenamento local", false],
            ["Um sistema de arquivos em rede", false],
            ["Um armazenamento durável", true],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser combinados para entregar grandes volumes de vídeo on-line com a menor latência possível? (Selecione DUAS opções.)",
        explanation:
            "O Amazon S3 armazena os vídeos com alta durabilidade e escala, e o Amazon CloudFront os entrega a partir de locais de borda próximos dos espectadores. O Storage Gateway integra ambientes on-premises, o EFS é um sistema de arquivos compartilhado e o S3 Glacier Deep Archive é arquivamento, com recuperação em horas.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Storage Gateway", false],
            ["Amazon S3", true],
            ["Amazon EFS", false],
            ["S3 Glacier Deep Archive", false],
            ["Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "Quais recursos podem ser configurados no console da Amazon Virtual Private Cloud (Amazon VPC)? (Selecione DUAS opções.)",
        explanation:
            "Grupos de segurança e sub-redes são recursos nativos da VPC e aparecem no console da Amazon VPC. Distribuições do CloudFront e zonas hospedadas do Route 53 são configuradas nos consoles desses serviços, e os balanceadores de carga ficam no console do Amazon EC2.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Distribuições do Amazon CloudFront", false],
            ["Zonas hospedadas do Route 53", false],
            ["Regras de grupos de segurança", true],
            ["Sub-redes públicas e privadas", true],
            ["Balanceadores de carga (ELB)", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS são globais, sem que seus recursos precisem ser criados em uma Região específica? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Route 53 e o Amazon CloudFront são serviços globais: não são criados em uma Região e operam a partir da rede de locais de borda da AWS. Instâncias EC2, buckets do S3 e ambientes do Elastic Beanstalk são criados em uma Região específica, mesmo que o nome de um bucket seja único no mundo.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Amazon Route 53", true],
            ["Amazon EC2", false],
            ["Amazon S3", false],
            ["Amazon CloudFront", true],
            ["AWS Elastic Beanstalk", false],
        ],
    },
    {
        statement:
            "Qual recurso do Amazon RDS ajuda a criar bancos de dados com redundância global, mantendo uma cópia atualizada continuamente em outra Região da AWS?",
        explanation:
            "As réplicas de leitura entre Regiões copiam os dados de forma assíncrona para outra Região e podem ser promovidas a instância principal se a Região original falhar. Snapshots são cópias pontuais que exigem restauração, patches automáticos são manutenção e IOPS provisionadas tratam de desempenho.",
        topic: "Banco de dados",
        options: [
            ["Snapshots do banco de dados", false],
            ["Aplicação automática de patches", false],
            ["Réplicas de leitura entre Regiões", true],
            ["Armazenamento com IOPS provisionadas", false],
        ],
    },
    {
        statement:
            "Qual recurso adiciona elasticidade às instâncias do Amazon EC2 para acompanhar a variação da demanda das cargas de trabalho?",
        explanation:
            "O Amazon EC2 Auto Scaling acompanha métricas definidas e adiciona ou remove instâncias conforme a demanda, o que dá elasticidade à aplicação. Resource Groups só organizam recursos, políticas de ciclo de vida movem ou expiram objetos no S3 e o Application Load Balancer distribui o tráfego sem mudar a quantidade de instâncias.",
        topic: "Computação",
        options: [
            ["Resource Groups", false],
            ["Políticas de ciclo de vida", false],
            ["Application Load Balancer", false],
            ["Amazon EC2 Auto Scaling", true],
        ],
    },
    {
        statement:
            "Qual serviço é um banco de dados relacional compatível com MySQL cujo armazenamento cresce automaticamente conforme os dados aumentam, sem que seja preciso provisionar a capacidade de armazenamento antes?",
        explanation:
            "No Amazon Aurora, compatível com MySQL e PostgreSQL, o volume do cluster cresce sozinho conforme os dados, sem provisionar armazenamento. No RDS para MySQL é preciso alocar o armazenamento na criação (o autoscaling é opcional), o EC2 é só computação e o Lightsail oferece planos simplificados de capacidade definida.",
        topic: "Banco de dados",
        options: [
            ["Amazon Elastic Compute Cloud (Amazon EC2)", false],
            ["Amazon RDS para MySQL", false],
            ["Amazon Lightsail", false],
            ["Amazon Aurora", true],
        ],
    },
    {
        statement:
            "Quais tipos de balanceador de carga estão disponíveis no Elastic Load Balancing (ELB)? (Selecione DUAS opções.)",
        explanation:
            "O Elastic Load Balancing oferece Application Load Balancer, Network Load Balancer, Gateway Load Balancer e o Classic Load Balancer, de geração anterior. O balanceamento entre zonas é um recurso configurável, o F5 BIG-IP é um produto de terceiros e o Auto Scaling é um serviço separado que ajusta a capacidade.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Classic Load Balancer", true],
            ["Cross-Zone Load Balancer", false],
            ["F5 BIG-IP Load Balancer", false],
            ["Application Load Balancer", true],
            ["Auto Scaling Load Balancer", false],
        ],
    },
    {
        statement:
            "Quais dos serviços da AWS a seguir fornecem recursos de computação? (Selecione DUAS opções.)",
        explanation:
            "O AWS Lambda executa código sem servidor em resposta a eventos, e o Amazon ECS executa contêineres em instâncias EC2 ou no AWS Fargate. O Amazon ECR apenas armazena imagens de contêiner, o Amazon EBS fornece volumes de armazenamento em bloco e o CodeDeploy automatiza implantações em recursos de computação.",
        topic: "Computação",
        options: [
            ["AWS Lambda", true],
            ["Amazon ECS", true],
            ["AWS CodeDeploy", false],
            ["Amazon ECR", false],
            ["Amazon EBS", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite implantar infraestrutura como código, automatizando o provisionamento de recursos?",
        explanation:
            "O AWS CloudFormation implementa infraestrutura como código: os recursos são descritos em templates JSON ou YAML e provisionados de forma automática e repetível. O AWS Config registra a configuração dos recursos, o CodeDeploy implanta código de aplicação e o Trusted Advisor recomenda boas práticas.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Config", false],
            ["AWS CloudFormation", true],
            ["AWS CodeDeploy", false],
            ["AWS Trusted Advisor", false],
        ],
    },
    {
        statement: "Quais serviços da AWS usam os locais de borda da AWS? (Selecione DUAS opções.)",
        explanation:
            "O Amazon CloudFront armazena e entrega conteúdo a partir dos locais de borda, e o AWS Shield mitiga ataques DDoS nesses mesmos pontos, antes que o tráfego chegue à origem. EC2, RDS e ElastiCache são serviços regionais, executados em Zonas de Disponibilidade dentro de uma Região.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon CloudFront", true],
            ["AWS Shield", true],
            ["Amazon EC2", false],
            ["Amazon RDS", false],
            ["Amazon ElastiCache", false],
        ],
    },
    {
        statement: "Qual das opções a seguir é um serviço de banco de dados da AWS?",
        explanation:
            "O Amazon Redshift é um data warehouse totalmente gerenciado, um banco de dados relacional colunar para consultas analíticas com SQL. O EBS fornece volumes de armazenamento em bloco para instâncias EC2, o EFS é um sistema de arquivos compartilhado e o S3 Glacier Deep Archive é uma classe de armazenamento para arquivamento.",
        topic: "Banco de dados",
        options: [
            ["Amazon Redshift", true],
            ["Amazon EBS", false],
            ["S3 Glacier Deep Archive", false],
            ["Amazon EFS", false],
        ],
    },
    {
        statement:
            "Quais afirmações descrevem corretamente a relação entre Regiões da AWS, Zonas de Disponibilidade e locais de borda? (Selecione DUAS opções.)",
        explanation:
            "Cada Região tem várias Zonas de Disponibilidade, então há mais Zonas do que Regiões, e os locais de borda somam centenas de pontos de presença, bem mais que as dezenas de Regiões. Um local de borda não é uma Zona de Disponibilidade: fica fora das Regiões e serve para entregar conteúdo com baixa latência.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Há mais Regiões da AWS do que Zonas de Disponibilidade", false],
            ["Há mais locais de borda do que Regiões da AWS", true],
            ["Um local de borda é uma Zona de Disponibilidade", false],
            ["Há mais Regiões da AWS do que locais de borda", false],
            ["Há mais Zonas de Disponibilidade do que Regiões da AWS", true],
        ],
    },
    {
        statement:
            "O que ajuda uma empresa a oferecer uma experiência de menor latência a usuários no mundo todo?",
        explanation:
            "Os locais de borda, usados pelo Amazon CloudFront, guardam cópias do conteúdo perto de cada usuário e reduzem a latência onde quer que ele esteja. Nenhuma Região é central para o mundo todo, uma segunda Zona de Disponibilidade melhora a disponibilidade e não a distância, e um cache na própria Região só ajuda quem está perto dela.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Usar uma Região da AWS central em relação a todos os usuários", false],
            ["Usar uma segunda Zona de Disponibilidade na Região atual", false],
            ["Habilitar cache na Região da AWS que já está em uso", false],
            ["Usar locais de borda para aproximar o conteúdo dos usuários", true],
        ],
    },
    {
        statement:
            "Qual serviço de rede da AWS permite que uma empresa crie uma rede virtual dentro da AWS?",
        explanation:
            "A Amazon VPC cria uma rede virtual logicamente isolada na AWS, com controle sobre intervalos de IP, sub-redes, tabelas de rotas e gateways. O AWS Config registra a configuração dos recursos, o Route 53 é o serviço de DNS e o Direct Connect liga uma rede externa à AWS, sem criar a rede virtual.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Config", false],
            ["Amazon Route 53", false],
            ["AWS Direct Connect", false],
            ["Amazon VPC", true],
        ],
    },
    {
        statement:
            "Qual serviço você usaria para enviar alertas com base em alarmes do Amazon CloudWatch?",
        explanation:
            "O Amazon SNS é o serviço de notificações acionado pelos alarmes do CloudWatch: publica a mensagem em um tópico e a entrega aos assinantes por e-mail, SMS ou HTTP. O CloudTrail registra chamadas de API, o Trusted Advisor recomenda boas práticas e o Amazon SQS é uma fila de mensagens consumida por aplicações, sem enviar alertas.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SNS", true],
            ["AWS CloudTrail", false],
            ["AWS Trusted Advisor", false],
            ["Amazon SQS", false],
        ],
    },
    {
        statement:
            "Ao projetar uma aplicação web típica de três camadas, quais serviços ou recursos da AWS aumentam a disponibilidade e reduzem o impacto de falhas? (Selecione DUAS opções.)",
        explanation:
            "O EC2 Auto Scaling substitui instâncias com falha e ajusta a capacidade, e distribuir os recursos em várias Zonas de Disponibilidade evita que a falha de uma derrube a aplicação. Network ACLs só filtram tráfego, alarmes apenas notificam sem corrigir nada e pontos de presença são locais de borda, onde as camadas da aplicação não são hospedadas.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Amazon EC2 Auto Scaling para as instâncias da aplicação", true],
            ["Network ACLs da VPC para verificar a integridade do serviço", false],
            ["Recursos distribuídos em várias Zonas de Disponibilidade", true],
            ["Alarmes do CloudWatch que avisam quando uma instância falha", false],
            ["Recursos distribuídos em vários pontos de presença da AWS", false],
        ],
    },
    {
        statement:
            "Qual é uma característica da replicação entre Regiões (Cross-Region Replication) do Amazon S3?",
        explanation:
            "Na replicação entre Regiões do S3, os buckets de origem e de destino podem ser da mesma conta ou de contas diferentes. O versionamento precisa estar ativado nos dois buckets, a replicação existe justamente para copiar objetos entre Regiões diferentes e nenhuma Região precisa ser desativada na conta.",
        topic: "Armazenamento",
        options: [
            [
                "Os buckets de origem e de destino precisam estar com o versionamento desativado",
                false,
            ],
            ["Os buckets de origem e de destino não podem ficar em Regiões diferentes", false],
            ["Os buckets podem pertencer à mesma conta da AWS ou a contas diferentes", true],
            [
                "O dono do bucket de origem precisa desativar as Regiões de origem e de destino na conta",
                false,
            ],
        ],
    },
    {
        statement: "O que o Amazon Route 53 permite que os usuários façam?",
        explanation:
            "O Amazon Route 53 é o serviço de DNS da AWS: registra nomes de domínio, gerencia registros DNS e roteia o tráfego para os endpoints. Criptografia em trânsito e certificados SSL/TLS ficam com serviços como o AWS Certificate Manager, e a conexão dedicada é o AWS Direct Connect.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Criptografar os dados em trânsito entre os serviços", false],
            ["Registrar nomes de domínio para as aplicações", true],
            ["Gerar e gerenciar certificados SSL/TLS", false],
            ["Estabelecer uma conexão de rede dedicada com a AWS", false],
        ],
    },
    {
        statement:
            "Uma empresa quer um serviço da AWS que monitore continuamente a integridade dos endpoints da sua aplicação, implantados em várias Regiões, e direcione o tráfego automaticamente para um endpoint regional íntegro, melhorando a disponibilidade. Qual serviço atende a esses requisitos?",
        explanation:
            "O AWS Global Accelerator verifica a integridade dos endpoints e envia os usuários ao endpoint íntegro mais próximo pela rede global da AWS, com failover entre Regiões. O Elastic Load Balancing atua dentro de uma única Região, o CloudWatch monitora e alerta sem rotear tráfego, e o CloudFront é uma CDN que entrega conteúdo em cache.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Elastic Load Balancing", false],
            ["Amazon CloudWatch", false],
            ["AWS Global Accelerator", true],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser usados para migrar dados de data centers locais para a AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS DataSync automatiza e acelera a transferência de grandes volumes de arquivos e objetos do armazenamento local para a AWS, e o AWS DMS migra bancos de dados com o mínimo de indisponibilidade. O Lambda executa código, o SQS troca mensagens entre componentes e o API Gateway publica APIs.",
        topic: "Migração",
        options: [
            ["AWS DataSync", true],
            ["AWS Lambda", false],
            ["Amazon Simple Queue Service (Amazon SQS)", false],
            ["AWS Database Migration Service (AWS DMS)", true],
            ["Amazon API Gateway", false],
        ],
    },
    {
        statement:
            "Uma empresa de comércio eletrônico prevê um grande aumento no tráfego do site em duas datas promocionais muito populares. Qual serviço ou recurso da AWS pode ser configurado para ajustar os recursos dinamicamente conforme essa mudança na demanda?",
        explanation:
            "O Amazon EC2 Auto Scaling adiciona instâncias quando a demanda sobe e as remove quando ela cai, acompanhando os picos das datas promocionais. O CloudTrail registra chamadas de API, o Config acompanha as configurações dos recursos e o SageMaker Canvas pode prever a demanda, mas nenhum deles ajusta a capacidade.",
        topic: "Computação",
        options: [
            ["AWS CloudTrail", false],
            ["Amazon EC2 Auto Scaling", true],
            ["Amazon SageMaker Canvas", false],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Uma empresa executa uma aplicação de comércio eletrônico hospedada na Europa. Para reduzir a latência dos usuários que acessam o site de outras partes do mundo, ela quer armazenar em cache o conteúdo estático acessado com frequência mais perto desses usuários. Qual serviço da AWS atende a esses requisitos?",
        explanation:
            "O Amazon CloudFront armazena o conteúdo estático em cache nos locais de borda e o entrega a partir do ponto mais próximo de cada usuário, reduzindo a latência global. O ElastiCache é um cache em memória usado pela própria aplicação, e o EFS e o EBS são armazenamento de arquivos e em bloco dentro de uma Região.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon ElastiCache", false],
            ["Amazon CloudFront", true],
            ["Amazon Elastic File System (Amazon EFS)", false],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser escalados com o AWS Auto Scaling? (Selecione DUAS opções.)",
        explanation:
            "O AWS Auto Scaling ajusta a quantidade de instâncias do Amazon EC2 em grupos do Auto Scaling e a capacidade de leitura e gravação de tabelas do Amazon DynamoDB, entre outros recursos. O S3 escala sozinho sem configuração, o Route 53 é DNS sem capacidade a provisionar e o Redshift tem mecanismos próprios de escalabilidade.",
        topic: "Computação",
        options: [
            ["Amazon EC2", true],
            ["Amazon DynamoDB", true],
            ["Amazon S3", false],
            ["Amazon Route 53", false],
            ["Amazon Redshift", false],
        ],
    },
    {
        statement:
            "Uma empresa quer colocar o AWS Global Accelerator na frente das suas aplicações. Quais benefícios ela obtém com isso? (Selecione DUAS opções.)",
        explanation:
            "O AWS Global Accelerator leva o tráfego dos usuários pela rede global da AWS até o endpoint íntegro mais próximo, o que aumenta a disponibilidade e reduz a latência. Ele não reduz o custo dos serviços, e a durabilidade e a segurança dos dados armazenados dependem dos serviços de armazenamento, criptografia e controle de acesso.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Menor custo para executar serviços na AWS", false],
            ["Maior disponibilidade das aplicações na AWS", true],
            ["Maior durabilidade dos dados armazenados na AWS", false],
            ["Menor latência para acessar aplicações na AWS", true],
            ["Maior segurança dos dados armazenados na AWS", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode ser usado para converter texto em fala com som natural?",
        explanation:
            "O Amazon Polly usa aprendizado profundo para transformar texto em fala natural, em vários idiomas e vozes. O Transcribe faz o caminho inverso (fala para texto), o Rekognition analisa imagens e vídeos, e o Lex cria interfaces conversacionais e chatbots que entendem voz e texto.",
        topic: "Machine learning",
        options: [
            ["Amazon Polly", true],
            ["Amazon Transcribe", false],
            ["Amazon Rekognition", false],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Qual componente da infraestrutura global da AWS é usado para armazenar em cache cópias de conteúdo e entregá-las mais rápido aos usuários ao redor do mundo?",
        explanation:
            "Os locais de borda são pontos de presença usados pelo Amazon CloudFront e por outros serviços para manter cópias do conteúdo perto dos usuários finais. Regiões são áreas geográficas onde as cargas são implantadas, Zonas de Disponibilidade são data centers isolados dentro de uma Região para redundância, e os data centers em si não formam uma camada de cache.",
        topic: "Conceitos e arquitetura",
        options: [
            ["Regiões da AWS", false],
            ["Zonas de Disponibilidade", false],
            ["Locais de borda", true],
            ["Data centers", false],
        ],
    },
    {
        statement:
            "Qual serviço de armazenamento híbrido da AWS permite que as aplicações locais de um usuário usem o armazenamento na Nuvem AWS de forma transparente?",
        explanation:
            "O AWS Storage Gateway é um serviço de armazenamento híbrido que dá às aplicações locais acesso ao armazenamento da AWS por interfaces de arquivo, volume e fita. O AWS Backup centraliza backups, o AWS Elastic Disaster Recovery replica servidores para recuperação de desastres e o AWS Direct Connect é um link de rede dedicado.",
        topic: "Armazenamento",
        options: [
            ["AWS Backup", false],
            ["AWS Elastic Disaster Recovery", false],
            ["AWS Direct Connect", false],
            ["AWS Storage Gateway", true],
        ],
    },
    {
        statement:
            "Uma equipe está avaliando serviços da AWS para executar suas cargas de trabalho. Quais das opções a seguir são serviços de computação? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Lightsail oferece servidores virtuais simplificados e o AWS Batch executa trabalhos de computação em lote provisionando os recursos necessários, então ambos são serviços de computação. O Systems Manager gerencia a operação dos recursos, o CloudFormation provisiona infraestrutura como código e o Config registra configurações.",
        topic: "Computação",
        options: [
            ["Amazon Lightsail", true],
            ["AWS Systems Manager", false],
            ["AWS CloudFormation", false],
            ["AWS Batch", true],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "O que pode ser usado para automatizar a configuração e o gerenciamento de ambientes AWS com várias contas, seguros e alinhados às boas práticas de arquitetura?",
        explanation:
            "O AWS Control Tower automatiza a criação de um ambiente com várias contas (landing zone) e aplica controles (guardrails) de segurança e governança baseados em boas práticas. O GuardDuty detecta ameaças, o Security Hub consolida alertas de segurança e o Well-Architected Tool revisa cargas de trabalho, sem configurar contas.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon GuardDuty", false],
            ["AWS Control Tower", true],
            ["AWS Security Hub", false],
            ["AWS Well-Architected Tool", false],
        ],
    },
    {
        statement:
            "Qual serviço de orquestração de contêineres da AWS dispensa o usuário de instalar, operar e escalar a própria infraestrutura de gerenciamento de clusters?",
        explanation:
            "O Amazon ECS é um serviço totalmente gerenciado de orquestração de contêineres que dispensa instalar e operar software próprio de gerenciamento de clusters. O ECR é um registro de imagens de contêiner, o Elastic Beanstalk é uma plataforma para implantar aplicações web e o EBS fornece volumes de armazenamento em bloco.",
        topic: "Computação",
        options: [
            ["Amazon Elastic Container Registry (Amazon ECR)", false],
            ["AWS Elastic Beanstalk", false],
            ["Amazon Elastic Container Service (Amazon ECS)", true],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
        ],
    },
    {
        statement: "Qual é a finalidade de um gateway de internet em uma VPC?",
        explanation:
            "O gateway de internet é o componente anexado à VPC que permite a comunicação entre os recursos com IP público e a internet, nos dois sentidos. A conexão VPN usa um gateway privado virtual, o acesso só de saída para sub-redes privadas é papel do gateway NAT e a distribuição de tráfego entre instâncias é do Elastic Load Balancing.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Criar uma conexão VPN entre a VPC e a rede local", false],
            ["Permitir a comunicação entre a VPC e a internet", true],
            ["Dar às sub-redes privadas acesso de saída à internet", false],
            ["Distribuir o tráfego da internet entre instâncias EC2", false],
        ],
    },
    {
        statement:
            "Qual serviço gerenciado da AWS pode ser usado para distribuir o tráfego entre várias instâncias do Amazon EC2?",
        explanation:
            "O Elastic Load Balancing distribui automaticamente o tráfego de entrada entre várias instâncias do Amazon EC2 e deixa de enviar requisições às que falham nas verificações de integridade. O gateway NAT dá saída à internet para sub-redes privadas, o gateway privado virtual termina conexões VPN e o AWS PrivateLink dá acesso privado a serviços.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Gateway NAT", false],
            ["Elastic Load Balancing", true],
            ["Gateway privado virtual", false],
            ["AWS PrivateLink", false],
        ],
    },
    {
        statement:
            "Uma equipe quer automatizar o processo de implantação das suas aplicações. Qual serviço da AWS pode ser usado para isso?",
        explanation:
            "O AWS CodePipeline é um serviço de entrega contínua que automatiza as etapas de compilação, teste e implantação a cada mudança no código. O AppSync cria APIs GraphQL, o CodeArtifact armazena pacotes e dependências de software e o DataSync transfere dados entre o armazenamento local e a AWS.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS AppSync", false],
            ["AWS CodeArtifact", false],
            ["AWS CodePipeline", true],
            ["AWS DataSync", false],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS permite ao usuário gerenciar o tráfego de uma aplicação entre várias Regiões?",
        explanation:
            "O Amazon Route 53 oferece políticas de roteamento por latência, geolocalização e failover, com verificações de integridade, que direcionam o tráfego da aplicação entre várias Regiões. O WorkSpaces Applications faz streaming de aplicações, a VPC é uma rede isolada dentro de uma Região e o Elastic Load Balancing distribui tráfego dentro de uma Região.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Amazon WorkSpaces Applications", false],
            ["Amazon VPC", false],
            ["Elastic Load Balancing", false],
            ["Amazon Route 53", true],
        ],
    },
    {
        statement:
            "Uma empresa precisa armazenar dados críticos do negócio no Amazon S3 e manter uma cópia deles, atualizada automaticamente, em outra Região da AWS. Como isso pode ser feito?",
        explanation:
            "A replicação entre Regiões (CRR) do Amazon S3 copia automaticamente os objetos gravados no bucket de origem para um bucket em outra Região. O CloudFront mantém cópias temporárias em cache, não backups, o versionamento guarda versões no próprio bucket e o S3 não tem snapshots de bucket como o EBS.",
        topic: "Armazenamento",
        options: [
            ["Usar o Amazon CloudFront para armazenar os dados em cache globalmente", false],
            ["Configurar a replicação entre Regiões do Amazon S3 para outra Região", true],
            ["Ativar o versionamento do Amazon S3 no bucket onde os dados são gravados", false],
            ["Tirar snapshots do bucket do Amazon S3 e copiá-los para outra Região", false],
        ],
    },
    {
        statement:
            "Quais componentes são necessários para criar uma conexão AWS Site-to-Site VPN entre uma rede local e uma VPC? (Selecione DUAS opções.)",
        explanation:
            "Uma Site-to-Site VPN precisa de um gateway do cliente, que representa o dispositivo VPN da rede local, e de um gateway privado virtual anexado à VPC, as duas pontas do túnel criptografado. O gateway de internet e o gateway NAT dão acesso à internet, e o peering liga duas VPCs entre si.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Gateway de internet", false],
            ["Gateway NAT", false],
            ["Gateway do cliente", true],
            ["Conexão de peering de VPC", false],
            ["Gateway privado virtual", true],
        ],
    },
    {
        statement:
            "Uma aplicação em uma instância do Amazon EC2 grava em um sistema de arquivos cujos dados precisam ser mantidos mesmo quando a instância é interrompida. Qual opção oferece esse armazenamento persistente?",
        explanation:
            "Os volumes do Amazon EBS são armazenamento em bloco persistente: os dados continuam lá quando a instância é interrompida, então servem de base para sistemas de arquivos. O armazenamento de instância é temporário e se perde ao interromper a instância, o S3 Glacier Deep Archive arquiva objetos com recuperação em horas e o ElastiCache é um cache em memória.",
        topic: "Armazenamento",
        options: [
            ["S3 Glacier Deep Archive", false],
            ["Armazenamento de instância do Amazon EC2", false],
            ["Amazon Elastic Block Store (Amazon EBS)", true],
            ["Amazon ElastiCache", false],
        ],
    },
    {
        statement:
            "Uma startup quer reduzir o esforço operacional usando apenas serviços em que não precisa provisionar nem gerenciar servidores. Quais serviços da AWS atendem a esse critério? (Selecione DUAS opções.)",
        explanation:
            "O AWS Lambda executa código sem provisionar servidores e o Amazon DynamoDB é um banco NoSQL sem servidor que escala automaticamente, com cobrança pelo uso. O EC2 e o Lightsail entregam servidores virtuais que o cliente dimensiona e gerencia, e o Elastic Beanstalk automatiza a implantação, mas ainda cria instâncias EC2 na conta.",
        topic: "Computação",
        options: [
            ["AWS Lambda", true],
            ["Amazon EC2", false],
            ["AWS Elastic Beanstalk", false],
            ["Amazon DynamoDB", true],
            ["Amazon Lightsail", false],
        ],
    },
    {
        statement:
            "Quais serviços gerenciados da AWS podem ser usados para estender um data center local até a rede da AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS Site-to-Site VPN cria túneis criptografados pela internet entre a rede local e a AWS, e o AWS Direct Connect oferece uma conexão física privada e dedicada. O gateway NAT dá saída à internet para sub-redes privadas, o Global Accelerator acelera o acesso de usuários da internet às aplicações e o Route 53 é DNS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Site-to-Site VPN", true],
            ["Gateway NAT", false],
            ["AWS Direct Connect", true],
            ["AWS Global Accelerator", false],
            ["Amazon Route 53", false],
        ],
    },
    {
        statement:
            "Quais são benefícios de usar o Amazon RDS em vez do Amazon EC2 para executar bancos de dados relacionais na AWS? (Selecione DUAS opções.)",
        explanation:
            "No Amazon RDS, a AWS cuida dos backups automatizados, com recuperação para um ponto no tempo, e da aplicação de patches no mecanismo do banco, tarefas manuais quando o banco roda no EC2. Esquema e índices continuam com o cliente nos dois casos, pois dependem do modelo de dados, e ETL é tarefa de serviços como o AWS Glue.",
        topic: "Banco de dados",
        options: [
            ["Backups automatizados do banco de dados", true],
            ["Gerenciamento do esquema do banco", false],
            ["Criação de índices nas tabelas", false],
            ["Aplicação de patches no mecanismo do banco", true],
            ["Gerenciamento de ETL (extração, transformação e carga)", false],
        ],
    },
    {
        statement: "O que a classe de armazenamento S3 Intelligent-Tiering oferece?",
        explanation:
            "O S3 Intelligent-Tiering monitora o acesso aos objetos e os move automaticamente entre níveis de acesso conforme o uso, sem taxa de recuperação, reduzindo o custo de dados com padrão de acesso imprevisível. O S3 não tem reserva de capacidade, a classe não copia dados para o EBS e o menor custo de arquivamento é do S3 Glacier Deep Archive.",
        topic: "Armazenamento",
        options: [
            ["Flexibilidade de pagamento com a reserva de capacidade de armazenamento", false],
            [
                "Retenção de longo prazo com cópia dos dados para volumes criptografados do Amazon EBS",
                false,
            ],
            [
                "Economia automática ao mover objetos entre níveis conforme o padrão de acesso muda",
                true,
            ],
            ["Armazenamento seguro, durável e de menor custo para arquivamento de dados", false],
        ],
    },
    {
        statement:
            "Uma empresa tem várias fontes de dados espalhadas pela organização e quer consolidar esses dados em um único data warehouse. Qual serviço da AWS pode ser usado para atender a esse requisito?",
        explanation:
            "O Amazon Redshift é o data warehouse gerenciado da AWS, feito para consolidar dados de várias fontes e executar consultas analíticas em grande escala. O DynamoDB é um banco NoSQL para cargas transacionais, o Athena consulta dados direto no S3 sem consolidá-los em um warehouse e o Quick Sight cria painéis de BI.",
        topic: "Banco de dados",
        options: [
            ["Amazon DynamoDB", false],
            ["Amazon Redshift", true],
            ["Amazon Athena", false],
            ["Amazon Quick Sight", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode ser usado para oferecer uma central de atendimento (contact center) sob demanda e baseada na nuvem?",
        explanation:
            "O Amazon Connect é uma central de atendimento em nuvem que pode ser configurada em minutos, escala sob demanda e cobra pelo uso. O AWS Direct Connect é um link de rede dedicado, o AWS Support é o suporte técnico que a AWS presta aos próprios clientes e o AWS Managed Services opera a infraestrutura AWS em nome de empresas.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Direct Connect", false],
            ["Amazon Connect", true],
            ["AWS Support", false],
            ["AWS Managed Services", false],
        ],
    },
    {
        statement:
            "Uma empresa executa um banco de dados MySQL em uma única instância do Amazon EC2 e agora precisa de maior disponibilidade caso ocorra uma interrupção. Qual conjunto de tarefas atende a esse requisito?",
        explanation:
            "Com o Amazon RDS Multi-AZ, a AWS mantém uma réplica síncrona em espera em outra Zona de Disponibilidade e faz o failover automaticamente. Um balanceador de carga na frente de uma única instância não cria redundância, a recuperação automática do EC2 mantém a instância na mesma Zona e a proteção contra encerramento só evita exclusões acidentais.",
        topic: "Banco de dados",
        options: [
            ["Colocar um Application Load Balancer na frente da instância EC2", false],
            [
                "Usar o EC2 Auto Recovery para mover a instância para outra Zona de Disponibilidade",
                false,
            ],
            ["Migrar o banco para o Amazon RDS e ativar a implantação Multi-AZ", true],
            ["Ativar a proteção contra encerramento da instância para evitar quedas", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma aplicação cujos componentes precisam enviar, armazenar e receber mensagens entre si. Outro requisito é processar as mensagens na ordem em que chegaram (primeiro a entrar, primeiro a sair, ou FIFO). Qual serviço da AWS a empresa deve usar?",
        explanation:
            "O Amazon SQS guarda as mensagens em filas até que os componentes as consumam, e as filas FIFO garantem a ordem de chegada e o processamento sem duplicidade. O SNS distribui mensagens no modelo pub/sub sem guardá-las para consumo posterior, o EventBridge roteia eventos sem garantia de ordem e o Step Functions orquestra fluxos de trabalho.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Step Functions", false],
            ["Amazon Simple Notification Service (Amazon SNS)", false],
            ["Amazon EventBridge", false],
            ["Amazon Simple Queue Service (Amazon SQS)", true],
        ],
    },
    {
        statement:
            "Um usuário conhece pouco os serviços da AWS, mas quer implantar rapidamente na Nuvem AWS uma aplicação Node.js escalável, sem configurar a infraestrutura por conta própria. Qual serviço deve ser usado para implantar a aplicação?",
        explanation:
            "O AWS Elastic Beanstalk recebe o código e cuida automaticamente de provisionamento, balanceamento de carga, escalabilidade e monitoramento, ideal para quem conhece pouco a AWS. O CloudFormation exige escrever templates, o EC2 exige configurar servidores, rede e escalabilidade manualmente, e o EKS exige conhecimento de Kubernetes.",
        topic: "Computação",
        options: [
            ["AWS CloudFormation", false],
            ["AWS Elastic Beanstalk", true],
            ["Amazon EC2", false],
            ["Amazon Elastic Kubernetes Service (Amazon EKS)", false],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS exige um circuito de um provedor de conectividade e uma instalação de colocation para ser implementado?",
        explanation:
            "O AWS Direct Connect liga a rede local à AWS por um circuito físico dedicado, conectado em um local do Direct Connect (uma instalação de colocation), normalmente com apoio de um provedor de rede. A Site-to-Site VPN usa a internet já existente, e o Transit Gateway e o gateway de internet são recursos lógicos criados na própria AWS.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Site-to-Site VPN", false],
            ["AWS Transit Gateway", false],
            ["AWS Direct Connect", true],
            ["Gateway de internet", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa escolher onde executar o código de uma nova aplicação. Quais serviços da AWS oferecem capacidade de computação? (Selecione DUAS opções.)",
        explanation:
            "O Amazon EC2 fornece servidores virtuais com controle total do sistema operacional e o AWS Lambda executa código em resposta a eventos sem gerenciar servidores, então ambos são serviços de computação. O S3 é armazenamento de objetos, o EBS fornece volumes em bloco para instâncias e o Cognito gerencia a autenticação de usuários.",
        topic: "Computação",
        options: [
            ["Amazon EC2", true],
            ["Amazon S3", false],
            ["Amazon Elastic Block Store (Amazon EBS)", false],
            ["Amazon Cognito", false],
            ["AWS Lambda", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS pode ser usado para armazenar de forma privada o código-fonte e gerenciar suas versões?",
        explanation:
            "O AWS CodeCommit é um serviço gerenciado de controle de versão que hospeda repositórios Git privados. O CodeBuild compila o código e executa testes, o CodePipeline automatiza as etapas de lançamento e o X-Ray rastreia requisições para analisar o desempenho de aplicações distribuídas, sem guardar código.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS CodeBuild", false],
            ["AWS CodeCommit", true],
            ["AWS CodePipeline", false],
            ["AWS X-Ray", false],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS é usado para enviar mensagens de texto (SMS) e e-mails a partir de aplicações distribuídas?",
        explanation:
            "O Amazon SNS é um serviço de mensagens pub/sub que entrega notificações por SMS, e-mail e outros canais aos assinantes de um tópico. O Amazon SES envia apenas e-mails, os alarmes do CloudWatch dependem do SNS para notificar e o Amazon SQS enfileira mensagens entre componentes, sem enviá-las a pessoas.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SNS", true],
            ["Amazon SES", false],
            ["Alarmes do Amazon CloudWatch", false],
            ["Amazon SQS", false],
        ],
    },
    {
        statement:
            "Uma empresa está criando uma aplicação que precisa entregar imagens e vídeos para usuários do mundo todo com latência mínima. Qual abordagem a empresa pode usar para fazer isso de forma econômica?",
        explanation:
            "O Amazon CloudFront armazena imagens e vídeos em cache em centenas de locais de borda e os entrega a partir do ponto mais próximo de cada usuário, com baixa latência e custo menor de transferência. A replicação entre Regiões do S3 copia dados, mas o acesso continua regional, a VPN liga redes e o PrivateLink dá acesso privado a serviços.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Entregar o conteúdo pelo Amazon CloudFront", true],
            ["Armazenar o conteúdo no Amazon S3 e ativar a replicação entre Regiões", false],
            ["Implementar uma VPN entre várias Regiões da AWS", false],
            ["Entregar o conteúdo pelo AWS PrivateLink", false],
        ],
    },
    {
        statement:
            "Uma empresa tem usuários em várias partes do mundo que enfrentam alta latência ao acessar sua aplicação, hospedada em uma única Região da AWS. A aplicação usa tráfego TCP e UDP, e não apenas HTTP. Qual serviço da AWS melhora o desempenho e a disponibilidade da aplicação encaminhando esse tráfego pela rede global da AWS?",
        explanation:
            "O AWS Global Accelerator recebe o tráfego TCP e UDP no local de borda mais próximo do usuário e o conduz pela rede global da AWS até a aplicação, reduzindo latência e instabilidade. O CloudFront é uma CDN voltada a conteúdo HTTP, o Route 53 atua só na resolução DNS e o Elastic Load Balancing distribui tráfego dentro de uma Região.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS Global Accelerator", true],
            ["Amazon CloudFront", false],
            ["Amazon Route 53", false],
            ["Elastic Load Balancing", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS fornece endereços IP estáticos anycast que funcionam como um ponto de entrada fixo para os endpoints de uma aplicação em uma ou mais Regiões da AWS?",
        explanation:
            "O AWS Global Accelerator fornece dois endereços IP estáticos anycast que servem de entrada fixa e levam o tráfego pela rede da AWS até o endpoint saudável mais próximo, em uma ou mais Regiões. O Elastic Load Balancing atua dentro de uma Região, o Route 53 resolve nomes DNS e o API Gateway expõe APIs sem oferecer IPs anycast fixos.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Elastic Load Balancing", false],
            ["Amazon Route 53", false],
            ["AWS Global Accelerator", true],
            ["Amazon API Gateway", false],
        ],
    },
    {
        statement:
            "Por exigências de residência de dados, uma empresa precisa manter suas cargas de trabalho no próprio data center, mas quer usar os mesmos serviços, APIs e ferramentas da AWS. Qual serviço atende a esse requisito?",
        explanation:
            "O AWS Outposts instala no data center do cliente racks e servidores gerenciados pela AWS, com as mesmas APIs e ferramentas da nuvem, e os dados permanecem no local. O Wavelength leva recursos à borda das redes 5G, as Local Zones ficam em instalações da AWS perto de grandes cidades e o Direct Connect é só uma conexão de rede dedicada.",
        topic: "Computação",
        options: [
            ["AWS Wavelength", false],
            ["AWS Local Zones", false],
            ["AWS Outposts", true],
            ["AWS Direct Connect", false],
        ],
    },
    {
        statement:
            "Uma empresa de mídia precisa executar aplicações sensíveis à latência, como edição de vídeo em tempo real, perto dos usuários de uma área metropolitana onde não há uma Região da AWS próxima, e não quer instalar hardware em instalações próprias. Qual opção de infraestrutura da AWS ela deve considerar?",
        explanation:
            "As AWS Local Zones levam computação, armazenamento e banco de dados para perto de grandes centros urbanos sem Região próxima, com latência de milissegundos de um dígito. O Outposts exige instalar hardware no local do cliente, o Wavelength atende aplicações móveis dentro das redes 5G e o CloudFront distribui conteúdo em cache.",
        topic: "Conceitos e arquitetura",
        options: [
            ["AWS Outposts", false],
            ["AWS Local Zones", true],
            ["AWS Wavelength", false],
            ["Amazon CloudFront", false],
        ],
    },
    {
        statement:
            "Uma empresa quer criar uma arquitetura orientada a eventos na qual vários serviços da AWS e aplicações SaaS de parceiros reagem a eventos em tempo real. Qual serviço da AWS oferece um barramento de eventos sem servidor para essa finalidade?",
        explanation:
            "O Amazon EventBridge é um barramento de eventos sem servidor que recebe eventos de serviços da AWS, de aplicações próprias e de parceiros SaaS e os encaminha a destinos por meio de regras de filtragem. O SNS envia notificações pub/sub, o SQS é uma fila de mensagens e o Step Functions orquestra fluxos de trabalho.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SNS", false],
            ["Amazon SQS", false],
            ["Amazon EventBridge", true],
            ["AWS Step Functions", false],
        ],
    },
    {
        statement:
            "Uma equipe quer acionar automaticamente uma função do AWS Lambda sempre que uma instância do Amazon EC2 mudar de estado, por exemplo, ao ser interrompida. Qual serviço detecta essas mudanças nos recursos da AWS e encaminha os eventos para destinos como o Lambda, filas do SQS ou tópicos do SNS?",
        explanation:
            "O Amazon EventBridge recebe os eventos de mudança de estado emitidos pelos serviços da AWS e, por meio de regras, os envia a destinos como Lambda, SQS e SNS. O Kinesis Data Streams ingere fluxos contínuos de dados, o CloudTrail registra chamadas de API para auditoria e o Amazon MQ é um broker de mensagens gerenciado.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Kinesis Data Streams", false],
            ["Amazon EventBridge", true],
            ["AWS CloudTrail", false],
            ["Amazon MQ", false],
        ],
    },
    {
        statement:
            "Uma empresa quer montar uma central de atendimento em nuvem, na qual seus agentes atendem ligações e chats de clientes, sem manter infraestrutura de telefonia. Qual serviço da AWS oferece esse recurso?",
        explanation:
            "O Amazon Connect é o serviço de central de atendimento em nuvem: configura filas, fluxos de contato e atendimento por voz e chat, com pagamento por uso. O Lex cria chatbots que podem ser integrados a uma central, mas não a opera, o AWS Support Center gerencia casos de suporte com a AWS e o WorkSpaces fornece desktops virtuais.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Lex", false],
            ["Amazon Connect", true],
            ["AWS Support Center", false],
            ["Amazon WorkSpaces", false],
        ],
    },
    {
        statement:
            "Uma empresa quer construir, treinar e implantar modelos de machine learning em escala. Qual serviço da AWS oferece um ambiente totalmente gerenciado para todo esse ciclo?",
        explanation:
            "O Amazon SageMaker AI (antigo Amazon SageMaker) reúne ferramentas gerenciadas para preparar dados e construir, treinar e implantar modelos de ML em escala. O Rekognition e o Comprehend são serviços de IA prontos para imagem e texto, e as Deep Learning AMIs são imagens de EC2 que o próprio cliente precisa gerenciar.",
        topic: "Machine learning",
        options: [
            ["Amazon Rekognition", false],
            ["Amazon SageMaker AI", true],
            ["Amazon Comprehend", false],
            ["AWS Deep Learning AMIs", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS detecta automaticamente objetos, pessoas, textos e atividades em imagens e vídeos?",
        explanation:
            "O Amazon Rekognition usa deep learning para identificar objetos, pessoas, textos, cenas e atividades em imagens e vídeos, sem exigir experiência em ML. O Textract extrai texto e dados de documentos, o Transcribe converte fala em texto e o Kinesis Video Streams apenas ingere e armazena fluxos de vídeo.",
        topic: "Machine learning",
        options: [
            ["Amazon Textract", false],
            ["Amazon Transcribe", false],
            ["Amazon Rekognition", true],
            ["Amazon Kinesis Video Streams", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa analisar avaliações escritas por clientes para identificar o sentimento e extrair frases-chave. Qual serviço da AWS usa processamento de linguagem natural (PLN) para essa finalidade?",
        explanation:
            "O Amazon Comprehend aplica processamento de linguagem natural a textos para detectar sentimento, entidades, frases-chave e idioma. O Translate traduz textos entre idiomas, o Transcribe converte áudio em texto e o Lex cria interfaces conversacionais, como chatbots, sem analisar avaliações.",
        topic: "Machine learning",
        options: [
            ["Amazon Translate", false],
            ["Amazon Comprehend", true],
            ["Amazon Transcribe", false],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite que desenvolvedores criem interfaces conversacionais, como chatbots, que entendem voz e texto?",
        explanation:
            "O Amazon Lex oferece reconhecimento de fala e compreensão de linguagem natural para criar chatbots e assistentes de voz e texto, com a mesma tecnologia da Alexa. O Polly converte texto em fala, o Transcribe converte fala em texto e o Comprehend analisa textos, mas nenhum deles conduz um diálogo.",
        topic: "Machine learning",
        options: [
            ["Amazon Polly", false],
            ["Amazon Lex", true],
            ["Amazon Transcribe", false],
            ["Amazon Comprehend", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS converte texto em fala com som natural, permitindo criar aplicações que falam?",
        explanation:
            "O Amazon Polly usa deep learning para transformar texto em fala realista, com dezenas de idiomas e vozes. O Transcribe faz o caminho inverso, convertendo fala em texto, o Translate traduz textos entre idiomas e o Lex cria chatbots de voz e texto, mas não é o serviço que sintetiza a fala.",
        topic: "Machine learning",
        options: [
            ["Amazon Transcribe", false],
            ["Amazon Translate", false],
            ["Amazon Polly", true],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa converter automaticamente em texto as gravações de áudio das ligações de clientes. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon Transcribe é um serviço de reconhecimento automático de fala que converte áudio em texto, ideal para transcrever gravações de ligações. O Polly faz o inverso (texto em fala), o Comprehend analisa textos já escritos e o Lex cria chatbots que interagem com usuários, sem transcrever gravações.",
        topic: "Machine learning",
        options: [
            ["Amazon Polly", false],
            ["Amazon Comprehend", false],
            ["Amazon Transcribe", true],
            ["Amazon Lex", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS usa tradução automática neural para converter textos entre idiomas diferentes?",
        explanation:
            "O Amazon Translate usa tradução automática neural para traduzir textos entre idiomas com rapidez e qualidade. O Comprehend extrai sentimento, entidades e frases-chave de textos, o Transcribe converte fala em texto e o Lex cria interfaces conversacionais, e nenhum deles faz tradução.",
        topic: "Machine learning",
        options: [
            ["Amazon Comprehend", false],
            ["Amazon Transcribe", false],
            ["Amazon Lex", false],
            ["Amazon Translate", true],
        ],
    },
    {
        statement:
            "Uma empresa quer executar aplicações web de longa duração em contêineres Docker, agendados em um cluster de instâncias do Amazon EC2 pelo orquestrador próprio da AWS, sem adotar o Kubernetes. Qual serviço de orquestração de contêineres totalmente gerenciado atende a esse requisito?",
        explanation:
            "O Amazon ECS é o orquestrador de contêineres nativo da AWS: agenda e mantém contêineres Docker em clusters de EC2 ou no Fargate, sem usar Kubernetes. O EKS é o serviço gerenciado de Kubernetes, o Lambda executa funções orientadas a eventos e o AWS Batch processa trabalhos em lote, e não serviços contínuos.",
        topic: "Computação",
        options: [
            ["Amazon Elastic Kubernetes Service (Amazon EKS)", false],
            ["AWS Lambda", false],
            ["Amazon Elastic Container Service (Amazon ECS)", true],
            ["AWS Batch", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa mover grandes volumes de dados de seus servidores de arquivos NFS e SMB locais para o Amazon S3, com transferências agendadas, validação de integridade e uso otimizado da rede. Qual serviço da AWS automatiza e acelera essa transferência?",
        explanation:
            "O AWS DataSync usa um agente local para copiar dados de compartilhamentos NFS e SMB para o S3, o EFS ou o FSx, com agendamento, criptografia e verificação de integridade. O Storage Gateway dá acesso híbrido contínuo ao armazenamento na nuvem, o Transfer Family expõe endpoints SFTP e FTP e o AWS Backup centraliza backups.",
        topic: "Migração",
        options: [
            ["AWS Storage Gateway", false],
            ["AWS DataSync", true],
            ["AWS Transfer Family", false],
            ["AWS Backup", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de um serviço de business intelligence (BI) nativo da nuvem para criar dashboards interativos e visualizações a partir de várias fontes de dados. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon Quick Sight (antigo Amazon QuickSight) é o serviço de BI sem servidor da AWS para criar dashboards e visualizações interativas conectando fontes como S3, RDS, Redshift e Athena. O Athena consulta dados no S3 com SQL, o Redshift é um data warehouse e o Lake Formation cria e governa data lakes.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Athena", false],
            ["Amazon Quick Sight", true],
            ["Amazon Redshift", false],
            ["AWS Lake Formation", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de um serviço de extração, transformação e carga (ETL) totalmente gerenciado e sem servidor para preparar e transformar dados para análise. Qual serviço da AWS ela deve usar?",
        explanation:
            "O AWS Glue é o serviço de integração de dados sem servidor da AWS: descobre fontes, prepara e transforma dados em jobs de ETL e os carrega para análise. O Kinesis ingere dados de streaming em tempo real, o EMR executa frameworks de big data como Spark e Hadoop e o Athena consulta dados no S3 com SQL.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Kinesis", false],
            ["AWS Glue", true],
            ["Amazon EMR", false],
            ["Amazon Athena", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS usa crawlers para descobrir automaticamente e catalogar os metadados de várias fontes de dados, além de gerar scripts de ETL para transformar esses dados?",
        explanation:
            "O AWS Glue usa crawlers que examinam as fontes de dados e registram esquemas e tabelas no AWS Glue Data Catalog, e também gera scripts de ETL. O Athena consulta dados no S3 usando esse catálogo, o Redshift Spectrum consulta o S3 a partir do Redshift e o EMR processa big data com Spark e Hadoop.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Athena", false],
            ["AWS Glue", true],
            ["Amazon Redshift Spectrum", false],
            ["Amazon EMR", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS captura e processa continuamente, em tempo real, grandes volumes de dados de streaming vindos de fontes como cliques em sites, transações financeiras e feeds de redes sociais?",
        explanation:
            "O Amazon Kinesis Data Streams captura e armazena fluxos de dados em tempo real, com escala para grandes volumes vindos de cliques, transações e redes sociais. O SQS é uma fila para desacoplar componentes, o Redshift é um data warehouse para consultas analíticas e o AWS Batch processa trabalhos em lote, e não em tempo real.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Kinesis Data Streams", true],
            ["Amazon Simple Queue Service (Amazon SQS)", false],
            ["Amazon Redshift", false],
            ["AWS Batch", false],
        ],
    },
    {
        statement:
            "Para fins de recuperação de desastres, uma empresa quer manter um banco de dados no Amazon RDS sincronizado continuamente com seu banco de dados on-premises, replicando cada alteração quase em tempo real. Qual serviço da AWS oferece essa replicação contínua?",
        explanation:
            "O AWS DMS faz replicação contínua com captura de dados de alteração (CDC), aplicando no banco de destino as mudanças feitas na origem quase em tempo real. O AWS Backup cria cópias pontuais, o Multi-AZ replica apenas dentro da AWS e o Application Migration Service replica servidores inteiros para instâncias EC2, e não para o RDS.",
        topic: "Migração",
        options: [
            ["AWS Backup", false],
            ["AWS Database Migration Service (AWS DMS)", true],
            ["Implantação Multi-AZ do Amazon RDS", false],
            ["AWS Application Migration Service (AWS MGN)", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor precisa criar um fluxo sem servidor de processamento de pedidos que chama várias funções do AWS Lambda em sequência, trata erros em cada etapa, repete automaticamente as etapas que falharem e segue caminhos diferentes conforme o tipo de pedido. Qual serviço da AWS foi projetado para isso?",
        explanation:
            "O AWS Step Functions orquestra serviços em fluxos de trabalho visuais com estado, com etapas em sequência ou em paralelo, tratamento de erros, novas tentativas automáticas e ramificações condicionais. O SQS enfileira mensagens, o EventBridge roteia eventos por regras e o SNS distribui notificações, mas nenhum deles controla o estado do fluxo.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon SQS", false],
            ["Amazon EventBridge", false],
            ["AWS Step Functions", true],
            ["Amazon SNS", false],
        ],
    },
    {
        statement:
            "Uma empresa quer conectar com segurança milhões de sensores industriais à AWS, para que os dados sejam processados em tempo real e armazenados no Amazon S3. Qual serviço da AWS gerencia a conexão dos dispositivos, a autenticação e o roteamento das mensagens?",
        explanation:
            "O AWS IoT Core conecta dispositivos à nuvem em grande escala, autentica cada um com certificados e usa regras para rotear as mensagens a serviços como Kinesis e S3. O IoT Greengrass leva o processamento para a borda, perto dos dispositivos, o Kinesis processa os fluxos depois de recebidos e o Direct Connect é um link de rede dedicado.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS IoT Greengrass", false],
            ["Amazon Kinesis", false],
            ["AWS IoT Core", true],
            ["AWS Direct Connect", false],
        ],
    },
    {
        statement:
            "Uma empresa de software quer entregar seu aplicativo de desktop aos clientes pelo navegador, sem que eles precisem baixar ou instalar nada. O aplicativo deve rodar na infraestrutura da AWS e transmitir sua interface para o navegador. Qual serviço da AWS a empresa deve usar?",
        explanation:
            "O Amazon WorkSpaces Applications (antigo Amazon AppStream 2.0) executa aplicativos de desktop na AWS e transmite a interface para o navegador do usuário. O WorkSpaces entrega desktops virtuais completos por usuário, o WorkSpaces Secure Browser dá acesso seguro a sites e SaaS e o Amplify cria e hospeda aplicações web e móveis.",
        topic: "Computação",
        options: [
            ["Amazon WorkSpaces", false],
            ["Amazon WorkSpaces Secure Browser", false],
            ["Amazon WorkSpaces Applications", true],
            ["AWS Amplify", false],
        ],
    },
    {
        statement:
            "Uma empresa quer substituir os computadores físicos por desktops virtuais hospedados na nuvem, acessíveis de qualquer dispositivo, com cada funcionário tendo seu próprio desktop persistente e personalizado. Qual serviço da AWS oferece esse recurso?",
        explanation:
            "O Amazon WorkSpaces é o serviço gerenciado de desktops virtuais: na modalidade WorkSpaces Personal, cada usuário recebe um desktop persistente, acessível de vários dispositivos. O WorkSpaces Applications transmite aplicativos específicos, o Secure Browser só dá acesso a sites e SaaS e o EC2 exigiria montar e gerenciar a solução de desktops.",
        topic: "Computação",
        options: [
            ["Amazon WorkSpaces Applications", false],
            ["Amazon WorkSpaces", true],
            ["Amazon WorkSpaces Secure Browser", false],
            ["Amazon EC2", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que os funcionários usem dispositivos pessoais, não gerenciados, para acessar pelo navegador aplicações web internas e ferramentas SaaS aprovadas, com o menor custo e sem que dados corporativos possam ser baixados ou copiados para esses dispositivos. Qual serviço da AWS foi criado para esse caso de uso?",
        explanation:
            "O Amazon WorkSpaces Secure Browser (antigo WorkSpaces Web) exibe as páginas a partir de um navegador isolado na AWS, sem que os dados cheguem ao dispositivo, e pode bloquear download, impressão e cópia. O WorkSpaces entrega desktops completos, o Client VPN dá acesso de rede ao dispositivo e o Session Manager serve para administrar instâncias.",
        topic: "Computação",
        options: [
            ["Amazon WorkSpaces", false],
            ["AWS Client VPN", false],
            ["AWS Systems Manager Session Manager", false],
            ["Amazon WorkSpaces Secure Browser", true],
        ],
    },
    {
        statement:
            "Um desenvolvedor front-end quer criar e implantar na AWS uma aplicação web full-stack com autenticação de usuários, API de dados e hospedagem, sem configurar nem gerenciar a infraestrutura de nuvem por trás. Qual serviço da AWS oferece uma plataforma integrada de desenvolvimento e implantação para esse caso?",
        explanation:
            "O AWS Amplify reúne bibliotecas, ferramentas e hospedagem com implantação contínua para que desenvolvedores front-end criem aplicações web e móveis full-stack com autenticação, dados e armazenamento. O Elastic Beanstalk implanta aplicações de back-end em servidores, o Lightsail oferece servidores virtuais simples e o AppSync é só a camada de API GraphQL.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Elastic Beanstalk", false],
            ["AWS Amplify", true],
            ["Amazon Lightsail", false],
            ["AWS AppSync", false],
        ],
    },
    {
        statement:
            "A aplicação de e-commerce de uma empresa precisa enviar automaticamente, em grande volume e direto do código, e-mails de confirmação de pedido, avisos de envio e redefinição de senha para os clientes. Qual serviço da AWS foi projetado para esse caso de uso?",
        explanation:
            "O Amazon SES é o serviço de envio de e-mail em escala para mensagens transacionais e de marketing, com gestão de reputação, tratamento de devoluções e métricas de entrega. O SNS entrega notificações pub/sub a assinantes, o Connect é uma central de atendimento e o AWS End User Messaging envia SMS, voz e push, mas não e-mail.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon Simple Notification Service (Amazon SNS)", false],
            ["Amazon Simple Email Service (Amazon SES)", true],
            ["Amazon Connect", false],
            ["AWS End User Messaging", false],
        ],
    },
    {
        statement:
            "Uma empresa recebe milhares de formulários em papel digitalizados por dia e precisa extrair automaticamente textos, tabelas e valores de campos específicos desses documentos, sem precisar treinar modelos de machine learning próprios. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon Textract extrai texto impresso, escrita à mão, tabelas e pares de campo e valor de documentos digitalizados, entendendo a estrutura dos formulários. O Comprehend analisa textos já extraídos, o Rekognition detecta objetos e textos soltos em imagens, sem entender formulários, e o Transcribe converte áudio em texto.",
        topic: "Machine learning",
        options: [
            ["Amazon Comprehend", false],
            ["Amazon Rekognition", false],
            ["Amazon Transcribe", false],
            ["Amazon Textract", true],
        ],
    },
    {
        statement:
            "Uma equipe está criando um aplicativo móvel colaborativo no qual vários usuários precisam ver em tempo real as alterações em dados compartilhados. A equipe quer usar GraphQL e que o back-end envie automaticamente as mudanças a todos os clientes conectados. Qual serviço da AWS oferece APIs GraphQL gerenciadas com sincronização de dados em tempo real?",
        explanation:
            "O AWS AppSync é o serviço gerenciado de APIs GraphQL da AWS e, por meio de assinaturas (subscriptions), envia as alterações de dados em tempo real a todos os clientes conectados. O API Gateway cria APIs REST, HTTP e WebSocket sem GraphQL nativo, o Kinesis processa streaming de dados e o Amplify é o conjunto de ferramentas que consome essas APIs.",
        topic: "Ferramentas e suporte",
        options: [
            ["Amazon API Gateway", false],
            ["Amazon Kinesis", false],
            ["AWS AppSync", true],
            ["AWS Amplify", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece sistemas de arquivos de terceiros totalmente gerenciados, otimizados para cargas de trabalho como computação de alto desempenho (HPC), machine learning e aplicações baseadas em Windows?",
        explanation:
            "O Amazon FSx oferece sistemas de arquivos gerenciados baseados em tecnologias de terceiros: FSx for Lustre para HPC e ML, FSx for Windows File Server, FSx for NetApp ONTAP e FSx for OpenZFS. O EBS é armazenamento em bloco para instâncias EC2, o S3 guarda objetos acessados por API e o EFS é um sistema de arquivos NFS nativo da AWS.",
        topic: "Armazenamento",
        options: [
            ["Amazon EBS", false],
            ["Amazon S3", false],
            ["Amazon FSx", true],
            ["Amazon EFS", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa acompanhar e gerenciar suas licenças de software da Microsoft e da Oracle enquanto migra cargas de trabalho para a AWS, evitando usar mais licenças do que contratou. Qual serviço da AWS ajuda a manter a conformidade com essas licenças?",
        explanation:
            "O AWS License Manager centraliza o controle de licenças de fornecedores como Microsoft, Oracle e SAP na AWS e on-premises, com regras que acompanham o uso e impedem exceder o contratado. O Systems Manager cuida de tarefas operacionais como patches, o Config avalia configurações de recursos e o Service Catalog controla quais produtos podem ser implantados.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Systems Manager", false],
            ["AWS License Manager", true],
            ["AWS Config", false],
            ["AWS Service Catalog", false],
        ],
    },
    {
        statement:
            "Uma empresa executa aplicações em contêineres no Amazon ECS e precisa de um registro totalmente gerenciado para armazenar, gerenciar e implantar imagens de contêineres Docker. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon Elastic Container Registry (Amazon ECR) é o registro gerenciado de imagens de contêiner da AWS, integrado ao ECS e ao EKS, com varredura de vulnerabilidades e políticas de ciclo de vida. O S3 guarda objetos sem oferecer a API de registro Docker, o CodeCommit hospeda repositórios Git e o CodeArtifact armazena pacotes como npm e Maven.",
        topic: "Computação",
        options: [
            ["Amazon S3", false],
            ["AWS CodeCommit", false],
            ["Amazon ECR", true],
            ["AWS CodeArtifact", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma solução de recuperação de desastres de baixo custo que, se o site principal falhar, recupere seus servidores on-premises na AWS em minutos e com perda mínima de dados. Qual serviço da AWS ela deve usar?",
        explanation:
            "O AWS Elastic Disaster Recovery replica continuamente os servidores de origem para uma área de preparação de baixo custo na AWS e, em caso de desastre, inicia instâncias de recuperação em minutos. O AWS Backup faz cópias pontuais, a replicação entre Regiões copia apenas objetos do S3 e o DataSync só transfere dados.",
        topic: "Armazenamento",
        options: [
            ["AWS Backup", false],
            ["AWS Elastic Disaster Recovery", true],
            ["Replicação entre Regiões (CRR) do Amazon S3", false],
            ["AWS DataSync", false],
        ],
    },
    {
        statement:
            "Uma empresa com várias contas da AWS em uma organização quer compartilhar sub-redes de VPC e gateways do AWS Transit Gateway entre as contas, sem duplicar esses recursos em cada uma. Qual serviço da AWS permite isso?",
        explanation:
            "O AWS Resource Access Manager (AWS RAM) compartilha com segurança recursos como sub-redes de VPC, Transit Gateways e regras do Route 53 Resolver com outras contas ou com toda a organização. O Organizations governa as contas, o emparelhamento de VPC só conecta duas VPCs e o Control Tower configura um ambiente multiconta.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Organizations", false],
            ["Emparelhamento de VPC (VPC peering)", false],
            ["AWS Resource Access Manager", true],
            ["AWS Control Tower", false],
        ],
    },
    {
        statement:
            "Uma empresa quer oferecer aos funcionários um assistente de IA generativa pronto para uso, que responde a perguntas sobre os dados da empresa, gera conteúdo e automatiza tarefas a partir das fontes de conhecimento corporativas, sem que a equipe precise desenvolver a aplicação. Qual serviço da AWS ela deve usar?",
        explanation:
            "O Amazon Quick, sucessor do Amazon Q Business, é um assistente de IA pronto para uso que responde com base nos dados da empresa, pesquisa, cria conteúdo e automatiza tarefas com agentes e fluxos. O SageMaker AI serve para criar modelos de ML, o Lex para desenvolver chatbots e o Bedrock para construir aplicações próprias de IA generativa.",
        topic: "Machine learning",
        options: [
            ["Amazon SageMaker AI", false],
            ["Amazon Quick", true],
            ["Amazon Lex", false],
            ["Amazon Bedrock", false],
        ],
    },
];
