import { db } from "../../db.ts";
import { challenges, challengeTests, challengeSubmissions } from "../../schema.ts";
import { eq, and, desc, asc, inArray, gt, count, sql } from "drizzle-orm";
import type { z } from "zod";
import type { executarDesafioSchema, criarDesafioSchema } from "../schemas/desafio.schema.ts";
import { AppError } from "../errors/AppError.ts";
import { hojeSaoPaulo } from "./streak.ts";
import { executarNoRunner } from "./runner.client.ts";
import { corrigirDesafio, saidaCorreta, retornoCorreto, indiceDoDia } from "../domain/desafio.ts";
import { xpDoDesafio } from "../domain/xp.ts";

type Execucao = z.infer<typeof executarDesafioSchema>;
type DadosDesafio = z.infer<typeof criarDesafioSchema>;

async function buscarPublicado(id: string) {
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d || !d.published) throw new AppError(404, "Desafio não encontrado");
    return d;
}

async function jaResolveu(userId: string, challengeId: string): Promise<boolean> {
    const [r] = await db
        .select({ id: challengeSubmissions.id })
        .from(challengeSubmissions)
        .where(
            and(
                eq(challengeSubmissions.userId, userId),
                eq(challengeSubmissions.challengeId, challengeId),
                eq(challengeSubmissions.status, "passed"),
            ),
        )
        .limit(1);
    return !!r;
}

// Aceitação = submissões aprovadas / total, em %. Null quando não há submissões.
async function aceitacao(challengeId: string): Promise<number | null> {
    const [r] = await db
        .select({
            total: count(),
            passed: sql<number>`count(*) filter (where ${challengeSubmissions.status} = 'passed')`,
        })
        .from(challengeSubmissions)
        .where(eq(challengeSubmissions.challengeId, challengeId));
    const total = Number(r?.total ?? 0);
    if (total === 0) return null;
    return Math.round((Number(r?.passed ?? 0) / total) * 100);
}

async function montarView(
    d: typeof challenges.$inferSelect,
    userId: string,
    dailyId: string | null,
) {
    const publicos = await db
        .select({ input: challengeTests.input, expectedOutput: challengeTests.expectedOutput })
        .from(challengeTests)
        .where(and(eq(challengeTests.challengeId, d.id), eq(challengeTests.isPublic, true)))
        .orderBy(asc(challengeTests.position));
    return {
        id: d.id,
        number: d.number,
        title: d.title,
        topic: d.topic,
        statementBlocks: d.statementBlocks ?? [],
        difficulty: d.difficulty,
        kind: d.kind,
        entryPoint: d.entryPoint,
        xp: xpDoDesafio(d.difficulty),
        starterCode: d.starterCode ?? {},
        activeDate: d.activeDate,
        isToday: d.id === dailyId,
        exampleTests: publicos,
        acceptance: await aceitacao(d.id),
        solved: await jaResolveu(userId, d.id),
    };
}

// Id do desafio do dia: um fixado pelo admin (activeDate = hoje) ou, na falta,
// um escolhido deterministicamente entre os publicados (rotaciona por dia).
async function idDoDesafioDoDia(hoje: string): Promise<string | null> {
    const publicados = await db
        .select({ id: challenges.id, activeDate: challenges.activeDate, number: challenges.number })
        .from(challenges)
        .where(eq(challenges.published, true))
        .orderBy(asc(challenges.number));
    if (publicados.length === 0) return null;
    const fixado = publicados.find((c) => c.activeDate === hoje);
    if (fixado) return fixado.id;
    return publicados[indiceDoDia(hoje, publicados.length)].id;
}

// Desafio do dia: fixado pelo admin nesta data ou escolhido automaticamente.
export async function desafioDoDia(userId: string) {
    const id = await idDoDesafioDoDia(hojeSaoPaulo());
    if (!id) return null;
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d) return null;
    return montarView(d, userId, id);
}

// Banco de desafios: lista tudo que está publicado + o progresso do usuário (para o anel).
export async function listarDesafios(userId: string) {
    const hoje = hojeSaoPaulo();
    const todos = await db
        .select({
            id: challenges.id,
            number: challenges.number,
            title: challenges.title,
            topic: challenges.topic,
            difficulty: challenges.difficulty,
            activeDate: challenges.activeDate,
        })
        .from(challenges)
        .where(eq(challenges.published, true))
        .orderBy(desc(challenges.activeDate), asc(challenges.number));

    const vazio = { solved: 0, total: 0, pct: 0, easy: 0, medium: 0, hard: 0 };
    if (todos.length === 0) return { items: [], progress: vazio };

    const ids = todos.map((d) => d.id);
    const [minhas, contagens] = await Promise.all([
        db
            .select({
                challengeId: challengeSubmissions.challengeId,
                passou: sql<boolean>`bool_or(${challengeSubmissions.status} = 'passed')`,
            })
            .from(challengeSubmissions)
            .where(
                and(
                    eq(challengeSubmissions.userId, userId),
                    inArray(challengeSubmissions.challengeId, ids),
                ),
            )
            .groupBy(challengeSubmissions.challengeId),
        db
            .select({
                challengeId: challengeSubmissions.challengeId,
                total: count(),
                passed: sql<number>`count(*) filter (where ${challengeSubmissions.status} = 'passed')`,
            })
            .from(challengeSubmissions)
            .where(inArray(challengeSubmissions.challengeId, ids))
            .groupBy(challengeSubmissions.challengeId),
    ]);

    const statusPorDesafio = new Map(
        minhas.map((m) => [m.challengeId, m.passou ? "solved" : "attempted"] as const),
    );
    const aceitacaoPorDesafio = new Map(
        contagens.map((c) => {
            const total = Number(c.total);
            return [c.challengeId, total > 0 ? Math.round((Number(c.passed) / total) * 100) : null];
        }),
    );

    // Desafio do dia: fixado pelo admin ou determinístico entre os publicados.
    const fixado = todos.find((d) => d.activeDate === hoje);
    const ordenados = [...todos].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    const dailyId = fixado ? fixado.id : ordenados[indiceDoDia(hoje, ordenados.length)].id;

    const items = todos.map((d) => ({
        id: d.id,
        number: d.number,
        title: d.title,
        topic: d.topic,
        difficulty: d.difficulty,
        xp: xpDoDesafio(d.difficulty),
        acceptance: aceitacaoPorDesafio.get(d.id) ?? null,
        status: statusPorDesafio.get(d.id) ?? "todo",
        isToday: d.id === dailyId,
    }));

    const resolvidos = items.filter((i) => i.status === "solved");
    const contaDif = (arr: typeof items, dif: string) =>
        arr.filter((i) => i.difficulty === dif).length;
    const progress = {
        solved: resolvidos.length,
        total: todos.length,
        pct: todos.length ? Math.round((resolvidos.length / todos.length) * 100) : 0,
        easy: contaDif(resolvidos, "facil"),
        medium: contaDif(resolvidos, "medio"),
        hard: contaDif(resolvidos, "dificil"),
    };
    return { items, progress };
}

export async function detalheDesafio(userId: string, id: string) {
    const d = await buscarPublicado(id);
    const dailyId = await idDoDesafioDoDia(hojeSaoPaulo());
    return montarView(d, userId, dailyId);
}

// "Rodar exemplos": executa só contra os casos públicos e devolve o diff, sem gravar.
export async function rodarExemplos(userId: string, id: string, dados: Execucao) {
    const d = await buscarPublicado(id);
    const publicos = await db
        .select()
        .from(challengeTests)
        .where(and(eq(challengeTests.challengeId, id), eq(challengeTests.isPublic, true)))
        .orderBy(asc(challengeTests.position));
    if (publicos.length === 0) throw new AppError(400, "Este desafio não tem exemplos");

    const t0 = performance.now();
    const runner = await executarNoRunner(
        dados.language,
        dados.code,
        publicos.map((t) => t.input),
        d.kind,
        d.entryPoint,
    );
    const timeMs = Math.round(performance.now() - t0);
    if (runner.compileOutput) {
        return { compileError: runner.compileOutput, cases: [], timeMs };
    }
    const comparar = d.kind === "function" ? retornoCorreto : saidaCorreta;
    const cases = publicos.map((t, i) => {
        const r = runner.results[i];
        const got = r?.stdout ?? "";
        return {
            input: t.input,
            expected: t.expectedOutput,
            got,
            stderr: r?.stderr ?? "",
            timedOut: r?.timedOut ?? false,
            passed: !!r && !r.timedOut && r.exitCode === 0 && comparar(got, t.expectedOutput),
        };
    });
    return { compileError: null, cases, timeMs };
}

// Submissão: roda TODOS os casos, corrige no servidor e concede XP (por dificuldade) na
// primeira aprovação de qualquer desafio. Caso oculto nunca aparece no feedback.
export async function submeterDesafio(userId: string, id: string, dados: Execucao) {
    const d = await buscarPublicado(id);
    const testes = await db
        .select()
        .from(challengeTests)
        .where(eq(challengeTests.challengeId, id))
        .orderBy(asc(challengeTests.position));
    if (testes.length === 0) throw new AppError(400, "Este desafio ainda não tem casos de teste");

    const t0 = performance.now();
    const runner = await executarNoRunner(
        dados.language,
        dados.code,
        testes.map((t) => t.input),
        d.kind,
        d.entryPoint,
    );
    const timeMs = Math.round(performance.now() - t0);

    const correcao = corrigirDesafio(
        testes.map((t) => t.expectedOutput),
        runner.results.map((r) => ({
            stdout: r.stdout,
            exitCode: r.exitCode,
            timedOut: r.timedOut,
        })),
        d.kind,
    );

    let status: "passed" | "failed" | "error" | "timeout";
    let output: string | null = null;
    if (runner.compileOutput) {
        status = "error";
        output = runner.compileOutput;
    } else if (correcao.aprovado) {
        status = "passed";
    } else {
        const idxPub = testes.findIndex((t, i) => t.isPublic && !correcao.casos[i]);
        if (idxPub >= 0) {
            const r = runner.results[idxPub];
            output = r?.timedOut
                ? "Tempo limite excedido em um dos exemplos."
                : `Exemplo falhou.\nEntrada:\n${testes[idxPub].input}\nEsperado:\n${testes[idxPub].expectedOutput}\nObtido:\n${r?.stdout ?? ""}`;
        }
        status = runner.results.some((r) => r.timedOut) ? "timeout" : "failed";
    }

    // XP por dificuldade, uma única vez por desafio (idempotente pelo xp_earned > 0).
    let xpEarned = 0;
    if (correcao.aprovado) {
        const [jaGanhou] = await db
            .select({ id: challengeSubmissions.id })
            .from(challengeSubmissions)
            .where(
                and(
                    eq(challengeSubmissions.userId, userId),
                    eq(challengeSubmissions.challengeId, id),
                    gt(challengeSubmissions.xpEarned, 0),
                ),
            )
            .limit(1);
        if (!jaGanhou) xpEarned = xpDoDesafio(d.difficulty);
    }

    await db.insert(challengeSubmissions).values({
        userId,
        challengeId: id,
        language: dados.language,
        code: dados.code,
        status,
        passedCount: correcao.acertos,
        totalCount: correcao.total,
        output,
        xpEarned,
    });

    return {
        status,
        passed: correcao.aprovado,
        passedCount: correcao.acertos,
        totalCount: correcao.total,
        xpEarned,
        output,
        timeMs,
    };
}

// ===================== ADMIN =====================

export async function listarDesafiosAdmin() {
    const lista = await db
        .select({
            id: challenges.id,
            number: challenges.number,
            title: challenges.title,
            topic: challenges.topic,
            difficulty: challenges.difficulty,
            activeDate: challenges.activeDate,
            published: challenges.published,
            testes: sql<number>`(select count(*) from ${challengeTests} where ${challengeTests.challengeId} = ${challenges.id})`,
        })
        .from(challenges)
        .orderBy(desc(challenges.activeDate), desc(challenges.createdAt));
    return lista.map((d) => ({ ...d, testes: Number(d.testes) }));
}

export async function detalheDesafioAdmin(id: string) {
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d) throw new AppError(404, "Desafio não encontrado");
    const testes = await db
        .select()
        .from(challengeTests)
        .where(eq(challengeTests.challengeId, id))
        .orderBy(asc(challengeTests.position));
    return {
        ...d,
        statementBlocks: d.statementBlocks ?? [],
        starterCode: d.starterCode ?? {},
        tests: testes,
    };
}

async function garantirDataLivre(activeDate: string | null | undefined, ignorarId?: string) {
    if (!activeDate) return;
    const [conflito] = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.activeDate, activeDate));
    if (conflito && conflito.id !== ignorarId) {
        throw new AppError(409, "Já existe um desafio nessa data");
    }
}

// Próximo número livre quando o admin não informa um.
async function proximoNumero(): Promise<number> {
    const [r] = await db.select({ max: sql<number>`max(${challenges.number})` }).from(challenges);
    return Number(r?.max ?? 0) + 1;
}

export async function criarDesafio(dados: DadosDesafio) {
    await garantirDataLivre(dados.activeDate ?? null);
    const numero = dados.number ?? (await proximoNumero());
    return db.transaction(async (tx) => {
        const [d] = await tx
            .insert(challenges)
            .values({
                number: numero,
                title: dados.title,
                topic: dados.topic || null,
                kind: dados.kind,
                entryPoint: dados.entryPoint || null,
                statementBlocks: dados.statementBlocks,
                difficulty: dados.difficulty,
                starterCode: dados.starterCode,
                activeDate: dados.activeDate ?? null,
                published: dados.published,
            })
            .returning();
        await tx.insert(challengeTests).values(
            dados.tests.map((t, i) => ({
                challengeId: d.id,
                input: t.input,
                expectedOutput: t.expectedOutput,
                isPublic: t.isPublic,
                position: i + 1,
            })),
        );
        return { id: d.id };
    });
}

export async function atualizarDesafio(id: string, dados: DadosDesafio) {
    const [existe] = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.id, id));
    if (!existe) throw new AppError(404, "Desafio não encontrado");
    await garantirDataLivre(dados.activeDate ?? null, id);
    await db.transaction(async (tx) => {
        await tx
            .update(challenges)
            .set({
                title: dados.title,
                topic: dados.topic || null,
                number: dados.number ?? undefined,
                kind: dados.kind,
                entryPoint: dados.entryPoint || null,
                statementBlocks: dados.statementBlocks,
                difficulty: dados.difficulty,
                starterCode: dados.starterCode,
                activeDate: dados.activeDate ?? null,
                published: dados.published,
            })
            .where(eq(challenges.id, id));
        await tx.delete(challengeTests).where(eq(challengeTests.challengeId, id));
        await tx.insert(challengeTests).values(
            dados.tests.map((t, i) => ({
                challengeId: id,
                input: t.input,
                expectedOutput: t.expectedOutput,
                isPublic: t.isPublic,
                position: i + 1,
            })),
        );
    });
    return { ok: true };
}

export async function excluirDesafio(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(challengeSubmissions).where(eq(challengeSubmissions.challengeId, id));
        await tx.delete(challengeTests).where(eq(challengeTests.challengeId, id));
        await tx.delete(challenges).where(eq(challenges.id, id));
    });
    return { ok: true };
}
