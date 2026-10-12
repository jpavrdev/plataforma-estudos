// Seed da trilha Databricks Certified Data Engineer Associate. Conteúdo autoral, escrito para
// cobrir as seções do guia oficial do exame. Idempotente e não destrutivo: se a
// trilha já tiver aulas, não faz nada.
//
// Rodar em dev:  node --env-file=.env scripts/seed-trilha-databricks-de-associate.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-databricks-de-associate.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Databricks Certified Data Engineer Associate";
const CARGA_HORARIA = 24;
const DESCRICAO =
    "Trilha de preparação para a certificação Databricks Certified Data Engineer Associate: a plataforma e o compute, ingestão com Auto Loader e COPY INTO, transformação com Spark SQL e Delta Lake, pipelines declarativos do Lakeflow, orquestração com Lakeflow Jobs, governança com Unity Catalog, CI/CD com Automation Bundles e otimização de desempenho e custo.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    explanation: string;
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - A plataforma Databricks",
    aulas: [
        {
            titulo: "Lakehouse: o que a Databricks resolve e como",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber responder duas perguntas que a prova faz de vários jeitos: por que uma empresa troca o par data warehouse mais data lake por um lakehouse, e em qual conta de nuvem cada peça da Databricks roda.\n\nO problema é antigo. O data warehouse sustentou relatório de BI por quase trinta anos, e a documentação da Databricks é direta sobre o preço disso: ele otimiza consulta para relatório, mas ainda pode levar minutos ou até horas para devolver resultado, e muitos usam formato proprietário, o que limita o suporte a machine learning. O data lake veio pelo outro lado: guarda dado de qualquer natureza, em qualquer formato, de forma permanente e barata. Só que o dado do lake não passa por validação, então a empresa termina usando o lake para ciência de dados e o warehouse para BI. Dois sistemas, duas cópias do mesmo dado, duas contas para pagar e nenhuma fonte única da verdade.",
                },
                {
                    type: "text",
                    value: "O lakehouse é definido como o sistema de gerenciamento de dados que combina os benefícios dos dois mundos. A receita, na própria descrição da documentação, é empilhar uma camada de metadados otimizada sobre dado validado guardado em formato padrão no armazenamento de objetos da nuvem. Dessa combinação saem os três ganhos que a doc lista:\n\n- acesso aberto e direto ao dado guardado em formatos de dados padrão;\n- protocolos de indexação otimizados para machine learning e ciência de dados;\n- baixa latência de consulta e alta confiabilidade para BI e analytics avançado.\n\nRepare no que sustenta os três: o formato aberto. É ele que permite ler o arquivo direto, sem passar por um motor proprietário, e é ele que faz o mesmo arquivo servir para o relatório da diretoria e para o treino do modelo. É por isso que a prova volta nesse ponto tantas vezes.",
                },
                {
                    type: "table",
                    value: '[["Característica","Data warehouse","Data lake","Lakehouse"],["Formato do dado","Muitas vezes proprietário","Qualquer formato","Formato de dados padrão e aberto"],["Uso típico","Relatório de BI","Ciência de dados e machine learning","BI, ciência de dados e machine learning"],["Confiança no dado","Dado limpo e estruturado","Dado não validado","Dado validado sob camada de metadados"],["Custo de armazenamento","Alto","Barato e permanente","Barato e permanente"],["Limitação que a doc aponta","Suporte a machine learning limitado","Não serve bem para relatório de BI","Depende da camada de metadados sobre o armazenamento"]]',
                },
                {
                    type: "text",
                    value: "Na Databricks, três componentes materializam essa ideia, e a prova espera que você saiba qual é qual:\n\n- **Apache Spark** como motor de processamento, rodando em recursos de compute desacoplados do armazenamento. Desacoplado quer dizer que você liga e desliga máquina sem mexer no dado.\n- **Delta Lake** como a camada de armazenamento otimizada que oferece transação ACID e validação de schema.\n- **Unity Catalog** como a solução unificada e granular de governança de dado e de IA.\n\nTroque os papéis desses três e você errou a questão. Delta Lake não governa acesso, Unity Catalog não guarda arquivo de dado, e nenhum dos dois é o motor que executa a consulta.",
                },
                {
                    type: "quote",
                    value: "O dado do lakehouse mora em formato aberto no armazenamento de objetos da nuvem. A Databricks entrega a camada de metadados, a governança e o compute, não o cofre do dado.",
                },
                {
                    type: "text",
                    value: "A arquitetura da plataforma se divide em dois planos, e essa divisão é uma das perguntas mais frequentes da seção.\n\nO **plano de controle** inclui os serviços de backend que a Databricks gerencia na conta Databricks. Ele fica na conta Databricks, não na sua conta de nuvem, e a aplicação web está nele.\n\nO **plano de computação** é onde os seus dados são processados, e ele tem dois sabores. No plano de computação clássico, os recursos de compute rodam na sua conta de nuvem: cada recurso novo é criado dentro da rede virtual do workspace, na conta do cliente, o que a doc chama de isolamento natural, por rodar na conta de cada cliente. No plano de computação serverless, os recursos de compute da Databricks rodam em uma camada de computação dentro da conta Databricks, protegida por uma fronteira de rede do workspace, e criada na mesma região do plano de computação clássico daquele workspace.\n\nGuarde a consequência prática: o plano de controle nunca processa o seu dado.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","Plano de controle","Plano de computação clássico","Plano de computação serverless"],["Em qual conta fica","Conta Databricks","Sua conta de nuvem","Conta Databricks"],["Processa o seu dado","Não","Sim","Sim"],["O que roda ali","Serviços de backend e a aplicação web","Compute criado na rede virtual do workspace","Compute em uma camada de computação da Databricks"],["Isolamento citado pela doc","Serviços gerenciados pela Databricks","Natural, por rodar na conta do cliente","Fronteira de rede do workspace"]]',
                },
                {
                    type: "code",
                    value: "-- A tabela é uma referência lógica; o dado é arquivo no armazenamento de objetos.\n-- DESCRIBE DETAIL devolve, entre outras colunas, location, numFiles e sizeInBytes.\nDESCRIBE DETAIL vendas.bronze.pedidos;\n\n-- format | id | name    | location                       | numFiles | sizeInBytes\n-- delta  | .. | pedidos | s3://meu-bucket/vendas/pedidos |      312 |  1842930112",
                },
                {
                    type: "text",
                    value: "Com dado validado em formato aberto e governança única em cima, a doc lista o que o lakehouse passa a cobrir no mesmo lugar: processamento de dado em tempo real, integração de dados, evolução de schema, transformações, análise e relatório, machine learning e IA, versionamento e linhagem, governança, compartilhamento de dados e analytics operacional.\n\nO argumento de negócio vem dessa lista: estabelecer uma fonte única da verdade, eliminar custo redundante e garantir dado atualizado. Quando a prova pergunta o benefício do lakehouse, é por aí que a resposta certa costuma andar, e não por desempenho bruto de consulta.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma equipe guarda o dado bruto em um data lake e mantém uma cópia tratada em um data warehouse de formato proprietário. Ao apresentar o lakehouse como alternativa, qual característica a documentação lista em primeiro lugar entre os ganhos?",
                    difficulty: "facil",
                    explanation:
                        "A doc descreve o lakehouse como camada de metadados otimizada sobre dado validado em formato padrão no armazenamento de objetos. O formato aberto é o que permite acesso direto ao arquivo sem motor proprietário. Converter para formato proprietário ou manter duas cópias é justamente o problema do par warehouse mais lake.",
                    options: [
                        {
                            text: "O dado validado fica em formato padrão e aberto no armazenamento de objetos da nuvem, com acesso direto ao arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "O dado validado é convertido para um formato proprietário otimizado, com acesso direto pelo motor do próprio fornecedor.",
                            isCorrect: false,
                        },
                        {
                            text: "O dado validado é carregado na memória do plano de controle, com acesso direto sem tocar no armazenamento.",
                            isCorrect: false,
                        },
                        {
                            text: "O dado validado é mantido em duas cópias sincronizadas, uma para relatório de BI e outra para machine learning.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma implantação clássica da Databricks, onde fica cada parte da arquitetura?",
                    difficulty: "medio",
                    explanation:
                        "A doc é explícita: o plano de controle inclui os serviços de backend que a Databricks gerencia na conta Databricks, e a aplicação web fica nele. No plano de computação clássico, os recursos de compute são criados na rede virtual do workspace, dentro da conta de nuvem do cliente. Inverter os dois é a troca mais comum.",
                    options: [
                        {
                            text: "Os serviços de backend e a aplicação web ficam na conta Databricks, e o compute que processa o dado roda na conta de nuvem do cliente.",
                            isCorrect: true,
                        },
                        {
                            text: "Os serviços de backend e a aplicação web ficam na conta de nuvem do cliente, e o compute que processa o dado roda na conta Databricks.",
                            isCorrect: false,
                        },
                        {
                            text: "Os serviços de backend, a aplicação web e o compute que processa o dado ficam todos dentro da conta Databricks, sem exceção.",
                            isCorrect: false,
                        },
                        {
                            text: "Os serviços de backend, a aplicação web e o compute que processa o dado ficam todos na conta de nuvem do cliente.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time abandona o compute clássico e passa a usar compute serverless. O que muda de lugar na arquitetura, segundo a documentação?",
                    difficulty: "medio",
                    explanation:
                        "No plano de computação serverless, os recursos de compute da Databricks rodam em uma camada de computação dentro da conta Databricks, criada na mesma região do plano clássico do workspace. O plano de controle continua hospedando os serviços de backend e a aplicação web, e o armazenamento das tabelas não migra.",
                    options: [
                        {
                            text: "Os recursos de compute passam a rodar em uma camada de computação dentro da conta Databricks, na mesma região do plano clássico do workspace.",
                            isCorrect: true,
                        },
                        {
                            text: "Os recursos de compute passam a rodar em uma rede virtual dedicada dentro da conta do cliente, em uma região escolhida na criação do recurso.",
                            isCorrect: false,
                        },
                        {
                            text: "Os serviços de backend passam a rodar na conta do cliente, e o plano de controle deixa de hospedar a aplicação web do workspace.",
                            isCorrect: false,
                        },
                        {
                            text: "Os recursos de compute continuam na conta do cliente, e só o armazenamento de objetos das tabelas muda para a conta Databricks.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual par descreve corretamente o que o lakehouse herda do data warehouse e o que herda do data lake?",
                    difficulty: "dificil",
                    explanation:
                        "A doc atribui ao warehouse o dado limpo e estruturado com consulta rápida para BI, e ao lake o armazenamento barato e permanente de dado em qualquer formato. Trocar os dois lados é o distrator mais tentador, porque as duas frases isoladas são verdadeiras; o que está errado é a origem de cada uma.",
                    options: [
                        {
                            text: "Do warehouse, dado limpo e estruturado com consulta rápida para BI; do lake, armazenamento barato de dado em qualquer formato.",
                            isCorrect: true,
                        },
                        {
                            text: "Do warehouse, armazenamento barato de dado em qualquer formato; do lake, dado limpo e estruturado com consulta rápida para BI.",
                            isCorrect: false,
                        },
                        {
                            text: "Do warehouse, o formato proprietário que acelera o relatório; do lake, o catálogo central que governa as tabelas.",
                            isCorrect: false,
                        },
                        {
                            text: "Do warehouse, o processamento de evento em tempo real; do lake, a validação de schema na escrita de cada tabela.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Na descrição da documentação, qual é o papel de cada componente do lakehouse na Databricks?",
                    difficulty: "dificil",
                    explanation:
                        "A doc define Delta Lake como a camada de armazenamento otimizada que oferece transação ACID e validação de schema, e Unity Catalog como a solução unificada e granular de governança de dado e de IA. O motor vetorizado é o Photon, e nenhum dos dois orquestra carga agendada.",
                    options: [
                        {
                            text: "Delta Lake é a camada de armazenamento otimizada com transação ACID e validação de schema, e Unity Catalog é a governança unificada e granular.",
                            isCorrect: true,
                        },
                        {
                            text: "Delta Lake é a governança unificada e granular do dado e da IA, e Unity Catalog é a camada de armazenamento otimizada com transação ACID e validação de schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Delta Lake é o motor de consulta vetorizado que acelera a leitura, e Unity Catalog é o formato de arquivo aberto usado nas tabelas.",
                            isCorrect: false,
                        },
                        {
                            text: "Delta Lake é o orquestrador das cargas agendadas do workspace, e Unity Catalog é o cache que guarda o resultado das consultas.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Workspace, notebooks e pastas Git",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber onde cada ativo que você cria vive dentro do workspace, como rodar uma célula em outra linguagem sem trocar a linguagem do notebook inteiro, e qual é a diferença entre o histórico de revisões de um notebook e uma pasta Git.\n\nComece pela hierarquia. Uma conta Databricks representa uma única entidade que pode incluir vários workspaces. O workspace é o ambiente para acessar todos os seus ativos Databricks: é nele que você desenvolve, navega e compartilha objetos como notebooks. Trabalho em workspaces diferentes não se mistura por acidente, e é por isso que a prova fala de ativo no nível do workspace e de objeto no nível da conta como coisas distintas.",
                },
                {
                    type: "text",
                    value: "O armazenamento do workspace guarda duas categorias de dado, e a doc separa as duas com cuidado.\n\nO **sistema de arquivos do workspace** guarda os ativos que o usuário cria e gerencia pela interface da Databricks: notebooks, consultas SQL e painéis, alertas, bibliotecas em `.whl` e `.jar`, arquivos Python, arquivos de configuração YAML e outros arquivos pequenos.\n\nO **dado de sistema do workspace** é subproduto da execução, não algo que você escreveu: resultado de consulta SQL e resultado em cache, resultado de execução de job, revisões de notebook, plano de consulta usado para observabilidade e log de cluster.\n\nA distinção parece burocrática, mas ela explica por que revisão de notebook e notebook não são a mesma coisa.",
                },
                {
                    type: "table",
                    value: '[["Categoria","Exemplos que a documentação lista"],["Sistema de arquivos do workspace","Notebooks, consultas SQL e painéis, alertas, bibliotecas .whl e .jar, arquivos Python e YAML"],["Dado de sistema do workspace","Resultado de consulta e cache, resultado de execução de job, revisões de notebook, plano de consulta, log de cluster"]]',
                },
                {
                    type: "text",
                    value: "O notebook é a interface web para criar fluxos de ciência de dados e machine learning, e aceita quatro linguagens: Python, SQL, Scala e R. Ele é feito de células, e cada célula roda de forma independente.\n\nA linguagem padrão do notebook aparece abaixo do nome dele, e você pode trocar essa padrão pelo botão de linguagem. Para uma célula só, existem duas saídas: o botão de linguagem da própria célula ou o comando mágico de linguagem, escrito como `%<linguagem>` na primeira linha da célula. Toda célula usa a linguagem padrão do notebook, a menos que uma dessas duas coisas sobrescreva.",
                },
                {
                    type: "table",
                    value: '[["Comando","O que faz"],["%python, %r, %scala, %sql","Roda a célula na linguagem indicada, ignorando a linguagem padrão do notebook"],["%md","Renderiza o conteúdo da célula como Markdown"],["%sh","Executa comando de shell, somente no nó driver"],["%pip","Instala pacote Python com escopo de notebook"],["%run","Executa outro notebook, importando funções e variáveis dele"],["%fs","Executa comandos de sistema de arquivos do dbutils"]]',
                },
                {
                    type: "code",
                    value: '# Célula 1: roda na linguagem padrão do notebook, que aqui é Python\npedidos = spark.read.table("vendas.bronze.pedidos")\npedidos.printSchema()',
                },
                {
                    type: "code",
                    value: "%sql\n-- Célula 2: o magic na primeira linha troca a linguagem só desta célula\nSELECT status, count(*) AS total\nFROM vendas.bronze.pedidos\nGROUP BY status\nORDER BY total DESC",
                },
                {
                    type: "text",
                    value: "Olhe o exemplo acima com atenção, porque ele esconde uma pegadinha de prova. A segunda célula não usa a variável `pedidos` da primeira: ela lê a tabela pelo nome, no catálogo. Isso não é estilo, é obrigação. A documentação afirma que variáveis e estado são isolados entre os REPLs de linguagens diferentes, e que os REPLs só compartilham estado por recurso externo, como arquivo no DBFS ou objeto no armazenamento.\n\nQuem assume um contexto único por notebook escreve a célula Python que define uma variável e a célula Scala que tenta ler essa variável, e passa a tarde atrás de um erro que a doc já avisou.",
                },
                {
                    type: "quote",
                    value: "A linguagem padrão vale para o notebook inteiro. O magic de linguagem vale só para a célula onde ele aparece, e precisa estar na primeira linha dela.",
                },
                {
                    type: "text",
                    value: 'Revisão automática de notebook resolve o seu arrependimento de ontem, não o trabalho em equipe. Para versionamento de verdade existem as **pastas Git**, que a doc define como um cliente Git visual e uma API que integram repositórios Git dentro do workspace. O nome anterior do recurso era Repos, e o glossário da plataforma ainda registra a pasta Git como "anteriormente Repos".\n\nO que importa saber:\n\n- você cria uma pelo menu **Novo**, opção pasta Git, e ela nasce sob `/Workspace/Users/` mais o seu email, em qualquer profundidade, e você pode ter várias;\n- os caminhos antigos em `/Repos` continuam válidos, e `/Repos` e `/Workspace/Repos` se referem à mesma pasta, então referência de job e de `%run` não precisa mudar; ainda assim a recomendação é criar as novas como pasta Git;\n- pela interface você clona repositório, gerencia branch, commita mudança e resolve conflito de merge, e também existem comandos de Git pela CLI;\n- os tipos de ativo suportados na pasta incluem notebooks, arquivos, consultas, painéis e alertas;\n- notebook é criado em formato `.ipynb` por padrão, e você pode trocar para formato de código fonte nas configurações.',
                },
                {
                    type: "table",
                    value: '[["Pergunta","Histórico de revisões do notebook","Pasta Git"],["Onde o histórico fica","No workspace, como dado de sistema","No repositório Git integrado ao workspace"],["Como se registra uma mudança","Revisão automática do notebook","Commit em um branch, com mensagem"],["Operações oferecidas","Ver e restaurar revisão","Clonar, gerenciar branch, commitar, resolver conflito"],["Alcance","Apenas aquele notebook","Notebooks, arquivos, consultas, painéis e alertas da pasta"]]',
                },
                {
                    type: "text",
                    value: "Falta um habitante do notebook que a prova cita: o assistente de IA da plataforma. O guia do exame o chama de Databricks Assistant, e a documentação atual o apresenta sob o nome **Genie Code**, descrito como o assistente de código e de dados por IA para quem desenvolve e trabalha tecnicamente no workspace Databricks. O glossário vai além e o chama de parceiro de IA autônomo feito para trabalho com dados.\n\nNa prática, ele gera e executa código, constrói pipelines e painéis de AI/BI, depura erro e trabalha direto com tabela, coluna e linhagem do Unity Catalog. Ele aparece em notebook, no editor SQL, no editor de pipelines, em painel de AI/BI e no MLflow, e a conversa continua quando você muda de página.\n\nO detalhe que a prova gosta de cobrar: ele é governado pelas permissões do Unity Catalog, então só acessa dado e só executa operação para a qual você já tem permissão. O assistente não é um atalho para contornar governança.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um notebook tem Python como linguagem padrão. Você precisa rodar uma única célula em SQL, sem mudar a linguagem do notebook. O que você faz?",
                    difficulty: "facil",
                    explanation:
                        "A doc diz que a linguagem padrão aparece abaixo do nome do notebook e que o magic de linguagem na primeira linha da célula troca a linguagem só daquela célula. `%md` renderiza Markdown e `%run` executa outro notebook, nenhum dos dois roda SQL.",
                    options: [
                        {
                            text: "Escreve `%sql` na primeira linha da célula; o magic de linguagem vale só para aquela célula.",
                            isCorrect: true,
                        },
                        {
                            text: "Escreve `%md` na primeira linha da célula; o magic de markdown também aceita consulta SQL dentro.",
                            isCorrect: false,
                        },
                        {
                            text: "Escreve `%run` na primeira linha da célula; o magic executa a consulta em contexto SQL.",
                            isCorrect: false,
                        },
                        {
                            text: "Troca a linguagem padrão do notebook para SQL; não existe magic por célula.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quais destes a documentação classifica como arquivos do workspace, ou seja, ativo que o usuário cria pela interface?",
                    difficulty: "medio",
                    explanation:
                        "A doc separa o sistema de arquivos do workspace, que guarda os ativos criados na interface, de dado de sistema do workspace, que é subproduto de execução: revisão de notebook, resultado de job, plano de consulta e log de cluster. Revisão de notebook engana porque o notebook em si é ativo, mas a revisão é dado de sistema.",
                    options: [
                        {
                            text: "Notebooks, consultas SQL, painéis, alertas, bibliotecas `.whl` e `.jar` e arquivos Python.",
                            isCorrect: true,
                        },
                        {
                            text: "Revisões de notebook, resultado de execução de job, plano de consulta e log de cluster do workspace.",
                            isCorrect: false,
                        },
                        {
                            text: "Tabelas e volumes do Unity Catalog, mais as credenciais de armazenamento do metastore.",
                            isCorrect: false,
                        },
                        {
                            text: "Resultado de consulta em cache, imagem do runtime e métrica de uso do SQL warehouse.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma pasta antiga do workspace está em `/Repos/ana/etl` e um job de produção aponta para esse caminho. O que a documentação diz sobre essa situação?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que os caminhos `/Repos` existentes continuam funcionando e que `/Repos` e `/Workspace/Repos` se referem à mesma pasta, então referência de job e de `%run` não precisa mudar. A recomendação é apenas criar as novas como pasta Git, sob `/Workspace/Users`.",
                    options: [
                        {
                            text: "O caminho continua válido, porque `/Repos` e `/Workspace/Repos` apontam para a mesma pasta, e o job não precisa mudar.",
                            isCorrect: true,
                        },
                        {
                            text: "O caminho deixa de valer, porque `/Repos` foi removido, e o job precisa apontar para `/Workspace/Users` antes de rodar.",
                            isCorrect: false,
                        },
                        {
                            text: "O caminho continua válido só em leitura, porque `/Repos` virou somente leitura e nada mais pode ser commitado nele.",
                            isCorrect: false,
                        },
                        {
                            text: "O caminho deixa de valer para job, porque `/Repos` passou a aceitar apenas referência por `%run` dentro de notebook.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um notebook com células em Python e em Scala, o que a documentação afirma sobre o estado compartilhado entre as duas linguagens?",
                    difficulty: "dificil",
                    explanation:
                        "A doc afirma que variáveis e estado são isolados entre os REPLs de linguagens diferentes e que os REPLs só compartilham estado por recurso externo, como arquivo no DBFS ou objeto no armazenamento. Supor um contexto único por notebook é o erro clássico dessa questão.",
                    options: [
                        {
                            text: "Variáveis e estado são isolados entre os REPLs de linguagens diferentes, e o compartilhamento se dá por recurso externo.",
                            isCorrect: true,
                        },
                        {
                            text: "Variáveis e estado são compartilhados entre os REPLs de linguagens diferentes, porque o notebook mantém um contexto único.",
                            isCorrect: false,
                        },
                        {
                            text: "Variáveis são isoladas, mas o estado de sessão é compartilhado, porque o driver mantém um REPL único por notebook.",
                            isCorrect: false,
                        },
                        {
                            text: "Variáveis e estado são isolados, e o compartilhamento depende de ligar a opção de contexto único no compute.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O assistente de IA da plataforma gera e executa código, constrói pipelines e painéis e depura erro. O que a documentação diz sobre o acesso dele ao dado?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que o assistente é governado pelas permissões do Unity Catalog e só acessa dado e executa operação para a qual você tem permissão. Ele trabalha com tabela, coluna e linhagem do Unity Catalog, então o limite não é o tipo de informação, é a permissão de quem está pedindo.",
                    options: [
                        {
                            text: "Ele é governado pelas permissões do Unity Catalog, então só acessa dado e roda operação que você já tem permissão.",
                            isCorrect: true,
                        },
                        {
                            text: "Ele usa uma credencial de serviço própria, então acessa qualquer tabela do metastore para dar mais contexto à resposta.",
                            isCorrect: false,
                        },
                        {
                            text: "Ele só acessa metadado de tabela e coluna, nunca o dado, porque roda fora da fronteira de rede do workspace.",
                            isCorrect: false,
                        },
                        {
                            text: "Ele exige concessão explícita por notebook, feita pelo administrador, antes de ler qualquer tabela do catálogo.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Compute: all-purpose, job, serverless e SQL warehouse",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escolhe o compute certo com duas perguntas: o trabalho é interativo ou automatizado, e é SQL ou não é. Essa decisão aparece na prova como cenário, e erra quem decora nome em vez de entender o critério.\n\nA primeira divisão é quem administra a máquina. **Compute clássico** se refere aos recursos all-purpose, de jobs e de pipelines do Lakeflow que você cria, configura e gerencia; esses recursos ficam na sua conta de nuvem e não são gerenciados pela Databricks. **Compute serverless** é o oposto: um serviço gerenciado pela Databricks que permite se conectar rapidamente a recursos de computação sob demanda, sem provisionar nenhum recurso de compute na sua conta de nuvem. A Databricks aloca e gerencia os recursos, acelera o tempo de inicialização e de escala, reduz o tempo ocioso e diminui a necessidade de gerenciar compute, além de atualizar o runtime serverless por conta própria.",
                },
                {
                    type: "table",
                    value: '[["Carga de trabalho","Escolha recomendada pela documentação","Alternativa clássica e quando usar"],["Desenvolvimento interativo em notebook","Compute serverless para notebooks","All-purpose clássico, quando precisa de API RDD ou da linguagem R"],["Job e ETL automatizados","Compute serverless para jobs","Job compute clássico, para job não SQL que precisa de ajuste indisponível no serverless"],["Tarefa SQL dentro de um job","SQL warehouse","Nenhuma; a doc manda usar SQL warehouse para tarefa SQL"],["Consulta, BI e painel","SQL warehouse serverless","Pro quando falta serverless ou precisa de rede própria; classic como nível de entrada"],["Pipeline","Compute serverless","Compute clássico de pipeline, para recurso sem suporte no serverless ou com Hive metastore legado"]]',
                },
                {
                    type: "text",
                    value: "Dentro do compute clássico, a diferença entre all-purpose e job é a pergunta de prova mais previsível desta seção, e a doc dá quatro motivos para não misturar os dois:\n\n- **cobrança**: a Databricks cobra pelo compute all-purpose a uma taxa diferente da do job compute;\n- **encerramento**: o job compute termina automaticamente depois que a execução do job termina, enquanto o all-purpose tem encerramento automático ligado à inatividade, não ao fim de uma execução;\n- **latência**: job agendado contra compute all-purpose costuma ter latência maior, por disputa de recurso entre os usuários que compartilham aquele compute;\n- **recomendação**: a doc recomenda não usar compute all-purpose para jobs, e diz que não recomenda essa configuração para jobs de produção.\n\nExiste uma exceção, e ela é estreita: desenvolvimento ou teste iterativo de um job novo, além de job curto que roda com frequência. Fora disso, o substituto recomendado para a maioria dos tipos de tarefa é compute serverless para jobs. Em um job, a Databricks ainda deixa você compartilhar o mesmo job compute entre tarefas, e nesse caso o recurso termina depois que roda a última tarefa configurada para usá-lo; compartilhar reduz a latência associada ao tempo de inicialização.",
                },
                {
                    type: "table",
                    value: '[["Pergunta","All-purpose clássico","Job compute clássico"],["Para que serve","Exploração interativa em notebook, muitas vezes compartilhada entre usuários","Execução das tarefas de um job"],["Como termina","Encerramento automático por inatividade","Automaticamente, ao fim da execução do job"],["Cobrança","Taxa de compute all-purpose","Taxa de job compute, diferente da anterior"],["Latência de job agendado","Maior, por disputa de recurso entre usuários","Menor; compute compartilhado entre tarefas reduz o tempo de partida"]]',
                },
                {
                    type: "quote",
                    value: "Job em compute all-purpose não é erro de sintaxe, é erro de conta: a taxa é outra, o encerramento é por inatividade e a documentação recomenda não fazer isso em produção.",
                },
                {
                    type: "code",
                    value: '# Lista as versões de runtime disponíveis, para preencher spark_version\ndatabricks clusters spark-versions\n\n# autotermination_minutes aceita de 10 a 10000 minutos\n# runtime_engine aceita STANDARD ou PHOTON\ndatabricks clusters create --json \'{\n  "cluster_name": "etl-noturno",\n  "spark_version": "3.3.x-scala2.11",\n  "node_type_id": "i3.xlarge",\n  "autoscale": { "min_workers": 2, "max_workers": 8 },\n  "autotermination_minutes": 30,\n  "runtime_engine": "PHOTON"\n}\'',
                },
                {
                    type: "text",
                    value: "Do lado analítico, o compute se chama **SQL warehouse**: o recurso de computação que permite consultar e explorar dado no Databricks. Ele vem em três tipos, serverless, pro e classic. Se o serverless está habilitado na sua conta, serverless é o padrão, e a doc recomenda usar SQL warehouse serverless quando ele estiver disponível, por entregar compute instantâneo e elástico, menos esforço de administração e custo total menor.\n\nTrês configurações aparecem em questão de cenário:\n\n- **parada automática**, o período de inatividade depois do qual o warehouse para;\n- **tamanho do cluster**, que representa o tamanho do nó driver e o número de nós worker associados ao cluster, com padrão X-Large;\n- **escala**, que define o número mínimo e máximo de clusters usados para uma consulta, com padrão de um mínimo e um máximo; a recomendação é um cluster para cada 10 consultas concorrentes.",
                },
                {
                    type: "table",
                    value: '[["Tipo de SQL warehouse","Parada automática padrão","Mínimo aceito"],["Serverless","10 minutos","5 minutos na interface, 1 minuto pela API"],["Pro","45 minutos","10 minutos"],["Classic","45 minutos","10 minutos"]]',
                },
                {
                    type: "text",
                    value: "Falta o motor. **Photon** é o motor de consulta vetorizado nativo da Databricks que acelera cargas SQL, chamadas da API DataFrame, pipelines de ETL e streaming sem estado. Ele é um runtime nativo em C++ que substitui o motor de execução do Spark SQL baseado em JVM, enquanto o otimizador Catalyst continua planejando a consulta. Vetorizado quer dizer que ele processa dado em lotes de milhares de linhas, o que deixa a CPU aplicar instruções SIMD a vários valores por ciclo. E ele é compatível com as APIs do Apache Spark, então código existente roda sem mudança.\n\nOnde ele já vem ligado: Photon é o motor padrão de todos os SQL warehouses, está habilitado em compute serverless e em pipelines serverless do Lakeflow, e vem habilitado por padrão em all-purpose clássico, job compute e pipelines clássicos, onde você pode desligá-lo.",
                },
                {
                    type: "text",
                    value: "Dois ajustes fecham a aula, porque aparecem na tela de criação e viram questão.\n\nO **modo de acesso** de all-purpose e de job compute determina quem pode se conectar e usar o recurso. O padrão é Auto, que escolhe entre padrão e dedicado conforme runtime e tipo de instância. O modo padrão pode ser usado por vários usuários, com isolamento de dado entre eles, e suporta Python, SQL e Scala. O modo dedicado é atribuído a um único usuário ou grupo e suporta Python, SQL, Scala e R. A doc recomenda o modo padrão, a menos que a funcionalidade que você precisa não tenha suporte nele.\n\nA **versão do Databricks Runtime** sai de uma lista. Para all-purpose, a recomendação é a versão mais atual. Para job compute que roda carga operacional, a recomendação é a versão de suporte de longo prazo, a LTS. Para ciência de dados e machine learning, a recomendação é o runtime de ML.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um ETL em Python roda todas as noites, sempre com a mesma configuração, sem ninguém acompanhando. Qual compute a documentação recomenda primeiro?",
                    difficulty: "facil",
                    explanation:
                        "A doc chama compute serverless para jobs de escolha recomendada para a maioria das cargas automatizadas, por ter menos ajuste, partida mais rápida e escala automática. All-purpose clássico aparece como algo a evitar nesse caso, porque não é otimizado para carga automatizada.",
                    options: [
                        {
                            text: "Compute serverless para jobs, a escolha recomendada para a maioria das cargas automatizadas.",
                            isCorrect: true,
                        },
                        {
                            text: "Compute all-purpose clássico, a escolha recomendada para carga que roda sempre no mesmo horário.",
                            isCorrect: false,
                        },
                        {
                            text: "SQL warehouse serverless, a escolha recomendada para qualquer carga em agenda no workspace.",
                            isCorrect: false,
                        },
                        {
                            text: "Pool de instâncias clássico, a escolha recomendada para carga noturna de longa duração.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sobre a diferença entre compute all-purpose clássico e job compute clássico, qual afirmação está correta?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que o job compute termina automaticamente depois que a execução do job termina, enquanto o all-purpose tem encerramento automático ligado à inatividade, não ao fim da execução. As taxas de cobrança também são diferentes, mas isso não é a única diferença entre os dois.",
                    options: [
                        {
                            text: "O job compute termina sozinho ao fim da execução do job, e o all-purpose encerra por inatividade.",
                            isCorrect: true,
                        },
                        {
                            text: "O all-purpose termina sozinho ao fim da execução do job, e o job compute encerra por inatividade.",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois terminam sozinhos ao fim da execução do job, e a diferença está só na taxa cobrada.",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois encerram apenas por inatividade, e a diferença está só no modo de acesso disponível.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um SQL warehouse serverless foi criado sem alterar nenhum padrão. Depois de quanto tempo sem uso ele para, e qual é o mínimo configurável pela interface?",
                    difficulty: "medio",
                    explanation:
                        "A doc dá o padrão de parada automática por tipo: 10 minutos no serverless, com mínimo de 5 na interface e até 1 minuto pela API, e 45 minutos em pro e classic, com mínimo de 10. Os 45 minutos são o padrão dos tipos clássicos, não do serverless.",
                    options: [
                        {
                            text: "Para em 10 minutos, e o mínimo na interface é 5 minutos, com 1 minuto possível pela API.",
                            isCorrect: true,
                        },
                        {
                            text: "Para em 45 minutos, e o mínimo na interface é 10 minutos, como nos tipos pro e classic do produto.",
                            isCorrect: false,
                        },
                        {
                            text: "Para em 120 minutos, e o mínimo na interface é 10 minutos, igual ao compute all-purpose.",
                            isCorrect: false,
                        },
                        {
                            text: "Não para sozinho, e a parada automática precisa ser ligada à mão depois da criação.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma frase, o que é o Photon e onde ele já vem como motor padrão?",
                    difficulty: "medio",
                    explanation:
                        "A doc define o Photon como o motor de consulta vetorizado nativo da Databricks, um runtime em C++ que substitui a execução do Spark SQL na JVM, e diz que ele é o motor padrão de todos os SQL warehouses. O Catalyst continua planejando a consulta, então o Photon não substitui o otimizador.",
                    options: [
                        {
                            text: "Motor de consulta vetorizado nativo da Databricks, e é o motor padrão de todo SQL warehouse.",
                            isCorrect: true,
                        },
                        {
                            text: "Otimizador de plano que substitui o Catalyst, e é o otimizador padrão de todo SQL warehouse.",
                            isCorrect: false,
                        },
                        {
                            text: "Cache de resultado em memória do driver, e já vem ligado em todo SQL warehouse serverless.",
                            isCorrect: false,
                        },
                        {
                            text: "Runtime de machine learning com bibliotecas pré-instaladas, e já vem ligado no compute de jobs.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job novo tem três tarefas: duas em Python e uma que é apenas uma consulta SQL. O time ainda está desenvolvendo e testando o job de forma iterativa. O que a documentação permite e o que ela recomenda?",
                    difficulty: "dificil",
                    explanation:
                        "A doc abre exceção para all-purpose quando você desenvolve ou testa um job novo de forma iterativa, mas não recomenda isso em produção. Para tarefa SQL ela manda usar SQL warehouse, e para as outras tarefas o substituto recomendado é compute serverless para jobs.",
                    options: [
                        {
                            text: "Permite all-purpose durante o desenvolvimento iterativo, e recomenda SQL warehouse para a tarefa SQL e serverless para as demais.",
                            isCorrect: true,
                        },
                        {
                            text: "Proíbe all-purpose em qualquer caso, e recomenda job compute clássico para a tarefa SQL e serverless para as demais.",
                            isCorrect: false,
                        },
                        {
                            text: "Permite all-purpose durante o desenvolvimento iterativo, e recomenda esse mesmo all-purpose para a tarefa SQL, por ela ser interativa.",
                            isCorrect: false,
                        },
                        {
                            text: "Permite all-purpose em produção quando o job é curto, e recomenda job compute clássico para todas as três tarefas do job.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Databricks SQL e o catálogo no dia a dia",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você percorre o caminho inteiro de quem trabalha com SQL na plataforma: abrir o editor, escrever e salvar a consulta, virar painel e pendurar um alerta em cima. São quatro ativos distintos, e a prova gosta de testar se você sabe qual deles faz o quê.\n\nO nome do produto é **Databricks SQL**, descrito como um data warehouse em nuvem construído sobre a arquitetura lakehouse. Ele não é um banco separado: é a experiência de consulta sobre as mesmas tabelas que o notebook lê, rodando sobre SQL warehouse.",
                },
                {
                    type: "text",
                    value: "O ponto de partida é o **editor SQL**, onde você escreve consulta, colabora com colegas e encontra o dado disponível. O que ele oferece:\n\n- conectar a um SQL warehouse e navegar por catálogos e schemas sem sair da tela;\n- executar consulta de uma ou de várias instruções;\n- visualizar e filtrar resultado, e adicionar widget de parâmetro;\n- personalizar a formatação automática do SQL;\n- compartilhar a consulta com colaboradores e editar junto, em tempo real;\n- revisar as mudanças recentes da consulta, ou seja, histórico de versões;\n- escrever com ajuda de IA e comentário de código.\n\nQuando você volta, o editor reabre na última consulta aberta. Repare que histórico de versões da consulta é coisa diferente de **histórico de consultas**, que registra execuções passadas, tempo de execução e uso de recurso, ao lado do perfil da consulta.",
                },
                {
                    type: "table",
                    value: '[["Ativo","O que é","O que ele entrega"],["Consulta","SQL salvo, executado em um SQL warehouse","Resultado, visualização, parâmetro e histórico de versões"],["Painel de AI/BI","Conjunto de datasets, visualizações, filtros e cálculos","Publicação, agenda de atualização e assinatura por email ou Slack"],["Alerta","Consulta em agenda que avalia uma condição no resultado","Notificação em um destino, quando a condição é atendida"],["Histórico de consultas","Registro das execuções do workspace","Tempo de execução, uso de recurso e perfil da consulta"]]',
                },
                {
                    type: "text",
                    value: "O **painel de AI/BI** é a camada de apresentação. Ele traz autoria assistida por IA e uma biblioteca de visualização ampliada, e a autoria se organiza em datasets, visualizações, filtros, cálculos personalizados e configurações.\n\nA parte que a prova cobra é a distribuição. Quando publicado, o painel pode ser compartilhado com qualquer pessoa registrada na sua conta Databricks, e a publicação pode usar permissão de dado compartilhada ou individual, nos níveis de workspace e de conta. Você configura agenda automática de atualização e assinatura por email ou Slack para painel publicado, e o Lakeflow Jobs também pode agendar a atualização do painel.",
                },
                {
                    type: "text",
                    value: "O **alerta** fecha o ciclo: ele executa a consulta em uma agenda e notifica quando a condição que você definiu é atendida sobre o resultado.\n\nComo se monta a condição: você escolhe uma coluna de valor, um operador e um limite. A condição pode olhar o primeiro valor de uma coluna do resultado ou uma agregação, como soma ou média, sobre todas as linhas de uma única coluna. Antes de salvar, dá para pré-visualizar o resultado com o botão de teste.\n\nComo ele avisa: o administrador cria os destinos de notificação, e os tipos suportados são email, Slack, webhook com autenticação OAuth opcional em Beta, Microsoft Teams e PagerDuty. Você pode receber uma notificação só quando o status muda de OK para disparado, ou a cada avaliação enquanto o alerta estiver disparado. Atualizar o alerta à mão não envia notificação. O assunto e o corpo aceitam variáveis como ALERT_STATUS, ALERT_NAME e QUERY_RESULT_TABLE, e só o destino de email renderiza HTML.\n\nDuas restrições valem decorar: alerta não suporta consulta com parâmetro, e a tarefa de alerta SQL dentro de um job exige SQL warehouse serverless ou pro, sem suporte a alerta legado.",
                },
                {
                    type: "quote",
                    value: "Alerta sem destino de notificação não avisa ninguém: ele é avaliado, muda de status para disparado e fica calado.",
                },
                {
                    type: "code",
                    value: "-- Namespace de três níveis do Unity Catalog: catalogo.schema.objeto\nSELECT status, count(*) AS total\nFROM vendas.bronze.pedidos\nGROUP BY status;\n\n-- Fixar o padrão da sessão encurta a referência no resto do editor\nUSE CATALOG vendas;\nUSE SCHEMA bronze;\n\nSELECT status, count(*) AS total\nFROM pedidos\nGROUP BY status;",
                },
                {
                    type: "text",
                    value: "Nada disso funciona sem o catálogo. O **Unity Catalog** mantém um metastore no nível da conta que registra os metadados, e os ativos de dado e de IA ficam em um namespace de três níveis, escrito como `catalogo.schema.objeto`. O catálogo é o container de nível mais alto para organizar e isolar dado; o schema, também chamado de database, é o nível mais granular dentro dele; e dentro do schema ficam tabela, view, volume, função, modelo e serviço. Alguns objetos ficam direto sob o metastore, como credencial de armazenamento, local externo, conexão e compartilhamento.\n\nPara navegar nisso existe o **Catalog Explorer**, a interface para explorar e gerenciar dado, schemas, tabelas, modelos, funções e outros ativos de IA. Nele você vê detalhe de schema, pré-visualiza dado de amostra, consulta detalhe de tabela e de modelo, cria catálogo e compartilhamento, gerencia local externo, troca o proprietário de um objeto e concede ou revoga permissão em todos os objetos. Você chega lá pelo ícone de dados e depois Catálogo, na barra lateral.",
                },
                {
                    type: "table",
                    value: '[["Nível","O que é","Exemplo de referência"],["Metastore","Metastore no nível da conta que registra os metadados","Guarda também credencial de armazenamento, local externo, conexão e compartilhamento"],["Catálogo","Container de nível mais alto para organizar e isolar dado","vendas"],["Schema","Nível mais granular dentro do catálogo, também chamado de database","vendas.bronze"],["Objeto","Tabela, view, volume, função, modelo ou serviço","vendas.bronze.pedidos"]]',
                },
                {
                    type: "text",
                    value: "Por último, o assistente de IA também mora aqui. Ele roda dentro do editor SQL e dentro do painel de AI/BI, além do notebook, e a conversa segue com você quando muda de página. O guia do exame o chama de Databricks Assistant; a documentação atual usa o nome Genie Code.\n\nNo Catalog Explorer, esse mesmo assistente ajuda na descoberta: gera comentário em objeto, traz linhagem e permite explorar dado de amostra em linguagem natural, em Public Preview. E vale repetir, porque é o tipo de detalhe que decide questão: tudo isso continua governado pelas permissões do Unity Catalog.",
                },
            ],
            questions: [
                {
                    statement:
                        "No Databricks SQL, qual recurso de computação executa a consulta que você escreve no editor?",
                    difficulty: "facil",
                    explanation:
                        "O glossário define SQL warehouse como o recurso de computação que permite consultar e explorar dado no Databricks, e o Databricks SQL roda sobre ele. O plano de controle hospeda backend e aplicação web e não processa dado; o Catalog Explorer é interface de descoberta e governança.",
                    options: [
                        {
                            text: "O SQL warehouse, recurso de computação em que você roda as suas consultas SQL.",
                            isCorrect: true,
                        },
                        {
                            text: "O plano de controle, recurso em que a aplicação web executa as consultas SQL.",
                            isCorrect: false,
                        },
                        {
                            text: "O pool de instâncias, recurso de computação reservado para consultas SQL em fila.",
                            isCorrect: false,
                        },
                        {
                            text: "O Catalog Explorer, recurso da interface que explora e também roda consultas SQL.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um alerta foi criado com condição e agenda, mas nenhum destino de notificação foi escolhido. O que acontece quando a condição é atendida?",
                    difficulty: "medio",
                    explanation:
                        "A doc avisa que, se você não escolher um destino, não será notificado quando o alerta disparar. O alerta continua sendo avaliado e muda de status, só não avisa ninguém. Não existe destino padrão implícito nem fila de notificação guardada para depois.",
                    options: [
                        {
                            text: "O alerta muda de status para disparado, mas ninguém é notificado, porque falta o destino.",
                            isCorrect: true,
                        },
                        {
                            text: "O alerta muda de status para disparado, e o criador recebe email, porque é o destino padrão.",
                            isCorrect: false,
                        },
                        {
                            text: "O alerta não é avaliado, porque a plataforma recusa salvar alerta sem destino configurado.",
                            isCorrect: false,
                        },
                        {
                            text: "O alerta muda de status, e a notificação fica em fila até que um destino seja escolhido.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer encurtar `vendas.bronze.pedidos` para `pedidos` no resto da sessão do editor SQL. Qual sequência faz isso?",
                    difficulty: "medio",
                    explanation:
                        "O namespace do Unity Catalog tem três níveis, `catalogo.schema.objeto`. A referência de linguagem mostra `USE CATALOG` ou `SET CATALOG` para fixar o catálogo e `USE SCHEMA` para o schema da sessão. `USE METASTORE` e `SET TABLE` não existem, e `ALTER` muda o objeto, não o padrão da sessão.",
                    options: [
                        {
                            text: "`USE CATALOG vendas;` e depois `USE SCHEMA bronze;`, que fixam catálogo e schema da sessão.",
                            isCorrect: true,
                        },
                        {
                            text: "`SET CATALOG vendas;` e depois `SET TABLE pedidos;`, que fixam catálogo e tabela da sessão.",
                            isCorrect: false,
                        },
                        {
                            text: "`USE METASTORE vendas;` e depois `USE CATALOG bronze;`, que fixam metastore e catálogo da sessão.",
                            isCorrect: false,
                        },
                        {
                            text: "`ALTER CATALOG vendas;` e depois `ALTER SCHEMA bronze;`, que mudam o padrão da sessão atual.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de publicar um painel de AI/BI, quais opções de distribuição a documentação lista?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que o painel publicado pode ser compartilhado com qualquer pessoa registrada na sua conta Databricks, e que você configura agenda automática de atualização e assinatura por email ou Slack. O Lakeflow Jobs também pode agendar a atualização do painel.",
                    options: [
                        {
                            text: "Compartilhar com quem está registrado na conta, com agenda de atualização e assinatura por email ou Slack.",
                            isCorrect: true,
                        },
                        {
                            text: "Compartilhar apenas dentro do workspace de origem, com agenda de atualização e assinatura por webhook de equipe.",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhar por link público anônimo, com agenda de atualização e assinatura por email ou PagerDuty.",
                            isCorrect: false,
                        },
                        {
                            text: "Compartilhar com quem está registrado na conta, sem agenda; a atualização depende de abrir o painel.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer colocar um alerta SQL como tarefa dentro de um job. Qual restrição de compute a documentação impõe?",
                    difficulty: "dificil",
                    explanation:
                        "A doc da tarefa de alerta SQL diz que é preciso usar SQL warehouse serverless ou pro, e que alerta legado não é suportado nesse tipo de tarefa. O tipo classic de warehouse e o compute all-purpose não entram nessa lista.",
                    options: [
                        {
                            text: "A tarefa de alerta SQL exige SQL warehouse serverless ou pro, e alerta legado não é suportado nela.",
                            isCorrect: true,
                        },
                        {
                            text: "A tarefa de alerta SQL exige SQL warehouse classic ou pro, e alerta legado é o único suportado nela.",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa de alerta SQL exige job compute clássico com Photon, e o SQL warehouse não é aceito nela.",
                            isCorrect: false,
                        },
                        {
                            text: "A tarefa de alerta SQL exige compute all-purpose compartilhado, e qualquer tipo de alerta é aceito nela.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Delta Lake por dentro: transaction log e garantias",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você sabe explicar por que uma leitura em andamento não vê o resultado parcial de uma escrita, e por que essa garantia não depende de nenhum serviço fora do seu armazenamento de objetos. É a base de tudo que vem depois, porque toda tabela da plataforma apoia nela.\n\n**Delta Lake** é a camada de armazenamento otimizada que dá a base para as tabelas de um lakehouse no Databricks. Ele não inventa um formato de arquivo: estende arquivos de dado Parquet com um log de transações baseado em arquivo, e desse log saem a transação ACID e o tratamento escalável de metadado. E ele não é opcional: Delta Lake é o formato padrão para todas as operações no Databricks, e salvo indicação em contrário toda tabela ali é tabela Delta Lake.",
                },
                {
                    type: "text",
                    value: "O log de transações registra as versões da tabela como arquivos JSON, dentro do diretório do log de transações, ao lado do dado da tabela. Esse diretório se chama `_delta_log`, e o `VACUUM` ignora diretório que começa com sublinhado, justamente para não tocar nele.\n\nCom o tempo, reler todo o histórico JSON ficaria caro. Por isso o Delta Lake escreve periodicamente **checkpoints**, que registram o estado do log de transações: as versões da tabela são agregadas em arquivos Parquet de checkpoint, o que melhora o desempenho ao evitar a leitura de todas as versões JSON do histórico. O usuário não precisa interagir com checkpoint diretamente.\n\nDuas frases da doc que valem como regra de ouro: a Databricks recomenda que você evite interagir diretamente com os arquivos de dado e de log de transações nos diretórios do Delta Lake, para não corromper a tabela; e cada transação bem sucedida aparece como uma única entrada no log da tabela, independentemente de quantas instruções rodaram dentro dela.",
                },
                {
                    type: "table",
                    value: '[["O que você vê na pasta da tabela","O que é"],["Arquivos .parquet no nível da pasta","O dado da tabela, em Parquet"],["_delta_log com arquivos .json","Uma versão da tabela por arquivo, na ordem dos commits"],["_delta_log com arquivos .parquet de checkpoint","Versões agregadas, para não reler todo o histórico JSON"]]',
                },
                {
                    type: "text",
                    value: "Agora as quatro garantias, uma por uma, como a documentação descreve:\n\n- **Atomicidade**: por padrão, cada instrução SQL é uma transação atômica própria, e a transação ou tem sucesso, ou falha por completo. O log controla isso: os arquivos de dado são escritos primeiro, e uma entrada nova só é commitada no log quando a transação termina. Arquivo de transação que falhou não afeta o estado da tabela, e o `VACUUM` remove depois.\n- **Consistência**: o Delta Lake usa controle de concorrência otimista. A escrita lê a versão mais recente quando precisa, escreve os arquivos de dado e, no commit, verifica conflito com commits feitos desde o snapshot dela. Sem conflito, commita como versão nova; com conflito, falha com exceção de modificação concorrente, em vez de corromper a tabela.\n- **Isolamento**: escrita usa isolamento write serializable por padrão e leitura usa snapshot isolation. A escrita não toma lock, então deadlock não é possível, e uma escrita pode começar contra a tabela em qualquer momento.\n- **Durabilidade**: arquivo de dado e log de transações ficam no armazenamento de objetos da nuvem, então a tabela herda a garantia de durabilidade daquele armazenamento.",
                },
                {
                    type: "quote",
                    value: "O log de transações é a fonte da verdade. O estado atual da tabela é o conjunto de arquivos de dado que o log marca como válidos, e cada commit cria uma versão nova.",
                },
                {
                    type: "code",
                    value: "-- Operações, usuário e timestamp de cada escrita, em ordem cronológica inversa\nDESCRIBE HISTORY vendas.bronze.pedidos;\n\n-- Só a última operação\nDESCRIBE HISTORY vendas.bronze.pedidos LIMIT 1;\n\n-- Ler uma versão anterior, por número de versão ou por timestamp\nSELECT * FROM vendas.bronze.pedidos VERSION AS OF 123;\nSELECT * FROM vendas.bronze.pedidos TIMESTAMP AS OF '2026-10-01T10:00:00.000Z';\n\n-- A sintaxe com arroba faz o mesmo que VERSION AS OF\nSELECT * FROM vendas.bronze.pedidos@v123;",
                },
                {
                    type: "text",
                    value: "Do log também saem as garantias de schema, que a prova cobra junto com ACID. Na escrita, o Delta Lake valida o schema, o que a doc chama de validação de schema: dado que não bate com o schema declarado é recusado em vez de entrar sujo. Quando a mudança é intencional, existe a **evolução de schema**, para atualizar o schema da tabela. No mesmo grupo de recursos a doc coloca restrição de tabela, coluna gerada e metadado personalizado.\n\nO efeito combinado é o que importa: por o log guardar a versão em que cada arquivo entrou e cada coluna foi declarada, leitura concorrente nunca vê estado intermediário, e mudança de estrutura fica registrada como versão, não como surpresa.",
                },
                {
                    type: "table",
                    value: '[["Propriedade da tabela","O que ela controla","Padrão"],["delta.logRetentionDuration","Por quanto tempo o histórico da tabela é mantido","interval 30 days"],["delta.deletedFileRetentionDuration","O limite que o VACUUM usa para remover arquivo de dado não referenciado pela versão atual","interval 7 days"]]',
                },
                {
                    type: "text",
                    value: "Repare na armadilha dessas duas propriedades. O histórico fica 30 dias por padrão, mas ler uma versão antiga exige que os arquivos de dado daquela versão ainda existam, e o `VACUUM` remove arquivo não referenciado pela versão atual depois de 7 dias por padrão. Entrada de histórico sem arquivo de dado não devolve resultado, então a janela útil de leitura de versão anterior é a menor das duas, não a maior.\n\nPara inspecionar o que existe hoje, `DESCRIBE DETAIL` devolve metadado detalhado da tabela, incluindo `format`, `location`, `numFiles`, `sizeInBytes`, `partitionColumns`, `properties` e `tableFeatures`. E vale fechar com o motivo pelo qual nada disso prende você: o log de transações do Delta Lake tem um protocolo aberto e bem definido, que qualquer sistema pode usar para ler o log.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você cria uma tabela no Databricks com `CREATE TABLE` sem indicar formato. Qual formato a tabela recebe, e o que esse formato adiciona ao Parquet?",
                    difficulty: "facil",
                    explanation:
                        "A doc diz que o Delta Lake é o formato padrão para todas as operações no Databricks e que, salvo indicação em contrário, toda tabela ali é Delta. O que ele acrescenta ao Parquet é um log de transações baseado em arquivo, de onde vêm a transação ACID e o metadado escalável.",
                    options: [
                        {
                            text: "Delta Lake, que estende os arquivos Parquet com um log de transações baseado em arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "Apache Iceberg, que estende os arquivos Parquet com um catálogo de snapshots em memória.",
                            isCorrect: false,
                        },
                        {
                            text: "Parquet puro, que já traz o log de transações embutido no rodapé de cada arquivo de dado.",
                            isCorrect: false,
                        },
                        {
                            text: "Hive, que estende os arquivos Parquet com um índice de partições guardado no metastore.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma escrita longa em uma tabela Delta falha no meio do caminho. Por que nenhuma leitura concorrente vê o dado parcial?",
                    difficulty: "medio",
                    explanation:
                        "O log controla a atomicidade: os arquivos de dado vão para o armazenamento antes, e só quando a transação termina uma entrada nova é commitada no log. Sem essa entrada, os arquivos não fazem parte do estado da tabela, e o `VACUUM` os remove depois. O Delta não toma lock na escrita.",
                    options: [
                        {
                            text: "Os arquivos de dado são escritos primeiro, e a entrada no log só é commitada quando a transação termina.",
                            isCorrect: true,
                        },
                        {
                            text: "Os arquivos de dado ficam em uma área temporária, e só são movidos para a pasta da tabela no momento do commit.",
                            isCorrect: false,
                        },
                        {
                            text: "A escrita toma um lock na tabela, e qualquer leitura espera até a transação liberar esse lock.",
                            isCorrect: false,
                        },
                        {
                            text: "Os arquivos de dado são escritos direto, e um processo de reparo apaga o parcial na próxima leitura.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para que servem os arquivos de checkpoint dentro do diretório do log de transações?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que as versões da tabela são agregadas em arquivos Parquet de checkpoint para melhorar o desempenho, evitando ler todas as versões JSON do histórico, e que o usuário não precisa interagir com checkpoint diretamente. Checkpoint é metadado agregado, não cópia do dado.",
                    options: [
                        {
                            text: "Agregam versões da tabela em Parquet, para evitar a leitura de todas as versões JSON do histórico.",
                            isCorrect: true,
                        },
                        {
                            text: "Guardam uma cópia compactada do dado da tabela, para evitar a leitura dos arquivos Parquet originais.",
                            isCorrect: false,
                        },
                        {
                            text: "Registram o plano de consulta aprovado, para evitar o replanejamento em cada leitura da tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Mantêm o índice de partições da tabela, para evitar a listagem dos diretórios no armazenamento.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é o nível de isolamento padrão de escrita e de leitura em uma tabela Delta no Databricks, e o que isso implica sobre lock?",
                    difficulty: "dificil",
                    explanation:
                        "A doc diz que a escrita usa isolamento write serializable por padrão e a leitura usa snapshot isolation, e que a escrita não toma lock, então deadlock não é possível. O controle de concorrência é otimista: o conflito é verificado no commit, e a escrita conflitante falha com exceção.",
                    options: [
                        {
                            text: "Escrita em write serializable e leitura em snapshot isolation, sem lock, então não existe deadlock.",
                            isCorrect: true,
                        },
                        {
                            text: "Escrita em serializable e leitura em read committed, com lock de tabela durante toda a escrita.",
                            isCorrect: false,
                        },
                        {
                            text: "Escrita em snapshot isolation e leitura em write serializable, sem lock, com retentativa automática.",
                            isCorrect: false,
                        },
                        {
                            text: "Escrita e leitura em read uncommitted, sem lock, com resolução de conflito no fim de cada commit.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sem alterar nenhuma propriedade, por quanto tempo o histórico de uma tabela Delta é mantido e qual é o limite que o `VACUUM` usa para remover arquivo não referenciado pela versão atual?",
                    difficulty: "dificil",
                    explanation:
                        "A doc dá os dois padrões: `delta.logRetentionDuration` controla quanto tempo o histórico é mantido e vale `interval 30 days`, e `delta.deletedFileRetentionDuration` é o limite que o `VACUUM` usa para remover arquivo não referenciado e vale `interval 7 days`. Inverter os dois valores é o erro mais comum.",
                    options: [
                        {
                            text: "Histórico por `interval 30 days` em `delta.logRetentionDuration`, e `interval 7 days` em `delta.deletedFileRetentionDuration`.",
                            isCorrect: true,
                        },
                        {
                            text: "Histórico por `interval 7 days` em `delta.logRetentionDuration`, e `interval 30 days` em `delta.deletedFileRetentionDuration`.",
                            isCorrect: false,
                        },
                        {
                            text: "Histórico por `interval 30 days` em `delta.checkpointRetentionDuration`, e `interval 7 days` em `delta.vacuumRetentionDuration`.",
                            isCorrect: false,
                        },
                        {
                            text: "Histórico sem limite em `delta.logRetentionDuration`, e `interval 30 days` em `delta.deletedFileRetentionDuration`.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Ingestão e carga de dados",
    aulas: [
        {
            titulo: "Ler arquivos: CSV, JSON, Parquet e binaryFile",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha um diretório de arquivos e decide sem hesitar qual formato declarar na leitura, se vale pagar por inferência de schema e o que fazer quando o arquivo nem tem estrutura tabular, como uma imagem ou um PDF.\n\nA porta de entrada é sempre a mesma: `spark.read` para leitura em lote e `spark.readStream` para leitura incremental. O que muda é o formato e as opções. Em SQL, a função de tabela `read_files` faz o mesmo trabalho, e a documentação a recomenda para usuário de SQL, porque ela aceita declaração de schema e opções extras de processamento de arquivo.",
                },
                {
                    type: "code",
                    value: 'df = (spark.read.format("csv")\n  .option("header", "true")\n  .option("inferSchema", "true")\n  .load("/Volumes/meu_catalogo/bronze/arquivos/vendas/"))\n\ndf.printSchema()',
                },
                {
                    type: "text",
                    value: "Os dois padrões do leitor de CSV derrubam muita gente na prova: `header` vale `false` e `inferSchema` vale `false`. Sem `header`, a primeira linha entra como dado e as colunas recebem nome posicional, `_c0`, `_c1` e assim por diante. Sem `inferSchema`, toda coluna sai como string. O separador padrão é a vírgula, na opção `sep`, que também é aceita com o nome `delimiter`.\n\nLigar `inferSchema` cobra o preço de uma passada extra sobre os dados, só para decidir o tipo de cada coluna, antes da leitura que importa. Em pipeline que roda todo dia, declarar o schema na mão sai mais rápido e evita que um lote estranho mude o tipo de uma coluna sem ninguém perceber.",
                },
                {
                    type: "text",
                    value: "Arquivo de texto chega com linha torta, e o leitor tem três comportamentos possíveis na opção `mode`. `PERMISSIVE` é o padrão e preenche com nulo o campo que não deu para interpretar. `DROPMALFORMED` descarta a linha inteira. `FAILFAST` para a leitura ao encontrar dado malformado. No modo permissivo você ainda consegue inspecionar o que entrou torto, apontando `badRecordsPath` ou declarando uma coluna `_corrupt_record` no schema. Se as duas coisas estiverem configuradas, `badRecordsPath` tem precedência.",
                },
                {
                    type: "table",
                    value: '[["Formato","O schema vem no arquivo","Opções que você mais ajusta","Quando usar"],["CSV","Não","`header`, `sep`, `inferSchema`","Extração tabular de sistema legado"],["JSON","Não","`multiLine`, `rescuedDataColumn`","Evento de aplicação com campo aninhado"],["Parquet","Sim, colunar e tipado","Quase nenhuma, o tipo já vem","Camada intermediária e tabela analítica"],["binaryFile","Só os metadados do arquivo","`pathGlobFilter`, `recursiveFileLookup`","Imagem, áudio, PDF, arquivo bruto"]]',
                },
                {
                    type: "code",
                    value: 'eventos = (spark.read\n  .option("multiLine", "true")\n  .format("json")\n  .load("/Volumes/meu_catalogo/bronze/arquivos/eventos/"))\n\neventos.select("id", "cliente.cidade", "cliente.uf").display()',
                },
                {
                    type: "text",
                    value: "Por padrão o leitor de JSON espera um objeto por linha, o arranjo conhecido como JSON delimitado por linha. Quando o arquivo traz um objeto indentado que ocupa várias linhas, `multiLine` precisa ir para `true`, porque o padrão é `false`. Campo aninhado não exige tratamento especial na leitura: ele chega como `struct` e você desce nele com ponto, como em `cliente.cidade`. Lista aninhada chega como `array`, e aí entra `explode` para virar uma linha por item.\n\nParquet carrega o próprio schema, então não existe inferência para discutir: o tipo vem do arquivo. Quando dois arquivos Parquet do mesmo diretório discordam no tipo de uma coluna, o Auto Loader resolve escolhendo o tipo mais largo dos dois. Avro segue a mesma lógica do schema embutido.",
                },
                {
                    type: "code",
                    value: 'imagens = (spark.read.format("binaryFile")\n  .option("pathGlobFilter", "*.jpg")\n  .option("recursiveFileLookup", "true")\n  .load("/Volumes/meu_catalogo/bronze/arquivos/imagens/"))\n\ndisplay(imagens)',
                },
                {
                    type: "table",
                    value: '[["Coluna devolvida pelo `binaryFile`","Tipo","O que traz"],["`path`","string","O caminho do arquivo lido"],["`modificationTime`","timestamp","Data da última alteração, quando o sistema de arquivos informa"],["`length`","long","O tamanho do arquivo em bytes"],["`content`","binary","O conteúdo bruto do arquivo, inteiro"]]',
                },
                {
                    type: "text",
                    value: "`binaryFile` devolve um registro por arquivo, com o conteúdo inteiro na coluna `content`, e é o caminho que a documentação indica para carregar dado de imagem. `pathGlobFilter` filtra por padrão de nome, como `*.jpg`, e mantém a descoberta de partição. `recursiveFileLookup` desce em subdiretório e desliga a descoberta de partição, o que permite ler pasta cujo nome não segue o estilo de partição. A documentação recomenda gravar o resultado em uma tabela Delta, para a leitura seguinte ficar rápida.",
                },
                {
                    type: "code",
                    value: "SELECT * FROM read_files(\n  '/Volumes/meu_catalogo/bronze/arquivos/vendas',\n  format => 'csv',\n  header => true,\n  mode => 'FAILFAST');",
                },
                {
                    type: "text",
                    value: "Fechado o lado da leitura, sobra decidir o que a escrita faz quando o destino já tem dado. É o `mode` do gravador, com quatro valores. `errorifexists`, também aceito como `error`, é o padrão e levanta exceção se já houver dado. `append` acrescenta ao que existe. `overwrite` substitui o conteúdo. `ignore` não escreve nada e também não reclama. Em `saveAsTable` com `append`, se a tabela já existir, o formato e as opções dela é que valem; com `overwrite`, o schema do DataFrame não precisa casar com o schema da tabela que estava lá.",
                },
                {
                    type: "table",
                    value: '[["Valor de `mode`","Quando o destino já tem dado","Uso típico"],["`errorifexists`","Levanta exceção, e é o padrão","Carga que não deveria repetir"],["`append`","Acrescenta ao que já existe","Carga incremental em lote"],["`overwrite`","Substitui o conteúdo do destino","Recarga completa de uma dimensão"],["`ignore`","Sai em silêncio, sem escrever","Semente que só roda na primeira vez"]]',
                },
                {
                    type: "quote",
                    value: "`header` e `inferSchema` nascem em `false`. Se você não disser nada ao ler um CSV, a primeira linha vira dado e todas as colunas viram string.",
                },
            ],
            questions: [
                {
                    statement:
                        'Um arquivo CSV tem o nome das colunas na primeira linha, e você o leu com `spark.read.format("csv").load(caminho)`, sem passar nenhuma opção. O que o DataFrame resultante traz?',
                    difficulty: "facil",
                    explanation:
                        "O padrão de `header` é `false`, então a primeira linha é tratada como dado e as colunas recebem nome posicional. O leitor não detecta o cabeçalho sozinho, que é a armadilha mais tentadora aqui, e também não falha por falta da opção.",
                    options: [
                        {
                            text: "Colunas chamadas `_c0`, `_c1` e assim por diante, com a linha de cabeçalho virando um registro de dado.",
                            isCorrect: true,
                        },
                        {
                            text: "Colunas com o nome correto, porque o leitor de CSV detecta a linha de cabeçalho sozinho por padrão.",
                            isCorrect: false,
                        },
                        {
                            text: "Uma única coluna chamada `value`, porque sem opção o leitor cai no comportamento do formato de texto.",
                            isCorrect: false,
                        },
                        {
                            text: "Um erro de leitura, porque o leitor de CSV exige que a opção `header` seja declarada de forma explícita.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa carregar um diretório de PDFs para uma tabela Delta guardando o conteúdo bruto de cada arquivo. Qual formato de leitura resolve e qual esquema ele devolve?",
                    difficulty: "medio",
                    explanation:
                        "O `binaryFile` devolve um registro por arquivo, com `path`, `modificationTime`, `length` e `content`. O distrator do `text` engana porque também lê arquivo bruto, mas ele quebra o conteúdo em uma linha por linha de texto e não guarda o binário.",
                    options: [
                        {
                            text: "`binaryFile`, que devolve `path`, `modificationTime`, `length` e `content`, um registro por arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "`text`, que devolve uma coluna `value`, com uma linha para cada linha de texto de cada arquivo lido.",
                            isCorrect: false,
                        },
                        {
                            text: "`parquet`, que devolve `path` e `content`, porque ele aceita coluna binária de forma nativa.",
                            isCorrect: false,
                        },
                        {
                            text: "`avro`, que devolve `path`, `length` e `content` a partir do schema embutido em cada arquivo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a contrapartida de ligar `inferSchema` como `true` na leitura em lote de um CSV grande?",
                    difficulty: "medio",
                    explanation:
                        "A inferência obriga o Spark a varrer os dados uma vez só para decidir tipo, antes da leitura que produz o DataFrame. O distrator do limite de linhas engana porque existe amostragem na inferência do Auto Loader, não no leitor em lote de CSV.",
                    options: [
                        {
                            text: "O Spark faz uma passada extra sobre os dados só para decidir o tipo de cada coluna do arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "O Spark passa a ignorar a opção `header`, porque a inferência assume que a primeira linha é dado.",
                            isCorrect: false,
                        },
                        {
                            text: "O Spark converte o arquivo para Parquet em área temporária antes de ler, para acelerar a inferência.",
                            isCorrect: false,
                        },
                        {
                            text: "O Spark limita a leitura às primeiras mil linhas do arquivo e descarta o resto em silêncio.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um lote de CSV chega com linhas truncadas e o time quer que a leitura pare no primeiro registro impossível de interpretar, em vez de gravar nulo. O que configurar?",
                    difficulty: "medio",
                    explanation:
                        "O `FAILFAST` interrompe a leitura ao encontrar dado malformado. O `PERMISSIVE` é mesmo o padrão, mas ele preenche com nulo em vez de levantar exceção, e o `badRecordsPath` desvia o registro torto sem encerrar a consulta.",
                    options: [
                        {
                            text: "A opção `mode` em `FAILFAST`, que interrompe a leitura no primeiro campo que não dá para interpretar.",
                            isCorrect: true,
                        },
                        {
                            text: "A opção `mode` em `PERMISSIVE`, que é o padrão e avisa do problema levantando exceção no fim do estágio.",
                            isCorrect: false,
                        },
                        {
                            text: "A opção `mode` em `DROPMALFORMED`, que descarta a linha torta e aborta se houver mais de uma delas.",
                            isCorrect: false,
                        },
                        {
                            text: "A opção `badRecordsPath`, que desvia a linha torta para um caminho e encerra a consulta em seguida.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Um notebook de carga grava um DataFrame com `mode("ignore")` em um destino que já tem dados. Qual é o resultado da operação?',
                    difficulty: "dificil",
                    explanation:
                        "O `ignore` ignora a operação em silêncio quando já existe dado no destino, sem erro e sem escrita. Quem confunde com `overwrite` lê o nome como se ele ignorasse o dado antigo, e quem confunde com o padrão `errorifexists` espera exceção.",
                    options: [
                        {
                            text: "Nada é escrito e a operação termina sem erro, deixando o destino exatamente como estava antes.",
                            isCorrect: true,
                        },
                        {
                            text: "O conteúdo do destino é substituído pelo DataFrame, porque o `ignore` ignora o dado antigo que já estava lá.",
                            isCorrect: false,
                        },
                        {
                            text: "O DataFrame é acrescentado ao destino, porque o `ignore` ignora a verificação de existência.",
                            isCorrect: false,
                        },
                        {
                            text: "A operação levanta exceção, porque o `ignore` só é válido quando o destino ainda está vazio.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "COPY INTO: carga idempotente em SQL",
            blocks: [
                {
                    type: "text",
                    value: "O cenário é corriqueiro: um diretório recebe arquivo novo todo dia, o time é de SQL e ninguém quer escrever Python. O comando agendado precisa poder rodar de novo sem duplicar o que já entrou. No fim desta aula você escreve esse comando, sabe por que ele não repete trabalho, sabe onde esse registro mora e sabe o que mexer quando você de fato quer reprocessar.\n\n`COPY INTO` carrega dado de um local de arquivo para uma tabela Delta. Os formatos aceitos são CSV, JSON, XML, Avro, ORC, Parquet, texto e arquivo binário.",
                },
                {
                    type: "code",
                    value: "COPY INTO meu_catalogo.bronze.vendas\nFROM '/Volumes/meu_catalogo/bronze/arquivos/vendas'\nFILEFORMAT = CSV\nFORMAT_OPTIONS ('header' = 'true', 'delimiter' = '|');",
                },
                {
                    type: "text",
                    value: "A instrução é idempotente. Os arquivos do local de origem que já foram carregados são pulados nas execuções seguintes, então agendar o mesmo `COPY INTO` de hora em hora carrega só o que é novo. E tem um detalhe que a prova gosta de cobrar: o arquivo já carregado continua sendo pulado mesmo que tenha sido modificado depois da carga. A decisão olha para o arquivo que já entrou, não para o conteúdo dele hoje.",
                },
                {
                    type: "text",
                    value: "Esse registro de quem já entrou não vive no cluster nem na sua sessão. Ele fica junto da tabela de destino, em arquivos de metadados que o próprio `COPY INTO` cria, e é por isso que a idempotência sobrevive a reinício de compute e a troca de SQL warehouse, e é por isso que ela vale por tabela de destino. A partir do Databricks Runtime 15.2, o `VACUUM` limpa os arquivos de metadados criados pelo `COPY INTO` que ninguém mais referencia.\n\nUma exceção vale guardar: arquivo pulado por estar corrompido, com `ignoreCorruptFiles` ligado, não entra nesse registro. Corrigido o arquivo na origem, uma execução seguinte o carrega normalmente.",
                },
                {
                    type: "table",
                    value: '[["Cláusula ou opção","Onde entra","O que faz"],["`force`","`COPY_OPTIONS`","Desliga a idempotência e carrega de novo, o padrão é `false`"],["`mergeSchema`","`COPY_OPTIONS`","Deixa o schema da tabela evoluir para o dado que chega"],["`FILES`","Cláusula própria","Lista de nomes de arquivo, até mil, não combina com `PATTERN`"],["`PATTERN`","Cláusula própria","Padrão glob sobre o diretório, não combina com `FILES`"],["`VALIDATE`","Cláusula própria","Testa a carga sem gravar nenhuma linha na tabela"],["`CREDENTIAL`","Dentro do `FROM`","Credencial nomeada ou credencial temporária em linha"]]',
                },
                {
                    type: "code",
                    value: "COPY INTO meu_catalogo.bronze.vendas\nFROM '/Volumes/meu_catalogo/bronze/arquivos/vendas'\nFILEFORMAT = CSV\nPATTERN = 'corrigidos/vendas_[a-g].csv'\nFORMAT_OPTIONS ('header' = 'true')\nCOPY_OPTIONS ('force' = 'true');",
                },
                {
                    type: "text",
                    value: "`force` em `true` é o botão de reprocessar: a idempotência sai de cena e os arquivos são carregados de novo, tenham entrado antes ou não. O risco é evidente, duplicata na tabela, então o uso sensato é combinar `force` com `FILES` ou `PATTERN` para dizer exatamente qual subconjunto deve voltar. `FILES` aceita até mil nomes de arquivo. `PATTERN` aceita os curingas `?`, `*`, `[abc]`, `[a-z]`, `[^a]` e `{ab,cd}`. As duas cláusulas não andam juntas na mesma instrução.",
                },
                {
                    type: "text",
                    value: "Antes de gravar, dá para ensaiar. `VALIDATE` executa o `COPY INTO` em modo de conferência: ele checa se os arquivos são legíveis, se o schema casa ou pode evoluir, e se as restrições de nulo e de `CHECK` continuam valendo, sem escrever uma linha na tabela. O padrão é validar todas as linhas; com `VALIDATE 100 ROWS` você valida um subconjunto, e a prévia devolvida tem no máximo cinquenta linhas. A cláusula pede Databricks Runtime 10.4 LTS ou acima. É também assim que você descobre quais arquivos do lote estão corrompidos.",
                },
                {
                    type: "code",
                    value: "COPY INTO meu_catalogo.bronze.vendas\nFROM '/Volumes/meu_catalogo/bronze/arquivos/vendas'\nFILEFORMAT = CSV\nVALIDATE 100 ROWS\nFORMAT_OPTIONS ('header' = 'true');",
                },
                {
                    type: "text",
                    value: "Para quando você não conhece o schema de antemão existe o atalho da tabela sem colunas: cria-se a tabela vazia e o primeiro `COPY INTO` com `mergeSchema` em `true` dentro de `COPY_OPTIONS` descobre as colunas e as grava na tabela. Enquanto esse primeiro carregamento não acontece, a tabela não aceita `INSERT INTO` nem `MERGE INTO`. Quando todos os arquivos de origem têm o mesmo schema, a documentação recomenda deixar `mergeSchema` em `false` dentro de `FORMAT_OPTIONS`, que já é o padrão.",
                },
                {
                    type: "code",
                    value: "CREATE TABLE IF NOT EXISTS meu_catalogo.bronze.reservas;\n\nCOPY INTO meu_catalogo.bronze.reservas\nFROM '/Volumes/meu_catalogo/bronze/arquivos/reservas'\nFILEFORMAT = JSON\nFORMAT_OPTIONS ('mergeSchema' = 'true', 'multiLine' = 'true')\nCOPY_OPTIONS ('mergeSchema' = 'true');",
                },
                {
                    type: "text",
                    value: "Nem todo diretório precisa de carga. Se o dado já está em Parquet no lugar certo e você só quer o log de transações do Delta por cima dele, o comando é `CONVERT TO DELTA`, que converte a tabela Parquet existente no próprio lugar: ele lista todos os arquivos do diretório, cria um log de transações do Delta que rastreia esses arquivos e infere o schema do dado. `NO STATISTICS` pula a coleta de estatística e termina a conversão mais rápido. Quando você passa um caminho em vez de um nome de tabela, `PARTITIONED BY` é obrigatório para dado particionado. O comando também aceita diretório Iceberg, e aí só a forma de caminho vale.",
                },
                {
                    type: "code",
                    value: "CONVERT TO DELTA meu_catalogo.bronze.vendas_parquet;\n\nCONVERT TO DELTA parquet.`s3://meu-bucket/caminho/vendas`\nPARTITIONED BY (data DATE);",
                },
                {
                    type: "text",
                    value: "Um recado da própria documentação para fechar: para uma experiência de ingestão de arquivo mais escalável e robusta, a Databricks recomenda que o usuário de SQL use streaming tables. O `COPY INTO` continua útil quando o volume de arquivo é modesto ou quando você precisa recarregar um subconjunto escolhido, mas ele não é mais o caminho padrão sugerido para carga de arquivo em SQL.",
                },
                {
                    type: "quote",
                    value: "Arquivo já carregado é pulado, e continua pulado mesmo que você o tenha alterado depois. Para carregar de novo, `COPY_OPTIONS ('force' = 'true')`.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um job agenda o mesmo `COPY INTO` a cada hora sobre o mesmo diretório, sem nada em `COPY_OPTIONS`. O diretório recebeu dois arquivos novos na última hora. O que a execução carrega?",
                    difficulty: "facil",
                    explanation:
                        "A instrução é idempotente: arquivo já carregado é pulado nas execuções seguintes, então só os dois novos entram. O distrator do estado engana porque esse registro existe sem você pedir nada, não depende de `COPY_OPTIONS`.",
                    options: [
                        {
                            text: "Só os dois arquivos novos, porque os arquivos que já foram carregados antes são pulados.",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os arquivos do diretório, porque sem `COPY_OPTIONS` o comando não guarda estado nenhum.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum arquivo, porque o comando exige `force` para carregar depois da primeira execução.",
                            isCorrect: false,
                        },
                        {
                            text: "Todos os arquivos alterados desde a última execução, comparando a data de modificação deles.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um arquivo que já entrou pelo `COPY INTO` foi corrigido na origem e precisa ser carregado de novo na mesma tabela. Qual mudança no comando faz esse arquivo voltar a ser processado?",
                    difficulty: "medio",
                    explanation:
                        "Só `force` em `COPY_OPTIONS` desliga a idempotência e recarrega arquivo já visto. O `mergeSchema` engana porque também fica em `COPY_OPTIONS`, mas ele trata de evolução de schema e não interfere no registro de arquivo já carregado.",
                    options: [
                        {
                            text: "Acrescentar `COPY_OPTIONS ('force' = 'true')`, que desliga a idempotência da instrução.",
                            isCorrect: true,
                        },
                        {
                            text: "Acrescentar `FORMAT_OPTIONS ('mergeSchema' = 'true')`, que reabre o arquivo e relê o schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Acrescentar `VALIDATE ALL`, que revalida os arquivos da origem e recarrega os divergentes.",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar `VACUUM` na tabela antes, para apagar o registro dos arquivos já carregados.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de uma carga com `COPY INTO`, alguém sobrescreveu na origem um arquivo que já havia sido carregado, mantendo o mesmo nome. Sem `force`, o que a execução seguinte faz com ele?",
                    difficulty: "medio",
                    explanation:
                        "A documentação é explícita: o arquivo já carregado é pulado mesmo tendo sido modificado depois da carga. Quem imagina comparação de data de modificação cai no distrator mais tentador, porque esse comportamento parece o mais útil.",
                    options: [
                        {
                            text: "Ele é pulado, porque arquivo já carregado continua pulado mesmo tendo sido modificado depois.",
                            isCorrect: true,
                        },
                        {
                            text: "Ele é recarregado, porque o comando compara a data de modificação com a da carga anterior.",
                            isCorrect: false,
                        },
                        {
                            text: "Ele é recarregado e as linhas antigas são substituídas, porque o nome do arquivo é a chave.",
                            isCorrect: false,
                        },
                        {
                            text: "A instrução falha com erro de conflito e pede `force` para resolver a divergência do arquivo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O time quer saber se um lote novo de CSV entra sem violar as restrições da tabela de destino, mas sem gravar nada ainda. Qual recurso do `COPY INTO` entrega esse ensaio?",
                    difficulty: "dificil",
                    explanation:
                        "A cláusula `VALIDATE` checa leitura, schema e restrições de nulo e de `CHECK` sem escrever linha nenhuma. O `mergeSchema` engana porque também mexe com schema, mas ele serve para evoluir a tabela durante a carga, não para ensaiar.",
                    options: [
                        {
                            text: "A cláusula `VALIDATE`, que testa leitura, schema e restrições sem escrever na tabela.",
                            isCorrect: true,
                        },
                        {
                            text: "A opção `ignoreCorruptFiles`, que lê o lote e aponta os arquivos que violam a tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "A cláusula `FILES`, que limita a carga a um arquivo de amostra e descarta o resultado.",
                            isCorrect: false,
                        },
                        {
                            text: "A opção `mergeSchema`, que compara o schema do lote com o da tabela e aborta se diferir.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretório no armazenamento já guarda uma tabela Parquet particionada por data, e o time quer o log de transações do Delta por cima dela, sem reescrever os arquivos. Qual comando resolve?",
                    difficulty: "dificil",
                    explanation:
                        "O `CONVERT TO DELTA` lista os arquivos do diretório, cria o log de transações sobre eles e infere o schema, no próprio lugar. Passando caminho em vez de nome de tabela, `PARTITIONED BY` é obrigatório. O `COPY INTO` engana porque ele leria e reescreveria tudo.",
                    options: [
                        {
                            text: "`CONVERT TO DELTA` no caminho, com `PARTITIONED BY`, que cria o log sobre os arquivos existentes.",
                            isCorrect: true,
                        },
                        {
                            text: "`COPY INTO` com `FILEFORMAT = PARQUET`, que registra os arquivos existentes como tabela Delta.",
                            isCorrect: false,
                        },
                        {
                            text: "`CREATE TABLE USING DELTA LOCATION`, que adota o diretório e converte o Parquet na primeira leitura.",
                            isCorrect: false,
                        },
                        {
                            text: "`OPTIMIZE` com `ZORDER BY data`, que reescreve o diretório no formato Delta e cria o log para ele.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Auto Loader: descoberta de arquivo e checkpoint",
            blocks: [
                {
                    type: "text",
                    value: "Pense em um bucket que recebe trinta mil arquivos pequenos por hora. Listar o diretório inteiro a cada execução, para descobrir o que é novo, deixa de funcionar bem antes do fim do primeiro dia. O Auto Loader existe para esse problema: ele processa arquivo novo conforme ele chega ao armazenamento de objeto, sem configuração extra, e também dá conta de fazer o backfill do que já estava lá. No fim desta aula você escreve a leitura, escolhe o modo de descoberta de arquivo com argumento e sabe exatamente o que o checkpoint guarda.",
                },
                {
                    type: "code",
                    value: 'caminho_ckpt = "/Volumes/meu_catalogo/bronze/ckpt/pedidos"\n\n(spark.readStream\n  .format("cloudFiles")\n  .option("cloudFiles.format", "json")\n  .option("cloudFiles.schemaLocation", caminho_ckpt)\n  .load("s3://meu-bucket/pedidos/")\n  .writeStream\n  .option("checkpointLocation", caminho_ckpt)\n  .trigger(availableNow=True)\n  .toTable("meu_catalogo.bronze.pedidos"))',
                },
                {
                    type: "text",
                    value: 'Repare no detalhe que mais cai na prova: o formato passado para `format()` não é `json`, é `cloudFiles`. O Auto Loader é uma fonte de Structured Streaming chamada `cloudFiles`, e o formato real do arquivo vai na opção `cloudFiles.format`, que é obrigatória e não tem valor padrão. Os valores aceitos são `avro`, `binaryFile`, `csv`, `json`, `orc`, `parquet`, `text` e `xml`. Trocar as duas coisas de lugar é o erro clássico: escrever `format("json")` usa a fonte comum de arquivo do Spark, e você perde o Auto Loader inteiro sem receber nenhum aviso.',
                },
                {
                    type: "text",
                    value: "Descobrir qual arquivo é novo é o trabalho mais caro da ingestão de arquivo, e o Auto Loader faz isso de dois jeitos. Na listagem de diretório ele lista o caminho de entrada e compara com o que já processou; é o modo padrão, e desde o Databricks Runtime 9.1 ele consegue detectar ordenação lexical para cortar chamada de API. No modo de notificação ele consome eventos de arquivo de serviços de notificação e de fila da sua conta de nuvem, e não precisa listar nada. A documentação recomenda o modo de notificação com file events para a maioria das cargas, e diz que quem usa listagem hoje ganha bastante performance migrando.",
                },
                {
                    type: "table",
                    value: '[["Critério","Listagem de diretório","Notificação com file events"],["Como acha o arquivo","Lista o diretório de entrada","Lê evento de uma fila de notificação"],["É o padrão","Sim","Não, precisa ser ligado na opção"],["Permissão","Só acesso ao dado no armazenamento","Nenhuma a mais, se o external location tiver file events"],["Escala","Fica mais lento conforme o diretório cresce","Mais performático e escalável"],["Requisito","Funciona também em runtime antigo","Databricks Runtime 14.3 LTS ou acima"],["Quando ganha","Começo rápido e permissão restrita","Maioria das cargas, e volume alto de arquivo"]]',
                },
                {
                    type: "text",
                    value: "O modo de notificação não sai de graça, e é aqui que a prova aperta. Na forma clássica, ligada com `cloudFiles.useNotifications` em `true`, o Auto Loader cria um serviço de notificação e uma fila para cada stream, dentro da sua conta de nuvem. No S3 são um tópico do AWS SNS e uma fila do AWS SQS, com nome começando em `databricks-auto-ingest`, e o limite é de cem por bucket do S3. No ADLS são Azure Event Grid e Azure Queue Storage, com prefixo `databricks`, e o limite é de quinhentos por conta de armazenamento. No GCS é o Google Pub/Sub, com limite de cem por bucket. Esses recursos entram na sua fatura, e o Auto Loader não os remove sozinho quando o stream morre: a limpeza é manual, pelo console da nuvem ou pela API de gerenciamento de recurso de nuvem.",
                },
                {
                    type: "text",
                    value: "A forma recomendada hoje é outra: file events no external location do Unity Catalog, ligados com `cloudFiles.useManagedFileEvents` em `true`. Aí uma única fila de notificação atende todos os streams daquele external location, a Databricks cria as inscrições por você e você não precisa fornecer credencial extra. O preço de entrada é Unity Catalog, permissão para criar storage credential e external location, e Databricks Runtime 14.3 LTS ou acima. Duas pegadinhas: `useNotifications`, `useIncremental`, `cloudFiles.fetchParallelism`, `cloudFiles.backfillInterval`, `cloudFiles.pathRewrites` e `resourceTags` não são suportados nesse modo, e o Auto Loader precisa ser chamado pelo menos uma vez a cada sete dias, senão o cache de arquivo expira e ele volta a listar o diretório inteiro.",
                },
                {
                    type: "code",
                    value: '# Recomendado: file events no external location do Unity Catalog\n.option("cloudFiles.useManagedFileEvents", "true")\n\n# Clássico: um serviço de notificação e uma fila por stream, na sua conta\n.option("cloudFiles.useNotifications", "true")',
                },
                {
                    type: "text",
                    value: "Os dois modos dependem da mesma memória: o checkpoint. O Auto Loader guarda os metadados do arquivo descoberto em um RocksDB, um armazenamento de chave e valor, dentro do local de checkpoint, e é esse registro que garante o processamento exactly-once. Depois de uma falha, o Auto Loader retoma do checkpoint e você não precisa gerenciar estado nenhum na mão. Além dos arquivos descobertos, o checkpoint do Structured Streaming guarda o offset processado em cada micro-lote, o commit de cada micro-lote entregue ao destino, o estado dos operadores com estado e o identificador único da consulta.",
                },
                {
                    type: "table",
                    value: '[["O que o checkpoint guarda","Para que serve"],["Metadados do arquivo descoberto, em RocksDB","Não processar de novo arquivo que já entrou"],["Offset de cada micro-lote","Retomar a leitura no ponto exato depois de falha"],["Commit de cada micro-lote","Sustentar a garantia exactly-once no destino"],["Estado dos operadores com estado","Continuar agregação, junção e deduplicação"],["Identificador único da consulta","Amarrar o progresso àquela consulta de streaming"]]',
                },
                {
                    type: "text",
                    value: "Daí sai a consequência que a prova adora. Se você apagar os arquivos do diretório de checkpoint, ou apontar a consulta para um local de checkpoint novo, a consulta começa do zero na próxima execução: ela não retoma de onde parou. Como `cloudFiles.includeExistingFiles` já vem em `true`, isso significa reler o diretório de entrada todo e, muito provavelmente, duplicar linha na tabela de destino. Saem duas regras práticas: cada consulta tem o seu próprio local de checkpoint, nunca compartilhado com outra, e esse local não deve ficar sob política de ciclo de vida do armazenamento, que apagaria o checkpoint por conta própria.\n\nO estado também não cresce para sempre. `cloudFiles.maxFileAge` expira evento de arquivo antigo para limitar esse crescimento, com mínimo de quatorze dias, e a Databricks sugere um valor conservador, da ordem de noventa dias, porque apertar demais causa ingestão duplicada ou arquivo não lido.",
                },
                {
                    type: "text",
                    value: "Ingestão incremental não obriga a deixar um stream ligado para sempre. `trigger(availableNow=True)` consome tudo o que estiver disponível como um lote incremental e encerra a consulta, que é exatamente o que um job agendado quer: o Auto Loader roda no Lakeflow Jobs como job em lote, processa o que chegou desde a última vez e para de consumir compute. A documentação recomenda `Trigger.AvailableNow` para toda carga incremental em lote, e `Trigger.Once` está marcado como obsoleto desde o Databricks Runtime 11.3 LTS. Em compute serverless só `Trigger.AvailableNow` e `Trigger.Once` são suportados, com recomendação para o primeiro. E se você não declarar gatilho nenhum, o Structured Streaming usa intervalo de processamento zero e procura dado novo a cada poucos milissegundos, o que gera muita chamada de API no armazenamento e cobrança inesperada.",
                },
                {
                    type: "table",
                    value: '[["Gatilho","Sintaxe em Python","Comportamento"],["Padrão, sem gatilho declarado","Nada declarado","Intervalo zero, procura dado a cada poucos milissegundos"],["Intervalo fixo","`.trigger(processingTime=\'10 seconds\')`","Um micro-lote a cada intervalo declarado"],["Disponível agora","`.trigger(availableNow=True)`","Processa o disponível como lote incremental e encerra"],["Tempo real","`.trigger(realTime=\'5 minutes\')`","Latência abaixo de um segundo, para carga operacional"]]',
                },
                {
                    type: "text",
                    value: "Do lado da escrita, o modo de saída só importa para stream com estado e com agregação: em stream sem estado os três modos se comportam igual. O padrão é `append`, em que o operador emite apenas a linha que não vai mudar em gatilho seguinte. `update` emite a linha que mudou naquele gatilho, mesmo que ela ainda possa mudar depois. `complete` emite toda linha de resultado já produzida e só funciona com agregação de stream. O Delta Lake, que sustenta toda tabela gerenciada do Unity Catalog, aceita `append` e `complete`, mas não aceita `update`.",
                },
                {
                    type: "text",
                    value: "O mesmo Auto Loader aparece dentro do Lakeflow pipelines, a implementação da Databricks que estende o framework aberto Apache Spark Declarative Pipelines, e aí a conta fica mais simples: a Databricks gerencia as configurações de schema e de checkpoint por você. Em SQL você escreve uma streaming table que lê de `STREAM read_files(...)`, e a função `read_files` passa a usar Auto Loader por baixo quando aparece em consulta de streaming table. A palavra-chave `STREAM` é obrigatória para a leitura ser incremental.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE meu_catalogo.bronze.pedidos\nAS SELECT * FROM STREAM read_files(\n  's3://meu-bucket/pedidos/',\n  format => 'json',\n  multiLine => true);",
                },
                {
                    type: "quote",
                    value: "O formato é `cloudFiles` e o formato do arquivo vai em `cloudFiles.format`. Apagar o checkpoint faz a consulta começar do zero, não retomar de onde parou.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o valor correto para `format()` em uma leitura com Auto Loader, e onde vai o formato real do arquivo?",
                    difficulty: "facil",
                    explanation:
                        'O Auto Loader é a fonte `cloudFiles`, e o formato do arquivo vai na opção `cloudFiles.format`, que é obrigatória. Escrever `format("json")` é a armadilha: funciona, mas usa a fonte comum de arquivo do Spark e abandona o Auto Loader.',
                    options: [
                        {
                            text: '`format("cloudFiles")`, com o formato do arquivo declarado na opção `cloudFiles.format`.',
                            isCorrect: true,
                        },
                        {
                            text: '`format("json")`, com a fonte do Auto Loader declarada na opção `cloudFiles.source`.',
                            isCorrect: false,
                        },
                        {
                            text: '`format("autoLoader")`, com o formato do arquivo declarado na opção `cloudFiles.format`.',
                            isCorrect: false,
                        },
                        {
                            text: '`format("cloudFiles")`, com o formato do arquivo deduzido do primeiro arquivo que for lido.',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um stream do Auto Loader foi criado sem nenhuma opção ligada à descoberta de arquivo. Como ele encontra arquivo novo no caminho de entrada?",
                    difficulty: "medio",
                    explanation:
                        "A listagem de diretório é o modo padrão do Auto Loader. A notificação com file events é a recomendada pela documentação, e essa é a armadilha: ser recomendada não a torna o padrão, ela precisa ser ligada em uma opção.",
                    options: [
                        {
                            text: "Por listagem de diretório, o modo padrão, listando o caminho de entrada a cada gatilho.",
                            isCorrect: true,
                        },
                        {
                            text: "Por notificação com file events, que é o modo padrão desde o Databricks Runtime 14.3 LTS.",
                            isCorrect: false,
                        },
                        {
                            text: "Por notificação clássica, criando um tópico SNS e uma fila SQS na primeira execução.",
                            isCorrect: false,
                        },
                        {
                            text: "Por leitura do log de transações do Delta do caminho de entrada, sem listar arquivo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Para resolver um erro, alguém apagou o conteúdo do diretório de checkpoint de um stream do Auto Loader e reiniciou a consulta. O que acontece na execução seguinte?",
                    difficulty: "medio",
                    explanation:
                        "Apagar o checkpoint, ou apontar para um local novo, faz a consulta começar do zero. Com `cloudFiles.includeExistingFiles` no padrão `true`, ela relê o diretório e duplica linha. Esperar retomada engana porque o registro só existe no checkpoint.",
                    options: [
                        {
                            text: "A consulta começa do zero e relê o diretório de entrada, podendo duplicar linha no destino.",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta retoma do último arquivo processado, porque o registro fica na tabela de destino.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha ao iniciar, porque o Auto Loader exige um checkpoint íntegro para abrir.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta processa só o arquivo criado depois do reinício, ignorando todo o histórico.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Ligar `cloudFiles.useNotifications` em `true` para muitos streams sobre o mesmo bucket do S3 traz qual consequência nos recursos de nuvem?",
                    difficulty: "dificil",
                    explanation:
                        "No modo de notificação clássico cada stream recebe um tópico SNS e uma fila SQS próprios, com limite de cem por bucket do S3, e esses recursos não são removidos sozinhos. A fila única por origem é o comportamento dos file events, não o do modo clássico.",
                    options: [
                        {
                            text: "Cada stream ganha um tópico SNS e uma fila SQS próprios, com limite de cem por bucket.",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os streams passam a dividir uma única fila SQS por bucket, sem limite declarado.",
                            isCorrect: false,
                        },
                        {
                            text: "O Auto Loader deixa de usar recurso de nuvem e passa a ler o log de eventos do próprio S3.",
                            isCorrect: false,
                        },
                        {
                            text: "Cada stream ganha uma fila SQS, mas a Databricks a remove sozinha quando o stream para.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job diário precisa ingerir com Auto Loader só o que chegou desde a execução anterior e depois encerrar, sem deixar compute ligado. Qual gatilho atende?",
                    difficulty: "dificil",
                    explanation:
                        "O `availableNow` consome o disponível como lote incremental e encerra a consulta, que é o recomendado para carga incremental em lote. Não declarar gatilho é a armadilha: o padrão usa intervalo zero e fica rodando, gerando chamada de API sem parar.",
                    options: [
                        {
                            text: "`.trigger(availableNow=True)`, que processa o disponível como lote incremental e encerra.",
                            isCorrect: true,
                        },
                        {
                            text: "`.trigger(processingTime='24 hours')`, que roda um micro-lote por dia e encerra depois dele.",
                            isCorrect: false,
                        },
                        {
                            text: "`.trigger(continuous='1 second')`, que mantém latência baixa e encerra ao esgotar a fonte.",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum gatilho, porque sem declaração o Structured Streaming roda um lote único e encerra.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Auto Loader: schema, evolução e dados resgatados",
            blocks: [
                {
                    type: "text",
                    value: "Na segunda-feira o time da aplicação acrescenta um campo no evento JSON e não avisa ninguém. O que a sua ingestão faz? Quebra, ignora a coluna nova, cria a coluna ou joga o valor em um canto para você olhar depois? As quatro respostas são possíveis, e qual delas acontece depende de uma única opção. No fim desta aula você escolhe essa opção conscientemente e sabe onde foi parar o dado que não casou com o schema.",
                },
                {
                    type: "text",
                    value: "Para inferir schema, o Auto Loader precisa de um lugar onde guardar o schema inferido e as mudanças seguintes: é a opção `cloudFiles.schemaLocation`, que pode ser o mesmo diretório do checkpoint. Em uma carga com várias origens, cada origem precisa do seu próprio checkpoint. A inferência amostra os primeiros 50 GB ou os primeiros mil arquivos, o limite que vier primeiro, e os dois números são ajustáveis pelas configurações do Spark SQL `spark.databricks.cloudFiles.schemaInference.sampleSize.numBytes` e `spark.databricks.cloudFiles.schemaInference.sampleSize.numFiles`.",
                },
                {
                    type: "code",
                    value: '(spark.readStream\n  .format("cloudFiles")\n  .option("cloudFiles.format", "json")\n  .option("cloudFiles.schemaLocation", "/Volumes/meu_catalogo/bronze/ckpt/eventos")\n  .option("cloudFiles.inferColumnTypes", "true")\n  .load("s3://meu-bucket/eventos/"))',
                },
                {
                    type: "text",
                    value: "O tipo que sai da inferência é a segunda pegadinha da aula. Para JSON, CSV e XML, o Auto Loader infere toda coluna como string, inclusive os campos aninhados do JSON. Isso é de propósito: evita que um lote com valor estranho mude o tipo de uma coluna e quebre o pipeline. Se você quer tipo de verdade, ligue `cloudFiles.inferColumnTypes` em `true`, porque o padrão é `false`, e a inferência passa a se parecer com a do leitor comum do Spark. Para Avro e Parquet o tipo vem do schema embutido no arquivo, e em conflito entre arquivos Parquet o Auto Loader escolhe o tipo mais largo. A inferência de CSV assume que existe cabeçalho; se os seus arquivos não têm, passe `header` em `false`.",
                },
                {
                    type: "text",
                    value: "Entre não dizer nada e declarar o schema inteiro existe um meio-termo: `cloudFiles.schemaHints`. Você escreve, na sintaxe de tipo do SQL, só as colunas cujo tipo inferido não serve, e o resto continua sendo inferido. As dicas valem apenas quando você não fornece um schema, e funcionam com `cloudFiles.inferColumnTypes` ligado ou desligado.",
                },
                {
                    type: "code",
                    value: '.option("cloudFiles.schemaHints", "data DATE, valor DECIMAL(12,2), versao INT")',
                },
                {
                    type: "text",
                    value: "Resolvido o tipo, falta decidir o que fazer com a coluna que aparece amanhã. Quem decide é `cloudFiles.schemaEvolutionMode`, e o padrão depende de você: quando você não fornece schema, o padrão é `addNewColumns`; quando fornece, o padrão é `none`.",
                },
                {
                    type: "table",
                    value: '[["Valor de `cloudFiles.schemaEvolutionMode`","O que ele faz com a coluna nova"],["`addNewColumns`","Adiciona a coluna e falha o stream com `UnknownFieldException`; o reinício retoma"],["`addNewColumnsWithTypeWidening`","Igual ao anterior, e ainda alarga tipo suportado, como `int` para `long`"],["`rescue`","Nunca evolui o schema nem falha; a coluna nova cai no dado resgatado"],["`failOnNewColumns`","Falha o stream até você atualizar o schema ou remover o arquivo ofensor"],["`none`","Ignora a coluna nova e segue sem falhar"]]',
                },
                {
                    type: "text",
                    value: "O comportamento de `addNewColumns` incomoda quem vê pela primeira vez: a coluna é adicionada e o stream falha, de propósito, com `UnknownFieldException`. É o reinício que faz a carga seguir com o schema novo. Por isso a Databricks recomenda rodar stream sob o Lakeflow Jobs, que reinicia a consulta automaticamente depois de uma mudança de schema. Vale notar que `addNewColumns` não é aceito quando você fornece o schema direto, mas funciona se você passar esse schema como dica em `cloudFiles.schemaHints`. O modo `addNewColumnsWithTypeWidening` está em Public Preview no Databricks Runtime 16.4 e acima.",
                },
                {
                    type: "text",
                    value: "A coluna de dado resgatado é a rede de segurança. Ela se chama `_rescued_data` por padrão, e a opção `rescuedDataColumn` serve para renomeá-la ou para incluí-la em um schema que você forneça. Três coisas caem nela: coluna que não existe no schema, valor cujo tipo não casa com o tipo da coluna e nome que difere do schema apenas na caixa das letras. O conteúdo é um documento JSON com os valores resgatados e o caminho do arquivo de origem, então nada se perde em silêncio. Registro de Avro ou JSON que só tem struct vazio também é resgatado, porque Parquet não guarda struct vazio.",
                },
                {
                    type: "table",
                    value: '[["Situação no arquivo que chega","O que acontece com o valor"],["Coluna que não está no schema","Vai para a coluna de dado resgatado"],["Tipo divergente do tipo da coluna","Vai para a coluna de dado resgatado"],["Nome igual com caixa de letra diferente","Vai para a coluna de dado resgatado"],["JSON incompleto ou malformado de verdade","Aí sim valem `DROPMALFORMED` e `FAILFAST`"]]',
                },
                {
                    type: "text",
                    value: "Essa última linha da tabela é a distinção que a prova cobra: divergência de tipo não faz o registro cair em `DROPMALFORMED` nem levantar erro em `FAILFAST` quando `rescuedDataColumn` está configurado. Esses dois modos agem apenas sobre JSON incompleto ou malformado de verdade, e o mesmo vale para `badRecordsPath`. Se o caminho do arquivo dentro da coluna resgatada incomoda, dá para desligá-lo com a configuração `spark.databricks.sql.rescuedDataColumn.filePath.enabled` em `false`.\n\nDois acabamentos. Por padrão, colunas que diferem só na caixa, como `abc`, `Abc` e `ABC`, são tratadas como uma só; `readerCaseSensitive` em `false` faz a leitura ignorar a caixa de vez. E partição no estilo Hive, como `evento=clique` dentro do caminho, é inferida do próprio caminho, mas coluna de partição nova não entra na evolução de schema a menos que você a liste em `cloudFiles.partitionColumns`.",
                },
                {
                    type: "code",
                    value: '.option("cloudFiles.schemaEvolutionMode", "rescue")\n.option("rescuedDataColumn", "_dados_resgatados")',
                },
                {
                    type: "quote",
                    value: "Sem schema fornecido, o padrão é `addNewColumns`: a coluna nova entra e o stream falha de propósito, para que o reinício siga com o schema novo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Como se chama, por padrão, a coluna em que o Auto Loader guarda o dado que não casou com o schema?",
                    difficulty: "facil",
                    explanation:
                        "A coluna de dado resgatado é `_rescued_data` por padrão, e a opção `rescuedDataColumn` renomeia ou declara essa coluna. O `_corrupt_record` engana porque existe de verdade, mas ele é do leitor comum em modo permissivo, não do resgate do Auto Loader.",
                    options: [
                        {
                            text: "`_rescued_data`, e você a renomeia ou a declara pela opção `rescuedDataColumn`.",
                            isCorrect: true,
                        },
                        {
                            text: "`_corrupt_record`, e você a renomeia ou a declara pela opção `columnNameOfCorruptRecord`.",
                            isCorrect: false,
                        },
                        {
                            text: "`_rescued_data`, e o nome dela é fixo, sem nenhuma opção para renomear.",
                            isCorrect: false,
                        },
                        {
                            text: "`_metadata`, e você a renomeia pela opção `cloudFiles.schemaHints`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O Auto Loader está inferindo uma coluna de data como string, e você não quer declarar o schema inteiro só por causa dela. Qual opção resolve, e qual é a restrição dela?",
                    difficulty: "medio",
                    explanation:
                        "As dicas de schema sobrescrevem o tipo das colunas que você escolher e deixam o resto ser inferido, mas só valem quando você não fornece um schema. O `inferColumnTypes` engana porque também mexe em tipo, só que ele age sobre todas as colunas de uma vez.",
                    options: [
                        {
                            text: "`cloudFiles.schemaHints`, que só vale quando você não fornece um schema completo.",
                            isCorrect: true,
                        },
                        {
                            text: "`cloudFiles.inferColumnTypes`, que só vale para arquivo Avro e arquivo Parquet.",
                            isCorrect: false,
                        },
                        {
                            text: "`cloudFiles.partitionColumns`, que só vale para coluna no estilo de partição Hive.",
                            isCorrect: false,
                        },
                        {
                            text: "`rescuedDataColumn`, que só vale quando a evolução de schema está em `rescue`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um stream do Auto Loader roda sem schema fornecido e sem declarar `cloudFiles.schemaEvolutionMode`. Um arquivo novo traz uma coluna que não existia antes. O que acontece?",
                    difficulty: "medio",
                    explanation:
                        "Sem schema fornecido o padrão é `addNewColumns`: a coluna entra no schema e o stream falha de propósito, e o reinício retoma com o schema novo. Quem responde `none` troca os dois padrões, porque `none` é o padrão apenas quando você fornece o schema.",
                    options: [
                        {
                            text: "A coluna é adicionada ao schema e o stream falha; o reinício retoma com o schema novo.",
                            isCorrect: true,
                        },
                        {
                            text: "A coluna é ignorada e o stream segue, porque o padrão sem schema fornecido é `none`.",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna vai para o dado resgatado, porque o padrão sem schema fornecido é `rescue`.",
                            isCorrect: false,
                        },
                        {
                            text: "O stream falha e fica travado até alguém atualizar o schema ou remover o arquivo novo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time reclama que, em uma ingestão com Auto Loader, uma coluna numérica de arquivo JSON chegou como string na tabela. Qual é a causa e a correção?",
                    difficulty: "medio",
                    explanation:
                        "Para JSON, CSV e XML o Auto Loader infere tudo como string por padrão, e `cloudFiles.inferColumnTypes` em `true` liga a inferência de tipo de verdade. O dado resgatado engana porque é o outro lugar onde valor de tipo divergente aparece.",
                    options: [
                        {
                            text: "A inferência de JSON devolve string por padrão, e `cloudFiles.inferColumnTypes` em `true` resolve.",
                            isCorrect: true,
                        },
                        {
                            text: "O `cloudFiles.format` estava em `text`, e trocar para `json` faz a inferência devolver o tipo.",
                            isCorrect: false,
                        },
                        {
                            text: "A coluna caiu toda no dado resgatado, e `rescuedDataColumn` em `false` devolve o tipo original dela.",
                            isCorrect: false,
                        },
                        {
                            text: "O schema do checkpoint ficou velho, e apagar o `cloudFiles.schemaLocation` refaz a inferência.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma carga nunca pode falhar por mudança de schema, e o dado que não couber precisa ficar guardado para análise depois. Qual valor de `cloudFiles.schemaEvolutionMode` entrega isso?",
                    difficulty: "dificil",
                    explanation:
                        "O modo `rescue` nunca evolui o schema nem falha, e manda a coluna desconhecida para a coluna de dado resgatado. O `none` engana porque também não evolui nem falha, mas ele simplesmente ignora a coluna nova, sem guardar o valor em lugar nenhum.",
                    options: [
                        {
                            text: "`rescue`, que não evolui o schema nem falha, e manda a coluna nova para o dado resgatado.",
                            isCorrect: true,
                        },
                        {
                            text: "`none`, que não evolui o schema nem falha, e guarda a coluna nova no dado resgatado também.",
                            isCorrect: false,
                        },
                        {
                            text: "`failOnNewColumns`, que não evolui o schema e guarda a coluna nova para revisão manual.",
                            isCorrect: false,
                        },
                        {
                            text: "`addNewColumns`, que evolui o schema sem falhar e guarda o valor antigo no dado resgatado.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Lakeflow Connect e como escolher o caminho de ingestão",
            blocks: [
                {
                    type: "text",
                    value: "Até aqui a origem sempre foi arquivo em armazenamento de objeto. Mas boa parte do dado que a empresa quer no lakehouse não está em arquivo: está em um SQL Server de produção, em um Salesforce, em um SharePoint, em um tópico de barramento de mensagens. No fim desta aula você sabe o que a Databricks oferece para essas origens e tem um critério objetivo para escolher entre `COPY INTO`, Auto Loader e conector gerenciado, sem apelar para preferência pessoal.",
                },
                {
                    type: "text",
                    value: "Lakeflow Connect é a parte do Lakeflow que trata de ingestão. Ele oferece conectores para arquivo local, aplicação corporativa popular, banco de dados, armazenamento em nuvem e barramento de mensagens. A oferta vem em modelos de serviço diferentes: o serviço totalmente gerenciado, com conector pronto, interface e API, desenhado para minimizar manutenção no longo prazo; o pipeline customizado, com Lakeflow pipelines ou Structured Streaming, para quando você precisa de mais controle; o conector de comunidade, de código aberto, para origem sem suporte gerenciado e sem SLA da Databricks; e o conector próprio, que você constrói, testa e roda no seu workspace.",
                },
                {
                    type: "table",
                    value: '[["Categoria de conector gerenciado","Como pega o dado","Exemplos citados na documentação"],["Banco de dados","Change data capture na origem","MySQL, PostgreSQL, SQL Server, Oracle"],["Baseado em consulta","Consulta a origem direto, sem CDC","Banco de dados sem CDC configurado"],["SaaS","API da aplicação corporativa","Salesforce, HubSpot, Jira, Workday"],["Arquivo","Serviço de arquivo corporativo","Google Drive, SharePoint"],["Streaming","Barramento de mensagens e fluxo de evento","Apache Kafka, RabbitMQ"],["Escrita direta","A própria aplicação grava na tabela","API Zerobus Ingest"]]',
                },
                {
                    type: "text",
                    value: "O conector de banco de dados merece atenção porque a prova pergunta pelas peças dele, e são três. O gateway de ingestão extrai snapshot, log de mudança e metadados da origem; ele roda em classic compute e roda continuamente, justamente para capturar a mudança antes de o banco de origem truncar o próprio log de mudança. O staging é um volume do Unity Catalog que guarda o dado extraído até ele ser aplicado no destino, é criado automaticamente junto com o gateway e purga o dado depois de trinta dias. O pipeline de ingestão move o dado do staging para as tabelas de destino, e ele roda em serverless compute. O destino são streaming tables.",
                },
                {
                    type: "table",
                    value: '[["Componente do conector de banco de dados","Onde roda","O que faz"],["Gateway de ingestão","Classic compute, de forma contínua","Extrai snapshot, log de mudança e metadados"],["Staging","Volume do Unity Catalog","Guarda o extraído, com purga depois de trinta dias"],["Pipeline de ingestão","Serverless compute","Aplica o dado do staging nas tabelas de destino"]]',
                },
                {
                    type: "text",
                    value: "Tem uma consequência de custo nisso: como o gateway roda sempre, você paga o classic compute dele mesmo quando o pipeline de ingestão está parado. Conector SaaS e conector de arquivo não têm gateway nem staging; eles usam uma connection, um pipeline de ingestão e as tabelas de destino. O conector baseado em consulta também dispensa o gateway, porque consulta a origem direto em vez de ler evento de log de mudança.\n\nPara organizar a escolha, a documentação coloca as opções em três camadas, da mais gerenciada para a mais customizável: conector gerenciado, Lakeflow pipelines e Structured Streaming. A recomendação é começar pela camada mais gerenciada e descer uma camada só quando ela não atender um requisito seu, como não suportar a sua origem.",
                },
                {
                    type: "text",
                    value: "Entre `COPY INTO` e Auto Loader, o critério que a documentação dá é volume de arquivo ao longo do tempo. Se você vai ingerir arquivo na ordem de milhares, `COPY INTO` serve. Se você espera arquivo na ordem de milhões ou mais, use Auto Loader. A razão está na descoberta: o Auto Loader precisa de menos operações no total para descobrir arquivo do que o `COPY INTO`, o que o torna mais barato e mais eficiente em escala. Schema que muda com frequência também pesa para o lado do Auto Loader, que tem primitivas melhores de inferência e de evolução de schema.",
                },
                {
                    type: "text",
                    value: "O `COPY INTO` ganha em um ponto bem específico: reprocessar um subconjunto. Recarregar alguns arquivos que foram reenviados é mais fácil com `COPY INTO`, e com Auto Loader é mais difícil reprocessar um subconjunto escolhido. E os dois podem conviver: você roda `COPY INTO` para recarregar um subconjunto enquanto um stream de Auto Loader continua rodando ao mesmo tempo. Para o usuário de SQL que quer a experiência de ingestão de arquivo mais escalável e robusta, a recomendação da documentação é streaming table, que lê com Auto Loader por baixo e tem schema e checkpoint gerenciados pelo pipeline.",
                },
                {
                    type: "code",
                    value: "-- Recarregar um subconjunto reenviado, com o stream do Auto Loader rodando\nCOPY INTO meu_catalogo.bronze.clientes\nFROM '/Volumes/meu_catalogo/bronze/arquivos/clientes'\nFILEFORMAT = CSV\nFILES = ('clientes_2026_10_03.csv', 'clientes_2026_10_04.csv')\nFORMAT_OPTIONS ('header' = 'true')\nCOPY_OPTIONS ('force' = 'true');",
                },
                {
                    type: "code",
                    value: "-- Caminho SQL recomendado para escala: streaming table com Auto Loader por baixo\nCREATE OR REFRESH STREAMING TABLE meu_catalogo.bronze.clientes_st\nAS SELECT * FROM STREAM read_files(\n  '/Volumes/meu_catalogo/bronze/arquivos/clientes',\n  format => 'csv',\n  header => true,\n  schemaHints => 'id BIGINT, criado_em TIMESTAMP');",
                },
                {
                    type: "table",
                    value: '[["Situação","Caminho indicado","Por quê"],["A origem é banco de dados ou aplicação SaaS","Conector gerenciado do Lakeflow Connect","Menos manutenção, com CDC e credencial resolvidos"],["Arquivo na ordem de milhares ao longo do tempo","`COPY INTO`","Comando SQL simples e idempotente por tabela de destino"],["Arquivo na ordem de milhões ou mais","Auto Loader","Menos operação para descobrir arquivo, mais barato em escala"],["Schema da origem muda com frequência","Auto Loader","Inferência, evolução e dado resgatado já embutidos"],["Recarregar um subconjunto que foi reenviado","`COPY INTO` com `force`","Dá para escolher os arquivos com `FILES` ou `PATTERN`"],["Usuário de SQL que precisa de escala","Streaming table com `read_files`","Usa Auto Loader por baixo, com checkpoint gerenciado"]]',
                },
                {
                    type: "text",
                    value: "Falta uma peça do caminho de streaming table: reprocessar. O full refresh descarta todo o dado e todo o metadado e reinicia o stream do começo. Na prática ele trunca a streaming table, remove todo o dado de checkpoint e reinicia o processamento com checkpoint novo para cada fluxo que grava naquela tabela. O detalhe que escapa é que isso só traz o histórico de volta se a sua origem ainda guardar o conjunto histórico completo. E o full refresh precisa ser disparado de forma explícita, pela interface do pipeline ou pela configuração de full refresh automático no Lakeflow Connect.",
                },
                {
                    type: "quote",
                    value: "Milhares de arquivos, `COPY INTO`. Milhões ou mais, Auto Loader. Origem que não é arquivo, conector gerenciado do Lakeflow Connect.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual produto da Databricks reúne os conectores gerenciados de ingestão para banco de dados, aplicação SaaS, arquivo corporativo e barramento de mensagens?",
                    difficulty: "facil",
                    explanation:
                        "Lakeflow Connect é a parte do Lakeflow dedicada a ingestão, com os conectores gerenciados. Lakeflow pipelines engana porque também é Lakeflow, mas ele é a camada de pipeline declarativo, usada quando o conector gerenciado não atende.",
                    options: [
                        {
                            text: "Lakeflow Connect, que oferece os conectores gerenciados de ingestão por categoria de origem.",
                            isCorrect: true,
                        },
                        {
                            text: "Lakeflow pipelines, que oferece os mesmos conectores gerenciados dentro de pipeline declarativo.",
                            isCorrect: false,
                        },
                        {
                            text: "Unity Catalog, que oferece os conectores gerenciados junto do catálogo de governança.",
                            isCorrect: false,
                        },
                        {
                            text: "Lakeflow Jobs, que oferece os conectores gerenciados como tipo de task de orquestração.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um diretório deve receber arquivo na ordem de milhões ao longo do tempo, e o schema da origem muda de vez em quando. Qual caminho de ingestão a documentação indica, e por quê?",
                    difficulty: "medio",
                    explanation:
                        "Acima da ordem de milhões de arquivos a indicação é Auto Loader, porque ele usa menos operações para descobrir arquivo e tem primitivas melhores de inferência e evolução. O `COPY INTO` é indicado na ordem de milhares, não de milhões.",
                    options: [
                        {
                            text: "Auto Loader, que descobre arquivo com menos operações e trata evolução de schema melhor.",
                            isCorrect: true,
                        },
                        {
                            text: "`COPY INTO`, que descobre arquivo com menos operações e evolui o schema sem opção extra.",
                            isCorrect: false,
                        },
                        {
                            text: "`CONVERT TO DELTA`, que adota os arquivos sem lê-los e acompanha a mudança de schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Conector gerenciado, que é a camada indicada para qualquer origem em armazenamento.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "No conector gerenciado de banco de dados do Lakeflow Connect, qual é o papel do gateway de ingestão e em que tipo de compute ele roda?",
                    difficulty: "medio",
                    explanation:
                        "O gateway extrai snapshot, log de mudança e metadados da origem, roda em classic compute e roda continuamente, para capturar a mudança antes de a origem truncar o log. O pipeline de ingestão é que roda em serverless e aplica o dado do staging.",
                    options: [
                        {
                            text: "Extrai snapshot, log de mudança e metadados da origem, em classic compute e de forma contínua.",
                            isCorrect: true,
                        },
                        {
                            text: "Aplica no destino o dado que está no staging, em serverless compute e também de forma contínua.",
                            isCorrect: false,
                        },
                        {
                            text: "Guarda o dado extraído até ele ser aplicado no destino, em volume do Unity Catalog.",
                            isCorrect: false,
                        },
                        {
                            text: "Consulta a origem direto a cada execução agendada, em serverless compute, sem usar CDC.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Alguns arquivos de um dia antigo foram reenviados corrigidos, e só eles precisam voltar para a tabela, que é alimentada por um stream de Auto Loader. Qual é o caminho mais direto?",
                    difficulty: "dificil",
                    explanation:
                        "Recarregar um subconjunto escolhido é justamente onde `COPY INTO` ganha, com `FILES` ou `PATTERN` e `force`, e ele pode rodar com o stream de Auto Loader ativo. Apagar o checkpoint engana porque funciona, mas relê o diretório inteiro e duplica tudo.",
                    options: [
                        {
                            text: "`COPY INTO` com `FILES` e `force`, que pode rodar com o stream de Auto Loader ativo.",
                            isCorrect: true,
                        },
                        {
                            text: "Apagar o checkpoint do stream, que faz o Auto Loader reler só os arquivos corrigidos.",
                            isCorrect: false,
                        },
                        {
                            text: "`cloudFiles.backfillInterval` no stream, que relê apenas os arquivos reenviados na origem.",
                            isCorrect: false,
                        },
                        {
                            text: "Full refresh da tabela de destino, que recarrega somente os arquivos que mudaram na origem.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que exatamente um full refresh faz com uma streaming table alimentada por Auto Loader, e qual é a ressalva da documentação?",
                    difficulty: "dificil",
                    explanation:
                        "O full refresh trunca a tabela, remove todo o dado de checkpoint e reinicia com checkpoint novo, mas só recupera o histórico se a origem ainda guardar o conjunto histórico completo. Ele também não acontece sozinho, precisa ser disparado de forma explícita.",
                    options: [
                        {
                            text: "Trunca a tabela e remove o checkpoint, e só recupera histórico se a origem ainda o guardar.",
                            isCorrect: true,
                        },
                        {
                            text: "Mantém a tabela e remove o checkpoint, e sempre recupera o histórico completo da origem.",
                            isCorrect: false,
                        },
                        {
                            text: "Trunca a tabela e mantém o checkpoint, e recupera o histórico a partir do último offset.",
                            isCorrect: false,
                        },
                        {
                            text: "Roda sozinho a cada atualização da tabela, e recupera o histórico lendo o log de transações.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Transformação e modelagem",
    aulas: [
        {
            titulo: "Spark SQL e PySpark: o essencial da prova",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você decide, olhando o enunciado, se a resposta é uma tabela, uma view temporária ou uma view temporária global, sabe tirar campo de JSON aninhado e achatar array, reconhece a função de janela que deduplica por chave, e escolhe entre função nativa e função definida pelo usuário sem chutar. A prova cobra esses pontos em questões curtas de código, e quase sempre o erro está em um detalhe de sintaxe ou de escopo.",
                },
                {
                    type: "text",
                    value: "**Criar tabela a partir de consulta.** O `CREATE TABLE ... AS SELECT`, o CTAS, deriva o schema da consulta. A documentação é direta: quando você especifica a consulta, não pode também especificar a lista de colunas, porque o schema vem do resultado. Se a cláusula `USING` for omitida, o formato padrão é `DELTA`. `CREATE OR REPLACE TABLE` só existe para Delta e Iceberg, e `IF NOT EXISTS` não pode coexistir com `REPLACE`.",
                },
                {
                    type: "code",
                    value: "-- O schema sai da consulta: nao se declara lista de colunas junto com AS\nCREATE OR REPLACE TABLE vendas.gold.receita_diaria\nAS SELECT date_trunc('day', data_pedido) AS dia,\n          regiao,\n          sum(valor) AS receita\n   FROM vendas.silver.pedidos\n   GROUP BY dia, regiao;\n\n-- Sem USING, o formato padrao e DELTA\nCREATE TABLE IF NOT EXISTS vendas.gold.receita_copia\nAS SELECT * FROM vendas.gold.receita_diaria;",
                },
                {
                    type: "text",
                    value: "**View temporária contra view temporária global.** Uma view temporária é visível só para a sessão que a criou, é descartada quando a sessão termina e o nome dela não pode ser qualificado com schema. Uma view temporária global fica presa a um schema reservado do sistema, o `global_temp`, e por isso serve qualquer carga rodando no mesmo recurso de compute. Dois detalhes que a prova gosta: a documentação chama a view temporária global de recurso legado e recomenda não usá-la, e ela não é suportada em compute serverless, onde a indicação é usar view temporária de sessão ou criar tabela.",
                },
                {
                    type: "code",
                    value: 'df = spark.read.table("vendas.bronze.pedidos")\n\n# Visivel so nesta sessao, o nome nao pode ser qualificado\ndf.createOrReplaceTempView("pedidos_hoje")\nspark.sql("SELECT count(*) FROM pedidos_hoje").show()\n\n# Visivel a qualquer carga no mesmo compute, vive no schema global_temp\ndf.createOrReplaceGlobalTempView("pedidos_hoje_g")\nspark.sql("SELECT count(*) FROM global_temp.pedidos_hoje_g").show()',
                },
                {
                    type: "table",
                    value: '[["Objeto","Onde vive","Quem alcança","Sobrevive ao fim da sessão"],["View temporária","Nenhum schema, nome não qualificado","Só a sessão que criou","Não"],["View temporária global","Schema reservado `global_temp`","Qualquer carga no mesmo compute","Sim, até o compute encerrar"],["Tabela gerenciada","Catálogo e schema do Unity Catalog","Qualquer sessão com privilégio","Sim"]]',
                },
                {
                    type: "text",
                    value: "**JSON aninhado e array.** Quando o JSON chega em uma coluna `STRING`, o caminho se navega com o operador de dois-pontos, e o resultado volta sempre como `STRING`, então o cast com `::` é obrigatório para comparar número ou data. Índice de array é baseado em zero. Para virar tipo complexo, use `from_json` com o schema. Quando a coluna já é `STRUCT`, aí sim o ponto navega direto.",
                },
                {
                    type: "text",
                    value: "**Explodir array.** O `explode` devolve uma linha por elemento do array e nomeia a coluna de saída como `col`; em um `MAP`, devolve as colunas `key` e `value`. A armadilha clássica: se a coleção é `NULL`, nenhuma linha é produzida, e a linha original desaparece do resultado. Quando você precisa preservar essa linha, use `explode_outer`, que devolve uma linha com `NULL`.",
                },
                {
                    type: "code",
                    value: "-- payload e uma coluna STRING com JSON; o operador : devolve STRING\nSELECT\n  payload:cliente.id::bigint   AS cliente_id,\n  payload:loja.frutas[0]       AS primeira_fruta,\n  from_json(payload:bicicleta, 'price double, color string') AS bicicleta\nFROM bronze.eventos;\n\n-- explode gera uma linha por elemento; coleção NULL nao gera linha nenhuma\nSELECT pedido_id, explode(itens) AS item FROM silver.pedidos;\nSELECT pedido_id, explode_outer(itens) AS item FROM silver.pedidos;",
                },
                {
                    type: "quote",
                    value: "Se a coleção é NULL, o explode não produz linha nenhuma, e a linha de fora desaparece do resultado. Quem precisa dela usa explode_outer.",
                },
                {
                    type: "text",
                    value: "**Função de janela e deduplicação.** A sintaxe é `função OVER (PARTITION BY ... ORDER BY ... frame)`. Função de ranking exige `ORDER BY` na especificação da janela e não aceita cláusula de frame. O padrão de deduplicação que a prova cobra é ranquear por chave, ordenando pelo carimbo de tempo em ordem decrescente, e manter o rank 1. Para deduplicação de linha inteira, `DISTINCT` em SQL e `dropDuplicates()` em PySpark comparam todas as colunas; passando uma lista, `dropDuplicates` compara só o subconjunto informado.",
                },
                {
                    type: "code",
                    value: "-- Mantem so a versao mais recente de cada chave\nWITH ranqueado AS (\n  SELECT *,\n         row_number() OVER (PARTITION BY pedido_id ORDER BY ingest_ts DESC) AS rn\n  FROM bronze.pedidos_cdc\n)\nSELECT * EXCEPT (rn) FROM ranqueado WHERE rn = 1;",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql import functions as F\nfrom pyspark.sql.window import Window\n\njanela = Window.partitionBy("pedido_id").orderBy(F.col("ingest_ts").desc())\nrecentes = (df.withColumn("rn", F.row_number().over(janela))\n              .filter("rn = 1")\n              .drop("rn"))\n\n# Sem argumento compara todas as colunas; com lista, so o subconjunto\ndf.dropDuplicates()\ndf.dropDuplicates(["pedido_id"])',
                },
                {
                    type: "text",
                    value: "**Agregação e junção com broadcast.** Agregação é `GROUP BY` com as funções de sempre, e o detalhe de escala é o shuffle: `spark.sql.shuffle.partitions` tem padrão `200`. Quando um lado da junção é pequeno, o plano melhor é broadcast hash join, que manda a tabela menor para todos os executores e dispensa o shuffle do lado grande. O AQE, que vem ligado por padrão, converte sort merge join em broadcast hash join em tempo de execução quando a relação cabe no limiar `spark.databricks.adaptive.autoBroadcastJoinThreshold`, cujo padrão é `30MB`. Para forçar acima do limiar, use a dica `BROADCAST`, que também aceita os nomes `BROADCASTJOIN` e `MAPJOIN`.",
                },
                {
                    type: "code",
                    value: "SELECT /*+ BROADCAST(d) */ f.pedido_id, d.nome_regiao\nFROM silver.fato_pedidos f\nJOIN silver.dim_regiao d ON f.regiao_id = d.regiao_id;",
                },
                {
                    type: "code",
                    value: 'from pyspark.sql.functions import broadcast\n\n# broadcast() marca o DataFrame como pequeno o suficiente para broadcast join\nresultado = fato.join(broadcast(dim), "regiao_id")',
                },
                {
                    type: "text",
                    value: "**Precedência das dicas de junção.** Quando cada lado pede uma estratégia diferente, a ordem é `BROADCAST`, depois `MERGE`, depois `SHUFFLE_HASH` e por último `SHUFFLE_REPLICATE_NL`. A documentação avisa que a estratégia sugerida não é garantida, porque algumas não suportam todo tipo de junção. Nas dicas de particionamento, `COALESCE`, `REPARTITION`, `REPARTITION_BY_RANGE` e `REBALANCE`, o otimizador usa a dica mais à esquerda.",
                },
                {
                    type: "text",
                    value: "**Função nativa contra função definida pelo usuário.** A documentação é explícita: função nativa do Apache Spark é otimizada para processamento distribuído e entrega melhor desempenho em escala, e função nativa e SQL UDF são as opções mais eficientes. UDF Python escalar serializa o dado e o move para fora da JVM, para o interpretador Python, linha por linha. Pandas UDF reduz esse custo com Apache Arrow e a documentação cita até 100 vezes mais rápida que a UDF Python. UDF Scala costuma ser mais rápida que UDF Python porque roda na JVM. Registrar a UDF no Unity Catalog é governança, não desempenho.",
                },
                {
                    type: "table",
                    value: '[["Tipo de função","Onde o código roda","Custo de serialização","Quando a documentação indica"],["Função nativa do Spark","No motor, dentro da JVM","Nenhum","Padrão, melhor desempenho em escala"],["SQL UDF","No motor, dentro da JVM","Nenhum","Lógica reutilizável governada no Unity Catalog"],["UDF Python escalar","Interpretador Python","Alto, sai da JVM linha a linha","Exploração e volume pequeno ou médio"],["Pandas UDF","Interpretador Python com Arrow","Menor, até 100 vezes mais rápida que UDF Python","Vetorizar coluna inteira"]]',
                },
                {
                    type: "text",
                    value: "**Modos de escrita.** O `mode` do escritor aceita `append`, que acrescenta aos dados existentes, `overwrite`, que substitui, `error` ou `errorifexists`, que lança exceção se já houver dado, e `ignore`, que pula a escrita em silêncio quando já existe dado. É esse último que mais engana em questão de ingestão: `ignore` não falha e não grava, então o job termina verde sem ter escrito nada.",
                },
                {
                    type: "text",
                    value: "**Reparticionar contra coalescer.** `repartition` devolve um DataFrame com o número pedido de partições, particionado por hash, e aceita colunas; ele redistribui com shuffle e pode aumentar ou diminuir a contagem. `coalesce` só reduz: a operação gera dependência estreita, sem shuffle, e a documentação avisa que, se você pedir um número maior de partições, fica no número atual. A ressalva da documentação é a redução drástica, por exemplo para uma partição: o trabalho passa a rodar em menos nós do que você gostaria, e nesse caso a saída é `repartition`, que acrescenta uma etapa de shuffle porém libera o paralelismo a montante.",
                },
                {
                    type: "table",
                    value: '[["Operação","Faz shuffle","Aumenta a contagem de partições","Se você pedir mais que o atual"],["`repartition(n)`","Sim, redistribui por hash","Sim","Atende, chega a `n` partições"],["`coalesce(n)`","Não, dependência estreita","Não","Fica no número atual, sem efeito"]]',
                },
                {
                    type: "quote",
                    value: "coalesce não faz shuffle e só reduz partição: pedir mais partições do que já existem não tem efeito nenhum. Quem precisa aumentar usa repartition e paga o shuffle.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você cria `vendas.gold.receita_diaria` com um `CREATE TABLE ... AS SELECT` sobre uma agregação, sem cláusula `USING`. O que vale para o schema e para o formato dessa tabela?",
                    difficulty: "facil",
                    explanation:
                        "Sem `USING`, o padrão é `DELTA`, e o schema sai da consulta: declarar lista de colunas junto com a consulta é proibido. O distrator do Parquet engana porque esse já foi o padrão em Spark aberto, não é o do Databricks.",
                    options: [
                        {
                            text: "O schema é derivado da consulta e o formato padrão é `DELTA`, porque `USING` omitido assume Delta.",
                            isCorrect: true,
                        },
                        {
                            text: "O schema é derivado da consulta e o formato padrão é `PARQUET`, porque Delta exige `USING DELTA` no fim.",
                            isCorrect: false,
                        },
                        {
                            text: "O schema precisa vir na lista de colunas antes do `AS`, porque o CTAS não infere tipo de coluna.",
                            isCorrect: false,
                        },
                        {
                            text: "O formato padrão é `DELTA`, porém a tabela nasce vazia, porque o CTAS só copia a definição.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um notebook cria uma view com `createOrReplaceTempView` e um segundo notebook, anexado ao mesmo compute, consulta o mesmo nome e recebe erro de objeto não encontrado. O que resolve, e com qual ressalva?",
                    difficulty: "medio",
                    explanation:
                        "A view temporária global vive no schema reservado `global_temp` e atende qualquer carga do mesmo compute, mas a documentação a trata como recurso legado e não a suporta em serverless. O distrator do nome simples engana porque o prefixo `global_temp` é obrigatório.",
                    options: [
                        {
                            text: "Usar `createOrReplaceGlobalTempView` e consultar por `global_temp.nome`, lembrando que ela é recurso legado e não roda em serverless.",
                            isCorrect: true,
                        },
                        {
                            text: "Usar `createOrReplaceGlobalTempView` e consultar pelo nome simples, lembrando que ela passa a viver no catálogo padrão do workspace atual.",
                            isCorrect: false,
                        },
                        {
                            text: "Qualificar a view temporária com o schema de destino, lembrando que o nome qualificado é exigido fora do notebook que a declarou.",
                            isCorrect: false,
                        },
                        {
                            text: "Conceder `SELECT` na view temporária ao segundo notebook, lembrando que privilégio em view temporária é herdado do schema.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em `bronze.eventos`, `payload` é uma coluna `STRING` com JSON, com o campo `preco` na raiz e um array `itens` de objetos. Você precisa de `preco` como `DOUBLE` e de uma linha por item. Qual combinação está correta?",
                    difficulty: "medio",
                    explanation:
                        "O operador de dois-pontos navega em JSON dentro de `STRING` e devolve `STRING`, então o cast com `::` é necessário, e `from_json` dá tipo ao array antes do `explode`. A opção com ponto engana porque ponto só navega em `STRUCT`, não em coluna `STRING`.",
                    options: [
                        {
                            text: "`payload:preco::double` para o cast e `explode(from_json(payload:itens, 'array<struct<sku string>>'))` para as linhas.",
                            isCorrect: true,
                        },
                        {
                            text: "`cast(payload.preco AS double)` para o cast e `explode(payload.itens)` para as linhas, já que o ponto navega no JSON.",
                            isCorrect: false,
                        },
                        {
                            text: "`payload:preco::double` para o cast e `flatten(payload:itens)` para as linhas, já que `flatten` transforma array em linhas.",
                            isCorrect: false,
                        },
                        {
                            text: "`parse_json(payload):preco` para o cast e `posexplode(payload:itens)` para as linhas, já que ele devolve `STRUCT` pronto.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job diário processa bilhões de linhas e aplica uma limpeza de texto escrita como UDF Python escalar. O time quer reduzir o tempo de execução sem mudar o resultado. O que a documentação indica primeiro?",
                    difficulty: "medio",
                    explanation:
                        "A documentação recomenda função nativa para escala, porque ela é otimizada para processamento distribuído, enquanto a UDF Python serializa o dado para fora da JVM linha a linha. Registrar no Unity Catalog é governança e não muda onde o Python executa.",
                    options: [
                        {
                            text: "Reescrever a limpeza com funções nativas do Spark, que são otimizadas para processamento distribuído.",
                            isCorrect: true,
                        },
                        {
                            text: "Manter a UDF Python e aumentar o número de workers do cluster, que é o caminho indicado para ETL recorrente.",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar a mesma UDF Python no Unity Catalog, que passa a executar na JVM e dispensa serialização.",
                            isCorrect: false,
                        },
                        {
                            text: "Trocar a UDF Python por uma SQL UDF que chame o mesmo código Python, que roda vetorizado por padrão.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma junção entre um fato de 2 TB e uma dimensão de 40 MB está caindo em sort merge join, com shuffle pesado nos dois lados. Você quer forçar o broadcast da dimensão. Qual caminho funciona?",
                    difficulty: "dificil",
                    explanation:
                        "A dica `BROADCAST`, que também aceita `BROADCASTJOIN` e `MAPJOIN`, pede o broadcast e vale mesmo acima do limiar de `30MB` que o AQE usa para converter sort merge join em broadcast hash join. `MERGE` pede o efeito oposto, sort merge join.",
                    options: [
                        {
                            text: "A dica `/*+ BROADCAST(d) */`, que pede o broadcast mesmo acima do limiar automático de `30MB` do AQE.",
                            isCorrect: true,
                        },
                        {
                            text: "A dica `/*+ MERGE(d) */`, que tem precedência sobre as outras e troca o plano por broadcast hash join.",
                            isCorrect: false,
                        },
                        {
                            text: "Subir `spark.sql.shuffle.partitions` acima de `200`, que corta o shuffle e leva o AQE ao broadcast.",
                            isCorrect: false,
                        },
                        {
                            text: "A dica `/*+ REBALANCE(d) */`, que reparticiona a dimensão e libera o broadcast acima do limiar.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Delta Lake na prática: MERGE, time travel e clone",
            blocks: [
                {
                    type: "text",
                    value: 'Esta aula resolve as perguntas de "qual comando eu uso" que a prova faz sobre Delta Lake: atualizar e inserir no mesmo passo, voltar a tabela para como ela estava, duplicar uma tabela sem duplicar o custo, transformar Parquet em Delta sem reescrever e deixar a tabela contar quem mudou o quê. Cada item tem um detalhe de comportamento que separa quem leu a documentação de quem decorou o nome.',
                },
                {
                    type: "text",
                    value: "**MERGE INTO.** As três famílias de cláusula são `WHEN MATCHED`, que age na linha com par e aceita `UPDATE` e `DELETE`, no máximo uma ação de cada por cláusula, `WHEN NOT MATCHED`, que age na linha da origem sem par no destino e só aceita `INSERT`, e `WHEN NOT MATCHED BY SOURCE`, que age na linha do destino sem par na origem e aceita `UPDATE` e `DELETE`. Essa última não pode referenciar coluna da origem, então você usa literal ou coluna do destino, e ela existe no Databricks SQL e no Databricks Runtime 12.2 LTS e acima.",
                },
                {
                    type: "text",
                    value: "**Duas regras que derrubam MERGE em produção.** Pode haver qualquer número de cláusulas `WHEN MATCHED` e `WHEN NOT MATCHED`, mas, quando há várias do mesmo tipo, todas menos a última precisam de condição. E só uma linha da origem pode casar com uma dada linha do destino: se duas casarem, o comando pode falhar, porque não há como saber qual deveria valer. A saída é deduplicar a origem antes, com função de janela por chave.",
                },
                {
                    type: "code",
                    value: "MERGE INTO silver.clientes AS alvo\nUSING bronze.clientes_cdc AS origem\n  ON alvo.cliente_id = origem.cliente_id\nWHEN MATCHED AND origem.operacao = 'DELETE' THEN DELETE\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED AND origem.operacao <> 'DELETE' THEN INSERT *\nWHEN NOT MATCHED BY SOURCE THEN UPDATE SET alvo.ativo = false;",
                },
                {
                    type: "quote",
                    value: "Só uma linha da origem pode casar com uma dada linha do destino. Se duas casarem, o MERGE pode falhar, porque não há como decidir qual delas deveria valer.",
                },
                {
                    type: "text",
                    value: "**Viagem no tempo.** Você consulta uma versão antiga com `VERSION AS OF` ou `TIMESTAMP AS OF`, e também com a forma curta `nome@v123` para versão ou `nome@20261001100000000` para carimbo, no formato `yyyyMMddHHmmssSSS`. Nem a versão nem o carimbo podem ser subconsulta. `DESCRIBE HISTORY` lista as operações em ordem cronológica inversa, e `RESTORE TABLE` devolve a tabela para uma versão ou carimbo, exigindo o privilégio `MODIFY`.",
                },
                {
                    type: "text",
                    value: "**O par de retenções que decide se a viagem funciona.** Para ler uma versão antiga, o log e os arquivos de dados precisam existir. `delta.logRetentionDuration` controla quanto tempo o histórico da tabela é mantido e tem padrão de `interval 30 days`. `delta.deletedFileRetentionDuration` é o limiar que o `VACUUM` usa para apagar arquivo sem referência e tem padrão de `interval 7 days`. Daí a pegadinha: o histórico mostra a versão de 20 dias atrás, e a leitura falha porque os arquivos dela já foram removidos.",
                },
                {
                    type: "code",
                    value: "DESCRIBE HISTORY silver.clientes;        -- ordem cronologica inversa\nDESCRIBE HISTORY silver.clientes LIMIT 1;\n\nSELECT * FROM silver.clientes VERSION AS OF 123;\nSELECT * FROM silver.clientes TIMESTAMP AS OF '2026-10-01T10:00:00.000Z';\nSELECT * FROM silver.clientes@v123;\nSELECT * FROM silver.clientes@20261001100000000;\n\nRESTORE TABLE silver.clientes TO VERSION AS OF 123;",
                },
                {
                    type: "table",
                    value: '[["Propriedade","Padrão","O que ela controla"],["`delta.logRetentionDuration`","`interval 30 days`","Quanto tempo o histórico da tabela é mantido"],["`delta.deletedFileRetentionDuration`","`interval 7 days`","Limiar que o `VACUUM` usa para apagar arquivo sem referência"]]',
                },
                {
                    type: "text",
                    value: "**Clone profundo e clone raso.** `CLONE` sem palavra é clone profundo. O clone profundo copia dados e metadados, inclusive metadados de stream e de `COPY INTO`, não depende da tabela de origem e pode ser sincronizado de forma incremental. O clone raso copia só metadados e lê os arquivos de dados da origem, por isso custa menos computação e armazenamento, e por isso mesmo depende dela: se você rodar `VACUUM` na origem, os clientes deixam de ler aqueles arquivos e recebem `FileNotFoundException`. Para consertar, roda-se o clone de novo com `REPLACE`; se acontece sempre, a resposta é clone profundo.",
                },
                {
                    type: "text",
                    value: "**O que o clone leva e o que não leva.** Os dois tipos clonam schema, particionamento, invariantes, nullability e `TBLPROPERTIES`. Nenhum dos dois leva a descrição da tabela, os metadados de commit definidos pelo usuário, o histórico da tabela Delta e propriedades do Unity Catalog como tags. Esse é o erro de prova mais comum sobre clone: achar que o clone profundo copia o histórico de versões.",
                },
                {
                    type: "code",
                    value: "-- Sem a palavra, CLONE e profundo\nCREATE TABLE gold.clientes_bkp DEEP CLONE silver.clientes;\nCREATE OR REPLACE TABLE dev.clientes SHALLOW CLONE silver.clientes;\n\n-- Clone de uma versao especifica\nCREATE TABLE audit.clientes_v123 SHALLOW CLONE silver.clientes VERSION AS OF 123;\nCREATE TABLE audit.clientes_ontem DEEP CLONE silver.clientes\n  TIMESTAMP AS OF date_sub(current_date(), 1);",
                },
                {
                    type: "table",
                    value: '[["Aspecto","DEEP CLONE","SHALLOW CLONE"],["Arquivos de dados","Copia os arquivos para o destino","Não copia, lê os da origem"],["Dependência da origem","Nenhuma","Total, depende dos arquivos dela"],["`VACUUM` na origem","Não afeta o clone","Clone passa a dar `FileNotFoundException`"],["Metadados de stream e `COPY INTO`","Clonados","Não clonados"],["Histórico da tabela Delta","Não clonado","Não clonado"],["Custo de criação","Maior, computação e armazenamento","Menor"]]',
                },
                {
                    type: "text",
                    value: "**Converter para Delta.** `CONVERT TO DELTA` aceita diretório de Parquet e de Iceberg, por caminho, e também tabela registrada por nome. Você precisa fornecer a informação de particionamento quando a tabela Parquet é particionada, e em tabela externa do Unity Catalog a documentação diz que a informação de particionamento deve ser fornecida. Conversão de Iceberg pede Databricks Runtime 10.4 LTS ou acima e não suporta tabela que passou por evolução de partição.",
                },
                {
                    type: "code",
                    value: "CONVERT TO DELTA parquet.`s3://meu-bucket/pedidos`;\nCONVERT TO DELTA iceberg.`s3://meu-bucket/pedidos-iceberg`;\n\nCONVERT TO DELTA main.bronze.pedidos PARTITIONED BY (data_pedido DATE);",
                },
                {
                    type: "text",
                    value: "**Imposição de schema e fusão de schema.** Na imposição, todas as colunas inseridas devem existir na tabela de destino, e coluna desconhecida falha com erro de coluna não resolvida. Em `MERGE` com `INSERT *` ou `UPDATE SET *`, o conjunto de origem deve ter todas as colunas presentes no destino, e coluna da origem que não existe no destino é ignorada. Tipo precisa casar, mas o Databricks tenta converter com segurança, por exemplo um `INT` entrando em coluna `BIGINT`.",
                },
                {
                    type: "text",
                    value: "**Como abrir a porta para coluna nova.** A opção `mergeSchema` igual a `true` no write acrescenta ao schema da tabela as colunas que existem na origem e faltam no destino, no fim do schema, preservando a caixa; dentro de um `STRUCT`, a coluna nova vai para o fim do struct. A opção `overwriteSchema` igual a `true` só faz sentido com modo `overwrite` e troca schema e particionamento junto com os dados. Em `MERGE`, a forma atual é `MERGE WITH SCHEMA EVOLUTION`, no Databricks Runtime 15.4 LTS e acima; a configuração de sessão `spark.databricks.delta.schema.autoMerge.enabled` existe, e a documentação não a recomenda para produção.",
                },
                {
                    type: "code",
                    value: '# Acrescenta ao destino a coluna que existe na origem e falta na tabela\n(df.write.mode("append").option("mergeSchema", "true")\n   .saveAsTable("silver.pedidos"))\n\n# Troca schema e particionamento junto com os dados\n(df.write.mode("overwrite").option("overwriteSchema", "true")\n   .saveAsTable("silver.pedidos"))',
                },
                {
                    type: "text",
                    value: "**Feed de mudança de dados.** Ligue com a propriedade de tabela `delta.enableChangeDataFeed` igual a `true`, na criação ou com `ALTER TABLE`. A leitura ganha três colunas de metadado: `_change_type`, com os valores `insert`, `update_preimage`, `update_postimage` e `delete`, `_commit_version`, com a versão do log que contém a mudança, e `_commit_timestamp`. Se a tabela já tem coluna com um desses nomes, é preciso renomear antes de usar o feed.",
                },
                {
                    type: "text",
                    value: "**O que a prova pergunta sobre o feed.** Um `UPDATE` gera dois registros, a imagem anterior e a posterior, não um par de `delete` e `insert`. Em leitura em lote, pedir uma versão anterior ao momento em que o feed foi ligado levanta erro. As versões inicial e final são inclusivas, e os registros de mudança são transitórios: eles expiram com a janela de retenção da tabela, então o feed não substitui histórico de longo prazo.",
                },
                {
                    type: "code",
                    value: "CREATE TABLE silver.clientes (cliente_id BIGINT, nome STRING)\n  TBLPROPERTIES (delta.enableChangeDataFeed = true);\n\nALTER TABLE silver.clientes\n  SET TBLPROPERTIES (delta.enableChangeDataFeed = true);\n\nSELECT cliente_id, _change_type, _commit_version, _commit_timestamp\nFROM table_changes('silver.clientes', 12, 18)\nWHERE _change_type <> 'update_preimage';",
                },
                {
                    type: "table",
                    value: '[["Valor de `_change_type`","Quando aparece"],["`insert`","Linha inserida"],["`update_preimage`","Valor da linha antes do update"],["`update_postimage`","Valor da linha depois do update"],["`delete`","Linha excluída"]]',
                },
                {
                    type: "quote",
                    value: "Clone profundo copia os dados e fica independente da origem. Nenhum clone, raso ou profundo, copia o histórico de versões da tabela Delta.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em um upsert para `silver.clientes`, você também precisa marcar como inativa toda linha do destino que não aparece mais na origem. Qual cláusula do `MERGE INTO` faz isso?",
                    difficulty: "facil",
                    explanation:
                        "`WHEN NOT MATCHED BY SOURCE` é a cláusula que olha a linha do destino sem par na origem e aceita `UPDATE` e `DELETE`. `WHEN NOT MATCHED` é o oposto, linha da origem sem par no destino, e só aceita `INSERT`.",
                    options: [
                        {
                            text: "`WHEN NOT MATCHED BY SOURCE THEN UPDATE SET`, que age na linha do destino sem par na origem.",
                            isCorrect: true,
                        },
                        {
                            text: "`WHEN NOT MATCHED THEN UPDATE SET`, que age na linha do destino sem par na origem e aceita update.",
                            isCorrect: false,
                        },
                        {
                            text: "`WHEN MATCHED AND origem.cliente_id IS NULL THEN UPDATE SET`, que detecta a origem ausente.",
                            isCorrect: false,
                        },
                        {
                            text: "`WHEN NOT MATCHED BY TARGET THEN UPDATE SET`, que varre o destino buscando chave que saiu.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma auditoria pede o conteúdo de uma tabela Delta como ele estava 20 dias atrás. A tabela está com as propriedades padrão e roda `VACUUM` toda semana. O que acontece?",
                    difficulty: "medio",
                    explanation:
                        "A viagem no tempo precisa do log e dos arquivos de dados. O log dura 30 dias por padrão, mas o `VACUUM` remove arquivo sem referência mais velho que 7 dias, o padrão de `delta.deletedFileRetentionDuration`, então a versão aparece no histórico e a leitura falha.",
                    options: [
                        {
                            text: "A consulta falha por arquivo de dados ausente, porque `delta.deletedFileRetentionDuration` tem padrão de 7 dias.",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta funciona normalmente, porque `delta.logRetentionDuration` tem padrão de 30 dias e cobre o período pedido.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta funciona normalmente, porque o `VACUUM` só remove arquivo de log e preserva todo arquivo de dados.",
                            isCorrect: false,
                        },
                        {
                            text: "A consulta falha por versão fora do histórico, porque `delta.logRetentionDuration` tem padrão de 7 dias.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um ambiente de testes foi criado com `SHALLOW CLONE` de uma tabela de produção. Semanas depois o `VACUUM` rodou na produção e o clone passou a falhar na leitura. Qual é a causa e a correção definitiva?",
                    difficulty: "medio",
                    explanation:
                        "O clone raso copia só metadados e lê os arquivos de dados da origem, então o `VACUUM` na origem quebra o clone com `FileNotFoundException`. O clone profundo copia os dados e fica independente, mas nenhum clone leva o histórico da Delta.",
                    options: [
                        {
                            text: "O clone raso lê os arquivos de dados da origem; usar `DEEP CLONE`, que copia os dados e não depende dela.",
                            isCorrect: true,
                        },
                        {
                            text: "O clone raso copia só as partições já lidas; usar `DEEP CLONE`, que copia o histórico junto com os dados.",
                            isCorrect: false,
                        },
                        {
                            text: "O clone raso perde as `TBLPROPERTIES` da origem; refazer o clone com `REPLACE` depois de cada `VACUUM`.",
                            isCorrect: false,
                        },
                        {
                            text: "O clone raso depende do log da origem; subir `delta.logRetentionDuration` na origem e manter o clone raso.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com `delta.enableChangeDataFeed` ligado, um `UPDATE` que altera uma linha produz quantos registros no feed, e com quais valores de `_change_type`?",
                    difficulty: "dificil",
                    explanation:
                        "O feed grava a imagem anterior e a posterior de cada update, então são dois registros, com `update_preimage` e `update_postimage`. O par de `delete` e `insert` engana porque é assim que alguns motores de CDC registram, não o Change Data Feed.",
                    options: [
                        {
                            text: "Dois registros, um com `update_preimage` para o valor antigo e um com `update_postimage` para o novo.",
                            isCorrect: true,
                        },
                        {
                            text: "Um registro, com `update` em `_change_type` e o valor antigo guardado na coluna `_commit_version` dele.",
                            isCorrect: false,
                        },
                        {
                            text: "Dois registros, um com `delete` para o valor antigo e um com `insert` para o novo, como faz o merge.",
                            isCorrect: false,
                        },
                        {
                            text: "Um registro, só com `update_postimage`, porque o valor antigo fica disponível na viagem no tempo.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um append em tabela Delta falha porque o DataFrame trouxe uma coluna nova. Você quer que a coluna entre no schema da tabela sem trocar o schema inteiro nem perder as linhas já gravadas. Qual opção usar?",
                    difficulty: "dificil",
                    explanation:
                        "`mergeSchema` acrescenta ao fim do schema as colunas que existem na origem e faltam no destino. `overwriteSchema` só vale com modo `overwrite` e troca o schema junto com os dados. A configuração de sessão `autoMerge` existe e a documentação não a recomenda para produção.",
                    options: [
                        {
                            text: "A opção `mergeSchema` igual a `true` no write, que acrescenta a coluna nova ao fim do schema da tabela.",
                            isCorrect: true,
                        },
                        {
                            text: "A opção `overwriteSchema` igual a `true` no write, que acrescenta a coluna nova e preserva as linhas antigas.",
                            isCorrect: false,
                        },
                        {
                            text: "A configuração `spark.databricks.delta.schema.autoMerge.enabled`, que é o caminho indicado para produção.",
                            isCorrect: false,
                        },
                        {
                            text: "Um `ALTER TABLE ... SET TBLPROPERTIES` ligando column mapping, que libera coluna nova em qualquer append.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Streaming tables e materialized views",
            blocks: [
                {
                    type: "text",
                    value: "A questão mais frequente desta parte da prova é de escolha de objeto: dado um enunciado, a resposta é streaming table, materialized view ou view? No fim desta aula você decide pela fonte e pelo custo de atualização, e sabe o que o full refresh faz em cada caso.",
                },
                {
                    type: "text",
                    value: "**Streaming table.** É uma tabela gerenciada do Unity Catalog que também é destino de streaming. Cada registro é processado exatamente uma vez, assumindo fonte que só recebe acréscimo. Serve para ingestão e processamento incremental de dado que cresce continuamente. Um ou mais fluxos escrevem nela, de acréscimo ou de AUTO CDC. A atualização avalia apenas as linhas que chegaram depois da última execução e acrescenta só o dado novo.",
                },
                {
                    type: "text",
                    value: "**O papel da palavra `STREAM`.** Ela indica que a fonte referenciada no `SELECT` deve ser lida com semântica de streaming. Em tabela, se a leitura encontra alteração ou exclusão de um registro já processado, um erro é levantado, por isso o seguro é ler de fonte estática ou que só recebe acréscimo. E a regra que inverte muita resposta: não se usa `STREAM` ao criar uma materialized view.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE bronze.pedidos\nAS SELECT * FROM STREAM read_files(\n  '/Volumes/main/landing/pedidos',\n  format => 'json');\n\nCREATE OR REFRESH STREAMING TABLE silver.pedidos\nAS SELECT * FROM STREAM bronze.pedidos WHERE valor > 0;",
                },
                {
                    type: "text",
                    value: "**Materialized view.** Também é tabela gerenciada do Unity Catalog, mas é destino de lote: o resultado é recomputado conforme necessário para refletir o estado atual do dado, e o motor reprocessa apenas o dado novo ou alterado quando consegue. O fluxo dela é sempre implícito na própria definição. Serve para transformação, agregação e resultado consumido por vários datasets a jusante.",
                },
                {
                    type: "text",
                    value: "**Quando a atualização é incremental e quando é completa.** A documentação diz que a estrutura da consulta e o tipo do dado de origem determinam se a atualização incremental é suportada; para suportá-la, a origem deve estar em tabela Delta com rastreamento de linha ligado, e ligar o feed de mudança de dados é recomendado para melhor desempenho. Se o incremental não é possível ou não compensa, o sistema roda a consulta inteira e substitui o dado da view pelo novo resultado. Por padrão um modelo de custo escolhe o caminho mais barato, e `EXPLAIN CREATE MATERIALIZED VIEW` mostra se a consulta aceita incremental.",
                },
                {
                    type: "code",
                    value: "-- Sem a palavra STREAM: materialized view e destino de lote\nCREATE OR REFRESH MATERIALIZED VIEW gold.receita_por_regiao\nAS SELECT regiao, sum(valor) AS receita, count(*) AS pedidos\n   FROM silver.pedidos\n   GROUP BY regiao;\n\nCREATE OR REPLACE MATERIALIZED VIEW gold.receita_diaria\n  SCHEDULE CRON '0 30 3 * * ?' AT TIME ZONE 'UTC'\nAS SELECT date_trunc('day', data_pedido) AS dia, sum(valor) AS receita\n   FROM silver.pedidos\n   GROUP BY dia;\n\nREFRESH MATERIALIZED VIEW gold.receita_diaria ASYNC;",
                },
                {
                    type: "table",
                    value: '[["Característica","Streaming table","Materialized view","View"],["O que é","Tabela gerenciada do Unity Catalog, destino de streaming","Tabela gerenciada do Unity Catalog, destino de lote","Consulta avaliada na hora, nada persistido"],["Como atualiza","Processa só o registro novo, uma vez cada","Recomputa o resultado, incremental quando possível","Recalcula a cada acesso"],["Fonte esperada","Só acréscimo","Aceita update e delete na origem","Qualquer uma"],["Quem consome","Camadas seguintes e consulta externa","Camadas seguintes e consulta externa","Só o pipeline que a define"],["Custo","Computação e armazenamento","Computação e armazenamento, mais caro quando recomputa tudo","Sem armazenamento"]]',
                },
                {
                    type: "text",
                    value: "**O custo de atualização, que é o que a prova mede.** A streaming table paga pelo dado novo, porque processa cada registro uma vez. A materialized view paga pelo resultado: quando o incremental não se aplica, ela roda a consulta inteira. O exemplo da documentação é direto: uma materialized view sobre uma streaming table silver é recomputada por completo, lendo a tabela silver inteira, quando é atualizada. A view não paga armazenamento, porém recalcula a cada acesso e só existe dentro do pipeline que a define, o que a torna boa para passo intermediário e verificação de expectation.",
                },
                {
                    type: "quote",
                    value: "Streaming table processa cada registro uma vez e espera fonte que só recebe acréscimo. Materialized view recomputa o resultado e aceita fonte com update e delete.",
                },
                {
                    type: "text",
                    value: "**A regra que mais aparece em questão difícil.** O alvo de uma operação `AUTO CDC ... INTO` recebe update, não acréscimo, e por isso não é suportado como fonte de streaming table; a documentação diz que essas transformações são mais adequadas a materialized view. O mesmo vale para agregação complicada. Em junção, o padrão que funciona bem na streaming table é a junção de um fluxo que só cresce com uma dimensão praticamente estática, e a ressalva é que mudança posterior na tabela estática não recalcula o que já foi processado, a não ser com atualização completa. A opção `skipChangeCommits` existe para ignorar commit de alteração na fonte em alguns casos.",
                },
                {
                    type: "text",
                    value: "**Atualização completa.** Em streaming table, a atualização completa limpa o dado da tabela, limpa os checkpoints dos fluxos e reprocessa todos os registros da origem. Em materialized view, ela recomputa o resultado da consulta que a define. O risco: se o dado de entrada não está mais disponível, por exemplo registro de um barramento de mensagens já fora da retenção ou arquivo removido por política de ciclo de vida, esse registro é perdido no destino. Para proibir atualização completa em uma tabela, defina a propriedade `pipelines.reset.allowed` como `false`.",
                },
                {
                    type: "code",
                    value: "REFRESH STREAMING TABLE silver.pedidos FULL;\n\n-- Proibe atualizacao completa nesta tabela\nCREATE OR REFRESH STREAMING TABLE silver.pedidos\n  TBLPROPERTIES (pipelines.reset.allowed = false)\nAS SELECT * FROM STREAM bronze.pedidos;",
                },
                {
                    type: "text",
                    value: "**Modo do pipeline.** A configuração de modo do pipeline controla como ele processa o dado. No modo disparado, o padrão, o pipeline atualiza todas as tabelas com o dado disponível quando a atualização começa e então para, de forma que o compute roda apenas durante a atualização. No modo contínuo, ele mantém as tabelas atualizadas processando o dado novo conforme ele chega na origem, ao custo de um cluster sempre ligado, e a documentação orienta escolher contínuo somente quando existe requisito comprovado de baixa latência.",
                },
                {
                    type: "table",
                    value: '[["Modo do pipeline","O que faz","Compute","Quando usar"],["Disparado","Atualiza as tabelas com o dado disponível no início e para","Só durante a atualização","Padrão, sob demanda ou agendado"],["Contínuo","Processa o dado novo conforme ele chega na origem","Cluster sempre ligado","Só com requisito comprovado de baixa latência"]]',
                },
                {
                    type: "quote",
                    value: "O alvo de um AUTO CDC INTO recebe update, não acréscimo. Por isso ele não serve como fonte de streaming table, e a leitura dele se faz com materialized view.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em um pipeline, a camada bronze lê arquivos que só são acrescentados a um volume, e a camada gold soma valores por região para alimentar vários painéis. Qual par de objetos a documentação indica?",
                    difficulty: "facil",
                    explanation:
                        "Streaming table processa cada registro uma vez e espera fonte que só recebe acréscimo, o caso do bronze. Materialized view é destino de lote e cabe em agregação consumida por vários datasets a jusante, o caso do gold. Streaming table em agregação só é indicada com número limitado de grupos.",
                    options: [
                        {
                            text: "Streaming table no bronze, por ser fonte de acréscimo, e materialized view no gold, por ser agregação reusada.",
                            isCorrect: true,
                        },
                        {
                            text: "Materialized view no bronze, por recomputar o estado atual, e streaming table no gold, por entregar baixa latência.",
                            isCorrect: false,
                        },
                        {
                            text: "Streaming table nas duas camadas, por processar cada registro uma vez e nunca recomputar a agregação inteira.",
                            isCorrect: false,
                        },
                        {
                            text: "View temporária no bronze, por não gastar armazenamento, e streaming table no gold, por ser consumida de fora.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma materialized view sobre tabelas Delta vinha atualizando rápido e passou a recomputar o resultado inteiro a cada atualização, com custo maior. Segundo a documentação, o que determina essa escolha?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que a estrutura da consulta e o tipo do dado de origem determinam se o incremental é suportado, e que a origem deve estar em tabela Delta com rastreamento de linha ligado. O custo escala com o volume processado, não com o tamanho do warehouse.",
                    options: [
                        {
                            text: "A estrutura da consulta e a origem, porque o incremental pede tabela Delta com rastreamento de linha ligado.",
                            isCorrect: true,
                        },
                        {
                            text: "O tamanho do SQL warehouse, porque um warehouse pequeno obriga o sistema a recomputar a view inteira toda vez.",
                            isCorrect: false,
                        },
                        {
                            text: "O agendamento da view, porque só a cláusula `SCHEDULE CRON` habilita atualização incremental.",
                            isCorrect: false,
                        },
                        {
                            text: "A ordem das colunas no `GROUP BY`, porque sem `CLUSTER BY` o sistema não consegue atualizar incremental.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma streaming table consome um barramento de mensagens com retenção de 24 horas. Alguém roda a atualização completa dessa tabela para corrigir um erro de transformação. Qual é o risco, e como proibir isso depois?",
                    difficulty: "medio",
                    explanation:
                        "A atualização completa em streaming table limpa o dado, limpa o checkpoint do fluxo e reprocessa tudo da origem; se a origem já expirou, o registro é perdido. A propriedade `pipelines.reset.allowed` igual a `false` proíbe atualização completa naquela tabela.",
                    options: [
                        {
                            text: "Perder registro que saiu da origem, porque ela limpa dado e checkpoint; usar `pipelines.reset.allowed` igual a `false`.",
                            isCorrect: true,
                        },
                        {
                            text: "Duplicar registro já processado, porque ela preserva o checkpoint antigo; usar `pipelines.reset.allowed` igual a `true`.",
                            isCorrect: false,
                        },
                        {
                            text: "Travar o pipeline por conflito de schema, porque ela recria a tabela; usar `pipelines.autoOptimize.managed` igual a `false`.",
                            isCorrect: false,
                        },
                        {
                            text: "Perder apenas as métricas de qualidade, porque ela preserva o dado; usar `pipelines.reset.allowed` igual a `false`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A tabela `silver.clientes` é alvo de um `AUTO CDC INTO` em SCD TYPE 1. Você tenta criar uma streaming table que a lê com `FROM STREAM` e a atualização falha. Qual é a explicação e a saída?",
                    difficulty: "dificil",
                    explanation:
                        "O AUTO CDC aplica update e delete no alvo, e streaming table só aceita fonte que recebe acréscimo, por isso a documentação indica materialized view para ler esse alvo. O tombstone existe em SCD TYPE 2, mas não é o que impede a leitura em streaming.",
                    options: [
                        {
                            text: "O alvo de AUTO CDC recebe update, e não acréscimo; ler essa tabela com uma materialized view resolve.",
                            isCorrect: true,
                        },
                        {
                            text: "O alvo de AUTO CDC não é publicado no Unity Catalog; declarar a silver como tabela gerenciada resolve.",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo de AUTO CDC guarda tombstone de exclusão; limpar com `VACUUM` antes de ler em streaming resolve.",
                            isCorrect: false,
                        },
                        {
                            text: "O alvo de AUTO CDC não tem checkpoint próprio; apontar o `STREAM` para o fluxo e não para a tabela resolve.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline precisa rodar de hora em hora e o time quer o menor custo de compute possível. Qual modo de pipeline escolher, e por quê?",
                    difficulty: "medio",
                    explanation:
                        "No modo disparado o pipeline atualiza as tabelas com o dado disponível no começo da execução e então para, então o compute roda só durante a atualização. O contínuo mantém o dado fresco ao custo de um cluster sempre ligado e pede requisito comprovado de baixa latência.",
                    options: [
                        {
                            text: "Disparado, que atualiza as tabelas com o dado disponível no início e para, liberando o compute.",
                            isCorrect: true,
                        },
                        {
                            text: "Contínuo, que processa o dado conforme ele chega e desliga o cluster entre as chegadas de arquivo.",
                            isCorrect: false,
                        },
                        {
                            text: "Disparado com agendamento em modo contínuo, que junta execução horária e cluster sempre ligado.",
                            isCorrect: false,
                        },
                        {
                            text: "Contínuo com retentativa automática, que é o único modo indicado para carga de produção.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Expectations e AUTO CDC para manter histórico",
            blocks: [
                {
                    type: "text",
                    value: "Duas ferramentas de pipeline resolvem problemas que a prova adora: expectation decide o que fazer com a linha ruim, e AUTO CDC decide como aplicar um fluxo de mudanças sobre uma tabela, com ou sem histórico. Aqui você aprende as cláusulas, os três comportamentos de violação e a diferença entre histórico de tipo 1 e de tipo 2.",
                },
                {
                    type: "text",
                    value: "**Sintaxe da expectation.** A declaração é `CONSTRAINT nome EXPECT (condição)`, opcionalmente seguida de `ON VIOLATION FAIL UPDATE` ou `ON VIOLATION DROP ROW`. Ela entra na lista entre parênteses do `CREATE`, depois das definições de coluna e antes do `AS`, e várias restrições podem ser declaradas, separadas por vírgula. Em Python os equivalentes são os decoradores de expectation, de descarte e de falha.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE silver.pedidos (\n  CONSTRAINT id_valido        EXPECT (pedido_id IS NOT NULL) ON VIOLATION FAIL UPDATE,\n  CONSTRAINT valor_positivo   EXPECT (valor > 0)             ON VIOLATION DROP ROW,\n  CONSTRAINT regiao_conhecida EXPECT (regiao IN ('SE', 'S', 'NE', 'N', 'CO'))\n)\nCOMMENT 'Pedidos validados'\nAS SELECT * FROM STREAM bronze.pedidos;",
                },
                {
                    type: "text",
                    value: "**Comportamento de aviso, o padrão.** Sem cláusula `ON VIOLATION`, o registro inválido é mantido e gravado no dataset de destino junto com os válidos, a atualização continua normalmente e a violação é contada na aba de qualidade de dados da interface do pipeline e no log de eventos. É o comportamento que mais engana: a expectation existe, aparece no painel, e o dado ruim está na tabela.",
                },
                {
                    type: "text",
                    value: "**Descarte de linha e falha de atualização.** Com `ON VIOLATION DROP ROW`, o registro inválido é removido antes de chegar ao destino, a atualização continua normalmente e a quantidade de registros descartados é registrada junto das outras métricas do dataset. Com `ON VIOLATION FAIL UPDATE`, o registro inválido impede o sucesso da atualização: a transação é revertida de forma atômica e alguém precisa intervir antes de reprocessar. Nesse caso nenhuma métrica é registrada, porque a atualização falha antes de capturá-las, e o erro dedicado consegue identificar o registro ofensor em muitas consultas.",
                },
                {
                    type: "table",
                    value: '[["Cláusula","O registro inválido","A atualização","Métricas"],["Nenhuma, o aviso padrão","Vai para o destino junto com os válidos","Continua normalmente","Contadas na aba de qualidade e no log de eventos"],["`ON VIOLATION DROP ROW`","É descartado antes do destino","Continua normalmente","Registra a contagem de descartados"],["`ON VIOLATION FAIL UPDATE`","Impede a gravação, transação revertida","Falha e exige intervenção","Nenhuma, falha antes de capturá-las"]]',
                },
                {
                    type: "text",
                    value: "**O que acontece com os outros fluxos.** Em pipeline disparado, a falha de um fluxo não derruba os outros que rodam em paralelo. Em pipeline contínuo, o fluxo que falhou e os que dependem dele param, e o pipeline emite uma mensagem explicando o motivo.",
                },
                {
                    type: "quote",
                    value: "Sem cláusula ON VIOLATION, a expectation só avisa: o registro inválido é gravado no destino e a atualização segue. Descartar exige DROP ROW e parar exige FAIL UPDATE.",
                },
                {
                    type: "text",
                    value: "**Onde as métricas moram.** Os resultados de expectation ficam em `details:flow_progress.data_quality.expectations`, nos eventos de tipo `flow_progress`. As métricas são `dropped_records`, registros descartados por falharem em uma ou mais expectations, `passed_records`, registros que atenderam, e `failed_records`, registros que falharam. A consulta de exemplo da documentação explode esse array de JSON e soma por dataset e por nome de expectation.",
                },
                {
                    type: "code",
                    value: "CREATE OR REPLACE VIEW event_log_raw AS\n  SELECT * FROM main.ops.event_log_pipeline;\n\nSELECT\n  origin.flow_name         AS dataset,\n  exp.name                 AS expectation,\n  sum(exp.passed_records)  AS aprovados,\n  sum(exp.failed_records)  AS reprovados,\n  sum(exp.dropped_records) AS descartados\nFROM event_log_raw\nLATERAL VIEW explode(\n  from_json(details:flow_progress.data_quality.expectations,\n            'array<struct<name string, passed_records bigint,'\n            'failed_records bigint, dropped_records bigint>>')\n) AS exp\nWHERE event_type = 'flow_progress'\nGROUP BY 1, 2;",
                },
                {
                    type: "text",
                    value: "**AUTO CDC.** As APIs de AUTO CDC substituíram as APIs de APPLY CHANGES e têm a mesma sintaxe. O padrão é em dois passos: primeiro você declara a streaming table de destino, depois cria o fluxo que aplica as mudanças nela. `KEYS` e `SEQUENCE BY` são obrigatórios; `IGNORE NULL UPDATES`, `APPLY AS DELETE WHEN`, `APPLY AS TRUNCATE WHEN`, `COLUMNS`, `STORED AS` e `TRACK HISTORY ON` são opcionais. Quando `STORED AS` é omitido, o padrão é SCD TYPE 1.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE silver.clientes_atual;\n\nCREATE FLOW cdc_clientes AS AUTO CDC INTO silver.clientes_atual\nFROM STREAM bronze.clientes_cdc\nKEYS (cliente_id)\nAPPLY AS DELETE WHEN operacao = 'DELETE'\nAPPLY AS TRUNCATE WHEN operacao = 'TRUNCATE'\nSEQUENCE BY num_sequencia\nCOLUMNS * EXCEPT (operacao, num_sequencia)\nSTORED AS SCD TYPE 1;",
                },
                {
                    type: "text",
                    value: "**Sequência por.** A coluna de `SEQUENCE BY` precisa ser de um tipo ordenável, e para sequenciar por mais de uma coluna usa-se uma expressão `STRUCT`, ordenada pelo primeiro campo e desempatada pelo segundo. O efeito prático é que o evento é aplicado na sequência lógica, não na ordem de chegada: no exemplo da documentação, uma atualização com sequência 5 que chega depois de uma com sequência 6 é descartada, porque o maior valor de sequência da chave é o que vale.",
                },
                {
                    type: "text",
                    value: "**Histórico de tipo 1 e de tipo 2.** Em SCD TYPE 1, o destino guarda apenas a linha vigente de cada chave. Em SCD TYPE 2, cada mudança cria uma versão, e duas colunas geradas marcam a vigência: `__START_AT`, quando a versão passou a valer, e `__END_AT`, quando deixou de valer; linha com `__END_AT` nula é a versão ativa. Por padrão, SCD TYPE 2 cria versão nova quando qualquer coluna muda, e `TRACK HISTORY ON * EXCEPT (coluna)` faz a coluna excluída atualizar a linha vigente no lugar de abrir versão.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH STREAMING TABLE silver.clientes_hist;\n\nCREATE FLOW cdc_clientes_hist AS AUTO CDC INTO silver.clientes_hist\nFROM STREAM bronze.clientes_cdc\nKEYS (cliente_id)\nAPPLY AS DELETE WHEN operacao = 'DELETE'\nSEQUENCE BY num_sequencia\nCOLUMNS * EXCEPT (operacao, num_sequencia)\nSTORED AS SCD TYPE 2\nTRACK HISTORY ON * EXCEPT (cidade);\n\n-- Versao vigente de cada chave\nSELECT * FROM silver.clientes_hist WHERE __END_AT IS NULL;",
                },
                {
                    type: "text",
                    value: "**Cláusula de exclusão.** `APPLY AS DELETE WHEN` recebe a condição que identifica o evento de exclusão. Em SCD TYPE 1, a chave é removida do destino e não aparece mais na saída. Em SCD TYPE 2, a versão vigente é fechada em vez de removida: `__END_AT` recebe o número de sequência do evento de exclusão, e a chave continua no histórico, sem versão ativa. Em SCD TYPE 2, a linha excluída é mantida por um tempo como tombstone, para tratar dado atrasado, e a retenção disso é a propriedade `pipelines.cdc.tombstoneGCThresholdInSeconds`. Já `APPLY AS TRUNCATE WHEN` é suportado somente em SCD TYPE 1, e como ele dispara o truncamento completo do destino, a documentação pede usá-lo só em caso específico.",
                },
                {
                    type: "table",
                    value: '[["Aspecto","SCD TYPE 1","SCD TYPE 2"],["O que o destino guarda","Só a linha vigente de cada chave","Uma linha por versão da chave"],["Colunas geradas","Nenhuma","`__START_AT` e `__END_AT`"],["`APPLY AS DELETE WHEN`","Remove a chave do destino","Fecha a versão vigente com a sequência da exclusão"],["`APPLY AS TRUNCATE WHEN`","Suportado","Não suportado"],["`STORED AS` omitido","É o padrão quando a cláusula falta","Precisa ser declarado"]]',
                },
                {
                    type: "text",
                    value: "**Ignorar atualização nula.** `IGNORE NULL UPDATES` permite ingerir atualização parcial: quando um evento de mudança casa com uma linha existente, a coluna que vem nula preserva o valor atual do destino em vez de sobrescrever com nulo. As variações com `ON` limitam isso a uma lista de colunas ou a todas menos uma lista. Por padrão, nulo sobrescreve o valor existente.",
                },
                {
                    type: "quote",
                    value: "Em SCD TYPE 2, APPLY AS DELETE WHEN não apaga a linha: fecha a versão vigente, e __END_AT recebe a sequência da exclusão. A chave continua no histórico.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma streaming table declara `CONSTRAINT valor_ok EXPECT (valor > 0)` sem cláusula `ON VIOLATION`. O que acontece com uma linha que chega com valor negativo?",
                    difficulty: "facil",
                    explanation:
                        "Sem `ON VIOLATION` o comportamento é avisar: o registro inválido é gravado no destino junto com os válidos, a atualização segue e a violação aparece na aba de qualidade e no log de eventos. Descartar exige `DROP ROW` e parar exige `FAIL UPDATE`.",
                    options: [
                        {
                            text: "Ela é gravada no destino e o pipeline segue, com a violação contada no log de eventos.",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é descartada antes do destino e o pipeline segue, com a violação contada no log de eventos.",
                            isCorrect: false,
                        },
                        {
                            text: "Ela faz a atualização falhar e o pipeline para, com a violação contada no log de eventos.",
                            isCorrect: false,
                        },
                        {
                            text: "Ela vai para uma tabela de quarentena automática e o pipeline segue, sem contagem no log.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você troca `ON VIOLATION DROP ROW` por `ON VIOLATION FAIL UPDATE` em uma expectation e nota que as métricas daquela expectation deixaram de aparecer no log de eventos. Por quê?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que com `FAIL UPDATE` nenhuma métrica é registrada, porque a atualização falha antes de capturá-las, e um erro dedicado identifica o registro ofensor. Com `DROP ROW` a contagem de descartados continua indo para as métricas do dataset.",
                    options: [
                        {
                            text: "Com `FAIL UPDATE` a atualização toda é revertida antes de a métrica daquela expectation ser capturada.",
                            isCorrect: true,
                        },
                        {
                            text: "Com `FAIL UPDATE` a métrica passa a viver só na aba de qualidade, e o log de eventos deixa de recebê-la.",
                            isCorrect: false,
                        },
                        {
                            text: "Com `FAIL UPDATE` a contagem vira `dropped_records`, e a consulta antiga buscava por `failed_records`.",
                            isCorrect: false,
                        },
                        {
                            text: "Com `FAIL UPDATE` a métrica só aparece em pipeline contínuo, porque o disparado aborta todos os fluxos.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um lote de mudanças chega fora de ordem: a atualização com `num_sequencia` 6 é processada e depois chega a atualização com `num_sequencia` 5 para a mesma chave. Com `SEQUENCE BY num_sequencia` em SCD TYPE 1, qual é o resultado?",
                    difficulty: "medio",
                    explanation:
                        "`SEQUENCE BY` ordena os eventos de mudança pela coluna indicada, e vence o maior valor de sequência de cada chave, então o evento atrasado com sequência menor é descartado. Ordem de chegada não importa, e é exatamente esse o problema que a cláusula resolve.",
                    options: [
                        {
                            text: "A atualização 5 é descartada, porque a maior sequência já vista é a que vale para aquela chave.",
                            isCorrect: true,
                        },
                        {
                            text: "A atualização 5 sobrescreve a 6, porque o AUTO CDC aplica os eventos na ordem de chegada do lote.",
                            isCorrect: false,
                        },
                        {
                            text: "As duas permanecem na tabela, porque SCD TYPE 1 guarda uma linha por valor de sequência da chave.",
                            isCorrect: false,
                        },
                        {
                            text: "O fluxo falha com erro de sequência fora de ordem, porque `SEQUENCE BY` exige lote já ordenado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um AUTO CDC com `STORED AS SCD TYPE 2` e `APPLY AS DELETE WHEN operacao = 'DELETE'`, chega um evento de exclusão para a chave 123 com número de sequência 6. O que a tabela de histórico mostra depois?",
                    difficulty: "dificil",
                    explanation:
                        "Em SCD TYPE 2 a exclusão não apaga a linha: ela fecha a versão vigente, e `__END_AT` recebe o número de sequência do evento de exclusão, deixando a chave sem versão ativa. Remover a chave do destino é o comportamento de SCD TYPE 1.",
                    options: [
                        {
                            text: "A versão vigente da chave 123 fechada com `__END_AT` igual a 6, e nenhuma versão ativa para ela.",
                            isCorrect: true,
                        },
                        {
                            text: "A chave 123 removida de todas as versões da tabela, porque a exclusão apaga o histórico da chave.",
                            isCorrect: false,
                        },
                        {
                            text: "Uma versão nova da chave 123 com `__START_AT` igual a 6 e as colunas de negócio todas nulas.",
                            isCorrect: false,
                        },
                        {
                            text: "A versão vigente da chave 123 intacta, porque SCD TYPE 2 ignora exclusão sem `APPLY AS TRUNCATE`.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um fluxo de AUTO CDC foi escrito sem a cláusula `STORED AS` e com `APPLY AS TRUNCATE WHEN`. Na revisão de código, perguntam o que esse fluxo faz. Qual resposta está correta?",
                    difficulty: "dificil",
                    explanation:
                        "`STORED AS` é opcional e o padrão é SCD TYPE 1, e a documentação diz que `APPLY AS TRUNCATE WHEN` é suportado somente em SCD TYPE 1. Por isso o código é válido. Quem assume SCD TYPE 2 como padrão erra nas duas pontas da questão.",
                    options: [
                        {
                            text: "Grava em SCD TYPE 1, que é o padrão, e o truncamento é válido, porque só o tipo 1 o suporta.",
                            isCorrect: true,
                        },
                        {
                            text: "Grava em SCD TYPE 2, que é o padrão, e o truncamento é válido, porque os dois tipos o suportam.",
                            isCorrect: false,
                        },
                        {
                            text: "Falha na validação, porque `STORED AS` é obrigatório sempre que `APPLY AS TRUNCATE WHEN` aparece.",
                            isCorrect: false,
                        },
                        {
                            text: "Grava em SCD TYPE 1, que é o padrão, e o truncamento é ignorado, porque ele só vale no tipo 2.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Arquitetura medallion do bronze ao gold",
            blocks: [
                {
                    type: "text",
                    value: "Medallion é a pergunta de modelagem que a prova faz com palavras do dia a dia: onde essa transformação deve morar? No fim desta aula você sabe o que entra em cada camada, por que a camada existe, como o pipeline descobre a ordem de execução sozinho e onde olhar quando algo sai errado.",
                },
                {
                    type: "text",
                    value: "**O que a arquitetura medallion é.** A documentação a descreve como uma série de camadas de dados que denotam a qualidade do dado armazenado no lakehouse, um padrão de projeto que melhora estrutura e qualidade passo a passo por bronze, silver e gold. Ela também é chamada de arquitetura de múltiplos saltos, e é apresentada como boa prática recomendada, não como exigência.",
                },
                {
                    type: "text",
                    value: "**Bronze.** Guarda dado bruto e não validado, mantendo o estado bruto da fonte nos formatos originais, e retém o histórico para que o time possa reprocessar e auditar. A validação é mínima, e a recomendação é armazenar a maior parte dos campos como string, `VARIANT` ou binário, para se proteger de mudança de schema na origem. O bronze serve as cargas que alimentam as tabelas silver, e não o analista ou o cientista de dados direto.",
                },
                {
                    type: "text",
                    value: "**Silver.** Guarda dado validado, limpo e enriquecido. É onde acontecem a limpeza, a deduplicação e a normalização, o que melhora a qualidade corrigindo erro e inconsistência, e também a imposição de schema, o tratamento de nulo, o tratamento de dado fora de ordem, o cast de tipo, as junções e as verificações de qualidade. A regra que a prova cobra: a silver deve incluir ao menos uma representação validada e não agregada de cada registro.",
                },
                {
                    type: "code",
                    value: "CREATE OR REFRESH MATERIALIZED VIEW silver.pedidos_unicos (\n  CONSTRAINT chave_valida EXPECT (pedido_id IS NOT NULL) ON VIOLATION DROP ROW\n)\nAS WITH ranqueado AS (\n  SELECT *,\n         row_number() OVER (PARTITION BY pedido_id ORDER BY ingest_ts DESC) AS rn\n  FROM bronze.pedidos\n)\nSELECT * EXCEPT (rn) FROM ranqueado WHERE rn = 1;",
                },
                {
                    type: "text",
                    value: "**Gold.** Guarda dado refinado e agregado para análise, painel, aprendizado de máquina e aplicação. Ele se alinha à lógica e aos requisitos de negócio, com datasets que mapeiam função e necessidade de negócio, é onde você modela para relatório, tipicamente com modelo dimensional, e costuma ser filtrado por período ou região. Pode haver mais de uma camada gold, uma por área de negócio, por exemplo pessoas, finanças e tecnologia.",
                },
                {
                    type: "table",
                    value: '[["Camada","O que entra","Transformação típica","Quem consome"],["Bronze","Dado bruto no formato da fonte, com histórico","Validação mínima, campo como string, `VARIANT` ou binário","As tabelas silver, não o analista"],["Silver","Dado validado, limpo e enriquecido","Deduplicação, normalização, cast, junção, verificação de qualidade","Ciência de dados, consulta ad hoc e a camada gold"],["Gold","Dado refinado e agregado pela regra de negócio","Agregação, modelo dimensional, filtro por período ou região","Relatório, painel, aplicação e modelo"]]',
                },
                {
                    type: "quote",
                    value: "As camadas medallion denotam a qualidade do dado. Bronze guarda o bruto para reprocessar e auditar, silver entrega o registro validado e não agregado, gold entrega o número que o negócio usa.",
                },
                {
                    type: "text",
                    value: "**Por que a camada existe.** O bronze existe para você poder reprocessar sem pedir o dado de novo à fonte: se a regra de limpeza estava errada, você corrige a silver e recarrega a partir do bruto já guardado. A silver existe para que a correção de qualidade aconteça uma vez, e não em cada consulta, e para entregar o registro no grão original a quem precisa dele. O gold existe para que o relatório leia um resultado já calculado, em vez de recomputar a agregação a cada acesso.",
                },
                {
                    type: "text",
                    value: "**Dependência entre datasets.** O pipeline avalia todas as definições de dataset em todos os seus arquivos de origem e constrói o grafo de fluxo de dados antes de qualquer consulta rodar. A consequência é que a ordem das consultas no arquivo define a ordem de avaliação do código, não a ordem de execução das consultas, e você não precisa ordenar nada à mão. A referência de um dataset é feita pelo nome: por padrão toda leitura de tabela usa o catálogo e o schema definidos na configuração do pipeline, e o nome totalmente qualificado também funciona. O prefixo `LIVE` é recurso de pipeline descontinuado, do modo de publicação legado, e no modo padrão ele é ignorado em silêncio.",
                },
                {
                    type: "code",
                    value: "-- Bronze: ingestao incremental, carimbo e origem do arquivo\nCREATE OR REFRESH STREAMING TABLE bronze.eventos\nAS SELECT *, current_timestamp() AS ingest_ts, _metadata.file_path AS arquivo\n   FROM STREAM read_files('/Volumes/main/landing/eventos', format => 'json');\n\n-- Silver: tipagem e qualidade, grao original preservado\nCREATE OR REFRESH STREAMING TABLE silver.eventos (\n  CONSTRAINT valor_positivo EXPECT (valor > 0) ON VIOLATION DROP ROW\n)\nAS SELECT cast(id AS bigint) AS id,\n          cast(valor AS decimal(12,2)) AS valor,\n          regiao, ingest_ts\n   FROM STREAM bronze.eventos;\n\n-- Gold: agregacao alinhada ao negocio\nCREATE OR REFRESH MATERIALIZED VIEW gold.receita_regiao\nAS SELECT regiao, sum(valor) AS receita\n   FROM silver.eventos GROUP BY regiao;",
                },
                {
                    type: "text",
                    value: "**O log de eventos como fonte de diagnóstico.** O log de eventos do pipeline guarda log de auditoria, verificação de qualidade de dados, progresso do pipeline e linhagem de dados. Por padrão o pipeline grava em uma tabela Delta oculta no catálogo e no schema padrão dele, com nome `event_log_` seguido do identificador do pipeline, com os traços trocados por sublinhado; ela não aparece no Catalog Explorer, e o acesso é pela função `event_log()`. Você pode publicar o log em um schema do Unity Catalog pela configuração avançada, informando catálogo, schema e nome da tabela. A função só pode ser chamada pelo proprietário da tabela, por isso a prática recomendada é criar uma view sobre o log antes de tratar privilégio.",
                },
                {
                    type: "code",
                    value: "-- Pelo identificador do pipeline, rodando como o usuario do pipeline\nSELECT * FROM event_log('<id-do-pipeline>');\n\n-- Pelo nome de uma streaming table ou materialized view\nSELECT * FROM event_log(TABLE(main.bronze.eventos));\n\n-- Linhagem: quais datasets alimentam cada saida\nSELECT details:flow_definition.output_dataset AS saida,\n       details:flow_definition.input_datasets AS entradas,\n       details:flow_definition.flow_type      AS tipo_de_fluxo\nFROM event_log_raw\nWHERE details:flow_definition IS NOT NULL\nORDER BY timestamp;",
                },
                {
                    type: "table",
                    value: '[["`event_type`","Para que serve no diagnóstico"],["`create_update`","Marca o início de uma atualização"],["`update_progress`","Estado da atualização, como concluída, falha ou cancelada"],["`flow_progress`","Estado do fluxo, métricas de linha e métricas de qualidade"],["`flow_definition`","Linhagem, com dataset de saída, datasets de entrada, tipo de fluxo e schema"],["`user_action`","Ações como criação e início, com o nome do usuário"]]',
                },
                {
                    type: "quote",
                    value: "A ordem das consultas no arquivo define a ordem de avaliação do código, não a ordem de execução. O pipeline monta o grafo de fluxo de dados antes de rodar qualquer consulta.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um time quer poder reprocessar a silver depois de corrigir uma regra de limpeza, sem pedir o arquivo de novo para a fonte. O que a documentação indica guardar no bronze?",
                    difficulty: "facil",
                    explanation:
                        "O bronze guarda o estado bruto da fonte no formato original, com histórico, para permitir reprocessamento e auditoria, e recebe validação mínima. Tipagem e deduplicação são trabalho da silver, e agregação é trabalho da gold.",
                    options: [
                        {
                            text: "O dado bruto no formato da fonte, com todo o histórico, e validação mínima antes da gravação.",
                            isCorrect: true,
                        },
                        {
                            text: "O dado já tipado e deduplicado, com histórico, para a silver só aplicar a regra de negócio.",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o último lote recebido, em formato colunar, porque o histórico vem da viagem no tempo.",
                            isCorrect: false,
                        },
                        {
                            text: "O dado agregado por dia, com histórico, para a silver não precisar varrer o arquivo bruto.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A bronze recebe o mesmo pedido várias vezes, com `ingest_ts` diferente em cada chegada. Na silver você precisa de uma linha por `pedido_id`, a mais recente. Qual abordagem cabe na camada?",
                    difficulty: "medio",
                    explanation:
                        "Deduplicar por chave guardando a linha mais nova é trabalho de função de janela: `row_number` particionado pela chave, ordenado pelo carimbo em ordem decrescente, filtrando o rank 1. `DISTINCT` compara a linha inteira, então a repetição com carimbo diferente sobrevive.",
                    options: [
                        {
                            text: "Ranquear com `row_number() OVER (PARTITION BY pedido_id ORDER BY ingest_ts DESC)` e manter o rank 1.",
                            isCorrect: true,
                        },
                        {
                            text: "Aplicar `DISTINCT` na consulta inteira, que remove a repetição por `pedido_id` e deixa a linha mais nova.",
                            isCorrect: false,
                        },
                        {
                            text: "Agregar com `GROUP BY pedido_id` e `max(ingest_ts)`, que já devolve as outras colunas da linha mais nova.",
                            isCorrect: false,
                        },
                        {
                            text: "Chamar `dropDuplicates()` sem argumento, que compara só a chave de negócio e deixa a linha mais nova.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um painel de diretoria precisa de receita por região e por mês, e o time de ciência de dados precisa do registro validado no grão original. Como distribuir isso entre silver e gold?",
                    difficulty: "medio",
                    explanation:
                        "A documentação pede que a silver tenha ao menos uma representação validada e não agregada de cada registro, e coloca a agregação alinhada ao negócio na gold. A silver não é camada proibida: ela atende ciência de dados e consulta ad hoc.",
                    options: [
                        {
                            text: "A gold entrega a agregação por região e mês, e a silver mantém o registro validado e não agregado.",
                            isCorrect: true,
                        },
                        {
                            text: "A silver entrega a agregação por região e mês, e a gold mantém o registro validado e não agregado.",
                            isCorrect: false,
                        },
                        {
                            text: "A gold entrega as duas coisas, porque a silver é camada interna e não deve ser consultada por time nenhum.",
                            isCorrect: false,
                        },
                        {
                            text: "O bronze entrega o registro validado e não agregado, e a gold entrega a agregação por região e mês.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um arquivo SQL de pipeline, a definição da gold aparece antes da silver, e a silver antes da bronze. O time teme que a execução saia na ordem errada. O que acontece?",
                    difficulty: "dificil",
                    explanation:
                        "O pipeline avalia todas as definições de dataset em todos os arquivos e monta o grafo de fluxo de dados antes de executar. A ordem no arquivo define a ordem de avaliação, não a de execução. O prefixo `LIVE` é legado e é ignorado no modo de publicação padrão.",
                    options: [
                        {
                            text: "Nada, porque o pipeline lê todas as definições e monta o grafo antes de rodar qualquer consulta.",
                            isCorrect: true,
                        },
                        {
                            text: "A gold falha por fonte inexistente, porque o pipeline executa as consultas na ordem do arquivo.",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, desde que cada consulta qualifique a fonte com o prefixo `LIVE`, que é o que ordena o grafo.",
                            isCorrect: false,
                        },
                        {
                            text: "A gold roda com dado vazio na primeira execução e só se corrige na atualização seguinte.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de uma mudança, a gold passou a ler uma tabela que ninguém esperava. Você quer descobrir, pelo log de eventos do pipeline, quais datasets alimentam cada saída. Qual campo consultar?",
                    difficulty: "dificil",
                    explanation:
                        "A linhagem vive nos eventos com `details:flow_definition` preenchido, que expõem o dataset de saída, os datasets de entrada, o tipo de fluxo e o schema. O `flow_progress` carrega estado do fluxo e métricas de linha e de qualidade, não a linhagem.",
                    options: [
                        {
                            text: "`details:flow_definition`, que traz o dataset de saída, os de entrada, o tipo de fluxo e o schema.",
                            isCorrect: true,
                        },
                        {
                            text: "`details:flow_progress`, que traz o dataset de saída e as métricas de linha de cada dataset do grafo.",
                            isCorrect: false,
                        },
                        {
                            text: "`details:update_progress`, que traz o estado da atualização e a lista de fontes lidas pelo fluxo.",
                            isCorrect: false,
                        },
                        {
                            text: "`details:user_action`, que traz quem rodou a atualização e quais fontes a consulta declarou ler.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Orquestração com Lakeflow Jobs",
    aulas: [
        {
            titulo: "Criar um job: tasks, DAG e dependências",
            blocks: [
                {
                    type: "text",
                    value: 'No fim desta aula você olha um pedido como "ingerir o arquivo do dia, rodar o pipeline que limpa a tabela e só então atualizar o painel" e decide quantas tasks o job precisa, qual tipo de task cobre cada passo e como amarrar as dependências para que a plataforma execute em paralelo tudo que pode ser paralelo.\n\nOrquestração na Databricks se chama **Lakeflow Jobs**. Na barra lateral do workspace o item é **Jobs & Pipelines**. A documentação separa os dois objetos assim: o job é o recurso principal para coordenar, agendar e executar as suas operações, e a task é uma unidade específica de trabalho dentro de um job. Todo job tem uma ou mais tasks, e você cria um job novo configurando a primeira task.',
                },
                {
                    type: "text",
                    value: "Cada task recebe um nome próprio, o **task_key**, de 1 a 100 caracteres, aceitando letra, número, hífen e sublinhado. É esse nome que você escolhe no campo **Depends on** das outras tasks, e é por ele que o grafo se forma.\n\nO conjunto de tasks e dependências aparece na aba **Tasks** como um **DAG**, grafo acíclico dirigido. A regra de execução é direta: a Databricks roda as tasks de cima antes das de baixo e paraleliza o máximo de tasks que conseguir. Duas tasks que dependem da mesma task anterior, e não uma da outra, começam juntas.\n\nDois detalhes que a prova usa como pegadinha. O campo **Depends on** só aparece quando o job tem mais de uma task. E **Maximum concurrent runs** vale 1 em todo job novo, então uma execução disparada enquanto outra está no ar fica com status **Skipped** até você aumentar o limite em **Advanced settings**.",
                },
                {
                    type: "table",
                    value: '[["Tipo de task","O que ela roda","Detalhe que a doc registra"],["Notebook","um notebook do workspace ou do Git","lê parâmetro com dbutils.widgets"],["Python script","um arquivo .py","parâmetro chega como argumento de linha de comando"],["Python wheel","o entry point de um pacote wheel","serverless de jobs é o recomendado"],["SQL","consulta, dashboard ou alerta de SQL","roda em SQL warehouse serverless ou pro"],["Pipeline","um pipeline do Lakeflow já existente","inicia uma única atualização e para no fim dela"],["dbt","um projeto dbt","exige fonte versionada em repositório Git"],["JAR","a classe principal de um JAR","compute clássico de jobs é o recomendado"],["Spark Submit","uma chamada spark-submit","só compute clássico de jobs"],["Run Job","outro job do mesmo workspace","não aninha mais de três tasks Run Job"],["If/else","um ramo do DAG conforme expressão booleana","adiciona desvio condicional ao job"],["For each","outra task em laço sobre um array","o array pode ser gerado dinamicamente"]]',
                },
                {
                    type: "text",
                    value: "Duas dessas tasks aparecem muito na prova.\n\nA task **Pipeline** aponta para um pipeline do Lakeflow que já existe, pelo campo `pipeline_id`. Em job agendado ou disparado por gatilho, ela inicia **uma única atualização** e termina quando a atualização termina. O campo `full_refresh` é booleano e vale `false` por padrão. Como um pipeline roda só uma atualização por vez, um job que contém task de pipeline fica limitado a uma execução concorrente mesmo que `max_concurrent_runs` esteja acima de 1.\n\nA task **Run Job** dispara outro job do workspace, escolhido no campo **Job**, e serve para quebrar uma orquestração grande em jobs reutilizáveis. A documentação não suporta dependência circular nem aninhamento de mais de três tasks Run Job.",
                },
                {
                    type: "code",
                    value: '{\n  "name": "vendas_diarias",\n  "max_concurrent_runs": 1,\n  "tasks": [\n    {\n      "task_key": "ingestao",\n      "notebook_task": { "notebook_path": "/Workspace/etl/bronze" }\n    },\n    {\n      "task_key": "pipeline_silver",\n      "depends_on": [{ "task_key": "ingestao" }],\n      "pipeline_task": {\n        "pipeline_id": "a12cd3e4-0ab1-1abc-1a2b-1a2bcd3e4fg5",\n        "full_refresh": false\n      }\n    },\n    {\n      "task_key": "publica_resumo",\n      "depends_on": [{ "task_key": "pipeline_silver" }],\n      "run_if": "ALL_SUCCESS",\n      "sql_task": {\n        "warehouse_id": "0123456789abcdef",\n        "query": { "query_id": "fedcba9876543210" }\n      }\n    }\n  ]\n}',
                },
                {
                    type: "quote",
                    value: "O campo Depends on monta o DAG, e o DAG decide a ordem: a Databricks roda as tasks de cima antes das de baixo e executa em paralelo tudo que não depende uma da outra.",
                },
                {
                    type: "text",
                    value: "Um job não tem privilégio próprio sobre dado. Ele roda com a identidade do campo **Run as**, e é essa identidade que a Databricks avalia contra as concessões do **Unity Catalog** em tabela, volume, modelo e view, além das ACLs de notebook, de compute e dos secrets. O criador do job é o **IS OWNER** e também o **Run as** padrão. Para produção, a documentação recomenda trocar o Run as por um **service principal**, para que a execução não fique presa aos privilégios de uma pessoa.\n\nDois detalhes derrubam job em produção: o privilégio do Run as é avaliado **durante** a execução, então remover uma concessão com o job no ar pode fazer a execução falhar, e a concessão do Unity Catalog ainda exige um modo de acesso de compute compatível.",
                },
                {
                    type: "table",
                    value: '[["Permissão no job","O que ela libera"],["CAN VIEW","ver resultado, detalhe, histórico e status das execuções"],["CAN MANAGE RUN","disparar e cancelar execuções, somando o que CAN VIEW libera"],["CAN MANAGE","editar a definição do job, as tasks e as permissões, pausar e retomar gatilho"],["IS OWNER","tudo de CAN MANAGE, e é o valor padrão do campo Run as"]]',
                },
            ],
            questions: [
                {
                    statement:
                        "Na terminologia do Lakeflow Jobs, qual é a relação entre job e task?",
                    difficulty: "facil",
                    explanation:
                        "A doc define o job como o recurso que coordena, agenda e executa, e a task como a unidade de trabalho dentro dele. A troca dos dois papéis é o distrator mais comum porque a frase fica igualmente plausível.",
                    options: [
                        {
                            text: "O job coordena e agenda a execução, e cada task é uma unidade de trabalho dentro dele",
                            isCorrect: true,
                        },
                        {
                            text: "A task coordena e agenda a execução, e cada job é uma unidade de trabalho dentro dela",
                            isCorrect: false,
                        },
                        {
                            text: "Job e task são o mesmo objeto, com um nome na interface e outro na API de orquestração",
                            isCorrect: false,
                        },
                        {
                            text: "O job tem sempre uma única task, e vários passos exigem encadear um job para cada passo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um pipeline do Lakeflow já existe no workspace e precisa rodar como terceiro passo de um job diário. Qual task usar, e o que ela faz ao rodar?",
                    difficulty: "medio",
                    explanation:
                        "A task Pipeline aponta o pipeline_id e, em job agendado, inicia uma única atualização, terminando junto com ela. Chamar o notebook do pipeline não é o caminho: a task dedicada existe justamente para isso.",
                    options: [
                        {
                            text: "Task Pipeline, que aponta o pipeline_id e inicia uma única atualização, terminando com ela",
                            isCorrect: true,
                        },
                        {
                            text: "Task Notebook com dbutils.notebook.run no notebook do pipeline, que roda e espera o fim dela",
                            isCorrect: false,
                        },
                        {
                            text: "Task Run Job apontando o pipeline, que a Databricks envolve num job interno e executa",
                            isCorrect: false,
                        },
                        {
                            text: "Task SQL com o comando REFRESH PIPELINE, que enfileira a atualização e devolve o controle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job tem quatro tasks: `limpa` depende de `extrai`, `agrega` depende de `extrai`, e `publica` depende de `limpa` e de `agrega`. O que a Databricks faz na execução?",
                    difficulty: "medio",
                    explanation:
                        "A doc diz que tasks de cima rodam antes das de baixo e que a plataforma paraleliza o que puder. Como limpa e agrega não dependem uma da outra, elas começam juntas; a ordem de criação das tasks não influencia nada.",
                    options: [
                        {
                            text: "Roda `extrai`, depois `limpa` e `agrega` em paralelo, e `publica` quando as duas terminam",
                            isCorrect: true,
                        },
                        {
                            text: "Roda `extrai`, `limpa`, `agrega` e `publica` em sequência, na ordem exata de criação das tasks",
                            isCorrect: false,
                        },
                        {
                            text: "Roda as quatro tasks em paralelo e usa Depends on apenas para ordenar o desenho do grafo",
                            isCorrect: false,
                        },
                        {
                            text: "Roda `extrai` e `publica` em paralelo, porque só as duas do meio declaram dependência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job com `max_concurrent_runs` igual a 3 inclui uma task do tipo Pipeline. Quantas execuções desse job podem ficar ativas ao mesmo tempo?",
                    difficulty: "dificil",
                    explanation:
                        "Um pipeline roda só uma atualização por vez, e a doc registra que isso limita o job inteiro a uma execução concorrente. Confiar no valor 3 é a armadilha: o limite do job não vence a restrição do pipeline.",
                    options: [
                        {
                            text: "Uma, porque o pipeline roda uma atualização por vez e isso limita o job todo a uma execução",
                            isCorrect: true,
                        },
                        {
                            text: "Três, porque o limite do job é respeitado e cada execução abre a sua própria atualização nova",
                            isCorrect: false,
                        },
                        {
                            text: "Três, porque a task Pipeline enfileira as atualizações e processa uma depois da outra",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhuma, porque a doc proíbe task Pipeline em job com concorrência configurada acima de 1",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Por que a documentação recomenda configurar o campo Run as de um job de produção com um service principal em vez da pessoa que criou o job?",
                    difficulty: "medio",
                    explanation:
                        "As concessões do Unity Catalog são avaliadas contra a identidade do Run as, que por padrão é o criador do job. Service principal não ganha privilégio automático: ele só desacopla a execução da conta de uma pessoa.",
                    options: [
                        {
                            text: "Porque o job é avaliado contra as concessões do Run as, que por padrão é quem criou o job",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o service principal recebe automaticamente toda concessão do Unity Catalog no metastore",
                            isCorrect: false,
                        },
                        {
                            text: "Porque Run as de pessoa física obriga o job a usar compute clássico, sem Unity Catalog",
                            isCorrect: false,
                        },
                        {
                            text: "Porque sem service principal o job herda as concessões do dono do compute que executa a task",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Gatilhos: agenda, chegada de arquivo, tabela e contínuo",
            blocks: [
                {
                    type: "text",
                    value: 'Esta aula responde a pergunta que a prova faz em quase toda questão de gatilho: dado um enunciado como "o parceiro deposita arquivos num volume em horário imprevisível", qual tipo de gatilho escolher e por quê.\n\nNo painel **Job details**, na seção **Schedules & Triggers**, você clica em **Add trigger** e escolhe o **Trigger type**. As opções são **Scheduled**, **Table update**, **File arrival**, **Model update**, que está em Beta, e **Continuous**. Sem nenhum gatilho, o job fica em **None (manual)** e só roda pelo botão **Run now** ou por chamada externa.',
                },
                {
                    type: "text",
                    value: "O gatilho **Scheduled** tem dois formatos. Em **Schedule type** você escolhe **Simple**, informando intervalo e unidade de tempo, ou **Advanced**, informando período, hora de início e fuso, com a opção **Show Cron Syntax** para editar a expressão em **Quartz Cron Syntax**.\n\nTrês fatos da doc que viram questão. A Databricks impõe um intervalo mínimo de **10 segundos** entre execuções consecutivas disparadas pela agenda, qualquer que seja a expressão cron. Em fuso com horário de verão, um job de hora em hora é pulado ou parece atrasado de uma a duas horas na virada, e quem precisa de hora absoluta escolhe **UTC**. E o agendador não é feito para baixa latência: uma execução pode atrasar alguns minutos por problema de rede ou de nuvem.",
                },
                {
                    type: "table",
                    value: '[["Gatilho","Dispara quando","Caso de uso típico"],["Scheduled","o relógio bate o horário da agenda","carga diária que precisa estar pronta às 5 da manhã"],["File arrival","arquivo novo chega no local monitorado","parceiro deposita arquivo em horário imprevisível"],["Table update","a tabela de origem monitorada é atualizada","agregado que só vale quando a tabela base muda"],["Continuous","a execução anterior termina, com sucesso ou falha","streaming que precisa ficar sempre no ar"],["None (manual)","alguém clica Run now ou chama a API","job acionado por orquestrador externo"]]',
                },
                {
                    type: "text",
                    value: "O gatilho **File arrival** exige **Unity Catalog** habilitado no workspace e um local de armazenamento que seja **volume** ou **external location** do Unity Catalog. Você precisa de **READ** no local e de **CAN MANAGE** no job, e a Databricks recomenda habilitar **file events** na external location, o que exige ser o dono dela ou ter o privilégio **MANAGE**.\n\nO gatilho faz o melhor esforço para verificar arquivos novos **a cada minuto**, e não cobra nada além do custo de listagem da nuvem. Ele desce recursivamente em todos os subdiretórios do caminho configurado. Só arquivo novo dispara: sobrescrever um arquivo com outro de mesmo nome não dispara. O caminho não aceita curinga como asterisco ou interrogação, nem tabela externa, nem managed location de catálogo ou de schema. Em local **sem** file events, valem dois limites: no máximo **50 jobs** com gatilho de chegada de arquivo por workspace, e até **10.000 arquivos** no local monitorado. Com file events habilitado, não há limite de quantidade de arquivos.",
                },
                {
                    type: "text",
                    value: "Os dois campos avançados de **File arrival** e de **Table update** resolvem problemas diferentes, e a prova troca um pelo outro.\n\n**Minimum time between triggers in seconds** é um tempo de espera: limita o job a no máximo uma execução por intervalo. Arquivos que chegam durante a espera só geram execução quando o intervalo vence. Use quando chegada frequente não pode criar execução em sequência.\n\n**Wait after last change in seconds** é um amortecedor: espera esse tempo depois da última chegada antes de começar, e cada chegada nova reinicia o contador. Use quando os arquivos chegam em lote e você quer processar o lote inteiro numa única execução. Os dois podem ser usados juntos, e nesse caso o gatilho espera primeiro o intervalo mínimo e depois o tempo sem mudança.",
                },
                {
                    type: "code",
                    value: '{\n  "schedule": {\n    "quartz_cron_expression": "0 0 5 * * ?",\n    "timezone_id": "America/Sao_Paulo",\n    "pause_status": "UNPAUSED"\n  }\n}\n\n{\n  "trigger": {\n    "pause_status": "UNPAUSED",\n    "file_arrival": {\n      "url": "/Volumes/vendas/bronze/chegada/",\n      "min_time_between_triggers_seconds": 900,\n      "wait_after_last_change_seconds": 60\n    }\n  }\n}\n\n{\n  "trigger": {\n    "table_update": {\n      "table_names": ["vendas.bronze.pedidos", "vendas.bronze.itens"],\n      "condition": "ALL_UPDATED",\n      "min_time_between_triggers_seconds": 120,\n      "wait_after_last_change_seconds": 60\n    }\n  }\n}\n\n{\n  "continuous": { "pause_status": "UNPAUSED", "task_retry_mode": "ON_FAILURE" }\n}',
                },
                {
                    type: "text",
                    value: "O gatilho **Table update** monitora até **10 tabelas** por gatilho e dispara em mudança de dado, como update, merge e delete. Quando você escolhe mais de uma tabela, o campo **Trigger when** decide se a execução sai quando **All tables are updated** ou quando **Any table is updated**, o que na API corresponde a `ALL_UPDATED` e `ANY_UPDATED`.\n\nA exigência de permissão é específica: a identidade do campo **Run as** precisa de **SELECT** em cada objeto monitorado, mais **USE CATALOG** e **USE SCHEMA** no catálogo e no schema. Se faltar SELECT, o gatilho falha na avaliação e o job não roda. Ele aceita tabela gerenciada Delta e Iceberg do Unity Catalog, tabela externa do Unity Catalog com Delta Lake, materialized view, streaming table, além de view e metric view que dependam de tabelas suportadas. Para view, as tabelas de origem contam no limite de 10. Antes de salvar, o botão **Test trigger** valida a configuração.",
                },
                {
                    type: "text",
                    value: "O gatilho **Continuous** existe para manter o job sempre no ar: ele dispara uma execução nova sempre que a anterior termina, tanto por sucesso quanto por falha. O atraso entre o fim de uma execução e o começo da próxima deve ficar abaixo de **60 segundos**. Só pode existir uma instância do job rodando, e o gatilho contínuo não combina com nenhum outro gatilho, porque o job já roda sem parar.\n\nE aqui ficam as três restrições que a prova cobra. Em job contínuo você **não** usa dependência entre tasks e **não** usa política de tentativas: o job inteiro é repetido na falha, com algoritmo de recuo exponencial. O que você configura é o **Task retry mode**, com os valores **On failure**, que é o padrão do modo contínuo e repete a task que falhou, ou **Never**, que repete só no nível do job. Para parar, clique em **Pause**, e para voltar, em **Resume**. Para aplicar configuração nova a uma execução em andamento, use **Restart run**.",
                },
                {
                    type: "quote",
                    value: "Agenda responde a relógio, chegada de arquivo e atualização de tabela respondem a evento, e contínuo não responde a nada: ele começa de novo sempre que a execução anterior acaba, bem ou mal.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um parceiro deposita arquivos CSV num volume do Unity Catalog em horário imprevisível, e o job precisa processar cada remessa logo após a chegada. Qual gatilho atende?",
                    difficulty: "facil",
                    explanation:
                        "File arrival dispara quando chega arquivo novo no volume ou na external location monitorada. Agenda curta resolveria de forma aproximada, mas gastaria execução vazia e não é o que a doc indica para esse caso.",
                    options: [
                        {
                            text: "File arrival, que dispara quando chega arquivo novo no local monitorado do Unity Catalog",
                            isCorrect: true,
                        },
                        {
                            text: "Scheduled com intervalo de um minuto, que verifica o volume e processa o que encontrar lá",
                            isCorrect: false,
                        },
                        {
                            text: "Table update apontando o volume, que dispara quando o conteúdo do volume é atualizado",
                            isCorrect: false,
                        },
                        {
                            text: "Continuous, que mantém o job sempre no ar aguardando a próxima remessa do parceiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Os arquivos de um fornecedor chegam em rajadas de cerca de 20 arquivos com poucos segundos entre eles, e você quer processar cada rajada inteira numa única execução. Qual opção avançada do gatilho de chegada de arquivo resolve?",
                    difficulty: "medio",
                    explanation:
                        "Wait after last change espera o tempo informado desde a última chegada e reinicia o contador a cada arquivo novo, então a execução só sai com a rajada completa. Minimum time between triggers apenas limita a frequência.",
                    options: [
                        {
                            text: "Wait after last change in seconds, que reinicia o contador a cada arquivo novo que chega",
                            isCorrect: true,
                        },
                        {
                            text: "Minimum time between triggers in seconds, que agrupa as chegadas do intervalo numa execução",
                            isCorrect: false,
                        },
                        {
                            text: "A condição Trigger when com o valor All, que espera todos os arquivos da rajada chegarem",
                            isCorrect: false,
                        },
                        {
                            text: "O modo Continuous, que começa uma execução nova logo depois que a anterior termina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você configura um gatilho Table update sobre duas tabelas e quer que a execução saia apenas quando as duas tiverem sido atualizadas. O que configurar, e de quais permissões a identidade do Run as precisa?",
                    difficulty: "medio",
                    explanation:
                        "Trigger when com All tables are updated corresponde a ALL_UPDATED, e o Run as precisa de SELECT nas tabelas mais USE CATALOG e USE SCHEMA. Sem SELECT o gatilho falha na avaliação e o job nem roda.",
                    options: [
                        {
                            text: "Trigger when como All tables are updated, com SELECT nas tabelas e USE CATALOG e USE SCHEMA",
                            isCorrect: true,
                        },
                        {
                            text: "Trigger when como Any table is updated, com MODIFY nas tabelas e USE CATALOG no catálogo",
                            isCorrect: false,
                        },
                        {
                            text: "Um gatilho Table update por tabela, com SELECT em cada tabela e ownership sobre o schema",
                            isCorrect: false,
                        },
                        {
                            text: "Trigger when como All tables are updated, com READ FILES na external location de cada tabela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe quer transformar um job de três tasks encadeadas em job contínuo, mantendo a ordem das tasks e duas tentativas por task. O que a documentação diz sobre esse plano?",
                    difficulty: "dificil",
                    explanation:
                        "A doc é explícita: job contínuo não usa dependência entre tasks nem política de tentativas, e repete o job inteiro com recuo exponencial. O ajuste disponível é o Task retry mode, com On failure ou Never.",
                    options: [
                        {
                            text: "Não é possível: job contínuo não aceita dependência entre tasks nem política de tentativas",
                            isCorrect: true,
                        },
                        {
                            text: "É possível: contínuo preserva o DAG e aplica a política de tentativas de cada task normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "É possível só com compute serverless, que é o único que preserva dependência em modo contínuo",
                            isCorrect: false,
                        },
                        {
                            text: "Não é possível: contínuo aceita apenas uma task, e as três precisariam virar jobs separados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um workspace tem uma external location do Unity Catalog sem file events habilitado. Que limites a documentação impõe aos gatilhos de chegada de arquivo nesse cenário?",
                    difficulty: "dificil",
                    explanation:
                        "Sem file events valem dois limites: no máximo 50 jobs com gatilho de chegada de arquivo no workspace e até 10.000 arquivos no local monitorado. Com file events habilitado, a quantidade de arquivos deixa de ter limite.",
                    options: [
                        {
                            text: "No máximo 50 jobs com esse gatilho no workspace e até 10.000 arquivos no local monitorado",
                            isCorrect: true,
                        },
                        {
                            text: "No máximo 10 jobs com esse gatilho no workspace e até 50.000 arquivos no local monitorado",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum limite de arquivos, apenas o teto de 12.000 gatilhos ativos no workspace inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "No máximo 50 arquivos por verificação, com uma verificação a cada minuto em cada subpasta",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Parâmetros de job e valores entre tasks",
            blocks: [
                {
                    type: "text",
                    value: "Esta aula resolve dois problemas que parecem iguais e não são. O primeiro: rodar o mesmo job em desenvolvimento e em produção, mudando só o catálogo de destino. O segundo: a task 1 descobre quais partições precisam ser reprocessadas e a task 2 precisa dessa lista. O primeiro é parâmetro, o segundo é **task value**, e trocar um pelo outro é erro clássico de prova.\n\nA documentação organiza o assunto em quatro conceitos: **job parameter**, que é par chave e valor definido no nível do job e empurrado para as tasks; **task parameter**, que é par chave e valor ou array JSON definido no nível da task; **dynamic value references**, a sintaxe para referenciar condição, metadado e parâmetro na configuração de uma task; e **task values**, a sintaxe para capturar e referenciar valor gerado durante a execução.",
                },
                {
                    type: "text",
                    value: "Para criar um parâmetro de job, no painel **Job details** clique em **Edit parameters** e preencha os campos **Key** e **Value**. A chave aceita só caractere alfanumérico e os sinais sublinhado, hífen e ponto. O valor é texto ou uma referência dinâmica, e o botão com chaves insere uma referência pronta.\n\nTrês regras que a prova cobra. Parâmetro de job é **empurrado automaticamente** para as tasks que aceitam par chave e valor. Quando parâmetro de job e parâmetro de task têm a **mesma chave**, o parâmetro de job **ganha**. E o valor definido na configuração é apenas um padrão: qualquer pessoa com **CAN MANAGE RUN** ou acima pode sobrescrever num disparo manual pelo **Run now with different parameters**, ou via API REST. A doc avisa em letras claras que valor padrão de parâmetro **não** é controle de segurança; para impedir mudança, restrinja a permissão do job.",
                },
                {
                    type: "table",
                    value: '[["Recurso","Onde é definido","Para que serve"],["Job parameter","no job, em Edit parameters","um valor comum a várias tasks, sobrescrevível no disparo"],["Task parameter","na task, no campo de parâmetros","um valor específico daquela task, fixo na definição"],["Task value","em código, durante a execução","levar um resultado de uma task para a seguinte"],["Dynamic value reference","em campo de configuração da task","ler metadado da execução, parâmetro ou task value"]]',
                },
                {
                    type: "text",
                    value: "Cada tipo de task recebe parâmetro de um jeito próprio. Task de notebook usa o submódulo **dbutils.widgets**. Script Python recebe os valores como argumento de linha de comando, que você lê por posição ou com o módulo `argparse`. Task SQL usa parâmetro nomeado com dois-pontos, como em `WHERE year(check_in) = :year_param`. Task JAR recebe os valores como argumento do método principal da classe principal.\n\nO **widget** é a ponte do notebook. Os métodos do `dbutils.widgets` são `text`, `dropdown`, `combobox`, `multiselect`, `get`, `getAll`, `remove` e `removeAll`; `getArgument` está obsoleto e a doc manda usar `get`. A assinatura é `text(name, defaultValue, label)` e `get(name)`, que devolve sempre texto. Dentro de um job, o nome passado para `get` pode ser o nome de um widget criado no notebook ou o nome de um parâmetro recebido pela task. Criar o widget com `text` e um valor padrão ajuda a rodar o notebook à mão, mas a doc avisa que esse padrão pode esconder parâmetro mal configurado no job.",
                },
                {
                    type: "code",
                    value: '# Task "escolhe_destinos": publica um resultado para a task seguinte.\ndestinos = ["BR", "AR", "CL"]\ndbutils.jobs.taskValues.set(key="dest_list", value=destinos)\n\n# Task "carrega": o widget lê tanto parâmetro de job quanto de task.\ndbutils.widgets.text(name="ambiente", defaultValue="dev", label="Ambiente")\nambiente = dbutils.widgets.get("ambiente")\n\n# O parâmetro de task "destinos" foi configurado na interface com o valor\n# {{tasks.escolhe_destinos.values.dest_list}}, que é a forma recomendada.\ndestinos = dbutils.widgets.get("destinos")\n\n# Leitura direta do task value. Funciona, mas a doc não recomenda,\n# porque fixa no código o nome da task de origem.\ndestinos = dbutils.jobs.taskValues.get(\n    taskKey="escolhe_destinos",\n    key="dest_list",\n    debugValue=["BR"],\n)',
                },
                {
                    type: "text",
                    value: "O **task value** é o canal oficial para passar informação de uma task para outra na mesma execução. Quem grava chama `dbutils.jobs.taskValues.set(key, value)`, com chave única no notebook e valor representável em JSON válido. Quem lê tem dois caminhos: a referência dinâmica `{{tasks.<task_name>.values.<value_name>}}` num campo de parâmetro, que é o recomendado e funciona em qualquer task que aceite parâmetro, ou a chamada `dbutils.jobs.taskValues.get`, que a doc considera não recomendada porque amarra o nome da task de origem dentro do código.\n\nOs números que a prova pede: a representação JSON de um valor não pode passar de **48 KiB**, e cada execução guarda no máximo **250 task values**. O utilitário `dbutils.jobs` existe só em Python. Os parâmetros do `get` são `taskKey`, `key`, `default` e `debugValue`; o `debugValue` é o valor estático devolvido quando o notebook roda à mão, fora do job. Fora de um job, `get` sem `debugValue` levanta `TypeError`, e `set` não faz nada. Quando a task de origem rodou dentro de uma task **For each**, o `get` devolve uma lista com um elemento por iteração.",
                },
                {
                    type: "table",
                    value: '[["Referência dinâmica","O que ela devolve"],["{{job.id}}","o identificador do job"],["{{job.run_id}}","o identificador da execução do job"],["{{job.parameters.ambiente}}","o valor do parâmetro de job chamado ambiente"],["{{job.start_time.iso_date}}","a data de início da execução em formato ISO"],["{{job.trigger.type}}","o tipo de gatilho que disparou a execução"],["{{job.repair_count}}","quantas vezes a execução já foi reparada"],["{{task.name}}","o nome da task atual"],["{{tasks.carga.result_state}}","o estado final da task chamada carga"],["{{tasks.carga.values.linhas}}","o task value linhas gravado pela task carga"],["{{workspace.id}}","o identificador do workspace"]]',
                },
                {
                    type: "quote",
                    value: "Parâmetro é o que você manda para dentro do job antes de ele começar; task value é o que uma task descobriu no meio do caminho e a próxima precisa saber.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma task de notebook recebe o parâmetro `ambiente` configurado no job. Qual submódulo do dbutils o código do notebook usa para ler esse valor?",
                    difficulty: "facil",
                    explanation:
                        "A doc diz que task de notebook recebe parâmetro pelo submódulo dbutils.widgets, com get devolvendo o valor. O dbutils.jobs serve para task values, não para ler parâmetro, e é a confusão mais comum aqui.",
                    options: [
                        {
                            text: "`dbutils.widgets`, com `get` devolvendo o valor do parâmetro como texto",
                            isCorrect: true,
                        },
                        {
                            text: "`dbutils.jobs`, com `taskValues.get` devolvendo o valor do parâmetro",
                            isCorrect: false,
                        },
                        {
                            text: "`dbutils.notebook`, com `getContext` devolvendo o valor do parâmetro",
                            isCorrect: false,
                        },
                        {
                            text: "`dbutils.fs`, com `head` lendo o valor do parâmetro do arquivo da execução",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O job define o parâmetro `catalogo` com o valor `prod`, e uma das tasks define um parâmetro de task com a mesma chave `catalogo` e o valor `dev`. O que o código da task lê?",
                    difficulty: "medio",
                    explanation:
                        "A doc é direta: quando parâmetro de job e de task compartilham a chave, o parâmetro de job tem precedência. Imaginar que o valor mais específico ganha é razoável, mas contraria a regra documentada.",
                    options: [
                        {
                            text: "`prod`, porque o parâmetro de job tem precedência sobre o de task na mesma chave",
                            isCorrect: true,
                        },
                        {
                            text: "`dev`, porque o parâmetro de task é mais específico e sobrescreve o do nível do job",
                            isCorrect: false,
                        },
                        {
                            text: "`dev`, porque o parâmetro de job só vale para as tasks que não declaram aquela chave",
                            isCorrect: false,
                        },
                        {
                            text: "Erro de configuração, porque a mesma chave nos dois níveis é rejeitada ao salvar o job",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A task `apura` grava um task value com a chave `linhas`. Qual é a forma recomendada pela documentação para a task `confere` usar esse valor num campo de parâmetro?",
                    difficulty: "medio",
                    explanation:
                        "A referência dinâmica tasks.<task_name>.values.<value_name> é a forma recomendada e funciona em qualquer task que aceite parâmetro. O taskValues.get funciona, mas a doc não recomenda por fixar a origem no código.",
                    options: [
                        {
                            text: "A referência dinâmica `{{tasks.apura.values.linhas}}` no campo de parâmetro da task",
                            isCorrect: true,
                        },
                        {
                            text: "A referência dinâmica `{{job.parameters.linhas}}`, que resolve o task value mais recente",
                            isCorrect: false,
                        },
                        {
                            text: "A chamada `dbutils.jobs.taskValues.get` no código, que é a forma indicada pela doc",
                            isCorrect: false,
                        },
                        {
                            text: 'A leitura de `spark.conf.get("linhas")`, que a Databricks popula ao fim de cada task',
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma task tenta gravar como task value uma lista com o conteúdo completo de um arquivo de 5 MB, para a task seguinte reprocessar. Por que isso não funciona, e qual é o limite documentado?",
                    difficulty: "dificil",
                    explanation:
                        "A representação JSON de um task value não pode passar de 48 KiB, e cada execução guarda até 250 valores. Task value carrega referência, como caminho ou lista de chaves, e não o conteúdo do dado em si.",
                    options: [
                        {
                            text: "Task value não carrega dado: a representação JSON do valor não pode passar de 48 KiB",
                            isCorrect: true,
                        },
                        {
                            text: "Task value não carrega dado: o limite é de 250 KiB por valor e de 48 valores por execução",
                            isCorrect: false,
                        },
                        {
                            text: "Task value aceita qualquer tamanho, mas só persiste durante a task que gravou o valor",
                            isCorrect: false,
                        },
                        {
                            text: "Task value aceita até 5 MB, desde que a task de destino declare o parâmetro debugValue",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista tem CAN MANAGE RUN num job e dispara uma execução pelo Run now with different parameters, trocando o parâmetro `catalogo` de `prod` para `sandbox`. A execução roda com `sandbox`. Isso é esperado?",
                    difficulty: "dificil",
                    explanation:
                        "Sim: a doc diz que CAN MANAGE RUN ou acima pode sobrescrever parâmetro num disparo manual e que valor padrão de parâmetro não é controle de segurança. Para travar o valor, o caminho é restringir a permissão do job.",
                    options: [
                        {
                            text: "Sim: valor padrão de parâmetro não é controle de segurança, e CAN MANAGE RUN sobrescreve",
                            isCorrect: true,
                        },
                        {
                            text: "Não: sobrescrever parâmetro no disparo manual exige a permissão CAN MANAGE ou IS OWNER",
                            isCorrect: false,
                        },
                        {
                            text: "Não: o valor configurado no job é imutável, e só a API REST consegue sobrescrever a chave",
                            isCorrect: false,
                        },
                        {
                            text: "Sim: o parâmetro de job vira variável de ambiente, e qualquer leitor do job pode trocá-la",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Quando falha: tentativas, Run If e reparo da execução",
            blocks: [
                {
                    type: "text",
                    value: "Falha de task é rotina, e a prova quer saber se você sabe o que a plataforma faz por conta própria e o que você precisa configurar. No fim desta aula você decide quantas tentativas uma task recebe, faz uma task de limpeza rodar justamente quando a anterior falha, e recupera uma execução sem repetir o que já deu certo.\n\nComece pelo padrão, que surpreende: o comportamento de tentativa depende da configuração do job, e **na maioria das configurações a task que falha não é repetida**. Tentativa é algo que você liga, não algo que vem ligado. As duas exceções documentadas são o compute **serverless**, que otimiza tentativas automaticamente, e o job **contínuo**, que usa recuo exponencial.",
                },
                {
                    type: "text",
                    value: "Para configurar, abra as configurações avançadas da task e clique em **Add** ao lado de **Retries**. Lá você define quando e quantas vezes a execução que falhou é repetida. O intervalo de tentativa é contado em **milissegundos**, do início da execução que falhou até o início da tentativa seguinte. Na API, os campos são `max_retries`, `min_retry_interval_millis` e `retry_on_timeout`.\n\nUm detalhe que decide questão: se você configurar **Timeout** e **Retries** juntos, o tempo limite vale **para cada tentativa**, não para a soma delas. Em serverless, a otimização automática pode adicionar tentativas; para uma carga que não é idempotente e deve rodar no máximo uma vez, você desmarca **Enable serverless auto-optimization** no diálogo de política de tentativas.",
                },
                {
                    type: "table",
                    value: '[["Run if","Roda quando","Estado da task se a condição não bate"],["All succeeded","todas as dependências rodaram e tiveram sucesso","Upstream failed"],["At least one succeeded","pelo menos uma dependência teve sucesso","Upstream failed"],["None failed","nenhuma dependência falhou e ao menos uma rodou","Upstream failed"],["All done","todas as dependências rodaram, qualquer que seja o resultado","não se aplica"],["At least one failed","pelo menos uma dependência falhou","Excluded"],["All failed","todas as dependências falharam","Excluded"]]',
                },
                {
                    type: "text",
                    value: "O campo **Run if dependencies** fica ao lado de **Depends on** e decide se a task roda depois que as dependências terminam. O padrão é **All succeeded**. Na API, o campo é `run_if`, irmão de `task_key`, e os valores são `ALL_SUCCESS`, `AT_LEAST_ONE_SUCCESS`, `NONE_FAILED`, `ALL_DONE`, `AT_LEAST_ONE_FAILED` e `ALL_FAILED`.\n\nA diferença entre os dois estados de recusa é o que a prova pergunta. Quando a condição não é atendida numa task normal, a task fica **Upstream failed**. Quando a condição não é atendida numa task configurada para **tratar falha**, as duas últimas da tabela, a task fica **Excluded** e é pulada.\n\nE a regra que pega todo mundo: ao avaliar a condição das tasks seguintes, uma task anterior com estado **Excluded** é tratada como **sucesso**, enquanto **Upstream failed** e **Upstream canceled** são tratadas como falha, não como pulo. Além disso, se **todas** as dependências de uma task estão Excluded, a própria task fica Excluded, qualquer que seja o seu Run if, e isso se propaga numa cadeia linear: em A para B para C, se A é excluída, B e C também são. Cancelamento também desce pelo grafo, e as tasks com Run if de tratamento de falha rodam, o que serve para garantir que uma limpeza aconteça.",
                },
                {
                    type: "code",
                    value: '{\n  "tasks": [\n    {\n      "task_key": "carga",\n      "max_retries": 2,\n      "min_retry_interval_millis": 60000,\n      "retry_on_timeout": true,\n      "timeout_seconds": 1800,\n      "notebook_task": { "notebook_path": "/Workspace/etl/carga" }\n    },\n    {\n      "task_key": "limpa_staging",\n      "depends_on": [{ "task_key": "carga" }],\n      "run_if": "AT_LEAST_ONE_FAILED",\n      "notebook_task": { "notebook_path": "/Workspace/etl/rollback" }\n    },\n    {\n      "task_key": "publica",\n      "depends_on": [{ "task_key": "carga" }],\n      "run_if": "ALL_SUCCESS",\n      "notebook_task": { "notebook_path": "/Workspace/etl/publica" }\n    }\n  ]\n}',
                },
                {
                    type: "text",
                    value: "Quando a execução já falhou, o recurso é o **reparo**. Na página de detalhe da execução, clique em **Repair run**: o diálogo **Repair job run** lista as tasks que não tiveram sucesso e as que dependem delas, que são exatamente as que vão rodar de novo. As tasks que deram certo, e as que dependem apenas delas, **não** são repetidas, o que reduz tempo e recurso gasto na recuperação.\n\nO que a prova cobra sobre reparo:\n\n- Funciona apenas em job com **duas ou mais tasks**. Job de uma task só se repete com **Run now**.\n- Você pode mudar configuração do job ou da task antes de reparar, e as tasks sem sucesso rodam com a configuração atual.\n- Dá para adicionar ou editar parâmetro no diálogo **Repair job run**, e o valor digitado sobrescreve o existente. Para voltar ao original num reparo seguinte, limpe a chave e o valor no diálogo.\n- Cada task sem sucesso é repetida **do começo**. A doc avisa que o Lakeflow Jobs não torna a task idempotente: se ela gravou parte da saída antes de falhar, repetir pode duplicar dado. Prefira operação de sobrescrita ou de merge em vez de append.\n- Com cluster de job compartilhado, o reparo cria um cluster novo, por exemplo `my_job_cluster_v1` a partir de `my_job_cluster`.\n- O valor de **Duration** na aba **Runs** cobre do início da primeira execução até o fim do último reparo, somando tudo.",
                },
                {
                    type: "text",
                    value: "Para enxergar onde o tempo foi, a execução tem duas visões. A **matrix view**, na aba **Runs** do job, mostra o histórico de execuções com uma célula por task: verde para sucesso, vermelho para insucesso, rosa para pulada e amarelo para aguardando tentativa. A **timeline view**, no detalhe de uma execução com várias tasks, mostra qual task demorou, as dependências e a sobreposição no tempo. A lista de tasks traz uma coluna **duration** por padrão.\n\nO limite de duração se configura em **Metric thresholds**, escolhendo a métrica **Run duration**. O campo **Warning** define o tempo esperado de conclusão: estourá-lo dispara um evento, que você pode usar para notificar. O campo **Timeout** define o tempo máximo: se a task não terminar nele, a Databricks coloca o status **Timed Out**. Existe limite equivalente no nível do job, em **Duration and streaming backlog thresholds**.\n\nPor fim, o resultado da execução é decidido pelas **tasks folha**, as que não têm nada dependendo delas. **Succeeded with failures** significa que alguma task falhou mas todas as folhas tiveram sucesso, e conta como execução bem sucedida. **Failed** significa que uma ou mais folhas falharam.",
                },
                {
                    type: "quote",
                    value: "Repair run repete só as tasks que não deram certo e as que dependem delas, com a configuração atual do job, e deixa intactas as que já tinham passado.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma task de notebook em compute clássico de jobs falha por erro transitório de rede. Sem nenhuma configuração extra na task, o que a Databricks faz?",
                    difficulty: "facil",
                    explanation:
                        "A doc diz que o padrão depende da configuração do job e que, na maioria das configurações, a task que falha não é repetida. Tentativa precisa ser configurada em Retries; não vem ligada por padrão.",
                    options: [
                        {
                            text: "Nada: na maioria das configurações a task que falha não é repetida sem política de tentativas",
                            isCorrect: true,
                        },
                        {
                            text: "Repete a task três vezes com recuo exponencial, que é o padrão de toda task de notebook",
                            isCorrect: false,
                        },
                        {
                            text: "Repete a task uma vez depois de 60 segundos, que é o intervalo mínimo de tentativa padrão",
                            isCorrect: false,
                        },
                        {
                            text: "Repete a execução inteira do job desde a primeira task, descartando tudo o que já tinha rodado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma task de rollback precisa rodar somente quando a task de carga que a antecede falhar. Qual valor de Run if usar, e em que estado a task de rollback fica quando a carga dá certo?",
                    difficulty: "medio",
                    explanation:
                        "At least one failed roda quando ao menos uma dependência falha, e marca a task como Excluded quando a condição não bate. All done roda sempre, inclusive quando a carga tem sucesso, que não é o pedido.",
                    options: [
                        {
                            text: "At least one failed, e a task de rollback fica com o estado Excluded quando a carga passa",
                            isCorrect: true,
                        },
                        {
                            text: "All done, e a task de rollback fica com o estado Upstream failed quando a carga tem sucesso",
                            isCorrect: false,
                        },
                        {
                            text: "None failed, e a task de rollback fica com o estado Excluded quando a carga passa",
                            isCorrect: false,
                        },
                        {
                            text: "All succeeded com negação, e a task de rollback fica Skipped quando a carga passa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num job de seis tasks, as três primeiras tiveram sucesso e a quarta falhou, pulando as duas últimas. Você corrige o notebook da quarta. O que o Repair run faz?",
                    difficulty: "medio",
                    explanation:
                        "O reparo roda apenas as tasks sem sucesso e as que dependem delas, com a configuração atual, e não repete as três que já passaram. Repetir tudo seria Run now, que inicia uma execução nova do zero.",
                    options: [
                        {
                            text: "Roda a quarta task e as duas seguintes com a configuração atual, sem repetir as três primeiras",
                            isCorrect: true,
                        },
                        {
                            text: "Roda as seis tasks na ordem do grafo, com a configuração atual, para garantir consistência",
                            isCorrect: false,
                        },
                        {
                            text: "Roda somente a quarta task, deixando as duas seguintes no estado Skipped da execução que falhou",
                            isCorrect: false,
                        },
                        {
                            text: "Roda as três últimas tasks numa execução nova, com um identificador de execução diferente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Num job A para B para C, a task A está configurada com Run if de tratamento de falha e fica com o estado Excluded. A task B usa All succeeded. O que acontece com B e com C?",
                    difficulty: "dificil",
                    explanation:
                        "Quando todas as dependências de uma task estão Excluded, ela também fica Excluded, qualquer que seja o Run if, e a exclusão desce pela cadeia. A regra de Excluded contar como sucesso só vale quando há outra dependência que rodou.",
                    options: [
                        {
                            text: "As duas ficam Excluded: dependência toda excluída exclui a task e isso desce pela cadeia",
                            isCorrect: true,
                        },
                        {
                            text: "As duas rodam: task anterior Excluded conta como sucesso, então All succeeded é atendido",
                            isCorrect: false,
                        },
                        {
                            text: "B fica Upstream failed e C fica Excluded, porque a exclusão muda de estado a cada nível",
                            isCorrect: false,
                        },
                        {
                            text: "B roda e C fica Excluded, porque a regra de exclusão em cadeia só alcança a segunda task",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma task tem Timeout de 1800 segundos e Retries configurado com duas tentativas. Como esses dois ajustes interagem, e qual é o estado da task se o tempo acabar?",
                    difficulty: "dificil",
                    explanation:
                        "A doc registra que, com Timeout e Retries juntos, o tempo limite vale para cada tentativa, e que a task que não termina no tempo recebe o status Timed Out. Somar as tentativas num orçamento único é o erro comum.",
                    options: [
                        {
                            text: "O tempo limite vale para cada tentativa, e a task sem conclusão fica com status Timed Out",
                            isCorrect: true,
                        },
                        {
                            text: "O tempo limite vale para a soma das tentativas, e a task sem conclusão fica com status Failed",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo limite vale só para a primeira tentativa, e as repetições rodam sem limite de tempo",
                            isCorrect: false,
                        },
                        {
                            text: "O tempo limite desativa as tentativas, e a task sem conclusão fica com status Upstream failed",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Compute do job, notificação e fonte no Git",
            blocks: [
                {
                    type: "text",
                    value: "Esta aula fecha o módulo com as três decisões que ficam fora do grafo: em que compute cada task roda, quem é avisado quando algo acontece, e de onde vem o código que o job executa. São três assuntos que a prova cobra junto, porque mexem no custo e na confiabilidade do mesmo job.\n\nComece pelo compute. Cada task tem um recurso de compute associado que executa a sua lógica, e tasks diferentes do mesmo job podem usar recursos diferentes ou o mesmo recurso. O preço do Lakeflow Jobs está amarrado ao compute usado para rodar as tasks, então essa escolha é a alavanca de custo do job.",
                },
                {
                    type: "table",
                    value: '[["Task","Compute recomendado","Compute suportado"],["Notebook","serverless de jobs","serverless de jobs, jobs clássico, all-purpose clássico"],["Python script","serverless de jobs","serverless de jobs, jobs clássico, all-purpose clássico"],["Python wheel","serverless de jobs","serverless de jobs, jobs clássico, all-purpose clássico"],["SQL","SQL warehouse serverless","SQL warehouse serverless ou pro"],["Pipeline do Lakeflow","pipeline serverless","pipeline serverless ou clássico"],["dbt","SQL warehouse serverless","SQL warehouse serverless ou pro"],["Comando dbt CLI","serverless de jobs","serverless de jobs, jobs clássico, all-purpose clássico"],["JAR","jobs clássico","jobs clássico, all-purpose clássico"],["Spark Submit","jobs clássico","apenas jobs clássico"]]',
                },
                {
                    type: "text",
                    value: "O **serverless de jobs** é o padrão para toda task que o suporta, e a frase da doc é que ele deixa você rodar o job sem configurar nem implantar infraestrutura. A Databricks gerencia as configurações, otimiza tipo de instância, memória e motor de processamento, e **autoscaling e Photon ficam habilitados automaticamente**. Como não é preciso permissão de criar cluster, todo usuário do workspace consegue rodar os seus fluxos em serverless.\n\nO ajuste de custo fica em **Performance optimized**, no painel do job. Desligado, o job usa o **modo de desempenho padrão**, que consome **menos DBUs** por usar menos compute, em troca de uma latência de início de **4 a 6 minutos**. Ligado, o job começa e roda mais rápido, para carga sensível a tempo. Os dois modos usam o **mesmo SKU**, e a diferença de custo vem do consumo de DBU. O custo das tasks em serverless se acompanha pela tabela de sistema de uso faturável.\n\nOutro ponto de serverless que cai em prova: a **auto-otimização** vem habilitada e pode acrescentar tentativas. Para uma carga que não é idempotente e precisa rodar no máximo uma vez, desmarque **Enable serverless auto-optimization** na política de tentativas da task.",
                },
                {
                    type: "text",
                    value: "No compute clássico, três escolhas mudam o custo e o risco.\n\n**Classic jobs compute** é configurado dentro da interface do job, e a configuração faz parte da definição do job. **All-purpose clássico** pode ser usado por uma task, mas a documentação **não recomenda** essa configuração para job de produção; o all-purpose existe para trabalho interativo, e é o distrator favorito das questões de custo.\n\nO **cluster de job compartilhado** faz várias tasks do mesmo job usarem um recurso só, o que reduz a latência de inicialização. Ele sobe quando a primeira task que o usa começa e é encerrado depois que a última task que o usa termina, ficando ligado e ocioso enquanto rodam tasks que não o usam. O cluster compartilhado tem escopo de **uma única execução** do job e não pode ser usado por outro job nem por outra execução do mesmo job. Biblioteca não pode ser declarada na configuração dele: as dependências vão no ajuste **Dependent libraries** da task ou na especificação de ambiente do job. E como as tasks compartilham a mesma JVM de driver, estado de classe e singleton persistem entre tasks da mesma execução, o que pode fazer uma task sobrescrever o valor da outra.",
                },
                {
                    type: "text",
                    value: "A notificação é configurada em **Job notifications**, com **Edit notifications** e depois **Add notification**. Em **Destination** você escolhe um endereço de e-mail ou um destino de sistema, e marca os eventos: **Start**, **Success**, **Failure**, **Duration warning** e **Streaming backlog**. Job contínuo com janela de manutenção também notifica início e fim de manutenção. Os destinos de sistema integram Slack, Microsoft Teams, PagerDuty e webhook HTTP, e precisam ser criados antes por um administrador em **Edit system notifications**.\n\nOs números e as pegadinhas: por job **ou** por task, você configura no máximo **três destinos de sistema por tipo de evento**. Notificação de nível de job **não** é enviada enquanto a task que falhou está sendo repetida, então quem quer aviso a cada falha configura notificação no nível da **task**. A execução que termina em **Succeeded with failures** conta como sucesso, então para ser avisado dela é preciso marcar **Success**. Para receber aviso de lentidão, é obrigatório ter configurado antes o limite de duração e marcar **Duration warning**. E para reduzir ruído existem **Mute notifications for skipped runs**, **Mute notifications for canceled runs** e, no nível da task, **Mute notifications until the last retry**; silenciar no job não filtra o que você configurou nas tasks. Editar notificação exige **CAN MANAGE** ou **IS OWNER** no job.",
                },
                {
                    type: "code",
                    value: '{\n  "name": "vendas_diarias",\n  "git_source": {\n    "git_url": "https://github.com/minhaempresa/plataforma-dados",\n    "git_provider": "gitHub",\n    "git_branch": "main"\n  },\n  "email_notifications": {\n    "on_start": ["dados@empresa.com"],\n    "on_failure": ["plantao@empresa.com"],\n    "on_duration_warning_threshold_exceeded": ["plantao@empresa.com"]\n  },\n  "notification_settings": {\n    "no_alert_for_skipped_runs": true,\n    "no_alert_for_canceled_runs": true,\n    "alert_on_last_attempt": true\n  },\n  "tasks": [\n    {\n      "task_key": "carga",\n      "notebook_task": { "notebook_path": "etl/carga" }\n    }\n  ]\n}',
                },
                {
                    type: "text",
                    value: "A fonte do código pode ser um **repositório Git remoto**, e esse é o caminho que a documentação recomenda para homologação e produção, deixando a pasta Git do workspace para iteração rápida e teste durante o desenvolvimento. Os tipos de task que suportam repositório remoto são **notebook**, **script Python**, **arquivo SQL** e projeto **dbt**; dbt e arquivo SQL aceitam **apenas** fonte versionada, então nesses casos o job precisa ter a configuração de Git.\n\nNo diálogo de Git você informa **Git repository URL**, escolhe o **Git provider** numa lista e preenche **Git reference**, selecionando **branch**, **tag** ou **commit**. A doc é taxativa: você especifica **apenas um** dos três. Na API, são os campos `git_url`, `git_provider` e então `git_branch`, `git_tag` ou `git_commit`, dentro de `git_source`.\n\nAs regras que a prova cobra: **todas as tasks do job referenciam o mesmo commit** do repositório remoto. No início da execução, a Databricks tira um **instantâneo** do branch ou do commit indicado, de modo que todas as tasks daquela execução usem a mesma versão do código, e o detalhe de cada task mostra o **SHA do commit** usado. Task configurada com repositório remoto **não pode escrever em arquivo do workspace**: dado temporário vai para o armazenamento efêmero do driver e dado persistente vai para volume ou tabela. Se `git_source` está definido, uma task pode voltar a ler do workspace com o campo `source` igual a `WORKSPACE`. E se o job roda como um grupo, ele clona com a credencial Git daquela identidade; sem a credencial configurada, o job falha ao clonar.",
                },
                {
                    type: "quote",
                    value: "Serverless é o padrão para as tasks que o suportam, jobs clássico é a saída para JAR e Spark Submit, e all-purpose clássico não é recomendado para job de produção.",
                },
            ],
            questions: [
                {
                    statement:
                        "Você cria um job com uma task de notebook e não mexe na seção de compute. Em que recurso essa task roda, e o que a Databricks gerencia por você?",
                    difficulty: "facil",
                    explanation:
                        "Serverless de jobs é o padrão para toda task que o suporta, e nele a Databricks gerencia as configurações, com autoscaling e Photon habilitados automaticamente. Não existe cluster clássico padrão esperando a task.",
                    options: [
                        {
                            text: "Serverless de jobs, com a Databricks gerenciando o compute e ligando autoscaling e Photon",
                            isCorrect: true,
                        },
                        {
                            text: "Jobs clássico de um nó, com a Databricks escolhendo o tipo de instância mais barato da região",
                            isCorrect: false,
                        },
                        {
                            text: "All-purpose clássico do workspace, com a Databricks reaproveitando um cluster já ligado",
                            isCorrect: false,
                        },
                        {
                            text: "SQL warehouse serverless, com a Databricks roteando o notebook para o warehouse padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe aponta todas as tasks dos jobs de produção para um cluster all-purpose que fica ligado o dia inteiro, para evitar o tempo de inicialização. O que a documentação diz sobre essa escolha?",
                    difficulty: "medio",
                    explanation:
                        "A doc permite all-purpose clássico numa task, mas não recomenda essa configuração para job de produção. O preço do job está amarrado ao compute usado, e o caminho indicado é serverless ou jobs clássico.",
                    options: [
                        {
                            text: "É suportada, mas a documentação não recomenda all-purpose clássico em job de produção",
                            isCorrect: true,
                        },
                        {
                            text: "É recomendada, porque reaproveitar compute ligado é a forma indicada de reduzir custo",
                            isCorrect: false,
                        },
                        {
                            text: "É bloqueada, porque task de job não aceita compute all-purpose desde a marca Lakeflow",
                            isCorrect: false,
                        },
                        {
                            text: "É indiferente, porque o preço do Lakeflow Jobs é por execução e não pelo compute usado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job com quatro tasks precisa rodar o código versionado no repositório da empresa, na tag `release-2.4`. O que a documentação exige nessa configuração?",
                    difficulty: "medio",
                    explanation:
                        "Informa-se apenas um dos três em Git reference, e todas as tasks referenciam o mesmo commit: a Databricks tira um instantâneo no início da execução. Uma referência por task não existe como opção na configuração do job.",
                    options: [
                        {
                            text: "Informar apenas a tag em Git reference, e todas as tasks do job usam o mesmo commit",
                            isCorrect: true,
                        },
                        {
                            text: "Informar a tag e o commit em Git reference, e cada task escolhe uma das duas referências",
                            isCorrect: false,
                        },
                        {
                            text: "Informar uma Git reference por task, e o job resolve cada uma no início da execução",
                            isCorrect: false,
                        },
                        {
                            text: "Informar o branch em Git reference, porque task de job não aceita tag como referência",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma task com duas tentativas configuradas falha na primeira. A equipe configurou notificação de falha apenas no nível do job e reclama que não recebeu aviso nessa primeira falha. Qual é a explicação?",
                    difficulty: "dificil",
                    explanation:
                        "A doc diz que notificação de nível de job não é enviada enquanto a task que falhou está sendo repetida; para ser avisado a cada falha, a notificação precisa ser configurada no nível da task.",
                    options: [
                        {
                            text: "Notificação de job não sai enquanto a task é repetida: o aviso por falha vem no nível da task",
                            isCorrect: true,
                        },
                        {
                            text: "Notificação de job sai só por e-mail: para aviso a cada falha é preciso um destino de sistema",
                            isCorrect: false,
                        },
                        {
                            text: "Notificação de falha depende do limite de duração: sem o limite configurado nada é enviado",
                            isCorrect: false,
                        },
                        {
                            text: "Notificação de job foi silenciada pelo padrão Mute notifications for canceled runs do job",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job tem seis tasks apontadas para o mesmo cluster de job compartilhado. O que a documentação afirma sobre o ciclo de vida e o escopo desse cluster?",
                    difficulty: "dificil",
                    explanation:
                        "O cluster compartilhado sobe com a primeira task que o usa, encerra depois da última e tem escopo de uma única execução, sem ser reaproveitado por outro job nem por outra execução do mesmo job.",
                    options: [
                        {
                            text: "Sobe na primeira task que o usa, encerra depois da última e vale para uma única execução",
                            isCorrect: true,
                        },
                        {
                            text: "Sobe na primeira task que o usa, encerra depois da última e fica disponível para o job seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "Sobe junto com o job, encerra por inatividade e é reaproveitado por outras execuções do job",
                            isCorrect: false,
                        },
                        {
                            text: "Sobe na primeira task que o usa, encerra depois dela e é recriado em cada task seguinte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Governança com Unity Catalog",
    aulas: [
        {
            titulo: "Hierarquia do Unity Catalog e o metastore",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você olha para o nome de um objeto e diz em que nível do Unity\nCatalog ele vive, quem administra aquele nível e onde o dado gerenciado dele é\ngravado.\n\nA prova faz essa pergunta com várias roupagens, e no fundo é sempre a mesma:\n`SELECT * FROM pedidos` falha, `SELECT * FROM prod.vendas.pedidos` funciona. O\nmotivo é a hierarquia. O Unity Catalog não guarda objeto solto: todo ativo\ngovernado é um objeto protegível, um securable object, e cada objeto protegível\ntem um lugar fixo na árvore.",
                },
                {
                    type: "text",
                    value: 'No topo da árvore está o **metastore**. A documentação é curta: "The metastore is\nthe top-level securable object in Unity Catalog", e o escopo dele é regional,\n"Your organization requires one metastore per region in which it operates".\nGuarde os dois fatos juntos, porque é aí que o distrator mora:\n\n- um metastore por região, e somente um;\n- vários workspaces da mesma região podem ser anexados ao mesmo metastore, e\n  passam a ver os mesmos dados;\n- um usuário só trabalha com o Unity Catalog a partir de um workspace anexado a\n  um metastore da região dele.\n\nQuem cria um metastore é um administrador de conta, e a conta precisa estar no\nplano Premium ou acima. Quem cria vira o proprietário, papel chamado de\n**metastore admin**, que pode criar objetos de topo e administrar o acesso aos\ndados. A documentação recomenda transferir esse papel para um grupo em vez de\ndeixar numa pessoa.',
                },
                {
                    type: "table",
                    value: '[["Nível", "O que é", "Exemplo de nome"], ["Metastore", "Objeto protegível de topo, um por região", "aws:us-east-1:19a84bee"], ["Catálogo", "Primeira e mais alta camada dos dados", "prod"], ["Schema", "Segunda camada, também chamada de database", "prod.vendas"], ["Tabela, view, volume, função, modelo", "Objeto dentro do schema", "prod.vendas.pedidos"]]',
                },
                {
                    type: "text",
                    value: 'Abaixo do metastore vem o catálogo: "Within a metastore, a catalog is the first\nand highest-level layer for your data assets". Dentro do catálogo vem o schema,\n"the second layer of the object hierarchy", que a documentação também chama de\ndatabase. E dentro do schema vêm os ativos de dados.\n\nDaí sai o **nome de três partes**, o three-level namespace que a documentação\nescreve literalmente como `catalog.schema.object`. Tabela, view, volume, função,\nmodelo registrado, serviço, secret e feature são endereçados assim.\n\nO detalhe que separa quem estudou de quem decorou: não é tudo que mora dentro de\ncatálogo. Credencial de armazenamento, localização externa, conexão, credencial\nde serviço, metadado externo, share, provider, recipient e clean room ficam\n**direto no metastore**, sem catálogo e sem schema no nome.',
                },
                {
                    type: "table",
                    value: '[["Fica direto no metastore", "Fica dentro de um schema"], ["Catálogo", "Tabela e view"], ["Credencial de armazenamento", "Volume"], ["Localização externa", "Função e modelo registrado"], ["Conexão e credencial de serviço", "Serviço de modelo ou de MCP"], ["Share, recipient e provider", "Secret"], ["Clean room e metadado externo", "Feature"]]',
                },
                {
                    type: "code",
                    value: "-- o identificador do metastore atual, no formato nuvem:regiao:uuid\nSELECT current_metastore();\n\n-- navegando a hierarquia de cima para baixo\nSHOW CATALOGS;\nSHOW SCHEMAS IN prod;\nSHOW TABLES IN prod.vendas;\n\n-- nome de tres partes resolve sem depender do contexto da sessao\nSELECT * FROM prod.vendas.pedidos LIMIT 10;\n\n-- ou fixe o contexto e use nome curto\nUSE CATALOG prod;\nUSE SCHEMA vendas;\nSELECT * FROM pedidos LIMIT 10;\n\n-- onde o catalogo e o schema guardam o dado gerenciado\nDESCRIBE SCHEMA EXTENDED prod.vendas;",
                },
                {
                    type: "text",
                    value: 'Onde o dado de uma tabela ou de um volume gerenciado é gravado depende de três\nlocais possíveis, e a documentação dá a ordem de precedência sem ambiguidade:\n\n1. se o schema que contém tem local gerenciado, o dado vai para o local do\n   schema;\n2. se o schema não tem e o catálogo tem, o dado vai para o local do catálogo;\n3. se nem schema nem catálogo têm, o dado vai para o local gerenciado do\n   metastore.\n\nWorkspaces habilitados automaticamente para o Unity Catalog nascem **sem** local\ngerenciado no metastore, então na prática a resposta certa quase sempre é\ncatálogo ou schema. Para apontar um local gerenciado na criação de catálogo ou de\nschema, o usuário precisa do privilégio `CREATE MANAGED STORAGE` em uma\nlocalização externa.\n\nA página de boas práticas ainda cobra uma decisão de projeto: "Catalogs are the\nprimary unit of data isolation in the typical Unity Catalog data governance\nmodel", e um catálogo pode ser amarrado a um conjunto limitado de workspaces.',
                },
                {
                    type: "quote",
                    value: "Um metastore por região, nome de três partes catálogo.schema.objeto, e\nlocalização externa, credencial e share pendurados direto no metastore.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma empresa opera em us-east-1 e em eu-west-1 e quer governar os dois conjuntos de dados no Unity Catalog. Quantos metastores ela precisa?",
                    difficulty: "facil",
                    explanation:
                        "A documentação exige um metastore para cada região em que a organização opera, e vários workspaces daquela mesma região compartilham o metastore. A ideia de metastore global engana porque o catálogo parece único na interface, mas o escopo real do metastore é regional.",
                    options: [
                        {
                            text: "Dois, porque a documentação exige um metastore por região de operação.",
                            isCorrect: true,
                        },
                        {
                            text: "Um, porque o metastore é global e atende todas as regiões da conta.",
                            isCorrect: false,
                        },
                        {
                            text: "Quatro, porque cada metastore atende no máximo um workspace da região.",
                            isCorrect: false,
                        },
                        {
                            text: "Um por workspace, porque o metastore nasce junto com cada workspace.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual destes objetos do Unity Catalog NÃO é endereçado pelo nome de três partes, porque fica direto no metastore?",
                    difficulty: "medio",
                    explanation:
                        "Localização externa, credencial de armazenamento, conexão e share ficam direto no metastore, sem catálogo nem schema no nome. Volume, modelo registrado e função parecem exceções porque não são tabelas, mas todos moram dentro de um schema e usam o nome de três partes.",
                    options: [
                        {
                            text: "Localização externa, que junta caminho de armazenamento e credencial.",
                            isCorrect: true,
                        },
                        {
                            text: "Volume gerenciado, que guarda arquivo não tabular dentro de um schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Modelo registrado, que guarda versões de modelo dentro do schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Função escalar de SQL, que guarda lógica reutilizável no schema.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista em um workspace da região eu-central-1 precisa consultar uma tabela registrada em um metastore de us-east-1. O que a documentação diz sobre esse acesso?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que o usuário trabalha com o Unity Catalog apenas a partir de um workspace anexado a um metastore da região dele. O nome de três partes engana porque resolve catálogo, schema e objeto, mas não atravessa metastore de outra região.",
                    options: [
                        {
                            text: "Precisa de workspace anexado ao metastore de us-east-1, porque o metastore é regional.",
                            isCorrect: true,
                        },
                        {
                            text: "Consegue consultar normalmente, porque o nome de três partes resolve metastore de qualquer região.",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa apenas do privilégio USE CATALOG, porque o metastore aceita acesso entre regiões.",
                            isCorrect: false,
                        },
                        {
                            text: "Precisa anexar o workspace a dois metastores ao mesmo tempo, porque o limite é por workspace.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O catálogo `prod` tem local gerenciado configurado, o schema `prod.vendas` também tem, e o metastore não tem nenhum. Onde fica o dado de uma tabela gerenciada criada em `prod.vendas`?",
                    difficulty: "medio",
                    explanation:
                        "A ordem documentada é schema, depois catálogo, depois metastore: existindo local no schema, é ele que vale. O local do catálogo é o distrator forte porque é o nível que a documentação recomenda como unidade principal de isolamento, mas recomendação de projeto não muda a precedência.",
                    options: [
                        {
                            text: "No local gerenciado do schema, que tem precedência sobre o do catálogo.",
                            isCorrect: true,
                        },
                        {
                            text: "No local gerenciado do catálogo, que tem precedência sobre o do schema.",
                            isCorrect: false,
                        },
                        {
                            text: "No local gerenciado do metastore, que é obrigatório para tabela gerenciada.",
                            isCorrect: false,
                        },
                        {
                            text: "Em um local escolhido entre catálogo e schema conforme o volume do dado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Quem cria um metastore do Unity Catalog, e o que acontece com esse usuário depois da criação?",
                    difficulty: "dificil",
                    explanation:
                        "A criação exige administrador de conta e plano Premium ou acima, e quem cria vira proprietário do metastore, o metastore admin, que cria objetos de topo e administra o acesso. A opção de administrador de workspace engana porque ele administra o workspace, não o metastore regional.",
                    options: [
                        {
                            text: "Um administrador de conta em plano Premium ou acima, que vira o metastore admin.",
                            isCorrect: true,
                        },
                        {
                            text: "Um administrador de workspace em qualquer plano, que vira o metastore admin.",
                            isCorrect: false,
                        },
                        {
                            text: "Qualquer usuário com CREATE CATALOG, que vira proprietário do primeiro catálogo.",
                            isCorrect: false,
                        },
                        {
                            text: "Um administrador de conta em plano Standard, que vira apenas auditor do metastore.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Tabelas gerenciadas, externas e volumes",
            blocks: [
                {
                    type: "text",
                    value: 'No fim desta aula você acerta sem hesitar a pergunta que a prova mais repete\nnesta seção: depois de um `DROP TABLE`, o arquivo no armazenamento em nuvem\ncontinua lá ou não?\n\nA resposta depende de uma escolha feita na criação, tabela gerenciada ou tabela\nexterna, e a documentação resume a diferença pelo que o Unity Catalog assume. Na\ngerenciada, "Unity Catalog manages all read, write, storage, and optimization\nresponsibilities". Na externa, ele cuida dos metadados, mas "doesn\'t manage the\ndata\'s lifecycle, optimization, storage location, or layout".',
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Tabela gerenciada", "Tabela externa"], ["Ciclo de vida do dado", "Unity Catalog", "Você"], ["Local dos arquivos", "Local gerenciado do schema ou do catálogo", "Caminho coberto por localização externa"], ["DROP TABLE", "Metadado sai e o arquivo é purgado depois do prazo", "Só o metadado sai, o arquivo fica"], ["Recuperação", "UNDROP TABLE por 7 dias, por padrão", "Recriar a tabela apontando o mesmo caminho"], ["Formatos", "Delta Lake ou Apache Iceberg", "DELTA, CSV, JSON, AVRO, PARQUET, ORC e TEXT"], ["Otimização automática", "Sim, com predictive optimization", "Não, a manutenção é sua"], ["Posição da documentação", "Tipo padrão e recomendado", "Para dado que precisa ficar onde está"]]',
                },
                {
                    type: "code",
                    value: "-- gerenciada: sem LOCATION, o Unity Catalog escolhe onde gravar\nCREATE TABLE prod.vendas.pedidos (\n  id BIGINT,\n  valor DECIMAL(12,2)\n);\n\n-- gerenciada em Iceberg, em vez do padrao Delta Lake\nCREATE TABLE prod.vendas.pedidos_ice (id BIGINT) USING iceberg;\n\n-- externa: o LOCATION precisa estar coberto por uma localizacao externa\nCREATE EXTERNAL TABLE prod.bronze.cliques\nUSING PARQUET\nLOCATION 's3://lake-bronze/cliques/';\n\n-- apaga o metadado e, na gerenciada, agenda a purga dos arquivos\nDROP TABLE prod.vendas.pedidos;\n\n-- so a gerenciada volta, e so dentro da janela de recuperacao\nUNDROP TABLE prod.vendas.pedidos;",
                },
                {
                    type: "text",
                    value: 'A tabela gerenciada é o "default and recommended table type in Databricks for\nDelta Lake and Apache Iceberg". Sem `USING iceberg`, o Databricks cria uma tabela\nDelta Lake.\n\nOs números que a prova cobra:\n\n- a tabela derrubada é recuperável por **7 dias** por padrão, e `UNDROP TABLE`\n  traz ela de volta dentro dessa janela;\n- esse prazo é configurável, de 0 hora, que desliga a recuperação, até algo entre\n  7 e 30 dias, no catálogo ou no schema, e a configuração do schema tem\n  precedência sobre a do catálogo;\n- passado o prazo, "an asynchronous purge process deletes the underlying data\n  files from your cloud tenant";\n- predictive optimization vem ligada por padrão em contas criadas em 11 de\n  novembro de 2024 ou depois, e a documentação recomenda deixar ligada em toda\n  tabela gerenciada.',
                },
                {
                    type: "text",
                    value: 'Para criar uma tabela externa você não aponta um caminho qualquer. O caminho\nprecisa estar coberto por uma **localização externa**, definida assim: "An\nexternal location combines a cloud storage path with a storage credential that\nauthorizes access to the specified path".\n\nA **credencial de armazenamento** é a outra metade: "A storage credential\nrepresents an authentication and authorization mechanism for accessing data", e\nna AWS ela está associada a uma função do IAM. Várias localizações externas podem\nusar a mesma credencial, e as duas vivem direto no metastore. A permissão de\ncriar e usar localização externa, diz a documentação, "should be granted only to\nusers who need to create external tables".\n\nOs privilégios da criação, que a prova gosta de misturar:\n\n- `CREATE EXTERNAL TABLE` na localização externa que cobre o caminho;\n- `USE CATALOG` no catálogo e `USE SCHEMA` no schema;\n- `CREATE TABLE` no schema.\n\nDois limites que viram pegadinha: caminho de tabela externa não pode se sobrepor\nao local de tabela gerenciada, e os privilégios do Unity Catalog não são\naplicados quando um sistema de fora lê o arquivo direto no armazenamento. Se um\ncliente externo mexer nos metadados, o acerto é\n`MSCK REPAIR TABLE nome_da_tabela SYNC METADATA`.',
                },
                {
                    type: "code",
                    value: "-- quem pode criar objeto externo naquele caminho\nGRANT CREATE EXTERNAL TABLE ON EXTERNAL LOCATION lake_bronze TO `eng-dados`;\nGRANT READ FILES ON EXTERNAL LOCATION lake_bronze TO `eng-dados`;\n\n-- converte externa em gerenciada: sem MOVE e sem COPY\nALTER TABLE prod.bronze.cliques SET MANAGED;\n\n-- tabela estrangeira exige escolher MOVE ou COPY\nALTER TABLE fed.erp.clientes SET MANAGED COPY;\n\n-- volta atras, dentro de 14 dias da conversao\nALTER TABLE prod.bronze.cliques UNSET MANAGED;",
                },
                {
                    type: "text",
                    value: "Converter entre os dois tipos entrou no roteiro do exame, e vem com requisitos:\n\n- a tabela precisa estar em formato Delta Lake;\n- Databricks Runtime 17.3 LTS ou acima, ou computação serverless;\n- você precisa ser proprietário da tabela;\n- tabela externa usa `ALTER TABLE ... SET MANAGED`, sem `MOVE` e sem `COPY`;\n  tabela estrangeira exige escolher `SET MANAGED MOVE` ou `SET MANAGED COPY`;\n- a conversão **copia** o dado e o log de transações da localização externa para\n  o local gerenciado. O dado original fica na localização externa por 14 dias,\n  justamente para permitir o retorno com `UNSET MANAGED`.",
                },
                {
                    type: "text",
                    value: 'Tabela governa dado tabular. Quando o arquivo não é tabular, o objeto certo é o\n**volume**: "Volumes are Unity Catalog objects that enable governance over\nnon-tabular datasets".\n\nVolume vive dentro de um schema e é alcançado por caminho, no formato\n`/Volumes/<catalog>/<schema>/<volume>/<path>/<file-name>`. Para que serve volume\nem vez de tabela, nos casos que a documentação lista: área de pouso de dado cru\nvindo de sistema externo, staging para ingestão com Auto Loader, `COPY INTO` ou\nCTAS, arquivo de exploração de ciência de dados, arquivo não estruturado como\nimagem, áudio e PDF, e dado operacional como log e checkpoint.\n\nDois limites fecham a diferença contra tabela: "You can\'t register files in\nvolumes as tables in Unity Catalog" e "Volumes are intended for path-based data\naccess only".',
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Volume gerenciado", "Volume externo"], ["Onde fica o dado", "No local gerenciado do schema", "Em caminho de nuvem que já existe"], ["Quem prepara o caminho", "O Unity Catalog", "Você, antes de registrar"], ["Criação", "CREATE VOLUME, sem LOCATION", "CREATE EXTERNAL VOLUME, com LOCATION"], ["DROP VOLUME", "Dado entra em retenção de 7 dias", "Dado permanece no armazenamento"], ["Privilégio de criar", "CREATE VOLUME no schema", "CREATE VOLUME no schema e CREATE EXTERNAL VOLUME na localização externa"], ["Ler e gravar arquivo", "READ VOLUME e WRITE VOLUME", "READ VOLUME e WRITE VOLUME"]]',
                },
                {
                    type: "code",
                    value: "-- volume gerenciado: sem LOCATION\nCREATE VOLUME prod.bronze.pousada\nCOMMENT 'area de pouso de arquivo cru';\n\n-- volume externo: caminho dentro de uma localizacao externa registrada\nCREATE EXTERNAL VOLUME prod.bronze.pousada_ext\nLOCATION 's3://lake-bronze/pousada/'\nCOMMENT 'arquivos que outro sistema deposita';\n\n-- lendo arquivo pelo caminho do volume\nLIST '/Volumes/prod/bronze/pousada/';\n\nCOPY INTO prod.bronze.cliques\nFROM '/Volumes/prod/bronze/pousada/cliques/'\nFILEFORMAT = JSON;",
                },
                {
                    type: "quote",
                    value: "DROP em tabela gerenciada agenda a purga do arquivo; DROP em tabela externa ou em\nvolume externo tira só o metadado, e o arquivo fica onde está.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um time apaga uma tabela externa com `DROP TABLE` por engano. O que acontece com os arquivos Parquet no bucket?",
                    difficulty: "facil",
                    explanation:
                        "Em tabela externa o Unity Catalog governa só o metadado, então o DROP remove o registro e não toca nos arquivos. A retenção de 7 dias engana porque existe de verdade, mas vale para tabela gerenciada, onde o Unity Catalog é dono do ciclo de vida do dado.",
                    options: [
                        {
                            text: "Continuam no bucket, porque o Unity Catalog remove apenas o metadado da tabela.",
                            isCorrect: true,
                        },
                        {
                            text: "São apagados na hora, porque o DROP propaga a exclusão para o caminho registrado.",
                            isCorrect: false,
                        },
                        {
                            text: "Entram em retenção de 7 dias, porque toda tabela do Unity Catalog é recuperável.",
                            isCorrect: false,
                        },
                        {
                            text: "São movidos para o local gerenciado do schema, porque o DROP consolida o dado.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela gerenciada em Delta Lake foi derrubada há dois dias e ninguém mudou a configuração de recuperação. Como trazer os dados de volta?",
                    difficulty: "medio",
                    explanation:
                        "Tabela gerenciada é recuperável por 7 dias por padrão, e UNDROP TABLE é o comando dessa janela. RESTORE TABLE engana porque existe no Delta Lake, mas serve para voltar a tabela a uma versão anterior, não para ressuscitar uma tabela derrubada.",
                    options: [
                        {
                            text: "Rodar `UNDROP TABLE`, porque o padrão deixa a tabela recuperável por 7 dias.",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar `RESTORE TABLE`, porque o padrão deixa a tabela recuperável por 30 dias.",
                            isCorrect: false,
                        },
                        {
                            text: "Recriar a tabela no mesmo caminho, porque só o metadado foi perdido no DROP.",
                            isCorrect: false,
                        },
                        {
                            text: "Abrir chamado no suporte, porque a purga dos arquivos é síncrona e já ocorreu.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time recebe milhares de PDFs de um sistema externo e precisa governar o acesso a esses arquivos dentro do Unity Catalog. Qual objeto usar?",
                    difficulty: "medio",
                    explanation:
                        "Volume é o objeto do Unity Catalog para dado não tabular, alcançado por caminho sob /Volumes. Tabela externa em formato TEXT engana porque aceita arquivo de texto, mas governa dado tabular e não registra PDF, imagem ou áudio como linha e coluna.",
                    options: [
                        {
                            text: "Volume, porque ele governa dado não tabular e é alcançado por caminho de arquivo.",
                            isCorrect: true,
                        },
                        {
                            text: "Tabela externa em formato TEXT, porque ela governa qualquer arquivo por caminho de nuvem.",
                            isCorrect: false,
                        },
                        {
                            text: "Localização externa apenas, porque ela já governa leitura e escrita de arquivo bruto.",
                            isCorrect: false,
                        },
                        {
                            text: "Tabela gerenciada em Delta, porque ela absorve o arquivo e governa o acesso direto.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um engenheiro já tem `USE CATALOG`, `USE SCHEMA` e `CREATE TABLE` no schema de destino, mas a criação da tabela externa falha por permissão. Qual privilégio falta?",
                    difficulty: "dificil",
                    explanation:
                        "Criar tabela externa exige CREATE EXTERNAL TABLE na localização externa que cobre o caminho, além da cadeia no catálogo e no schema. CREATE EXTERNAL LOCATION engana porque serve para registrar o caminho no metastore, e não para criar tabela em caminho já registrado.",
                    options: [
                        {
                            text: "`CREATE EXTERNAL TABLE` na localização externa que cobre o caminho informado.",
                            isCorrect: true,
                        },
                        {
                            text: "`CREATE EXTERNAL LOCATION` no metastore, para registrar e usar o caminho informado.",
                            isCorrect: false,
                        },
                        {
                            text: "`WRITE FILES` no catálogo de destino, para gravar arquivo no caminho informado.",
                            isCorrect: false,
                        },
                        {
                            text: "`CREATE MANAGED STORAGE` no schema, para fixar o caminho informado da tabela.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que `ALTER TABLE prod.bronze.cliques SET MANAGED` faz quando a tabela é externa e está em formato Delta Lake?",
                    difficulty: "dificil",
                    explanation:
                        "Para tabela externa o comando vai sem MOVE e sem COPY, copia dado e log de transações para o local gerenciado e deixa o original na localização externa por 14 dias, para o UNSET MANAGED. Exigir MOVE ou COPY engana porque essa obrigação é da tabela estrangeira.",
                    options: [
                        {
                            text: "Copia dado e log para o local gerenciado e guarda o original por 14 dias.",
                            isCorrect: true,
                        },
                        {
                            text: "Move apenas o ponteiro de metadado e deixa o dado onde está, sem cópia.",
                            isCorrect: false,
                        },
                        {
                            text: "Falha por faltar a opção MOVE ou COPY, que é obrigatória em toda conversão.",
                            isCorrect: false,
                        },
                        {
                            text: "Recria a tabela como externa em outro caminho e apaga o original já.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "GRANT, REVOKE e herança de privilégios",
            blocks: [
                {
                    type: "text",
                    value: 'No fim desta aula você responde em dez segundos por que um usuário com `SELECT`\nna tabela continua recebendo erro de permissão. É a pergunta mais barata da seção\nde governança e é a que mais gente erra.\n\nA regra está na letra da documentação: "Having only the `SELECT` privilege on a\ntable is not sufficient to read it". Para tocar em um objeto você precisa do\nprivilégio de uso em **cada** contêiner acima dele, mais o privilégio do próprio\nobjeto, e a frase que fecha é "All three are required".',
                },
                {
                    type: "code",
                    value: "-- forma geral\nGRANT privilegio ON tipo nome TO principal;\nREVOKE privilegio ON tipo nome FROM principal;\n\n-- a cadeia completa para um grupo conseguir ler uma tabela\nGRANT USE CATALOG ON CATALOG prod TO `analistas`;\nGRANT USE SCHEMA ON SCHEMA prod.vendas TO `analistas`;\nGRANT SELECT ON TABLE prod.vendas.pedidos TO `analistas`;\n\n-- escrita de dado na tabela\nGRANT MODIFY ON TABLE prod.vendas.pedidos TO `eng-dados`;\n\n-- modelo registrado e cobrado com GRANT ON FUNCTION\nGRANT EXECUTE ON FUNCTION prod.ml.iris_model TO `ml-team`;\n\n-- conferindo e retirando\nSHOW GRANTS ON SCHEMA prod.vendas;\nSHOW GRANTS `analistas` ON TABLE prod.vendas.pedidos;\nREVOKE CREATE TABLE ON SCHEMA prod.vendas FROM `analistas`;",
                },
                {
                    type: "text",
                    value: 'O privilégio desce: "Privileges inherit downward through the object model\nhierarchy". Conceder `SELECT` no catálogo vale para todos os schemas e todas as\ntabelas dele, atuais e futuras. Conceder `MODIFY` no schema vale para todas as\ntabelas daquele schema, inclusive as que ainda não existem.\n\nDuas exceções que a prova usa como distrator:\n\n- privilégio concedido no **metastore** não desce para os objetos de dados. A\n  única exceção documentada é `READ METADATA`, que "granted on the metastore also\n  inherits down to all objects in the metastore";\n- **propriedade não herda**. "Ownership doesn\'t inherit downward in Unity\n  Catalog", ainda que o proprietário de um contêiner consiga administrar os\n  filhos.\n\nMetastores criados antes de 25 de agosto de 2022, na época do preview público,\npodem estar num modelo anterior, sem herança, e precisam ser atualizados para o\nmodelo de privilégios versão 1.0.',
                },
                {
                    type: "table",
                    value: '[["Privilégio", "Onde é concedido", "O que libera"], ["USE CATALOG", "Catálogo", "Alcançar objeto do catálogo, sem acesso a dado"], ["USE SCHEMA", "Schema", "Alcançar objeto do schema, sem acesso a dado"], ["SELECT", "Tabela, view, view materializada, share", "Consultar o dado"], ["MODIFY", "Tabela", "Inserir, atualizar e excluir dado da tabela"], ["CREATE TABLE", "Schema ou catálogo", "Criar tabela e view"], ["CREATE SCHEMA", "Catálogo", "Criar schema"], ["READ VOLUME e WRITE VOLUME", "Volume", "Ler arquivo, e gravar, alterar ou apagar arquivo"], ["EXECUTE", "Função e modelo registrado", "Chamar a função ou carregar o modelo"], ["BROWSE", "Catálogo, localização externa, clean room", "Descobrir objeto e ver metadado, sem privilégio de uso"], ["MANAGE", "Quase todo objeto protegível", "Gerir privilégio, transferir propriedade, renomear e apagar"], ["ALL PRIVILEGES", "Catálogo, schema, tabela, volume e outros", "Pacote de privilégios, fora EXTERNAL USE SCHEMA, EXTERNAL USE LOCATION, MANAGE e READ METADATA"]]',
                },
                {
                    type: "text",
                    value: 'Todo objeto protegível tem proprietário, e é isso que o separa do privilégio\n`MANAGE`.\n\nDo proprietário a documentação diz: "Object owners have all privileges on that\nobject, including the ability to grant privileges to other principals". Ele\ntambém revoga, transfere e apaga o objeto. Quem tem `MANAGE` administra\nprivilégio, transfere propriedade e apaga o objeto sem ser proprietário, mas\n**não** ganha automaticamente os privilégios de dado. `MANAGE` é composto, e tem\ncomo filhos `READ METADATA` e `MANAGE ACCESS CONTROL`.\n\nA transferência usa `ALTER tipo nome OWNER TO principal` e pode ser feita pelo\nproprietário atual, por um metastore admin, pelo proprietário do contêiner, que é\no catálogo para um schema e o schema para uma tabela, ou por quem tem `MANAGE` no\nobjeto. Tem uma regra à parte: só um metastore admin transfere propriedade de\nview, função ou modelo para qualquer principal; os demais só transferem para o\npróprio usuário ou para um grupo do qual fazem parte.\n\nE quem pode conceder privilégio: o proprietário do objeto, o proprietário do\ncatálogo ou do schema que o contém, quem tem `MANAGE` no objeto, e o metastore\nadmin. Administrador de conta concede direto no metastore.',
                },
                {
                    type: "code",
                    value: "-- transferindo propriedade para um grupo, em vez de pessoa\nALTER TABLE prod.vendas.pedidos OWNER TO `governanca`;\nALTER SCHEMA prod.vendas OWNER TO `governanca`;\n\n-- delegando administracao sem passar a propriedade\nGRANT MANAGE ON TABLE prod.vendas.pedidos TO `plantao-dados`;\n\n-- descoberta de metadado sem acesso a dado\nGRANT BROWSE ON CATALOG prod TO `novos-analistas`;\n\n-- privilegio de caminho vive na localizacao externa, nao no catalogo\nGRANT READ FILES ON EXTERNAL LOCATION lake_bronze TO `eng-dados`;\nGRANT WRITE FILES ON EXTERNAL LOCATION lake_bronze TO `eng-dados`;\nGRANT CREATE EXTERNAL VOLUME ON EXTERNAL LOCATION lake_bronze TO `eng-dados`;",
                },
                {
                    type: "text",
                    value: 'O roteiro oficial do exame fala em aplicar `GRANT`, `REVOKE` e `DENY`, então vale\nsaber exatamente o que a documentação diz de cada um.\n\n`GRANT` e `REVOKE` funcionam no Unity Catalog. Um detalhe prático: o `REVOKE`\ntermina com sucesso mesmo quando o privilégio nunca tinha sido concedido, então\nnão espere erro como confirmação.\n\nO comando `DENY` existe no Databricks SQL, na forma\n`DENY privilegio ON objeto TO principal`, e a semântica é forte: "Denying a\nprivilege takes precedent over any explicit or implicit grant". Negar em um\nschema nega implicitamente em todos os objetos dele, e negar em um catálogo nega\nem todos os schemas.\n\nA pegadinha é o escopo. A própria página de referência avisa que a instrução "is\nnot supported by Unity Catalog" e que ela "applies only to the `hive_metastore`\ncatalog and its objects". No Unity Catalog, a negação vem das **políticas DENY do\nABAC**, em Beta, que negam o privilégio `MANAGE ACCESS CONTROL`, e a negação\ntambém desce: o privilégio negado fica "automatically denied on all current and\nfuture child objects". Para desfazer uma negação no hive_metastore, use `REVOKE`\ndo mesmo privilégio para o mesmo principal.',
                },
                {
                    type: "table",
                    value: '[["Instrução", "Onde a documentação diz que vale", "Efeito"], ["GRANT", "Unity Catalog e hive_metastore", "Concede, e herda para os filhos do contêiner"], ["REVOKE", "Unity Catalog e hive_metastore", "Retira o privilégio, sem erro se nunca existiu"], ["DENY", "Só no catálogo hive_metastore", "Nega, com precedência sobre qualquer concessão"], ["Política DENY do ABAC", "Unity Catalog, em Beta", "Nega MANAGE ACCESS CONTROL em objetos suportados"]]',
                },
                {
                    type: "quote",
                    value: "SELECT na tabela sem USE CATALOG no catálogo e USE SCHEMA no schema não lê nada:\nos três privilégios são exigidos juntos.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um grupo recebeu `GRANT SELECT ON TABLE prod.vendas.pedidos` e a consulta ainda falha por permissão. O que está faltando?",
                    difficulty: "facil",
                    explanation:
                        "A documentação exige o privilégio de uso em cada contêiner acima do objeto: USE CATALOG no catálogo e USE SCHEMA no schema, somados ao SELECT. Pedir MODIFY engana porque parece um privilégio mais forte, mas MODIFY trata escrita de dado e não substitui a cadeia de uso.",
                    options: [
                        {
                            text: "`USE CATALOG` no catálogo `prod` e `USE SCHEMA` no schema `prod.vendas`.",
                            isCorrect: true,
                        },
                        {
                            text: "`MODIFY` na tabela, porque toda leitura exige o privilégio de escrita.",
                            isCorrect: false,
                        },
                        {
                            text: "`ALL PRIVILEGES` no metastore, porque o SELECT em tabela não funciona só.",
                            isCorrect: false,
                        },
                        {
                            text: "`BROWSE` no catálogo `prod`, porque sem ele a tabela não fica visível.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um administrador roda `GRANT MODIFY ON SCHEMA prod.vendas TO eng-dados` hoje, e amanhã alguém cria uma tabela nova nesse schema. O grupo consegue escrever na tabela nova?",
                    difficulty: "medio",
                    explanation:
                        "Privilégio concedido em contêiner desce para os filhos atuais e futuros, então MODIFY no schema cobre a tabela criada depois. A ideia de repetir o GRANT engana porque é o hábito de quem veio de ACL de tabela do Hive metastore, onde não existe essa herança.",
                    options: [
                        {
                            text: "Sim, porque o privilégio no schema vale para as tabelas atuais e futuras.",
                            isCorrect: true,
                        },
                        {
                            text: "Não, porque é preciso repetir o GRANT em cada nova tabela criada no schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, mas só depois que o proprietário rodar um REFRESH no schema.",
                            isCorrect: false,
                        },
                        {
                            text: "Não, porque MODIFY em schema cobre apenas as views, nunca as tabelas.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a diferença entre ser proprietário de uma tabela e ter o privilégio `MANAGE` sobre ela?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que o proprietário tem todos os privilégios sobre o objeto, inclusive conceder a outros, enquanto quem tem MANAGE administra privilégio, propriedade e exclusão sem receber os privilégios de dado. O distrator mais forte troca essa ordem e dá os dados ao MANAGE.",
                    options: [
                        {
                            text: "O proprietário tem todos os privilégios do objeto; quem tem MANAGE não ganha os de dado.",
                            isCorrect: true,
                        },
                        {
                            text: "Quem tem MANAGE ganha todos os privilégios do objeto, e o proprietário apenas o renomeia.",
                            isCorrect: false,
                        },
                        {
                            text: "Os dois são idênticos, e MANAGE é só o nome do papel do proprietário em SQL.",
                            isCorrect: false,
                        },
                        {
                            text: "O proprietário só lê o objeto; quem tem MANAGE é o único que pode conceder acesso.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um administrador quer dar leitura em todas as tabelas de todos os catálogos concedendo um único privilégio no nível do metastore. O que a documentação diz desse plano?",
                    difficulty: "dificil",
                    explanation:
                        "Privilégio concedido no metastore não desce para os objetos de dados, e a única exceção documentada é READ METADATA. A opção de funcionar engana porque a herança existe de verdade, mas começa no catálogo e no schema, não no nível do metastore.",
                    options: [
                        {
                            text: "Não funciona, porque privilégio de metastore não desce, fora READ METADATA.",
                            isCorrect: true,
                        },
                        {
                            text: "Funciona, porque a herança do Unity Catalog já começa no nível do metastore.",
                            isCorrect: false,
                        },
                        {
                            text: "Funciona apenas nos catálogos criados depois da concessão no metastore.",
                            isCorrect: false,
                        },
                        {
                            text: "Não funciona, porque a única exceção que desce do metastore é USE CATALOG.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer impedir que um grupo leia uma tabela específica de um catálogo do Unity Catalog, e pensa em usar a instrução `DENY`. O que a referência de SQL diz sobre isso?",
                    difficulty: "dificil",
                    explanation:
                        "A referência afirma que DENY não é suportado pelo Unity Catalog e vale só no catálogo hive_metastore; no Unity Catalog a negação vem de políticas DENY do ABAC, em Beta, sobre MANAGE ACCESS CONTROL. A opção de precedência engana porque a frase é real, mas no escopo do hive_metastore.",
                    options: [
                        {
                            text: "DENY não é suportado no Unity Catalog e vale só no catálogo hive_metastore.",
                            isCorrect: true,
                        },
                        {
                            text: "DENY vale em qualquer catálogo e tem precedência sobre qualquer concessão.",
                            isCorrect: false,
                        },
                        {
                            text: "DENY vale no Unity Catalog, mas só para privilégio concedido no metastore.",
                            isCorrect: false,
                        },
                        {
                            text: "DENY foi substituído pelo REVOKE, que passou a negar o acesso futuro também.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Filtro de linha, máscara de coluna e ABAC",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você escolhe entre filtro de linha e máscara de coluna sem\npensar duas vezes, e sabe quando a resposta certa não é nenhum dos dois, mas uma\npolítica de ABAC.\n\nO cenário é sempre o mesmo: uma tabela só, times diferentes, e cada time pode ver\num pedaço. A tentação é criar uma cópia por time, ou uma view por time. O Unity\nCatalog resolve na própria tabela, com duas ferramentas que se parecem e atacam\ncoisas distintas: o **filtro de linha**, que esconde linha, e a **máscara de\ncoluna**, que embaralha valor de coluna.",
                },
                {
                    type: "code",
                    value: "-- 1. uma UDF escalar de SQL com retorno BOOLEAN\nCREATE FUNCTION prod.seg.filtro_depto(depto STRING)\nRETURN is_account_group_member('auditoria')\n    OR is_account_group_member(depto);\n\n-- 2. amarrando a funcao na tabela, informando as colunas de entrada\nALTER TABLE prod.rh.funcionarios\nSET ROW FILTER prod.seg.filtro_depto ON (depto);\n\n-- 3. tirando o filtro da tabela\nALTER TABLE prod.rh.funcionarios DROP ROW FILTER;\n\n-- a tabela tambem pode nascer com filtro\nCREATE TABLE prod.rh.funcionarios (nome STRING, depto STRING)\nWITH ROW FILTER prod.seg.filtro_depto ON (depto);",
                },
                {
                    type: "text",
                    value: 'A gramática da documentação é\n`ROW FILTER func_name ON ( [ column_name | constant_literal [, ...] ] )`, ou\nseja, você passa coluna e também literal constante como argumento.\n\nO que a prova cobra:\n\n- a função precisa ser uma UDF escalar de SQL com tipo de retorno `BOOLEAN`;\n- a linha é descartada quando a função devolve `FALSE` **ou** `NULL`;\n- para amarrar a função você precisa de `EXECUTE` nela, `USE SCHEMA` no schema\n  dela e `USE CATALOG` no catálogo dela;\n- para adicionar ou remover filtro em tabela que já existe, você precisa ser\n  proprietário da tabela, ou ter `MANAGE` e `SELECT` nela;\n- em tempo de execução, "Only one distinct row filter can resolve at runtime for\n  a given user and table".',
                },
                {
                    type: "code",
                    value: "-- UDF que recebe o valor da coluna e devolve o valor ou a versao mascarada\nCREATE FUNCTION prod.seg.mascara_cpf(cpf STRING)\nRETURN CASE WHEN is_account_group_member('rh') THEN cpf\n            ELSE 'XXX.XXX.XXX-XX' END;\n\n-- amarrando na coluna\nALTER TABLE prod.rh.funcionarios\nALTER COLUMN cpf SET MASK prod.seg.mascara_cpf;\n\n-- mascara que usa outra coluna da mesma tabela como argumento extra\nALTER TABLE prod.rh.funcionarios\nALTER COLUMN salario SET MASK prod.seg.mascara_salario USING COLUMNS (depto);\n\n-- removendo a mascara da coluna\nALTER TABLE prod.rh.funcionarios ALTER COLUMN cpf DROP MASK;",
                },
                {
                    type: "text",
                    value: 'A gramática da máscara é\n`MASK func_name [ USING COLUMNS ( other_column_name | constant_literal [, ...] ) ]`.\n\nPontos que a prova cobra:\n\n- a função é uma UDF escalar de SQL com **ao menos um parâmetro**, e o primeiro\n  parâmetro "maps 1:1 with the masked column";\n- parâmetros extras entram pelo `USING COLUMNS`, que aceita outra coluna da mesma\n  tabela ou literal constante dos tipos STRING, numérico, BOOLEAN, INTERVAL e\n  NULL;\n- "The return type of the function must be castable to the data type of the\n  masked column";\n- cada coluna aceita **uma** máscara;\n- os privilégios são os mesmos do filtro de linha: `EXECUTE` na função,\n  `USE SCHEMA`, `USE CATALOG`, e propriedade da tabela ou `MANAGE` mais `SELECT`\n  para amarrar e desamarrar;\n- `SET MASK` e `DROP MASK` não podem ser combinados com outras mudanças de coluna\n  no mesmo `ALTER TABLE`.',
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Filtro de linha", "Máscara de coluna"], ["O que esconde", "A linha inteira", "O valor de uma coluna"], ["Retorno da função", "BOOLEAN", "Tipo convertível no da coluna"], ["Onde é amarrado", "Na tabela", "Na coluna"], ["Comando de aplicar", "ALTER TABLE ... SET ROW FILTER f ON (col)", "ALTER TABLE ... ALTER COLUMN c SET MASK f"], ["Comando de remover", "DROP ROW FILTER", "DROP MASK"], ["Argumentos extras", "Na lista do ON", "Na cláusula USING COLUMNS"], ["Quantidade", "Um filtro resolvido por usuário e tabela", "Uma máscara por coluna"]]',
                },
                {
                    type: "text",
                    value: 'Amarrar filtro e máscara tabela por tabela não escala. O **ABAC**, controle de\nacesso por atributo, resolve isso: "an access control model in Unity Catalog\nwhere access is determined by evaluating attributes" ligados aos objetos\nprotegíveis. O atributo vem das **governed tags**, as tags governadas, que "are\nused in policy conditions to identify which data a policy should protect".\n\nA política é anexada a um nível da hierarquia, "such as a metastore (Beta),\ncatalog, schema, or table", e desce: ela "evaluates against all tables, including\nviews, that are descendants of this securable object". Uma política de catálogo\nprotege coluna marcada com a tag em qualquer tabela nova daquele catálogo, sem\nninguém precisar lembrar de aplicar máscara.\n\nOs tipos de política documentados são filtro de linha, máscara de coluna,\npolíticas `GRANT`, que concedem privilégio de forma dinâmica em tipos suportados,\ne políticas `DENY`, em Beta, que negam o privilégio `MANAGE ACCESS CONTROL`.',
                },
                {
                    type: "code",
                    value: "-- mascara toda coluna marcada com a tag, em todo o catalogo\nCREATE POLICY mascara_pii\nON CATALOG prod\nCOMMENT 'mascara coluna classificada como pii'\nCOLUMN MASK prod.seg.mascara_cpf\nTO `account users`\nEXCEPT `rh`\nFOR TABLES\nMATCH COLUMNS has_tag_value('classificacao', 'pii') AS c\nON COLUMN c;\n\n-- o que vale aqui, incluindo politica herdada de um nivel acima\nSHOW EFFECTIVE POLICIES ON SCHEMA prod.rh;\n\n-- so as politicas definidas no proprio objeto\nSHOW POLICIES ON SCHEMA prod.rh;\n\nDROP POLICY mascara_pii ON CATALOG prod;",
                },
                {
                    type: "text",
                    value: "Para criar, editar ou apagar política você precisa de `MANAGE` no objeto em que\nela é anexada, ou ser proprietário dele, mais `EXECUTE` na UDF que implementa a\nlógica. Para apenas ver política, `READ METADATA`, `MANAGE` ou propriedade. O\n`MATCH COLUMNS` escolhe coluna com `has_tag('nome')` e\n`has_tag_value('nome', 'valor')`, combinados com `AND`, `OR` e `NOT`, e aceita no\nmáximo 3 expressões, que precisam casar todas.\n\nLimites que valem decorar, porque viram distrator:\n\n- runtime abaixo de 12.2 LTS não suporta filtro nem máscara, e falha fechado,\n  devolvendo nenhum dado;\n- segurança de linha e máscara não podem ser aplicadas a uma view;\n- acesso a arquivo por caminho não é suportado;\n- time travel, clone profundo e clone raso não funcionam em tabela com filtro ou\n  máscara definidos na tabela;\n- um provedor não compartilha tabela com filtro ou máscara de tabela;\n- filtro e máscara não podem referenciar tabela que já tenha filtro ou máscara\n  ativos.",
                },
                {
                    type: "quote",
                    value: "Filtro de linha devolve BOOLEAN e é amarrado na tabela; máscara devolve algo\nconvertível no tipo da coluna e é amarrada na coluna. ABAC aplica os dois por tag,\nde cima para baixo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o tipo de retorno exigido da UDF usada em um filtro de linha do Unity Catalog?",
                    difficulty: "facil",
                    explanation:
                        "A documentação exige uma UDF escalar de SQL com retorno BOOLEAN, e a linha sai do resultado quando a função devolve FALSE ou NULL. STRING engana porque é o retorno típico da função de máscara de coluna, que é o outro recurso da mesma família.",
                    options: [
                        {
                            text: "BOOLEAN, porque a função decide se cada linha entra ou não no resultado.",
                            isCorrect: true,
                        },
                        {
                            text: "STRING, porque a função devolve o valor já tratado para cada linha.",
                            isCorrect: false,
                        },
                        {
                            text: "ARRAY, porque a função devolve a lista de linhas que o usuário pode ver.",
                            isCorrect: false,
                        },
                        {
                            text: "O mesmo tipo da coluna filtrada, porque a função compara valor por valor.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um filtro de linha chama uma função que devolve `NULL` para certas linhas, por causa de um valor ausente na coluna de entrada. O que acontece com essas linhas?",
                    difficulty: "medio",
                    explanation:
                        "A documentação diz que a linha é descartada quando a função devolve FALSE ou NULL, então NULL esconde a linha. Supor que NULL libera engana porque em predicado comum NULL não é FALSE, mas aqui a regra documentada trata os dois do mesmo jeito.",
                    options: [
                        {
                            text: "Saem do resultado, porque a linha é descartada quando a função devolve FALSE ou NULL.",
                            isCorrect: true,
                        },
                        {
                            text: "Entram no resultado, porque só o retorno FALSE explícito descarta a linha daquela tabela.",
                            isCorrect: false,
                        },
                        {
                            text: "Fazem a consulta falhar, porque o filtro exige retorno BOOLEAN não nulo por linha.",
                            isCorrect: false,
                        },
                        {
                            text: "Entram no resultado com a coluna de entrada mascarada, porque o filtro vira máscara.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma máscara precisa decidir o que mostrar na coluna `salario` olhando também a coluna `depto` da mesma tabela. Como passar essa segunda coluna para a função?",
                    difficulty: "medio",
                    explanation:
                        "A cláusula USING COLUMNS existe para passar argumentos extras à função de máscara, aceitando outra coluna da tabela ou literal constante. Usar o ON engana porque essa é a sintaxe do filtro de linha, que recebe suas colunas de entrada nessa lista.",
                    options: [
                        {
                            text: "Com a cláusula `USING COLUMNS (depto)` depois do `SET MASK` da coluna.",
                            isCorrect: true,
                        },
                        {
                            text: "Com a cláusula `ON (salario, depto)` logo depois do `SET MASK` da coluna.",
                            isCorrect: false,
                        },
                        {
                            text: "Criando uma segunda máscara em `depto` e encadeando as duas funções.",
                            isCorrect: false,
                        },
                        {
                            text: "Declarando `depto` como coluna gerada e referenciando ela na função.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma analista é proprietária da função de filtro e tem `SELECT` na tabela, mas não é proprietária da tabela nem tem `MANAGE` nela. Ela consegue rodar o `ALTER TABLE ... SET ROW FILTER`?",
                    difficulty: "dificil",
                    explanation:
                        "Para adicionar ou remover filtro em tabela existente a documentação exige propriedade da tabela, ou MANAGE somado a SELECT nela, além de EXECUTE na função. Ter EXECUTE e SELECT engana porque são de fato exigidos, mas cobrem só o lado da função, não o da tabela.",
                    options: [
                        {
                            text: "Não, porque amarrar filtro exige propriedade da tabela, ou MANAGE mais SELECT nela.",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, porque EXECUTE na função e SELECT na tabela já bastam para amarrar o filtro.",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, porque quem cria a função de filtro recebe MANAGE implícito nas tabelas dela.",
                            isCorrect: false,
                        },
                        {
                            text: "Não, porque amarrar filtro exige ser metastore admin, sem exceção para proprietário.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um time quer garantir que toda coluna marcada com a tag de dado sensível fique mascarada, inclusive em tabelas que ainda vão ser criadas no catálogo. Qual recurso resolve?",
                    difficulty: "dificil",
                    explanation:
                        "Uma política de ABAC anexada ao catálogo avalia todas as tabelas descendentes e casa coluna por tag governada, cobrindo tabela futura. Aplicar SET MASK tabela por tabela engana porque funciona hoje, mas não alcança a tabela que nasce depois sem alguém repetir o comando.",
                    options: [
                        {
                            text: "Política de ABAC no catálogo, que casa coluna por tag e desce para as tabelas descendentes.",
                            isCorrect: true,
                        },
                        {
                            text: "Máscara com SET MASK em cada tabela, que o Unity Catalog replica nas tabelas criadas depois.",
                            isCorrect: false,
                        },
                        {
                            text: "Filtro de linha no catálogo, que esconde a coluna sensível de quem não é do grupo certo.",
                            isCorrect: false,
                        },
                        {
                            text: "View por grupo sobre cada tabela, já que máscara de coluna também funciona sobre view.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Linhagem, system tables e Delta Sharing",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você sabe onde olhar para três perguntas de auditoria: de onde\nveio esta tabela, quem consultou o quê, e como entregar dado para uma organização\nde fora sem copiar arquivo.\n\nAs três respostas são objetos do próprio Unity Catalog, não ferramenta de fora:\nlinhagem, system tables e compartilhamento.",
                },
                {
                    type: "text",
                    value: 'A linhagem é capturada **automaticamente**, sem instrumentar código, para\nconsultas rodadas no Databricks, e "Unity Catalog captures lineage to the column\nlevel as much as possible". Cobre tabela, view, coluna, notebook, job, dashboard,\npipeline, modelo e função definida pelo usuário, com uma ressalva: linhagem de\nUDF é capturada em nível de tabela, não de coluna.\n\nNúmeros e condições que a prova cobra:\n\n- no Catalog Explorer, "Lineage data displayed in Catalog Explorer is retained\n  indefinitely";\n- nas system tables de linhagem, a janela é móvel, de 1 ano;\n- linhagem capturada antes de 1 de setembro de 2024 não está disponível;\n- para ver linhagem o usuário precisa, no mínimo, de `BROWSE` no catálogo pai da\n  tabela, e o catálogo precisa estar acessível a partir do workspace;\n- quem não tem `BROWSE` nem `SELECT` enxerga a tabela como nó mascarado e não\n  expande o grafo a partir dela.\n\nLimites que aparecem como distrator: a linhagem não é preservada quando catálogo,\nschema, tabela, view ou coluna é renomeado; não é capturada para view temporária\nglobal, RDD nem checkpoint de dataset do Spark SQL; e a linhagem de coluna não é\ncapturada quando a origem ou o destino é referenciado por caminho em vez de nome\nde tabela.',
                },
                {
                    type: "text",
                    value: 'As system tables são "a Databricks-hosted analytical store of your account\'s\noperational data found in the `system` catalog", e são somente leitura: "System\ntables are read-only and cannot be modified".\n\nQuem acessa: "Users with both the account admin and metastore admin roles have\naccess to system tables by default". Os demais precisam de `USE CATALOG` no\ncatálogo `system`, `USE SCHEMA` nos schemas do sistema e `SELECT` neles, e o\nmetastore precisa estar no modelo de privilégios versão 1.0. Para habilitar as\nsystem tables da conta é necessário ter pelo menos um workspace habilitado para o\nUnity Catalog.\n\nAlém delas, cada catálogo criado no Unity Catalog traz um `information_schema`\npróprio, que descreve apenas os objetos daquele catálogo e já vem filtrado pelo\nque você pode ver, sem exigir `SELECT` explícito. É de lá que saem as views\n`CATALOG_PRIVILEGES`, `SCHEMA_PRIVILEGES`, `TABLE_PRIVILEGES` e\n`VOLUME_PRIVILEGES`.',
                },
                {
                    type: "table",
                    value: '[["Schema do catálogo system", "O que guarda", "Retenção gratuita"], ["access", "Log de auditoria, linhagem de tabela e de coluna", "365 dias"], ["billing", "Uso faturável e tabela de preços", "365 dias no uso, indefinida no preço"], ["compute", "Clusters, pools, tipos de nó e SQL warehouses", "365 dias, com 90 dias em node_timeline"], ["lakeflow", "Jobs, tasks, execuções e pipelines", "365 dias"], ["query", "Histórico de consulta de SQL warehouse e serverless", "365 dias"], ["serving", "Entidades servidas e uso de endpoint", "365 dias, com 90 dias no uso de endpoint"], ["storage", "Histórico de upgrade e de predictive optimization", "180 dias"], ["marketplace", "Eventos de funil e de acesso a listagem", "365 dias"]]',
                },
                {
                    type: "code",
                    value: "-- quem fez o que, pelo log de auditoria; filtre por event_date, nao event_time\nSELECT event_time, user_identity, service_name, action_name\nFROM system.access.audit\nWHERE service_name = 'unityCatalog'\n  AND event_date >= current_date() - INTERVAL 7 DAYS\nORDER BY event_time DESC;\n\n-- linhagem de tabela, de forma programatica\nSELECT source_table_full_name, target_table_full_name, entity_type\nFROM system.access.table_lineage\nWHERE target_table_full_name = 'prod.vendas.pedidos';\n\n-- linhagem no nivel de coluna\nSELECT source_column_name, target_column_name\nFROM system.access.column_lineage\nWHERE target_table_full_name = 'prod.vendas.pedidos';\n\n-- quem tem privilegio na tabela, pelo information_schema do catalogo\nSELECT grantee, privilege_type\nFROM prod.information_schema.table_privileges\nWHERE table_schema = 'vendas' AND table_name = 'pedidos';",
                },
                {
                    type: "text",
                    value: 'O compartilhamento aberto do Databricks nasceu com o nome **Delta Sharing**, que\nsegue sendo o nome do protocolo e o termo usado no roteiro oficial do exame. Na\ndocumentação atual o produto aparece como **OpenSharing**, e as páginas migraram\npara esse nome. Saiba reconhecer os dois.\n\nTrês objetos sustentam o modelo, e todos ficam direto no metastore:\n\n- **share**, "a read-only collection of tables and table partitions that a\n  provider wants to share with one or more recipients";\n- **provider**, "an entity that shares data with a recipient";\n- **recipient**, "an entity that receives shares from a provider".\n\nA vantagem que a prova cobra é a ausência de réplica: "OpenSharing does not\nrequire data replication", e a atualização do provedor aparece quase em tempo\nreal no lado do destinatário. Os ativos compartilháveis incluem tabela, streaming\ntable, tabela Iceberg gerenciada, view, view materializada, metric view, volume e\nmodelo. Arquivo de notebook só no modo entre Databricks.',
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Entre Databricks", "Aberto"], ["Destinatário precisa de Databricks", "Sim, com workspace habilitado para Unity Catalog", "Não, basta um cliente compatível"], ["Como o destinatário é identificado", "Pelo identificador de compartilhamento do metastore", "Por token de portador ou federação OIDC"], ["Token", "Não é necessário", "Token de longa duração, entregue com segurança"], ["Entrega da credencial", "Nenhuma, a conexão é da plataforma", "Link de ativação e arquivo de credencial"], ["Compartilhar arquivo de notebook", "Sim", "Não"]]',
                },
                {
                    type: "text",
                    value: 'No modo **entre Databricks**, "the share recipient doesn\'t need a token to access\nthe share", e identidade, autenticação e auditoria ficam com a plataforma. Você\ncria o recipient com o identificador de compartilhamento do metastore do outro\nlado, no formato `nuvem:regiao:uuid`, que o destinatário obtém rodando\n`SELECT current_metastore()`.\n\nNo modo **aberto**, você gera um token de portador de longa duração e entrega com\nsegurança. O Databricks gera token, arquivo de credencial e link de ativação; o\narquivo de credencial pode ser baixado **uma única vez**, e depois disso o link\nde ativação não é mais devolvido nem exibido. O token vale no máximo um ano a\npartir da criação. Girar o token expira o antigo e cria um novo, com nova URL de\nativação, e um recipient tem no máximo dois tokens ao mesmo tempo, o ativo e o\ngirado. Mudar o tempo de vida padrão do metastore não atualiza recipient que já\nexiste: é preciso girar o token dele.',
                },
                {
                    type: "code",
                    value: "-- do lado do provedor\nCREATE SHARE vendas_externas\nCOMMENT 'pedidos agregados para o parceiro';\n\nALTER SHARE vendas_externas\nADD TABLE prod.vendas.pedidos_agregados\nWITH HISTORY;\n\nALTER SHARE vendas_externas ADD SCHEMA prod.publico;\n\n-- recipient entre Databricks: exige o identificador do outro metastore\nCREATE RECIPIENT parceiro_acme\nUSING ID 'aws:us-west-2:19a84bee-54bc-43a2-87de-023d0ec16016';\n\n-- liberando e retirando o acesso do destinatario\nGRANT SELECT ON SHARE vendas_externas TO RECIPIENT parceiro_acme;\nREVOKE SELECT ON SHARE vendas_externas FROM RECIPIENT parceiro_acme;\n\n-- do lado do destinatario, o identificador do proprio metastore\nSELECT current_metastore();",
                },
                {
                    type: "text",
                    value: "Os privilégios do compartilhamento ficam no metastore, e a prova gosta de cobrar\nque não é `SELECT` em tabela que resolve:\n\n- `CREATE SHARE` e `CREATE RECIPIENT` no metastore, para criar cada objeto;\n- para adicionar um ativo ao share: ser proprietário do share, mais\n  `USE CATALOG`, `USE SCHEMA` e `SELECT` no ativo. Volume exige `READ VOLUME`, e\n  função ou modelo exigem `EXECUTE`. Se o proprietário do share perder o\n  `SELECT`, o destinatário perde o acesso àquele ativo;\n- para conceder acesso a um destinatário: metastore admin, ou `USE SHARE` mais\n  `SET SHARE PERMISSION` ou propriedade do share, somado a `USE RECIPIENT` ou\n  propriedade do recipient;\n- para revogar: metastore admin, `USE SHARE` ou propriedade do share.",
                },
                {
                    type: "quote",
                    value: "Linhagem é automática e exige BROWSE para ser vista; system tables são somente\nleitura no catálogo system; compartilhamento entre Databricks dispensa token, e o\naberto vive de um.",
                },
            ],
            questions: [
                {
                    statement:
                        "O que é preciso fazer para o Unity Catalog capturar a linhagem de uma tabela criada por um notebook do Databricks?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que a linhagem é capturada automaticamente para consultas rodadas no Databricks, até o nível de coluna quando possível. Habilitar por tabela engana porque existem configurações de governança por tabela, mas a captura de linhagem não é uma delas.",
                    options: [
                        {
                            text: "Nada, porque a captura é automática para consultas rodadas no Databricks.",
                            isCorrect: true,
                        },
                        {
                            text: "Habilitar a linhagem em cada tabela, com uma propriedade da tabela Delta.",
                            isCorrect: false,
                        },
                        {
                            text: "Registrar a origem e o destino em um objeto de metadado externo.",
                            isCorrect: false,
                        },
                        {
                            text: "Ligar a opção de linhagem no job, antes de cada execução agendada.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma equipe de segurança precisa saber, em SQL, quem consultou uma tabela do Unity Catalog nos últimos sete dias. Onde está esse dado?",
                    difficulty: "medio",
                    explanation:
                        "O log de auditoria vive em system.access.audit, no catálogo system, e a documentação recomenda filtrar por event_date em vez de event_time. A tabela de linhagem engana porque também fica no schema access, mas registra relação entre objetos, não quem executou cada consulta.",
                    options: [
                        {
                            text: "Na tabela `system.access.audit`, filtrando por `event_date` e pelo nome da ação.",
                            isCorrect: true,
                        },
                        {
                            text: "Na tabela `system.access.table_lineage`, filtrando por nome de tabela de destino.",
                            isCorrect: false,
                        },
                        {
                            text: "Na view `information_schema.table_privileges` do catálogo onde a tabela está.",
                            isCorrect: false,
                        },
                        {
                            text: "Na tabela `system.query.history`, que registra o acesso a tabela gerenciada.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um parceiro sem conta no Databricks precisa ler uma tabela compartilhada. Qual modo de compartilhamento atende, e como o parceiro se autentica?",
                    difficulty: "medio",
                    explanation:
                        "No modo aberto o destinatário não precisa de Databricks e usa um token de portador de longa duração, entregue por link de ativação e arquivo de credencial. O modo entre Databricks engana por dispensar token, mas exige workspace habilitado para Unity Catalog do outro lado.",
                    options: [
                        {
                            text: "Modo aberto, com token de portador entregue por link de ativação e arquivo de credencial.",
                            isCorrect: true,
                        },
                        {
                            text: "Modo entre Databricks, usando o identificador de compartilhamento do metastore do parceiro.",
                            isCorrect: false,
                        },
                        {
                            text: "Modo entre Databricks, com token de portador gerado pelo provedor para o parceiro.",
                            isCorrect: false,
                        },
                        {
                            text: "Modo aberto, com usuário e senha do parceiro criados no metastore do provedor.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que o provedor precisa obter do destinatário para criar o recipient no modo de compartilhamento entre Databricks?",
                    difficulty: "dificil",
                    explanation:
                        "No modo entre Databricks o recipient é criado com USING ID e o identificador de compartilhamento do metastore do destinatário, no formato nuvem:regiao:uuid, obtido com SELECT current_metastore(). O token engana porque é exatamente o que esse modo dispensa.",
                    options: [
                        {
                            text: "O identificador de compartilhamento do metastore dele, obtido com `current_metastore()`.",
                            isCorrect: true,
                        },
                        {
                            text: "O token de portador gerado por ele, que o provedor informa na criação do objeto recipient.",
                            isCorrect: false,
                        },
                        {
                            text: "O identificador do workspace dele, mais o nome do catálogo que vai receber o share.",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo de credencial baixado por ele, que o provedor registra como provider local.",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um catálogo foi renomeado e o time percebeu que o grafo de linhagem das tabelas dele ficou incompleto. O que a documentação diz sobre isso?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação lista como limitação que a linhagem não é preservada quando catálogo, schema, tabela, view ou coluna é renomeado. A ideia de reconstrução automática engana porque a captura é automática para consulta nova, mas não recria o histórico perdido no rename.",
                    options: [
                        {
                            text: "A linhagem não é preservada quando catálogo, schema, tabela, view ou coluna é renomeado.",
                            isCorrect: true,
                        },
                        {
                            text: "A linhagem é reconstruída sozinha em até 24 horas, a partir do log de auditoria da conta.",
                            isCorrect: false,
                        },
                        {
                            text: "A linhagem é preservada no rename, e o grafo incompleto indica falta de BROWSE.",
                            isCorrect: false,
                        },
                        {
                            text: "A linhagem é preservada por 1 ano no Catalog Explorer, mesmo depois do rename.",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - CI/CD e empacotamento",
    aulas: [
        {
            titulo: "Por que empacotar: o arquivo de configuração do bundle",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber dizer o que entra no arquivo de configuração de um bundle e por que levar job, pipeline e notebook como código resolve um problema que clicar na interface não resolve.\n\nO cenário é sempre o mesmo. Você montou um job na interface do workspace de desenvolvimento, apontou um notebook, configurou um agendamento e funcionou. Agora precisa do mesmo job no workspace de produção. Se a resposta for abrir a interface de produção e refazer tudo na mão, você fica sem histórico de quem mudou o quê, sem revisão por pull request, sem como voltar atrás e sem garantia de que os dois ambientes estão iguais.\n\nA resposta da Databricks para isso é um pacote declarativo. O nome que a documentação usa hoje é **Declarative Automation Bundles**, e a própria página de visão geral avisa que ele era conhecido antes como Databricks Asset Bundles, de onde vem a sigla DAB que você encontra em material mais velho. É o mesmo produto, com o mesmo arquivo `databricks.yml` na raiz do projeto.",
                },
                {
                    type: "text",
                    value: "Um bundle é a definição ponta a ponta de um projeto: como ele é estruturado, testado e implantado. Pela documentação, um bundle contém:\n\n- as configurações de infraestrutura de nuvem e de workspace que o projeto precisa;\n- os arquivos fonte com a lógica de negócio, como notebooks e arquivos Python;\n- as definições e configurações dos recursos da Databricks, como Lakeflow Jobs, Lakeflow pipelines, dashboards, endpoints de model serving, experimentos e modelos registrados do MLflow;\n- os testes de unidade e de integração.\n\nRepare no que está nessa lista: o recurso em si, não apenas o código que ele executa. O agendamento do job, o tipo de compute, a política de retry e a lista de tasks deixam de morar num formulário da interface e passam a morar num arquivo YAML que entra no Git ao lado do notebook.",
                },
                {
                    type: "code",
                    value: "# databricks.yml, na raiz da pasta do projeto\nbundle:\n  name: vendas\n\nresources:\n  jobs:\n    carga_diaria:\n      name: carga_diaria\n      tasks:\n        - task_key: carga\n          notebook_task:\n            notebook_path: ./src/carga.py\n\ntargets:\n  dev:\n    default: true",
                },
                {
                    type: "text",
                    value: "Duas regras do arquivo caem direto na prova. A primeira: o bundle tem que ter um, e somente um, arquivo chamado `databricks.yml` na raiz da pasta do projeto. A segunda: quando esse arquivo cresce, você não cria um segundo `databricks.yml`, você quebra a configuração em outros arquivos YAML e os puxa pelo mapeamento `include`, que aceita caminho ou glob.\n\nBundles são um recurso da própria CLI da Databricks, não um serviço separado que se liga no workspace. A documentação pede a CLI na versão `v0.218.0` ou superior. O workspace remoto precisa ter workspace files habilitado, o que já vem ligado no Databricks Runtime 11.3 LTS e acima. Se você só quer usar bundles dentro do workspace, a página diz que nem precisa instalar a CLI.",
                },
                {
                    type: "table",
                    value: '[["Mapeamento de topo", "Para que serve"], ["`bundle`", "Obrigatório. Traz o `name` do bundle e opções como `databricks_cli_version`, `cluster_id`, `deployment` e `git`"], ["`include`", "Lista outros arquivos de configuração para carregar, por caminho ou por glob"], ["`resources`", "Declara os recursos do bundle, como jobs, pipelines e dashboards"], ["`targets`", "Declara os ambientes de implantação, e cada um pode sobrescrever o que está no topo"], ["`variables`", "Declara as variáveis usadas ao longo da configuração"], ["`workspace`", "Ajustes padrão de workspace, como `host`, `profile`, `root_path` e `artifact_path`"], ["`run_as`", "Define a identidade com que o recurso implantado executa"], ["`permissions`", "Aplica permissões aos recursos declarados em `resources`"], ["`artifacts`", "Configura a construção de artefatos, com `build`, `files`, `path` e `type`"], ["`sync`", "Lista caminhos a incluir ou excluir na sincronização de arquivos"], ["`scripts`", "Declara scripts nomeados, cada um com o seu `content`"]]',
                },
                {
                    type: "code",
                    value: "# cria o esqueleto do projeto a partir de um template\ndatabricks bundle init\n\n# ou direto em um template nomeado\ndatabricks bundle init default-python\n\n# templates padrao disponiveis na documentacao de hoje:\n#   default-minimal, default-python, default-sql, default-scala,\n#   dbt-sql, mlops-stacks, pydabs\n\n# template proprio, de pasta local ou de URL do Git\ndatabricks bundle init /projetos/templates/meu-template\ndatabricks bundle init https://github.com/empresa/templates-bundle",
                },
                {
                    type: "quote",
                    value: "O bundle é a definição ponta a ponta do projeto, e o que entra nele não é só o notebook: é também o job, o pipeline, o dashboard e os testes, declarados em YAML e versionados no Git.",
                },
                {
                    type: "text",
                    value: "A documentação é direta sobre quando o esforço vale: use bundles quando quiser gerenciar projetos complexos em que vários contribuidores e automação são essenciais. Os cenários citados são desenvolvimento em equipe de projetos de dados, analytics e aprendizado de máquina; iteração mais rápida em projetos de modelo, com práticas prontas para produção; padrão organizacional por meio de templates próprios, que já nascem com permissões padrão, service principals e configuração de CI/CD; e conformidade regulatória, por causa do histórico versionado de código e de infraestrutura.\n\nO ciclo de vida tem seis passos, e a prova gosta da ordem: criar o esqueleto com `databricks bundle init`, desenvolver a configuração no `databricks.yml` e nos arquivos de recurso, validar, implantar no ambiente de destino, executar os recursos e, quando o projeto não é mais usado, destruir. Na página de CI/CD a recomendação aparece sem rodeio: os bundles são a abordagem recomendada para CI/CD na Databricks.",
                },
            ],
            questions: [
                {
                    statement:
                        "Uma equipe quer quebrar a configuração do bundle em vários arquivos YAML, um por recurso. Quantos arquivos `databricks.yml` o projeto pode ter, e como os outros arquivos são carregados?",
                    difficulty: "facil",
                    explanation:
                        "A documentação exige um, e somente um, arquivo `databricks.yml` na raiz da pasta do projeto. Para dividir a configuração você cria outros arquivos YAML e os puxa pelo mapeamento `include`, que aceita caminho ou glob. O `sync` trata de quais arquivos subir, não de carregar configuração.",
                    options: [
                        {
                            text: "Exatamente um `databricks.yml` na raiz do projeto, e os demais arquivos entram por `include`",
                            isCorrect: true,
                        },
                        {
                            text: "Um `databricks.yml` por alvo declarado, e os outros arquivos entram pelo mapeamento `sync`",
                            isCorrect: false,
                        },
                        {
                            text: "Um `databricks.yml` por recurso declarado, e os outros arquivos entram pelo mapeamento `artifacts`",
                            isCorrect: false,
                        },
                        {
                            text: "Quantos arquivos `databricks.yml` forem necessários, em qualquer pasta abaixo da raiz do projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Segundo a documentação, além dos arquivos fonte com a lógica de negócio, o que mais faz parte de um bundle?",
                    difficulty: "medio",
                    explanation:
                        "A página de visão geral lista quatro coisas: configuração de infraestrutura e de workspace, arquivos fonte, definições e configurações de recursos como Lakeflow Jobs e pipelines, e testes. Achar que só o código entra é o erro comum, porque o recurso em si também é declarado.",
                    options: [
                        {
                            text: "As definições dos recursos da Databricks e os testes de unidade e de integração do projeto",
                            isCorrect: true,
                        },
                        {
                            text: "Apenas os notebooks e os arquivos Python, porque recurso implantado não é descrito no bundle",
                            isCorrect: false,
                        },
                        {
                            text: "Somente as credenciais de acesso ao workspace de destino, guardadas em texto claro na raiz",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas o histórico de execuções dos jobs, exportado do workspace de origem para o de destino",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual requisito de ferramenta a documentação cita para trabalhar com bundles pela linha de comando?",
                    difficulty: "medio",
                    explanation:
                        "Bundles são um recurso da CLI da Databricks, e a documentação pede a versão `v0.218.0` ou superior. O distrator do Terraform engana porque o deploy realmente cria recurso de verdade, mas quem faz isso é a própria CLI, sem instalação de provedor à parte.",
                    options: [
                        {
                            text: "A CLI da Databricks na versão `v0.218.0` ou superior, porque bundles são um recurso da própria CLI",
                            isCorrect: true,
                        },
                        {
                            text: "O conector JDBC da Databricks na versão mais recente, porque o deploy do bundle passa por SQL",
                            isCorrect: false,
                        },
                        {
                            text: "O provedor Terraform da Databricks instalado à parte, porque a CLI não implanta recurso sozinha",
                            isCorrect: false,
                        },
                        {
                            text: "O runtime do dbt na máquina local, porque todo bundle é compilado como projeto dbt antes do deploy",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma empresa quer que todo projeto novo de dados nasça com as mesmas permissões padrão, o mesmo service principal e a mesma configuração de CI/CD. Qual recurso de bundles a documentação indica?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação cita padrão organizacional por meio de templates próprios, que já trazem permissões padrão, service principals e configuração de CI/CD, e o esqueleto sai do `databricks bundle init`. O `bundle schema` apenas imprime o JSON Schema da configuração.",
                    options: [
                        {
                            text: "Templates de projeto próprios, usados pelo `databricks bundle init` para criar o esqueleto padronizado",
                            isCorrect: true,
                        },
                        {
                            text: "O mapeamento `sync`, que copia as permissões do workspace de origem para o workspace de destino",
                            isCorrect: false,
                        },
                        {
                            text: "O comando `databricks bundle schema`, que grava o padrão da empresa dentro do JSON Schema da configuração",
                            isCorrect: false,
                        },
                        {
                            text: "O mapeamento `artifacts`, que empacota as permissões e o service principal junto com o projeto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual é a ordem do ciclo de vida de um bundle descrita na documentação?",
                    difficulty: "medio",
                    explanation:
                        "A página do ciclo de vida lista seis passos nesta ordem: criar o bundle a partir de um template, desenvolver o projeto localmente, validar, implantar no workspace de destino, executar os recursos do fluxo e destruir quando o projeto não é mais usado.",
                    options: [
                        {
                            text: "Criar o esqueleto, desenvolver a configuração, validar, implantar, executar e por fim destruir",
                            isCorrect: true,
                        },
                        {
                            text: "Implantar, criar o esqueleto, validar, executar, desenvolver a configuração e por fim destruir",
                            isCorrect: false,
                        },
                        {
                            text: "Validar, implantar, criar o esqueleto, desenvolver a configuração, destruir e por fim executar",
                            isCorrect: false,
                        },
                        {
                            text: "Executar, validar, implantar, destruir, criar o esqueleto e por fim desenvolver a configuração",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Alvos, variáveis e modo de desenvolvimento",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber escrever um `databricks.yml` que serve desenvolvimento e produção sem duplicar o projeto, e vai saber dizer de cabeça o que o modo de desenvolvimento muda no recurso que chega ao workspace.\n\nO mesmo projeto precisa rodar em lugares diferentes com valores diferentes: o catálogo é de teste numa ponta e valendo na outra, o SQL warehouse é pequeno aqui e grande lá, e o host do workspace nem é o mesmo. Copiar o projeto e manter duas cópias é a solução errada, porque cópia diverge. A solução do bundle são os alvos, no mapeamento `targets`, somados às variáveis.",
                },
                {
                    type: "code",
                    value: "bundle:\n  name: vendas\n\nvariables:\n  catalogo:\n    description: Catalogo do Unity Catalog que recebe as tabelas\n    default: dev_vendas\n  warehouse_id:\n    description: SQL warehouse usado pelas consultas\n    lookup:\n      warehouse: analytics\n\nresources:\n  jobs:\n    carga_diaria:\n      name: carga_diaria\n      tasks:\n        - task_key: carga\n          notebook_task:\n            notebook_path: ./src/carga.py\n            base_parameters:\n              catalogo: ${var.catalogo}\n\ntargets:\n  dev:\n    mode: development\n    default: true\n\n  prod:\n    mode: production\n    workspace:\n      host: https://empresa-prod.cloud.databricks.com\n      root_path: /Workspace/producao/.bundle/${bundle.name}/${bundle.target}\n    variables:\n      catalogo: prod_vendas",
                },
                {
                    type: "text",
                    value: "Três coisas valem decorar sobre alvo. Primeira: um alvo, e apenas um, pode ter `default: true`, e é nele que a CLI mexe quando você não passa a opção de alvo. Segunda: o alvo sobrescreve o que está declarado no topo, e o que ele não sobrescreve cai no valor do topo. No exemplo acima o alvo de produção não repete a task de notebook, porque ela continua valendo a partir do mapeamento `resources` do topo. Terceira: você escolhe o alvo com `-t <nome>`, ou `--target <nome>`, em qualquer comando de bundle.\n\nDentro de um alvo cabem `mode`, `default`, `workspace`, `variables`, `run_as`, `git`, `presets`, `resources`, `permissions`, `artifacts`, `sync`, `bundle` e `cluster_id`. É por isso que um único alvo consegue trocar o host do workspace, o caminho de implantação e o valor de uma variável de uma vez.\n\nO caminho de implantação merece atenção. Por padrão o bundle vai para `/Workspace/Users/<usuário>/.bundle/<nome do bundle>/<alvo>`, ou seja, para a pasta do usuário que implantou. É o que você quer em desenvolvimento, e é exatamente o que você não quer em produção.",
                },
                {
                    type: "text",
                    value: "Variável de bundle é declarada no mapeamento `variables` e referenciada com `${var.nome}` em qualquer lugar da configuração. A declaração aceita `description` e `default`. Se você não der um `default`, precisa fornecer o valor de outra forma antes de rodar qualquer comando de bundle.\n\nDois tipos de variável aparecem na prova. A variável complexa, com `type: complex`, guarda um valor estruturado, como um bloco inteiro de configuração de cluster; `complex` é o único valor válido de `type`, e a validação falha se o tipo for complexo e o `default` for um valor simples. A variável de busca, com `lookup`, resolve o identificador de um objeto a partir do nome dele, o que evita colar um ID de cluster ou de warehouse no arquivo. Os tipos de objeto aceitos incluem `cluster`, `cluster_policy`, `instance_pool`, `job`, `pipeline`, `warehouse`, `query`, `dashboard`, `alert`, `metastore`, `notification_destination` e `service_principal`. A busca falha se nenhum objeto casar com o nome, e também se mais de um casar.\n\nAlém de `${var.nome}`, a configuração aceita substituições do próprio bundle, como `${bundle.name}`, `${bundle.target}` e `${workspace.current_user.userName}`.",
                },
                {
                    type: "table",
                    value: '[["Ordem", "Fonte do valor da variável"], ["1", "A opção `--var=chave=valor` na linha de comando"], ["2", "Variável de ambiente com o prefixo `BUNDLE_VAR_`, como `BUNDLE_VAR_catalogo`"], ["3", "O arquivo `.databricks/bundle/<alvo>/variable-overrides.json`"], ["4", "O mapeamento `variables` dentro do alvo, na configuração do bundle"], ["5", "O `default` declarado na própria variável"]]',
                },
                {
                    type: "text",
                    value: "A CLI percorre essas cinco fontes nessa ordem e para na primeira que tem valor. Guarde a consequência prática: uma variável de ambiente `BUNDLE_VAR_` definida na máquina de automação ganha do valor declarado no alvo, o que é ótimo para injetar segredo e identificador no pipeline de CI/CD, e é péssimo quando alguém esqueceu a variável exportada no terminal.\n\nO `mode: development` em um alvo não é um rótulo decorativo: ele muda o recurso que chega ao workspace. A documentação lista o seguinte:\n\n- prefixa o nome dos recursos implantados com `[dev ${workspace.current_user.short_name}]`, de modo que o job de uma pessoa não colide com o job da outra no mesmo workspace. Arquivos e notebooks não recebem o prefixo;\n- adiciona a tag `dev` aos jobs e pipelines implantados;\n- marca os Lakeflow pipelines implantados como `development: true`;\n- pausa agendamentos e gatilhos dos recursos implantados, como jobs e quality monitors. Para despausar um recurso específico, defina `pause_status` como `UNPAUSED` nele;\n- habilita execuções concorrentes do job. Para desligar isso em um job, defina `max_concurrent_runs` como `1`;\n- desabilita o lock de implantação, para iterar mais rápido. Para religar, use `bundle.deployment.lock.enabled` com valor `true`;\n- permite sobrescrever a definição de um cluster existente, com `--cluster-id` ou com o mapeamento `cluster_id`.\n\nO efeito que mais confunde é o quarto: um job implantado em modo de desenvolvimento não dispara sozinho na madrugada, porque o agendamento chegou pausado. Quem não sabe disso jura que o deploy apagou o schedule.",
                },
                {
                    type: "table",
                    value: '[["Comportamento", "`mode: development`", "`mode: production`"], ["Nome do recurso", "Prefixado com `[dev ...]` e com a tag `dev`", "Sem prefixo e sem a tag `dev`"], ["Agendamento e gatilho", "Chegam pausados", "Ficam como foram declarados"], ["Lakeflow pipelines", "Marcados com `development: true`", "Validados como `development: false`"], ["Execuções concorrentes do job", "Habilitadas", "Como declarado no recurso"], ["Lock de implantação", "Desabilitado", "Em vigor"], ["Cluster existente", "Pode ser sobrescrito na linha de comando", "Não pode ser sobrescrito"], ["Branch do Git", "Não é validado pelo modo", "Validado contra o branch do alvo"]]',
                },
                {
                    type: "text",
                    value: "Modo é opcional, e `presets` tem a palavra final: a documentação diz que preset sobrescreve o padrão do modo. Os presets disponíveis em um alvo são `name_prefix`, `pipelines_development`, `trigger_pause_status`, `jobs_max_concurrent_runs`, `tags`, `source_linked_deployment` e `artifacts_dynamic_version`. Serve para o caso em que você quer quase todo o pacote do modo de desenvolvimento, mas precisa de um gatilho ativo ou de um prefixo de nome diferente do padrão.",
                },
                {
                    type: "quote",
                    value: "Modo de desenvolvimento prefixa o nome, marca com a tag `dev`, pausa agendamento e gatilho, libera execução concorrente e desliga o lock. Modo de produção não enfeita nada: ele valida.",
                },
            ],
            questions: [
                {
                    statement:
                        "Em um `databricks.yml` com os alvos de desenvolvimento e de produção, quantos alvos podem ter `default: true`?",
                    difficulty: "facil",
                    explanation:
                        "A documentação é literal: um, e somente um, dos alvos pode ter `default: true`. Sem a opção de alvo, os comandos de bundle agem nesse alvo. Dizer que nenhum pode engana porque o alvo até pode ser sempre informado na mão, mas o padrão existe.",
                    options: [
                        {
                            text: "Um e apenas um, e é o alvo que a CLI usa quando o comando roda sem a opção `-t`",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os alvos podem, e a CLI escolhe o primeiro deles em ordem alfabética do nome",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum pode, porque o alvo sempre precisa ser informado com a opção `-t` em cada comando",
                            isCorrect: false,
                        },
                        {
                            text: "Dois, um para desenvolvimento e outro para produção, e a CLI decide pelo branch do Git",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma variável tem `default` no `databricks.yml`, um valor no mapeamento `variables` do alvo de produção e também uma variável de ambiente com prefixo `BUNDLE_VAR_` na máquina de automação. Qual valor a CLI usa?",
                    difficulty: "medio",
                    explanation:
                        "A ordem é a opção `--var`, a variável de ambiente `BUNDLE_VAR_`, o arquivo `variable-overrides.json`, o mapeamento `variables` do alvo e, por último, o `default`. A CLI para na primeira fonte que tem valor, então o ambiente ganha do alvo.",
                    options: [
                        {
                            text: "O da variável de ambiente `BUNDLE_VAR_`, que vem antes do valor do alvo e antes do `default`",
                            isCorrect: true,
                        },
                        {
                            text: "O do mapeamento `variables` do alvo, que vem antes da variável de ambiente e antes do `default`",
                            isCorrect: false,
                        },
                        {
                            text: "O `default` declarado na variável, que é o único valor considerado quando existe mais de um",
                            isCorrect: false,
                        },
                        {
                            text: "Nenhum, porque a CLI falha com erro de ambiguidade quando três fontes definem a mesma variável",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job foi implantado em um alvo com `mode: development`. O agendamento declarado no YAML é diário, e o job nunca disparou sozinho. Qual é a explicação?",
                    difficulty: "medio",
                    explanation:
                        "Em modo de desenvolvimento a Databricks pausa agendamentos e gatilhos dos recursos implantados. O agendamento continua declarado, só chega pausado, e para despausar um recurso específico você define `pause_status` como `UNPAUSED` nele. Nada é removido do recurso.",
                    options: [
                        {
                            text: "O modo de desenvolvimento pausa agendamentos e gatilhos, e é preciso `pause_status: UNPAUSED` no recurso",
                            isCorrect: true,
                        },
                        {
                            text: "O modo de desenvolvimento remove o agendamento do recurso, e é preciso declarar o gatilho no alvo de produção",
                            isCorrect: false,
                        },
                        {
                            text: "O modo de desenvolvimento troca o agendamento por execução contínua, que ignora o horário declarado",
                            isCorrect: false,
                        },
                        {
                            text: "O modo de desenvolvimento exige `max_concurrent_runs: 1` para que qualquer agendamento seja respeitado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Dois engenheiros implantam o mesmo bundle no mesmo workspace de desenvolvimento e os jobs não colidem. O que a documentação diz que o modo de desenvolvimento faz com o nome dos recursos?",
                    difficulty: "dificil",
                    explanation:
                        "O modo de desenvolvimento prefixa o nome dos recursos implantados com `[dev ${workspace.current_user.short_name}]` e adiciona a tag `dev` a jobs e pipelines. Arquivos e notebooks ficam de fora do prefixo, e esse é justamente o detalhe que a prova cobra.",
                    options: [
                        {
                            text: "Prefixa o nome com `[dev ${workspace.current_user.short_name}]`, e não prefixa arquivos nem notebooks",
                            isCorrect: true,
                        },
                        {
                            text: "Prefixa com `[dev]` todos os recursos, inclusive arquivos e notebooks, e acrescenta o nome do branch atual",
                            isCorrect: false,
                        },
                        {
                            text: "Sufixa o nome com o identificador numérico do alvo, e deixa arquivos e notebooks com o nome original",
                            isCorrect: false,
                        },
                        {
                            text: "Troca o nome do recurso pelo caminho completo de implantação, que já contém a pasta do usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer apontar um SQL warehouse no bundle sem colar o identificador dele no arquivo. Qual recurso de variável resolve isso, e o que acontece se dois warehouses tiverem o mesmo nome?",
                    difficulty: "dificil",
                    explanation:
                        "A variável de busca usa `lookup` para resolver o identificador de um objeto pelo nome, e os tipos aceitos incluem `warehouse`, `cluster`, `job` e `pipeline`. A resolução falha quando nenhum objeto casa com o nome e também quando mais de um casa. O `type: complex` serve para valor estruturado.",
                    options: [
                        {
                            text: "Uma variável com `lookup`, que resolve o ID a partir do nome e falha quando mais de um objeto casa",
                            isCorrect: true,
                        },
                        {
                            text: "Uma variável com `type: complex`, que resolve o ID a partir do nome e usa o primeiro objeto encontrado",
                            isCorrect: false,
                        },
                        {
                            text: "Uma variável com `default`, que resolve o ID pelo nome e cria um warehouse novo quando há empate",
                            isCorrect: false,
                        },
                        {
                            text: "Uma variável com `description`, que resolve o ID pelo nome e ignora os objetos de nome repetido",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "A CLI da Databricks: validar, implantar e executar",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber qual comando de bundle apenas olha o arquivo, qual mexe no workspace e qual dispara execução, e vai saber o que acontece com um recurso que você apagou do YAML.\n\nDeclarative Automation Bundles são um recurso da CLI, então quase tudo que você faz com um bundle sai de um subcomando do grupo `bundle`. Os três que a prova cobra são `databricks bundle validate`, `databricks bundle deploy` e `databricks bundle run`. Eles parecem três etapas da mesma coisa, mas fazem trabalhos bem diferentes, e confundir deploy com run é erro clássico: o deploy não executa nada.",
                },
                {
                    type: "code",
                    value: "# 1. valida a configuracao\ndatabricks bundle validate -t dev\n\n# 2. implanta no alvo: sobe os arquivos e cria ou atualiza os recursos\ndatabricks bundle deploy -t dev\n\n# 3. dispara a execucao de um recurso que ja esta implantado\ndatabricks bundle run -t dev carga_diaria",
                },
                {
                    type: "table",
                    value: '[["Comando", "O que faz de fato"], ["`bundle validate`", "Valida que os arquivos de configuração estão sintaticamente corretos, avisa sobre propriedade fora do schema do recurso e imprime o resumo da identidade do bundle"], ["`bundle deploy`", "Implanta o bundle no workspace remoto: cria recurso novo, atualiza recurso existente e apaga recurso que saiu da configuração"], ["`bundle run`", "Executa um job, pipeline, app ou script do bundle já implantado. Sem a chave do recurso, pergunta qual"], ["`bundle plan`", "Mostra as ações que um deploy tomaria, sem mudar nada"], ["`bundle summary`", "Imprime a identidade e os recursos do bundle, com links diretos para o workspace"], ["`bundle destroy`", "Apaga jobs, pipelines, outros recursos e artefatos implantados antes. É permanente"], ["`bundle generate`", "Gera configuração de bundle para um recurso que já existe no workspace"], ["`bundle deployment bind`", "Liga um recurso do bundle a um recurso que já existe no workspace"], ["`bundle sync`", "Sincroniza, em via única, os arquivos locais para um diretório do workspace"], ["`bundle schema`", "Imprime o JSON Schema da configuração do bundle"], ["`bundle init`", "Cria o esqueleto do projeto a partir de um template"], ["`bundle open`", "Abre no workspace o recurso implantado"]]',
                },
                {
                    type: "text",
                    value: "O `deploy` é onde mora a pergunta difícil. Ele rastreia os recursos por identificador, não por nome, e disso saem três consequências que a documentação enuncia uma a uma:\n\n- recurso que está na configuração e não existe no workspace de destino é criado;\n- recurso que está na configuração e já existe no workspace de destino é atualizado;\n- recurso que foi removido da configuração é removido do workspace de destino, se tinha sido implantado antes.\n\nOu seja, o bundle não é só aditivo. Apagar um job do YAML e implantar apaga o job no destino. Entre as opções do comando estão `--auto-approve`, para não perguntar nada, `--fail-on-active-runs`, para abortar quando existe execução em andamento, `--force`, `--force-lock`, `--plan` e `--select`.\n\nQuando você quer ver o estrago antes, `databricks bundle plan` mostra as ações que o deploy tomaria sem mudar nada. E para apagar tudo que o bundle criou existe `databricks bundle destroy`, que é permanente e aceita `--auto-approve` para pular as confirmações.",
                },
                {
                    type: "code",
                    value: "# job: parametros, apenas algumas tasks, reinicio\ndatabricks bundle run carga_diaria --params catalogo=prod_vendas\ndatabricks bundle run carga_diaria --only carga\ndatabricks bundle run carga_diaria --restart\n\n# pipeline: refresh, refresh completo e validacao\ndatabricks bundle run pipeline_vendas --refresh-all\ndatabricks bundle run pipeline_vendas --full-refresh-all\ndatabricks bundle run pipeline_vendas --validate-only\n\n# ver o plano e o que ja esta implantado\ndatabricks bundle plan -t prod\ndatabricks bundle summary -t prod",
                },
                {
                    type: "text",
                    value: "O `run` serve para job, pipeline, app e script, e sem a chave do recurso ele pergunta qual você quer. As opções mudam conforme o alvo: em job existem `--params` para parâmetros, `--only` para rodar tasks específicas e `--restart` para cancelar e reiniciar uma execução; em pipeline existem `--refresh`, `--refresh-all`, `--full-refresh`, `--full-refresh-all` e `--validate-only`. Para app, o comando inicia ou reinicia o app com o código implantado mais recente.\n\nFalta a parte que todo mundo esquece: como a CLI sabe em qual workspace mexer. Isso vem do mapeamento `workspace` do bundle e dos perfis de configuração do arquivo `.databrickscfg` da sua máquina. A opção `-p`, ou `--profile`, escolhe o perfil em `validate`, `deploy`, `run` e `destroy`. Se você não passa essa opção e o bundle não traz um mapeamento de perfil, a CLI usa o perfil `DEFAULT`, quando ele existe. A documentação avisa que valor fixo no arquivo deixa a configuração menos reaproveitável entre projetos, e que, se existir mais de um perfil com o mesmo `host`, você é obrigado a usar `--profile`.\n\nPara trabalho atendido, na sua máquina, a recomendação é OAuth de usuário para máquina. Para trabalho não atendido, que é o caso de CI/CD, a recomendação é OAuth de máquina para máquina com um service principal, com as configurações guardadas como variáveis de ambiente no sistema de automação e a CLI instalada no compute que roda o pipeline.",
                },
                {
                    type: "text",
                    value: "Duas armadilhas de prova para fechar. A primeira: `validate` não implanta e `deploy` não executa. Quando o enunciado diz que o job precisa rodar agora, a resposta é `bundle run`, nunca `bundle deploy`. A segunda: `bundle sync` não é deploy. Ele faz sincronização de via única dos arquivos locais para um diretório do workspace, com `--dry-run`, `--full` e `--watch`, e serve para iterar em arquivo enquanto você desenvolve; ele não cria nem atualiza job e pipeline.\n\nVale conhecer também o par `bundle generate` e `bundle deployment bind`, que resolvem o caminho inverso. O `generate` escreve a configuração de bundle de um recurso que já existe no workspace, com subcomandos para job, pipeline, dashboard, app e espaço do Genie. O `bind` liga um recurso declarado no bundle a um recurso que já existe no workspace, para o bundle passar a gerenciá-lo em vez de criar um duplicado, e o `unbind` desfaz a ligação.",
                },
                {
                    type: "quote",
                    value: "`validate` olha o arquivo, `deploy` cria, atualiza e apaga recurso no workspace, e `run` dispara a execução. Recurso que sai da configuração sai do workspace no deploy seguinte.",
                },
            ],
            questions: [
                {
                    statement:
                        "Um job já está implantado no alvo de desenvolvimento e você precisa executá-lo agora, uma vez, pela linha de comando. Qual comando usa?",
                    difficulty: "facil",
                    explanation:
                        "O `bundle run` executa um job, pipeline, app ou script do bundle. O `deploy` cria e atualiza os recursos no workspace, mas não dispara execução, e é aí que a maioria erra. O `validate` e o `summary` não tocam na execução de nada.",
                    options: [
                        {
                            text: "`databricks bundle run carga_diaria`, que dispara a execução do recurso já implantado",
                            isCorrect: true,
                        },
                        {
                            text: "`databricks bundle deploy carga_diaria`, que implanta e já dispara a execução do recurso",
                            isCorrect: false,
                        },
                        {
                            text: "`databricks bundle validate carga_diaria`, que valida e dispara a execução do recurso",
                            isCorrect: false,
                        },
                        {
                            text: "`databricks bundle summary carga_diaria`, que resume e dispara a execução do recurso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma engenheira apagou a declaração de um job do `databricks.yml` e rodou o deploy no alvo de produção. O que acontece com esse job no workspace de produção?",
                    difficulty: "medio",
                    explanation:
                        "A documentação enuncia os três casos: recurso que não existe no destino é criado, recurso que existe é atualizado e recurso removido da configuração é removido do destino, se tinha sido implantado antes. O bundle rastreia por identificador, e não por nome.",
                    options: [
                        {
                            text: "É removido, porque recurso que sai da configuração é removido do alvo se já tinha sido implantado",
                            isCorrect: true,
                        },
                        {
                            text: "Continua intacto, porque o deploy do bundle só cria e atualiza recurso, e nunca remove nenhum",
                            isCorrect: false,
                        },
                        {
                            text: "Continua, mas fica órfão do bundle, e só sai do workspace com `databricks bundle deployment unbind`",
                            isCorrect: false,
                        },
                        {
                            text: "É duplicado, porque o deploy cria um recurso novo e deixa o antigo sem a tag de rastreio do bundle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você quer ver quais mudanças o próximo deploy faria no workspace de produção, sem mudar nada lá. Qual comando responde isso?",
                    difficulty: "medio",
                    explanation:
                        "O `bundle plan` existe exatamente para isso: mostrar as ações que um deploy tomaria, sem aplicar nenhuma. O `validate` verifica a sintaxe da configuração e avisa sobre propriedade fora do schema, mas não compara com o estado do workspace. O `destroy` apaga recurso.",
                    options: [
                        {
                            text: "`databricks bundle plan`, que mostra as ações que um deploy tomaria sem aplicar nenhuma",
                            isCorrect: true,
                        },
                        {
                            text: "`databricks bundle validate`, que mostra as ações que um deploy tomaria direto no workspace",
                            isCorrect: false,
                        },
                        {
                            text: "`databricks bundle sync --dry-run`, que mostra as ações que um deploy tomaria nos recursos",
                            isCorrect: false,
                        },
                        {
                            text: "`databricks bundle destroy --auto-approve`, que mostra as ações do deploy antes de aplicá-las",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Sua máquina tem dois perfis no `.databrickscfg` apontando para o mesmo `host`. O que a documentação diz que acontece ao rodar um comando de bundle?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que o `host` instrui a CLI a achar um perfil que case no `.databrickscfg`, e que, se existir mais de um perfil com o mesmo `host`, você precisa usar a opção `--profile`. O perfil `DEFAULT` só entra quando não há opção de perfil nem mapeamento de perfil.",
                    options: [
                        {
                            text: "Você é obrigado a escolher o perfil com `--profile`, porque mais de um perfil casa com o `host`",
                            isCorrect: true,
                        },
                        {
                            text: "A CLI escolhe o perfil `DEFAULT`, porque ele tem prioridade sobre qualquer outro perfil do arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "A CLI escolhe o último perfil declarado no arquivo, porque a leitura sobrescreve o perfil anterior",
                            isCorrect: false,
                        },
                        {
                            text: "A CLI combina os dois perfis, porque campos repetidos com o mesmo `host` são tratados como um só",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Durante o desenvolvimento você quer que os arquivos locais apareçam no workspace a cada mudança, sem recriar job nem pipeline. Qual comando atende, e qual é o limite dele?",
                    difficulty: "dificil",
                    explanation:
                        "O `bundle sync` faz sincronização de via única dos arquivos locais para um diretório do workspace, com `--dry-run`, `--full` e `--watch`. Ele não cria nem atualiza job e pipeline, que é trabalho do `deploy`. Por isso serve para iterar em código, e não para publicar recurso.",
                    options: [
                        {
                            text: "`bundle sync --watch`, que sincroniza arquivos em via única e não cria nem atualiza recurso",
                            isCorrect: true,
                        },
                        {
                            text: "`bundle deploy --force`, que sincroniza arquivos em via única e não cria nem atualiza recurso",
                            isCorrect: false,
                        },
                        {
                            text: "`bundle run --restart`, que sincroniza arquivos nas duas vias e recria os recursos a cada mudança",
                            isCorrect: false,
                        },
                        {
                            text: "`bundle generate job`, que sincroniza arquivos nas duas vias e atualiza a declaração do recurso",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Pastas Git e trabalho em equipe",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber onde o código vive dentro do workspace, qual referência do Git usar para produção e como a equipe organiza branch sem pisar no pé do colega.\n\nO nome atual na documentação é Databricks Git folders, em português pastas Git. Quem viu material antigo lembra do nome anterior, Repos, e a própria documentação mantém uma página explicando o que aconteceu com ele. A pasta Git é um cliente Git visual e uma API que integram repositórios Git dentro do workspace, para você desenvolver em notebooks e arquivos seguindo prática de desenvolvimento de software.",
                },
                {
                    type: "text",
                    value: "Dentro de uma pasta Git do workspace você clona um repositório, cria e troca de branch, commita mudança, resolve conflito de merge e, quando precisa de algo que a interface não cobre, usa comandos do Git pela linha de comando. É o lugar certo para iteração rápida: você edita o notebook, roda, commita e abre pull request sem sair do workspace.\n\nO fluxo de equipe que a documentação descreve é curto e vale decorar. Cada pessoa trabalha no próprio branch, em uma pasta Git dentro da pasta de usuário dela. A mudança sai de lá por pull request. O pull request é revisado e mesclado em um branch de deployment. É o merge nesse branch, e não a edição feita no workspace, que leva código para frente.",
                },
                {
                    type: "table",
                    value: '[["Aspecto", "Pasta Git de usuário", "Pasta Git de produção"], ["Onde fica", "Dentro da pasta do usuário, em `/Workspace/Users/`", "Fora das pastas de usuário, criada por administrador"], ["Para que serve", "Checkout local para desenvolvimento e iteração", "Fonte dos fluxos automatizados, com os branches de deployment"], ["Quem edita", "A pessoa dona da pasta", "Somente administrador e service principal"], ["Permissão dos demais", "Não precisam de acesso à pasta alheia", "Can Run para quem usa o projeto, e Can View para todos é opcional"], ["Como é atualizada", "Com commit e troca de branch na interface", "Por automação, quando um pull request é mesclado"]]',
                },
                {
                    type: "text",
                    value: "Para a pasta de produção a documentação tem receita. Um administrador cria a pasta Git fora das pastas de usuário, porque ela guarda os branches de deployment e serve de fonte para os fluxos automatizados. Cria, ou reaproveita, um service principal e configura uma credencial Git para ele, para que a automação consiga acessar o repositório. Concede Can Run aos usuários do projeto e ao service principal que roda a automação, e Can View para todos como item opcional. O resto da organização fica com acesso de execução apenas, sem edição: só administrador e service principal devem poder editar a pasta de produção.\n\nA atualização dessa pasta é tarefa de automação. O caminho recomendado é uma ferramenta externa, como GitHub Actions, puxando os commits novos quando o pull request é mesclado no branch de deployment. Quando não existe CI/CD externo, a alternativa citada é um notebook agendado que chama a API de Repos, com `w.repos.update(...)`, para atualizar o branch da pasta.\n\nA mesma página diz qual das duas abordagens escolher: bundles para empacotar e implantar fluxos de CI/CD, e pasta Git de produção quando você só precisa levar código para o workspace.",
                },
                {
                    type: "code",
                    value: '{\n  "git_source": {\n    "git_url": "https://github.com/empresa/pipeline-vendas",\n    "git_provider": "gitHub",\n    "git_branch": "release-candidate",\n    "sparse_checkout": {\n      "patterns": ["src/models", "src/utils"]\n    }\n  }\n}',
                },
                {
                    type: "text",
                    value: "Para staging e produção a orientação muda de lugar. A documentação diz que a pasta Git serve para iteração rápida de desenvolvimento e que, para jobs de staging e de produção, você configura as tasks para referenciar um repositório Git remoto. Os tipos de task que aceitam repositório remoto como fonte são notebook, script Python, arquivo SQL e projeto dbt.\n\nA referência do Git aceita uma, e somente uma, destas três formas: branch, com o nome do branch, por exemplo `main`; tag, com o nome da tag, por exemplo `release-1.0.0`; e commit, com o hash de um commit específico, por exemplo `e0056d01`. Ao iniciar a execução, a Databricks tira um snapshot do branch ou do commit indicado, de modo que todas as tasks daquela execução usem a mesma versão do código, e todas as tasks de um job referenciam o mesmo commit. O painel de detalhes da execução mostra o hash do commit que rodou.\n\nDaí sai a regra de produção. Branch é referência que se move, porque qualquer merge muda o que o nome aponta: a execução de amanhã pode rodar outro código sem que ninguém tenha mexido no job. Hash de commit é a referência mais estrita que a documentação oferece, porque identifica um ponto fixo do histórico. Tag fica no meio, legível e estável no uso normal. Quando a prova pergunta qual referência dá o resultado mais previsível em produção, a resposta é o commit.",
                },
                {
                    type: "table",
                    value: '[["Referência", "O que você informa", "Comportamento"], ["Branch", "Nome do branch, por exemplo `main`", "Muda a cada merge, então a execução seguinte pode rodar outro código"], ["Tag", "Nome da tag, por exemplo `release-1.0.0`", "Aponta para o commit que a tag indica, estável no uso normal"], ["Commit", "Hash do commit, por exemplo `e0056d01`", "Ponto fixo do histórico, a referência mais estrita das três"]]',
                },
                {
                    type: "quote",
                    value: "Pasta Git é para iterar em desenvolvimento. Para staging e produção a task aponta para um repositório Git remoto, e quem quer resultado previsível fixa o hash do commit.",
                },
                {
                    type: "text",
                    value: "Três limitações fecham a aula, e todas rendem questão de cenário. A primeira: task configurada para usar repositório Git remoto não consegue escrever em arquivos do workspace. Para dado temporário use o armazenamento efêmero do driver, e para dado persistente use um volume ou uma tabela. A segunda: um job pode começar a rodar no meio de uma operação de Git na pasta, e aí alguns notebooks já foram atualizados e outros não, com comportamento imprevisível. É mais um argumento para apontar produção para o repositório remoto, onde o snapshot por execução resolve esse problema. A terceira é a lista de limites da pasta Git, que vale decorar: branch de trabalho limitado a 1 GB, arquivo acima de 10 MB não é exibido na interface, cada operação de Git suporta até 2 GB de memória e 4 GB de escrita em disco, e a recomendação é manter o total de ativos e arquivos do workspace abaixo de 20.000.\n\nFica clara, então, a divisão de trabalho entre as duas ferramentas. A página de CI/CD com pastas Git diz para usar bundles quando você quer empacotar e implantar fluxos de CI/CD, e usar pasta Git de produção quando você só precisa levar código para o workspace. Bundle declara o recurso; pasta Git leva o arquivo.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o nome atual, na documentação da Databricks, da integração que traz repositórios Git para dentro do workspace?",
                    difficulty: "facil",
                    explanation:
                        "A página se chama Databricks Git folders e define o recurso como um cliente Git visual e uma API que integram repositórios Git ao workspace. Repos é o nome anterior, e a documentação mantém uma página explicando a transição, então ele não é a resposta atual.",
                    options: [
                        {
                            text: "Databricks Git folders, que a documentação descreve como cliente Git visual e API no workspace",
                            isCorrect: true,
                        },
                        {
                            text: "Databricks Repos, que a documentação descreve como o cliente Git visual atual do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "Databricks Workspace Sync, que a documentação descreve como o cliente Git visual do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "Databricks Code Vault, que a documentação descreve como o cliente Git visual e a API do workspace",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Qual fluxo de trabalho em equipe a documentação descreve para pastas Git?",
                    difficulty: "medio",
                    explanation:
                        "A documentação descreve cada pessoa trabalhando no próprio branch, em uma pasta Git dentro da pasta de usuário dela, com a mudança saindo por pull request, que é revisado e mesclado em um branch de deployment. Commit direto no branch de deployment não é o fluxo descrito.",
                    options: [
                        {
                            text: "Cada um no próprio branch, em pasta Git de usuário, com pull request mesclado no branch de deployment",
                            isCorrect: true,
                        },
                        {
                            text: "Todos no mesmo branch, em uma pasta Git compartilhada, com commit direto no branch de deployment do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "Cada um no próprio branch, direto na pasta Git de produção, com merge feito pela interface de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Todos no branch de deployment, em pasta Git de usuário, com pull request aberto depois do commit",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job de produção precisa rodar exatamente o mesmo código em toda execução, mesmo que o branch receba merges. Como configurar a referência Git da task?",
                    difficulty: "medio",
                    explanation:
                        "A referência Git aceita branch, tag ou commit, e o commit é informado pelo hash, que identifica um ponto fixo do histórico. Apontar para o branch engana porque o snapshot é tirado por execução, então cada execução pega o estado atual do branch, que muda a cada merge.",
                    options: [
                        {
                            text: "Apontar para o hash de um commit específico, que identifica um ponto fixo do histórico do repositório",
                            isCorrect: true,
                        },
                        {
                            text: "Apontar para o branch principal do repositório, que a Databricks congela no primeiro deploy do job de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Apontar para a pasta Git de produção do workspace, que a Databricks marca como somente leitura",
                            isCorrect: false,
                        },
                        {
                            text: "Apontar para o branch de deployment, que a Databricks reaponta para o commit mais antigo do branch",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Como a documentação recomenda configurar a pasta Git de produção, e quem pode alterá-la?",
                    difficulty: "dificil",
                    explanation:
                        "A recomendação é o administrador criar a pasta de produção fora das pastas de usuário, com Can Run para quem usa o projeto e para o service principal da automação, e edição restrita a administrador e service principal. A pasta é atualizada quando um pull request é mesclado.",
                    options: [
                        {
                            text: "Criada por administrador fora das pastas de usuário, atualizada por automação e editável só por admin e service principal",
                            isCorrect: true,
                        },
                        {
                            text: "Criada por cada engenheiro dentro da própria pasta de usuário, e atualizada na interface por quem tem a permissão Can Run",
                            isCorrect: false,
                        },
                        {
                            text: "Criada por administrador dentro da pasta compartilhada do workspace, e editável por todos os usuários do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "Criada pelo service principal no primeiro deploy do bundle, e editável por qualquer pessoa com Can View na pasta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma task configurada com repositório Git remoto tenta gravar um arquivo temporário em arquivos do workspace e falha. O que a documentação orienta usar?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação diz que task com repositório Git remoto não consegue escrever em arquivos do workspace, e indica armazenamento efêmero do driver para dado temporário e volume ou tabela para dado persistente. Pasta Git não é área de dado, nem de desenvolvimento nem de produção.",
                    options: [
                        {
                            text: "Armazenamento efêmero do driver para dado temporário, e volume ou tabela para dado persistente",
                            isCorrect: true,
                        },
                        {
                            text: "A pasta Git de produção para dado temporário, e a pasta Git de usuário para dado persistente",
                            isCorrect: false,
                        },
                        {
                            text: "O `root_path` do bundle para dado temporário, e o repositório Git remoto para dado persistente",
                            isCorrect: false,
                        },
                        {
                            text: "O checkpoint do Auto Loader para dado temporário, e o log de transações para dado persistente",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Promover de desenvolvimento para produção",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber desenhar o caminho de um projeto do workspace de desenvolvimento até produção, dizer com qual identidade o recurso executa lá e listar o que não se faz na mão no ambiente de produção.\n\nO caminho tem uma ordem, e a documentação a enuncia: o mais comum é o bundle ser implantado primeiro no workspace pessoal de desenvolvimento, para teste; terminado o teste, ele vai para staging e depois para os alvos de produção. Promoção não é cópia manual de notebook. É o mesmo bundle, no mesmo repositório, implantado em outro alvo.",
                },
                {
                    type: "table",
                    value: '[["Alvo", "Para que serve", "Configuração típica"], ["Desenvolvimento", "Teste pessoal de quem está desenvolvendo", "`mode: development`, `default: true`, caminho na pasta do usuário"], ["Staging", "Validação antes de produção, com dado próximo do real", "Catálogo de staging, gatilho ativo apenas no que precisa ser testado"], ["Produção", "Execução valendo, disparada por agendamento ou gatilho", "`mode: production`, `run_as` com service principal, caminho fora de pasta de usuário"]]',
                },
                {
                    type: "text",
                    value: "O `mode: production` troca conveniência por verificação. A documentação lista o que ele faz:\n\n- valida que todos os Lakeflow pipelines implantados estão marcados com `development: false`;\n- valida que o branch do Git em que você está casa com o branch declarado no alvo. Essa validação pode ser ignorada passando `--force` no deploy;\n- recomenda service principal para produção, e definir `run_as` com um service principal passa a exigir esse uso;\n- se você não usa service principal, valida que `artifact_path`, `file_path`, `root_path` e `state_path` não foram sobrescritos para um usuário específico, e que `run_as` e `permissions` estão declarados;\n- não permite sobrescrever a definição de um cluster existente, nem pela linha de comando nem pelo mapeamento de compute do alvo.\n\nLeia a quarta linha de novo, porque é a que mais aparece em questão. Se o alvo de produção implanta na pasta pessoal de alguém, o projeto fica preso a essa conta e morre quando a pessoa sai da empresa. A validação existe para impedir isso. A mesma lógica aparece na orientação sobre bundle compartilhado: implante em um local que a equipe possui, e não na pasta compartilhada aberta do workspace, para conseguir aplicar permissão de menor privilégio.",
                },
                {
                    type: "code",
                    value: "targets:\n  prod:\n    mode: production\n    git:\n      branch: main\n    workspace:\n      host: https://empresa-prod.cloud.databricks.com\n      root_path: /Workspace/producao/.bundle/${bundle.name}/${bundle.target}\n    run_as:\n      service_principal_name: sp-engenharia-dados\n    permissions:\n      - level: CAN_MANAGE\n        group_name: engenharia_dados\n      - level: CAN_RUN\n        group_name: analistas",
                },
                {
                    type: "text",
                    value: "O `run_as` responde quem o recurso executa como e, mais importante, separa quem implanta de quem executa. Ele aceita `user_name` ou `service_principal_name`, no topo da configuração ou dentro de um alvo, e um usuário que não é administrador só pode colocar o próprio email em `user_name`. O `run_as` do próprio recurso aceita também `group_name`, o que os mapeamentos de topo e de alvo não aceitam.\n\nTrês detalhes que a prova usa como distrator. Primeiro: se a identidade que implanta é a mesma de `run_as`, todos os recursos do bundle são suportados; se são diferentes, apenas jobs e pipelines são. Segundo: endpoints de model serving não suportam `run_as`, e declarar um deles em um bundle que define `run_as` dá erro. Terceiro: o fluxo precisa ser implantado pelo mesmo service principal, ou por alguém que tenha a permissão CAN_USE sobre esse service principal.\n\nA orientação geral da página de CI/CD é curta: use service principals, e não usuários, com CI/CD. Para autenticação ela indica a federação de token OAuth como a opção mais segura, porque dispensa guardar segredo da Databricks no sistema de automação.",
                },
                {
                    type: "code",
                    value: "# no pipeline de automacao, com service principal autenticado por OAuth M2M\n\n# em todo pull request: valida a configuracao dos dois alvos\ndatabricks bundle validate -t staging\ndatabricks bundle validate -t prod\n\n# no merge no branch de deployment: implanta e testa em staging\ndatabricks bundle deploy -t staging\ndatabricks bundle run -t staging testes_integracao\n\n# na liberacao: mostra o plano, implanta e dispara em producao\ndatabricks bundle plan -t prod\ndatabricks bundle deploy -t prod --fail-on-active-runs\ndatabricks bundle run -t prod carga_diaria",
                },
                {
                    type: "text",
                    value: "O que não se faz na mão no ambiente de produção:\n\n- editar pela interface o notebook implantado no workspace de produção. O deploy seguinte sobrescreve, e a correção se perde sem deixar rastro no Git;\n- mudar agendamento, cluster, política de retry ou lista de tasks do job pela interface. Esses campos vivem no YAML, e o workspace é o destino, não a fonte;\n- criar recurso novo clicando. Ele não entra no bundle, não é rastreado e não aparece no próximo ambiente;\n- apagar declaração do YAML sem perceber que o deploy apaga o recurso correspondente no destino;\n- atualizar a pasta Git de produção na mão. A documentação diz que ela deve ser atualizada por automação, quando o pull request é mesclado no branch de deployment, e que a maioria dos usuários fica com acesso de execução apenas;\n- implantar bundle compartilhado na pasta compartilhada aberta do workspace, em vez de um local que a equipe possui e consegue restringir.\n\nA regra por trás de todas é a mesma: em produção o workspace é um destino de implantação, e a fonte da verdade é o repositório. Correção vira commit, commit vira pull request, pull request mesclado vira deploy.",
                },
                {
                    type: "quote",
                    value: "Em produção o recurso executa como service principal, o branch é validado contra o alvo, o caminho de implantação não é a pasta de ninguém em particular, e nada se edita pela interface.",
                },
                {
                    type: "text",
                    value: "Para fechar, dois fatos de nomenclatura que aparecem em questão de múltipla escolha. A documentação de CI/CD descreve um fluxo de sete passos: versionar, codificar, construir, implantar, testar, executar e monitorar. E ela traz guia dedicado para três plataformas de automação: Azure DevOps, GitHub Actions e Jenkins. A frase que resume a seção é que os Declarative Automation Bundles são a abordagem recomendada para CI/CD na Databricks, com a pasta Git de produção como alternativa para quem só precisa levar código ao workspace.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual ordem de promoção de um bundle a documentação descreve como a mais comum?",
                    difficulty: "facil",
                    explanation:
                        "A documentação diz que o mais comum é o bundle ser implantado primeiro no workspace pessoal de desenvolvimento, para teste, e que, terminado o teste, ele segue para staging e depois para os alvos de produção. Não existe atalho recomendado direto para produção.",
                    options: [
                        {
                            text: "Workspace pessoal de desenvolvimento para teste, depois staging e depois os alvos de produção",
                            isCorrect: true,
                        },
                        {
                            text: "Alvo de produção primeiro, para garantir o recurso, e depois staging e o workspace pessoal",
                            isCorrect: false,
                        },
                        {
                            text: "Staging primeiro, depois o workspace pessoal de desenvolvimento e por último os alvos de produção",
                            isCorrect: false,
                        },
                        {
                            text: "Direto do workspace pessoal de desenvolvimento para produção, porque staging não existe em bundle",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um alvo com `mode: production` não usa service principal e define o caminho de implantação dentro da pasta pessoal de uma engenheira. O que o deploy faz?",
                    difficulty: "medio",
                    explanation:
                        "Sem service principal, o modo de produção valida que `artifact_path`, `file_path`, `root_path` e `state_path` não foram sobrescritos para um usuário específico, e que `run_as` e `permissions` estão declarados. Por isso o deploy falha, em vez de implantar e avisar depois.",
                    options: [
                        {
                            text: "Falha na validação, porque sem service principal o caminho não pode ser de um usuário específico",
                            isCorrect: true,
                        },
                        {
                            text: "Implanta normalmente, porque o modo de produção não olha o caminho de implantação do bundle",
                            isCorrect: false,
                        },
                        {
                            text: "Implanta e troca o caminho sozinho para a pasta compartilhada, avisando no resumo do comando",
                            isCorrect: false,
                        },
                        {
                            text: "Falha, porque o modo de produção proíbe caminho de implantação declarado e exige sempre o padrão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O engenheiro está em um branch de correção e roda o deploy em um alvo com `mode: production`, que declara outro branch no mapeamento `git`. Qual é o comportamento?",
                    difficulty: "medio",
                    explanation:
                        "O modo de produção valida que o branch atual do Git casa com o branch declarado no alvo, e essa validação pode ser ignorada passando `--force` no deploy. Dizer que a única saída é mesclar engana porque existe a válvula de escape documentada.",
                    options: [
                        {
                            text: "O deploy falha na validação de branch, e só passa se ele usar a opção `--force` no comando",
                            isCorrect: true,
                        },
                        {
                            text: "O deploy funciona, e a Databricks troca o branch local antes de subir os arquivos do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O deploy funciona, porque o branch declarado no alvo serve apenas como documentação do projeto",
                            isCorrect: false,
                        },
                        {
                            text: "O deploy falha, e a única saída é mesclar a correção no branch declarado antes de tentar de novo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um bundle cujo `run_as` aponta para um service principal, a implantação é feita por um usuário. Quais recursos são suportados e qual permissão o usuário precisa ter?",
                    difficulty: "dificil",
                    explanation:
                        "Quando a identidade que implanta é diferente da de `run_as`, apenas jobs e pipelines são suportados, e o fluxo precisa ser implantado pelo mesmo service principal ou por alguém com a permissão CAN_USE sobre ele. Endpoints de model serving não suportam `run_as`.",
                    options: [
                        {
                            text: "Apenas jobs e pipelines, e o usuário precisa ter a permissão CAN_USE sobre esse service principal",
                            isCorrect: true,
                        },
                        {
                            text: "Todos os recursos do bundle, e o usuário precisa da permissão CAN_MANAGE sobre o service principal",
                            isCorrect: false,
                        },
                        {
                            text: "Apenas dashboards e endpoints de model serving, e o usuário precisa ser administrador do workspace",
                            isCorrect: false,
                        },
                        {
                            text: "Todos os recursos, e nenhuma permissão extra é exigida porque o `run_as` já declara a identidade",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um analista corrigiu, pela interface do workspace de produção, o notebook de um job implantado por bundle. Qual é a consequência, segundo a prática recomendada?",
                    difficulty: "dificil",
                    explanation:
                        "Em produção o workspace é destino de implantação, e a fonte da verdade é o repositório, então o deploy seguinte sobrescreve a correção feita na interface. O caminho certo é commit, pull request e deploy, para a mudança ficar versionada e chegar aos outros ambientes.",
                    options: [
                        {
                            text: "O próximo deploy sobrescreve a correção, porque a fonte da verdade é o repositório, não o workspace",
                            isCorrect: true,
                        },
                        {
                            text: "A correção vira a nova fonte da verdade, e o próximo deploy traz o arquivo do workspace para o Git",
                            isCorrect: false,
                        },
                        {
                            text: "O próximo deploy preserva a correção, porque o bundle rastreia o recurso e ignora arquivo alterado",
                            isCorrect: false,
                        },
                        {
                            text: "A correção é replicada para o alvo de staging no próximo deploy, porque os alvos compartilham arquivo",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Monitoramento e otimização",
    aulas: [
        {
            titulo: "Onde olhar quando algo falha: log de eventos e Spark UI",
            blocks: [
                {
                    type: "text",
                    value: "No fim desta aula você vai saber qual tela abrir diante de duas falhas que não se parecem: um pipeline que terminou com erro ou que descartou registros, e um job que terminou certo, só que levou três horas em vez de vinte minutos. São dois caminhos de diagnóstico diferentes, com ferramentas diferentes. O primeiro começa no log de eventos do pipeline. O segundo começa na Spark UI. Abrir a ferramenta errada é a forma mais comum de perder uma hora.",
                },
                {
                    type: "text",
                    value: "**Quando o problema é um pipeline, a primeira parada é o log de eventos.** A documentação trata esse log como a verdade de base por baixo da interface: a tela de monitoramento mostra o resumo da atualização selecionada, e o log responde o histórico e tudo que é programático.\n\nPor padrão o log é uma tabela Delta oculta, no catálogo e no schema padrão do pipeline, com nome no formato `event_log_{pipeline_id}`, onde os hífens do identificador viram sublinhado. Ela aparece em `system.information_schema.tables`, mas não aparece no Catalog Explorer, então o acesso normal é pela função `event_log()`. Por padrão, só o usuário de execução do pipeline consegue consultar.\n\nEm Advanced settings do pipeline você publica o log em um catálogo, schema e nome escolhidos, que é o caminho quando mais de uma pessoa precisa ler. Para compartilhar, a documentação recomenda criar uma view em cima do log antes de mexer em privilégio, porque dar acesso direto à tabela expõe metadado de schema. E avisa: não apague o log nem o catálogo ou schema onde ele vive, ou as próximas atualizações do pipeline podem falhar.",
                },
                {
                    type: "code",
                    value: "-- sintaxe da função de valor de tabela\nevent_log( { TABLE ( table_name ) | pipeline_id } )\n\n-- todos os eventos de um pipeline, pelo identificador\nSELECT * FROM event_log('a1b2c3d4-0000-1111-2222-333344445555');\n\n-- eventos de uma tabela de streaming ou visão materializada\nSELECT * FROM event_log(TABLE(vendas_prata));\n\n-- a atualização mais recente registrada\nSELECT timestamp, message\nFROM event_log('a1b2c3d4-0000-1111-2222-333344445555')\nWHERE event_type = 'create_update'\nORDER BY timestamp DESC\nLIMIT 1;",
                },
                {
                    type: "text",
                    value: "Cada linha do log traz `id`, `sequence`, `origin`, `timestamp`, `message`, `level`, `maturity_level`, `error`, `event_type` e `details`. A coluna que resolve o diagnóstico é `details`: ela é JSON e a estrutura dela depende do `event_type`.\n\nA coluna `level` assume quatro valores: `INFO` para evento informativo, `WARN` para problema inesperado mas não crítico, `ERROR` para falha que pode exigir atenção, e `METRICS` para evento de volume alto. O detalhe que a prova gosta: evento de nível `METRICS` fica **só na tabela Delta** e não aparece na interface do pipeline. É por isso que a tabela responde pergunta que a tela não responde.",
                },
                {
                    type: "table",
                    value: '[["Pergunta que você precisa responder","event_type","Onde olhar em details"],["Quem disparou a atualização e quando","user_action","Ação registrada e nome do usuário"],["Qual tabela alimenta qual, para lineage","flow_definition","`output_dataset` e `input_datasets`"],["Quantos registros a expectativa reprovou","flow_progress","`data_quality.expectations`"],["Quantos registros foram descartados","flow_progress","`data_quality.dropped_records`"],["Quantas linhas o fluxo escreveu","flow_progress","`metrics.num_output_rows`"],["Qual o tamanho do acúmulo na fonte","flow_progress","`metrics.backlog_bytes`"],["Qual versão do runtime executou","runtime_details","`runtime_version.dbr_version`"]]',
                },
                {
                    type: "code",
                    value: "-- progresso, qualidade e acúmulo em uma consulta só\nSELECT\n  timestamp,\n  details:flow_progress.status,\n  details:flow_progress.metrics.num_output_rows,\n  details:flow_progress.metrics.backlog_bytes,\n  details:flow_progress.data_quality.dropped_records,\n  details:flow_progress.data_quality.expectations\nFROM event_log('a1b2c3d4-0000-1111-2222-333344445555')\nWHERE event_type = 'flow_progress'\nORDER BY timestamp DESC;",
                },
                {
                    type: "quote",
                    value: "Pipeline que falhou ou que descartou registro se diagnostica no log de eventos. Job que ficou lento se diagnostica na Spark UI. Trocar uma ferramenta pela outra é perder tempo.",
                },
                {
                    type: "text",
                    value: "**Quando o problema é tempo, e não corretude, a ferramenta é a Spark UI**, aberta na página do compute. A documentação dá um roteiro de cinco passos, e seguir a ordem importa:\n\n1. abrir a linha de tempo dos jobs, para enxergar o problema grande antes do pequeno;\n2. achar o estágio de maior duração, ordenando a lista de estágios por duração;\n3. procurar distorção ou derramamento nesse estágio;\n4. decidir se o estágio está limitado por entrada e saída;\n5. só então procurar outras causas de lentidão.\n\nNo detalhe de entrada e saída do estágio existem quatro colunas: **Input** e **Output**, que são o dado lido e escrito no armazenamento, e **Shuffle Read** e **Shuffle Write**, que são o dado de embaralhamento lido e escrito. O número de tasks do estágio também ajuda: com um único task, isso já é sinal de problema; com mais de um, a documentação recomenda investigar mais fundo.",
                },
                {
                    type: "text",
                    value: "**Embaralhamento** é a redistribuição de dado entre executores que junção, agregação e reparticionamento exigem. Shuffle Read e Shuffle Write alto dizem que muito dado cruzou a rede naquele estágio.\n\n**Derramamento** é o que acontece quando o Spark fica sem memória de execução. A memória de execução atende embaralhamento, junção, ordenação e agregação; quando ela aperta, o Spark move dado da memória para o disco, o que a documentação classifica como caro. Derramamento é mais comum durante o embaralhamento, o que liga um sintoma ao outro. Na página do estágio, se houve derramamento as estatísticas dele aparecem no cabeçalho; não aparecer significa que não houve.\n\n**Distorção** é outra coisa: um ou poucos tasks demoram muito mais que o resto. Para medir, abra **Summary Metrics** e compare o valor **Max** com o percentil 75. Em estágio saudável os dois ficam parecidos. Se o Max estiver 50% acima do percentil 75, o estágio pode estar distorcido. A referência é o percentil 75, não a mediana.",
                },
                {
                    type: "table",
                    value: '[["Sinal na Spark UI","O que ele indica"],["Shuffle Read e Shuffle Write altos no estágio","Muito dado cruzando a rede entre os executores"],["Estatística de derramamento no cabeçalho do estágio","Faltou memória de execução e o dado foi para o disco"],["Max muito acima do percentil 75 em Summary Metrics","Distorção, com poucos tasks carregando o estágio"],["Peak Execution Memory alto no estágio","Quanta memória de execução o estágio pediu no pico"],["Estágio com um único task","Sinal de problema, segundo a própria documentação"]]',
                },
                {
                    type: "text",
                    value: "Identificado o embaralhamento, a prova cobra duas configurações, e cobra justamente a diferença entre elas.\n\n`spark.sql.shuffle.partitions` define em quantas partições o dado é dividido no embaralhamento de junção e de agregação. O padrão é **200**. O valor `auto` liga o embaralhamento autootimizado, que decide esse número a partir do plano da consulta e do tamanho do dado de entrada. Em Structured Streaming o valor não pode mudar entre reinícios a partir do mesmo checkpoint.\n\nO limite de junção com broadcast ataca outro ponto: se um lado da junção é pequeno o bastante, ele é enviado inteiro para todos os nós de trabalho e o embaralhamento daquela junção desaparece. No Apache Spark, `spark.sql.autoBroadcastJoinThreshold` tem padrão de 10485760 bytes, ou seja **10 MB**, e o valor `-1` desliga o broadcast automático. Na Databricks, a execução adaptativa de consulta, ligada por padrão via `spark.databricks.optimizer.adaptive.enabled`, tem o seu próprio limite medido em tempo de execução, `spark.databricks.adaptive.autoBroadcastJoinThreshold`, com padrão de **30 MB**, que é o tamanho que faz uma junção de sort merge virar junção de broadcast no meio da execução.\n\nA dica de consulta passa por cima do limite: o lado marcado com `BROADCAST` é enviado aos nós independentemente de `autoBroadcastJoinThreshold`. E junção de broadcast nunca recebe tratamento de distorção.",
                },
                {
                    type: "code",
                    value: "-- quantas partições no embaralhamento\nSET spark.sql.shuffle.partitions = 200;\nSET spark.sql.shuffle.partitions = auto;\n\n-- limite de tamanho para o broadcast automático\nSET spark.sql.autoBroadcastJoinThreshold = 10485760;\nSET spark.sql.autoBroadcastJoinThreshold = -1;\n\n-- a dica força o broadcast de um lado, ignorando o limite\nSELECT /*+ BROADCAST(dim) */ *\nFROM fato INNER JOIN dim ON fato.id = dim.id;",
                },
                {
                    type: "table",
                    value: '[["Configuração","O que controla","Padrão"],["`spark.sql.shuffle.partitions`","Número de partições no embaralhamento de junção e agregação","200, ou `auto` para decidir pelo plano"],["`spark.sql.autoBroadcastJoinThreshold`","Tamanho máximo da tabela enviada inteira a todos os nós","10485760 bytes, 10 MB, e `-1` desliga"],["`spark.databricks.adaptive.autoBroadcastJoinThreshold`","Limite medido em execução para trocar sort merge por broadcast","30 MB"],["`spark.sql.adaptive.advisoryPartitionSizeInBytes`","Tamanho alvo das partições unidas pela execução adaptativa","64 MB"]]',
                },
            ],
            questions: [
                {
                    statement:
                        "Onde fica, por padrão, o log de eventos de um pipeline do Lakeflow, e como ele é consultado?",
                    difficulty: "facil",
                    explanation:
                        "A documentação descreve o log como uma tabela Delta oculta no catálogo e schema padrão do pipeline, com nome no formato `event_log_{pipeline_id}`, visível em `system.information_schema.tables` mas não no Catalog Explorer. A armadilha é supor uma view pronta no information_schema: lá aparece apenas o registro da tabela.",
                    options: [
                        {
                            text: "Em uma tabela Delta oculta no catálogo e schema padrão do pipeline, consultada pela função `event_log()`",
                            isCorrect: true,
                        },
                        {
                            text: "Em um arquivo de texto na raiz do workspace, consultado pelo utilitário de sistema de arquivos do notebook",
                            isCorrect: false,
                        },
                        {
                            text: "Em uma view pronta dentro de `system.information_schema`, consultada como qualquer view do catálogo",
                            isCorrect: false,
                        },
                        {
                            text: "Em um índice de busca interno da interface, consultado apenas pelo painel de atualizações do pipeline",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa saber quantos registros cada expectativa reprovou na última atualização de um pipeline. Qual evento do log responde isso?",
                    difficulty: "medio",
                    explanation:
                        "As métricas de expectativa ficam em eventos `flow_progress`, no objeto `data_quality`, que traz `expectations` com `passed_records` e `failed_records` por expectativa, e `dropped_records`. O distrator forte é `flow_definition`, que existe mesmo, mas serve para lineage: ele traz `output_dataset` e `input_datasets`.",
                    options: [
                        {
                            text: "`flow_progress`, lendo `details:flow_progress.data_quality.expectations` de cada evento",
                            isCorrect: true,
                        },
                        {
                            text: "`flow_definition`, lendo `details:flow_definition.input_datasets` de cada evento registrado",
                            isCorrect: false,
                        },
                        {
                            text: "`update_progress`, lendo `details:update_progress` em cada evento de atualização do pipeline",
                            isCorrect: false,
                        },
                        {
                            text: "`user_action`, lendo o campo que registra a ação e o nome do usuário em cada evento gerado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em um estágio longo você abre Summary Metrics e vê que a duração Max está cerca de duas vezes o percentil 75. O que esse padrão indica?",
                    difficulty: "medio",
                    explanation:
                        "Distorção é definida como poucos tasks demorando muito mais que o resto, e o teste documentado compara Max com o percentil 75: Max acima de 50% do percentil 75 já aponta distorção. Derramamento não se mede assim, ele aparece como estatística própria no cabeçalho do estágio.",
                    options: [
                        {
                            text: "Distorção, porque poucos tasks estão demorando muito mais que o resto do estágio",
                            isCorrect: true,
                        },
                        {
                            text: "Derramamento, porque a memória de execução acabou e o dado desceu para o disco",
                            isCorrect: false,
                        },
                        {
                            text: "Estágio limitado por entrada e saída, porque a leitura do armazenamento domina",
                            isCorrect: false,
                        },
                        {
                            text: "Falta de paralelismo, porque o estágio inteiro foi executado em um único executor",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "A página de um estágio na Spark UI mostra estatística de derramamento no cabeçalho. O que isso significa?",
                    difficulty: "dificil",
                    explanation:
                        "Derramamento é o Spark ficar sem memória de execução, que atende embaralhamento, junção, ordenação e agregação, e mover dado da memória para o disco. O distrator que mais engana troca memória de execução por memória de cache: cache que não cabe é descartado e recalculado, e isso não é contado como derramamento.",
                    options: [
                        {
                            text: "O Spark ficou sem memória de execução, usada em embaralhamento e junção, e desceu dado ao disco",
                            isCorrect: true,
                        },
                        {
                            text: "O Spark ficou sem memória de armazenamento de cache e recalculou as partições desde a fonte original",
                            isCorrect: false,
                        },
                        {
                            text: "O Spark ficou sem memória no driver e gravou o plano da consulta em disco antes de distribuir",
                            isCorrect: false,
                        },
                        {
                            text: "O Spark ficou sem disco local no executor e passou a manter em memória o que não cabia lá",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma junção entre uma tabela grande e uma dimensão de 8 MB está gastando a maior parte do tempo em embaralhamento. Considerando os padrões documentados, qual afirmação está correta?",
                    difficulty: "dificil",
                    explanation:
                        "O padrão de `spark.sql.autoBroadcastJoinThreshold` é 10485760 bytes, 10 MB, então uma dimensão de 8 MB já entra no broadcast automático e a dica é dispensável. O distrator perigoso é `-1`: esse valor não eleva o limite, ele desliga o broadcast automático de vez.",
                    options: [
                        {
                            text: "O padrão de `spark.sql.autoBroadcastJoinThreshold` é 10 MB, e a dimensão de 8 MB já cabe no broadcast",
                            isCorrect: true,
                        },
                        {
                            text: "O padrão de `spark.sql.autoBroadcastJoinThreshold` é 1 MB, e a dimensão de 8 MB só entra com `BROADCAST(dim)`",
                            isCorrect: false,
                        },
                        {
                            text: "O padrão de `spark.sql.shuffle.partitions` é 200, e baixar esse número é o que habilita o broadcast",
                            isCorrect: false,
                        },
                        {
                            text: "Definir `spark.sql.autoBroadcastJoinThreshold` como `-1` eleva o limite e força o envio a todos os nós",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Arquivos pequenos: OPTIMIZE e compactação",
            blocks: [
                {
                    type: "text",
                    value: "Uma tabela que recebe microlote a cada poucos minutos acumula arquivo novo a cada escrita, e nenhuma escrita sozinha é grande. No fim de alguns meses a consulta que filtra um dia precisa abrir uma montanha de arquivo minúsculo. No fim desta aula você vai saber qual comando conserta arquivo pequeno que já existe, qual configuração evita que ele nasça, e qual é o tamanho de arquivo que a Databricks mira em cada faixa de tabela.",
                },
                {
                    type: "text",
                    value: "`OPTIMIZE` reescreve os arquivos de dados para melhorar o layout de uma tabela Delta Lake ou Apache Iceberg. O ponto que define o comando: **ele não altera dado nenhum**, o resultado da consulta é o mesmo antes e depois.\n\nO que ele faz depende do layout da tabela. Em tabela com liquid clustering, ele agrupa o dado pelas chaves de clustering. Em tabela particionada, ele compacta os arquivos e organiza o dado dentro de cada partição. A compactação por bin-packing busca arquivos equilibrados pelo **tamanho de armazenamento**, não necessariamente pelo número de linhas, ainda que as duas coisas costumem andar juntas.\n\nE o bin-packing é **idempotente**: rodar de novo sobre o mesmo dado não tem efeito. Leitores usam isolamento de snapshot, então leitura em andamento não é interrompida quando o `OPTIMIZE` remove arquivo do log de transações, e rodar sobre uma fonte de streaming não afeta stream atual nem futuro.",
                },
                {
                    type: "code",
                    value: "-- sintaxe\nOPTIMIZE table_name [FULL] [WHERE predicate] [ZORDER BY (col_name1 [, ...])]\n\n-- compactação da tabela inteira\nOPTIMIZE events;\n\n-- só o recorte recente de uma tabela particionada\nOPTIMIZE events WHERE date >= '2017-01-01';\n\n-- reescreve todos os arquivos (Databricks Runtime 16.0 ou superior)\nOPTIMIZE events FULL;\n\n-- ordenamento multidimensional, só em tabela sem liquid clustering\nOPTIMIZE events\nWHERE date >= current_timestamp() - INTERVAL 1 day\nZORDER BY (eventType);",
                },
                {
                    type: "text",
                    value: "Duas restrições que a prova explora. No `WHERE`, **só filtro em atributo de partição ou de chave de clustering é aceito**, não vale filtrar por qualquer coluna. E `ZORDER BY` **não pode ser usado em tabela com liquid clustering**: a documentação recomenda liquid clustering em lugar de `ZORDER`, e as duas coisas não convivem na mesma tabela.\n\nEm Python e Scala o mesmo comando vira método na API do Delta.",
                },
                {
                    type: "code",
                    value: 'from delta.tables import DeltaTable\n\ndt = DeltaTable.forName(spark, "catalogo.schema.events")\ndt.optimize().executeCompaction()\n\n# com filtro de partição\ndt.optimize().where("date=\'2021-11-18\'").executeCompaction()',
                },
                {
                    type: "text",
                    value: "Qual o tamanho de arquivo que o comando persegue? Se a tabela não define um alvo explícito, vale o autotune, que olha o tamanho da tabela. O autotune **só se aplica a tabela sem alvo definido**.",
                },
                {
                    type: "table",
                    value: '[["Tamanho da tabela","Tamanho de arquivo alvo do autotune"],["Abaixo de 2,56 TB","256 MB"],["De 2,56 TB a 10 TB","Cresce linearmente de 256 MB até 1 GB"],["Acima de 10 TB","1 GB"]]',
                },
                {
                    type: "text",
                    value: "Para fixar um alvo, use a propriedade `delta.targetFileSize`, que aceita bytes ou unidade, como `104857600` ou `100mb`. Por padrão ela não vem definida. Em tabela gerenciada do Unity Catalog, com SQL warehouse ou Databricks Runtime 11.3 LTS e superior, **só o `OPTIMIZE` respeita** esse alvo. E atenção: quando o alvo cresce, o `OPTIMIZE` não volta para reescrever os arquivos menores que já existiam.\n\nConsertar depois é uma estratégia. Evitar que o arquivo pequeno nasça é outra, e são duas configurações distintas:\n\n- **Escrita otimizada**, propriedade de tabela `delta.autoOptimize.optimizeWrite` ou sessão `spark.databricks.delta.optimizeWrite.enabled`. Com `true`, usa 128 MB como tamanho alvo. Já vem ligada por padrão para `MERGE` e para `UPDATE` e `DELETE` com subconsulta.\n- **Compactação automática**, propriedade de tabela `delta.autoOptimize.autoCompact` ou sessão `spark.databricks.delta.autoCompact.enabled`. O valor recomendado é `auto`, que ajusta o alvo respeitando o autotune. `legacy`, apelido de `true`, fixa 128 MB sem dimensionamento dinâmico. `false` desliga. `spark.databricks.delta.autoCompact.minNumFiles` define o mínimo de arquivos pequenos para disparar a compactação, e `spark.databricks.delta.autoCompact.maxFileSize` define o tamanho de saída.",
                },
                {
                    type: "code",
                    value: "ALTER TABLE catalogo.schema.vendas SET TBLPROPERTIES (\n  'delta.targetFileSize' = '100mb',\n  'delta.autoOptimize.optimizeWrite' = 'true',\n  'delta.autoOptimize.autoCompact' = 'auto'\n);",
                },
                {
                    type: "text",
                    value: "Falta o lado do código. O número de arquivos que uma escrita produz segue o número de partições em memória do DataFrame, e duas operações mexem nisso de formas que a prova confunde de propósito.",
                },
                {
                    type: "table",
                    value: '[["Operação","Embaralha o dado?","Aumenta o número de partições?","Quando usar"],["`repartition(n)`","Sim, acrescenta um passo de embaralhamento","Sim","Quando reduzir demais concentraria o cálculo em poucos nós"],["`coalesce(n)`","Não, gera dependência estreita","Não, se você pedir mais ele mantém o número atual","Quando o objetivo é só juntar partições, de 1000 para 100"]]',
                },
                {
                    type: "text",
                    value: "A documentação é explícita nos dois pontos: ir de 1000 para 100 partições com `coalesce` não gera embaralhamento, e pedir um número maior de partições ao `coalesce` simplesmente mantém o número atual. Em contrapartida, um `coalesce` drástico, para uma partição só, pode fazer o cálculo rodar em menos nós do que você gostaria; nesse caso o recomendado é `repartition()`, que acrescenta o embaralhamento mas deixa as partições de origem trabalharem em paralelo.\n\nQuando rodar o `OPTIMIZE`? A recomendação é começar com uma execução diária, de preferência de madrugada, quando o preço de instância spot está baixo, e ajustar dali. Rodar mais vezes melhora a consulta e custa mais. Para o compute, tipo de instância otimizado para computação, e SSD anexado ajuda. E em tabela gerenciada do Unity Catalog existe o caminho de não agendar nada: a otimização preditiva roda `OPTIMIZE` sozinha, e a Databricks a recomenda para todas essas tabelas.",
                },
                {
                    type: "quote",
                    value: "OPTIMIZE conserta o arquivo pequeno que já existe. Escrita otimizada e compactação automática evitam que ele nasça. São respostas diferentes para o mesmo problema, e a prova pergunta qual é qual.",
                },
            ],
            questions: [
                {
                    statement: "O que o comando `OPTIMIZE` faz em uma tabela Delta?",
                    difficulty: "facil",
                    explanation:
                        "A documentação define `OPTIMIZE` como reescrita dos arquivos de dados para melhorar o layout, sem alterar dado: o resultado da consulta é igual antes e depois. Quem apaga arquivo antigo e libera armazenamento é o `VACUUM`, que é o distrator mais comum aqui.",
                    options: [
                        {
                            text: "Reescreve os arquivos de dados para melhorar o layout, sem alterar o resultado das consultas",
                            isCorrect: true,
                        },
                        {
                            text: "Reescreve os arquivos de dados e remove as versões antigas, liberando armazenamento na tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Reorganiza apenas o log de transações, sem tocar nos arquivos de dados já gravados ali",
                            isCorrect: false,
                        },
                        {
                            text: "Recalcula as estatísticas de coluna da tabela, sem reescrever nenhum arquivo de dados dela",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela Delta tem 6 TB e não define `delta.targetFileSize`. Qual é o tamanho de arquivo alvo do autotune?",
                    difficulty: "medio",
                    explanation:
                        "O autotune usa 256 MB abaixo de 2,56 TB, cresce linearmente de 256 MB até 1 GB entre 2,56 TB e 10 TB, e fica em 1 GB acima de 10 TB. Com 6 TB a tabela cai na faixa intermediária. O 128 MB é de outra coisa: é o alvo da escrita otimizada e da compactação automática em modo `legacy`.",
                    options: [
                        {
                            text: "Um valor entre 256 MB e 1 GB, porque de 2,56 TB a 10 TB o alvo cresce linearmente",
                            isCorrect: true,
                        },
                        {
                            text: "Exatamente 256 MB, porque esse é o alvo fixo do autotune para qualquer tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente 1 GB, porque esse é o alvo do autotune a partir de 1 TB de tamanho",
                            isCorrect: false,
                        },
                        {
                            text: "Exatamente 128 MB, porque esse é o alvo do autotune quando a tabela passa de 1 TB",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você roda `OPTIMIZE` em uma tabela e, sem nenhuma escrita no meio, roda o mesmo comando de novo. O que acontece na segunda execução?",
                    difficulty: "medio",
                    explanation:
                        "A compactação por bin-packing é idempotente: sobre o mesmo dado, a segunda execução não tem efeito. O distrator sobre leitura interrompida inverte a garantia documentada: leitores usam isolamento de snapshot, então a remoção de arquivos do log não derruba consulta em andamento.",
                    options: [
                        {
                            text: "Nada muda, porque a compactação por bin-packing é idempotente sobre o mesmo dado",
                            isCorrect: true,
                        },
                        {
                            text: "Os arquivos são divididos de novo, porque cada execução refaz o layout do zero",
                            isCorrect: false,
                        },
                        {
                            text: "As versões antigas são apagadas, porque a segunda execução também limpa arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "A leitura em andamento é interrompida, porque remover arquivo invalida o snapshot",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma tabela que já usa liquid clustering, qual comando a documentação aceita?",
                    difficulty: "dificil",
                    explanation:
                        "Em tabela com liquid clustering o `OPTIMIZE` simples agrupa o dado pelas chaves de forma incremental. `ZORDER BY` é proibido nessas tabelas, e o `WHERE` do `OPTIMIZE` só aceita filtro em atributo de partição ou de chave de clustering, não em coluna qualquer.",
                    options: [
                        {
                            text: "`OPTIMIZE vendas`, que agrupa o dado pelas chaves de clustering de forma incremental",
                            isCorrect: true,
                        },
                        {
                            text: "`OPTIMIZE vendas ZORDER BY (cliente)`, que soma o ordenamento ao clustering da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "`OPTIMIZE vendas WHERE cliente = 17`, que aceita filtro em qualquer coluna da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "`OPTIMIZE vendas PARTITIONED BY (data)`, que troca o clustering por particionamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job termina com 1000 partições e você quer gravar cerca de 100 arquivos sem pagar um embaralhamento. Qual operação usar?",
                    difficulty: "medio",
                    explanation:
                        "Reduzir partições com `coalesce` gera dependência estreita, e a documentação diz que ir de 1000 para 100 não provoca embaralhamento. `repartition` resolve o número de partições, mas sempre acrescenta um passo de embaralhamento, que é justamente o custo que se queria evitar.",
                    options: [
                        {
                            text: "`coalesce(100)`, que gera dependência estreita e não embaralha ao reduzir partições",
                            isCorrect: true,
                        },
                        {
                            text: "`repartition(100)`, que gera dependência estreita e não embaralha ao reduzir as partições",
                            isCorrect: false,
                        },
                        {
                            text: "`coalesce(2000)`, que eleva as partições antes de reduzir o número de arquivos",
                            isCorrect: false,
                        },
                        {
                            text: "`repartition(1)`, que concentra a escrita e evita o embaralhamento entre os nós",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Liquid clustering, salto de dados e particionamento",
            blocks: [
                {
                    type: "text",
                    value: "Duas tabelas com o mesmo dado e o mesmo volume podem ter consultas com tempos muito diferentes, porque uma lê mil arquivos e a outra lê dez. No fim desta aula você vai saber o mecanismo que permite ler dez, qual estratégia de layout a Databricks recomenda hoje e por quê, e em que ponto o particionamento clássico ainda entra na conversa.",
                },
                {
                    type: "text",
                    value: "**Salto de dados** é o mecanismo. Quando você escreve em uma tabela Delta Lake ou em uma tabela Iceberg gerenciada, a Databricks coleta estatística por arquivo automaticamente: valor mínimo e máximo, contagem de nulos e total de registros. Na hora da consulta, o filtro é comparado com essa estatística e o arquivo cujo intervalo não pode conter o valor procurado nem é aberto. Esse descarte é a poda de arquivo.\n\nO limite de colunas é o detalhe que a prova cobra. Em **tabela externa** do Unity Catalog, a estatística é coletada para as **32 primeiras colunas** na ordem do schema, e por isso a ordem das colunas importa. Em **tabela gerenciada**, a otimização preditiva escolhe as colunas mais usadas em filtro de consulta, e aí não existe o limite de 32.\n\nPara mudar isso há duas propriedades. `dataSkippingNumIndexedCols` aumenta ou reduz o número de colunas com estatística, e quais entram depende da ordem delas. `dataSkippingStatsColumns`, do Databricks Runtime 13.3 LTS para cima, recebe uma lista de nomes de coluna e **se sobrepõe** à primeira. Duas ressalvas: alterar essas propriedades não recalcula a estatística do dado que já existe, e coluna fora da lista atual tem a estatística ignorada. Do Databricks Runtime 14.3 LTS para cima dá para recalcular à mão.",
                },
                {
                    type: "code",
                    value: "-- escolher explicitamente as colunas com estatística\nALTER TABLE catalogo.schema.vendas\n  SET TBLPROPERTIES ('delta.dataSkippingStatsColumns' = 'data, cliente_id, uf');\n\n-- recalcular a estatística do dado que já estava gravado\nANALYZE TABLE catalogo.schema.vendas COMPUTE DELTA STATISTICS;",
                },
                {
                    type: "quote",
                    value: "Sem valor mínimo e máximo coletado para a coluna, o filtro naquela coluna não poda arquivo nenhum. É por isso que a documentação manda não usar ZORDER BY em coluna sem estatística: além de não ajudar, gasta compute.",
                },
                {
                    type: "text",
                    value: '**Liquid clustering** é a estratégia de layout que a Databricks indica hoje. A documentação é direta: ele **substitui o particionamento de tabela e o `ZORDER`**, e você pode redefinir as chaves de agrupamento sem reescrever o dado que já existe. A frase que vale guardar é "Databricks recommends liquid clustering for all new tables, including streaming tables and materialized views". Clustering não é compatível com particionamento nem com `ZORDER` na mesma tabela.\n\nSobre versões e limites: está disponível de forma geral para tabela Delta Lake no Databricks Runtime 15.4 LTS e superior, e em preview público para Apache Iceberg no 16.4 LTS e superior. Disparar o agrupamento exige 13.3 LTS ou superior. Tabela Delta com clustering usa versão de escritor 7 e de leitor 3, e versão de protocolo não volta atrás.\n\nSão até **quatro chaves de clustering**, e elas precisam ter estatística coletada, o que amarra esta parte da aula na anterior. Em tabela abaixo de 10 TB, mais chaves podem piorar o filtro por uma coluna só. Os tipos aceitos incluem data, timestamp, string, tipos inteiros, float, double e decimal; dá para agrupar por campo de struct com notação de ponto, mas não por tipo complexo nem por elemento de map ou array.',
                },
                {
                    type: "code",
                    value: "-- na criação\nCREATE TABLE table1 (col0 INT, col1 STRING) CLUSTER BY (col0);\n\n-- em tabela existente e não particionada\nALTER TABLE table1 CLUSTER BY (col1, col0);\n\n-- remover as chaves, sem reescrever o dado\nALTER TABLE table1 CLUSTER BY NONE;\n\n-- chaves escolhidas automaticamente, em tabela gerenciada do Unity Catalog\nCREATE TABLE table2 CLUSTER BY AUTO AS SELECT * FROM origem;\n\n-- agrupamento de rotina, incremental\nOPTIMIZE table1;\n\n-- reagrupamento total (Databricks Runtime 16.4 LTS ou superior)\nOPTIMIZE table1 FULL;",
                },
                {
                    type: "table",
                    value: '[["Critério","Liquid clustering","Particionamento clássico"],["Como se declara","`CLUSTER BY (col)`, ou `CLUSTER BY AUTO` em tabela gerenciada","`PARTITIONED BY (col)` na criação da tabela"],["Trocar a chave depois","`ALTER TABLE ... CLUSTER BY`, sem reescrever o dado existente","Exige reescrever a tabela, caro em tabela grande"],["Limite de colunas","Até quatro chaves, que precisam ter estatística coletada","Só coluna de primeiro nível, sem tipo complexo"],["Arquivo pequeno","Evita a fronteira fixa de partição e o problema de arquivo pequeno","Partição pequena demais gera muitos arquivos pequenos"],["Recomendação","Recomendado para toda tabela nova e para toda tabela gerenciada","Abaixo de 1 TB, a recomendação é não particionar"]]',
                },
                {
                    type: "text",
                    value: "O particionamento não foi proibido, ele só perdeu a faixa de uso. A documentação orienta pelo tamanho da tabela, e também dá o piso de tamanho de partição: cada partição deveria ter ao menos 1 GB, porque tabela com partições menos numerosas e maiores tende a ter desempenho melhor que tabela com muitas partições pequenas. Tabela Delta sem partição, por sua vez, já recebe agrupamento por tempo de ingestão automaticamente.",
                },
                {
                    type: "table",
                    value: '[["Tamanho da tabela","O que a documentação recomenda"],["Abaixo de 1 TB","Não particione"],["De 1 TB a 100 TB","Use liquid clustering em vez de particionamento, que mais atrapalha do que ajuda"],["100 TB ou mais","Particionar pode melhorar, mas teste liquid clustering antes e confirme o ganho"]]',
                },
                {
                    type: "text",
                    value: "Converter uma tabela que já está particionada também tem caminho próprio. Do Databricks Runtime 18.1 para cima existe `ALTER TABLE <nome> REPLACE PARTITIONED BY WITH CLUSTER BY [(<colunas>) | AUTO]`. Em tabela Iceberg gerenciada, o Unity Catalog só suporta liquid clustering e trata as colunas de `PARTITION BY` como chaves de agrupamento.\n\nA ordem de decisão fica assim: tabela nova nasce com liquid clustering; as chaves escolhidas precisam ter estatística; o `OPTIMIZE` mantém o agrupamento; e particionamento só entra em tabela muito grande, depois de o teste com clustering não dar conta.",
                },
            ],
            questions: [
                {
                    statement:
                        "Quantas chaves de agrupamento o liquid clustering aceita em uma tabela, e que condição elas têm?",
                    difficulty: "facil",
                    explanation:
                        "A documentação permite até quatro chaves de clustering e exige que elas tenham estatística coletada, porque é a estatística que sustenta o salto de dados. O 32 confunde porque é outro número: é a quantidade padrão de colunas com estatística em tabela externa.",
                    options: [
                        {
                            text: "Até quatro chaves, e elas precisam ter estatística coletada para funcionar",
                            isCorrect: true,
                        },
                        {
                            text: "Até duas chaves, e elas precisam ser coluna de data, de timestamp ou de inteiro",
                            isCorrect: false,
                        },
                        {
                            text: "Até trinta e duas chaves, o mesmo limite de colunas com estatística",
                            isCorrect: false,
                        },
                        {
                            text: "Sem limite de chaves, desde que todas sejam colunas de primeiro nível",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Em uma tabela externa do Unity Catalog, para quantas colunas o Delta coleta estatística de salto de dados por padrão?",
                    difficulty: "medio",
                    explanation:
                        "Em tabela externa a coleta cobre as 32 primeiras colunas na ordem do schema, e é por isso que a ordem das colunas importa. A opção de todas as colunas confunde tabela externa com tabela gerenciada: nesta a otimização preditiva escolhe as colunas mais filtradas e o limite de 32 não vale.",
                    options: [
                        {
                            text: "As 32 primeiras colunas na ordem do schema, e a ordem é que define quais entram",
                            isCorrect: true,
                        },
                        {
                            text: "As 4 primeiras colunas na ordem do schema, as mesmas usadas como chave",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as colunas da tabela, porque a coleta não tem limite nenhum em tabela externa",
                            isCorrect: false,
                        },
                        {
                            text: "Só as colunas de partição, porque a poda usa o caminho do arquivo no storage",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você precisa trocar a chave de agrupamento de uma tabela grande que já está em produção. O que acontece com o dado já gravado?",
                    difficulty: "medio",
                    explanation:
                        "A vantagem anunciada do liquid clustering é justamente esta: `ALTER TABLE ... CLUSTER BY` redefine as chaves e não reescreve o dado existente, e `CLUSTER BY NONE` remove as chaves também sem reescrita. Trocar coluna de partição, ao contrário, exige reescrever a tabela.",
                    options: [
                        {
                            text: "`ALTER TABLE ... CLUSTER BY` redefine as chaves e não reescreve o dado já gravado",
                            isCorrect: true,
                        },
                        {
                            text: "`ALTER TABLE ... CLUSTER BY` redefine as chaves e reescreve a tabela inteira na hora",
                            isCorrect: false,
                        },
                        {
                            text: "`ALTER TABLE ... PARTITIONED BY` é o comando, e ele reescreve a tabela inteira ali",
                            isCorrect: false,
                        },
                        {
                            text: "`CREATE OR REPLACE TABLE` é o único caminho, porque a chave é fixada na criação",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Uma tabela nova vai ter cerca de 600 GB e quase todo filtro é por data. O que a documentação recomenda para o layout?",
                    difficulty: "dificil",
                    explanation:
                        "Abaixo de 1 TB a orientação é não particionar, e liquid clustering é recomendado para toda tabela nova. O distrator do particionamento por dia parece certo porque o filtro é por data, mas em tabela desse tamanho a partição ficaria pequena, abaixo do 1 GB recomendado, e geraria arquivo pequeno.",
                    options: [
                        {
                            text: "Não particionar e usar liquid clustering, porque abaixo de 1 TB não se particiona",
                            isCorrect: true,
                        },
                        {
                            text: "Particionar por dia, porque o filtro por data vira poda de partição direta ali no plano",
                            isCorrect: false,
                        },
                        {
                            text: "Particionar por mês e aplicar `ZORDER BY` na data, somando poda e ordenamento",
                            isCorrect: false,
                        },
                        {
                            text: "Não particionar e confiar só no autotune de tamanho de arquivo, que resolve",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você altera `delta.dataSkippingStatsColumns` em uma tabela com dois anos de histórico. O que é preciso fazer para o dado antigo se beneficiar?",
                    difficulty: "dificil",
                    explanation:
                        "Atualizar a propriedade não recalcula a estatística do dado existente, só vale para escrita futura. Do Databricks Runtime 14.3 LTS para cima o recálculo é manual, com `ANALYZE TABLE ... COMPUTE DELTA STATISTICS`. Achar que a mudança já recalcula tudo é o erro mais comum aqui.",
                    options: [
                        {
                            text: "Rodar `ANALYZE TABLE ... COMPUTE DELTA STATISTICS`, porque a mudança não recalcula o antigo",
                            isCorrect: true,
                        },
                        {
                            text: "Rodar `OPTIMIZE` na tabela inteira, porque a compactação recalcula a estatística de cada arquivo",
                            isCorrect: false,
                        },
                        {
                            text: "Nada, porque alterar a propriedade já recalcula a estatística de todos os arquivos existentes",
                            isCorrect: false,
                        },
                        {
                            text: "Rodar `VACUUM` com retenção zero, porque só arquivo recém escrito recebe a nova estatística",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "VACUUM, retenção e otimização preditiva",
            blocks: [
                {
                    type: "text",
                    value: "O armazenamento de uma tabela cresce mais rápido que o dado dela, porque cada reescrita deixa para trás o arquivo da versão anterior. O comando que resolve isso cobra um preço, e o preço é a viagem no tempo. No fim desta aula você vai saber exatamente o que o `VACUUM` apaga, até onde a tabela continua consultável no passado, e o que a otimização preditiva faz sem ninguém pedir.",
                },
                {
                    type: "text",
                    value: "`VACUUM` remove arquivo de dados que a tabela **não referencia mais** e que é mais antigo que o limite de retenção. Dois recortes importantes do que ele faz e do que não faz:\n\n- ele também remove arquivo em diretório não gerenciado pela Databricks, ignorando nome que começa com sublinhado ou com ponto;\n- ele pode deixar diretório vazio para trás, e a próxima execução do `VACUUM` apaga esses diretórios;\n- ele **não governa o arquivo de log do Delta**. Arquivo de log é apagado automaticamente e de forma assíncrona depois das operações de checkpoint, e o período padrão de retenção de log é de 30 dias.\n\nO limite de retenção padrão para arquivo de dados depois do `VACUUM` é de **7 dias**, controlado pela propriedade `delta.deletedFileRetentionDuration`.",
                },
                {
                    type: "code",
                    value: "-- FULL é o modo padrão\nVACUUM catalogo.schema.vendas;\n\n-- lista até 1000 arquivos candidatos, sem apagar nada\nVACUUM catalogo.schema.vendas DRY RUN;\n\n-- usa o log de transações em vez de listar o diretório inteiro\nVACUUM catalogo.schema.vendas LITE;\n\n-- aumentar a retenção de arquivo de dados\nALTER TABLE catalogo.schema.vendas\n  SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = '30 days');",
                },
                {
                    type: "text",
                    value: "`FULL` é o padrão e lista todos os arquivos no diretório da tabela. `LITE` usa o log de transações para achar o arquivo de dados expirado, o que evita a listagem completa do diretório e sai mais barato. A diferença de resultado é o que a prova pergunta: `LITE` **não apaga arquivo que não está referenciado no log**, como arquivo deixado por transação abortada. Ele também exige que ao menos um `VACUUM` tenha rodado com sucesso dentro do limite de retenção do log de transações, 30 dias por padrão; sem isso ele falha com `DELTA_CANNOT_VACUUM_LITE` e você precisa rodar `FULL`.\n\nExiste ainda uma verificação de segurança que bloqueia um `VACUUM` perigoso, com retenção curta. A Databricks recomenda com força intervalo de ao menos 7 dias, porque job de longa duração pode estar escrevendo arquivo ainda não confirmado, e o comando apagaria esse arquivo. Desligar a verificação é possível, e só se você tiver certeza de que nenhuma operação na tabela dura mais que a retenção escolhida.",
                },
                {
                    type: "code",
                    value: "SET spark.databricks.delta.retentionDurationCheck.enabled = false;",
                },
                {
                    type: "table",
                    value: '[["Propriedade","O que controla","Padrão"],["`delta.deletedFileRetentionDuration`","Idade mínima do arquivo de dados para o `VACUUM` poder apagar","7 dias"],["`delta.logRetentionDuration`","Por quanto tempo o histórico da tabela fica disponível, o que o `DESCRIBE HISTORY` mostra","30 dias"]]',
                },
                {
                    type: "text",
                    value: "Agora a relação com a viagem no tempo, que é a pergunta clássica dessa seção. Consultar uma versão antiga exige **duas coisas**: o log daquela versão e os arquivos de dados dela. O `VACUUM` apaga arquivo de dados, e o arquivo de log é removido sozinho depois do checkpoint. Logo, a capacidade de consultar versão mais antiga que o período de retenção **se perde** depois de rodar o `VACUUM`.\n\nA orientação da documentação é usar apenas os últimos 7 dias para operação de viagem no tempo, a menos que você aumente as duas configurações, lembrando que retenção maior aumenta o custo de armazenamento. No Databricks Runtime 18.0 e superior, `logRetentionDuration` tem de ser maior ou igual a `deletedFileRetentionDuration`, e a viagem no tempo para versão mais antiga que `deletedFileRetentionDuration` fica bloqueada.\n\n`RESTORE TABLE` carrega a mesma limitação: não dá para restaurar para uma versão cujos arquivos de dados o `VACUUM` ou uma remoção manual já tirou do caminho.",
                },
                {
                    type: "code",
                    value: "DESCRIBE HISTORY catalogo.schema.vendas;\n\nSELECT * FROM catalogo.schema.vendas VERSION AS OF 123;\nSELECT * FROM catalogo.schema.vendas TIMESTAMP AS OF '2026-10-01T10:00:00.000Z';\n\nRESTORE TABLE catalogo.schema.vendas TO VERSION AS OF 123;",
                },
                {
                    type: "quote",
                    value: "VACUUM não apaga dado da tabela: apaga arquivo que a tabela não referencia mais e que já passou da retenção. O que ele cobra em troca do armazenamento liberado é a viagem no tempo até aquelas versões.",
                },
                {
                    type: "text",
                    value: '**Otimização preditiva** é o caminho de não agendar nada. Ela executa `OPTIMIZE`, `VACUUM` e `ANALYZE` em tabela gerenciada do Unity Catalog, Delta Lake e Iceberg, e o `OPTIMIZE` dela dispara o agrupamento incremental nas tabelas com clustering ligado. Com liquid clustering automático, ela pode até escolher chaves novas antes de agrupar o dado. O que ela **não** faz: rodar `ZORDER`.\n\nOs recortes que a prova cobra:\n\n- vale **só para tabela gerenciada** do Unity Catalog, não para tabela externa nem para tabela recebida por compartilhamento aberto;\n- quando ela roda `VACUUM FULL`, mantém os arquivos por ao menos 7 dias, respeitando `delta.deletedFileRetentionDuration`;\n- vem **ligada por padrão** em conta criada a partir de 11 de novembro de 2024, e as contas antigas foram habilitadas aos poucos;\n- exige plano Premium ou superior, região suportada, e SQL warehouse ou Databricks Runtime 12.2 LTS e superior;\n- as operações rodam em compute sem servidor e são faturadas em SKU de job sem servidor;\n- a frase da documentação é "Databricks recommends predictive optimization for all Unity Catalog managed tables".',
                },
                {
                    type: "code",
                    value: "ALTER CATALOG meu_catalogo ENABLE PREDICTIVE OPTIMIZATION;\nALTER SCHEMA meu_catalogo.vendas INHERIT PREDICTIVE OPTIMIZATION;\nALTER TABLE meu_catalogo.vendas.pedidos DISABLE PREDICTIVE OPTIMIZATION;\n\n-- conferir o estado no campo Predictive Optimization\nDESCRIBE TABLE EXTENDED meu_catalogo.vendas.pedidos;\n\n-- o que ela já executou\nSELECT * FROM system.storage.predictive_optimization_operations_history;",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o limite de retenção padrão que o `VACUUM` respeita ao apagar arquivo de dados, e qual propriedade o controla?",
                    difficulty: "facil",
                    explanation:
                        "O padrão documentado é 7 dias, controlado por `delta.deletedFileRetentionDuration`. O 30 dias existe, mas é de outra propriedade, `delta.logRetentionDuration`, que governa por quanto tempo o histórico da tabela fica disponível, e não o arquivo de dados.",
                    options: [
                        {
                            text: "7 dias, controlados pela propriedade `delta.deletedFileRetentionDuration`",
                            isCorrect: true,
                        },
                        {
                            text: "30 dias, controlados pela propriedade `delta.deletedFileRetentionDuration`",
                            isCorrect: false,
                        },
                        {
                            text: "7 dias, controlados pela propriedade `delta.logRetentionDuration` da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "24 horas, controladas pela propriedade `delta.logRetentionDuration` ali",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual afirmação sobre o que o `VACUUM` apaga está correta?",
                    difficulty: "medio",
                    explanation:
                        "O comando remove arquivo de dados que a tabela não referencia mais e que passou da retenção. O distrator do arquivo de log inverte o que a documentação diz: arquivo de log não é governado pelo `VACUUM`, ele é apagado sozinho e de forma assíncrona depois do checkpoint.",
                    options: [
                        {
                            text: "Ele apaga arquivo de dados que a tabela não referencia mais e já passou da retenção",
                            isCorrect: true,
                        },
                        {
                            text: "Ele apaga arquivo de log do Delta que já passou do limite de retenção do seu histórico",
                            isCorrect: false,
                        },
                        {
                            text: "Ele apaga a versão mais antiga do log e mantém o arquivo de dados no armazenamento",
                            isCorrect: false,
                        },
                        {
                            text: "Ele apaga arquivo de dados da versão atual que não foi lido no período de retenção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Depois de rodar `VACUUM` com a retenção padrão em uma tabela, o que acontece com a viagem no tempo dela?",
                    difficulty: "medio",
                    explanation:
                        "Viagem no tempo depende do log da versão e dos arquivos de dados dela. O `VACUUM` remove os arquivos, então versão mais antiga que a retenção deixa de ser consultável. A ideia de reconstruir a versão a partir do log sozinho é o erro clássico: o log aponta para arquivo que não existe mais.",
                    options: [
                        {
                            text: "Versão mais antiga que a retenção deixa de ser consultável, porque os arquivos saíram",
                            isCorrect: true,
                        },
                        {
                            text: "Nada muda, porque a viagem no tempo é reconstruída a partir do log de transações da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Toda a viagem no tempo é perdida, porque o comando zera o histórico da tabela",
                            isCorrect: false,
                        },
                        {
                            text: "Só o `RESTORE TABLE` para de funcionar, e `VERSION AS OF` continua respondendo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual é a diferença entre `VACUUM nome LITE` e `VACUUM nome FULL`?",
                    difficulty: "dificil",
                    explanation:
                        "O modo `LITE` usa o log de transações para achar arquivo expirado, evitando listar o diretório inteiro, e por isso não apaga arquivo que não está no log, como o de transação abortada. `FULL`, que é o padrão, lista o diretório todo. Quem só lista sem apagar é o `DRY RUN`.",
                    options: [
                        {
                            text: "`LITE` usa o log de transações para achar arquivo expirado e não apaga arquivo fora do log",
                            isCorrect: true,
                        },
                        {
                            text: "`LITE` lista o diretório inteiro da tabela e apaga também arquivo fora do log de transações",
                            isCorrect: false,
                        },
                        {
                            text: "`LITE` apaga metade do que o `FULL` apaga e guarda o resto para a janela de retenção seguinte",
                            isCorrect: false,
                        },
                        {
                            text: "`LITE` roda em modo de simulação e apenas lista os arquivos candidatos, sem apagar nenhum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a otimização preditiva executa por conta própria, e em quais tabelas?",
                    difficulty: "dificil",
                    explanation:
                        "Ela roda `OPTIMIZE`, `VACUUM` e `ANALYZE` em tabela gerenciada do Unity Catalog, e o `OPTIMIZE` dispara agrupamento incremental, mas ela não roda `ZORDER`. O outro erro frequente é estender o recurso a tabela externa: ela não atua nessas tabelas.",
                    options: [
                        {
                            text: "`OPTIMIZE`, `VACUUM` e `ANALYZE` em tabela gerenciada do Unity Catalog, sem rodar `ZORDER`",
                            isCorrect: true,
                        },
                        {
                            text: "`OPTIMIZE`, `VACUUM` e `ZORDER` em tabela gerenciada do Unity Catalog, sem rodar `ANALYZE`",
                            isCorrect: false,
                        },
                        {
                            text: "`OPTIMIZE` e `VACUUM` em qualquer tabela Delta do workspace, inclusive nas tabelas externas",
                            isCorrect: false,
                        },
                        {
                            text: "`OPTIMIZE` e `ANALYZE` em tabela externa do Unity Catalog, sem nunca chegar a rodar `VACUUM`",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Custo: serverless, autoescala e instância spot",
            blocks: [
                {
                    type: "text",
                    value: "Dois workspaces podem rodar a mesma carga com faturas bem diferentes, e a diferença raramente está no código. No fim desta aula você vai saber escolher entre compute sem servidor e compute clássico, dimensionar autoescala com critério, e dizer em que carga instância spot vale a pena e em que nó ela nunca deve entrar.",
                },
                {
                    type: "text",
                    value: "**Compute sem servidor** é a opção em que a Databricks aloca e gerencia os recursos de compute necessários, em vez de você provisionar máquina na sua conta de nuvem. Ele cobre notebook, job e pipeline do Lakeflow; SQL warehouse sem servidor, treino de modelo, monitoramento de qualidade de dado e otimização preditiva também rodam em infraestrutura sem servidor, só que com configuração própria.\n\nA promessa declarada é acelerar o tempo de início e de escala, reduzir o tempo ocioso e diminuir a necessidade de administrar compute. Ele é sem versão: a carga roda sempre no runtime mais recente, com atualização distribuída aos poucos. Vem ligado por padrão na maioria dos workspaces, e workspace sem Unity Catalog não tem acesso, precisa migrar antes.\n\nNa fatura ele aparece como DBU na tabela de sistema de uso faturável, com atraso de até 24 horas. Para estimar, a documentação recomenda medir uma carga representativa e analisar `system.billing.usage`.",
                },
                {
                    type: "table",
                    value: '[["Tipo de SQL warehouse","Onde fica o compute","Tempo de inicialização","Recursos"],["Sem servidor","Na conta da Databricks","Tipicamente entre 2 e 6 segundos","Photon, Predictive IO e Intelligent Workload Management"],["Pro","Na sua conta de nuvem","Tipicamente cerca de 4 minutos","Photon e Predictive IO, sem Intelligent Workload Management"],["Classic","Na sua conta de nuvem","Tipicamente cerca de 4 minutos","Apenas Photon"]]',
                },
                {
                    type: "text",
                    value: "Essa diferença de inicialização é o que muda a conta no dia a dia: warehouse sem servidor sobe e escala em segundos, então disponibilidade imediata e encerramento por inatividade deixam de ser escolhas excludentes. Em pro e classic, com alguns minutos de partida, encerrar agressivamente custa espera ao usuário.\n\nEm compute clássico, a autoescala se configura marcando **Enable autoscaling** e informando **Min** e **Max** de workers ao lado do tipo de worker. Sem autoescala, você informa um número fixo em **Workers**. Há dois comportamentos, por plano.",
                },
                {
                    type: "table",
                    value: '[["Comportamento","Autoescala otimizada (plano Premium ou superior)","Autoescala padrão (plano Standard)"],["Subida","Vai do mínimo ao máximo em no máximo 2 eventos de escala","Acrescenta 8 nós e depois cresce exponencialmente até o máximo"],["Descida","Reduz mesmo com o compute ocupado, olhando o estado dos arquivos de embaralhamento","Reduz quando 90% dos nós ficam ociosos por 10 minutos"],["Janela de descida","40 segundos de subutilização em job compute, 150 segundos em uso geral","Exige também o compute ocioso por ao menos 30 segundos"],["Forma da redução","Cai por percentual dos nós atuais","Cai exponencialmente, começando por 1 nó"]]',
                },
                {
                    type: "text",
                    value: "Três avisos que acompanham a autoescala. Ela não está disponível para job de `spark-submit`. Não ligue alocação dinâmica do Spark em compute com autoescala, porque as duas decisões competem e aparecem erro `NODES_LOST` e task que nunca é atendido. E a descida tem limitação conhecida em carga de Structured Streaming, caso em que a documentação aponta pipeline declarativo com autoescala aprimorada.\n\nEm pipeline do Lakeflow, a **autoescala aprimorada** é o padrão para pipeline novo. A diferença em relação à autoescala de cluster é precisa: ela desliga nó subutilizado de forma proativa, garantindo que nenhum task falhe no desligamento, enquanto a autoescala de cluster só reduz nó que está ocioso. Em pipeline sem servidor ela está sempre ligada e não pode ser desativada, e entra também a escala vertical, que escolhe o tamanho de instância para não falhar por falta de memória. A recomendação de configuração é deixar **Min workers** no padrão e definir **Max workers** conforme o orçamento e a prioridade do pipeline: reduzir o máximo pode aumentar a latência, mas evita estouro de custo em operação intensiva.",
                },
                {
                    type: "text",
                    value: '**Instância spot** é a terceira alavanca. Em compute clássico, a opção **Use spot instance** fica em Advanced performance. O ponto que a prova cobra: a **primeira instância é sempre on-demand**, e essa primeira instância é o driver. A recomendação de arquitetura repete isso, "It is recommended that the first instance (the Spark driver) should always be an on-demand virtual machine", e orienta a não combinar o driver com pool apoiado em spot.\n\nO critério de uso é igualmente direto: "Spot instances are a good choice for workloads where it is acceptable to take longer". Ou seja, carga com exigência frouxa de latência. O risco é concreto, não teórico: o compute pode cair abaixo do mínimo configurado quando o provedor retoma instâncias, e a Databricks fica tentando restaurar o mínimo.',
                },
                {
                    type: "table",
                    value: '[["Alavanca de custo","Quando usar","O cuidado que vem com ela"],["Compute sem servidor","Quando não é preciso tipo de instância específico, política própria ou script de inicialização","O workspace precisa de Unity Catalog"],["Autoescala","Tarefa longa cujo volume varia durante a execução","A descida é limitada em carga de Structured Streaming"],["Instância spot","Carga em que é aceitável demorar mais","O provedor pode retomar a instância, e o driver fica em on-demand"],["Job compute em vez de uso geral","Código agendado e não interativo, que custa bem menos ali","Não serve para exploração interativa"],["Encerramento automático","Todo compute interativo, após um período de inatividade","Não muda nada em job agendado, que já encerra no fim"]]',
                },
                {
                    type: "quote",
                    value: "A primeira instância é sempre on-demand, e ela é o driver. Instância spot vale para carga em que é aceitável demorar mais, e nunca para o nó que o provedor não deveria poder retomar.",
                },
                {
                    type: "text",
                    value: "Escolher bem resolve metade; a outra metade é enxergar o gasto. A tabela de sistema `system.billing.usage` é o ponto de observação do custo, e a documentação pede duas disciplinas em volta dela: marcar workspace e compute com tag desde o primeiro dia, porque atribuir custo depois é retrabalho, e configurar notificação por email quando o orçamento mensal é atingido, para o estouro não aparecer só na fatura.",
                },
                {
                    type: "code",
                    value: "-- DBU por dia e por SKU, com o produto que gerou o consumo\nSELECT usage_date, sku_name, billing_origin_product,\n       SUM(usage_quantity) AS dbus\nFROM system.billing.usage\nWHERE usage_date >= current_date() - INTERVAL 30 days\nGROUP BY ALL\nORDER BY usage_date DESC;\n\n-- consumo de um pipeline em particular\nSELECT usage_date, SUM(usage_quantity) AS dbus\nFROM system.billing.usage\nWHERE usage_metadata.dlt_pipeline_id = 'a1b2c3d4-0000-1111-2222-333344445555'\nGROUP BY ALL;",
                },
                {
                    type: "text",
                    value: "Com isso a seção de solução de problemas, monitoramento e otimização está coberta. Você sabe qual log abrir quando o pipeline falha e qual tela abrir quando o job demora; sabe o que o `OPTIMIZE` conserta e o que a escrita otimizada evita; sabe por que o liquid clustering passou a ser o caminho recomendado de layout e onde a estatística por arquivo entra nisso; sabe o que o `VACUUM` cobra em troca do armazenamento que libera; e sabe nomear as alavancas de custo com o critério de cada uma.\n\nNa prova Associate essa seção vale 10% das 45 questões, e as perguntas dela têm quase sempre a mesma forma: um sintoma e quatro remédios, dos quais só um responde àquele sintoma. O atalho para acertar é o hábito que esta aula fechou, separar problema de corretude de problema de tempo, e problema de tempo de problema de custo, antes de olhar as alternativas.",
                },
            ],
            questions: [
                {
                    statement:
                        "Qual é o tempo típico de inicialização de um SQL warehouse sem servidor, segundo a documentação?",
                    difficulty: "facil",
                    explanation:
                        "A documentação registra inicialização rápida, tipicamente entre 2 e 6 segundos, para warehouse sem servidor, contra cerca de 4 minutos em pro e classic. Confundir segundos com minutos é o erro que a questão testa, porque é essa diferença que viabiliza encerrar por inatividade sem prejudicar o usuário.",
                    options: [
                        {
                            text: "Entre 2 e 6 segundos, porque o compute é gerenciado e mantido pela Databricks",
                            isCorrect: true,
                        },
                        {
                            text: "Entre 2 e 6 minutos, porque o compute sobe na sua conta de nuvem a cada novo uso",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 4 minutos, o mesmo tempo típico de um warehouse pro ou classic",
                            isCorrect: false,
                        },
                        {
                            text: "Cerca de 30 segundos, tempo que cai a zero quando a autoescala está ligada",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Você marca a opção de instância spot em um compute clássico. Qual instância continua sendo on-demand?",
                    difficulty: "medio",
                    explanation:
                        "A documentação é literal: a primeira instância é sempre on-demand, e essa primeira instância é o driver. A recomendação de arquitetura reforça manter o driver em máquina on-demand. Achar que a opção troca todos os nós por spot é o erro que custa o job quando o provedor retoma a instância do driver.",
                    options: [
                        {
                            text: "A primeira, que é o driver, e a recomendação é manter o driver em on-demand",
                            isCorrect: true,
                        },
                        {
                            text: "Nenhuma, porque a opção troca todos os nós do compute por instância spot na hora",
                            isCorrect: false,
                        },
                        {
                            text: "A última a subir, que fica reservada para quando o provedor retoma nós",
                            isCorrect: false,
                        },
                        {
                            text: "Todas as de worker, e só o driver passa a usar spot para reduzir o custo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Com autoescala otimizada, depois de quanto tempo de subutilização o compute começa a reduzir de tamanho?",
                    difficulty: "medio",
                    explanation:
                        "A autoescala otimizada reduz job compute após 40 segundos de subutilização e compute de uso geral após 150 segundos. Os 10 minutos com 90% dos nós ociosos pertencem à autoescala padrão, do plano Standard, e é esse o distrator mais escolhido.",
                    options: [
                        {
                            text: "40 segundos em job compute e 150 segundos em compute de uso geral",
                            isCorrect: true,
                        },
                        {
                            text: "150 segundos em job compute e 40 segundos em compute de uso geral",
                            isCorrect: false,
                        },
                        {
                            text: "10 minutos em qualquer tipo, desde que 90% dos nós estejam ociosos",
                            isCorrect: false,
                        },
                        {
                            text: "30 segundos em qualquer tipo, desde que o compute esteja todo ocioso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que a autoescala aprimorada de pipelines faz e a autoescala de cluster clássica não faz?",
                    difficulty: "dificil",
                    explanation:
                        "A documentação separa as duas exatamente aqui: a aprimorada desliga nó subutilizado de forma proativa e garante que nenhum task falhe no desligamento, enquanto a autoescala de cluster só reduz nó que está ocioso. Escolher instância mais barata é outra coisa, a escala vertical do pipeline sem servidor.",
                    options: [
                        {
                            text: "Desliga nó subutilizado de forma proativa, garantindo que nenhum task falhe no desligamento",
                            isCorrect: true,
                        },
                        {
                            text: "Desliga o compute inteiro entre atualizações, algo que a autoescala de cluster nunca alcança",
                            isCorrect: false,
                        },
                        {
                            text: "Escolhe o tipo de instância mais barato do provedor antes de cada atualização do pipeline",
                            isCorrect: false,
                        },
                        {
                            text: "Dispensa a definição de mínimo e de máximo de workers em pipeline de compute clássico",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Um job de lote roda de madrugada, não tem prazo apertado e varia muito de volume entre execuções. Qual combinação a documentação sustenta?",
                    difficulty: "dificil",
                    explanation:
                        "Código agendado e não interativo custa bem menos em job compute; autoescala cobre a variação de volume; e spot é indicado para carga em que é aceitável demorar mais, com o driver em on-demand. Deixar o driver em spot é o detalhe que invalida a alternativa mais parecida com a correta.",
                    options: [
                        {
                            text: "Job compute com autoescala e workers em spot, mantendo o driver em instância on-demand",
                            isCorrect: true,
                        },
                        {
                            text: "Compute de uso geral com autoescala e workers em spot, mantendo o driver também em spot",
                            isCorrect: false,
                        },
                        {
                            text: "Job compute de tamanho fixo e todos os nós em spot, sem encerramento automático ligado",
                            isCorrect: false,
                        },
                        {
                            text: "Compute de uso geral de tamanho fixo em on-demand, com encerramento automático ligado",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

export const MODULOS: Modulo[] = [
    MODULO_1,
    MODULO_2,
    MODULO_3,
    MODULO_4,
    MODULO_5,
    MODULO_6,
    MODULO_7,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "intermediario",
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log(
                "Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.",
            );
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO })
            .where(eq(trails.id, trilha.id));
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        explanation: q.explanation,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
