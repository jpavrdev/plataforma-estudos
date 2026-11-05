import type { Request, Response, NextFunction } from "express";
import { tokenMatches, tokenFromHeader } from "../domain/dependencies.ts";

export function requireMonitorToken(expectedToken: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!tokenMatches(tokenFromHeader(req.headers.authorization), expectedToken)) {
            return res.status(401).json({ erro: "common.unauthorized" });
        }
        next();
    };
}
