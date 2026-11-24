import { db } from "../../db.ts";
import { lessonNotes, lessons } from "../../schema.ts";
import { and, desc, eq } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

// The notebook takes written notes and highlights (selections from the lesson).
// The body has a ceiling so a long quote fits whole without becoming a dump of
// the entire lesson.
const MAX_BODY = 2000;
const KINDS = ["nota", "grifo"] as const;

export interface LessonNote {
    id: string;
    lessonId: string;
    kind: string;
    body: string;
    createdAt: Date;
}

/** Notes of one lesson, newest first (the notebook shows the latest on top). */
export async function listLessonNotes(userId: string, lessonId: string): Promise<LessonNote[]> {
    return db
        .select({
            id: lessonNotes.id,
            lessonId: lessonNotes.lessonId,
            kind: lessonNotes.kind,
            body: lessonNotes.body,
            createdAt: lessonNotes.createdAt,
        })
        .from(lessonNotes)
        .where(and(eq(lessonNotes.userId, userId), eq(lessonNotes.lessonId, lessonId)))
        .orderBy(desc(lessonNotes.createdAt));
}

/** Whole-trail notebook: each card carries the lesson title so the reader can go back. */
export async function listTrailNotes(userId: string, trailId: string) {
    return db
        .select({
            id: lessonNotes.id,
            lessonId: lessonNotes.lessonId,
            kind: lessonNotes.kind,
            body: lessonNotes.body,
            createdAt: lessonNotes.createdAt,
            aula: lessons.title,
        })
        .from(lessonNotes)
        .innerJoin(lessons, eq(lessons.id, lessonNotes.lessonId))
        .where(and(eq(lessonNotes.userId, userId), eq(lessons.trailId, trailId)))
        .orderBy(desc(lessonNotes.createdAt));
}

export async function createNote(
    userId: string,
    lessonId: string,
    kind: string,
    body: string,
): Promise<LessonNote> {
    if (!KINDS.includes(kind as (typeof KINDS)[number])) {
        throw new AppError(400, "note.invalidKind");
    }
    const text = typeof body === "string" ? body.trim().slice(0, MAX_BODY) : "";
    if (!text) throw new AppError(400, "note.invalidBody");

    // The lesson must exist and be published: the notebook belongs to the student
    // reading the lesson, not to a scratchpad for lessons under construction.
    const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.id, lessonId), eq(lessons.published, true)));
    if (!lesson) throw new AppError(404, "lesson.notFound");

    // Highlighting the exact same excerpt twice only clutters the notebook; the
    // frontend also guards this, the check here closes the race and the API hole.
    if (kind === "grifo") {
        const [dupe] = await db
            .select({ id: lessonNotes.id })
            .from(lessonNotes)
            .where(
                and(
                    eq(lessonNotes.userId, userId),
                    eq(lessonNotes.lessonId, lessonId),
                    eq(lessonNotes.kind, "grifo"),
                    eq(lessonNotes.body, text),
                ),
            );
        if (dupe) throw new AppError(409, "note.alreadyHighlighted");
    }

    const [note] = await db
        .insert(lessonNotes)
        .values({ userId, lessonId, kind, body: text })
        .returning({
            id: lessonNotes.id,
            lessonId: lessonNotes.lessonId,
            kind: lessonNotes.kind,
            body: lessonNotes.body,
            createdAt: lessonNotes.createdAt,
        });
    return note;
}

/** Only the owner can delete; a miss (wrong id or someone else's note) is the same 404. */
export async function deleteNote(userId: string, noteId: string) {
    const deleted = await db
        .delete(lessonNotes)
        .where(and(eq(lessonNotes.id, noteId), eq(lessonNotes.userId, userId)))
        .returning({ id: lessonNotes.id });
    if (deleted.length === 0) throw new AppError(404, "note.notFound");
}
