// Seed da trilha Go / Golang (do básico ao avançado). Conteúdo autoral.
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-go.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

export const NOME = "Go";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A linguagem Go (Golang) do zero ao avançado: sintaxe e tipos, controle de fluxo, funções com múltiplos retornos, slices e maps, structs e métodos, interfaces implícitas, tratamento de erros e ponteiros, e a concorrência com goroutines e channels. A linguagem por trás de Docker, Kubernetes e serviços de nuvem de grande escala.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Primeiros passos com Go",
    aulas: [
        {
            titulo: "O que é Go e por que ele existe",
            blocks: [
                {
                    type: "text",
                    value: "# O que é Go\n\nGo, também chamada de Golang, é uma linguagem de programação criada no Google e lançada em 2009. Ela nasceu para resolver um problema prático: escrever software de servidor que fosse rápido de compilar, simples de ler e feito para concorrência, sem a complexidade de outras linguagens de sistema.\n\nGo é **compilada**, **estaticamente tipada** e gera um único executável independente, sem precisar de uma máquina virtual. É a linguagem por trás de ferramentas como Docker e Kubernetes, e muito usada em back-ends, APIs e infraestrutura de nuvem.",
                },
                {
                    type: "text",
                    value: "## O que torna o Go diferente\n\nAlgumas escolhas de projeto definem o Go e vão aparecer ao longo da trilha:\n\n- **Simplicidade proposital**: a linguagem tem poucas palavras-chave e evita recursos que geram código confuso. O objetivo é que qualquer pessoa da equipe leia o código com facilidade.\n- **Compilação rápida** para um binário único, o que simplifica a distribuição.\n- **Concorrência embutida**: goroutines e channels tornam natural escrever programas que fazem várias coisas ao mesmo tempo.\n- **Formatação padronizada**: a ferramenta `gofmt` formata o código de um jeito só, encerrando discussões de estilo.",
                },
                {
                    type: "quote",
                    value: "Go é compilada, tipada estaticamente e gera um binário único, sem máquina virtual. Foi feita para ser simples de ler e boa em concorrência.",
                },
            ],
            questions: [
                {
                    statement: "Como um programa Go é executado, quanto à compilação?",
                    difficulty: "facil",
                    options: [
                        { text: "É compilado para um executável independente, sem máquina virtual", isCorrect: true },
                        { text: "É interpretado linha a linha em tempo de execução", isCorrect: false },
                        { text: "Precisa de uma máquina virtual para rodar o bytecode", isCorrect: false },
                        { text: "Só roda dentro de um navegador de internet", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é uma característica de projeto marcante da linguagem Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Simplicidade proposital, com poucas palavras-chave", isCorrect: true },
                        { text: "Uma sintaxe cheia de recursos complexos e implícitos", isCorrect: false },
                        { text: "A ausência total de verificação de tipos", isCorrect: false },
                        { text: "A dependência de uma máquina virtual pesada", isCorrect: false },
                    ],
                },
                {
                    statement: "Ferramentas amplamente conhecidas escritas em Go incluem:",
                    difficulty: "medio",
                    options: [
                        { text: "Docker e Kubernetes", isCorrect: true },
                        { text: "Apenas planilhas de escritório", isCorrect: false },
                        { text: "Somente jogos para consoles antigos", isCorrect: false },
                        { text: "Exclusivamente editores de imagem", isCorrect: false },
                    ],
                },
                {
                    statement: "Por quem e em que ano a linguagem Go foi criada?",
                    difficulty: "medio",
                    options: [
                        { text: "No Google, lançada em 2009", isCorrect: true },
                        { text: "Na Microsoft, lançada em 2001", isCorrect: false },
                        { text: "Na Sun Microsystems, nos anos 90", isCorrect: false },
                        { text: "Na Apple, lançada em 2014", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o papel da ferramenta gofmt no dia a dia?",
                    difficulty: "medio",
                    options: [
                        { text: "Traduzir o código Go para a linguagem C", isCorrect: false },
                        { text: "Detectar todos os bugs lógicos do programa", isCorrect: false },
                        { text: "Padronizar a formatação do código automaticamente", isCorrect: true },
                        { text: "Gerenciar as versões das bibliotecas externas do projeto", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Seu primeiro programa: hello world",
            blocks: [
                {
                    type: "text",
                    value: "# O primeiro programa\n\nTodo programa Go executável começa no pacote `main` e na função `main`. O programa abaixo, salvo em um arquivo `ola.go`, imprime uma mensagem.",
                },
                {
                    type: "code",
                    value: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Olá, mundo!\")\n}",
                },
                {
                    type: "text",
                    value: "## Rodar e compilar\n\nGo oferece dois comandos principais:\n\n- `go run ola.go` compila e executa de uma vez, ótimo para experimentar.\n- `go build ola.go` gera o executável (`ola`), que você roda depois de forma independente.\n\n```\ngo run ola.go     # imprime: Olá, mundo!\ngo build ola.go   # gera o binário ola\n```",
                },
                {
                    type: "text",
                    value: "## As partes do programa\n\n- **package main**: define o pacote. Um programa executável precisa ser o pacote `main`.\n- **import \"fmt\"**: importa o pacote padrão `fmt`, que cuida de entrada e saída formatada.\n- **func main()**: a função por onde a execução começa.\n- **fmt.Println(...)**: imprime o argumento e pula uma linha. Repare que Go não usa ponto e vírgula ao fim das linhas; a ferramenta cuida disso.",
                },
            ],
            questions: [
                {
                    statement: "Em qual pacote e função a execução de um programa Go executável começa?",
                    difficulty: "facil",
                    options: [
                        { text: "No pacote main, na função main", isCorrect: true },
                        { text: "No pacote fmt, na função Println", isCorrect: false },
                        { text: "Em qualquer pacote, na primeira linha do arquivo", isCorrect: false },
                        { text: "No pacote start, na função run", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o comando 'go run ola.go' faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Compila e executa o programa de uma vez", isCorrect: true },
                        { text: "Apenas gera o executável, sem rodá-lo", isCorrect: false },
                        { text: "Formata o código sem executar nada", isCorrect: false },
                        { text: "Baixa dependências sem compilar o código", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a linha 'import \"fmt\"' no programa?",
                    difficulty: "medio",
                    options: [
                        { text: "Importar o pacote padrão de entrada e saída formatada", isCorrect: true },
                        { text: "Declarar a função principal do programa", isCorrect: false },
                        { text: "Definir o nome do pacote atual", isCorrect: false },
                        { text: "Compilar o programa em um executável", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o comando 'go build ola.go' faz?",
                    difficulty: "medio",
                    options: [
                        { text: "Gera o executável, que você roda depois", isCorrect: true },
                        { text: "Compila e já executa o programa na hora", isCorrect: false },
                        { text: "Formata o arquivo de código automaticamente", isCorrect: false },
                        { text: "Apaga o executável criado anteriormente", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre o ponto e vírgula ao fim das linhas em Go, o que é correto?",
                    difficulty: "medio",
                    options: [
                        { text: "É obrigatório ao fim de toda e qualquer instrução", isCorrect: false },
                        { text: "Não é necessário; a ferramenta cuida disso", isCorrect: true },
                        { text: "Só é exigido dentro da função main", isCorrect: false },
                        { text: "Serve para separar os imports entre si", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Pacotes, imports e nomes exportados",
            blocks: [
                {
                    type: "text",
                    value: "# Tudo vive em pacotes\n\nEm Go, o código é organizado em **pacotes**. Cada arquivo começa declarando a que pacote pertence. O pacote `main` produz um executável; qualquer outro nome produz uma biblioteca, feita para ser importada por outros.\n\nA biblioteca padrão traz muitos pacotes prontos: `fmt` (formatação), `strings` (texto), `math` (matemática), `os` (sistema operacional), entre outros.",
                },
                {
                    type: "text",
                    value: "## Maiúscula exporta, minúscula esconde\n\nGo tem uma regra simples e marcante para visibilidade: um nome que começa com **letra maiúscula é exportado**, ou seja, visível de fora do pacote; um nome que começa com **letra minúscula é privado** ao pacote. Não existem palavras como `public` ou `private`: a inicial do nome decide.\n\nPor isso é `fmt.Println` (com P maiúsculo): `Println` é exportado pelo pacote `fmt`.",
                },
                {
                    type: "code",
                    value: "package contas\n\n// Exportado: visível de fora (começa com maiúscula)\nfunc Somar(a, b int) int {\n    return a + b\n}\n\n// Privado: só dentro do pacote contas (começa com minúscula)\nfunc validar(x int) bool {\n    return x >= 0\n}",
                },
                {
                    type: "quote",
                    value: "Em Go, nome com inicial maiúscula é exportado (visível de fora do pacote); com inicial minúscula é privado. A inicial substitui public e private.",
                },
            ],
            questions: [
                {
                    statement: "Em Go, o que determina se um nome é visível de fora do seu pacote?",
                    difficulty: "medio",
                    options: [
                        { text: "A inicial: maiúscula exporta, minúscula é privada", isCorrect: true },
                        { text: "Uma palavra-chave public escrita antes do nome", isCorrect: false },
                        { text: "A ordem em que o nome aparece no arquivo", isCorrect: false },
                        { text: "O tamanho do nome escolhido para o item", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual pacote um programa executável em Go precisa declarar?",
                    difficulty: "facil",
                    options: [
                        { text: "O pacote main", isCorrect: true },
                        { text: "O pacote fmt", isCorrect: false },
                        { text: "O pacote build", isCorrect: false },
                        { text: "O pacote exec", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a função de impressão se escreve 'fmt.Println', com P maiúsculo?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque Println é exportado pelo pacote fmt", isCorrect: true },
                        { text: "Porque toda função em Go começa com maiúscula", isCorrect: false },
                        { text: "Porque a maiúscula acelera a execução da função", isCorrect: false },
                        { text: "Porque Println é uma palavra reservada da linguagem", isCorrect: false },
                    ],
                },
                {
                    statement: "Um pacote com nome diferente de main produz o quê?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma biblioteca, feita para ser importada", isCorrect: true },
                        { text: "Um executável pronto para rodar sozinho no sistema", isCorrect: false },
                        { text: "Um erro, pois todo pacote deve ser main", isCorrect: false },
                        { text: "Um arquivo de configuração do projeto", isCorrect: false },
                    ],
                },
                {
                    statement: "A função validar do exemplo, com inicial minúscula, pode ser usada onde?",
                    difficulty: "dificil",
                    options: [
                        { text: "Por qualquer pacote que a importe", isCorrect: false },
                        { text: "Apenas pelo pacote main do programa", isCorrect: false },
                        { text: "Só dentro do próprio pacote onde vive", isCorrect: true },
                        { text: "De qualquer lugar, como toda função em Go", isCorrect: false },
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
            titulo: "Variáveis: var, := e zero values",
            blocks: [
                {
                    type: "text",
                    value: "# Declarando variáveis\n\nGo tem duas formas de declarar uma variável. A completa usa `var`, com tipo opcional se houver valor inicial:\n\n```\nvar idade int = 30\nvar nome = \"Ana\"   // tipo inferido: string\n```\n\nDentro de funções, a forma curta com `:=` é a mais comum. Ela declara e infere o tipo de uma vez, sem escrever `var`:\n\n```\nidade := 30       // int\npreco := 19.90    // float64\nativo := true     // bool\n```",
                },
                {
                    type: "text",
                    value: "## Zero values: nada de lixo\n\nEm Go, toda variável declarada sem valor recebe o **zero value** do seu tipo, nunca um valor indefinido. Isso evita a categoria de bugs de \"variável não inicializada\".\n\n- Números: `0`\n- Strings: `\"\"` (string vazia)\n- Booleanos: `false`\n- Ponteiros, slices e maps: `nil`\n\n```\nvar contador int      // 0\nvar mensagem string   // \"\"\nvar pronto bool       // false\n```",
                },
                {
                    type: "text",
                    value: "## Go é rigoroso: variável não usada é erro\n\nUm ponto que surpreende quem vem de outras linguagens: em Go, uma variável declarada e **não usada** causa erro de compilação, não apenas um aviso. O mesmo vale para imports não usados. É uma escolha proposital para manter o código limpo, mas exige atenção no começo.",
                },
                {
                    type: "quote",
                    value: "Use := para declarar e inferir o tipo dentro de funções. Variáveis sem valor recebem o zero value (0, \"\", false, nil), e variável não usada é erro de compilação.",
                },
            ],
            questions: [
                {
                    statement: "O que a forma curta ':=' faz em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Declara a variável e infere o seu tipo de uma vez", isCorrect: true },
                        { text: "Compara dois valores e devolve um booleano", isCorrect: false },
                        { text: "Apenas atribui um valor a uma variável já existente", isCorrect: false },
                        { text: "Define uma constante que não pode mudar", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o zero value de uma variável string declarada sem valor?",
                    difficulty: "facil",
                    options: [
                        { text: "A string vazia \"\"", isCorrect: true },
                        { text: "O valor nil", isCorrect: false },
                        { text: "O valor null", isCorrect: false },
                        { text: "O número zero", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece em Go se você declara uma variável e não a utiliza?",
                    difficulty: "medio",
                    options: [
                        { text: "Ocorre um erro de compilação", isCorrect: true },
                        { text: "O programa compila e roda sem qualquer aviso", isCorrect: false },
                        { text: "A variável é apagada em tempo de execução", isCorrect: false },
                        { text: "O compilador troca a variável por outra automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o zero value de um slice, um map ou um ponteiro declarados sem valor?",
                    difficulty: "dificil",
                    options: [
                        { text: "nil", isCorrect: true },
                        { text: "0", isCorrect: false },
                        { text: "Uma string vazia", isCorrect: false },
                        { text: "false", isCorrect: false },
                    ],
                },
                {
                    statement: "Além de variáveis não usadas, o que mais causa erro de compilação em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Usar a forma := dentro de uma função", isCorrect: false },
                        { text: "Declarar uma variável usando var", isCorrect: false },
                        { text: "Um import declarado e não utilizado", isCorrect: true },
                        { text: "Deixar uma variável receber o zero value", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Tipos básicos e constantes",
            blocks: [
                {
                    type: "text",
                    value: "# Os tipos que você mais usa\n\nGo é estaticamente tipado. Os tipos básicos do dia a dia:\n\n- **int**: números inteiros (o tamanho depende da plataforma; há também int32, int64).\n- **float64**: números com casas decimais (o padrão para reais).\n- **string**: texto, entre aspas duplas.\n- **bool**: `true` ou `false`.\n\nHá ainda `byte` (um apelido para uint8) e `rune` (um apelido para int32, que representa um caractere Unicode).",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Guarda\", \"Exemplo\"], [\"int\", \"Número inteiro\", \"n := 10\"], [\"float64\", \"Número com decimais\", \"x := 2.5\"], [\"string\", \"Texto\", \"s := \\\"oi\\\"\"], [\"bool\", \"Verdadeiro ou falso\", \"ok := true\"]]",
                },
                {
                    type: "text",
                    value: "## Conversão explícita\n\nGo não converte tipos numéricos automaticamente, nem entre int e float64. Você precisa converter de forma explícita, escrevendo o tipo como uma função:\n\n```\ni := 10\nf := float64(i)   // converte int para float64\nn := int(3.9)     // converte float para int: 3 (trunca)\n```\n\nEssa rigidez evita conversões silenciosas que escondem bugs.",
                },
                {
                    type: "text",
                    value: "## Constantes\n\nUse `const` para valores que não mudam. Constantes são resolvidas em tempo de compilação e não podem receber o resultado de algo que só se conhece ao rodar.\n\n```\nconst Pi = 3.14159\nconst MaxTentativas = 3\n```",
                },
                {
                    type: "quote",
                    value: "Go não converte números automaticamente: use float64(i) ou int(x) de forma explícita. Valores fixos vão em const.",
                },
            ],
            questions: [
                {
                    statement: "Qual tipo é o padrão para números com casas decimais em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "float64", isCorrect: true },
                        { text: "int", isCorrect: false },
                        { text: "double", isCorrect: false },
                        { text: "decimal", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se converte um int chamado i para float64 em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "float64(i)", isCorrect: true },
                        { text: "(float64) i", isCorrect: false },
                        { text: "i.toFloat64()", isCorrect: false },
                        { text: "i as float64", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre a conversão entre int e float64 em Go, o que é verdade?",
                    difficulty: "medio",
                    options: [
                        { text: "É preciso convertê-los de forma explícita, pois não é automática", isCorrect: true },
                        { text: "O Go converte um no outro automaticamente quando preciso", isCorrect: false },
                        { text: "É impossível converter um int em float64 em Go", isCorrect: false },
                        { text: "int e float64 são exatamente o mesmo tipo em Go", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o tipo rune representa em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Um caractere Unicode, apelido de int32", isCorrect: true },
                        { text: "Um número decimal de altíssima precisão", isCorrect: false },
                        { text: "Uma cadeia de vários caracteres de texto", isCorrect: false },
                        { text: "Um valor booleano guardado em um só bit", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o resultado de int(3.9) em Go?",
                    difficulty: "dificil",
                    options: [
                        { text: "4, pois arredonda para cima sempre", isCorrect: false },
                        { text: "3, pois trunca a parte decimal", isCorrect: true },
                        { text: "3.9, mantendo o valor original", isCorrect: false },
                        { text: "Um erro de conversão inválida", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Operadores e a impressão formatada",
            blocks: [
                {
                    type: "text",
                    value: "# Operadores\n\nGo tem os operadores esperados:\n\n- Aritméticos: `+`, `-`, `*`, `/`, `%` (resto).\n- Relacionais: `==`, `!=`, `>`, `<`, `>=`, `<=`, que resultam em bool.\n- Lógicos: `&&` (E), `||` (OU), `!` (NÃO).\n\nAssim como em outras linguagens, dividir dois inteiros dá um inteiro: `7 / 2` é `3`. Para incrementar, Go usa `i++` e `i--`, mas atenção: em Go isso é uma instrução, não uma expressão, então você não escreve `x := i++`.",
                },
                {
                    type: "code",
                    value: "a := 17\nb := 5\nfmt.Println(a + b)   // 22\nfmt.Println(a % b)   // 2\nfmt.Println(a >= b)  // true",
                },
                {
                    type: "text",
                    value: "## Println e Printf\n\nO pacote `fmt` tem duas formas comuns de imprimir. `Println` imprime os valores separados por espaço e pula uma linha. `Printf` usa uma string de formato com verbos como `%d` (inteiro), `%f` (float), `%s` (string) e `%v` (qualquer valor), sem pular linha (use `\\n` você mesmo).\n\n```\nnome := \"Ana\"\nidade := 30\nfmt.Printf(\"%s tem %d anos\\n\", nome, idade)   // Ana tem 30 anos\n```",
                },
                {
                    type: "quote",
                    value: "fmt.Println imprime valores separados por espaço e pula linha; fmt.Printf usa verbos de formato como %d, %s e %v.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o resultado de '7 / 2' com dois inteiros em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "3, pois a divisão de inteiros descarta a parte decimal", isCorrect: true },
                        { text: "3.5, pois o Go arredonda para o valor real", isCorrect: false },
                        { text: "4, pois o Go arredonda o resultado para cima", isCorrect: false },
                        { text: "Um erro, pois não se dividem inteiros em Go", isCorrect: false },
                    ],
                },
                {
                    statement: "No fmt.Printf, qual verbo é usado para um número inteiro?",
                    difficulty: "medio",
                    options: [
                        { text: "%d", isCorrect: true },
                        { text: "%s", isCorrect: false },
                        { text: "%f", isCorrect: false },
                        { text: "%b", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a diferença entre fmt.Println e fmt.Printf?",
                    difficulty: "medio",
                    options: [
                        { text: "Printf usa uma string de formato com verbos; Println não", isCorrect: true },
                        { text: "Println não existe no pacote fmt do Go", isCorrect: false },
                        { text: "Printf só imprime números, nunca textos", isCorrect: false },
                        { text: "Println exige uma string de formato obrigatória", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador % faz em Go, como em 'a % b'?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve o resto da divisão", isCorrect: true },
                        { text: "Calcula a porcentagem de a", isCorrect: false },
                        { text: "Eleva a à potência de b", isCorrect: false },
                        { text: "Divide a por b como decimal", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que a expressão 'x := i++' é inválida em Go?",
                    difficulty: "dificil",
                    options: [
                        { text: "Porque o Go não tem operador de incremento", isCorrect: false },
                        { text: "Porque só se pode incrementar dentro de um for", isCorrect: false },
                        { text: "Porque i++ só funciona com números decimais", isCorrect: false },
                        { text: "Porque i++ é uma instrução, não uma expressão", isCorrect: true },
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
                    value: "# O if em Go\n\nO `if` executa um bloco quando a condição é verdadeira. Diferente de C ou Java, a condição **não** fica entre parênteses, mas as chaves são obrigatórias, mesmo para uma linha.\n\n```\nidade := 20\nif idade >= 18 {\n    fmt.Println(\"Maior de idade\")\n} else {\n    fmt.Println(\"Menor de idade\")\n}\n```",
                },
                {
                    type: "text",
                    value: "## if com instrução de inicialização\n\nUm recurso idiomático do Go: o `if` pode ter uma pequena instrução antes da condição, separada por ponto e vírgula. A variável criada ali vale só dentro do if e do else. É muito usado com funções que retornam um valor e um erro.\n\n```\nif n := calcular(); n > 0 {\n    fmt.Println(\"positivo:\", n)\n}\n// n não existe mais aqui fora\n```",
                },
                {
                    type: "text",
                    value: "## O switch, sem fall-through\n\nO `switch` compara um valor com vários casos. A grande diferença do Go em relação a C e Java: **cada case não precisa de break**, pois não há fall-through automático. Assim que um case combina, ele executa e o switch termina. Se você quiser cair para o próximo case de propósito, usa a palavra `fallthrough`.\n\n```\nswitch dia {\ncase 1:\n    fmt.Println(\"Domingo\")\ncase 3:\n    fmt.Println(\"Terça\")   // executa e para; sem break\ndefault:\n    fmt.Println(\"Outro dia\")\n}\n```",
                },
                {
                    type: "quote",
                    value: "No if do Go a condição não usa parênteses. No switch, não há fall-through: cada case para sozinho, sem precisar de break.",
                },
            ],
            questions: [
                {
                    statement: "Sobre a condição de um if em Go, o que é correto?",
                    difficulty: "facil",
                    options: [
                        { text: "Não usa parênteses, e as chaves são obrigatórias", isCorrect: true },
                        { text: "Exige parênteses ao redor da condição", isCorrect: false },
                        { text: "Dispensa as chaves quando há só uma linha", isCorrect: false },
                        { text: "Só aceita comparações com números inteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "No switch do Go, o que acontece ao fim de um case que combinou?",
                    difficulty: "medio",
                    options: [
                        { text: "O switch termina, pois não há fall-through automático", isCorrect: true },
                        { text: "A execução cai no próximo case, como em C e Java", isCorrect: false },
                        { text: "É obrigatório escrever break para encerrar o case", isCorrect: false },
                        { text: "O default sempre executa logo depois do case", isCorrect: false },
                    ],
                },
                {
                    statement: "No 'if n := calcular(); n > 0 {', onde a variável n pode ser usada?",
                    difficulty: "dificil",
                    options: [
                        { text: "Apenas dentro do if e do else associado", isCorrect: true },
                        { text: "Em qualquer lugar do arquivo, sem restrição", isCorrect: false },
                        { text: "Somente depois que o if termina", isCorrect: false },
                        { text: "Em nenhum lugar, pois a sintaxe é inválida", isCorrect: false },
                    ],
                },
                {
                    statement: "No switch do Go, o que a palavra fallthrough faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Encerra o switch naquele ponto de imediato", isCorrect: false },
                        { text: "Faz a execução cair para o próximo case", isCorrect: true },
                        { text: "Repete o case atual mais uma vez", isCorrect: false },
                        { text: "Pula direto para o bloco default", isCorrect: false },
                    ],
                },
                {
                    statement: "No switch, quando o bloco default é executado?",
                    difficulty: "medio",
                    options: [
                        { text: "Sempre, antes de qualquer outro case", isCorrect: false },
                        { text: "Sempre, logo depois do primeiro case", isCorrect: false },
                        { text: "Nunca, pois é apenas decorativo", isCorrect: false },
                        { text: "Quando nenhum outro caso combina", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "O for: o único laço do Go",
            blocks: [
                {
                    type: "text",
                    value: "# Um laço para governar todos\n\nGo tem apenas uma palavra de laço: `for`. Não existem `while` nem `do-while`. Mas o `for` assume várias formas, cobrindo todos os casos.\n\nA forma clássica, com inicialização, condição e passo:\n\n```\nfor i := 0; i < 5; i++ {\n    fmt.Println(i)   // 0, 1, 2, 3, 4\n}\n```",
                },
                {
                    type: "text",
                    value: "## for como while\n\nCom apenas uma condição, o `for` funciona como um while:\n\n```\nn := 1\nfor n <= 3 {\n    fmt.Println(n)\n    n++\n}\n```\n\nE sem nenhuma condição, ele é um laço infinito, que você interrompe com `break`:\n\n```\nfor {\n    // roda para sempre até um break\n    break\n}\n```",
                },
                {
                    type: "quote",
                    value: "Go só tem for. Com três partes é o for clássico; com uma condição vira um while; sem nada é um laço infinito interrompido por break.",
                },
            ],
            questions: [
                {
                    statement: "Quantas palavras-chave de laço a linguagem Go tem?",
                    difficulty: "facil",
                    options: [
                        { text: "Apenas uma: for", isCorrect: true },
                        { text: "Três: for, while e do-while", isCorrect: false },
                        { text: "Duas: for e while", isCorrect: false },
                        { text: "Nenhuma, pois Go não tem laços", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se escreve o equivalente a um while em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Com um for seguido apenas de uma condição", isCorrect: true },
                        { text: "Com a palavra-chave while seguida da condição", isCorrect: false },
                        { text: "Com um do seguido de while ao final", isCorrect: false },
                        { text: "Com um loop seguido da condição entre parênteses", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'for { ... }' sem nenhuma condição representa?",
                    difficulty: "medio",
                    options: [
                        { text: "Um laço infinito, interrompido por um break", isCorrect: true },
                        { text: "Um erro de compilação, pois falta a condição", isCorrect: false },
                        { text: "Um laço que nunca executa o bloco interno", isCorrect: false },
                        { text: "Um laço que executa exatamente uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Na forma clássica 'for i := 0; i < 5; i++', quais são as três partes?",
                    difficulty: "medio",
                    options: [
                        { text: "Início, meio e fim do laço", isCorrect: false },
                        { text: "Inicialização, condição e passo", isCorrect: true },
                        { text: "Tipo, nome e valor da variável", isCorrect: false },
                        { text: "Condição, corpo e retorno do laço", isCorrect: false },
                    ],
                },
                {
                    statement: "O que interrompe um laço 'for { ... }' infinito?",
                    difficulty: "medio",
                    options: [
                        { text: "A instrução while", isCorrect: false },
                        { text: "A palavra loop", isCorrect: false },
                        { text: "A instrução break", isCorrect: true },
                        { text: "A instrução stop", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Percorrendo com range",
            blocks: [
                {
                    type: "text",
                    value: "# range: iterar de forma limpa\n\nPara percorrer os elementos de um slice, array, string ou map, o Go usa `for ... range`. A cada volta, o range devolve o **índice** e o **valor** do elemento.\n\n```\nnumeros := []int{10, 20, 30}\nfor i, v := range numeros {\n    fmt.Println(i, v)   // 0 10, depois 1 20, depois 2 30\n}\n```",
                },
                {
                    type: "text",
                    value: "## O identificador em branco _\n\nÀs vezes você só quer o valor, não o índice. Como o Go proíbe variáveis não usadas, descartar o índice com o **identificador em branco** `_` resolve. Ele diz \"recebo, mas ignoro\".\n\n```\nfor _, v := range numeros {\n    fmt.Println(v)   // só os valores: 10, 20, 30\n}\n```\n\nO `_` também serve para descartar qualquer retorno que você não vá usar, um padrão comum em Go.",
                },
                {
                    type: "quote",
                    value: "for ... range percorre e devolve índice e valor. Use o identificador em branco _ para descartar o que você não vai usar, evitando o erro de variável não usada.",
                },
            ],
            questions: [
                {
                    statement: "O que 'for i, v := range slice' devolve a cada volta?",
                    difficulty: "facil",
                    options: [
                        { text: "O índice e o valor do elemento atual", isCorrect: true },
                        { text: "Apenas o valor do elemento, sem o índice", isCorrect: false },
                        { text: "Apenas o índice do elemento, sem o valor", isCorrect: false },
                        { text: "O tamanho total do slice a cada volta", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o identificador em branco _ em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Descartar um valor que você recebe mas não vai usar", isCorrect: true },
                        { text: "Declarar uma constante global do programa", isCorrect: false },
                        { text: "Marcar o fim de um laço for", isCorrect: false },
                        { text: "Nomear a variável padrão de todo range", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que descartar o índice com _ é útil ao usar range em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque uma variável não usada causaria erro de compilação", isCorrect: true },
                        { text: "Porque o range não funciona sem o identificador _", isCorrect: false },
                        { text: "Porque o _ acelera a execução do laço", isCorrect: false },
                        { text: "Porque sem o _ o valor viria sempre vazio", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre quais tipos o for...range pode iterar, segundo a aula?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas slices de inteiros", isCorrect: false },
                        { text: "Somente maps com chave string", isCorrect: false },
                        { text: "Apenas strings e nada além", isCorrect: false },
                        { text: "Slice, array, string e map", isCorrect: true },
                    ],
                },
                {
                    statement: "Para pegar só o valor de cada elemento com range, como se escreve?",
                    difficulty: "dificil",
                    options: [
                        { text: "for v := range slice", isCorrect: false },
                        { text: "for _, v := range slice", isCorrect: true },
                        { text: "for v, _ := range slice", isCorrect: false },
                        { text: "for range slice", isCorrect: false },
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
            titulo: "Funções e múltiplos retornos",
            blocks: [
                {
                    type: "text",
                    value: "# Declarando funções\n\nUma função em Go começa com `func`, seguido do nome, dos parâmetros (com o tipo depois do nome) e do tipo de retorno.\n\n```\nfunc somar(a int, b int) int {\n    return a + b\n}\n\nfunc main() {\n    total := somar(3, 4)   // 7\n}\n```\n\nQuando parâmetros seguidos têm o mesmo tipo, você pode escrever o tipo uma vez só: `func somar(a, b int) int`.",
                },
                {
                    type: "text",
                    value: "## O grande diferencial: múltiplos retornos\n\nGo permite que uma função devolva **vários valores** de uma vez. Isso é usado o tempo todo, principalmente para retornar um resultado junto com um possível erro.\n\n```\nfunc dividir(a, b int) (int, int) {\n    return a / b, a % b   // quociente e resto\n}\n\nq, r := dividir(17, 5)   // q = 3, r = 2\n```\n\nEssa é a base do estilo idiomático de tratamento de erros do Go, que você verá adiante: `valor, err := fazerAlgo()`.",
                },
                {
                    type: "quote",
                    value: "Em Go, o tipo vem depois do nome do parâmetro, e uma função pode devolver vários valores de uma vez, o que sustenta o estilo valor, err := ...",
                },
            ],
            questions: [
                {
                    statement: "Em Go, onde fica o tipo de um parâmetro na declaração da função?",
                    difficulty: "facil",
                    options: [
                        { text: "Depois do nome do parâmetro", isCorrect: true },
                        { text: "Antes do nome do parâmetro", isCorrect: false },
                        { text: "Sempre entre colchetes no fim da função", isCorrect: false },
                        { text: "Não se declara tipo de parâmetro em Go", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é um diferencial marcante das funções em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Podem devolver vários valores de uma só vez", isCorrect: true },
                        { text: "Não podem receber nenhum parâmetro", isCorrect: false },
                        { text: "Só podem devolver valores do tipo string", isCorrect: false },
                        { text: "Nunca podem devolver nenhum valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O estilo idiomático 'valor, err := fazerAlgo()' depende de qual recurso do Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Do retorno de múltiplos valores por uma função", isCorrect: true },
                        { text: "Da conversão automática entre tipos numéricos", isCorrect: false },
                        { text: "Da ausência de tipos na linguagem", isCorrect: false },
                        { text: "Do fall-through automático do switch", isCorrect: false },
                    ],
                },
                {
                    statement: "Como escrever, de forma abreviada, dois parâmetros int seguidos?",
                    difficulty: "medio",
                    options: [
                        { text: "func somar(int a, int b)", isCorrect: false },
                        { text: "func somar(a: int, b: int)", isCorrect: false },
                        { text: "func somar(a, b int)", isCorrect: true },
                        { text: "func somar(a int, b)", isCorrect: false },
                    ],
                },
                {
                    statement: "No exemplo, o que a função 'dividir(a, b int) (int, int)' devolve?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o quociente da divisão inteira", isCorrect: false },
                        { text: "O quociente e o resto da divisão", isCorrect: true },
                        { text: "Apenas o resto da divisão inteira", isCorrect: false },
                        { text: "A soma e o produto entre a e b", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Retornos nomeados e funções variádicas",
            blocks: [
                {
                    type: "text",
                    value: "# Retornos com nome\n\nGo permite dar **nomes** aos valores de retorno na assinatura. Esses nomes viram variáveis já declaradas dentro da função, e um `return` sem argumentos devolve os valores atuais delas. Usado com moderação, deixa a intenção clara.\n\n```\nfunc dividir(a, b int) (quociente, resto int) {\n    quociente = a / b\n    resto = a % b\n    return   // devolve quociente e resto\n}\n```",
                },
                {
                    type: "text",
                    value: "## Funções variádicas\n\nUma função **variádica** aceita um número variável de argumentos do mesmo tipo, indicado com `...`. Dentro da função, esse parâmetro é tratado como um slice.\n\n```\nfunc somarTodos(numeros ...int) int {\n    total := 0\n    for _, n := range numeros {\n        total += n\n    }\n    return total\n}\n\nsomarTodos(1, 2, 3)      // 6\nsomarTodos(10, 20)       // 30\n```\n\nO próprio `fmt.Println` é variádico: por isso aceita quantos argumentos você quiser.",
                },
                {
                    type: "quote",
                    value: "Retornos nomeados viram variáveis prontas e permitem um return sem argumentos. Funções variádicas usam ... para aceitar vários argumentos, tratados como um slice.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma função variádica em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Aceita um número variável de argumentos, marcado com ...", isCorrect: true },
                        { text: "Devolve sempre vários valores de uma só vez", isCorrect: false },
                        { text: "Não pode receber nenhum argumento de entrada", isCorrect: false },
                        { text: "Muda de tipo de retorno a cada nova chamada", isCorrect: false },
                    ],
                },
                {
                    statement: "Dentro de uma função variádica, como é tratado o parâmetro com ...?",
                    difficulty: "medio",
                    options: [
                        { text: "Como um slice dos valores recebidos", isCorrect: true },
                        { text: "Como um único valor do primeiro argumento", isCorrect: false },
                        { text: "Como um map com chaves numéricas", isCorrect: false },
                        { text: "Como uma string com os valores juntos", isCorrect: false },
                    ],
                },
                {
                    statement: "Com retornos nomeados, o que um 'return' sem argumentos faz?",
                    difficulty: "dificil",
                    options: [
                        { text: "Devolve os valores atuais das variáveis de retorno nomeadas", isCorrect: true },
                        { text: "Devolve sempre os zero values dos tipos de retorno", isCorrect: false },
                        { text: "Causa um erro de compilação por falta de valores", isCorrect: false },
                        { text: "Encerra o programa inteiro imediatamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que o fmt.Println aceita quantos argumentos você quiser?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque converte tudo em uma só string antes", isCorrect: false },
                        { text: "Porque só aceita um argumento por vez", isCorrect: false },
                        { text: "Porque ignora todos os argumentos extras", isCorrect: false },
                        { text: "Porque é uma função variádica", isCorrect: true },
                    ],
                },
                {
                    statement: "Com retornos nomeados, o que os nomes na assinatura se tornam dentro da função?",
                    difficulty: "dificil",
                    options: [
                        { text: "Constantes que não podem mudar de valor", isCorrect: false },
                        { text: "Variáveis já prontas para uso", isCorrect: true },
                        { text: "Novos parâmetros de entrada da função", isCorrect: false },
                        { text: "Apenas rótulos sem efeito no código", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "defer e funções como valores",
            blocks: [
                {
                    type: "text",
                    value: "# defer: adiar até o fim\n\nO `defer` agenda a execução de uma chamada para o momento em que a função atual **retornar**, aconteça o que acontecer no meio. É o jeito idiomático de garantir que um recurso seja liberado, como fechar um arquivo logo depois de abri-lo.\n\n```\nf := abrirArquivo()\ndefer f.Close()   // será chamado quando a função terminar\n// ... use o arquivo aqui\n```\n\nSe houver vários `defer`, eles rodam na ordem inversa (o último agendado roda primeiro), como uma pilha.",
                },
                {
                    type: "text",
                    value: "## Funções são valores\n\nEm Go, funções são valores de primeira classe: você pode guardá-las em variáveis, passá-las como argumento e devolvê-las de outras funções. Também pode criar funções anônimas na hora.\n\n```\ndobro := func(x int) int {\n    return x * 2\n}\nfmt.Println(dobro(5))   // 10\n```\n\nEsse recurso é a base de padrões flexíveis, como passar uma função de comparação para ordenar uma lista.",
                },
                {
                    type: "quote",
                    value: "defer agenda uma chamada para quando a função retornar, ideal para liberar recursos. Funções são valores: cabem em variáveis e viram argumentos.",
                },
            ],
            questions: [
                {
                    statement: "Quando a chamada agendada por um defer é executada?",
                    difficulty: "medio",
                    options: [
                        { text: "No momento em que a função atual retorna", isCorrect: true },
                        { text: "Imediatamente, na linha em que o defer aparece", isCorrect: false },
                        { text: "Apenas se ocorrer um erro na função", isCorrect: false },
                        { text: "No início da função, antes de tudo", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que o defer é tipicamente usado em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Garantir a liberação de recursos, como fechar um arquivo", isCorrect: true },
                        { text: "Acelerar a execução de laços de repetição", isCorrect: false },
                        { text: "Declarar variáveis globais do programa", isCorrect: false },
                        { text: "Converter tipos numéricos automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa dizer que funções são valores de primeira classe em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Podem ser guardadas em variáveis e passadas como argumento", isCorrect: true },
                        { text: "Só podem ser declaradas dentro do pacote main", isCorrect: false },
                        { text: "Precisam sempre devolver vários valores de uma vez", isCorrect: false },
                        { text: "Não podem ter nenhum parâmetro de entrada", isCorrect: false },
                    ],
                },
                {
                    statement: "Com vários defer em uma função, em que ordem eles são executados?",
                    difficulty: "dificil",
                    options: [
                        { text: "Na mesma ordem em que foram escritos", isCorrect: false },
                        { text: "Na ordem inversa, o último primeiro", isCorrect: true },
                        { text: "Todos de uma vez, ao mesmo tempo", isCorrect: false },
                        { text: "Em ordem aleatória a cada execução", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é uma função anônima em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma função sem nenhum parâmetro", isCorrect: false },
                        { text: "Uma função que não devolve valor algum", isCorrect: false },
                        { text: "Uma função privada de um pacote", isCorrect: false },
                        { text: "Uma função criada na hora, sem nome", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Slices e maps",
    aulas: [
        {
            titulo: "Arrays e slices",
            blocks: [
                {
                    type: "text",
                    value: "# Arrays têm tamanho fixo\n\nUm **array** em Go tem tamanho fixo, definido na declaração e parte do seu tipo. `[3]int` e `[4]int` são tipos diferentes. Na prática, arrays de tamanho fixo são pouco usados diretamente.\n\n```\nvar numeros [3]int      // [0 0 0], zero values\nnumeros[0] = 10\nfmt.Println(numeros)    // [10 0 0]\n```",
                },
                {
                    type: "text",
                    value: "# Slices: a estrutura do dia a dia\n\nO **slice** é a estrutura mais usada em Go: uma sequência de tamanho variável, apoiada em um array por baixo. Você o declara sem tamanho fixo e faz ele crescer com `append`.\n\n```\nnumeros := []int{10, 20, 30}   // um slice\nnumeros = append(numeros, 40)  // [10 20 30 40]\nfmt.Println(len(numeros))      // 4\n```\n\nA função `len` dá o tamanho do slice, e `append` devolve um novo slice com o elemento acrescentado (por isso reatribuímos a `numeros`).",
                },
                {
                    type: "text",
                    value: "## Fatiando\n\nVocê pode obter um trecho de um slice com a notação `s[inicio:fim]`, que inclui o início e exclui o fim. Índices começam em 0.\n\n```\ns := []int{10, 20, 30, 40, 50}\nfmt.Println(s[1:3])   // [20 30]\nfmt.Println(s[:2])    // [10 20]\nfmt.Println(s[3:])    // [40 50]\n```",
                },
                {
                    type: "quote",
                    value: "Arrays têm tamanho fixo e são pouco usados diretamente. O slice é a estrutura do dia a dia: cresce com append e é fatiado com s[inicio:fim].",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre um array e um slice em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "O array tem tamanho fixo; o slice tem tamanho variável", isCorrect: true },
                        { text: "O slice tem tamanho fixo; o array é variável", isCorrect: false },
                        { text: "Os dois têm exatamente o mesmo comportamento", isCorrect: false },
                        { text: "Arrays só guardam strings e slices só números", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função acrescenta um elemento a um slice?",
                    difficulty: "facil",
                    options: [
                        { text: "append", isCorrect: true },
                        { text: "add", isCorrect: false },
                        { text: "push", isCorrect: false },
                        { text: "insert", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 's[1:3]' devolve para o slice {10, 20, 30, 40}?",
                    difficulty: "medio",
                    options: [
                        { text: "[20 30], pois inclui o índice 1 e exclui o 3", isCorrect: true },
                        { text: "[20 30 40], pois inclui do índice 1 ao 3", isCorrect: false },
                        { text: "[10 20 30], pois começa sempre do início", isCorrect: false },
                        { text: "[30 40], pois conta a partir do fim", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a função len faz com um slice?",
                    difficulty: "medio",
                    options: [
                        { text: "Acrescenta um elemento a ele", isCorrect: false },
                        { text: "Remove o último elemento dele", isCorrect: false },
                        { text: "Devolve o seu tamanho", isCorrect: true },
                        { text: "Ordena os elementos dele", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que escrevemos 'numeros = append(numeros, 40)', reatribuindo a numeros?",
                    difficulty: "dificil",
                    options: [
                        { text: "Porque sem a reatribuição o código não compilaria", isCorrect: false },
                        { text: "Porque append devolve um novo slice pronto", isCorrect: true },
                        { text: "Porque append apaga o slice antigo da memória", isCorrect: false },
                        { text: "Porque append só funciona dentro de um for", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Crescendo e criando slices",
            blocks: [
                {
                    type: "text",
                    value: "# make e o slice vazio\n\nAlém do literal `[]int{...}`, você pode criar um slice com `make`, informando o tipo e o tamanho inicial. Um slice pode começar vazio e crescer conforme você adiciona.\n\n```\nnumeros := make([]int, 0)   // slice vazio de int\nfor i := 1; i <= 3; i++ {\n    numeros = append(numeros, i)\n}\nfmt.Println(numeros)   // [1 2 3]\n```",
                },
                {
                    type: "text",
                    value: "## Cuidado: slices compartilham o array por baixo\n\nUm detalhe importante do Go: quando você fatia ou copia um slice, o novo slice pode apontar para o **mesmo array** por baixo. Alterar um pode afetar o outro. Se você precisa de uma cópia independente, use a função `copy` para um novo slice.\n\n```\noriginal := []int{1, 2, 3}\nfatia := original[:2]\nfatia[0] = 99\nfmt.Println(original)   // [99 2 3], mudou junto!\n```",
                },
                {
                    type: "quote",
                    value: "Crie slices com make ou com um literal. Lembre que fatias podem compartilhar o mesmo array por baixo, então alterar uma pode afetar a outra.",
                },
            ],
            questions: [
                {
                    statement: "O que 'make([]int, 0)' cria?",
                    difficulty: "medio",
                    options: [
                        { text: "Um slice de int vazio, pronto para crescer com append", isCorrect: true },
                        { text: "Um array fixo de tamanho zero e imutável", isCorrect: false },
                        { text: "Um map de inteiros sem chaves", isCorrect: false },
                        { text: "Um único inteiro com valor zero", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que alterar uma fatia de um slice pode afetar o slice original?",
                    difficulty: "dificil",
                    options: [
                        { text: "Porque ambos podem apontar para o mesmo array por baixo", isCorrect: true },
                        { text: "Porque slices sempre criam cópias totalmente independentes", isCorrect: false },
                        { text: "Porque o Go proíbe fatiar slices existentes", isCorrect: false },
                        { text: "Porque a fatia vira um map ao ser criada", isCorrect: false },
                    ],
                },
                {
                    statement: "Se você precisa de uma cópia independente de um slice, o que usar?",
                    difficulty: "medio",
                    options: [
                        { text: "A função copy, para um novo slice", isCorrect: true },
                        { text: "A função append, que sempre isola os dados", isCorrect: false },
                        { text: "A função len, que duplica o slice", isCorrect: false },
                        { text: "Nada, pois toda atribuição já copia tudo", isCorrect: false },
                    ],
                },
                {
                    statement: "O que você informa ao criar um slice com make?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o nome da variável", isCorrect: false },
                        { text: "O tipo e o tamanho inicial", isCorrect: true },
                        { text: "Somente os valores já prontos", isCorrect: false },
                        { text: "A ordem de classificação dos dados", isCorrect: false },
                    ],
                },
                {
                    statement: "No exemplo, após 'fatia := original[:2]' e 'fatia[0] = 99', o que ocorre com original?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ele continua totalmente inalterado", isCorrect: false },
                        { text: "Ele é apagado da memória por completo", isCorrect: false },
                        { text: "Ele passa a ser uma cópia isolada", isCorrect: false },
                        { text: "Seu primeiro elemento também vira 99", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Maps: pares de chave e valor",
            blocks: [
                {
                    type: "text",
                    value: "# O dicionário do Go\n\nUm **map** associa chaves a valores, como um dicionário. Você cria com `make` (ou um literal) e acessa com colchetes.\n\n```\nidades := make(map[string]int)\nidades[\"Ana\"] = 30\nidades[\"Bruno\"] = 25\nfmt.Println(idades[\"Ana\"])   // 30\n```\n\nO tipo `map[string]int` significa: chaves do tipo string, valores do tipo int. Para remover uma chave, use `delete(idades, \"Ana\")`.",
                },
                {
                    type: "text",
                    value: "## O idioma vírgula-ok\n\nAcessar uma chave que não existe devolve o zero value do tipo do valor, não um erro. Para distinguir \"a chave existe e vale zero\" de \"a chave não existe\", use a forma de dois retornos, o **comma-ok**: além do valor, você recebe um bool que diz se a chave existia.\n\n```\nvalor, existe := idades[\"Carla\"]\nif existe {\n    fmt.Println(valor)\n} else {\n    fmt.Println(\"Carla não está no map\")\n}\n```",
                },
                {
                    type: "quote",
                    value: "map[string]int tem chaves string e valores int. Chave inexistente devolve o zero value; use valor, ok := m[chave] para saber se a chave realmente existe.",
                },
            ],
            questions: [
                {
                    statement: "O que o tipo 'map[string]int' representa?",
                    difficulty: "facil",
                    options: [
                        { text: "Um map com chaves string e valores int", isCorrect: true },
                        { text: "Um map com chaves int e valores string", isCorrect: false },
                        { text: "Um slice de strings e inteiros misturados", isCorrect: false },
                        { text: "Um array fixo de pares de inteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao acessar uma chave que não existe em um map?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve o zero value do tipo do valor", isCorrect: true },
                        { text: "Lança um erro que interrompe o programa", isCorrect: false },
                        { text: "Cria a chave automaticamente com valor aleatório", isCorrect: false },
                        { text: "Devolve o valor de outra chave qualquer", isCorrect: false },
                    ],
                },
                {
                    statement: "Para saber com certeza se uma chave existe em um map, qual padrão usar?",
                    difficulty: "medio",
                    options: [
                        { text: "O comma-ok: valor, ok := m[chave]", isCorrect: true },
                        { text: "Comparar o valor com null diretamente", isCorrect: false },
                        { text: "Usar a função len sobre a chave", isCorrect: false },
                        { text: "Percorrer o map inteiro com um for a cada acesso", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual função remove uma chave de um map em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "remove", isCorrect: false },
                        { text: "pop", isCorrect: false },
                        { text: "delete", isCorrect: true },
                        { text: "clear", isCorrect: false },
                    ],
                },
                {
                    statement: "No idioma comma-ok 'valor, existe := m[chave]', o que é 'existe'?",
                    difficulty: "medio",
                    options: [
                        { text: "O total de chaves guardadas no map", isCorrect: false },
                        { text: "Um bool que diz se a chave existia", isCorrect: true },
                        { text: "A posição da chave dentro do map", isCorrect: false },
                        { text: "Uma cópia do valor da chave anterior", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Structs e métodos",
    aulas: [
        {
            titulo: "Structs: agrupando dados",
            blocks: [
                {
                    type: "text",
                    value: "# Go não tem classes\n\nGo não tem classes nem herança no sentido tradicional. No lugar, você usa **structs**: um tipo que agrupa campos relacionados sob um nome. É a forma de modelar uma entidade, como uma pessoa ou um produto.\n\n```\ntype Pessoa struct {\n    Nome  string\n    Idade int\n}\n```\n\nCom o `type ... struct`, você define um novo tipo `Pessoa` com dois campos.",
                },
                {
                    type: "text",
                    value: "## Criando e acessando\n\nVocê cria um valor de struct informando os campos, de preferência com o nome de cada um, e acessa com o ponto.\n\n```\np := Pessoa{Nome: \"Ana\", Idade: 30}\nfmt.Println(p.Nome)   // Ana\np.Idade = 31          // altera o campo\n```\n\nCampos não informados recebem o zero value. Como você viu nos pacotes, campos com inicial maiúscula são exportados (visíveis de fora do pacote); com minúscula, ficam privados.",
                },
                {
                    type: "quote",
                    value: "Go não tem classes: use structs para agrupar campos sob um tipo. Crie com Tipo{Campo: valor} e acesse os campos com o ponto.",
                },
            ],
            questions: [
                {
                    statement: "Como o Go agrupa campos de dados relacionados, já que não tem classes?",
                    difficulty: "facil",
                    options: [
                        { text: "Com structs, tipos que reúnem campos sob um nome", isCorrect: true },
                        { text: "Com classes, iguais às de Java", isCorrect: false },
                        { text: "Apenas com slices de valores soltos", isCorrect: false },
                        { text: "Com maps obrigatoriamente para todo dado", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se acessa o campo Nome de uma struct chamada p?",
                    difficulty: "facil",
                    options: [
                        { text: "p.Nome", isCorrect: true },
                        { text: "p->Nome", isCorrect: false },
                        { text: "p[Nome]", isCorrect: false },
                        { text: "Nome(p)", isCorrect: false },
                    ],
                },
                {
                    statement: "Em uma struct, o que acontece com um campo que você não informa ao criá-la?",
                    difficulty: "medio",
                    options: [
                        { text: "Recebe o zero value do seu tipo", isCorrect: true },
                        { text: "Fica indefinido, com um valor de lixo", isCorrect: false },
                        { text: "Causa um erro de compilação", isCorrect: false },
                        { text: "É removido da struct automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o Go NÃO possui, o que leva ao uso de structs?",
                    difficulty: "medio",
                    options: [
                        { text: "Funções com vários parâmetros de entrada", isCorrect: false },
                        { text: "Classes e herança tradicionais", isCorrect: true },
                        { text: "Tipos numéricos como o int", isCorrect: false },
                        { text: "Laços de repetição como o for", isCorrect: false },
                    ],
                },
                {
                    statement: "Em uma struct, um campo cujo nome começa com letra minúscula é:",
                    difficulty: "dificil",
                    options: [
                        { text: "Exportado e visível de qualquer pacote", isCorrect: false },
                        { text: "Sempre ignorado quando se cria a struct", isCorrect: false },
                        { text: "Convertido automaticamente em um método", isCorrect: false },
                        { text: "Privado ao pacote onde a struct vive", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Métodos, ponteiros e o receiver",
            blocks: [
                {
                    type: "text",
                    value: "# Métodos com receiver\n\nEm Go, um **método** é uma função associada a um tipo. Isso é feito por um **receiver**: um parâmetro especial entre `func` e o nome do método, que diz a qual tipo o método pertence.\n\n```\nfunc (p Pessoa) Saudar() string {\n    return \"Olá, eu sou \" + p.Nome\n}\n\np := Pessoa{Nome: \"Ana\"}\nfmt.Println(p.Saudar())   // Olá, eu sou Ana\n```",
                },
                {
                    type: "text",
                    value: "## Ponteiros em uma pincelada\n\nUm **ponteiro** guarda o endereço de uma variável, não o valor em si. `&x` pega o endereço de `x`, e `*p` acessa o valor apontado por `p`. Ponteiros permitem que uma função altere a variável original, em vez de trabalhar com uma cópia.\n\n```\nx := 10\np := &x     // p aponta para x\n*p = 20     // altera x através do ponteiro\nfmt.Println(x)   // 20\n```",
                },
                {
                    type: "text",
                    value: "## Receiver de valor x de ponteiro\n\nQuando o receiver é um **valor** (`p Pessoa`), o método recebe uma cópia: alterar campos não afeta o original. Quando o receiver é um **ponteiro** (`p *Pessoa`), o método trabalha sobre o objeto real, então pode alterá-lo.\n\n```\nfunc (p *Pessoa) Envelhecer() {\n    p.Idade++   // altera a Pessoa de verdade\n}\n```\n\nRegra prática: se o método precisa modificar a struct, use receiver de ponteiro.",
                },
                {
                    type: "quote",
                    value: "Métodos usam um receiver para pertencer a um tipo. Receiver de valor trabalha numa cópia; receiver de ponteiro (*Tipo) altera o objeto real.",
                },
            ],
            questions: [
                {
                    statement: "O que é o receiver de um método em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Um parâmetro especial que associa o método a um tipo", isCorrect: true },
                        { text: "O valor que o método sempre devolve ao final", isCorrect: false },
                        { text: "Uma palavra-chave que declara uma struct", isCorrect: false },
                        { text: "O nome obrigatório de todo pacote em Go", isCorrect: false },
                    ],
                },
                {
                    statement: "Se um método precisa alterar os campos da struct, que tipo de receiver usar?",
                    difficulty: "medio",
                    options: [
                        { text: "Receiver de ponteiro, como (p *Pessoa)", isCorrect: true },
                        { text: "Receiver de valor, como (p Pessoa)", isCorrect: false },
                        { text: "Nenhum, pois métodos nunca alteram structs", isCorrect: false },
                        { text: "Um receiver do tipo string sempre", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador & faz em Go, como em '&x'?",
                    difficulty: "medio",
                    options: [
                        { text: "Devolve o endereço de x, criando um ponteiro para ele", isCorrect: true },
                        { text: "Devolve o valor guardado em x diretamente", isCorrect: false },
                        { text: "Compara x com outro valor lógico", isCorrect: false },
                        { text: "Converte x para o tipo ponteiro texto", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador * faz em '*p', quando p é um ponteiro?",
                    difficulty: "medio",
                    options: [
                        { text: "Cria um novo ponteiro para p", isCorrect: false },
                        { text: "Acessa o valor apontado por p", isCorrect: true },
                        { text: "Devolve o endereço de memória de p", isCorrect: false },
                        { text: "Multiplica p por ele mesmo", isCorrect: false },
                    ],
                },
                {
                    statement: "Com um receiver de valor, como '(p Pessoa)', o que ocorre ao alterar um campo no método?",
                    difficulty: "dificil",
                    options: [
                        { text: "O original é alterado junto com a cópia recebida", isCorrect: false },
                        { text: "Ocorre um erro de compilação na hora", isCorrect: false },
                        { text: "A mudança fica só na cópia local", isCorrect: true },
                        { text: "O método passa a devolver um ponteiro", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Composição com embedding",
            blocks: [
                {
                    type: "text",
                    value: "# Reutilizar sem herança\n\nComo Go não tem herança, o reúso entre tipos se faz por **composição**: uma struct contém outra. O Go oferece uma forma elegante disso, o **embedding**, em que você declara um tipo dentro de outro sem dar um nome de campo.\n\n```\ntype Animal struct {\n    Nome string\n}\n\nfunc (a Animal) Comer() {\n    fmt.Println(a.Nome + \" está comendo\")\n}\n\ntype Cachorro struct {\n    Animal   // embedding: sem nome de campo\n    Raca string\n}\n```",
                },
                {
                    type: "text",
                    value: "## Os métodos e campos sobem\n\nCom o embedding, os campos e métodos do tipo embutido ficam acessíveis diretamente no tipo externo, como se fossem dele. É a maneira idiomática do Go reaproveitar comportamento.\n\n```\nrex := Cachorro{Animal: Animal{Nome: \"Rex\"}, Raca: \"Vira-lata\"}\nfmt.Println(rex.Nome)   // Rex, veio do Animal embutido\nrex.Comer()             // Rex está comendo, método do Animal\n```\n\nO Go favorece composição sobre herança: você monta comportamentos combinando peças, em vez de criar hierarquias rígidas de classes.",
                },
                {
                    type: "quote",
                    value: "Sem herança, Go reutiliza por composição. Com embedding, os campos e métodos do tipo embutido ficam acessíveis diretamente no tipo externo.",
                },
            ],
            questions: [
                {
                    statement: "Como o Go promove o reúso de comportamento entre tipos, já que não tem herança?",
                    difficulty: "medio",
                    options: [
                        { text: "Por composição, com uma struct contendo outra (embedding)", isCorrect: true },
                        { text: "Por herança múltipla entre várias classes", isCorrect: false },
                        { text: "Copiando o código manualmente em cada tipo", isCorrect: false },
                        { text: "Não é possível reutilizar comportamento em Go", isCorrect: false },
                    ],
                },
                {
                    statement: "Com embedding, o que acontece com os campos e métodos do tipo embutido?",
                    difficulty: "dificil",
                    options: [
                        { text: "Ficam acessíveis diretamente no tipo externo", isCorrect: true },
                        { text: "Ficam totalmente inacessíveis no tipo externo", isCorrect: false },
                        { text: "Precisam ser reescritos no tipo externo", isCorrect: false },
                        { text: "São convertidos em variáveis globais", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual princípio de projeto o Go favorece?",
                    difficulty: "facil",
                    options: [
                        { text: "Composição sobre herança", isCorrect: true },
                        { text: "Herança profunda de muitas classes", isCorrect: false },
                        { text: "Ausência total de reúso de código", isCorrect: false },
                        { text: "Cópia manual de comportamento entre tipos", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza o embedding em uma struct Go?",
                    difficulty: "dificil",
                    options: [
                        { text: "Copiar todos os campos de outra struct manualmente", isCorrect: false },
                        { text: "Declarar um tipo dentro de outro sem nomeá-lo", isCorrect: true },
                        { text: "Herdar de uma classe base com a palavra extends", isCorrect: false },
                        { text: "Guardar várias structs dentro de um único slice", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que 'rex.Comer()' funciona, mesmo Comer sendo método de Animal?",
                    difficulty: "medio",
                    options: [
                        { text: "Porque o embedding faz o método subir", isCorrect: true },
                        { text: "Porque Comer foi reescrito dentro do Cachorro", isCorrect: false },
                        { text: "Porque todo método em Go é global ao programa", isCorrect: false },
                        { text: "Porque Cachorro herda de Animal usando extends", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Interfaces",
    aulas: [
        {
            titulo: "Interfaces: um contrato implícito",
            blocks: [
                {
                    type: "text",
                    value: "# O que é uma interface\n\nUma **interface** define um conjunto de métodos, um contrato de comportamento. Qualquer tipo que tenha esses métodos satisfaz a interface. A grande diferença do Go é que isso é **implícito**: não existe palavra `implements`. Se o tipo tem os métodos certos, ele já satisfaz a interface, sem declarar nada.\n\n```\ntype Falante interface {\n    Falar() string\n}\n```",
                },
                {
                    type: "text",
                    value: "## Satisfazer sem declarar\n\nBasta um tipo ter o método `Falar() string` para ser um `Falante`, automaticamente.\n\n```\ntype Cachorro struct{}\nfunc (c Cachorro) Falar() string { return \"Au au\" }\n\ntype Gato struct{}\nfunc (g Gato) Falar() string { return \"Miau\" }\n\n// ambos satisfazem Falante sem escrever isso em lugar nenhum\nvar f Falante = Cachorro{}\nfmt.Println(f.Falar())   // Au au\n```\n\nEsse acoplamento fraco é uma marca do Go: um pacote pode definir uma interface e usar tipos de outros pacotes que a satisfaçam, mesmo sem eles saberem da interface.",
                },
                {
                    type: "quote",
                    value: "Em Go, interfaces são satisfeitas de forma implícita: se o tipo tem os métodos do contrato, ele já a satisfaz, sem nenhuma palavra implements.",
                },
            ],
            questions: [
                {
                    statement: "Como um tipo passa a satisfazer uma interface em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Basta ter os métodos que a interface declara; é implícito", isCorrect: true },
                        { text: "É preciso escrever a palavra-chave implements", isCorrect: false },
                        { text: "É preciso herdar da interface com extends", isCorrect: false },
                        { text: "É preciso registrar o tipo na interface manualmente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que uma interface define em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Um conjunto de métodos, um contrato de comportamento", isCorrect: true },
                        { text: "Um conjunto de campos de dados de uma struct", isCorrect: false },
                        { text: "Um valor constante usado em todo o programa", isCorrect: false },
                        { text: "Um laço especial para percorrer coleções", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é uma vantagem das interfaces implícitas do Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Um tipo pode satisfazer uma interface sem sequer conhecê-la", isCorrect: true },
                        { text: "Obrigam todos os tipos a declarar todas as interfaces", isCorrect: false },
                        { text: "Impedem que tipos diferentes tenham o mesmo método", isCorrect: false },
                        { text: "Eliminam a necessidade de escrever métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual palavra-chave o Go usa para declarar que um tipo implementa uma interface?",
                    difficulty: "medio",
                    options: [
                        { text: "A palavra-chave implements, antes do tipo", isCorrect: false },
                        { text: "A palavra-chave extends, como em Java", isCorrect: false },
                        { text: "Nenhuma; a satisfação é implícita", isCorrect: true },
                        { text: "A palavra-chave interface no tipo", isCorrect: false },
                    ],
                },
                {
                    statement: "O acoplamento fraco das interfaces do Go permite que:",
                    difficulty: "dificil",
                    options: [
                        { text: "Dois tipos jamais compartilhem um mesmo método", isCorrect: false },
                        { text: "Um pacote use tipos de outro que a satisfaçam", isCorrect: true },
                        { text: "Interfaces guardem campos de dados também", isCorrect: false },
                        { text: "Um tipo troque de interface ao ser executado", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Polimorfismo com interfaces",
            blocks: [
                {
                    type: "text",
                    value: "# Uma função, vários tipos\n\nInterfaces habilitam o polimorfismo em Go. Uma função que recebe uma interface aceita qualquer tipo que a satisfaça, e chama o método sem saber o tipo concreto.\n\n```\nfunc apresentar(f Falante) {\n    fmt.Println(f.Falar())\n}\n\napresentar(Cachorro{})   // Au au\napresentar(Gato{})       // Miau\n```\n\nA mesma função lida com `Cachorro` e `Gato` porque ambos são `Falante`. Para adicionar um novo tipo que fale, basta dar a ele o método `Falar()`, sem tocar na função `apresentar`.",
                },
                {
                    type: "text",
                    value: "## Interfaces pequenas são o ideal\n\nO Go incentiva interfaces pequenas, muitas vezes com um único método. Um exemplo famoso da biblioteca padrão é a `Stringer`, que tem só o método `String() string`: qualquer tipo que o implemente controla como é impresso pelo `fmt`. Interfaces enxutas são fáceis de satisfazer e de combinar.",
                },
                {
                    type: "quote",
                    value: "Uma função que recebe uma interface aceita qualquer tipo que a satisfaça. Go prefere interfaces pequenas, muitas vezes com um único método.",
                },
            ],
            questions: [
                {
                    statement: "Uma função que recebe um parâmetro do tipo de uma interface aceita:",
                    difficulty: "medio",
                    options: [
                        { text: "Qualquer tipo que satisfaça aquela interface", isCorrect: true },
                        { text: "Apenas um tipo concreto específico escolhido antes", isCorrect: false },
                        { text: "Somente valores do tipo string", isCorrect: false },
                        { text: "Nenhum tipo, pois interfaces não são parâmetros", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que um novo tipo passe a funcionar com uma função que espera Falante, basta:",
                    difficulty: "medio",
                    options: [
                        { text: "Dar a ele o método Falar(), sem alterar a função", isCorrect: true },
                        { text: "Reescrever a função para conhecer o novo tipo", isCorrect: false },
                        { text: "Registrar o tipo em uma lista global de falantes", isCorrect: false },
                        { text: "Herdar o tipo a partir da função apresentar", isCorrect: false },
                    ],
                },
                {
                    statement: "Que tamanho de interface o Go tende a incentivar?",
                    difficulty: "facil",
                    options: [
                        { text: "Interfaces pequenas, muitas vezes com um único método", isCorrect: true },
                        { text: "Interfaces grandes, com dezenas de métodos", isCorrect: false },
                        { text: "Interfaces sem nenhum método declarado", isCorrect: false },
                        { text: "Interfaces que só contêm campos de dados", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um tipo controla ao implementar a interface Stringer, com String() string?",
                    difficulty: "dificil",
                    options: [
                        { text: "A ordem dos seus campos na memória", isCorrect: false },
                        { text: "Como ele é impresso pelo pacote fmt", isCorrect: true },
                        { text: "A velocidade de compilação do programa", isCorrect: false },
                        { text: "Quais pacotes conseguem importá-lo", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao receber uma interface, a função chama o método:",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas se souber o tipo concreto exato", isCorrect: false },
                        { text: "Somente para valores do tipo string informado", isCorrect: false },
                        { text: "Sem saber o tipo concreto por trás", isCorrect: true },
                        { text: "Depois de converter tudo em um map", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "A interface vazia e a asserção de tipo",
            blocks: [
                {
                    type: "text",
                    value: "# A interface vazia\n\nA interface vazia, escrita `interface{}` (ou `any` no Go moderno), não exige nenhum método. Por isso, **qualquer** valor a satisfaz. Ela é útil quando você precisa guardar um valor de tipo desconhecido, como em uma função que aceita qualquer coisa.\n\n```\nvar qualquer any\nqualquer = 42\nqualquer = \"texto\"   // vale qualquer tipo\n```",
                },
                {
                    type: "text",
                    value: "## Recuperando o tipo com asserção\n\nQuando você tem um valor em uma interface vazia e precisa do tipo concreto de volta, usa uma **asserção de tipo**. A forma segura, com comma-ok, evita um panic caso o tipo não seja o esperado.\n\n```\nvar i any = \"olá\"\ns, ok := i.(string)\nif ok {\n    fmt.Println(\"é string:\", s)\n}\n```\n\nPara tratar vários tipos possíveis, o Go tem o **type switch**, que escolhe um caso conforme o tipo dinâmico do valor.",
                },
                {
                    type: "quote",
                    value: "A interface vazia (any) aceita qualquer valor. Para recuperar o tipo concreto com segurança, use a asserção com comma-ok: v, ok := i.(Tipo).",
                },
            ],
            questions: [
                {
                    statement: "Quais valores a interface vazia (interface{} ou any) aceita?",
                    difficulty: "facil",
                    options: [
                        { text: "Qualquer valor, pois não exige nenhum método", isCorrect: true },
                        { text: "Apenas valores do tipo string", isCorrect: false },
                        { text: "Apenas structs definidas pelo usuário", isCorrect: false },
                        { text: "Nenhum valor, pois é sempre nil", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve uma asserção de tipo como 'i.(string)'?",
                    difficulty: "medio",
                    options: [
                        { text: "Recuperar o tipo concreto de um valor em uma interface", isCorrect: true },
                        { text: "Converter um número inteiro em um ponto flutuante", isCorrect: false },
                        { text: "Declarar uma nova interface dentro do programa", isCorrect: false },
                        { text: "Criar um slice a partir de uma string de texto", isCorrect: false },
                    ],
                },
                {
                    statement: "Por que usar a forma com comma-ok em uma asserção de tipo?",
                    difficulty: "medio",
                    options: [
                        { text: "Para evitar um panic caso o tipo não seja o esperado", isCorrect: true },
                        { text: "Para acelerar a conversão entre os tipos", isCorrect: false },
                        { text: "Porque a asserção não funciona sem duas variáveis", isCorrect: false },
                        { text: "Para transformar o valor em uma interface vazia", isCorrect: false },
                    ],
                },
                {
                    statement: "No Go moderno, qual palavra é sinônimo de interface{}?",
                    difficulty: "medio",
                    options: [
                        { text: "object", isCorrect: false },
                        { text: "any", isCorrect: true },
                        { text: "void", isCorrect: false },
                        { text: "var", isCorrect: false },
                    ],
                },
                {
                    statement: "Para tratar vários tipos possíveis de um valor em interface, o Go oferece:",
                    difficulty: "dificil",
                    options: [
                        { text: "Um laço for sobre todos os tipos possíveis", isCorrect: false },
                        { text: "A conversão automática entre os tipos", isCorrect: false },
                        { text: "Um bloco try seguido de um catch", isCorrect: false },
                        { text: "O type switch, que age pelo tipo dinâmico", isCorrect: true },
                    ],
                },
            ],
        },
    ],
};

const MODULO_8: Modulo = {
    titulo: "Módulo 8 - Tratamento de erros",
    aulas: [
        {
            titulo: "Erros são valores",
            blocks: [
                {
                    type: "text",
                    value: "# Sem exceções para o dia a dia\n\nGo não usa exceções (try/catch) para o tratamento de erros comum. Em vez disso, **erros são valores**: uma função que pode falhar devolve um valor de erro como um dos seus retornos, e quem chama verifica esse valor. O tipo `error` é uma interface simples com um método `Error() string`.\n\nA convenção idiomática é retornar o resultado e um `error`, com o erro por último:",
                },
                {
                    type: "code",
                    value: "resultado, err := dividir(10, 0)\nif err != nil {\n    fmt.Println(\"deu erro:\", err)\n    return\n}\nfmt.Println(resultado)",
                },
                {
                    type: "text",
                    value: "## O padrão if err != nil\n\nEsse bloco `if err != nil` é onipresente em Go. Ele torna o fluxo de erros explícito: você vê no código, linha a linha, onde algo pode dar errado e como é tratado. Um `error` com valor `nil` significa que deu tudo certo; qualquer valor diferente de `nil` indica falha.\n\nQuem começa às vezes estranha ver tantos `if err != nil`, mas essa clareza é proposital: nada de erro escondido saltando por vários níveis, como acontece com exceções.",
                },
                {
                    type: "quote",
                    value: "Em Go, erros são valores: a função devolve um error como último retorno e quem chama checa com if err != nil. error nil significa sucesso.",
                },
            ],
            questions: [
                {
                    statement: "Como o Go trata erros comuns, em vez de usar exceções?",
                    difficulty: "facil",
                    options: [
                        { text: "Erros são valores devolvidos e verificados por quem chama", isCorrect: true },
                        { text: "Erros são lançados e capturados com try e catch", isCorrect: false },
                        { text: "Erros interrompem o programa sem qualquer verificação", isCorrect: false },
                        { text: "Erros são ignorados por padrão em todo o código", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um valor de error igual a nil indica?",
                    difficulty: "facil",
                    options: [
                        { text: "Que a operação teve sucesso, sem erro", isCorrect: true },
                        { text: "Que ocorreu um erro grave na operação", isCorrect: false },
                        { text: "Que a função ainda não terminou de rodar", isCorrect: false },
                        { text: "Que o programa deve ser encerrado imediatamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Na convenção idiomática do Go, em que posição vem o error retornado por uma função?",
                    difficulty: "medio",
                    options: [
                        { text: "Por último, depois do resultado", isCorrect: true },
                        { text: "Sempre em primeiro, antes do resultado", isCorrect: false },
                        { text: "No meio, entre dois resultados", isCorrect: false },
                        { text: "O Go não permite devolver um error", isCorrect: false },
                    ],
                },
                {
                    statement: "O tipo error em Go é, na verdade:",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma struct com vários campos de texto", isCorrect: false },
                        { text: "Uma interface com o método Error() string", isCorrect: true },
                        { text: "Um tipo numérico que guarda um código", isCorrect: false },
                        { text: "Uma palavra-chave reservada da linguagem Go", isCorrect: false },
                    ],
                },
                {
                    statement: "Um valor de error diferente de nil indica que:",
                    difficulty: "medio",
                    options: [
                        { text: "A operação foi um sucesso total", isCorrect: false },
                        { text: "O programa ainda está compilando", isCorrect: false },
                        { text: "Houve uma falha na operação", isCorrect: true },
                        { text: "O resultado deve ser ignorado sempre", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Criando e propagando erros",
            blocks: [
                {
                    type: "text",
                    value: "# Criando um erro\n\nPara criar um erro simples, use `errors.New` com uma mensagem, ou `fmt.Errorf` quando quiser montar a mensagem com valores. A função devolve o erro em vez de continuar.\n\n```\nimport \"errors\"\n\nfunc dividir(a, b int) (int, error) {\n    if b == 0 {\n        return 0, errors.New(\"não é possível dividir por zero\")\n    }\n    return a / b, nil\n}\n```\n\nRepare que, no caminho de sucesso, o erro retornado é `nil`.",
                },
                {
                    type: "text",
                    value: "## Propagando e embrulhando\n\nQuando uma função recebe um erro de outra e não sabe resolvê-lo, ela costuma **propagar**: devolver o erro para cima, para quem chamou decidir. Com `fmt.Errorf` e o verbo `%w`, você **embrulha** o erro original, acrescentando contexto sem perder a causa.\n\n```\nif err != nil {\n    return fmt.Errorf(\"ao carregar o usuário: %w\", err)\n}\n```\n\nAssim, a mensagem final conta a história do que aconteceu, camada por camada, e ferramentas conseguem inspecionar o erro original.",
                },
                {
                    type: "quote",
                    value: "Crie erros com errors.New ou fmt.Errorf. Propague o que você não resolve e use %w para embrulhar o erro original com mais contexto.",
                },
            ],
            questions: [
                {
                    statement: "Qual função cria um erro simples com uma mensagem em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "errors.New", isCorrect: true },
                        { text: "throw.Error", isCorrect: false },
                        { text: "panic.New", isCorrect: false },
                        { text: "fmt.Println", isCorrect: false },
                    ],
                },
                {
                    statement: "No caminho de sucesso de uma função que retorna (int, error), o que devolver como erro?",
                    difficulty: "medio",
                    options: [
                        { text: "nil, indicando que não houve erro", isCorrect: true },
                        { text: "Uma string vazia no lugar do erro", isCorrect: false },
                        { text: "O número zero como erro", isCorrect: false },
                        { text: "Um novo erro genérico sempre", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o verbo %w em fmt.Errorf?",
                    difficulty: "dificil",
                    options: [
                        { text: "Embrulhar o erro original, dando contexto sem perder a causa", isCorrect: true },
                        { text: "Formatar um número inteiro dentro da mensagem de erro", isCorrect: false },
                        { text: "Encerrar o programa logo após montar a mensagem", isCorrect: false },
                        { text: "Converter o erro em uma string sem tipo definido", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando usar fmt.Errorf em vez de errors.New?",
                    difficulty: "medio",
                    options: [
                        { text: "Quando o erro não tiver texto nenhum", isCorrect: false },
                        { text: "Quando quiser montar a mensagem com valores", isCorrect: true },
                        { text: "Quando quiser encerrar o programa na mesma hora", isCorrect: false },
                        { text: "Quando não existir erro algum de fato", isCorrect: false },
                    ],
                },
                {
                    statement: "O que significa 'propagar' um erro em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Apagá-lo em silêncio e seguir em frente normalmente", isCorrect: false },
                        { text: "Transformá-lo em um panic imediato", isCorrect: false },
                        { text: "Guardá-lo em uma variável global", isCorrect: false },
                        { text: "Devolvê-lo para cima, a quem chamou", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "panic e recover",
            blocks: [
                {
                    type: "text",
                    value: "# Quando algo é realmente excepcional\n\nAlém dos erros comuns, o Go tem o `panic`, para situações verdadeiramente excepcionais, das quais o programa não deveria continuar: um estado impossível, um bug de programação. Um `panic` interrompe o fluxo normal e começa a desmontar a pilha de chamadas.\n\nA regra de ouro: use erros (valores) para o que é esperado (arquivo não encontrado, entrada inválida) e reserve o `panic` para o que nunca deveria acontecer.",
                },
                {
                    type: "text",
                    value: "## recover: retomando o controle\n\nO `recover`, usado dentro de uma função adiada com `defer`, permite capturar um `panic` e impedir que ele derrube o programa, retomando o controle de forma ordenada. É um padrão usado, por exemplo, para um servidor não cair inteiro por causa de uma requisição problemática.\n\n```\nfunc seguro() {\n    defer func() {\n        if r := recover(); r != nil {\n            fmt.Println(\"recuperado de:\", r)\n        }\n    }()\n    panic(\"algo deu muito errado\")\n}\n```",
                },
                {
                    type: "quote",
                    value: "Use erros (valores) para falhas esperadas e panic apenas para o excepcional. recover, dentro de um defer, captura um panic e evita que ele derrube o programa.",
                },
            ],
            questions: [
                {
                    statement: "Para que tipo de situação o panic deve ser reservado em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Situações verdadeiramente excepcionais, que não deveriam ocorrer", isCorrect: true },
                        { text: "Qualquer erro comum, como um arquivo não encontrado", isCorrect: false },
                        { text: "Toda validação de entrada do usuário", isCorrect: false },
                        { text: "O fluxo normal de qualquer função", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde o recover precisa ser usado para capturar um panic?",
                    difficulty: "dificil",
                    options: [
                        { text: "Dentro de uma função adiada com defer", isCorrect: true },
                        { text: "No início do programa, antes do main", isCorrect: false },
                        { text: "Dentro de um bloco try, como em outras linguagens", isCorrect: false },
                        { text: "Em qualquer linha, sem nenhuma exigência", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a regra de ouro entre erros e panic em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Erros para o esperado; panic apenas para o excepcional", isCorrect: true },
                        { text: "Panic para tudo, evitando retornar erros", isCorrect: false },
                        { text: "Erros e panic são intercambiáveis, tanto faz", isCorrect: false },
                        { text: "Nunca tratar erros, deixando o programa cair", isCorrect: false },
                    ],
                },
                {
                    statement: "O que um panic faz ao fluxo do programa?",
                    difficulty: "medio",
                    options: [
                        { text: "Continua o fluxo como se nada tivesse ocorrido", isCorrect: false },
                        { text: "Interrompe o fluxo normal e desmonta a pilha", isCorrect: true },
                        { text: "Reinicia o programa a partir do main", isCorrect: false },
                        { text: "Ignora a linha atual e segue adiante", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o efeito do recover ao capturar um panic?",
                    difficulty: "dificil",
                    options: [
                        { text: "Faz o panic acontecer mais uma vez", isCorrect: false },
                        { text: "Converte o panic em um erro ainda pior", isCorrect: false },
                        { text: "Impede que o panic derrube o programa", isCorrect: true },
                        { text: "Encerra o programa de forma imediata", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_9: Modulo = {
    titulo: "Módulo 9 - Concorrência com goroutines e channels",
    aulas: [
        {
            titulo: "Goroutines: concorrência leve",
            blocks: [
                {
                    type: "text",
                    value: "# A marca registrada do Go\n\nA concorrência, fazer várias coisas ao mesmo tempo, é onde o Go mais brilha. A peça central é a **goroutine**: uma função que roda de forma concorrente, gerenciada pelo próprio runtime do Go. Iniciar uma é trivial: basta pôr a palavra `go` antes da chamada.\n\n```\ngo fazerAlgo()   // roda concorrentemente, sem bloquear\n```\n\nGoroutines são muito leves: um programa pode ter milhares delas rodando, algo inviável com threads tradicionais do sistema operacional.",
                },
                {
                    type: "text",
                    value: "# Concorrência não é paralelismo\n\nUma distinção que o próprio Go gosta de frisar: **concorrência** é estruturar o programa como tarefas independentes que progridem de forma intercalada; **paralelismo** é executá-las de fato ao mesmo tempo, em vários núcleos. Go facilita escrever código concorrente, e o runtime decide como distribuí-lo pelos núcleos disponíveis.",
                },
                {
                    type: "text",
                    value: "## O problema da sincronização\n\nAo iniciar uma goroutine, o programa não espera por ela: a execução segue adiante. Se o `main` termina, o programa acaba, mesmo com goroutines no meio do caminho. Por isso é preciso **coordenar** as goroutines, garantindo que o trabalho termine. A próxima aula mostra a forma idiomática de fazer isso: os channels.",
                },
                {
                    type: "quote",
                    value: "Uma goroutine é uma função concorrente iniciada com a palavra go. São tão leves que um programa pode ter milhares delas, mas precisam ser coordenadas.",
                },
            ],
            questions: [
                {
                    statement: "Como se inicia uma goroutine em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Colocando a palavra go antes da chamada da função", isCorrect: true },
                        { text: "Chamando o método start() da função", isCorrect: false },
                        { text: "Declarando a função como async", isCorrect: false },
                        { text: "Passando a função para o pacote thread", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza as goroutines em relação às threads tradicionais do sistema?",
                    difficulty: "medio",
                    options: [
                        { text: "São muito mais leves, permitindo milhares ao mesmo tempo", isCorrect: true },
                        { text: "São mais pesadas e limitadas a poucas por programa", isCorrect: false },
                        { text: "São idênticas às threads do sistema operacional", isCorrect: false },
                        { text: "Só rodam uma de cada vez, nunca concorrentemente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com as goroutines em andamento quando a função main termina?",
                    difficulty: "medio",
                    options: [
                        { text: "O programa acaba, mesmo que elas não tenham terminado", isCorrect: true },
                        { text: "O programa espera todas elas terminarem automaticamente", isCorrect: false },
                        { text: "As goroutines continuam rodando para sempre sozinhas", isCorrect: false },
                        { text: "O main nunca termina enquanto houver goroutines", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a distinção que o Go faz entre concorrência e paralelismo?",
                    difficulty: "dificil",
                    options: [
                        { text: "Paralelismo é sempre mais lento do que a concorrência em Go", isCorrect: false },
                        { text: "Concorrência estrutura tarefas; paralelismo as executa", isCorrect: true },
                        { text: "As duas palavras significam exatamente a mesma coisa", isCorrect: false },
                        { text: "Concorrência exige vários núcleos de processador", isCorrect: false },
                    ],
                },
                {
                    statement: "Quem gerencia as goroutines em execução?",
                    difficulty: "medio",
                    options: [
                        { text: "O sistema operacional sozinho", isCorrect: false },
                        { text: "O programador, manualmente, linha a linha", isCorrect: false },
                        { text: "O runtime do próprio Go", isCorrect: true },
                        { text: "O compilador, antes de o programa rodar", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Channels: comunicação entre goroutines",
            blocks: [
                {
                    type: "text",
                    value: "# Comunicar em vez de compartilhar\n\nUm lema famoso do Go é: \"não se comunique compartilhando memória; compartilhe memória comunicando-se\". A ferramenta para isso é o **channel**: um canal tipado por onde goroutines enviam e recebem valores com segurança.\n\n```\nch := make(chan int)   // canal de int\ngo func() {\n    ch <- 42           // envia 42 no canal\n}()\nvalor := <-ch          // recebe do canal: 42\n```\n\nO operador `<-` envia (`ch <- v`) e recebe (`v := <-ch`) valores.",
                },
                {
                    type: "text",
                    value: "## Channels sincronizam\n\nEm um channel comum (sem buffer), o envio **bloqueia** até que alguém receba, e o recebimento bloqueia até que alguém envie. Esse encontro sincroniza as goroutines de forma natural: quem recebe espera o dado ficar pronto. É assim que se coordena o trabalho concorrente sem travas manuais.\n\nQuando há vários channels a observar ao mesmo tempo, o `select` espera em vários deles e age no primeiro que estiver pronto, como um switch para operações de canal.",
                },
                {
                    type: "quote",
                    value: "Channels são canais tipados para goroutines trocarem valores com segurança. Em um channel sem buffer, o envio e o recebimento se sincronizam, coordenando o trabalho.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve um channel em Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Para goroutines enviarem e receberem valores com segurança", isCorrect: true },
                        { text: "Para declarar structs com muitos campos de dados", isCorrect: false },
                        { text: "Para converter tipos numéricos entre si no programa", isCorrect: false },
                        { text: "Para formatar a saída de texto no console", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um channel sem buffer, o que acontece ao enviar um valor?",
                    difficulty: "medio",
                    options: [
                        { text: "O envio bloqueia até que alguém receba o valor", isCorrect: true },
                        { text: "O valor é descartado se ninguém estiver ouvindo", isCorrect: false },
                        { text: "O envio nunca bloqueia, seguindo de imediato", isCorrect: false },
                        { text: "O programa encerra ao enviar em um channel", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o select permite fazer com channels?",
                    difficulty: "medio",
                    options: [
                        { text: "Esperar em vários channels e agir no primeiro pronto", isCorrect: true },
                        { text: "Criar um novo channel com um buffer bem maior", isCorrect: false },
                        { text: "Fechar todos os channels do programa de uma vez só", isCorrect: false },
                        { text: "Converter um channel em um slice de valores", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual operador envia e recebe valores em um channel?",
                    difficulty: "medio",
                    options: [
                        { text: "O sinal de igual =", isCorrect: false },
                        { text: "A seta <-", isCorrect: true },
                        { text: "Os dois pontos e igual :=", isCorrect: false },
                        { text: "O operador de soma +", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um channel sem buffer, o que acontece com quem tenta receber antes de haver envio?",
                    difficulty: "dificil",
                    options: [
                        { text: "Recebe o zero value do tipo naquele instante", isCorrect: false },
                        { text: "Recebe um erro, e o programa para", isCorrect: false },
                        { text: "Segue adiante sem receber nada", isCorrect: false },
                        { text: "Fica bloqueado até que alguém envie", isCorrect: true },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: revisão e próximos passos",
            blocks: [
                {
                    type: "text",
                    value: "# O que você percorreu\n\nVocê foi do zero à concorrência em Go:\n\n- **Fundamentos**: a linguagem compilada e simples, o primeiro programa, pacotes e a visibilidade por maiúscula ou minúscula.\n- **Tipos e fluxo**: variáveis com := e os zero values, tipos e conversões explícitas, if e switch (sem fall-through) e o for como único laço, com range.\n- **Funções**: múltiplos retornos, retornos nomeados, variádicas, defer e funções como valores.\n- **Dados**: slices e maps, com o cuidado do array compartilhado por baixo e o comma-ok.\n- **Tipos próprios**: structs e métodos com receiver, ponteiros, e composição por embedding.\n- **Interfaces**: o contrato implícito, o polimorfismo e a interface vazia com asserção de tipo.\n- **Erros**: erros como valores e o if err != nil, além de panic e recover.\n- **Concorrência**: goroutines e channels, a marca registrada do Go.",
                },
                {
                    type: "text",
                    value: "## Como continuar evoluindo\n\nGo se aprende escrevendo Go. Refaça os exemplos, quebre-os de propósito e conserte, e construa pequenos programas: uma ferramenta de linha de comando, uma API HTTP simples com o pacote padrão `net/http`, um processador de arquivos concorrente com goroutines e channels. A cada projeto, um conceito vira ferramenta.\n\nDepois destes fundamentos, os caminhos naturais incluem aprofundar na biblioteca padrão, escrever testes com o pacote `testing`, e construir serviços de rede, o forte do Go. Escolha o que combina com o seu objetivo e siga praticando.",
                },
                {
                    type: "quote",
                    value: "Você foi do primeiro programa às goroutines. O próximo passo é escrever muito Go: transforme cada conceito em pequenos projetos e serviços seus.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a melhor forma de fixar o que você aprendeu de Go?",
                    difficulty: "facil",
                    options: [
                        { text: "Escrever código: refazer exemplos e construir pequenos projetos", isCorrect: true },
                        { text: "Apenas reler a teoria, sem programar nada", isCorrect: false },
                        { text: "Decorar a sintaxe sem entender os conceitos", isCorrect: false },
                        { text: "Evitar a prática e pular direto a temas avançados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual par de recursos representa a marca registrada da concorrência em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "Goroutines e channels", isCorrect: true },
                        { text: "Classes e herança", isCorrect: false },
                        { text: "Exceções e try/catch", isCorrect: false },
                        { text: "Ponteiros e arrays fixos", isCorrect: false },
                    ],
                },
                {
                    statement: "Lembrar que erros são valores em Go importa porque:",
                    difficulty: "medio",
                    options: [
                        { text: "Você trata falhas com if err != nil, não com exceções", isCorrect: true },
                        { text: "Todo erro sempre derruba o programa de imediato", isCorrect: false },
                        { text: "Erros e panic significam exatamente a mesma coisa", isCorrect: false },
                        { text: "Erros não têm relação com o fluxo do programa", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual pacote padrão a aula sugere para escrever testes em Go?",
                    difficulty: "medio",
                    options: [
                        { text: "assert", isCorrect: false },
                        { text: "junit", isCorrect: false },
                        { text: "testing", isCorrect: true },
                        { text: "quicktest", isCorrect: false },
                    ],
                },
                {
                    statement: "Segundo a aula, qual pacote padrão serve para construir uma API HTTP simples?",
                    difficulty: "medio",
                    options: [
                        { text: "web/server", isCorrect: false },
                        { text: "net/http", isCorrect: true },
                        { text: "http/router", isCorrect: false },
                        { text: "fmt/web", isCorrect: false },
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
