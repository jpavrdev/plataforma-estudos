import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";

export function sameOrigin(req: Request, res: Response, next: NextFunction) {
    if (env.NODE_ENV !== "production") return next();
    const origin = req.headers.origin;
    if (origin && origin !== env.FRONTEND_URL) {
        return res.status(403).json({ error: "Origem não permitida" });
    }
    next();
}
