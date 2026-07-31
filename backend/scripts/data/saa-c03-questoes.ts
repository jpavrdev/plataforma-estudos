// Banco de questões do simulado AWS Certified Solutions Architect Associate (SAA-C03).
// Compartilhado pelo seed (instalação nova) e pelo script de atualização
// (instalação que já tem o simulado). Regras do banco: distratores da mesma
// categoria da resposta e a correta não pode ser a única opção mais longa,
// nem a única mais curta por folga visível. Questões de múltipla escolha
// terminam com "(Selecione DUAS opções.)" e têm cinco opções com duas
// corretas.

export type Questao = {
    statement: string;
    explanation: string;
    topic: string;
    options: [string, boolean][];
};

export const QUESTOES: Questao[] = [
    {
        statement:
            "Uma fintech precisa criptografar arquivos de backup de vários gigabytes antes de armazená-los. A operação Encrypt da API do AWS KMS aceita no máximo 4 KB de dados por chamada, o que inviabiliza cifrar o arquivo inteiro diretamente. Qual abordagem resolve o cenário usando o próprio KMS?",
        explanation:
            "O padrão de envelope encryption usa GenerateDataKey: o KMS retorna a chave em texto claro, usada para cifrar o arquivo localmente sem limite de tamanho, e a mesma chave já cifrada por uma CMK, guardada junto do arquivo para uso posterior em Decrypt. Fatiar o arquivo em blocos não contorna o limite, porque cada chamada de Encrypt continua restrita a 4 KB de dados, então blocos maiores ainda falhariam. A SSE-S3 cifra objetos no S3 com chaves geridas pelo próprio S3, não pelo KMS, e não se aplica a um arquivo antes do upload. O limite de 4 KB da operação Encrypt é uma característica fixa do serviço e não é alterado por caso de suporte.",
        topic: "AWS KMS - envelope encryption",
        options: [
            [
                "Dividir o arquivo em blocos de 4 KB, pois o Encrypt do KMS soma o total processado.",
                false,
            ],
            [
                "Usar GenerateDataKey para gerar uma data key e cifrar o arquivo localmente com ela.",
                true,
            ],
            [
                "Ativar a SSE-S3 no bucket de destino, já que ela reaproveita as chaves do KMS automaticamente.",
                false,
            ],
            [
                "Abrir um caso de suporte, pois o limite de 4 KB do Encrypt pode ser ampliado sob pedido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa do setor jurídico guarda documentos confidenciais no Amazon S3. O compliance exige uma trilha de auditoria detalhada de cada uso da chave de criptografia (quem descriptografou qual objeto e quando) e a capacidade de desabilitar a chave para revogar o acesso imediatamente. Qual opção de criptografia do S3 atende a esse requisito?",
        explanation:
            "A SSE-KMS usa uma CMK do AWS KMS, e toda chamada de uso da chave (Encrypt, Decrypt, GenerateDataKey) fica registrada no AWS CloudTrail, permitindo auditar quem acessou cada objeto; além disso, a CMK pode ser desabilitada a qualquer momento para bloquear novas operações. A SSE-S3 também cifra em repouso, mas usa chaves geridas inteiramente pelo S3, sem registrar no CloudTrail chamadas individuais de uso de chave nem permitir que o cliente a desabilite. Deixar o bucket sem criptografia no lado do servidor não atende nem à auditoria nem ao controle de chave exigidos. Cifrar no lado do cliente resolve a confidencialidade, mas transfere toda a gestão de chaves e auditoria para fora da AWS.",
        topic: "Amazon S3 - SSE-KMS",
        options: [
            [
                "Deixar o bucket sem criptografia do lado do servidor, controlando o acesso só pelo IAM.",
                false,
            ],
            ["Cifrar os arquivos no lado do cliente antes do upload.", false],
            [
                "Habilitar a SSE-KMS no bucket, usando uma CMK do AWS KMS para cifrar os objetos.",
                true,
            ],
            [
                "Habilitar a SSE-S3, que já grava no CloudTrail cada uso da chave gerenciada pelo S3.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer que todo novo volume do Amazon EBS criado na conta, em uma região específica, seja criptografado automaticamente a partir de agora, sem depender de cada engenheiro marcar a opção manualmente ao lançar uma instância. Qual configuração atende a esse objetivo?",
        explanation:
            "O EBS permite habilitar a criptografia por padrão no nível de conta e região: uma vez ativada, todo novo volume e todo novo snapshot criados nessa região passam a ser criptografados automaticamente, sem ação manual, e sem alterar volumes já existentes. Uma policy IAM negando CreateVolume sem a tag correta bloquearia criações indevidas, mas depende de tag aplicada corretamente e não criptografa nada por si só. Uma regra do AWS Config apenas relata volumes não criptografados, sem impedir ou automatizar a criptografia. Marcar a AMI como criptografada afeta o volume raiz criado a partir dela, mas não cobre volumes de dados adicionais anexados fora da AMI.",
        topic: "Amazon EBS - criptografia padrão",
        options: [
            [
                "Habilitar a criptografia por padrão do EBS na conta, para cada região desejada.",
                true,
            ],
            [
                "Criar uma policy IAM que nega CreateVolume sem a tag Encrypted, cobrindo todo lançamento.",
                false,
            ],
            [
                "Configurar uma regra do AWS Config que reporta volumes criados sem criptografia.",
                false,
            ],
            [
                "Marcar a AMI usada nos lançamentos como criptografada, propagando isso aos volumes.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de saúde precisa criptografar volumes do Amazon EBS e objetos do Amazon S3 usando uma chave sobre a qual tenha controle total (definir a key policy, desabilitar a chave e agendar sua exclusão), e o compliance exige uma trilha de auditoria detalhada de cada uso dessa chave. Quais DUAS ações atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "Uma CMK gerenciada pelo cliente dá à empresa controle total sobre a key policy, a possibilidade de desabilitar a chave e de agendar sua exclusão, ao contrário de uma chave gerenciada pela AWS. Habilitar o CloudTrail para registrar os eventos de uso da chave (Encrypt, Decrypt, GenerateDataKey) fornece a trilha de auditoria detalhada exigida. A chave gerenciada pela AWS (aws/s3, aws/ebs) simplifica a operação, mas sua key policy não é customizável pelo cliente e ela não pode ser agendada para exclusão. Os logs padrão do CloudWatch dos serviços S3 e EBS não detalham chamadas individuais de uso da chave do KMS, só o CloudTrail faz isso. Uma chave gerenciada pela AWS é vinculada a uma única conta e não pode ser compartilhada entre contas dessa forma.",
        topic: "AWS KMS - chave gerenciada pelo cliente",
        options: [
            [
                "Criar uma CMK gerenciada pelo cliente no AWS KMS, com key policy definida pela empresa.",
                true,
            ],
            [
                "Usar a chave gerenciada pela AWS (aws/s3 e aws/ebs), que já vem com key policy customizável.",
                false,
            ],
            [
                "Habilitar o AWS CloudTrail para registrar cada evento de uso da chave, como Encrypt e Decrypt.",
                true,
            ],
            [
                "Depender apenas dos logs padrão do CloudWatch, que já detalham cada uso da chave do KMS.",
                false,
            ],
            [
                "Compartilhar a mesma chave gerenciada pela AWS entre as contas envolvidas no projeto.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um volume do Amazon EBS já em uso, anexado a uma instância EC2 em produção, foi criado sem criptografia. A política de segurança agora exige que ele passe a ser criptografado, usando apenas recursos nativos da AWS. Qual é o caminho correto?",
        explanation:
            "O EBS não permite ativar criptografia em um volume já existente diretamente: o caminho suportado é criar um snapshot do volume, copiar esse snapshot habilitando a criptografia na cópia, e então criar um novo volume a partir do snapshot criptografado para substituir o original. Reanexar o mesmo volume não funciona, porque a criptografia é definida na criação do volume, não em uma reanexação. A criptografia por padrão da conta vale só para volumes criados dali em diante, não retroage sobre volumes existentes. Redimensionar o volume no console também não adiciona criptografia a um volume que já foi criado sem ela.",
        topic: "Amazon EBS - criptografar volume existente",
        options: [
            [
                "Desanexar o volume, reanexá-lo à instância e marcar a opção de criptografia nesse momento.",
                false,
            ],
            [
                "Habilitar a criptografia por padrão da conta, que passa a cobrir os volumes já existentes.",
                false,
            ],
            [
                "Abrir o volume no console do EC2 e alterar seu tamanho, o que aplica criptografia a ele.",
                false,
            ],
            [
                "Criar um snapshot do volume, copiá-lo com criptografia e gerar um volume a partir da cópia.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma instância do Amazon RDS em produção foi criada sem criptografia em repouso. Uma nova exigência de auditoria determina que os dados passem a ser armazenados de forma criptografada. Como isso pode ser feito, já que o RDS não permite ativar a criptografia em uma instância já existente?",
        explanation:
            "O caminho suportado é criar um snapshot manual da instância, copiar esse snapshot habilitando a criptografia na cópia, e restaurar uma nova instância a partir do snapshot criptografado, atualizando a aplicação para o novo endpoint. Não é possível criar um Read Replica criptografado a partir de uma instância de origem que não é criptografada, essa combinação não é suportada pelo RDS. A opção de criptografia em repouso não fica disponível para edição em uma instância já criada sem ela, só é definida na criação. A criptografia por padrão do EBS não se aplica a instâncias do RDS, que gerenciam sua própria criptografia de armazenamento.",
        topic: "Amazon RDS - criptografia em repouso",
        options: [
            [
                "Criar um Read Replica criptografado a partir da instância de produção, já em execução.",
                false,
            ],
            [
                "Tirar um snapshot da instância, copiá-lo com criptografia e restaurar uma instância nova.",
                true,
            ],
            [
                "Abrir a instância no console do RDS e ativar a criptografia em repouso diretamente.",
                false,
            ],
            ["Habilitar a criptografia por padrão do EBS na conta, cobrindo também o RDS.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa armazenar dezenas de parâmetros de configuração (URLs de endpoints, feature flags) e algumas credenciais de um job em lote que não exige rotação automática. O requisito principal é manter o custo mensal o mais baixo possível. Qual serviço é mais adequado?",
        explanation:
            "O Parameter Store oferece parâmetros SecureString, cifrados com KMS, sem custo no nível standard, cobrindo tanto configurações comuns quanto credenciais que não exigem rotação automática, o que atende ao requisito de custo. O Secrets Manager também cifra segredos e oferece rotação automática nativa, mas cobra por segredo armazenado e por chamada de API, um custo desnecessário quando a rotação não é exigida. Gravar credenciais no código-fonte expõe segredos em texto claro dentro do repositório. Guardar tudo em variáveis de ambiente da instância, sem cifragem, deixa as credenciais visíveis a qualquer processo com acesso a ela.",
        topic: "AWS Systems Manager Parameter Store",
        options: [
            [
                "Usar o Secrets Manager para tudo, aproveitando a rotação automática nativa dos segredos.",
                false,
            ],
            [
                "Guardar tudo em variáveis de ambiente da instância EC2, sem nenhuma camada de cifragem.",
                false,
            ],
            [
                "Usar o Parameter Store no nível standard, com parâmetros SecureString cifrados pelo KMS.",
                true,
            ],
            [
                "Gravar as credenciais direto no código-fonte da aplicação, versionado no repositório.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função AWS Lambda precisa se conectar a um banco Amazon RDS para MySQL. O time exige: nenhuma credencial fixa no código ou em variável de ambiente, rotação automática a cada 30 dias sem escrever código de rotação customizado, e que a função tenha apenas a permissão mínima necessária para ler a credencial. Quais DUAS ações atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "Armazenar a credencial no Secrets Manager com a rotação nativa para RDS habilitada cobre a exigência de rotação automática a cada 30 dias sem código customizado, já que o serviço gerencia esse ciclo integrado ao RDS. Anexar à role de execução da Lambda uma policy restrita a secretsmanager:GetSecretValue sobre aquele segredo específico garante a permissão mínima necessária. Guardar a credencial em variável de ambiente cifrada com KMS evita o texto claro, mas não rotaciona automaticamente nem elimina a credencial fixa. O Parameter Store no nível standard cifra o segredo, mas não oferece rotação automática nativa para RDS sem uma Lambda customizada adicional. Conceder AdministratorAccess à role da função viola diretamente o princípio de permissão mínima.",
        topic: "AWS Secrets Manager",
        options: [
            [
                "Guardar a credencial em uma variável de ambiente da Lambda, cifrada com uma chave do KMS.",
                false,
            ],
            [
                "Armazenar a credencial no AWS Secrets Manager, com a rotação nativa para RDS habilitada.",
                true,
            ],
            [
                "Anexar a policy gerenciada AdministratorAccess à role de execução da função Lambda.",
                false,
            ],
            [
                "Anexar à role da Lambda uma policy restrita à ação secretsmanager:GetSecretValue nesse segredo.",
                true,
            ],
            [
                "Armazenar a credencial no Parameter Store, no nível standard, sem configurar rotação adicional.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa expõe uma aplicação web pública atrás de um Application Load Balancer e hoje compra certificados TLS de uma autoridade externa, renovando manualmente todo ano. A equipe quer eliminar esse trabalho manual e o custo de compra, mantendo a renovação sempre em dia. Qual solução atende isso?",
        explanation:
            "O AWS Certificate Manager emite certificados públicos gratuitamente para uso em recursos integrados como ALB, NLB e CloudFront, e renova esses certificados automaticamente antes do vencimento, desde que a validação de domínio continue válida, eliminando compra e renovação manual. Continuar comprando da autoridade externa e programar lembretes mantém exatamente o trabalho manual que a equipe quer eliminar. Um certificado autoassinado evita custo, mas navegadores não confiam nele para um site público, gerando alertas de segurança. Guardar o certificado no Secrets Manager não resolve a renovação, que é um problema do ciclo de vida do certificado, não do local onde ele fica guardado.",
        topic: "AWS Certificate Manager",
        options: [
            [
                "Emitir um certificado público pelo AWS Certificate Manager e associá-lo ao ALB.",
                true,
            ],
            [
                "Continuar comprando o certificado externo, mas programar um lembrete anual de renovação.",
                false,
            ],
            [
                "Gerar um certificado autoassinado para o domínio público e instalá-lo no ALB.",
                false,
            ],
            [
                "Guardar o certificado atual no AWS Secrets Manager para centralizar seu armazenamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "O endpoint de login de uma aplicação pública está recebendo tentativas repetidas de adivinhação de senha, vindas de poucos endereços IP, em volume muito acima do tráfego normal. A equipe quer bloquear automaticamente um IP quando ele ultrapassar um número de requisições em uma janela de tempo, sem afetar usuários legítimos. Qual recurso atende isso?",
        explanation:
            "Uma regra baseada em taxa (rate-based rule) no AWS WAF conta as requisições por endereço IP de origem em uma janela de tempo e bloqueia automaticamente o IP que ultrapassar o limite configurado, exatamente o comportamento pedido. Uma Security Group não enxerga volume de requisições por IP na camada de aplicação, apenas libera ou bloqueia portas e protocolos. O Shield Standard protege contra ataques volumétricos de rede e transporte, sem regras configuráveis por taxa de requisição na camada 7. Uma NACL também opera por porta e protocolo na subnet, sem noção de taxa de requisições HTTP por IP de origem.",
        topic: "AWS WAF",
        options: [
            [
                "Restringir a porta 443 na Security Group, limitando o número de conexões simultâneas aceitas.",
                false,
            ],
            [
                "Contar com a proteção automática do Shield Standard contra excesso de requisições por IP.",
                false,
            ],
            [
                "Criar uma entrada de negação na Network ACL da subnet para o intervalo de IPs suspeitos.",
                false,
            ],
            [
                "Criar uma regra baseada em taxa no AWS WAF, bloqueando o IP que exceder o limite na janela.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma startup com orçamento apertado quer uma proteção básica contra ataques volumétricos comuns de DDoS nas camadas de rede e transporte (como SYN flood e reflexão de UDP) para seus recursos públicos, sem custo adicional ou contrato. O que já atende esse requisito mínimo?",
        explanation:
            "O AWS Shield Standard é ativado automaticamente, sem custo, para todo cliente AWS, e protege recursos como Elastic Load Balancing, Amazon CloudFront e endereços IP elásticos contra os ataques volumétricos mais comuns nas camadas 3 e 4, sem exigir configuração ou contrato. O Shield Advanced adiciona mitigação para ataques mais sofisticados, proteção de custo e acesso ao time de resposta, mas com assinatura mensal, mais do que o cenário pede. O WAF atua na camada de aplicação, contra padrões como SQL injection, e não é o mecanismo de proteção volumétrica de rede. Um provedor de CDN externo adicionaria uma camada fora da AWS, desnecessária quando o Shield Standard já cobre o cenário descrito.",
        topic: "AWS Shield Standard",
        options: [
            [
                "O AWS Shield Advanced, que exige assinatura mensal para cobrir os ataques volumétricos comuns.",
                false,
            ],
            [
                "O AWS Shield Standard, ativo automaticamente e sem custo para os recursos públicos da conta.",
                true,
            ],
            [
                "Um provedor de CDN externo, contratado apenas para absorver picos de tráfego volumétrico.",
                false,
            ],
            [
                "O AWS WAF, configurado com regras gerenciadas voltadas a ataques na camada de aplicação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de e-commerce roda sua aplicação atrás de Amazon CloudFront e Application Load Balancer. Ela sofreu tentativas de SQL injection na camada de aplicação e, na mesma semana, um grande ataque volumétrico de DDoS que gerou pico de custo pelo escalonamento automático. A empresa quer bloquear os dois tipos de ataque, ter proteção de custo contra o escalonamento gerado por DDoS e acesso 24x7 a uma equipe especializada de resposta. Quais DUAS ações atendem isso? (Selecione DUAS opções.)",
        explanation:
            "O AWS WAF, com regras gerenciadas contra SQL injection e outros padrões da OWASP, bloqueia o tráfego malicioso na camada de aplicação antes que ele chegue à aplicação. O Shield Advanced adiciona mitigação avançada contra ataques volumétricos maiores, proteção de custo para o escalonamento gerado por DDoS e acesso 24x7 ao DDoS Response Team, cobrindo as duas lacunas do cenário. O Shield Standard já vem incluído de graça, mas não oferece proteção de custo nem acesso ao DRT. Uma Security Group não filtra padrões de ataque na camada de aplicação como SQL injection. O GuardDuty detecta e alerta sobre atividade suspeita, mas não bloqueia tráfego nem oferece proteção de custo contra DDoS.",
        topic: "AWS WAF e AWS Shield Advanced",
        options: [
            [
                "Habilitar o AWS WAF com regras gerenciadas contra SQL injection na frente da aplicação.",
                true,
            ],
            [
                "Confiar apenas no Shield Standard, que já cobre custo de escalonamento e suporte do DRT.",
                false,
            ],
            [
                "Ativar o Amazon GuardDuty para bloquear automaticamente o tráfego identificado como malicioso.",
                false,
            ],
            [
                "Contratar o AWS Shield Advanced, com proteção de custo e acesso ao DDoS Response Team.",
                true,
            ],
            [
                "Configurar uma Security Group mais restritiva na frente do Application Load Balancer.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer identificar automaticamente vulnerabilidades conhecidas (CVEs) em pacotes de software das instâncias EC2 e nas imagens de container do Amazon ECR, com avaliações contínuas e sem depender de scans manuais. Qual serviço atende esse objetivo?",
        explanation:
            "O Amazon Inspector avalia continuamente instâncias EC2 e imagens no Amazon ECR em busca de vulnerabilidades conhecidas (CVEs) e problemas de exposição de rede, gerando novas descobertas automaticamente quando há mudanças, sem scans manuais. O GuardDuty detecta comportamento malicioso e anômalo a partir de logs como CloudTrail e VPC Flow Logs, mas não faz varredura de vulnerabilidades em pacotes instalados. O Macie é voltado para descoberta e classificação de dados sensíveis armazenados no S3, sem relação com CVEs. O AWS Config avalia conformidade de configuração de recursos contra regras definidas, não vulnerabilidades de software.",
        topic: "Amazon Inspector",
        options: [
            [
                "Amazon GuardDuty, analisando CloudTrail, DNS e VPC Flow Logs em busca de comportamento anômalo.",
                false,
            ],
            [
                "AWS Config, avaliando a conformidade da configuração dos recursos contra regras definidas.",
                false,
            ],
            [
                "Amazon Inspector, avaliando continuamente vulnerabilidades em instâncias EC2 e imagens do ECR.",
                true,
            ],
            [
                "Amazon Macie, usando aprendizado de máquina para classificar dados sensíveis armazenados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer duas capacidades: detecção contínua de atividade anômala, como chamadas de API vindas de localizações incomuns ou uma instância EC2 se comunicando com um domínio de mineração de criptomoeda, e descoberta automática de dados sensíveis, como números de cartão e dados pessoais, espalhados em vários buckets do Amazon S3, sem escrever regras de detecção customizadas. Quais DUAS opções atendem isso? (Selecione DUAS opções.)",
        explanation:
            "O Amazon GuardDuty analisa continuamente fontes como CloudTrail, VPC Flow Logs e logs de DNS para identificar comportamento anômalo ou malicioso, como comunicação com domínios associados a mineração de criptomoeda, sem exigir regras customizadas. O Amazon Macie usa aprendizado de máquina e padrões predefinidos para descobrir e classificar automaticamente dados sensíveis, como números de cartão e dados pessoais, em buckets do S3. O Amazon Inspector avalia vulnerabilidades de software em EC2 e imagens do ECR, não comportamento anômalo nem dados sensíveis. O Trusted Advisor verifica boas práticas gerais de custo, desempenho e segurança, mas não classifica dados sensíveis nem detecta ameaças em tempo real. Uma regra do AWS Config avalia conformidade de configuração de recursos, sem relação com nenhuma das duas necessidades.",
        topic: "Amazon GuardDuty e Amazon Macie",
        options: [
            [
                "Habilitar o Amazon Inspector, para avaliar vulnerabilidades nas instâncias EC2 e imagens do ECR.",
                false,
            ],
            [
                "Habilitar o Amazon GuardDuty, para detecção contínua a partir de CloudTrail e VPC Flow Logs.",
                true,
            ],
            [
                "Habilitar o AWS Trusted Advisor, para revisar boas práticas de segurança e desempenho da conta.",
                false,
            ],
            [
                "Habilitar uma regra do AWS Config, para avaliar a conformidade da configuração dos recursos.",
                false,
            ],
            [
                "Habilitar o Amazon Macie, para descobrir e classificar dados sensíveis no Amazon S3.",
                true,
            ],
        ],
    },
    {
        statement:
            "Em uma VPC de três camadas, a subnet do banco de dados deve aceitar conexões na porta 3306 somente vindas da camada de aplicação. A Security Group do banco já libera a porta 3306 a partir da Security Group da aplicação, mas as conexões continuam recusadas. A equipe descobre que a Network ACL da subnet foi alterada recentemente e agora nega todo tráfego, exceto algumas regras explícitas. O que precisa ser corrigido, respeitando o funcionamento de cada camada de filtro?",
        explanation:
            "Diferente da Security Group, que é stateful e libera automaticamente o tráfego de retorno, a Network ACL é stateless: é preciso liberar explicitamente tanto a entrada na porta 3306 quanto a saída das portas efêmeras usadas na resposta. Corrigir só a Security Group não resolve, porque a NACL continua bloqueando o tráfego antes dele chegar à instância. Remover a Security Group do banco tira uma camada de defesa útil, e a NACL sozinha não substitui o controle por grupo de origem. Abrir a porta 3306 para 0.0.0.0/0 ignora o problema real, que está na NACL, e ainda enfraquece a segurança do banco.",
        topic: "Security Groups e Network ACLs",
        options: [
            [
                "Adicionar na NACL regras explícitas de entrada na 3306 e de saída para portas efêmeras.",
                true,
            ],
            [
                "Remover a Security Group do banco e controlar todo o acesso apenas pela NACL da subnet.",
                false,
            ],
            [
                "Abrir a porta 3306 para o intervalo 0.0.0.0/0 na Security Group do banco de dados.",
                false,
            ],
            [
                "Recriar a Security Group da aplicação, mantendo a NACL da subnet do banco como está.",
                false,
            ],
        ],
    },
    {
        statement:
            "Instâncias EC2 em subnets privadas, sem rota para a internet, precisam ler e gravar objetos no Amazon S3. A equipe quer que esse tráfego não saia para a internet pública e também quer evitar a tarifa de processamento de dados de um NAT Gateway só para esse acesso ao S3. Qual solução atende os dois requisitos?",
        explanation:
            "Um VPC Endpoint do tipo gateway para o Amazon S3 mantém o tráfego dentro da rede da AWS, sem passar pela internet pública, e não cobra tarifa de processamento de dados como um NAT Gateway, resolvendo custo e privacidade ao mesmo tempo. Um NAT Gateway daria acesso ao S3 via internet pública e continuaria cobrando por dados processados, o oposto do que se quer evitar. Um Internet Gateway exigiria IP público nas instâncias, expondo o tráfego à rede pública. O VPC Peering conecta duas VPCs entre si e não existe uma VPC separada hospedando o S3 para essa conexão fazer sentido.",
        topic: "VPC Endpoints",
        options: [
            [
                "Adicionar um NAT Gateway nas subnets privadas, liberando a saída do tráfego até o Amazon S3.",
                false,
            ],
            [
                "Anexar um Internet Gateway à VPC e atribuir IP público às instâncias que acessam o S3.",
                false,
            ],
            [
                "Criar uma conexão de VPC Peering entre a VPC privada e a VPC que hospeda o serviço do S3.",
                false,
            ],
            [
                "Criar um VPC Endpoint do tipo gateway para o S3 e associá-lo às tabelas de rota das subnets.",
                true,
            ],
        ],
    },
    {
        statement:
            "Hoje, uma equipe acessa instâncias EC2 em subnets privadas através de um bastion host com a porta 22 aberta para a internet, e uma auditoria apontou o risco dessa porta aberta e da distribuição de chaves SSH entre administradores. A equipe quer manter o acesso administrativo, mas sem nenhuma porta de entrada aberta e com controle de acesso centralizado via IAM. Qual solução atende?",
        explanation:
            "O Systems Manager Session Manager cria a sessão através do agente SSM instalado na instância, que se conecta de saída ao Systems Manager, dispensando qualquer porta de entrada aberta e usando políticas do IAM para autorizar quem inicia a sessão, além de registrar os comandos executados. Manter o bastion host, mesmo restringindo a porta 22 a um IP, ainda mantém uma porta de entrada exposta e a gestão de chaves SSH. O Client VPN dá acesso à rede privada, mas não elimina a necessidade de porta SSH aberta nas instâncias nem centraliza a autorização no IAM como pedido. Uma chave SSH compartilhada piora a rastreabilidade individual, além de não fechar porta nenhuma.",
        topic: "AWS Systems Manager Session Manager",
        options: [
            [
                "Manter o bastion host, restringindo a porta 22 a um único endereço IP confiável da equipe.",
                false,
            ],
            [
                "Usar o Session Manager, com o agente SSM iniciando a conexão de saída e acesso via IAM.",
                true,
            ],
            [
                "Distribuir uma única chave SSH compartilhada entre os administradores do bastion host.",
                false,
            ],
            [
                "Substituir o bastion host por uma conexão de AWS Client VPN até a subnet privada.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um bucket do Amazon S3 recém-criado foi exposto publicamente por engano, depois que alguém anexou uma bucket policy concedendo acesso a qualquer principal. A equipe de segurança quer garantir que nenhum bucket da conta possa se tornar público novamente, mesmo por engano, independente de bucket policies ou ACLs aplicadas no futuro. Qual configuração garante essa proteção no nível da conta?",
        explanation:
            "O Block Public Access do S3, habilitado no nível da conta, ignora bucket policies e ACLs que concedam acesso público, bloqueando a exposição mesmo que alguém configure isso por engano no futuro, atendendo exatamente ao pedido de proteção permanente. Remover apenas a bucket policy problemática corrige o incidente atual, mas não impede que outra policy pública seja criada depois. Um processo de revisão manual depende de disciplina humana e não bloqueia nada tecnicamente. Criptografar os objetos com SSE-KMS protege a confidencialidade dos dados, mas não impede que o bucket seja configurado como público.",
        topic: "Amazon S3 - Block Public Access",
        options: [
            [
                "Remover a bucket policy que concedeu o acesso público, mantendo o restante como está.",
                false,
            ],
            [
                "Habilitar a criptografia SSE-KMS em todos os objetos, reforçando a confidencialidade deles.",
                false,
            ],
            [
                "Habilitar o Block Public Access no nível da conta, bloqueando qualquer policy ou ACL pública.",
                true,
            ],
            [
                "Definir um processo de revisão manual para toda nova bucket policy antes de publicá-la.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento precisa de acesso de leitura e escrita somente ao bucket do Amazon S3 usado pela aplicação da equipe, sem nenhuma permissão sobre os demais buckets da conta. Qual solução atende a esse requisito seguindo o princípio do menor privilégio?",
        explanation:
            "Uma policy do IAM restrita ao ARN do bucket específico, anexada a um grupo, aplica o princípio do menor privilégio e facilita a manutenção conforme a equipe cresce. A policy gerenciada AmazonS3FullAccess libera todos os buckets da conta, muito além do necessário. Usar credenciais root ou um usuário administrador compartilhado elimina a rastreabilidade individual e contraria as boas práticas básicas de segurança do IAM.",
        topic: "IAM Policies",
        options: [
            [
                "Anexar a policy gerenciada AmazonS3FullAccess a cada usuário do IAM da equipe de desenvolvimento.",
                false,
            ],
            [
                "Distribuir as credenciais da conta root da AWS entre os membros da equipe para uso nesse bucket.",
                false,
            ],
            [
                "Criar uma policy do IAM restrita ao bucket e anexá-la ao grupo dos desenvolvedores da equipe.",
                true,
            ],
            [
                "Criar um único usuário do IAM compartilhado pela equipe com a policy AdministratorAccess anexada.",
                false,
            ],
        ],
    },
    {
        statement:
            "O time de operações de uma empresa cresceu de 5 para 50 engenheiros, todos precisando das mesmas permissões para gerenciar instâncias Amazon EC2 e alarmes do Amazon CloudWatch. Anexar policies individualmente a cada novo usuário do IAM está se tornando inviável. Qual abordagem reduz o esforço administrativo e escala melhor?",
        explanation:
            "Um grupo do IAM centraliza a gestão de permissões: a policy fica anexada ao grupo uma única vez e todo novo engenheiro só precisa ser adicionado como membro. Anexar as mesmas policies a cada usuário individualmente exige repetir o trabalho a cada contratação, exigir que uma role seja assumida manualmente adiciona fricção desnecessária ao dia a dia, e copiar o JSON de uma policy inline em cada usuário multiplica pontos de manutenção e risco de inconsistência.",
        topic: "IAM Groups",
        options: [
            [
                "Anexar o mesmo conjunto de policies gerenciadas diretamente a cada novo usuário do IAM criado.",
                false,
            ],
            [
                "Criar um grupo do IAM com as policies necessárias e adicionar os engenheiros como membros do grupo.",
                true,
            ],
            [
                "Criar uma role do IAM que cada engenheiro deve assumir manualmente a cada novo acesso ao console.",
                false,
            ],
            [
                "Copiar o JSON da policy existente para uma policy inline em cada usuário recém criado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação em execução em uma instância Amazon EC2 precisa gravar objetos em um bucket do Amazon S3. Uma revisão de segurança encontrou chaves de acesso da AWS fixas no arquivo de configuração da aplicação dentro da instância. Qual é a prática recomendada para eliminar esse risco e conceder acesso à API da AWS a partir do EC2?",
        explanation:
            "Uma role do IAM associada à instância por meio de um instance profile fornece credenciais temporárias, geradas e rotacionadas automaticamente pela AWS, eliminando a necessidade de chaves fixas dentro da instância. Guardar as chaves criptografadas no volume, rotacioná-las manualmente a cada 24 horas ou colocá-las no user data ainda mantêm credenciais de longa duração expostas na instância, o que a prática recomendada busca evitar.",
        topic: "IAM Roles - EC2 Instance Profile",
        options: [
            [
                "Guardar as chaves de acesso em um arquivo criptografado no volume EBS da própria instância.",
                false,
            ],
            [
                "Criar um usuário do IAM para a aplicação e rotacionar as chaves de acesso a cada 24 horas.",
                false,
            ],
            [
                "Passar as chaves de acesso como variáveis no user data usado na inicialização da instância.",
                false,
            ],
            [
                "Criar uma role do IAM com as permissões de S3 e associá-la à instância via instance profile.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa mantém duas contas AWS, Produção e Auditoria. Os analistas de segurança da conta Auditoria precisam consultar recursos e logs do AWS CloudTrail na conta Produção, sem que sejam criados usuários do IAM para eles na conta Produção. Qual solução atende a esse requisito?",
        explanation:
            "Uma role do IAM criada na conta Produção, com trust policy autorizando a conta Auditoria como principal e permissões de leitura, permite que os analistas obtenham credenciais temporárias via AssumeRole sem que existam identidades permanentes na conta acessada. Criar um usuário por analista aumenta a superfície de gerenciamento, compartilhar credenciais root é uma prática insegura e sem rastreabilidade, e a cobrança consolidada do AWS Organizations trata apenas de faturamento, não concede acesso a recursos.",
        topic: "IAM Roles - Cross-Account AssumeRole",
        options: [
            [
                "Criar uma role de leitura na conta Produção com trust policy que autoriza a conta Auditoria a assumi-la.",
                true,
            ],
            [
                "Criar um usuário do IAM na conta Produção para cada analista da equipe de Auditoria acessar os dados.",
                false,
            ],
            [
                "Compartilhar as credenciais da conta root de Produção com o líder da equipe de Auditoria para consultas.",
                false,
            ],
            [
                "Ativar a cobrança consolidada do AWS Organizations para que as permissões sejam herdadas automaticamente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função AWS Lambda precisa ler itens de uma tabela do Amazon DynamoDB e publicar mensagens em um tópico do Amazon SNS. Qual é a forma correta de conceder essas permissões à função?",
        explanation:
            "A execution role do IAM anexada à função Lambda concede, em tempo de execução, as permissões que o código usa para chamar o DynamoDB e o SNS, sem expor nenhuma chave de acesso. Toda função Lambda exige uma execution role para existir, então embutir chaves como variável de ambiente, usar o usuário root ou depender apenas de uma resource policy na tabela não substitui essa role nem segue a prática recomendada.",
        topic: "IAM Roles - AWS Lambda",
        options: [
            [
                "Definir as chaves de acesso de um usuário do IAM como variáveis de ambiente da função Lambda.",
                false,
            ],
            [
                "Anexar as policies gerenciadas de DynamoDB e SNS ao usuário root da conta AWS por padrão.",
                false,
            ],
            [
                "Criar uma execution role do IAM com as permissões de DynamoDB e SNS e associá-la à função.",
                true,
            ],
            [
                "Configurar uma resource policy na tabela do DynamoDB sem associar nenhuma role à função.",
                false,
            ],
        ],
    },
    {
        statement:
            "A empresa A precisa conceder à conta AWS da empresa B acesso de leitura a objetos específicos de um bucket do Amazon S3 pertencente à empresa A, sem criar nenhum usuário ou role do IAM na conta da empresa A para a empresa B. Qual solução atende a esse requisito?",
        explanation:
            "Uma bucket policy é uma resource-based policy aplicada diretamente ao bucket, capaz de conceder acesso a uma conta AWS externa sem exigir usuários ou roles nessa outra conta. Compartilhar as chaves de uma role expõe credenciais desnecessariamente, replicar os objetos para um bucket da empresa B cria uma cópia fora do controle da empresa A, e incluir o ID da empresa B em uma policy anexada aos próprios usuários da empresa A não concede nenhum acesso a quem está fora da conta.",
        topic: "Resource-Based Policies",
        options: [
            [
                "Criar uma role do IAM na conta da empresa A e compartilhar suas chaves de acesso com a empresa B.",
                false,
            ],
            [
                "Anexar ao bucket do S3 uma bucket policy que concede as permissões específicas à conta da empresa B.",
                true,
            ],
            [
                "Ativar a replicação entre regiões do S3 para sincronizar os objetos com um bucket da empresa B.",
                false,
            ],
            [
                "Incluir o ID da conta da empresa B em uma policy anexada aos usuários do IAM da empresa A.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma de engenharia quer delegar às equipes de aplicação a criação de suas próprias roles do IAM para os microsserviços, mas precisa garantir que nenhuma dessas roles ultrapasse um conjunto máximo de permissões definido centralmente, independente das policies que cada equipe anexar a elas. Qual recurso do IAM atende a esse requisito?",
        explanation:
            "Uma permissions boundary define o teto máximo de permissões que uma role criada por uma equipe pode ter, independente das policies de identidade anexadas depois, sendo o mecanismo do IAM indicado para delegar a criação de identidades com segurança. Uma Service Control Policy não se anexa a um usuário individual, o IAM Access Analyzer identifica riscos mas não revoga permissões automaticamente, e revisão manual de cada policy não é um controle preventivo que escale com o número de equipes.",
        topic: "IAM Permission Boundaries",
        options: [
            [
                "Aplicar uma Service Control Policy anexada apenas ao usuário do IAM de cada equipe de aplicação.",
                false,
            ],
            [
                "Utilizar o IAM Access Analyzer para revogar automaticamente permissões excessivas após a criação da role.",
                false,
            ],
            [
                "Exigir que cada equipe envie suas policies para revisão manual antes de toda nova implantação.",
                false,
            ],
            [
                "Definir uma permissions boundary nas roles criadas pelas equipes, limitando o teto máximo de permissões.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um usuário do IAM pertence a dois grupos. A policy do primeiro grupo concede acesso total ao Amazon EC2, enquanto a policy do segundo grupo nega explicitamente a ação ec2:TerminateInstances. Ao tentar encerrar uma instância EC2, qual será o resultado para esse usuário?",
        explanation:
            "Na avaliação de policies do IAM, uma negação explícita em qualquer policy aplicável sempre prevalece sobre qualquer permissão concedida por outra policy, mesmo quando o usuário tem acesso total por outro caminho. A ordem de criação dos grupos e qual policy foi anexada mais recentemente não influenciam esse resultado: o IAM avalia todas as policies aplicáveis em conjunto, não apenas a última.",
        topic: "IAM Policy Evaluation Logic",
        options: [
            [
                "A solicitação será negada, pois a negação explícita sempre prevalece sobre a permissão.",
                true,
            ],
            ["A solicitação será permitida.", false],
            [
                "A solicitação será permitida, pois o IAM avalia apenas a policy anexada ao grupo mais recente.",
                false,
            ],
            [
                "O resultado depende de qual dos dois grupos foi criado primeiro na conta da AWS, não das policies.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer impedir que qualquer conta de sua AWS Organizations, incluindo contas que venham a ser criadas no futuro, lance recursos fora de duas regiões aprovadas, independentemente das permissões do IAM concedidas aos usuários em cada conta. Qual solução atende a esse requisito?",
        explanation:
            "Uma Service Control Policy anexada à OU (ou à raiz) nega as ações fora das regiões aprovadas para todas as contas atuais e futuras dessa unidade, independente das policies do IAM em cada conta membro. Configurar condições de região conta a conta exige manutenção manual repetida, e regras do AWS Config ou alertas de orçamento apenas detectam ou notificam depois que o recurso já foi criado, sem impedir a ação no momento em que ela acontece.",
        topic: "AWS Organizations SCP - Restrição de Região",
        options: [
            [
                "Configurar policies do IAM com condição de região individualmente em cada conta membro da organização.",
                false,
            ],
            [
                "Habilitar regras do AWS Config em cada conta para sinalizar recursos criados fora das regiões aprovadas.",
                false,
            ],
            [
                "Criar uma Service Control Policy que nega ações fora das regiões aprovadas e anexá-la à OU correspondente.",
                true,
            ],
            [
                "Configurar um alerta de orçamento nas regiões não aprovadas para notificar os administradores da conta.",
                false,
            ],
        ],
    },
    {
        statement:
            "O administrador de uma conta membro anexa a um desenvolvedor uma policy do IAM que concede acesso total ao Amazon S3. Porém, a OU dessa conta possui uma Service Control Policy que nega todas as ações de S3. Ao tentar acessar o S3, o que acontece com o desenvolvedor e por quê?",
        explanation:
            "Service Control Policies definem o teto de permissões disponível em uma conta membro: elas nunca concedem acesso por si mesmas, apenas restringem, e nenhuma policy do IAM anexada dentro da conta consegue ultrapassar uma negação vinda da SCP. SCPs não afetam a conta de gerenciamento, mas sim as contas membro da organização, e não existe fluxo automático de exceção temporária para uma negação de SCP.",
        topic: "AWS Organizations SCP - Teto de Permissões",
        options: [
            [
                "O acesso é permitido, pois policies do IAM anexadas diretamente a um usuário têm prioridade sobre a SCP.",
                false,
            ],
            [
                "O acesso é negado, pois a SCP define o teto de permissões da conta e a policy do IAM não pode ultrapassá-lo.",
                true,
            ],
            [
                "O acesso é permitido, pois Service Control Policies se aplicam somente à conta de gerenciamento da organização.",
                false,
            ],
            [
                "O acesso é negado apenas de forma temporária, até um administrador aprovar manualmente uma exceção à SCP.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa com 30 contas AWS organizadas no AWS Organizations quer que os funcionários façam login uma única vez com as credenciais corporativas já existentes e depois acessem, por um único portal, todas as contas e aplicações para as quais estão autorizados, sem manter usuários do IAM separados em cada conta. Qual solução atende a esse requisito?",
        explanation:
            "O AWS IAM Identity Center centraliza a autenticação conectando-se ao diretório corporativo e usa permission sets para atribuir acesso a múltiplas contas da organização por um único portal de login. Criar um usuário do IAM em cada conta exige sincronização manual constante, o Amazon Cognito é voltado à autenticação de usuários de aplicações e não ao acesso administrativo entre contas, e compartilhar as credenciais de uma única role viola práticas básicas de segurança e rastreabilidade.",
        topic: "IAM Identity Center",
        options: [
            [
                "Configurar o AWS IAM Identity Center, conectado ao diretório corporativo, e atribuir permission sets por conta.",
                true,
            ],
            [
                "Criar um usuário do IAM em cada conta para cada funcionário, com sincronização manual pela equipe de operações.",
                false,
            ],
            [
                "Configurar user pools do Amazon Cognito em cada conta AWS para autenticar o login dos funcionários.",
                false,
            ],
            [
                "Compartilhar as credenciais de uma única role do IAM entre todos os funcionários da empresa.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma corporação mantém o Active Directory Federation Services (AD FS) na própria infraestrutura local e quer que os funcionários acessem o AWS Management Console usando as credenciais corporativas já existentes, sem criar usuários do IAM e sem adotar o AWS IAM Identity Center. Qual solução atende a esse requisito?",
        explanation:
            "Configurar um provedor de identidade SAML 2.0 no IAM, confiável pelo AD FS, permite que os usuários federados assumam uma role da AWS por meio do STS AssumeRoleWithSAML, usando as credenciais corporativas existentes. O IAM Identity Center é uma alternativa de federação, não a única suportada pela AWS, e sincronizar senhas ou armazená-las como senhas de usuários do IAM não caracteriza federação de identidade real.",
        topic: "SAML Federation with STS",
        options: [
            [
                "Criar usuários do IAM para os funcionários, com senhas sincronizadas todas as noites a partir do Active Directory.",
                false,
            ],
            [
                "Adotar apenas o AWS IAM Identity Center, única opção de federação de identidade suportada pela AWS.",
                false,
            ],
            [
                "Armazenar as credenciais do Active Directory como senhas de usuários do IAM por meio de um agente local.",
                false,
            ],
            [
                "Configurar um provedor de identidade SAML 2.0 no IAM, confiável pelo AD FS, e usar o STS AssumeRoleWithSAML.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um time está construindo um aplicativo mobile voltado ao público final e precisa oferecer cadastro, login e recuperação de senha, além de permitir login usando contas do Google e do Facebook. Qual serviço deve ser usado para implementar esse requisito?",
        explanation:
            "Os user pools do Amazon Cognito atuam como diretório de usuários da aplicação, cuidando de cadastro, login, recuperação de senha e integração com provedores de identidade social, como Google e Facebook. Criar um usuário do IAM por cliente final não foi projetado para esse volume nem para esse fim, o IAM Identity Center atende identidades da força de trabalho e não do público externo, e um diretório LDAP personalizado exigiria construir e manter toda a autenticação manualmente.",
        topic: "Amazon Cognito User Pools",
        options: [
            [
                "Um usuário do IAM criado para cada usuário final da aplicação, com chaves de acesso programático embutidas no app.",
                false,
            ],
            [
                "O AWS IAM Identity Center, configurado para atender usuários externos do público em geral pela internet.",
                false,
            ],
            [
                "Amazon Cognito user pools, para gerenciar o diretório de usuários da aplicação e a autenticação, com login social.",
                true,
            ],
            [
                "Um diretório LDAP personalizado, hospedado em uma instância EC2 dentro da VPC da aplicação móvel.",
                false,
            ],
        ],
    },
    {
        statement:
            "Depois que os usuários fazem login em um aplicativo mobile por meio de um user pool do Amazon Cognito, o app precisa permitir que cada usuário autenticado envie fotos diretamente do dispositivo para um prefixo específico de um bucket do Amazon S3, usando credenciais da AWS temporárias e de escopo limitado, sem embutir credenciais permanentes no aplicativo. Qual solução atende a esse requisito?",
        explanation:
            "Um identity pool do Amazon Cognito troca o token emitido pelo user pool por credenciais da AWS temporárias, associadas a uma role do IAM que pode ser restrita por usuário usando variáveis de política, evitando credenciais fixas dentro do aplicativo. Compartilhar uma chave de acesso, criar um usuário do IAM por cliente ou tornar o bucket público para escrita expõem credenciais ou dados de forma desnecessária e insegura.",
        topic: "Amazon Cognito Identity Pools",
        options: [
            [
                "Embutir no aplicativo mobile um único par de chaves de acesso do IAM compartilhado entre todos os usuários do app.",
                false,
            ],
            [
                "Usar um identity pool do Cognito para trocar o token do user pool por credenciais temporárias com escopo restrito.",
                true,
            ],
            [
                "Criar, para cada usuário cadastrado no aplicativo, um usuário do IAM com acesso programático individual próprio.",
                false,
            ],
            [
                "Conceder ao bucket do S3 uma bucket policy de escrita pública liberada para qualquer dispositivo autenticado no app.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está projetando um sistema para conceder aos workloads credenciais da AWS temporárias e com expiração automática, em vez de chaves de acesso de longa duração. Quais duas capacidades do AWS STS atendem a esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "AssumeRole e AssumeRoleWithWebIdentity são ações do AWS STS que retornam credenciais de segurança temporárias, com expiração automática configurável, adequadas para workloads e aplicações federadas. CreateAccessKey, AttachRolePolicy e GenerateCredentialReport são ações do IAM voltadas a chaves permanentes, à anexação de policies ou a relatórios de credenciais, sem relação com a emissão de credenciais temporárias.",
        topic: "AWS STS",
        options: [
            [
                "CreateAccessKey, que gera um novo par de chaves de acesso permanente para um usuário do IAM existente.",
                false,
            ],
            [
                "AssumeRole, que retorna credenciais de segurança temporárias com expiração configurável para a sessão.",
                true,
            ],
            [
                "AttachRolePolicy, que anexa de forma permanente uma policy gerenciada a uma role existente do IAM.",
                false,
            ],
            [
                "AssumeRoleWithWebIdentity, que fornece credenciais temporárias via autenticação web federada.",
                true,
            ],
            [
                "GenerateCredentialReport, que produz um relatório sobre o status de senhas e chaves de acesso da conta.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma auditoria de segurança encontrou chaves de acesso de longa duração do usuário root sendo usadas por um script automatizado, além de nenhuma autenticação multifator configurada para essa conta. Quais duas ações o arquiteto de soluções deve recomendar para seguir as boas práticas do IAM? (Selecione DUAS opções.)",
        explanation:
            "As boas práticas do IAM recomendam eliminar o uso de chaves de acesso do usuário root, substituindo-as por uma role ou usuário com privilégio mínimo dedicado ao script, e habilitar MFA no root para proteger a identidade mais privilegiada da conta. Continuar usando as chaves do root mesmo com rotação periódica, compartilhar a senha do root com outro administrador ou manter um grupo com AdministratorAccess como contingência contrariam essas práticas recomendadas.",
        topic: "IAM Security Best Practices",
        options: [
            [
                "Excluir as chaves de acesso do usuário root e usar uma role ou usuário com privilégio mínimo no script.",
                true,
            ],
            [
                "Rotacionar as chaves de acesso do usuário root a cada 90 dias e manter o script funcionando com elas.",
                false,
            ],
            [
                "Ativar a autenticação multifator no usuário root e guardar o dispositivo de MFA em local seguro.",
                true,
            ],
            [
                "Compartilhar a senha do usuário root com um segundo administrador para permitir supervisão conjunta.",
                false,
            ],
            [
                "Criar um grupo do IAM chamado backup-root e conceder a ele a policy AdministratorAccess como contingência.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está criando uma role do IAM na conta A, que será assumida por uma role do IAM na conta B para executar operações de backup. Quais dois componentes precisam estar corretamente configurados para que esse acesso entre contas funcione? (Selecione DUAS opções.)",
        explanation:
            "O acesso entre contas via AssumeRole exige uma trust policy na role da conta A que autorize a role da conta B como principal, e uma permissions policy na mesma role que defina as ações de backup permitidas depois da assunção. Resource policies em buckets S3, uma SCP na conta B ou uma conexão de rede via VPC peering não fazem parte do mecanismo de assumir roles entre contas nem substituem essas duas configurações.",
        topic: "IAM Roles - Cross-Account Trust Policy",
        options: [
            [
                "Uma resource policy em todos os buckets do S3 da conta A listando a conta B como proprietária.",
                false,
            ],
            [
                "Uma Service Control Policy na conta B autorizando explicitamente a ação sts:AssumeRole em direção à conta A.",
                false,
            ],
            [
                "Uma trust policy na role da conta A que define a role da conta B como principal confiável.",
                true,
            ],
            [
                "Uma conexão de VPC peering estabelecida entre as redes das duas contas, sem nenhuma configuração adicional.",
                false,
            ],
            [
                "Uma permissions policy na role da conta A que concede as ações de backup que a role da conta B poderá executar.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está avaliando as diferenças entre policies baseadas em identidade e policies baseadas em recurso no IAM. Quais duas afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Policies baseadas em recurso ficam anexadas ao próprio recurso e definem quais principals podem acessá-lo, enquanto policies baseadas em identidade ficam anexadas a usuários, grupos ou roles e definem quais ações a identidade pode executar. Vários tipos de recurso além de roles aceitam policies baseadas em recurso, uma policy de identidade sozinha não concede acesso a uma conta AWS diferente, e as duas policies são avaliadas em conjunto pelo IAM, não de forma excludente.",
        topic: "IAM Policy Types",
        options: [
            [
                "Policies baseadas em recurso são anexadas ao próprio recurso, como um bucket do S3, e definem quais principals podem acessá-lo.",
                true,
            ],
            [
                "Policies baseadas em recurso só podem ser criadas para roles do IAM, nunca para buckets, filas ou outros tipos de recurso.",
                false,
            ],
            [
                "Uma policy baseada em identidade concede sozinha acesso a principals de outra conta AWS, sem nenhuma configuração adicional.",
                false,
            ],
            [
                "Policies baseadas em identidade são anexadas a usuários, grupos ou roles e definem quais ações a identidade pode executar.",
                true,
            ],
            [
                "Uma policy baseada em recurso só é avaliada quando não existe nenhuma policy baseada em identidade para a mesma solicitação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma fintech usa o Amazon RDS for PostgreSQL como banco transacional principal. A equipe de arquitetura precisa que o banco faca failover automático para outra zona de disponibilidade em caso de falha na instância primária, com minima intervencao manual e sem alterar a lógica de conexão da aplicação. Qual é a MELHOR solucao para esse requisito?",
        explanation:
            "O Multi-AZ do Amazon RDS mantem uma réplica síncrona em outra zona de disponibilidade e realiza failover automático, via atualização do endpoint DNS, quando a instância primária fica indisponivel, sem exigir alteração na aplicação. Read Replicas são assincronas e exigem promocao manual para virar principal, o que não e failover automático. Snapshots manuais e migração para uma instância EC2 única não oferecem alta disponibilidade automatizada equivalente.",
        topic: "RDS Multi-AZ",
        options: [
            [
                "Ativar o Multi-AZ na instância do RDS, com uma réplica síncrona em standby em outra zona de disponibilidade.",
                true,
            ],
            [
                "Criar uma Read Replica em outra zona de disponibilidade e promove-la manualmente quando a primária falhar.",
                false,
            ],
            [
                "Configurar snapshots manuais horários e restaurar uma nova instância sempre que for necessário.",
                false,
            ],
            [
                "Migrar o banco de dados para uma única instância Amazon EC2 rodando PostgreSQL em outra zona.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de comercio eletronico mantem a camada web em instâncias Amazon EC2 em uma única zona de disponibilidade. A equipe quer que a aplicação continue disponível mesmo se toda a zona de disponibilidade atual ficar indisponivel durante picos de tráfego como a Black Friday, sem provisionamento manual de servidores. Qual arquitetura atende esse requisito?",
        explanation:
            "Distribuir instâncias em múltiplas zonas de disponibilidade com um Auto Scaling group e um Application Load Balancer garante que a perda de uma zona não derrube a aplicação, além de ajustar a capacidade automaticamente conforme a demanda. Aumentar o tamanho da instância ou adicionar servidores na mesma zona não protege contra falha de zona. O CloudFront acelera entrega de conteúdo, mas não substitui a distribuição multi-AZ da camada de computação. Um Auto Scaling group limitado a uma única zona continua exposto a indisponibilidade total dela.",
        topic: "Elastic Load Balancing e Auto Scaling",
        options: [
            [
                "Aumentar o tamanho da instância EC2 única e adicionar uma segunda instância na mesma zona de disponibilidade, como backup.",
                false,
            ],
            ["Colocar as instâncias EC2 atras do Amazon CloudFront.", false],
            [
                "Configurar um Auto Scaling group numa única zona de disponibilidade, apenas com um número máximo maior de instâncias.",
                false,
            ],
            ["Distribuir as instâncias EC2 em várias zonas de disponibilidade.", true],
        ],
    },
    {
        statement:
            "O Amazon RDS for MySQL de uma empresa de SaaS e um ponto único de falha e também sofre lentidao porque consultas pesadas de relatório competem com o tráfego transacional na instância primária. A equipe quer, ao mesmo tempo, ganhar proteção de failover automático e tirar a carga de leitura de relatórios da instância primária. Quais duas acoes atendem esses dois objetivos? (Selecione DUAS opções.)",
        explanation:
            "O Multi-AZ fornece uma réplica síncrona em outra zona de disponibilidade com failover automático, resolvendo o ponto único de falha. Read Replicas são copias assincronas que podem receber tráfego de leitura, tirando a carga de relatórios da instância primária. Aumentar armazenamento, estender a retenção de backup ou trocar a classe da instância podem ajudar em outros cenários, mas não resolvem failover automático nem descarregam consultas de leitura da instância primária.",
        topic: "RDS Multi-AZ e Read Replicas",
        options: [
            [
                "Ativar o Multi-AZ na instância primária, com uma réplica síncrona em standby para failover automático.",
                true,
            ],
            [
                "Criar uma ou mais Read Replicas e direcionar as consultas de relatório para elas.",
                true,
            ],
            [
                "Aumentar o espaco de armazenamento alocado a instância primária do banco de dados.",
                false,
            ],
            [
                "Ativar backups automatizados com retenção estendida de 35 dias na instância primária.",
                false,
            ],
            [
                "Alterar a classe da instância primária para a maior classe disponível no momento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de varejo online recebe pedidos processados de forma síncrona: a aplicação web chama diretamente um serviço de back-end para cada pedido. Durante liquidacoes relampago, o back-end fica sobrecarregado, as chamadas expiram e pedidos são perdidos. A equipe quer desacoplar o recebimento do processamento dos pedidos e absorver picos de tráfego sem perder pedidos. Qual solucao atende esse requisito com o menor esforço operacional?",
        explanation:
            "Uma fila do Amazon SQS absorve picos de pedidos e desacopla o recebimento do processamento: a aplicação web pública mensagens na fila e o back-end consome no próprio ritmo, sem perder pedidos durante picos. Aumentar o timeout ou repetir chamadas sincronas não resolve a sobrecarga do back-end, apenas adia o problema. Aumentar o tamanho das instâncias reduz o risco temporariamente, mas não desacopla os componentes nem escala diante de novos picos.",
        topic: "Amazon SQS",
        options: [
            [
                "Aumentar o tempo limite das chamadas sincronas da aplicação web para o serviço de back-end.",
                false,
            ],
            [
                "Fazer a aplicação web repetir a chamada ao serviço de back-end várias vezes até ter sucesso.",
                false,
            ],
            [
                "Colocar uma fila do Amazon SQS entre a aplicação web e o back-end, consumida no próprio ritmo.",
                true,
            ],
            [
                "Migrar o back-end para instâncias Amazon EC2 maiores, capazes de processar pedidos mais rápido.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de logistica processa mensagens de atualização de remessas com uma fila do Amazon SQS consumida por uma função AWS Lambda. Parte das mensagens tem dados malformados e faz a função falhar repetidamente, sendo reentregue sem parar e dificultando a identificacao de outros problemas na fila. Qual solucao trata esse cenário de forma automatizada?",
        explanation:
            "Uma dead-letter queue associada a fila principal, com um maxReceiveCount definido, move automaticamente mensagens que falham repetidamente para uma fila separada, isolando o problema sem bloquear o processamento das demais mensagens. Aumentar o visibility timeout só adia a reentrega, sem tratar a causa. Apagar mensagens manualmente não escala e pode causar perda de dados. Aumentar a memória da função não corrige mensagens malformadas.",
        topic: "SQS Dead-Letter Queue",
        options: [
            [
                "Aumentar o tempo de visibilidade (visibility timeout) da fila para um valor bem alto.",
                false,
            ],
            [
                "Definir uma rotina para apagar manualmente as mensagens com falha pelo console todos os dias.",
                false,
            ],
            [
                "Configurar uma dead-letter queue com maxReceiveCount, isolando mensagens com falhas repetidas.",
                true,
            ],
            [
                "Aumentar apenas a memória alocada para a função AWS Lambda que consome a fila.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma de streaming de video precisa que um único evento de upload dispare, em paralelo, três processos independentes (transcodificacao, geracao de thumbnail e notificacao ao usuário), cada um com sua própria fila, sem que o serviço de upload precise conhecer os consumidores. Qual arquitetura atende esse requisito?",
        explanation:
            "O padrão fan-out do Amazon SNS pública uma mensagem em um tópico e a entrega a todas as filas do Amazon SQS inscritas, permitindo que cada processo consuma sua própria copia do evento de forma independente e paralela. Uma única fila do SQS distribui cada mensagem para apenas um consumidor por vez, não para todos. Chamadas sincronas diretas acoplam o serviço de upload aos processos posteriores. Uma única função processando tudo em sequência elimina o paralelismo e cria um ponto único de falha.",
        topic: "Amazon SNS Fan-out",
        options: [
            [
                "Publicar o evento em uma única fila do Amazon SQS, consumida pelos três processos ao mesmo tempo.",
                false,
            ],
            [
                "Publicar o evento em um tópico do Amazon SNS com uma fila do SQS inscrita para cada processo.",
                true,
            ],
            [
                "Fazer o serviço de upload chamar diretamente, de forma síncrona, cada um dos três processos.",
                false,
            ],
            [
                "Processar transcodificacao, thumbnail e notificacao em sequência numa única função Lambda.",
                false,
            ],
        ],
    },
    {
        statement:
            "A API de recebimento de pedidos de uma plataforma de venda de ingressos chama, de forma síncrona, um serviço de confirmação de pagamento. Em picos de vendas esse serviço vira um gargalo, e algumas requisições malformadas falham repetidamente e travam o processamento das demais. A equipe quer desacoplar o recebimento do processamento para absorver picos e impedir que mensagens malformadas bloqueiem a fila indefinidamente. Quais duas acoes atendem esses objetivos? (Selecione DUAS opções.)",
        explanation:
            "Uma fila do Amazon SQS entre as camadas desacopla o recebimento do processamento, permitindo absorver picos sem sobrecarregar o serviço de pagamento. Uma dead-letter queue com maxReceiveCount isola mensagens malformadas apos um número definido de tentativas, evitando que travem o processamento das demais. Aumentar o tamanho da instância ou o timeout apenas adia o gargalo sem desacoplar os componentes. Escalar somente a API de recebimento não resolve o gargalo no serviço de pagamento.",
        topic: "Arquitetura Desacoplada com SQS",
        options: [
            [
                "Inserir uma fila do Amazon SQS entre a API de recebimento e o serviço de confirmação de pagamento.",
                true,
            ],
            [
                "Aumentar o tipo da instância EC2 do serviço de confirmação de pagamento para o maior disponível.",
                false,
            ],
            [
                "Configurar uma dead-letter queue com maxReceiveCount para isolar mensagens com falhas repetidas.",
                true,
            ],
            [
                "Configurar a API de recebimento para chamar o serviço de pagamento com um timeout síncrono maior.",
                false,
            ],
            [
                "Ativar Auto Scaling somente na camada da API de recebimento, mantendo fixo o serviço de pagamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de prontuarios medicos mantem a aplicação principal na região us-east-1 e um ambiente standby totalmente provisionado na região us-west-2. A equipe quer que o DNS direcione os usuários automaticamente para o standby somente quando a região principal ficar indisponivel, voltando sozinho para a principal assim que ela se recuperar. Qual configuração do Amazon Route 53 atende esse requisito?",
        explanation:
            "A política de failover do Route 53 usa health checks para monitorar o endpoint primário e direciona o tráfego automaticamente para o registro secundario quando o primário e considerado não saudavel, revertendo sozinha quando ele volta a responder. O roteamento por peso distribui tráfego proporcionalmente o tempo todo, sem reagir a falhas. O roteamento por latência otimiza velocidade, não disponibilidade, e não isola uma região doente. O roteamento por geolocalizacao direciona por localizacao do usuário, não pela saude do endpoint.",
        topic: "Route 53 Failover Routing",
        options: [
            [
                "Politica de roteamento por peso, dividindo o tráfego igualmente entre as duas regiões o tempo todo.",
                false,
            ],
            [
                "Politica de failover, com health check no endpoint primário e registro secundario para o standby.",
                true,
            ],
            [
                "Politica de roteamento por latência, direcionando cada usuário para a região de menor latência.",
                false,
            ],
            [
                "Politica de geolocalizacao, direcionando os usuários conforme sua localizacao geografica.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer que o health check do Amazon Route 53 considere um endpoint como não saudavel com base em um alarme do Amazon CloudWatch que reflete métricas internas da aplicação, como o tamanho de uma fila de backlog, e não apenas a resposta simples de rede. Assim, o failover reagiria também a degradacao de desempenho, não somente a indisponibilidade total. Qual configuração atende esse requisito?",
        explanation:
            "O Route 53 permite criar health checks baseados no estado de um alarme do CloudWatch, possibilitando que o failover reaja a métricas internas da aplicação, como tamanho de fila ou taxa de erro, além da simples disponibilidade de rede. Um health check HTTP padrão só avalia a resposta do endpoint, não métricas internas. Health checks do target group do Elastic Load Balancing controlam o roteamento interno do balanceador, mas não acionam failover de DNS sem integração explicita. O Route 53 não oferece health check via ICMP.",
        topic: "Route 53 Health Checks",
        options: [
            [
                "Criar um health check HTTP padrão apontando apenas para uma pagina estática de status.",
                false,
            ],
            [
                "Confiar somente nos health checks do target group do ELB, sem integra-los ao Route 53.",
                false,
            ],
            [
                "Criar um health check do Route 53 baseado no estado de um alarme do Amazon CloudWatch.",
                true,
            ],
            [
                "Criar um health check que envia pacotes ICMP diretamente para a instância Amazon EC2.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma agencia de marketing guarda os arquivos de campanhas no Amazon S3. Um script de um engenheiro sobrescreveu por engano vários arquivos importantes, e a equipe quer conseguir recuperar uma versão anterior de qualquer objeto dali em diante, sem depender de backups manuais separados. Qual configuração do S3 atende esse requisito?",
        explanation:
            "O versionamento do Amazon S3 mantem todas as versões anteriores de um objeto sempre que ele e sobrescrito ou excluido, permitindo restaurar qualquer versão anterior. O S3 Transfer Acceleration só melhora a velocidade de upload, sem relacao com histórico de versões. Uma política de bucket que bloqueia sobrescritas impediria atualizações legitimas dos arquivos, o que não e o objetivo. O S3 Intelligent-Tiering otimiza custo de armazenamento entre classes, sem guardar versões anteriores dos objetos.",
        topic: "Amazon S3 Versioning",
        options: [
            [
                "Ativar o versionamento no bucket do Amazon S3, mantendo recuperavel cada versão anterior dos objetos.",
                true,
            ],
            [
                "Ativar o S3 Transfer Acceleration no bucket, para acelerar o upload dos arquivos de campanha.",
                false,
            ],
            [
                "Configurar uma política de bucket que negue qualquer operação de sobrescrita de objetos existentes.",
                false,
            ],
            [
                "Ativar o S3 Intelligent-Tiering no bucket, para mover objetos entre classes de armazenamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Por exigencia regulatoria, uma empresa de serviços financeiros precisa manter uma copia sincronizada automaticamente de todos os objetos do seu bucket principal do Amazon S3 em um bucket localizado em outra Regiao da AWS, garantindo que os dados sobrevivam a um desastre regional. Qual configuração atende esse requisito?",
        explanation:
            "A Cross-Region Replication (CRR) do Amazon S3 copia objetos automaticamente e de forma continua para um bucket em outra Regiao da AWS, protegendo os dados contra um desastre que afete a região principal. A Same-Region Replication mantem a copia na mesma Regiao, o que não protege contra falha regional. Um job diário de DataSync introduz atraso e depende de agendamento manual, além de não ser desenhado para essa replicação continua entre regiões. O versionamento protege contra sobrescrita e exclusão, mas não cria copia em outra Regiao.",
        topic: "S3 Cross-Region Replication",
        options: [
            [
                "Ativar a Cross-Region Replication do bucket principal para um bucket em outra Regiao da AWS.",
                true,
            ],
            [
                "Ativar a Same-Region Replication do bucket principal para um segundo bucket na mesma Regiao.",
                false,
            ],
            [
                "Agendar um job diário do AWS DataSync para copiar os objetos para outro bucket na mesma Regiao.",
                false,
            ],
            [
                "Ativar apenas o versionamento no bucket principal do Amazon S3, sem outra configuração.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de engenharia guarda documentos criticos de projeto no Amazon S3 e quer se proteger tanto contra exclusão acidental por funcionários quanto contra a perda total da Regiao onde o bucket principal esta localizado. Quais duas configurações atendem, juntas, esses dois objetivos? (Selecione DUAS opções.)",
        explanation:
            "O versionamento protege contra exclusão ou sobrescrita acidental, mantendo versões anteriores recuperaveis. A Cross-Region Replication mantem uma copia continua dos objetos em outra Regiao da AWS, protegendo contra a perda total da região principal. O S3 Transfer Acceleration só acelera transferencias, o S3 Intelligent-Tiering apenas otimiza custo entre classes de armazenamento, e a Same-Region Replication mantem a copia na mesma Regiao, não protegendo contra um desastre regional.",
        topic: "Protecao de Dados no Amazon S3",
        options: [
            [
                "Ativar o versionamento no bucket, preservando versões de objetos excluidos ou sobrescritos.",
                true,
            ],
            [
                "Ativar o S3 Transfer Acceleration no bucket, para acelerar uploads vindos de escritorios distantes.",
                false,
            ],
            [
                "Ativar a Cross-Region Replication para um bucket localizado em outra Regiao da AWS.",
                true,
            ],
            [
                "Configurar o S3 Intelligent-Tiering no bucket, para mover objetos entre classes de armazenamento.",
                false,
            ],
            [
                "Ativar a Same-Region Replication para um segundo bucket localizado na mesma Regiao.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de recursos humanos quer uma estratégia de disaster recovery com custo controlado, porem mais rápida do que restaurar tudo do zero. A ideia e manter apenas os componentes centrais, como uma réplica do banco de dados, em execução minima na região de recuperação, e só provisionar o restante da pilha a partir de imagens e infraestrutura como código quando um desastre for declarado. Qual estratégia de disaster recovery e essa?",
        explanation:
            "Na estratégia de pilot light, apenas os componentes centrais e criticos, como a réplica do banco de dados, ficam sempre em execução na região de recuperação, enquanto o restante da pilha e provisionado a partir de AMIs ou infraestrutura como código somente quando o desastre e declarado. No multi-site ativo-ativo, ambas as regiões rodam em capacidade total o tempo todo, custando mais do que o necessário aqui. No backup and restore, nada fica pre-provisionado, o que tornaria a recuperação mais lenta. No warm standby, uma copia completa e reduzida do ambiente já fica em execução, indo além do descrito.",
        topic: "Disaster Recovery, Pilot Light",
        options: [
            [
                "Multi-site ativo-ativo, com capacidade total de produção rodando nas duas regiões o tempo todo.",
                false,
            ],
            [
                "Backup and restore, sem nenhum componente pre-provisionado na região de recuperação.",
                false,
            ],
            [
                "Pilot light, com os componentes centrais em execução minima e o restante sob demanda.",
                true,
            ],
            [
                "Warm standby, com uma copia completa e reduzida do ambiente de produção sempre ativa.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma global de negociacao financeira não pode tolerar mais que poucos segundos de indisponibilidade ou perda de dados, mesmo numa interrupcao total de uma região inteira da AWS, e o custo e secundario diante da continuidade do negócio. E necessário ter capacidade total de produção rodando simultaneamente em duas ou mais regiões, com o tráfego distribuido entre elas. Qual estratégia de disaster recovery atende esse requisito?",
        explanation:
            "A estratégia multi-site ativo-ativo mantem capacidade total de produção rodando simultaneamente em duas ou mais regiões, com o tráfego distribuido entre elas, resultando no menor RTO e RPO possiveis, proximos de zero. Pilot light e warm standby exigem algum tempo de escalonamento apos o desastre, elevando o RTO acima do tolerado neste cenário. Backup and restore tem o maior RTO e RPO entre as estratégias, incompativel com a exigencia de poucos segundos de indisponibilidade.",
        topic: "Disaster Recovery, Multi-Site Ativo-Ativo",
        options: [
            [
                "Pilot light, com os componentes centrais em execução minima numa segunda região.",
                false,
            ],
            [
                "Warm standby, com uma copia reduzida do ambiente pronta para escalar numa segunda região.",
                false,
            ],
            [
                "Multi-site ativo-ativo, com capacidade total de produção em múltiplas regiões simultaneamente.",
                true,
            ],
            [
                "Backup and restore, restaurando o ambiente de produção numa segunda região a partir de backups.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de arquitetura esta definindo a estratégia de disaster recovery de um sistema critico e precisa revisar os conceitos de RTO (Recovery Time Objective) e RPO (Recovery Point Objective) antes de escolher a abordagem. Quais duas afirmacoes sobre RTO e RPO estao corretas? (Selecione DUAS opções.)",
        explanation:
            "O RPO mede a quantidade maxima aceitavel de perda de dados, medida em tempo, e orienta a frequência de backup ou replicação. Estrategias com RTO mais baixo, como o multi-site ativo-ativo, exigem mais infraestrutura sempre ativa e por isso custam mais do que estratégias como pilot light ou backup and restore. O tempo máximo para restaurar o sistema e definido pelo RTO, não pelo RPO. O warm standby reduz o tempo de escalonamento, mas não elimina totalmente o RTO. Backup and restore tem o maior RTO entre as estratégias, o oposto do adequado para RTO de poucos segundos.",
        topic: "Disaster Recovery, RTO e RPO",
        options: [
            [
                "O RPO define quanto tempo de dados a organização aceita perder num desastre, guiando a frequência de backup.",
                true,
            ],
            [
                "O RPO define o tempo máximo aceitavel para restaurar o sistema apos um desastre.",
                false,
            ],
            [
                "O warm standby sempre atinge RTO igual a zero, sem nenhum tempo de escalonamento.",
                false,
            ],
            [
                "Quanto menor o RTO exigido, geralmente maior o custo da solucao de disaster recovery.",
                true,
            ],
            [
                "Backup and restore e a estratégia recomendada quando o RTO exigido e de poucos segundos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa com recursos em vários serviços (Amazon EBS, Amazon RDS, Amazon DynamoDB, Amazon EFS) e múltiplas contas da AWS quer uma forma centralizada de definir políticas de backup, com agendamento, retenção e copia entre regiões, aplicadas de forma consistente a todos esses recursos, em vez de configurar backup separadamente em cada serviço. Qual solucao atende esse requisito?",
        explanation:
            "O AWS Backup centraliza a criação e o gerenciamento de políticas de backup, incluindo agendamento, retenção e copia entre regiões, aplicadas de forma consistente a recursos de múltiplos serviços e contas a partir de um único lugar. Configurar backups separadamente em cada serviço aumenta o esforço operacional e a chance de inconsistencia entre políticas. Funcoes Lambda personalizadas exigem manutenção continua e reinventam uma funcionalidade já gerenciada. A Cross-Region Replication do S3 protege apenas objetos em buckets, sem cobrir os demais recursos citados.",
        topic: "AWS Backup",
        options: [
            [
                "Usar o AWS Backup para criar um plano de backup centralizado, aplicado aos recursos e contas.",
                true,
            ],
            [
                "Configurar os backups automatizados nativos separadamente no console de cada um dos serviços.",
                false,
            ],
            [
                "Escrever funções AWS Lambda personalizadas para tirar snapshots de cada serviço por cron.",
                false,
            ],
            [
                "Depender apenas da Cross-Region Replication do Amazon S3 para proteger todos os recursos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa tira snapshots automáticos diários de uma instância do Amazon RDS e de volumes do Amazon EBS, mas todos ficam armazenados na mesma Regiao dos recursos de produção. Um desastre regional destruiria tanto os dados de produção quanto seus snapshots. A equipe precisa que os snapshots também existam em outra região, com o mínimo de esforço operacional continuo. Qual solucao atende esse requisito?",
        explanation:
            "Configurar a copia automática dos snapshots do Amazon RDS e do Amazon EBS para uma segunda Regiao garante que uma copia dos dados sobreviva mesmo se a região de produção inteira for perdida, com pouco esforço operacional continuo apos a configuração inicial. Aumentar a retenção no mesmo lugar não protege contra perda regional. O Multi-AZ melhora a disponibilidade dentro da região, mas não move copias para outra região. Converter snapshots em AMIs armazenadas na mesma região mantem o mesmo risco de perda regional.",
        topic: "Snapshots Cross-Region",
        options: [
            [
                "Aumentar o período de retenção dos snapshots, mantendo-os armazenados na mesma Regiao.",
                false,
            ],
            [
                "Configurar a copia automática dos snapshots do RDS e do EBS para uma segunda Regiao.",
                true,
            ],
            [
                "Ativar apenas o Multi-AZ nos recursos, sem alterar onde os snapshots são armazenados.",
                false,
            ],
            [
                "Converter os snapshots em AMIs, mantendo-as armazenadas na mesma Regiao de origem.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um serviço de processamento de pagamentos as vezes recebe requisições duplicadas para a mesma transação, porque o cliente tenta novamente apos um timeout de rede, mesmo quando a requisição original já tinha sido processada com sucesso no servidor. Isso faz com que alguns clientes sejam cobrados duas vezes. Qual solucao evita esse problema mantendo a capacidade de repetir requisições com segurança?",
        explanation:
            "Uma chave de idempotência única por transação permite que o serviço identifique e ignore com segurança requisições duplicadas com a mesma chave, mesmo quando o cliente tenta novamente apos um timeout, evitando cobrança duplicada sem abrir mão de retries. Aumentar o timeout ou o intervalo entre tentativas apenas reduz a frequência do problema, sem elimina-lo. Remover os retries do cliente prejudica a resiliencia da aplicação diante de falhas transitorias legitimas.",
        topic: "Idempotencia",
        options: [
            [
                "Aumentar o timeout do cliente, para que as tentativas de repeticao aconteçam com menos frequência.",
                false,
            ],
            [
                "Orientar o cliente a esperar mais tempo antes de tentar novamente a requisição manualmente.",
                false,
            ],
            [
                "Exigir uma chave de idempotência única por transação, ignorando requisições com a mesma chave.",
                true,
            ],
            [
                "Remover completamente a lógica de repeticao (retry) do lado do cliente de pagamento.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de processamento de pedidos usa o Amazon SQS com várias instâncias consumidoras. Processar cada mensagem leva cerca de 5 minutos, mas o visibility timeout da fila esta configurado para 30 segundos. A equipe percebe que a mesma mensagem esta sendo processada por mais de um consumidor ao mesmo tempo, causando pedidos duplicados. Qual ajuste resolve esse problema?",
        explanation:
            "O visibility timeout determina por quanto tempo uma mensagem fica oculta para outros consumidores apos ser recebida; se ele for menor que o tempo real de processamento, a mensagem volta a ficar visivel e pode ser processada por outro consumidor antes que o primeiro termine, causando duplicidade. Ajustar o visibility timeout para um valor maior que o tempo tipico de processamento evita essa sobreposicao. Aumentar o número de consumidores agrava o problema, e reduzir para uma única instância elimina a escalabilidade. O long polling reduz chamadas vazias a fila, mas não corrige a visibilidade descrita.",
        topic: "SQS Visibility Timeout",
        options: [
            [
                "Aumentar o visibility timeout da fila para um valor maior que o tempo tipico de processamento.",
                true,
            ],
            [
                "Aumentar ainda mais o número de instâncias consumidoras conectadas a fila, para acelerar o processamento.",
                false,
            ],
            [
                "Reduzir para apenas uma instância consumidora conectada a fila, eliminando o processamento paralelo.",
                false,
            ],
            [
                "Ativar somente o long polling na fila do SQS, sem alterar o valor atual do visibility timeout.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação que chama uma API de um serviço downstream da AWS as vezes recebe erros de throttling durante picos de tráfego. Tentativas imediatas e sem controle pioram o problema, porque muitos clientes tentam novamente no mesmo instante. A equipe quer uma estratégia de retry que reduza a carga sobre o serviço com throttling e evite que as tentativas fiquem sincronizadas entre clientes. Quais duas práticas atendem esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "O backoff exponencial aumenta progressivamente o intervalo entre tentativas, reduzindo a carga sobre o serviço com throttling a cada nova falha. Adicionar jitter aleatorio a esse intervalo evita que múltiplos clientes fiquem sincronizados e tentem novamente ao mesmo tempo, o que poderia gerar novos picos de throttling. Retries imediatos em loop e intervalos fixos identicos entre clientes tendem a gerar exatamente esse efeito de sincronizacao. Desativar as tentativas reduz a resiliencia da aplicação diante de falhas transitorias legitimas.",
        topic: "Retry com Backoff Exponencial",
        options: [
            [
                "Implementar backoff exponencial, aumentando o tempo de espera entre tentativas sucessivas.",
                true,
            ],
            [
                "Repetir a requisição imediatamente, em um loop apertado, até que ela tenha sucesso.",
                false,
            ],
            [
                "Adicionar jitter aleatorio ao tempo de espera, evitando tentativas sincronizadas entre clientes.",
                true,
            ],
            [
                "Configurar todos os clientes para tentar de novo num intervalo fixo identico, a cada 1 segundo.",
                false,
            ],
            [
                "Desativar completamente as tentativas de repeticao, falhando no primeiro erro de throttling.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa roda uma aplicação transacional de alto tráfego no Amazon Aurora e precisa, ao mesmo tempo, de failover automático rápido caso a instância de escrita falhe, e da capacidade de escalar a leitura com até 15 réplicas de baixa latência compartilhando o mesmo armazenamento subjacente. Qual configuração atende os dois requisitos?",
        explanation:
            "Um cluster Multi-AZ do Amazon Aurora permite até 15 Aurora Replicas compartilhando o mesmo armazenamento distribuido do cluster, que atendem tanto como alvo de failover automático rápido quanto para escalar o tráfego de leitura. O RDS for MySQL com Multi-AZ tradicional mantem apenas uma instância standby não acessível para leitura, sem o mesmo modelo de réplicas do Aurora. Uma única instância sem réplicas depende de restauracao manual, com tempo de recuperação muito maior. Sem réplicas, backups automatizados diários não oferecem failover rápido nem escala de leitura.",
        topic: "Amazon Aurora Multi-AZ",
        options: [
            ["Amazon RDS for MySQL com Multi-AZ tradicional, sem o uso de Aurora Replicas.", false],
            [
                "Um cluster Multi-AZ do Amazon Aurora, usando Aurora Replicas para failover e leitura.",
                true,
            ],
            [
                "Uma única instância do Amazon Aurora, com restauracao manual de snapshot em caso de falha.",
                false,
            ],
            ["Amazon Aurora sem nenhuma réplica, apenas com backups automatizados diários.", false],
        ],
    },
    {
        statement:
            "Uma empresa global de SaaS roda o Amazon Aurora como banco de dados principal e precisa de disaster recovery entre Regioes da AWS, com atraso de replicação tipicamente abaixo de 1 segundo e a capacidade de promover a região secundaria para leitura e escrita completas em minutos, em caso de desastre regional. Qual solucao atende esse requisito?",
        explanation:
            "O Aurora Global Database réplica dados entre Regioes da AWS com atraso tipicamente abaixo de um segundo e permite promover a região secundaria para leitura e escrita completas em menos de um minuto durante um desastre regional. Uma Read Replica entre regiões de uma instância RDS padrão tende a ter maior atraso de replicação e um processo de promocao mais lento. Exportacoes periodicas via S3 são operações em lote, com atraso muito maior que o exigido. O Multi-AZ do Aurora protege contra falha de zona dentro de uma única Regiao, mas não contra a perda da região inteira.",
        topic: "Aurora Global Database",
        options: [
            [
                "Uma Read Replica entre regiões de uma instância padrão do RDS, promovida manualmente.",
                false,
            ],
            [
                "Replicacao entre regiões, via Amazon S3, de exportacoes periodicas do banco de dados.",
                false,
            ],
            ["Um cluster Multi-AZ do Amazon Aurora dentro de uma única Regiao da AWS.", false],
            [
                "Um Aurora Global Database, com uma região secundaria pronta para ser promovida.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de mídia mantém uma frota de instâncias Amazon EC2 dedicada a transcodificar arquivos de vídeo continuamente. O perfil de uso mostra que o processo consome praticamente todo o poder de processamento disponível, enquanto o uso de memória e de rede permanece baixo durante toda a operação. A empresa quer maximizar o throughput de transcodificação por dólar investido em computação. Qual família de instância Amazon EC2 atende melhor a esse requisito?",
        explanation:
            "As instâncias da família C (como C7g e C7i) usam processadores otimizados para cargas de trabalho com uso intensivo de CPU, como transcodificação de vídeo, processamento em lote e modelagem científica, entregando a melhor relação de custo por vCPU para esse perfil. A família M oferece um equilíbrio entre CPU, memória e rede, sem otimização específica para processamento. A família R é voltada para aplicações com alto consumo de memória, como bancos de dados in-memory, o que não é o gargalo descrito. A família I é otimizada para armazenamento local em NVMe com alto IOPS, irrelevante para uma carga limitada por CPU.",
        topic: "EC2 Instance Families (Compute Optimized)",
        options: [
            ["Instâncias de propósito geral (família M)", false],
            ["Instâncias otimizadas para computação (família C)", true],
            ["Instâncias otimizadas para armazenamento (família I)", false],
            ["Instâncias otimizadas para memória (família R)", false],
        ],
    },
    {
        statement:
            "Uma instituição financeira executa uma aplicação de análise de risco em tempo real que carrega um conjunto de dados de vários terabytes inteiramente na memória para realizar cálculos. A aplicação exige uma alta proporção de RAM por vCPU, e o uso de CPU permanece moderado enquanto o consumo de memória fica constantemente próximo do limite. Qual família de instância Amazon EC2 a empresa deve escolher para executar essa aplicação?",
        explanation:
            "As instâncias da família R (como R7g e X2iedn) oferecem uma proporção elevada de memória por vCPU e são recomendadas pela AWS para bancos de dados in-memory e processamento de big data em tempo real, exatamente o perfil descrito. A família C prioriza poder de processamento, não memória. A família D é otimizada para armazenamento denso em disco local, não para capacidade de RAM. A família T é de desempenho variável (burstable), pensada para cargas leves com picos ocasionais de CPU e créditos limitados, sem otimização de memória.",
        topic: "EC2 Instance Families (Memory Optimized)",
        options: [
            ["Instâncias otimizadas para computação (família C)", false],
            ["Instâncias otimizadas para armazenamento (família D)", false],
            ["Instâncias otimizadas para memória (família R)", true],
            ["Instâncias de desempenho variável (família T)", false],
        ],
    },
    {
        statement:
            "Uma startup recebe imagens enviadas ao Amazon S3 em horários imprevisíveis ao longo do dia, com longos períodos ociosos intercalados por picos repentinos de milhares de uploads em poucos minutos. Cada imagem precisa passar por uma operação rápida de redimensionamento. A empresa quer que a camada de computação escale instantaneamente a cada pico e não gere custo algum quando não há uploads. Qual solução de computação atende a esse requisito com o menor esforço operacional?",
        explanation:
            "O AWS Lambda escala automaticamente e de forma quase instantânea em resposta a eventos, como notificações de evento do Amazon S3, executando uma função para cada upload sem que nenhum servidor precise ser provisionado, e cobra apenas pelo tempo de execução consumido, chegando a custo zero em períodos ociosos. Um grupo de Auto Scaling com capacidade mínima de uma instância ainda mantém pelo menos uma instância EC2 em execução continuamente, gerando custo mesmo sem uploads. Instâncias atrás de um Elastic Load Balancing pressupõem servidores sempre ativos, com o mesmo problema de custo ocioso. Instâncias Spot em uma única Zona de Disponibilidade podem ser interrompidas pela AWS a qualquer momento e ainda exigem gerenciamento de servidor.",
        topic: "AWS Lambda",
        options: [
            ["Funções AWS Lambda acionadas por notificações de evento do Amazon S3", true],
            ["Grupo do Amazon EC2 Auto Scaling com capacidade mínima de uma instância", false],
            ["Instâncias Amazon EC2 atrás de um Elastic Load Balancing", false],
            ["Instâncias Amazon EC2 Spot em uma única Zona de Disponibilidade", false],
        ],
    },
    {
        statement:
            "Uma empresa está migrando uma aplicação em contêineres para a AWS. A equipe de engenharia não quer provisionar, aplicar patches ou dimensionar nenhuma instância Amazon EC2 subjacente, e quer que a AWS gerencie automaticamente a infraestrutura de computação de cada contêiner. Qual opção de computação a empresa deve escolher para executar os contêineres?",
        explanation:
            "O AWS Fargate é um mecanismo de computação serverless para contêineres, compatível com Amazon ECS e Amazon EKS, no qual a AWS provisiona, corrige e escala automaticamente a infraestrutura subjacente, bastando informar a quantidade de vCPU e memória de cada tarefa. O tipo de execução EC2 do ECS exige que a própria equipe gerencie o patching, o dimensionamento e a capacidade das instâncias do cluster. O AWS Batch com instâncias sob demanda orquestra jobs em lote sobre instâncias EC2 que ainda precisam ser dimensionadas e mantidas. O Amazon EKS com nós autogerenciados também deixa a manutenção dos servidores de trabalho sob responsabilidade do cliente, mesmo com o plano de controle gerenciado pela AWS.",
        topic: "AWS Fargate",
        options: [
            ["Amazon EC2, um tipo de execução do Amazon ECS", false],
            ["AWS Fargate, um tipo de execução do Amazon ECS", true],
            ["AWS Batch, com filas de jobs em instâncias sob demanda", false],
            ["Amazon EKS, com os nós de trabalho autogerenciados em EC2", false],
        ],
    },
    {
        statement:
            "Uma aplicação de simulação climática fortemente acoplada (HPC) é executada em dezenas de instâncias Amazon EC2 que trocam mensagens constantemente entre si usando MPI. O arquiteto de soluções precisa da menor latência possível e do maior throughput de rede entre os nós, todos dentro de uma única Região. Quais DUAS ações atendem a esse requisito? (Selecione DUAS opções.)",
        explanation:
            "O cluster placement group agrupa as instâncias fisicamente próximas dentro de uma única Zona de Disponibilidade, proporcionando a menor latência de rede e o maior throughput entre os nós, o padrão recomendado para cargas de trabalho HPC fortemente acopladas. Tipos de instância com enhanced networking, usando adaptadores como o ENA ou o EFA, oferecem maior largura de banda, menor latência e menor jitter, e o EFA em especial permite comunicação com bypass do sistema operacional para aplicações MPI. O partition placement group isola partições em racks distintos para conter falhas em cargas distribuídas, como Hadoop ou Cassandra, sem reduzir a latência entre nós. Distribuir instâncias entre várias Zonas de Disponibilidade aumenta a latência em vez de reduzi-la. O spread placement group distribui instâncias em hardware distinto para reduzir falhas correlacionadas, não para otimizar latência.",
        topic: "Placement Groups e Enhanced Networking",
        options: [
            [
                "Executar as instâncias em um partition placement group para reduzir a latência",
                false,
            ],
            [
                "Executar as instâncias em um cluster placement group na mesma Zona de Disponibilidade",
                true,
            ],
            [
                "Distribuir as instâncias entre várias Zonas de Disponibilidade para reduzir a latência",
                false,
            ],
            ["Escolher tipos de instância com suporte a enhanced networking (ENA ou EFA)", true],
            ["Executar as instâncias em um spread placement group para reduzir a latência", false],
        ],
    },
    {
        statement:
            "Uma aplicação web de varejo é executada atrás de um Application Load Balancer com um grupo do Amazon EC2 Auto Scaling. O tráfego varia de forma imprevisível ao longo do dia, e a empresa quer que o grupo adicione ou remova instâncias automaticamente para manter a utilização média de CPU da frota próxima de 50%, sem que a equipe precise definir manualmente limites ou ajustes em etapas. Qual tipo de política de Auto Scaling atende a esse requisito?",
        explanation:
            "A política de target tracking funciona como um termostato: basta definir a métrica alvo, como 50% de utilização média de CPU, e o Auto Scaling calcula e ajusta automaticamente o número de instâncias para manter esse valor, sem exigir a definição manual de limites ou ajustes em etapas. O step scaling exige que a equipe configure manualmente diferentes ajustes de capacidade de acordo com o tamanho da violação do alarme do CloudWatch. O simple scaling aplica um único ajuste fixo por vez e entra em um período de espera antes de avaliar novamente, reagindo de forma mais lenta a variações contínuas. O escalonamento agendado altera a capacidade em datas e horários predefinidos, útil para picos previsíveis, mas não reage dinamicamente a variações imprevisíveis de CPU.",
        topic: "Auto Scaling (Target Tracking)",
        options: [
            ["Política de step scaling (escalonamento em etapas)", false],
            ["Política de simple scaling (escalonamento simples)", false],
            ["Escalonamento agendado (scheduled scaling)", false],
            ["Política de target tracking (acompanhamento de meta)", true],
        ],
    },
    {
        statement:
            "Uma rede de varejo online sabe, com base em dados históricos, que o tráfego no grupo do Amazon EC2 Auto Scaling aumenta bruscamente todos os dias às 9h e que uma campanha de marketing com data e hora já definidas vai começar no próximo mês. A empresa quer que a frota aumente de capacidade antes desses picos conhecidos ocorrerem, em vez de reagir depois que a carga já subiu. Quais DUAS ações o arquiteto de soluções deve implementar? (Selecione DUAS opções.)",
        explanation:
            "O scheduled scaling permite agendar alterações de capacidade para uma data e hora específicas, ideal para eventos únicos e conhecidos, como o início da campanha de marketing. O predictive scaling usa aprendizado de máquina sobre o histórico de métricas para prever padrões recorrentes, como o pico diário às 9h, e antecipa o provisionamento de capacidade antes do aumento de carga. A política de target tracking e a política de step scaling são reativas: ambas só ajustam a capacidade depois que uma métrica ou alarme já indica aumento de carga, não antes. Definir a capacidade mínima permanentemente no valor de pico da campanha mantém instâncias ociosas e caras durante todo o restante do mês, o que não é uma estratégia de escalonamento eficiente.",
        topic: "Auto Scaling (Scheduled e Predictive Scaling)",
        options: [
            ["Configurar uma política de target tracking para reagir ao aumento de CPU", false],
            ["Criar uma ação de scheduled scaling para a data e a hora da campanha", true],
            [
                "Definir a capacidade mínima do grupo permanentemente igual ao pico da campanha",
                false,
            ],
            ["Configurar uma política de step scaling baseada em alarmes do CloudWatch", false],
            ["Habilitar o predictive scaling para prever o pico diário das 9h", true],
        ],
    },
    {
        statement:
            "Uma aplicação web executa repetidamente o mesmo cálculo custoso no banco de dados para muitos usuários. A equipe de engenharia quer adicionar um cache simples em memória na frente do banco de dados para armazenar os resultados calculados como pares de chave e valor. O cache não precisa persistir dados entre reinicializações, não precisa de replicação nem de failover Multi-AZ, e deve aproveitar múltiplos núcleos de CPU em cada nó de cache. Qual mecanismo de cache atende a esse requisito com a arquitetura mais simples?",
        explanation:
            "O Amazon ElastiCache for Memcached foi projetado como um cache simples de chave e valor, com arquitetura multithread que aproveita múltiplos núcleos de CPU por nó e particionamento horizontal entre nós, sem suporte a persistência ou replicação, exatamente o conjunto de características descrito no cenário. O Amazon ElastiCache for Redis oferece recursos adicionais, como persistência em disco e replicação com failover automático, que o cenário explicitamente dispensa, tornando a arquitetura mais complexa do que o necessário. O DynamoDB Accelerator (DAX) é um cache que funciona exclusivamente à frente de tabelas do DynamoDB, não de um banco de dados genérico. O Amazon RDS com Multi-AZ é uma configuração de alta disponibilidade para o próprio banco relacional, não um mecanismo de cache em memória.",
        topic: "Amazon ElastiCache for Memcached",
        options: [
            ["Amazon ElastiCache for Memcached", true],
            ["Amazon ElastiCache for Redis", false],
            ["Amazon DynamoDB Accelerator (DAX)", false],
            ["Amazon RDS com Multi-AZ", false],
        ],
    },
    {
        statement:
            "Um estúdio de jogos para dispositivos móveis construiu um ranking em tempo real que classifica milhões de jogadores e precisa de um armazenamento em memória. O cache deve falhar automaticamente para uma réplica caso o nó primário falhe, e precisa de um tipo de dado que mantenha o ranking ordenado de forma eficiente. Quais DUAS ações o arquiteto de soluções deve tomar? (Selecione DUAS opções.)",
        explanation:
            "O Amazon ElastiCache for Redis oferece grupos de réplicas com Multi-AZ e failover automático para o nó primário, garantindo alta disponibilidade do ranking. O Redis também suporta o tipo de dado sorted set, estruturado exatamente para manter coleções ordenadas por pontuação de forma eficiente, ideal para leaderboards. O Memcached não oferece replicação nem failover automático entre nós, então configurá-lo com Multi-AZ e failover não é uma opção existente no produto. A arquitetura multithread do Memcached melhora o paralelismo de acesso, mas o Memcached só armazena pares simples de chave e valor, sem estruturas de dados ordenadas. O DynamoDB Accelerator (DAX) é um cache exclusivo para tabelas do DynamoDB e não pode ser colocado à frente de um cluster do ElastiCache.",
        topic: "Amazon ElastiCache for Redis",
        options: [
            ["Usar o Amazon ElastiCache for Redis com Multi-AZ e failover automático", true],
            ["Usar o Amazon ElastiCache for Memcached com Multi-AZ e failover automático", false],
            ["Usar o tipo de dado sorted set do Redis para armazenar o ranking", true],
            ["Usar a arquitetura multithread do Memcached para ordenar o ranking", false],
            ["Habilitar o DynamoDB Accelerator (DAX) na frente do cluster de cache", false],
        ],
    },
    {
        statement:
            "Uma editora de mídia hospeda um site estático no Amazon S3 com imagens, vídeos e páginas HTML. Usuários na América do Sul, na Europa e na Ásia relatam tempos de carregamento lentos, enquanto usuários próximos à região do bucket S3 relatam bom desempenho. Qual serviço a empresa deve usar para reduzir a latência de entrega do conteúdo estático para todos os usuários ao redor do mundo?",
        explanation:
            "O Amazon CloudFront é uma rede de entrega de conteúdo (CDN) que armazena em cache arquivos estáticos, como imagens, vídeos e páginas HTML, em centenas de locais de borda ao redor do mundo, servindo o conteúdo a partir do ponto mais próximo de cada usuário e reduzindo drasticamente a latência. O AWS Direct Connect estabelece uma conexão de rede privada entre um data center on-premises e a AWS, sem relação com a distribuição de conteúdo para usuários públicos espalhados pelo mundo. O Amazon Route 53 resolve nomes de domínio e pode rotear para o endpoint mais próximo, mas não acelera nem armazena o conteúdo em si. O AWS Global Accelerator melhora o roteamento de tráfego pela rede global da AWS, mas não armazena conteúdo em cache, sendo mais indicado para tráfego TCP/UDP não armazenável em cache.",
        topic: "Amazon CloudFront (conteúdo estático)",
        options: [
            ["AWS Direct Connect", false],
            ["Amazon Route 53", false],
            ["Amazon CloudFront", true],
            ["AWS Global Accelerator", false],
        ],
    },
    {
        statement:
            "Uma empresa de comércio eletrônico já usa o Amazon CloudFront para armazenar em cache as imagens estáticas de seus produtos. Agora ela também quer acelerar a entrega de respostas de API dinâmicas e personalizadas, como o conteúdo do carrinho de compras, que precisam sempre chegar até a origem e não podem ser armazenadas em cache. Qual abordagem melhora o desempenho dessas requisições dinâmicas sem armazená-las em cache?",
        explanation:
            "Configurar uma cache policy com TTL mínimo, máximo e padrão iguais a zero faz o CloudFront encaminhar cada requisição até a origem, mas a requisição ainda se beneficia da rede de bordas da AWS, das conexões persistentes entre a borda e a origem, e das otimizações de TCP e TLS ao longo do caminho, reduzindo a latência mesmo sem cache. Migrar a API para hospedagem estática no S3 não é viável, pois o conteúdo é dinâmico e personalizado por usuário. Remover o CloudFront do caminho da API elimina justamente os ganhos de rede de borda que aceleram a conexão até a origem. O Amazon ElastiCache é um cache em memória para dados de aplicação ou de banco de dados; ele não se posiciona à frente do CloudFront nem acelera o transporte das requisições entre o cliente e a origem.",
        topic: "Amazon CloudFront (conteúdo dinâmico)",
        options: [
            ["Migrar a API para hospedagem estática no Amazon S3", false],
            ["Remover o CloudFront do caminho da API e usar somente a origem", false],
            ["Usar o CloudFront com uma cache policy de TTL zero para a API", true],
            ["Colocar o Amazon ElastiCache na frente do CloudFront", false],
        ],
    },
    {
        statement:
            "Um estúdio de jogos para dispositivos móveis armazena perfis de jogadores no Amazon DynamoDB. Em horários de pico, milhões de requisições de leitura são direcionadas a um pequeno conjunto de perfis acessados com frequência, e o estúdio precisa de tempos de resposta de leitura na casa dos microssegundos sem reescrever a lógica de acesso a dados da aplicação. Qual solução atende a esse requisito?",
        explanation:
            "O Amazon DynamoDB Accelerator (DAX) é um cache em memória criado especificamente para o DynamoDB, compatível com a mesma API, que reduz os tempos de resposta de leitura de milissegundos de um dígito para microssegundos em cargas de leitura intensiva, sem exigir alterações na lógica da aplicação além de trocar o cliente do DynamoDB pelo cliente do DAX. O ElastiCache for Redis é um cache em memória genérico, mas exigiria implementar manualmente toda a lógica de leitura e invalidação de cache na aplicação, algo que o DAX já resolve de forma nativa. O Amazon RDS com Read Replicas é uma solução de escalonamento de leitura para bancos relacionais, não se aplica a tabelas do DynamoDB. O ElastiCache for Memcached tem a mesma limitação do Redis nesse cenário, além de não oferecer integração nativa como cache write-through do DynamoDB.",
        topic: "Amazon DynamoDB Accelerator (DAX)",
        options: [
            ["Amazon ElastiCache for Redis", false],
            ["Amazon DynamoDB Accelerator (DAX)", true],
            ["Amazon RDS com Read Replicas", false],
            ["Amazon ElastiCache for Memcached", false],
        ],
    },
    {
        statement:
            "Uma empresa de jogos multijogador executa servidores de jogo baseados em UDP em duas Regiões da AWS. Jogadores ao redor do mundo precisam da menor latência de conexão possível, roteamento automático para a região saudável mais próxima, e um conjunto fixo de endereços IP que não mude nem mesmo durante um failover entre regiões. Qual serviço atende melhor a esses requisitos?",
        explanation:
            "O AWS Global Accelerator fornece endereços IP estáticos anycast que roteiam o tráfego, incluindo TCP e UDP, pela rede global de backbone da AWS até o endpoint saudável mais próximo, com verificações de saúde que promovem failover rápido entre regiões sem exigir troca de IP no cliente, o que é ideal para servidores de jogos baseados em UDP. O Amazon CloudFront funciona apenas com HTTP e HTTPS e foi projetado para armazenar conteúdo em cache, não para acelerar tráfego UDP de jogos. O Elastic Load Balancing distribui tráfego dentro de uma única região e não fornece roteamento otimizado global nem IPs estáticos entre regiões. O Amazon Route 53 pode rotear com base em latência ou fazer failover de DNS, mas depende da propagação e do cache de TTL nos resolvedores dos clientes, tornando o failover mais lento e sem oferecer IPs fixos por si só.",
        topic: "AWS Global Accelerator",
        options: [
            ["Amazon CloudFront", false],
            ["Elastic Load Balancing", false],
            ["AWS Global Accelerator", true],
            ["Amazon Route 53", false],
        ],
    },
    {
        statement:
            "Uma empresa expõe uma API pública em HTTPS que devolve dados de catálogo raramente alterados e seguros para ficar em cache por vários minutos. Aplicações clientes ao redor do mundo reclamam de tempos de resposta lentos. A empresa quer reduzir a latência servindo respostas em cache a partir de locais próximos de cada cliente, encaminhando à origem apenas as requisições que não estiverem em cache. Qual serviço é mais adequado para esse cenário?",
        explanation:
            "O Amazon CloudFront é a escolha correta porque o conteúdo é HTTP/HTTPS e pode ser armazenado em cache: ele guarda as respostas nos locais de borda mais próximos de cada cliente e só encaminha para a origem as requisições que resultam em cache miss, reduzindo a latência global de forma nativa. O AWS Global Accelerator não armazena conteúdo em cache, apenas otimiza o roteamento até a origem pela rede da AWS, então toda requisição ainda chegaria à origem mesmo quando a resposta pudesse ser reaproveitada. O Amazon API Gateway oferece um cache regional único, o que ajuda apenas os clientes próximos daquela região, sem a distribuição global de locais de borda do CloudFront. O Amazon S3 Transfer Acceleration acelera uploads e downloads para um bucket S3, mas não é voltado para servir respostas de API nem para fazer cache de conteúdo dinâmico.",
        topic: "CloudFront vs Global Accelerator",
        options: [
            ["AWS Global Accelerator", false],
            ["Amazon API Gateway", false],
            ["Amazon S3 Transfer Acceleration", false],
            ["Amazon CloudFront", true],
        ],
    },
    {
        statement:
            "Uma fintech roda seu banco de dados transacional de pagamentos em uma instância Amazon EC2 com armazenamento em Amazon EBS. A equipe de arquitetura precisa de um volume com latência consistente abaixo de 1 milissegundo, picos de até 200.000 IOPS e a maior durabilidade possível, sem trocar o motor do banco. Qual tipo de volume EBS atende a esse requisito?",
        explanation:
            "O io2 Block Express é a família de EBS feita para bancos transacionais críticos: entrega até 256.000 IOPS por volume com latência submilissegundo consistente e durabilidade de 99,999%, acima dos 99,8% a 99,9% do gp3. O gp3 escala IOPS e throughput sem depender do tamanho do volume, mas o teto de 16.000 IOPS e a ausência de garantia de latência submilissegundo o deixam abaixo do requisito. st1 e sc1 são volumes HDD pensados para throughput sequencial e dados frios, não para IOPS aleatório de baixa latência.",
        topic: "EBS io2 Block Express",
        options: [
            ["Volume io2 Block Express, com IOPS submilissegundo e durabilidade de 99,999%.", true],
            [
                "Volume gp3, com até 16.000 IOPS provisionados de forma independente do tamanho.",
                false,
            ],
            [
                "Volume st1, otimizado para throughput em leituras e gravações sequenciais grandes.",
                false,
            ],
            [
                "Volume sc1, voltado a dados frios acessados com pouca frequência e baixo custo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe mantém volumes Amazon EBS gp2 de 200 GB presos a uma aplicação que passou a exigir mais IOPS e throughput do que o volume atual entrega. O espaço de 200 GB continua suficiente e o orçamento não permite migrar para um volume provisionado mais caro. Qual mudança aumenta o desempenho sem alterar o tamanho do volume?",
        explanation:
            "O gp3 desacopla IOPS e throughput do tamanho do volume: o baseline de 3.000 IOPS e 125 MB/s pode subir até 16.000 IOPS e 1.000 MB/s pagando só pelo desempenho extra, sem redimensionar nada. No gp2 o IOPS é proporcional ao tamanho (3 IOPS/GB), então só cresce se o volume crescer. O io2 também desacopla IOPS do tamanho, mas custa mais e é voltado a cargas com IOPS muito altos ou necessidade de submilissegundo, o que não é o caso aqui. st1 é HDD e não atende bem a IOPS aleatório nem pode ser volume de boot.",
        topic: "EBS gp3",
        options: [
            ["Migrar o volume para gp3 e configurar IOPS e throughput à parte do tamanho.", true],
            ["Migrar o volume para io2 e provisionar IOPS acima do limite máximo do gp2.", false],
            ["Aumentar o tamanho do volume gp2 para elevar os IOPS de forma proporcional.", false],
            ["Migrar o volume para st1 e ajustar o throughput conforme a demanda atual.", false],
        ],
    },
    {
        statement:
            "Um time de dados processa arquivos de log em lote todos os dias: leituras e gravações sequenciais grandes, throughput sustentado alto e pouca sensibilidade a IOPS aleatório. O volume precisa ser barato por GB e não será usado como volume de boot. Qual tipo de volume EBS é o mais adequado?",
        explanation:
            "O st1 é um HDD otimizado para throughput, com custo baixo por GB e bom desempenho em leituras e gravações sequenciais grandes, como processamento de log e big data, mas não pode ser volume de boot. O sc1 também é HDD barato, porém pensado para dados acessados com pouca frequência, com throughput menor que o st1. gp3 e io2 são SSD voltados a IOPS aleatório e latência baixa, mais caros para uma carga puramente sequencial como essa.",
        topic: "EBS st1",
        options: [
            [
                "Volume st1 (HDD otimizado para throughput), voltado a cargas sequenciais grandes.",
                true,
            ],
            [
                "Volume gp3 (SSD de propósito geral), voltado a cargas mistas e volumes de boot.",
                false,
            ],
            [
                "Volume io2 (SSD de IOPS provisionado), voltado a bancos transacionais críticos.",
                false,
            ],
            [
                "Volume sc1 (HDD de acesso raro), voltado a dados frios acessados poucas vezes.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um laboratório de pesquisa roda simulações de HPC fortemente acopladas em um cluster de instâncias Amazon EC2. A carga precisa de um sistema de arquivos compartilhado com throughput de centenas de GB/s, latência submilissegundo e integração direta com um data lake em Amazon S3 para carregar os conjuntos de treinamento. Qual serviço de armazenamento atende a esse cenário?",
        explanation:
            "O FSx for Lustre foi feito para cargas de HPC, machine learning e processamento de mídia que exigem throughput de centenas de GB/s e latência submilissegundo, além de poder linkar direto com um bucket S3 como repositório de dados. O EFS é compartilhado e elástico, mas seu throughput e latência não chegam ao patamar de um cluster de HPC fortemente acoplado. S3 com Transfer Acceleration acelera upload e download entre pontos distantes, não entrega um sistema de arquivos POSIX de alta performance. EBS Multi-Attach compartilha um volume entre poucas instâncias na mesma AZ, sem o throughput agregado necessário aqui.",
        topic: "Amazon FSx for Lustre",
        options: [
            [
                "Amazon FSx for Lustre, sistema de arquivos de alta performance integrado ao S3.",
                true,
            ],
            [
                "Amazon EFS, sistema de arquivos elástico compartilhado entre várias zonas de disponibilidade.",
                false,
            ],
            [
                "Amazon S3 com Transfer Acceleration, para acelerar o acesso aos dados de treinamento.",
                false,
            ],
            [
                "Amazon EBS Multi-Attach, para compartilhar um volume entre instâncias do cluster.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de mídia mantém dezenas de instâncias Amazon EC2 em várias zonas de disponibilidade que precisam ler e escrever nos mesmos arquivos de um sistema de gerenciamento de conteúdo, com acesso POSIX simultâneo e escalabilidade automática de capacidade. Qual solução de armazenamento atende a esse requisito com o menor esforço operacional?",
        explanation:
            "O EFS é um sistema de arquivos NFS totalmente gerenciado, compatível com POSIX, que pode ser montado ao mesmo tempo por milhares de instâncias em várias zonas de disponibilidade e escala capacidade automaticamente. O FSx for Lustre é voltado a cargas de HPC de altíssimo throughput, não a compartilhamento geral de arquivos de aplicação. O EBS Multi-Attach limita o compartilhamento a um número pequeno de instâncias na mesma AZ e exige um sistema de arquivos com bloqueio, ciente de cluster. O S3 é um object store e não oferece semântica POSIX de arquivos para um sistema de conteúdo tradicional.",
        topic: "Amazon EFS",
        options: [
            ["Amazon EFS, sistema de arquivos NFS elástico com acesso simultâneo entre AZs.", true],
            [
                "Amazon FSx for Lustre, sistema de arquivos de alta performance para cargas de HPC.",
                false,
            ],
            ["Amazon EBS com Multi-Attach, volume de bloco compartilhado entre instâncias.", false],
            ["Amazon S3 com um ponto de acesso multirregional para os arquivos do sistema.", false],
        ],
    },
    {
        statement:
            "Uma rede de institutos de pesquisa espalhados pelo mundo envia arquivos grandes de genômica para um único bucket do Amazon S3 na região us-east-1. Pesquisadores em regiões distantes relatam uploads lentos e instáveis para esses arquivos. Quais DUAS ações reduzem o tempo de upload e aumentam a confiabilidade da transferência? (Selecione DUAS opções.)",
        explanation:
            "O S3 Transfer Acceleration usa a rede de edge locations do CloudFront para acelerar o caminho até o bucket, o que ajuda quando quem envia está geograficamente distante da região do bucket. Combinado com upload multipart, que envia partes do arquivo em paralelo e reenvia só a parte que falhar, o tempo de upload cai e a transferência fica mais resiliente a instabilidade de rede. O FSx for Lustre é um sistema de arquivos para HPC, não um destino de upload direto para pesquisadores externos. Reduzir conexões simultâneas pioraria o throughput. O Glacier é uma classe de armazenamento de baixo custo para dados frios, sem relação com velocidade de upload.",
        topic: "S3 Transfer Acceleration",
        options: [
            ["Habilitar o Amazon S3 Transfer Acceleration no bucket de destino.", true],
            ["Dividir os arquivos grandes em partes com o upload multipart do S3.", true],
            ["Migrar o bucket de destino para o Amazon FSx for Lustre antes do envio.", false],
            ["Reduzir o número de conexões simultâneas para evitar throttling no bucket.", false],
            ["Trocar a classe de armazenamento do bucket de destino para o S3 Glacier.", false],
        ],
    },
    {
        statement:
            "Uma plataforma de e-commerce com usuários na América do Norte, Europa e Ásia roda seu catálogo de produtos em Amazon Aurora. A arquitetura precisa que leituras do catálogo tenham baixa latência local em cada continente e que, em caso de interrupção completa da região primária, uma região secundária assuma as escritas rapidamente. Qual solução atende a esses dois requisitos?",
        explanation:
            "O Aurora Global Database estende um cluster por várias regiões AWS, com replicação tipicamente abaixo de 1 segundo e capacidade de promover a região secundária rapidamente em caso de interrupção regional. Aurora Replicas ficam dentro do mesmo cluster e da mesma região: adicionar mais réplicas não aproxima os dados de usuários em outros continentes. O Multi-AZ mantém um standby síncrono na mesma região só para failover local, sem ajudar a latência de leitura em outros continentes. Uma RDS Read Replica cross-region existe para engines RDS tradicionais, mas não entrega a topologia de baixa latência e recuperação rápida que o Aurora Global Database oferece nativamente.",
        topic: "Aurora Global Database",
        options: [
            [
                "Amazon Aurora Global Database, que réplica entre regiões e promove a secundária rapidamente.",
                true,
            ],
            [
                "Mais Aurora Replicas no cluster atual, para atender aos acessos vindos de outros continentes.",
                false,
            ],
            [
                "Amazon Aurora com Multi-AZ, mantendo uma instância standby síncrona na mesma região.",
                false,
            ],
            [
                "Amazon RDS Read Replica entre regiões, configurada com replicação assíncrona manual.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema de relatórios financeiros roda consultas analíticas pesadas contra o mesmo banco Amazon RDS for PostgreSQL que atende a aplicação transacional principal. As consultas de relatório estão degradando o desempenho das transações de produção. Qual solução reduz esse impacto com o menor esforço de implementação?",
        explanation:
            "A RDS Read Replica réplica de forma assíncrona a partir da instância principal e pode receber as consultas de relatório, tirando essa carga da instância de produção com esforço baixo: só criar a réplica e redirecionar a conexão. O standby do Multi-AZ existe para failover automático e não aceita conexões de leitura. Aumentar a classe da instância principal ataca o sintoma, não a causa, e ainda concentra as duas cargas na mesma instância. Migrar para Redshift resolveria o problema analítico, mas exige pipeline de ETL e modelagem de um data warehouse, um esforço bem maior do que o pedido.",
        topic: "Amazon RDS Read Replica",
        options: [
            ["Criar uma RDS Read Replica e apontar as consultas de relatório para ela.", true],
            [
                "Ativar o Multi-AZ na instância principal e direcionar leituras para o standby.",
                false,
            ],
            [
                "Aumentar a classe da instância principal para suportar as duas cargas juntas.",
                false,
            ],
            ["Migrar o banco para um cluster Amazon Redshift dedicado aos relatórios.", false],
        ],
    },
    {
        statement:
            "Uma tabela do Amazon DynamoDB recebe tráfego de leitura extremamente imprevisível, com picos que aparecem sem aviso prévio, e a aplicação precisa de latência de leitura na casa dos microssegundos para os itens mais acessados. Quais DUAS ações atendem a esses requisitos sem exigir planejamento prévio de capacidade? (Selecione DUAS opções.)",
        explanation:
            "O modo On-Demand cobra por requisição e escala instantaneamente para picos imprevisíveis, sem planejamento de capacidade. O DAX é um cache gerenciado em memória para o DynamoDB que reduz a latência de leitura de milissegundos para microssegundos nos itens mais acessados, sem mudar a lógica da aplicação. O modo Provisionado com Auto Scaling ainda depende de metas de utilização e reage com atraso a picos súbitos, além de não reduzir a latência para microssegundos. O DynamoDB não tem o conceito de read réplicas como o RDS ou o Aurora. O ElastiCache pode servir como cache na frente de vários bancos, mas não é a peça padrão integrada ao DynamoDB para esse caso, papel que é do DAX.",
        topic: "DynamoDB On-Demand e DAX",
        options: [
            ["Configurar a tabela para o modo de capacidade On-Demand.", true],
            ["Colocar o Amazon DynamoDB Accelerator (DAX) na frente da tabela.", true],
            ["Configurar o modo de capacidade Provisionado com Auto Scaling.", false],
            ["Criar read réplicas para a tabela distribuir as leituras.", false],
            ["Habilitar o Amazon ElastiCache for Redis na frente da tabela.", false],
        ],
    },
    {
        statement:
            "Uma equipe de BI precisa consolidar terabytes de dados vindos de vários sistemas transacionais para rodar consultas analíticas complexas, com joins pesados entre muitas tabelas, para dashboards executivos. O volume de dados cresce continuamente e as consultas no banco transacional atual estão lentas demais. Qual serviço é o mais adequado para esse data warehouse analítico?",
        explanation:
            "O Redshift é um data warehouse colunar com processamento massivamente paralelo, feito para consultas analíticas complexas com joins pesados sobre grandes volumes de dados consolidados, o cenário clássico de BI. O RDS é otimizado para OLTP, não para esse tipo de consulta analítica em escala. O Athena é ótimo para consultas ad hoc direto sobre arquivos no S3, mas não substitui um data warehouse estruturado para dashboards recorrentes com joins pesados. O EMR processa big data com frameworks como Spark e Hadoop, mais voltado a ETL e processamento em lote do que a servir consultas analíticas interativas.",
        topic: "Amazon Redshift",
        options: [
            [
                "Amazon Redshift, data warehouse colunar para consultas analíticas em grande escala.",
                true,
            ],
            [
                "Amazon RDS for PostgreSQL, banco relacional otimizado para cargas transacionais.",
                false,
            ],
            [
                "Amazon Athena, serviço de consulta ad hoc direto sobre arquivos no Amazon S3.",
                false,
            ],
            ["Amazon EMR, plataforma de processamento distribuído para jobs de big data.", false],
        ],
    },
    {
        statement:
            "Uma aplicação de IoT envia leituras de sensores para um Amazon Kinesis Data Stream. O volume de escrita cresceu e a aplicação passou a receber erros de ProvisionedThroughputExceededException, com um pequeno grupo de shards recebendo a maior parte do tráfego enquanto os demais ficam ociosos. Quais DUAS ações resolvem o gargalo de throughput do stream? (Selecione DUAS opções.)",
        explanation:
            "O erro indica hot shard: poucos shards concentram o tráfego porque a partition key usada tem baixa cardinalidade, mandando registros repetidamente para os mesmos shards. Aumentar o número de shards (resharding) eleva a capacidade total do stream, e usar uma partition key com cardinalidade maior distribui os registros de forma mais uniforme, resolvendo o gargalo real. Reduzir a retenção não muda a capacidade de escrita. Uma fila SQS padrão não preserva a ordenação por dispositivo do jeito que o Kinesis preserva por shard, e trocar de serviço não resolve o desenho da partition key. Transfer Acceleration acelera upload para o S3, sem relação com o throughput de escrita no stream.",
        topic: "Amazon Kinesis Data Streams",
        options: [
            ["Aumentar o número de shards do stream (resharding).", true],
            ["Distribuir os registros com uma partition key de maior cardinalidade.", true],
            ["Reduzir o período de retenção dos dados armazenados no stream.", false],
            ["Migrar o stream para uma fila padrão do Amazon SQS.", false],
            ["Ativar o S3 Transfer Acceleration no bucket de destino dos dados.", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa carregar continuamente dados de clickstream em um bucket do Amazon S3 e no Amazon Redshift para análise quase em tempo real, sem escrever nem operar uma aplicação consumidora dos dados. Uma transformação leve com AWS Lambda deve ser aplicada nos registros antes da entrega. Qual serviço atende a esse requisito com o menor esforço operacional?",
        explanation:
            "O Kinesis Data Firehose é totalmente gerenciado: recebe os registros, aplica uma transformação opcional via Lambda e entrega automaticamente no S3, Redshift, OpenSearch ou Splunk, sem exigir uma aplicação consumidora nem gerenciamento de shards. O Data Streams exigiria escrever e operar uma aplicação consumidora própria para ler e gravar os dados nos destinos. O SQS não foi feito para streaming contínuo de clickstream em alto volume nem tem entrega nativa para S3 e Redshift. O MSK oferece Kafka gerenciado, mas ainda exige configurar produtores, consumidores e conectores, um esforço operacional maior.",
        topic: "Amazon Kinesis Data Firehose",
        options: [
            [
                "Amazon Kinesis Data Firehose, com entrega gerenciada e transformação via Lambda.",
                true,
            ],
            ["Amazon Kinesis Data Streams, com uma aplicação consumidora lendo os shards.", false],
            [
                "Amazon SQS, com um worker consumindo mensagens e gravando no S3 e no Redshift.",
                false,
            ],
            ["Amazon MSK, com um cluster Kafka gerenciado para os tópicos de clickstream.", false],
        ],
    },
    {
        statement:
            "Um serviço de processamento de pedidos recebe picos súbitos de tráfego em datas promocionais. Hoje o serviço web que recebe os pedidos chama diretamente o serviço que processa o pagamento, e nos picos o processador de pagamento fica sobrecarregado e derruba pedidos. A arquitetura precisa absorver os picos e permitir que os dois serviços escalem de forma independente. Qual mudança resolve o problema?",
        explanation:
            "Uma fila SQS entre os dois serviços funciona como buffer: absorve os picos de pedidos e permite que o serviço web e o processador de pagamento escalem de forma independente, sem perder pedidos durante o pico. Aumentar a instância do processador só empurra o limite mais para frente e mantém o acoplamento direto entre os dois serviços. Um Application Load Balancer distribui tráfego entre instâncias de um mesmo serviço, mas não amortece picos entre dois serviços diferentes chamados de forma síncrona. Trocar para gRPC muda o protocolo de chamada, mas mantém a comunicação síncrona e o acoplamento que causa a sobrecarga.",
        topic: "Amazon SQS (desacoplamento)",
        options: [
            ["Colocar uma fila Amazon SQS entre o serviço web e o processador de pagamento.", true],
            ["Aumentar o tamanho da instância do serviço de processamento de pagamento.", false],
            ["Colocar um Application Load Balancer na frente do serviço de pagamento.", false],
            ["Migrar a chamada entre os serviços de síncrona para uma chamada gRPC direta.", false],
        ],
    },
    {
        statement:
            "Uma plataforma de anúncios grava milhões de eventos por hora no Amazon S3, com um volume de requisições PUT e GET bem acima da média da aplicação. Um engenheiro sugere gerar prefixos de chave aleatórios para os objetos, como se fazia anos atrás, para evitar gargalo de performance no bucket. Qual afirmação descreve o comportamento atual do Amazon S3 para esse cenário?",
        explanation:
            "Desde a atualização de performance de 2018, o Amazon S3 escala automaticamente para suportar altas taxas de requisição por prefixo, na prática pelo menos 3.500 PUT/COPY/POST/DELETE ou 5.500 GET/HEAD por segundo por prefixo, sem limite para o número de prefixos em um bucket. Randomizar prefixos era uma recomendação antiga, hoje desnecessária para atingir alta performance. Não existe limite de um único prefixo de alta performance por bucket nem necessidade de criar múltiplos buckets só para superar taxa de requisição.",
        topic: "Amazon S3 (performance)",
        options: [
            [
                "O S3 escala automaticamente por prefixo, sem exigir chaves ou prefixos aleatórios.",
                true,
            ],
            [
                "O S3 exige prefixos aleatórios para distribuir a carga entre partições do bucket.",
                false,
            ],
            ["O S3 limita cada bucket a um único prefixo de alta performance por vez.", false],
            [
                "O S3 exige a criação de múltiplos buckets para superar o limite de requisições.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de efeitos visuais renderiza quadros de animação em lotes noturnos. O processamento é dividido em milhares de tarefas independentes que podem ser reiniciadas em outra instância sem perda relevante de progresso, e o prazo de entrega tem folga. A empresa quer reduzir ao máximo o custo de computação dessa carga. Qual modelo de compra de instâncias Amazon EC2 atende esse requisito com o menor custo?",
        explanation:
            "Instâncias Spot usam capacidade ociosa da AWS com desconto de até 90% e se encaixam bem em jobs que toleram interrupção e reinício, como o renderizador em lote do cenário. Reservadas e Savings Plans exigem compromisso de uso contínuo e trazem benefício maior para cargas estáveis e previsíveis, não para lotes esporádicos. On-Demand com Auto Scaling ajusta a capacidade mas paga o preço integral por hora, sem o desconto que a tolerância a interrupção permite.",
        topic: "Spot Instances",
        options: [
            ["Instâncias Reservadas Standard com pagamento antecipado por um ano", false],
            ["Instâncias Spot, com desconto de até 90% sobre o preço On-Demand", true],
            ["Savings Plans de Instância EC2 para uma família de instância fixa", false],
            ["Instâncias On-Demand com Auto Scaling ajustando a capacidade", false],
        ],
    },
    {
        statement:
            "Uma empresa roda cargas de trabalho em contêineres que hoje usam instâncias EC2, mas o time de engenharia planeja migrar parte dessas cargas para AWS Fargate e AWS Lambda ao longo do próximo ano. A empresa quer um desconto por compromisso de gasto, sem perder a flexibilidade de mudar o serviço de computação usado. Qual opção de compra atende melhor essa necessidade?",
        explanation:
            "Compute Savings Plans oferecem desconto por compromisso de gasto por hora e se aplicam automaticamente ao uso de EC2, Fargate e Lambda, o que dá a flexibilidade de mudar de serviço de computação sem perder o benefício. EC2 Instance Savings Plans trazem desconto maior, porém ficam presos a uma família de instância dentro de uma região, sem cobrir Fargate ou Lambda. Instâncias Reservadas, mesmo conversíveis, se aplicam somente a instâncias EC2 e não acompanham a migração para serviços serverless.",
        topic: "Savings Plans",
        options: [
            ["EC2 Instance Savings Plans, vinculados a uma família de instância", false],
            ["Instâncias Reservadas Standard conversíveis entre famílias de EC2", false],
            ["Compute Savings Plans, aplicáveis ao EC2, ao Fargate e ao Lambda", true],
            ["Instâncias Reservadas Standard com escopo em uma zona de disponibilidade", false],
        ],
    },
    {
        statement:
            "Um banco de dados relacional roda 24 horas por dia em uma única instância EC2 há mais de dois anos, com utilização de CPU estável e sem previsão de mudança de tipo de instância no curto prazo. A empresa quer o maior desconto possível para essa carga contínua e já sabe que vai manter a mesma instância pelos próximos três anos. Qual opção de compra maximiza a economia nesse caso?",
        explanation:
            "A Instância Reservada Standard de três anos com pagamento total antecipado oferece o maior desconto entre as opções de compra da EC2, e o cenário descreve exatamente o perfil ideal para ela: uso contínuo, estável e sem mudança de tipo prevista. A Reservada Convertible custa mais que a Standard porque permite trocar o tipo de instância, flexibilidade que o cenário não exige. Savings Plans de um ano sem pagamento antecipado rendem desconto menor que um compromisso de três anos antecipado. Spot não é adequado a um banco de dados que precisa ficar disponível continuamente.",
        topic: "Reserved Instances",
        options: [
            ["Instância Reservada Standard, três anos, pagamento total antecipado", true],
            ["Instância Reservada Convertible de um ano, com pagamento mensal", false],
            ["Savings Plans de Instância EC2 de um ano, sem pagamento antecipado", false],
            ["Instâncias Spot com interrupção configurada para hibernar", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa migrar servidores Windows Server com licenças próprias (BYOL) vinculadas ao número de núcleos físicos e sockets do servidor, conforme os termos de licenciamento do fabricante. Essas licenças não podem ser usadas em um ambiente de virtualização compartilhado e multilocatário. Qual modelo de EC2 permite atender essa exigência de licenciamento?",
        explanation:
            "Dedicated Hosts fornecem um servidor físico dedicado com visibilidade dos sockets e núcleos físicos subjacentes, o que permite aplicar licenças BYOL vinculadas a esses atributos, atendendo a exigência do fabricante. Dedicated Instances também rodam em hardware exclusivo, mas não expõem sockets e núcleos físicos, o que não atende licenciamento por essas métricas. Reservadas e On-Demand rodam em hardware compartilhado multilocatário, incompatível com esse tipo de licença.",
        topic: "Dedicated Hosts",
        options: [
            [
                "Dedicated Instances, hardware físico exclusivo mas sem visibilidade de sockets",
                false,
            ],
            ["Instâncias Reservadas Standard, com desconto por compromisso de uso contínuo", false],
            ["Instâncias On-Demand, cobradas por hora em hardware compartilhado", false],
            [
                "Dedicated Hosts, servidor físico dedicado com visibilidade de sockets e núcleos",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma startup vai rodar um ambiente de testes de curta duração para validar uma nova versão da aplicação. O ambiente ficará ativo por poucos dias, o tipo de instância ainda pode mudar durante os testes e a equipe não quer nenhum tipo de compromisso de uso futuro. Qual modelo de compra de instâncias EC2 é o mais adequado para esse cenário?",
        explanation:
            "Instâncias On-Demand são cobradas por segundo de uso, sem qualquer compromisso de prazo, o que se encaixa em um ambiente de teste de curta duração e tipo de instância ainda incerto. Reservadas Convertible e Savings Plans exigem compromisso mínimo de um ano para gerar desconto, incompatível com um uso de poucos dias. Dedicated Hosts custam mais e servem para requisitos de licenciamento ou isolamento físico, não para testes rápidos.",
        topic: "On-Demand Instances",
        options: [
            ["Instâncias Reservadas Convertible, com desconto por flexibilidade de tipo", false],
            ["Instâncias On-Demand, cobradas por segundo sem compromisso de prazo", true],
            ["Savings Plans de Instância EC2, com compromisso de um ano", false],
            ["Dedicated Hosts, com servidor físico reservado por hora", false],
        ],
    },
    {
        statement:
            "Uma empresa armazena arquivos de usuários cujo padrão de acesso é imprevisível: alguns arquivos são acessados com frequência por semanas e depois ficam sem acesso por meses, sem nenhum padrão fixo. A empresa quer reduzir o custo de armazenamento automaticamente, sem escrever regras de transição baseadas em idade do objeto e sem risco de tarifa de recuperação inesperada. Qual classe de armazenamento do Amazon S3 atende melhor essa necessidade?",
        explanation:
            "O S3 Intelligent-Tiering monitora o padrão de acesso de cada objeto e o move automaticamente entre níveis de custo, sem tarifa de recuperação e sem exigir regras manuais baseadas em idade, o que atende a um padrão imprevisível. S3 Standard-IA reduz o custo de armazenamento mas cobra tarifa por gigabyte recuperado, risco que o cenário quer evitar. Glacier Instant Retrieval tem custo de armazenamento menor mas também cobra por recuperação e penaliza acesso frequente. S3 One Zone-IA reduz custo ao abrir mão de redundância entre zonas, o que não resolve o problema de padrão de acesso variável.",
        topic: "S3 Intelligent-Tiering",
        options: [
            ["S3 Intelligent-Tiering", true],
            ["S3 Standard-IA", false],
            ["S3 Glacier Instant Retrieval, com acesso em milissegundos e custo menor", false],
            ["S3 One Zone-IA, armazenado em uma única zona de disponibilidade", false],
        ],
    },
    {
        statement:
            "Uma empresa do setor financeiro precisa manter registros de transações por dez anos por exigência regulatória. Esses arquivos praticamente nunca são acessados após o primeiro ano, e quando precisam ser recuperados, um prazo de até 12 horas é plenamente aceitável. A empresa quer a menor tarifa de armazenamento possível para esses arquivos. Qual configuração atende esse requisito com o menor custo?",
        explanation:
            "O S3 Glacier Deep Archive tem a menor tarifa de armazenamento entre as classes do S3 e aceita prazos de recuperação de horas, o que combina com registros raramente acessados e um prazo de recuperação de até 12 horas. S3 Standard-IA custa mais para armazenar e foi pensado para dados acessados ocasionalmente com recuperação em milissegundos, não para um arquivo morto de longo prazo. Glacier Instant Retrieval custa mais que o Deep Archive porque garante recuperação em milissegundos, recurso que o cenário não precisa. S3 One Zone-IA custa mais que o Deep Archive e não traz vantagem para um arquivo de dez anos.",
        topic: "S3 Lifecycle e Glacier Deep Archive",
        options: [
            ["Ciclo de vida do S3 movendo os objetos para o S3 Standard-IA", false],
            ["Armazenamento direto no S3 Glacier Instant Retrieval desde a criação", false],
            ["Ciclo de vida do S3 movendo os objetos para o S3 Glacier Deep Archive", true],
            ["Ciclo de vida do S3 movendo os objetos para o S3 One Zone-IA", false],
        ],
    },
    {
        statement:
            "Uma empresa mantém cópias de segurança (backups) que são acessadas raramente, cerca de uma vez por trimestre, mas quando um backup precisa ser restaurado, o acesso tem que ser imediato, em milissegundos, sem processo de recuperação prévio. A empresa quer reduzir o custo de armazenamento em relação ao S3 Standard sem abrir mão dessa velocidade de acesso. Qual classe de armazenamento atende esse cenário?",
        explanation:
            "S3 Standard-IA mantém o mesmo acesso em milissegundos do S3 Standard, com tarifa de armazenamento menor, ideal para dados acessados com pouca frequência mas que exigem disponibilidade imediata quando solicitados, como o backup do cenário. Glacier Flexible Retrieval e Deep Archive custam menos para armazenar, porém exigem um processo de recuperação que leva minutos, horas ou até 12 horas, incompatível com a exigência de acesso imediato. Intelligent-Tiering também atenderia, mas cobra uma pequena tarifa de monitoramento por objeto sem necessidade, já que o padrão de acesso aqui já é conhecido e previsível.",
        topic: "S3 Standard-IA",
        options: [
            ["S3 Glacier Flexible Retrieval, com recuperação em minutos ou em horas", false],
            ["S3 Glacier Deep Archive, com recuperação em até 12 horas", false],
            ["S3 Intelligent-Tiering, com movimentação automática entre níveis", false],
            ["S3 Standard-IA, acesso em milissegundos e menor custo de armazenamento", true],
        ],
    },
    {
        statement:
            "Uma empresa gera diariamente arquivos de saída de um pipeline de processamento de imagens. Esses arquivos podem ser recriados a partir dos dados de origem a qualquer momento, são acessados raramente após a geração e a perda ocasional de uma cópia não traz problema real ao negócio. A empresa quer a classe de armazenamento do S3 de menor custo para dados infrequentes que não precisam de redundância entre zonas de disponibilidade. Qual classe atende esse caso?",
        explanation:
            "S3 One Zone-IA armazena dados em uma única zona de disponibilidade, o que reduz o custo em relação às classes com redundância multi-zona, e se encaixa em dados recriáveis cuja perda ocasional é aceitável. S3 Standard-IA e S3 Standard replicam os dados em múltiplas zonas de disponibilidade, o que custa mais e não é necessário quando o dado pode ser regenerado. Glacier Instant Retrieval também réplica entre múltiplas zonas e tem foco em dados de acesso raro de longo prazo, não no menor custo para esse tipo específico de dado recriável.",
        topic: "S3 One Zone-IA",
        options: [
            ["S3 Standard-IA, com dados replicados em múltiplas zonas de disponibilidade", false],
            ["S3 One Zone-IA, com dados replicados em apenas uma zona de disponibilidade", true],
            ["S3 Standard, com replicação em múltiplas zonas de disponibilidade", false],
            ["S3 Glacier Instant Retrieval, com replicação em múltiplas zonas", false],
        ],
    },
    {
        statement:
            "Uma equipe de operações observa que várias instâncias EC2 em produção mantêm uso médio de CPU e memória abaixo de 10% há meses, mas ninguém sabe ao certo qual seria o tamanho ideal de instância para cada carga de trabalho. A empresa quer uma recomendação baseada em aprendizado de máquina sobre o tipo e tamanho de instância mais adequado para cada recurso, usando o histórico real de utilização. Qual serviço da AWS entrega esse tipo de recomendação?",
        explanation:
            "O AWS Compute Optimizer analisa o histórico de utilização de CPU, memória, rede e disco com aprendizado de máquina e recomenda o tipo e tamanho de instância mais adequados para cada carga, exatamente o que o cenário pede. O CloudWatch fornece as métricas brutas de utilização, mas não gera recomendação de dimensionamento por si só. O Trusted Advisor sinaliza instâncias com baixa utilização entre suas verificações de custo, porém sem a análise detalhada de dimensionamento que o Compute Optimizer oferece. O Cost Explorer mostra para onde o dinheiro está indo, não qual tamanho de instância usar.",
        topic: "Compute Optimizer",
        options: [
            ["AWS Compute Optimizer, que recomenda o tamanho ideal de instância", true],
            ["Amazon CloudWatch, que exibe gráficos de utilização de CPU e memória", false],
            ["AWS Trusted Advisor, que verifica boas práticas gerais da conta", false],
            ["AWS Cost Explorer, que mostra o histórico de gastos por serviço", false],
        ],
    },
    {
        statement:
            "Uma aplicação usa um volume EBS gp2 de 500 GB que fornece 1500 IOPS pela relação fixa entre tamanho e IOPS dessa classe. A aplicação só precisa de 1000 IOPS e 250 MB/s de throughput, bem abaixo da capacidade atual, e o time quer pagar menos sem reduzir o tamanho do volume nem migrar para outro serviço de armazenamento. Qual mudança reduz o custo mantendo o desempenho necessário?",
        explanation:
            "O gp3 permite definir IOPS e throughput de forma independente do tamanho do volume, com uma tarifa por GB menor que o gp2, permitindo pagar apenas pelos 1000 IOPS e 250 MB/s necessários sem alterar o tamanho do volume. O io2 também desacopla IOPS do tamanho, mas cobra por IOPS provisionado a um preço superior ao gp3, feito para cargas que exigem alta durabilidade e IOPS elevado. O st1 é voltado a cargas sequenciais como big data e logs, não ao perfil de IOPS aleatório da aplicação. Reduzir o tamanho do gp2 diminuiria o IOPS, mas também reduziria a capacidade de armazenamento, o que o time quer evitar.",
        topic: "EBS gp3",
        options: [
            ["Migrar o volume para io2, com IOPS provisionado de forma independente", false],
            ["Migrar o volume para st1, otimizado para dados sequenciais de grande volume", false],
            [
                "Migrar o volume para gp3 e definir IOPS e throughput de forma independente do tamanho",
                true,
            ],
            [
                "Reduzir o tamanho do volume gp2 para diminuir o IOPS provisionado automaticamente por GB",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação roda em instâncias EC2 em uma sub-rede privada e lê e grava grandes volumes de dados no Amazon S3 o tempo todo. Todo esse tráfego hoje passa por um NAT Gateway, gerando uma cobrança relevante por processamento de dados. A equipe quer eliminar essa cobrança de processamento de dados especificamente para o tráfego destinado ao S3, sem expor a sub-rede à internet. Qual solução atende esse objetivo?",
        explanation:
            "Um endpoint de gateway da VPC para o Amazon S3 direciona o tráfego destinado ao S3 pela rede interna da AWS, sem passar pelo NAT Gateway e sem cobrança por processamento de dados no endpoint, o que resolve exatamente o problema do cenário. O endpoint de interface também evita o NAT Gateway, mas cobra por hora e por gigabyte processado, custo que o gateway endpoint para S3 não tem. Um Internet Gateway exige que a sub-rede tenha rotas e recursos públicos, o que vai contra manter a sub-rede privada. Adicionar outro NAT Gateway aumenta o custo em vez de reduzir.",
        topic: "VPC Gateway Endpoint",
        options: [
            ["Criar um endpoint de interface da VPC para o Amazon S3", false],
            ["Substituir o NAT Gateway por um Internet Gateway na sub-rede", false],
            ["Adicionar mais um NAT Gateway em outra zona de disponibilidade", false],
            ["Criar um endpoint de gateway da VPC para o Amazon S3", true],
        ],
    },
    {
        statement:
            "Uma aplicação em uma sub-rede privada chama a API do Amazon Kinesis Data Streams com bastante frequência, e todo esse tráfego atualmente atravessa um NAT Gateway antes de sair para a internet pública. A equipe de segurança exige que esse tráfego nunca saia para a internet pública, e a equipe de custos quer reduzir a cobrança de processamento de dados do NAT Gateway para esse tráfego. Qual solução atende as duas exigências?",
        explanation:
            "Um endpoint de interface da VPC, baseado em AWS PrivateLink, cria uma interface de rede privada dentro da VPC para acessar serviços como o Kinesis Data Streams sem passar pela internet pública e sem depender do NAT Gateway, atendendo segurança e custo ao mesmo tempo. Endpoints de gateway da VPC existem apenas para Amazon S3 e Amazon DynamoDB, não para o Kinesis. Colocar a instância em uma sub-rede pública exporia o recurso diretamente à internet, o contrário do exigido. Duplicar o NAT Gateway aumenta a disponibilidade, mas não reduz a cobrança de processamento nem tira o tráfego da internet pública.",
        topic: "VPC Interface Endpoint",
        options: [
            ["Criar um endpoint de gateway da VPC para o Kinesis Data Streams", false],
            ["Criar um endpoint de interface da VPC para o Kinesis Data Streams", true],
            ["Colocar a instância em uma sub-rede pública com Elastic IP associado", false],
            ["Configurar um NAT Gateway redundante em cada zona de disponibilidade", false],
        ],
    },
    {
        statement:
            "Um site global serve arquivos estáticos, como imagens e vídeos, diretamente de um bucket do Amazon S3 para usuários em vários continentes. A equipe percebe que a cobrança de transferência de dados de saída do S3 para a internet está alta e que os usuários mais distantes da região do bucket sentem mais latência. Qual solução reduz o custo de transferência de dados e melhora a latência para os usuários?",
        explanation:
            "O Amazon CloudFront faz cache do conteúdo em localizações de borda próximas aos usuários, o que reduz a latência e substitui grande parte da transferência de saída cobrada no S3 por uma tarifa de CloudFront geralmente menor. Replicação entre regiões aumenta a disponibilidade e reduz latência de leitura, mas multiplica o custo de armazenamento e não elimina a cobrança de saída para a internet. O Global Accelerator melhora desempenho de rede usando a infraestrutura global da AWS, mas seu uso típico é para aplicações TCP/UDP com IP fixo, não para baratear a saída de conteúdo estático como o CloudFront. O S3 Transfer Acceleration acelera upload e download via bordas do CloudFront, mas cobra uma tarifa adicional por isso, sem reduzir o custo de saída padrão.",
        topic: "Amazon CloudFront",
        options: [
            ["Colocar o Amazon CloudFront na frente do bucket para cache nas bordas", true],
            ["Ativar a replicação entre regiões do bucket para várias regiões da AWS", false],
            ["Usar o AWS Global Accelerator apontando para o endpoint do bucket S3", false],
            ["Habilitar o S3 Transfer Acceleration para todos os uploads e downloads", false],
        ],
    },
    {
        statement:
            "O time financeiro de uma empresa quer entender como o gasto na AWS evoluiu nos últimos seis meses, identificar quais serviços mais contribuíram para o aumento de custo e projetar o gasto esperado para o próximo trimestre, tudo isso por meio de gráficos interativos no console. Qual serviço da AWS atende essa necessidade sem que a empresa precise processar arquivos de dados brutos?",
        explanation:
            "O AWS Cost Explorer oferece gráficos interativos prontos no console para analisar tendências de gasto por serviço ao longo do tempo e gerar previsões, sem exigir processamento de arquivos brutos, o que atende diretamente a necessidade do time financeiro. O Cost and Usage Report entrega o detalhamento de custo mais granular disponível, porém em arquivos que precisam ser processados ou carregados em uma ferramenta de análise. O AWS Budgets serve para definir limites e alertas, não para explorar tendências históricas com gráficos. O Trusted Advisor foca em recomendações pontuais de custo, segurança e desempenho, não em análise histórica de gasto.",
        topic: "Cost Explorer",
        options: [
            ["AWS Cost and Usage Report", false],
            ["AWS Budgets, com alertas quando o gasto ultrapassa um limite definido", false],
            ["AWS Cost Explorer, com gráficos de tendência e previsão de gastos", true],
            ["AWS Trusted Advisor, com verificações de custo, segurança e desempenho", false],
        ],
    },
    {
        statement:
            "A equipe de engenharia de dados de uma empresa quer carregar informações detalhadas de custo e uso da AWS, no nível de hora e de recurso individual, em um data warehouse para cruzar com outras métricas de negócio usando ferramentas como Amazon Athena e Amazon QuickSight. Qual fonte de dados de custo da AWS oferece esse nível de granularidade para integração com ferramentas de análise?",
        explanation:
            "O AWS Cost and Usage Report (CUR) gera o relatório de custo mais detalhado da AWS, no nível de hora e de recurso, entregue em arquivos no Amazon S3 prontos para consulta com Amazon Athena ou visualização no Amazon QuickSight. O Cost Explorer permite consultas programáticas e visuais, mas com granularidade e período de retenção menores que o CUR, sem o mesmo nível de detalhe por recurso. AWS Budgets acompanha limites de gasto definidos, não entrega dados brutos para análise. O Trusted Advisor resume verificações da conta, sem relação com dados detalhados de faturamento.",
        topic: "Cost and Usage Report",
        options: [
            ["AWS Cost Explorer, consultado por meio do console ou de sua API", false],
            ["AWS Budgets, com relatórios de acompanhamento de limites definidos", false],
            ["AWS Trusted Advisor, com o resumo de verificações da conta", false],
            ["AWS Cost and Usage Report, entregue em arquivos no Amazon S3", true],
        ],
    },
    {
        statement:
            "Um administrador de contas quer varrer todos os recursos da empresa na AWS em busca de oportunidades rápidas de redução de custo, como instâncias EC2 com baixa utilização há semanas, volumes EBS não anexados e endereços IP elásticos sem uso associado, sem precisar configurar nenhum processo novo. Qual serviço da AWS já oferece essas verificações prontas?",
        explanation:
            "O AWS Trusted Advisor já traz, prontas e sem configuração adicional, verificações de otimização de custo que apontam instâncias ociosas, volumes EBS não anexados, endereços IP elásticos sem uso e outros recursos subutilizados. O CloudWatch pode identificar baixa utilização, mas exige que o administrador crie e configure cada alarme manualmente. O AWS Config avalia conformidade de configuração contra regras definidas, não ociosidade de custo. O Compute Optimizer recomenda o dimensionamento ideal de instâncias EC2, mas não cobre volumes EBS órfãos nem endereços IP não associados como o Trusted Advisor cobre.",
        topic: "Trusted Advisor",
        options: [
            ["Amazon CloudWatch, com alarmes configurados manualmente por recurso", false],
            ["AWS Trusted Advisor, na categoria de otimização de custo", true],
            ["AWS Config, com regras de conformidade avaliadas continuamente", false],
            ["AWS Compute Optimizer", false],
        ],
    },
    {
        statement:
            "Uma empresa roda uma plataforma de análise de dados com dois perfis de carga bem definidos: um cluster de banco de dados que fica ligado 24 horas por dia com uso estável, e um conjunto de jobs de processamento em lote que roda em horários variados, tolera interrupção e pode ser refeito caso a instância seja interrompida. A empresa quer reduzir o custo de computação de cada perfil de acordo com sua natureza. Quais DUAS ações atendem melhor esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "Um Savings Plan reduz o custo do cluster de banco de dados, que fica ligado continuamente com uso estável, exatamente o perfil que maximiza o desconto por compromisso. Instâncias Spot reduzem o custo dos jobs em lote, que toleram interrupção e rodam em horários variados, aproveitando o desconto de capacidade ociosa. Dedicated Hosts custam mais e resolvem isolamento físico ou licenciamento, não economia para uso contínuo comum. Usar Spot no banco de dados arrisca interromper uma carga que precisa ficar disponível o tempo todo. Um Savings Plan nos jobs em lote cobra pelo compromisso mesmo nas horas em que o lote não roda, desperdiçando parte do desconto.",
        topic: "EC2 Savings Plans e Spot Instances",
        options: [
            ["Contratar Dedicated Hosts para o cluster de banco de dados", false],
            ["Contratar um Savings Plan para o cluster de banco de dados", true],
            ["Usar instâncias Spot para o cluster de banco de dados", false],
            ["Usar instâncias Spot para os jobs de processamento em lote", true],
            ["Contratar um Savings Plan para os jobs de processamento em lote", false],
        ],
    },
    {
        statement:
            "O time financeiro de uma empresa quer conseguir ver quanto cada equipe de produto gasta na AWS separadamente, para fins de rateio interno, e também quer ser avisado automaticamente antes que o gasto mensal total ultrapasse um valor definido, sem precisar checar o console todos os dias. Quais DUAS ações atendem essas duas necessidades? (Selecione DUAS opções.)",
        explanation:
            "Tags de alocação de custo aplicadas aos recursos permitem separar e visualizar o gasto por equipe nos relatórios de custo, atendendo o rateio interno. Um orçamento no AWS Budgets com alerta por email avisa automaticamente quando o gasto se aproxima ou ultrapassa o limite definido, sem checagem manual diária. O Cost Explorer ajuda a visualizar tendências, mas não envia alertas proativos nem separa custo por equipe sem as tags. O Cost and Usage Report traz dados detalhados em arquivos, útil para análise posterior, mas não gera alerta nem organiza por equipe sozinho. O Trusted Advisor verifica boas práticas gerais da conta, sem relação com rateio por equipe ou alerta de orçamento.",
        topic: "Tags de alocação de custo e AWS Budgets",
        options: [
            ["Aplicar tags de alocação de custo nos recursos de cada equipe", true],
            ["Ativar o AWS Cost Explorer para a conta de faturamento", false],
            ["Criar um orçamento no AWS Budgets com alerta por email", true],
            ["Gerar um Cost and Usage Report em arquivos no Amazon S3", false],
            ["Ativar o AWS Trusted Advisor para a conta de faturamento", false],
        ],
    },
    {
        statement:
            "Uma aplicação web global serve arquivos estáticos para usuários em vários países e, ao mesmo tempo, sua camada de backend em sub-redes privadas faz milhares de consultas por minuto a uma tabela do Amazon DynamoDB. A conta está com custo alto de transferência de dados de saída para a internet e de processamento de dados no NAT Gateway. Quais DUAS ações reduzem esses custos de transferência de dados? (Selecione DUAS opções.)",
        explanation:
            "O CloudFront armazena os arquivos estáticos em cache nas bordas, reduzindo a transferência de saída direta da origem para a internet. O endpoint de gateway da VPC para o DynamoDB leva o tráfego das consultas pela rede interna da AWS, sem passar pelo NAT Gateway e sem a cobrança de processamento de dados associada a ele. Aumentar o número de NAT Gateways melhora disponibilidade, mas não reduz a cobrança por dados processados, apenas distribui o mesmo custo. Migrar arquivos estáticos para EBS não resolve distribuição global de conteúdo, já que o EBS está vinculado a uma zona de disponibilidade. Um endpoint de interface também evitaria o NAT Gateway, porém cobra por hora e por gigabyte processado, custo que o endpoint de gateway do DynamoDB não tem.",
        topic: "CloudFront e VPC Gateway Endpoint",
        options: [
            ["Aumentar o número de NAT Gateways para distribuir a carga", false],
            ["Migrar os arquivos estáticos para um volume do Amazon EBS", false],
            ["Colocar o Amazon CloudFront na frente dos arquivos estáticos", true],
            ["Criar um endpoint de interface da VPC para o Amazon DynamoDB", false],
            ["Criar um endpoint de gateway da VPC para o Amazon DynamoDB", true],
        ],
    },
    {
        statement:
            "Uma empresa armazena logs de aplicação em um bucket do Amazon S3. O padrão de acesso aos logs recentes varia bastante e é difícil de prever, mas a política de retenção da empresa exige que nenhum log fique armazenado por mais de sete anos, após os quais deve ser excluído automaticamente. Quais DUAS configurações juntas atendem a otimização de custo pelo padrão imprevisível e a exclusão automática após sete anos? (Selecione DUAS opções.)",
        explanation:
            "O S3 Intelligent-Tiering move automaticamente cada objeto entre níveis de custo conforme o padrão de acesso real, sem regra manual, o que se encaixa em um padrão imprevisível de acesso aos logs recentes. Uma regra de ciclo de vida com ação de expiração exclui os objetos automaticamente após sete anos, atendendo a política de retenção, já que o Intelligent-Tiering sozinho não exclui objetos. Versionamento mantém várias cópias de um objeto e tende a aumentar o custo, sem relação com a exigência do cenário. Replicação entre regiões aumenta disponibilidade geográfica, mas também aumenta o custo de armazenamento sem necessidade descrita. Transfer Acceleration acelera upload e download via CloudFront, sem relação com custo de armazenamento ou retenção.",
        topic: "S3 Intelligent-Tiering e S3 Lifecycle",
        options: [
            ["Ativar o versionamento de objetos no bucket de logs", false],
            ["Ativar o S3 Intelligent-Tiering no bucket de logs", true],
            ["Configurar replicação entre regiões para o bucket de logs", false],
            ["Criar uma regra de ciclo de vida com expiração em sete anos", true],
            ["Ativar o S3 Transfer Acceleration no bucket de logs", false],
        ],
    },
    {
        statement:
            "Uma auditoria de custo identificou que uma frota de instâncias EC2 em produção roda há mais de um ano com utilização de CPU estável em torno de 30%, bem abaixo da capacidade contratada, e a empresa está prestes a renovar o compromisso de compra para o próximo período. Quais DUAS ações reduzem o custo dessa frota antes da renovação? (Selecione DUAS opções.)",
        explanation:
            "As recomendações do Compute Optimizer usam o histórico de utilização para indicar um tipo de instância menor e mais adequado, corrigindo o superdimensionamento identificado na auditoria. Depois de redimensionar, contratar um Savings Plan compatível com o novo uso estável garante o desconto por compromisso sobre a capacidade correta, evitando pagar por capacidade ociosa durante o próximo período. Migrar para Spot sem Auto Scaling arrisca interromper uma carga de produção sem mecanismo de substituição automática. Dedicated Hosts custam mais e servem a requisitos de licenciamento ou isolamento físico, não a esse cenário. S3 Intelligent-Tiering é uma classe de armazenamento de objetos do S3, sem relação com volumes EBS ou com o dimensionamento de instâncias EC2.",
        topic: "Compute Optimizer e Savings Plans",
        options: [
            ["Redimensionar as instâncias conforme o Compute Optimizer indica", true],
            ["Migrar toda a frota para instâncias Spot sem Auto Scaling", false],
            ["Contratar Dedicated Hosts para consolidar a frota atual", false],
            ["Ativar o S3 Intelligent-Tiering para os volumes EBS da frota", false],
            ["Contratar um Savings Plan para o novo uso redimensionado", true],
        ],
    },
    {
        statement:
            "Uma empresa réplica objetos de um bucket do Amazon S3 em us-east-1 para um bucket em eu-west-1 usando replicação entre regiões, e todos os objetos usam SSE-KMS. A equipe quer que a aplicação de cada região descriptografe os objetos localmente com a mesma identidade criptografica de chave, sem chamadas KMS entre regiões. Qual abordagem atende a esse requisito?",
        explanation:
            "Chaves multi-região do KMS tem uma primária e réplicas que compartilham o mesmo ID e material criptografico, permitindo descriptografar em qualquer região sem chamadas entre regiões. Chaves KMS regionais comuns são isoladas por região.",
        topic: "AWS KMS - multi-region keys",
        options: [
            [
                "Criar uma chave KMS independente e sem relacao em cada região e configurar a regra de replicação do S3 para descriptografar cada objeto na origem e recriptografa-lo com a chave de destino durante a transferência.",
                false,
            ],
            [
                "Habilitar a rotação automática anual da chave de us-east-1 para que o material criptografico seja copiado para uma chave equivalente em eu-west-1.",
                false,
            ],
            [
                "Criar uma chave KMS multi-região primária em us-east-1 e réplica-la para eu-west-1, mantendo o mesmo ID e material de chave nas duas regiões.",
                true,
            ],
            [
                "Manter uma única chave em us-east-1 e permitir que a aplicação de eu-west-1 chame a API Decrypt no endpoint regional de us-east-1.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma função AWS Lambda precisa de permissão temporária para usar uma chave KMS gerenciada pelo cliente apenas durante uma janela de processamento em lote. A equipe de segurança quer conceder esse acesso de forma granular e revogavel, sem editar a política da chave a cada execução. Qual mecanismo do KMS e mais adequado?",
        explanation:
            "Grants do KMS concedem permissões temporárias e granulares a um principal para usar uma chave e podem ser revogados sem alterar a política da chave. Isso e ideal para acessos programaticos e de curta duracao.",
        topic: "AWS KMS - grants",
        options: [
            [
                "Criar um grant do KMS para a role da função, autorizando as operações necessarias e permitindo revogar o acesso quando o lote terminar.",
                true,
            ],
            [
                "Adicionar a role da função como principal em uma nova declaracao da política da chave a cada execução e remove-la ao final.",
                false,
            ],
            [
                "Compartilhar a chave por meio de uma política de bucket do S3 que referência a role da função durante a janela de execução.",
                false,
            ],
            [
                "Habilitar a rotação automática de chave e criar um alias exclusivo apontando para a chave, concedendo a role da função acesso ao alias somente durante o período em que o processamento em lote esta previsto para rodar.",
                false,
            ],
        ],
    },
    {
        statement:
            "A conta A possui uma chave KMS gerenciada pelo cliente usada para criptografar objetos em um bucket do S3. A conta B precisa descriptografar esses objetos a partir de uma aplicação em EC2. Como conceder a conta B o uso da chave seguindo as práticas recomendadas?",
        explanation:
            "O acesso entre contas a uma chave KMS exige que a política da chave na conta proprietaria permita a outra conta e que a conta destino delegue a permissão a role apropriada. Ambas as camadas são necessarias.",
        topic: "AWS KMS - política de chave cross-account",
        options: [
            [
                "Exportar o material da chave da conta A e importa-lo em uma nova chave KMS criada na conta B, para que a aplicação descriptografe os objetos localmente sem depender da conta A.",
                false,
            ],
            [
                "Tornar a chave KMS pública para que qualquer principal autenticado da conta B possa chamar Decrypt sem configuração adicional.",
                false,
            ],
            [
                "Adicionar apenas uma política de identidade na conta B permitindo kms:Decrypt, o que é suficiente para acesso entre contas.",
                false,
            ],
            [
                "Na política da chave na conta A, permitir o acesso ao principal da conta B e conceder kms:Decrypt a role da aplicação na conta B.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação web precisa permitir que usuários autenticados facam download de arquivos privados no S3 por um curto período, sem tornar o bucket público e sem distribuir credenciais da AWS aos clientes. Qual solucao atende a esse requisito?",
        explanation:
            "URLs pre-assinadas concedem acesso temporário a objetos específicos usando as credenciais de quem as gera, sem expor o bucket publicamente nem compartilhar credenciais permanentes com os usuários.",
        topic: "Amazon S3 - Pre-signed URLs",
        options: [
            [
                "Anexar uma bucket policy que concede s3:GetObject a qualquer principal e usar uma condicao de intervalo de horários para limitar o acesso apenas ao período em que os usuários costumam baixar os arquivos.",
                false,
            ],
            [
                "Gerar URLs pre-assinadas no backend com validade curta, usando as credenciais da aplicação, e entrega-las aos usuários para o download.",
                true,
            ],
            [
                "Desabilitar o Block Public Access e conceder acesso de leitura anonimo somente aos objetos que precisam ser baixados.",
                false,
            ],
            [
                "Distribuir aos clientes as chaves de acesso de um usuário do IAM com permissão de leitura restrita ao bucket.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um único bucket do S3 armazena dados compartilhados por dezenas de aplicações e equipes, cada uma exigindo permissões de acesso diferentes. A bucket policy única cresceu demais e ficou dificil de manter. Qual recurso simplifica a gestão desses acessos distintos?",
        explanation:
            "S3 Access Points fornecem endpoints nomeados com políticas de acesso proprias sobre um bucket compartilhado, permitindo escalar e isolar permissões por aplicação sem inflar uma única bucket policy.",
        topic: "Amazon S3 - Access Points",
        options: [
            [
                "Dividir o bucket em dezenas de buckets menores, um por aplicação, cada um com sua própria bucket policy.",
                false,
            ],
            [
                "Criar uma role do IAM por aplicação e consolidar todas as permissões de acesso em uma política gerenciada compartilhada anexada a um único grupo do IAM que contem todas as equipes.",
                false,
            ],
            [
                "Criar S3 Access Points, cada um com sua própria política e nome de host dedicado, para atender aos diferentes padrões de acesso ao mesmo bucket.",
                true,
            ],
            [
                "Habilitar o versionamento do bucket e usar prefixos de objeto distintos para separar o acesso de cada equipe.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma auditoria de segurança exige que todo acesso a um bucket do S3 ocorra somente por conexões criptografadas, bloqueando qualquer requisição feita por HTTP simples. Qual medida atende a esse requisito?",
        explanation:
            "Uma bucket policy com Deny condicionado a aws:SecureTransport igual a false bloqueia qualquer requisição não-HTTPS. Criptografia em repouso e Block Public Access não controlam o protocolo de transporte.",
        topic: "Amazon S3 - criptografia em transito (aws:SecureTransport)",
        options: [
            [
                "Adicionar uma bucket policy que negue as acoes quando a condicao aws:SecureTransport for falsa.",
                true,
            ],
            [
                "Habilitar SSE-KMS no bucket, o que passa a rejeitar automaticamente requisições feitas por HTTP.",
                false,
            ],
            [
                "Ativar o Block Public Access, que forca todas as conexões ao bucket a usarem TLS.",
                false,
            ],
            [
                "Configurar uma regra de ciclo de vida que remova objetos enviados por conexões não criptografadas e habilitar o versionamento para reter as versões enviadas corretamente por HTTPS.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa garantir que nenhum objeto seja gravado em um bucket do S3 sem criptografia do lado do servidor com SSE-KMS, rejeitando uploads que não especifiquem esse tipo de criptografia. Qual abordagem atende ao requisito?",
        explanation:
            "Uma bucket policy com Deny condicionado a ausência do cabeçalho de criptografia SSE-KMS rejeita uploads não criptografados. A criptografia padrão apenas aplica a criptografia, mas não rejeita a requisição.",
        topic: "Amazon S3 - política de bucket para SSE obrigatório",
        options: [
            [
                "Criar uma função do AWS Lambda acionada por eventos do S3 que verifica cada objeto recem-criado e, se ele não estiver criptografado com SSE-KMS, exclui o objeto e notifica a equipe de segurança por e-mail.",
                false,
            ],
            [
                "Habilitar a criptografia padrão do bucket, o que faz o S3 recusar qualquer requisição PUT sem cabeçalho de criptografia.",
                false,
            ],
            [
                "Ativar o Object Lock em modo compliance para impedir o upload de objetos não criptografados.",
                false,
            ],
            [
                "Aplicar uma bucket policy que negue s3:PutObject quando o cabeçalho de criptografia SSE-KMS não estiver presente na requisição.",
                true,
            ],
        ],
    },
    {
        statement:
            "Um provedor de SaaS hospeda uma aplicação atras de um Network Load Balancer em sua própria VPC e quer disponibiliza-la a VPCs de clientes de forma privada, sem expor a aplicação a internet e sem peering de VPC nem sobreposicao de faixas de IP. Qual solucao atende a esse cenário?",
        explanation:
            "O AWS PrivateLink permite publicar um serviço via endpoint service sobre um NLB, e os consumidores acessam por interface endpoints privados, sem peering, sem exposicao a internet e sem conflito de faixas de IP.",
        topic: "AWS PrivateLink",
        options: [
            [
                "Criar uma conexão de VPC peering entre a VPC do provedor e cada VPC de cliente e ajustar as tabelas de rotas e faixas de IP de todas as partes para evitar sobreposicao de endereços.",
                false,
            ],
            [
                "Publicar um VPC endpoint service (AWS PrivateLink) sobre o Network Load Balancer e permitir que os clientes criem interface endpoints para consumi-lo.",
                true,
            ],
            [
                "Expor a aplicação por um Application Load Balancer público e restringir o acesso por security groups que referenciam os IPs dos clientes.",
                false,
            ],
            [
                "Configurar um Transit Gateway compartilhado que conecta a VPC do provedor a todas as VPCs de clientes em uma malha única.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma organização com várias contas AWS quer uma visão central e padronizada das descobertas do GuardDuty, do Inspector e do Macie, além de verificar automaticamente a conformidade com padrões como o CIS AWS Foundations Benchmark. Qual serviço atende a essa necessidade?",
        explanation:
            "O AWS Security Hub consolida descobertas de GuardDuty, Inspector, Macie e outros serviços num formato padronizado e executa verificações contra frameworks como o CIS Benchmark. O Config avalia configuração de recursos, mas não agrega descobertas de ameacas.",
        topic: "AWS Security Hub",
        options: [
            [
                "Amazon Detective, que agrega e prioriza as descobertas de todas as contas em um único painel de conformidade.",
                false,
            ],
            [
                "Amazon CloudWatch, criando um dashboard consolidado que coleta métricas e eventos de cada serviço de segurança em todas as contas e avalia continuamente os controles do CIS Benchmark.",
                false,
            ],
            [
                "AWS Security Hub, que agrega descobertas de vários serviços de segurança e executa verificações de conformidade automatizadas.",
                true,
            ],
            [
                "AWS Config, que centraliza as descobertas dos serviços de segurança e gera um score de conformidade unificado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de conformidade precisa detectar continuamente recursos que violam regras internas, como volumes do EBS não criptografados ou security groups com a porta 22 aberta para a internet, e registrar o histórico de mudancas de configuração de cada recurso. Qual serviço atende a esse objetivo?",
        explanation:
            "O AWS Config avalia continuamente a configuração dos recursos contra regras gerenciadas ou personalizadas e registra o histórico de mudancas. CloudTrail registra chamadas de API e GuardDuty detecta ameacas, não conformidade de configuração.",
        topic: "AWS Config",
        options: [
            [
                "AWS Config, com regras gerenciadas que avaliam a conformidade dos recursos e mantem o histórico de configurações.",
                true,
            ],
            [
                "Amazon Inspector, que faz varredura continua de configurações de recursos e mantem uma linha do tempo de alterações.",
                false,
            ],
            [
                "AWS CloudTrail, que avalia regras de conformidade sobre o estado atual de cada recurso da conta.",
                false,
            ],
            [
                "Amazon GuardDuty, que analisa continuamente as configurações dos recursos, sinaliza os que estao fora de conformidade com as regras definidas e registra cada alteração de configuração ao longo do tempo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa contrata um fornecedor SaaS de terceiros que precisa assumir uma role do IAM na conta da empresa para monitorar recursos. A equipe de segurança quer proteger essa relacao de confianca contra o problema do confused deputy, garantindo que apenas o fornecedor correto assuma a role. Qual medida atende a esse requisito?",
        explanation:
            "O External ID e o mecanismo recomendado para acesso entre contas com terceiros: a trust policy exige um sts:ExternalId combinado, evitando o problema do confused deputy sem depender de credenciais de longa duracao.",
        topic: "IAM Roles - Cross-Account External ID",
        options: [
            [
                "Restringir a trust policy da role ao intervalo de endereços IP públicos usados pelo fornecedor por meio da condicao aws:SourceIp.",
                false,
            ],
            [
                "Criar um usuário do IAM dedicado ao fornecedor, gerar chaves de acesso de longa duracao, envia-las ao fornecedor por um canal seguro e rotaciona-las manualmente a cada noventa dias.",
                false,
            ],
            [
                "Habilitar a autenticação multifator na conta do fornecedor e exigir MFA na trust policy da role.",
                false,
            ],
            [
                "Exigir um External ID acordado com o fornecedor na condicao sts:ExternalId da trust policy da role.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer identificar automaticamente quais buckets do S3, roles do IAM, filas do SQS e chaves do KMS estao acessíveis por entidades externas a organização, para revisar e reduzir acessos não intencionais. Qual serviço fornece essa análise?",
        explanation:
            "O IAM Access Analyzer usa raciocinio automatizado sobre políticas para identificar recursos compartilhados com principais externos a zona de confianca da conta ou da organização. Macie classifica dados e Trusted Advisor não faz essa análise de políticas.",
        topic: "IAM Access Analyzer",
        options: [
            [
                "AWS Trusted Advisor, que analisa as políticas baseadas em recurso e alerta sobre qualquer acesso concedido a entidades externas.",
                false,
            ],
            [
                "IAM Access Analyzer, que examina políticas baseadas em recurso e identifica acessos concedidos a principais fora da zona de confianca.",
                true,
            ],
            [
                "Amazon Macie, que inspeciona as políticas dos recursos em busca de concessoes de acesso externo.",
                false,
            ],
            [
                "AWS Config, que mantem regras avaliando cada recurso e gera descobertas sempre que uma política concede acesso a uma conta que não pertence a organização definida como zona de confianca.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um pipeline de CI/CD executado em um provedor externo precisa implantar recursos na AWS. A equipe quer eliminar as chaves de acesso de longa duracao hoje armazenadas no sistema de CI e obter credenciais temporárias por meio de tokens OIDC emitidos pelo provedor. Qual abordagem atende a esse requisito?",
        explanation:
            "Registrando o provedor OIDC como IAM identity provider, o pipeline troca seu token por credenciais temporárias com AssumeRoleWithWebIdentity, eliminando chaves de longa duracao. Instance profiles só se aplicam a recursos EC2 na AWS.",
        topic: "IAM - Federacao OIDC (Web Identity)",
        options: [
            [
                "Armazenar as chaves de acesso no AWS Secrets Manager e fazer o pipeline recupera-las a cada execução em vez de mante-las no sistema de CI.",
                false,
            ],
            [
                "Criar um usuário do IAM exclusivo para o pipeline, anexar as políticas necessarias e configurar a rotação automática das suas chaves de acesso para reduzir o risco de exposicao das credenciais de longa duracao.",
                false,
            ],
            [
                "Configurar o provedor OIDC como identity provider no IAM e permitir que o pipeline assuma uma role via AssumeRoleWithWebIdentity.",
                true,
            ],
            [
                "Compartilhar as credenciais de uma role de EC2 exportando-as do instance profile para o pipeline externo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa o AWS Organizations e quer impedir que administradores de qualquer conta membro desativem o AWS CloudTrail, o Amazon GuardDuty ou o AWS Config, mesmo que tenham permissões de administrador nessas contas. Qual abordagem atende a esse objetivo?",
        explanation:
            "Uma SCP funciona como teto de permissões e nega as acoes de desativacao dos serviços de segurança em todas as contas afetadas, sobrepondo-se até a permissões de administrador locais. Politicas de identidade por conta não garantem esse controle de forma centralizada.",
        topic: "AWS Organizations SCP - proteção de serviços de segurança",
        options: [
            [
                "Aplicar uma SCP as unidades organizacionais que negue acoes como cloudtrail:StopLogging, guardduty:DeleteDetector e config:DeleteConfigurationRecorder.",
                true,
            ],
            [
                "Editar a política de identidade de cada administrador em todas as contas membro para remover as permissões de desativar esses serviços e revisar periodicamente essas políticas para garantir que nenhuma nova permissão seja adicionada.",
                false,
            ],
            [
                "Habilitar o Block Public Access na organização para impedir alterações nos serviços de segurança pelas contas membro.",
                false,
            ],
            [
                "Mover todas as contas para uma única unidade organizacional e ativar a proteção contra exclusão no console do Organizations.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação web atras de um Application Load Balancer sofre tentativas de injeção de SQL e ataques que exploram vulnerabilidades comuns do OWASP Top 10. A equipe quer bloquear essas requisições maliciosas na camada de aplicação com o mínimo de esforço de manutenção. Qual solucao e a mais adequada?",
        explanation:
            "Os grupos de regras gerenciadas da AWS para o WAF cobrem SQL injection e vulnerabilidades comuns do OWASP e são mantidos pela AWS, exigindo pouco esforço. Shield Advanced foca em DDoS e security groups não inspecionam conteúdo HTTP.",
        topic: "AWS WAF - regras gerenciadas",
        options: [
            [
                "Habilitar o AWS Shield Advanced no ALB para inspecionar o conteúdo das requisições HTTP e bloquear payloads de injeção de SQL.",
                false,
            ],
            [
                "Configurar security groups no ALB que bloqueiem requisições contendo padrões de injeção de SQL na camada de rede.",
                false,
            ],
            [
                "Escrever e manter manualmente um conjunto de regras personalizadas do WAF que descrevam cada assinatura conhecida de injeção de SQL e de exploração do OWASP, atualizando-as sempre que surgir uma nova técnica de ataque.",
                false,
            ],
            [
                "Associar ao ALB uma web ACL do AWS WAF usando os grupos de regras gerenciadas para SQL injection e para o OWASP Top 10.",
                true,
            ],
        ],
    },
    {
        statement:
            "Durante um incidente, a equipe identifica um único endereço IP público de origem realizando atividade maliciosa contra instâncias em uma subnet. Ela precisa bloquear explicitamente todo o tráfego desse IP no nível da subnet, algo que os security groups não conseguem fazer. Qual recurso deve ser usado?",
        explanation:
            "Security groups só permitem regras de allow e não tem deny, então bloquear um IP específico exige uma regra Deny em uma Network ACL, que e stateless e avaliada no nível da subnet. Tabelas de rotas não filtram por origem.",
        topic: "VPC - Network ACL",
        options: [
            [
                "Adicionar uma regra de saída no security group das instâncias negando o tráfego destinado ao IP malicioso.",
                false,
            ],
            [
                "Adicionar uma regra de negação (Deny) para o IP de origem em uma Network ACL associada à subnet pública.",
                true,
            ],
            [
                "Criar uma regra de entrada no security group que negue explicitamente o tráfego vindo do IP malicioso.",
                false,
            ],
            [
                "Configurar uma rota na tabela de rotas da subnet apontando o IP de origem malicioso para uma interface de rede descartada, de modo que o tráfego desse endereço nunca alcance as instâncias.",
                false,
            ],
        ],
    },
    {
        statement:
            "Instancias EC2 em uma subnet privada acessam o S3 por um gateway endpoint. A equipe de segurança quer garantir que, por esse endpoint, as instâncias só consigam acessar um conjunto específico de buckets corporativos, bloqueando qualquer outro bucket do S3. Qual medida atende a esse requisito?",
        explanation:
            "A endpoint policy do gateway endpoint controla quais recursos do S3 podem ser acessados através dele, permitindo restringir a ARNs de buckets específicos. Security groups não se aplicam a gateway endpoints e faixas de IP não distinguem buckets.",
        topic: "VPC Endpoints - endpoint policy",
        options: [
            [
                "Anexar uma bucket policy a cada bucket corporativo, o que impede o acesso a qualquer outro bucket a partir do gateway endpoint.",
                false,
            ],
            [
                "Configurar security groups no endpoint restringindo o acesso apenas aos buckets corporativos permitidos.",
                false,
            ],
            [
                "Definir uma endpoint policy no gateway endpoint que permita acesso somente aos ARNs dos buckets corporativos.",
                true,
            ],
            [
                "Criar uma Network ACL na subnet privada com regras que permitam tráfego apenas para as faixas de endereços IP publicadas do serviço S3 correspondentes aos buckets corporativos autorizados.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer permitir que qualquer conta dentro da sua AWS Organizations acesse um tópico do Amazon SNS compartilhado, mas bloquear o acesso de qualquer conta externa. A empresa adiciona novas contas com frequência e não quer atualizar a política a cada nova conta. Qual abordagem atende a esse requisito?",
        explanation:
            "A chave de condicao global aws:PrincipalOrgID permite conceder acesso a todos os principais da organização em uma política baseada em recurso, sem listar contas individualmente nem atualizar a política quando novas contas entram. SCPs restringem permissões, não as concedem.",
        topic: "AWS Organizations - aws:PrincipalOrgID",
        options: [
            [
                "Usar uma política baseada em recurso no tópico com a condição aws:PrincipalOrgID igual ao ID da organização inteira.",
                true,
            ],
            [
                "Listar explicitamente o ID de cada conta membro na política do tópico e atualizá-la sempre que uma conta for adicionada.",
                false,
            ],
            [
                "Aplicar uma SCP na organização concedendo a todas as contas membro permissão de publicar no tópico SNS compartilhado.",
                false,
            ],
            [
                "Criar uma role do IAM em cada conta membro com permissão de acesso ao tópico e configurar uma automação que, a cada nova conta criada, provisione essa role e atualize as relações de confiança correspondentes.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa descobrir e classificar automaticamente dados sensiveis, como CPFs e números de cartao de credito, espalhados por centenas de buckets do S3, para atender a uma auditoria de privacidade. A solucao deve usar aprendizado de máquina e não exigir a construcao de scanners proprios. Qual serviço atende a esse objetivo?",
        explanation:
            "O Amazon Macie usa aprendizado de máquina e correspondência de padrões para descobrir e classificar dados sensiveis como PII em buckets do S3. Inspector foca em vulnerabilidades e GuardDuty em ameacas, não em classificacao de dados.",
        topic: "Amazon Macie",
        options: [
            [
                "Amazon Inspector, que varre os objetos dos buckets do S3 e classifica os dados sensiveis por tipo.",
                false,
            ],
            [
                "AWS Glue com um crawler configurado para percorrer todos os buckets, inferir o esquema dos arquivos e marcar as colunas que aparentam conter dados pessoais para posterior revisao manual.",
                false,
            ],
            [
                "Amazon GuardDuty, que analisa o conteúdo dos objetos do S3 e identifica informações pessoais identificaveis.",
                false,
            ],
            [
                "Amazon Macie, que usa aprendizado de máquina para descobrir e classificar dados sensiveis armazenados no S3.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de mensagens instantaneas atende usuários na America do Norte e na Europa e usa o Amazon DynamoDB. A empresa precisa de leituras e gravacoes com baixa latência nas duas regiões e que a aplicação continue funcionando mesmo se uma região inteira ficar indisponivel. Qual solucao atende a esses requisitos?",
        explanation:
            "O DynamoDB Global Tables mantem réplicas multirregiao ativo-ativo com replicação gerenciada, oferecendo leitura e escrita locais de baixa latência e resiliencia a falha de região. O DAX apenas acelera leituras em uma região e não réplica dados entre regiões.",
        topic: "DynamoDB Global Tables",
        options: [
            [
                "Criar uma tabela do DynamoDB em uma única região e distribuir o conteúdo globalmente com o Amazon CloudFront na frente da aplicação.",
                false,
            ],
            [
                "Habilitar o DynamoDB Accelerator (DAX) na região primária para reduzir a latência de leitura dos usuários das duas regiões.",
                false,
            ],
            [
                "Configurar o DynamoDB Global Tables com réplicas nas regiões da America do Norte e da Europa para replicação ativo-ativo.",
                true,
            ],
            [
                "Criar uma tabela em cada região e escrever um processo próprio com o DynamoDB Streams e o AWS Lambda para copiar todas as alterações entre elas continuamente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um desenvolvedor executou por engano um script que corrompeu milhares de itens de uma tabela do Amazon DynamoDB em produção que tem o point-in-time recovery (PITR) habilitado. A equipe percebeu o problema poucas horas depois e quer voltar a tabela ao estado imediatamente anterior ao script, com o menor esforço operacional. O que deve ser feito?",
        explanation:
            "O PITR mantem backups continuos e permite restaurar a tabela para qualquer segundo dos ultimos 35 dias, desde que já estivesse habilitado antes do incidente. Ativa-lo apos a corrupcao não recupera o estado anterior.",
        topic: "DynamoDB Point-in-Time Recovery",
        options: [
            [
                "Usar o point-in-time recovery para restaurar a tabela a um instante imediatamente anterior a execução do script.",
                true,
            ],
            [
                "Reprocessar as gravacoes do script em ordem inversa a partir do DynamoDB Streams para desfazer cada alteração item a item.",
                false,
            ],
            [
                "Recriar a tabela a partir do último snapshot manual e reaplicar apenas as gravacoes legitimas identificadas no AWS CloudTrail.",
                false,
            ],
            [
                "Ativar agora o point-in-time recovery e usa-lo para reverter as alterações que o script já fez nas ultimas horas.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma de negociacao financeira precisa distribuir milhoes de requisições por segundo com latência ultrabaixa sobre TCP. Ela também exige um endereço IP estático por zona de disponibilidade para constar na lista de permissões (allowlist) dos parceiros e precisa preservar o IP de origem dos clientes. Qual balanceador atende a esses requisitos?",
        explanation:
            "O Network Load Balancer atua na camada 4, escala para milhoes de requisições por segundo com latência muito baixa e oferece um IP estático por AZ, além de preservar o IP de origem. O Application Load Balancer opera na camada 7 e não fornece IP estático.",
        topic: "Network Load Balancer",
        options: [
            [
                "Application Load Balancer, pois opera na camada 7 e oferece o melhor desempenho para tráfego TCP de altíssimo volume com IP fixo.",
                false,
            ],
            [
                "Network Load Balancer, que opera na camada 4, sustenta altíssimo volume com baixa latência e fornece IP estático por zona.",
                true,
            ],
            [
                "Gateway Load Balancer, que distribui tráfego TCP em escala e expõe um IP estático para os parceiros incluirem em allowlist.",
                false,
            ],
            [
                "Classic Load Balancer, que suporta TCP e HTTP e permite associar um Elastic IP fixo a cada no para atender a exigencia dos parceiros.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer inserir appliances virtuais de firewall de um fornecedor terceiro no caminho do tráfego de rede da sua VPC, para inspecionar todos os pacotes. Ela precisa distribuir o tráfego entre uma frota desses appliances e escala-los de forma transparente, sem alterar as rotas dos aplicativos a cada mudanca. Qual serviço e o mais indicado?",
        explanation:
            "O Gateway Load Balancer foi feito para implantar, escalar e gerenciar appliances virtuais de terceiros como firewalls e IDS/IPS de forma transparente, encaminhando o tráfego com o protocolo GENEVE. Os demais balanceadores não inserem appliances de inspecao no caminho do tráfego.",
        topic: "Gateway Load Balancer",
        options: [
            [
                "Application Load Balancer com regras baseadas em host e caminho para encaminhar o tráfego às instâncias de firewall conforme a URL da requisição.",
                false,
            ],
            [
                "Network Load Balancer com verificações de integridade para enviar as conexões TCP dos clientes diretamente à frota de appliances de firewall.",
                false,
            ],
            [
                "Amazon Route 53 com roteamento ponderado para dividir o tráfego de inspeção igualmente entre os vários appliances virtuais de firewall.",
                false,
            ],
            [
                "Gateway Load Balancer, que implanta e escala appliances virtuais de terceiros de forma transparente com o protocolo GENEVE na porta 6081.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de e-commerce foi dividida em microsservicos. As requisições para /api/pagamentos devem ir para um conjunto de instâncias e as requisições para /api/catálogo para outro, tudo sob um único nome de domínio HTTPS. A equipe também quer que instâncias com falha sejam retiradas de rotação automaticamente. Qual solucao atende a isso?",
        explanation:
            "O Application Load Balancer roteia na camada 7 com regras baseadas em caminho e host e executa verificações de integridade por grupo de destino, retirando instâncias não saudaveis de rotação. O NLB opera na camada 4 e não enxerga o caminho da URL.",
        topic: "Application Load Balancer",
        options: [
            [
                "Usar um Network Load Balancer com um listener TCP e grupos de destino distintos por microsservico, roteando pelo conteúdo da URL de cada requisição.",
                false,
            ],
            [
                "Usar o Amazon Route 53 com roteamento baseado em latência para direcionar cada caminho de URL ao grupo de instâncias correspondente.",
                false,
            ],
            [
                "Usar um Application Load Balancer com regras de roteamento baseadas em caminho e verificações de integridade por grupo de destino.",
                true,
            ],
            [
                "Usar o Amazon CloudFront com múltiplos comportamentos de cache por caminho apontando para instâncias EC2 registradas manualmente como origens.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa implantou copias identicas da sua aplicação web em regiões nos Estados Unidos, na Irlanda e em Singapura. Ela quer que cada usuário seja direcionado automaticamente para a região que oferecer o menor tempo de resposta de rede. Qual política de roteamento do Amazon Route 53 atende a esse objetivo?",
        explanation:
            "O roteamento baseado em latência resolve o DNS para a região que oferece a menor latência de rede para o usuário, ideal quando há copias da aplicação em várias regiões. A geolocalizacao escolhe pela localizacao geografica, que nem sempre corresponde a menor latência.",
        topic: "Route 53 - Latency-Based Routing",
        options: [
            [
                "Roteamento baseado em latência, que envia o usuário para a região com a menor latência de rede medida.",
                true,
            ],
            ["Roteamento por geolocalizacao.", false],
            [
                "Roteamento ponderado, que distribui as requisições entre as regiões segundo pesos que a equipe define manualmente para cada endpoint.",
                false,
            ],
            [
                "Roteamento de failover, que mantem todo o tráfego na região primária e só usa as demais quando a verificação de integridade falha.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe quer lancar uma nova versão da aplicação de forma gradual. No início, apenas 5% do tráfego de produção deve ir para o novo conjunto de servidores e 95% deve continuar na versão atual, aumentando a proporcao aos poucos conforme a confianca na nova versão cresce. Qual política de roteamento do Amazon Route 53 e a mais adequada?",
        explanation:
            "O roteamento ponderado distribui o tráfego entre endpoints conforme pesos definidos, permitindo liberar uma fracao controlada para a nova versão e aumenta-la aos poucos, o que suporta implantacoes canario. As demais políticas não dividem o tráfego por proporcao configuravel.",
        topic: "Route 53 - Weighted Routing",
        options: [
            [
                "Roteamento baseado em latência, associando o novo ambiente a região de menor latência para receber uma fracao inicial pequena do tráfego.",
                false,
            ],
            [
                "Roteamento por geolocalizacao, liberando a nova versão primeiro para um pais específico antes de expandir para os demais gradualmente.",
                false,
            ],
            ["Roteamento de failover.", false],
            [
                "Roteamento ponderado, atribuindo peso 5 ao novo ambiente e peso 95 ao atual e aumentando os pesos gradualmente.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de streaming precisa, por questoes de licenciamento de conteúdo, servir usuários da Alemanha a partir de endpoints específicos e redirecionar o acesso de outros paises conforme os direitos de exibicao. As decisões devem se basear no pais de origem do usuário. Qual política de roteamento do Amazon Route 53 atende a esse requisito?",
        explanation:
            "O roteamento por geolocalizacao escolhe o endpoint com base na localizacao geografica (pais ou continente) da consulta DNS, adequado para restricoes de licenciamento e conformidade regional. Latencia e pesos não consideram o pais de origem.",
        topic: "Route 53 - Geolocation Routing",
        options: [
            ["Roteamento baseado em latência.", false],
            [
                "Roteamento por geolocalizacao, que direciona as respostas DNS conforme o pais ou continente de origem da consulta.",
                true,
            ],
            [
                "Roteamento ponderado, que separa o tráfego por pais ao atribuir pesos diferentes a cada endpoint regional de conteúdo.",
                false,
            ],
            [
                "Roteamento de múltiplos valores, que devolve vários endpoints saudaveis e deixa o cliente escolher o mais próximo do seu pais.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação usa vários servidores web com IPs públicos distintos. A equipe quer que o Amazon Route 53 retorne múltiplos endereços saudaveis nas consultas DNS, associando verificações de integridade a cada registro, para obter uma distribuição simples de carga com melhoria de disponibilidade, sem provisionar um balanceador de carga. Qual recurso atende a isso?",
        explanation:
            "O roteamento de múltiplos valores devolve até oito registros saudaveis por consulta e verifica a integridade de cada um, oferecendo uma distribuição simples e mais resiliente sem um balanceador de carga. O roteamento simples não faz verificação de integridade dos valores retornados.",
        topic: "Route 53 - Multivalue Answer Routing",
        options: [
            [
                "Roteamento de failover com um registro primário e um secundario, retornando o secundario apenas quando o primário fica não saudavel.",
                false,
            ],
            ["Roteamento simples com vários endereços IP em um único registro.", false],
            [
                "Roteamento de múltiplos valores (multivalue answer) com verificações de integridade associadas a cada registro.",
                true,
            ],
            [
                "Roteamento ponderado com pesos iguais em todos os registros e verificações de integridade para retirar endpoints não saudaveis das respostas.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema bancario processa transações que precisam ser tratadas exatamente na ordem em que foram enviadas por cada cliente, e nenhuma mensagem pode ser processada em duplicidade. A equipe quer desacoplar o produtor do consumidor com uma fila gerenciada. Qual solucao atende a esses requisitos?",
        explanation:
            "A fila SQS FIFO garante a ordem de entrega dentro de cada grupo de mensagens e o processamento exatamente uma vez, atendendo a requisitos de ordenação estrita e ausência de duplicatas. A fila padrão oferece apenas ordenação de melhor esforço e entrega pelo menos uma vez.",
        topic: "SQS FIFO",
        options: [
            [
                "Usar uma fila SQS FIFO, que preserva a ordem das mensagens e garante o processamento exatamente uma vez dentro de cada grupo de mensagens.",
                true,
            ],
            [
                "Usar uma fila SQS padrão e confiar na entrega ordenada de melhor esforço, adicionando um número de sequência em cada mensagem para o consumidor reordenar.",
                false,
            ],
            [
                "Usar um tópico do Amazon SNS padrão com uma assinatura de fila, aproveitando a ordenação total garantida pela entrega fan-out do SNS.",
                false,
            ],
            [
                "Usar uma fila SQS padrão com deduplicação ativada e o atributo de grupo de mensagens para manter a ordem por cliente durante o consumo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer construir uma arquitetura orientada a eventos em que mudancas de estado de vários serviços da AWS e eventos de aplicativos SaaS de parceiros sejam roteados para diferentes destinos, como funções Lambda, filas e Step Functions, com base em regras de correspondência de conteúdo. Qual serviço e o mais adequado?",
        explanation:
            "O Amazon EventBridge e um barramento de eventos serverless que recebe eventos de serviços da AWS, aplicativos proprios e parceiros SaaS e os roteia para vários destinos por meio de regras baseadas em conteúdo. Ele elimina a necessidade de os produtores conhecerem os consumidores.",
        topic: "Amazon EventBridge",
        options: [
            [
                "Amazon SQS, criando uma fila para cada destino e fazendo os produtores decidirem em qual fila publicar conforme o tipo de cada evento.",
                false,
            ],
            ["Amazon Kinesis Data Streams.", false],
            [
                "AWS Step Functions, definindo uma máquina de estado central que recebe todos os eventos e ramifica o fluxo para cada destino conforme o conteúdo.",
                false,
            ],
            [
                "Amazon EventBridge, usando um barramento de eventos com regras que filtram por conteúdo e roteiam para múltiplos destinos.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa de uma estratégia de disaster recovery para uma aplicação critica com RTO de poucos minutos. A restricao e o custo: manter uma copia identica em escala total em outra região o tempo todo e caro demais. A empresa aceita manter uma versão reduzida, porem totalmente funcional, sempre em execução na região secundaria, pronta para escalar. Qual estratégia descreve essa abordagem?",
        explanation:
            "No warm standby, uma copia funcional em escala reduzida da aplicação fica sempre em execução na região secundaria e e ampliada durante o failover, equilibrando custo e RTO baixo. No pilot light, os servidores de aplicação não ficam ativos até o desastre.",
        topic: "Disaster Recovery - Warm Standby",
        options: [
            ["Backup e restauracao (backup and restore).", false],
            [
                "Warm standby, com uma versão reduzida e funcional da aplicação sempre ativa na região secundaria, escalada no failover.",
                true,
            ],
            [
                "Pilot light, em que apenas o banco de dados fica replicado e ativo e nenhum servidor de aplicação permanece em execução até o failover ocorrer.",
                false,
            ],
            [
                "Multi-site ativo-ativo, com a infraestrutura completa processando tráfego de produção nas duas regiões simultaneamente o tempo todo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação interna de baixa criticidade pode tolerar várias horas de indisponibilidade e a perda de algumas horas de dados em caso de desastre regional. A empresa quer a estratégia de disaster recovery de menor custo possível. Qual abordagem atende a esse objetivo?",
        explanation:
            "A estratégia de backup e restauracao tem o menor custo porque nenhuma infraestrutura de recuperação fica em execução até o desastre, ao preco de um RTO e um RPO mais altos, aceitaveis para cargas de baixa criticidade. As demais mantem recursos ativos e custam mais.",
        topic: "Disaster Recovery - Backup and Restore",
        options: [
            [
                "Warm standby, mantendo uma versão reduzida da aplicação sempre em execução na região secundaria para reduzir o tempo de recuperação.",
                false,
            ],
            [
                "Pilot light, deixando o banco de dados continuamente replicado e ativo na região secundaria.",
                false,
            ],
            [
                "Backup e restauracao, copiando dados e imagens para outra região e provisionando a infraestrutura apenas durante o desastre.",
                true,
            ],
            [
                "Multi-site ativo-ativo, distribuindo o tráfego de produção entre duas regiões o tempo todo para eliminar qualquer tempo de recuperação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa esta migrando aplicações Windows legadas para a AWS. Essas aplicações precisam de um sistema de arquivos compartilhado que use o protocolo SMB, ofereça compatibilidade com NTFS e se integre ao Active Directory existente para controle de permissões. Qual serviço atende a esses requisitos?",
        explanation:
            "O Amazon FSx for Windows File Server oferece compartilhamentos de arquivos SMB totalmente gerenciados, com compatibilidade NTFS e integração nativa ao Active Directory, ideal para aplicações Windows. O EFS usa NFS e o FSx for Lustre e voltado a HPC.",
        topic: "FSx for Windows File Server",
        options: [
            [
                "Amazon FSx for Windows File Server, que fornece compartilhamentos SMB totalmente gerenciados com integração ao Active Directory.",
                true,
            ],
            [
                "Amazon EFS, que oferece um sistema de arquivos elastico compartilhado por NFS e se integra ao Active Directory para permissões NTFS.",
                false,
            ],
            [
                "Amazon FSx for Lustre, que entrega um sistema de arquivos de alto desempenho via SMB otimizado para cargas de trabalho Windows corporativas.",
                false,
            ],
            [
                "Amazon S3 montado como unidade de rede nas instâncias Windows, usando SMB e as permissões de grupos e usuários do Active Directory.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe precisa de um sistema de arquivos NFS compartilhado por instâncias EC2 distribuidas em três zonas de disponibilidade. O requisito principal e que os dados permanecam acessíveis mesmo que uma zona de disponibilidade inteira fique indisponivel. Qual configuração do Amazon EFS atende a isso?",
        explanation:
            "A classe de armazenamento EFS Standard e regional e armazena os dados de forma redundante em várias zonas de disponibilidade, mantendo o acesso mesmo com a falha de uma zona inteira. A classe One Zone guarda os dados em uma única zona e não sobrevive a perda dela.",
        topic: "Amazon EFS - Storage Classes",
        options: [
            [
                "Uma classe de armazenamento EFS One Zone, que réplica os dados dentro de uma única zona e alcanca o menor custo mantendo alta disponibilidade regional.",
                false,
            ],
            [
                "Um volume Amazon EBS Multi-Attach compartilhado simultaneamente pelas instâncias EC2 das três zonas de disponibilidade por meio do protocolo NFS.",
                false,
            ],
            [
                "Varios sistemas EFS One Zone, um por zona, sincronizados entre si com uma tarefa do AWS DataSync executada a cada poucos minutos.",
                false,
            ],
            [
                "Um sistema de arquivos EFS com classe de armazenamento Standard (regional), que armazena os dados de forma redundante em várias zonas.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa roda o Amazon RDS for PostgreSQL na região us-east-1. Ela quer melhorar a resiliencia a uma falha regional e, ao mesmo tempo, oferecer leituras de baixa latência a usuários na Europa. A solucao deve permitir a promocao do recurso na segunda região para banco principal em caso de desastre. O que a equipe deve implementar?",
        explanation:
            "Uma réplica de leitura entre regiões réplica os dados de forma assíncrona para a Europa, atende leituras locais com baixa latência e pode ser promovida a banco principal em um desastre regional. O RDS Multi-AZ mantem o standby na mesma região, não em outra.",
        topic: "RDS Cross-Region Read Replica",
        options: [
            [
                "Uma instância RDS Multi-AZ, que mantem um standby síncrono em outra região e o promove automaticamente durante uma falha regional.",
                false,
            ],
            [
                "Snapshots automáticos copiados para a região europeia a cada 24 horas, restaurados como um novo banco de dados sempre que a região primária falhar.",
                false,
            ],
            [
                "Uma réplica de leitura entre regiões (cross-region read réplica) na Europa, que serve leituras locais e pode ser promovida a principal.",
                true,
            ],
            [
                "O Amazon RDS Proxy configurado na região europeia para rotear as leituras dos usuários locais diretamente ao banco de dados primário em us-east-1.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação usa um cluster Amazon Aurora e enfrenta picos imprevisiveis de tráfego de leitura que as vezes sobrecarregam as réplicas existentes, degradando o desempenho das consultas. A equipe quer que a capacidade de leitura acompanhe a demanda automaticamente, sem intervencao manual. O que deve ser configurado?",
        explanation:
            "O Aurora Replica Auto Scaling adiciona ou remove réplicas de leitura automaticamente com base em uma métrica de destino, como CPU ou número de conexões, acompanhando picos imprevisiveis de leitura. O Global Database serve disaster recovery entre regiões, não escalonamento automático local.",
        topic: "Aurora Replica Auto Scaling",
        options: [
            [
                "Habilitar o Aurora Global Database para adicionar réplicas de leitura em outra região sempre que o uso de CPU das réplicas locais aumentar.",
                false,
            ],
            [
                "Configurar o Aurora Replica Auto Scaling para adicionar e remover réplicas conforme uma métrica de destino, como a utilização média de CPU.",
                true,
            ],
            [
                "Aumentar manualmente a classe de instância do escritor do Aurora para uma maior, de modo que ele também absorva o tráfego de leitura nos picos.",
                false,
            ],
            [
                "Ativar o Amazon RDS Multi-AZ no cluster para que a instância standby passe a atender parte das consultas de leitura durante os períodos de pico.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um grupo do Amazon EC2 Auto Scaling esta atras de um Application Load Balancer. Algumas instâncias continuam em execução, e por isso passam na verificação de status do EC2, mas o processo da aplicação travou e elas não respondem mais as requisições. A equipe quer que o Auto Scaling substitua automaticamente essas instâncias. O que deve ser feito?",
        explanation:
            "Ao ativar o tipo de verificação de integridade do ELB, o Auto Scaling passa a considerar não saudaveis as instâncias reprovadas na verificação do balanceador e as substitui, mesmo que a verificação de status do EC2 esteja passando. A verificação do EC2 sozinha não detecta falhas no nível da aplicação.",
        topic: "EC2 Auto Scaling - Health Checks",
        options: [
            [
                "Ativar as verificações de integridade do Elastic Load Balancing no grupo de Auto Scaling para que instâncias reprovadas sejam substituidas.",
                true,
            ],
            [
                "Reduzir o período de carencia (health check grace period) do grupo para zero, forcando o Auto Scaling a reavaliar e reiniciar as instâncias com mais frequência.",
                false,
            ],
            [
                "Depender apenas das verificações de status do EC2, que já detectam falhas do sistema operacional e do processo da aplicação em cada instância.",
                false,
            ],
            [
                "Criar um alarme do Amazon CloudWatch de CPU alta e associa-lo a uma política de scaling para trocar as instâncias que não respondem as requisições.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma plataforma publica todos os eventos de pedidos em um único tópico do Amazon SNS com várias assinaturas. Cada consumidor, porem, só deve receber um subconjunto dos eventos: um processa apenas pedidos acima de determinado valor e outro apenas pedidos de certas regiões. A equipe quer evitar que cada consumidor receba tudo e descarte o que não interessa. Qual recurso resolve isso?",
        explanation:
            "As políticas de filtro do Amazon SNS avaliam os atributos de cada mensagem por assinatura, entregando a cada consumidor apenas os eventos relevantes sem código adicional. Criar um tópico por tipo aumenta o acoplamento e a complexidade no produtor.",
        topic: "SNS Message Filtering",
        options: [
            [
                "Publicar os eventos em uma fila SQS FIFO com grupos de mensagens distintos e deixar cada consumidor ler somente o seu grupo de mensagens.",
                false,
            ],
            [
                "Criar um tópico do SNS separado para cada tipo de evento e fazer o produtor decidir em qual tópico publicar conforme os atributos de cada pedido.",
                false,
            ],
            [
                "Aplicar políticas de filtro (filter policies) nas assinaturas do SNS, baseadas nos atributos de mensagem que identificam cada tipo de evento.",
                true,
            ],
            [
                "Encaminhar todos os eventos para uma função AWS Lambda que inspeciona cada mensagem e a redireciona ao consumidor certo conforme o conteúdo.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe armazena logs de clickstream comprimidos em um bucket do Amazon S3 e precisa executar consultas SQL ad hoc esporádicas sobre esses dados, sem provisionar nem gerenciar servidores e pagando apenas pelo que consultar. Qual solução atende melhor a esse requisito?",
        explanation:
            "O Amazon Athena é serverless e consulta dados diretamente no S3 com SQL padrão, cobrando pelos dados lidos em cada consulta, ideal para análises ad hoc esporádicas sem infraestrutura para gerenciar.",
        topic: "Amazon Athena",
        options: [
            [
                "Provisionar um cluster Amazon Redshift, carregar os logs com COPY a partir do S3 e manter o cluster ligado para atender às consultas ocasionais.",
                false,
            ],
            [
                "Usar o Amazon Athena para consultar os arquivos diretamente no Amazon S3 com SQL, pagando apenas pelos dados lidos em cada consulta.",
                true,
            ],
            [
                "Criar um cluster Amazon EMR com Hive e mantê-lo sempre em execução para responder às consultas quando surgirem.",
                false,
            ],
            [
                "Importar os arquivos para um banco Amazon RDS for MySQL em uma instância grande e consultar por SQL.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de operações quer centralizar logs de aplicações e servidores para fazer busca por texto completo, montar painéis e investigar incidentes com análise quase em tempo real. Qual solução atende melhor a essa necessidade?",
        explanation:
            "O Amazon OpenSearch Service indexa logs para busca de texto completo e análise operacional quase em tempo real, com o OpenSearch Dashboards integrado, algo que datastores relacionais ou consultas ad hoc no S3 não entregam com a mesma latência interativa.",
        topic: "Amazon OpenSearch Service",
        options: [
            [
                "Carregar continuamente os logs em um cluster Amazon Redshift dedicado e criar consultas SQL agendadas com visualizações no Amazon QuickSight para investigar cada incidente.",
                false,
            ],
            [
                "Guardar os logs no Amazon S3 e usar o Amazon Athena para buscas por texto sempre que houver um incidente.",
                false,
            ],
            [
                "Enviar os logs para um banco Amazon RDS e criar índices de texto para permitir a busca das equipes de operação.",
                false,
            ],
            [
                "Ingerir os logs no Amazon OpenSearch Service e usar o OpenSearch Dashboards para busca de texto completo e análise quase em tempo real.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação tem uma carga de banco de dados relacional com demanda imprevisível e que varia bruscamente ao longo do dia. A equipe quer que a capacidade escale automaticamente e pagar pelo que for consumido, sem ficar redimensionando instâncias. O que recomendar?",
        explanation:
            "O Aurora Serverless v2 ajusta a capacidade de forma fina e automática (em ACUs) acompanhando cargas imprevisíveis e variáveis, evitando pagar por uma instância dimensionada para o pico o tempo todo.",
        topic: "Amazon Aurora Serverless v2",
        options: [
            [
                "Usar o Amazon Aurora Serverless v2, que ajusta a capacidade automaticamente conforme a carga e cobra pelo que é consumido.",
                true,
            ],
            [
                "Provisionar uma instância Amazon Aurora dimensionada para o pico previsto e mantê-la ligada o tempo todo para suportar todas as variações de demanda.",
                false,
            ],
            [
                "Usar o Amazon RDS for MySQL e alterar manualmente a classe da instância sempre que a demanda mudar ao longo do dia.",
                false,
            ],
            [
                "Migrar a aplicação para o Amazon DynamoDB no modo sob demanda para acompanhar a variação de tráfego automaticamente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação de processamento precisa de uma camada de armazenamento local com a menor latência e o maior número de IOPS possível para dados temporários que podem ser recriados e não precisam sobreviver à parada da instância. Qual opção oferece o melhor desempenho para esse caso?",
        explanation:
            "O instance store oferece armazenamento NVMe local com a menor latência e o maior IOPS, sem custo adicional de armazenamento, e é ideal para dados temporários que podem ser recriados, já que não persiste quando a instância para ou é encerrada.",
        topic: "Amazon EC2 Instance Store",
        options: [
            [
                "Anexar um volume Amazon EBS io2 Block Express e habilitar o Multi-Attach para obter a menor latência possível para os dados temporários entre as instâncias.",
                false,
            ],
            [
                "Usar o Amazon EFS montado nas instâncias para armazenar os dados temporários com alto desempenho compartilhado.",
                false,
            ],
            [
                "Usar o armazenamento de instância (instance store) NVMe local das instâncias EC2 para os dados temporários que podem ser recriados.",
                true,
            ],
            [
                "Anexar volumes Amazon EBS gp3 e aumentar os IOPS e o throughput provisionados para atender à necessidade de baixa latência.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação envia objetos de vários gigabytes para o Amazon S3 por uma rede instável, e as transferências às vezes falham perto do fim e recomeçam do zero. A equipe quer uploads mais rápidos e resilientes desses arquivos grandes. Qual abordagem resolve isso?",
        explanation:
            "O multipart upload divide o objeto em partes enviadas em paralelo e permite reenviar somente as partes que falharam, aumentando a velocidade e a resiliência dos uploads de arquivos grandes.",
        topic: "Amazon S3 (multipart upload)",
        options: [
            [
                "Aumentar o tempo limite do cliente e reenviar o objeto inteiro em uma única operação PUT toda vez que a transferência for interrompida perto do fim.",
                false,
            ],
            [
                "Usar o multipart upload do Amazon S3 para enviar o objeto em partes paralelas, reenviando apenas as partes que falharem.",
                true,
            ],
            [
                "Habilitar o S3 Transfer Acceleration para que o objeto seja enviado por uma única conexão otimizada de longa distância.",
                false,
            ],
            [
                "Solicitar um dispositivo AWS Snowball e transferir os arquivos grandes fisicamente para contornar as falhas de rede.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está migrando aplicações Windows que dependem de um compartilhamento de arquivos SMB integrado ao Active Directory, com permissões NTFS. Ela quer um armazenamento de arquivos totalmente gerenciado e de alto desempenho. Qual serviço atende melhor?",
        explanation:
            "O Amazon FSx for Windows File Server entrega compartilhamento de arquivos SMB totalmente gerenciado, com integração ao Active Directory e ACLs do Windows, ideal para aplicações Windows, enquanto o EFS atende cargas Linux via NFS.",
        topic: "Amazon FSx for Windows File Server",
        options: [
            [
                "Provisionar um Amazon EFS e montá-lo nas instâncias Windows para fornecer o compartilhamento de arquivos via NFS.",
                false,
            ],
            [
                "Armazenar os arquivos no Amazon S3 e acessá-los como um compartilhamento de rede a partir das aplicações Windows.",
                false,
            ],
            [
                "Configurar um servidor de arquivos Windows autogerenciado em instâncias EC2, com replicação entre zonas e uma rotina de backups própria.",
                false,
            ],
            [
                "Usar o Amazon FSx for Windows File Server, que oferece armazenamento SMB gerenciado integrado ao Active Directory.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação ingere um fluxo de eventos em alto volume que precisa ser consumido simultaneamente por várias aplicações independentes, com possibilidade de reprocessar os dados dentro de um período de retenção e realizar processamento personalizado em tempo real. Qual serviço atende melhor?",
        explanation:
            "O Kinesis Data Streams mantém os registros por um período de retenção e permite que vários consumidores independentes leiam e reprocessem os mesmos dados com processamento personalizado, enquanto o Firehose apenas entrega os dados a destinos, sem releitura por múltiplos consumidores.",
        topic: "Amazon Kinesis (Data Streams x Firehose)",
        options: [
            [
                "Usar o Amazon Kinesis Data Firehose para entregar os eventos automaticamente a um bucket do Amazon S3 e reprocessá-los de lá quando for necessário.",
                false,
            ],
            [
                "Usar uma fila do Amazon SQS para distribuir os eventos, permitindo que várias aplicações os consumam e reprocessem quando quiserem.",
                false,
            ],
            [
                "Usar o Amazon Kinesis Data Streams, que permite múltiplos consumidores independentes e a releitura dos dados dentro do período de retenção.",
                true,
            ],
            [
                "Usar o Amazon Kinesis Data Firehose com transformação por Lambda para que cada aplicação leia o stream de forma independente e em tempo real.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação usa um cache em memória para dados de sessão e exige alta disponibilidade, com replicação e failover automático entre zonas para que a falha de um nó não descarte todos os dados em cache. Qual opção atende a esses requisitos?",
        explanation:
            "Para alta disponibilidade com replicação e failover automático entre zonas, o ElastiCache for Redis é a escolha; o Memcached não oferece replicação nem failover nativos e perde os dados quando um nó falha.",
        topic: "Amazon ElastiCache (Redis x Memcached)",
        options: [
            [
                "Usar o Amazon ElastiCache for Redis, que oferece réplicas de leitura, failover automático entre zonas e alta disponibilidade dos dados em cache.",
                true,
            ],
            [
                "Usar o Amazon ElastiCache for Memcached, que fornece replicação entre nós, failover automático e alta disponibilidade nativa para os dados em cache.",
                false,
            ],
            [
                "Usar o Amazon ElastiCache for Memcached e distribuir os dados por vários nós, aceitando a perda das sessões quando um nó falhar.",
                false,
            ],
            [
                "Instalar o Memcached em instâncias EC2 em zonas diferentes e implementar a replicação e o failover manualmente na aplicação.",
                false,
            ],
        ],
    },
    {
        statement:
            "Um sistema de arquivos Amazon EFS atende uma carga analítica crescente com muitos clientes EC2 em paralelo e sofre limitação de throughput nos picos, porque esgota os créditos do modo Bursting. A equipe quer throughput alto e consistente que acompanhe a demanda sem gerenciar capacidade. O que fazer?",
        explanation:
            "O modo Elastic Throughput do Amazon EFS escala a taxa de transferência automaticamente para atender a picos imprevisíveis e cobra pelo uso, resolvendo o esgotamento de créditos do modo Bursting; o modo de desempenho Max I/O trata de IOPS e latência, não do limite de throughput.",
        topic: "Amazon EFS (modos de throughput)",
        options: [
            [
                "Aumentar a quantidade de dados armazenados no sistema de arquivos para acumular mais créditos de burst e sustentar os picos de throughput ao longo do dia.",
                false,
            ],
            [
                "Alterar o sistema de arquivos para o modo de throughput Elástico (Elastic Throughput), que escala automaticamente conforme a demanda.",
                true,
            ],
            [
                "Mudar o modo de desempenho do sistema de arquivos para Max I/O a fim de remover o limite de throughput durante os picos.",
                false,
            ],
            [
                "Migrar os dados para volumes Amazon EBS gp3 anexados a cada instância para eliminar o compartilhamento do sistema de arquivos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe executa o treinamento de modelos de deep learning, fortemente dependente de cálculos matriciais paralelos, e quer reduzir o tempo de treinamento. Qual tipo de instância EC2 é o mais adequado?",
        explanation:
            "O treinamento de deep learning depende de processamento paralelo massivo, no qual as GPUs das instâncias de computação acelerada (por exemplo, a família P) superam de longe as famílias baseadas apenas em CPU.",
        topic: "Amazon EC2 (computação acelerada com GPU)",
        options: [
            ["Usar instâncias da família otimizada para computação (família C).", false],
            [
                "Usar instâncias da família otimizada para memória (família R) para manter todo o conjunto de dados em memória durante o treinamento.",
                false,
            ],
            [
                "Usar instâncias de propósito geral (família M) e aumentar o número de instâncias no cluster para paralelizar o treinamento.",
                false,
            ],
            [
                "Usar instâncias com GPU da família de computação acelerada (como a família P) para o treinamento de deep learning.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa vai assumir um compromisso de 3 anos com Savings Plans, mas planeja modernizar os workloads: migrar parte para o AWS Fargate e o AWS Lambda e trocar as famílias de instâncias EC2 ao longo do tempo. Ela quer que o desconto continue se aplicando automaticamente conforme o uso muda. Qual opção escolher?",
        explanation:
            "O Compute Savings Plans oferece a maior flexibilidade: o desconto acompanha mudanças de família, tamanho, região, sistema operacional e locação de EC2 e ainda cobre o AWS Fargate e o AWS Lambda, ideal para quem vai modernizar os workloads.",
        topic: "AWS Savings Plans",
        options: [
            [
                "Comprar EC2 Instance Savings Plans para a família de instâncias atual, aproveitando o maior desconto possível mesmo com as futuras mudanças de família e a adoção do Fargate.",
                false,
            ],
            [
                "Comprar Standard Reserved Instances para as instâncias atuais e revendê-las no marketplace quando os workloads migrarem para contêineres e funções.",
                false,
            ],
            [
                "Comprar Compute Savings Plans, cujo desconto se aplica automaticamente a EC2 de qualquer família e região e também ao Fargate e ao Lambda.",
                true,
            ],
            [
                "Continuar em On-Demand até concluir toda a modernização e só então avaliar algum compromisso de longo prazo.",
                false,
            ],
        ],
    },
    {
        statement:
            "O time financeiro quer ser avisado automaticamente quando houver um aumento incomum e inesperado no gasto da AWS, por exemplo por uma configuração equivocada que dispare custos, usando detecção baseada em aprendizado de máquina em vez de acompanhar painéis manualmente. Qual serviço atende melhor?",
        explanation:
            "O AWS Cost Anomaly Detection aplica aprendizado de máquina para identificar aumentos incomuns de gasto e alertar automaticamente, diferentemente do AWS Budgets, que dispara apenas quando um limite previamente definido é ultrapassado.",
        topic: "AWS Cost Anomaly Detection",
        options: [
            [
                "Ativar o AWS Cost Anomaly Detection, que usa aprendizado de máquina para detectar gastos anômalos e enviar alertas automaticamente.",
                true,
            ],
            [
                "Configurar o AWS Cost Explorer para revisar manualmente os relatórios de gasto todos os dias e identificar variações fora do padrão.",
                false,
            ],
            [
                "Criar um AWS Budget com um limite fixo de gasto mensal e receber um alerta somente quando esse valor for ultrapassado.",
                false,
            ],
            [
                "Consultar o AWS Trusted Advisor periodicamente em busca de recomendações de redução de custo nos recursos ociosos.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa com centenas de buckets do Amazon S3 distribuídos em várias contas de uma organização quer visibilidade do uso e das tendências de armazenamento em toda a organização, além de recomendações acionáveis para otimizar custos. Qual recurso atende melhor?",
        explanation:
            "O S3 Storage Lens oferece um painel com métricas de uso e atividade e recomendações acionáveis de otimização de custo em todas as contas e buckets da organização, algo que o S3 Inventory ou métricas isoladas por bucket não entregam.",
        topic: "Amazon S3 Storage Lens",
        options: [
            [
                "Habilitar o Amazon S3 Inventory em cada bucket para gerar listas de objetos e analisar manualmente onde é possível economizar.",
                false,
            ],
            [
                "Usar o AWS Cost Explorer filtrando por Amazon S3 para ver o gasto total do serviço mês a mês em toda a organização.",
                false,
            ],
            [
                "Ativar o Amazon S3 Storage Lens para obter visibilidade e recomendações de otimização do armazenamento em toda a organização.",
                true,
            ],
            [
                "Criar métricas do Amazon CloudWatch por bucket e montar painéis individuais para acompanhar o uso de cada um separadamente.",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma conta de desenvolvimento, uma empresa quer não apenas ser alertada, mas executar automaticamente uma ação, como aplicar uma policy restritiva ou parar instâncias EC2, quando o gasto ultrapassar um limite definido, evitando estouros de custo. O que usar?",
        explanation:
            "As ações do AWS Budgets (budget actions) executam automaticamente respostas como aplicar uma policy restritiva do IAM ou parar instâncias EC2 quando o gasto atinge o limite definido, evitando estouros sem intervenção manual.",
        topic: "AWS Budgets",
        options: [
            [
                "Configurar o AWS Cost Anomaly Detection para detectar o excesso de gasto e depender da equipe para desligar os recursos manualmente depois do alerta.",
                false,
            ],
            [
                "Usar o AWS Cost Explorer para acompanhar o gasto do ambiente de desenvolvimento e revisar os recursos ao final de cada mês.",
                false,
            ],
            [
                "Habilitar o AWS Trusted Advisor para receber recomendações sobre instâncias ociosas na conta de desenvolvimento.",
                false,
            ],
            [
                "Criar um AWS Budget com ações que apliquem automaticamente uma policy restritiva ou parem instâncias ao atingir o limite.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa arquiva imagens médicas acessadas muito raramente, talvez uma ou duas vezes por ano, mas que, quando solicitadas, precisam ser recuperadas em milissegundos. Ela quer o menor custo de armazenamento possível mantendo o acesso instantâneo. Qual classe do Amazon S3 usar?",
        explanation:
            "O S3 Glacier Instant Retrieval tem custo de armazenamento bem menor que o Standard-IA para dados acessados apenas uma ou duas vezes ao ano, mantendo recuperação em milissegundos, enquanto o Deep Archive economizaria mais, mas leva horas para recuperar.",
        topic: "Amazon S3 Glacier Instant Retrieval",
        options: [
            [
                "Usar a classe S3 Glacier Instant Retrieval, que tem custo de armazenamento baixo e ainda permite acesso em milissegundos.",
                true,
            ],
            [
                "Usar a classe S3 Glacier Deep Archive, que oferece o menor custo de armazenamento, aceitando a recuperação em várias horas quando os dados forem necessários.",
                false,
            ],
            [
                "Usar a classe S3 Standard-IA, que mantém o acesso imediato, ainda que o custo de armazenamento seja mais alto do que o necessário para dados tão raramente acessados.",
                false,
            ],
            [
                "Usar a classe S3 Standard e criar uma regra de lifecycle para excluir os arquivos após um ano sem acesso.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma frota de volumes Amazon EBS gp2 entrega desempenho adequado, mas o time financeiro quer reduzir o custo de EBS sem perder desempenho. Qual é a forma mais direta de conseguir isso?",
        explanation:
            "O gp3 custa cerca de 20% menos por GB que o gp2 e permite configurar IOPS e throughput de forma independente do tamanho, sendo a maneira direta de reduzir o custo de EBS sem perder desempenho.",
        topic: "Amazon EBS gp3 (otimização de custo)",
        options: [
            ["Migrar os volumes para o tipo io2.", false],
            [
                "Migrar os volumes gp2 para gp3, que custa cerca de 20% menos por GB e mantém o desempenho necessário.",
                true,
            ],
            [
                "Migrar os volumes para o tipo st1 (HDD otimizado para throughput) para reduzir o custo por GB armazenado.",
                false,
            ],
            [
                "Reduzir o tamanho de cada volume gp2 pela metade para diminuir o custo, ainda que isso limite a capacidade disponível.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa executa uma grande frota de instâncias EC2 x86 para um workload cujos runtimes são compatíveis com ARM, como Java, Go e contêineres, e quer melhor relação preço-desempenho, reduzindo custos sem um grande redesenho. O que recomendar?",
        explanation:
            "As instâncias baseadas em AWS Graviton (ARM) entregam melhor relação preço-desempenho que as equivalentes x86 para cargas compatíveis, reduzindo o custo sem sacrificar desempenho, muitas vezes com pouca ou nenhuma alteração na aplicação.",
        topic: "AWS Graviton",
        options: [
            [
                "Migrar para instâncias x86 de última geração e maiores para melhorar o desempenho, ainda que o custo por hora aumente proporcionalmente à capacidade.",
                false,
            ],
            [
                "Mover toda a frota para instâncias Spot x86 para reduzir o custo, aceitando que qualquer instância possa ser interrompida a qualquer momento.",
                false,
            ],
            [
                "Migrar a frota para instâncias baseadas em AWS Graviton (ARM), que oferecem melhor relação preço-desempenho para cargas compatíveis.",
                true,
            ],
            [
                "Adquirir Dedicated Hosts para a frota atual a fim de obter previsibilidade de custo por servidor físico dedicado.",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma camada de processamento web sem estado e tolerante a falhas roda atrás de um grupo de Auto Scaling. A empresa quer reduzir bastante o custo mantendo uma base de capacidade confiável, mesmo que ocorram interrupções de capacidade. Qual abordagem é a mais adequada?",
        explanation:
            "A política de instâncias mistas do EC2 Auto Scaling combina uma base garantida em On-Demand com instâncias Spot para a expansão, reduzindo o custo de forma expressiva sem arriscar toda a capacidade em uma interrupção de Spot.",
        topic: "Amazon EC2 Auto Scaling (instâncias mistas com Spot)",
        options: [
            [
                "Executar todo o grupo com instâncias On-Demand para garantir capacidade e comprar Reserved Instances para cobrir a frota inteira durante todo o período.",
                false,
            ],
            [
                "Executar todo o grupo exclusivamente com instâncias Spot para obter o menor custo, aceitando o risco de perder toda a capacidade em uma interrupção.",
                false,
            ],
            [
                "Migrar a camada para Dedicated Hosts para reduzir o custo por meio do isolamento físico do hardware.",
                false,
            ],
            [
                "Usar um grupo de Auto Scaling com política de instâncias mistas, combinando uma base On-Demand com Spot para a expansão.",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma empresa serve downloads estáticos grandes, como instaladores e mídia, diretamente do Amazon S3 para um público global, e a conta mensal de transferência de dados de saída está alta. O time financeiro quer reduzir esse custo. Qual solução recomendar?",
        explanation:
            "O Amazon CloudFront reduz o custo de transferência ao servir conteúdo em cache a partir das bordas, diminuindo as buscas na origem, e por ter preços de saída para a internet menores que os do S3; a transferência da origem AWS para o CloudFront não é cobrada.",
        topic: "Amazon CloudFront (otimização de custo de transferência)",
        options: [
            [
                "Ativar o S3 Transfer Acceleration no bucket de origem para que os downloads dos usuários fiquem mais baratos e mais rápidos.",
                false,
            ],
            [
                "Distribuir o conteúdo por meio do Amazon CloudFront, cujo cache nas bordas e preços de transferência reduzem o custo de saída de dados.",
                true,
            ],
            [
                "Contratar o AWS Direct Connect para reduzir o custo de transferência dos downloads entregues aos usuários pela internet.",
                false,
            ],
            [
                "Aumentar o tamanho das instâncias EC2 que servem os downloads e adicionar mais réplicas em outras zonas de disponibilidade para melhorar a entrega e diminuir o custo por download entregue aos usuários.",
                false,
            ],
        ],
    },
];
