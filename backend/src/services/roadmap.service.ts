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
import { eq, and, asc, desc, inArray, count } from "drizzle-orm";
import type { z } from "zod";
import type {
    createRoadmapSchema,
    updateRoadmapSchema,
    createStageSchema,
    updateStageSchema,
    createRefSchema,
} from "../schemas/roadmap.schema.ts";
import { AppError } from "../errors/AppError.ts";

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

// ============================ CRUD (admin) ============================

type DadosCriarRoadmap = z.infer<typeof createRoadmapSchema>;
type DadosAtualizarRoadmap = z.infer<typeof updateRoadmapSchema>;
type DadosCriarEstagio = z.infer<typeof createStageSchema>;
type DadosAtualizarEstagio = z.infer<typeof updateStageSchema>;
type DadosCriarRef = z.infer<typeof createRefSchema>;

function gerarSlug(nome: string): string {
    return nome
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Lista para o admin: todos os roadmaps (inclusive rascunhos), com contagem de estágios.
export async function listarRoadmapsAdmin() {
    const lista = await db.select().from(roadmaps).orderBy(asc(roadmaps.position));
    const contagens = await db
        .select({ roadmapId: roadmapStages.roadmapId, n: count() })
        .from(roadmapStages)
        .groupBy(roadmapStages.roadmapId);
    const porId = new Map(contagens.map((c) => [c.roadmapId, Number(c.n)]));
    return lista.map((r) => ({ ...r, stagesTotal: porId.get(r.id) ?? 0 }));
}

// Estrutura crua de um roadmap para edição no estúdio (por id, sem progresso de aluno).
export async function obterRoadmapStudio(id: string) {
    const [roadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, id));
    if (!roadmap) throw new AppError(404, "Roadmap não encontrado");

    const etapas = await db
        .select()
        .from(roadmapStages)
        .where(eq(roadmapStages.roadmapId, id))
        .orderBy(asc(roadmapStages.position));
    const etapaIds = etapas.map((e) => e.id);
    const refs = etapaIds.length
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, etapaIds))
              .orderBy(asc(roadmapStageRefs.position))
        : [];
    const info = await resolverRefs(refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })));

    const refsPorEtapa = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsPorEtapa.get(r.stageId) ?? [];
        arr.push(r);
        refsPorEtapa.set(r.stageId, arr);
    }

    return {
        ...roadmap,
        stages: etapas.map((e) => ({
            id: e.id,
            phase: e.phase,
            title: e.title,
            description: e.description,
            tags: e.tags ?? [],
            position: e.position,
            refs: (refsPorEtapa.get(e.id) ?? []).map((r) => ({
                id: r.id,
                refType: r.refType,
                refId: r.refId,
                position: r.position,
                ...(info.get(r.refType + ":" + r.refId) ?? { title: null }),
            })),
        })),
    };
}

export async function criarRoadmap(dados: DadosCriarRoadmap) {
    const slug = (dados.slug?.trim() || gerarSlug(dados.name)).slice(0, 80);
    if (!slug) throw new AppError(400, "Não foi possível gerar um slug a partir do nome");
    const [existe] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.slug, slug));
    if (existe) throw new AppError(409, "Já existe um roadmap com esse slug");

    let position = dados.position;
    if (position === undefined) {
        const [ult] = await db.select({ p: roadmaps.position }).from(roadmaps).orderBy(desc(roadmaps.position)).limit(1);
        position = ult ? ult.p + 1 : 1;
    }
    const [rm] = await db
        .insert(roadmaps)
        .values({
            slug,
            name: dados.name,
            description: dados.description,
            level: dados.level,
            icon: dados.icon ?? null,
            position,
            premium: dados.premium ?? false,
            published: dados.published ?? false,
        })
        .returning();
    return rm;
}

export async function atualizarRoadmap(id: string, dados: DadosAtualizarRoadmap) {
    const [rm] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.id, id));
    if (!rm) throw new AppError(404, "Roadmap não encontrado");

    const sets: Partial<typeof roadmaps.$inferInsert> = {};
    if (dados.slug !== undefined) {
        const s = dados.slug.trim();
        const [outro] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.slug, s));
        if (outro && outro.id !== id) throw new AppError(409, "Já existe um roadmap com esse slug");
        sets.slug = s;
    }
    if (dados.name !== undefined) sets.name = dados.name;
    if (dados.description !== undefined) sets.description = dados.description;
    if (dados.level !== undefined) sets.level = dados.level;
    if (dados.icon !== undefined) sets.icon = dados.icon;
    if (dados.position !== undefined) sets.position = dados.position;
    if (dados.premium !== undefined) sets.premium = dados.premium;
    if (dados.published !== undefined) sets.published = dados.published;
    if (Object.keys(sets).length === 0) throw new AppError(400, "Nada para atualizar");

    const [atualizado] = await db.update(roadmaps).set(sets).where(eq(roadmaps.id, id)).returning();
    return atualizado;
}

export async function excluirRoadmap(id: string) {
    const [rm] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.id, id));
    if (!rm) throw new AppError(404, "Roadmap não encontrado");
    await db.transaction(async (tx) => {
        const etapas = await tx
            .select({ id: roadmapStages.id })
            .from(roadmapStages)
            .where(eq(roadmapStages.roadmapId, id));
        const ids = etapas.map((e) => e.id);
        if (ids.length) {
            await tx.delete(roadmapStageRefs).where(inArray(roadmapStageRefs.stageId, ids));
            await tx.delete(roadmapStages).where(inArray(roadmapStages.id, ids));
        }
        await tx.delete(roadmaps).where(eq(roadmaps.id, id));
    });
}

export async function criarEstagio(roadmapId: string, dados: DadosCriarEstagio) {
    const [rm] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.id, roadmapId));
    if (!rm) throw new AppError(404, "Roadmap não encontrado");

    let position = dados.position;
    if (position === undefined) {
        const [ult] = await db
            .select({ p: roadmapStages.position })
            .from(roadmapStages)
            .where(eq(roadmapStages.roadmapId, roadmapId))
            .orderBy(desc(roadmapStages.position))
            .limit(1);
        position = ult ? ult.p + 1 : 1;
    }
    const [stage] = await db
        .insert(roadmapStages)
        .values({
            roadmapId,
            phase: dados.phase,
            title: dados.title,
            description: dados.description,
            tags: dados.tags ?? [],
            position,
        })
        .returning();
    return stage;
}

export async function atualizarEstagio(id: string, dados: DadosAtualizarEstagio) {
    const [st] = await db.select({ id: roadmapStages.id }).from(roadmapStages).where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "Estágio não encontrado");

    const sets: Partial<typeof roadmapStages.$inferInsert> = {};
    if (dados.phase !== undefined) sets.phase = dados.phase;
    if (dados.title !== undefined) sets.title = dados.title;
    if (dados.description !== undefined) sets.description = dados.description;
    if (dados.tags !== undefined) sets.tags = dados.tags;
    if (dados.position !== undefined) sets.position = dados.position;
    if (Object.keys(sets).length === 0) throw new AppError(400, "Nada para atualizar");

    const [atualizado] = await db.update(roadmapStages).set(sets).where(eq(roadmapStages.id, id)).returning();
    return atualizado;
}

export async function excluirEstagio(id: string) {
    const [st] = await db.select({ id: roadmapStages.id }).from(roadmapStages).where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "Estágio não encontrado");
    await db.transaction(async (tx) => {
        await tx.delete(roadmapStageRefs).where(eq(roadmapStageRefs.stageId, id));
        await tx.delete(roadmapStages).where(eq(roadmapStages.id, id));
    });
}

export async function adicionarRef(stageId: string, dados: DadosCriarRef) {
    const [st] = await db.select({ id: roadmapStages.id }).from(roadmapStages).where(eq(roadmapStages.id, stageId));
    if (!st) throw new AppError(404, "Estágio não encontrado");

    // Valida que o conteúdo referenciado existe, para nunca criar um ref pendurado.
    const info = await resolverRefs([{ refType: dados.refType, refId: dados.refId }]);
    if (!info.has(dados.refType + ":" + dados.refId)) {
        throw new AppError(400, "O conteúdo referenciado não existe");
    }

    let position = dados.position;
    if (position === undefined) {
        const [ult] = await db
            .select({ p: roadmapStageRefs.position })
            .from(roadmapStageRefs)
            .where(eq(roadmapStageRefs.stageId, stageId))
            .orderBy(desc(roadmapStageRefs.position))
            .limit(1);
        position = ult ? ult.p + 1 : 1;
    }
    const [ref] = await db
        .insert(roadmapStageRefs)
        .values({ stageId, refType: dados.refType, refId: dados.refId, position })
        .returning();
    return { ...ref, ...(info.get(dados.refType + ":" + dados.refId) ?? {}) };
}

export async function removerRef(id: string) {
    const [ref] = await db.select({ id: roadmapStageRefs.id }).from(roadmapStageRefs).where(eq(roadmapStageRefs.id, id));
    if (!ref) throw new AppError(404, "Referência não encontrada");
    await db.delete(roadmapStageRefs).where(eq(roadmapStageRefs.id, id));
}
