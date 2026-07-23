import { eq, sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { trails, users } from "../../schema.ts";
import { diasAtivosDoUsuario, hojeSaoPaulo } from "./streak.ts";
import { calcularStreak, diaAnterior, semanaAtividade } from "../domain/streak.ts";
import { calcularEstatisticas } from "./stats.service.ts";

const TZ = "America/Sao_Paulo";
const DIAS_GRAFICO = 14;
const SEMANAS_HEATMAP = 52;

type DiaAtividade = { xp: number; exercicios: number; minutos: number; aulas: number };

// XP, exercícios corretos e minutos estimados (duração das aulas concluídas),
// agregados por dia no fuso de SP, unindo as três fontes de atividade.
async function atividadePorDia(userId: string) {
    const res = await db.execute(sql`
        SELECT d,
               SUM(xp)::int AS xp,
               SUM(exercicios)::int AS exercicios,
               SUM(minutos)::int AS minutos,
               SUM(aulas)::int AS aulas
        FROM (
            SELECT to_char(answered_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   CASE WHEN is_correct THEN 10 ELSE 0 END AS xp,
                   CASE WHEN is_correct THEN 1 ELSE 0 END AS exercicios,
                   0 AS minutos, 0 AS aulas
            FROM question_answers WHERE user_id = ${userId}
            UNION ALL
            SELECT to_char(lp.completed_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   50 AS xp, 0 AS exercicios, COALESCE(l.duration_min, 12) AS minutos, 1 AS aulas
            FROM lessons_progress lp
            JOIN lessons l ON l.id = lp.lesson_id
            WHERE lp.user_id = ${userId} AND lp.manual = false
            UNION ALL
            SELECT to_char(created_at AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS d,
                   xp_earned AS xp, 0 AS exercicios, 0 AS minutos, 0 AS aulas
            FROM challenge_submissions WHERE user_id = ${userId} AND xp_earned > 0
        ) t
        GROUP BY d
    `);
    return new Map<string, DiaAtividade>(
        (
            res.rows as { d: string; xp: number; exercicios: number; minutos: number; aulas: number }[]
        ).map((r) => [
            r.d,
            {
                xp: Number(r.xp),
                exercicios: Number(r.exercicios),
                minutos: Number(r.minutos),
                aulas: Number(r.aulas),
            },
        ]),
    );
}

// Domínio = questões distintas acertadas sobre o total de questões da trilha
// (aulas publicadas; em trilha multi-linguagem, neutras + o melhor track).
async function dominioPorTrilha(userId: string) {
    const questoes = await db.execute(sql`
        SELECT l.trail_id AS tid, l.language AS lang, q.id AS qid
        FROM questions q
        JOIN lessons l ON l.id = q.lesson_id
        WHERE l.published = true
    `);
    const acertos = await db.execute(sql`
        SELECT DISTINCT question_id AS qid FROM question_answers
        WHERE user_id = ${userId} AND is_correct = true
    `);
    const certas = new Set((acertos.rows as { qid: string }[]).map((r) => r.qid));

    type Grupo = { neutras: string[]; porLang: Map<string, string[]> };
    const porTrilha = new Map<string, Grupo>();
    for (const r of questoes.rows as { tid: string; lang: string | null; qid: string }[]) {
        const grupo = porTrilha.get(r.tid) ?? {
            neutras: [] as string[],
            porLang: new Map<string, string[]>(),
        };
        if (r.lang === null) {
            grupo.neutras.push(r.qid);
        } else {
            const arr = grupo.porLang.get(r.lang) ?? [];
            arr.push(r.qid);
            grupo.porLang.set(r.lang, arr);
        }
        porTrilha.set(r.tid, grupo);
    }

    const todas = await db
        .select({ id: trails.id, name: trails.name, trailLevel: trails.trailLevel })
        .from(trails);
    const contar = (ids: string[]) => ids.filter((id) => certas.has(id)).length;

    const saida = [];
    for (const t of todas) {
        const grupo = porTrilha.get(t.id);
        if (!grupo) continue;
        let total = grupo.neutras.length;
        let feitas = contar(grupo.neutras);
        if (grupo.porLang.size > 0) {
            let melhor = { total: 0, feitas: 0, pct: -1 };
            for (const ids of grupo.porLang.values()) {
                const tt = grupo.neutras.length + ids.length;
                const ff = contar(grupo.neutras) + contar(ids);
                const pct = tt > 0 ? ff / tt : 0;
                if (pct > melhor.pct || (pct === melhor.pct && ff > melhor.feitas)) {
                    melhor = { total: tt, feitas: ff, pct };
                }
            }
            total = melhor.total;
            feitas = melhor.feitas;
        }
        if (feitas === 0 || total === 0) continue;
        saida.push({
            trailId: t.id,
            name: t.name,
            trailLevel: t.trailLevel,
            acertos: feitas,
            total,
            pct: Math.round((feitas / total) * 100),
        });
    }
    return saida.sort((a, b) => b.pct - a.pct);
}

// Maior sequência de dias consecutivos com atividade, em qualquer época.
function recordeStreak(dias: Set<string>): number {
    let recorde = 0;
    for (const d of dias) {
        if (dias.has(diaAnterior(d))) continue;
        let n = 0;
        let cursor = d;
        while (dias.has(cursor)) {
            n++;
            cursor = new Date(Date.parse(cursor + "T00:00:00Z") + 86400000)
                .toISOString()
                .slice(0, 10);
        }
        recorde = Math.max(recorde, n);
    }
    return recorde;
}

export type MetaSemanal =
    | { tipo: "padrao"; valor: number; alvo: number }
    | { tipo: "aulas"; valor: number; alvo: number; alvoDiario: number }
    | { tipo: "dias"; valor: number; alvo: number };

export async function definirMetaSemanal(userId: string, kind: "aulas" | "dias", target: number) {
    await db
        .update(users)
        .set({ weeklyGoalKind: kind, weeklyGoalTarget: target })
        .where(eq(users.id, userId));
}

export async function limparMetaSemanal(userId: string) {
    await db
        .update(users)
        .set({ weeklyGoalKind: null, weeklyGoalTarget: null })
        .where(eq(users.id, userId));
}

export async function progressoDoUsuario(userId: string, periodoDias: 7 | 30 | null) {
    const [porDia, diasAtivos, stats, [meta], dominio] = await Promise.all([
        atividadePorDia(userId),
        diasAtivosDoUsuario(userId),
        calcularEstatisticas(userId),
        db
            .select({ kind: users.weeklyGoalKind, target: users.weeklyGoalTarget })
            .from(users)
            .where(eq(users.id, userId)),
        dominioPorTrilha(userId),
    ]);
    const hoje = hojeSaoPaulo();

    const dataAtras = (offset: number) =>
        new Date(Date.parse(hoje + "T00:00:00Z") - offset * 86400000).toISOString().slice(0, 10);

    const somaJanela = (inicio: number, fim: number): DiaAtividade => {
        const total = { xp: 0, exercicios: 0, minutos: 0, aulas: 0 };
        for (let o = inicio; o <= fim; o++) {
            const v = porDia.get(dataAtras(o));
            if (v) {
                total.xp += v.xp;
                total.exercicios += v.exercicios;
                total.minutos += v.minutos;
                total.aulas += v.aulas;
            }
        }
        return total;
    };
    const somaTudo = (): DiaAtividade => {
        const total = { xp: 0, exercicios: 0, minutos: 0, aulas: 0 };
        for (const v of porDia.values()) {
            total.xp += v.xp;
            total.exercicios += v.exercicios;
            total.minutos += v.minutos;
            total.aulas += v.aulas;
        }
        return total;
    };

    const atual = periodoDias ? somaJanela(0, periodoDias - 1) : somaTudo();
    const anterior = periodoDias ? somaJanela(periodoDias, periodoDias * 2 - 1) : null;

    const xpPorDia = Array.from({ length: DIAS_GRAFICO }, (_, i) => {
        const d = dataAtras(DIAS_GRAFICO - 1 - i);
        return { d, xp: porDia.get(d)?.xp ?? 0 };
    });

    // O heatmap mede aulas concluídas por dia; dias só com exercícios ficam vazios.
    const heatmap: { d: string; n: number }[] = [];
    let aulasAno = 0;
    for (let o = 0; o < SEMANAS_HEATMAP * 7; o++) {
        const d = dataAtras(o);
        const v = porDia.get(d);
        if (!v) continue;
        aulasAno += v.aulas;
        if (v.aulas > 0) heatmap.push({ d, n: v.aulas });
    }

    const semana = semanaAtividade(diasAtivos, hoje);
    const streakAtual = calcularStreak(diasAtivos, hoje);

    let metaSemana: MetaSemanal;
    if (meta?.kind === "aulas" && meta.target) {
        let cumpridos = 0;
        for (let o = 0; o < 7; o++) {
            if ((porDia.get(dataAtras(o))?.aulas ?? 0) >= meta.target) cumpridos++;
        }
        metaSemana = { tipo: "aulas", valor: cumpridos, alvo: 7, alvoDiario: meta.target };
    } else if (meta?.kind === "dias" && meta.target) {
        metaSemana = { tipo: "dias", valor: Math.min(streakAtual, meta.target), alvo: meta.target };
    } else {
        metaSemana = { tipo: "padrao", valor: semana.filter((s) => s.active).length, alvo: 7 };
    }

    return {
        hoje,
        xpTotal: stats.xp,
        level: stats.level,
        streakAtual,
        streakRecorde: recordeStreak(diasAtivos),
        periodo: { dias: periodoDias, atual, anterior },
        xpPorDia,
        metaSemana,
        heatmap,
        aulasAno,
        dominio,
    };
}
