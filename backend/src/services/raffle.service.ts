import { randomInt } from "node:crypto";
import { and, asc, count, desc, eq, isNull, lte, ne, sql } from "drizzle-orm";
import type { z } from "zod";
import { db } from "../../db.ts";
import { sorteioParticipacoes, sorteios, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import type { Contacts } from "../domain/contacts.ts";
import { periodsOverlap, isValidPeriod, raffleStatus } from "../domain/raffle.ts";
import type { Period } from "../domain/raffle.ts";
import { pickRandom } from "../domain/pickRandom.ts";
import type { updateRaffleSchema, createRaffleSchema } from "../schemas/raffle.schema.ts";

type CreateRaffleData = z.infer<typeof createRaffleSchema>;
type UpdateRaffleData = z.infer<typeof updateRaffleSchema>;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const WINNER_COUNT = 3;

const studentEntry = {
    contatos: sorteioParticipacoes.contatos,
    inscritoEm: sorteioParticipacoes.createdAt,
};

export async function activeRaffle(userId: string) {
    const now = new Date();
    // Since periods never overlap, only the last raffle to start can still be open.
    const [sorteio] = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            descricao: sorteios.descricao,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
        })
        .from(sorteios)
        .where(lte(sorteios.inicio, now))
        .orderBy(desc(sorteios.inicio))
        .limit(1);
    if (!sorteio || raffleStatus(sorteio, now) !== "aberto") return null;

    const [entry] = await db
        .select(studentEntry)
        .from(sorteioParticipacoes)
        .where(
            and(
                eq(sorteioParticipacoes.sorteioId, sorteio.id),
                eq(sorteioParticipacoes.userId, userId),
            ),
        );
    return {
        id: sorteio.id,
        titulo: sorteio.titulo,
        descricao: sorteio.descricao,
        inicio: sorteio.inicio,
        fim: sorteio.fim,
        participacao: entry ?? null,
    };
}

// FOR SHARE holds the row until the end of the transaction: the UPDATE that marks
// the draw waits for the entry in flight to finish, and the one arriving after it
// already finds sorteado_em filled.
async function requireOpenEntries(tx: DbTransaction, sorteioId: string) {
    const [sorteio] = await tx
        .select({ inicio: sorteios.inicio, fim: sorteios.fim, sorteadoEm: sorteios.sorteadoEm })
        .from(sorteios)
        .where(eq(sorteios.id, sorteioId))
        .for("share");
    if (!sorteio) throw new AppError(404, "raffle.notFound");
    if (raffleStatus(sorteio, new Date()) !== "aberto") {
        throw new AppError(409, "raffle.signupClosed");
    }
}

// An entry is final: there is no editing or leaving after it is confirmed.
export async function enterRaffle(sorteioId: string, userId: string, contatos: Contacts) {
    return db.transaction(async (tx) => {
        await requireOpenEntries(tx, sorteioId);
        // The screen asks for a complete profile first; without an @ the winner could not be announced.
        const [student] = await tx
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, userId));
        if (!student?.username) throw new AppError(403, "raffle.usernameRequired");

        // No row returned means the unique(sorteio_id, user_id) blocked it: already entered.
        const [entry] = await tx
            .insert(sorteioParticipacoes)
            .values({ sorteioId, userId, contatos })
            .onConflictDoNothing({
                target: [sorteioParticipacoes.sorteioId, sorteioParticipacoes.userId],
            })
            .returning(studentEntry);
        if (!entry) throw new AppError(409, "raffle.alreadyEntered");
        return entry;
    });
}

export async function listRaffles() {
    const now = new Date();
    const rows = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
            participantes: count(sorteioParticipacoes.id),
        })
        .from(sorteios)
        .leftJoin(sorteioParticipacoes, eq(sorteioParticipacoes.sorteioId, sorteios.id))
        .groupBy(sorteios.id)
        .orderBy(desc(sorteios.inicio));
    return rows.map(({ participantes, ...sorteio }) => ({
        ...sorteio,
        situacao: raffleStatus(sorteio, now),
        participantes,
    }));
}

export async function raffleDetail(id: string) {
    const [sorteio] = await db
        .select({
            id: sorteios.id,
            titulo: sorteios.titulo,
            descricao: sorteios.descricao,
            inicio: sorteios.inicio,
            fim: sorteios.fim,
            sorteadoEm: sorteios.sorteadoEm,
        })
        .from(sorteios)
        .where(eq(sorteios.id, id));
    if (!sorteio) throw new AppError(404, "raffle.notFound");

    const entries = await db
        .select({
            posicao: sorteioParticipacoes.posicao,
            username: users.username,
            nome: users.name,
            inscritoEm: sorteioParticipacoes.createdAt,
            contatos: sorteioParticipacoes.contatos,
        })
        .from(sorteioParticipacoes)
        .innerJoin(users, eq(users.id, sorteioParticipacoes.userId))
        .where(eq(sorteioParticipacoes.sorteioId, id))
        .orderBy(asc(sorteioParticipacoes.createdAt), asc(sorteioParticipacoes.id));

    const ganhadores = entries
        .flatMap(({ posicao, username, nome, contatos }) =>
            posicao === null ? [] : [{ posicao, username, nome, contatos }],
        )
        .sort((a, b) => a.posicao - b.posicao);

    return {
        ...sorteio,
        situacao: raffleStatus(sorteio, new Date()),
        ganhadores,
        participantes: entries.map(({ username, nome, inscritoEm, contatos }) => ({
            username,
            nome,
            inscritoEm,
            contatos,
        })),
    };
}

// One raffle per period. The transaction lock queues creations and edits: without
// it two of them could check the schedule at the same time and save overlapping periods.
async function ensureFreePeriod(tx: DbTransaction, period: Period, ignoreId?: string) {
    if (!isValidPeriod(period)) throw new AppError(400, "raffle.endBeforeStart");
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('sorteios_periodo'))`);
    const others = await tx
        .select({ inicio: sorteios.inicio, fim: sorteios.fim })
        .from(sorteios)
        .where(ignoreId ? ne(sorteios.id, ignoreId) : undefined);
    if (others.some((other) => periodsOverlap(other, period))) {
        throw new AppError(409, "raffle.periodTaken");
    }
}

export async function insertRaffle(data: CreateRaffleData) {
    const id = await db.transaction(async (tx) => {
        await ensureFreePeriod(tx, data);
        const [created] = await tx.insert(sorteios).values(data).returning({ id: sorteios.id });
        return created.id;
    });
    return raffleDetail(id);
}

export async function editRaffle(id: string, data: UpdateRaffleData) {
    if (Object.keys(data).length === 0) throw new AppError(400, "common.nothingToUpdate");
    await db.transaction(async (tx) => {
        // FOR UPDATE keeps a raffle drawn during the edit from being changed afterwards.
        const [current] = await tx
            .select({ inicio: sorteios.inicio, fim: sorteios.fim, sorteadoEm: sorteios.sorteadoEm })
            .from(sorteios)
            .where(eq(sorteios.id, id))
            .for("update");
        if (!current) throw new AppError(404, "raffle.notFound");
        if (current.sorteadoEm) throw new AppError(409, "raffle.drawnNotEditable");
        if (data.inicio || data.fim) {
            const period = { inicio: data.inicio ?? current.inicio, fim: data.fim ?? current.fim };
            await ensureFreePeriod(tx, period, id);
        }
        await tx
            .update(sorteios)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(sorteios.id, id));
    });
    return raffleDetail(id);
}

export async function removeRaffle(id: string) {
    await db.delete(sorteios).where(eq(sorteios.id, id));
    return { ok: true };
}

async function refusalReason(tx: DbTransaction, id: string) {
    const [sorteio] = await tx
        .select({ sorteadoEm: sorteios.sorteadoEm })
        .from(sorteios)
        .where(eq(sorteios.id, id));
    if (!sorteio) return new AppError(404, "raffle.notFound");
    if (sorteio.sorteadoEm) return new AppError(409, "raffle.alreadyDrawn");
    return new AppError(409, "raffle.drawAfterEnd");
}

export async function drawRaffle(id: string) {
    await db.transaction(async (tx) => {
        // Mark and lock in the same UPDATE: the second click waits for this one to
        // finish and no longer finds the row, and the late entry already reads
        // sorteado_em.
        const [marked] = await tx
            .update(sorteios)
            .set({ sorteadoEm: sql`now()`, updatedAt: sql`now()` })
            .where(
                and(
                    eq(sorteios.id, id),
                    isNull(sorteios.sorteadoEm),
                    lte(sorteios.fim, sql`now()`),
                ),
            )
            .returning({ id: sorteios.id });
        if (!marked) throw await refusalReason(tx, id);

        const entries = await tx
            .select({ id: sorteioParticipacoes.id })
            .from(sorteioParticipacoes)
            .where(eq(sorteioParticipacoes.sorteioId, id))
            .orderBy(asc(sorteioParticipacoes.createdAt), asc(sorteioParticipacoes.id));
        if (entries.length === 0) throw new AppError(409, "raffle.noEntries");

        const winners = pickRandom(
            entries.map((entry) => entry.id),
            WINNER_COUNT,
            (limit) => randomInt(limit),
        );
        for (const [index, entryId] of winners.entries()) {
            await tx
                .update(sorteioParticipacoes)
                .set({ posicao: index + 1, updatedAt: sql`now()` })
                .where(eq(sorteioParticipacoes.id, entryId));
        }
        // Data minimization (LGPD): whoever did not win stays as an entry, but without contacts.
        await tx
            .update(sorteioParticipacoes)
            .set({ contatos: null, updatedAt: sql`now()` })
            .where(
                and(eq(sorteioParticipacoes.sorteioId, id), isNull(sorteioParticipacoes.posicao)),
            );
    });
    return raffleDetail(id);
}
