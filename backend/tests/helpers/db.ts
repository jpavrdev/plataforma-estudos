import { db } from "../../db.ts";
import { sql } from "drizzle-orm";

/** Limpa as tabelas entre os testes, mantendo o schema. */
export async function limparBanco() {
    // TRUNCATE com CASCADE remove tokens (FK) junto; RESTART IDENTITY zera sequências.
    await db.execute(sql`TRUNCATE TABLE tokens, users RESTART IDENTITY CASCADE`);
}
