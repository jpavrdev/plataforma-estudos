// Seed da trilha Ruby (Ruby 4.0). Conteúdo autoral.
// A versão 4.0 saiu em dezembro de 2025 e é a que a trilha ensina: ZJIT, Set e
// Pathname no core, Ractor::Port e operadores lógicos no começo da linha.
//
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml run --rm -T --no-deps backend node scripts/seed-trilha-ruby.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Ruby";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "Ruby 4.0 do zero ao uso real: tudo é objeto, coleções e Enumerable, blocos e iteradores, pattern matching, classes com módulos e mixins, exceções e testes com Minitest e RSpec, e o Ruby moderno com YJIT, ZJIT e Ractor. A linguagem por trás do Rails, do GitHub e do Shopify.";
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
    titulo: "Módulo 1 - Primeiros passos com Ruby",
    aulas: [
        {
            titulo: "O que é Ruby e por que ele existe",
            blocks: [
                {
                    type: "text",
                    value: "# Uma linguagem feita para pessoas\n\nRuby foi criada por Yukihiro Matsumoto, o Matz, e lançada em 1995. O objetivo declarado dele era incomum: fazer uma linguagem que desse **prazer de programar**, otimizada para quem escreve e lê o código, não para o computador.\n\nEssa escolha aparece em tudo. Ruby aceita várias formas de dizer a mesma coisa e o código costuma parecer com uma frase em inglês.",
                },
                {
                    type: "code",
                    value: '3.times { puts "Olá" }\n\n[1, 2, 3].each { |n| puts n * 2 }\n\nputs "adulto" if idade >= 18\n\n5.downto(1) { |n| puts n }',
                },
                {
                    type: "text",
                    value: "## Onde Ruby é usado\n\nO grande impulso veio do **Ruby on Rails**, lançado em 2004, que virou referência de produtividade em aplicações web. GitHub, Shopify, Airbnb e Basecamp nasceram em Rails.\n\nFora da web, Ruby aparece em automação, ferramentas de linha de comando e em toda ferramenta que usa Gemfile ou Rakefile.\n\nEsta trilha usa o **Ruby 4.0**, lançado em dezembro de 2025.",
                },
                {
                    type: "quote",
                    value: "Ruby é interpretada, de tipagem dinâmica e forte, e totalmente orientada a objetos: até um número é objeto.",
                },
            ],
            questions: [
                {
                    statement: "Qual foi o objetivo declarado de quem criou o Ruby?",
                    difficulty: "facil",
                    options: [
                        {
                            text: "Fazer uma linguagem que desse prazer de programar",
                            isCorrect: true,
                        },
                        {
                            text: "Fazer a linguagem mais rápida do mundo em cálculos",
                            isCorrect: false,
                        },
                        {
                            text: "Substituir o C em programação de sistemas operacionais",
                            isCorrect: false,
                        },
                        {
                            text: "Criar uma linguagem só para desenvolvimento de jogos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual framework popularizou o Ruby na web?",
                    difficulty: "facil",
                    options: [
                        { text: "Ruby on Rails", isCorrect: true },
                        { text: "Django, com sua estrutura de aplicativos", isCorrect: false },
                        { text: "Spring, com sua injeção de dependência", isCorrect: false },
                        { text: "Laravel, com seu sistema de rotas", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual versão do Ruby esta trilha usa?",
                    difficulty: "facil",
                    options: [
                        { text: "Ruby 4.0", isCorrect: true },
                        { text: "Ruby 2.7", isCorrect: false },
                        { text: "Ruby 3.1", isCorrect: false },
                        { text: "Ruby 1.9", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se classifica a tipagem do Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Dinâmica e forte", isCorrect: true },
                        { text: "Estática e fraca, verificada na compilação", isCorrect: false },
                        { text: "Estática e forte, declarada em cada variável", isCorrect: false },
                        { text: "Dinâmica e fraca, com conversão automática", isCorrect: false },
                    ],
                },
                {
                    statement: 'O que `3.times { puts "Olá" }` demonstra sobre o Ruby?',
                    difficulty: "medio",
                    options: [
                        { text: "Que até um número é um objeto com métodos", isCorrect: true },
                        {
                            text: "Que os laços precisam sempre de uma variável contadora",
                            isCorrect: false,
                        },
                        {
                            text: "Que o Ruby converte números em texto automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "Que a linguagem executa o bloco em paralelo por padrão",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Instalando o Ruby 4.0 e o irb",
            blocks: [
                {
                    type: "text",
                    value: "# Gerenciadores de versão\n\nQuase todo sistema traz uma versão antiga de Ruby, e projetos diferentes pedem versões diferentes. Por isso a comunidade usa gerenciadores como **rbenv**, **asdf** ou **mise**, que instalam várias versões e trocam entre elas por projeto.",
                },
                {
                    type: "code",
                    value: "# Com rbenv\nrbenv install 4.0.6\nrbenv global 4.0.6\n\nruby --version\n# ruby 4.0.6 (2026-07-14)\n\n# Fixando a versão de um projeto\necho '4.0.6' > .ruby-version",
                },
                {
                    type: "text",
                    value: "## O irb\n\nO **irb** é o console interativo do Ruby. Você digita uma expressão e vê o resultado na hora, o que faz dele o melhor lugar para testar uma ideia antes de escrevê-la em arquivo.",
                },
                {
                    type: "code",
                    value: 'irb\n\nirb(main):001> 2 + 2\n=> 4\nirb(main):002> "ruby".upcase\n=> "RUBY"\nirb(main):003> [3, 1, 2].sort\n=> [1, 2, 3]',
                },
                {
                    type: "text",
                    value: "## O primeiro arquivo\n\nSalve como `ola.rb` e rode com `ruby ola.rb`. Ruby não exige ponto e vírgula no fim das linhas, nem uma função principal para começar.",
                },
                {
                    type: "code",
                    value: 'nome = "Ana"\nputs "Olá, #{nome}!"\nputs "Rodando em Ruby #{RUBY_VERSION}"',
                },
            ],
            questions: [
                {
                    statement: "Para que serve um gerenciador como o rbenv?",
                    difficulty: "medio",
                    options: [
                        { text: "Instalar e alternar entre versões do Ruby", isCorrect: true },
                        {
                            text: "Instalar as bibliotecas que o projeto declara no Gemfile",
                            isCorrect: false,
                        },
                        {
                            text: "Compilar o código Ruby para um executável nativo",
                            isCorrect: false,
                        },
                        {
                            text: "Formatar o código conforme o guia de estilo oficial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que é o irb?",
                    difficulty: "facil",
                    options: [
                        { text: "O console interativo do Ruby", isCorrect: true },
                        { text: "O compilador oficial da linguagem Ruby", isCorrect: false },
                        { text: "O gerenciador de pacotes usado pelo Rails", isCorrect: false },
                        { text: "O servidor web embutido na instalação", isCorrect: false },
                    ],
                },
                {
                    statement: "Ruby exige ponto e vírgula no fim de cada linha?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, ele é opcional", isCorrect: true },
                        { text: "Sim, em todas as linhas de código", isCorrect: false },
                        { text: "Sim, mas apenas dentro de classes", isCorrect: false },
                        {
                            text: "Sim, somente em arquivos com mais de uma linha",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o arquivo `.ruby-version`?",
                    difficulty: "medio",
                    options: [
                        { text: "Fixar a versão que o projeto usa", isCorrect: true },
                        { text: "Listar as gems que o projeto precisa instalar", isCorrect: false },
                        {
                            text: "Guardar as configurações do console interativo",
                            isCorrect: false,
                        },
                        {
                            text: "Definir quais arquivos serão executados primeiro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se interpola uma variável dentro de uma string?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `#{}` dentro de aspas duplas", isCorrect: true },
                        { text: "Com `${}` dentro de aspas duplas ou simples", isCorrect: false },
                        { text: "Com `%{}` em qualquer tipo de aspas", isCorrect: false },
                        { text: "Com `<%= %>` dentro de aspas simples", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Tudo é objeto",
            blocks: [
                {
                    type: "text",
                    value: "# Sem exceções\n\nEm muitas linguagens existem tipos primitivos, que não são objetos e não têm métodos. Em Ruby isso não existe: **todo valor é objeto**, e todo objeto responde a métodos.\n\nNúmeros, textos, `true`, `false` e até `nil` são objetos com métodos próprios.",
                },
                {
                    type: "code",
                    value: '42.class          # => Integer\n"texto".class     # => String\ntrue.class        # => TrueClass\nnil.class         # => NilClass\n42.even?          # => true\n-7.abs            # => 7\nnil.to_a          # => []',
                },
                {
                    type: "text",
                    value: "## Chamando métodos\n\nO ponto chama o método. Parênteses são opcionais quando não há ambiguidade, e a comunidade costuma omiti-los em chamadas sem argumento.\n\n## nil e o que é falso\n\nRuby tem uma regra rara e muito útil: **só `nil` e `false` são falsos**. Zero é verdadeiro, string vazia é verdadeira, array vazio é verdadeiro. Isso elimina uma classe inteira de bug que existe em outras linguagens.",
                },
                {
                    type: "table",
                    value: '[["Valor", "Em Ruby", "Em muitas outras linguagens"], ["0", "verdadeiro", "falso"], ["\\"\\"", "verdadeiro", "falso"], ["[]", "verdadeiro", "falso"], ["nil", "falso", "falso"], ["false", "falso", "falso"]]',
                },
            ],
            questions: [
                {
                    statement: "O que é objeto em Ruby?",
                    difficulty: "facil",
                    options: [
                        { text: "Todo valor, sem exceção", isCorrect: true },
                        {
                            text: "Apenas as instâncias de classes que você define",
                            isCorrect: false,
                        },
                        { text: "Somente os valores criados com a palavra new", isCorrect: false },
                        { text: "Tudo, menos os números e os valores booleanos", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais valores são falsos em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas nil e false", isCorrect: true },
                        { text: "O nil, o false, o zero e a string vazia", isCorrect: false },
                        { text: "O zero, a string vazia e o array vazio", isCorrect: false },
                        { text: "O nil, o zero e qualquer coleção sem itens", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `0` vale dentro de um `if` em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Verdadeiro", isCorrect: true },
                        { text: "Falso, como na maioria das linguagens", isCorrect: false },
                        { text: "Depende de estar em aspas ou não", isCorrect: false },
                        { text: "Gera um aviso de conversão implícita", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `nil.class` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "NilClass", isCorrect: true },
                        { text: "Um erro de método não encontrado", isCorrect: false },
                        { text: "O valor nil de novo, sem classe", isCorrect: false },
                        { text: "Object, a classe raiz da hierarquia", isCorrect: false },
                    ],
                },
                {
                    statement: "Os parênteses na chamada de um método são obrigatórios?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, são opcionais", isCorrect: true },
                        { text: "Sim, sempre que houver argumentos ou não", isCorrect: false },
                        { text: "Sim, mas apenas em métodos de classe", isCorrect: false },
                        { text: "Sim, apenas quando o método devolve valor", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Variáveis, símbolos e constantes",
            blocks: [
                {
                    type: "text",
                    value: "# O nome diz o escopo\n\nEm Ruby, o **primeiro caractere do nome** determina o tipo da variável. Não existe palavra-chave de declaração: você escreve o nome e o Ruby entende o alcance dele.",
                },
                {
                    type: "table",
                    value: '[["Forma", "Tipo", "Alcance"], ["nome", "local", "o bloco ou método atual"], ["@nome", "de instância", "o objeto"], ["@@nome", "de classe", "a classe e as filhas"], ["$nome", "global", "o programa inteiro"], ["Nome", "constante", "avisa ao ser mudada"]]',
                },
                {
                    type: "code",
                    value: "PI = 3.14159      # constante: muda com aviso, não com erro\n\nclass Contador\n  @@total = 0     # de classe, compartilhada\n\n  def initialize\n    @valor = 0    # de instância, uma por objeto\n    @@total += 1\n  end\nend",
                },
                {
                    type: "text",
                    value: "## Atribuição múltipla e o splat\n\nRuby desmonta coleções direto na atribuição, e o `*` recolhe o que sobrar.",
                },
                {
                    type: "code",
                    value: "a, b = 1, 2\na, b = b, a          # troca sem variável auxiliar\n\nprimeiro, *resto = [1, 2, 3, 4]\n# primeiro => 1, resto => [2, 3, 4]",
                },
            ],
            questions: [
                {
                    statement: "O que o `@` no começo do nome indica?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma variável de instância", isCorrect: true },
                        { text: "Uma variável global do programa inteiro", isCorrect: false },
                        { text: "Uma constante que não pode ser alterada", isCorrect: false },
                        { text: "Uma variável local do método atual", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao reatribuir uma constante em Ruby?",
                    difficulty: "dificil",
                    options: [
                        { text: "O Ruby emite um aviso, mas permite", isCorrect: true },
                        { text: "O programa para com um erro fatal na hora", isCorrect: false },
                        { text: "A atribuição é ignorada em completo silêncio", isCorrect: false },
                        { text: "A constante vira uma variável local comum", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se declara uma variável em Ruby?",
                    difficulty: "facil",
                    options: [
                        { text: "Basta atribuir um valor a um nome", isCorrect: true },
                        { text: "Usando a palavra-chave var antes do nome", isCorrect: false },
                        { text: "Declarando o tipo antes do nome da variável", isCorrect: false },
                        { text: "Usando a palavra let seguida do nome", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `a, b = b, a` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Troca os valores das duas", isCorrect: true },
                        { text: "Copia o valor de b para as duas variáveis", isCorrect: false },
                        { text: "Cria um array com os dois valores dentro", isCorrect: false },
                        { text: "Gera um erro de atribuição múltipla inválida", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `primeiro, *resto = [1, 2, 3, 4]`, o que `resto` recebe?",
                    difficulty: "medio",
                    options: [
                        { text: "O array [2, 3, 4]", isCorrect: true },
                        { text: "O último elemento do array, que é o 4", isCorrect: false },
                        { text: "O array completo, com os quatro valores", isCorrect: false },
                        { text: "Um array vazio, porque o splat vem depois", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Gems, Bundler e o Gemfile",
            blocks: [
                {
                    type: "text",
                    value: "# Bibliotecas em Ruby\n\nUma **gem** é uma biblioteca empacotada. O comando `gem` instala uma de cada vez, mas em projeto ninguém faz assim: usa-se o **Bundler**, que resolve as versões de todas as dependências juntas.",
                },
                {
                    type: "code",
                    value: "gem install rubocop\n\n# Em projeto, o caminho é o Bundler\nbundle init          # cria o Gemfile\nbundle add rspec     # acrescenta e instala\nbundle install       # instala o que o Gemfile declara\nbundle exec rspec    # roda usando as versões travadas",
                },
                {
                    type: "text",
                    value: "## Gemfile e Gemfile.lock\n\nO `Gemfile` declara o que o projeto quer, com restrições de versão. O `Gemfile.lock` grava as versões exatas resolvidas, e é ele que garante que todo mundo rode o mesmo código.",
                },
                {
                    type: "code",
                    value: 'source "https://rubygems.org"\nruby "4.0.6"\n\ngem "rails", "~> 8.1.0"\ngem "pg"\n\ngroup :development, :test do\n  gem "rubocop", require: false\n  gem "debug"\nend',
                },
                {
                    type: "quote",
                    value: "O operador ~> aceita atualizações de correção mas não de versão maior. Em ~> 8.1.0 entram 8.1.1 e 8.1.9, não entra 8.2.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma gem?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma biblioteca Ruby empacotada", isCorrect: true },
                        { text: "Um arquivo de configuração do projeto Ruby", isCorrect: false },
                        { text: "Um comando interno do console interativo", isCorrect: false },
                        { text: "Um formato de banco de dados usado no Rails", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Bundler resolve que o `gem install` não resolve?",
                    difficulty: "medio",
                    options: [
                        { text: "As versões de todas as dependências juntas", isCorrect: true },
                        {
                            text: "A instalação de gems em sistemas operacionais antigos",
                            isCorrect: false,
                        },
                        { text: "A compilação das gems escritas na linguagem C", isCorrect: false },
                        {
                            text: "A publicação de uma gem nova no repositório oficial",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `~> 8.1.0` permite?",
                    difficulty: "dificil",
                    options: [
                        { text: "Atualizações de correção dentro da 8.1", isCorrect: true },
                        {
                            text: "Qualquer versão acima da 8.1.0, incluindo a 9.0",
                            isCorrect: false,
                        },
                        { text: "Somente a versão 8.1.0 exata, sem atualização", isCorrect: false },
                        { text: "Qualquer versão da linha 8, incluindo a 8.2", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `Gemfile.lock` guarda?",
                    difficulty: "medio",
                    options: [
                        { text: "As versões exatas já resolvidas", isCorrect: true },
                        { text: "As restrições de versão que o projeto declara", isCorrect: false },
                        { text: "O código-fonte das gems que foram instaladas", isCorrect: false },
                        { text: "A lista de gems disponíveis no RubyGems", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve `bundle exec` antes de um comando?",
                    difficulty: "medio",
                    options: [
                        { text: "Rodar com as versões travadas do projeto", isCorrect: true },
                        { text: "Instalar a gem antes de executar o comando", isCorrect: false },
                        {
                            text: "Executar o comando em segundo plano no terminal",
                            isCorrect: false,
                        },
                        {
                            text: "Atualizar as gems para as versões mais recentes",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Tipos e coleções",
    aulas: [
        {
            titulo: "Números e strings",
            blocks: [
                {
                    type: "text",
                    value: "# Números\n\n`Integer` não tem limite de tamanho em Ruby: ele cresce conforme a necessidade, sem estouro. `Float` segue o padrão de ponto flutuante, com as imprecisões de sempre, e para dinheiro existe `BigDecimal`.",
                },
                {
                    type: "code",
                    value: '2 ** 100        # => 1267650600228229401496703205376\n7 / 2           # => 3, divisão inteira\n7.0 / 2         # => 3.5\n7.fdiv(2)       # => 3.5\n0.1 + 0.2       # => 0.30000000000000004\n\nrequire "bigdecimal/util"\n("0.1".to_d + "0.2".to_d).to_s  # => "0.3"',
                },
                {
                    type: "text",
                    value: "## Strings\n\nAspas duplas interpolam e entendem escapes; aspas simples são literais. Strings em Ruby são **mutáveis** por padrão, o que surpreende quem vem de outras linguagens.",
                },
                {
                    type: "code",
                    value: 'nome = "ana silva"\n\nnome.upcase        # => "ANA SILVA"\nnome.capitalize    # => "Ana silva"\nnome.split(" ")    # => ["ana", "silva"]\nnome.sub("ana", "Ana")   # troca a primeira ocorrência\nnome.gsub("a", "@")      # troca todas\nnome.length        # => 9\nnome.include?("silva")   # => true',
                },
                {
                    type: "text",
                    value: "## O ponto de exclamação\n\nMuitos métodos vêm em par: `upcase` devolve uma cópia alterada e `upcase!` altera o objeto original. O `!` avisa que o método é destrutivo, e é convenção da linguagem, não regra do interpretador.",
                },
            ],
            questions: [
                {
                    statement: "Qual o limite de tamanho de um Integer em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Não existe limite fixo", isCorrect: true },
                        {
                            text: "Sessenta e quatro bits, como na maioria das linguagens",
                            isCorrect: false,
                        },
                        {
                            text: "Trinta e dois bits, com estouro silencioso acima disso",
                            isCorrect: false,
                        },
                        {
                            text: "Depende da arquitetura do processador da máquina",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o resultado de `7 / 2` em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "3", isCorrect: true },
                        { text: "3.5, com a conversão automática para float", isCorrect: false },
                        { text: "Um erro de divisão entre tipos diferentes", isCorrect: false },
                        { text: "4, com o resultado arredondado para cima", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `!` no fim de um método costuma indicar?",
                    difficulty: "medio",
                    options: [
                        { text: "Que ele altera o próprio objeto", isCorrect: true },
                        { text: "Que ele devolve verdadeiro ou falso apenas", isCorrect: false },
                        { text: "Que ele lança uma exceção quando falha", isCorrect: false },
                        { text: "Que ele é um método privado da classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `sub` e `gsub`?",
                    difficulty: "medio",
                    options: [
                        { text: "O gsub troca todas as ocorrências", isCorrect: true },
                        {
                            text: "O sub trabalha apenas com expressões regulares",
                            isCorrect: false,
                        },
                        { text: "O gsub devolve um array em vez de uma string", isCorrect: false },
                        { text: "O sub altera o objeto original da string", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar BigDecimal para dinheiro?",
                    difficulty: "dificil",
                    options: [
                        { text: "Float acumula erro de arredondamento", isCorrect: true },
                        {
                            text: "BigDecimal executa os cálculos bem mais rápido",
                            isCorrect: false,
                        },
                        { text: "Float não aceita valores acima de mil reais", isCorrect: false },
                        { text: "BigDecimal converte a moeda automaticamente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Symbol e por que ele existe",
            blocks: [
                {
                    type: "text",
                    value: "# Um nome, não um texto\n\nUm **Symbol** parece uma string curta com dois-pontos na frente, mas o propósito é outro. String representa **conteúdo**; Symbol representa **identidade**, um nome usado como rótulo.\n\nA diferença prática: cada string nova ocupa um espaço novo na memória, enquanto o mesmo símbolo é sempre o mesmo objeto.",
                },
                {
                    type: "code",
                    value: '"nome".object_id == "nome".object_id   # => false, dois objetos\n:nome.object_id == :nome.object_id     # => true, o mesmo objeto\n\n:nome.class     # => Symbol\n:nome.to_s      # => "nome"\n"nome".to_sym   # => :nome',
                },
                {
                    type: "text",
                    value: "## Onde símbolos aparecem\n\nEles são a escolha padrão para chaves de hash, nomes de métodos e opções de configuração. Em toda parte onde o valor é um rótulo fixo do programa, e não um dado que veio do usuário.",
                },
                {
                    type: "code",
                    value: 'usuario = { nome: "Ana", idade: 28 }\n# equivale a { :nome => "Ana", :idade => 28 }\n\nusuario[:nome]      # => "Ana"\n\n[3, 1, 2].map(&:to_s)   # => ["3", "1", "2"]\n\nobjeto.respond_to?(:salvar)',
                },
                {
                    type: "quote",
                    value: "Regra prática: dado que veio de fora é String. Rótulo escrito no seu código é Symbol.",
                },
            ],
            questions: [
                {
                    statement: "O que um Symbol representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um nome ou rótulo, não conteúdo", isCorrect: true },
                        { text: "Um texto curto com no máximo dez caracteres", isCorrect: false },
                        { text: "Um número inteiro identificando o objeto", isCorrect: false },
                        {
                            text: "Uma constante global visível em todo o programa",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Duas ocorrências do mesmo símbolo são o mesmo objeto?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, sempre", isCorrect: true },
                        {
                            text: "Não, cada uma ocupa memória nova como as strings",
                            isCorrect: false,
                        },
                        {
                            text: "Só quando estiverem no mesmo arquivo de código",
                            isCorrect: false,
                        },
                        { text: "Só depois que o coletor de lixo é executado", isCorrect: false },
                    ],
                },
                {
                    statement: 'O que `{ nome: "Ana" }` cria como chave?',
                    difficulty: "medio",
                    options: [
                        { text: "O símbolo :nome", isCorrect: true },
                        { text: 'A string "nome", com o valor entre aspas', isCorrect: false },
                        { text: "Uma constante chamada nome dentro do hash", isCorrect: false },
                        { text: "Um método chamado nome no objeto criado", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar String em vez de Symbol?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o valor é dado vindo de fora", isCorrect: true },
                        { text: "Quando o valor é uma chave de hash do sistema", isCorrect: false },
                        { text: "Quando o valor é o nome de um método a chamar", isCorrect: false },
                        {
                            text: "Quando o valor precisa ser comparado com outro",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `&:to_s` faz em `map(&:to_s)`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Chama o método to_s em cada item", isCorrect: true },
                        { text: "Converte o símbolo em uma string comum antes", isCorrect: false },
                        {
                            text: "Cria um bloco vazio que não faz nada com o item",
                            isCorrect: false,
                        },
                        { text: "Compara cada item com o símbolo informado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Array",
            blocks: [
                {
                    type: "text",
                    value: "# Listas ordenadas\n\nO Array guarda itens em ordem, aceita tipos misturados e cresce sozinho. Índices negativos contam do fim, o que economiza muito cálculo.",
                },
                {
                    type: "code",
                    value: "nums = [1, 2, 3, 4, 5]\n\nnums[0]        # => 1\nnums[-1]       # => 5, o último\nnums[1..3]     # => [2, 3, 4]\nnums.first(2)  # => [1, 2]\nnums.last      # => 5\n\nnums << 6           # acrescenta no fim\nnums.push(7)        # o mesmo\nnums.unshift(0)     # acrescenta no começo\nnums.pop            # remove e devolve o último",
                },
                {
                    type: "text",
                    value: "## Métodos que resolvem quase tudo\n\nO Array traz uma biblioteca enorme pronta. Vale conhecer os que aparecem toda hora.",
                },
                {
                    type: "table",
                    value: '[["Método", "O que faz"], ["sum, min, max", "soma, menor e maior"], ["sort, reverse", "ordena e inverte"], ["uniq", "remove repetidos"], ["compact", "remove os nil"], ["flatten", "achata arrays aninhados"], ["join(sep)", "vira string com separador"]]',
                },
                {
                    type: "code",
                    value: '[3, 1, 3, nil, 2].compact.uniq.sort   # => [1, 2, 3]\n[[1, 2], [3]].flatten                 # => [1, 2, 3]\n["a", "b"].join("-")                  # => "a-b"\n\n# Operações de conjunto\n[1, 2, 3] & [2, 3, 4]   # => [2, 3], interseção\n[1, 2] | [2, 3]         # => [1, 2, 3], união\n[1, 2, 3] - [2]         # => [1, 3], diferença',
                },
            ],
            questions: [
                {
                    statement: "O que `nums[-1]` devolve?",
                    difficulty: "facil",
                    options: [
                        { text: "O último item do array", isCorrect: true },
                        { text: "Um erro de índice fora do intervalo válido", isCorrect: false },
                        { text: "O primeiro item, contando de trás para frente", isCorrect: false },
                        { text: "O valor nil, porque o índice é negativo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `uniq` faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Remove os itens repetidos", isCorrect: true },
                        { text: "Ordena os itens e remove os valores nulos", isCorrect: false },
                        { text: "Devolve apenas o primeiro item do array", isCorrect: false },
                        { text: "Junta os itens em uma única string de texto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `compact` remove de um array?",
                    difficulty: "medio",
                    options: [
                        { text: "Os valores nil", isCorrect: true },
                        {
                            text: "Os valores repetidos que aparecem mais de uma vez",
                            isCorrect: false,
                        },
                        { text: "Os arrays aninhados dentro do array principal", isCorrect: false },
                        { text: "Os valores falsos, incluindo o false e o nil", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `[1, 2, 3] & [2, 3, 4]` devolve?",
                    difficulty: "dificil",
                    options: [
                        { text: "[2, 3]", isCorrect: true },
                        { text: "[1, 2, 3, 4], que é a união dos dois arrays", isCorrect: false },
                        {
                            text: "[1, 4], que são os itens exclusivos de cada um",
                            isCorrect: false,
                        },
                        {
                            text: "true, porque existem itens em comum entre eles",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `<<` faz em um array?",
                    difficulty: "facil",
                    options: [
                        { text: "Acrescenta um item no fim", isCorrect: true },
                        { text: "Compara o array com o valor da direita", isCorrect: false },
                        { text: "Remove o último item e o devolve", isCorrect: false },
                        { text: "Insere o item na primeira posição", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Hash",
            blocks: [
                {
                    type: "text",
                    value: "# Pares de chave e valor\n\nO Hash guarda pares e mantém a ordem de inserção. As chaves costumam ser símbolos, mas podem ser qualquer objeto.",
                },
                {
                    type: "code",
                    value: 'usuario = { nome: "Ana", idade: 28, ativo: true }\n\nusuario[:nome]              # => "Ana"\nusuario[:cidade]            # => nil\nusuario.fetch(:cidade, "?") # => "?", com padrão\nusuario.fetch(:cidade)      # KeyError, avisa em vez de esconder\n\nusuario[:email] = "a@b.c"\nusuario.delete(:ativo)\nusuario.key?(:nome)         # => true',
                },
                {
                    type: "text",
                    value: "## Percorrendo\n\nO `each` de um hash entrega chave e valor. Os métodos de transformação também existem em versão específica de hash.",
                },
                {
                    type: "code",
                    value: 'usuario.each do |chave, valor|\n  puts "#{chave}: #{valor}"\nend\n\nusuario.keys        # => [:nome, :idade]\nusuario.values      # => ["Ana", 28]\nusuario.transform_values(&:to_s)\nusuario.select { |_, v| v.is_a?(String) }\nusuario.merge(cidade: "Recife")',
                },
                {
                    type: "quote",
                    value: "Prefira fetch a colchetes quando a chave é obrigatória: colchetes devolvem nil e o erro só aparece muito depois.",
                },
            ],
            questions: [
                {
                    statement: "O que `hash[:inexistente]` devolve?",
                    difficulty: "facil",
                    options: [
                        { text: "nil", isCorrect: true },
                        { text: "Um KeyError avisando que a chave não existe", isCorrect: false },
                        { text: "Uma string vazia como valor padrão do hash", isCorrect: false },
                        { text: "O primeiro valor guardado dentro do hash", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem de `fetch` sobre os colchetes?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele avisa quando a chave não existe", isCorrect: true },
                        {
                            text: "Ele funciona com chaves de qualquer tipo de objeto",
                            isCorrect: false,
                        },
                        {
                            text: "Ele devolve o valor bem mais rápido que os colchetes",
                            isCorrect: false,
                        },
                        {
                            text: "Ele mantém a ordem de inserção dos pares no hash",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O Hash mantém a ordem em que os pares foram inseridos?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, mantém", isCorrect: true },
                        {
                            text: "Não, a ordem é sempre aleatória a cada execução",
                            isCorrect: false,
                        },
                        { text: "Não, os pares ficam ordenados pelas chaves", isCorrect: false },
                        { text: "Só quando as chaves usadas forem símbolos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `each` de um hash entrega ao bloco?",
                    difficulty: "facil",
                    options: [
                        { text: "A chave e o valor", isCorrect: true },
                        { text: "Apenas o valor de cada par guardado no hash", isCorrect: false },
                        { text: "Um array com todos os pares de uma só vez", isCorrect: false },
                        { text: "Apenas as chaves, na ordem de inserção delas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `merge` faz com dois hashes?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve um novo com os dois juntos", isCorrect: true },
                        {
                            text: "Altera o primeiro hash acrescentando o segundo",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve apenas as chaves comuns aos dois hashes",
                            isCorrect: false,
                        },
                        { text: "Compara os dois e devolve verdadeiro ou falso", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Range e o Set, agora no core do Ruby 4.0",
            blocks: [
                {
                    type: "text",
                    value: "# Range\n\nUm Range representa um intervalo. Dois pontos incluem o fim, três pontos excluem. Ele é preguiçoso: `(1..1_000_000)` não cria um milhão de objetos.",
                },
                {
                    type: "code",
                    value: '(1..5).to_a        # => [1, 2, 3, 4, 5]\n(1...5).to_a       # => [1, 2, 3, 4]\n(\'a\'..\'e\').to_a    # => ["a", "b", "c", "d", "e"]\n\n(1..10).include?(7)   # => true\n(1..10).step(3).to_a  # => [1, 4, 7, 10]\n\n# Muito usado em case\ncase idade\nwhen 0..12 then "criança"\nwhen 13..17 then "adolescente"\nelse "adulto"\nend',
                },
                {
                    type: "text",
                    value: '# Set\n\nUm Set é uma coleção **sem repetição** e com busca rápida. Até o Ruby 3.x ele morava na biblioteca padrão e exigia `require "set"`.\n\nNo **Ruby 4.0** o Set foi promovido a **classe do core**, disponível sem require, e ganhou uma forma de inspeção nova: `Set[1, 2, 3]`.',
                },
                {
                    type: "code",
                    value: "# Ruby 4.0: sem require\ns = Set[1, 2, 3]\ns << 3\ns.size          # => 3, o repetido não entrou\ns.include?(2)   # => true, e a busca é rápida\n\na = Set[1, 2, 3]\nb = Set[3, 4]\na | b           # => Set[1, 2, 3, 4]\na & b           # => Set[3]\na - b           # => Set[1, 2]",
                },
                {
                    type: "text",
                    value: "Junto do Set, o **Pathname** também virou classe do core no Ruby 4.0, deixando de ser gem padrão. O `SortedSet`, por outro lado, foi removido: quem precisar dele instala a gem separada.",
                },
            ],
            questions: [
                {
                    statement: "Qual a diferença entre `1..5` e `1...5`?",
                    difficulty: "medio",
                    options: [
                        { text: "Os três pontos excluem o fim", isCorrect: true },
                        { text: "Os três pontos excluem o começo do intervalo", isCorrect: false },
                        { text: "Os três pontos criam um intervalo de texto", isCorrect: false },
                        {
                            text: "Não existe diferença prática entre as duas formas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que mudou com o Set no Ruby 4.0?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele virou classe do core, sem require", isCorrect: true },
                        {
                            text: "Ele passou a aceitar valores repetidos na coleção",
                            isCorrect: false,
                        },
                        { text: "Ele foi removido e virou uma gem separada", isCorrect: false },
                        { text: "Ele deixou de manter a ordem de inserção", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza um Set?",
                    difficulty: "facil",
                    options: [
                        { text: "Não guardar valores repetidos", isCorrect: true },
                        { text: "Guardar os itens sempre em ordem crescente", isCorrect: false },
                        { text: "Aceitar apenas números inteiros como itens", isCorrect: false },
                        { text: "Ter um tamanho máximo definido na criação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que aconteceu com o SortedSet no Ruby 4.0?",
                    difficulty: "dificil",
                    options: [
                        { text: "Foi removido e virou gem separada", isCorrect: true },
                        {
                            text: "Foi promovido a classe do core junto com o Set",
                            isCorrect: false,
                        },
                        {
                            text: "Passou a ser o comportamento padrão de todo Set",
                            isCorrect: false,
                        },
                        { text: "Foi renomeado para OrderedSet dentro do core", isCorrect: false },
                    ],
                },
                {
                    statement: "Um Range de um a um milhão cria um milhão de objetos?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ele é preguiçoso", isCorrect: true },
                        {
                            text: "Sim, todos são criados no momento da declaração",
                            isCorrect: false,
                        },
                        {
                            text: "Sim, mas apenas quando o range é uma constante",
                            isCorrect: false,
                        },
                        { text: "Depende da memória disponível na máquina", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Controle de fluxo e blocos",
    aulas: [
        {
            titulo: "Condicionais e o valor de retorno",
            blocks: [
                {
                    type: "text",
                    value: "# Tudo devolve valor\n\nEm Ruby quase toda construção é uma **expressão**, e não uma instrução: ela devolve valor. Um `if` inteiro pode ser atribuído a uma variável, o que dispensa a repetição de atribuições dentro de cada braço.",
                },
                {
                    type: "code",
                    value: 'faixa = if idade < 13\n          "criança"\n        elsif idade < 18\n          "adolescente"\n        else\n          "adulto"\n        end\n\n# O método devolve a última expressão avaliada, sem precisar de return\ndef par?(n)\n  n % 2 == 0\nend',
                },
                {
                    type: "text",
                    value: "## unless e os modificadores\n\n`unless` é o `if` negado, e existe para evitar a leitura truncada de `if !condicao`. Ambos podem vir no fim da linha, o que se lê quase como uma frase.",
                },
                {
                    type: "code",
                    value: 'puts "Bem-vinda" if logada\nputs "Faça login" unless logada\n\nreturn if lista.empty?\n\n# O ternário existe, para casos curtos\nstatus = ativo ? "ativo" : "inativo"',
                },
                {
                    type: "quote",
                    value: "Use unless só com condição simples. unless com && ou || vira quebra-cabeça para quem lê depois.",
                },
            ],
            questions: [
                {
                    statement: "O que um `if` devolve em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor do braço executado", isCorrect: true },
                        { text: "Sempre o valor booleano verdadeiro ou falso", isCorrect: false },
                        { text: "O valor nil, porque if é uma instrução", isCorrect: false },
                        { text: "A condição que foi avaliada por último", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um método devolve sem a palavra `return`?",
                    difficulty: "medio",
                    options: [
                        { text: "A última expressão avaliada", isCorrect: true },
                        { text: "O valor nil, como na maioria das linguagens", isCorrect: false },
                        { text: "O primeiro valor calculado dentro do método", isCorrect: false },
                        {
                            text: "Um erro avisando que falta o retorno explícito",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o `unless`?",
                    difficulty: "facil",
                    options: [
                        { text: "É o if com a condição negada", isCorrect: true },
                        { text: "É um laço que repete até a condição ser falsa", isCorrect: false },
                        { text: "É o if que só funciona no fim de uma linha", isCorrect: false },
                        { text: "É a forma de tratar exceções sem usar rescue", isCorrect: false },
                    ],
                },
                {
                    statement: 'O que `puts "oi" if ativo` faz?',
                    difficulty: "facil",
                    options: [
                        { text: "Imprime apenas quando ativo é verdadeiro", isCorrect: true },
                        { text: "Imprime sempre e depois avalia a condição", isCorrect: false },
                        {
                            text: "Atribui o resultado da condição à variável ativo",
                            isCorrect: false,
                        },
                        { text: "Gera um erro por falta do bloco end no fim", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando evitar o `unless`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Com condições compostas por e ou ou", isCorrect: true },
                        { text: "Sempre que ele estiver no fim de uma linha", isCorrect: false },
                        { text: "Quando a condição envolver números inteiros", isCorrect: false },
                        { text: "Quando houver um else no mesmo bloco", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "case e pattern matching",
            blocks: [
                {
                    type: "text",
                    value: "# O case clássico\n\nO `case` do Ruby compara com o operador `===`, que cada classe define do seu jeito. Por isso ele aceita intervalo, expressão regular e classe no `when`, sem sintaxe especial.",
                },
                {
                    type: "code",
                    value: 'case valor\nwhen Integer then "número inteiro"\nwhen 1..10 then "está entre um e dez"\nwhen /^\\d+$/ then "texto só de dígitos"\nwhen String then "outro texto"\nelse "não sei"\nend',
                },
                {
                    type: "text",
                    value: "## case/in: pattern matching\n\nDesde o Ruby 3.0 existe o `case/in`, que **desmonta** a estrutura enquanto compara. Ele brilha ao tratar JSON e respostas de API, onde antes era preciso uma sequência de acessos e verificações.",
                },
                {
                    type: "code",
                    value: 'resposta = { status: "ok", dados: { id: 7, nome: "Ana" } }\n\ncase resposta\nin { status: "ok", dados: { id: Integer => id, nome: String => nome } }\n  puts "Usuário #{id} chamado #{nome}"\nin { status: "erro", mensagem: String => msg }\n  puts "Falhou: #{msg}"\nelse\n  puts "Formato desconhecido"\nend',
                },
                {
                    type: "text",
                    value: "O `in` casa a forma e já cria as variáveis. Se nenhum padrão casar e não houver `else`, o Ruby levanta `NoMatchingPatternError`, o que evita seguir em silêncio com dado inesperado.",
                },
            ],
            questions: [
                {
                    statement: "Qual operador o `case` clássico usa na comparação?",
                    difficulty: "medio",
                    options: [
                        { text: "O `===`", isCorrect: true },
                        {
                            text: "O `==`, igual à comparação comum entre valores",
                            isCorrect: false,
                        },
                        {
                            text: "O `equal?`, que compara a identidade do objeto",
                            isCorrect: false,
                        },
                        { text: "O `eql?`, que compara valor e também o tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `case/in` faz além de comparar?",
                    difficulty: "medio",
                    options: [
                        { text: "Desmonta a estrutura e cria variáveis", isCorrect: true },
                        {
                            text: "Executa todos os braços que casarem com o valor",
                            isCorrect: false,
                        },
                        { text: "Converte o valor para hash antes de comparar", isCorrect: false },
                        { text: "Ordena as chaves do hash antes da comparação", isCorrect: false },
                    ],
                },
                {
                    statement:
                        "O que acontece quando nenhum padrão do `case/in` casa e não há `else`?",
                    difficulty: "dificil",
                    options: [
                        { text: "É levantado um NoMatchingPatternError", isCorrect: true },
                        {
                            text: "O resultado é nil e a execução segue normalmente",
                            isCorrect: false,
                        },
                        { text: "O primeiro padrão é usado como valor padrão", isCorrect: false },
                        { text: "O Ruby emite apenas um aviso no terminal", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o `case` aceita `when Integer` sem sintaxe especial?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Porque a classe define o operador de comparação",
                            isCorrect: true,
                        },
                        {
                            text: "Porque o Ruby converte a classe em texto antes",
                            isCorrect: false,
                        },
                        {
                            text: "Porque existe um tratamento especial para classes",
                            isCorrect: false,
                        },
                        { text: "Porque o when sempre compara o tipo do valor", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que situação o pattern matching mais ajuda?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao tratar dados aninhados como JSON", isCorrect: true },
                        { text: "Ao comparar dois números inteiros simples", isCorrect: false },
                        { text: "Ao percorrer um array de valores repetidos", isCorrect: false },
                        { text: "Ao definir constantes no topo de uma classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Laços e iteradores",
            blocks: [
                {
                    type: "text",
                    value: "# Ruby prefere iteradores\n\nO `while` e o `for` existem, mas raramente aparecem em código Ruby. A comunidade usa **iteradores**: métodos que recebem um bloco e cuidam da repetição.\n\nO motivo não é estilo apenas. O iterador diz **o quê** você quer, enquanto o laço diz **como** percorrer, e o primeiro erra menos.",
                },
                {
                    type: "code",
                    value: "# Existe, mas quase não se usa\ni = 0\nwhile i < 3\n  puts i\n  i += 1\nend\n\n# O jeito Ruby\n3.times { |i| puts i }\n[1, 2, 3].each { |n| puts n }\n1.upto(3) { |n| puts n }\n5.downto(1) { |n| puts n }\n(1..10).step(2) { |n| puts n }",
                },
                {
                    type: "table",
                    value: '[["Iterador", "O que faz"], ["each", "percorre item a item"], ["each_with_index", "entrega item e posição"], ["times", "repete n vezes"], ["upto e downto", "conta para cima ou para baixo"], ["loop", "repete até um break"]]',
                },
                {
                    type: "code",
                    value: '%w[a b c].each_with_index do |letra, i|\n  puts "#{i}: #{letra}"\nend\n\n# next pula, break sai\n(1..10).each do |n|\n  next if n.odd?\n  break if n > 6\n  puts n\nend',
                },
            ],
            questions: [
                {
                    statement: "Por que a comunidade Ruby prefere iteradores a laços?",
                    difficulty: "medio",
                    options: [
                        { text: "Eles dizem o quê, não como percorrer", isCorrect: true },
                        {
                            text: "Eles executam bem mais rápido que os laços comuns",
                            isCorrect: false,
                        },
                        { text: "Eles são a única forma de percorrer um array", isCorrect: false },
                        {
                            text: "Eles permitem alterar a coleção durante o percurso",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `each_with_index` entrega ao bloco?",
                    difficulty: "facil",
                    options: [
                        { text: "O item e a posição dele", isCorrect: true },
                        { text: "Apenas a posição de cada item da coleção", isCorrect: false },
                        { text: "O item e o total de itens da coleção", isCorrect: false },
                        { text: "Apenas o item, como faz o each comum", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `next` faz dentro de um bloco?",
                    difficulty: "facil",
                    options: [
                        { text: "Pula para a próxima repetição", isCorrect: true },
                        {
                            text: "Encerra a repetição por completo naquele ponto",
                            isCorrect: false,
                        },
                        { text: "Reinicia a repetição desde o primeiro item", isCorrect: false },
                        { text: "Devolve o valor atual e encerra o método", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `%w[a b c]` cria?",
                    difficulty: "medio",
                    options: [
                        { text: "Um array de strings", isCorrect: true },
                        { text: "Um array de símbolos com os mesmos nomes", isCorrect: false },
                        { text: "Uma string única com as três letras juntas", isCorrect: false },
                        { text: "Um hash com as letras como chaves e valores", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `5.downto(1)` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Conta de cinco até um", isCorrect: true },
                        { text: "Conta de um até cinco, na ordem crescente", isCorrect: false },
                        { text: "Divide o número cinco pelo valor informado", isCorrect: false },
                        { text: "Repete o bloco cinco vezes sem contador", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Blocos, yield e o bloco explícito",
            blocks: [
                {
                    type: "text",
                    value: "# O bloco é a marca do Ruby\n\nUm **bloco** é um trecho de código passado a um método. Entre chaves quando cabe em uma linha, entre `do` e `end` quando tem mais.\n\nTodo método pode receber um bloco, mesmo sem declarar nada. Ele executa o bloco com `yield`.",
                },
                {
                    type: "code",
                    value: 'def duas_vezes\n  yield\n  yield\nend\n\nduas_vezes { puts "oi" }\n# oi\n# oi\n\ndef com_valor\n  yield 10\n  yield 20\nend\n\ncom_valor { |n| puts n * 2 }   # 20 e 40',
                },
                {
                    type: "text",
                    value: "## Verificando e recebendo\n\n`block_given?` diz se veio bloco, e evita o erro de chamar `yield` sem ter recebido um. Para guardar o bloco ou repassá-lo, declare com `&`, o que o transforma em um objeto `Proc`.",
                },
                {
                    type: "code",
                    value: 'def talvez\n  return "sem bloco" unless block_given?\n  yield\nend\n\ndef guardando(&bloco)\n  @callback = bloco    # agora é um objeto\n  bloco.call(5)\nend\n\ndef repassando(&bloco)\n  [1, 2, 3].each(&bloco)\nend',
                },
                {
                    type: "text",
                    value: "## O padrão que blocos permitem\n\nO uso mais elegante é garantir que algo seja fechado, aconteça o que acontecer. É assim que o próprio Ruby entrega arquivos.",
                },
                {
                    type: "code",
                    value: 'File.open("dados.txt") do |arquivo|\n  puts arquivo.read\nend\n# o arquivo é fechado sozinho, mesmo se der erro\n\ndef medindo\n  inicio = Time.now\n  resultado = yield\n  puts "Levou #{Time.now - inicio}s"\n  resultado\nend',
                },
            ],
            questions: [
                {
                    statement: "O que `yield` faz dentro de um método?",
                    difficulty: "facil",
                    options: [
                        { text: "Executa o bloco recebido", isCorrect: true },
                        { text: "Devolve o valor e encerra o método na hora", isCorrect: false },
                        { text: "Cria um bloco novo dentro do próprio método", isCorrect: false },
                        { text: "Interrompe a execução até o bloco terminar", isCorrect: false },
                    ],
                },
                {
                    statement: "Como saber se um bloco foi passado ao método?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `block_given?`", isCorrect: true },
                        {
                            text: "Com `has_block?`, que devolve verdadeiro ou falso",
                            isCorrect: false,
                        },
                        {
                            text: "Verificando se a variável bloco não está vazia",
                            isCorrect: false,
                        },
                        { text: "Não é possível saber antes de chamar o yield", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `&` faz em `def metodo(&bloco)`?",
                    difficulty: "medio",
                    options: [
                        { text: "Transforma o bloco em um objeto Proc", isCorrect: true },
                        {
                            text: "Torna o bloco obrigatório na chamada do método",
                            isCorrect: false,
                        },
                        {
                            text: "Executa o bloco antes do corpo do método rodar",
                            isCorrect: false,
                        },
                        {
                            text: "Passa o bloco por referência em vez de por cópia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a vantagem de `File.open` com bloco?",
                    difficulty: "dificil",
                    options: [
                        { text: "O arquivo é fechado mesmo se der erro", isCorrect: true },
                        {
                            text: "O arquivo é lido bem mais rápido do que sem bloco",
                            isCorrect: false,
                        },
                        {
                            text: "O conteúdo é convertido para array automaticamente",
                            isCorrect: false,
                        },
                        {
                            text: "O arquivo pode ser aberto por vários processos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quando usar `do` e `end` em vez de chaves?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o bloco tem mais de uma linha", isCorrect: true },
                        { text: "Quando o bloco recebe mais de um argumento", isCorrect: false },
                        {
                            text: "Quando o método devolve um valor para o chamador",
                            isCorrect: false,
                        },
                        { text: "Quando o bloco está dentro de outro bloco", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Proc e lambda",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando comportamento em variável\n\nBlocos não são objetos: você não pode guardá-los em uma variável. `Proc` e `lambda` são a versão objeto de um bloco, e podem ser passados adiante.\n\nElas parecem iguais e têm **duas diferenças que importam**.",
                },
                {
                    type: "code",
                    value: "quadrado = ->(n) { n * n }     # lambda, forma curta\ndobro = lambda { |n| n * 2 }   # lambda, forma longa\ntriplo = Proc.new { |n| n * 3 }\n\nquadrado.call(4)   # => 16\nquadrado.(4)       # => 16\nquadrado[4]        # => 16",
                },
                {
                    type: "text",
                    value: "## Diferença 1: argumentos\n\nA **lambda é rigorosa**: erra a quantidade de argumentos e ela levanta `ArgumentError`. A **Proc é tolerante**: preenche o que falta com `nil` e ignora o que sobra.\n\n## Diferença 2: o return\n\nO `return` dentro de uma lambda sai só da lambda. Dentro de uma Proc, ele sai do **método inteiro** que a contém, o que costuma surpreender.",
                },
                {
                    type: "code",
                    value: "l = ->(a, b) { [a, b] }\nl.call(1)        # ArgumentError\n\np = Proc.new { |a, b| [a, b] }\np.call(1)        # => [1, nil], sem reclamar\n\ndef teste_lambda\n  l = -> { return 10 }\n  l.call\n  20               # devolve 20\nend\n\ndef teste_proc\n  p = Proc.new { return 10 }\n  p.call\n  20               # nunca chega aqui, devolve 10\nend",
                },
                {
                    type: "quote",
                    value: "Na dúvida, use lambda. O comportamento rigoroso avisa o erro cedo, e o return se comporta como se espera.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao chamar uma lambda com argumentos a menos?",
                    difficulty: "medio",
                    options: [
                        { text: "Ela levanta ArgumentError", isCorrect: true },
                        { text: "Ela preenche os que faltam com o valor nil", isCorrect: false },
                        { text: "Ela devolve nil sem executar o corpo dela", isCorrect: false },
                        { text: "Ela usa os valores da chamada anterior a essa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `return` faz dentro de uma Proc?",
                    difficulty: "dificil",
                    options: [
                        { text: "Sai do método que a contém", isCorrect: true },
                        {
                            text: "Sai apenas da Proc e segue o método normalmente",
                            isCorrect: false,
                        },
                        {
                            text: "Levanta um erro avisando que return é inválido",
                            isCorrect: false,
                        },
                        {
                            text: "Devolve o valor para a variável da Proc apenas",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a forma curta de criar uma lambda?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `->`", isCorrect: true },
                        { text: "Com `Proc.new` seguido do bloco de código", isCorrect: false },
                        { text: "Com `def` sem informar o nome do método", isCorrect: false },
                        { text: "Com `&` na frente do bloco entre chaves", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se executa uma lambda guardada em `f`?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `f.call`", isCorrect: true },
                        { text: "Com `f` sozinho, como se fosse uma variável", isCorrect: false },
                        { text: "Com `f.run`, que executa o corpo do bloco", isCorrect: false },
                        { text: "Com `yield f`, passando a lambda adiante", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual usar por padrão, entre Proc e lambda?",
                    difficulty: "medio",
                    options: [
                        { text: "Lambda, pelo comportamento previsível", isCorrect: true },
                        {
                            text: "Proc, por ser mais tolerante com os argumentos",
                            isCorrect: false,
                        },
                        { text: "Proc, porque ela executa bem mais rápido", isCorrect: false },
                        {
                            text: "Tanto faz, as duas se comportam do mesmo jeito",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Enumerable e métodos",
    aulas: [
        {
            titulo: "Enumerable: map, select e reduce",
            blocks: [
                {
                    type: "text",
                    value: "# O módulo que dá superpoderes\n\n`Enumerable` é um módulo com dezenas de métodos de transformação. Array, Hash, Range e Set o incluem, e é por isso que todos eles respondem aos mesmos métodos.\n\nQualquer classe sua também pode incluí-lo: basta implementar `each`.",
                },
                {
                    type: "code",
                    value: "nums = [1, 2, 3, 4, 5, 6]\n\nnums.map { |n| n * 2 }         # => [2, 4, 6, 8, 10, 12]\nnums.select { |n| n.even? }    # => [2, 4, 6]\nnums.reject { |n| n.even? }    # => [1, 3, 5]\nnums.reduce(0) { |soma, n| soma + n }   # => 21\nnums.sum                       # => 21, atalho do reduce",
                },
                {
                    type: "table",
                    value: '[["Método", "Devolve"], ["map", "um item novo para cada original"], ["select e reject", "os que passam ou não no teste"], ["find", "o primeiro que passa"], ["reduce", "um valor acumulado"], ["group_by", "hash agrupando por critério"], ["partition", "dois arrays, passou e não passou"]]',
                },
                {
                    type: "code",
                    value: 'pessoas = [\n  { nome: "Ana", idade: 28 },\n  { nome: "Bruno", idade: 17 },\n  { nome: "Carla", idade: 34 },\n]\n\npessoas.group_by { |p| p[:idade] >= 18 }\npessoas.partition { |p| p[:idade] >= 18 }\npessoas.sum { |p| p[:idade] }        # => 79\npessoas.max_by { |p| p[:idade] }     # a Carla\npessoas.sort_by { |p| p[:nome] }',
                },
            ],
            questions: [
                {
                    statement: "O que um objeto precisa implementar para incluir Enumerable?",
                    difficulty: "dificil",
                    options: [
                        { text: "O método each", isCorrect: true },
                        { text: "Os métodos map, select e reduce completos", isCorrect: false },
                        { text: "O método to_a que converte para array", isCorrect: false },
                        { text: "Um método chamado size devolvendo o total", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `map` e `select`?",
                    difficulty: "facil",
                    options: [
                        { text: "O map transforma, o select filtra", isCorrect: true },
                        { text: "O map filtra os itens e o select transforma", isCorrect: false },
                        {
                            text: "O map devolve um valor só e o select devolve vários",
                            isCorrect: false,
                        },
                        {
                            text: "O map altera o original e o select devolve cópia",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `reduce` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Um valor acumulado", isCorrect: true },
                        { text: "Uma coleção do mesmo tamanho da original", isCorrect: false },
                        { text: "Apenas o primeiro item que passa no teste", isCorrect: false },
                        { text: "Um hash agrupando os itens por critério", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `partition` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Dois arrays, o que passou e o que não", isCorrect: true },
                        { text: "Um hash com os itens agrupados por critério", isCorrect: false },
                        { text: "Apenas os itens que passaram na condição", isCorrect: false },
                        { text: "O array original dividido ao meio em tamanho", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que Array, Hash e Range respondem aos mesmos métodos?",
                    difficulty: "medio",
                    options: [
                        { text: "Todos incluem o módulo Enumerable", isCorrect: true },
                        {
                            text: "Todos herdam da mesma classe pai chamada Object",
                            isCorrect: false,
                        },
                        {
                            text: "O Ruby copia os métodos entre as classes internas",
                            isCorrect: false,
                        },
                        {
                            text: "Cada um implementa os métodos por conta própria",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Métodos: argumentos e retorno",
            blocks: [
                {
                    type: "text",
                    value: "# Definindo métodos\n\nO `def` cria um método. Não há declaração de tipo, e o retorno é a última expressão avaliada.",
                },
                {
                    type: "code",
                    value: 'def saudacao(nome, saudacao = "Olá")\n  "#{saudacao}, #{nome}!"\nend\n\nsaudacao("Ana")            # => "Olá, Ana!"\nsaudacao("Ana", "E aí")    # => "E aí, Ana!"',
                },
                {
                    type: "text",
                    value: "## Argumentos variáveis\n\nO `*` recolhe os posicionais que sobraram em um array, e o `**` recolhe os nomeados em um hash.",
                },
                {
                    type: "code",
                    value: 'def somar(*numeros)\n  numeros.sum\nend\nsomar(1, 2, 3)      # => 6\n\ndef configurar(**opcoes)\n  opcoes\nend\nconfigurar(tema: "escuro", idioma: "pt")\n\ndef tudo(obrigatorio, *resto, **opcoes, &bloco)\n  # a ordem dos tipos de argumento é fixa\nend',
                },
                {
                    type: "text",
                    value: "## Devolvendo mais de um valor\n\nO método devolve um array e a atribuição múltipla o desmonta na chamada, o que dá a impressão de vários retornos.",
                },
                {
                    type: "code",
                    value: "def divisao_com_resto(a, b)\n  [a / b, a % b]\nend\n\nquociente, resto = divisao_com_resto(7, 2)\n# quociente => 3, resto => 1",
                },
            ],
            questions: [
                {
                    statement: "O que um método devolve quando não há `return`?",
                    difficulty: "facil",
                    options: [
                        { text: "A última expressão avaliada", isCorrect: true },
                        {
                            text: "O valor nil, como acontece em outras linguagens",
                            isCorrect: false,
                        },
                        { text: "O primeiro argumento recebido pelo método", isCorrect: false },
                        { text: "Um erro pedindo o retorno explícito no corpo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `*numeros` recolhe em uma assinatura?",
                    difficulty: "medio",
                    options: [
                        { text: "Os argumentos posicionais que sobraram", isCorrect: true },
                        { text: "Os argumentos nomeados passados na chamada", isCorrect: false },
                        { text: "O bloco de código passado junto ao método", isCorrect: false },
                        {
                            text: "Apenas o primeiro argumento, ignorando o resto",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `**opcoes` recolhe?",
                    difficulty: "medio",
                    options: [
                        { text: "Os argumentos nomeados, em um hash", isCorrect: true },
                        { text: "Os argumentos posicionais, em um array comum", isCorrect: false },
                        { text: "O bloco passado ao método na forma de Proc", isCorrect: false },
                        { text: "Todos os argumentos, sem distinção de tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um método Ruby devolve dois valores?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolvendo um array com os dois", isCorrect: true },
                        { text: "Usando dois comandos return em sequência", isCorrect: false },
                        {
                            text: "Declarando dois tipos de retorno na assinatura",
                            isCorrect: false,
                        },
                        { text: "Não é possível devolver mais de um valor", isCorrect: false },
                    ],
                },
                {
                    statement: "Um argumento com valor padrão é obrigatório na chamada?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, ele vira opcional", isCorrect: true },
                        {
                            text: "Sim, o padrão só vale dentro do corpo do método",
                            isCorrect: false,
                        },
                        { text: "Sim, mas pode receber o valor nil na chamada", isCorrect: false },
                        { text: "Depende de ele vir antes ou depois dos outros", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Argumentos nomeados e a legibilidade da chamada",
            blocks: [
                {
                    type: "text",
                    value: '# Quando a ordem atrapalha\n\nUma chamada como `criar("Ana", true, false, 3)` não diz nada a quem lê. Argumentos **nomeados** resolvem isso: o nome vai na chamada e a ordem deixa de importar.',
                },
                {
                    type: "code",
                    value: 'def criar_usuario(nome:, ativo: true, admin: false)\n  { nome: nome, ativo: ativo, admin: admin }\nend\n\ncriar_usuario(nome: "Ana")\ncriar_usuario(nome: "Bruno", admin: true)\ncriar_usuario(admin: true, nome: "Carla")   # a ordem não importa\n\ncriar_usuario(ativo: false)   # ArgumentError: falta nome',
                },
                {
                    type: "text",
                    value: "O nomeado **sem valor padrão é obrigatório**, e o Ruby avisa pelo nome quando ele falta. Isso é bem melhor que o erro genérico de quantidade dos posicionais.\n\n## Passando um hash pronto\n\nO `**` também funciona na chamada, espalhando um hash como argumentos nomeados.",
                },
                {
                    type: "code",
                    value: 'dados = { nome: "Ana", admin: true }\ncriar_usuario(**dados)\n\n# Novidade do Ruby 4.0: *nil não chama mais nil.to_a\ndef metodo(*args) = args\nmetodo(*nil)   # => []',
                },
                {
                    type: "quote",
                    value: "Regra prática: até dois argumentos, posicional. Três ou mais, nomeados. O ganho de leitura compensa a digitação.",
                },
            ],
            questions: [
                {
                    statement: "Um argumento nomeado sem valor padrão é obrigatório?",
                    difficulty: "medio",
                    options: [
                        { text: "Sim, e o erro diz qual faltou", isCorrect: true },
                        { text: "Não, ele recebe nil quando não é informado", isCorrect: false },
                        { text: "Não, o Ruby usa o valor do argumento anterior", isCorrect: false },
                        {
                            text: "Depende de haver outros nomeados na assinatura",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "A ordem dos argumentos nomeados importa na chamada?",
                    difficulty: "facil",
                    options: [
                        { text: "Não, cada um vai pelo nome", isCorrect: true },
                        { text: "Sim, precisa seguir a ordem da assinatura", isCorrect: false },
                        { text: "Sim, mas apenas quando houver valor padrão", isCorrect: false },
                        { text: "Sim, os obrigatórios vêm sempre primeiro", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `**dados` faz em uma chamada de método?",
                    difficulty: "medio",
                    options: [
                        { text: "Espalha o hash como nomeados", isCorrect: true },
                        { text: "Passa o hash inteiro como um único argumento", isCorrect: false },
                        { text: "Converte o hash em array antes de passar", isCorrect: false },
                        { text: "Duplica os valores do hash antes da chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a vantagem do erro de um nomeado obrigatório?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele diz o nome do que faltou", isCorrect: true },
                        { text: "Ele interrompe a execução bem mais cedo", isCorrect: false },
                        { text: "Ele sugere um valor padrão para o argumento", isCorrect: false },
                        { text: "Ele lista todos os argumentos do método", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou no Ruby 4.0 quanto a `*nil`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele não chama mais nil.to_a", isCorrect: true },
                        {
                            text: "Ele passou a levantar um erro de tipo inválido",
                            isCorrect: false,
                        },
                        { text: "Ele agora converte o nil em um array vazio", isCorrect: false },
                        {
                            text: "Ele deixou de ser aceito na chamada de métodos",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "Convenções de nome: interrogação e exclamação",
            blocks: [
                {
                    type: "text",
                    value: "# O nome conta o que o método faz\n\nRuby não tem palavras-chave para isso, mas a comunidade segue duas convenções tão firmes que parecem regra da linguagem.\n\n- Método terminado em `?` **pergunta** e devolve verdadeiro ou falso\n- Método terminado em `!` **avisa de um perigo**, quase sempre alterar o próprio objeto",
                },
                {
                    type: "code",
                    value: 'nums = [3, 1, 2]\n\nnums.empty?      # => false\nnums.include?(2) # => true\n\nordenado = nums.sort   # devolve cópia, nums intacto\nnums.sort!             # altera nums no lugar\n\ntexto = "olá"\ntexto.upcase           # => "OLÁ", texto continua "olá"\ntexto.upcase!          # texto agora é "OLÁ"',
                },
                {
                    type: "text",
                    value: "## O detalhe do bang\n\nOs métodos com `!` costumam devolver `nil` quando **não houve mudança**. Encadear direto neles é um erro clássico.",
                },
                {
                    type: "code",
                    value: "a = [1, 2, 3]\na.sort!          # => [1, 2, 3], já estava ordenado\na.uniq!          # => nil, não havia repetido\n\n# Erro clássico: encadear em cima de um bang\nresultado = lista.uniq!.sort   # NoMethodError quando uniq! devolve nil\n\n# Certo\nresultado = lista.uniq.sort",
                },
                {
                    type: "text",
                    value: "## Nos seus métodos\n\nSiga a convenção. Um `salvar!` que levanta exceção ao falhar e um `salvar` que devolve `false` é exatamente o que o Rails faz, e quem lê já sabe o que esperar.",
                },
            ],
            questions: [
                {
                    statement: "O que um método terminado em `?` devolve por convenção?",
                    difficulty: "facil",
                    options: [
                        { text: "Verdadeiro ou falso", isCorrect: true },
                        { text: "Uma cópia alterada do objeto original", isCorrect: false },
                        { text: "O valor nil quando a resposta é negativa", isCorrect: false },
                        { text: "Um número indicando o total encontrado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `!` no fim do nome costuma avisar?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o método altera o objeto", isCorrect: true },
                        { text: "Que o método é privado dentro da classe", isCorrect: false },
                        { text: "Que o método devolve sempre um booleano", isCorrect: false },
                        { text: "Que o método precisa receber um bloco", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `uniq!` devolve quando não há repetidos?",
                    difficulty: "dificil",
                    options: [
                        { text: "nil", isCorrect: true },
                        { text: "O array original, sem nenhuma alteração feita", isCorrect: false },
                        {
                            text: "Um array vazio, indicando que nada foi removido",
                            isCorrect: false,
                        },
                        { text: "Um erro avisando que não havia o que remover", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que `lista.uniq!.sort` é arriscado?",
                    difficulty: "dificil",
                    options: [
                        { text: "O uniq! pode devolver nil e quebrar a cadeia", isCorrect: true },
                        { text: "O sort não funciona depois de um método bang", isCorrect: false },
                        {
                            text: "A ordem dos dois métodos está sempre invertida",
                            isCorrect: false,
                        },
                        { text: "O uniq! não aceita ser encadeado com outros", isCorrect: false },
                    ],
                },
                {
                    statement: "Essas convenções são impostas pelo interpretador?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, são acordo da comunidade", isCorrect: true },
                        { text: "Sim, o Ruby verifica o retorno de cada método", isCorrect: false },
                        { text: "Sim, mas apenas para os métodos com o bang", isCorrect: false },
                        { text: "Sim, e o código não roda se forem quebradas", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Encadeando transformações",
            blocks: [
                {
                    type: "text",
                    value: "# Um pipeline de dados\n\nComo quase todo método de Enumerable devolve uma coleção, dá para encadear transformações e ler o processo na ordem em que ele acontece.",
                },
                {
                    type: "code",
                    value: 'pedidos = [\n  { cliente: "Ana", total: 150.0, status: :pago },\n  { cliente: "Bruno", total: 80.0, status: :pendente },\n  { cliente: "Ana", total: 200.0, status: :pago },\n  { cliente: "Carla", total: 50.0, status: :pago },\n]\n\ntotal_por_cliente = pedidos\n  .select { |p| p[:status] == :pago }\n  .group_by { |p| p[:cliente] }\n  .transform_values { |lista| lista.sum { |p| p[:total] } }\n  .sort_by { |_, total| -total }\n  .to_h\n\n# => { "Ana" => 350.0, "Carla" => 50.0 }',
                },
                {
                    type: "text",
                    value: "## O custo de encadear\n\nCada elo cria uma coleção nova. Para milhares de itens isso pesa, e o `lazy` resolve: ele avalia sob demanda e para assim que tem o que precisa.",
                },
                {
                    type: "code",
                    value: "# Sem lazy: mapeia um milhão de itens e depois pega cinco\n(1..1_000_000).map { |n| n * 2 }.select(&:even?).first(5)\n\n# Com lazy: processa só o necessário para chegar aos cinco\n(1..1_000_000).lazy.map { |n| n * 2 }.select(&:even?).first(5)",
                },
                {
                    type: "text",
                    value: "## then, para quebrar a cadeia\n\nQuando o próximo passo não é um método da coleção, `then` mantém a leitura linear em vez de obrigar uma variável no meio.",
                },
                {
                    type: "code",
                    value: 'resultado = numeros\n  .map { |n| n * 2 }\n  .sum\n  .then { |total| "Total: #{total}" }',
                },
            ],
            questions: [
                {
                    statement: "Por que dá para encadear métodos de Enumerable?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque cada um devolve uma coleção nova", isCorrect: true },
                        {
                            text: "Porque o Ruby guarda o resultado em uma variável",
                            isCorrect: false,
                        },
                        { text: "Porque eles alteram sempre a coleção original", isCorrect: false },
                        {
                            text: "Porque o interpretador junta as chamadas em uma",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que o `lazy` muda em uma cadeia?",
                    difficulty: "dificil",
                    options: [
                        { text: "Avalia sob demanda, só o necessário", isCorrect: true },
                        { text: "Executa toda a cadeia em segundo plano", isCorrect: false },
                        {
                            text: "Guarda o resultado em cache para a próxima vez",
                            isCorrect: false,
                        },
                        { text: "Ordena a coleção antes de aplicar os métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo de uma cadeia longa sem lazy?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada elo cria uma coleção intermediária", isCorrect: true },
                        {
                            text: "A ordem dos itens da coleção acaba se perdendo",
                            isCorrect: false,
                        },
                        { text: "Os métodos passam a alterar o objeto original", isCorrect: false },
                        {
                            text: "O resultado final vira sempre um array simples",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Para que serve o `then` em uma cadeia?",
                    difficulty: "medio",
                    options: [
                        { text: "Aplicar algo que não é método da coleção", isCorrect: true },
                        { text: "Executar o próximo passo apenas se der certo", isCorrect: false },
                        { text: "Interromper a cadeia e devolver o valor atual", isCorrect: false },
                        { text: "Repetir a última transformação mais uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `transform_values` faz em um hash?",
                    difficulty: "medio",
                    options: [
                        { text: "Aplica um bloco a cada valor", isCorrect: true },
                        { text: "Aplica um bloco a cada chave do hash", isCorrect: false },
                        { text: "Troca as chaves pelos valores correspondentes", isCorrect: false },
                        { text: "Remove os valores que não passam no teste", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Classes, módulos e objetos",
    aulas: [
        {
            titulo: "Classes e initialize",
            blocks: [
                {
                    type: "text",
                    value: "# Definindo um tipo\n\nA classe descreve o que um objeto guarda e o que ele sabe fazer. O método `initialize` roda quando você chama `new`, e é onde as variáveis de instância nascem.",
                },
                {
                    type: "code",
                    value: 'class Produto\n  def initialize(nome, preco)\n    @nome = nome\n    @preco = preco\n  end\n\n  def descricao\n    "#{@nome}: R$ #{format(\'%.2f\', @preco)}"\n  end\n\n  def com_desconto(percentual)\n    @preco * (1 - percentual)\n  end\nend\n\ncamisa = Produto.new("Camisa", 79.9)\nputs camisa.descricao\nputs camisa.com_desconto(0.1)',
                },
                {
                    type: "text",
                    value: "## Visibilidade\n\nTodo método é público por padrão. `private` e `protected` mudam isso para tudo que vier depois, o que é diferente de outras linguagens onde se marca método a método.",
                },
                {
                    type: "code",
                    value: 'class Conta\n  def sacar(valor)\n    return "saldo insuficiente" unless saldo_suficiente?(valor)\n    @saldo -= valor\n  end\n\n  private\n\n  # daqui para baixo, tudo é privado\n  def saldo_suficiente?(valor)\n    @saldo >= valor\n  end\nend',
                },
                {
                    type: "quote",
                    value: "Em Ruby, método privado não pode ser chamado com receptor explícito. Nem self.metodo funciona, salvo em atribuição.",
                },
            ],
            questions: [
                {
                    statement: "Qual método roda quando você chama `new`?",
                    difficulty: "facil",
                    options: [
                        { text: "initialize", isCorrect: true },
                        { text: "constructor, como em várias outras linguagens", isCorrect: false },
                        { text: "new, definido dentro do corpo da classe", isCorrect: false },
                        { text: "create, chamado logo depois da alocação", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a visibilidade padrão de um método em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Público", isCorrect: true },
                        { text: "Privado, até que se declare o contrário", isCorrect: false },
                        { text: "Protegido, visível apenas para as subclasses", isCorrect: false },
                        { text: "Depende de o método começar com maiúscula", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o `private` funciona em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Vale para tudo que vier depois dele", isCorrect: true },
                        { text: "Vale apenas para o método logo abaixo dele", isCorrect: false },
                        { text: "Precisa ser repetido em cada método privado", isCorrect: false },
                        { text: "Recebe os nomes dos métodos entre parênteses", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde as variáveis de instância costumam nascer?",
                    difficulty: "facil",
                    options: [
                        { text: "Dentro do initialize", isCorrect: true },
                        { text: "No topo da classe, antes de qualquer método", isCorrect: false },
                        { text: "Fora da classe, junto com as constantes", isCorrect: false },
                        { text: "Em um bloco especial chamado attributes", isCorrect: false },
                    ],
                },
                {
                    statement: "Um método privado pode ser chamado com receptor explícito?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não, salvo em atribuição", isCorrect: true },
                        { text: "Sim, desde que seja com a palavra self", isCorrect: false },
                        {
                            text: "Sim, desde que a chamada esteja na mesma classe",
                            isCorrect: false,
                        },
                        { text: "Sim, desde que o objeto seja da mesma classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "attr_reader, attr_writer e attr_accessor",
            blocks: [
                {
                    type: "text",
                    value: "# Métodos de acesso sem repetição\n\nVariáveis de instância são privadas ao objeto: ninguém de fora lê `@nome` diretamente. Escrever um método para cada leitura e escrita seria repetitivo, e o Ruby gera esses métodos para você.",
                },
                {
                    type: "code",
                    value: 'class Produto\n  attr_reader :nome            # só leitura\n  attr_writer :estoque         # só escrita\n  attr_accessor :preco         # leitura e escrita\n\n  def initialize(nome, preco)\n    @nome = nome\n    @preco = preco\n    @estoque = 0\n  end\nend\n\np = Produto.new("Caneca", 29.9)\np.nome           # => "Caneca"\np.preco = 34.9   # funciona, tem writer\np.nome = "outro" # NoMethodError, só tem reader',
                },
                {
                    type: "text",
                    value: "## O que isso gera\n\n`attr_reader :nome` equivale exatamente a escrever o método abaixo. Nada de mágico, apenas geração de código.",
                },
                {
                    type: "code",
                    value: "def nome\n  @nome\nend\n\n# attr_writer :nome gera:\ndef nome=(valor)\n  @nome = valor\nend",
                },
                {
                    type: "text",
                    value: "## Quando não usar accessor\n\n`attr_accessor` para tudo transforma o objeto em um saco de dados aberto e destrói o encapsulamento. Exponha só o que precisa mesmo ser lido ou escrito de fora, e prefira métodos com nome de intenção a um writer cru.",
                },
                {
                    type: "code",
                    value: '# Em vez de expor o saldo para escrita\nattr_accessor :saldo   # qualquer um sobrescreve\n\n# Prefira a operação com nome e regra\nattr_reader :saldo\n\ndef depositar(valor)\n  raise ArgumentError, "valor precisa ser positivo" unless valor.positive?\n  @saldo += valor\nend',
                },
            ],
            questions: [
                {
                    statement: "O que `attr_reader :nome` gera?",
                    difficulty: "facil",
                    options: [
                        { text: "Um método de leitura para @nome", isCorrect: true },
                        {
                            text: "Os métodos de leitura e de escrita ao mesmo tempo",
                            isCorrect: false,
                        },
                        {
                            text: "Uma variável de instância chamada nome na classe",
                            isCorrect: false,
                        },
                        { text: "Uma constante com o valor atual do atributo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual gera leitura e escrita de uma vez?",
                    difficulty: "facil",
                    options: [
                        { text: "attr_accessor", isCorrect: true },
                        { text: "attr_reader, que também aceita atribuição", isCorrect: false },
                        { text: "attr_writer, que gera os dois métodos", isCorrect: false },
                        { text: "attr_both, específico para os dois casos", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se chama o método gerado por `attr_writer :preco`?",
                    difficulty: "medio",
                    options: [
                        { text: "preco=", isCorrect: true },
                        { text: "set_preco, no padrão de outras linguagens", isCorrect: false },
                        { text: "write_preco, seguindo o nome do gerador", isCorrect: false },
                        { text: "preco!, com o bang indicando alteração", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que evitar `attr_accessor` em tudo?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele abre o objeto e mata o encapsulamento", isCorrect: true },
                        {
                            text: "Ele consome mais memória do que os outros dois",
                            isCorrect: false,
                        },
                        { text: "Ele não funciona quando a classe tem herança", isCorrect: false },
                        { text: "Ele impede que a classe defina outros métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "É possível ler `@nome` de fora do objeto sem accessor?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, variável de instância é do objeto", isCorrect: true },
                        { text: "Sim, basta usar o ponto seguido do nome dela", isCorrect: false },
                        { text: "Sim, desde que a classe não tenha herança", isCorrect: false },
                        { text: "Sim, com a variável declarada como constante", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Herança e super",
            blocks: [
                {
                    type: "text",
                    value: "# Estendendo uma classe\n\nO `<` estabelece herança. A filha recebe tudo da mãe e pode substituir métodos. O `super` chama a versão da classe mãe.\n\nRuby tem **herança simples**: uma classe só herda de uma outra. O que compartilha comportamento entre classes distantes são os módulos.",
                },
                {
                    type: "code",
                    value: "class Funcionario\n  attr_reader :nome\n\n  def initialize(nome, salario_base)\n    @nome = nome\n    @salario_base = salario_base\n  end\n\n  def salario\n    @salario_base\n  end\nend\n\nclass Vendedor < Funcionario\n  def initialize(nome, salario_base, comissao)\n    super(nome, salario_base)\n    @comissao = comissao\n  end\n\n  def salario\n    super + @comissao\n  end\nend",
                },
                {
                    type: "text",
                    value: "## super com e sem parênteses\n\nEsta é uma pegadinha frequente:\n\n- `super` sem nada repassa **os mesmos argumentos** que o método recebeu\n- `super()` com parênteses vazios chama **sem argumento nenhum**\n- `super(a, b)` chama com o que você informar\n\nA diferença entre as duas primeiras formas já causou muito bug silencioso.",
                },
                {
                    type: "code",
                    value: 'class Base\n  def cumprimentar(nome = "mundo")\n    "Olá, #{nome}"\n  end\nend\n\nclass Filha < Base\n  def cumprimentar(nome)\n    super       # passa nome adiante\n  end\n\n  def outra(nome)\n    super()     # chama sem argumento, usa o padrão\n  end\nend',
                },
                {
                    type: "text",
                    value: "## A cadeia de ancestrais\n\n`ancestors` mostra a ordem exata em que o Ruby procura um método. Ela inclui classes e módulos, e é a resposta para qualquer dúvida de qual versão será chamada.",
                },
                {
                    type: "code",
                    value: "Vendedor.ancestors\n# => [Vendedor, Funcionario, Object, Kernel, BasicObject]",
                },
            ],
            questions: [
                {
                    statement: "Qual símbolo estabelece herança em Ruby?",
                    difficulty: "facil",
                    options: [
                        { text: "O sinal de menor", isCorrect: true },
                        {
                            text: "A palavra extends, antes do nome da classe mãe",
                            isCorrect: false,
                        },
                        { text: "A palavra inherits, seguida do nome da mãe", isCorrect: false },
                        {
                            text: "Os dois pontos, como em várias outras linguagens",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `super` sem parênteses faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Repassa os mesmos argumentos recebidos", isCorrect: true },
                        { text: "Chama o método da mãe sem argumento nenhum", isCorrect: false },
                        { text: "Chama o initialize da classe mãe, sempre", isCorrect: false },
                        { text: "Devolve a instância da classe mãe do objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `super()` com parênteses vazios faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Chama sem argumento algum", isCorrect: true },
                        {
                            text: "Repassa os mesmos argumentos que o método recebeu",
                            isCorrect: false,
                        },
                        {
                            text: "Faz exatamente o mesmo que o super sem parênteses",
                            isCorrect: false,
                        },
                        {
                            text: "Levanta um erro por faltar os argumentos exigidos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Quantas classes uma classe Ruby pode herdar?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma", isCorrect: true },
                        { text: "Quantas forem necessárias no projeto", isCorrect: false },
                        { text: "Duas, sendo uma delas abstrata", isCorrect: false },
                        { text: "Nenhuma, Ruby não tem herança de classes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `ancestors` devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "A ordem de busca de métodos", isCorrect: true },
                        { text: "Apenas as classes mães, sem os módulos", isCorrect: false },
                        { text: "Os métodos herdados de cada classe da cadeia", isCorrect: false },
                        { text: "As classes filhas que estendem esta classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Módulos: namespace e mixin",
            blocks: [
                {
                    type: "text",
                    value: "# Duas funções em uma construção\n\nO módulo serve para duas coisas bem diferentes.\n\n**Namespace**: agrupar classes relacionadas e evitar choque de nomes.\n\n**Mixin**: guardar métodos que várias classes vão absorver, resolvendo o que a herança simples não resolve.",
                },
                {
                    type: "code",
                    value: "# Como namespace\nmodule Financeiro\n  class Conta; end\n  class Fatura; end\nend\n\nFinanceiro::Conta.new",
                },
                {
                    type: "code",
                    value: '# Como mixin\nmodule Auditavel\n  def registrar(acao)\n    puts "[#{Time.now}] #{self.class}: #{acao}"\n  end\nend\n\nmodule Exportavel\n  def exportar\n    to_h.to_json\n  end\nend\n\nclass Pedido\n  include Auditavel\n  include Exportavel\nend\n\nPedido.new.registrar("criado")',
                },
                {
                    type: "text",
                    value: "## include, extend e prepend\n\nSão três formas de absorver um módulo, e a diferença está em **onde** os métodos entram.",
                },
                {
                    type: "table",
                    value: '[["Forma", "Os métodos viram", "Ficam"], ["include", "de instância", "depois da classe"], ["extend", "de classe", "no objeto"], ["prepend", "de instância", "antes da classe"]]',
                },
                {
                    type: "code",
                    value: 'module Registro\n  def salvar\n    puts "registrando antes"\n    super\n  end\nend\n\nclass Documento\n  prepend Registro\n\n  def salvar\n    puts "salvando"\n  end\nend\n\nDocumento.new.salvar\n# registrando antes\n# salvando',
                },
            ],
            questions: [
                {
                    statement: "Quais são os dois usos de um módulo?",
                    difficulty: "medio",
                    options: [
                        { text: "Namespace e mixin de métodos", isCorrect: true },
                        { text: "Herança múltipla e sobrecarga de operadores", isCorrect: false },
                        { text: "Definição de tipos e validação de argumentos", isCorrect: false },
                        { text: "Agrupar constantes e controlar a visibilidade", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `include` faz com os métodos do módulo?",
                    difficulty: "medio",
                    options: [
                        { text: "Torna métodos de instância da classe", isCorrect: true },
                        {
                            text: "Torna métodos de classe, chamados sem instância",
                            isCorrect: false,
                        },
                        {
                            text: "Copia os métodos para dentro do arquivo da classe",
                            isCorrect: false,
                        },
                        {
                            text: "Deixa os métodos disponíveis apenas no initialize",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a diferença de `prepend` para `include`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele entra antes da classe na busca", isCorrect: true },
                        {
                            text: "Ele torna os métodos do módulo métodos de classe",
                            isCorrect: false,
                        },
                        { text: "Ele copia o módulo em vez de referenciá-lo", isCorrect: false },
                        {
                            text: "Ele impede que a classe sobrescreva os métodos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que `extend` faz em uma classe?",
                    difficulty: "medio",
                    options: [
                        { text: "Torna os métodos do módulo de classe", isCorrect: true },
                        { text: "Torna os métodos do módulo de instância", isCorrect: false },
                        { text: "Estende a classe com herança do módulo", isCorrect: false },
                        {
                            text: "Adiciona o módulo à lista de ancestrais no fim",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como se acessa a classe Conta dentro do módulo Financeiro?",
                    difficulty: "facil",
                    options: [
                        { text: "Com `Financeiro::Conta`", isCorrect: true },
                        { text: "Com `Financeiro.Conta`, usando o ponto", isCorrect: false },
                        { text: "Com `Financeiro->Conta`, usando a seta", isCorrect: false },
                        { text: "Com `Conta` apenas, o módulo é transparente", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Duck typing, Comparable e Enumerable",
            blocks: [
                {
                    type: "text",
                    value: "# Se anda como pato\n\nRuby não pergunta o tipo de um objeto, pergunta se ele **responde ao método**. Isso é o duck typing, e é o que torna a linguagem tão flexível: qualquer objeto que implemente o método certo serve.\n\nO efeito prático é que você programa contra comportamento, não contra classe.",
                },
                {
                    type: "code",
                    value: 'def imprimir(saida, texto)\n  saida.puts(texto)   # serve qualquer coisa que saiba puts\nend\n\nimprimir($stdout, "vai para a tela")\nimprimir(File.open("log.txt", "w"), "vai para o arquivo")\nimprimir(StringIO.new, "vai para a memória")',
                },
                {
                    type: "text",
                    value: "## Comparable\n\nImplemente `<=>` e inclua `Comparable`: a classe ganha `<`, `<=`, `>`, `>=`, `==`, `between?` e `clamp` de graça.",
                },
                {
                    type: "code",
                    value: 'class Versao\n  include Comparable\n  attr_reader :partes\n\n  def initialize(texto)\n    @partes = texto.split(".").map(&:to_i)\n  end\n\n  def <=>(outra)\n    partes <=> outra.partes\n  end\nend\n\nVersao.new("4.0.6") > Versao.new("3.4.8")   # => true\n[Versao.new("2.0"), Versao.new("1.9")].sort',
                },
                {
                    type: "text",
                    value: "## Enumerable\n\nO mesmo vale para coleções: implemente `each` e inclua `Enumerable` para ganhar `map`, `select`, `sort`, `sum` e dezenas de outros.",
                },
                {
                    type: "code",
                    value: 'class Turma\n  include Enumerable\n\n  def initialize(alunos)\n    @alunos = alunos\n  end\n\n  def each(&bloco)\n    @alunos.each(&bloco)\n  end\nend\n\nturma = Turma.new(["Ana", "Bruno", "Carla"])\nturma.map(&:upcase)\nturma.select { |a| a.start_with?("A") }\nturma.sort',
                },
            ],
            questions: [
                {
                    statement: "O que o duck typing significa na prática?",
                    difficulty: "medio",
                    options: [
                        { text: "Importa o método, não a classe do objeto", isCorrect: true },
                        { text: "Importa a classe declarada na assinatura", isCorrect: false },
                        { text: "Os tipos são verificados antes de executar", isCorrect: false },
                        { text: "Todo objeto precisa herdar da mesma classe", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma classe precisa para incluir Comparable?",
                    difficulty: "medio",
                    options: [
                        { text: "Implementar o método `<=>`", isCorrect: true },
                        { text: "Implementar os métodos de maior e de menor", isCorrect: false },
                        { text: "Herdar de uma classe que já seja comparável", isCorrect: false },
                        {
                            text: "Definir o método igual com dois sinais de igual",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que a classe ganha ao incluir Comparable?",
                    difficulty: "medio",
                    options: [
                        { text: "Os operadores de comparação e o between?", isCorrect: true },
                        { text: "Os métodos map, select e sum de uma só vez", isCorrect: false },
                        { text: "A capacidade de ser convertida em array", isCorrect: false },
                        { text: "A ordenação automática de suas instâncias", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma classe precisa para incluir Enumerable?",
                    difficulty: "medio",
                    options: [
                        { text: "Implementar o método `each`", isCorrect: true },
                        { text: "Implementar o método map com um bloco", isCorrect: false },
                        { text: "Herdar diretamente da classe Array do Ruby", isCorrect: false },
                        {
                            text: "Guardar os itens em um array interno chamado items",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a vantagem de programar contra comportamento?",
                    difficulty: "dificil",
                    options: [
                        { text: "Qualquer objeto compatível passa a servir", isCorrect: true },
                        { text: "O código executa bem mais rápido em produção", isCorrect: false },
                        { text: "O interpretador consegue verificar os tipos", isCorrect: false },
                        { text: "As classes ficam com menos métodos definidos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Erros, testes e ferramentas",
    aulas: [
        {
            titulo: "Exceções: raise, rescue e ensure",
            blocks: [
                {
                    type: "text",
                    value: "# Sinalizando falha\n\n`raise` levanta uma exceção e `rescue` a captura. O `ensure` roda sempre, com ou sem erro, e é onde vai a limpeza.",
                },
                {
                    type: "code",
                    value: 'def dividir(a, b)\n  raise ArgumentError, "divisor não pode ser zero" if b.zero?\n  a / b\nend\n\nbegin\n  dividir(10, 0)\nrescue ArgumentError => e\n  puts "Falhou: #{e.message}"\nrescue StandardError => e\n  puts "Outro problema: #{e.class}"\nelse\n  puts "Deu certo"     # roda só se não houve exceção\nensure\n  puts "Sempre roda"\nend',
                },
                {
                    type: "text",
                    value: "## rescue no método inteiro\n\nDentro de um método, `def` já funciona como `begin`. Não precisa envolver o corpo.",
                },
                {
                    type: "code",
                    value: 'def carregar(caminho)\n  File.read(caminho)\nrescue Errno::ENOENT\n  ""     # arquivo não existe, devolve vazio\nend',
                },
                {
                    type: "text",
                    value: "## O erro clássico do rescue solto\n\n`rescue` sem classe captura `StandardError`, o que é o certo. **Nunca capture `Exception`**: ela inclui coisas que não são erro de aplicação, como a interrupção pelo teclado e a falta de memória, e capturá-las impede até de encerrar o programa.",
                },
                {
                    type: "code",
                    value: "# Certo: pega erros de aplicação\nrescue => e\n\n# Errado: pega até Ctrl+C e falta de memória\nrescue Exception => e",
                },
            ],
            questions: [
                {
                    statement: "Quando o bloco `ensure` é executado?",
                    difficulty: "facil",
                    options: [
                        { text: "Sempre, com ou sem exceção", isCorrect: true },
                        { text: "Apenas quando uma exceção foi levantada", isCorrect: false },
                        { text: "Apenas quando nenhuma exceção acontece", isCorrect: false },
                        { text: "Somente se não houver nenhum bloco rescue", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um `rescue` sem classe captura?",
                    difficulty: "medio",
                    options: [
                        { text: "StandardError e as filhas dela", isCorrect: true },
                        { text: "Exception, ou seja, absolutamente tudo", isCorrect: false },
                        { text: "Apenas as exceções definidas por você", isCorrect: false },
                        { text: "Nada, ele precisa da classe explícita", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que nunca capturar `Exception`?",
                    difficulty: "dificil",
                    options: [
                        {
                            text: "Ela inclui interrupção do teclado e falta de memória",
                            isCorrect: true,
                        },
                        {
                            text: "Ela é bem mais lenta do que capturar um StandardError",
                            isCorrect: false,
                        },
                        { text: "Ela só existe em versões antigas do Ruby", isCorrect: false },
                        {
                            text: "Ela impede o uso do bloco ensure no mesmo begin",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement:
                        "Precisa envolver o corpo de um método com `begin` para usar `rescue`?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, o def já funciona como begin", isCorrect: true },
                        { text: "Sim, sempre, senão o rescue não é reconhecido", isCorrect: false },
                        { text: "Sim, exceto quando o método tem uma linha só", isCorrect: false },
                        { text: "Sim, mas apenas em métodos de classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o bloco `else` de um begin roda?",
                    difficulty: "medio",
                    options: [
                        { text: "Só quando não houve exceção", isCorrect: true },
                        { text: "Sempre depois de o rescue ter capturado", isCorrect: false },
                        { text: "Quando nenhum rescue casou com a exceção", isCorrect: false },
                        { text: "Antes do ensure, mesmo se houve exceção", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Exceções próprias e hierarquia",
            blocks: [
                {
                    type: "text",
                    value: "# Criando o seu tipo de erro\n\nUma exceção própria é uma classe que herda de `StandardError`. Herdar de `Exception` direto é o erro comum: as suas exceções passariam a escapar de um `rescue` normal.",
                },
                {
                    type: "code",
                    value: "module Pagamento\n  Erro = Class.new(StandardError)\n\n  class SaldoInsuficiente < Erro\n    attr_reader :faltam\n\n    def initialize(faltam)\n      @faltam = faltam\n      super(\"Faltam R$ #{format('%.2f', faltam)}\")\n    end\n  end\n\n  CartaoRecusado = Class.new(Erro)\nend\n\nbegin\n  cobrar(pedido)\nrescue Pagamento::SaldoInsuficiente => e\n  avisar_cliente(e.faltam)\nrescue Pagamento::Erro => e\n  registrar(e)      # pega qualquer erro do domínio\nend",
                },
                {
                    type: "text",
                    value: "## Repassando com contexto\n\nRelevantar preserva a causa original no `cause`, sem que você precise fazer nada. Isso mantém o rastro completo no log.",
                },
                {
                    type: "code",
                    value: 'begin\n  gateway.cobrar(valor)\nrescue Net::OpenTimeout\n  raise Pagamento::Erro, "gateway não respondeu"\nend\n\n# Mais tarde\nputs e.cause.class    # => Net::OpenTimeout',
                },
                {
                    type: "text",
                    value: "## retry\n\nDentro de um `rescue`, `retry` executa o bloco `begin` de novo. É útil para falha transitória, mas exige um limite: sem contador vira laço infinito.",
                },
                {
                    type: "code",
                    value: "tentativas = 0\nbegin\n  tentativas += 1\n  api.buscar\nrescue Net::OpenTimeout\n  retry if tentativas < 3\n  raise\nend",
                },
            ],
            questions: [
                {
                    statement: "De qual classe uma exceção própria deve herdar?",
                    difficulty: "medio",
                    options: [
                        { text: "StandardError", isCorrect: true },
                        { text: "Exception, a raiz de toda a hierarquia", isCorrect: false },
                        { text: "RuntimeError, que é a exceção mais comum", isCorrect: false },
                        { text: "Error, definida no núcleo da linguagem", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece se a sua exceção herdar de `Exception`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ela escapa de um rescue comum", isCorrect: true },
                        {
                            text: "Ela deixa de aceitar uma mensagem no construtor",
                            isCorrect: false,
                        },
                        { text: "Ela passa a ser capturada duas vezes seguidas", isCorrect: false },
                        { text: "Ela não pode mais ser levantada com o raise", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `retry` faz dentro de um rescue?",
                    difficulty: "medio",
                    options: [
                        { text: "Executa o bloco begin de novo", isCorrect: true },
                        { text: "Levanta a mesma exceção mais uma vez seguida", isCorrect: false },
                        {
                            text: "Pula para o bloco ensure sem executar mais nada",
                            isCorrect: false,
                        },
                        { text: "Devolve o controle para o método que chamou", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o risco de usar `retry` sem contador?",
                    difficulty: "medio",
                    options: [
                        { text: "Um laço infinito de tentativas", isCorrect: true },
                        {
                            text: "A exceção original acaba se perdendo no caminho",
                            isCorrect: false,
                        },
                        { text: "O bloco ensure deixa de ser executado no fim", isCorrect: false },
                        { text: "As tentativas passam a rodar em paralelo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `cause` de uma exceção guarda?",
                    difficulty: "medio",
                    options: [
                        { text: "A exceção que estava sendo tratada", isCorrect: true },
                        { text: "A mensagem original antes de ser reescrita", isCorrect: false },
                        { text: "O arquivo e a linha em que ela foi levantada", isCorrect: false },
                        { text: "A lista de todos os rescue que já tentaram", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Testes com Minitest",
            blocks: [
                {
                    type: "text",
                    value: "# O teste que vem junto\n\nO **Minitest** faz parte da biblioteca padrão do Ruby: não precisa instalar nada. Um teste é uma classe que herda de `Minitest::Test`, com métodos começando por `test_`.",
                },
                {
                    type: "code",
                    value: 'require "minitest/autorun"\nrequire_relative "../lib/calculadora"\n\nclass TestCalculadora < Minitest::Test\n  def setup\n    @calc = Calculadora.new\n  end\n\n  def test_soma_dois_numeros\n    assert_equal 4, @calc.somar(2, 2)\n  end\n\n  def test_divisao_por_zero_levanta_erro\n    assert_raises(ArgumentError) { @calc.dividir(1, 0) }\n  end\n\n  def test_lista_comeca_vazia\n    assert_empty @calc.historico\n  end\nend',
                },
                {
                    type: "table",
                    value: '[["Asserção", "Verifica"], ["assert_equal a, b", "que a é igual a b"], ["assert / refute", "verdadeiro ou falso"], ["assert_nil", "que o valor é nil"], ["assert_raises", "que a exceção foi levantada"], ["assert_includes", "que a coleção tem o item"]]',
                },
                {
                    type: "text",
                    value: "## setup e teardown\n\n`setup` roda antes de **cada** teste e `teardown` depois. Cada teste começa do zero, o que evita a dependência de ordem, um dos problemas mais chatos de suíte de testes.",
                },
                {
                    type: "code",
                    value: "ruby test/test_calculadora.rb\n\n# Ou pelo rake, com todos de uma vez\nrake test",
                },
            ],
            questions: [
                {
                    statement: "Onde o Minitest está disponível?",
                    difficulty: "facil",
                    options: [
                        { text: "Na biblioteca padrão do Ruby", isCorrect: true },
                        { text: "Em uma gem que precisa ser instalada à parte", isCorrect: false },
                        { text: "Apenas dentro de projetos criados com o Rails", isCorrect: false },
                        {
                            text: "No console interativo irb, como comando embutido",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Como o Minitest identifica um método de teste?",
                    difficulty: "medio",
                    options: [
                        { text: "Pelo prefixo `test_` no nome", isCorrect: true },
                        { text: "Por uma anotação escrita acima do método", isCorrect: false },
                        { text: "Pela presença de qualquer asserção no corpo", isCorrect: false },
                        { text: "Pela ordem em que ele aparece na classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o `setup` é executado?",
                    difficulty: "medio",
                    options: [
                        { text: "Antes de cada teste da classe", isCorrect: true },
                        { text: "Uma vez só, antes de todos os testes", isCorrect: false },
                        { text: "Depois de cada teste ter terminado", isCorrect: false },
                        { text: "Apenas quando algum teste falha na execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual asserção verifica que uma exceção foi levantada?",
                    difficulty: "medio",
                    options: [
                        { text: "assert_raises", isCorrect: true },
                        { text: "assert_error, informando a classe esperada", isCorrect: false },
                        { text: "assert_throws, com o bloco entre chaves", isCorrect: false },
                        { text: "assert_exception, seguido do tipo do erro", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que cada teste começa do zero?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para nenhum depender da ordem de execução", isCorrect: true },
                        { text: "Para os testes rodarem bem mais rápido", isCorrect: false },
                        { text: "Para economizar memória durante a suíte", isCorrect: false },
                        {
                            text: "Porque o Ruby recarrega as classes a cada teste",
                            isCorrect: false,
                        },
                    ],
                },
            ],
        },
        {
            titulo: "RSpec e o estilo de especificação",
            blocks: [
                {
                    type: "text",
                    value: "# Descrevendo comportamento\n\nO **RSpec** é a alternativa mais usada ao Minitest. Ele troca asserções por uma linguagem que descreve comportamento, e a saída da suíte vira quase uma documentação do sistema.",
                },
                {
                    type: "code",
                    value: 'require "rails_helper"\n\nRSpec.describe Calculadora do\n  subject(:calc) { described_class.new }\n\n  describe "#somar" do\n    it "soma dois números positivos" do\n      expect(calc.somar(2, 2)).to eq(4)\n    end\n\n    it "aceita números negativos" do\n      expect(calc.somar(-1, -1)).to eq(-2)\n    end\n  end\n\n  describe "#dividir" do\n    context "quando o divisor é zero" do\n      it "levanta ArgumentError" do\n        expect { calc.dividir(1, 0) }.to raise_error(ArgumentError)\n      end\n    end\n  end\nend',
                },
                {
                    type: "table",
                    value: '[["Construção", "Para que serve"], ["describe", "agrupa por classe ou método"], ["context", "agrupa por situação"], ["it", "um comportamento esperado"], ["let", "valor criado sob demanda"], ["before", "preparação antes de cada it"]]',
                },
                {
                    type: "text",
                    value: "## let é preguiçoso\n\n`let` só cria o valor quando ele é usado pela primeira vez no exemplo, e depois guarda. `let!` força a criação antes de cada exemplo. Confundir os dois gera testes que passam sozinhos e falham na suíte.",
                },
                {
                    type: "code",
                    value: 'let(:usuario) { User.create(nome: "Ana") }   # criado quando usado\nlet!(:admin) { User.create(admin: true) }   # criado sempre',
                },
            ],
            questions: [
                {
                    statement: "O que o RSpec troca em relação ao Minitest?",
                    difficulty: "medio",
                    options: [
                        { text: "Asserções por descrição de comportamento", isCorrect: true },
                        { text: "A linguagem Ruby por uma linguagem própria", isCorrect: false },
                        { text: "Os testes unitários por testes de integração", isCorrect: false },
                        { text: "A execução em série pela execução paralela", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual a diferença entre `describe` e `context`?",
                    difficulty: "medio",
                    options: [
                        {
                            text: "Context agrupa por situação, describe por unidade",
                            isCorrect: true,
                        },
                        {
                            text: "Context roda os exemplos em ordem sempre aleatória",
                            isCorrect: false,
                        },
                        { text: "Describe aceita apenas o nome de uma classe", isCorrect: false },
                        { text: "Não existe diferença técnica entre os dois", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o `let` cria o valor?",
                    difficulty: "dificil",
                    options: [
                        { text: "Na primeira vez em que é usado", isCorrect: true },
                        { text: "Antes de cada exemplo, sempre que declarado", isCorrect: false },
                        { text: "Uma vez só, antes de todos os exemplos", isCorrect: false },
                        { text: "Depois que o exemplo termina de executar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `let!` faz de diferente?",
                    difficulty: "medio",
                    options: [
                        { text: "Cria o valor antes de cada exemplo", isCorrect: true },
                        { text: "Cria o valor apenas uma vez para toda a suíte", isCorrect: false },
                        { text: "Impede que o valor seja alterado no exemplo", isCorrect: false },
                        { text: "Levanta erro quando o valor não é usado", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se testa que um bloco levanta exceção no RSpec?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `expect { }.to raise_error`", isCorrect: true },
                        { text: "Com `assert_raises` seguido da classe do erro", isCorrect: false },
                        { text: "Com `expect().to be_error` no valor devolvido", isCorrect: false },
                        { text: "Com `it_raises` no lugar do it comum", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "RuboCop, debug e boas práticas",
            blocks: [
                {
                    type: "text",
                    value: "# O guia de estilo automatizado\n\nO **RuboCop** verifica estilo e problemas comuns segundo o guia de estilo da comunidade. Ele corrige boa parte sozinho, o que encerra discussão de formatação em revisão de código.",
                },
                {
                    type: "code",
                    value: "bundle add rubocop --group development\n\nrubocop                # aponta os problemas\nrubocop -a             # corrige o que é seguro\nrubocop -A             # corrige até o que é arriscado\nrubocop --regenerate-todo   # congela o que já existe",
                },
                {
                    type: "text",
                    value: "O `.rubocop_todo.yml` é o que torna a adoção viável em projeto grande: ele registra as violações atuais como aceitas, e a partir dali só o código novo precisa passar.",
                },
                {
                    type: "text",
                    value: "## O debugger\n\nA gem `debug` faz parte da distribuição padrão desde o Ruby 3.1. Coloque `binding.break` onde quiser parar e inspecione o estado, o que é muito melhor que espalhar `puts` pelo código.",
                },
                {
                    type: "code",
                    value: 'require "debug"\n\ndef calcular(pedido)\n  binding.break     # para aqui e abre o console\n  pedido.itens.sum(&:total)\nend\n\n# No console: n avança, s entra no método, c continua, p imprime',
                },
                {
                    type: "table",
                    value: '[["Ferramenta", "Para que serve"], ["RuboCop", "estilo e problemas comuns"], ["debug", "parar e inspecionar o estado"], ["Bundler", "resolver as dependências"], ["Rake", "automatizar tarefas do projeto"], ["YARD", "gerar documentação do código"]]',
                },
            ],
            questions: [
                {
                    statement: "O que o RuboCop verifica?",
                    difficulty: "facil",
                    options: [
                        { text: "Estilo e problemas comuns do código", isCorrect: true },
                        { text: "Se os testes do projeto estão todos passando", isCorrect: false },
                        { text: "Se as gems declaradas estão desatualizadas", isCorrect: false },
                        { text: "Se o código roda na versão instalada do Ruby", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o `.rubocop_todo.yml`?",
                    difficulty: "dificil",
                    options: [
                        { text: "Registrar as violações atuais como aceitas", isCorrect: true },
                        {
                            text: "Listar as regras que ainda serão implementadas",
                            isCorrect: false,
                        },
                        { text: "Guardar as correções que o RuboCop já aplicou", isCorrect: false },
                        { text: "Definir quais arquivos serão sempre ignorados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `binding.break` faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Para a execução e abre o console", isCorrect: true },
                        { text: "Encerra o programa naquele ponto do código", isCorrect: false },
                        { text: "Imprime o valor de todas as variáveis locais", isCorrect: false },
                        {
                            text: "Marca um ponto para o RuboCop verificar depois",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual a diferença entre `rubocop -a` e `rubocop -A`?",
                    difficulty: "medio",
                    options: [
                        { text: "O maiúsculo corrige também o arriscado", isCorrect: true },
                        {
                            text: "O maiúsculo corrige todos os arquivos do projeto",
                            isCorrect: false,
                        },
                        { text: "O minúsculo apenas aponta, sem corrigir nada", isCorrect: false },
                        {
                            text: "O maiúsculo grava as correções no arquivo todo",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "A gem `debug` precisa ser instalada à parte?",
                    difficulty: "medio",
                    options: [
                        { text: "Não, ela vem na distribuição padrão", isCorrect: true },
                        { text: "Sim, ela precisa ser adicionada ao Gemfile", isCorrect: false },
                        { text: "Sim, mas apenas em projetos que usam o Rails", isCorrect: false },
                        { text: "Sim, ela é distribuída junto com o RuboCop", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - O Ruby moderno",
    aulas: [
        {
            titulo: "O que mudou no Ruby 4.0",
            blocks: [
                {
                    type: "text",
                    value: "# Um salto de versão maior\n\nO **Ruby 4.0** saiu em 25 de dezembro de 2025, mantendo a tradição de lançar no Natal. Apesar do número, não é uma quebra como foi a passagem do 1.8 para o 1.9: a maior parte do código de Ruby 3 continua rodando.\n\nO que ele traz de mais visível é um compilador novo, mudanças no core e uma reformulação de Ractor.",
                },
                {
                    type: "table",
                    value: '[["Novidade", "O que é"], ["ZJIT", "compilador novo escrito em Rust"], ["Set no core", "sem precisar de require"], ["Pathname no core", "deixou de ser gem padrão"], ["Ruby::Box", "isolamento experimental"], ["Ractor::Port", "nova comunicação entre Ractors"]]',
                },
                {
                    type: "text",
                    value: "## Mudanças de sintaxe\n\nDuas mudanças pequenas e úteis:\n\nOperadores lógicos no **começo da linha** agora continuam a linha anterior, do mesmo jeito que o ponto já fazia. Isso deixa condições longas legíveis sem barra invertida.",
                },
                {
                    type: "code",
                    value: "# Ruby 4.0: o operador no começo continua a linha de cima\nif usuario.ativo?\n   && usuario.confirmado?\n   && !usuario.bloqueado?\n  liberar\nend\n\n# O splat de nil não chama mais nil.to_a\ndef metodo(*args) = args\nmetodo(*nil)   # => []",
                },
                {
                    type: "text",
                    value: "## O que saiu\n\n`SortedSet` foi removido do core e virou gem separada. A biblioteca `cgi` deixou as gems padrão, restando apenas `cgi/escape`. Em Ractor, os métodos `yield`, `take`, `close_incoming` e `close_outgoing` foram removidos.",
                },
            ],
            questions: [
                {
                    statement: "Quando o Ruby 4.0 foi lançado?",
                    difficulty: "facil",
                    options: [
                        { text: "Em dezembro de 2025", isCorrect: true },
                        { text: "Em janeiro de 2026, no começo do ano", isCorrect: false },
                        { text: "Em julho de 2026, junto com o patch 4.0.6", isCorrect: false },
                        { text: "Em dezembro de 2024, um ano antes disso", isCorrect: false },
                    ],
                },
                {
                    statement: "O Ruby 4.0 quebra a compatibilidade com o Ruby 3?",
                    difficulty: "medio",
                    options: [
                        { text: "Não na maior parte do código", isCorrect: true },
                        { text: "Sim, exige a reescrita de quase todo o código", isCorrect: false },
                        { text: "Sim, a sintaxe de blocos mudou por completo", isCorrect: false },
                        { text: "Sim, todas as gems precisam ser reescritas", isCorrect: false },
                    ],
                },
                {
                    statement: "O que mudou com operadores no começo da linha?",
                    difficulty: "medio",
                    options: [
                        { text: "Eles continuam a linha anterior", isCorrect: true },
                        { text: "Eles passaram a exigir parênteses em volta", isCorrect: false },
                        { text: "Eles deixaram de funcionar fora de condições", isCorrect: false },
                        { text: "Eles agora precisam de barra invertida no fim", isCorrect: false },
                    ],
                },
                {
                    statement: "O que aconteceu com o `SortedSet` no Ruby 4.0?",
                    difficulty: "medio",
                    options: [
                        { text: "Foi removido e virou gem à parte", isCorrect: true },
                        { text: "Foi promovido a classe do core da linguagem", isCorrect: false },
                        { text: "Foi renomeado para OrderedSet dentro do core", isCorrect: false },
                        { text: "Passou a ser o comportamento padrão do Set", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual classe deixou de ser gem padrão e virou core?",
                    difficulty: "medio",
                    options: [
                        { text: "Pathname", isCorrect: true },
                        { text: "CGI, que perdeu apenas parte dos módulos", isCorrect: false },
                        { text: "OpenStruct, junto com o Set nesta versão", isCorrect: false },
                        { text: "JSON, que ganhou desempenho no core novo", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "YJIT e ZJIT",
            blocks: [
                {
                    type: "text",
                    value: "# Compilando em tempo de execução\n\nRuby interpreta o código, e um **JIT** compila os trechos mais executados para código de máquina durante a execução. O ganho aparece em aplicação de vida longa, como um servidor web, e não em script curto.\n\nO Ruby 4.0 traz **dois** JITs.",
                },
                {
                    type: "table",
                    value: '[["", "YJIT", "ZJIT"], ["Desde", "Ruby 3.1", "Ruby 4.0"], ["Escrito em", "Rust", "Rust"], ["Maturidade", "usado em produção", "experimental"], ["Velocidade", "a mais rápida hoje", "acima do interpretador"]]',
                },
                {
                    type: "code",
                    value: "# Ligando pela linha de comando\nruby --yjit app.rb\nruby --zjit app.rb\n\n# Ou por variável de ambiente\nRUBY_YJIT_ENABLE=1 ruby app.rb\n\n# Em código, com as opções novas do 4.0\nRubyVM::YJIT.enable(mem_size: 128, call_threshold: 30)",
                },
                {
                    type: "text",
                    value: "## Qual usar\n\nO **YJIT** é a escolha para produção: está maduro e é usado no Shopify e no GitHub em escala. O **ZJIT** é o projeto novo, com uma arquitetura diferente, e a própria equipe recomenda experimentar sem colocar em produção ainda.\n\nJIT custa memória: ele guarda o código compilado. Em container com pouca RAM, meça antes de ligar.",
                },
            ],
            questions: [
                {
                    statement: "O que um JIT faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Compila trechos quentes durante a execução", isCorrect: true },
                        { text: "Compila o programa inteiro antes de executar", isCorrect: false },
                        {
                            text: "Interpreta o código linha a linha, mais rápido",
                            isCorrect: false,
                        },
                        { text: "Traduz o Ruby para outra linguagem de script", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual JIT é recomendado para produção hoje?",
                    difficulty: "medio",
                    options: [
                        { text: "O YJIT", isCorrect: true },
                        { text: "O ZJIT, por ser o mais recente dos dois", isCorrect: false },
                        { text: "Os dois juntos, ligados ao mesmo tempo", isCorrect: false },
                        { text: "Nenhum, os dois seguem experimentais", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que tipo de programa o JIT compensa mais?",
                    difficulty: "dificil",
                    options: [
                        { text: "Aplicação de vida longa, como um servidor", isCorrect: true },
                        { text: "Script curto de automação de tarefas simples", isCorrect: false },
                        { text: "Programa que roda uma vez e encerra rápido", isCorrect: false },
                        { text: "Qualquer programa, o ganho é sempre o mesmo", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que linguagem o ZJIT foi escrito?",
                    difficulty: "facil",
                    options: [
                        { text: "Rust", isCorrect: true },
                        { text: "C, como o interpretador principal do Ruby", isCorrect: false },
                        { text: "Ruby, usando metaprogramação avançada", isCorrect: false },
                        { text: "Go, pela facilidade com concorrência", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o custo de ligar um JIT?",
                    difficulty: "medio",
                    options: [
                        { text: "Mais consumo de memória", isCorrect: true },
                        { text: "Uma inicialização bem mais lenta do programa", isCorrect: false },
                        { text: "A perda de compatibilidade com gems antigas", isCorrect: false },
                        { text: "A impossibilidade de usar o debugger padrão", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Concorrência: threads, Fiber e Ractor",
            blocks: [
                {
                    type: "text",
                    value: "# O GVL e o que ele impede\n\nO Ruby tem um **Global VM Lock**: uma trava que permite apenas uma thread executando código Ruby por vez em um processo. O efeito é decisivo:\n\n- Para tarefa que **espera** rede ou disco, threads ajudam muito, porque a trava é liberada durante a espera\n- Para tarefa que **calcula**, threads não dão ganho algum",
                },
                {
                    type: "code",
                    value: 'urls = ["a.com", "b.com", "c.com"]\n\n# Threads ajudam: o tempo é de espera de rede\nresultados = urls.map do |url|\n  Thread.new { buscar(url) }\nend.map(&:value)',
                },
                {
                    type: "text",
                    value: "## Fiber\n\nA `Fiber` é uma corrotina: ela pausa e retoma sob controle explícito, sem paralelismo. É a base do `async` em Ruby e de servidores que atendem muitas conexões com pouca memória.",
                },
                {
                    type: "text",
                    value: "## Ractor\n\nO **Ractor** é a resposta ao GVL: cada um tem sua própria trava, então dois Ractors executam código Ruby **de verdade ao mesmo tempo**. O preço é o isolamento: eles não compartilham objetos mutáveis, e a comunicação é por troca de mensagens.\n\nO Ruby 4.0 reformulou essa comunicação. `Ractor.yield` e `Ractor#take` foram removidos, e no lugar entrou o `Ractor::Port`, junto com `Ractor#join` e `Ractor#value`.",
                },
                {
                    type: "code",
                    value: '# Ruby 4.0\nr = Ractor.new do\n  (1..1_000_000).sum\nend\n\nr.value    # espera e devolve o resultado\n\nporta = Ractor::Port.new\nRactor.new(porta) { |p| p.send("pronto") }\nputs porta.receive',
                },
            ],
            questions: [
                {
                    statement: "O que o GVL impede?",
                    difficulty: "medio",
                    options: [
                        { text: "Duas threads executando Ruby ao mesmo tempo", isCorrect: true },
                        { text: "A criação de mais de uma thread por processo", isCorrect: false },
                        {
                            text: "O uso de threads em operações de entrada e saída",
                            isCorrect: false,
                        },
                        { text: "A comunicação entre threads do mesmo programa", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que caso threads ajudam de verdade em Ruby?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando a tarefa espera rede ou disco", isCorrect: true },
                        { text: "Quando a tarefa faz cálculo pesado de números", isCorrect: false },
                        {
                            text: "Quando o programa roda em uma máquina com um núcleo",
                            isCorrect: false,
                        },
                        {
                            text: "Quando as tarefas precisam compartilhar objetos",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "O que torna o Ractor diferente da thread?",
                    difficulty: "dificil",
                    options: [
                        { text: "Cada um tem a própria trava e roda em paralelo", isCorrect: true },
                        { text: "Ele executa bem mais rápido a mesma tarefa", isCorrect: false },
                        {
                            text: "Ele compartilha todos os objetos com os outros",
                            isCorrect: false,
                        },
                        {
                            text: "Ele roda em outro processo do sistema operacional",
                            isCorrect: false,
                        },
                    ],
                },
                {
                    statement: "Qual o preço do paralelismo real do Ractor?",
                    difficulty: "medio",
                    options: [
                        { text: "O isolamento entre eles", isCorrect: true },
                        { text: "O consumo bem maior de memória por Ractor", isCorrect: false },
                        { text: "A perda de compatibilidade com o debugger", isCorrect: false },
                        { text: "A necessidade de ligar um JIT antes de usar", isCorrect: false },
                    ],
                },
                {
                    statement: "O que substituiu `Ractor#take` no Ruby 4.0?",
                    difficulty: "dificil",
                    options: [
                        { text: "O Ractor::Port e o método value", isCorrect: true },
                        { text: "O método receive, que já existia antes", isCorrect: false },
                        { text: "O bloco passado na criação do Ractor", isCorrect: false },
                        { text: "Nada, o take continua sendo o recomendado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Ruby::Box, o experimento de namespaces",
            blocks: [
                {
                    type: "text",
                    value: "# O problema que ele ataca\n\nRuby permite reabrir qualquer classe e mudar seu comportamento, o famoso **monkey patch**. Isso é poderoso e perigoso: duas gems podem alterar a mesma classe de formas incompatíveis, e não há como isolar uma da outra.\n\nOutro caso: usar duas versões da mesma gem no mesmo processo é simplesmente impossível hoje.",
                },
                {
                    type: "code",
                    value: '# Monkey patch: vale para o programa inteiro\nclass String\n  def gritar\n    upcase + "!"\n  end\nend\n\n"oi".gritar   # => "OI!"',
                },
                {
                    type: "text",
                    value: "## O que o Ruby::Box propõe\n\nO **Ruby::Box**, experimental no Ruby 4.0, cria um espaço isolado onde definições, monkey patches, variáveis globais e de classe ficam contidos. O que acontece dentro da caixa não vaza para fora.\n\nEle é experimental de verdade: a API pode mudar e não deve ir para produção. Vale conhecer porque, se amadurecer, muda como bibliotecas convivem em Ruby.",
                },
                {
                    type: "quote",
                    value: "Ruby::Box isola definições, monkey patches e variáveis globais. É experimental no 4.0 e a API ainda pode mudar.",
                },
                {
                    type: "text",
                    value: "## Refinements, a alternativa que já existe\n\nEnquanto isso, quem precisa de monkey patch com escopo limitado usa **refinements**: a alteração vale só nos arquivos que a ativarem com `using`.",
                },
                {
                    type: "code",
                    value: 'module Gritante\n  refine String do\n    def gritar\n      upcase + "!"\n    end\n  end\nend\n\n# Em outro arquivo\nusing Gritante\n"oi".gritar    # funciona aqui\n\n# Em um arquivo sem o using, o método não existe',
                },
            ],
            questions: [
                {
                    statement: "O que é um monkey patch?",
                    difficulty: "medio",
                    options: [
                        { text: "Reabrir uma classe e alterar seu comportamento", isCorrect: true },
                        {
                            text: "Criar uma classe nova que herda de outra existente",
                            isCorrect: false,
                        },
                        { text: "Corrigir um erro encontrado dentro de uma gem", isCorrect: false },
                        { text: "Incluir um módulo dentro de uma classe pronta", isCorrect: false },
                    ],
                },
                {
                    statement: "Que problema o Ruby::Box ataca?",
                    difficulty: "medio",
                    options: [
                        { text: "O alcance global de alterações e patches", isCorrect: true },
                        { text: "A lentidão do interpretador ao carregar gems", isCorrect: false },
                        { text: "A falta de tipagem estática na linguagem", isCorrect: false },
                        { text: "O consumo de memória de aplicações grandes", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o status do Ruby::Box no Ruby 4.0?",
                    difficulty: "medio",
                    options: [
                        { text: "Experimental, com API sujeita a mudança", isCorrect: true },
                        { text: "Estável e recomendado para uso em produção", isCorrect: false },
                        { text: "Obsoleto, substituído pelos refinements", isCorrect: false },
                        { text: "Disponível apenas com uma gem instalada", isCorrect: false },
                    ],
                },
                {
                    statement: "O que os refinements permitem?",
                    difficulty: "dificil",
                    options: [
                        { text: "Limitar um patch aos arquivos que o ativam", isCorrect: true },
                        {
                            text: "Alterar uma classe em todo o programa de uma vez",
                            isCorrect: false,
                        },
                        { text: "Criar classes novas dentro de outro namespace", isCorrect: false },
                        { text: "Executar código isolado em outro processo", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se ativa um refinement em um arquivo?",
                    difficulty: "medio",
                    options: [
                        { text: "Com a palavra `using`", isCorrect: true },
                        { text: "Com a palavra include, como em um módulo", isCorrect: false },
                        { text: "Com a palavra require no topo do arquivo", isCorrect: false },
                        { text: "Com a palavra refine dentro da classe", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Projeto final e para onde ir",
            blocks: [
                {
                    type: "text",
                    value: "# Juntando tudo\n\nPara fechar a trilha, escreva um **gerenciador de tarefas de linha de comando**. Ele exercita cada módulo:\n\n1. Uma classe `Tarefa` com `attr_reader` e validação no `initialize`\n2. Um módulo `Persistivel` incluído por quem sabe salvar em JSON\n3. Uma classe `ListaDeTarefas` que inclui `Enumerable` implementando `each`\n4. Filtros e relatórios com `select`, `group_by` e `sum`\n5. Exceções próprias herdando de `StandardError`\n6. Testes com Minitest cobrindo o caminho feliz e os erros\n7. RuboCop passando sem violação\n\nCada passo corresponde a um módulo desta trilha.",
                },
                {
                    type: "code",
                    value: 'class Tarefa\n  include Comparable\n  attr_reader :titulo, :prioridade, :feita\n\n  PRIORIDADES = %i[baixa media alta].freeze\n\n  def initialize(titulo:, prioridade: :media)\n    raise ArgumentError, "título vazio" if titulo.to_s.strip.empty?\n    raise ArgumentError, "prioridade inválida" unless PRIORIDADES.include?(prioridade)\n\n    @titulo = titulo\n    @prioridade = prioridade\n    @feita = false\n  end\n\n  def concluir! = @feita = true\n\n  def <=>(outra)\n    PRIORIDADES.index(outra.prioridade) <=> PRIORIDADES.index(prioridade)\n  end\nend',
                },
                {
                    type: "text",
                    value: "## Para onde ir depois\n\nO caminho natural é o **Ruby on Rails**, que é onde a maior parte do Ruby profissional acontece. A trilha de Rails desta plataforma continua exatamente daqui.\n\nFora da web, vale olhar **Sinatra** para APIs pequenas, **Jekyll** para sites estáticos e a escrita de gems próprias, que é como se contribui com a comunidade.",
                },
            ],
            questions: [
                {
                    statement: "O que uma classe precisa para ser comparável com `<`?",
                    difficulty: "medio",
                    options: [
                        { text: "Incluir Comparable e definir `<=>`", isCorrect: true },
                        { text: "Definir os métodos de maior e menor na classe", isCorrect: false },
                        { text: "Herdar de uma classe base que já compare", isCorrect: false },
                        { text: "Incluir Enumerable e implementar o each", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o `freeze` em uma constante de array?",
                    difficulty: "dificil",
                    options: [
                        { text: "Impedir que o conteúdo seja alterado", isCorrect: true },
                        { text: "Guardar o array em cache para acesso rápido", isCorrect: false },
                        { text: "Converter o array em um Set sem repetição", isCorrect: false },
                        { text: "Tornar a constante visível em outros arquivos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que `def concluir! = @feita = true` demonstra?",
                    difficulty: "medio",
                    options: [
                        { text: "A definição de método em uma linha", isCorrect: true },
                        { text: "A criação de um atributo com valor padrão", isCorrect: false },
                        { text: "A definição de um método privado da classe", isCorrect: false },
                        { text: "A atribuição de um bloco a um método", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual o caminho natural depois desta trilha?",
                    difficulty: "facil",
                    options: [
                        { text: "Ruby on Rails", isCorrect: true },
                        {
                            text: "Sinatra, por ser bem mais completo que o Rails",
                            isCorrect: false,
                        },
                        { text: "Jekyll, que é o framework web mais usado", isCorrect: false },
                        { text: "Escrever gems, antes de qualquer framework", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que validar no `initialize`?",
                    difficulty: "medio",
                    options: [
                        { text: "Para que todo objeto criado esteja válido", isCorrect: true },
                        { text: "Para que o objeto ocupe menos memória depois", isCorrect: false },
                        { text: "Porque o Ruby exige validação no construtor", isCorrect: false },
                        { text: "Para permitir que a classe seja comparável", isCorrect: false },
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
