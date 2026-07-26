// Seed do simulado Databricks Certified Data Engineer Associate (databricks-de-associate). Idempotente: se ja tiver questoes, nao faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-databricks-de-associate.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-databricks-de-associate.ts
import { db } from "../db.ts";
import { simulados, simuladoQuestions, simuladoOptions } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "databricks-de-associate";

type Questao = { statement: string; explanation: string; topic: string; options: [string, boolean][] };

const QUESTOES: Questao[] = [
    {
        statement:
            "Uma equipe de engenharia de dados quer que cada desenvolvedor edite notebooks em sua própria branch de feature, sincronizando o código com um repositório remoto no GitHub e alternando entre branches sem sair da interface do Databricks. Qual recurso atende esse requisito?",
        explanation:
            "Git Folders do Databricks integra o workspace diretamente a um repositório Git remoto, permitindo clonar o repositório, criar e alternar branches, e sincronizar com pull e push sem sair da interface. Volumes do Unity Catalog e armazenamento DBFS montado servem para arquivos e dados, sem controle de versão Git. Arquivos comuns do workspace não têm integração nativa com branches remotas.",
        topic: "Databricks Git Folders",
        options: [
            ["Sincronizar o workspace com o repositório usando Git Folders do Databricks", true],
            ["Sincronizar o workspace com o repositório usando Volumes do Unity Catalog", false],
            ["Sincronizar o workspace com o repositório usando armazenamento DBFS montado", false],
            ["Sincronizar o workspace com o repositório usando arquivos comuns do workspace", false],
        ],
    },
    {
        statement:
            "Uma equipe quer que a tarefa de um Lakeflow Job em produção sempre execute o código de uma tag de release imutável de um repositório Git, sem depender de alguém sincronizar manualmente um Git Folder antes de cada execução agendada. Qual abordagem atende esse requisito com menos esforço operacional?",
        explanation:
            "Jobs Lakeflow podem referenciar um repositório Git remoto diretamente como fonte da tarefa, fixando branch, tag ou commit; a cada execução o Databricks busca automaticamente essa versão, sem sincronização manual. Um Git Folder é uma cópia no workspace que precisa de pull manual para refletir a tag mais recente, reintroduzindo o passo manual que a equipe quer eliminar. Copiar notebooks manualmente e salvar em um volume do Unity Catalog também exigem intervenção manual e não usam controle de versão Git nativo do job.",
        topic: "Lakeflow Jobs - fonte Git remota",
        options: [
            ["Copiar manualmente os notebooks da tag de release para o workspace antes da execução", false],
            ["Apontar a tarefa do job para o repositório Git remoto, usando a tag de release", true],
            ["Criar um Git Folder e orientar a equipe a fazer pull antes de cada execução agendada", false],
            ["Salvar os notebooks da tag de release em um volume do Unity Catalog e apontar o job", false],
        ],
    },
    {
        statement:
            "Uma equipe quer definir jobs, pipelines e a configuração de implantação de um projeto de dados inteiro como arquivos de código versionáveis, para implantar o mesmo projeto de forma consistente em workspaces de desenvolvimento e produção. Qual recurso do Databricks foi projetado para isso?",
        explanation:
            "Automation Bundles descrevem jobs, pipelines e demais recursos de um projeto como arquivos de configuração versionados, permitindo implantar o mesmo projeto em targets diferentes, como dev e prod, de forma consistente. Git Folders do Databricks sincroniza pastas do workspace com um repositório remoto, mas não empacota nem implanta recursos. Políticas de cluster padronizam apenas a configuração de computação permitida. O Databricks CLI isolado é uma ferramenta de linha de comando, e sozinho não substitui o arquivo de configuração de implantação de um bundle.",
        topic: "Automation Bundles",
        options: [
            ["Git Folders do Databricks, que sincronizam pastas do workspace com um repositório remoto", false],
            ["Políticas de cluster, que padronizam a configuração de computação permitida", false],
            ["Databricks CLI isoladamente, sem nenhum arquivo de configuração de implantação", false],
            ["Automation Bundles, que descrevem jobs e pipelines como configuração versionada", true],
        ],
    },
    {
        statement:
            "Um engenheiro está criando o arquivo de configuração principal de um Automation Bundle, que vai descrever os jobs, os pipelines e os targets de implantação de um projeto. Qual arquivo, na raiz do projeto, concentra essa definição?",
        explanation:
            "O databricks.yml é o arquivo de configuração raiz de um Automation Bundle: nele ficam as seções bundle, resources (jobs, pipelines e outros recursos) e targets (ambientes como dev e prod). cluster-policy.json define políticas de cluster, requirements.txt lista dependências Python, e spark-defaults.conf configura parâmetros do Spark; nenhum desses é o arquivo de definição de um bundle.",
        topic: "databricks.yml",
        options: [
            ["cluster-policy.json", false],
            ["requirements.txt", false],
            ["databricks.yml", true],
            ["spark-defaults.conf", false],
        ],
    },
    {
        statement:
            "Uma engenheira implanta o mesmo Automation Bundle em dois targets diferentes: um configurado com mode: development e outro com mode: production. Ao implantar no target de desenvolvimento, o que o Databricks faz por padrão com os gatilhos e agendamentos dos jobs e pipelines do bundle?",
        explanation:
            "No modo development de um Automation Bundle, o Databricks pausa automaticamente gatilhos e agendamentos dos jobs e pipelines implantados, evitando execuções acidentais durante o desenvolvimento; no modo production esse comportamento não ocorre. Manter os gatilhos ativos sem alteração é o comportamento típico do modo production, não do development. Exigir aprovação manual e converter agendamentos em execução contínua não são comportamentos automáticos desse modo.",
        topic: "Automation Bundles - modo development",
        options: [
            ["Mantém os gatilhos e agendamentos ativos, sem alteração", false],
            ["Pausa os gatilhos e agendamentos automaticamente", true],
            ["Exige aprovação manual antes de qualquer execução", false],
            ["Converte todos os agendamentos em execução contínua", false],
        ],
    },
    {
        statement:
            "Depois de validar a configuração, um engenheiro precisa implantar os recursos de um Automation Bundle no target chamado prod usando a linha de comando. Qual comando do Databricks CLI faz isso?",
        explanation:
            "O comando databricks bundle deploy -t prod empacota e implanta os recursos definidos no bundle no target especificado. databricks bundle init cria um novo projeto de bundle a partir de um template, databricks bundle destroy remove os recursos implantados, e databricks bundle summary apenas exibe um resumo dos recursos, sem implantá-los.",
        topic: "Databricks CLI - bundle deploy",
        options: [
            ["databricks bundle init -t prod", false],
            ["databricks bundle destroy -t prod", false],
            ["databricks bundle summary -t prod", false],
            ["databricks bundle deploy -t prod", true],
        ],
    },
    {
        statement:
            "Um Automation Bundle define um Lakeflow Spark Declarative Pipeline que deve gravar no catálogo dev_catalogo quando implantado no target de desenvolvimento e no catálogo prod_catalogo quando implantado no target de produção, sem duplicar a definição do pipeline em dois arquivos. Qual recurso do bundle permite isso?",
        explanation:
            "Automation Bundles suportam variables definidas uma única vez e referenciadas nos recursos, como o catálogo do pipeline; cada target pode sobrescrever o valor da variable, permitindo usar dev_catalogo em desenvolvimento e prod_catalogo em produção a partir da mesma definição de pipeline. Duplicar o arquivo de definição quebra o princípio de uma única fonte de verdade. Políticas de cluster controlam configuração de computação, não o catálogo de destino. Um repositório Git exclusivo para produção não resolve a parametrização entre ambientes.",
        topic: "Automation Bundles - variables",
        options: [
            ["Definir uma variable no bundle e sobrescrever o valor por target", true],
            ["Duplicar o arquivo de definição do pipeline para cada target", false],
            ["Aplicar uma política de cluster apenas no target de produção", false],
            ["Usar um repositório Git exclusivo para o target de produção", false],
        ],
    },
    {
        statement:
            "Antes de implantar um Automation Bundle em produção, um engenheiro quer verificar se o databricks.yml e os recursos referenciados estão configurados corretamente, sem de fato criar ou alterar nada no workspace. Qual comando ele deve executar?",
        explanation:
            "databricks bundle validate verifica a sintaxe e a configuração do databricks.yml e dos recursos referenciados, apontando erros, sem implantar nada no workspace. databricks bundle deploy efetivamente cria ou atualiza os recursos no workspace, databricks bundle run executa um job ou pipeline já implantado, e databricks bundle summary lista os recursos de uma implantação existente; nenhum desses substitui a validação prévia.",
        topic: "Databricks CLI - bundle validate",
        options: [
            ["databricks bundle deploy", false],
            ["databricks bundle run", false],
            ["databricks bundle validate", true],
            ["databricks bundle summary", false],
        ],
    },
    {
        statement:
            "Uma equipe está migrando a implantação de pipelines Lakeflow para um processo de CI/CD automatizado, usando Automation Bundles disparados por um pipeline no GitHub Actions a cada merge na branch principal. Quais DUAS práticas são recomendadas nesse cenário? (Selecione DUAS opções.)",
        explanation:
            "Separar um target de produção do de desenvolvimento no databricks.yml permite aplicar mode: production, com nomes de recursos estáveis e controles próprios de cada ambiente. Usar um service principal dedicado para autenticar implantações automatizadas evita atrelar o pipeline de CI/CD a credenciais de uma pessoa específica. Autenticar com o token pessoal de um desenvolvedor cria dependência de uma identidade individual, o que é desaconselhado. Implantar sempre em desenvolvimento e renomear manualmente descaracteriza a separação de ambientes. Editar jobs de produção diretamente pela UI depois do deploy quebra a definição do bundle como fonte de verdade, pois a próxima implantação sobrescreve a alteração manual.",
        topic: "CI/CD com Automation Bundles",
        options: [
            ["Autenticar as implantações automatizadas com o token pessoal de um desenvolvedor", false],
            ["Definir um target de produção separado do target de desenvolvimento no databricks.yml", true],
            ["Implantar sempre no target de desenvolvimento e renomear os recursos manualmente depois", false],
            ["Autenticar as implantações automatizadas com um service principal dedicado", true],
            ["Editar os jobs implantados diretamente pela UI do workspace de produção após cada deploy", false],
        ],
    },
    {
        statement:
            "Uma empresa quer uma arquitetura única, capaz de armazenar dados estruturados, semiestruturados e não estruturados com governança centralizada, e que suporte tanto cargas de BI/SQL quanto machine learning sobre os mesmos dados, sem duplicar dados entre um data warehouse e um data lake separados. Qual arquitetura o Databricks implementa para atender esse requisito?",
        explanation:
            "O Lakehouse é a arquitetura que o Databricks implementa para unir, sobre o mesmo armazenamento de dados abertos, a governança, as transações ACID e o desempenho típicos de um data warehouse com a flexibilidade e o custo de um data lake, suportando BI e machine learning sobre a mesma cópia dos dados. Um data warehouse isolado ou um data lake isolado exigem duplicar dados entre sistemas separados, e um data mart atende apenas uma única equipe, sem ser a arquitetura de plataforma completa.",
        topic: "Arquitetura Lakehouse",
        options: [
            ["Um data warehouse tradicional isolado, com os dados replicados manualmente do data lake", false],
            ["Um data lake isolado, sem nenhuma camada de governança ou controle de qualidade", false],
            ["Lakehouse, unindo governança e desempenho de data warehouse à flexibilidade de um data lake", true],
            ["Um data mart dedicado exclusivamente às cargas de BI de uma única equipe", false],
        ],
    },
    {
        statement:
            "Uma organização com vários workspaces do Databricks quer administrar permissões de acesso a tabelas, registrar a linhagem dos dados e aplicar um único modelo de nomes no formato catálogo.esquema.tabela de forma centralizada, válida para todos os workspaces da conta. Qual componente da Databricks Data Intelligence Platform fornece isso?",
        explanation:
            "O Unity Catalog é o sistema de governança unificado do Databricks: administra o namespace de três níveis (catálogo, esquema e tabela ou volume), controla permissões com GRANT, REVOKE e DENY, e registra a linhagem de dados de forma centralizada, compartilhada entre os workspaces vinculados à mesma conta. Lakeflow Jobs orquestra execuções, Databricks SQL executa consultas analíticas, e um cluster de all-purpose compute é apenas um recurso de computação interativo; nenhum dos três fornece o namespace e a governança centralizada descritos.",
        topic: "Unity Catalog",
        options: [
            ["Unity Catalog", true],
            ["Lakeflow Jobs", false],
            ["Databricks SQL", false],
            ["All-purpose compute", false],
        ],
    },
    {
        statement:
            "Uma equipe agenda um Lakeflow Job para rodar toda madrugada, sem nenhuma interação humana durante a execução, e quer o menor custo possível por hora de computação para essa carga, já que nenhum notebook será aberto interativamente nesse cluster. Qual tipo de compute é o mais adequado para esse job agendado?",
        explanation:
            "Job compute é provisionado automaticamente para a execução de um job agendado e encerrado ao final dela, com preço por hora menor que o all-purpose compute, sendo a opção recomendada para cargas sem interação humana. All-purpose compute é pensado para uso interativo em notebooks compartilhados, custa mais por hora e permanece ativo entre execuções. Um SQL warehouse serverless é otimizado para consultas SQL e BI, não para orquestrar um job genérico. Um cluster de all-purpose compartilhado tem o mesmo problema de custo do all-purpose comum.",
        topic: "Job compute x all-purpose compute",
        options: [
            ["All-purpose compute, mantido ativo para uso interativo em notebooks", false],
            ["Job compute, criado e encerrado automaticamente para a execução do job", true],
            ["Um SQL warehouse serverless dedicado exclusivamente a consultas de BI", false],
            ["Um cluster de all-purpose compute compartilhado com toda a equipe", false],
        ],
    },
    {
        statement:
            "Ao criar uma tabela gerenciada no Databricks sem especificar a cláusula USING, qual é o formato de tabela padrão, que grava arquivos Parquet acompanhados de um log de transações com garantias ACID, time travel e suporte nativo a UPDATE, DELETE e MERGE?",
        explanation:
            "Delta Lake é o formato de tabela padrão do Databricks: ao criar uma tabela gerenciada sem USING, o Databricks usa Delta, que grava arquivos Parquet e adiciona um log de transações, garantindo transações ACID, time travel e suporte nativo a UPDATE, DELETE e MERGE. Apache Iceberg é outro formato de tabela aberto com o qual o Databricks interopera, mas não é o formato padrão ao omitir USING. Apache Parquet puro não tem log de transações, e Apache Avro é um formato de serialização de linha, sem as garantias transacionais de uma tabela Delta.",
        topic: "Delta Lake",
        options: [
            ["Apache Iceberg", false],
            ["Apache Parquet", false],
            ["Apache Avro", false],
            ["Delta Lake", true],
        ],
    },
    {
        statement:
            "Durante o desenvolvimento de um notebook, um engenheiro quer descrever em linguagem natural o que uma célula deve fazer e receber uma sugestão de código SQL ou PySpark, além de pedir uma explicação sobre um erro que apareceu na execução. Qual recurso da Databricks Data Intelligence Platform oferece essa ajuda dentro do próprio notebook?",
        explanation:
            "O Databricks Assistant é o assistente de IA integrado ao workspace, incluindo notebooks e o editor SQL, que gera e explica código a partir de linguagem natural, sugere correções e ajuda a interpretar erros com o contexto do próprio ambiente Databricks. Unity Catalog trata da governança de dados, o Databricks CLI é uma interface de linha de comando para operar a plataforma, e Job compute é um tipo de cluster para execução de jobs; nenhum desses oferece assistência de código em linguagem natural.",
        topic: "Databricks Assistant",
        options: [
            ["Unity Catalog", false],
            ["Databricks Assistant", true],
            ["CLI do Databricks", false],
            ["Cluster de job compute", false],
        ],
    },
    {
        statement:
            "Uma organização está descrevendo os componentes da Databricks Data Intelligence Platform para um time que vai iniciar um projeto de engenharia de dados. Quais DUAS afirmações sobre esses componentes estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Lakeflow é o nome atual da solução unificada de engenharia de dados do Databricks, reunindo ingestão, transformação com Lakeflow Spark Declarative Pipelines (antes conhecido como Delta Live Tables ou DLT) e orquestração com Lakeflow Jobs. O Unity Catalog fornece governança e um namespace único, compartilhado tanto para dados quanto para ativos de IA, em todos os workspaces vinculados à conta. O Databricks SQL é um motor de consultas e BI, e não substitui o Unity Catalog como camada de governança. Notebooks do Databricks suportam múltiplas linguagens na mesma sessão, como SQL, Python, Scala e R, não apenas Python. Um cluster de job compute é criado para a execução do job e encerrado ao final dela, não permanece ativo indefinidamente.",
        topic: "Lakeflow e Unity Catalog",
        options: [
            ["O Lakeflow reúne as ferramentas de ingestão, transformação e orquestração de dados da plataforma", true],
            ["O Databricks SQL substitui o Unity Catalog como sistema de governança de dados", false],
            ["Notebooks do Databricks só podem ser escritos em Python, sem suporte a SQL", false],
            ["O Unity Catalog fornece um modelo de governança e um namespace comuns para dados e IA em toda a plataforma", true],
            ["Um cluster de job compute permanece ativo indefinidamente após o job terminar, para reaproveitamento", false],
        ],
    },
    {
        statement:
            "Uma engenheira de dados está escrevendo uma consulta em Databricks SQL que será executada por vários usuários, cada um com um catálogo padrão diferente configurado na sessão. Para garantir que a consulta sempre aponte para a tabela pedidos do schema comercial dentro do catálogo vendas, independentemente do contexto de sessão de quem executa, qual referência ela deve usar?",
        explanation:
            "O Unity Catalog organiza os dados em uma hierarquia de três níveis: metastore, que contém catálogos, que contêm schemas, que contêm tabelas (além de views, volumes e functions). Para referenciar um objeto de forma completa e independente do contexto de sessão, o namespace usado em consultas é sempre catalog.schema.table, neste caso vendas.comercial.pedidos. O metastore não entra no namespace de uma consulta, ele é apenas o container de nível mais alto associado ao workspace, por isso a opção com metastore_principal está errada. Nomes com apenas dois níveis são ambíguos, porque o mesmo nome de schema ou de tabela pode existir em catálogos diferentes.",
        topic: "Unity Catalog - hierarquia e namespace",
        options: [
            ["vendas.comercial.pedidos, seguindo a hierarquia catalog.schema.table do Unity Catalog.", true],
            ["metastore_principal.vendas.comercial.pedidos, incluindo o metastore como primeiro nível do namespace.", false],
            ["comercial.pedidos, pois o schema já identifica a tabela de forma única no metastore.", false],
            ["vendas.pedidos, pois o catálogo e a tabela são suficientes para localizar o objeto.", false],
        ],
    },
    {
        statement:
            "Uma equipe está revisando como o Unity Catalog trata tabelas managed (gerenciadas) e tabelas external (externas). Quais DUAS afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Tabelas managed têm os dados armazenados no local gerenciado configurado no metastore, catálogo ou schema, e o Unity Catalog controla todo o ciclo de vida dos arquivos, por isso o DROP TABLE remove metadados e dados. Tabelas external são criadas com LOCATION apontando para um External Location em nuvem, e o Unity Catalog governa apenas os metadados e o acesso, então o DROP TABLE só remove o registro no catálogo, sem apagar os arquivos. As demais afirmações invertem esse comportamento: tabelas external são normalmente registradas no metastore e consultáveis por qualquer cluster com Unity Catalog habilitado, e uma tabela criada com a cláusula LOCATION deixa de ser managed, passando a ser external.",
        topic: "Managed x external tables",
        options: [
            ["Uma tabela external só pode ser lida por clusters sem Unity Catalog habilitado, já que ela nunca fica registrada no metastore da conta.", false],
            ["Tabela managed: os dados ficam no local gerenciado pelo metastore, catálogo ou schema, e o DROP TABLE apaga metadados e arquivos juntos.", true],
            ["Uma tabela managed pode apontar para qualquer bucket externo, bastando informar a cláusula LOCATION no momento da criação dela.", false],
            ["Tabela external: criada com LOCATION para um External Location, e o DROP TABLE remove só os metadados, mantendo os arquivos intactos.", true],
            ["Um DROP TABLE em uma tabela external também apaga os arquivos no armazenamento em nuvem, do mesmo jeito que em uma tabela managed.", false],
        ],
    },
    {
        statement:
            "Um analista recebeu SELECT diretamente na tabela vendas.comercial.pedidos, mas ao executar SELECT * FROM vendas.comercial.pedidos no Databricks SQL a consulta falha com um erro de permissão. Esse analista nunca havia acessado o catálogo vendas nem o schema comercial antes. Considerando o modelo de privilégios do Unity Catalog, o que provavelmente falta conceder a ele?",
        explanation:
            "No Unity Catalog, ler uma tabela exige uma cadeia de privilégios: USE CATALOG no catálogo e USE SCHEMA no schema, que permitem atravessar esses containers, além do SELECT na própria tabela. Ter SELECT na tabela não basta se o principal não pode navegar até o catálogo e o schema onde ela vive. MODIFY controla operações de escrita, como INSERT, UPDATE, DELETE e MERGE, não leitura. OWNER concede controle total sobre o objeto, mas não é o privilégio mínimo necessário nem costuma ser concedido só para liberar consultas. CREATE TABLE autoriza criar novas tabelas no catálogo, sem relação com consultar as que já existem.",
        topic: "Privilégios - USE CATALOG e USE SCHEMA",
        options: [
            ["MODIFY na tabela pedidos, que é obrigatório mesmo para consultas somente de leitura.", false],
            ["OWNER no schema comercial, único privilégio capaz de liberar consultas SELECT em suas tabelas.", false],
            ["USE CATALOG no catálogo vendas e USE SCHEMA no schema comercial, para navegar até a tabela.", true],
            ["CREATE TABLE no catálogo vendas, necessário para abrir qualquer tabela já existente no catálogo.", false],
        ],
    },
    {
        statement:
            "Uma pipeline precisa que uma service principal execute comandos MERGE INTO na tabela vendas.comercial.pedidos para aplicar atualizações incrementais. A service principal já possui USE CATALOG, USE SCHEMA e SELECT em toda a cadeia até a tabela, mas o comando falha por falta de permissão de escrita. Qual privilégio adicional deve ser concedido na tabela?",
        explanation:
            "O privilégio MODIFY é o que autoriza comandos que alteram linhas de uma tabela, como INSERT, UPDATE, DELETE e MERGE INTO; SELECT cobre apenas leitura, e não existe uma variante de SELECT que libere escrita, mesmo em nível de coluna. CREATE TABLE autoriza criar novos objetos no schema, sem relação com escrever em uma tabela que já existe. OWNER concederia controle total sobre a tabela, o que resolveria o problema, mas não é o privilégio mínimo nem o mais adequado para uma service principal de pipeline, MODIFY já é suficiente.",
        topic: "Privilégios - MODIFY",
        options: [
            ["CREATE TABLE no schema comercial, necessário para sobrescrever linhas de uma tabela já existente.", false],
            ["MODIFY, que autoriza operações de inserção, atualização e remoção de linhas na tabela.", true],
            ["SELECT concedido novamente, agora em nível de coluna, para liberar a escrita.", false],
            ["OWNER da tabela, único privilégio capaz de permitir a execução de comandos MERGE INTO.", false],
        ],
    },
    {
        statement:
            "O grupo analistas_comercial recebeu SELECT no schema vendas.comercial, o que dá acesso de leitura a todas as tabelas do schema por herança. A empresa precisa impedir que um único integrante desse grupo, o usuário joao@empresa.com, consulte especificamente a tabela vendas.comercial.salarios, mantendo o acesso às demais tabelas do schema para ele e para o restante do grupo. Qual comando atende esse requisito com menos esforço?",
        explanation:
            "DENY cria uma restrição explícita que sempre prevalece sobre qualquer GRANT herdado, mesmo vindo de um grupo, e pode ser aplicada exatamente no objeto que se quer bloquear, neste caso a tabela salarios, sem afetar o restante do schema nem os outros integrantes do grupo. Como o SELECT de joao vem por herança do grupo no nível do schema, e não de um grant direto na tabela, um REVOKE na tabela para ele não tem nenhum efeito. Um REVOKE no grupo, por sua vez, tiraria o acesso de todos os integrantes às demais tabelas do schema, não só da tabela sensível. Um DENY no nível do schema resolveria o bloqueio, mas impediria joao de acessar todas as tabelas ali, não apenas a tabela salarios.",
        topic: "GRANT, REVOKE e DENY",
        options: [
            ["REVOKE SELECT ON TABLE vendas.comercial.salarios FROM `joao@empresa.com`", false],
            ["REVOKE SELECT ON SCHEMA vendas.comercial FROM analistas_comercial", false],
            ["DENY SELECT ON SCHEMA vendas.comercial TO `joao@empresa.com`", false],
            ["DENY SELECT ON TABLE vendas.comercial.salarios TO `joao@empresa.com`", true],
        ],
    },
    {
        statement:
            "Uma administradora concede USE CATALOG, USE SCHEMA e SELECT no catálogo analytics para o grupo bi_team, cobrindo o catálogo inteiro. Duas semanas depois, um engenheiro cria um novo schema chamado marketing dentro desse catálogo e carrega uma tabela campanhas nele, sem conceder nenhum privilégio adicional. O grupo bi_team consegue consultar analytics.marketing.campanhas assim que ela é criada?",
        explanation:
            "No Unity Catalog, privilégios concedidos em um nível superior, como o catálogo, são herdados por todos os schemas e tabelas dentro dele, incluindo objetos criados depois do GRANT, a menos que um DENY mais específico bloqueie o acesso em um nível mais baixo. Como o grupo recebeu USE CATALOG, USE SCHEMA e SELECT sobre o catálogo inteiro, ele já consegue consultar a nova tabela sem nenhuma ação adicional. A herança não se limita a objetos preexistentes, e não é preciso repetir o GRANT a cada schema criado. Quem criou o objeto não interfere no acesso herdado que outros principals já possuíam.",
        topic: "Herança de privilégios",
        options: [
            ["Não, porque a herança de privilégios só vale para objetos que já existiam no momento do GRANT original ter sido feito.", false],
            ["Sim, porque privilégios do catálogo são herdados por schemas e tabelas criados depois, salvo DENY mais específico.", true],
            ["Não, porque USE SCHEMA teria que ser concedido individualmente em cada novo schema criado.", false],
            ["Sim, mas só porque o engenheiro que criou a tabela também é integrante do grupo bi_team nesse momento.", false],
        ],
    },
    {
        statement:
            "A tabela clientes.perfil.cadastro tem a coluna cpf com dados sensíveis. A área de auditoria precisa continuar vendo o CPF completo, mas todos os demais usuários devem ver o valor mascarado. Qual abordagem do Unity Catalog aplica essa regra diretamente na tabela original, sem duplicar dados em uma view separada?",
        explanation:
            "Column mask é o recurso do Unity Catalog em que uma function SQL, tipicamente usando is_account_group_member() para checar a identidade de quem consulta, é associada a uma coluna via ALTER TABLE ... ALTER COLUMN ... SET MASK. A mesma tabela passa a devolver o CPF completo para o grupo de auditoria e o valor mascarado para os demais, sem criar views adicionais. Row filter atua sobre linhas, não sobre o conteúdo de uma coluna. Negar SELECT para os demais grupos bloquearia o acesso à tabela inteira, não só ao CPF. GENERATED ALWAYS AS define como uma coluna é calculada na escrita dos dados, sem relação com controle de acesso na leitura.",
        topic: "Column masking",
        options: [
            ["Criar um row filter na tabela, associando uma function que oculta a coluna cpf para quem está fora do grupo de auditoria.", false],
            ["Conceder SELECT na tabela apenas para o grupo de auditoria e aplicar DENY SELECT explícito para todos os demais grupos.", false],
            ["Criar uma function de mascaramento com is_account_group_member() e aplicá-la via ALTER TABLE ... ALTER COLUMN cpf SET MASK.", true],
            ["Definir a coluna cpf como GENERATED ALWAYS AS, recalculando um valor já mascarado a cada nova consulta feita.", false],
        ],
    },
    {
        statement:
            "A tabela global.rh.funcionarios deve ser consultada pelos gestores de cada regional, mas cada gestor só pode ver as linhas de funcionários da sua própria região, sem que existam cópias separadas da tabela por região. Qual recurso do Unity Catalog aplica essa restrição de linhas diretamente na tabela original?",
        explanation:
            "Row filter é o recurso de segurança em nível de linha do Unity Catalog: uma function é associada à tabela com ALTER TABLE ... SET ROW FILTER, e o Unity Catalog aplica esse predicado a cada consulta, retornando somente as linhas que o usuário pode ver, na mesma tabela física. Column mask altera o conteúdo de uma coluna, não filtra linhas. Particionamento organiza fisicamente os arquivos para otimizar leitura, mas não impede, por si só, que um usuário com SELECT na tabela leia partições de outras regiões. Criar views ou tabelas separadas por região contraria o requisito de não duplicar a tabela e aumenta o esforço de manutenção a cada nova região.",
        topic: "Row-level security (row filter)",
        options: [
            ["Column mask, que oculta a coluna regiao para gestores de outras regionais.", false],
            ["Particionamento da tabela por regiao, que restringe automaticamente o acesso às partições de outras regionais.", false],
            ["Views separadas por regiao, com GRANT SELECT individual para cada gestor.", false],
            ["Row filter, que aplica uma function de filtro à tabela para restringir quais linhas cada usuário enxerga.", true],
        ],
    },
    {
        statement:
            "Um engenheiro de dados vai implementar, pela primeira vez, um row filter na tabela global.rh.funcionarios para restringir linhas por região. Quais DUAS ações fazem parte do processo correto de implementação no Unity Catalog? (Selecione DUAS opções.)",
        explanation:
            "Implementar um row filter no Unity Catalog envolve dois passos: primeiro criar uma function SQL que recebe as colunas relevantes e retorna um booleano dizendo se a linha é visível para o usuário atual, por exemplo usando is_account_group_member(), depois aplicar essa function à tabela com ALTER TABLE ... SET ROW FILTER. SET MASK é o comando usado para column masking, um recurso diferente que altera o conteúdo de uma coluna, não filtra linhas. Não existe um privilégio ROW FILTER concedido via GRANT, o controle é feito pela function associada à tabela. CHECK CONSTRAINT é um mecanismo de qualidade de dados que valida valores na escrita, sem relação com controle de acesso na leitura.",
        topic: "Row filter - implementação",
        options: [
            ["Criar uma function SQL que recebe a coluna regiao e retorna um booleano de visibilidade da linha atual.", true],
            ["Aplicar a function à tabela com o comando ALTER TABLE global.rh.funcionarios ALTER COLUMN regiao SET MASK.", false],
            ["Aplicar a function à tabela com o comando ALTER TABLE global.rh.funcionarios SET ROW FILTER.", true],
            ["Conceder o privilégio ROW FILTER ao grupo de gestores usando o comando GRANT ROW FILTER ON TABLE.", false],
            ["Criar uma CHECK CONSTRAINT na coluna regiao que bloqueia a leitura de linhas fora do escopo do usuário.", false],
        ],
    },
    {
        statement:
            "Uma empresa tem centenas de tabelas no Unity Catalog com colunas classificadas como PII espalhadas por vários catálogos. Em vez de criar uma function de mascaramento e um ALTER TABLE para cada coluna sensível individualmente, a equipe de governança quer uma única regra que mascare automaticamente qualquer coluna marcada com a tag pii, atual ou futura, em qualquer tabela. Qual abordagem do Unity Catalog atende esse requisito com menos manutenção?",
        explanation:
            "ABAC (attribute-based access control) no Unity Catalog permite definir policies baseadas em atributos, como tags, aplicadas automaticamente a qualquer objeto que tenha aquela tag, presente ou futuro, sem precisar de uma function e um ALTER TABLE por tabela. Isso reduz bastante a manutenção comparado a aplicar column masks manualmente objeto por objeto, mesmo que via script. Row filter atua sobre linhas, não sobre colunas, então não mascara PII, e não existe um row filter global no nível do metastore. Criar um catálogo separado e migrar os dados sensíveis exige reestruturar o layout de dados existente e não escala para colunas espalhadas em tabelas de negócio variadas.",
        topic: "ABAC policies",
        options: [
            ["Criar uma function de mascaramento genérica e aplicar ALTER TABLE ... SET MASK em cada tabela por meio de um script que percorre o metastore inteiro.", false],
            ["Definir uma policy ABAC baseada na tag pii, aplicada uma vez e reutilizada automaticamente por todas as colunas com essa tag.", true],
            ["Marcar as colunas sensíveis com a tag pii e configurar um row filter padrão no nível do metastore.", false],
            ["Criar um catálogo separado somente para colunas com a tag pii e migrar os dados sensíveis para ele.", false],
        ],
    },
    {
        statement:
            "Uma organização quer compartilhar uma tabela do Unity Catalog com uma empresa parceira que também usa Databricks com Unity Catalog habilitado. Além de não duplicar os dados, a organização quer que o parceiro consiga aplicar as próprias políticas de governança, como auditoria e linhagem, sobre os dados recebidos, dentro do metastore dele. Qual abordagem do Delta Sharing atende esse cenário?",
        explanation:
            "No compartilhamento Databricks-to-Databricks, o destinatário, que também tem Unity Catalog, anexa o share recebido como um catálogo no próprio metastore. Isso evita copiar os dados e permite que o parceiro aplique as próprias políticas de governança, auditoria e linhagem sobre o catálogo compartilhado. Open Sharing é voltado a destinatários sem conta Databricks, usando um token de credencial com um client open source, sem esse mesmo nível de integração de governança do lado de quem recebe. Exportar arquivos duplica os dados e perde a sincronização com a fonte. Adicionar o parceiro como usuário do workspace resolveria colaboração interna, não o compartilhamento governado de dados entre metastores de organizações diferentes.",
        topic: "Delta Sharing (Databricks-to-Databricks)",
        options: [
            ["Open Sharing (D2O), em que o parceiro acessa os dados por um token de credencial em um client open source.", false],
            ["Exportar a tabela para arquivos Parquet e enviar por um bucket intermediário compartilhado entre as duas empresas.", false],
            ["Compartilhamento Databricks-to-Databricks (D2D), em que o parceiro anexa o share como catálogo no próprio metastore.", true],
            ["Adicionar o parceiro como usuário do workspace da própria organização e conceder SELECT diretamente na tabela para ele.", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa compartilhar uma tabela com um parceiro que não tem workspace Databricks e usa apenas ferramentas como pandas e Power BI para consumir dados. A empresa não quer exigir que o parceiro crie uma conta Databricks só para acessar esses dados. Qual modelo do Delta Sharing atende esse cenário?",
        explanation:
            "Open Sharing, também chamado de D2O, é o modelo do Delta Sharing pensado para destinatários sem conta Databricks: a empresa que compartilha gera um arquivo de credencial que o parceiro usa em qualquer client open source do protocolo Delta Sharing, como pandas, Power BI ou Spark puro, sem precisar de workspace próprio. Databricks-to-Databricks exige que o destinatário tenha Unity Catalog para anexar o share como catálogo. Compartilhar um cluster expõe o ambiente de computação da empresa, sem relação com compartilhamento de dados governado. O Databricks SQL não publica tabelas em endpoints públicos sem autenticação.",
        topic: "Delta Sharing (Open Sharing)",
        options: [
            ["Open Sharing (D2O): o Databricks gera uma credencial usada pelo parceiro em qualquer client open source do Delta Sharing.", true],
            ["Databricks-to-Databricks (D2D), configurando o parceiro como recipient dentro do metastore de Unity Catalog da empresa.", false],
            ["Compartilhar um cluster all-purpose com o parceiro, concedendo a ele acesso direto ao Databricks Runtime da empresa.", false],
            ["Publicar a tabela em um endpoint público do Databricks SQL, acessível via URL sem nenhuma autenticação exigida.", false],
        ],
    },
    {
        statement:
            "Antes de remover a coluna status_pagamento da tabela vendas.comercial.pedidos, um engenheiro de dados precisa identificar quais tabelas downstream, jobs e dashboards dependem dela, para avaliar o impacto da mudança. Qual recurso do Unity Catalog fornece essa visibilidade sem exigir nenhuma instrumentação manual prévia?",
        explanation:
            "O Unity Catalog captura automaticamente a linhagem em nível de tabela e de coluna a partir da execução real de consultas, jobs, notebooks e dashboards, sem exigir instrumentação manual, e exibe esse grafo no Catalog Explorer, permitindo ver rapidamente quais objetos downstream dependem de uma tabela ou coluna antes de uma mudança de schema. DESCRIBE HISTORY mostra o histórico de operações da própria tabela no Delta Lake, como inserts e merges, mas não lista quem consome os dados dela. Tags são rótulos de metadados aplicados manualmente para classificação e governança, por exemplo em policies ABAC, não um mecanismo automático de rastreamento de dependências. Vasculhar logs de auditoria manualmente é possível, mas trabalhoso, sujeito a erro e não é o recurso do Unity Catalog pensado para essa finalidade.",
        topic: "Linhagem de dados no Unity Catalog",
        options: [
            ["O histórico de versões do Delta Lake (DESCRIBE HISTORY), que lista todas as tabelas que já leram dados dessa tabela.", false],
            ["As tags aplicadas manualmente na coluna, que precisam ser configuradas para cada consumidor downstream conhecido.", false],
            ["Os logs de auditoria do workspace, filtrados manualmente por todas as queries que mencionam o nome da coluna.", false],
            ["O grafo de linhagem do Catalog Explorer, capturado automaticamente a partir de consultas, jobs e dashboards na tabela.", true],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia de dados recebe arquivos JSON continuamente em um diretório de object storage na nuvem, em volumes e horários imprevisíveis ao longo do dia. Eles precisam carregar de forma incremental, para uma tabela Delta na camada bronze, somente os arquivos que ainda não foram processados, sem manter controle manual de quais arquivos já foram lidos. Qual abordagem atende esse requisito com menos esforço de implementação?",
        explanation:
            "O Auto Loader (cloudFiles) foi criado para ingestão incremental de arquivos em object storage: ele usa checkpoint para saber quais arquivos já foram processados e lê somente os novos, sem lógica manual. Reler o diretório inteiro com spark.read, consultar uma tabela externa por completo ou reprocessar tudo em um cluster all purpose voltam a processar dados já carregados, com custo maior e risco de duplicidade.",
        topic: "Auto Loader",
        options: [
            ["Usar o Auto Loader (cloudFiles) em uma leitura streaming que ingere só os arquivos novos", true],
            ["Programar um job em lote que executa spark.read sobre o diretório inteiro a cada agendamento", false],
            ["Criar uma tabela externa do Unity Catalog e consultá-la por completo a cada nova execução", false],
            ["Usar um cluster all purpose compartilhado para reprocessar o diretório inteiro todos os dias", false],
        ],
    },
    {
        statement:
            "Um diretório recebe poucos arquivos por hora em um volume do Unity Catalog. A equipe vai usar o Auto Loader e quer o modo de descoberta de arquivos mais simples, sem configurar filas de mensagens ou notificações de eventos na nuvem. Qual modo do Auto Loader atende esse cenário, sendo também o comportamento padrão?",
        explanation:
            "O modo directory listing é o padrão do Auto Loader e atende bem volumes menores: ele lista periodicamente o diretório de origem e compara com o estado salvo no checkpoint para achar arquivos novos, sem exigir fila de eventos. File notification é mais indicado para altos volumes, mas exige configurar recursos de notificação na nuvem. COPY INTO não é um modo do Auto Loader, e o trigger de chegada de arquivo do Lakeflow Jobs apenas dispara a execução do job, não substitui a descoberta de arquivos feita pelo Auto Loader.",
        topic: "Auto Loader - directory listing",
        options: [
            ["File notification, que exige configurar uma fila de eventos do provedor de nuvem antes do uso", false],
            ["COPY INTO, que identifica arquivos novos comparando o histórico salvo no log da tabela Delta", false],
            ["Directory listing, que lista periodicamente o diretório de origem e compara com o checkpoint", true],
            ["Um trigger de chegada de arquivo do Lakeflow Jobs, dispensando qualquer listagem do diretório", false],
        ],
    },
    {
        statement:
            "Um diretório na nuvem recebe milhões de arquivos por dia, distribuídos em muitas subpastas. A equipe percebeu que a listagem periódica do diretório pelo Auto Loader está ficando lenta e cara. Qual configuração resolve esse problema de escala?",
        explanation:
            "Para altíssimos volumes de arquivos, o Auto Loader recomenda o modo file notification: ele usa recursos de notificação de eventos do provedor de nuvem para saber quando um arquivo novo chega, evitando listagens caras do diretório. Reduzir o intervalo do trigger ou particionar o diretório ainda dependem de listagem e não resolvem o custo em grande escala, e o COPY INTO não usa esse mecanismo orientado a eventos nem escala da mesma forma para volumes muito altos.",
        topic: "Auto Loader - file notification",
        options: [
            ["Reduzir o intervalo do trigger da leitura streaming para listar o diretório com mais frequência", false],
            ["Habilitar o file notification do Auto Loader, que usa eventos da nuvem para achar arquivos novos", true],
            ["Migrar a ingestão para COPY INTO, que escala automaticamente para qualquer volume de arquivos", false],
            ["Particionar o diretório de origem por data para reduzir os arquivos percorridos a cada listagem", false],
        ],
    },
    {
        statement:
            "Ao usar o Auto Loader sem informar um schema, uma equipe percebe que todas as colunas de um JSON, inclusive campos numéricos, são inferidas como string. Eles querem que a inferência automática reconheça tipos mais específicos, como números, datas e booleanos, sem informar o schema manualmente. Qual opção resolve isso?",
        explanation:
            "Por padrão, ao inferir o schema de fontes semiestruturadas como JSON, o Auto Loader trata as colunas como string. A opção cloudFiles.inferColumnTypes definida como true faz a inferência considerar tipos mais específicos, como números, datas e booleanos. schemaEvolutionMode controla como novas colunas são tratadas após a inferência inicial, não o tipo inferido; useNotifications controla o mecanismo de descoberta de arquivos; e mudar schemaLocation apenas reinicia o rastreamento do schema, sem alterar como os tipos são inferidos.",
        topic: "Auto Loader - inferencia de schema",
        options: [
            ["Definir cloudFiles.schemaEvolutionMode como failOnNewColumns para obrigar tipos numéricos", false],
            ["Definir cloudFiles.useNotifications como true para recalcular os tipos a cada novo arquivo", false],
            ["Apontar cloudFiles.schemaLocation para um novo diretório, reiniciando o rastreamento do schema", false],
            ["Definir cloudFiles.inferColumnTypes como true para que a inferência use tipos mais específicos", true],
        ],
    },
    {
        statement:
            "Uma equipe deixa o Auto Loader inferir o schema automaticamente, mas precisa garantir que a coluna valor_pedido seja sempre tratada como DECIMAL(10,2), sem informar manualmente o tipo de todas as outras colunas do arquivo. Qual opção atende exatamente essa necessidade?",
        explanation:
            "cloudFiles.schemaHints permite declarar o tipo de uma ou mais colunas específicas para orientar a inferência do Auto Loader, sem informar o schema inteiro da tabela. schemaEvolutionMode trata apenas como colunas futuras são incorporadas, não o tipo de uma coluna já existente; informar o schema completo funciona mas exige mais esforço do que o necessário para esse caso; e inferColumnTypes melhora a inferência de forma geral, mas não garante um tipo específico e uma precisão exata para uma única coluna.",
        topic: "Auto Loader - schema hints",
        options: [
            ["Usar a opção cloudFiles.schemaHints para declarar o tipo somente da coluna valor_pedido", true],
            ["Definir cloudFiles.schemaEvolutionMode como rescue para fixar o tipo da coluna valor_pedido", false],
            ["Informar manualmente o schema completo da tabela, com o tipo de cada coluna do arquivo", false],
            ["Ativar cloudFiles.inferColumnTypes e aguardar a correção automática do tipo ao longo do tempo", false],
        ],
    },
    {
        statement:
            "Uma leitura com Auto Loader está configurada sem definir explicitamente cloudFiles.schemaEvolutionMode. Uma nova coluna passa a aparecer nos arquivos JSON de origem, sem nunca ter existido antes. Qual é o comportamento padrão do Auto Loader nesse caso?",
        explanation:
            "No modo padrão de evolução de schema do Auto Loader (addNewColumns), uma coluna nunca vista antes faz o stream falhar uma vez de propósito: nesse momento o schema é atualizado para incluir a coluna nova e, ao reiniciar, o processamento continua de onde parou, sem reprocessar arquivos já lidos. Ignorar a coluna silenciosamente é o comportamento do modo none, exigir recriação manual da tabela não é o padrão, e mandar tudo para _rescued_data é o comportamento do modo rescue, não do addNewColumns.",
        topic: "Auto Loader - evolucao de schema",
        options: [
            ["A coluna nova é ignorada silenciosamente e o processamento continua sem nenhuma interrupção", false],
            ["O stream para de forma definitiva e só volta com a recriação manual da tabela de destino", false],
            ["O stream falha uma vez, o schema é atualizado e o processamento é retomado automaticamente", true],
            ["A coluna nova é descartada e seu conteúdo passa a ser gravado somente em _rescued_data", false],
        ],
    },
    {
        statement:
            "Uma equipe quer que o stream do Auto Loader nunca falhe por causa de divergências de schema, como coluna extra ou tipo diferente do esperado, mas ainda assim quer capturar esses dados divergentes para análise posterior, em vez de simplesmente perdê-los. Qual configuração atende essa necessidade?",
        explanation:
            "O modo rescue mantém o schema da tabela fixo e nunca falha o stream por divergência: qualquer dado fora do schema esperado, como coluna extra ou tipo diferente, é capturado na coluna _rescued_data para análise posterior. addNewColumns também evolui o schema, mas provoca uma falha controlada do stream a cada coluna nova; failOnNewColumns interrompe o stream exigindo intervenção manual, sem arquivar nada automaticamente em outra tabela; e o Auto Loader não tem uma opção cloudFiles.validateOptions para desativar a validação de schema.",
        topic: "Auto Loader - rescued data",
        options: [
            ["Definir cloudFiles.schemaEvolutionMode como addNewColumns, que nunca interrompe o stream", false],
            ["Definir cloudFiles.schemaEvolutionMode como rescue, que grava os dados divergentes em _rescued_data", true],
            ["Definir cloudFiles.schemaEvolutionMode como failOnNewColumns, que arquiva os dados em outra tabela", false],
            ["Desativar a validação de schema do Auto Loader pela opção cloudFiles.validateOptions", false],
        ],
    },
    {
        statement:
            "Um stream do Auto Loader que ingere arquivos para uma tabela bronze cai por instabilidade de rede e é reiniciado horas depois. A equipe quer ter certeza de que arquivos já ingeridos antes da queda não serão lidos de novo, evitando duplicidade na tabela de destino. O que garante esse comportamento?",
        explanation:
            "checkpointLocation é o mecanismo de tolerância a falhas do Auto Loader: ele guarda o progresso da leitura, então, ao reiniciar, o stream retoma exatamente de onde parou, sem reprocessar arquivos já ingeridos. Tabelas Delta não removem duplicatas automaticamente sem uma lógica explícita de deduplicação; schemaLocation guarda o schema inferido e seu histórico de evolução, não a lista de arquivos processados; e o Auto Loader não recalcula hash de arquivos para decidir reprocessamento.",
        topic: "Auto Loader - checkpoint",
        options: [
            ["A tabela Delta remove automaticamente qualquer linha duplicada após cada reinício do stream", false],
            ["cloudFiles.schemaLocation guarda a lista de arquivos já lidos e impede a releitura deles", false],
            ["O Databricks recalcula o hash de cada arquivo do diretório para decidir se ele será reprocessado", false],
            ["checkpointLocation registra o progresso do processamento, retomando exatamente de onde parou", true],
        ],
    },
    {
        statement:
            "Dentro de um pipeline declarativo do Lakeflow, uma equipe quer declarar uma streaming table na camada bronze que ingere arquivos JSON de um diretório na nuvem de forma incremental, aproveitando a lógica do Auto Loader dentro do próprio SQL do pipeline. Qual definição faz isso corretamente?",
        explanation:
            "Dentro de um pipeline declarativo do Lakeflow, a forma correta de ingerir arquivos de forma incremental na bronze é declarar uma streaming table lendo com STREAM read_files, o que aplica a lógica do Auto Loader, leitura incremental com checkpoint automático, sobre o diretório de origem. Uma materialized view sobre read_files trata a fonte como uma consulta que pode ser recalculada, não como um fluxo incremental linha a linha; declarar STREAMING TABLE mas ler com read_files sem a palavra chave STREAM não aplica a semântica incremental esperada; e um CREATE TABLE comum também não processa a fonte de forma incremental.",
        topic: "Auto Loader com Lakeflow Spark Declarative Pipelines",
        options: [
            ["CREATE OR REFRESH STREAMING TABLE bronze_eventos AS SELECT * FROM STREAM read_files('/raw/eventos', format => 'json')", true],
            ["CREATE MATERIALIZED VIEW bronze_eventos AS SELECT * FROM read_files('/raw/eventos', format => 'json')", false],
            ["CREATE OR REFRESH STREAMING TABLE bronze_eventos AS SELECT * FROM read_files('/raw/eventos', format => 'json')", false],
            ["CREATE TABLE bronze_eventos AS SELECT *, current_timestamp() AS data_hora_da_carga, input_file_name() AS arquivo_origem FROM json.`/raw/eventos`", false],
        ],
    },
    {
        statement:
            "Um job agendado executa o mesmo comando COPY INTO uma vez por dia, apontando sempre para a mesma pasta de origem, onde novos arquivos podem ter sido adicionados desde a última execução. A equipe quer garantir que arquivos já carregados em execuções anteriores não sejam carregados de novo, sem escrever nenhuma lógica de controle própria. Por que esse comportamento é garantido?",
        explanation:
            "O COPY INTO foi projetado para ser idempotente e retomável: a cada execução, ele verifica quais arquivos do local de origem já foram carregados na tabela de destino, com base no histórico mantido pelo próprio comando, e processa somente os arquivos novos, mesmo que seja executado várias vezes sobre o mesmo diretório. Ele não recria a tabela de destino a cada execução, não exige esvaziar o diretório de origem manualmente, e não bloqueia a tabela de destino para leitura entre execuções.",
        topic: "COPY INTO",
        options: [
            ["Porque cada execução do COPY INTO recria a tabela de destino vazia antes de carregar os dados", false],
            ["Porque o COPY INTO exige que o diretório de origem seja esvaziado após cada carga bem sucedida", false],
            ["Porque o COPY INTO é idempotente: ele rastreia os arquivos já carregados e ignora os repetidos", true],
            ["Porque o COPY INTO bloqueia a tabela de destino para leitura entre duas execuções agendadas", false],
        ],
    },
    {
        statement:
            "Uma pasta recebe algumas centenas de arquivos por dia, sempre na mesma janela noturna, e a equipe quer a solução mais simples em SQL para uma carga diária agendada, sem montar infraestrutura de streaming nem gerenciar checkpoint. Qual opção é a MAIS adequada para esse cenário?",
        explanation:
            "Para cargas periódicas e previsíveis, com um volume moderado de arquivos e sem necessidade de processamento contínuo, o COPY INTO é a opção mais simples: um único comando SQL, idempotente, sem exigir streaming nem checkpoint. O Auto Loader com file notification ou trigger contínuo é mais indicado quando o volume de arquivos é muito grande ou a ingestão precisa ser contínua, o que adiciona complexidade desnecessária aqui. AUTO CDC serve para aplicar mudanças de um feed de CDC com chaves definidas, não para comparar o conteúdo de um diretório de arquivos brutos.",
        topic: "COPY INTO x Auto Loader",
        options: [
            ["Auto Loader com o modo file notification, por escalar melhor para grandes volumes contínuos", false],
            ["COPY INTO, por ser um comando SQL simples adequado a cargas periódicas com poucos arquivos", true],
            ["Auto Loader com trigger contínuo, mantendo o cluster ligado para captar os arquivos assim que chegam", false],
            ["Um pipeline com AUTO CDC comparando o diretório de origem com o estado atual da tabela", false],
        ],
    },
    {
        statement:
            "Uma empresa quer trazer dados do Salesforce para tabelas do Unity Catalog, com atualização incremental ao longo do tempo, sem escrever código customizado de integração com a API nem gerenciar autenticação e paginação manualmente. Qual é a abordagem recomendada?",
        explanation:
            "O Lakeflow Connect oferece conectores gerenciados prontos para aplicações SaaS como Salesforce: a configuração é feita via interface gráfica ou API, sem código customizado, e o próprio conector cuida da extração incremental ao longo do tempo. Escrever integração manual com a API REST, depender de exportações manuais para um bucket ou usar consultas federadas via Lakeflow Jobs exigem muito mais esforço de engenharia e manutenção do que usar o conector gerenciado já existente para esse fim.",
        topic: "Lakeflow Connect - conectores gerenciados",
        options: [
            ["Usar um conector gerenciado do Lakeflow Connect para Salesforce, com atualização incremental", true],
            ["Escrever um notebook PySpark que chama a API REST do Salesforce e grava os dados com COPY INTO", false],
            ["Configurar o Auto Loader sobre um export manual periódico do Salesforce em um bucket na nuvem", false],
            ["Criar um job do Lakeflow Jobs com consultas SQL federadas diretamente contra o Salesforce", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa replicar dados de um banco SQL Server on premises para o Unity Catalog, capturando mudanças de forma incremental por meio de um conector de banco de dados do Lakeflow Connect. Que componente, implantado próximo à origem, normalmente é necessário para capturar e preparar essas mudanças antes da pipeline de ingestão aplicá-las?",
        explanation:
            "Para bancos de dados como o SQL Server, o Lakeflow Connect usa um gateway de ingestão: um componente implantado próximo à origem, na mesma rede, que captura as mudanças do banco e as prepara antes que a pipeline de ingestão gerenciada as aplique nas tabelas do Unity Catalog. Não existe a noção de cluster job do Unity Catalog para esse fim; o AUTO CDC roda do lado do Databricks para aplicar mudanças em uma tabela Delta, não dentro do banco de origem; e Databricks Git Folders servem para versionar código, não para capturar dados de um banco.",
        topic: "Lakeflow Connect - conector de banco de dados",
        options: [
            ["Um cluster job compartilhado do Unity Catalog, instalado na mesma rede do banco de origem", false],
            ["Uma pipeline com AUTO CDC executando diretamente dentro do próprio banco SQL Server", false],
            ["Um gateway de ingestão, implantado próximo à origem, que captura e prepara as mudanças", true],
            ["Um Databricks Git Folder sincronizado com o servidor do banco para versionar o schema", false],
        ],
    },
    {
        statement:
            "Uma equipe quer ingerir arquivos novos na camada bronze usando Auto Loader, mas sem manter um cluster de streaming ativo 24 horas por dia. A ideia é um job do Lakeflow Jobs que liga o cluster de hora em hora, processa tudo o que chegou desde a última execução e desliga o cluster em seguida, preservando o rastreamento incremental do Auto Loader entre as execuções. Qual trigger do Structured Streaming permite esse padrão?",
        explanation:
            "Trigger.AvailableNow processa, em modo micro batch, todos os dados novos disponíveis no momento da execução e encerra o stream automaticamente ao terminar, o que combina bem com um job agendado do Lakeflow Jobs que liga o cluster, processa o que chegou e desliga o cluster, preservando o rastreamento incremental do Auto Loader entre execuções. O trigger contínuo mantém o cluster ativo indefinidamente buscando baixa latência; reduzir o processingTime deixa o stream contínuo mais frequente, sem encerrá-lo; e a ausência de trigger explícito não faz o Auto Loader controlar o ciclo de vida do cluster sozinho.",
        topic: "Ingestao incremental - trigger AvailableNow",
        options: [
            ["Trigger contínuo (continuous), que mantém baixa latência com o cluster ativo o tempo todo", false],
            ["Trigger.AvailableNow, que processa os arquivos novos disponíveis no momento e encerra o stream", true],
            ["Trigger com processingTime bem curto, de poucos segundos, entre cada execução do cluster", false],
            ["Ausência de trigger explícito, deixando o Auto Loader decidir sozinho quando desligar o cluster", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa ingerir um diretório com arquivos PDF e imagens, conteúdo não estruturado, para uma tabela bronze, de forma que uma etapa posterior de machine learning acesse os bytes brutos de cada arquivo junto com metadados como caminho, data de modificação e tamanho, sem que o Databricks tente interpretar a estrutura interna dos arquivos. Qual formato do Auto Loader deve ser usado?",
        explanation:
            "O formato binaryFile do Auto Loader foi feito para ingerir arquivos não estruturados, como imagens e PDFs, sem tentar interpretar o conteúdo: cada registro traz o conteúdo binário bruto do arquivo, além de metadados como caminho, data de modificação e tamanho. O formato text pressupõe conteúdo textual linha a linha e não preserva os mesmos metadados; parquet exige que os arquivos sigam o layout colunar do Parquet; e usar json sobre arquivos binários não faz sentido, pois não há estrutura JSON para inferir.",
        topic: "Formatos de arquivo - binaryFile",
        options: [
            ["O formato text, que lê cada arquivo como uma única coluna de texto corrido", false],
            ["O formato parquet, que exige que os arquivos sigam o layout de colunas do Parquet", false],
            ["O formato json combinado com cloudFiles.inferColumnTypes para inferir a estrutura dos arquivos", false],
            ["O formato binaryFile, que traz o conteúdo bruto de cada arquivo junto com seus metadados", true],
        ],
    },
    {
        statement:
            "Dentro de um pipeline declarativo do Lakeflow, uma equipe decide entre streaming table e materialized view para a camada bronze. O requisito é que cada registro de origem seja processado exatamente uma vez, de forma incremental e append-only, sem recalcular o que já foi processado. Qual objeto atende esse requisito e por quê?",
        explanation:
            "A streaming table é a escolha adequada para a camada bronze porque processa cada registro de entrada exatamente uma vez, de forma incremental e append-only, apoiada em Structured Streaming, sem recalcular o que já foi processado. A materialized view representa o resultado de uma consulta, inclusive com agregações, e pode recalcular parte ou todo o resultado quando os dados de entrada mudam, além de não oferecer o mesmo controle de checkpoint de uma leitura streaming. Uma streaming table também não recalcula o conteúdo inteiro a cada atualização, apenas o incremento novo.",
        topic: "Streaming tables",
        options: [
            ["Materialized view, pois recalcula o resultado da consulta sempre que uma agregação muda", false],
            ["Materialized view, pois oferece o mesmo controle de checkpoint de uma leitura streaming", false],
            ["Streaming table, pois recalcula o conteúdo inteiro da tabela a cada atualização do pipeline", false],
            ["Streaming table, pois processa cada registro de entrada exatamente uma vez, de forma append-only", true],
        ],
    },
    {
        statement:
            "Uma equipe está avaliando o comportamento do Auto Loader antes de adotá-lo para a camada bronze. Quais DUAS afirmações a seguir estão corretas? (Selecione DUAS opções.)",
        explanation:
            "checkpointLocation é essencial para o Auto Loader retomar a leitura sem reprocessar arquivos já ingeridos, e o modo de evolução rescue evita falhas do stream por schema divergente, enviando os dados fora do schema esperado para _rescued_data. O Auto Loader suporta vários formatos além de Parquet, como JSON, CSV, Avro, texto e binaryFile; o modo padrão de descoberta de arquivos é directory listing, não file notification; e o Auto Loader consegue inferir o schema automaticamente, sem exigir que ele seja informado manualmente antes da primeira execução.",
        topic: "Auto Loader",
        options: [
            ["O Auto Loader lê apenas arquivos no formato Parquet, sem suportar JSON, CSV ou Avro", false],
            ["checkpointLocation guarda o progresso da ingestão, evitando reprocessar arquivos já lidos", true],
            ["O modo file notification é o padrão do Auto Loader, independente do volume de arquivos", false],
            ["O modo de evolução rescue grava dados fora do schema esperado na coluna _rescued_data", true],
            ["O schema completo da fonte precisa ser informado manualmente antes da primeira execução", false],
        ],
    },
    {
        statement:
            "Sobre o comando COPY INTO no Databricks, quais DUAS afirmações a seguir estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O COPY INTO é idempotente, não recarrega arquivos já processados, e é expresso como um comando SQL simples, o que o torna adequado para cargas agendadas e periódicas. Ele não é a melhor opção para volumes muito altos e contínuos de arquivos, cenário em que o Auto Loader escala melhor; o COPY INTO também não cria uma pipeline de streaming contínua, sendo executado sob demanda ou por agendamento; e o conceito de checkpoint de streaming pertence ao Auto Loader e ao Structured Streaming, não ao COPY INTO.",
        topic: "COPY INTO",
        options: [
            ["É idempotente: arquivos já carregados em execuções anteriores não são carregados de novo", true],
            ["Substitui com vantagem o Auto Loader em qualquer cenário com milhões de arquivos contínuos", false],
            ["É executado como um comando SQL, o que facilita seu uso em cargas agendadas simples", true],
            ["Cria automaticamente uma pipeline de streaming contínua para manter a tabela atualizada", false],
            ["Exige a criação prévia de um checkpoint de streaming para conseguir funcionar corretamente", false],
        ],
    },
    {
        statement:
            "Sobre o Lakeflow Connect, quais DUAS afirmações a seguir estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Lakeflow Connect disponibiliza conectores gerenciados prontos para aplicações SaaS e bancos de dados, como Salesforce e SQL Server, e alguns conectores de banco de dados dependem de um gateway implantado próximo à origem para capturar as mudanças antes de aplicá-las no Unity Catalog. Ler arquivos de object storage é o papel típico do Auto Loader ou do COPY INTO, não uma exclusividade do Lakeflow Connect; os conectores gerenciados existem justamente para dispensar código customizado de extração; e o Lakeflow Connect suporta atualização incremental, inclusive CDC, não apenas cargas totais.",
        topic: "Lakeflow Connect",
        options: [
            ["É a única forma suportada no Databricks para ler arquivos de um bucket de object storage", false],
            ["Os conectores gerenciados exigem código customizado de extração para cada nova fonte", false],
            ["Oferece conectores gerenciados para SaaS e bancos de dados, como Salesforce e SQL Server", true],
            ["Só realiza cargas totais (full load) dos dados de origem, sem suporte a atualização incremental", false],
            ["Para alguns conectores de banco de dados, usa um gateway implantado próximo à origem", true],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia de dados está construindo um job no Lakeflow Jobs com quatro tasks: ingest_bronze, transform_silver, transform_gold e publish_dashboard. A task publish_dashboard só pode começar depois que transform_silver e transform_gold tiverem terminado com sucesso. Qual é a forma correta de configurar essa exigência?",
        explanation:
            "A dependência entre tasks em um job multi-task do Lakeflow Jobs é definida no campo Depends on de cada task: ao adicionar transform_silver e transform_gold como dependências de publish_dashboard, essa task só inicia quando as duas terminarem com sucesso, formando o DAG do job. Colocar tudo em um notebook único elimina o paralelismo e o controle individual de cada etapa. Um trigger table update controla quando o job inteiro começa a rodar, não a ordem interna das tasks. O parâmetro max_concurrent_runs limita quantas execuções do job podem rodar ao mesmo tempo, sem nenhum efeito sobre a ordem das tasks dentro de uma mesma execução.",
        topic: "Lakeflow Jobs - DAG e dependencias entre tasks",
        options: [
            ["Colocar as quatro tasks em sequência dentro de um único notebook, sem criar tasks separadas no job", false],
            ["Configurar um trigger do tipo table update apontando para as tabelas silver e gold usadas pelo job", false],
            ["Adicionar transform_silver e transform_gold como dependência (Depends on) da task publish_dashboard", true],
            ["Definir o parâmetro max_concurrent_runs do job como 1 para forçar uma ordem sequencial entre as tasks", false],
        ],
    },
    {
        statement:
            "A equipe financeira da empresa Nortis precisa que um job de consolidação contábil rode todos os dias úteis às 06:00 no horário de Brasília, processando os dados fechados no dia anterior. Qual configuração de trigger do Lakeflow Jobs atende esse requisito com menor esforço operacional?",
        explanation:
            "O requisito é um horário fixo e recorrente (dias úteis às 06:00 no fuso de Brasília), que é exatamente o que o trigger Scheduled resolve com uma expressão cron e fuso horário configurável. O trigger Continuous mantém o job reiniciando sem parar, sem respeitar um horário específico. O trigger File arrival reage à chegada de arquivos, não a um horário fixo, então o job só rodaria quando algo fosse gravado no volume. O trigger Table update reage a mudanças em uma tabela Delta, também sem garantir o horário exato exigido pela equipe financeira.",
        topic: "Lakeflow Jobs triggers (Scheduled)",
        options: [
            ["Um trigger Scheduled com expressão cron para dias úteis às 06:00 e fuso horário America/Sao_Paulo", true],
            ["Um trigger Continuous, que reinicia o job automaticamente assim que cada execução anterior termina", false],
            ["Um trigger File arrival apontando para o volume onde os arquivos contábeis são gravados todo dia", false],
            ["Um trigger Table update monitorando a tabela de lançamentos contábeis usada como origem do job", false],
        ],
    },
    {
        statement:
            "Um time de dados recebe arquivos CSV de um parceiro em um volume do Unity Catalog em horários irregulares, às vezes várias vezes ao dia, às vezes nenhuma. Eles querem que o job de ingestão comece assim que novos arquivos chegarem, sem manter o job rodando o tempo todo e sem depender de um horário fixo. Qual trigger do Lakeflow Jobs resolve isso?",
        explanation:
            "O trigger File arrival monitora um caminho (como um volume do Unity Catalog ou um external location) e dispara uma nova execução automaticamente quando novos arquivos chegam, sem manter o job ativo o tempo todo e sem depender de um horário fixo, exatamente o que o time precisa. Um Scheduled a cada 5 minutos gera execuções desnecessárias quando não há arquivo novo, além de não reagir de forma imediata. Continuous mantém o job rodando sem parar, o que contraria o requisito de não manter o job ativo o tempo todo. Table update reage a mudanças em tabelas Delta gerenciadas, não à chegada de arquivos brutos em um volume.",
        topic: "Lakeflow Jobs triggers (File arrival)",
        options: [
            ["Trigger Scheduled configurado para rodar a cada 5 minutos, verificando se há arquivos novos no volume", false],
            ["Trigger Continuous, mantendo uma execução ativa o tempo todo para ler o volume continuamente", false],
            ["Trigger Table update apontando para uma tabela externa que referencia os arquivos do volume", false],
            ["Trigger File arrival apontando para o caminho do volume onde os arquivos do parceiro chegam", true],
        ],
    },
    {
        statement:
            "A tabela Delta silver.pedidos é atualizada em horários irregulares por um pipeline mantido por outra equipe. Sempre que essa tabela recebe dados novos, um job downstream precisa recalcular os agregados da camada gold o quanto antes, sem que a equipe consumidora precise saber em que horário o pipeline upstream roda. Qual trigger atende esse cenário?",
        explanation:
            "O trigger Table update permite que um job seja disparado automaticamente quando uma tabela específica do Unity Catalog recebe novos dados, desacoplando o job downstream do horário em que o pipeline upstream roda, que é exatamente o requisito descrito. Um Scheduled de hora em hora não garante que o job rode logo após a atualização, podendo processar dados atrasados ou rodar sem necessidade. File arrival monitora a chegada de arquivos brutos em um caminho, não mudanças lógicas em uma tabela Delta gerenciada. É falso que tabelas Delta só possam ser monitoradas por jobs contínuos, o trigger Table update foi criado justamente para esse cenário reativo sem precisar de um job rodando sem parar.",
        topic: "Lakeflow Jobs triggers (Table update)",
        options: [
            ["Trigger Scheduled configurado para rodar a cada hora, na tentativa de acompanhar o pipeline upstream", false],
            ["Trigger Table update, monitorando diretamente a tabela silver.pedidos registrada no Unity Catalog", true],
            ["Trigger File arrival apontando para o diretório de armazenamento físico da tabela silver.pedidos", false],
            ["Trigger Continuous, já que tabelas Delta só podem ser monitoradas por jobs contínuos no Lakeflow", false],
        ],
    },
    {
        statement:
            "Um job lê eventos de um tópico Kafka usando Structured Streaming e precisa processar os dados com a menor latência possível, iniciando uma nova execução automaticamente assim que a execução anterior for encerrada, inclusive após uma falha. Qual configuração de trigger do Lakeflow Jobs é mais adequada?",
        explanation:
            "O trigger Continuous mantém o job sempre em execução, iniciando automaticamente uma nova tentativa assim que a execução atual termina (inclusive após falha), o que dá a menor latência possível para um job de streaming contínuo. O Scheduled, mesmo com a granularidade mínima em minutos, sempre deixa uma lacuna entre execuções, incompatível com o requisito de reinício imediato. File arrival não faz sentido para um checkpoint location, que não é um caminho de chegada de dados de origem. Table update monitorando a própria tabela de saída do job criaria uma dependência circular e não atende o requisito de latência contínua.",
        topic: "Lakeflow Jobs triggers (Continuous)",
        options: [
            ["Trigger Continuous, que inicia uma nova execução automaticamente assim que a anterior termina", true],
            ["Trigger Scheduled com a menor granularidade permitida pela expressão cron do Lakeflow Jobs", false],
            ["Trigger File arrival apontando para o checkpoint location usado pelo Structured Streaming", false],
            ["Trigger Table update monitorando a própria tabela de destino gravada por esse mesmo job", false],
        ],
    },
    {
        statement:
            "A task ingest_api de um job falha ocasionalmente porque a API externa retorna erro 503 por instabilidade momentânea, mas costuma funcionar normalmente quando executada de novo minutos depois. A equipe quer que o Lakeflow Jobs tente executar essa task automaticamente mais uma vez antes de marcar o job como falho. Qual configuração resolve isso sem intervenção manual?",
        explanation:
            "Cada task de um job do Lakeflow Jobs pode ter um número de retries e um intervalo mínimo entre tentativas configurados diretamente nela: quando a task falha, o Databricks tenta executá-la novamente de forma automática, sem precisar de nenhuma intervenção manual, o que resolve falhas transitórias como o erro 503. Um trigger Continuous reinicia o job inteiro, não apenas a task que falhou, sendo bem mais disruptivo. O Repair Run é um recurso manual (ou disparado via API), acionado depois que uma execução já terminou com falha, e não um mecanismo automático dentro da própria execução. Aumentar o timeout apenas dá mais tempo para a task rodar, mas não faz o Databricks tentar de novo depois de um erro 503.",
        topic: "Lakeflow Jobs retries",
        options: [
            ["Configurar um trigger Continuous para o job inteiro reiniciar automaticamente após qualquer falha", false],
            ["Usar o Repair Run para que o Databricks vá reexecutando essa task até que ela funcione sozinha", false],
            ["Configurar um número de retries e o intervalo entre tentativas na própria task ingest_api", true],
            ["Aumentar o timeout da task para que ela espere mais tempo antes de ser considerada com falha", false],
        ],
    },
    {
        statement:
            "Em um job multi-task do Lakeflow Jobs, cada task com dependências pode configurar uma condição de Run if dependencies, que controla quando ela deve rodar de acordo com o resultado das tasks das quais depende. Quais afirmações abaixo sobre esse recurso estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Run if dependencies é configurável individualmente em cada task que tem dependências (Depends on), com opções como All succeeded (padrão), At least one failed, All done, entre outras: por isso a condição At least one failed de fato faz a task rodar quando pelo menos uma dependência falhou, e o padrão quando nada é alterado é mesmo All succeeded. É falso que a condição se propague igual para todas as tasks do job, cada task define a sua própria de forma independente. Também é falso que Run if dependencies substitua o Depends on, os dois recursos trabalham juntos: o Depends on define as arestas do DAG e o Run if dependencies define a condição de disparo sobre essas arestas. É falso que o recurso seja exclusivo de tasks do tipo Notebook, ele se aplica a qualquer tipo de task.",
        topic: "Lakeflow Jobs Run If (tratamento de falha por task)",
        options: [
            ["O recurso Run if dependencies substitui a necessidade de configurar Depends on entre as tasks", false],
            ["A condição At least one failed faz a task rodar quando ao menos uma dependência direta falhou", true],
            ["Depois de definida em uma task, a mesma condição passa a valer para todas as outras tasks do job", false],
            ["A condição padrão para uma task com dependências é All succeeded: ela só roda se todas tiverem sucesso", true],
            ["O recurso Run if dependencies só pode ser configurado em tasks do tipo Notebook, e não nos demais tipos", false],
        ],
    },
    {
        statement:
            "Um job com seis tasks encadeadas falhou porque a quarta task, load_gold, não conseguiu escrever na tabela de destino devido a uma indisponibilidade momentânea de storage. As três primeiras tasks foram concluídas com sucesso e as duas últimas foram puladas por dependerem da que falhou. Depois de confirmar que o storage está normal, qual é a forma mais eficiente de retomar a execução sem reprocessar o que já funcionou?",
        explanation:
            "O Repair Run foi feito exatamente para esse cenário: ele reexecuta apenas as tasks que falharam ou foram puladas (e as que dependem delas), reaproveitando os resultados das tasks que já tinham sido concluídas com sucesso, sem custo de reprocessar o que já funcionou. Rodar o job inteiro de novo com Run Now repete desnecessariamente as três primeiras tasks. Remover tasks da definição do job é uma forma manual, arriscada e não pensada para esse fim, além de não preservar o histórico da execução original. Clonar o job inteiro só para rodar uma task isolada perde as dependências e o contexto da execução original, sendo bem mais trabalhoso que um Repair Run.",
        topic: "Lakeflow Jobs Repair Run",
        options: [
            ["Disparar uma nova execução completa do job (Run Now), repetindo as seis tasks desde o início", false],
            ["Usar o Repair Run para reexecutar somente a task load_gold e as tasks que dependem dela", true],
            ["Editar a definição do job para remover temporariamente as três primeiras tasks já concluídas", false],
            ["Clonar o job inteiro e rodar o clone apenas com a task load_gold configurada nele", false],
        ],
    },
    {
        statement:
            "A mesma definição de job precisa processar um catálogo diferente dependendo do ambiente: dev no catálogo dev_vendas e produção no catálogo prod_vendas. A equipe quer evitar duplicar a definição do job só para trocar o nome do catálogo, podendo alterar esse valor facilmente a cada execução manual, sem editar o código do notebook. Qual recurso do Lakeflow Jobs atende essa necessidade?",
        explanation:
            "Job parameters são definidos uma vez no nível do job e podem ser referenciados por qualquer task usando uma referência dinâmica como {{job.parameters.catalog_name}}, além de poderem ser sobrescritos facilmente a cada execução manual, sem duplicar a definição do job nem editar código. Criar duas cópias do job é exatamente a duplicação que a equipe quer evitar. Variável de ambiente no cluster job compute não é o mecanismo que o Lakeflow Jobs expõe para parametrizar tasks, e não é fácil de alterar por execução. O Repair Run serve para retomar uma execução que já falhou, não para definir ou alterar parâmetros de entrada de novas execuções.",
        topic: "Lakeflow Jobs parametros de job",
        options: [
            ["Criar duas cópias completas do job, uma fixa para o ambiente dev e outra fixa para produção", false],
            ["Definir o nome do catálogo como uma variável de ambiente fixada na configuração do cluster job compute", false],
            ["Usar o Repair Run a cada execução manual apenas para sobrescrever o nome do catálogo usado", false],
            ["Definir um job parameter, como catalog_name, e referenciá-lo nas tasks com {{job.parameters.catalog_name}}", true],
        ],
    },
    {
        statement:
            "A task validate_bronze conta quantos registros inválidos foram descartados durante a validação, e a task decide_alert, que roda logo em seguida, precisa usar essa contagem para decidir se dispara um alerta. As duas tasks rodam em notebooks separados dentro do mesmo job. Qual é a forma nativa do Lakeflow Jobs de passar esse número de uma task para a outra?",
        explanation:
            "Task values é o mecanismo nativo do Lakeflow Jobs para passar pequenos valores entre tasks: usa-se dbutils.jobs.taskValues.set(chave, valor) na task de origem e dbutils.jobs.taskValues.get(nome_da_task, chave) na task seguinte, feito exatamente para esse tipo de comunicação. As tasks de um job rodam em execuções isoladas, podendo até usar clusters diferentes, então não compartilham processo Spark nem variáveis Python em memória. O disco local do driver também não é garantido entre tasks diferentes, já que cada uma pode rodar em um cluster distinto. Job parameters são valores de entrada definidos antes do job começar a rodar, não um mecanismo para gravar resultados calculados durante a execução.",
        topic: "Lakeflow Jobs task values",
        options: [
            ["Gravar o valor com dbutils.jobs.taskValues.set() em validate_bronze e lê-lo com taskValues.get() em decide_alert", true],
            ["Salvar o número em uma variável Python global, assumindo que as duas tasks compartilham o mesmo processo Spark", false],
            ["Escrever o valor em um arquivo temporário no disco local do driver e tentar lê-lo a partir da task seguinte", false],
            ["Usar um job parameter definido antes da execução para armazenar um resultado calculado durante o próprio job", false],
        ],
    },
    {
        statement:
            "A equipe de plataforma quer ser avisada automaticamente pelo Lakeflow Jobs em duas situações de um job crítico: quando a execução falhar e quando a execução ultrapassar um tempo de duração considerado normal, mesmo que ainda esteja rodando. Quais recursos nativos de notificação do Lakeflow Jobs atendem essas duas situações? (Selecione DUAS opções.)",
        explanation:
            "O Lakeflow Jobs permite configurar notificações nativas por e-mail (ou por webhooks de destino, como Slack e Microsoft Teams) para eventos como início, sucesso e falha da execução, o que cobre o aviso de falha. Além disso, é possível configurar um alerta de duration threshold, que dispara uma notificação quando a execução ultrapassa um tempo esperado configurado, mesmo que o job ainda esteja rodando, cobrindo a segunda situação. O alerta de streaming backlog existe para tasks de streaming específicas, não para jobs sem nenhuma task, o que nem faz sentido como conceito. Também é falso que notificações fiquem restritas ao notebook via print() ou que dependam de uma ferramenta externa, o envio de e-mail e webhook é um recurso nativo do próprio job.",
        topic: "Lakeflow Jobs notificacoes e alertas",
        options: [
            ["Notificação no evento On failure, configurável para enviar e-mail ou acionar um webhook de destino", true],
            ["Alerta de streaming backlog, disponível apenas para jobs que não possuem nenhuma task configurada", false],
            ["Alerta de duration threshold, que dispara uma notificação quando a execução ultrapassa o tempo esperado", true],
            ["Notificações só podem ser recebidas dentro do próprio notebook da task, através de comandos print()", false],
            ["É necessário integrar uma ferramenta externa de terceiros, pois o Lakeflow Jobs não envia e-mail nativamente", false],
        ],
    },
    {
        statement:
            "Um job de produção roda todas as madrugadas anexado a um cluster all-purpose que a equipe de analistas também usa durante o dia para consultas interativas. A equipe notou que o custo em DBUs está mais alto do que o necessário e que, às vezes, o job disputa recursos com notebooks abertos manualmente. Qual mudança reduz o custo e o conflito de recursos sem alterar a lógica do job?",
        explanation:
            "Job compute é um cluster efêmero, criado quando a execução do job começa e encerrado automaticamente quando ela termina, cobrado em uma taxa de DBU mais baixa que a de all-purpose compute e sem disputar recursos com clusters interativos usados por analistas: é a mudança recomendada para jobs de produção. Aumentar os workers do cluster all-purpose só aumenta o custo, sem resolver a diferença de tarifa entre os dois tipos de compute. Rodar o job direto em um notebook agendado no cluster all-purpose, sem o Lakeflow Jobs, abandona recursos como DAG, retries e Repair Run, além de não mudar o tipo de compute usado. Fixar o cluster em modo single user muda controle de acesso, mas não resolve nem o custo nem a disputa real de recursos entre job e analistas.",
        topic: "Job compute x all-purpose compute",
        options: [
            ["Aumentar o número de workers do cluster all-purpose para atender o job e os analistas ao mesmo tempo", false],
            ["Migrar o job para rodar direto no cluster all-purpose através de um notebook agendado, sem usar o Lakeflow Jobs", false],
            ["Trocar o cluster all-purpose por um job compute, criado e encerrado automaticamente só para a execução do job", true],
            ["Fixar o cluster all-purpose em modo single user para que o job tenha prioridade sobre os analistas", false],
        ],
    },
    {
        statement:
            "Uma equipe pequena de dados não quer definir tipo de instância, versão de runtime nem política de autoscaling para os clusters dos seus jobs, e precisa que as execuções iniciem rápido, mesmo em jobs esporádicos que rodam poucas vezes por semana. Qual opção de compute do Lakeflow Jobs elimina a necessidade de configurar e gerenciar cluster manualmente?",
        explanation:
            "O compute serverless para jobs elimina a necessidade de escolher tipo de instância, versão de runtime ou política de autoscaling: a própria Databricks provisiona e escala o compute automaticamente, com início rápido mesmo para jobs esporádicos, exatamente o que a equipe pequena precisa. Job compute com autoscaling ainda exige escolher tipo de instância e configurar o range de escalonamento manualmente. Manter um cluster all-purpose sempre ativo aumenta o custo contínuo e ainda exige configuração manual do cluster. Um pool de instâncias pré-inicializadas reduz o tempo de start, mas continua exigindo que a equipe configure e gerencie o pool manualmente.",
        topic: "Lakeflow Jobs compute serverless",
        options: [
            ["Job compute com autoscaling configurado para o menor tamanho possível de instância disponível", false],
            ["Compute serverless, provisionado e escalado automaticamente pela Databricks sem configuração manual", true],
            ["All-purpose compute compartilhado, mantido sempre ativo para atender novas execuções rapidamente", false],
            ["Job compute usando um pool de instâncias pré-inicializadas configurado previamente pela equipe", false],
        ],
    },
    {
        statement:
            "A equipe mantém um Lakeflow Spark Declarative Pipeline que atualiza as camadas bronze, silver e gold de vendas. Além de rodar esse pipeline, o time quer, na mesma execução orquestrada, rodar antes uma task de validação de esquema dos arquivos de origem e, depois, uma task que publica um relatório em um dashboard, com dependências claras entre as etapas. Qual é a forma correta de orquestrar isso no Lakeflow Jobs?",
        explanation:
            "O Lakeflow Jobs permite criar uma task do tipo Pipeline que dispara uma atualização do Declarative Pipeline existente, e essa task pode ser encadeada via Depends on com outras tasks de tipos diferentes, como Notebook, formando um DAG único com validação, pipeline e publicação do relatório. Usar apenas o agendamento próprio do pipeline não permite incluir as tasks de validação e publicação na mesma orquestração, já que o pipeline sozinho não orquestra tasks heterogêneas. Colar o código do pipeline em uma task Notebook comum abandona o motor declarativo do Lakeflow Spark Declarative Pipelines, perdendo recursos como o gerenciamento automático de streaming tables e materialized views. Criar três jobs independentes sem dependência entre eles não garante a ordem exigida entre validação, pipeline e publicação.",
        topic: "Lakeflow Jobs task tipo Pipeline",
        options: [
            ["Configurar apenas o agendamento próprio do Declarative Pipeline, que substitui o Lakeflow Jobs para qualquer orquestração", false],
            ["Colar o código do pipeline dentro de uma task do tipo Notebook comum, junto com a lógica de validação e publicação", false],
            ["Criar três jobs separados e independentes, um para cada etapa, sem nenhuma dependência configurada entre eles", false],
            ["Criar um job com uma task do tipo Pipeline apontando para o pipeline existente, encadeada via Depends on com as demais tasks", true],
        ],
    },
    {
        statement:
            "Uma tabela Delta de pedidos recebe milhares de eventos por hora e é filtrada com frequência pela coluna order_id, que tem cardinalidade quase única por linha. A equipe particionou a tabela por order_id e passou a ver um número excessivo de diretórios pequenos, com consultas mais lentas em vez de mais rápidas. Qual abordagem resolve melhor esse cenário?",
        explanation:
            "Particionar por uma coluna de altíssima cardinalidade como order_id cria praticamente um diretório por linha, gerando excesso de arquivos pequenos e sobrecarga de metadados. O Liquid Clustering foi criado para colunas assim: reorganiza os dados de forma incremental através de CLUSTER BY, sem exigir a escolha de colunas de partição, e evita essa explosão de diretórios. Manter o particionamento atual e só rodar ZORDER não remove a causa raiz do problema, que é particionar por uma coluna de altíssima cardinalidade. Adicionar mais uma coluna de particionamento só piora a fragmentação dos dados. Reduzir o tamanho alvo dos arquivos do OPTIMIZE tende a criar ainda mais arquivos pequenos, o oposto do que a tabela precisa.",
        topic: "Liquid Clustering x particionamento",
        options: [
            ["Manter o particionamento atual e executar ZORDER BY (order_id) após cada carga de dados", false],
            ["Adicionar mais uma coluna de particionamento para dividir melhor os diretórios existentes", false],
            ["Remover o particionamento por order_id e habilitar Liquid Clustering na tabela com CLUSTER BY (order_id)", true],
            ["Reduzir o tamanho alvo dos arquivos gerados pelo OPTIMIZE para compensar o excesso de partições criadas", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados mantém centenas de tabelas Delta gerenciadas pelo Unity Catalog e tem dificuldade em manter jobs agendados de OPTIMIZE e VACUUM atualizados para cada uma delas, o que causa acúmulo de arquivos pequenos e crescimento do custo de armazenamento. Qual recurso reduz esse esforço operacional com a menor manutenção manual?",
        explanation:
            "A Predictive Optimization é um recurso do Unity Catalog que analisa o padrão de leitura e escrita de cada tabela gerenciada e decide automaticamente quando rodar OPTIMIZE, incluindo clustering, e VACUUM, sem exigir jobs agendados manualmente. Criar um único job com horário fixo para todas as tabelas ainda exige manutenção manual da agenda e roda mesmo quando desnecessário para uma tabela específica. Aumentar o cluster de manutenção só acelera a execução, sem remover o esforço de gerenciar quando e onde rodar cada tarefa. É o oposto do real: a Predictive Optimization é voltada para tabelas gerenciadas (managed) pelo Unity Catalog, não para tabelas externas.",
        topic: "Predictive Optimization",
        options: [
            ["Habilitar a Predictive Optimization para as tabelas, deixando a Databricks decidir quando executar OPTIMIZE e VACUUM automaticamente", true],
            ["Criar um único job no Lakeflow Jobs que executa OPTIMIZE e VACUUM em todas as tabelas, sempre na mesma janela de horário noturno", false],
            ["Aumentar o tamanho do cluster que executa a manutenção para concluir o OPTIMIZE de todas as tabelas mais rápido", false],
            ["Migrar as tabelas para o formato de tabela externa (external) no Unity Catalog, já que a Predictive Optimization só está disponível para tabelas externas", false],
        ],
    },
    {
        statement:
            "Uma streaming table alimentada pelo Auto Loader recebe centenas de micro-lotes pequenos por dia. Com o tempo, os analistas notam que as consultas nessa tabela ficam cada vez mais lentas, mesmo sem aumento real no volume de dados consultado. Ao investigar, a equipe encontra um número muito grande de arquivos Parquet pequenos no diretório da tabela. Qual ação resolve diretamente esse problema?",
        explanation:
            "O cenário descrito é o clássico small files problem: muitas escritas pequenas geram muitos arquivos, aumentando a sobrecarga de metadados e piorando a performance de leitura. O comando OPTIMIZE compacta esses arquivos pequenos em arquivos maiores através de bin-packing, sem alterar os dados armazenados. VACUUM remove apenas arquivos que já não pertencem a nenhuma versão válida da tabela, e não compacta arquivos que ainda estão ativos. Mudar spark.sql.shuffle.partitions afeta o processamento em memória durante o shuffle, não o layout de arquivos já gravados em disco. Diminuir o intervalo de trigger do Auto Loader aumentaria ainda mais a frequência de escritas pequenas, piorando o problema em vez de resolvê-lo.",
        topic: "OPTIMIZE e small files",
        options: [
            ["Executar VACUUM na tabela para remover os arquivos pequenos que não são mais necessários", false],
            ["Aumentar o valor de spark.sql.shuffle.partitions no cluster que processa os micro-lotes", false],
            ["Diminuir o intervalo de trigger do Auto Loader para processar os dados com mais frequência", false],
            ["Executar o comando OPTIMIZE na tabela para compactar os arquivos pequenos em arquivos maiores", true],
        ],
    },
    {
        statement:
            "Uma tabela Delta com 50 colunas é otimizada regularmente com OPTIMIZE. Ainda assim, consultas que filtram pela coluna status_pagamento, que é a coluna de número 40 da tabela, não apresentam ganho de data skipping, enquanto filtros nas primeiras colunas da tabela conseguem eliminar arquivos normalmente. Qual é a causa mais provável?",
        explanation:
            "O Delta Lake coleta e armazena estatísticas de mínimo, máximo e contagem de nulos apenas para as primeiras 32 colunas de cada tabela por padrão, através da propriedade delta.dataSkippingNumIndexedCols, e usa isso para decidir quais arquivos podem ser ignorados numa consulta. Como status_pagamento é a coluna de número 40, ela fica fora do conjunto padrão de colunas indexadas, o que explica a ausência de pruning. Data skipping funciona em qualquer coluna dentro do conjunto indexado, não apenas em colunas de partição. O OPTIMIZE já atualiza as estatísticas dos arquivos que reescreve, sem depender de ANALYZE TABLE para o data skipping do Delta Lake funcionar. O tipo de dado da coluna não é o fator limitante nesse cenário.",
        topic: "Data skipping e file pruning",
        options: [
            ["Data skipping só funciona em colunas usadas como chave de particionamento da tabela", false],
            ["Por padrão, o Delta Lake coleta estatísticas de data skipping apenas para as primeiras 32 colunas da tabela", true],
            ["O OPTIMIZE não recalcula estatísticas de colunas, sendo necessário rodar ANALYZE TABLE após cada compactação", false],
            ["A coluna status_pagamento precisa ser convertida para o tipo STRING para ficar elegível a data skipping", false],
        ],
    },
    {
        statement:
            "Um engenheiro precisa liberar espaço de armazenamento rapidamente. Ele desabilita a verificação de segurança de retenção (spark.databricks.delta.retentionDurationCheck.enabled = false) e executa VACUUM vendas RETAIN 0 HOURS em uma tabela de produção que é lida continuamente por dashboards e por jobs de longa duração. Qual é o principal risco dessa ação?",
        explanation:
            "VACUUM remove arquivos de dados que não pertencem mais à versão atual da tabela e que são mais antigos que o período de retenção configurado. O padrão de 7 dias (168 horas) existe justamente para preservar arquivos que consultas de longa duração, leitores concorrentes ou consultas de time travel ainda podem precisar. Ao reduzir a retenção para 0 horas com a verificação desabilitada, o engenheiro corre o risco real de apagar arquivos que operações em andamento ainda referenciam, causando falhas de leitura. VACUUM não compacta arquivos pequenos, essa é a função do OPTIMIZE. Com a verificação desabilitada, o comando executa normalmente com a retenção informada, então não é verdade que ele sempre falhe. E o VACUUM remove sim arquivos de dados no armazenamento, não apenas metadados do log de transação.",
        topic: "VACUUM e retencao",
        options: [
            ["O VACUUM com retenção zero passa a compactar automaticamente os arquivos pequenos da tabela, dispensando o uso do comando OPTIMIZE", false],
            ["Mesmo com a verificação desabilitada, o comando ainda falha, pois o Delta Lake nunca permite retenção abaixo de 7 dias em produção", false],
            ["Nada muda na prática, pois o comando VACUUM só remove arquivos do log de transação, nunca arquivos de dados da tabela", false],
            ["Arquivos de dados ainda necessários para consultas em andamento ou para operações de time travel podem ser removidos, causando falhas", true],
        ],
    },
    {
        statement:
            "A atualização (update) de um pipeline criado com o Lakeflow Spark Declarative Pipelines, que normalmente leva 20 minutos, passou a levar mais de 2 horas, sem mudança aparente no volume de dados de entrada. A equipe precisa descobrir qual tabela ou fluxo específico do pipeline está causando a lentidão antes de agir. Qual é a MELHOR forma de investigar?",
        explanation:
            "O event log do Lakeflow Spark Declarative Pipelines registra, para cada atualização, métricas por fluxo e tabela como linhas processadas, duração, erros e métricas de qualidade de dados, permitindo identificar exatamente qual tabela ou fluxo está consumindo mais tempo. A partir daí, o Spark UI da execução específica pode ser usado para investigar shuffle, spill ou skew naquele estágio pontual. Aumentar workers às cegas e disparar uma nova atualização pode mascarar o problema sem identificar a causa raiz, além de aumentar o custo sem necessidade. O pipeline não roda como consultas registradas no histórico de um SQL warehouse, então essa fonte não reflete a execução do pipeline. Um full refresh é caro, reprocessa dados desnecessariamente e não isola sozinho onde está o gargalo.",
        topic: "Event log de Declarative Pipelines",
        options: [
            ["Consultar o event log do pipeline para ver a duração e as métricas de cada fluxo e tabela, e identificar o gargalo", true],
            ["Aumentar o número máximo de workers do pipeline e disparar uma nova atualização, só para ver se o tempo total melhora", false],
            ["Consultar o histórico de queries do SQL warehouse padrão do workspace, já que todo pipeline executa como consultas SQL registradas lá", false],
            ["Reiniciar o pipeline do zero (full refresh) para forçar o recálculo de todas as tabelas e comparar o tempo total gasto", false],
        ],
    },
    {
        statement:
            "Um job com várias tasks no Lakeflow Jobs vem apresentando duração total cada vez maior nas últimas execuções, sem nenhuma mudança recente no código ou no volume de dados de entrada. Antes de alterar qualquer configuração, a equipe quer descobrir qual task específica está demorando mais do que o normal. Qual é a forma mais direta de investigar isso?",
        explanation:
            "A aba Runs de um job no Lakeflow Jobs guarda o histórico de execuções com a duração de cada task, permitindo comparar execuções recentes lado a lado e identificar exatamente qual task específica passou a demorar mais, antes de decidir onde otimizar. O painel de billing e uso mostra custo agregado em DBUs, útil para acompanhar gasto, mas não aponta qual task específica ficou mais lenta. Olhar somente os logs do driver do cluster não dá a granularidade por task que a aba Runs oferece. Assumir que a task com mais linhas de código é a culpada é um chute sem base em métricas reais de execução, podendo levar a equipe a otimizar a task errada.",
        topic: "Lakeflow Jobs - duracao por task",
        options: [
            ["Consultar o painel de billing e uso (usage) do workspace para ver o total de DBUs consumidos pelo job no mês", false],
            ["Abrir a aba Runs do job e comparar a duração de cada task entre as últimas execuções, buscando a que mais cresceu", true],
            ["Observar apenas os logs do driver do cluster, sem abrir os detalhes de execução de cada task individualmente", false],
            ["Assumir que a task com mais linhas de código é a responsável e otimizá-la diretamente, sem checar métricas de execução", false],
        ],
    },
    {
        statement:
            "Um pipeline Spark SQL no Databricks faz uma agregação (GROUP BY) pesada sobre uma tabela de eventos e, na mesma consulta, cruza o resultado com uma tabela de referência de 6 MB. O cluster usa as configurações padrão de Spark SQL, incluindo Adaptive Query Execution (AQE) habilitada. Quais DUAS afirmações sobre o comportamento do Spark SQL nesse cenário estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O valor padrão de spark.sql.autoBroadcastJoinThreshold é 10 MB: tabelas menores que esse limite são candidatas a broadcast join, o que evita o shuffle da tabela de referência e acelera a consulta. Com Adaptive Query Execution habilitada, que é o padrão em runtimes recentes, o Spark reavalia o plano em tempo de execução e pode coalescer partições de shuffle pequenas geradas pela agregação, tornando o número efetivo de partições diferente do valor bruto configurado em spark.sql.shuffle.partitions. Mais partições de shuffle não é sempre melhor: com poucos dados, o excesso de partições gera overhead de tarefas pequenas em vez de reduzir o tempo total. O limite do broadcast é medido em bytes, e não em número de linhas da tabela. Definir o limite como -1 desabilita o broadcast automático por completo, o oposto do recomendado para acelerar consultas com tabelas pequenas.",
        topic: "spark.sql.shuffle.partitions x autoBroadcastJoinThreshold",
        options: [
            ["Aumentar o valor de spark.sql.shuffle.partitions sempre reduz o tempo total da consulta, independentemente do volume de dados processados", false],
            ["A tabela de referência está abaixo do padrão de spark.sql.autoBroadcastJoinThreshold (10 MB), então o Spark faz broadcast automático", true],
            ["O valor de spark.sql.autoBroadcastJoinThreshold é definido em número de linhas da tabela de referência, e não em bytes armazenados", false],
            ["Com AQE habilitada, o Spark pode coalescer partições de shuffle pequenas, ajustando na prática o valor de spark.sql.shuffle.partitions", true],
            ["Definir spark.sql.autoBroadcastJoinThreshold como -1 é a forma recomendada para acelerar consultas com tabelas de referência pequenas", false],
        ],
    },
    {
        statement:
            "Uma equipe quer reduzir o custo de computação dos seus jobs agendados, que têm carga variável ao longo do dia, sem comprometer a confiabilidade das execuções. Quais DUAS práticas realmente ajudam a reduzir custo nesse cenário? (Selecione DUAS opções.)",
        explanation:
            "Compute serverless remove a necessidade de dimensionar e manter um cluster: a Databricks gerencia o provisionamento e a cobrança é pelo uso efetivo do job, sem custo de cluster ocioso esperando a próxima execução. Autoscaling permite que o cluster cresça durante os picos e reduza nos momentos de menor carga, evitando pagar por capacidade parada. Desativar o auto termination mantém o cluster ligado mesmo sem uso, aumentando o custo em vez de reduzi-lo. Selecionar sempre o maior tipo de instância disponível gera capacidade ociosa na maior parte do tempo, já que a carga é variável ao longo do dia. Fixar um número alto de workers mínimos garante capacidade mesmo quando ela não é necessária, aumentando o custo basal do cluster.",
        topic: "Custo: serverless e autoscaling",
        options: [
            ["Usar compute serverless nos jobs: a Databricks gerencia o provisionamento e cobra pelo uso efetivo, sem cluster ocioso", true],
            ["Desativar o encerramento automático (auto termination) do cluster, para reduzir o tempo de espera no início de cada execução", false],
            ["Habilitar autoscaling no cluster de job, deixando o número de workers variar automaticamente conforme a carga de cada execução", true],
            ["Sempre selecionar o maior tipo de instância disponível para os workers, garantindo margem de sobra em qualquer pico de carga", false],
            ["Fixar um número alto de workers mínimos no cluster, eliminando qualquer espera por escalonamento durante os picos de carga", false],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia recebe arquivos CSV de um sistema de pedidos que chegam continuamente em um volume do Unity Catalog. O pipeline em Lakeflow Spark Declarative Pipelines precisa ingerir cada arquivo novo exatamente uma vez, de forma incremental, para compor a camada bronze. Qual objeto do pipeline atende esse requisito?",
        explanation:
            "Streaming tables são feitas para fontes que só crescem, processando cada arquivo novo de forma incremental e exatamente uma vez, o que é ideal para ingestão contínua na camada bronze. Materialized views recalculam ou atualizam o resultado de uma consulta, sem a garantia de ler cada arquivo novo uma única vez. Uma view tradicional apenas lê a definição a cada consulta, sem persistir nem processar dados de forma incremental. E um INSERT OVERWRITE agendado reprocessaria a pasta inteira a cada execução, sem incrementalidade real.",
        topic: "Streaming Tables",
        options: [
            ["Uma streaming table, criada com CREATE OR REFRESH STREAMING TABLE, lendo os arquivos de forma incremental", true],
            ["Uma materialized view, criada com CREATE OR REFRESH MATERIALIZED VIEW, apontando para a pasta de arquivos", false],
            ["Uma view tradicional do Databricks SQL, apontando diretamente para o caminho do volume de arquivos", false],
            ["Uma tabela Delta gerenciada, populada por um comando INSERT OVERWRITE agendado a cada hora do dia", false],
        ],
    },
    {
        statement:
            "Um time de BI precisa de uma tabela na camada gold com o total de vendas por dia, sempre consistente com o resultado de uma consulta de agregação sobre a camada silver, deixando o motor do pipeline decidir entre recálculo completo ou atualização incremental. Qual objeto do Lakeflow Spark Declarative Pipelines atende essa necessidade?",
        explanation:
            "Materialized views armazenam o resultado de uma consulta de agregação, e o motor do pipeline escolhe automaticamente entre recomputar tudo ou atualizar incrementalmente, sempre entregando um resultado equivalente ao de rodar a consulta inteira. Streaming tables são voltadas a fontes incrementais que só crescem, não a agregações que revisitam o histórico da silver. AUTO CDC serve para aplicar mudanças de um feed de CDC, não para agregar métricas de vendas. E uma view de sessão não persiste dados nem se integra ao agendamento do pipeline.",
        topic: "Materialized Views - selecao de objeto",
        options: [
            ["Uma streaming table, criada com CREATE OR REFRESH STREAMING TABLE sobre a tabela silver", false],
            ["Uma materialized view, criada com CREATE OR REFRESH MATERIALIZED VIEW sobre a tabela silver", true],
            ["Uma tabela populada por AUTO CDC INTO, configurada a partir da própria camada silver", false],
            ["Uma view temporária, criada apenas para durar a sessão atual do notebook de análise", false],
        ],
    },
    {
        statement:
            "Um engenheiro está avaliando se deve usar materialized views para uma nova tabela gold e revisa o comportamento desse objeto no Lakeflow Spark Declarative Pipelines. Sobre as materialized views, quais DUAS afirmações estão corretas? (Selecione DUAS opções.)",
        explanation:
            "Materialized views garantem um resultado equivalente ao de rodar a consulta de definição contra os dados atuais, e o motor decide internamente se atualiza de forma incremental ou recalcula tudo, o que for mais eficiente. Elas podem ser definidas sobre fontes batch ou streaming, então não são exclusivas de fontes de streaming. A garantia de processar cada linha da fonte exatamente uma vez é característica de streaming tables, não de materialized views. E materialized views são consultáveis normalmente via SQL, como qualquer tabela do Unity Catalog.",
        topic: "Materialized Views - caracteristicas",
        options: [
            ["Elas só podem ser definidas a partir de fontes de streaming, nunca de fontes batch", false],
            ["O resultado retornado é sempre equivalente ao de rodar a consulta de definição contra os dados atuais", true],
            ["Cada linha da fonte é garantidamente processada exatamente uma única vez, como em uma streaming table", false],
            ["O motor do pipeline pode atualizar os resultados de forma incremental quando isso for mais eficiente", true],
            ["Elas não podem ser consultadas com comandos SQL, apenas lidas diretamente via PySpark", false],
        ],
    },
    {
        statement:
            "Um engenheiro precisa decidir entre streaming table e materialized view para popular a camada silver a partir de uma tabela bronze que só recebe registros novos, nunca updates ou deletes. O requisito é processar cada registro da bronze exatamente uma vez, sem reprocessar o histórico a cada atualização do pipeline. Qual objeto atende melhor esse requisito?",
        explanation:
            "Streaming tables são feitas exatamente para esse cenário: fontes append-only, onde cada registro é lido e processado uma única vez, de forma incremental, sem revisitar o histórico já processado. Materialized views existem para consultas que podem precisar revisitar o conjunto de dados inteiro, não para simplesmente propagar registros novos. AUTO CDC serve para aplicar inserções, atualizações e deleções vindas de um feed de CDC com chaves, o que não é o caso aqui. E uma tabela externa do Unity Catalog apenas aponta para arquivos, sem processamento incremental gerenciado pelo pipeline.",
        topic: "Streaming Tables x Materialized Views",
        options: [
            ["Materialized view, pois recalcula o resultado completo a cada atualização para garantir consistência", false],
            ["Uma tabela externa do Unity Catalog, pois não depende do mecanismo de atualização do pipeline", false],
            ["Streaming table, pois processa incrementalmente e uma única vez cada registro novo da origem", true],
            ["AUTO CDC, pois foi desenhado para processar dados que só crescem, sem chave de deduplicação", false],
        ],
    },
    {
        statement:
            "A tabela silver de clientes deve sempre refletir apenas o estado mais atual de cada cliente, sobrescrevendo valores antigos quando chega uma atualização, sem manter histórico de versões anteriores. O feed de mudanças chega em uma tabela bronze de CDC. Qual configuração do AUTO CDC atende essa regra?",
        explanation:
            "STORED AS SCD TYPE 1 faz o AUTO CDC sobrescrever o registro existente com os valores mais recentes, sem manter histórico, que é exatamente o requisito descrito. STORED AS SCD TYPE 2 faria o oposto, preservando todas as versões históricas com colunas de vigência. Um MERGE manual com WHEN MATCHED THEN INSERT não é uma combinação válida (a cláusula MATCHED só aceita UPDATE ou DELETE), então não atualizaria os clientes existentes. E uma materialized view com GROUP BY não trata corretamente inserções, atualizações e deleções vindas de um feed de CDC como o AUTO CDC trata nativamente.",
        topic: "AUTO CDC - SCD Type 1",
        options: [
            ["Configurar AUTO CDC INTO a tabela silver com a cláusula STORED AS SCD TYPE 2", false],
            ["Executar um MERGE INTO manual, sem AUTO CDC, usando somente WHEN MATCHED THEN INSERT", false],
            ["Criar uma MATERIALIZED VIEW que seleciona o último registro de cada cliente com GROUP BY", false],
            ["Configurar AUTO CDC INTO a tabela silver com a cláusula STORED AS SCD TYPE 1", true],
        ],
    },
    {
        statement:
            "Uma tabela silver de assinaturas é configurada com AUTO CDC INTO e STORED AS SCD TYPE 2 para manter o histórico completo de mudanças de plano de cada cliente. Ao revisar a tabela após a primeira execução, o time quer confirmar quais colunas de controle foram criadas automaticamente. Quais DUAS colunas o AUTO CDC adiciona ao destino para registrar o período de vigência de cada versão do registro? (Selecione DUAS opções.)",
        explanation:
            "Quando uma tabela é alvo de AUTO CDC com STORED AS SCD TYPE 2, o Lakeflow Spark Declarative Pipelines adiciona automaticamente as colunas __START_AT e __END_AT, que registram o intervalo de vigência de cada versão do registro (a versão vigente fica com __END_AT nulo). Nomes como __CURRENT_FLAG, __VERSION_ID e __CDC_TIMESTAMP não são colunas geradas por esse recurso.",
        topic: "AUTO CDC - SCD Type 2",
        options: [
            ["A coluna __START_AT", true],
            ["A coluna __CURRENT_FLAG", false],
            ["A coluna __VERSION_ID", false],
            ["A coluna __END_AT", true],
            ["A coluna __CDC_TIMESTAMP", false],
        ],
    },
    {
        statement:
            "Um feed de CDC de pedidos pode entregar eventos fora de ordem, e a tabela silver precisa refletir sempre o valor mais recente de cada pedido, mesmo quando um evento antigo chega atrasado após um mais novo. Qual cláusula do AUTO CDC garante que o registro final aplicado seja o logicamente mais recente, independente da ordem de chegada?",
        explanation:
            "SEQUENCE BY define qual coluna representa a ordem cronológica ou lógica dos eventos, permitindo que o AUTO CDC resolva corretamente eventos atrasados e aplique sempre a versão mais recente ao destino. KEYS apenas identifica o registro, para saber qual linha atualizar, sem tratar ordenação. APPLY AS DELETE WHEN trata exclusões vindas do feed, não a ordem de chegada dos eventos. E STORED AS SCD TYPE 2 define se o histórico é mantido, mas não resolve, por si só, o problema de eventos fora de ordem.",
        topic: "AUTO CDC - SEQUENCE BY",
        options: [
            ["SEQUENCE BY, apontando para uma coluna que representa a ordem lógica dos eventos", true],
            ["KEYS, apontando para a coluna ou colunas que identificam unicamente cada pedido", false],
            ["APPLY AS DELETE WHEN, apontando para a coluna que indica operações de exclusão", false],
            ["STORED AS SCD TYPE 2, para manter todas as versões recebidas do pedido", false],
        ],
    },
    {
        statement:
            "O feed de CDC de clientes inclui uma coluna operation que pode valer INSERT, UPDATE ou DELETE. Quando o valor é DELETE, o registro correspondente deve ser removido da tabela silver de clientes durante a aplicação do AUTO CDC. Qual cláusula deve ser adicionada ao AUTO CDC INTO para tratar essa exclusão corretamente?",
        explanation:
            "APPLY AS DELETE WHEN indica ao AUTO CDC qual condição identifica uma exclusão no feed de origem, fazendo com que o registro correspondente seja removido da tabela de destino. STORED AS SCD TYPE 1 controla se o histórico é mantido ou sobrescrito, mas não interpreta exclusões por si só. Uma expectation com ON VIOLATION DROP ROW descartaria a própria linha de CDC antes do processamento, apagando o sinal de exclusão em vez de aplicá-lo ao destino. E SEQUENCE BY define apenas a ordem lógica dos eventos, não o tipo de operação.",
        topic: "AUTO CDC - APPLY AS DELETE WHEN",
        options: [
            ["Usar STORED AS SCD TYPE 1, que remove automaticamente registros antigos do destino", false],
            ["Adicionar a cláusula APPLY AS DELETE WHEN operation = 'DELETE' ao AUTO CDC INTO", true],
            ["Criar uma expectation que descarta a linha sempre que operation for igual a 'DELETE'", false],
            ["Usar SEQUENCE BY operation, para priorizar exclusões sobre as demais operações", false],
        ],
    },
    {
        statement:
            "Uma tabela bronze de cliques recebeu o mesmo arquivo processado duas vezes por engano, gerando linhas idênticas em todas as colunas. Antes de gravar na camada silver, o time precisa remover essas duplicatas exatas com o mínimo de código possível. Qual abordagem resolve o problema de forma mais direta?",
        explanation:
            "Quando as linhas duplicadas são idênticas em todas as colunas, SELECT DISTINCT, equivalente a dropDuplicates() sem argumentos no PySpark, é a forma mais direta de eliminar as cópias, sem precisar definir chave de negócio nem ordenação. Uma window function com ROW_NUMBER() é útil quando linhas com a mesma chave não são idênticas e é preciso escolher qual versão manter, exigindo mais código do que o necessário aqui. AUTO CDC serve para aplicar mudanças de um feed de CDC com chaves, não para remover duplicatas exatas de um mesmo arquivo. E uma expectation com LAG() não removeria duplicatas, apenas sinalizaria ou descartaria linhas conforme uma condição.",
        topic: "Deduplicacao (SQL e PySpark)",
        options: [
            ["Aplicar uma window function com ROW_NUMBER() particionada por um identificador de negócio", false],
            ["Adicionar uma CONSTRAINT EXPECT que compara cada linha com a anterior usando a função LAG()", false],
            ["Usar SELECT DISTINCT, ou dropDuplicates() sem argumentos, sobre o conjunto de colunas completo", true],
            ["Configurar AUTO CDC INTO com STORED AS SCD TYPE 2 sobre a própria tabela bronze de cliques", false],
        ],
    },
    {
        statement:
            "Uma streaming table silver define CONSTRAINT valid_email EXPECT (email RLIKE '@') sem nenhuma cláusula ON VIOLATION adicional. Um lote novo chega com algumas linhas cujo campo email não contém '@'. O que acontece com essas linhas e com a execução do pipeline?",
        explanation:
            "Sem uma cláusula ON VIOLATION, o comportamento padrão de uma expectation é warn: a linha é mantida no resultado, mas a violação passa a ser contabilizada nas métricas de qualidade e no log de eventos do pipeline. O descarte automático da linha exige ON VIOLATION DROP ROW, e a falha do pipeline exige ON VIOLATION FAIL UPDATE, nenhuma das duas presente no exemplo. E o Lakeflow Spark Declarative Pipelines não cria uma tabela de quarentena automaticamente para linhas inválidas; isso precisaria ser modelado explicitamente pelo engenheiro.",
        topic: "Expectations - comportamento warn",
        options: [
            ["As linhas são descartadas antes de chegar à tabela de destino, e o restante do lote é gravado normalmente", false],
            ["O pipeline inteiro falha de imediato, interrompendo a atualização daquela tabela", false],
            ["As linhas ficam em quarentena, em uma tabela separada criada automaticamente pelo pipeline", false],
            ["As linhas são gravadas na tabela, e a violação fica registrada nas métricas do pipeline", true],
        ],
    },
    {
        statement:
            "Uma tabela silver de vendas não pode conter linhas com valor negativo na coluna amount, mas o time quer que o pipeline continue rodando normalmente, apenas descartando essas linhas inválidas antes de gravar a tabela. Qual configuração de expectation atende esse requisito?",
        explanation:
            "ON VIOLATION DROP ROW faz com que apenas as linhas que violam a condição sejam removidas antes da gravação, enquanto o restante do lote segue processado normalmente, que é exatamente o pedido. ON VIOLATION FAIL UPDATE interromperia a atualização inteira da tabela ao encontrar qualquer violação. Sem cláusula de ON VIOLATION, a linha inválida seria mantida na tabela, apenas registrada nas métricas. E um filtro aplicado somente na camada gold deixaria a linha inválida presente na silver, não atendendo ao requisito naquele ponto do pipeline.",
        topic: "Expectations - ON VIOLATION DROP ROW",
        options: [
            ["CONSTRAINT valid_amount EXPECT (amount >= 0) ON VIOLATION DROP ROW", true],
            ["CONSTRAINT valid_amount EXPECT (amount >= 0) ON VIOLATION FAIL UPDATE", false],
            ["CONSTRAINT valid_amount EXPECT (amount >= 0), sem nenhuma cláusula ON VIOLATION", false],
            ["Um filtro WHERE amount >= 0 aplicado somente na consulta de leitura da tabela gold", false],
        ],
    },
    {
        statement:
            "Um engenheiro está definindo expectations em uma streaming table e quer saber, além do comportamento padrão de manter a linha e apenas registrar a violação nas métricas, quais outras reações existem para um dado inválido. Quais DUAS cláusulas ON VIOLATION estão disponíveis em uma CONSTRAINT EXPECT do Lakeflow Spark Declarative Pipelines? (Selecione DUAS opções.)",
        explanation:
            "As únicas duas cláusulas válidas de ON VIOLATION no Lakeflow Spark Declarative Pipelines são DROP ROW, que descarta somente a linha inválida antes da gravação, e FAIL UPDATE, que interrompe a atualização da tabela ao encontrar a violação. QUARANTINE ROW, RETRY UPDATE e IGNORE COLUMN não são cláusulas existentes no recurso de expectations.",
        topic: "Expectations - clausulas ON VIOLATION",
        options: [
            ["ON VIOLATION QUARANTINE ROW, que move a linha para uma tabela de erro automática", false],
            ["ON VIOLATION RETRY UPDATE, que tenta novamente a leitura da origem antes de gravar", false],
            ["ON VIOLATION DROP ROW, que remove somente a linha inválida antes da gravação", true],
            ["ON VIOLATION IGNORE COLUMN, que grava a linha substituindo o valor inválido por nulo", false],
            ["ON VIOLATION FAIL UPDATE, que interrompe a atualização da tabela ao encontrar a violação", true],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia está desenhando as camadas de um pipeline de pedidos vindos de um sistema transacional. Uma das camadas deve conter os dados o mais próximo possível do formato original da origem, com metadados de ingestão, sem nenhuma limpeza ou regra de negócio aplicada. Qual é a FUNÇÃO dessa camada na arquitetura medallion?",
        explanation:
            "A descrição, dados o mais próximos possível do formato original, com metadados de ingestão, sem limpeza, corresponde exatamente ao papel da camada bronze na arquitetura medallion. A opção de silver descreve corretamente essa outra camada, focada em dados conformados e deduplicados, o que não é o caso aqui. A opção de gold descreve a camada de agregados de negócio para consumo final, também não aplicável. E a arquitetura medallion não define uma camada de sandbox exploratória como parte do fluxo bronze, silver e gold.",
        topic: "Arquitetura Medallion - Bronze",
        options: [
            ["Camada silver: dados conformados, deduplicados e enriquecidos, prontos para consumo por outras equipes", false],
            ["Camada bronze: cópia fiel dos dados brutos, com metadados de ingestão, para auditoria e reprocessamento", true],
            ["Camada gold: conjunto agregado e modelado, pronto para consumo direto por dashboards e relatórios", false],
            ["Camada de sandbox, usada apenas para testes exploratórios e descartada após a validação do pipeline", false],
        ],
    },
    {
        statement:
            "Depois de ingerir pedidos brutos na camada bronze, o time precisa de uma camada intermediária com dados limpos, com tipos corretos, deduplicados e enriquecidos com a dimensão de clientes, mas ainda sem as agregações de negócio finais usadas nos dashboards executivos. Qual é a FUNÇÃO dessa camada na arquitetura medallion?",
        explanation:
            "Dados limpos, com tipos corretos, deduplicados, enriquecidos com dimensões, mas ainda sem as agregações finais de negócio, é exatamente o papel da camada silver na arquitetura medallion. A opção de bronze descreve corretamente essa outra camada, mas bronze preserva os dados brutos, sem limpeza nem deduplicação. A opção de gold descreve a camada de métricas já agregadas para consumo final, que o enunciado explicitamente exclui. E a arquitetura medallion não inclui uma camada de staging volátil descartada a cada execução do pipeline.",
        topic: "Arquitetura Medallion - Silver",
        options: [
            ["Camada bronze: cópia fiel dos dados brutos da origem, preservada para auditoria e reprocessamento", false],
            ["Camada de staging volátil, descartada após cada execução do pipeline, nunca persistida em Delta Lake", false],
            ["Camada silver: dados conformados e deduplicados, prontos para consumo, antes das agregações finais", true],
            ["Camada gold: conjunto final agregado e modelado, pronto para consumo direto por dashboards e relatórios", false],
        ],
    },
    {
        statement:
            "Uma equipe de BI precisa de uma camada final, com métricas já agregadas e modeladas, como receita total por dia e por região, pronta para ser consumida diretamente por dashboards executivos, sem exigir joins ou agregações adicionais na ferramenta de BI. Qual é a FUNÇÃO dessa camada na arquitetura medallion?",
        explanation:
            "Métricas já agregadas e modeladas, prontas para consumo direto por dashboards sem joins ou agregações adicionais, é exatamente a definição da camada gold. A opção de silver descreve dados conformados e deduplicados, mas ainda sem as agregações finais, o que não atende ao enunciado. A opção de bronze descreve a cópia bruta da origem, bem distante do requisito. E o catálogo de metadados do Unity Catalog serve para governança e linhagem, não é uma camada de dados de negócio da arquitetura medallion.",
        topic: "Arquitetura Medallion - Gold",
        options: [
            ["Camada silver: dados conformados e deduplicados, mas ainda antes das agregações finais de negócio", false],
            ["Camada bronze: cópia fiel dos dados brutos da origem, preservada para auditoria e reprocessamento", false],
            ["Camada de metadados do Unity Catalog, usada para governança e linhagem, não para consumo em BI", false],
            ["Camada gold: dados agregados e modelados, prontos para consumo direto por dashboards e relatórios", true],
        ],
    },
    {
        statement:
            "Uma tabela silver de clientes recebe diariamente um arquivo com clientes novos e clientes existentes que mudaram de endereço. O time quer inserir os clientes novos e atualizar o endereço dos existentes em uma única operação atômica sobre a tabela Delta, usando a chave customer_id. Qual comando resolve isso diretamente?",
        explanation:
            "MERGE INTO permite combinar inserção e atualização em uma única instrução atômica sobre uma tabela Delta, usando a chave de correspondência para decidir se atualiza, WHEN MATCHED, ou insere, WHEN NOT MATCHED, que é exatamente o requisito. Um DELETE seguido de INSERT não é atômico como um MERGE e perde a distinção entre quem foi realmente atualizado. Um CREATE OR REPLACE TABLE diário substituiria a tabela inteira, descartando clientes que não estão no arquivo do dia. E um AUTO CDC sem KEYS nem STORED AS SCD TYPE não é uma configuração válida para aplicar upserts.",
        topic: "Delta Lake - MERGE INTO",
        options: [
            ["Um MERGE INTO na tabela clientes_silver, usando ON customer_id, com WHEN MATCHED UPDATE e WHEN NOT MATCHED INSERT", true],
            ["Um DELETE de todos os clientes que aparecem no arquivo, seguido de um INSERT INTO com o conteúdo completo do arquivo", false],
            ["Um CREATE OR REPLACE TABLE clientes_silver AS SELECT * FROM atualizacoes, substituindo a tabela inteira todos os dias", false],
            ["Um AUTO CDC INTO clientes_silver, sem definir KEYS nem STORED AS SCD TYPE, aplicando somente as inserções do arquivo", false],
        ],
    },
    {
        statement:
            "Um job com um bug sobrescreveu por engano a tabela Delta vendas_gold com dados incorretos. A equipe confirmou, pelo DESCRIBE HISTORY da tabela, que a versão 41, executada uma hora antes do job com bug, ainda está correta e dentro do período de retenção do log. Qual comando restaura a tabela para o estado da versão 41 da forma mais direta?",
        explanation:
            "RESTORE TABLE reverte uma tabela Delta diretamente para uma versão ou timestamp anterior, usando o próprio log de transações, sem exigir reescrita manual. Um SELECT com VERSION AS OF seguido de um INSERT OVERWRITE manual chega a um resultado parecido, mas com mais passos e mais risco de erro do que o comando dedicado. VACUUM remove arquivos de dados antigos que não são mais referenciados pelo log, o oposto do que se quer aqui, podendo até inviabilizar o time travel se aplicado de forma agressiva. E recriar a tabela apontando para os arquivos físicos da versão antiga ignora o gerenciamento transacional do Delta Lake.",
        topic: "Delta Lake - Time Travel",
        options: [
            ["Fazer SELECT * FROM vendas_gold VERSION AS OF 41 e depois um INSERT OVERWRITE manual na mesma tabela", false],
            ["Executar RESTORE TABLE vendas_gold TO VERSION AS OF 41, revertendo a tabela diretamente para essa versão", true],
            ["Executar VACUUM vendas_gold RETAIN 41 HOURS, para remover os arquivos gravados após a versão correta", false],
            ["Recriar a tabela vendas_gold apontando diretamente para os arquivos físicos gravados na versão 41", false],
        ],
    },
    {
        statement:
            "Uma tabela bronze de cadastros de clientes recebe múltiplas atualizações para o mesmo customer_id ao longo do dia, cada uma com um updated_at diferente. Para a camada silver, o time precisa manter apenas a versão mais recente de cada cliente, com todas as suas colunas. Qual abordagem em PySpark resolve isso corretamente?",
        explanation:
            "Uma Window particionada por customer_id e ordenada por updated_at decrescente, combinada com row_number() e um filtro rn = 1, mantém exatamente a linha mais recente e completa de cada cliente. dropDuplicates() sem colunas remove apenas linhas totalmente idênticas, o que não resolve múltiplas versões diferentes do mesmo cliente. groupBy com max(updated_at) devolve somente a data mais recente, não a linha inteira com as demais colunas daquela versão. E ordenar o DataFrame inteiro e aplicar limit(1) manteria uma única linha no total, não uma por cliente.",
        topic: "PySpark - Window Functions",
        options: [
            ["Aplicar dropDuplicates() sobre o DataFrame inteiro, sem especificar nenhuma coluna de referência para a chave do cliente", false],
            ["Ordenar o DataFrame inteiro por updated_at com orderBy() e aplicar limit(1) sobre o resultado final obtido", false],
            ["Aplicar row_number() em uma Window por customer_id, ordenada por updated_at decrescente, e filtrar rn = 1", true],
            ["Aplicar groupBy('customer_id').max('updated_at') e gravar o resultado dessa agregação direto na silver", false],
        ],
    },
    {
        statement:
            "Um job em PySpark une uma tabela de fatos de vendas com centenas de milhões de linhas a uma tabela de dimensão de lojas com apenas algumas centenas de linhas. O join está lento devido a um shuffle grande envolvendo a tabela de fatos. Qual técnica reduz esse custo ao evitar o shuffle da tabela pequena?",
        explanation:
            "broadcast() instrui o Spark a enviar uma cópia inteira da tabela pequena para todos os executores, eliminando o shuffle da tabela grande de fatos e acelerando o join. Aumentar o número de partições com repartition() ainda mantém um shuffle completo da tabela de fatos. Converter a tabela de fatos em uma view temporária não muda a estratégia física de execução do join. E substituir o join por um UNION seguido de filtro produz um resultado logicamente diferente, sem combinar colunas das duas tabelas por chave, e não resolve o custo.",
        topic: "PySpark - Joins (broadcast)",
        options: [
            ["Usar repartition() na tabela de fatos para aumentar o número de partições antes do join", false],
            ["Converter a tabela de fatos em uma view temporária antes de executar o mesmo join", false],
            ["Trocar o join por um UNION entre as duas tabelas, filtrando o resultado depois", false],
            ["Usar broadcast(df_lojas) no join, para replicar a tabela pequena em todos os executores", true],
        ],
    },
    {
        statement:
            "A camada silver tem uma linha por item de pedido, então um mesmo pedido pode aparecer em várias linhas. Para a camada gold, o time precisa de uma tabela com o total de receita e a quantidade de PEDIDOS distintos por regiao e por mes. Qual consulta SQL produz corretamente essa granularidade?",
        explanation:
            "GROUP BY regiao, mes com SUM(valor) e COUNT(DISTINCT pedido_id) produz uma linha por regiao e mes, com receita total e quantidade de pedidos distintos, contando cada pedido uma única vez mesmo com várias linhas de item. Agrupar somente por regiao, sem mes, gera uma granularidade mais grosseira do que a pedida. Selecionar as colunas originais sem nenhuma função de agregação apenas reordena os dados linha a linha, sem consolidar nada. E uma window function com SUM(valor) OVER (PARTITION BY regiao) mantém uma linha por item de pedido, sem reduzir a granularidade, além de não agrupar por mes.",
        topic: "SQL - Agregacoes (GROUP BY)",
        options: [
            ["SELECT regiao, mes, SUM(valor) AS receita, COUNT(DISTINCT pedido_id) AS pedidos FROM silver GROUP BY regiao, mes", true],
            ["SELECT regiao, mes, SUM(valor) AS receita, COUNT(pedido_id) AS pedidos FROM silver GROUP BY regiao", false],
            ["SELECT regiao, mes, valor AS receita, pedido_id AS pedidos FROM silver ORDER BY regiao, mes LIMIT 1000", false],
            ["SELECT regiao, mes, SUM(valor) OVER (PARTITION BY regiao ORDER BY mes) AS receita, pedido_id AS pedidos FROM silver", false],
        ],
    },
    // ===== Questões adicionais (banco ampliado para variar as tentativas) =====
    {
        statement: "Uma engenheira quer entender como uma tabela Delta garante atomicidade quando dois jobs gravam quase ao mesmo tempo. Onde o Delta Lake registra cada operacao de escrita para oferecer transacoes ACID e time travel?",
        explanation: "O log de transacoes (_delta_log) guarda commits JSON ordenados e checkpoints Parquet periodicos; e isso que da ACID, isolamento de snapshot e time travel, sem depender de bloqueio externo.",
        topic: "Delta Lake - transaction log",
        options: [
            ["Todo o estado da tabela fica apenas no metastore do Hive, que controla os bloqueios de concorrencia entre os jobs que gravam.", false],
            ["Dentro do rodape de cada arquivo Parquet de dados, que guarda a lista completa das versoes anteriores da tabela.", false],
            ["Em um servico externo de bloqueio distribuido que precisa ser provisionado a parte para coordenar as gravacoes concorrentes.", false],
            ["Em arquivos de commit JSON ordenados dentro da pasta _delta_log, que descrevem cada transacao da tabela.", true],
        ],
    },
    {
        statement: "Uma equipe tem um diretorio grande de arquivos Parquet ja particionados no object storage e quer passar a usar recursos do Delta Lake sem reescrever todos os dados. Qual abordagem atende a esse objetivo?",
        explanation: "CONVERT TO DELTA cria o _delta_log a partir dos arquivos Parquet existentes, tornando o diretorio uma tabela Delta sem reescrever os dados.",
        topic: "Delta Lake - CONVERT TO DELTA",
        options: [
            ["Rodar CONVERT TO DELTA sobre o diretorio Parquet, gerando o log de transacoes sem reescrever os arquivos de dados.", true],
            ["Executar OPTIMIZE no diretorio Parquet, que reorganiza os arquivos e automaticamente os promove para o formato Delta.", false],
            ["Ler todos os Parquet em um DataFrame e regravar em outro caminho com format('delta'), duplicando os dados no armazenamento.", false],
            ["Criar uma tabela externa apontando para o Parquet, pois o Unity Catalog trata qualquer tabela externa como Delta por padrao.", false],
        ],
    },
    {
        statement: "Antes de um teste de carga arriscado, um engenheiro quer uma copia totalmente independente da tabela vendas_gold, para validar sem afetar a tabela original nem depender dos arquivos dela. Qual comando cria essa copia?",
        explanation: "O DEEP CLONE copia os arquivos de dados e os metadados, resultando em uma tabela independente; o SHALLOW CLONE so copia metadados e continua apontando para os arquivos da origem.",
        topic: "Delta Lake - DEEP CLONE",
        options: [
            ["CREATE TABLE ... SHALLOW CLONE, que copia apenas os metadados e continua referenciando os arquivos de dados da tabela de origem.", false],
            ["CREATE TABLE ... AS SELECT, que gera uma view materializada sincronizada automaticamente com qualquer mudanca feita na origem.", false],
            ["CREATE TABLE ... DEEP CLONE, que copia dados e metadados para uma tabela independente da origem.", true],
            ["CREATE TABLE ... LIKE, que so replica o schema e as propriedades, sem copiar nenhum dado nem o historico da tabela de origem.", false],
        ],
    },
    {
        statement: "Um append em uma tabela Delta falha porque o DataFrame de origem passou a ter uma coluna nova que nao existe na tabela. A equipe quer que essa coluna seja adicionada automaticamente na gravacao. O que explica o erro e resolve o caso?",
        explanation: "O schema enforcement bloqueia gravacoes com schema divergente por padrao; habilitar mergeSchema (ou o autoMerge) permite evoluir o schema adicionando a nova coluna no append.",
        topic: "Delta Lake - schema enforcement e mergeSchema",
        options: [
            ["O Delta nunca aceita novas colunas; e preciso recriar a tabela do zero com CREATE OR REPLACE a cada mudanca de schema da origem.", false],
            ["Por schema enforcement, o Delta rejeita schemas divergentes; usar a opcao mergeSchema como true no append adiciona a coluna.", true],
            ["O erro vem do particionamento; basta reparticionar o DataFrame pela nova coluna para que a gravacao passe a aceita-la.", false],
            ["O append no formato Delta ignora colunas extras silenciosamente, entao o erro so pode ter sido causado por um tipo de dado incompativel.", false],
        ],
    },
    {
        statement: "A camada gold precisa consumir, de forma incremental, apenas as linhas que foram inseridas, atualizadas ou removidas em uma tabela silver Delta, sabendo o tipo de cada mudanca. Qual recurso entrega isso?",
        explanation: "O Change Data Feed registra as mudancas em nivel de linha com o tipo (_change_type: insert, update_preimage/postimage, delete); e habilitado por propriedade de tabela e lido com a opcao readChangeFeed ou table_changes().",
        topic: "Delta Lake - Change Data Feed",
        options: [
            ["O time travel com VERSION AS OF, que retorna o conteudo completo de uma versao anterior, mas nao marca o tipo de cada mudanca linha a linha.", false],
            ["O comando DESCRIBE HISTORY, que lista as operacoes feitas na tabela, mas nao devolve as linhas de dados que mudaram.", false],
            ["O Change Data Feed, habilitado por delta.enableChangeDataFeed, lido com readChangeFeed e a coluna _change_type.", true],
            ["O comando OPTIMIZE com ZORDER, que agrupa fisicamente as linhas alteradas para acelerar a leitura das mudancas recentes.", false],
        ],
    },
    {
        statement: "Um engenheiro quer criar a tabela clientes_ativos ja populada com o resultado de uma consulta que filtra clientes por status, sem declarar manualmente cada coluna e tipo. Qual comando faz isso?",
        explanation: "O CTAS (CREATE TABLE AS SELECT) cria a tabela inferindo o schema a partir do SELECT e ja a popula com o resultado, sem precisar declarar colunas manualmente.",
        topic: "Spark SQL - CREATE TABLE AS SELECT",
        options: [
            ["CREATE TABLE clientes_ativos AS SELECT ..., que deriva o schema do resultado da consulta e grava as linhas.", true],
            ["CREATE TABLE clientes_ativos (col1 ..., col2 ...) e depois um COPY INTO separado para carregar as linhas vindas da consulta.", false],
            ["CREATE OR REPLACE TEMP VIEW clientes_ativos AS SELECT ..., que persiste os dados fisicamente como uma nova tabela gerenciada.", false],
            ["INSERT INTO clientes_ativos SELECT ..., que cria a tabela automaticamente caso ela ainda nao exista no schema atual da sessao.", false],
        ],
    },
    {
        statement: "Em um cluster compartilhado, uma view temporaria criada em um notebook precisa ser consultada por outro notebook anexado ao mesmo cluster. Qual objeto permite esse compartilhamento entre sessoes?",
        explanation: "A global temp view fica no schema global_temp e e visivel por outras sessoes do mesmo cluster/aplicacao; a temp view comum e restrita a sessao que a criou.",
        topic: "Spark SQL - TEMP VIEW x GLOBAL TEMP VIEW",
        options: [
            ["Uma TEMP VIEW comum, que fica disponivel para qualquer notebook enquanto o cluster estiver ligado, independentemente da sessao.", false],
            ["Uma view criada com CREATE VIEW, que existe apenas na sessao que a definiu e e descartada ao desanexar o notebook do cluster.", false],
            ["Um DataFrame em cache com persist(), que replica automaticamente a definicao da consulta para todas as sessoes conectadas ao cluster.", false],
            ["Uma GLOBAL TEMP VIEW, acessivel por outras sessoes do mesmo cluster pelo schema global_temp.", true],
        ],
    },
    {
        statement: "Uma coluna payload de uma tabela bronze guarda uma string JSON como texto, e a equipe precisa extrair o campo cliente.id de dentro dela usando Spark SQL. Qual abordagem e adequada?",
        explanation: "Quando o JSON esta guardado como string, a sintaxe de dois pontos (payload:cliente.id) extrai os campos; o ponto so funciona depois de converter em struct, por exemplo com from_json.",
        topic: "Spark SQL - dados JSON aninhados",
        options: [
            ["Usar EXPLODE(payload), que transforma automaticamente cada chave do JSON em uma nova linha com o seu respectivo valor.", false],
            ["Aplicar CAST(payload AS STRUCT) direto, pois o Spark converte qualquer string em struct sem precisar informar o schema dos campos.", false],
            ["Navegar com a sintaxe de dois pontos, como payload:cliente.id, que le campos de um JSON armazenado como string.", true],
            ["Referenciar payload.cliente.id com ponto, que e a forma de acessar chaves de uma string JSON ainda nao convertida em struct.", false],
        ],
    },
    {
        statement: "Uma tabela tem uma coluna itens do tipo array, com varios produtos por pedido, e o time precisa de uma linha por produto para conseguir agregar as vendas item a item. Qual funcao resolve isso?",
        explanation: "explode() cria uma linha por elemento do array (ou par chave-valor de um map), permitindo agregar item a item.",
        topic: "Spark SQL - explode",
        options: [
            ["explode(itens), que gera uma linha para cada elemento do array em uma nova coluna.", true],
            ["collect_list(itens), que junta os elementos de varias linhas em um unico array consolidado por pedido.", false],
            ["array_contains(itens, valor), que verifica a presenca de um elemento e retorna um booleano por linha do pedido.", false],
            ["size(itens), que devolve a quantidade de elementos do array, mas mantem tudo em uma unica linha por pedido.", false],
        ],
    },
    {
        statement: "Um job PySpark ficou lento depois que a equipe passou a limpar textos com uma UDF em Python. Um revisor sugere trocar a UDF por funcoes nativas do Spark sempre que possivel. Qual e a justificativa correta?",
        explanation: "As funcoes nativas sao compreendidas e otimizadas pelo Catalyst e nao pagam o custo de serializacao entre a JVM e o Python que uma UDF impoe, por isso costumam ser mais rapidas.",
        topic: "PySpark - UDF x funcoes nativas",
        options: [
            ["UDFs em Python nao conseguem acessar colunas do DataFrame, entao qualquer transformacao de texto obriga a coletar os dados no driver antes.", false],
            ["Funcoes nativas rodam somente no driver, o que evita a rede e por isso sempre superam qualquer UDF distribuida pelos executores.", false],
            ["Funcoes nativas sao otimizadas pelo Catalyst e evitam a serializacao extra que uma UDF Python impoe.", true],
            ["UDFs em Python desabilitam completamente o particionamento do DataFrame, forcando todo o processamento a rodar em uma unica particao.", false],
        ],
    },
    {
        statement: "Um DataFrame precisa substituir completamente o conteudo atual da tabela destino a cada execucao do job, apagando as linhas antigas. Qual modo de escrita do DataFrameWriter deve ser usado?",
        explanation: "O mode('overwrite') substitui o conteudo da tabela pelo do DataFrame; append acrescenta, ignore nao faz nada se ja houver dados e errorIfExists (padrao) falha se a tabela ja existir.",
        topic: "PySpark - save modes",
        options: [
            ["mode('append'), que acrescenta as novas linhas as existentes e, por ser o padrao, dispensa qualquer configuracao adicional no writer.", false],
            ["mode('ignore'), que sobrescreve os dados apenas quando o schema do DataFrame difere do schema atual da tabela de destino.", false],
            ["mode('errorIfExists'), que atualiza somente as linhas que ja existem e insere as demais, funcionando como um upsert automatico.", false],
            ["mode('overwrite'), que substitui os dados existentes na tabela pelo conteudo do DataFrame.", true],
        ],
    },
    {
        statement: "Depois de transformar dados com a API de DataFrame, uma engenheira quer consultar o resultado usando comandos SQL (spark.sql) no mesmo notebook, sem gravar nada em disco. O que ela deve fazer?",
        explanation: "createOrReplaceTempView registra o DataFrame como uma view temporaria de sessao, permitindo consulta-lo com spark.sql sem persistir dados.",
        topic: "PySpark - createOrReplaceTempView",
        options: [
            ["Salvar o DataFrame como tabela gerenciada com saveAsTable e remove-la ao final, ja que SQL so enxerga objetos persistidos no metastore.", false],
            ["Registrar o DataFrame com createOrReplaceTempView e entao consulta-lo por nome via spark.sql.", true],
            ["Converter o DataFrame para Pandas com toPandas e executar as consultas SQL diretamente sobre o objeto Pandas resultante da conversao.", false],
            ["Exportar o DataFrame para um arquivo temporario Parquet e recarrega-lo com spark.read antes de executar qualquer consulta em SQL.", false],
        ],
    },
    {
        statement: "Ao final de um pipeline, um DataFrame com 200 particoes precisa ser reduzido para poucos arquivos de saida, evitando ao maximo o custo de embaralhar os dados pela rede. Qual operacao e a mais indicada?",
        explanation: "coalesce reduz particoes sem shuffle completo; repartition faz shuffle completo (e pode aumentar ou reduzir), sendo mais custoso quando o objetivo e so diminuir a quantidade de arquivos.",
        topic: "PySpark - repartition x coalesce",
        options: [
            ["repartition(4), que reduz o numero de particoes sem nunca provocar shuffle, por sempre apenas mesclar as particoes vizinhas.", false],
            ["coalesce(4), que diminui o numero de particoes evitando um shuffle completo.", true],
            ["repartition('coluna'), que garante o menor numero possivel de arquivos ao reparticionar pelos valores distintos da coluna escolhida.", false],
            ["cache() seguido de count(), que consolida as particoes em memoria e grava tudo em um unico arquivo na acao seguinte do pipeline.", false],
        ],
    },
    {
        statement: "Ao ler um CSV com spark.read, uma equipe percebe que as colunas vieram nomeadas como _c0, _c1 e todas como string, apesar de o arquivo ter cabecalho e valores numericos. Quais opcoes corrigem isso?",
        explanation: "header=true usa a primeira linha como nome das colunas e inferSchema=true faz o Spark deduzir os tipos (com uma passada extra pelos dados); sem elas, as colunas viram _c0, _c1 e ficam como string.",
        topic: "PySpark - leitura de CSV",
        options: [
            ["Usar as opcoes mode como PERMISSIVE e badRecordsPath, que interpretam o cabecalho e ajustam os tipos numericos das colunas.", false],
            ["Aplicar a opcao multiLine como true, que faz o leitor reconhecer a primeira linha como cabecalho e inferir os tipos automaticamente.", false],
            ["Trocar o format para 'text' e depois dividir as colunas na mao, pois o leitor de CSV nao suporta cabecalho nem tipos numericos.", false],
            ["Definir as opcoes header como true e inferSchema como true na leitura do CSV.", true],
        ],
    },
    {
        statement: "Uma consulta de Structured Streaming faz uma agregacao de contagem por categoria e precisa manter o resultado completo atualizado a cada micro-lote no destino. Qual output mode atende a esse caso?",
        explanation: "O modo complete reescreve todo o resultado a cada micro-lote, adequado para agregacoes; append serve para linhas novas que nao mudam e update grava apenas as linhas alteradas. Nao existe output mode overwrite em streaming.",
        topic: "Structured Streaming - output modes",
        options: [
            ["O modo append, que e o padrao e reescreve todas as linhas do resultado agregado a cada gatilho de processamento do stream.", false],
            ["O modo complete, que reescreve todo o resultado da agregacao a cada micro-lote.", true],
            ["O modo update com trigger('once'), unica forma de manter agregacoes sem exigir a definicao de uma coluna de watermark no stream.", false],
            ["O modo overwrite, que trunca a tabela de destino e regrava o resultado inteiro da agregacao em cada execucao do stream.", false],
        ],
    },
    {
        statement: "Uma equipe quer que um pipeline declarativo do Lakeflow processe os dados que ja chegaram e depois desligue a computacao, para reduzir custo, em vez de manter os clusters ligados o tempo todo. Qual modo de execucao escolher?",
        explanation: "No modo triggered o pipeline processa os dados disponiveis e desliga a computacao, sendo mais economico; o modo continuous mantem tudo rodando para baixa latencia.",
        topic: "Lakeflow Declarative Pipelines - triggered x continuous",
        options: [
            ["O modo continuous, pois ele processa o lote disponivel e encerra os recursos ate a proxima janela agendada pela equipe.", false],
            ["O modo development, que alem de reduzir a latencia mantem o cluster sempre ativo para reprocessar os dados a cada alteracao de codigo.", false],
            ["O modo continuous com trigger AvailableNow, combinacao que garante o desligamento automatico dos clusters apos cada atualizacao do pipeline.", false],
            ["O modo triggered, que processa os dados disponiveis e entao encerra a computacao do pipeline.", true],
        ],
    },
    {
        statement: "Depois de corrigir uma regra de transformacao, uma engenheira precisa reprocessar todos os dados historicos de uma tabela do pipeline, e nao apenas os registros novos. Qual acao faz isso?",
        explanation: "O full refresh limpa e recalcula as tabelas a partir da origem, aplicando as novas regras a todo o historico; a atualizacao normal so processa dados novos de forma incremental.",
        topic: "Lakeflow Declarative Pipelines - full refresh",
        options: [
            ["Executar uma atualizacao com full refresh, que limpa as tabelas e as recalcula a partir da origem.", true],
            ["Executar uma atualizacao normal, que ao detectar a mudanca de codigo ja reprocessa todo o historico das tabelas afetadas automaticamente.", false],
            ["Rodar OPTIMIZE nas tabelas do pipeline, o que reescreve os arquivos aplicando as novas regras de transformacao a todo o historico.", false],
            ["Alterar o pipeline para o modo continuous, que refaz o calculo de todas as tabelas desde a origem a cada micro-lote processado.", false],
        ],
    },
    {
        statement: "Em um pipeline declarativo do Lakeflow com uma tabela bronze, uma silver que le da bronze e uma gold que le da silver, a equipe quer saber como definir a ordem de execucao entre essas tabelas. O que e correto?",
        explanation: "O Lakeflow Declarative Pipelines resolve o DAG automaticamente a partir das referencias entre os datasets, executando bronze, silver e gold na ordem correta sem configuracao manual de dependencias.",
        topic: "Declarative Pipelines - dependencias entre datasets",
        options: [
            ["E preciso numerar cada dataset e informar essa ordem em uma configuracao a parte, senao o pipeline executa as tabelas em ordem aleatoria.", false],
            ["A ordem precisa ser controlada por um Lakeflow Job externo, com uma task separada e dependencias explicitas para cada uma das tres tabelas.", false],
            ["O pipeline monta o grafo de dependencias automaticamente a partir das referencias entre os datasets.", true],
            ["Cada tabela deve ficar em um pipeline separado e encadeada por gatilhos de Table update, ja que um pipeline so executa um dataset por vez.", false],
        ],
    },
    {
        statement: "Uma organizacao com varios workspaces na mesma regiao quer um conteiner de metadados no topo do Unity Catalog, sob o qual ficam os catalogos, schemas e tabelas. Que componente e esse e como costuma ser provisionado?",
        explanation: "O metastore e o conteiner de mais alto nivel do Unity Catalog (normalmente um por regiao) e e atribuido aos workspaces daquela regiao pelo admin da conta; abaixo dele vem catalogos, schemas e tabelas.",
        topic: "Unity Catalog - metastore",
        options: [
            ["O catalogo, que e o objeto de nivel mais alto do Unity Catalog e existe obrigatoriamente um por workspace, criado pelo admin do workspace.", false],
            ["O metastore, conteiner de topo do Unity Catalog, em geral um por regiao e associado aos workspaces daquela regiao.", true],
            ["O schema, conteiner de topo que agrupa os catalogos e e criado automaticamente junto com o primeiro workspace da conta na regiao.", false],
            ["O external location, objeto de nivel mais alto que reune os catalogos e as credenciais de acesso ao armazenamento em nuvem da conta.", false],
        ],
    },
    {
        statement: "Para governar o acesso a uma pasta especifica de object storage onde ficam tabelas externas, um admin precisa combinar a autenticacao na nuvem com o caminho de armazenamento dentro do Unity Catalog. Quais objetos ele usa?",
        explanation: "A storage credential encapsula a autenticacao na nuvem (por exemplo uma role IAM) e a external location combina essa credencial com um caminho de armazenamento, permitindo ao Unity Catalog governar o acesso aquele local.",
        topic: "Unity Catalog - external location",
        options: [
            ["Uma storage credential para a autenticacao na nuvem e uma external location que associa essa credencial a um caminho.", true],
            ["Apenas um volume gerenciado, que ja embute as credenciais de nuvem e o caminho, dispensando qualquer objeto adicional de autenticacao.", false],
            ["Somente uma service principal com permissao de leitura no bucket, pois o Unity Catalog acessa qualquer caminho de nuvem direto por ela.", false],
            ["Um catalogo externo apontando para o bucket, que gera de forma transparente as credenciais e o mapeamento de caminho necessarios ao acesso.", false],
        ],
    },
    {
        statement: "Uma equipe precisa governar, dentro do Unity Catalog, o acesso a arquivos nao tabulares, como PDFs e imagens, organizados por catalogo e schema. Qual objeto atende a isso e qual a diferenca entre os dois tipos?",
        explanation: "Volumes governam dados nao tabulares (arquivos) dentro do namespace do Unity Catalog; o volume gerenciado usa armazenamento gerido pelo proprio Unity Catalog e o volume externo aponta para um caminho de uma external location.",
        topic: "Unity Catalog - volumes (managed x external)",
        options: [
            ["Uma tabela externa, pois volumes servem apenas para dados tabulares e nao conseguem enderecar arquivos binarios como PDFs, imagens ou documentos.", false],
            ["Uma storage credential por arquivo, criada individualmente para cada PDF ou imagem que a equipe precisar disponibilizar aos usuarios.", false],
            ["Um schema do tipo binario, que e um conteiner especial de arquivos nao tabulares provisionado a parte dos schemas comuns de tabelas.", false],
            ["Um volume: o gerenciado usa armazenamento do Unity Catalog e o externo referencia um caminho de external location.", true],
        ],
    },
    {
        statement: "A area de FinOps quer analisar, com consultas SQL, o consumo de computacao e os eventos de auditoria de acesso de toda a conta Databricks, usando dados ja disponibilizados pela plataforma. Onde esses dados ficam?",
        explanation: "As system tables, no catalogo system, expoem dados operacionais da conta como faturamento (system.billing.usage) e auditoria (system.access.audit), prontos para analise em SQL.",
        topic: "Unity Catalog - system tables",
        options: [
            ["No event log de cada pipeline declarativo, que centraliza o consumo de todos os workspaces e os registros de auditoria de acesso da conta.", false],
            ["Nas system tables (catalogo system), como system.billing.usage e system.access.audit, consultaveis por SQL.", true],
            ["No INFORMATION_SCHEMA de cada catalogo, que alem dos metadados de objetos guarda o historico de faturamento e de acessos da conta inteira.", false],
            ["Nos logs do driver de cada cluster, que precisam ser exportados e unificados na mao para reconstruir o consumo e a auditoria da conta.", false],
        ],
    },
    {
        statement: "Uma tabela foi criada por uma engenheira que saiu da equipe, e agora ninguem consegue conceder novos privilegios nem alterar o objeto. Qual conceito do Unity Catalog explica isso e como resolver?",
        explanation: "No Unity Catalog o owner de um securavel pode conceder privilegios e executar operacoes como ALTER e DROP; por isso recomenda-se atribuir a ownership a um grupo, e a correcao aqui e transferir a propriedade para um grupo ativo.",
        topic: "Unity Catalog - owner (ownership)",
        options: [
            ["Cada securavel tem um owner, que pode gerenciar privilegios e alterar o objeto; a solucao e transferir a ownership para um grupo ativo.", true],
            ["O problema e a heranca de privilegios do catalogo, que precisa ser recriada do zero sempre que o usuario criador de uma tabela deixa a conta.", false],
            ["Toda tabela pertence automaticamente ao metastore admin, entao basta pedir a ele um GRANT de SELECT para que qualquer um volte a administrar.", false],
            ["Sem o usuario criador, a tabela fica permanentemente bloqueada e a unica saida e recria-la com CREATE OR REPLACE a partir de um backup dos dados.", false],
        ],
    },
    {
        statement: "A mesma logica de um notebook precisa rodar para regioes diferentes, recebendo o nome da regiao como parametro na hora em que um Lakeflow Job o executa, sem editar o codigo. Qual recurso permite isso?",
        explanation: "Os widgets (dbutils.widgets) criam parametros de entrada do notebook, que podem ser preenchidos por um Lakeflow Job na execucao, permitindo reaproveitar o mesmo codigo com valores diferentes.",
        topic: "dbutils.widgets",
        options: [
            ["O comando %run, que importa outro notebook e por isso injeta nele os valores de parametros definidos no job que disparou a execucao.", false],
            ["A funcao spark.conf.get sobre uma chave fixa, unica forma de um notebook receber valores externos passados por um job agendado.", false],
            ["O dbutils.secrets.get, que recupera valores de parametros gerais do job a partir de um escopo de segredos configurado para o workspace.", false],
            ["Os widgets (dbutils.widgets), que criam parametros lidos no notebook e podem receber valores do job.", true],
        ],
    },
    {
        statement: "Um time de BI reclama que os paineis do Databricks SQL demoram para responder apos periodos ociosos, por causa do tempo de inicializacao da computacao. Qual tipo de SQL warehouse minimiza esse tempo de partida?",
        explanation: "O SQL warehouse serverless usa computacao gerenciada pela Databricks e inicia quase instantaneamente, reduzindo a latencia apos periodos ociosos; classic e pro tem partida mais lenta.",
        topic: "Databricks SQL - SQL Warehouse",
        options: [
            ["O SQL warehouse classic, que por rodar no plano de computacao do cliente inicia praticamente na hora e e o mais rapido para sair da ociosidade.", false],
            ["Um cluster all-purpose anexado ao painel, que mantem a computacao sempre quente e por isso elimina qualquer tempo de inicializacao das consultas.", false],
            ["O SQL warehouse serverless, que inicia quase instantaneamente por usar computacao gerenciada pela Databricks.", true],
            ["O SQL warehouse pro com autoscaling no minimo em zero, configuracao que desliga a computacao sem impor tempo de partida nas proximas consultas.", false],
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
                name: "Databricks Certified Data Engineer Associate",
                provider: "databricks",
                code: "Databricks DE Associate",
                level: "Associate",
                description: "Simulado no formato do exame Databricks Certified Data Engineer Associate: 90 minutos, 45 questoes por tentativa, corte de 70%. Cobre a Data Intelligence Platform, ingestao (Lakeflow Connect, Auto Loader), transformacao (Lakeflow Spark Declarative Pipelines), Lakeflow Jobs, CI/CD, otimizacao e governanca com Unity Catalog. Nomenclatura Lakeflow atual.",
                durationMinutes: 90,
                questionCount: 45,
                passPercent: 70,
                published: true,
            })
            .returning();
        console.log(`Simulado criado: ${simulado.slug}`);
    }
    await db
        .update(simulados)
        .set({ provider: "databricks", code: "Databricks DE Associate", level: "Associate" })
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
        console.log(`Simulado ja tem ${n} questoes, nada a fazer.`);
        return;
    }

    for (let i = 0; i < QUESTOES.length; i++) {
        const q = QUESTOES[i];
        if (jaExistem.has(q.statement)) continue;
        const [questao] = await db
            .insert(simuladoQuestions)
            .values({ simuladoId: simulado.id, statement: q.statement, explanation: q.explanation, topic: q.topic })
            .returning();
        await db.insert(simuladoOptions).values(
            q.options.map(([text, isCorrect], idx) => ({ questionId: questao.id, text, isCorrect, position: idx + 1 })),
        );
    }
    console.log(`Seed: ${inseridas} questoes novas inseridas (${QUESTOES.length} no banco).`);
}

seed().then(() => process.exit(0)).catch((e) => { console.error("Falha no seed:", e); process.exit(1); });
