import type { Request, Response, NextFunction } from "express";
import { temFeature } from "../services/feature-flag.service.ts";

// Route gate by feature flag. It answers 404 (not 403) so it does not reveal that the
// feature exists to people outside the beta. Use it after authenticate.
export function requireFeature(key: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "common.notAuthenticated" });
        }
        try {
            if (!(await temFeature(userId, key))) {
                return res.status(404).json({ erro: "common.notFound" });
            }
            next();
        } catch (e) {
            console.error(`exigirFeature: falha ao verificar o flag ${key}`, e);
            res.status(500).json({ erro: "common.accessCheckFailed" });
        }
    };
}
