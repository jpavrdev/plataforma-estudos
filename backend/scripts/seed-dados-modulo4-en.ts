// Tradução em inglês do módulo 4 da Lógica de Programação (repetição e
// laços). A aula 3 diverge de verdade (for com três cláusulas x for com
// range, com a questão do fim não incluído); as demais compartilham a prosa
// com o código de cada linguagem.

import type { AulaModulo2 } from "./seed-dados-modulo2-en.ts";

const I = (v: string) => v;

export const TITULO_MODULO_4 = "Module 4 - Repetition: loops";

export const AULAS_MODULO_4: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: { js: "Why repeat: the idea of a loop", py: "Why repeat: the idea of a loop" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Why repeat: the idea of a loop

So far you learned to store values in variables (module 2) and to make the program choose paths with \`if\` (module 3). Now comes a very common question in a programmer's daily life: what if I need to do the same thing several times in a row?

Think about showing the numbers 1 to 5 in the console. You already know how to do that:`,
                },
                {
                    type: "code",
                    value: `// Imagine you need to show the numbers 1 to 5 in the console.
console.log(1);
console.log(2);
console.log(3);
console.log(4);
console.log(5);

// It works! But what if it were 100 numbers? Or 1000?
// Copying and pasting this line hundreds of times is not programming, it is suffering.`,
                },
                {
                    type: "text",
                    value: `It worked. Now imagine the request were to show the numbers 1 to 100. Or 1 to 10,000. Copying and pasting \`console.log\` hundreds of times is not programming, it is manual labor, and risky on top of that: a typo in one of the lines and nobody notices.

Programming has a tool ready for this: the **loop**. A loop repeats a piece of code as many times as needed, without you writing the same line again.`,
                },
                {
                    type: "text",
                    value: `## The recipe of a loop

Think about a very simple situation: drinking a glass of water, one sip at a time, until it is empty. That idea has three parts:

- **A starting point**: the glass starts full.
- **A condition that says when to stop**: "while there is still water in the glass".
- **Something that changes on each repetition**: with each sip, a little water leaves, until the condition stops being true.

Every loop you will learn (\`while\` and \`for\`) follows this same recipe: repeat a block of code while a condition is true, changing something on each pass until the condition becomes false.`,
                },
                {
                    type: "code",
                    value: `// The same idea (showing numbers in sequence), now using a loop:
for (let i = 1; i <= 100; i++) {
  console.log(i);
}
// Three lines show the numbers 1 to 100. If it were 10,000, the code
// would stay the same size: only the 100 up there would change.
// The next lessons explain each piece of this recipe: while and for.`,
                },
                {
                    type: "text",
                    value: `Whenever you notice that you will "do the same thing several times" inside a problem, that is a sign a loop will help: showing a sequence of numbers, repeating a question until the user answers right, processing a list item by item (you will see that calmly in module 6). In the next lessons you learn the two ways of writing a loop in JavaScript: \`while\` and \`for\`.`,
                },
                {
                    type: "quote",
                    value: `A loop is the recipe repeat while true. You write the instruction once; the computer takes care of repeating it as much as needed.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Why repeat: the idea of a loop

So far you learned to store values in variables (module 2) and to make the program choose paths with \`if\` (module 3). Now comes a very common question in a programmer's daily life: what if I need to do the same thing several times in a row?

Think about showing the numbers 1 to 5 in the console. You already know how to do that:`,
                },
                {
                    type: "code",
                    value: `# Imagine you need to show the numbers 1 to 5 in the console.
print(1)
print(2)
print(3)
print(4)
print(5)

# It works! But what if it were 100 numbers? Or 1000?
# Copying and pasting this line hundreds of times is not programming, it is suffering.`,
                },
                {
                    type: "text",
                    value: `It worked. Now imagine the request were to show the numbers 1 to 100. Or 1 to 10,000. Copying and pasting \`print\` hundreds of times is not programming, it is manual labor, and risky on top of that: a typo in one of the lines and nobody notices.

Programming has a tool ready for this: the **loop**. A loop repeats a piece of code as many times as needed, without you writing the same line again.`,
                },
                {
                    type: "text",
                    value: `## The recipe of a loop

Think about a very simple situation: drinking a glass of water, one sip at a time, until it is empty. That idea has three parts:

- **A starting point**: the glass starts full.
- **A condition that says when to stop**: "while there is still water in the glass".
- **Something that changes on each repetition**: with each sip, a little water leaves, until the condition stops being true.

Every loop you will learn (\`while\` and \`for\`) follows this same recipe: repeat a block of code while a condition is true, changing something on each pass until the condition becomes false.`,
                },
                {
                    type: "code",
                    value: `# The same idea (showing numbers in sequence), now using a loop:
for i in range(1, 101):
    print(i)
# Two lines show the numbers 1 to 100. If it were 10,000, the code
# would stay the same size: only the number up there would change.
# (range goes UP TO the second number without including it; the next
# lessons explain each piece of this recipe calmly: while and for.)`,
                },
                {
                    type: "text",
                    value: `Whenever you notice that you will "do the same thing several times" inside a problem, that is a sign a loop will help: showing a sequence of numbers, repeating a question until the user answers right, processing a list item by item (you will see that calmly in module 6). In the next lessons you learn the two ways of writing a loop in Python: \`while\` and \`for\`.`,
                },
                {
                    type: "quote",
                    value: `A loop is the recipe repeat while true. You write the instruction once; the computer takes care of repeating it as much as needed.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "Which of these everyday situations is most similar to the idea of a loop in programming?",
                    py: "Which of these everyday situations is most similar to the idea of a loop in programming?",
                },
                ops: {
                    js: {
                        "Comparar a idade de duas pessoas para saber quem é mais velho":
                            "Comparing the ages of two people to find out who is older",
                        "Passar o aspirador em cada cômodo da casa, um de cada vez":
                            "Vacuuming every room of the house, one at a time",
                        "Escolher entre pizza ou hambúrguer no jantar":
                            "Choosing between pizza or a burger for dinner",
                        "Guardar o número de telefone de um amigo numa agenda":
                            "Saving a friend's phone number in an address book",
                    },
                    py: {
                        "Passar o aspirador em cada cômodo da casa, um de cada vez":
                            "Vacuuming every room of the house, one at a time",
                        "Escolher entre pizza ou hambúrguer no jantar":
                            "Choosing between pizza or a burger for dinner",
                        "Guardar o número de telefone de um amigo numa agenda":
                            "Saving a friend's phone number in an address book",
                        "Comparar a idade de duas pessoas para saber quem é mais velho":
                            "Comparing the ages of two people to find out who is older",
                    },
                },
            },
            {
                enunciado: {
                    js: "Why is writing console.log one hundred times in a row to show the numbers 1 to 100 a bad practice?",
                    py: "Why is writing print one hundred times in a row to show the numbers 1 to 100 a bad practice?",
                },
                ops: {
                    js: {
                        "Porque dá muito trabalho escrever, é fácil errar e difícil de mudar depois":
                            "Because it is a lot of work to write, easy to get wrong and hard to change later",
                        "Porque o JavaScript não permite mais que 10 linhas de código repetidas":
                            "Because JavaScript does not allow more than 10 repeated lines of code",
                        "Porque números maiores que 10 não podem ser exibidos no console":
                            "Because numbers greater than 10 cannot be shown in the console",
                        "Porque console.log só pode ser usado uma vez em cada programa":
                            "Because console.log can only be used once in each program",
                    },
                    py: {
                        "Porque dá trabalho, é fácil errar e fica difícil de mudar depois":
                            "Because it is a lot of work, easy to get wrong and hard to change later",
                        "Porque o Python não permite mais que 10 linhas de código repetidas":
                            "Because Python does not allow more than 10 repeated lines of code",
                        "Porque números maiores que 10 não podem ser exibidos no console":
                            "Because numbers greater than 10 cannot be shown in the console",
                        "Porque a função print só pode ser usada uma vez em cada programa":
                            "Because the print function can only be used once in each program",
                    },
                },
            },
            {
                enunciado: {
                    js: "Think about the idea 'drink a sip of water until the glass is empty', used to explain a loop. In that comparison, what represents the part that changes on each repetition, bringing the end closer?",
                    py: "Think about the idea 'drink a sip of water until the glass is empty', used to explain a loop. In that comparison, what represents the part that changes on each repetition, bringing the end closer?",
                },
                ops: {
                    js: {
                        "A vontade de beber água": "The desire to drink water",
                        "O formato do copo": "The shape of the glass",
                        "A água que ainda resta dentro do copo": "The water still left inside the glass",
                        "O número de pessoas que estão na sala": "The number of people in the room",
                    },
                    py: {
                        "O número de pessoas que estão na sala": "The number of people in the room",
                        "A água que ainda resta dentro do copo": "The water still left inside the glass",
                        "O formato do copo": "The shape of the glass",
                        "A vontade de beber água": "The desire to drink water",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfor (let i = 1; i <= 100; i++) {\n  console.log(i);\n}\n```\n\nHow many numbers does this code show in the console?",
                    py: "Considering the code below:\n\n```python\nfor i in range(1, 101):\n    print(i)\n```\n\nHow many numbers does this code show in the console?",
                },
                ops: {
                    js: {
                        "99": I("99"),
                        "Depende do computador que executa o código": "It depends on the computer running the code",
                        "101": I("101"),
                        "100": I("100"),
                    },
                    py: {
                        "101": I("101"),
                        "99": I("99"),
                        "Depende do computador que executa o código": "It depends on the computer running the code",
                        "100": I("100"),
                    },
                },
            },
            {
                enunciado: {
                    js: "Which of the alternatives below correctly describes what a loop is for in programming?",
                    py: "Which of the alternatives below correctly describes what a loop is for in programming?",
                },
                ops: {
                    js: {
                        "Fazer o programa escolher entre dois caminhos diferentes, dependendo de uma condição":
                            "Making the program choose between two different paths, depending on a condition",
                        "Executar um conjunto de instruções várias vezes, sem copiar e colar o código":
                            "Running a set of instructions several times, without copying and pasting the code",
                        "Guardar vários valores dentro de uma única variável":
                            "Storing several values inside a single variable",
                        "Impedir que o programa tenha erros de digitação":
                            "Preventing the program from having typos",
                    },
                    py: {
                        "Fazer o programa escolher entre dois caminhos, dependendo de uma condição":
                            "Making the program choose between two paths, depending on a condition",
                        "Executar várias vezes um conjunto de instruções, sem copiar e colar":
                            "Running a set of instructions several times, without copying and pasting",
                        "Guardar vários valores diferentes dentro de uma única variável":
                            "Storing several different values inside a single variable",
                        "Impedir que o programa tenha erros de digitação":
                            "Preventing the program from having typos",
                    },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: {
            js: "while: repeating while it is true (and the infinite loop)",
            py: "while: repeating while it is true (and the infinite loop)",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## The first way to repeat: while

The first way to repeat code in JavaScript is \`while\`. The idea is direct: **while a condition is true, repeat the block of code**. As soon as the condition becomes false, the loop stops.

The structure resembles the \`if\` you already know, except that instead of running once, the \`while\` tests the condition again after each repetition:`,
                },
                {
                    type: "code",
                    value: `let i = 1; // control variable, starts at 1

while (i <= 5) { // repeats WHILE i is less than or equal to 5
  console.log(i);
  i = i + 1; // without this, i would never change: infinite loop!
}

console.log("Done! i is now", i);
// output:
// 1
// 2
// 3
// 4
// 5
// Done! i is now 6`,
                },
                {
                    type: "text",
                    value: `## The danger of the infinite loop

Notice two things in the code above: the variable \`i\` is created **before** the \`while\`, and it changes **inside** the loop (\`i = i + 1\`). That is not optional. If the variable used in the condition never changes, the condition will never become false, and the loop repeats forever. That is called an **infinite loop**, and it freezes the program (in the browser, the page locks up; in the terminal, the program never ends).

See an example of what **not** to do:`,
                },
                {
                    type: "code",
                    value: `// CAREFUL: infinite loop example. Do not really run this!
let counter = 1;

while (counter <= 5) {
  console.log(counter);
  // they forgot to change "counter" in here...
  // the condition "counter <= 5" will never become false.
  // the program freezes, repeating forever.
}`,
                },
                {
                    type: "text",
                    value: `In that example, \`counter\` starts at 1 and the condition is \`counter <= 5\`, but nothing inside the loop changes the value of \`counter\`. The condition will be true forever.

Before running any \`while\`, it is worth checking three points:

- The control variable exists **before** the \`while\`.
- The condition depends on that variable.
- Some line **inside** the loop changes that variable, bringing the end closer.

If your program "freezes" when testing a loop, suspect an infinite loop and review those three points.`,
                },
                {
                    type: "table",
                    value: `[["Pass","i at the start","i <= 5 ?","What happens"],["1","1","true","prints 1; then i becomes 2"],["2","2","true","prints 2; then i becomes 3"],["3","3","true","prints 3; then i becomes 4"],["4","4","true","prints 4; then i becomes 5"],["5","5","true","prints 5; then i becomes 6"],["6","6","false","the loop stops; nothing is printed"]]`,
                },
                {
                    type: "quote",
                    value: `while repeats as long as the condition is true. Every variable used in the condition must change inside the loop, otherwise the condition never becomes false and the loop never stops.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## The first way to repeat: while

The first way to repeat code in Python is \`while\`. The idea is direct: **while a condition is true, repeat the block of code**. As soon as the condition becomes false, the loop stops.

The structure resembles the \`if\` you already know, except that instead of running once, the \`while\` tests the condition again after each repetition. Notice the colon at the end of the line and the indentation of the block, just like \`if\`:`,
                },
                {
                    type: "code",
                    value: `i = 1  # control variable, starts at 1

while i <= 5:  # repeats WHILE i is less than or equal to 5
    print(i)
    i = i + 1  # without this, i would never change: infinite loop!

print("Done! i is now", i)
# output:
# 1
# 2
# 3
# 4
# 5
# Done! i is now 6`,
                },
                {
                    type: "text",
                    value: `## The danger of the infinite loop

Notice two things in the code above: the variable \`i\` is created **before** the \`while\`, and it changes **inside** the loop (\`i = i + 1\`). That is not optional. If the variable used in the condition never changes, the condition will never become false, and the loop repeats forever. That is called an **infinite loop**, and it freezes the program (in the terminal, it never ends and you need to interrupt it by force, usually with Ctrl+C).

See an example of what **not** to do:`,
                },
                {
                    type: "code",
                    value: `# CAREFUL: infinite loop example. Do not really run this!
counter = 1

while counter <= 5:
    print(counter)
    # they forgot to change "counter" in here...
    # the condition "counter <= 5" will never become false.
    # the program freezes, repeating forever.`,
                },
                {
                    type: "text",
                    value: `In that example, \`counter\` starts at 1 and the condition is \`counter <= 5\`, but nothing inside the loop changes the value of \`counter\`. The condition will be true forever.

Before running any \`while\`, it is worth checking three points:

- The control variable exists **before** the \`while\`.
- The condition depends on that variable.
- Some line **inside** the loop changes that variable, bringing the end closer.

If your program "freezes" when testing a loop, suspect an infinite loop and review those three points. (There is one case where the infinite loop is intentional: writing \`while True:\` and leaving it with \`break\` at the right moment, a command you will meet in the last lesson.)`,
                },
                {
                    type: "table",
                    value: `[["Pass","i at the start","i <= 5 ?","What happens"],["1","1","true","prints 1; then i becomes 2"],["2","2","true","prints 2; then i becomes 3"],["3","3","true","prints 3; then i becomes 4"],["4","4","true","prints 4; then i becomes 5"],["5","5","true","prints 5; then i becomes 6"],["6","6","false","the loop stops; nothing is printed"]]`,
                },
                {
                    type: "quote",
                    value: `while repeats as long as the condition is true. Every variable used in the condition must change inside the loop, otherwise the condition never becomes false and the loop never stops.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What does the while command do in a JavaScript program?",
                    py: "What does the while command do in a Python program?",
                },
                ops: {
                    js: {
                        "Repete um bloco enquanto a condição continuar verdadeira":
                            "Repeats a block as long as the condition stays true",
                        "Executa um bloco de código apenas uma única vez":
                            "Runs a block of code only a single time",
                        "Escolhe entre dois caminhos possíveis, igual o comando if":
                            "Chooses between two possible paths, like the if command",
                        "Encerra o programa imediatamente, sem terminar o resto":
                            "Ends the program immediately, without finishing the rest",
                    },
                    py: {
                        "Escolhe entre dois caminhos possíveis, igual o comando if":
                            "Chooses between two possible paths, like the if command",
                        "Encerra o programa imediatamente, sem terminar o resto":
                            "Ends the program immediately, without finishing the rest",
                        "Executa um bloco de código apenas uma única vez":
                            "Runs a block of code only a single time",
                        "Repete um bloco enquanto a condição continuar verdadeira":
                            "Repeats a block as long as the condition stays true",
                    },
                },
            },
            {
                enunciado: {
                    js: "After creating the control variable of a while (like let i = 1) and writing the condition (i <= 5), what is still indispensable to do inside the loop so it does not freeze?",
                    py: "After creating the control variable of a while (like i = 1) and writing the condition (i <= 5), what is still indispensable to do inside the loop so it does not freeze?",
                },
                ops: {
                    js: {
                        "Declarar de novo a variável, com let, a cada nova volta":
                            "Declaring the variable again, with let, on every new pass",
                        "Alterar, a cada volta, o valor da variável da condição":
                            "Changing, on every pass, the value of the condition variable",
                        "Trocar a condição por uma igualdade, com ===":
                            "Replacing the condition with an equality, using ===",
                        "Usar console.log pelo menos duas vezes":
                            "Using console.log at least twice",
                    },
                    py: {
                        "Usar print pelo menos duas vezes": "Using print at least twice",
                        "Declarar a variável de novo, do zero, a cada nova volta":
                            "Declaring the variable again, from scratch, on every new pass",
                        "Alterar, a cada volta, o valor da variável da condição":
                            "Changing, on every pass, the value of the condition variable",
                        "Trocar a condição por uma igualdade, com ==":
                            "Replacing the condition with an equality, using ==",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nlet i = 0;\nwhile (i < 3) {\n  console.log('Hi');\n  i = i + 1;\n}\n```\n\nHow many times does the word 'Hi' appear in the console?",
                    py: "Considering the code below:\n\n```python\ni = 0\nwhile i < 3:\n    print('Hi')\n    i = i + 1\n```\n\nHow many times does the word 'Hi' appear in the console?",
                },
                ops: {
                    js: { "3": I("3"), "4": I("4"), "Infinitas vezes": "Infinitely many times", "2": I("2") },
                    py: { "3": I("3"), "2": I("2"), "4": I("4"), "Infinitas vezes": "Infinitely many times" },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nlet n = 10;\nwhile (n > 0) {\n  console.log(n);\n}\n```\n\nWhat happens when this code runs?",
                    py: "Considering the code below:\n\n```python\nn = 10\nwhile n > 0:\n    print(n)\n```\n\nWhat happens when this code runs?",
                },
                ops: {
                    js: {
                        "Não mostra nada, porque a condição n > 0 já começa como falsa":
                            "It shows nothing, because the condition n > 0 already starts as false",
                        "Entra em loop infinito, pois n nunca muda dentro do laço":
                            "It enters an infinite loop, because n never changes inside the loop",
                        "Mostra os números de 10 até 1 e depois para sozinho":
                            "It shows the numbers from 10 down to 1 and then stops on its own",
                        "Dá um erro de sintaxe antes mesmo de rodar":
                            "It raises a syntax error before even running",
                    },
                    py: {
                        "Mostra os números de 10 até 1 e depois para sozinho":
                            "It shows the numbers from 10 down to 1 and then stops on its own",
                        "Dá um erro de sintaxe antes mesmo de rodar":
                            "It raises a syntax error before even running",
                        "Não mostra nada, porque a condição n > 0 já começa como falsa":
                            "It shows nothing, because the condition n > 0 already starts as false",
                        "Entra em loop infinito, pois n nunca muda dentro do laço":
                            "It enters an infinite loop, because n never changes inside the loop",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nlet i = 1;\nwhile (i <= 4) {\n  i = i + 1;\n}\nconsole.log(i);\n```\n\nWhich value appears in the console?",
                    py: "Considering the code below:\n\n```python\ni = 1\nwhile i <= 4:\n    i = i + 1\nprint(i)\n```\n\nWhich value appears in the console?",
                },
                ops: {
                    js: { "1": I("1"), "5": I("5"), "6": I("6"), "4": I("4") },
                    py: { "1": I("1"), "5": I("5"), "4": I("4"), "6": I("6") },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: { js: "for: the counted loop", py: "for: the counted loop" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## for: everything on a single line

\`while\` works well, but when you already know in advance how many times you want to repeat something, JavaScript offers a more compact form: the \`for\`. It joins on a single line the three pieces you saw in the last lesson: where to start, how far to go and how to step on each pass.

See the same example from the previous lesson, first the \`while\` way and then rewritten with \`for\`:`,
                },
                {
                    type: "code",
                    value: `// The while way (previous lesson)
let i = 1;
while (i <= 5) {
  console.log(i);
  i = i + 1;
}

// The same thing with for: start, condition and increment on a single line
for (let j = 1; j <= 5; j++) {
  console.log(j);
}

// the two versions print exactly the same thing: 1 2 3 4 5`,
                },
                {
                    type: "text",
                    value: `## The three parts of the for

\`for (let j = 1; j <= 5; j++)\` has exactly three parts, separated by semicolons:

- **Initialization** (\`let j = 1\`): runs a single time, before everything, creating the control variable.
- **Condition** (\`j <= 5\`): tested before each pass; when it is false, the loop stops.
- **Increment** (\`j++\`): runs at the end of each pass. \`j++\` is a shortcut for \`j = j + 1\`.

The three parts stay together, on the same line, which makes it very visible how the loop behaves from start to finish.`,
                },
                {
                    type: "text",
                    value: `When to use \`for\` instead of \`while\`? In practice, whenever you already know (or can compute) how many times you want to repeat, like walking an interval of numbers from one value to another. Since start, condition and increment stay together, it is harder to forget to change the control variable, which reduces the risk of the infinite loop seen in the previous lesson.

A very common pattern is walking an interval from 0 (or 1) up to a value \`n\`:`,
                },
                {
                    type: "code",
                    value: `// Walk an interval from 0 to n (here, n = 10)
let n = 10;
for (let i = 0; i <= n; i++) {
  console.log(i);
}
// output: 0 1 2 3 4 5 6 7 8 9 10 (eleven numbers, from 0 to 10)`,
                },
                {
                    type: "table",
                    value: `[["Pass","j at the start","j <= 5 ?","Prints","j after j++"],["1","1","true","1","2"],["2","2","true","2","3"],["3","3","true","3","4"],["4","4","true","4","5"],["5","5","true","5","6"],["6","6","false","(nothing, the loop stops)","-"]]`,
                },
                {
                    type: "quote",
                    value: `for joins on a single line what while needs three for: where to start, how far to go and how to step. When you know in advance how many times to repeat, for is usually the most natural choice.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## for: when you already know how many times

\`while\` works well, but when you already know in advance how many times you want to repeat something, Python offers a more direct form: the \`for\` with \`range\`. Instead of creating the control variable yourself, testing the condition and changing the value on each pass (the three tasks from the previous lesson), \`range\` takes care of that: it generates the sequence of numbers, and the \`for\` walks it one by one.

See the same example from the previous lesson, first the \`while\` way and then rewritten with \`for\`:`,
                },
                {
                    type: "code",
                    value: `# The while way (previous lesson)
i = 1
while i <= 5:
    print(i)
    i = i + 1

# The same thing with for and range: much shorter
for j in range(1, 6):
    print(j)

# the two versions print exactly the same thing: 1 2 3 4 5`,
                },
                {
                    type: "text",
                    value: `## How range works

\`range(1, 6)\` is the heart of that loop. It receives two numbers and generates the sequence the \`for\` will walk:

- **Start** (\`1\`): the first number of the sequence, where the loop begins.
- **End** (\`6\`): where the sequence stops, but with an important detail: the end is **not included**. \`range(1, 6)\` generates \`1, 2, 3, 4, 5\`, that is, it goes up to one less than the second number.

That is the point that confuses people the most at first: to walk from 1 to 5, you write \`range(1, 6)\`, not \`range(1, 5)\`. Keep that idea close to your heart, because it is the origin of many "one more or one less" errors (the famous *off-by-one*).`,
                },
                {
                    type: "text",
                    value: `When to use \`for\` instead of \`while\`? In practice, whenever you already know (or can compute) how many times you want to repeat, like walking an interval of numbers from one value to another. Since \`range\` takes care of the start, the end and the step on its own, you do not run the risk of forgetting to change the control variable, which avoids the infinite loop seen in the previous lesson.

Two shortcuts help a lot. If you start from zero, you can pass a single number: \`range(n)\` already means from 0 up to \`n - 1\`. And when you want to step by two (or any other size), there is a third number, the **step**: \`range(start, end, step)\`.`,
                },
                {
                    type: "code",
                    value: `# range(n) starts at 0 and goes up to n - 1 (here, n = 10)
n = 10
for i in range(n):
    print(i)
# output: 0 1 2 3 4 5 6 7 8 9 (ten numbers, from 0 to 9 -- the 10 is NOT included)

# With the step, you can go two by two:
for i in range(0, 11, 2):
    print(i)
# output: 0 2 4 6 8 10 (starts at 0, stops before 11, stepping by 2)`,
                },
                {
                    type: "table",
                    value: `[["Pass","j is","inside range(1, 6)?","Prints"],["1","1","yes","1"],["2","2","yes","2"],["3","3","yes","3"],["4","4","yes","4"],["5","5","yes","5"],["-","6","no (the end 6 is not included)","(nothing, the loop stops)"]]`,
                },
                {
                    type: "quote",
                    value: `The for with range walks a ready-made sequence of numbers: you say where it starts, where it stops (without including the end) and, if you want, the step size. When you already know how many times to repeat, for is usually the most natural choice.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What are the three parts that stay inside the parentheses of a for, and in which order?",
                    py: "In the loop for i in range(1, 6), what do the two numbers inside the range mean?",
                },
                ops: {
                    js: {
                        "Início; meio; fim, em qualquer ordem": "Start; middle; end, in any order",
                        "Inicialização; condição; incremento, nessa ordem":
                            "Initialization; condition; increment, in that order",
                        "Condição; incremento; inicialização, nessa ordem":
                            "Condition; increment; initialization, in that order",
                        "Variável; valor; operador, nessa ordem": "Variable; value; operator, in that order",
                    },
                    py: {
                        "1 é onde começa; 6 é onde para, sem incluir o 6":
                            "1 is where it starts; 6 is where it stops, without including 6",
                        "1 é o início e 6 é o fim, e nesse caso o 6 também entra":
                            "1 is the start and 6 is the end, and in this case 6 is included too",
                        "1 é a condição e 6 é o incremento do laço":
                            "1 is the condition and 6 is the increment of the loop",
                        "1 é o passo e 6 é a quantidade de voltas do laço":
                            "1 is the step and 6 is the number of passes of the loop",
                    },
                },
            },
            {
                enunciado: {
                    js: "What does j++ mean inside a for?",
                    py: "What does the loop for i in range(5) do?",
                },
                ops: {
                    js: {
                        "Divide o valor de j por 2": "Divides the value of j by 2",
                        "Zera o valor de j": "Zeroes the value of j",
                        "Soma 1 ao valor de j, igual a j = j + 1":
                            "Adds 1 to the value of j, the same as j = j + 1",
                        "Compara se j é maior do que outro número":
                            "Compares whether j is greater than another number",
                    },
                    py: {
                        "Repete 5 vezes, com i indo de 0 a 4": "Repeats 5 times, with i going from 0 to 4",
                        "Repete 6 vezes, com i indo de 0 a 5": "Repeats 6 times, with i going from 0 to 5",
                        "Repete 5 vezes, com i indo de 1 a 5": "Repeats 5 times, with i going from 1 to 5",
                        "Repete uma vez só, com i valendo 5": "Repeats only once, with i being 5",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below, with n being 10:\n\n```javascript\nfor (let i = 0; i <= n; i++) {\n  console.log(i);\n}\n```\n\nHow many times does this loop run?",
                    py: "Considering the code below, with n being 10:\n\n```python\nfor i in range(n):\n    print(i)\n```\n\nHow many times does this loop run?",
                },
                ops: {
                    js: { "11 vezes": "11 times", "12 vezes": "12 times", "10 vezes": "10 times", "9 vezes": "9 times" },
                    py: { "9 vezes": "9 times", "12 vezes": "12 times", "10 vezes": "10 times", "11 vezes": "11 times" },
                },
            },
            {
                enunciado: {
                    js: "Considering the following for:\n\n```javascript\nfor (let i = 1; i <= 5; i++) {\n  console.log(i);\n}\n```\n\nWith which value of i does the condition i <= 5 stop being true, making the loop stop?",
                    py: "Considering the following loop:\n\n```python\nfor i in range(1, 6):\n    print(i)\n```\n\nWhich is the last number to appear in the console?",
                },
                ops: {
                    js: {
                        "i valendo 5": "i being 5",
                        "i valendo 0": "i being 0",
                        "i valendo 4": "i being 4",
                        "i valendo 6": "i being 6",
                    },
                    py: { "1": I("1"), "5": I("5"), "6": I("6"), "4": I("4") },
                },
            },
            {
                enunciado: {
                    js: "You need to repeat an action exactly 20 times, always the same amount, known before the loop starts. Why is for usually more suitable than while in this case?",
                    py: "You need to repeat an action exactly 20 times, an amount already known before the loop starts. Why is the for with range usually more suitable than while in this case?",
                },
                ops: {
                    js: {
                        "Porque o for não precisa de nenhuma variável de controle declarada antes de começar":
                            "Because for does not need any control variable declared before it starts",
                        "Porque o for roda mais rápido que o while no computador":
                            "Because for runs faster than while on the computer",
                        "Porque o for junta início, condição e incremento numa linha só":
                            "Because for joins start, condition and increment on a single line",
                        "Porque o while não consegue repetir mais do que 10 vezes":
                            "Because while cannot repeat more than 10 times",
                    },
                    py: {
                        "Porque o while não consegue repetir mais do que 10 vezes":
                            "Because while cannot repeat more than 10 times",
                        "Porque o for não precisa de dois-pontos nem de indentação":
                            "Because for does not need a colon or indentation",
                        "Porque o for roda mais rápido que o while no computador":
                            "Because for runs faster than while on the computer",
                        "Porque o range controla início, fim e passo sozinho":
                            "Because range controls start, end and step on its own",
                    },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: {
            js: "Counter and accumulator: adding and counting",
            py: "Counter and accumulator: adding and counting",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Using a loop to compute something

With \`while\` and \`for\` you already know how to repeat code. Now comes the most useful part of daily life: using a loop to **compute something**, not just print numbers. Two patterns show up all the time:

- **Accumulator**: a variable that keeps storing a total, adding a little on each pass (for example, a sum).
- **Counter**: a variable that keeps counting how many times something happened (for example, how many even numbers exist in a range).

Both follow the same principle: the variable starts **before** the loop, with a neutral initial value, and is updated **inside** the loop, on each pass.`,
                },
                {
                    type: "code",
                    value: `// Add the numbers from 1 to n using an accumulator
let n = 5;
let sum = 0; // accumulator, starts at 0 (the "neutral" of addition)

for (let i = 1; i <= n; i++) {
  sum = sum + i; // on each pass, adds the value of i to the total
}

console.log(sum); // output: 15  (1 + 2 + 3 + 4 + 5)`,
                },
                {
                    type: "table",
                    value: `[["i","sum before the pass","calculation","sum after the pass"],["1","0","0 + 1","1"],["2","1","1 + 2","3"],["3","3","3 + 3","6"],["4","6","6 + 4","10"],["5","10","10 + 5","15"]]`,
                },
                {
                    type: "text",
                    value: `## Counter: how many times something happens

The counter is similar to the accumulator, but instead of adding different values, it always adds 1, and only when a condition is satisfied. That is how you answer questions like "how many even numbers exist between 1 and 10?".`,
                },
                {
                    type: "code",
                    value: `// Count how many even numbers exist from 1 to 10
let total = 10;
let evenCount = 0; // counter, starts at 0

for (let i = 1; i <= total; i++) {
  if (i % 2 === 0) { // remainder of the division by 2 is zero: even number
    evenCount = evenCount + 1;
  }
}

console.log(evenCount); // output: 5  (2, 4, 6, 8, 10)`,
                },
                {
                    type: "code",
                    value: `// Compute the average of the numbers from 1 to n, using accumulator and counter together
let n = 5;
let sum = 0;        // accumulator: stores the total
let count = 0;      // counter: stores how many numbers went into the sum

for (let i = 1; i <= n; i++) {
  sum = sum + i;
  count = count + 1;
}

let average = sum / count;
console.log(average); // output: 3  (1+2+3+4+5 = 15, and 15 / 5 = 3)`,
                },
                {
                    type: "quote",
                    value: `Accumulator and counter are the same trick: a variable created before the loop, updated on each pass. The accumulator adds values; the counter adds 1 each time a condition is satisfied.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Using a loop to compute something

With \`while\` and \`for\` you already know how to repeat code. Now comes the most useful part of daily life: using a loop to **compute something**, not just print numbers. Two patterns show up all the time:

- **Accumulator**: a variable that keeps storing a total, adding a little on each pass (for example, a sum).
- **Counter**: a variable that keeps counting how many times something happened (for example, how many even numbers exist in a range).

Both follow the same principle: the variable starts **before** the loop, with a neutral initial value, and is updated **inside** the loop, on each pass.`,
                },
                {
                    type: "code",
                    value: `# Add the numbers from 1 to n using an accumulator
n = 5
sum = 0  # accumulator, starts at 0 (the "neutral" of addition)

for i in range(1, n + 1):
    sum += i  # on each pass, adds the value of i to the total (same as sum = sum + i)

print(sum)  # output: 15  (1 + 2 + 3 + 4 + 5)`,
                },
                {
                    type: "table",
                    value: `[["i","sum before the pass","calculation","sum after the pass"],["1","0","0 + 1","1"],["2","1","1 + 2","3"],["3","3","3 + 3","6"],["4","6","6 + 4","10"],["5","10","10 + 5","15"]]`,
                },
                {
                    type: "text",
                    value: `## Counter: how many times something happens

The counter is similar to the accumulator, but instead of adding different values, it always adds 1, and only when a condition is satisfied. That is how you answer questions like "how many even numbers exist between 1 and 10?".`,
                },
                {
                    type: "code",
                    value: `# Count how many even numbers exist from 1 to 10
total = 10
even_count = 0  # counter, starts at 0

for i in range(1, total + 1):
    if i % 2 == 0:  # remainder of the division by 2 is zero: even number
        even_count += 1

print(even_count)  # output: 5  (2, 4, 6, 8, 10)`,
                },
                {
                    type: "code",
                    value: `# Compute the average of the numbers from 1 to n, using accumulator and counter together
n = 5
sum = 0        # accumulator: stores the total
count = 0      # counter: stores how many numbers went into the sum

for i in range(1, n + 1):
    sum += i
    count += 1

average = sum / count
print(average)  # output: 3.0  (the / division always returns a number with decimals in Python)`,
                },
                {
                    type: "quote",
                    value: `Accumulator and counter are the same trick: a variable created before the loop, updated on each pass. The accumulator adds values; the counter adds 1 each time a condition is satisfied.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "Which initial value is most suitable for an accumulator that will add numbers inside a loop?",
                    py: "Which initial value is most suitable for an accumulator that will add numbers inside a loop?",
                },
                ops: {
                    js: {
                        "O maior valor possível": "The largest possible value",
                        "Não precisa de um valor inicial, o JavaScript decide sozinho":
                            "It does not need an initial value, JavaScript decides on its own",
                        "0": I("0"),
                        "1": I("1"),
                    },
                    py: {
                        "Não precisa de valor inicial, o Python decide sozinho":
                            "It does not need an initial value, Python decides on its own",
                        "O maior valor possível": "The largest possible value",
                        "0": I("0"),
                        "1": I("1"),
                    },
                },
            },
            {
                enunciado: {
                    js: "What does a counter do inside a loop?",
                    py: "What does a counter do inside a loop?",
                },
                ops: {
                    js: {
                        "Guarda o último valor lido, sobrescrevendo o anterior":
                            "Stores the last value read, overwriting the previous one",
                        "Multiplica todos os números que passam pelo laço":
                            "Multiplies all the numbers that pass through the loop",
                        "Impede que o laço se repita mais de uma vez":
                            "Prevents the loop from repeating more than once",
                        "Soma 1 cada vez que uma condição é satisfeita":
                            "Adds 1 each time a condition is satisfied",
                    },
                    py: {
                        "Guarda o último valor lido, sobrescrevendo o anterior":
                            "Stores the last value read, overwriting the previous one",
                        "Soma 1 cada vez que uma condição é satisfeita":
                            "Adds 1 each time a condition is satisfied",
                        "Multiplica todos os números que passam pelo laço":
                            "Multiplies all the numbers that pass through the loop",
                        "Impede que o laço se repita mais de uma vez":
                            "Prevents the loop from repeating more than once",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nlet sum = 0;\nfor (let i = 1; i <= 4; i++) {\n  sum = sum + i;\n}\nconsole.log(sum);\n```\n\nWhat is the value of sum at the end?",
                    py: "Considering the code below:\n\n```python\nsum = 0\nfor i in range(1, 4):\n    sum += i\nprint(sum)\n```\n\nWhat is the value of sum at the end?",
                },
                ops: {
                    js: { "14": I("14"), "8": I("8"), "10": I("10"), "4": I("4") },
                    py: { "7": I("7"), "3": I("3"), "10": I("10"), "6": I("6") },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nlet count = 0;\nfor (let i = 1; i <= 10; i++) {\n  if (i % 2 !== 0) {\n    count = count + 1;\n  }\n}\nconsole.log(count);\n```\n\nWhat is the value of count at the end?",
                    py: "Considering the code below:\n\n```python\ncount = 0\nfor i in range(1, 11):\n    if i % 2 != 0:\n        count += 1\nprint(count)\n```\n\nWhat is the value of count at the end?",
                },
                ops: {
                    js: { "5": I("5"), "10": I("10"), "4": I("4"), "6": I("6") },
                    py: { "4": I("4"), "10": I("10"), "6": I("6"), "5": I("5") },
                },
            },
            {
                enunciado: {
                    js: "The code below should add the numbers from 1 to 5, but it has a subtle error in the condition. What is the value of sum at the end?\n\n```javascript\nlet sum = 0;\nfor (let i = 1; i < 5; i++) {\n  sum = sum + i;\n}\nconsole.log(sum);\n```",
                    py: "The code below should add the numbers from 1 to 5, but it has a subtle error in the range. What is the value of sum at the end?\n\n```python\nsum = 0\nfor i in range(1, 5):\n    sum += i\nprint(sum)\n```",
                },
                ops: {
                    js: { "15": I("15"), "14": I("14"), "10": I("10"), "5": I("5") },
                    py: { "5": I("5"), "15": I("15"), "10": I("10"), "14": I("14") },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: { js: "break, continue and nested loops", py: "break, continue and nested loops" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## More control inside the loop

So far, every loop you saw runs from start to finish, always testing the condition on each pass. But sometimes you want more control: stopping the loop early, or skipping a specific pass without stopping everything. For that there are two commands:

- **\`break\`**: interrupts the loop immediately, like when you look for a key on a keyring and stop searching as soon as you find the right one.
- **\`continue\`**: skips the rest of the current pass and goes straight to the next one, like when you leaf through a magazine skipping the ad pages, without stopping leafing.`,
                },
                {
                    type: "code",
                    value: `// Find the first number, between 1 and 20, that is divisible by 7
for (let i = 1; i <= 20; i++) {
  if (i % 7 === 0) {
    console.log("Found it:", i);
    break; // stops the loop as soon as it finds it, no need to continue
  }
}
// output: Found it: 7`,
                },
                {
                    type: "code",
                    value: `// Show the numbers 1 to 10, but skipping the multiples of 3
for (let i = 1; i <= 10; i++) {
  if (i % 3 === 0) {
    continue; // skips this pass, goes straight to the next one
  }
  console.log(i);
}
// output: 1 2 4 5 7 8 10   (skipped 3, 6 and 9)`,
                },
                {
                    type: "text",
                    value: `## Loop inside a loop

A loop can contain another loop inside it. That is useful when you need to repeat something for each repetition of something else, like building a whole times table (a multiplication table for each number) or walking a grid with rows and columns.

The rule is simple: for **each** pass of the outer loop, the inner loop runs **whole**, from beginning to end. That is why the cost of nested loops grows fast: if the outer loop runs \`n\` times and the inner one runs \`m\` times, the total number of passes is \`n × m\`, not \`n + m\`.`,
                },
                {
                    type: "code",
                    value: `// Times tables 1 to 3 using nested loops (for inside for)
for (let table = 1; table <= 3; table++) {
  console.log("Times table of " + table + ":");
  for (let times = 1; times <= 3; times++) {
    console.log(table + " x " + times + " = " + (table * times));
  }
}
// for each value of "table" (3 in total), the inner loop runs 3 times
// in full: altogether, 3 x 3 = 9 multiplication lines are printed`,
                },
                {
                    type: "table",
                    value: `[["Outer passes","Inner passes","Total passes (outer × inner)"],["3","3","9"],["5","5","25"],["10","10","100"],["100","100","10000"]]`,
                },
                {
                    type: "quote",
                    value: `break interrupts the whole loop; continue skips only the current pass and moves on to the next; and a loop inside another multiplies the work, since the outer one decides how many times the inner one runs in full.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## More control inside the loop

So far, every loop you saw runs from start to finish, always testing the condition on each pass. But sometimes you want more control: stopping the loop early, or skipping a specific pass without stopping everything. For that there are two commands:

- **\`break\`**: interrupts the loop immediately, like when you look for a key on a keyring and stop searching as soon as you find the right one.
- **\`continue\`**: skips the rest of the current pass and goes straight to the next one, like when you leaf through a magazine skipping the ad pages, without stopping leafing.`,
                },
                {
                    type: "code",
                    value: `# Find the first number, between 1 and 20, that is divisible by 7
for i in range(1, 21):
    if i % 7 == 0:
        print("Found it:", i)
        break  # stops the loop as soon as it finds it, no need to continue
# output: Found it: 7`,
                },
                {
                    type: "code",
                    value: `# Show the numbers 1 to 10, but skipping the multiples of 3
for i in range(1, 11):
    if i % 3 == 0:
        continue  # skips this pass, goes straight to the next one
    print(i)
# output: 1 2 4 5 7 8 10   (skipped 3, 6 and 9)`,
                },
                {
                    type: "text",
                    value: `## Loop inside a loop

A loop can contain another loop inside it. In Python, what shows that one loop is **inside** the other is the indentation: the inner loop sits one level further in. That is useful when you need to repeat something for each repetition of something else, like building a whole times table (a multiplication table for each number) or walking a grid with rows and columns.

The rule is simple: for **each** pass of the outer loop, the inner loop runs **whole**, from beginning to end. That is why the cost of nested loops grows fast: if the outer loop runs \`n\` times and the inner one runs \`m\` times, the total number of passes is \`n × m\`, not \`n + m\`.`,
                },
                {
                    type: "code",
                    value: `# Times tables 1 to 3 using nested loops (for inside for)
for table in range(1, 4):
    print(f"Times table of {table}:")
    for times in range(1, 4):
        print(f"{table} x {times} = {table * times}")
# for each value of "table" (3 in total), the inner loop runs 3 times
# in full: altogether, 3 x 3 = 9 multiplication lines are printed`,
                },
                {
                    type: "table",
                    value: `[["Outer passes","Inner passes","Total passes (outer × inner)"],["3","3","9"],["5","5","25"],["10","10","100"],["100","100","10000"]]`,
                },
                {
                    type: "quote",
                    value: `break interrupts the whole loop; continue skips only the current pass and moves on to the next; and a loop inside another multiplies the work, since the outer one decides how many times the inner one runs in full.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What does the break command do inside a loop?",
                    py: "What does the break command do inside a loop?",
                },
                ops: {
                    js: {
                        "Reinicia o laço do começo": "Restarts the loop from the beginning",
                        "Para o laço na hora, sem rodar mais nenhuma volta":
                            "Stops the loop right away, without running any more passes",
                        "Troca o valor da variável de controle para zero imediatamente":
                            "Immediately sets the control variable to zero",
                        "Pula só a volta atual e continua no laço":
                            "Skips only the current pass and continues in the loop",
                    },
                    py: {
                        "Pula só a volta atual e continua no laço":
                            "Skips only the current pass and continues in the loop",
                        "Para o laço na hora, sem rodar mais nenhuma volta":
                            "Stops the loop right away, without running any more passes",
                        "Reinicia o laço do começo": "Restarts the loop from the beginning",
                        "Troca o valor da variável de controle para zero imediatamente":
                            "Immediately sets the control variable to zero",
                    },
                },
            },
            {
                enunciado: {
                    js: "What does the continue command do inside a loop?",
                    py: "What does the continue command do inside a loop?",
                },
                ops: {
                    js: {
                        "Encerra o laço por completo, sem repetir mais nenhuma vez":
                            "Ends the loop completely, without ever repeating again",
                        "Pula o resto do código daquela volta e já vai para a próxima":
                            "Skips the rest of that pass's code and goes straight to the next",
                        "Faz o laço rodar em dobro a cada volta":
                            "Makes the loop run twice as fast on each pass",
                        "Reinicia o valor de todas as variáveis do programa inteiro":
                            "Resets the value of every variable in the whole program",
                    },
                    py: {
                        "Encerra o laço por completo, sem repetir mais nenhuma vez":
                            "Ends the loop completely, without ever repeating again",
                        "Reinicia o valor de todas as variáveis do programa inteiro":
                            "Resets the value of every variable in the whole program",
                        "Faz o laço rodar em dobro a cada volta":
                            "Makes the loop run twice as fast on each pass",
                        "Pula o resto daquela volta e já vai para a próxima":
                            "Skips the rest of that pass and goes straight to the next",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfor (let i = 1; i <= 5; i++) {\n  if (i === 3) {\n    break;\n  }\n  console.log(i);\n}\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\nfor i in range(1, 6):\n    if i == 3:\n        break\n    print(i)\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: {
                        "1 e 2": "1 and 2",
                        "1, 2 e 3": "1, 2 and 3",
                        "Nada é impresso": "Nothing is printed",
                        "1, 2, 3, 4 e 5": "1, 2, 3, 4 and 5",
                    },
                    py: {
                        "1 e 2": "1 and 2",
                        "1, 2 e 3": "1, 2 and 3",
                        "1, 2, 3, 4 e 5": "1, 2, 3, 4 and 5",
                        "Nada é impresso": "Nothing is printed",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfor (let i = 1; i <= 5; i++) {\n  if (i === 3) {\n    continue;\n  }\n  console.log(i);\n}\n```\n\nWhat appears in the console?",
                    py: "Considering the code below:\n\n```python\nfor i in range(1, 6):\n    if i == 3:\n        continue\n    print(i)\n```\n\nWhat appears in the console?",
                },
                ops: {
                    js: {
                        "1, 2, 3, 4 e 5": "1, 2, 3, 4 and 5",
                        "1 e 2": "1 and 2",
                        "1, 2, 4 e 5": "1, 2, 4 and 5",
                        "1, 2 e 3": "1, 2 and 3",
                    },
                    py: {
                        "1 e 2": "1 and 2",
                        "1, 2, 4 e 5": "1, 2, 4 and 5",
                        "1, 2, 3, 4 e 5": "1, 2, 3, 4 and 5",
                        "1, 2 e 3": "1, 2 and 3",
                    },
                },
            },
            {
                enunciado: {
                    js: "Considering the code below:\n\n```javascript\nfor (let a = 1; a <= 4; a++) {\n  for (let b = 1; b <= 3; b++) {\n    console.log(a, b);\n  }\n}\n```\n\nHow many times does the inner console.log run, in total?",
                    py: "Considering the code below:\n\n```python\nfor a in range(1, 5):\n    for b in range(1, 4):\n        print(a, b)\n```\n\nHow many times does the inner print run, in total?",
                },
                ops: {
                    js: { "12 vezes": "12 times", "7 vezes": "7 times", "4 vezes": "4 times", "3 vezes": "3 times" },
                    py: { "7 vezes": "7 times", "12 vezes": "12 times", "4 vezes": "4 times", "16 vezes": "16 times" },
                },
            },
        ],
    },
];
