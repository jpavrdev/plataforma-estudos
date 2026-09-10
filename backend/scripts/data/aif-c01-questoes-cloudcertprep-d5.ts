// Questões do simulado AWS Certified AI Practitioner (AIF-C01), domínio 5 da prova
// (Security, Compliance, and Governance), traduzidas e adaptadas do banco aberto cloudcertprep:
// https://github.com/nastaso/cloudcertprep (commit 9367b00).
//
// Copyright (c) 2026 Alex Santonastaso. Distribuído sob a licença MIT, cujo texto
// completo está em LICENSE-cloudcertprep.txt, nesta mesma pasta.
//
// A adaptação segue as regras do banco da casa: enunciado e explicação em
// português, nomes de serviço atualizados, opções equilibradas em tamanho e
// questões de múltipla resposta com cinco opções.
import type { Questao } from "./aif-c01-questoes.ts";

export const QUESTOES_CLOUDCERTPREP_D5: Questao[] = [
    {
        statement:
            "Uma startup mantém um chatbot baseado em um foundation model (FM) do Amazon Bedrock que precisa ler arquivos de um bucket do Amazon S3. Os objetos estão criptografados com SSE-KMS usando uma chave gerenciada pelo cliente no AWS KMS, e toda tentativa de leitura falha com acesso negado. O que resolve o problema?",
        explanation:
            "Com SSE-KMS, ler o objeto exige, além do acesso ao bucket, a permissão kms:Decrypt na chave usada, e o papel do IAM que o Amazon Bedrock assume não a tinha. Prompt engineering não concede acesso, remover dados sensíveis não resolve a permissão ausente e abrir o bucket à internet é inseguro e também não dá acesso à chave.",
        topic: "Segurança e governança",
        options: [
            [
                "Dar ao papel do IAM que o Amazon Bedrock assume a permissão de descriptografar os objetos com a chave do AWS KMS",
                true,
            ],
            [
                "Usar prompt engineering para indicar ao modelo em qual prefixo do bucket do Amazon S3 os arquivos estão guardados",
                false,
            ],
            [
                "Remover os dados sensíveis dos arquivos do Amazon S3 antes de o chatbot tentar ler o conteúdo novamente",
                false,
            ],
            [
                "Alterar a política do bucket do Amazon S3 para permitir acesso público pela internet aos arquivos do chatbot",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa audita periodicamente suas operações em conjunto com fornecedores independentes de software (ISVs). Ela precisa acessar sob demanda os relatórios de conformidade desses ISVs e ser avisada por email quando a AWS publicar relatórios novos. Qual serviço da AWS atende a esses requisitos?",
        explanation:
            "O AWS Artifact reúne relatórios de conformidade da AWS e de ISVs que vendem no AWS Marketplace, e permite configurar notificações por email quando surgem documentos novos. O AWS Data Exchange trata de conjuntos de dados de terceiros, o Trusted Advisor recomenda boas práticas e o AWS Config avalia a configuração dos recursos.",
        topic: "Segurança e governança",
        options: [
            [
                "AWS Artifact, que reúne relatórios de conformidade da AWS e de ISVs e envia notificações",
                true,
            ],
            [
                "AWS Data Exchange, que distribui conjuntos de dados de terceiros para consumo nas contas AWS",
                false,
            ],
            [
                "AWS Trusted Advisor, que verifica a conta e recomenda boas práticas de custo e segurança",
                false,
            ],
            [
                "AWS Config, que registra as configurações dos recursos e avalia a conformidade com regras",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma seguradora está classificando seus projetos de IA generativa segundo a Generative AI Security Scoping Matrix da AWS. Qual escopo deixa a seguradora com a MAIOR responsabilidade de segurança?",
        explanation:
            "Na matriz, o escopo 5 (modelo treinado do zero com dados próprios) dá à empresa controle total sobre dados, treino, implantação e proteções, e por isso a maior responsabilidade. Fine-tuning de FM de terceiros (escopo 4), aplicação sobre FM de terceiros (escopo 3) e aplicação corporativa pronta (escopo 2) passam parte crescente dessa responsabilidade ao provedor.",
        topic: "Segurança e governança",
        options: [
            [
                "Construir e treinar do zero um modelo de IA generativa com dados próprios da empresa",
                true,
            ],
            [
                "Fazer fine-tuning de um foundation model (FM) de terceiros com os dados da própria empresa",
                false,
            ],
            [
                "Criar uma aplicação própria sobre um foundation model (FM) de terceiros já existente",
                false,
            ],
            [
                "Usar uma aplicação corporativa de terceiros que já traz recursos de IA generativa embutidos",
                false,
            ],
        ],
    },
    {
        statement:
            "Um profissional de IA usa um modelo base do Amazon Bedrock para resumir conversas do atendimento e quer guardar registros com os dados de entrada e de saída do modelo para monitoramento. Qual estratégia ele deve adotar?",
        explanation:
            "O registro de invocações do Amazon Bedrock, desativado por padrão, grava a requisição, a resposta e os metadados de cada chamada no CloudWatch Logs ou no Amazon S3. O CloudTrail registra a chamada de API, mas não o conteúdo do prompt e da resposta, o EventBridge só roteia eventos e o AWS Config acompanha configurações de recursos.",
        topic: "Segurança e governança",
        options: [
            [
                "Ativar o registro de invocações de modelos (model invocation logging) no Amazon Bedrock",
                true,
            ],
            [
                "Definir o AWS CloudTrail como destino dos registros de entrada e saída do modelo",
                false,
            ],
            [
                "Configurar o registro de invocações de modelos a partir de regras do Amazon EventBridge",
                false,
            ],
            ["Definir o AWS Config como destino dos registros de entrada e saída do modelo", false],
        ],
    },
    {
        statement:
            "Uma empresa vai criar uma aplicação de LLM com o Amazon Bedrock usando dados de clientes guardados no Amazon S3. A política interna determina que cada equipe acesse somente os registros dos próprios clientes. Qual solução atende a esses requisitos?",
        explanation:
            "Um papel de serviço personalizado por equipe, com permissão só para os dados dos clientes daquela equipe, aplica o menor privilégio e impede acesso cruzado. Um papel compartilhado com acesso total ao S3 continua amplo, depender de a equipe informar o cliente não é um controle efetivo e mascarar dados abrindo o bucket não separa o acesso por equipe.",
        topic: "Segurança e governança",
        options: [
            [
                "Criar para cada equipe um papel de serviço personalizado do Amazon Bedrock limitado aos dados dos seus clientes",
                true,
            ],
            [
                "Criar um único papel de serviço do Amazon Bedrock com acesso total ao S3 e papéis do IAM por equipe para as pastas",
                false,
            ],
            [
                "Criar um único papel de serviço com acesso ao S3 e exigir que cada equipe informe o cliente em toda requisição",
                false,
            ],
            [
                "Mascarar os dados pessoais no S3 e alterar a política do bucket para liberar às equipes os dados dos clientes",
                false,
            ],
        ],
    },
    {
        statement:
            "Um profissional de IA fez fine-tuning de um modelo personalizado no Amazon Bedrock com um conjunto de dados que continha registros confidenciais. Agora ele precisa garantir que as respostas de inferência do modelo nunca se baseiem nesses dados. O que ele deve fazer?",
        explanation:
            "Como os dados confidenciais entraram no treino, o modelo pode reproduzi-los, e a própria AWS orienta excluir o modelo, filtrar os dados e criar um novo. Mascarar ou criptografar as respostas atua depois que o modelo já aprendeu com os dados, e criptografar o modelo com o AWS KMS protege em repouso, mas não muda o que ele gera.",
        topic: "Segurança e governança",
        options: [
            [
                "Excluir o modelo personalizado, tirar os dados confidenciais do conjunto de treino e treinar de novo",
                true,
            ],
            [
                "Mascarar os dados confidenciais nas respostas de inferência com mascaramento dinâmico de dados antes da entrega",
                false,
            ],
            [
                "Criptografar os dados confidenciais presentes nas respostas de inferência usando o Amazon SageMaker AI",
                false,
            ],
            [
                "Criptografar os dados confidenciais armazenados no modelo personalizado com chaves do AWS KMS",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe cria e treina modelos de ML em notebooks do Amazon SageMaker Studio e guarda os dados em um bucket do Amazon S3. Ela precisa controlar o caminho que os dados percorrem entre o Amazon S3 e os notebooks. Qual solução atende a esse requisito?",
        explanation:
            "Com o Studio em modo somente VPC e um endpoint de VPC para o Amazon S3, o tráfego entre os notebooks e o bucket segue por um caminho privado que a equipe controla, sem passar pela internet. O Macie descobre dados sensíveis e o Inspector busca vulnerabilidades, sem controlar o caminho, e o Glacier Deep Archive é só uma classe de arquivamento.",
        topic: "Segurança e governança",
        options: [
            [
                "Configurar o SageMaker AI para usar uma VPC com um endpoint de VPC para o Amazon S3",
                true,
            ],
            [
                "Usar o Amazon Macie para monitorar os dados acessados pelos notebooks do SageMaker Studio",
                false,
            ],
            [
                "Usar o Amazon Inspector para monitorar o tráfego dos notebooks do SageMaker Studio",
                false,
            ],
            [
                "Configurar o SageMaker AI para gravar os dados na classe S3 Glacier Deep Archive",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa modelos personalizados no Amazon Bedrock em uma aplicação de IA generativa e quer que os artefatos de modelo gerados pelos jobs de customização sejam criptografados com uma chave controlada por ela. Qual serviço da AWS atende a esses requisitos?",
        explanation:
            "O Amazon Bedrock criptografa modelos personalizados com chaves da AWS por padrão, mas aceita uma chave gerenciada pelo cliente no AWS KMS, que a empresa cria, controla e pode revogar. O Macie descobre dados sensíveis, o Inspector procura vulnerabilidades e o Secrets Manager guarda credenciais, e nenhum deles fornece a chave que cifra os artefatos.",
        topic: "Segurança e governança",
        options: [
            ["AWS Key Management Service (AWS KMS), com uma chave gerenciada pelo cliente", true],
            ["Amazon Macie, que descobre e classifica dados sensíveis armazenados no S3", false],
            ["AWS Secrets Manager, que armazena e alterna credenciais e outros segredos", false],
            [
                "Amazon Inspector, que verifica vulnerabilidades de software nas cargas de trabalho",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa precisa registrar todas as chamadas feitas à API do Amazon Bedrock e guardar esses registros com segurança por cinco anos, pelo menor custo possível, sem saber com que frequência eles serão consultados. Quais opções, um serviço da AWS e uma classe de armazenamento do Amazon S3, atendem a esses requisitos? (Selecione DUAS opções.)",
        explanation:
            "O AWS CloudTrail registra as chamadas à API do Amazon Bedrock, como InvokeModel, e entrega os logs em um bucket do S3, onde o Intelligent-Tiering move os objetos para camadas mais baratas conforme o acesso. O CloudWatch foca métricas e alarmes, o AWS Config acompanha configurações e o S3 Standard custa mais para dados pouco acessados por anos.",
        topic: "Segurança e governança",
        options: [
            ["AWS CloudTrail, que registra as chamadas de API feitas aos serviços da AWS", true],
            ["Amazon S3 Intelligent-Tiering, que move os objetos entre camadas de acesso", true],
            ["Amazon CloudWatch, que coleta métricas e alarmes operacionais dos recursos", false],
            ["AWS Config, que registra as mudanças de configuração dos recursos da conta", false],
            [
                "Amazon S3 Standard, que mantém os objetos sempre na camada de acesso frequente",
                false,
            ],
        ],
    },
    {
        statement:
            "Um hospital está criando um sistema de IA que ajuda médicos a diagnosticar doenças a partir de prontuários e imagens médicas. Por lei, os dados sensíveis dos pacientes precisam permanecer no país onde estão armazenados. Qual estratégia de governança de dados garante a conformidade e protege a privacidade?",
        explanation:
            "Residência de dados define a localização geográfica em que os dados são armazenados e processados, atendendo à lei que exige manter os dados dos pacientes no país. Qualidade trata de precisão e completude, enriquecimento acrescenta informações e descoberta ajuda a encontrar conjuntos, sem controlar onde os dados ficam.",
        topic: "Segurança e governança",
        options: [
            ["Residência de dados, definindo a localização geográfica onde os dados ficam", true],
            [
                "Qualidade de dados, garantindo a precisão e a completude dos registros clínicos",
                false,
            ],
            ["Enriquecimento de dados, acrescentando informações externas aos prontuários", false],
            [
                "Descoberta de dados, facilitando que as equipes encontrem os conjuntos disponíveis",
                false,
            ],
        ],
    },
    {
        statement:
            "Um banco global criou uma aplicação de ML que analisa dados de mercado para identificar tendências. Durante todo o desenvolvimento, o banco quer verificar continuamente se as configurações dos recursos seguem suas políticas internas e os frameworks regulatórios do setor. Qual serviço da AWS ajuda o banco a avaliar essa conformidade?",
        explanation:
            "O AWS Config avalia continuamente a configuração dos recursos com regras, e os conformance packs trazem modelos prontos de frameworks como PCI DSS e HIPAA. O CloudWatch acompanha métricas e alarmes, o CloudTrail registra chamadas de API que servem de evidência, mas não avalia conformidade, e o Inspector procura vulnerabilidades de software.",
        topic: "Segurança e governança",
        options: [
            [
                "AWS Config, com regras e conformance packs que avaliam os recursos continuamente",
                true,
            ],
            [
                "Amazon CloudWatch, com métricas e alarmes sobre o desempenho dos recursos em uso",
                false,
            ],
            ["AWS CloudTrail, com o histórico das chamadas de API feitas na conta do banco", false],
            [
                "Amazon Inspector, com varreduras contínuas de vulnerabilidades de software nas cargas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa de saúde quer treinar um modelo na AWS com dados de vários hospitais parceiros, mas os dados de cada hospital não podem sair do ambiente dele por questões de privacidade e conformidade. Qual técnica de machine learning atende a esse requisito?",
        explanation:
            "No aprendizado federado, cada participante treina o modelo localmente e só compartilha atualizações, então os dados brutos de cada hospital nunca saem do ambiente dele. Transferência reaproveita um modelo pronto, não supervisionado busca padrões sem rótulos e reforço aprende com recompensas, e nenhuma delas foi feita para manter os dados isolados.",
        topic: "Segurança e governança",
        options: [
            [
                "Aprendizado federado, que treina um modelo único sem centralizar os dados brutos",
                true,
            ],
            [
                "Aprendizado por transferência, que reaproveita um modelo já treinado em outra tarefa",
                false,
            ],
            [
                "Aprendizado não supervisionado, que encontra padrões em dados sem rótulos definidos",
                false,
            ],
            [
                "Aprendizado por reforço, que aprende por tentativa e erro a partir de recompensas",
                false,
            ],
        ],
    },
    {
        statement:
            "Um hospital quer fazer fine-tuning de um foundation model (FM) com serviços da AWS, mantendo os dados privados e dentro da Região da AWS onde estão armazenados. Quais medidas atendem a esses requisitos da forma MAIS econômica? (Selecione DUAS opções.)",
        explanation:
            "Chamar a API do Amazon Bedrock mantém o fine-tuning no serviço gerenciado e na Região escolhida, e o AWS PrivateLink leva o tráfego da VPC ao Bedrock pela rede privada da AWS, sem infraestrutura extra. Outposts e servidores locais somam custo de hardware e operação, e mover os dados para outra Região descumpre o requisito.",
        topic: "Segurança e governança",
        options: [
            [
                "Usar a API do Amazon Bedrock para fazer o fine-tuning na mesma Região dos dados",
                true,
            ],
            ["Usar o AWS PrivateLink com uma VPC para chegar ao Amazon Bedrock sem internet", true],
            [
                "Hospedar o modelo no data center do hospital com racks do AWS Outposts dedicados",
                false,
            ],
            ["Implantar a API do Amazon Bedrock em servidores do data center do hospital", false],
            [
                "Copiar os dados para outra Região com preço menor e fazer o fine-tuning por lá",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa já usa o Amazon Bedrock e quer controlar quais modelos cada grupo de funcionários pode invocar. Qual solução atende a esses requisitos?",
        explanation:
            "Políticas do IAM podem permitir ou negar ações do Amazon Bedrock, como InvokeModel, apontando o ARN de cada foundation model, e assim definir quais modelos cada grupo usa. Papéis de serviço dão permissões a serviços, não a funcionários, o AWS STS só emite credenciais temporárias e o Amazon Inspector procura vulnerabilidades, sem controlar acesso.",
        topic: "Segurança e governança",
        options: [
            [
                "Usar políticas do IAM que permitam ou neguem ações do Amazon Bedrock em cada modelo",
                true,
            ],
            [
                "Usar papéis de serviço do IAM para restringir a assinatura dos modelos no AWS Marketplace",
                false,
            ],
            [
                "Usar o Amazon Inspector para monitorar quais funcionários acessam cada um dos modelos",
                false,
            ],
            [
                "Usar o AWS STS para gerar credenciais temporárias sempre que alguém for usar um modelo",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa analisa documentos confidenciais com um modelo de terceiros no Amazon Bedrock e está preocupada com a privacidade. Qual afirmação explica como o Amazon Bedrock protege esses dados em relação ao provedor do modelo?",
        explanation:
            "Os modelos rodam em contas de implantação operadas pela equipe do Amazon Bedrock, às quais os provedores não têm acesso, então eles não veem prompts, respostas nem logs dos clientes. Por isso as opções que falam em enviar as saídas, anonimizar e compartilhar ou remover dados sensíveis antes do envio estão erradas: nada é repassado ao provedor.",
        topic: "Segurança e governança",
        options: [
            [
                "As entradas e as saídas do modelo não são compartilhadas com os provedores dos modelos",
                true,
            ],
            [
                "As entradas ficam confidenciais, mas as saídas do modelo são enviadas ao provedor do modelo",
                false,
            ],
            [
                "As entradas e as saídas são anonimizadas e depois compartilhadas com o provedor do modelo",
                false,
            ],
            [
                "As entradas e as saídas passam por remoção de dados sensíveis antes de irem ao provedor",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa obtém uma certificação ISO voltada à gestão de riscos de IA e ao uso responsável da tecnologia. O que essa certificação indica sobre a empresa?",
        explanation:
            "Uma certificação ISO de gestão de IA, como a ISO/IEC 42001, atesta que o sistema de gestão de IA da organização, com seus processos e controles para desenvolver e governar IA, atende à norma. Ela não certifica automaticamente cada funcionário, cada integrante das equipes nem cada sistema de IA, que exigiriam avaliações próprias.",
        topic: "Segurança e governança",
        options: [
            [
                "O sistema de gestão de IA da empresa foi auditado e certificado segundo a norma",
                true,
            ],
            [
                "Todos os funcionários da empresa passaram a ter uma certificação ISO individual",
                false,
            ],
            [
                "Todos os sistemas de IA que a empresa utiliza foram certificados um a um pela ISO",
                false,
            ],
            [
                "Todos os integrantes das equipes de aplicações de IA ganharam certificação ISO",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa mantém regras que definem por quanto tempo cada tipo de informação deve ser guardado e quando deve ser excluído. Qual estratégia de governança de dados isso descreve?",
        explanation:
            "Retenção de dados é o conjunto de políticas que define por quanto tempo os dados ficam guardados e quando devem ser excluídos. Padrões de qualidade tratam de precisão e completude, armazenamento de logs trata de onde os registros ficam e desidentificação remove dados que identificam pessoas, sem fixar prazos de guarda.",
        topic: "Segurança e governança",
        options: [
            ["Retenção de dados, com prazos de guarda e momentos de exclusão definidos", true],
            ["Padrões de qualidade de dados, com critérios de precisão e completude", false],
            ["Armazenamento de logs, com a definição de onde os registros ficam guardados", false],
            [
                "Desidentificação de dados, com a remoção de informações que identificam pessoas",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa criou um chatbot com um modelo do Amazon SageMaker JumpStart ajustado por fine-tuning e precisa atender a vários frameworks regulatórios. Quais capacidades ajudam a empresa a demonstrar conformidade? (Selecione DUAS opções.)",
        explanation:
            "Reguladores esperam controles de segurança: proteção de dados (criptografia, controle de acesso) e detecção de ameaças mostram que as informações sensíveis estão protegidas e que os riscos são identificados. Otimização de custos, escalabilidade automática e lançamento mais rápido são metas de negócio e desempenho que não demonstram conformidade.",
        topic: "Segurança e governança",
        options: [
            [
                "Proteção de dados, com criptografia e controle de acesso às informações sensíveis",
                true,
            ],
            ["Detecção de ameaças, identificando atividades suspeitas e riscos de segurança", true],
            ["Otimização de custos, ajustando recursos e contratos ao volume real de uso", false],
            [
                "Escalabilidade automática, adaptando a capacidade à demanda de usuários do chatbot",
                false,
            ],
            ["Lançamento mais rápido, acelerando a entrega de novas versões do chatbot", false],
        ],
    },
    {
        statement:
            "Um banco vai fazer fine-tuning de um LLM no Amazon Bedrock para responder dúvidas sobre empréstimos. O modelo nunca pode revelar dados privados de clientes, e a política do banco proíbe que esses dados fiquem incorporados ao modelo. Qual solução atende a esses requisitos?",
        explanation:
            "Tirar a PII antes do fine-tuning impede que o modelo aprenda e reproduza esses dados, e a AWS alerta que modelos ajustados podem repetir trechos do treino. Os Guardrails mascaram a resposta, mas o dado continua incorporado ao modelo, criptografar no S3 protege em repouso sem impedir o aprendizado e o Top K só muda a amostragem de tokens.",
        topic: "Segurança e governança",
        options: [
            [
                "Remover os dados pessoais (PII) do conjunto de dados antes de iniciar o fine-tuning",
                true,
            ],
            [
                "Aplicar o Amazon Bedrock Guardrails para mascarar dados pessoais nas respostas geradas",
                false,
            ],
            [
                "Criptografar os dados no Amazon S3 com o AWS KMS antes de iniciar o fine-tuning",
                false,
            ],
            [
                "Aumentar o parâmetro Top K para diversificar os tokens escolhidos em cada resposta",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer controlar quais foundation models (FMs) disponíveis publicamente os seus funcionários podem acessar. Qual solução atende a esse requisito?",
        explanation:
            "Os hubs privados do SageMaker JumpStart permitem que administradores selecionem os FMs aprovados, e os usuários só encontram e implantam os modelos desse catálogo curado. O Cost Explorer analisa gastos, o AWS Artifact oferece documentos de conformidade e o Trusted Advisor recomenda boas práticas, e nenhum deles restringe quais modelos os funcionários acessam.",
        topic: "Segurança e governança",
        options: [
            [
                "Criar no Amazon SageMaker JumpStart um hub privado apenas com os FMs aprovados",
                true,
            ],
            [
                "Analisar o uso de cada FM no AWS Cost Explorer e cortar os que tiverem maior gasto",
                false,
            ],
            [
                "Baixar do AWS Artifact os relatórios de conformidade dos provedores de cada FM",
                false,
            ],
            [
                "Revisar as recomendações do AWS Trusted Advisor sobre os FMs usados pela conta",
                false,
            ],
        ],
    },
    {
        statement:
            "Um chatbot de IA generativa baseado em um foundation model (FM) do Amazon Bedrock está vulnerável a injeção de prompt. Como a empresa pode proteger o chatbot com o MENOR esforço?",
        explanation:
            "O filtro de ataques de prompt do Amazon Bedrock Guardrails detecta injeção de prompt e jailbreak nas entradas e é configurado sem retreinar nada. Fine-tuning exige dados e um job de treino, trocar de FM não elimina a injeção e exemplos few-shot orientam o formato das respostas, mas não barram entradas maliciosas.",
        topic: "Prompt engineering",
        options: [
            [
                "Configurar no Amazon Bedrock Guardrails o filtro de ataques de prompt nas entradas",
                true,
            ],
            [
                "Fazer fine-tuning do FM com exemplos para que ele evite responder a pedidos nocivos",
                false,
            ],
            [
                "Trocar o FM atual por outro foundation model disponível no catálogo do Bedrock",
                false,
            ],
            ["Acrescentar mais exemplos few-shot ao prompt mostrando como recusar pedidos", false],
        ],
    },
    {
        statement:
            "Uma empresa vai disponibilizar LLMs do Amazon Bedrock para várias equipes e quer usá-los com segurança desde o início. Qual prática atende a esse objetivo?",
        explanation:
            "Papéis e políticas do IAM com menor privilégio limitam quem pode invocar quais modelos e ações do Amazon Bedrock, a base do uso seguro. Jobs de avaliação medem a qualidade das respostas e não protegem o acesso, o Trusted Advisor não avalia modelos e o CloudWatch Logs guarda registros, sem explicar modelos nem detectar viés.",
        topic: "Segurança e governança",
        options: [
            [
                "Configurar papéis e políticas do IAM com base no princípio do menor privilégio",
                true,
            ],
            [
                "Ativar o AWS Trusted Advisor para executar jobs automáticos de avaliação dos modelos",
                false,
            ],
            [
                "Ativar os jobs automáticos de avaliação de modelos do Amazon Bedrock para cada equipe",
                false,
            ],
            [
                "Usar o Amazon CloudWatch Logs para tornar os modelos explicáveis e monitorar viés",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa está montando um framework de governança de IA para gerar confiança e implantar uma IA centrada nas pessoas. Qual característica é típica desse tipo de framework?",
        explanation:
            "Frameworks de governança de IA se caracterizam por políticas e diretrizes sobre uso de dados, transparência, IA responsável e conformidade, o que gera confiança e sustenta uma IA centrada nas pessoas. Expandir iniciativas, alinhar projetos a metas de receita e impulsionar o crescimento são objetivos de negócio, não traços de governança.",
        topic: "Segurança e governança",
        options: [
            [
                "Criar políticas e diretrizes de dados, transparência, IA responsável e conformidade",
                true,
            ],
            [
                "Expandir as iniciativas de IA por todas as unidades de negócio para maximizar o valor",
                false,
            ],
            [
                "Alinhar os projetos de IA às metas de receita e às expectativas das partes interessadas",
                false,
            ],
            [
                "Impulsionar a transformação do negócio e o crescimento competitivo por meio da IA",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa IA para gerar o score de crédito dos clientes nos pedidos de empréstimo e planeja expandir para um novo mercado geográfico. Para operar lá, que tipo de legislação de conformidade a empresa deve revisar?",
        explanation:
            "O score de crédito por IA é uma decisão automatizada sobre pessoas, então a empresa precisa revisar as leis locais de responsabilização algorítmica, que tratam de justiça, transparência e impacto dessas decisões. Leis sobre dados de saúde, de cartões de pagamento e educacionais cobrem outros tipos de dado e não o uso de algoritmos no crédito.",
        topic: "Segurança e governança",
        options: [
            [
                "Leis locais de responsabilização algorítmica que regulam decisões automatizadas",
                true,
            ],
            [
                "Leis locais de proteção de dados de saúde e de informações clínicas de pacientes",
                false,
            ],
            [
                "Leis locais de proteção de dados de cartões de pagamento usados pelos clientes",
                false,
            ],
            [
                "Leis locais de privacidade de dados educacionais de alunos e instituições de ensino",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa quer garantir que seu sistema de IA seja justo e explicável e decide exigir um treinamento para a equipe de desenvolvimento de IA. Qual treinamento atende a esse requisito?",
        explanation:
            "Treinar a equipe em conscientização de viés e IA responsável dá conhecimento e práticas para construir sistemas justos e explicáveis, como avaliar dados desbalanceados e documentar decisões do modelo. Programação avançada, privacidade e criptografia e algoritmos de ML são habilidades úteis, mas não tratam diretamente de justiça e explicabilidade.",
        topic: "IA responsável",
        options: [
            ["Treinamento sobre conscientização de viés e práticas de IA responsável", true],
            ["Treinamento sobre técnicas avançadas de programação e revisão de código", false],
            ["Treinamento sobre privacidade de dados e protocolos de criptografia", false],
            ["Treinamento sobre algoritmos avançados de machine learning e otimização", false],
        ],
    },
    {
        statement:
            "Uma empresa está implantando agentes de IA, construídos com foundation models do Amazon Bedrock, que precisam acessar vários sistemas de backend em nome dos usuários. A empresa quer que cada agente se autentique com uma identidade própria, em vez de todos compartilharem as mesmas credenciais. Qual recurso da AWS atende a esse requisito?",
        explanation:
            "O AgentCore Identity trata agentes como identidades de carga de trabalho próprias e gerencia a autenticação e as credenciais que eles usam para acessar recursos da AWS e de terceiros em nome dos usuários. O Secrets Manager guarda segredos sem dar identidade a cada agente, o Macie descobre dados sensíveis e o CloudTrail registra chamadas para auditoria.",
        topic: "Segurança e governança",
        options: [
            [
                "Amazon Bedrock AgentCore Identity, que gerencia identidades e credenciais de agentes",
                true,
            ],
            [
                "AWS Secrets Manager, que armazena e faz a rotação das credenciais usadas pelas aplicações",
                false,
            ],
            [
                "Amazon Macie, que descobre e protege dados sensíveis armazenados no Amazon S3",
                false,
            ],
            [
                "AWS CloudTrail, que registra as chamadas de API feitas pelos agentes para auditoria",
                false,
            ],
        ],
    },
    {
        statement:
            "A equipe de conformidade de uma farmacêutica usa um assistente de IA generativa para responder dúvidas sobre interações medicamentosas. Para reduzir o risco de o modelo gerar informações médicas incorretas, a equipe quer que toda resposta seja embasada em documentos de referência aprovados. Qual técnica atende a esse requisito?",
        explanation:
            "Com RAG, o sistema recupera trechos dos documentos aprovados a cada pergunta e os usa para embasar a resposta, que fica rastreável até a fonte e menos sujeita a alucinação. Temperatura maior aumenta a aleatoriedade, fine-tuning com dados gerais não prende a resposta aos documentos aprovados e um modelo maior não verifica nada contra referências.",
        topic: "RAG e customização",
        options: [
            ["Aplicar RAG, embasando as respostas nos documentos de referência aprovados", true],
            ["Aumentar o parâmetro de temperatura para o modelo variar mais as respostas", false],
            [
                "Fazer fine-tuning do modelo com mais dados médicos gerais coletados na internet",
                false,
            ],
            ["Trocar o modelo atual por um foundation model maior, com mais parâmetros", false],
        ],
    },
    {
        statement:
            "Uma empresa quer detectar possíveis alucinações do seu assistente de IA generativa antes que as respostas cheguem aos usuários. Quais técnicas atendem a esse objetivo? (Selecione DUAS opções.)",
        explanation:
            "A validação compara a resposta com os documentos de origem para confirmar os fatos, e a pontuação de confiança sinaliza respostas de baixa certeza para revisão ou bloqueio, pegando alucinações antes do usuário. Mais dados de treino, menos parâmetros ou mais GPU podem mudar qualidade ou velocidade, mas não verificam cada resposta em tempo real.",
        topic: "IA responsável",
        options: [
            [
                "Validar cada resposta gerada comparando o conteúdo com os documentos de origem",
                true,
            ],
            ["Atribuir pontuações de confiança e sinalizar as respostas de baixa certeza", true],
            [
                "Aumentar o volume de dados usados no treinamento do modelo antes de publicá-lo",
                false,
            ],
            ["Reduzir a quantidade de parâmetros do modelo usado na aplicação em produção", false],
            ["Adicionar mais capacidade de GPU para acelerar a etapa de inferência", false],
        ],
    },
    {
        statement:
            "Uma instituição financeira treina modelos de ML com dados de vários sistemas internos. Os reguladores exigem que ela rastreie cada dado de treinamento até a origem e demonstre que a coleta e o processamento seguiram as políticas. Qual prática atende a esse requisito?",
        explanation:
            "O rastreamento de linhagem documenta de onde cada dado veio, por onde passou e como foi transformado, o que permite provar aos reguladores a origem e o tratamento conforme a política. Aumento de dados cria exemplos, normalização ajusta escalas e balanceamento corrige a distribuição de classes, e nenhum deles gera esse histórico rastreável.",
        topic: "Segurança e governança",
        options: [
            [
                "Rastreamento de linhagem de dados, registrando origem, movimentação e transformações",
                true,
            ],
            [
                "Aumento de dados (data augmentation), criando exemplos extras a partir dos existentes",
                false,
            ],
            ["Normalização de dados, colocando as variáveis numéricas em uma escala comum", false],
            [
                "Balanceamento de dados, ajustando a distribuição das classes para reduzir viés",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa usa modelos de IA treinados com dados de clientes e precisa definir regras para as fases dos conjuntos de treino: por quanto tempo ficam em uso, quando são arquivados e quando devem ser excluídos. Qual estratégia de governança de dados isso descreve?",
        explanation:
            "A gestão do ciclo de vida dos dados define regras para cada fase, da criação e do armazenamento ao arquivamento e à exclusão, como pede o caso dos conjuntos de treino. Residência trata da localização geográfica, registro guarda eventos para auditoria e monitoramento acompanha qualidade e uso, sem fixar prazos de arquivamento e exclusão.",
        topic: "Segurança e governança",
        options: [
            [
                "Gestão do ciclo de vida dos dados, organizando cada fase da criação ao descarte",
                true,
            ],
            [
                "Residência de dados, definindo a localização geográfica em que os dados ficam",
                false,
            ],
            [
                "Registro de dados (logging), guardando os eventos de acesso para auditoria posterior",
                false,
            ],
            [
                "Monitoramento de dados, observando a qualidade e o uso dos dados ao longo do tempo",
                false,
            ],
        ],
    },
    {
        statement:
            "A equipe de governança de dados de uma empresa quer acompanhar continuamente como os dados de treinamento de IA são acessados e usados na organização, para detectar padrões de uso não autorizado. Qual estratégia de governança de dados isso descreve?",
        explanation:
            "Observação e monitoramento de dados é acompanhar de forma contínua como os dados são acessados e usados, identificando anomalias e padrões não autorizados. Retenção define prazos de guarda, residência define a localização e o registro (logging) grava eventos de acesso, mas sozinho não faz a vigilância contínua nem detecta padrões.",
        topic: "Segurança e governança",
        options: [
            [
                "Observação e monitoramento de dados, acompanhando acesso e uso de forma contínua",
                true,
            ],
            [
                "Retenção de dados, definindo por quanto tempo os dados ficam guardados antes da exclusão",
                false,
            ],
            [
                "Residência de dados, definindo a localização geográfica em que os dados ficam",
                false,
            ],
            [
                "Registro de dados (logging), gravando cada evento de acesso individual para consulta",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma empresa que desenvolve sistemas de IA na AWS quer registrar cada acesso aos seus conjuntos de dados de treinamento armazenados no Amazon S3, para fins de auditoria. Qual serviço da AWS oferece esse registro?",
        explanation:
            "O AWS CloudTrail registra chamadas de API e, com eventos de dados ativados para o Amazon S3, grava leituras e gravações de objetos com quem fez, quando e de onde, formando a trilha de auditoria. O AWS Config acompanha mudanças de configuração, o Trusted Advisor recomenda boas práticas e o Inspector procura vulnerabilidades, sem registrar acessos a dados.",
        topic: "Segurança e governança",
        options: [
            [
                "AWS CloudTrail, com eventos de dados que registram quem acessou cada objeto e quando",
                true,
            ],
            [
                "AWS Config, com o histórico das mudanças de configuração dos recursos da conta",
                false,
            ],
            [
                "AWS Trusted Advisor, com recomendações de boas práticas para os recursos da conta",
                false,
            ],
            [
                "Amazon Inspector, com varreduras automáticas de vulnerabilidades nas cargas de trabalho",
                false,
            ],
        ],
    },
];
