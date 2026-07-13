// Seed do simulado AWS Certified Solutions Architect Associate (SAA-C03). Idempotente:
// se o simulado ja tiver questoes, nao faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-saa-c03.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-saa-c03.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "saa-c03";

type Questao = { statement: string; explanation: string; topic: string; options: [string, boolean][] };

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma fintech precisa criptografar arquivos de backup de vários gigabytes antes de armazená-los. A operação Encrypt da API do AWS KMS aceita no máximo 4 KB de dados por chamada, o que inviabiliza cifrar o arquivo inteiro diretamente. Qual abordagem resolve o cenário usando o próprio KMS?",
        explanation:
            "O padrão de envelope encryption usa GenerateDataKey: o KMS retorna a chave em texto claro, usada para cifrar o arquivo localmente sem limite de tamanho, e a mesma chave já cifrada por uma CMK, guardada junto do arquivo para uso posterior em Decrypt. Fatiar o arquivo em blocos não contorna o limite, porque cada chamada de Encrypt continua restrita a 4 KB de dados, então blocos maiores ainda falhariam. A SSE-S3 cifra objetos no S3 com chaves geridas pelo próprio S3, não pelo KMS, e não se aplica a um arquivo antes do upload. O limite de 4 KB da operação Encrypt é uma característica fixa do serviço e não é alterado por caso de suporte.",
        topic: "AWS KMS - envelope encryption",
        options: [
            ["Dividir o arquivo em blocos de 4 KB, pois o Encrypt do KMS soma o total processado.", false],
            ["Usar GenerateDataKey para gerar uma data key e cifrar o arquivo localmente com ela.", true],
            ["Ativar a SSE-S3 no bucket de destino, já que ela reaproveita as chaves do KMS automaticamente.", false],
            ["Abrir um caso de suporte, pois o limite de 4 KB do Encrypt pode ser ampliado sob pedido.", false],
        ],
    },
    {
        statement:
            "Uma empresa do setor jurídico guarda documentos confidenciais no Amazon S3. O compliance exige uma trilha de auditoria detalhada de cada uso da chave de criptografia (quem descriptografou qual objeto e quando) e a capacidade de desabilitar a chave para revogar o acesso imediatamente. Qual opção de criptografia do S3 atende a esse requisito?",
        explanation:
            "A SSE-KMS usa uma CMK do AWS KMS, e toda chamada de uso da chave (Encrypt, Decrypt, GenerateDataKey) fica registrada no AWS CloudTrail, permitindo auditar quem acessou cada objeto; além disso, a CMK pode ser desabilitada a qualquer momento para bloquear novas operações. A SSE-S3 também cifra em repouso, mas usa chaves geridas inteiramente pelo S3, sem registrar no CloudTrail chamadas individuais de uso de chave nem permitir que o cliente a desabilite. Deixar o bucket sem criptografia no lado do servidor não atende nem à auditoria nem ao controle de chave exigidos. Cifrar no lado do cliente resolve a confidencialidade, mas transfere toda a gestão de chaves e auditoria para fora da AWS.",
        topic: "Amazon S3 - SSE-KMS",
        options: [
            ["Deixar o bucket sem criptografia do lado do servidor, controlando o acesso só pelo IAM.", false],
            ["Cifrar os arquivos no lado do cliente antes do upload, sem habilitar criptografia no bucket.", false],
            ["Habilitar a SSE-KMS no bucket, usando uma CMK do AWS KMS para cifrar os objetos.", true],
            ["Habilitar a SSE-S3, que já grava no CloudTrail cada uso da chave gerenciada pelo S3.", false],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer que todo novo volume do Amazon EBS criado na conta, em uma região específica, seja criptografado automaticamente a partir de agora, sem depender de cada engenheiro marcar a opção manualmente ao lançar uma instância. Qual configuração atende a esse objetivo?",
        explanation:
            "O EBS permite habilitar a criptografia por padrão no nível de conta e região: uma vez ativada, todo novo volume e todo novo snapshot criados nessa região passam a ser criptografados automaticamente, sem ação manual, e sem alterar volumes já existentes. Uma policy IAM negando CreateVolume sem a tag correta bloquearia criações indevidas, mas depende de tag aplicada corretamente e não criptografa nada por si só. Uma regra do AWS Config apenas relata volumes não criptografados, sem impedir ou automatizar a criptografia. Marcar a AMI como criptografada afeta o volume raiz criado a partir dela, mas não cobre volumes de dados adicionais anexados fora da AMI.",
        topic: "Amazon EBS - criptografia padrão",
        options: [
            ["Habilitar a criptografia por padrão do EBS na conta, para a região desejada.", true],
            ["Criar uma policy IAM que nega CreateVolume sem a tag Encrypted, cobrindo todo lançamento.", false],
            ["Configurar uma regra do AWS Config que reporta volumes criados sem criptografia.", false],
            ["Marcar a AMI usada nos lançamentos como criptografada, propagando isso aos volumes.", false],
        ],
    },
    {
        statement:
            "Uma empresa de saúde precisa criptografar volumes do Amazon EBS e objetos do Amazon S3 usando uma chave sobre a qual tenha controle total (definir a key policy, desabilitar a chave e agendar sua exclusão), e o compliance exige uma trilha de auditoria detalhada de cada uso dessa chave. Quais DUAS ações atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "Uma CMK gerenciada pelo cliente dá à empresa controle total sobre a key policy, a possibilidade de desabilitar a chave e de agendar sua exclusão, ao contrário de uma chave gerenciada pela AWS. Habilitar o CloudTrail para registrar os eventos de uso da chave (Encrypt, Decrypt, GenerateDataKey) fornece a trilha de auditoria detalhada exigida. A chave gerenciada pela AWS (aws/s3, aws/ebs) simplifica a operação, mas sua key policy não é customizável pelo cliente e ela não pode ser agendada para exclusão. Os logs padrão do CloudWatch dos serviços S3 e EBS não detalham chamadas individuais de uso da chave do KMS, só o CloudTrail faz isso. Uma chave gerenciada pela AWS é vinculada a uma única conta e não pode ser compartilhada entre contas dessa forma.",
        topic: "AWS KMS - chave gerenciada pelo cliente",
        options: [
            ["Criar uma CMK gerenciada pelo cliente no AWS KMS, com key policy definida pela empresa.", true],
            ["Usar a chave gerenciada pela AWS (aws/s3 e aws/ebs), que já vem com key policy customizável.", false],
            ["Habilitar o AWS CloudTrail para registrar cada evento de uso da chave, como Encrypt e Decrypt.", true],
            ["Depender apenas dos logs padrão do CloudWatch, que já detalham cada uso da chave do KMS.", false],
            ["Compartilhar a mesma chave gerenciada pela AWS entre as contas envolvidas no projeto.", false],
        ],
    },
    {
        statement:
            "Um volume do Amazon EBS já em uso, anexado a uma instância EC2 em produção, foi criado sem criptografia. A política de segurança agora exige que ele passe a ser criptografado, usando apenas recursos nativos da AWS. Qual é o caminho correto?",
        explanation:
            "O EBS não permite ativar criptografia em um volume já existente diretamente: o caminho suportado é criar um snapshot do volume, copiar esse snapshot habilitando a criptografia na cópia, e então criar um novo volume a partir do snapshot criptografado para substituir o original. Reanexar o mesmo volume não funciona, porque a criptografia é definida na criação do volume, não em uma reanexação. A criptografia por padrão da conta vale só para volumes criados dali em diante, não retroage sobre volumes existentes. Redimensionar o volume no console também não adiciona criptografia a um volume que já foi criado sem ela.",
        topic: "Amazon EBS - criptografar volume existente",
        options: [
            ["Desanexar o volume, reanexá-lo à instância e marcar a opção de criptografia nesse momento.", false],
            ["Habilitar a criptografia por padrão da conta, que passa a cobrir os volumes já existentes.", false],
            ["Abrir o volume no console do EC2 e alterar seu tamanho, o que aplica criptografia a ele.", false],
            ["Criar um snapshot do volume, copiá-lo com criptografia e gerar um volume a partir da cópia.", true],
        ],
    },
    {
        statement:
            "Uma instância do Amazon RDS em produção foi criada sem criptografia em repouso. Uma nova exigência de auditoria determina que os dados passem a ser armazenados de forma criptografada. Como isso pode ser feito, já que o RDS não permite ativar a criptografia em uma instância já existente?",
        explanation:
            "O caminho suportado é criar um snapshot manual da instância, copiar esse snapshot habilitando a criptografia na cópia, e restaurar uma nova instância a partir do snapshot criptografado, atualizando a aplicação para o novo endpoint. Não é possível criar um Read Replica criptografado a partir de uma instância de origem que não é criptografada, essa combinação não é suportada pelo RDS. A opção de criptografia em repouso não fica disponível para edição em uma instância já criada sem ela, só é definida na criação. A criptografia por padrão do EBS não se aplica a instâncias do RDS, que gerenciam sua própria criptografia de armazenamento.",
        topic: "Amazon RDS - criptografia em repouso",
        options: [
            ["Criar um Read Replica criptografado a partir da instância de produção, já em execução.", false],
            ["Tirar um snapshot da instância, copiá-lo com criptografia e restaurar uma instância nova.", true],
            ["Abrir a instância no console do RDS e ativar a criptografia em repouso diretamente.", false],
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
            ["Usar o Secrets Manager para tudo, aproveitando a rotação automática nativa dos segredos.", false],
            ["Guardar tudo em variáveis de ambiente da instância EC2, sem nenhuma camada de cifragem.", false],
            ["Usar o Parameter Store no nível standard, com parâmetros SecureString cifrados pelo KMS.", true],
            ["Gravar as credenciais direto no código-fonte da aplicação, versionado no repositório.", false],
        ],
    },
    {
        statement:
            "Uma função AWS Lambda precisa se conectar a um banco Amazon RDS para MySQL. O time exige: nenhuma credencial fixa no código ou em variável de ambiente, rotação automática a cada 30 dias sem escrever código de rotação customizado, e que a função tenha apenas a permissão mínima necessária para ler a credencial. Quais DUAS ações atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "Armazenar a credencial no Secrets Manager com a rotação nativa para RDS habilitada cobre a exigência de rotação automática a cada 30 dias sem código customizado, já que o serviço gerencia esse ciclo integrado ao RDS. Anexar à role de execução da Lambda uma policy restrita a secretsmanager:GetSecretValue sobre aquele segredo específico garante a permissão mínima necessária. Guardar a credencial em variável de ambiente cifrada com KMS evita o texto claro, mas não rotaciona automaticamente nem elimina a credencial fixa. O Parameter Store no nível standard cifra o segredo, mas não oferece rotação automática nativa para RDS sem uma Lambda customizada adicional. Conceder AdministratorAccess à role da função viola diretamente o princípio de permissão mínima.",
        topic: "AWS Secrets Manager",
        options: [
            ["Guardar a credencial em uma variável de ambiente da Lambda, cifrada com uma chave do KMS.", false],
            ["Armazenar a credencial no AWS Secrets Manager, com a rotação nativa para RDS habilitada.", true],
            ["Anexar a policy gerenciada AdministratorAccess à role de execução da função Lambda.", false],
            ["Anexar à role da Lambda uma policy restrita à ação secretsmanager:GetSecretValue nesse segredo.", true],
            ["Armazenar a credencial no Parameter Store, no nível standard, sem configurar rotação adicional.", false],
        ],
    },
    {
        statement:
            "Uma empresa expõe uma aplicação web pública atrás de um Application Load Balancer e hoje compra certificados TLS de uma autoridade externa, renovando manualmente todo ano. A equipe quer eliminar esse trabalho manual e o custo de compra, mantendo a renovação sempre em dia. Qual solução atende isso?",
        explanation:
            "O AWS Certificate Manager emite certificados públicos gratuitamente para uso em recursos integrados como ALB, NLB e CloudFront, e renova esses certificados automaticamente antes do vencimento, desde que a validação de domínio continue válida, eliminando compra e renovação manual. Continuar comprando da autoridade externa e programar lembretes mantém exatamente o trabalho manual que a equipe quer eliminar. Um certificado autoassinado evita custo, mas navegadores não confiam nele para um site público, gerando alertas de segurança. Guardar o certificado no Secrets Manager não resolve a renovação, que é um problema do ciclo de vida do certificado, não do local onde ele fica guardado.",
        topic: "AWS Certificate Manager",
        options: [
            ["Emitir um certificado público pelo AWS Certificate Manager e associá-lo ao ALB.", true],
            ["Continuar comprando o certificado externo, mas programar um lembrete anual de renovação.", false],
            ["Gerar um certificado autoassinado para o domínio público e instalá-lo no ALB.", false],
            ["Guardar o certificado atual no AWS Secrets Manager para centralizar seu armazenamento.", false],
        ],
    },
    {
        statement:
            "O endpoint de login de uma aplicação pública está recebendo tentativas repetidas de adivinhação de senha, vindas de poucos endereços IP, em volume muito acima do tráfego normal. A equipe quer bloquear automaticamente um IP quando ele ultrapassar um número de requisições em uma janela de tempo, sem afetar usuários legítimos. Qual recurso atende isso?",
        explanation:
            "Uma regra baseada em taxa (rate-based rule) no AWS WAF conta as requisições por endereço IP de origem em uma janela de tempo e bloqueia automaticamente o IP que ultrapassar o limite configurado, exatamente o comportamento pedido. Uma Security Group não enxerga volume de requisições por IP na camada de aplicação, apenas libera ou bloqueia portas e protocolos. O Shield Standard protege contra ataques volumétricos de rede e transporte, sem regras configuráveis por taxa de requisição na camada 7. Uma NACL também opera por porta e protocolo na subnet, sem noção de taxa de requisições HTTP por IP de origem.",
        topic: "AWS WAF",
        options: [
            ["Restringir a porta 443 na Security Group, limitando o número de conexões simultâneas aceitas.", false],
            ["Contar com a proteção automática do Shield Standard contra excesso de requisições por IP.", false],
            ["Criar uma entrada de negação na Network ACL da subnet para o intervalo de IPs suspeitos.", false],
            ["Criar uma regra baseada em taxa no AWS WAF, bloqueando o IP que exceder o limite na janela.", true],
        ],
    },
    {
        statement:
            "Uma startup com orçamento apertado quer uma proteção básica contra ataques volumétricos comuns de DDoS nas camadas de rede e transporte (como SYN flood e reflexão de UDP) para seus recursos públicos, sem custo adicional ou contrato. O que já atende esse requisito mínimo?",
        explanation:
            "O AWS Shield Standard é ativado automaticamente, sem custo, para todo cliente AWS, e protege recursos como Elastic Load Balancing, Amazon CloudFront e endereços IP elásticos contra os ataques volumétricos mais comuns nas camadas 3 e 4, sem exigir configuração ou contrato. O Shield Advanced adiciona mitigação para ataques mais sofisticados, proteção de custo e acesso ao time de resposta, mas com assinatura mensal, mais do que o cenário pede. O WAF atua na camada de aplicação, contra padrões como SQL injection, e não é o mecanismo de proteção volumétrica de rede. Um provedor de CDN externo adicionaria uma camada fora da AWS, desnecessária quando o Shield Standard já cobre o cenário descrito.",
        topic: "AWS Shield Standard",
        options: [
            ["O AWS Shield Advanced, que exige assinatura mensal para cobrir os ataques volumétricos comuns.", false],
            ["O AWS Shield Standard, ativo automaticamente e sem custo para os recursos públicos da conta.", true],
            ["Um provedor de CDN externo, contratado apenas para absorver picos de tráfego volumétrico.", false],
            ["O AWS WAF, configurado com regras gerenciadas voltadas a ataques na camada de aplicação.", false],
        ],
    },
    {
        statement:
            "Uma empresa de e-commerce roda sua aplicação atrás de Amazon CloudFront e Application Load Balancer. Ela sofreu tentativas de SQL injection na camada de aplicação e, na mesma semana, um grande ataque volumétrico de DDoS que gerou pico de custo pelo escalonamento automático. A empresa quer bloquear os dois tipos de ataque, ter proteção de custo contra o escalonamento gerado por DDoS e acesso 24x7 a uma equipe especializada de resposta. Quais DUAS ações atendem isso? (Selecione DUAS opções.)",
        explanation:
            "O AWS WAF, com regras gerenciadas contra SQL injection e outros padrões da OWASP, bloqueia o tráfego malicioso na camada de aplicação antes que ele chegue à aplicação. O Shield Advanced adiciona mitigação avançada contra ataques volumétricos maiores, proteção de custo para o escalonamento gerado por DDoS e acesso 24x7 ao DDoS Response Team, cobrindo as duas lacunas do cenário. O Shield Standard já vem incluído de graça, mas não oferece proteção de custo nem acesso ao DRT. Uma Security Group não filtra padrões de ataque na camada de aplicação como SQL injection. O GuardDuty detecta e alerta sobre atividade suspeita, mas não bloqueia tráfego nem oferece proteção de custo contra DDoS.",
        topic: "AWS WAF e AWS Shield Advanced",
        options: [
            ["Habilitar o AWS WAF com regras gerenciadas contra SQL injection na frente da aplicação.", true],
            ["Confiar apenas no Shield Standard, que já cobre custo de escalonamento e suporte do DRT.", false],
            ["Ativar o Amazon GuardDuty para bloquear automaticamente o tráfego identificado como malicioso.", false],
            ["Contratar o AWS Shield Advanced, com proteção de custo e acesso ao DDoS Response Team.", true],
            ["Configurar uma Security Group mais restritiva na frente do Application Load Balancer.", false],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer identificar automaticamente vulnerabilidades conhecidas (CVEs) em pacotes de software das instâncias EC2 e nas imagens de container do Amazon ECR, com avaliações contínuas e sem depender de scans manuais. Qual serviço atende esse objetivo?",
        explanation:
            "O Amazon Inspector avalia continuamente instâncias EC2 e imagens no Amazon ECR em busca de vulnerabilidades conhecidas (CVEs) e problemas de exposição de rede, gerando novas descobertas automaticamente quando há mudanças, sem scans manuais. O GuardDuty detecta comportamento malicioso e anômalo a partir de logs como CloudTrail e VPC Flow Logs, mas não faz varredura de vulnerabilidades em pacotes instalados. O Macie é voltado para descoberta e classificação de dados sensíveis armazenados no S3, sem relação com CVEs. O AWS Config avalia conformidade de configuração de recursos contra regras definidas, não vulnerabilidades de software.",
        topic: "Amazon Inspector",
        options: [
            ["Amazon GuardDuty, analisando CloudTrail e VPC Flow Logs em busca de comportamento anômalo.", false],
            ["AWS Config, avaliando a conformidade da configuração dos recursos contra regras definidas.", false],
            ["Amazon Inspector, avaliando continuamente vulnerabilidades em instâncias EC2 e imagens do ECR.", true],
            ["Amazon Macie, usando aprendizado de máquina para classificar dados sensíveis armazenados.", false],
        ],
    },
    {
        statement:
            "Uma equipe de segurança quer duas capacidades: detecção contínua de atividade anômala, como chamadas de API vindas de localizações incomuns ou uma instância EC2 se comunicando com um domínio de mineração de criptomoeda, e descoberta automática de dados sensíveis, como números de cartão e dados pessoais, espalhados em vários buckets do Amazon S3, sem escrever regras de detecção customizadas. Quais DUAS opções atendem isso? (Selecione DUAS opções.)",
        explanation:
            "O Amazon GuardDuty analisa continuamente fontes como CloudTrail, VPC Flow Logs e logs de DNS para identificar comportamento anômalo ou malicioso, como comunicação com domínios associados a mineração de criptomoeda, sem exigir regras customizadas. O Amazon Macie usa aprendizado de máquina e padrões predefinidos para descobrir e classificar automaticamente dados sensíveis, como números de cartão e dados pessoais, em buckets do S3. O Amazon Inspector avalia vulnerabilidades de software em EC2 e imagens do ECR, não comportamento anômalo nem dados sensíveis. O Trusted Advisor verifica boas práticas gerais de custo, desempenho e segurança, mas não classifica dados sensíveis nem detecta ameaças em tempo real. Uma regra do AWS Config avalia conformidade de configuração de recursos, sem relação com nenhuma das duas necessidades.",
        topic: "Amazon GuardDuty e Amazon Macie",
        options: [
            ["Habilitar o Amazon Inspector, para avaliar vulnerabilidades nas instâncias EC2 e imagens do ECR.", false],
            ["Habilitar o Amazon GuardDuty, para detecção contínua a partir de CloudTrail e VPC Flow Logs.", true],
            ["Habilitar o AWS Trusted Advisor, para revisar boas práticas de segurança e desempenho da conta.", false],
            ["Habilitar uma regra do AWS Config, para avaliar a conformidade da configuração dos recursos.", false],
            ["Habilitar o Amazon Macie, para descobrir e classificar dados sensíveis no Amazon S3.", true],
        ],
    },
    {
        statement:
            "Em uma VPC de três camadas, a subnet do banco de dados deve aceitar conexões na porta 3306 somente vindas da camada de aplicação. A Security Group do banco já libera a porta 3306 a partir da Security Group da aplicação, mas as conexões continuam recusadas. A equipe descobre que a Network ACL da subnet foi alterada recentemente e agora nega todo tráfego, exceto algumas regras explícitas. O que precisa ser corrigido, respeitando o funcionamento de cada camada de filtro?",
        explanation:
            "Diferente da Security Group, que é stateful e libera automaticamente o tráfego de retorno, a Network ACL é stateless: é preciso liberar explicitamente tanto a entrada na porta 3306 quanto a saída das portas efêmeras usadas na resposta. Corrigir só a Security Group não resolve, porque a NACL continua bloqueando o tráfego antes dele chegar à instância. Remover a Security Group do banco tira uma camada de defesa útil, e a NACL sozinha não substitui o controle por grupo de origem. Abrir a porta 3306 para 0.0.0.0/0 ignora o problema real, que está na NACL, e ainda enfraquece a segurança do banco.",
        topic: "Security Groups e Network ACLs",
        options: [
            ["Adicionar na NACL regras explícitas de entrada na 3306 e de saída para portas efêmeras.", true],
            ["Remover a Security Group do banco e controlar todo o acesso apenas pela NACL da subnet.", false],
            ["Abrir a porta 3306 para o intervalo 0.0.0.0/0 na Security Group do banco de dados.", false],
            ["Recriar a Security Group da aplicação, mantendo a NACL da subnet do banco como está.", false],
        ],
    },
    {
        statement:
            "Instâncias EC2 em subnets privadas, sem rota para a internet, precisam ler e gravar objetos no Amazon S3. A equipe quer que esse tráfego não saia para a internet pública e também quer evitar a tarifa de processamento de dados de um NAT Gateway só para esse acesso ao S3. Qual solução atende os dois requisitos?",
        explanation:
            "Um VPC Endpoint do tipo gateway para o Amazon S3 mantém o tráfego dentro da rede da AWS, sem passar pela internet pública, e não cobra tarifa de processamento de dados como um NAT Gateway, resolvendo custo e privacidade ao mesmo tempo. Um NAT Gateway daria acesso ao S3 via internet pública e continuaria cobrando por dados processados, o oposto do que se quer evitar. Um Internet Gateway exigiria IP público nas instâncias, expondo o tráfego à rede pública. O VPC Peering conecta duas VPCs entre si e não existe uma VPC separada hospedando o S3 para essa conexão fazer sentido.",
        topic: "VPC Endpoints",
        options: [
            ["Adicionar um NAT Gateway nas subnets privadas, liberando a saída do tráfego até o Amazon S3.", false],
            ["Anexar um Internet Gateway à VPC e atribuir IP público às instâncias que acessam o S3.", false],
            ["Criar uma conexão de VPC Peering entre a VPC privada e a VPC que hospeda o serviço do S3.", false],
            ["Criar um VPC Endpoint do tipo gateway para o S3 e associá-lo às tabelas de rota das subnets.", true],
        ],
    },
    {
        statement:
            "Hoje, uma equipe acessa instâncias EC2 em subnets privadas através de um bastion host com a porta 22 aberta para a internet, e uma auditoria apontou o risco dessa porta aberta e da distribuição de chaves SSH entre administradores. A equipe quer manter o acesso administrativo, mas sem nenhuma porta de entrada aberta e com controle de acesso centralizado via IAM. Qual solução atende?",
        explanation:
            "O Systems Manager Session Manager cria a sessão através do agente SSM instalado na instância, que se conecta de saída ao Systems Manager, dispensando qualquer porta de entrada aberta e usando políticas do IAM para autorizar quem inicia a sessão, além de registrar os comandos executados. Manter o bastion host, mesmo restringindo a porta 22 a um IP, ainda mantém uma porta de entrada exposta e a gestão de chaves SSH. O Client VPN dá acesso à rede privada, mas não elimina a necessidade de porta SSH aberta nas instâncias nem centraliza a autorização no IAM como pedido. Uma chave SSH compartilhada piora a rastreabilidade individual, além de não fechar porta nenhuma.",
        topic: "AWS Systems Manager Session Manager",
        options: [
            ["Manter o bastion host, restringindo a porta 22 a um único endereço IP confiável da equipe.", false],
            ["Usar o Session Manager, com o agente SSM iniciando a conexão de saída e acesso via IAM.", true],
            ["Distribuir uma única chave SSH compartilhada entre os administradores do bastion host.", false],
            ["Substituir o bastion host por uma conexão de AWS Client VPN até a subnet privada.", false],
        ],
    },
    {
        statement:
            "Um bucket do Amazon S3 recém-criado foi exposto publicamente por engano, depois que alguém anexou uma bucket policy concedendo acesso a qualquer principal. A equipe de segurança quer garantir que nenhum bucket da conta possa se tornar público novamente, mesmo por engano, independente de bucket policies ou ACLs aplicadas no futuro. Qual configuração garante essa proteção no nível da conta?",
        explanation:
            "O Block Public Access do S3, habilitado no nível da conta, ignora bucket policies e ACLs que concedam acesso público, bloqueando a exposição mesmo que alguém configure isso por engano no futuro, atendendo exatamente ao pedido de proteção permanente. Remover apenas a bucket policy problemática corrige o incidente atual, mas não impede que outra policy pública seja criada depois. Um processo de revisão manual depende de disciplina humana e não bloqueia nada tecnicamente. Criptografar os objetos com SSE-KMS protege a confidencialidade dos dados, mas não impede que o bucket seja configurado como público.",
        topic: "Amazon S3 - Block Public Access",
        options: [
            ["Remover a bucket policy que concedeu o acesso público, mantendo o restante como está.", false],
            ["Habilitar a criptografia SSE-KMS em todos os objetos, reforçando a confidencialidade deles.", false],
            ["Habilitar o Block Public Access no nível da conta, bloqueando qualquer policy ou ACL pública.", true],
            ["Definir um processo de revisão manual para toda nova bucket policy antes de publicá-la.", false],
        ],
    },
    {
        statement:
            "Uma equipe de desenvolvimento precisa de acesso de leitura e escrita somente ao bucket do Amazon S3 usado pela aplicação da equipe, sem nenhuma permissão sobre os demais buckets da conta. Qual solução atende a esse requisito seguindo o princípio do menor privilégio?",
        explanation:
            "Uma policy do IAM restrita ao ARN do bucket específico, anexada a um grupo, aplica o princípio do menor privilégio e facilita a manutenção conforme a equipe cresce. A policy gerenciada AmazonS3FullAccess libera todos os buckets da conta, muito além do necessário. Usar credenciais root ou um usuário administrador compartilhado elimina a rastreabilidade individual e contraria as boas práticas básicas de segurança do IAM.",
        topic: "IAM Policies",
        options: [
            ["Anexar a policy gerenciada AmazonS3FullAccess a cada usuário do IAM da equipe de desenvolvimento.", false],
            ["Distribuir as credenciais da conta root da AWS entre os membros da equipe para uso nesse bucket.", false],
            ["Criar uma policy do IAM restrita ao bucket e anexá-la ao grupo dos desenvolvedores da equipe.", true],
            ["Criar um único usuário do IAM compartilhado pela equipe com a policy AdministratorAccess anexada.", false],
        ],
    },
    {
        statement:
            "O time de operações de uma empresa cresceu de 5 para 50 engenheiros, todos precisando das mesmas permissões para gerenciar instâncias Amazon EC2 e alarmes do Amazon CloudWatch. Anexar policies individualmente a cada novo usuário do IAM está se tornando inviável. Qual abordagem reduz o esforço administrativo e escala melhor?",
        explanation:
            "Um grupo do IAM centraliza a gestão de permissões: a policy fica anexada ao grupo uma única vez e todo novo engenheiro só precisa ser adicionado como membro. Anexar as mesmas policies a cada usuário individualmente exige repetir o trabalho a cada contratação, exigir que uma role seja assumida manualmente adiciona fricção desnecessária ao dia a dia, e copiar o JSON de uma policy inline em cada usuário multiplica pontos de manutenção e risco de inconsistência.",
        topic: "IAM Groups",
        options: [
            ["Anexar o mesmo conjunto de policies gerenciadas diretamente a cada novo usuário do IAM criado.", false],
            ["Criar um grupo do IAM com as policies necessárias e adicionar os engenheiros como membros do grupo.", true],
            ["Criar uma role do IAM que cada engenheiro deve assumir manualmente a cada novo acesso ao console.", false],
            ["Copiar o JSON da policy existente para uma policy inline em cada usuário recém criado.", false],
        ],
    },
    {
        statement:
            "Uma aplicação em execução em uma instância Amazon EC2 precisa gravar objetos em um bucket do Amazon S3. Uma revisão de segurança encontrou chaves de acesso da AWS fixas no arquivo de configuração da aplicação dentro da instância. Qual é a prática recomendada para eliminar esse risco e conceder acesso à API da AWS a partir do EC2?",
        explanation:
            "Uma role do IAM associada à instância por meio de um instance profile fornece credenciais temporárias, geradas e rotacionadas automaticamente pela AWS, eliminando a necessidade de chaves fixas dentro da instância. Guardar as chaves criptografadas no volume, rotacioná-las manualmente a cada 24 horas ou colocá-las no user data ainda mantêm credenciais de longa duração expostas na instância, o que a prática recomendada busca evitar.",
        topic: "IAM Roles - EC2 Instance Profile",
        options: [
            ["Guardar as chaves de acesso em um arquivo criptografado no volume EBS da própria instância.", false],
            ["Criar um usuário do IAM para a aplicação e rotacionar as chaves de acesso a cada 24 horas.", false],
            ["Passar as chaves de acesso como variáveis no user data usado na inicialização da instância.", false],
            ["Criar uma role do IAM com as permissões de S3 e associá-la à instância via instance profile.", true],
        ],
    },
    {
        statement:
            "Uma empresa mantém duas contas AWS, Produção e Auditoria. Os analistas de segurança da conta Auditoria precisam consultar recursos e logs do AWS CloudTrail na conta Produção, sem que sejam criados usuários do IAM para eles na conta Produção. Qual solução atende a esse requisito?",
        explanation:
            "Uma role do IAM criada na conta Produção, com trust policy autorizando a conta Auditoria como principal e permissões de leitura, permite que os analistas obtenham credenciais temporárias via AssumeRole sem que existam identidades permanentes na conta acessada. Criar um usuário por analista aumenta a superfície de gerenciamento, compartilhar credenciais root é uma prática insegura e sem rastreabilidade, e a cobrança consolidada do AWS Organizations trata apenas de faturamento, não concede acesso a recursos.",
        topic: "IAM Roles - Cross-Account AssumeRole",
        options: [
            ["Criar uma role de leitura na conta Produção com trust policy que autoriza a conta Auditoria a assumi-la.", true],
            ["Criar um usuário do IAM na conta Produção para cada analista da equipe de Auditoria acessar os dados.", false],
            ["Compartilhar as credenciais da conta root de Produção com o líder da equipe de Auditoria para consultas.", false],
            ["Ativar a cobrança consolidada do AWS Organizations para que as permissões sejam herdadas automaticamente.", false],
        ],
    },
    {
        statement:
            "Uma função AWS Lambda precisa ler itens de uma tabela do Amazon DynamoDB e publicar mensagens em um tópico do Amazon SNS. Qual é a forma correta de conceder essas permissões à função?",
        explanation:
            "A execution role do IAM anexada à função Lambda concede, em tempo de execução, as permissões que o código usa para chamar o DynamoDB e o SNS, sem expor nenhuma chave de acesso. Toda função Lambda exige uma execution role para existir, então embutir chaves como variável de ambiente, usar o usuário root ou depender apenas de uma resource policy na tabela não substitui essa role nem segue a prática recomendada.",
        topic: "IAM Roles - AWS Lambda",
        options: [
            ["Definir as chaves de acesso de um usuário do IAM como variáveis de ambiente da função Lambda.", false],
            ["Anexar as policies gerenciadas de DynamoDB e SNS ao usuário root da conta AWS por padrão.", false],
            ["Criar uma execution role do IAM com as permissões de DynamoDB e SNS e associá-la à função.", true],
            ["Configurar uma resource policy na tabela do DynamoDB sem associar nenhuma role à função.", false],
        ],
    },
    {
        statement:
            "A empresa A precisa conceder à conta AWS da empresa B acesso de leitura a objetos específicos de um bucket do Amazon S3 pertencente à empresa A, sem criar nenhum usuário ou role do IAM na conta da empresa A para a empresa B. Qual solução atende a esse requisito?",
        explanation:
            "Uma bucket policy é uma resource-based policy aplicada diretamente ao bucket, capaz de conceder acesso a uma conta AWS externa sem exigir usuários ou roles nessa outra conta. Compartilhar as chaves de uma role expõe credenciais desnecessariamente, replicar os objetos para um bucket da empresa B cria uma cópia fora do controle da empresa A, e incluir o ID da empresa B em uma policy anexada aos próprios usuários da empresa A não concede nenhum acesso a quem está fora da conta.",
        topic: "Resource-Based Policies",
        options: [
            ["Criar uma role do IAM na conta da empresa A e compartilhar suas chaves de acesso com a empresa B.", false],
            ["Anexar ao bucket do S3 uma bucket policy que concede as permissões específicas à conta da empresa B.", true],
            ["Ativar a replicação entre regiões do S3 para sincronizar os objetos com um bucket da empresa B.", false],
            ["Incluir o ID da conta da empresa B em uma policy anexada aos usuários do IAM da empresa A.", false],
        ],
    },
    {
        statement:
            "Uma plataforma de engenharia quer delegar às equipes de aplicação a criação de suas próprias roles do IAM para os microsserviços, mas precisa garantir que nenhuma dessas roles ultrapasse um conjunto máximo de permissões definido centralmente, independente das policies que cada equipe anexar a elas. Qual recurso do IAM atende a esse requisito?",
        explanation:
            "Uma permissions boundary define o teto máximo de permissões que uma role criada por uma equipe pode ter, independente das policies de identidade anexadas depois, sendo o mecanismo do IAM indicado para delegar a criação de identidades com segurança. Uma Service Control Policy não se anexa a um usuário individual, o IAM Access Analyzer identifica riscos mas não revoga permissões automaticamente, e revisão manual de cada policy não é um controle preventivo que escale com o número de equipes.",
        topic: "IAM Permission Boundaries",
        options: [
            ["Aplicar uma Service Control Policy anexada apenas ao usuário do IAM de cada equipe de aplicação.", false],
            ["Utilizar o IAM Access Analyzer para revogar automaticamente permissões excessivas após a criação da role.", false],
            ["Exigir que cada equipe envie suas policies para revisão manual antes de toda nova implantação.", false],
            ["Definir uma permissions boundary nas roles criadas pelas equipes, limitando o teto máximo de permissões.", true],
        ],
    },
    {
        statement:
            "Um usuário do IAM pertence a dois grupos. A policy do primeiro grupo concede acesso total ao Amazon EC2, enquanto a policy do segundo grupo nega explicitamente a ação ec2:TerminateInstances. Ao tentar encerrar uma instância EC2, qual será o resultado para esse usuário?",
        explanation:
            "Na avaliação de policies do IAM, uma negação explícita em qualquer policy aplicável sempre prevalece sobre qualquer permissão concedida por outra policy, mesmo quando o usuário tem acesso total por outro caminho. A ordem de criação dos grupos e qual policy foi anexada mais recentemente não influenciam esse resultado: o IAM avalia todas as policies aplicáveis em conjunto, não apenas a última.",
        topic: "IAM Policy Evaluation Logic",
        options: [
            ["A solicitação será negada, pois a negação explícita sempre prevalece sobre a permissão.", true],
            ["A solicitação será permitida, pois ao menos uma das policies anexadas concede acesso total ao EC2.", false],
            ["A solicitação será permitida, pois o IAM avalia apenas a policy anexada ao grupo mais recente.", false],
            ["O resultado depende de qual dos dois grupos foi criado primeiro na conta da AWS, não das policies.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer impedir que qualquer conta de sua AWS Organizations, incluindo contas que venham a ser criadas no futuro, lance recursos fora de duas regiões aprovadas, independentemente das permissões do IAM concedidas aos usuários em cada conta. Qual solução atende a esse requisito?",
        explanation:
            "Uma Service Control Policy anexada à OU (ou à raiz) nega as ações fora das regiões aprovadas para todas as contas atuais e futuras dessa unidade, independente das policies do IAM em cada conta membro. Configurar condições de região conta a conta exige manutenção manual repetida, e regras do AWS Config ou alertas de orçamento apenas detectam ou notificam depois que o recurso já foi criado, sem impedir a ação no momento em que ela acontece.",
        topic: "AWS Organizations SCP - Restrição de Região",
        options: [
            ["Configurar policies do IAM com condição de região individualmente em cada conta membro da organização.", false],
            ["Habilitar regras do AWS Config em cada conta para sinalizar recursos criados fora das regiões aprovadas.", false],
            ["Criar uma Service Control Policy que nega ações fora das regiões aprovadas e anexá-la à OU correspondente.", true],
            ["Configurar um alerta de orçamento nas regiões não aprovadas para notificar os administradores da conta.", false],
        ],
    },
    {
        statement:
            "O administrador de uma conta membro anexa a um desenvolvedor uma policy do IAM que concede acesso total ao Amazon S3. Porém, a OU dessa conta possui uma Service Control Policy que nega todas as ações de S3. Ao tentar acessar o S3, o que acontece com o desenvolvedor e por quê?",
        explanation:
            "Service Control Policies definem o teto de permissões disponível em uma conta membro: elas nunca concedem acesso por si mesmas, apenas restringem, e nenhuma policy do IAM anexada dentro da conta consegue ultrapassar uma negação vinda da SCP. SCPs não afetam a conta de gerenciamento, mas sim as contas membro da organização, e não existe fluxo automático de exceção temporária para uma negação de SCP.",
        topic: "AWS Organizations SCP - Teto de Permissões",
        options: [
            ["O acesso é permitido, pois policies do IAM anexadas diretamente a um usuário têm prioridade sobre a SCP.", false],
            ["O acesso é negado, pois a SCP define o teto de permissões da conta e a policy do IAM não pode ultrapassá-lo.", true],
            ["O acesso é permitido, pois Service Control Policies se aplicam somente à conta de gerenciamento da organização.", false],
            ["O acesso é negado apenas de forma temporária, até um administrador aprovar manualmente uma exceção à SCP.", false],
        ],
    },
    {
        statement:
            "Uma empresa com 30 contas AWS organizadas no AWS Organizations quer que os funcionários façam login uma única vez com as credenciais corporativas já existentes e depois acessem, por um único portal, todas as contas e aplicações para as quais estão autorizados, sem manter usuários do IAM separados em cada conta. Qual solução atende a esse requisito?",
        explanation:
            "O AWS IAM Identity Center centraliza a autenticação conectando-se ao diretório corporativo e usa permission sets para atribuir acesso a múltiplas contas da organização por um único portal de login. Criar um usuário do IAM em cada conta exige sincronização manual constante, o Amazon Cognito é voltado à autenticação de usuários de aplicações e não ao acesso administrativo entre contas, e compartilhar as credenciais de uma única role viola práticas básicas de segurança e rastreabilidade.",
        topic: "IAM Identity Center",
        options: [
            ["Configurar o AWS IAM Identity Center, conectado ao diretório corporativo, e atribuir permission sets por conta.", true],
            ["Criar um usuário do IAM em cada conta para cada funcionário, com sincronização manual pela equipe de operações.", false],
            ["Configurar user pools do Amazon Cognito em cada conta AWS para autenticar o login dos funcionários.", false],
            ["Compartilhar as credenciais de uma única role do IAM entre todos os funcionários da empresa.", false],
        ],
    },
    {
        statement:
            "Uma corporação mantém o Active Directory Federation Services (AD FS) na própria infraestrutura local e quer que os funcionários acessem o AWS Management Console usando as credenciais corporativas já existentes, sem criar usuários do IAM e sem adotar o AWS IAM Identity Center. Qual solução atende a esse requisito?",
        explanation:
            "Configurar um provedor de identidade SAML 2.0 no IAM, confiável pelo AD FS, permite que os usuários federados assumam uma role da AWS por meio do STS AssumeRoleWithSAML, usando as credenciais corporativas existentes. O IAM Identity Center é uma alternativa de federação, não a única suportada pela AWS, e sincronizar senhas ou armazená-las como senhas de usuários do IAM não caracteriza federação de identidade real.",
        topic: "SAML Federation with STS",
        options: [
            ["Criar usuários do IAM para os funcionários, com senhas sincronizadas todas as noites a partir do Active Directory.", false],
            ["Adotar apenas o AWS IAM Identity Center, única opção de federação de identidade suportada pela AWS.", false],
            ["Armazenar as credenciais do Active Directory como senhas de usuários do IAM por meio de um agente local.", false],
            ["Configurar um provedor de identidade SAML 2.0 no IAM, confiável pelo AD FS, e usar o STS AssumeRoleWithSAML.", true],
        ],
    },
    {
        statement:
            "Um time está construindo um aplicativo mobile voltado ao público final e precisa oferecer cadastro, login e recuperação de senha, além de permitir login usando contas do Google e do Facebook. Qual serviço deve ser usado para implementar esse requisito?",
        explanation:
            "Os user pools do Amazon Cognito atuam como diretório de usuários da aplicação, cuidando de cadastro, login, recuperação de senha e integração com provedores de identidade social, como Google e Facebook. Criar um usuário do IAM por cliente final não foi projetado para esse volume nem para esse fim, o IAM Identity Center atende identidades da força de trabalho e não do público externo, e um diretório LDAP personalizado exigiria construir e manter toda a autenticação manualmente.",
        topic: "Amazon Cognito User Pools",
        options: [
            ["Um usuário do IAM criado para cada usuário final da aplicação, com chaves de acesso programático embutidas no app.", false],
            ["O AWS IAM Identity Center, configurado para atender usuários externos do público em geral pela internet.", false],
            ["Amazon Cognito user pools, para gerenciar o diretório de usuários da aplicação e a autenticação, com login social.", true],
            ["Um diretório LDAP personalizado, hospedado em uma instância EC2 dentro da VPC da aplicação móvel.", false],
        ],
    },
    {
        statement:
            "Depois que os usuários fazem login em um aplicativo mobile por meio de um user pool do Amazon Cognito, o app precisa permitir que cada usuário autenticado envie fotos diretamente do dispositivo para um prefixo específico de um bucket do Amazon S3, usando credenciais da AWS temporárias e de escopo limitado, sem embutir credenciais permanentes no aplicativo. Qual solução atende a esse requisito?",
        explanation:
            "Um identity pool do Amazon Cognito troca o token emitido pelo user pool por credenciais da AWS temporárias, associadas a uma role do IAM que pode ser restrita por usuário usando variáveis de política, evitando credenciais fixas dentro do aplicativo. Compartilhar uma chave de acesso, criar um usuário do IAM por cliente ou tornar o bucket público para escrita expõem credenciais ou dados de forma desnecessária e insegura.",
        topic: "Amazon Cognito Identity Pools",
        options: [
            ["Embutir no aplicativo mobile um único par de chaves de acesso do IAM compartilhado entre todos os usuários do app.", false],
            ["Usar um identity pool do Cognito para trocar o token do user pool por credenciais temporárias com escopo restrito.", true],
            ["Criar, para cada usuário cadastrado no aplicativo, um usuário do IAM com acesso programático individual próprio.", false],
            ["Conceder ao bucket do S3 uma bucket policy de escrita pública liberada para qualquer dispositivo autenticado no app.", false],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está projetando um sistema para conceder aos workloads credenciais da AWS temporárias e com expiração automática, em vez de chaves de acesso de longa duração. Quais duas capacidades do AWS STS atendem a esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "AssumeRole e AssumeRoleWithWebIdentity são ações do AWS STS que retornam credenciais de segurança temporárias, com expiração automática configurável, adequadas para workloads e aplicações federadas. CreateAccessKey, AttachRolePolicy e GenerateCredentialReport são ações do IAM voltadas a chaves permanentes, à anexação de policies ou a relatórios de credenciais, sem relação com a emissão de credenciais temporárias.",
        topic: "AWS STS",
        options: [
            ["CreateAccessKey, que gera um novo par de chaves de acesso permanente para um usuário do IAM existente.", false],
            ["AssumeRole, que retorna credenciais de segurança temporárias com expiração configurável para a sessão.", true],
            ["AttachRolePolicy, que anexa de forma permanente uma policy gerenciada a uma role existente do IAM.", false],
            ["AssumeRoleWithWebIdentity, que fornece credenciais temporárias via autenticação web federada.", true],
            ["GenerateCredentialReport, que produz um relatório sobre o status de senhas e chaves de acesso da conta.", false],
        ],
    },
    {
        statement:
            "Uma auditoria de segurança encontrou chaves de acesso de longa duração do usuário root sendo usadas por um script automatizado, além de nenhuma autenticação multifator configurada para essa conta. Quais duas ações o arquiteto de soluções deve recomendar para seguir as boas práticas do IAM? (Selecione DUAS opções.)",
        explanation:
            "As boas práticas do IAM recomendam eliminar o uso de chaves de acesso do usuário root, substituindo-as por uma role ou usuário com privilégio mínimo dedicado ao script, e habilitar MFA no root para proteger a identidade mais privilegiada da conta. Continuar usando as chaves do root mesmo com rotação periódica, compartilhar a senha do root com outro administrador ou manter um grupo com AdministratorAccess como contingência contrariam essas práticas recomendadas.",
        topic: "IAM Security Best Practices",
        options: [
            ["Excluir as chaves de acesso do usuário root e usar uma role ou usuário com privilégio mínimo no script.", true],
            ["Rotacionar as chaves de acesso do usuário root a cada 90 dias e manter o script funcionando com elas.", false],
            ["Ativar a autenticação multifator no usuário root e guardar o dispositivo de MFA em local seguro.", true],
            ["Compartilhar a senha do usuário root com um segundo administrador para permitir supervisão conjunta.", false],
            ["Criar um grupo do IAM chamado backup-root e conceder a ele a policy AdministratorAccess como contingência.", false],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está criando uma role do IAM na conta A, que será assumida por uma role do IAM na conta B para executar operações de backup. Quais dois componentes precisam estar corretamente configurados para que esse acesso entre contas funcione? (Selecione DUAS opções.)",
        explanation:
            "O acesso entre contas via AssumeRole exige uma trust policy na role da conta A que autorize a role da conta B como principal, e uma permissions policy na mesma role que defina as ações de backup permitidas depois da assunção. Resource policies em buckets S3, uma SCP na conta B ou uma conexão de rede via VPC peering não fazem parte do mecanismo de assumir roles entre contas nem substituem essas duas configurações.",
        topic: "IAM Roles - Cross-Account Trust Policy",
        options: [
            ["Uma resource policy em todos os buckets do S3 da conta A listando a conta B como proprietária.", false],
            ["Uma Service Control Policy na conta B autorizando explicitamente a ação sts:AssumeRole em direção à conta A.", false],
            ["Uma trust policy na role da conta A que define a role da conta B como principal confiável.", true],
            ["Uma conexão de VPC peering estabelecida entre as redes das duas contas, sem nenhuma configuração adicional.", false],
            ["Uma permissions policy na role da conta A que concede as ações de backup que a role da conta B poderá executar.", true],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções está avaliando as diferenças entre policies baseadas em identidade e policies baseadas em recurso no IAM. Quais duas afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Policies baseadas em recurso ficam anexadas ao próprio recurso e definem quais principals podem acessá-lo, enquanto policies baseadas em identidade ficam anexadas a usuários, grupos ou roles e definem quais ações a identidade pode executar. Vários tipos de recurso além de roles aceitam policies baseadas em recurso, uma policy de identidade sozinha não concede acesso a uma conta AWS diferente, e as duas policies são avaliadas em conjunto pelo IAM, não de forma excludente.",
        topic: "IAM Policy Types",
        options: [
            ["Policies baseadas em recurso são anexadas ao próprio recurso, como um bucket do S3, e definem quais principals podem acessá-lo.", true],
            ["Policies baseadas em recurso só podem ser criadas para roles do IAM, nunca para buckets, filas ou outros tipos de recurso.", false],
            ["Uma policy baseada em identidade concede sozinha acesso a principals de outra conta AWS, sem nenhuma configuração adicional.", false],
            ["Policies baseadas em identidade são anexadas a usuários, grupos ou roles e definem quais ações a identidade pode executar.", true],
            ["Uma policy baseada em recurso só é avaliada quando não existe nenhuma policy baseada em identidade para a mesma solicitação.", false],
        ],
    },
    {
        statement:
            "Uma fintech usa o Amazon RDS for PostgreSQL como banco transacional principal. A equipe de arquitetura precisa que o banco faca failover automatico para outra zona de disponibilidade em caso de falha na instancia primaria, com minima intervencao manual e sem alterar a logica de conexao da aplicacao. Qual e a MELHOR solucao para esse requisito?",
        explanation:
            "O Multi-AZ do Amazon RDS mantem uma replica sincrona em outra zona de disponibilidade e realiza failover automatico, via atualizacao do endpoint DNS, quando a instancia primaria fica indisponivel, sem exigir alteracao na aplicacao. Read Replicas sao assincronas e exigem promocao manual para virar principal, o que nao e failover automatico. Snapshots manuais e migracao para uma instancia EC2 unica nao oferecem alta disponibilidade automatizada equivalente.",
        topic: "RDS Multi-AZ",
        options: [
            ["Ativar o Multi-AZ na instancia do RDS, com uma replica sincrona em standby em outra zona de disponibilidade.", true],
            ["Criar uma Read Replica em outra zona de disponibilidade e promove-la manualmente quando a primaria falhar.", false],
            ["Configurar snapshots manuais horarios e restaurar uma nova instancia sempre que for necessario.", false],
            ["Migrar o banco de dados para uma unica instancia Amazon EC2 rodando PostgreSQL em outra zona.", false],
        ],
    },
    {
        statement:
            "Uma empresa de comercio eletronico mantem a camada web em instancias Amazon EC2 em uma unica zona de disponibilidade. A equipe quer que a aplicacao continue disponivel mesmo se toda a zona de disponibilidade atual ficar indisponivel durante picos de trafego como a Black Friday, sem provisionamento manual de servidores. Qual arquitetura atende esse requisito?",
        explanation:
            "Distribuir instancias em multiplas zonas de disponibilidade com um Auto Scaling group e um Application Load Balancer garante que a perda de uma zona nao derrube a aplicacao, alem de ajustar a capacidade automaticamente conforme a demanda. Aumentar o tamanho da instancia ou adicionar servidores na mesma zona nao protege contra falha de zona. O CloudFront acelera entrega de conteudo, mas nao substitui a distribuicao multi-AZ da camada de computacao. Um Auto Scaling group limitado a uma unica zona continua exposto a indisponibilidade total dela.",
        topic: "Elastic Load Balancing e Auto Scaling",
        options: [
            ["Aumentar o tamanho da instancia EC2 unica e adicionar uma segunda instancia na mesma zona de disponibilidade, como backup.", false],
            ["Colocar as instancias EC2 atras do Amazon CloudFront, mantendo todas elas em uma unica zona de disponibilidade.", false],
            ["Configurar um Auto Scaling group numa unica zona de disponibilidade, apenas com um numero maximo maior de instancias.", false],
            ["Distribuir as instancias EC2 em varias zonas de disponibilidade, com Auto Scaling group atras de um Application Load Balancer.", true],
        ],
    },
    {
        statement:
            "O Amazon RDS for MySQL de uma empresa de SaaS e um ponto unico de falha e tambem sofre lentidao porque consultas pesadas de relatorio competem com o trafego transacional na instancia primaria. A equipe quer, ao mesmo tempo, ganhar protecao de failover automatico e tirar a carga de leitura de relatorios da instancia primaria. Quais duas acoes atendem esses dois objetivos? (Selecione DUAS opcoes.)",
        explanation:
            "O Multi-AZ fornece uma replica sincrona em outra zona de disponibilidade com failover automatico, resolvendo o ponto unico de falha. Read Replicas sao copias assincronas que podem receber trafego de leitura, tirando a carga de relatorios da instancia primaria. Aumentar armazenamento, estender a retencao de backup ou trocar a classe da instancia podem ajudar em outros cenarios, mas nao resolvem failover automatico nem descarregam consultas de leitura da instancia primaria.",
        topic: "RDS Multi-AZ e Read Replicas",
        options: [
            ["Ativar o Multi-AZ na instancia primaria, com uma replica sincrona em standby para failover automatico.", true],
            ["Criar uma ou mais Read Replicas e direcionar as consultas de relatorio para elas.", true],
            ["Aumentar o espaco de armazenamento alocado a instancia primaria do banco de dados.", false],
            ["Ativar backups automatizados com retencao estendida de 35 dias na instancia primaria.", false],
            ["Alterar a classe da instancia primaria para a maior classe disponivel no momento.", false],
        ],
    },
    {
        statement:
            "Uma empresa de varejo online recebe pedidos processados de forma sincrona: a aplicacao web chama diretamente um servico de back-end para cada pedido. Durante liquidacoes relampago, o back-end fica sobrecarregado, as chamadas expiram e pedidos sao perdidos. A equipe quer desacoplar o recebimento do processamento dos pedidos e absorver picos de trafego sem perder pedidos. Qual solucao atende esse requisito com o menor esforco operacional?",
        explanation:
            "Uma fila do Amazon SQS absorve picos de pedidos e desacopla o recebimento do processamento: a aplicacao web publica mensagens na fila e o back-end consome no proprio ritmo, sem perder pedidos durante picos. Aumentar o timeout ou repetir chamadas sincronas nao resolve a sobrecarga do back-end, apenas adia o problema. Aumentar o tamanho das instancias reduz o risco temporariamente, mas nao desacopla os componentes nem escala diante de novos picos.",
        topic: "Amazon SQS",
        options: [
            ["Aumentar o tempo limite das chamadas sincronas da aplicacao web para o servico de back-end.", false],
            ["Fazer a aplicacao web repetir a chamada ao servico de back-end varias vezes ate ter sucesso.", false],
            ["Colocar uma fila do Amazon SQS entre a aplicacao web e o back-end, consumida no proprio ritmo.", true],
            ["Migrar o back-end para instancias Amazon EC2 maiores, capazes de processar pedidos mais rapido.", false],
        ],
    },
    {
        statement:
            "Uma empresa de logistica processa mensagens de atualizacao de remessas com uma fila do Amazon SQS consumida por uma funcao AWS Lambda. Parte das mensagens tem dados malformados e faz a funcao falhar repetidamente, sendo reentregue sem parar e dificultando a identificacao de outros problemas na fila. Qual solucao trata esse cenario de forma automatizada?",
        explanation:
            "Uma dead-letter queue associada a fila principal, com um maxReceiveCount definido, move automaticamente mensagens que falham repetidamente para uma fila separada, isolando o problema sem bloquear o processamento das demais mensagens. Aumentar o visibility timeout so adia a reentrega, sem tratar a causa. Apagar mensagens manualmente nao escala e pode causar perda de dados. Aumentar a memoria da funcao nao corrige mensagens malformadas.",
        topic: "SQS Dead-Letter Queue",
        options: [
            ["Aumentar o tempo de visibilidade (visibility timeout) da fila para um valor bem alto.", false],
            ["Definir uma rotina para apagar manualmente as mensagens com falha pelo console todos os dias.", false],
            ["Configurar uma dead-letter queue com maxReceiveCount, isolando mensagens com falhas repetidas.", true],
            ["Aumentar apenas a memoria alocada para a funcao AWS Lambda que consome a fila.", false],
        ],
    },
    {
        statement:
            "Uma plataforma de streaming de video precisa que um unico evento de upload dispare, em paralelo, tres processos independentes (transcodificacao, geracao de thumbnail e notificacao ao usuario), cada um com sua propria fila, sem que o servico de upload precise conhecer os consumidores. Qual arquitetura atende esse requisito?",
        explanation:
            "O padrao fan-out do Amazon SNS publica uma mensagem em um topico e a entrega a todas as filas do Amazon SQS inscritas, permitindo que cada processo consuma sua propria copia do evento de forma independente e paralela. Uma unica fila do SQS distribui cada mensagem para apenas um consumidor por vez, nao para todos. Chamadas sincronas diretas acoplam o servico de upload aos processos posteriores. Uma unica funcao processando tudo em sequencia elimina o paralelismo e cria um ponto unico de falha.",
        topic: "Amazon SNS Fan-out",
        options: [
            ["Publicar o evento em uma unica fila do Amazon SQS, consumida pelos tres processos ao mesmo tempo.", false],
            ["Publicar o evento em um topico do Amazon SNS com uma fila do SQS inscrita para cada processo.", true],
            ["Fazer o servico de upload chamar diretamente, de forma sincrona, cada um dos tres processos.", false],
            ["Processar transcodificacao, thumbnail e notificacao em sequencia numa unica funcao Lambda.", false],
        ],
    },
    {
        statement:
            "A API de recebimento de pedidos de uma plataforma de venda de ingressos chama, de forma sincrona, um servico de confirmacao de pagamento. Em picos de vendas esse servico vira um gargalo, e algumas requisicoes malformadas falham repetidamente e travam o processamento das demais. A equipe quer desacoplar o recebimento do processamento para absorver picos e impedir que mensagens malformadas bloqueiem a fila indefinidamente. Quais duas acoes atendem esses objetivos? (Selecione DUAS opcoes.)",
        explanation:
            "Uma fila do Amazon SQS entre as camadas desacopla o recebimento do processamento, permitindo absorver picos sem sobrecarregar o servico de pagamento. Uma dead-letter queue com maxReceiveCount isola mensagens malformadas apos um numero definido de tentativas, evitando que travem o processamento das demais. Aumentar o tamanho da instancia ou o timeout apenas adia o gargalo sem desacoplar os componentes. Escalar somente a API de recebimento nao resolve o gargalo no servico de pagamento.",
        topic: "Arquitetura Desacoplada com SQS",
        options: [
            ["Inserir uma fila do Amazon SQS entre a API de recebimento e o servico de confirmacao de pagamento.", true],
            ["Aumentar o tipo da instancia EC2 do servico de confirmacao de pagamento para o maior disponivel.", false],
            ["Configurar uma dead-letter queue com maxReceiveCount para isolar mensagens com falhas repetidas.", true],
            ["Configurar a API de recebimento para chamar o servico de pagamento com um timeout sincrono maior.", false],
            ["Ativar Auto Scaling somente na camada da API de recebimento, mantendo fixo o servico de pagamento.", false],
        ],
    },
    {
        statement:
            "Uma empresa de prontuarios medicos mantem a aplicacao principal na regiao us-east-1 e um ambiente standby totalmente provisionado na regiao us-west-2. A equipe quer que o DNS direcione os usuarios automaticamente para o standby somente quando a regiao principal ficar indisponivel, voltando sozinho para a principal assim que ela se recuperar. Qual configuracao do Amazon Route 53 atende esse requisito?",
        explanation:
            "A politica de failover do Route 53 usa health checks para monitorar o endpoint primario e direciona o trafego automaticamente para o registro secundario quando o primario e considerado nao saudavel, revertendo sozinha quando ele volta a responder. O roteamento por peso distribui trafego proporcionalmente o tempo todo, sem reagir a falhas. O roteamento por latencia otimiza velocidade, nao disponibilidade, e nao isola uma regiao doente. O roteamento por geolocalizacao direciona por localizacao do usuario, nao pela saude do endpoint.",
        topic: "Route 53 Failover Routing",
        options: [
            ["Politica de roteamento por peso, dividindo o trafego igualmente entre as duas regioes o tempo todo.", false],
            ["Politica de failover, com health check no endpoint primario e registro secundario para o standby.", true],
            ["Politica de roteamento por latencia, direcionando cada usuario para a regiao de menor latencia.", false],
            ["Politica de geolocalizacao, direcionando os usuarios conforme sua localizacao geografica.", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que o health check do Amazon Route 53 considere um endpoint como nao saudavel com base em um alarme do Amazon CloudWatch que reflete metricas internas da aplicacao, como o tamanho de uma fila de backlog, e nao apenas a resposta simples de rede. Assim, o failover reagiria tambem a degradacao de desempenho, nao somente a indisponibilidade total. Qual configuracao atende esse requisito?",
        explanation:
            "O Route 53 permite criar health checks baseados no estado de um alarme do CloudWatch, possibilitando que o failover reaja a metricas internas da aplicacao, como tamanho de fila ou taxa de erro, alem da simples disponibilidade de rede. Um health check HTTP padrao so avalia a resposta do endpoint, nao metricas internas. Health checks do target group do Elastic Load Balancing controlam o roteamento interno do balanceador, mas nao acionam failover de DNS sem integracao explicita. O Route 53 nao oferece health check via ICMP.",
        topic: "Route 53 Health Checks",
        options: [
            ["Criar um health check HTTP padrao apontando apenas para uma pagina estatica de status.", false],
            ["Confiar somente nos health checks do target group do ELB, sem integra-los ao Route 53.", false],
            ["Criar um health check do Route 53 baseado no estado de um alarme do Amazon CloudWatch.", true],
            ["Criar um health check que envia pacotes ICMP diretamente para a instancia Amazon EC2.", false],
        ],
    },
    {
        statement:
            "Uma agencia de marketing guarda os arquivos de campanhas no Amazon S3. Um script de um engenheiro sobrescreveu por engano varios arquivos importantes, e a equipe quer conseguir recuperar uma versao anterior de qualquer objeto dali em diante, sem depender de backups manuais separados. Qual configuracao do S3 atende esse requisito?",
        explanation:
            "O versionamento do Amazon S3 mantem todas as versoes anteriores de um objeto sempre que ele e sobrescrito ou excluido, permitindo restaurar qualquer versao anterior. O S3 Transfer Acceleration so melhora a velocidade de upload, sem relacao com historico de versoes. Uma politica de bucket que bloqueia sobrescritas impediria atualizacoes legitimas dos arquivos, o que nao e o objetivo. O S3 Intelligent-Tiering otimiza custo de armazenamento entre classes, sem guardar versoes anteriores dos objetos.",
        topic: "Amazon S3 Versioning",
        options: [
            ["Ativar o versionamento no bucket do Amazon S3, mantendo recuperavel cada versao anterior dos objetos.", true],
            ["Ativar o S3 Transfer Acceleration no bucket, para acelerar o upload dos arquivos de campanha.", false],
            ["Configurar uma politica de bucket que negue qualquer operacao de sobrescrita de objetos existentes.", false],
            ["Ativar o S3 Intelligent-Tiering no bucket, para mover objetos entre classes de armazenamento.", false],
        ],
    },
    {
        statement:
            "Por exigencia regulatoria, uma empresa de servicos financeiros precisa manter uma copia sincronizada automaticamente de todos os objetos do seu bucket principal do Amazon S3 em um bucket localizado em outra Regiao da AWS, garantindo que os dados sobrevivam a um desastre regional. Qual configuracao atende esse requisito?",
        explanation:
            "A Cross-Region Replication (CRR) do Amazon S3 copia objetos automaticamente e de forma continua para um bucket em outra Regiao da AWS, protegendo os dados contra um desastre que afete a regiao principal. A Same-Region Replication mantem a copia na mesma Regiao, o que nao protege contra falha regional. Um job diario de DataSync introduz atraso e depende de agendamento manual, alem de nao ser desenhado para essa replicacao continua entre regioes. O versionamento protege contra sobrescrita e exclusao, mas nao cria copia em outra Regiao.",
        topic: "S3 Cross-Region Replication",
        options: [
            ["Ativar a Cross-Region Replication do bucket principal para um bucket em outra Regiao da AWS.", true],
            ["Ativar a Same-Region Replication do bucket principal para um segundo bucket na mesma Regiao.", false],
            ["Agendar um job diario do AWS DataSync para copiar os objetos para outro bucket na mesma Regiao.", false],
            ["Ativar apenas o versionamento no bucket principal do Amazon S3, sem outra configuracao.", false],
        ],
    },
    {
        statement:
            "Uma empresa de engenharia guarda documentos criticos de projeto no Amazon S3 e quer se proteger tanto contra exclusao acidental por funcionarios quanto contra a perda total da Regiao onde o bucket principal esta localizado. Quais duas configuracoes atendem, juntas, esses dois objetivos? (Selecione DUAS opcoes.)",
        explanation:
            "O versionamento protege contra exclusao ou sobrescrita acidental, mantendo versoes anteriores recuperaveis. A Cross-Region Replication mantem uma copia continua dos objetos em outra Regiao da AWS, protegendo contra a perda total da regiao principal. O S3 Transfer Acceleration so acelera transferencias, o S3 Intelligent-Tiering apenas otimiza custo entre classes de armazenamento, e a Same-Region Replication mantem a copia na mesma Regiao, nao protegendo contra um desastre regional.",
        topic: "Protecao de Dados no Amazon S3",
        options: [
            ["Ativar o versionamento no bucket, preservando versoes de objetos excluidos ou sobrescritos.", true],
            ["Ativar o S3 Transfer Acceleration no bucket, para acelerar uploads vindos de escritorios distantes.", false],
            ["Ativar a Cross-Region Replication para um bucket localizado em outra Regiao da AWS.", true],
            ["Configurar o S3 Intelligent-Tiering no bucket, para mover objetos entre classes de armazenamento.", false],
            ["Ativar a Same-Region Replication para um segundo bucket localizado na mesma Regiao.", false],
        ],
    },
    {
        statement:
            "Uma empresa de recursos humanos quer uma estrategia de disaster recovery com custo controlado, porem mais rapida do que restaurar tudo do zero. A ideia e manter apenas os componentes centrais, como uma replica do banco de dados, em execucao minima na regiao de recuperacao, e so provisionar o restante da pilha a partir de imagens e infraestrutura como codigo quando um desastre for declarado. Qual estrategia de disaster recovery e essa?",
        explanation:
            "Na estrategia de pilot light, apenas os componentes centrais e criticos, como a replica do banco de dados, ficam sempre em execucao na regiao de recuperacao, enquanto o restante da pilha e provisionado a partir de AMIs ou infraestrutura como codigo somente quando o desastre e declarado. No multi-site ativo-ativo, ambas as regioes rodam em capacidade total o tempo todo, custando mais do que o necessario aqui. No backup and restore, nada fica pre-provisionado, o que tornaria a recuperacao mais lenta. No warm standby, uma copia completa e reduzida do ambiente ja fica em execucao, indo alem do descrito.",
        topic: "Disaster Recovery, Pilot Light",
        options: [
            ["Multi-site ativo-ativo, com capacidade total de producao rodando nas duas regioes o tempo todo.", false],
            ["Backup and restore, sem nenhum componente pre-provisionado na regiao de recuperacao.", false],
            ["Pilot light, com os componentes centrais em execucao minima e o restante sob demanda.", true],
            ["Warm standby, com uma copia completa e reduzida do ambiente de producao sempre ativa.", false],
        ],
    },
    {
        statement:
            "Uma plataforma global de negociacao financeira nao pode tolerar mais que poucos segundos de indisponibilidade ou perda de dados, mesmo numa interrupcao total de uma regiao inteira da AWS, e o custo e secundario diante da continuidade do negocio. E necessario ter capacidade total de producao rodando simultaneamente em duas ou mais regioes, com o trafego distribuido entre elas. Qual estrategia de disaster recovery atende esse requisito?",
        explanation:
            "A estrategia multi-site ativo-ativo mantem capacidade total de producao rodando simultaneamente em duas ou mais regioes, com o trafego distribuido entre elas, resultando no menor RTO e RPO possiveis, proximos de zero. Pilot light e warm standby exigem algum tempo de escalonamento apos o desastre, elevando o RTO acima do tolerado neste cenario. Backup and restore tem o maior RTO e RPO entre as estrategias, incompativel com a exigencia de poucos segundos de indisponibilidade.",
        topic: "Disaster Recovery, Multi-Site Ativo-Ativo",
        options: [
            ["Pilot light, com os componentes centrais em execucao minima numa segunda regiao.", false],
            ["Warm standby, com uma copia reduzida do ambiente pronta para escalar numa segunda regiao.", false],
            ["Multi-site ativo-ativo, com capacidade total de producao em multiplas regioes simultaneamente.", true],
            ["Backup and restore, restaurando o ambiente de producao numa segunda regiao a partir de backups.", false],
        ],
    },
    {
        statement:
            "Uma equipe de arquitetura esta definindo a estrategia de disaster recovery de um sistema critico e precisa revisar os conceitos de RTO (Recovery Time Objective) e RPO (Recovery Point Objective) antes de escolher a abordagem. Quais duas afirmacoes sobre RTO e RPO estao corretas? (Selecione DUAS opcoes.)",
        explanation:
            "O RPO mede a quantidade maxima aceitavel de perda de dados, medida em tempo, e orienta a frequencia de backup ou replicacao. Estrategias com RTO mais baixo, como o multi-site ativo-ativo, exigem mais infraestrutura sempre ativa e por isso custam mais do que estrategias como pilot light ou backup and restore. O tempo maximo para restaurar o sistema e definido pelo RTO, nao pelo RPO. O warm standby reduz o tempo de escalonamento, mas nao elimina totalmente o RTO. Backup and restore tem o maior RTO entre as estrategias, o oposto do adequado para RTO de poucos segundos.",
        topic: "Disaster Recovery, RTO e RPO",
        options: [
            ["O RPO define quanto tempo de dados a organizacao aceita perder num desastre, guiando a frequencia de backup.", true],
            ["O RPO define o tempo maximo aceitavel para restaurar o sistema apos um desastre.", false],
            ["O warm standby sempre atinge RTO igual a zero, sem nenhum tempo de escalonamento.", false],
            ["Quanto menor o RTO exigido, geralmente maior o custo da solucao de disaster recovery.", true],
            ["Backup and restore e a estrategia recomendada quando o RTO exigido e de poucos segundos.", false],
        ],
    },
    {
        statement:
            "Uma empresa com recursos em varios servicos (Amazon EBS, Amazon RDS, Amazon DynamoDB, Amazon EFS) e multiplas contas da AWS quer uma forma centralizada de definir politicas de backup, com agendamento, retencao e copia entre regioes, aplicadas de forma consistente a todos esses recursos, em vez de configurar backup separadamente em cada servico. Qual solucao atende esse requisito?",
        explanation:
            "O AWS Backup centraliza a criacao e o gerenciamento de politicas de backup, incluindo agendamento, retencao e copia entre regioes, aplicadas de forma consistente a recursos de multiplos servicos e contas a partir de um unico lugar. Configurar backups separadamente em cada servico aumenta o esforco operacional e a chance de inconsistencia entre politicas. Funcoes Lambda personalizadas exigem manutencao continua e reinventam uma funcionalidade ja gerenciada. A Cross-Region Replication do S3 protege apenas objetos em buckets, sem cobrir os demais recursos citados.",
        topic: "AWS Backup",
        options: [
            ["Usar o AWS Backup para criar um plano de backup centralizado, aplicado aos recursos e contas.", true],
            ["Configurar os backups automatizados nativos separadamente no console de cada servico.", false],
            ["Escrever funcoes AWS Lambda personalizadas para tirar snapshots de cada servico por cron.", false],
            ["Depender apenas da Cross-Region Replication do Amazon S3 para proteger todos os recursos.", false],
        ],
    },
    {
        statement:
            "Uma empresa tira snapshots automaticos diarios de uma instancia do Amazon RDS e de volumes do Amazon EBS, mas todos ficam armazenados na mesma Regiao dos recursos de producao. Um desastre regional destruiria tanto os dados de producao quanto seus snapshots. A equipe precisa que os snapshots tambem existam em outra regiao, com o minimo de esforco operacional continuo. Qual solucao atende esse requisito?",
        explanation:
            "Configurar a copia automatica dos snapshots do Amazon RDS e do Amazon EBS para uma segunda Regiao garante que uma copia dos dados sobreviva mesmo se a regiao de producao inteira for perdida, com pouco esforco operacional continuo apos a configuracao inicial. Aumentar a retencao no mesmo lugar nao protege contra perda regional. O Multi-AZ melhora a disponibilidade dentro da regiao, mas nao move copias para outra regiao. Converter snapshots em AMIs armazenadas na mesma regiao mantem o mesmo risco de perda regional.",
        topic: "Snapshots Cross-Region",
        options: [
            ["Aumentar o periodo de retencao dos snapshots, mantendo-os armazenados na mesma Regiao.", false],
            ["Configurar a copia automatica dos snapshots do RDS e do EBS para uma segunda Regiao.", true],
            ["Ativar apenas o Multi-AZ nos recursos, sem alterar onde os snapshots sao armazenados.", false],
            ["Converter os snapshots em AMIs, mantendo-as armazenadas na mesma Regiao de origem.", false],
        ],
    },
    {
        statement:
            "Um servico de processamento de pagamentos as vezes recebe requisicoes duplicadas para a mesma transacao, porque o cliente tenta novamente apos um timeout de rede, mesmo quando a requisicao original ja tinha sido processada com sucesso no servidor. Isso faz com que alguns clientes sejam cobrados duas vezes. Qual solucao evita esse problema mantendo a capacidade de repetir requisicoes com seguranca?",
        explanation:
            "Uma chave de idempotencia unica por transacao permite que o servico identifique e ignore com seguranca requisicoes duplicadas com a mesma chave, mesmo quando o cliente tenta novamente apos um timeout, evitando cobranca duplicada sem abrir mao de retries. Aumentar o timeout ou o intervalo entre tentativas apenas reduz a frequencia do problema, sem elimina-lo. Remover os retries do cliente prejudica a resiliencia da aplicacao diante de falhas transitorias legitimas.",
        topic: "Idempotencia",
        options: [
            ["Aumentar o timeout do cliente, para que as tentativas de repeticao aconteçam com menos frequencia.", false],
            ["Orientar o cliente a esperar mais tempo antes de tentar novamente a requisicao manualmente.", false],
            ["Exigir uma chave de idempotencia unica por transacao, ignorando requisicoes com a mesma chave.", true],
            ["Remover completamente a logica de repeticao (retry) do lado do cliente de pagamento.", false],
        ],
    },
    {
        statement:
            "Uma aplicacao de processamento de pedidos usa o Amazon SQS com varias instancias consumidoras. Processar cada mensagem leva cerca de 5 minutos, mas o visibility timeout da fila esta configurado para 30 segundos. A equipe percebe que a mesma mensagem esta sendo processada por mais de um consumidor ao mesmo tempo, causando pedidos duplicados. Qual ajuste resolve esse problema?",
        explanation:
            "O visibility timeout determina por quanto tempo uma mensagem fica oculta para outros consumidores apos ser recebida; se ele for menor que o tempo real de processamento, a mensagem volta a ficar visivel e pode ser processada por outro consumidor antes que o primeiro termine, causando duplicidade. Ajustar o visibility timeout para um valor maior que o tempo tipico de processamento evita essa sobreposicao. Aumentar o numero de consumidores agrava o problema, e reduzir para uma unica instancia elimina a escalabilidade. O long polling reduz chamadas vazias a fila, mas nao corrige a visibilidade descrita.",
        topic: "SQS Visibility Timeout",
        options: [
            ["Aumentar o visibility timeout da fila para um valor maior que o tempo tipico de processamento.", true],
            ["Aumentar ainda mais o numero de instancias consumidoras conectadas a fila, para acelerar o processamento.", false],
            ["Reduzir para apenas uma instancia consumidora conectada a fila, eliminando o processamento paralelo.", false],
            ["Ativar somente o long polling na fila do SQS, sem alterar o valor atual do visibility timeout.", false],
        ],
    },
    {
        statement:
            "Uma aplicacao que chama uma API de um servico downstream da AWS as vezes recebe erros de throttling durante picos de trafego. Tentativas imediatas e sem controle pioram o problema, porque muitos clientes tentam novamente no mesmo instante. A equipe quer uma estrategia de retry que reduza a carga sobre o servico com throttling e evite que as tentativas fiquem sincronizadas entre clientes. Quais duas praticas atendem esse objetivo? (Selecione DUAS opcoes.)",
        explanation:
            "O backoff exponencial aumenta progressivamente o intervalo entre tentativas, reduzindo a carga sobre o servico com throttling a cada nova falha. Adicionar jitter aleatorio a esse intervalo evita que multiplos clientes fiquem sincronizados e tentem novamente ao mesmo tempo, o que poderia gerar novos picos de throttling. Retries imediatos em loop e intervalos fixos identicos entre clientes tendem a gerar exatamente esse efeito de sincronizacao. Desativar as tentativas reduz a resiliencia da aplicacao diante de falhas transitorias legitimas.",
        topic: "Retry com Backoff Exponencial",
        options: [
            ["Implementar backoff exponencial, aumentando o tempo de espera entre tentativas sucessivas.", true],
            ["Repetir a requisicao imediatamente, em um loop apertado, ate que ela tenha sucesso.", false],
            ["Adicionar jitter aleatorio ao tempo de espera, evitando tentativas sincronizadas entre clientes.", true],
            ["Configurar todos os clientes para tentar de novo num intervalo fixo identico, a cada 1 segundo.", false],
            ["Desativar completamente as tentativas de repeticao, falhando no primeiro erro de throttling.", false],
        ],
    },
    {
        statement:
            "Uma empresa roda uma aplicacao transacional de alto trafego no Amazon Aurora e precisa, ao mesmo tempo, de failover automatico rapido caso a instancia de escrita falhe, e da capacidade de escalar a leitura com ate 15 replicas de baixa latencia compartilhando o mesmo armazenamento subjacente. Qual configuracao atende os dois requisitos?",
        explanation:
            "Um cluster Multi-AZ do Amazon Aurora permite ate 15 Aurora Replicas compartilhando o mesmo armazenamento distribuido do cluster, que atendem tanto como alvo de failover automatico rapido quanto para escalar o trafego de leitura. O RDS for MySQL com Multi-AZ tradicional mantem apenas uma instancia standby nao acessivel para leitura, sem o mesmo modelo de replicas do Aurora. Uma unica instancia sem replicas depende de restauracao manual, com tempo de recuperacao muito maior. Sem replicas, backups automatizados diarios nao oferecem failover rapido nem escala de leitura.",
        topic: "Amazon Aurora Multi-AZ",
        options: [
            ["Amazon RDS for MySQL com Multi-AZ tradicional, sem o uso de Aurora Replicas.", false],
            ["Um cluster Multi-AZ do Amazon Aurora, usando Aurora Replicas para failover e leitura.", true],
            ["Uma unica instancia do Amazon Aurora, com restauracao manual de snapshot em caso de falha.", false],
            ["Amazon Aurora sem nenhuma replica, apenas com backups automatizados diarios.", false],
        ],
    },
    {
        statement:
            "Uma empresa global de SaaS roda o Amazon Aurora como banco de dados principal e precisa de disaster recovery entre Regioes da AWS, com atraso de replicacao tipicamente abaixo de 1 segundo e a capacidade de promover a regiao secundaria para leitura e escrita completas em minutos, em caso de desastre regional. Qual solucao atende esse requisito?",
        explanation:
            "O Aurora Global Database replica dados entre Regioes da AWS com atraso tipicamente abaixo de um segundo e permite promover a regiao secundaria para leitura e escrita completas em menos de um minuto durante um desastre regional. Uma Read Replica entre regioes de uma instancia RDS padrao tende a ter maior atraso de replicacao e um processo de promocao mais lento. Exportacoes periodicas via S3 sao operacoes em lote, com atraso muito maior que o exigido. O Multi-AZ do Aurora protege contra falha de zona dentro de uma unica Regiao, mas nao contra a perda da regiao inteira.",
        topic: "Aurora Global Database",
        options: [
            ["Uma Read Replica entre regioes de uma instancia padrao do RDS, promovida manualmente.", false],
            ["Replicacao entre regioes, via Amazon S3, de exportacoes periodicas do banco de dados.", false],
            ["Um cluster Multi-AZ do Amazon Aurora dentro de uma unica Regiao da AWS.", false],
            ["Um Aurora Global Database, com uma regiao secundaria pronta para ser promovida.", true],
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
            ["Executar as instâncias em um partition placement group para reduzir a latência", false],
            ["Executar as instâncias em um cluster placement group na mesma Zona de Disponibilidade", true],
            ["Distribuir as instâncias entre várias Zonas de Disponibilidade para reduzir a latência", false],
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
            ["Definir a capacidade mínima do grupo permanentemente igual ao pico da campanha", false],
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
            ["Volume gp3, com até 16.000 IOPS provisionados de forma independente do tamanho.", false],
            ["Volume st1, otimizado para throughput em leituras e gravações sequenciais grandes.", false],
            ["Volume sc1, voltado a dados frios acessados com pouca frequência e baixo custo.", false],
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
            ["Volume st1 (HDD otimizado para throughput), voltado a cargas sequenciais grandes.", true],
            ["Volume gp3 (SSD de propósito geral), voltado a cargas mistas e volumes de boot.", false],
            ["Volume io2 (SSD de IOPS provisionado), voltado a bancos transacionais críticos.", false],
            ["Volume sc1 (HDD de acesso raro), voltado a dados frios acessados poucas vezes.", false],
        ],
    },
    {
        statement:
            "Um laboratório de pesquisa roda simulações de HPC fortemente acopladas em um cluster de instâncias Amazon EC2. A carga precisa de um sistema de arquivos compartilhado com throughput de centenas de GB/s, latência submilissegundo e integração direta com um data lake em Amazon S3 para carregar os conjuntos de treinamento. Qual serviço de armazenamento atende a esse cenário?",
        explanation:
            "O FSx for Lustre foi feito para cargas de HPC, machine learning e processamento de mídia que exigem throughput de centenas de GB/s e latência submilissegundo, além de poder linkar direto com um bucket S3 como repositório de dados. O EFS é compartilhado e elástico, mas seu throughput e latência não chegam ao patamar de um cluster de HPC fortemente acoplado. S3 com Transfer Acceleration acelera upload e download entre pontos distantes, não entrega um sistema de arquivos POSIX de alta performance. EBS Multi-Attach compartilha um volume entre poucas instâncias na mesma AZ, sem o throughput agregado necessário aqui.",
        topic: "Amazon FSx for Lustre",
        options: [
            ["Amazon FSx for Lustre, sistema de arquivos de alta performance integrado ao S3.", true],
            ["Amazon EFS, sistema de arquivos elástico compartilhado entre várias zonas de disponibilidade.", false],
            ["Amazon S3 com Transfer Acceleration, para acelerar o acesso aos dados de treinamento.", false],
            ["Amazon EBS Multi-Attach, para compartilhar um volume entre instâncias do cluster.", false],
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
            ["Amazon FSx for Lustre, sistema de arquivos de alta performance para cargas de HPC.", false],
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
            ["Amazon Aurora Global Database, que replica entre regiões e promove a secundária rapidamente.", true],
            ["Mais Aurora Replicas no cluster atual, para atender aos acessos vindos de outros continentes.", false],
            ["Amazon Aurora com Multi-AZ, mantendo uma instância standby síncrona na mesma região.", false],
            ["Amazon RDS Read Replica entre regiões, configurada com replicação assíncrona manual.", false],
        ],
    },
    {
        statement:
            "Um sistema de relatórios financeiros roda consultas analíticas pesadas contra o mesmo banco Amazon RDS for PostgreSQL que atende a aplicação transacional principal. As consultas de relatório estão degradando o desempenho das transações de produção. Qual solução reduz esse impacto com o menor esforço de implementação?",
        explanation:
            "A RDS Read Replica replica de forma assíncrona a partir da instância principal e pode receber as consultas de relatório, tirando essa carga da instância de produção com esforço baixo: só criar a réplica e redirecionar a conexão. O standby do Multi-AZ existe para failover automático e não aceita conexões de leitura. Aumentar a classe da instância principal ataca o sintoma, não a causa, e ainda concentra as duas cargas na mesma instância. Migrar para Redshift resolveria o problema analítico, mas exige pipeline de ETL e modelagem de um data warehouse, um esforço bem maior do que o pedido.",
        topic: "Amazon RDS Read Replica",
        options: [
            ["Criar uma RDS Read Replica e apontar as consultas de relatório para ela.", true],
            ["Ativar o Multi-AZ na instância principal e direcionar leituras para o standby.", false],
            ["Aumentar a classe da instância principal para suportar as duas cargas juntas.", false],
            ["Migrar o banco para um cluster Amazon Redshift dedicado aos relatórios.", false],
        ],
    },
    {
        statement:
            "Uma tabela do Amazon DynamoDB recebe tráfego de leitura extremamente imprevisível, com picos que aparecem sem aviso prévio, e a aplicação precisa de latência de leitura na casa dos microssegundos para os itens mais acessados. Quais DUAS ações atendem a esses requisitos sem exigir planejamento prévio de capacidade? (Selecione DUAS opções.)",
        explanation:
            "O modo On-Demand cobra por requisição e escala instantaneamente para picos imprevisíveis, sem planejamento de capacidade. O DAX é um cache gerenciado em memória para o DynamoDB que reduz a latência de leitura de milissegundos para microssegundos nos itens mais acessados, sem mudar a lógica da aplicação. O modo Provisionado com Auto Scaling ainda depende de metas de utilização e reage com atraso a picos súbitos, além de não reduzir a latência para microssegundos. O DynamoDB não tem o conceito de read replicas como o RDS ou o Aurora. O ElastiCache pode servir como cache na frente de vários bancos, mas não é a peça padrão integrada ao DynamoDB para esse caso, papel que é do DAX.",
        topic: "DynamoDB On-Demand e DAX",
        options: [
            ["Configurar a tabela para o modo de capacidade On-Demand.", true],
            ["Colocar o Amazon DynamoDB Accelerator (DAX) na frente da tabela.", true],
            ["Configurar o modo de capacidade Provisionado com Auto Scaling.", false],
            ["Criar read replicas para a tabela distribuir as leituras.", false],
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
            ["Amazon Redshift, data warehouse colunar para consultas analíticas em grande escala.", true],
            ["Amazon RDS for PostgreSQL, banco relacional otimizado para cargas transacionais.", false],
            ["Amazon Athena, serviço de consulta ad hoc direto sobre arquivos no Amazon S3.", false],
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
            ["Amazon Kinesis Data Firehose, com entrega gerenciada e transformação via Lambda.", true],
            ["Amazon Kinesis Data Streams, com uma aplicação consumidora lendo os shards.", false],
            ["Amazon SQS, com um worker consumindo mensagens e gravando no S3 e no Redshift.", false],
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
            ["O S3 escala automaticamente por prefixo, sem exigir chaves ou prefixos aleatórios.", true],
            ["O S3 exige prefixos aleatórios para distribuir a carga entre partições do bucket.", false],
            ["O S3 limita cada bucket a um único prefixo de alta performance por vez.", false],
            ["O S3 exige a criação de múltiplos buckets para superar o limite de requisições.", false],
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
            ["Compute Savings Plans, aplicáveis a EC2, Fargate e Lambda", true],
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
            ["Dedicated Instances, hardware físico exclusivo mas sem visibilidade de sockets", false],
            ["Instâncias Reservadas Standard, com desconto por compromisso de uso contínuo", false],
            ["Instâncias On-Demand, cobradas por hora em hardware compartilhado", false],
            ["Dedicated Hosts, servidor físico dedicado com visibilidade de sockets e núcleos", true],
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
            ["S3 Intelligent-Tiering, que move objetos entre níveis pelo padrão de acesso", true],
            ["S3 Standard-IA, com tarifa de recuperação cobrada por gigabyte acessado", false],
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
            ["S3 Glacier Flexible Retrieval, com recuperação em minutos ou horas", false],
            ["S3 Glacier Deep Archive, com recuperação em até 12 horas", false],
            ["S3 Intelligent-Tiering, com movimentação automática entre níveis", false],
            ["S3 Standard-IA, acesso em milissegundos e menor custo de armazenamento", true],
        ],
    },
    {
        statement:
            "Uma empresa gera diariamente arquivos de saída de um pipeline de processamento de imagens. Esses arquivos podem ser recriados a partir dos dados de origem a qualquer momento, são acessados raramente após a geração e a perda ocasional de uma cópia não traz problema real ao negócio. A empresa quer a classe de armazenamento do S3 de menor custo para dados infrequentes que não precisam de redundância entre zonas de disponibilidade. Qual classe atende esse caso?",
        explanation:
            "S3 One Zone-IA armazena dados em uma única zona de disponibilidade, o que reduz o custo em relação às classes com redundância multi-zona, e se encaixa em dados recriáveis cuja perda ocasional é aceitável. S3 Standard-IA e S3 Standard replicam os dados em múltiplas zonas de disponibilidade, o que custa mais e não é necessário quando o dado pode ser regenerado. Glacier Instant Retrieval também replica entre múltiplas zonas e tem foco em dados de acesso raro de longo prazo, não no menor custo para esse tipo específico de dado recriável.",
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
            ["Migrar o volume para gp3 e definir IOPS e throughput de forma independente do tamanho", true],
            ["Reduzir o tamanho do volume gp2 para diminuir o IOPS provisionado automaticamente", false],
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
            ["AWS Cost and Usage Report, com dados detalhados em arquivos no Amazon S3", false],
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
            ["AWS Compute Optimizer, com recomendações de dimensionamento de EC2", false],
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
];

async function seed() {
    let [simulado] = await db.select().from(simulados).where(eq(simulados.slug, SLUG));
    if (!simulado) {
        [simulado] = await db
            .insert(simulados)
            .values({
                slug: SLUG,
                name: "AWS Certified Solutions Architect Associate (SAA-C03)",
                provider: "aws",
                code: "SAA-C03",
                level: "Associate",
                description:
                    "Simulado no formato da prova SAA-C03: 130 minutos, corte de 72%. Mistura resposta unica e multipla, alinhado aos 4 dominios de arquitetura.",
                durationMinutes: 130,
                questionCount: 65,
                passPercent: 72,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({ provider: "aws", code: "SAA-C03", level: "Associate" })
        .where(eq(simulados.id, simulado.id));

    const [{ n }] = await db
        .select({ n: count() })
        .from(simuladoQuestions)
        .where(eq(simuladoQuestions.simuladoId, simulado.id));
    if (Number(n) > 0) {
        console.log(`Simulado ja tem ${n} questoes, nada a fazer.`);
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
    console.log(`Seed concluido: ${QUESTOES.length} questoes inseridas.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
