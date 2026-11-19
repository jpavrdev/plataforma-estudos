// Tradução em inglês do módulo 2 da Lógica de Programação (variáveis, tipos e
// operadores). As variantes JavaScript e Python divergem de verdade aqui
// (let/const x convenção, === x ==, tipos diferentes), então cada aula traz
// blocos e alternativas por variante; literais de código ficam como estão.

import type { AulaDados, Bloco } from "./seed-dados-modulo1-en.ts";

export type AulaModulo2 = Omit<AulaDados, "blocos" | "questoes"> & {
    titulo: { js: string; py: string };
    blocos: { js: Bloco[]; py: Bloco[] };
    questoes: {
        enunciado: { js: string; py: string };
        ops: { js: Record<string, string>; py: Record<string, string> };
    }[];
};

export const TITULO_MODULO_2 = "Module 2 - Variables, types and operators";

const I = (v: string) => v;

export const AULAS_MODULO_2: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: {
            js: "Variables: storing values (let and const)",
            py: "Variables: storing values",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Variables: storing values (let and const)

Imagine you have a box. You stick a label that reads "age" on it and store the number 20 inside. Whenever you need to know the age, you just open the box with that name. That is exactly what a **variable** does in a program: it is a named space (the label) that stores a value (the box's content) for you to use later.

Without variables, a program could not store anything: not a user's name, not the result of a calculation. In this lesson you will learn to create variables in JavaScript using two keywords: \`let\` and \`const\`.`,
                },
                {
                    type: "code",
                    value: `// To create a variable we use "let", followed by the name and the value
let name = "Ana";

console.log(name);
// output: Ana`,
                },
                {
                    type: "text",
                    value: `## Changing the value of a variable

A variable created with \`let\` can have its value changed later. When you write \`name = "something else"\` again (without repeating \`let\`), you are not creating a new box: you are only changing what is inside the box that already exists. That is why it is called a **variable**: the value can vary.`,
                },
                {
                    type: "code",
                    value: `let age = 20;
console.log(age);
// output: 20

age = 21;
console.log(age);
// output: 21`,
                },
                {
                    type: "text",
                    value: `## When the value must not change: const

Sometimes you store a value that must never change during the program, like a fixed tax rate or the number of days in a week. For those cases there is \`const\` (for "constant"). It works like \`let\` when creating the variable, but after that JavaScript does not let you assign a new value to it: if you try, the program stops with an error.

A good practice: use \`const\` whenever you can, and only switch to \`let\` when you already know you will need to change the value later.`,
                },
                {
                    type: "code",
                    value: `const PI = 3.14;
console.log(PI);
// output: 3.14

// The line below would fail, because PI was created with const:
// PI = 3.15;
// Error: Assignment to constant variable.

// Good variable names help understand the code:
let studentName = "Pedro";   // good: describes what it stores
let x = "Pedro";             // works, but says nothing about the value`,
                },
                {
                    type: "quote",
                    value: `A variable is a box with a name: with \`let\` the content can change, with \`const\` it stays fixed. Give your variables clear names, and you will understand your own code days later.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Variables: storing values

Imagine you have a box. You stick a label that reads "age" on it and store the number 20 inside. Whenever you need to know the age, you just open the box with that name. That is exactly what a **variable** does in a program: it is a named space (the label) that stores a value (the box's content) for you to use later.

Without variables, a program could not store anything: not a user's name, not the result of a calculation. In Python, creating a variable is simple: you write the name, an equals sign and the value. No special keyword needed before it.`,
                },
                {
                    type: "code",
                    value: `# To create a variable, write the name, an = and the value
name = "Ana"

print(name)
# output: Ana`,
                },
                {
                    type: "text",
                    value: `## Changing the value of a variable

The value stored in a variable can be changed later. When you write \`name = "something else"\` again, you are not creating a new box: you are only changing what is inside the box that already exists. That is why it is called a **variable**: the value can vary over the course of the program.`,
                },
                {
                    type: "code",
                    value: `age = 20
print(age)
# output: 20

age = 21
print(age)
# output: 21`,
                },
                {
                    type: "text",
                    value: `## When the value must not change: a convention

Sometimes you store a value that should not change during the program, like a fixed tax rate or the number of days in a week. Some languages have a lock for that, but Python does not: here it is done by **convention**. When a value is meant to be constant, we write the whole name in UPPERCASE, like \`PI\` or \`DAYS_IN_WEEK\`.

That does not truly prevent the change: Python will let you assign another value anyway. The uppercase is a message to whoever reads the code: "this value is not meant to be changed". Respecting that agreement is a good practice.`,
                },
                {
                    type: "code",
                    value: `PI = 3.14
print(PI)
# output: 3.14

# Python does NOT lock it: the line below would work, but breaks the convention
# PI = 3.15

# Good names help understand the code:
student_name = "Pedro"   # good: describes what it stores
x = "Pedro"              # works, but says nothing about the value`,
                },
                {
                    type: "quote",
                    value: `A variable is a box with a name: in Python, \`name = value\` is all it takes to create one. An UPPERCASE name signals that it should not change, but it is only a convention. Give clear names and you will understand your own code days later.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "Which option below correctly creates a variable called age storing the value 15?",
                    py: "Which option below correctly creates a variable called age storing the value 15?",
                },
                ops: {
                    js: {
                        "let idade = 15;": "let age = 15;",
                        "let idade == 15;": "let age == 15;",
                        "idade == 15;": "age == 15;",
                        "let 15 = idade;": "let 15 = age;",
                    },
                    py: {
                        "int idade = 15": "int age = 15",
                        "idade = 15": "age = 15",
                        "idade == 15": "age == 15",
                        "15 = idade": "15 = age",
                    },
                },
            },
            {
                enunciado: {
                    js: 'After running the code below, what appears in the console?\nlet city = "Recife";\ncity = "Salvador";\nconsole.log(city);',
                    py: 'After running the code below, what appears on the screen?\ncity = "Recife"\ncity = "Salvador"\nprint(city)',
                },
                ops: {
                    js: { Salvador: I("Salvador"), Recife: I("Recife"), cidade: "city", undefined: I("undefined") },
                    py: { Recife: I("Recife"), cidade: "city", None: I("None"), Salvador: I("Salvador") },
                },
            },
            {
                enunciado: {
                    js: "What happens if you try to reassign a new value to a variable created with const?",
                    py: "In Python, what guarantees that a variable written in UPPERCASE, like PI = 3.14, is never changed?",
                },
                ops: {
                    js: {
                        "O programa trava com erro, pois const não é reatribuível":
                            "The program stops with an error, because const cannot be reassigned",
                        "O valor é alterado normalmente, como em uma variável com let":
                            "The value changes normally, like in a let variable",
                        "O valor antigo e o novo ficam guardados juntos na mesma variável":
                            "The old and the new value stay stored together in the same variable",
                        "A variável se transforma automaticamente em let":
                            "The variable automatically becomes a let",
                    },
                    py: {
                        "O interpretador apaga a variável se você tentar alterá-la":
                            "The interpreter deletes the variable if you try to change it",
                        "É preciso escrever const antes do nome para travar o valor":
                            "You have to write const before the name to lock the value",
                        "Nada; as maiúsculas são só uma convenção entre programadores":
                            "Nothing; the uppercase is only a convention among programmers",
                        "A linguagem trava a variável e impede qualquer nova atribuição a ela":
                            "The language locks the variable and prevents any new assignment to it",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which of the names below is a valid variable name in JavaScript?",
                    py: "Which of the names below is a valid variable name in the recommended Python style?",
                },
                ops: {
                    js: {
                        "nome-de-usuario": "user-name",
                        "1nome": "1name",
                        "nome de usuario": "user name",
                        nomeDeUsuario: "userName",
                    },
                    py: {
                        nome_de_usuario: "user_name",
                        "nome-de-usuario": "user-name",
                        "1nome": "1name",
                        "nome de usuario": "user name",
                    },
                },
            },
            {
                enunciado: {
                    js: "What happens when you run the code below?\nlet points = 10;\nlet points = 20;\nconsole.log(points);",
                    py: "What does the code below show on the screen?\na = 5\nb = a\na = 10\nprint(b)",
                },
                ops: {
                    js: {
                        "O console mostra 10 primeiro, e depois mostra 20":
                            "The console shows 10 first, and then shows 20",
                        "O console mostra 10": "The console shows 10",
                        "O console mostra 20": "The console shows 20",
                        "O código dá erro: let não permite redeclarar pontos":
                            "The code errors out: let does not allow redeclaring points",
                    },
                    py: {
                        "5, pois b guardou o valor que a tinha na hora":
                            "5, because b stored the value a had at that moment",
                        "None, já que a mudou de valor logo depois":
                            "None, since a changed value right after",
                        "Dá erro ao imprimir b, porque a foi alterada":
                            "It errors out when printing b, because a was changed",
                        "10, porque b passou a apontar direto para a variável a":
                            "10, because b started pointing straight at the variable a",
                    },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: {
            js: "Data types: number, text and boolean",
            py: "Data types: number, text and boolean",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Every value has a type

In the last lesson you stored values inside variables, but not every value is the same "type". Think of a drawer organizer: one part holds numbers, another holds papers with text, another holds only things that are "on" or "off". In JavaScript, the three most basic types are:

- **number**: numbers, integers or with decimal places
- **string**: text, always written between quotes
- **boolean**: only two possible values, \`true\` or \`false\`

JavaScript figures out the type on its own, by looking at the value. To check a variable's type, there is the \`typeof\` operator.`,
                },
                {
                    type: "code",
                    value: `let age = 25;        // number (integer)
let price = 19.90;     // number (with decimal places)
let name = "Maria";    // string (text between quotes)
let active = true;     // boolean (true or false)

console.log(typeof age);
// output: number

console.log(typeof name);
// output: string

console.log(typeof active);
// output: boolean`,
                },
                {
                    type: "text",
                    value: `## Joining texts: concatenation and template strings

When both sides of a \`+\` are text, the \`+\` does not add: it **concatenates**, that is, it joins one text to the end of the other. It is the oldest way of building a sentence with variable values inside it.

There is also a more modern, easier-to-read form: the **template string**. Instead of regular quotes, you use backticks (\`) to open and close the text, and place \`\${variableName}\` in the middle to insert a variable's value there.`,
                },
                {
                    type: "code",
                    value: `let name = "Carlos";
let age = 30;

// Concatenating with +
console.log("Name: " + name + ", age: " + age);
// output: Name: Carlos, age: 30

// With a template string (easier to read and write)
console.log(\`Name: \${name}, age: \${age}\`);
// output: Name: Carlos, age: 30`,
                },
                {
                    type: "text",
                    value: `## Careful: "10" is not the same as 10

A common trap for beginners: \`"10"\` (with quotes) is a string, a text that happens to look like a number. \`10\` (without quotes) is a real number. They may even look the same on the screen, but they behave differently in calculations.

The \`+\` operator is the trickiest here: if at least one side is a string, \`+\` concatenates instead of adding. That is why \`"5" + 3\` is not 8: it is the text \`"53"\`, because the \`3\` is turned into text and glued after the \`"5"\`.`,
                },
                {
                    type: "table",
                    value: `[["Expression","Appears in the console","Result type"],["10 + 5","15","number"],["\\"10\\" + 5","105","string"],["\\"5\\" + 3","53","string"],["5 + \\"3\\"","53","string"]]`,
                },
                {
                    type: "quote",
                    value: `Every value has a type: number for numbers, string for text (always between quotes or backticks) and boolean for true or false. And be careful with +: next to a string, it does not add, it joins.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Every value has a type

In the last lesson you stored values inside variables, but not every value is the same "type". Think of a drawer organizer: one part holds numbers, another holds papers with text, another holds only things that are "on" or "off". In Python, the most basic types are:

- **int**: integers, without decimal places (like 25)
- **float**: numbers with decimal places (like 19.90)
- **str**: text, always written between quotes
- **bool**: only two possible values, \`True\` or \`False\`

Python figures out the type on its own, by looking at the value. To check a variable's type, there is the \`type()\` function.`,
                },
                {
                    type: "code",
                    value: `age = 25          # int (integer)
price = 19.90     # float (number with decimal places)
name = "Maria"    # str (text between quotes)
active = True     # bool (true or false)

print(type(age))
# output: <class 'int'>

print(type(name))
# output: <class 'str'>

print(type(active))
# output: <class 'bool'>`,
                },
                {
                    type: "text",
                    value: `## Joining texts: concatenation and f-strings

When both sides of a \`+\` are text, the \`+\` does not add: it **concatenates**, that is, it joins one text to the end of the other. It is the oldest way of building a sentence with variable values inside it.

There is also a more modern, easier-to-read form: the **f-string**. You write the letter \`f\` before the quotes and place \`{variable_name}\` in the middle of the text to insert that variable's value there. Notice that, to join a number to a text with \`+\`, you have to convert it first with \`str()\`; with an f-string that happens by itself.`,
                },
                {
                    type: "code",
                    value: `name = "Carlos"
age = 30

# Concatenating with + (the number has to become text with str())
print("Name: " + name + ", age: " + str(age))
# output: Name: Carlos, age: 30

# With an f-string (easier to read and write)
print(f"Name: {name}, age: {age}")
# output: Name: Carlos, age: 30`,
                },
                {
                    type: "text",
                    value: `## Careful: "10" is not the same as 10

A common trap for beginners: \`"10"\` (with quotes) is a str, a text that happens to look like a number. \`10\` (without quotes) is a real int. They may even look the same on the screen, but they behave differently.

In Python, mixing the two in a \`+\` does not go unnoticed: \`"5" + 3\` does **not** become 8 or "53", it stops the program with an error (TypeError), because Python does not join text with a number automatically. Fun fact: \`"5" * 3\` does work and returns \`"555"\`, because \`*\` between text and a number repeats the text.`,
                },
                {
                    type: "table",
                    value: `[["Expression","Result","Type"],["10 + 5","15","int"],["\\"10\\" + \\"5\\"","\\"105\\"","str"],["\\"ab\\" * 3","\\"ababab\\"","str"],["\\"5\\" + 3","error (TypeError)","—"]]`,
                },
                {
                    type: "quote",
                    value: `Every value has a type: int and float for numbers, str for text (always between quotes) and bool for True or False. And be careful with +: between two texts it joins, but between text and a number it complains. When in doubt, use an f-string.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is the type (typeof) of the value 42 in JavaScript?",
                    py: "What type does Python associate with the value 42?",
                },
                ops: {
                    js: { boolean: I("boolean"), texto: "text", number: I("number"), string: I("string") },
                    py: { bool: I("bool"), str: I("str"), float: I("float"), int: I("int") },
                },
            },
            {
                enunciado: {
                    js: "Which option below is a value of type string?",
                    py: "Which option below is a value of type str?",
                },
                ops: {
                    js: { true: I("true"), false: I("false"), "25": I("25"), '"25"': I('"25"') },
                    py: { True: I("True"), '"25"': I('"25"'), "3.14": I("3.14"), "25": I("25") },
                },
            },
            {
                enunciado: {
                    js: 'What appears in the console after this code?\nlet city = "Belo Horizonte";\nlet country = "Brazil";\nconsole.log(`City: ${city}, country: ${country}`);',
                    py: 'What appears on the screen after this code?\ncity = "Belo Horizonte"\ncountry = "Brazil"\nprint(f"City: {city}, country: {country}")',
                },
                ops: {
                    js: {
                        "Cidade: ${cidade}, país: ${pais}": "City: ${city}, country: ${country}",
                        "Cidade: Belo Horizonte, país: Brasil": "City: Belo Horizonte, country: Brazil",
                        "Isso não é um código válido": "This is not valid code",
                        "Cidade: cidade, país: pais": "City: city, country: country",
                    },
                    py: {
                        "Cidade: {cidade}, país: {pais}": "City: {city}, country: {country}",
                        "Cidade: Belo Horizonte, país: Brasil": "City: Belo Horizonte, country: Brazil",
                        "Dá erro, pois faltou juntar os textos com +":
                            "It errors out, because the texts were not joined with +",
                        "Cidade: cidade, país: pais": "City: city, country: country",
                    },
                },
            },
            {
                enunciado: {
                    js: "After let active = false; what is the result of console.log(typeof active);?",
                    py: "After active = False, what type does Python associate with the variable active?",
                },
                ops: {
                    js: { undefined: I("undefined"), false: I("false"), boolean: I("boolean"), true: I("true") },
                    py: { str: I("str"), False: I("False"), int: I("int"), bool: I("bool") },
                },
            },
            {
                enunciado: {
                    js: 'What is the result of console.log("5" + 3);?',
                    py: 'What is the result of print("5" + 3)?',
                },
                ops: {
                    js: {
                        "Erro de execução, por misturar texto com número":
                            "A runtime error, for mixing text with number",
                        "8 (um number)": "8 (a number)",
                        "53 (um number)": "53 (a number)",
                        '"53" (uma string)': '"53" (a string)',
                    },
                    py: {
                        "53, colando o número logo depois do texto": "53, gluing the number right after the text",
                        "Erro (TypeError): str e int não se juntam": "An error (TypeError): str and int do not join",
                        "555, repetindo o texto três vezes seguidas": "555, repeating the text three times in a row",
                        "8, porque ele soma os dois valores normalmente":
                            "8, because it adds the two values normally",
                    },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: {
            js: "Arithmetic operators (and the remainder with %)",
            py: "Arithmetic operators (and the remainder with %)",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## JavaScript is also a calculator

Besides storing values, JavaScript can do calculations. The arithmetic operators work almost like the math you already know: addition, subtraction, multiplication and division. There is just one extra operator, which may be new to you: \`%\`, which returns the remainder of a division and is one of the most useful in a programmer's daily life.`,
                },
                {
                    type: "table",
                    value: `[["Operator","Meaning","Example","Result"],["+","addition","10 + 3","13"],["-","subtraction","10 - 3","7"],["*","multiplication","10 * 3","30"],["/","division","9 / 2","4.5"],["%","remainder of the division","10 % 3","1"]]`,
                },
                {
                    type: "code",
                    value: `console.log(10 + 3);
// output: 13

console.log(10 - 3);
// output: 7

console.log(10 * 3);
// output: 30

console.log(9 / 2);
// output: 4.5`,
                },
                {
                    type: "text",
                    value: `## The remainder of a division (%) and the order of operations

\`%\` returns what is left over when a division is not exact. It is like dividing 10 candies among 3 friends: each one gets 3 candies, and 1 is left in your hand. In code, \`10 % 3\` is exactly that remainder: \`1\`.

One of the most common uses of \`%\` is finding out whether a number is even or odd: every even number divided by 2 has remainder 0, and every odd number has remainder 1.

Just like in school math, multiplication and division are calculated before addition and subtraction. If you want to force a different order, use parentheses, exactly like you would on paper.`,
                },
                {
                    type: "code",
                    value: `// Finding out whether a number is even or odd
let number = 7;
console.log(number % 2);
// output: 1 (1 was left over, so number is odd)

let anotherNumber = 8;
console.log(anotherNumber % 2);
// output: 0 (nothing left over, so anotherNumber is even)`,
                },
                {
                    type: "code",
                    value: `console.log(2 + 3 * 4);
// output: 14 (multiplies 3 * 4 first, then adds the 2)

console.log((2 + 3) * 4);
// output: 20 (the parenthesis forces the addition to happen first)`,
                },
                {
                    type: "quote",
                    value: `The arithmetic operators do calculations like in math, and % is great for finding leftovers, like knowing whether a number is even or odd. When in doubt about the order of operations, use parentheses.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Python is also a calculator

Besides storing values, Python can do calculations. The arithmetic operators work almost like the math you already know: addition, subtraction, multiplication and division. One important detail: division with \`/\` **always** returns a number with decimal places (a float), even when the calculation is exact, so \`10 / 2\` gives \`5.0\`.

Python also brings three operators that may be new to you: \`//\` (integer division, which discards the fractional part), \`%\` (the remainder of a division) and \`**\` (exponentiation). \`%\` is one of the most useful in a programmer's daily life.`,
                },
                {
                    type: "table",
                    value: `[["Operator","Meaning","Example","Result"],["+","addition","10 + 3","13"],["-","subtraction","10 - 3","7"],["*","multiplication","10 * 3","30"],["/","division (gives a float)","9 / 2","4.5"],["//","integer division","9 // 2","4"],["%","remainder of the division","10 % 3","1"],["**","exponentiation","2 ** 3","8"]]`,
                },
                {
                    type: "code",
                    value: `print(10 + 3)
# output: 13

print(10 - 3)
# output: 7

print(9 / 2)
# output: 4.5

print(9 // 2)
# output: 4  (integer division: discards what is left)`,
                },
                {
                    type: "text",
                    value: `## The remainder of a division (%) and the order of operations

\`%\` returns what is left over when a division is not exact. It is like dividing 10 candies among 3 friends: each one gets 3 candies, and 1 is left in your hand. In code, \`10 % 3\` is exactly that remainder: \`1\`.

One of the most common uses of \`%\` is finding out whether a number is even or odd: every even number divided by 2 has remainder 0, and every odd number has remainder 1.

Just like in school math, Python calculates exponentiation (\`**\`) first, then multiplication, division and remainder, and only then addition and subtraction. To force another order, use parentheses, exactly like you would on paper.`,
                },
                {
                    type: "code",
                    value: `# Finding out whether a number is even or odd
number = 7
print(number % 2)
# output: 1 (1 was left over, so number is odd)

another_number = 8
print(another_number % 2)
# output: 0 (nothing left over, so another_number is even)`,
                },
                {
                    type: "code",
                    value: `print(2 + 3 * 4)
# output: 14 (multiplies 3 * 4 first, then adds the 2)

print((2 + 3) * 4)
# output: 20 (the parenthesis forces the addition to happen first)

print(2 ** 3)
# output: 8 (2 raised to the power of 3)`,
                },
                {
                    type: "quote",
                    value: `The arithmetic operators do calculations like in math. / always gives a float, // returns only the integer part and % shows the leftover, great for knowing whether a number is even or odd. When in doubt about the order, use parentheses.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is the result of console.log(10 % 3);?",
                    py: "What is the result of print(10 % 3)?",
                },
                ops: {
                    js: { "1": I("1"), "3.33": I("3.33"), "30": I("30"), "3": I("3") },
                    py: { "3.33": I("3.33"), "30": I("30"), "1": I("1"), "3": I("3") },
                },
            },
            {
                enunciado: {
                    js: "Which operator returns the remainder of a division in JavaScript?",
                    py: "Which operator returns the remainder of a division in Python?",
                },
                ops: {
                    js: { "/": I("/"), "%": I("%"), "*": I("*"), "//": I("//") },
                    py: { "//": I("//"), "**": I("**"), "/": I("/"), "%": I("%") },
                },
            },
            {
                enunciado: {
                    js: "What is the result of console.log(2 + 3 * 4);?",
                    py: "What is the result of print(2 + 3 * 4)?",
                },
                ops: {
                    js: { "24": I("24"), "14": I("14"), "20": I("20"), "9": I("9") },
                    py: { "24": I("24"), "9": I("9"), "20": I("20"), "14": I("14") },
                },
            },
            {
                enunciado: {
                    js: "A variable called age holds an integer. Which expression results in 0 when that number is even?",
                    py: "A variable called age holds an integer. Which expression results in 0 when that number is even?",
                },
                ops: {
                    js: {
                        "idade / 2": "age / 2",
                        "idade * 2": "age * 2",
                        "idade - 2": "age - 2",
                        "idade % 2": "age % 2",
                    },
                    py: {
                        "idade / 2": "age / 2",
                        "idade * 2": "age * 2",
                        "idade % 2": "age % 2",
                        "idade // 2": "age // 2",
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the result of console.log(10 - 4 % 3 + 2 * 2);?",
                    py: "What is the result of print(10 - 4 % 3 + 2 * 2)?",
                },
                ops: {
                    js: { "5": I("5"), "4": I("4"), "13": I("13"), "9": I("9") },
                    py: { "9": I("9"), "13": I("13"), "4": I("4"), "5": I("5") },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: {
            js: "Comparisons: = vs === and the comparison signs",
            py: "Comparisons: = vs == and the comparison signs",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Asking questions with code

So far you have done calculations that return numbers. But you can also ask JavaScript questions, like "is this value greater than that one?" or "are these two values equal?". These questions are the **comparison operators**, and the answer is always a boolean: \`true\` or \`false\`, exactly like you saw in the lesson about data types.`,
                },
                {
                    type: "code",
                    value: `console.log(5 > 3);
// output: true

console.log(5 < 3);
// output: false

console.log(5 >= 5);
// output: true

console.log(5 <= 4);
// output: false

console.log(5 === 5);
// output: true

console.log(5 !== 5);
// output: false`,
                },
                {
                    type: "table",
                    value: `[["Operator","Meaning","Example","Result"],["===","equal to (value and type)","5 === 5","true"],["!==","different from","5 !== 3","true"],[">","greater than","5 > 3","true"],["<","less than","5 < 3","false"],[">=","greater than or equal to","5 >= 5","true"],["<=","less than or equal to","5 <= 4","false"]]`,
                },
                {
                    type: "text",
                    value: `## The most common beginner mistake: = and ===

This is the point where almost every beginner trips once: \`=\` and \`===\` look similar, but they do completely different things.

- \`=\` is **assignment**: it stores a value inside a variable. \`age = 18\` means "put 18 inside age".
- \`===\` is **comparison**: it asks whether two values are equal and returns \`true\` or \`false\`. \`age === 18\` means "is age equal to 18?".

There is also \`==\`, an older one, which compares values but ignores the type, converting one side in an attempt to match the other. That can produce results that confuse even experienced people. So prefer \`===\` and \`!==\` whenever possible: they compare value and type together, with no hidden conversions, and the result is more predictable.`,
                },
                {
                    type: "code",
                    value: `let number = 10;
// this is assignment: stores 10 inside number

console.log(number === 10);
// output: true (this is comparison: is number equal to 10?)

console.log("5" == 5);
// output: true (== converts the type before comparing)

console.log("5" === 5);
// output: false (=== compares value AND type, no conversion)`,
                },
                {
                    type: "code",
                    value: `let ageAna = 25;
let ageBruno = 30;

console.log(ageAna > ageBruno);
// output: false

console.log(ageAna !== ageBruno);
// output: true`,
                },
                {
                    type: "quote",
                    value: `A single equals sign (=) stores a value. Three signs (===) ask whether two values are equal. Always prefer === and !== over == and !=: the result is more predictable.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Asking questions with code

So far you have done calculations that return numbers. But you can also ask Python questions, like "is this value greater than that one?" or "are these two values equal?". These questions are the **comparison operators**, and the answer is always a bool: \`True\` or \`False\`, exactly like you saw in the lesson about data types.`,
                },
                {
                    type: "code",
                    value: `print(5 > 3)
# output: True

print(5 < 3)
# output: False

print(5 >= 5)
# output: True

print(5 <= 4)
# output: False

print(5 == 5)
# output: True

print(5 != 5)
# output: False`,
                },
                {
                    type: "table",
                    value: `[["Operator","Meaning","Example","Result"],["==","equal to","5 == 5","True"],["!=","different from","5 != 3","True"],[">","greater than","5 > 3","True"],["<","less than","5 < 3","False"],[">=","greater than or equal to","5 >= 5","True"],["<=","less than or equal to","5 <= 4","False"]]`,
                },
                {
                    type: "text",
                    value: `## The most common beginner mistake: = and ==

This is the point where almost every beginner trips once: \`=\` and \`==\` look similar, but they do completely different things.

- \`=\` is **assignment**: it stores a value inside a variable. \`age = 18\` means "put 18 inside age".
- \`==\` is **comparison**: it asks whether two values are equal and returns \`True\` or \`False\`. \`age == 18\` means "is age equal to 18?".

For "different from", Python uses \`!=\`. And if you have seen \`===\` in another language like JavaScript, you can forget it here: in Python it does not exist and would cause an error. Here \`==\` already compares the value taking the type into account, and Python does **not** convert types behind your back: that is why \`"10" == 10\` is \`False\`, a text is never equal to a number.`,
                },
                {
                    type: "code",
                    value: `number = 10
# this is assignment: stores 10 inside number

print(number == 10)
# output: True (this is comparison: is number equal to 10?)

print("10" == 10)
# output: False (str is never equal to int; Python does not convert)

print(10 == 10.0)
# output: True (int and float with the same value are equal)`,
                },
                {
                    type: "code",
                    value: `age_ana = 25
age_bruno = 30

print(age_ana > age_bruno)
# output: False

print(age_ana != age_bruno)
# output: True`,
                },
                {
                    type: "quote",
                    value: `A single equals sign (=) stores a value. Two signs (==) ask whether two values are equal, and != asks whether they are different. Python has no ===: == already compares value and type, with no hidden conversions.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is the result of console.log(7 > 5);?",
                    py: "What is the result of print(7 > 5)?",
                },
                ops: {
                    js: { false: I("false"), true: I("true"), "7": I("7"), "5": I("5") },
                    py: { True: I("True"), "5": I("5"), False: I("False"), "7": I("7") },
                },
            },
            {
                enunciado: {
                    js: "Which symbol should we use in JavaScript to compare whether two values are equal, also taking the type into account?",
                    py: "Which symbol do we use in Python to compare whether two values are equal?",
                },
                ops: {
                    js: { eq: I("eq"), "==": I("=="), "=": I("="), "===": I("===") },
                    py: { "=": I("="), eq: I("eq"), "===": I("==="), "==": I("==") },
                },
            },
            {
                enunciado: {
                    js: "What is the difference between these two lines?\nline 1: age = 18;\nline 2: age === 18;",
                    py: "What is the difference between these two lines?\nline 1: age = 18\nline 2: age == 18",
                },
                ops: {
                    js: {
                        "As duas comparam, mas com tipos diferentes": "Both compare, but with different types",
                        "A linha 1 guarda 18 em idade; a linha 2 pergunta se é igual a 18":
                            "Line 1 stores 18 in age; line 2 asks whether it equals 18",
                        "As duas linhas fazem exatamente a mesma coisa":
                            "Both lines do exactly the same thing",
                        "A linha 1 compara valores; a linha 2 guarda um valor booleano":
                            "Line 1 compares values; line 2 stores a boolean value",
                    },
                    py: {
                        "As duas linhas fazem exatamente a mesma coisa":
                            "Both lines do exactly the same thing",
                        "A linha 1 compara os valores; a linha 2 guarda um booleano":
                            "Line 1 compares the values; line 2 stores a boolean",
                        "A linha 1 guarda 18 em idade; a linha 2 checa se é igual":
                            "Line 1 stores 18 in age; line 2 checks whether it is equal",
                        "As duas comparam idade com 18, de jeitos diferentes":
                            "Both compare age with 18, in different ways",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which of the expressions below results in false?",
                    py: "Which of the expressions below results in False?",
                },
                ops: {
                    js: {
                        "10 <= 10": I("10 <= 10"),
                        "10 >= 11": I("10 >= 11"),
                        "10 !== 5": I("10 !== 5"),
                        "10 === 10": I("10 === 10"),
                    },
                    py: {
                        "10 == 10": I("10 == 10"),
                        "10 <= 10": I("10 <= 10"),
                        "10 >= 11": I("10 >= 11"),
                        "10 != 5": I("10 != 5"),
                    },
                },
            },
            {
                enunciado: {
                    js: 'What appears in the console?\nconsole.log("10" === 10);\nconsole.log("10" == 10);',
                    py: 'What does the code below show on the screen?\nprint("10" == 10)\nprint(10 == 10.0)',
                },
                ops: {
                    js: {
                        "false e depois false": "false and then false",
                        "true e depois false": "true and then false",
                        "true e depois true": "true and then true",
                        "false e depois true": "false and then true",
                    },
                    py: {
                        "False e depois False": "False and then False",
                        "True e depois False": "True and then False",
                        "False e depois True": "False and then True",
                        "True e depois True": "True and then True",
                    },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: {
            js: "Logical operators: and, or, not",
            py: "Logical operators: and, or, not",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Combining questions

Sometimes a single question is not enough. Think about getting into a party: you may need to have an invitation AND be on the guest list. Or maybe having an invitation OR being a friend of the organizer is enough. In JavaScript, these "and" and "or" are logical operators, and there is also the "not", which inverts an answer. The three are:

- \`&&\` (and): only true if both sides are true
- \`||\` (or): true if at least one of the sides is true
- \`!\` (not): inverts the value, turns true into false and false into true`,
                },
                {
                    type: "code",
                    value: `console.log(true && true);
// output: true

console.log(true && false);
// output: false

console.log(true || false);
// output: true

console.log(false || false);
// output: false

console.log(!true);
// output: false

console.log(!false);
// output: true`,
                },
                {
                    type: "table",
                    value: `[["A","B","A && B","A || B"],["true","true","true","true"],["true","false","false","true"],["false","true","false","true"],["false","false","false","false"]]`,
                },
                {
                    type: "text",
                    value: `## Combining real comparisons

The most common use of \`&&\` and \`||\` is joining comparisons, to build more complete rules. For example: "a person can drive if they are 18 or older AND have a driver's license". That becomes a comparison with \`>=\` combined with a boolean variable, using \`&&\`.

When mixing several comparisons in the same expression, you can use parentheses to make it very clear what should be computed in each part, the same way you did with calculations in the lesson about arithmetic operators.`,
                },
                {
                    type: "code",
                    value: `let age = 20;
let hasLicense = true;

console.log(age >= 18 && hasLicense);
// output: true (both conditions are true)

let hasCoupon = false;
let cartTotal = 150;

console.log(cartTotal > 100 || hasCoupon);
// output: true (one true condition is enough for ||)`,
                },
                {
                    type: "code",
                    value: `let raining = false;
console.log(!raining);
// output: true (it is not raining)

let visitorAge = 15;
console.log(!(visitorAge >= 18));
// output: true (it is not true that the age is greater than or equal to 18)`,
                },
                {
                    type: "quote",
                    value: `&& requires both sides to be true, || just needs one true side, and ! inverts the value. Combine comparisons with these operators to write more complete rules.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Combining questions

Sometimes a single question is not enough. Think about getting into a party: you may need to have an invitation AND be on the guest list. Or maybe having an invitation OR being a friend of the organizer is enough. In Python, these "and" and "or" are logical operators, written as words, and there is also the "not", which inverts an answer. The three are:

- \`and\` (and): only \`True\` if both sides are \`True\`
- \`or\` (or): \`True\` if at least one of the sides is \`True\`
- \`not\` (not): inverts the value, turns \`True\` into \`False\` and \`False\` into \`True\``,
                },
                {
                    type: "code",
                    value: `print(True and True)
# output: True

print(True and False)
# output: False

print(True or False)
# output: True

print(False or False)
# output: False

print(not True)
# output: False

print(not False)
# output: True`,
                },
                {
                    type: "table",
                    value: `[["A","B","A and B","A or B"],["True","True","True","True"],["True","False","False","True"],["False","True","False","True"],["False","False","False","False"]]`,
                },
                {
                    type: "text",
                    value: `## Combining real comparisons

The most common use of \`and\` and \`or\` is joining comparisons, to build more complete rules. For example: "a person can drive if they are 18 or older AND have a driver's license". That becomes a comparison with \`>=\` combined with a bool variable, using \`and\`.

When mixing several comparisons in the same expression, you can use parentheses to make it very clear what should be computed in each part, the same way you did with calculations in the lesson about arithmetic operators.`,
                },
                {
                    type: "code",
                    value: `age = 20
has_license = True

print(age >= 18 and has_license)
# output: True (both conditions are true)

has_coupon = False
cart_total = 150

print(cart_total > 100 or has_coupon)
# output: True (one true condition is enough for or)`,
                },
                {
                    type: "code",
                    value: `raining = False
print(not raining)
# output: True (it is not raining)

visitor_age = 15
print(not (visitor_age >= 18))
# output: True (it is not true that the age is greater than or equal to 18)`,
                },
                {
                    type: "quote",
                    value: `and requires both sides to be true, or just needs one true side, and not inverts the value. Combine comparisons with these operators to write more complete rules.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is the result of console.log(true && false);?",
                    py: "What is the result of print(True and False)?",
                },
                ops: {
                    js: {
                        "erro de execução": "a runtime error",
                        undefined: I("undefined"),
                        false: I("false"),
                        true: I("true"),
                    },
                    py: {
                        "erro de execução": "a runtime error",
                        None: I("None"),
                        True: I("True"),
                        False: I("False"),
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the result of console.log(!true);?",
                    py: "What is the result of print(not True)?",
                },
                ops: {
                    js: { "!true": I("!true"), false: I("false"), null: I("null"), true: I("true") },
                    py: { True: I("True"), "not True": I("not True"), None: I("None"), False: I("False") },
                },
            },
            {
                enunciado: {
                    js: "What is the result of console.log(false || true);?",
                    py: "What is the result of print(False or True)?",
                },
                ops: {
                    js: { false: I("false"), "1": I("1"), true: I("true"), "0": I("0") },
                    py: { True: I("True"), False: I("False"), "1": I("1"), "0": I("0") },
                },
            },
            {
                enunciado: {
                    js: "A store offers free shipping only if the purchase amount is greater than 100 OR the customer has a coupon. With total being the purchase amount and hasCoupon a boolean, which expression correctly represents that rule?",
                    py: "A store offers free shipping only if the purchase amount is greater than 100 OR the customer has a coupon. With total being the purchase amount and has_coupon a boolean, which expression correctly represents that rule?",
                },
                ops: {
                    js: {
                        "total > 100 || !temCupom": "total > 100 || !hasCoupon",
                        "total < 100 || temCupom": "total < 100 || hasCoupon",
                        "total > 100 && temCupom": "total > 100 && hasCoupon",
                        "total > 100 || temCupom": "total > 100 || hasCoupon",
                    },
                    py: {
                        "total > 100 and tem_cupom": "total > 100 and has_coupon",
                        "total > 100 or tem_cupom": "total > 100 or has_coupon",
                        "total > 100 or not tem_cupom": "total > 100 or not has_coupon",
                        "total < 100 or tem_cupom": "total < 100 or has_coupon",
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the value of console.log((5 > 2 && 3 > 10) || (7 === 7 && 4 < 10));?",
                    py: "What is the value of print((5 > 2 and 3 > 10) or (7 == 7 and 4 < 10))?",
                },
                ops: {
                    js: {
                        "erro de execução": "a runtime error",
                        false: I("false"),
                        "7": I("7"),
                        true: I("true"),
                    },
                    py: {
                        "7": I("7"),
                        True: I("True"),
                        False: I("False"),
                        "erro de execução": "a runtime error",
                    },
                },
            },
        ],
    },
];
