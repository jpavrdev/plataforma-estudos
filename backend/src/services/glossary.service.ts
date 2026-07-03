import { db } from "../../db.ts";
import { glossary } from "../../schema.ts";
import { eq, asc } from "drizzle-orm";
import type { z } from "zod";
import type { glossaryTermSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";

type DadosTermo = z.infer<typeof glossaryTermSchema>;

export async function listarGlossario() {
    return db.select().from(glossary).orderBy(asc(glossary.term));
}

export async function criarTermo(dados: DadosTermo) {
    const [existe] = await db
        .select({ id: glossary.id })
        .from(glossary)
        .where(eq(glossary.term, dados.term));
    if (existe) throw new AppError(409, "Já existe um termo com esse nome");
    const [t] = await db.insert(glossary).values(dados).returning();
    return t;
}

export async function atualizarTermo(id: string, dados: DadosTermo) {
    const [conflito] = await db
        .select({ id: glossary.id })
        .from(glossary)
        .where(eq(glossary.term, dados.term));
    if (conflito && conflito.id !== id) throw new AppError(409, "Já existe um termo com esse nome");
    const [t] = await db.update(glossary).set(dados).where(eq(glossary.id, id)).returning();
    if (!t) throw new AppError(404, "Termo não encontrado");
    return t;
}

export async function excluirTermo(id: string) {
    await db.delete(glossary).where(eq(glossary.id, id));
}
