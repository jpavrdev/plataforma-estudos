import { db } from "../../db.ts";
import { lessonProgress, lessons, userAchievements, achievements } from "../../schema.ts";
import { eq, desc } from "drizzle-orm";

// Atividades recentes derivadas: aulas concluídas + conquistas desbloqueadas.
export async function atividadeRecente(userId: string) {
    const aulas = await db
        .select({ at: lessonProgress.completedAt, title: lessons.title })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(eq(lessonProgress.userId, userId))
        .orderBy(desc(lessonProgress.completedAt))
        .limit(15);
    const conquistas = await db
        .select({
            at: userAchievements.earnedAt,
            name: achievements.name,
            icon: achievements.icon,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt))
        .limit(15);
    return [
        ...aulas.map((a) => ({
            type: "lesson",
            icon: "check",
            text: `Concluiu a aula "${a.title}"`,
            at: a.at,
        })),
        ...conquistas.map((c) => ({
            type: "achievement",
            icon: c.icon,
            text: `Desbloqueou "${c.name}"`,
            at: c.at,
        })),
    ]
        .sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : 0))
        .slice(0, 15);
}
