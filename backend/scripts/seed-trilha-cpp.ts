// Seed da trilha C++ (do básico ao avançado). Conteúdo autoral.
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-cpp.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "C++";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A linguagem C++ do zero ao avançado: sintaxe e tipos, controle de fluxo, funções e passagem por referência, ponteiros e gerenciamento de memória, classes e RAII, herança e funções virtuais, a STL com containers e templates, e o C++ moderno com smart pointers e lambdas. A linguagem de jogos, sistemas de alto desempenho e software de baixo nível.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Primeiros passos com C++",
    aulas: [
        {
            titulo: "O que é C++ e a compilação",
            blocks: [
                {
                    type: "text",
                    value: "# O que é C++\n\nC++ é uma linguagem de programação criada por Bjarne Stroustrup nos anos 1980, como uma extensão da linguagem C com suporte a orientação a objetos. Décadas depois, ela continua entre as mais usadas do mundo onde o **desempenho** é crítico: motores de jogos, navegadores, sistemas operacionais, software de finanças de alta frequência e sistemas embarcados.\n\nC++ é **compilada**, **estaticamente tipada** e dá ao programador controle direto sobre a memória. Não há máquina virtual nem coletor de lixo automático entre o seu código e o hardware, o que permite código muito rápido, mas coloca a responsabilidade da memória nas suas mãos.",
                },
                {
                    type: "text",
                    value: "## Da fonte ao executável\n\nUm programa C++ passa por um processo de build antes de rodar. De forma simplificada:\n\n1. O **compilador** (como o g++ ou o clang++) traduz o seu código-fonte em código de máquina.\n2. O **linker** junta o resultado com as bibliotecas usadas, gerando um executável.\n\nCom o g++, um comando faz as duas etapas:\n\n```\ng++ ola.cpp -o ola   # compila e gera o executável ola\n./ola                # executa o programa\n```",
                },
                {
                    type: "quote",
                    value: "C++ é compilada e tipada estaticamente, sem máquina virtual nem coletor de lixo. Isso traz muito desempenho e o controle (e a responsabilidade) da memória.",
                },
            ],
            questions: [
                {
                    statement: "Como um programa C++ chega a ser executado?",
                    difficulty: "facil",
                    options: [
                        { text: "É compilado para código de máquina, gerando um executável", isCorrect: true },
                        { text: "É interpretado linha a linha em tempo de execução direto", isCorrect: false },
                        { text: "Roda sobre uma máquina virtual, como faz o bytecode", isCorrect: false },
                        { text: "Precisa de um navegador de internet para ser executado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o C++ NÃO tem, diferente de linguagens como Java e Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Um coletor de lixo automático gerenciando a memória", isCorrect: true },
                        { text: "Suporte a funções e variáveis", isCorrect: false },
                        { text: "A capacidade de ser compilado", isCorrect: false },
                        { text: "Verificação de tipos em tempo de compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "Em que tipo de aplicação o C++ é especialmente escolhido?",
                    difficulty: "facil",
                    options: [
                        { text: "Sistemas de desempenho crítico, como jogos e navegadores", isCorrect: true },
                        { text: "Apenas planilhas simples de escritório do dia a dia", isCorrect: false },
                        { text: "Somente páginas estáticas e sem lógica de sites", isCorrect: false },
                        { text: "Exclusivamente pequenos scripts de automação rápidos", isCorrect: false },
                    ],
                },
                {
                    statement: "Historicamente, como o C++ surgiu?",
                    difficulty: "medio",
                    options: [
                        { text: "Como uma extensão da linguagem C com orientação a objetos", isCorrect: true },
                        { text: "Como uma linguagem totalmente nova, sem nenhuma relação com o C", isCorrect: false },
                        { text: "Como uma versão interpretada da linguagem Java", isCorrect: false },
                        { text: "Como um dialeto do Python voltado a jogos", isCorrect: false },
                    ],
                },
                {
                    statement: "No build de um programa C++, o que o linker faz depois da compilação?",
                    difficulty: "dificil",
                    options: [
                        { text: "Traduz o código-fonte em código de máquina", isCorrect: false },
                        { text: "Une o código já compilado às bibliotecas e forma o executável", isCorrect: true },
                        { text: "Roda o executável e mostra a saída na tela", isCorrect: false },
                        { text: "Confere os tipos de todas as variáveis do programa antes da compilação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Seu primeiro programa: hello world",
            blocks: [
                {
                    type: "text",
                    value: "# O primeiro programa\n\nTodo programa C++ começa a executar pela função `main`. O programa abaixo, salvo em um arquivo `ola.cpp`, imprime uma mensagem.",
                },
                {
                    type: "code",
                    value: "#include <iostream>\n\nint main() {\n    std::cout << \"Olá, mundo!\" << std::endl;\n    return 0;\n}",
                },
                {
                    type: "text",
                    value: "## Cada parte do programa\n\n- **#include <iostream>**: uma diretiva de pré-processador que traz a biblioteca de entrada e saída, onde vivem `std::cout` e `std::cin`.\n- **int main()**: a função por onde a execução começa. Ela devolve um `int` ao sistema; `return 0;` indica sucesso.\n- **std::cout << ...**: envia valores para a saída padrão (o console) usando o operador `<<`. `std::endl` pula uma linha.\n\nCada instrução termina com ponto e vírgula `;`, e os blocos são delimitados por chaves `{ }`.",
                },
                {
                    type: "text",
                    value: "## Lendo e imprimindo\n\nPara ler algo digitado pelo usuário, usa-se `std::cin` com o operador `>>`. Você pode encadear várias saídas com `<<`:\n\n```\nint idade;\nstd::cout << \"Digite sua idade: \";\nstd::cin >> idade;\nstd::cout << \"Você tem \" << idade << \" anos\" << std::endl;\n```",
                },
            ],
            questions: [
                {
                    statement: "Por qual função a execução de um programa C++ começa?",
                    difficulty: "facil",
                    options: [
                        { text: "Pela função main", isCorrect: true },
                        { text: "Pela primeira função declarada no arquivo", isCorrect: false },
                        { text: "Pela função cout", isCorrect: false },
                        { text: "Por qualquer função marcada como start", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual operador o std::cout usa para enviar valores ao console?",
                    difficulty: "facil",
                    options: [
                        { text: "<<", isCorrect: true },
                        { text: ">>", isCorrect: false },
                        { text: "->", isCorrect: false },
                        { text: "==", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a linha '#include <iostream>'?",
                    difficulty: "medio",
                    options: [
                        { text: "Trazer a biblioteca de entrada e saída, com cout e cin", isCorrect: true },
                        { text: "Declarar a função principal do programa", isCorrect: false },
                        { text: "Compilar o programa em um executável", isCorrect: false },
                        { text: "Encerrar o programa ao final da execução", isCorrect: false },
                    ],
                },
                {
                    statement: "No programa, o que a linha `return 0;` dentro do main indica?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o programa deve reiniciar do início", isCorrect: false },
                        { text: "Que ocorreu um erro durante a execução", isCorrect: false },
                        { text: "Que a saída ainda será impressa na tela", isCorrect: false },
                        { text: "Que o programa terminou com sucesso", isCorrect: true },
                    ],
                },
                {
                    statement: "Para ler um valor digitado pelo usuário, o que se usa?",
                    difficulty: "medio",
                    options: [
                        { text: "std::cin com o operador >>", isCorrect: true },
                        { text: "std::cout com o operador <<", isCorrect: false },
                        { text: "std::endl com o operador <<", isCorrect: false },
                        { text: "std::read com o operador >>", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Namespaces e a std",
            blocks: [
                {
                    type: "text",
                    value: "# Por que tanto std::\n\nVocê deve ter reparado no `std::` antes de `cout`, `cin` e `endl`. Ele indica que esses nomes vêm do **namespace** `std`, a biblioteca padrão do C++. Namespaces agrupam nomes para evitar colisões: dois códigos podem ter uma função `imprimir` sem conflito, se estiverem em namespaces diferentes.",
                },
                {
                    type: "text",
                    value: "## using namespace std\n\nPara não repetir `std::` o tempo todo, você pode escrever `using namespace std;`. Aí `cout` já basta.\n\n```\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Olá\" << endl;\n    return 0;\n}\n```\n\nEm programas pequenos e de estudo, isso é comum. Em projetos maiores, muita gente prefere escrever `std::` explicitamente, porque trazer todo o namespace pode causar colisões de nomes difíceis de rastrear. Vale conhecer as duas formas.",
                },
                {
                    type: "quote",
                    value: "std:: indica que o nome vem da biblioteca padrão. using namespace std; evita repetir o prefixo, prático em estudos mas evitado em projetos grandes por risco de colisão.",
                },
            ],
            questions: [
                {
                    statement: "O que o prefixo 'std::' indica antes de cout e cin?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o nome vem do namespace std, a biblioteca padrão", isCorrect: true },
                        { text: "Que a variável guardada é sempre do tipo string", isCorrect: false },
                        { text: "Que a função associada é estática na classe", isCorrect: false },
                        { text: "Que o valor é uma constante fixa e imutável", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve um namespace em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Agrupar nomes para evitar colisões entre eles", isCorrect: true },
                        { text: "Acelerar a compilação do programa", isCorrect: false },
                        { text: "Reservar memória para as variáveis", isCorrect: false },
                        { text: "Encerrar a execução da função main", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'using namespace std;' faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Permite usar os nomes da std sem escrever std:: toda vez", isCorrect: true },
                        { text: "Impede o uso de qualquer nome da biblioteca padrão", isCorrect: false },
                        { text: "Cria um novo namespace chamado std", isCorrect: false },
                        { text: "Compila o programa em modo otimizado", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que muita gente evita `using namespace std;` em projetos grandes?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque isso impede o uso do std::cout no código", isCorrect: false },
                        { text: "Porque trazer todo o namespace pode causar colisões de nomes", isCorrect: true },
                        { text: "Porque deixa a compilação do programa muito mais lenta e pesada", isCorrect: false },
                        { text: "Porque apaga os nomes da biblioteca padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Como dois trechos de código podem ter, cada um, uma função `imprimir` sem conflito?",
                    difficulty: "medio",
                    options: [
                        { text: "Se cada uma ficar em um namespace diferente", isCorrect: true },
                        { text: "Se as duas forem marcadas como const", isCorrect: false },
                        { text: "Se ambas estiverem escritas dentro da função main principal", isCorrect: false },
                        { text: "Se nenhuma delas usar a biblioteca std", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_2: Modulo = {
    titulo: "Módulo 2 - Variáveis, tipos e operadores",
    aulas: [
        {
            titulo: "Variáveis e tipos fundamentais",
            blocks: [
                {
                    type: "text",
                    value: "# Declarando variáveis\n\nC++ é estaticamente tipada: você declara o tipo antes do nome. A forma geral é `tipo nome = valor;`.\n\n```\nint idade = 30;\ndouble preco = 19.90;\nbool ativo = true;\nchar inicial = 'A';\n```\n\nO tipo diz que valores a variável guarda e quanto espaço ocupa. Diferente de linguagens com coletor de lixo, você deve ter em mente o custo de memória de cada tipo em código de alto desempenho.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Guarda\", \"Exemplo\"], [\"int\", \"Número inteiro\", \"int n = 10;\"], [\"double\", \"Número com decimais\", \"double x = 2.5;\"], [\"bool\", \"Verdadeiro ou falso\", \"bool ok = true;\"], [\"char\", \"Um caractere\", \"char c = 'Z';\"]]",
                },
                {
                    type: "text",
                    value: "## Texto com std::string\n\nPara texto, o C++ moderno usa o tipo `std::string`, da biblioteca `<string>`. Ele é bem mais seguro e prático do que os arrays de caracteres herdados da linguagem C.\n\n```\n#include <string>\n\nstd::string nome = \"Ana\";\nstd::cout << nome << std::endl;\n```",
                },
                {
                    type: "text",
                    value: "## Cuidado com a variável não inicializada\n\nUm ponto de atenção que distingue o C++ de linguagens com valores padrão automáticos: uma variável de tipo fundamental (como `int`) declarada **sem** valor inicial pode conter lixo, um valor indefinido que estava na memória. Sempre inicialize suas variáveis para evitar bugs difíceis de rastrear.",
                },
                {
                    type: "quote",
                    value: "C++ exige o tipo na declaração. Texto usa std::string. Variáveis de tipos fundamentais sem valor inicial podem conter lixo, então sempre inicialize.",
                },
            ],
            questions: [
                {
                    statement: "Qual tipo o C++ moderno usa para guardar texto de forma segura?",
                    difficulty: "facil",
                    options: [
                        { text: "std::string", isCorrect: true },
                        { text: "text", isCorrect: false },
                        { text: "bool", isCorrect: false },
                        { text: "double", isCorrect: false },
                    ],
                },
                {
                    statement: "O que pode conter uma variável int declarada sem valor inicial em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Lixo, um valor indefinido que estava na memória", isCorrect: true },
                        { text: "Sempre o valor zero, de forma garantida", isCorrect: false },
                        { text: "O valor null, como em outras linguagens", isCorrect: false },
                        { text: "Uma string vazia por padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo é o mais indicado para um número com casas decimais?",
                    difficulty: "facil",
                    options: [
                        { text: "double", isCorrect: true },
                        { text: "int", isCorrect: false },
                        { text: "char", isCorrect: false },
                        { text: "bool", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo é apropriado para guardar um único caractere, como a letra 'Z'?",
                    difficulty: "medio",
                    options: [
                        { text: "char", isCorrect: true },
                        { text: "int", isCorrect: false },
                        { text: "double", isCorrect: false },
                        { text: "bool", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o C++ moderno prefere `std::string` aos arrays de caracteres herdados da linguagem C?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque ocupa sempre menos memória que eles", isCorrect: false },
                        { text: "Porque dispensa incluir qualquer biblioteca", isCorrect: false },
                        { text: "Porque é mais seguro e prático de usar", isCorrect: true },
                        { text: "Porque guarda números além de texto", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "auto, const e conversões",
            blocks: [
                {
                    type: "text",
                    value: "# auto: deixe o compilador inferir\n\nDesde o C++11, a palavra `auto` pede ao compilador que deduza o tipo da variável a partir do valor inicial. O tipo continua estático e fixo; você apenas não precisa escrevê-lo.\n\n```\nauto idade = 30;       // int\nauto preco = 19.90;    // double\nauto nome = std::string(\"Ana\");   // std::string\n```\n\n`auto` é muito útil com tipos longos, como iteradores da STL, que você verá adiante.",
                },
                {
                    type: "text",
                    value: "## const: o que não muda\n\nO qualificador `const` marca um valor que não pode ser alterado depois de inicializado. Tentar mudá-lo é erro de compilação. Usar `const` deixa a intenção clara e ajuda o compilador a otimizar e a pegar erros.\n\n```\nconst double PI = 3.14159;\n// PI = 3.0;  // erro de compilação\n```\n\nO `const` aparece em muitos lugares em C++, inclusive em parâmetros e métodos, e é uma marca de código bem escrito.",
                },
                {
                    type: "text",
                    value: "## Conversões de tipo\n\nC++ converte alguns tipos automaticamente (um `int` vira `double` sem perda), mas conversões que podem perder dados devem ser feitas com cuidado. A forma moderna e explícita é o `static_cast`:\n\n```\ndouble preco = 19.99;\nint inteiro = static_cast<int>(preco);   // 19, trunca a parte decimal\n```",
                },
                {
                    type: "quote",
                    value: "auto infere o tipo a partir do valor, sem deixar de ser estático. const marca o que não muda. Para conversões explícitas, use static_cast<Tipo>(valor).",
                },
            ],
            questions: [
                {
                    statement: "O que a palavra 'auto' faz em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Deduz o tipo da variável a partir do valor inicial", isCorrect: true },
                        { text: "Cria uma variável que pode mudar de tipo depois", isCorrect: false },
                        { text: "Aloca a variável na heap automaticamente", isCorrect: false },
                        { text: "Declara uma variável sem nenhum tipo definido", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o qualificador 'const' garante?",
                    difficulty: "facil",
                    options: [
                        { text: "Que o valor não pode ser alterado após a inicialização", isCorrect: true },
                        { text: "Que o valor muda livremente durante o programa", isCorrect: false },
                        { text: "Que a variável é alocada na heap", isCorrect: false },
                        { text: "Que a variável é global ao programa inteiro", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a forma moderna e explícita de converter um double em int em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "static_cast<int>(valor)", isCorrect: true },
                        { text: "int(valor) apenas, sem mais nada", isCorrect: false },
                        { text: "valor.toInt()", isCorrect: false },
                        { text: "convert(valor, int)", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o resultado de `static_cast<int>(19.99)`?",
                    difficulty: "dificil",
                    options: [
                        { text: "20, pois o valor é arredondado para cima", isCorrect: false },
                        { text: "19.99, pois o valor não muda em nada", isCorrect: false },
                        { text: "19, pois a parte decimal é descartada", isCorrect: true },
                        { text: "Um erro, pois um double não vira int", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece se você tentar alterar uma variável declarada com `const`?",
                    difficulty: "medio",
                    options: [
                        { text: "A alteração é feita normalmente", isCorrect: false },
                        { text: "Ocorre um erro de compilação", isCorrect: true },
                        { text: "O valor volta a zero automaticamente", isCorrect: false },
                        { text: "O programa trava apenas ao ser executado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Operadores",
            blocks: [
                {
                    type: "text",
                    value: "# Operadores em C++\n\nC++ tem os operadores usuais:\n\n- Aritméticos: `+`, `-`, `*`, `/`, `%` (resto).\n- Relacionais: `==`, `!=`, `>`, `<`, `>=`, `<=`, que resultam em bool.\n- Lógicos: `&&` (E), `||` (OU), `!` (NÃO).\n\nAssim como em outras linguagens, a divisão de dois inteiros dá um inteiro: `7 / 2` é `3`. Para obter `3.5`, ao menos um operando precisa ser `double`.",
                },
                {
                    type: "code",
                    value: "int a = 17, b = 5;\nstd::cout << a + b << std::endl;   // 22\nstd::cout << a % b << std::endl;   // 2\nstd::cout << (a >= b) << std::endl; // 1 (true imprime como 1)",
                },
                {
                    type: "text",
                    value: "## Incremento e atalhos\n\nC++ tem `++` e `--` para somar ou subtrair 1, e os atalhos `+=`, `-=`, `*=`, `/=` que combinam operação e atribuição.\n\n```\nint total = 10;\ntotal += 5;   // 15\ntotal++;      // 16\n```\n\nUm detalhe: um valor booleano, ao ser impresso com `cout`, aparece como `1` (true) ou `0` (false), a menos que você peça a formatação por extenso.",
                },
                {
                    type: "quote",
                    value: "A divisão de inteiros descarta a parte decimal: 7 / 2 é 3. Um bool impresso com cout aparece como 1 (true) ou 0 (false).",
                },
            ],
            questions: [
                {
                    statement: "Qual é o resultado de '7 / 2' com dois inteiros em C++?",
                    difficulty: "facil",
                    options: [
                        { text: "3, pois a divisão de inteiros descarta a parte decimal", isCorrect: true },
                        { text: "3.5, pois o C++ mantém a parte decimal", isCorrect: false },
                        { text: "4, pois o resultado é arredondado para cima", isCorrect: false },
                        { text: "Um erro, pois não se dividem inteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador '%' retorna?",
                    difficulty: "facil",
                    options: [
                        { text: "O resto da divisão entre dois números", isCorrect: true },
                        { text: "A porcentagem de um número sobre o outro", isCorrect: false },
                        { text: "O quociente exato da divisão", isCorrect: false },
                        { text: "O maior entre os dois números", isCorrect: false },
                    ],
                },
                {
                    statement: "Como um valor bool true costuma aparecer ao ser impresso com std::cout?",
                    difficulty: "medio",
                    options: [
                        { text: "Como 1", isCorrect: true },
                        { text: "Como a palavra true por extenso", isCorrect: false },
                        { text: "Como um espaço em branco", isCorrect: false },
                        { text: "Como a letra T", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que `7 / 2` resulte em `3.5` em vez de `3`, o que é necessário?",
                    difficulty: "medio",
                    options: [
                        { text: "Que os dois operandos sejam do tipo inteiro (int)", isCorrect: false },
                        { text: "Que se use o operador % no lugar da /", isCorrect: false },
                        { text: "Que o resultado seja guardado em um bool", isCorrect: false },
                        { text: "Que ao menos um dos operandos seja double", isCorrect: true },
                    ],
                },
                {
                    statement: "Depois de `int total = 10; total += 5; total++;`, quanto vale total?",
                    difficulty: "medio",
                    options: [
                        { text: "15", isCorrect: false },
                        { text: "16", isCorrect: true },
                        { text: "11", isCorrect: false },
                        { text: "17", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_3: Modulo = {
    titulo: "Módulo 3 - Controle de fluxo",
    aulas: [
        {
            titulo: "Condicionais: if e switch",
            blocks: [
                {
                    type: "text",
                    value: "# O if\n\nO `if` executa um bloco quando a condição, entre parênteses, é verdadeira. Você encadeia casos com `else if` e cobre o resto com `else`.\n\n```\nint nota = 75;\nif (nota >= 90) {\n    std::cout << \"A\";\n} else if (nota >= 70) {\n    std::cout << \"B\";   // executa\n} else {\n    std::cout << \"C\";\n}\n```\n\nO C++ testa as condições de cima para baixo e executa o primeiro bloco cuja condição for verdadeira.",
                },
                {
                    type: "text",
                    value: "## O switch e o break\n\nO `switch` compara um valor inteiro (ou caractere) com vários casos. Importante: em C++, cada `case` precisa de `break`, senão a execução **cai** para o próximo case (o fall-through). Esquecer o `break` é uma fonte clássica de bugs.\n\n```\nswitch (dia) {\n    case 1:\n        std::cout << \"Domingo\";\n        break;\n    case 3:\n        std::cout << \"Terça\";\n        break;\n    default:\n        std::cout << \"Outro dia\";\n}\n```",
                },
                {
                    type: "quote",
                    value: "O if testa condições de cima para baixo. No switch do C++, cada case precisa de break, senão a execução cai para o próximo case.",
                },
            ],
            questions: [
                {
                    statement: "Em um encadeamento if / else if / else, quantos blocos executam?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o primeiro cuja condição for verdadeira", isCorrect: true },
                        { text: "Todos os blocos, sempre, um após o outro", isCorrect: false },
                        { text: "Sempre o último bloco, o else", isCorrect: false },
                        { text: "Nenhum, pois o else cancela os demais", isCorrect: false },
                    ],
                },
                {
                    statement: "No switch do C++, o que acontece se você esquecer o break em um case?",
                    difficulty: "medio",
                    options: [
                        { text: "A execução cai para o próximo case (fall-through)", isCorrect: true },
                        { text: "O programa para com um erro imediato", isCorrect: false },
                        { text: "O switch inteiro é ignorado", isCorrect: false },
                        { text: "O default roda antes de qualquer case", isCorrect: false },
                    ],
                },
                {
                    statement: "Para o valor nota = 75, com os testes >= 90, >= 70 e else, o que é impresso?",
                    difficulty: "medio",
                    options: [
                        { text: "B, pois 75 falha em >= 90 mas passa em >= 70", isCorrect: true },
                        { text: "A, pois é o primeiro caso do encadeamento", isCorrect: false },
                        { text: "C, pois cai direto no else final", isCorrect: false },
                        { text: "A e B, pois os dois blocos executam", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tipo de valor um `switch` compara com seus casos?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas valores do tipo double", isCorrect: false },
                        { text: "Qualquer texto do tipo std::string", isCorrect: false },
                        { text: "Um valor inteiro ou um caractere", isCorrect: true },
                        { text: "Somente valores do tipo bool", isCorrect: false },
                    ],
                },
                {
                    statement: "No `switch`, para que serve o caso `default`?",
                    difficulty: "medio",
                    options: [
                        { text: "Repetir o primeiro case do switch", isCorrect: false },
                        { text: "Tratar os valores que não caíram em nenhum case", isCorrect: true },
                        { text: "Encerrar o programa imediatamente", isCorrect: false },
                        { text: "Obrigar todos os case a terem um break ao final", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Laços while e do-while",
            blocks: [
                {
                    type: "text",
                    value: "# while\n\nO `while` repete um bloco enquanto a condição for verdadeira. A condição é testada **antes** de cada repetição, então o bloco pode nem rodar.\n\n```\nint contador = 1;\nwhile (contador <= 3) {\n    std::cout << contador << \" \";\n    contador++;\n}\n// imprime: 1 2 3\n```",
                },
                {
                    type: "text",
                    value: "## do-while\n\nO `do-while` testa a condição **depois** de executar o bloco, então o bloco roda ao menos uma vez, mesmo que a condição já comece falsa.\n\n```\nint n = 10;\ndo {\n    std::cout << n;   // imprime 10 uma vez\n    n++;\n} while (n <= 3);\n```",
                },
                {
                    type: "text",
                    value: "## Cuidado com o laço infinito\n\nSe a condição nunca fica falsa, o laço roda para sempre. Garanta que algo dentro do laço avança em direção ao fim, como incrementar um contador. Você pode interromper um laço com `break` e pular para a próxima volta com `continue`.",
                },
                {
                    type: "quote",
                    value: "while testa a condição antes e pode não rodar nenhuma vez; do-while testa depois e roda ao menos uma vez.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre while e do-while?",
                    difficulty: "medio",
                    options: [
                        { text: "O do-while testa a condição depois, então roda ao menos uma vez", isCorrect: true },
                        { text: "O while nunca executa o bloco interno em nenhum caso", isCorrect: false },
                        { text: "O do-while nunca executa o bloco interno do laço", isCorrect: false },
                        { text: "Os dois rodam sempre o mesmo número exato de vezes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que causa um laço while infinito?",
                    difficulty: "facil",
                    options: [
                        { text: "A condição nunca se tornar falsa dentro do laço", isCorrect: true },
                        { text: "Usar um contador do tipo int no laço", isCorrect: false },
                        { text: "Imprimir um valor a cada repetição", isCorrect: false },
                        { text: "Declarar a variável antes do laço", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o comando 'continue' faz dentro de um laço?",
                    difficulty: "medio",
                    options: [
                        { text: "Pula para a próxima repetição do laço", isCorrect: true },
                        { text: "Encerra o laço por completo de imediato", isCorrect: false },
                        { text: "Reinicia o laço desde a primeira volta", isCorrect: false },
                        { text: "Repete a volta atual mais uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas vezes o trecho a seguir imprime algo?\n```cpp\nint n = 10;\ndo {\n    std::cout << n;\n    n++;\n} while (n <= 3);\n```",
                    difficulty: "dificil",
                    options: [
                        { text: "Nenhuma, pois 10 não é menor ou igual a 3", isCorrect: false },
                        { text: "Uma vez, pois o do-while roda antes de testar", isCorrect: true },
                        { text: "Três vezes, para n valendo 1, 2 e 3", isCorrect: false },
                        { text: "Para sempre, pois n apenas aumenta a cada volta", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um laço `while`, quando a condição é testada?",
                    difficulty: "medio",
                    options: [
                        { text: "Depois de executar o bloco interno, a cada repetição feita", isCorrect: false },
                        { text: "Apenas na última volta do laço", isCorrect: false },
                        { text: "Somente quando o laço usa um break", isCorrect: false },
                        { text: "Antes de cada repetição, e o bloco pode nem rodar", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "O for e o range-based for",
            blocks: [
                {
                    type: "text",
                    value: "# O for clássico\n\nO `for` reúne inicialização, condição e passo em uma linha. É o formato preferido quando você sabe quantas vezes vai repetir.\n\n```\nfor (int i = 0; i < 5; i++) {\n    std::cout << i << \" \";   // 0 1 2 3 4\n}\n```\n\nLê-se: comece com `i = 0`; enquanto `i < 5`, execute; ao fim de cada volta, faça `i++`.",
                },
                {
                    type: "text",
                    value: "## O range-based for\n\nDesde o C++11, quando o objetivo é só percorrer os elementos de um container (como um vector) ou de uma string, o **range-based for** é mais limpo. Ele lê como \"para cada elemento em\".\n\n```\n#include <vector>\n\nstd::vector<int> numeros = {10, 20, 30};\nfor (int n : numeros) {\n    std::cout << n << \" \";   // 10 20 30\n}\n```\n\nPara percorrer sem copiar cada elemento (importante com objetos grandes), usa-se referência: `for (const auto& n : numeros)`.",
                },
                {
                    type: "quote",
                    value: "Use o for clássico quando precisar do índice. Use o range-based for (for (x : coleção)) para percorrer todos os elementos de forma limpa.",
                },
            ],
            questions: [
                {
                    statement: "Quantas vezes o laço 'for (int i = 0; i < 5; i++)' executa o bloco?",
                    difficulty: "facil",
                    options: [
                        { text: "5 vezes, para i valendo 0, 1, 2, 3 e 4", isCorrect: true },
                        { text: "6 vezes, para i de 0 até 5", isCorrect: false },
                        { text: "4 vezes, para i de 1 até 4", isCorrect: false },
                        { text: "Infinitas vezes, pois i nunca chega ao fim", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o range-based for é a melhor escolha?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao percorrer todos os elementos de um container ou string", isCorrect: true },
                        { text: "Ao precisar controlar o índice de cada posição", isCorrect: false },
                        { text: "Ao repetir um bloco um número fixo de vezes", isCorrect: false },
                        { text: "Ao percorrer os elementos de trás para frente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que percorrer objetos grandes com 'const auto&' em vez de 'auto' no range-based for?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para percorrer por referência, sem copiar cada elemento", isCorrect: true },
                        { text: "Para copiar cada elemento e ganhar desempenho", isCorrect: false },
                        { text: "Porque auto não funciona em um range-based for", isCorrect: false },
                        { text: "Para converter cada elemento em uma string", isCorrect: false },
                    ],
                },
                {
                    statement: "Quais são as três partes que um `for` clássico reúne no cabeçalho?",
                    difficulty: "medio",
                    options: [
                        { text: "Nome, tipo e valor da variável", isCorrect: false },
                        { text: "Início, meio e fim do bloco", isCorrect: false },
                        { text: "Entrada, processamento e saída de dados", isCorrect: false },
                        { text: "Inicialização, condição e passo", isCorrect: true },
                    ],
                },
                {
                    statement: "Quando o `for` clássico costuma ser a melhor escolha?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando você sabe quantas vezes repetir ou precisa do índice", isCorrect: true },
                        { text: "Quando quer apenas percorrer todos os elementos", isCorrect: false },
                        { text: "Quando o container não tem tamanho definido", isCorrect: false },
                        { text: "Quando você quer percorrer todos os elementos de uma vez só", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Funções",
    aulas: [
        {
            titulo: "Funções e passagem por valor",
            blocks: [
                {
                    type: "text",
                    value: "# Declarando funções\n\nUma função em C++ declara o tipo de retorno, o nome e os parâmetros com seus tipos. Se não devolve nada, o tipo de retorno é `void`.\n\n```\nint somar(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int total = somar(3, 4);   // 7\n}\n```\n\nEm C++, uma função precisa ser declarada antes de ser usada. Por isso, ou você a define acima do `main`, ou declara um **protótipo** (a assinatura sem corpo) no topo do arquivo.",
                },
                {
                    type: "text",
                    value: "## Passagem por valor: uma cópia\n\nPor padrão, C++ passa argumentos **por valor**: a função recebe uma cópia do argumento. Alterar o parâmetro dentro da função não afeta a variável original de quem chamou.\n\n```\nvoid tentarDobrar(int x) {\n    x = x * 2;   // altera só a cópia local\n}\n\nint n = 5;\ntentarDobrar(n);\n// n continua 5\n```\n\nPassar por valor é simples e seguro, mas copiar objetos grandes pode custar caro em desempenho.",
                },
                {
                    type: "quote",
                    value: "Por padrão, C++ passa argumentos por valor: a função recebe uma cópia, então alterar o parâmetro não muda a variável original.",
                },
            ],
            questions: [
                {
                    statement: "Por padrão, como o C++ passa argumentos para uma função?",
                    difficulty: "facil",
                    options: [
                        { text: "Por valor, ou seja, a função recebe uma cópia", isCorrect: true },
                        { text: "Por referência, alterando sempre o original", isCorrect: false },
                        { text: "Por ponteiro, exigindo & na chamada", isCorrect: false },
                        { text: "Sem passar nenhum dado para a função", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao passar 'int n = 5' por valor e a função fazer 'x = x * 2', o que ocorre com n?",
                    difficulty: "medio",
                    options: [
                        { text: "n continua 5, pois a função altera apenas a cópia", isCorrect: true },
                        { text: "n passa a valer 10, pois a função altera o original", isCorrect: false },
                        { text: "n fica indefinido depois da chamada", isCorrect: false },
                        { text: "Ocorre um erro de compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que uma função em C++ precisa ser declarada antes de ser usada?",
                    difficulty: "medio",
                    options: [
                        { text: "O compilador precisa conhecer a assinatura antes da chamada", isCorrect: true },
                        { text: "Porque C++ executa as funções de baixo para cima", isCorrect: false },
                        { text: "Porque funções não podem chamar outras funções", isCorrect: false },
                        { text: "Porque toda função precisa estar no arquivo main", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo de retorno se usa em uma função que não devolve nenhum valor?",
                    difficulty: "medio",
                    options: [
                        { text: "int", isCorrect: false },
                        { text: "null", isCorrect: false },
                        { text: "void", isCorrect: true },
                        { text: "empty", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é um protótipo de função em C++?",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma versão da função que roda logo antes de todas as outras no início", isCorrect: false },
                        { text: "A assinatura da função, sem o corpo, declarada antes do uso", isCorrect: true },
                        { text: "Uma função que chama a si mesma repetidamente", isCorrect: false },
                        { text: "Uma função sem nenhum tipo de retorno", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Passagem por referência",
            blocks: [
                {
                    type: "text",
                    value: "# Referências: um apelido para a variável\n\nUma **referência**, marcada com `&` no tipo do parâmetro, faz a função trabalhar sobre a **própria** variável de quem chamou, não sobre uma cópia. Assim, a função pode alterá-la.\n\n```\nvoid dobrar(int& x) {\n    x = x * 2;   // altera o original\n}\n\nint n = 5;\ndobrar(n);\n// n agora é 10\n```\n\nA referência é um dos recursos centrais do C++ e aparece o tempo todo.",
                },
                {
                    type: "text",
                    value: "## const reference: eficiência sem cópia\n\nE se você quiser evitar a cópia de um objeto grande (por desempenho), mas **não** quer que a função o altere? Use uma **referência const**: `const Tipo&`. A função acessa o objeto real, sem copiá-lo, e o compilador impede qualquer alteração.\n\n```\nvoid imprimir(const std::string& texto) {\n    std::cout << texto;   // não copia, e não pode alterar\n}\n```\n\nEssa é a forma idiomática de passar objetos grandes para funções que só precisam lê-los.",
                },
                {
                    type: "table",
                    value: "[[\"Forma\", \"Copia?\", \"Pode alterar o original?\"], [\"Por valor (int x)\", \"Sim\", \"Não\"], [\"Por referência (int& x)\", \"Não\", \"Sim\"], [\"Por referência const (const T& x)\", \"Não\", \"Não\"]]",
                },
                {
                    type: "quote",
                    value: "Uma referência (int&) deixa a função alterar o original sem copiar. Uma referência const (const T&) passa objetos grandes sem copiar e sem permitir alteração.",
                },
            ],
            questions: [
                {
                    statement: "O que uma passagem por referência (int& x) permite?",
                    difficulty: "medio",
                    options: [
                        { text: "Que a função altere a variável original de quem chamou", isCorrect: true },
                        { text: "Que a função trabalhe apenas sobre uma cópia", isCorrect: false },
                        { text: "Que a função não receba nenhum argumento", isCorrect: false },
                        { text: "Que a variável seja apagada após a chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Para passar um objeto grande sem copiar e sem permitir que a função o altere, use:",
                    difficulty: "medio",
                    options: [
                        { text: "Uma referência const (const T&)", isCorrect: true },
                        { text: "Uma passagem por valor comum (T x)", isCorrect: false },
                        { text: "Uma referência simples (T&)", isCorrect: false },
                        { text: "Nenhum parâmetro na função", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma vantagem de passar por referência const em vez de por valor é:",
                    difficulty: "dificil",
                    options: [
                        { text: "Evitar a cópia do objeto, ganhando desempenho", isCorrect: true },
                        { text: "Permitir que a função altere o objeto livremente", isCorrect: false },
                        { text: "Fazer uma cópia extra para segurança", isCorrect: false },
                        { text: "Impedir que a função leia o objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Após `int n = 5; dobrar(n);`, onde `dobrar(int& x)` faz `x = x * 2`, quanto vale n?",
                    difficulty: "medio",
                    options: [
                        { text: "5, pois a função recebe apenas uma cópia", isCorrect: false },
                        { text: "Indefinido, pois n perde o valor logo após a chamada", isCorrect: false },
                        { text: "10, pois a referência altera a própria variável", isCorrect: true },
                        { text: "0, pois n é apagado após a chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Segundo a tabela da aula, o que a passagem por valor (`int x`) faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Não copia, mas altera o original", isCorrect: false },
                        { text: "Não copia e não altera o original", isCorrect: false },
                        { text: "Copia o argumento e ainda altera o original de quem chamou", isCorrect: false },
                        { text: "Copia o argumento, mas não altera o original", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Sobrecarga e argumentos padrão",
            blocks: [
                {
                    type: "text",
                    value: "# Sobrecarga de funções\n\nC++ permite várias funções com o **mesmo nome**, desde que tenham **parâmetros diferentes** (em número ou tipo). O compilador escolhe a versão certa pelos argumentos da chamada. Isso se chama sobrecarga.\n\n```\nint somar(int a, int b) { return a + b; }\ndouble somar(double a, double b) { return a + b; }\n\nsomar(2, 3);       // usa a versão de int\nsomar(2.5, 3.5);   // usa a versão de double\n```",
                },
                {
                    type: "text",
                    value: "## Argumentos padrão\n\nVocê pode dar um valor **padrão** a um parâmetro. Se quem chama não fornecer aquele argumento, o padrão é usado. Os parâmetros com valor padrão devem vir por último.\n\n```\nvoid cumprimentar(std::string nome, std::string saudacao = \"Olá\") {\n    std::cout << saudacao << \", \" << nome;\n}\n\ncumprimentar(\"Ana\");            // Olá, Ana\ncumprimentar(\"Ana\", \"Oi\");      // Oi, Ana\n```",
                },
                {
                    type: "quote",
                    value: "Sobrecarga é ter o mesmo nome de função com parâmetros diferentes. Argumentos padrão dão um valor usado quando quem chama não fornece aquele argumento.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza a sobrecarga de funções em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Mesmo nome de função com parâmetros diferentes", isCorrect: true },
                        { text: "Nomes diferentes para a mesma operação", isCorrect: false },
                        { text: "Uma função que chama a si mesma", isCorrect: false },
                        { text: "Mesmo nome e mesmos parâmetros, mudando o retorno", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece se quem chama não fornece um argumento que tem valor padrão?",
                    difficulty: "facil",
                    options: [
                        { text: "O valor padrão declarado é usado", isCorrect: true },
                        { text: "Ocorre sempre um erro de compilação", isCorrect: false },
                        { text: "O parâmetro fica com lixo de memória", isCorrect: false },
                        { text: "A função não é executada", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde os parâmetros com valor padrão devem ficar na lista de parâmetros?",
                    difficulty: "medio",
                    options: [
                        { text: "Por último, depois dos parâmetros sem valor padrão", isCorrect: true },
                        { text: "Sempre no início, antes de todos os demais", isCorrect: false },
                        { text: "No meio, entre os parâmetros obrigatórios", isCorrect: false },
                        { text: "Em qualquer posição, sem nenhuma restrição", isCorrect: false },
                    ],
                },
                {
                    statement: "Em uma função sobrecarregada, como o compilador escolhe qual versão usar?",
                    difficulty: "medio",
                    options: [
                        { text: "Pela ordem em que as versões foram escritas", isCorrect: false },
                        { text: "Pelos argumentos passados na chamada", isCorrect: true },
                        { text: "Pelo tipo de retorno de cada versão", isCorrect: false },
                        { text: "Sempre pela primeira versão declarada", isCorrect: false },
                    ],
                },
                {
                    statement: "Com `void cumprimentar(std::string nome, std::string saudacao = \"Olá\")`, o que `cumprimentar(\"Ana\")` imprime?",
                    difficulty: "dificil",
                    options: [
                        { text: "Olá, Ana", isCorrect: true },
                        { text: "Ana, Olá", isCorrect: false },
                        { text: "Oi, Ana", isCorrect: false },
                        { text: "Apenas Ana, sem nenhuma saudação", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Ponteiros e gerenciamento de memória",
    aulas: [
        {
            titulo: "Ponteiros: endereços e desreferência",
            blocks: [
                {
                    type: "text",
                    value: "# O que é um ponteiro\n\nUm **ponteiro** é uma variável que guarda o **endereço** de outra variável, não o valor em si. Ponteiros são um recurso central do C++ e a base do controle de memória de baixo nível.\n\nDois operadores fazem a ponte:\n\n- `&` (endereço de): devolve o endereço de uma variável.\n- `*` (desreferência): acessa o valor guardado no endereço apontado.",
                },
                {
                    type: "code",
                    value: "int x = 10;\nint* p = &x;   // p guarda o endereço de x\n\nstd::cout << *p << std::endl;   // 10, o valor apontado\n*p = 20;                        // altera x através do ponteiro\nstd::cout << x << std::endl;    // 20",
                },
                {
                    type: "text",
                    value: "## nullptr: o ponteiro que não aponta\n\nUm ponteiro que não aponta para nada deve receber `nullptr` (o C++ moderno). Desreferenciar um ponteiro nulo ou não inicializado é um erro grave que costuma travar o programa. Sempre garanta que um ponteiro aponta para algo válido antes de usar o `*`.\n\n```\nint* p = nullptr;   // não aponta para nada ainda\n```",
                },
                {
                    type: "quote",
                    value: "Um ponteiro guarda o endereço de uma variável. & pega o endereço; * acessa o valor apontado. Um ponteiro sem destino recebe nullptr.",
                },
            ],
            questions: [
                {
                    statement: "O que um ponteiro guarda em C++?",
                    difficulty: "facil",
                    options: [
                        { text: "O endereço de outra variável", isCorrect: true },
                        { text: "Uma cópia do valor de outra variável", isCorrect: false },
                        { text: "O tipo de uma variável apenas", isCorrect: false },
                        { text: "O nome textual de uma variável", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador '*' faz quando aplicado a um ponteiro, como em '*p'?",
                    difficulty: "medio",
                    options: [
                        { text: "Acessa o valor guardado no endereço apontado", isCorrect: true },
                        { text: "Devolve o endereço do ponteiro", isCorrect: false },
                        { text: "Multiplica o ponteiro por um número", isCorrect: false },
                        { text: "Cria um novo ponteiro nulo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um ponteiro que não aponta para nada deve receber, no C++ moderno?",
                    difficulty: "facil",
                    options: [
                        { text: "nullptr", isCorrect: true },
                        { text: "O número zero por extenso", isCorrect: false },
                        { text: "Uma string vazia", isCorrect: false },
                        { text: "O valor undefined", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador `&`, como em `&x`, devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "O valor guardado dentro de x", isCorrect: false },
                        { text: "Uma cópia da variável x", isCorrect: false },
                        { text: "O endereço da variável x", isCorrect: true },
                        { text: "O tipo declarado da variável x", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao desreferenciar (`*p`) um ponteiro nulo ou não inicializado?",
                    difficulty: "dificil",
                    options: [
                        { text: "O ponteiro passa a apontar para o valor zero", isCorrect: false },
                        { text: "É um erro grave que costuma travar o programa", isCorrect: true },
                        { text: "O valor apontado vira nullptr de forma automática", isCorrect: false },
                        { text: "Nada, o C++ simplesmente ignora a operação", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Stack e heap: new e delete",
            blocks: [
                {
                    type: "text",
                    value: "# Duas regiões de memória\n\nUm programa C++ usa duas regiões principais de memória:\n\n- A **stack (pilha)**: onde ficam as variáveis locais. É rápida e gerenciada automaticamente: quando uma função termina, suas variáveis locais são liberadas sozinhas.\n- A **heap (monte)**: memória alocada dinamicamente, sob seu controle. Você pede memória quando precisa e é responsável por devolvê-la.",
                },
                {
                    type: "text",
                    value: "## Alocando na heap com new e delete\n\nPara alocar na heap, usa-se `new`, que devolve um ponteiro para a memória reservada. Quando terminar, você deve liberar com `delete`. Ao contrário da stack, a heap não se limpa sozinha.\n\n```\nint* p = new int;   // aloca um int na heap\n*p = 42;\nstd::cout << *p << std::endl;   // 42\ndelete p;           // libera a memória\n```\n\nA regra é simples de dizer e fácil de esquecer: para cada `new`, deve haver um `delete`.",
                },
                {
                    type: "quote",
                    value: "Variáveis locais vivem na stack e são liberadas sozinhas. A heap é memória dinâmica que você aloca com new e precisa liberar com delete: para cada new, um delete.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza a stack (pilha) em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Guarda variáveis locais e as libera sozinha ao fim da função", isCorrect: true },
                        { text: "É memória que você aloca e libera manualmente", isCorrect: false },
                        { text: "Nunca é liberada durante a execução do programa", isCorrect: false },
                        { text: "Só existe em programas sem funções", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual palavra-chave aloca memória na heap em C++?",
                    difficulty: "facil",
                    options: [
                        { text: "new", isCorrect: true },
                        { text: "malloc", isCorrect: false },
                        { text: "alloc", isCorrect: false },
                        { text: "create", isCorrect: false },
                    ],
                },
                {
                    statement: "Depois de alocar com 'new int', o que você deve fazer ao terminar de usar?",
                    difficulty: "medio",
                    options: [
                        { text: "Liberar a memória com delete", isCorrect: true },
                        { text: "Nada, pois a heap se limpa sozinha", isCorrect: false },
                        { text: "Chamar new novamente para fechar", isCorrect: false },
                        { text: "Converter o ponteiro em int", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o `new` devolve ao alocar memória na heap?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma cópia do valor recém-alocado", isCorrect: false },
                        { text: "O tamanho exato da memória em bytes", isCorrect: false },
                        { text: "O endereço do topo da stack naquele momento", isCorrect: false },
                        { text: "Um ponteiro para a memória reservada", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual regra vale para memória alocada na heap com `new`?",
                    difficulty: "medio",
                    options: [
                        { text: "O new já libera sozinho ao fim da função", isCorrect: false },
                        { text: "A heap se limpa sozinha entre as chamadas", isCorrect: false },
                        { text: "Para cada new deve haver um delete", isCorrect: true },
                        { text: "Um único delete libera todos os new de uma vez", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Os perigos: vazamentos e ponteiros pendentes",
            blocks: [
                {
                    type: "text",
                    value: "# Vazamento de memória\n\nSe você aloca com `new` e **esquece** o `delete`, aquela memória fica reservada até o programa terminar, mesmo sem ser mais usada. Isso é um **vazamento de memória (memory leak)**. Em um programa que roda por muito tempo, vazamentos vão consumindo a memória até causar problemas.",
                },
                {
                    type: "text",
                    value: "## Ponteiro pendente\n\nO problema oposto: usar um ponteiro **depois** de a memória ter sido liberada. Após um `delete`, o ponteiro ainda guarda o endereço antigo, mas a memória não é mais sua. Desreferenciar esse **ponteiro pendente (dangling pointer)** leva a comportamento indefinido, um dos bugs mais traiçoeiros do C++.\n\n```\nint* p = new int(10);\ndelete p;\n// *p agora é comportamento indefinido: p está pendente\n```",
                },
                {
                    type: "text",
                    value: "## A solução moderna\n\nGerenciar `new` e `delete` manualmente é propenso a erro. Por isso, o C++ moderno recomenda fortemente evitar `new`/`delete` diretos e usar **smart pointers** e a técnica de **RAII**, que amarram a liberação da memória ao ciclo de vida dos objetos. Você verá esses recursos nos módulos avançados; por ora, entenda o problema que eles resolvem.",
                },
                {
                    type: "quote",
                    value: "Esquecer o delete causa vazamento de memória; usar um ponteiro após o delete cria um ponteiro pendente. O C++ moderno resolve isso com smart pointers e RAII.",
                },
            ],
            questions: [
                {
                    statement: "O que é um vazamento de memória (memory leak)?",
                    difficulty: "medio",
                    options: [
                        { text: "Alocar memória com new e esquecer de liberá-la com delete", isCorrect: true },
                        { text: "Usar um ponteiro depois de liberar a memória", isCorrect: false },
                        { text: "Declarar uma variável local dentro de uma função", isCorrect: false },
                        { text: "Passar um argumento por valor para uma função", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é um ponteiro pendente (dangling pointer)?",
                    difficulty: "dificil",
                    options: [
                        { text: "Um ponteiro usado após a memória que ele aponta ter sido liberada", isCorrect: true },
                        { text: "Um ponteiro que nunca recebeu o valor nullptr definido", isCorrect: false },
                        { text: "Um ponteiro que aponta para uma variável local qualquer", isCorrect: false },
                        { text: "Um ponteiro passado por valor a uma função comum", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o C++ moderno recomenda para evitar os erros de new e delete manuais?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar smart pointers e a técnica de RAII", isCorrect: true },
                        { text: "Nunca alocar memória em nenhum programa", isCorrect: false },
                        { text: "Alocar tudo com new e nunca liberar", isCorrect: false },
                        { text: "Evitar completamente o uso de ponteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que ocorre ao desreferenciar um ponteiro pendente, após o `delete`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O ponteiro volta a apontar para nullptr de forma automática", isCorrect: false },
                        { text: "Comportamento indefinido, um dos bugs mais traiçoeiros", isCorrect: true },
                        { text: "A memória é realocada na mesma hora", isCorrect: false },
                        { text: "O valor antigo é sempre recuperado intacto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o efeito de vazamentos de memória em um programa que roda por muito tempo?",
                    difficulty: "medio",
                    options: [
                        { text: "Vão consumindo a memória até causar problemas", isCorrect: true },
                        { text: "Deixam o programa mais rápido com o tempo", isCorrect: false },
                        { text: "Liberam a memória usada por todos os outros programas", isCorrect: false },
                        { text: "Não têm efeito algum sobre a execução", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Classes, objetos e RAII",
    aulas: [
        {
            titulo: "Classes e objetos",
            blocks: [
                {
                    type: "text",
                    value: "# Modelando com classes\n\nUma **classe** é um modelo que agrupa dados (atributos) e comportamento (métodos) sob um tipo. Um **objeto** é uma instância concreta da classe. C++ herdou a orientação a objetos da linguagem C somada às classes, e é aqui que essa herança aparece.\n\n```\nclass Cachorro {\npublic:\n    std::string nome;\n    void latir() {\n        std::cout << nome << \" faz au au\" << std::endl;\n    }\n};\n\nCachorro rex;\nrex.nome = \"Rex\";\nrex.latir();   // Rex faz au au\n```",
                },
                {
                    type: "text",
                    value: "## Acesso: public e private\n\nDentro de uma classe, os membros ficam sob **especificadores de acesso**:\n\n- **public**: acessível de fora do objeto.\n- **private**: acessível só de dentro da própria classe.\n- **protected**: como private, mas também visível às subclasses.\n\nUma diferença entre `class` e `struct` em C++: em uma `class`, os membros são `private` por padrão; em uma `struct`, são `public` por padrão. Fora isso, elas são muito parecidas.",
                },
                {
                    type: "quote",
                    value: "Uma classe agrupa dados e comportamento; um objeto é uma instância dela. Os membros ficam sob public, private ou protected. Em class o padrão é private; em struct, public.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a relação entre uma classe e um objeto?",
                    difficulty: "facil",
                    options: [
                        { text: "A classe é o modelo; o objeto é uma instância dela", isCorrect: true },
                        { text: "O objeto é o modelo; a classe é a instância", isCorrect: false },
                        { text: "Classe e objeto são a mesma coisa", isCorrect: false },
                        { text: "A classe existe só depois do objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o especificador 'private' faz com um membro de classe?",
                    difficulty: "facil",
                    options: [
                        { text: "Torna o membro acessível só de dentro da própria classe", isCorrect: true },
                        { text: "Deixa o membro acessível de qualquer lugar", isCorrect: false },
                        { text: "Transforma o membro em uma função global", isCorrect: false },
                        { text: "Remove o membro da classe", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença de acesso padrão entre 'class' e 'struct' em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Em class os membros são private por padrão; em struct, public", isCorrect: true },
                        { text: "Em class os membros são public por padrão; em struct, private", isCorrect: false },
                        { text: "As duas têm membros private por padrão", isCorrect: false },
                        { text: "struct não pode ter métodos, só class", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza um membro `protected` em uma classe?",
                    difficulty: "medio",
                    options: [
                        { text: "É acessível de qualquer parte do código do programa", isCorrect: false },
                        { text: "Só pode ser lido, mas nunca alterado", isCorrect: false },
                        { text: "É como private, mas também visível às subclasses", isCorrect: true },
                        { text: "É retirado da classe no momento de compilar", isCorrect: false },
                    ],
                },
                {
                    statement: "Em uma classe, os dados que ela guarda e o comportamento que ela executa se chamam, respectivamente:",
                    difficulty: "medio",
                    options: [
                        { text: "Métodos e atributos", isCorrect: false },
                        { text: "Objetos e instâncias", isCorrect: false },
                        { text: "Chaves e valores", isCorrect: false },
                        { text: "Atributos e métodos", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Construtores e destrutores",
            blocks: [
                {
                    type: "text",
                    value: "# O construtor\n\nO **construtor** é um método especial que roda quando o objeto é criado, para inicializá-lo. Tem o mesmo nome da classe e não declara tipo de retorno.\n\n```\nclass Cachorro {\npublic:\n    std::string nome;\n    int idade;\n\n    Cachorro(std::string n, int i) {\n        nome = n;\n        idade = i;\n    }\n};\n\nCachorro rex(\"Rex\", 3);   // chama o construtor\n```",
                },
                {
                    type: "text",
                    value: "# O destrutor: exclusivo do C++\n\nO **destrutor** é um método especial que roda automaticamente quando o objeto é destruído, seja ao sair de escopo (na stack) ou ao ser liberado com `delete` (na heap). Ele tem o nome da classe com um til na frente: `~Cachorro()`. O destrutor é o lugar de liberar recursos que o objeto tenha adquirido, como memória, arquivos ou conexões.\n\n```\nclass Arquivo {\npublic:\n    Arquivo() { /* abre o arquivo */ }\n    ~Arquivo() { /* fecha o arquivo automaticamente */ }\n};\n```\n\nEsse par construtor/destrutor é a base de um dos conceitos mais importantes do C++, o RAII, na próxima aula.",
                },
                {
                    type: "quote",
                    value: "O construtor inicializa o objeto ao ser criado. O destrutor (~Classe) roda automaticamente ao objeto ser destruído, e é onde se liberam os recursos que ele adquiriu.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve o construtor de uma classe?",
                    difficulty: "facil",
                    options: [
                        { text: "Inicializar o objeto no momento em que ele é criado", isCorrect: true },
                        { text: "Destruir o objeto ao final do programa", isCorrect: false },
                        { text: "Impedir que a classe seja instanciada", isCorrect: false },
                        { text: "Definir o tipo de retorno dos métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o destrutor de um objeto é executado?",
                    difficulty: "medio",
                    options: [
                        { text: "Automaticamente, quando o objeto é destruído", isCorrect: true },
                        { text: "Manualmente, chamando-o pelo nome", isCorrect: false },
                        { text: "No início do programa, antes do main", isCorrect: false },
                        { text: "Apenas quando ocorre um erro no objeto", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o papel típico de um destrutor em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Liberar os recursos que o objeto havia adquirido", isCorrect: true },
                        { text: "Criar novos objetos da mesma classe", isCorrect: false },
                        { text: "Definir os valores iniciais dos atributos", isCorrect: false },
                        { text: "Impedir o acesso aos membros privados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza a assinatura de um construtor?",
                    difficulty: "medio",
                    options: [
                        { text: "Tem o nome da classe com um til (~) escrito na frente", isCorrect: false },
                        { text: "Tem o mesmo nome da classe e nenhum tipo de retorno", isCorrect: true },
                        { text: "Tem um nome qualquer e retorna void", isCorrect: false },
                        { text: "Tem um nome livre e retorna um int", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se escreve o nome do destrutor de uma classe chamada `Cachorro`?",
                    difficulty: "medio",
                    options: [
                        { text: "~Cachorro", isCorrect: true },
                        { text: "Cachorro", isCorrect: false },
                        { text: "!Cachorro", isCorrect: false },
                        { text: "delete Cachorro", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Encapsulamento e RAII",
            blocks: [
                {
                    type: "text",
                    value: "# Encapsulamento\n\n**Encapsulamento** é esconder os detalhes internos do objeto e controlar o acesso a eles. Na prática, você deixa os atributos `private` e oferece métodos públicos para lê-los e alterá-los sob regras. Isso protege o objeto de estados inválidos.\n\n```\nclass ContaBancaria {\nprivate:\n    double saldo = 0;\npublic:\n    double getSaldo() const { return saldo; }\n    void depositar(double valor) {\n        if (valor > 0) saldo += valor;   // só aceita positivos\n    }\n};\n```\n\nRepare no `const` após `getSaldo()`: ele promete que o método não altera o objeto.",
                },
                {
                    type: "text",
                    value: "# RAII: o padrão que define o C++\n\n**RAII** significa \"Resource Acquisition Is Initialization\" (aquisição de recurso é inicialização). A ideia: amarrar o ciclo de vida de um recurso ao ciclo de vida de um objeto. O construtor **adquire** o recurso (memória, arquivo, trava); o destrutor o **libera**, automaticamente, quando o objeto sai de escopo.\n\nComo o destrutor roda sozinho, você não esquece de liberar, mesmo que ocorra um erro no meio. É por isso que o C++ moderno prefere objetos que se autogerenciam (como os smart pointers) em vez de `new`/`delete` manuais: RAII transforma a liberação em algo garantido pela linguagem.",
                },
                {
                    type: "quote",
                    value: "RAII amarra um recurso ao ciclo de vida de um objeto: o construtor adquire, o destrutor libera sozinho ao fim do escopo. É o que torna a gestão de recursos em C++ segura.",
                },
            ],
            questions: [
                {
                    statement: "Encapsulamento em uma classe é melhor descrito como:",
                    difficulty: "facil",
                    options: [
                        { text: "Esconder os detalhes internos e controlar o acesso a eles", isCorrect: true },
                        { text: "Fazer uma classe herdar de outra classe base", isCorrect: false },
                        { text: "Ter vários métodos com o mesmo nome na classe", isCorrect: false },
                        { text: "Copiar um objeto para criar outro idêntico a ele", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a sigla RAII descreve em C++?",
                    difficulty: "dificil",
                    options: [
                        { text: "Amarrar o ciclo de vida de um recurso ao de um objeto", isCorrect: true },
                        { text: "Uma forma de herança entre várias classes", isCorrect: false },
                        { text: "Um tipo especial de laço de repetição", isCorrect: false },
                        { text: "Uma técnica para acelerar a compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o RAII torna a liberação de recursos confiável?",
                    difficulty: "medio",
                    options: [
                        { text: "O destrutor roda sozinho ao fim do escopo, mesmo se houver erro", isCorrect: true },
                        { text: "O programador precisa liberar tudo manualmente", isCorrect: false },
                        { text: "Os recursos nunca são liberados durante a execução", isCorrect: false },
                        { text: "A liberação só ocorre quando o programa inteiro termina", isCorrect: false },
                    ],
                },
                {
                    statement: "Em `double getSaldo() const`, o que o `const` após o nome do método promete?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o método é sempre privado à classe", isCorrect: false },
                        { text: "Que o valor retornado nunca muda", isCorrect: false },
                        { text: "Que o método não recebe parâmetros", isCorrect: false },
                        { text: "Que o método não altera o objeto", isCorrect: true },
                    ],
                },
                {
                    statement: "No padrão RAII, qual é o papel do construtor e do destrutor?",
                    difficulty: "dificil",
                    options: [
                        { text: "O construtor adquire o recurso e o destrutor o libera", isCorrect: true },
                        { text: "O construtor libera o recurso e o destrutor volta a adquiri-lo", isCorrect: false },
                        { text: "Os dois adquirem o recurso ao mesmo tempo", isCorrect: false },
                        { text: "Nenhum dos dois lida com o recurso adquirido", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Herança e polimorfismo",
    aulas: [
        {
            titulo: "Herança",
            blocks: [
                {
                    type: "text",
                    value: "# Reaproveitar e especializar\n\n**Herança** permite que uma classe (a derivada) reaproveite os membros de outra (a base) e acrescente ou especialize o que precisar. Em C++, usa-se dois-pontos e o tipo de herança, normalmente `public`.\n\n```\nclass Animal {\npublic:\n    std::string nome;\n    void comer() {\n        std::cout << nome << \" está comendo\" << std::endl;\n    }\n};\n\nclass Gato : public Animal {\npublic:\n    void miar() {\n        std::cout << nome << \" faz miau\" << std::endl;\n    }\n};\n```",
                },
                {
                    type: "text",
                    value: "## A derivada é um tipo da base\n\nO `Gato` herda `nome` e `comer()` do `Animal` e adiciona `miar()`. A relação modela um \"é um tipo de\": um gato é um tipo de animal.\n\n```\nGato felix;\nfelix.nome = \"Felix\";\nfelix.comer();   // herdado de Animal\nfelix.miar();    // próprio de Gato\n```\n\nDiferente de linguagens de herança simples, o C++ permite **herança múltipla** (herdar de mais de uma base), um recurso poderoso, porém que exige cuidado por poder gerar ambiguidades.",
                },
                {
                    type: "quote",
                    value: "Herança (class Derivada : public Base) faz a derivada reaproveitar a base e especializá-la, modelando um é um tipo de. C++ permite até herança múltipla.",
                },
            ],
            questions: [
                {
                    statement: "Como se declara que a classe Gato herda publicamente de Animal em C++?",
                    difficulty: "facil",
                    options: [
                        { text: "class Gato : public Animal", isCorrect: true },
                        { text: "class Gato extends Animal", isCorrect: false },
                        { text: "class Gato inherits Animal", isCorrect: false },
                        { text: "class Gato implements Animal", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma classe derivada, ao herdar de uma base:",
                    difficulty: "facil",
                    options: [
                        { text: "Reaproveita os membros da base e pode adicionar os seus", isCorrect: true },
                        { text: "Precisa reescrever todos os membros da base", isCorrect: false },
                        { text: "Perde acesso a tudo o que a base define", isCorrect: false },
                        { text: "Não pode adicionar nenhum membro novo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o C++ permite quanto a herança, diferente de linguagens de herança simples?",
                    difficulty: "medio",
                    options: [
                        { text: "Herança múltipla, herdando de mais de uma base", isCorrect: true },
                        { text: "Herdar apenas de uma única base, sem exceção", isCorrect: false },
                        { text: "Herança sem nenhum reaproveitamento de código", isCorrect: false },
                        { text: "Herança apenas entre classes de mesmo nome", isCorrect: false },
                    ],
                },
                {
                    statement: "Que relação a herança entre `Gato` e `Animal` modela?",
                    difficulty: "medio",
                    options: [
                        { text: "Um animal é um tipo de gato", isCorrect: false },
                        { text: "Um gato é um tipo de animal", isCorrect: true },
                        { text: "Um gato tem um animal dentro de si", isCorrect: false },
                        { text: "Um gato usa um animal por fora", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a herança múltipla do C++ exige cuidado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Porque pode gerar ambiguidades entre as bases", isCorrect: true },
                        { text: "Porque impede a classe de ter métodos próprios", isCorrect: false },
                        { text: "Porque proíbe o uso de public na herança", isCorrect: false },
                        { text: "Porque apaga os membros herdados da base", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Funções virtuais e polimorfismo",
            blocks: [
                {
                    type: "text",
                    value: "# O problema que a virtual resolve\n\nEm C++, para que um ponteiro ou referência da classe base chame a versão da classe derivada, o método precisa ser declarado **virtual** na base. Sem `virtual`, a chamada usa a versão da base, decidida em tempo de compilação.\n\n```\nclass Animal {\npublic:\n    virtual void emitirSom() {\n        std::cout << \"Som genérico\" << std::endl;\n    }\n};\n\nclass Gato : public Animal {\npublic:\n    void emitirSom() override {\n        std::cout << \"Miau\" << std::endl;\n    }\n};\n```\n\nA palavra `override` na derivada deixa claro que você sobrescreve um método virtual, e o compilador confere isso.",
                },
                {
                    type: "text",
                    value: "## Polimorfismo em ação\n\nCom `virtual`, uma referência ou ponteiro da base executa a versão do objeto **real**, decidida em tempo de execução. Isso é o polimorfismo: escrever código que funciona com qualquer `Animal` sem saber o tipo exato.\n\n```\nAnimal* a = new Gato();\na->emitirSom();   // Miau, porque o método é virtual\ndelete a;\n```\n\nSe `emitirSom` não fosse `virtual`, a chamada acima imprimiria \"Som genérico\", pois usaria o tipo do ponteiro (`Animal`), não o do objeto (`Gato`).",
                },
                {
                    type: "quote",
                    value: "Para uma referência da base chamar a versão da derivada, o método precisa ser virtual. Aí a versão do objeto real é escolhida em tempo de execução: isso é polimorfismo.",
                },
            ],
            questions: [
                {
                    statement: "O que é preciso para que um ponteiro da base chame a versão sobrescrita da derivada?",
                    difficulty: "medio",
                    options: [
                        { text: "Declarar o método como virtual na classe base", isCorrect: true },
                        { text: "Declarar o método como static na base", isCorrect: false },
                        { text: "Declarar o método como const na derivada", isCorrect: false },
                        { text: "Nada, isso acontece sempre por padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Com 'Animal* a = new Gato();' e emitirSom virtual, o que 'a->emitirSom()' executa?",
                    difficulty: "dificil",
                    options: [
                        { text: "A versão de Gato, pois o objeto real é um Gato", isCorrect: true },
                        { text: "A versão de Animal, pois o ponteiro é do tipo Animal", isCorrect: false },
                        { text: "As duas versões, uma após a outra", isCorrect: false },
                        { text: "Nenhuma, pois a atribuição é inválida", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a palavra 'override' na classe derivada?",
                    difficulty: "medio",
                    options: [
                        { text: "Sinalizar que sobrescreve um virtual, e o compilador confere", isCorrect: true },
                        { text: "Impedir que o método seja herdado pelas derivadas", isCorrect: false },
                        { text: "Transformar o método em um construtor da classe", isCorrect: false },
                        { text: "Tornar o método privado na classe derivada", isCorrect: false },
                    ],
                },
                {
                    statement: "Sem `virtual`, qual versão do método um ponteiro da base chama?",
                    difficulty: "dificil",
                    options: [
                        { text: "A do objeto real, decidida em tempo de execução", isCorrect: false },
                        { text: "As duas versões, uma após a outra", isCorrect: false },
                        { text: "A da base, decidida em tempo de compilação", isCorrect: true },
                        { text: "Nenhuma, pois isso vira erro de compilação", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o polimorfismo permite, na prática?",
                    difficulty: "medio",
                    options: [
                        { text: "Ter dois ou mais métodos de mesmo nome na mesma classe", isCorrect: false },
                        { text: "Tratar objetos de tipos diferentes por uma base comum", isCorrect: true },
                        { text: "Herdar de várias classes base ao mesmo tempo", isCorrect: false },
                        { text: "Impedir que a classe base seja instanciada", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Classes abstratas e o destrutor virtual",
            blocks: [
                {
                    type: "text",
                    value: "# Métodos virtuais puros e classes abstratas\n\nUm método virtual pode ser declarado **puro**, sem corpo, atribuindo `= 0`. Uma classe com ao menos um método virtual puro é **abstrata**: não pode ser instanciada, e serve de contrato para as derivadas, que são obrigadas a implementar o método.\n\n```\nclass Forma {\npublic:\n    virtual double area() = 0;   // virtual puro: sem corpo\n};\n\nclass Circulo : public Forma {\npublic:\n    double raio;\n    double area() override { return 3.14159 * raio * raio; }\n};\n```\n\n`Forma` não pode ser criada diretamente; `Circulo` implementa `area()` e pode.",
                },
                {
                    type: "text",
                    value: "## O destrutor virtual: uma armadilha clássica\n\nUma regra importante do C++: se você tem uma classe base com métodos virtuais e vai deletar objetos derivados através de um ponteiro da base, o **destrutor da base deve ser virtual**. Sem isso, deletar pelo ponteiro da base chama só o destrutor da base, e a parte da derivada não é liberada corretamente, causando vazamentos.\n\n```\nclass Base {\npublic:\n    virtual ~Base() {}   // destrutor virtual\n};\n```",
                },
                {
                    type: "quote",
                    value: "Um método virtual = 0 é virtual puro e torna a classe abstrata (não instanciável). Se deletar derivados por um ponteiro da base, o destrutor da base precisa ser virtual.",
                },
            ],
            questions: [
                {
                    statement: "O que torna uma classe abstrata em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Ter ao menos um método virtual puro (= 0)", isCorrect: true },
                        { text: "Ter todos os métodos declarados como const", isCorrect: false },
                        { text: "Não ter nenhum construtor definido", isCorrect: false },
                        { text: "Herdar de mais de uma classe base", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma classe abstrata em C++:",
                    difficulty: "facil",
                    options: [
                        { text: "Não pode ser instanciada diretamente", isCorrect: true },
                        { text: "Pode ser instanciada como qualquer outra", isCorrect: false },
                        { text: "Não pode ter classes derivadas", isCorrect: false },
                        { text: "Não pode declarar nenhum método", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o destrutor de uma classe base deve ser virtual ao deletar derivados pelo ponteiro da base?",
                    difficulty: "dificil",
                    options: [
                        { text: "Para o destrutor da derivada rodar e liberar tudo", isCorrect: true },
                        { text: "Para acelerar bastante a destruição do objeto", isCorrect: false },
                        { text: "Para impedir a criação de classes derivadas", isCorrect: false },
                        { text: "Porque destrutores nunca podem ser chamados", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se declara um método virtual puro em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Escrevendo a palavra `pure` antes do método", isCorrect: false },
                        { text: "Marcando o método como `const`", isCorrect: false },
                        { text: "Removendo a palavra `virtual` dele", isCorrect: false },
                        { text: "Atribuindo `= 0` e sem dar corpo ao método", isCorrect: true },
                    ],
                },
                {
                    statement: "Qual é o papel de uma classe abstrata em relação às suas derivadas?",
                    difficulty: "dificil",
                    options: [
                        { text: "Implementar no lugar delas todos os métodos virtuais puros existentes", isCorrect: false },
                        { text: "Servir de contrato, obrigando-as a implementar o método puro", isCorrect: true },
                        { text: "Impedir que elas tenham métodos próprios", isCorrect: false },
                        { text: "Copiar os atributos delas ao ser criada", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_8: Modulo = {
    titulo: "Módulo 8 - A STL: containers e templates",
    aulas: [
        {
            titulo: "std::vector: o array dinâmico",
            blocks: [
                {
                    type: "text",
                    value: "# A biblioteca de containers\n\nA **STL (Standard Template Library)** é a parte da biblioteca padrão do C++ com estruturas de dados e algoritmos prontos. O container mais usado é o `std::vector`: um array que cresce e diminui conforme você adiciona e remove, sem o tamanho fixo dos arrays crus.\n\n```\n#include <vector>\n\nstd::vector<int> numeros = {10, 20, 30};\nnumeros.push_back(40);            // adiciona ao fim\nstd::cout << numeros.size();      // 4\nstd::cout << numeros[0];          // 10\n```",
                },
                {
                    type: "text",
                    value: "## Métodos comuns e o tipo entre < >\n\nO `vector` oferece `push_back` (adicionar ao fim), `size()` (quantidade), o acesso por índice com `[]` e funciona bem com o range-based for. O `<int>` diz que o vetor guarda inteiros; isso é possível por causa dos **templates**, que você verá adiante.\n\nO `vector` gerencia sua própria memória: ele aloca e libera conforme necessário, seguindo o RAII. Você não precisa de `new` nem `delete`, o que o torna muito mais seguro do que gerenciar um array cru na heap.",
                },
                {
                    type: "quote",
                    value: "std::vector é o array dinâmico da STL: cresce com push_back, é acessado por [] e gerencia a própria memória (RAII), sem new nem delete.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a vantagem do std::vector sobre um array cru de tamanho fixo?",
                    difficulty: "facil",
                    options: [
                        { text: "Ele cresce e diminui de tamanho e gerencia a própria memória", isCorrect: true },
                        { text: "Ele é sempre mais lento, mas ocupa menos espaço", isCorrect: false },
                        { text: "Ele dispensa a declaração do tipo dos elementos", isCorrect: false },
                        { text: "Ele guarda tipos diferentes misturados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método adiciona um elemento ao fim de um std::vector?",
                    difficulty: "facil",
                    options: [
                        { text: "push_back", isCorrect: true },
                        { text: "add", isCorrect: false },
                        { text: "append", isCorrect: false },
                        { text: "insert_end", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o std::vector é mais seguro do que um array cru na heap?",
                    difficulty: "medio",
                    options: [
                        { text: "Ele gerencia a própria memória por RAII, sem new nem delete", isCorrect: true },
                        { text: "Ele nunca guarda dados de verdade em nenhum caso", isCorrect: false },
                        { text: "Ele proíbe o acesso aos elementos por índice", isCorrect: false },
                        { text: "Ele só funciona com valores do tipo string", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é a STL (Standard Template Library) do C++?",
                    difficulty: "medio",
                    options: [
                        { text: "A biblioteca padrão com estruturas de dados e algoritmos", isCorrect: true },
                        { text: "Um compilador próprio que traduz o código-fonte da linguagem", isCorrect: false },
                        { text: "Um tipo de ponteiro que gerencia a memória sozinho", isCorrect: false },
                        { text: "Uma ferramenta que executa o programa já compilado", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o método `size()` de um `std::vector` retorna?",
                    difficulty: "medio",
                    options: [
                        { text: "O elemento que está guardado na primeira posição", isCorrect: false },
                        { text: "A quantidade de elementos que ele guarda", isCorrect: true },
                        { text: "A capacidade máxima e fixa do vetor", isCorrect: false },
                        { text: "O tipo dos elementos guardados nele", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "map, set e iteradores",
            blocks: [
                {
                    type: "text",
                    value: "# std::map: chave e valor\n\nO `std::map` associa chaves a valores, como um dicionário. Você acessa e insere com colchetes.\n\n```\n#include <map>\n\nstd::map<std::string, int> idades;\nidades[\"Ana\"] = 30;\nidades[\"Bruno\"] = 25;\nstd::cout << idades[\"Ana\"];   // 30\n```\n\nO tipo `std::map<std::string, int>` significa: chaves string, valores int. O `std::set` é um primo que guarda apenas **elementos únicos**, sem valores associados, útil para garantir que não há repetição.",
                },
                {
                    type: "text",
                    value: "## Iteradores: percorrer qualquer container\n\nA STL usa **iteradores** para percorrer containers de forma uniforme. Um iterador é como um ponteiro que aponta para um elemento; `begin()` dá o primeiro e `end()` marca o fim. Com `auto`, o código fica curto.\n\n```\nfor (auto it = numeros.begin(); it != numeros.end(); ++it) {\n    std::cout << *it << \" \";   // desreferencia como um ponteiro\n}\n```\n\nNa maioria dos casos, porém, o range-based for (`for (auto x : numeros)`) é mais simples e faz o mesmo, escondendo o iterador.",
                },
                {
                    type: "quote",
                    value: "std::map associa chaves a valores; std::set guarda apenas elementos únicos. Iteradores percorrem qualquer container de forma uniforme, e o range-based for os esconde.",
                },
            ],
            questions: [
                {
                    statement: "O que o std::map guarda?",
                    difficulty: "facil",
                    options: [
                        { text: "Pares de chave e valor, como um dicionário", isCorrect: true },
                        { text: "Apenas valores únicos, sem chaves", isCorrect: false },
                        { text: "Uma sequência acessada só por índice", isCorrect: false },
                        { text: "Um único valor por vez", isCorrect: false },
                    ],
                },
                {
                    statement: "O que distingue um std::set de um std::vector?",
                    difficulty: "medio",
                    options: [
                        { text: "O set guarda apenas elementos únicos, sem duplicatas", isCorrect: true },
                        { text: "O set associa chaves a valores como um dicionário", isCorrect: false },
                        { text: "O set tem tamanho fixo definido na criação", isCorrect: false },
                        { text: "O set só guarda valores do tipo int", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um iterador da STL representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Algo como um ponteiro que aponta para um elemento do container", isCorrect: true },
                        { text: "O número total de elementos guardados no container", isCorrect: false },
                        { text: "Uma cópia completa e independente do container", isCorrect: false },
                        { text: "O tipo dos elementos que o container guarda", isCorrect: false },
                    ],
                },
                {
                    statement: "No uso de iteradores, o que `begin()` e `end()` indicam?",
                    difficulty: "medio",
                    options: [
                        { text: "begin() aponta o primeiro elemento e end() marca o fim", isCorrect: true },
                        { text: "begin() conta todos os elementos e end() apaga cada um deles", isCorrect: false },
                        { text: "Os dois apontam sempre para o mesmo elemento", isCorrect: false },
                        { text: "begin() abre e end() fecha um arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "No tipo `std::map<std::string, int>`, o que são a `std::string` e o `int`?",
                    difficulty: "dificil",
                    options: [
                        { text: "O tipo do valor e o tipo da chave, nessa ordem", isCorrect: false },
                        { text: "Dois valores diferentes guardados juntos", isCorrect: false },
                        { text: "O nome e o tamanho do map", isCorrect: false },
                        { text: "O tipo da chave e o tipo do valor", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Templates: código genérico",
            blocks: [
                {
                    type: "text",
                    value: "# O que há por trás de vector<int>\n\n**Templates** permitem escrever código que funciona com qualquer tipo, definido por quem usa. É o que sustenta a STL: um único `std::vector` funciona com `int`, `std::string` ou qualquer tipo, porque ele é um **template de classe**.\n\nVocê também pode escrever seus próprios templates. Um **template de função** generaliza uma função para vários tipos:\n\n```\ntemplate <typename T>\nT maximo(T a, T b) {\n    return (a > b) ? a : b;\n}\n\nmaximo(3, 7);        // usa int\nmaximo(2.5, 1.5);    // usa double\n```",
                },
                {
                    type: "text",
                    value: "## Resolvido em tempo de compilação\n\nA mágica dos templates acontece na **compilação**: para cada tipo que você usa, o compilador gera uma versão especializada do código. Isso mantém o desempenho de código escrito à mão para cada tipo, sem você repetir nada, e mantém a segurança de tipos, pois tudo é verificado antes de rodar.\n\nTemplates são um dos recursos mais poderosos do C++ e a razão de a STL ser genérica e eficiente ao mesmo tempo.",
                },
                {
                    type: "quote",
                    value: "Templates escrevem código genérico para qualquer tipo, resolvido em tempo de compilação. É o que faz o std::vector funcionar com qualquer tipo sem perder desempenho.",
                },
            ],
            questions: [
                {
                    statement: "O que os templates permitem em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Escrever código que funciona com qualquer tipo escolhido", isCorrect: true },
                        { text: "Executar código sem precisar compilar o programa antes", isCorrect: false },
                        { text: "Misturar tipos diferentes em um mesmo container", isCorrect: false },
                        { text: "Alocar memória sem precisar usar ponteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o código de um template é especializado para cada tipo usado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Em tempo de compilação, gerando uma versão por tipo", isCorrect: true },
                        { text: "Em tempo de execução, a cada chamada", isCorrect: false },
                        { text: "Nunca, pois templates não geram código", isCorrect: false },
                        { text: "Somente quando o programa é encerrado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual recurso do C++ torna o std::vector capaz de guardar qualquer tipo?",
                    difficulty: "facil",
                    options: [
                        { text: "Os templates", isCorrect: true },
                        { text: "Os ponteiros", isCorrect: false },
                        { text: "Os destrutores", isCorrect: false },
                        { text: "As referências const", isCorrect: false },
                    ],
                },
                {
                    statement: "Na função `template <typename T> T maximo(T a, T b)`, o que o `T` representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um valor inteiro fixo que é sempre passado como argumento à função", isCorrect: false },
                        { text: "Um tipo qualquer, definido por quem chama a função", isCorrect: true },
                        { text: "O nome da função que será gerada depois", isCorrect: false },
                        { text: "Uma variável global do programa inteiro", isCorrect: false },
                    ],
                },
                {
                    statement: "Além do desempenho, o que os templates preservam por serem resolvidos na compilação?",
                    difficulty: "dificil",
                    options: [
                        { text: "A capacidade de misturar vários tipos juntos", isCorrect: false },
                        { text: "A liberação automática de toda a memória que foi usada", isCorrect: false },
                        { text: "A execução do código mesmo sem compilar antes", isCorrect: false },
                        { text: "A segurança de tipos, verificada antes de rodar", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

const MODULO_9: Modulo = {
    titulo: "Módulo 9 - C++ moderno: smart pointers e lambdas",
    aulas: [
        {
            titulo: "Smart pointers: memória sem vazamentos",
            blocks: [
                {
                    type: "text",
                    value: "# O fim do new e delete manuais\n\nVocê viu que `new` e `delete` manuais são perigosos: é fácil esquecer o `delete` (vazamento) ou usar um ponteiro após liberá-lo (ponteiro pendente). Os **smart pointers**, da biblioteca `<memory>`, resolvem isso aplicando RAII: eles são objetos que gerenciam um ponteiro e liberam a memória sozinhos quando saem de escopo.",
                },
                {
                    type: "text",
                    value: "## unique_ptr e shared_ptr\n\n**std::unique_ptr** representa posse exclusiva: só um smart pointer é dono do recurso, e ele o libera automaticamente ao ser destruído. Crie com `std::make_unique`.\n\n```\n#include <memory>\n\nauto p = std::make_unique<int>(42);\nstd::cout << *p << std::endl;   // 42\n// sem delete: a memória é liberada sozinha ao fim do escopo\n```\n\n**std::shared_ptr** permite posse compartilhada: vários deles podem apontar para o mesmo recurso, que é liberado quando o último some (contagem de referências). Use quando a propriedade é realmente compartilhada.",
                },
                {
                    type: "quote",
                    value: "Smart pointers aplicam RAII: liberam a memória sozinhos. unique_ptr é dono exclusivo; shared_ptr é posse compartilhada com contagem de referências. Prefira-os a new e delete crus.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a principal vantagem dos smart pointers?",
                    difficulty: "medio",
                    options: [
                        { text: "Liberam a memória sozinhos ao sair de escopo, por RAII", isCorrect: true },
                        { text: "Deixam o programa mais lento, porém mais legível", isCorrect: false },
                        { text: "Permitem misturar vários tipos em um mesmo ponteiro", isCorrect: false },
                        { text: "Dispensam a inclusão de qualquer biblioteca externa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o std::unique_ptr representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Posse exclusiva: só ele é dono do recurso", isCorrect: true },
                        { text: "Posse compartilhada entre vários ponteiros", isCorrect: false },
                        { text: "Um ponteiro que nunca libera a memória", isCorrect: false },
                        { text: "Um array de tamanho fixo na stack", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o recurso de um std::shared_ptr é liberado?",
                    difficulty: "dificil",
                    options: [
                        { text: "Quando o último shared_ptr que o aponta é destruído", isCorrect: true },
                        { text: "Imediatamente após a primeira cópia do ponteiro", isCorrect: false },
                        { text: "Apenas quando o programa inteiro termina", isCorrect: false },
                        { text: "Nunca, pois shared_ptr não libera memória", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se cria um `std::unique_ptr` no C++ moderno?",
                    difficulty: "medio",
                    options: [
                        { text: "Com `new` seguido de `delete`", isCorrect: false },
                        { text: "Com `std::make_unique`", isCorrect: true },
                        { text: "Com `std::make_shared`", isCorrect: false },
                        { text: "Com `malloc` da linguagem C", isCorrect: false },
                    ],
                },
                {
                    statement: "Como o `std::shared_ptr` sabe a hora de liberar o recurso?",
                    difficulty: "dificil",
                    options: [
                        { text: "Por contagem de referências, quando a última some", isCorrect: true },
                        { text: "Ao terminar a primeira função que o utiliza no código", isCorrect: false },
                        { text: "Assim que qualquer cópia dele é criada em memória", isCorrect: false },
                        { text: "Somente ao encerrar todo o programa", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Lambdas e auto no C++ moderno",
            blocks: [
                {
                    type: "text",
                    value: "# Funções anônimas com lambdas\n\nDesde o C++11, uma **lambda** é uma função anônima escrita na hora, ótima para passar um comportamento curto a um algoritmo. A forma básica é `[captura](parâmetros) { corpo }`.\n\n```\nauto dobro = [](int x) { return x * 2; };\nstd::cout << dobro(5) << std::endl;   // 10\n```\n\nA lista de **captura** `[ ]` diz quais variáveis do entorno a lambda pode usar: `[x]` captura por cópia, `[&x]` por referência.",
                },
                {
                    type: "text",
                    value: "## Combinando com a STL\n\nLambdas brilham com os algoritmos da STL. Por exemplo, ordenar um vetor por um critério próprio fica em uma linha, passando uma lambda de comparação. Junto com `auto` e o range-based for, o C++ moderno fica bem mais enxuto do que o clássico.\n\nUma pincelada em um recurso avançado: o C++ moderno também tem **semântica de movimento** (move semantics), com `std::move`, que permite **transferir** recursos de um objeto para outro em vez de copiá-los, ganhando desempenho ao lidar com objetos grandes. É um tema para aprofundar depois destes fundamentos.",
                },
                {
                    type: "quote",
                    value: "Uma lambda é uma função anônima na forma [captura](params){ corpo }, ótima com algoritmos da STL. auto e o range-based for completam o estilo enxuto do C++ moderno.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma lambda em C++?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma função anônima na forma [captura](params){ corpo }", isCorrect: true },
                        { text: "Um tipo primitivo especial para guardar funções", isCorrect: false },
                        { text: "Uma classe abstrata que não tem construtor", isCorrect: false },
                        { text: "Um container de dados da biblioteca padrão", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a lista de captura [ ] de uma lambda?",
                    difficulty: "dificil",
                    options: [
                        { text: "Dizer quais variáveis do entorno a lambda pode usar", isCorrect: true },
                        { text: "Declarar o tipo de retorno da lambda", isCorrect: false },
                        { text: "Listar os parâmetros que a lambda recebe", isCorrect: false },
                        { text: "Definir o nome da lambda no programa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a semântica de movimento (std::move) permite no C++ moderno?",
                    difficulty: "dificil",
                    options: [
                        { text: "Transferir recursos de um objeto para outro em vez de copiá-los", isCorrect: true },
                        { text: "Mover um arquivo de uma pasta para outra no disco", isCorrect: false },
                        { text: "Reposicionar elementos na tela do programa", isCorrect: false },
                        { text: "Alterar o endereço físico de uma variável", isCorrect: false },
                    ],
                },
                {
                    statement: "Nas listas de captura de uma lambda, qual é a diferença entre `[x]` e `[&x]`?",
                    difficulty: "dificil",
                    options: [
                        { text: "`[x]` captura por referência e `[&x]` captura por cópia", isCorrect: false },
                        { text: "`[x]` captura por cópia e `[&x]`, por referência", isCorrect: true },
                        { text: "As duas capturam sempre por cópia", isCorrect: false },
                        { text: "Nenhuma das duas captura variáveis", isCorrect: false },
                    ],
                },
                {
                    statement: "Dada `auto dobro = [](int x) { return x * 2; };`, quanto vale `dobro(5)`?",
                    difficulty: "medio",
                    options: [
                        { text: "5", isCorrect: false },
                        { text: "25", isCorrect: false },
                        { text: "10", isCorrect: true },
                        { text: "7", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: revisão e próximos passos",
            blocks: [
                {
                    type: "text",
                    value: "# O que você percorreu\n\nVocê foi do zero ao C++ moderno:\n\n- **Fundamentos**: a linguagem compilada e de alto desempenho, o primeiro programa, iostream e namespaces.\n- **Tipos e fluxo**: variáveis, auto e const, if e switch com break, os laços e o range-based for.\n- **Funções**: passagem por valor, por referência e por referência const, sobrecarga e argumentos padrão.\n- **Memória**: ponteiros, stack e heap, new e delete, e os perigos de vazamentos e ponteiros pendentes.\n- **Classes**: encapsulamento, construtores e destrutores, e o RAII, o padrão que define o C++.\n- **Herança e polimorfismo**: funções virtuais, classes abstratas e o destrutor virtual.\n- **STL e templates**: vector, map, set, iteradores e o código genérico dos templates.\n- **C++ moderno**: smart pointers, lambdas e uma noção de semântica de movimento.",
                },
                {
                    type: "text",
                    value: "## Como continuar evoluindo\n\nC++ é uma linguagem grande, e se aprende com prática constante. Refaça os exemplos, quebre-os e conserte, e construa pequenos programas: uma agenda com classes e um vector, uma calculadora, uma pequena hierarquia de formas com funções virtuais. A cada projeto, um conceito vira ferramenta.\n\nDepois destes fundamentos, os caminhos naturais incluem aprofundar na STL e nos algoritmos, dominar a semântica de movimento e as referências rvalue, e explorar áreas como jogos, sistemas ou programação de alto desempenho, onde o C++ é forte. Escolha o que combina com o seu objetivo e siga praticando, sempre atento à gestão de memória, o traço que mais distingue o C++.",
                },
                {
                    type: "quote",
                    value: "Você foi do primeiro programa aos smart pointers. O próximo passo é escrever muito C++: transforme cada conceito em pequenos projetos, sempre atento à memória.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a melhor forma de fixar o que você aprendeu de C++?",
                    difficulty: "facil",
                    options: [
                        { text: "Escrever código: refazer exemplos e construir pequenos projetos", isCorrect: true },
                        { text: "Apenas reler a teoria, sem nunca programar de fato", isCorrect: false },
                        { text: "Decorar a sintaxe sem entender os conceitos por trás", isCorrect: false },
                        { text: "Pular a prática e ir direto aos temas mais avançados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual traço mais distingue o C++ de linguagens com coletor de lixo?",
                    difficulty: "medio",
                    options: [
                        { text: "O controle direto e a responsabilidade sobre a memória", isCorrect: true },
                        { text: "A ausência total de tipos nas variáveis", isCorrect: false },
                        { text: "A impossibilidade de criar classes", isCorrect: false },
                        { text: "A execução sobre uma máquina virtual", isCorrect: false },
                    ],
                },
                {
                    statement: "Preferir smart pointers a new e delete manuais é importante porque:",
                    difficulty: "medio",
                    options: [
                        { text: "Eles liberam a memória sozinhos, evitando vazamentos por RAII", isCorrect: true },
                        { text: "Eles tornam o programa incapaz de usar memória", isCorrect: false },
                        { text: "Eles são a única forma de declarar ponteiros", isCorrect: false },
                        { text: "Eles substituem a necessidade de escrever classes", isCorrect: false },
                    ],
                },
                {
                    statement: "Segundo a revisão, qual padrão é descrito como o que define o C++?",
                    difficulty: "medio",
                    options: [
                        { text: "A sobrecarga de funções", isCorrect: false },
                        { text: "A passagem de argumentos por valor", isCorrect: false },
                        { text: "O RAII", isCorrect: true },
                        { text: "O range-based for dos laços", isCorrect: false },
                    ],
                },
                {
                    statement: "Entre os caminhos sugeridos para continuar depois dos fundamentos, está:",
                    difficulty: "dificil",
                    options: [
                        { text: "Dominar a semântica de movimento e as referências rvalue", isCorrect: true },
                        { text: "Abandonar de vez qualquer uso de ponteiros", isCorrect: false },
                        { text: "Passar a programar apenas sobre máquinas virtuais dedicadas", isCorrect: false },
                        { text: "Trocar o C++ por uma linguagem interpretada", isCorrect: false },
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
    MODULO_8,
    MODULO_9,
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
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
        "Seed concluído: " + MODULOS.length + " módulos, " + totalAulas + " aulas, " + totalQuestoes + " questões.",
    );
}

// Só semeia quando executado direto. Se for importado (ex.: sincronizar-questoes-trilha),
// expõe MODULOS/NOME sem rodar o seed nem chamar process.exit.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    seed()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error("Falha no seed:", e);
            process.exit(1);
        });
}
