// Tradução em inglês do módulo 3 da Lógica de Programação (condicionais).
// As variantes compartilham a prosa mas divergem na sintaxe (chaves x
// indentação, === x ==, else if x elif) e a aula 5 é outra lição em cada
// linguagem (switch x match/case), então tudo vem por variante.

import type { AulaModulo2 } from "./seed-dados-modulo2-en.ts";

const I = (v: string) => v;

export const TITULO_MODULO_3 = "Module 3 - Conditionals: decisions in code";

export const AULAS_MODULO_3: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: { js: "Making decisions with if", py: "Making decisions with if" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Conditionals: the program makes decisions

So far, your programs always run the same way: they start at the first line and go to the last one, without branching. But the real world is full of decisions, and a useful program needs to make decisions too. A store only approves a purchase if the customer has enough balance. A site only unlocks the content if the user is logged in. A game only declares victory if the player reached the right score.

Think about a decision from your daily life: **if it rains, I take the umbrella**. Notice the structure of that sentence: there is a condition ("it rains") and there is an action that only happens when that condition is true ("taking the umbrella"). If it does not rain, the action simply does not happen, and you carry on without an umbrella.

## Meeting the if

In JavaScript, this idea has a name and a syntax: the \`if\` structure. It tests a boolean condition, the \`true\` or \`false\` you already met in module 2, and only runs a block of code when that condition is \`true\`.`,
                },
                {
                    type: "code",
                    value: `let balance = 200;
let price = 150;

if (balance >= price) {
  console.log("Purchase approved!");
}

// output: Purchase approved!`,
                },
                {
                    type: "text",
                    value: `Notice the three parts of the \`if\`:

- The \`if\` keyword, followed by a condition in parentheses: \`(balance >= price)\`. That condition must result in \`true\` or \`false\`, exactly like the comparison operators you already used in module 2.
- A block of code between braces \`{ }\`. That is what runs when the condition is true.
- If the condition is \`false\`, the whole block is skipped, as if it did not exist, and the program goes straight to the line after the closing brace.

## When the condition is false

Let us see the other side: what happens when the condition does not hold.`,
                },
                {
                    type: "code",
                    value: `let age = 15;

if (age >= 18) {
  console.log("Can enter the party");
}

console.log("Program finished");

// output:
// Program finished`,
                },
                {
                    type: "text",
                    value: `Since \`age\` is 15, the condition \`age >= 18\` is \`false\`. The \`if\` block never runs, so the message "Can enter the party" never appears. But \`console.log("Program finished")\` is outside the \`if\` braces, so it runs anyway: the \`if\` only controls what is inside it.

## Two very common mistakes

The first mistake is forgetting the braces when the block has more than one line. In JavaScript, if you write \`if (condition) line1; line2;\` without braces, only \`line1\` belongs to the \`if\`, and \`line2\` always runs. So always put the braces, even when the block has a single line: it is safer and easier to read.

The second mistake is typing \`=\` (assignment) instead of \`===\` (comparison) inside the condition. That slip does not stop the program with an error, and that is exactly why it is dangerous: it changes the code's behavior without warning.`,
                },
                {
                    type: "code",
                    value: `let age = 15;

// Mistake: using = (assignment) instead of === (comparison)
if (age = 18) {
  console.log("Of age");
}

// output: Of age

// age = 18 ASSIGNS 18 to age, and the if uses the result of that
// assignment, which is 18. JavaScript treats any number other than
// zero as a "truthy" value, so the if runs even though age was 15
// before. The right way was: if (age === 18)`,
                },
                {
                    type: "quote",
                    value: `The if runs a block only when its condition is true. Always use braces, even in single-line blocks, and always use === to compare, never =.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Conditionals: the program makes decisions

So far, your programs always run the same way: they start at the first line and go to the last one, without branching. But the real world is full of decisions, and a useful program needs to make decisions too. A store only approves a purchase if the customer has enough balance. A site only unlocks the content if the user is logged in. A game only declares victory if the player reached the right score.

Think about a decision from your daily life: **if it rains, I take the umbrella**. Notice the structure of that sentence: there is a condition ("it rains") and there is an action that only happens when that condition is true ("taking the umbrella"). If it does not rain, the action simply does not happen, and you carry on without an umbrella.

## Meeting the if

In Python, this idea has a name and a syntax: the \`if\` structure. It tests a boolean condition, the \`True\` or \`False\` you already met in module 2, and only runs a block of code when that condition is \`True\`.`,
                },
                {
                    type: "code",
                    value: `balance = 200
price = 150

if balance >= price:
    print("Purchase approved!")

# output: Purchase approved!`,
                },
                {
                    type: "text",
                    value: `Notice the parts of the \`if\`:

- The \`if\` keyword, followed by a condition and a colon: \`balance >= price:\`. That condition must result in \`True\` or \`False\`, exactly like the comparison operators you already used in module 2. In Python, parentheses around the condition are optional; what cannot be missing is the colon at the end.
- A block of indented code right below, with 4 spaces to the left. That indentation is what tells Python what belongs to the \`if\`; there are no braces \`{ }\` like in other languages.
- If the condition is \`False\`, the indented block is skipped, as if it did not exist, and the program goes straight to the next line aligned with the \`if\`.

## When the condition is false

Let us see the other side: what happens when the condition does not hold.`,
                },
                {
                    type: "code",
                    value: `age = 15

if age >= 18:
    print("Can enter the party")

print("Program finished")

# output:
# Program finished`,
                },
                {
                    type: "text",
                    value: `Since \`age\` is 15, the condition \`age >= 18\` is \`False\`. The \`if\` block never runs, so the message "Can enter the party" never appears. But \`print("Program finished")\` is outside the indented block, aligned with the \`if\` and without the 4 spaces, so it runs anyway: the \`if\` only controls what is indented inside it.

## Two very common mistakes

The first mistake is forgetting the colon at the end of the condition, or indenting the block wrongly. Since indentation is what marks the block in Python, forgetting to indent or mixing spaces stops the program with an error (\`IndentationError\` or \`SyntaxError\`). The good news is that Python warns you right away, so this slip is easy to notice and fix.

The second mistake is typing \`=\` (assignment) in place of \`==\` (comparison) inside the condition. In Python, that does not go unnoticed: writing \`if age = 18:\` raises an immediate syntax error. The language protects you from that slip, but it is still essential to understand the difference: \`=\` stores a value in a variable, while \`==\` asks whether two values are equal.`,
                },
                {
                    type: "code",
                    value: `age = 15

# Mistake: using = (assignment) in place of == (comparison)
if age = 18:
    print("Of age")

# output:
# SyntaxError: invalid syntax

# In Python, trying to use = inside the if condition raises a syntax
# error right away, before the program even runs. The right thing is to
# use ==, which compares two values: if age == 18`,
                },
                {
                    type: "quote",
                    value: `The if runs a block only when its condition is True. End the condition with a colon, indent the block with 4 spaces, and use == to compare, never =.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What is the output of this code in the console?\n\n```javascript\nlet grade = 7;\n\nif (grade >= 6) {\n  console.log("Approved");\n}\n\nconsole.log("Done");\n```',
                    py: 'What is the output of this code?\n\n```python\ngrade = 7\n\nif grade >= 6:\n    print("Approved")\n\nprint("Done")\n```',
                },
                ops: {
                    js: {
                        "Apenas Aprovado": "Only Approved",
                        "Apenas Fim": "Only Done",
                        "Nenhuma mensagem, o código gera erro": "No message; the code raises an error",
                        "Aprovado, e depois Fim": "Approved, and then Done",
                    },
                    py: {
                        "Apenas Fim": "Only Done",
                        "Nenhuma mensagem; o código gera erro": "No message; the code raises an error",
                        "Aprovado, e depois Fim": "Approved, and then Done",
                        "Apenas Aprovado": "Only Approved",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code in the console?\n\n```javascript\nlet age = 12;\n\nif (age >= 18) {\n  console.log("Of age");\n}\n\nconsole.log("Check complete");\n```',
                    py: 'What is the output of this code?\n\n```python\nage = 12\n\nif age >= 18:\n    print("Of age")\n\nprint("Check complete")\n```',
                },
                ops: {
                    js: {
                        "Apenas Verificação concluída": "Only Check complete",
                        "Maior de idade, e depois Verificação concluída": "Of age, and then Check complete",
                        "Apenas Maior de idade": "Only Of age",
                        "Nenhuma mensagem aparece": "No message appears",
                    },
                    py: {
                        "Maior de idade, e depois Verificação concluída": "Of age, and then Check complete",
                        "Apenas Verificação concluída": "Only Check complete",
                        "Nenhuma mensagem aparece": "No message appears",
                        "Apenas Maior de idade": "Only Of age",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code?\n\n```javascript\nlet x = 3;\n\nif (x > 5)\n  console.log("x is big");\n  console.log("always prints");\n```',
                    py: 'What is the output of this code?\n\n```python\nx = 3\n\nif x > 5:\n    print("x is big")\nprint("always prints")\n```',
                },
                ops: {
                    js: {
                        'Apenas "x é grande"': 'Only "x is big"',
                        'Apenas "sempre imprime"': 'Only "always prints"',
                        "Nenhuma mensagem, porque faltam as chaves e o código não roda":
                            "No message, because the braces are missing and the code does not run",
                        '"x é grande" e depois "sempre imprime"': '"x is big" and then "always prints"',
                    },
                    py: {
                        "Apenas sempre imprime": "Only always prints",
                        "x é grande e depois sempre imprime": "x is big and then always prints",
                        "Apenas x é grande": "Only x is big",
                        "Nenhuma mensagem, porque a indentação está errada":
                            "No message, because the indentation is wrong",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code, and why?\n\n```javascript\nlet number = 0;\n\nif (number = 5) {\n  console.log("Entered the if");\n}\n```',
                    py: 'What is the output of this code, and why?\n\n```python\nnumber = 0\n\nif number = 5:\n    print("Entered the if")\n```',
                },
                ops: {
                    js: {
                        '"Entrou no if", pois = atribui 5 a numero, e o if trata 5 como verdadeiro':
                            '"Entered the if", because = assigns 5 to number, and the if treats 5 as truthy',
                        '"Entrou no if", porque = e === funcionam exatamente da mesma forma dentro de uma condição':
                            '"Entered the if", because = and === work exactly the same way inside a condition',
                        "Nada é impresso, porque numero era 0, que é falso":
                            "Nothing is printed, because number was 0, which is falsy",
                        "Erro de sintaxe: JavaScript não permite = dentro de um if":
                            "A syntax error: JavaScript does not allow = inside an if",
                    },
                    py: {
                        "Nada é impresso, porque numero valia 0, que é um valor falso":
                            "Nothing is printed, because number was 0, which is a falsy value",
                        '"Entrou no if", pois = atribui 5 e o Python trata 5 como verdadeiro':
                            '"Entered the if", because = assigns 5 and Python treats 5 as truthy',
                        "Erro de sintaxe, porque em Python não se usa = para comparar num if":
                            "A syntax error, because in Python = is not used to compare in an if",
                        '"Entrou no if", pois = e == funcionam igual dentro de uma condição':
                            '"Entered the if", because = and == work the same way inside a condition',
                    },
                },
            },
            {
                enunciado: {
                    js: 'You want to approve a purchase only when the balance is greater than or equal to the price. Which snippet does that correctly?',
                    py: 'You want to approve a purchase only when the balance is greater than or equal to the price. Which snippet does that correctly?',
                },
                ops: {
                    js: {
                        'if (saldo = preco) {\n  console.log("Aprovado");\n}':
                            'if (balance = price) {\n  console.log("Approved");\n}',
                        'if (saldo >= preco);\n{\n  console.log("Aprovado");\n}':
                            'if (balance >= price);\n{\n  console.log("Approved");\n}',
                        'if saldo >= preco {\n  console.log("Aprovado");\n}':
                            'if balance >= price {\n  console.log("Approved");\n}',
                        'if (saldo >= preco) {\n  console.log("Aprovado");\n}':
                            'if (balance >= price) {\n  console.log("Approved");\n}',
                    },
                    py: {
                        'if saldo >= preco\n    print("Aprovado")': 'if balance >= price\n    print("Approved")',
                        'if saldo >= preco:\nprint("Aprovado")': 'if balance >= price:\nprint("Approved")',
                        'if saldo >= preco:\n    print("Aprovado")':
                            'if balance >= price:\n    print("Approved")',
                        'if saldo => preco:\n    print("Aprovado")': 'if balance => price:\n    print("Approved")',
                    },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: { js: "if/else: the other path", py: "if/else: the other path" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## if/else: the other path

In the previous module you met \`if\`: it runs a block when the condition is true and, when it is false, simply does nothing. But many everyday decisions have two sides. If it rains, you take an umbrella; if it does not rain, you take a cap for the sun. There is always an action for both cases, not just one.

In JavaScript, the word that represents that "otherwise" is \`else\`. It joins the \`if\` to create two paths: one for when the condition is true, another for when it is false.`,
                },
                {
                    type: "code",
                    value: `let age = 15;

if (age >= 18) {
  console.log("Of age");
} else {
  console.log("Under age");
}

// output: Under age`,
                },
                {
                    type: "text",
                    value: `## How the else works

Notice three important details:

- The \`else\` never has its own condition in parentheses. It represents "in any other case", that is, when the \`if\` condition returned \`false\`.
- The \`else\` is optional. You can use only \`if\`, without \`else\`, like you did in the previous module. But when you use both together, one of the blocks always runs, never both, and never neither.
- Like the \`if\`, the \`else\` block also needs the braces \`{ }\`, even with a single line.

A classic use of if/else is deciding whether a number is even or odd. A number is even when the remainder of its division by 2 is zero, and you already know the operator that computes that remainder: \`%\`, from module 2.`,
                },
                {
                    type: "code",
                    value: `let number = 7;

if (number % 2 === 0) {
  console.log(number + " is even");
} else {
  console.log(number + " is odd");
}

// output: 7 is odd`,
                },
                {
                    type: "code",
                    value: `// Another classic example: finding which of two numbers is the largest
let a = 12;
let b = 7;

if (a >= b) {
  console.log(a + " is the largest");
} else {
  console.log(b + " is the largest");
}

// output: 12 is the largest`,
                },
                {
                    type: "table",
                    value: `[["if condition","Without else","With else"],["true","Runs the if block","Runs the if block"],["false","Runs nothing","Runs the else block"]]`,
                },
                {
                    type: "quote",
                    value: `The else is the path for when the if condition is false. It has no condition of its own, it is optional, and together with the if it guarantees that one of the two blocks will always run.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## if/else: the other path

In the previous module you met \`if\`: it runs a block when the condition is true and, when it is false, simply does nothing. But many everyday decisions have two sides. If it rains, you take an umbrella; if it does not rain, you take a cap for the sun. There is always an action for both cases, not just one.

In Python, the word that represents that "otherwise" is \`else\`. It joins the \`if\` to create two paths: one for when the condition is true, another for when it is false.`,
                },
                {
                    type: "code",
                    value: `age = 15

if age >= 18:
    print("Of age")
else:
    print("Under age")

# output: Under age`,
                },
                {
                    type: "text",
                    value: `## How the else works

Notice three important details:

- The \`else\` never has its own condition. It represents "in any other case", that is, when the \`if\` condition returned \`False\`. That is why it is written alone, followed only by a colon: \`else:\`.
- The \`else\` is optional. You can use only \`if\`, without \`else\`, like you did in the previous module. But when you use both together, one of the blocks always runs, never both, and never neither.
- Like in the \`if\`, the \`else\` block is defined by the 4-space indentation, and the \`else\` must stay aligned with the \`if\` it belongs to.

A classic use of if/else is deciding whether a number is even or odd. A number is even when the remainder of its division by 2 is zero, and you already know the operator that computes that remainder: \`%\`, from module 2.`,
                },
                {
                    type: "code",
                    value: `number = 7

if number % 2 == 0:
    print(f"{number} is even")
else:
    print(f"{number} is odd")

# output: 7 is odd`,
                },
                {
                    type: "code",
                    value: `# Another classic example: finding which of two numbers is the largest
a = 12
b = 7

if a >= b:
    print(f"{a} is the largest")
else:
    print(f"{b} is the largest")

# output: 12 is the largest`,
                },
                {
                    type: "table",
                    value: `[["if condition","Without else","With else"],["True","Runs the if block","Runs the if block"],["False","Runs nothing","Runs the else block"]]`,
                },
                {
                    type: "quote",
                    value: `The else is the path for when the if condition is false. It has no condition of its own, it is optional, and together with the if it guarantees that one of the two blocks will always run.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What is the output in the console?\n\n```javascript\nlet age = 20;\n\nif (age >= 18) {\n  console.log("Of age");\n} else {\n  console.log("Under age");\n}\n```',
                    py: 'What is the output?\n\n```python\nage = 20\n\nif age >= 18:\n    print("Of age")\nelse:\n    print("Under age")\n```',
                },
                ops: {
                    js: {
                        "Maior de idade e Menor de idade, os dois": "Of age and Under age, both",
                        "Nenhuma mensagem aparece": "No message appears",
                        "Maior de idade": I("Of age") as string,
                        "Menor de idade": "Under age",
                    },
                    py: {
                        "Maior de idade": I("Of age") as string,
                        "Menor de idade": "Under age",
                        "Nenhuma mensagem aparece": "No message appears",
                        "Maior de idade e Menor de idade, os dois": "Of age and Under age, both",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output in the console?\n\n```javascript\nlet number = 10;\n\nif (number % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}\n```',
                    py: 'What is the output?\n\n```python\nnumber = 10\n\nif number % 2 == 0:\n    print("even")\nelse:\n    print("odd")\n```',
                },
                ops: {
                    js: { "0": I("0"), "10": I("10"), "ímpar": "odd", par: "even" },
                    py: { "0": I("0"), par: "even", "ímpar": "odd", "10": I("10") },
                },
            },
            {
                enunciado: {
                    js: 'What is the output in the console?\n\n```javascript\nlet a = 6;\nlet b = 6;\n\nif (a >= b) {\n  console.log(a + " is the largest");\n} else {\n  console.log(b + " is the largest");\n}\n```',
                    py: 'What is the output?\n\n```python\na = 6\nb = 6\n\nif a >= b:\n    print(f"{a} is the largest")\nelse:\n    print(f"{b} is the largest")\n```',
                },
                ops: {
                    js: {
                        "Erro de execução, porque a e b são iguais": "A runtime error, because a and b are equal",
                        "Nenhuma mensagem, porque os dois números são iguais":
                            "No message, because the two numbers are equal",
                        "6 é o maior aparece duas vezes": "6 is the largest appears twice",
                        "6 é o maior": "6 is the largest",
                    },
                    py: {
                        "Erro de execução, porque a e b têm o mesmo valor":
                            "A runtime error, because a and b have the same value",
                        "6 é o maior": "6 is the largest",
                        "Nenhuma mensagem, porque os dois números são iguais":
                            "No message, because the two numbers are equal",
                        "6 é o maior aparece duas vezes seguidas": "6 is the largest appears twice in a row",
                    },
                },
            },
            {
                enunciado: {
                    js: "In an if/else structure, is it possible for the if block and the else block to both run in the same run of the program?",
                    py: "In an if/else structure, is it possible for the if block and the else block to both run in the same execution of the program?",
                },
                ops: {
                    js: {
                        "Sim, os dois sempre rodam": "Yes, both always run",
                        "Sim, sempre que a condição for true": "Yes, whenever the condition is true",
                        "Não, sempre apenas um dos dois roda": "No, always only one of the two runs",
                        "Depende da posição das chaves no código": "It depends on the position of the braces in the code",
                    },
                    py: {
                        "Sim, sempre que a condição for True": "Yes, whenever the condition is True",
                        "Depende da posição da indentação no código":
                            "It depends on the position of the indentation in the code",
                        "Não, sempre apenas um dos dois roda": "No, always only one of the two runs",
                        "Sim, os dois blocos sempre rodam juntos": "Yes, both blocks always run together",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code, and why?\n\n```javascript\nlet active = false;\n\nif (active = true) {\n  console.log("Account active");\n} else {\n  console.log("Account inactive");\n}\n```',
                    py: 'What is the output of this code, and why?\n\n```python\nactive = False\n\nif active = True:\n    print("Account active")\nelse:\n    print("Account inactive")\n```',
                },
                ops: {
                    js: {
                        '"Conta ativa" na primeira execução e "Conta inativa" nas seguintes':
                            '"Account active" on the first run and "Account inactive" on the following ones',
                        "Erro de sintaxe: não é permitido usar = dentro de um if":
                            "A syntax error: using = inside an if is not allowed",
                        '"Conta ativa", pois ativo = true atribui true e vira a condição do if':
                            '"Account active", because active = true assigns true and becomes the if condition',
                        '"Conta inativa", porque ativo começou como false':
                            '"Account inactive", because active started as false',
                    },
                    py: {
                        '"Conta inativa", porque ativo começou valendo False':
                            '"Account inactive", because active started as False',
                        '"Conta ativa" na primeira execução e "Conta inativa" nas próximas':
                            '"Account active" on the first run and "Account inactive" on the next ones',
                        '"Conta ativa", pois ativo = True atribui True e vira a condição':
                            '"Account active", because active = True assigns True and becomes the condition',
                        "Erro de sintaxe, pois o Python não aceita = na condição; use ==":
                            "A syntax error, because Python does not accept = in the condition; use ==",
                    },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: {
            js: "else if: several conditions in a chain",
            py: "elif: several conditions in a chain",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## else if: chaining several conditions

So far you have seen decisions with two paths: \`if\` alone (one path) and \`if/else\` (two paths). But many real-life decisions have more than two options. Think about how a school usually grades an exam: a score from 9 to 10 is grade A, from 7 to 8.9 is B, from 5 to 6.9 is C, below 5 is D. That is four possible paths, not two.

For that, JavaScript lets you chain conditions with \`else if\`. You can use as many \`else if\` as you need between the \`if\` and the final \`else\`.`,
                },
                {
                    type: "code",
                    value: `let grade = 8;

if (grade >= 9) {
  console.log("Grade A");
} else if (grade >= 7) {
  console.log("Grade B");
} else if (grade >= 5) {
  console.log("Grade C");
} else {
  console.log("Grade D");
}

// output: Grade B`,
                },
                {
                    type: "table",
                    value: `[["Score range","Grade"],["grade >= 9","A"],["7 <= grade < 9","B"],["5 <= grade < 7","C"],["grade < 5","D"]]`,
                },
                {
                    type: "text",
                    value: `## The order matters

JavaScript tests the conditions from top to bottom and stops at the first \`if\` or \`else if\` that returns \`true\`. All the others, even if they would also be true, are skipped. That is why the order of the checks is not a detail: it is part of the logic.

See what happens when the order is wrong:`,
                },
                {
                    type: "code",
                    value: `let grade = 9.5;

if (grade >= 5) {
  console.log("Grade C");
} else if (grade >= 7) {
  console.log("Grade B");
} else if (grade >= 9) {
  console.log("Grade A");
}

// output: Grade C

// grade is 9.5, so all three conditions would be true. But JavaScript
// stops at the first one it finds: "grade >= 5" is already true, so the
// two following "else if" are never even tested. In this code, "Grade
// A" and "Grade B" never appear for any score, because every score that
// would pass them also passes "grade >= 5", which comes first.`,
                },
                {
                    type: "code",
                    value: `let age = 15;

if (age < 13) {
  console.log("Child");
} else if (age < 18) {
  console.log("Teenager");
} else if (age < 60) {
  console.log("Adult");
} else {
  console.log("Senior");
}

// output: Teenager`,
                },
                {
                    type: "quote",
                    value: `else if chains several conditions in order. JavaScript tests from top to bottom and stops at the first true one, so the order of the checks changes the result.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## elif: chaining several conditions

So far you have seen decisions with two paths: \`if\` alone (one path) and \`if/else\` (two paths). But many real-life decisions have more than two options. Think about how a school usually grades an exam: a score from 9 to 10 is grade A, from 7 to 8.9 is B, from 5 to 6.9 is C, below 5 is D. That is four possible paths, not two.

For that, Python lets you chain conditions with \`elif\`, short for "else if". You can use as many \`elif\` as you need between the \`if\` and the final \`else\`.`,
                },
                {
                    type: "code",
                    value: `grade = 8

if grade >= 9:
    print("Grade A")
elif grade >= 7:
    print("Grade B")
elif grade >= 5:
    print("Grade C")
else:
    print("Grade D")

# output: Grade B`,
                },
                {
                    type: "table",
                    value: `[["Score range","Grade"],["grade >= 9","A"],["7 <= grade < 9","B"],["5 <= grade < 7","C"],["grade < 5","D"]]`,
                },
                {
                    type: "text",
                    value: `## The order matters

Python tests the conditions from top to bottom and stops at the first \`if\` or \`elif\` that returns \`True\`. All the others, even if they would also be true, are skipped. That is why the order of the checks is not a detail: it is part of the logic.

See what happens when the order is wrong:`,
                },
                {
                    type: "code",
                    value: `grade = 9.5

if grade >= 5:
    print("Grade C")
elif grade >= 7:
    print("Grade B")
elif grade >= 9:
    print("Grade A")

# output: Grade C

# grade is 9.5, so all three conditions would be true. But Python stops
# at the first one it finds: "grade >= 5" is already True, so the two
# following elif are never even tested. In this code, "Grade A" and
# "Grade B" never appear for any score, because every score that would
# pass them also passes "grade >= 5", which comes first.`,
                },
                {
                    type: "code",
                    value: `age = 15

if age < 13:
    print("Child")
elif age < 18:
    print("Teenager")
elif age < 60:
    print("Adult")
else:
    print("Senior")

# output: Teenager`,
                },
                {
                    type: "quote",
                    value: `elif chains several conditions in order. Python tests from top to bottom and stops at the first true one, so the order of the checks changes the result.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet grade = 9;\n\nif (grade >= 9) {\n  console.log("Grade A");\n} else if (grade >= 7) {\n  console.log("Grade B");\n} else if (grade >= 5) {\n  console.log("Grade C");\n} else {\n  console.log("Grade D");\n}\n```',
                    py: 'What is the output?\n\n```python\ngrade = 9\n\nif grade >= 9:\n    print("Grade A")\nelif grade >= 7:\n    print("Grade B")\nelif grade >= 5:\n    print("Grade C")\nelse:\n    print("Grade D")\n```',
                },
                ops: {
                    js: {
                        "Conceito A": "Grade A",
                        "Conceito D": "Grade D",
                        "Conceito C": "Grade C",
                        "Conceito B": "Grade B",
                    },
                    py: {
                        "Conceito C": "Grade C",
                        "Conceito B": "Grade B",
                        "Conceito D": "Grade D",
                        "Conceito A": "Grade A",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet age = 70;\n\nif (age < 13) {\n  console.log("Child");\n} else if (age < 18) {\n  console.log("Teenager");\n} else if (age < 60) {\n  console.log("Adult");\n} else {\n  console.log("Senior");\n}\n```',
                    py: 'What is the output?\n\n```python\nage = 70\n\nif age < 13:\n    print("Child")\nelif age < 18:\n    print("Teenager")\nelif age < 60:\n    print("Adult")\nelse:\n    print("Senior")\n```',
                },
                ops: {
                    js: { Criança: "Child", Adulto: "Adult", Adolescente: "Teenager", Idoso: "Senior" },
                    py: { Idoso: "Senior", Adolescente: "Teenager", Adulto: "Adult", Criança: "Child" },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet grade = 4;\n\nif (grade >= 9) {\n  console.log("Grade A");\n} else if (grade >= 7) {\n  console.log("Grade B");\n} else if (grade >= 5) {\n  console.log("Grade C");\n} else {\n  console.log("Grade D");\n}\n```',
                    py: 'What is the output?\n\n```python\ngrade = 4\n\nif grade >= 9:\n    print("Grade A")\nelif grade >= 7:\n    print("Grade B")\nelif grade >= 5:\n    print("Grade C")\nelse:\n    print("Grade D")\n```',
                },
                ops: {
                    js: {
                        "Conceito C": "Grade C",
                        "Nenhum conceito é exibido": "No grade is shown",
                        "Erro, porque nenhuma condição bateu": "An error, because no condition matched",
                        "Conceito D": "Grade D",
                    },
                    py: {
                        "Erro, porque nenhuma condição bateu": "An error, because no condition matched",
                        "Conceito D": "Grade D",
                        "Conceito C": "Grade C",
                        "Nenhum conceito é exibido": "No grade is shown",
                    },
                },
            },
            {
                enunciado: {
                    js: 'In the code below, in which situation would the message "Grade A" be shown?\n\n```javascript\nif (grade >= 5) {\n  console.log("Grade C");\n} else if (grade >= 7) {\n  console.log("Grade B");\n} else if (grade >= 9) {\n  console.log("Grade A");\n}\n```',
                    py: 'In the code below, in which situation would the message "Grade A" be shown?\n\n```python\nif grade >= 5:\n    print("Grade C")\nelif grade >= 7:\n    print("Grade B")\nelif grade >= 9:\n    print("Grade A")\n```',
                },
                ops: {
                    js: {
                        "Quando nota for menor que 5, pulando as duas primeiras condições":
                            "When grade is below 5, skipping the first two conditions",
                        "Sempre que nota for um número par, independente do valor exato":
                            "Whenever grade is an even number, regardless of the exact value",
                        "Quando nota for exatamente 9 ou mais, pois passa direto pela primeira checagem":
                            "When grade is exactly 9 or more, since it skips straight past the first check",
                        "Em nenhuma situação, pois quem chegaria a isso já caiu antes em nota >= 5":
                            "In no situation, because whoever would reach it already fell into grade >= 5 before",
                    },
                    py: {
                        "Em nenhuma situação, pois quem chegaria lá já caiu em nota >= 5":
                            "In no situation, because whoever would reach it already fell into grade >= 5",
                        "Quando nota for menor que 5, pulando as duas primeiras condições da cadeia":
                            "When grade is below 5, skipping the first two conditions of the chain",
                        "Quando nota valer exatamente 9 ou mais, já que passa direto pela primeira checagem":
                            "When grade is exactly 9 or more, since it skips straight past the first check",
                        "Sempre que nota for um número par, seja qual for o valor exato":
                            "Whenever grade is an even number, whatever the exact value",
                    },
                },
            },
            {
                enunciado: {
                    js: 'If the age category chain were written in this order:\n\n```javascript\nif (age < 60) {\n  console.log("Adult");\n} else if (age < 18) {\n  console.log("Teenager");\n} else if (age < 13) {\n  console.log("Child");\n} else {\n  console.log("Senior");\n}\n```\n\nWhat would the output be for age = 10?',
                    py: 'If the age category chain were written in this order:\n\n```python\nif age < 60:\n    print("Adult")\nelif age < 18:\n    print("Teenager")\nelif age < 13:\n    print("Child")\nelse:\n    print("Senior")\n```\n\nWhat would the output be for age = 10?',
                },
                ops: {
                    js: { Adulto: "Adult", Adolescente: "Teenager", Criança: "Child", Idoso: "Senior" },
                    py: { Criança: "Child", Adulto: "Adult", Adolescente: "Teenager", Idoso: "Senior" },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: {
            js: "Compound conditions: and, or, not",
            py: "Compound conditions: and, or, not",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Compound conditions: and, or, not

Many decisions depend on more than one thing at the same time. To enter a party, you usually need to be old enough **and** to have the ticket, both things together. A half-price discount, in turn, usually applies to someone who is a student **or** a senior, either one of the two conditions is enough.

You already met these logical operators in module 2:

- \`&&\` (and): the result is only \`true\` when both conditions are \`true\`.
- \`||\` (or): the result is \`true\` when at least one of the conditions is \`true\`.
- \`!\` (not): inverts a boolean value, turns \`true\` into \`false\` and vice versa.

Now we will use all three inside \`if\` conditions, to make more complete decisions. A classic example that calls for \`&&\`: finding which of three numbers is the largest. A number is only the largest when it is greater than or equal to the other two at the same time.`,
                },
                {
                    type: "code",
                    value: `let a = 4;
let b = 15;
let c = 9;

if (a >= b && a >= c) {
  console.log(a + " is the largest");
} else if (b >= a && b >= c) {
  console.log(b + " is the largest");
} else {
  console.log(c + " is the largest");
}

// output: 15 is the largest`,
                },
                {
                    type: "code",
                    value: `let student = false;
let senior = true;

if (student || senior) {
  console.log("Qualifies for the half-price ticket");
} else {
  console.log("Pays full price");
}

// output: Qualifies for the half-price ticket`,
                },
                {
                    type: "text",
                    value: `Notice the difference between the two operators. In the three-numbers example, \`a\` is only the largest when \`a >= b\` and \`a >= c\` at the same time: if either of those two comparisons is \`false\`, the whole \`&&\` becomes \`false\` and that \`if\` (or \`else if\`) does not run. In the discount example, on the other hand, it is enough for one of the two conditions (\`student\` or \`senior\`) to be \`true\` for the \`||\` to be \`true\`.

The third operator, \`!\`, inverts a condition. It is useful when you want to test "when it is NOT the case".`,
                },
                {
                    type: "code",
                    value: `let blocked = false;

if (!blocked) {
  console.log("Access granted");
} else {
  console.log("Access denied");
}

// output: Access granted

// !blocked inverts the value of blocked. Since blocked is false,
// !blocked becomes true, and the if block runs.`,
                },
                {
                    type: "table",
                    value: `[["condition1","condition2","condition1 && condition2","condition1 || condition2"],["true","true","true","true"],["true","false","false","true"],["false","true","false","true"],["false","false","false","false"]]`,
                },
                {
                    type: "quote",
                    value: `Use && when all the conditions need to be true, || when one is enough, and ! to invert a condition. Combining these operators makes the if ready for more complete decisions.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Compound conditions: and, or, not

Many decisions depend on more than one thing at the same time. To enter a party, you usually need to be old enough **and** to have the ticket, both things together. A half-price discount, in turn, usually applies to someone who is a student **or** a senior, either one of the two conditions is enough.

You already met these logical operators in module 2:

- \`and\` (and): the result is only \`True\` when both conditions are \`True\`.
- \`or\` (or): the result is \`True\` when at least one of the conditions is \`True\`.
- \`not\` (not): inverts a boolean value, turns \`True\` into \`False\` and vice versa.

Now we will use all three inside \`if\` conditions, to make more complete decisions. A classic example that calls for \`and\`: finding which of three numbers is the largest. A number is only the largest when it is greater than or equal to the other two at the same time.`,
                },
                {
                    type: "code",
                    value: `a = 4
b = 15
c = 9

if a >= b and a >= c:
    print(f"{a} is the largest")
elif b >= a and b >= c:
    print(f"{b} is the largest")
else:
    print(f"{c} is the largest")

# output: 15 is the largest`,
                },
                {
                    type: "code",
                    value: `student = False
senior = True

if student or senior:
    print("Qualifies for the half-price ticket")
else:
    print("Pays full price")

# output: Qualifies for the half-price ticket`,
                },
                {
                    type: "text",
                    value: `Notice the difference between the two operators. In the three-numbers example, \`a\` is only the largest when \`a >= b\` and \`a >= c\` at the same time: if either of those two comparisons is \`False\`, the whole \`and\` becomes \`False\` and that \`if\` (or \`elif\`) does not run. In the discount example, on the other hand, it is enough for one of the two conditions (\`student\` or \`senior\`) to be \`True\` for the \`or\` to be \`True\`.

The third operator, \`not\`, inverts a condition. It is useful when you want to test "when it is NOT the case".`,
                },
                {
                    type: "code",
                    value: `blocked = False

if not blocked:
    print("Access granted")
else:
    print("Access denied")

# output: Access granted

# not blocked inverts the value of blocked. Since blocked is False,
# not blocked becomes True, and the if block runs.`,
                },
                {
                    type: "table",
                    value: `[["condition1","condition2","condition1 and condition2","condition1 or condition2"],["True","True","True","True"],["True","False","False","True"],["False","True","False","True"],["False","False","False","False"]]`,
                },
                {
                    type: "quote",
                    value: `Use and when all the conditions need to be true, or when one is enough, and not to invert a condition. Combining these operators makes the if ready for more complete decisions.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet a = 4;\nlet b = 4;\nlet c = 9;\n\nif (a >= b && a >= c) {\n  console.log(a + " is the largest");\n} else if (b >= a && b >= c) {\n  console.log(b + " is the largest");\n} else {\n  console.log(c + " is the largest");\n}\n```',
                    py: 'What is the output?\n\n```python\na = 4\nb = 4\nc = 9\n\nif a >= b and a >= c:\n    print(f"{a} is the largest")\nelif b >= a and b >= c:\n    print(f"{b} is the largest")\nelse:\n    print(f"{c} is the largest")\n```',
                },
                ops: {
                    js: {
                        "4 é o maior": "4 is the largest",
                        "O código dá erro porque a e b são iguais": "The code errors out because a and b are equal",
                        "Nenhuma mensagem aparece": "No message appears",
                        "9 é o maior": "9 is the largest",
                    },
                    py: {
                        "4 é o maior": "4 is the largest",
                        "9 é o maior": "9 is the largest",
                        "Nenhuma mensagem aparece": "No message appears",
                        "O código dá erro porque a e b são iguais": "The code errors out because a and b are equal",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet student = false;\nlet senior = false;\n\nif (student || senior) {\n  console.log("Qualifies for the half-price ticket");\n} else {\n  console.log("Pays full price");\n}\n```',
                    py: 'What is the output?\n\n```python\nstudent = False\nsenior = False\n\nif student or senior:\n    print("Qualifies for the half-price ticket")\nelse:\n    print("Pays full price")\n```',
                },
                ops: {
                    js: {
                        "Paga o valor cheio": "Pays full price",
                        "Nenhuma mensagem aparece": "No message appears",
                        "Tem direito a meia-entrada": "Qualifies for the half-price ticket",
                        "As duas mensagens aparecem": "Both messages appear",
                    },
                    py: {
                        "Tem direito a meia-entrada": "Qualifies for the half-price ticket",
                        "Nenhuma mensagem aparece": "No message appears",
                        "As duas mensagens aparecem": "Both messages appear",
                        "Paga o valor cheio": "Pays full price",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet blocked = true;\n\nif (!blocked) {\n  console.log("Access granted");\n} else {\n  console.log("Access denied");\n}\n```',
                    py: 'What is the output?\n\n```python\nblocked = True\n\nif not blocked:\n    print("Access granted")\nelse:\n    print("Access denied")\n```',
                },
                ops: {
                    js: { "Acesso negado": "Access denied", true: I("true"), "Acesso liberado": "Access granted", false: I("false") },
                    py: { False: I("False"), "Acesso liberado": "Access granted", "Acesso negado": "Access denied", True: I("True") },
                },
            },
            {
                enunciado: {
                    js: "Which condition is true only when age represents a teenager, that is, between 13 and 17 years old, including both ends?",
                    py: "Which condition is true only when age represents a teenager, that is, between 13 and 17 years old, including both ends?",
                },
                ops: {
                    js: {
                        "idade >= 13 && idade <= 17": "age >= 13 && age <= 17",
                        "idade > 13 && idade < 17": "age > 13 && age < 17",
                        "idade >= 13 || idade <= 17": "age >= 13 || age <= 17",
                        "idade >= 13 && idade < 13": "age >= 13 && age < 13",
                    },
                    py: {
                        "idade > 13 and idade < 17": "age > 13 and age < 17",
                        "idade >= 13 and idade <= 12": "age >= 13 and age <= 12",
                        "idade >= 13 and idade <= 17": "age >= 13 and age <= 17",
                        "idade >= 13 or idade <= 17": "age >= 13 or age <= 17",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet age = 16;\nlet withGuardian = true;\n\nif (age >= 18 || (age >= 12 && withGuardian)) {\n  console.log("Can watch the movie");\n} else {\n  console.log("Cannot watch");\n}\n```',
                    py: 'What is the output?\n\n```python\nage = 16\nwith_guardian = True\n\nif age >= 18 or (age >= 12 and with_guardian):\n    print("Can watch the movie")\nelse:\n    print("Cannot watch")\n```',
                },
                ops: {
                    js: {
                        "Pode assistir o filme": "Can watch the movie",
                        "Não pode assistir": "Cannot watch",
                        "Erro de sintaxe por causa dos parênteses": "A syntax error because of the parentheses",
                        "Não dá para saber sem rodar o código várias vezes":
                            "You cannot tell without running the code several times",
                    },
                    py: {
                        "Não pode assistir": "Cannot watch",
                        "Não dá para saber sem rodar o código várias vezes":
                            "You cannot tell without running the code several times",
                        "Erro de sintaxe por causa dos parênteses na condição":
                            "A syntax error because of the parentheses in the condition",
                        "Pode assistir o filme": "Can watch the movie",
                    },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: {
            js: "switch: choosing among many cases",
            py: "Many cases: elif chains (and match/case)",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## switch: choosing among many cases

Think about turning the day of the week number (1 to 7) into the day name. Or choosing a different message for each menu option. In those cases, you always compare the same variable against several exact values, one by one. A chain of \`else if\` works, but it gets repetitive when there are many cases.`,
                },
                {
                    type: "code",
                    value: `let day = 3;

if (day === 1) {
  console.log("Sunday");
} else if (day === 2) {
  console.log("Monday");
} else if (day === 3) {
  console.log("Tuesday");
} else if (day === 4) {
  console.log("Wednesday");
} else if (day === 5) {
  console.log("Thursday");
} else if (day === 6) {
  console.log("Friday");
} else if (day === 7) {
  console.log("Saturday");
} else {
  console.log("Invalid day");
}

// output: Tuesday`,
                },
                {
                    type: "code",
                    value: `let day = 3;

switch (day) {
  case 1:
    console.log("Sunday");
    break;
  case 2:
    console.log("Monday");
    break;
  case 3:
    console.log("Tuesday");
    break;
  case 4:
    console.log("Wednesday");
    break;
  case 5:
    console.log("Thursday");
    break;
  case 6:
    console.log("Friday");
    break;
  case 7:
    console.log("Saturday");
    break;
  default:
    console.log("Invalid day");
}

// output: Tuesday`,
                },
                {
                    type: "text",
                    value: `The two codes above do exactly the same thing, but notice how the \`switch\` keeps it tidier when there are many exact values to compare. See the pieces:

- \`switch (day)\`: the value that will be compared, once, with each \`case\`.
- \`case 3:\` means "if day equals 3". When it matches, JavaScript runs the lines from there down.
- \`break\`: ends the \`switch\` right there, without entering the next \`case\` statements. Without it, the code keeps running the following cases, even when they no longer match, which is almost never what you want.
- \`default\`: runs when no \`case\` matched; it is the equivalent of \`else\` in the \`switch\`.`,
                },
                {
                    type: "code",
                    value: `let day = 2;

switch (day) {
  case 1:
    console.log("Sunday");
  case 2:
    console.log("Monday");
  case 3:
    console.log("Tuesday");
  default:
    console.log("Invalid day");
}

// output:
// Monday
// Tuesday
// Invalid day

// The break was missing in each case. The switch found case 2, ran that
// line and, since there is no break, kept running ALL the following
// cases, even without matching. This is called "fall-through" and it is
// almost always a bug. Rule of thumb: every case ends with break.`,
                },
                {
                    type: "text",
                    value: `## When to use switch and when to use else if

Use \`switch\` when you compare the same variable against several exact values, like a day number, a menu option or a fixed category. Use \`else if\` when the conditions involve ranges (\`grade >= 7\`), different comparisons in each check, or logical operators (\`&&\`, \`||\`). The \`switch\` only compares equality (similar to \`===\`); it does not replace an \`else if\` with richer conditions.`,
                },
                {
                    type: "quote",
                    value: `The switch compares a single value against several possible cases. Every case should end with break, so it does not fall into the following cases, and default covers the rest. For ranges and compound conditions, else if remains the right tool.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Many cases: comparing one value with several

Think about turning the day of the week number (1 to 7) into the day name. Or choosing a different message for each menu option. In those cases, you always compare the same variable against several exact values, one by one.

Many languages have a structure called \`switch\` just for that. Python does not have \`switch\`, and does not need it: a chain of \`elif\` already does the job. And, since version 3.10, Python gained \`match\`/\`case\`, a modern and organized way of writing that same comparison when there are many cases.`,
                },
                {
                    type: "code",
                    value: `day = 3

if day == 1:
    print("Sunday")
elif day == 2:
    print("Monday")
elif day == 3:
    print("Tuesday")
elif day == 4:
    print("Wednesday")
elif day == 5:
    print("Thursday")
elif day == 6:
    print("Friday")
elif day == 7:
    print("Saturday")
else:
    print("Invalid day")

# output: Tuesday`,
                },
                {
                    type: "code",
                    value: `day = 3

match day:
    case 1:
        print("Sunday")
    case 2:
        print("Monday")
    case 3:
        print("Tuesday")
    case 4:
        print("Wednesday")
    case 5:
        print("Thursday")
    case 6:
        print("Friday")
    case 7:
        print("Saturday")
    case _:
        print("Invalid day")

# output: Tuesday`,
                },
                {
                    type: "text",
                    value: `The two codes above do exactly the same thing, but notice how the \`match\`/\`case\` keeps it tidier when there are many exact values to compare. See the pieces:

- \`match day:\`: the value that will be compared, once, with each \`case\`.
- \`case 3:\` means "if day equals 3". When it matches, Python runs the indented block right below.
- \`case _:\`: the \`_\` (underscore) is a wildcard that matches anything. It runs when no previous \`case\` matched, working like the \`else\`.

A detail that usually surprises people coming from other languages: in Python's \`match\`/\`case\`, **only the first \`case\` that matches is executed**, and the \`match\` ends right there. There is no "falling through" to the next cases, so you do not need (and cannot use) a \`break\` command at the end of each \`case\`.`,
                },
                {
                    type: "code",
                    value: `day = 9

match day:
    case 1:
        print("Sunday")
    case 2:
        print("Monday")
    case 3:
        print("Tuesday")

# output:
# (nothing is printed)

# day is 9 and no case matches. Unlike the switch of other languages,
# Python's match/case does not "fall through" to the following cases:
# either one case matches alone, or none runs. Notice there is no error;
# the match simply ends without printing anything. To handle "any other
# value", add a case _ (wildcard) at the end, the equivalent of else.`,
                },
                {
                    type: "text",
                    value: `## When to use elif and when to use match/case

Use \`match\`/\`case\` when you compare the same variable against several exact values, like a day number, a menu option or a fixed category, and you are running Python 3.10 or newer. Use \`elif\` when the conditions involve ranges (\`grade >= 7\`), different comparisons in each check, or logical operators (\`and\`, \`or\`), and also when you need compatibility with older Python versions.

In practice, every \`match\`/\`case\` of exact values can be rewritten as a chain of \`elif\`. The \`match\`/\`case\` only makes the code cleaner when there are many cases; it does not replace an \`elif\` full of ranges and compound conditions.`,
                },
                {
                    type: "quote",
                    value: `The match/case compares a single value against several possible cases, and case _ covers the rest. In Python only the first case that matches runs, without falling through to the next ones, so there is no break. For ranges and compound conditions, elif remains the right tool.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet day = 5;\n\nswitch (day) {\n  case 1:\n    console.log("Sunday");\n    break;\n  case 5:\n    console.log("Thursday");\n    break;\n  default:\n    console.log("Invalid day");\n}\n```',
                    py: 'What is the output?\n\n```python\nday = 5\n\nmatch day:\n    case 1:\n        print("Sunday")\n    case 5:\n        print("Thursday")\n    case _:\n        print("Invalid day")\n```',
                },
                ops: {
                    js: {
                        Domingo: "Sunday",
                        "Quinta-feira e depois Dia inválido": "Thursday and then Invalid day",
                        "Dia inválido": "Invalid day",
                        "Quinta-feira": "Thursday",
                    },
                    py: {
                        "Dia inválido": "Invalid day",
                        Domingo: "Sunday",
                        "Quinta-feira": "Thursday",
                        "Quinta-feira e depois Dia inválido": "Thursday and then Invalid day",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet choice = 9;\n\nswitch (choice) {\n  case 1:\n    console.log("Create account");\n    break;\n  case 2:\n    console.log("Sign in");\n    break;\n  default:\n    console.log("Invalid option");\n}\n```',
                    py: 'What is the output?\n\n```python\nchoice = 9\n\nmatch choice:\n    case 1:\n        print("Create account")\n    case 2:\n        print("Sign in")\n    case _:\n        print("Invalid option")\n```',
                },
                ops: {
                    js: {
                        "Nenhuma mensagem aparece": "No message appears",
                        Entrar: "Sign in",
                        "Criar conta": "Create account",
                        "Opção inválida": "Invalid option",
                    },
                    py: {
                        Entrar: "Sign in",
                        "Criar conta": "Create account",
                        "Nenhuma mensagem aparece": "No message appears",
                        "Opção inválida": "Invalid option",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet number = 2;\n\nswitch (number) {\n  case 1:\n    console.log("one");\n  case 2:\n    console.log("two");\n  case 3:\n    console.log("three");\n  default:\n    console.log("other");\n}\n```',
                    py: 'What is the output?\n\n```python\nnumber = 2\n\nmatch number:\n    case 1:\n        print("one")\n    case 2:\n        print("two")\n    case 3:\n        print("three")\n    case _:\n        print("other")\n```',
                },
                ops: {
                    js: {
                        "Apenas dois, porque numero é 2": "Only two, because number is 2",
                        "Apenas outro, porque numero não é 1 nem 3": "Only other, because number is neither 1 nor 3",
                        "dois, três e outro, nessa ordem, porque faltam os break":
                            "two, three and other, in that order, because the breaks are missing",
                        "Erro de execução, porque o switch não tem nenhum break":
                            "A runtime error, because the switch has no break at all",
                    },
                    py: {
                        "dois, três e outro, nessa ordem": "two, three and other, in that order",
                        "Apenas dois": "Only two",
                        "Apenas outro, porque é o caso coringa": "Only other, because it is the wildcard case",
                        "Erro, porque falta o comando break em cada case":
                            "An error, because the break command is missing in each case",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which situation is more suitable for using switch instead of else if?",
                    py: "Which situation is more suitable for using match/case instead of elif?",
                },
                ops: {
                    js: {
                        "Comparar uma variável com vários valores exatos, como o mês":
                            "Comparing a variable against several exact values, like the month",
                        "Combinar duas condições diferentes usando && ao mesmo tempo":
                            "Combining two different conditions using && at the same time",
                        "Verificar se um número está dentro de uma faixa ampla, como nota >= 7":
                            "Checking whether a number is inside a wide range, like grade >= 7",
                        "Verificar se uma variável é diferente de outra usando !==":
                            "Checking whether a variable is different from another using !==",
                    },
                    py: {
                        "Verificar se um número está dentro de uma faixa ampla, como nota >= 7":
                            "Checking whether a number is inside a wide range, like grade >= 7",
                        "Combinar duas condições diferentes usando and ao mesmo tempo":
                            "Combining two different conditions using and at the same time",
                        "Comparar uma variável com vários valores exatos, como o mês":
                            "Comparing a variable against several exact values, like the month",
                        "Verificar se uma variável é diferente de outra usando !=":
                            "Checking whether a variable is different from another using !=",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output?\n\n```javascript\nlet letter = "a";\n\nswitch (letter) {\n  case "a":\n    console.log("First");\n  case "b":\n    console.log("Second");\n    break;\n  case "c":\n    console.log("Third");\n    break;\n  default:\n    console.log("Another");\n}\n```',
                    py: 'What is the output?\n\n```python\nletter = "x"\n\nmatch letter:\n    case "a":\n        print("First")\n    case "b":\n        print("Second")\n    case "c":\n        print("Third")\n```',
                },
                ops: {
                    js: {
                        "Apenas Segunda, pois letra não é igual a nenhum outro case":
                            "Only Second, because letter does not equal any other case",
                        "Apenas Primeira, pois o switch para assim que encontra o case certo":
                            "Only First, because the switch stops as soon as it finds the right case",
                        'Primeira e Segunda, pois falta break no case "a" e o de "b" para ali':
                            'First and Second, because the break is missing in case "a" and the one in "b" stops there',
                        "Primeira, Segunda e Terceira, pois nenhum break interrompe nada":
                            "First, Second and Third, because no break interrupts anything",
                    },
                    py: {
                        "Terceira, porque é sempre o último case que vale":
                            "Third, because it is always the last case that counts",
                        "Erro de execução, pois nenhum dos três case corresponde à letra x":
                            "A runtime error, because none of the three cases matches the letter x",
                        "Primeira, Segunda e Terceira, um após o outro":
                            "First, Second and Third, one after the other",
                        "Nada é impresso: nenhum case bate e não há um case _ coringa":
                            "Nothing is printed: no case matches and there is no case _ wildcard",
                    },
                },
            },
        ],
    },
];
