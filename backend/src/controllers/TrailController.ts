import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import {
    users, trails, modules, lessons, lessonProgress,
    questions, questionOptions, questionAnswers,
} from "../../schema.ts";
import { eq, and, count, asc, inArray } from "drizzle-orm";
import {
    createTrailSchema, createModuleSchema, createLessonSchema,
    createQuestionSchema, submitQuizSchema,
} from "../schemas/trail.schemas.ts";

const QUIZ_MIN_ACERTOS = 4;

async function ehAdmin(userId: string): Promise<boolean> {
    const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    return u?.role === "admin";
}

export const createTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTrailSchema.parse(req.body);
        const [trilha] = await db.insert(trails).values({
            name: dados.name,
            trailLevel: dados.level,
            description: dados.description,
        }).returning();
        res.status(201).json(trilha);
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = createModuleSchema.parse(req.body);

        const [trilha] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const [modulo] = await db.insert(modules).values({
            trailId,
            title: dados.title,
            position: dados.position,
        }).returning();
        res.status(201).json(modulo);
    } catch (err) {
        next(err);
    }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const dados = createLessonSchema.parse(req.body);

        const [modulo] = await db.select({ id: modules.id, trailId: modules.trailId })
            .from(modules).where(eq(modules.id, moduleId));
        if (!modulo) {
            return res.status(404).json({ erro: "Módulo não encontrado" });
        }

        const [aula] = await db.insert(lessons).values({
            trailId: modulo.trailId,
            moduleId,
            title: dados.title,
            content: dados.content,
            position: dados.position,
        }).returning();
        res.status(201).json(aula);
    } catch (err) {
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = createQuestionSchema.parse(req.body);

        const [aula] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const criada = await db.transaction(async (tx) => {
            const [questao] = await tx.insert(questions).values({
                lessonId,
                statement: dados.statement,
                position: dados.position,
            }).returning();

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
        res.json(lista);
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

        const mods = await db.select().from(modules)
            .where(eq(modules.trailId, trailId)).orderBy(asc(modules.position));

        // Aluno vê só aulas publicadas; admin vê todas (para gerenciar).
        const todasAulas = await db.select().from(lessons)
            .where(eq(lessons.trailId, trailId)).orderBy(asc(lessons.position));
        const aulas = admin ? todasAulas : todasAulas.filter((a) => a.published);

        const concluidas = new Set(
            (await db.select({ lessonId: lessonProgress.lessonId })
                .from(lessonProgress)
                .where(eq(lessonProgress.userId, userId!))
            ).map((p) => p.lessonId),
        );

        // Ordem linear da trilha: por módulo (position) e, dentro, por aula (position).
        const ordenadas = mods.flatMap((m) =>
            aulas.filter((a) => a.moduleId === m.id).sort((a, b) => a.position - b.position),
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
    const irmas = await db.select({ id: lessons.id, moduleId: lessons.moduleId, position: lessons.position })
        .from(lessons).where(and(eq(lessons.trailId, aula.trailId), eq(lessons.published, true)));
    const mods = await db.select({ id: modules.id, position: modules.position })
        .from(modules).where(eq(modules.trailId, aula.trailId));
    const ordemModulo = new Map(mods.map((m) => [m.id, m.position]));

    const ordenadas = [...irmas].sort((a, b) => {
        const pm = (ordemModulo.get(a.moduleId) ?? 0) - (ordemModulo.get(b.moduleId) ?? 0);
        return pm !== 0 ? pm : a.position - b.position;
    });

    const concluidas = new Set(
        (await db.select({ lessonId: lessonProgress.lessonId })
            .from(lessonProgress).where(eq(lessonProgress.userId, userId))
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

        // Aula não publicada é invisível para o aluno; admin pode visualizar.
        if (!aula.published && !(await ehAdmin(userId))) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        const estado = await estadoDaAula(userId, aula);
        if (estado === "locked") {
            return res.status(403).json({ erro: "Aula bloqueada. Conclua a aula anterior." });
        }

        const qs = await db.select().from(questions)
            .where(eq(questions.lessonId, lessonId)).orderBy(asc(questions.position));
        const qIds = qs.map((q) => q.id);
        const opts = qIds.length
            ? await db.select().from(questionOptions)
                .where(inArray(questionOptions.questionId, qIds)).orderBy(asc(questionOptions.position))
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

        const qs = await db.select({ id: questions.id }).from(questions).where(eq(questions.lessonId, lessonId));
        const qIds = qs.map((q) => q.id);
        if (qIds.length === 0) {
            return res.status(400).json({ erro: "Esta aula não tem questões" });
        }

        const opts = await db.select().from(questionOptions).where(inArray(questionOptions.questionId, qIds));
        const corretaPorQuestao = new Map<string, string>();
        for (const o of opts) {
            if (o.isCorrect) corretaPorQuestao.set(o.questionId, o.id);
        }

        let acertos = 0;
        for (const resp of dados.answers) {
            if (corretaPorQuestao.get(resp.questionId) === resp.optionId) acertos++;
        }
        const total = qIds.length;
        const passou = acertos >= QUIZ_MIN_ACERTOS;

        let aulaConcluida = false;
        if (passou) {
            const [existe] = await db.select({ id: lessonProgress.id }).from(lessonProgress)
                .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
            if (!existe) {
                await db.insert(lessonProgress).values({ userId, lessonId });
            }
            aulaConcluida = true;
        }

        res.json({ correct: acertos, total, passed: passou, lessonCompleted: aulaConcluida });
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

        const [aula] = await db.update(lessons)
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
