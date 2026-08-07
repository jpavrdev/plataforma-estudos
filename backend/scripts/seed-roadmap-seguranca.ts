// Seed do roadmap "Segurança": caminho de carreira em cibersegurança, defensivo
// primeiro. Redes e Linux como base técnica, fundamentos, ameaças, o SOC,
// aplicações web, pentest como método e, no fim, nuvem e identidade.
//
// Este script RECONCILIA em vez de só criar. O anterior era do tipo "se já tem
// estágio, não faz nada", e por isso não conseguia corrigir o roadmap que já
// estava em produção: ele tinha 5 estágios, dois deles apontando para trilhas de
// certificação (SC-900 e ISC2 CC) e um apontando para um simulado. Roadmap de
// carreira não leva certificação, ela vive no catálogo como preparatório avulso.
//
// Reconciliar significa: apagar os estágios que saíram do desenho, atualizar e
// reposicionar os que ficam, criar os que faltam e acertar as refs de cada um.
// É seguro para o aluno: a conclusão manual de estágio é gravada em
// lessons_progress contra a AULA, não contra o estágio, e não existe tabela de
// progresso presa a roadmap_stages. Nada de progresso se perde aqui.
//
// Ref que não resolve NÃO bloqueia: o estágio é criado sem ela e o script avisa.
// É o que permite rodar antes das trilhas novas existirem e rodar de novo depois
// para conectá-las, uma trilha por vez, conforme cada seed for aplicado.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-roadmap-seguranca.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails, simulados } from "../schema.ts";
import { eq, inArray } from "drizzle-orm";

const SLUG = "seguranca";

const ROADMAP = {
    slug: SLUG,
    name: "Segurança",
    description:
        "Do zero a analista de segurança. Redes e Linux como base, o panorama de ameaças, a rotina de um SOC de verdade, segurança de aplicações, pentest com método e a nuvem que precisa ser defendida.",
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
        title: "Redes",
        description:
            "Não dá para defender o que você não entende: camadas, TCP/IP, portas, DNS, roteamento e o caminho que um pacote faz até o servidor.",
        tags: ["TCP/IP", "DNS", "Portas"],
        refs: [{ type: "trail", ref: "Redes" }],
    },
    {
        phase: "fundamentos",
        title: "Linux e linha de comando",
        description:
            "O terminal é a ferramenta de trabalho do analista: permissões, processos, serviços, e os arquivos de log onde a resposta costuma estar.",
        tags: ["Linux", "Terminal", "Permissões"],
        refs: [{ type: "trail", ref: "Linux e Linha de Comando" }],
    },
    {
        phase: "fundamentos",
        title: "Fundamentos de Cibersegurança",
        description:
            "Comece pelo começo: a tríade CIA, o panorama de ameaças e atores, malware, engenharia social e os princípios de defesa.",
        tags: ["Tríade CIA", "Ameaças", "Engenharia social"],
        refs: [{ type: "trail", ref: "Fundamentos de Cibersegurança" }],
    },
    {
        phase: "core",
        title: "Ameaças e ataques na prática",
        description:
            "Como um ataque acontece de verdade: a kill chain, as técnicas do MITRE ATT&CK, famílias de malware, phishing, ransomware e engenharia social.",
        tags: ["MITRE ATT&CK", "Ransomware", "Phishing"],
        refs: [{ type: "trail", ref: "Ameaças e Ataques na Prática" }],
    },
    {
        phase: "core",
        title: "Defesa e o SOC",
        description:
            "A rotina de quem defende: leitura de log, SIEM, criação de detecção, triagem de alerta, resposta a incidente e o primeiro contato com threat hunting.",
        tags: ["SOC", "SIEM", "Resposta a incidente"],
        refs: [{ type: "trail", ref: "Defesa e o SOC" }],
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
        title: "Pentest com método",
        description:
            "Teste de intrusão como profissão: escopo e autorização, reconhecimento, análise de vulnerabilidade, raciocínio de exploração e o relatório que o cliente lê.",
        tags: ["Metodologia", "Escopo", "Relatório"],
        refs: [{ type: "trail", ref: "Pentest com Método" }],
    },
    {
        phase: "deploy",
        title: "Segurança em nuvem e identidade",
        description:
            "Onde a superfície de ataque mora hoje: IAM, Active Directory e Entra, hardening, zero trust e o que a LGPD cobra de quem guarda dado dos outros.",
        tags: ["IAM", "Zero trust", "LGPD"],
        refs: [{ type: "trail", ref: "Segurança em Nuvem e Identidade" }],
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

// Refs do estágio: apaga as que não estão mais no desenho e insere as que faltam.
// Comparar por (tipo, id) evita reescrever o que já está certo a cada execução.
async function reconciliarRefs(stageId: string, desejadas: Ref[]): Promise<[number, number]> {
    const atuais = await db
        .select()
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.stageId, stageId));

    const alvo: { type: RefType; id: string }[] = [];
    let faltando = 0;
    for (const r of desejadas) {
        const id = await resolverRef(r.type, r.ref);
        if (!id) {
            console.log(`     ref ainda não existe, estágio fica sem ela: ${r.type} -> ${r.ref}`);
            faltando++;
            continue;
        }
        alvo.push({ type: r.type, id });
    }

    const sobrando = atuais.filter(
        (a) => !alvo.some((t) => t.type === a.refType && t.id === a.refId),
    );
    if (sobrando.length > 0) {
        await db.delete(roadmapStageRefs).where(
            inArray(
                roadmapStageRefs.id,
                sobrando.map((s) => s.id),
            ),
        );
        console.log(`     ${sobrando.length} ref(s) antiga(s) removida(s)`);
    }

    let criadas = 0;
    for (let i = 0; i < alvo.length; i++) {
        const t = alvo[i];
        const ja = atuais.find((a) => a.refType === t.type && a.refId === t.id);
        if (ja) {
            if (ja.position !== i + 1)
                await db
                    .update(roadmapStageRefs)
                    .set({ position: i + 1 })
                    .where(eq(roadmapStageRefs.id, ja.id));
            continue;
        }
        await db
            .insert(roadmapStageRefs)
            .values({ stageId, refType: t.type, refId: t.id, position: i + 1 });
        criadas++;
    }
    return [criadas, faltando];
}

async function seed() {
    let [rm] = await db.select().from(roadmaps).where(eq(roadmaps.slug, SLUG));
    if (!rm) {
        [rm] = await db
            .insert(roadmaps)
            .values({ ...ROADMAP, premium: false, published: true })
            .returning();
        console.log("Roadmap criado: " + rm.slug);
    } else {
        await db
            .update(roadmaps)
            .set({ name: ROADMAP.name, description: ROADMAP.description, icon: ROADMAP.icon })
            .where(eq(roadmaps.id, rm.id));
        console.log("Roadmap " + SLUG + " encontrado, reconciliando estágios.");
    }

    const atuais = await db.select().from(roadmapStages).where(eq(roadmapStages.roadmapId, rm.id));

    // Sai do desenho: apaga as refs antes do estágio, senão a FK barra o delete.
    const titulos = STAGES.map((s) => s.title);
    const removidos = atuais.filter((a) => !titulos.includes(a.title));
    for (const r of removidos) {
        await db.delete(roadmapStageRefs).where(eq(roadmapStageRefs.stageId, r.id));
        await db.delete(roadmapStages).where(eq(roadmapStages.id, r.id));
        console.log(`  estágio removido do roadmap: ${r.title}`);
    }

    let criados = 0;
    let refsCriadas = 0;
    let refsFaltando = 0;
    for (let i = 0; i < STAGES.length; i++) {
        const s = STAGES[i];
        const existente = atuais.find((a) => a.title === s.title);
        let stageId: string;
        if (existente) {
            await db
                .update(roadmapStages)
                .set({
                    phase: s.phase,
                    description: s.description,
                    tags: s.tags,
                    position: i + 1,
                })
                .where(eq(roadmapStages.id, existente.id));
            stageId = existente.id;
            console.log(`  ${i + 1}. ${s.title} (mantido)`);
        } else {
            const [novo] = await db
                .insert(roadmapStages)
                .values({
                    roadmapId: rm.id,
                    phase: s.phase,
                    title: s.title,
                    description: s.description,
                    tags: s.tags,
                    position: i + 1,
                })
                .returning();
            stageId = novo.id;
            criados++;
            console.log(`  ${i + 1}. ${s.title} (criado)`);
        }
        const [c, f] = await reconciliarRefs(stageId, s.refs);
        refsCriadas += c;
        refsFaltando += f;
    }

    console.log(
        `Reconciliação concluída: ${STAGES.length} estágios (${criados} criados, ${removidos.length} removidos), ` +
            `${refsCriadas} ref(s) nova(s), ${refsFaltando} ainda sem trilha.`,
    );
    if (refsFaltando > 0)
        console.log("Rode este script de novo depois de semear as trilhas que faltam.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
