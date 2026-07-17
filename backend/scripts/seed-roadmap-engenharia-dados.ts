// Seed do roadmap "Engenharia de Dados": camada de orquestracao sobre as trilhas do
// caminho de dados (Logica, Python, Banco de Dados, Analise de Dados, Modelagem e
// Data Warehousing e afins). Do zero a engenheiro de dados, vendor-neutral.
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estagios que
// ainda nao existem (casados por titulo). O roadmap cresce trilha a trilha: a cada
// nova trilha autorada, acrescente o estagio em STAGES e rode de novo. So sao
// incluidos aqui estagios cuja trilha ja existe, pra nao criar estagio vazio.
//
// Na criacao, o roadmap entra no fim da lista (nao empurra os existentes).
// Refs de trilha resolvidas por nome; ref nao encontrada e pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-engenharia-dados.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "engenharia-dados";

const ROADMAP = {
    slug: SLUG,
    name: "Engenharia de Dados",
    description:
        "Do zero a engenheiro de dados: lógica e Python, SQL, modelagem e data warehouse, pipelines de dados (ETL/ELT e orquestração), processamento em escala e streaming, o modern data stack e a operação de uma plataforma de dados confiável.",
    level: "iniciante" as const,
    icon: "database",
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
            "A base de todo código: pensar em algoritmos, variáveis, condicionais, laços e funções. O alicerce antes de qualquer ferramenta de dados.",
        tags: ["Lógica", "Algoritmos", "Programação"],
        refs: [{ type: "trail", ref: "Lógica de Programação" }],
    },
    {
        phase: "fundamentos",
        position: 2,
        title: "Python",
        description:
            "A linguagem que cola o ecossistema de dados: sintaxe, tipos, estruturas de dados, funções, arquivos e a base para escrever scripts de pipeline.",
        tags: ["Python", "Programação", "Dados"],
        refs: [{ type: "trail", ref: "Python" }],
    },
    {
        phase: "fundamentos",
        position: 3,
        title: "SQL e bancos de dados",
        description:
            "De onde os dados vêm e para onde vão: SQL do zero, modelo relacional, consultas com joins e agregações, e PostgreSQL na prática. Um engenheiro de dados vive de SQL.",
        tags: ["SQL", "PostgreSQL", "Consultas"],
        refs: [{ type: "trail", ref: "Banco de Dados" }],
    },
    {
        phase: "core",
        position: 4,
        title: "Análise de dados com Python",
        description:
            "Trabalhar com dados em Python: NumPy e pandas para carregar, limpar, filtrar, agrupar e juntar dados. A base para transformar dados dentro dos pipelines.",
        tags: ["pandas", "NumPy", "Dados"],
        refs: [{ type: "trail", ref: "Análise de Dados" }],
    },
    {
        phase: "core",
        position: 5,
        title: "Modelagem de dados e data warehousing",
        description:
            "Estruturar dados para durar e para analisar: modelo relacional e normalização, OLTP x OLAP, o data warehouse, a modelagem dimensional de Kimball (fatos, dimensões, esquema estrela e slowly changing dimensions) e os warehouses colunares na nuvem.",
        tags: ["Modelagem", "Data Warehouse", "Dimensional"],
        refs: [{ type: "trail", ref: "Modelagem de Dados e Data Warehousing" }],
    },
    {
        phase: "core",
        position: 6,
        title: "ETL e ELT: ingestão de dados",
        description:
            "Construir pipelines que trazem dados de bancos, APIs e arquivos até o destino analítico: ETL x ELT, extração incremental e change data capture, formatos (CSV, JSON, Parquet, Avro), transformação e limpeza, estratégias de carga e idempotência, e a confiabilidade da ingestão.",
        tags: ["ETL", "ELT", "Ingestão"],
        refs: [{ type: "trail", ref: "ETL e Ingestão de Dados" }],
    },
    {
        phase: "core",
        position: 7,
        title: "Orquestração de pipelines",
        description:
            "Agendar, encadear e monitorar pipelines de forma confiável: do problema (o cron não escala) aos DAGs, a arquitetura do Apache Airflow, agendamento e data intervals, dependências e trigger rules, retries e idempotência de tasks, sensores e dependências entre DAGs, e a operação em produção.",
        tags: ["Airflow", "DAG", "Orquestração"],
        refs: [{ type: "trail", ref: "Orquestração de Pipelines" }],
    },
    {
        phase: "avancado",
        position: 8,
        title: "Processamento distribuído com Spark",
        description:
            "Processar dados em escala com o Apache Spark: por que distribuir, a arquitetura do Spark (driver, executors, partições, avaliação lazy), RDDs e DataFrames, a API de DataFrame e Spark SQL com PySpark, o shuffle e o particionamento, otimização e tuning (cache, Catalyst, AQE, Spark UI) e o Spark na prática de engenharia de dados.",
        tags: ["Spark", "PySpark", "Distribuído"],
        refs: [{ type: "trail", ref: "Processamento com Spark" }],
    },
    {
        phase: "avancado",
        position: 9,
        title: "Data lake e lakehouse",
        description:
            "Guardar e organizar dados em escala sobre object storage e evoluir do data lake ao lakehouse: do data warehouse ao data lake, as zonas e o particionamento, os limites do lake cru (sem ACID, upsert ou time travel), os table formats abertos (Delta Lake, Apache Iceberg, Hudi), a arquitetura medalhão (bronze, silver, gold) e operar tabelas do lakehouse.",
        tags: ["Data Lake", "Lakehouse", "Delta"],
        refs: [{ type: "trail", ref: "Data Lake e Lakehouse" }],
    },
    {
        phase: "avancado",
        position: 10,
        title: "Streaming e dados em tempo real",
        description:
            "Processar dados em movimento: batch x streaming, o Apache Kafka como espinha dorsal (tópicos, partições, offsets, producers e consumers), as garantias de entrega (at-least-once, exactly-once), tempo de evento, watermark e janelas, o processamento com Spark Structured Streaming e o streaming na prática de engenharia de dados.",
        tags: ["Kafka", "Streaming", "Tempo real"],
        refs: [{ type: "trail", ref: "Streaming de Dados" }],
    },
    {
        phase: "avancado",
        position: 11,
        title: "Modern data stack e analytics engineering",
        description:
            "Transformar dados no warehouse com o dbt e entregar métricas confiáveis: o modern data stack e o ELT na nuvem, o dbt (modelos, ref e a linhagem, materializações view/table/incremental), testes e documentação de dados, dbt avançado (Jinja, macros, packages, snapshots) e o modern data stack na prática (semantic layer, CI/CD para dados).",
        tags: ["dbt", "Analytics Engineering", "ELT"],
        refs: [{ type: "trail", ref: "Modern Data Stack" }],
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
