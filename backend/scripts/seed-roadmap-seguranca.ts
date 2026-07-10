// Seed do roadmap "Segurança": camada de orquestração sobre o conteúdo cyber que já
// existe (Fundamentos, SC-900, ISC2 CC, AppSec), terminando no simulado do ISC2 CC.
// Idempotente: se o roadmap já tiver estágios, não faz nada. Refs resolvidas por
// nome (trilha) / slug (simulado); ref não encontrada é pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-seguranca.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, count } from "drizzle-orm";

const SLUG = "seguranca";

const ROADMAP = {
    slug: SLUG,
    name: "Segurança",
    description:
        "Do zero à primeira certificação em segurança. Fundamentos, segurança na nuvem, aplicações web e a prova final, num caminho guiado e vendor-neutral.",
    level: "iniciante" as const,
    icon: "shield",
    position: 1,
};

type RefType = "trail" | "simulado";
interface Ref {
    type: RefType;
    ref: string; // nome da trilha ou slug do simulado
}
interface Stage {
    phase: "fundamentos" | "core" | "avancado" | "deploy";
    title: string;
    description: string;
    tags: string[];
    refs: Ref[];
}

const STAGES: Stage[] = [
    {
        phase: "fundamentos",
        title: "Fundamentos de Cibersegurança",
        description:
            "Comece pelo começo: a tríade CIA, o panorama de ameaças e atores, malware, engenharia social e os princípios de defesa.",
        tags: ["Tríade CIA", "Ameaças", "Engenharia social"],
        refs: [{ type: "trail", ref: "Fundamentos de Cibersegurança" }],
    },
    {
        phase: "fundamentos",
        title: "Identidade e conformidade na nuvem",
        description:
            "Identidade, conformidade e os fundamentos de segurança na nuvem, pelo currículo do Microsoft SC-900.",
        tags: ["Identidade", "Compliance", "Azure"],
        refs: [{ type: "trail", ref: "AZURE SC-900" }],
    },
    {
        phase: "core",
        title: "Certificação vendor-neutral: ISC2 CC",
        description:
            "A certificação de entrada em segurança da informação: os cinco domínios do exame Certified in Cybersecurity da ISC2.",
        tags: ["ISC2", "5 domínios", "Vendor-neutral"],
        refs: [{ type: "trail", ref: "ISC2 Certified in Cybersecurity (CC)" }],
    },
    {
        phase: "core",
        title: "Segurança de aplicações web (OWASP)",
        description:
            "Segurança de aplicações na prática, guiado pelo OWASP Top 10 2025: injeção, controle de acesso quebrado, configuração e mais.",
        tags: ["OWASP", "AppSec", "Injeção"],
        refs: [{ type: "trail", ref: "Segurança de Aplicações Web" }],
    },
    {
        phase: "avancado",
        title: "Prove-se: simulado do ISC2 CC",
        description:
            "Hora de provar: faça o simulado no formato da prova do ISC2 CC e valide se você está pronto para a certificação.",
        tags: ["Simulado", "Certificação"],
        refs: [{ type: "simulado", ref: "isc2-cc" }],
    },
];

async function resolverRef(type: RefType, ref: string): Promise<string | null> {
    if (type === "trail") {
        const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, ref));
        return t?.id ?? null;
    }
    const [s] = await db.select({ id: simulados.id }).from(simulados).where(eq(simulados.slug, ref));
    return s?.id ?? null;
}

async function seed() {
    let [rm] = await db.select().from(roadmaps).where(eq(roadmaps.slug, SLUG));
    if (rm) {
        const [{ n }] = await db
            .select({ n: count() })
            .from(roadmapStages)
            .where(eq(roadmapStages.roadmapId, rm.id));
        if (Number(n) > 0) {
            console.log("Roadmap " + SLUG + " já tem " + n + " estágios. Nada a fazer.");
            return;
        }
    } else {
        [rm] = await db.insert(roadmaps).values({ ...ROADMAP, premium: false, published: true }).returning();
        console.log("Roadmap criado: " + rm.slug);
    }

    let pos = 1;
    let refsCriados = 0;
    let refsFaltando = 0;
    for (const s of STAGES) {
        const [stage] = await db
            .insert(roadmapStages)
            .values({
                roadmapId: rm.id,
                phase: s.phase,
                title: s.title,
                description: s.description,
                tags: s.tags,
                position: pos++,
            })
            .returning();
        let rpos = 1;
        for (const r of s.refs) {
            const refId = await resolverRef(r.type, r.ref);
            if (!refId) {
                console.log("  ref não encontrada, pulando: " + r.type + " -> " + r.ref);
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
        "Seed concluído: " + STAGES.length + " estágios, " + refsCriados + " refs (" + refsFaltando + " faltando).",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
