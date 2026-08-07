import { db } from "../../db.ts";
import {
    roadmapStageCompletions,
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
    userRoadmaps,
} from "../../schema.ts";
import { eq, and, asc, desc, inArray, count, countDistinct } from "drizzle-orm";
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
        db
            .select({ id: lessonProgress.lessonId })
            .from(lessonProgress)
            .where(eq(lessonProgress.userId, userId)),
        db
            .select({ id: simuladoAttempts.simuladoId })
            .from(simuladoAttempts)
            .where(and(eq(simuladoAttempts.userId, userId), eq(simuladoAttempts.passed, true))),
        db
            .select({ id: challengeSubmissions.challengeId })
            .from(challengeSubmissions)
            .where(
                and(
                    eq(challengeSubmissions.userId, userId),
                    eq(challengeSubmissions.status, "passed"),
                ),
            ),
    ]);
    return {
        lessons: new Set(aulas.map((r) => r.id)),
        simulados: new Set(sims.map((r) => r.id)),
        desafios: new Set(des.map((r) => r.id)),
    };
}

type AulaContainer = { id: string; language: string | null };

// Aulas publicadas por trilha e por módulo referenciados (pra derivar conclusão de container).
async function carregarAulasPorContainer(trailIds: string[], moduleIds: string[]) {
    const porTrail = new Map<string, AulaContainer[]>();
    const porModule = new Map<string, AulaContainer[]>();
    if (trailIds.length) {
        const rows = await db
            .select({ trailId: lessons.trailId, id: lessons.id, language: lessons.language })
            .from(lessons)
            .where(and(inArray(lessons.trailId, trailIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = porTrail.get(r.trailId) ?? [];
            arr.push({ id: r.id, language: r.language });
            porTrail.set(r.trailId, arr);
        }
    }
    if (moduleIds.length) {
        const rows = await db
            .select({ moduleId: lessons.moduleId, id: lessons.id, language: lessons.language })
            .from(lessons)
            .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = porModule.get(r.moduleId) ?? [];
            arr.push({ id: r.id, language: r.language });
            porModule.set(r.moduleId, arr);
        }
    }
    return { porTrail, porModule };
}

// Multi-linguagem: concluído = todas as neutras + todas as aulas de alguma linguagem.
function containerConcluido(ls: AulaContainer[], c: Conclusao): boolean {
    if (!ls.length) return false;
    const linguagens = [...new Set(ls.map((l) => l.language).filter((x): x is string => !!x))];
    if (!linguagens.length) return ls.every((l) => c.lessons.has(l.id));
    if (!ls.filter((l) => l.language === null).every((l) => c.lessons.has(l.id))) return false;
    return linguagens.some((lg) =>
        ls.filter((l) => l.language === lg).every((l) => c.lessons.has(l.id)),
    );
}

function refConcluido(
    refType: RefType,
    refId: string,
    c: Conclusao,
    aulas: { porTrail: Map<string, AulaContainer[]>; porModule: Map<string, AulaContainer[]> },
): boolean {
    switch (refType) {
        case "lesson":
            return c.lessons.has(refId);
        case "simulado":
            return c.simulados.has(refId);
        case "challenge":
            return c.desafios.has(refId);
        case "trail":
            return containerConcluido(aulas.porTrail.get(refId) ?? [], c);
        case "module":
            return containerConcluido(aulas.porModule.get(refId) ?? [], c);
    }
}

function statusPorProgresso(feitos: number, total: number): StatusRoadmap {
    if (total === 0 || feitos === 0) return "nao_iniciado";
    if (feitos >= total) return "concluido";
    return "em_progresso";
}

// Resolve cada ref para dados de exibição (título + o que o front precisa pra rotear).
async function resolverRefs(refs: { refType: RefType; refId: string }[]) {
    const idsDe = (t: RefType) => [
        ...new Set(refs.filter((r) => r.refType === t).map((r) => r.refId)),
    ];
    const [tr, md, ls, sm, ch] = await Promise.all([
        idsDe("trail").length
            ? db
                  .select({ id: trails.id, name: trails.name })
                  .from(trails)
                  .where(inArray(trails.id, idsDe("trail")))
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
    for (const r of ls)
        info.set("lesson:" + r.id, { title: r.title, trailId: r.trailId, lessonId: r.id });
    for (const r of sm) info.set("simulado:" + r.id, { title: r.name, slug: r.slug });
    for (const r of ch) info.set("challenge:" + r.id, { title: r.title, number: r.number });
    return info;
}

async function estagiosConcluidosManualmente(userId: string) {
    const rows = await db
        .select({ stageId: roadmapStageCompletions.stageId })
        .from(roadmapStageCompletions)
        .where(eq(roadmapStageCompletions.userId, userId));
    return new Set(rows.map((r) => r.stageId));
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
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, etapaIds))
        : [];

    let conclusao = SEM_CONCLUSAO;
    let manuais = new Set<string>();
    let aulas = {
        porTrail: new Map<string, AulaContainer[]>(),
        porModule: new Map<string, AulaContainer[]>(),
    };
    if (userId) {
        conclusao = await carregarConclusao(userId);
        manuais = await estagiosConcluidosManualmente(userId);
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
        if (manuais.has(stageId)) return true;
        const rs = refsPorEtapa.get(stageId) ?? [];
        return (
            rs.length > 0 &&
            rs.every((r) => refConcluido(r.refType as RefType, r.refId, conclusao, aulas))
        );
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
    let manuais = new Set<string>();
    let aulas = {
        porTrail: new Map<string, AulaContainer[]>(),
        porModule: new Map<string, AulaContainer[]>(),
    };
    if (userId) {
        conclusao = await carregarConclusao(userId);
        manuais = await estagiosConcluidosManualmente(userId);
        aulas = await carregarAulasPorContainer(
            refs.filter((r) => r.refType === "trail").map((r) => r.refId),
            refs.filter((r) => r.refType === "module").map((r) => r.refId),
        );
    }
    const infoRef = await resolverRefs(
        refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })),
    );

    const refsPorEtapa = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsPorEtapa.get(r.stageId) ?? [];
        arr.push(r);
        refsPorEtapa.set(r.stageId, arr);
    }

    const etapasSaida = etapas.map((e) => {
        const rs = refsPorEtapa.get(e.id) ?? [];
        const completed =
            (userId && manuais.has(e.id)) ||
            (userId &&
                rs.length > 0 &&
                rs.every((r) => refConcluido(r.refType as RefType, r.refId, conclusao, aulas)));
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
        // A tela precisa saber para não oferecer "seguir" a quem já segue.
        seguindo: userId ? await estaSeguindo(userId, roadmap.id) : false,
        stages: comCadeado,
    };
}

async function estaSeguindo(userId: string, roadmapId: string) {
    const [ja] = await db
        .select({ id: userRoadmaps.id })
        .from(userRoadmaps)
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
    return !!ja;
}

// ============ Qual roadmap o aluno está seguindo ============

/**
 * Marca que o aluno segue este roadmap. `explicito` distingue a escolha dele
 * (botão de seguir) da inferência feita a partir do progresso: escolha explícita
 * nunca é rebaixada por inferência posterior.
 */
export async function seguirRoadmap(userId: string, roadmapId: string, explicito = true) {
    const [ja] = await db
        .select()
        .from(userRoadmaps)
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
    if (ja) {
        await db
            .update(userRoadmaps)
            .set({ lastSeenAt: new Date(), explicito: ja.explicito || explicito })
            .where(eq(userRoadmaps.id, ja.id));
        return;
    }
    await db.insert(userRoadmaps).values({ userId, roadmapId, explicito });
}

/**
 * Abrir o detalhe do roadmap atualiza a recência de quem já segue. NÃO cria
 * vínculo: espiar um roadmap não pode fazer o app achar que o aluno mudou de
 * caminho, senão a curiosidade viraria declaração.
 */
export async function registrarVisita(userId: string, roadmapId: string) {
    await db
        .update(userRoadmaps)
        .set({ lastSeenAt: new Date() })
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
}

/**
 * Quantos roadmaps publicados contêm cada trilha. É o peso da inferência: trilha
 * que está em quase todo roadmap (Lógica de Programação, em sete) quase não
 * informa; trilha exclusiva de um caminho decide sozinha.
 */
async function roadmapsPorTrilha(trailIds: string[]): Promise<Map<string, number>> {
    if (!trailIds.length) return new Map();
    const linhas = await db
        .select({ trailId: roadmapStageRefs.refId, n: countDistinct(roadmapStages.roadmapId) })
        .from(roadmapStageRefs)
        .innerJoin(roadmapStages, eq(roadmapStages.id, roadmapStageRefs.stageId))
        .where(
            and(eq(roadmapStageRefs.refType, "trail"), inArray(roadmapStageRefs.refId, trailIds)),
        )
        .groupBy(roadmapStageRefs.refId);
    return new Map(linhas.map((l) => [l.trailId, Number(l.n)]));
}

type DetalheRoadmap = NonNullable<Awaited<ReturnType<typeof obterRoadmap>>>;

/**
 * Adivinha o roadmap a partir do progresso, quando o aluno não declarou nenhum.
 *
 * Dois sinais, nesta ordem. O prefixo contínuo (quantos estágios seguidos, a
 * partir do primeiro, ele concluiu) captura a SEQUÊNCIA que ele vem seguindo, e
 * é o que separa casos que o volume não separa: quem fez Lógica, Python e SQL
 * tem prefixo 3 em Engenharia de Dados e 2 em Ciência de Dados, porque pulou
 * Estatística. O peso por exclusividade desempata.
 *
 * Devolve null quando empata, e isso é de propósito: melhor perguntar do que
 * cravar um caminho errado. Medido contra a base de produção, decide cerca de um
 * terço dos alunos; o resto ainda não revelou caminho nenhum.
 */
async function inferirRoadmap(detalhes: DetalheRoadmap[]): Promise<DetalheRoadmap | null> {
    const trilhasConcluidas = new Set<string>();
    for (const d of detalhes)
        for (const s of d.stages)
            if (s.completed)
                for (const r of s.refs) if (r.refType === "trail") trilhasConcluidas.add(r.refId);

    const peso = await roadmapsPorTrilha([...trilhasConcluidas]);

    const pontuados = detalhes.map((d) => {
        let prefixo = 0;
        for (const s of d.stages) {
            if (!s.completed) break;
            prefixo++;
        }
        let pontos = 0;
        for (const s of d.stages)
            if (s.completed)
                for (const r of s.refs)
                    if (r.refType === "trail") pontos += 1 / (peso.get(r.refId) ?? 1);
        return { d, prefixo, pontos };
    });

    const melhor = pontuados.reduce((a, b) =>
        b.prefixo !== a.prefixo ? (b.prefixo > a.prefixo ? b : a) : b.pontos > a.pontos ? b : a,
    );
    const empatados = pontuados.filter(
        (p) => p.prefixo === melhor.prefixo && Math.abs(p.pontos - melhor.pontos) < 1e-9,
    );
    return empatados.length === 1 ? melhor.d : null;
}

// Depois de concluir uma trilha: em qual roadmap ela vive e qual é a próxima
// trilha dele. Com a trilha em mais de um roadmap a escolha segue esta ordem:
// o que o aluno declarou seguir, depois a inferência pelo progresso e, se as
// duas falharem, a heurística antiga de maior número de estágios concluídos.
// `origem` diz qual delas decidiu, para a tela poder oferecer a troca em vez de
// fingir certeza. Só oferece etapa destravada; no fim do roadmap (ou sem etapa
// elegível), proximaTrilha volta nula.
export async function proximaTrilhaAposConcluir(userId: string, trailId: string) {
    const candidatos = await db
        .selectDistinct({ slug: roadmaps.slug, position: roadmaps.position })
        .from(roadmapStageRefs)
        .innerJoin(roadmapStages, eq(roadmapStages.id, roadmapStageRefs.stageId))
        .innerJoin(roadmaps, eq(roadmaps.id, roadmapStages.roadmapId))
        .where(
            and(
                eq(roadmapStageRefs.refType, "trail"),
                eq(roadmapStageRefs.refId, trailId),
                eq(roadmaps.published, true),
            ),
        );
    if (!candidatos.length) return { roadmap: null, proximaTrilha: null };

    const detalhes: NonNullable<Awaited<ReturnType<typeof obterRoadmap>>>[] = [];
    for (const c of [...candidatos].sort((a, b) => a.position - b.position)) {
        const d = await obterRoadmap(c.slug, userId);
        if (d) detalhes.push(d);
    }
    if (!detalhes.length) return { roadmap: null, proximaTrilha: null };

    // A próxima etapa elegível de cada roadmap: depois da etapa desta trilha,
    // destravada, não concluída e com uma trilha para apontar.
    const refDaProxima = (d: (typeof detalhes)[number]) => {
        const idx = d.stages.findIndex((s) =>
            s.refs.some((r) => r.refType === "trail" && r.refId === trailId),
        );
        if (idx < 0) return null;
        const etapa = d.stages
            .slice(idx + 1)
            .find((s) => !s.completed && !s.locked && s.refs.some((r) => r.refType === "trail"));
        return etapa?.refs.find((r) => r.refType === "trail") ?? null;
    };

    // Prefere um roadmap que tenha o que oferecer; entre eles (e no fallback
    // sem oferta), o escolhido pela ordem: declarado, inferido, heurística.
    const comProxima = detalhes.filter((d) => refDaProxima(d) !== null);
    const elegiveis = comProxima.length ? comProxima : detalhes;

    // 1. O que o aluno declarou seguir. Escolha explícita vem antes da inferida,
    // e entre iguais vale a mais recente.
    const seguidos = await db
        .select()
        .from(userRoadmaps)
        .where(
            and(
                eq(userRoadmaps.userId, userId),
                inArray(
                    userRoadmaps.roadmapId,
                    elegiveis.map((d) => d.id),
                ),
            ),
        );
    seguidos.sort(
        (a, b) =>
            Number(b.explicito) - Number(a.explicito) ||
            b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
    );
    const declarado = seguidos.length
        ? (elegiveis.find((d) => d.id === seguidos[0].roadmapId) ?? null)
        : null;

    // 2. Inferência pelo progresso. 3. Heurística antiga, que erra em empate mas
    // é melhor que não sugerir nada.
    const inferido = declarado ? null : await inferirRoadmap(elegiveis);
    const escolhido =
        declarado ??
        inferido ??
        elegiveis.reduce((melhor, d) =>
            d.progress.stagesDone > melhor.progress.stagesDone ? d : melhor,
        );
    const origem: "declarado" | "inferido" | "heuristica" = declarado
        ? "declarado"
        : inferido
          ? "inferido"
          : "heuristica";
    const refTrilha = refDaProxima(escolhido);

    let proximaTrilha = null;
    if (refTrilha) {
        const [t] = await db
            .select({ id: trails.id, name: trails.name, level: trails.trailLevel })
            .from(trails)
            .where(eq(trails.id, refTrilha.refId));
        proximaTrilha = t ?? null;
    }
    // Quando a trilha vive em mais de um roadmap e a escolha não foi declarada
    // pelo aluno, a tela precisa saber para oferecer a troca em vez de afirmar.
    return {
        roadmap: { slug: escolhido.slug, name: escolhido.name },
        proximaTrilha,
        origem,
        outrosRoadmaps: elegiveis
            .filter((d) => d.id !== escolhido.id)
            .map((d) => ({ slug: d.slug, name: d.name })),
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
export async function concluirEstagio(stageId: string, userId: string) {
    const [etapa] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, stageId));
    if (!etapa) throw new AppError(404, "Estágio não encontrado");
    await db.insert(roadmapStageCompletions).values({ stageId, userId }).onConflictDoNothing();

    // As trilhas e módulos do estágio também ficam concluídos: progresso manual, sem XP.
    const refs = await db
        .select()
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.stageId, stageId));
    const trailIds = refs.filter((r) => r.refType === "trail").map((r) => r.refId);
    const moduleIds = refs.filter((r) => r.refType === "module").map((r) => r.refId);
    const aulasAlvo = [
        ...(trailIds.length
            ? await db
                  .select({ id: lessons.id })
                  .from(lessons)
                  .where(and(inArray(lessons.trailId, trailIds), eq(lessons.published, true)))
            : []),
        ...(moduleIds.length
            ? await db
                  .select({ id: lessons.id })
                  .from(lessons)
                  .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.published, true)))
            : []),
    ];
    if (aulasAlvo.length) {
        await db
            .insert(lessonProgress)
            .values(aulasAlvo.map((a) => ({ userId, lessonId: a.id, manual: true })))
            .onConflictDoNothing();
    }
    return { ok: true };
}

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
    const info = await resolverRefs(
        refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })),
    );

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
    const [existe] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.slug, slug));
    if (existe) throw new AppError(409, "Já existe um roadmap com esse slug");

    let position = dados.position;
    if (position === undefined) {
        const [ult] = await db
            .select({ p: roadmaps.position })
            .from(roadmaps)
            .orderBy(desc(roadmaps.position))
            .limit(1);
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
        const [outro] = await db
            .select({ id: roadmaps.id })
            .from(roadmaps)
            .where(eq(roadmaps.slug, s));
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
    const [rm] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.id, roadmapId));
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
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "Estágio não encontrado");

    const sets: Partial<typeof roadmapStages.$inferInsert> = {};
    if (dados.phase !== undefined) sets.phase = dados.phase;
    if (dados.title !== undefined) sets.title = dados.title;
    if (dados.description !== undefined) sets.description = dados.description;
    if (dados.tags !== undefined) sets.tags = dados.tags;
    if (dados.position !== undefined) sets.position = dados.position;
    if (Object.keys(sets).length === 0) throw new AppError(400, "Nada para atualizar");

    const [atualizado] = await db
        .update(roadmapStages)
        .set(sets)
        .where(eq(roadmapStages.id, id))
        .returning();
    return atualizado;
}

export async function excluirEstagio(id: string) {
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "Estágio não encontrado");
    await db.transaction(async (tx) => {
        await tx.delete(roadmapStageRefs).where(eq(roadmapStageRefs.stageId, id));
        await tx.delete(roadmapStages).where(eq(roadmapStages.id, id));
    });
}

export async function adicionarRef(stageId: string, dados: DadosCriarRef) {
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, stageId));
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
    const [ref] = await db
        .select({ id: roadmapStageRefs.id })
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.id, id));
    if (!ref) throw new AppError(404, "Referência não encontrada");
    await db.delete(roadmapStageRefs).where(eq(roadmapStageRefs.id, id));
}
