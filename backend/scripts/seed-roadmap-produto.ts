// Seed do roadmap "Produto" (do zero a Product Manager): a carreira de produto
// com PO e Product Analyst como marcos do mesmo caminho, e nao roadmaps separados.
// Todas as trilhas sao novas (Fundamentos de Produto, Agil e Delivery na Pratica,
// Dados para Produto, Discovery e Pesquisa, Estrategia e Priorizacao, Produto na
// Pratica).
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estagios que
// ainda nao existem (casados por titulo). O roadmap cresce trilha a trilha: a cada
// trilha nova autorada, acrescente o estagio em STAGES e rode de novo.
//
// Na criacao, o roadmap entra no fim da lista (nao empurra os existentes).
// Refs de trilha resolvidas por nome; ref nao encontrada e pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-produto.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "produto";

const ROADMAP = {
    slug: SLUG,
    name: "Produto",
    description:
        "Do zero ao Product Manager: os fundamentos de produto, o delivery com ágil de verdade, os dados e experimentos que guiam decisão, o discovery que evita construir a coisa errada, a estratégia com priorização honesta e a prática de lançar, crescer e se posicionar na carreira. Product Owner e Product Analyst são paradas do mesmo caminho.",
    level: "iniciante" as const,
    icon: "target",
};

type RefType = "trail" | "simulado";
interface Ref {
    type: RefType;
    ref: string; // nome da trilha ou slug do simulado
}
interface Stage {
    phase: "fundamentos" | "core" | "avancado" | "deploy";
    position: number;
    title: string;
    description: string;
    tags: string[];
    refs: Ref[];
}

const STAGES: Stage[] = [
    {
        phase: "fundamentos",
        position: 1,
        title: "Fundamentos de produto",
        description:
            "O que é produto de verdade: outcome sobre output, os papéis de PO, PM e Analyst sem mito, o time de produto, o usuário no centro e a base de negócio que todo PM precisa.",
        tags: ["Produto", "Papéis", "Outcome"],
        refs: [{ type: "trail", ref: "Fundamentos de Produto" }],
    },
];

async function resolverRef(type: RefType, ref: string): Promise<string | null> {
    if (type === "trail") {
        const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, ref));
        return t?.id ?? null;
    }
    const [s] = await db
        .select({ id: simulados.id })
        .from(simulados)
        .where(eq(simulados.slug, ref));
    return s?.id ?? null;
}

async function seed() {
    let [rm] = await db.select().from(roadmaps).where(eq(roadmaps.slug, SLUG));
    if (!rm) {
        const [{ maxPos }] = await db
            .select({ maxPos: sql<number>`coalesce(max(${roadmaps.position}), 0)` })
            .from(roadmaps);
        const nextPos = Number(maxPos) + 1;
        [rm] = await db
            .insert(roadmaps)
            .values({ ...ROADMAP, position: nextPos, premium: false, published: true })
            .returning();
        console.log("Roadmap criado: " + rm.slug + " (posicao " + nextPos + ")");
    } else {
        console.log("Roadmap " + SLUG + " ja existe. Adicionando estagios que faltam.");
    }

    let estagiosNovos = 0;
    let estagiosExistentes = 0;
    let refsCriados = 0;
    let refsFaltando = 0;
    for (const s of STAGES) {
        const [existente] = await db
            .select({ id: roadmapStages.id })
            .from(roadmapStages)
            .where(and(eq(roadmapStages.roadmapId, rm.id), eq(roadmapStages.title, s.title)));
        if (existente) {
            estagiosExistentes++;
            continue;
        }
        const [stage] = await db
            .insert(roadmapStages)
            .values({
                roadmapId: rm.id,
                phase: s.phase,
                title: s.title,
                description: s.description,
                tags: s.tags,
                position: s.position,
            })
            .returning();
        estagiosNovos++;
        let rpos = 1;
        for (const r of s.refs) {
            const refId = await resolverRef(r.type, r.ref);
            if (!refId) {
                console.log("  ref nao encontrada, pulando: " + r.type + " -> " + r.ref);
                refsFaltando++;
                continue;
            }
            await db
                .insert(roadmapStageRefs)
                .values({ stageId: stage.id, refType: r.type, refId, position: rpos++ });
            refsCriados++;
        }
    }
    console.log(
        "Seed concluido: " +
            estagiosNovos +
            " estagios novos, " +
            estagiosExistentes +
            " ja existiam, " +
            refsCriados +
            " refs criados (" +
            refsFaltando +
            " faltando).",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
