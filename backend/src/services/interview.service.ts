import { db } from "../../db.ts";
import { interviewCards, interviewTopics, userCards } from "../../schema.ts";
import { and, asc, count, eq, inArray, notInArray, sql } from "drizzle-orm";

/**
 * Interview mode: the same cards as the review engine, picked by level and by topic
 * instead of by track.
 *
 * Scheduling, the deck, the streak and the statistics are the same as the track
 * review, because user_cards keeps state per (origem, origemId) and does not look at
 * the card type. All that exists here is the way to choose what goes into a session.
 *
 * As in the free area review, the card is served from the catalog and only becomes a
 * user_cards row when the student answers it for the first time. Browsing the topics
 * does not bloat anyone's deck.
 */

export type InterviewLevel = "estagio" | "junior" | "pleno" | "senior";

/**
 * From the shallowest to the deepest. The order matters: the level is cumulative, so
 * choosing mid-level (pleno) also brings intern and junior. A mid-level interview asks
 * the basics just the same, and making the student tick three boxes to get an honest
 * session would be noise.
 */
export const INTERVIEW_LEVELS: InterviewLevel[] = ["estagio", "junior", "pleno", "senior"];

export const LEVEL_LABELS: Record<InterviewLevel, string> = {
    estagio: "Estágio",
    junior: "Júnior",
    pleno: "Pleno",
    senior: "Sênior",
};

/** The levels included when the student picks one: that one and all the previous ones. */
export function levelsUpTo(level: InterviewLevel): InterviewLevel[] {
    return INTERVIEW_LEVELS.slice(0, INTERVIEW_LEVELS.indexOf(level) + 1);
}

function isLevel(v: string): v is InterviewLevel {
    return (INTERVIEW_LEVELS as string[]).includes(v);
}

export function parseLevel(v: string | undefined): InterviewLevel | null {
    return v && isLevel(v) ? v : null;
}

/**
 * The available topics, with how many questions each one has up to the chosen level
 * and how many of those the student has ever answered.
 *
 * The answered count is what gives the sense of progress; without it the list would
 * just be a menu, and the student would not know where to continue.
 */
export async function listTopics(userId: string, level: InterviewLevel) {
    const levels = levelsUpTo(level);

    const [rows, answered] = await Promise.all([
        db
            .select({
                id: interviewTopics.id,
                slug: interviewTopics.slug,
                nome: interviewTopics.nome,
                position: interviewTopics.position,
                total: count(interviewCards.id),
            })
            .from(interviewTopics)
            .leftJoin(
                interviewCards,
                and(
                    eq(interviewCards.topicoId, interviewTopics.id),
                    inArray(interviewCards.nivel, levels),
                ),
            )
            .groupBy(interviewTopics.id)
            .orderBy(asc(interviewTopics.position), asc(interviewTopics.nome)),
        db
            .select({ topicoId: interviewCards.topicoId, n: count(userCards.id) })
            .from(userCards)
            .innerJoin(
                interviewCards,
                and(eq(userCards.origem, "entrevista"), eq(interviewCards.id, userCards.origemId)),
            )
            .where(and(eq(userCards.userId, userId), inArray(interviewCards.nivel, levels)))
            .groupBy(interviewCards.topicoId),
    ]);

    const byTopic = new Map(answered.map((a) => [a.topicoId, a.n]));
    return rows.map((t) => ({
        id: t.id,
        slug: t.slug,
        nome: t.nome,
        total: t.total,
        vistas: byTopic.get(t.id) ?? 0,
    }));
}

/**
 * The queue of an interview session.
 *
 * The order is shuffled on purpose, not by the schedule: in an interview the
 * questions do not come in the order you studied them. What the schedule keeps
 * governing is what is already in the deck, through the daily queue.
 */
export async function buildQueue(
    userId: string,
    options: { nivel: InterviewLevel; topicos?: string[]; limite?: number | null },
) {
    const levels = levelsUpTo(options.nivel);
    const filters = [inArray(interviewCards.nivel, levels)];
    if (options.topicos?.length) filters.push(inArray(interviewCards.topicoId, options.topicos));

    const rows = await db
        .select({
            id: interviewCards.id,
            frente: interviewCards.frente,
            verso: interviewCards.verso,
            nivel: interviewCards.nivel,
            topico: interviewTopics.nome,
        })
        .from(interviewCards)
        .innerJoin(interviewTopics, eq(interviewTopics.id, interviewCards.topicoId))
        .where(and(...filters))
        .orderBy(sql`random()`)
        .limit(options.limite && options.limite > 0 ? options.limite : 200);

    return rows.map((l) => ({
        id: l.id,
        frente: l.frente,
        verso: l.verso,
        origem: "entrevista" as const,
        trilha: null,
        aula: null,
        trilhaId: null,
        aulaId: null,
        topico: l.topico,
        nivel: l.nivel,
    }));
}

/**
 * Numbers at the top of the mode: how many questions exist up to that level, how many
 * the student has ever answered and how many they have not seen yet.
 */
export async function summarizeProgress(userId: string, level: InterviewLevel) {
    const levels = levelsUpTo(level);

    const alreadyInDeck = db
        .select({ id: userCards.origemId })
        .from(userCards)
        .where(and(eq(userCards.userId, userId), eq(userCards.origem, "entrevista")));

    const [[total], [unseen]] = await Promise.all([
        db.select({ n: count() }).from(interviewCards).where(inArray(interviewCards.nivel, levels)),
        db
            .select({ n: count() })
            .from(interviewCards)
            .where(
                and(
                    inArray(interviewCards.nivel, levels),
                    notInArray(interviewCards.id, alreadyInDeck),
                ),
            ),
    ]);

    return {
        nivel: level,
        total: total?.n ?? 0,
        novas: unseen?.n ?? 0,
        vistas: (total?.n ?? 0) - (unseen?.n ?? 0),
    };
}
