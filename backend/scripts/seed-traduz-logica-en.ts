// Tradução em inglês da trilha Lógica de Programação (piloto da fase bilíngue de
// conteúdo). Idempotente: upsert por (entidade, locale), roda quantas vezes quiser.
//
// Escopo: nome/descrição da trilha, título do módulo 1, títulos das aulas do
// módulo 1 e a primeira aula completa (blocos, questões e alternativas). O resto
// da trilha cai no fallback em português, que é parte do comportamento validado.
//
// Rodar em dev: docker compose exec -T backend node scripts/seed-traduz-logica-en.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-traduz-logica-en.ts
import { db } from "../db.ts";
import {
    trails,
    trailTranslations,
    modules,
    moduleTranslations,
    lessons,
    lessonTranslations,
    questions,
    questionTranslations,
    questionOptions,
    optionTranslations,
} from "../schema.ts";
import { eq } from "drizzle-orm";

const TRILHA = "fa491407-b184-448b-b782-9a43fdb812ed"; // Lógica de Programação
const MODULO_1 = "7dcfe755-da0a-486f-8425-ab10907da1ef"; // O que é lógica de programação e algoritmos
const LICAO_1 = "79c5ca18-bc76-4d7f-bfe1-f8e687d88e54"; // O que é programar e o que é um algoritmo (JS)

const TRADUCAO_TRILHA = {
    name: "Programming Logic",
    description:
        "The foundation of everything in programming: algorithmic thinking, variables and types, conditionals, loops, functions and collections, solving real problems with code. The starting point for anyone heading to back-end.",
    whatYouLearn: [
        "Thinking in algorithms and solving problems step by step",
        "Variables, data types and operators",
        "Conditionals, loops and repetition",
        "Functions, collections and a mini project from scratch",
    ],
    prerequisites: ["None: this is the starting point, just the will to learn"],
};

const TRADUCAO_MODULO_1 = "Module 1 - What programming logic and algorithms are";

// Títulos das aulas do módulo 1 (as variantes JS e Python dividem a tradução,
// exceto a última, que nomeia a função de imprimir de cada linguagem).
const TRADUCOES_AULAS: Record<string, string> = {
    "79c5ca18-bc76-4d7f-bfe1-f8e687d88e54": "What programming is and what an algorithm is",
    "33d5ef42-af3c-412b-8ebd-7b02636d5c66": "What programming is and what an algorithm is",
    "73fe10c8-3ce3-4c64-9577-b214db59d23e": "Thinking like a programmer: breaking the problem into steps",
    "50326ecf-cf6a-4ff9-bb0d-cd6af711002e": "Thinking like a programmer: breaking the problem into steps",
    "2707e3fc-ec3f-4397-b4f4-576aae95d260": "Input, processing and output",
    "8a12f5cb-e3e9-43a4-81b9-c95f61e05796": "Input, processing and output",
    "91d111d0-fb72-4674-bb7b-2e2a811df5d2": "From pseudocode to flowchart",
    "984e1d3c-5ffb-438a-92c0-700563f972a9": "From pseudocode to flowchart",
    "5adc43ab-e970-4c90-8f24-08c35a01a64a": "Your first code: console.log",
    "2f209df5-fe37-478b-a9d0-437be8cd8408": "Your first code: print",
};

const BLOCOS_LICAO_1 = [
    {
        type: "text",
        value: `# What programming is and what an algorithm is

If you have never written a line of code in your life, this is the right place to start. Forget for a moment the idea that programming is something mysterious, full of complicated formulas or reserved for geniuses. Programming is, above all, a way of thinking and communicating. And that is exactly what you are going to learn from now on, calmly, one step at a time.

In this lesson you will understand what "programming" really means and what an "algorithm" is, the two most important ideas in all of programming. Everything else you will learn from here on (variables, conditionals, loops, functions) is just a way of expressing algorithms in a way the computer understands.`,
    },
    {
        type: "text",
        value: `## The computer does exactly what you tell it

Programming is giving instructions for the computer to execute. It sounds simple, but there is one detail that changes everything: the computer does exactly what you tell it, nothing more, nothing less, and in the exact order you tell it.

Imagine you ask someone who has never made a sandwich in their life: "make a butter and bread sandwich". To you, that involves opening the bread bag, taking out two slices, opening the butter jar, spreading it with a knife, and putting the slices together. But if that person follows only the literal words you said, without using any prior knowledge, they might try to spread butter right on the closed bag.

The computer is exactly that person. It has no common sense, does not "guess" what you meant, and does not fill in steps you forgot to write. That is why programming demands precision: you need to describe every step, in the right order, skipping nothing that seems obvious to a human being.`,
    },
    {
        type: "text",
        value: `## What an algorithm is

An algorithm is a sequence of steps, well defined and ordered, to solve a problem or carry out a task. Notice that this definition never mentions computers: algorithms existed long before computers, and you use several of them every day without realizing it.

A cake recipe is an algorithm: it describes, step by step, what to do to turn loose ingredients into a finished cake. Changing a flat tire is also an algorithm: there is an order of steps that leads from "flat tire" to "car running again", and that order is not just any order.

When you program, you are basically writing an algorithm in a language the computer can understand and execute, such as Python, which is the language we will use here.`,
    },
    {
        type: "table",
        value: `[["Step","What to do"],["1","Set out the ingredients: flour, eggs, sugar, milk and baking powder"],["2","Mix the dry and the liquid ingredients in a bowl"],["3","Beat the batter until smooth"],["4","Grease the pan and pour the batter into it"],["5","Bake in the preheated oven for about 40 minutes"],["6","Let it cool before unmolding and serving"]]`,
    },
    {
        type: "text",
        value: `## Why order and precision matter

In an algorithm, the order of the steps is not a detail: it is part of the solution. Swapping the order can make the algorithm fail completely, or even cause an accident.

Think about changing a tire again. You cannot put the spare on before removing the flat wheel, or lower the car before tightening the lug nuts. The task is the same, the steps are the same, but **the order** between them is what guarantees everything works (and that nobody gets hurt).

The same goes for precision: saying "mix the ingredients" is vague, but saying "mix the flour, sugar and baking powder in a bowl, then add the eggs and the milk" is precise enough for someone (or a computer) to follow without guessing.`,
    },
    {
        type: "code",
        value: `# An algorithm can be written like this, step by step, even before it becomes real code.
# This is already a valid Python file: comments do not make the computer execute anything,
# but they help organize the reasoning before programming.

# Algorithm: change a flat tire
# 1. Stop the car in a safe place and set up the warning signs
# 2. Get the spare tire, the jack and the lug wrench
# 3. Loosen the lug nuts of the flat wheel a little (with the car still on the ground)
# 4. Lift the car with the jack
# 5. Finish removing the lug nuts and take the flat wheel off
# 6. Put the spare wheel in place
# 7. Put the lug nuts back on and tighten them
# 8. Lower the car and tighten the lug nuts harder`,
    },
    {
        type: "quote",
        value: `Programming is giving precise, ordered instructions for the computer to execute. An algorithm is the recipe behind every program: a sequence of steps that solves a problem, in the right order.`,
    },
];

// Questões da aula 1: enunciado e alternativas. As explicações da base estão
// vazias nesta aula, então não há o que traduzir ali.
const TRADUCOES_QUESTOES: Record<string, { statement: string; explanation?: string }> = {
    "3935297f-1768-4414-8da1-1e4152fbbb4f": {
        statement: 'Which option best describes what "programming" means?',
    },
    "147078cd-1802-4f38-8acd-4d0dc6e9e1a2": {
        statement: "Which of the options below is an example of an everyday algorithm?",
    },
    "cc83fe88-b7a0-4743-919d-ec0ce7b9517d": {
        statement:
            'You ask a friend who has never cooked: "make a butter and bread sandwich". He follows exactly the words you said, in the order you said them, and tries to spread butter right on the still closed bread bag. This example mainly shows that:',
    },
    "785f0c6d-3caa-4994-bb58-fe111e52d479": {
        statement:
            "In the flat tire changing algorithm, the wheel lug nuts are loosened while the car is still on the ground, before lifting it with the jack. Why does this order matter?",
    },
    "7ca67ffe-5c33-44ea-a5cd-f677f278f070": {
        statement: "Which statement about algorithms is true?",
    },
};

const TRADUCOES_ALTERNATIVAS: Record<string, string> = {
    "681a62d3-5a56-41cb-90ff-46e50dbfcf6b": "Fixing the computer when it crashes",
    "3356471f-8b94-43ae-8d10-b58cb8eb3b50": "Giving ordered instructions for the computer to execute",
    "535212a5-a183-4e34-9101-7a53f1efc242": "Designing the screen of an app or website",
    "f5c4fb0a-05ae-4964-8ffb-f051be607c55": "Memorizing the commands of a programming language by heart",
    "a3f62d71-dc61-4a77-98dd-42298eefcaeb": "The name of the family favorite restaurant",
    "65f5d18d-4a7f-49dc-8832-62e91f971ab9": "The cover color of a book",
    "f5e0219c-183e-4f11-892c-0164546c8cf6": "The price of a bus ticket",
    "3a904752-9bd4-4354-94e4-90f6a75d4d67": "A cake recipe, step by step",
    "4cf25b10-711a-428b-b574-a300e0b09013": "more bread should have been bought before starting the recipe",
    "63942e1b-fe47-4bb8-9963-584f25d1edf2":
        "instructions are followed to the letter, even when something seems obvious",
    "86533949-f875-46ae-9f7a-d0be03d27929":
        "it is not possible to describe making a sandwich as a sequence of steps",
    "dbdf5d69-174d-4922-81fa-56eb1ded03bf": "your friend does not know how to follow kitchen recipes",
    "4f2b270b-706a-41db-b3a9-6701e252a782": "Because that way the car is more stable when lifted by the jack",
    "198f4db0-894d-4ecc-979c-b36e2dec6698": "Because the jack can only lift the car after all the lug nuts are loose",
    "8c8dbe86-fcc2-49ea-bff8-9e640fd66b74":
        "Because the friction with the ground locks the wheel, making it easier to loosen the lug nuts",
    "27a5fb44-a397-45e6-936b-fb0d75786997":
        "Because the order of the steps never changes the result of an algorithm",
    "823ba034-9f76-4f8a-a79b-c0cd52ef9870":
        "It is the sequence of steps itself, described in text, drawing or code",
    "d8a6d0c2-2ea6-40fa-8d99-2c1dee479d80":
        "It only comes into existence after being written in a language such as Python",
    "7d07b19a-ee07-421b-a6d3-72083a33f6b6": "It always needs a computer to exist and be executed",
    "07448553-a667-4f65-9b50-6b9a71c73fe0":
        "Changing the order of the steps never alters the final result",
};

async function main() {
    const [trilha] = await db.select().from(trails).where(eq(trails.id, TRILHA));
    if (!trilha) throw new Error("Trilha não encontrada");

    await db
        .insert(trailTranslations)
        .values({ trailId: TRILHA, locale: "en", ...TRADUCAO_TRILHA })
        .onConflictDoUpdate({
            target: [trailTranslations.trailId, trailTranslations.locale],
            set: { ...TRADUCAO_TRILHA, updatedAt: new Date() },
        });

    await db
        .insert(moduleTranslations)
        .values({ moduleId: MODULO_1, locale: "en", title: TRADUCAO_MODULO_1 })
        .onConflictDoUpdate({
            target: [moduleTranslations.moduleId, moduleTranslations.locale],
            set: { title: TRADUCAO_MODULO_1, updatedAt: new Date() },
        });

    const aulasModulo1 = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.moduleId, MODULO_1));
    for (const { id } of aulasModulo1) {
        const title = TRADUCOES_AULAS[id];
        if (!title) continue;
        await db
            .insert(lessonTranslations)
            .values({ lessonId: id, locale: "en", title })
            .onConflictDoUpdate({
                target: [lessonTranslations.lessonId, lessonTranslations.locale],
                set: { title, updatedAt: new Date() },
            });
    }

    await db
        .insert(lessonTranslations)
        .values({
            lessonId: LICAO_1,
            locale: "en",
            title: TRADUCOES_AULAS[LICAO_1],
            content: null,
            contentBlocks: BLOCOS_LICAO_1,
        })
        .onConflictDoUpdate({
            target: [lessonTranslations.lessonId, lessonTranslations.locale],
            set: {
                title: TRADUCOES_AULAS[LICAO_1],
                content: null,
                contentBlocks: BLOCOS_LICAO_1,
                updatedAt: new Date(),
            },
        });

    const questoesLicao1 = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.lessonId, LICAO_1));
    for (const { id } of questoesLicao1) {
        const tr = TRADUCOES_QUESTOES[id];
        if (!tr) continue;
        await db
            .insert(questionTranslations)
            .values({
                questionId: id,
                locale: "en",
                statement: tr.statement,
                explanation: tr.explanation ?? null,
            })
            .onConflictDoUpdate({
                target: [questionTranslations.questionId, questionTranslations.locale],
                set: { statement: tr.statement, explanation: tr.explanation ?? null, updatedAt: new Date() },
            });
    }

    const alternativas = await db
        .select({ id: questionOptions.id })
        .from(questionOptions)
        .innerJoin(questions, eq(questions.id, questionOptions.questionId))
        .where(eq(questions.lessonId, LICAO_1));
    for (const { id } of alternativas) {
        const text = TRADUCOES_ALTERNATIVAS[id];
        if (!text) continue;
        await db
            .insert(optionTranslations)
            .values({ optionId: id, locale: "en", text })
            .onConflictDoUpdate({
                target: [optionTranslations.optionId, optionTranslations.locale],
                set: { text, updatedAt: new Date() },
            });
    }

    console.log(
        `Traduções da Lógica de Programação gravadas: trilha, módulo 1, ${aulasModulo1.length} títulos de aula, aula 1 completa e ${questoesLicao1.length} questões.`,
    );
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao gravar as traduções:", e);
    process.exit(1);
});
