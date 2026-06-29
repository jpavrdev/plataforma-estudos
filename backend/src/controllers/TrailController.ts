import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import {
    users,
    trails,
    modules,
    lessons,
    lessonProgress,
    questions,
    questionOptions,
    questionAnswers,
    tags,
    trailTags,
    languages,
    achievements,
    userAchievements,
} from "../../schema.ts";
import { eq, and, count, asc, desc, gte, inArray, sql } from "drizzle-orm";
import {
    createTrailSchema,
    createModuleSchema,
    createLessonSchema,
    createQuestionSchema,
    submitQuizSchema,
    checkAnswerSchema,
    saveLessonStudioSchema,
    updateTrailSchema,
    createTagSchema,
    updateTagSchema,
    createLanguageSchema,
    updateLanguageSchema,
    createAchievementSchema,
    updateAchievementSchema,
} from "../schemas/trail.schemas.ts";
import {
    calcularStreak,
    diasAtivosDoUsuario,
    semanaAtividade,
    streaksTodos,
    hojeSaoPaulo,
} from "../services/streak.ts";
import { movimentacaoRanking } from "../services/ranking.ts";

const QUIZ_MIN_ACERTOS = 4;

async function ehAdmin(userId: string): Promise<boolean> {
    const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    return u?.role === "admin";
}

export const createTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTrailSchema.parse(req.body);
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
        res.status(201).json(trilha);
    } catch (err) {
        next(err);
    }
};

// ===================== TAGS (categorias de trilha) =====================
export const listTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lista = await db.select().from(tags).orderBy(asc(tags.name));
        res.json(lista);
    } catch (err) {
        next(err);
    }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTagSchema.parse(req.body);
        const [existe] = await db
            .select({ id: tags.id })
            .from(tags)
            .where(eq(tags.name, dados.name));
        if (existe) {
            return res.status(409).json({ erro: "Já existe uma tag com esse nome" });
        }
        const [tag] = await db.insert(tags).values({ name: dados.name }).returning();
        res.status(201).json(tag);
    } catch (err) {
        next(err);
    }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateTagSchema.parse(req.body);
        const [conflito] = await db
            .select({ id: tags.id })
            .from(tags)
            .where(eq(tags.name, dados.name));
        if (conflito && conflito.id !== id) {
            return res.status(409).json({ erro: "Já existe uma tag com esse nome" });
        }
        const [tag] = await db
            .update(tags)
            .set({ name: dados.name })
            .where(eq(tags.id, id))
            .returning();
        if (!tag) {
            return res.status(404).json({ erro: "Tag não encontrada" });
        }
        res.json(tag);
    } catch (err) {
        next(err);
    }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        await db.transaction(async (tx) => {
            await tx.delete(trailTags).where(eq(trailTags.tagId, id));
            await tx.delete(tags).where(eq(tags.id, id));
        });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== LINGUAGENS (canônicas do perfil) =====================
export const listLanguages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lista = await db.select().from(languages).orderBy(asc(languages.name));
        res.json(lista);
    } catch (err) {
        next(err);
    }
};

export const createLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createLanguageSchema.parse(req.body);
        const [existe] = await db
            .select({ id: languages.id })
            .from(languages)
            .where(eq(languages.name, dados.name));
        if (existe) {
            return res.status(409).json({ erro: "Já existe uma linguagem com esse nome" });
        }
        const [lang] = await db.insert(languages).values({ name: dados.name }).returning();
        res.status(201).json(lang);
    } catch (err) {
        next(err);
    }
};

export const updateLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateLanguageSchema.parse(req.body);
        const [atual] = await db
            .select({ name: languages.name })
            .from(languages)
            .where(eq(languages.id, id));
        if (!atual) {
            return res.status(404).json({ erro: "Linguagem não encontrada" });
        }
        const [conflito] = await db
            .select({ id: languages.id })
            .from(languages)
            .where(eq(languages.name, dados.name));
        if (conflito && conflito.id !== id) {
            return res.status(409).json({ erro: "Já existe uma linguagem com esse nome" });
        }
        const lang = await db.transaction(async (tx) => {
            const [atualizada] = await tx
                .update(languages)
                .set({ name: dados.name })
                .where(eq(languages.id, id))
                .returning();
            // Renomeou: propaga o novo nome para os perfis que usavam o antigo.
            if (atual.name !== dados.name) {
                await tx.execute(sql`
                    UPDATE users
                    SET languages = (
                        SELECT jsonb_agg(CASE WHEN elem = ${JSON.stringify(atual.name)}::jsonb THEN ${JSON.stringify(dados.name)}::jsonb ELSE elem END)
                        FROM jsonb_array_elements(languages) AS elem
                    )
                    WHERE languages @> ${JSON.stringify([atual.name])}::jsonb
                `);
            }
            return atualizada;
        });
        res.json(lang);
    } catch (err) {
        next(err);
    }
};

export const deleteLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const [lang] = await db
            .select({ name: languages.name })
            .from(languages)
            .where(eq(languages.id, id));
        if (!lang) {
            return res.status(404).json({ erro: "Linguagem não encontrada" });
        }
        await db.transaction(async (tx) => {
            await tx.delete(languages).where(eq(languages.id, id));
            // Remove o nome dos perfis que a usavam, mantendo os dados padronizados.
            await tx.execute(sql`
                UPDATE users
                SET languages = COALESCE((
                    SELECT jsonb_agg(elem)
                    FROM jsonb_array_elements(languages) AS elem
                    WHERE elem <> ${JSON.stringify(lang.name)}::jsonb
                ), '[]'::jsonb)
                WHERE languages @> ${JSON.stringify([lang.name])}::jsonb
            `);
        });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== CONQUISTAS (catálogo, admin) =====================
export const listAchievements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lista = await db.select().from(achievements).orderBy(asc(achievements.threshold));
        res.json(lista);
    } catch (err) {
        next(err);
    }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createAchievementSchema.parse(req.body);
        const [existe] = await db
            .select({ id: achievements.id })
            .from(achievements)
            .where(eq(achievements.name, dados.name));
        if (existe) {
            return res.status(409).json({ erro: "Já existe uma conquista com esse nome" });
        }
        const [a] = await db.insert(achievements).values(dados).returning();
        res.status(201).json(a);
    } catch (err) {
        next(err);
    }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateAchievementSchema.parse(req.body);
        const [conflito] = await db
            .select({ id: achievements.id })
            .from(achievements)
            .where(eq(achievements.name, dados.name));
        if (conflito && conflito.id !== id) {
            return res.status(409).json({ erro: "Já existe uma conquista com esse nome" });
        }
        const [a] = await db
            .update(achievements)
            .set(dados)
            .where(eq(achievements.id, id))
            .returning();
        if (!a) {
            return res.status(404).json({ erro: "Conquista não encontrada" });
        }
        res.json(a);
    } catch (err) {
        next(err);
    }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        await db.transaction(async (tx) => {
            await tx.delete(userAchievements).where(eq(userAchievements.achievementId, id));
            await tx.delete(achievements).where(eq(achievements.id, id));
        });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Edita os dados da trilha (admin).
export const updateTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = updateTrailSchema.parse(req.body);

        const sets: {
            name?: string;
            trailLevel?: "iniciante" | "intermediario" | "avancado";
            description?: string;
        } = {};
        if (dados.name !== undefined) sets.name = dados.name;
        if (dados.level !== undefined) sets.trailLevel = dados.level;
        if (dados.description !== undefined) sets.description = dados.description;
        if (Object.keys(sets).length === 0) {
            return res.status(400).json({ erro: "Nada para atualizar" });
        }

        const [trilha] = await db.update(trails).set(sets).where(eq(trails.id, trailId)).returning({
            id: trails.id,
            name: trails.name,
            trailLevel: trails.trailLevel,
            description: trails.description,
        });
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
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
        res.json(trilha);
    } catch (err) {
        next(err);
    }
};

// Exclui a trilha inteira (módulos, aulas, questões e progresso).
export const deleteTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const [trilha] = await db
            .select({ id: trails.id })
            .from(trails)
            .where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
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
                    await tx
                        .delete(questionAnswers)
                        .where(inArray(questionAnswers.questionId, qIds));
                    await tx
                        .delete(questionOptions)
                        .where(inArray(questionOptions.questionId, qIds));
                    await tx.delete(questions).where(inArray(questions.id, qIds));
                }
                await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
                await tx.delete(lessons).where(inArray(lessons.id, lessonIds));
            }
            await tx.delete(modules).where(eq(modules.trailId, trailId));
            await tx.delete(trailTags).where(eq(trailTags.trailId, trailId));
            await tx.delete(trails).where(eq(trails.id, trailId));
        });

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = createModuleSchema.parse(req.body);

        const [trilha] = await db
            .select({ id: trails.id })
            .from(trails)
            .where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const [modulo] = await db
            .insert(modules)
            .values({
                trailId,
                title: dados.title,
                position: dados.position,
            })
            .returning();
        res.status(201).json(modulo);
    } catch (err) {
        next(err);
    }
};

// Exclui um módulo e todas as suas aulas (questões, opções e progresso).
export const deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const [modulo] = await db
            .select({ id: modules.id })
            .from(modules)
            .where(eq(modules.id, moduleId));
        if (!modulo) {
            return res.status(404).json({ erro: "Módulo não encontrado" });
        }
        await db.transaction(async (tx) => {
            const ls = await tx
                .select({ id: lessons.id })
                .from(lessons)
                .where(eq(lessons.moduleId, moduleId));
            const lessonIds = ls.map((l) => l.id);
            if (lessonIds.length) {
                const qs = await tx
                    .select({ id: questions.id })
                    .from(questions)
                    .where(inArray(questions.lessonId, lessonIds));
                const qIds = qs.map((q) => q.id);
                if (qIds.length) {
                    await tx
                        .delete(questionAnswers)
                        .where(inArray(questionAnswers.questionId, qIds));
                    await tx
                        .delete(questionOptions)
                        .where(inArray(questionOptions.questionId, qIds));
                    await tx.delete(questions).where(inArray(questions.id, qIds));
                }
                await tx.delete(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds));
                await tx.delete(lessons).where(inArray(lessons.id, lessonIds));
            }
            await tx.delete(modules).where(eq(modules.id, moduleId));
        });
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const dados = createLessonSchema.parse(req.body);

        const [modulo] = await db
            .select({ id: modules.id, trailId: modules.trailId })
            .from(modules)
            .where(eq(modules.id, moduleId));
        if (!modulo) {
            return res.status(404).json({ erro: "Módulo não encontrado" });
        }

        const [aula] = await db
            .insert(lessons)
            .values({
                trailId: modulo.trailId,
                moduleId,
                title: dados.title,
                content: dados.content,
                position: dados.position,
            })
            .returning();
        res.status(201).json(aula);
    } catch (err) {
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = createQuestionSchema.parse(req.body);

        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const criada = await db.transaction(async (tx) => {
            const [questao] = await tx
                .insert(questions)
                .values({
                    lessonId,
                    statement: dados.statement,
                    position: dados.position,
                })
                .returning();

            await tx.insert(questionOptions).values(
                dados.options.map((o, i) => ({
                    questionId: questao.id,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    position: i + 1,
                })),
            );
            return questao;
        });

        res.status(201).json(criada);
    } catch (err) {
        next(err);
    }
};

export const listTrails = async (_req: Request, res: Response, next: NextFunction) => {
    try {
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
        res.json(lista.map((t) => ({ ...t, tags: tagsPorTrilha.get(t.id) ?? [] })));
    } catch (err) {
        next(err);
    }
};

export const getMyTrails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "Não autenticado" });
        }

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
            return res.json([]);
        }

        const todasTrilhas = await db.select().from(trails);
        const trilhaPorId = new Map(todasTrilhas.map((t) => [t.id, t]));

        const resultado = feitas
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
        res.json(resultado);
    } catch (err) {
        next(err);
    }
};

// Retorna a trilha com módulos e aulas, cada aula com estado para o usuário.
// Estado sequencial na trilha toda: done | current | locked.
export const getTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const trailId = String(req.params.id);

        const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const admin = await ehAdmin(userId!);

        const mods = await db
            .select()
            .from(modules)
            .where(eq(modules.trailId, trailId))
            .orderBy(asc(modules.position));

        // Aluno vê só aulas publicadas; admin vê todas (para gerenciar).
        const todasAulas = await db
            .select()
            .from(lessons)
            .where(eq(lessons.trailId, trailId))
            .orderBy(asc(lessons.position));
        const aulas = admin ? todasAulas : todasAulas.filter((a) => a.published);

        const concluidas = new Set(
            (
                await db
                    .select({ lessonId: lessonProgress.lessonId })
                    .from(lessonProgress)
                    .where(eq(lessonProgress.userId, userId!))
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
                    state: estadoPorAula.get(a.id) ?? "locked",
                })),
        }));

        res.json({ ...trilha, modules: modulosComAulas });
    } catch (err) {
        next(err);
    }
};

// Calcula o estado (done/current/locked) de uma aula específica na trilha.
async function estadoDaAula(userId: string, aula: typeof lessons.$inferSelect): Promise<string> {
    // Só aulas publicadas entram na sequência (uma aula "em breve" não trava as próximas).
    const irmas = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId, position: lessons.position })
        .from(lessons)
        .where(and(eq(lessons.trailId, aula.trailId), eq(lessons.published, true)));
    const mods = await db
        .select({ id: modules.id, position: modules.position })
        .from(modules)
        .where(eq(modules.trailId, aula.trailId));
    const ordemModulo = new Map(mods.map((m) => [m.id, m.position]));

    const ordenadas = [...irmas].sort((a, b) => {
        const pm = (ordemModulo.get(a.moduleId) ?? 0) - (ordemModulo.get(b.moduleId) ?? 0);
        return pm !== 0 ? pm : a.position - b.position;
    });

    const concluidas = new Set(
        (
            await db
                .select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId))
        ).map((p) => p.lessonId),
    );

    let achouCurrent = false;
    for (const a of ordenadas) {
        if (concluidas.has(a.id)) {
            if (a.id === aula.id) return "done";
        } else if (!achouCurrent) {
            achouCurrent = true;
            if (a.id === aula.id) return "current";
        } else if (a.id === aula.id) {
            return "locked";
        }
    }
    return "locked";
}

// Retorna a aula com conteúdo e questões SEM revelar a alternativa correta.
export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const lessonId = String(req.params.id);

        const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        // Aula não publicada é invisível para o aluno; admin pode visualizar (preview).
        const admin = await ehAdmin(userId);
        if (!aula.published && !admin) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        // Admin não é travado pelo bloqueio sequencial (pode pré-visualizar qualquer aula).
        const estado = await estadoDaAula(userId, aula);
        if (estado === "locked" && !admin) {
            return res.status(403).json({ erro: "Aula bloqueada. Conclua a aula anterior." });
        }

        const qs = await db
            .select()
            .from(questions)
            .where(eq(questions.lessonId, lessonId))
            .orderBy(asc(questions.position));
        const qIds = qs.map((q) => q.id);
        const opts = qIds.length
            ? await db
                  .select()
                  .from(questionOptions)
                  .where(inArray(questionOptions.questionId, qIds))
                  .orderBy(asc(questionOptions.position))
            : [];

        const questoes = qs.map((q) => ({
            id: q.id,
            statement: q.statement,
            position: q.position,
            // isCorrect deliberadamente omitido: o gabarito nunca vai para o cliente.
            options: opts
                .filter((o) => o.questionId === q.id)
                .map((o) => ({ id: o.id, text: o.text, position: o.position })),
        }));

        res.json({
            id: aula.id,
            trailId: aula.trailId,
            moduleId: aula.moduleId,
            title: aula.title,
            content: aula.content,
            contentBlocks: aula.contentBlocks ?? null,
            state: estado,
            questions: questoes,
        });
    } catch (err) {
        next(err);
    }
};

// Recebe as respostas, corrige no servidor e conclui a aula se acertar o mínimo.
export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const lessonId = String(req.params.id);
        const dados = submitQuizSchema.parse(req.body);

        const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        if (!aula.published) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const estado = await estadoDaAula(userId, aula);
        if (estado === "locked") {
            return res.status(403).json({ erro: "Aula bloqueada. Conclua a aula anterior." });
        }

        const qs = await db
            .select({ id: questions.id })
            .from(questions)
            .where(eq(questions.lessonId, lessonId));
        const qIds = qs.map((q) => q.id);
        if (qIds.length === 0) {
            return res.status(400).json({ erro: "Esta aula não tem questões" });
        }

        const opts = await db
            .select()
            .from(questionOptions)
            .where(inArray(questionOptions.questionId, qIds));
        const corretaPorQuestao = new Map<string, string>();
        for (const o of opts) {
            if (o.isCorrect) corretaPorQuestao.set(o.questionId, o.id);
        }

        let acertos = 0;
        for (const resp of dados.answers) {
            if (corretaPorQuestao.get(resp.questionId) === resp.optionId) acertos++;
        }

        // Registra cada resposta uma única vez. A primeira conta para o XP por questão
        // (10 cada); como não sobrescreve, errar e refazer não rende XP depois.
        const idsValidos = new Set(opts.map((o) => o.id));
        const qIdSet = new Set(qIds);
        for (const resp of dados.answers) {
            if (!qIdSet.has(resp.questionId) || !idsValidos.has(resp.optionId)) continue;
            await db
                .insert(questionAnswers)
                .values({
                    userId,
                    questionId: resp.questionId,
                    selectedOptionId: resp.optionId,
                    isCorrect: corretaPorQuestao.get(resp.questionId) === resp.optionId,
                })
                .onConflictDoNothing();
        }

        const total = qIds.length;
        const passou = acertos >= QUIZ_MIN_ACERTOS;

        let aulaConcluida = false;
        if (passou) {
            const [existe] = await db
                .select({ id: lessonProgress.id })
                .from(lessonProgress)
                .where(
                    and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)),
                );
            if (!existe) {
                await db.insert(lessonProgress).values({ userId, lessonId });
            }
            aulaConcluida = true;
        }

        await verificarConquistas(userId);

        res.json({ correct: acertos, total, passed: passou, lessonCompleted: aulaConcluida });
    } catch (err) {
        next(err);
    }
};

// Estatísticas base do usuário: XP (50 por aula + 10 por acerto), aulas e acertos.
async function calcularEstatisticas(userId: string) {
    const [aulas] = await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId));
    const [acertos] = await db
        .select({ n: count() })
        .from(questionAnswers)
        .where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.isCorrect, true)));
    const lessonsCompleted = Number(aulas?.n ?? 0);
    const questionsCorrect = Number(acertos?.n ?? 0);
    return {
        xp: lessonsCompleted * 50 + questionsCorrect * 10,
        lessonsCompleted,
        questionsCorrect,
    };
}

// Desbloqueia (idempotente) as conquistas cujo critério o usuário já atingiu.
async function verificarConquistas(userId: string) {
    const stats = await calcularEstatisticas(userId);
    const valor: Record<string, number> = {
        xp_total: stats.xp,
        lessons_completed: stats.lessonsCompleted,
        questions_correct: stats.questionsCorrect,
    };
    const catalogo = await db.select().from(achievements);
    const merecidas = catalogo.filter((a) => (valor[a.criteriaType] ?? 0) >= a.threshold);
    if (merecidas.length === 0) return;
    await db
        .insert(userAchievements)
        .values(merecidas.map((a) => ({ userId, achievementId: a.id })))
        .onConflictDoNothing();
}

// XP total do usuário: 50 por aula concluída + 10 por questão acertada (primeira vez).
export const getMyXp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await calcularEstatisticas(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Catálogo de conquistas com a marcação do que o usuário já desbloqueou.
export const getMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        await verificarConquistas(userId);
        const catalogo = await db.select().from(achievements).orderBy(asc(achievements.threshold));
        const ganhas = await db
            .select()
            .from(userAchievements)
            .where(eq(userAchievements.userId, userId));
        const quando = new Map(ganhas.map((g) => [g.achievementId, g.earnedAt]));
        res.json(
            catalogo.map((a) => ({
                ...a,
                earned: quando.has(a.id),
                earnedAt: quando.get(a.id) ?? null,
            })),
        );
    } catch (err) {
        next(err);
    }
};

// Atividades recentes derivadas: aulas concluídas + conquistas desbloqueadas.
export const getMyActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const aulas = await db
            .select({ at: lessonProgress.completedAt, title: lessons.title })
            .from(lessonProgress)
            .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
            .where(eq(lessonProgress.userId, userId))
            .orderBy(desc(lessonProgress.completedAt))
            .limit(15);
        const conquistas = await db
            .select({
                at: userAchievements.earnedAt,
                name: achievements.name,
                icon: achievements.icon,
            })
            .from(userAchievements)
            .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
            .where(eq(userAchievements.userId, userId))
            .orderBy(desc(userAchievements.earnedAt))
            .limit(15);
        const itens = [
            ...aulas.map((a) => ({
                type: "lesson",
                icon: "check",
                text: `Concluiu a aula "${a.title}"`,
                at: a.at,
            })),
            ...conquistas.map((c) => ({
                type: "achievement",
                icon: c.icon,
                text: `Desbloqueou "${c.name}"`,
                at: c.at,
            })),
        ]
            .sort((x, y) => (x.at < y.at ? 1 : x.at > y.at ? -1 : 0))
            .slice(0, 15);
        res.json(itens);
    } catch (err) {
        next(err);
    }
};

// Feed da comunidade: quem desbloqueou cada conquista, mais recentes primeiro.
export const getCommunityAchievements = async (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const lista = await db
            .select({
                name: users.name,
                achievement: achievements.name,
                icon: achievements.icon,
                at: userAchievements.earnedAt,
            })
            .from(userAchievements)
            .innerJoin(users, eq(users.id, userAchievements.userId))
            .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
            .orderBy(desc(userAchievements.earnedAt))
            .limit(10);
        res.json(lista);
    } catch (err) {
        next(err);
    }
};

// Ranking global por XP. Liga e nível usam o XP total; o leaderboard usa o
// período (week/month/all). XP = 50 por aula concluída + 10 por questão certa.
export const getRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periodo = String(req.query.period ?? "all");
        const dia = 24 * 60 * 60 * 1000;
        const desde =
            periodo === "week"
                ? new Date(Date.now() - 7 * dia)
                : periodo === "month"
                  ? new Date(Date.now() - 30 * dia)
                  : null;

        const [usuarios, aulasTot, acertosTot, aulasPer, acertosPer, streaks] = await Promise.all([
            db.select({ id: users.id, name: users.name, username: users.username }).from(users),
            db
                .select({ userId: lessonProgress.userId, n: count() })
                .from(lessonProgress)
                .groupBy(lessonProgress.userId),
            db
                .select({ userId: questionAnswers.userId, n: count() })
                .from(questionAnswers)
                .where(eq(questionAnswers.isCorrect, true))
                .groupBy(questionAnswers.userId),
            desde
                ? db
                      .select({ userId: lessonProgress.userId, n: count() })
                      .from(lessonProgress)
                      .where(gte(lessonProgress.completedAt, desde))
                      .groupBy(lessonProgress.userId)
                : Promise.resolve(null),
            desde
                ? db
                      .select({ userId: questionAnswers.userId, n: count() })
                      .from(questionAnswers)
                      .where(
                          and(
                              eq(questionAnswers.isCorrect, true),
                              gte(questionAnswers.answeredAt, desde),
                          ),
                      )
                      .groupBy(questionAnswers.userId)
                : Promise.resolve(null),
            streaksTodos(),
        ]);

        const paraMapa = (arr: { userId: string; n: number }[] | null) =>
            new Map((arr ?? []).map((a) => [a.userId, Number(a.n)]));
        const at = paraMapa(aulasTot),
            acT = paraMapa(acertosTot);
        const aP = desde ? paraMapa(aulasPer) : at;
        const acP = desde ? paraMapa(acertosPer) : acT;

        const base = usuarios.map((u) => {
            const totalXp = (at.get(u.id) ?? 0) * 50 + (acT.get(u.id) ?? 0) * 10;
            const periodXp = (aP.get(u.id) ?? 0) * 50 + (acP.get(u.id) ?? 0) * 10;
            return {
                id: u.id,
                name: u.name,
                username: u.username,
                totalXp,
                periodXp,
                level: Math.floor(totalXp / 500) + 1,
                streak: streaks.get(u.id) ?? 0,
                you: u.id === req.userId,
            };
        });
        const ordenados = [...base]
            .sort((a, b) => b.periodXp - a.periodXp)
            .map((u, i) => ({ ...u, position: i + 1 }));
        // Movimentação é calculada sobre o ranking geral (XP total).
        const ordemGeral = [...base]
            .sort((a, b) => b.totalXp - a.totalXp)
            .map((u, i) => ({ id: u.id, position: i + 1 }));
        const deltas = await movimentacaoRanking(hojeSaoPaulo(), ordemGeral);

        const meu = ordenados.find((u) => u.you);
        const me = meu
            ? {
                  position: meu.position,
                  username: meu.username,
                  xp: meu.periodXp,
                  totalXp: meu.totalXp,
                  level: meu.level,
                  streak: meu.streak,
                  delta: deltas.get(meu.id) ?? 0,
              }
            : null;
        const rows = ordenados.slice(0, 20).map((u) => ({
            position: u.position,
            name: u.name,
            username: u.username,
            xp: u.periodXp,
            level: u.level,
            streak: u.streak,
            delta: deltas.get(u.id) ?? 0,
            you: u.you,
        }));
        res.json({ me, rows });
    } catch (err) {
        next(err);
    }
};

// Streak do usuário + os últimos 7 dias (para o card da home).
export const getMyStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dias = await diasAtivosDoUsuario(req.userId!);
        res.json({ streak: calcularStreak(dias), week: semanaAtividade(dias) });
    } catch (err) {
        next(err);
    }
};

// Verifica uma única resposta para o quiz em carrossel (feedback imediato), sem
// expor o gabarito das outras questões. Não grava nada: a conclusão da aula
// continua sendo decidida no submitQuiz.
export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const lessonId = String(req.params.id);
        const { questionId, optionId } = checkAnswerSchema.parse(req.body);

        const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }
        if (!aula.published && !(await ehAdmin(userId))) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const estado = await estadoDaAula(userId, aula);
        if (estado === "locked") {
            return res.status(403).json({ erro: "Aula bloqueada. Conclua a aula anterior." });
        }

        // A questão precisa pertencer a esta aula.
        const [questao] = await db
            .select({ id: questions.id })
            .from(questions)
            .where(and(eq(questions.id, questionId), eq(questions.lessonId, lessonId)));
        if (!questao) {
            return res.status(404).json({ erro: "Questão não encontrada" });
        }

        const [correta] = await db
            .select({ id: questionOptions.id })
            .from(questionOptions)
            .where(
                and(
                    eq(questionOptions.questionId, questionId),
                    eq(questionOptions.isCorrect, true),
                ),
            );
        if (!correta) {
            return res.status(500).json({ erro: "Questão sem gabarito" });
        }

        res.json({ correct: correta.id === optionId, correctOptionId: correta.id });
    } catch (err) {
        next(err);
    }
};

// Publica ou despublica uma aula (admin). Body: { published: boolean }
export const setLessonPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { published } = req.body;
        if (typeof published !== "boolean") {
            return res.status(400).json({ erro: "Campo 'published' deve ser booleano" });
        }

        const [aula] = await db
            .update(lessons)
            .set({ published })
            .where(eq(lessons.id, lessonId))
            .returning({ id: lessons.id, title: lessons.title, published: lessons.published });

        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        res.json(aula);
    } catch (err) {
        next(err);
    }
};

// ===================== ESTÚDIO (admin) =====================

// Estrutura do curso para o editor: módulos ordenados com suas aulas (inclui rascunhos).
export const getTrailStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const [trilha] = await db
            .select({ id: trails.id, name: trails.name })
            .from(trails)
            .where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const mods = await db
            .select()
            .from(modules)
            .where(eq(modules.trailId, trailId))
            .orderBy(asc(modules.position));
        const aulas = await db
            .select({
                id: lessons.id,
                moduleId: lessons.moduleId,
                title: lessons.title,
                position: lessons.position,
                published: lessons.published,
            })
            .from(lessons)
            .where(eq(lessons.trailId, trailId))
            .orderBy(asc(lessons.position));

        res.json({
            id: trilha.id,
            name: trilha.name,
            modules: mods.map((m) => ({
                id: m.id,
                title: m.title,
                position: m.position,
                lessons: aulas.filter((a) => a.moduleId === m.id),
            })),
        });
    } catch (err) {
        next(err);
    }
};

// Aula completa para edição: inclui o gabarito e a dificuldade (só admin).
export const getLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const [aula] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const qs = await db
            .select()
            .from(questions)
            .where(eq(questions.lessonId, lessonId))
            .orderBy(asc(questions.position));
        const qIds = qs.map((q) => q.id);
        const opts = qIds.length
            ? await db
                  .select()
                  .from(questionOptions)
                  .where(inArray(questionOptions.questionId, qIds))
                  .orderBy(asc(questionOptions.position))
            : [];

        res.json({
            id: aula.id,
            moduleId: aula.moduleId,
            title: aula.title,
            content: aula.content,
            contentBlocks:
                aula.contentBlocks ?? (aula.content ? [{ type: "text", value: aula.content }] : []),
            published: aula.published,
            position: aula.position,
            questions: qs.map((q) => ({
                id: q.id,
                statement: q.statement,
                difficulty: q.difficulty,
                position: q.position,
                options: opts
                    .filter((o) => o.questionId === q.id)
                    .map((o) => ({
                        id: o.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: o.position,
                    })),
            })),
        });
    } catch (err) {
        next(err);
    }
};

// Exclui uma aula e tudo que depende dela.
export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        await db.transaction(async (tx) => {
            const qs = await tx
                .select({ id: questions.id })
                .from(questions)
                .where(eq(questions.lessonId, lessonId));
            const qIds = qs.map((q) => q.id);
            if (qIds.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
                await tx.delete(questions).where(inArray(questions.id, qIds));
            }
            await tx.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));
            await tx.delete(lessons).where(eq(lessons.id, lessonId));
        });

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Serializa os blocos em markdown (fallback para o aluno e para conteúdo legado).
function blocosParaMarkdown(blocos: { type: string; value: string }[]): string {
    return blocos
        .map((b) => {
            switch (b.type) {
                case "code":
                    return "```\n" + b.value + "\n```";
                case "quote":
                    return b.value
                        .split("\n")
                        .map((l) => "> " + l)
                        .join("\n");
                case "image":
                    return `![imagem](${b.value})`;
                case "video":
                    return `[Vídeo](${b.value})`;
                default:
                    return b.value;
            }
        })
        .join("\n\n");
}

// Salva a aula inteira (título, blocos de conteúdo e questões de uma vez). Substitui
// as questões por completo. Valida o conteúdo apenas quando vai publicar.
export const saveLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = saveLessonStudioSchema.parse(req.body);

        const [aula] = await db
            .select({ id: lessons.id })
            .from(lessons)
            .where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        if (dados.published) {
            if (dados.questions.length < QUIZ_MIN_ACERTOS) {
                return res.status(400).json({
                    erro: `Para publicar, a aula precisa de ao menos ${QUIZ_MIN_ACERTOS} questões.`,
                });
            }
            for (const [i, q] of dados.questions.entries()) {
                if (q.statement.trim().length < 3) {
                    return res
                        .status(400)
                        .json({ erro: `Questão ${i + 1}: enunciado muito curto.` });
                }
                if (q.options.filter((o) => o.text.trim().length > 0).length < 2) {
                    return res
                        .status(400)
                        .json({ erro: `Questão ${i + 1}: precisa de ao menos 2 alternativas.` });
                }
                if (q.options.filter((o) => o.isCorrect).length !== 1) {
                    return res.status(400).json({
                        erro: `Questão ${i + 1}: marque exatamente uma alternativa correta.`,
                    });
                }
            }
        }

        await db.transaction(async (tx) => {
            const blocos = dados.contentBlocks ?? [];
            await tx
                .update(lessons)
                .set({
                    title: dados.title,
                    contentBlocks: blocos,
                    content: blocos.length ? blocosParaMarkdown(blocos) : null,
                    ...(dados.published === undefined ? {} : { published: dados.published }),
                })
                .where(eq(lessons.id, lessonId));

            const qs = await tx
                .select({ id: questions.id })
                .from(questions)
                .where(eq(questions.lessonId, lessonId));
            const qIds = qs.map((q) => q.id);
            if (qIds.length) {
                await tx.delete(questionAnswers).where(inArray(questionAnswers.questionId, qIds));
                await tx.delete(questionOptions).where(inArray(questionOptions.questionId, qIds));
                await tx.delete(questions).where(inArray(questions.id, qIds));
            }

            for (const [i, q] of dados.questions.entries()) {
                const [nova] = await tx
                    .insert(questions)
                    .values({
                        lessonId,
                        statement: q.statement,
                        difficulty: q.difficulty ?? "facil",
                        position: i + 1,
                    })
                    .returning({ id: questions.id });
                if (q.options.length) {
                    await tx.insert(questionOptions).values(
                        q.options.map((o, oi) => ({
                            questionId: nova.id,
                            text: o.text,
                            isCorrect: o.isCorrect,
                            position: oi + 1,
                        })),
                    );
                }
            }
        });

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
