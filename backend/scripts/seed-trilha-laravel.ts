// Seed da trilha Laravel (Laravel 13). Conteúdo autoral.
// A versão 13 saiu em março de 2026, exige PHP 8.3 e é a que a trilha ensina:
// atributos do PHP no Eloquent e nos jobs, AI SDK, busca vetorial, JSON:API e Cache::touch.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-laravel.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Laravel";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Laravel 13 do primeiro projeto ao deploy: rotas, controllers e validação, Blade com componentes, Eloquent com migrations e relacionamentos, autenticação com passkeys, gates e policies, APIs com resources e Sanctum, filas, cache, testes com Pest, e as novidades da versão 13 com atributos do PHP, SDK de IA e busca vetorial. O framework PHP mais usado do mundo.";
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
    titulo: "Módulo 1 - O Laravel e o primeiro projeto",
    aulas: [
        {
            titulo: "O que é Laravel e o que ele resolve",
            blocks: [
                {
                    type: "text",
                    value: "# Um framework com tudo dentro\n\nLaravel é um framework PHP criado por Taylor Otwell em 2011. Ele segue a filosofia de **baterias inclusas**: rotas, banco de dados, autenticação, filas, cache, email e testes vêm prontos e conversando entre si.\n\nA alternativa seria montar cada peça com bibliotecas separadas e cuidar da integração. Laravel troca essa liberdade por convenção e velocidade.",
                },
                {
                    type: "text",
                    value: "## O padrão MVC\n\nA organização segue MVC, com uma divisão de responsabilidade que aparece em toda a estrutura de pastas.",
                },
                {
                    type: "table",
                    value: '[["Camada", "Responsabilidade", "Onde fica"], ["Model", "dados e regra de negócio", "app/Models"], ["View", "o que a pessoa vê", "resources/views"], ["Controller", "recebe e responde", "app/Http/Controllers"], ["Route", "liga URL a controller", "routes/web.php"]]',
                },
                {
                    type: "text",
                    value: "## Laravel 13\n\nEsta trilha usa o **Laravel 13**, lançado em 17 de março de 2026. Ele exige **PHP 8.3** no mínimo e traz três novidades grandes: configuração por atributos do PHP, o SDK de IA de primeira parte e busca vetorial nativa.\n\nO release foi desenhado para atualização tranquila: quem vinha do Laravel 12 encontra pouquíssima quebra.",
                },
                {
                    type: "quote",
                    value: "Laravel segue calendário anual: uma versão maior por ano, com correções por cerca de 18 meses e segurança por 24.",
                },
            ],
            questions: [
                {
                    statement: "O que a filosofia de baterias inclusas significa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O framework já traz as peças principais prontas",
                            isCorrect: true,
                        },
                        { text: "O framework roda sem precisar de nenhum banco", isCorrect: false },
                        {
                            text: "As dependências são instaladas em tempo de execução",
                            isCorrect: false,
                        },
                        {
                            text: "O projeto é entregue com o servidor web embutido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a versão mínima de PHP exigida pelo Laravel 13?",
                    difficulty: "medio",
                    options: [
                        { text: "PHP 8.3", isCorrect: true },
                        { text: "PHP 8.0, a mesma exigida pelo Laravel 10", isCorrect: false },
                        { text: "PHP 8.5, a versão mais recente da linguagem", isCorrect: false },
                        { text: "PHP 7.4, para manter a compatibilidade antiga", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam os models em um projeto Laravel?",
                    difficulty: "facil",
                    options: [
                        { text: "Em app/Models", isCorrect: true },
                        { text: "Em resources/models, junto das views", isCorrect: false },
                        { text: "Em database/models, perto das migrations", isCorrect: false },
                        { text: "Em src/Model, seguindo o padrão PSR-4", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a responsabilidade do controller no MVC?",
                    difficulty: "medio",
                    options: [
                        { text: "Receber a requisição e devolver a resposta", isCorrect: true },
                        { text: "Guardar as regras de negócio da aplicação", isCorrect: false },
                        { text: "Montar o HTML que será enviado ao navegador", isCorrect: false },
                        { text: "Definir a estrutura das tabelas do banco", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o Laravel 13 foi lançado?",
                    difficulty: "facil",
                    options: [
                        { text: "Em março de 2026", isCorrect: true },
                        { text: "Em fevereiro de 2025, junto do Laravel 12", isCorrect: false },
                        { text: "Em novembro de 2025, junto do PHP 8.5", isCorrect: false },
                        { text: "Em janeiro de 2026, no começo do ano", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Instalando e criando o primeiro projeto",
            blocks: [
                {
                    type: "text",
                    value: "# O instalador\n\nO caminho oficial é o instalador global do Laravel, que faz mais que criar a pasta: ele pergunta qual starter kit você quer, qual banco usar e já roda as migrations.",
                },
                {
                    type: "code",
                    value: "composer global require laravel/installer\n\nlaravel new blog\n\ncd blog\nphp artisan serve\n# http://localhost:8000",
                },
                {
                    type: "text",
                    value: "## Ambiente completo\n\nPara não instalar PHP, banco e Redis na máquina, existem dois caminhos prontos:\n\n- **Laravel Herd**: aplicativo nativo para macOS e Windows, sem container\n- **Laravel Sail**: ambiente em Docker, definido por um docker-compose gerado pelo próprio framework",
                },
                {
                    type: "code",
                    value: "# Com Sail\nphp artisan sail:install\n./vendor/bin/sail up -d\n./vendor/bin/sail artisan migrate\n\n# Um apelido ajuda muito\nalias sail='./vendor/bin/sail'",
                },
                {
                    type: "text",
                    value: "## O que é criado\n\nO instalador já configura SQLite por padrão, o que permite rodar sem instalar banco nenhum. Trocar para MySQL ou PostgreSQL é uma questão de mudar variáveis no `.env`.",
                },
            ],
            questions: [
                {
                    statement: "O que o comando `laravel new` faz além de criar a pasta?",
                    difficulty: "medio",
                    options: [
                        { text: "Pergunta o starter kit e prepara o banco", isCorrect: true },
                        { text: "Publica o projeto em um servidor de produção", isCorrect: false },
                        { text: "Instala o PHP e o banco de dados na máquina", isCorrect: false },
                        { text: "Cria o repositório Git remoto do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é o Laravel Sail?",
                    difficulty: "medio",
                    options: [
                        { text: "Um ambiente de desenvolvimento em Docker", isCorrect: true },
                        { text: "Um aplicativo nativo para macOS e Windows", isCorrect: false },
                        { text: "O servidor de produção recomendado pelo time", isCorrect: false },
                        { text: "Um gerenciador de versões do PHP instalado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando sobe o servidor de desenvolvimento?",
                    difficulty: "facil",
                    options: [
                        { text: "php artisan serve", isCorrect: true },
                        {
                            text: "php artisan start, no padrão de outros frameworks",
                            isCorrect: false,
                        },
                        { text: "composer run dev, definido no composer.json", isCorrect: false },
                        { text: "laravel serve, pelo instalador global", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual banco o instalador configura por padrão?",
                    difficulty: "medio",
                    options: [
                        { text: "SQLite", isCorrect: true },
                        { text: "MySQL, o mais usado em produção com Laravel", isCorrect: false },
                        { text: "PostgreSQL, por causa da busca vetorial", isCorrect: false },
                        { text: "Nenhum, é preciso escolher antes de criar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre Herd e Sail?",
                    difficulty: "medio",
                    options: [
                        { text: "O Herd é nativo e o Sail usa containers", isCorrect: true },
                        { text: "O Herd só funciona em Linux e o Sail em macOS", isCorrect: false },
                        { text: "O Sail é pago e o Herd é gratuito para todos", isCorrect: false },
                        { text: "O Herd instala em produção e o Sail no local", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "A estrutura de pastas",
            blocks: [
                {
                    type: "text",
                    value: "# Onde cada coisa mora\n\nA estrutura do Laravel é convenção pura: quem conhece um projeto conhece todos. Saber onde procurar poupa muito tempo.",
                },
                {
                    type: "table",
                    value: '[["Pasta", "O que guarda"], ["app/", "o código da aplicação"], ["routes/", "as rotas web, API e console"], ["resources/views/", "os templates Blade"], ["database/", "migrations, seeders e factories"], ["config/", "os arquivos de configuração"], ["public/", "o ponto de entrada e os assets"], ["storage/", "logs, cache e arquivos enviados"], ["tests/", "os testes automatizados"]]',
                },
                {
                    type: "text",
                    value: "## O ponto de entrada\n\nToda requisição entra por `public/index.php`. O servidor web aponta para a pasta `public`, e **só ela** fica exposta. O resto do projeto, incluindo o `.env` com as senhas, fica fora do alcance da web.\n\nApontar o servidor para a raiz do projeto em vez da pasta `public` é uma falha de segurança grave e infelizmente comum.",
                },
                {
                    type: "text",
                    value: "## O bootstrap enxuto\n\nDesde o Laravel 11 a configuração de middleware, exceções e rotas mora em `bootstrap/app.php`, em vez de espalhada por vários arquivos de kernel.",
                },
                {
                    type: "code",
                    value: "return Application::configure(basePath: dirname(__DIR__))\n    ->withRouting(\n        web: __DIR__.'/../routes/web.php',\n        commands: __DIR__.'/../routes/console.php',\n        health: '/up',\n    )\n    ->withMiddleware(function (Middleware $middleware) {\n        $middleware->append(GarantirAssinatura::class);\n    })\n    ->withExceptions(function (Exceptions $exceptions) {\n        //\n    })->create();",
                },
            ],
            questions: [
                {
                    statement: "Qual pasta o servidor web deve apontar?",
                    difficulty: "medio",
                    options: [
                        { text: "public", isCorrect: true },
                        { text: "A raiz do projeto, onde fica o composer.json", isCorrect: false },
                        { text: "A pasta app, onde está o código da aplicação", isCorrect: false },
                        { text: "A pasta resources, com as views do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que apontar o servidor para a raiz é grave?",
                    difficulty: "dificil",
                    options: [
                        { text: "Expõe o .env e o código à web", isCorrect: true },
                        { text: "Faz o site carregar bem mais devagar", isCorrect: false },
                        { text: "Impede que as rotas sejam reconhecidas", isCorrect: false },
                        { text: "Quebra o funcionamento das migrations", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam as migrations?",
                    difficulty: "facil",
                    options: [
                        { text: "Em database/migrations", isCorrect: true },
                        { text: "Em app/Migrations, junto com os models", isCorrect: false },
                        { text: "Em config/database, com a configuração", isCorrect: false },
                        { text: "Em storage/migrations, geradas em execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no bootstrap desde o Laravel 11?",
                    difficulty: "medio",
                    options: [
                        { text: "A configuração ficou em um arquivo só", isCorrect: true },
                        { text: "O ponto de entrada mudou para app.php", isCorrect: false },
                        { text: "As rotas passaram a ser geradas na hora", isCorrect: false },
                        { text: "O bootstrap deixou de existir no projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam os templates Blade?",
                    difficulty: "facil",
                    options: [
                        { text: "Em resources/views", isCorrect: true },
                        { text: "Em public/views, junto dos assets do site", isCorrect: false },
                        { text: "Em app/Views, no código da aplicação", isCorrect: false },
                        { text: "Em templates, na raiz do projeto criado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Artisan e o Tinker",
            blocks: [
                {
                    type: "text",
                    value: "# A linha de comando do framework\n\nO **Artisan** é o console do Laravel. Ele gera código, roda migrations, limpa cache e executa tarefas. `php artisan list` mostra tudo que existe.",
                },
                {
                    type: "code",
                    value: "php artisan make:model Produto -mfsc\n# -m migration, -f factory, -s seeder, -c controller\n\nphp artisan make:controller PedidoController --resource\nphp artisan make:request GuardarPedidoRequest\nphp artisan make:middleware GarantirAssinatura\n\nphp artisan migrate\nphp artisan migrate:fresh --seed\nphp artisan route:list\nphp artisan optimize:clear",
                },
                {
                    type: "text",
                    value: "## Tinker\n\nO `tinker` abre um console com a aplicação carregada. Você conversa com os models, testa uma consulta e inspeciona resultado sem escrever rota nem controller. É a ferramenta mais subestimada do framework.",
                },
                {
                    type: "code",
                    value: 'php artisan tinker\n\n>>> User::count()\n=> 42\n>>> $u = User::factory()->create(["name" => "Ana"])\n>>> $u->posts()->create(["title" => "Primeiro"])\n>>> Produto::where("preco", ">", 100)->pluck("nome")',
                },
                {
                    type: "text",
                    value: "## Comandos próprios\n\nNo Laravel 13 os atributos do PHP substituem as propriedades de configuração, o que deixa o comando mais enxuto.",
                },
                {
                    type: "code",
                    value: "use Illuminate\\Console\\Attributes\\Description;\nuse Illuminate\\Console\\Attributes\\Signature;\n\n#[Signature('relatorio:mensal {mes}')]\n#[Description('Gera o relatório do mês informado')]\nclass RelatorioMensal extends Command\n{\n    public function handle(): int\n    {\n        $this->info('Gerando...');\n        return self::SUCCESS;\n    }\n}",
                },
            ],
            questions: [
                {
                    statement: "O que o Artisan é?",
                    difficulty: "facil",
                    options: [
                        { text: "A ferramenta de linha de comando do Laravel", isCorrect: true },
                        { text: "O gerenciador de dependências do projeto PHP", isCorrect: false },
                        { text: "O motor de templates usado nas views do site", isCorrect: false },
                        { text: "O servidor web que atende as requisições", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `tinker` permite fazer?",
                    difficulty: "medio",
                    options: [
                        { text: "Conversar com a aplicação em um console", isCorrect: true },
                        { text: "Gerar arquivos de código automaticamente", isCorrect: false },
                        { text: "Rodar os testes automatizados do projeto", isCorrect: false },
                        { text: "Publicar a aplicação em um servidor remoto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `php artisan make:model Produto -m` cria além do model?",
                    difficulty: "medio",
                    options: [
                        { text: "A migration da tabela", isCorrect: true },
                        { text: "O controller com os métodos de recurso", isCorrect: false },
                        { text: "A factory para gerar dados de teste", isCorrect: false },
                        { text: "O seeder que popula a tabela criada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando lista todas as rotas registradas?",
                    difficulty: "facil",
                    options: [
                        { text: "php artisan route:list", isCorrect: true },
                        { text: "php artisan routes, no plural do recurso", isCorrect: false },
                        { text: "php artisan list:routes, seguindo o padrão", isCorrect: false },
                        { text: "php artisan show:routes com o filtro", isCorrect: false },
                    ],
                },
                {
                    statement: "O que os atributos trouxeram para comandos no Laravel 13?",
                    difficulty: "medio",
                    options: [
                        { text: "Substituem as propriedades de configuração", isCorrect: true },
                        { text: "Permitem que o comando rode em segundo plano", isCorrect: false },
                        {
                            text: "Fazem o comando ser registrado automaticamente",
                            isCorrect: false,
                        },
                        { text: "Obrigam a declarar o retorno do método handle", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Configuração, .env e ambientes",
            blocks: [
                {
                    type: "text",
                    value: "# Configuração fora do código\n\nO Laravel segue o princípio de que **o que muda entre ambientes fica em variável de ambiente**, não em código. O arquivo `.env` guarda essas variáveis e **nunca vai para o Git**.\n\nO `.env.example`, sem valores reais, é o que vai versionado e serve de referência para quem clona o projeto.",
                },
                {
                    type: "code",
                    value: "APP_NAME=Loja\nAPP_ENV=local\nAPP_KEY=base64:...\nAPP_DEBUG=true\nAPP_URL=http://localhost\n\nDB_CONNECTION=pgsql\nDB_HOST=127.0.0.1\nDB_DATABASE=loja\nDB_USERNAME=postgres\nDB_PASSWORD=segredo\n\nQUEUE_CONNECTION=database\nCACHE_STORE=database",
                },
                {
                    type: "text",
                    value: "## env() só em config\n\nEsta é a regra mais importante e a mais violada: chame `env()` **apenas dentro de arquivos em `config/`**. Em qualquer outro lugar, use `config()`.\n\nO motivo é o cache. Em produção se roda `php artisan config:cache`, e a partir dali o `.env` deixa de ser lido. Um `env()` no controller passa a devolver `null` silenciosamente, e o bug aparece só em produção.",
                },
                {
                    type: "code",
                    value: "// config/servicos.php\nreturn [\n    'gateway' => [\n        'chave' => env('GATEWAY_KEY'),\n        'url' => env('GATEWAY_URL', 'https://api.exemplo.com'),\n    ],\n];\n\n// No controller ou service: sempre config()\n$chave = config('servicos.gateway.chave');",
                },
                {
                    type: "quote",
                    value: "APP_DEBUG=true em produção mostra a stack trace e as variáveis de ambiente na tela do erro. É como credenciais vazam.",
                },
            ],
            questions: [
                {
                    statement: "O arquivo `.env` deve ir para o controle de versão?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, ele guarda segredos", isCorrect: true },
                        { text: "Sim, para todo mundo ter a mesma configuração", isCorrect: false },
                        { text: "Sim, mas apenas o de produção do projeto", isCorrect: false },
                        {
                            text: "Depende de o repositório ser privado ou público",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde `env()` pode ser chamado com segurança?",
                    difficulty: "dificil",
                    options: [
                        { text: "Apenas em arquivos dentro de config", isCorrect: true },
                        { text: "Em qualquer lugar da aplicação, sem restrição", isCorrect: false },
                        { text: "Apenas dentro dos controllers e dos models", isCorrect: false },
                        { text: "Em qualquer lugar, menos dentro das views", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com `env()` depois de `config:cache`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Passa a devolver null fora de config", isCorrect: true },
                        {
                            text: "Continua funcionando normalmente em todo lugar",
                            isCorrect: false,
                        },
                        { text: "Levanta uma exceção avisando do cache ativo", isCorrect: false },
                        { text: "Recarrega o arquivo .env a cada chamada feita", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o risco de `APP_DEBUG=true` em produção?",
                    difficulty: "medio",
                    options: [
                        { text: "Vaza stack trace e variáveis de ambiente", isCorrect: true },
                        { text: "Deixa a aplicação bem mais lenta ao responder", isCorrect: false },
                        { text: "Impede que as filas processem os jobs na fila", isCorrect: false },
                        {
                            text: "Faz o cache de configuração parar de funcionar",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o `.env.example`?",
                    difficulty: "medio",
                    options: [
                        { text: "Servir de referência sem valores reais", isCorrect: true },
                        { text: "Guardar a configuração usada em produção", isCorrect: false },
                        { text: "Ser lido quando o .env não existe no projeto", isCorrect: false },
                        {
                            text: "Listar as variáveis que já foram descontinuadas",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Rotas, controllers e validação",
    aulas: [
        {
            titulo: "Rotas e verbos HTTP",
            blocks: [
                {
                    type: "text",
                    value: "# Ligando URL a código\n\nUma rota associa um verbo HTTP e um caminho a um trecho de código. As rotas de página ficam em `routes/web.php` e as de API em `routes/api.php`.\n\nA diferença não é só organizacional: as rotas web passam por sessão e proteção CSRF; as de API, não.",
                },
                {
                    type: "code",
                    value: "use Illuminate\\Support\\Facades\\Route;\n\nRoute::get('/produtos', [ProdutoController::class, 'index']);\nRoute::post('/produtos', [ProdutoController::class, 'store']);\nRoute::get('/produtos/{produto}', [ProdutoController::class, 'show']);\nRoute::put('/produtos/{produto}', [ProdutoController::class, 'update']);\nRoute::delete('/produtos/{produto}', [ProdutoController::class, 'destroy']);\n\n// As sete rotas REST de uma vez\nRoute::resource('produtos', ProdutoController::class);",
                },
                {
                    type: "table",
                    value: '[["Verbo", "Caminho", "Ação", "Para que serve"], ["GET", "/produtos", "index", "listar"], ["GET", "/produtos/criar", "create", "formulário"], ["POST", "/produtos", "store", "gravar"], ["GET", "/produtos/{id}", "show", "ver um"], ["PUT", "/produtos/{id}", "update", "atualizar"], ["DELETE", "/produtos/{id}", "destroy", "remover"]]',
                },
                {
                    type: "text",
                    value: "## Nomes de rota\n\nDar nome à rota evita espalhar URL pelo código. Se o caminho mudar, só a definição muda.",
                },
                {
                    type: "code",
                    value: "Route::get('/produtos/{produto}', [ProdutoController::class, 'show'])\n    ->name('produtos.show');\n\n// Nas views e controllers\nroute('produtos.show', $produto)\nredirect()->route('produtos.index')",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre routes/web.php e routes/api.php?",
                    difficulty: "medio",
                    options: [
                        { text: "As web têm sessão e proteção CSRF", isCorrect: true },
                        { text: "As de API aceitam apenas o verbo GET e POST", isCorrect: false },
                        { text: "As web são carregadas antes das de API sempre", isCorrect: false },
                        { text: "As de API não podem ter parâmetros na URL", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Route::resource` cria?",
                    difficulty: "medio",
                    options: [
                        { text: "As sete rotas REST de uma vez", isCorrect: true },
                        { text: "Uma rota para cada verbo HTTP existente", isCorrect: false },
                        { text: "Apenas as rotas de leitura do recurso", isCorrect: false },
                        { text: "Um controller com os métodos já escritos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual verbo e ação correspondem a remover um recurso?",
                    difficulty: "facil",
                    options: [
                        { text: "DELETE e destroy", isCorrect: true },
                        { text: "POST e remove, no padrão de formulários", isCorrect: false },
                        { text: "GET e delete, com o id na query string", isCorrect: false },
                        { text: "PUT e destroy, atualizando o registro", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de nomear uma rota?",
                    difficulty: "medio",
                    options: [
                        { text: "A URL fica em um lugar só", isCorrect: true },
                        { text: "A rota passa a responder bem mais rápido", isCorrect: false },
                        { text: "O Laravel gera o controller automaticamente", isCorrect: false },
                        { text: "A rota fica protegida contra acesso externo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual ação corresponde a `GET /produtos`?",
                    difficulty: "facil",
                    options: [
                        { text: "index", isCorrect: true },
                        { text: "show, que exibe um recurso específico", isCorrect: false },
                        { text: "create, que devolve o formulário vazio", isCorrect: false },
                        { text: "store, que grava o recurso no banco", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Parâmetros, grupos e middleware nas rotas",
            blocks: [
                {
                    type: "text",
                    value: "# Parâmetros\n\nChaves na URL viram argumentos do método. Parâmetros opcionais levam interrogação e precisam de valor padrão. Restrições evitam que a rota case com o que não deveria.",
                },
                {
                    type: "code",
                    value: "Route::get('/posts/{post}/comentarios/{comentario}', function (int $post, int $comentario) {\n    //\n});\n\nRoute::get('/usuarios/{nome?}', function (?string $nome = 'visitante') {\n    return \"Olá, {$nome}\";\n});\n\n// Só aceita números\nRoute::get('/produtos/{id}', ...)->whereNumber('id');\nRoute::get('/perfil/{slug}', ...)->where('slug', '[a-z0-9-]+');",
                },
                {
                    type: "text",
                    value: "## Grupos\n\nGrupos aplicam prefixo, middleware, namespace e nome a várias rotas de uma vez. É o que mantém o arquivo de rotas legível quando o projeto cresce.",
                },
                {
                    type: "code",
                    value: "Route::middleware(['auth'])\n    ->prefix('painel')\n    ->name('painel.')\n    ->group(function () {\n        Route::get('/', [PainelController::class, 'index'])->name('index');\n        Route::resource('produtos', ProdutoController::class);\n    });\n\n// Gera /painel e a rota chamada painel.index",
                },
                {
                    type: "text",
                    value: "## Middleware\n\nO middleware fica **entre** a requisição e o controller. Ele pode barrar, alterar ou apenas observar. `auth` é o mais usado: barra quem não está logado antes de o controller rodar.",
                },
                {
                    type: "code",
                    value: "Route::get('/painel', ...)->middleware(['auth', 'verified']);\nRoute::get('/admin', ...)->middleware('can:administrar');\nRoute::post('/contato', ...)->middleware('throttle:5,1');  // 5 por minuto",
                },
            ],
            questions: [
                {
                    statement: "Como se torna um parâmetro de rota opcional?",
                    difficulty: "medio",
                    options: [
                        { text: "Com interrogação e valor padrão", isCorrect: true },
                        { text: "Com colchetes em volta do nome do parâmetro", isCorrect: false },
                        { text: "Declarando duas rotas, com e sem o parâmetro", isCorrect: false },
                        { text: "Com a palavra optional antes do nome dele", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um grupo de rotas permite aplicar de uma vez?",
                    difficulty: "medio",
                    options: [
                        { text: "Prefixo, middleware e nome", isCorrect: true },
                        { text: "Apenas o middleware comum a todas elas", isCorrect: false },
                        { text: "Somente o prefixo do caminho na URL", isCorrect: false },
                        { text: "O controller que atende todas as rotas", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o middleware roda?",
                    difficulty: "medio",
                    options: [
                        { text: "Entre a requisição e o controller", isCorrect: true },
                        { text: "Depois de o controller devolver a resposta", isCorrect: false },
                        { text: "Dentro do controller, no começo do método", isCorrect: false },
                        { text: "Apenas quando uma exceção é levantada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o middleware `throttle:5,1` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Limita a cinco requisições por minuto", isCorrect: true },
                        { text: "Guarda a resposta em cache por cinco minutos", isCorrect: false },
                        { text: "Espera cinco segundos antes de responder", isCorrect: false },
                        {
                            text: "Limita o corpo da requisição a cinco kilobytes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve `whereNumber('id')` em uma rota?",
                    difficulty: "medio",
                    options: [
                        { text: "Só casar quando o parâmetro for numérico", isCorrect: true },
                        {
                            text: "Converter o parâmetro para inteiro no controller",
                            isCorrect: false,
                        },
                        { text: "Validar se o id existe na tabela do banco", isCorrect: false },
                        { text: "Ordenar os resultados pelo campo informado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Controllers e route model binding",
            blocks: [
                {
                    type: "text",
                    value: "# O controller\n\nO controller recebe a requisição, coordena o trabalho e devolve a resposta. Ele deve ser **fino**: regra de negócio pertence ao model ou a uma classe de serviço, não ao controller.",
                },
                {
                    type: "code",
                    value: "class ProdutoController extends Controller\n{\n    public function index()\n    {\n        return view('produtos.index', [\n            'produtos' => Produto::latest()->paginate(15),\n        ]);\n    }\n\n    public function show(Produto $produto)\n    {\n        return view('produtos.show', compact('produto'));\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Route model binding\n\nRepare que `show` recebe um `Produto`, não um id. O Laravel vê o tipo declarado, busca o registro pela chave e **devolve 404 sozinho** se não existir.\n\nIsso elimina o `findOrFail` repetido em todo método e a verificação de nulo.",
                },
                {
                    type: "code",
                    value: "// Sem binding\npublic function show(int $id)\n{\n    $produto = Produto::findOrFail($id);\n    return view('produtos.show', compact('produto'));\n}\n\n// Com binding: o mesmo resultado\npublic function show(Produto $produto)\n{\n    return view('produtos.show', compact('produto'));\n}",
                },
                {
                    type: "text",
                    value: "## Buscando por outra coluna\n\nPara usar slug em vez de id na URL, declare no model qual coluna a rota usa.",
                },
                {
                    type: "code",
                    value: "class Produto extends Model\n{\n    public function getRouteKeyName(): string\n    {\n        return 'slug';\n    }\n}\n\n// Ou direto na rota\nRoute::get('/produtos/{produto:slug}', ...);",
                },
            ],
            questions: [
                {
                    statement: "O que o route model binding faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Busca o registro e injeta no método", isCorrect: true },
                        { text: "Valida os dados enviados no formulário", isCorrect: false },
                        { text: "Cria o registro quando ele não existe", isCorrect: false },
                        { text: "Converte o parâmetro da rota em inteiro", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando o registro não é encontrado no binding?",
                    difficulty: "medio",
                    options: [
                        { text: "O Laravel devolve 404 sozinho", isCorrect: true },
                        { text: "O parâmetro chega ao método com o valor nulo", isCorrect: false },
                        { text: "É levantada uma exceção de tipo inválido", isCorrect: false },
                        { text: "O método é chamado com um objeto vazio", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o controller deve ser fino?",
                    difficulty: "medio",
                    options: [
                        { text: "A regra de negócio pertence a outra camada", isCorrect: true },
                        { text: "Porque ele é recriado a cada requisição nova", isCorrect: false },
                        { text: "Porque o Laravel limita o tamanho dos métodos", isCorrect: false },
                        { text: "Porque ele roda antes de qualquer middleware", isCorrect: false },
                    ],
                },
                {
                    statement: "Como fazer a rota buscar por slug em vez de id?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `getRouteKeyName` no model", isCorrect: true },
                        { text: "Renomeando a coluna id para slug no banco", isCorrect: false },
                        {
                            text: "Passando o slug como segundo parâmetro da rota",
                            isCorrect: false,
                        },
                        { text: "Usando findBySlug dentro do controller", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Produto::latest()->paginate(15)` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma página com quinze registros recentes", isCorrect: true },
                        { text: "Os quinze primeiros registros já cadastrados", isCorrect: false },
                        { text: "Um array simples com todos os produtos", isCorrect: false },
                        { text: "O último produto criado na tabela do banco", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Validação e Form Request",
            blocks: [
                {
                    type: "text",
                    value: "# Validando a entrada\n\nDado que vem do navegador nunca é confiável. O Laravel valida com uma lista de regras e, quando algo falha, **redireciona de volta com os erros e os valores digitados**, sem você escrever nada para isso.",
                },
                {
                    type: "code",
                    value: "public function store(Request $request)\n{\n    $dados = $request->validate([\n        'nome' => ['required', 'string', 'max:255'],\n        'email' => ['required', 'email', 'unique:usuarios,email'],\n        'preco' => ['required', 'numeric', 'min:0'],\n        'categoria_id' => ['required', 'exists:categorias,id'],\n        'tags' => ['array'],\n        'tags.*' => ['string', 'max:30'],\n    ]);\n\n    Produto::create($dados);\n\n    return redirect()->route('produtos.index')\n        ->with('sucesso', 'Produto cadastrado.');\n}",
                },
                {
                    type: "text",
                    value: "## Form Request\n\nQuando as regras crescem ou se repetem, elas ganham uma classe própria. O Form Request valida **antes** de o controller rodar, e junta autorização e validação no mesmo lugar.",
                },
                {
                    type: "code",
                    value: "class GuardarProdutoRequest extends FormRequest\n{\n    public function authorize(): bool\n    {\n        return $this->user()->can('criar-produto');\n    }\n\n    public function rules(): array\n    {\n        return [\n            'nome' => ['required', 'string', 'max:255'],\n            'preco' => ['required', 'numeric', 'min:0'],\n        ];\n    }\n\n    public function messages(): array\n    {\n        return ['preco.min' => 'O preço não pode ser negativo.'];\n    }\n}\n\n// No controller: o tipo declarado já valida\npublic function store(GuardarProdutoRequest $request)\n{\n    Produto::create($request->validated());\n}",
                },
                {
                    type: "quote",
                    value: "Use sempre validated() e nunca all() ao criar registros: validated() devolve só os campos que passaram pelas regras.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece quando a validação falha em uma requisição web?",
                    difficulty: "medio",
                    options: [
                        { text: "O usuário volta com os erros e o que digitou", isCorrect: true },
                        {
                            text: "A aplicação devolve um erro quinhentos ao navegador",
                            isCorrect: false,
                        },
                        {
                            text: "O controller roda mesmo assim com os dados vazios",
                            isCorrect: false,
                        },
                        {
                            text: "A requisição é descartada sem nenhuma resposta",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando o Form Request é validado?",
                    difficulty: "medio",
                    options: [
                        { text: "Antes de o controller rodar", isCorrect: true },
                        { text: "Na primeira linha do método do controller", isCorrect: false },
                        { text: "Depois que o controller devolve a resposta", isCorrect: false },
                        { text: "Apenas quando o método validate é chamado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método do Form Request cuida da autorização?",
                    difficulty: "medio",
                    options: [
                        { text: "authorize", isCorrect: true },
                        { text: "rules, junto com as regras de validação", isCorrect: false },
                        { text: "can, herdado da classe base do framework", isCorrect: false },
                        { text: "policy, ligando o request a uma política", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `validated()` em vez de `all()`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele devolve só os campos que passaram", isCorrect: true },
                        { text: "Ele converte os valores para o tipo correto", isCorrect: false },
                        { text: "Ele executa a validação uma segunda vez", isCorrect: false },
                        { text: "Ele remove os campos nulos do resultado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a regra `exists:categorias,id` verifica?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o valor existe naquela tabela", isCorrect: true },
                        { text: "Que o valor ainda não existe na tabela", isCorrect: false },
                        { text: "Que a tabela categorias tem registros", isCorrect: false },
                        { text: "Que o campo foi enviado no formulário", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Respostas, redirects e tratamento de erros",
            blocks: [
                {
                    type: "text",
                    value: "# Devolvendo a resposta\n\nO controller pode devolver uma view, um redirecionamento, JSON ou um arquivo. O Laravel converte cada retorno na resposta HTTP adequada.",
                },
                {
                    type: "code",
                    value: "return view('produtos.index', compact('produtos'));\n\nreturn redirect()->route('produtos.index');\nreturn redirect()->back()->withErrors(['nome' => 'Já existe']);\nreturn redirect()->route('produtos.show', $produto)\n    ->with('sucesso', 'Salvo com sucesso');\n\nreturn response()->json(['ok' => true], 201);\nreturn response()->download($caminho);\nreturn response()->noContent();  // 204",
                },
                {
                    type: "text",
                    value: "## A sessão flash\n\n`with()` guarda um valor na sessão que vale **apenas para a próxima requisição**. É como mensagens de sucesso sobrevivem ao redirecionamento e desaparecem depois.",
                },
                {
                    type: "code",
                    value: "{{-- Na view --}}\n@if (session('sucesso'))\n    <div class=\"alerta\">{{ session('sucesso') }}</div>\n@endif",
                },
                {
                    type: "text",
                    value: "## Erros\n\nO Laravel transforma exceções em respostas. `abort()` interrompe com um código HTTP, e views em `resources/views/errors` personalizam cada página de erro.",
                },
                {
                    type: "code",
                    value: "abort(404);\nabort(403, 'Você não pode ver este pedido.');\nabort_if($pedido->user_id !== auth()->id(), 403);\nabort_unless($usuario->assinante, 402);\n\n// Personalizar: resources/views/errors/404.blade.php",
                },
            ],
            questions: [
                {
                    statement: "Quanto tempo um valor guardado com `with()` sobrevive?",
                    difficulty: "medio",
                    options: [
                        { text: "Até a próxima requisição", isCorrect: true },
                        { text: "Enquanto a sessão do usuário estiver aberta", isCorrect: false },
                        { text: "Por vinte e quatro horas, como um cookie", isCorrect: false },
                        {
                            text: "Até que ele seja apagado manualmente do código",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `abort(403)` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Interrompe com o código HTTP informado", isCorrect: true },
                        { text: "Registra o erro no log e continua a execução", isCorrect: false },
                        { text: "Redireciona o usuário para a página inicial", isCorrect: false },
                        { text: "Devolve um JSON com a mensagem de erro", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao devolver um array de um controller?",
                    difficulty: "medio",
                    options: [
                        { text: "O Laravel o converte em JSON", isCorrect: true },
                        { text: "O array é impresso como texto simples", isCorrect: false },
                        { text: "É levantada uma exceção de tipo inválido", isCorrect: false },
                        { text: "O array é passado para a view padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam as views que personalizam páginas de erro?",
                    difficulty: "medio",
                    options: [
                        { text: "Em resources/views/errors", isCorrect: true },
                        { text: "Em public/errors, junto dos assets do site", isCorrect: false },
                        { text: "Em app/Exceptions, com o handler de erros", isCorrect: false },
                        { text: "Em config/errors, junto da configuração", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `abort_unless($condicao, 403)` faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Interrompe quando a condição é falsa", isCorrect: true },
                        { text: "Interrompe quando a condição é verdadeira", isCorrect: false },
                        { text: "Registra a condição no log da aplicação", isCorrect: false },
                        { text: "Valida a condição e devolve o resultado", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Blade e a camada de visão",
    aulas: [
        {
            titulo: "Blade: sintaxe e diretivas",
            blocks: [
                {
                    type: "text",
                    value: "# O motor de templates\n\nO **Blade** compila os templates para PHP puro e guarda o resultado em cache. Você escreve uma sintaxe enxuta e o custo em execução é praticamente zero.\n\nA diferença mais importante para o PHP cru: `{{ }}` **escapa a saída automaticamente**, o que fecha a porta do XSS por padrão.",
                },
                {
                    type: "code",
                    value: "{{-- Escapado: o padrão e o certo --}}\n<h1>{{ $produto->nome }}</h1>\n\n{{-- Sem escapar: só para HTML que você mesmo gerou --}}\n<div>{!! $conteudoConfiavel !!}</div>\n\n{{-- Valor padrão quando vazio --}}\n<p>{{ $produto->descricao ?? 'Sem descrição' }}</p>",
                },
                {
                    type: "table",
                    value: '[["Diretiva", "Para que serve"], ["@if, @elseif, @else", "condicional"], ["@foreach, @forelse", "laço, com caso vazio"], ["@auth, @guest", "logado ou não"], ["@can, @cannot", "permissão"], ["@csrf", "campo do token"], ["@method(\'PUT\')", "verbo em formulário"]]',
                },
                {
                    type: "code",
                    value: "@forelse ($produtos as $produto)\n    <li>{{ $produto->nome }} ({{ $loop->iteration }} de {{ $loop->count }})</li>\n@empty\n    <li>Nenhum produto cadastrado.</li>\n@endforelse\n\n@auth\n    <p>Olá, {{ auth()->user()->name }}</p>\n@endauth",
                },
            ],
            questions: [
                {
                    statement: "O que `{{ }}` faz com a saída no Blade?",
                    difficulty: "medio",
                    options: [
                        { text: "Escapa o conteúdo automaticamente", isCorrect: true },
                        { text: "Imprime o conteúdo exatamente como está", isCorrect: false },
                        { text: "Converte o conteúdo para JSON antes de exibir", isCorrect: false },
                        { text: "Executa o conteúdo como código PHP na hora", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar `{!! !!}` em vez de `{{ }}`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Só com HTML que você mesmo gerou", isCorrect: true },
                        { text: "Sempre que o valor tiver acentuação no texto", isCorrect: false },
                        { text: "Quando o valor vier direto do banco de dados", isCorrect: false },
                        { text: "Quando o texto for maior que uma linha", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `@forelse` oferece que `@foreach` não oferece?",
                    difficulty: "medio",
                    options: [
                        { text: "Um bloco para a coleção vazia", isCorrect: true },
                        { text: "A contagem de itens já percorridos", isCorrect: false },
                        { text: "A ordenação automática da coleção", isCorrect: false },
                        { text: "A paginação dos itens exibidos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a variável `$loop` traz dentro de um foreach?",
                    difficulty: "medio",
                    options: [
                        { text: "Informações como posição e total", isCorrect: true },
                        { text: "Uma cópia do item que está sendo percorrido", isCorrect: false },
                        { text: "A coleção completa que está sendo percorrida", isCorrect: false },
                        { text: "A quantidade de laços aninhados no template", isCorrect: false },
                    ],
                },
                {
                    statement: "O Blade custa desempenho em cada requisição?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele é compilado e fica em cache", isCorrect: true },
                        { text: "Sim, o template é interpretado toda vez", isCorrect: false },
                        { text: "Sim, mas só quando há muitas diretivas", isCorrect: false },
                        {
                            text: "Sim, por isso existe o Blade compilado à parte",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Layouts e componentes",
            blocks: [
                {
                    type: "text",
                    value: "# Não repetir a moldura\n\nToda página compartilha cabeçalho, menu e rodapé. O Blade resolve isso de duas formas, e a moderna é por **componentes**.",
                },
                {
                    type: "code",
                    value: "{{-- resources/views/components/layout.blade.php --}}\n<!DOCTYPE html>\n<html lang=\"pt-br\">\n<head>\n    <title>{{ $titulo ?? 'Loja' }}</title>\n    @vite(['resources/css/app.css', 'resources/js/app.js'])\n</head>\n<body>\n    <x-navegacao />\n    <main>{{ $slot }}</main>\n</body>\n</html>",
                },
                {
                    type: "code",
                    value: '{{-- Usando o layout --}}\n<x-layout titulo="Produtos">\n    <h1>Nossos produtos</h1>\n    @foreach ($produtos as $produto)\n        <x-card :produto="$produto" destaque />\n    @endforeach\n</x-layout>',
                },
                {
                    type: "text",
                    value: "## Passando dados\n\nAtributo sem dois-pontos passa **texto literal**. Com dois-pontos, o valor é interpretado como expressão PHP. Atributo sozinho, sem valor, vira `true`.\n\n## Componentes com classe\n\nQuando o componente precisa de lógica, ele ganha uma classe em `app/View/Components`, onde o construtor recebe os atributos.",
                },
                {
                    type: "code",
                    value: "class Card extends Component\n{\n    public function __construct(\n        public Produto $produto,\n        public bool $destaque = false,\n    ) {}\n\n    public function render(): View\n    {\n        return view('components.card');\n    }\n}",
                },
            ],
            questions: [
                {
                    statement: "O que `{{ $slot }}` representa em um componente?",
                    difficulty: "medio",
                    options: [
                        { text: "O conteúdo passado entre as tags", isCorrect: true },
                        { text: "O título definido no atributo do componente", isCorrect: false },
                        { text: "A variável padrão vinda do controller", isCorrect: false },
                        { text: "O nome do arquivo do componente atual", isCorrect: false },
                    ],
                },
                {
                    statement: 'Qual a diferença entre `titulo="X"` e `:titulo="$x"`?',
                    difficulty: "medio",
                    options: [
                        { text: "Os dois-pontos interpretam como PHP", isCorrect: true },
                        { text: "Os dois-pontos tornam o atributo obrigatório", isCorrect: false },
                        { text: "Sem dois-pontos o atributo não é escapado", isCorrect: false },
                        { text: "Com dois-pontos o valor vira uma constante", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um atributo sem valor vira no componente?",
                    difficulty: "dificil",
                    options: [
                        { text: "O booleano true", isCorrect: true },
                        { text: "Uma string vazia dentro do componente", isCorrect: false },
                        { text: "O valor nulo, por não ter sido informado", isCorrect: false },
                        { text: "Um erro avisando que falta o valor", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam as classes de componentes?",
                    difficulty: "medio",
                    options: [
                        { text: "Em app/View/Components", isCorrect: true },
                        { text: "Em resources/views/components apenas", isCorrect: false },
                        { text: "Em app/Http/Components, junto do controller", isCorrect: false },
                        { text: "Em app/Components, na raiz da pasta app", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se chama um componente `card` em uma view?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `<x-card />`", isCorrect: true },
                        { text: "Com `@component('card')` e o fechamento", isCorrect: false },
                        { text: "Com `@include('components.card')`", isCorrect: false },
                        { text: "Com `{{ component('card') }}`", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Formulários, CSRF e o retorno dos erros",
            blocks: [
                {
                    type: "text",
                    value: "# O formulário completo\n\nTodo formulário POST precisa do token CSRF. O `@csrf` gera o campo escondido, e o middleware confere. Sem ele a requisição é recusada com 419.\n\nComo o HTML só entende GET e POST, `@method` gera o campo que o Laravel lê para tratar como PUT ou DELETE.",
                },
                {
                    type: "code",
                    value: '<form method="POST" action="{{ route(\'produtos.update\', $produto) }}">\n    @csrf\n    @method(\'PUT\')\n\n    <label for="nome">Nome</label>\n    <input id="nome" name="nome" value="{{ old(\'nome\', $produto->nome) }}">\n    @error(\'nome\')\n        <span class="erro">{{ $message }}</span>\n    @enderror\n\n    <button>Salvar</button>\n</form>',
                },
                {
                    type: "text",
                    value: "## old() e @error\n\nQuando a validação falha, o Laravel redireciona de volta. `old('campo')` recupera o que a pessoa tinha digitado, e `@error` exibe a mensagem do campo.\n\nSem `old()`, o formulário volta vazio depois de um erro, e quem preencheu tudo perde o trabalho. É o detalhe que mais separa formulário bem feito de formulário irritante.",
                },
                {
                    type: "code",
                    value: "{{-- Todos os erros de uma vez --}}\n@if ($errors->any())\n    <ul>\n        @foreach ($errors->all() as $erro)\n            <li>{{ $erro }}</li>\n        @endforeach\n    </ul>\n@endif",
                },
            ],
            questions: [
                {
                    statement: "O que acontece com um POST sem o campo CSRF?",
                    difficulty: "medio",
                    options: [
                        { text: "A requisição é recusada com 419", isCorrect: true },
                        {
                            text: "O formulário é enviado normalmente ao servidor",
                            isCorrect: false,
                        },
                        {
                            text: "O Laravel gera o token automaticamente no envio",
                            isCorrect: false,
                        },
                        {
                            text: "A validação falha e o usuário volta ao formulário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve `@method('PUT')`?",
                    difficulty: "medio",
                    options: [
                        { text: "Simular o verbo que o HTML não envia", isCorrect: true },
                        {
                            text: "Definir qual método do controller será chamado",
                            isCorrect: false,
                        },
                        { text: "Validar o formulário antes de ele ser enviado", isCorrect: false },
                        { text: "Trocar a rota de destino do formulário", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `old('nome')` recupera?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor digitado antes do erro", isCorrect: true },
                        { text: "O valor que está gravado no banco de dados", isCorrect: false },
                        { text: "O valor padrão definido na migration", isCorrect: false },
                        { text: "O último valor salvo pelo mesmo usuário", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a diretiva `@error` exibe?",
                    difficulty: "facil",
                    options: [
                        { text: "A mensagem de erro daquele campo", isCorrect: true },
                        { text: "Todos os erros de validação do formulário", isCorrect: false },
                        { text: "O erro mais recente da aplicação inteira", isCorrect: false },
                        { text: "O log de exceções do sistema em execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `old()` importa tanto para quem usa o formulário?",
                    difficulty: "dificil",
                    options: [
                        { text: "Sem ele o formulário volta vazio após o erro", isCorrect: true },
                        { text: "Sem ele os erros não aparecem na tela", isCorrect: false },
                        {
                            text: "Sem ele o token CSRF deixa de ser gerado no campo",
                            isCorrect: false,
                        },
                        { text: "Sem ele os campos ficam desabilitados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Starter kits, Vite e assets",
            blocks: [
                {
                    type: "text",
                    value: "# Começando com o básico pronto\n\nOs **starter kits** do Laravel entregam autenticação, cadastro, recuperação de senha, verificação de email e telas de perfil funcionando. Você escolhe a pilha de front-end na criação do projeto.\n\nNo Laravel 13, os kits também expõem `/.well-known/passkey-endpoints`, exigido pela especificação do W3C para que dispositivos Apple descubram as passkeys da aplicação. O endpoint só aparece quando a opção de passkeys é ligada na instalação.",
                },
                {
                    type: "table",
                    value: '[["Pilha", "Como funciona", "Quando escolher"], ["Blade + Livewire", "componentes no servidor", "equipe de back-end"], ["React com Inertia", "SPA sem escrever API", "front-end em React"], ["Vue com Inertia", "SPA sem escrever API", "front-end em Vue"]]',
                },
                {
                    type: "text",
                    value: "## Vite\n\nO **Vite** compila CSS e JavaScript. Em desenvolvimento ele atualiza o navegador na hora; em produção gera arquivos com hash no nome, o que resolve cache antigo de uma vez.",
                },
                {
                    type: "code",
                    value: "npm install\nnpm run dev      # desenvolvimento, com recarga automática\nnpm run build    # produção, com hash nos arquivos\n\n{{-- Na view: a diretiva resolve o caminho certo nos dois casos --}}\n@vite(['resources/css/app.css', 'resources/js/app.js'])",
                },
                {
                    type: "quote",
                    value: "Nunca aponte para o arquivo compilado na mão. A diretiva @vite escolhe o caminho certo em desenvolvimento e em produção.",
                },
            ],
            questions: [
                {
                    statement: "O que um starter kit entrega pronto?",
                    difficulty: "facil",
                    options: [
                        { text: "Autenticação, cadastro e perfil", isCorrect: true },
                        { text: "O banco de dados já modelado e populado", isCorrect: false },
                        { text: "As rotas de API do projeto documentadas", isCorrect: false },
                        { text: "O ambiente de produção configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Inertia permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Fazer uma SPA sem escrever uma API", isCorrect: true },
                        { text: "Rodar componentes React dentro do Blade", isCorrect: false },
                        { text: "Compilar o front-end sem usar o Node", isCorrect: false },
                        { text: "Servir a aplicação sem servidor web", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o Vite põe hash no nome dos arquivos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para o navegador não usar cache antigo", isCorrect: true },
                        { text: "Para dificultar a leitura do código gerado", isCorrect: false },
                        {
                            text: "Para permitir vários arquivos com o mesmo nome",
                            isCorrect: false,
                        },
                        { text: "Para identificar qual versão do Vite gerou", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Laravel 13 acrescentou aos starter kits?",
                    difficulty: "medio",
                    options: [
                        { text: "O endpoint de descoberta de passkeys", isCorrect: true },
                        { text: "A autenticação de dois fatores por mensagem", isCorrect: false },
                        { text: "O painel de administração já pronto", isCorrect: false },
                        { text: "A integração automática com redes sociais", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `@vite` em vez do caminho direto do arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela resolve o caminho nos dois ambientes", isCorrect: true },
                        {
                            text: "Ela compila o arquivo no momento da requisição",
                            isCorrect: false,
                        },
                        { text: "Ela reduz o tamanho do arquivo enviado", isCorrect: false },
                        { text: "Ela escapa o conteúdo antes de servir", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Livewire e Inertia: quando usar cada um",
            blocks: [
                {
                    type: "text",
                    value: "# Interatividade sem virar dois projetos\n\nUma aplicação com muita interação tradicionalmente vira duas: uma API em PHP e um front-end em JavaScript. Livewire e Inertia existem para evitar essa divisão, cada um de um jeito.",
                },
                {
                    type: "text",
                    value: "## Livewire\n\nO componente vive **no servidor**. A interação dispara uma requisição, o servidor recalcula o HTML e devolve só a diferença. Você escreve PHP e quase nenhum JavaScript.",
                },
                {
                    type: "code",
                    value: "class BuscaProdutos extends Component\n{\n    public string $termo = '';\n\n    public function render(): View\n    {\n        return view('livewire.busca-produtos', [\n            'produtos' => Produto::where('nome', 'like', \"%{$this->termo}%\")->get(),\n        ]);\n    }\n}\n\n{{-- A view: cada tecla atualiza a lista --}}\n<input wire:model.live=\"termo\" placeholder=\"Buscar...\">",
                },
                {
                    type: "text",
                    value: "## Inertia\n\nO componente vive **no navegador**, em React, Vue ou Svelte. O controller devolve `Inertia::render` com as props, e o Inertia cuida da navegação sem recarregar a página. Não existe API para escrever nem estado duplicado.",
                },
                {
                    type: "code",
                    value: "public function index()\n{\n    return Inertia::render('Produtos/Index', [\n        'produtos' => Produto::latest()->paginate(15),\n    ]);\n}",
                },
                {
                    type: "table",
                    value: '[["", "Livewire", "Inertia"], ["Onde o componente roda", "servidor", "navegador"], ["Linguagem principal", "PHP", "JavaScript"], ["Ida ao servidor", "a cada interação", "só na navegação"], ["Melhor para", "CRUD e painéis", "interfaces ricas"]]',
                },
            ],
            questions: [
                {
                    statement: "Onde um componente Livewire executa?",
                    difficulty: "medio",
                    options: [
                        { text: "No servidor", isCorrect: true },
                        { text: "No navegador, como um componente React", isCorrect: false },
                        { text: "Nos dois lados, sincronizados a cada mudança", isCorrect: false },
                        { text: "No banco de dados, junto das consultas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Inertia evita escrever?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma API separada para o front-end", isCorrect: true },
                        { text: "Os componentes de interface da aplicação", isCorrect: false },
                        { text: "As rotas e os controllers do projeto", isCorrect: false },
                        { text: "As consultas ao banco de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo do modelo do Livewire?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma ida ao servidor a cada interação", isCorrect: true },
                        { text: "A duplicação do estado entre as duas pontas", isCorrect: false },
                        { text: "A necessidade de compilar o PHP no navegador", isCorrect: false },
                        { text: "A perda do histórico de navegação do browser", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que caso o Inertia se encaixa melhor?",
                    difficulty: "medio",
                    options: [
                        { text: "Interfaces ricas com equipe de front-end", isCorrect: true },
                        {
                            text: "Painéis administrativos simples, com muito CRUD",
                            isCorrect: false,
                        },
                        { text: "Sites estáticos sem nenhuma interação", isCorrect: false },
                        { text: "APIs consumidas por aplicativos móveis", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `wire:model.live` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Sincroniza o campo com o servidor ao digitar", isCorrect: true },
                        { text: "Valida o campo antes de enviar o formulário", isCorrect: false },
                        {
                            text: "Guarda o valor digitado no armazenamento local",
                            isCorrect: false,
                        },
                        {
                            text: "Envia o formulário quando o campo perde o foco",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Eloquent e banco de dados",
    aulas: [
        {
            titulo: "Migrations e o schema",
            blocks: [
                {
                    type: "text",
                    value: "# O banco versionado\n\nUma **migration** descreve uma mudança no banco em código PHP. Ela vai para o Git junto com a aplicação, e qualquer pessoa reconstrói o banco rodando um comando.\n\nO ganho é enorme: fim do arquivo SQL trocado por mensagem e do banco de produção diferente do de desenvolvimento.",
                },
                {
                    type: "code",
                    value: "public function up(): void\n{\n    Schema::create('produtos', function (Blueprint $table) {\n        $table->id();\n        $table->string('nome');\n        $table->string('slug')->unique();\n        $table->text('descricao')->nullable();\n        $table->decimal('preco', 10, 2);\n        $table->foreignId('categoria_id')->constrained();\n        $table->boolean('ativo')->default(true);\n        $table->timestamps();\n        $table->softDeletes();\n    });\n}\n\npublic function down(): void\n{\n    Schema::dropIfExists('produtos');\n}",
                },
                {
                    type: "table",
                    value: '[["Comando", "O que faz"], ["migrate", "aplica o que falta"], ["migrate:rollback", "desfaz o último lote"], ["migrate:fresh", "apaga tudo e aplica de novo"], ["migrate:status", "mostra o que já rodou"]]',
                },
                {
                    type: "text",
                    value: "## Nunca edite uma migration já aplicada\n\nSe a migration já rodou em outro ambiente, editá-la não muda nada lá: o Laravel a considera aplicada. A alteração precisa vir em uma migration nova.\n\nO `migrate:fresh` apaga todas as tabelas. Em produção ele é destrutivo e não deve nem existir no processo de deploy.",
                },
            ],
            questions: [
                {
                    statement: "O que uma migration descreve?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma mudança na estrutura do banco", isCorrect: true },
                        { text: "Os dados iniciais que a tabela vai ter", isCorrect: false },
                        { text: "A consulta que o model executa no banco", isCorrect: false },
                        { text: "A conexão com o servidor de banco de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que não editar uma migration já aplicada?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os ambientes onde ela rodou não recebem a mudança",
                            isCorrect: true,
                        },
                        {
                            text: "O Laravel bloqueia a edição do arquivo depois de salvo",
                            isCorrect: false,
                        },
                        { text: "O arquivo é removido depois de ser aplicado", isCorrect: false },
                        { text: "A edição desfaz a migration automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `migrate:fresh` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Apaga todas as tabelas e aplica de novo", isCorrect: true },
                        { text: "Aplica apenas as migrations que ainda faltam", isCorrect: false },
                        { text: "Desfaz a última migration que foi aplicada", isCorrect: false },
                        { text: "Recria apenas as tabelas que estão vazias", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `$table->timestamps()` cria?",
                    difficulty: "medio",
                    options: [
                        { text: "As colunas de criação e atualização", isCorrect: true },
                        { text: "Uma coluna com a data de exclusão do registro", isCorrect: false },
                        { text: "Um gatilho que registra toda alteração feita", isCorrect: false },
                        { text: "Uma coluna única com a data e a hora atual", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `foreignId('categoria_id')->constrained()` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Cria a coluna e a chave estrangeira", isCorrect: true },
                        { text: "Cria apenas a coluna, sem nenhuma restrição", isCorrect: false },
                        { text: "Cria um índice único na coluna informada", isCorrect: false },
                        { text: "Copia os dados da tabela relacionada", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Models e o básico do Eloquent",
            blocks: [
                {
                    type: "text",
                    value: "# O ORM do Laravel\n\nO **Eloquent** implementa Active Record: cada model representa uma tabela e cada instância uma linha. A convenção liga `Produto` à tabela `produtos` sem configuração.",
                },
                {
                    type: "code",
                    value: "// Criando\n$p = Produto::create(['nome' => 'Caneca', 'preco' => 29.9]);\n\n// Lendo\nProduto::all();\nProduto::find(1);\nProduto::findOrFail(1);\nProduto::where('preco', '<', 100)->orderBy('nome')->get();\nProduto::where('ativo', true)->first();\nProduto::count();\n\n// Atualizando\n$p->update(['preco' => 34.9]);\n\n// Removendo\n$p->delete();",
                },
                {
                    type: "text",
                    value: "## Mass assignment\n\n`create()` e `update()` recebem um array, e sem proteção alguém poderia enviar um campo que não deveria, como `is_admin`. Por isso o Eloquent exige declarar o que é preenchível.",
                },
                {
                    type: "code",
                    value: "class Produto extends Model\n{\n    protected $fillable = ['nome', 'slug', 'preco', 'categoria_id'];\n\n    // Conversão automática de tipos ao ler e gravar\n    protected function casts(): array\n    {\n        return [\n            'ativo' => 'boolean',\n            'preco' => 'decimal:2',\n            'publicado_em' => 'datetime',\n            'configuracao' => 'array',\n        ];\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Coleções\n\nConsultas devolvem uma `Collection`, não um array. Ela traz dezenas de métodos encadeáveis, muito além do que um array oferece.",
                },
                {
                    type: "code",
                    value: "Produto::all()\n    ->filter(fn ($p) => $p->preco > 50)\n    ->sortBy('nome')\n    ->groupBy('categoria_id')\n    ->map->nome;",
                },
            ],
            questions: [
                {
                    statement: "A qual tabela o model `Produto` se liga por convenção?",
                    difficulty: "facil",
                    options: [
                        { text: "produtos", isCorrect: true },
                        { text: "produto, no singular do nome da classe", isCorrect: false },
                        { text: "tb_produtos, com o prefixo padrão", isCorrect: false },
                        { text: "Nenhuma, é preciso declarar sempre", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a propriedade `$fillable` protege?",
                    difficulty: "medio",
                    options: [
                        { text: "Contra atribuição em massa indevida", isCorrect: true },
                        { text: "Contra injeção de SQL nas consultas feitas", isCorrect: false },
                        { text: "Contra a leitura de colunas sensíveis", isCorrect: false },
                        { text: "Contra a exclusão acidental de registros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que os casts fazem em um model?",
                    difficulty: "medio",
                    options: [
                        { text: "Convertem os tipos ao ler e gravar", isCorrect: true },
                        { text: "Validam os valores antes de gravar no banco", isCorrect: false },
                        { text: "Definem os tipos das colunas na migration", isCorrect: false },
                        { text: "Escondem colunas do resultado em JSON", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma consulta Eloquent devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma Collection", isCorrect: true },
                        { text: "Um array simples com os registros", isCorrect: false },
                        { text: "Um objeto de resultado do driver do banco", isCorrect: false },
                        { text: "Um gerador que precisa ser percorrido", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `find` e `findOrFail`?",
                    difficulty: "medio",
                    options: [
                        { text: "O segundo lança exceção quando não acha", isCorrect: true },
                        { text: "O segundo procura em todas as tabelas ligadas", isCorrect: false },
                        { text: "O primeiro só funciona com a chave primária", isCorrect: false },
                        { text: "O primeiro devolve uma coleção de registros", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Atributos do PHP no Eloquent, novidade do Laravel 13",
            blocks: [
                {
                    type: "text",
                    value: "# Configuração na declaração\n\nAté o Laravel 12, configurar um model era preencher propriedades protegidas: `$table`, `$fillable`, `$hidden`, `$connection`. Funciona, mas espalha a configuração em várias propriedades soltas.\n\nO **Laravel 13** introduziu **atributos do PHP** como alternativa. A configuração passa a ficar na declaração da classe, visível de imediato. É adição, não substituição: as propriedades continuam funcionando.",
                },
                {
                    type: "code",
                    value: "use Illuminate\\Database\\Eloquent\\Attributes\\Fillable;\nuse Illuminate\\Database\\Eloquent\\Attributes\\Hidden;\nuse Illuminate\\Database\\Eloquent\\Attributes\\Table;\n\n#[Table('produtos')]\n#[Fillable(['nome', 'slug', 'preco'])]\n#[Hidden(['custo_interno'])]\nclass Produto extends Model\n{\n    //\n}",
                },
                {
                    type: "table",
                    value: '[["Atributo", "Substitui a propriedade"], ["#[Table]", "$table"], ["#[Fillable]", "$fillable"], ["#[Guarded]", "$guarded"], ["#[Hidden] e #[Visible]", "$hidden e $visible"], ["#[Appends]", "$appends"], ["#[Connection]", "$connection"], ["#[Touches]", "$touches"]]',
                },
                {
                    type: "text",
                    value: "## Onde mais os atributos entraram\n\nO Laravel 13 levou os atributos para além do Eloquent: jobs de fila, comandos de console, form requests, resources de API, factories e seeders de teste ganharam versões em atributo.\n\nA escolha entre atributo e propriedade é de estilo. O importante é não misturar as duas formas no mesmo model, o que confunde quem lê depois.",
                },
            ],
            questions: [
                {
                    statement: "O que os atributos do Laravel 13 substituem nos models?",
                    difficulty: "medio",
                    options: [
                        { text: "As propriedades de configuração", isCorrect: true },
                        { text: "Os métodos de relacionamento entre models", isCorrect: false },
                        { text: "As regras de validação dos formulários", isCorrect: false },
                        { text: "Os casts que convertem os tipos das colunas", isCorrect: false },
                    ],
                },
                {
                    statement: "Os atributos são obrigatórios no Laravel 13?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, as propriedades continuam funcionando", isCorrect: true },
                        {
                            text: "Sim, as propriedades foram todas descontinuadas",
                            isCorrect: false,
                        },
                        { text: "Sim, mas apenas em models criados do zero", isCorrect: false },
                        { text: "Sim, exceto quando o model usa herança", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual atributo substitui a propriedade `$hidden`?",
                    difficulty: "medio",
                    options: [
                        { text: "#[Hidden]", isCorrect: true },
                        { text: "#[Guarded], que protege as colunas", isCorrect: false },
                        { text: "#[Invisible], no padrão de nomes antigo", isCorrect: false },
                        { text: "#[Protected], seguindo a visibilidade", isCorrect: false },
                    ],
                },
                {
                    statement: "Além do Eloquent, onde os atributos entraram?",
                    difficulty: "medio",
                    options: [
                        { text: "Em jobs, comandos e form requests", isCorrect: true },
                        { text: "Apenas nas migrations e nos seeders", isCorrect: false },
                        { text: "Somente nas rotas e nos middlewares", isCorrect: false },
                        { text: "Nas views Blade e nos componentes", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que evitar misturar atributos e propriedades no mesmo model?",
                    difficulty: "dificil",
                    options: [
                        { text: "A configuração fica espalhada e confunde", isCorrect: true },
                        { text: "O Laravel ignora a segunda forma encontrada", isCorrect: false },
                        { text: "As duas formas entram em conflito e falham", isCorrect: false },
                        { text: "Os atributos deixam de ser lidos na herança", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Relacionamentos",
            blocks: [
                {
                    type: "text",
                    value: "# Ligando tabelas\n\nO Eloquent expressa relacionamento como método no model. Depois disso, você navega entre os dados como se fossem propriedades.",
                },
                {
                    type: "table",
                    value: '[["Relação", "Método", "Exemplo"], ["um para um", "hasOne e belongsTo", "usuário tem um perfil"], ["um para muitos", "hasMany e belongsTo", "post tem comentários"], ["muitos para muitos", "belongsToMany", "post tem tags"], ["através de", "hasManyThrough", "país tem posts via usuários"], ["polimórfica", "morphMany", "comentário em post ou vídeo"]]',
                },
                {
                    type: "code",
                    value: "class Post extends Model\n{\n    public function usuario(): BelongsTo\n    {\n        return $this->belongsTo(User::class);\n    }\n\n    public function comentarios(): HasMany\n    {\n        return $this->hasMany(Comentario::class);\n    }\n\n    public function tags(): BelongsToMany\n    {\n        return $this->belongsToMany(Tag::class);\n    }\n}\n\n// Usando\n$post->usuario->name;\n$post->comentarios;                      // a coleção\n$post->comentarios()->where('aprovado', true)->get();\n$post->tags()->attach($tag);\n$post->tags()->sync([1, 2, 3]);",
                },
                {
                    type: "text",
                    value: "## Propriedade ou método\n\nEsta distinção confunde no começo:\n\n- `$post->comentarios` é **propriedade** e devolve a coleção já carregada\n- `$post->comentarios()` é **método** e devolve o construtor de consulta, para continuar filtrando",
                },
            ],
            questions: [
                {
                    statement: "Qual método expressa que um post pertence a um usuário?",
                    difficulty: "medio",
                    options: [
                        { text: "belongsTo", isCorrect: true },
                        { text: "hasOne, indicando que ele tem um usuário", isCorrect: false },
                        { text: "hasMany, para a coleção de usuários", isCorrect: false },
                        { text: "belongsToMany, ligando os dois lados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `$post->tags` e `$post->tags()`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O segundo devolve o construtor de consulta", isCorrect: true },
                        {
                            text: "O primeiro executa uma consulta bem mais lenta",
                            isCorrect: false,
                        },
                        {
                            text: "O segundo devolve apenas a quantidade de itens",
                            isCorrect: false,
                        },
                        { text: "O primeiro só funciona em relações simples", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método usar para muitos para muitos?",
                    difficulty: "medio",
                    options: [
                        { text: "belongsToMany", isCorrect: true },
                        { text: "hasManyThrough, passando pela tabela pivô", isCorrect: false },
                        { text: "morphMany, que também liga vários registros", isCorrect: false },
                        { text: "hasMany dos dois lados da relação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `sync([1, 2, 3])` faz em uma relação?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Deixa exatamente esses vínculos e remove o resto",
                            isCorrect: true,
                        },
                        {
                            text: "Acrescenta os três aos vínculos que já existiam antes",
                            isCorrect: false,
                        },
                        { text: "Remove os três dos vínculos existentes", isCorrect: false },
                        { text: "Cria os registros que ainda não existem", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve uma relação polimórfica?",
                    difficulty: "medio",
                    options: [
                        { text: "Ligar um model a mais de um tipo de dono", isCorrect: true },
                        { text: "Ligar dois models pela tabela intermediária", isCorrect: false },
                        { text: "Ligar models que estão em bancos diferentes", isCorrect: false },
                        { text: "Ligar um model a ele mesmo em hierarquia", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Factories, seeders e o problema N+1",
            blocks: [
                {
                    type: "text",
                    value: "# Dados falsos com propósito\n\nA **factory** descreve como gerar um registro de mentira. Ela é essencial em teste e útil para popular o ambiente de desenvolvimento.",
                },
                {
                    type: "code",
                    value: "class ProdutoFactory extends Factory\n{\n    public function definition(): array\n    {\n        return [\n            'nome' => fake()->words(3, true),\n            'slug' => fake()->unique()->slug(),\n            'preco' => fake()->randomFloat(2, 10, 500),\n            'ativo' => true,\n        ];\n    }\n\n    public function inativo(): static\n    {\n        return $this->state(fn () => ['ativo' => false]);\n    }\n}\n\nProduto::factory()->count(50)->create();\nProduto::factory()->inativo()->create();\nUser::factory()->has(Post::factory()->count(3))->create();",
                },
                {
                    type: "text",
                    value: "# O problema N+1\n\nEste é o problema de desempenho mais comum em qualquer ORM. Ao percorrer uma lista acessando uma relação, cada item dispara uma consulta nova.\n\nCem posts viram **101 consultas**: uma para a lista e cem para os autores.",
                },
                {
                    type: "code",
                    value: "// N+1: uma consulta por post dentro do laço\n$posts = Post::all();\nforeach ($posts as $post) {\n    echo $post->usuario->name;\n}\n\n// Eager loading: duas consultas no total\n$posts = Post::with('usuario')->get();\n\n// Várias relações e aninhadas\nPost::with(['usuario', 'comentarios.usuario'])->get();\n\n// Só a contagem, sem carregar os registros\nPost::withCount('comentarios')->get();",
                },
                {
                    type: "quote",
                    value: "Ligue Model::preventLazyLoading() em desenvolvimento: o Laravel passa a lançar exceção quando um N+1 acontece, em vez de deixá-lo passar.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve uma factory?",
                    difficulty: "facil",
                    options: [
                        { text: "Gerar registros de mentira para teste", isCorrect: true },
                        { text: "Criar a estrutura das tabelas no banco", isCorrect: false },
                        { text: "Validar os dados antes de gravar no banco", isCorrect: false },
                        { text: "Definir os relacionamentos entre os models", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza o problema N+1?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma consulta extra por item percorrido", isCorrect: true },
                        { text: "Uma consulta que devolve registros repetidos", isCorrect: false },
                        { text: "Um relacionamento declarado de forma errada", isCorrect: false },
                        { text: "Uma tabela sem índice na chave estrangeira", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se resolve o N+1 no Eloquent?",
                    difficulty: "medio",
                    options: [
                        { text: "Com eager loading, usando `with`", isCorrect: true },
                        { text: "Com um índice na coluna da chave estrangeira", isCorrect: false },
                        {
                            text: "Aumentando o limite de consultas por requisição",
                            isCorrect: false,
                        },
                        { text: "Guardando o resultado da consulta em cache", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas consultas `Post::with('usuario')->get()` faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Duas", isCorrect: true },
                        { text: "Uma para cada post encontrado na tabela", isCorrect: false },
                        { text: "Uma só, com junção entre as duas tabelas", isCorrect: false },
                        { text: "Três, sendo uma para contar os registros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `preventLazyLoading()` faz em desenvolvimento?",
                    difficulty: "medio",
                    options: [
                        { text: "Lança exceção quando ocorre um N+1", isCorrect: true },
                        { text: "Carrega todas as relações automaticamente", isCorrect: false },
                        { text: "Registra as consultas lentas em um arquivo", isCorrect: false },
                        {
                            text: "Desativa o carregamento de relações no projeto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Autenticação e autorização",
    aulas: [
        {
            titulo: "Autenticação: sessão, guards e providers",
            blocks: [
                {
                    type: "text",
                    value: "# Duas perguntas diferentes\n\nEsta distinção organiza o módulo inteiro:\n\n- **Autenticação** responde *quem é você*\n- **Autorização** responde *o que você pode fazer*\n\nSão sistemas separados no Laravel, e confundir os dois leva a código que verifica login onde deveria verificar permissão.",
                },
                {
                    type: "code",
                    value: "// Tentando entrar\nif (Auth::attempt(['email' => $email, 'password' => $senha], $lembrar)) {\n    $request->session()->regenerate();\n    return redirect()->intended('/painel');\n}\n\nreturn back()->withErrors([\n    'email' => 'As credenciais não conferem.',\n])->onlyInput('email');\n\n// Saindo\nAuth::logout();\n$request->session()->invalidate();\n$request->session()->regenerateToken();",
                },
                {
                    type: "text",
                    value: "## Por que regenerar a sessão\n\n`session()->regenerate()` no login e `invalidate()` no logout não são detalhe: sem eles a aplicação fica vulnerável a fixação de sessão, em que o atacante planta um identificador e o reaproveita depois que a vítima entra.",
                },
                {
                    type: "text",
                    value: "## Guards e providers\n\nO **guard** define como o usuário é identificado em cada requisição: por sessão no navegador, por token em API. O **provider** define de onde os usuários vêm, normalmente uma tabela pelo Eloquent.\n\nEssa separação permite ter administradores e clientes em tabelas distintas, cada um com seu guard.",
                },
                {
                    type: "code",
                    value: "// config/auth.php\n'guards' => [\n    'web' => ['driver' => 'session', 'provider' => 'users'],\n    'admin' => ['driver' => 'session', 'provider' => 'admins'],\n],\n\n// Usando um guard específico\nAuth::guard('admin')->attempt($credenciais);\nRoute::middleware('auth:admin')->group(...);",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre autenticação e autorização?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma diz quem é, a outra diz o que pode", isCorrect: true },
                        { text: "Uma vale para web e a outra apenas para API", isCorrect: false },
                        { text: "Uma usa sessão e a outra usa sempre token", isCorrect: false },
                        {
                            text: "Uma roda no middleware e a outra no controller",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que chamar `session()->regenerate()` no login?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para evitar fixação de sessão", isCorrect: true },
                        {
                            text: "Para que o usuário permaneça logado por mais tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Para limpar os dados antigos guardados na sessão",
                            isCorrect: false,
                        },
                        { text: "Para gerar o token CSRF do próximo formulário", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um guard define?",
                    difficulty: "medio",
                    options: [
                        { text: "Como o usuário é identificado na requisição", isCorrect: true },
                        {
                            text: "Quais permissões o usuário tem dentro do sistema",
                            isCorrect: false,
                        },
                        { text: "De qual tabela os usuários são carregados", isCorrect: false },
                        { text: "Quanto tempo a sessão permanece válida", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um provider define?",
                    difficulty: "medio",
                    options: [
                        { text: "De onde os usuários vêm", isCorrect: true },
                        { text: "Como a senha é criptografada no banco", isCorrect: false },
                        {
                            text: "Quais rotas exigem que o usuário esteja logado",
                            isCorrect: false,
                        },
                        { text: "Qual middleware roda antes da autenticação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `redirect()->intended()` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Leva à página que o usuário tentou abrir", isCorrect: true },
                        { text: "Leva sempre à página inicial da aplicação", isCorrect: false },
                        {
                            text: "Leva à página anterior no histórico do navegador",
                            isCorrect: false,
                        },
                        { text: "Leva ao painel definido na configuração", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Passkeys e autenticação sem senha",
            blocks: [
                {
                    type: "text",
                    value: "# O problema da senha\n\nSenha é reutilizada entre sites, vaza em incidente e cai em phishing. As **passkeys** atacam a raiz disso: em vez de um segredo compartilhado, usam um par de chaves criptográficas.\n\nA chave privada nunca sai do dispositivo, e o servidor guarda só a pública. Não há o que vazar de útil, e phishing não funciona porque a chave é vinculada ao domínio.",
                },
                {
                    type: "table",
                    value: '[["", "Senha", "Passkey"], ["O servidor guarda", "hash do segredo", "a chave pública"], ["Risco de vazamento", "alto", "sem valor para o atacante"], ["Phishing", "funciona", "não funciona"], ["Reuso entre sites", "comum", "impossível"]]',
                },
                {
                    type: "text",
                    value: "## No Laravel 13\n\nOs starter kits trazem passkeys como opção na instalação. Quando ligada, a aplicação passa a expor `/.well-known/passkey-endpoints`, exigido pela especificação do W3C. Sem esse endpoint, dispositivos Apple não descobrem corretamente as passkeys do site.\n\nO fluxo tem duas etapas, ambas com desafio aleatório: **registro**, que grava a chave pública, e **autenticação**, em que o dispositivo assina o desafio e o servidor confere com a chave guardada.",
                },
                {
                    type: "quote",
                    value: "Mantenha um segundo caminho de entrada ao adotar passkey. Quem perde o dispositivo sem alternativa perde a conta.",
                },
            ],
            questions: [
                {
                    statement: "O que o servidor guarda em uma autenticação por passkey?",
                    difficulty: "medio",
                    options: [
                        { text: "A chave pública do usuário", isCorrect: true },
                        { text: "O hash da senha escolhida no cadastro", isCorrect: false },
                        { text: "A chave privada, protegida por criptografia", isCorrect: false },
                        { text: "O dispositivo autorizado a fazer o acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que phishing não funciona com passkey?",
                    difficulty: "dificil",
                    options: [
                        { text: "A chave é vinculada ao domínio original", isCorrect: true },
                        { text: "O usuário não digita nada durante o acesso", isCorrect: false },
                        { text: "O navegador bloqueia sites desconhecidos", isCorrect: false },
                        { text: "A chave expira poucos segundos após o uso", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `/.well-known/passkey-endpoints`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permitir que dispositivos descubram as passkeys",
                            isCorrect: true,
                        },
                        {
                            text: "Guardar as chaves públicas de todos os usuários",
                            isCorrect: false,
                        },
                        { text: "Validar o desafio enviado pelo servidor", isCorrect: false },
                        { text: "Listar os dispositivos já autorizados", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando esse endpoint é incluído no projeto?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando passkeys são ligadas na instalação", isCorrect: true },
                        { text: "Sempre, em qualquer projeto do Laravel 13", isCorrect: false },
                        { text: "Apenas quando o projeto usa o Inertia", isCorrect: false },
                        { text: "Depois de publicar as rotas de autenticação", isCorrect: false },
                    ],
                },
                {
                    statement: "Que cuidado tomar ao adotar passkey?",
                    difficulty: "medio",
                    options: [
                        { text: "Manter um segundo caminho de entrada", isCorrect: true },
                        { text: "Exigir senha forte junto com a passkey", isCorrect: false },
                        { text: "Registrar a passkey em todos os navegadores", isCorrect: false },
                        { text: "Trocar a chave pública a cada trinta dias", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Middleware próprio",
            blocks: [
                {
                    type: "text",
                    value: "# Interceptando a requisição\n\nUm middleware envolve o ciclo da requisição. Ele decide se ela segue, altera a requisição ou mexe na resposta depois que o controller termina.",
                },
                {
                    type: "code",
                    value: "class GarantirAssinatura\n{\n    public function handle(Request $request, Closure $next): Response\n    {\n        if (! $request->user()?->assinaturaAtiva()) {\n            return redirect()->route('planos')\n                ->with('aviso', 'Este recurso é para assinantes.');\n        }\n\n        return $next($request);\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Antes e depois\n\nO código antes do `$next($request)` roda **antes** do controller. O que vem depois roda com a resposta já pronta, o que serve para acrescentar cabeçalho ou medir tempo.",
                },
                {
                    type: "code",
                    value: "public function handle(Request $request, Closure $next): Response\n{\n    $inicio = microtime(true);\n\n    $response = $next($request);   // o controller roda aqui\n\n    $duracao = microtime(true) - $inicio;\n    $response->headers->set('X-Duracao', (string) $duracao);\n\n    return $response;\n}",
                },
                {
                    type: "text",
                    value: "## Registrando\n\nDesde o Laravel 11 o registro fica em `bootstrap/app.php`. Você pode aplicar a todas as rotas, criar um apelido ou usar a classe direto na rota.",
                },
                {
                    type: "code",
                    value: "->withMiddleware(function (Middleware $middleware) {\n    $middleware->append(GarantirCabecalhos::class);   // todas as rotas\n    $middleware->alias(['assinante' => GarantirAssinatura::class]);\n})\n\n// Na rota\nRoute::get('/relatorios', ...)->middleware('assinante');",
                },
            ],
            questions: [
                {
                    statement: "O que `$next($request)` faz em um middleware?",
                    difficulty: "medio",
                    options: [
                        { text: "Passa a requisição adiante na cadeia", isCorrect: true },
                        { text: "Encerra a requisição devolvendo a resposta", isCorrect: false },
                        { text: "Reinicia o ciclo desde o primeiro middleware", isCorrect: false },
                        { text: "Cria uma nova requisição a partir da atual", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde fica o código que roda depois do controller?",
                    difficulty: "medio",
                    options: [
                        { text: "Depois da chamada a `$next`", isCorrect: true },
                        { text: "Antes da chamada, no começo do handle", isCorrect: false },
                        { text: "Em um método separado chamado terminate", isCorrect: false },
                        { text: "Em um middleware registrado por último", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde os middlewares são registrados desde o Laravel 11?",
                    difficulty: "medio",
                    options: [
                        { text: "Em bootstrap/app.php", isCorrect: true },
                        { text: "No arquivo app/Http/Kernel.php do projeto", isCorrect: false },
                        { text: "Em config/middleware.php, junto do resto", isCorrect: false },
                        { text: "Diretamente no arquivo de rotas do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um middleware pode fazer com a requisição?",
                    difficulty: "medio",
                    options: [
                        { text: "Barrar, alterar ou deixar seguir", isCorrect: true },
                        { text: "Apenas registrar informações em um log", isCorrect: false },
                        { text: "Apenas barrar quem não estiver autenticado", isCorrect: false },
                        { text: "Apenas alterar os cabeçalhos da resposta", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve dar um apelido a um middleware?",
                    difficulty: "facil",
                    options: [
                        { text: "Usá-lo pelo nome curto nas rotas", isCorrect: true },
                        { text: "Aplicá-lo automaticamente em todas as rotas", isCorrect: false },
                        { text: "Executá-lo antes dos demais middlewares", isCorrect: false },
                        { text: "Permitir que ele receba parâmetros na rota", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Gates e Policies",
            blocks: [
                {
                    type: "text",
                    value: "# Onde a permissão mora\n\nO Laravel oferece duas formas de autorizar, e a escolha depende de a regra girar em torno de um model ou não.\n\n- **Gate**: uma função solta, para permissão que não pertence a um model\n- **Policy**: uma classe por model, com um método por ação",
                },
                {
                    type: "code",
                    value: "// Gate: registrado em um service provider\nGate::define('ver-relatorios', function (User $user) {\n    return $user->cargo === 'gerente';\n});\n\n// Usando\nif (Gate::allows('ver-relatorios')) { }\nGate::authorize('ver-relatorios');   // lança 403 se negar",
                },
                {
                    type: "code",
                    value: "class PostPolicy\n{\n    public function view(?User $user, Post $post): bool\n    {\n        return $post->publicado || $user?->id === $post->user_id;\n    }\n\n    public function update(User $user, Post $post): bool\n    {\n        return $user->id === $post->user_id;\n    }\n\n    public function delete(User $user, Post $post): bool\n    {\n        return $user->id === $post->user_id || $user->admin;\n    }\n\n    // Roda antes de tudo: admin passa direto\n    public function before(User $user, string $ability): ?bool\n    {\n        return $user->admin ? true : null;\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Usando em cada camada\n\nA mesma policy responde no controller, na view e na rota, o que evita a regra duplicada em três lugares diferentes.",
                },
                {
                    type: "code",
                    value: "// No controller\n$this->authorize('update', $post);\n\n// Na view: esconde o que a pessoa não pode fazer\n@can('update', $post)\n    <a href=\"{{ route('posts.edit', $post) }}\">Editar</a>\n@endcan\n\n// Na rota\nRoute::put('/posts/{post}', ...)->middleware('can:update,post');",
                },
                {
                    type: "quote",
                    value: "Esconder o botão na view é experiência, não segurança. A verificação no controller é o que realmente protege.",
                },
            ],
            questions: [
                {
                    statement: "Quando usar Policy em vez de Gate?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando a regra gira em torno de um model", isCorrect: true },
                        { text: "Quando a regra vale para o sistema inteiro", isCorrect: false },
                        { text: "Quando a verificação acontece só na view", isCorrect: false },
                        { text: "Quando existe mais de um guard configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o método `before` de uma policy faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Roda antes e pode liberar tudo de uma vez", isCorrect: true },
                        { text: "Prepara os dados que os outros métodos usam", isCorrect: false },
                        { text: "Valida os argumentos recebidos pela policy", isCorrect: false },
                        { text: "Registra a tentativa de acesso em um log", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Gate::authorize` faz quando a permissão é negada?",
                    difficulty: "medio",
                    options: [
                        { text: "Lança uma exceção que vira 403", isCorrect: true },
                        { text: "Devolve falso para o código continuar", isCorrect: false },
                        { text: "Redireciona para a página de login", isCorrect: false },
                        { text: "Registra o erro e permite o acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Esconder o botão com `@can` é suficiente para proteger a ação?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, é preciso verificar no servidor", isCorrect: true },
                        { text: "Sim, o usuário não consegue clicar no botão", isCorrect: false },
                        { text: "Sim, desde que a rota também tenha nome", isCorrect: false },
                        { text: "Sim, o Blade bloqueia a requisição sozinho", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantos métodos uma policy costuma ter?",
                    difficulty: "medio",
                    options: [
                        { text: "Um para cada ação do model", isCorrect: true },
                        { text: "Um só, que recebe a ação como argumento", isCorrect: false },
                        { text: "Dois, um para leitura e outro para escrita", isCorrect: false },
                        { text: "Nenhum fixo, ela usa apenas o before", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "As defesas que o framework já dá",
            blocks: [
                {
                    type: "text",
                    value: "# Segurança por padrão\n\nBoa parte das falhas clássicas já vem fechada no Laravel. Vale saber **quais** e, principalmente, o que ainda desliga cada proteção sem querer.",
                },
                {
                    type: "table",
                    value: '[["Ataque", "A defesa do Laravel", "O que ainda abre a porta"], ["SQL injection", "consultas preparadas no Eloquent", "usar DB::raw com entrada do usuário"], ["XSS", "escape automático do Blade", "usar {!! !!} com dado externo"], ["CSRF", "middleware e token", "excluir a rota da verificação"], ["Mass assignment", "fillable e guarded", "guarded vazio no model"], ["Senha em texto", "hash automático no cast", "gravar sem passar pelo Hash"]]',
                },
                {
                    type: "code",
                    value: "// Perigoso: concatena entrada do usuário\nDB::select(\"SELECT * FROM users WHERE nome = '{$request->nome}'\");\n\n// Seguro: mesmo em consulta crua, use vínculo\nDB::select('SELECT * FROM users WHERE nome = ?', [$request->nome]);\n\n// Perigoso: abre o model inteiro para atribuição em massa\nprotected $guarded = [];\n\n// Seguro\nprotected $fillable = ['nome', 'email'];",
                },
                {
                    type: "text",
                    value: "## Senhas\n\nO model `User` já converte a senha em hash pelo cast, então `bcrypt()` manual costuma ser redundante. O algoritmo padrão é o bcrypt, configurável para argon2 em `config/hashing.php`.\n\n## Limitando tentativas\n\nO middleware `throttle` protege login e formulários públicos contra força bruta e abuso.",
                },
                {
                    type: "code",
                    value: "Route::post('/login', ...)->middleware('throttle:5,1');\n\n// Limite por usuário em vez de por IP\nRateLimiter::for('api', fn (Request $r) =>\n    Limit::perMinute(60)->by($r->user()?->id ?: $r->ip())\n);",
                },
            ],
            questions: [
                {
                    statement: "O que ainda deixa a aplicação vulnerável a SQL injection?",
                    difficulty: "medio",
                    options: [
                        { text: "Concatenar entrada do usuário em consulta crua", isCorrect: true },
                        { text: "Usar o Eloquent para montar as consultas", isCorrect: false },
                        {
                            text: "Declarar todas as colunas na propriedade fillable",
                            isCorrect: false,
                        },
                        { text: "Escapar a saída nas views com chaves duplas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `protected $guarded = []` faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Abre todas as colunas para atribuição em massa", isCorrect: true },
                        {
                            text: "Protege todas as colunas contra a atribuição em massa",
                            isCorrect: false,
                        },
                        { text: "Desativa a validação dos dados enviados", isCorrect: false },
                        { text: "Esconde as colunas ao converter para JSON", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o Blade protege contra XSS?",
                    difficulty: "medio",
                    options: [
                        { text: "Escapando a saída de `{{ }}`", isCorrect: true },
                        { text: "Removendo todas as tags HTML do conteúdo", isCorrect: false },
                        { text: "Validando o conteúdo antes de exibir na tela", isCorrect: false },
                        { text: "Bloqueando scripts pelo cabeçalho da resposta", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se converte a senha em hash no model User?",
                    difficulty: "medio",
                    options: [
                        { text: "Pelo cast, que já vem configurado", isCorrect: true },
                        { text: "Chamando bcrypt manualmente antes de gravar", isCorrect: false },
                        { text: "Por um gatilho criado na migration da tabela", isCorrect: false },
                        {
                            text: "Pelo middleware que trata o formulário de login",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o middleware `throttle` no login?",
                    difficulty: "medio",
                    options: [
                        { text: "Limitar tentativas e conter força bruta", isCorrect: true },
                        { text: "Validar as credenciais antes do controller", isCorrect: false },
                        { text: "Registrar cada tentativa de acesso em log", isCorrect: false },
                        { text: "Bloquear acessos vindos de fora do país", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - APIs, filas e cache",
    aulas: [
        {
            titulo: "API resources e JSON:API",
            blocks: [
                {
                    type: "text",
                    value: "# Controlando o que a API devolve\n\nDevolver o model direto expõe toda coluna, incluindo o que não deveria sair, e prende o formato da resposta à estrutura da tabela. O **API Resource** é a camada que traduz model em resposta.",
                },
                {
                    type: "code",
                    value: "class ProdutoResource extends JsonResource\n{\n    public function toArray(Request $request): array\n    {\n        return [\n            'id' => $this->id,\n            'nome' => $this->nome,\n            'preco' => (float) $this->preco,\n            'categoria' => CategoriaResource::make($this->whenLoaded('categoria')),\n            'criado_em' => $this->created_at->toIso8601String(),\n            'custo' => $this->when($request->user()?->admin, $this->custo_interno),\n        ];\n    }\n}\n\n// No controller\nreturn ProdutoResource::collection(\n    Produto::with('categoria')->paginate(15)\n);",
                },
                {
                    type: "text",
                    value: "`whenLoaded` só inclui a relação se ela foi carregada, o que evita N+1 escondido dentro do resource. `when` inclui o campo apenas quando a condição é verdadeira.\n\n## JSON:API no Laravel 13\n\nO **JSON:API** é uma especificação que padroniza o formato de resposta: onde ficam os dados, as relações, os links e os erros. Ela resolve a discussão de formato que toda equipe repete.\n\nO Laravel 13 trouxe **resources JSON:API de primeira parte**, cuidando da serialização, da inclusão de relações, dos campos esparsos, dos links e dos cabeçalhos exigidos.",
                },
                {
                    type: "quote",
                    value: "Campos esparsos deixam o cliente pedir só as colunas que quer, o que reduz tráfego sem precisar de um endpoint novo.",
                },
            ],
            questions: [
                {
                    statement: "Qual o problema de devolver o model direto na API?",
                    difficulty: "medio",
                    options: [
                        { text: "Expõe colunas e prende o formato à tabela", isCorrect: true },
                        { text: "Deixa a resposta bem mais lenta ao serializar", isCorrect: false },
                        { text: "Impede o uso de paginação nos resultados", isCorrect: false },
                        { text: "Quebra a validação dos dados de entrada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `whenLoaded` evita em um resource?",
                    difficulty: "dificil",
                    options: [
                        { text: "Disparar um N+1 ao serializar a relação", isCorrect: true },
                        { text: "Devolver campos nulos para o cliente da API", isCorrect: false },
                        {
                            text: "Carregar o resource duas vezes na mesma resposta",
                            isCorrect: false,
                        },
                        { text: "Expor a relação para usuários sem permissão", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a especificação JSON:API padroniza?",
                    difficulty: "medio",
                    options: [
                        { text: "O formato de dados, relações, links e erros", isCorrect: true },
                        { text: "A forma de autenticar as requisições da API", isCorrect: false },
                        { text: "O limite de requisições por minuto permitido", isCorrect: false },
                        { text: "A versão do protocolo HTTP a ser usada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Laravel 13 acrescentou quanto a JSON:API?",
                    difficulty: "medio",
                    options: [
                        { text: "Resources de primeira parte no framework", isCorrect: true },
                        { text: "Um pacote externo recomendado pela equipe", isCorrect: false },
                        { text: "A conversão automática de todo resource", isCorrect: false },
                        { text: "Uma nova versão da especificação do formato", isCorrect: false },
                    ],
                },
                {
                    statement: "O que são campos esparsos?",
                    difficulty: "dificil",
                    options: [
                        { text: "O cliente pede só os campos que quer", isCorrect: true },
                        {
                            text: "Campos que ficam nulos na maior parte do tempo",
                            isCorrect: false,
                        },
                        { text: "Campos que só aparecem para administradores", isCorrect: false },
                        { text: "Campos calculados que não existem na tabela", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Autenticação de API com Sanctum",
            blocks: [
                {
                    type: "text",
                    value: "# Dois cenários, uma ferramenta\n\nO **Sanctum** atende os dois casos mais comuns de API sem a complexidade do OAuth:\n\n- **Token de API**: para aplicativo móvel ou integração de terceiro\n- **SPA no mesmo domínio**: usa cookie de sessão, sem token nenhum",
                },
                {
                    type: "code",
                    value: "// Emitindo um token com escopos\n$token = $usuario->createToken('app-movel', ['pedidos:ler'])->plainTextToken;\n\n// O cliente envia no cabeçalho\n// Authorization: Bearer 1|abc123...\n\nRoute::middleware('auth:sanctum')->group(function () {\n    Route::get('/pedidos', [PedidoController::class, 'index']);\n});\n\n// Verificando o escopo\nif ($request->user()->tokenCan('pedidos:ler')) { }\n\n// Revogando\n$usuario->tokens()->delete();               // todos\n$request->user()->currentAccessToken()->delete();   // só o atual",
                },
                {
                    type: "text",
                    value: "## O token só aparece uma vez\n\n`plainTextToken` é a única oportunidade de ver o valor: o banco guarda apenas o hash. Se o cliente perder, o caminho é emitir outro e revogar o anterior.\n\n## SPA no mesmo domínio\n\nNesse modo o Sanctum usa a sessão normal, com cookie `HttpOnly`. É mais seguro que guardar token em `localStorage`, que fica exposto a qualquer XSS na página.",
                },
                {
                    type: "code",
                    value: "// O cliente busca o cookie CSRF antes do login\naxios.get('/sanctum/csrf-cookie').then(() => {\n    axios.post('/login', { email, password });\n});",
                },
            ],
            questions: [
                {
                    statement: "Quais dois cenários o Sanctum atende?",
                    difficulty: "medio",
                    options: [
                        { text: "Token de API e SPA no mesmo domínio", isCorrect: true },
                        { text: "Login social e autenticação de dois fatores", isCorrect: false },
                        { text: "Sessão web e autenticação por certificado", isCorrect: false },
                        { text: "OAuth completo e chaves de acesso fixas", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas vezes o valor do token pode ser lido?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma só, na criação", isCorrect: true },
                        { text: "Quantas vezes quiser, consultando o banco", isCorrect: false },
                        { text: "Duas, na criação e na primeira autenticação", isCorrect: false },
                        { text: "Enquanto o token estiver dentro da validade", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o modo SPA é mais seguro que guardar token no navegador?",
                    difficulty: "dificil",
                    options: [
                        { text: "O cookie HttpOnly não é lido por JavaScript", isCorrect: true },
                        {
                            text: "O cookie é criptografado com uma chave rotativa",
                            isCorrect: false,
                        },
                        {
                            text: "A sessão expira em poucos minutos de inatividade",
                            isCorrect: false,
                        },
                        {
                            text: "O token guardado ocupa espaço no armazenamento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `tokenCan` verifica?",
                    difficulty: "medio",
                    options: [
                        { text: "Se o token tem determinado escopo", isCorrect: true },
                        { text: "Se o token ainda está dentro da validade", isCorrect: false },
                        { text: "Se o usuário do token está ativo no sistema", isCorrect: false },
                        { text: "Se o token foi emitido pelo mesmo domínio", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o banco guarda do token emitido?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o hash dele", isCorrect: true },
                        { text: "O valor completo, para poder ser reenviado", isCorrect: false },
                        {
                            text: "O valor criptografado com a chave da aplicação",
                            isCorrect: false,
                        },
                        { text: "Apenas os escopos, sem guardar o valor", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Filas e jobs",
            blocks: [
                {
                    type: "text",
                    value: "# Tirando o lento do caminho\n\nEnviar email, gerar PDF ou chamar uma API externa dentro da requisição faz o usuário esperar por algo que não precisa acontecer agora. A **fila** empurra esse trabalho para segundo plano e a resposta sai na hora.",
                },
                {
                    type: "code",
                    value: "use Illuminate\\Queue\\Attributes\\Backoff;\nuse Illuminate\\Queue\\Attributes\\Queue;\nuse Illuminate\\Queue\\Attributes\\Tries;\n\n#[Queue('emails')]\n#[Tries(3)]\n#[Backoff([10, 30, 60])]\nclass EnviarBoasVindas implements ShouldQueue\n{\n    use Queueable;\n\n    public function __construct(public User $usuario) {}\n\n    public function handle(): void\n    {\n        Mail::to($this->usuario)->send(new BoasVindas($this->usuario));\n    }\n\n    public function failed(?Throwable $e): void\n    {\n        Log::error('Falhou o email de boas-vindas', ['id' => $this->usuario->id]);\n    }\n}\n\n// Despachando\nEnviarBoasVindas::dispatch($usuario);\nEnviarBoasVindas::dispatch($usuario)->delay(now()->addMinutes(10));",
                },
                {
                    type: "text",
                    value: "Os atributos `#[Queue]`, `#[Tries]` e `#[Backoff]` são a forma do **Laravel 13**, no lugar das propriedades `$queue`, `$tries` e `$backoff`.\n\n## O worker\n\nA fila só anda se houver um processo consumindo. Em produção ele fica sob um supervisor que o reinicia se cair.",
                },
                {
                    type: "code",
                    value: "php artisan queue:work --queue=emails,padrao --tries=3\nphp artisan queue:failed          # lista as que falharam\nphp artisan queue:retry all       # tenta de novo\n\n# Depois de todo deploy, para o worker recarregar o código\nphp artisan queue:restart",
                },
                {
                    type: "quote",
                    value: "O worker carrega o código na memória ao subir. Sem queue:restart no deploy, ele segue rodando a versão antiga por tempo indefinido.",
                },
            ],
            questions: [
                {
                    statement: "Qual o ganho de mandar um trabalho para a fila?",
                    difficulty: "facil",
                    options: [
                        { text: "A resposta ao usuário sai na hora", isCorrect: true },
                        { text: "O trabalho passa a ser executado mais rápido", isCorrect: false },
                        { text: "O servidor consome bem menos memória no total", isCorrect: false },
                        { text: "O trabalho deixa de poder falhar na execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o atributo `#[Tries(3)]` define?",
                    difficulty: "medio",
                    options: [
                        { text: "Quantas tentativas o job terá", isCorrect: true },
                        { text: "Quantos jobs rodam ao mesmo tempo na fila", isCorrect: false },
                        { text: "Quantos segundos ele espera antes de rodar", isCorrect: false },
                        { text: "Quantas filas diferentes ele pode usar", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que rodar `queue:restart` no deploy?",
                    difficulty: "dificil",
                    options: [
                        { text: "O worker segue com o código antigo em memória", isCorrect: true },
                        {
                            text: "A fila precisa ser esvaziada antes de cada deploy",
                            isCorrect: false,
                        },
                        { text: "Os jobs pendentes são perdidos sem o comando", isCorrect: false },
                        { text: "O comando recria a tabela de jobs no banco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o método `failed` de um job faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Roda quando todas as tentativas se esgotam", isCorrect: true },
                        {
                            text: "Roda a cada tentativa do job que não deu certo",
                            isCorrect: false,
                        },
                        { text: "Impede que o job seja tentado de novo", isCorrect: false },
                        { text: "Registra o job na lista de pendentes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece se não houver worker rodando?",
                    difficulty: "medio",
                    options: [
                        { text: "Os jobs ficam parados na fila", isCorrect: true },
                        { text: "Eles são executados na própria requisição", isCorrect: false },
                        { text: "Eles são descartados depois de um tempo", isCorrect: false },
                        { text: "A aplicação recusa novos despachos de job", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Cache e o Cache::touch do Laravel 13",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando o que custa caro\n\nCache troca processamento por memória: o resultado caro é calculado uma vez e reaproveitado. O Laravel abstrai vários drivers pela mesma interface, então trocar de Redis para banco é mudar uma variável no `.env`.",
                },
                {
                    type: "code",
                    value: "Cache::put('produtos.destaque', $produtos, now()->addHour());\nCache::get('produtos.destaque');\nCache::forget('produtos.destaque');\n\n// Calcula só se não estiver em cache\n$produtos = Cache::remember('produtos.destaque', 3600, function () {\n    return Produto::where('destaque', true)->with('categoria')->get();\n});\n\n// Sem expiração\nCache::rememberForever('config.taxas', fn () => Taxa::all());",
                },
                {
                    type: "text",
                    value: "## Cache::touch, novidade do Laravel 13\n\nEstender a validade de um item exigia buscar o valor e gravá-lo de novo, o que trafega o dado inteiro entre a aplicação e o servidor de cache sem necessidade.\n\nO **Laravel 13** trouxe `Cache::touch()`, que **estende o TTL sem buscar nem regravar o valor**. Em item grande a diferença é grande, e é exatamente o que se quer em sessão ativa ou trava distribuída.",
                },
                {
                    type: "code",
                    value: "// Antes: puxava e regravava o valor inteiro\n$valor = Cache::get($chave);\nCache::put($chave, $valor, now()->addHour());\n\n// Laravel 13: só o prazo muda\nCache::touch($chave, now()->addHour());",
                },
                {
                    type: "text",
                    value: "## Invalidação\n\nA parte difícil de cache não é guardar, é saber quando descartar. Duas estratégias funcionam bem: apagar a chave no evento que muda o dado, ou pôr um identificador de versão na própria chave.",
                },
                {
                    type: "code",
                    value: "// Apagar no evento do model\nprotected static function booted(): void\n{\n    static::saved(fn () => Cache::forget('produtos.destaque'));\n    static::deleted(fn () => Cache::forget('produtos.destaque'));\n}\n\n// Ou versionar a chave\nCache::remember(\"produto.{$id}.v{$produto->updated_at->timestamp}\", 3600, ...);",
                },
            ],
            questions: [
                {
                    statement: "O que `Cache::remember` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve do cache ou calcula e guarda", isCorrect: true },
                        { text: "Guarda o valor sem nunca deixá-lo expirar", isCorrect: false },
                        { text: "Apaga a chave depois de ela ser lida uma vez", isCorrect: false },
                        { text: "Renova o prazo de validade a cada leitura", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Cache::touch` do Laravel 13 faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Estende o prazo sem buscar o valor", isCorrect: true },
                        { text: "Cria a chave quando ela ainda não existe", isCorrect: false },
                        { text: "Verifica se a chave está presente no cache", isCorrect: false },
                        { text: "Copia a chave para outro driver configurado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o ganho do `touch` em um item grande?",
                    difficulty: "dificil",
                    options: [
                        { text: "Evita trafegar o valor de ida e volta", isCorrect: true },
                        { text: "Diminui o espaço ocupado pelo item no cache", isCorrect: false },
                        { text: "Permite guardar o item por tempo indefinido", isCorrect: false },
                        { text: "Comprime o valor antes de gravá-lo de novo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a parte difícil de trabalhar com cache?",
                    difficulty: "medio",
                    options: [
                        { text: "Saber quando descartar o que está guardado", isCorrect: true },
                        { text: "Escolher o driver certo para cada ambiente", isCorrect: false },
                        { text: "Definir o tempo de expiração de cada chave", isCorrect: false },
                        { text: "Serializar objetos complexos antes de guardar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que versionar a chave com `updated_at` resolve?",
                    difficulty: "dificil",
                    options: [
                        { text: "A chave muda sozinha quando o dado muda", isCorrect: true },
                        { text: "O cache passa a ocupar bem menos memória", isCorrect: false },
                        { text: "As chaves antigas são apagadas na hora", isCorrect: false },
                        { text: "O valor é recalculado a cada requisição", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Events, listeners e notificações",
            blocks: [
                {
                    type: "text",
                    value: "# Desacoplando o que acontece depois\n\nQuando um pedido é criado, várias coisas precisam acontecer: email ao cliente, aviso ao estoque, registro no relatório. Pôr tudo no controller o transforma em um emaranhado que cresce a cada regra nova.\n\nO **evento** anuncia que algo aconteceu. Os **listeners** reagem, sem que quem disparou saiba quem está ouvindo.",
                },
                {
                    type: "code",
                    value: "class PedidoCriado\n{\n    use Dispatchable, SerializesModels;\n\n    public function __construct(public Pedido $pedido) {}\n}\n\nclass EnviarConfirmacao implements ShouldQueue\n{\n    public function handle(PedidoCriado $evento): void\n    {\n        Mail::to($evento->pedido->cliente)->send(new Confirmacao($evento->pedido));\n    }\n}\n\n// No controller: uma linha, e o resto acontece\nPedidoCriado::dispatch($pedido);",
                },
                {
                    type: "text",
                    value: "Um listener que implementa `ShouldQueue` vai para a fila sozinho. O controller devolve a resposta e o trabalho pesado acontece depois.\n\n## Notificações\n\nA **notificação** é uma mensagem com vários canais possíveis: email, banco de dados, Slack, SMS. A mesma classe escolhe por onde vai, e o usuário pode ter preferências.",
                },
                {
                    type: "code",
                    value: "class PedidoEnviado extends Notification implements ShouldQueue\n{\n    use Queueable;\n\n    public function __construct(public Pedido $pedido) {}\n\n    public function via(object $notifiable): array\n    {\n        return $notifiable->prefere_email ? ['mail', 'database'] : ['database'];\n    }\n\n    public function toMail(object $notifiable): MailMessage\n    {\n        return (new MailMessage)\n            ->subject('Seu pedido saiu para entrega')\n            ->line(\"O pedido {$this->pedido->numero} está a caminho.\")\n            ->action('Acompanhar', route('pedidos.show', $this->pedido));\n    }\n\n    public function toArray(object $notifiable): array\n    {\n        return ['pedido_id' => $this->pedido->id];\n    }\n}\n\n$usuario->notify(new PedidoEnviado($pedido));",
                },
            ],
            questions: [
                {
                    statement: "Que problema o sistema de eventos resolve?",
                    difficulty: "medio",
                    options: [
                        { text: "O acúmulo de responsabilidades no controller", isCorrect: true },
                        { text: "A lentidão das consultas feitas ao banco", isCorrect: false },
                        {
                            text: "A duplicação de rotas que apontam o mesmo caminho",
                            isCorrect: false,
                        },
                        { text: "A falta de validação nos dados recebidos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece quando um listener implementa `ShouldQueue`?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele passa a rodar em segundo plano", isCorrect: true },
                        { text: "Ele é executado antes dos outros listeners", isCorrect: false },
                        { text: "Ele é executado uma vez a cada minuto", isCorrect: false },
                        { text: "Ele passa a ignorar as falhas silenciosamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o método `via` de uma notificação define?",
                    difficulty: "medio",
                    options: [
                        { text: "Por quais canais ela será enviada", isCorrect: true },
                        { text: "Qual template de email será usado no envio", isCorrect: false },
                        { text: "Quando a notificação deve ser disparada", isCorrect: false },
                        { text: "Quais usuários vão receber a mensagem", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem dispara o evento sabe quem vai reagir a ele?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, e essa é a vantagem", isCorrect: true },
                        { text: "Sim, os listeners são informados na chamada", isCorrect: false },
                        { text: "Sim, o evento carrega a lista de ouvintes", isCorrect: false },
                        { text: "Depende de o listener estar em uma fila", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o canal `database` de uma notificação faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Grava a notificação em uma tabela", isCorrect: true },
                        { text: "Envia um email usando o servidor configurado", isCorrect: false },
                        { text: "Guarda a mensagem no cache da aplicação", isCorrect: false },
                        { text: "Publica a mensagem em uma fila de eventos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Testes, IA e produção",
    aulas: [
        {
            titulo: "Testes com Pest e PHPUnit",
            blocks: [
                {
                    type: "text",
                    value: "# Testar é rápido no Laravel\n\nO framework traz uma base de teste com banco de teste, autenticação simulada e asserções de HTTP. Escrever teste no Laravel custa pouco, o que remove a desculpa mais comum para não escrever.\n\nO **PHPUnit** é a base, e o **Pest** é uma camada por cima com sintaxe enxuta. Os dois rodam juntos no mesmo projeto.",
                },
                {
                    type: "code",
                    value: "// Pest\nit('lista os produtos ativos', function () {\n    Produto::factory()->count(3)->create(['ativo' => true]);\n    Produto::factory()->create(['ativo' => false]);\n\n    $this->get('/produtos')\n        ->assertOk()\n        ->assertViewHas('produtos', fn ($p) => $p->count() === 3);\n});\n\nit('impede que outro usuário edite o post', function () {\n    $post = Post::factory()->create();\n    $intruso = User::factory()->create();\n\n    $this->actingAs($intruso)\n        ->put(\"/posts/{$post->id}\", ['titulo' => 'invadido'])\n        ->assertForbidden();\n});",
                },
                {
                    type: "table",
                    value: '[["Asserção", "Verifica"], ["assertOk e assertStatus", "o código HTTP da resposta"], ["assertRedirect", "para onde redirecionou"], ["assertSee", "que o texto aparece na página"], ["assertDatabaseHas", "que a linha existe no banco"], ["assertForbidden", "que o acesso foi negado"]]',
                },
                {
                    type: "text",
                    value: "## RefreshDatabase\n\nA trait `RefreshDatabase` roda cada teste dentro de uma transação e desfaz tudo ao final. Assim um teste nunca deixa lixo para o próximo, e a ordem de execução deixa de importar.",
                },
            ],
            questions: [
                {
                    statement: "Qual a relação entre Pest e PHPUnit?",
                    difficulty: "medio",
                    options: [
                        { text: "O Pest é uma camada sobre o PHPUnit", isCorrect: true },
                        { text: "São ferramentas concorrentes e incompatíveis", isCorrect: false },
                        { text: "O PHPUnit é uma extensão do Pest no Laravel", isCorrect: false },
                        { text: "O Pest substitui o PHPUnit por completo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `RefreshDatabase` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Desfaz as mudanças ao fim de cada teste", isCorrect: true },
                        { text: "Recria o banco inteiro antes de cada teste", isCorrect: false },
                        { text: "Copia o banco de produção para o de teste", isCorrect: false },
                        { text: "Popula o banco com os seeders do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `actingAs($usuario)` faz em um teste?",
                    difficulty: "medio",
                    options: [
                        { text: "Executa a requisição como aquele usuário", isCorrect: true },
                        { text: "Cria um usuário novo no banco de teste", isCorrect: false },
                        { text: "Verifica se o usuário consegue fazer login", isCorrect: false },
                        { text: "Concede todas as permissões ao usuário", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `assertDatabaseHas` verifica?",
                    difficulty: "facil",
                    options: [
                        { text: "Que a linha existe na tabela", isCorrect: true },
                        { text: "Que a tabela informada existe no banco", isCorrect: false },
                        { text: "Que a consulta devolveu algum resultado", isCorrect: false },
                        { text: "Que a conexão com o banco está ativa", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a ordem dos testes deixa de importar com RefreshDatabase?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cada teste começa com o banco no mesmo estado", isCorrect: true },
                        { text: "Os testes passam a rodar todos em paralelo", isCorrect: false },
                        {
                            text: "O framework ordena os testes por ordem alfabética",
                            isCorrect: false,
                        },
                        { text: "Os dados criados ficam isolados por usuário", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O Laravel AI SDK",
            blocks: [
                {
                    type: "text",
                    value: "# IA como parte do framework\n\nAté o Laravel 12, integrar um modelo de linguagem significava escolher um pacote da comunidade e amarrar o código ao provedor escolhido. Trocar de provedor depois era reescrever.\n\nO **Laravel 13** trouxe o **AI SDK de primeira parte**: uma API única para geração de texto, agentes que chamam ferramentas, embeddings, áudio, imagens e integração com bancos vetoriais.",
                },
                {
                    type: "table",
                    value: '[["Recurso do SDK", "Para que serve"], ["Geração de texto", "resumir, classificar, redigir"], ["Agentes com ferramentas", "o modelo chama funções suas"], ["Embeddings", "transformar texto em vetor"], ["Áudio e imagem", "transcrever e gerar"], ["Vector stores", "guardar e buscar por embedding"]]',
                },
                {
                    type: "text",
                    value: "## O ganho da API única\n\nComo a interface é do framework e não do provedor, trocar de modelo é configuração. O código da aplicação continua igual, e dá para comparar provedores sem reescrever nada.\n\n## O que não muda\n\nO SDK facilita a chamada, não os cuidados. Continua valendo tratar a saída do modelo como **entrada não confiável**: validar antes de gravar, escapar antes de exibir, e nunca deixar o modelo decidir sozinho uma ação irreversível.",
                },
                {
                    type: "quote",
                    value: "Chamada a modelo é lenta e pode falhar. Mande para a fila e trate o tempo esgotado, como você faria com qualquer API externa.",
                },
            ],
            questions: [
                {
                    statement: "O que o Laravel AI SDK trouxe no Laravel 13?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma API única do framework para IA", isCorrect: true },
                        { text: "Um modelo de linguagem embutido no framework", isCorrect: false },
                        { text: "A substituição dos pacotes da comunidade", isCorrect: false },
                        { text: "Um painel para treinar modelos próprios", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem da API ser do framework?",
                    difficulty: "medio",
                    options: [
                        { text: "Trocar de provedor vira configuração", isCorrect: true },
                        { text: "As respostas do modelo ficam mais precisas", isCorrect: false },
                        { text: "O custo por requisição diminui bastante", isCorrect: false },
                        { text: "O modelo passa a rodar no próprio servidor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que são embeddings?",
                    difficulty: "medio",
                    options: [
                        { text: "Texto transformado em vetor numérico", isCorrect: true },
                        { text: "Trechos de texto guardados em cache", isCorrect: false },
                        { text: "Instruções fixas enviadas ao modelo", isCorrect: false },
                        { text: "Respostas prontas para perguntas comuns", isCorrect: false },
                    ],
                },
                {
                    statement: "Como tratar a saída de um modelo de linguagem?",
                    difficulty: "dificil",
                    options: [
                        { text: "Como entrada não confiável", isCorrect: true },
                        { text: "Como dado já validado pelo provedor", isCorrect: false },
                        { text: "Como HTML pronto para ser exibido", isCorrect: false },
                        { text: "Como valor constante que pode ir ao banco", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que mandar chamadas de IA para a fila?",
                    difficulty: "medio",
                    options: [
                        { text: "Elas são lentas e podem falhar", isCorrect: true },
                        { text: "As filas reduzem o custo de cada chamada", isCorrect: false },
                        { text: "O SDK só funciona dentro de um job", isCorrect: false },
                        { text: "Assim as respostas ficam guardadas em cache", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Busca vetorial e semântica",
            blocks: [
                {
                    type: "text",
                    value: '# Buscar por sentido, não por palavra\n\nA busca tradicional casa **caracteres**: procurar por "sapato" não encontra "calçado". A busca semântica compara **significado**, e para isso o texto vira um vetor de números, o embedding.\n\nTextos com sentido parecido ficam próximos nesse espaço, e a busca vira uma questão de encontrar os vetores mais próximos do vetor da pergunta.',
                },
                {
                    type: "table",
                    value: '[["", "Busca por texto", "Busca semântica"], ["Compara", "caracteres e palavras", "significado"], ["Acha sinônimo", "não", "sim"], ["Erro de digitação", "atrapalha", "tolera bem"], ["Custo", "baixo", "gera embedding e compara vetores"]]',
                },
                {
                    type: "text",
                    value: "## No Laravel 13\n\nO Laravel 13 trouxe **suporte nativo a consulta vetorial**, com fluxo de embeddings e busca por similaridade. A base recomendada é **PostgreSQL com a extensão pgvector**, e dá para gerar o embedding a partir de uma string e buscar por similaridade sem sair do framework.\n\n## Quando usar cada uma\n\nBusca semântica não substitui a tradicional: ela custa mais e não é boa em correspondência exata, como código de produto ou CPF. O padrão que funciona é **híbrido**, combinando as duas e ordenando pelos dois sinais.",
                },
                {
                    type: "quote",
                    value: "Embedding tem validade: se o texto do registro mudar, o vetor precisa ser gerado de novo, senão a busca aponta para o conteúdo antigo.",
                },
            ],
            questions: [
                {
                    statement: "O que a busca semântica compara?",
                    difficulty: "medio",
                    options: [
                        { text: "O significado do texto", isCorrect: true },
                        { text: "Os caracteres presentes nas duas frases", isCorrect: false },
                        { text: "A quantidade de palavras em comum", isCorrect: false },
                        { text: "A ordem exata em que as palavras aparecem", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual banco o Laravel 13 recomenda para busca vetorial?",
                    difficulty: "medio",
                    options: [
                        { text: "PostgreSQL com pgvector", isCorrect: true },
                        { text: "MySQL com a extensão de texto completo", isCorrect: false },
                        { text: "SQLite, que já vem no projeto criado", isCorrect: false },
                        { text: "Redis, pela velocidade em memória", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que caso a busca tradicional continua melhor?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em correspondência exata, como um código", isCorrect: true },
                        { text: "Quando o usuário digita palavras com erro", isCorrect: false },
                        { text: "Quando existem muitos sinônimos possíveis", isCorrect: false },
                        { text: "Quando a base tem milhões de registros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece se o texto mudar e o embedding não for regerado?",
                    difficulty: "dificil",
                    options: [
                        { text: "A busca passa a apontar para o conteúdo antigo", isCorrect: true },
                        {
                            text: "A consulta vetorial deixa de devolver resultado",
                            isCorrect: false,
                        },
                        { text: "O banco recalcula o vetor automaticamente", isCorrect: false },
                        { text: "O registro some dos resultados da busca", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é uma busca híbrida?",
                    difficulty: "medio",
                    options: [
                        { text: "Combinar a busca por texto e a semântica", isCorrect: true },
                        { text: "Buscar em dois bancos de dados diferentes", isCorrect: false },
                        { text: "Alternar entre as duas conforme o horário", isCorrect: false },
                        { text: "Usar dois modelos de embedding ao mesmo tempo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Preparando para produção",
            blocks: [
                {
                    type: "text",
                    value: "# Os comandos de otimização\n\nEm desenvolvimento o Laravel relê configuração, rotas e views a cada requisição, o que é ótimo para trabalhar e ruim para servir. Em produção tudo isso vira cache.",
                },
                {
                    type: "code",
                    value: "php artisan optimize\n# equivale a config:cache, route:cache, view:cache e event:cache\n\ncomposer install --no-dev --optimize-autoloader\nnpm run build\nphp artisan migrate --force\nphp artisan queue:restart\n\n# Para desfazer o cache\nphp artisan optimize:clear",
                },
                {
                    type: "text",
                    value: "## O que quebra com o cache ligado\n\nDuas armadilhas conhecidas:\n\n- `env()` fora de `config/` devolve `null` depois de `config:cache`\n- `route:cache` não funciona com rota que usa closure. Toda rota precisa apontar para um controller",
                },
                {
                    type: "table",
                    value: '[["Configuração", "Em produção"], ["APP_DEBUG", "false, sem exceção"], ["APP_ENV", "production"], ["Servidor apontando para", "a pasta public"], ["Fila", "worker sob supervisor"], ["Agendador", "uma entrada de cron por minuto"]]',
                },
                {
                    type: "text",
                    value: "## O agendador\n\nO Laravel tem agendamento próprio, definido em código. O sistema operacional só precisa de **uma** entrada de cron chamando o `schedule:run` a cada minuto, e o framework decide o que roda.",
                },
                {
                    type: "code",
                    value: "// routes/console.php\nSchedule::command('relatorio:diario')->dailyAt('03:00');\nSchedule::job(new LimparTemporarios)->hourly();\nSchedule::command('backup:run')->weekly()->withoutOverlapping();\n\n# No cron do servidor, uma linha só\n* * * * * cd /var/www/app && php artisan schedule:run >> /dev/null 2>&1",
                },
            ],
            questions: [
                {
                    statement: "O que `php artisan optimize` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Gera cache de configuração, rotas e views", isCorrect: true },
                        {
                            text: "Compila o PHP do projeto para código de máquina",
                            isCorrect: false,
                        },
                        { text: "Remove os pacotes de desenvolvimento", isCorrect: false },
                        { text: "Otimiza as consultas feitas ao banco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que impede o uso de `route:cache`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Rotas que usam closure em vez de controller", isCorrect: true },
                        { text: "Rotas que recebem parâmetros na URL", isCorrect: false },
                        { text: "Rotas registradas dentro de um grupo", isCorrect: false },
                        {
                            text: "Rotas que estejam protegidas por algum middleware",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantas entradas de cron o agendador do Laravel precisa?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma, chamando schedule:run por minuto", isCorrect: true },
                        { text: "Uma para cada tarefa agendada no projeto", isCorrect: false },
                        { text: "Nenhuma, o framework agenda por conta própria", isCorrect: false },
                        { text: "Duas, uma para as filas e outra para tarefas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual deve ser o valor de `APP_DEBUG` em produção?",
                    difficulty: "facil",
                    options: [
                        { text: "false", isCorrect: true },
                        { text: "true, para facilitar achar os problemas", isCorrect: false },
                        { text: "O mesmo valor usado em desenvolvimento", isCorrect: false },
                        { text: "Depende de a aplicação ser pública ou interna", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `withoutOverlapping` em uma tarefa agendada?",
                    difficulty: "dificil",
                    options: [
                        { text: "Impedir que ela rode em cima de si mesma", isCorrect: true },
                        {
                            text: "Impedir que duas tarefas rodem no mesmo minuto",
                            isCorrect: false,
                        },
                        { text: "Garantir que ela rode mesmo se falhar antes", isCorrect: false },
                        { text: "Executá-la em uma fila separada das outras", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Deploy e o projeto final",
            blocks: [
                {
                    type: "text",
                    value: "# Colocando no ar\n\nO deploy de uma aplicação Laravel segue sempre a mesma sequência, e automatizá-la evita o passo esquecido que derruba o site.",
                },
                {
                    type: "code",
                    value: 'php artisan down --render="errors::503"\n\ngit pull origin main\ncomposer install --no-dev --optimize-autoloader\nnpm ci && npm run build\nphp artisan migrate --force\nphp artisan optimize\nphp artisan queue:restart\n\nphp artisan up',
                },
                {
                    type: "text",
                    value: "## As opções de hospedagem\n\n- **Laravel Cloud** e **Forge**: soluções oficiais, cuidam de servidor, filas e certificado\n- **VPS com Nginx e PHP-FPM**: mais barato e mais trabalho\n- **Docker**: reprodutível, e é o caminho para orquestração\n\nEm qualquer uma, o essencial é o mesmo: apontar o servidor para `public`, ter worker de fila supervisionado e o cron do agendador.",
                },
                {
                    type: "text",
                    value: "## O projeto final\n\nPara fechar a trilha, construa uma **loja simples** que exercite cada módulo:\n\n1. Migrations e models para produtos, categorias e pedidos\n2. Rotas de recurso com Form Requests validando a entrada\n3. Views em Blade com componentes e um layout compartilhado\n4. Autenticação por starter kit, com policies protegendo o painel\n5. Uma API de produtos com resources e autenticação por Sanctum\n6. Email de confirmação de pedido em fila, disparado por evento\n7. Testes cobrindo o fluxo de compra e as regras de permissão\n\nCada item corresponde a um módulo desta trilha.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve `php artisan down`?",
                    difficulty: "facil",
                    options: [
                        { text: "Pôr a aplicação em manutenção", isCorrect: true },
                        { text: "Desligar o servidor web da máquina", isCorrect: false },
                        { text: "Parar os workers de fila em execução", isCorrect: false },
                        { text: "Desfazer a última migration aplicada", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar `--force` no migrate durante o deploy?",
                    difficulty: "medio",
                    options: [
                        { text: "Em produção o comando pede confirmação", isCorrect: true },
                        { text: "Para aplicar as migrations fora de ordem", isCorrect: false },
                        { text: "Para recriar as tabelas que já existem", isCorrect: false },
                        { text: "Para ignorar as migrations que falharem", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é essencial em qualquer hospedagem de Laravel?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Servidor apontando para public e worker de fila",
                            isCorrect: true,
                        },
                        {
                            text: "Um banco PostgreSQL com a extensão vetorial ligada",
                            isCorrect: false,
                        },
                        { text: "Um servidor Nginx, que é o único suportado", isCorrect: false },
                        { text: "Um container Docker para cada serviço usado", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `npm ci` em vez de `npm install` no deploy?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele respeita o lock e não o altera", isCorrect: true },
                        { text: "Ele instala bem mais rápido as dependências", isCorrect: false },
                        {
                            text: "Ele instala também os pacotes de desenvolvimento",
                            isCorrect: false,
                        },
                        { text: "Ele já executa o build depois de instalar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o último passo antes de `php artisan up`?",
                    difficulty: "medio",
                    options: [
                        { text: "Reiniciar os workers de fila", isCorrect: true },
                        { text: "Rodar os testes automatizados do projeto", isCorrect: false },
                        { text: "Limpar todo o cache da aplicação", isCorrect: false },
                        { text: "Fazer o backup do banco de dados", isCorrect: false },
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
