// Banco de questões do simulado Microsoft Azure Data Fundamentals (DP-900).
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
            "Um sistema financeiro armazena registros de clientes com colunas fixas como CPF, nome e saldo, todos seguindo um esquema bem definido. Que tipo de dado é esse?",
        explanation:
            "Dados estruturados seguem um esquema rígido de linhas e colunas e são típicos de bancos de dados relacionais. Dados semiestruturados e não estruturados não exigem esse formato tabular fixo.",
        topic: "Conceitos de dados",
        options: [
            ["Dados estruturados (tabelas)", true],
            ["Dados semiestruturados", false],
            ["Dados não estruturados", false],
            ["Dados binários sem esquema", false],
        ],
    },
    {
        statement:
            "Uma empresa de mídia precisa armazenar vídeos, imagens e arquivos de áudio que não se encaixam em linhas e colunas. Como esses dados são classificados?",
        explanation:
            "Vídeos, imagens e áudio são dados não estruturados, pois não possuem um modelo de dados predefinido. Costumam ser guardados em armazenamento de blobs ou em data lakes.",
        topic: "Conceitos de dados",
        options: [
            ["Dados não estruturados", true],
            ["Dados estruturados fixos", false],
            ["Dados relacionais", false],
            ["Dados normalizados", false],
        ],
    },
    {
        statement:
            "Um desenvolvedor recebe documentos JSON em que cada registro pode ter campos diferentes, com pares de chave e valor e aninhamento. Que categoria descreve melhor esses documentos?",
        explanation:
            "O JSON tem organização por chaves e hierarquia, mas não exige um esquema tabular fixo, o que caracteriza dados semiestruturados. Não são estruturados (sem tabela rígida) nem totalmente não estruturados (existe alguma estrutura).",
        topic: "Conceitos de dados",
        options: [
            ["Dados semiestruturados", true],
            ["Dados estruturados", false],
            ["Dados não estruturados", false],
            ["Dados colunares", false],
        ],
    },
    {
        statement: "Quais características descrevem dados estruturados? (Selecione DUAS opções.)",
        explanation:
            "Dados estruturados possuem esquema fixo e se organizam em linhas e colunas, sendo típicos de bancos relacionais. Imagens e vídeos são dados não estruturados, e a ausência total de esquema não descreve dados estruturados.",
        topic: "Conceitos de dados",
        options: [
            ["Seguem um esquema predefinido e fixo", true],
            ["Organizam-se em linhas e colunas", true],
            ["São representados por imagens e vídeos", false],
            ["Não possuem nenhum tipo de esquema", false],
            ["São sempre gerados por sensores de IoT", false],
        ],
    },
    {
        statement:
            "Uma solução precisa guardar grandes volumes de arquivos não estruturados, como fotos e documentos digitalizados, com baixo custo. Qual opção de armazenamento é mais adequada?",
        explanation:
            "O armazenamento de blobs (object storage) foi feito para dados não estruturados em larga escala e baixo custo. Um banco relacional é otimizado para dados tabulares estruturados, não para arquivos binários.",
        topic: "Conceitos de dados",
        options: [
            ["Armazenamento de blobs (object storage)", true],
            ["Banco de dados relacional normalizado", false],
            ["Tabela de um data warehouse", false],
            ["Índice de chave primária", false],
        ],
    },
    {
        statement:
            "Um analista exporta uma tabela para um arquivo de texto em que cada linha é um registro e os campos são separados por vírgula. Qual formato de arquivo é esse?",
        explanation:
            "O CSV é um formato de texto delimitado e orientado a linhas, em que os valores são separados por vírgula. É simples e legível, mas não guarda tipos nem compactação como os formatos colunares.",
        topic: "Conceitos de dados",
        options: [
            ["CSV", true],
            ["Parquet", false],
            ["Avro", false],
            ["ORC", false],
        ],
    },
    {
        statement:
            "Uma equipe de análise consulta poucas colunas de tabelas com bilhões de linhas e quer leitura rápida e boa compressão. Qual formato de arquivo é o mais indicado?",
        explanation:
            "O Parquet armazena os dados por coluna, o que reduz a leitura e melhora a compressão em cargas analíticas que acessam poucas colunas. Formatos de texto como CSV e JSON leem a linha inteira e comprimem pior.",
        topic: "Conceitos de dados",
        options: [
            ["Parquet", true],
            ["CSV", false],
            ["JSON", false],
            ["XML", false],
        ],
    },
    {
        statement:
            "Um pipeline de streaming grava eventos continuamente e precisa recuperar registros completos com o esquema embutido no próprio arquivo. Qual formato é mais apropriado?",
        explanation:
            "O Avro é orientado a linhas e guarda o esquema junto dos dados, o que favorece escrita intensa e streaming, além da recuperação de registros inteiros. Parquet e ORC são colunares, melhores para leitura analítica do que para escrita contínua.",
        topic: "Conceitos de dados",
        options: [
            ["Avro", true],
            ["Parquet", false],
            ["ORC", false],
            ["CSV", false],
        ],
    },
    {
        statement:
            "Quais formatos de arquivo são colunares e otimizados para cargas analíticas com boa compressão? (Selecione DUAS opções.)",
        explanation:
            "Parquet e ORC armazenam dados por coluna, o que melhora a compressão e a leitura analítica. CSV e JSON são formatos de texto orientados a linha, sem esse ganho.",
        topic: "Conceitos de dados",
        options: [
            ["Parquet", true],
            ["ORC", true],
            ["CSV", false],
            ["JSON", false],
            ["TXT", false],
        ],
    },
    {
        statement:
            "Qual formato de arquivo representa dados de forma hierárquica usando pares de chave e valor e é amplamente usado em APIs web?",
        explanation:
            "O JSON organiza dados em uma estrutura hierárquica de chaves e valores, muito usada em APIs. Parquet e ORC são formatos colunares binários, não voltados a esse tipo de troca de mensagens.",
        topic: "Conceitos de dados",
        options: [
            ["JSON", true],
            ["Parquet", false],
            ["ORC", false],
            ["Avro", false],
        ],
    },
    {
        statement:
            "Um data warehouse baseado em Hive precisa de um formato colunar com alta compressão e leitura otimizada para consultas analíticas. Qual formato atende bem a esse cenário?",
        explanation:
            "O ORC (Optimized Row Columnar) é um formato colunar com forte compressão, otimizado para leituras analíticas e muito usado no ecossistema Hive. O CSV é um formato de texto por linha, sem essas otimizações.",
        topic: "Conceitos de dados",
        options: [
            ["ORC", true],
            ["CSV", false],
            ["JSON", false],
            ["XML", false],
        ],
    },
    {
        statement:
            "Um sistema legado troca mensagens em um formato de texto hierárquico que usa marcações (tags) de abertura e fechamento para delimitar os elementos. Qual formato é esse?",
        explanation:
            "O XML usa tags de abertura e fechamento para estruturar dados de forma hierárquica, sendo comum em sistemas legados e integrações. É semiestruturado, assim como o JSON, mas mais verboso.",
        topic: "Conceitos de dados",
        options: [
            ["XML", true],
            ["CSV", false],
            ["Parquet", false],
            ["ORC", false],
        ],
    },
    {
        statement:
            "Quais formatos representam dados semiestruturados de forma hierárquica baseada em texto? (Selecione DUAS opções.)",
        explanation:
            "JSON e XML são formatos de texto hierárquicos e representam dados semiestruturados. Parquet e ORC são formatos colunares binários voltados a análise, e não a essa representação hierárquica em texto.",
        topic: "Conceitos de dados",
        options: [
            ["JSON", true],
            ["XML", true],
            ["Parquet", false],
            ["ORC", false],
            ["Avro", false],
        ],
    },
    {
        statement:
            "Uma aplicação precisa armazenar catálogos de produtos em que cada item tem atributos muito variáveis, sem esquema fixo, e exige escala horizontal. Qual tipo de banco atende melhor?",
        explanation:
            "Bancos não relacionais (NoSQL), como os de documentos, lidam bem com esquemas flexíveis e escala horizontal. Um banco relacional exigiria um esquema fixo, menos adequado para atributos muito variáveis.",
        topic: "Conceitos de dados",
        options: [
            ["Banco de dados não relacional (NoSQL)", true],
            ["Banco de dados relacional com esquema fixo", false],
            ["Data warehouse relacional", false],
            ["Sistema de arquivos CSV", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa de integridade referencial, junções entre tabelas e controle de concorrência para dados transacionais. Deve escolher arquivos simples ou um banco de dados?",
        explanation:
            "Bancos de dados oferecem esquema, integridade referencial, junções e controle de concorrência, recursos que arquivos simples não fornecem. Arquivos avulsos servem melhor para armazenamento bruto e troca de dados.",
        topic: "Conceitos de dados",
        options: [
            ["Um banco de dados relacional", true],
            ["Arquivos CSV em uma pasta", false],
            ["Arquivos de texto não estruturados", false],
            ["Um único arquivo JSON", false],
        ],
    },
    {
        statement:
            "Um sistema de caixa de supermercado registra muitas transações pequenas de inserção e atualização, com dados sempre atuais e alta concorrência. Que tipo de carga de trabalho é essa?",
        explanation:
            "O OLTP (processamento de transações online) lida com muitas transações curtas sobre dados operacionais atuais, priorizando concorrência e integridade. O OLAP é voltado a análises e agregações sobre dados históricos.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["OLTP (processamento de transações online)", true],
            ["OLAP (processamento analítico online)", false],
            ["Processamento em lote noturno agendado", false],
            ["Data warehouse desnormalizado", false],
        ],
    },
    {
        statement: "Por que os bancos de dados OLTP costumam usar um modelo normalizado?",
        explanation:
            "A normalização reduz a redundância e mantém a integridade dos dados nas muitas operações de escrita típicas do OLTP. Já o OLAP costuma desnormalizar para acelerar consultas de leitura.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Para reduzir a redundância e manter a integridade em muitas escritas", true],
            [
                "Para acelerar agregações analíticas sobre grandes volumes de dados históricos",
                false,
            ],
            ["Para permitir consultas em esquema estrela", false],
            ["Para eliminar a necessidade de chaves primárias", false],
        ],
    },
    {
        statement:
            "Uma equipe de BI executa consultas complexas com agregações sobre anos de dados históricos para gerar relatórios. Que tipo de carga de trabalho descreve isso?",
        explanation:
            "O OLAP (processamento analítico online) foca em consultas complexas e agregações sobre grandes volumes de dados históricos. O OLTP é otimizado para transações operacionais curtas e atuais.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["OLAP (processamento analítico online)", true],
            ["OLTP (processamento de transações online)", false],
            ["Processamento de fluxo em tempo real", false],
            ["Transação ACID de escrita única", false],
        ],
    },
    {
        statement:
            "Quais características são típicas de uma carga de trabalho analítica (OLAP)? (Selecione DUAS opções.)",
        explanation:
            "Cargas OLAP trabalham com dados históricos e usam modelos desnormalizados, como o esquema estrela, para acelerar agregações. Muitas transações curtas de escrita e a normalização em 3FN são típicas do OLTP.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Consultas de agregação sobre dados históricos", true],
            ["Modelo de dados desnormalizado", true],
            ["Muitas transações curtas de escrita", false],
            ["Modelo altamente normalizado para reduzir redundância", false],
            ["Bloqueios de linha frequentes em cada escrita", false],
        ],
    },
    {
        statement:
            "Em um data warehouse, uma tabela de fatos central se conecta a várias tabelas de dimensão, formando um modelo desnormalizado voltado a análises. Como esse modelo é chamado?",
        explanation:
            "O esquema estrela (star schema) tem uma tabela de fatos ligada a tabelas de dimensão e é típico de cargas OLAP, favorecendo agregações rápidas. Modelos totalmente normalizados são mais comuns em OLTP.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Esquema estrela (star schema)", true],
            ["Modelo totalmente normalizado em 3FN", false],
            ["Modelo de documentos aninhados", false],
            ["Armazenamento de blobs", false],
        ],
    },
    {
        statement:
            "Em uma transferência bancária, o débito em uma conta e o crédito em outra devem acontecer por completo ou não acontecer de forma alguma. Qual propriedade ACID garante isso?",
        explanation:
            "A atomicidade garante que a transação seja tratada como uma unidade indivisível: ou tudo é confirmado, ou nada é aplicado. A durabilidade trata da persistência após a confirmação, não do tudo ou nada.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Atomicidade", true],
            ["Durabilidade", false],
            ["Isolamento", false],
            ["Consistência", false],
        ],
    },
    {
        statement:
            "Após uma transação ser confirmada (commit), seus efeitos devem sobreviver mesmo a uma queda de energia do servidor. Qual propriedade ACID descreve essa garantia?",
        explanation:
            "A durabilidade assegura que os dados de uma transação confirmada persistem mesmo diante de falhas do sistema. O isolamento trata da interferência entre transações concorrentes, não da persistência.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Durabilidade", true],
            ["Isolamento", false],
            ["Atomicidade", false],
            ["Consistência", false],
        ],
    },
    {
        statement:
            "Duas transações simultâneas atualizam os mesmos dados, e cada uma deve executar como se estivesse sozinha, sem enxergar alterações parciais da outra. Qual propriedade ACID garante isso?",
        explanation:
            "O isolamento garante que transações concorrentes não interfiram umas nas outras, evitando que uma veja o estado intermediário da outra. A consistência cuida de manter válidas as regras e restrições do banco.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Isolamento", true],
            ["Atomicidade", false],
            ["Durabilidade", false],
            ["Consistência", false],
        ],
    },
    {
        statement:
            "Uma empresa processa toda a folha de pagamento uma vez por mês, reunindo grandes volumes de dados e executando o trabalho em horário agendado. Que tipo de processamento é esse?",
        explanation:
            "O processamento em lote (batch) reúne grandes volumes de dados e os processa em intervalos agendados, com foco em vazão, não em baixa latência. O processamento em fluxo (streaming) trata os dados continuamente à medida que chegam.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Processamento em lote (batch)", true],
            ["Processamento em fluxo (streaming)", false],
            ["Processamento transacional OLTP", false],
            ["Processamento interativo em tempo real", false],
        ],
    },
    {
        statement:
            "Sensores de IoT enviam leituras continuamente e a empresa precisa reagir a cada evento em tempo quase real. Que abordagem de processamento é a mais adequada?",
        explanation:
            "O processamento em fluxo (streaming) trata os dados de forma contínua, com baixa latência, à medida que os eventos chegam. O processamento em lote acumularia os dados para tratá-los mais tarde, o que não atende ao tempo quase real.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Processamento em fluxo (streaming)", true],
            ["Processamento em lote (batch) diário", false],
            ["Relatório mensal agendado", false],
            ["Carga OLAP em data warehouse", false],
        ],
    },
    {
        statement:
            "Um profissional é responsável por backups, segurança, controle de acesso e ajuste de desempenho de um banco de dados. Qual função ele exerce?",
        explanation:
            "O administrador de banco de dados (DBA) cuida de backup, segurança, controle de acesso e desempenho do banco. O engenheiro de dados foca em pipelines de ingestão e transformação, e o analista, em relatórios e insights.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Administrador de banco de dados (DBA)", true],
            ["Engenheiro de dados e de pipelines de ingestão", false],
            ["Analista de dados", false],
            ["Cientista de dados", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa construir pipelines para ingerir, limpar e transformar dados de várias fontes antes de disponibilizá-los para análise. Qual função é responsável por isso?",
        explanation:
            "O engenheiro de dados projeta e mantém pipelines de ingestão e transformação (ETL/ELT) que preparam os dados para consumo. O analista de dados usa esses dados prontos para criar relatórios, e o DBA administra o banco em si.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Engenheiro de dados", true],
            ["Analista de dados", false],
            ["Administrador de banco de dados (DBA)", false],
            ["Gerente de projetos", false],
        ],
    },
    {
        statement:
            "Um profissional cria painéis e relatórios visuais no Power BI para ajudar a área de negócio a tomar decisões. Qual função ele exerce?",
        explanation:
            "O analista de dados explora os dados e cria visualizações e relatórios, sendo o Power BI uma ferramenta típica dessa função. O engenheiro de dados prepara os dados, mas normalmente não é quem produz os relatórios de negócio.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Analista de dados", true],
            ["Engenheiro de dados", false],
            ["Administrador de banco de dados (DBA)", false],
            ["Arquiteto de rede", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure é usado principalmente para orquestrar e automatizar pipelines de integração e transformação de dados (ETL/ELT)?",
        explanation:
            "O Azure Data Factory é o serviço de integração de dados usado para criar e orquestrar pipelines de ETL/ELT. O Power BI é voltado à visualização e aos relatórios, não à orquestração de pipelines.",
        topic: "Cargas de trabalho e funções",
        options: [
            ["Azure Data Factory", true],
            ["Power BI", false],
            ["Azure Blob Storage", false],
            ["Microsoft Excel", false],
        ],
    },
    {
        statement:
            "Em um banco de dados relacional você modela a entidade Produto. Onde ficam armazenados os dados de um produto individual, como um teclado específico?",
        explanation:
            "Cada linha (registro) de uma tabela representa uma instância única da entidade, enquanto as colunas guardam os atributos e a tabela como um todo representa a entidade.",
        topic: "Dados relacionais",
        options: [
            ["Em uma linha da tabela Produto", true],
            ["Em uma coluna da tabela Produto", false],
            ["No nome da tabela", false],
            ["Em um índice da tabela", false],
        ],
    },
    {
        statement:
            "Qual característica descreve corretamente uma chave primária em uma tabela relacional?",
        explanation:
            "A chave primária identifica cada linha de forma única e não pode conter valores nulos nem duplicados.",
        topic: "Dados relacionais",
        options: [
            ["Identifica cada linha de forma única e não aceita valores nulos", true],
            ["Pode conter valores duplicados desde que nenhum deles seja nulo", false],
            ["Serve apenas para ligar a tabela a outra e pode ser nula", false],
            ["Deve obrigatoriamente ser uma coluna de texto", false],
        ],
    },
    {
        statement:
            "A tabela Pedidos possui uma coluna ClienteId que aponta para a chave primária da tabela Clientes. Que tipo de chave é ClienteId dentro de Pedidos?",
        explanation:
            "A chave estrangeira referencia a chave primária de outra tabela, estabelecendo o relacionamento e permitindo impor a integridade referencial.",
        topic: "Dados relacionais",
        options: [
            ["Chave estrangeira", true],
            ["Chave primária", false],
            ["Chave candidata", false],
            ["Índice agrupado", false],
        ],
    },
    {
        statement:
            "Na terminologia relacional, como é chamado o elemento que define um atributo, como Email ou DataNascimento, com um tipo de dado associado?",
        explanation:
            "A coluna representa um atributo da entidade e possui um tipo de dado que restringe os valores aceitos naquela posição.",
        topic: "Dados relacionais",
        options: [
            ["Coluna", true],
            ["Linha", false],
            ["Registro", false],
            ["Chave estrangeira", false],
        ],
    },
    {
        statement:
            "Um cliente pode ter vários pedidos, mas cada pedido pertence a um único cliente. Que tipo de relacionamento descreve essa situação?",
        explanation:
            "Um para muitos é o relacionamento em que uma linha de uma tabela se associa a várias linhas de outra, sem que o inverso ocorra.",
        topic: "Dados relacionais",
        options: [
            ["Um para muitos", true],
            ["Um para um", false],
            ["Muitos para muitos", false],
            ["Sem relacionamento entre as tabelas", false],
        ],
    },
    {
        statement:
            "Em uma escola, um aluno pode se matricular em vários cursos e cada curso tem vários alunos. Como esse relacionamento muitos para muitos costuma ser implementado no modelo relacional?",
        explanation:
            "Um relacionamento muitos para muitos é resolvido com uma tabela de ligação (junção) que armazena as chaves estrangeiras das duas tabelas.",
        topic: "Dados relacionais",
        options: [
            ["Com uma tabela de ligação que guarda as chaves estrangeiras das duas tabelas", true],
            ["Colocando uma única chave estrangeira direta em apenas uma das duas tabelas", false],
            ["Duplicando as linhas em ambas as tabelas", false],
            ["Removendo a chave primária de uma das tabelas", false],
        ],
    },
    {
        statement: "O que a integridade referencial garante em um banco de dados relacional?",
        explanation:
            "A integridade referencial impede que uma chave estrangeira aponte para um valor que não existe na tabela referenciada, mantendo os relacionamentos consistentes.",
        topic: "Dados relacionais",
        options: [
            ["Que uma chave estrangeira só aponte para valores existentes na outra tabela", true],
            ["Que todas as colunas tenham apenas valores atômicos", false],
            ["Que a tabela esteja obrigatoriamente normalizada até a terceira forma normal", false],
            ["Que os índices sejam recriados a cada consulta", false],
        ],
    },
    {
        statement:
            "Uma tabela possui uma coluna Telefones que guarda vários números separados por vírgula na mesma célula. Qual forma normal está sendo violada?",
        explanation:
            "A primeira forma normal (1FN) exige que cada coluna contenha apenas valores atômicos, ou seja, um único valor indivisível por célula.",
        topic: "Dados relacionais",
        options: [
            ["Primeira forma normal (1FN)", true],
            ["Segunda forma normal (2FN)", false],
            ["Terceira forma normal (3FN)", false],
            ["Forma normal de Boyce-Codd", false],
        ],
    },
    {
        statement:
            "Uma tabela usa a chave primária composta (PedidoId, ProdutoId). A coluna NomeProduto depende apenas de ProdutoId, e não da chave composta inteira. Qual forma normal essa situação viola?",
        explanation:
            "A segunda forma normal (2FN) exige que todo atributo não chave dependa da chave primária inteira; depender de apenas parte de uma chave composta é uma dependência parcial que viola a 2FN.",
        topic: "Dados relacionais",
        options: [
            ["Segunda forma normal (2FN), por dependência parcial", true],
            ["Primeira forma normal (1FN), por falta de atomicidade", false],
            ["Terceira forma normal (3FN), por dependência transitiva", false],
            ["Nenhuma forma normal é violada", false],
        ],
    },
    {
        statement:
            "Em uma tabela de Funcionários, a coluna NomeDepartamento depende de DepartamentoId, que por sua vez depende da chave primária FuncionarioId. Que problema de normalização isso indica?",
        explanation:
            "Uma dependência transitiva, em que um atributo não chave depende de outro atributo não chave, viola a terceira forma normal (3FN).",
        topic: "Dados relacionais",
        options: [
            ["Dependência transitiva, que viola a 3FN", true],
            ["Dependência parcial, que viola a 2FN", false],
            ["Falta de atomicidade, que viola a 1FN", false],
            ["Ausência de chave primária na tabela", false],
        ],
    },
    {
        statement:
            "Quais problemas a normalização de um banco de dados relacional ajuda a reduzir? (Selecione DUAS opções.)",
        explanation:
            "A normalização diminui a redundância de dados repetidos e as anomalias de inserção, atualização e exclusão que surgem quando a mesma informação é duplicada em vários lugares.",
        topic: "Dados relacionais",
        options: [
            ["Redundância de dados repetidos em várias linhas ou tabelas", true],
            ["Anomalias de atualização causadas por dados duplicados", true],
            ["A necessidade de usar o comando SELECT nas consultas", false],
            ["A existência de chaves primárias nas tabelas", false],
            ["O tempo de resposta das consultas de agregação", false],
        ],
    },
    {
        statement:
            "Uma equipe percebe que um relatório muito acessado exige muitos joins e está lento. De forma deliberada, decide duplicar algumas colunas em uma tabela para reduzir esses joins. Como se chama essa técnica?",
        explanation:
            "A desnormalização introduz redundância controlada para melhorar o desempenho de leitura, reduzindo a quantidade de joins necessários, ao custo de mais duplicação.",
        topic: "Dados relacionais",
        options: [
            ["Desnormalização", true],
            ["Normalização", false],
            ["Integridade referencial", false],
            ["Particionamento horizontal", false],
        ],
    },
    {
        statement:
            "Um administrador precisa criar uma nova tabela e depois alterar a estrutura de outra tabela existente. A qual categoria de comandos SQL pertencem CREATE e ALTER?",
        explanation:
            "CREATE, ALTER, DROP e TRUNCATE são comandos DDL (Linguagem de Definição de Dados), usados para definir e modificar a estrutura dos objetos do banco.",
        topic: "SQL e objetos de banco",
        options: [
            ["DDL (Linguagem de Definição de Dados)", true],
            ["DML (Linguagem de Manipulação de Dados)", false],
            ["DQL (Linguagem de Consulta de Dados)", false],
            ["DCL (Linguagem de Controle de Dados)", false],
        ],
    },
    {
        statement:
            "Qual comando SQL é usado para modificar os valores de linhas já existentes em uma tabela?",
        explanation:
            "UPDATE é um comando DML que altera os dados de linhas já existentes; INSERT adiciona novas linhas e DELETE remove linhas.",
        topic: "SQL e objetos de banco",
        options: [
            ["UPDATE", true],
            ["CREATE", false],
            ["GRANT", false],
            ["SELECT", false],
        ],
    },
    {
        statement:
            "Um analista quer apenas recuperar dados de uma tabela, sem alterá-los. Qual comando SQL ele deve usar?",
        explanation:
            "SELECT é o comando de consulta (DQL) usado para recuperar dados de uma ou mais tabelas sem modificá-los.",
        topic: "SQL e objetos de banco",
        options: [
            ["SELECT", true],
            ["INSERT", false],
            ["ALTER", false],
            ["REVOKE", false],
        ],
    },
    {
        statement:
            "Quais comandos SQL pertencem à categoria DCL (Linguagem de Controle de Dados), usada para gerenciar permissões de acesso? (Selecione DUAS opções.)",
        explanation:
            "GRANT concede permissões e REVOKE remove permissões; ambos fazem parte da DCL, que controla o acesso aos objetos do banco.",
        topic: "SQL e objetos de banco",
        options: [
            ["GRANT", true],
            ["REVOKE", true],
            ["INSERT", false],
            ["DROP", false],
            ["MERGE", false],
        ],
    },
    {
        statement:
            "Uma equipe quer disponibilizar uma consulta salva que combina colunas de várias tabelas e pode ser consultada como se fosse uma tabela. Qual objeto de banco atende a essa necessidade?",
        explanation:
            "Uma view é uma consulta salva e virtual que apresenta dados de uma ou mais tabelas e pode ser consultada como se fosse uma tabela.",
        topic: "SQL e objetos de banco",
        options: [
            ["View", true],
            ["Índice", false],
            ["Chave primária", false],
            ["Sequência de backup", false],
        ],
    },
    {
        statement:
            "Você precisa encapsular um bloco de comandos SQL reutilizável que aceita parâmetros e pode ser executado sob demanda pela aplicação. Qual objeto de banco você deve usar?",
        explanation:
            "Uma stored procedure (procedimento armazenado) é um bloco de código SQL reutilizável, que pode receber parâmetros e ser executado quando chamado.",
        topic: "SQL e objetos de banco",
        options: [
            ["Stored procedure", true],
            ["View", false],
            ["Índice", false],
            ["Chave estrangeira", false],
        ],
    },
    {
        statement:
            "As consultas em uma tabela grande estão lentas ao filtrar pela coluna Sobrenome. Qual objeto de banco pode acelerar essas buscas?",
        explanation:
            "Um índice melhora o desempenho das buscas ao permitir que o mecanismo localize rapidamente as linhas sem varrer a tabela inteira.",
        topic: "SQL e objetos de banco",
        options: [
            ["Índice", true],
            ["View", false],
            ["Chave estrangeira", false],
            ["Stored procedure", false],
        ],
    },
    {
        statement:
            "Qual objeto de banco de dados é projetado para receber entradas, executar um cálculo e retornar um valor que pode ser usado dentro de uma consulta?",
        explanation:
            "Uma function (função) recebe parâmetros, executa uma lógica e retorna um valor, podendo ser usada diretamente em expressões e consultas SELECT.",
        topic: "SQL e objetos de banco",
        options: [
            ["Function", true],
            ["Índice", false],
            ["Chave primária", false],
            ["Restrição de verificação", false],
        ],
    },
    {
        statement:
            "Uma startup vai desenvolver uma aplicação nova na nuvem e quer um banco relacional totalmente gerenciado, sem administrar o sistema operacional nem aplicar patches. Qual serviço do Azure é o mais indicado?",
        explanation:
            "O Azure SQL Database é uma oferta PaaS totalmente gerenciada, ideal para aplicações novas na nuvem, cuidando de patches, backups e infraestrutura.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Azure SQL Database", true],
            ["SQL Server em uma máquina virtual do Azure", false],
            ["Azure Blob Storage", false],
            ["Azure Cosmos DB", false],
        ],
    },
    {
        statement:
            "Uma empresa quer migrar um banco SQL Server local para a nuvem com o mínimo de alterações, mantendo recursos como SQL Server Agent e quase 100% de compatibilidade. Qual opção do Azure é a mais adequada?",
        explanation:
            "O Azure SQL Managed Instance oferece compatibilidade quase total com o SQL Server local, sendo ideal para cenários de lift-and-shift com pouca ou nenhuma alteração.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Azure SQL Managed Instance", true],
            ["Azure SQL Database (banco único)", false],
            ["Azure Database for PostgreSQL", false],
            ["Azure Table Storage", false],
        ],
    },
    {
        statement:
            "Uma equipe precisa de controle total sobre o sistema operacional e a instância do SQL Server, incluindo a instalação de componentes personalizados no servidor. Qual opção de hospedagem no Azure oferece esse nível de controle?",
        explanation:
            "SQL Server em uma máquina virtual do Azure é uma solução IaaS, na qual você gerencia o sistema operacional e a instância do SQL Server, tendo controle total.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["SQL Server em uma máquina virtual do Azure", true],
            ["Azure SQL Database serverless com pausa", false],
            ["Azure SQL Managed Instance", false],
            ["Azure Database for MySQL", false],
        ],
    },
    {
        statement:
            "Ao escolher o Azure SQL Database (PaaS) em vez de rodar SQL Server em uma VM (IaaS), qual responsabilidade deixa de ser da equipe de TI do cliente?",
        explanation:
            "No modelo PaaS do Azure SQL Database, a Microsoft cuida da aplicação de patches no sistema operacional e no mecanismo de banco, o que continua sendo do cliente no IaaS.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["A aplicação de patches no sistema operacional e no banco", true],
            ["A definição do esquema das tabelas da aplicação", false],
            ["A escrita das consultas SQL usadas pela aplicação no dia a dia", false],
            ["A modelagem dos relacionamentos entre as tabelas", false],
        ],
    },
    {
        statement:
            "Qual opção de implantação do Azure SQL Database escala automaticamente os recursos de computação e pode pausar durante períodos de inatividade, cobrando pelo uso?",
        explanation:
            "A opção serverless do Azure SQL Database escala a computação automaticamente e pode pausar quando o banco fica inativo, sendo cobrada conforme o consumo.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Serverless", true],
            ["Elastic pool", false],
            ["Managed Instance", false],
            ["SQL Server em uma VM do Azure", false],
        ],
    },
    {
        statement:
            "Um provedor SaaS hospeda dezenas de bancos de dados com picos de uso em horários diferentes e quer compartilhar um conjunto de recursos entre eles para otimizar custos. Qual opção do Azure SQL Database atende a isso?",
        explanation:
            "O elastic pool permite que vários bancos de dados compartilhem um mesmo conjunto de recursos, sendo econômico quando o uso dos bancos é variável e não simultâneo.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Elastic pool do SQL Database", true],
            ["Banco único (single database) isolado", false],
            ["SQL Server em uma VM do Azure", false],
            ["Azure SQL Managed Instance", false],
        ],
    },
    {
        statement:
            "Uma equipe usa uma aplicação open source que exige um banco PostgreSQL e quer um serviço totalmente gerenciado no Azure. Qual serviço é o adequado?",
        explanation:
            "O Azure Database for PostgreSQL é o serviço gerenciado do Azure para bancos PostgreSQL, cuidando de backups, alta disponibilidade e patches.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Azure Database for PostgreSQL", true],
            ["Azure SQL Database", false],
            ["Azure SQL Managed Instance", false],
            ["Azure Cosmos DB for NoSQL", false],
        ],
    },
    {
        statement:
            "Ao planejar um novo projeto com banco relacional open source gerenciado no Azure em 2026, quais serviços a Microsoft mantém como foco atual? (Selecione DUAS opções.)",
        explanation:
            "O Azure Database for MariaDB foi descontinuado pela Microsoft, de modo que o foco atual para bancos open source gerenciados são o PostgreSQL e o MySQL.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Azure Database for PostgreSQL", true],
            ["Azure Database for MySQL", true],
            ["Azure Database for MariaDB", false],
            ["Azure Database for Oracle", false],
            ["Azure SQL Database", false],
        ],
    },
    {
        statement:
            "Um arquiteto de soluções precisa de um recurso do Azure que agrupe, sob um mesmo namespace e conjunto de credenciais, serviços para blobs, compartilhamentos de arquivo, tabelas NoSQL e filas de mensagens. Qual recurso ele deve provisionar?",
        explanation:
            "A conta de armazenamento (storage account) é o container de nível superior que engloba os quatro serviços de dados: Blob, Files, Table e Queue.",
        topic: "Armazenamento não relacional",
        options: [
            ["Uma conta de armazenamento do Azure", true],
            ["Uma instância do Azure Cosmos DB", false],
            ["Um Azure SQL Database", false],
            ["Um workspace do Azure Synapse Analytics", false],
        ],
    },
    {
        statement:
            "Uma equipe de ciência de dados precisa guardar, em grande escala, arquivos Parquet e CSV brutos para alimentar um data lake. Qual serviço da conta de armazenamento é o mais adequado para esses dados não estruturados?",
        explanation:
            "O Blob Storage é otimizado para grandes volumes de dados não estruturados e é a base do Azure Data Lake Storage Gen2.",
        topic: "Armazenamento não relacional",
        options: [
            ["Azure Table Storage", false],
            ["Azure Blob Storage", true],
            ["Azure Files", false],
            ["Azure Queue Storage", false],
        ],
    },
    {
        statement:
            "No Azure Blob Storage, como os blobs são organizados dentro de uma conta de armazenamento?",
        explanation:
            "Dentro de uma conta de armazenamento, os blobs ficam organizados em containers, que funcionam como pastas de nível superior.",
        topic: "Armazenamento não relacional",
        options: [
            ["Em containers", true],
            ["Em tabelas", false],
            ["Em filas", false],
            ["Em compartilhamentos SMB", false],
        ],
    },
    {
        statement:
            "Uma aplicação lê com muita frequência um conjunto de arquivos recém-enviados. Qual camada de acesso do Blob Storage oferece o menor custo de acesso para dados usados com frequência?",
        explanation:
            "A camada Hot tem o maior custo de armazenamento, porém o menor custo de acesso, sendo ideal para dados lidos com frequência.",
        topic: "Armazenamento não relacional",
        options: [
            ["Cool (Fria)", false],
            ["Cold (Fria)", false],
            ["Hot (Quente)", true],
            ["Archive (Arquivo)", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa reter documentos fiscais por sete anos apenas para conformidade legal, praticamente sem nunca acessá-los. Qual camada de acesso do Blob Storage oferece o menor custo de armazenamento?",
        explanation:
            "A camada Archive tem o menor custo de armazenamento, adequada para dados raramente acessados que toleram latência na recuperação.",
        topic: "Armazenamento não relacional",
        options: [
            ["Hot (Quente) padrão", false],
            ["Cool (Fria)", false],
            ["Cold (Fria)", false],
            ["Archive (Arquivo)", true],
        ],
    },
    {
        statement:
            "Um blob está guardado na camada Archive e a aplicação agora precisa ler o seu conteúdo. O que é necessário para acessar esses dados?",
        explanation:
            "Dados na camada Archive ficam offline; para lê-los é preciso reidratar (rehydrate) o blob para a camada Hot ou Cool, processo que pode levar horas.",
        topic: "Armazenamento não relacional",
        options: [
            ["Reidratar o blob para a camada Hot ou Cool", true],
            ["Nada, a leitura na camada Archive é imediata como nas demais", false],
            ["Converter a conta de armazenamento em Azure Cosmos DB", false],
            ["Montar o blob via protocolo SMB", false],
        ],
    },
    {
        statement:
            "Ao escolher entre as camadas Hot e Cool do Blob Storage, qual é o principal trade-off a ser considerado?",
        explanation:
            "Quanto mais fria a camada, menor o custo de guardar os dados e maior o custo de acessá-los. A Hot é o oposto da Cool nesse aspecto.",
        topic: "Armazenamento não relacional",
        options: [
            [
                "A Hot tem armazenamento caro e acesso barato; a Cool, armazenamento barato, acesso caro",
                true,
            ],
            ["A Hot e a Cool têm exatamente o mesmo custo, mudando apenas a região", false],
            [
                "A Cool tem armazenamento mais caro e acesso mais barato que a Hot em qualquer região",
                false,
            ],
            ["A Hot só aceita dados estruturados e a Cool só dados não estruturados", false],
        ],
    },
    {
        statement:
            "Uma empresa quer substituir um servidor de arquivos local por um compartilhamento na nuvem que possa ser montado por máquinas Windows via SMB e por servidores Linux via NFS. Qual serviço atende a esse requisito?",
        explanation:
            "O Azure Files oferece compartilhamentos de arquivos gerenciados acessíveis por SMB e NFS, montáveis tanto na nuvem quanto no ambiente local.",
        topic: "Armazenamento não relacional",
        options: [
            ["Azure Blob Storage", false],
            ["Azure Files (SMB)", true],
            ["Azure Table Storage", false],
            ["Azure Queue Storage", false],
        ],
    },
    {
        statement:
            "Quais protocolos são suportados pelo Azure Files para montar compartilhamentos de arquivos em clientes na nuvem e no local? (Selecione DUAS opções.)",
        explanation:
            "O Azure Files disponibiliza compartilhamentos de arquivos acessíveis pelos protocolos SMB e NFS. AMQP é de mensageria e ODBC é de conexão a bancos relacionais.",
        topic: "Armazenamento não relacional",
        options: [
            ["SMB", true],
            ["NFS", true],
            ["AMQP", false],
            ["ODBC", false],
            ["FTP", false],
        ],
    },
    {
        statement:
            "Uma aplicação precisa armazenar bilhões de entidades de perfil de usuário, cada uma com atributos que podem variar, com baixo custo e sem necessidade de junções ou relacionamentos. Qual serviço é o mais indicado?",
        explanation:
            "O Azure Table Storage é um armazenamento NoSQL de chave-valor, sem schema fixo e econômico para grandes volumes de dados semiestruturados.",
        topic: "Armazenamento não relacional",
        options: [
            ["Azure SQL Database", false],
            ["Azure Blob Storage", false],
            ["Azure Table Storage", true],
            ["Azure Queue Storage", false],
        ],
    },
    {
        statement:
            "No Azure Table Storage, duas entidades na mesma tabela podem ter conjuntos de propriedades diferentes entre si. Qual característica desse serviço isso demonstra?",
        explanation:
            "O Table Storage não impõe schema fixo (schemaless), então cada entidade pode ter propriedades diferentes das demais na mesma tabela.",
        topic: "Armazenamento não relacional",
        options: [
            ["Ausência de schema fixo (schemaless)", true],
            ["Integridade referencial entre tabelas", false],
            ["Normalização automática dos dados", false],
            ["Conformidade ACID com transações distribuídas", false],
        ],
    },
    {
        statement:
            "No Azure Table Storage, qual combinação de valores identifica exclusivamente uma entidade e determina como os dados são particionados?",
        explanation:
            "Cada entidade do Table Storage é identificada de forma única pela combinação de PartitionKey e RowKey; a PartitionKey define o particionamento dos dados.",
        topic: "Armazenamento não relacional",
        options: [
            ["Chave primária e chave estrangeira", false],
            ["ID e timestamp", false],
            ["PartitionKey e RowKey", true],
            ["Container e nome do blob", false],
        ],
    },
    {
        statement:
            "Um sistema de e-commerce precisa desacoplar o recebimento de pedidos do processamento de pagamentos, permitindo comunicação assíncrona entre os componentes. Qual serviço da conta de armazenamento é indicado para enfileirar essas mensagens?",
        explanation:
            "O Azure Queue Storage guarda grandes quantidades de mensagens que podem ser processadas de forma assíncrona, desacoplando os componentes de uma aplicação.",
        topic: "Armazenamento não relacional",
        options: [
            ["Azure Queue Storage", true],
            ["Azure Files", false],
            ["Azure Blob Storage", false],
            ["Azure Table Storage", false],
        ],
    },
    {
        statement:
            "Uma startup global precisa de um banco de dados NoSQL totalmente gerenciado que replique dados automaticamente em várias regiões, garanta latência de milissegundos e escale horizontalmente conforme a demanda. Qual serviço do Azure atende a esses requisitos?",
        explanation:
            "O Azure Cosmos DB é um serviço de banco de dados NoSQL PaaS com distribuição global, latência de milissegundos, escala horizontal automática e alta disponibilidade.",
        topic: "Azure Cosmos DB",
        options: [
            ["Azure SQL Database", false],
            ["Azure Table Storage", false],
            ["Azure Cosmos DB", true],
            ["Azure Database for PostgreSQL", false],
        ],
    },
    {
        statement:
            "Uma nova aplicação será desenvolvida do zero e armazenará documentos JSON no Azure Cosmos DB. Qual API é recomendada por ser a nativa e costumar receber os recursos mais recentes primeiro?",
        explanation:
            "A API para NoSQL (Core) é a API nativa do Cosmos DB, armazena documentos JSON e normalmente recebe os novos recursos antes das demais.",
        topic: "Azure Cosmos DB",
        options: [
            ["API para NoSQL", true],
            ["API para MongoDB", false],
            ["API para Apache Cassandra", false],
            ["API para Apache Gremlin", false],
        ],
    },
    {
        statement:
            "Uma empresa possui uma aplicação que já usa MongoDB e quer migrá-la para o Azure Cosmos DB com o mínimo de alterações de código, reaproveitando drivers e ferramentas atuais. Qual API do Cosmos DB deve escolher?",
        explanation:
            "A API para MongoDB é compatível com o protocolo do MongoDB, permitindo migrar aplicações existentes reaproveitando bibliotecas e ferramentas.",
        topic: "Azure Cosmos DB",
        options: [
            ["API para NoSQL", false],
            ["API para MongoDB", true],
            ["API para Table", false],
            ["API para Apache Gremlin", false],
        ],
    },
    {
        statement:
            "Uma rede social precisa modelar usuários e os relacionamentos entre eles, como amizades e seguidores, na forma de vértices e arestas, executando consultas de grafo. Qual API do Azure Cosmos DB é a mais adequada?",
        explanation:
            "A API para Apache Gremlin do Cosmos DB é voltada para bancos de dados de grafo, representando dados como vértices (entidades) e arestas (relacionamentos).",
        topic: "Azure Cosmos DB",
        options: [
            ["API para Apache Cassandra", false],
            ["API para Table", false],
            ["API para Apache Gremlin", true],
            ["API para MongoDB", false],
        ],
    },
    {
        statement:
            "Uma equipe já opera cargas de trabalho no Apache Cassandra e quer um serviço gerenciado no Azure compatível com a linguagem CQL e o modelo de dados em famílias de colunas. Qual API do Cosmos DB deve usar?",
        explanation:
            "A API para Apache Cassandra oferece compatibilidade com CQL e o modelo colunar, permitindo migrar cargas de trabalho Cassandra existentes.",
        topic: "Azure Cosmos DB",
        options: [
            ["API para Apache Gremlin", false],
            ["API para Apache Cassandra", true],
            ["API para NoSQL", false],
            ["API para MongoDB", false],
        ],
    },
    {
        statement:
            "Uma aplicação já usa o Azure Table Storage, mas agora precisa de distribuição global, latência garantida e maior throughput. Qual API do Azure Cosmos DB permite migrar mantendo um modelo de dados semelhante de chave-valor?",
        explanation:
            "A API para Table do Cosmos DB oferece um modelo chave-valor compatível com o Azure Table Storage, porém com os benefícios premium do Cosmos DB, como distribuição global e latência garantida.",
        topic: "Azure Cosmos DB",
        options: [
            ["API para Table", true],
            ["API para NoSQL", false],
            ["API para Apache Gremlin", false],
            ["API para Apache Cassandra", false],
        ],
    },
    {
        statement:
            "Quais cenários são casos de uso típicos do Azure Cosmos DB, por se beneficiarem de distribuição global e baixa latência? (Selecione DUAS opções.)",
        explanation:
            "O Cosmos DB se destaca em cenários de tempo real e escala global, como telemetria de IoT e e-commerce. Data warehouse analítico em batch e backups frios são melhor atendidos por outros serviços.",
        topic: "Azure Cosmos DB",
        options: [
            ["Telemetria de dispositivos IoT em tempo real", true],
            ["Catálogo e carrinho de e-commerce com usuários no mundo todo", true],
            ["Data warehouse para relatórios analíticos históricos em batch", false],
            ["Armazenamento de backups frios raramente acessados", false],
            ["Relatórios estáticos mensais gerados por lote", false],
        ],
    },
    {
        statement:
            "Um jogo online com milhões de jogadores simultâneos no mundo todo precisa de um banco de dados que suporte picos massivos de tráfego, baixa latência de leitura e escrita e escala elástica. Qual serviço é o mais indicado?",
        explanation:
            "O Cosmos DB é amplamente usado em jogos por oferecer escala elástica, baixa latência e distribuição global para suportar picos de milhões de jogadores.",
        topic: "Azure Cosmos DB",
        options: [
            ["Azure Table Storage", false],
            ["Azure Cosmos DB", true],
            ["Azure SQL Database", false],
            ["Azure Files", false],
        ],
    },
    {
        statement:
            "Uma empresa precisa limpar, padronizar e agregar os dados em uma área intermediária antes de gravá-los no data warehouse, de modo que apenas informações já tratadas cheguem ao destino. Qual abordagem descreve esse fluxo?",
        explanation:
            "No ETL os dados são transformados antes de serem carregados no destino, garantindo que apenas dados já tratados cheguem ao data warehouse.",
        topic: "Análise e data warehouse",
        options: [
            ["ELT (Extract, Load, Transform)", false],
            ["ETL (Extract, Transform, Load)", true],
            ["Processamento de fluxo em tempo real", false],
            ["Schema-on-read", false],
        ],
    },
    {
        statement:
            "Em um data lake moderno, a equipe carrega primeiro os dados brutos no destino e só depois executa as transformações, aproveitando o poder de processamento do próprio armazenamento analítico. Que abordagem é essa?",
        explanation:
            "No ELT os dados brutos são carregados primeiro e transformados no destino, aproveitando a escala de processamento do armazenamento analítico.",
        topic: "Análise e data warehouse",
        options: [
            ["ELT (Extract, Load, Transform)", true],
            ["ETL (Extract, Transform, Load)", false],
            ["Processamento OLTP", false],
            ["Normalização em terceira forma normal", false],
        ],
    },
    {
        statement:
            "Uma equipe quer orquestrar, de forma gerenciada e sem provisionar servidores, pipelines que copiam e movem dados agendados entre dezenas de fontes locais e na nuvem. Qual serviço do Azure atende a esse cenário?",
        explanation:
            "O Azure Data Factory é o serviço gerenciado de integração de dados que orquestra pipelines de ingestão, cópia e movimentação entre fontes.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Databricks", false],
            ["Power BI Desktop", false],
            ["Azure Data Factory", true],
            ["Azure Event Hubs", false],
        ],
    },
    {
        statement:
            "Um repositório analítico relacional, curado e altamente estruturado aplica o esquema no momento da gravação (schema-on-write) e é otimizado para consultas de relatórios e BI. Qual repositório é esse?",
        explanation:
            "O data warehouse é um armazenamento relacional curado, com schema-on-write, projetado para consultas analíticas e relatórios.",
        topic: "Análise e data warehouse",
        options: [
            ["Data lake", false],
            ["Data warehouse", true],
            ["Fila de mensagens", false],
            ["Banco NoSQL de documentos", false],
        ],
    },
    {
        statement:
            "Uma organização precisa guardar grandes volumes de dados brutos em formatos variados (estruturados, semiestruturados e não estruturados) ao menor custo possível, definindo a estrutura apenas na hora de ler. Qual solução é a mais adequada?",
        explanation:
            "O data lake armazena dados brutos de qualquer formato a baixo custo e usa schema-on-read, aplicando a estrutura somente na leitura.",
        topic: "Análise e data warehouse",
        options: [
            ["Data warehouse relacional", false],
            ["Banco de dados OLTP", false],
            ["Índice de busca", false],
            ["Um data lake", true],
        ],
    },
    {
        statement:
            "Qual arquitetura de dados combina o armazenamento flexível e barato de dados brutos de um data lake com os recursos de estrutura, esquema e consulta de um data warehouse?",
        explanation:
            "O lakehouse une as vantagens do data lake (dados brutos e baixo custo) com as do data warehouse (estrutura e consultas) em uma única arquitetura.",
        topic: "Análise e data warehouse",
        options: [
            ["Arquitetura lakehouse", true],
            ["Data mart isolado", false],
            ["Cubo OLAP tradicional", false],
            ["Banco de dados em grafo", false],
        ],
    },
    {
        statement:
            "Qual plataforma da Microsoft é uma solução SaaS unificada que reúne, em um único produto, integração de dados, engenharia de dados, data warehouse, ciência de dados, análise em tempo real e Power BI?",
        explanation:
            "O Microsoft Fabric é a plataforma SaaS unificada de análise que integra todas as cargas de trabalho de dados em uma só experiência.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Databricks", false],
            ["SQL Server Management Studio", false],
            ["Microsoft Fabric", true],
            ["Azure Data Factory", false],
        ],
    },
    {
        statement:
            "No Microsoft Fabric, qual componente funciona como o data lake único e centralizado da organização, armazenando cada dado uma só vez para ser reutilizado por todas as cargas de trabalho?",
        explanation:
            "O OneLake é o data lake unificado do Fabric, que guarda o dado uma única vez e o disponibiliza para todos os workloads, evitando duplicação.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Blob Storage clássico", false],
            ["O OneLake do Fabric", true],
            ["Azure Table Storage", false],
            ["Um data mart por departamento", false],
        ],
    },
    {
        statement:
            "Uma equipe de engenharia de dados quer processar grandes volumes de dados com Apache Spark e notebooks dentro do Microsoft Fabric. Qual carga de trabalho do Fabric ela deve usar?",
        explanation:
            "A carga Synapse Data Engineering do Fabric fornece o ambiente Apache Spark para processar dados em escala usando notebooks.",
        topic: "Análise e data warehouse",
        options: [
            ["Power BI", false],
            ["Data Warehouse", false],
            ["Real-Time Intelligence", false],
            ["Synapse Data Engineering", true],
        ],
    },
    {
        statement:
            "Qual serviço de análise do Azure é baseado no Apache Spark e oferece notebooks colaborativos para engenharia de dados, ciência de dados e machine learning?",
        explanation:
            "O Azure Databricks é a plataforma de análise baseada em Apache Spark, com notebooks colaborativos para engenharia, ciência de dados e ML.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Databricks", true],
            ["Azure Data Factory", false],
            ["Azure Stream Analytics", false],
            ["Azure Cosmos DB", false],
        ],
    },
    {
        statement:
            "Qual serviço fornece a camada de armazenamento para análise de big data no Azure, construído sobre o Blob Storage e com namespace hierárquico que organiza os dados em diretórios?",
        explanation:
            "O Azure Data Lake Storage Gen2 acrescenta o namespace hierárquico ao Blob Storage, servindo como camada de armazenamento para big data.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Files", false],
            ["Azure Queue Storage", false],
            ["Azure Data Lake Storage Gen2", true],
            ["Azure SQL Database gerenciado", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure oferece um data warehouse corporativo com análise em larga escala e tem tido seus recursos convergidos para o Microsoft Fabric?",
        explanation:
            "O Azure Synapse Analytics é o serviço de data warehouse corporativo e análise do Azure, cujos recursos vêm convergindo para o Microsoft Fabric.",
        topic: "Análise e data warehouse",
        options: [
            ["Azure Cosmos DB", false],
            ["Azure Synapse Analytics", true],
            ["Azure Event Hubs de eventos", false],
            ["Azure Blob Storage", false],
        ],
    },
    {
        statement: "Quais afirmações descrevem corretamente um data lake? (Selecione DUAS opções.)",
        explanation:
            "O data lake guarda dados brutos de qualquer formato a baixo custo e usa schema-on-read; exigir dados relacionais curados descreve o data warehouse, e OLTP é um cenário transacional, não analítico.",
        topic: "Análise e data warehouse",
        options: [
            ["Armazena dados brutos em diversos formatos a baixo custo", true],
            ["Aplica o esquema no momento da leitura (schema-on-read)", true],
            ["Exige que os dados sejam relacionais e curados antes da gravação", false],
            ["É otimizado principalmente para transações OLTP de baixa latência", false],
            ["Impede a gravação de arquivos que não tenham esquema definido", false],
        ],
    },
    {
        statement:
            "Um sistema coleta os dados de vendas ao longo de todo o dia e os processa juntos durante a madrugada para fechar os relatórios diários. Que tipo de processamento é esse?",
        explanation:
            "O processamento em lote (batch) agrupa os dados e os processa em intervalos agendados, tolerando maior latência, como em fechamentos diários.",
        topic: "Tempo real e streaming",
        options: [
            ["Processamento de fluxo (streaming)", false],
            ["Processamento por janela deslizante", false],
            ["Processamento de eventos complexos em tempo real", false],
            ["Processamento em lote (batch) diário", true],
        ],
    },
    {
        statement:
            "Um sistema antifraude precisa avaliar cada transação de cartão no instante em que ela ocorre, com latência de milissegundos, para bloquear operações suspeitas. Que tipo de processamento é indicado?",
        explanation:
            "O processamento de fluxo (streaming) analisa os dados continuamente, à medida que chegam, com baixa latência, ideal para detecção de fraude e IoT.",
        topic: "Tempo real e streaming",
        options: [
            ["Processamento de fluxo (streaming)", true],
            ["Processamento em lote (batch) noturno", false],
            ["Carga incremental noturna", false],
            ["Exportação agendada para CSV", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure processa fluxos de dados em tempo real usando uma linguagem de consulta semelhante ao SQL para filtrar e agregar eventos?",
        explanation:
            "O Azure Stream Analytics processa dados em tempo real usando uma linguagem de consulta parecida com SQL sobre os fluxos de eventos.",
        topic: "Tempo real e streaming",
        options: [
            ["Azure Data Factory", false],
            ["Power BI Service", false],
            ["Azure Stream Analytics", true],
            ["Azure Synapse Analytics", false],
        ],
    },
    {
        statement:
            "Qual serviço do Azure é projetado para ingerir milhões de eventos por segundo vindos de dispositivos e aplicações, servindo como porta de entrada de dados de telemetria para posterior processamento?",
        explanation:
            "O Azure Event Hubs é um serviço de ingestão de big data capaz de receber milhões de eventos por segundo para processamento em tempo real ou posterior.",
        topic: "Tempo real e streaming",
        options: [
            ["Azure SQL Database", false],
            ["Azure Event Hubs", true],
            ["Azure Blob Storage", false],
            ["Azure Data Lake Storage Gen2", false],
        ],
    },
    {
        statement:
            "Ao processar um fluxo, uma equipe quer agrupar os eventos em segmentos de tempo fixos, contíguos e sem sobreposição, agregando as leituras a cada 5 minutos. Que tipo de janela de tempo é essa?",
        explanation:
            "A janela em cascata (tumbling window) divide o fluxo em intervalos de tempo fixos, contíguos e sem sobreposição.",
        topic: "Tempo real e streaming",
        options: [
            ["Janela deslizante (sliding)", false],
            ["Janela de sessão (session)", false],
            ["Janela de salto (hopping)", false],
            ["Janela em cascata (tumbling)", true],
        ],
    },
    {
        statement:
            "No Microsoft Fabric, qual carga de trabalho é voltada a capturar, analisar e agir sobre dados em movimento, incluindo o recurso Eventstream para ingerir e rotear fluxos de eventos sem código?",
        explanation:
            "A carga Real-Time Intelligence do Fabric lida com dados em tempo real e usa o Eventstream para ingerir e encaminhar fluxos de eventos.",
        topic: "Tempo real e streaming",
        options: [
            ["Real-Time Intelligence", true],
            ["Data Warehouse", false],
            ["Data Science", false],
            ["Synapse Data Engineering", false],
        ],
    },
    {
        statement:
            "Qual mecanismo, disponível em plataformas como o Azure Databricks, permite processar fluxos de dados em tempo real usando basicamente a mesma API estruturada do processamento em lote do Apache Spark?",
        explanation:
            "O Spark Structured Streaming processa fluxos em tempo real com a mesma API estruturada usada no processamento em lote do Apache Spark.",
        topic: "Tempo real e streaming",
        options: [
            ["Azure Data Factory Mapping Data Flows", false],
            ["Power Query", false],
            ["Spark Structured Streaming", true],
            ["Transact-SQL", false],
        ],
    },
    {
        statement:
            "Quais características são típicas do processamento de dados em fluxo (streaming)? (Selecione DUAS opções.)",
        explanation:
            "O streaming se caracteriza pelo processamento contínuo e de baixa latência dos eventos, ideal para IoT e fraude; lotes agendados e tolerância a horas de atraso descrevem o processamento em lote.",
        topic: "Tempo real e streaming",
        options: [
            ["Processa os eventos continuamente e com baixa latência, à medida que chegam", true],
            ["É adequado a cenários como IoT e detecção de fraude", true],
            ["Processa os dados somente em grandes lotes agendados", false],
            ["Tolera naturalmente horas de atraso entre a coleta e o processamento", false],
            ["Exige que todos os dados estejam em tabelas relacionais", false],
        ],
    },
    {
        statement:
            "Qual componente do Power BI é o aplicativo de desktop gratuito usado por analistas para se conectar a fontes de dados, modelar os dados e criar relatórios?",
        explanation:
            "O Power BI Desktop é o aplicativo de autoria, gratuito, usado para conectar-se a dados, modelar e criar relatórios.",
        topic: "Power BI e visualização",
        options: [
            ["Serviço do Power BI (Power BI Service)", false],
            ["Power BI Desktop", true],
            ["Power BI Mobile", false],
            ["Power BI Report Builder para relatórios paginados", false],
        ],
    },
    {
        statement:
            "Depois de finalizar um relatório no Power BI Desktop, um analista precisa publicá-lo na nuvem para compartilhá-lo com colegas por meio de workspaces e dashboards. Qual componente ele utiliza?",
        explanation:
            "O Serviço do Power BI é a plataforma SaaS na nuvem usada para publicar, compartilhar e distribuir relatórios e dashboards.",
        topic: "Power BI e visualização",
        options: [
            ["Serviço do Power BI (Power BI Service)", true],
            ["Power BI Desktop", false],
            ["Editor do Power Query", false],
            ["Um arquivo .pbix salvo apenas localmente", false],
        ],
    },
    {
        statement:
            "No Power BI, um analista precisa criar uma medida com um cálculo agregado personalizado, como o total de vendas do ano anterior. Qual linguagem de fórmula ele utiliza?",
        explanation:
            "As medidas e cálculos do modelo no Power BI são criados com a linguagem DAX; a linguagem M do Power Query é usada para transformar e carregar os dados, não para as medidas.",
        topic: "Power BI e visualização",
        options: [
            ["Transact-SQL", false],
            ["KQL (Kusto Query Language) do Azure", false],
            ["DAX (Data Analysis Expressions)", true],
            ["Linguagem M do Power Query", false],
        ],
    },
    {
        statement:
            "Um analista quer mostrar a evolução da receita mensal ao longo dos últimos dois anos, destacando a tendência ao longo do tempo. Qual visualização é a mais indicada?",
        explanation:
            "O gráfico de linhas é o mais indicado para mostrar tendências e a evolução de um valor ao longo do tempo.",
        topic: "Power BI e visualização",
        options: [
            ["Gráfico de pizza", false],
            ["Cartão (KPI)", false],
            ["Gráfico de dispersão", false],
            ["Gráfico de linhas", true],
        ],
    },
    {
        statement:
            "Para comparar o total de vendas entre diferentes categorias de produtos em um relatório do Power BI, qual visualização é a mais apropriada?",
        explanation:
            "Gráficos de barras ou colunas são ideais para comparar valores entre categorias distintas.",
        topic: "Power BI e visualização",
        options: [
            ["Gráfico de barras ou colunas", true],
            ["Gráfico de linhas", false],
            ["Gráfico de dispersão (scatter)", false],
            ["Cartão (KPI)", false],
        ],
    },
    {
        statement:
            "Uma empresa quer visualizar o volume de vendas distribuído pelos estados do Brasil, destacando as diferenças regionais em um relatório do Power BI. Qual visualização representa melhor esses dados?",
        explanation:
            "O visual de mapa é o mais indicado para representar dados com dimensão geográfica, como o volume de vendas por estado.",
        topic: "Power BI e visualização",
        options: [
            ["Gráfico de rosca (donut)", false],
            ["Mapa", true],
            ["Gráfico de linhas", false],
            ["Matriz", false],
        ],
    },
    {
        statement:
            "Quais afirmações sobre os componentes do Power BI estão corretas? (Selecione DUAS opções.)",
        explanation:
            "O Power BI Desktop cria e modela relatórios, e o Serviço do Power BI os publica e compartilha na nuvem; o Power BI Mobile serve para consumir relatórios em dispositivos móveis, não para criá-los.",
        topic: "Power BI e visualização",
        options: [
            ["O Power BI Desktop é usado para criar e modelar relatórios", true],
            [
                "O Serviço do Power BI, na nuvem, é usado para publicar e compartilhar relatórios",
                true,
            ],
            ["O Power BI Mobile é a ferramenta principal para criar e modelar relatórios", false],
            ["O Power BI Desktop só funciona na nuvem e não pode ser instalado localmente", false],
            ["O Editor do Power Query é usado para publicar os dashboards prontos", false],
        ],
    },
    {
        statement:
            "Uma empresa armazena mensagens de e-mail em que cada uma tem campos padronizados de cabeçalho, como remetente, data e assunto, além de um corpo de texto livre e anexos variados. Como esses dados são melhor classificados?",
        explanation:
            "E-mails são um exemplo clássico de dados semiestruturados: os cabeçalhos seguem uma estrutura previsível, enquanto o corpo e os anexos são de formato livre. Eles não se encaixam em linhas e colunas rígidas nem são totalmente sem estrutura.",
        topic: "Conceitos de dados",
        options: [
            ["Dados estruturados, pois possuem cabeçalhos padronizados", false],
            ["Dados não estruturados, pois contêm anexos de formato livre", false],
            [
                "Dados semiestruturados, pois combinam campos organizados com conteúdo de formato livre",
                true,
            ],
            [
                "Dados relacionais, pois podem ser organizados em tabelas com linhas e colunas e consultados diretamente com SQL",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe classifica o banco de dados que atende ao sistema de pedidos de uma loja virtual como uma carga OLTP. Qual característica é típica desse tipo de carga de trabalho?",
        explanation:
            "Sistemas OLTP lidam com muitas transações curtas e frequentes sobre dados operacionais atuais, priorizando escrita e leitura rápidas. Consultas analíticas complexas sobre grandes volumes históricos são características de cargas OLAP.",
        topic: "Conceitos de dados",
        options: [
            [
                "Executa muitas transações curtas de inserção, atualização e leitura sobre dados atuais",
                true,
            ],
            ["Armazena dados históricos organizados em um esquema estrela para relatórios", false],
            [
                "É otimizado para poucas consultas complexas que agregam grandes volumes de dados históricos e alimentam relatórios gerenciais",
                false,
            ],
            ["Prioriza a leitura de grandes lotes de dados em vez de escritas frequentes", false],
        ],
    },
    {
        statement:
            "Uma equipe de dados compara os formatos CSV e Parquet para armazenar tabelas em um data lake analítico. Qual afirmação sobre o Parquet está correta?",
        explanation:
            "O Parquet é um formato binário colunar: por armazenar os valores agrupados por coluna, comprime melhor e permite que consultas leiam apenas as colunas necessárias. O CSV, em contraste, é um formato de texto orientado a linhas.",
        topic: "Conceitos de dados",
        options: [
            [
                "É um formato de texto legível por humanos, ideal para abrir, editar e inspecionar manualmente em qualquer editor de texto simples",
                false,
            ],
            ["Guarda uma linha por registro com campos separados por vírgula", false],
            ["Não aplica nenhuma compressão para manter a máxima simplicidade de leitura", false],
            [
                "Armazena os dados organizados por coluna, o que melhora a compressão e permite ler apenas as colunas necessárias",
                true,
            ],
        ],
    },
    {
        statement:
            "Uma administradora quer disponibilizar aos analistas uma consulta sobre a tabela de funcionários que exiba apenas nome e cargo, ocultando o salário, sem duplicar fisicamente os dados. Qual objeto relacional oferece essa representação virtual e restrita?",
        explanation:
            "Uma exibição (view) é uma consulta salva que se comporta como uma tabela virtual, podendo expor apenas um subconjunto de colunas sem armazenar os dados novamente. É útil para simplificar consultas e restringir o acesso a colunas sensíveis.",
        topic: "Dados relacionais",
        options: [
            ["Uma exibição (view)", true],
            ["Um índice", false],
            ["Uma chave estrangeira", false],
            [
                "Uma stored procedure que copia os dados filtrados para uma nova tabela a cada consulta",
                false,
            ],
        ],
    },
    {
        statement:
            "Em um banco com altíssimo volume de inserções e atualizações, um desenvolvedor propõe criar índices em quase todas as colunas para acelerar qualquer consulta. Qual é a principal desvantagem dessa abordagem?",
        explanation:
            "Índices aceleram leituras, mas cada índice consome armazenamento e precisa ser atualizado sempre que os dados mudam. Em cargas com muitas escritas, um excesso de índices pode degradar o desempenho de inserções e atualizações.",
        topic: "Dados relacionais",
        options: [
            ["Índices só podem ser criados em colunas do tipo numérico", false],
            [
                "Cada índice ocupa espaço e precisa ser mantido a cada escrita, o que pode tornar inserções e atualizações mais lentas",
                true,
            ],
            [
                "Índices impedem que a tabela utilize chaves estrangeiras para garantir a integridade referencial entre as tabelas relacionadas do modelo de dados",
                false,
            ],
            ["Índices removem automaticamente as linhas duplicadas da tabela", false],
        ],
    },
    {
        statement:
            "Uma empresa quer que os dados armazenados no Azure Blob Storage sejam copiados automaticamente para uma segunda região geográfica, protegendo-os contra a indisponibilidade de uma região inteira do Azure. Qual opção de redundância atende a esse requisito?",
        explanation:
            "A redundância geográfica (GRS) replica os dados para uma região secundária distante, oferecendo proteção contra falhas em nível regional. A redundância local (LRS) mantém as cópias apenas dentro de um único datacenter.",
        topic: "Armazenamento não relacional",
        options: [
            ["Armazenamento com redundância local (LRS)", false],
            ["Camada de acesso Cool", false],
            ["Armazenamento com redundância geográfica (GRS)", true],
            [
                "Uma conta de armazenamento com desempenho Premium e replicação apenas dentro do mesmo datacenter",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma aplicação parceira externa precisa de acesso temporário e limitado a um único contêiner do Blob Storage, e a equipe não quer compartilhar a chave da conta de armazenamento. Qual recurso concede esse acesso delegado, com escopo e prazo definidos?",
        explanation:
            "Uma assinatura de acesso compartilhado (SAS) concede acesso delegado, limitado por escopo, permissões e validade, sem expor a chave da conta. Compartilhar a chave da conta daria acesso total e irrestrito a todo o armazenamento.",
        topic: "Armazenamento não relacional",
        options: [
            ["A chave de acesso da conta de armazenamento", false],
            ["A camada de acesso Hot", false],
            [
                "Uma regra de redundância que replica o contêiner para outra região a fim de liberar o acesso externo",
                false,
            ],
            ["Uma assinatura de acesso compartilhado (SAS)", true],
        ],
    },
    {
        statement:
            "Usando o Azure Synapse Analytics, uma equipe quer consultar arquivos que já estão em um data lake sob demanda, pagando apenas pelos dados processados em cada consulta, sem precisar provisionar e manter um cluster dedicado. Qual recurso do Synapse atende a isso?",
        explanation:
            "O pool de SQL sem servidor do Synapse permite consultar dados diretamente no data lake sob demanda, cobrando pelo volume processado, sem infraestrutura provisionada. O pool dedicado, por outro lado, reserva recursos de computação de forma contínua.",
        topic: "Análise e data warehouse",
        options: [
            ["Pool de SQL dedicado", false],
            ["Pool de SQL sem servidor (serverless)", true],
            ["Pool do Apache Spark", false],
            [
                "Um pipeline de integração que copia previamente todos os arquivos para um banco relacional antes da consulta",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao projetar um data warehouse com esquema estrela para uma rede varejista, um analista precisa decidir o conteúdo das tabelas de dimensão. O que uma tabela de dimensão normalmente armazena?",
        explanation:
            "As tabelas de dimensão guardam atributos descritivos (como produto, cliente, tempo e local) que dão contexto para filtrar e agrupar. As medidas numéricas do negócio ficam na tabela de fatos central.",
        topic: "Análise e data warehouse",
        options: [
            ["As medidas numéricas e os valores agregados das transações do negócio", false],
            [
                "Apenas os índices e as estatísticas de desempenho usados pela tabela de fatos central",
                false,
            ],
            [
                "Atributos descritivos usados para filtrar e agrupar, como produto, cliente, tempo e local",
                true,
            ],
            [
                "As chaves estrangeiras e os totais consolidados de cada transação processada ao longo do período",
                false,
            ],
        ],
    },
    {
        statement:
            "Em uma arquitetura de lakehouse, os dados costumam ser organizados em camadas sucessivas: brutos na primeira, limpos e enriquecidos na intermediária e agregados e prontos para consumo na final. Como essa organização em camadas é comumente chamada?",
        explanation:
            "A arquitetura medalhão organiza o lakehouse em camadas bronze (dados brutos), prata (limpos e integrados) e ouro (agregados para consumo). Cada camada refina progressivamente os dados para análise.",
        topic: "Análise e data warehouse",
        options: [
            ["Esquema estrela", false],
            ["Terceira forma normal", false],
            [
                "Modelo entidade-relacionamento aplicado sobre os arquivos brutos do data lake para reforçar a normalização",
                false,
            ],
            ["Arquitetura medalhão, com camadas bronze, prata e ouro", true],
        ],
    },
    {
        statement:
            "Uma empresa mantém uma aplicação web em PHP que usa um banco de dados MySQL e quer movê-la para um serviço totalmente gerenciado no Azure, sem administrar servidores nem o sistema operacional. Qual serviço deve escolher?",
        explanation:
            "O Azure Database for MySQL é o serviço PaaS totalmente gerenciado para bancos MySQL, ideal para migrar aplicações que já usam esse mecanismo. O Azure SQL Database é baseado no mecanismo do SQL Server, não no MySQL.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Azure Database for MySQL", true],
            ["Azure SQL Database", false],
            ["Azure Database for PostgreSQL", false],
            [
                "SQL Server instalado e configurado manualmente em uma máquina virtual do Azure",
                false,
            ],
        ],
    },
    {
        statement:
            "Para garantir continuidade de negócios, uma empresa quer manter uma cópia legível do seu Azure SQL Database em outra região do Azure, pronta para assumir a operação caso a região principal fique indisponível. Qual recurso atende a esse objetivo?",
        explanation:
            "A replicação geográfica cria réplicas legíveis do banco em outra região, permitindo failover em caso de indisponibilidade regional. O pool elástico serve para compartilhar recursos entre vários bancos, não para recuperação de desastres.",
        topic: "Serviços relacionais no Azure",
        options: [
            ["Pool elástico", false],
            ["Replicação geográfica (geo-replicação)", true],
            ["Camada de computação sem servidor", false],
            [
                "Uma tarefa agendada que exporta o banco para um arquivo e o copia manualmente para outra região toda noite",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma equipe de arquitetura compara as opções de banco relacional no Azure segundo o nível de controle e de responsabilidade administrativa que cada uma exige. Qual sequência as ordena corretamente, do MAIOR controle para o MENOR?",
        explanation:
            "Rodar SQL Server em uma VM (IaaS) dá o maior controle, mas exige gerenciar o sistema operacional e o mecanismo. O SQL Managed Instance fica no meio-termo, e o Azure SQL Database (PaaS) oferece o menor esforço administrativo.",
        topic: "Serviços relacionais no Azure",
        options: [
            [
                "Azure SQL Database, depois SQL Managed Instance, depois SQL Server em uma máquina virtual",
                false,
            ],
            [
                "SQL Managed Instance, depois Azure SQL Database, depois SQL Server em uma máquina virtual",
                false,
            ],
            [
                "SQL Server em uma máquina virtual, depois SQL Managed Instance, depois Azure SQL Database",
                true,
            ],
            [
                "Azure SQL Database, depois SQL Server em uma máquina virtual, depois SQL Managed Instance",
                false,
            ],
        ],
    },
    {
        statement:
            "Uma solução industrial precisa de comunicação bidirecional com milhões de dispositivos IoT: além de receber a telemetria enviada por eles, precisa enviar comandos e atualizações de configuração de volta a cada dispositivo. Qual serviço do Azure é o mais adequado?",
        explanation:
            "O Azure IoT Hub oferece comunicação bidirecional segura com dispositivos, incluindo o envio de comandos e configurações de volta a eles. O Event Hubs é voltado à ingestão de eventos em alta escala, mas não à comunicação de volta com cada dispositivo.",
        topic: "Tempo real e streaming",
        options: [
            ["Azure Event Hubs", false],
            ["Azure Stream Analytics", false],
            [
                "Azure Blob Storage configurado com gatilhos para responder a cada dispositivo individualmente",
                false,
            ],
            ["Azure IoT Hub", true],
        ],
    },
    {
        statement:
            "Um trabalho do Azure Stream Analytics calcula métricas continuamente a partir de um fluxo de eventos e precisa exibir esses resultados em um painel que se atualiza em tempo quase real. Qual serviço é comumente configurado como saída para essa visualização?",
        explanation:
            "O Power BI pode ser definido como saída de um trabalho do Stream Analytics, recebendo os resultados processados para alimentar painéis em tempo quase real. Event Hubs e IoT Hub costumam atuar como entradas de streaming, não como destino de visualização.",
        topic: "Tempo real e streaming",
        options: [
            ["Power BI (dashboard)", true],
            ["Azure Event Hubs", false],
            ["Azure IoT Hub", false],
            [
                "Azure Data Factory executando um pipeline de cópia agendado para atualizar os dados periodicamente",
                false,
            ],
        ],
    },
    {
        statement:
            "Ao revisar comandos SQL, uma DBA quer agrupar os que consultam e alteram os dados armazenados na categoria DML. Qual conjunto pertence à Linguagem de Manipulação de Dados (DML)?",
        explanation:
            "A DML reúne os comandos que consultam e modificam dados: SELECT, INSERT, UPDATE e DELETE. CREATE, ALTER e DROP são DDL (estrutura) e GRANT e REVOKE são DCL (permissões).",
        topic: "SQL e objetos de banco",
        options: [
            ["CREATE, ALTER e DROP", false],
            ["SELECT, INSERT, UPDATE e DELETE", true],
            ["GRANT, REVOKE e DENY", false],
            ["COMMIT, ROLLBACK e SAVEPOINT usados para controlar transações", false],
        ],
    },
    {
        statement:
            "Um administrador precisa remover completamente uma tabela do banco de dados, eliminando tanto os dados quanto a própria estrutura e definição do objeto. Qual comando SQL ele deve usar?",
        explanation:
            "O comando DROP TABLE remove a tabela por inteiro, incluindo estrutura e dados. DELETE e TRUNCATE apagam apenas as linhas, mas mantêm a definição da tabela.",
        topic: "SQL e objetos de banco",
        options: [
            ["DELETE", false],
            ["TRUNCATE TABLE", false],
            ["DROP TABLE", true],
            [
                "ALTER TABLE, ajustando a definição de cada coluna até esvaziar completamente o objeto",
                false,
            ],
        ],
    },
    {
        statement:
            "Um gerente quer visualizar qual é a participação percentual de cada categoria de produto no faturamento total, mostrando como cada parte contribui para um todo. Qual visualização do Power BI é a mais indicada?",
        explanation:
            "Gráficos de pizza ou de rosca mostram a proporção de cada parte em relação ao todo, sendo adequados para participações percentuais entre poucas categorias. Gráficos de linhas são melhores para tendências ao longo do tempo.",
        topic: "Power BI e visualização",
        options: [
            ["Gráfico de linhas", false],
            ["Gráfico de dispersão", false],
            [
                "Um mapa coroplético que colore cada região conforme o valor total de vendas registrado",
                false,
            ],
            ["Gráfico de pizza (ou de rosca)", true],
        ],
    },
    {
        statement:
            "No fluxo de trabalho do Power BI Desktop, um analista precisa se conectar às fontes e limpar os dados antes de modelá-los, por exemplo removendo colunas, corrigindo tipos e filtrando linhas inválidas. Qual ferramenta é usada para essa preparação dos dados?",
        explanation:
            "O Power Query é a ferramenta de conexão, limpeza e transformação de dados do Power BI, usada antes da modelagem. O DAX, por sua vez, serve para criar cálculos e medidas sobre o modelo já carregado.",
        topic: "Power BI e visualização",
        options: [
            ["Power Query", true],
            ["DAX", false],
            ["O Power BI Service", false],
            [
                "Um gráfico de dispersão configurado para destacar e descartar visualmente os valores inconsistentes",
                false,
            ],
        ],
    },
];
