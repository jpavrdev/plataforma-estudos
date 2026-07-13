// Seed do roadmap "Ciencia de Dados": camada de orquestracao sobre as trilhas do
// caminho de dados (Logica de Programacao, Python, Estatistica, Analise de Dados,
// Banco de Dados, Visualizacao, Machine Learning e afins). Do zero a cientista de
// dados, vendor-neutral, com Python de verdade.
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estagios que
// ainda nao existem (casados por titulo). O roadmap cresce trilha a trilha: a cada
// nova trilha autorada, acrescente o estagio em STAGES e rode de novo. So sao
// incluidos aqui estagios cuja trilha ja existe, pra nao criar estagio vazio.
//
// Na criacao, o roadmap entra no fim da lista (nao empurra os existentes).
// Refs de trilha resolvidas por nome; ref nao encontrada e pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-ciencia-dados.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "ciencia-dados";

const ROADMAP = {
    slug: SLUG,
    name: "Ciência de Dados",
    description:
        "Do zero a cientista de dados: lógica e Python, estatística, análise e visualização de dados, SQL e machine learning. Um caminho guiado, do primeiro print ao modelo em produção.",
    level: "iniciante" as const,
    icon: "line-chart",
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
            "A linguagem da ciência de dados, do zero: sintaxe, tipos, estruturas de dados, funções, arquivos e a ponte pra manipular dados.",
        tags: ["Python", "Programação", "Dados"],
        refs: [{ type: "trail", ref: "Python" }],
    },
    {
        phase: "fundamentos",
        position: 3,
        title: "Estatística e probabilidade",
        description:
            "A base quantitativa: estatística descritiva, distribuições, probabilidade, amostragem e o Teorema Central do Limite, inferência (intervalos de confiança e teste de hipótese) e correlação (que não é causalidade).",
        tags: ["Estatística", "Probabilidade", "Inferência"],
        refs: [{ type: "trail", ref: "Estatística e Probabilidade" }],
    },
    {
        phase: "core",
        position: 4,
        title: "Análise de dados com pandas",
        description:
            "O carro-chefe prático: NumPy e pandas pra carregar, selecionar, filtrar, agrupar e juntar dados, e a limpeza que consome a maior parte do tempo. De uma planilha bruta a dados prontos pra modelar.",
        tags: ["pandas", "NumPy", "Dados"],
        refs: [{ type: "trail", ref: "Análise de Dados" }],
    },
    {
        phase: "core",
        position: 5,
        title: "SQL e bancos de dados",
        description:
            "De onde os dados vêm: SQL do zero, modelo relacional, consultas com joins e agregações, e PostgreSQL na prática. Um cientista de dados vive de SQL.",
        tags: ["SQL", "PostgreSQL", "Consultas"],
        refs: [{ type: "trail", ref: "Banco de Dados" }],
    },
    {
        phase: "core",
        position: 6,
        title: "Visualização e análise exploratória",
        description:
            "Veja e comunique os dados: quando usar cada gráfico, matplotlib e seaborn, análise exploratória visual, boas práticas (e os gráficos que enganam) e storytelling com dados.",
        tags: ["matplotlib", "seaborn", "EDA"],
        refs: [{ type: "trail", ref: "Visualização de Dados" }],
    },
    {
        phase: "avancado",
        position: 7,
        title: "Machine learning",
        description:
            "O coração da ciência de dados: o fluxo de um projeto de ML, regressão e classificação com scikit-learn, como avaliar modelos e fugir do overfitting, preparar dados e o aprendizado não-supervisionado.",
        tags: ["scikit-learn", "Regressão", "Classificação"],
        refs: [{ type: "trail", ref: "Machine Learning" }],
    },
    {
        phase: "avancado",
        position: 8,
        title: "Machine learning na prática",
        description:
            "ML além do básico: feature engineering, ajuste de hiperparâmetros, ensembles (random forest e boosting), pipelines robustos, lidar com desbalanceamento e overfitting, e uma introdução a deep learning.",
        tags: ["Ensembles", "Boosting", "Tuning"],
        refs: [{ type: "trail", ref: "Machine Learning na Prática" }],
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
