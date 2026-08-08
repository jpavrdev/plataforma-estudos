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
    abrirCartoesDaAula,
    contarRevisaoDaTrilha,
    filaDoDia,
    revisaoDaTrilha,
} from "../src/services/flashcard.service.ts";

/**
 * Trilha com dois trilhos de linguagem: a mesma aula existe duas vezes, uma em
 * JavaScript e outra em Python, na mesma posição. O cartão conceitual ("O que é um
 * algoritmo?") vale para os dois e por isso foi semeado nas duas aulas, em linhas
 * diferentes com a mesma pergunta. Cada trilho ainda tem o cartão de sintaxe dele.
 */
async function montarTrilhaComDoisTrilhos() {
    const [trilha] = await db
        .insert(trails)
        .values({ name: "Lógica", trailLevel: "iniciante", description: "trilha de teste" })
        .returning();
    const [modulo] = await db
        .insert(modules)
        .values({ trailId: trilha.id, title: "Módulo 1", position: 1 })
        .returning();

    const aulaDe = async (language: string) => {
        const [aula] = await db
            .insert(lessons)
            .values({
                trailId: trilha.id,
                moduleId: modulo.id,
                title: `Algoritmos em ${language}`,
                position: 1,
                published: true,
                language,
            })
            .returning();
        await db.insert(flashcards).values([
            {
                lessonId: aula.id,
                frente: "O que é um algoritmo?",
                verso: "Sequência de passos",
                position: 0,
            },
            {
                lessonId: aula.id,
                frente: `Como declarar variável em ${language}?`,
                verso: "Depende da linguagem",
                position: 1,
            },
        ]);
        return aula;
    };

    return { trilha, js: await aulaDe("javascript"), py: await aulaDe("python") };
}

async function novoAluno() {
    const [aluno] = await db
        .insert(users)
        .values({
            name: "Aluno",
            email: `aluno_${Math.random().toString(36).slice(2)}@email.com`,
            passwordHash: "x",
        })
        .returning();
    return aluno;
}

async function concluir(userId: string, lessonId: string) {
    await db.insert(lessonProgress).values({ userId, lessonId, completedAt: new Date() });
    await abrirCartoesDaAula(userId, lessonId);
}

describe("cartões em trilha com trilhos de linguagem", () => {
    beforeEach(limparBanco);

    test("aluno que estudou os dois trilhos recebe a pergunta comum uma vez só", async () => {
        const { js, py } = await montarTrilhaComDoisTrilhos();
        const aluno = await novoAluno();

        await concluir(aluno.id, js.id);
        await concluir(aluno.id, py.id);

        const fila = await filaDoDia(aluno.id);
        const perguntas = fila.map((c) => c.frente).sort();

        assert.deepEqual(perguntas, [
            "Como declarar variável em javascript?",
            "Como declarar variável em python?",
            "O que é um algoritmo?",
        ]);
    });

    test("aluno de um trilho só continua recebendo a pergunta comum", async () => {
        const { py } = await montarTrilhaComDoisTrilhos();
        const aluno = await novoAluno();

        await concluir(aluno.id, py.id);

        const perguntas = (await filaDoDia(aluno.id)).map((c) => c.frente).sort();
        assert.deepEqual(perguntas, ["Como declarar variável em python?", "O que é um algoritmo?"]);
    });

    test("a revisão da trilha não repete a pergunta comum", async () => {
        const { trilha, js, py } = await montarTrilhaComDoisTrilhos();
        const aluno = await novoAluno();

        await concluir(aluno.id, js.id);
        await concluir(aluno.id, py.id);

        const cartoes = await revisaoDaTrilha(aluno.id, trilha.id);
        const perguntas = cartoes.map((c) => c.frente);

        assert.equal(new Set(perguntas).size, perguntas.length, "pergunta repetida na revisão");
        assert.equal(perguntas.length, 3);
    });

    test("a contagem da trilha bate com o que a revisão entrega", async () => {
        const { trilha, js, py } = await montarTrilhaComDoisTrilhos();
        const aluno = await novoAluno();

        await concluir(aluno.id, js.id);
        await concluir(aluno.id, py.id);

        const { total } = await contarRevisaoDaTrilha(aluno.id, trilha.id);
        const cartoes = await revisaoDaTrilha(aluno.id, trilha.id);

        assert.equal(total, cartoes.length);
    });
});

/** Uma aula com N cartas numeradas, todas já abertas no baralho do aluno. */
async function aulaCom(quantas: number, userId: string) {
    const [trilha] = await db
        .insert(trails)
        .values({ name: "Trilha", trailLevel: "iniciante", description: "x" })
        .returning();
    const [modulo] = await db
        .insert(modules)
        .values({ trailId: trilha.id, title: "M1", position: 1 })
        .returning();
    const [aula] = await db
        .insert(lessons)
        .values({
            trailId: trilha.id,
            moduleId: modulo.id,
            title: "Aula",
            position: 1,
            published: true,
        })
        .returning();

    await db.insert(flashcards).values(
        Array.from({ length: quantas }, (_, i) => ({
            lessonId: aula.id,
            frente: `Pergunta ${i}?`,
            verso: `Resposta ${i}`,
            position: i,
        })),
    );
    await db.insert(lessonProgress).values({ userId, lessonId: aula.id });
    await abrirCartoesDaAula(userId, aula.id);
    return { trilha, aula };
}

/** Vence a carta de uma pergunta há tantos dias. */
async function vencerHa(userId: string, frente: string, dias: number) {
    const [card] = await db.select().from(flashcards).where(eq(flashcards.frente, frente));
    await db
        .update(userCards)
        .set({ proximaRevisao: new Date(Date.now() - dias * 86400000) })
        .where(and(eq(userCards.userId, userId), eq(userCards.origemId, card.id)));
}

describe("ordem da fila de revisão", () => {
    beforeEach(limparBanco);

    test("o limite continua escolhendo as cartas mais atrasadas", async () => {
        const aluno = await novoAluno();
        await aulaCom(6, aluno.id);
        // Quanto maior o índice, mais recente o vencimento.
        for (let i = 0; i < 6; i++) await vencerHa(aluno.id, `Pergunta ${i}?`, 30 - i * 5);

        const fila = await filaDoDia(aluno.id, 3);

        assert.equal(fila.length, 3);
        assert.deepEqual(
            new Set(fila.map((c) => c.frente)),
            new Set(["Pergunta 0?", "Pergunta 1?", "Pergunta 2?"]),
            "o corte tem de pegar as três mais atrasadas, e não três quaisquer",
        );
    });

    test("a ordem em que as cartas aparecem varia entre sessões", async () => {
        const aluno = await novoAluno();
        await aulaCom(10, aluno.id);

        const ordens = new Set<string>();
        for (let i = 0; i < 6; i++) {
            ordens.add((await filaDoDia(aluno.id)).map((c) => c.frente).join("|"));
        }

        // Seis sorteios de dez cartas caindo todos na mesma ordem é praticamente
        // impossível: se acontecer, é porque não há sorteio nenhum.
        assert.ok(ordens.size > 1, "a fila saiu na mesma ordem nas seis vezes");
    });

    test("a revisão da trilha também sai sorteada", async () => {
        const aluno = await novoAluno();
        const { trilha } = await aulaCom(10, aluno.id);

        const ordens = new Set<string>();
        for (let i = 0; i < 6; i++) {
            ordens.add((await revisaoDaTrilha(aluno.id, trilha.id)).map((c) => c.frente).join("|"));
        }

        assert.ok(ordens.size > 1, "a revisão da trilha saiu na mesma ordem nas seis vezes");
    });

    test("sortear não perde nem duplica carta", async () => {
        const aluno = await novoAluno();
        await aulaCom(10, aluno.id);

        const fila = await filaDoDia(aluno.id);
        const perguntas = fila.map((c) => c.frente);

        assert.equal(perguntas.length, 10);
        assert.equal(new Set(perguntas).size, 10);
    });
});
