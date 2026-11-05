import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db.ts";
import { twoFactorAuth, users } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { env } from "../config/env.ts";

// Vem do env já validado (exige 32 caracteres e derruba o boot se faltar). Ler
// process.env aqui direto não protegia nada: String(undefined) vira "undefined",
// que é truthy, então a checagem passava e o token seria assinado com essa string.
const JWT_SECRET = env.JWT_SECRET;

interface UserPayload {
    userId: string;
    mfa?: boolean;
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;

        req.userId = payload.userId;
        req.mfa = payload.mfa === true;

        next();
    } catch {
        return res.status(401).json({ erro: "Token inválido" });
    }
}

// What the session still lacks to use the admin routes: 2FA enabled and a
// session verified by the code. /me applies the same rule so the frontend can
// block the admin area, whose screens sometimes only read regular routes.
export function pendingTwoFactor(twoFactorEnabledAt: Date | null, mfa: boolean | undefined) {
    if (!env.ADMIN_REQUIRE_2FA) return null;
    if (!twoFactorEnabledAt) return "2fa_required" as const;
    if (!mfa) return "2fa_session" as const;
    return null;
}

const PENDING_TWO_FACTOR_MESSAGES = {
    "2fa_required":
        "Ative a verificação em duas etapas no seu perfil para usar as funções de administrador.",
    "2fa_session":
        "Entre de novo e confirme com o código do app autenticador para usar as funções de administrador.",
};

export async function exigirAdmin(req: Request, res: Response, next: NextFunction) {
    const idUsuario = req.userId;

    if (!idUsuario) {
        return res.status(401).json({ erro: "Não autenticado" });
    }

    const [registro] = await db
        .select({ role: users.role, twoFactorEnabledAt: twoFactorAuth.enabledAt })
        .from(users)
        .leftJoin(twoFactorAuth, eq(twoFactorAuth.userId, users.id))
        .where(eq(users.id, idUsuario));

    if (!registro || registro.role !== "admin") {
        return res.status(403).json({ erro: "Usuário não é administrador" });
    }

    // Turning 2FA off takes effect right away, without waiting for the marked token to expire.
    const pending = pendingTwoFactor(registro.twoFactorEnabledAt, req.mfa);
    if (pending) {
        return res.status(403).json({ erro: PENDING_TWO_FACTOR_MESSAGES[pending], code: pending });
    }

    next();
}
