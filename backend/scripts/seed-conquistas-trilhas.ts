// Seed das conquistas de conclusão de trilha: uma por trilha existente, com
// criteriaType "trail_completed" e ref_id apontando a trilha. Idempotente por nome
// (atualiza o ref_id se já existir), então pode rodar de novo quando trilhas novas
// entrarem. O texto casa com a régua da conclusão (todas as aulas do melhor track).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-conquistas-trilhas.ts
import { db } from "../db.ts";
import { achievements, trails } from "../schema.ts";
import { eq } from "drizzle-orm";

async function seed() {
    const lista = await db.select({ id: trails.id, name: trails.name }).from(trails);
    let criadas = 0;
    let atualizadas = 0;
    for (const t of lista) {
        const name = `Trilha ${t.name} concluída`;
        const description = `Conclua todas as aulas da trilha ${t.name}.`;
        const [existe] = await db
            .select({ id: achievements.id, refId: achievements.refId })
            .from(achievements)
            .where(eq(achievements.name, name));
        if (!existe) {
            await db.insert(achievements).values({
                name,
                description,
                icon: "trophy",
                criteriaType: "trail_completed",
                threshold: 1,
                refId: t.id,
            });
            criadas++;
        } else if (existe.refId !== t.id) {
            await db
                .update(achievements)
                .set({ refId: t.id })
                .where(eq(achievements.id, existe.id));
            atualizadas++;
        }
    }
    console.log(
        `Conquistas de trilha: ${criadas} criadas, ${atualizadas} com ref_id corrigido, de ${lista.length} trilhas.`,
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
