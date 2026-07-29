// Seed do roadmap "QA e Testes": caminho de quem quer trabalhar com qualidade de
// software, do zero (conceitos, técnicas e processo) até automação de ponta a ponta
// rodando no pipeline. Reaproveita as trilhas de fundação (Lógica, JavaScript,
// Protocolos da Web, Banco de Dados) e encadeia as três de teste: Fundamentos de QA,
// Testes e Qualidade e Testes E2E com Cypress e Playwright.
//
// Idempotente POR ESTÁGIO: cria o roadmap se faltar e insere apenas os estágios que
// ainda não existem (casados por título). Refs de trilha resolvidas por nome; ref não
// encontrada é pulada com aviso (em dev boa parte das trilhas não está semeada).
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-qa.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, and } from "drizzle-orm";

const SLUG = "qa";

const ROADMAP = {
    slug: SLUG,
    name: "QA e Testes",
    description:
        "Do zero a QA: o que é qualidade e como se decide o que testar, as técnicas de projeto de caso, o dia a dia com defeitos e critérios de aceitação, o lugar de QA num time ágil, e daí para a automação, dos testes de unidade aos de ponta a ponta no navegador rodando no pipeline.",
    level: "iniciante" as const,
    icon: "check-circle",
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
        title: "Fundamentos de QA",
        description:
            "A porta de entrada, sem pré-requisito nenhum: o que é qualidade e o papel de QA, os princípios e o processo de teste, níveis e tipos (funcionais e não funcionais), as técnicas de projeto de caso, o dia a dia com casos, defeitos e evidências, e QA em times ágeis com Scrum, Kanban e BDD.",
        tags: ["QA", "Teste", "Ágil"],
        refs: [{ type: "trail", ref: "Fundamentos de QA" }],
    },
    {
        phase: "fundamentos",
        position: 2,
        title: "Lógica & uma linguagem",
        description:
            "Automatizar é escrever código. Lógica de programação para pensar em algoritmos e JavaScript como linguagem, que é a língua franca das ferramentas de teste de interface (Cypress e Playwright rodam nela).",
        tags: ["Lógica", "JavaScript"],
        refs: [
            { type: "trail", ref: "Lógica de Programação" },
            { type: "trail", ref: "JavaScript" },
        ],
    },
    {
        phase: "core",
        position: 3,
        title: "Como a web funciona",
        description:
            "Testar API exige entender o que passa no fio: o modelo cliente-servidor, requisição e resposta, métodos, status, cabeçalhos, cookies e sessão. É o que separa quem testa telas de quem testa o sistema.",
        tags: ["HTTP", "API", "Web"],
        refs: [{ type: "trail", ref: "Protocolos da Web" }],
    },
    {
        phase: "core",
        position: 4,
        title: "Banco de dados & SQL",
        description:
            "Boa parte do trabalho de QA é conferir o que foi gravado de verdade. SQL para consultar, comparar e preparar massa de teste, sem depender de ninguém para saber o que aconteceu no banco.",
        tags: ["SQL", "Dados"],
        refs: [{ type: "trail", ref: "Banco de Dados e SQL" }],
    },
    {
        phase: "core",
        position: 5,
        title: "Testes automatizados",
        description:
            "A ponte entre saber testar e saber automatizar: o primeiro teste unitário, mocks e dublês, testes de integração com banco efêmero, TDD e código testável, cobertura, testes instáveis e a suíte rodando no CI.",
        tags: ["Automação", "Unitário", "TDD"],
        refs: [{ type: "trail", ref: "Testes e Qualidade" }],
    },
    {
        phase: "avancado",
        position: 6,
        title: "Testes E2E no navegador",
        description:
            "O topo da pirâmide: Cypress e Playwright, seletores que não quebram, espera por condição, interceptação e simulação de rede, preparação de dados por atalho, organização da suíte e execução no pipeline com evidências.",
        tags: ["E2E", "Cypress", "Playwright"],
        refs: [{ type: "trail", ref: "Testes E2E com Cypress e Playwright" }],
    },
    {
        phase: "avancado",
        position: 7,
        title: "Segurança de aplicações",
        description:
            "Teste não funcional na prática, e uma das especializações mais procuradas em QA: as falhas mais comuns em aplicações web, como elas são exploradas e como verificar se a aplicação está protegida.",
        tags: ["Segurança", "Não funcional"],
        refs: [{ type: "trail", ref: "Segurança de Aplicações Web" }],
    },
    {
        phase: "deploy",
        position: 8,
        title: "CI/CD & Cloud",
        description:
            "Onde a suíte roda de verdade: pipeline, execução automática a cada mudança, ambientes e publicação. Automação que não roda sozinha no pipeline protege muito pouco.",
        tags: ["CI/CD", "Pipeline"],
        refs: [{ type: "trail", ref: "CI/CD e Cloud" }],
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
