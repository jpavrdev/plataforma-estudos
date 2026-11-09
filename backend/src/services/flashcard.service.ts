import { db } from "../../db.ts";
import {
    flashcards,
    userCards,
    cardReviews,
    cardReports,
    lessons,
    modules,
    trails,
    glossary,
    interviewCards,
    interviewTopics,
} from "../../schema.ts";
import { and, asc, count, desc, eq, inArray, isNotNull, lte, notInArray, sql } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

/**
 * Scheduler based on the Ebbinghaus forgetting curve.
 *
 * The curve says recall drops exponentially with time, and that the drop is
 * slower the more stable the memory is:
 *
 *     R(t) = e^(-t/S)
 *
 * where R is the chance of recalling, t is the time since the last contact and S
 * is the stability of the memory. Here S is reparametrized as days until recall
 * drops to the target, which keeps the formula direct to read:
 *
 *     R(t) = TARGET^(t/S)
 *
 * At t = S retention is exactly the target, and that is where the card comes
 * back. With a 90% target, the interval lands around 10% of the time the memory
 * would last before fading away, which is the single-review window the curve
 * literature points to as the most efficient.
 *
 * Three things move S, and all three come from the theory:
 *
 * 1. Repetition spaces. Each hit multiplies S, so the card comes back later and
 *    later.
 * 2. Easy material is forgotten more slowly. "Easy" multiplies S far more than
 *    "medium", which is why a card the student masters nearly leaves the queue.
 * 3. Recalling what was almost forgotten is worth more. When a card is answered
 *    late, retention at review time was below the target, and recovering the
 *    memory there consolidates more than reviewing freshly studied material.
 *    Answering too early is worth less, for the same reason.
 */
export type Answer = "errei" | "dificil" | "intermediaria" | "facil";

/**
 * Where the card came from. The scheduler does not look at this: it keeps state by
 * (source, sourceId) and treats the three alike. Only the code that reads the card
 * content needs to tell them apart, because each source lives in a different table.
 */
export type CardSource = "flashcard" | "glossario" | "entrevista";

// Review when the chance of recalling drops to 90%. A higher target means
// reviewing more often and forgetting less; lower, the opposite.
const TARGET_RETENTION = 0.9;
// One-year ceiling: a mastered card leaves circulation, but is not gone forever.
const MAX_STABILITY = 365;
const MIN_STABILITY = 0.5;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const MAX_EASE = 3.2;

// How much the card ease changes per answer. Missing weighs more than an easy hit,
// because a card that failed has already proven the interval was too long.
const EASE_ADJUSTMENT: Record<Answer, number> = {
    errei: -0.2,
    dificil: -0.15,
    intermediaria: 0,
    facil: 0.15,
};

// Initial stability, in days, on the card's first hit.
const FIRST_STABILITY: Record<Exclude<Answer, "errei">, number> = {
    dificil: 1,
    intermediaria: 2,
    facil: 4,
};

// How much stability grows on each hit, for a card of average ease. The gap
// between "medium" and "easy" is what makes mastered content rare.
const GAIN: Record<Exclude<Answer, "errei">, number> = {
    dificil: 1.3,
    intermediaria: 2.4,
    facil: 3.6,
};

// Missing does not erase the memory, it shortens it: part of what was learned is
// still there.
const AFTER_ERROR = 0.4;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Fisher-Yates on the PRESENTATION order. It always runs after the limit has
 * already cut the queue: who enters the session keeps being decided by the due
 * date, which is the scheduler's job. Drawing before the cut would make a card
 * two weeks overdue lose its seat to one due today.
 *
 * Why shuffle: in a fixed order the previous card becomes a hint for the next,
 * and the student starts answering the sequence instead of the question. That
 * inflates the grade they give, and the grade is exactly what defines stability
 * and the next date. A fixed order does not just make the review monotonous, it
 * distorts the scheduler. As a bonus, mixing lessons is interleaved practice
 * instead of blocked, which yields more retention even though it feels harder
 * in the moment.
 */
function shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

/** The curve: chance of recalling after this many days without reviewing the card. */
export function retention(stability: number, days: number): number {
    if (stability <= 0) return 0;
    return Math.pow(TARGET_RETENTION, days / stability);
}

interface CardState {
    estabilidade: number;
    facilidade: number;
    repeticoes: number;
    lapsos: number;
}

export function nextState(current: CardState, answer: Answer, daysSinceReview: number) {
    const ease = clamp(current.facilidade + EASE_ADJUSTMENT[answer], MIN_EASE, MAX_EASE);

    if (answer === "errei") {
        return {
            estabilidade: Math.max(MIN_STABILITY, current.estabilidade * AFTER_ERROR),
            facilidade: ease,
            repeticoes: 0,
            lapsos: current.lapsos + 1,
            intervaloDias: 0,
        };
    }

    let stability: number;
    if (current.estabilidade <= 0) {
        stability = FIRST_STABILITY[answer];
    } else {
        // The card ease modulates the gain: a card that is hard for this person
        // grows more slowly than average, and an easy one grows faster.
        const gain = 1 + (GAIN[answer] - 1) * (ease / DEFAULT_EASE);
        // Bonus for the retention at review time. On schedule it gives 1, overdue
        // goes above 1, early stays below. The limits keep marathon-running cards
        // on the same day, or vanishing for months, from distorting stability.
        const r = retention(current.estabilidade, daysSinceReview);
        const bonus = clamp(1 + (TARGET_RETENTION - r) * 2, 0.6, 1.6);
        stability = Math.min(MAX_STABILITY, current.estabilidade * gain * bonus);
    }

    return {
        estabilidade: stability,
        facilidade: ease,
        repeticoes: current.repeticoes + 1,
        lapsos: current.lapsos,
        intervaloDias: Math.max(1, Math.round(stability)),
    };
}

function daysSince(when: Date | null): number {
    if (!when) return 0;
    return Math.max(0, (Date.now() - when.getTime()) / 86400000);
}

function inDays(days: number): Date {
    // A zero interval means "again today", with a 10-minute breather so the card
    // does not pop back in the student's face at the same instant.
    const ms = days === 0 ? 10 * 60 * 1000 : days * 86400000;
    return new Date(Date.now() + ms);
}

/** A user_cards row in the format the scheduler understands. */
function toState(row: {
    estabilidade: string;
    facilidade: string;
    repeticoes: number;
    lapsos: number;
}): CardState {
    return {
        estabilidade: Number(row.estabilidade),
        facilidade: Number(row.facilidade),
        repeticoes: row.repeticoes,
        lapsos: row.lapsos,
    };
}

/**
 * Glossary terms that appear in the lesson text.
 *
 * The boundary uses a lookaround with a unicode class instead of \b for the same
 * reason as the highlight on the front end: JavaScript's \b only knows
 * [A-Za-z0-9_], so an accented term would never match.
 */
async function lessonTerms(lessonId: string): Promise<string[]> {
    const [lesson] = await db
        .select({ blocos: lessons.contentBlocks, titulo: lessons.title })
        .from(lessons)
        .where(eq(lessons.id, lessonId));
    if (!lesson) return [];

    const text = [lesson.titulo, ...(lesson.blocos ?? []).map((b) => b.value ?? "")].join("\n");
    const terms = await db.select({ id: glossary.id, term: glossary.term }).from(glossary);
    const LETTER = "[\\p{L}\\p{N}_]";
    return terms
        .filter((t) => {
            const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            return new RegExp(`(?<!${LETTER})${escaped}(?!${LETTER})`, "iu").test(text);
        })
        .map((t) => t.id);
}

/**
 * The questions the student already has open in this trail.
 *
 * A card's identity within a trail is the question, not the row: the seeder QC
 * forbids a repeated front in the same trail, so an equal front is always the
 * same card. That is what makes it possible to recognize the twin from another
 * language track.
 */
async function openFronts(userId: string, trailId: string): Promise<Set<string>> {
    const rows = await db
        .select({ frente: flashcards.frente })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(and(eq(userCards.userId, userId), eq(lessons.trailId, trailId)));
    return new Set(rows.map((l) => l.frente));
}

/**
 * Creates the state of the cards of a lesson the student has just completed. A
 * card from an unstudied lesson never enters: it would give away the answer
 * early.
 *
 * The glossary terms cited in the lesson come along, becoming term-and-definition
 * cards. Same rule: the student only gets what they have already read.
 */
export async function openLessonCards(userId: string, lessonId: string) {
    const [[lesson], cards, glossaryIds] = await Promise.all([
        db.select({ trailId: lessons.trailId }).from(lessons).where(eq(lessons.id, lessonId)),
        db
            .select({ id: flashcards.id, frente: flashcards.frente })
            .from(flashcards)
            .where(eq(flashcards.lessonId, lessonId)),
        lessonTerms(lessonId),
    ]);

    // A trail with language tracks has the same lesson twice, one per language,
    // and the conceptual card was seeded in both: different rows with the SAME
    // question. Whoever studied both tracks would open both and see the question
    // repeated in review. A question the student already has in the trail bars
    // the twin.
    const alreadyAsked = lesson ? await openFronts(userId, lesson.trailId) : new Set<string>();

    const candidates = [
        ...cards
            .filter((c) => !alreadyAsked.has(c.frente))
            .map((c) => ({ origem: "flashcard" as const, origemId: c.id })),
        ...glossaryIds.map((id) => ({ origem: "glossario" as const, origemId: id })),
    ];
    if (!candidates.length) return 0;

    const owned = new Set(
        (
            await db
                .select({ origem: userCards.origem, origemId: userCards.origemId })
                .from(userCards)
                .where(
                    and(
                        eq(userCards.userId, userId),
                        inArray(
                            userCards.origemId,
                            candidates.map((c) => c.origemId),
                        ),
                    ),
                )
        ).map((r) => `${r.origem}:${r.origemId}`),
    );

    const fresh = candidates.filter((c) => !owned.has(`${c.origem}:${c.origemId}`));
    if (!fresh.length) return 0;
    await db
        .insert(userCards)
        .values(fresh.map((c) => ({ userId, ...c, proximaRevisao: new Date() })));
    return fresh.length;
}

interface QueuedCard {
    id: string;
    frente: string;
    verso: string;
    origem: CardSource;
    trilha: string | null;
    aula: string | null;
    // Where the card came from. It goes along so the back can become a link and
    // the student can reread the lesson the moment they find out they do not
    // remember it. Null on a glossary term.
    trilhaId: string | null;
    aulaId: string | null;
    // Interview cards only: the topic and the level it asks about. An interview
    // card has no trail or lesson to go back to, and this is what shows in their
    // place.
    topico: string | null;
    nivel: string | null;
}

/** The least the queue needs to know about each card: who it is and when it is due. */
interface QueueEntry {
    origem: CardSource;
    origemId: string;
    proximaRevisao: Date;
    // A card that does not exist in the deck yet, coming straight from the
    // catalog. It only breaks ties in the ordering, so the card with history wins
    // over the stateless twin.
    novo?: boolean;
}

/**
 * Catalog cards from the chosen trails that are not in the deck yet.
 *
 * This is what allows reviewing a whole area without having taken the trail.
 * They enter due right now, the same the deck does with a freshly opened card,
 * and only become a user_cards row when the student answers for the first time.
 */
async function newFromCatalog(
    userId: string,
    deckList: string[],
    limit: number,
): Promise<QueueEntry[]> {
    const alreadyInDeck = db
        .select({ id: userCards.origemId })
        .from(userCards)
        .where(and(eq(userCards.userId, userId), eq(userCards.origem, "flashcard")));

    const rows = await db
        .select({ id: flashcards.id })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(
            and(
                inArray(lessons.trailId, deckList),
                eq(lessons.published, true),
                notInArray(flashcards.id, alreadyInDeck),
            ),
        )
        .limit(limit);

    const now = new Date();
    return rows.map((l) => ({
        origem: "flashcard" as const,
        origemId: l.id,
        proximaRevisao: now,
        novo: true,
    }));
}

/**
 * The review queue of the chosen content.
 *
 * It serves EVERYTHING of the chosen content, not only what is due today. The
 * trail screen has always worked this way, and seeing "4 cards" in the review
 * room and "116" on the trail button, for the same content, is a difference
 * nobody can explain to whoever is studying. The two do the same thing, so they
 * deliver the same number.
 *
 * Choosing a trail does not require having studied it: what the student does not
 * have in the deck yet enters from the catalog, as a new card. Without a choice,
 * the queue keeps being their deck and nothing else, because there the request
 * is "mine", not "that area".
 *
 * No session ceiling on purpose: whoever wants to plow through the deck in one
 * go can, and whoever does not can stop when tired, which amounts to the same.
 * The high limit that remains is only a payload brake, so a giant deck does not
 * turn into a multi-megabyte response.
 *
 * The scheduler does not leave the stage, it changes role: it stops locking what
 * shows up and starts ruling the PRIORITY. The order runs from most overdue to
 * most ahead, so when the student asks for a number of cards, what enters the
 * cut is what is closest to being forgotten. Answering keeps rescheduling each
 * card by the curve, and answering early still earns less stability, from the
 * bonus below 1.
 */
export async function dailyQueue(
    userId: string,
    limit = 500,
    filter?: { trilhas?: string[]; glossario?: boolean },
): Promise<QueuedCard[]> {
    const mine = eq(userCards.userId, userId);
    const deckFields = {
        origem: userCards.origem,
        origemId: userCards.origemId,
        proximaRevisao: userCards.proximaRevisao,
    };

    // Without a filter the queue is the whole deck. With one, the trail selection
    // and the glossary are summed: two trails can be reviewed together, or the
    // glossary alone.
    const hasFilter = filter && (filter.trilhas?.length || filter.glossario);
    let rows: QueueEntry[];
    if (!hasFilter) {
        rows = await db
            .select(deckFields)
            .from(userCards)
            .where(mine)
            .orderBy(asc(userCards.proximaRevisao))
            .limit(limit);
    } else {
        const parts: Promise<QueueEntry[]>[] = [];
        if (filter.trilhas?.length) {
            parts.push(
                db
                    .select(deckFields)
                    .from(userCards)
                    .innerJoin(
                        flashcards,
                        and(
                            eq(userCards.origem, "flashcard"),
                            eq(flashcards.id, userCards.origemId),
                        ),
                    )
                    .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
                    .where(and(mine, inArray(lessons.trailId, filter.trilhas)))
                    .orderBy(asc(userCards.proximaRevisao))
                    .limit(limit),
            );
            parts.push(newFromCatalog(userId, filter.trilhas, limit));
        }
        if (filter.glossario) {
            parts.push(
                db
                    .select(deckFields)
                    .from(userCards)
                    .where(and(mine, eq(userCards.origem, "glossario")))
                    .orderBy(asc(userCards.proximaRevisao))
                    .limit(limit),
            );
        }
        rows = (await Promise.all(parts))
            .flat()
            .sort(
                (a, b) =>
                    a.proximaRevisao.getTime() - b.proximaRevisao.getTime() ||
                    Number(a.novo ?? false) - Number(b.novo ?? false),
            )
            .slice(0, limit);
    }
    if (!rows.length) return [];

    // The due-date ordering above chose WHICH cards enter. From here on the order
    // is drawn, otherwise the queue comes out in per-lesson blocks, always in the
    // same sequence the cards were authored.
    return buildCards(shuffle(await dropTwins(rows)));
}

/**
 * Removes the twin card from the queue: the same question twice in the same
 * trail, one per language track.
 *
 * The code no longer opens twins (see openLessonCards) and there is a script to
 * clean the old ones, but while one remains in somebody's deck it would show up
 * repeated in the session, and the room total would not match the trail's. Since
 * the rows arrive ordered by due date, the one that stays is the most overdue.
 *
 * Glossary cards pass right through: their id is already unique per term.
 */
async function dropTwins<T extends { origem: CardSource; origemId: string }>(
    rows: T[],
): Promise<T[]> {
    const ids = rows.filter((l) => l.origem === "flashcard").map((l) => l.origemId);
    if (!ids.length) return rows;

    const data = await db
        .select({ id: flashcards.id, frente: flashcards.frente, trailId: lessons.trailId })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(inArray(flashcards.id, ids));
    const byId = new Map(data.map((d) => [d.id, `${d.trailId}:${d.frente}`]));

    const seen = new Set<string>();
    return rows.filter((l) => {
        if (l.origem !== "flashcard") return true;
        const key = byId.get(l.origemId);
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function buildCards(rows: { origem: CardSource; origemId: string }[]): Promise<QueuedCard[]> {
    const cardIds = rows.filter((l) => l.origem === "flashcard").map((l) => l.origemId);
    const glossIds = rows.filter((l) => l.origem === "glossario").map((l) => l.origemId);

    const cards = cardIds.length
        ? await db
              .select({
                  id: flashcards.id,
                  frente: flashcards.frente,
                  verso: flashcards.verso,
                  aula: lessons.title,
                  aulaId: lessons.id,
                  trilha: trails.name,
                  trilhaId: trails.id,
              })
              .from(flashcards)
              .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
              .innerJoin(trails, eq(trails.id, lessons.trailId))
              .where(inArray(flashcards.id, cardIds))
        : [];
    const terms = glossIds.length
        ? await db
              .select({ id: glossary.id, frente: glossary.term, verso: glossary.definition })
              .from(glossary)
              .where(inArray(glossary.id, glossIds))
        : [];
    // An interview card the student already opened comes back through the daily
    // queue like any other. Interview mode exists to pick topic and level; after
    // being answered once, the card belongs to the deck and the schedule rules it.
    const interviewIds = rows.filter((l) => l.origem === "entrevista").map((l) => l.origemId);
    const questions = interviewIds.length
        ? await db
              .select({
                  id: interviewCards.id,
                  frente: interviewCards.frente,
                  verso: interviewCards.verso,
                  nivel: interviewCards.nivel,
                  topico: interviewTopics.nome,
              })
              .from(interviewCards)
              .innerJoin(interviewTopics, eq(interviewTopics.id, interviewCards.topicoId))
              .where(inArray(interviewCards.id, interviewIds))
        : [];

    const byId = new Map<string, QueuedCard>();
    for (const c of cards)
        byId.set(c.id, {
            id: c.id,
            frente: c.frente,
            verso: c.verso,
            origem: "flashcard",
            trilha: c.trilha,
            aula: c.aula,
            trilhaId: c.trilhaId,
            aulaId: c.aulaId,
            topico: null,
            nivel: null,
        });
    for (const t of terms)
        byId.set(t.id, {
            id: t.id,
            frente: t.frente,
            verso: t.verso,
            origem: "glossario",
            trilha: null,
            aula: null,
            trilhaId: null,
            aulaId: null,
            topico: null,
            nivel: null,
        });
    for (const p of questions)
        byId.set(p.id, {
            id: p.id,
            frente: p.frente,
            verso: p.verso,
            origem: "entrevista",
            trilha: null,
            aula: null,
            trilhaId: null,
            aulaId: null,
            topico: p.topico,
            nivel: p.nivel,
        });

    // Keeps the queue order, and drops whatever is gone from the catalog.
    return rows.map((l) => byId.get(l.origemId)).filter((c): c is QueuedCard => !!c);
}

/** Records the answer and reschedules the card. */
export async function answerCard(
    userId: string,
    source: CardSource,
    sourceId: string,
    answer: Answer,
    tempoMs?: number,
) {
    const [current] = await db
        .select()
        .from(userCards)
        .where(
            and(
                eq(userCards.userId, userId),
                eq(userCards.origem, source),
                eq(userCards.origemId, sourceId),
            ),
        );

    // Without state, the card enters the deck now. This is how free review
    // materializes the card: it is served from the catalog and only becomes a
    // user_cards row when the student grades themselves for the first time.
    const state = current ?? (await openSingleCard(userId, source, sourceId));

    const days = daysSince(state.ultimaRevisao);
    const previous = toState(state);
    const next = nextState(previous, answer, days);

    await db.insert(cardReviews).values({
        userId,
        origem: source,
        origemId: sourceId,
        resposta: answer,
        retencaoPrevista:
            previous.estabilidade > 0 ? retention(previous.estabilidade, days).toFixed(3) : null,
        estabilidadeAntes: previous.estabilidade.toFixed(2),
        estabilidadeDepois: next.estabilidade.toFixed(2),
        intervaloDias: next.intervaloDias,
        tempoMs: tempoMs ?? null,
    });

    await db
        .update(userCards)
        .set({
            estabilidade: next.estabilidade.toFixed(2),
            intervaloDias: next.intervaloDias,
            facilidade: next.facilidade.toFixed(2),
            repeticoes: next.repeticoes,
            lapsos: next.lapsos,
            proximaRevisao: inDays(next.intervaloDias),
            ultimaRevisao: new Date(),
        })
        .where(eq(userCards.id, state.id));

    return { intervaloDias: next.intervaloDias, proximaRevisao: inDays(next.intervaloDias) };
}

/**
 * Opens a loose card in the deck, on the first time the student answers it.
 *
 * It covers the two paths that arrive without a user_cards row: a card authored
 * after the lesson was already completed, and the area card the student chose to
 * review without having taken the trail. The lesson only needs to be published;
 * a glossary term never goes through here because it is only born with the lesson
 * that cites it.
 */
async function openSingleCard(userId: string, source: CardSource, sourceId: string) {
    // An interview card has no twin and no language track: the question exists
    // only once, in a single topic. It is enough to check it exists and open it.
    if (source === "entrevista") {
        const [exists] = await db
            .select({ id: interviewCards.id })
            .from(interviewCards)
            .where(eq(interviewCards.id, sourceId));
        if (!exists) throw new AppError(404, "flashcard.notFound");
        const [opened] = await db
            .insert(userCards)
            .values({ userId, origem: source, origemId: sourceId, proximaRevisao: new Date() })
            .returning();
        return opened;
    }

    if (source !== "flashcard") throw new AppError(404, "flashcard.notInDeck");

    const [allowed] = await db
        .select({ frente: flashcards.frente, trailId: lessons.trailId })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(and(eq(flashcards.id, sourceId), eq(lessons.published, true)));
    if (!allowed) throw new AppError(404, "flashcard.notFound");

    // If the same question is already open through the other language track,
    // answering here moves that card instead of opening a second one. Without
    // this the twin would be reborn in the deck through the back door, which is
    // the trail review path (it reads the catalog, not the deck).
    const [twin] = await db
        .select({ uc: userCards })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(
            and(
                eq(userCards.userId, userId),
                eq(lessons.trailId, allowed.trailId),
                eq(flashcards.frente, allowed.frente),
            ),
        )
        .limit(1);
    if (twin) return twin.uc;

    const [created] = await db
        .insert(userCards)
        .values({ userId, origem: source, origemId: sourceId, proximaRevisao: new Date() })
        .returning();
    return created;
}

/**
 * Review of a whole trail, offered on completing it and available at any time.
 * Unlike the daily queue, the date does not matter here: the goal is to go
 * through the whole content at once, so the order is the lessons' order, not the
 * scheduler's.
 *
 * It does not require progress in the trail. Whoever wants to review an area they
 * never studied gets that area's whole catalog, and each card enters the personal
 * deck as it is answered.
 */
export async function trailReview(trailId: string) {
    const cards = await db
        .select({
            id: flashcards.id,
            frente: flashcards.frente,
            verso: flashcards.verso,
            aula: lessons.title,
            aulaId: lessons.id,
            trilha: trails.name,
            trilhaId: trails.id,
        })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(modules, eq(modules.id, lessons.moduleId))
        .innerJoin(trails, eq(trails.id, lessons.trailId))
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)))
        .orderBy(asc(modules.position), asc(lessons.position), asc(flashcards.position));

    // Here the read is from the catalog, not the deck, so the twin from the other
    // language track arrives even after the deck is cleaned. The first one in
    // trail order stays, which is stable.
    const seen = new Set<string>();
    const deduped = cards.filter((c) => {
        if (seen.has(c.frente)) return false;
        seen.add(c.frente);
        return true;
    });

    // The trail order above serves the dedup, which needs to be stable. The
    // review itself comes out shuffled: here the goal is retention, not redoing
    // the trail path.
    return shuffle(deduped).map((c) => ({ ...c, origem: "flashcard" as const }));
}

/** How many cards the trail has to review. Feeds the review call. */
export async function countTrailReview(trailId: string) {
    const [row] = await db
        // Counts distinct questions, not rows, for the same reason as the dedup in
        // trailReview: otherwise the button promises more cards than it will show.
        .select({ n: sql<number>`count(distinct ${flashcards.frente})` })
        .from(flashcards)
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    return { total: Number(row?.n ?? 0) };
}

/**
 * The areas the student can review: every published trail that has cards, plus
 * the glossary. It is the list the tab shows for them to choose what to review,
 * alone or mixed.
 *
 * The whole catalog comes, not only what they already studied, because choosing
 * an area no longer depends on having taken the trail. Each row says both things:
 * `total` is what they already have in that trail's deck and `disponiveis` is the
 * size of the area. Whoever never opened the trail shows up with total zero and
 * the full deck waiting.
 */
export async function decks(userId: string) {
    const now = new Date();
    const dueCount = sql<number>`count(*) filter (where ${userCards.proximaRevisao} <= ${now})`;

    const [perTrail, catalog, [glossStats]] = await Promise.all([
        db
            .select({
                trilhaId: trails.id,
                nome: trails.name,
                vencidos: dueCount,
                total: count(),
            })
            .from(userCards)
            .innerJoin(
                flashcards,
                and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
            )
            .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
            .innerJoin(trails, eq(trails.id, lessons.trailId))
            .where(eq(userCards.userId, userId))
            .groupBy(trails.id, trails.name)
            .orderBy(trails.name),
        // Distinct questions, not rows, for the same reason as countTrailReview:
        // a trail with language tracks has the same card twice.
        db
            .select({
                trilhaId: trails.id,
                nome: trails.name,
                disponiveis: sql<number>`count(distinct ${flashcards.frente})`,
            })
            .from(flashcards)
            .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
            .innerJoin(trails, eq(trails.id, lessons.trailId))
            .where(eq(lessons.published, true))
            .groupBy(trails.id, trails.name)
            .orderBy(trails.name),
        db
            .select({ vencidos: dueCount, total: count() })
            .from(userCards)
            .where(and(eq(userCards.userId, userId), eq(userCards.origem, "glossario"))),
    ]);

    const mine = new Map(perTrail.map((t) => [t.trilhaId, t]));
    const deckList = catalog.map((c) => ({
        id: c.trilhaId,
        nome: c.nome,
        vencidos: Number(mine.get(c.trilhaId)?.vencidos ?? 0),
        total: Number(mine.get(c.trilhaId)?.total ?? 0),
        disponiveis: Number(c.disponiveis),
    }));

    // An unpublished trail leaves the catalog but may have left cards in
    // somebody's deck. It goes at the end so the student can still review what is
    // already theirs.
    const inCatalog = new Set(deckList.map((t) => t.id));
    for (const t of perTrail) {
        if (inCatalog.has(t.trilhaId)) continue;
        deckList.push({
            id: t.trilhaId,
            nome: t.nome,
            vencidos: Number(t.vencidos),
            total: Number(t.total),
            disponiveis: Number(t.total),
        });
    }
    deckList.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    return {
        trilhas: deckList,
        glossario: {
            vencidos: Number(glossStats?.vencidos ?? 0),
            total: Number(glossStats?.total ?? 0),
        },
    };
}

/**
 * Statistics of the answers. They come from the card_reviews history, not from
 * the current card state: the state is overwritten on each review and does not
 * count what happened before.
 */
export async function statistics(userId: string) {
    const [byAnswer, last30, [maturity], [tempos]] = await Promise.all([
        db
            .select({ resposta: cardReviews.resposta, n: count() })
            .from(cardReviews)
            .where(eq(cardReviews.userId, userId))
            .groupBy(cardReviews.resposta),
        db
            .select({
                dia: sql<string>`to_char(${cardReviews.criadoEm} at time zone 'UTC', 'YYYY-MM-DD')`,
                n: count(),
            })
            .from(cardReviews)
            .where(
                and(
                    eq(cardReviews.userId, userId),
                    sql`${cardReviews.criadoEm} >= now() - interval '30 days'`,
                ),
            )
            .groupBy(sql`1`)
            .orderBy(sql`1`),
        db
            .select({
                emAprendizado: sql<number>`count(*) filter (where ${userCards.intervaloDias} < 21)`,
                dominados: sql<number>`count(*) filter (where ${userCards.intervaloDias} >= 21)`,
                mediaEstabilidade: sql<number>`coalesce(avg(${userCards.estabilidade}), 0)`,
            })
            .from(userCards)
            .where(eq(userCards.userId, userId)),
        // The median tells more than the mean here: one card left open while the
        // person went for coffee would drag the mean alone.
        db
            .select({
                mediana: sql<number>`coalesce(percentile_cont(0.5) within group (order by ${cardReviews.tempoMs}), 0)`,
                total: sql<number>`coalesce(sum(${cardReviews.tempoMs}), 0)`,
            })
            .from(cardReviews)
            .where(and(eq(cardReviews.userId, userId), isNotNull(cardReviews.tempoMs))),
    ]);

    const counts = { errei: 0, dificil: 0, intermediaria: 0, facil: 0 } as Record<Answer, number>;
    for (const r of byAnswer) counts[r.resposta] = Number(r.n);
    const totalAnswers = Object.values(counts).reduce((s, n) => s + n, 0);
    const correctAnswers = totalAnswers - counts.errei;

    return {
        respostas: totalAnswers,
        acertos: correctAnswers,
        // Hit rate: share of cards the student recalled on the spot. It is the
        // direct measure of whether the scheduler is getting the review moment
        // right; far above the target means reviewing too early.
        taxaAcerto: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        porResposta: counts,
        diasAtivos: last30.length,
        porDia: last30.map((d) => ({ dia: d.dia, n: Number(d.n) })),
        emAprendizado: Number(maturity?.emAprendizado ?? 0),
        dominados: Number(maturity?.dominados ?? 0),
        // How long, on average, the deck memory lasts until retention drops to the
        // target.
        estabilidadeMedia: Math.round(Number(maturity?.mediaEstabilidade ?? 0)),
        tempoTipicoMs: Math.round(Number(tempos?.mediana ?? 0)),
        tempoTotalMs: Number(tempos?.total ?? 0),
    };
}

/**
 * The cards the student stumbles on the most.
 *
 * It sorts by lapses and breaks ties by ease because the two count different
 * things: a lapse is how many times the memory has already failed, ease is how
 * much the scheduler has learned that card is hard for this person. A card with
 * two lapses and ease at the floor bothers more than one with two lapses and
 * average ease.
 *
 * The origin lesson comes along: insisting on the card solves less than rereading
 * the part that did not stick.
 */
export async function weakPoints(userId: string, limit = 5) {
    const cards = await db
        .select({
            id: userCards.origemId,
            origem: userCards.origem,
            lapsos: userCards.lapsos,
            facilidade: userCards.facilidade,
            frente: flashcards.frente,
            aula: lessons.title,
            aulaId: lessons.id,
            trilha: trails.name,
            trilhaId: trails.id,
        })
        .from(userCards)
        .innerJoin(
            flashcards,
            and(eq(userCards.origem, "flashcard"), eq(flashcards.id, userCards.origemId)),
        )
        .innerJoin(lessons, eq(lessons.id, flashcards.lessonId))
        .innerJoin(trails, eq(trails.id, lessons.trailId))
        .where(and(eq(userCards.userId, userId), sql`${userCards.lapsos} > 0`))
        .orderBy(desc(userCards.lapsos), asc(userCards.facilidade))
        .limit(limit);

    // Glossary terms get missed too, and have no lesson to link.
    const terms = await db
        .select({
            id: userCards.origemId,
            origem: userCards.origem,
            lapsos: userCards.lapsos,
            facilidade: userCards.facilidade,
            frente: glossary.term,
        })
        .from(userCards)
        .innerJoin(
            glossary,
            and(eq(userCards.origem, "glossario"), eq(glossary.id, userCards.origemId)),
        )
        .where(and(eq(userCards.userId, userId), sql`${userCards.lapsos} > 0`))
        .orderBy(desc(userCards.lapsos), asc(userCards.facilidade))
        .limit(limit);

    return [
        ...cards.map((c) => ({ ...c, facilidade: Number(c.facilidade) })),
        ...terms.map((t) => ({
            ...t,
            facilidade: Number(t.facilidade),
            aula: null as string | null,
            aulaId: null as string | null,
            trilha: null as string | null,
            trilhaId: null as string | null,
        })),
    ]
        .sort((a, b) => b.lapsos - a.lapsos || a.facilidade - b.facilidade)
        .slice(0, limit);
}

// The silence separating one session from the next. There is no "started" and
// "ended" record: the session is rebuilt from the history, and this is the cut
// that decides whether two consecutive reviews were the same sitting or two
// different visits.
const SESSION_GAP = "30 minutes";

/**
 * Session history, rebuilt from the answers.
 *
 * Grouping instead of recording has one advantage that settled the choice: it
 * works backwards, over everything already answered, and does not depend on the
 * student "closing" the session, which nobody does (the tab closes, the phone
 * sleeps, the battery dies).
 */
export async function sessionHistory(userId: string, limit = 20) {
    const { rows } = await db.execute<{
        inicio: string;
        fim: string;
        cartas: number;
        errei: number;
        dificil: number;
        intermediaria: number;
        facil: number;
        tempo_respondendo: number;
        conteudos: string[];
    }>(sql`
        with marcadas as (
            select
                cr.criado_em,
                cr.resposta,
                cr.tempo_ms,
                cr.origem,
                cr.origem_id,
                case
                    when lag(cr.criado_em) over (order by cr.criado_em) is null
                      or cr.criado_em - lag(cr.criado_em) over (order by cr.criado_em)
                         > ${sql.raw(`interval '${SESSION_GAP}'`)}
                    then 1 else 0
                end as nova
            from card_reviews cr
            where cr.user_id = ${userId}
        ),
        numeradas as (
            select *, sum(nova) over (order by criado_em) as sessao from marcadas
        ),
        com_conteudo as (
            select
                n.*,
                case when n.origem = 'glossario' then 'Glossário' else t.name end as conteudo
            from numeradas n
            left join flashcards f on n.origem = 'flashcard' and f.id = n.origem_id
            left join lessons l on l.id = f.lesson_id
            left join trails t on t.id = l.trail_id
        )
        select
            min(criado_em) as inicio,
            max(criado_em) as fim,
            count(*)::int as cartas,
            count(*) filter (where resposta = 'errei')::int as errei,
            count(*) filter (where resposta = 'dificil')::int as dificil,
            count(*) filter (where resposta = 'intermediaria')::int as intermediaria,
            count(*) filter (where resposta = 'facil')::int as facil,
            coalesce(sum(tempo_ms), 0)::int as tempo_respondendo,
            array_remove(array_agg(distinct conteudo), null) as conteudos
        from com_conteudo
        group by sessao
        order by inicio desc
        limit ${limit}
    `);

    return rows.map((s) => {
        const start = new Date(s.inicio);
        const end = new Date(s.fim);
        const answering = Number(s.tempo_respondendo);
        return {
            inicio: start.toISOString(),
            fim: end.toISOString(),
            cartas: Number(s.cartas),
            porResposta: {
                errei: Number(s.errei),
                dificil: Number(s.dificil),
                intermediaria: Number(s.intermediaria),
                facil: Number(s.facil),
            },
            // The content comes from what actually came up, not from the stored
            // choice: the choice may have been "everything", and knowing that
            // Logic and the glossary came up says more.
            conteudos: s.conteudos ?? [],
            // Clock duration, from the first to the last card. In a one-card
            // session it would be zero, so the summed answer time serves as a
            // floor.
            duracaoMs: Math.max(end.getTime() - start.getTime(), answering),
            tempoRespondendoMs: answering,
        };
    });
}

/**
 * Flags a card with a problem.
 *
 * It used to require the card in the deck, which became a silly lock with free
 * review: in an area the student never studied, the card only enters the deck
 * when they answer, and the error they want to report is usually in the first
 * one that shows up. The card only needs to exist; whoever is seeing a card can
 * report it.
 */
export async function reportCard(
    userId: string,
    source: CardSource,
    sourceId: string,
    comment?: string,
) {
    const [exists] =
        source === "flashcard"
            ? await db
                  .select({ id: flashcards.id })
                  .from(flashcards)
                  .where(eq(flashcards.id, sourceId))
            : source === "entrevista"
              ? await db
                    .select({ id: interviewCards.id })
                    .from(interviewCards)
                    .where(eq(interviewCards.id, sourceId))
              : await db
                    .select({ id: glossary.id })
                    .from(glossary)
                    .where(eq(glossary.id, sourceId));
    if (!exists) throw new AppError(404, "flashcard.notFound");

    await db
        .insert(cardReports)
        .values({ userId, origem: source, origemId: sourceId, comentario: comment ?? null })
        .onConflictDoUpdate({
            target: [cardReports.userId, cardReports.origem, cardReports.origemId],
            set: { comentario: comment ?? null, criadoEm: new Date(), resolvidoEm: null },
        });
    return { reportado: true };
}

/** Numbers for the tab: how many due today, how many in the deck, how many mastered. */
export async function summary(userId: string) {
    const [[due], [total], [mastered]] = await Promise.all([
        db
            .select({ n: count() })
            .from(userCards)
            .where(and(eq(userCards.userId, userId), lte(userCards.proximaRevisao, new Date()))),
        db.select({ n: count() }).from(userCards).where(eq(userCards.userId, userId)),
        db
            .select({ n: count() })
            .from(userCards)
            .where(
                and(
                    eq(userCards.userId, userId),
                    // 21 days is the point where the interval is already long
                    // enough for the memory to be considered firm; it is the same
                    // cutoff Anki uses to call a card mature.
                    sql`${userCards.intervaloDias} >= 21`,
                ),
            ),
    ]);
    return {
        vencidos: Number(due?.n ?? 0),
        total: Number(total?.n ?? 0),
        dominados: Number(mastered?.n ?? 0),
    };
}
