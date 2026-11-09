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
type RoadmapStatus = "nao_iniciado" | "em_progresso" | "concluido";

interface Completion {
    lessons: Set<string>;
    simulados: Set<string>;
    desafios: Set<string>;
}

const NO_COMPLETION: Completion = {
    lessons: new Set(),
    simulados: new Set(),
    desafios: new Set(),
};

// The user's completion signals, loaded once. A solved challenge = a submission with
// status "passed" (not xpEarned, which is specific to the challenge of the day).
async function loadCompletion(userId: string): Promise<Completion> {
    const [lessonDone, examRows, challengeRows] = await Promise.all([
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
        lessons: new Set(lessonDone.map((r) => r.id)),
        simulados: new Set(examRows.map((r) => r.id)),
        desafios: new Set(challengeRows.map((r) => r.id)),
    };
}

type ContainerLesson = { id: string; language: string | null };

// Published lessons per referenced track and module (to derive container completion).
async function loadContainerLessons(trailIds: string[], moduleIds: string[]) {
    const byTrail = new Map<string, ContainerLesson[]>();
    const byModule = new Map<string, ContainerLesson[]>();
    if (trailIds.length) {
        const rows = await db
            .select({ trailId: lessons.trailId, id: lessons.id, language: lessons.language })
            .from(lessons)
            .where(and(inArray(lessons.trailId, trailIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = byTrail.get(r.trailId) ?? [];
            arr.push({ id: r.id, language: r.language });
            byTrail.set(r.trailId, arr);
        }
    }
    if (moduleIds.length) {
        const rows = await db
            .select({ moduleId: lessons.moduleId, id: lessons.id, language: lessons.language })
            .from(lessons)
            .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.published, true)));
        for (const r of rows) {
            const arr = byModule.get(r.moduleId) ?? [];
            arr.push({ id: r.id, language: r.language });
            byModule.set(r.moduleId, arr);
        }
    }
    return { porTrail: byTrail, porModule: byModule };
}

// Multi-language: completed = every neutral lesson + every lesson of some language.
function isContainerCompleted(lessonRows: ContainerLesson[], c: Completion): boolean {
    if (!lessonRows.length) return false;
    const languages = [
        ...new Set(lessonRows.map((l) => l.language).filter((x): x is string => !!x)),
    ];
    if (!languages.length) return lessonRows.every((l) => c.lessons.has(l.id));
    if (!lessonRows.filter((l) => l.language === null).every((l) => c.lessons.has(l.id)))
        return false;
    return languages.some((lang) =>
        lessonRows.filter((l) => l.language === lang).every((l) => c.lessons.has(l.id)),
    );
}

function isRefCompleted(
    refType: RefType,
    refId: string,
    c: Completion,
    containerLessons: {
        porTrail: Map<string, ContainerLesson[]>;
        porModule: Map<string, ContainerLesson[]>;
    },
): boolean {
    switch (refType) {
        case "lesson":
            return c.lessons.has(refId);
        case "simulado":
            return c.simulados.has(refId);
        case "challenge":
            return c.desafios.has(refId);
        case "trail":
            return isContainerCompleted(containerLessons.porTrail.get(refId) ?? [], c);
        case "module":
            return isContainerCompleted(containerLessons.porModule.get(refId) ?? [], c);
    }
}

function statusFromProgress(done: number, total: number): RoadmapStatus {
    if (total === 0 || done === 0) return "nao_iniciado";
    if (done >= total) return "concluido";
    return "em_progresso";
}

// Resolves each ref into display data (title + what the frontend needs to route).
async function resolveRefs(refs: { refType: RefType; refId: string }[]) {
    const idsOf = (t: RefType) => [
        ...new Set(refs.filter((r) => r.refType === t).map((r) => r.refId)),
    ];
    const [trailRows, moduleRows, lessonRows, examRows, challengeRows] = await Promise.all([
        idsOf("trail").length
            ? db
                  .select({ id: trails.id, name: trails.name })
                  .from(trails)
                  .where(inArray(trails.id, idsOf("trail")))
            : Promise.resolve([] as { id: string; name: string }[]),
        idsOf("module").length
            ? db
                  .select({ id: modules.id, title: modules.title, trailId: modules.trailId })
                  .from(modules)
                  .where(inArray(modules.id, idsOf("module")))
            : Promise.resolve([] as { id: string; title: string; trailId: string }[]),
        idsOf("lesson").length
            ? db
                  .select({ id: lessons.id, title: lessons.title, trailId: lessons.trailId })
                  .from(lessons)
                  .where(inArray(lessons.id, idsOf("lesson")))
            : Promise.resolve([] as { id: string; title: string; trailId: string }[]),
        idsOf("simulado").length
            ? db
                  .select({ id: simulados.id, name: simulados.name, slug: simulados.slug })
                  .from(simulados)
                  .where(inArray(simulados.id, idsOf("simulado")))
            : Promise.resolve([] as { id: string; name: string; slug: string }[]),
        idsOf("challenge").length
            ? db
                  .select({ id: challenges.id, title: challenges.title, number: challenges.number })
                  .from(challenges)
                  .where(inArray(challenges.id, idsOf("challenge")))
            : Promise.resolve([] as { id: string; title: string; number: number | null }[]),
    ]);
    const info = new Map<string, Record<string, unknown>>();
    for (const r of trailRows) info.set("trail:" + r.id, { title: r.name, trailId: r.id });
    for (const r of moduleRows) info.set("module:" + r.id, { title: r.title, trailId: r.trailId });
    for (const r of lessonRows)
        info.set("lesson:" + r.id, { title: r.title, trailId: r.trailId, lessonId: r.id });
    for (const r of examRows) info.set("simulado:" + r.id, { title: r.name, slug: r.slug });
    for (const r of challengeRows)
        info.set("challenge:" + r.id, { title: r.title, number: r.number });
    return info;
}

async function manuallyCompletedStages(userId: string) {
    const rows = await db
        .select({ stageId: roadmapStageCompletions.stageId })
        .from(roadmapStageCompletions)
        .where(eq(roadmapStageCompletions.userId, userId));
    return new Set(rows.map((r) => r.stageId));
}

export async function findRoadmaps(userId?: string) {
    const roadmapRows = await db
        .select()
        .from(roadmaps)
        .where(eq(roadmaps.published, true))
        .orderBy(asc(roadmaps.position));
    if (roadmapRows.length === 0) return [];

    const ids = roadmapRows.map((r) => r.id);
    const stageRows = await db
        .select()
        .from(roadmapStages)
        .where(inArray(roadmapStages.roadmapId, ids))
        .orderBy(asc(roadmapStages.position));
    const stageIds = stageRows.map((e) => e.id);
    const refs = stageIds.length
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, stageIds))
        : [];

    let completion = NO_COMPLETION;
    let manualStages = new Set<string>();
    let containerLessons = {
        porTrail: new Map<string, ContainerLesson[]>(),
        porModule: new Map<string, ContainerLesson[]>(),
    };
    if (userId) {
        completion = await loadCompletion(userId);
        manualStages = await manuallyCompletedStages(userId);
        containerLessons = await loadContainerLessons(
            refs.filter((r) => r.refType === "trail").map((r) => r.refId),
            refs.filter((r) => r.refType === "module").map((r) => r.refId),
        );
    }

    const refsByStage = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsByStage.get(r.stageId) ?? [];
        arr.push(r);
        refsByStage.set(r.stageId, arr);
    }
    const isStageCompleted = (stageId: string) => {
        if (manualStages.has(stageId)) return true;
        const rs = refsByStage.get(stageId) ?? [];
        return (
            rs.length > 0 &&
            rs.every((r) =>
                isRefCompleted(r.refType as RefType, r.refId, completion, containerLessons),
            )
        );
    };

    return roadmapRows.map((r) => {
        const ownStages = stageRows.filter((e) => e.roadmapId === r.id);
        const total = ownStages.length;
        const done = userId ? ownStages.filter((e) => isStageCompleted(e.id)).length : 0;
        const tags = [...new Set(ownStages.flatMap((e) => e.tags ?? []))].slice(0, 3);
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
            stagesDone: done,
            percent: total ? Math.round((done / total) * 100) : 0,
            status: statusFromProgress(done, total),
        };
    });
}

export async function findRoadmapBySlug(slug: string, userId?: string) {
    const [roadmap] = await db
        .select()
        .from(roadmaps)
        .where(and(eq(roadmaps.slug, slug), eq(roadmaps.published, true)));
    if (!roadmap) return null;

    const stageRows = await db
        .select()
        .from(roadmapStages)
        .where(eq(roadmapStages.roadmapId, roadmap.id))
        .orderBy(asc(roadmapStages.position));
    const stageIds = stageRows.map((e) => e.id);
    const refs = stageIds.length
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, stageIds))
              .orderBy(asc(roadmapStageRefs.position))
        : [];

    let completion = NO_COMPLETION;
    let manualStages = new Set<string>();
    let containerLessons = {
        porTrail: new Map<string, ContainerLesson[]>(),
        porModule: new Map<string, ContainerLesson[]>(),
    };
    if (userId) {
        completion = await loadCompletion(userId);
        manualStages = await manuallyCompletedStages(userId);
        containerLessons = await loadContainerLessons(
            refs.filter((r) => r.refType === "trail").map((r) => r.refId),
            refs.filter((r) => r.refType === "module").map((r) => r.refId),
        );
    }
    const refInfo = await resolveRefs(
        refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })),
    );

    const refsByStage = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsByStage.get(r.stageId) ?? [];
        arr.push(r);
        refsByStage.set(r.stageId, arr);
    }

    const outputStages = stageRows.map((e) => {
        const rs = refsByStage.get(e.id) ?? [];
        const completed =
            (userId && manualStages.has(e.id)) ||
            (userId &&
                rs.length > 0 &&
                rs.every((r) =>
                    isRefCompleted(r.refType as RefType, r.refId, completion, containerLessons),
                ));
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
                ...(refInfo.get(r.refType + ":" + r.refId) ?? { title: null }),
            })),
        };
    });

    // Sequential lock: a stage stays locked until the previous one is completed. The first never is.
    let previousCompleted = true;
    const withLocks = outputStages.map((e) => {
        const locked = userId ? !previousCompleted : false;
        previousCompleted = e.completed;
        return { ...e, locked };
    });

    const done = withLocks.filter((e) => e.completed).length;
    const total = withLocks.length;
    const current = withLocks.find((e) => !e.completed && !e.locked);

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
            stagesDone: done,
            percent: total ? Math.round((done / total) * 100) : 0,
            status: statusFromProgress(done, total),
        },
        currentStageId: current?.id ?? null,
        // The screen needs to know, so it does not offer "follow" to whoever already follows.
        seguindo: userId ? await isFollowing(userId, roadmap.id) : false,
        stages: withLocks,
    };
}

async function isFollowing(userId: string, roadmapId: string) {
    const [existingFollow] = await db
        .select({ id: userRoadmaps.id })
        .from(userRoadmaps)
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
    return !!existingFollow;
}

// ============ Which roadmap the student follows ============

/**
 * Marks that the student follows this roadmap. `explicit` tells their choice (the
 * follow button) apart from the inference made from progress: an explicit choice is
 * never downgraded by a later inference.
 */
export async function saveFollow(userId: string, roadmapId: string, explicit = true) {
    const [existingFollow] = await db
        .select()
        .from(userRoadmaps)
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
    if (existingFollow) {
        await db
            .update(userRoadmaps)
            .set({ lastSeenAt: new Date(), explicito: existingFollow.explicito || explicit })
            .where(eq(userRoadmaps.id, existingFollow.id));
        return;
    }
    await db.insert(userRoadmaps).values({ userId, roadmapId, explicito: explicit });
}

/**
 * The student entered a track FROM this roadmap's screen. It is the strongest signal
 * there is about which path they follow, because it is not a deduction: they clicked
 * there.
 *
 * Creates the link if there is none and always refreshes the recency. It stays as
 * inferred, not explicit, because entering a track is an act of studying and not a
 * declared choice of path; the student can still switch on the screen. The difference
 * from the inference by progress is that there is no guessing here at all.
 */
export async function saveEntryFromRoadmap(userId: string, roadmapId: string) {
    const [existingFollow] = await db
        .select()
        .from(userRoadmaps)
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
    if (existingFollow) {
        await db
            .update(userRoadmaps)
            .set({ lastSeenAt: new Date() })
            .where(eq(userRoadmaps.id, existingFollow.id));
        return;
    }
    await db.insert(userRoadmaps).values({ userId, roadmapId, explicito: false });
}

/**
 * Opening the roadmap detail refreshes the recency of whoever already follows. It does
 * NOT create a link: peeking at a roadmap cannot make the app think the student changed
 * paths, or curiosity would become a declaration.
 */
export async function saveVisit(userId: string, roadmapId: string) {
    await db
        .update(userRoadmaps)
        .set({ lastSeenAt: new Date() })
        .where(and(eq(userRoadmaps.userId, userId), eq(userRoadmaps.roadmapId, roadmapId)));
}

/**
 * How many published roadmaps contain each track. It is the weight of the inference: a
 * track that is in almost every roadmap (Programming Logic, in seven) tells almost
 * nothing; a track exclusive to one path decides on its own.
 */
async function roadmapCountByTrail(trailIds: string[]): Promise<Map<string, number>> {
    if (!trailIds.length) return new Map();
    const rows = await db
        .select({ trailId: roadmapStageRefs.refId, n: countDistinct(roadmapStages.roadmapId) })
        .from(roadmapStageRefs)
        .innerJoin(roadmapStages, eq(roadmapStages.id, roadmapStageRefs.stageId))
        .where(
            and(eq(roadmapStageRefs.refType, "trail"), inArray(roadmapStageRefs.refId, trailIds)),
        )
        .groupBy(roadmapStageRefs.refId);
    return new Map(rows.map((l) => [l.trailId, Number(l.n)]));
}

type RoadmapDetail = NonNullable<Awaited<ReturnType<typeof findRoadmapBySlug>>>;

/**
 * Guesses the roadmap from progress, when the student has not declared any.
 *
 * Two signals, in this order. The continuous prefix (how many stages in a row, from
 * the first one, they completed) captures the SEQUENCE they have been following, and
 * it is what separates cases that volume does not: whoever did Logic, Python and SQL
 * has prefix 3 in Data Engineering and 2 in Data Science, because they skipped
 * Statistics. The exclusivity weight breaks ties.
 *
 * Returns null on a tie, on purpose: better to ask than to pin down a wrong path.
 * Measured against the production database, it decides 112 of the 489 students with
 * progress; the rest only touched shared tracks and genuinely have not revealed any
 * path yet.
 */
async function inferRoadmap(
    userId: string,
    details: RoadmapDetail[],
): Promise<RoadmapDetail | null> {
    // Counts TOUCHED tracks (at least one lesson done), not completed ones. Whoever is
    // on the tenth Python lesson has already revealed the path; requiring all 35 delays
    // the answer until after it stops being useful. Measured on the database: with
    // "completed" the inference decides 16 students, with "touched" it decides 112.
    const touchedTrails = new Set(
        (
            await db
                .selectDistinct({ trailId: lessons.trailId })
                .from(lessonProgress)
                .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
                .where(eq(lessonProgress.userId, userId))
        ).map((r) => r.trailId),
    );

    const touches = (s: RoadmapDetail["stages"][number]) =>
        s.refs.some((r) => r.refType === "trail" && touchedTrails.has(r.refId));

    const weights = await roadmapCountByTrail([...touchedTrails]);

    const scored = details.map((d) => {
        let prefix = 0;
        for (const s of d.stages) {
            if (!touches(s)) break;
            prefix++;
        }
        let points = 0;
        for (const s of d.stages)
            for (const r of s.refs)
                if (r.refType === "trail" && touchedTrails.has(r.refId))
                    points += 1 / (weights.get(r.refId) ?? 1);
        return { d, prefixo: prefix, pontos: points };
    });

    const best = scored.reduce((a, b) =>
        b.prefixo !== a.prefixo ? (b.prefixo > a.prefixo ? b : a) : b.pontos > a.pontos ? b : a,
    );
    const tied = scored.filter(
        (p) => p.prefixo === best.prefixo && Math.abs(p.pontos - best.pontos) < 1e-9,
    );
    return tied.length === 1 ? best.d : null;
}

// After completing a track: which roadmap it lives in and what that roadmap's next
// track is. With the track in more than one roadmap the choice follows this order:
// what the student declared to follow, then the inference by progress and, if both
// fail, the old heuristic of the most completed stages. `origem` says which one
// decided, so the screen can offer a switch instead of faking certainty. It only
// offers an unlocked stage; at the end of the roadmap (or with no eligible stage),
// proximaTrilha comes back null.
export async function findNextTrailAfterCompletion(userId: string, trailId: string) {
    const candidates = await db
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
    if (!candidates.length) return { roadmap: null, proximaTrilha: null };

    const details: NonNullable<Awaited<ReturnType<typeof findRoadmapBySlug>>>[] = [];
    for (const c of [...candidates].sort((a, b) => a.position - b.position)) {
        const d = await findRoadmapBySlug(c.slug, userId);
        if (d) details.push(d);
    }
    if (!details.length) return { roadmap: null, proximaTrilha: null };

    // Each roadmap's next eligible stage: after this track's stage, unlocked, not
    // completed and with a track to point to.
    const nextTrailRef = (d: (typeof details)[number]) => {
        const idx = d.stages.findIndex((s) =>
            s.refs.some((r) => r.refType === "trail" && r.refId === trailId),
        );
        if (idx < 0) return null;
        const foundStage = d.stages
            .slice(idx + 1)
            .find((s) => !s.completed && !s.locked && s.refs.some((r) => r.refType === "trail"));
        return foundStage?.refs.find((r) => r.refType === "trail") ?? null;
    };

    // Prefers a roadmap that has something to offer; among them (and in the fallback
    // with no offer), the one chosen in order: declared, inferred, heuristic.
    const withNext = details.filter((d) => nextTrailRef(d) !== null);
    const eligible = withNext.length ? withNext : details;

    // 1. What the student declared to follow. An explicit choice comes before an
    // inferred one, and between equals the most recent wins.
    const follows = await db
        .select()
        .from(userRoadmaps)
        .where(
            and(
                eq(userRoadmaps.userId, userId),
                inArray(
                    userRoadmaps.roadmapId,
                    eligible.map((d) => d.id),
                ),
            ),
        );
    follows.sort(
        (a, b) =>
            Number(b.explicito) - Number(a.explicito) ||
            b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
    );
    // The link counts for choosing, but ONLY an explicit one becomes certainty. An
    // inferred link is still a guess: presenting it as declared hides the option to
    // switch on the screen, and the student gets stuck on a path they never chose.
    // That is exactly what happened after the backfill.
    const followed = follows.length
        ? (eligible.find((d) => d.id === follows[0].roadmapId) ?? null)
        : null;
    const declared = followed && follows[0].explicito ? followed : null;

    // 2. Inference by progress. 3. The old heuristic, which gets ties wrong but is
    // better than suggesting nothing.
    const inferred = declared ? null : (followed ?? (await inferRoadmap(userId, eligible)));
    const chosen =
        declared ??
        inferred ??
        eligible.reduce((best, d) => (d.progress.stagesDone > best.progress.stagesDone ? d : best));
    const source: "declarado" | "inferido" | "heuristica" = declared
        ? "declarado"
        : inferred
          ? "inferido"
          : "heuristica";
    const trailRef = nextTrailRef(chosen);

    let nextTrail = null;
    if (trailRef) {
        const [t] = await db
            .select({ id: trails.id, name: trails.name, level: trails.trailLevel })
            .from(trails)
            .where(eq(trails.id, trailRef.refId));
        nextTrail = t ?? null;
    }
    // When the track lives in more than one roadmap and the choice was not declared
    // by the student, the screen needs to know so it offers a switch instead of asserting.
    return {
        roadmap: { slug: chosen.slug, name: chosen.name },
        proximaTrilha: nextTrail,
        origem: source,
        outrosRoadmaps: eligible
            .filter((d) => d.id !== chosen.id)
            .map((d) => ({ slug: d.slug, name: d.name })),
    };
}

// ============================ CRUD (admin) ============================

type CreateRoadmapData = z.infer<typeof createRoadmapSchema>;
type UpdateRoadmapData = z.infer<typeof updateRoadmapSchema>;
type CreateStageData = z.infer<typeof createStageSchema>;
type UpdateStageData = z.infer<typeof updateStageSchema>;
type CreateRefData = z.infer<typeof createRefSchema>;

function slugify(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Manual stage completion: the stage counts as done for the student.
export async function saveStageCompletion(stageId: string, userId: string) {
    const [foundStage] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, stageId));
    if (!foundStage) throw new AppError(404, "roadmap.stageNotFound");
    await db.insert(roadmapStageCompletions).values({ stageId, userId }).onConflictDoNothing();

    // The stage's tracks and modules are completed too: manual progress, no XP.
    const refs = await db
        .select()
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.stageId, stageId));
    const trailIds = refs.filter((r) => r.refType === "trail").map((r) => r.refId);
    const moduleIds = refs.filter((r) => r.refType === "module").map((r) => r.refId);
    const targetLessons = [
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
    if (targetLessons.length) {
        await db
            .insert(lessonProgress)
            .values(targetLessons.map((a) => ({ userId, lessonId: a.id, manual: true })))
            .onConflictDoNothing();
    }
    return { ok: true };
}

// List for the admin: every roadmap (drafts included), with the stage count.
export async function findRoadmapsForStudio() {
    const roadmapRows = await db.select().from(roadmaps).orderBy(asc(roadmaps.position));
    const stageCounts = await db
        .select({ roadmapId: roadmapStages.roadmapId, n: count() })
        .from(roadmapStages)
        .groupBy(roadmapStages.roadmapId);
    const byId = new Map(stageCounts.map((c) => [c.roadmapId, Number(c.n)]));
    return roadmapRows.map((r) => ({ ...r, stagesTotal: byId.get(r.id) ?? 0 }));
}

// Raw structure of a roadmap for editing in the studio (by id, without student progress).
export async function findStudioRoadmap(id: string) {
    const [roadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, id));
    if (!roadmap) throw new AppError(404, "roadmap.notFound");

    const stageRows = await db
        .select()
        .from(roadmapStages)
        .where(eq(roadmapStages.roadmapId, id))
        .orderBy(asc(roadmapStages.position));
    const stageIds = stageRows.map((e) => e.id);
    const refs = stageIds.length
        ? await db
              .select()
              .from(roadmapStageRefs)
              .where(inArray(roadmapStageRefs.stageId, stageIds))
              .orderBy(asc(roadmapStageRefs.position))
        : [];
    const info = await resolveRefs(
        refs.map((r) => ({ refType: r.refType as RefType, refId: r.refId })),
    );

    const refsByStage = new Map<string, typeof refs>();
    for (const r of refs) {
        const arr = refsByStage.get(r.stageId) ?? [];
        arr.push(r);
        refsByStage.set(r.stageId, arr);
    }

    return {
        ...roadmap,
        stages: stageRows.map((e) => ({
            id: e.id,
            phase: e.phase,
            title: e.title,
            description: e.description,
            tags: e.tags ?? [],
            position: e.position,
            refs: (refsByStage.get(e.id) ?? []).map((r) => ({
                id: r.id,
                refType: r.refType,
                refId: r.refId,
                position: r.position,
                ...(info.get(r.refType + ":" + r.refId) ?? { title: null }),
            })),
        })),
    };
}

export async function insertRoadmap(data: CreateRoadmapData) {
    const slug = (data.slug?.trim() || slugify(data.name)).slice(0, 80);
    if (!slug) throw new AppError(400, "common.slugFromNameFailed");
    const [existing] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.slug, slug));
    if (existing) throw new AppError(409, "roadmap.slugTaken");

    let position = data.position;
    if (position === undefined) {
        const [last] = await db
            .select({ p: roadmaps.position })
            .from(roadmaps)
            .orderBy(desc(roadmaps.position))
            .limit(1);
        position = last ? last.p + 1 : 1;
    }
    const [rm] = await db
        .insert(roadmaps)
        .values({
            slug,
            name: data.name,
            description: data.description,
            level: data.level,
            icon: data.icon ?? null,
            position,
            premium: data.premium ?? false,
            published: data.published ?? false,
        })
        .returning();
    return rm;
}

export async function editRoadmap(id: string, data: UpdateRoadmapData) {
    const [rm] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.id, id));
    if (!rm) throw new AppError(404, "roadmap.notFound");

    const sets: Partial<typeof roadmaps.$inferInsert> = {};
    if (data.slug !== undefined) {
        const s = data.slug.trim();
        const [other] = await db
            .select({ id: roadmaps.id })
            .from(roadmaps)
            .where(eq(roadmaps.slug, s));
        if (other && other.id !== id) throw new AppError(409, "roadmap.slugTaken");
        sets.slug = s;
    }
    if (data.name !== undefined) sets.name = data.name;
    if (data.description !== undefined) sets.description = data.description;
    if (data.level !== undefined) sets.level = data.level;
    if (data.icon !== undefined) sets.icon = data.icon;
    if (data.position !== undefined) sets.position = data.position;
    if (data.premium !== undefined) sets.premium = data.premium;
    if (data.published !== undefined) sets.published = data.published;
    if (Object.keys(sets).length === 0) throw new AppError(400, "common.nothingToUpdate");

    const [updated] = await db.update(roadmaps).set(sets).where(eq(roadmaps.id, id)).returning();
    return updated;
}

export async function removeRoadmap(id: string) {
    const [rm] = await db.select({ id: roadmaps.id }).from(roadmaps).where(eq(roadmaps.id, id));
    if (!rm) throw new AppError(404, "roadmap.notFound");
    await db.transaction(async (tx) => {
        const stageRows = await tx
            .select({ id: roadmapStages.id })
            .from(roadmapStages)
            .where(eq(roadmapStages.roadmapId, id));
        const ids = stageRows.map((e) => e.id);
        if (ids.length) {
            await tx.delete(roadmapStageRefs).where(inArray(roadmapStageRefs.stageId, ids));
            await tx.delete(roadmapStages).where(inArray(roadmapStages.id, ids));
        }
        await tx.delete(roadmaps).where(eq(roadmaps.id, id));
    });
}

export async function insertStage(roadmapId: string, data: CreateStageData) {
    const [rm] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.id, roadmapId));
    if (!rm) throw new AppError(404, "roadmap.notFound");

    let position = data.position;
    if (position === undefined) {
        const [last] = await db
            .select({ p: roadmapStages.position })
            .from(roadmapStages)
            .where(eq(roadmapStages.roadmapId, roadmapId))
            .orderBy(desc(roadmapStages.position))
            .limit(1);
        position = last ? last.p + 1 : 1;
    }
    const [stage] = await db
        .insert(roadmapStages)
        .values({
            roadmapId,
            phase: data.phase,
            title: data.title,
            description: data.description,
            tags: data.tags ?? [],
            position,
        })
        .returning();
    return stage;
}

export async function editStage(id: string, data: UpdateStageData) {
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "roadmap.stageNotFound");

    const sets: Partial<typeof roadmapStages.$inferInsert> = {};
    if (data.phase !== undefined) sets.phase = data.phase;
    if (data.title !== undefined) sets.title = data.title;
    if (data.description !== undefined) sets.description = data.description;
    if (data.tags !== undefined) sets.tags = data.tags;
    if (data.position !== undefined) sets.position = data.position;
    if (Object.keys(sets).length === 0) throw new AppError(400, "common.nothingToUpdate");

    const [updated] = await db
        .update(roadmapStages)
        .set(sets)
        .where(eq(roadmapStages.id, id))
        .returning();
    return updated;
}

export async function removeStage(id: string) {
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, id));
    if (!st) throw new AppError(404, "roadmap.stageNotFound");
    await db.transaction(async (tx) => {
        await tx.delete(roadmapStageRefs).where(eq(roadmapStageRefs.stageId, id));
        await tx.delete(roadmapStages).where(eq(roadmapStages.id, id));
    });
}

export async function insertStageRef(stageId: string, data: CreateRefData) {
    const [st] = await db
        .select({ id: roadmapStages.id })
        .from(roadmapStages)
        .where(eq(roadmapStages.id, stageId));
    if (!st) throw new AppError(404, "roadmap.stageNotFound");

    // Checks that the referenced content exists, so it never creates a dangling ref.
    const info = await resolveRefs([{ refType: data.refType, refId: data.refId }]);
    if (!info.has(data.refType + ":" + data.refId)) {
        throw new AppError(400, "roadmap.refContentMissing");
    }

    let position = data.position;
    if (position === undefined) {
        const [last] = await db
            .select({ p: roadmapStageRefs.position })
            .from(roadmapStageRefs)
            .where(eq(roadmapStageRefs.stageId, stageId))
            .orderBy(desc(roadmapStageRefs.position))
            .limit(1);
        position = last ? last.p + 1 : 1;
    }
    const [ref] = await db
        .insert(roadmapStageRefs)
        .values({ stageId, refType: data.refType, refId: data.refId, position })
        .returning();
    return { ...ref, ...(info.get(data.refType + ":" + data.refId) ?? {}) };
}

export async function removeStageRef(id: string) {
    const [ref] = await db
        .select({ id: roadmapStageRefs.id })
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.id, id));
    if (!ref) throw new AppError(404, "roadmap.refNotFound");
    await db.delete(roadmapStageRefs).where(eq(roadmapStageRefs.id, id));
}
