import { db } from "../../db.ts";
import { certificates, users } from "../../schema.ts";
import { desc, eq } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import { computeUserStats } from "./stats.service.ts";
import { findUserStreak } from "./streak.ts";
import { listUserAchievements } from "./achievement.service.ts";
import { findUserTrails } from "./trail.service.ts";
import { apoiadorAtivo } from "./apoiador.service.ts";

// Only what anyone may see: no email, phone or birth date.
export async function findPublicProfile(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user || !user.username) {
        throw new AppError(404, "profile.notFound");
    }

    const [stats, streak, achievements, userTrails, isSupporter, certs] = await Promise.all([
        computeUserStats(user.id),
        findUserStreak(user.id),
        listUserAchievements(user.id),
        findUserTrails(user.id),
        apoiadorAtivo(user.id),
        db
            .select({
                code: certificates.code,
                trailName: certificates.trailName,
                language: certificates.language,
                workloadHours: certificates.workloadHours,
                issuedAt: certificates.issuedAt,
            })
            .from(certificates)
            .where(eq(certificates.userId, user.id))
            .orderBy(desc(certificates.issuedAt)),
    ]);

    return {
        name: user.name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        occupation: user.occupation,
        languages: user.languages ?? [],
        github: user.github,
        linkedin: user.linkedin,
        x: user.x,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        memberSince: user.createdAt,
        apoiador: isSupporter,
        xp: stats.xp,
        level: stats.level,
        lessonsCompleted: stats.lessonsCompleted,
        questionsCorrect: stats.questionsCorrect,
        challengesCompleted: stats.challengesCompleted,
        streak,
        conquistas: achievements
            .filter((c) => c.earned)
            .map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                icon: c.icon,
                earnedAt: c.earnedAt,
            })),
        trilhas: userTrails.map((t) => ({
            name: t.name,
            trailLevel: t.trailLevel,
            totalLessons: t.totalLessons,
            completedLessons: t.completedLessons,
            progress: t.progress,
        })),
        certificados: certs,
    };
}
