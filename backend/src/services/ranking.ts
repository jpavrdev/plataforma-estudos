import { sql, eq } from "drizzle-orm";
import { db } from "../../db.ts";
import { rankingSnapshots } from "../../schema.ts";

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
