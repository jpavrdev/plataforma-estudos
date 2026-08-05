import type { Request, Response, NextFunction } from "express";
import { temFeature } from "../services/feature-flag.service.ts";

// Gate de rota por feature flag. Responde 404 (e não 403) pra não revelar que a
// feature existe a quem está fora do beta. Usar depois do autenticar.
export function exigirFeature(key: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "Não autenticado" });
        }
        try {
            if (!(await temFeature(userId, key))) {
                return res.status(404).json({ erro: "Não encontrado" });
            }
            next();
        } catch (e) {
            console.error(`exigirFeature: falha ao verificar o flag ${key}`, e);
            res.status(500).json({ erro: "Erro ao verificar acesso" });
        }
    };
}
