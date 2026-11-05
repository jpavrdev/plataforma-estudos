import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { limparBanco } from "./helpers/db.ts";
import { db } from "../db.ts";
import { interviewCards, interviewTopics, userCards, users } from "../schema.ts";
import { and, eq } from "drizzle-orm";
import {
    levelsUpTo,
    buildQueue,
    summarizeProgress,
    listTopics,
} from "../src/services/interview.service.ts";
import { filaDoDia, responder } from "../src/services/flashcard.service.ts";

async function createUser(email = "entrevista@teste.dev") {
    const [user] = await db
        .insert(users)
        .values({ name: "Aluno", email, passwordHash: "x" })
        .returning();
    return user;
}

/** Two topics, one question per level in each: eight cards in total. */
async function seedCards() {
    const [go] = await db
        .insert(interviewTopics)
        .values({ slug: "go", nome: "Go", position: 1 })
        .returning();
    const [docker] = await db
        .insert(interviewTopics)
        .values({ slug: "docker", nome: "Docker", position: 2 })
        .returning();

    const levels = ["estagio", "junior", "pleno", "senior"] as const;
    for (const topic of [go, docker]) {
        for (const [i, level] of levels.entries()) {
            await db.insert(interviewCards).values({
                topicoId: topic.id,
                nivel: level,
                frente: `${topic.nome} ${level}?`,
                verso: `resposta de ${topic.nome} em ${level}`,
                position: i + 1,
            });
        }
    }
    return { go, docker };
}

describe("interview mode", () => {
    beforeEach(async () => {
        await limparBanco();
    });

    test("the level is cumulative: pleno brings estagio, junior and pleno", () => {
        assert.deepEqual(levelsUpTo("estagio"), ["estagio"]);
        assert.deepEqual(levelsUpTo("pleno"), ["estagio", "junior", "pleno"]);
        assert.deepEqual(levelsUpTo("senior"), ["estagio", "junior", "pleno", "senior"]);
    });

    test("the pleno queue brings three levels, and the estagio one only one", async () => {
        await seedCards();
        const user = await createUser();

        const plenoQueue = await buildQueue(user.id, { nivel: "pleno" });
        assert.equal(plenoQueue.length, 6);
        assert.ok(!plenoQueue.some((c) => c.nivel === "senior"));

        const estagioQueue = await buildQueue(user.id, { nivel: "estagio" });
        assert.equal(estagioQueue.length, 2);
        assert.ok(estagioQueue.every((c) => c.nivel === "estagio"));
    });

    test("choosing one topic leaves the other out", async () => {
        const { go } = await seedCards();
        const user = await createUser();

        const only = await buildQueue(user.id, { nivel: "senior", topicos: [go.id] });
        assert.equal(only.length, 4);
        assert.ok(only.every((c) => c.topico === "Go"));
    });

    test("the count per topic respects the chosen level", async () => {
        await seedCards();
        const user = await createUser();

        const upToJunior = await listTopics(user.id, "junior");
        assert.equal(upToJunior.length, 2);
        assert.ok(upToJunior.every((t) => t.total === 2));
        assert.ok(upToJunior.every((t) => t.vistas === 0));
    });

    test("answering opens the card in the deck and counts it as seen", async () => {
        await seedCards();
        const user = await createUser();

        const [card] = await buildQueue(user.id, { nivel: "estagio" });
        await responder(user.id, "entrevista", card.id, "facil");

        const [row] = await db
            .select()
            .from(userCards)
            .where(and(eq(userCards.userId, user.id), eq(userCards.origem, "entrevista")));
        assert.ok(row, "the answered card becomes a user_cards row");
        assert.equal(row.origemId, card.id);

        const after = await listTopics(user.id, "estagio");
        const total = after.reduce((s, t) => s + t.vistas, 0);
        assert.equal(total, 1);
    });

    test("browsing the mode without answering does not bloat the deck", async () => {
        await seedCards();
        const user = await createUser();

        await buildQueue(user.id, { nivel: "senior" });
        await listTopics(user.id, "senior");

        const rows = await db.select().from(userCards).where(eq(userCards.userId, user.id));
        assert.equal(rows.length, 0);
    });

    test("the summary separates what was seen from what is still new", async () => {
        await seedCards();
        const user = await createUser();

        const before = await summarizeProgress(user.id, "senior");
        assert.equal(before.total, 8);
        assert.equal(before.novas, 8);
        assert.equal(before.vistas, 0);

        const [card] = await buildQueue(user.id, { nivel: "senior" });
        await responder(user.id, "entrevista", card.id, "dificil");

        const after = await summarizeProgress(user.id, "senior");
        assert.equal(after.total, 8);
        assert.equal(after.novas, 7);
        assert.equal(after.vistas, 1);
    });

    // The interview card shares the deck, only it has to come back through the daily
    // review like any other. Without this it would vanish after the first answer, and
    // the scheduling would be useless.
    test("an answered interview card comes back in the daily queue", async () => {
        await seedCards();
        const user = await createUser();

        const [card] = await buildQueue(user.id, { nivel: "estagio" });
        await responder(user.id, "entrevista", card.id, "errei");

        const daily = await filaDoDia(user.id, 50);
        const found = daily.find((c) => c.id === card.id);
        assert.ok(found, "the answered card shows up in the daily review");
        assert.equal(found.origem, "entrevista");
        assert.equal(found.topico, card.topico);
        assert.equal(found.trilhaId, null);
    });

    // The track review stays about tracks: the interview catalog cannot leak there,
    // or the student who picks an area gets interview questions without asking.
    test("the daily queue does not serve interviews the student never opened", async () => {
        await seedCards();
        const user = await createUser();

        const daily = await filaDoDia(user.id, 50);
        assert.equal(daily.length, 0);
    });
});
