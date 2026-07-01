import { db } from "../../db.ts";
import { sql } from "drizzle-orm";

/** Limpa as tabelas entre os testes, mantendo o schema. */
export async function limparBanco() {
    // CASCADE remove dependentes por FK; lista trails/lessons explicitamente
    // porque elas nao referenciam users e nao cairiam no cascade.
    await db.execute(
        sql`TRUNCATE TABLE simulado_attempt_answers, simulado_attempt_questions, simulado_attempts, simulado_options, simulado_questions, simulados, question_answers, question_options, questions, lessons_progress, lessons, modules, trails, tokens, users RESTART IDENTITY CASCADE`,
    );
}
