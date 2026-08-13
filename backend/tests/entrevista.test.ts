import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { limparBanco } from "./helpers/db.ts";
import { db } from "../db.ts";
import { interviewCards, interviewTopics, userCards, users } from "../schema.ts";
import { and, eq } from "drizzle-orm";
import { ateONivel, fila, resumo, topicos } from "../src/services/entrevista.service.ts";
import { filaDoDia, responder } from "../src/services/flashcard.service.ts";

async function criarUsuario(email = "entrevista@teste.dev") {
    const [user] = await db
        .insert(users)
        .values({ name: "Aluno", email, passwordHash: "x" })
        .returning();
    return user;
}

/** Dois tópicos, uma pergunta por nível em cada: oito cartas ao todo. */
async function montarBanco() {
    const [go] = await db
        .insert(interviewTopics)
        .values({ slug: "go", nome: "Go", position: 1 })
        .returning();
    const [docker] = await db
        .insert(interviewTopics)
        .values({ slug: "docker", nome: "Docker", position: 2 })
        .returning();

    const niveis = ["estagio", "junior", "pleno", "senior"] as const;
    for (const topico of [go, docker]) {
        for (const [i, nivel] of niveis.entries()) {
            await db.insert(interviewCards).values({
                topicoId: topico.id,
                nivel,
                frente: `${topico.nome} ${nivel}?`,
                verso: `resposta de ${topico.nome} em ${nivel}`,
                position: i + 1,
            });
        }
    }
    return { go, docker };
}

describe("modo entrevista", () => {
    beforeEach(async () => {
        await limparBanco();
    });

    test("o nível é cumulativo: pleno traz estágio, júnior e pleno", () => {
        assert.deepEqual(ateONivel("estagio"), ["estagio"]);
        assert.deepEqual(ateONivel("pleno"), ["estagio", "junior", "pleno"]);
        assert.deepEqual(ateONivel("senior"), ["estagio", "junior", "pleno", "senior"]);
    });

    test("a fila de pleno traz os três níveis, e a de estágio só um", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const dePleno = await fila(user.id, { nivel: "pleno" });
        assert.equal(dePleno.length, 6);
        assert.ok(!dePleno.some((c) => c.nivel === "senior"));

        const deEstagio = await fila(user.id, { nivel: "estagio" });
        assert.equal(deEstagio.length, 2);
        assert.ok(deEstagio.every((c) => c.nivel === "estagio"));
    });

    test("escolher um tópico deixa o outro de fora", async () => {
        const { go } = await montarBanco();
        const user = await criarUsuario();

        const so = await fila(user.id, { nivel: "senior", topicos: [go.id] });
        assert.equal(so.length, 4);
        assert.ok(so.every((c) => c.topico === "Go"));
    });

    test("a contagem por tópico respeita o nível escolhido", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const ateJunior = await topicos(user.id, "junior");
        assert.equal(ateJunior.length, 2);
        assert.ok(ateJunior.every((t) => t.total === 2));
        assert.ok(ateJunior.every((t) => t.vistas === 0));
    });

    test("responder abre a carta no baralho e conta como vista", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const [carta] = await fila(user.id, { nivel: "estagio" });
        await responder(user.id, "entrevista", carta.id, "facil");

        const [linha] = await db
            .select()
            .from(userCards)
            .where(and(eq(userCards.userId, user.id), eq(userCards.origem, "entrevista")));
        assert.ok(linha, "a carta respondida vira linha em user_cards");
        assert.equal(linha.origemId, carta.id);

        const depois = await topicos(user.id, "estagio");
        const total = depois.reduce((s, t) => s + t.vistas, 0);
        assert.equal(total, 1);
    });

    test("passear pelo modo sem responder não incha o baralho", async () => {
        await montarBanco();
        const user = await criarUsuario();

        await fila(user.id, { nivel: "senior" });
        await topicos(user.id, "senior");

        const linhas = await db.select().from(userCards).where(eq(userCards.userId, user.id));
        assert.equal(linhas.length, 0);
    });

    test("o resumo separa o que já foi visto do que ainda é novo", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const antes = await resumo(user.id, "senior");
        assert.equal(antes.total, 8);
        assert.equal(antes.novas, 8);
        assert.equal(antes.vistas, 0);

        const [carta] = await fila(user.id, { nivel: "senior" });
        await responder(user.id, "entrevista", carta.id, "dificil");

        const depois = await resumo(user.id, "senior");
        assert.equal(depois.total, 8);
        assert.equal(depois.novas, 7);
        assert.equal(depois.vistas, 1);
    });

    // A carta de entrevista compartilha o baralho, então ela precisa voltar pela
    // revisão do dia como qualquer outra. Sem isto ela sumiria depois da primeira
    // resposta, e o agendamento não serviria para nada.
    test("carta de entrevista respondida volta na fila do dia", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const [carta] = await fila(user.id, { nivel: "estagio" });
        await responder(user.id, "entrevista", carta.id, "errei");

        const doDia = await filaDoDia(user.id, 50);
        const achada = doDia.find((c) => c.id === carta.id);
        assert.ok(achada, "a carta respondida aparece na revisão do dia");
        assert.equal(achada.origem, "entrevista");
        assert.equal(achada.topico, carta.topico);
        assert.equal(achada.trilhaId, null);
    });

    // A revisão de trilha continua sendo de trilha: o catálogo de entrevista não
    // pode vazar para lá, senão o aluno que escolhe uma área recebe pergunta de
    // entrevista sem ter pedido.
    test("a fila do dia não serve entrevista que o aluno nunca abriu", async () => {
        await montarBanco();
        const user = await criarUsuario();

        const doDia = await filaDoDia(user.id, 50);
        assert.equal(doDia.length, 0);
    });
});
