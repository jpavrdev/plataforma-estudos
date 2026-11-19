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
import { eq, asc } from "drizzle-orm";
import { AULAS_MODULO_1, type Bloco } from "./seed-dados-modulo1-en.ts";
import { AULAS_MODULO_2, TITULO_MODULO_2 } from "./seed-dados-modulo2-en.ts";
import { AULAS_MODULO_3, TITULO_MODULO_3 } from "./seed-dados-modulo3-en.ts";

const TRILHA = "fa491407-b184-448b-b782-9a43fdb812ed"; // Lógica de Programação
const MODULO_1 = "7dcfe755-da0a-486f-8425-ab10907da1ef"; // O que é lógica de programação e algoritmos
// As duas variantes da primeira aula: o livro e a tela default seguem a variante
// JavaScript, mas quem estuda pela variante Python precisa da mesma tradução.
const LICOES_1 = {
    js: "33d5ef42-af3c-412b-8ebd-7b02636d5c66",
    py: "79c5ca18-bc76-4d7f-bfe1-f8e687d88e54",
} as const;

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

const BLOCOS_BASE = [
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

When you program, you are basically writing an algorithm in a language the computer can understand and execute, such as {{LINGUAGEM}}, which is the language we will use here.`,
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
        value: `{{COMENTARIO}} An algorithm can be written like this, step by step, even before it becomes real code.
{{COMENTARIO}} This is already a valid {{LINGUA_ARQUIVO}} file: comments do not make the computer execute anything,
{{COMENTARIO}} but they help organize the reasoning before programming.

{{COMENTARIO}} Algorithm: change a flat tire
{{COMENTARIO}} 1. Stop the car in a safe place and set up the warning signs
{{COMENTARIO}} 2. Get the spare tire, the jack and the lug wrench
{{COMENTARIO}} 3. Loosen the lug nuts of the flat wheel a little (with the car still on the ground)
{{COMENTARIO}} 4. Lift the car with the jack
{{COMENTARIO}} 5. Finish removing the lug nuts and take the flat wheel off
{{COMENTARIO}} 6. Put the spare wheel in place
{{COMENTARIO}} 7. Put the lug nuts back on and tighten them
{{COMENTARIO}} 8. Lower the car and tighten the lug nuts harder`,
    },
    {
        type: "quote",
        value: `Programming is giving precise, ordered instructions for the computer to execute. An algorithm is the recipe behind every program: a sequence of steps that solves a problem, in the right order.`,
    },
];
// Questões da aula 1, por posição: as duas variantes têm linhas próprias de
// questões e alternativas com o mesmo conteúdo, então a tradução casa pelo lugar.
const ENUNCIADOS: string[] = [
    'Which option best describes what "programming" means?',
    "Which of the options below is an example of an everyday algorithm?",
    'You ask a friend who has never cooked: "make a butter and bread sandwich". He follows exactly the words you said, in the order you said them, and tries to spread butter right on the still closed bread bag. This example mainly shows that:',
    "In the flat tire changing algorithm, the wheel lug nuts are loosened while the car is still on the ground, before lifting it with the jack. Why does this order matter?",
    "Which statement about algorithms is true?",
];

const ALTERNATIVAS: string[][] = [
    [
        "Fixing the computer when it crashes",
        "Giving ordered instructions for the computer to execute",
        "Designing the screen of an app or website",
        "Memorizing the commands of a programming language by heart",
    ],
    [
        "The name of the family favorite restaurant",
        "The cover color of a book",
        "The price of a bus ticket",
        "A cake recipe, step by step",
    ],
    [
        "more bread should have been bought before starting the recipe",
        "instructions are followed to the letter, even when something seems obvious",
        "it is not possible to describe making a sandwich as a sequence of steps",
        "your friend does not know how to follow kitchen recipes",
    ],
    [
        "Because that way the car is more stable when lifted by the jack",
        "Because the jack can only lift the car after all the lug nuts are loose",
        "Because the friction with the ground locks the wheel, making it easier to loosen the lug nuts",
        "Because the order of the steps never changes the result of an algorithm",
    ],
    [
        "It is the sequence of steps itself, described in text, drawing or code",
        "It only comes into existence after being written in a language such as Python",
        "It always needs a computer to exist and be executed",
        "Changing the order of the steps never alters the final result",
    ],
];

const blocosDaVariante = (variante: "js" | "py") =>
    BLOCOS_BASE.map((b) => aplicarVariante(b, variante));

function aplicarVariante(b: Bloco, variante: "js" | "py"): Bloco {
    return {
        ...b,
        value: b.value
            .replaceAll("{{LINGUAGEM}}", variante === "js" ? "JavaScript" : "Python")
            .replaceAll("{{LINGUA_ARQUIVO}}", variante === "js" ? "JavaScript" : "Python")
            .replaceAll("{{COMENTARIO}}", variante === "js" ? "//" : "#")
            .replaceAll("{{TERMINAL}}", variante === "js" ? "console" : "terminal"),
    };
}

let faltando = 0;
let totalQuestoes = 0;

async function aplicarAulaCompleta(
    lessonId: string,
    title: string,
    blocos: Bloco[],
    questoesDados: { enunciado: string; ops: Record<string, string> }[],
    rotulo: string,
) {
    await db
        .insert(lessonTranslations)
        .values({ lessonId, locale: "en", title, contentBlocks: blocos })
        .onConflictDoUpdate({
            target: [lessonTranslations.lessonId, lessonTranslations.locale],
            set: { title, contentBlocks: blocos, updatedAt: new Date() },
        });
    const questoes = await db
        .select({ id: questions.id })
        .from(questions)
        .where(eq(questions.lessonId, lessonId))
        .orderBy(asc(questions.position));
    for (const [i, { id }] of questoes.entries()) {
        const dados = questoesDados[i];
        if (!dados) continue;
        await db
            .insert(questionTranslations)
            .values({ questionId: id, locale: "en", statement: dados.enunciado })
            .onConflictDoUpdate({
                target: [questionTranslations.questionId, questionTranslations.locale],
                set: { statement: dados.enunciado, updatedAt: new Date() },
            });
        totalQuestoes++;
        const opts = await db
            .select({ id: questionOptions.id, text: questionOptions.text })
            .from(questionOptions)
            .where(eq(questionOptions.questionId, id))
            .orderBy(asc(questionOptions.position));
        for (const opt of opts) {
            const texto = dados.ops[opt.text];
            if (!texto) {
                faltando++;
                console.warn(`Alternativa sem tradução (${rotulo}): ${opt.text}`);
                continue;
            }
            await db
                .insert(optionTranslations)
                .values({ optionId: opt.id, locale: "en", text: texto })
                .onConflictDoUpdate({
                    target: [optionTranslations.optionId, optionTranslations.locale],
                    set: { text: texto, updatedAt: new Date() },
                });
        }
    }
}

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

    for (const [variante, lessonId] of Object.entries(LICOES_1) as [("js" | "py"), string][]) {
        const blocos = blocosDaVariante(variante);
        await db
            .insert(lessonTranslations)
            .values({
                lessonId,
                locale: "en",
                title: TRADUCOES_AULAS[lessonId],
                content: null,
                contentBlocks: blocos,
            })
            .onConflictDoUpdate({
                target: [lessonTranslations.lessonId, lessonTranslations.locale],
                set: {
                    title: TRADUCOES_AULAS[lessonId],
                    content: null,
                    contentBlocks: blocos,
                    updatedAt: new Date(),
                },
            });

        const questoes = await db
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.lessonId, lessonId))
            .orderBy(asc(questions.position));
        for (const [i, { id }] of questoes.entries()) {
            const statement = ENUNCIADOS[i];
            if (!statement) continue;
            await db
                .insert(questionTranslations)
                .values({ questionId: id, locale: "en", statement })
                .onConflictDoUpdate({
                    target: [questionTranslations.questionId, questionTranslations.locale],
                    set: { statement, updatedAt: new Date() },
                });
            const opts = await db
                .select({ id: questionOptions.id })
                .from(questionOptions)
                .where(eq(questionOptions.questionId, id))
                .orderBy(asc(questionOptions.position));
            for (const [j, opt] of opts.entries()) {
                const text = ALTERNATIVAS[i]?.[j];
                if (!text) continue;
                await db
                    .insert(optionTranslations)
                    .values({ optionId: opt.id, locale: "en", text })
                    .onConflictDoUpdate({
                        target: [optionTranslations.optionId, optionTranslations.locale],
                        set: { text, updatedAt: new Date() },
                    });
            }
            totalQuestoes++;
        }
    }

    // Aulas 2 a 5 do módulo 1: blocos por variante e questões traduzidas pelo
    // texto original em português, porque a ordem das alternativas difere.
    const aulasModulo = await db
        .select({ id: lessons.id, position: lessons.position, language: lessons.language })
        .from(lessons)
        .where(eq(lessons.moduleId, MODULO_1));
    const aulaDe = (
        aulas: { id: string; position: number; language: string | null }[],
        posicao: number,
        variante: "js" | "py",
    ) =>
        aulas.find(
            (a) =>
                a.position === posicao && a.language === (variante === "js" ? "javascript" : "python"),
        );

    for (const aula of AULAS_MODULO_1) {
        for (const variante of ["js", "py"] as const) {
            const alvo = aulaDe(aulasModulo, aula.posicao, variante);
            if (!alvo) continue;
            const blocos = Array.isArray(aula.blocos)
                ? aula.blocos.map((b) => aplicarVariante(b, variante))
                : aula.blocos[variante];
            await aplicarAulaCompleta(
                alvo.id,
                TRADUCOES_AULAS[alvo.id],
                blocos,
                aula.questoes.map((q) => ({
                    enunciado: typeof q.enunciado === "string" ? q.enunciado : q.enunciado[variante],
                    ops: q.ops,
                })),
                `módulo 1 aula ${aula.posicao} ${variante}`,
            );
        }
    }

    // Módulo 2 inteiro: as variantes divergem de verdade (let/const x convenção,
    // === x ==), então cada aula traz blocos e alternativas por variante.
    // Módulos com variantes autoradas por inteiro: 2 (variáveis, tipos e
    // operadores) e 3 (condicionais). A lista guia título do módulo e aulas.
    const MODULOS_VARIANTES: { id: string; titulo: string; aulas: typeof AULAS_MODULO_2 }[] = [
        { id: "21e5c05d-3124-46fa-b8a8-c76bd43e3496", titulo: TITULO_MODULO_2, aulas: AULAS_MODULO_2 },
        { id: "084efaca-ebac-45bc-bf49-9a6c5fec4188", titulo: TITULO_MODULO_3, aulas: AULAS_MODULO_3 },
    ];

    for (const mod of MODULOS_VARIANTES) {
        await db
            .insert(moduleTranslations)
            .values({ moduleId: mod.id, locale: "en", title: mod.titulo })
            .onConflictDoUpdate({
                target: [moduleTranslations.moduleId, moduleTranslations.locale],
                set: { title: mod.titulo, updatedAt: new Date() },
            });

        const aulasModulo = await db
            .select({ id: lessons.id, position: lessons.position, language: lessons.language })
            .from(lessons)
            .where(eq(lessons.moduleId, mod.id));
        for (const aula of mod.aulas) {
            for (const variante of ["js", "py"] as const) {
                const alvo = aulaDe(aulasModulo, aula.posicao, variante);
                if (!alvo) continue;
                await aplicarAulaCompleta(
                    alvo.id,
                    aula.titulo[variante],
                    aula.blocos[variante],
                    aula.questoes.map((q) => ({
                        enunciado: q.enunciado[variante],
                        ops: q.ops[variante],
                    })),
                    `módulo ${mod.titulo.slice(7, 8)} aula ${aula.posicao} ${variante}`,
                );
            }
        }
    }

    console.log(
        `Traduções da Lógica de Programação gravadas: trilha, módulo 1 inteiro (${aulasModulo1.length} títulos), ${totalQuestoes} questões e ${faltando} alternativas sem tradução.`,
    );
    if (faltando > 0) process.exitCode = 1;
    process.exit(0);
}

main().catch((e) => {
    console.error("Falha ao gravar as traduções:", e);
    process.exit(1);
});
