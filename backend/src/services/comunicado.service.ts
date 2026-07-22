import { db } from "../../db.ts";
import { comunicados, comunicadoRespostas, users } from "../../schema.ts";
import { and, desc, eq, notExists } from "drizzle-orm";
import type { z } from "zod";
import type { createComunicadoSchema, updateComunicadoSchema } from "../schemas/comunicado.schema.ts";
import { AppError } from "../errors/AppError.ts";

type DadosCriar = z.infer<typeof createComunicadoSchema>;
type DadosAtualizar = z.infer<typeof updateComunicadoSchema>;

// O comunicado publicado mais recente com o qual o usuário ainda não interagiu.
export async function comunicadoAtivo(userId: string) {
    const [c] = await db
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
    return c ?? null;
}

async function publicadoOu404(id: string) {
    const [c] = await db.select().from(comunicados).where(eq(comunicados.id, id));
    if (!c || !c.published) throw new AppError(404, "Comunicado não encontrado");
    return c;
}

export async function responderComunicado(
    comunicadoId: string,
    userId: string,
    dados: { rating: number; comment?: string },
) {
    const c = await publicadoOu404(comunicadoId);
    if (c.kind !== "pesquisa") throw new AppError(400, "Este comunicado não aceita resposta");
    const [existe] = await db
        .select({ id: comunicadoRespostas.id })
        .from(comunicadoRespostas)
        .where(
            and(
                eq(comunicadoRespostas.comunicadoId, comunicadoId),
                eq(comunicadoRespostas.userId, userId),
            ),
        );
    if (existe) throw new AppError(409, "Você já respondeu este comunicado");
    await db.insert(comunicadoRespostas).values({
        comunicadoId,
        userId,
        status: "respondido",
        rating: dados.rating,
        comment: dados.comment?.trim() || null,
    });
    return { ok: true };
}

export async function dispensarComunicado(comunicadoId: string, userId: string) {
    await publicadoOu404(comunicadoId);
    await db
        .insert(comunicadoRespostas)
        .values({ comunicadoId, userId, status: "dispensado" })
        .onConflictDoNothing();
    return { ok: true };
}

export async function criarComunicado(dados: DadosCriar) {
    const [c] = await db.insert(comunicados).values(dados).returning();
    return c;
}

export async function atualizarComunicado(id: string, dados: DadosAtualizar) {
    const [c] = await db.update(comunicados).set(dados).where(eq(comunicados.id, id)).returning();
    if (!c) throw new AppError(404, "Comunicado não encontrado");
    return c;
}

export async function excluirComunicado(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(comunicadoRespostas).where(eq(comunicadoRespostas.comunicadoId, id));
        await tx.delete(comunicados).where(eq(comunicados.id, id));
    });
}

function media(notas: number[]) {
    return notas.length
        ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10
        : null;
}

export async function listarComunicadosAdmin() {
    const cs = await db.select().from(comunicados).orderBy(desc(comunicados.createdAt));
    const rs = await db
        .select({
            comunicadoId: comunicadoRespostas.comunicadoId,
            status: comunicadoRespostas.status,
            rating: comunicadoRespostas.rating,
        })
        .from(comunicadoRespostas);
    return cs.map((c) => {
        const deste = rs.filter((r) => r.comunicadoId === c.id);
        const respondidos = deste.filter((r) => r.status === "respondido");
        const notas = respondidos.map((r) => r.rating).filter((n): n is number => n != null);
        return {
            ...c,
            respondidos: respondidos.length,
            dispensados: deste.length - respondidos.length,
            media: media(notas),
        };
    });
}

export async function resultadosComunicado(id: string) {
    const [c] = await db.select().from(comunicados).where(eq(comunicados.id, id));
    if (!c) throw new AppError(404, "Comunicado não encontrado");
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
    const respondidas = rows.filter((r) => r.status === "respondido");
    const notas = respondidas.map((r) => r.rating).filter((n): n is number => n != null);
    return {
        ...c,
        respondidos: respondidas.length,
        dispensados: rows.length - respondidas.length,
        media: media(notas),
        distribuicao: [1, 2, 3, 4, 5].map((n) => ({
            rating: n,
            count: notas.filter((x) => x === n).length,
        })),
        respostas: respondidas.map((r) => ({
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
        })),
    };
}
