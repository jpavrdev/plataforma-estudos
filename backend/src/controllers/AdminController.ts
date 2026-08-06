import type { Request, Response, NextFunction } from "express";
import { visaoGeral, usuariosCrm } from "../services/admin.service.ts";

export const getVisaoGeral = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await visaoGeral());
    } catch (err) {
        next(err);
    }
};

export const getUsuariosCrm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q : undefined;
        const pagina = Math.max(1, Number(req.query.pagina) || 1);
        const porPagina = Math.min(100, Math.max(5, Number(req.query.porPagina) || 20));
        const ordenarPor =
            typeof req.query.ordenarPor === "string" ? req.query.ordenarPor : undefined;
        const direcao = req.query.direcao === "asc" ? "asc" : "desc";
        res.json(await usuariosCrm(q, pagina, porPagina, ordenarPor, direcao));
    } catch (err) {
        next(err);
    }
};
