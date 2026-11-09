import { db } from "../../db.ts";
import { languages } from "../../schema.ts";
import { eq, asc, sql } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

export async function findLanguages() {
    return db.select().from(languages).orderBy(asc(languages.name));
}

export async function insertLanguage(name: string) {
    const [existing] = await db
        .select({ id: languages.id })
        .from(languages)
        .where(eq(languages.name, name));
    if (existing) {
        throw new AppError(409, "language.nameTaken");
    }
    const [lang] = await db.insert(languages).values({ name }).returning();
    return lang;
}

export async function editLanguage(id: string, name: string) {
    const [current] = await db
        .select({ name: languages.name })
        .from(languages)
        .where(eq(languages.id, id));
    if (!current) {
        throw new AppError(404, "language.notFound");
    }
    const [conflict] = await db
        .select({ id: languages.id })
        .from(languages)
        .where(eq(languages.name, name));
    if (conflict && conflict.id !== id) {
        throw new AppError(409, "language.nameTaken");
    }
    return db.transaction(async (tx) => {
        const [updated] = await tx
            .update(languages)
            .set({ name })
            .where(eq(languages.id, id))
            .returning();
        // Renamed: propagate the new name to the profiles that used the old one.
        if (current.name !== name) {
            await tx.execute(sql`
                UPDATE users
                SET languages = (
                    SELECT jsonb_agg(CASE WHEN elem = ${JSON.stringify(current.name)}::jsonb THEN ${JSON.stringify(name)}::jsonb ELSE elem END)
                    FROM jsonb_array_elements(languages) AS elem
                )
                WHERE languages @> ${JSON.stringify([current.name])}::jsonb
            `);
        }
        return updated;
    });
}

export async function removeLanguage(id: string) {
    const [lang] = await db
        .select({ name: languages.name })
        .from(languages)
        .where(eq(languages.id, id));
    if (!lang) {
        throw new AppError(404, "language.notFound");
    }
    await db.transaction(async (tx) => {
        await tx.delete(languages).where(eq(languages.id, id));
        // Drop the name from the profiles that used it, keeping the data tidy.
        await tx.execute(sql`
            UPDATE users
            SET languages = COALESCE((
                SELECT jsonb_agg(elem)
                FROM jsonb_array_elements(languages) AS elem
                WHERE elem <> ${JSON.stringify(lang.name)}::jsonb
            ), '[]'::jsonb)
            WHERE languages @> ${JSON.stringify([lang.name])}::jsonb
        `);
    });
}
