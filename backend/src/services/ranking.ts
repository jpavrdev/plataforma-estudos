import { sql, eq, and, count, gte } from "drizzle-orm";
import { db } from "../../db.ts";
import { rankingSnapshots, users, lessonProgress, questionAnswers } from "../../schema.ts";
import { streaksTodos, hojeSaoPaulo } from "./streak.ts";
import { calcularXp, nivelPorXp } from "../domain/xp.ts";

// Grava o snapshot do dia (1x por dia, na primeira visualização) e devolve, por
// usuário, quantas posições subiu (positivo) ou caiu (negativo) desde o último
// snapshot anterior a hoje.
export async function movimentacaoRanking(
    hoje: string,
    posicoesHoje: { id: string; position: number }[],
): Promise<Map<string, number>> {
    // Snapshot mais recente anterior a hoje (a base de comparação).
    const prior = await db.execute(
        sql`SELECT to_char(max(snapshot_date), 'YYYY-MM-DD') AS d FROM ranking_snapshots WHERE snapshot_date < ${hoje}::date`,
    );
    const ultimaData = (prior.rows as { d: string | null }[])[0]?.d ?? null;

    const anterior = new Map<string, number>();
    if (ultimaData) {
        const linhas = await db
            .select({ userId: rankingSnapshots.userId, position: rankingSnapshots.position })
            .from(rankingSnapshots)
            .where(eq(rankingSnapshots.snapshotDate, ultimaData));
        for (const l of linhas) anterior.set(l.userId, l.position);
    }

    // Grava o snapshot de hoje só uma vez (primeira visita do dia).
    const [existe] = await db
        .select({ id: rankingSnapshots.id })
        .from(rankingSnapshots)
        .where(eq(rankingSnapshots.snapshotDate, hoje))
        .limit(1);
    if (!existe && posicoesHoje.length > 0) {
        await db
            .insert(rankingSnapshots)
            .values(
                posicoesHoje.map((p) => ({
                    userId: p.id,
                    position: p.position,
                    snapshotDate: hoje,
                })),
            )
            .onConflictDoNothing();
    }

    const deltas = new Map<string, number>();
    for (const p of posicoesHoje) {
        const antes = anterior.get(p.id);
        deltas.set(p.id, antes === undefined ? 0 : antes - p.position);
    }
    return deltas;
}

// Ranking global por XP. Liga e nível usam o XP total; o leaderboard usa o
// período (week/month/all).
export async function rankingGlobal(periodo: string, currentUserId: string | undefined) {
    const dia = 24 * 60 * 60 * 1000;
    const desde =
        periodo === "week"
            ? new Date(Date.now() - 7 * dia)
            : periodo === "month"
              ? new Date(Date.now() - 30 * dia)
              : null;

    const [usuarios, aulasTot, acertosTot, aulasPer, acertosPer, streaks] = await Promise.all([
        db.select({ id: users.id, name: users.name, username: users.username }).from(users),
        db
            .select({ userId: lessonProgress.userId, n: count() })
            .from(lessonProgress)
            .groupBy(lessonProgress.userId),
        db
            .select({ userId: questionAnswers.userId, n: count() })
            .from(questionAnswers)
            .where(eq(questionAnswers.isCorrect, true))
            .groupBy(questionAnswers.userId),
        desde
            ? db
                  .select({ userId: lessonProgress.userId, n: count() })
                  .from(lessonProgress)
                  .where(gte(lessonProgress.completedAt, desde))
                  .groupBy(lessonProgress.userId)
            : Promise.resolve(null),
        desde
            ? db
                  .select({ userId: questionAnswers.userId, n: count() })
                  .from(questionAnswers)
                  .where(
                      and(
                          eq(questionAnswers.isCorrect, true),
                          gte(questionAnswers.answeredAt, desde),
                      ),
                  )
                  .groupBy(questionAnswers.userId)
            : Promise.resolve(null),
        streaksTodos(),
    ]);

    const paraMapa = (arr: { userId: string; n: number }[] | null) =>
        new Map((arr ?? []).map((a) => [a.userId, Number(a.n)]));
    const at = paraMapa(aulasTot),
        acT = paraMapa(acertosTot);
    const aP = desde ? paraMapa(aulasPer) : at;
    const acP = desde ? paraMapa(acertosPer) : acT;

    const base = usuarios.map((u) => {
        const totalXp = calcularXp({ aulas: at.get(u.id) ?? 0, questoes: acT.get(u.id) ?? 0 });
        const periodXp = calcularXp({ aulas: aP.get(u.id) ?? 0, questoes: acP.get(u.id) ?? 0 });
        return {
            id: u.id,
            name: u.name,
            username: u.username,
            totalXp,
            periodXp,
            level: nivelPorXp(totalXp),
            streak: streaks.get(u.id) ?? 0,
            you: u.id === currentUserId,
        };
    });
    const ordenados = [...base]
        .sort((a, b) => b.periodXp - a.periodXp)
        .map((u, i) => ({ ...u, position: i + 1 }));
    // Movimentação é calculada sobre o ranking geral (XP total).
    const ordemGeral = [...base]
        .sort((a, b) => b.totalXp - a.totalXp)
        .map((u, i) => ({ id: u.id, position: i + 1 }));
    const deltas = await movimentacaoRanking(hojeSaoPaulo(), ordemGeral);

    const meu = ordenados.find((u) => u.you);
    const me = meu
        ? {
              position: meu.position,
              username: meu.username,
              xp: meu.periodXp,
              totalXp: meu.totalXp,
              level: meu.level,
              streak: meu.streak,
              delta: deltas.get(meu.id) ?? 0,
          }
        : null;
    const rows = ordenados.slice(0, 20).map((u) => ({
        position: u.position,
        name: u.name,
        username: u.username,
        xp: u.periodXp,
        level: u.level,
        streak: u.streak,
        delta: deltas.get(u.id) ?? 0,
        you: u.you,
    }));
    return { me, rows };
}
