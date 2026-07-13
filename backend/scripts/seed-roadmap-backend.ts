// Seed do roadmap "Back-end": camada de orquestracao sobre as trilhas de fundacao
// (Logica de Programacao, Protocolos da Web, APIs e Frameworks, Banco de Dados,
// Autenticacao). Cobre os estagios 1 a 5 do desenho de 10 estagios; os estagios
// 6 a 10 (cache, testes, docker, ci/cd, arquitetura) entram depois, conforme o
// conteudo for autorado.
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estagios
// que ainda nao existem (casados por titulo). Assim, para adicionar os estagios
// 6 a 10 depois, basta acrescenta-los em STAGES e rodar de novo.
//
// O Back-end e o roadmap principal do catalogo: na criacao, entra na posicao 1 e
// empurra os roadmaps existentes uma posicao para baixo.
//
// Refs de trilha resolvidas por nome; ref nao encontrada e pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-backend.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "backend";

const ROADMAP = {
    slug: SLUG,
    name: "Back-end",
    description:
        "Do zero a vaga de back-end: logica e uma linguagem, os protocolos da web, APIs, banco de dados e seguranca. Um caminho guiado, da base ao deploy.",
    level: "iniciante" as const,
    icon: "server",
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
        title: "Lógica & uma linguagem",
        description:
            "A base de tudo: pensar em algoritmos e dominar a lógica de programação, o alicerce de qualquer linguagem que você for usar no back-end.",
        tags: ["Lógica", "Algoritmos", "Programação"],
        refs: [{ type: "trail", ref: "Lógica de Programação" }],
    },
    {
        phase: "fundamentos",
        position: 2,
        title: "Protocolos da Web",
        description:
            "Como a web conversa: HTTP e seus métodos, códigos de status, REST e o modelo cliente-servidor que sustenta toda API.",
        tags: ["HTTP", "REST", "Cliente-servidor"],
        refs: [{ type: "trail", ref: "Protocolos da Web" }],
    },
    {
        phase: "core",
        position: 3,
        title: "APIs & Frameworks",
        description:
            "Construa sua primeira API REST com Node.js e Express: rotas, middleware, validação, tratamento de erros e a estrutura de um projeto de verdade.",
        tags: ["Node.js", "Express", "API REST"],
        refs: [{ type: "trail", ref: "APIs e Frameworks" }],
    },
    {
        phase: "core",
        position: 4,
        title: "Banco de dados",
        description:
            "Dê persistência à sua API: modelo relacional, SQL, modelagem com relacionamentos, PostgreSQL na prática e o papel dos ORMs.",
        tags: ["SQL", "PostgreSQL", "Modelagem"],
        refs: [{ type: "trail", ref: "Banco de Dados" }],
    },
    {
        phase: "core",
        position: 5,
        title: "Autenticação & Segurança",
        description:
            "Saiba quem é o usuário e o que ele pode fazer: hash de senha com bcrypt, sessões, tokens JWT, autorização por papéis e OAuth com login social.",
        tags: ["JWT", "bcrypt", "OAuth"],
        refs: [{ type: "trail", ref: "Autenticação" }],
    },
    {
        phase: "avancado",
        position: 6,
        title: "Cache, filas & performance",
        description:
            "Deixe o back-end rápido e escalável: medir performance, cache com Redis e sua invalidação, filas e processamento assíncrono com workers, e como escalar.",
        tags: ["Redis", "Filas", "Performance"],
        refs: [{ type: "trail", ref: "Cache, Filas e Performance" }],
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
    if (!rm) {
        // Back-end e o roadmap principal: empurra os existentes para baixo e entra em 1o.
        await db.update(roadmaps).set({ position: sql`${roadmaps.position} + 1` });
        [rm] = await db
            .insert(roadmaps)
            .values({ ...ROADMAP, position: 1, premium: false, published: true })
            .returning();
        console.log("Roadmap criado: " + rm.slug + " (posicao 1)");
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
