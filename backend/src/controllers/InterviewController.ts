import type { Request, Response, NextFunction } from "express";
import {
    buildQueue,
    parseLevel,
    summarizeProgress,
    listTopics,
} from "../services/interview.service.ts";
import { AppError } from "../errors/AppError.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// An interview session is a rehearsal, not a marathon: above this nobody finishes.
const MAX_LIMIT = 60;

function levelFromQuery(req: Request) {
    const level = parseLevel(req.query.nivel ? String(req.query.nivel) : undefined);
    if (!level) throw new AppError(400, "Nível inválido.");
    return level;
}

export const getTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listTopics(req.userId!, levelFromQuery(req)));
    } catch (err) {
        next(err);
    }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await summarizeProgress(req.userId!, levelFromQuery(req)));
    } catch (err) {
        next(err);
    }
};

export const getQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const level = levelFromQuery(req);
        const chosen = String(req.query.topicos ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => UUID.test(t));
        const requested = Number(req.query.limite);
        const limit =
            Number.isFinite(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : 20;
        res.json(await buildQueue(req.userId!, { nivel: level, topicos: chosen, limite: limit }));
    } catch (err) {
        next(err);
    }
};
