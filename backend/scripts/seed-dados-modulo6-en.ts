// Tradução em inglês do módulo 6 da Lógica de Programação (coleções). As
// variantes divergem no vocabulário inteiro (array x lista, objeto x
// dicionário, push x append, for...of x for-in, propriedade com ponto x
// colchetes), então cada aula vem por variante completa.

import type { AulaModulo2 } from "./seed-dados-modulo2-en.ts";

const I = (v: string) => v;

export const TITULO_MODULO_6 = "Module 6 - Collections: lists and objects";

export const AULAS_MODULO_6: AulaModulo2[] = [
    {
        posicao: 1,
        titulo: { js: "Arrays: storing a list of values", py: "Lists: storing a sequence of values" },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `# Arrays: storing a list of values

So far, each piece of data you wanted to store lived in a separate variable: \`let name = "Ana"\`, \`let age = 20\`. That works well for one or two values. But what if you needed to store the prices of 5 products in a shopping cart? Or the names of 30 students in a class? Creating \`price1\`, \`price2\`, \`price3\` and so on becomes a mess quickly, especially when you do not even know in advance how many values you will need to store.

For that there is the **array** (also called a list or vector): a single variable that stores several values, organized in order, one after another. Think of a row of numbered little boxes: each box stores a value, and you access any of them by their number.`,
                },
                {
                    type: "text",
                    value: `## Creating an array and the index that starts at 0

An array is created with square brackets \`[ ]\`, with the values separated by commas. You store the whole array in a variable, the same way you would store a number or a text.

Each value inside the array occupies a position called an **index**. Here is the most important detail of this module, the one that confuses beginners the most: in JavaScript, and in the vast majority of programming languages, counting positions starts at **0**, not 1. The first element is at index 0, the second at index 1, and so on.`,
                },
                {
                    type: "code",
                    value: `let prices = [10, 25, 8, 40];
let fruits = ["apple", "banana", "grape"];

console.log(prices);
// output: [ 10, 25, 8, 40 ]

console.log(fruits);
// output: [ 'apple', 'banana', 'grape' ]

// to read a value, use the array name and the index in brackets
console.log(fruits[0]); // output: apple (first element, index 0)
console.log(fruits[1]); // output: banana
console.log(fruits[2]); // output: grape (third and last element, index 2)`,
                },
                {
                    type: "table",
                    value: `[["Index","Element"],["0","apple"],["1","banana"],["2","grape"]]`,
                },
                {
                    type: "text",
                    value: `## Length and the index that does not exist

Every array has a property called \`length\`, which stores how many elements it has. Since counting starts at 0, the index of the last element is always \`length - 1\` (not \`length\`, that is a common mistake). In \`fruits\`, which has 3 elements, \`fruits.length\` is 3, and the last valid index is 2.

You can also change the value stored at a position, by assigning a new value to it with \`=\`. And if you try to access an index that does not exist in the array (for example, index 10 in a 3-position array), JavaScript does not raise an error: it returns \`undefined\`, signaling that nothing is stored there.`,
                },
                {
                    type: "code",
                    value: `let fruits = ["apple", "banana", "grape"];

console.log(fruits.length); // output: 3

// the index of the last element is always length - 1
console.log(fruits[fruits.length - 1]); // output: grape

// changing the value at position 1
fruits[1] = "pear";
console.log(fruits);
// output: [ 'apple', 'pear', 'grape' ]

// index that does not exist: no error, it returns undefined
console.log(fruits[10]); // output: undefined`,
                },
                {
                    type: "quote",
                    value: `An array is a variable that stores several values in order. You create it with \`[ ]\`, access and change each position by index, and the index always starts at 0. Trying to access a position that does not exist does not break the program: it just returns \`undefined\`.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `# Lists: storing a sequence of values

So far, each piece of data you wanted to store lived in a separate variable: \`name = "Ana"\`, \`age = 20\`. That works well for one or two values. But what if you needed to store the prices of 5 products in a shopping cart? Or the names of 30 students in a class? Creating \`price1\`, \`price2\`, \`price3\` and so on becomes a mess quickly, especially when you do not even know in advance how many values you will need to store.

For that there is the **list** (in other languages you will hear the names _array_ or _vector_ for the same idea): a single variable that stores several values, organized in order, one after another. Think of a row of numbered little boxes: each box stores a value, and you access any of them by their number.`,
                },
                {
                    type: "text",
                    value: `## Creating a list and the index that starts at 0

A list is created with square brackets \`[ ]\`, with the values separated by commas. You store the whole list in a variable, the same way you would store a number or a text.

Each value inside the list occupies a position called an **index**. Here is the most important detail of this module, the one that confuses beginners the most: in Python, and in the vast majority of programming languages, counting positions starts at **0**, not 1. The first element is at index 0, the second at index 1, and so on.`,
                },
                {
                    type: "code",
                    value: `prices = [10, 25, 8, 40]
fruits = ["apple", "banana", "grape"]

print(prices)
# output: [10, 25, 8, 40]

print(fruits)
# output: ['apple', 'banana', 'grape']

# to read a value, use the list name and the index in brackets
print(fruits[0])  # output: apple (first element, index 0)
print(fruits[1])  # output: banana
print(fruits[2])  # output: grape (third and last element, index 2)`,
                },
                {
                    type: "table",
                    value: `[["Index","Element"],["0","apple"],["1","banana"],["2","grape"]]`,
                },
                {
                    type: "text",
                    value: `## Length, negative indexes and the index that does not exist

To find out how many elements a list has, use \`len(list)\` (notice: it is \`len(list)\`, not \`list.length\` like in some other languages). Since counting starts at 0, the index of the last element is always \`len(list) - 1\` (not \`len(list)\`, that is a common mistake). In \`fruits\`, which has 3 elements, \`len(fruits)\` is 3, and the last valid index is 2.

Python also offers a very handy shortcut: **negative indexes**. \`fruits[-1]\` gets the last element, \`fruits[-2]\` gets the second to last, and so on, without you having to compute the length.

You can also change the value stored at a position, by assigning a new value to it with \`=\`. But watch out for an important difference: if you try to access an index that does not exist in the list (for example, index 10 in a 3-position list), Python **raises an error** called \`IndexError\` and stops the program. It does not silently return an empty value: it warns loud and clear that that position does not exist.`,
                },
                {
                    type: "code",
                    value: `fruits = ["apple", "banana", "grape"]

print(len(fruits))  # output: 3

# the index of the last element is always len - 1
print(fruits[len(fruits) - 1])  # output: grape

# shortcut: a negative index counts from the end
print(fruits[-1])  # output: grape (the last one)
print(fruits[-2])  # output: banana (the second to last)

# changing the value at position 1
fruits[1] = "pear"
print(fruits)
# output: ['apple', 'pear', 'grape']

# index that does not exist: raises an error (IndexError)
# print(fruits[10])  # IndexError: list index out of range`,
                },
                {
                    type: "quote",
                    value: `A list is a variable that stores several values in order. You create it with \`[ ]\`, access and change each position by index, and the index always starts at 0. Negative indexes, like \`[-1]\`, count from the end. Unlike some other languages, trying to access a position that does not exist raises an error (\`IndexError\`) and stops the program.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'Given the following code, what is the index of the first element, "blue"?\n\nlet colors = ["blue", "green", "yellow"];',
                    py: 'Given the following code, what is the index of the first element, "blue"?\n\ncolors = ["blue", "green", "yellow"]',
                },
                ops: {
                    js: { "0": I("0"), "-1": I("-1"), "3": I("3"), "1": I("1") },
                    py: { "3": I("3"), "0": I("0"), "2": I("2"), "1": I("1") },
                },
            },
            {
                enunciado: {
                    js: "Given let numbers = [10, 20, 30, 40];, what does console.log(numbers[1]) print?",
                    py: "Given numbers = [10, 20, 30, 40], what does print(numbers[1]) show on the screen?",
                },
                ops: {
                    js: { "20": I("20"), undefined: I("undefined"), "10": I("10"), "30": I("30") },
                    py: { "20": I("20"), "10": I("10"), "30": I("30"), "40": I("40") },
                },
            },
            {
                enunciado: {
                    js: 'Given let letters = ["a", "b", "c"];, what does console.log(letters[3]) print?',
                    py: 'Given letters = ["a", "b", "c"], what happens when you run print(letters[3])?',
                },
                ops: {
                    js: {
                        '"c", porque é sempre o último elemento do array':
                            '"c", because it is always the last element of the array',
                        "undefined, pois o índice 3 não existe no array":
                            "undefined, because index 3 does not exist in the array",
                        'Uma string vazia "", padrão para índices inválidos':
                            'An empty string "", the default for invalid indexes',
                        "Um erro de sintaxe, e o programa para de rodar":
                            "A syntax error, and the program stops running",
                    },
                    py: {
                        'Imprime "c", porque o índice sempre volta para o último elemento':
                            'It prints "c", because the index always wraps around to the last element',
                        "Gera um erro (IndexError), pois o índice 3 não existe na lista":
                            "It raises an error (IndexError), because index 3 does not exist in the list",
                        "Imprime None, o valor padrão para posições que não existem":
                            "It prints None, the default value for positions that do not exist",
                        'Imprime uma string vazia ""': 'It prints an empty string ""',
                    },
                },
            },
            {
                enunciado: {
                    js: "An array tasks has 5 elements. What is the index of the last element?",
                    py: "A list tasks has 5 elements. Counting from zero, what is the index of the last element?",
                },
                ops: {
                    js: { "4": I("4"), "0": I("0"), "6": I("6"), "5": I("5") },
                    py: { "5": I("5"), "6": I("6"), "4": I("4"), "0": I("0") },
                },
            },
            {
                enunciado: {
                    js: "What is the output of this code?\n\nlet list = [5, 12, 8, 21];\nlist[3] = 100;\nconsole.log(list[list.length - 1]);",
                    py: "What is the output of this code?\n\nlist = [5, 12, 8, 21]\nlist[3] = 100\nprint(list[len(list) - 1])",
                },
                ops: {
                    js: { "21": I("21"), "100": I("100"), undefined: I("undefined"), "8": I("8") },
                    py: { "8": I("8"), "21": I("21"), "100": I("100"), "Um erro (IndexError)": "An error (IndexError)" },
                },
            },
        ],
    },
    {
        posicao: 2,
        titulo: {
            js: "Changing the array: adding, removing and the length",
            py: "Changing the list: adding, removing and the length",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Arrays are not fixed: they grow and shrink

One of the most useful things about an array is that it does not have a fixed size. You can start with an empty list and add items as the program runs, like a shopping list that grows while you note down what is missing at the market. You can also remove items, like when you cross out an item you already bought.

JavaScript has ready-made methods for that, called with a dot after the array name: \`array.method()\`. The first one is \`push\`, which adds one or more values at the **end** of the array, making it grow.`,
                },
                {
                    type: "code",
                    value: `let tasks = ["study", "have lunch"];
console.log(tasks);
// output: [ 'study', 'have lunch' ]

tasks.push("work out");
console.log(tasks);
// output: [ 'study', 'have lunch', 'work out' ]
console.log(tasks.length); // output: 3

// you can add more than one value at a time
tasks.push("sleep", "repeat");
console.log(tasks);
// output: [ 'study', 'have lunch', 'work out', 'sleep', 'repeat' ]
console.log(tasks.length); // output: 5`,
                },
                {
                    type: "text",
                    value: `## pop: removing from the end

\`pop\` does the opposite of \`push\`: it removes the **last** element of the array and returns that removed value, making the array shrink by one position. If the array is already empty, \`pop\` does not break the program, it just returns \`undefined\`.`,
                },
                {
                    type: "code",
                    value: `let tasks = ["study", "have lunch", "work out"];

let last = tasks.pop();
console.log(last); // output: work out (the value that was removed)
console.log(tasks);
// output: [ 'study', 'have lunch' ]
console.log(tasks.length); // output: 2

let empty = [];
console.log(empty.pop()); // output: undefined (nothing to remove)`,
                },
                {
                    type: "text",
                    value: `## unshift and shift: working on the start

There are two similar methods that work on the **beginning** of the array instead of the end: \`unshift\` adds one or more values at the start, and \`shift\` removes and returns the first value. They work like \`push\` and \`pop\`, but from the other end of the line. They are much less used in daily life than \`push\` and \`pop\`, but it is worth knowing they exist.`,
                },
                {
                    type: "table",
                    value: `[["Method","What it does","Where it acts"],["push(value)","Adds one or more values","At the end"],["pop()","Removes and returns the last value","At the end"],["unshift(value)","Adds one or more values","At the start"],["shift()","Removes and returns the first value","At the start"]]`,
                },
                {
                    type: "quote",
                    value: `Arrays have no fixed size: push adds at the end, pop removes from the end, and length always reflects the current size. unshift and shift do the same thing, but at the start of the array.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Lists are not fixed: they grow and shrink

One of the most useful things about a list is that it does not have a fixed size. You can start with an empty list and add items as the program runs, like a shopping list that grows while you note down what is missing at the market. You can also remove items, like when you cross out an item you already bought.

Python has ready-made methods for that, called with a dot after the list name: \`list.method()\`. The first one is \`append\`, which adds a value at the **end** of the list, making it grow. One difference from other languages: \`append\` adds **one** item at a time. When you want to join several at once, use \`extend\`, passing a list with the new values.`,
                },
                {
                    type: "code",
                    value: `tasks = ["study", "have lunch"]
print(tasks)
# output: ['study', 'have lunch']

tasks.append("work out")
print(tasks)
# output: ['study', 'have lunch', 'work out']
print(len(tasks))  # output: 3

# append adds one item; for several at once, use extend with a list
tasks.extend(["sleep", "repeat"])
print(tasks)
# output: ['study', 'have lunch', 'work out', 'sleep', 'repeat']
print(len(tasks))  # output: 5`,
                },
                {
                    type: "text",
                    value: `## pop: removing from the end

\`pop\` does the opposite of \`append\`: it removes the **last** element of the list and returns that removed value, making the list shrink by one position. Storing that value in a variable is useful when you want to use the item that left. One caution: if the list is already empty, \`pop()\` **raises an error** (\`IndexError\`), because there is nothing to remove. Unlike some languages that return an empty value in that case, Python warns with an error.`,
                },
                {
                    type: "code",
                    value: `tasks = ["study", "have lunch", "work out"]

last = tasks.pop()
print(last)  # output: work out (the value that was removed)
print(tasks)
# output: ['study', 'have lunch']
print(len(tasks))  # output: 2

# on an empty list, pop raises an error (IndexError), it does not return None
empty = []
# empty.pop()  # IndexError: pop from empty list`,
                },
                {
                    type: "text",
                    value: `## insert(0) and pop(0): working on the start

What if you want to work on the **beginning** of the list, not the end? Python does not have methods with their own names for that (like some languages do), but solves it with the same methods you already know, passing position 0.

To add at the start, use \`list.insert(0, value)\`: the \`0\` says which position the new value goes into, and everything else shifts one slot to the right. For example, \`colors.insert(0, "red")\` puts "red" in front of everything. To remove the first element, use \`list.pop(0)\`: just like \`pop()\` without a number takes the last one, \`pop(0)\` takes and returns the first. In practice, working on the end (with \`append\` and \`pop()\`) is much more common than working on the start, but it is worth knowing both are possible.`,
                },
                {
                    type: "table",
                    value: `[["Method","What it does","Where it acts"],["append(value)","Adds one value","At the end"],["pop()","Removes and returns the last value","At the end"],["insert(0, value)","Adds one value","At the start"],["pop(0)","Removes and returns the first value","At the start"]]`,
                },
                {
                    type: "quote",
                    value: `Lists have no fixed size: \`append\` adds one item at the end, \`pop()\` removes and returns the last one, and \`len(list)\` always reflects the current size. To join several at once use \`extend\`, and to work on the start use \`insert(0, value)\` and \`pop(0)\`.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "Given let list = [1, 2, 3]; list.push(4);, what is the value of list.length after this code?",
                    py: "What is the correct way to add the value 4 at the end of the list numbers in Python?",
                },
                ops: {
                    js: { "4": I("4"), "3": I("3"), undefined: I("undefined"), "5": I("5") },
                    py: {
                        "numeros.insert(4)": "numbers.insert(4)",
                        "numeros.append(4)": "numbers.append(4)",
                        "numeros.add(4)": "numbers.add(4)",
                        "numeros.push(4)": "numbers.push(4)",
                    },
                },
            },
            {
                enunciado: {
                    js: "What does the pop() method do on an array?",
                    py: "What does the pop() method do on a list (when called without a number)?",
                },
                ops: {
                    js: {
                        "Remove e devolve o primeiro elemento do array":
                            "Removes and returns the first element of the array",
                        "Apaga todos os elementos do array": "Erases all the elements of the array",
                        "Remove e devolve o último elemento do array":
                            "Removes and returns the last element of the array",
                        "Adiciona um elemento no final do array":
                            "Adds an element at the end of the array",
                    },
                    py: {
                        "Adiciona um elemento no fim da lista":
                            "Adds an element at the end of the list",
                        "Remove e devolve o último elemento da lista":
                            "Removes and returns the last element of the list",
                        "Remove e devolve o primeiro elemento da lista":
                            "Removes and returns the first element of the list",
                        "Apaga todos os elementos da lista":
                            "Erases all the elements of the list",
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the output of this code?\n\nlet numbers = [5, 10];\nnumbers.push(15);\nlet removed = numbers.pop();\nconsole.log(removed);",
                    py: "What is the output of this code?\n\nnumbers = [5, 10]\nnumbers.append(15)\nremoved = numbers.pop()\nprint(removed)",
                },
                ops: {
                    js: { "5": I("5"), "[5, 10]": I("[5, 10]"), "15": I("15"), "10": I("10") },
                    py: { "[5, 10]": I("[5, 10]"), "5": I("5"), "10": I("10"), "15": I("15") },
                },
            },
            {
                enunciado: {
                    js: 'After running let colors = ["blue", "green"]; colors.unshift("red");, what is the value of colors[0]?',
                    py: 'After running colors = ["blue", "green"] and colors.insert(0, "red"), what is the value of colors[0]?',
                },
                ops: {
                    js: { '"azul"': '"blue"', '"verde"': '"green"', undefined: I("undefined"), '"vermelho"': '"red"' },
                    py: { None: I("None"), '"azul"': '"blue"', '"verde"': '"green"', '"vermelho"': '"red"' },
                },
            },
            {
                enunciado: {
                    js: "What is the output of this code?\n\nlet stack = [10, 20, 30];\nstack.pop();\nstack.push(40, 50);\nconsole.log(stack[stack.length - 1]);",
                    py: "What is the output of this code?\n\nstack = [10, 20, 30]\nstack.pop()\nstack.extend([40, 50])\nprint(stack[len(stack) - 1])",
                },
                ops: {
                    js: { "20": I("20"), "30": I("30"), "50": I("50"), "40": I("40") },
                    py: { "20": I("20"), "50": I("50"), "40": I("40"), "30": I("30") },
                },
            },
        ],
    },
    {
        posicao: 3,
        titulo: {
            js: "Walking through arrays (for and for...of)",
            py: "Walking through lists (for and for-in)",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Why walk through an array

You already know how to use \`for\` and \`while\` to repeat an action several times (module 4). Now that the data lives inside an array, the most common repetition in a programmer's daily life is: going through each element of the array, one at a time, to read, add, count or check something. That is called **iterating** over the array.

You could write \`arr[0]\`, \`arr[1]\`, \`arr[2]\`... by hand, but that only works if you know exactly how many elements there are, and it becomes unfeasible if the array has 1000 positions. That is what a loop is for.

## Classic for: walking through by index

The most traditional way is to use a \`for\` with a counter \`i\` that starts at 0 and goes up to the last valid index, which is \`length - 1\`. That is why the loop condition uses \`i < arr.length\` (less than the length, not less than or equal, otherwise you would try to access a position that does not exist).`,
                },
                {
                    type: "code",
                    value: `let fruits = ["apple", "banana", "grape"];

for (let i = 0; i < fruits.length; i++) {
  console.log(i + ": " + fruits[i]);
}
// output:
// 0: apple
// 1: banana
// 2: grape`,
                },
                {
                    type: "text",
                    value: `## for...of: walking through without worrying about the index

Many times you only want the value of each element, without needing the index. For those cases, JavaScript has a simpler loop version, \`for...of\`, which hands you each value of the array directly, one at a time, without you having to write \`arr[i]\`.`,
                },
                {
                    type: "code",
                    value: `let fruits = ["apple", "banana", "grape"];

for (let fruit of fruits) {
  console.log(fruit);
}
// output:
// apple
// banana
// grape`,
                },
                {
                    type: "text",
                    value: `## Adding and counting elements of an array

Remember the accumulator from the loops module, that variable that keeps a running total as the loop repeats? With arrays, the pattern is the same: you create a variable outside the loop (the accumulator, starting at 0), and on each pass you add or check the value at that position.`,
                },
                {
                    type: "code",
                    value: `let prices = [10, 25, 8, 40];

// adding up all the prices
let total = 0;
for (let price of prices) {
  total = total + price;
}
console.log(total); // output: 83

// counting how many prices are greater than 10
let howMany = 0;
for (let price of prices) {
  if (price > 10) {
    howMany = howMany + 1;
  }
}
console.log(howMany); // output: 2`,
                },
                {
                    type: "quote",
                    value: `To walk through an array, use for when you need the index (for example, to number the items or compare positions) and for...of when you only need the value of each element. The accumulator pattern, a variable that adds or counts on each pass, works the same inside an array.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Why walk through a list

You already know how to use \`for\` and \`while\` to repeat an action several times (module 4). Now that the data lives inside a list, the most common repetition in a programmer's daily life is: going through each element of the list, one at a time, to read, add, count or check something. That is called **iterating** over the list.

You could write \`list[0]\`, \`list[1]\`, \`list[2]\`... by hand, but that only works if you know exactly how many elements there are, and it becomes unfeasible if the list has 1000 positions. That is what a loop is for.

## for with range: walking through by index

One way to walk through is to use a counter \`i\` that goes through all the valid indexes. In Python, that is done with \`range(len(list))\`, which generates the numbers from 0 up to the last index: for a list of 3 elements, \`range(len(list))\` produces 0, 1 and 2. Notice that \`range\` **stops before** the length (it never reaches 3), which is exactly the index that does not exist. Inside the loop, you access each value with \`list[i]\`.`,
                },
                {
                    type: "code",
                    value: `fruits = ["apple", "banana", "grape"]

for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")
# output:
# 0: apple
# 1: banana
# 2: grape`,
                },
                {
                    type: "text",
                    value: `## for-in: walking through directly by value

Many times you only want the value of each element, without worrying about the index. For those cases, Python has a simpler, more direct form: \`for item in list:\`, which hands you each value of the list, one at a time, without you having to write \`list[i]\`. In practice, that is the most common and most natural way to walk through a list in Python.

And when you need the index **and** the value at the same time? That is where \`enumerate\` comes in, which on each pass hands you both together: \`for i, item in enumerate(list):\`.`,
                },
                {
                    type: "code",
                    value: `fruits = ["apple", "banana", "grape"]

# when I only need the value, I use for-in directly
for fruit in fruits:
    print(fruit)
# output:
# apple
# banana
# grape

# when I need the index AND the value, I use enumerate
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
# output:
# 0: apple
# 1: banana
# 2: grape`,
                },
                {
                    type: "text",
                    value: `## Adding and counting elements of a list

Remember the accumulator from the loops module, that variable that keeps a running total as the loop repeats? With lists, the pattern is the same: you create a variable outside the loop (the accumulator, starting at 0) and, on each pass, add or check the value of that element.`,
                },
                {
                    type: "code",
                    value: `prices = [10, 25, 8, 40]

# adding up all the prices
total = 0
for price in prices:
    total = total + price
print(total)  # output: 83

# counting how many prices are greater than 10
how_many = 0
for price in prices:
    if price > 10:
        how_many = how_many + 1
print(how_many)  # output: 2`,
                },
                {
                    type: "quote",
                    value: `To walk through a list, use \`for item in list:\` when you only need the value (the most common form), and \`range(len(list))\` or \`enumerate(list)\` when you also need the index. The accumulator pattern, a variable that adds or counts on each pass, works the same inside a list.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "In the classic for for (let i = 0; i < arr.length; i++), with which value does the variable i start?",
                    py: "In the loop for i in range(len(list)), with which value does the variable i start?",
                },
                ops: {
                    js: { "-1": I("-1"), "arr.length": I("arr.length"), "1": I("1"), "0": I("0") },
                    py: { "3": I("3"), "0": I("0"), "1": I("1"), "len(lista)": "len(list)" },
                },
            },
            {
                enunciado: {
                    js: "Which code below correctly walks through the array numbers, printing each value, using for...of?",
                    py: "Which code below correctly walks through the list numbers, printing each value?",
                },
                ops: {
                    js: {
                        "for (let i = 0; i of numeros; i++) { console.log(i); }":
                            "for (let i = 0; i of numbers; i++) { console.log(i); }",
                        "for (let n of numeros.length) { console.log(n); }":
                            "for (let n of numbers.length) { console.log(n); }",
                        "for (let n of numeros) { console.log(n); }":
                            "for (let n of numbers) { console.log(n); }",
                        "for of (let n numeros) { console.log(n); }":
                            "for of (let n numbers) { console.log(n); }",
                    },
                    py: {
                        "for n of numeros:\n    print(n)": "for n of numbers:\n    print(n)",
                        "for n in numeros:\n    print(n)": "for n in numbers:\n    print(n)",
                        "for n in numeros.length:\n    print(n)":
                            "for n in numbers.length:\n    print(n)",
                        "foreach n in numeros:\n    print(n)":
                            "foreach n in numbers:\n    print(n)",
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the output of this code?\n\n```javascript\nlet numbers = [3, 6, 9];\nlet total = 0;\nfor (let n of numbers) {\n  total = total + n;\n}\nconsole.log(total);\n```",
                    py: "What is the output of this code?\n\n```python\nnumbers = [3, 6, 9]\ntotal = 0\nfor n in numbers:\n    total = total + n\nprint(total)\n```",
                },
                ops: {
                    js: { "9": I("9"), "3": I("3"), "18": I("18"), "0": I("0") },
                    py: { "9": I("9"), "18": I("18"), "3": I("3"), "0": I("0") },
                },
            },
            {
                enunciado: {
                    js: "In an array with 6 elements, what is the correct condition for a classic for to walk through all of them using i as the index?",
                    py: "A list has 6 elements. Which loop walks through ALL of them by index, without skipping any and without going out of range?",
                },
                ops: {
                    js: {
                        "i <= arr.length": I("i <= arr.length"),
                        "i < arr.length": I("i < arr.length"),
                        "i < arr.length - 1": I("i < arr.length - 1"),
                        "i > 0": I("i > 0"),
                    },
                    py: {
                        "for i in range(1, len(lista)):": "for i in range(1, len(list)):",
                        "for i in range(len(lista)):": "for i in range(len(list)):",
                        "for i in range(len(lista) + 1):": "for i in range(len(list) + 1):",
                        "for i in range(len(lista) - 1):": "for i in range(len(list) - 1):",
                    },
                },
            },
            {
                enunciado: {
                    js: "What is the output of this code?\n\n```javascript\nlet ages = [15, 22, 17, 30, 16];\nlet minors = 0;\nfor (let i = 0; i < ages.length; i++) {\n  if (ages[i] < 18) {\n    minors = minors + 1;\n  }\n}\nconsole.log(minors);\n```",
                    py: "What is the output of this code?\n\n```python\nages = [15, 22, 17, 30, 16]\nminors = 0\nfor i in range(len(ages)):\n    if ages[i] < 18:\n        minors = minors + 1\nprint(minors)\n```",
                },
                ops: {
                    js: { "5": I("5"), "3": I("3"), "2": I("2"), "18": I("18") },
                    py: { "5": I("5"), "2": I("2"), "18": I("18"), "3": I("3") },
                },
            },
        ],
    },
    {
        posicao: 4,
        titulo: {
            js: "Objects: describing a thing with key and value",
            py: "Dictionaries: describing a thing with key and value",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Describing one single thing, with several pieces of information

The array is great for storing a list of similar values: prices, names, tasks. But what about when you need to describe **one single thing**, with several different pieces of information? For example, a person has a name, an age and a city. You could use an array, \`["Ana", 20, "São Paulo"]\`, but then you would have to memorize that position 0 is the name, 1 is the age and 2 is the city. That is fragile: one day you swap the order by accident and the whole program breaks.

For that there is the **object**: a collection of information identified by **name**, not by position. Each piece of information is a **key and value** pair: the key is the name of the information, and the value is its content. An object is created with braces \`{ }\`, and each pair is written as \`key: value\`, separated from the next pair by a comma.`,
                },
                {
                    type: "code",
                    value: `let person = {
  name: "Ana",
  age: 20,
  city: "São Paulo"
};

console.log(person);
// output: { name: 'Ana', age: 20, city: 'São Paulo' }`,
                },
                {
                    type: "text",
                    value: `## Accessing a property: dot or brackets

Each key-value pair of an object is called a **property**. There are two ways to read the value of a property: with a dot (\`object.key\`), the most common and easiest to read, or with brackets and the key name in quotes (\`object["key"]\`), useful when the key name is stored inside a variable.`,
                },
                {
                    type: "code",
                    value: `let person = {
  name: "Ana",
  age: 20
};

// two ways to read the same property
console.log(person.name); // output: Ana
console.log(person["age"]); // output: 20

// changing an existing value
person.age = 21;

// creating a new property
person.city = "Recife";

console.log(person);
// output: { name: 'Ana', age: 21, city: 'Recife' }`,
                },
                {
                    type: "text",
                    value: `## Array or object: which one to use?

That is the main point for not mixing up the two. An **array** is an ordered list, where each value has a numeric position (0, 1, 2...) and normally all the values are the same kind of thing (a list of prices, a list of names). An **object** describes one single thing, with named properties and no defined order: each piece of information has a name that says what it is (name, age, city).`,
                },
                {
                    type: "table",
                    value: `[["","Array","Object"],["How you create it","[ ]","{ }"],["Each position or property has","A numeric index (0, 1, 2...)","A name (key)"],["How you access a value","arr[0]","obj.key or obj[\\"key\\"]"],["Most used for","A list of similar values","Describing something with several details"]]`,
                },
                {
                    type: "quote",
                    value: `An object stores information about one single thing, using key and value pairs. You access and change each property by its name, with a dot or brackets, not by a numeric index. Use an array for a list of similar values, and an object to describe something with several different characteristics.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Describing one single thing, with several pieces of information

The list is great for storing a sequence of similar values: prices, names, tasks. But what about when you need to describe **one single thing**, with several different pieces of information? For example, a person has a name, an age and a city. You could use a list, \`["Ana", 20, "São Paulo"]\`, but then you would have to memorize that position 0 is the name, 1 is the age and 2 is the city. That is fragile: one day you swap the order by accident and the whole program breaks.

For that there is the **dictionary**: a collection of information identified by **name**, not by position. Each piece of information is a **key and value** pair: the key is the name of the information, and the value is its content. A dictionary is created with braces \`{ }\`, and each pair is written as \`"key": value\`. Notice that, in Python, the key is always written in quotes.`,
                },
                {
                    type: "code",
                    value: `person = {
    "name": "Ana",
    "age": 20,
    "city": "São Paulo"
}

print(person)
# output: {'name': 'Ana', 'age': 20, 'city': 'São Paulo'}`,
                },
                {
                    type: "text",
                    value: `## Accessing a value: brackets with the key

Each key-value pair of a dictionary is an **entry**. To read the value of a key, you use brackets with the key name in quotes: \`dictionary["key"]\`. If the key name is stored in a variable, it also works: \`key = "name"\` and then \`person[key]\`.

There is one important caution: if you ask for a key that **does not exist** with brackets, Python raises an error (\`KeyError\`). When you are not sure the key exists, use the \`.get("key")\` method, which returns \`None\` instead of breaking the program.`,
                },
                {
                    type: "code",
                    value: `person = {
    "name": "Ana",
    "age": 20
}

# accessing a value by the key, in brackets and quotes
print(person["name"])   # output: Ana
print(person["age"])    # output: 20

# changing an existing value
person["age"] = 21

# creating a new key
person["city"] = "Recife"

print(person)
# output: {'name': 'Ana', 'age': 21, 'city': 'Recife'}

# key that does not exist: .get returns None instead of raising an error
print(person.get("phone"))  # output: None`,
                },
                {
                    type: "text",
                    value: `## List or dictionary: which one to use?

That is the main point for not mixing up the two. A **list** is an ordered sequence, where each value has a numeric position (0, 1, 2...) and normally all the values are the same kind of thing (a list of prices, a list of names). A **dictionary** describes one single thing, with named keys: each piece of information has a name that says what it is (name, age, city).`,
                },
                {
                    type: "table",
                    value: `[["","List","Dictionary"],["How you create it","[ ]","{ }"],["Each item has","A numeric index (0, 1, 2...)","A named key, in quotes"],["How you access a value","list[0]","dictionary[\\"key\\"]"],["Most used for","A sequence of similar values","Describing something with several details"]]`,
                },
                {
                    type: "quote",
                    value: `A dictionary stores information about one single thing, using key and value pairs. You access and change each value by the key, always in brackets and quotes (\`dictionary["key"]\`), not by a numeric index. Use a list for a sequence of similar values, and a dictionary to describe something with several different characteristics.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'Given let student = { name: "Carlos", age: 17 };, what does console.log(student.age) print?',
                    py: 'Given student = {"name": "Carlos", "age": 17}, what does print(student["age"]) show on the screen?',
                },
                ops: {
                    js: { undefined: I("undefined"), '"Carlos"': I('"Carlos"'), '"idade"': '"age"', "17": I("17") },
                    py: { '"Carlos"': I('"Carlos"'), '"idade"': '"age"', "17": I("17"), None: I("None") },
                },
            },
            {
                enunciado: {
                    js: "What is the correct way to create an empty object in JavaScript?",
                    py: "What is the correct way to create an empty dictionary in Python?",
                },
                ops: {
                    js: {
                        "let obj = [];": "let obj = [];",
                        "let obj = {};": "let obj = {};",
                        "let obj = ();": "let obj = ();",
                        "let obj = (());": "let obj = (());",
                    },
                    py: { 'obj = ()': I("obj = ()"), 'obj = []': I("obj = []"), 'obj = ""': I('obj = ""'), 'obj = {}': I("obj = {}") },
                },
            },
            {
                enunciado: {
                    js: 'Given let product = { name: "Notebook", price: 15 };, which code reads the value of the price property using brackets?',
                    py: 'Given product = {"name": "Notebook", "price": 15}, which code reads the value of the price key?',
                },
                ops: {
                    js: {
                        'produto["preco"]': 'product["price"]',
                        "produto{preco}": "product{price}",
                        "produto.[preco]": "product.[price]",
                        "produto(preco)": "product(price)",
                    },
                    py: {
                        "produto.preco": "product.price",
                        'produto["preco"]': 'product["price"]',
                        "produto{preco}": "product{price}",
                        "produto(preco)": "product(price)",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code?\n\nlet car = { model: "Beetle", year: 1975 };\ncar.year = 1980;\nconsole.log(car.year);',
                    py: 'What is the output of this code?\n\ncar = {"model": "Beetle", "year": 1975}\ncar["year"] = 1980\nprint(car["year"])',
                },
                ops: {
                    js: { "1975": I("1975"), '"Fusca"': '"Beetle"', undefined: I("undefined"), "1980": I("1980") },
                    py: { "1980": I("1980"), None: I("None"), "1975": I("1975"), '"Fusca"': '"Beetle"' },
                },
            },
            {
                enunciado: {
                    js: "What is the main difference between an array and an object in JavaScript?",
                    py: "What is the main difference between a list and a dictionary in Python?",
                },
                ops: {
                    js: {
                        "Array e objeto são a mesma coisa, só muda a forma de escrever":
                            "An array and an object are the same thing, only the way of writing changes",
                        "Array usa posições numeradas; objeto usa chaves nomeadas como propriedade":
                            "An array uses numbered positions; an object uses named keys as properties",
                        "Objeto só pode ter uma única propriedade, mas array pode ter várias posições":
                            "An object can only have a single property, but an array can have several positions",
                        "Array só pode guardar números, e objeto só pode guardar textos":
                            "An array can only store numbers, and an object can only store texts",
                    },
                    py: {
                        "A lista só guarda números, e o dicionário só guarda textos":
                            "A list can only store numbers, and a dictionary only texts",
                        "O dicionário só pode ter uma chave, mas a lista pode ter vários índices":
                            "A dictionary can only have one key, but a list can have several indexes",
                        "Lista e dicionário são a mesma coisa, só muda a forma de escrever":
                            "A list and a dictionary are the same thing, only the way of writing changes",
                        "A lista usa posições numeradas; o dicionário usa chaves com nome":
                            "A list uses numbered positions; a dictionary uses named keys",
                    },
                },
            },
        ],
    },
    {
        posicao: 5,
        titulo: {
            js: "Array of objects: a list of records",
            py: "List of dictionaries: a list of records",
        },
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Putting it all together: a list of records

You already know how to store several similar values in an array, and how to describe one single thing with several pieces of information using an object. Now comes the combination most used in practice, and the one closest to what you will find in back-end work: an **array of objects**, a list where each position is a complete object.

Think about a to-do list: you do not want just the titles (an array of texts), you want, for each task, to also know whether it is already done. The solution is an array where each element is an object with the properties \`title\` and \`done\`. Notice that this looks like a spreadsheet: each position of the array is a row, and each property of the object is a column. That is the same mental model you will use later on, when working with records coming from a database.`,
                },
                {
                    type: "code",
                    value: `let tasks = [
  { title: "study JavaScript", done: true },
  { title: "wash the dishes", done: false },
  { title: "exercise", done: true },
  { title: "read a book", done: false }
];

console.log(tasks.length); // output: 4
console.log(tasks[0]); // output: { title: 'study JavaScript', done: true }
console.log(tasks[0].title); // output: study JavaScript`,
                },
                {
                    type: "text",
                    value: `## Walking through the array of objects

To walk through an array of objects, the \`for...of\` you already know works perfectly: on each pass, the variable receives a whole object, and you read its properties with a dot, just like you did with loose objects.`,
                },
                {
                    type: "code",
                    value: `let tasks = [
  { title: "study JavaScript", done: true },
  { title: "wash the dishes", done: false },
  { title: "exercise", done: true },
  { title: "read a book", done: false }
];

for (let task of tasks) {
  console.log(task.title + " - done: " + task.done);
}
// output:
// study JavaScript - done: true
// wash the dishes - done: false
// exercise - done: true
// read a book - done: false`,
                },
                {
                    type: "text",
                    value: `## Searching and counting inside the array of objects

Combining the loop with the \`if\` you already know from the conditionals module, you can answer questions about the list: how many tasks are done? Is there a task with a specific title? The pattern is always the same: walk through the array and, on each pass, check a condition using the properties of the current object.`,
                },
                {
                    type: "code",
                    value: `let tasks = [
  { title: "study JavaScript", done: true },
  { title: "wash the dishes", done: false },
  { title: "exercise", done: true },
  { title: "read a book", done: false }
];

// counting how many tasks are done
let totalDone = 0;
for (let task of tasks) {
  if (task.done === true) {
    totalDone = totalDone + 1;
  }
}
console.log(totalDone); // output: 2

// searching for a task by title
let search = "wash the dishes";
for (let task of tasks) {
  if (task.title === search) {
    console.log("found, done: " + task.done);
  }
}
// output: found, done: false`,
                },
                {
                    type: "quote",
                    value: `An array of objects is a list of records: each position is an object with its own properties. To work with it, walk through with for...of and, inside the loop, read the properties with a dot. Adding an if to the repetition is how you count, filter or search inside the list.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Putting it all together: a list of records

You already know how to store several similar values in a list, and how to describe one single thing with several pieces of information using a dictionary. Now comes the combination most used in practice, and the one closest to what you will find in back-end work: a **list of dictionaries**, a list where each position is a complete dictionary.

Think about a to-do list: you do not want just the titles (a list of texts), you want, for each task, to also know whether it is already done. The solution is a list where each element is a dictionary with the keys \`title\` and \`done\`. Notice that this looks like a spreadsheet: each position of the list is a row, and each key of the dictionary is a column. That is the same mental model you will use later on, when working with records coming from a database.`,
                },
                {
                    type: "code",
                    value: `tasks = [
    {"title": "study Python", "done": True},
    {"title": "wash the dishes", "done": False},
    {"title": "exercise", "done": True},
    {"title": "read a book", "done": False}
]

print(len(tasks))           # output: 4
print(tasks[0])             # output: {'title': 'study Python', 'done': True}
print(tasks[0]["title"])    # output: study Python`,
                },
                {
                    type: "text",
                    value: `## Walking through the list of dictionaries

To walk through a list of dictionaries, the \`for item in list:\` you already know works perfectly: on each pass, the variable receives a whole dictionary, and you read its values by the keys, in brackets, just like you did with loose dictionaries.`,
                },
                {
                    type: "code",
                    value: `tasks = [
    {"title": "study Python", "done": True},
    {"title": "wash the dishes", "done": False},
    {"title": "exercise", "done": True},
    {"title": "read a book", "done": False}
]

for task in tasks:
    print(f"{task['title']} - done: {task['done']}")
# output:
# study Python - done: True
# wash the dishes - done: False
# exercise - done: True
# read a book - done: False`,
                },
                {
                    type: "text",
                    value: `## Searching and counting inside the list

Combining the loop with the \`if\` you already know from the conditionals module, you can answer questions about the list: how many tasks are done? Is there a task with a specific title? The pattern is always the same: walk through the list and, on each pass, check a condition using the keys of the current dictionary.`,
                },
                {
                    type: "code",
                    value: `tasks = [
    {"title": "study Python", "done": True},
    {"title": "wash the dishes", "done": False},
    {"title": "exercise", "done": True},
    {"title": "read a book", "done": False}
]

# counting how many tasks are done
total_done = 0
for task in tasks:
    if task["done"]:
        total_done = total_done + 1
print(total_done)  # output: 2

# searching for a task by title
search = "wash the dishes"
for task in tasks:
    if task["title"] == search:
        print(f"found, done: {task['done']}")
# output: found, done: False`,
                },
                {
                    type: "quote",
                    value: `A list of dictionaries is a list of records: each position is a dictionary with its own keys. To work with it, walk through with \`for item in list:\` and, inside the loop, read the values by the keys in brackets. Adding an \`if\` to the repetition is how you count, filter or search inside the list.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: 'Given let tasks = [{ title: "study", done: true }, { title: "run", done: false }];, what does tasks[0].title return?',
                    py: 'Given tasks = [{"title": "study", "done": True}, {"title": "run", "done": False}], what does tasks[0]["title"] return?',
                },
                ops: {
                    js: { '"estudar"': '"study"', true: I("true"), undefined: I("undefined"), '"correr"': '"run"' },
                    py: { None: I("None"), '"estudar"': '"study"', True: I("True"), '"correr"': '"run"' },
                },
            },
            {
                enunciado: {
                    js: "In an array of objects, what does each position of the array represent?",
                    py: "In a list of dictionaries, what does each position of the list represent?",
                },
                ops: {
                    js: {
                        "O nome de uma variável usada no array":
                            "The name of a variable used in the array",
                        "Um único valor numérico, sempre um índice do array":
                            "A single numeric value, always an index of the array",
                        "Um objeto completo, com propriedades próprias":
                            "A complete object, with its own properties",
                        "Sempre um texto entre aspas": "Always a text in quotes",
                    },
                    py: {
                        "Um dicionário completo, com suas próprias chaves":
                            "A complete dictionary, with its own keys",
                        "O nome de uma variável usada na lista":
                            "The name of a variable used in the list",
                        "Um único valor numérico, sempre um índice da lista":
                            "A single numeric value, always an index of the list",
                        "Sempre um texto entre aspas": "Always a text in quotes",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code?\n\n```javascript\nlet items = [{ name: "pen", price: 2 }, { name: "notebook", price: 15 }];\nlet total = 0;\nfor (let item of items) {\n  total = total + item.price;\n}\nconsole.log(total);\n```',
                    py: 'What is the output of this code?\n\n```python\nitems = [{"name": "pen", "price": 2}, {"name": "notebook", "price": 15}]\ntotal = 0\nfor item in items:\n    total = total + item["price"]\nprint(total)\n```',
                },
                ops: {
                    js: { "17": I("17"), "15": I("15"), "2": I("2"), undefined: I("undefined") },
                    py: { "2": I("2"), "15": I("15"), "17": I("17"), None: I("None") },
                },
            },
            {
                enunciado: {
                    js: "What is the correct way to count how many tasks are done in an array of objects tasks, each with the done property (true or false)?",
                    py: "What is the correct way to count how many tasks are done in a list of dictionaries tasks, each with the done key (True or False)?",
                },
                ops: {
                    js: {
                        "Usar tarefas.pop() até o array ficar vazio e contar quantas vezes isso aconteceu":
                            "Use tasks.pop() until the array is empty and count how many times that happened",
                        "Somar todos os valores de tarefas.length":
                            "Add up all the values of tasks.length",
                        "Percorrer com for...of e somar 1 ao contador quando concluida for true":
                            "Walk through with for...of and add 1 to the counter when done is true",
                        "Comparar tarefas[0] com tarefas[1]":
                            "Compare tasks[0] with tasks[1]",
                    },
                    py: {
                        "Percorrer com for-in e somar 1 quando concluida for True":
                            "Walk through with for-in and add 1 when done is True",
                        "Somar o valor de len(tarefas), que já dá o total de tudo":
                            "Add up the value of len(tasks), which already gives the total of everything",
                        "Usar pop() até a lista esvaziar, contando cada remoção feita":
                            "Use pop() until the list is empty, counting each removal",
                        "Comparar o primeiro dicionário com o último da lista inteira":
                            "Compare the first dictionary with the last one in the whole list",
                    },
                },
            },
            {
                enunciado: {
                    js: 'What is the output of this code?\n\n```javascript\nlet products = [\n  { name: "mouse", stock: 5 },\n  { name: "keyboard", stock: 0 },\n  { name: "monitor", stock: 3 }\n];\nlet outOfStock = 0;\nfor (let product of products) {\n  if (product.stock === 0) {\n    outOfStock = outOfStock + 1;\n  }\n}\nconsole.log(outOfStock);\n```',
                    py: 'What is the output of this code?\n\n```python\nproducts = [\n    {"name": "mouse", "stock": 5},\n    {"name": "keyboard", "stock": 0},\n    {"name": "monitor", "stock": 3}\n]\nout_of_stock = 0\nfor product in products:\n    if product["stock"] == 0:\n        out_of_stock = out_of_stock + 1\nprint(out_of_stock)\n```',
                },
                ops: {
                    js: { "0": I("0"), "8": I("8"), "1": I("1"), "3": I("3") },
                    py: { "0": I("0"), "1": I("1"), "8": I("8"), "3": I("3") },
                },
            },
        ],
    },
];
