// Tradução em inglês do módulo 7 da Lógica de Programação (resolvendo
// problemas de verdade). O módulo final da trilha: atacar problemas,
// algoritmos em coleções, ordenação, depuração e o mini-projeto que junta
// tudo. As variantes divergem no código (arrays x listas, sort x sorted,
// console.log x print com traceback) e no mini-projeto final.

import type { AulaModulo2 } from "./seed-dados-modulo2-en.ts";

const I = (v: string) => v;

export const TITULO_MODULO_7 = "Module 7 - Solving real problems";

export const AULAS_MODULO_7: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: { js: "How to attack a programming problem", py: "How to attack a programming problem" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# How to attack a programming problem

In the previous modules you learned, separately, how to store values in variables, make decisions with conditionals, repeat tasks with loops, organize logic into functions, and store collections of data in arrays and objects. Now it is time to put all that together to solve real problems, the way a programmer does in daily life.

The good news is that there is a simple roadmap that works for practically any problem, no matter how small.`,
                },
                {
                    type: "text",
                    value: `## A four-step roadmap

- **Understand the problem statement.** Read it calmly. What exactly is the problem asking for as an answer? What information do you already have to start with?
- **Break it into small steps.** Instead of thinking about the whole problem at once, write (in plain language, or pseudocode) the sequence of actions that leads from the start to the result.
- **Choose the tools.** For each step, decide what it needs: a variable to store something, a loop to repeat, a conditional to decide, an array to store several values.
- **Write and test little by little.** Do not write the whole program at once. Write one piece, run it, check the result with console.log, and only then move on to the next piece.`,
                },
                {
                    type: "table",
                    value: `[["Step","Question you ask yourself","Expected result"],["Understand","What does the problem ask for as a final answer?","A clear sentence describing the output"],["Break into steps","Which actions, in order, reach that answer?","A list of steps in plain language"],["Choose tools","Does each step need a variable, loop, conditional or function?","A sketch of which resources to use"],["Test little by little","Did this piece do what I expected?","A console.log confirming (or not) the expectation"]]`,
                },
                {
                    type: "text",
                    value: `## An example solved from scratch

Problem: "You have the ages of the people enrolled in a workshop. Find out how many of them are of age (18 years or older)."

Let us apply the roadmap before writing any code:

1. **Understand**: the answer is a number (the count of people aged 18 or older). I do not need to list who they are, just count.
2. **Break into steps**: I need a list of ages; I need a counter starting at 0; I need to walk through the list, one age at a time; for each age, if it is greater than or equal to 18, I add 1 to the counter; at the end, I show the counter.
3. **Choose tools**: an array for the ages, a number variable for the counter, a for...of to walk through, an if with >= to decide.
4. **Write little by little**: first just the loop printing each age, then I add the if, then the counter. Only at the end do I trust the result.`,
                },
                {
                    type: "code",
                    value: `const ages = [15, 22, 17, 30, 18, 12, 45];

let ofAge = 0;

for (const age of ages) {
  if (age >= 18) {
    ofAge = ofAge + 1;
  }
}

console.log(ofAge);
// output: 4`,
                },
                {
                    type: "quote",
                    value: `Every big problem is a collection of small problems. Understand before coding, break it into steps, choose the right tools for each step, and always test little by little, never the whole program at once.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# How to attack a programming problem

In the previous modules you learned, separately, how to store values in variables, make decisions with conditionals, repeat tasks with loops, organize logic into functions, and store collections of data in lists and dictionaries. Now it is time to put all that together to solve real problems, the way a programmer does in daily life.

The good news is that there is a simple roadmap that works for practically any problem, no matter how small.`,
                },
                {
                    type: "text",
                    value: `## A four-step roadmap

- **Understand the problem statement.** Read it calmly. What exactly is the problem asking for as an answer? What information do you already have to start with?
- **Break it into small steps.** Instead of thinking about the whole problem at once, write (in plain language, or pseudocode) the sequence of actions that leads from the start to the result.
- **Choose the tools.** For each step, decide what it needs: a variable to store something, a loop to repeat, a conditional to decide, a list to store several values.
- **Write and test little by little.** Do not write the whole program at once. Write one piece, run it, check the result with print, and only then move on to the next piece.`,
                },
                {
                    type: "table",
                    value: `[["Step","Question you ask yourself","Expected result"],["Understand","What does the problem ask for as a final answer?","A clear sentence describing the output"],["Break into steps","Which actions, in order, reach that answer?","A list of steps in plain language"],["Choose tools","Does each step need a variable, loop, conditional or function?","A sketch of which resources to use"],["Test little by little","Did this piece do what I expected?","A print confirming (or not) the expectation"]]`,
                },
                {
                    type: "text",
                    value: `## An example solved from scratch

Problem: "You have the ages of the people enrolled in a workshop. Find out how many of them are of age (18 years or older)."

Let us apply the roadmap before writing any code:

1. **Understand**: the answer is a number (the count of people aged 18 or older). I do not need to list who they are, just count.
2. **Break into steps**: I need a list of ages; I need a counter starting at 0; I need to walk through the list, one age at a time; for each age, if it is greater than or equal to 18, I add 1 to the counter; at the end, I show the counter.
3. **Choose tools**: a list for the ages, a variable for the counter (a number), a for to walk through, an if with >= to decide.
4. **Write little by little**: first just the loop printing each age, then I add the if, then the counter. Only at the end do I trust the result.`,
                },
                {
                    type: "code",
                    value: `ages = [15, 22, 17, 30, 18, 12, 45]

of_age = 0

for age in ages:
    if age >= 18:
        of_age = of_age + 1

print(of_age)
# output: 4`,
                },
                {
                    type: "quote",
                    value: `Every big problem is a collection of small problems. Understand before coding, break it into steps, choose the right tools for each step, and always test little by little, never the whole program at once.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What is the recommended first step before starting to write the code for a new problem?",
                    py: "What is the recommended first step before starting to write the code for a new problem?",
                },
                ops: {
                    js: {
                        "Decidir o nome de todas as variáveis antes de mais nada":
                            "Deciding the names of all the variables before anything else",
                        "Entender bem o que o enunciado está pedindo como resposta":
                            "Understanding well what the problem statement is asking for as an answer",
                        "Procurar um código pronto parecido na internet":
                            "Searching the internet for a similar ready-made piece of code",
                        "Escrever o código o mais rápido possível":
                            "Writing the code as fast as possible",
                    },
                    py: {
                        "Procurar um código pronto parecido na internet":
                            "Searching the internet for a similar ready-made piece of code",
                        "Entender bem o que o enunciado está pedindo como resposta":
                            "Understanding well what the problem statement is asking for as an answer",
                        "Decidir o nome de todas as variáveis antes de mais nada":
                            "Deciding the names of all the variables before anything else",
                        "Começar a escrever o código o mais rápido possível, sem planejar":
                            "Starting to write the code as fast as possible, without planning",
                    },
                },
            },
            {
                enunciado: {
                    js: "Breaking a big problem into smaller steps mainly helps because:",
                    py: "Breaking a big problem into smaller steps mainly helps because:",
                },
                ops: {
                    js: {
                        "Isso evita ter que usar variáveis": "It avoids having to use variables",
                        "Cada parte fica mais fácil de pensar e testar":
                            "Each part becomes easier to think about and test",
                        "O código final fica mais longo, mas mais completo":
                            "The final code becomes longer, but more complete",
                        "O programa passa a rodar mais rápido": "The program starts running faster",
                    },
                    py: {
                        "O código final fica mais longo, mas mais completo":
                            "The final code becomes longer, but more complete",
                        "O programa passa a rodar mais rápido": "The program starts running faster",
                        "Isso evita ter que usar variáveis": "It avoids having to use variables",
                        "Cada parte fica mais fácil de pensar e testar":
                            "Each part becomes easier to think about and test",
                    },
                },
            },
            {
                enunciado: {
                    js: "In the code that counts how many ages are greater than or equal to 18, which variable holds the final result shown in the console?",
                    py: "In the code that counts how many ages are greater than or equal to 18, which variable holds the final result shown with print?",
                },
                ops: {
                    js: { idades: "ages", idade: "age", "idade >= 18": "age >= 18", maioresDeIdade: "ofAge" },
                    py: { "idade >= 18": "age >= 18", idade: "age", idades: "ages", maiores_de_idade: "of_age" },
                },
            },
            {
                enunciado: {
                    js: "Testing the code little by little, instead of writing the whole program at once, mainly helps because:",
                    py: "Testing the code little by little, instead of writing the whole program at once, mainly helps because:",
                },
                ops: {
                    js: {
                        "O código final fica automaticamente mais curto":
                            "The final code automatically becomes shorter",
                        "O programa passa a ocupar menos memória":
                            "The program starts using less memory",
                        "Fica mais fácil descobrir em qual parte está o erro":
                            "It becomes easier to find out which part has the error",
                        "Evita completamente a necessidade de usar console.log":
                            "It completely avoids the need to use console.log",
                    },
                    py: {
                        "Evita completamente a necessidade de usar print":
                            "It completely avoids the need to use print",
                        "O código final fica automaticamente mais curto":
                            "The final code automatically becomes shorter",
                        "O programa passa a ocupar bem menos memória para rodar":
                            "The program starts using much less memory to run",
                        "Fica mais fácil descobrir em qual parte está o erro":
                            "It becomes easier to find out which part has the error",
                    },
                },
            },
            {
                enunciado: {
                    js: "Observe:\n\n```javascript\nconst ages = [10, 18, 20, 16, 19];\nlet counter = 0;\nfor (const age of ages) {\n  if (age > 18) {\n    counter = counter + 1;\n  }\n}\nconsole.log(counter);\n```\n\nWhat does this code print?",
                    py: "Observe:\n\n```python\nages = [10, 18, 20, 16, 19]\ncounter = 0\nfor age in ages:\n    if age > 18:\n        counter = counter + 1\nprint(counter)\n```\n\nWhat does this code print?",
                },
                ops: {
                    js: { "3": I("3"), "4": I("4"), "2": I("2"), "5": I("5") },
                    py: { "4": I("4"), "2": I("2"), "3": I("3"), "5": I("5") },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: {
            js: "Algorithms on arrays: searching, counting and finding the largest",
            py: "Algorithms on lists: searching, counting and finding the largest",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Algorithms on arrays: searching, counting and finding the largest

Now that you know how to attack a problem, it is worth learning some "ready-made recipes" that show up all the time when the subject is arrays: searching for an item, counting how many items satisfy a condition, and finding the largest or smallest value. Those three recipes solve a huge slice of the problems you will encounter.`,
                },
                {
                    type: "text",
                    value: `## Linear search

Searching for an item in an array, with no special trick, is simply walking through the items one by one, comparing each one with what you are looking for. That is called linear search. As soon as it finds the item, the algorithm can stop (it does not need to look at the rest). If it reaches the end without finding it, the answer is that the item is not there.`,
                },
                {
                    type: "code",
                    value: `const fruits = ["apple", "banana", "grape", "pear"];

function containsFruit(list, target) {
  for (const fruit of list) {
    if (fruit === target) {
      return true; // found it, no need to continue the loop
    }
  }
  return false; // walked through everything and did not find it
}

console.log(containsFruit(fruits, "grape"));
// output: true

console.log(containsFruit(fruits, "mango"));
// output: false`,
                },
                {
                    type: "table",
                    value: `[["Index","Fruit","Is it the one we want (\\"grape\\")?","What the code does"],["0","apple","no","continues to the next index"],["1","banana","no","continues to the next index"],["2","grape","yes","returns true and stops the loop"]]`,
                },
                {
                    type: "text",
                    value: `## Counting and finding the largest (or smallest)

Counting how many items satisfy a condition uses the same counter you already saw in Module 4: a variable that starts at 0 and adds 1 every time the condition is true inside the loop.

Finding the largest (or smallest) value follows another recipe: you "bet" that the first item of the array is the champion and keep comparing it with the rest. Whenever you find someone larger (or smaller, if you are looking for the minimum), you swap the champion.`,
                },
                {
                    type: "code",
                    value: `const grades = [7, 3, 9, 5, 10, 4];

// 1) count how many items satisfy a condition
let passed = 0;
for (const grade of grades) {
  if (grade >= 6) {
    passed = passed + 1;
  }
}
console.log(passed);
// output: 3

// 2) find the largest value in the array
let highestGrade = grades[0]; // starts by "betting" on the first item
for (const grade of grades) {
  if (grade > highestGrade) {
    highestGrade = grade; // found someone larger, swap the champion
  }
}
console.log(highestGrade);
// output: 10`,
                },
                {
                    type: "quote",
                    value: `Searching, counting and finding the largest are the same underlying movement: walk through the array and compare each item. Master that movement and you solve a good part of daily problems with arrays.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Algorithms on lists: searching, counting and finding the largest

Now that you know how to attack a problem, it is worth learning some "ready-made recipes" that show up all the time when the subject is lists: searching for an item, counting how many items satisfy a condition, and finding the largest or smallest value. Those three recipes solve a huge slice of the problems you will encounter.`,
                },
                {
                    type: "text",
                    value: `## Linear search

Searching for an item in a list, with no special trick, is simply walking through the items one by one, comparing each one with what you are looking for. That is called linear search. As soon as it finds the item, the algorithm can stop (it does not need to look at the rest). If it reaches the end without finding it, the answer is that the item is not there.

Python also offers a ready shortcut for that search: the \`in\` operator, which already returns True or False telling whether the item is in the list. Even so, understanding the linear search behind it is what lets you solve similar problems on your own.`,
                },
                {
                    type: "code",
                    value: `fruits = ["apple", "banana", "grape", "pear"]

def contains_fruit(items, target):
    for fruit in items:
        if fruit == target:
            return True  # found it, no need to continue the loop
    return False  # walked through everything and did not find it

print(contains_fruit(fruits, "grape"))
# output: True

print(contains_fruit(fruits, "mango"))
# output: False

# Python already has a ready shortcut for that same search: the in operator
print("grape" in fruits)
# output: True`,
                },
                {
                    type: "table",
                    value: `[["Index","Fruit","Is it the one we want (\\"grape\\")?","What the code does"],["0","apple","no","continues to the next index"],["1","banana","no","continues to the next index"],["2","grape","yes","returns True and stops the loop"]]`,
                },
                {
                    type: "text",
                    value: `## Counting and finding the largest (or smallest)

Counting how many items satisfy a condition uses the same counter you already saw with loops: a variable that starts at 0 and adds 1 every time the condition is true inside the loop.

Finding the largest (or smallest) value follows another recipe: you "bet" that the first item of the list is the champion and keep comparing it with the rest. Whenever you find someone larger (or smaller, if you are looking for the minimum), you swap the champion. Python also brings the ready-made functions max() and min() for that, but understanding the comparison behind them is well worth it.`,
                },
                {
                    type: "code",
                    value: `grades = [7, 3, 9, 5, 10, 4]

# 1) count how many items satisfy a condition
passed = 0
for grade in grades:
    if grade >= 6:
        passed = passed + 1
print(passed)
# output: 3

# 2) find the largest value in the list
highest_grade = grades[0]  # starts by "betting" on the first item
for grade in grades:
    if grade > highest_grade:
        highest_grade = grade  # found someone larger, swap the champion
print(highest_grade)
# output: 10

# Python's ready-made form, with the same result:
print(max(grades))
# output: 10`,
                },
                {
                    type: "quote",
                    value: `Searching, counting and finding the largest are the same underlying movement: walk through the list and compare each item. Master that movement and you solve a good part of daily problems with lists.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "In linear search, what does the code do as soon as it finds the item it is looking for?",
                    py: "In linear search, what does the code do as soon as it finds the item it is looking for?",
                },
                ops: {
                    js: {
                        "Continua percorrendo o array inteiro mesmo assim":
                            "It keeps walking through the whole array anyway",
                        "Pode parar e devolver o resultado na hora":
                            "It can stop and return the result right away",
                        "Reinicia o laço a partir do primeiro item":
                            "It restarts the loop from the first item",
                        "Remove o item encontrado do array":
                            "It removes the found item from the array",
                    },
                    py: {
                        "Reinicia o laço a partir do primeiro item":
                            "It restarts the loop from the first item",
                        "Pode parar e devolver o resultado na hora":
                            "It can stop and return the result right away",
                        "Continua percorrendo a lista inteira mesmo assim":
                            "It keeps walking through the whole list anyway",
                        "Remove o item encontrado da lista":
                            "It removes the found item from the list",
                    },
                },
            },
            {
                enunciado: {
                    js: "To count how many items in an array satisfy a condition, what is the most common pattern?",
                    py: "To count how many items in a list satisfy a condition, what is the most common pattern?",
                },
                ops: {
                    js: {
                        "Uma variável contadora que começa em 0 e soma 1":
                            "A counter variable that starts at 0 and adds 1",
                        "Somar o valor de todos os itens do array":
                            "Adding up the value of all the items in the array",
                        "Usar apenas o length do array": "Using only the array's length",
                        "Uma variável que começa em 1 e nunca muda de valor":
                            "A variable that starts at 1 and never changes value",
                    },
                    py: {
                        "Uma variável contadora que começa em 0 e soma 1":
                            "A counter variable that starts at 0 and adds 1",
                        "Uma variável que começa em 1 e nunca muda de valor":
                            "A variable that starts at 1 and never changes value",
                        "Usar apenas o len() da lista": "Using only the list's len()",
                        "Somar o valor de todos os itens da lista":
                            "Adding up the value of all the items in the list",
                    },
                },
            },
            {
                enunciado: {
                    js: "Observe:\n\n```javascript\nconst numbers = [4, 8, 1, 9, 3];\nlet largest = numbers[0];\nfor (const n of numbers) {\n  if (n > largest) {\n    largest = n;\n  }\n}\nconsole.log(largest);\n```\n\nWhat does this code print?",
                    py: "Observe:\n\n```python\nnumbers = [4, 8, 1, 9, 3]\nlargest = numbers[0]\nfor n in numbers:\n    if n > largest:\n        largest = n\nprint(largest)\n```\n\nWhat does this code print?",
                },
                ops: {
                    js: { "9": I("9"), "3": I("3"), "4": I("4"), "1": I("1") },
                    py: { "1": I("1"), "9": I("9"), "4": I("4"), "3": I("3") },
                },
            },
            {
                enunciado: {
                    js: "Why does the code that finds the largest value in an array start with largest = numbers[0], instead of starting with largest = 0?",
                    py: "Why does the code that finds the largest value in a list start with largest = numbers[0], instead of starting with largest = 0?",
                },
                ops: {
                    js: {
                        "Porque, se todos os números forem negativos, começar com 0 daria erro":
                            "Because, if all the numbers are negative, starting with 0 would give an error",
                        "Porque toda variável precisa obrigatoriamente começar com um valor do array":
                            "Because every variable necessarily has to start with a value from the array",
                        "Porque o primeiro item de um array em JavaScript é sempre o maior":
                            "Because the first item of an array in JavaScript is always the largest",
                        "Porque o número 0 não pode ser usado em comparações":
                            "Because the number 0 cannot be used in comparisons",
                    },
                    py: {
                        "Porque o número 0 não pode ser usado em comparações":
                            "Because the number 0 cannot be used in comparisons",
                        "Porque toda variável precisa obrigatoriamente ser iniciada com um valor tirado da lista":
                            "Because every variable necessarily has to be initialized with a value from the list",
                        "Porque o primeiro item de uma lista em Python é sempre o maior":
                            "Because the first item of a list in Python is always the largest",
                        "Porque, se todos os números forem negativos, começar com 0 daria a resposta errada":
                            "Because, if all the numbers are negative, starting with 0 would give the wrong answer",
                    },
                },
            },
            {
                enunciado: {
                    js: "The following code finds the largest value in an array:\n\n```javascript\nlet largest = numbers[0];\nfor (const n of numbers) {\n  if (n > largest) {\n    largest = n;\n  }\n}\n```\n\nWhich change would make this code find the SMALLEST value instead of the largest?",
                    py: "The following code finds the largest value in a list:\n\n```python\nlargest = numbers[0]\nfor n in numbers:\n    if n > largest:\n        largest = n\n```\n\nWhich change would make this code find the SMALLEST value instead of the largest?",
                },
                ops: {
                    js: {
                        "Trocar numeros[0] por 0 na primeira linha":
                            "Changing numbers[0] to 0 on the first line",
                        "Trocar o operador > por < na condição do if":
                            "Changing the operator > to < in the if condition",
                        "Trocar apenas o nome da variável maior para menor, sem mexer no operador":
                            "Changing only the variable name from largest to smallest, without touching the operator",
                        "Trocar o for por um while": "Changing the for to a while",
                    },
                    py: {
                        "Trocar o for por um while": "Changing the for to a while",
                        "Trocar numeros[0] por 0 na primeira linha":
                            "Changing numbers[0] to 0 on the first line",
                        "Trocar apenas o nome da variável maior para menor, sem mexer no operador":
                            "Changing only the variable name from largest to smallest, without touching the operator",
                        "Trocar o operador > por < na condição do if":
                            "Changing the operator > to < in the if condition",
                    },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: { js: "Putting things in order: the idea of sorting", py: "Putting things in order: the idea of sorting" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Putting things in order: the idea of sorting

Many things become easier to understand when they are organized: a task list by priority, a ranking of grades from highest to lowest, names in alphabetical order. Sorting is exactly that: reorganizing the items of an array following a criterion.

In this lesson you will understand the idea behind sorting and learn the ready-made tool JavaScript offers for it.`,
                },
                {
                    type: "text",
                    value: `## Selection sort: the idea

Remember the algorithm that finds the smallest value in an array, from the last lesson? Selection sort uses exactly that idea, repeated several times:

1. Find the smallest value in the portion of the array that still needs sorting.
2. Swap that smallest value with the first item of that portion.
3. Consider that first item already sorted and repeat the process only with the rest.
4. Continue until a single item is left.

At the end, the whole array is in ascending order. It is a simple idea, though it repeats a lot of work, which is why, in practice, almost nobody writes that logic by hand.`,
                },
                {
                    type: "table",
                    value: `[["Step","Array before the step","Smallest in the remaining portion","Array after the swap"],["1","[4, 1, 3, 2]","1","[1, 4, 3, 2]"],["2","[1, 4, 3, 2], needs sorting from index 1","2","[1, 2, 3, 4]"],["3","[1, 2, 3, 4], needs sorting from index 2","3 (already in the right place)","[1, 2, 3, 4]"]]`,
                },
                {
                    type: "text",
                    value: `## In practice: the sort() method

Understanding the idea of selection sort helps your reasoning, but in daily life you will not write that algorithm by hand every time. JavaScript already has a ready-made method for arrays: sort().`,
                },
                {
                    type: "code",
                    value: `const names = ["Carlos", "Ana", "Bruno"];

names.sort();

console.log(names);
// output: ["Ana", "Bruno", "Carlos"]`,
                },
                {
                    type: "code",
                    value: `const numbers = [10, 1, 2];

console.log(numbers.sort());
// output: [1, 10, 2]  (not what you expected!)

// by default, sort() compares items as if they were text.
// for numbers, we need to tell it how to compare:
console.log(numbers.sort((a, b) => a - b));
// output: [1, 2, 10]`,
                },
                {
                    type: "quote",
                    value: `Sorting is repeating, in an organized way, something you already know how to do: comparing and choosing the smallest (or the largest). In daily life, trust JavaScript's sort(), but always tell it how to compare numbers.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Putting things in order: the idea of sorting

Many things become easier to understand when they are organized: a task list by priority, a ranking of grades from highest to lowest, names in alphabetical order. Sorting is exactly that: reorganizing the items of a list following a criterion.

In this lesson you will understand the idea behind sorting and learn the ready-made tools Python offers for it.`,
                },
                {
                    type: "text",
                    value: `## Selection sort: the idea

Remember the algorithm that finds the smallest value in a list, from the last lesson? Selection sort uses exactly that idea, repeated several times:

1. Find the smallest value in the portion of the list that still needs sorting.
2. Swap that smallest value with the first item of that portion.
3. Consider that first item already sorted and repeat the process only with the rest.
4. Continue until a single item is left.

At the end, the whole list is in ascending order. It is a simple idea, though it repeats a lot of work, which is why, in practice, almost nobody writes that logic by hand.`,
                },
                {
                    type: "table",
                    value: `[["Step","List before the step","Smallest in the remaining portion","List after the swap"],["1","[4, 1, 3, 2]","1","[1, 4, 3, 2]"],["2","[1, 4, 3, 2], needs sorting from index 1","2","[1, 2, 3, 4]"],["3","[1, 2, 3, 4], needs sorting from index 2","3 (already in the right place)","[1, 2, 3, 4]"]]`,
                },
                {
                    type: "text",
                    value: `## In practice: sorted() and .sort()

Understanding the idea of selection sort helps your reasoning, but in daily life you will not write that algorithm by hand every time. Python already brings two ready-made ways to sort: the \`sorted(list)\` function, which returns a new sorted list (without touching the original), and the \`list.sort()\` method, which sorts the list itself in place. In both cases, use \`reverse=True\` when you want from largest to smallest.`,
                },
                {
                    type: "code",
                    value: `names = ["Carlos", "Ana", "Bruno"]

# sorted() returns a new list, already sorted
print(sorted(names))
# output: ['Ana', 'Bruno', 'Carlos']

# .sort() sorts the list itself, in place
names.sort()
print(names)
# output: ['Ana', 'Bruno', 'Carlos']`,
                },
                {
                    type: "code",
                    value: `numbers = [10, 1, 2]

# by default, it sorts from smallest to largest
print(sorted(numbers))
# output: [1, 2, 10]

# to sort from largest to smallest, use reverse=True
print(sorted(numbers, reverse=True))
# output: [10, 2, 1]`,
                },
                {
                    type: "quote",
                    value: `Sorting is repeating, in an organized way, something you already know how to do: comparing and choosing the smallest (or the largest). In daily life, trust Python's sorted() and .sort(), and use reverse=True when you want from largest to smallest.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'What does "sorting" an array mean?',
                    py: 'What does "sorting" a list mean?',
                },
                ops: {
                    js: {
                        "Contar quantos itens o array tem": "Counting how many items the array has",
                        "Reorganizar os itens do array seguindo um critério":
                            "Reorganizing the items of the array following a criterion",
                        "Remover os itens repetidos do array": "Removing the duplicate items from the array",
                        "Transformar todos os números do array em texto":
                            "Turning all the numbers in the array into text",
                    },
                    py: {
                        "Contar quantos itens a lista tem": "Counting how many items the list has",
                        "Remover os itens repetidos da lista": "Removing the duplicate items from the list",
                        "Transformar todos os números da lista em pedaços de texto":
                            "Turning all the numbers in the list into pieces of text",
                        "Reorganizar os itens da lista seguindo um critério":
                            "Reorganizing the items of the list following a criterion",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which ready-made JavaScript method reorganizes the items of an array?",
                    py: "Which ready-made Python function returns a new sorted list, without changing the original?",
                },
                ops: {
                    js: { "sort()": I("sort()"), "order()": I("order()"), "index()": I("index()"), "arrange()": I("arrange()") },
                    py: { "index()": I("index()"), "sorted()": I("sorted()"), "arrange()": I("arrange()"), "order()": I("order()") },
                },
            },
            {
                enunciado: {
                    js: "Observe:\n\n```javascript\nconst numbers = [3, 1, 2];\nconsole.log(numbers.sort());\n```\n\nWhat does this code print?",
                    py: "Observe:\n\n```python\nnumbers = [3, 1, 2]\nprint(sorted(numbers))\n```\n\nWhat does this code print?",
                },
                ops: {
                    js: {
                        "[1, 2, 3]": I("[1, 2, 3]"),
                        "Dá erro, porque sort() não existe para arrays de números":
                            "It raises an error, because sort() does not exist for arrays of numbers",
                        "[3, 2, 1]": I("[3, 2, 1]"),
                        "[3, 1, 2]": I("[3, 1, 2]"),
                    },
                    py: {
                        "Dá erro, porque sorted() não funciona com listas de números":
                            "It raises an error, because sorted() does not work with lists of numbers",
                        "[1, 2, 3]": I("[1, 2, 3]"),
                        "[3, 1, 2]": I("[3, 1, 2]"),
                        "[3, 2, 1]": I("[3, 2, 1]"),
                    },
                },
            },
            {
                enunciado: {
                    js: "In selection sort, after finding the smallest value in the portion and putting it at the front, what does the algorithm do next?",
                    py: "In selection sort, after finding the smallest value in the portion and putting it at the front, what does the algorithm do next?",
                },
                ops: {
                    js: {
                        "Começa de novo do zero, considerando outra vez todos os itens":
                            "It starts over from scratch, considering all the items again",
                        "Para, porque o array já está pronto":
                            "It stops, because the array is already done",
                        "Repete o processo no restante, ignorando o item já posicionado":
                            "It repeats the process on the rest, ignoring the already positioned item",
                        "Troca o maior valor de lugar com o menor":
                            "It swaps the largest value with the smallest",
                    },
                    py: {
                        "Troca o maior valor de lugar com o menor":
                            "It swaps the largest value with the smallest",
                        "Para, porque a lista já está pronta":
                            "It stops, because the list is already done",
                        "Repete o processo no restante, ignorando o item já posicionado":
                            "It repeats the process on the rest, ignoring the already positioned item",
                        "Começa de novo do zero, considerando outra vez todos os itens da lista":
                            "It starts over from scratch, considering all the items in the list again",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which code correctly sorts the array [10, 2, 33, 4] from smallest to largest number?",
                    py: "You want a new list with the values of numbers = [10, 2, 33, 4] in order from smallest to largest, without changing the original list. Which code does that?",
                },
                ops: {
                    js: {
                        "numeros.sort((a, b) => a - b);": "numbers.sort((a, b) => a - b);",
                        "numeros.sort((a, b) => b - a);": "numbers.sort((a, b) => b - a);",
                        "numeros.reverse();": "numbers.reverse();",
                        "numeros.sort();": "numbers.sort();",
                    },
                    py: {
                        "sorted(numeros, reverse=True)": "sorted(numbers, reverse=True)",
                        "sorted(numeros)": "sorted(numbers)",
                        "numeros.sort()": "numbers.sort()",
                        "numeros.reverse()": "numbers.reverse()",
                    },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: { js: "When it goes wrong: debugging your code", py: "When it goes wrong: debugging your code" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# When it goes wrong: debugging your code

If your code does not work the first time, congratulations: you are a normal programmer. Making mistakes is part of the process. What separates someone who programs well from someone who freezes at the first error is knowing how to investigate. That process of finding and fixing a problem in code is called debugging.

In this lesson you will learn a simple roadmap for finding out what went wrong.`,
                },
                {
                    type: "text",
                    value: `## A roadmap for investigating

When the code does not work, either because it broke with an error or because it runs to the end but gives a wrong result, follow this order:

- **Read the error message calmly.** It almost always says the type of problem and the line where it happened.
- **Isolate the piece.** Instead of looking at the whole program, test only the suspicious part, separated from the rest.
- **Use console.log to inspect values.** Print the variables at key points in the code to see if they have the value you expect.
- **Test hypotheses, one at a time.** Have an idea of what might be wrong? Change only that, run again, and see if the result changes the way you predicted.`,
                },
                {
                    type: "code",
                    value: `const names = ["Ana", "Bruno"];

console.log(names[5].toUpperCase());

// TypeError: Cannot read properties of undefined (reading 'toUpperCase')
//
// names[5] does not exist (the array only has indexes 0 and 1),
// so names[5] is undefined, and undefined has no toUpperCase.
// the message itself already points to the problem: "reading toUpperCase" of undefined.`,
                },
                {
                    type: "table",
                    value: `[["Common mistake","What usually happens","How to notice"],["Using = instead of ===","the if always enters as true, because = assigns a value instead of comparing","review every comparison: use === to compare, = only to assign"],["Off-by-one in the loop (i <= array.length)","undefined appears at the end, or one extra item is processed by mistake","check the for limit: use i < array.length to walk only the valid indexes"],["Forgetting the return","the function runs and computes correctly inside, but returns undefined","check that every function that should return a value has a return"],["Similar variable names (e.g.: grade and grades)","the code runs without any error, but uses the wrong value","give each variable clearly different and descriptive names"]]`,
                },
                {
                    type: "text",
                    value: `## When the code runs, but the result is wrong

The most annoying case to debug is when no error appears: the program runs to the end, but the result is not what you expected. Here console.log is your best friend: print the values along the way to see at which step things go off track.

See an example: the code should add up a student's grades, but it is returning a strange value.`,
                },
                {
                    type: "code",
                    value: `const grades = [7, 8, 6];

function sumGrades(list) {
  let sum = 0;
  for (let i = 0; i <= list.length; i++) {
    sum = sum + list[i];
  }
  return sum;
}

console.log(sumGrades(grades));
// output: NaN  (not what was expected)

// investigating with console.log inside the loop:
function sumGradesWithLog(list) {
  let sum = 0;
  for (let i = 0; i <= list.length; i++) {
    console.log("i =", i, "list[i] =", list[i]);
    sum = sum + list[i];
  }
  return sum;
}

sumGradesWithLog(grades);
// i = 0 list[i] = 7
// i = 1 list[i] = 8
// i = 2 list[i] = 6
// i = 3 list[i] = undefined   <- here is the problem
//
// the loop uses i <= list.length, so it tries to access list[3],
// which does not exist. the right way is i < list.length.`,
                },
                {
                    type: "quote",
                    value: `An error is not a failure, it is a clue. Read the message calmly, isolate the piece, print the values with console.log, and test one hypothesis at a time, until the behavior matches what you expected.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# When it goes wrong: debugging your code

If your code does not work the first time, congratulations: you are a normal programmer. Making mistakes is part of the process. What separates someone who programs well from someone who freezes at the first error is knowing how to investigate. That process of finding and fixing a problem in code is called debugging.

In this lesson you will learn a simple roadmap for finding out what went wrong.`,
                },
                {
                    type: "text",
                    value: `## A roadmap for investigating

When the code does not work, either because it broke with an error or because it runs to the end but gives a wrong result, follow this order:

- **Read the error message calmly.** In Python, it comes in the traceback, and the last line almost always says the type of problem (for example, IndexError) with a message explaining it; right above, it points to the line where the error happened.
- **Isolate the piece.** Instead of looking at the whole program, test only the suspicious part, separated from the rest.
- **Use print to inspect values.** Print the variables at key points in the code to see if they have the value you expect.
- **Test hypotheses, one at a time.** Have an idea of what might be wrong? Change only that, run again, and see if the result changes the way you predicted.`,
                },
                {
                    type: "code",
                    value: `names = ["Ana", "Bruno"]

print(names[5])

# Traceback (most recent call last):
#   File "program.py", line 3, in <module>
#     print(names[5])
# IndexError: list index out of range
#
# the list only has indexes 0 and 1, so names[5] does not exist.
# read the traceback from bottom to top: the last line says the type of
# error (IndexError) and the message ("list index out of range"), and right
# above it points to the exact line where the error happened.`,
                },
                {
                    type: "table",
                    value: `[["Common mistake","What usually happens","How to notice or fix"],["Misaligned indentation (too many or too few spaces)","Python does not even run and reports IndentationError, pointing to the line","align the lines of the same block with the same amount of spaces"],["Forgetting the colon (:) at the end of if, for or def","Python stops with SyntaxError before running","check that every if, for, while and def ends with : and the block is indented"],["Misspelling a variable name (e.g.: age and agee)","Python stops with NameError: name ... is not defined","check that the name used is exactly the same as the one you created"],["Adding text to a number (e.g.: \\"3\\" + 5)","Python stops with TypeError","check the types: use int(...) to turn text into a number before adding"],["Looking up a dictionary key that does not exist","Python stops with KeyError","check that the key exists, or use .get() to receive a default value"],["Forgetting the return in a function","the function runs, but returns None instead of the result","check that every function that should return a value has a return"]]`,
                },
                {
                    type: "text",
                    value: `## When the code runs, but the result is wrong

Errors like IndentationError and SyntaxError are syntax errors: Python does not even start running the program. The most annoying case, however, is the logic error: no message appears, the program runs to the end, but the result is not what you expected. Here print is your best friend: print the values along the way to see at which step things go off track.

See an example: the code should add up a student's grades, but it is returning a smaller value than it should.`,
                },
                {
                    type: "code",
                    value: `grades = [7, 8, 6]

def sum_grades(items):
    sum = 0
    for i in range(1, len(items)):   # starts at index 1 by mistake
        sum = sum + items[i]
    return sum

print(sum_grades(grades))
# output: 14  (the expected value was 21)

# investigating with print inside the loop:
def sum_grades_with_log(items):
    sum = 0
    for i in range(1, len(items)):
        print("i =", i, "items[i] =", items[i])
        sum = sum + items[i]
    return sum

sum_grades_with_log(grades)
# i = 1 items[i] = 8
# i = 2 items[i] = 6
# i = 0 never appears: the first item (7) was left out!
# the right way is range(len(items)), which starts at index 0.`,
                },
                {
                    type: "quote",
                    value: `An error is not a failure: it is a clue. Read the traceback calmly, isolate the piece, print the values with print, and test one hypothesis at a time, until the behavior matches what you expected.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "What should you do first when you see an error message in the console?",
                    py: "What should you do first when you see an error message (a traceback) in Python?",
                },
                ops: {
                    js: {
                        "Comentar todas as linhas do arquivo até o erro sumir":
                            "Comment out all the lines in the file until the error goes away",
                        "Ignorar e rodar o código de novo, torcendo para não acontecer outra vez":
                            "Ignore it and run the code again, hoping it does not happen again",
                        "Apagar todo o código e recomeçar do zero":
                            "Delete all the code and start over from scratch",
                        "Ler a mensagem com calma, ela geralmente indica o tipo do problema e a linha":
                            "Read the message calmly, it usually indicates the type of problem and the line",
                    },
                    py: {
                        "Apagar todo o código e recomeçar do zero":
                            "Delete all the code and start over from scratch",
                        "Ignorar a mensagem e rodar o código de novo, torcendo para não acontecer outra vez":
                            "Ignore the message and run the code again, hoping it does not happen again",
                        "Comentar todas as linhas do arquivo até o erro sumir":
                            "Comment out all the lines in the file until the error goes away",
                        "Ler a mensagem com calma: ela geralmente indica o tipo do erro e a linha":
                            "Read the message calmly: it usually indicates the type of error and the line",
                    },
                },
            },
            {
                enunciado: {
                    js: "Which simple tool helps inspect the value of a variable in the middle of the code's execution?",
                    py: "Which simple tool helps inspect the value of a variable in the middle of the code's execution?",
                },
                ops: {
                    js: {
                        "if, junto de uma condição": "if, together with a condition",
                        "sort(), para ordenar arrays": "sort(), to sort arrays",
                        "console.log()": I("console.log()"),
                        "return, dentro de uma função": "return, inside a function",
                    },
                    py: {
                        "if, junto de uma condição": "if, together with a condition",
                        "print()": I("print()"),
                        "sorted(), para ordenar listas": "sorted(), to sort lists",
                        "return, dentro de uma função": "return, inside a function",
                    },
                },
            },
            {
                enunciado: {
                    js: "A function should return the sum of two numbers. When you run console.log(add(2, 3)), undefined appears in the console, with no error. What most likely happened?",
                    py: "A function should return the sum of two numbers. When you run print(add(2, 3)), None appears in the console, with no error. What most likely happened?",
                },
                ops: {
                    js: {
                        "A função foi definida duas vezes no mesmo arquivo":
                            "The function was defined twice in the same file",
                        "A função esqueceu de usar return no final":
                            "The function forgot to use return at the end",
                        "O comando console.log foi escrito de forma errada":
                            "The console.log command was written incorrectly",
                        "Os números 2 e 3 não existem em JavaScript":
                            "The numbers 2 and 3 do not exist in JavaScript",
                    },
                    py: {
                        "A função foi definida duas vezes no mesmo arquivo":
                            "The function was defined twice in the same file",
                        "Os números 2 e 3 não existem em Python":
                            "The numbers 2 and 3 do not exist in Python",
                        "O comando print foi escrito de forma errada":
                            "The print command was written incorrectly",
                        "A função esqueceu de usar return no final":
                            "The function forgot to use return at the end",
                    },
                },
            },
            {
                enunciado: {
                    js: "Observe:\n\n```javascript\nconst numbers = [10, 20, 30];\nfor (let i = 0; i <= numbers.length; i++) {\n  console.log(numbers[i]);\n}\n```\n\nWhat goes wrong in this loop?",
                    py: "Observe:\n\n```python\nnumbers = [10, 20, 30]\nfor i in range(len(numbers) + 1):\n    print(numbers[i])\n```\n\nWhat goes wrong in this loop?",
                },
                ops: {
                    js: {
                        "Ele entra em um loop infinito": "It enters an infinite loop",
                        "Ele tenta acessar numeros[3], que não existe":
                            "It tries to access numbers[3], which does not exist",
                        "Ele imprime todos os itens do array em ordem invertida":
                            "It prints all the items of the array in reverse order",
                        "Ele pula o primeiro item do array": "It skips the first item of the array",
                    },
                    py: {
                        "Ele pula o primeiro item da lista": "It skips the first item of the list",
                        "Ele entra em um loop infinito": "It enters an infinite loop",
                        "Ele imprime todos os itens da lista, só que em ordem invertida":
                            "It prints all the items of the list, only in reverse order",
                        "Ele tenta acessar numeros[3], que não existe (IndexError)":
                            "It tries to access numbers[3], which does not exist (IndexError)",
                    },
                },
            },
            {
                enunciado: {
                    js: "Observe:\n\n```javascript\nfunction containsNumber(list, target) {\n  for (const n of list) {\n    if (n === target) {\n      return true;\n    }\n    return false;\n  }\n}\nconsole.log(containsNumber([5, 8, 2, 9], 2));\n```\n\nThe array contains the number 2, but this code prints false. What is the cause of the bug?",
                    py: "Observe:\n\n```python\ndef contains_number(items, target):\n    for n in items:\n        if n == target:\n            return True\n        return False\n\nprint(contains_number([5, 8, 2, 9], 2))\n```\n\nThe list contains the number 2, but this code prints False. What is the cause of the bug?",
                },
                ops: {
                    js: {
                        "O array [5, 8, 2, 9] não é considerado válido nessa versão do JavaScript":
                            "The array [5, 8, 2, 9] is not considered valid in this version of JavaScript",
                        "A função não recebe os parâmetros na ordem correta":
                            "The function does not receive the parameters in the correct order",
                        "O return false ficou fora do if, dentro do laço":
                            "The return false ended up outside the if, inside the loop",
                        "O operador === deveria ser trocado por ==":
                            "The operator === should be changed to ==",
                    },
                    py: {
                        "O operador == deveria ser trocado por is":
                            "The operator == should be changed to is",
                        "A lista [5, 8, 2, 9] não é aceita como argumento em Python":
                            "The list [5, 8, 2, 9] is not accepted as an argument in Python",
                        "O return False está dentro do laço, e não depois dele":
                            "The return False is inside the loop, not after it",
                        "A função não recebe os parâmetros na ordem correta":
                            "The function does not receive the parameters in the correct order",
                    },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: {
            js: "Mini-project: a task list (and the next step)",
            py: "Mini-project: a task list (and the next step)",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Mini-project: a task list

Time to put together everything you learned in this trail: variables, conditionals, loops, functions and collections (arrays and objects). We will build, little by little, a small task manager that runs entirely in the program's memory (when the program ends, the list goes away, but that is not a problem now; the goal here is to practice the logic).

The project will have:
- an array to store the tasks (each task is an object with a title and a status)
- a function to add a new task
- a function to list the tasks
- a function to mark a task as done
- a function to count how many tasks are still pending

Let us build it piece by piece.`,
                },
                {
                    type: "code",
                    value: `const tasks = [];

function addTask(title) {
  const newTask = {
    title: title,
    done: false,
  };
  tasks.push(newTask);
}

addTask("Study loops");
addTask("Do the functions exercise");
addTask("Review arrays and objects");

console.log(tasks);
// output:
// [
//   { title: "Study loops", done: false },
//   { title: "Do the functions exercise", done: false },
//   { title: "Review arrays and objects", done: false }
// ]`,
                },
                {
                    type: "text",
                    value: `## Listing, completing and counting

Each task is an object with two fields: title (text) and done (a boolean that starts as false). Three functions will work on that array:

- listTasks() walks through the array with for...of and shows the title of each task, marking the ones that are already done differently.
- completeTask(title) does a linear search, just like in lesson 2: it searches by title and, when it finds it, changes done to true.
- countPending() walks through the array and counts how many tasks still have done equal to false, the same counter pattern from lesson 2.`,
                },
                {
                    type: "code",
                    value: `function listTasks() {
  for (const task of tasks) {
    if (task.done) {
      console.log("[x] " + task.title);
    } else {
      console.log("[ ] " + task.title);
    }
  }
}

function completeTask(title) {
  for (const task of tasks) {
    if (task.title === title) {
      task.done = true;
      return;
    }
  }
}

listTasks();
// output:
// [ ] Study loops
// [ ] Do the functions exercise
// [ ] Review arrays and objects

completeTask("Study loops");
listTasks();
// output:
// [x] Study loops
// [ ] Do the functions exercise
// [ ] Review arrays and objects`,
                },
                {
                    type: "code",
                    value: `function countPending() {
  let pending = 0;
  for (const task of tasks) {
    if (task.done === false) {
      pending = pending + 1;
    }
  }
  return pending;
}

console.log(countPending());
// output: 2`,
                },
                {
                    type: "text",
                    value: `## You made it here

Look at the path you walked in this trail: you started by understanding what an algorithm is (a step-by-step to solve a problem), learned to store information in variables, make decisions with conditionals, repeat tasks with loops, organize logic into functions, and store collections of data in arrays and objects. In this last module, you put all that together to attack real problems, use simple algorithms on arrays, organize data and, above all, know what to do when the code does not work the first time.

That reasoning supports any language or framework you learn next. From here on, you already think and write like a programmer, even if you are still at the beginning.

From here, follow your roadmap: the next trail comes right after this one. This logic foundation supports any path, whether back-end, data science or data engineering, each applying the same reasoning to a different problem. Open your roadmap and head to the next stop; you have already built the foundation.`,
                },
                {
                    type: "quote",
                    value: `You learned to think in steps, store data, make decisions, repeat tasks, organize code into functions, and work with collections. That is programming logic, the foundation of everything that comes next. The next stop is the next trail on your roadmap.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Mini-project: a task list

Time to put together everything you learned in this trail: variables, conditionals, loops, functions and collections (lists and dictionaries). We will build, little by little, a small task manager that runs entirely in the program's memory (when the program ends, the list goes away, but that is not a problem now; the goal here is to practice the logic).

The project will have:
- a list to store the tasks (each task is a dictionary with a title and a status)
- a function to add a new task
- a function to list the tasks
- a function to mark a task as done
- a function to count how many tasks are still pending

At the end, a small menu will read your choices with input() and call those functions. Let us build it piece by piece.`,
                },
                {
                    type: "code",
                    value: `tasks = []

def add_task(title):
    new_task = {
        "title": title,
        "done": False,
    }
    tasks.append(new_task)

add_task("Study loops")
add_task("Do the functions exercise")
add_task("Review lists and dictionaries")

print(tasks)
# output:
# [
#   {'title': 'Study loops', 'done': False},
#   {'title': 'Do the functions exercise', 'done': False},
#   {'title': 'Review lists and dictionaries', 'done': False}
# ]`,
                },
                {
                    type: "text",
                    value: `## Listing, completing and counting

Each task is a dictionary with two keys: title (text) and done (a True/False value that starts as False). Three functions will work on that list:

- list_tasks() walks through the list with for and shows the title of each task, marking the ones that are already done differently.
- complete_task(title) does a linear search, just like in lesson 2: it searches by title and, when it finds it, changes done to True.
- count_pending() walks through the list and counts how many tasks still have done equal to False, the same counter pattern from lesson 2.`,
                },
                {
                    type: "code",
                    value: `def list_tasks():
    for task in tasks:
        if task["done"]:
            print("[x] " + task["title"])
        else:
            print("[ ] " + task["title"])

def complete_task(title):
    for task in tasks:
        if task["title"] == title:
            task["done"] = True
            return

list_tasks()
# output:
# [ ] Study loops
# [ ] Do the functions exercise
# [ ] Review lists and dictionaries

complete_task("Study loops")
list_tasks()
# output:
# [x] Study loops
# [ ] Do the functions exercise
# [ ] Review lists and dictionaries`,
                },
                {
                    type: "code",
                    value: `def count_pending():
    pending = 0
    for task in tasks:
        if task["done"] == False:
            pending = pending + 1
    return pending

print(count_pending())
# output: 2

# putting it all together in a program that talks to the user:
while True:
    print()
    print("1) Add  2) List  3) Complete  4) Pending  5) Exit")
    choice = input("Choose an option: ")

    if choice == "1":
        title = input("Task title: ")
        add_task(title)
    elif choice == "2":
        list_tasks()
    elif choice == "3":
        title = input("Which task to complete? ")
        complete_task(title)
    elif choice == "4":
        print("Pending tasks:", count_pending())
    elif choice == "5":
        print("See you next time!")
        break
    else:
        print("Invalid option, try again.")`,
                },
                {
                    type: "text",
                    value: `## You made it here

Look at the path you walked in this trail: you started by understanding what an algorithm is (a step-by-step to solve a problem), learned to store information in variables, make decisions with conditionals, repeat tasks with loops, organize logic into functions, and store collections of data in lists and dictionaries. In this last module, you put all that together to attack real problems, use simple algorithms on lists, organize data and, above all, know what to do when the code does not work the first time.

That reasoning supports any language or framework you learn next, and now you are practicing it in Python, one of the most used languages in the world. Keep practicing: take this mini-project and add things to it (remove a task, count the completed ones, store a due date). Every small improvement reinforces what you learned.

From here, follow your roadmap: the next trail comes right after this one. This logic foundation supports any path, whether back-end, data science or data engineering, each applying the same reasoning to a different problem. Open your roadmap and head to the next stop; you have already built the foundation.`,
                },
                {
                    type: "quote",
                    value: `You learned to think in steps, store data, make decisions, repeat tasks, organize code into functions, and work with collections. That is programming logic, the foundation of everything that comes next. The next stop is the next trail on your roadmap.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "In the task list mini-project, each task is represented as:",
                    py: "In the task list mini-project, each task is represented as:",
                },
                ops: {
                    js: {
                        "Um objeto com os campos titulo e concluida":
                            "An object with the fields title and done",
                        "Um número que representa a posição da tarefa":
                            "A number representing the position of the task",
                        "Uma string com o título da tarefa": "A string with the task's title",
                        "Um array com duas posições": "An array with two positions",
                    },
                    py: {
                        "Uma lista com duas posições": "A list with two positions",
                        "Uma string com o título da tarefa": "A string with the task's title",
                        "Um dicionário com as chaves titulo e concluida":
                            "A dictionary with the keys title and done",
                        "Um número inteiro que representa a posição da tarefa na lista":
                            "An integer representing the position of the task in the list",
                    },
                },
            },
            {
                enunciado: {
                    js: "If you call addTask three times, each time passing a different title, how many items does the tasks array end up with?",
                    py: "If you call add_task three times, each time passing a different title, how many items does the tasks list end up with?",
                },
                ops: {
                    js: {
                        "0": I("0"),
                        "1": I("1"),
                        "Depende de quantas vezes listarTarefas() foi chamada":
                            "It depends on how many times listTasks() was called",
                        "3": I("3"),
                    },
                    py: {
                        "0": I("0"),
                        "3": I("3"),
                        "Depende de quantas vezes listar_tarefas() foi chamada":
                            "It depends on how many times list_tasks() was called",
                        "1": I("1"),
                    },
                },
            },
            {
                enunciado: {
                    js: "After adding 4 tasks and completing 1 of them with completeTask, what should the countPending() function return?",
                    py: "After adding 4 tasks and completing 1 of them with complete_task, what should the count_pending() function return?",
                },
                ops: {
                    js: { "0": I("0"), "3": I("3"), "4": I("4"), "1": I("1") },
                    py: { "0": I("0"), "3": I("3"), "4": I("4"), "1": I("1") },
                },
            },
            {
                enunciado: {
                    js: "The completeTask(title) function walks through the tasks array with a for...of. What does it do when it finds a task whose title equals the received parameter?",
                    py: "The complete_task(title) function walks through the tasks list with a for. What does it do when it finds a task whose title equals the received parameter?",
                },
                ops: {
                    js: {
                        "Cria uma tarefa nova com esse mesmo título de novo":
                            "It creates a new task with that same title again",
                        "Muda o campo concluida da tarefa para true":
                            "It changes the task's done field to true",
                        "Remove essa tarefa do array": "It removes that task from the array",
                        "Imprime todas as tarefas no console": "It prints all the tasks in the console",
                    },
                    py: {
                        "Imprime todas as tarefas na tela": "It prints all the tasks on the screen",
                        "Muda a chave concluida dessa tarefa para True":
                            "It changes that task's done key to True",
                        "Cria uma tarefa nova, repetindo esse mesmo título":
                            "It creates a new task, repeating that same title",
                        "Remove essa tarefa da lista": "It removes that task from the list",
                    },
                },
            },
            {
                enunciado: {
                    js: 'If you call completeTask("Task that does not exist") with a title that is not in any task in the array, what happens?',
                    py: 'If you call complete_task("Task that does not exist") with a title that is not in any task in the list, what happens?',
                },
                ops: {
                    js: {
                        "Uma tarefa nova é criada automaticamente com esse título":
                            "A new task is automatically created with that title",
                        "Todas as tarefas do array são marcadas como concluídas":
                            "All the tasks in the array are marked as done",
                        "O laço não acha correspondência, e termina sem alterar nada":
                            "The loop finds no match and ends without changing anything",
                        "O programa quebra com um erro": "The program breaks with an error",
                    },
                    py: {
                        "Uma tarefa nova é criada automaticamente no fim da lista com esse título":
                            "A new task is automatically created at the end of the list with that title",
                        "O programa quebra com um erro": "The program breaks with an error",
                        "O laço não acha correspondência e termina sem alterar nada":
                            "The loop finds no match and ends without changing anything",
                        "Todas as tarefas da lista são marcadas como concluídas":
                            "All the tasks in the list are marked as done",
                    },
                },
            },
        ],
    },
];
