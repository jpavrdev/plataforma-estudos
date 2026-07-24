// Seed da trilha Java (do básico ao avançado). Conteúdo autoral.
// Idempotente e não destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-java.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Java";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const DESCRICAO =
    "A linguagem Java do zero ao avançado: sintaxe e tipos, controle de fluxo, arrays e strings, métodos, orientação a objetos (classes, herança, polimorfismo e interfaces), coleções e generics, tratamento de exceções e o Java moderno com lambdas e streams. A base para back-end, Android e sistemas de grande escala.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULO_1: Modulo = {
    titulo: "Módulo 1 - Primeiros passos com Java",
    aulas: [
        {
            titulo: "O que é Java e a máquina virtual (JVM)",
            blocks: [
                {
                    type: "text",
                    value: "# O que é Java\n\nJava é uma linguagem de programação de propósito geral, criada na Sun Microsystems (hoje parte da Oracle) e lançada em 1995. Ela é uma das linguagens mais usadas do mundo, presente em back-ends de grandes sistemas, aplicativos Android, bancos e sistemas corporativos que rodam há décadas.\n\nJava é uma linguagem **orientada a objetos** e **fortemente tipada**: você declara o tipo de cada variável, e o compilador confere tudo antes de o programa rodar. Isso pega muitos erros cedo e é uma das razões de o Java ser tão usado em sistemas grandes, nos quais confiabilidade importa mais do que escrever poucas linhas.",
                },
                {
                    type: "text",
                    value: "## Escreva uma vez, rode em qualquer lugar\n\nO lema histórico do Java é \"write once, run anywhere\" (escreva uma vez, rode em qualquer lugar). O segredo por trás disso é a **JVM (Java Virtual Machine)**.\n\nSeu código Java não é compilado direto para a linguagem de um processador específico. Ele é compilado para um formato intermediário chamado **bytecode**. A JVM é um programa que lê esse bytecode e o executa na máquina onde está instalada, seja Windows, Linux ou Mac. Como existe uma JVM para cada sistema, o mesmo bytecode roda em todos eles sem recompilar.",
                },
                {
                    type: "table",
                    value: "[[\"Sigla\", \"O que é\"], [\"JVM\", \"A máquina virtual que executa o bytecode Java\"], [\"JRE\", \"O ambiente para rodar programas Java (inclui a JVM)\"], [\"JDK\", \"O kit de desenvolvimento: compilador e ferramentas para criar programas (inclui o JRE)\"]]",
                },
                {
                    type: "quote",
                    value: "Você escreve código Java, o compilador gera bytecode, e a JVM executa esse bytecode em qualquer sistema. É isso que torna o Java portável.",
                },
            ],
            questions: [
                {
                    statement: "O que a JVM (Java Virtual Machine) faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Executa o bytecode Java na máquina onde está instalada", isCorrect: true },
                        { text: "Converte o código Java diretamente em código de máquina de um processador", isCorrect: false },
                        { text: "Substitui a necessidade de escrever qualquer código-fonte", isCorrect: false },
                        { text: "Serve apenas para editar o texto dos programas Java", isCorrect: false },
                    ],
                },
                {
                    statement: "O que permite que o mesmo programa Java rode em Windows, Linux e Mac sem recompilar?",
                    difficulty: "facil",
                    options: [
                        { text: "O código vira bytecode, e cada sistema tem sua própria JVM", isCorrect: true },
                        { text: "O código é reescrito manualmente para cada sistema operacional", isCorrect: false },
                        { text: "O Java só funciona de fato em um único sistema operacional", isCorrect: false },
                        { text: "O processador entende o código-fonte Java diretamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Para desenvolver e compilar programas Java, qual componente você precisa instalar?",
                    difficulty: "medio",
                    options: [
                        { text: "O JDK, que inclui o compilador e as ferramentas de desenvolvimento", isCorrect: true },
                        { text: "Apenas a JVM isolada, sem nenhuma outra ferramenta", isCorrect: false },
                        { text: "Somente o JRE, que serve apenas para executar programas prontos", isCorrect: false },
                        { text: "Nenhum componente, pois o Java já vem em todo processador", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Seu primeiro programa: Hello World",
            blocks: [
                {
                    type: "text",
                    value: "# O primeiro programa\n\nTodo programa Java vive dentro de uma **classe**, e a execução começa por um método especial chamado `main`. Por enquanto, aceite essa estrutura como o esqueleto padrão; o significado de cada parte fica claro nas próximas aulas.\n\nSalve o arquivo com o mesmo nome da classe pública e a extensão `.java`. O programa abaixo deve estar em um arquivo chamado `Ola.java`.",
                },
                {
                    type: "code",
                    value: "public class Ola {\n    public static void main(String[] args) {\n        System.out.println(\"Olá, mundo!\");\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Compilar e executar\n\nJava tem duas etapas: primeiro compilar, depois executar.\n\n1. **Compilar** transforma o `.java` em bytecode, gerando um arquivo `.class`. Isso é feito pelo compilador `javac`.\n2. **Executar** roda o bytecode na JVM com o comando `java`.\n\nNo terminal, dentro da pasta do arquivo:",
                },
                {
                    type: "code",
                    value: "javac Ola.java   # gera o arquivo Ola.class (bytecode)\njava Ola         # executa; imprime: Olá, mundo!",
                },
                {
                    type: "text",
                    value: "## System.out.println\n\n`System.out.println(...)` imprime o valor entre parênteses no console e pula uma linha. O parente próximo `System.out.print(...)` faz o mesmo, mas sem pular a linha. Todo comando (statement) em Java termina com ponto e vírgula `;`.",
                },
            ],
            questions: [
                {
                    statement: "Por onde a execução de um programa Java começa?",
                    difficulty: "facil",
                    options: [
                        { text: "Pelo método main", isCorrect: true },
                        { text: "Pela primeira linha do arquivo, seja ela qual for", isCorrect: false },
                        { text: "Por qualquer método, escolhido de forma aleatória", isCorrect: false },
                        { text: "Pela última classe declarada no arquivo", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a ordem correta para rodar um programa Java a partir do código-fonte?",
                    difficulty: "facil",
                    options: [
                        { text: "Compilar com javac e depois executar com java", isCorrect: true },
                        { text: "Executar com java e depois compilar com javac", isCorrect: false },
                        { text: "Apenas executar com java, sem compilar antes", isCorrect: false },
                        { text: "Apenas compilar com javac, sem executar depois", isCorrect: false },
                    ],
                },
                {
                    statement: "O que System.out.println(\"Oi\") faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Imprime Oi no console e pula uma linha", isCorrect: true },
                        { text: "Imprime Oi sem nunca pular a linha seguinte", isCorrect: false },
                        { text: "Lê um valor digitado pelo usuário no console", isCorrect: false },
                        { text: "Declara uma variável chamada Oi no programa", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "A anatomia de um programa Java",
            blocks: [
                {
                    type: "text",
                    value: "# Desmontando o esqueleto\n\nAgora que o programa rodou, vamos entender cada parte da linha que declara o `main`:\n\n```\npublic static void main(String[] args)\n```\n\n- **public**: um modificador de acesso; significa que o método pode ser chamado de fora da classe. A JVM precisa disso para iniciar o programa.\n- **static**: o método pertence à classe, não a um objeto. Isso permite a JVM chamá-lo sem criar um objeto antes.\n- **void**: o tipo de retorno; `void` significa que o método não devolve nenhum valor.\n- **main**: o nome do método. É esse nome exato que a JVM procura para começar.\n- **String[] args**: um parâmetro que recebe argumentos passados pela linha de comando, em um array de strings.",
                },
                {
                    type: "text",
                    value: "## Blocos, chaves e ponto e vírgula\n\nJava usa **chaves** `{ }` para delimitar blocos: o corpo de uma classe, de um método, de um laço. Tudo o que pertence a um bloco fica entre suas chaves.\n\nCada instrução (statement) termina com **ponto e vírgula** `;`. Esquecer o ponto e vírgula é um dos erros de compilação mais comuns de quem está começando. Diferente de linguagens como Python, em Java a indentação é só para leitura: o que define os blocos são as chaves, não os espaços.",
                },
                {
                    type: "quote",
                    value: "Em Java, as chaves { } definem os blocos e o ponto e vírgula termina cada instrução. A indentação ajuda a ler, mas não muda o significado do código.",
                },
            ],
            questions: [
                {
                    statement: "No método main, o que a palavra static indica?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o método pertence à classe e pode ser chamado sem criar um objeto", isCorrect: true },
                        { text: "Que o método nunca pode receber nenhum parâmetro de entrada", isCorrect: false },
                        { text: "Que o método sempre devolve algum valor ao ser chamado", isCorrect: false },
                        { text: "Que o método só roda uma vez em toda a execução do programa", isCorrect: false },
                    ],
                },
                {
                    statement: "O que define os blocos de código em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "As chaves { }, que delimitam o início e o fim de cada bloco", isCorrect: true },
                        { text: "A indentação, ou seja, os espaços no início das linhas", isCorrect: false },
                        { text: "As vírgulas que separam as instruções entre si", isCorrect: false },
                        { text: "Os parênteses que envolvem as expressões do código", isCorrect: false },
                    ],
                },
                {
                    statement: "No método main, o que significa o void em 'public static void main'?",
                    difficulty: "medio",
                    options: [
                        { text: "Que o método não devolve nenhum valor", isCorrect: true },
                        { text: "Que o método devolve sempre um número inteiro", isCorrect: false },
                        { text: "Que o método é privado e invisível de fora", isCorrect: false },
                        { text: "Que o método não pode conter instruções dentro", isCorrect: false },
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
            titulo: "Variáveis e tipos primitivos",
            blocks: [
                {
                    type: "text",
                    value: "# Guardando valores\n\nUma **variável** é um espaço nomeado na memória que guarda um valor. Em Java, como a linguagem é fortemente tipada, você declara o **tipo** da variável antes de usá-la. O tipo diz que espécie de valor ela pode guardar e quanto espaço ocupa.\n\nA forma geral é `tipo nome = valor;`",
                },
                {
                    type: "code",
                    value: "int idade = 30;\ndouble preco = 19.90;\nboolean ativo = true;\nchar inicial = 'A';\n\nSystem.out.println(idade);   // 30\nSystem.out.println(preco);   // 19.9",
                },
                {
                    type: "text",
                    value: "## Os oito tipos primitivos\n\nJava tem oito tipos primitivos, que guardam valores simples diretamente. Os que mais aparecem no dia a dia:\n\n- **int**: números inteiros (ex.: 42, -7). É o tipo padrão para contagem.\n- **double**: números com casas decimais (ex.: 3.14). Padrão para valores reais.\n- **boolean**: apenas `true` ou `false`.\n- **char**: um único caractere, entre aspas simples (ex.: 'A').\n\nOs demais (`long`, `short`, `byte`, `float`) são variações de tamanho e precisão para casos específicos.",
                },
                {
                    type: "table",
                    value: "[[\"Tipo\", \"Guarda\", \"Exemplo\"], [\"int\", \"Número inteiro\", \"int n = 10;\"], [\"double\", \"Número com decimais\", \"double x = 2.5;\"], [\"boolean\", \"Verdadeiro ou falso\", \"boolean ok = true;\"], [\"char\", \"Um caractere\", \"char c = 'Z';\"]]",
                },
                {
                    type: "text",
                    value: "## Texto é String\n\nPara guardar texto (uma sequência de caracteres), usa-se o tipo `String`, com aspas duplas. Diferente dos oito primitivos, `String` é uma classe, mas você a usa desde o começo:\n\n```\nString nome = \"Ana\";\n```",
                },
            ],
            questions: [
                {
                    statement: "Qual tipo primitivo é o mais indicado para guardar um número inteiro, como uma contagem?",
                    difficulty: "facil",
                    options: [
                        { text: "int", isCorrect: true },
                        { text: "double", isCorrect: false },
                        { text: "boolean", isCorrect: false },
                        { text: "char", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se declara corretamente uma variável de texto em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "String nome = \"Ana\";", isCorrect: true },
                        { text: "text nome = 'Ana';", isCorrect: false },
                        { text: "String nome = 'Ana';", isCorrect: false },
                        { text: "char nome = \"Ana\";", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual tipo você usaria para guardar um valor com casas decimais, como um preço?",
                    difficulty: "facil",
                    options: [
                        { text: "double", isCorrect: true },
                        { text: "int", isCorrect: false },
                        { text: "boolean", isCorrect: false },
                        { text: "char", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Operadores aritméticos e de atribuição",
            blocks: [
                {
                    type: "text",
                    value: "# Fazendo contas\n\nJava tem os operadores aritméticos que você espera: `+` soma, `-` subtrai, `*` multiplica, `/` divide e `%` dá o resto da divisão (o operador módulo).",
                },
                {
                    type: "code",
                    value: "int a = 17;\nint b = 5;\nSystem.out.println(a + b);  // 22\nSystem.out.println(a - b);  // 12\nSystem.out.println(a * b);  // 85\nSystem.out.println(a % b);  // 2  (resto de 17 / 5)",
                },
                {
                    type: "text",
                    value: "## Cuidado com a divisão de inteiros\n\nUm ponto que pega quem começa: quando você divide dois `int`, o resultado também é `int`, e a parte decimal é descartada.\n\n```\nint x = 7 / 2;        // 3, e não 3.5\ndouble y = 7.0 / 2;   // 3.5, porque um dos números é double\n```\n\nSe quiser o resultado com casas decimais, ao menos um dos operandos precisa ser `double`.",
                },
                {
                    type: "text",
                    value: "## Operadores de atribuição e incremento\n\n`=` atribui um valor. Há atalhos que combinam operação e atribuição: `+=`, `-=`, `*=`, `/=`. E `++` e `--` somam ou subtraem 1.\n\n```\nint total = 10;\ntotal += 5;   // total agora é 15 (equivale a total = total + 5)\ntotal++;      // total agora é 16\n```",
                },
                {
                    type: "quote",
                    value: "int dividido por int dá int: 7 / 2 é 3. Para obter 3.5, faça a conta com pelo menos um double.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o resultado de 7 / 2 em Java, se ambos são int?",
                    difficulty: "facil",
                    options: [
                        { text: "3, porque a divisão de inteiros descarta a parte decimal", isCorrect: true },
                        { text: "3.5, porque o Java arredonda a divisão automaticamente", isCorrect: false },
                        { text: "4, porque o Java arredonda o resultado para cima", isCorrect: false },
                        { text: "Um erro de compilação, pois não se divide inteiros", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o operador % (módulo) retorna?",
                    difficulty: "facil",
                    options: [
                        { text: "O resto da divisão entre dois números", isCorrect: true },
                        { text: "O quociente exato da divisão entre dois números", isCorrect: false },
                        { text: "A porcentagem de um número em relação a outro", isCorrect: false },
                        { text: "O maior valor entre os dois números dados", isCorrect: false },
                    ],
                },
                {
                    statement: "Depois de 'int total = 10; total += 5;', qual é o valor de total?",
                    difficulty: "medio",
                    options: [
                        { text: "15, pois += soma o valor à variável", isCorrect: true },
                        { text: "5, pois += subtrai o valor da variável", isCorrect: false },
                        { text: "50, pois += multiplica a variável pelo valor", isCorrect: false },
                        { text: "10, pois += não altera a variável original", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Operadores relacionais e lógicos",
            blocks: [
                {
                    type: "text",
                    value: "# Comparando valores\n\nOperadores relacionais comparam dois valores e resultam em um `boolean` (`true` ou `false`):\n\n- `==` igual a\n- `!=` diferente de\n- `>` maior que, `<` menor que\n- `>=` maior ou igual, `<=` menor ou igual\n\nRepare que igualdade é `==` (dois sinais). Um só (`=`) é atribuição, não comparação.",
                },
                {
                    type: "code",
                    value: "int idade = 20;\nSystem.out.println(idade >= 18);  // true\nSystem.out.println(idade == 21);  // false\nSystem.out.println(idade != 21);  // true",
                },
                {
                    type: "text",
                    value: "## Combinando condições\n\nOperadores lógicos combinam expressões booleanas:\n\n- `&&` (E): verdadeiro só se ambos os lados forem verdadeiros.\n- `||` (OU): verdadeiro se ao menos um lado for verdadeiro.\n- `!` (NÃO): inverte o valor.\n\n```\nint idade = 25;\nboolean temCarteira = true;\nboolean podeDirigir = idade >= 18 && temCarteira;  // true\n```",
                },
                {
                    type: "quote",
                    value: "Comparar igualdade é ==; um único = é atribuição. Trocar um pelo outro é um erro clássico de quem começa.",
                },
            ],
            questions: [
                {
                    statement: "Qual operador compara se dois valores são iguais em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "==", isCorrect: true },
                        { text: "=", isCorrect: false },
                        { text: "!=", isCorrect: false },
                        { text: "=>", isCorrect: false },
                    ],
                },
                {
                    statement: "O operador && (E) resulta em true quando:",
                    difficulty: "facil",
                    options: [
                        { text: "Ambos os lados da expressão são verdadeiros", isCorrect: true },
                        { text: "Pelo menos um dos lados é verdadeiro", isCorrect: false },
                        { text: "Ambos os lados são falsos ao mesmo tempo", isCorrect: false },
                        { text: "Os dois lados têm valores numéricos diferentes", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é o resultado de '5 != 5' em Java?",
                    difficulty: "medio",
                    options: [
                        { text: "false, pois 5 é igual a 5, então não é diferente", isCorrect: true },
                        { text: "true, pois o operador != sempre retorna verdadeiro", isCorrect: false },
                        { text: "5, pois o operador devolve o próprio número", isCorrect: false },
                        { text: "Um erro, pois != não existe em Java", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Conversão de tipos e constantes",
            blocks: [
                {
                    type: "text",
                    value: "# Convertendo entre tipos\n\nÀs vezes é preciso passar um valor de um tipo para outro. Há duas situações:\n\n**Conversão implícita (widening)**: de um tipo menor para um maior, o Java faz sozinho, sem perda. Ex.: um `int` cabe em um `double`.\n\n```\nint n = 10;\ndouble d = n;   // 10.0, automático\n```",
                },
                {
                    type: "text",
                    value: "## Conversão explícita (casting)\n\nDe um tipo maior para um menor pode haver perda, então o Java exige que você declare a intenção com um **cast**, escrevendo o tipo entre parênteses.\n\n```\ndouble preco = 19.99;\nint arredondado = (int) preco;   // 19, a parte decimal é descartada\n```\n\nO cast de `double` para `int` não arredonda: ele corta a parte decimal.",
                },
                {
                    type: "text",
                    value: "## Constantes com final\n\nQuando um valor não deve mudar, declare a variável com `final`. Tentar alterá-la depois gera erro de compilação, o que protege contra mudanças acidentais. Por convenção, constantes usam nomes em maiúsculas.\n\n```\nfinal double PI = 3.14159;\n// PI = 3.0;  // erro de compilação: não se pode reatribuir um final\n```",
                },
                {
                    type: "quote",
                    value: "De tipo menor para maior, a conversão é automática. De maior para menor, use um cast explícito e saiba que pode haver perda.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao fazer '(int) 19.99' em Java?",
                    difficulty: "medio",
                    options: [
                        { text: "O resultado é 19, pois o cast descarta a parte decimal", isCorrect: true },
                        { text: "O resultado é 20, pois o cast arredonda para cima", isCorrect: false },
                        { text: "O resultado é 19.99, pois o cast não muda o valor", isCorrect: false },
                        { text: "Ocorre um erro, pois não se converte double em int", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve declarar uma variável como final?",
                    difficulty: "facil",
                    options: [
                        { text: "Para impedir que o valor dela seja alterado depois", isCorrect: true },
                        { text: "Para permitir que o valor mude livremente a qualquer momento", isCorrect: false },
                        { text: "Para transformar a variável em um método da classe", isCorrect: false },
                        { text: "Para apagar a variável ao fim do programa", isCorrect: false },
                    ],
                },
                {
                    statement: "Atribuir um int a um double, como 'double d = 10;', funciona porque:",
                    difficulty: "medio",
                    options: [
                        { text: "É uma conversão de tipo menor para maior, feita automaticamente", isCorrect: true },
                        { text: "É proibido em Java, e gera sempre um erro de compilação", isCorrect: false },
                        { text: "Exige sempre um cast explícito escrito entre parênteses", isCorrect: false },
                        { text: "O int e o double são exatamente o mesmo tipo em Java", isCorrect: false },
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
            titulo: "Condicionais: if, else if e else",
            blocks: [
                {
                    type: "text",
                    value: "# Tomando decisões\n\nO comando `if` executa um bloco de código apenas quando uma condição é verdadeira. A condição, entre parênteses, precisa ser uma expressão booleana.\n\n```\nint idade = 20;\nif (idade >= 18) {\n    System.out.println(\"Maior de idade\");\n}\n```",
                },
                {
                    type: "text",
                    value: "## if, else if e else\n\nPara tratar mais de um caso, encadeie com `else if` e feche com `else`, que cobre todo o resto. O Java testa as condições de cima para baixo e executa o primeiro bloco cuja condição for verdadeira.",
                },
                {
                    type: "code",
                    value: "int nota = 75;\nif (nota >= 90) {\n    System.out.println(\"A\");\n} else if (nota >= 70) {\n    System.out.println(\"B\");   // este bloco executa\n} else {\n    System.out.println(\"C\");\n}",
                },
                {
                    type: "quote",
                    value: "O else if trata casos adicionais e o else cobre todo o resto. O Java executa o primeiro bloco cuja condição for verdadeira e ignora os demais.",
                },
            ],
            questions: [
                {
                    statement: "O que precisa haver entre os parênteses de um if em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "Uma expressão booleana, que resulta em true ou false", isCorrect: true },
                        { text: "Sempre um número inteiro maior que zero", isCorrect: false },
                        { text: "Obrigatoriamente uma variável do tipo String", isCorrect: false },
                        { text: "Uma única palavra reservada da linguagem", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um encadeamento if / else if / else, quantos blocos são executados?",
                    difficulty: "medio",
                    options: [
                        { text: "Apenas o primeiro cuja condição for verdadeira", isCorrect: true },
                        { text: "Todos os blocos, um após o outro, sempre", isCorrect: false },
                        { text: "Sempre o último bloco, independentemente das condições", isCorrect: false },
                        { text: "Nenhum bloco, pois o else cancela os anteriores", isCorrect: false },
                    ],
                },
                {
                    statement: "Para o valor nota = 75 no exemplo com >= 90, >= 70 e else, o que é impresso?",
                    difficulty: "medio",
                    options: [
                        { text: "B, pois 75 falha em >= 90 mas passa em >= 70", isCorrect: true },
                        { text: "A, pois é o primeiro bloco do encadeamento", isCorrect: false },
                        { text: "C, pois cai direto no bloco else final", isCorrect: false },
                        { text: "A e B, pois os dois blocos são executados", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O comando switch",
            blocks: [
                {
                    type: "text",
                    value: "# Escolhendo entre vários casos\n\nQuando você compara uma mesma variável com vários valores fixos, o `switch` costuma ficar mais legível do que muitos `else if`. Cada `case` trata um valor, e o `default` cobre o que não se encaixar.",
                },
                {
                    type: "code",
                    value: "int dia = 3;\nswitch (dia) {\n    case 1:\n        System.out.println(\"Domingo\");\n        break;\n    case 3:\n        System.out.println(\"Terça\");   // executa\n        break;\n    default:\n        System.out.println(\"Outro dia\");\n}",
                },
                {
                    type: "text",
                    value: "## Cuidado com o break\n\nNo switch clássico, cada `case` precisa terminar com `break`. Sem ele, a execução \"cai\" para o próximo case (o fall-through), executando também o código seguinte, o que raramente é o desejado. Esquecer o `break` é uma fonte comum de bugs.\n\nVersões modernas do Java oferecem uma sintaxe de switch com seta (`->`) que evita esse problema, mas o switch com `case` e `break` continua muito comum.",
                },
                {
                    type: "quote",
                    value: "No switch clássico, sem break a execução cai para o próximo case. Coloque break ao fim de cada case para evitar o fall-through indesejado.",
                },
            ],
            questions: [
                {
                    statement: "No switch clássico, o que acontece se você esquecer o break ao fim de um case?",
                    difficulty: "medio",
                    options: [
                        { text: "A execução continua no próximo case (fall-through)", isCorrect: true },
                        { text: "O programa para imediatamente com um erro fatal", isCorrect: false },
                        { text: "O switch inteiro é simplesmente ignorado", isCorrect: false },
                        { text: "O default é executado antes de qualquer case", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve o default em um switch?",
                    difficulty: "facil",
                    options: [
                        { text: "Tratar os valores que não se encaixam em nenhum case", isCorrect: true },
                        { text: "Definir o primeiro case a ser testado sempre", isCorrect: false },
                        { text: "Encerrar o programa ao final do switch", isCorrect: false },
                        { text: "Repetir o switch desde o início uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o switch costuma ser mais legível do que vários else if?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao comparar a mesma variável com vários valores fixos", isCorrect: true },
                        { text: "Ao testar faixas de valores com maior e menor", isCorrect: false },
                        { text: "Ao combinar muitas condições com && e ||", isCorrect: false },
                        { text: "Ao repetir um bloco de código muitas vezes", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Laços while e do-while",
            blocks: [
                {
                    type: "text",
                    value: "# Repetindo enquanto uma condição é verdadeira\n\nO laço `while` repete um bloco enquanto a condição for verdadeira. A condição é testada **antes** de cada repetição, então o bloco pode nem rodar se a condição já começar falsa.",
                },
                {
                    type: "code",
                    value: "int contador = 1;\nwhile (contador <= 3) {\n    System.out.println(contador);\n    contador++;   // sem isso, o laço nunca terminaria\n}\n// imprime 1, 2, 3",
                },
                {
                    type: "text",
                    value: "## do-while: ao menos uma vez\n\nO `do-while` é parecido, mas testa a condição **depois** de executar o bloco. Por isso, o bloco roda ao menos uma vez, mesmo que a condição já seja falsa na primeira checagem.\n\n```\nint n = 10;\ndo {\n    System.out.println(n);   // imprime 10 uma vez\n    n++;\n} while (n <= 3);\n```",
                },
                {
                    type: "text",
                    value: "## Cuidado com o laço infinito\n\nSe a condição nunca fica falsa, o laço roda para sempre. Garanta que algo dentro do laço avança em direção ao fim, como incrementar um contador. Esquecer isso trava o programa.",
                },
                {
                    type: "quote",
                    value: "O while testa a condição antes e pode não rodar nenhuma vez; o do-while testa depois e roda ao menos uma vez.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a diferença central entre while e do-while?",
                    difficulty: "medio",
                    options: [
                        { text: "O do-while testa a condição depois, então roda ao menos uma vez", isCorrect: true },
                        { text: "O while nunca executa o bloco em nenhuma situação", isCorrect: false },
                        { text: "O do-while nunca executa o bloco em nenhuma situação", isCorrect: false },
                        { text: "Os dois são idênticos e sempre rodam o mesmo número de vezes", isCorrect: false },
                    ],
                },
                {
                    statement: "O que costuma causar um laço while infinito?",
                    difficulty: "facil",
                    options: [
                        { text: "A condição nunca se tornar falsa dentro do laço", isCorrect: true },
                        { text: "O uso de um contador do tipo int no laço", isCorrect: false },
                        { text: "Imprimir um valor a cada repetição do laço", isCorrect: false },
                        { text: "Declarar a variável fora do laço while", isCorrect: false },
                    ],
                },
                {
                    statement: "Quantas vezes 'while (contador <= 3)' imprime, com contador indo de 1 e somando 1 por vez?",
                    difficulty: "medio",
                    options: [
                        { text: "3 vezes, para os valores 1, 2 e 3", isCorrect: true },
                        { text: "4 vezes, para os valores 1, 2, 3 e 4", isCorrect: false },
                        { text: "1 vez, apenas para o valor inicial", isCorrect: false },
                        { text: "Infinitas vezes, pois o laço nunca termina", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "O laço for e o for-each",
            blocks: [
                {
                    type: "text",
                    value: "# O laço for\n\nO `for` reúne em uma linha três partes de um laço contado: a inicialização, a condição e o passo. É o formato preferido quando você sabe quantas vezes vai repetir.\n\n```\nfor (int i = 0; i < 5; i++) {\n    System.out.println(i);   // imprime 0, 1, 2, 3, 4\n}\n```\n\nLê-se: comece com `i = 0`; enquanto `i < 5`, execute o bloco; ao fim de cada volta, faça `i++`.",
                },
                {
                    type: "text",
                    value: "## O for-each: percorrer coleções\n\nQuando o objetivo é apenas percorrer todos os elementos de um array ou de uma coleção, sem se importar com o índice, o `for-each` é mais limpo. Ele lê como \"para cada elemento em\".\n\n```\nint[] numeros = {10, 20, 30};\nfor (int n : numeros) {\n    System.out.println(n);   // 10, 20, 30\n}\n```",
                },
                {
                    type: "text",
                    value: "## Quando usar cada um\n\nUse o `for` clássico quando precisar do índice (por exemplo, para modificar posições ou contar de trás para frente). Use o `for-each` quando só quiser ler cada elemento, do primeiro ao último. Os laços `break` (interrompe o laço) e `continue` (pula para a próxima volta) funcionam em todos eles.",
                },
                {
                    type: "quote",
                    value: "Precisa do índice ou de controle fino? for clássico. Só quer visitar cada elemento do começo ao fim? for-each.",
                },
            ],
            questions: [
                {
                    statement: "Quantas vezes o laço 'for (int i = 0; i < 5; i++)' executa o bloco?",
                    difficulty: "facil",
                    options: [
                        { text: "5 vezes, para i valendo 0, 1, 2, 3 e 4", isCorrect: true },
                        { text: "6 vezes, para i valendo de 0 até 5", isCorrect: false },
                        { text: "4 vezes, para i valendo de 1 até 4", isCorrect: false },
                        { text: "Infinitas vezes, pois i nunca chega ao fim", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o for-each é a melhor escolha?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao percorrer todos os elementos sem precisar do índice", isCorrect: true },
                        { text: "Ao precisar modificar posições específicas por índice", isCorrect: false },
                        { text: "Ao repetir um bloco um número fixo de vezes contadas", isCorrect: false },
                        { text: "Ao percorrer os elementos de trás para frente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o comando continue faz dentro de um laço?",
                    difficulty: "medio",
                    options: [
                        { text: "Pula para a próxima repetição do laço", isCorrect: true },
                        { text: "Encerra o laço por completo de imediato", isCorrect: false },
                        { text: "Reinicia o laço desde a primeira repetição", isCorrect: false },
                        { text: "Repete a mesma repetição atual mais uma vez", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_4: Modulo = {
    titulo: "Módulo 4 - Arrays e strings",
    aulas: [
        {
            titulo: "Arrays: guardando vários valores",
            blocks: [
                {
                    type: "text",
                    value: "# O que é um array\n\nUm **array** guarda vários valores do mesmo tipo em uma única variável, em posições numeradas. O tamanho é fixo: você o define na criação e ele não muda depois.\n\n```\nint[] numeros = {10, 20, 30};\nString[] nomes = new String[3];   // array vazio de 3 posições\n```",
                },
                {
                    type: "text",
                    value: "## Índices começam em zero\n\nCada posição tem um **índice**, e a contagem começa em 0. Assim, o primeiro elemento está em `numeros[0]` e o último em `numeros[tamanho - 1]`. A propriedade `length` dá o tamanho do array.\n\n```\nint[] numeros = {10, 20, 30};\nSystem.out.println(numeros[0]);        // 10\nSystem.out.println(numeros[2]);        // 30\nSystem.out.println(numeros.length);    // 3\n```",
                },
                {
                    type: "text",
                    value: "## Cuidado ao passar do fim\n\nAcessar um índice que não existe (como `numeros[3]` em um array de 3 posições) lança um erro em tempo de execução: a `ArrayIndexOutOfBoundsException`. Como o último índice é `length - 1`, é fácil errar por um. Percorrer com um laço `for` ou `for-each` evita esse deslize.",
                },
                {
                    type: "quote",
                    value: "Índices começam em 0, então o último elemento está em length - 1. Passar do fim lança ArrayIndexOutOfBoundsException.",
                },
            ],
            questions: [
                {
                    statement: "Em um array Java, qual é o índice do primeiro elemento?",
                    difficulty: "facil",
                    options: [
                        { text: "0, pois a contagem de índices começa em zero", isCorrect: true },
                        { text: "1, pois a contagem começa a partir de um", isCorrect: false },
                        { text: "Depende do tipo dos elementos guardados", isCorrect: false },
                        { text: "O índice do primeiro elemento é sempre length", isCorrect: false },
                    ],
                },
                {
                    statement: "Em 'int[] n = {10, 20, 30};', o que n.length retorna?",
                    difficulty: "facil",
                    options: [
                        { text: "3, o número de elementos do array", isCorrect: true },
                        { text: "2, o índice do último elemento", isCorrect: false },
                        { text: "30, o valor do último elemento", isCorrect: false },
                        { text: "0, pois o array começa vazio", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece ao acessar 'numeros[3]' em um array de 3 posições?",
                    difficulty: "medio",
                    options: [
                        { text: "Lança ArrayIndexOutOfBoundsException em tempo de execução", isCorrect: true },
                        { text: "Retorna o primeiro elemento, voltando ao início", isCorrect: false },
                        { text: "Retorna null sem causar nenhum problema", isCorrect: false },
                        { text: "Aumenta o array automaticamente para caber", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Strings e seus métodos",
            blocks: [
                {
                    type: "text",
                    value: "# String é uma classe\n\nDiferente dos tipos primitivos, `String` é uma classe, e um texto é um objeto com vários métodos úteis. Alguns dos mais usados:\n\n- `length()` devolve o número de caracteres.\n- `toUpperCase()` e `toLowerCase()` mudam a caixa.\n- `charAt(i)` devolve o caractere na posição i.\n- `substring(inicio, fim)` recorta um trecho.\n- `equals(outra)` compara o conteúdo de duas strings.",
                },
                {
                    type: "code",
                    value: "String nome = \"Java\";\nSystem.out.println(nome.length());        // 4\nSystem.out.println(nome.toUpperCase());   // JAVA\nSystem.out.println(nome.charAt(0));       // J",
                },
                {
                    type: "text",
                    value: "## Compare strings com equals, não com ==\n\nEste é um dos pontos que mais confunde: para comparar o **conteúdo** de duas strings, use `equals`, não `==`. O `==` compara se são o mesmo objeto na memória, o que nem sempre corresponde a terem o mesmo texto.\n\n```\nString a = \"oi\";\nString b = \"oi\";\nSystem.out.println(a.equals(b));   // true, mesmo conteúdo\n```",
                },
                {
                    type: "text",
                    value: "## Strings são imutáveis\n\nUm objeto `String` não pode ser alterado depois de criado: métodos como `toUpperCase()` não mudam a string original, eles devolvem uma **nova** string. Se você quer o resultado, precisa guardá-lo.\n\n```\nString s = \"abc\";\ns.toUpperCase();          // não muda s\nString maiuscula = s.toUpperCase();   // agora sim: \"ABC\"\n```",
                },
                {
                    type: "quote",
                    value: "Compare o conteúdo de strings com equals, não com ==. E lembre: métodos de String devolvem uma nova string, pois a original é imutável.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a forma correta de comparar o conteúdo de duas strings em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "Usando o método equals", isCorrect: true },
                        { text: "Usando o operador ==", isCorrect: false },
                        { text: "Usando o operador >", isCorrect: false },
                        { text: "Usando o método length", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'String s = \"abc\"; s.toUpperCase();' faz com a variável s?",
                    difficulty: "medio",
                    options: [
                        { text: "Nada: s continua \"abc\", pois strings são imutáveis", isCorrect: true },
                        { text: "Muda s para \"ABC\" no lugar, alterando a original", isCorrect: false },
                        { text: "Apaga o conteúdo de s, deixando-a vazia", isCorrect: false },
                        { text: "Gera um erro por chamar um método em String", isCorrect: false },
                    ],
                },
                {
                    statement: "O que 'nome.length()' retorna para a string \"Java\"?",
                    difficulty: "facil",
                    options: [
                        { text: "4, o número de caracteres da string", isCorrect: true },
                        { text: "3, o índice do último caractere", isCorrect: false },
                        { text: "1, pois conta a string como um item só", isCorrect: false },
                        { text: "J, o primeiro caractere da string", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Construindo texto com StringBuilder",
            blocks: [
                {
                    type: "text",
                    value: "# O custo de concatenar muitas strings\n\nComo strings são imutáveis, cada concatenação com `+` cria um novo objeto. Fazer isso poucas vezes é tranquilo, mas dentro de um laço que junta milhares de pedaços, criar e descartar tantos objetos fica caro.",
                },
                {
                    type: "code",
                    value: "// custoso em um laço grande: cada += cria uma nova String\nString resultado = \"\";\nfor (int i = 0; i < 1000; i++) {\n    resultado += i;\n}",
                },
                {
                    type: "text",
                    value: "## StringBuilder: texto mutável\n\nO `StringBuilder` é um objeto de texto **mutável**, feito para montar strings por partes de forma eficiente. Você usa `append(...)` para ir acrescentando e `toString()` no final para obter a String pronta.\n\n```\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 1000; i++) {\n    sb.append(i);\n}\nString resultado = sb.toString();\n```",
                },
                {
                    type: "quote",
                    value: "Para juntar muitas partes de texto, especialmente em laços, prefira o StringBuilder: ele é mutável e evita criar uma nova String a cada passo.",
                },
            ],
            questions: [
                {
                    statement: "Por que concatenar strings com + dentro de um laço grande pode ser ineficiente?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada concatenação cria um novo objeto String, pois elas são imutáveis", isCorrect: true },
                        { text: "O operador + não funciona com strings dentro de laços grandes", isCorrect: false },
                        { text: "Strings não podem ser usadas dentro de laços de repetição em Java", isCorrect: false },
                        { text: "O laço apaga a string original a cada repetição executada", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual classe é indicada para montar texto por partes de forma eficiente?",
                    difficulty: "facil",
                    options: [
                        { text: "StringBuilder", isCorrect: true },
                        { text: "Integer", isCorrect: false },
                        { text: "Boolean", isCorrect: false },
                        { text: "Math", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método do StringBuilder acrescenta um novo pedaço ao texto?",
                    difficulty: "facil",
                    options: [
                        { text: "append", isCorrect: true },
                        { text: "length", isCorrect: false },
                        { text: "equals", isCorrect: false },
                        { text: "charAt", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_5: Modulo = {
    titulo: "Módulo 5 - Métodos",
    aulas: [
        {
            titulo: "Criando e chamando métodos",
            blocks: [
                {
                    type: "text",
                    value: "# O que é um método\n\nUm **método** é um bloco de código com nome que executa uma tarefa e pode ser chamado quantas vezes você quiser. Métodos evitam repetição: você escreve a lógica uma vez e a reutiliza. O `main` que você já viu é um método.\n\n```\nstatic void saudar() {\n    System.out.println(\"Bem-vindo!\");\n}\n```\n\nPara executar, você **chama** o método pelo nome seguido de parênteses: `saudar();`.",
                },
                {
                    type: "text",
                    value: "## Por que separar em métodos\n\nDividir o programa em métodos traz três ganhos claros:\n\n- **Reuso**: escreva a lógica uma vez e chame-a de vários lugares.\n- **Legibilidade**: um nome bom (como `calcularMedia`) explica a intenção sem precisar ler o corpo.\n- **Manutenção**: se a regra muda, você altera em um lugar só.\n\nUm método deve idealmente fazer uma coisa bem feita, com um nome que descreva essa coisa.",
                },
                {
                    type: "quote",
                    value: "Métodos empacotam uma tarefa com nome, para você escrever a lógica uma vez e reutilizá-la. Um bom nome de método explica o que ele faz.",
                },
            ],
            questions: [
                {
                    statement: "Qual é o principal benefício de organizar o código em métodos?",
                    difficulty: "facil",
                    options: [
                        { text: "Reutilizar a mesma lógica sem repetir o código", isCorrect: true },
                        { text: "Fazer o programa rodar sem precisar da JVM", isCorrect: false },
                        { text: "Eliminar a necessidade de declarar tipos de variáveis", isCorrect: false },
                        { text: "Impedir que o programa tenha qualquer tipo de erro", isCorrect: false },
                    ],
                },
                {
                    statement: "Como se executa um método chamado saudar em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "Escrevendo saudar();", isCorrect: true },
                        { text: "Escrevendo call saudar;", isCorrect: false },
                        { text: "Escrevendo run(saudar);", isCorrect: false },
                        { text: "Escrevendo method saudar;", isCorrect: false },
                    ],
                },
                {
                    statement: "O método main de um programa Java é:",
                    difficulty: "medio",
                    options: [
                        { text: "Um método, o ponto de entrada por onde a execução começa", isCorrect: true },
                        { text: "Uma variável global que guarda o estado do programa", isCorrect: false },
                        { text: "Uma palavra reservada que não pode conter código", isCorrect: false },
                        { text: "Uma classe especial que não tem corpo próprio", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Parâmetros e valor de retorno",
            blocks: [
                {
                    type: "text",
                    value: "# Passando informação para o método\n\n**Parâmetros** são valores que o método recebe para trabalhar. Você declara o tipo e o nome de cada um entre os parênteses. Na chamada, você passa os **argumentos** correspondentes.\n\n```\nstatic void saudar(String nome) {\n    System.out.println(\"Olá, \" + nome);\n}\n\nsaudar(\"Ana\");   // Olá, Ana\n```",
                },
                {
                    type: "text",
                    value: "## Devolvendo um resultado\n\nO **tipo de retorno**, declarado antes do nome do método, diz que valor ele devolve. Se devolve algo, use `return`. Se não devolve nada, o tipo é `void`.\n\n```\nstatic int somar(int a, int b) {\n    return a + b;\n}\n\nint total = somar(3, 4);   // total é 7\n```\n\nO `return` também encerra o método na hora: nada depois dele é executado.",
                },
                {
                    type: "quote",
                    value: "Parâmetros entram no método; o valor de retorno sai dele. Um método void não devolve nada; um método com tipo de retorno usa return para devolver um valor.",
                },
            ],
            questions: [
                {
                    statement: "Em 'static int somar(int a, int b)', o que o int antes de somar indica?",
                    difficulty: "medio",
                    options: [
                        { text: "O tipo do valor que o método devolve", isCorrect: true },
                        { text: "O tipo do primeiro parâmetro recebido", isCorrect: false },
                        { text: "O número de parâmetros do método", isCorrect: false },
                        { text: "Que o método não devolve nenhum valor", isCorrect: false },
                    ],
                },
                {
                    statement: "O que a palavra void como tipo de retorno significa?",
                    difficulty: "facil",
                    options: [
                        { text: "Que o método não devolve nenhum valor", isCorrect: true },
                        { text: "Que o método devolve sempre um inteiro", isCorrect: false },
                        { text: "Que o método não recebe parâmetros", isCorrect: false },
                        { text: "Que o método só pode ser chamado uma vez", isCorrect: false },
                    ],
                },
                {
                    statement: "O que acontece com o código escrito depois de um return, na mesma execução?",
                    difficulty: "medio",
                    options: [
                        { text: "Não é executado, pois o return encerra o método", isCorrect: true },
                        { text: "É executado normalmente, após o retorno do valor", isCorrect: false },
                        { text: "É executado duas vezes por causa do return", isCorrect: false },
                        { text: "Gera um erro de compilação obrigatório", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Sobrecarga de métodos e escopo de variáveis",
            blocks: [
                {
                    type: "text",
                    value: "# Sobrecarga (overloading)\n\nJava permite ter vários métodos com o **mesmo nome**, desde que tenham **parâmetros diferentes** (em quantidade ou tipo). Isso se chama sobrecarga, e é útil para oferecer variações da mesma operação.\n\n```\nstatic int somar(int a, int b) {\n    return a + b;\n}\nstatic double somar(double a, double b) {\n    return a + b;\n}\n\nsomar(2, 3);       // usa a versão com int\nsomar(2.5, 3.5);   // usa a versão com double\n```\n\nO compilador escolhe a versão certa pelos tipos dos argumentos. Só o tipo de retorno diferente não basta para sobrecarregar.",
                },
                {
                    type: "text",
                    value: "## Escopo: onde a variável existe\n\nUma variável declarada dentro de um método (ou de um bloco) só existe ali dentro: é uma **variável local**. Fora do bloco onde foi criada, ela não pode ser usada. Cada método tem suas próprias variáveis locais, independentes das dos outros.\n\n```\nstatic void exemplo() {\n    int x = 10;   // x só existe dentro de exemplo\n}\n// aqui fora, x não existe\n```",
                },
                {
                    type: "quote",
                    value: "Sobrecarga é o mesmo nome de método com parâmetros diferentes. Variáveis locais só existem dentro do bloco onde foram declaradas.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza a sobrecarga (overloading) de métodos?",
                    difficulty: "medio",
                    options: [
                        { text: "Mesmo nome de método com listas de parâmetros diferentes", isCorrect: true },
                        { text: "Mesmo nome e mesmos parâmetros, mudando só o retorno", isCorrect: false },
                        { text: "Nomes diferentes para métodos que fazem a mesma coisa", isCorrect: false },
                        { text: "Um método que chama a si mesmo repetidamente", isCorrect: false },
                    ],
                },
                {
                    statement: "Onde uma variável local declarada dentro de um método pode ser usada?",
                    difficulty: "facil",
                    options: [
                        { text: "Apenas dentro do bloco onde foi declarada", isCorrect: true },
                        { text: "Em qualquer método de qualquer classe do programa", isCorrect: false },
                        { text: "Em todos os métodos da mesma classe", isCorrect: false },
                        { text: "Somente depois que o programa termina", isCorrect: false },
                    ],
                },
                {
                    statement: "Duas versões de um método com o mesmo nome e mesmos parâmetros, diferindo só no tipo de retorno:",
                    difficulty: "dificil",
                    options: [
                        { text: "Não compilam, pois isso não caracteriza sobrecarga válida", isCorrect: true },
                        { text: "Compilam normalmente como uma sobrecarga válida", isCorrect: false },
                        { text: "Fazem o método rodar duas vezes a cada chamada", isCorrect: false },
                        { text: "Transformam o método em um construtor da classe", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_6: Modulo = {
    titulo: "Módulo 6 - Orientação a objetos: classes e objetos",
    aulas: [
        {
            titulo: "Classes e objetos: o conceito central",
            blocks: [
                {
                    type: "text",
                    value: "# O coração do Java\n\nJava é uma linguagem orientada a objetos, e entender classes e objetos é o divisor de águas entre o básico e o intermediário.\n\nUma **classe** é um modelo, uma planta. Ela descreve como será um tipo de coisa: quais dados ela tem e o que ela sabe fazer. Um **objeto** é uma instância concreta dessa classe, construída a partir do modelo. A analogia clássica: a classe é a planta da casa; cada casa construída a partir dela é um objeto.",
                },
                {
                    type: "code",
                    value: "// a classe: o modelo\nclass Cachorro {\n    String nome;\n    void latir() {\n        System.out.println(nome + \" faz au au\");\n    }\n}\n\n// criando objetos a partir da classe\nCachorro rex = new Cachorro();\nrex.nome = \"Rex\";\nrex.latir();   // Rex faz au au",
                },
                {
                    type: "text",
                    value: "## new cria o objeto\n\nA palavra-chave `new` constrói um novo objeto a partir da classe e devolve uma referência a ele. Cada objeto tem sua própria cópia dos dados: se você criar dois cachorros, cada um tem o seu `nome`. O ponto (`.`) acessa os dados e métodos de um objeto: `rex.nome`, `rex.latir()`.",
                },
                {
                    type: "quote",
                    value: "A classe é o modelo; o objeto é uma instância concreta feita com new. Cada objeto tem sua própria cópia dos dados descritos na classe.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a relação entre uma classe e um objeto?",
                    difficulty: "facil",
                    options: [
                        { text: "A classe é o modelo; o objeto é uma instância concreta dela", isCorrect: true },
                        { text: "O objeto é o modelo; a classe é uma instância dele", isCorrect: false },
                        { text: "Classe e objeto são exatamente a mesma coisa", isCorrect: false },
                        { text: "A classe só existe depois que o objeto é criado", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual palavra-chave cria um novo objeto a partir de uma classe?",
                    difficulty: "facil",
                    options: [
                        { text: "new", isCorrect: true },
                        { text: "class", isCorrect: false },
                        { text: "object", isCorrect: false },
                        { text: "void", isCorrect: false },
                    ],
                },
                {
                    statement: "Se você cria dois objetos da mesma classe, o que acontece com os dados de cada um?",
                    difficulty: "medio",
                    options: [
                        { text: "Cada objeto tem a sua própria cópia dos dados", isCorrect: true },
                        { text: "Os dois objetos compartilham exatamente os mesmos dados", isCorrect: false },
                        { text: "Apenas o primeiro objeto criado possui dados", isCorrect: false },
                        { text: "Os dados existem só na classe, não nos objetos", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Atributos, métodos e construtores",
            blocks: [
                {
                    type: "text",
                    value: "# Os dados e o comportamento\n\nDentro de uma classe, os **atributos** (ou campos) guardam o estado do objeto, e os **métodos** definem o que ele faz. No exemplo do cachorro, `nome` é um atributo e `latir()` é um método.\n\nO **construtor** é um método especial que roda quando o objeto é criado com `new`. Ele serve para inicializar o objeto, geralmente recebendo valores para os atributos. Tem o mesmo nome da classe e não declara tipo de retorno.",
                },
                {
                    type: "code",
                    value: "class Cachorro {\n    String nome;\n    int idade;\n\n    // construtor: recebe os valores iniciais\n    Cachorro(String nome, int idade) {\n        this.nome = nome;\n        this.idade = idade;\n    }\n}\n\nCachorro rex = new Cachorro(\"Rex\", 3);\nSystem.out.println(rex.nome);   // Rex",
                },
                {
                    type: "text",
                    value: "## A referência this\n\nDentro do construtor acima, os parâmetros se chamam `nome` e `idade`, iguais aos atributos. A palavra `this` refere-se ao próprio objeto, então `this.nome = nome;` significa \"o atributo nome do objeto recebe o parâmetro nome\". O `this` desfaz a ambiguidade quando os nomes coincidem.\n\nSe você não declara nenhum construtor, o Java fornece um construtor padrão sem argumentos. Ao declarar o seu, esse padrão deixa de existir automaticamente.",
                },
                {
                    type: "quote",
                    value: "Atributos guardam o estado, métodos definem o comportamento, e o construtor inicializa o objeto ao ser criado com new. O this refere-se ao próprio objeto.",
                },
            ],
            questions: [
                {
                    statement: "Para que serve um construtor em uma classe Java?",
                    difficulty: "facil",
                    options: [
                        { text: "Inicializar o objeto no momento em que ele é criado", isCorrect: true },
                        { text: "Destruir o objeto quando ele não é mais usado", isCorrect: false },
                        { text: "Impedir que a classe seja instanciada com new", isCorrect: false },
                        { text: "Definir o tipo de retorno dos outros métodos", isCorrect: false },
                    ],
                },
                {
                    statement: "Dentro de um método de instância, a que a palavra this se refere?",
                    difficulty: "medio",
                    options: [
                        { text: "Ao próprio objeto em que o método está sendo executado", isCorrect: true },
                        { text: "À classe como um todo, e não a um objeto", isCorrect: false },
                        { text: "Ao último objeto criado no programa inteiro", isCorrect: false },
                        { text: "A um parâmetro obrigatório de todo método", isCorrect: false },
                    ],
                },
                {
                    statement: "O que diferencia um construtor de um método comum?",
                    difficulty: "medio",
                    options: [
                        { text: "Tem o nome da classe e não declara tipo de retorno", isCorrect: true },
                        { text: "Precisa sempre declarar void como tipo de retorno", isCorrect: false },
                        { text: "Só pode ser chamado depois que o objeto existe", isCorrect: false },
                        { text: "Nunca pode receber nenhum parâmetro de entrada", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Encapsulamento: private, getters e setters",
            blocks: [
                {
                    type: "text",
                    value: "# Protegendo o estado do objeto\n\n**Encapsulamento** é a ideia de esconder os detalhes internos de um objeto e controlar o acesso a eles. Na prática, você marca os atributos como `private`, o que impede o acesso direto de fora da classe, e oferece métodos públicos para ler e alterar esses dados de forma controlada.",
                },
                {
                    type: "code",
                    value: "class ContaBancaria {\n    private double saldo;\n\n    public double getSaldo() {\n        return saldo;\n    }\n\n    public void depositar(double valor) {\n        if (valor > 0) {\n            saldo += valor;   // só aceita valores positivos\n        }\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Getters, setters e regras\n\nMétodos que apenas leem um atributo costumam se chamar **getters** (como `getSaldo`), e os que alteram, **setters**. A vantagem de passar por eles, em vez de expor o atributo direto, é poder impor regras: no exemplo, `depositar` só aceita valores positivos. Se o saldo fosse público, qualquer código poderia colocá-lo em um valor inválido.\n\nEncapsular bem torna a classe segura de usar e livre para mudar por dentro sem quebrar quem a usa.",
                },
                {
                    type: "quote",
                    value: "Encapsular é deixar os atributos private e acessá-los por métodos públicos, que podem impor regras. Isso protege o objeto de estados inválidos.",
                },
            ],
            questions: [
                {
                    statement: "O que o modificador private em um atributo faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Impede o acesso direto ao atributo de fora da classe", isCorrect: true },
                        { text: "Permite que qualquer código altere o atributo livremente", isCorrect: false },
                        { text: "Transforma o atributo em um método da classe", isCorrect: false },
                        { text: "Torna o atributo compartilhado por todos os objetos", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é a principal vantagem de acessar atributos por getters e setters?",
                    difficulty: "medio",
                    options: [
                        { text: "Poder impor regras e proteger o objeto de estados inválidos", isCorrect: true },
                        { text: "Fazer o programa rodar mais rápido em qualquer caso", isCorrect: false },
                        { text: "Eliminar a necessidade de declarar os atributos", isCorrect: false },
                        { text: "Permitir que a classe funcione sem construtor", isCorrect: false },
                    ],
                },
                {
                    statement: "Encapsulamento é melhor descrito como:",
                    difficulty: "medio",
                    options: [
                        { text: "Esconder os detalhes internos e controlar o acesso a eles", isCorrect: true },
                        { text: "Copiar um objeto inteiro para criar outro igual", isCorrect: false },
                        { text: "Fazer uma classe herdar dados de outra classe", isCorrect: false },
                        { text: "Ter vários métodos com o mesmo nome na classe", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_7: Modulo = {
    titulo: "Módulo 7 - Herança, polimorfismo e interfaces",
    aulas: [
        {
            titulo: "Herança: reaproveitar e especializar",
            blocks: [
                {
                    type: "text",
                    value: "# Uma classe que aproveita a outra\n\n**Herança** permite que uma classe (a subclasse) reaproveite os atributos e métodos de outra (a superclasse) e acrescente ou especialize o que precisar. Em Java, usa-se a palavra `extends`.\n\nA ideia é modelar uma relação de \"é um tipo de\": um `Gato` é um tipo de `Animal`, então `Gato` pode herdar de `Animal` o que for comum e adicionar o que for específico.",
                },
                {
                    type: "code",
                    value: "class Animal {\n    String nome;\n    void comer() {\n        System.out.println(nome + \" está comendo\");\n    }\n}\n\nclass Gato extends Animal {\n    void miar() {\n        System.out.println(nome + \" faz miau\");\n    }\n}\n\nGato felix = new Gato();\nfelix.nome = \"Felix\";\nfelix.comer();   // herdado de Animal\nfelix.miar();    // próprio de Gato",
                },
                {
                    type: "text",
                    value: "## super e o construtor da superclasse\n\nA subclasse pode chamar o construtor da superclasse com `super(...)`, geralmente na primeira linha do seu próprio construtor, para inicializar a parte herdada. Java tem herança **simples**: uma classe estende no máximo uma outra, o que evita ambiguidades. Toda classe que não estende explicitamente ninguém herda de `Object`, a raiz de todas as classes.",
                },
                {
                    type: "quote",
                    value: "Herança com extends modela um é um tipo de: a subclasse reaproveita a superclasse e a especializa. Em Java, a herança é simples: no máximo uma superclasse.",
                },
            ],
            questions: [
                {
                    statement: "Qual palavra-chave estabelece herança entre duas classes em Java?",
                    difficulty: "facil",
                    options: [
                        { text: "extends", isCorrect: true },
                        { text: "inherits", isCorrect: false },
                        { text: "implements", isCorrect: false },
                        { text: "super", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma subclasse que estende outra classe:",
                    difficulty: "facil",
                    options: [
                        { text: "Reaproveita os atributos e métodos da superclasse", isCorrect: true },
                        { text: "Precisa reescrever todos os métodos da superclasse", isCorrect: false },
                        { text: "Perde acesso a tudo o que a superclasse define", isCorrect: false },
                        { text: "Não pode adicionar nenhum método próprio novo", isCorrect: false },
                    ],
                },
                {
                    statement: "Sobre a herança em Java, qual afirmação é correta?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma classe estende no máximo uma superclasse (herança simples)", isCorrect: true },
                        { text: "Uma classe pode estender várias superclasses ao mesmo tempo", isCorrect: false },
                        { text: "Herança não existe na linguagem Java", isCorrect: false },
                        { text: "A subclasse deve ter o mesmo nome da superclasse", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Sobrescrita e polimorfismo",
            blocks: [
                {
                    type: "text",
                    value: "# Redefinindo um método herdado\n\nA subclasse pode **sobrescrever** (override) um método herdado, dando a ele um novo comportamento. Usa-se a anotação `@Override` para deixar a intenção clara e deixar o compilador conferir que você realmente está sobrescrevendo um método existente.",
                },
                {
                    type: "code",
                    value: "class Animal {\n    void emitirSom() {\n        System.out.println(\"Som genérico\");\n    }\n}\n\nclass Gato extends Animal {\n    @Override\n    void emitirSom() {\n        System.out.println(\"Miau\");\n    }\n}",
                },
                {
                    type: "text",
                    value: "## Polimorfismo: uma referência, vários comportamentos\n\n**Polimorfismo** é a capacidade de tratar objetos de subclasses diferentes através de uma referência do tipo da superclasse, e cada um responder do seu jeito. Você chama o mesmo método, e o objeto real decide qual versão roda.\n\n```\nAnimal a = new Gato();\na.emitirSom();   // Miau, e não Som genérico\n```\n\nMesmo a referência sendo do tipo `Animal`, o objeto é um `Gato`, então a versão sobrescrita é executada. Isso permite escrever código que funciona com qualquer `Animal` sem saber o tipo exato.",
                },
                {
                    type: "quote",
                    value: "Sobrescrever é dar novo comportamento a um método herdado. Polimorfismo é a mesma chamada executar a versão do objeto real, decidida em tempo de execução.",
                },
            ],
            questions: [
                {
                    statement: "O que significa sobrescrever (override) um método?",
                    difficulty: "medio",
                    options: [
                        { text: "Redefinir na subclasse um método herdado da superclasse", isCorrect: true },
                        { text: "Criar dois métodos de mesmo nome e parâmetros diferentes", isCorrect: false },
                        { text: "Chamar o construtor da superclasse com super", isCorrect: false },
                        { text: "Impedir que a subclasse acesse o método", isCorrect: false },
                    ],
                },
                {
                    statement: "Com 'Animal a = new Gato();', o que 'a.emitirSom()' executa, se Gato sobrescreve o método?",
                    difficulty: "dificil",
                    options: [
                        { text: "A versão de Gato, pois o objeto real é um Gato", isCorrect: true },
                        { text: "A versão de Animal, pois a referência é do tipo Animal", isCorrect: false },
                        { text: "As duas versões, uma após a outra", isCorrect: false },
                        { text: "Nenhuma, pois a atribuição é inválida", isCorrect: false },
                    ],
                },
                {
                    statement: "Para que serve a anotação @Override antes de um método?",
                    difficulty: "medio",
                    options: [
                        { text: "Deixar claro que sobrescreve e deixar o compilador conferir", isCorrect: true },
                        { text: "Impedir que o método seja herdado pelas subclasses", isCorrect: false },
                        { text: "Transformar o método em um construtor da classe", isCorrect: false },
                        { text: "Fazer o método rodar antes de todos os outros", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Classes abstratas e interfaces",
            blocks: [
                {
                    type: "text",
                    value: "# Classes abstratas\n\nUma **classe abstrata** serve de base para outras, mas não pode ser instanciada diretamente com `new`. Ela pode ter métodos comuns já implementados e **métodos abstratos**, que são declarados sem corpo e que as subclasses são obrigadas a implementar. Use `abstract` na classe e nos métodos sem corpo.\n\n```\nabstract class Forma {\n    abstract double area();   // sem corpo: cada forma calcula do seu jeito\n}\n```",
                },
                {
                    type: "text",
                    value: "# Interfaces: um contrato\n\nUma **interface** define um contrato: um conjunto de métodos que uma classe se compromete a fornecer, sem dizer como. A classe usa `implements` e é obrigada a implementar os métodos da interface. Diferente da herança de classe, uma classe pode implementar **várias** interfaces.\n\n```\ninterface Voador {\n    void voar();\n}\n\nclass Passaro implements Voador {\n    public void voar() {\n        System.out.println(\"Voando\");\n    }\n}\n```",
                },
                {
                    type: "table",
                    value: "[[\"Aspecto\", \"Classe abstrata\", \"Interface\"], [\"Palavra na classe\", \"extends\", \"implements\"], [\"Quantas por classe\", \"Uma só\", \"Várias ao mesmo tempo\"], [\"Foco\", \"Base comum com parte já pronta\", \"Contrato de comportamento\"]]",
                },
                {
                    type: "quote",
                    value: "Classe abstrata é uma base que não se instancia e obriga a implementar seus métodos abstratos. Interface é um contrato, e uma classe pode implementar várias.",
                },
            ],
            questions: [
                {
                    statement: "O que caracteriza uma classe abstrata?",
                    difficulty: "medio",
                    options: [
                        { text: "Serve de base e não pode ser instanciada diretamente com new", isCorrect: true },
                        { text: "É idêntica a uma classe comum em todos os aspectos", isCorrect: false },
                        { text: "Não pode ter nenhum método já implementado", isCorrect: false },
                        { text: "Pode ser criada com new como qualquer outra", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual palavra-chave uma classe usa para adotar uma interface?",
                    difficulty: "facil",
                    options: [
                        { text: "implements", isCorrect: true },
                        { text: "extends", isCorrect: false },
                        { text: "abstract", isCorrect: false },
                        { text: "super", isCorrect: false },
                    ],
                },
                {
                    statement: "Uma diferença entre interfaces e herança de classe em Java é que:",
                    difficulty: "dificil",
                    options: [
                        { text: "Uma classe pode implementar várias interfaces, mas estender só uma classe", isCorrect: true },
                        { text: "Uma classe pode estender várias classes, mas só uma interface", isCorrect: false },
                        { text: "Interfaces não podem declarar nenhum método", isCorrect: false },
                        { text: "Interfaces só funcionam com tipos primitivos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_8: Modulo = {
    titulo: "Módulo 8 - Coleções, generics e exceções",
    aulas: [
        {
            titulo: "Listas com ArrayList",
            blocks: [
                {
                    type: "text",
                    value: "# Além dos arrays\n\nArrays têm tamanho fixo, o que atrapalha quando você não sabe quantos elementos virão. As **coleções** do Java resolvem isso. A mais usada é a `ArrayList`, uma lista que cresce e diminui conforme você adiciona e remove itens.\n\n```\nimport java.util.ArrayList;\nimport java.util.List;\n\nList<String> nomes = new ArrayList<>();\nnomes.add(\"Ana\");\nnomes.add(\"Bruno\");\nSystem.out.println(nomes.size());     // 2\nSystem.out.println(nomes.get(0));     // Ana\n```",
                },
                {
                    type: "text",
                    value: "## Métodos comuns e o tipo entre < >\n\nA `List` oferece `add` (adicionar), `get(indice)` (ler), `remove` (remover), `size()` (quantidade) e funciona bem com o `for-each`. O `<String>` diz que a lista guarda strings; isso é um **generic**, tema da próxima aula. Repare que usamos o tipo `List` na declaração e `ArrayList` na criação: programar para a interface `List` deixa o código flexível.",
                },
                {
                    type: "quote",
                    value: "Arrays têm tamanho fixo; a ArrayList cresce e diminui conforme você adiciona e remove. Use add, get, remove e size para trabalhar com ela.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a vantagem de uma ArrayList sobre um array comum?",
                    difficulty: "facil",
                    options: [
                        { text: "Ela cresce e diminui de tamanho conforme necessário", isCorrect: true },
                        { text: "Ela é sempre mais rápida em qualquer operação", isCorrect: false },
                        { text: "Ela dispensa a declaração do tipo dos elementos", isCorrect: false },
                        { text: "Ela guarda valores de qualquer tipo misturados", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual método adiciona um elemento a uma ArrayList?",
                    difficulty: "facil",
                    options: [
                        { text: "add", isCorrect: true },
                        { text: "push", isCorrect: false },
                        { text: "insert", isCorrect: false },
                        { text: "append", isCorrect: false },
                    ],
                },
                {
                    statement: "Em 'List<String> nomes = new ArrayList<>();', o que size() retorna logo após dois add?",
                    difficulty: "medio",
                    options: [
                        { text: "2, o número de elementos adicionados", isCorrect: true },
                        { text: "0, pois a lista sempre começa vazia", isCorrect: false },
                        { text: "1, pois conta a lista como um item só", isCorrect: false },
                        { text: "O último elemento adicionado à lista", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Conjuntos e mapas: Set e Map",
            blocks: [
                {
                    type: "text",
                    value: "# Set: elementos únicos\n\nUm `Set` é uma coleção que **não permite duplicatas**. Tentar adicionar um elemento que já existe simplesmente não faz nada. É ideal quando você quer garantir unicidade, como uma lista de e-mails sem repetição. A implementação comum é a `HashSet`.\n\n```\nSet<String> tags = new HashSet<>();\ntags.add(\"java\");\ntags.add(\"java\");   // ignorado, já existe\nSystem.out.println(tags.size());   // 1\n```",
                },
                {
                    type: "text",
                    value: "# Map: pares de chave e valor\n\nUm `Map` associa **chaves a valores**, como um dicionário. Cada chave é única e aponta para um valor. Você usa `put(chave, valor)` para inserir e `get(chave)` para recuperar. A implementação comum é a `HashMap`.\n\n```\nMap<String, Integer> idades = new HashMap<>();\nidades.put(\"Ana\", 30);\nidades.put(\"Bruno\", 25);\nSystem.out.println(idades.get(\"Ana\"));   // 30\n```",
                },
                {
                    type: "table",
                    value: "[[\"Coleção\", \"Guarda\", \"Permite duplicatas?\"], [\"List\", \"Sequência ordenada por índice\", \"Sim\"], [\"Set\", \"Elementos únicos\", \"Não\"], [\"Map\", \"Pares de chave e valor\", \"Chaves não; valores sim\"]]",
                },
                {
                    type: "quote",
                    value: "List é sequência com índice e aceita repetição; Set guarda elementos únicos; Map associa chaves únicas a valores, como um dicionário.",
                },
            ],
            questions: [
                {
                    statement: "O que acontece ao adicionar um elemento repetido a um Set?",
                    difficulty: "facil",
                    options: [
                        { text: "Nada, pois um Set não permite duplicatas", isCorrect: true },
                        { text: "O elemento é adicionado uma segunda vez", isCorrect: false },
                        { text: "O Set inteiro é apagado por causa do conflito", isCorrect: false },
                        { text: "O programa lança um erro em tempo de execução", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual coleção associa chaves a valores, como um dicionário?",
                    difficulty: "facil",
                    options: [
                        { text: "Map", isCorrect: true },
                        { text: "List", isCorrect: false },
                        { text: "Set", isCorrect: false },
                        { text: "Array", isCorrect: false },
                    ],
                },
                {
                    statement: "Em um Map<String, Integer>, o que representa o Integer?",
                    difficulty: "medio",
                    options: [
                        { text: "O tipo do valor associado a cada chave", isCorrect: true },
                        { text: "O tipo da chave usada para buscar", isCorrect: false },
                        { text: "O número máximo de pares no mapa", isCorrect: false },
                        { text: "O índice de cada elemento do mapa", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Generics: coleções com tipo",
            blocks: [
                {
                    type: "text",
                    value: "# O que os < > significam\n\n**Generics** permitem que uma classe ou método trabalhe com um tipo definido por quem a usa, mantendo a segurança de tipos. Quando você escreve `List<String>`, está dizendo que a lista guarda strings, e o compilador passa a garantir isso: tentar adicionar um número gera erro de compilação.",
                },
                {
                    type: "code",
                    value: "List<String> nomes = new ArrayList<>();\nnomes.add(\"Ana\");\n// nomes.add(42);   // erro de compilação: 42 não é String\n\nString primeiro = nomes.get(0);   // sem precisar de cast",
                },
                {
                    type: "text",
                    value: "## Por que isso importa\n\nSem generics, uma coleção guardaria `Object` (qualquer coisa), e você precisaria fazer casts a cada leitura, correndo o risco de erros só descobertos ao rodar. Com generics, os erros de tipo aparecem na compilação e o código fica mais legível, sem casts. É por isso que praticamente toda coleção moderna em Java usa generics.",
                },
                {
                    type: "quote",
                    value: "Generics dizem ao compilador qual tipo a coleção guarda, pegando erros de tipo na compilação e dispensando casts na leitura.",
                },
            ],
            questions: [
                {
                    statement: "O que 'List<String>' garante?",
                    difficulty: "medio",
                    options: [
                        { text: "Que a lista só aceita elementos do tipo String", isCorrect: true },
                        { text: "Que a lista tem no máximo uma String dentro", isCorrect: false },
                        { text: "Que a lista converte tudo em String automaticamente", isCorrect: false },
                        { text: "Que a lista não pode ser percorrida com for-each", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual é um benefício dos generics em coleções?",
                    difficulty: "medio",
                    options: [
                        { text: "Pegar erros de tipo na compilação e evitar casts", isCorrect: true },
                        { text: "Fazer a coleção crescer mais rápido em memória", isCorrect: false },
                        { text: "Permitir misturar qualquer tipo sem restrição", isCorrect: false },
                        { text: "Dispensar a importação das classes de coleção", isCorrect: false },
                    ],
                },
                {
                    statement: "Ao tentar adicionar um int a uma List<String>, o que ocorre?",
                    difficulty: "medio",
                    options: [
                        { text: "Um erro de compilação, pois o tipo não confere", isCorrect: true },
                        { text: "O int é convertido em String silenciosamente", isCorrect: false },
                        { text: "A lista aceita o int sem qualquer problema", isCorrect: false },
                        { text: "O programa só falha ao rodar, nunca ao compilar", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Exceções: tratando erros",
            blocks: [
                {
                    type: "text",
                    value: "# Quando algo dá errado\n\nDurante a execução, situações inesperadas podem ocorrer: dividir por zero, acessar um índice inexistente, abrir um arquivo que não existe. Java representa esses eventos como **exceções**. Sem tratamento, uma exceção interrompe o programa.\n\nPara tratá-la, envolva o código arriscado em um bloco `try` e trate o problema no `catch`.",
                },
                {
                    type: "code",
                    value: "try {\n    int resultado = 10 / 0;   // lança ArithmeticException\n} catch (ArithmeticException e) {\n    System.out.println(\"Não é possível dividir por zero\");\n}",
                },
                {
                    type: "text",
                    value: "## try, catch e finally\n\nO `try` contém o código que pode falhar. O `catch` captura um tipo de exceção e reage a ele, permitindo o programa continuar. O bloco opcional `finally` roda sempre, com erro ou sem erro, e é ideal para liberar recursos, como fechar um arquivo.\n\nTratar exceções deixa o programa robusto: em vez de quebrar, ele lida com o imprevisto e segue de forma controlada.",
                },
                {
                    type: "quote",
                    value: "Código arriscado vai no try; o catch captura a exceção e reage; o finally roda sempre, ideal para liberar recursos. Assim o programa não quebra no imprevisto.",
                },
            ],
            questions: [
                {
                    statement: "Qual bloco contém o código que pode lançar uma exceção?",
                    difficulty: "facil",
                    options: [
                        { text: "O bloco try", isCorrect: true },
                        { text: "O bloco catch", isCorrect: false },
                        { text: "O bloco finally", isCorrect: false },
                        { text: "O bloco switch", isCorrect: false },
                    ],
                },
                {
                    statement: "O que o bloco catch faz?",
                    difficulty: "facil",
                    options: [
                        { text: "Captura uma exceção e reage a ela, evitando a quebra", isCorrect: true },
                        { text: "Executa o código arriscado que pode falhar", isCorrect: false },
                        { text: "Roda sempre, com ou sem erro", isCorrect: false },
                        { text: "Lança uma exceção de propósito no programa", isCorrect: false },
                    ],
                },
                {
                    statement: "Quando o bloco finally é executado?",
                    difficulty: "medio",
                    options: [
                        { text: "Sempre, tenha ocorrido uma exceção ou não", isCorrect: true },
                        { text: "Apenas quando uma exceção é lançada", isCorrect: false },
                        { text: "Apenas quando nenhuma exceção é lançada", isCorrect: false },
                        { text: "Nunca, pois é um bloco apenas decorativo", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULO_9: Modulo = {
    titulo: "Módulo 9 - Java moderno: lambdas e streams",
    aulas: [
        {
            titulo: "Interfaces funcionais e expressões lambda",
            blocks: [
                {
                    type: "text",
                    value: "# Comportamento como valor\n\nA partir do Java 8, a linguagem ganhou recursos de programação funcional. A ideia central é poder tratar um **comportamento** como um valor: passar um pedaço de lógica para um método, como se passa um número.\n\nUma **expressão lambda** é uma função anônima curta, escrita com a seta `->`. Ela representa a implementação de uma **interface funcional**, ou seja, uma interface com um único método abstrato.",
                },
                {
                    type: "code",
                    value: "// interface funcional: um único método\ninterface Operacao {\n    int aplicar(int a, int b);\n}\n\n// lambda que implementa a Operacao\nOperacao soma = (a, b) -> a + b;\nSystem.out.println(soma.aplicar(3, 4));   // 7",
                },
                {
                    type: "text",
                    value: "## Por que isso é útil\n\nAntes das lambdas, passar um comportamento exigia escrever uma classe inteira só para envolver um método. A lambda expressa a mesma ideia em uma linha. Isso brilha ao trabalhar com coleções: ordenar por um critério, filtrar por uma condição ou transformar cada elemento vira uma expressão curta, em vez de muito código repetitivo.",
                },
                {
                    type: "quote",
                    value: "Uma lambda é uma função anônima escrita com ->, que implementa uma interface funcional (de método único). Ela permite passar comportamento como se fosse um valor.",
                },
            ],
            questions: [
                {
                    statement: "O que é uma expressão lambda em Java?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma função anônima curta, escrita com a seta ->", isCorrect: true },
                        { text: "Uma classe abstrata que não pode ser instanciada", isCorrect: false },
                        { text: "Um tipo primitivo para guardar funções", isCorrect: false },
                        { text: "Um laço que percorre coleções automaticamente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que é uma interface funcional?",
                    difficulty: "medio",
                    options: [
                        { text: "Uma interface com um único método abstrato", isCorrect: true },
                        { text: "Uma interface com muitos métodos abstratos", isCorrect: false },
                        { text: "Uma classe que implementa várias interfaces", isCorrect: false },
                        { text: "Uma interface que não declara nenhum método", isCorrect: false },
                    ],
                },
                {
                    statement: "Qual vantagem as lambdas trazem ao trabalhar com coleções?",
                    difficulty: "facil",
                    options: [
                        { text: "Expressar filtros e transformações de forma curta", isCorrect: true },
                        { text: "Fazer a coleção crescer de tamanho sozinha", isCorrect: false },
                        { text: "Eliminar a necessidade de declarar os tipos", isCorrect: false },
                        { text: "Impedir qualquer erro em tempo de execução", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Streams: processando coleções de forma declarativa",
            blocks: [
                {
                    type: "text",
                    value: "# Descrever o que fazer, não como\n\nA **Stream API** permite processar coleções de forma declarativa: você encadeia operações como filtrar, transformar e reduzir, e o Java cuida de percorrer os elementos. O código diz o **que** você quer, não o passo a passo do laço.\n\nUma stream é criada a partir de uma coleção com `stream()`, seguida de operações encadeadas.",
                },
                {
                    type: "code",
                    value: "List<Integer> numeros = List.of(1, 2, 3, 4, 5, 6);\n\nint soma = numeros.stream()\n    .filter(n -> n % 2 == 0)   // mantém os pares: 2, 4, 6\n    .mapToInt(n -> n)\n    .sum();                    // soma: 12\n\nSystem.out.println(soma);",
                },
                {
                    type: "text",
                    value: "## Operações intermediárias e terminais\n\nAs operações dividem-se em duas categorias. As **intermediárias**, como `filter` (filtra) e `map` (transforma cada elemento), devolvem outra stream e podem ser encadeadas. As **terminais**, como `collect`, `sum` ou `forEach`, encerram a stream e produzem um resultado. Nada é executado até uma operação terminal ser chamada.\n\nStreams deixam o código de manipulação de dados mais legível e enxuto do que os laços equivalentes, especialmente quando há vários passos.",
                },
                {
                    type: "quote",
                    value: "Streams processam coleções de forma declarativa: operações intermediárias (filter, map) encadeiam, e uma terminal (collect, sum) produz o resultado.",
                },
            ],
            questions: [
                {
                    statement: "O que a operação filter faz em uma stream?",
                    difficulty: "facil",
                    options: [
                        { text: "Mantém apenas os elementos que atendem a uma condição", isCorrect: true },
                        { text: "Transforma cada elemento em outro valor", isCorrect: false },
                        { text: "Soma todos os elementos da stream", isCorrect: false },
                        { text: "Ordena os elementos em ordem crescente", isCorrect: false },
                    ],
                },
                {
                    statement: "O que caracteriza uma operação terminal em uma stream?",
                    difficulty: "medio",
                    options: [
                        { text: "Encerra a stream e produz um resultado, como sum ou collect", isCorrect: true },
                        { text: "Devolve outra stream para continuar o encadeamento", isCorrect: false },
                        { text: "Cria a stream a partir de uma coleção original", isCorrect: false },
                        { text: "Apenas declara a stream sem executá-la nunca", isCorrect: false },
                    ],
                },
                {
                    statement: "A operação map em uma stream serve para:",
                    difficulty: "medio",
                    options: [
                        { text: "Transformar cada elemento em outro valor", isCorrect: true },
                        { text: "Remover os elementos duplicados da coleção", isCorrect: false },
                        { text: "Contar quantos elementos existem na stream", isCorrect: false },
                        { text: "Associar chaves a valores como em um Map", isCorrect: false },
                    ],
                },
            ],
        },
        {
            titulo: "Fechamento: revisão e próximos passos",
            blocks: [
                {
                    type: "text",
                    value: "# O que você percorreu\n\nVocê saiu do zero e chegou ao Java moderno:\n\n- **Fundamentos**: a JVM, o primeiro programa, variáveis e tipos, operadores.\n- **Controle de fluxo**: condicionais, switch e os laços while, do-while, for e for-each.\n- **Arrays e strings**: coleções de tamanho fixo, os métodos de String, a imutabilidade e o StringBuilder.\n- **Métodos**: parâmetros, retorno, sobrecarga e escopo.\n- **Orientação a objetos**: classes e objetos, construtores, encapsulamento, herança, polimorfismo, classes abstratas e interfaces.\n- **Coleções e robustez**: List, Set, Map, generics e o tratamento de exceções.\n- **Java moderno**: lambdas e a Stream API.",
                },
                {
                    type: "text",
                    value: "## Como continuar evoluindo\n\nO melhor jeito de fixar Java é escrever código. Refaça os exemplos, modifique-os e crie pequenos programas seus: uma agenda de contatos com uma classe e uma lista, uma calculadora com métodos, um pequeno sistema com herança. A cada projeto, um conceito deixa de ser teoria e vira ferramenta.\n\nDepois destes fundamentos, os caminhos naturais incluem aprofundar em coleções e algoritmos, conhecer um framework de back-end como o Spring, ou praticar orientação a objetos resolvendo desafios de código. Escolha o que combina com o seu objetivo e siga praticando.",
                },
                {
                    type: "quote",
                    value: "Você foi do primeiro programa ao Java moderno. O próximo passo é escrever muito código: transforme cada conceito em pequenos projetos seus.",
                },
            ],
            questions: [
                {
                    statement: "Qual é a melhor forma de fixar o que você aprendeu de Java?",
                    difficulty: "facil",
                    options: [
                        { text: "Escrever código: refazer exemplos e criar pequenos projetos", isCorrect: true },
                        { text: "Apenas reler a teoria, sem escrever nenhum código", isCorrect: false },
                        { text: "Decorar a sintaxe sem entender os conceitos", isCorrect: false },
                        { text: "Pular a prática e ir direto a temas avançados", isCorrect: false },
                    ],
                },
                {
                    statement: "Distinguir uma classe abstrata de uma interface é importante porque:",
                    difficulty: "medio",
                    options: [
                        { text: "A classe é estendida (uma só) e a interface é implementada (várias)", isCorrect: true },
                        { text: "As duas são exatamente a mesma coisa com nomes diferentes", isCorrect: false },
                        { text: "Interfaces não podem declarar métodos e classes abstratas sim", isCorrect: false },
                        { text: "Nenhuma das duas tem relação com orientação a objetos", isCorrect: false },
                    ],
                },
                {
                    statement: "Um encadeamento de stream como filter seguido de map e sum representa:",
                    difficulty: "medio",
                    options: [
                        { text: "Processar a coleção de forma declarativa, passo a passo encadeado", isCorrect: true },
                        { text: "Um laço for tradicional apenas escrito de outra maneira", isCorrect: false },
                        { text: "A criação de uma classe nova a cada operação encadeada", isCorrect: false },
                        { text: "Uma forma de declarar variáveis de tipos primitivos", isCorrect: false },
                    ],
                },
            ],
        },
    ],
};

const MODULOS: Modulo[] = [
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

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
