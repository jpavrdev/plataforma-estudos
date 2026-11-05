import type { Request, Response, NextFunction } from "express";
import { tokenMatches, tokenFromHeader } from "../domain/dependencies.ts";

export function exigirTokenDoMonitor(tokenEsperado: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!tokenMatches(tokenFromHeader(req.headers.authorization), tokenEsperado)) {
            return res.status(401).json({ erro: "Não autorizado" });
        }
        next();
    };
}
