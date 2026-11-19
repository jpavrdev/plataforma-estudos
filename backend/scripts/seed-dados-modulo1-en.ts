// Tradução em inglês das aulas 2 a 5 do módulo 1 da Lógica de Programação.
// Dados puros: os blocos usam os placeholders {{LINGUAGEM}} (JavaScript/Python),
// {{LINGUA_ARQUIVO}}, {{COMENTARIO}} (// ou #) e {{TERMINAL}} (console/terminal);
// as alternativas são traduzidas pelo texto original em português, porque a
// ordem e parte do miolo diferem entre as variantes JS e Python.

export type Bloco = { type: string; value: string };

export type QuestaoDados = {
    // Enunciado por variante quando difere (menção à linguagem); string única
    // quando é o mesmo texto nas duas.
    enunciado: string | { js: string; py: string };
    // Texto original em português -> tradução.
    ops: Record<string, string>;
};

export type AulaDados = {
    posicao: number;
    blocos: Bloco[] | { js: Bloco[]; py: Bloco[] };
    questoes: QuestaoDados[];
};

export const AULAS_MODULO_1: AulaDados[] = [
    {
        posicao: 2,
        blocos: [
            {
                type: "text",
                value: `## Thinking like a programmer

In the previous lesson you saw that programming is giving precise instructions, and that an algorithm is the sequence of steps behind any solution. But how does someone get to that sequence of steps, especially when the problem looks big and complicated?

That is where computational thinking comes in: a way of approaching problems that every programmer develops with practice, and that you can start training right now, even without writing a line of code. It rests on three main ideas: decomposition, pattern recognition and abstraction.`,
            },
            {
                type: "text",
                value: `## Decomposition: breaking the big problem down

Decomposition is dividing a big problem into smaller parts, which are easier to understand and solve one at a time. Instead of trying to solve everything at once (which usually freezes anyone, programming or not), you split the problem into smaller pieces and attack one piece at a time.

Imagine organizing your child's birthday party. Faced all at once, the task looks huge: "organize the party". But if you break it into smaller parts, such as picking the date and the place, building the guest list, buying food and decorating the house, each part alone is much simpler to solve. Then you just put the parts together.`,
            },
            {
                type: "table",
                value: `[["Smaller part of the problem","What it involves"],["Pick the date and the place","Check the family calendar and book the venue"],["Build the guest list","Decide who gets invited and send the invitations"],["Buy food and drinks","Plan the menu and do the shopping"],["Decorate the house","Buy or prepare the decorations and set everything up on the day"]]`,
            },
            {
                type: "text",
                value: `## Recognizing patterns

Recognizing patterns is noticing that problems, or parts of a problem, repeat or resemble each other, even when the details change. When you spot a pattern, you can reuse the same solution several times, instead of reinventing everything from scratch in every similar situation.

For example, every time you change a light bulb, the steps are practically the same: turn the power off, remove the burnt bulb, put in the new one, turn the power back on. It does not matter whether it is the kitchen bulb or the bedroom one, the pattern of steps repeats. In programming, recognizing this kind of pattern is what leads to creating, for example, a function you use many times (you will study that in the functions module), instead of rewriting the same logic over and over.`,
            },
            {
                type: "text",
                value: `## Abstraction: focus on what is essential

Abstraction is deciding what is essential to solve the problem, and deliberately ignoring the details that do not matter for that specific task. Every good solution leaves things out, and that is not laziness: it is focus.

A transit app map is a good example of abstraction. It represents streets as lines and landmarks as icons, and completely ignores details like the color of the houses or the type of tree on each sidewalk. For the problem of getting from one point to another, those details do not matter, so they stay out.`,
            },
            {
                type: "code",
                value: `{{COMENTARIO}} Problem: calculate the total of a purchase, applying a discount when applicable
{{COMENTARIO}} Before programming, it is worth decomposing the problem into smaller steps:

{{COMENTARIO}} Step 1: add up the price of every item in the cart
{{COMENTARIO}} Step 2: check whether that sum passes a minimum amount to earn a discount
{{COMENTARIO}} Step 3: if it passes the minimum, apply the discount over the sum
{{COMENTARIO}} Step 4: show the final amount to the customer

{{COMENTARIO}} Notice that each step, on its own, is much simpler than computing the whole purchase at once`,
            },
            {
                type: "quote",
                value: `Thinking like a programmer is training your eye: breaking the big into smaller pieces (decomposition), noticing what repeats (patterns) and keeping the focus only on what really matters for the problem (abstraction).`,
            },
        ],
        questoes: [
            {
                enunciado: 'What is "decomposition" in computational thinking?',
                ops: {
                    "Apagar um programa que não funciona mais": "Deleting a program that no longer works",
                    "Quebrar um problema grande em partes menores": "Breaking a big problem into smaller parts",
                    "Escrever todo o código de uma vez, sem planejar nada":
                        "Writing all the code at once, without planning anything",
                    "Diminuir o tamanho da tela do computador": "Making the computer screen smaller",
                },
            },
            {
                enunciado:
                    'Noticing that "every time I need to change a light bulb, I follow the same steps: turn the power off, remove the burnt bulb, put in the new one and turn the power back on" is an example of:',
                ops: {
                    "identificar um padrão que se repete": "identifying a pattern that repeats",
                    "abstração dos detalhes menos importantes": "abstracting away the less important details",
                    "um algoritmo que não pode ser repetido": "an algorithm that cannot be repeated",
                    "um erro de lógica no meio do processo": "a logic error in the middle of the process",
                },
            },
            {
                enunciado:
                    "Ana wants to organize her child's birthday party. Instead of trying to think about everything at once, she splits the task into: picking the date and the place, building the guest list, buying food and decorating the house. What is Ana applying?",
                ops: {
                    "abstração: ignorou detalhes importantes da festa":
                        "abstraction: she ignored important details of the party",
                    "um algoritmo pronto, copiado de outra pessoa":
                        "a ready-made algorithm, copied from someone else",
                    "decomposição: dividiu a festa em partes menores":
                        "decomposition: she split the party into smaller parts",
                    "um fluxograma, porque desenhou setas no papel":
                        "a flowchart, because she drew arrows on paper",
                },
            },
            {
                enunciado:
                    "A developer is creating the map for a transit app. He represents each street as a simple line on the map, and deliberately ignores details like the color of the houses or the type of tree on the sidewalk. This choice of keeping only what is essential for the problem is an example of:",
                ops: {
                    abstração: "abstraction",
                    "sequência de passos": "a sequence of steps",
                    "um erro no programa": "a bug in the program",
                    decomposição: "decomposition",
                },
            },
            {
                enunciado: "About computational thinking, choose the correct alternative:",
                ops: {
                    "abstração significa incluir o máximo de detalhes possível no problema":
                        "abstraction means including as many details as possible in the problem",
                    "decomposição, padrões e abstração organizam o raciocínio antes mesmo de programar":
                        "decomposition, patterns and abstraction organize the reasoning even before programming",
                    "reconhecer padrões é copiar e colar o mesmo código sem entender o que ele faz":
                        "recognizing patterns means copying and pasting the same code without understanding what it does",
                    "pensamento computacional só existe depois de aprender uma linguagem de programação real":
                        "computational thinking only exists after learning a real programming language",
                },
            },
        ],
    },
    {
        posicao: 3,
        blocos: [
            {
                type: "text",
                value: `## Input, processing and output

Now that you know what an algorithm is and how to break a problem into parts, it is worth meeting a pattern that repeats in the vast majority of programs out there: the input, processing and output model.

Think of a blender. You put in fruit and water (input), it blends everything (processing), and out comes ready juice (output). Practically every computer program follows this same logic: it receives something, does some work with that thing, and returns a result.`,
            },
            {
                type: "text",
                value: `## Input: what the program receives

Input is any information the program receives to be able to work. It can be a number the user types on the keyboard, the text of a form, a file saved on the computer, or even the reading of a temperature sensor.

Without input, most programs would have nothing to work with. If you ask someone to calculate the sum of two numbers, first you need to say which two numbers they are: that information is the input.`,
            },
            {
                type: "text",
                value: `## Processing: what the program does with the input

Processing is the work the program performs on the input: adding, comparing, organizing, filtering, calculating. It is the "thinking" part of the program, where the input is transformed into something new or more useful.

In the two-number sum example, the processing is the calculation itself: taking the two received values and adding them.`,
            },
            {
                type: "text",
                value: `## Output: the result the program returns

Output is the result the program delivers after processing the input. It can be a text or number shown on the screen, a sound, a saved file, or a message sent to another program.

In the next modules, our main way of seeing a program's output will be the {{TERMINAL}}, that "little screen" where {{LINGUAGEM}} shows text messages. You will use it right in the next lesson.`,
            },
            {
                type: "table",
                value: `[["Situation","Input","Processing","Output"],["Simple calculator","The typed numbers","Add, subtract, multiply or divide the numbers","The result shown on the display"],["ATM","The typed withdrawal amount","Check whether the account has enough balance","Money released or insufficient balance message"],["Search website","The term typed in the search box","Look for pages related to the term","List of results shown on the screen"],["Weather app","The typed city name","Fetch and compute the forecast for the city","The weather forecast shown on the screen"]]`,
            },
            {
                type: "code",
                value: `{{COMENTARIO}} A simple program usually follows this cycle: input, processing and output

{{COMENTARIO}} Program: calculate the average of two grades

{{COMENTARIO}} Input: grade1 and grade2 (the two values the student typed)
{{COMENTARIO}} Processing: add grade1 and grade2 and divide the result by 2
{{COMENTARIO}} Output: show the average on the screen

{{COMENTARIO}} In the next lessons you will learn to write this as real code`,
            },
            {
                type: "quote",
                value: `Almost every program follows this cycle: it receives some information (input), does some work with it (processing) and returns a result (output).`,
            },
        ],
        questoes: [
            {
                enunciado: 'In the input, processing and output model, what is the "input"?',
                ops: {
                    "O nome da pessoa que escreveu o programa originalmente":
                        "The name of the person who originally wrote the program",
                    "O tempo que o programa demora para terminar de rodar":
                        "The time the program takes to finish running",
                    "O que o programa recebe para usar, como um número digitado":
                        "What the program receives to work with, such as a typed number",
                    "O resultado final que aparece na tela, pronto para o usuário ver":
                        "The final result that appears on the screen, ready for the user to see",
                },
            },
            {
                enunciado:
                    "A calculator receives the numbers 4 and 6, adds the two values and shows 10 on the screen. In this example, what represents the output?",
                ops: {
                    "o botão de ligar da calculadora": "the calculator's power button",
                    "o número 10 exibido na tela": "the number 10 shown on the screen",
                    "a soma sendo calculada por dentro": "the addition being computed inside",
                    "os números 4 e 6 digitados": "the typed numbers 4 and 6",
                },
            },
            {
                enunciado:
                    'In a weather app, the user types the city name, the app fetches the data and computes the forecast, and finally shows "Tomorrow: 28 degrees and sunny" on the screen. What represents the processing in this example?',
                ops: {
                    "a frase final mostrada na tela com a previsão":
                        "the final sentence with the forecast shown on the screen",
                    "o nome da cidade que o usuário digitou no início":
                        "the city name the user typed at the start",
                    "o usuário abrindo o aplicativo no celular para consultar":
                        "the user opening the app on the phone to check",
                    "o cálculo da previsão a partir dos dados da cidade":
                        "the computation of the forecast from the city data",
                },
            },
            {
                enunciado: "About the input, processing and output model, it is correct to say that:",
                ops: {
                    "o processamento é uma etapa opcional, que dá para pular":
                        "processing is an optional step that can be skipped",
                    "o processamento é uma etapa opcional, que sempre dá para pular":
                        "processing is an optional step that can always be skipped",
                    "a saída de todo programa sempre precisa ser um número":
                        "the output of every program always has to be a number",
                    "a saída de um programa sempre tem que ser um número na tela":
                        "the output of a program always has to be a number on the screen",
                    "todo programa obrigatoriamente precisa pedir uma entrada digitada no teclado":
                        "every program necessarily has to ask for input typed on the keyboard",
                    "todo programa precisa obrigatoriamente de uma entrada digitada no teclado":
                        "every program necessarily needs input typed on the keyboard",
                    "a maioria segue esse ciclo, mesmo com a entrada vindo de um arquivo salvo":
                        "most follow this cycle, even with the input coming from a saved file",
                    "a entrada pode vir de um arquivo salvo, não só do teclado":
                        "the input can come from a saved file, not only from the keyboard",
                },
            },
            {
                enunciado:
                    "A program reads the temperature from a sensor every minute, computes the average of the last 10 readings, and sounds an alarm if that average goes above 40 degrees. Which alternative correctly identifies the three parts of the model in this scenario?",
                ops: {
                    "entrada: leituras do sensor; processamento: média e comparação com 40; saída: alarme ligado":
                        "input: sensor readings; processing: average and comparison with 40; output: alarm on",
                    "entrada: o cálculo da média; processamento: o alarme sonoro; saída: as leituras do sensor":
                        "input: the average calculation; processing: the audible alarm; output: the sensor readings",
                    "entrada: o alarme sonoro; processamento: as leituras do sensor; saída: o cálculo da média":
                        "input: the audible alarm; processing: the sensor readings; output: the average calculation",
                    "nesse caso não existe entrada nem saída, porque tudo acontece automaticamente sem intervenção":
                        "in this case there is no input or output, because everything happens automatically without intervention",
                },
            },
        ],
    },
    {
        posicao: 4,
        blocos: [
            {
                type: "text",
                value: `## From pseudocode to flowchart

Before rushing to write real code, many programmers sketch the algorithm first. It is the same logic as an architect drawing a blueprint before building a house: thinking about the structure before laying brick on brick saves rework.

In this lesson you will meet two tools for that sketch: pseudocode and the flowchart. Neither is a programming language, but both help (a lot) to organize your thinking before programming.`,
            },
            {
                type: "text",
                value: `## What pseudocode is

Pseudocode is a way of writing the steps of an algorithm in plain language (or a mix of plain language with keywords), in an organized way, without worrying about the exact syntax of a programming language.

The idea is simple: first you solve the "what" (which steps solve the problem, and in which order), and only then worry about the "how" (the correct syntax of {{LINGUAGEM}}, with its parentheses, commas and semicolons).`,
            },
            {
                type: "code",
                value: `START
  READ grade1
  READ grade2
  average = (grade1 + grade2) / 2
  WRITE average
END

{{COMENTARIO}} Notice: this is not real {{LINGUA_ARQUIVO}}, it is pseudocode.
{{COMENTARIO}} It describes the steps clearly, without following the exact syntax of any language.`,
            },
            {
                type: "text",
                value: `## What a flowchart is

A flowchart is a way of representing an algorithm visually, using little boxes of different shapes connected by arrows. Each box shape has a specific meaning, and the arrows show the order in which the steps happen, exactly like the sequence you studied in lesson 1.

You do not need to draw a flowchart for every small program, but for bigger problems, seeing the algorithm drawn helps you take in the whole path at once, including the points where the program can take different routes (you will study that in depth in the conditionals module).`,
            },
            {
                type: "table",
                value: `[["Element","Shape","What it means"],["Start or end","Oval","Marks where the algorithm begins or ends"],["Action","Rectangle","A step that does something, such as calculating or showing a value"],["Decision","Diamond","A question that leads to different paths (you will see this soon)"],["Arrow","Arrow","Shows the order, connecting one step to the next"]]`,
            },
            {
                type: "text",
                value: `## Pseudocode, flowchart and code: three forms of the same algorithm

Notice that pseudocode, a flowchart and code in {{LINGUAGEM}} can describe exactly the same algorithm, changing only the form of representation: structured text, a drawing with boxes and arrows, or a language the computer actually understands and executes.

None of the three is "more correct" than the others. Pseudocode and flowcharts are tools for you to think and organize. Code is the final stage, where the algorithm becomes something that really runs. And that is exactly what the next lesson exists for.`,
            },
            {
                type: "quote",
                value: `Pseudocode and flowcharts are sketches of your algorithm: they help organize the ideas before writing the first line of real code.`,
            },
        ],
        questoes: [
            {
                enunciado: "What is pseudocode?",
                ops: {
                    "Um tipo de erro que aparece no console do navegador":
                        "A kind of error that shows up in the browser console",
                    "Uma mensagem de erro que aparece quando o programa falha ao rodar":
                        "An error message that appears when the program fails to run",
                    "Uma forma de descrever os passos de um algoritmo em português":
                        "A way of describing the steps of an algorithm in plain language",
                    "O nome de uma linguagem de programação real, tipo Python":
                        "The name of a real programming language, like Python",
                    "O nome de uma linguagem de programação de verdade, como o Java":
                        "The name of a real programming language, like Java",
                    "Um desenho feito só com setas e caixas, sem nenhuma palavra escrita":
                        "A drawing made only of arrows and boxes, with no written words",
                    "Um desenho feito só com caixas e setas, sem nenhuma palavra":
                        "A drawing made only of boxes and arrows, with no words",
                },
            },
            {
                enunciado: "In a flowchart, which shape usually represents the start or the end of the algorithm?",
                ops: {
                    "Um losango": "A diamond",
                    "Uma seta": "An arrow",
                    "Um retângulo": "A rectangle",
                    "Um oval": "An oval",
                },
            },
            {
                enunciado:
                    'Before writing the code for a program that calculates the change of a purchase, a programmer writes on paper: "READ purchase amount, READ amount paid, change = amount paid minus purchase amount, WRITE change". What is she doing?',
                ops: {
                    "Desenhando um fluxograma com caixas e setas":
                        "Drawing a flowchart with boxes and arrows",
                    "Escrevendo diretamente o código final em JavaScript, sem rascunho":
                        "Writing the final JavaScript code directly, with no sketch",
                    "Escrevendo diretamente o código final em Python, sem rascunho":
                        "Writing the final Python code directly, with no sketch",
                    "Testando o programa pronto em busca de erros":
                        "Testing the finished program looking for bugs",
                    "Escrevendo um pseudocódigo para organizar o raciocínio":
                        "Writing pseudocode to organize the reasoning",
                },
            },
            {
                enunciado: "What is the main difference between pseudocode and a flowchart?",
                ops: {
                    "Não existe diferença real: são a mesma coisa, só com nomes diferentes":
                        "There is no real difference: they are the same thing, only with different names",
                    "Fluxograma é uma linguagem de programação de verdade; pseudocódigo não é":
                        "A flowchart is a real programming language; pseudocode is not",
                    "Pseudocódigo é só para programadores avançados; fluxograma é só para iniciantes":
                        "Pseudocode is only for advanced programmers; flowcharts are only for beginners",
                    "Pseudocódigo usa texto estruturado; fluxograma usa desenhos com caixas e setas":
                        "Pseudocode uses structured text; a flowchart uses drawings with boxes and arrows",
                },
            },
            {
                enunciado: {
                    js: "About pseudocode, flowcharts and real code (such as JavaScript), choose the correct alternative:",
                    py: "About pseudocode, flowcharts and real code (such as Python), choose the correct alternative:",
                },
                ops: {
                    "Os três podem descrever o mesmo algoritmo, mudando só a forma de representação":
                        "All three can describe the same algorithm, changing only the form of representation",
                    "Os três descrevem o mesmo algoritmo, mudando só a forma de representar":
                        "All three describe the same algorithm, changing only how it is represented",
                    "É obrigatório desenhar um fluxograma antes de escrever qualquer linha de código":
                        "Drawing a flowchart before writing any line of code is mandatory",
                    "Depois do pseudocódigo pronto, o fluxograma nunca mais serve pra nada":
                        "Once the pseudocode is done, the flowchart never serves any purpose again",
                    "O pseudocódigo precisa seguir exatamente a sintaxe do JavaScript":
                        "Pseudocode has to follow the exact syntax of JavaScript",
                    "O pseudocódigo precisa seguir exatamente a sintaxe do Python, com todos os detalhes":
                        "Pseudocode has to follow the exact syntax of Python, with every detail",
                },
            },
        ],
    },
    {
        posicao: 5,
        blocos: {
            js: [
                {
                    type: "text",
                    value: `## Your first code: console.log

The moment you were waiting for has arrived: today you will really write and run your first line of JavaScript code. After understanding what programming is, what an algorithm is, how to break problems into steps and how to plan with pseudocode, it is time to see all of it come to life on the screen.

The command you will learn now, console.log, is probably the most used command by programmers in the whole world, from the first day of study to years of experience.`,
                },
                {
                    type: "text",
                    value: `## What the console is

The console is the place where JavaScript can show text messages, numbers and results to whoever is programming. Think of it as a simple, text-only screen, separate from the "pretty" screen the end user usually sees.

Programmers use the console all the time to test small pieces of code, show the value of a piece of information at a given moment, or understand why a program is not behaving as expected. You will use the console in practically every lesson from here on.`,
                },
                {
                    type: "code",
                    value: `console.log("Hello, world!");

// output in the console:
// Hello, world!`,
                },
                {
                    type: "text",
                    value: `## Understanding console.log piece by piece

Let us split the command console.log("Hello, world!"); into parts to understand each one:

- **console**: represents the console itself, the place where messages appear.
- **.log( )**: is the command that means "write this to the console". Everything you want to show goes inside the parentheses.
- **"Hello, world!"**: is the text that will be shown. Texts in JavaScript always stay between quotes.
- **;**: marks the end of the instruction, telling JavaScript that the command ended there.

Do not worry about memorizing these names now. With practice, writing console.log becomes automatic.`,
                },
                {
                    type: "code",
                    value: `console.log("Welcome to programming logic!");
console.log(2 + 3);
console.log(10 - 4);

// output:
// Welcome to programming logic!
// 5
// 6`,
                },
                {
                    type: "table",
                    value: `[["Common mistake","What happens","How to fix"],["Forgetting the quotes on the text","JavaScript tries to read the text as a command or variable, and errors out","Always put texts between quotes"],["Forgetting to close a parenthesis","The code does not work and a syntax error appears","Check that every ( has a matching )"],["Writing Console.log with a capital C","JavaScript does not recognize the command and errors out","Always write console.log, all lowercase"],["Forgetting the semicolon at the end","Most of the time the code still works, but it is not good practice","Add ; at the end of each instruction"]]`,
                },
                {
                    type: "quote",
                    value: `You have just given your first instruction for the computer to execute, and saw the result on the screen with your own eyes. Hold on to that feeling: it is the first step of many still to come.`,
                },
            ],
            py: [
                {
                    type: "text",
                    value: `## Your first code: print

The moment you were waiting for has arrived: today you will really write and run your first line of Python code. After understanding what programming is, what an algorithm is, how to break problems into steps and how to plan with pseudocode, it is time to see all of it come to life on the screen.

The command you will learn now, print, is probably the most used command by programmers in the whole world, from the first day of study to years of experience.`,
                },
                {
                    type: "text",
                    value: `## What the terminal is

The terminal (sometimes called the console) is the place where Python shows text messages, numbers and results to whoever is programming. Think of it as a simple, text-only screen, separate from the "pretty" screen the end user usually sees.

Programmers use the terminal all the time to test small pieces of code, show the value of a piece of information at a given moment, or understand why a program is not behaving as expected. You will use the terminal in practically every lesson from here on.`,
                },
                {
                    type: "code",
                    value: `print("Hello, world!")

# output in the terminal:
# Hello, world!`,
                },
                {
                    type: "text",
                    value: `## Understanding print piece by piece

Let us split the command print("Hello, world!") into parts to understand each one:

- **print**: is the function that means "write this to the screen". It is what makes the message appear.
- **( )**: the parentheses hold what you want to show. Everything that will be displayed stays inside them.
- **"Hello, world!"**: is the text that will be shown. Texts in Python always stay between quotes.
- **end of line**: in Python, the end of the line itself already indicates that the command ended there. Unlike other languages, you do not need a semicolon at the end.

Do not worry about memorizing these names now. With practice, writing print becomes automatic.`,
                },
                {
                    type: "code",
                    value: `print("Welcome to programming logic!");
print(2 + 3)
print(10 - 4)

# output:
# Welcome to programming logic!
# 5
# 6`,
                },
                {
                    type: "table",
                    value: `[["Common mistake","What happens","How to fix"],["Forgetting the quotes on the text","Python thinks the words are variable names and errors out","Always put texts between quotes"],["Forgetting to close the parenthesis","The code does not run and a syntax error appears","Check that every ( has a matching )"],["Writing Print with a capital P","Python is case-sensitive and does not recognize the command","Always write print, all lowercase"],["Opening with double quotes and closing with single quotes","Python cannot find the end of the text and reports an error","Use the same kind of quotes to open and close"]]`,
                },
                {
                    type: "quote",
                    value: `You have just given your first instruction for the computer to execute, and saw the result on the screen with your own eyes. Hold on to that feeling: it is the first step of many still to come.`,
                },
            ],
        },
        questoes: [
            {
                enunciado: {
                    js: "Which command do we use in JavaScript to show a message in the console?",
                    py: "Which command do we use in Python to show a message on the screen?",
                },
                ops: {
                    "mostrar.log()": "show.log()",
                    // Literais de código, iguais nos dois idiomas.
                    ...Object.fromEntries(
                        ["console.log()", "console.show()", "print.console()", "printf()", "print.log()", "print()"].map(
                            (v) => [v, v],
                        ),
                    ),
                },
            },
            {
                enunciado: {
                    js: 'What is the output of the code below?\nconsole.log("Hello, world!");',
                    py: 'What is the output of the code below?\nprint("Hello, world!")',
                },
                ops: {
                    "Nenhuma saída aparece no console": "No output appears in the console",
                    "Nenhuma saída aparece na tela": "No output appears on the screen",
                    "Olá, mundo!": "Hello, world!",
                    '"Olá, mundo!", com as aspas incluídas': '"Hello, world!", with the quotes included',
                    console: "console",
                    "console.log": "console.log",
                    print: "print",
                },
            },
            {
                enunciado: {
                    js: "What is the output of the code below?\nconsole.log(2 + 3);",
                    py: "What is the output of the code below?\nprint(2 + 3)",
                },
                ops: {
                    "Erro, porque números não podem ficar entre parênteses":
                        "An error, because numbers cannot stay inside parentheses",
                    "5": "5",
                    '"2 + 3"': '"2 + 3"',
                    "2 + 3": "2 + 3",
                },
            },
            {
                enunciado: {
                    js: "A beginner wrote the code below and got an error:\nconsole.log(Hello, world!);\nWhat is the most likely reason for the error?",
                    py: "A beginner wrote the code below and got an error:\nprint(Hello, world!)\nWhat is the most likely reason for the error?",
                },
                ops: {
                    "Faltou colocar aspas no texto, então o JavaScript não reconhece":
                        "The text was missing quotes, so JavaScript does not recognize it",
                    "Faltou colocar aspas no texto, então o Python não reconhece as palavras":
                        "The text was missing quotes, so Python does not recognize the words",
                    "A palavra console foi escrita errada, com letra maiúscula demais":
                        "The word console was written wrong, with too many capital letters",
                    "A palavra print foi escrita errada, com uma letra maiúscula a mais":
                        "The word print was written wrong, with one extra capital letter",
                    "Não é possível usar acento ou exclamação dentro do console.log":
                        "Accents or exclamation marks cannot be used inside console.log",
                    "Não é possível usar acentos nem o ponto de exclamação dentro do print":
                        "Accents or exclamation marks cannot be used inside print",
                    "Faltou escrever a palavra imprimir antes de console.log":
                        "The word print was missing before console.log",
                    "Faltou escrever a palavra imprimir logo antes de chamar o print":
                        "The word print was missing right before calling print",
                },
            },
            {
                enunciado: {
                    js: "About the console and the console.log command, choose the correct alternative:",
                    py: "About print and the output in the terminal, choose the correct alternative:",
                },
                ops: {
                    "console.log só funciona se for o único comando do programa":
                        "console.log only works if it is the program's only command",
                    "O print só funciona se for o único comando do programa":
                        "print only works if it is the program's only command",
                    "Tudo que aparece no console é salvo automaticamente dentro do arquivo do projeto":
                        "Everything that appears in the console is saved automatically inside the project file",
                    "Tudo o que o print mostra fica salvo automaticamente dentro de um arquivo do projeto":
                        "Everything print shows is saved automatically inside a project file",
                    "console.log é o único comando que existe na linguagem JavaScript":
                        "console.log is the only command that exists in the JavaScript language",
                    "O print é o único comando que existe na linguagem Python":
                        "print is the only command that exists in the Python language",
                    "O console mostra textos, números e resultados, e ajuda a testar o código":
                        "The console shows texts, numbers and results, and helps test the code",
                    "O print mostra textos e resultados na tela e ajuda a testar o código":
                        "print shows texts and results on the screen and helps test the code",
                },
            },
        ],
    },
];
