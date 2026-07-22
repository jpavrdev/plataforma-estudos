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
import { eq, asc, desc, count, countDistinct, inArray, and, isNotNull } from "drizzle-orm";
import type { z } from "zod";
import type { createTrailSchema, updateTrailSchema } from "../schemas/trail.schemas.ts";
import { AppError } from "../errors/AppError.ts";
import { ehAdmin } from "./usuario.service.ts";

type DadosCriarTrilha = z.infer<typeof createTrailSchema>;
type DadosAtualizarTrilha = z.infer<typeof updateTrailSchema>;

export async function criarTrilha(dados: DadosCriarTrilha) {
    const [trilha] = await db
        .insert(trails)
        .values({
            name: dados.name,
            trailLevel: dados.level,
            description: dados.description,
        })
        .returning();
    if (dados.tagIds?.length) {
        await db
            .insert(trailTags)
            .values(dados.tagIds.map((tagId) => ({ trailId: trilha.id, tagId })))
            .onConflictDoNothing();
    }
    return trilha;
}

// Edita os dados da trilha (admin).
export async function atualizarTrilha(trailId: string, dados: DadosAtualizarTrilha) {
    const sets: {
        name?: string;
        trailLevel?: "iniciante" | "intermediario" | "avancado";
        description?: string;
    } = {};
    if (dados.name !== undefined) sets.name = dados.name;
    if (dados.level !== undefined) sets.trailLevel = dados.level;
    if (dados.description !== undefined) sets.description = dados.description;
    if (Object.keys(sets).length === 0) {
        throw new AppError(400, "Nada para atualizar");
    }

    const [trilha] = await db.update(trails).set(sets).where(eq(trails.id, trailId)).returning({
        id: trails.id,
        name: trails.name,
        trailLevel: trails.trailLevel,
        description: trails.description,
    });
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }

    if (dados.tagIds !== undefined) {
        await db.delete(trailTags).where(eq(trailTags.trailId, trailId));
        if (dados.tagIds.length) {
            await db
                .insert(trailTags)
                .values(dados.tagIds.map((tagId) => ({ trailId, tagId })))
                .onConflictDoNothing();
        }
    }
    return trilha;
}

// Exclui a trilha inteira (módulos, aulas, questões e progresso).
export async function excluirTrilha(trailId: string) {
    const [trilha] = await db
        .select({ id: trails.id })
        .from(trails)
        .where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
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

const NIVEIS_VALIDOS = new Set(["iniciante", "intermediario", "avancado"]);

export async function listarTrilhas(filtros: { level?: string; categoria?: string } = {}) {
    const filtroNivel =
        filtros.level && NIVEIS_VALIDOS.has(filtros.level)
            ? eq(trails.trailLevel, filtros.level as "iniciante" | "intermediario" | "avancado")
            : undefined;
    const filtroCategoria = filtros.categoria
        ? inArray(
              trails.id,
              db
                  .select({ id: trailTags.trailId })
                  .from(trailTags)
                  .innerJoin(tags, eq(tags.id, trailTags.tagId))
                  .where(eq(tags.name, filtros.categoria)),
          )
        : undefined;
    const lista = await db
        .select({
            id: trails.id,
            name: trails.name,
            trailLevel: trails.trailLevel,
            description: trails.description,
            totalLessons: count(lessons.id),
        })
        .from(trails)
        .leftJoin(lessons, eq(lessons.trailId, trails.id))
        .where(and(filtroNivel, filtroCategoria))
        .groupBy(trails.id);

    const vinculos = await db
        .select({ trailId: trailTags.trailId, id: tags.id, name: tags.name })
        .from(trailTags)
        .innerJoin(tags, eq(tags.id, trailTags.tagId));
    const tagsPorTrilha = new Map<string, { id: string; name: string }[]>();
    for (const v of vinculos) {
        const arr = tagsPorTrilha.get(v.trailId) ?? [];
        arr.push({ id: v.id, name: v.name });
        tagsPorTrilha.set(v.trailId, arr);
    }
    return lista.map((t) => ({ ...t, tags: tagsPorTrilha.get(t.id) ?? [] }));
}

// Trilhas em que o usuário já tem progresso, com percentual de conclusão.
export async function trilhasDoUsuario(userId: string) {
    const totais = await db
        .select({ trailId: lessons.trailId, total: count(lessons.id) })
        .from(lessons)
        .groupBy(lessons.trailId);
    const totalPorTrilha = new Map(totais.map((t) => [t.trailId, Number(t.total)]));

    const feitas = await db
        .select({ trailId: lessons.trailId, feitas: count(lessonProgress.id) })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(eq(lessonProgress.userId, userId))
        .groupBy(lessons.trailId);

    if (feitas.length === 0) {
        return [];
    }

    const todasTrilhas = await db.select().from(trails);
    const trilhaPorId = new Map(todasTrilhas.map((t) => [t.id, t]));

    return feitas
        .filter((f) => trilhaPorId.has(f.trailId))
        .map((f) => {
            const trilha = trilhaPorId.get(f.trailId)!;
            const total = totalPorTrilha.get(f.trailId) ?? 0;
            const concluidas = Number(f.feitas);
            const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
            return {
                id: trilha.id,
                name: trilha.name,
                trailLevel: trilha.trailLevel,
                description: trilha.description,
                totalLessons: total,
                completedLessons: concluidas,
                progress: pct,
            };
        });
}

// Retorna a trilha com módulos e aulas, cada aula com estado para o usuário.
// Estado sequencial na trilha toda: done | current | locked.
export async function detalheDaTrilha(trailId: string, userId: string, lang?: string) {
    const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }

    const admin = await ehAdmin(userId);

    const mods = await db
        .select()
        .from(modules)
        .where(eq(modules.trailId, trailId))
        .orderBy(asc(modules.position));

    const aulasBrutas = await db
        .select()
        .from(lessons)
        .where(eq(lessons.trailId, trailId))
        .orderBy(asc(lessons.position));

    // language null = aula neutra (lógica pura), compartilhada por todas as linguagens.
    const languages = [
        ...new Set(aulasBrutas.map((a) => a.language).filter((l): l is string => !!l)),
    ].sort();
    const multi = languages.length > 0;
    let langAtiva: string | null = null;
    if (multi) {
        if (lang && languages.includes(lang)) {
            langAtiva = lang;
        } else {
            // Sem lang explícito, o default é o track da última aula concluída, não o primeiro idioma.
            const [ult] = await db
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
            langAtiva =
                ult?.language && languages.includes(ult.language) ? ult.language : languages[0];
        }
    }

    const todasAulas = multi
        ? aulasBrutas.filter((a) => a.language === null || a.language === langAtiva)
        : aulasBrutas;

    const aulas = admin ? todasAulas : todasAulas.filter((a) => a.published);

    const concluidas = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    // O estado segue a sequência das aulas PUBLICADAS. Rascunho (que só o admin vê)
    // não entra na sequência: senão apareceria como "current" e o getLesson, que
    // calcula o estado só com publicadas, o trataria como bloqueado (estados divergentes).
    const ordenadas = mods.flatMap((m) =>
        todasAulas
            .filter((a) => a.moduleId === m.id && a.published)
            .sort((a, b) => a.position - b.position),
    );

    const estadoPorAula = new Map<string, string>();
    let achouCurrent = false;
    for (const a of ordenadas) {
        if (concluidas.has(a.id)) {
            estadoPorAula.set(a.id, "done");
        } else if (!achouCurrent) {
            estadoPorAula.set(a.id, "current");
            achouCurrent = true;
        } else {
            estadoPorAula.set(a.id, "locked");
        }
    }

    const modulosComAulas = mods.map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        lessons: aulas
            .filter((a) => a.moduleId === m.id)
            .sort((a, b) => a.position - b.position)
            .map((a) => ({
                id: a.id,
                title: a.title,
                position: a.position,
                published: a.published,
                durationMin: a.durationMin,
                preview: a.preview,
                state: estadoPorAula.get(a.id) ?? "locked",
            })),
    }));

    const lessonIds = todasAulas.map((a) => a.id);
    const [studs] = lessonIds.length
        ? await db
              .select({ n: countDistinct(lessonProgress.userId) })
              .from(lessonProgress)
              .where(inArray(lessonProgress.lessonId, lessonIds))
        : [{ n: 0 }];

    // Area da trilha: o roadmap que a referencia (o principal, de menor posicao).
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
    const minha = revs.find((r) => r.userId === userId);
    const myReview = minha ? { stars: minha.stars, comment: minha.comment } : null;
    const canReview = todasAulas.some((a) => concluidas.has(a.id));

    return {
        ...trilha,
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
        activeLanguage: langAtiva,
        modules: modulosComAulas,
    };
}

// Cria ou atualiza a avaliacao do usuario. So quem ja tem progresso na trilha avalia.
export async function avaliarTrilha(
    trailId: string,
    userId: string,
    stars: number,
    comment: string | null,
) {
    const [trilha] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }

    const ls = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.trailId, trailId));
    const lessonIds = ls.map((l) => l.id);
    const progresso = lessonIds.length
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
    if (progresso.length === 0) {
        throw new AppError(403, "Comece a trilha para poder avaliar");
    }

    const texto = comment && comment.trim() ? comment.trim() : null;
    await db
        .insert(trailReviews)
        .values({ trailId, userId, stars, comment: texto })
        .onConflictDoUpdate({
            target: [trailReviews.userId, trailReviews.trailId],
            set: { stars, comment: texto, updatedAt: new Date() },
        });
    return { stars, comment: texto };
}
