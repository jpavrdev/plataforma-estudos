import { db } from "../../db.ts";
import { glossary } from "../../schema.ts";
import { eq, asc } from "drizzle-orm";
import type { z } from "zod";
import type { glossaryTermSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";

type TermData = z.infer<typeof glossaryTermSchema>;

export async function findGlossary() {
    return db.select().from(glossary).orderBy(asc(glossary.term));
}

export async function insertTerm(data: TermData) {
    const [existing] = await db
        .select({ id: glossary.id })
        .from(glossary)
        .where(eq(glossary.term, data.term));
    if (existing) throw new AppError(409, "glossary.termTaken");
    const [t] = await db.insert(glossary).values(data).returning();
    return t;
}

export async function editTerm(id: string, data: TermData) {
    const [conflict] = await db
        .select({ id: glossary.id })
        .from(glossary)
        .where(eq(glossary.term, data.term));
    if (conflict && conflict.id !== id) throw new AppError(409, "glossary.termTaken");
    const [t] = await db.update(glossary).set(data).where(eq(glossary.id, id)).returning();
    if (!t) throw new AppError(404, "glossary.termNotFound");
    return t;
}

export async function removeTerm(id: string) {
    await db.delete(glossary).where(eq(glossary.id, id));
}
