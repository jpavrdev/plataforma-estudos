import { db } from "../../db.ts";
import {
    achievements,
    userAchievements,
    users,
    challenges,
    challengeSubmissions,
} from "../../schema.ts";
import { eq, and, asc, desc, sql, inArray } from "drizzle-orm";
import type { z } from "zod";
import type { createAchievementSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { computeUserStats } from "./stats.service.ts";
import { findActiveDays } from "./streak.ts";
import { longestStreak } from "../domain/streak.ts";
import { findUserTrails } from "./trail.service.ts";

type AchievementData = z.infer<typeof createAchievementSchema>;

// ===================== Catalog (admin) =====================
export async function findAchievements() {
    return db.select().from(achievements).orderBy(asc(achievements.threshold));
}

export async function insertAchievement(data: AchievementData) {
    const [existing] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.name, data.name));
    if (existing) {
        throw new AppError(409, "achievement.nameTaken");
    }
    const [a] = await db.insert(achievements).values(data).returning();
    return a;
}

export async function editAchievement(id: string, data: AchievementData) {
    const [conflict] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.name, data.name));
    if (conflict && conflict.id !== id) {
        throw new AppError(409, "achievement.nameTaken");
    }
    const [a] = await db.update(achievements).set(data).where(eq(achievements.id, id)).returning();
    if (!a) {
        throw new AppError(404, "achievement.notFound");
    }
    return a;
}

export async function removeAchievement(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(userAchievements).where(eq(userAchievements.achievementId, id));
        await tx.delete(achievements).where(eq(achievements.id, id));
    });
}

// Code challenges solved (distinct), counted by difficulty.
async function challengesByDifficulty(userId: string) {
    const rows = await db
        .select({
            difficulty: challenges.difficulty,
            n: sql<number>`count(distinct ${challengeSubmissions.challengeId})`,
        })
        .from(challengeSubmissions)
        .innerJoin(challenges, eq(challenges.id, challengeSubmissions.challengeId))
        .where(
            and(eq(challengeSubmissions.userId, userId), eq(challengeSubmissions.status, "passed")),
        )
        .groupBy(challenges.difficulty);
    const byDifficulty: Record<string, number> = { facil: 0, medio: 0, dificil: 0 };
    for (const row of rows) byDifficulty[row.difficulty] = Number(row.n);
    return byDifficulty;
}

// Trails the user completed 100% (same rule as the badge, the roadmap and the certificate).
async function completedTrailIds(userId: string): Promise<Set<string>> {
    const userTrails = await findUserTrails(userId);
    return new Set(
        userTrails
            .filter((t) => t.totalLessons > 0 && t.completedLessons >= t.totalLessons)
            .map((t) => t.id),
    );
}

// ===================== Automatic awarding =====================
// Unlocks (idempotently) the achievements whose criteria the user already met.
export async function checkAchievements(userId: string) {
    const [userStats, activeDays, solvedCounts, completedTrails] = await Promise.all([
        computeUserStats(userId),
        findActiveDays(userId),
        challengesByDifficulty(userId),
        completedTrailIds(userId),
    ]);
    const values: Record<string, number> = {
        xp_total: userStats.xp,
        lessons_completed: userStats.lessonsCompleted,
        questions_correct: userStats.questionsCorrect,
        // Streak record: whoever already hit the mark keeps the achievement if the streak drops.
        streak_days: longestStreak(activeDays),
        challenges_facil: solvedCounts.facil,
        challenges_medio: solvedCounts.medio,
        challenges_dificil: solvedCounts.dificil,
    };
    const catalog = await db.select().from(achievements);
    const deserved = catalog.filter((a) => {
        // "special" (special occasion) is never automatic: granted by hand by the admin.
        if (a.criteriaType === "special") return false;
        // Trail completion matches by the referenced trail, not a global counter.
        if (a.criteriaType === "trail_completed")
            return a.refId != null && completedTrails.has(a.refId);
        return (values[a.criteriaType] ?? 0) >= a.threshold;
    });
    if (deserved.length === 0) return;
    await db
        .insert(userAchievements)
        .values(deserved.map((a) => ({ userId, achievementId: a.id })))
        .onConflictDoNothing();
}

// ===================== Unlock notification (Steam style) =====================
// Checks pending unlocks and returns the achievements not yet notified, marking
// them as seen in the same operation (UPDATE ... RETURNING) so the toast fires
// only once.
export async function unseenAchievements(userId: string) {
    await checkAchievements(userId);
    const marked = await db
        .update(userAchievements)
        .set({ notified: true })
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.notified, false)))
        .returning({ achievementId: userAchievements.achievementId });
    if (marked.length === 0) return [];
    return db
        .select({
            id: achievements.id,
            name: achievements.name,
            description: achievements.description,
            icon: achievements.icon,
        })
        .from(achievements)
        .where(
            inArray(
                achievements.id,
                marked.map((m) => m.achievementId),
            ),
        )
        .orderBy(asc(achievements.threshold));
}

// ===================== Manual grant (special occasion) =====================
export async function grantAchievementTo(achievementId: string, userId: string) {
    const [achievementRow] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.id, achievementId));
    if (!achievementRow) throw new AppError(404, "achievement.notFound");
    const [userRow] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!userRow) throw new AppError(404, "user.notFound");
    await db.insert(userAchievements).values({ userId, achievementId }).onConflictDoNothing();
}

export async function revokeAchievementFrom(achievementId: string, userId: string) {
    await db
        .delete(userAchievements)
        .where(
            and(
                eq(userAchievements.achievementId, achievementId),
                eq(userAchievements.userId, userId),
            ),
        );
}

// Whoever already has the achievement, so the admin can manage the special-occasion ones.
export async function usersWithAchievement(achievementId: string) {
    return db
        .select({
            userId: users.id,
            name: users.name,
            username: users.username,
            earnedAt: userAchievements.earnedAt,
        })
        .from(userAchievements)
        .innerJoin(users, eq(users.id, userAchievements.userId))
        .where(eq(userAchievements.achievementId, achievementId))
        .orderBy(desc(userAchievements.earnedAt));
}

// Achievement catalog with a flag for what the user already unlocked.
export async function listUserAchievements(userId: string) {
    await checkAchievements(userId);
    const catalog = await db.select().from(achievements).orderBy(asc(achievements.threshold));
    const earnedRows = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));
    const when = new Map(earnedRows.map((g) => [g.achievementId, g.earnedAt]));
    return catalog.map((a) => ({
        ...a,
        earned: when.has(a.id),
        earnedAt: when.get(a.id) ?? null,
    }));
}

// ===================== Community feed =====================
// Who unlocked each achievement, most recent first.
export async function communityFeed() {
    return db
        .select({
            name: users.name,
            achievement: achievements.name,
            icon: achievements.icon,
            at: userAchievements.earnedAt,
        })
        .from(userAchievements)
        .innerJoin(users, eq(users.id, userAchievements.userId))
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .orderBy(desc(userAchievements.earnedAt))
        .limit(10);
}
