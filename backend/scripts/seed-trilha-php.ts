// Seed da trilha PHP (PHP 8.5). Conteúdo autoral.
// A versão 8.5 saiu em novembro de 2025 e é a que a trilha ensina: pipe operator,
// array_first e array_last, stack trace em erro fatal e filtros que lançam exceção.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-php.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "PHP";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "PHP 8.5 do zero ao uso real: sintaxe e tipos, strings e arrays, controle de fluxo e funções, orientação a objetos com enums e propriedades readonly, tratamento de erros e exceções, e o PHP na web com formulários, sessões, PDO e autoload PSR-4. A linguagem por trás do WordPress, do Laravel e de boa parte dos sites que existem.";
const CARGA_HORARIA = 20;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Primeiros passos com PHP",
    aulas: [
        {
            titulo: "O que é PHP e onde ele roda",
            blocks: [
                {
                    type: "text",
                    value: "# O que é PHP\n\nPHP é uma linguagem criada em 1995 para escrever páginas dinâmicas. A sigla hoje significa **PHP: Hypertext Preprocessor**, e o nome já entrega o propósito original: um programa que roda no servidor e devolve HTML pronto para o navegador.\n\nDesde então a linguagem mudou muito. O PHP moderno tem tipagem, orientação a objetos completa, enums, e um desempenho que não lembra em nada a fama que ele carregou por anos. Esta trilha usa o **PHP 8.5**, lançado em novembro de 2025.",
                },
                {
                    type: "text",
                    value: "## Onde o PHP é usado\n\nO PHP roda em boa parte da web. WordPress, que sozinho move uma fatia enorme dos sites do mundo, é PHP. Também são PHP a Wikipedia, o Slack no back-end e uma quantidade grande de sistemas internos de empresas.\n\nO uso típico é **no servidor**: o código roda antes de a página chegar ao navegador, monta o HTML, conversa com o banco e devolve a resposta. Diferente do JavaScript, que roda no navegador da pessoa, o PHP nunca é visto por quem acessa o site.",
                },
                {
                    type: "table",
                    value: '[["Onde roda", "Linguagem típica", "Quem enxerga o código"], ["No servidor", "PHP, Python, Java", "Ninguém de fora"], ["No navegador", "JavaScript", "Qualquer pessoa"]]',
                },
                {
                    type: "quote",
                    value: "PHP roda no servidor e devolve HTML pronto. Quem acessa o site recebe o resultado, nunca o código.",
                },
            ],
            questions: [
                {
                    statement: "Onde o código PHP é executado em uma aplicação web tradicional?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "No servidor, antes de a resposta chegar ao navegador",
                            isCorrect: true,
                        },
                        { text: "No navegador de quem acessa o site", isCorrect: false },
                        { text: "No banco de dados, junto com as consultas", isCorrect: false },
                        {
                            text: "Na placa de vídeo do computador de quem acessa o site",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a sigla PHP significa hoje?",
                    difficulty: "facil",
                    options: [
                        { text: "PHP: Hypertext Preprocessor", isCorrect: true },
                        { text: "Personal Hardware Processor", isCorrect: false },
                        { text: "Public Hosting Protocol", isCorrect: false },
                        { text: "Página HTML Programável", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual destes sistemas conhecidos é escrito em PHP?",
                    difficulty: "facil",
                    options: [
                        { text: "WordPress", isCorrect: true },
                        { text: "Photoshop", isCorrect: false },
                        { text: "Android", isCorrect: false },
                        { text: "Excel", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do PHP esta trilha usa?",
                    difficulty: "facil",
                    options: [
                        { text: "PHP 8.5", isCorrect: true },
                        { text: "PHP 5.6", isCorrect: false },
                        { text: "PHP 7.0", isCorrect: false },
                        { text: "PHP 4.4", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o visitante de um site nunca vê o código PHP?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Porque ele é executado no servidor e só o resultado é enviado",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o navegador esconde o código de propósito",
                            isCorrect: false,
                        },
                        {
                            text: "Porque o PHP é criptografado pelo servidor antes de ser enviado",
                            isCorrect: false,
                        },
                        { text: "Porque o código fica salvo no banco de dados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Instalando o PHP 8.5 e o primeiro script",
            blocks: [
                {
                    type: "text",
                    value: "# Colocando o PHP para rodar\n\nPara escrever PHP você precisa do interpretador instalado. No Linux e no macOS ele costuma vir pelo gerenciador de pacotes; no Windows, pelo site oficial ou por pacotes como Laragon e XAMPP.\n\nConfira a versão instalada no terminal:",
                },
                {
                    type: "code",
                    value: "php --version\n# PHP 8.5.8 (cli) (built: Jul  2 2026)",
                },
                {
                    type: "text",
                    value: "## O primeiro script\n\nTodo arquivo PHP começa com a tag de abertura `<?php`. Tudo que vier depois dela é código; tudo fora dela é enviado como está.\n\nCrie um arquivo `ola.php`:",
                },
                {
                    type: "code",
                    value: '<?php\n\necho "Olá, mundo!";\necho PHP_EOL;\necho "Rodando em PHP " . PHP_VERSION;',
                },
                {
                    type: "text",
                    value: "Rode com `php ola.php`. O `echo` imprime, o ponto junta textos e `PHP_EOL` é a quebra de linha do sistema.\n\n## O servidor embutido\n\nO PHP traz um servidor web próprio, ótimo para estudar sem instalar nada além:\n\n```\nphp -S localhost:8000\n```\n\nAbra `http://localhost:8000/ola.php` no navegador e o mesmo script vira uma página.",
                },
            ],
            questions: [
                {
                    statement: "Qual tag abre um bloco de código PHP?",
                    difficulty: "facil",
                    options: [
                        { text: "<?php", isCorrect: true },
                        { text: "<php>", isCorrect: false },
                        { text: "<script php>", isCorrect: false },
                        { text: "{{ php }}", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o comando `php -S localhost:8000` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Sobe o servidor web embutido do PHP", isCorrect: true },
                        { text: "Instala o PHP na versão 8000", isCorrect: false },
                        { text: "Salva o script em um servidor remoto", isCorrect: false },
                        { text: "Compila o projeto para um executável", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual instrução imprime um texto na saída?",
                    difficulty: "facil",
                    options: [
                        { text: "echo", isCorrect: true },
                        { text: "print_page", isCorrect: false },
                        { text: "write", isCorrect: false },
                        { text: "output", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a constante `PHP_EOL`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Dá a quebra de linha correta do sistema operacional",
                            isCorrect: true,
                        },
                        { text: "Marca o fim do arquivo PHP", isCorrect: false },
                        { text: "Encerra a execução do script", isCorrect: false },
                        {
                            text: "Guarda a versão do PHP instalada no sistema operacional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se conhece a versão do PHP instalada pelo terminal?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `php --version`", isCorrect: true },
                        { text: "Com `php --check`", isCorrect: false },
                        { text: "Abrindo o arquivo php.ini", isCorrect: false },
                        { text: "Com `version php`", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Variáveis, tipos e saída",
            blocks: [
                {
                    type: "text",
                    value: "# Variáveis\n\nToda variável em PHP começa com cifrão. Não se declara o tipo: ele vem do valor atribuído, e pode mudar durante a execução.\n\nOs nomes diferenciam maiúsculas de minúsculas, então `$nome` e `$Nome` são variáveis distintas.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$nome = "Ana";\n$idade = 28;\n$altura = 1.67;\n$estudante = true;\n\necho "$nome tem $idade anos.";',
                },
                {
                    type: "text",
                    value: "## Os tipos básicos\n\nO PHP tem quatro tipos escalares e alguns compostos. A função `gettype()` mostra o tipo de um valor, e `var_dump()` mostra tipo e conteúdo, o que ajuda muito a depurar.",
                },
                {
                    type: "table",
                    value: '[["Tipo", "Exemplo", "O que guarda"], ["string", "\\"Ana\\"", "texto"], ["int", "28", "número inteiro"], ["float", "1.67", "número com casas decimais"], ["bool", "true", "verdadeiro ou falso"], ["array", "[1, 2, 3]", "uma lista de valores"], ["null", "null", "ausência de valor"]]',
                },
                {
                    type: "code",
                    value: '<?php\n\n$idade = 28;\nvar_dump($idade);   // int(28)\nvar_dump("28");     // string(2) "28"\nvar_dump($idade == "28");  // bool(true)',
                },
            ],
            questions: [
                {
                    statement: "Como se escreve o nome de uma variável em PHP?",
                    difficulty: "facil",
                    options: [
                        { text: "Começando com cifrão, como em `$nome`", isCorrect: true },
                        { text: "Começando com arroba, como em `@nome`", isCorrect: false },
                        { text: "Com a palavra `var` na frente", isCorrect: false },
                        { text: "Sem nenhum símbolo, apenas `nome`", isCorrect: false },
                    ],
                },
                {
                    statement: "Precisa declarar o tipo de uma variável ao criá-la?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, o tipo vem do valor atribuído", isCorrect: true },
                        { text: "Sim, sempre antes do nome", isCorrect: false },
                        { text: "Sim, mas só para números", isCorrect: false },
                        { text: "Sim, usando a palavra `type` antes do nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função mostra o tipo e o conteúdo de uma variável?",
                    difficulty: "facil",
                    options: [
                        { text: "var_dump()", isCorrect: true },
                        { text: "show()", isCorrect: false },
                        { text: "print_type()", isCorrect: false },
                        { text: "describe()", isCorrect: false },
                    ],
                },
                {
                    statement: "As variáveis `$total` e `$Total` são a mesma coisa?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não, o nome diferencia maiúsculas de minúsculas",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, o PHP ignora maiúsculas no nome de variáveis",
                            isCorrect: false,
                        },
                        { text: "Sim, desde que estejam no mesmo arquivo", isCorrect: false },
                        { text: "Depende da versão do PHP instalada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo representa a ausência de valor?",
                    difficulty: "facil",
                    options: [
                        { text: "null", isCorrect: true },
                        { text: "void", isCorrect: false },
                        { text: "empty", isCorrect: false },
                        { text: "zero", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "PHP dentro do HTML",
            blocks: [
                {
                    type: "text",
                    value: "# Misturando código e marcação\n\nO PHP nasceu para gerar HTML, então ele pode ser aberto e fechado várias vezes no mesmo arquivo. Tudo que estiver fora das tags é enviado sem alteração.\n\nEssa mistura é a forma mais direta de montar uma página dinâmica.",
                },
                {
                    type: "code",
                    value: '<?php $usuario = "Ana"; ?>\n<!DOCTYPE html>\n<html lang="pt-br">\n<body>\n    <h1>Bem-vinda, <?= $usuario ?></h1>\n</body>\n</html>',
                },
                {
                    type: "text",
                    value: "## A tag curta de eco\n\n`<?= $valor ?>` é atalho para `<?php echo $valor; ?>`. É a forma recomendada dentro de HTML porque deixa a marcação legível.\n\n## Escapando a saída\n\nJogar conteúdo vindo do usuário direto no HTML é como uma página é invadida. A função `htmlspecialchars()` transforma os caracteres perigosos em entidades, e deve ser usada em tudo que veio de fora.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$comentario = \'<script>alert("invadido")</script>\';\n\n// Errado: executa o script no navegador de quem visitar\necho $comentario;\n\n// Certo: aparece como texto na tela\necho htmlspecialchars($comentario, ENT_QUOTES, "UTF-8");',
                },
                {
                    type: "quote",
                    value: "Todo dado que veio de fora passa por htmlspecialchars antes de virar HTML. Sem exceção.",
                },
            ],
            questions: [
                {
                    statement: "O que `<?= $nome ?>` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "É atalho para `<?php echo $nome; ?>`", isCorrect: true },
                        { text: "Declara a variável `$nome` como texto", isCorrect: false },
                        { text: "Comenta o trecho de código", isCorrect: false },
                        { text: "Importa o arquivo `$nome`", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `htmlspecialchars()`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Escapa caracteres para que o texto não vire HTML executável",
                            isCorrect: true,
                        },
                        { text: "Remove todo o HTML de uma string", isCorrect: false },
                        { text: "Converte a string para maiúsculas", isCorrect: false },
                        {
                            text: "Comprime o HTML da página inteira para ela carregar mais rápido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que acontece com o texto que está fora das tags PHP em um arquivo `.php`?",
                    difficulty: "medio",
                    options: [
                        { text: "É enviado ao navegador sem alteração", isCorrect: true },
                        { text: "É ignorado por completo pelo interpretador", isCorrect: false },
                        { text: "Gera um erro de sintaxe", isCorrect: false },
                        { text: "É executado como código PHP", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Imprimir direto no HTML um comentário digitado pelo usuário abre qual risco?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Execução de script malicioso no navegador de quem visita",
                            isCorrect: true,
                        },
                        {
                            text: "Perda de desempenho ao carregar a página a cada visita nova",
                            isCorrect: false,
                        },
                        { text: "Erro de sintaxe no arquivo PHP", isCorrect: false },
                        { text: "Corrupção do banco de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Um arquivo PHP pode abrir e fechar as tags mais de uma vez?",
                    difficulty: "facil",
                    options: [
                        { text: "Sim, quantas vezes forem necessárias", isCorrect: true },
                        { text: "Não, só uma vez por arquivo", isCorrect: false },
                        { text: "Só em arquivos com a extensão .phtml", isCorrect: false },
                        { text: "Apenas se o arquivo não tiver HTML", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Composer e o ecossistema",
            blocks: [
                {
                    type: "text",
                    value: "# O gerenciador de pacotes\n\nO **Composer** é a ferramenta que instala e organiza bibliotecas de terceiros em um projeto PHP. Ele é para o PHP o que o npm é para o JavaScript.\n\nO catálogo de pacotes se chama **Packagist**, e é de onde o Composer baixa quase tudo.",
                },
                {
                    type: "code",
                    value: "# Inicia um projeto novo\ncomposer init\n\n# Instala uma biblioteca\ncomposer require monolog/monolog\n\n# Instala tudo que o projeto declara\ncomposer install",
                },
                {
                    type: "text",
                    value: "## Os dois arquivos\n\n`composer.json` declara o que o projeto quer. `composer.lock` grava as versões exatas que foram instaladas.\n\nO `.lock` é o que garante que a sua máquina e o servidor rodem exatamente as mesmas versões, e por isso ele **vai para o controle de versão**. A pasta `vendor/`, onde o código baixado fica, não vai.",
                },
                {
                    type: "table",
                    value: '[["Arquivo ou pasta", "O que é", "Vai para o Git"], ["composer.json", "o que o projeto pede", "sim"], ["composer.lock", "as versões exatas instaladas", "sim"], ["vendor/", "o código baixado", "não"]]',
                },
                {
                    type: "quote",
                    value: "composer install respeita o .lock e instala as versões travadas. composer update ignora o .lock e busca versões novas.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a função do Composer em um projeto PHP?",
                    difficulty: "facil",
                    options: [
                        { text: "Gerenciar as bibliotecas de terceiros", isCorrect: true },
                        { text: "Compilar o PHP para binário", isCorrect: false },
                        { text: "Servir as páginas prontas para o navegador", isCorrect: false },
                        { text: "Formatar o código-fonte", isCorrect: false },
                    ],
                },
                {
                    statement: "A pasta `vendor/` deve ir para o controle de versão?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ela é recriada pelo Composer", isCorrect: true },
                        { text: "Sim, senão o projeto não roda", isCorrect: false },
                        { text: "Sim, mas apenas o conteúdo de bin/", isCorrect: false },
                        { text: "Só quando o projeto usa Git", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comando instala as versões exatas já travadas no projeto?",
                    difficulty: "medio",
                    options: [
                        { text: "composer install", isCorrect: true },
                        { text: "composer update", isCorrect: false },
                        { text: "composer refresh", isCorrect: false },
                        { text: "composer lock", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam publicados os pacotes PHP que o Composer baixa?",
                    difficulty: "facil",
                    options: [
                        { text: "No Packagist", isCorrect: true },
                        { text: "No npm", isCorrect: false },
                        { text: "No PyPI", isCorrect: false },
                        { text: "No Maven Central", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `composer.json` e `composer.lock`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O json declara o que se quer e o lock grava o que foi instalado",
                            isCorrect: true,
                        },
                        { text: "O json é do projeto e o lock é do servidor", isCorrect: false },
                        { text: "O lock declara e o json apenas documenta", isCorrect: false },
                        {
                            text: "São o mesmo arquivo, escrito em dois formatos diferentes de texto",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Tipos, strings e operadores",
    aulas: [
        {
            titulo: "Os tipos escalares e a conversão entre eles",
            blocks: [
                {
                    type: "text",
                    value: '# Tipagem dinâmica com conversão automática\n\nO PHP converte tipos sozinho quando a operação pede. Somar `"5"` com `5` dá `10`, porque a string vira número na hora.\n\nIsso é prático e é também a origem de muito bug. Entender quando a conversão acontece é o que separa código previsível de código que falha em produção.',
                },
                {
                    type: "code",
                    value: '<?php\n\nvar_dump(5 + "5");      // int(10)\nvar_dump("abc" == 0);   // bool(false) no PHP 8, era true no PHP 7\nvar_dump((int) "12kg"); // int(12)\nvar_dump((int) "kg12"); // int(0)',
                },
                {
                    type: "text",
                    value: "## Conversão explícita\n\nQuando você quer o controle, converte na mão com um cast ou com as funções `intval()`, `floatval()`, `strval()` e `boolval()`.\n\nUma novidade do **PHP 8.5**: casts fora do formato canônico, como `(boolean)` e `(integer)`, foram marcados como obsoletos. Use as formas curtas `(bool)` e `(int)`.",
                },
                {
                    type: "table",
                    value: '[["Valor", "Vira false quando convertido para bool"], ["0 e 0.0", "sim"], ["\\"\\" e \\"0\\"", "sim"], ["array vazio", "sim"], ["null", "sim"], ["\\"false\\"", "não, string não vazia é true"]]',
                },
            ],
            questions: [
                {
                    statement: 'Qual o resultado de `5 + "5"` em PHP?',
                    difficulty: "facil",
                    options: [
                        { text: "O inteiro 10", isCorrect: true },
                        { text: 'A string "55"', isCorrect: false },
                        { text: "Um erro de tipo", isCorrect: false },
                        { text: "O float 5.5", isCorrect: false },
                    ],
                },
                {
                    statement: 'O que `(int) "12kg"` devolve?',
                    difficulty: "medio",
                    options: [
                        { text: "12", isCorrect: true },
                        { text: "0", isCorrect: false },
                        { text: "Um erro fatal", isCorrect: false },
                        { text: 'A string "12"', isCorrect: false },
                    ],
                },
                {
                    statement: 'A string `"false"` convertida para bool dá qual valor?',
                    difficulty: "dificil",
                    options: [
                        { text: "true, porque não está vazia", isCorrect: true },
                        { text: "false, pelo conteúdo da palavra", isCorrect: false },
                        { text: "null, por ser ambígua", isCorrect: false },
                        { text: "Depende do strict_types", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais casts o PHP 8.5 marcou como obsoletos?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Os não canônicos, como `(boolean)` e `(integer)`",
                            isCorrect: true,
                        },
                        { text: "Todos os casts explícitos", isCorrect: false },
                        {
                            text: "Os casts para array e para object dentro de funções",
                            isCorrect: false,
                        },
                        { text: "Os casts dentro de funções", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual destes valores é convertido para `false`?",
                    difficulty: "medio",
                    options: [
                        { text: "Um array vazio", isCorrect: true },
                        { text: 'A string "0.0"', isCorrect: false },
                        { text: "O número -1", isCorrect: false },
                        { text: 'A string " "', isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Strings: aspas, interpolação e heredoc",
            blocks: [
                {
                    type: "text",
                    value: "# Aspas simples e duplas não são a mesma coisa\n\nEm aspas **duplas**, o PHP substitui variáveis pelo valor e entende sequências de escape como `\\n`. Em aspas **simples**, o texto sai literal.\n\nEssa é uma das primeiras pegadinhas de quem começa.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$nome = "Ana";\n\necho "Olá, $nome";   // Olá, Ana\necho \'Olá, $nome\';   // Olá, $nome\n\n// Chaves deixam claro onde a variável termina\necho "Olá, {$nome}s";',
                },
                {
                    type: "text",
                    value: "## Concatenar e formatar\n\nO ponto junta strings. Para montar texto com valores no meio, `sprintf()` costuma ficar mais legível que uma sequência de pontos.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$preco = 19.9;\necho "Total: R$ " . number_format($preco, 2, ",", ".");\n\nprintf("Você pagou %.2f reais por %d itens", $preco, 3);',
                },
                {
                    type: "text",
                    value: "## Heredoc e nowdoc\n\nPara blocos longos, o heredoc mantém a interpolação e dispensa escapar aspas. O nowdoc, com o marcador entre aspas simples, é a versão literal.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$nome = "Ana";\n\n$html = <<<HTML\n    <p>Olá, $nome</p>\n    <p>Seja bem-vinda.</p>\n    HTML;\n\necho $html;',
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre aspas simples e duplas?",
                    difficulty: "facil",
                    options: [
                        { text: "As duplas substituem variáveis pelo valor", isCorrect: true },
                        { text: "As simples são bem mais rápidas de digitar", isCorrect: false },
                        { text: "As simples aceitam quebras de linha", isCorrect: false },
                        { text: "Não há diferença prática entre elas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `echo 'Olá, $nome';` imprime?",
                    difficulty: "medio",
                    options: [
                        { text: "Olá, $nome", isCorrect: true },
                        { text: "Olá, Ana", isCorrect: false },
                        { text: "Um erro de sintaxe", isCorrect: false },
                        { text: "Olá, seguido de nada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual operador junta duas strings em PHP?",
                    difficulty: "facil",
                    options: [
                        { text: "O ponto", isCorrect: true },
                        { text: "O mais", isCorrect: false },
                        { text: "O e comercial", isCorrect: false },
                        { text: "As duas barras", isCorrect: false },
                    ],
                },
                {
                    statement: 'Para que servem as chaves em `"{$nome}s"`?',
                    difficulty: "medio",
                    options: [
                        { text: "Delimitar onde o nome da variável termina", isCorrect: true },
                        { text: "Transformar a variável em um array de texto", isCorrect: false },
                        { text: "Escapar o cifrão da variável", isCorrect: false },
                        { text: "Chamar uma função com o valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que diferencia o nowdoc do heredoc?",
                    difficulty: "dificil",
                    options: [
                        { text: "O nowdoc não interpola variáveis", isCorrect: true },
                        { text: "O nowdoc não aceita quebras de linha", isCorrect: false },
                        { text: "O heredoc só funciona dentro de classes", isCorrect: false },
                        {
                            text: "O nowdoc precisa ser fechado com ponto e vírgula",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Operadores e as duas comparações",
            blocks: [
                {
                    type: "text",
                    value: "# O igual solto e o igual estrito\n\nPHP tem duas comparações de igualdade, e escolher a errada é fonte clássica de bug.\n\n- `==` compara **valores**, convertendo tipos se precisar\n- `===` compara **valor e tipo**, sem conversão nenhuma\n\nA regra prática é simples: use `===` por padrão e só recorra a `==` quando a conversão for exatamente o que você quer.",
                },
                {
                    type: "code",
                    value: '<?php\n\nvar_dump(0 == "0");        // true\nvar_dump(0 === "0");       // false\nvar_dump(null == false);   // true\nvar_dump(null === false);  // false\nvar_dump([1,2] == [1,2]);  // true',
                },
                {
                    type: "text",
                    value: "## Aritméticos, lógicos e o spaceship\n\nAlém dos operadores usuais, o PHP tem o `<=>`, chamado de spaceship, que devolve -1, 0 ou 1. Ele é a base para escrever comparadores de ordenação.",
                },
                {
                    type: "table",
                    value: '[["Operador", "O que faz", "Exemplo"], ["**", "potência", "2 ** 3 dá 8"], ["%", "resto da divisão", "7 % 2 dá 1"], ["intdiv()", "divisão inteira", "intdiv(7, 2) dá 3"], ["<=>", "compara e devolve -1, 0 ou 1", "1 <=> 2 dá -1"], ["&&", "e lógico", "true && false dá false"]]',
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `==` e `===`?",
                    difficulty: "facil",
                    options: [
                        { text: "O `===` também compara o tipo", isCorrect: true },
                        { text: "O `===` é mais rápido de executar", isCorrect: false },
                        { text: "O `==` só funciona com números", isCorrect: false },
                        { text: "O `===` só funciona com objetos", isCorrect: false },
                    ],
                },
                {
                    statement: 'Qual o resultado de `0 === "0"`?',
                    difficulty: "medio",
                    options: [
                        { text: "false", isCorrect: true },
                        { text: "true", isCorrect: false },
                        { text: "null", isCorrect: false },
                        { text: "Um erro de tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador `<=>` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "-1, 0 ou 1, conforme a comparação", isCorrect: true },
                        { text: "Sempre true ou false", isCorrect: false },
                        { text: "A diferença entre os dois valores", isCorrect: false },
                        { text: "O maior dos dois valores", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual expressão dá o resto da divisão de 7 por 2?",
                    difficulty: "facil",
                    options: [
                        { text: "7 % 2", isCorrect: true },
                        { text: "7 / 2", isCorrect: false },
                        { text: "7 ** 2", isCorrect: false },
                        { text: "intdiv(7, 2)", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comparação usar por padrão em código novo?",
                    difficulty: "medio",
                    options: [
                        { text: "O `===`, por não converter tipos", isCorrect: true },
                        { text: "O `==`, por ser mais flexível", isCorrect: false },
                        { text: "Tanto faz, o resultado é o mesmo", isCorrect: false },
                        { text: "O `<=>`, por ser mais completo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Null, coalescência e nullsafe",
            blocks: [
                {
                    type: "text",
                    value: "# Lidando com a ausência de valor\n\n`null` significa que não há valor. Acessar uma chave que não existe, ou um método de algo nulo, é um dos erros mais comuns em qualquer linguagem.\n\nO PHP tem três ferramentas que resolvem isso sem encher o código de `if`.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$dados = ["nome" => "Ana"];\n\n// Coalescência: usa o segundo se o primeiro for null ou não existir\n$cidade = $dados["cidade"] ?? "não informada";\n\n// Atribuição por coalescência: só atribui se ainda for null\n$dados["ativo"] ??= true;\n\necho $cidade;  // não informada',
                },
                {
                    type: "text",
                    value: "## O operador nullsafe\n\nEm cadeias de objetos, `?->` interrompe a chamada e devolve `null` em vez de estourar erro quando o objeto do meio é nulo.",
                },
                {
                    type: "code",
                    value: '<?php\n\n// Sem nullsafe: quebra se getEndereco() devolver null\n$cidade = $usuario->getEndereco()->cidade;\n\n// Com nullsafe: devolve null e segue a vida\n$cidade = $usuario?->getEndereco()?->cidade;\n\n// Combinando com a coalescência\n$cidade = $usuario?->getEndereco()?->cidade ?? "sem cidade";',
                },
                {
                    type: "quote",
                    value: "O ?? trata valor ausente. O ?-> trata objeto ausente. Juntos eles cobrem quase todo caso de null no dia a dia.",
                },
            ],
            questions: [
                {
                    statement: "O que o operador `??` faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Devolve o segundo valor se o primeiro for null ou inexistente",
                            isCorrect: true,
                        },
                        { text: "Compara dois valores e devolve o maior", isCorrect: false },
                        { text: "Converte o valor para booleano", isCorrect: false },
                        {
                            text: "Lança uma exceção sempre que o primeiro valor for nulo ou ausente",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `?->` faz quando o objeto é nulo?",
                    difficulty: "medio",
                    options: [
                        { text: "Interrompe a cadeia e devolve null", isCorrect: true },
                        { text: "Lança um erro fatal", isCorrect: false },
                        { text: "Cria um objeto vazio automaticamente", isCorrect: false },
                        { text: "Devolve uma string vazia", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `$config['tema'] ??= 'claro';` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Atribui o valor só se a chave ainda for nula", isCorrect: true },
                        {
                            text: "Sempre sobrescreve a chave com o valor informado",
                            isCorrect: false,
                        },
                        { text: "Remove a chave quando ela existe", isCorrect: false },
                        { text: "Compara a chave com a string informada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de `??` sobre um `if` que testa `isset`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Resolve o caso em uma linha, sem aviso de índice indefinido",
                            isCorrect: true,
                        },
                        {
                            text: "Executa bem mais rápido do que o isset em qualquer situação de uso",
                            isCorrect: false,
                        },
                        { text: "Funciona apenas com arrays", isCorrect: false },
                        { text: "Dispensa a declaração da variável", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Em `$u?->perfil()?->nome ?? 'anônimo'`, o que acontece se `$u` for null?",
                    difficulty: "dificil",
                    options: [
                        { text: "O resultado é a string anônimo", isCorrect: true },
                        { text: "O script para com erro fatal", isCorrect: false },
                        { text: "O resultado é null", isCorrect: false },
                        { text: "O método perfil é chamado mesmo assim", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Constantes, match e o ternário",
            blocks: [
                {
                    type: "text",
                    value: "# Valores que não mudam\n\nConstantes guardam valores fixos. Diferente de variáveis, não levam cifrão e não podem ser reatribuídas.\n\nUse `const` dentro de classes e no topo de arquivos, e `define()` quando o nome ou o valor for calculado em tempo de execução.",
                },
                {
                    type: "code",
                    value: '<?php\n\nconst TAXA = 0.05;\nconst MOEDA = "BRL";\n\ndefine("AMBIENTE", getenv("APP_ENV") ?: "local");\n\necho TAXA;      // 0.05\necho AMBIENTE;  // local',
                },
                {
                    type: "text",
                    value: "## O ternário e a forma curta\n\nO ternário resolve um `if` de uma linha. A forma curta `?:` devolve o primeiro valor quando ele é verdadeiro.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$status = $ativo ? "ativo" : "inativo";\n\n// Forma curta: usa $apelido se não for vazio\n$exibir = $apelido ?: $nome;',
                },
                {
                    type: "text",
                    value: "## match, o irmão estrito do switch\n\nO `match` compara com `===`, devolve um valor e não precisa de `break`. Se nada casar, ele lança `UnhandledMatchError` em vez de seguir em silêncio, o que evita bug esquecido.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$faixa = match(true) {\n    $idade < 13 => "criança",\n    $idade < 18 => "adolescente",\n    $idade < 60 => "adulto",\n    default => "idoso",\n};\n\n$sigla = match($estado) {\n    "São Paulo" => "SP",\n    "Rio de Janeiro" => "RJ",\n    default => "??",\n};',
                },
            ],
            questions: [
                {
                    statement: "Como se escreve o uso de uma constante?",
                    difficulty: "facil",
                    options: [
                        { text: "Sem cifrão, apenas pelo nome", isCorrect: true },
                        { text: "Com cifrão, como uma variável", isCorrect: false },
                        { text: "Com dois-pontos na frente", isCorrect: false },
                        { text: "Entre chaves duplas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual comparação o `match` usa?",
                    difficulty: "medio",
                    options: [
                        { text: "A estrita, com `===`", isCorrect: true },
                        { text: "A solta, com `==`", isCorrect: false },
                        { text: "Comparação de texto apenas", isCorrect: false },
                        { text: "A mesma do operador `<=>`", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece quando nenhum braço do `match` casa e não há `default`?",
                    difficulty: "dificil",
                    options: [
                        { text: "É lançado um UnhandledMatchError", isCorrect: true },
                        { text: "O resultado é null em silêncio", isCorrect: false },
                        { text: "O primeiro braço é usado", isCorrect: false },
                        { text: "O script continua sem retornar nada", isCorrect: false },
                    ],
                },
                {
                    statement: "O `match` precisa de `break` em cada braço?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele não tem o efeito cascata do switch", isCorrect: true },
                        { text: "Sim, igual ao switch", isCorrect: false },
                        { text: "Só quando há mais de três braços", isCorrect: false },
                        {
                            text: "Só quando o valor comparado for do tipo string",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "O que `$apelido ?: $nome` devolve quando `$apelido` é uma string vazia?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor de `$nome`", isCorrect: true },
                        { text: "A string vazia mesmo assim", isCorrect: false },
                        { text: "O valor null", isCorrect: false },
                        { text: "Um erro de operador inválido", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Controle de fluxo e funções",
    aulas: [
        {
            titulo: "Condicionais: if, else e a sintaxe alternativa",
            blocks: [
                {
                    type: "text",
                    value: "# Decidindo o caminho\n\nO `if` executa um bloco quando a condição é verdadeira. `elseif` acrescenta condições e `else` cobre o resto.\n\nO PHP avalia a condição convertendo para booleano, então valores como `0`, string vazia e array vazio contam como falso.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$nota = 7.5;\n\nif ($nota >= 9) {\n    echo "Excelente";\n} elseif ($nota >= 6) {\n    echo "Aprovado";\n} else {\n    echo "Reprovado";\n}',
                },
                {
                    type: "text",
                    value: "## A sintaxe alternativa\n\nDentro de HTML, chaves espalhadas atrapalham a leitura. O PHP aceita uma forma com dois-pontos e palavra de fechamento, bem mais legível na marcação.",
                },
                {
                    type: "code",
                    value: '<?php if ($logado): ?>\n    <p>Olá de novo</p>\n<?php else: ?>\n    <a href="/entrar">Entrar</a>\n<?php endif; ?>',
                },
                {
                    type: "quote",
                    value: "Em arquivos de template, prefira a sintaxe alternativa. Em arquivos só de lógica, prefira as chaves.",
                },
            ],
            questions: [
                {
                    statement: "Qual palavra o PHP usa para uma condição adicional dentro do if?",
                    difficulty: "facil",
                    options: [
                        { text: "elseif", isCorrect: true },
                        { text: "elif", isCorrect: false },
                        { text: "else if not", isCorrect: false },
                        { text: "orif", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se fecha um `if` na sintaxe alternativa?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `endif;`", isCorrect: true },
                        { text: "Com uma chave", isCorrect: false },
                        { text: "Com `end;`", isCorrect: false },
                        { text: "Com `fi;`", isCorrect: false },
                    ],
                },
                {
                    statement: "Um array vazio dentro de um `if` é avaliado como o quê?",
                    difficulty: "medio",
                    options: [
                        { text: "Falso", isCorrect: true },
                        { text: "Verdadeiro", isCorrect: false },
                        { text: "Null", isCorrect: false },
                        { text: "Gera erro de conversão", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde a sintaxe alternativa é mais indicada?",
                    difficulty: "medio",
                    options: [
                        { text: "Em arquivos que misturam PHP com HTML", isCorrect: true },
                        { text: "Em arquivos apenas de classes", isCorrect: false },
                        { text: "Em scripts que rodam na linha de comando", isCorrect: false },
                        { text: "Em arquivos de configuração", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece quando nenhuma condição do if é verdadeira e não há else?",
                    difficulty: "facil",
                    options: [
                        { text: "Nada é executado e o script continua", isCorrect: true },
                        { text: "O script para com erro", isCorrect: false },
                        { text: "O primeiro bloco do if roda mesmo assim", isCorrect: false },
                        { text: "O PHP emite um aviso", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Laços: while, for e foreach",
            blocks: [
                {
                    type: "text",
                    value: "# Repetindo instruções\n\nO PHP tem quatro laços. A escolha depende do que você sabe antes de começar:\n\n- `for`: você sabe quantas vezes vai repetir\n- `while`: repete enquanto uma condição valer\n- `do while`: igual ao while, mas executa pelo menos uma vez\n- `foreach`: percorre arrays e objetos, e é o mais usado no dia a dia",
                },
                {
                    type: "code",
                    value: '<?php\n\nfor ($i = 1; $i <= 3; $i++) {\n    echo "Volta $i\\n";\n}\n\n$sobrando = 3;\nwhile ($sobrando > 0) {\n    echo "Faltam $sobrando\\n";\n    $sobrando--;\n}',
                },
                {
                    type: "text",
                    value: "## foreach, o laço do PHP\n\nEle percorre cada item sem você controlar índice. Com `=>` você pega também a chave.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$notas = ["Ana" => 9.5, "Bruno" => 7.0];\n\nforeach ($notas as $aluno => $nota) {\n    echo "$aluno tirou $nota\\n";\n}\n\n// Alterando os itens: o & passa por referência\nforeach ($valores as &$v) {\n    $v = $v * 2;\n}\nunset($v);  // sempre libere a referência depois',
                },
                {
                    type: "text",
                    value: "## Interrompendo\n\n`break` sai do laço e `continue` pula para a próxima volta. Ambos aceitam um número para atravessar laços aninhados, mas usar mais de um nível costuma ser sinal de que o código pede uma função.",
                },
            ],
            questions: [
                {
                    statement: "Qual laço é feito para percorrer arrays?",
                    difficulty: "facil",
                    options: [
                        { text: "foreach", isCorrect: true },
                        { text: "for", isCorrect: false },
                        { text: "while", isCorrect: false },
                        { text: "do while", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual laço garante ao menos uma execução do bloco?",
                    difficulty: "medio",
                    options: [
                        { text: "do while", isCorrect: true },
                        { text: "while", isCorrect: false },
                        { text: "for", isCorrect: false },
                        { text: "foreach sobre arrays", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `continue` faz dentro de um laço?",
                    difficulty: "facil",
                    options: [
                        { text: "Pula para a próxima repetição", isCorrect: true },
                        { text: "Encerra o laço por completo", isCorrect: false },
                        { text: "Reinicia o laço do começo", isCorrect: false },
                        { text: "Repete a volta atual do laço de novo", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `foreach ($notas as $aluno => $nota)`, o que `$aluno` recebe?",
                    difficulty: "medio",
                    options: [
                        { text: "A chave de cada item", isCorrect: true },
                        { text: "A posição numérica do item", isCorrect: false },
                        { text: "O valor de cada item", isCorrect: false },
                        { text: "O tamanho do array", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que se usa `unset($v)` depois de um foreach com `&$v`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para desfazer a referência que sobra apontando ao último item",
                            isCorrect: true,
                        },
                        { text: "Para liberar memória do array inteiro", isCorrect: false },
                        { text: "Porque o PHP exige isso em todo foreach", isCorrect: false },
                        {
                            text: "Para reiniciar o ponteiro interno do array percorrido no laço",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Funções: parâmetros e retorno",
            blocks: [
                {
                    type: "text",
                    value: "# Agrupando comportamento\n\nUma função guarda um trecho de lógica com nome. Ela recebe parâmetros, faz o trabalho e devolve um valor com `return`.\n\nParâmetros podem ter valor padrão, e nesse caso ficam opcionais na chamada. Os opcionais vêm sempre depois dos obrigatórios.",
                },
                {
                    type: "code",
                    value: "<?php\n\nfunction calcularTotal(float $preco, int $quantidade, float $desconto = 0.0): float\n{\n    $bruto = $preco * $quantidade;\n    return $bruto - ($bruto * $desconto);\n}\n\necho calcularTotal(19.90, 3);        // 59.7\necho calcularTotal(19.90, 3, 0.10);  // 53.73",
                },
                {
                    type: "text",
                    value: "## Escopo\n\nO que é criado dentro da função só existe lá dentro. Uma função **não enxerga** variáveis de fora, ao contrário do que acontece em várias outras linguagens.\n\nSe a função precisa de um dado, ele entra como parâmetro. Essa restrição é uma vantagem: deixa claro do que a função depende.",
                },
                {
                    type: "code",
                    value: "<?php\n\n$total = 100;\n\nfunction mostrar(): void\n{\n    echo $total;  // Warning: variável indefinida\n}\n\nfunction mostrarCerto(int $total): void\n{\n    echo $total;  // funciona\n}",
                },
                {
                    type: "text",
                    value: "## Quantidade variável de argumentos\n\nO operador `...`, chamado de spread, recolhe o que sobrou em um array.",
                },
                {
                    type: "code",
                    value: "<?php\n\nfunction somar(int ...$numeros): int\n{\n    return array_sum($numeros);\n}\n\necho somar(1, 2, 3);  // 6",
                },
            ],
            questions: [
                {
                    statement: "O que uma função devolve quando não tem `return`?",
                    difficulty: "medio",
                    options: [
                        { text: "null", isCorrect: true },
                        { text: "Zero", isCorrect: false },
                        { text: "Uma string vazia", isCorrect: false },
                        { text: "O último valor calculado", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma função enxerga uma variável criada fora dela?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, o escopo é isolado", isCorrect: true },
                        { text: "Sim, todas as variáveis do arquivo", isCorrect: false },
                        { text: "Sim, desde que sejam do mesmo tipo", isCorrect: false },
                        { text: "Apenas quando declarada como const", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde ficam os parâmetros com valor padrão na assinatura?",
                    difficulty: "facil",
                    options: [
                        { text: "Depois dos obrigatórios", isCorrect: true },
                        { text: "Antes dos obrigatórios", isCorrect: false },
                        { text: "Em qualquer posição", isCorrect: false },
                        { text: "Sempre no meio da lista", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `int ...$numeros` significa em uma assinatura?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A função aceita vários inteiros e os recebe como array",
                            isCorrect: true,
                        },
                        { text: "A função aceita apenas três inteiros", isCorrect: false },
                        { text: "O parâmetro é passado por referência", isCorrect: false },
                        {
                            text: "Os valores informados são convertidos para string antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que declarar `: void` no retorno de uma função significa?",
                    difficulty: "medio",
                    options: [
                        { text: "Que ela não devolve valor algum", isCorrect: true },
                        { text: "Que ela devolve null explicitamente", isCorrect: false },
                        { text: "Que ela pode devolver qualquer tipo", isCorrect: false },
                        { text: "Que o retorno é opcional", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos em funções e strict_types",
            blocks: [
                {
                    type: "text",
                    value: "# Declarando tipos\n\nDesde o PHP 7 é possível declarar o tipo de cada parâmetro e do retorno. Isso documenta a função e permite que o interpretador reclame quando algo errado chega.\n\nO PHP moderno aceita também **tipos de união**, com a barra vertical, e o tipo `never` para funções que nunca retornam.",
                },
                {
                    type: "code",
                    value: "<?php\n\nfunction buscar(int|string $id): ?Usuario\n{\n    // ?Usuario quer dizer: um Usuario ou null\n    return $this->repo->find($id);\n}\n\nfunction abortar(string $motivo): never\n{\n    throw new RuntimeException($motivo);\n}",
                },
                {
                    type: "text",
                    value: '## O modo estrito\n\nPor padrão o PHP **converte** o argumento para o tipo declarado quando consegue. Passar `"5"` para um parâmetro `int` funciona, e vira `5`.\n\nCom `declare(strict_types=1);` na primeira linha do arquivo, essa conversão deixa de acontecer e o tipo errado vira `TypeError`.',
                },
                {
                    type: "code",
                    value: '<?php\n\ndeclare(strict_types=1);\n\nfunction dobrar(int $n): int\n{\n    return $n * 2;\n}\n\necho dobrar(5);    // 10\necho dobrar("5");  // TypeError: precisa ser int, string informada',
                },
                {
                    type: "quote",
                    value: "declare(strict_types=1) vale só para o arquivo onde está escrito, e precisa ser a primeira instrução dele.",
                },
            ],
            questions: [
                {
                    statement: "O que `?Usuario` significa como tipo de retorno?",
                    difficulty: "medio",
                    options: [
                        { text: "Um Usuario ou null", isCorrect: true },
                        { text: "Um Usuario opcional na chamada", isCorrect: false },
                        { text: "Um array de Usuario", isCorrect: false },
                        { text: "Um Usuario passado por referência", isCorrect: false },
                    ],
                },
                {
                    statement: "O que muda com `declare(strict_types=1);`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O PHP para de converter os argumentos e exige o tipo exato",
                            isCorrect: true,
                        },
                        { text: "Todas as variáveis passam a exigir tipo", isCorrect: false },
                        { text: "O código passa a rodar mais rápido", isCorrect: false },
                        {
                            text: "Todas as funções do arquivo ficam obrigadas a declarar retorno",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde a instrução `declare(strict_types=1);` precisa ficar?",
                    difficulty: "dificil",
                    options: [
                        { text: "Como primeira instrução do arquivo", isCorrect: true },
                        { text: "Em qualquer lugar antes da primeira função", isCorrect: false },
                        { text: "No arquivo de configuração do projeto", isCorrect: false },
                        { text: "Dentro de cada função que quer o modo estrito", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o tipo de retorno `never` indica?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Que a função nunca devolve, por lançar exceção ou encerrar",
                            isCorrect: true,
                        },
                        { text: "Que a função devolve null sempre", isCorrect: false },
                        { text: "Que a função não pode ser chamada", isCorrect: false },
                        {
                            text: "Que o retorno da função é sempre ignorado por quem a chama",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        'Sem strict_types, o que acontece ao passar `"5"` para um parâmetro `int`?',
                    difficulty: "medio",
                    options: [
                        { text: "O valor é convertido para o inteiro 5", isCorrect: true },
                        { text: "É lançado um TypeError", isCorrect: false },
                        { text: "O valor chega como string mesmo assim", isCorrect: false },
                        { text: "A função recebe null", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Argumentos nomeados, arrow functions e o pipe do PHP 8.5",
            blocks: [
                {
                    type: "text",
                    value: "# Argumentos nomeados\n\nEm vez de depender da ordem, você pode nomear o argumento na chamada. Isso deixa a chamada legível e permite pular opcionais do meio.",
                },
                {
                    type: "code",
                    value: '<?php\n\nfunction criarUsuario(\n    string $nome,\n    bool $ativo = true,\n    bool $admin = false,\n    string $idioma = "pt-br",\n): Usuario { /* ... */ }\n\n// Sem nomear: o leitor não sabe o que é cada true\ncriarUsuario("Ana", true, false, "en");\n\n// Nomeando: claro, e sem repetir os padrões\ncriarUsuario(nome: "Ana", idioma: "en");',
                },
                {
                    type: "text",
                    value: "## Funções anônimas e arrow functions\n\nUma função anônima é um valor: pode ser guardada em variável e passada adiante. A **arrow function** é a forma curta, de uma expressão só, e captura as variáveis de fora automaticamente.",
                },
                {
                    type: "code",
                    value: "<?php\n\n$taxa = 0.1;\n\n// Anônima: precisa declarar o que captura com use\n$comTaxa = function (float $v) use ($taxa): float {\n    return $v + ($v * $taxa);\n};\n\n// Arrow: captura sozinha, corpo de uma expressão\n$comTaxaCurta = fn (float $v): float => $v + ($v * $taxa);\n\necho $comTaxaCurta(100.0);  // 110",
                },
                {
                    type: "text",
                    value: "## O pipe operator, novidade do PHP 8.5\n\nO `|>` encadeia chamadas passando o resultado de uma para a próxima. Ele resolve a leitura de dentro para fora que as funções aninhadas impõem.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$texto = "  Olá, Mundo!  ";\n\n// Antes: lê-se de dentro para fora\n$antes = ucfirst(strtolower(trim($texto)));\n\n// Com o pipe do PHP 8.5: lê-se na ordem em que acontece\n$depois = $texto\n    |> trim(...)\n    |> strtolower(...)\n    |> ucfirst(...);',
                },
            ],
            questions: [
                {
                    statement: "Qual a vantagem dos argumentos nomeados?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Deixam a chamada legível e permitem pular opcionais",
                            isCorrect: true,
                        },
                        { text: "Fazem a função executar mais rápido", isCorrect: false },
                        {
                            text: "Dispensam a declaração de tipos nos parâmetros da função",
                            isCorrect: false,
                        },
                        { text: "Permitem chamar a função sem argumentos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a arrow function faz automaticamente?",
                    difficulty: "medio",
                    options: [
                        { text: "Captura as variáveis do escopo de fora", isCorrect: true },
                        { text: "Declara os tipos dos parâmetros sozinha", isCorrect: false },
                        { text: "Executa de forma assíncrona", isCorrect: false },
                        { text: "Devolve sempre um array", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador `|>` do PHP 8.5 faz?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Passa o resultado de uma chamada para a próxima",
                            isCorrect: true,
                        },
                        {
                            text: "Compara dois valores e devolve o resultado booleano",
                            isCorrect: false,
                        },
                        { text: "Concatena duas strings", isCorrect: false },
                        { text: "Executa duas funções em paralelo", isCorrect: false },
                    ],
                },
                {
                    statement: "Como uma função anônima acessa uma variável de fora?",
                    difficulty: "medio",
                    options: [
                        { text: "Declarando-a em `use`", isCorrect: true },
                        { text: "Automaticamente, como a arrow function", isCorrect: false },
                        { text: "Passando-a como parâmetro obrigatório", isCorrect: false },
                        { text: "Declarando-a como global no arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema de leitura o pipe operator resolve?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A leitura de dentro para fora das funções aninhadas",
                            isCorrect: true,
                        },
                        {
                            text: "A falta de declaração de tipos nos parâmetros da função",
                            isCorrect: false,
                        },
                        { text: "A repetição de argumentos padrão", isCorrect: false },
                        { text: "O escopo isolado das funções", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Arrays e coleções",
    aulas: [
        {
            titulo: "Arrays indexados e associativos",
            blocks: [
                {
                    type: "text",
                    value: "# O array faz tudo em PHP\n\nO array do PHP não é só uma lista. Ele é um **mapa ordenado**: guarda pares de chave e valor mantendo a ordem de inserção. Por isso ele serve de lista, dicionário, pilha e fila ao mesmo tempo.\n\nQuando você não informa a chave, o PHP usa números a partir de zero.",
                },
                {
                    type: "code",
                    value: '<?php\n\n// Indexado: chaves 0, 1, 2\n$cores = ["azul", "verde", "vermelho"];\n\n// Associativo: você escolhe as chaves\n$usuario = [\n    "nome" => "Ana",\n    "idade" => 28,\n    "ativo" => true,\n];\n\necho $cores[0];          // azul\necho $usuario["nome"];   // Ana',
                },
                {
                    type: "text",
                    value: "## Adicionando e removendo\n\nColchetes vazios acrescentam no fim. `unset()` remove uma chave, mas **não reordena** as que sobraram, o que surpreende quem espera uma lista contínua.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$cores = ["azul", "verde"];\n$cores[] = "vermelho";        // vira a chave 2\n$usuario["email"] = "a@b.c";  // acrescenta a chave\n\nunset($cores[0]);\nvar_dump(array_keys($cores)); // [1, 2], o zero não voltou\n\n$cores = array_values($cores); // renumera do zero',
                },
                {
                    type: "table",
                    value: '[["Função", "O que faz"], ["count()", "quantos itens tem"], ["in_array()", "diz se um valor existe"], ["array_key_exists()", "diz se uma chave existe"], ["array_keys()", "devolve só as chaves"], ["array_values()", "devolve os valores e renumera"]]',
                },
            ],
            questions: [
                {
                    statement: "O que o array do PHP é, na prática?",
                    difficulty: "medio",
                    options: [
                        { text: "Um mapa ordenado de chave e valor", isCorrect: true },
                        { text: "Uma lista de tamanho fixo", isCorrect: false },
                        { text: "Uma estrutura só de números", isCorrect: false },
                        { text: "Um objeto de propriedades fixas e ordenadas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a primeira chave de um array indexado?",
                    difficulty: "facil",
                    options: [
                        { text: "Zero", isCorrect: true },
                        { text: "Um", isCorrect: false },
                        { text: "A string vazia", isCorrect: false },
                        { text: "Depende da configuração", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `$lista[] = 'novo';` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Acrescenta o valor no fim do array", isCorrect: true },
                        { text: "Substitui o array inteiro", isCorrect: false },
                        { text: "Insere no começo do array", isCorrect: false },
                        { text: "Cria uma chave chamada novo no array", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Depois de `unset($lista[0])`, o que acontece com as chaves restantes?",
                    difficulty: "dificil",
                    options: [
                        { text: "Continuam as mesmas, sem renumeração", isCorrect: true },
                        { text: "São renumeradas de novo a partir de zero", isCorrect: false },
                        { text: "Todas viram strings", isCorrect: false },
                        { text: "O array inteiro é esvaziado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função devolve os valores renumerando as chaves?",
                    difficulty: "medio",
                    options: [
                        { text: "array_values()", isCorrect: true },
                        { text: "array_keys()", isCorrect: false },
                        { text: "array_reindex()", isCorrect: false },
                        { text: "sort()", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Transformando: map, filter e reduce",
            blocks: [
                {
                    type: "text",
                    value: "# Trabalhando o array inteiro de uma vez\n\nEm vez de escrever um `foreach` para cada transformação, o PHP oferece funções que recebem outra função e aplicam a regra em todo o array.\n\nAs três principais respondem a perguntas diferentes:\n\n- `array_map`: transformar cada item\n- `array_filter`: manter só alguns itens\n- `array_reduce`: reduzir tudo a um valor só",
                },
                {
                    type: "code",
                    value: "<?php\n\n$precos = [10.0, 25.5, 8.0, 42.0];\n\n// Transformar: aplica 10% de desconto em cada um\n$comDesconto = array_map(fn (float $p) => $p * 0.9, $precos);\n\n// Filtrar: mantém só os acima de 10\n$caros = array_filter($precos, fn (float $p) => $p > 10);\n\n// Reduzir: soma tudo\n$total = array_reduce($precos, fn ($acc, $p) => $acc + $p, 0.0);\n\necho $total;  // 85.5",
                },
                {
                    type: "text",
                    value: "## A pegadinha do array_filter\n\n`array_filter` **preserva as chaves originais**. Se você filtrar `[0 => a, 1 => b, 2 => c]` e sobrar só o item 2, o resultado tem a chave 2, não a zero. Passar o resultado direto para `json_encode` gera um objeto em vez de uma lista.\n\nA correção é envolver com `array_values()`.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$nums = [1, 5, 10];\n$grandes = array_filter($nums, fn ($n) => $n > 4);\n\necho json_encode($grandes);\n// {"1":5,"2":10}  vira objeto, não lista\n\necho json_encode(array_values($grandes));\n// [5,10]  agora sim',
                },
                {
                    type: "quote",
                    value: "array_filter sem array_values é a causa mais comum de uma API PHP devolver objeto onde deveria devolver lista.",
                },
            ],
            questions: [
                {
                    statement: "O que `array_map` faz?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Aplica uma função a cada item e devolve o novo array",
                            isCorrect: true,
                        },
                        {
                            text: "Remove do array original os itens que não passam num teste",
                            isCorrect: false,
                        },
                        { text: "Junta todos os itens em um valor só", isCorrect: false },
                        { text: "Ordena os itens pelo valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `array_reduce` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Um único valor acumulado", isCorrect: true },
                        { text: "Um array do mesmo tamanho", isCorrect: false },
                        { text: "Um array com metade dos itens", isCorrect: false },
                        { text: "A quantidade de itens", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com as chaves depois de `array_filter`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "São preservadas, mesmo com buracos na sequência",
                            isCorrect: true,
                        },
                        { text: "São renumeradas a partir de zero", isCorrect: false },
                        { text: "Viram strings automaticamente", isCorrect: false },
                        {
                            text: "São descartadas junto com os itens que foram removidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que `json_encode` pode devolver objeto depois de um filtro?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Porque as chaves deixaram de ser uma sequência a partir de zero",
                            isCorrect: true,
                        },
                        { text: "Porque o filtro converte o array em objeto", isCorrect: false },
                        {
                            text: "Porque a função json_encode não aceita arrays que foram filtrados",
                            isCorrect: false,
                        },
                        { text: "Porque o PHP perde a ordem dos itens", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função corrige as chaves depois de filtrar?",
                    difficulty: "medio",
                    options: [
                        { text: "array_values()", isCorrect: true },
                        { text: "array_keys()", isCorrect: false },
                        { text: "sort()", isCorrect: false },
                        { text: "array_reset_keys()", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Ordenação e busca",
            blocks: [
                {
                    type: "text",
                    value: "# Uma família grande de funções de ordenação\n\nO PHP tem várias funções de ordenar, e o nome de cada uma segue um padrão que vale decorar:\n\n- começa com `a`: preserva a associação entre chave e valor\n- começa com `k`: ordena pelas chaves\n- termina com `sort` e começa com `r`: ordem decrescente\n- começa com `u`: você fornece a regra de comparação",
                },
                {
                    type: "table",
                    value: '[["Função", "Ordena por", "Preserva as chaves"], ["sort()", "valor, crescente", "não"], ["rsort()", "valor, decrescente", "não"], ["asort()", "valor, crescente", "sim"], ["ksort()", "chave, crescente", "sim"], ["usort()", "sua regra", "não"]]',
                },
                {
                    type: "code",
                    value: '<?php\n\n$notas = ["Ana" => 9.5, "Bruno" => 7.0, "Carla" => 8.2];\n\nasort($notas);   // por nota, mantendo os nomes\nksort($notas);   // por nome\n\n// Regra própria: do maior para o menor\nuasort($notas, fn ($a, $b) => $b <=> $a);',
                },
                {
                    type: "text",
                    value: "## Buscando\n\n`in_array` diz se um valor existe e `array_search` devolve a chave dele. Ambos aceitam um terceiro parâmetro para comparação estrita, e vale sempre passar `true`: sem ele, `in_array(0, ['a','b'])` chega a devolver resultados inesperados por conversão de tipo.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$cores = ["azul", "verde", "vermelho"];\n\nvar_dump(in_array("verde", $cores, true));   // bool(true)\nvar_dump(array_search("verde", $cores, true)); // int(1)\n\n// Sem o terceiro parâmetro a comparação é solta\nvar_dump(in_array(0, $cores));       // depende da conversão\nvar_dump(in_array(0, $cores, true)); // bool(false), previsível',
                },
            ],
            questions: [
                {
                    statement: "O que a função `asort()` preserva que a `sort()` não preserva?",
                    difficulty: "medio",
                    options: [
                        { text: "A ligação entre cada chave e seu valor", isCorrect: true },
                        { text: "A ordem original dos itens", isCorrect: false },
                        { text: "O tipo de cada valor", isCorrect: false },
                        { text: "A quantidade original de itens do array", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `ksort()` ordena?",
                    difficulty: "facil",
                    options: [
                        { text: "As chaves do array", isCorrect: true },
                        { text: "Os valores do array", isCorrect: false },
                        { text: "Apenas as chaves numéricas", isCorrect: false },
                        { text: "Os itens em ordem aleatória", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o prefixo `u` em `usort`?",
                    difficulty: "medio",
                    options: [
                        { text: "Indica que você fornece a regra de comparação", isCorrect: true },
                        { text: "Indica ordem decrescente", isCorrect: false },
                        { text: "Indica que as chaves são preservadas", isCorrect: false },
                        {
                            text: "Indica ordenação sem diferenciar maiúsculas e acentos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que passar `true` como terceiro argumento de `in_array`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para comparar também o tipo e evitar surpresa de conversão",
                            isCorrect: true,
                        },
                        { text: "Para tornar a busca mais rápida", isCorrect: false },
                        {
                            text: "Para que a busca alcance também os arrays aninhados no valor",
                            isCorrect: false,
                        },
                        { text: "Para devolver a chave em vez de booleano", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `array_search` devolve quando encontra o valor?",
                    difficulty: "medio",
                    options: [
                        { text: "A chave correspondente", isCorrect: true },
                        { text: "O próprio valor procurado", isCorrect: false },
                        { text: "A quantidade de ocorrências", isCorrect: false },
                        { text: "Sempre o booleano true", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Novidades do PHP 8.5, spread e destructuring",
            blocks: [
                {
                    type: "text",
                    value: "# array_first e array_last\n\nPegar o primeiro ou o último item de um array sempre exigiu contorno em PHP: `reset()` e `end()` mexem no ponteiro interno, e `$arr[0]` só funciona se as chaves forem numéricas a partir de zero.\n\nO **PHP 8.5** resolveu isso com duas funções diretas.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$notas = ["Ana" => 9.5, "Bruno" => 7.0, "Carla" => 8.2];\n\n// PHP 8.5\n$primeira = array_first($notas);  // 9.5\n$ultima = array_last($notas);     // 8.2\n\n// Como se fazia antes, com efeito colateral no ponteiro\n$primeira = reset($notas);\n$ultima = end($notas);',
                },
                {
                    type: "text",
                    value: "## Spread para juntar arrays\n\nO `...` espalha um array dentro de outro. Desde o PHP 8.1 ele funciona também com chaves de texto.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$padroes = ["tema" => "claro", "idioma" => "pt-br"];\n$doUsuario = ["tema" => "escuro"];\n\n// O que vem depois vence em caso de chave repetida\n$config = [...$padroes, ...$doUsuario];\n// ["tema" => "escuro", "idioma" => "pt-br"]',
                },
                {
                    type: "text",
                    value: "## Destructuring\n\nDesmontar um array em variáveis separadas evita uma sequência de acessos por índice. Com chaves de texto, você escolhe o que quer.",
                },
                {
                    type: "code",
                    value: '<?php\n\n[$primeiro, $segundo] = ["a", "b"];\n\n$usuario = ["nome" => "Ana", "idade" => 28, "cidade" => "Recife"];\n["nome" => $nome, "cidade" => $cidade] = $usuario;\n\necho "$nome mora em $cidade";\n\n// Em foreach, direto na assinatura\nforeach ($pedidos as ["id" => $id, "total" => $total]) {\n    echo "Pedido $id: $total\\n";\n}',
                },
            ],
            questions: [
                {
                    statement: "O que `array_first()` do PHP 8.5 devolve?",
                    difficulty: "facil",
                    options: [
                        { text: "O primeiro valor do array", isCorrect: true },
                        { text: "A primeira chave do array", isCorrect: false },
                        { text: "O array sem o primeiro item", isCorrect: false },
                        { text: "A quantidade de itens", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual problema de `reset()` e `end()` as novas funções evitam?",
                    difficulty: "dificil",
                    options: [
                        { text: "Elas mexem no ponteiro interno do array", isCorrect: true },
                        {
                            text: "Elas não funcionam com chaves de texto no array",
                            isCorrect: false,
                        },
                        { text: "Elas são muito mais lentas", isCorrect: false },
                        { text: "Elas devolvem a chave em vez do valor", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Em `[...$a, ...$b]`, quem vence quando a mesma chave de texto aparece nos dois?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor do que vem depois", isCorrect: true },
                        { text: "O valor do que vem antes", isCorrect: false },
                        { text: "As duas viram um array aninhado", isCorrect: false },
                        { text: "O PHP lança um erro de chave duplicada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `['nome' => $n] = $usuario;` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Coloca o valor da chave nome dentro de `$n`", isCorrect: true },
                        { text: "Cria a chave nome no array", isCorrect: false },
                        { text: "Renomeia a chave nome para n dentro do array", isCorrect: false },
                        { text: "Remove a chave nome do array", isCorrect: false },
                    ],
                },
                {
                    statement: "É possível desmontar o array direto na assinatura do foreach?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, informando as chaves entre colchetes", isCorrect: true },
                        { text: "Não, só dentro do corpo do laço", isCorrect: false },
                        { text: "Só com arrays de chaves numéricas em ordem", isCorrect: false },
                        { text: "Só a partir do PHP 8.5", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Arrays multidimensionais e JSON",
            blocks: [
                {
                    type: "text",
                    value: "# Arrays dentro de arrays\n\nUm array pode guardar outros arrays, e é assim que se representa uma tabela, uma lista de registros ou uma configuração aninhada.\n\nO acesso encadeia os colchetes.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$alunos = [\n    ["nome" => "Ana", "notas" => [9.5, 8.0]],\n    ["nome" => "Bruno", "notas" => [7.0, 6.5]],\n];\n\necho $alunos[0]["nome"];       // Ana\necho $alunos[0]["notas"][1];   // 8\n\nforeach ($alunos as $aluno) {\n    $media = array_sum($aluno["notas"]) / count($aluno["notas"]);\n    printf("%s: %.1f\\n", $aluno["nome"], $media);\n}',
                },
                {
                    type: "text",
                    value: "## Convertendo para JSON\n\n`json_encode()` transforma array em texto JSON e `json_decode()` faz o caminho de volta. O segundo parâmetro `true` do decode pede array associativo em vez de objeto.\n\nDuas flags valem sempre em API pública: `JSON_UNESCAPED_UNICODE`, para acentos não virarem códigos, e `JSON_THROW_ON_ERROR`, para falha virar exceção em vez de `false` silencioso.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$dados = ["nome" => "Ana", "cidade" => "São Paulo"];\n\n$json = json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);\necho $json;  // {"nome":"Ana","cidade":"São Paulo"}\n\n$devolta = json_decode($json, true);\necho $devolta["cidade"];  // São Paulo',
                },
                {
                    type: "table",
                    value: '[["Flag", "Para que serve"], ["JSON_UNESCAPED_UNICODE", "mantém acentos legíveis"], ["JSON_UNESCAPED_SLASHES", "não escapa a barra em URLs"], ["JSON_PRETTY_PRINT", "quebra linhas para leitura"], ["JSON_THROW_ON_ERROR", "erro vira exceção"]]',
                },
            ],
            questions: [
                {
                    statement:
                        "Como se acessa a segunda nota do primeiro aluno em `$alunos[0]['notas']`?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `$alunos[0]['notas'][1]`", isCorrect: true },
                        { text: "Com `$alunos[0]['notas'][2]`", isCorrect: false },
                        { text: "Com `$alunos[1]['notas'][0]`", isCorrect: false },
                        { text: "Com `$alunos['notas'][0][1]`", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o segundo parâmetro `true` de `json_decode` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve array associativo em vez de objeto", isCorrect: true },
                        { text: "Valida o JSON antes de converter", isCorrect: false },
                        { text: "Mantém os acentos sem escapar", isCorrect: false },
                        {
                            text: "Formata o resultado do JSON com quebras de linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve a flag `JSON_THROW_ON_ERROR`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Fazer a falha virar exceção em vez de retorno falso",
                            isCorrect: true,
                        },
                        { text: "Impedir que o JSON tenha erros", isCorrect: false },
                        {
                            text: "Registrar o erro da conversão em um arquivo de log próprio",
                            isCorrect: false,
                        },
                        { text: "Ignorar chaves inválidas em silêncio", isCorrect: false },
                    ],
                },
                {
                    statement: "Sem `JSON_UNESCAPED_UNICODE`, o que acontece com acentos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Viram sequências de escape no texto gerado", isCorrect: true },
                        { text: "São removidos do resultado", isCorrect: false },
                        { text: "Geram um erro de codificação", isCorrect: false },
                        {
                            text: "São convertidos para as letras equivalentes sem acento",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual função transforma um array PHP em texto JSON?",
                    difficulty: "facil",
                    options: [
                        { text: "json_encode()", isCorrect: true },
                        { text: "json_decode()", isCorrect: false },
                        { text: "serialize()", isCorrect: false },
                        { text: "json_parse()", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Orientação a objetos",
    aulas: [
        {
            titulo: "Classes, propriedades e métodos",
            blocks: [
                {
                    type: "text",
                    value: "# Do array ao objeto\n\nArrays associativos servem para dados soltos, mas não garantem nada: qualquer chave pode faltar, qualquer tipo pode entrar.\n\nUma **classe** define a forma de um dado e o comportamento que anda junto com ele. O objeto é uma instância dessa forma.",
                },
                {
                    type: "code",
                    value: '<?php\n\nclass Produto\n{\n    public string $nome;\n    public float $preco;\n\n    public function __construct(string $nome, float $preco)\n    {\n        $this->nome = $nome;\n        $this->preco = $preco;\n    }\n\n    public function precoComDesconto(float $percentual): float\n    {\n        return $this->preco * (1 - $percentual);\n    }\n}\n\n$camisa = new Produto("Camisa", 79.90);\necho $camisa->precoComDesconto(0.10);  // 71.91',
                },
                {
                    type: "text",
                    value: "## O `$this` e a seta\n\nDentro da classe, `$this` aponta para o objeto atual. A seta `->` acessa propriedades e métodos, tanto dentro quanto fora.\n\n## Visibilidade\n\nTrês níveis controlam quem enxerga o quê. A regra prática: comece com `private` e só abra o que precisa ser usado de fora.",
                },
                {
                    type: "table",
                    value: '[["Modificador", "Quem enxerga"], ["public", "qualquer código"], ["protected", "a própria classe e as filhas"], ["private", "só a própria classe"]]',
                },
            ],
            questions: [
                {
                    statement: "O que `$this` representa dentro de uma classe?",
                    difficulty: "facil",
                    options: [
                        { text: "O objeto sobre o qual o método foi chamado", isCorrect: true },
                        { text: "A classe em si, não a instância", isCorrect: false },
                        {
                            text: "O último objeto que foi criado durante o script",
                            isCorrect: false,
                        },
                        { text: "A classe pai da hierarquia", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método é executado ao criar o objeto com `new`?",
                    difficulty: "facil",
                    options: [
                        { text: "__construct", isCorrect: true },
                        { text: "__init", isCorrect: false },
                        { text: "__new", isCorrect: false },
                        { text: "__initialize", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem enxerga uma propriedade `protected`?",
                    difficulty: "medio",
                    options: [
                        { text: "A própria classe e as classes filhas", isCorrect: true },
                        { text: "Somente a própria classe", isCorrect: false },
                        { text: "Qualquer código do projeto", isCorrect: false },
                        { text: "Apenas as classes do mesmo arquivo PHP", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual visibilidade adotar por padrão ao criar uma propriedade?",
                    difficulty: "medio",
                    options: [
                        { text: "private, abrindo só o necessário", isCorrect: true },
                        { text: "public, para facilitar o acesso", isCorrect: false },
                        { text: "protected, para permitir herança", isCorrect: false },
                        { text: "Nenhuma, deixando o padrão da linguagem", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de uma classe sobre um array associativo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ela garante a forma do dado e reúne o comportamento",
                            isCorrect: true,
                        },
                        { text: "Ela ocupa menos memória sempre", isCorrect: false },
                        {
                            text: "Ela é convertida para JSON de forma totalmente automática",
                            isCorrect: false,
                        },
                        { text: "Ela dispensa a declaração de tipos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Construtor promovido, readonly e getters",
            blocks: [
                {
                    type: "text",
                    value: "# Menos repetição no construtor\n\nDeclarar a propriedade, receber no construtor e atribuir é a mesma informação escrita três vezes. Desde o PHP 8.0 a **promoção de propriedades** resolve isso: basta pôr a visibilidade no parâmetro.",
                },
                {
                    type: "code",
                    value: "<?php\n\n// Antes\nclass Produto\n{\n    private string $nome;\n    private float $preco;\n\n    public function __construct(string $nome, float $preco)\n    {\n        $this->nome = $nome;\n        $this->preco = $preco;\n    }\n}\n\n// Com promoção: mesma coisa, uma vez só\nclass Produto\n{\n    public function __construct(\n        private string $nome,\n        private float $preco,\n    ) {}\n}",
                },
                {
                    type: "text",
                    value: "## readonly\n\nUma propriedade `readonly` só pode ser escrita uma vez, dentro do escopo da própria classe. Depois disso qualquer tentativa de mudança vira erro.\n\nIsso dá objetos imutáveis quase de graça, e imutabilidade elimina uma classe inteira de bug: o valor não muda pelas costas de quem está usando.",
                },
                {
                    type: "code",
                    value: '<?php\n\nfinal class Cpf\n{\n    public function __construct(\n        public readonly string $numero,\n    ) {\n        if (strlen($numero) !== 11) {\n            throw new InvalidArgumentException("CPF precisa de 11 dígitos");\n        }\n    }\n}\n\n$cpf = new Cpf("12345678901");\necho $cpf->numero;        // funciona\n$cpf->numero = "outro";   // Error: não pode modificar readonly',
                },
                {
                    type: "quote",
                    value: "Validar no construtor e marcar readonly significa que, se o objeto existe, ele é válido. Nenhum método precisa checar de novo.",
                },
            ],
            questions: [
                {
                    statement: "O que a promoção de propriedades no construtor evita?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Declarar e atribuir a mesma propriedade duas vezes",
                            isCorrect: true,
                        },
                        { text: "Precisar declarar tipos nos parâmetros", isCorrect: false },
                        {
                            text: "A necessidade de usar `new` para criar um objeto novo",
                            isCorrect: false,
                        },
                        { text: "Ter mais de um parâmetro no construtor", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas vezes uma propriedade `readonly` pode ser escrita?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma só, no escopo da própria classe", isCorrect: true },
                        { text: "Quantas vezes quiser, de dentro da classe", isCorrect: false },
                        { text: "Nenhuma, ela é sempre nula", isCorrect: false },
                        { text: "Uma por método da classe", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece ao tentar alterar uma propriedade readonly já preenchida?",
                    difficulty: "medio",
                    options: [
                        { text: "É lançado um Error", isCorrect: true },
                        { text: "O valor é alterado com um aviso", isCorrect: false },
                        { text: "A alteração é ignorada em silêncio", isCorrect: false },
                        { text: "A propriedade volta ao valor padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Validar no construtor e usar readonly garante o quê?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Que todo objeto existente está em estado válido",
                            isCorrect: true,
                        },
                        { text: "Que o objeto ocupa menos memória", isCorrect: false },
                        { text: "Que a classe não pode ser estendida", isCorrect: false },
                        {
                            text: "Que os métodos da classe passam a executar mais rápido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Onde a visibilidade é escrita na promoção de propriedades?",
                    difficulty: "facil",
                    options: [
                        { text: "No próprio parâmetro do construtor", isCorrect: true },
                        { text: "Em uma linha separada acima do construtor", isCorrect: false },
                        { text: "Depois do corpo do construtor", isCorrect: false },
                        { text: "No nome da classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Herança, classes abstratas e interfaces",
            blocks: [
                {
                    type: "text",
                    value: "# Herança\n\nUma classe pode estender outra e receber suas propriedades e métodos. A filha pode substituir um método, e chama a versão do pai com `parent::`.\n\nO PHP tem **herança simples**: cada classe estende no máximo uma.",
                },
                {
                    type: "code",
                    value: '<?php\n\nabstract class Funcionario\n{\n    public function __construct(protected string $nome, protected float $salarioBase) {}\n\n    // Sem corpo: cada filha é obrigada a implementar\n    abstract public function calcularSalario(): float;\n\n    public function descrever(): string\n    {\n        return "{$this->nome}: " . number_format($this->calcularSalario(), 2);\n    }\n}\n\nclass Vendedor extends Funcionario\n{\n    public function __construct(string $nome, float $base, private float $comissao)\n    {\n        parent::__construct($nome, $base);\n    }\n\n    public function calcularSalario(): float\n    {\n        return $this->salarioBase + $this->comissao;\n    }\n}',
                },
                {
                    type: "text",
                    value: "## Classe abstrata x interface\n\nA **classe abstrata** é uma classe incompleta: pode ter código pronto e obriga as filhas a preencher o que falta. A **interface** é só um contrato de assinaturas, sem implementação.\n\nA diferença que decide qual usar: uma classe estende **uma** abstrata, mas implementa **quantas** interfaces quiser.",
                },
                {
                    type: "code",
                    value: "<?php\n\ninterface Notificavel\n{\n    public function enviar(string $mensagem): bool;\n}\n\ninterface Registravel\n{\n    public function registrar(): void;\n}\n\nclass EmailService implements Notificavel, Registravel\n{\n    public function enviar(string $mensagem): bool { /* ... */ return true; }\n    public function registrar(): void { /* ... */ }\n}",
                },
                {
                    type: "table",
                    value: '[["", "Classe abstrata", "Interface"], ["Tem código pronto", "sim", "não"], ["Tem propriedades", "sim", "não"], ["Quantas por classe", "uma", "várias"], ["Instanciável", "não", "não"]]',
                },
            ],
            questions: [
                {
                    statement: "Quantas classes uma classe PHP pode estender?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma", isCorrect: true },
                        { text: "Quantas quiser", isCorrect: false },
                        { text: "Duas, no máximo", isCorrect: false },
                        { text: "Nenhuma", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `parent::` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Chama a versão do método na classe pai", isCorrect: true },
                        { text: "Cria uma instância da classe pai", isCorrect: false },
                        { text: "Impede a filha de sobrescrever o método", isCorrect: false },
                        { text: "Aponta para a interface implementada", isCorrect: false },
                    ],
                },
                {
                    statement: "Um método `abstract` tem corpo?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Não, só a assinatura, e a filha é obrigada a implementar",
                            isCorrect: true,
                        },
                        {
                            text: "Sim, com corpo, e a classe filha não pode alterá-lo depois",
                            isCorrect: false,
                        },
                        { text: "Sim, mas o corpo é ignorado", isCorrect: false },
                        { text: "Depende da visibilidade declarada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença prática que decide entre abstrata e interface?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Interfaces podem ser várias por classe, abstrata só uma",
                            isCorrect: true,
                        },
                        { text: "Interfaces executam mais rápido", isCorrect: false },
                        {
                            text: "Abstratas não podem declarar métodos públicos nem privados",
                            isCorrect: false,
                        },
                        { text: "Interfaces permitem propriedades tipadas", isCorrect: false },
                    ],
                },
                {
                    statement: "É possível criar um objeto direto de uma classe abstrata?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, ela precisa ser estendida", isCorrect: true },
                        { text: "Sim, como qualquer classe", isCorrect: false },
                        { text: "Sim, se todos os métodos tiverem corpo", isCorrect: false },
                        { text: "Só dentro da própria classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Traits, static e constantes de classe",
            blocks: [
                {
                    type: "text",
                    value: "# Traits: reaproveitar sem herdar\n\nComo o PHP tem herança simples, sobra o problema de compartilhar um comportamento entre classes que não têm parentesco. O **trait** resolve: é um bloco de métodos que a classe absorve com `use`.",
                },
                {
                    type: "code",
                    value: '<?php\n\ntrait RegistraLog\n{\n    public function log(string $mensagem): void\n    {\n        $agora = date("Y-m-d H:i:s");\n        echo "[$agora] " . static::class . ": $mensagem\\n";\n    }\n}\n\nclass Pedido\n{\n    use RegistraLog;\n}\n\nclass Usuario\n{\n    use RegistraLog;\n}\n\n(new Pedido())->log("criado");  // [2026-07-30 09:00:00] Pedido: criado',
                },
                {
                    type: "text",
                    value: "## static: o que pertence à classe\n\nPropriedades e métodos `static` pertencem à classe, não a cada objeto. Acessa-se com `::` sem precisar instanciar.\n\nUsar `static` com moderação: estado estático é global disfarçado, e dificulta teste.",
                },
                {
                    type: "code",
                    value: '<?php\n\nclass Config\n{\n    public const VERSAO = "1.0";\n    private static array $valores = [];\n\n    public static function set(string $chave, mixed $valor): void\n    {\n        self::$valores[$chave] = $valor;\n    }\n\n    public static function get(string $chave): mixed\n    {\n        return self::$valores[$chave] ?? null;\n    }\n}\n\nConfig::set("tema", "escuro");\necho Config::get("tema");  // escuro\necho Config::VERSAO;       // 1.0',
                },
                {
                    type: "quote",
                    value: "self:: aponta para a classe onde o código foi escrito. static:: aponta para a classe que foi realmente chamada, respeitando herança.",
                },
            ],
            questions: [
                {
                    statement: "Que problema o trait resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Compartilhar comportamento entre classes sem parentesco",
                            isCorrect: true,
                        },
                        {
                            text: "Permitir a herança múltipla de estado entre várias classes",
                            isCorrect: false,
                        },
                        { text: "Substituir o uso de interfaces", isCorrect: false },
                        { text: "Criar objetos sem construtor", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se acessa um membro `static`?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `::` a partir do nome da classe", isCorrect: true },
                        { text: "Com `->` a partir de um objeto criado", isCorrect: false },
                        { text: "Com `=>` dentro de um array", isCorrect: false },
                        { text: "Com `parent::` apenas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual palavra-chave a classe usa para absorver um trait?",
                    difficulty: "facil",
                    options: [
                        { text: "use", isCorrect: true },
                        { text: "extends", isCorrect: false },
                        { text: "implements", isCorrect: false },
                        { text: "include", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `self::` e `static::`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O static respeita a classe realmente chamada na herança",
                            isCorrect: true,
                        },
                        { text: "O self é mais rápido de resolver", isCorrect: false },
                        {
                            text: "O static só pode ser usado dentro de métodos declarados abstratos",
                            isCorrect: false,
                        },
                        { text: "O self funciona apenas em traits", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar estado `static` com moderação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Ele é estado global disfarçado e dificulta os testes",
                            isCorrect: true,
                        },
                        {
                            text: "Ele consome muito mais memória que uma propriedade comum",
                            isCorrect: false,
                        },
                        { text: "Ele não funciona com herança", isCorrect: false },
                        { text: "Ele exige PHP 8.5 ou superior", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Enums",
            blocks: [
                {
                    type: "text",
                    value: '# O fim das constantes soltas\n\nAntes, um conjunto fixo de valores virava constante de classe ou string mágica espalhada pelo código. Nada impedia alguém de passar `"pendnete"` com erro de digitação.\n\nO **enum**, do PHP 8.1, cria um tipo com valores fechados. O que não é um caso do enum não passa pela assinatura.',
                },
                {
                    type: "code",
                    value: '<?php\n\nenum StatusPedido: string\n{\n    case Pendente = "pendente";\n    case Pago = "pago";\n    case Enviado = "enviado";\n    case Cancelado = "cancelado";\n}\n\nfunction atualizar(StatusPedido $status): void\n{\n    echo $status->value;\n}\n\natualizar(StatusPedido::Pago);   // pago\natualizar("pago");                // TypeError',
                },
                {
                    type: "text",
                    value: "## Enum com comportamento\n\nEnums aceitam métodos e podem implementar interfaces. Isso permite guardar junto do caso a regra que depende dele, em vez de espalhar `match` pelo sistema.",
                },
                {
                    type: "code",
                    value: '<?php\n\nenum StatusPedido: string\n{\n    case Pendente = "pendente";\n    case Pago = "pago";\n    case Cancelado = "cancelado";\n\n    public function rotulo(): string\n    {\n        return match($this) {\n            self::Pendente => "Aguardando pagamento",\n            self::Pago => "Pagamento confirmado",\n            self::Cancelado => "Pedido cancelado",\n        };\n    }\n\n    public function podeCancelar(): bool\n    {\n        return $this === self::Pendente;\n    }\n}\n\necho StatusPedido::Pendente->rotulo();',
                },
                {
                    type: "text",
                    value: "## Puro e atrelado\n\nUm enum **puro** só tem os casos. Um enum **atrelado**, com `: string` ou `: int`, guarda um valor por caso, o que é o que você grava no banco.\n\nO atrelado ganha `from()`, que lança exceção se o valor não existir, e `tryFrom()`, que devolve `null`. Todo enum tem `cases()`, que lista tudo.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$status = StatusPedido::from("pago");        // StatusPedido::Pago\n$status = StatusPedido::tryFrom("invalido"); // null, sem exceção\n\nforeach (StatusPedido::cases() as $caso) {\n    echo $caso->name . " = " . $caso->value . "\\n";\n}',
                },
            ],
            questions: [
                {
                    statement: "Qual problema o enum resolve?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Impedir que valores fora do conjunto entrem no código",
                            isCorrect: true,
                        },
                        { text: "Reduzir o uso de memória das constantes", isCorrect: false },
                        { text: "Permitir herança múltipla", isCorrect: false },
                        {
                            text: "Converter os valores para JSON de forma totalmente automática",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a diferença entre `from()` e `tryFrom()`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "O tryFrom devolve null em vez de lançar exceção",
                            isCorrect: true,
                        },
                        { text: "O from aceita apenas inteiros", isCorrect: false },
                        { text: "O tryFrom só funciona em enums puros", isCorrect: false },
                        {
                            text: "O from lista todos os casos existentes dentro do enum",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `StatusPedido::cases()` devolve?",
                    difficulty: "facil",
                    options: [
                        { text: "Todos os casos do enum", isCorrect: true },
                        { text: "Apenas o primeiro caso", isCorrect: false },
                        { text: "Os valores em formato de string", isCorrect: false },
                        { text: "A quantidade de casos declarados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que diferencia um enum atrelado de um puro?",
                    difficulty: "medio",
                    options: [
                        { text: "O atrelado guarda um valor por caso", isCorrect: true },
                        { text: "O atrelado não aceita métodos", isCorrect: false },
                        { text: "O puro pode implementar interfaces", isCorrect: false },
                        { text: "O puro aceita mais de cinquenta casos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de pôr um método dentro do enum?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "A regra fica junto do caso, sem match espalhado no sistema",
                            isCorrect: true,
                        },
                        { text: "O enum passa a aceitar valores novos", isCorrect: false },
                        {
                            text: "Os casos deixam de exigir um tipo declarado nas assinaturas",
                            isCorrect: false,
                        },
                        { text: "O enum pode ser instanciado com new", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Erros, exceções e qualidade",
    aulas: [
        {
            titulo: "Erros, avisos e o que o PHP faz com eles",
            blocks: [
                {
                    type: "text",
                    value: "# Nem todo problema para o script\n\nO PHP classifica problemas em níveis. Alguns interrompem tudo, outros só avisam e a execução continua, o que costuma ser pior: o bug segue escondido.\n\nNo PHP 8 muita coisa que era aviso virou erro, e isso foi bom: falhar cedo é melhor que produzir resultado errado em silêncio.",
                },
                {
                    type: "table",
                    value: '[["Nível", "Para o script", "Exemplo"], ["Fatal error", "sim", "chamar função que não existe"], ["Warning", "não", "abrir arquivo inexistente"], ["Notice", "não", "usar variável indefinida"], ["Deprecated", "não", "usar recurso obsoleto"]]',
                },
                {
                    type: "text",
                    value: "## Configurando o que aparece\n\nEm desenvolvimento você quer ver tudo. Em produção, o oposto: nada de erro na tela do usuário, tudo no log.",
                },
                {
                    type: "code",
                    value: '<?php\n\n// Desenvolvimento\nini_set("display_errors", "1");\nerror_reporting(E_ALL);\n\n// Produção\nini_set("display_errors", "0");\nini_set("log_errors", "1");\nini_set("error_log", "/var/log/php/app.log");',
                },
                {
                    type: "quote",
                    value: "Erro na tela em produção vaza caminho de arquivo, versão e às vezes credencial. Em produção, log sempre, tela nunca.",
                },
            ],
            questions: [
                {
                    statement: "Qual nível de problema interrompe a execução do script?",
                    difficulty: "facil",
                    options: [
                        { text: "Fatal error", isCorrect: true },
                        { text: "Warning", isCorrect: false },
                        { text: "Notice", isCorrect: false },
                        { text: "Deprecated notice", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que exibir erros em produção é perigoso?",
                    difficulty: "medio",
                    options: [
                        { text: "Vaza caminhos, versões e às vezes credenciais", isCorrect: true },
                        { text: "Deixa o site mais lento", isCorrect: false },
                        { text: "Impede o log de funcionar", isCorrect: false },
                        {
                            text: "Consome memória demais do servidor de produção",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `error_reporting(E_ALL)` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Manda reportar todos os níveis de problema", isCorrect: true },
                        {
                            text: "Interrompe o script já no primeiro aviso emitido",
                            isCorrect: false,
                        },
                        { text: "Desliga o relatório de erros", isCorrect: false },
                        { text: "Grava os erros em um arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que um Warning pode ser pior que um erro fatal?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O script continua e produz resultado errado sem ninguém notar",
                            isCorrect: true,
                        },
                        {
                            text: "Ele acaba consumindo bem mais memória do que um erro fatal comum",
                            isCorrect: false,
                        },
                        { text: "Ele não aparece nos logs do servidor", isCorrect: false },
                        { text: "Ele impede o uso de exceções", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no PHP 8 quanto aos níveis de erro?",
                    difficulty: "medio",
                    options: [
                        { text: "Vários avisos passaram a ser erros", isCorrect: true },
                        { text: "Todos os erros viraram avisos", isCorrect: false },
                        { text: "Os níveis foram unificados em um só", isCorrect: false },
                        { text: "Os avisos deixaram de existir", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Exceções: try, catch e finally",
            blocks: [
                {
                    type: "text",
                    value: "# Interrompendo com contexto\n\nUma exceção é um objeto que representa uma falha. Quando lançada, ela interrompe o fluxo e sobe pela pilha de chamadas até alguém tratá-la.\n\nA vantagem sobre devolver `false`: a exceção carrega mensagem, código e o rastro de onde nasceu.",
                },
                {
                    type: "code",
                    value: '<?php\n\nfunction dividir(float $a, float $b): float\n{\n    if ($b === 0.0) {\n        throw new InvalidArgumentException("Divisão por zero");\n    }\n    return $a / $b;\n}\n\ntry {\n    echo dividir(10, 0);\n} catch (InvalidArgumentException $e) {\n    echo "Falhou: " . $e->getMessage();\n} finally {\n    echo "Isto roda sempre";\n}',
                },
                {
                    type: "text",
                    value: "## A ordem dos catch importa\n\nO PHP usa o primeiro `catch` compatível. Se o mais genérico vier primeiro, os específicos abaixo nunca rodam. Vá do mais específico ao mais genérico.\n\nUm `catch` pode tratar vários tipos com a barra vertical.",
                },
                {
                    type: "code",
                    value: '<?php\n\ntry {\n    processar();\n} catch (ArquivoNaoEncontrado | PermissaoNegada $e) {\n    echo "Problema de arquivo: " . $e->getMessage();\n} catch (RuntimeException $e) {\n    echo "Erro de execução";\n} catch (Throwable $e) {\n    // Throwable pega exceções e erros do PHP\n    echo "Algo inesperado";\n}',
                },
                {
                    type: "table",
                    value: '[["Método", "O que devolve"], ["getMessage()", "a mensagem da falha"], ["getCode()", "o código numérico"], ["getFile() e getLine()", "onde foi lançada"], ["getPrevious()", "a exceção anterior encadeada"], ["getTraceAsString()", "o rastro em texto"]]',
                },
            ],
            questions: [
                {
                    statement: "Quando o bloco `finally` é executado?",
                    difficulty: "medio",
                    options: [
                        { text: "Sempre, com ou sem exceção", isCorrect: true },
                        { text: "Só quando uma exceção é lançada", isCorrect: false },
                        { text: "Só quando nada dá errado", isCorrect: false },
                        { text: "Apenas se não houver `catch`", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que ordem os blocos `catch` devem ser escritos?",
                    difficulty: "dificil",
                    options: [
                        { text: "Do tipo mais específico para o mais genérico", isCorrect: true },
                        {
                            text: "Do tipo mais genérico para o tipo mais específico",
                            isCorrect: false,
                        },
                        { text: "Em ordem alfabética dos tipos", isCorrect: false },
                        { text: "A ordem não faz diferença", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método devolve a mensagem de uma exceção?",
                    difficulty: "facil",
                    options: [
                        { text: "getMessage()", isCorrect: true },
                        { text: "getText()", isCorrect: false },
                        { text: "getErrorText()", isCorrect: false },
                        { text: "message()", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `Throwable` alcança que `Exception` não alcança?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Também os erros internos do PHP, como TypeError",
                            isCorrect: true,
                        },
                        { text: "Apenas as exceções que você criou", isCorrect: false },
                        { text: "Somente os avisos e notices", isCorrect: false },
                        {
                            text: "Apenas as exceções lançadas dentro de um finally",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a vantagem de lançar exceção em vez de devolver `false`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A exceção carrega mensagem e o rastro de onde nasceu",
                            isCorrect: true,
                        },
                        { text: "A exceção é sempre mais rápida", isCorrect: false },
                        {
                            text: "O `false` não pode ser retornado por uma função tipada",
                            isCorrect: false,
                        },
                        { text: "A exceção dispensa o uso de try", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Exceções próprias e hierarquia",
            blocks: [
                {
                    type: "text",
                    value: "# Criando o seu tipo de falha\n\nUma exceção própria é uma classe que estende `Exception`. Ela deixa o `catch` preciso: você trata o que sabe tratar e deixa o resto subir.\n\nO padrão que funciona bem é uma exceção base por domínio, e as específicas abaixo dela.",
                },
                {
                    type: "code",
                    value: '<?php\n\nclass PagamentoException extends Exception {}\n\nclass SaldoInsuficiente extends PagamentoException\n{\n    public function __construct(\n        public readonly float $faltam,\n    ) {\n        parent::__construct("Faltam R$ " . number_format($faltam, 2));\n    }\n}\n\nclass CartaoRecusado extends PagamentoException {}\n\ntry {\n    cobrar($pedido);\n} catch (SaldoInsuficiente $e) {\n    avisarCliente($e->faltam);\n} catch (PagamentoException $e) {\n    // pega CartaoRecusado e qualquer outra do domínio\n    registrarFalha($e);\n}',
                },
                {
                    type: "text",
                    value: "## Encadeando\n\nO terceiro parâmetro do construtor recebe a exceção anterior. Isso preserva a causa original enquanto você lança uma de nível mais alto, e é o que permite entender a origem no log.",
                },
                {
                    type: "code",
                    value: '<?php\n\ntry {\n    $this->gateway->cobrar($valor);\n} catch (ConnectionException $e) {\n    throw new PagamentoException(\n        "Não foi possível cobrar agora",\n        previous: $e,\n    );\n}\n\n// Mais tarde, no log\necho $e->getPrevious()?->getMessage();',
                },
                {
                    type: "quote",
                    value: "Capture o específico, trate o que sabe tratar, e deixe subir o que você não sabe. Um catch genérico que engole tudo esconde bug.",
                },
            ],
            questions: [
                {
                    statement: "Uma exceção própria estende qual classe, no caso mais comum?",
                    difficulty: "facil",
                    options: [
                        { text: "Exception", isCorrect: true },
                        { text: "Error", isCorrect: false },
                        { text: "Throwable diretamente", isCorrect: false },
                        { text: "stdClass", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de uma exceção base por domínio?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Permite capturar o domínio inteiro com um catch só",
                            isCorrect: true,
                        },
                        {
                            text: "Faz as exceções daquele domínio ocuparem menos memória",
                            isCorrect: false,
                        },
                        { text: "Dispensa o uso de try nos chamadores", isCorrect: false },
                        { text: "Impede que a exceção suba na pilha", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o parâmetro `previous` guarda?",
                    difficulty: "medio",
                    options: [
                        { text: "A exceção original que causou esta", isCorrect: true },
                        { text: "A mensagem em outro idioma", isCorrect: false },
                        { text: "O código numérico da falha", isCorrect: false },
                        { text: "O nome do arquivo onde ela ocorreu", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que evitar um `catch (Throwable)` que apenas ignora?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ele engole bugs reais e some com o rastro do problema",
                            isCorrect: true,
                        },
                        {
                            text: "Ele acaba deixando a execução do script bem mais lenta",
                            isCorrect: false,
                        },
                        { text: "Ele não compila em PHP 8.5", isCorrect: false },
                        { text: "Ele impede o uso de finally", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se recupera a exceção encadeada?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `getPrevious()`", isCorrect: true },
                        { text: "Com `getParent()`", isCorrect: false },
                        { text: "Com `getCause()`", isCorrect: false },
                        { text: "Com `getRootCause()`", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Depuração e o stack trace do PHP 8.5",
            blocks: [
                {
                    type: "text",
                    value: "# Enxergando onde quebrou\n\nAté o PHP 8.4, um erro fatal mostrava apenas a mensagem e a linha. Descobrir **qual caminho** levou até ali exigia instalar extensão ou espalhar log pelo código.\n\nO **PHP 8.5** passou a incluir o **stack trace nos erros fatais**, o que reduz muito o tempo de diagnóstico em produção.",
                },
                {
                    type: "code",
                    value: "PHP Fatal error:  Uncaught TypeError: dobrar(): Argument #1 ($n)\nmust be of type int, string given in /app/calc.php:6\nStack trace:\n#0 /app/relatorio.php(14): dobrar('abc')\n#1 /app/index.php(3): gerarRelatorio()\n#2 {main}",
                },
                {
                    type: "text",
                    value: "## Handlers globais\n\nVocê pode registrar uma função que trata qualquer exceção não capturada, e outra para erros. É assim que se manda tudo para um log estruturado em vez de deixar na tela.\n\nOutra novidade do 8.5: `get_exception_handler()` e `get_error_handler()` permitem **descobrir qual handler está registrado**, o que antes era impossível e atrapalhava bibliotecas que precisavam encadear.",
                },
                {
                    type: "code",
                    value: '<?php\n\nset_exception_handler(function (Throwable $e): void {\n    error_log(sprintf(\n        "[%s] %s em %s:%d",\n        $e::class,\n        $e->getMessage(),\n        $e->getFile(),\n        $e->getLine(),\n    ));\n    http_response_code(500);\n    echo "Erro interno. Tente novamente.";\n});\n\n// PHP 8.5: dá para saber o que já está registrado\n$atual = get_exception_handler();',
                },
                {
                    type: "text",
                    value: "## Ferramentas de depuração\n\n`var_dump()` serve para uma olhada rápida. Para trabalho sério, o **Xdebug** permite parar a execução e inspecionar variáveis passo a passo, o que é infinitamente mais produtivo que espalhar `echo` pelo código.",
                },
            ],
            questions: [
                {
                    statement: "O que o PHP 8.5 passou a incluir nos erros fatais?",
                    difficulty: "medio",
                    options: [
                        { text: "O stack trace da execução", isCorrect: true },
                        { text: "O valor de todas as variáveis", isCorrect: false },
                        { text: "A sugestão de correção do erro", isCorrect: false },
                        { text: "O tempo de execução do script", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `set_exception_handler()`?",
                    difficulty: "medio",
                    options: [
                        { text: "Tratar qualquer exceção que não foi capturada", isCorrect: true },
                        { text: "Impedir que exceções sejam lançadas", isCorrect: false },
                        { text: "Registrar exceções somente em desenvolvimento", isCorrect: false },
                        { text: "Converter avisos em exceções", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `get_exception_handler()` do PHP 8.5 permite?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Descobrir qual handler está registrado no momento",
                            isCorrect: true,
                        },
                        { text: "Remover o handler registrado", isCorrect: false },
                        { text: "Executar o handler manualmente", isCorrect: false },
                        {
                            text: "Listar todas as exceções que já foram lançadas antes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual ferramenta permite parar a execução e inspecionar variáveis?",
                    difficulty: "facil",
                    options: [
                        { text: "O Xdebug", isCorrect: true },
                        { text: "O Composer", isCorrect: false },
                        { text: "O var_dump", isCorrect: false },
                        { text: "O Packagist", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o stack trace no erro fatal reduz o tempo de diagnóstico?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Mostra o caminho de chamadas que levou até a falha",
                            isCorrect: true,
                        },
                        { text: "Impede que o erro aconteça de novo", isCorrect: false },
                        {
                            text: "Corrige o tipo do argumento de forma totalmente automática",
                            isCorrect: false,
                        },
                        { text: "Envia o erro para o desenvolvedor por email", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "PSR, atributos e ferramentas de qualidade",
            blocks: [
                {
                    type: "text",
                    value: "# Os padrões da comunidade\n\nAs **PSR** são recomendações publicadas pelo PHP-FIG que padronizam como o código PHP é escrito e organizado. Seguir PSR é o que faz bibliotecas de autores diferentes se encaixarem.",
                },
                {
                    type: "table",
                    value: '[["Padrão", "Do que trata"], ["PSR-1 e PSR-12", "estilo e formatação do código"], ["PSR-4", "onde cada classe fica no disco"], ["PSR-3", "interface de log"], ["PSR-7", "objetos de requisição e resposta HTTP"], ["PSR-11", "container de injeção de dependência"]]',
                },
                {
                    type: "text",
                    value: "## Atributos\n\nAtributos são metadados escritos na própria declaração, entre `#[` e `]`. Frameworks os leem por reflexão para configurar comportamento sem arquivo separado.\n\nO PHP 8.5 acrescentou o atributo `#[\\NoDiscard]`, que faz o interpretador avisar quando o retorno de uma função é ignorado, útil para funções cujo resultado não deveria ser descartado.",
                },
                {
                    type: "code",
                    value: '<?php\n\n#[Attribute]\nclass Rota\n{\n    public function __construct(\n        public string $caminho,\n        public string $metodo = "GET",\n    ) {}\n}\n\nclass UsuarioController\n{\n    #[Rota("/usuarios", metodo: "GET")]\n    public function listar(): array { return []; }\n}',
                },
                {
                    type: "text",
                    value: "## O trio de qualidade\n\nTrês ferramentas aparecem em quase todo projeto PHP sério:\n\n- **PHPStan** ou **Psalm**: análise estática, encontra bug sem rodar o código\n- **PHP CS Fixer** ou **PHP_CodeSniffer**: formatam conforme a PSR-12\n- **PHPUnit** ou **Pest**: testes automatizados",
                },
            ],
            questions: [
                {
                    statement: "O que as PSR padronizam?",
                    difficulty: "facil",
                    options: [
                        { text: "Como o código PHP é escrito e organizado", isCorrect: true },
                        { text: "A velocidade de execução do interpretador", isCorrect: false },
                        { text: "O formato do banco de dados", isCorrect: false },
                        { text: "As versões suportadas do PHP", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual PSR trata de onde cada classe fica no disco?",
                    difficulty: "medio",
                    options: [
                        { text: "A PSR-4", isCorrect: true },
                        { text: "A PSR-12", isCorrect: false },
                        { text: "A PSR-3", isCorrect: false },
                        { text: "A PSR-7", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um atributo é escrito em PHP?",
                    difficulty: "medio",
                    options: [
                        { text: "Entre `#[` e `]` antes da declaração", isCorrect: true },
                        { text: "Como comentário iniciado por duas barras", isCorrect: false },
                        { text: "Dentro de um bloco `attribute { }`", isCorrect: false },
                        { text: "Como string no construtor da classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tipo de problema o PHPStan encontra?",
                    difficulty: "medio",
                    options: [
                        { text: "Bugs detectáveis sem executar o código", isCorrect: true },
                        { text: "Somente erros de formatação", isCorrect: false },
                        {
                            text: "Apenas as falhas de conexão com o banco de dados",
                            isCorrect: false,
                        },
                        { text: "Somente problemas de desempenho", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o atributo `#[\\NoDiscard]` do PHP 8.5?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Avisar quando o retorno de uma função é ignorado",
                            isCorrect: true,
                        },
                        {
                            text: "Impedir que a mesma função seja chamada duas vezes",
                            isCorrect: false,
                        },
                        { text: "Descartar o retorno automaticamente", isCorrect: false },
                        { text: "Marcar a função como obsoleta", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - PHP na web",
    aulas: [
        {
            titulo: "Da requisição à resposta",
            blocks: [
                {
                    type: "text",
                    value: "# O que acontece quando alguém acessa uma página\n\nO navegador manda uma requisição HTTP ao servidor. O servidor identifica que é um arquivo PHP, chama o interpretador, e o interpretador executa o script do zero, monta a saída e devolve.\n\nA parte que mais surpreende quem vem de outras linguagens: **cada requisição começa do nada**. Nenhuma variável sobrevive entre uma e outra. É por isso que existem sessões e banco de dados.",
                },
                {
                    type: "text",
                    value: "## As superglobais\n\nO PHP entrega os dados da requisição em arrays disponíveis em qualquer escopo.",
                },
                {
                    type: "table",
                    value: '[["Superglobal", "O que traz"], ["$_GET", "dados da query string da URL"], ["$_POST", "dados enviados no corpo do formulário"], ["$_SERVER", "informações do servidor e da requisição"], ["$_SESSION", "dados guardados entre requisições"], ["$_COOKIE", "cookies enviados pelo navegador"], ["$_FILES", "arquivos que subiram no formulário"]]',
                },
                {
                    type: "code",
                    value: '<?php\n\n$metodo = $_SERVER["REQUEST_METHOD"];  // GET, POST...\n$caminho = $_SERVER["REQUEST_URI"];\n\nif ($metodo === "POST") {\n    processarFormulario();\n}\n\n// Definindo a resposta\nhttp_response_code(201);\nheader("Content-Type: application/json");\necho json_encode(["ok" => true]);',
                },
                {
                    type: "quote",
                    value: "Cabeçalhos precisam ser enviados antes de qualquer saída. Um espaço em branco antes de <?php já quebra o header().",
                },
            ],
            questions: [
                {
                    statement: "O que acontece com as variáveis PHP entre duas requisições?",
                    difficulty: "medio",
                    options: [
                        { text: "Nada sobrevive, cada requisição começa do zero", isCorrect: true },
                        { text: "Permanecem na memória do servidor", isCorrect: false },
                        { text: "São salvas em disco automaticamente", isCorrect: false },
                        {
                            text: "Continuam apenas quando forem declaradas constantes",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual superglobal traz os dados da query string da URL?",
                    difficulty: "facil",
                    options: [
                        { text: "$_GET", isCorrect: true },
                        { text: "$_POST", isCorrect: false },
                        { text: "$_SERVER", isCorrect: false },
                        { text: "$_SESSION", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde se descobre o método HTTP da requisição?",
                    difficulty: "medio",
                    options: [
                        { text: 'Em `$_SERVER["REQUEST_METHOD"]`', isCorrect: true },
                        { text: 'Em `$_GET["method"]`', isCorrect: false },
                        { text: 'Em `$_POST["method"]`', isCorrect: false },
                        { text: "Na constante global HTTP_METHOD", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `header()` falha se houver saída antes dele?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Os cabeçalhos precisam ir antes do corpo da resposta",
                            isCorrect: true,
                        },
                        { text: "Porque a função só roda em servidores Apache", isCorrect: false },
                        {
                            text: "Porque o PHP limita a um único cabeçalho por requisição",
                            isCorrect: false,
                        },
                        { text: "Porque a saída apaga os cabeçalhos definidos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual superglobal traz os arquivos enviados por um formulário?",
                    difficulty: "facil",
                    options: [
                        { text: "$_FILES", isCorrect: true },
                        { text: "$_POST", isCorrect: false },
                        { text: "$_UPLOAD", isCorrect: false },
                        { text: "$_REQUEST", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Formulários, validação e segurança",
            blocks: [
                {
                    type: "text",
                    value: "# Nunca confie no que chega\n\nTodo dado vindo do navegador pode ter sido alterado. Validação no HTML ajuda a experiência, mas não protege nada: qualquer pessoa envia uma requisição direta sem passar pelo formulário.\n\nA validação que vale é a do servidor.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$erros = [];\n\n$nome = trim($_POST["nome"] ?? "");\n$email = trim($_POST["email"] ?? "");\n$idade = filter_input(INPUT_POST, "idade", FILTER_VALIDATE_INT);\n\nif ($nome === "") {\n    $erros[] = "Informe o nome";\n}\nif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    $erros[] = "Email inválido";\n}\nif ($idade === false || $idade < 18) {\n    $erros[] = "Idade precisa ser 18 ou mais";\n}\n\nif ($erros === []) {\n    salvar($nome, $email, $idade);\n}',
                },
                {
                    type: "text",
                    value: "## Filtros com exceção, novidade do 8.5\n\nAs funções `filter_var` e `filter_input` sempre devolveram `false` quando a validação falhava, o que se confunde com o valor booleano `false` legítimo. O **PHP 8.5** acrescentou a opção de **lançar exceção** em vez de devolver `false`, deixando o erro impossível de ignorar.",
                },
                {
                    type: "text",
                    value: "## As três defesas obrigatórias\n\nTrês ataques clássicos entram por formulário, e cada um tem sua defesa:\n\n- **XSS**: escapar a saída com `htmlspecialchars()`\n- **SQL injection**: usar consultas preparadas, nunca concatenar\n- **CSRF**: gerar um token por sessão e conferir no envio",
                },
                {
                    type: "code",
                    value: '<?php\n\n// Gerando o token no formulário\n$_SESSION["csrf"] ??= bin2hex(random_bytes(32));\n?>\n<form method="post">\n    <input type="hidden" name="csrf" value="<?= $_SESSION["csrf"] ?>">\n    <input type="text" name="nome">\n    <button>Enviar</button>\n</form>\n<?php\n\n// Conferindo no recebimento\nif (!hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "")) {\n    http_response_code(419);\n    exit("Token inválido");\n}',
                },
            ],
            questions: [
                {
                    statement: "Por que a validação no HTML não é suficiente?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Qualquer um envia requisição sem passar pelo formulário",
                            isCorrect: true,
                        },
                        { text: "Porque o HTML não valida números", isCorrect: false },
                        { text: "Porque ela deixa a página lenta", isCorrect: false },
                        {
                            text: "Porque o navegador de quem acessa pode estar desatualizado",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual função valida o formato de um email?",
                    difficulty: "medio",
                    options: [
                        { text: "filter_var com FILTER_VALIDATE_EMAIL", isCorrect: true },
                        { text: "check_email()", isCorrect: false },
                        { text: "is_email()", isCorrect: false },
                        { text: "preg_match com o padrão FILTER_EMAIL pronto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a defesa contra SQL injection?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar consultas preparadas", isCorrect: true },
                        { text: "Escapar a saída com htmlspecialchars", isCorrect: false },
                        { text: "Validar o token CSRF", isCorrect: false },
                        { text: "Usar apenas requisições POST", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o token CSRF protege?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Impede que outro site envie o formulário em nome do usuário",
                            isCorrect: true,
                        },
                        {
                            text: "Impede que scripts vindos de outro site rodem dentro da página",
                            isCorrect: false,
                        },
                        { text: "Impede consultas SQL maliciosas", isCorrect: false },
                        { text: "Impede o envio de arquivos grandes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o PHP 8.5 acrescentou às funções de filtro?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "A opção de lançar exceção em vez de devolver false",
                            isCorrect: true,
                        },
                        { text: "Suporte a validação de CPF", isCorrect: false },
                        { text: "Filtros escritos em JSON", isCorrect: false },
                        {
                            text: "A validação automática de formulários HTML inteiros",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Sessões, cookies e login",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando estado entre requisições\n\nComo cada requisição começa do zero, é preciso um mecanismo para lembrar quem está navegando.\n\nO **cookie** guarda um valor no navegador e vai junto em cada requisição. A **sessão** guarda os dados no servidor e manda ao navegador apenas um identificador. Dados sensíveis vão para a sessão, nunca para o cookie.",
                },
                {
                    type: "code",
                    value: '<?php\n\nsession_start();\n\n// Guardando\n$_SESSION["usuario_id"] = 42;\n$_SESSION["nome"] = "Ana";\n\n// Lendo em outra página, depois de session_start()\nif (isset($_SESSION["usuario_id"])) {\n    echo "Olá, " . $_SESSION["nome"];\n}\n\n// Encerrando\nsession_destroy();',
                },
                {
                    type: "text",
                    value: "## Senhas\n\nSenha nunca é guardada como texto e nunca é criptografada de forma reversível. Ela vira um **hash**, e o PHP já traz as funções certas: `password_hash()` e `password_verify()`.\n\nO algoritmo padrão do PHP hoje é o bcrypt, e `PASSWORD_DEFAULT` acompanha automaticamente quando a recomendação mudar.",
                },
                {
                    type: "code",
                    value: '<?php\n\n// No cadastro\n$hash = password_hash($senhaDigitada, PASSWORD_DEFAULT);\n// grave $hash no banco\n\n// No login\nif (password_verify($senhaDigitada, $hashDoBanco)) {\n    session_regenerate_id(true);  // evita fixação de sessão\n    $_SESSION["usuario_id"] = $usuario->id;\n} else {\n    $erro = "Email ou senha incorretos";\n}',
                },
                {
                    type: "quote",
                    value: "Diga apenas email ou senha incorretos. Dizer qual dos dois errou entrega ao atacante quais emails existem no sistema.",
                },
            ],
            questions: [
                {
                    statement: "Onde ficam guardados os dados de uma sessão?",
                    difficulty: "medio",
                    options: [
                        { text: "No servidor, com o identificador no navegador", isCorrect: true },
                        {
                            text: "No navegador, dentro do próprio cookie de sessão",
                            isCorrect: false,
                        },
                        { text: "No banco de dados, sempre", isCorrect: false },
                        { text: "Na URL de cada página", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função gera o hash de uma senha?",
                    difficulty: "facil",
                    options: [
                        { text: "password_hash()", isCorrect: true },
                        { text: "md5()", isCorrect: false },
                        { text: "encrypt()", isCorrect: false },
                        { text: "hash_password()", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que chamar `session_regenerate_id(true)` no login?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Para evitar que um identificador anterior continue válido",
                            isCorrect: true,
                        },
                        { text: "Para tornar a sessão mais rápida", isCorrect: false },
                        { text: "Para aumentar o tempo de expiração", isCorrect: false },
                        {
                            text: "Para permitir vários logins simultâneos com o mesmo usuário",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que precisa ser chamado antes de usar `$_SESSION`?",
                    difficulty: "facil",
                    options: [
                        { text: "session_start()", isCorrect: true },
                        { text: "session_open()", isCorrect: false },
                        { text: "session_init()", isCorrect: false },
                        { text: "start_session()", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Por que a mensagem de erro do login não deve dizer qual campo errou?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Revelaria ao atacante quais emails existem no sistema",
                            isCorrect: true,
                        },
                        { text: "Deixaria a resposta mais lenta", isCorrect: false },
                        {
                            text: "Quebraria a validação do formulário de entrada no site",
                            isCorrect: false,
                        },
                        { text: "Impediria o uso de sessões", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Banco de dados com PDO",
            blocks: [
                {
                    type: "text",
                    value: "# Uma interface para vários bancos\n\nO **PDO** é a camada padrão de acesso a banco do PHP. Ele fala com MySQL, PostgreSQL, SQLite e outros pela mesma interface, o que reduz o retrabalho ao trocar de banco.\n\nA conexão pede uma DSN, usuário e senha, e vale configurar três opções sempre.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$pdo = new PDO(\n    "mysql:host=localhost;dbname=loja;charset=utf8mb4",\n    $usuario,\n    $senha,\n    [\n        // erro vira exceção em vez de retorno falso\n        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n        // resultados como array associativo\n        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n        // consultas preparadas de verdade, não emuladas\n        PDO::ATTR_EMULATE_PREPARES => false,\n    ],\n);',
                },
                {
                    type: "text",
                    value: "## Consultas preparadas\n\nConcatenar valor dentro de SQL é como um banco é invadido. Na consulta preparada, o SQL vai primeiro com marcadores, e os valores depois: o banco nunca confunde dado com comando.",
                },
                {
                    type: "code",
                    value: '<?php\n\n// NUNCA faça isto\n$sql = "SELECT * FROM usuarios WHERE email = \'$email\'";\n\n// Faça isto: marcadores nomeados\n$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email");\n$stmt->execute(["email" => $email]);\n$usuario = $stmt->fetch();\n\n// Vários registros\n$stmt = $pdo->prepare("SELECT * FROM produtos WHERE preco < :teto");\n$stmt->execute(["teto" => 100]);\n$produtos = $stmt->fetchAll();\n\n// Inserindo e pegando o id gerado\n$stmt = $pdo->prepare("INSERT INTO produtos (nome, preco) VALUES (:nome, :preco)");\n$stmt->execute(["nome" => "Caneca", "preco" => 29.9]);\n$id = $pdo->lastInsertId();',
                },
                {
                    type: "text",
                    value: "## Transações\n\nQuando várias escritas precisam valer juntas ou não valer nenhuma, envolva em transação. O `catch` desfaz tudo com `rollBack()`.",
                },
                {
                    type: "code",
                    value: '<?php\n\n$pdo->beginTransaction();\ntry {\n    $pdo->prepare("UPDATE contas SET saldo = saldo - :v WHERE id = :id")\n        ->execute(["v" => 100, "id" => 1]);\n    $pdo->prepare("UPDATE contas SET saldo = saldo + :v WHERE id = :id")\n        ->execute(["v" => 100, "id" => 2]);\n    $pdo->commit();\n} catch (Throwable $e) {\n    $pdo->rollBack();\n    throw $e;\n}',
                },
            ],
            questions: [
                {
                    statement: "O que o PDO oferece em relação aos bancos de dados?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma interface única para bancos diferentes", isCorrect: true },
                        { text: "Um banco de dados embutido no PHP", isCorrect: false },
                        { text: "A criação automática de tabelas", isCorrect: false },
                        {
                            text: "A tradução do SQL para a linguagem de outro banco",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Por que a consulta preparada impede SQL injection?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "O SQL vai antes dos valores, então dado nunca vira comando",
                            isCorrect: true,
                        },
                        {
                            text: "Ela remove todos os caracteres especiais de cada valor enviado",
                            isCorrect: false,
                        },
                        { text: "Ela criptografa a consulta enviada", isCorrect: false },
                        { text: "Ela limita o tamanho de cada valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `PDO::ERRMODE_EXCEPTION` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Faz erros de banco virarem exceções", isCorrect: true },
                        { text: "Impede que erros aconteçam", isCorrect: false },
                        { text: "Registra os erros do banco em arquivo", isCorrect: false },
                        { text: "Devolve false em vez de erro", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método devolve todos os registros de uma consulta?",
                    difficulty: "facil",
                    options: [
                        { text: "fetchAll()", isCorrect: true },
                        { text: "fetch()", isCorrect: false },
                        { text: "getAll()", isCorrect: false },
                        { text: "rowCount()", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve uma transação?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Garantir que várias escritas valham juntas ou nenhuma",
                            isCorrect: true,
                        },
                        { text: "Deixar as consultas mais rápidas", isCorrect: false },
                        {
                            text: "Permitir consultas em vários bancos de dados diferentes",
                            isCorrect: false,
                        },
                        { text: "Guardar o resultado em cache", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Autoload PSR-4 e o projeto final",
            blocks: [
                {
                    type: "text",
                    value: "# Namespaces e autoload\n\nEm um projeto com dezenas de classes, dar `require` em cada arquivo é inviável. O **namespace** organiza as classes em pastas lógicas, e o **autoload** carrega o arquivo só quando a classe é usada pela primeira vez.\n\nA **PSR-4** define a regra: o namespace espelha o caminho da pasta.",
                },
                {
                    type: "code",
                    value: '{\n    "autoload": {\n        "psr-4": {\n            "App\\\\": "src/"\n        }\n    }\n}',
                },
                {
                    type: "code",
                    value: "<?php\n// src/Model/Produto.php\n\nnamespace App\\Model;\n\nclass Produto\n{\n    public function __construct(\n        public readonly string $nome,\n        public readonly float $preco,\n    ) {}\n}",
                },
                {
                    type: "code",
                    value: '<?php\n// index.php\n\nrequire __DIR__ . "/vendor/autoload.php";\n\nuse App\\Model\\Produto;\n\n$p = new Produto("Caneca", 29.90);\necho $p->nome;',
                },
                {
                    type: "text",
                    value: "## O projeto final\n\nPara fechar a trilha, monte um **catálogo de produtos** que junte tudo:\n\n1. Estrutura PSR-4 com `composer.json` e a pasta `src/`\n2. Uma classe `Produto` com propriedades readonly e um enum `Categoria`\n3. Um repositório com PDO e SQLite, usando consultas preparadas\n4. Uma página que lista os produtos, com `htmlspecialchars()` na saída\n5. Um formulário de cadastro com validação no servidor e token CSRF\n6. Tratamento de erro com exceções próprias e um handler global\n\nCada item corresponde a um módulo desta trilha. Se algum passo travar, o módulo dele é onde voltar.",
                },
            ],
            questions: [
                {
                    statement: "O que a PSR-4 define?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o namespace espelha o caminho das pastas", isCorrect: true },
                        {
                            text: "Como formatar as chaves e a indentação do código",
                            isCorrect: false,
                        },
                        { text: "Como escrever mensagens de log", isCorrect: false },
                        { text: "Quais versões do PHP suportar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o autoload evita?",
                    difficulty: "facil",
                    options: [
                        { text: "Escrever um require para cada classe usada", isCorrect: true },
                        { text: "Escrever o namespace no topo de cada classe", isCorrect: false },
                        { text: "Instalar pacotes com o Composer", isCorrect: false },
                        { text: "Declarar tipos nos parâmetros", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "Qual arquivo precisa ser incluído para o autoload do Composer funcionar?",
                    difficulty: "medio",
                    options: [
                        { text: "vendor/autoload.php", isCorrect: true },
                        { text: "composer.json", isCorrect: false },
                        { text: "vendor/composer.php", isCorrect: false },
                        { text: "src/autoload.php", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a palavra `use` no topo de um arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Importar uma classe de outro namespace", isCorrect: true },
                        { text: "Absorver um trait na classe", isCorrect: false },
                        { text: "Declarar o namespace no topo do arquivo", isCorrect: false },
                        { text: "Carregar uma extensão do PHP", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o autoload carrega o arquivo de uma classe?",
                    difficulty: "dificil",
                    options: [
                        { text: "Na primeira vez em que a classe é usada", isCorrect: true },
                        { text: "No início da execução, todas de uma vez", isCorrect: false },
                        { text: "Ao rodar composer install", isCorrect: false },
                        { text: "Somente quando a classe é instanciada com new", isCorrect: false },
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
