// Seed do roadmap "Engenharia de IA" (AI Engineer): a pessoa que constroi aplicacoes
// sobre LLMs (chatbots, RAG, agentes). Reusa as trilhas de base (Logica, Python,
// Protocolos da Web) e cresce com as trilhas novas de IA (Fundamentos de LLMs,
// Aplicacoes com LLMs, RAG na Pratica, Agentes de IA, LLMs em Producao).
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estagios que
// ainda nao existem (casados por titulo). O roadmap cresce trilha a trilha: a cada
// nova trilha autorada, acrescente o estagio em STAGES e rode de novo. So sao
// incluidos aqui estagios cuja trilha ja existe, pra nao criar estagio vazio.
//
// Na criacao, o roadmap entra no fim da lista (nao empurra os existentes).
// Refs de trilha resolvidas por nome; ref nao encontrada e pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-engenharia-ia.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "engenharia-ia";

const ROADMAP = {
    slug: SLUG,
    name: "Engenharia de IA",
    description:
        "Do zero a AI Engineer: a base de programação, como os LLMs funcionam por dentro, construir aplicações com as APIs, RAG com embeddings e banco vetorial, agentes com ferramentas e a produção com avaliação, custo e segurança. O caminho de quem constrói produtos sobre modelos de linguagem.",
    level: "iniciante" as const,
    icon: "brain",
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
        title: "Lógica de programação",
        description:
            "A base de todo código: pensar em algoritmos, variáveis, condicionais, laços e funções. O alicerce antes de qualquer linguagem.",
        tags: ["Lógica", "Algoritmos", "Programação"],
        refs: [{ type: "trail", ref: "Lógica de Programação" }],
    },
    {
        phase: "fundamentos",
        position: 2,
        title: "Python",
        description:
            "A linguagem da engenharia de IA, do zero: sintaxe, tipos, estruturas de dados, funções, arquivos e a base pra falar com APIs de modelos.",
        tags: ["Python", "Programação", "IA"],
        refs: [{ type: "trail", ref: "Python" }],
    },
    {
        phase: "fundamentos",
        position: 3,
        title: "HTTP e APIs",
        description:
            "Como a web conversa: o ciclo de uma requisição, HTTP com métodos e códigos de status, REST e o design de APIs. Todo LLM de produção vive atrás de uma API.",
        tags: ["HTTP", "REST", "APIs"],
        refs: [{ type: "trail", ref: "Protocolos da Web" }],
    },
    {
        phase: "core",
        position: 4,
        title: "Como os LLMs funcionam",
        description:
            "A máquina por dentro: previsão de tokens, atenção e treinamento, tokens e custos, embeddings, janela de contexto, parâmetros de geração, o ecossistema de modelos e os limites (alucinação, viés e segurança).",
        tags: ["LLM", "Tokens", "Embeddings"],
        refs: [{ type: "trail", ref: "Fundamentos de LLMs" }],
    },
    {
        phase: "core",
        position: 5,
        title: "Construindo com LLMs",
        description:
            "A mão na API, em Python: chamadas de chat com erros e retentativas, prompt engineering na prática, system prompts versionados, saídas estruturadas e function calling, streaming com SSE e memória de conversa, fechando com um chatbot completo.",
        tags: ["APIs", "Prompts", "Function calling"],
        refs: [{ type: "trail", ref: "Aplicações com LLMs" }],
    },
    {
        phase: "core",
        position: 6,
        title: "RAG de ponta a ponta",
        description:
            "Respostas fundamentadas nos seus documentos: ingestão e chunking, embeddings com pgvector, retrieval com busca híbrida, reranking e permissões, o prompt aumentado com citações e o não sei honesto, tudo medido com conjunto de avaliação.",
        tags: ["RAG", "pgvector", "Retrieval"],
        refs: [{ type: "trail", ref: "RAG na Prática" }],
    },
    {
        phase: "avancado",
        position: 7,
        title: "Agentes de IA",
        description:
            "Do chat que responde ao agente que executa: o loop pensar-agir-observar, ferramentas com sandbox e guarda-corpos, LangChain e LangGraph com estado durável, engenharia de contexto, o padrão MCP e sistemas multiagente com aprovação humana nas ações críticas.",
        tags: ["Agentes", "LangGraph", "MCP"],
        refs: [{ type: "trail", ref: "Agentes de IA" }],
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
