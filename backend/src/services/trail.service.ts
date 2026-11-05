import { db } from "../../db.ts";
import {
    trails,
    trailTags,
    tags,
    modules,
    lessons,
    lessonProgress,
    questions,
    questionOptions,
    questionAnswers,
    roadmaps,
    roadmapStages,
    roadmapStageRefs,
    trailReviews,
    users,
} from "../../schema.ts";
import { eq, asc, desc, countDistinct, inArray, and, isNotNull } from "drizzle-orm";
import type { z } from "zod";
import type { createTrailSchema, updateTrailSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { ehAdmin } from "./usuario.service.ts";

type NewTrailData = z.infer<typeof createTrailSchema>;
type TrailUpdateData = z.infer<typeof updateTrailSchema>;

export async function insertTrail(data: NewTrailData) {
    const [trail] = await db
        .insert(trails)
        .values({
            name: data.name,
            trailLevel: data.level,
            description: data.description,
            workloadHours: data.workloadHours ?? null,
        })
        .returning();
    if (data.tagIds?.length) {
        await db
            .insert(trailTags)
            .values(data.tagIds.map((tagId) => ({ trailId: trail.id, tagId })))
            .onConflictDoNothing();
    }
    return trail;
}

// Edits the track data (admin).
export async function editTrail(trailId: string, data: TrailUpdateData) {
    const sets: {
        name?: string;
        trailLevel?: "iniciante" | "intermediario" | "avancado";
        description?: string;
        workloadHours?: number | null;
    } = {};
    if (data.name !== undefined) sets.name = data.name;
    if (data.level !== undefined) sets.trailLevel = data.level;
    if (data.description !== undefined) sets.description = data.description;
    if (data.workloadHours !== undefined) sets.workloadHours = data.workloadHours;
    if (Object.keys(sets).length === 0) {
        throw new AppError(400, "common.nothingToUpdate");
    }

    const [trail] = await db.update(trails).set(sets).where(eq(trails.id, trailId)).returning({
        id: trails.id,
        name: trails.name,
        trailLevel: trails.trailLevel,
        description: trails.description,
        workloadHours: trails.workloadHours,
    });
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }

    if (data.tagIds !== undefined) {
        await db.delete(trailTags).where(eq(trailTags.trailId, trailId));
        if (data.tagIds.length) {
            await db
                .insert(trailTags)
                .values(data.tagIds.map((tagId) => ({ trailId, tagId })))
                .onConflictDoNothing();
        }
    }
    return trail;
}

// Deletes the whole track (modules, lessons, questions and progress).
export async function removeTrail(trailId: string) {
    const [trail] = await db
        .select({ id: trails.id })
        .from(trails)
        .where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }

    await db.transaction(async (tx) => {
        const ls = await tx
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.trailId, trailId));
        const lessonIds = ls.map((l) => l.id);
        if (lessonIds.length) {
            const qs = await tx
                .select({ id: questions.id })
                .from(questions)
                .where(inArray(questions.lessonId, lessonIds));
            const qIds = qs.map((q) => q.id);
            if (qIds.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
                await tx.delete(questions).where(inArray(questions.id, qIds));
            }
            await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
            await tx.delete(lessons).where(inArray(lessons.id, lessonIds));
        }
        await tx.delete(modules).where(eq(modules.trailId, trailId));
        await tx.delete(trailTags).where(eq(trailTags.trailId, trailId));
        await tx.delete(trails).where(eq(trails.id, trailId));
    });
}

const VALID_LEVELS = new Set(["iniciante", "intermediario", "avancado"]);

export async function findTrails(filters: { level?: string; categoria?: string } = {}) {
    const levelFilter =
        filters.level && VALID_LEVELS.has(filters.level)
            ? eq(trails.trailLevel, filters.level as "iniciante" | "intermediario" | "avancado")
            : undefined;
    const categoryFilter = filters.categoria
        ? inArray(
              trails.id,
              db
                  .select({ id: trailTags.trailId })
                  .from(trailTags)
                  .innerJoin(tags, eq(tags.id, trailTags.tagId))
                  .where(eq(tags.name, filters.categoria)),
          )
        : undefined;
    const trailRows = await db
        .select({
            id: trails.id,
            name: trails.name,
            trailLevel: trails.trailLevel,
            description: trails.description,
            workloadHours: trails.workloadHours,
        })
        .from(trails)
        .where(and(levelFilter, categoryFilter));

    // What a student actually takes: published lessons, the neutral ones + the largest language.
    const publishedLessons = await db
        .select({ trailId: lessons.trailId, language: lessons.language })
        .from(lessons)
        .where(eq(lessons.published, true));
    const countsByTrail = new Map<string, { neutras: number; porLang: Map<string, number> }>();
    for (const a of publishedLessons) {
        const c = countsByTrail.get(a.trailId) ?? {
            neutras: 0,
            porLang: new Map<string, number>(),
        };
        if (a.language === null) c.neutras++;
        else c.porLang.set(a.language, (c.porLang.get(a.language) ?? 0) + 1);
        countsByTrail.set(a.trailId, c);
    }
    const totalLessonsOf = (trailId: string) => {
        const c = countsByTrail.get(trailId);
        if (!c) return 0;
        const largestLanguage = c.porLang.size > 0 ? Math.max(...c.porLang.values()) : 0;
        return c.neutras + largestLanguage;
    };

    const tagLinks = await db
        .select({ trailId: trailTags.trailId, id: tags.id, name: tags.name })
        .from(trailTags)
        .innerJoin(tags, eq(tags.id, trailTags.tagId));
    const tagsByTrail = new Map<string, { id: string; name: string }[]>();
    for (const v of tagLinks) {
        const arr = tagsByTrail.get(v.trailId) ?? [];
        arr.push({ id: v.id, name: v.name });
        tagsByTrail.set(v.trailId, arr);
    }
    return trailRows.map((t) => ({
        ...t,
        totalLessons: totalLessonsOf(t.id),
        tags: tagsByTrail.get(t.id) ?? [],
    }));
}

// Tracks where the user already has progress, with the completion percentage.
// In a multi-language track the percentage is the best path's (neutral + one language),
// the same measure as the roadmap and the certificate completion.
export async function findUserTrails(userId: string) {
    const lessonRows = await db
        .select({ id: lessons.id, trailId: lessons.trailId, language: lessons.language })
        .from(lessons)
        .where(eq(lessons.published, true));
    const completedIds = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    const byTrail = new Map<string, { neutras: string[]; porLang: Map<string, string[]> }>();
    for (const a of lessonRows) {
        const group = byTrail.get(a.trailId) ?? {
            neutras: [] as string[],
            porLang: new Map<string, string[]>(),
        };
        if (a.language === null) {
            group.neutras.push(a.id);
        } else {
            const arr = group.porLang.get(a.language) ?? [];
            arr.push(a.id);
            group.porLang.set(a.language, arr);
        }
        byTrail.set(a.trailId, group);
    }

    const allTrails = await db.select().from(trails);
    const countCompleted = (ids: string[]) => ids.filter((id) => completedIds.has(id)).length;

    const result: {
        id: string;
        name: string;
        trailLevel: "iniciante" | "intermediario" | "avancado";
        description: string;
        totalLessons: number;
        completedLessons: number;
        progress: number;
    }[] = [];
    for (const trail of allTrails) {
        const group = byTrail.get(trail.id);
        if (!group) continue;

        let total = group.neutras.length;
        let completed = countCompleted(group.neutras);
        if (group.porLang.size > 0) {
            let best = { total: 0, concluidas: 0, pct: -1 };
            for (const ids of group.porLang.values()) {
                const t = group.neutras.length + ids.length;
                const c = countCompleted(group.neutras) + countCompleted(ids);
                const pct = t > 0 ? c / t : 0;
                if (pct > best.pct || (pct === best.pct && c > best.concluidas)) {
                    best = { total: t, concluidas: c, pct };
                }
            }
            total = best.total;
            completed = best.concluidas;
        }
        if (completed === 0) continue;

        result.push({
            id: trail.id,
            name: trail.name,
            trailLevel: trail.trailLevel,
            description: trail.description,
            totalLessons: total,
            completedLessons: completed,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
    }
    return result;
}

// Returns the track with modules and lessons, each lesson with its state for the user.
// The state follows the whole track in sequence: done | current | locked.
export async function findTrailDetail(trailId: string, userId: string, lang?: string) {
    const [trail] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }

    const admin = await ehAdmin(userId);

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));

    const rawLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.trailId, trailId))
        .orderBy(asc(lessons.position));

    // language null = neutral lesson (pure logic), shared by every language.
    const languages = [
        ...new Set(rawLessons.map((a) => a.language).filter((l): l is string => !!l)),
    ].sort();
    const multi = languages.length > 0;
    let activeLang: string | null = null;
    if (multi) {
        if (lang && languages.includes(lang)) {
            activeLang = lang;
        } else {
            // Without an explicit lang, the default is the path of the last completed lesson, not the first language.
            const [lastLesson] = await db
                .select({ language: lessons.language })
                .from(lessonProgress)
                .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
                .where(
                    and(
                        eq(lessonProgress.userId, userId),
                        eq(lessons.trailId, trailId),
                        isNotNull(lessons.language),
                    ),
                )
                .orderBy(desc(lessonProgress.completedAt))
                .limit(1);
            activeLang =
                lastLesson?.language && languages.includes(lastLesson.language)
                    ? lastLesson.language
                    : languages[0];
        }
    }

    const allLessons = multi
        ? rawLessons.filter((a) => a.language === null || a.language === activeLang)
        : rawLessons;

    const lessonRows = admin ? allLessons : allLessons.filter((a) => a.published);

    const completed = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    // The state follows the sequence of the PUBLISHED lessons. A draft (only the admin sees it)
    // stays out of the sequence: otherwise it would show as "current", and getLesson, which
    // computes the state with published lessons only, would treat it as locked (diverging states).
    const orderedLessons = mods.flatMap((m) =>
        allLessons
            .filter((a) => a.moduleId === m.id && a.published)
            .sort((a, b) => a.position - b.position),
    );

    const stateByLesson = new Map<string, string>();
    let foundCurrent = false;
    for (const a of orderedLessons) {
        if (completed.has(a.id)) {
            stateByLesson.set(a.id, "done");
        } else if (!foundCurrent) {
            stateByLesson.set(a.id, "current");
            foundCurrent = true;
        } else {
            stateByLesson.set(a.id, "locked");
        }
    }

    const modulesWithLessons = mods.map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        lessons: lessonRows
            .filter((a) => a.moduleId === m.id)
            .sort((a, b) => a.position - b.position)
            .map((a) => ({
                id: a.id,
                title: a.title,
                position: a.position,
                published: a.published,
                durationMin: a.durationMin,
                preview: a.preview,
                state: stateByLesson.get(a.id) ?? "locked",
            })),
    }));

    const lessonIds = allLessons.map((a) => a.id);
    const [studs] = lessonIds.length
        ? await db
              .select({ n: countDistinct(lessonProgress.userId) })
              .from(lessonProgress)
              .where(inArray(lessonProgress.lessonId, lessonIds))
        : [{ n: 0 }];

    // The track's area: the roadmap that references it (the main one, with the lowest position).
    const [rm] = await db
        .select({ name: roadmaps.name })
        .from(roadmapStageRefs)
        .innerJoin(roadmapStages, eq(roadmapStages.id, roadmapStageRefs.stageId))
        .innerJoin(roadmaps, eq(roadmaps.id, roadmapStages.roadmapId))
        .where(and(eq(roadmapStageRefs.refType, "trail"), eq(roadmapStageRefs.refId, trailId)))
        .orderBy(asc(roadmaps.position))
        .limit(1);

    const revs = await db
        .select({
            userId: trailReviews.userId,
            name: users.name,
            stars: trailReviews.stars,
            comment: trailReviews.comment,
        })
        .from(trailReviews)
        .innerJoin(users, eq(users.id, trailReviews.userId))
        .where(eq(trailReviews.trailId, trailId))
        .orderBy(desc(trailReviews.createdAt));

    const reviewCount = revs.length;
    const rating = reviewCount
        ? Math.round((revs.reduce((s, r) => s + r.stars, 0) / reviewCount) * 10) / 10
        : null;
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
        const n = revs.filter((r) => r.stars === star).length;
        return { star, count: n, pct: reviewCount ? Math.round((n / reviewCount) * 100) : 0 };
    });
    const reviews = revs
        .filter((r) => r.comment && r.comment.trim())
        .map((r) => ({ name: r.name, stars: r.stars, comment: r.comment as string }));
    const ownReview = revs.find((r) => r.userId === userId);
    const myReview = ownReview ? { stars: ownReview.stars, comment: ownReview.comment } : null;
    const canReview = allLessons.some((a) => completed.has(a.id));

    return {
        ...trail,
        category: rm?.name ?? null,
        studentsCount: Number(studs.n),
        rating,
        reviewCount,
        ratingDistribution,
        reviews,
        myReview,
        canReview,
        multiLanguage: multi,
        languages,
        activeLanguage: activeLang,
        modules: modulesWithLessons,
    };
}

// Creates or updates the user's review. Only someone with progress in the track can review it.
export async function saveTrailReview(
    trailId: string,
    userId: string,
    stars: number,
    comment: string | null,
) {
    const [trail] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "trail.notFound");
    }

    const ls = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.trailId, trailId));
    const lessonIds = ls.map((l) => l.id);
    const progressRows = lessonIds.length
        ? await db
              .select({ id: lessonProgress.id })
              .from(lessonProgress)
              .where(
                  and(
                      eq(lessonProgress.userId, userId),
                      inArray(lessonProgress.lessonId, lessonIds),
                  ),
              )
              .limit(1)
        : [];
    if (progressRows.length === 0) {
        throw new AppError(403, "trail.startBeforeReview");
    }

    const trimmedComment = comment && comment.trim() ? comment.trim() : null;
    await db
        .insert(trailReviews)
        .values({ trailId, userId, stars, comment: trimmedComment })
        .onConflictDoUpdate({
            target: [trailReviews.userId, trailReviews.trailId],
            set: { stars, comment: trimmedComment, updatedAt: new Date() },
        });
    return { stars, comment: trimmedComment };
}
