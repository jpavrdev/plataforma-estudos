import { sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { calcularStreak, semanaAtividade } from "../domain/streak.ts";

// Streak = dias corridos com atividade (questão respondida, aula concluída ou
// desafio resolvido). O "dia" é bucketizado no fuso de São Paulo para bater com o usuário.
const TZ = "America/Sao_Paulo";

export function hojeSaoPaulo(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export async function diasAtivosDoUsuario(userId: string): Promise<Set<string>> {
    const res = await db.execute(sql`
        SELECT DISTINCT to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers WHERE user_id = ${userId}
        UNION
        SELECT DISTINCT to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress WHERE user_id = ${userId}
        UNION
        SELECT DISTINCT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM challenge_submissions WHERE user_id = ${userId} AND status = 'passed'
    `);
    return new Set((res.rows as { d: string }[]).map((r) => r.d));
}

// Streak de todos os usuários de uma vez (para o ranking), medidos no mesmo hoje.
export async function streaksTodos(): Promise<Map<string, number>> {
    const res = await db.execute(sql`
        SELECT user_id AS uid, to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers
        UNION
        SELECT user_id AS uid, to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress
        UNION
        SELECT user_id AS uid, to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM challenge_submissions WHERE status = 'passed'
    `);
    const porUsuario = new Map<string, Set<string>>();
    for (const row of res.rows as { uid: string; d: string }[]) {
        let dias = porUsuario.get(row.uid);
        if (!dias) {
            dias = new Set();
            porUsuario.set(row.uid, dias);
        }
        dias.add(row.d);
    }
    const hoje = hojeSaoPaulo();
    const streaks = new Map<string, number>();
    for (const [uid, dias] of porUsuario) streaks.set(uid, calcularStreak(dias, hoje));
    return streaks;
}

// Orquestram fetch + relógio + cálculo puro para os endpoints.
export async function streakDoUsuario(userId: string): Promise<number> {
    return calcularStreak(await diasAtivosDoUsuario(userId), hojeSaoPaulo());
}

export async function resumoSemana(userId: string) {
    const dias = await diasAtivosDoUsuario(userId);
    const hoje = hojeSaoPaulo();
    return { streak: calcularStreak(dias, hoje), week: semanaAtividade(dias, hoje) };
}
