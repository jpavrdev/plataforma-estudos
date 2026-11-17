import { sql, eq, and, count, sum, gte, isNotNull } from "drizzle-orm";
import { db } from "../../db.ts";
import {
    rankingSnapshots,
    users,
    lessonProgress,
    questionAnswers,
    challengeSubmissions,
} from "../../schema.ts";
import { findAllStreaks, todayInSaoPaulo } from "./streak.ts";
import { activeSupporters } from "./supporter.service.ts";
import { computeXp, levelFromXp } from "../domain/xp.ts";

// Saves the day's snapshot (once a day, on the first view) and returns, per
// user, how many positions they climbed (positive) or dropped (negative) since
// the last snapshot before today.
export async function rankingMovement(
    today: string,
    todayPositions: { id: string; position: number }[],
): Promise<Map<string, number>> {
    // Most recent snapshot before today (the comparison baseline).
    const prior = await db.execute(
        sql`SELECT to_char(max(snapshot_date), 'YYYY-MM-DD') AS d FROM ranking_snapshots WHERE snapshot_date < ${today}::date`,
    );
    const latestDate = (prior.rows as { d: string | null }[])[0]?.d ?? null;

    const previous = new Map<string, number>();
    if (latestDate) {
        const rows = await db
            .select({ userId: rankingSnapshots.userId, position: rankingSnapshots.position })
            .from(rankingSnapshots)
            .where(eq(rankingSnapshots.snapshotDate, latestDate));
        for (const r of rows) previous.set(r.userId, r.position);
    }

    // Saves today's snapshot only once (first visit of the day).
    const [exists] = await db
        .select({ id: rankingSnapshots.id })
        .from(rankingSnapshots)
        .where(eq(rankingSnapshots.snapshotDate, today))
        .limit(1);
    if (!exists && todayPositions.length > 0) {
        await db
            .insert(rankingSnapshots)
            .values(
                todayPositions.map((p) => ({
                    userId: p.id,
                    position: p.position,
                    snapshotDate: today,
                })),
            )
            .onConflictDoNothing();
    }

    const deltas = new Map<string, number>();
    for (const p of todayPositions) {
        const before = previous.get(p.id);
        deltas.set(p.id, before === undefined ? 0 : before - p.position);
    }
    return deltas;
}

// Global ranking by XP. Badge and level use total XP; the leaderboard uses the
// period (week/month/all).
export async function globalRanking(period: string, currentUserId: string | undefined) {
    const dayMs = 24 * 60 * 60 * 1000;
    const since =
        period === "week"
            ? new Date(Date.now() - 7 * dayMs)
            : period === "month"
              ? new Date(Date.now() - 30 * dayMs)
              : null;

    const [
        userRows,
        lessonsTotal,
        correctTotal,
        challengesTotal,
        lessonsPeriod,
        correctPeriod,
        challengesPeriod,
        streaks,
        supporters,
    ] = await Promise.all([
        db.select({ id: users.id, name: users.name, username: users.username }).from(users),
        db
            .select({ userId: lessonProgress.userId, n: count() })
            .from(lessonProgress)
            .where(eq(lessonProgress.manual, false))
            .groupBy(lessonProgress.userId),
        db
            .select({ userId: questionAnswers.userId, n: count() })
            .from(questionAnswers)
            .where(isNotNull(questionAnswers.acertouEm))
            .groupBy(questionAnswers.userId),
        db
            .select({ userId: challengeSubmissions.userId, n: sum(challengeSubmissions.xpEarned) })
            .from(challengeSubmissions)
            .groupBy(challengeSubmissions.userId),
        since
            ? db
                  .select({ userId: lessonProgress.userId, n: count() })
                  .from(lessonProgress)
                  .where(gte(lessonProgress.completedAt, since))
                  .groupBy(lessonProgress.userId)
            : Promise.resolve(null),
        since
            ? db
                  .select({ userId: questionAnswers.userId, n: count() })
                  .from(questionAnswers)
                  .where(
                      // By the date of the first correct answer, not the last
                      // attempt: someone who redid an old question must not
                      // reappear in the period ranking as if they had just
                      // answered it.
                      and(
                          isNotNull(questionAnswers.acertouEm),
                          gte(questionAnswers.acertouEm, since),
                      ),
                  )
                  .groupBy(questionAnswers.userId)
            : Promise.resolve(null),
        since
            ? db
                  .select({
                      userId: challengeSubmissions.userId,
                      n: sum(challengeSubmissions.xpEarned),
                  })
                  .from(challengeSubmissions)
                  .where(gte(challengeSubmissions.createdAt, since))
                  .groupBy(challengeSubmissions.userId)
            : Promise.resolve(null),
        findAllStreaks(),
        activeSupporters(),
    ]);

    // n comes back as number (count) or string (sum of xp); Number() normalizes both.
    const toMap = (arr: { userId: string; n: number | string | null }[] | null) =>
        new Map((arr ?? []).map((a) => [a.userId, Number(a.n ?? 0)]));
    const lessonsAll = toMap(lessonsTotal),
        correctAll = toMap(correctTotal),
        challengesAll = toMap(challengesTotal);
    const lessonsPer = since ? toMap(lessonsPeriod) : lessonsAll;
    const correctPer = since ? toMap(correctPeriod) : correctAll;
    const challengesPer = since ? toMap(challengesPeriod) : challengesAll;

    const base = userRows.map((u) => {
        const totalXp = computeXp({
            lessons: lessonsAll.get(u.id) ?? 0,
            questions: correctAll.get(u.id) ?? 0,
            challengesXp: challengesAll.get(u.id) ?? 0,
        });
        const periodXp = computeXp({
            lessons: lessonsPer.get(u.id) ?? 0,
            questions: correctPer.get(u.id) ?? 0,
            challengesXp: challengesPer.get(u.id) ?? 0,
        });
        return {
            id: u.id,
            name: u.name,
            username: u.username,
            totalXp,
            periodXp,
            level: levelFromXp(totalXp),
            streak: streaks.get(u.id) ?? 0,
            apoiador: supporters.has(u.id),
            you: u.id === currentUserId,
        };
    });
    const sorted = [...base]
        .sort((a, b) => b.periodXp - a.periodXp)
        .map((u, i) => ({ ...u, position: i + 1 }));
    // Movement is computed over the overall ranking (total XP).
    const overallOrder = [...base]
        .sort((a, b) => b.totalXp - a.totalXp)
        .map((u, i) => ({ id: u.id, position: i + 1 }));
    const deltas = await rankingMovement(todayInSaoPaulo(), overallOrder);

    const mine = sorted.find((u) => u.you);
    const me = mine
        ? {
              position: mine.position,
              username: mine.username,
              xp: mine.periodXp,
              totalXp: mine.totalXp,
              level: mine.level,
              streak: mine.streak,
              delta: deltas.get(mine.id) ?? 0,
          }
        : null;
    const rows = sorted.slice(0, 20).map((u) => ({
        position: u.position,
        name: u.name,
        username: u.username,
        xp: u.periodXp,
        level: u.level,
        streak: u.streak,
        apoiador: u.apoiador,
        delta: deltas.get(u.id) ?? 0,
        you: u.you,
    }));
    return { me, rows };
}
