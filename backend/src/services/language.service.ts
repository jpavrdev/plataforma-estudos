import { db } from "../../db.ts";
import { languages } from "../../schema.ts";
import { eq, asc, sql } from "drizzle-orm";
import { AppError } from "../errors/AppError.ts";

export async function listarLinguagens() {
    return db.select().from(languages).orderBy(asc(languages.name));
}

export async function criarLinguagem(nome: string) {
    const [existe] = await db
        .select({ id: languages.id })
        .from(languages)
        .where(eq(languages.name, nome));
    if (existe) {
        throw new AppError(409, "Já existe uma linguagem com esse nome");
    }
    const [lang] = await db.insert(languages).values({ name: nome }).returning();
    return lang;
}

export async function atualizarLinguagem(id: string, nome: string) {
    const [atual] = await db
        .select({ name: languages.name })
        .from(languages)
        .where(eq(languages.id, id));
    if (!atual) {
        throw new AppError(404, "Linguagem não encontrada");
    }
    const [conflito] = await db
        .select({ id: languages.id })
        .from(languages)
        .where(eq(languages.name, nome));
    if (conflito && conflito.id !== id) {
        throw new AppError(409, "Já existe uma linguagem com esse nome");
    }
    return db.transaction(async (tx) => {
        const [atualizada] = await tx
            .update(languages)
            .set({ name: nome })
            .where(eq(languages.id, id))
            .returning();
        // Renomeou: propaga o novo nome para os perfis que usavam o antigo.
        if (atual.name !== nome) {
            await tx.execute(sql`
                UPDATE users
                SET languages = (
                    SELECT jsonb_agg(CASE WHEN elem = ${JSON.stringify(atual.name)}::jsonb THEN ${JSON.stringify(nome)}::jsonb ELSE elem END)
                    FROM jsonb_array_elements(languages) AS elem
                )
                WHERE languages @> ${JSON.stringify([atual.name])}::jsonb
            `);
        }
        return atualizada;
    });
}

export async function excluirLinguagem(id: string) {
    const [lang] = await db
        .select({ name: languages.name })
        .from(languages)
        .where(eq(languages.id, id));
    if (!lang) {
        throw new AppError(404, "Linguagem não encontrada");
    }
    await db.transaction(async (tx) => {
        await tx.delete(languages).where(eq(languages.id, id));
        // Remove o nome dos perfis que a usavam, mantendo os dados padronizados.
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
