import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db.ts";
import { twoFactorAuth, users } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { env } from "../config/env.ts";

// Comes from the validated env (it requires 32 characters and stops the boot if
// missing). Reading process.env directly here protected nothing: String(undefined)
// becomes "undefined", which is truthy, so the check passed and tokens would be
// signed with that string.
const JWT_SECRET = env.JWT_SECRET;

interface UserPayload {
    userId: string;
    mfa?: boolean;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "auth.missingToken" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;

        req.userId = payload.userId;
        req.mfa = payload.mfa === true;

        next();
    } catch {
        return res.status(401).json({ erro: "auth.invalidToken" });
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
    "2fa_required": "twoFactor.required",
    "2fa_session": "twoFactor.sessionNotVerified",
};

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ erro: "common.notAuthenticated" });
    }

    const [account] = await db
        .select({ role: users.role, twoFactorEnabledAt: twoFactorAuth.enabledAt })
        .from(users)
        .leftJoin(twoFactorAuth, eq(twoFactorAuth.userId, users.id))
        .where(eq(users.id, userId));

    if (!account || account.role !== "admin") {
        return res.status(403).json({ erro: "auth.notAdmin" });
    }

    // Turning 2FA off takes effect right away, without waiting for the marked token to expire.
    const pending = pendingTwoFactor(account.twoFactorEnabledAt, req.mfa);
    if (pending) {
        return res.status(403).json({ erro: PENDING_TWO_FACTOR_MESSAGES[pending], code: pending });
    }

    next();
}
