import type { Request, Response, NextFunction } from "express";
import { overview, crmUsers, accessOverview } from "../services/admin.service.ts";

export const getOverview = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await overview());
    } catch (err) {
        next(err);
    }
};

export const getAccessOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = Number(req.query.dias) || 30;
        res.json(await accessOverview(days));
    } catch (err) {
        next(err);
    }
};

export const getCrmUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const page = Math.max(1, Number(req.query.pagina) || 1);
        const perPage = Math.min(100, Math.max(5, Number(req.query.porPagina) || 20));
        const sortBy = typeof req.query.ordenarPor === "string" ? req.query.ordenarPor : undefined;
        const direction = req.query.direcao === "asc" ? "asc" : "desc";
        res.json(await crmUsers(q, page, perPage, sortBy, direction));
    } catch (err) {
        next(err);
    }
};
