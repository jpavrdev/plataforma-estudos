// Seed do roadmap "DevOps": camada de orquestração sobre trilhas de fundação e
// de infraestrutura (Lógica + Go, Protocolos da Web, Docker e Containers,
// Kubernetes, CI/CD e Cloud, Arquitetura e Escala). Cresce por PR: os estágios
// de Linux, Git, Infraestrutura como Código e Observabilidade entram quando as
// trilhas deles existirem (posições 2, 3, 8 e 9 do desenho completo).
//
// Idempotente POR ESTÁGIO: cria o roadmap se faltar e insere apenas os estágios
// que ainda não existem (casados por título). Refs de trilha resolvidas por nome;
// ref não encontrada é pulada com aviso (ex.: trilhas de infra só existem em prod).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-devops.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and } from "drizzle-orm";

const SLUG = "devops";

const ROADMAP = {
    slug: SLUG,
    name: "DevOps",
    description:
        "Do zero a DevOps/SRE: uma linguagem e o sistema operacional, como a web conversa, empacotar com containers e orquestrar com Kubernetes, automatizar a entrega com CI/CD e escalar em produção. Um caminho guiado, da base ao deploy.",
    level: "intermediario" as const,
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

// Posições seguem o desenho de 10 estágios; as lacunas (2, 3, 8, 9) são Linux,
// Git, Infraestrutura como Código e Observabilidade, adicionados nos PRs deles.
const STAGES: Stage[] = [
    {
        phase: "fundamentos",
        position: 1,
        title: "Lógica & uma linguagem",
        description:
            "A base de tudo: pensar em algoritmos e dominar uma linguagem. Go é a língua franca do DevOps, já que Docker, Kubernetes e Terraform são escritos nela.",
        tags: ["Lógica", "Go", "Automação"],
        refs: [
            { type: "trail", ref: "Lógica de Programação" },
            { type: "trail", ref: "Go" },
        ],
    },
    {
        phase: "fundamentos",
        position: 2,
        title: "Linux & linha de comando",
        description:
            "A base do trabalho de DevOps: o sistema e o kernel, o filesystem e o boot, a linha de comando, permissões, usuários e processos, as chamadas de sistema, scripting em Bash e o Linux em operação com systemd, logs e SSH.",
        tags: ["Linux", "Shell", "Bash"],
        refs: [{ type: "trail", ref: "Linux e Linha de Comando" }],
    },
    {
        phase: "fundamentos",
        position: 4,
        title: "Redes & protocolos da web",
        description:
            "Como os sistemas conversam pela rede: os modelos OSI e TCP/IP, IP e sub-redes, roteamento, portas, DNS, TLS e balanceamento de carga, e o HTTP e o modelo cliente-servidor no topo. A base para expor, conectar e proteger serviços.",
        tags: ["Redes", "HTTP", "DNS"],
        refs: [
            { type: "trail", ref: "Redes" },
            { type: "trail", ref: "Protocolos da Web" },
        ],
    },
    {
        phase: "core",
        position: 5,
        title: "Containers com Docker",
        description:
            "Empacote a aplicação para rodar igual em qualquer lugar: containers e imagens, Dockerfile, volumes e Docker Compose orquestrando app, banco e cache no ambiente local.",
        tags: ["Docker", "Compose", "Containers"],
        refs: [{ type: "trail", ref: "Docker e Containers" }],
    },
    {
        phase: "core",
        position: 6,
        title: "Kubernetes",
        description:
            "Orquestre containers em escala: a arquitetura do cluster e o modelo declarativo, Pods e Deployments, Services e Ingress, ConfigMaps e Secrets, saúde e escala automática, e o caminho para produção com RBAC e Helm.",
        tags: ["Kubernetes", "Orquestração", "Escala"],
        refs: [{ type: "trail", ref: "Kubernetes" }],
    },
    {
        phase: "avancado",
        position: 7,
        title: "CI/CD & automação",
        description:
            "Automatize o caminho do código até o ar: integração contínua a cada push, GitHub Actions construindo e publicando a imagem, deploy contínuo e a aplicação rodando na nuvem com HTTPS, secrets e observabilidade.",
        tags: ["CI/CD", "GitHub Actions", "Cloud"],
        refs: [{ type: "trail", ref: "CI/CD e Cloud" }],
    },
    {
        phase: "deploy",
        position: 10,
        title: "Arquitetura & escala",
        description:
            "O fechamento do caminho: como um sistema evolui para aguentar carga. Escala vertical e horizontal, réplicas stateless, banco em escala, mensageria assíncrona, de monólito a serviços e padrões de resiliência que sustentam a operação.",
        tags: ["Arquitetura", "Escala", "Resiliência"],
        refs: [{ type: "trail", ref: "Arquitetura e Escala" }],
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
        const existentes = await db.select({ position: roadmaps.position }).from(roadmaps);
        const maxPos = existentes.reduce((m, r) => Math.max(m, r.position), 0);
        [rm] = await db
            .insert(roadmaps)
            .values({ ...ROADMAP, position: maxPos + 1, premium: false, published: true })
            .returning();
        console.log("Roadmap criado: " + rm.slug);
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
