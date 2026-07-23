import { db } from "../../db.ts";
import { certificates, users } from "../../schema.ts";
import { desc, eq } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";
import { calcularEstatisticas } from "./stats.service.ts";
import { streakDoUsuario } from "./streak.ts";
import { conquistasDoUsuario } from "./achievement.service.ts";
import { trilhasDoUsuario } from "./trail.service.ts";

// Só o que pode ser visto por qualquer pessoa: nada de email, telefone ou nascimento.
export async function perfilPublico(username: string) {
    const [usuario] = await db.select().from(users).where(eq(users.username, username));
    if (!usuario || !usuario.username) {
        throw new AppError(404, "Perfil não encontrado");
    }

    const [stats, streak, conquistas, trilhas, certs] = await Promise.all([
        calcularEstatisticas(usuario.id),
        streakDoUsuario(usuario.id),
        conquistasDoUsuario(usuario.id),
        trilhasDoUsuario(usuario.id),
        db
            .select({
                code: certificates.code,
                trailName: certificates.trailName,
                language: certificates.language,
                workloadHours: certificates.workloadHours,
                issuedAt: certificates.issuedAt,
            })
            .from(certificates)
            .where(eq(certificates.userId, usuario.id))
            .orderBy(desc(certificates.issuedAt)),
    ]);

    return {
        name: usuario.name,
        username: usuario.username,
        bio: usuario.bio,
        location: usuario.location,
        occupation: usuario.occupation,
        languages: usuario.languages ?? [],
        github: usuario.github,
        linkedin: usuario.linkedin,
        x: usuario.x,
        avatarUrl: usuario.avatarUrl,
        coverUrl: usuario.coverUrl,
        memberSince: usuario.createdAt,
        xp: stats.xp,
        level: stats.level,
        lessonsCompleted: stats.lessonsCompleted,
        questionsCorrect: stats.questionsCorrect,
        challengesCompleted: stats.challengesCompleted,
        streak,
        conquistas: conquistas
            .filter((c) => c.earned)
            .map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                icon: c.icon,
                earnedAt: c.earnedAt,
            })),
        trilhas: trilhas.map((t) => ({
            name: t.name,
            trailLevel: t.trailLevel,
            totalLessons: t.totalLessons,
            completedLessons: t.completedLessons,
            progress: t.progress,
        })),
        certificados: certs,
    };
}
