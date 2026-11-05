import { db } from "../../db.ts";
import { comunicados, comunicadoRespostas, users } from "../../schema.ts";
import { and, desc, eq, notExists } from "drizzle-orm";
import type { z } from "zod";
import type {
    createAnnouncementSchema,
    updateAnnouncementSchema,
} from "../schemas/announcement.schema.ts";
import { AppError } from "../errors/AppError.ts";

type CreateData = z.infer<typeof createAnnouncementSchema>;
type UpdateData = z.infer<typeof updateAnnouncementSchema>;

// The most recent published announcement the user has not interacted with yet.
export async function findActiveAnnouncement(userId: string) {
    const [announcement] = await db
        .select({
            id: comunicados.id,
            kind: comunicados.kind,
            title: comunicados.title,
            message: comunicados.message,
        })
        .from(comunicados)
        .where(
            and(
                eq(comunicados.published, true),
                notExists(
                    db
                        .select()
                        .from(comunicadoRespostas)
                        .where(
                            and(
                                eq(comunicadoRespostas.comunicadoId, comunicados.id),
                                eq(comunicadoRespostas.userId, userId),
                            ),
                        ),
                ),
            ),
        )
        .orderBy(desc(comunicados.createdAt))
        .limit(1);
    return announcement ?? null;
}

async function publishedOr404(id: string) {
    const [announcement] = await db.select().from(comunicados).where(eq(comunicados.id, id));
    if (!announcement || !announcement.published) {
        throw new AppError(404, "Comunicado não encontrado");
    }
    return announcement;
}

export async function saveAnswer(
    announcementId: string,
    userId: string,
    data: { rating: number; comment?: string },
) {
    const announcement = await publishedOr404(announcementId);
    if (announcement.kind !== "pesquisa") {
        throw new AppError(400, "Este comunicado não aceita resposta");
    }
    const [existing] = await db
        .select({ id: comunicadoRespostas.id })
        .from(comunicadoRespostas)
        .where(
            and(
                eq(comunicadoRespostas.comunicadoId, announcementId),
                eq(comunicadoRespostas.userId, userId),
            ),
        );
    if (existing) throw new AppError(409, "Você já respondeu este comunicado");
    await db.insert(comunicadoRespostas).values({
        comunicadoId: announcementId,
        userId,
        status: "respondido",
        rating: data.rating,
        comment: data.comment?.trim() || null,
    });
    return { ok: true };
}

export async function saveDismissal(announcementId: string, userId: string) {
    await publishedOr404(announcementId);
    await db
        .insert(comunicadoRespostas)
        .values({ comunicadoId: announcementId, userId, status: "dispensado" })
        .onConflictDoNothing();
    return { ok: true };
}

export async function insertAnnouncement(data: CreateData) {
    const [announcement] = await db.insert(comunicados).values(data).returning();
    return announcement;
}

export async function editAnnouncement(id: string, data: UpdateData) {
    const [announcement] = await db
        .update(comunicados)
        .set(data)
        .where(eq(comunicados.id, id))
        .returning();
    if (!announcement) throw new AppError(404, "Comunicado não encontrado");
    return announcement;
}

export async function removeAnnouncement(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(comunicadoRespostas).where(eq(comunicadoRespostas.comunicadoId, id));
        await tx.delete(comunicados).where(eq(comunicados.id, id));
    });
}

function average(ratings: number[]) {
    return ratings.length
        ? Math.round((ratings.reduce((sum, n) => sum + n, 0) / ratings.length) * 10) / 10
        : null;
}

export async function listAnnouncementsWithStats() {
    const announcements = await db.select().from(comunicados).orderBy(desc(comunicados.createdAt));
    const responses = await db
        .select({
            comunicadoId: comunicadoRespostas.comunicadoId,
            status: comunicadoRespostas.status,
            rating: comunicadoRespostas.rating,
        })
        .from(comunicadoRespostas);
    return announcements.map((announcement) => {
        const ofThis = responses.filter((r) => r.comunicadoId === announcement.id);
        const answered = ofThis.filter((r) => r.status === "respondido");
        const ratings = answered.map((r) => r.rating).filter((n): n is number => n != null);
        return {
            ...announcement,
            respondidos: answered.length,
            dispensados: ofThis.length - answered.length,
            media: average(ratings),
        };
    });
}

export async function getAnnouncementResults(id: string) {
    const [announcement] = await db.select().from(comunicados).where(eq(comunicados.id, id));
    if (!announcement) throw new AppError(404, "Comunicado não encontrado");
    const rows = await db
        .select({
            status: comunicadoRespostas.status,
            rating: comunicadoRespostas.rating,
            comment: comunicadoRespostas.comment,
            createdAt: comunicadoRespostas.createdAt,
            name: users.name,
        })
        .from(comunicadoRespostas)
        .innerJoin(users, eq(users.id, comunicadoRespostas.userId))
        .where(eq(comunicadoRespostas.comunicadoId, id))
        .orderBy(desc(comunicadoRespostas.createdAt));
    const answered = rows.filter((r) => r.status === "respondido");
    const ratings = answered.map((r) => r.rating).filter((n): n is number => n != null);
    return {
        ...announcement,
        respondidos: answered.length,
        dispensados: rows.length - answered.length,
        media: average(ratings),
        distribuicao: [1, 2, 3, 4, 5].map((n) => ({
            rating: n,
            count: ratings.filter((x) => x === n).length,
        })),
        respostas: answered.map((r) => ({
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
        })),
    };
}
