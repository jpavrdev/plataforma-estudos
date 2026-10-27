import type { Request, Response, NextFunction } from "express";
import { tokenConfere, tokenDoCabecalho } from "../domain/dependencias.ts";

export function exigirTokenDoMonitor(tokenEsperado: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!tokenConfere(tokenDoCabecalho(req.headers.authorization), tokenEsperado)) {
            return res.status(401).json({ erro: "Não autorizado" });
        }
        next();
    };
}
