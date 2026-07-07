// Marca a trilha e o simulado AI-900 como aposentados (a Microsoft aposentou o
// exame em 30/06/2026 e o substituiu pelo AI-901). Idempotente: só prefixa o
// aviso se ainda não estiver lá. Não apaga o conteúdo nem o progresso de ninguém.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/marcar-ai900-aposentada.ts
import { db } from "../db.ts";
import { trails, simulados } from "../schema.ts";
import { eq } from "drizzle-orm";

const AVISO =
    "Aviso: o exame AI-900 foi aposentado pela Microsoft em 30/06/2026 e substituído pelo AI-901. A versão atual está na trilha e no simulado AZURE AI-901. ";

async function marcar() {
    const [trilha] = await db.select().from(trails).where(eq(trails.name, "AZURE AI-900"));
    if (!trilha) {
        console.log("Trilha AZURE AI-900 não encontrada, nada a marcar.");
    } else if (trilha.description.startsWith("Aviso:")) {
        console.log("Trilha AI-900 já estava marcada como aposentada.");
    } else {
        await db.update(trails).set({ description: AVISO + trilha.description }).where(eq(trails.id, trilha.id));
        console.log("Trilha AI-900 marcada como aposentada.");
    }

    const [sim] = await db.select().from(simulados).where(eq(simulados.slug, "ai-900"));
    if (!sim) {
        console.log("Simulado ai-900 não encontrado, nada a marcar.");
    } else if ((sim.description ?? "").startsWith("Aviso:")) {
        console.log("Simulado AI-900 já estava marcado como aposentado.");
    } else {
        await db
            .update(simulados)
            .set({ description: AVISO + (sim.description ?? "") })
            .where(eq(simulados.id, sim.id));
        console.log("Simulado AI-900 marcado como aposentado.");
    }
}

marcar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha ao marcar AI-900:", e);
        process.exit(1);
    });
