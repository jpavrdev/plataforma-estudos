import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Teste",
    email: `exporta_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `exporta_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function createSignedInUser() {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, data.email));
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return login.body.token as string;
}

async function buildTrail() {
    const { db } = await import("../db.ts");
    const { trails, modules, lessons, flashcards } = await import("../schema.ts");
    const [trail] = await db
        .insert(trails)
        .values({ name: "Lógica de Programação", trailLevel: "iniciante", description: "x" })
        .returning();
    const [firstModule] = await db
        .insert(modules)
        .values({ trailId: trail.id, title: "M1", position: 1 })
        .returning();
    const [secondModule] = await db
        .insert(modules)
        .values({ trailId: trail.id, title: "M2", position: 2 })
        .returning();
    const lesson = async (moduleId: string, title: string, published = true, language?: string) => {
        const [row] = await db
            .insert(lessons)
            .values({ trailId: trail.id, moduleId, title, position: 1, published, language })
            .returning();
        return row;
    };
    const late = await lesson(secondModule.id, "Funções");
    const early = await lesson(firstModule.id, "Variáveis", true, "javascript");
    const twin = await lesson(firstModule.id, "Variáveis", true, "python");
    const draft = await lesson(secondModule.id, "Rascunho", false);

    await db.insert(flashcards).values([
        {
            lessonId: late.id,
            frente: "O que é uma função?",
            verso: "Bloco, reutilizável",
            position: 0,
        },
        { lessonId: early.id, frente: 'O que faz "let"?', verso: "Declara\nvariável", position: 1 },
        { lessonId: early.id, frente: "=1+1 é fórmula?", verso: "Não", position: 0 },
        { lessonId: twin.id, frente: "=1+1 é fórmula?", verso: "Não", position: 0 },
        { lessonId: draft.id, frente: "Não publicado?", verso: "Fica de fora", position: 0 },
    ]);
    return { trail, late };
}

async function exportCsv(
    trailId: string,
    token?: string,
    query = "?formato=csv",
    locale = "pt-BR",
) {
    const headers: Record<string, string> = { "X-Locale": locale };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${server.base}/flashcards/trilha/${trailId}${query}`, { headers });
    const disposition = res.headers.get("content-disposition") ?? "";
    return {
        status: res.status,
        contentType: res.headers.get("content-type") ?? "",
        fileName: /filename="([^"]+)"/.exec(disposition)?.[1],
        body: new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer()),
    };
}

before(async () => {
    server = await startTestServer();
});

after(async () => {
    await server.close();
});

describe("exporting a trail's flashcards", () => {
    beforeEach(limparBanco);

    test("downloads every published card of the trail as CSV, in trail order and without twins", async () => {
        const token = await createSignedInUser();
        const { trail } = await buildTrail();

        const res = await exportCsv(trail.id, token);

        assert.equal(res.status, 200);
        assert.match(res.contentType, /^text\/csv; charset=utf-8/);
        assert.equal(res.fileName, "logica-de-programacao-flashcards.csv");
        assert.equal(
            res.body,
            "﻿" +
                [
                    "frente,verso,aula,trilha",
                    "'=1+1 é fórmula?,Não,Variáveis,Lógica de Programação",
                    '"O que faz ""let""?","Declara\nvariável",Variáveis,Lógica de Programação',
                    'O que é uma função?,"Bloco, reutilizável",Funções,Lógica de Programação',
                ].join("\r\n") +
                "\r\n",
        );
    });

    test("does not require any progress in the trail", async () => {
        const token = await createSignedInUser();
        const { trail } = await buildTrail();

        const res = await exportCsv(trail.id, token);

        assert.equal(res.status, 200);
        assert.equal(res.body.trim().split("\r\n").length, 4);
    });

    test("uses the translated header, trail name and lesson titles in English", async () => {
        const { db } = await import("../db.ts");
        const { trailTranslations, lessonTranslations } = await import("../schema.ts");
        const token = await createSignedInUser();
        const { trail, late } = await buildTrail();
        await db.insert(trailTranslations).values({
            trailId: trail.id,
            locale: "en",
            name: "Programming Logic",
            description: "x",
        });
        await db
            .insert(lessonTranslations)
            .values({ lessonId: late.id, locale: "en", title: "Functions" });

        const res = await exportCsv(trail.id, token, "?formato=csv", "en");

        assert.equal(res.status, 200);
        assert.equal(res.fileName, "programming-logic-flashcards.csv");
        const lines = res.body.slice(1).trim().split("\r\n");
        assert.equal(lines[0], "front,back,lesson,trail");
        assert.equal(
            lines.at(-1),
            'O que é uma função?,"Bloco, reutilizável",Functions,Programming Logic',
        );
    });

    test("without the format the route still answers the review as JSON", async () => {
        const token = await createSignedInUser();
        const { trail } = await buildTrail();

        const res = await exportCsv(trail.id, token, "");

        assert.equal(res.status, 200);
        assert.equal(JSON.parse(res.body).length, 3);
    });

    test("rejects an unknown format", async () => {
        const token = await createSignedInUser();
        const { trail } = await buildTrail();

        const res = await exportCsv(trail.id, token, "?formato=pdf");

        assert.equal(res.status, 400);
    });

    test("requires a signed-in user", async () => {
        const { trail } = await buildTrail();

        const res = await exportCsv(trail.id);

        assert.equal(res.status, 401);
    });

    test("answers 404 for a trail that does not exist or is not an id", async () => {
        const token = await createSignedInUser();

        assert.equal((await exportCsv("00000000-0000-0000-0000-000000000000", token)).status, 404);
        assert.equal((await exportCsv("nao-e-id", token)).status, 404);
    });

    test("answers 404 for a trail without published cards", async () => {
        const { db } = await import("../db.ts");
        const { trails } = await import("../schema.ts");
        const token = await createSignedInUser();
        const [empty] = await db
            .insert(trails)
            .values({ name: "Vazia", trailLevel: "iniciante", description: "x" })
            .returning();

        const res = await exportCsv(empty.id, token);

        assert.equal(res.status, 404);
    });
});
