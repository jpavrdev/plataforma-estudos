import { db } from "../../db.ts";
import {
    challenges,
    challengeTests,
    challengeSubmissions,
    challengeComments,
    users,
} from "../../schema.ts";
import { eq, and, desc, asc, inArray, gt, count, sql } from "drizzle-orm";
import type { z } from "zod";
import type {
    runChallengeSchema,
    createChallengeSchema,
    challengeCommentSchema,
} from "../schemas/challenge.schema.ts";
import { AppError } from "../errors/AppError.ts";
import { todayInSaoPaulo } from "./streak.ts";
import { runOnRunner } from "./runner.client.ts";
import { gradeChallenge, outputMatches, returnMatches, dayIndex } from "../domain/challenge.ts";
import { challengeXp } from "../domain/xp.ts";
import { checkAchievements } from "./achievement.service.ts";
import { userLevels } from "./community.service.ts";

type RunInput = z.infer<typeof runChallengeSchema>;
type ChallengeData = z.infer<typeof createChallengeSchema>;
type CommentInput = z.infer<typeof challengeCommentSchema>;

async function findPublished(id: string) {
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d || !d.published) throw new AppError(404, "challenge.notFound");
    return d;
}

async function hasSolved(userId: string, challengeId: string): Promise<boolean> {
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

// Acceptance = passed submissions / total, in %. Null when there are no submissions.
async function acceptanceRate(challengeId: string): Promise<number | null> {
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

// The user's last accepted solution, to reopen the challenge with their code.
async function lastAcceptedSolution(userId: string, challengeId: string) {
    const [s] = await db
        .select({
            language: challengeSubmissions.language,
            code: challengeSubmissions.code,
            durationSeconds: challengeSubmissions.durationSeconds,
            createdAt: challengeSubmissions.createdAt,
        })
        .from(challengeSubmissions)
        .where(
            and(
                eq(challengeSubmissions.userId, userId),
                eq(challengeSubmissions.challengeId, challengeId),
                eq(challengeSubmissions.status, "passed"),
            ),
        )
        .orderBy(desc(challengeSubmissions.createdAt))
        .limit(1);
    return s ?? null;
}

async function buildView(
    d: typeof challenges.$inferSelect,
    userId: string,
    dailyId: string | null,
) {
    const publicTests = await db
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
        xp: challengeXp(d.difficulty),
        starterCode: d.starterCode ?? {},
        activeDate: d.activeDate,
        isToday: d.id === dailyId,
        exampleTests: publicTests,
        acceptance: await acceptanceRate(d.id),
        solved: await hasSolved(userId, d.id),
        minhaSolucao: await lastAcceptedSolution(userId, d.id),
    };
}

// Id of the challenge of the day: one pinned by the admin (activeDate = today) or,
// failing that, one picked deterministically among the published ones (rotates daily).
async function dailyChallengeId(today: string): Promise<string | null> {
    const publishedChallenges = await db
        .select({ id: challenges.id, activeDate: challenges.activeDate, number: challenges.number })
        .from(challenges)
        .where(eq(challenges.published, true))
        .orderBy(asc(challenges.number));
    if (publishedChallenges.length === 0) return null;
    const pinned = publishedChallenges.find((c) => c.activeDate === today);
    if (pinned) return pinned.id;
    return publishedChallenges[dayIndex(today, publishedChallenges.length)].id;
}

// Challenge of the day: pinned by the admin for this date or picked automatically.
export async function findDailyChallenge(userId: string) {
    const id = await dailyChallengeId(todayInSaoPaulo());
    if (!id) return null;
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d) return null;
    return buildView(d, userId, id);
}

// Challenge bank: lists everything published + the user's progress (for the ring).
export async function findChallenges(userId: string) {
    const today = todayInSaoPaulo();
    const allChallenges = await db
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

    const emptyProgress = { solved: 0, total: 0, pct: 0, easy: 0, medium: 0, hard: 0 };
    if (allChallenges.length === 0) return { items: [], progress: emptyProgress };

    const ids = allChallenges.map((d) => d.id);
    const [mine, counts] = await Promise.all([
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

    const statusByChallenge = new Map(
        mine.map((m) => [m.challengeId, m.passou ? "solved" : "attempted"] as const),
    );
    const acceptanceByChallenge = new Map(
        counts.map((c) => {
            const total = Number(c.total);
            return [c.challengeId, total > 0 ? Math.round((Number(c.passed) / total) * 100) : null];
        }),
    );

    // Challenge of the day: pinned by the admin or deterministic among the published ones.
    const pinned = allChallenges.find((d) => d.activeDate === today);
    const sortedChallenges = [...allChallenges].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    const dailyId = pinned
        ? pinned.id
        : sortedChallenges[dayIndex(today, sortedChallenges.length)].id;

    const items = allChallenges.map((d) => ({
        id: d.id,
        number: d.number,
        title: d.title,
        topic: d.topic,
        difficulty: d.difficulty,
        xp: challengeXp(d.difficulty),
        acceptance: acceptanceByChallenge.get(d.id) ?? null,
        status: statusByChallenge.get(d.id) ?? "todo",
        isToday: d.id === dailyId,
    }));

    const solvedItems = items.filter((i) => i.status === "solved");
    const countByLevel = (arr: typeof items, level: string) =>
        arr.filter((i) => i.difficulty === level).length;
    const progress = {
        solved: solvedItems.length,
        total: allChallenges.length,
        pct: allChallenges.length
            ? Math.round((solvedItems.length / allChallenges.length) * 100)
            : 0,
        easy: countByLevel(solvedItems, "facil"),
        medium: countByLevel(solvedItems, "medio"),
        hard: countByLevel(solvedItems, "dificil"),
    };
    return { items, progress };
}

export async function findChallengeDetail(userId: string, id: string) {
    const d = await findPublished(id);
    const dailyId = await dailyChallengeId(todayInSaoPaulo());
    return buildView(d, userId, dailyId);
}

// "Run examples": runs only against the public cases and returns the diff, without saving.
export async function runChallengeExamples(userId: string, id: string, input: RunInput) {
    const d = await findPublished(id);
    const publicTests = await db
        .select()
        .from(challengeTests)
        .where(and(eq(challengeTests.challengeId, id), eq(challengeTests.isPublic, true)))
        .orderBy(asc(challengeTests.position));
    if (publicTests.length === 0) throw new AppError(400, "challenge.noExamples");

    const t0 = performance.now();
    const runner = await runOnRunner(
        input.language,
        input.code,
        publicTests.map((t) => t.input),
        d.kind,
        d.entryPoint,
    );
    const timeMs = Math.round(performance.now() - t0);
    if (runner.compileOutput) {
        return { compileError: runner.compileOutput, cases: [], timeMs };
    }
    const matches = d.kind === "function" ? returnMatches : outputMatches;
    const cases = publicTests.map((t, i) => {
        const r = runner.results[i];
        const got = r?.stdout ?? "";
        return {
            input: t.input,
            expected: t.expectedOutput,
            got,
            stderr: r?.stderr ?? "",
            timedOut: r?.timedOut ?? false,
            passed: !!r && !r.timedOut && r.exitCode === 0 && matches(got, t.expectedOutput),
        };
    });
    return { compileError: null, cases, timeMs };
}

// Submission: runs ALL the cases, grades on the server and grants XP (by difficulty) on
// the first pass of any challenge. A hidden case never shows in the feedback.
export async function gradeChallengeSubmission(userId: string, id: string, input: RunInput) {
    const d = await findPublished(id);
    const tests = await db
        .select()
        .from(challengeTests)
        .where(eq(challengeTests.challengeId, id))
        .orderBy(asc(challengeTests.position));
    if (tests.length === 0) throw new AppError(400, "challenge.noTestCases");

    const t0 = performance.now();
    const runner = await runOnRunner(
        input.language,
        input.code,
        tests.map((t) => t.input),
        d.kind,
        d.entryPoint,
    );
    const timeMs = Math.round(performance.now() - t0);

    const grading = gradeChallenge(
        tests.map((t) => t.expectedOutput),
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
    } else if (grading.aprovado) {
        status = "passed";
    } else {
        const publicIndex = tests.findIndex((t, i) => t.isPublic && !grading.casos[i]);
        if (publicIndex >= 0) {
            const r = runner.results[publicIndex];
            output = r?.timedOut
                ? "Tempo limite excedido em um dos exemplos."
                : `Exemplo falhou.\nEntrada:\n${tests[publicIndex].input}\nEsperado:\n${tests[publicIndex].expectedOutput}\nObtido:\n${r?.stdout ?? ""}`;
        }
        status = runner.results.some((r) => r.timedOut) ? "timeout" : "failed";
    }

    // XP by difficulty, only once per challenge (idempotent through xp_earned > 0).
    let xpEarned = 0;
    if (grading.aprovado) {
        const [alreadyEarned] = await db
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
        if (!alreadyEarned) xpEarned = challengeXp(d.difficulty);
    }

    await db.insert(challengeSubmissions).values({
        userId,
        challengeId: id,
        language: input.language,
        code: input.code,
        status,
        passedCount: grading.acertos,
        totalCount: grading.total,
        output,
        xpEarned,
        durationSeconds: input.durationSeconds ?? null,
    });

    // A passed challenge may unlock an achievement (for challenges or for the streak).
    if (grading.aprovado) await checkAchievements(userId);

    return {
        status,
        passed: grading.aprovado,
        passedCount: grading.acertos,
        totalCount: grading.total,
        xpEarned,
        output,
        timeMs,
    };
}

// Community solutions: each student's last accepted submission per language.
// Only who already solved the challenge can see them (otherwise it would be a free answer key).
export async function findChallengeSolutions(userId: string, id: string) {
    await findPublished(id);
    if (!(await hasSolved(userId, id))) {
        throw new AppError(403, "challenge.solveFirst");
    }
    const rows = await db
        .selectDistinctOn([challengeSubmissions.userId, challengeSubmissions.language], {
            id: challengeSubmissions.id,
            userId: challengeSubmissions.userId,
            language: challengeSubmissions.language,
            code: challengeSubmissions.code,
            durationSeconds: challengeSubmissions.durationSeconds,
            createdAt: challengeSubmissions.createdAt,
            autorNome: users.name,
            autorUsername: users.username,
            autorAvatar: users.avatarUrl,
        })
        .from(challengeSubmissions)
        .innerJoin(users, eq(users.id, challengeSubmissions.userId))
        .where(
            and(
                eq(challengeSubmissions.challengeId, id),
                eq(challengeSubmissions.status, "passed"),
            ),
        )
        .orderBy(
            asc(challengeSubmissions.userId),
            asc(challengeSubmissions.language),
            desc(challengeSubmissions.createdAt),
        );
    const levels = await userLevels([...new Set(rows.map((l) => l.userId))]);
    const sortedRows = [...rows].sort((a, b) => {
        const aOwn = a.userId === userId ? 0 : 1;
        const bOwn = b.userId === userId ? 0 : 1;
        if (aOwn !== bOwn) return aOwn - bOwn;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return sortedRows.slice(0, 30).map((l) => ({
        id: l.id,
        language: l.language,
        code: l.code,
        durationSeconds: l.durationSeconds,
        createdAt: l.createdAt,
        minha: l.userId === userId,
        autor: {
            name: l.autorNome,
            username: l.autorUsername,
            avatarUrl: l.autorAvatar,
            level: levels.get(l.userId) ?? 1,
        },
    }));
}

export async function findChallengeComments(userId: string, id: string) {
    await findPublished(id);
    const rows = await db
        .select({
            id: challengeComments.id,
            userId: challengeComments.userId,
            content: challengeComments.content,
            createdAt: challengeComments.createdAt,
            autorNome: users.name,
            autorUsername: users.username,
            autorAvatar: users.avatarUrl,
        })
        .from(challengeComments)
        .innerJoin(users, eq(users.id, challengeComments.userId))
        .where(eq(challengeComments.challengeId, id))
        .orderBy(asc(challengeComments.createdAt));
    const levels = await userLevels([...new Set(rows.map((l) => l.userId))]);
    return rows.map((l) => ({
        id: l.id,
        content: l.content,
        createdAt: l.createdAt,
        minha: l.userId === userId,
        autor: {
            name: l.autorNome,
            username: l.autorUsername,
            avatarUrl: l.autorAvatar,
            level: levels.get(l.userId) ?? 1,
        },
    }));
}

export async function insertChallengeComment(userId: string, id: string, input: CommentInput) {
    await findPublished(id);
    const [c] = await db
        .insert(challengeComments)
        .values({ challengeId: id, userId, content: input.content })
        .returning({ id: challengeComments.id });
    return { id: c.id };
}

export async function removeChallengeComment(userId: string, commentId: string) {
    const [c] = await db
        .select({ id: challengeComments.id, userId: challengeComments.userId })
        .from(challengeComments)
        .where(eq(challengeComments.id, commentId));
    if (!c) throw new AppError(404, "community.commentNotFound");
    if (c.userId !== userId) {
        const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
        if (u?.role !== "admin") {
            throw new AppError(403, "challenge.ownCommentsOnly");
        }
    }
    await db.delete(challengeComments).where(eq(challengeComments.id, commentId));
    return { ok: true };
}

// ===================== ADMIN =====================

export async function findChallengesForStudio() {
    const challengeRows = await db
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
    return challengeRows.map((d) => ({ ...d, testes: Number(d.testes) }));
}

export async function findStudioChallenge(id: string) {
    const [d] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!d) throw new AppError(404, "challenge.notFound");
    const tests = await db
        .select()
        .from(challengeTests)
        .where(eq(challengeTests.challengeId, id))
        .orderBy(asc(challengeTests.position));
    return {
        ...d,
        statementBlocks: d.statementBlocks ?? [],
        starterCode: d.starterCode ?? {},
        tests: tests,
    };
}

async function ensureDateFree(activeDate: string | null | undefined, ignoreId?: string) {
    if (!activeDate) return;
    const [conflict] = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.activeDate, activeDate));
    if (conflict && conflict.id !== ignoreId) {
        throw new AppError(409, "challenge.dateTaken");
    }
}

// Next free number when the admin does not give one.
async function nextNumber(): Promise<number> {
    const [r] = await db.select({ max: sql<number>`max(${challenges.number})` }).from(challenges);
    return Number(r?.max ?? 0) + 1;
}

export async function insertChallenge(input: ChallengeData) {
    await ensureDateFree(input.activeDate ?? null);
    const challengeNumber = input.number ?? (await nextNumber());
    return db.transaction(async (tx) => {
        const [d] = await tx
            .insert(challenges)
            .values({
                number: challengeNumber,
                title: input.title,
                topic: input.topic || null,
                kind: input.kind,
                entryPoint: input.entryPoint || null,
                statementBlocks: input.statementBlocks,
                difficulty: input.difficulty,
                starterCode: input.starterCode,
                activeDate: input.activeDate ?? null,
                published: input.published,
            })
            .returning();
        await tx.insert(challengeTests).values(
            input.tests.map((t, i) => ({
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

export async function editChallenge(id: string, input: ChallengeData) {
    const [existing] = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.id, id));
    if (!existing) throw new AppError(404, "challenge.notFound");
    await ensureDateFree(input.activeDate ?? null, id);
    await db.transaction(async (tx) => {
        await tx
            .update(challenges)
            .set({
                title: input.title,
                topic: input.topic || null,
                number: input.number ?? undefined,
                kind: input.kind,
                entryPoint: input.entryPoint || null,
                statementBlocks: input.statementBlocks,
                difficulty: input.difficulty,
                starterCode: input.starterCode,
                activeDate: input.activeDate ?? null,
                published: input.published,
            })
            .where(eq(challenges.id, id));
        await tx.delete(challengeTests).where(eq(challengeTests.challengeId, id));
        await tx.insert(challengeTests).values(
            input.tests.map((t, i) => ({
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

export async function removeChallenge(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(challengeComments).where(eq(challengeComments.challengeId, id));
        await tx.delete(challengeSubmissions).where(eq(challengeSubmissions.challengeId, id));
        await tx.delete(challengeTests).where(eq(challengeTests.challengeId, id));
        await tx.delete(challenges).where(eq(challenges.id, id));
    });
    return { ok: true };
}
