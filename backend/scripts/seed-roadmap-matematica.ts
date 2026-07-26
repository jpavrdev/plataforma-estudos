// Seed do roadmap "Matemática": Pré-cálculo -> Cálculo 1. Camada de orquestração
// sobre as trilhas de matemática. Cresce por PR (Cálculo 2, Álgebra Linear, etc.,
// entram como estágios novos quando as trilhas existirem).
//
// Idempotente POR ESTÁGIO: cria o roadmap se faltar e insere só os estágios que
// ainda não existem (casados por título). Refs de trilha resolvidas por nome;
// trilha não encontrada é pulada com aviso.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-matematica.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails } from "../schema.ts";
import { eq, and } from "drizzle-orm";

const SLUG = "matematica";

const ROADMAP = {
    slug: SLUG,
    name: "Matemática",
    description:
        "A base matemática para exatas, do pré-cálculo ao cálculo: a álgebra, as funções e a trigonometria que sustentam tudo, e depois os limites, as derivadas e as integrais do Cálculo 1. Um caminho guiado para quem entra na universidade.",
    level: "iniciante" as const,
    icon: "function",
};

interface Stage {
    phase: "fundamentos" | "core" | "avancado" | "deploy";
    position: number;
    title: string;
    description: string;
    tags: string[];
    refs: string[]; // nomes de trilha
}

const STAGES: Stage[] = [
    {
        phase: "fundamentos",
        position: 1,
        title: "Pré-cálculo",
        description:
            "A base antes do cálculo: números reais e álgebra, equações e inequações, funções (domínio, gráfico, composição e inversa), exponencial e logaritmo, trigonometria e a preparação para o cálculo com limites e taxa de variação intuitivos.",
        tags: ["Álgebra", "Funções", "Trigonometria"],
        refs: ["Pré-cálculo"],
    },
    {
        phase: "core",
        position: 2,
        title: "Cálculo 1",
        description:
            "O núcleo do cálculo diferencial e integral: limites e continuidade, a derivada e as regras de derivação, as aplicações (máximos e mínimos, otimização, taxas relacionadas e L'Hôpital) e a integral com o Teorema Fundamental do Cálculo.",
        tags: ["Limites", "Derivadas", "Integrais"],
        refs: ["Cálculo 1"],
    },
    {
        phase: "core",
        position: 3,
        title: "Álgebra Linear",
        description:
            "A linguagem de vetores e matrizes, companheira do cálculo: sistemas lineares e escalonamento, matrizes e determinantes, espaços vetoriais (base e dimensão), transformações lineares, autovalores e diagonalização, e produto interno com ortogonalidade.",
        tags: ["Matrizes", "Vetores", "Autovalores"],
        refs: ["Álgebra Linear"],
    },
    {
        phase: "core",
        position: 4,
        title: "Geometria Analítica",
        description:
            "A ponte entre a álgebra e a geometria, ao lado da Álgebra Linear: vetores no plano e no espaço, produto escalar, vetorial e misto, as equações da reta e do plano com suas posições relativas, distâncias e ângulos, e as cônicas.",
        tags: ["Vetores", "Reta e plano", "Cônicas"],
        refs: ["Geometria Analítica"],
    },
    {
        phase: "avancado",
        position: 5,
        title: "Cálculo 2",
        description:
            "A continuação do cálculo: técnicas de integração (por partes, substituição trigonométrica, frações parciais), integrais impróprias, aplicações da integral (volumes e comprimento de arco), sequências e séries (com séries de Taylor) e equações diferenciais de 1ª ordem.",
        tags: ["Integrais", "Séries", "EDOs"],
        refs: ["Cálculo 2"],
    },
    {
        phase: "avancado",
        position: 6,
        title: "Cálculo 3",
        description:
            "Cálculo de várias variáveis: funções de duas ou mais variáveis, derivadas parciais e o gradiente, máximos e mínimos com multiplicadores de Lagrange, integrais duplas e triplas (polares, cilíndricas e esféricas) e uma introdução ao cálculo vetorial (teorema de Green).",
        tags: ["Parciais", "Integrais múltiplas", "Campos"],
        refs: ["Cálculo 3"],
    },
    {
        phase: "avancado",
        position: 7,
        title: "Estatística Matemática",
        description:
            "Probabilidade e estatística com rigor: axiomas e combinatória, variáveis aleatórias e distribuições (binomial, Poisson, normal), teoremas limite (lei dos grandes números e TCL), estimação (máxima verossimilhança e intervalos de confiança) e testes de hipóteses.",
        tags: ["Probabilidade", "Distribuições", "Inferência"],
        refs: ["Estatística Matemática"],
    },
];

async function resolverTrilha(nome: string): Promise<string | null> {
    const [t] = await db.select({ id: trails.id }).from(trails).where(eq(trails.name, nome));
    return t?.id ?? null;
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
        for (const nome of s.refs) {
            const refId = await resolverTrilha(nome);
            if (!refId) {
                console.log("  trilha nao encontrada, pulando: " + nome);
                refsFaltando++;
                continue;
            }
            await db
                .insert(roadmapStageRefs)
                .values({ stageId: stage.id, refType: "trail", refId, position: rpos++ });
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
