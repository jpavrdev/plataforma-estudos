import type { Request, Response, NextFunction } from "express";
import { visaoGeral, usuariosCrm } from "../services/admin.service.ts";

export const getVisaoGeral = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await visaoGeral());
    } catch (err) {
        next(err);
    }
};

export const getUsuariosCrm = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await usuariosCrm());
    } catch (err) {
        next(err);
    }
};
