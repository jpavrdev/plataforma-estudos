import { eq, sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { trails, users } from "../../schema.ts";
import { findActiveDays, todayInSaoPaulo } from "./streak.ts";
import { computeStreak, longestStreak, weekActivity } from "../domain/streak.ts";
import { computeUserStats } from "./stats.service.ts";

const TZ = "America/Sao_Paulo";
const CHART_DAYS = 14;
const HEATMAP_WEEKS = 52;

type ActivityDay = { xp: number; exercicios: number; minutos: number; aulas: number };

// XP, right answers and estimated minutes (the length of the completed lessons),
// aggregated per day in the São Paulo time zone, joining the three activity sources.
async function activityByDay(userId: string) {
    const res = await db.execute(sql`
        SELECT d,
               SUM(xp)::int AS xp,
               SUM(exercicios)::int AS exercicios,
               SUM(minutos)::int AS minutos,
               SUM(aulas)::int AS aulas
        FROM (
            SELECT to_char(acertou_em AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   10 AS xp, 1 AS exercicios, 0 AS minutos, 0 AS aulas
            FROM question_answers WHERE user_id = ${userId} AND acertou_em IS NOT NULL
            UNION ALL
            SELECT to_char(lp.completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   50 AS xp, 0 AS exercicios, COALESCE(l.duration_min, 12) AS minutos, 1 AS aulas
            FROM lessons_progress lp
            JOIN lessons l ON l.id = lp.lesson_id
            WHERE lp.user_id = ${userId} AND lp.manual = false
            UNION ALL
            SELECT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   xp_earned AS xp, 0 AS exercicios, 0 AS minutos, 0 AS aulas
            FROM challenge_submissions WHERE user_id = ${userId} AND xp_earned > 0
        ) t
        GROUP BY d
    `);
    return new Map<string, ActivityDay>(
        (
            res.rows as {
                d: string;
                xp: number;
                exercicios: number;
                minutos: number;
                aulas: number;
            }[]
        ).map((r) => [
            r.d,
            {
                xp: Number(r.xp),
                exercicios: Number(r.exercicios),
                minutos: Number(r.minutos),
                aulas: Number(r.aulas),
            },
        ]),
    );
}

// Mastery = distinct questions answered right over the track's total questions
// (published lessons; in a multi-language track, the neutral ones + the best path).
async function masteryByTrack(userId: string) {
    const questionRows = await db.execute(sql`
        SELECT l.trail_id AS tid, l.language AS lang, q.id AS qid
        FROM questions q
        JOIN lessons l ON l.id = q.lesson_id
        WHERE l.published = true
    `);
    const correctRows = await db.execute(sql`
        SELECT DISTINCT question_id AS qid FROM question_answers
        WHERE user_id = ${userId} AND acertou_em IS NOT NULL
    `);
    const rightIds = new Set((correctRows.rows as { qid: string }[]).map((r) => r.qid));

    type Group = { neutras: string[]; porLang: Map<string, string[]> };
    const byTrack = new Map<string, Group>();
    for (const r of questionRows.rows as { tid: string; lang: string | null; qid: string }[]) {
        const group = byTrack.get(r.tid) ?? {
            neutras: [] as string[],
            porLang: new Map<string, string[]>(),
        };
        if (r.lang === null) {
            group.neutras.push(r.qid);
        } else {
            const arr = group.porLang.get(r.lang) ?? [];
            arr.push(r.qid);
            group.porLang.set(r.lang, arr);
        }
        byTrack.set(r.tid, group);
    }

    const allTracks = await db
        .select({ id: trails.id, name: trails.name, trailLevel: trails.trailLevel })
        .from(trails);
    const countRight = (ids: string[]) => ids.filter((id) => rightIds.has(id)).length;

    const result = [];
    for (const t of allTracks) {
        const group = byTrack.get(t.id);
        if (!group) continue;
        let total = group.neutras.length;
        let done = countRight(group.neutras);
        if (group.porLang.size > 0) {
            let best = { total: 0, feitas: 0, pct: -1 };
            for (const ids of group.porLang.values()) {
                const tt = group.neutras.length + ids.length;
                const ff = countRight(group.neutras) + countRight(ids);
                const pct = tt > 0 ? ff / tt : 0;
                if (pct > best.pct || (pct === best.pct && ff > best.feitas)) {
                    best = { total: tt, feitas: ff, pct };
                }
            }
            total = best.total;
            done = best.feitas;
        }
        if (done === 0 || total === 0) continue;
        result.push({
            trailId: t.id,
            name: t.name,
            trailLevel: t.trailLevel,
            acertos: done,
            total,
            pct: Math.round((done / total) * 100),
        });
    }
    return result.sort((a, b) => b.pct - a.pct);
}

export type WeeklyGoal =
    | { tipo: "padrao"; valor: number; alvo: number }
    | { tipo: "aulas"; valor: number; alvo: number; alvoDiario: number }
    | { tipo: "dias"; valor: number; alvo: number };

export async function saveWeeklyGoal(userId: string, kind: "aulas" | "dias", target: number) {
    await db
        .update(users)
        .set({ weeklyGoalKind: kind, weeklyGoalTarget: target })
        .where(eq(users.id, userId));
}

export async function removeWeeklyGoal(userId: string) {
    await db
        .update(users)
        .set({ weeklyGoalKind: null, weeklyGoalTarget: null })
        .where(eq(users.id, userId));
}

export async function findUserProgress(userId: string, periodDays: number | null) {
    const [byDay, activeDays, stats, [goal], mastery] = await Promise.all([
        activityByDay(userId),
        findActiveDays(userId),
        computeUserStats(userId),
        db
            .select({ kind: users.weeklyGoalKind, target: users.weeklyGoalTarget })
            .from(users)
            .where(eq(users.id, userId)),
        masteryByTrack(userId),
    ]);
    const today = todayInSaoPaulo();

    const daysAgo = (offset: number) =>
        new Date(Date.parse(today + "T00:00:00Z") - offset * 86400000).toISOString().slice(0, 10);

    const windowSum = (start: number, end: number): ActivityDay => {
        const total = { xp: 0, exercicios: 0, minutos: 0, aulas: 0 };
        for (let o = start; o <= end; o++) {
            const v = byDay.get(daysAgo(o));
            if (v) {
                total.xp += v.xp;
                total.exercicios += v.exercicios;
                total.minutos += v.minutos;
                total.aulas += v.aulas;
            }
        }
        return total;
    };
    const totalSum = (): ActivityDay => {
        const total = { xp: 0, exercicios: 0, minutos: 0, aulas: 0 };
        for (const v of byDay.values()) {
            total.xp += v.xp;
            total.exercicios += v.exercicios;
            total.minutos += v.minutos;
            total.aulas += v.aulas;
        }
        return total;
    };

    const current = periodDays ? windowSum(0, periodDays - 1) : totalSum();
    const previous = periodDays ? windowSum(periodDays, periodDays * 2 - 1) : null;

    const xpByDay = Array.from({ length: CHART_DAYS }, (_, i) => {
        const d = daysAgo(CHART_DAYS - 1 - i);
        return { d, xp: byDay.get(d)?.xp ?? 0 };
    });

    // The heatmap counts completed lessons per day; days with only exercises stay empty.
    const heatmap: { d: string; n: number }[] = [];
    let lessonsThisYear = 0;
    for (let o = 0; o < HEATMAP_WEEKS * 7; o++) {
        const d = daysAgo(o);
        const v = byDay.get(d);
        if (!v) continue;
        lessonsThisYear += v.aulas;
        if (v.aulas > 0) heatmap.push({ d, n: v.aulas });
    }

    const week = weekActivity(activeDays, today);
    const currentStreak = computeStreak(activeDays, today);

    let weeklyGoal: WeeklyGoal;
    if (goal?.kind === "aulas" && goal.target) {
        let metDays = 0;
        for (let o = 0; o < 7; o++) {
            if ((byDay.get(daysAgo(o))?.aulas ?? 0) >= goal.target) metDays++;
        }
        weeklyGoal = { tipo: "aulas", valor: metDays, alvo: 7, alvoDiario: goal.target };
    } else if (goal?.kind === "dias" && goal.target) {
        weeklyGoal = {
            tipo: "dias",
            valor: Math.min(currentStreak, goal.target),
            alvo: goal.target,
        };
    } else {
        weeklyGoal = { tipo: "padrao", valor: week.filter((s) => s.active).length, alvo: 7 };
    }

    return {
        hoje: today,
        xpTotal: stats.xp,
        level: stats.level,
        streakAtual: currentStreak,
        streakRecorde: longestStreak(activeDays),
        periodo: { dias: periodDays, atual: current, anterior: previous },
        xpPorDia: xpByDay,
        metaSemana: weeklyGoal,
        heatmap,
        aulasAno: lessonsThisYear,
        dominio: mastery,
    };
}
