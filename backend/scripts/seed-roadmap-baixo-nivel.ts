// Seed do roadmap "C++ e Baixo Nível": o caminho de quem trabalha perto do metal
// (tempo real, embarcados, compiladores). Reusa Lógica de Programação e a trilha
// de C++ existente e cresce com as trilhas novas de sistemas (Por Dentro da
// Máquina, C++ Moderno, SO e Concorrência, Compiladores, Tempo Real, Embarcados).
//
// Idempotente POR ESTAGIO: cria o roadmap se faltar e insere apenas os estágios
// que ainda não existem (casados por título). O roadmap cresce trilha a trilha:
// a cada trilha nova autorada, acrescente o estágio em STAGES e rode de novo.
//
// Na criação, o roadmap entra no fim da lista (não empurra os existentes).
// Refs de trilha resolvidas por nome; ref não encontrada é pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-baixo-nivel.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and, sql } from "drizzle-orm";

const SLUG = "baixo-nivel";

const ROADMAP = {
    slug: SLUG,
    name: "C++ e Baixo Nível",
    description:
        "Do zero ao engenheiro de sistemas: a base de programação, C++ a fundo, como a máquina funciona por dentro, sistemas operacionais e concorrência, compiladores e toolchain, e o mundo de tempo real e embarcados onde o software encontra o hardware. O caminho de quem trabalha perto do metal.",
    level: "iniciante" as const,
    icon: "cpu",
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
        title: "A linguagem C++",
        description:
            "O C++ do zero: sintaxe, controle de fluxo, funções, ponteiros e memória, classes com RAII, herança, STL e o começo do C++ moderno.",
        tags: ["C++", "Sintaxe", "Ponteiros"],
        refs: [{ type: "trail", ref: "C++" }],
    },
    {
        phase: "fundamentos",
        position: 3,
        title: "Por dentro da máquina",
        description:
            "Como o computador funciona de verdade: representação binária e ponto flutuante, bits na prática, a CPU por dentro, a hierarquia de memória com stack, heap e cache, e o caminho do fonte ao binário.",
        tags: ["Bits", "Memória", "CPU"],
        refs: [{ type: "trail", ref: "Por Dentro da Máquina" }],
    },
    {
        phase: "core",
        position: 4,
        title: "C++ moderno e idiomático",
        description:
            "O C++ que os code reviews cobram: semântica de valor, const-correctness, RAII e ownership com smart pointers, move semantics, templates com concepts e a STL com o custo de cada container na cabeça.",
        tags: ["RAII", "Move", "STL"],
        refs: [{ type: "trail", ref: "C++ Moderno" }],
    },
    {
        phase: "core",
        position: 5,
        title: "SO e concorrência",
        description:
            "O sistema operacional sem mistério: processos e threads, corridas de dados, mutex, semáforos e atomics, o escalonador por dentro, memória virtual e a E/S que domina o tempo dos programas.",
        tags: ["Threads", "Mutex", "Escalonamento"],
        refs: [{ type: "trail", ref: "Sistemas Operacionais e Concorrência" }],
    },
    {
        phase: "core",
        position: 6,
        title: "Compiladores e toolchain",
        description:
            "A caixa preta vira caixa de vidro: as fases da compilação, lexer, parser e AST, otimizações e undefined behavior, o linker, build systems com make e CMake, cross-compilation, sanitizers e debugger.",
        tags: ["Compilador", "Linker", "CMake"],
        refs: [{ type: "trail", ref: "Compiladores e Toolchain" }],
    },
    {
        phase: "avancado",
        position: 7,
        title: "Sistemas de tempo real",
        description:
            "Correto e no prazo: hard e soft real-time, RTOS com tarefas, ISRs e filas, RMS e EDF, a inversão de prioridade do Mars Pathfinder, memória sem malloc, WCET, watchdog e os padrões que mantêm firmware previsível.",
        tags: ["RTOS", "Escalonamento", "Determinismo"],
        refs: [{ type: "trail", ref: "Sistemas de Tempo Real" }],
    },
    {
        phase: "deploy",
        position: 8,
        title: "Embarcados na prática",
        description:
            "Onde o software encontra o hardware: o microcontrolador por dentro, registradores e volatile, GPIO, timers e interrupções, UART, SPI e I2C, C++ enxuto, energia, robustez, OTA e a qualidade de firmware com MISRA, testes no host e CI.",
        tags: ["Microcontrolador", "GPIO", "Protocolos"],
        refs: [{ type: "trail", ref: "Embarcados na Prática" }],
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
