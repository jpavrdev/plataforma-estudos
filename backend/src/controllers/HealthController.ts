import type { Request, Response, NextFunction } from "express";
import { verificarDependencias } from "../services/dependencias.service.ts";

export const getHealth = (_req: Request, res: Response) => {
    res.json({ status: "ok" });
};

// Sempre 200, mesmo com dependência fora: o corpo diz o que falhou e quem decide
// se vira alerta é o monitor.
export const getDependencias = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await verificarDependencias());
    } catch (err) {
        next(err);
    }
};
