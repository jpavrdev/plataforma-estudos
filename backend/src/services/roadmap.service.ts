import { db } from "../../db.ts";
import {
    roadmaps,
    roadmapStages,
    roadmapStageRefs,
    trails,
    modules,
    lessons,
    lessonProgress,
    simulados,
    simuladoAttempts,
    challenges,
    challengeSubmissions,
} from "../../schema.ts";
import { eq, and, asc, inArray } from "drizzle-orm";

type RefType = "trail" | "module" | "lesson" | "simulado" | "challenge";
type StatusRoadmap = "nao_iniciado" | "em_progresso" | "concluido";

interface Conclusao {
    lessons: Set<string>;
    simulados: Set<string>;
    desafios: Set<string>;
}

const SEM_CONCLUSAO: Conclusao = {
    lessons: new Set(),
    simulados: new Set(),
    desafios: new Set(),
};

// Sinais de conclusão do usuário, carregados uma vez. Desafio resolvido = submissão
// com status "passed" (não xpEarned, que é específico do desafio do dia).
async function carregarConclusao(userId: string): Promise<Conclusao> {
    const [aulas, sims, des] = await Promise.all([
        db.select({ id: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId)),
        db
            .select({ id: simuladoAttempts.simuladoId })
            .from(simuladoAttempts)
            .where(and(eq(simuladoAttempts.userId, userId), eq(simuladoAttempts.passed, true))),
        db
            .select({ id: challengeSubmissions.challengeId })
            .from(challengeSubmissions)
            .where(and(eq(challengeSubmissions.userId, userId), eq(challengeSubmissions.status, "passed"))),
    ]);
    return {
        lessons: new Set(aulas.map((r) => r.id)),
        simulados: new Set(sims.map((r) => r.id)),
        desafios: new Set(des.map((r) => r.id)),
    };
}

// Aulas publicadas por trilha e por módulo referenciados (pra derivar conclusão de container).
async function carregarAulasPorContainer(trailIds: string[], moduleIds: string[]) {
    const porTrail = new Map<string, string[]>();
    const porModule = new Map<string, string[]>();
    if (trailIds.length) {
        const rows = await db
            .select({ trailId: lessons.trailId, id: lessons.id })
            .from(lessons)
            .where(and(inArray(lessons.trailId, trailIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = porTrail.get(r.trailId) ?? [];
            arr.push(r.id);
            porTrail.set(r.trailId, arr);
        }
    }
    if (moduleIds.length) {
        const rows = await db
            .select({ moduleId: lessons.moduleId, id: lessons.id })
            .from(lessons)
            .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = porModule.get(r.moduleId) ?? [];
            arr.push(r.id);
            porModule.set(r.moduleId, arr);
        }
    }
    return { porTrail, porModule };
}

function refConcluido(
    refType: RefType,
    refId: string,
    c: Conclusao,
    aulas: { porTrail: Map<string, string[]>; porModule: Map<string, string[]> },
): boolean {
    switch (refType) {
        case "lesson":
            return c.lessons.has(refId);
        case "simulado":
            return c.simulados.has(refId);
        case "challenge":
            return c.desafios.has(refId);
        case "trail": {
            const ls = aulas.porTrail.get(refId) ?? [];
            return ls.length > 0 && ls.every((id) => c.lessons.has(id));
        }
        case "module": {
            const ls = aulas.porModule.get(refId) ?? [];
            return ls.length > 0 && ls.every((id) => c.lessons.has(id));
        }
    }
}

function statusPorProgresso(feitos: number, total: number): StatusRoadmap {
    if (total === 0 || feitos === 0) return "nao_iniciado";
    if (feitos >= total) return "concluido";
    return "em_progresso";
}

// Resolve cada ref para dados de exibição (título + o que o front precisa pra rotear).
async function resolverRefs(refs: { refType: RefType; refId: string }[]) {
    const idsDe = (t: RefType) => [...new Set(refs.filter((r) => r.refType === t).map((r) => r.refId))];
    const [tr, md, ls, sm, ch] = await Promise.all([
        idsDe("trail").length
            ? db.select({ id: trails.id, name: trails.name }).from(trails).where(inArray(trails.id, idsDe("trail")))
            : Promise.resolve([] as { id: string; name: string }[]),
        idsDe("module").length
            ? db
                  .select({ id: modules.id, title: modules.title, trailId: modules.trailId })
                  .from(modules)
                  .where(inArray(modules.id, idsDe("module")))
            : Promise.resolve([] as { id: string; title: string; trailId: string }[]),
        idsDe("lesson").length
            ? db
                  .select({ id: lessons.id, title: lessons.title, trailId: lessons.trailId })
                  .from(lessons)
                  .where(inArray(lessons.id, idsDe("lesson")))
            : Promise.resolve([] as { id: string; title: string; trailId: string }[]),
        idsDe("simulado").length
            ? db
                  .select({ id: simulados.id, name: simulados.name, slug: simulados.slug })
                  .from(simulados)
                  .where(inArray(simulados.id, idsDe("simulado")))
            : Promise.resolve([] as { id: string; name: string; slug: string }[]),
        idsDe("challenge").length
            ? db
                  .select({ id: challenges.id, title: challenges.title, number: challenges.number })
                  .from(challenges)
                  .where(inArray(challenges.id, idsDe("challenge")))
            : Promise.resolve([] as { id: string; title: string; number: number | null }[]),
    ]);
    const info = new Map<string, Record<string, unknown>>();
    for (const r of tr) info.set("trail:" + r.id, { title: r.name, trailId: r.id });
    for (const r of md) info.set("module:" + r.id, { title: r.title, trailId: r.trailId });
    for (const r of ls) info.set("lesson:" + r.id, { title: r.title, trailId: r.trailId, lessonId: r.id });
    for (const r of sm) info.set("simulado:" + r.id, { title: r.name, slug: r.slug });
    for (const r of ch) info.set("challenge:" + r.id, { title: r.title, number: r.number });
    return info;
}

export async function listarRoadmaps(userId?: string) {
    const lista = await db
        .select()
        .from(roadmaps)
        .where(eq(roadmaps.published, true))
        .orderBy(asc(roadmaps.position));
    if (lista.length === 0) return [];

    const ids = lista.map((r) => r.id);
    const etapas = await db
        .select()
        .from(roadmapStages)
        .where(inArray(roadmapStages.roadmapId, ids))
        .orderBy(asc(roadmapStages.position));
    const etapaIds = etapas.map((e) => e.id);
    const refs = etapaIds.length
        ? await db.select().from(roadmapStageRefs).where(inArray(roadmapStageRefs.stageId, etapaIds))
        : [];

    let conclusao = SEM_CONCLUSAO;
    let aulas = { porTrail: new Map<string, string[]>(), porModule: new Map<string, string[]>() };
    if (userId) {
        conclusao = await carregarConclusao(userId);
        aulas = await carregarAulasPorContainer(
            refs.filter((r) => r.refType === "trail").map((r) => r.refId),
            refs.filter((r) => r.refType === "module").map((r) => r.refId),
        );
    }

    const refsPorEtapa = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsPorEtapa.get(r.stageId) ?? [];
        arr.push(r);
        refsPorEtapa.set(r.stageId, arr);
    }
    const etapaConcluida = (stageId: string) => {
        const rs = refsPorEtapa.get(stageId) ?? [];
        return rs.length > 0 && rs.every((r) => refConcluido(r.refType as RefType, r.refId, conclusao, aulas));
    };

    return lista.map((r) => {
        const suas = etapas.filter((e) => e.roadmapId === r.id);
        const total = suas.length;
        const feitos = userId ? suas.filter((e) => etapaConcluida(e.id)).length : 0;
        const tags = [...new Set(suas.flatMap((e) => e.tags ?? []))].slice(0, 3);
        return {
            id: r.id,
            slug: r.slug,
            name: r.name,
            description: r.description,
            level: r.level,
            icon: r.icon,
            premium: r.premium,
            tags,
            stagesTotal: total,
            stagesDone: feitos,
            percent: total ? Math.round((feitos / total) * 100) : 0,
            status: statusPorProgresso(feitos, total),
        };
    });
}

export async function obterRoadmap(slug: string, userId?: string) {
    const [roadmap] = await db
        .select()
        .from(roadmaps)
        .where(and(eq(roadmaps.slug, slug), eq(roadmaps.published, true)));
    if (!roadmap) return null;

    const etapas = await db
        .select()
        .from(roadmapStages)
        .where(eq(roadmapStages.roadmapId, roadmap.id))
        .orderBy(asc(roadmapStages.position));
    const etapaIds = etapas.map((e) => e.id);
    const refs = etapaIds.length
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, etapaIds))
              .orderBy(asc(roadmapStageRefs.position))
        : [];

    let conclusao = SEM_CONCLUSAO;
    let aulas = { porTrail: new Map<string, string[]>(), porModule: new Map<string, string[]>() };
    if (userId) {
        conclusao = await carregarConclusao(userId);
        aulas = await carregarAulasPorContainer(
            refs.filter((r) => r.refType === "trail").map((r) => r.refId),
            refs.filter((r) => r.refType === "module").map((r) => r.refId),
        );
    }
    const infoRef = await resolverRefs(refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })));

    const refsPorEtapa = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsPorEtapa.get(r.stageId) ?? [];
        arr.push(r);
        refsPorEtapa.set(r.stageId, arr);
    }

    const etapasSaida = etapas.map((e) => {
        const rs = refsPorEtapa.get(e.id) ?? [];
        const completed =
            userId && rs.length > 0 && rs.every((r) => refConcluido(r.refType as RefType, r.refId, conclusao, aulas));
        return {
            id: e.id,
            phase: e.phase,
            title: e.title,
            description: e.description,
            tags: e.tags ?? [],
            position: e.position,
            completed: !!completed,
            refs: rs.map((r) => ({
                refType: r.refType,
                refId: r.refId,
                ...(infoRef.get(r.refType + ":" + r.refId) ?? { title: null }),
            })),
        };
    });

    // Cadeado sequencial: a etapa fica bloqueada até a anterior ser concluída. A primeira nunca.
    let anteriorConcluida = true;
    const comCadeado = etapasSaida.map((e) => {
        const locked = userId ? !anteriorConcluida : false;
        anteriorConcluida = e.completed;
        return { ...e, locked };
    });

    const feitos = comCadeado.filter((e) => e.completed).length;
    const total = comCadeado.length;
    const atual = comCadeado.find((e) => !e.completed && !e.locked);

    return {
        id: roadmap.id,
        slug: roadmap.slug,
        name: roadmap.name,
        description: roadmap.description,
        level: roadmap.level,
        icon: roadmap.icon,
        premium: roadmap.premium,
        progress: {
            stagesTotal: total,
            stagesDone: feitos,
            percent: total ? Math.round((feitos / total) * 100) : 0,
            status: statusPorProgresso(feitos, total),
        },
        currentStageId: atual?.id ?? null,
        stages: comCadeado,
    };
}
