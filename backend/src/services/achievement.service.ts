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
import { calcularEstatisticas } from "./stats.service.ts";
import { diasAtivosDoUsuario } from "./streak.ts";
import { recordeStreak } from "../domain/streak.ts";

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

// Desafios de código resolvidos (distintos), contados por dificuldade.
async function desafiosPorDificuldade(userId: string) {
    const linhas = await db
        .select({
            dificuldade: challenges.difficulty,
            n: sql<number>`count(distinct ${challengeSubmissions.challengeId})`,
        })
        .from(challengeSubmissions)
        .innerJoin(challenges, eq(challenges.id, challengeSubmissions.challengeId))
        .where(
            and(eq(challengeSubmissions.userId, userId), eq(challengeSubmissions.status, "passed")),
        )
        .groupBy(challenges.difficulty);
    const por: Record<string, number> = { facil: 0, medio: 0, dificil: 0 };
    for (const l of linhas) por[l.dificuldade] = Number(l.n);
    return por;
}

// ===================== Premiação automática =====================
// Desbloqueia (idempotente) as conquistas cujo critério o usuário já atingiu.
export async function verificarConquistas(userId: string) {
    const [stats, dias, desafios] = await Promise.all([
        calcularEstatisticas(userId),
        diasAtivosDoUsuario(userId),
        desafiosPorDificuldade(userId),
    ]);
    const valor: Record<string, number> = {
        xp_total: stats.xp,
        lessons_completed: stats.lessonsCompleted,
        questions_correct: stats.questionsCorrect,
        // Recorde de dias seguidos: quem já atingiu a marca não perde a conquista se o streak cair.
        streak_days: recordeStreak(dias),
        challenges_facil: desafios.facil,
        challenges_medio: desafios.medio,
        challenges_dificil: desafios.dificil,
    };
    const catalogo = await db.select().from(achievements);
    // "special" (ocasião especial) nunca é automática: só concedida à mão pelo admin.
    const merecidas = catalogo.filter(
        (a) => a.criteriaType !== "special" && (valor[a.criteriaType] ?? 0) >= a.threshold,
    );
    if (merecidas.length === 0) return;
    await db
        .insert(userAchievements)
        .values(merecidas.map((a) => ({ userId, achievementId: a.id })))
        .onConflictDoNothing();
}

// ===================== Notificação de desbloqueio (estilo Steam) =====================
// Verifica pendências e devolve as conquistas ainda não notificadas, marcando-as como
// vistas na mesma operação (UPDATE ... RETURNING) para o toast disparar uma única vez.
export async function conquistasNaoVistas(userId: string) {
    await verificarConquistas(userId);
    const marcadas = await db
        .update(userAchievements)
        .set({ notified: true })
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.notified, false)))
        .returning({ achievementId: userAchievements.achievementId });
    if (marcadas.length === 0) return [];
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
                marcadas.map((m) => m.achievementId),
            ),
        )
        .orderBy(asc(achievements.threshold));
}

// ===================== Concessão manual (ocasião especial) =====================
export async function concederConquista(achievementId: string, userId: string) {
    const [conquista] = await db
        .select({ id: achievements.id })
        .from(achievements)
        .where(eq(achievements.id, achievementId));
    if (!conquista) throw new AppError(404, "Conquista não encontrada");
    const [usuario] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!usuario) throw new AppError(404, "Usuário não encontrado");
    await db.insert(userAchievements).values({ userId, achievementId }).onConflictDoNothing();
}

export async function revogarConquista(achievementId: string, userId: string) {
    await db
        .delete(userAchievements)
        .where(
            and(
                eq(userAchievements.achievementId, achievementId),
                eq(userAchievements.userId, userId),
            ),
        );
}

// Quem já tem a conquista, para o admin gerenciar as de ocasião especial.
export async function usuariosComConquista(achievementId: string) {
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
