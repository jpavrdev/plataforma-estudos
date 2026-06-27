import { db } from "../../db.ts";
import { sql } from "drizzle-orm";

/** Limpa as tabelas entre os testes, mantendo o schema. */
export async function limparBanco() {
    // CASCADE remove dependentes por FK; lista trails/lessons explicitamente
    // porque elas nao referenciam users e nao cairiam no cascade.
    await db.execute(
        sql`TRUNCATE TABLE lessons_progress, lessons, trails, tokens, users RESTART IDENTITY CASCADE`,
    );
}
