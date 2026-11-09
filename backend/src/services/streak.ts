import { sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { computeStreak, weekActivity } from "../domain/streak.ts";

// Streak = consecutive days with activity (an answered question, a completed lesson or
// a solved challenge). The "day" is bucketed in the São Paulo time zone to match the user.
const TZ = "America/Sao_Paulo";

export function todayInSaoPaulo(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export async function findActiveDays(userId: string): Promise<Set<string>> {
    const res = await db.execute(sql`
        SELECT DISTINCT to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers WHERE user_id = ${userId}
        UNION
        SELECT DISTINCT to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress WHERE user_id = ${userId}
        UNION
        SELECT DISTINCT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM challenge_submissions WHERE user_id = ${userId} AND status = 'passed'
    `);
    return new Set((res.rows as { d: string }[]).map((r) => r.d));
}

// The streak of every user at once (for the ranking), measured against the same today.
export async function findAllStreaks(): Promise<Map<string, number>> {
    const res = await db.execute(sql`
        SELECT user_id AS uid, to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers
        UNION
        SELECT user_id AS uid, to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress
        UNION
        SELECT user_id AS uid, to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM challenge_submissions WHERE status = 'passed'
    `);
    const byUser = new Map<string, Set<string>>();
    for (const row of res.rows as { uid: string; d: string }[]) {
        let days = byUser.get(row.uid);
        if (!days) {
            days = new Set();
            byUser.set(row.uid, days);
        }
        days.add(row.d);
    }
    const today = todayInSaoPaulo();
    const streaks = new Map<string, number>();
    for (const [uid, days] of byUser) streaks.set(uid, computeStreak(days, today));
    return streaks;
}

// They put together fetching, the clock and the pure calculation for the endpoints.
export async function findUserStreak(userId: string): Promise<number> {
    return computeStreak(await findActiveDays(userId), todayInSaoPaulo());
}

export async function summarizeWeek(userId: string) {
    const days = await findActiveDays(userId);
    const today = todayInSaoPaulo();
    return { streak: computeStreak(days, today), week: weekActivity(days, today) };
}
