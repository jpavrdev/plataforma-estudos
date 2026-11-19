// Tradução em inglês do módulo 5 da Lógica de Programação (funções). A aula 1
// diverge na declaração (function x def), a aula 2 no final (undefined x
// TypeError + valor padrão) e as demais compartilham a prosa com o código de
// cada linguagem.

import type { AulaModulo2 } from "./seed-dados-modulo2-en.ts";

const I = (v: string) => v;

export const TITULO_MODULO_5 = "Module 5 - Functions: organizing and reusing";

export const AULAS_MODULO_5: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: { js: "What a function is and how to create one", py: "What a function is and how to create one" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# What is a function?

Imagine a cake recipe written in a notebook. Whenever someone wants to make the cake, they do not need to reinvent the steps: just follow the recipe, which already has a name ("Carrot cake") and a ready list of steps to be used again, as many times as needed.

A **function** is that inside code: a piece of logic you write a single time, give a name to, and can call (run) whenever you need, anywhere in the program.

Until Module 4, all the code you wrote ran straight, top to bottom. If you wanted to repeat a task further down, you would have to copy and paste the same snippet again. Functions solve exactly that problem.`,
                },
                {
                    type: "text",
                    value: `## Creating a function

In JavaScript, you create (declare) a function with the \`function\` keyword, a name, parentheses \`()\` and a block of code between braces \`{}\`:

- \`function\` announces: from here on you are defining a function
- the name, chosen by you, is how you will call that function later (it follows the same convention as variables: starts with a lowercase letter, no spaces, like \`greet\` or \`printLine\`)
- the parentheses \`()\` hold the function's inputs (you will see that calmly in the next lesson)
- what stays between \`{}\` is the function body: what it does when it runs`,
                },
                {
                    type: "code",
                    value: `function greet() {
  console.log("Good morning!");
}

// Just defining the function does not run anything yet.
// To run the code inside it, you need to CALL it by name:
greet();
// output: Good morning!

// The same function can be called as many times as you want:
greet();
greet();
// output: Good morning!
// output: Good morning!`,
                },
                {
                    type: "text",
                    value: `## Defining vs calling

Defining a function is like programming a remote control button: you decide what it will do when pressed, but nothing happens just because you programmed the button. Calling the function is pressing the button for real, and that is when the code inside runs.

If a function is defined but never called anywhere in the program, the code inside it simply never runs. It stays there, stored, waiting to be used.`,
                },
                {
                    type: "code",
                    value: `function printLine() {
  console.log("------------------------");
}

printLine();
console.log("Shopping list");
printLine();
console.log("1. Rice");
console.log("2. Beans");
printLine();

// output:
// ------------------------
// Shopping list
// ------------------------
// 1. Rice
// 2. Beans
// ------------------------
// notice: the same printLine function was reused 3 times,
// without copying and pasting the console.log again`,
                },
                {
                    type: "quote",
                    value: `A function is a named piece of logic, written once and used as many times as you need. Defining the function runs nothing: only calling it (the name followed by parentheses) runs the code inside it.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# What is a function?

Imagine a cake recipe written in a notebook. Whenever someone wants to make the cake, they do not need to reinvent the steps: just follow the recipe, which already has a name ("Carrot cake") and a ready list of steps to be used again, as many times as needed.

A **function** is that inside code: a piece of logic you write a single time, give a name to, and can call (run) whenever you need, anywhere in the program.

Until Module 4, all the code you wrote ran straight, top to bottom. If you wanted to repeat a task further down, you would have to copy and paste the same snippet again. Functions solve exactly that problem.`,
                },
                {
                    type: "text",
                    value: `## Creating a function

In Python, you create (define) a function with the \`def\` keyword, a name, parentheses \`()\`, a colon \`:\` and the body written right below, indented:

- \`def\` announces: from here on you are defining a function
- the name, chosen by you, is how you will call that function later (it follows the same convention as variables: lowercase letters, no spaces, words separated by \`_\`, like \`greet\` or \`print_line\`)
- the parentheses \`()\` hold the function's inputs (you will see that calmly in the next lesson)
- the colon \`:\` marks the start of the body, and everything indented right below is part of the function: it is what the function does when it runs`,
                },
                {
                    type: "code",
                    value: `def greet():
    print("Good morning!")

# Just defining the function does not run anything yet.
# To run the code inside it, you need to CALL it by name:
greet()
# output: Good morning!

# The same function can be called as many times as you want:
greet()
greet()
# output: Good morning!
# output: Good morning!`,
                },
                {
                    type: "text",
                    value: `## Defining vs calling

Defining a function is like programming a remote control button: you decide what it will do when pressed, but nothing happens just because you programmed the button. Calling the function is pressing the button for real, and that is when the code inside runs.

If a function is defined but never called anywhere in the program, the code inside it simply never runs. It stays there, stored, waiting to be used.`,
                },
                {
                    type: "code",
                    value: `def print_line():
    print("------------------------")

print_line()
print("Shopping list")
print_line()
print("1. Rice")
print("2. Beans")
print_line()

# output:
# ------------------------
# Shopping list
# ------------------------
# 1. Rice
# 2. Beans
# ------------------------
# notice: the same print_line function was reused 3 times,
# without copying and pasting the print again`,
                },
                {
                    type: "quote",
                    value: `A function is a named piece of logic, written once and used as many times as you need. Defining the function runs nothing: only calling it (the name followed by parentheses) runs the code inside it.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What happens when a function is only defined, but never called anywhere in the program?",
                    py: "What happens when a function is only defined, but never called anywhere in the program?",
                },
                ops: {
                    js: {
                        "O código roda apenas no final do programa": "The code runs only at the end of the program",
                        "O JavaScript gera um erro de sintaxe": "JavaScript raises a syntax error",
                        "O código de dentro dela nunca é executado": "The code inside it is never executed",
                        "O código de dentro dela roda uma vez, automaticamente":
                            "The code inside it runs once, automatically",
                    },
                    py: {
                        "O código de dentro dela nunca é executado": "The code inside it is never executed",
                        "O código roda só no final do programa": "The code runs only at the end of the program",
                        "O código de dentro dela roda uma vez, automaticamente":
                            "The code inside it runs once, automatically",
                        "O Python mostra um erro de sintaxe na hora": "Python shows a syntax error right away",
                    },
                },
            },
            {
                enunciado: {
                    js: 'After defining function greet() { console.log("Hi"); }, which line runs that function?',
                    py: 'After defining the function below, which line runs (calls) that function?\n\n```python\ndef greet():\n    print("Hi")\n```',
                },
                ops: {
                    js: {
                        "saudar();": "greet();",
                        "function saudar();": "function greet();",
                        saudar: "greet",
                        "saudar;": "greet;",
                        "chamar saudar()": "call greet()",
                    },
                    py: {
                        saudar: "greet",
                        "saudar()": "greet()",
                        "def saudar()": "def greet()",
                        "chamar saudar()": "call greet()",
                    },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nfunction printLine() {\n  console.log("---");\n}\n\nprintLine();\nprintLine();\nconsole.log("end");\n```\n\nHow many times does the text "---" appear in the console?',
                    py: 'Considering the code below:\n\n```python\ndef print_line():\n    print("---")\n\nprint_line()\nprint_line()\nprint("end")\n```\n\nHow many times does the text "---" appear in the console?',
                },
                ops: {
                    js: { "Nenhuma vez": "No times", "2 vezes": "2 times", "3 vezes": "3 times", "1 vez": "1 time" },
                    py: { "Nenhuma vez": "No times", "3 vezes": "3 times", "1 vez": "1 time", "2 vezes": "2 times" },
                },
            },
            {
                enunciado: {
                    js: "Which alternative best describes why we use functions in code?",
                    py: "Which alternative best describes why we use functions in code?",
                },
                ops: {
                    js: {
                        "Para deixar o programa mais lento de propósito":
                            "To make the program slower on purpose",
                        "Para dar nome a um pedaço de lógica e reaproveitá-lo sem reescrever":
                            "To give a name to a piece of logic and reuse it without rewriting",
                        "Porque o JavaScript exige que todo código esteja dentro de alguma função":
                            "Because JavaScript requires all code to be inside some function",
                        "Para impedir que uma variável seja usada mais de uma vez":
                            "To prevent a variable from being used more than once",
                    },
                    py: {
                        "Para impedir que uma mesma variável seja usada mais de uma vez":
                            "To prevent the same variable from being used more than once",
                        "Porque o Python exige que todo código esteja dentro de uma função":
                            "Because Python requires all code to be inside a function",
                        "Para nomear um trecho de lógica e reusá-lo quando precisar":
                            "To name a piece of logic and reuse it when needed",
                        "Para deixar o programa mais lento de propósito, sem outro motivo":
                            "To make the program slower on purpose, for no other reason",
                    },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nfunction showMessage() {\n  console.log("You called me!");\n}\n\nconsole.log("Program start");\n```\n\nWhat appears in the console when this code runs?',
                    py: 'Considering the code below:\n\n```python\ndef show_message():\n    print("You called me!")\n\nprint("Program start")\n```\n\nWhat appears in the console when this code runs?',
                },
                ops: {
                    js: {
                        '"Início do programa" e, em seguida, "Você me chamou!"':
                            '"Program start" and then "You called me!"',
                        "Um erro, porque toda função precisa ser chamada em algum momento":
                            "An error, because every function must be called at some point",
                        'Só "Você me chamou!"': 'Only "You called me!"',
                        'Só "Início do programa"': 'Only "Program start"',
                    },
                    py: {
                        'Só "Você me chamou!"': 'Only "You called me!"',
                        '"Início do programa" e, logo depois, "Você me chamou!"':
                            '"Program start" and, right after, "You called me!"',
                        "Um erro, porque toda função precisa ser chamada":
                            "An error, because every function must be called",
                        'Só "Início do programa"': 'Only "Program start"',
                    },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: { js: "Parameters and arguments: the function's inputs", py: "Parameters and arguments: the function's inputs" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Functions that receive information

The \`greet\` function from the last lesson always prints the same fixed message. But what if you want to greet different people, each by their name, without writing a new function for each person?

That is what **parameters** are for: they let a function receive information from outside and use those values in what it does.`,
                },
                {
                    type: "text",
                    value: `### Parameter vs argument

The two terms look like synonyms, but each has its right moment:

- **Parameter** is the name you give the input when you DEFINE the function (it works like a variable reserved to receive a value).
- **Argument** is the actual value you pass when you CALL the function.

Analogy: think of a juice machine. The parameter is the slot where the fruit goes in ("a fruit goes in here"). The argument is the specific fruit you put there: an apple today, an orange tomorrow. The slot is always the same, but what goes through it changes with each use.`,
                },
                {
                    type: "table",
                    value: `[["Term","Where it appears","Example"],["Parameter","In the function definition","function add(a, b) { ... }"],["Argument","In the function call","add(2, 3)"]]`,
                },
                {
                    type: "code",
                    value: `function greet(name) {
  console.log("Good morning, " + name + "!");
}

greet("Ana");
// output: Good morning, Ana!

greet("Carlos");
// output: Good morning, Carlos!

greet("Mariana");
// output: Good morning, Mariana!

// it is the same function, but the name parameter receives a different
// argument on each call, so the result changes`,
                },
                {
                    type: "code",
                    value: `function add(a, b) {
  const result = a + b;
  console.log(result);
}

add(2, 3);
// output: 5

add(10, 20);
// output: 30

// the function has two parameters: a and b
// each call sends two arguments, in the same order`,
                },
                {
                    type: "text",
                    value: `### The order of the arguments matters

Arguments are matched to parameters following the same order they appear in. In \`add(2, 3)\`, the \`2\` goes to \`a\` and the \`3\` goes to \`b\`. In that case, swapping the order does not change the result of the addition, but in operations where order makes a difference (like subtraction or division), inverting the arguments changes the result.

If you forget to pass an argument, the corresponding parameter keeps the special value \`undefined\` (the same value you already met in Module 2).`,
                },
                {
                    type: "quote",
                    value: `A parameter is the agreed name in the function definition. An argument is the actual value sent in the call. The same function, fed different arguments, produces different results: that is what makes it truly reusable.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Functions that receive information

The \`greet\` function from the last lesson always prints the same fixed message. But what if you want to greet different people, each by their name, without writing a new function for each person?

That is what **parameters** are for: they let a function receive information from outside and use those values in what it does.`,
                },
                {
                    type: "text",
                    value: `### Parameter vs argument

The two terms look like synonyms, but each has its right moment:

- **Parameter** is the name you give the input when you DEFINE the function (it works like a variable reserved to receive a value).
- **Argument** is the actual value you pass when you CALL the function.

Analogy: think of a juice machine. The parameter is the slot where the fruit goes in ("a fruit goes in here"). The argument is the specific fruit you put there: an apple today, an orange tomorrow. The slot is always the same, but what goes through it changes with each use.`,
                },
                {
                    type: "table",
                    value: `[["Term","Where it appears","Example"],["Parameter","In the function definition","def add(a, b):"],["Argument","In the function call","add(2, 3)"]]`,
                },
                {
                    type: "code",
                    value: `def greet(name):
    print(f"Good morning, {name}!")

greet("Ana")
# output: Good morning, Ana!

greet("Carlos")
# output: Good morning, Carlos!

greet("Mariana")
# output: Good morning, Mariana!

# it is the same function, but the name parameter receives a different
# argument on each call, so the result changes`,
                },
                {
                    type: "code",
                    value: `def add(a, b):
    result = a + b
    print(result)

add(2, 3)
# output: 5

add(10, 20)
# output: 30

# the function has two parameters: a and b
# each call sends two arguments, in the same order`,
                },
                {
                    type: "text",
                    value: `### The order of the arguments matters

Arguments are matched to parameters following the same order they appear in. In \`add(2, 3)\`, the \`2\` goes to \`a\` and the \`3\` goes to \`b\`. In that case, swapping the order does not change the result of the addition, but in operations where order makes a difference (like subtraction or division), inverting the arguments changes the result.

And what if an argument is missing? In Python, if you call the function without passing a value it expects, the program stops with an error (a \`TypeError\`) warning that the argument was missing. One way to make an argument optional is to give it a **default value** in the definition: that way, when you do not pass that argument, the function uses the default instead.`,
                },
                {
                    type: "code",
                    value: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Ana")
# output: Hello, Ana!

greet("Ana", "Good morning")
# output: Good morning, Ana!

# greeting has a default value ("Hello"): if the second argument
# is not passed, the function uses that default on its own`,
                },
                {
                    type: "quote",
                    value: `A parameter is the agreed name in the function definition. An argument is the actual value sent in the call. The same function, fed different arguments, produces different results: that is what makes it truly reusable.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "In the function function multiply(x, y) { return x * y; }, what are x and y?",
                    py: "In the function def multiply(x, y): return x * y, what are x and y?",
                },
                ops: {
                    js: {
                        "Valores de retorno": "Return values",
                        Argumentos: "Arguments",
                        "Parâmetros": "Parameters",
                        "Variáveis globais": "Global variables",
                    },
                    py: {
                        "Valores de retorno": "Return values",
                        Argumentos: "Arguments",
                        "Variáveis globais": "Global variables",
                        "Parâmetros": "Parameters",
                    },
                },
            },
            {
                enunciado: {
                    js: "In the call multiply(4, 5), what are 4 and 5?",
                    py: "In the call multiply(4, 5), what are 4 and 5?",
                },
                ops: {
                    js: { "Parâmetros": "Parameters", "Nomes de função": "Function names", Escopos: "Scopes", Argumentos: "Arguments" },
                    py: { "Parâmetros": "Parameters", Escopos: "Scopes", "Nomes de função": "Function names", Argumentos: "Arguments" },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction subtract(a, b) {\n  console.log(a - b);\n}\n\nsubtract(10, 3);\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\ndef subtract(a, b):\n    print(a - b)\n\nsubtract(10, 3)\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: { "13": I("13"), "7": I("7"), "3": I("3"), "-7": I("-7") },
                    py: { "3": I("3"), "7": I("7"), "-7": I("-7"), "13": I("13") },
                },
            },
            {
                enunciado: {
                    js: "Using the same subtract(a, b) function from the previous question, what changes if you call subtract(3, 10) instead of subtract(10, 3)?",
                    py: "Using the same subtract(a, b) function from the previous question, what changes if you call subtract(3, 10) instead of subtract(10, 3)?",
                },
                ops: {
                    js: {
                        "A função ignora o segundo argumento quando ele é maior que o primeiro":
                            "The function ignores the second argument when it is larger than the first",
                        "O resultado muda, porque a ordem dos argumentos define quem é a e quem é b":
                            "The result changes, because the order of the arguments defines who is a and who is b",
                        "O programa não roda, porque a ordem dos argumentos precisa ser sempre crescente":
                            "The program does not run, because the order of the arguments always has to be increasing",
                        "Nada muda, porque subtração não depende da ordem dos números":
                            "Nothing changes, because subtraction does not depend on the order of the numbers",
                    },
                    py: {
                        "O programa não roda: a ordem dos argumentos precisa ser crescente":
                            "The program does not run: the order of the arguments has to be increasing",
                        "O resultado muda, porque a ordem define quem é a e quem é b":
                            "The result changes, because the order defines who is a and who is b",
                        "A função ignora o segundo argumento por ser maior que o primeiro":
                            "The function ignores the second argument for being larger than the first",
                        "Nada muda, porque a subtração não depende da ordem dos números":
                            "Nothing changes, because subtraction does not depend on the order of the numbers",
                    },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nfunction greet(name) {\n  console.log("Hi, " + name);\n}\n\ngreet();\n```\n\nWhat appears in the console when greet() is called with no argument?',
                    py: 'Considering the code below:\n\n```python\ndef greet(name):\n    print(f"Hi, {name}")\n\ngreet()\n```\n\nWhat happens when greet() is called without passing any argument?',
                },
                ops: {
                    js: {
                        "Oi, nome": "Hi, name",
                        "Um erro impede o programa de rodar": "An error stops the program from running",
                        "Oi,  (sem nada depois, e sem erro nem undefined)":
                            "Hi,  (with nothing after, and no error or undefined)",
                        "Oi, undefined": "Hi, undefined",
                    },
                    py: {
                        "Imprime Oi, None, porque o parâmetro fica vazio sozinho":
                            "It prints Hi, None, because the parameter becomes empty on its own",
                        "Imprime Oi, e nada depois, sem erro nenhum no caminho":
                            "It prints Hi, and nothing after, with no error along the way",
                        "Um erro: falta passar o argumento nome que a função exige":
                            "An error: the name argument the function requires is missing",
                        "Imprime Oi, nome, com a palavra nome escrita literalmente":
                            "It prints Hi, name, with the word name written literally",
                    },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: { js: "return: giving a result back (vs just printing)", py: "return: giving a result back (vs just printing)" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Giving a result back with return

The functions you have seen so far show something directly in the console, using \`console.log\` inside them. That is great for displaying a message on the screen, but what if you want to use the function's RESULT somewhere else in the program: store it in a variable, add it to another value, pass it to another function?

For that there is the \`return\` keyword: it hands a value back to whoever called the function, and that value can then be truly used by the rest of the program.`,
                },
                {
                    type: "code",
                    value: `// This function only PRINTS the sum, it does not return anything
function addAndPrint(a, b) {
  console.log(a + b);
}

addAndPrint(2, 3);
// output: 5

// what if I try to store its "result"?
const result1 = addAndPrint(2, 3);
// output: 5   (this is the console.log inside the function running again)

console.log(result1);
// output: undefined
// the function has no return, so it returns undefined by default`,
                },
                {
                    type: "code",
                    value: `// This function RETURNS the sum with return
function addAndReturn(a, b) {
  return a + b;
}

const result2 = addAndReturn(2, 3);
console.log(result2);
// output: 5

// now the returned value can be used in other calculations:
const double = addAndReturn(2, 3) * 2;
console.log(double);
// output: 10`,
                },
                {
                    type: "text",
                    value: `### The crucial difference: return vs console.log

This is one of the most common mistakes of someone learning to program, so it is worth highlighting:

- \`console.log(...)\` only SHOWS a value in the console. Once shown, that value is not stored anywhere in the program.
- \`return ...\` HANDS a value back to whoever called the function. That value can be stored in a variable, used in a calculation or sent to another function.

### What happens after return

As soon as \`return\` runs, the function stops right there: no line written after it, inside the same function, ever runs.

And what if the function has no \`return\` at all? It ends after the last line and returns \`undefined\` to whoever called it, even if it did some \`console.log\` along the way.`,
                },
                {
                    type: "table",
                    value: `[["","console.log inside the function","return inside the function"],["What it does","Shows a value in the console","Hands a value back to the caller"],["Can it be stored in a variable?","No, it stores undefined","Yes"],["Good for","The human to read on the screen","The program to use the value later"]]`,
                },
                {
                    type: "code",
                    value: `function checkAge(age) {
  if (age >= 18) {
    return "of age";
  }
  console.log("this line only runs if the age is under 18");
  return "under age";
}

console.log(checkAge(20));
// output: of age
// notice: the console.log in the middle never even runs,
// because the return inside the if ends the function before it`,
                },
                {
                    type: "quote",
                    value: `return hands a value back to whoever called the function, ready to be used in the rest of the program. console.log only shows a value on the screen. A function without return always returns undefined, even if it prints things in the console.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Giving a result back with return

The functions you have seen so far show something directly in the console, using \`print\` inside them. That is great for displaying a message on the screen, but what if you want to use the function's RESULT somewhere else in the program: store it in a variable, add it to another value, pass it to another function?

For that there is the \`return\` keyword: it hands a value back to whoever called the function, and that value can then be truly used by the rest of the program.`,
                },
                {
                    type: "code",
                    value: `# This function only PRINTS the sum, it does not return anything
def add_and_print(a, b):
    print(a + b)

add_and_print(2, 3)
# output: 5

# what if I try to store its "result"?
result1 = add_and_print(2, 3)
# output: 5   (this is the print inside the function running again)

print(result1)
# output: None
# the function has no return, so it returns None by default`,
                },
                {
                    type: "code",
                    value: `# This function RETURNS the sum with return
def add_and_return(a, b):
    return a + b

result2 = add_and_return(2, 3)
print(result2)
# output: 5

# now the returned value can be used in other calculations:
double = add_and_return(2, 3) * 2
print(double)
# output: 10`,
                },
                {
                    type: "text",
                    value: `### The crucial difference: return vs print

This is one of the most common mistakes of someone learning to program, so it is worth highlighting:

- \`print(...)\` only SHOWS a value in the console. Once shown, that value is not stored anywhere in the program.
- \`return ...\` HANDS a value back to whoever called the function. That value can be stored in a variable, used in a calculation or sent to another function.

### What happens after return

As soon as \`return\` runs, the function stops right there: no line written after it, inside the same function, ever runs.

And what if the function has no \`return\` at all? It ends after the last line and returns \`None\` to whoever called it, even if it did some \`print\` along the way.`,
                },
                {
                    type: "table",
                    value: `[["","print inside the function","return inside the function"],["What it does","Shows a value in the console","Hands a value back to the caller"],["Can it be stored in a variable?","No, it stores None","Yes"],["Good for","The human to read on the screen","The program to use the value later"]]`,
                },
                {
                    type: "code",
                    value: `def check_age(age):
    if age >= 18:
        return "of age"
    print("this line only runs if the age is under 18")
    return "under age"

print(check_age(20))
# output: of age
# notice: the print in the middle never even runs,
# because the return inside the if ends the function before it`,
                },
                {
                    type: "quote",
                    value: `return hands a value back to whoever called the function, ready to be used in the rest of the program. print only shows a value on the screen. A function without return always returns None, even if it prints things in the console.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What does the return keyword do inside a function?",
                    py: "What does the return keyword do inside a function?",
                },
                ops: {
                    js: {
                        "Chama a função de novo, automaticamente": "Calls the function again, automatically",
                        "Mostra um valor no console": "Shows a value in the console",
                        "Apaga o valor de uma variável": "Erases the value of a variable",
                        "Devolve um valor para quem chamou a função":
                            "Hands a value back to whoever called the function",
                    },
                    py: {
                        "Apaga o valor de uma variável criada": "Erases the value of a created variable",
                        "Chama a função de novo, automaticamente": "Calls the function again, automatically",
                        "Mostra um valor no console, na tela": "Shows a value in the console, on the screen",
                        "Devolve um valor para quem chamou": "Hands a value back to whoever called it",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction double(n) {\n  return n * 2;\n}\n\nconst value = double(5);\nconsole.log(value);\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\ndef double(n):\n    return n * 2\n\nvalue = double(5)\nprint(value)\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: { "n * 2": I("n * 2"), "10": I("10"), "5": I("5"), undefined: I("undefined") },
                    py: { None: I("None"), "10": I("10"), "n * 2": I("n * 2"), "5": I("5") },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction triple(n) {\n  console.log(n * 3);\n}\n\nconst value = triple(4);\nconsole.log(value);\n```\n\nWhat appears in the console, in order?",
                    py: "Considering the code below:\n\n```python\ndef triple(n):\n    print(n * 3)\n\nvalue = triple(4)\nprint(value)\n```\n\nWhat appears in the console, in order?",
                },
                ops: {
                    js: {
                        "12 e, em seguida, 12 de novo": "12 and then 12 again",
                        "Só 12": "Only 12",
                        "Só undefined": "Only undefined",
                        "12 e, em seguida, undefined": "12 and then undefined",
                    },
                    py: {
                        "12 e, em seguida, None": "12 and then None",
                        "12 e, em seguida, 12 de novo": "12 and then 12 again",
                        "Só None": "Only None",
                        "Só 12": "Only 12",
                    },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nfunction classify(grade) {\n  if (grade >= 6) {\n    return "approved";\n  }\n  return "failed";\n}\n\nconsole.log(classify(8));\n```\n\nWhat appears in the console?',
                    py: 'Considering the code below:\n\n```python\ndef classify(grade):\n    if grade >= 6:\n        return "approved"\n    return "failed"\n\nprint(classify(8))\n```\n\nWhat appears in the console?',
                },
                ops: {
                    js: { undefined: I("undefined"), "8": I("8"), aprovado: "approved", reprovado: "failed" },
                    py: { "8": I("8"), None: I("None"), aprovado: "approved", reprovado: "failed" },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nfunction check(number) {\n  if (number > 0) {\n    return "positive";\n    console.log("I checked the number");\n  }\n  return "not positive";\n}\n\nconsole.log(check(5));\n```\n\nBesides the returned result, what else appears in the console?',
                    py: 'Considering the code below:\n\n```python\ndef check(number):\n    if number > 0:\n        return "positive"\n        print("I checked the number")\n    return "not positive"\n\nprint(check(5))\n```\n\nBesides the returned result, what else appears in the console?',
                },
                ops: {
                    js: {
                        '"chequei o número" aparece antes de "positivo"':
                            '"I checked the number" appears before "positive"',
                        "Nada mais: o código depois do return nunca chega a ser executado":
                            "Nothing else: the code after return never gets executed",
                        "Um erro de sintaxe, porque não pode existir código depois de um return":
                            "A syntax error, because there cannot be code after a return",
                        '"chequei o número" aparece depois de "positivo"':
                            '"I checked the number" appears after "positive"',
                    },
                    py: {
                        '"chequei o número" aparece depois de "positivo"':
                            '"I checked the number" appears after "positive"',
                        "Nada mais: o código depois do return nunca chega a rodar":
                            "Nothing else: the code after return never gets to run",
                        "Um erro de sintaxe, pois não pode haver código após um return":
                            "A syntax error, because there cannot be code after a return",
                        '"chequei o número" aparece antes de "positivo"':
                            '"I checked the number" appears before "positive"',
                    },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: { js: "Scope: local and global variables", py: "Scope: local and global variables" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Scope: where each variable exists

Every variable has a place where it exists and can be used: that territory is called **scope**. Understanding scope avoids a very common beginner mistake: trying to use a variable outside the place where it was created and the program complaining that it does not even exist.

Analogy: think of a meeting room. What is agreed in there (papers on the table, a scribbled whiteboard) stays only in that room; when the meeting ends and everyone leaves, it is gone. A notice pinned on the building entrance board, on the other hand, everyone passing by can see.`,
                },
                {
                    type: "text",
                    value: `### Local scope and global scope

- **Local scope**: variables declared inside a function (with \`let\` or \`const\`) only exist in there. Outside the function, nobody sees those variables.
- **Global scope**: variables declared outside any function exist in the whole program, and can be read from inside any function.`,
                },
                {
                    type: "code",
                    value: `function calculateDouble(number) {
  const result = number * 2; // result is a LOCAL variable
  console.log(result);
}

calculateDouble(5);
// output: 10

// console.log(result);
// if you uncomment the line above, the program breaks with an error:
// "result is not defined"
// because result only exists INSIDE calculateDouble`,
                },
                {
                    type: "code",
                    value: `const appName = "ensina.dev"; // global variable

function showWelcome() {
  console.log("Welcome to " + appName);
  // the function can read appName because it is global
}

showWelcome();
// output: Welcome to ensina.dev`,
                },
                {
                    type: "text",
                    value: `### Why local variables are good

It looks like a limitation, but local scope is a protection: each function can use whatever variable names it wants, without worrying about conflicting with another part of the program. Two different functions can each have a variable called \`result\`, with no conflict at all, because each \`result\` only exists inside its own function.`,
                },
                {
                    type: "code",
                    value: `function squareArea(side) {
  const result = side * side;
  return result;
}

function triangleArea(base, height) {
  const result = (base * height) / 2;
  return result;
}

console.log(squareArea(4));
// output: 16

console.log(triangleArea(6, 3));
// output: 9

// each "result" is local to its own function: there is no conflict`,
                },
                {
                    type: "quote",
                    value: `A variable declared inside a function is local: it only exists, and can only be used, in there. A variable declared outside any function is global and can be read from anywhere in the program. Preferring local variables keeps one part of the code from interfering, unintentionally, with another.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Scope: where each variable exists

Every variable has a place where it exists and can be used: that territory is called **scope**. Understanding scope avoids a very common beginner mistake: trying to use a variable outside the place where it was created and the program complaining that it does not even exist.

Analogy: think of a meeting room. What is agreed in there (papers on the table, a scribbled whiteboard) stays only in that room; when the meeting ends and everyone leaves, it is gone. A notice pinned on the building entrance board, on the other hand, everyone passing by can see.`,
                },
                {
                    type: "text",
                    value: `### Local scope and global scope

- **Local scope**: variables created inside a function only exist in there. Outside the function, nobody sees those variables.
- **Global scope**: variables created outside any function exist in the whole program, and can be read from inside any function.`,
                },
                {
                    type: "code",
                    value: `def calculate_double(number):
    result = number * 2  # result is a LOCAL variable
    print(result)

calculate_double(5)
# output: 10

# print(result)
# if you remove the # from the line above, the program breaks with an error:
# NameError: name 'result' is not defined
# because result only exists INSIDE calculate_double`,
                },
                {
                    type: "code",
                    value: `app_name = "ensina.dev"  # global variable

def show_welcome():
    print(f"Welcome to {app_name}")
    # the function can read app_name because it is global

show_welcome()
# output: Welcome to ensina.dev`,
                },
                {
                    type: "text",
                    value: `### Why local variables are good

It looks like a limitation, but local scope is a protection: each function can use whatever variable names it wants, without worrying about conflicting with another part of the program. Two different functions can each have a variable called \`result\`, with no conflict at all, because each \`result\` only exists inside its own function.

A function can READ a global variable, as you saw above. But to REASSIGN (change the value of) a global from inside the function, Python requires the \`global\` keyword before the name. In practice, avoid that: it is safer to receive values through parameters and hand the result back with \`return\` than to keep changing global variables scattered across the program.`,
                },
                {
                    type: "code",
                    value: `def square_area(side):
    result = side * side
    return result

def triangle_area(base, height):
    result = (base * height) / 2
    return result

print(square_area(4))
# output: 16

print(triangle_area(6, 3))
# output: 9.0

# each result is local to its own function: there is no conflict`,
                },
                {
                    type: "quote",
                    value: `A variable created inside a function is local: it only exists, and can only be used, in there. A variable created outside any function is global and can be read from anywhere in the program. Preferring local variables keeps one part of the code from interfering, unintentionally, with another.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is a local variable?",
                    py: "What is a local variable?",
                },
                ops: {
                    js: {
                        "Uma variável que nunca muda de valor depois de criada":
                            "A variable that never changes value after being created",
                        "Uma variável declarada usando o comando console.log":
                            "A variable declared using the console.log command",
                        "Uma variável que existe em todo o programa, em qualquer função":
                            "A variable that exists in the whole program, in any function",
                        "Uma variável declarada dentro de uma função, existindo só ali":
                            "A variable declared inside a function, existing only there",
                    },
                    py: {
                        "Uma variável criada dentro de uma função, só existe ali":
                            "A variable created inside a function, it only exists there",
                        "Uma variável que existe no programa todo, em qualquer função":
                            "A variable that exists in the whole program, in any function",
                        "Uma variável que nunca muda de valor depois de criada":
                            "A variable that never changes value after being created",
                        "Uma variável criada usando o comando print":
                            "A variable created using the print command",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction calculate() {\n  const total = 100;\n  console.log(total);\n}\n\ncalculate();\nconsole.log(total);\n```\n\nWhat happens when this code runs?",
                    py: "Considering the code below:\n\n```python\ndef calculate():\n    total = 100\n    print(total)\n\ncalculate()\nprint(total)\n```\n\nWhat happens when this code runs?",
                },
                ops: {
                    js: {
                        "Quebra com erro antes mesmo de a função calcular ser chamada":
                            "It breaks with an error even before the calculate function is called",
                        "Imprime 100 e depois undefined, pois a variável global some":
                            "It prints 100 and then undefined, because the global variable disappears",
                        "Imprime 100 duas vezes, pois a função roda de novo no final":
                            "It prints 100 twice, because the function runs again at the end",
                        "Imprime 100, depois quebra: total não existe fora da função":
                            "It prints 100, then breaks: total does not exist outside the function",
                    },
                    py: {
                        "Imprime 100 e depois quebra: total não existe fora da função":
                            "It prints 100 and then breaks: total does not exist outside the function",
                        "Imprime 100 duas vezes, pois a função roda de novo no final":
                            "It prints 100 twice, because the function runs again at the end",
                        "Imprime 100 e depois None, pois a variável global some":
                            "It prints 100 and then None, because the global variable disappears",
                        "Quebra com erro antes mesmo de a função calcular ser chamada":
                            "It breaks with an error even before the calculate function is called",
                    },
                },
            },
            {
                enunciado: {
                    js: 'Considering the code below:\n\n```javascript\nconst city = "Recife";\n\nfunction showCity() {\n  console.log("City: " + city);\n}\n\nshowCity();\n```\n\nWhat appears in the console?',
                    py: 'Considering the code below:\n\n```python\ncity = "Recife"\n\ndef show_city():\n    print(f"City: {city}")\n\nshow_city()\n```\n\nWhat appears in the console?',
                },
                ops: {
                    js: {
                        "Cidade: Recife": "City: Recife",
                        "Cidade: undefined": "City: undefined",
                        "Um erro, porque a função não pode acessar cidade":
                            "An error, because the function cannot access city",
                        "Cidade:  (em branco)": "City:  (blank)",
                    },
                    py: {
                        "Cidade: None": "City: None",
                        "Um erro, porque a função não pode ler cidade":
                            "An error, because the function cannot read city",
                        "Cidade: Recife": "City: Recife",
                        "Cidade:  (em branco)": "City:  (blank)",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction countSheep() {\n  const total = 5;\n  return total;\n}\n\nfunction countDucks() {\n  const total = 12;\n  return total;\n}\n\nconsole.log(countSheep());\nconsole.log(countDucks());\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\ndef count_sheep():\n    total = 5\n    return total\n\ndef count_ducks():\n    total = 12\n    return total\n\nprint(count_sheep())\nprint(count_ducks())\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: {
                        "12 e, em seguida, 12": "12 and then 12",
                        "Um erro, porque total foi declarado duas vezes":
                            "An error, because total was declared twice",
                        "5 e, em seguida, 12": "5 and then 12",
                        "5 e, em seguida, 5": "5 and then 5",
                    },
                    py: {
                        "12 e, em seguida, 12": "12 and then 12",
                        "5 e, em seguida, 12": "5 and then 12",
                        "5 e, em seguida, 5": "5 and then 5",
                        "Um erro, porque total foi declarado duas vezes":
                            "An error, because total was declared twice",
                    },
                },
            },
            {
                enunciado: {
                    js: "Why is it considered a good practice to declare variables inside the function instead of always creating global variables?",
                    py: "Why is it considered a good practice to create variables inside the function instead of always using global variables?",
                },
                ops: {
                    js: {
                        "Porque variáveis locais não conflitam com nomes usados em outras partes do código":
                            "Because local variables do not conflict with names used in other parts of the code",
                        "Porque variáveis globais são mais lentas para o computador processar":
                            "Because global variables are slower for the computer to process",
                        "Porque o JavaScript proíbe declarar mais de uma variável global no mesmo programa":
                            "Because JavaScript forbids declaring more than one global variable in the same program",
                        "Porque variáveis locais podem ser lidas de qualquer parte do programa, o que é mais seguro":
                            "Because local variables can be read from anywhere in the program, which is safer",
                    },
                    py: {
                        "Porque variáveis locais não conflitam com nomes usados fora dela":
                            "Because local variables do not conflict with names used outside it",
                        "Porque o Python proíbe ter mais de uma variável global por programa":
                            "Because Python forbids having more than one global variable per program",
                        "Porque variáveis locais podem ser lidas de qualquer parte do programa":
                            "Because local variables can be read from anywhere in the program",
                        "Porque variáveis globais são mais lentas para o computador processar":
                            "Because global variables are slower for the computer to process",
                    },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: { js: "Divide and conquer: functions that use functions", py: "Divide and conquer: functions that use functions" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Why use functions: divide and conquer

You already saw how to create functions, pass parameters and return results with \`return\`. Now it is time to put it all together and understand WHY it matters so much in practice.

When a problem is big, the most powerful strategy in programming is divide and conquer: break a big problem into smaller pieces, solve each piece with its own function, then put it all together. It is the same logic as organizing a party: instead of one person doing everything alone, someone handles the food, someone else the decoration, another the music, each task isolated with one person responsible.`,
                },
                {
                    type: "text",
                    value: `### Do not repeat code (DRY)

There are two huge reasons to use functions:

1. **Do not repeat code**: if the same logic shows up in several places in the program, it should be inside a function, called wherever needed. It even has a well-known name in the programming world: **DRY** (Don't Repeat Yourself).
2. **Naming and readability**: a function with a good name, like \`isEven(number)\` or \`calculateAverage(grades)\`, makes the code almost a sentence in plain language, easier to understand than a bunch of loose calculations.`,
                },
                {
                    type: "code",
                    value: `function isEven(number) {
  return number % 2 === 0;
}

console.log(isEven(4));
// output: true

console.log(isEven(7));
// output: false

// you can use the return value directly inside an if:
if (isEven(10)) {
  console.log("10 is even");
}
// output: 10 is even`,
                },
                {
                    type: "code",
                    value: `function largerOfTwo(a, b) {
  if (a > b) {
    return a;
  }
  return b;
}

function largerOfThree(a, b, c) {
  // one function calling another: largerOfThree reuses largerOfTwo
  const largestBetweenAAndB = largerOfTwo(a, b);
  return largerOfTwo(largestBetweenAAndB, c);
}

console.log(largerOfTwo(4, 9));
// output: 9

console.log(largerOfThree(4, 9, 2));
// output: 9

console.log(largerOfThree(4, 9, 15));
// output: 15

// largerOfThree did not have to rewrite the logic of comparing two
// numbers: it reused largerOfTwo twice`,
                },
                {
                    type: "text",
                    value: `### Good practice: one function, one responsibility

A well-written function does **one thing only**, and does it well. If a function calculates, prints, validates and saves all at once, it becomes hard to understand, test and reuse. Prefer several small, well-named functions over one giant function that does everything.

The name matters too: \`largerOfTwo\`, \`isEven\` and \`calculateAverage\` tell, just by the name, what the function does. Vague names like \`function1\` or \`doThing\` force whoever reads the code to open the whole function just to understand what it is for.`,
                },
                {
                    type: "quote",
                    value: `Divide and conquer is breaking a big problem into smaller functions, each taking care of one part, and one function can call another to build the complete solution. Small, well-named functions with a single responsibility are easier to understand, test and reuse.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Why use functions: divide and conquer

You already saw how to create functions, pass parameters and return results with \`return\`. Now it is time to put it all together and understand WHY it matters so much in practice.

When a problem is big, the most powerful strategy in programming is divide and conquer: break a big problem into smaller pieces, solve each piece with its own function, then put it all together. It is the same logic as organizing a party: instead of one person doing everything alone, someone handles the food, someone else the decoration, another the music, each task isolated with one person responsible.`,
                },
                {
                    type: "text",
                    value: `### Do not repeat code (DRY)

There are two huge reasons to use functions:

1. **Do not repeat code**: if the same logic shows up in several places in the program, it should be inside a function, called wherever needed. It even has a well-known name in the programming world: **DRY** (Don't Repeat Yourself).
2. **Naming and readability**: a function with a good name, like \`is_even(number)\` or \`calculate_average(grades)\`, makes the code almost a sentence in plain language, easier to understand than a bunch of loose calculations.`,
                },
                {
                    type: "code",
                    value: `def is_even(number):
    return number % 2 == 0

print(is_even(4))
# output: True

print(is_even(7))
# output: False

# you can use the return value directly inside an if:
if is_even(10):
    print("10 is even")
# output: 10 is even`,
                },
                {
                    type: "code",
                    value: `def larger_of_two(a, b):
    if a > b:
        return a
    return b

def larger_of_three(a, b, c):
    # one function calling another: larger_of_three reuses larger_of_two
    largest_between_a_and_b = larger_of_two(a, b)
    return larger_of_two(largest_between_a_and_b, c)

print(larger_of_two(4, 9))
# output: 9

print(larger_of_three(4, 9, 2))
# output: 9

print(larger_of_three(4, 9, 15))
# output: 15

# larger_of_three did not have to rewrite the logic of comparing two
# numbers: it reused larger_of_two twice`,
                },
                {
                    type: "text",
                    value: `### Good practice: one function, one responsibility

A well-written function does **one thing only**, and does it well. If a function calculates, prints, validates and saves all at once, it becomes hard to understand, test and reuse. Prefer several small, well-named functions over one giant function that does everything.

The name matters too: \`larger_of_two\`, \`is_even\` and \`calculate_average\` tell, just by the name, what the function does. Vague names like \`function1\` or \`do_thing\` force whoever reads the code to open the whole function just to understand what it is for.`,
                },
                {
                    type: "quote",
                    value: `Divide and conquer is breaking a big problem into smaller functions, each taking care of one part, and one function can call another to build the complete solution. Small, well-named functions with a single responsibility are easier to understand, test and reuse.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What does "divide and conquer" mean in programming?',
                    py: 'What does "divide and conquer" mean in programming?',
                },
                ops: {
                    js: {
                        "Dividir o valor de uma variável inteira por dois, sempre":
                            "Always dividing the value of an integer variable by two",
                        "Quebrar um problema grande em várias partes menores e simples":
                            "Breaking a big problem into several smaller, simpler parts",
                        "Excluir do código as partes que não estão funcionando direito":
                            "Deleting from the code the parts that are not working right",
                        "Criar o maior número possível de variáveis globais no programa":
                            "Creating as many global variables in the program as possible",
                    },
                    py: {
                        "Quebrar um problema grande em partes menores e simples":
                            "Breaking a big problem into smaller, simpler parts",
                        "Criar o maior número possível de variáveis globais no programa":
                            "Creating as many global variables in the program as possible",
                        "Dividir o valor de uma variável inteira por dois, sempre":
                            "Always dividing the value of an integer variable by two",
                        "Excluir do código as partes que não estão funcionando direito":
                            "Deleting from the code the parts that are not working right",
                    },
                },
            },
            {
                enunciado: {
                    js: "What does the DRY principle (Don't Repeat Yourself) recommend?",
                    py: "What does the DRY principle (Don't Repeat Yourself) recommend?",
                },
                ops: {
                    js: {
                        "Sempre usar return em vez de console.log":
                            "Always using return instead of console.log",
                        "Nunca declarar mais de uma função no mesmo arquivo de código":
                            "Never declaring more than one function in the same code file",
                        "Não repetir a mesma lógica em vários lugares do código":
                            "Not repeating the same logic in several places in the code",
                        "Escrever todo o código numa única linha":
                            "Writing all the code on a single line",
                    },
                    py: {
                        "Escrever todo o código do programa numa única linha longa":
                            "Writing all the program's code on a single long line",
                        "Nunca declarar mais de uma função no mesmo arquivo de código":
                            "Never declaring more than one function in the same code file",
                        "Sempre usar return no lugar de print em toda função":
                            "Always using return instead of print in every function",
                        "Não repetir a mesma lógica em vários lugares do código":
                            "Not repeating the same logic in several places in the code",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the functions below:\n\n```javascript\nfunction largerOfTwo(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n\nfunction largerOfThree(a, b, c) {\n  const largestBetweenAAndB = largerOfTwo(a, b);\n  return largerOfTwo(largestBetweenAAndB, c);\n}\n```\n\nWhat does largerOfThree(7, 3, 5) return?",
                    py: "Considering the functions below:\n\n```python\ndef larger_of_two(a, b):\n    if a > b:\n        return a\n    return b\n\ndef larger_of_three(a, b, c):\n    largest_between_a_and_b = larger_of_two(a, b)\n    return larger_of_two(largest_between_a_and_b, c)\n```\n\nWhat does larger_of_three(7, 3, 5) return?",
                },
                ops: {
                    js: { "5": I("5"), "3": I("3"), "7": I("7"), undefined: I("undefined") },
                    py: { None: I("None"), "5": I("5"), "3": I("3"), "7": I("7") },
                },
            },
            {
                enunciado: {
                    js: "A function called calculateAndPrintReport computes values, formats text and prints everything to the console, all at once. What is the most likely problem with that approach, according to function best practices?",
                    py: "A function called calculate_and_print_report computes values, formats text and prints everything at once. What is the most likely problem with that approach, according to function best practices?",
                },
                ops: {
                    js: {
                        "O JavaScript não permite funções com mais de uma linha de código":
                            "JavaScript does not allow functions with more than one line of code",
                        "A função roda mais devagar por ter um nome longo":
                            "The function runs slower for having a long name",
                        "Fica mais difícil entender, testar e reaproveitar cada parte":
                            "It becomes harder to understand, test and reuse each part",
                        "Não existe problema: quanto mais coisas uma função faz, melhor":
                            "There is no problem: the more things a function does, the better",
                    },
                    py: {
                        "Não há problema: quanto mais uma função faz, sempre melhor":
                            "There is no problem: the more a function does, always the better",
                        "Fica difícil entender, testar e reusar cada parte dela":
                            "It becomes hard to understand, test and reuse each part of it",
                        "O Python não permite funções com mais de uma linha de código":
                            "Python does not allow functions with more than one line of code",
                        "A função roda mais devagar só por causa do nome comprido":
                            "The function runs slower just because of the long name",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfunction double(n) {\n  return n * 2;\n}\n\nfunction quadruple(n) {\n  return double(double(n));\n}\n\nconsole.log(quadruple(3));\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\ndef double(n):\n    return n * 2\n\ndef quadruple(n):\n    return double(double(n))\n\nprint(quadruple(3))\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: { "12": I("12"), "24": I("24"), "6": I("6"), "9": I("9") },
                    py: { "12": I("12"), "6": I("6"), "9": I("9"), "24": I("24") },
                },
            },
        ],
    },
];
