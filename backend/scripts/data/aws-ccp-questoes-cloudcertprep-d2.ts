// Questões do simulado AWS Certified Cloud Practitioner (CLF-C02), domínio 2 da prova
// (Security and Compliance), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aws-ccp-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D2: Questao[] = [
    {
        statement:
            "Uma equipe percebeu que várias instâncias críticas do Amazon EC2 foram encerradas. Qual serviço da AWS ajuda a descobrir quem executou essa ação?",
        explanation:
            "O AWS CloudTrail registra as chamadas de API da conta com a identidade de quem as fez, o horário e o IP de origem, então mostra quem encerrou as instâncias. O Inspector procura vulnerabilidades, o Trusted Advisor faz recomendações e o relatório de uso traz apenas dados de consumo.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Inspector", false],
            ["AWS CloudTrail", true],
            ["AWS Trusted Advisor", false],
            ["Relatório de uso de instâncias do Amazon EC2", false],
        ],
    },
    {
        statement:
            "Qual afirmação sobre o modelo de responsabilidade compartilhada da AWS está correta?",
        explanation:
            "A divisão muda conforme o tipo de serviço: no Amazon EC2 (IaaS) o cliente cuida do sistema operacional convidado, enquanto em serviços gerenciados como o Amazon RDS a AWS assume mais camadas. Por isso não dá para dizer que IaaS, patches do sistema convidado ou serviços gerenciados ficam sempre com um único lado.",
        topic: "Segurança e identidade",
        options: [
            ["A divisão de responsabilidades varia de acordo com os serviços utilizados", true],
            ["A segurança dos serviços de IaaS é responsabilidade exclusiva da AWS", false],
            ["A aplicação de patches no sistema operacional convidado é sempre da AWS", false],
            ["A segurança dos serviços gerenciados é responsabilidade exclusiva do cliente", false],
        ],
    },
    {
        statement:
            "Centenas de milhares de ataques DDoS são registrados todos os meses no mundo. Quais serviços da AWS ajudam a proteger os clientes contra esses ataques? (Selecione DUAS opções.)",
        explanation:
            "O AWS Shield oferece proteção gerenciada contra DDoS nas camadas de rede e de transporte, e o AWS WAF ajuda contra ataques na camada de aplicação, como inundações HTTP, com regras baseadas em taxa. O Config registra configurações, o Cognito autentica usuários de aplicativos e o KMS gerencia chaves.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Shield", true],
            ["AWS Config", false],
            ["Amazon Cognito", false],
            ["AWS WAF", true],
            ["AWS Key Management Service (AWS KMS)", false],
        ],
    },
    {
        statement: "Qual serviço permite que os clientes gerenciem os acordos firmados com a AWS?",
        explanation:
            "O AWS Artifact é o portal de autoatendimento em que o cliente consulta, aceita e gerencia acordos com a AWS, como o BAA, além de baixar relatórios de conformidade. O ACM gerencia certificados SSL/TLS, o Config avalia a configuração dos recursos e o Organizations administra várias contas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Artifact", true],
            ["AWS Certificate Manager (ACM)", false],
            ["AWS Config", false],
            ["AWS Organizations", false],
        ],
    },
    {
        statement:
            "Quais são exemplos de serviços gerenciados, em que a AWS opera e mantém o sistema operacional e a plataforma que executam o serviço? (Selecione DUAS opções.)",
        explanation:
            "No Amazon DynamoDB e no Amazon EMR, a AWS provisiona, corrige e mantém a plataforma do serviço. Amazon EC2, Amazon EBS e Amazon VPC são serviços de infraestrutura: a AWS mantém o hardware, mas o cliente configura e opera as instâncias, os volumes e as redes.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon VPC", false],
            ["Amazon DynamoDB", true],
            ["Amazon EMR", true],
            ["Amazon EBS", false],
            ["Amazon Elastic Compute Cloud (Amazon EC2)", false],
        ],
    },
    {
        statement:
            "Uma empresa com o plano AWS Basic Support percebeu que recursos da AWS de outra conta estão sendo usados em atividades maliciosas contra os sistemas dela. O que ela deve fazer?",
        explanation:
            "A equipe AWS Trust & Safety (antiga AWS Abuse team) recebe denúncias de uso malicioso de recursos da AWS, e esse canal está disponível em qualquer plano de suporte. O atendimento ao cliente e o Concierge cuidam de conta e faturamento, e a equipe de segurança da AWS trata vulnerabilidades da própria AWS.",
        topic: "Ferramentas e suporte",
        options: [
            ["Entrar em contato com a equipe de atendimento ao cliente da AWS", false],
            ["Entrar em contato com a equipe AWS Trust & Safety", true],
            ["Entrar em contato com a equipe de Concierge da AWS", false],
            ["Entrar em contato com a equipe de segurança da AWS", false],
        ],
    },
    {
        statement:
            "A AWS classifica alguns controles de segurança como compartilhados, pois se aplicam tanto à infraestrutura dela quanto ao ambiente do cliente. Quais são exemplos desses controles? (Selecione DUAS opções.)",
        explanation:
            "Gerenciamento de patches e de configuração são controles compartilhados: a AWS cuida da própria infraestrutura e o cliente, dos seus sistemas operacionais, aplicações e recursos. IAM e VPC são configurados só pelo cliente, e a operação dos data centers é só da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Gerenciamento de patches", true],
            ["Gerenciamento do IAM", false],
            ["Gerenciamento da VPC", false],
            ["Gerenciamento de configuração", true],
            ["Operação dos data centers físicos", false],
        ],
    },
    {
        statement: "Pelo modelo de responsabilidade compartilhada, qual destas tarefas cabe à AWS?",
        explanation:
            "Configurar os dispositivos físicos de infraestrutura (servidores, rede e armazenamento) faz parte da segurança da nuvem, a cargo da AWS. Criptografar do lado do cliente, gerenciar as chaves de criptografia dos dados e definir regras de grupos de segurança são tarefas do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Criptografar os dados do lado do cliente", false],
            ["Configurar os dispositivos de infraestrutura", true],
            ["Gerenciar as chaves de criptografia dos dados", false],
            ["Filtrar o tráfego das instâncias com grupos de segurança", false],
        ],
    },
    {
        statement:
            "Uma empresa está desenvolvendo uma aplicação web crítica na AWS e trata a segurança como prioridade máxima. Qual serviço da AWS fornece recomendações de otimização da segurança da infraestrutura?",
        explanation:
            "O AWS Trusted Advisor analisa o ambiente e aponta recomendações de boas práticas, inclusive de segurança, como grupos de segurança abertos e usuário raiz sem MFA. O Shield protege contra DDoS, o console é só a interface web de gerenciamento e o Secrets Manager guarda e rotaciona segredos.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Shield", false],
            ["Console de Gerenciamento da AWS", false],
            ["AWS Secrets Manager", false],
            ["AWS Trusted Advisor", true],
        ],
    },
    {
        statement:
            "Ao revisar o modelo de responsabilidade compartilhada, uma equipe precisa listar o que é tarefa dela. Quais atividades cabem ao cliente? (Selecione DUAS opções.)",
        explanation:
            "O cliente define as regras de senha dos usuários do IAM e as regras de acesso à rede, como grupos de segurança e Network ACLs (segurança na nuvem). Descartar discos, controlar o acesso físico e aplicar patches na infraestrutura de rede são tarefas da AWS (segurança da nuvem).",
        topic: "Segurança e identidade",
        options: [
            ["Descarte seguro de discos de armazenamento", false],
            ["Controle do acesso físico aos recursos de computação", false],
            ["Aplicação de patches na infraestrutura de rede", false],
            ["Definição de regras de complexidade de senhas", true],
            ["Configuração de regras de acesso à rede", true],
        ],
    },
    {
        statement:
            "Segundo o modelo de responsabilidade compartilhada da AWS, quem é responsável pelo gerenciamento de configuração?",
        explanation:
            "Gerenciamento de configuração é um controle compartilhado: a AWS configura e mantém os dispositivos da sua infraestrutura, e o cliente configura os próprios sistemas operacionais convidados, bancos de dados e aplicações. Por isso não é exclusivo de nenhum dos lados e faz parte do modelo.",
        topic: "Segurança e identidade",
        options: [
            ["É responsabilidade exclusiva do cliente", false],
            ["É responsabilidade exclusiva da AWS", false],
            ["É compartilhado entre a AWS e o cliente", true],
            ["Não faz parte do modelo de responsabilidade compartilhada", false],
        ],
    },
    {
        statement:
            "Uma empresa quer saber quais tarefas de segurança continuam com ela depois de migrar para a AWS. Quais são de responsabilidade do cliente? (Selecione DUAS opções.)",
        explanation:
            "Proteger os dados, inclusive com criptografia em repouso, e treinar os próprios usuários em segurança são tarefas do cliente (segurança na nuvem). Servidores NTP, acesso físico aos data centers e descarte de hardware fazem parte da infraestrutura mantida pela AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Garantir que os dados da aplicação sejam criptografados em repouso", true],
            ["Garantir que os servidores NTP da AWS estejam com o horário correto", false],
            ["Garantir o treinamento de segurança dos próprios usuários", true],
            ["Garantir que o acesso físico aos data centers seja restrito", false],
            ["Garantir que o hardware antigo seja descartado corretamente", false],
        ],
    },
    {
        statement:
            "Para que servem as chaves de acesso do AWS Identity and Access Management (IAM)?",
        explanation:
            "As chaves de acesso (ID da chave de acesso e chave de acesso secreta) autenticam chamadas programáticas feitas pela AWS CLI, pelos SDKs ou direto pela API. O console usa nome de usuário e senha, o login em instâncias EC2 usa pares de chaves e a criptografia no S3 usa chaves do KMS ou gerenciadas pelo S3.",
        topic: "Segurança e identidade",
        options: [
            ["Fazer login no Console de Gerenciamento da AWS", false],
            ["Fazer chamadas programáticas às APIs da AWS", true],
            ["Fazer login em instâncias do Amazon EC2", false],
            ["Criptografar dados armazenados no Amazon S3", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS podem ser usados para reunir informações sobre a atividade de uma conta AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudTrail registra as chamadas de API e as ações feitas na conta, e o Amazon CloudWatch coleta métricas, logs e eventos dos recursos, permitindo acompanhar essa atividade e criar alertas. O CloudFront é uma CDN, o CloudFormation provisiona recursos a partir de modelos e o CloudHSM oferece módulos de segurança de hardware.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon CloudFront", false],
            ["AWS CloudFormation", false],
            ["AWS CloudTrail", true],
            ["AWS CloudHSM", false],
            ["Amazon CloudWatch", true],
        ],
    },
    {
        statement:
            "Qual recurso do IAM permite que desenvolvedores acessem os serviços da AWS pela AWS Command Line Interface (AWS CLI)?",
        explanation:
            "A AWS CLI se autentica com chaves de acesso do IAM, formadas pelo ID da chave de acesso e pela chave de acesso secreta (hoje a AWS recomenda preferir credenciais temporárias). Nome de usuário e senha servem para o Console de Gerenciamento, chaves SSH dão acesso a instâncias Linux e chave de API não é credencial do IAM.",
        topic: "Segurança e identidade",
        options: [
            ["Chaves de API", false],
            ["Chaves de acesso", true],
            ["Nome de usuário e senha", false],
            ["Chaves SSH", false],
        ],
    },
    {
        statement:
            "Ao executar cargas de trabalho na AWS, por qual ação o cliente é o único responsável?",
        explanation:
            "Controles específicos da aplicação, como rotear ou segmentar o tráfego dela entre ambientes de segurança, são exclusivos do cliente. Aplicar patches e manter a infraestrutura subjacente, assim como os controles físicos e ambientais dos data centers, são responsabilidades da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Aplicar patches nos componentes da infraestrutura", false],
            ["Manter os componentes da infraestrutura subjacente", false],
            ["Manter os controles físicos e ambientais dos data centers", false],
            ["Implementar controles para rotear o tráfego da aplicação", true],
        ],
    },
    {
        statement: "Em qual área a auditoria é responsabilidade exclusiva da AWS?",
        explanation:
            "Os controles de segurança física dos data centers (acesso às instalações, vigilância e descarte de hardware) são auditados só pela AWS, já que o cliente não tem acesso a eles. Políticas do IAM, políticas de bucket do S3 e a análise dos logs do CloudTrail são configuradas e auditadas pelo cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Políticas do IAM", false],
            ["Segurança física", true],
            ["Políticas de bucket do Amazon S3", false],
            ["Logs do AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Quais tarefas comuns de TI a AWS pode assumir, por meio de serviços gerenciados como o Amazon RDS, para liberar a equipe de TI da empresa? (Selecione DUAS opções.)",
        explanation:
            "Em serviços gerenciados como o Amazon RDS, a AWS aplica os patches do mecanismo do banco e faz backups automáticos, liberando a equipe do cliente. Testar versões da aplicação, criar o esquema do banco e realizar testes de penetração dependem do conhecimento do negócio e continuam com o cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Aplicar patches no banco de dados", true],
            ["Testar novas versões da aplicação", false],
            ["Fazer backup dos bancos de dados", true],
            ["Criar o esquema do banco de dados", false],
            ["Executar testes de penetração", false],
        ],
    },
    {
        statement:
            "Um cliente precisa auditar o gerenciamento de mudanças dos seus recursos da AWS. Qual serviço da AWS ele deve usar?",
        explanation:
            "O AWS Config registra continuamente a configuração dos recursos e mantém o histórico de alterações, mostrando o que mudou e quando, o que permite auditar o gerenciamento de mudanças. O Trusted Advisor faz recomendações, o CloudWatch monitora métricas e logs e o Artifact entrega relatórios de conformidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Config", true],
            ["AWS Trusted Advisor", false],
            ["Amazon CloudWatch", false],
            ["AWS Artifact", false],
        ],
    },
    {
        statement:
            "Ao usar a AWS Command Line Interface (AWS CLI), qual entidade do IAM fica associada a um ID de chave de acesso e a uma chave de acesso secreta?",
        explanation:
            "O usuário do IAM pode ter chaves de acesso de longo prazo (ID da chave e chave secreta) configuradas na AWS CLI. O grupo apenas reúne usuários, a função do IAM fornece credenciais temporárias quando é assumida e a política é um documento JSON de permissões, não uma identidade.",
        topic: "Segurança e identidade",
        options: [
            ["Grupo do IAM", false],
            ["Usuário do IAM", true],
            ["Função do IAM (IAM role)", false],
            ["Política do IAM", false],
        ],
    },
    {
        statement:
            "Pelo modelo de responsabilidade compartilhada, qual destes itens fica a cargo do cliente?",
        explanation:
            "A AWS oferece os recursos de criptografia, mas cabe ao cliente decidir e garantir que seus dados sejam criptografados em repouso. Apagar discos usados, atualizar o firmware do hardware e manter o cabeamento de rede fazem parte da infraestrutura física, responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Garantir que os discos sejam apagados após o uso", false],
            ["Garantir que o firmware dos dispositivos de hardware esteja atualizado", false],
            ["Garantir que os dados sejam criptografados em repouso", true],
            ["Garantir que os cabos de rede sejam de categoria 6 ou superior", false],
        ],
    },
    {
        statement:
            "Quais componentes de credencial são necessários para obter acesso programático a uma conta AWS? (Selecione DUAS opções.)",
        explanation:
            "O acesso programático usa o ID da chave de acesso, que identifica quem faz a chamada, e a chave de acesso secreta, que assina as requisições. Chave primária e chave secundária não são credenciais do IAM, e o ID de usuário é só um identificador interno, que não autentica chamadas.",
        topic: "Segurança e identidade",
        options: [
            ["Um ID de chave de acesso", true],
            ["Uma chave primária da conta", false],
            ["Uma chave de acesso secreta", true],
            ["Um ID de usuário do IAM", false],
            ["Uma chave secundária da conta", false],
        ],
    },
    {
        statement: "Qual destes itens é um controle compartilhado entre o cliente e a AWS?",
        explanation:
            "Conscientização e treinamento é um controle compartilhado: a AWS treina os próprios funcionários e o cliente treina os dele. A chave da criptografia do lado do cliente e a configuração do sistema operacional da instância são só do cliente, e os controles ambientais dos data centers são só da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Fornecer a chave usada na criptografia do lado do cliente no Amazon S3", false],
            ["Configurar o sistema operacional de uma instância do Amazon EC2", false],
            ["Manter os controles ambientais dos data centers físicos da AWS", false],
            ["Conscientizar e treinar as equipes sobre as práticas de segurança", true],
        ],
    },
    {
        statement:
            "Quais medidas de segurança protegem o acesso a uma conta AWS? (Selecione DUAS opções.)",
        explanation:
            "Conceder só as permissões necessárias limita o estrago de uma credencial comprometida, e o MFA exige um segundo fator além da senha. O CloudTrail registra a atividade, mas não impede acessos; compartilhar um usuário do IAM elimina a rastreabilidade individual; o CloudFront é uma CDN.",
        topic: "Segurança e identidade",
        options: [
            ["Ativar o AWS CloudTrail para registrar as chamadas de API", false],
            ["Conceder acesso com privilégio mínimo aos usuários do IAM", true],
            ["Criar um único usuário do IAM e compartilhá-lo entre vários desenvolvedores", false],
            ["Ativar o Amazon CloudFront para distribuir o conteúdo", false],
            ["Ativar a autenticação multifator (MFA) para usuários com privilégios", true],
        ],
    },
    {
        statement:
            "Qual atividade é responsabilidade do cliente na Nuvem AWS, de acordo com o modelo de responsabilidade compartilhada?",
        explanation:
            "Fazer backup dos volumes do Amazon EBS, por exemplo com snapshots, é tarefa do cliente: a AWS mantém a infraestrutura, mas não cria cópias de segurança dos dados por conta própria. A conectividade com a internet, a correção de falhas na infraestrutura e a segurança física dos data centers ficam com a AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Garantir a conectividade de rede entre a AWS e a internet", false],
            ["Aplicar patches e corrigir falhas na infraestrutura da Nuvem AWS", false],
            ["Garantir a segurança física dos data centers da nuvem", false],
            ["Garantir que os volumes do Amazon EBS tenham backup", true],
        ],
    },
    {
        statement:
            "Como um cliente pode aumentar a segurança do login nas contas AWS? (Selecione DUAS opções.)",
        explanation:
            "O MFA exige um segundo fator além da senha, e uma política de senhas fortes impõe tamanho mínimo, complexidade e troca periódica. O ACM gerencia certificados SSL/TLS, o Cognito autentica usuários de aplicativos, não o login na conta, e o Organizations administra várias contas.",
        topic: "Segurança e identidade",
        options: [
            ["Configurar o AWS Certificate Manager (ACM)", false],
            ["Ativar a autenticação multifator (MFA)", true],
            ["Usar o Amazon Cognito para gerenciar o acesso", false],
            ["Configurar uma política de senhas fortes", true],
            ["Ativar o AWS Organizations para as contas", false],
        ],
    },
    {
        statement:
            "Em qual destes serviços o cliente é responsável por manter a configuração do sistema operacional, a aplicação de patches de segurança e a configuração de rede?",
        explanation:
            "No Amazon EC2 o cliente controla o sistema operacional convidado, então cuida da configuração dele, dos patches e da rede das instâncias. No Amazon RDS e no Amazon ElastiCache a AWS gerencia o sistema operacional, e no AWS Fargate os servidores dos contêineres também ficam com a AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon RDS", false],
            ["Amazon EC2", true],
            ["Amazon ElastiCache", false],
            ["AWS Fargate", false],
        ],
    },
    {
        statement:
            "Um profissional de nuvem precisa verificar se algum grupo de segurança de uma conta AWS permite acesso irrestrito a portas específicas. Qual é a maneira MAIS SIMPLES de fazer isso?",
        explanation:
            "O AWS Trusted Advisor já tem uma verificação que aponta grupos de segurança com portas específicas liberadas sem restrição, então basta executá-lo e ler o resultado. Revisar grupo por grupo é lento, o IAM não tem regras de entrada e uma regra personalizada do Config com Lambda exige muito mais esforço.",
        topic: "Segurança e identidade",
        options: [
            [
                "Revisar as regras de entrada de cada grupo de segurança no console do Amazon EC2",
                false,
            ],
            ["Executar o AWS Trusted Advisor e analisar os resultados das verificações", true],
            ["Abrir o console do IAM e verificar as regras de entrada com acesso aberto", false],
            [
                "Criar uma regra personalizada do AWS Config que invoque uma função do AWS Lambda",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais destes serviços têm recursos de mitigação de ataques distribuídos de negação de serviço (DDoS)? (Selecione DUAS opções.)",
        explanation:
            "O AWS WAF bloqueia inundações na camada de aplicação com regras baseadas em taxa, e o Amazon CloudFront distribui o tráfego entre pontos de presença e já conta com o AWS Shield Standard. O Secrets Manager guarda segredos, o EC2 depende de outros serviços para essa proteção e o Inspector procura vulnerabilidades.",
        topic: "Segurança e identidade",
        options: [
            ["AWS WAF", true],
            ["AWS Secrets Manager", false],
            ["Amazon EC2", false],
            ["Amazon CloudFront", true],
            ["Amazon Inspector", false],
        ],
    },
    {
        statement: "O que os usuários podem acessar pelo AWS Artifact?",
        explanation:
            "O AWS Artifact dá acesso sob demanda a documentos de segurança e conformidade da AWS, como relatórios SOC e atestados PCI DSS. O histórico de configuração dos recursos vem do AWS Config, o treinamento vem do AWS Skill Builder e a avaliação de vulnerabilidades é feita pelo Amazon Inspector.",
        topic: "Segurança e identidade",
        options: [
            ["Relatórios e documentos de segurança e conformidade da AWS", true],
            ["Um download dos detalhes de configuração de todos os recursos da AWS", false],
            ["Materiais de treinamento sobre os serviços da AWS", false],
            ["Uma avaliação de segurança das aplicações implantadas na Nuvem AWS", false],
        ],
    },
    {
        statement:
            "Qual destes recursos pode limitar o acesso a um bucket do Amazon S3 a usuários específicos?",
        explanation:
            "Políticas do IAM anexadas a usuários ou grupos definem quem pode acessar o bucket e quais ações cada um pode executar. Pares de chaves servem para login em instâncias EC2, o Inspector procura vulnerabilidades e grupos de segurança filtram tráfego de rede de instâncias, não o acesso a buckets.",
        topic: "Segurança e identidade",
        options: [
            ["Um par de chaves pública e privada", false],
            ["Amazon Inspector", false],
            ["Políticas do IAM", true],
            ["Grupos de segurança", false],
        ],
    },
    {
        statement: "Qual destas tarefas é responsabilidade da AWS?",
        explanation:
            "Proteger o hipervisor que executa as instâncias do Amazon EC2 faz parte da infraestrutura de virtualização, dentro da segurança da nuvem mantida pela AWS. Criptografar dados do lado do cliente, configurar funções do IAM e definir políticas de senha são tarefas do cliente (segurança na nuvem).",
        topic: "Segurança e identidade",
        options: [
            ["Criptografar os dados do lado do cliente", false],
            ["Configurar funções do IAM (IAM roles)", false],
            ["Proteger o hipervisor do Amazon EC2", true],
            ["Definir as políticas de senha dos usuários", false],
        ],
    },
    {
        statement:
            "Uma empresa executa aplicações em instâncias do Amazon EC2. Pelo modelo de responsabilidade compartilhada, quais áreas são de responsabilidade dela? (Selecione DUAS opções.)",
        explanation:
            "Em instâncias do Amazon EC2, o cliente aplica os patches do sistema operacional convidado e configura os grupos de segurança que filtram o tráfego. Firmware da infraestrutura de rede, patches do hipervisor e segurança física dos data centers são responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Atualização do firmware da infraestrutura de rede", false],
            ["Aplicação de patches nos sistemas operacionais", true],
            ["Aplicação de patches no hipervisor subjacente", false],
            ["Segurança física dos data centers", false],
            ["Configuração dos grupos de segurança", true],
        ],
    },
    {
        statement:
            "Uma empresa migrou para a AWS recentemente. Quais serviços da AWS ajudam a garantir que ela tenha as configurações de segurança adequadas? (Selecione DUAS opções.)",
        explanation:
            "O AWS Trusted Advisor verifica boas práticas de segurança, como portas abertas e MFA no usuário raiz, e o Amazon Inspector avalia instâncias e cargas de trabalho em busca de vulnerabilidades e exposição de rede. O SNS envia notificações, o CloudWatch monitora métricas e o Concierge ajuda com conta e faturamento.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Trusted Advisor", true],
            ["Amazon Inspector", true],
            ["Amazon SNS", false],
            ["Amazon CloudWatch", false],
            ["Equipe de Concierge do AWS Support", false],
        ],
    },
    {
        statement:
            "Qual recurso da AWS adiciona um nível extra de segurança além do mecanismo padrão de autenticação com nome de usuário e senha?",
        explanation:
            "A autenticação multifator (MFA) exige, além do nome de usuário e da senha, um código ou uma chave de um dispositivo físico ou virtual. Chaves criptografadas e o AWS KMS protegem dados, não o login, e a verificação por e-mail confirma o endereço, sem acrescentar um fator a cada acesso.",
        topic: "Segurança e identidade",
        options: [
            ["Chaves criptografadas", false],
            ["Verificação por e-mail", false],
            ["AWS Key Management Service (AWS KMS)", false],
            ["Autenticação multifator (MFA)", true],
        ],
    },
    {
        statement:
            "De acordo com a política da AWS para testes de penetração, qual afirmação sobre esses testes em instâncias do Amazon EC2 está correta?",
        explanation:
            "Pela política de testes de penetração da AWS, o cliente pode avaliar os próprios recursos em serviços permitidos, como o Amazon EC2, sem aprovação prévia, desde que não faça ataques DoS. Os testes não são proibidos, a AWS não os executa pelo cliente e a lista de permitidos não se limita a serviços gerenciados.",
        topic: "Segurança e identidade",
        options: [
            ["Testes de penetração não são permitidos em nenhum serviço da AWS", false],
            ["A AWS executa testes de penetração automáticos na infraestrutura do cliente", false],
            ["O cliente pode testar as próprias instâncias sem autorização prévia da AWS", true],
            [
                "Os clientes só podem fazer testes de penetração em serviços gerenciados pela AWS",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa guarda arquivos no Amazon S3 e roda aplicações no Amazon EC2. Quais tarefas de segurança cabem a ela nesse cenário? (Selecione DUAS opções.)",
        explanation:
            "O cliente protege os próprios dados, inclusive com criptografia (HTTPS/TLS) no tráfego com o S3, e aplica patches no sistema e nas aplicações das instâncias EC2. Eventos ambientais e acesso físico aos data centers e às Regiões, assim como a configuração do host físico do EC2, ficam com a AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Gerenciar eventos ambientais nos data centers da AWS", false],
            ["Proteger a confidencialidade dos dados em trânsito no Amazon S3", true],
            ["Controlar o acesso físico às Regiões da AWS", false],
            ["Garantir que o host subjacente do Amazon EC2 esteja bem configurado", false],
            ["Aplicar patches nas aplicações instaladas no Amazon EC2", true],
        ],
    },
    {
        statement:
            "Quais atividades cabem somente à AWS, sem qualquer participação do cliente? (Selecione DUAS opções.)",
        explanation:
            "Construir e manter os hipervisores e fazer a manutenção do hardware físico cabem só à AWS, pois o cliente não tem acesso a essas camadas. Monitorar o desempenho da rede das próprias aplicações, instalar software nas instâncias EC2 e configurar Network ACLs são tarefas do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Monitorar o desempenho da rede das aplicações", false],
            ["Instalar software nas instâncias EC2", false],
            ["Criar e manter os hipervisores", true],
            ["Configurar as Network ACLs da VPC", false],
            ["Fazer a manutenção do hardware físico", true],
        ],
    },
    {
        statement:
            "Quais são as credenciais de segurança padrão exigidas para que um usuário do IAM acesse o Console de Gerenciamento da AWS?",
        explanation:
            "Por padrão, um usuário do IAM entra no Console de Gerenciamento com nome de usuário e senha. O MFA é um fator adicional opcional, tokens de segurança temporários vêm de funções assumidas e chaves de acesso servem para chamadas programáticas pela AWS CLI, pelos SDKs ou pela API.",
        topic: "Segurança e identidade",
        options: [
            ["Autenticação multifator (MFA)", false],
            ["Tokens de segurança temporários", false],
            ["Nome de usuário e senha", true],
            ["Chaves de acesso do IAM", false],
        ],
    },
    {
        statement: "Quais aspectos da segurança são gerenciados pela AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS aplica patches e mantém o hardware físico, além de proteger a infraestrutura global (data centers, energia e rede). A criptografia dos volumes do Amazon EBS, a configuração de segurança da VPC (grupos de segurança e Network ACLs) e as permissões de acesso do IAM ficam com o cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Criptografia dos volumes do Amazon EBS", false],
            ["Configuração da segurança da VPC", false],
            ["Definição das permissões de acesso", false],
            ["Atualização do firmware do hardware", true],
            ["Proteção da infraestrutura física", true],
        ],
    },
    {
        statement:
            "Quais ferramentas de gerenciamento de mudanças ajudam os clientes da AWS a auditar e monitorar todas as alterações de recursos no ambiente? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudTrail registra as chamadas de API que alteram os recursos (quem fez o quê e quando), e o AWS Config registra o histórico de configuração e avalia a conformidade. O Comprehend analisa texto com ML, o Transit Gateway conecta redes e o X-Ray rastreia requisições em aplicações distribuídas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS CloudTrail", true],
            ["Amazon Comprehend", false],
            ["AWS Transit Gateway", false],
            ["AWS X-Ray", false],
            ["AWS Config", true],
        ],
    },
    {
        statement: "Qual destes serviços ajuda as empresas a auditar a conformidade na AWS?",
        explanation:
            "O AWS CloudTrail mantém o histórico de chamadas de API e eventos da conta, uma trilha de auditoria usada para comprovar conformidade e investigar incidentes. O CloudFront distribui conteúdo, o Lightsail oferece servidores virtuais simples e o CloudWatch monitora métricas e logs de operação, sem essa trilha de auditoria.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon CloudFront", false],
            ["Amazon Lightsail", false],
            ["Amazon CloudWatch", false],
            ["AWS CloudTrail", true],
        ],
    },
    {
        statement:
            "Uma empresa usa o Amazon RDS como banco de dados gerenciado. Quais tarefas continuam sob responsabilidade dela? (Selecione DUAS opções.)",
        explanation:
            "No Amazon RDS, o cliente modela o esquema do banco e ajusta as configurações dele, como grupos de parâmetros e usuários. A AWS instala o software do banco, aplica os patches e executa os backups automáticos, que o cliente apenas configura, como o período de retenção.",
        topic: "Segurança e identidade",
        options: [
            ["Criar o esquema do banco de dados relacional", true],
            ["Realizar os backups do banco de dados", false],
            ["Gerenciar as configurações do banco de dados", true],
            ["Aplicar patches no software do banco de dados", false],
            ["Instalar o software do banco de dados", false],
        ],
    },
    {
        statement:
            "Uma organização mantém muitos sistemas e usa vários produtos da AWS. Qual serviço permite controlar como cada desenvolvedor interage com esses produtos?",
        explanation:
            "O AWS Identity and Access Management (IAM) define usuários, grupos, funções e políticas que controlam quais serviços e ações cada desenvolvedor pode usar. O Amazon RDS é um banco de dados relacional, as Network ACLs filtram tráfego nas sub-redes e o Amazon EMR processa big data.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Identity and Access Management (IAM)", true],
            ["Amazon Relational Database Service (Amazon RDS)", false],
            ["Network ACLs da Amazon VPC", false],
            ["Amazon EMR", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada, alguns controles são herdados integralmente da AWS, sem nenhuma ação do cliente. Quais são eles? (Selecione DUAS opções.)",
        explanation:
            "Controles físicos e ambientais (acesso às instalações, energia, refrigeração e combate a incêndio) são herdados por completo da AWS. Gerenciamento de patches e conscientização e treinamento são controles compartilhados, e os controles de banco de dados dependem da configuração feita pelo cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Controles de gerenciamento de patches", false],
            ["Controles de banco de dados", false],
            ["Conscientização e treinamento", false],
            ["Controles ambientais dos data centers", true],
            ["Controles físicos das instalações", true],
        ],
    },
    {
        statement:
            "Quais recursos podem ajudar a proteger instâncias do Amazon EC2 contra um ataque de negação de serviço distribuído (DDoS)? (Selecione DUAS opções.)",
        explanation:
            "Grupos de segurança (firewall stateful no nível da instância) e Network ACLs (stateless, no nível da sub-rede) bloqueiam tráfego indesejado antes que ele chegue às instâncias. O CloudHSM guarda chaves criptográficas, o AWS Batch executa jobs em lote e o IAM controla permissões, não tráfego de rede.",
        topic: "Segurança e identidade",
        options: [
            ["AWS CloudHSM", false],
            ["Grupos de segurança", true],
            ["AWS Batch", false],
            ["AWS Identity and Access Management (IAM)", false],
            ["Network ACLs", true],
        ],
    },
    {
        statement:
            "Quais recursos são usados para controlar o tráfego de rede na AWS? (Selecione DUAS opções.)",
        explanation:
            "Network ACLs filtram o tráfego no nível da sub-rede (stateless) e grupos de segurança filtram no nível da instância (stateful). Pares de chaves autenticam o acesso SSH às instâncias, chaves de acesso autenticam chamadas de API e políticas do IAM definem permissões, sem filtrar tráfego de rede.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Network ACLs", true],
            ["Pares de chaves", false],
            ["Chaves de acesso do IAM", false],
            ["Políticas do IAM", false],
            ["Grupos de segurança", true],
        ],
    },
    {
        statement:
            "A segurança dos dados é uma das prioridades da AWS. O que a AWS faz com os dispositivos de armazenamento que chegaram ao fim da vida útil?",
        explanation:
            "Quando um dispositivo de armazenamento chega ao fim da vida útil, a AWS o descomissiona com as técnicas da NIST 800-88, e a mídia não sai do controle da AWS antes disso. Vender, enviar para remanufatura ou apenas guardar dispositivos com dados de clientes criaria risco de exposição desses dados.",
        topic: "Segurança e identidade",
        options: [
            ["Vende os dispositivos antigos para outros provedores de hospedagem", false],
            ["Descomissiona e destrói os dispositivos seguindo práticas padrão do setor", true],
            ["Envia os dispositivos antigos para remanufatura pelo fabricante", false],
            ["Armazena os dispositivos antigos em um local seguro por tempo indeterminado", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor precisa configurar um certificado SSL para que o site de comércio eletrônico de um cliente use o protocolo HTTPS. Quais serviços da AWS podem ser usados para implantar os certificados de servidor SSL necessários? (Selecione DUAS opções.)",
        explanation:
            "O ACM é a ferramenta recomendada para provisionar e implantar certificados SSL/TLS, e o IAM também armazena certificados de servidor, opção usada nas Regiões sem suporte ao ACM. O Route 53 cuida de DNS e domínios, o Directory Service oferece Active Directory gerenciado e o Config rastreia configurações de recursos.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Route 53", false],
            ["AWS Certificate Manager (ACM)", true],
            ["AWS Directory Service (Active Directory)", false],
            ["AWS Identity and Access Management (IAM)", true],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "Uma empresa planeja migrar uma aplicação do Amazon EC2 para o AWS Lambda, adotando uma arquitetura sem servidor. O que passará a ser responsabilidade da AWS após a migração? (Selecione DUAS opções.)",
        explanation:
            "No AWS Lambda, a AWS escala as funções automaticamente conforme a demanda e mantém o sistema operacional e a infraestrutura subjacentes. O código da aplicação, as permissões de quem pode invocar as funções e os dados processados continuam sendo responsabilidade do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Gerenciamento do código da aplicação", false],
            ["Gerenciamento da capacidade", true],
            ["Controle de acesso às funções", false],
            ["Manutenção do sistema operacional", true],
            ["Gerenciamento dos dados", false],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS é usado para gerenciar as permissões dos usuários?",
        explanation:
            "O AWS IAM permite criar usuários, grupos e funções e anexar políticas que definem quem pode acessar quais serviços e recursos. Grupos de segurança filtram tráfego de rede, o Amazon ECS orquestra contêineres e o AWS Support oferece atendimento técnico, sem gerenciar permissões.",
        topic: "Segurança e identidade",
        options: [
            ["Grupos de segurança", false],
            ["Amazon ECS", false],
            ["AWS IAM", true],
            ["AWS Support", false],
        ],
    },
    {
        statement: "Qual é a recomendação da AWS em relação às chaves de acesso?",
        explanation:
            "Fazer a rotação periódica das chaves de acesso limita o tempo de exposição caso alguma seja vazada. Senhas não substituem chaves no acesso programático, chaves não devem ser compartilhadas entre pessoas e, guardadas no código, podem vazar pelo repositório; para aplicações na AWS, prefira funções do IAM.",
        topic: "Segurança e identidade",
        options: [
            ["Excluir todas as chaves de acesso e usar apenas senhas", false],
            ["Compartilhá-las somente com pessoas de confiança", false],
            ["Fazer a rotação das chaves de acesso periodicamente", true],
            ["Guardá-las diretamente no código da aplicação", false],
        ],
    },
    {
        statement:
            "Qual recurso do AWS IAM oferece uma camada adicional de segurança além da autenticação por nome de usuário e senha?",
        explanation:
            "A MFA exige, além do nome de usuário e da senha, um segundo fator, como o código de um aplicativo autenticador ou uma chave de segurança. Pares de chaves autenticam o acesso SSH a instâncias, chaves de acesso servem para chamadas de API e o SDK é uma biblioteca para programar com a AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Par de chaves do Amazon EC2", false],
            ["Chaves de acesso programático", false],
            ["Kit de desenvolvimento de software (SDK)", false],
            ["Autenticação multifator (MFA)", true],
        ],
    },
    {
        statement:
            "Uma empresa descobriu que vários buckets do Amazon S3 foram excluídos, mas não sabe quem executou essas ações. Qual recurso da AWS pode ser usado para identificar quem excluiu os buckets?",
        explanation:
            "O AWS CloudTrail registra as chamadas de API da conta, como a exclusão de buckets, com quem as fez, o IP de origem e o horário. O SNS envia notificações, o SQS gerencia filas de mensagens e o CloudWatch Logs armazena logs de aplicações, recebendo eventos de API só se o CloudTrail os enviar para lá.",
        topic: "Segurança e identidade",
        options: [
            ["Logs do Amazon SNS", false],
            ["Logs do Amazon SQS", false],
            ["Amazon CloudWatch Logs", false],
            ["Logs do AWS CloudTrail", true],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, o que são os controles compartilhados?",
        explanation:
            "Pela definição da AWS, controles compartilhados valem para a camada de infraestrutura e para a do cliente, mas cada parte implementa o seu, como nos patches: a AWS corrige a infraestrutura e o cliente, o sistema operacional convidado. Os herdados vêm da AWS, os específicos são só do cliente e não há proteção conjunta da infraestrutura.",
        topic: "Segurança e identidade",
        options: [
            [
                "Controles de responsabilidade exclusiva do cliente, conforme a aplicação que ele implanta na AWS",
                false,
            ],
            [
                "Controles que o cliente herda integralmente da AWS, como os controles físicos e ambientais",
                false,
            ],
            [
                "Controles que se aplicam às camadas de infraestrutura e do cliente, em contextos separados",
                true,
            ],
            [
                "Controles em que o cliente e a AWS trabalham juntos para proteger a infraestrutura",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais itens são responsabilidade do cliente ao usar o Amazon EC2? (Selecione DUAS opções.)",
        explanation:
            "No Amazon EC2 o cliente cuida de tudo que roda na instância: proteger os dados e instalar, configurar e atualizar o software, inclusive o de terceiros. Patches da infraestrutura subjacente e manutenção do hardware são da AWS, e a operação de bancos de dados gerenciados, como o Amazon RDS, também fica com a AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Proteger os dados sensíveis armazenados", true],
            ["Aplicar patches na infraestrutura subjacente", false],
            ["Configurar e operar bancos de dados gerenciados", false],
            ["Manter os componentes de hardware", false],
            ["Instalar e configurar software de terceiros", true],
        ],
    },
    {
        statement:
            "Quais serviços da AWS ajudam a realizar análises de segurança e auditorias de conformidade regulatória? (Selecione DUAS opções.)",
        explanation:
            "O Amazon Inspector avalia cargas de trabalho em busca de vulnerabilidades e o AWS Config registra as configurações dos recursos e as avalia contra regras de conformidade. O CloudFormation provisiona infraestrutura como código, o AWS Batch executa jobs em lote e o Amazon ECS orquestra contêineres.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Inspector", true],
            ["AWS CloudFormation", false],
            ["AWS Batch", false],
            ["Amazon ECS", false],
            ["AWS Config", true],
        ],
    },
    {
        statement:
            "Quais recursos podem ser usados para proteger dados em repouso no Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "O versionamento do S3 guarda versões anteriores dos objetos e permite recuperá-los após exclusão ou sobrescrita acidental, e as permissões (políticas do IAM e de bucket) controlam quem acessa os dados. Desduplicação economiza espaço, descriptografia reverte a criptografia e conversão muda formatos, sem proteger os dados.",
        topic: "Segurança e identidade",
        options: [
            ["Versionamento", true],
            ["Desduplicação", false],
            ["Permissões", true],
            ["Descriptografia", false],
            ["Conversão", false],
        ],
    },
    {
        statement:
            "Ao executar uma carga de trabalho na AWS, quais atividades NÃO são responsabilidade do cliente? (Selecione DUAS opções.)",
        explanation:
            "Operar os data centers e proteger a infraestrutura física e de virtualização é segurança da nuvem, responsabilidade da AWS. Testes de penetração nos próprios recursos e a reserva de capacidade são decisões do cliente, e a conformidade é compartilhada: a AWS certifica a infraestrutura e o cliente, suas cargas de trabalho.",
        topic: "Segurança e identidade",
        options: [
            ["Executar testes de penetração", false],
            ["Reservar capacidade", false],
            ["Operações do data center", true],
            ["Auditoria e conformidade regulatória", false],
            ["Segurança da infraestrutura", true],
        ],
    },
    {
        statement:
            "Quais recursos a AWS oferece para ajudar a proteger os seus dados na nuvem? (Selecione DUAS opções.)",
        explanation:
            "O controle de acesso (políticas do IAM, políticas de bucket, grupos de segurança) limita quem chega aos dados, e a criptografia em repouso e em trânsito os protege mesmo se forem interceptados. Dispositivos de MFA protegem o login, não os dados em si; armazenamento ilimitado e balanceamento de carga tratam de capacidade e disponibilidade.",
        topic: "Segurança e identidade",
        options: [
            ["Controle de acesso", true],
            ["Dispositivos físicos de MFA", false],
            ["Criptografia de dados", true],
            ["Armazenamento ilimitado", false],
            ["Balanceamento de carga", false],
        ],
    },
    {
        statement:
            "Quais meios os clientes podem usar para interagir com o AWS Identity and Access Management (IAM)? (Selecione DUAS opções.)",
        explanation:
            "Além do Console de Gerenciamento da AWS, o IAM pode ser usado pela AWS CLI, com comandos no terminal, e pelos SDKs da AWS, dentro do código das aplicações. Grupos de segurança e Network ACLs filtram tráfego de rede e o CodeCommit hospeda repositórios Git; nenhum deles é interface para gerenciar o IAM.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Command Line Interface (AWS CLI)", true],
            ["Grupos de segurança", false],
            ["SDKs da AWS", true],
            ["Network Access Control Lists (Network ACLs)", false],
            ["AWS CodeCommit", false],
        ],
    },
    {
        statement:
            "Quais itens são tipos de identidade do AWS Identity and Access Management (IAM)? (Selecione DUAS opções.)",
        explanation:
            "Usuários e funções do IAM são identidades: o usuário representa uma pessoa ou aplicação com credenciais de longo prazo e a função é assumida para obter credenciais temporárias. Políticas são documentos de permissão anexados às identidades, o Resource Groups organiza recursos e o Organizations gerencia várias contas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Resource Groups", false],
            ["Políticas do IAM", false],
            ["Funções do IAM", true],
            ["Usuários do IAM", true],
            ["AWS Organizations", false],
        ],
    },
    {
        statement:
            "Como a AWS informa os clientes sobre eventos de segurança e privacidade relacionados aos serviços da AWS?",
        explanation:
            "A AWS publica boletins de segurança (Security Bulletins) com as vulnerabilidades e os eventos de segurança e privacidade que afetam seus serviços, junto com as ações recomendadas. O ACM gerencia certificados SSL/TLS, o console é a interface de gerenciamento e os recursos de conformidade são guias e relatórios de auditoria.",
        topic: "Segurança e identidade",
        options: [
            ["Pelo AWS Certificate Manager (ACM)", false],
            ["Pelos boletins de segurança da AWS", true],
            ["Pelo Console de Gerenciamento da AWS", false],
            ["Pelos recursos de conformidade da AWS", false],
        ],
    },
    {
        statement:
            "Qual entidade do IAM é a mais indicada para conceder acesso temporário aos recursos da AWS?",
        explanation:
            "Funções do IAM fornecem credenciais temporárias que expiram automaticamente, sem que seja preciso compartilhar credenciais de longo prazo. Usuários do IAM têm credenciais permanentes, pares de chaves autenticam o acesso SSH a instâncias EC2 e grupos apenas reúnem usuários com as mesmas políticas.",
        topic: "Segurança e identidade",
        options: [
            ["Usuários do IAM", false],
            ["Par de chaves", false],
            ["Funções do IAM", true],
            ["Grupos do IAM", false],
        ],
    },
    {
        statement:
            "Uma empresa quer proteger melhor sua conta da AWS contra acessos não autorizados. Qual medida ela pode adotar para atingir esse objetivo?",
        explanation:
            "Exigir MFA de todos os usuários do IAM acrescenta um segundo fator ao login e dificulta o acesso mesmo com a senha vazada. Bloquear toda chamada de API inviabiliza automações, usuários compartilhados eliminam a rastreabilidade individual e a AWS não oferece duas senhas de login; o reforço vem da MFA.",
        topic: "Segurança e identidade",
        options: [
            ["Bloquear todas as chamadas de API feitas por SDKs ou pela AWS CLI", false],
            ["Criar um usuário do IAM por departamento e compartilhá-lo com toda a equipe", false],
            ["Exigir autenticação multifator (MFA) para todos os usuários do IAM", true],
            ["Configurar duas senhas diferentes para o login no console", false],
        ],
    },
    {
        statement:
            "Quais são exemplos da responsabilidade do cliente pela segurança na nuvem? (Selecione DUAS opções.)",
        explanation:
            "Segurança na nuvem é o que o cliente configura e controla, como o esquema de dados das próprias aplicações e a criptografia do sistema de arquivos das instâncias. Substituir hardware físico, manter o hipervisor e aplicar patches na infraestrutura subjacente são segurança da nuvem, responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Criar o esquema de dados de uma aplicação", true],
            ["Substituir o hardware físico", false],
            ["Criar um novo hipervisor", false],
            ["Gerenciar patches da infraestrutura subjacente", false],
            ["Criptografar o sistema de arquivos", true],
        ],
    },
    {
        statement:
            "Você acabou de contratar um administrador de sistemas experiente e, como de costume, criou um novo usuário do IAM para ele. No primeiro dia, você pede que ele crie snapshots de todos os volumes do Amazon EBS e um novo bucket do Amazon S3, mas ele informa que não consegue fazer nenhuma das duas coisas. O que pode estar impedindo essa tarefa simples?",
        explanation:
            "Um usuário do IAM recém-criado não tem nenhuma permissão: toda ação é negada implicitamente até que uma política conceda acesso. EBS e S3 podem ser usados por qualquer identidade com permissão, usuários do IAM já nascem ativos sem passar pelo AWS Support e o S3 escala sem limite prático de espaço.",
        topic: "Segurança e identidade",
        options: [
            ["O Amazon EBS e o Amazon S3 só podem ser acessados pelo usuário raiz da conta", false],
            [
                "O administrador precisa pedir ao AWS Support que ative seu novo usuário do IAM",
                false,
            ],
            ["Não há espaço suficiente no Amazon S3 para armazenar os snapshots", false],
            ["Todo usuário novo do IAM começa com uma negação implícita a todas as ações", true],
        ],
    },
    {
        statement:
            "Um auditor externo solicitou um registro de todos os acessos aos recursos da AWS na conta da empresa. Qual serviço fornecerá ao auditor as informações solicitadas?",
        explanation:
            "O AWS CloudTrail registra as chamadas de API feitas na conta, com quem acessou cada recurso, de qual IP e quando, que é o que um auditor precisa. O CloudFront distribui conteúdo pela rede de borda, o CloudFormation provisiona recursos por modelos e o CloudWatch coleta métricas e logs operacionais.",
        topic: "Segurança e identidade",
        options: [
            ["AWS CloudTrail", true],
            ["Amazon CloudFront", false],
            ["AWS CloudFormation", false],
            ["Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS permite conectar os recursos da AWS a um Microsoft Active Directory local, para que os usuários entrem com as credenciais corporativas que já têm?",
        explanation:
            "O AWS Directory Service, com o AD Connector ou o AWS Managed Microsoft AD, integra os recursos da AWS a um Active Directory local e permite usar as credenciais corporativas. O IAM Identity Center centraliza o login único e usa o Directory Service para chegar ao AD, o Cognito atende usuários de aplicativos e o Secrets Manager guarda segredos.",
        topic: "Segurança e identidade",
        options: [
            ["AWS IAM Identity Center", false],
            ["AWS Directory Service", true],
            ["Amazon Cognito", false],
            ["AWS Secrets Manager", false],
        ],
    },
    {
        statement:
            "Uma empresa, que ainda não usa federação de identidades, quer conceder a um novo funcionário acesso de longo prazo para gerenciar bancos de dados do Amazon DynamoDB. Qual é a prática recomendada ao conceder essas permissões?",
        explanation:
            "Sem federação, um funcionário com acesso de longo prazo precisa de um usuário do IAM, e a política restrita ao DynamoDB segue o princípio do privilégio mínimo. Funções do IAM são assumidas para obter credenciais temporárias, e permissões de administrador liberam todos os serviços, muito além do necessário.",
        topic: "Segurança e identidade",
        options: [
            [
                "Criar uma função do IAM e anexar uma política com permissões de acesso ao Amazon DynamoDB",
                false,
            ],
            [
                "Criar uma função do IAM e anexar uma política com permissões de administrador",
                false,
            ],
            [
                "Criar um usuário do IAM e anexar uma política com permissões de acesso ao Amazon DynamoDB",
                true,
            ],
            [
                "Criar um usuário do IAM e anexar uma política com permissões de administrador",
                false,
            ],
        ],
    },
    {
        statement:
            "O que pode ser usado para habilitar um dispositivo de MFA virtual? (Selecione DUAS opções.)",
        explanation:
            "Um dispositivo de MFA virtual pode ser atribuído pelo console do IAM ou pela AWS CLI, com comandos como create-virtual-mfa-device e enable-mfa-device. O Amazon Connect é uma central de atendimento, o SNS envia notificações e a VPC isola a rede, sem relação com a configuração de MFA.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Connect", false],
            ["AWS Command Line Interface (AWS CLI)", true],
            ["AWS Identity and Access Management (IAM)", true],
            ["Amazon SNS", false],
            ["Amazon Virtual Private Cloud (Amazon VPC)", false],
        ],
    },
    {
        statement:
            "O que você deve fazer se encontrar, no Console de Gerenciamento da AWS, recursos que não se lembra de ter criado? (Selecione DUAS opções.)",
        explanation:
            "Recursos desconhecidos indicam possível comprometimento: investigue, remova os usuários do IAM suspeitos e troque as senhas do usuário raiz e dos usuários do IAM para cortar o acesso do invasor. Parar tudo derruba cargas legítimas, a AWS nunca pede sua senha e excluir todos os usuários tira o acesso da equipe.",
        topic: "Segurança e identidade",
        options: [
            ["Interromper todos os serviços em execução e abrir uma investigação", false],
            [
                "Informar a senha do usuário raiz ao AWS Support para que ele ajude a proteger a conta",
                false,
            ],
            [
                "Consultar os logs do AWS CloudTrail e excluir todos os usuários do IAM com acesso aos recursos",
                false,
            ],
            [
                "Abrir uma investigação e excluir os usuários do IAM que possam ter sido comprometidos",
                true,
            ],
            ["Trocar a senha do usuário raiz e as senhas de todos os usuários do IAM", true],
        ],
    },
    {
        statement:
            "Uma equipe de DevOps precisa de acesso administrativo total a todos os recursos de uma conta da AWS. Quem pode conceder essas permissões?",
        explanation:
            "Quem controla a conta, pelo usuário raiz ou por uma identidade com permissões administrativas, é quem concede acesso pelo IAM. O TAM atende clientes do plano Enterprise Support, a equipe de segurança da AWS cuida da própria infraestrutura e os engenheiros de suporte ajudam em casos técnicos, sem mexer nas permissões da conta.",
        topic: "Segurança e identidade",
        options: [
            ["O proprietário da conta da AWS", true],
            ["O Technical Account Manager (TAM) da AWS", false],
            ["A equipe de segurança da AWS", false],
            ["Os engenheiros de suporte em nuvem da AWS", false],
        ],
    },
    {
        statement: "Qual estratégia ajuda a proteger o usuário raiz da sua conta da AWS?",
        explanation:
            "O usuário raiz tem acesso irrestrito, então chaves de acesso dele são um alvo valioso e devem ser excluídas se não forem usadas. A MFA no raiz é recomendada, mas ele deve ficar restrito às tarefas que exigem o raiz, não ao dia a dia; limitar o acesso a um celular não é controle de segurança e credenciais nunca devem ser compartilhadas.",
        topic: "Segurança e identidade",
        options: [
            ["Excluir as chaves de acesso do usuário raiz se elas não forem necessárias", true],
            ["Ativar a MFA no usuário raiz e usá-lo em todo o trabalho do dia a dia", false],
            ["Acessar o usuário raiz somente pelo seu celular pessoal", false],
            [
                "Compartilhar a senha ou as chaves de acesso da conta só com pessoas de confiança",
                false,
            ],
        ],
    },
    {
        statement:
            "Você acabou de configurar seu ambiente na AWS e criou seis usuários do IAM para a equipe de DevOps. Qual é a recomendação da AWS ao conceder permissões a esses usuários?",
        explanation:
            "O princípio do privilégio mínimo concede a cada usuário só as permissões de que ele precisa para trabalhar, reduzindo o estrago de erros ou de credenciais vazadas. Políticas separadas por usuário complicam a gestão (grupos são o caminho), negar tudo impede o trabalho da equipe e senhas diferentes não limitam o que cada um pode fazer.",
        topic: "Segurança e identidade",
        options: [
            ["Anexar uma política do IAM separada a cada usuário individual", false],
            ["Aplicar o princípio do privilégio mínimo a cada usuário", true],
            ["Não conceder nenhuma permissão à equipe de DevOps, por segurança", false],
            ["Criar seis senhas diferentes do IAM", false],
        ],
    },
    {
        statement:
            "Quais serviços fazem verificações automatizadas que ajudam a auditar a conformidade e os riscos de segurança dos recursos da AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS Config avalia continuamente as configurações dos recursos contra regras de conformidade e o Trusted Advisor verifica a conta em busca de riscos, como portas liberadas em grupos de segurança e usuário raiz sem MFA. O Secrets Manager guarda e rotaciona segredos, o Amazon MQ é um broker de mensagens e o Cognito autentica usuários de aplicativos.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Config", true],
            ["AWS Secrets Manager", false],
            ["Amazon MQ", false],
            ["AWS Trusted Advisor", true],
            ["Amazon Cognito", false],
        ],
    },
    {
        statement: "O que melhor descreve um teste de penetração?",
        explanation:
            "Um teste de penetração simula ataques contra os próprios sistemas para encontrar vulnerabilidades exploráveis antes de um invasor real. Medir o tempo de resposta de vários locais é teste de desempenho, identificar instâncias com problema é verificação de integridade e procurar bugs é teste funcional ou de qualidade.",
        topic: "Segurança e identidade",
        options: [
            [
                "Testar o tempo de resposta da aplicação a partir de diferentes regiões do mundo",
                false,
            ],
            ["Testar a rede em busca de vulnerabilidades que um invasor poderia explorar", true],
            [
                "Testar as instâncias para identificar as que não estão íntegras ou disponíveis",
                false,
            ],
            ["Testar o software em busca de bugs e erros de funcionamento no código", false],
        ],
    },
    {
        statement:
            "Quais medidas podem ajudar a proteger dados sensíveis armazenados no Amazon S3? (Selecione DUAS opções.)",
        explanation:
            "A criptografia do lado do servidor (por exemplo, com chaves do AWS KMS) e a criptografia no cliente antes do envio protegem os dados sensíveis. O S3 já aplica SSE-S3 por padrão, mas escolher as chaves e controlar o acesso segue com o cliente; excluir as chaves torna os dados ilegíveis e apagar todos os usuários só bloqueia o acesso legítimo.",
        topic: "Segurança e identidade",
        options: [
            ["Excluir as chaves de criptografia depois que os dados forem criptografados", false],
            ["Não se preocupar com criptografia, pois a AWS cuida de tudo", false],
            ["Configurar a criptografia do lado do servidor com chaves do AWS KMS", true],
            ["Criptografar os dados no cliente antes de enviá-los ao Amazon S3", true],
            ["Excluir todos os usuários do IAM que têm acesso ao Amazon S3", false],
        ],
    },
    {
        statement: "O que você pode usar para atribuir permissões diretamente a um usuário do IAM?",
        explanation:
            "Uma política do IAM é um documento JSON que define ações permitidas ou negadas e pode ser anexada diretamente a um usuário. Identidade é o termo que abrange usuários, grupos e funções, o grupo repassa suas políticas a todos os membros e a função é assumida temporariamente, não anexada a um usuário.",
        topic: "Segurança e identidade",
        options: [
            ["Identidade do IAM", false],
            ["Grupo do IAM", false],
            ["Função do IAM", false],
            ["Política do IAM", true],
        ],
    },
    {
        statement:
            "Quais serviços você usaria para gerenciar suas chaves de criptografia na Nuvem AWS? (Selecione DUAS opções.)",
        explanation:
            "O AWS KMS cria e gerencia chaves de criptografia integradas à maioria dos serviços da AWS, e o AWS CloudHSM oferece módulos de hardware dedicados para quem precisa de controle exclusivo das chaves. O ACM gerencia certificados SSL/TLS, o CodeDeploy automatiza implantações e o CodeCommit hospeda repositórios Git.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Key Management Service", true],
            ["AWS Certificate Manager (ACM)", false],
            ["AWS CodeDeploy", false],
            ["AWS CodeCommit", false],
            ["AWS CloudHSM", true],
        ],
    },
    {
        statement:
            "Uma empresa mantém sua infraestrutura em um data center local, onde uma equipe de operações cria usuários e define as permissões de acesso a cada recurso. Se a empresa migrar para a Nuvem AWS, qual serviço permite definir essas permissões de acesso aos recursos da AWS?",
        explanation:
            "O IAM centraliza a autenticação e a autorização na AWS, com usuários, grupos, funções e políticas, o mesmo papel da equipe de identidades no data center. O Directory Service oferece Active Directory gerenciado e pode complementar o IAM, o Outposts leva infraestrutura da AWS ao local do cliente e o Redshift é um data warehouse.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Identity and Access Management (IAM)", true],
            ["AWS Outposts", false],
            ["AWS Directory Service (Active Directory)", false],
            ["Amazon Redshift", false],
        ],
    },
    {
        statement:
            "Qual recurso um cliente da AWS pode consultar para conhecer os usos proibidos dos serviços oferecidos pela AWS?",
        explanation:
            "A Política de Uso Aceitável da AWS lista as atividades proibidas nos serviços, como enviar spam, hospedar conteúdo ilegal ou lançar ataques contra outros sistemas. As SCPs limitam permissões de contas no AWS Organizations, o Artifact disponibiliza relatórios de conformidade e o Budgets acompanha gastos com alertas.",
        topic: "Segurança e identidade",
        options: [
            ["Políticas de controle de serviço (SCPs)", false],
            ["AWS Artifact", false],
            ["AWS Budgets", false],
            ["Política de Uso Aceitável da AWS", true],
        ],
    },
    {
        statement:
            "Quais recursos de segurança estão disponíveis gratuitamente para qualquer usuário? (Selecione DUAS opções.)",
        explanation:
            "Os boletins de segurança e o AWS Security Blog são públicos e gratuitos para qualquer pessoa. O Technical Account Manager vem com o plano Enterprise Support, a AWS Support API exige um plano de suporte pago e os treinamentos em sala de aula da AWS são cursos pagos.",
        topic: "Segurança e identidade",
        options: [
            ["Boletins de segurança da AWS", true],
            ["Technical Account Manager (TAM) da AWS", false],
            ["AWS Support API", false],
            ["AWS Security Blog", true],
            ["Treinamentos em sala de aula da AWS", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, quem é responsável por escalar uma tabela do Amazon DynamoDB no modo de capacidade sob demanda?",
        explanation:
            "O DynamoDB é um banco NoSQL totalmente gerenciado e sem servidor: a AWS cuida da infraestrutura e escala as tabelas automaticamente, como no modo de capacidade sob demanda. As equipes de segurança, desenvolvimento e DevOps definem configurações e acessos, mas não administram a infraestrutura que escala o serviço.",
        topic: "Segurança e identidade",
        options: [
            ["A sua equipe de segurança", false],
            ["A sua equipe de desenvolvimento", false],
            ["A Amazon Web Services (AWS)", true],
            ["A sua equipe interna de DevOps", false],
        ],
    },
    {
        statement:
            "Segundo o modelo de responsabilidade compartilhada da AWS, quais controles o cliente herda integralmente da AWS? (Selecione DUAS opções.)",
        explanation:
            "Controles herdados são os que o cliente recebe prontos da AWS: os físicos, como a segurança dos data centers, e os ambientais, como energia, refrigeração e proteção contra incêndio. Conscientização e treinamento e gestão de configuração são controles compartilhados, e a proteção das comunicações é específica do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Conscientização e treinamento", false],
            ["Controles de comunicação", false],
            ["Controles de segurança do data center", true],
            ["Controles ambientais das instalações", true],
            ["Gerenciamento da configuração de recursos", false],
        ],
    },
    {
        statement:
            "Quais itens fazem parte dos sete princípios de design do pilar de segurança do AWS Well-Architected Framework? (Selecione DUAS opções.)",
        explanation:
            "Dois dos sete princípios do pilar de segurança são ter uma base forte de identidade, sem depender de credenciais de longo prazo, e manter a rastreabilidade com monitoramento e auditoria em tempo real. O pilar pede automação, não monitoramento manual; escalar horizontalmente é princípio de confiabilidade e dados sensíveis podem ficar na nuvem com proteção.",
        topic: "Segurança e identidade",
        options: [
            ["Usar técnicas de monitoramento manual para proteger todos os recursos da AWS", false],
            ["Implementar uma base sólida de identidade, sem credenciais estáticas", true],
            ["Escalar horizontalmente os recursos para se proteger contra falhas", false],
            ["Manter a rastreabilidade, monitorando e auditando ações em tempo real", true],
            ["Nunca armazenar dados sensíveis na nuvem, apenas localmente", false],
        ],
    },
    {
        statement:
            "Qual é o principal benefício de associar grupos de segurança a uma instância do Amazon RDS?",
        explanation:
            "Grupos de segurança funcionam como firewall virtual e definem quais intervalos de IP ou outros grupos de segurança podem se conectar à instância do RDS. Usuários e chaves são geridos pelo IAM e pelo AWS KMS, certificados SSL/TLS não são implantados por grupos de segurança e distribuir tráfego é função do Elastic Load Balancing.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Gerencia o acesso dos usuários e as chaves de criptografia do banco", false],
            ["Controla quais intervalos de IP podem se conectar ao banco de dados", true],
            ["Implanta certificados SSL/TLS para uso com a instância de banco de dados", false],
            ["Distribui o tráfego de entrada entre várias instâncias de destino", false],
        ],
    },
    {
        statement:
            "Você foi encarregado de auditar a segurança da sua VPC e precisa começar analisando qual tráfego de entrada e de saída é permitido nas instâncias do Amazon EC2. Qual combinação de componentes da VPC você precisa verificar?",
        explanation:
            "Grupos de segurança controlam o tráfego no nível da instância (stateful) e Network ACLs no nível da sub-rede (stateless); juntos, mostram o que pode entrar e sair das instâncias. Tabelas de rotas só direcionam o tráfego, sub-redes são segmentos de rede e gateways de internet dão acesso à internet, sem regras de permissão.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Network ACLs e tabelas de rotas", false],
            ["Network ACLs e sub-redes", false],
            ["Grupos de segurança e gateways de internet", false],
            ["Grupos de segurança e Network ACLs", true],
        ],
    },
    {
        statement: "Qual afirmação é verdadeira em relação à segurança na AWS?",
        explanation:
            "Pelo modelo de responsabilidade compartilhada, todo software que o cliente instala no EC2, inclusive bancos de dados, é dele para configurar e corrigir. O sistema operacional convidado também é do cliente, a criptografia do lado do servidor depende das escolhas do cliente (como as chaves) e a segurança das aplicações cabe ao cliente.",
        topic: "Segurança e identidade",
        options: [
            [
                "A AWS gerencia tudo o que diz respeito ao sistema operacional das instâncias EC2",
                false,
            ],
            ["O cliente deve aplicar patches no software de banco de dados que roda no EC2", true],
            ["A criptografia do lado do servidor é responsabilidade exclusiva da AWS", false],
            ["A AWS é responsável pela segurança das aplicações que o cliente implanta", false],
        ],
    },
    {
        statement:
            "Quais são as principais diferenças entre um usuário do IAM e uma função do IAM? (Selecione DUAS opções.)",
        explanation:
            "Um usuário do IAM representa uma pessoa ou aplicação específica e tem credenciais de longo prazo, como senha e chaves de acesso. A função não pertence a ninguém: é assumida por quem precisa dela e gera credenciais temporárias. As opções invertidas trocam esses papéis, e o IAM não cobra por usuários nem por funções.",
        topic: "Segurança e identidade",
        options: [
            [
                "O usuário do IAM é associado a uma única pessoa, enquanto a função pode ser assumida por quem precisar dela",
                true,
            ],
            [
                "O usuário do IAM tem credenciais permanentes, enquanto a função fornece credenciais temporárias",
                true,
            ],
            [
                "O usuário do IAM tem custo menor, enquanto a função é cobrada a cada sessão assumida",
                false,
            ],
            [
                "A função é associada a uma única pessoa, enquanto o usuário do IAM pode ser assumido por quem precisar dele",
                false,
            ],
            [
                "O usuário do IAM tem credenciais temporárias, enquanto a função fornece credenciais permanentes",
                false,
            ],
        ],
    },
    {
        statement:
            "Quais das opções a seguir usam um ID de chave de acesso e uma chave de acesso secreta para obter acesso programático de longo prazo aos recursos da AWS? (Selecione DUAS opções.)",
        explanation:
            "Usuários do IAM e o usuário raiz podem ter chaves de acesso de longo prazo, embora a AWS recomende não criá-las para o raiz. Grupos do IAM não se autenticam nem têm credenciais, funções do IAM fornecem credenciais temporárias e usuários do IAM Identity Center recebem credenciais de curto prazo pelo portal de acesso.",
        topic: "Segurança e identidade",
        options: [
            ["Grupo do IAM", false],
            ["Usuário do IAM", true],
            ["Função do IAM (IAM role)", false],
            ["Usuário raiz da conta da AWS", true],
            ["Usuário do AWS IAM Identity Center", false],
        ],
    },
    {
        statement:
            "Qual serviço da AWS se integra ao AWS Shield e ao AWS WAF para proteger aplicações contra ataques DDoS nas camadas de rede e de aplicação?",
        explanation:
            "O Amazon CloudFront entrega conteúdo a partir das edge locations e se integra ao AWS Shield, que mitiga DDoS nas camadas de rede e transporte, e ao AWS WAF, que filtra requisições na camada de aplicação. O Amazon EFS é armazenamento de arquivos, o Secrets Manager guarda segredos e o Systems Manager gerencia a operação de recursos.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon EFS", false],
            ["AWS Secrets Manager", false],
            ["AWS Systems Manager", false],
            ["Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "O administrador da conta AWS de uma empresa foi demitido. Com as permissões que tinha, ele criou vários usuários do IAM e chaves de acesso, e não se sabe se ele também tem acesso ao usuário raiz. O que deve ser feito imediatamente para proteger a infraestrutura na AWS? (Selecione DUAS opções.)",
        explanation:
            "Rotacionar as chaves de acesso invalida as que o ex-administrador possa ter guardado, e trocar o e-mail e a senha do usuário raiz, com MFA ativado, impede o acesso total à conta. Guardar as políticas não revoga nada, excluir todos os usuários paralisa a equipe e revisar chamadas de API é investigação posterior, feita com o AWS CloudTrail.",
        topic: "Segurança e identidade",
        options: [
            ["Baixar todas as políticas anexadas e guardá-las em local seguro", false],
            ["Excluir todos os usuários do IAM e recriá-los em seguida", false],
            [
                "Usar o Amazon CloudWatch para verificar as chamadas de API feitas desde a demissão",
                false,
            ],
            ["Rotacionar todas as chaves de acesso existentes na conta", true],
            ["Alterar o e-mail e a senha do usuário raiz e ativar o MFA", true],
        ],
    },
    {
        statement:
            "Uma empresa de serviços financeiros vai migrar para a AWS uma aplicação que lida com dados sensíveis, como números de cartão de crédito, e que precisa rodar em um ambiente em conformidade com o PCI DSS. Quais são responsabilidades da empresa ao montar esse ambiente na AWS? (Selecione DUAS opções.)",
        explanation:
            "O cliente precisa configurar corretamente os serviços que usa para atender ao PCI DSS e controlar o acesso aos dados de cartão, com uma política de segurança da informação para o seu pessoal. Nem todo serviço da AWS está no escopo do PCI DSS, e a infraestrutura subjacente e a segurança física dos data centers ficam com a AWS.",
        topic: "Segurança e identidade",
        options: [
            [
                "Iniciar a migração imediatamente, pois todos os serviços da AWS já atendem ao PCI DSS",
                false,
            ],
            [
                "Garantir que os serviços da AWS usados estejam configurados para atender ao PCI DSS",
                true,
            ],
            [
                "Restringir o acesso aos dados de cartão e manter uma política de segurança da informação",
                true,
            ],
            [
                "Configurar a infraestrutura subjacente dos serviços da AWS para atender ao PCI DSS",
                false,
            ],
            [
                "Garantir que os requisitos de segurança física do PCI DSS sejam atendidos nos data centers",
                false,
            ],
        ],
    },
    {
        statement:
            "Um cliente quer realizar testes de invasão (pentest) nos seus próprios recursos na AWS. Qual procedimento ele deve seguir?",
        explanation:
            "Para os serviços permitidos, a AWS não exige aprovação prévia nem aviso para testes de invasão, então vale o processo interno de autorização do cliente (simulações de DDoS e alguns outros eventos ainda exigem pedido). Avisar ou pedir aprovação ao AWS Support deixou de ser necessário, e o Amazon Inspector avalia vulnerabilidades, mas não substitui um pentest.",
        topic: "Segurança e identidade",
        options: [
            ["Executar o teste com o Amazon Inspector e depois notificar o AWS Support", false],
            ["Realizar o teste nos serviços permitidos, sem pedir aprovação prévia à AWS", true],
            [
                "Notificar o AWS Support e realizar o teste logo em seguida, sem aguardar resposta",
                false,
            ],
            ["Solicitar e aguardar a aprovação do AWS Support antes de realizar o teste", false],
        ],
    },
    {
        statement:
            "Segundo o modelo de responsabilidade compartilhada da AWS, o que é responsabilidade exclusiva da AWS?",
        explanation:
            "As edge locations fazem parte da infraestrutura global que a AWS opera e protege sozinha. A segurança da camada de aplicação e os dados do lado do cliente cabem ao cliente, e o gerenciamento de patches é compartilhado: a AWS corrige a infraestrutura e o cliente corrige o sistema operacional convidado e as aplicações.",
        topic: "Segurança e identidade",
        options: [
            ["Segurança da camada de aplicação", false],
            ["Gerenciamento das edge locations", true],
            ["Gerenciamento de patches", false],
            ["Dados do lado do cliente", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada, qual destes é um controle compartilhado entre o cliente e a AWS?",
        explanation:
            "No gerenciamento de patches, a AWS corrige a infraestrutura e o cliente corrige o sistema operacional convidado e as aplicações. Controles físicos e a auditoria dos data centers são herdados da AWS, e a segurança de zonas (rotear ou separar dados em ambientes de segurança específicos) é controle exclusivo do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Controles físicos", false],
            ["Gerenciamento de patches", true],
            ["Segurança de zonas", false],
            ["Auditoria de data centers", false],
        ],
    },
    {
        statement:
            "Quais serviços ou recursos da AWS podem reforçar a segurança de uma aplicação web bloqueando requisições vindas de uma rede específica? (Selecione DUAS opções.)",
        explanation:
            "O AWS WAF bloqueia requisições web por endereço IP ou intervalo de rede, e as Network ACLs negam o tráfego de intervalos de IP no nível da sub-rede. O Trusted Advisor e o AWS Config apontam configurações inseguras, mas não bloqueiam tráfego, e o AWS Organizations governa várias contas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS WAF", true],
            ["AWS Trusted Advisor", false],
            ["AWS Config", false],
            ["AWS Organizations", false],
            ["Network ACLs", true],
        ],
    },
    {
        statement:
            "Segundo o modelo de responsabilidade compartilhada da AWS, pelo que o cliente é responsável?",
        explanation:
            "Proteger os dados, o que inclui decidir e configurar a criptografia e gerenciar as chaves, é responsabilidade do cliente; a AWS fornece as ferramentas, como o AWS KMS. Controles de acesso físico, descarte seguro de mídias de armazenamento e gestão de riscos ambientais dos data centers são responsabilidades da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Controles de acesso físico", false],
            ["Gerenciamento da criptografia dos dados", true],
            ["Descarte seguro de mídias de armazenamento", false],
            ["Gestão de riscos ambientais", false],
        ],
    },
    {
        statement:
            "Qual componente do modelo de responsabilidade compartilhada é gerenciado inteiramente pela AWS?",
        explanation:
            "A AWS audita sozinha os ativos físicos dos data centers, como inventário de hardware e registros de acesso, pois o cliente não tem acesso às instalações. Aplicar patches no sistema operacional das instâncias, criptografar os dados e exigir MFA são tarefas do cliente, que usa ferramentas fornecidas pela AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Aplicação de patches no sistema operacional das instâncias", false],
            ["Criptografia dos dados", false],
            ["Exigência de autenticação multifator (MFA)", false],
            ["Auditoria dos ativos físicos dos data centers", true],
        ],
    },
    {
        statement:
            "Qual serviço um cliente pode usar para habilitar o login único (SSO) no Console de Gerenciamento da AWS?",
        explanation:
            "O AWS Directory Service integra o Microsoft Active Directory à AWS e permite que os usuários do diretório entrem no console com as credenciais corporativas, sem um usuário do IAM para cada um (hoje o AWS IAM Identity Center é o caminho recomendado para SSO). O Amazon Connect é central de atendimento, o SES envia e-mails e o Rekognition analisa imagens.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Connect", false],
            ["AWS Directory Service", true],
            ["Amazon Simple Email Service (Amazon SES)", false],
            ["Amazon Rekognition", false],
        ],
    },
    {
        statement:
            "Quais benefícios o programa de conformidade da AWS oferece aos clientes? (Selecione DUAS opções.)",
        explanation:
            "Com o programa de conformidade, o cliente herda os controles já auditados da infraestrutura da AWS, o que reduz o escopo das próprias auditorias, e tem a garantia de que a AWS mantém a segurança física e a proteção de dados do seu lado. A conformidade das cargas continua sendo do cliente, e a AWS não segue outros provedores nem promete adotar todo framework novo.",
        topic: "Segurança e identidade",
        options: [
            [
                "Permite herdar os controles certificados da AWS e reduz o escopo das auditorias do cliente",
                true,
            ],
            [
                "Torna a AWS responsável por manter a documentação de conformidade das cargas do cliente",
                false,
            ],
            [
                "Assegura que a AWS mantém a segurança física e a proteção de dados na infraestrutura",
                true,
            ],
            [
                "Garante o uso dos mesmos frameworks de conformidade adotados por outros provedores de nuvem",
                false,
            ],
            [
                "Compromete-se a adotar todo novo framework que se torne relevante para as cargas do cliente",
                false,
            ],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, qual controle operacional o cliente herda integralmente da AWS?",
        explanation:
            "Controles herdados são executados por completo pela AWS, como a segurança física e ambiental dos data centers. Gerenciamento de patches e de configuração são controles compartilhados (a AWS cuida da infraestrutura e o cliente, do sistema operacional convidado e das aplicações), e o gerenciamento de usuários e acessos é do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Segurança física dos data centers", true],
            ["Gerenciamento de patches", false],
            ["Gerenciamento de configuração", false],
            ["Gerenciamento de usuários e acessos", false],
        ],
    },
    {
        statement:
            "Qual função os grupos de segurança exercem na segurança das instâncias do Amazon EC2?",
        explanation:
            "O grupo de segurança é um firewall virtual stateful no nível da instância: regras de protocolo, porta e origem controlam o tráfego de entrada e saída. Políticas do IAM definem o que usuários podem fazer, o AWS Shield protege contra DDoS e o Amazon CloudFront é uma rede de entrega de conteúdo; nenhuma dessas é a função do grupo de segurança.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Atuam como firewall virtual das instâncias do Amazon EC2", true],
            ["Protegem as contas dos usuários com políticas do IAM", false],
            ["Oferecem proteção contra DDoS com o AWS Shield", false],
            ["Usam o Amazon CloudFront para proteger as instâncias do EC2", false],
        ],
    },
    {
        statement:
            "Por que o gerenciamento de ativos na AWS é mais fácil do que em um data center físico?",
        explanation:
            "Na AWS, todo recurso é criado e descrito por APIs, então o inventário de ativos sai de poucas chamadas (com o AWS Config ou a AWS CLI, por exemplo) em vez de levantamentos manuais. A AWS não entrega um CMDB pronto para o cliente manter, não faz varreduras de descoberta em nome dele e o EC2 não gera relatórios de ativos automaticamente no S3.",
        topic: "Segurança e identidade",
        options: [
            [
                "A AWS fornece um banco de dados de gerenciamento de configuração (CMDB) para os usuários manterem",
                false,
            ],
            ["A AWS executa varreduras de descoberta da infraestrutura em nome do cliente", false],
            [
                "O Amazon EC2 gera um relatório de ativos e o grava no bucket do Amazon S3 indicado pelo cliente",
                false,
            ],
            [
                "Os usuários obtêm os metadados dos ativos de forma confiável com poucas chamadas de API",
                true,
            ],
        ],
    },
    {
        statement:
            "Como se chama o conceito de usar o AWS Identity and Access Management (IAM) para conceder acesso somente aos recursos necessários para executar uma tarefa?",
        explanation:
            "O princípio do privilégio mínimo concede apenas as permissões necessárias para a tarefa, o que reduz o impacto de erros e de credenciais comprometidas. Acesso restrito e acesso conforme a necessidade são descrições genéricas, não o nome do princípio, e acesso por token se refere a credenciais temporárias, não ao escopo das permissões.",
        topic: "Segurança e identidade",
        options: [
            ["Acesso restrito", false],
            ["Acesso conforme a necessidade", false],
            ["Acesso com privilégio mínimo", true],
            ["Acesso por token", false],
        ],
    },
    {
        statement:
            "Pelo modelo de responsabilidade compartilhada da AWS, qual destas é uma responsabilidade do cliente?",
        explanation:
            "O cliente configura o que roda sobre a infraestrutura: sistema operacional convidado, rede da VPC e regras de firewall, como os grupos de segurança. Proteger hardware, instalações e redes, obter certificações e atestados de terceiros e disponibilizar relatórios de conformidade aos clientes (pelo AWS Artifact) são responsabilidades da AWS.",
        topic: "Segurança e identidade",
        options: [
            [
                "Proteger o hardware, as instalações e as redes que executam os serviços da AWS",
                false,
            ],
            ["Fornecer relatórios e certificados de conformidade aos clientes sob NDA", false],
            ["Configurar o sistema operacional, a rede e o firewall das instâncias", true],
            ["Obter certificações do setor e atestados independentes de terceiros", false],
        ],
    },
    {
        statement:
            "Qual serviço gerenciado da AWS oferece orientação em tempo real sobre as práticas recomendadas de segurança da AWS?",
        explanation:
            "O AWS Trusted Advisor inspeciona o ambiente e recomenda ações com base em práticas recomendadas, inclusive de segurança, como grupos de segurança abertos, MFA no usuário raiz e permissões de buckets. O X-Ray rastreia requisições de aplicações, o CloudWatch monitora métricas e logs e o Systems Manager automatiza a operação dos recursos.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS X-Ray", false],
            ["AWS Trusted Advisor", true],
            ["Amazon CloudWatch", false],
            ["AWS Systems Manager", false],
        ],
    },
    {
        statement:
            "Pelo modelo de responsabilidade compartilhada, qual destas tarefas de correção de vulnerabilidades cabe à AWS?",
        explanation:
            "O firmware dos servidores físicos que hospedam as instâncias é mantido pela AWS, pois o cliente não tem acesso ao hardware. Aplicar patches no sistema operacional convidado e ajustar Network ACLs e grupos de segurança para fechar portas vulneráveis são tarefas do cliente, dentro da segurança na nuvem.",
        topic: "Segurança e identidade",
        options: [
            ["Atualizar as Network ACLs para bloquear o tráfego nas portas vulneráveis", false],
            ["Aplicar patches nos sistemas operacionais das instâncias do Amazon EC2", false],
            ["Atualizar o firmware dos hosts físicos que executam as instâncias do EC2", true],
            [
                "Atualizar as regras dos grupos de segurança para bloquear as portas vulneráveis",
                false,
            ],
        ],
    },
    {
        statement:
            "De acordo com o modelo de responsabilidade compartilhada da AWS, pelo que a AWS é responsável?",
        explanation:
            "A AWS opera a infraestrutura de rede que conecta data centers, Zonas de Disponibilidade e Regiões. Configurar a Amazon VPC (sub-redes, rotas e gateways), cuidar do código das aplicações e gerenciar o tráfego que chega a elas, com balanceadores de carga e DNS, são tarefas do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Configurar as sub-redes e as rotas da Amazon VPC", false],
            ["Gerenciar e atualizar o código das aplicações", false],
            ["Controlar o tráfego que chega às aplicações", false],
            ["Gerenciar a infraestrutura de rede subjacente", true],
        ],
    },
    {
        statement:
            "Qual ferramenta da AWS identifica grupos de segurança que liberam acesso irrestrito da internet a determinadas portas?",
        explanation:
            "O AWS Trusted Advisor tem verificações de segurança que sinalizam grupos de segurança com acesso irrestrito (0.0.0.0/0) a portas específicas, como SSH e RDP. O AWS Organizations governa várias contas, o AWS Cost Explorer analisa custos e uso, e o painel do Amazon EC2 mostra as regras, mas não aponta quais estão abertas demais.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Organizations", false],
            ["AWS Trusted Advisor", true],
            ["AWS Cost Explorer", false],
            ["Painel do Amazon EC2", false],
        ],
    },
    {
        statement: "Qual das atividades a seguir é responsabilidade da AWS?",
        explanation:
            "Ao fim da vida útil, a AWS destrói fisicamente as mídias de armazenamento seguindo padrões do setor, para que nenhum dado vaze. Criar usuários e grupos do IAM, aplicar patches no sistema operacional convidado e configurar a segurança das instâncias do Amazon EC2 são tarefas do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Criar usuários e grupos do IAM e anexar as políticas", false],
            ["Destruir fisicamente as mídias de armazenamento ao fim da vida útil", true],
            ["Aplicar patches nos sistemas operacionais convidados das instâncias", false],
            ["Configurar as opções de segurança das instâncias do Amazon EC2", false],
        ],
    },
    {
        statement:
            "Quais tarefas um cliente deve executar quando suspeita que uma conta da AWS foi comprometida? (Selecione DUAS opções.)",
        explanation:
            "Diante da suspeita, troque senhas e rotacione chaves de acesso para invalidar credenciais roubadas e acione o AWS Support para ajudar na investigação e na correção. Remover o MFA enfraquece a proteção, mudar de Região não tira o acesso do invasor e excluir o CloudTrail apaga o histórico necessário para entender o que aconteceu.",
        topic: "Segurança e identidade",
        options: [
            ["Trocar senhas e rotacionar chaves de acesso", true],
            ["Remover os dispositivos MFA da conta", false],
            ["Mover os recursos para outra Região", false],
            ["Excluir as trilhas e os logs do AWS CloudTrail", false],
            ["Entrar em contato com o AWS Support", true],
        ],
    },
    {
        statement:
            "Um usuário executa uma aplicação na AWS e percebe que um ou mais endereços IP pertencentes à AWS estão participando de um ataque distribuído de negação de serviço (DDoS). Quem ele deve contatar PRIMEIRO?",
        explanation:
            "Uso de recursos da AWS em atividades maliciosas, como DDoS, invasões e spam, deve ser reportado à equipe AWS Trust & Safety (antes chamada AWS Abuse), que investiga e interrompe o abuso. O AWS Support, o Technical Account Manager e os arquitetos de soluções ajudam o cliente com o próprio ambiente, mas não são o canal de denúncia.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Support", false],
            ["Technical Account Manager (TAM) da AWS", false],
            ["Arquiteto de soluções da AWS", false],
            ["Equipe AWS Trust & Safety", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS oferece Network ACLs de entrada e saída para reforçar a segurança da conectividade externa das instâncias do Amazon EC2?",
        explanation:
            "As Network ACLs são recursos da Amazon VPC: funcionam como firewall stateless no nível da sub-rede, com regras de entrada e saída, e complementam os grupos de segurança das instâncias. O IAM controla identidades e permissões, o Amazon Connect é uma central de atendimento e o Amazon API Gateway publica e gerencia APIs.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["AWS IAM", false],
            ["Amazon Connect", false],
            ["Amazon VPC", true],
            ["Amazon API Gateway", false],
        ],
    },
    {
        statement:
            "Uma aplicação web na AWS está recebendo uma enxurrada de requisições maliciosas vindas sempre do mesmo conjunto de endereços IP. Qual serviço da AWS pode proteger a aplicação e bloquear esse tráfego?",
        explanation:
            "O AWS WAF permite criar regras com conjuntos de endereços IP para bloquear essas origens e filtrar padrões maliciosos na camada de aplicação. O IAM controla as permissões de identidades, o Amazon GuardDuty detecta ameaças mas não bloqueia tráfego por conta própria e o Amazon SNS apenas envia notificações.",
        topic: "Segurança e identidade",
        options: [
            ["AWS IAM", false],
            ["Amazon GuardDuty", false],
            ["Amazon SNS", false],
            ["AWS WAF", true],
        ],
    },
    {
        statement:
            "Onde os usuários podem encontrar e contratar soluções de segurança de fornecedores terceiros?",
        explanation:
            "O AWS Marketplace é um catálogo digital com software de fornecedores independentes, incluindo firewalls, detecção de intrusão e ferramentas de conformidade, prontos para contratar e implantar. O AWS Service Catalog organiza produtos aprovados para uso interno, o AWS CloudFormation provisiona infraestrutura como código e o AWS CodeDeploy automatiza implantações.",
        topic: "Ferramentas e suporte",
        options: [
            ["AWS Service Catalog", false],
            ["AWS Marketplace", true],
            ["AWS CloudFormation", false],
            ["AWS CodeDeploy", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, quem é responsável pela segurança e pela conformidade?",
        explanation:
            "Segurança e conformidade são divididas: a AWS responde pela segurança da nuvem (instalações, hardware, rede global e virtualização) e o cliente, pela segurança na nuvem (dados, IAM, configurações e aplicações). Nenhuma das partes responde sozinha, e órgãos reguladores não assumem responsabilidade operacional no modelo.",
        topic: "Segurança e identidade",
        options: [
            ["Somente o cliente é responsável", false],
            ["Somente a AWS é responsável", false],
            ["A AWS e o cliente dividem a responsabilidade", true],
            ["A AWS divide a responsabilidade com o órgão regulador do setor", false],
        ],
    },
    {
        statement: "Qual serviço da AWS é usado para criptografar volumes do Amazon EBS?",
        explanation:
            "A criptografia do Amazon EBS usa chaves do AWS Key Management Service (AWS KMS), que cria, controla e registra o uso das chaves que protegem os dados em repouso. O AWS Certificate Manager cuida de certificados SSL/TLS para dados em trânsito, o Systems Manager automatiza a operação e o AWS Config registra configurações.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Certificate Manager (ACM)", false],
            ["AWS Systems Manager", false],
            ["AWS KMS", true],
            ["AWS Config", false],
        ],
    },
    {
        statement:
            "O que está entre as responsabilidades do cliente no modelo de responsabilidade compartilhada da AWS?",
        explanation:
            "A segurança das aplicações (código, controle de acesso e autenticação) fica do lado do cliente, que as desenvolve e configura. A infraestrutura de virtualização, a infraestrutura de rede global e a segurança física do hardware fazem parte da segurança da nuvem, que é responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Infraestrutura de virtualização", false],
            ["Infraestrutura de rede", false],
            ["Segurança das aplicações", true],
            ["Segurança física do hardware", false],
        ],
    },
    {
        statement:
            "Qual destas atividades é responsabilidade da AWS no modelo de responsabilidade compartilhada?",
        explanation:
            "Servidores, armazenamento e equipamentos de rede dos data centers são mantidos exclusivamente pela AWS. Configurar aplicações de terceiros, proteger o acesso às aplicações e aos dados e gerenciar AMIs personalizadas são tarefas do cliente, parte da segurança na nuvem.",
        topic: "Segurança e identidade",
        options: [
            ["Configurar aplicações de terceiros", false],
            ["Manter o hardware físico dos data centers", true],
            ["Proteger o acesso às aplicações e aos dados", false],
            ["Gerenciar AMIs personalizadas do Amazon EC2", false],
        ],
    },
    {
        statement:
            "Como um administrador de sistemas pode acrescentar uma camada extra de segurança ao login de um usuário no Console de Gerenciamento da AWS?",
        explanation:
            "A autenticação multifator exige, além da senha, um código ou uma chave de um dispositivo, o que acrescenta uma camada ao login. O Amazon GuardDuty detecta atividades suspeitas e o AWS CloudTrail registra os eventos de login, mas nenhum dos dois muda a autenticação, e auditar funções do IAM revisa permissões sem proteger o login.",
        topic: "Segurança e identidade",
        options: [
            ["Monitorar os logins com o Amazon GuardDuty", false],
            ["Auditar periodicamente as funções do IAM", false],
            ["Ativar a autenticação multifator (MFA)", true],
            ["Registrar os logins com o AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Onde um cliente encontra informações sobre as ações proibidas na infraestrutura da AWS?",
        explanation:
            "A Política de Uso Aceitável da AWS (Acceptable Use Policy) define o que não é permitido fazer com os serviços, como atividades ilegais, ataques a redes e envio de spam. O AWS Trusted Advisor recomenda boas práticas, o IAM controla permissões de acesso e o console de faturamento mostra custos, faturas e pagamentos.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Trusted Advisor", false],
            ["AWS Identity and Access Management (IAM)", false],
            ["Console de Faturamento da AWS", false],
            ["Política de Uso Aceitável da AWS", true],
        ],
    },
    {
        statement:
            "Quais são práticas recomendadas para gerenciar os usuários do IAM? (Selecione DUAS opções.)",
        explanation:
            "Exigir MFA acrescenta um segundo fator ao login e impedir a reutilização evita a volta a senhas já expostas, e as duas regras podem ser configuradas no IAM. Compartilhar um usuário apaga a rastreabilidade, e guardar senha em texto simples ou repeti-la em outros sites facilita o acesso indevido.",
        topic: "Segurança e identidade",
        options: [
            ["Impedir que os usuários reutilizem senhas anteriores", true],
            ["Exigir autenticação multifator (MFA) dos usuários", true],
            ["Exigir que as senhas sejam guardadas em texto simples", false],
            ["Compartilhar um mesmo usuário do IAM entre a equipe", false],
            ["Recomendar a mesma senha na AWS e em outros sites", false],
        ],
    },
    {
        statement:
            "Qual situação deve ser reportada à equipe AWS Trust & Safety, responsável pelas denúncias de abuso?",
        explanation:
            "Tentativas de invasão, DDoS, spam ou malware originados de recursos da AWS são abuso e devem ser reportados à AWS Trust & Safety (antiga equipe AWS Abuse). Interrupções em uma Zona de Disponibilidade aparecem no AWS Health Dashboard, falha de acesso a um bucket do S3 é questão de permissões e troca de forma de pagamento é assunto de faturamento.",
        topic: "Segurança e identidade",
        options: [
            ["Uma Zona de Disponibilidade apresenta interrupção de serviço", false],
            ["Uma tentativa de invasão é feita a partir de um endereço IP da AWS", true],
            [
                "Um usuário não consegue acessar um bucket do Amazon S3 a partir de um IP da AWS",
                false,
            ],
            ["Um usuário precisa trocar a forma de pagamento porque ela foi comprometida", false],
        ],
    },
    {
        statement: "Quais destes são componentes da Amazon VPC? (Selecione DUAS opções.)",
        explanation:
            "Sub-redes dividem o intervalo de endereços IP da VPC, e gateways de internet conectam a VPC à internet; ambos são componentes da Amazon VPC, assim como tabelas de rotas e Network ACLs. Objetos e buckets pertencem ao Amazon S3, e chaves de acesso são credenciais do IAM.",
        topic: "Rede e entrega de conteúdo",
        options: [
            ["Objetos", false],
            ["Sub-redes", true],
            ["Buckets de armazenamento", false],
            ["Gateways de internet", true],
            ["Chaves de acesso", false],
        ],
    },
    {
        statement:
            "Qual função os usuários podem executar com o AWS Key Management Service (AWS KMS)?",
        explanation:
            "O AWS KMS cria e controla as chaves criptográficas usadas para criptografar e descriptografar dados em serviços da AWS e em aplicações, com o uso registrado no AWS CloudTrail. Chaves de acesso do usuário raiz e de usuários do IAM são credenciais gerenciadas no IAM, onde também se configuram os dispositivos de MFA.",
        topic: "Segurança e identidade",
        options: [
            ["Criar e gerenciar as chaves de acesso do usuário raiz da conta da AWS", false],
            ["Criar e gerenciar as chaves de acesso de um usuário do IAM", false],
            ["Criar e gerenciar chaves para criptografar e descriptografar dados", true],
            ["Criar e gerenciar chaves de dispositivos de autenticação multifator (MFA)", false],
        ],
    },
    {
        statement:
            "Quais serviços da AWS permitem gerar chaves de criptografia que podem ser usadas para criptografar dados? (Selecione DUAS opções.)",
        explanation:
            "O AWS KMS gera e gerencia chaves de criptografia em infraestrutura gerenciada pela AWS, e o AWS CloudHSM gera chaves em módulos de hardware (HSM) dedicados ao cliente. O ACM emite certificados SSL/TLS, o Amazon Macie classifica dados sensíveis no S3 e o IAM controla permissões.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Key Management Service (AWS KMS)", true],
            ["AWS CloudHSM", true],
            ["Amazon Macie", false],
            ["AWS Certificate Manager (ACM)", false],
            ["AWS Identity and Access Management (IAM)", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, quais itens são gerenciados pelo cliente? (Selecione DUAS opções.)",
        explanation:
            "O cliente configura grupos de segurança e Network ACLs e aplica patches no sistema operacional convidado das instâncias EC2. No Amazon RDS, a AWS cuida dos patches do sistema operacional, e o descarte de discos e o acesso físico aos data centers também são responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Descarte de dispositivos físicos de armazenamento", false],
            ["Configuração de grupos de segurança e Network ACLs", true],
            ["Aplicação de patches no sistema operacional de uma instância do Amazon RDS", false],
            ["Controle do acesso físico aos data centers", false],
            ["Aplicação de patches no sistema operacional de uma instância do Amazon EC2", true],
        ],
    },
    {
        statement: "Ao executar uma aplicação na Nuvem AWS, pelo que o cliente é responsável?",
        explanation:
            "O cliente cuida do que roda na nuvem, como as atualizações e correções do software da própria aplicação. Hardware físico, hipervisor e controle de quem entra nos data centers fazem parte da segurança da nuvem, que é responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Gerenciar o hardware físico dos servidores", false],
            ["Atualizar o hipervisor da infraestrutura", false],
            ["Definir quem pode entrar no data center", false],
            ["Gerenciar as atualizações da aplicação", true],
        ],
    },
    {
        statement:
            "Qual serviço da AWS ajuda a identificar atividades maliciosas ou não autorizadas em contas e cargas de trabalho da AWS?",
        explanation:
            "O Amazon GuardDuty detecta ameaças continuamente, analisando logs do AWS CloudTrail, VPC Flow Logs e DNS com machine learning e inteligência de ameaças. O Amazon Rekognition analisa imagens, o Trusted Advisor recomenda boas práticas e o CloudWatch monitora métricas e logs.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Rekognition", false],
            ["AWS Trusted Advisor", false],
            ["Amazon GuardDuty", true],
            ["Amazon CloudWatch", false],
        ],
    },
    {
        statement:
            "Uma empresa hospeda uma aplicação web em um contêiner Docker no Amazon EC2. Qual das tarefas a seguir é responsabilidade da AWS?",
        explanation:
            "Com o Docker rodando direto no EC2, a AWS cuida da infraestrutura física, como a manutenção do hardware nos data centers. Escalar a aplicação, orquestrar os contêineres e manter o sistema operacional convidado atualizado ficam com o cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Escalar a aplicação web e os serviços desenvolvidos com Docker", false],
            ["Provisionar e agendar contêineres no cluster e manter sua disponibilidade", false],
            ["Fazer a manutenção do hardware nas instalações que executam a Nuvem AWS", true],
            ["Gerenciar o sistema operacional convidado, incluindo atualizações e patches", false],
        ],
    },
    {
        statement:
            "Quais ações representam boas práticas de uso do AWS Identity and Access Management (IAM)? (Selecione DUAS opções.)",
        explanation:
            "Exigir senhas fortes e fazer a rotação periódica das chaves de acesso reduzem o risco de credenciais comprometidas. Credenciais devem ser individuais, o console usa senha e não chaves de acesso, e funções do IAM são o jeito recomendado de delegar permissões.",
        topic: "Segurança e identidade",
        options: [
            ["Configurar uma política de senhas forte para os usuários", true],
            ["Compartilhar credenciais entre usuários que trabalham na mesma Região", false],
            ["Usar chaves de acesso para entrar no Console de Gerenciamento da AWS", false],
            ["Fazer a rotação periódica das chaves de acesso de longo prazo", true],
            ["Evitar o uso de funções do IAM para delegar permissões", false],
        ],
    },
    {
        statement:
            "Qual recurso ou serviço da AWS pode ser usado para capturar informações sobre o tráfego de entrada e de saída na infraestrutura de uma VPC?",
        explanation:
            "O VPC Flow Logs registra metadados do tráfego IP que entra e sai das interfaces de rede da VPC, como origem, destino, porta e se o tráfego foi aceito. O CloudTrail registra chamadas de API, o Config registra configurações de recursos e o Trusted Advisor faz recomendações.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Config", false],
            ["VPC Flow Logs", true],
            ["AWS Trusted Advisor", false],
            ["AWS CloudTrail", false],
        ],
    },
    {
        statement:
            "Quais tarefas são responsabilidade do cliente no modelo de responsabilidade compartilhada da AWS? (Selecione DUAS opções.)",
        explanation:
            "O cliente responde pela configuração das próprias aplicações e pelos grupos de segurança que controlam o acesso aos recursos. Acesso físico às instalações, ciclo de vida do hardware e proteção da rede física que conecta Regiões e Zonas de Disponibilidade são da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Gerenciar o acesso às instalações da infraestrutura", false],
            ["Gerenciar o ciclo de vida do hardware da infraestrutura de nuvem", false],
            ["Gerenciar a configuração das aplicações do usuário", true],
            ["Proteger a rede física da nuvem", false],
            ["Configurar os grupos de segurança", true],
        ],
    },
    {
        statement:
            "Uma aplicação web é hospedada na AWS com um Elastic Load Balancer, várias instâncias do Amazon EC2 e o Amazon RDS. Quais medidas de segurança são responsabilidade da AWS? (Selecione DUAS opções.)",
        explanation:
            "A AWS protege a rede subjacente contra falsificação de IP e captura de pacotes e aplica os patches do sistema operacional e do mecanismo no RDS, que é gerenciado. Antivírus nas instâncias EC2, criptografia entre EC2 e load balancer e grupos de segurança são do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Executar uma varredura de vírus nas instâncias EC2", false],
            ["Proteger contra falsificação de IP e captura de pacotes (sniffing)", true],
            ["Instalar os patches de segurança mais recentes na instância do RDS", true],
            ["Criptografar a comunicação entre as instâncias EC2 e o load balancer", false],
            ["Configurar um grupo de segurança e uma Network ACL para as instâncias EC2", false],
        ],
    },
    {
        statement:
            "Por exigência de conformidade, uma empresa precisa de um bucket do Amazon S3 que não possa ter nenhum objeto público. Como isso pode ser feito?",
        explanation:
            "O S3 Block Public Access, no nível da conta ou do bucket, se sobrepõe a políticas e ACLs que concederiam acesso público, impedindo objetos públicos. Reunião e aprovação manual não impõem a regra tecnicamente, e um monitor próprio só corrige depois que o problema acontece.",
        topic: "Segurança e identidade",
        options: [
            ["Ativar o S3 Block Public Access pelo Console de Gerenciamento da AWS", true],
            ["Reunir a equipe para reforçar que só objetos privados devem ser enviados", false],
            ["Exigir que todo objeto seja aprovado manualmente antes do upload", false],
            ["Criar um serviço que monitore os uploads e remova os objetos públicos", false],
        ],
    },
    {
        statement:
            "Segundo o modelo de responsabilidade compartilhada da AWS, qual das tarefas a seguir é responsabilidade do cliente?",
        explanation:
            "Quem roda banco de dados em instâncias EC2 gerencia o sistema operacional convidado e aplica os patches. No Amazon RDS e no Amazon DynamoDB, que são serviços gerenciados, a AWS cuida do sistema operacional, e o hipervisor é sempre responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Instalar patches de segurança nos hipervisores Xen e KVM", false],
            ["Instalar patches do sistema operacional do Amazon DynamoDB", false],
            [
                "Instalar patches do sistema operacional em instâncias de banco de dados no Amazon EC2",
                true,
            ],
            [
                "Instalar patches do sistema operacional em instâncias de banco de dados do Amazon RDS",
                false,
            ],
        ],
    },
    {
        statement:
            "Qual serviço da AWS facilita criar e gerenciar usuários e grupos da AWS e dar a eles acesso seguro aos recursos, sem custo adicional?",
        explanation:
            "O IAM cria usuários, grupos e funções e controla, por políticas, o acesso aos recursos da AWS, sem cobrança adicional. O Amazon Cognito gerencia usuários de aplicações web e mobile, o AWS Directory Service é um diretório gerenciado e pago e o Firewall Manager centraliza regras de firewall.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Directory Service for Microsoft Active Directory", false],
            ["Amazon Cognito", false],
            ["AWS Identity and Access Management (IAM)", true],
            ["AWS Firewall Manager", false],
        ],
    },
    {
        statement:
            "Um usuário precisa gerar um relatório com o status das principais verificações de segurança de uma conta AWS, incluindo as permissões dos buckets do Amazon S3, se o MFA está ativado no usuário raiz e se algum grupo de segurança permite acesso irrestrito. Onde todas essas informações podem ser encontradas em um só lugar?",
        explanation:
            "O AWS Trusted Advisor reúne verificações de segurança como permissões de buckets S3, MFA no usuário raiz e grupos de segurança com acesso irrestrito. O relatório de credenciais cobre só usuários do IAM, o CloudTrail registra chamadas de API e o CloudWatch mostra métricas e logs.",
        topic: "Segurança e identidade",
        options: [
            ["Painel personalizado do Amazon CloudWatch", false],
            ["Trilhas do AWS CloudTrail", false],
            ["Relatório do AWS Trusted Advisor", true],
            ["Relatório de credenciais do IAM", false],
        ],
    },
    {
        statement:
            "Usar o AWS Config para registrar, auditar e avaliar mudanças nos recursos da AWS, garantindo rastreabilidade, é um exemplo de qual pilar do AWS Well-Architected Framework?",
        explanation:
            "Habilitar a rastreabilidade, monitorando e auditando ações e mudanças no ambiente, é princípio de design do pilar de segurança, e o AWS Config aplica isso ao registrar e avaliar configurações. Excelência operacional foca em executar sistemas, e os outros dois pilares tratam de recursos e custos.",
        topic: "Segurança e identidade",
        options: [
            ["Segurança, que trata da proteção de dados, sistemas e ativos", true],
            ["Excelência operacional, que trata de executar e monitorar sistemas", false],
            ["Eficiência de desempenho, que trata do uso eficiente de recursos", false],
            ["Otimização de custos, que trata de evitar gastos desnecessários", false],
        ],
    },
    {
        statement:
            "Qual serviço ou recurso da AWS ajuda a restringir os serviços, os recursos e as ações de API que os usuários e as funções de cada conta-membro podem acessar?",
        explanation:
            "As políticas de controle de serviço (SCPs) do AWS Organizations definem o máximo de permissões das contas-membro, limitando serviços, recursos e ações de API. O Amazon Cognito autentica usuários de aplicações, o AWS Shield protege contra DDoS e o Firewall Manager centraliza regras de firewall.",
        topic: "Segurança e identidade",
        options: [
            ["Amazon Cognito", false],
            ["AWS Organizations", true],
            ["AWS Shield", false],
            ["AWS Firewall Manager", false],
        ],
    },
    {
        statement:
            "Um usuário quer criptografar os dados recebidos, armazenados e gerenciados pelo AWS CloudTrail. Qual serviço da AWS oferece esse recurso?",
        explanation:
            "O CloudTrail se integra ao AWS KMS para criptografar os arquivos de log com chaves gerenciadas no KMS (SSE-KMS). O ACM e o AWS Private CA emitem certificados usados na criptografia em trânsito, e o Secrets Manager guarda e rotaciona segredos, como senhas de banco de dados.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Secrets Manager", false],
            ["AWS Private Certificate Authority (AWS Private CA)", false],
            ["AWS Key Management Service (AWS KMS)", true],
            ["AWS Certificate Manager (ACM)", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de proteção ampliada contra ataques de negação de serviço distribuído (DDoS) em seu site e de assistência de especialistas da AWS durante esses eventos. Qual serviço gerenciado da AWS atende a esses requisitos?",
        explanation:
            "O AWS Shield Advanced amplia a proteção contra DDoS com visibilidade dos ataques, proteção de custos e acesso 24 horas à equipe de resposta a DDoS da AWS. O AWS WAF filtra requisições web, o Firewall Manager centraliza regras e o GuardDuty detecta ameaças, sem equipe de resposta.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Shield Advanced", true],
            ["AWS Firewall Manager", false],
            ["AWS WAF", false],
            ["Amazon GuardDuty", false],
        ],
    },
    {
        statement:
            "No modelo de responsabilidade compartilhada da AWS, quais são responsabilidades do cliente? (Selecione DUAS opções.)",
        explanation:
            "O cliente protege os dados em trânsito, por exemplo com TLS, e cuida da autenticação da integridade dos dados, verificando que não foram alterados. Segurança física e ambiental, dispositivos físicos de rede e descarte de discos são responsabilidade da AWS.",
        topic: "Segurança e identidade",
        options: [
            ["Segurança física e ambiental", false],
            ["Dispositivos físicos de rede, incluindo firewalls", false],
            ["Descarte de dispositivos de armazenamento", false],
            ["Segurança dos dados em trânsito", true],
            ["Autenticação da integridade dos dados", true],
        ],
    },
    {
        statement:
            "Em uma conta AWS independente, que não faz parte do AWS Organizations, quais tarefas só podem ser executadas depois de entrar com as credenciais do usuário raiz? (Selecione DUAS opções.)",
        explanation:
            "Em conta independente, encerrar a conta e ativar o acesso de usuários do IAM ao console de faturamento exigem o usuário raiz. Criar políticas, associar funções a instâncias EC2 e gerar chaves de acesso podem ser feitos por usuários do IAM com as permissões adequadas.",
        topic: "Segurança e identidade",
        options: [
            ["Encerrar definitivamente a conta AWS", true],
            ["Criar uma nova política do IAM", false],
            ["Ativar o acesso do IAM ao console de faturamento", true],
            ["Associar uma função do IAM a uma instância do Amazon EC2", false],
            ["Gerar chaves de acesso para usuários do IAM", false],
        ],
    },
    {
        statement:
            "Qual é o recurso MAIS eficaz para se manter atualizado sobre os anúncios de segurança da AWS?",
        explanation:
            "Os AWS Security Bulletins publicam avisos sobre vulnerabilidades recém-descobertas e as ações recomendadas para os serviços da AWS. O AWS Health Dashboard informa eventos que afetam seus recursos, o re:Post Knowledge Center traz respostas técnicas e o Inspector aponta falhas nas suas cargas.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Health Dashboard", false],
            ["AWS re:Post Knowledge Center", false],
            ["AWS Security Bulletins", true],
            ["Amazon Inspector", false],
        ],
    },
    {
        statement:
            "Uma empresa quer conceder acesso total a um bucket do Amazon S3 para um usuário específico. Qual elemento da política do bucket S3 contém os dados do usuário, ou seja, indica quem precisa de acesso ao bucket?",
        explanation:
            "Em uma política de bucket, o elemento Principal indica quem recebe ou tem negado o acesso: usuário, conta, função ou serviço. Action lista as operações permitidas, como s3:GetObject, Resource indica o bucket ou os objetos afetados e Statement é o bloco que agrupa esses elementos.",
        topic: "Segurança e identidade",
        options: [
            ["Principal", true],
            ["Action", false],
            ["Resource", false],
            ["Statement", false],
        ],
    },
    {
        statement:
            "Uma empresa executa cargas de trabalho no Amazon EC2 e no Amazon S3. Segundo o modelo de responsabilidade compartilhada, qual tarefa cabe à AWS?",
        explanation:
            "A AWS mantém a infraestrutura que executa os serviços, incluindo o hipervisor que isola as instâncias, e aplica as atualizações dele. Escolher as chaves de criptografia no S3, aplicar políticas do IAM e manter o sistema operacional das instâncias EC2 são tarefas do cliente.",
        topic: "Segurança e identidade",
        options: [
            ["Escolher as chaves de criptografia dos objetos armazenados no S3", false],
            ["Criar e aplicar políticas do IAM para os usuários da conta", false],
            ["Aplicar patches no sistema operacional de uma instância do Amazon EC2", false],
            ["Aplicar atualizações no hipervisor que executa as instâncias", true],
        ],
    },
    {
        statement:
            "Uma grande empresa contratou um desenvolvedor que precisa de credenciais da AWS. Quais boas práticas de segurança devem ser seguidas? (Selecione DUAS opções.)",
        explanation:
            "Dar acesso só aos recursos necessários aplica o princípio do privilégio mínimo, e exigir tamanho mínimo de senha fortalece as credenciais. O usuário raiz nunca deve ser compartilhado, o grupo de administradores dá acesso amplo demais e o usuário precisa poder trocar a própria senha.",
        topic: "Segurança e identidade",
        options: [
            ["Conceder acesso apenas aos recursos da AWS necessários para o trabalho", true],
            ["Compartilhar com o desenvolvedor as credenciais do usuário raiz da conta", false],
            ["Adicionar o desenvolvedor ao grupo de administradores no AWS IAM", false],
            [
                "Configurar uma política de senhas que impeça o desenvolvedor de trocar a senha",
                false,
            ],
            ["Garantir que a política de senhas da conta exija um tamanho mínimo", true],
        ],
    },
    {
        statement:
            "Qual das tarefas a seguir é necessária para implantar na AWS uma carga de trabalho em conformidade com o PCI DSS?",
        explanation:
            "A AWS mantém a certificação PCI DSS da infraestrutura, mas o cliente precisa escolher serviços que estejam no escopo do PCI DSS e aplicar os controles exigidos na própria aplicação. Não existe chamado de suporte que ative conformidade, e nem todo serviço da AWS está no escopo.",
        topic: "Segurança e identidade",
        options: [
            [
                "Usar qualquer serviço da AWS e implementar os controles do PCI DSS na camada de aplicação",
                false,
            ],
            [
                "Usar um serviço no escopo do PCI DSS e abrir um chamado no AWS Support para ativar a conformidade na aplicação",
                false,
            ],
            [
                "Usar qualquer serviço da AWS e abrir um chamado no AWS Support para ativar a conformidade com o PCI DSS",
                false,
            ],
            [
                "Usar um serviço da AWS no escopo do PCI DSS e aplicar os controles do PCI DSS na camada de aplicação",
                true,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor web teme que um ataque DDoS atinja sua aplicação. Quais serviços ou recursos da AWS ajudam a proteger contra esse tipo de ataque? (Selecione DUAS opções.)",
        explanation:
            "O AWS Shield mitiga ataques DDoS nas camadas de rede e transporte, e o Amazon CloudFront distribui e absorve o tráfego nos pontos de presença antes que ele chegue à origem. CloudTrail e Config registram atividades e configurações, e o Health Dashboard informa eventos dos serviços.",
        topic: "Segurança e identidade",
        options: [
            ["AWS Shield", true],
            ["AWS CloudTrail", false],
            ["Amazon CloudFront", true],
            ["AWS Config", false],
            ["AWS Health Dashboard", false],
        ],
    },
    {
        statement:
            "Uma empresa quer dar a um funcionário acesso ao Amazon RDS, limitando a interação à AWS CLI e aos SDKs da AWS. Qual combinação de ações atende a esses requisitos seguindo o princípio do privilégio mínimo? (Selecione DUAS opções.)",
        explanation:
            "Um usuário do IAM com chaves de acesso e sem senha de console usa a AWS CLI e os SDKs, e a política com acesso ao RDS limita as permissões ao necessário. Senha de console contraria o requisito, e acesso de administrador viola o privilégio mínimo.",
        topic: "Segurança e identidade",
        options: [
            ["Criar um usuário do IAM com senha de console e sem chaves de acesso", false],
            ["Criar um usuário do IAM com chaves de acesso e sem senha de console", true],
            ["Criar uma função do IAM apenas com acesso ao console da AWS", false],
            ["Criar uma política do IAM com acesso de administrador e anexá-la ao usuário", false],
            ["Criar uma política do IAM com acesso ao Amazon RDS e anexá-la ao usuário", true],
        ],
    },
    {
        statement: "Qual das opções a seguir é responsabilidade do cliente ao usar o Amazon RDS?",
        explanation:
            "No Amazon RDS, o cliente controla quem se conecta ao banco configurando os grupos de segurança. A AWS aplica os patches do sistema operacional, executa os backups automáticos que permitem a recuperação pontual e substitui instâncias que falham, por ser um serviço gerenciado.",
        topic: "Segurança e identidade",
        options: [
            ["Aplicar patches no sistema operacional do hardware subjacente", false],
            [
                "Controlar o tráfego de entrada e saída do banco de dados com grupos de segurança",
                true,
            ],
            [
                "Executar os backups que permitem a recuperação pontual da instância de banco de dados",
                false,
            ],
            ["Substituir instâncias de banco de dados que falharam", false],
        ],
    },
    {
        statement: "Qual é a responsabilidade do cliente ao usar o AWS Lambda?",
        explanation:
            "No AWS Lambda, a AWS gerencia servidores, sistema operacional, runtime e escalabilidade, e o cliente cuida da aplicação: o código das funções, suas configurações e permissões. A criptografia do código em repouso já é feita pela AWS por padrão, com opção de usar chaves próprias no KMS.",
        topic: "Segurança e identidade",
        options: [
            ["Configuração do sistema operacional", false],
            ["Gerenciamento da aplicação", true],
            ["Gerenciamento da plataforma", false],
            ["Criptografia do código", false],
        ],
    },
];
