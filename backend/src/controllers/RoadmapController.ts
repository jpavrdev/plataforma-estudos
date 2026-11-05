import type { Request, Response, NextFunction } from "express";
import {
    saveStageCompletion,
    findRoadmaps,
    findRoadmapBySlug,
    findNextTrailAfterCompletion,
    findRoadmapsForStudio,
    findStudioRoadmap,
    insertRoadmap,
    editRoadmap,
    removeRoadmap,
    insertStage,
    editStage,
    removeStage,
    insertStageRef,
    removeStageRef,
    saveFollow,
    saveVisit,
    saveEntryFromRoadmap,
} from "../services/roadmap.service.ts";
import {
    createRoadmapSchema,
    updateRoadmapSchema,
    createStageSchema,
    updateStageSchema,
    createRefSchema,
} from "../schemas/roadmap.schema.ts";

// ===================== Reading (student) =====================
export const listRoadmaps = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findRoadmaps(req.userId));
    } catch (err) {
        next(err);
    }
};

export const getRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = typeof req.params.slug === "string" ? req.params.slug : "";
        const roadmap = await findRoadmapBySlug(slug, req.userId);
        if (!roadmap) return res.status(404).json({ erro: "Roadmap não encontrado" });
        // Opening the detail refreshes the recency of whoever ALREADY follows, and only
        // that: opening does not make anyone follow, or just peeking at a roadmap would
        // make the app think you changed paths.
        if (req.userId) await saveVisit(req.userId, roadmap.id);
        res.json(roadmap);
    } catch (err) {
        next(err);
    }
};

// The student declares they follow this roadmap. Idempotent: calling it again only
// updates the last access date.
export const followRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = typeof req.params.slug === "string" ? req.params.slug : "";
        const roadmap = await findRoadmapBySlug(slug, req.userId);
        if (!roadmap) return res.status(404).json({ erro: "Roadmap não encontrado" });
        await saveFollow(req.userId!, roadmap.id, true);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

// Records that the student entered a track coming from this roadmap. It is not a
// declared choice, it is the path they are actually taking right now.
export const recordRoadmapEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = typeof req.params.slug === "string" ? req.params.slug : "";
        const roadmap = await findRoadmapBySlug(slug, req.userId);
        if (!roadmap) return res.status(404).json({ erro: "Roadmap não encontrado" });
        await saveEntryFromRoadmap(req.userId!, roadmap.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

export const getNextTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findNextTrailAfterCompletion(req.userId!, String(req.params.trailId)));
    } catch (err) {
        next(err);
    }
};

// ===================== Admin: roadmaps =====================
export const listRoadmapsStudio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findRoadmapsForStudio());
    } catch (err) {
        next(err);
    }
};

export const getRoadmapStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findStudioRoadmap(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createRoadmapSchema.parse(req.body);
        res.status(201).json(await insertRoadmap(data));
    } catch (err) {
        next(err);
    }
};

export const updateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateRoadmapSchema.parse(req.body);
        res.json(await editRoadmap(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const deleteRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeRoadmap(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== Admin: stages =====================
export const createStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createStageSchema.parse(req.body);
        res.status(201).json(await insertStage(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const updateStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateStageSchema.parse(req.body);
        res.json(await editStage(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const deleteStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeStage(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== Admin: content references =====================
export const createStageRef = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createRefSchema.parse(req.body);
        res.status(201).json(await insertStageRef(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const deleteStageRef = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeStageRef(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const completeStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await saveStageCompletion(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};
