import { db } from "../../db.ts";
import { achievements, userAchievements, users } from "../../schema.ts";
import { eq, asc, desc } from "drizzle-orm";
import type { z } from "zod";
import type { createAchievementSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { calcularEstatisticas } from "./stats.service.ts";

type DadosConquista = z.infer<typeof createAchievementSchema>;

// ===================== Catálogo (admin) =====================
export async function listarConquistas() {
    return db.select().from(achievements).orderBy(asc(achievements.threshold));
}

export async function criarConquista(dados: DadosConquista) {
    const [existe] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.name, dados.name));
    if (existe) {
        throw new AppError(409, "Já existe uma conquista com esse nome");
    }
    const [a] = await db.insert(achievements).values(dados).returning();
    return a;
}

export async function atualizarConquista(id: string, dados: DadosConquista) {
    const [conflito] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.name, dados.name));
    if (conflito && conflito.id !== id) {
        throw new AppError(409, "Já existe uma conquista com esse nome");
    }
    const [a] = await db.update(achievements).set(dados).where(eq(achievements.id, id)).returning();
    if (!a) {
        throw new AppError(404, "Conquista não encontrada");
    }
    return a;
}

export async function excluirConquista(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(userAchievements).where(eq(userAchievements.achievementId, id));
        await tx.delete(achievements).where(eq(achievements.id, id));
    });
}

// ===================== Premiação automática =====================
// Desbloqueia (idempotente) as conquistas cujo critério o usuário já atingiu.
export async function verificarConquistas(userId: string) {
    const stats = await calcularEstatisticas(userId);
    const valor: Record<string, number> = {
        xp_total: stats.xp,
        lessons_completed: stats.lessonsCompleted,
        questions_correct: stats.questionsCorrect,
    };
    const catalogo = await db.select().from(achievements);
    const merecidas = catalogo.filter((a) => (valor[a.criteriaType] ?? 0) >= a.threshold);
    if (merecidas.length === 0) return;
    await db
        .insert(userAchievements)
        .values(merecidas.map((a) => ({ userId, achievementId: a.id })))
        .onConflictDoNothing();
}

// Catálogo de conquistas com a marcação do que o usuário já desbloqueou.
export async function conquistasDoUsuario(userId: string) {
    await verificarConquistas(userId);
    const catalogo = await db.select().from(achievements).orderBy(asc(achievements.threshold));
    const ganhas = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));
    const quando = new Map(ganhas.map((g) => [g.achievementId, g.earnedAt]));
    return catalogo.map((a) => ({
        ...a,
        earned: quando.has(a.id),
        earnedAt: quando.get(a.id) ?? null,
    }));
}

// ===================== Feed da comunidade =====================
// Quem desbloqueou cada conquista, mais recentes primeiro.
export async function feedComunidade() {
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
