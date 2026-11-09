import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { limparBanco } from "./helpers/db.ts";
import { db } from "../db.ts";
import {
    flashcards,
    lessonProgress,
    lessons,
    modules,
    trails,
    userCards,
    users,
} from "../schema.ts";
import { and, eq } from "drizzle-orm";
import {
    openLessonCards,
    decks,
    countTrailReview,
    dailyQueue,
    answerCard,
    trailReview,
} from "../src/services/flashcard.service.ts";

/**
 * A trail with two language tracks: the same lesson exists twice, one in
 * JavaScript and one in Python, at the same position. The conceptual card ("O que
 * é um algoritmo?") applies to both and was therefore seeded in both lessons, in
 * different rows with the same question. Each track also has its own syntax card.
 */
async function buildTrailWithTwoTracks() {
    const [trail] = await db
        .insert(trails)
        .values({ name: "Lógica", trailLevel: "iniciante", description: "trilha de teste" })
        .returning();
    const [module] = await db
        .insert(modules)
        .values({ trailId: trail.id, title: "Módulo 1", position: 1 })
        .returning();

    const lessonFor = async (language: string) => {
        const [lesson] = await db
            .insert(lessons)
            .values({
                trailId: trail.id,
                moduleId: module.id,
                title: `Algoritmos em ${language}`,
                position: 1,
                published: true,
                language,
            })
            .returning();
        await db.insert(flashcards).values([
            {
                lessonId: lesson.id,
                frente: "O que é um algoritmo?",
                verso: "Sequência de passos",
                position: 0,
            },
            {
                lessonId: lesson.id,
                frente: `Como declarar variável em ${language}?`,
                verso: "Depende da linguagem",
                position: 1,
            },
        ]);
        return lesson;
    };

    return { trilha: trail, js: await lessonFor("javascript"), py: await lessonFor("python") };
}

async function newUser() {
    const [student] = await db
        .insert(users)
        .values({
            name: "Aluno",
            email: `aluno_${Math.random().toString(36).slice(2)}@email.com`,
            passwordHash: "x",
        })
        .returning();
    return student;
}

async function complete(userId: string, lessonId: string) {
    await db.insert(lessonProgress).values({ userId, lessonId, completedAt: new Date() });
    await openLessonCards(userId, lessonId);
}

describe("cards in a trail with language tracks", () => {
    beforeEach(limparBanco);

    test("a student who studied both tracks gets the common question only once", async () => {
        const { js, py } = await buildTrailWithTwoTracks();
        const student = await newUser();

        await complete(student.id, js.id);
        await complete(student.id, py.id);

        const queue = await dailyQueue(student.id);
        const questions = queue.map((c) => c.frente).sort();

        assert.deepEqual(questions, [
            "Como declarar variável em javascript?",
            "Como declarar variável em python?",
            "O que é um algoritmo?",
        ]);
    });

    test("a student of a single track still gets the common question", async () => {
        const { py } = await buildTrailWithTwoTracks();
        const student = await newUser();

        await complete(student.id, py.id);

        const questions = (await dailyQueue(student.id)).map((c) => c.frente).sort();
        assert.deepEqual(questions, ["Como declarar variável em python?", "O que é um algoritmo?"]);
    });

    test("the trail review does not repeat the common question", async () => {
        const { trilha: trail, js, py } = await buildTrailWithTwoTracks();
        const student = await newUser();

        await complete(student.id, js.id);
        await complete(student.id, py.id);

        const cards = await trailReview(trail.id);
        const questions = cards.map((c) => c.frente);

        assert.equal(new Set(questions).size, questions.length, "question repeated in review");
        assert.equal(questions.length, 3);
    });

    test("the trail count matches what the review delivers", async () => {
        const { trilha: trail, js, py } = await buildTrailWithTwoTracks();
        const student = await newUser();

        await complete(student.id, js.id);
        await complete(student.id, py.id);

        const { total } = await countTrailReview(trail.id);
        const cards = await trailReview(trail.id);

        assert.equal(total, cards.length);
    });
});

/** A lesson with N numbered cards, all already open in the student's deck. */
async function lessonWith(howMany: number, userId: string) {
    const [trail] = await db
        .insert(trails)
        .values({ name: "Trilha", trailLevel: "iniciante", description: "x" })
        .returning();
    const [module] = await db
        .insert(modules)
        .values({ trailId: trail.id, title: "M1", position: 1 })
        .returning();
    const [lesson] = await db
        .insert(lessons)
        .values({
            trailId: trail.id,
            moduleId: module.id,
            title: "Aula",
            position: 1,
            published: true,
        })
        .returning();

    await db.insert(flashcards).values(
        Array.from({ length: howMany }, (_, i) => ({
            lessonId: lesson.id,
            frente: `Pergunta ${i}?`,
            verso: `Resposta ${i}`,
            position: i,
        })),
    );
    await db.insert(lessonProgress).values({ userId, lessonId: lesson.id });
    await openLessonCards(userId, lesson.id);
    return { trilha: trail, aula: lesson };
}

/** Makes the card of a question due this many days ago. */
async function dueDaysAgo(userId: string, frente: string, days: number) {
    const [card] = await db.select().from(flashcards).where(eq(flashcards.frente, frente));
    await db
        .update(userCards)
        .set({ proximaRevisao: new Date(Date.now() - days * 86400000) })
        .where(and(eq(userCards.userId, userId), eq(userCards.origemId, card.id)));
}

describe("the queue serves the whole trail, not only what is due", () => {
    beforeEach(limparBanco);

    test("a card scheduled for the future stays in the queue", async () => {
        const student = await newUser();
        await lessonWith(5, student.id);
        // Everything scheduled for a week from now: under the old rule, empty queue.
        await db
            .update(userCards)
            .set({ proximaRevisao: new Date(Date.now() + 7 * 86400000) })
            .where(eq(userCards.userId, student.id));

        const queue = await dailyQueue(student.id);

        assert.equal(queue.length, 5, "the queue must serve what is not due yet");
    });

    test("the room and the trail review deliver the same amount", async () => {
        const student = await newUser();
        const { trilha: trail } = await lessonWith(8, student.id);
        // Half due, half in the future: the total cannot depend on that.
        const cards = await db.select().from(userCards).where(eq(userCards.userId, student.id));
        for (const [i, c] of cards.entries())
            await db
                .update(userCards)
                .set({
                    proximaRevisao: new Date(Date.now() + (i % 2 ? 5 : -5) * 86400000),
                })
                .where(eq(userCards.id, c.id));

        const room = await dailyQueue(student.id, 500, { trilhas: [trail.id] });
        const fromTrail = await trailReview(trail.id);

        assert.equal(room.length, fromTrail.length);
        assert.deepEqual(
            new Set(room.map((c) => c.frente)),
            new Set(fromTrail.map((c) => c.frente)),
        );
    });

    test("the twin is not counted twice in the room queue", async () => {
        const { trilha: trail, js, py } = await buildTrailWithTwoTracks();
        const student = await newUser();
        await complete(student.id, js.id);
        await complete(student.id, py.id);
        // Simulates the dirty deck from before the fix, with the twin opened by hand.
        const [twin] = await db
            .select()
            .from(flashcards)
            .where(eq(flashcards.frente, "O que é um algoritmo?"));
        await db
            .insert(userCards)
            .values({ userId: student.id, origem: "flashcard", origemId: twin.id })
            .onConflictDoNothing();

        const room = await dailyQueue(student.id, 500, { trilhas: [trail.id] });
        const questions = room.map((c) => c.frente);

        assert.equal(new Set(questions).size, questions.length, "question repeated in the room");
    });

    test("the limit still prioritizes the most overdue", async () => {
        const student = await newUser();
        await lessonWith(6, student.id);
        for (let i = 0; i < 6; i++) await dueDaysAgo(student.id, `Pergunta ${i}?`, 30 - i * 10);

        const queue = await dailyQueue(student.id, 2);

        assert.equal(queue.length, 2);
        assert.deepEqual(
            new Set(queue.map((c) => c.frente)),
            new Set(["Pergunta 0?", "Pergunta 1?"]),
        );
    });
});

/**
 * A published trail with N cards and nobody enrolled: no progress, no cards in a
 * deck. This is the free review scenario.
 */
async function freshTrail(howMany: number, name = "Área nova") {
    const [trail] = await db
        .insert(trails)
        .values({ name: name, trailLevel: "iniciante", description: "x" })
        .returning();
    const [module] = await db
        .insert(modules)
        .values({ trailId: trail.id, title: "M1", position: 1 })
        .returning();
    const [lesson] = await db
        .insert(lessons)
        .values({
            trailId: trail.id,
            moduleId: module.id,
            title: "Aula",
            position: 1,
            published: true,
        })
        .returning();
    await db.insert(flashcards).values(
        Array.from({ length: howMany }, (_, i) => ({
            lessonId: lesson.id,
            frente: `Crua ${i}?`,
            verso: `Resposta ${i}`,
            position: i,
        })),
    );
    return { trilha: trail, aula: lesson };
}

describe("reviewing an area without having taken the trail", () => {
    beforeEach(limparBanco);

    test("the trail review delivers everything even with no lesson completed", async () => {
        const student = await newUser();
        const { trilha: trail } = await freshTrail(7);

        const cards = await trailReview(trail.id);

        assert.equal(cards.length, 7);
        assert.equal((await countTrailReview(trail.id)).total, 7);
        // The deck stays untouched: only answering opens a card.
        const mine = await db.select().from(userCards).where(eq(userCards.userId, student.id));
        assert.equal(mine.length, 0);
    });

    test("the room serves the chosen area even with no progress in it", async () => {
        const student = await newUser();
        const { trilha: trail } = await freshTrail(5);

        const queue = await dailyQueue(student.id, 500, { trilhas: [trail.id] });

        assert.equal(queue.length, 5);
    });

    test("the chosen area mixes what is already the student's with what is missing", async () => {
        const student = await newUser();
        const { trilha: trail, aula: lesson } = await freshTrail(6);
        // Three cards already in the deck; the other three remain catalog only.
        const cards = await db.select().from(flashcards).where(eq(flashcards.lessonId, lesson.id));
        await db.insert(userCards).values(
            cards.slice(0, 3).map((c) => ({
                userId: student.id,
                origem: "flashcard" as const,
                origemId: c.id,
                proximaRevisao: new Date(),
            })),
        );

        const queue = await dailyQueue(student.id, 500, { trilhas: [trail.id] });
        const questions = queue.map((c) => c.frente);

        assert.equal(questions.length, 6, "the queue must add deck and catalog");
        assert.equal(new Set(questions).size, 6, "a deck card cannot come duplicated");
    });

    test("without choosing an area, the queue is still only the student's deck", async () => {
        const student = await newUser();
        await lessonWith(4, student.id);
        await freshTrail(9, "Área que ele nunca viu");

        const queue = await dailyQueue(student.id);

        assert.equal(queue.length, 4, "the whole deck cannot become the whole catalog");
    });

    test("answering a card from an unstudied lesson opens it in the deck", async () => {
        const student = await newUser();
        const { aula: lesson } = await freshTrail(3);
        const [card] = await db.select().from(flashcards).where(eq(flashcards.lessonId, lesson.id));

        await answerCard(student.id, "flashcard", card.id, "facil");

        const [opened] = await db
            .select()
            .from(userCards)
            .where(and(eq(userCards.userId, student.id), eq(userCards.origemId, card.id)));
        assert.ok(opened, "the card had to enter the deck on the first answer");
        assert.equal(opened.repeticoes, 1);
    });

    test("the area list brings a trail the student never opened", async () => {
        const student = await newUser();
        const { trilha: trail } = await freshTrail(11, "Zebra");

        const { trilhas: deckList } = await decks(student.id);
        const zebra = deckList.find((t) => t.id === trail.id);

        assert.ok(zebra, "the area had to show up to choose");
        assert.equal(zebra.total, 0, "he has none of its cards in the deck");
        assert.equal(zebra.disponiveis, 11, "and the whole area is available");
    });
});

describe("review queue order", () => {
    beforeEach(limparBanco);

    test("the limit still picks the most overdue cards", async () => {
        const student = await newUser();
        await lessonWith(6, student.id);
        // The higher the index, the more recent the due date.
        for (let i = 0; i < 6; i++) await dueDaysAgo(student.id, `Pergunta ${i}?`, 30 - i * 5);

        const queue = await dailyQueue(student.id, 3);

        assert.equal(queue.length, 3);
        assert.deepEqual(
            new Set(queue.map((c) => c.frente)),
            new Set(["Pergunta 0?", "Pergunta 1?", "Pergunta 2?"]),
            "the cut must take the three most overdue, not any three",
        );
    });

    test("the order the cards appear in varies between sessions", async () => {
        const student = await newUser();
        await lessonWith(10, student.id);

        const orders = new Set<string>();
        for (let i = 0; i < 6; i++) {
            orders.add((await dailyQueue(student.id)).map((c) => c.frente).join("|"));
        }

        // Six draws of ten cards all landing in the same order is practically
        // impossible: if it happens, there is no drawing at all.
        assert.ok(orders.size > 1, "the queue came out in the same order all six times");
    });

    test("the trail review is also shuffled", async () => {
        const student = await newUser();
        const { trilha: trail } = await lessonWith(10, student.id);

        const orders = new Set<string>();
        for (let i = 0; i < 6; i++) {
            orders.add((await trailReview(trail.id)).map((c) => c.frente).join("|"));
        }

        assert.ok(orders.size > 1, "the trail review came out in the same order all six times");
    });

    test("shuffling neither loses nor duplicates a card", async () => {
        const student = await newUser();
        await lessonWith(10, student.id);

        const queue = await dailyQueue(student.id);
        const questions = queue.map((c) => c.frente);

        assert.equal(questions.length, 10);
        assert.equal(new Set(questions).size, 10);
    });
});
