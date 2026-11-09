import type { Request, Response, NextFunction } from "express";
import {
    createAnnouncementSchema,
    updateAnnouncementSchema,
    answerAnnouncementSchema,
} from "../schemas/announcement.schema.ts";
import {
    findActiveAnnouncement,
    saveAnswer,
    saveDismissal,
    insertAnnouncement,
    editAnnouncement,
    removeAnnouncement,
    listAnnouncementsWithStats,
    getAnnouncementResults,
} from "../services/announcement.service.ts";

export const getActiveAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findActiveAnnouncement(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const answerAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = answerAnnouncementSchema.parse(req.body);
        res.json(await saveAnswer(String(req.params.id), req.userId!, data));
    } catch (err) {
        next(err);
    }
};

export const dismissAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await saveDismissal(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createAnnouncementSchema.parse(req.body);
        res.status(201).json(await insertAnnouncement(data));
    } catch (err) {
        next(err);
    }
};

export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = updateAnnouncementSchema.parse(req.body);
        res.json(await editAnnouncement(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeAnnouncement(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const listStudioAnnouncements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listAnnouncementsWithStats());
    } catch (err) {
        next(err);
    }
};

export const getStudioAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await getAnnouncementResults(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
