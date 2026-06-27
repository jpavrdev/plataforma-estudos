import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import { trails, lessons, lessonProgress } from "../../schema.ts";
import { eq, and, count, asc } from "drizzle-orm";
import { createTrailSchema, createLessonSchema } from "../schemas/trail.schemas.ts";

export const createTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTrailSchema.parse(req.body);

        const [trilha] = await db.insert(trails).values({
            name: dados.name,
            trailLevel: dados.level,
            description: dados.description
        }).returning({
            id: trails.id,
            name: trails.name,
            trailLevel: trails.trailLevel,
            description: trails.description,
            createdAt: trails.createdAt
        });

        res.status(201).json(trilha);
    } catch (err) {
        next(err);
    }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = createLessonSchema.parse(req.body);

        const [trilha] = await db.select({ id: trails.id }).from(trails).where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const [aula] = await db.insert(lessons).values({
            trailId,
            title: dados.title,
            content: dados.content,
            position: dados.position
        }).returning({
            id: lessons.id,
            trailId: lessons.trailId,
            title: lessons.title,
            content: lessons.content,
            position: lessons.position
        });

        res.status(201).json(aula);
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
                totalLessons: count(lessons.id)
            })
            .from(trails)
            .leftJoin(lessons, eq(lessons.trailId, trails.id))
            .groupBy(trails.id);

        res.json(lista);
    } catch (err) {
        next(err);
    }
};

export const getTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);

        const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
        if (!trilha) {
            return res.status(404).json({ erro: "Trilha não encontrada" });
        }

        const aulas = await db
            .select({
                id: lessons.id,
                title: lessons.title,
                content: lessons.content,
                position: lessons.position
            })
            .from(lessons)
            .where(eq(lessons.trailId, trailId))
            .orderBy(asc(lessons.position));

        res.json({ ...trilha, lessons: aulas });
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

        // Total de aulas por trilha
        const totais = await db
            .select({ trailId: lessons.trailId, total: count(lessons.id) })
            .from(lessons)
            .groupBy(lessons.trailId);
        const totalPorTrilha = new Map(totais.map((t) => [t.trailId, Number(t.total)]));

        // Aulas concluídas pelo usuário, agrupadas por trilha
        const feitas = await db
            .select({ trailId: lessons.trailId, feitas: count(lessonProgress.id) })
            .from(lessonProgress)
            .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
            .where(eq(lessonProgress.userId, userId))
            .groupBy(lessons.trailId);

        if (feitas.length === 0) {
            return res.json([]);
        }

        // Busca os dados das trilhas que o usuário começou
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
                    progress: pct
                };
            });

        res.json(resultado);
    } catch (err) {
        next(err);
    }
};

export const completeLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "Não autenticado" });
        }
        const lessonId = String(req.params.id);

        const [aula] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, lessonId));
        if (!aula) {
            return res.status(404).json({ erro: "Aula não encontrada" });
        }

        // Já concluída? (idempotência: não duplica, respeita o unique user+lesson)
        const [existente] = await db
            .select({ id: lessonProgress.id })
            .from(lessonProgress)
            .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));

        if (existente) {
            return res.status(200).json({ mensagem: "Aula já concluída" });
        }

        await db.insert(lessonProgress).values({ userId, lessonId });

        res.status(201).json({ mensagem: "Aula concluída" });
    } catch (err) {
        next(err);
    }
};
