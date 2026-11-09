import type { Request, Response, NextFunction } from "express";
import { checkDependencies } from "../services/dependencies.service.ts";

export const getHealth = (_req: Request, res: Response) => {
    res.json({ status: "ok" });
};

// Always 200, even with a dependency down: the body says what failed, and the
// monitor decides whether it becomes an alert.
export const getDependencies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await checkDependencies());
    } catch (err) {
        next(err);
    }
};
