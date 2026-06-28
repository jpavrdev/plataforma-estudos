import { sql } from "drizzle-orm";
import { db } from "../../db.ts";

// Streak = dias corridos com atividade (questão respondida ou aula concluída).
// O "dia" é calculado no fuso de São Paulo para bater com o usuário.
const TZ = "America/Sao_Paulo";
const LETRAS = ["D", "S", "T", "Q", "Q", "S", "S"]; // domingo..sábado

function diaAnterior(s: string): string {
    return new Date(Date.parse(s + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
}
function hojeLocal(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

// Conta os dias consecutivos terminando hoje (ou ontem, se ainda não estudou hoje).
export function calcularStreak(dias: Set<string>): number {
    if (dias.size === 0) return 0;
    let cursor = hojeLocal();
    if (!dias.has(cursor)) {
        cursor = diaAnterior(cursor);
        if (!dias.has(cursor)) return 0;
    }
    let n = 0;
    while (dias.has(cursor)) {
        n++;
        cursor = diaAnterior(cursor);
    }
    return n;
}

export async function diasAtivosDoUsuario(userId: string): Promise<Set<string>> {
    const res = await db.execute(sql`
        SELECT DISTINCT to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers WHERE user_id = ${userId}
        UNION
        SELECT DISTINCT to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress WHERE user_id = ${userId}
    `);
    return new Set((res.rows as { d: string }[]).map((r) => r.d));
}

// Calcula o streak de todos os usuários de uma vez (para o ranking).
export async function streaksTodos(): Promise<Map<string, number>> {
    const res = await db.execute(sql`
        SELECT user_id AS uid, to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM question_answers
        UNION
        SELECT user_id AS uid, to_char(completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d FROM lessons_progress
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
    const streaks = new Map<string, number>();
    for (const [uid, dias] of porUsuario) streaks.set(uid, calcularStreak(dias));
    return streaks;
}

// Últimos 7 dias (mais antigo -> hoje) com flag de atividade, para o card da home.
export function semanaAtividade(dias: Set<string>): { label: string; active: boolean }[] {
    const ult7: string[] = [];
    let cursor = hojeLocal();
    for (let i = 0; i < 7; i++) {
        ult7.unshift(cursor);
        cursor = diaAnterior(cursor);
    }
    return ult7.map((d) => ({
        label: LETRAS[new Date(d + "T00:00:00Z").getUTCDay()],
        active: dias.has(d),
    }));
}
