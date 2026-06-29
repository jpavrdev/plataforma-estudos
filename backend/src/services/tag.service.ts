import { db } from "../../db.ts";
import { tags, trailTags } from "../../schema.ts";
import { eq, asc } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

export async function listarTags() {
    return db.select().from(tags).orderBy(asc(tags.name));
}

export async function criarTag(nome: string) {
    const [existe] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, nome));
    if (existe) {
        throw new AppError(409, "Já existe uma tag com esse nome");
    }
    const [tag] = await db.insert(tags).values({ name: nome }).returning();
    return tag;
}

export async function atualizarTag(id: string, nome: string) {
    const [conflito] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, nome));
    if (conflito && conflito.id !== id) {
        throw new AppError(409, "Já existe uma tag com esse nome");
    }
    const [tag] = await db.update(tags).set({ name: nome }).where(eq(tags.id, id)).returning();
    if (!tag) {
        throw new AppError(404, "Tag não encontrada");
    }
    return tag;
}

export async function excluirTag(id: string) {
    await db.transaction(async (tx) => {
        await tx.delete(trailTags).where(eq(trailTags.tagId, id));
        await tx.delete(tags).where(eq(tags.id, id));
    });
}
