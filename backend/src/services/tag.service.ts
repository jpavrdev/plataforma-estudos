import { db } from "../../db.ts";
import { tags, trailTags } from "../../schema.ts";
import { eq, asc } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

export async function findTags() {
    return db.select().from(tags).orderBy(asc(tags.name));
}

export async function insertTag(name: string) {
    const [existing] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, name));
    if (existing) {
        throw new AppError(409, "tag.nameTaken");
    }
    const [tag] = await db.insert(tags).values({ name }).returning();
    return tag;
}

export async function editTag(id: string, name: string) {
    const [conflict] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, name));
    if (conflict && conflict.id !== id) {
        throw new AppError(409, "tag.nameTaken");
    }
    const [tag] = await db.update(tags).set({ name }).where(eq(tags.id, id)).returning();
    if (!tag) {
        throw new AppError(404, "tag.notFound");
    }
    return tag;
}

export async function removeTag(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(trailTags).where(eq(trailTags.tagId, id));
        await tx.delete(tags).where(eq(tags.id, id));
    });
}
