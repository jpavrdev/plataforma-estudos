import type { Request, Response, NextFunction } from "express";
import {
    listLessonNotes,
    listTrailNotes,
    createNote,
    deleteNote,
} from "../services/note.service.ts";

export const getLessonNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listLessonNotes(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getTrailNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listTrailNotes(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const postNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tipo: kind, texto: body } = req.body ?? {};
        res.status(201).json(await createNote(req.userId!, String(req.params.id), kind, body));
    } catch (err) {
        next(err);
    }
};

export const removeNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteNote(req.userId!, String(req.params.id));
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};
