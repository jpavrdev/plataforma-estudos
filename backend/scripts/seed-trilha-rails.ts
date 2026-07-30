// Seed da trilha Ruby on Rails (Rails 8.1). Conteúdo autoral.
// A versão 8.1 saiu em outubro de 2025 e é a que a trilha ensina: Active Job
// Continuations, associações depreciadas, Structured Event Reporting e o CI local com bin/ci.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-rails.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Ruby on Rails";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Ruby on Rails 8.1 do primeiro app ao deploy: rotas REST, controllers e views em ERB, Active Record com migrations, associações e escopos, autenticação nativa e segurança, Hotwire com Turbo e Stimulus, jobs e cache com a Solid Trifecta, testes com Minitest e deploy com Kamal. O framework que definiu boa parte do que hoje se espera de uma aplicação web.";
const CARGA_HORARIA = 24;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - O Rails e o primeiro app",
    aulas: [
        {
            titulo: "O que é Rails e as duas doutrinas",
            blocks: [
                {
                    type: "text",
                    value: "# O framework que definiu uma época\n\nO **Ruby on Rails** foi criado por David Heinemeier Hansson em 2004, extraído do Basecamp. Ele popularizou ideias que hoje parecem óbvias: migrations, geradores, MVC no servidor e teste como parte do projeto.\n\nGitHub, Shopify, Airbnb e Basecamp rodam Rails em escala grande até hoje.",
                },
                {
                    type: "text",
                    value: "## Convenção sobre configuração\n\nA primeira doutrina: se você seguir as convenções, quase nada precisa ser configurado. Um model `Produto` fala com a tabela `produtos`, o controller `ProdutosController` renderiza `app/views/produtos`.\n\nO ganho não é digitar menos, é que **todo projeto Rails se parece**. Quem chega em um projeto novo já sabe onde procurar.",
                },
                {
                    type: "text",
                    value: "## Não se repita\n\nA segunda: cada pedaço de conhecimento mora em um lugar só. A estrutura da tabela está na migration, e o model a descobre sozinho. Nada de declarar as colunas de novo no código.",
                },
                {
                    type: "table",
                    value: '[["Convenção", "Exemplo"], ["Model no singular", "Produto"], ["Tabela no plural", "produtos"], ["Controller no plural", "ProdutosController"], ["Views por controller", "app/views/produtos"], ["Chave estrangeira", "categoria_id"]]',
                },
                {
                    type: "text",
                    value: "Esta trilha usa o **Rails 8.1**, lançado em outubro de 2025, com Ruby 4.0.",
                },
            ],
            questions: [
                {
                    statement: "O que a convenção sobre configuração garante?",
                    difficulty: "medio",
                    options: [
                        { text: "Que quase nada precisa ser configurado", isCorrect: true },
                        { text: "Que o código roda mais rápido em produção", isCorrect: false },
                        { text: "Que as configurações ficam em um arquivo só", isCorrect: false },
                        { text: "Que o framework aceita qualquer estrutura", isCorrect: false },
                    ],
                },
                {
                    statement: "Com qual tabela o model `Produto` fala por convenção?",
                    difficulty: "facil",
                    options: [
                        { text: "produtos", isCorrect: true },
                        { text: "produto, no mesmo singular do model", isCorrect: false },
                        { text: "tb_produto, com prefixo padrão do Rails", isCorrect: false },
                        { text: "Nenhuma, é preciso declarar sempre", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o princípio de não se repetir defende?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada conhecimento em um lugar só", isCorrect: true },
                        { text: "Que o código nunca tenha linhas duplicadas", isCorrect: false },
                        { text: "Que cada classe tenha uma responsabilidade", isCorrect: false },
                        { text: "Que os testes cubram todos os caminhos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o maior ganho de todo projeto Rails ser parecido?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quem chega já sabe onde procurar", isCorrect: true },
                        { text: "O framework consegue otimizar melhor o código", isCorrect: false },
                        { text: "Os projetos podem compartilhar o mesmo banco", isCorrect: false },
                        {
                            text: "As gems funcionam sem precisar de configuração",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o model descobre as colunas da tabela?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele lê o schema do banco sozinho", isCorrect: true },
                        { text: "Pelas propriedades declaradas na classe", isCorrect: false },
                        { text: "Por um arquivo de mapeamento em config", isCorrect: false },
                        { text: "Pelos atributos definidos na migration", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "rails new e a estrutura do projeto",
            blocks: [
                {
                    type: "text",
                    value: "# Criando a aplicação\n\nO comando `rails new` monta o projeto inteiro: estrutura de pastas, dependências, banco configurado, testes e até o Git iniciado.",
                },
                {
                    type: "code",
                    value: "gem install rails\nrails new loja\n\n# Escolhendo o banco e dispensando o que não vai usar\nrails new loja --database=postgresql\nrails new api --api --skip-test\n\ncd loja\nbin/rails server\n# http://localhost:3000",
                },
                {
                    type: "table",
                    value: '[["Pasta", "O que guarda"], ["app/", "models, views, controllers e jobs"], ["config/", "rotas, banco e ambientes"], ["db/", "migrations, schema e seeds"], ["test/", "os testes da aplicação"], ["bin/", "os executáveis do projeto"], ["public/", "arquivos servidos como estão"]]',
                },
                {
                    type: "text",
                    value: "## Dentro de app\n\nA pasta `app` cresceu ao longo das versões e hoje separa bem as responsabilidades: `models`, `views`, `controllers`, `helpers`, `jobs`, `mailers` e `javascript`.\n\n## bin, não gem\n\nUse sempre `bin/rails` em vez de `rails`. O executável em `bin` respeita as versões travadas no `Gemfile.lock`, enquanto o comando global usa a versão instalada no sistema, que pode ser outra.",
                },
            ],
            questions: [
                {
                    statement: "O que `rails new` cria além da estrutura de pastas?",
                    difficulty: "medio",
                    options: [
                        { text: "Dependências, banco configurado e Git", isCorrect: true },
                        { text: "Apenas as pastas vazias do projeto novo", isCorrect: false },
                        { text: "O servidor de produção já configurado", isCorrect: false },
                        { text: "Os models e controllers do domínio", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `bin/rails` em vez de `rails`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele respeita as versões travadas do projeto", isCorrect: true },
                        { text: "Ele executa os comandos bem mais rápido", isCorrect: false },
                        { text: "Ele funciona sem o Ruby estar instalado", isCorrect: false },
                        { text: "Ele mostra mais detalhes na saída do terminal", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a opção `--api` faz no `rails new`?",
                    difficulty: "medio",
                    options: [
                        { text: "Cria o projeto sem a camada de views", isCorrect: true },
                        { text: "Cria apenas as rotas de API do projeto", isCorrect: false },
                        { text: "Configura a autenticação por token", isCorrect: false },
                        { text: "Gera a documentação dos endpoints", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam as migrations em um projeto Rails?",
                    difficulty: "facil",
                    options: [
                        { text: "Em db/migrate", isCorrect: true },
                        { text: "Em app/migrations, junto dos models", isCorrect: false },
                        { text: "Em config/database, com a configuração", isCorrect: false },
                        { text: "Em lib/migrations, fora da pasta app", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando sobe o servidor de desenvolvimento?",
                    difficulty: "facil",
                    options: [
                        { text: "bin/rails server", isCorrect: true },
                        { text: "bin/rails start, no padrão de outros", isCorrect: false },
                        { text: "bin/rails serve, com um e no fim", isCorrect: false },
                        { text: "bin/rails run, executando a aplicação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O ciclo de uma requisição",
            blocks: [
                {
                    type: "text",
                    value: "# Do navegador à resposta\n\nEntender esse caminho é o que permite saber onde procurar quando algo não funciona. Toda requisição em Rails segue os mesmos passos.",
                },
                {
                    type: "table",
                    value: '[["Passo", "O que acontece", "Onde fica"], ["1", "o roteador escolhe a ação", "config/routes.rb"], ["2", "o middleware processa", "Rack"], ["3", "a ação do controller roda", "app/controllers"], ["4", "o model conversa com o banco", "app/models"], ["5", "a view monta o HTML", "app/views"], ["6", "o layout envolve a view", "app/views/layouts"]]',
                },
                {
                    type: "code",
                    value: "# 1. A rota\nget '/produtos/:id', to: 'produtos#show'\n\n# 3. O controller\nclass ProdutosController < ApplicationController\n  def show\n    @produto = Produto.find(params[:id])   # 4. o model\n  end\n  # 5. renderiza app/views/produtos/show.html.erb sozinho\nend",
                },
                {
                    type: "text",
                    value: "## Renderização implícita\n\nRepare que a ação `show` não diz o que renderizar. O Rails procura a view com o mesmo nome da ação e a usa. Você só escreve `render` quando quer fugir da convenção.\n\n## As variáveis com arroba\n\nVariáveis de instância definidas no controller ficam visíveis na view. É assim que o dado atravessa do controller para o HTML.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o primeiro passo do ciclo de uma requisição?",
                    difficulty: "facil",
                    options: [
                        { text: "O roteador escolhe qual ação chamar", isCorrect: true },
                        { text: "O controller busca o registro no banco", isCorrect: false },
                        { text: "A view monta o HTML da resposta", isCorrect: false },
                        { text: "O model valida os dados recebidos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a ação renderiza quando não há `render` explícito?",
                    difficulty: "medio",
                    options: [
                        { text: "A view com o mesmo nome da ação", isCorrect: true },
                        { text: "A view index do mesmo controller", isCorrect: false },
                        { text: "Uma resposta vazia com o código 204", isCorrect: false },
                        { text: "O layout padrão da aplicação, sem view", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um dado chega do controller até a view?",
                    difficulty: "medio",
                    options: [
                        { text: "Por variável de instância, com arroba", isCorrect: true },
                        { text: "Por variável local declarada na ação", isCorrect: false },
                        { text: "Por parâmetro passado ao método render", isCorrect: false },
                        { text: "Por uma variável global da aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam definidas as rotas?",
                    difficulty: "facil",
                    options: [
                        { text: "Em config/routes.rb", isCorrect: true },
                        { text: "Em app/routes.rb, junto dos controllers", isCorrect: false },
                        { text: "Em config/application.rb, na configuração", isCorrect: false },
                        { text: "Em cada controller, no topo da classe", isCorrect: false },
                    ],
                },
                {
                    statement: "O que envolve a view depois que ela é montada?",
                    difficulty: "medio",
                    options: [
                        { text: "O layout da aplicação", isCorrect: true },
                        { text: "O middleware que trata a resposta", isCorrect: false },
                        { text: "O helper do controller correspondente", isCorrect: false },
                        { text: "O roteador, que monta a resposta final", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Console e geradores",
            blocks: [
                {
                    type: "text",
                    value: "# O console\n\n`bin/rails console` abre um irb com a aplicação carregada. É onde se testa uma consulta, inspeciona um registro e entende por que algo não funciona.\n\nO modo sandbox desfaz tudo ao sair, o que permite experimentar sem medo.",
                },
                {
                    type: "code",
                    value: 'bin/rails console\n\n>> Produto.count\n>> p = Produto.new(nome: "Caneca")\n>> p.valid?\n>> p.errors.full_messages\n>> Produto.where("preco > ?", 100).to_sql\n\n# Desfaz tudo ao sair\nbin/rails console --sandbox',
                },
                {
                    type: "text",
                    value: "## Geradores\n\nOs geradores criam a estrutura repetitiva. O `scaffold` faz o CRUD completo de uma vez, útil para aprender e para protótipo, mas raro em código de produção: ele gera mais do que a maioria dos casos precisa.",
                },
                {
                    type: "code",
                    value: "bin/rails generate model Produto nome:string preco:decimal categoria:references\nbin/rails generate controller Produtos index show\nbin/rails generate migration AdicionaAtivoAProdutos ativo:boolean\nbin/rails generate scaffold Pedido total:decimal status:string\n\n# Desfazendo o que um gerador criou\nbin/rails destroy model Produto",
                },
                {
                    type: "table",
                    value: '[["Comando", "O que faz"], ["bin/rails routes", "lista todas as rotas"], ["bin/rails db:migrate", "aplica as migrations"], ["bin/rails db:seed", "popula com dados iniciais"], ["bin/rails test", "roda os testes"], ["bin/rails stats", "conta linhas por camada"]]',
                },
            ],
            questions: [
                {
                    statement: "O que `bin/rails console --sandbox` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Desfaz as alterações ao sair", isCorrect: true },
                        { text: "Abre o console sem carregar a aplicação", isCorrect: false },
                        { text: "Impede que consultas sejam executadas", isCorrect: false },
                        {
                            text: "Conecta no banco de teste em vez do de desenvolvimento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o gerador `scaffold` cria?",
                    difficulty: "medio",
                    options: [
                        { text: "O CRUD completo do recurso", isCorrect: true },
                        { text: "Apenas o model e a migration dele", isCorrect: false },
                        { text: "Somente as rotas e o controller vazio", isCorrect: false },
                        { text: "As views, sem o controller correspondente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o scaffold é raro em código de produção?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele gera mais do que a maioria precisa", isCorrect: true },
                        { text: "Ele não segue as convenções do framework", isCorrect: false },
                        { text: "Ele deixa a aplicação mais lenta ao iniciar", isCorrect: false },
                        { text: "Ele não funciona com banco PostgreSQL", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `categoria:references` gera na migration?",
                    difficulty: "medio",
                    options: [
                        { text: "A coluna categoria_id com chave estrangeira", isCorrect: true },
                        { text: "Uma coluna de texto com o nome da categoria", isCorrect: false },
                        { text: "Uma tabela intermediária entre as duas", isCorrect: false },
                        { text: "Um índice único na coluna categoria", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando lista todas as rotas do projeto?",
                    difficulty: "facil",
                    options: [
                        { text: "bin/rails routes", isCorrect: true },
                        { text: "bin/rails routes:list, com o subcomando", isCorrect: false },
                        { text: "bin/rails show:routes, exibindo a tabela", isCorrect: false },
                        { text: "bin/rails config:routes, lendo o arquivo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Configuração, ambientes e credentials",
            blocks: [
                {
                    type: "text",
                    value: "# Três ambientes\n\nRails nasce com `development`, `test` e `production`, cada um com sua configuração em `config/environments`. A diferença mais visível é o recarregamento: em desenvolvimento o código é relido a cada requisição; em produção ele é carregado uma vez.",
                },
                {
                    type: "table",
                    value: '[["", "development", "production"], ["Recarrega o código", "sim", "não"], ["Mostra erro detalhado", "sim", "não"], ["Cache", "desligado", "ligado"], ["Assets", "compilados na hora", "pré-compilados"]]',
                },
                {
                    type: "text",
                    value: "## Credentials\n\nRails não usa arquivo `.env` por padrão. Ele guarda os segredos em um arquivo **criptografado** que vai para o Git, e a chave que o abre fica fora dele.\n\nA vantagem sobre o `.env`: os segredos ficam versionados junto com o código, então não existe o problema de alguém não ter a variável nova. O risco todo se concentra na `master.key`, que **nunca** pode ir para o repositório.",
                },
                {
                    type: "code",
                    value: "# Abre o editor do arquivo criptografado\nbin/rails credentials:edit\n\n# Por ambiente\nbin/rails credentials:edit --environment production",
                },
                {
                    type: "code",
                    value: "# config/credentials.yml.enc, depois de descriptografado\nsecret_key_base: abc123...\n\ngateway:\n  chave: sk_live_xyz\n  url: https://api.gateway.com\n\n# No código\nRails.application.credentials.gateway[:chave]\nRails.application.credentials.dig(:gateway, :url)",
                },
                {
                    type: "text",
                    value: "O **Rails 8.1** acrescentou a busca de credenciais por linha de comando, integrada ao Kamal, o que permite ao deploy obter segredos sem que eles fiquem no servidor.",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença mais visível entre development e production?",
                    difficulty: "medio",
                    options: [
                        { text: "O recarregamento do código a cada requisição", isCorrect: true },
                        {
                            text: "A quantidade de memória que o processo Ruby consome",
                            isCorrect: false,
                        },
                        { text: "A versão do Rails usada em cada ambiente", isCorrect: false },
                        { text: "O banco de dados usado por cada um deles", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o Rails guarda os segredos por padrão?",
                    difficulty: "medio",
                    options: [
                        { text: "Em um arquivo criptografado versionado", isCorrect: true },
                        { text: "Em um arquivo .env fora do controle de versão", isCorrect: false },
                        {
                            text: "Em variáveis de ambiente do sistema operacional",
                            isCorrect: false,
                        },
                        { text: "Em uma tabela do banco de dados da aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual arquivo nunca pode ir para o repositório?",
                    difficulty: "medio",
                    options: [
                        { text: "A master.key", isCorrect: true },
                        { text: "O credentials.yml.enc, que tem os segredos", isCorrect: false },
                        { text: "O database.yml, com a conexão do banco", isCorrect: false },
                        { text: "O arquivo de ambiente de produção", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem das credentials sobre um arquivo .env?",
                    difficulty: "dificil",
                    options: [
                        { text: "Os segredos ficam versionados com o código", isCorrect: true },
                        {
                            text: "Elas podem ser lidas sem precisar de nenhuma chave",
                            isCorrect: false,
                        },
                        { text: "Elas são carregadas bem mais rápido", isCorrect: false },
                        { text: "Elas funcionam sem precisar de deploy", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Rails 8.1 acrescentou às credentials?",
                    difficulty: "medio",
                    options: [
                        { text: "A busca por linha de comando com o Kamal", isCorrect: true },
                        { text: "A criptografia por chave assimétrica", isCorrect: false },
                        {
                            text: "Um arquivo separado para cada segredo guardado",
                            isCorrect: false,
                        },
                        { text: "A rotação automática da chave mestra", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Rotas, controllers e views",
    aulas: [
        {
            titulo: "Rotas RESTful e resources",
            blocks: [
                {
                    type: "text",
                    value: "# O roteador\n\nO arquivo `config/routes.rb` liga URL e verbo HTTP a uma ação de controller. Rails empurra você para o desenho REST, e `resources` gera as sete rotas de uma vez.",
                },
                {
                    type: "code",
                    value: "Rails.application.routes.draw do\n  root 'produtos#index'\n\n  resources :produtos\n\n  # Só algumas\n  resources :categorias, only: [:index, :show]\n\n  # Rotas extras dentro do recurso\n  resources :pedidos do\n    member { post :cancelar }      # /pedidos/1/cancelar\n    collection { get :pendentes }  # /pedidos/pendentes\n  end\n\n  # Aninhado, e raso para não gerar URL longa demais\n  resources :posts, shallow: true do\n    resources :comentarios\n  end\nend",
                },
                {
                    type: "table",
                    value: '[["Verbo", "Caminho", "Ação", "Helper"], ["GET", "/produtos", "index", "produtos_path"], ["GET", "/produtos/new", "new", "new_produto_path"], ["POST", "/produtos", "create", "produtos_path"], ["GET", "/produtos/:id", "show", "produto_path"], ["PATCH", "/produtos/:id", "update", "produto_path"], ["DELETE", "/produtos/:id", "destroy", "produto_path"]]',
                },
                {
                    type: "text",
                    value: "## Os helpers de caminho\n\nCada rota gera um método que monta a URL. Usar `produto_path(@produto)` em vez de escrever a URL na mão significa que mudar o caminho é mexer em um lugar só.",
                },
            ],
            questions: [
                {
                    statement: "Quantas rotas `resources :produtos` gera?",
                    difficulty: "medio",
                    options: [
                        { text: "Sete", isCorrect: true },
                        { text: "Quatro, uma para cada verbo HTTP", isCorrect: false },
                        { text: "Duas, apenas index e show do recurso", isCorrect: false },
                        { text: "Uma para cada ação do controller", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `member` e `collection`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Member tem id na URL e collection não", isCorrect: true },
                        { text: "Member aceita apenas o verbo GET na rota", isCorrect: false },
                        { text: "Collection só funciona em rotas aninhadas", isCorrect: false },
                        { text: "Member gera o helper e collection não gera", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a opção `shallow: true`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Evitar URLs aninhadas longas demais", isCorrect: true },
                        { text: "Impedir que o recurso tenha rotas aninhadas", isCorrect: false },
                        { text: "Gerar apenas as rotas de leitura do recurso", isCorrect: false },
                        { text: "Criar rotas sem os helpers de caminho", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de usar `produto_path` em vez da URL escrita?",
                    difficulty: "medio",
                    options: [
                        { text: "Mudar o caminho é mexer em um lugar só", isCorrect: true },
                        { text: "O helper valida se o registro existe antes", isCorrect: false },
                        { text: "A URL gerada fica menor e mais legível", isCorrect: false },
                        { text: "O helper adiciona o token CSRF na URL", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual verbo e ação correspondem a atualizar um recurso?",
                    difficulty: "facil",
                    options: [
                        { text: "PATCH e update", isCorrect: true },
                        { text: "POST e update, no padrão dos formulários", isCorrect: false },
                        { text: "PUT e edit, que abre o formulário", isCorrect: false },
                        { text: "GET e update, com os dados na query", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Controllers e strong parameters",
            blocks: [
                {
                    type: "text",
                    value: "# A ação do controller\n\nO controller busca os dados, decide o que fazer e escolhe a resposta. As sete ações REST cobrem o CRUD e são a espinha dorsal de quase todo controller Rails.",
                },
                {
                    type: "code",
                    value: "class ProdutosController < ApplicationController\n  before_action :set_produto, only: %i[show edit update destroy]\n\n  def index\n    @produtos = Produto.order(created_at: :desc).page(params[:page])\n  end\n\n  def create\n    @produto = Produto.new(produto_params)\n\n    if @produto.save\n      redirect_to @produto, notice: 'Produto criado.'\n    else\n      render :new, status: :unprocessable_entity\n    end\n  end\n\n  private\n\n  def set_produto\n    @produto = Produto.find(params[:id])\n  end\n\n  def produto_params\n    params.require(:produto).permit(:nome, :preco, :categoria_id)\n  end\nend",
                },
                {
                    type: "text",
                    value: "## Strong parameters\n\nO método `produto_params` não é enfeite: sem ele, alguém poderia enviar um campo que não deveria, como `admin: true`, e o `Product.new` aceitaria.\n\n`require` exige que a chave exista e `permit` lista o que pode passar. Tudo fora da lista é descartado, e o Rails registra um aviso no log.",
                },
                {
                    type: "text",
                    value: "## O status na falha\n\n`status: :unprocessable_entity` no `render` da falha é obrigatório desde que o Turbo virou padrão: sem o código 422, o Turbo não sabe que houve erro e não substitui o formulário na tela.",
                },
                {
                    type: "code",
                    value: "before_action :autenticar\nbefore_action :set_produto, only: %i[edit update]\nafter_action :registrar_acesso, only: :show\nskip_before_action :verify_authenticity_token, only: :webhook",
                },
            ],
            questions: [
                {
                    statement: "O que os strong parameters protegem?",
                    difficulty: "medio",
                    options: [
                        { text: "Contra atribuição em massa indevida", isCorrect: true },
                        { text: "Contra injeção de SQL nas consultas feitas", isCorrect: false },
                        { text: "Contra requisições vindas de outros sites", isCorrect: false },
                        { text: "Contra o envio de arquivos muito grandes", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `require` e `permit`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Require exige a chave e permit lista o que passa",
                            isCorrect: true,
                        },
                        {
                            text: "Require valida o tipo e permit valida o valor enviado",
                            isCorrect: false,
                        },
                        { text: "Require é para criar e permit para atualizar", isCorrect: false },
                        { text: "Não há diferença, os dois filtram os campos", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `status: :unprocessable_entity` ao renderizar erro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Sem o 422 o Turbo não mostra o formulário com erros",
                            isCorrect: true,
                        },
                        { text: "Porque o Rails exige um status em todo render", isCorrect: false },
                        {
                            text: "Para que o navegador não guarde a página no cache dele",
                            isCorrect: false,
                        },
                        { text: "Para que o log registre a falha de validação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `before_action` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Roda um método antes das ações", isCorrect: true },
                        { text: "Roda um método depois de cada ação", isCorrect: false },
                        { text: "Valida os parâmetros antes de salvar", isCorrect: false },
                        { text: "Registra a ação no log da aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com um campo não listado no `permit`?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele é descartado e o Rails avisa no log", isCorrect: true },
                        { text: "A requisição inteira é recusada com erro", isCorrect: false },
                        { text: "O campo é gravado com o valor nulo", isCorrect: false },
                        { text: "O campo é aceito, mas gera uma exceção", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Views, ERB e helpers",
            blocks: [
                {
                    type: "text",
                    value: "# ERB\n\nAs views usam **ERB**: HTML com Ruby embutido. Duas tags fazem quase tudo:\n\n- `<%= %>` executa **e imprime** o resultado\n- `<% %>` executa **sem imprimir**, para laços e condicionais",
                },
                {
                    type: "code",
                    value: "<h1><%= @produto.nome %></h1>\n\n<% if @produtos.any? %>\n  <ul>\n    <% @produtos.each do |produto| %>\n      <li><%= link_to produto.nome, produto %></li>\n    <% end %>\n  </ul>\n<% else %>\n  <p>Nenhum produto cadastrado.</p>\n<% end %>",
                },
                {
                    type: "text",
                    value: "## O escape é automático\n\nO ERB do Rails **escapa a saída sozinho**. Para inserir HTML confiável é preciso pedir explicitamente com `raw` ou `html_safe`, e essa inversão é o que fecha a porta do XSS por padrão.",
                },
                {
                    type: "code",
                    value: '<%= "<b>negrito</b>" %>        <%# vira texto, não negrito %>\n<%= raw "<b>negrito</b>" %>    <%# vira negrito de verdade %>',
                },
                {
                    type: "table",
                    value: '[["Helper", "Para que serve"], ["link_to", "gera uma tag de link"], ["form_with", "gera um formulário"], ["image_tag", "gera a tag de imagem"], ["number_to_currency", "formata como moeda"], ["time_ago_in_words", "diz há quanto tempo foi"], ["truncate", "corta o texto no tamanho"]]',
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `<%= %>` e `<% %>`?",
                    difficulty: "facil",
                    options: [
                        { text: "O primeiro imprime o resultado", isCorrect: true },
                        { text: "O primeiro só funciona dentro de laços", isCorrect: false },
                        { text: "O segundo escapa o conteúdo impresso", isCorrect: false },
                        { text: "O segundo executa mais rápido na renderização", isCorrect: false },
                    ],
                },
                {
                    statement: "O ERB do Rails escapa a saída por padrão?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, é preciso pedir para não escapar", isCorrect: true },
                        { text: "Não, é preciso escapar manualmente sempre", isCorrect: false },
                        { text: "Só quando o valor vem de um formulário", isCorrect: false },
                        { text: "Só em produção, não em desenvolvimento", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o escape automático fecha a porta do XSS?",
                    difficulty: "dificil",
                    options: [
                        { text: "O caminho seguro é o padrão, e não a exceção", isCorrect: true },
                        { text: "Porque ele remove todo HTML do conteúdo", isCorrect: false },
                        { text: "Porque ele valida o texto antes de exibir", isCorrect: false },
                        {
                            text: "Porque ele bloqueia os scripts pelo cabeçalho da resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `link_to produto.nome, produto` gera?",
                    difficulty: "medio",
                    options: [
                        { text: "Um link para a página do produto", isCorrect: true },
                        { text: "Um formulário para editar o produto", isCorrect: false },
                        { text: "Um botão que remove o produto do banco", isCorrect: false },
                        { text: "Uma imagem com o nome do produto", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se insere HTML confiável em uma view?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `raw` ou `html_safe`", isCorrect: true },
                        { text: "Com aspas duplas em volta do conteúdo", isCorrect: false },
                        { text: "Com a tag `<% %>` em vez da com igual", isCorrect: false },
                        { text: "Com o helper `escape` antes do valor", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Layouts, partials e formulários",
            blocks: [
                {
                    type: "text",
                    value: "# Layout\n\nO layout é a moldura de todas as páginas. O `yield` marca onde a view da ação entra.",
                },
                {
                    type: "code",
                    value: '<!-- app/views/layouts/application.html.erb -->\n<!DOCTYPE html>\n<html lang="pt-br">\n  <head>\n    <title><%= content_for(:title) || "Loja" %></title>\n    <%= csrf_meta_tags %>\n    <%= stylesheet_link_tag :app %>\n    <%= javascript_importmap_tags %>\n  </head>\n  <body>\n    <%= render "shared/navegacao" %>\n    <%= yield %>\n  </body>\n</html>',
                },
                {
                    type: "text",
                    value: "## Partials\n\nUm arquivo começando por sublinhado é uma **partial**, um pedaço reaproveitável. Renderizar uma coleção é tão comum que o Rails tem atalho para isso.",
                },
                {
                    type: "code",
                    value: '<%= render "produto", produto: @produto %>\n\n<%# Coleção: chama a partial uma vez por item %>\n<%= render partial: "produto", collection: @produtos %>\n\n<%# Atalho: o Rails infere a partial pelo nome da classe %>\n<%= render @produtos %>',
                },
                {
                    type: "text",
                    value: "## form_with\n\nO `form_with` monta o formulário a partir do model. Ele escolhe sozinho a URL e o verbo: se o registro é novo, faz POST para criar; se já existe, faz PATCH para atualizar. O token CSRF entra automaticamente.",
                },
                {
                    type: "code",
                    value: "<%= form_with model: @produto do |form| %>\n  <% if @produto.errors.any? %>\n    <ul>\n      <% @produto.errors.full_messages.each do |mensagem| %>\n        <li><%= mensagem %></li>\n      <% end %>\n    </ul>\n  <% end %>\n\n  <%= form.label :nome %>\n  <%= form.text_field :nome %>\n\n  <%= form.label :preco %>\n  <%= form.number_field :preco, step: 0.01 %>\n\n  <%= form.collection_select :categoria_id, Categoria.all, :id, :nome %>\n\n  <%= form.submit %>\n<% end %>",
                },
            ],
            questions: [
                {
                    statement: "O que `yield` marca no layout?",
                    difficulty: "facil",
                    options: [
                        { text: "Onde a view da ação entra", isCorrect: true },
                        { text: "Onde as partials serão renderizadas", isCorrect: false },
                        { text: "Onde o JavaScript será carregado", isCorrect: false },
                        { text: "Onde o layout termina o processamento", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se identifica uma partial pelo nome do arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele começa com sublinhado", isCorrect: true },
                        { text: "Ele termina com a extensão .partial", isCorrect: false },
                        { text: "Ele fica em uma pasta chamada partials", isCorrect: false },
                        { text: "Ele começa com a palavra shared", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o `form_with` decide entre criar e atualizar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Pelo registro ser novo ou já existir", isCorrect: true },
                        { text: "Pela ação do controller que renderizou a view", isCorrect: false },
                        { text: "Pelo verbo informado na opção method", isCorrect: false },
                        { text: "Pela rota que foi usada para chegar na página", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `render @produtos` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Renderiza a partial uma vez por item", isCorrect: true },
                        { text: "Converte a coleção em JSON na resposta", isCorrect: false },
                        { text: "Renderiza a view index do controller", isCorrect: false },
                        { text: "Imprime os produtos como texto simples", isCorrect: false },
                    ],
                },
                {
                    statement: "O `form_with` inclui o token CSRF automaticamente?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, sem precisar declarar", isCorrect: true },
                        { text: "Não, é preciso chamar um helper à parte", isCorrect: false },
                        { text: "Só quando o formulário usa o verbo POST", isCorrect: false },
                        { text: "Só quando a proteção está ligada na rota", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Flash, redirect e render",
            blocks: [
                {
                    type: "text",
                    value: "# Duas formas de responder\n\nA distinção entre `render` e `redirect_to` confunde muito no começo:\n\n- `render` monta uma view **na mesma requisição**, sem mudar a URL\n- `redirect_to` devolve um redirecionamento e o navegador **faz outra requisição**",
                },
                {
                    type: "code",
                    value: "def create\n  @produto = Produto.new(produto_params)\n\n  if @produto.save\n    # Sucesso: redireciona, para o F5 não reenviar o formulário\n    redirect_to @produto, notice: 'Produto criado com sucesso.'\n  else\n    # Falha: renderiza, para manter o que foi digitado e os erros\n    render :new, status: :unprocessable_entity\n  end\nend",
                },
                {
                    type: "text",
                    value: "Essa escolha tem motivo. No sucesso, redirecionar evita que recarregar a página reenvie o formulário e crie um registro duplicado. Na falha, renderizar preserva o objeto em memória com os valores digitados e os erros de validação.",
                },
                {
                    type: "text",
                    value: "## Flash\n\nO `flash` guarda uma mensagem que sobrevive **exatamente um** redirecionamento e some depois. `flash.now` vale só para a renderização atual, e é o que se usa junto com `render`.",
                },
                {
                    type: "code",
                    value: "redirect_to @produto, notice: 'Salvo.'\nredirect_to produtos_path, alert: 'Não foi possível salvar.'\n\n# Com render, use flash.now\nflash.now[:alert] = 'Confira os campos.'\nrender :new, status: :unprocessable_entity\n\n<%# No layout %>\n<% flash.each do |tipo, mensagem| %>\n  <div class=\"flash <%= tipo %>\"><%= mensagem %></div>\n<% end %>",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `render` e `redirect_to`?",
                    difficulty: "medio",
                    options: [
                        { text: "O redirect faz o navegador pedir de novo", isCorrect: true },
                        { text: "O render é bem mais rápido de executar", isCorrect: false },
                        { text: "O redirect só funciona dentro de create", isCorrect: false },
                        { text: "O render não pode passar variáveis à view", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que redirecionar depois de salvar com sucesso?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para que recarregar não reenvie o formulário", isCorrect: true },
                        {
                            text: "Para que a mensagem de sucesso apareça na tela",
                            isCorrect: false,
                        },
                        { text: "Porque o Rails exige redirect em toda criação", isCorrect: false },
                        { text: "Para que o registro seja gravado no banco", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que renderizar em vez de redirecionar quando a validação falha?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para manter o que foi digitado e os erros", isCorrect: true },
                        { text: "Para que a URL da página não seja alterada", isCorrect: false },
                        { text: "Porque o redirect apagaria o registro criado", isCorrect: false },
                        { text: "Para que o status da resposta seja 422", isCorrect: false },
                    ],
                },
                {
                    statement: "Quanto tempo uma mensagem em `flash` sobrevive?",
                    difficulty: "medio",
                    options: [
                        { text: "Um redirecionamento", isCorrect: true },
                        { text: "Enquanto a sessão do usuário estiver aberta", isCorrect: false },
                        { text: "Até que ela seja apagada explicitamente", isCorrect: false },
                        { text: "Por cinco minutos a partir da definição", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar `flash.now` em vez de `flash`?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando a resposta é um render", isCorrect: true },
                        { text: "Quando a mensagem for de alerta e não aviso", isCorrect: false },
                        { text: "Quando houver mais de uma mensagem na tela", isCorrect: false },
                        { text: "Quando a ação for de criação de registro", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Active Record",
    aulas: [
        {
            titulo: "Migrations e o schema",
            blocks: [
                {
                    type: "text",
                    value: "# O banco em código\n\nCada **migration** descreve uma mudança no banco. Elas rodam em ordem e o resultado acumulado fica registrado em `db/schema.rb`, que é a fonte de verdade da estrutura atual.",
                },
                {
                    type: "code",
                    value: "class CreateProdutos < ActiveRecord::Migration[8.1]\n  def change\n    create_table :produtos do |t|\n      t.string :nome, null: false\n      t.string :slug, null: false, index: { unique: true }\n      t.text :descricao\n      t.decimal :preco, precision: 10, scale: 2, null: false\n      t.references :categoria, null: false, foreign_key: true\n      t.boolean :ativo, default: true, null: false\n\n      t.timestamps\n    end\n  end\nend",
                },
                {
                    type: "text",
                    value: "## O método change\n\nO `change` sabe desfazer a maior parte das operações sozinho: o inverso de `create_table` é `drop_table`. Quando a operação não é reversível, como remover uma coluna com dados, escreva `up` e `down` separados.",
                },
                {
                    type: "code",
                    value: "bin/rails db:migrate\nbin/rails db:rollback\nbin/rails db:rollback STEP=3\nbin/rails db:migrate:status\nbin/rails db:prepare      # cria, migra e popula se precisar",
                },
                {
                    type: "text",
                    value: "## O schema é ordenado por coluna no Rails 8.1\n\nUma mudança pequena e prática do 8.1: as colunas em `db/schema.rb` agora saem **em ordem alfabética**. Isso reduz o conflito de merge que aparecia sempre que duas pessoas acrescentavam coluna na mesma tabela.",
                },
                {
                    type: "quote",
                    value: "Nunca edite uma migration já aplicada em outro ambiente. Lá ela consta como executada, e a alteração nunca chega.",
                },
            ],
            questions: [
                {
                    statement: "O que `db/schema.rb` representa?",
                    difficulty: "medio",
                    options: [
                        { text: "A estrutura atual do banco", isCorrect: true },
                        { text: "A lista de migrations que ainda faltam", isCorrect: false },
                        { text: "Os dados iniciais que a aplicação usa", isCorrect: false },
                        { text: "A configuração de conexão com o banco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o método `change` permite?",
                    difficulty: "medio",
                    options: [
                        { text: "O Rails inferir como desfazer a migration", isCorrect: true },
                        { text: "Alterar uma migration que já foi aplicada", isCorrect: false },
                        { text: "Rodar a migration sem tocar no schema", isCorrect: false },
                        { text: "Aplicar a mudança em todos os ambientes", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando escrever `up` e `down` em vez de `change`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando a operação não é reversível sozinha", isCorrect: true },
                        { text: "Quando a migration altera mais de uma tabela", isCorrect: false },
                        { text: "Quando a tabela já tem dados gravados", isCorrect: false },
                        { text: "Quando a migration cria uma chave estrangeira", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no schema.rb no Rails 8.1?",
                    difficulty: "medio",
                    options: [
                        { text: "As colunas saem em ordem alfabética", isCorrect: true },
                        { text: "O arquivo passou a ser gerado em formato SQL", isCorrect: false },
                        { text: "As migrations aplicadas deixaram de constar", isCorrect: false },
                        {
                            text: "O arquivo deixou de ir para o controle de versão",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual problema a ordenação alfabética do schema reduz?",
                    difficulty: "dificil",
                    options: [
                        { text: "O conflito de merge entre pessoas diferentes", isCorrect: true },
                        { text: "O tempo que a migration leva para rodar", isCorrect: false },
                        { text: "O tamanho do arquivo gerado pelo Rails", isCorrect: false },
                        {
                            text: "A quantidade de índices que são criados na tabela",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Models e a interface de consulta",
            blocks: [
                {
                    type: "text",
                    value: "# Active Record\n\nO padrão Active Record dá nome ao ORM: cada objeto é uma linha e sabe se salvar. O model não declara as colunas, ele as descobre lendo o schema.",
                },
                {
                    type: "code",
                    value: "Produto.create(nome: 'Caneca', preco: 29.9)\nProduto.find(1)\nProduto.find_by(slug: 'caneca')\nProduto.where(ativo: true)\nProduto.where('preco > ?', 100)\nProduto.where(preco: 10..100)\nProduto.order(created_at: :desc).limit(10)\nProduto.count\nProduto.sum(:preco)\nProduto.group(:categoria_id).count",
                },
                {
                    type: "text",
                    value: "## As consultas são preguiçosas\n\n`Produto.where(ativo: true)` **não** consulta o banco. Ele devolve uma `ActiveRecord::Relation`, que só executa quando alguém precisa do resultado: ao percorrer, ao chamar `to_a`, `first` ou `count`.\n\nÉ isso que permite montar a consulta em partes, encadeando condições conforme os filtros que chegaram.",
                },
                {
                    type: "code",
                    value: "consulta = Produto.all\nconsulta = consulta.where(categoria_id: params[:categoria]) if params[:categoria].present?\nconsulta = consulta.where('preco <= ?', params[:teto]) if params[:teto].present?\nconsulta = consulta.order(:nome)\n\n@produtos = consulta   # o banco só é consultado na view",
                },
                {
                    type: "table",
                    value: '[["Método", "Quando não encontra"], ["find", "levanta RecordNotFound"], ["find_by", "devolve nil"], ["find_by!", "levanta RecordNotFound"], ["where", "devolve relação vazia"], ["first", "devolve nil"]]',
                },
            ],
            questions: [
                {
                    statement: "O que `Produto.where(ativo: true)` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma relação ainda não executada", isCorrect: true },
                        { text: "Um array com os registros encontrados", isCorrect: false },
                        { text: "O primeiro registro que casa com a condição", isCorrect: false },
                        { text: "A quantidade de registros que atendem", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando a consulta chega ao banco?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando o resultado é realmente necessário", isCorrect: true },
                        { text: "No momento em que o where é chamado", isCorrect: false },
                        { text: "Sempre no fim da ação do controller", isCorrect: false },
                        { text: "Quando o model é carregado pela aplicação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `find` e `find_by`?",
                    difficulty: "medio",
                    options: [
                        { text: "O find levanta exceção quando não acha", isCorrect: true },
                        { text: "O find_by aceita apenas a chave primária", isCorrect: false },
                        { text: "O find devolve vários registros de uma vez", isCorrect: false },
                        { text: "O find_by executa a consulta bem mais rápido", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o model conhece as colunas da tabela?",
                    difficulty: "medio",
                    options: [
                        { text: "Lendo o schema do banco", isCorrect: true },
                        { text: "Por atributos declarados dentro da classe", isCorrect: false },
                        { text: "Por um arquivo de mapeamento em config", isCorrect: false },
                        { text: "Pela migration que criou a tabela", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a preguiça da relação é útil?",
                    difficulty: "medio",
                    options: [
                        { text: "Permite montar a consulta em partes", isCorrect: true },
                        { text: "Reduz a quantidade de memória usada", isCorrect: false },
                        { text: "Guarda o resultado em cache automaticamente", isCorrect: false },
                        {
                            text: "Evita que a consulta seja executada duas vezes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Validações e callbacks",
            blocks: [
                {
                    type: "text",
                    value: "# Validando no model\n\nAs validações rodam antes de salvar. `save` devolve `false` quando alguma falha, e `save!` levanta exceção. Os erros ficam em `errors`, prontos para a view exibir.",
                },
                {
                    type: "code",
                    value: "class Produto < ApplicationRecord\n  validates :nome, presence: true, length: { maximum: 255 }\n  validates :slug, presence: true, uniqueness: true\n  validates :preco, numericality: { greater_than_or_equal_to: 0 }\n  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }\n  validates :status, inclusion: { in: %w[rascunho publicado] }\n\n  validate :preco_promocional_menor\n\n  private\n\n  def preco_promocional_menor\n    return if preco_promocional.blank? || preco.blank?\n\n    if preco_promocional >= preco\n      errors.add(:preco_promocional, 'precisa ser menor que o preço')\n    end\n  end\nend",
                },
                {
                    type: "text",
                    value: "## A validação de unicidade tem uma armadilha\n\n`uniqueness: true` faz uma consulta antes de gravar. Entre a consulta e a gravação, outra requisição pode inserir o mesmo valor. A única garantia real é um **índice único no banco**, e a validação existe para dar mensagem amigável, não para garantir.",
                },
                {
                    type: "text",
                    value: "## Callbacks\n\nCallbacks rodam em momentos do ciclo de vida do registro. São úteis e viciantes: callback demais transforma um `save` simples em uma cascata difícil de seguir e de testar.",
                },
                {
                    type: "code",
                    value: "before_validation :gerar_slug\nafter_create_commit :notificar_equipe\nbefore_destroy :impedir_se_tiver_pedidos\n\n# Prefira after_commit a after_save quando envolve algo externo:\n# after_save roda dentro da transação, e um email disparado ali\n# pode sair mesmo se a transação for desfeita depois.",
                },
            ],
            questions: [
                {
                    statement: "O que `save` devolve quando uma validação falha?",
                    difficulty: "facil",
                    options: [
                        { text: "false", isCorrect: true },
                        { text: "Uma exceção de registro inválido", isCorrect: false },
                        { text: "O registro com os erros preenchidos", isCorrect: false },
                        { text: "O valor nil, sem gravar nada", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `uniqueness: true` não garante unicidade?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Outra requisição pode gravar entre a consulta e o insert",
                            isCorrect: true,
                        },
                        { text: "Porque ela só funciona com colunas de texto", isCorrect: false },
                        {
                            text: "Porque ela acaba sendo ignorada quando existe índice na coluna",
                            isCorrect: false,
                        },
                        { text: "Porque ela só roda quando o registro é novo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que garante unicidade de verdade?",
                    difficulty: "medio",
                    options: [
                        { text: "Um índice único no banco", isCorrect: true },
                        { text: "A validação declarada dentro do model", isCorrect: false },
                        { text: "Um callback antes de salvar o registro", isCorrect: false },
                        { text: "A verificação feita dentro do controller", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o risco de usar muitos callbacks?",
                    difficulty: "medio",
                    options: [
                        { text: "Um save vira uma cascata difícil de seguir", isCorrect: true },
                        {
                            text: "As validações do model deixam de ser executadas",
                            isCorrect: false,
                        },
                        { text: "O registro é gravado mais de uma vez", isCorrect: false },
                        { text: "Os callbacks rodam em ordem aleatória", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que preferir `after_commit` a `after_save` para efeito externo?",
                    difficulty: "dificil",
                    options: [
                        { text: "O after_save roda dentro da transação", isCorrect: true },
                        { text: "O after_commit executa bem mais rápido", isCorrect: false },
                        { text: "O after_save não recebe o registro salvo", isCorrect: false },
                        { text: "O after_commit roda antes da validação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Associações",
            blocks: [
                {
                    type: "text",
                    value: "# Ligando os models\n\nAs associações declaram como as tabelas se relacionam. A partir delas, o Rails gera dezenas de métodos e cuida das consultas.",
                },
                {
                    type: "code",
                    value: "class Usuario < ApplicationRecord\n  has_many :posts, dependent: :destroy\n  has_one :perfil, dependent: :destroy\n  has_many :comentarios, through: :posts\nend\n\nclass Post < ApplicationRecord\n  belongs_to :usuario\n  has_many :comentarios, dependent: :destroy\n  has_many :tags, through: :post_tags\n  has_many :post_tags\nend",
                },
                {
                    type: "table",
                    value: '[["Associação", "Onde fica a chave estrangeira"], ["belongs_to", "na própria tabela"], ["has_one", "na tabela do outro"], ["has_many", "na tabela do outro"], ["has_many through", "em uma tabela intermediária"]]',
                },
                {
                    type: "text",
                    value: "## belongs_to é obrigatório por padrão\n\nDesde o Rails 5, `belongs_to` exige que a associação exista: salvar um post sem usuário falha na validação. Para permitir o vínculo vazio, declare `optional: true`.\n\n## dependent, e o cuidado com ele\n\n`dependent: :destroy` apaga os filhos junto e **executa os callbacks de cada um**, um por um. Em uma tabela com muitos registros isso fica lento; `dependent: :delete_all` é rápido, mas pula os callbacks.",
                },
                {
                    type: "code",
                    value: "usuario.posts.create(titulo: 'Olá')\nusuario.posts.count\nusuario.posts.where(publicado: true)\npost.usuario.nome\npost.tags << tag",
                },
            ],
            questions: [
                {
                    statement: "Onde fica a chave estrangeira em um `belongs_to`?",
                    difficulty: "medio",
                    options: [
                        { text: "Na própria tabela do model", isCorrect: true },
                        { text: "Na tabela do model associado a ele", isCorrect: false },
                        { text: "Em uma tabela intermediária entre as duas", isCorrect: false },
                        { text: "Em nenhuma, a ligação é feita em memória", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no `belongs_to` desde o Rails 5?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele passou a ser obrigatório por padrão", isCorrect: true },
                        { text: "Ele deixou de gerar métodos no model", isCorrect: false },
                        { text: "Ele passou a exigir um índice na coluna", isCorrect: false },
                        { text: "Ele passou a apagar o registro associado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `dependent: :destroy` e `:delete_all`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O destroy roda os callbacks de cada filho", isCorrect: true },
                        { text: "O delete_all apaga também o registro pai", isCorrect: false },
                        { text: "O destroy apaga apenas o primeiro registro", isCorrect: false },
                        { text: "O delete_all só funciona com has_one", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `has_many through`?",
                    difficulty: "medio",
                    options: [
                        { text: "Ligar dois models por uma tabela intermediária", isCorrect: true },
                        { text: "Ligar um model a ele mesmo em hierarquia", isCorrect: false },
                        {
                            text: "Ligar models que estão em bancos de dados distintos",
                            isCorrect: false,
                        },
                        { text: "Ligar um model a vários tipos de dono", isCorrect: false },
                    ],
                },
                {
                    statement: "Como permitir que um `belongs_to` fique vazio?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `optional: true`", isCorrect: true },
                        { text: "Com `null: true` na declaração da associação", isCorrect: false },
                        { text: "Removendo a validação de presença do model", isCorrect: false },
                        { text: "Com `allow_nil: true` na associação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Escopos, N+1 e associações depreciadas",
            blocks: [
                {
                    type: "text",
                    value: "# Escopos\n\nUm escopo dá nome a uma consulta e a torna encadeável. Ele evita que a mesma condição se espalhe por vários controllers.",
                },
                {
                    type: "code",
                    value: "class Produto < ApplicationRecord\n  scope :ativos, -> { where(ativo: true) }\n  scope :baratos, -> { where('preco < ?', 50) }\n  scope :recentes, -> { order(created_at: :desc) }\n  scope :da_categoria, ->(id) { where(categoria_id: id) if id.present? }\n\n  # Aplicado a todas as consultas: use com muito cuidado\n  # default_scope { where(deletado: false) }\nend\n\nProduto.ativos.baratos.recentes.limit(10)",
                },
                {
                    type: "text",
                    value: "## O problema N+1\n\nO problema de desempenho mais comum em Rails. Percorrer uma lista acessando uma associação dispara uma consulta por item.\n\nO Rails traz um detector embutido: com `strict_loading`, acessar uma associação não carregada levanta exceção em vez de disparar a consulta escondida.",
                },
                {
                    type: "code",
                    value: "# N+1: uma consulta por post\n@posts = Post.all\n@posts.each { |post| puts post.usuario.nome }\n\n# includes: duas consultas no total\n@posts = Post.includes(:usuario)\n\n# Aninhado e com contagem\nPost.includes(comentarios: :usuario)\nPost.left_joins(:comentarios).group(:id).select('posts.*, COUNT(comentarios.id) AS total')",
                },
                {
                    type: "text",
                    value: "## Associações depreciadas, novidade do Rails 8.1\n\nRemover uma associação de um model grande é arriscado: nunca se sabe quem ainda a usa. O **Rails 8.1** permite **marcar a associação como depreciada**, e o framework passa a avisar, ou levantar erro, quando alguém a usa.\n\nIsso transforma uma remoção às cegas em um processo com evidência: marca, observa os avisos por um tempo, e só então remove.",
                },
                {
                    type: "code",
                    value: "class Usuario < ApplicationRecord\n  has_many :pedidos_antigos, deprecated: true\nend",
                },
            ],
            questions: [
                {
                    statement: "Para que serve um escopo?",
                    difficulty: "facil",
                    options: [
                        { text: "Dar nome a uma consulta reaproveitável", isCorrect: true },
                        { text: "Limitar quais colunas podem ser lidas", isCorrect: false },
                        { text: "Definir quem pode acessar o registro", isCorrect: false },
                        { text: "Validar os dados antes de gravar no banco", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas consultas `Post.includes(:usuario)` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Duas", isCorrect: true },
                        { text: "Uma para cada post encontrado na tabela", isCorrect: false },
                        { text: "Uma só, com junção entre as duas tabelas", isCorrect: false },
                        { text: "Três, contando a de contagem dos registros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `strict_loading` faz?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Levanta erro ao acessar associação não carregada",
                            isCorrect: true,
                        },
                        {
                            text: "Carrega todas as associações do model antecipadamente",
                            isCorrect: false,
                        },
                        { text: "Registra as consultas lentas em um arquivo", isCorrect: false },
                        { text: "Impede que o model faça qualquer consulta", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Rails 8.1 permite fazer com uma associação?",
                    difficulty: "medio",
                    options: [
                        { text: "Marcá-la como depreciada e observar o uso", isCorrect: true },
                        { text: "Renomeá-la sem quebrar o código existente", isCorrect: false },
                        { text: "Carregá-la sempre junto com o registro", isCorrect: false },
                        { text: "Movê-la para outro model automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `default_scope` pede cuidado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele se aplica a todas as consultas do model", isCorrect: true },
                        { text: "Ele não pode ser encadeado com outros escopos", isCorrect: false },
                        { text: "Ele deixa as consultas bem mais lentas", isCorrect: false },
                        { text: "Ele só funciona em models sem associações", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Autenticação, segurança e mailers",
    aulas: [
        {
            titulo: "O gerador de autenticação",
            blocks: [
                {
                    type: "text",
                    value: "# Autenticação sem gem\n\nPor muitos anos autenticação em Rails significava instalar o Devise. Desde o Rails 8 existe um **gerador nativo** que entrega o essencial com código no seu projeto, que você lê e altera à vontade.",
                },
                {
                    type: "code",
                    value: "bin/rails generate authentication\n\n# Gera, entre outros:\n#   app/models/user.rb e session.rb\n#   app/controllers/sessions_controller.rb\n#   app/controllers/concerns/authentication.rb\n#   as views de login e de recuperação de senha\n#   as migrations de users e sessions",
                },
                {
                    type: "text",
                    value: "## has_secure_password\n\nO coração da autenticação é `has_secure_password`, que usa a gem bcrypt. Ele acrescenta os campos virtuais de senha, a validação de confirmação e o método `authenticate`.\n\nA senha nunca é guardada: o banco tem apenas `password_digest`, o hash.",
                },
                {
                    type: "code",
                    value: "class User < ApplicationRecord\n  has_secure_password\n  normalizes :email, with: ->(e) { e.strip.downcase }\n  validates :email, presence: true, uniqueness: true\nend\n\n# No controller de sessão\nif user = User.authenticate_by(email: params[:email], password: params[:password])\n  start_new_session_for user\n  redirect_to after_authentication_url\nelse\n  redirect_to new_session_path, alert: 'Email ou senha incorretos.'\nend",
                },
                {
                    type: "quote",
                    value: "authenticate_by leva o mesmo tempo quando o email não existe e quando a senha está errada, o que impede descobrir emails cadastrados pelo tempo de resposta.",
                },
            ],
            questions: [
                {
                    statement: "O que o gerador de autenticação do Rails 8 entrega?",
                    difficulty: "medio",
                    options: [
                        { text: "Código no seu projeto, para ler e alterar", isCorrect: true },
                        { text: "Uma gem instalada com as rotas prontas", isCorrect: false },
                        { text: "Um serviço externo de autenticação ligado", isCorrect: false },
                        { text: "Apenas as migrations das tabelas usadas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `has_secure_password` acrescenta ao model?",
                    difficulty: "medio",
                    options: [
                        { text: "Campos virtuais, validação e authenticate", isCorrect: true },
                        { text: "As rotas de login e de logout do sistema", isCorrect: false },
                        { text: "A tabela de sessões usada pela aplicação", isCorrect: false },
                        { text: "O controller que trata o formulário de acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o banco guarda da senha?",
                    difficulty: "facil",
                    options: [
                        { text: "Apenas o hash, em password_digest", isCorrect: true },
                        { text: "A senha criptografada e reversível", isCorrect: false },
                        { text: "A senha em texto, protegida por permissão", isCorrect: false },
                        { text: "Nada, a senha fica só na sessão do usuário", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `authenticate_by` leva o mesmo tempo nos dois casos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para não revelar quais emails existem", isCorrect: true },
                        {
                            text: "Para que a resposta chegue mais rápido ao usuário",
                            isCorrect: false,
                        },
                        { text: "Porque o bcrypt tem tempo fixo de execução", isCorrect: false },
                        { text: "Para permitir várias tentativas simultâneas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual gem o `has_secure_password` usa por baixo?",
                    difficulty: "medio",
                    options: [
                        { text: "bcrypt", isCorrect: true },
                        { text: "devise, que cuida da autenticação", isCorrect: false },
                        { text: "openssl, para o hash das senhas", isCorrect: false },
                        { text: "jwt, para gerar o token de sessão", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Sessões, cookies e as proteções do Rails",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando quem está logado\n\nA sessão guarda dados entre requisições. Por padrão o Rails a guarda em um **cookie assinado**: o conteúdo fica no navegador, mas assinado com a chave secreta, então alterá-lo invalida a sessão.",
                },
                {
                    type: "code",
                    value: "session[:user_id] = user.id\nsession[:user_id]\nreset_session      # no login e no logout\n\n# Cookies\ncookies[:tema] = { value: 'escuro', expires: 1.year.from_now }\ncookies.signed[:user_id] = user.id      # assinado\ncookies.encrypted[:token] = valor       # criptografado",
                },
                {
                    type: "text",
                    value: "## O que o Rails já protege\n\nBoa parte das falhas clássicas vem fechada por padrão. Vale saber quais são e o que ainda as desliga.",
                },
                {
                    type: "table",
                    value: '[["Ataque", "A defesa", "O que ainda abre a porta"], ["CSRF", "token em todo formulário", "pular a verificação na ação"], ["XSS", "escape automático no ERB", "usar html_safe com dado externo"], ["SQL injection", "consultas com vínculo", "interpolar string no where"], ["Mass assignment", "strong parameters", "permitir campo demais"]]',
                },
                {
                    type: "code",
                    value: "# Perigoso: interpola a entrada do usuário\nProduto.where(\"nome = '#{params[:nome]}'\")\n\n# Seguro: com vínculo\nProduto.where('nome = ?', params[:nome])\nProduto.where(nome: params[:nome])",
                },
                {
                    type: "text",
                    value: "O `reset_session` no login e no logout evita fixação de sessão. É o mesmo cuidado que existe em qualquer framework, e continua sendo esquecido com frequência.",
                },
            ],
            questions: [
                {
                    statement: "Onde o Rails guarda a sessão por padrão?",
                    difficulty: "medio",
                    options: [
                        { text: "Em um cookie assinado no navegador", isCorrect: true },
                        { text: "Em uma tabela do banco de dados da aplicação", isCorrect: false },
                        { text: "Em arquivos dentro da pasta tmp do projeto", isCorrect: false },
                        {
                            text: "Na memória do servidor que atende a requisição",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que acontece se alguém alterar o cookie de sessão?",
                    difficulty: "medio",
                    options: [
                        { text: "A assinatura não confere e a sessão cai", isCorrect: true },
                        { text: "O conteúdo alterado passa a valer normalmente", isCorrect: false },
                        { text: "O servidor recria a sessão com o valor novo", isCorrect: false },
                        { text: "O navegador recusa o envio do cookie alterado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual consulta abre a porta para SQL injection?",
                    difficulty: "medio",
                    options: [
                        { text: "A que interpola a entrada dentro da string", isCorrect: true },
                        { text: "A que usa hash de condições no where", isCorrect: false },
                        { text: "A que usa ponto de interrogação como vínculo", isCorrect: false },
                        { text: "A que encadeia vários escopos do model", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `reset_session` no login?",
                    difficulty: "dificil",
                    options: [
                        { text: "Evitar fixação de sessão", isCorrect: true },
                        { text: "Limpar as mensagens flash pendentes", isCorrect: false },
                        { text: "Renovar o token CSRF do formulário", isCorrect: false },
                        { text: "Encerrar as outras sessões do usuário", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `cookies.signed` e `cookies.encrypted`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O criptografado também esconde o conteúdo", isCorrect: true },
                        { text: "O assinado dura mais tempo no navegador", isCorrect: false },
                        { text: "O criptografado só funciona com HTTPS", isCorrect: false },
                        { text: "O assinado pode guardar objetos completos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Autorização: quem pode fazer o quê",
            blocks: [
                {
                    type: "text",
                    value: "# Depois de saber quem é\n\nAutenticação diz quem é a pessoa. **Autorização** diz o que ela pode fazer, e o Rails não traz uma solução pronta para isso: você escreve, ou usa uma gem como Pundit ou CanCanCan.\n\nA forma mais simples e que resolve a maioria dos casos é escopar a consulta pelo usuário.",
                },
                {
                    type: "code",
                    value: "# Frágil: qualquer id passa, e o dono não é conferido\ndef show\n  @post = Post.find(params[:id])\nend\n\n# Sólido: quem não é dono recebe 404, não 403\ndef show\n  @post = Current.user.posts.find(params[:id])\nend",
                },
                {
                    type: "text",
                    value: "Escopar pela associação resolve o problema na origem: o registro de outra pessoa simplesmente não existe naquela consulta. E devolver 404 em vez de 403 tem uma vantagem: não confirma ao curioso que aquele id existe.\n\n## Quando a regra cresce\n\nCom mais de um papel e regras por ação, uma classe de política organiza melhor. O padrão do Pundit é uma classe por model, com um método por ação, e é fácil de escrever à mão.",
                },
                {
                    type: "code",
                    value: "class PostPolicy\n  def initialize(usuario, post)\n    @usuario = usuario\n    @post = post\n  end\n\n  def editar?\n    @post.usuario_id == @usuario.id || @usuario.admin?\n  end\nend\n\n# No controller\nhead :forbidden unless PostPolicy.new(Current.user, @post).editar?",
                },
            ],
            questions: [
                {
                    statement: "O Rails traz uma solução pronta de autorização?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, você escreve ou usa uma gem", isCorrect: true },
                        { text: "Sim, o gerador de autenticação já inclui", isCorrect: false },
                        { text: "Sim, pelo sistema de políticas do framework", isCorrect: false },
                        { text: "Sim, pelas permissões definidas nas rotas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de escopar a consulta pelo usuário?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O registro de outra pessoa não existe na consulta",
                            isCorrect: true,
                        },
                        {
                            text: "A consulta ao banco fica bem mais rápida de executar",
                            isCorrect: false,
                        },
                        { text: "O Rails valida a permissão automaticamente", isCorrect: false },
                        { text: "Os registros ficam ordenados pelo dono", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que devolver 404 em vez de 403 pode ser melhor?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não confirma que aquele id existe", isCorrect: true },
                        { text: "É o código correto para acesso negado", isCorrect: false },
                        { text: "Faz o navegador guardar menos em cache", isCorrect: false },
                        { text: "Permite que o usuário tente de novo depois", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o padrão de uma classe de política?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma classe por model, um método por ação", isCorrect: true },
                        { text: "Uma classe por usuário, com todas as regras", isCorrect: false },
                        { text: "Um método por controller da aplicação", isCorrect: false },
                        { text: "Uma classe única com todas as permissões", isCorrect: false },
                    ],
                },
                {
                    statement: "O que diferencia autenticação de autorização?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma diz quem é, a outra o que pode fazer", isCorrect: true },
                        { text: "Uma usa cookie e a outra usa sempre token", isCorrect: false },
                        { text: "Uma roda no model e a outra no controller", isCorrect: false },
                        { text: "Uma vale para web e a outra apenas para API", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Action Mailer",
            blocks: [
                {
                    type: "text",
                    value: "# Enviando email\n\nUm mailer se parece com um controller: cada método monta um email e existe uma view correspondente, em HTML e em texto puro.",
                },
                {
                    type: "code",
                    value: 'class PedidoMailer < ApplicationMailer\n  def confirmacao(pedido)\n    @pedido = pedido\n    @url = pedido_url(@pedido)\n\n    mail(\n      to: @pedido.cliente.email,\n      subject: "Pedido #{@pedido.numero} confirmado",\n    )\n  end\nend\n\n# Envia agora, segurando a requisição\nPedidoMailer.confirmacao(pedido).deliver_now\n\n# Manda para a fila: o certo em quase todo caso\nPedidoMailer.confirmacao(pedido).deliver_later',
                },
                {
                    type: "text",
                    value: "## deliver_now e deliver_later\n\nA diferença importa muito. `deliver_now` conversa com o servidor de email **dentro da requisição**: se ele estiver lento, o usuário espera; se estiver fora do ar, a requisição falha.\n\n`deliver_later` põe o envio na fila e devolve a resposta na hora. É a escolha padrão.",
                },
                {
                    type: "text",
                    value: "## URL em email\n\nEm email use sempre `_url`, nunca `_path`. O caminho relativo não funciona fora do site, e a base é configurada por ambiente.",
                },
                {
                    type: "code",
                    value: "# config/environments/production.rb\nconfig.action_mailer.default_url_options = { host: 'loja.com.br', protocol: 'https' }\n\n# Em desenvolvimento, o letter_opener abre o email no navegador\n# em vez de enviar de verdade",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `deliver_now` e `deliver_later`?",
                    difficulty: "medio",
                    options: [
                        { text: "O later manda o envio para a fila", isCorrect: true },
                        { text: "O later agenda o email para o dia seguinte", isCorrect: false },
                        { text: "O now envia para vários destinatários juntos", isCorrect: false },
                        { text: "O later só funciona no ambiente de produção", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o risco de usar `deliver_now` na requisição?",
                    difficulty: "dificil",
                    options: [
                        { text: "O usuário espera pelo servidor de email", isCorrect: true },
                        { text: "O email pode ser enviado mais de uma vez", isCorrect: false },
                        { text: "A mensagem chega sem a formatação correta", isCorrect: false },
                        { text: "O email é gravado no banco antes de sair", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `_url` em vez de `_path` em um email?",
                    difficulty: "medio",
                    options: [
                        { text: "O caminho relativo não funciona fora do site", isCorrect: true },
                        { text: "O helper de path não existe dentro do mailer", isCorrect: false },
                        { text: "O Rails bloqueia caminhos relativos em emails", isCorrect: false },
                        { text: "A URL completa é mais fácil de rastrear", isCorrect: false },
                    ],
                },
                {
                    statement: "Com o que um mailer se parece na estrutura?",
                    difficulty: "facil",
                    options: [
                        { text: "Com um controller, com views próprias", isCorrect: true },
                        { text: "Com um model, com validações e callbacks", isCorrect: false },
                        { text: "Com um job, com apenas um método perform", isCorrect: false },
                        { text: "Com um helper, sem views correspondentes", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde se configura a base das URLs dos emails?",
                    difficulty: "medio",
                    options: [
                        { text: "No arquivo de ambiente, em config", isCorrect: true },
                        { text: "No próprio mailer, em cada método", isCorrect: false },
                        { text: "Nas credentials criptografadas do projeto", isCorrect: false },
                        { text: "No arquivo de rotas da aplicação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Active Storage e uploads",
            blocks: [
                {
                    type: "text",
                    value: "# Arquivos anexados\n\nO **Active Storage** cuida de upload: guarda o arquivo em disco, S3 ou outro serviço, registra os metadados no banco e gera variações de imagem sob demanda.",
                },
                {
                    type: "code",
                    value: "bin/rails active_storage:install\nbin/rails db:migrate\n\nclass Produto < ApplicationRecord\n  has_one_attached :foto\n  has_many_attached :galeria\n\n  validates :foto, content_type: %w[image/png image/jpeg],\n                   size: { less_than: 5.megabytes }\nend",
                },
                {
                    type: "code",
                    value: "<%= form.file_field :foto %>\n\n<%= image_tag produto.foto.variant(resize_to_limit: [400, 400]) if produto.foto.attached? %>\n\n<%# Sempre confira attached? antes de usar %>\n<% if produto.foto.attached? %>\n  <%= image_tag produto.foto %>\n<% end %>",
                },
                {
                    type: "text",
                    value: "## Os serviços\n\nO arquivo `config/storage.yml` define onde os arquivos ficam, e cada ambiente escolhe um serviço. Assim desenvolvimento usa disco local e produção usa S3, sem mudar uma linha do código.",
                },
                {
                    type: "quote",
                    value: "Valide sempre o tipo e o tamanho do que sobe. Aceitar qualquer arquivo de qualquer tamanho é convite para encher o disco e para servir conteúdo malicioso.",
                },
            ],
            questions: [
                {
                    statement: "O que o Active Storage guarda no banco?",
                    difficulty: "medio",
                    options: [
                        { text: "Os metadados do arquivo, não o conteúdo", isCorrect: true },
                        { text: "O arquivo inteiro, em uma coluna binária", isCorrect: false },
                        { text: "Apenas o nome original do arquivo enviado", isCorrect: false },
                        { text: "O endereço público de onde ele é servido", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `variant` faz com uma imagem?",
                    difficulty: "medio",
                    options: [
                        { text: "Gera uma versão transformada sob demanda", isCorrect: true },
                        {
                            text: "Substitui o arquivo original pelo redimensionado",
                            isCorrect: false,
                        },
                        { text: "Cria todas as variações no momento do upload", isCorrect: false },
                        { text: "Comprime a imagem antes de guardá-la", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que conferir `attached?` antes de exibir?",
                    difficulty: "medio",
                    options: [
                        { text: "O registro pode não ter arquivo anexado", isCorrect: true },
                        { text: "O arquivo pode estar em outro serviço", isCorrect: false },
                        { text: "A variação pode ainda não estar pronta", isCorrect: false },
                        { text: "O Rails exige a verificação em toda view", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde se define em qual serviço os arquivos ficam?",
                    difficulty: "medio",
                    options: [
                        { text: "Em config/storage.yml", isCorrect: true },
                        { text: "No model, junto do has_one_attached", isCorrect: false },
                        { text: "Nas credentials criptografadas do projeto", isCorrect: false },
                        { text: "No controller que recebe o upload", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que validar tipo e tamanho do arquivo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Para não encher o disco nem servir algo malicioso",
                            isCorrect: true,
                        },
                        { text: "Porque o Active Storage exige as validações", isCorrect: false },
                        { text: "Para que a variação seja gerada corretamente", isCorrect: false },
                        {
                            text: "Para que o upload do arquivo fique mais rápido de concluir",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Hotwire e o front-end",
    aulas: [
        {
            titulo: "A filosofia do Hotwire",
            blocks: [
                {
                    type: "text",
                    value: "# HTML pela rede\n\nO caminho comum para uma interface interativa é uma API JSON no servidor e um framework JavaScript no navegador. Isso funciona, e cobra um preço: duas aplicações, duas linguagens, o mesmo modelo de dados descrito duas vezes.\n\nO **Hotwire** propõe o contrário: o servidor continua mandando **HTML**, e um pouco de JavaScript troca só os pedaços que mudaram.",
                },
                {
                    type: "table",
                    value: '[["", "SPA com API", "Hotwire"], ["O servidor manda", "JSON", "HTML"], ["Onde a view vive", "no navegador", "no servidor"], ["Modelo de dados", "descrito duas vezes", "um só"], ["JavaScript", "muito", "pouco"]]',
                },
                {
                    type: "text",
                    value: "## As três peças\n\n- **Turbo**: intercepta links e formulários e troca partes da página sem recarregar\n- **Stimulus**: acrescenta comportamento ao HTML que já veio pronto\n- **Native**: reaproveita as mesmas telas em aplicativo móvel\n\nO Turbo faz a maior parte do trabalho, e boa parte dele **sem você escrever nada**.",
                },
                {
                    type: "quote",
                    value: "Hotwire não é para toda interface. Editor de texto rico, mapa interativo e planilha continuam pedindo um framework JavaScript de verdade.",
                },
            ],
            questions: [
                {
                    statement: "O que o servidor manda em uma aplicação Hotwire?",
                    difficulty: "facil",
                    options: [
                        { text: "HTML", isCorrect: true },
                        { text: "JSON, consumido por um framework no cliente", isCorrect: false },
                        { text: "XML, convertido depois pelo navegador", isCorrect: false },
                        { text: "Código JavaScript que monta a página", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o principal custo do modelo de SPA com API?",
                    difficulty: "medio",
                    options: [
                        { text: "O modelo de dados é descrito duas vezes", isCorrect: true },
                        { text: "O servidor precisa de bem mais memória", isCorrect: false },
                        { text: "As páginas demoram mais para carregar", isCorrect: false },
                        { text: "A aplicação não funciona sem JavaScript", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual peça do Hotwire troca partes da página?",
                    difficulty: "medio",
                    options: [
                        { text: "O Turbo", isCorrect: true },
                        { text: "O Stimulus, que reage aos eventos", isCorrect: false },
                        { text: "O Native, que atende os aplicativos", isCorrect: false },
                        { text: "O Propshaft, que serve os arquivos", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o Stimulus?",
                    difficulty: "medio",
                    options: [
                        { text: "Acrescentar comportamento ao HTML pronto", isCorrect: true },
                        { text: "Substituir partes da página sem recarregar", isCorrect: false },
                        { text: "Gerar o HTML das páginas no servidor", isCorrect: false },
                        { text: "Compilar os arquivos de JavaScript do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Em qual caso o Hotwire não é a melhor escolha?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em um editor de texto rico ou um mapa", isCorrect: true },
                        { text: "Em um painel administrativo com muitos CRUDs", isCorrect: false },
                        { text: "Em um site com formulários e listagens", isCorrect: false },
                        { text: "Em uma aplicação com autenticação por sessão", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Turbo Drive e Turbo Frames",
            blocks: [
                {
                    type: "text",
                    value: "# Turbo Drive\n\nO **Turbo Drive** vem ligado por padrão. Ele intercepta cliques em links e envios de formulário, busca a página nova em segundo plano e troca só o `body`, mantendo o `head` e o JavaScript já carregado.\n\nO efeito é uma navegação bem mais rápida sem que você escreva nada. O preço é que **a página não recarrega de verdade**, então código que rodava uma vez no carregamento precisa ouvir os eventos do Turbo.",
                },
                {
                    type: "code",
                    value: '<%# Desligando o Turbo em um link específico %>\n<%= link_to "Baixar PDF", relatorio_path, data: { turbo: false } %>\n\n<%# Confirmação antes de agir %>\n<%= button_to "Excluir", produto_path(@produto), method: :delete,\n      data: { turbo_confirm: "Tem certeza?" } %>',
                },
                {
                    type: "text",
                    value: "## Turbo Frames\n\nUm **frame** é um pedaço independente da página. Links e formulários dentro dele afetam **apenas ele**: o servidor devolve a página inteira e o Turbo extrai o frame de mesmo id.\n\nÉ como se faz edição no lugar, paginação parcial e modal, sem uma linha de JavaScript.",
                },
                {
                    type: "code",
                    value: '<%# A listagem %>\n<%= turbo_frame_tag dom_id(produto) do %>\n  <h3><%= produto.nome %></h3>\n  <%= link_to "Editar", edit_produto_path(produto) %>\n<% end %>\n\n<%# edit.html.erb: o mesmo id, e só ele é trocado %>\n<%= turbo_frame_tag dom_id(@produto) do %>\n  <%= render "form", produto: @produto %>\n<% end %>',
                },
                {
                    type: "text",
                    value: "## O erro clássico\n\nSe a resposta não tiver um frame com o **mesmo id**, o Turbo não sabe o que colocar e o conteúdo some, sem erro visível no console. Quando um frame fica em branco, a primeira coisa a conferir é se os dois ids batem.",
                },
            ],
            questions: [
                {
                    statement: "O que o Turbo Drive substitui a cada navegação?",
                    difficulty: "medio",
                    options: [
                        { text: "O body, mantendo o head", isCorrect: true },
                        { text: "A página inteira, incluindo o head", isCorrect: false },
                        { text: "Apenas os frames declarados na página", isCorrect: false },
                        { text: "Somente os formulários que estão na tela", isCorrect: false },
                    ],
                },
                {
                    statement: "O que muda para o JavaScript com o Turbo Drive ligado?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A página não recarrega, é preciso ouvir os eventos",
                            isCorrect: true,
                        },
                        {
                            text: "O JavaScript da página deixa de funcionar na aplicação",
                            isCorrect: false,
                        },
                        { text: "Os scripts são recarregados a cada navegação", isCorrect: false },
                        { text: "O código precisa ser escrito em Stimulus", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um Turbo Frame delimita?",
                    difficulty: "medio",
                    options: [
                        { text: "Um pedaço independente da página", isCorrect: true },
                        { text: "Uma janela modal aberta sobre a página", isCorrect: false },
                        { text: "Uma área que não pode ser atualizada", isCorrect: false },
                        { text: "Um formulário com validação própria", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando a resposta não tem o frame de mesmo id?",
                    difficulty: "dificil",
                    options: [
                        { text: "O conteúdo some sem erro visível", isCorrect: true },
                        { text: "A página inteira é recarregada no lugar", isCorrect: false },
                        { text: "O Turbo levanta uma exceção no console", isCorrect: false },
                        { text: "O frame anterior permanece como estava", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se desliga o Turbo em um link específico?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `data: { turbo: false }`", isCorrect: true },
                        { text: "Com a opção `remote: false` no link", isCorrect: false },
                        { text: "Removendo o Turbo do importmap do projeto", isCorrect: false },
                        { text: "Com `data: { disable: true }` no link", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Turbo Streams",
            blocks: [
                {
                    type: "text",
                    value: "# Alterando vários pontos de uma vez\n\nO frame troca **um** pedaço. O **Turbo Stream** vai além: ele envia uma lista de operações, cada uma mirando um elemento diferente da página.\n\nCriar um comentário, por exemplo, precisa acrescentar o item na lista, limpar o formulário e atualizar o contador. Um stream faz os três em uma resposta.",
                },
                {
                    type: "table",
                    value: '[["Ação", "O que faz com o alvo"], ["append e prepend", "acrescenta dentro, no fim ou no começo"], ["replace", "troca o elemento inteiro"], ["update", "troca só o conteúdo de dentro"], ["remove", "remove o elemento"], ["before e after", "insere fora, antes ou depois"]]',
                },
                {
                    type: "code",
                    value: '<%# create.turbo_stream.erb %>\n<%= turbo_stream.append "comentarios" do %>\n  <%= render @comentario %>\n<% end %>\n\n<%= turbo_stream.update "contador", @post.comentarios.count %>\n\n<%= turbo_stream.replace "formulario_comentario" do %>\n  <%= render "form", comentario: Comentario.new %>\n<% end %>',
                },
                {
                    type: "text",
                    value: "## Streams por difusão\n\nA parte mais interessante: o model pode transmitir a atualização para **todo mundo que está vendo a página**, por WebSocket, sem que ninguém recarregue nada.\n\nÉ assim que se faz notificação ao vivo, chat e placar em tempo real com pouquíssimo código.",
                },
                {
                    type: "code",
                    value: 'class Comentario < ApplicationRecord\n  belongs_to :post\n  broadcasts_to :post\nend\n\n<%# Na view, para ouvir o canal %>\n<%= turbo_stream_from @post %>\n<div id="comentarios"><%= render @post.comentarios %></div>',
                },
            ],
            questions: [
                {
                    statement: "O que um Turbo Stream permite que um frame não permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Alterar vários pontos da página de uma vez", isCorrect: true },
                        {
                            text: "Trocar o conteúdo sem precisar recarregar a página",
                            isCorrect: false,
                        },
                        { text: "Enviar formulários sem usar JavaScript", isCorrect: false },
                        { text: "Manter o estado do formulário ao navegar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `replace` e `update`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O replace troca o elemento inteiro", isCorrect: true },
                        { text: "O update funciona apenas dentro de frames", isCorrect: false },
                        { text: "O replace só aceita conteúdo em texto", isCorrect: false },
                        { text: "O update remove o elemento antes de inserir", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `broadcasts_to` faz em um model?",
                    difficulty: "medio",
                    options: [
                        { text: "Transmite a atualização a quem está vendo", isCorrect: true },
                        { text: "Envia uma notificação por email aos usuários", isCorrect: false },
                        { text: "Registra a alteração no log da aplicação", isCorrect: false },
                        { text: "Guarda a alteração em cache para depois", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tecnologia leva o stream por difusão até o navegador?",
                    difficulty: "medio",
                    options: [
                        { text: "WebSocket", isCorrect: true },
                        { text: "Requisições repetidas em curto intervalo", isCorrect: false },
                        { text: "O cabeçalho de atualização do HTTP", isCorrect: false },
                        { text: "Um arquivo servido pelo Propshaft", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `turbo_stream_from @post` faz na view?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Assina o canal de atualizações daquele registro",
                            isCorrect: true,
                        },
                        { text: "Renderiza o post usando um stream", isCorrect: false },
                        { text: "Cria um frame com o id do registro", isCorrect: false },
                        {
                            text: "Envia o post que foi criado para os outros usuários",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Stimulus",
            blocks: [
                {
                    type: "text",
                    value: "# JavaScript que acompanha o HTML\n\nO **Stimulus** parte de uma premissa diferente da dos frameworks modernos: o HTML já veio pronto do servidor, e o JavaScript só acrescenta comportamento.\n\nEle não monta a página nem guarda estado. Ele conecta elementos a controladores por atributos no próprio HTML, o que deixa a ligação visível para quem lê a marcação.",
                },
                {
                    type: "code",
                    value: '// app/javascript/controllers/copiar_controller.js\nimport { Controller } from "@hotwired/stimulus"\n\nexport default class extends Controller {\n  static targets = ["origem", "aviso"]\n  static values = { mensagem: String }\n\n  copiar() {\n    navigator.clipboard.writeText(this.origemTarget.value)\n    this.avisoTarget.textContent = this.mensagemValue\n  }\n}',
                },
                {
                    type: "code",
                    value: '<div data-controller="copiar" data-copiar-mensagem-value="Copiado!">\n  <input data-copiar-target="origem" value="ABC-123" readonly>\n  <button data-action="click->copiar#copiar">Copiar</button>\n  <span data-copiar-target="aviso"></span>\n</div>',
                },
                {
                    type: "table",
                    value: '[["Atributo", "Para que serve"], ["data-controller", "liga o elemento ao controlador"], ["data-action", "liga um evento a um método"], ["data-*-target", "dá nome a um elemento interno"], ["data-*-value", "passa um dado do HTML"]]',
                },
                {
                    type: "text",
                    value: "## Por que isso combina com o Turbo\n\nO Stimulus reconecta os controladores sozinho quando o Turbo troca um pedaço da página. Sem ele, todo trecho substituído perderia o comportamento e seria preciso religar na mão.",
                },
            ],
            questions: [
                {
                    statement: "Qual a premissa do Stimulus?",
                    difficulty: "medio",
                    options: [
                        { text: "O HTML já vem pronto do servidor", isCorrect: true },
                        {
                            text: "O JavaScript monta toda a interface no cliente",
                            isCorrect: false,
                        },
                        { text: "O estado da aplicação vive no navegador", isCorrect: false },
                        { text: "Cada componente cuida do próprio HTML", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `data-action` liga?",
                    difficulty: "medio",
                    options: [
                        { text: "Um evento a um método do controlador", isCorrect: true },
                        { text: "Um elemento ao controlador correspondente", isCorrect: false },
                        { text: "Um valor vindo do HTML ao JavaScript", isCorrect: false },
                        { text: "Um alvo nomeado dentro do controlador", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `data-*-target`?",
                    difficulty: "medio",
                    options: [
                        { text: "Dar nome a um elemento interno", isCorrect: true },
                        { text: "Definir qual controlador cuida do elemento", isCorrect: false },
                        { text: "Passar um valor do HTML para o JavaScript", isCorrect: false },
                        { text: "Indicar qual evento dispara a ação", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece com os controladores quando o Turbo troca um trecho?",
                    difficulty: "dificil",
                    options: [
                        { text: "O Stimulus os reconecta sozinho", isCorrect: true },
                        {
                            text: "Eles param de funcionar até recarregar a página",
                            isCorrect: false,
                        },
                        { text: "É preciso religá-los manualmente no código", isCorrect: false },
                        { text: "Eles continuam ligados ao elemento antigo", isCorrect: false },
                    ],
                },
                {
                    statement: "O Stimulus guarda o estado da aplicação?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele só acrescenta comportamento", isCorrect: true },
                        { text: "Sim, em uma árvore de estado central", isCorrect: false },
                        { text: "Sim, em valores dentro de cada controlador", isCorrect: false },
                        { text: "Sim, sincronizado com o servidor", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Propshaft, importmap e assets",
            blocks: [
                {
                    type: "text",
                    value: "# Servindo CSS e JavaScript\n\nO Rails 8 trocou o Sprockets pelo **Propshaft**, bem mais simples: ele acrescenta um hash ao nome do arquivo e o serve. Sem compilação, sem pré-processamento embutido.\n\nO hash resolve cache: quando o conteúdo muda, o nome muda, e o navegador busca a versão nova sem precisar de instrução.",
                },
                {
                    type: "text",
                    value: "## Importmap\n\nO **importmap** permite usar bibliotecas JavaScript **sem empacotador e sem Node**. Ele declara um mapa de nome para URL, e o navegador resolve os imports por conta própria.\n\nIsso é possível porque navegadores modernos entendem módulos ES nativamente. Para muitos projetos, isso elimina toda a etapa de build do front-end.",
                },
                {
                    type: "code",
                    value: 'bin/importmap pin @hotwired/stimulus\nbin/importmap pin chart.js --download\n\n# config/importmap.rb\npin "application"\npin "@hotwired/turbo-rails", to: "turbo.min.js"\npin_all_from "app/javascript/controllers", under: "controllers"',
                },
                {
                    type: "table",
                    value: '[["", "Importmap", "Empacotador"], ["Precisa de Node", "não", "sim"], ["Etapa de build", "nenhuma", "sim"], ["Bom para", "a maioria dos projetos", "front-end pesado"], ["Compilar TypeScript", "não faz", "faz"]]',
                },
                {
                    type: "text",
                    value: "Quando o projeto precisa de TypeScript, JSX ou de uma árvore grande de dependências, o Rails também aceita esbuild, Vite ou Webpack pelo `jsbundling-rails`.",
                },
            ],
            questions: [
                {
                    statement: "O que o Propshaft faz com os arquivos?",
                    difficulty: "medio",
                    options: [
                        { text: "Acrescenta um hash ao nome e os serve", isCorrect: true },
                        { text: "Compila e minifica o CSS e o JavaScript", isCorrect: false },
                        { text: "Empacota tudo em um arquivo único", isCorrect: false },
                        { text: "Converte TypeScript para JavaScript", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o importmap dispensa?",
                    difficulty: "medio",
                    options: [
                        { text: "O empacotador e o Node", isCorrect: true },
                        { text: "As bibliotecas JavaScript de terceiros", isCorrect: false },
                        { text: "A declaração dos imports no código", isCorrect: false },
                        { text: "O servidor de assets em produção", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o importmap funciona sem build?",
                    difficulty: "dificil",
                    options: [
                        { text: "Os navegadores entendem módulos nativamente", isCorrect: true },
                        { text: "O Rails compila os módulos antes no servidor", isCorrect: false },
                        { text: "As bibliotecas já vêm pré-compiladas", isCorrect: false },
                        { text: "O Propshaft resolve os imports antes", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o hash no nome do arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Fazer o navegador buscar a versão nova", isCorrect: true },
                        { text: "Impedir que o arquivo seja lido diretamente", isCorrect: false },
                        { text: "Identificar qual versão do Rails o gerou", isCorrect: false },
                        { text: "Permitir vários arquivos com o mesmo nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar um empacotador em vez de importmap?",
                    difficulty: "medio",
                    options: [
                        { text: "Com TypeScript, JSX ou muitas dependências", isCorrect: true },
                        { text: "Sempre que o projeto usar o Hotwire", isCorrect: false },
                        { text: "Quando a aplicação tiver mais de uma página", isCorrect: false },
                        { text: "Quando o CSS precisar de pré-processador", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Jobs, cache e a Solid Trifecta",
    aulas: [
        {
            titulo: "Active Job e Solid Queue",
            blocks: [
                {
                    type: "text",
                    value: "# Trabalho em segundo plano\n\nO **Active Job** é a interface do Rails para trabalho assíncrono. Ela é agnóstica: o mesmo job roda no Solid Queue, no Sidekiq ou em outro adaptador, sem mudar o código.",
                },
                {
                    type: "code",
                    value: "class ProcessarRelatorioJob < ApplicationJob\n  queue_as :relatorios\n  retry_on Net::OpenTimeout, wait: :polynomially_longer, attempts: 5\n  discard_on ActiveRecord::RecordNotFound\n\n  def perform(relatorio)\n    relatorio.processar!\n  end\nend\n\nProcessarRelatorioJob.perform_later(relatorio)\nProcessarRelatorioJob.set(wait: 1.hour).perform_later(relatorio)",
                },
                {
                    type: "text",
                    value: "## Passe o registro, não o objeto inteiro\n\nO Active Job serializa os argumentos. Passar um model funciona porque o `GlobalID` guarda apenas o identificador e recarrega o registro na hora de executar.\n\nEssa é a razão do `discard_on RecordNotFound`: se o registro foi apagado entre o enfileiramento e a execução, não há o que fazer, e o job deve ser descartado em vez de tentar para sempre.",
                },
                {
                    type: "text",
                    value: "## Solid Queue\n\nO **Solid Queue** virou o adaptador padrão no Rails 8. Ele usa o **banco de dados relacional** como fila, em vez de exigir Redis.\n\nA troca tem lógica: uma peça a menos na infraestrutura, backup junto com o banco, e desempenho mais que suficiente para a grande maioria dos projetos.",
                },
                {
                    type: "code",
                    value: "# config/environments/production.rb\nconfig.active_job.queue_adapter = :solid_queue\n\n# Rodando o supervisor de filas\nbin/jobs start",
                },
            ],
            questions: [
                {
                    statement: "O que o Active Job oferece?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma interface única para vários adaptadores", isCorrect: true },
                        {
                            text: "Um servidor de filas que vem embutido no framework",
                            isCorrect: false,
                        },
                        { text: "A execução paralela de todos os jobs", isCorrect: false },
                        { text: "O agendamento de tarefas por horário", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é guardado ao passar um model como argumento?",
                    difficulty: "dificil",
                    options: [
                        { text: "Apenas o identificador, pelo GlobalID", isCorrect: true },
                        { text: "O objeto inteiro, serializado em JSON", isCorrect: false },
                        { text: "Uma cópia do registro no momento do envio", isCorrect: false },
                        { text: "A consulta que recupera aquele registro", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `discard_on RecordNotFound`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O registro pode ter sido apagado antes de executar",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o job não consegue mais acessar o banco de dados",
                            isCorrect: false,
                        },
                        { text: "Para que o job seja tentado mais vezes", isCorrect: false },
                        { text: "Porque o GlobalID expira depois de um tempo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Solid Queue usa como armazenamento?",
                    difficulty: "medio",
                    options: [
                        { text: "O banco de dados relacional", isCorrect: true },
                        { text: "O Redis, como a maioria dos adaptadores", isCorrect: false },
                        { text: "Arquivos na pasta tmp da aplicação", isCorrect: false },
                        { text: "A memória do processo que executa", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de usar o banco como fila?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma peça a menos na infraestrutura", isCorrect: true },
                        { text: "Os jobs passam a executar bem mais rápido", isCorrect: false },
                        { text: "A fila deixa de precisar de um supervisor", isCorrect: false },
                        { text: "Os jobs podem ser executados em paralelo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Active Job Continuations, novidade do Rails 8.1",
            blocks: [
                {
                    type: "text",
                    value: "# O problema do job longo\n\nUm job que roda por horas é frágil: um deploy, um reinício de container ou uma falha no meio derruba tudo, e a próxima tentativa **começa do zero**.\n\nA saída clássica era quebrar o trabalho em vários jobs menores encadeados, cada um enfileirando o próximo. Funciona e espalha a lógica por várias classes.",
                },
                {
                    type: "text",
                    value: "## As continuations\n\nO **Rails 8.1** trouxe o **Active Job Continuations**: o job declara etapas, e o framework guarda em qual delas ele estava. Depois de um reinício, ele **retoma da última etapa concluída** em vez de recomeçar.\n\nA lógica continua em uma classe só, e o job passa a sobreviver a deploy.",
                },
                {
                    type: "code",
                    value: "class MigrarContasJob < ApplicationJob\n  include ActiveJob::Continuable\n\n  def perform\n    step :normalizar_emails\n    step :recalcular_saldos\n    step :notificar_usuarios\n  end\n\n  private\n\n  def normalizar_emails\n    Usuario.find_each { |u| u.update!(email: u.email.strip.downcase) }\n  end\n\n  def recalcular_saldos\n    Conta.find_each(&:recalcular!)\n  end\n\n  def notificar_usuarios\n    Usuario.find_each { |u| AvisoMailer.migracao(u).deliver_later }\n  end\nend",
                },
                {
                    type: "quote",
                    value: "Cada etapa precisa ser idempotente: ela pode ser interrompida no meio e executada de novo desde o começo dela.",
                },
            ],
            questions: [
                {
                    statement: "Qual o problema de um job muito longo?",
                    difficulty: "medio",
                    options: [
                        { text: "Um reinício faz a tentativa recomeçar do zero", isCorrect: true },
                        { text: "Ele ocupa memória demais no servidor", isCorrect: false },
                        {
                            text: "Ele impede que os outros jobs da fila sejam executados",
                            isCorrect: false,
                        },
                        { text: "Ele não pode acessar o banco de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Active Job Continuations permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Retomar da última etapa concluída", isCorrect: true },
                        { text: "Executar as etapas todas em paralelo", isCorrect: false },
                        { text: "Cancelar o job no meio da execução", isCorrect: false },
                        { text: "Agendar cada etapa para um horário", isCorrect: false },
                    ],
                },
                {
                    statement: "Como era resolvido antes das continuations?",
                    difficulty: "medio",
                    options: [
                        { text: "Quebrando em vários jobs encadeados", isCorrect: true },
                        { text: "Aumentando o tempo limite de execução", isCorrect: false },
                        { text: "Executando o job fora da fila normal", isCorrect: false },
                        { text: "Guardando o progresso em uma tabela", isCorrect: false },
                    ],
                },
                {
                    statement: "Que cuidado cada etapa exige?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ser idempotente, para rodar de novo sem estragar",
                            isCorrect: true,
                        },
                        { text: "Ter um tempo limite definido no código", isCorrect: false },
                        {
                            text: "Devolver algum valor para a etapa seguinte executar",
                            isCorrect: false,
                        },
                        { text: "Ser executada em uma fila diferente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o job precisa incluir para usar continuations?",
                    difficulty: "medio",
                    options: [
                        { text: "ActiveJob::Continuable", isCorrect: true },
                        { text: "ActiveJob::Retryable, para as tentativas", isCorrect: false },
                        { text: "ActiveJob::Steps, com as etapas", isCorrect: false },
                        { text: "ActiveJob::Resumable, para retomar", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Cache e Solid Cache",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando o que custa caro\n\nO Rails oferece cache em vários níveis. O mais usado é o **cache de fragmento**, que guarda um pedaço de HTML já renderizado.",
                },
                {
                    type: "code",
                    value: '<%# A chave inclui o registro: se ele mudar, a chave muda %>\n<% cache @produto do %>\n  <div class="card">\n    <h3><%= @produto.nome %></h3>\n    <p><%= number_to_currency(@produto.preco) %></p>\n  </div>\n<% end %>\n\n<%# Aninhado: o de fora é invalidado quando um de dentro muda %>\n<% cache [@categoria, @produtos.maximum(:updated_at)] do %>\n  <%= render @produtos %>\n<% end %>',
                },
                {
                    type: "text",
                    value: "## Invalidação por chave\n\nO Rails usa **cache key baseada no registro**: a chave inclui a classe, o id e o `updated_at`. Quando o registro muda, a chave muda e o fragmento antigo simplesmente deixa de ser procurado.\n\nIsso resolve a parte mais difícil de cache, que é saber quando descartar: você nunca apaga nada, apenas deixa de usar.",
                },
                {
                    type: "code",
                    value: "Rails.cache.fetch(\"produtos/destaque\", expires_in: 1.hour) do\n  Produto.destaque.includes(:categoria).to_a\nend\n\nRails.cache.write('chave', valor, expires_in: 5.minutes)\nRails.cache.read('chave')\nRails.cache.delete('chave')",
                },
                {
                    type: "text",
                    value: "## Solid Cache\n\nAssim como a fila, o cache padrão do Rails 8 usa o **banco de dados**. O **Solid Cache** troca memória por disco, o que parece contraintuitivo mas tem lógica: disco hoje é rápido e barato, e permite um cache **muito maior** do que caberia em memória, com retenção de dias em vez de minutos.",
                },
            ],
            questions: [
                {
                    statement: "O que o cache de fragmento guarda?",
                    difficulty: "facil",
                    options: [
                        { text: "Um pedaço de HTML já renderizado", isCorrect: true },
                        { text: "O resultado de uma consulta ao banco", isCorrect: false },
                        { text: "A página inteira, pronta para servir", isCorrect: false },
                        { text: "Os arquivos de CSS e JavaScript", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a chave de cache de um registro inclui?",
                    difficulty: "medio",
                    options: [
                        { text: "A classe, o id e a data de atualização", isCorrect: true },
                        { text: "Apenas o id do registro que está em questão", isCorrect: false },
                        { text: "O conteúdo completo do fragmento", isCorrect: false },
                        { text: "O nome da view que foi renderizada", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o fragmento antigo é invalidado?",
                    difficulty: "dificil",
                    options: [
                        { text: "A chave muda e ele deixa de ser procurado", isCorrect: true },
                        { text: "Um callback do model apaga a chave antiga", isCorrect: false },
                        { text: "O Rails limpa o cache a cada implantação", isCorrect: false },
                        { text: "A chave expira depois de um tempo fixo", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o Solid Cache guarda os dados?",
                    difficulty: "medio",
                    options: [
                        { text: "No banco de dados, em disco", isCorrect: true },
                        { text: "Na memória do processo da aplicação", isCorrect: false },
                        { text: "No Redis, como era antes do Rails 8", isCorrect: false },
                        { text: "Em arquivos dentro da pasta tmp", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de um cache em disco?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cabe muito mais e retém por mais tempo", isCorrect: true },
                        { text: "Ele responde bem mais rápido que a memória", isCorrect: false },
                        { text: "Ele dispensa a definição de expiração", isCorrect: false },
                        {
                            text: "Ele é replicado automaticamente entre servidores",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Action Cable e Solid Cable",
            blocks: [
                {
                    type: "text",
                    value: "# Comunicação nos dois sentidos\n\nO **Action Cable** integra WebSocket ao Rails. Diferente do HTTP, em que o navegador sempre pergunta primeiro, o WebSocket mantém a conexão aberta e permite que o **servidor** envie quando quiser.\n\nÉ o que sustenta chat, notificação ao vivo e os Turbo Streams por difusão.",
                },
                {
                    type: "code",
                    value: "class ComentariosChannel < ApplicationCable::Channel\n  def subscribed\n    post = Post.find(params[:post_id])\n    stream_for post\n  end\nend\n\n# Enviando do servidor\nComentariosChannel.broadcast_to(post, html: render_comentario(comentario))",
                },
                {
                    type: "text",
                    value: "## Na prática você quase não escreve isso\n\nCom Turbo Streams, o `broadcasts_to` no model já cuida do canal, da assinatura e do envio. Escrever um channel à mão só é necessário quando o caso foge do padrão.\n\n## Solid Cable\n\nA terceira peça da trifecta. Ele usa o **banco** para distribuir as mensagens entre os processos, em vez do Redis. Com Solid Queue, Solid Cache e Solid Cable, uma aplicação Rails completa roda com **apenas um banco relacional** como dependência de infraestrutura.",
                },
                {
                    type: "table",
                    value: '[["Peça", "Substitui", "Para que serve"], ["Solid Queue", "Sidekiq com Redis", "filas de jobs"], ["Solid Cache", "Memcached ou Redis", "cache"], ["Solid Cable", "Redis do Action Cable", "WebSocket entre processos"]]',
                },
            ],
            questions: [
                {
                    statement: "O que o WebSocket permite que o HTTP comum não permite?",
                    difficulty: "medio",
                    options: [
                        { text: "O servidor enviar sem ser perguntado", isCorrect: true },
                        { text: "O envio de arquivos grandes ao servidor", isCorrect: false },
                        { text: "A conexão sem passar por autenticação", isCorrect: false },
                        { text: "A compressão automática das mensagens", isCorrect: false },
                    ],
                },
                {
                    statement: "O que sustenta os Turbo Streams por difusão?",
                    difficulty: "medio",
                    options: [
                        { text: "O Action Cable", isCorrect: true },
                        { text: "O Active Job, executando em segundo plano", isCorrect: false },
                        { text: "O Propshaft, servindo os arquivos", isCorrect: false },
                        { text: "O Solid Cache, guardando as mensagens", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando é preciso escrever um channel à mão?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o caso foge do padrão do Turbo", isCorrect: true },
                        { text: "Sempre que a aplicação usar WebSocket", isCorrect: false },
                        { text: "Quando o model tiver mais de uma associação", isCorrect: false },
                        { text: "Quando o Solid Cable estiver configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que as três peças da Solid Trifecta permitem?",
                    difficulty: "dificil",
                    options: [
                        { text: "Rodar tudo com apenas um banco relacional", isCorrect: true },
                        {
                            text: "Dispensar por completo o servidor web da aplicação",
                            isCorrect: false,
                        },
                        { text: "Executar a aplicação sem nenhum job", isCorrect: false },
                        { text: "Servir os assets sem o Propshaft", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Solid Cable substitui?",
                    difficulty: "medio",
                    options: [
                        { text: "O Redis usado pelo Action Cable", isCorrect: true },
                        { text: "O próprio Action Cable do framework", isCorrect: false },
                        { text: "O servidor de WebSocket em produção", isCorrect: false },
                        { text: "O adaptador de fila da aplicação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Structured Event Reporting, novidade do Rails 8.1",
            blocks: [
                {
                    type: "text",
                    value: '# O problema do log em texto\n\nLog tradicional é texto solto. Para responder "quantos pedidos falharam por saldo insuficiente na última hora" é preciso escrever uma expressão regular em cima de frases escritas por pessoas diferentes.\n\nO **evento estruturado** inverte isso: em vez de uma frase, você emite um **nome e um conjunto de campos**, e a ferramenta de observabilidade consulta como se fosse banco.',
                },
                {
                    type: "code",
                    value: "# Em vez disto\nRails.logger.info \"Pedido #{pedido.id} falhou: saldo insuficiente\"\n\n# Rails 8.1: nome e campos\nRails.event.notify('pedido.falhou', {\n  pedido_id: pedido.id,\n  motivo: 'saldo_insuficiente',\n  valor_cents: pedido.total_cents,\n})",
                },
                {
                    type: "text",
                    value: "## O que o Rails 8.1 trouxe\n\nUma **interface unificada** para emitir esses eventos, com assinantes que decidem o destino. O mesmo evento pode ir para o log em desenvolvimento e para a ferramenta de observabilidade em produção, sem mudar o código que o emite.\n\nAntes, cada projeto inventava a própria convenção, ou dependia de gems que não conversavam entre si.",
                },
                {
                    type: "text",
                    value: "## O que registrar\n\nEmita evento no que **importa para o negócio**: pedido criado, pagamento recusado, assinatura cancelada. Não registre dado pessoal nem segredo: log costuma ir para serviços de terceiros e ficar guardado por meses.",
                },
                {
                    type: "quote",
                    value: "Nunca coloque senha, token ou número de cartão em evento ou log. Uma vez emitido, o dado sai do seu controle.",
                },
            ],
            questions: [
                {
                    statement: "Qual o problema do log em texto solto?",
                    difficulty: "medio",
                    options: [
                        { text: "Consultar exige interpretar frases livres", isCorrect: true },
                        {
                            text: "Ele ocupa mais espaço em disco que o estruturado",
                            isCorrect: false,
                        },
                        { text: "Ele não pode ser enviado a serviços externos", isCorrect: false },
                        { text: "Ele é gravado apenas em desenvolvimento", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um evento estruturado emite?",
                    difficulty: "medio",
                    options: [
                        { text: "Um nome e um conjunto de campos", isCorrect: true },
                        { text: "Uma frase formatada com os dados dentro", isCorrect: false },
                        { text: "Um registro gravado na tabela de log", isCorrect: false },
                        { text: "Uma métrica numérica com um rótulo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Rails 8.1 acrescentou nessa área?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma interface unificada para emitir eventos", isCorrect: true },
                        { text: "Uma ferramenta de observabilidade embutida", isCorrect: false },
                        { text: "A substituição do logger padrão do framework", isCorrect: false },
                        { text: "O envio automático dos logs para a nuvem", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem decide o destino de um evento emitido?",
                    difficulty: "medio",
                    options: [
                        { text: "Os assinantes configurados", isCorrect: true },
                        { text: "O próprio código que emite o evento", isCorrect: false },
                        { text: "O ambiente em que a aplicação está rodando", isCorrect: false },
                        { text: "A ferramenta de observabilidade contratada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que nunca deve ir em um evento ou log?",
                    difficulty: "medio",
                    options: [
                        { text: "Senha, token ou número de cartão", isCorrect: true },
                        { text: "O identificador do registro envolvido", isCorrect: false },
                        { text: "O motivo pelo qual a operação falhou", isCorrect: false },
                        { text: "O horário em que o evento aconteceu", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Testes, CI e deploy",
    aulas: [
        {
            titulo: "Testes com Minitest",
            blocks: [
                {
                    type: "text",
                    value: "# Teste faz parte do projeto\n\nRails cria a pasta `test` no `rails new` e gera um arquivo de teste a cada gerador. A ferramenta padrão é o **Minitest**, e o RSpec é a alternativa popular.",
                },
                {
                    type: "code",
                    value: "class ProdutoTest < ActiveSupport::TestCase\n  test 'exige nome' do\n    produto = Produto.new(preco: 10)\n    assert_not produto.valid?\n    assert_includes produto.errors[:nome], 'não pode ficar em branco'\n  end\n\n  test 'escopo ativos traz só os ativos' do\n    assert_equal 2, Produto.ativos.count\n  end\nend\n\nclass ProdutosControllerTest < ActionDispatch::IntegrationTest\n  test 'lista os produtos' do\n    get produtos_url\n    assert_response :success\n    assert_select 'h1', 'Produtos'\n  end\n\n  test 'cria um produto válido' do\n    assert_difference('Produto.count', 1) do\n      post produtos_url, params: { produto: { nome: 'Caneca', preco: 29.9 } }\n    end\n    assert_redirected_to produto_url(Produto.last)\n  end\nend",
                },
                {
                    type: "table",
                    value: '[["Tipo de teste", "O que cobre"], ["model", "validações, escopos e regras"], ["integration", "a requisição inteira"], ["system", "o navegador de verdade"], ["mailer", "o email gerado"], ["job", "o trabalho em segundo plano"]]',
                },
                {
                    type: "text",
                    value: "## Fixtures\n\nRails carrega os arquivos de `test/fixtures` no banco de teste antes da suíte. Cada teste roda dentro de uma transação que é desfeita ao final, então nenhum deixa lixo para o próximo.",
                },
            ],
            questions: [
                {
                    statement: "Qual a ferramenta de teste padrão do Rails?",
                    difficulty: "facil",
                    options: [
                        { text: "Minitest", isCorrect: true },
                        { text: "RSpec, a mais popular na comunidade", isCorrect: false },
                        { text: "Cucumber, com cenários em texto", isCorrect: false },
                        { text: "Capybara, que dirige o navegador", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um teste de integração cobre?",
                    difficulty: "medio",
                    options: [
                        { text: "A requisição inteira, da rota à resposta", isCorrect: true },
                        { text: "Apenas as validações declaradas no model", isCorrect: false },
                        { text: "O comportamento do JavaScript na página", isCorrect: false },
                        { text: "A comunicação com serviços externos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que são as fixtures?",
                    difficulty: "medio",
                    options: [
                        { text: "Dados carregados no banco antes da suíte", isCorrect: true },
                        { text: "Métodos auxiliares usados pelos testes", isCorrect: false },
                        {
                            text: "Os arquivos que definem quais testes serão rodados",
                            isCorrect: false,
                        },
                        { text: "As asserções disponíveis em cada tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que um teste não deixa lixo para o próximo?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada um roda em transação desfeita no fim", isCorrect: true },
                        {
                            text: "O banco de teste inteiro é recriado a cada teste",
                            isCorrect: false,
                        },
                        { text: "As fixtures são recarregadas entre eles", isCorrect: false },
                        { text: "Os testes rodam em ordem alfabética fixa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `assert_difference('Produto.count', 1)` verifica?",
                    difficulty: "dificil",
                    options: [
                        { text: "Que o bloco criou exatamente um registro", isCorrect: true },
                        { text: "Que a tabela tem ao menos um registro", isCorrect: false },
                        { text: "Que a contagem foi consultada uma vez", isCorrect: false },
                        { text: "Que o produto criado é diferente do anterior", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "System tests",
            blocks: [
                {
                    type: "text",
                    value: "# Testando como quem usa\n\nOs **system tests** abrem um navegador de verdade e interagem com a página: clicam, preenchem, esperam. Eles usam Capybara e Selenium, e o Rails já configura tudo no `rails new`.\n\nSão os únicos que provam que o JavaScript funciona, e é por isso que são indispensáveis em aplicação com Hotwire.",
                },
                {
                    type: "code",
                    value: "class CadastroDeProdutoTest < ApplicationSystemTestCase\n  test 'cadastra um produto pelo formulário' do\n    login_as usuarios(:ana)\n\n    visit produtos_path\n    click_on 'Novo produto'\n\n    fill_in 'Nome', with: 'Caneca esmaltada'\n    fill_in 'Preço', with: '39.90'\n    select 'Cozinha', from: 'Categoria'\n    click_on 'Salvar'\n\n    assert_text 'Produto criado com sucesso'\n    assert_selector 'h1', text: 'Caneca esmaltada'\n  end\nend",
                },
                {
                    type: "text",
                    value: "## O custo e o cuidado\n\nSystem tests são **lentos**: cada um sobe um navegador. A recomendação é cobrir os caminhos principais e deixar o detalhe para testes de model e integração.\n\nO problema clássico é a **instabilidade**: o teste falha às vezes porque verificou antes de a página terminar de atualizar. A solução não é `sleep`, é usar as asserções do Capybara, que já esperam pelo elemento por um tempo antes de falhar.",
                },
                {
                    type: "quote",
                    value: "Um teste que falha de vez em quando é pior que teste nenhum: a equipe aprende a ignorar a suíte vermelha.",
                },
            ],
            questions: [
                {
                    statement: "O que um system test usa que os outros não usam?",
                    difficulty: "medio",
                    options: [
                        { text: "Um navegador de verdade", isCorrect: true },
                        { text: "Uma cópia do banco de produção", isCorrect: false },
                        { text: "As fixtures carregadas na suíte", isCorrect: false },
                        { text: "Um servidor separado para a API", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que system tests são indispensáveis com Hotwire?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "São os únicos que provam que o JavaScript funciona",
                            isCorrect: true,
                        },
                        { text: "São os únicos que testam as rotas do projeto", isCorrect: false },
                        { text: "São os mais rápidos de escrever e manter", isCorrect: false },
                        {
                            text: "São exigidos pelo próprio framework a partir do Rails 8",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o principal custo dos system tests?",
                    difficulty: "medio",
                    options: [
                        { text: "Eles são lentos para executar", isCorrect: true },
                        { text: "Eles exigem um banco de dados separado", isCorrect: false },
                        { text: "Eles não funcionam em ambiente de CI", isCorrect: false },
                        { text: "Eles precisam ser escritos em JavaScript", isCorrect: false },
                    ],
                },
                {
                    statement: "Como resolver a instabilidade de um system test?",
                    difficulty: "dificil",
                    options: [
                        { text: "Usar as asserções que esperam pelo elemento", isCorrect: true },
                        {
                            text: "Acrescentar uma pausa antes de cada verificação",
                            isCorrect: false,
                        },
                        { text: "Rodar o teste várias vezes até ele passar", isCorrect: false },
                        { text: "Desligar o JavaScript durante a execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que um teste instável é pior que nenhum?",
                    difficulty: "dificil",
                    options: [
                        { text: "A equipe aprende a ignorar a suíte vermelha", isCorrect: true },
                        { text: "Ele consome tempo de execução da CI", isCorrect: false },
                        { text: "Ele impede que outros testes sejam escritos", isCorrect: false },
                        { text: "Ele deixa o banco de teste inconsistente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Local CI com bin/ci, novidade do Rails 8.1",
            blocks: [
                {
                    type: "text",
                    value: "# A CI que roda na sua máquina\n\nO conjunto de verificações antes de subir código costuma viver no arquivo do serviço de CI, em YAML. O resultado é que rodar tudo localmente exige lembrar cada comando na ordem certa, e o que roda na sua máquina nunca é exatamente o que roda no servidor.\n\nO **Rails 8.1** trouxe um **CI local declarativo**: um `config/ci.rb` descreve os passos, e `bin/ci` executa a mesma sequência em qualquer lugar.",
                },
                {
                    type: "code",
                    value: "# config/ci.rb\nCI.run do\n  step 'Setup', 'bin/setup --skip-server'\n  step 'Estilo do Ruby', 'bin/rubocop'\n  step 'Segurança das gems', 'bin/bundler-audit'\n  step 'Análise estática', 'bin/brakeman --quiet'\n  step 'Testes', 'bin/rails test'\n  step 'Testes de sistema', 'bin/rails test:system'\nend",
                },
                {
                    type: "code",
                    value: "bin/ci",
                },
                {
                    type: "text",
                    value: '## O ganho\n\nO mesmo arquivo vira a definição para o serviço de CI e para a máquina de quem desenvolve. Não existe mais a divergência entre "passou aqui" e "quebrou no servidor", e quem chega no projeto descobre em um arquivo só o que precisa passar.\n\nO Rails 8.1 já traz na geração os passos de RuboCop, do **Brakeman**, que procura falhas de segurança no código, e do bundler-audit, que confere se alguma gem tem vulnerabilidade conhecida.',
                },
            ],
            questions: [
                {
                    statement: "O que o `config/ci.rb` do Rails 8.1 descreve?",
                    difficulty: "medio",
                    options: [
                        { text: "Os passos de verificação do projeto", isCorrect: true },
                        { text: "As dependências que o projeto precisa", isCorrect: false },
                        { text: "Os ambientes em que ele pode rodar", isCorrect: false },
                        { text: "As rotas que serão testadas na suíte", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema o CI local resolve?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A divergência entre o que roda local e no servidor",
                            isCorrect: true,
                        },
                        { text: "A lentidão dos testes de sistema na suíte", isCorrect: false },
                        { text: "A falta de um serviço de CI contratado", isCorrect: false },
                        {
                            text: "A necessidade de escrever mais testes automatizados",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o Brakeman verifica?",
                    difficulty: "medio",
                    options: [
                        { text: "Falhas de segurança no código", isCorrect: true },
                        { text: "O estilo do código conforme o guia", isCorrect: false },
                        { text: "Se as gems têm vulnerabilidade conhecida", isCorrect: false },
                        { text: "Se os testes cobrem todas as linhas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o bundler-audit confere?",
                    difficulty: "medio",
                    options: [
                        { text: "Se alguma gem tem vulnerabilidade conhecida", isCorrect: true },
                        {
                            text: "Se as gems do projeto estão na versão mais recente",
                            isCorrect: false,
                        },
                        { text: "Se o Gemfile.lock está sincronizado", isCorrect: false },
                        { text: "Se as gems são compatíveis entre si", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando executa a sequência definida?",
                    difficulty: "facil",
                    options: [
                        { text: "bin/ci", isCorrect: true },
                        { text: "bin/rails ci, como subcomando", isCorrect: false },
                        { text: "bin/rails test:all, rodando tudo", isCorrect: false },
                        { text: "bin/setup, que prepara o ambiente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Deploy com Kamal",
            blocks: [
                {
                    type: "text",
                    value: "# Do container ao servidor\n\nO **Kamal** é a ferramenta de deploy que acompanha o Rails 8. Ele constrói a imagem Docker, envia para os servidores, sobe a versão nova sem derrubar a antiga e refaz o caminho se algo falhar.\n\nA proposta é deixar hospedar em uma VPS tão simples quanto usar uma plataforma gerenciada, sem o custo dela.",
                },
                {
                    type: "code",
                    value: "# config/deploy.yml\nservice: loja\nimage: minhaconta/loja\n\nservers:\n  web:\n    - 192.168.0.1\n\nproxy:\n  ssl: true\n  host: loja.com.br\n\nenv:\n  secret:\n    - RAILS_MASTER_KEY\n    - DATABASE_URL",
                },
                {
                    type: "code",
                    value: "kamal setup      # primeira vez: prepara o servidor\nkamal deploy     # constrói, envia e troca a versão\nkamal rollback   # volta para a versão anterior\nkamal app logs -f\nkamal app exec 'bin/rails db:migrate'",
                },
                {
                    type: "text",
                    value: "## Duas mudanças do Rails 8.1\n\nO **Kamal 2.8** passou a usar um **registro local por padrão**, o que dispensa configurar um registro de imagens externo para começar.\n\nE a busca de credenciais por linha de comando permite ao deploy obter os segredos de um gerenciador na hora, em vez de deixá-los em arquivo no servidor.",
                },
                {
                    type: "table",
                    value: '[["Comando", "O que faz"], ["kamal setup", "prepara o servidor na primeira vez"], ["kamal deploy", "publica a versão nova"], ["kamal rollback", "volta para a anterior"], ["kamal app logs", "acompanha os logs"], ["kamal app exec", "roda um comando no container"]]',
                },
            ],
            questions: [
                {
                    statement: "O que o Kamal faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Constrói a imagem e publica nos servidores", isCorrect: true },
                        { text: "Cria os servidores em um provedor de nuvem", isCorrect: false },
                        { text: "Monitora a aplicação depois de publicada", isCorrect: false },
                        { text: "Gera os arquivos de configuração do Nginx", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `kamal rollback` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Volta para a versão anterior", isCorrect: true },
                        { text: "Desfaz a última migration aplicada", isCorrect: false },
                        { text: "Remove a aplicação do servidor", isCorrect: false },
                        { text: "Reinicia o container em execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a proposta do Kamal?",
                    difficulty: "medio",
                    options: [
                        { text: "Tornar a VPS tão simples quanto uma plataforma", isCorrect: true },
                        {
                            text: "Substituir o Docker durante a construção da imagem",
                            isCorrect: false,
                        },
                        { text: "Hospedar a aplicação sem nenhum servidor", isCorrect: false },
                        { text: "Automatizar a criação dos testes de deploy", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no Kamal 2.8?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele passou a usar um registro local por padrão", isCorrect: true },
                        {
                            text: "Ele deixou de precisar do Docker instalado na máquina",
                            isCorrect: false,
                        },
                        { text: "Ele passou a criar os servidores sozinho", isCorrect: false },
                        { text: "Ele trocou o proxy embutido por Nginx", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o Kamal evita derrubar a aplicação no deploy?",
                    difficulty: "dificil",
                    options: [
                        { text: "Sobe a versão nova antes de retirar a antiga", isCorrect: true },
                        {
                            text: "Coloca a aplicação inteira em modo de manutenção",
                            isCorrect: false,
                        },
                        { text: "Faz o deploy fora do horário de pico", isCorrect: false },
                        { text: "Publica em um servidor de cada vez", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Projeto final e para onde ir",
            blocks: [
                {
                    type: "text",
                    value: "# Juntando tudo\n\nPara fechar a trilha, construa um **quadro de tarefas colaborativo**. Ele exercita cada módulo desta trilha:\n\n1. Models de projeto, tarefa e comentário, com migrations e associações\n2. Rotas de recurso, controllers com strong parameters e views em ERB\n3. Validações, escopos e resolução de N+1 com includes\n4. Autenticação pelo gerador nativo, com consultas escopadas pelo usuário\n5. Hotwire: Turbo Frames na edição no lugar e Turbo Streams por difusão nos comentários\n6. Um job em Solid Queue para o resumo diário por email\n7. Testes de model, de integração e um system test do fluxo principal\n8. `bin/ci` verde e deploy com Kamal",
                },
                {
                    type: "text",
                    value: "O item 5 é o que mais ensina: quando um comentário de outra pessoa aparece na sua tela sem recarregar nada, fica claro o que o Hotwire propõe.",
                },
                {
                    type: "text",
                    value: "## Para onde ir depois\n\nRails é vasto, e alguns caminhos naturais a partir daqui:\n\n- **Aprofundar Active Record**: consultas complexas, `explain` e índices\n- **Desempenho**: perfilamento, cache em camadas e o custo real de cada consulta\n- **Rails como API**: modo `--api` com autenticação por token, para aplicativo móvel\n- **Ler o código do Rails**: ele é Ruby legível, e entender como o framework faz o que faz muda a forma de escrever o seu próprio código",
                },
            ],
            questions: [
                {
                    statement: "O que resolve o N+1 no Active Record?",
                    difficulty: "medio",
                    options: [
                        { text: "Carregar as associações com includes", isCorrect: true },
                        { text: "Criar um índice na coluna estrangeira", isCorrect: false },
                        { text: "Guardar a consulta em cache de fragmento", isCorrect: false },
                        { text: "Usar um escopo em vez de where direto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual peça do Hotwire faz o comentário aparecer sem recarregar?",
                    difficulty: "medio",
                    options: [
                        { text: "O Turbo Stream por difusão", isCorrect: true },
                        { text: "O Turbo Frame com o id do comentário", isCorrect: false },
                        { text: "O Stimulus, ouvindo o evento de criação", isCorrect: false },
                        { text: "O Turbo Drive, ao trocar o body da página", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a forma mais simples de autorizar o acesso a um registro?",
                    difficulty: "medio",
                    options: [
                        { text: "Escopar a consulta pelo usuário atual", isCorrect: true },
                        { text: "Comparar o id do dono dentro da view", isCorrect: false },
                        { text: "Criar uma política para cada model do projeto", isCorrect: false },
                        { text: "Usar um middleware antes do controller", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo de teste cobre o fluxo principal com JavaScript?",
                    difficulty: "medio",
                    options: [
                        { text: "O system test", isCorrect: true },
                        { text: "O teste de integração da requisição", isCorrect: false },
                        { text: "O teste de model, com as validações", isCorrect: false },
                        { text: "O teste de job, em segundo plano", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que ler o código-fonte do Rails ajuda?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele é Ruby legível e ensina a escrever melhor", isCorrect: true },
                        { text: "Ele mostra quais gems devem ser instaladas", isCorrect: false },
                        {
                            text: "Ele substitui a leitura da documentação oficial",
                            isCorrect: false,
                        },
                        { text: "Ele permite alterar o framework no projeto", isCorrect: false },
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
                trailLevel: LEVEL,
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + NOME);
    } else {
        const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
        if (existentes.length > 0) {
            console.log("Trilha já tem aulas, nada a fazer: " + NOME);
            return;
        }
        await db
            .update(trails)
            .set({ workloadHours: CARGA_HORARIA, description: DESCRICAO, trailLevel: LEVEL })
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

// Só semeia quando executado direto. Importado, expõe MODULOS/NOME sem rodar nada.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
