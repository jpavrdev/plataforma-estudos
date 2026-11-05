import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../../db.ts";
import { tokens, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import {
    disableTwoFactorSchema,
    enableTwoFactorSchema,
    twoFactorCodeSchema,
} from "../schemas/twoFactor.schema.ts";
import { refreshCookieOptions } from "../services/auth.service.ts";
import { emailService } from "../services/email.service.ts";
import { verificarSenha } from "../services/password.service.ts";
import { twoFactorService } from "../services/twoFactor.service.ts";

async function account(userId: string) {
    const [user] = await db
        .select({ email: users.email, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userId));
    if (!user) throw new AppError(404, "Usuário não encontrado");
    return user;
}

// Social-login-only accounts have no password to check.
async function checkPassword(passwordHash: string | null, password: string | undefined) {
    if (!passwordHash) return;
    if (!password || !(await verificarSenha(passwordHash, password))) {
        throw new AppError(403, "Senha atual incorreta.");
    }
}

// Enabling recreates the current session. Without its cookie, a leaked access
// token would turn into a brand new 24-hour session.
async function hasSessionCookie(req: Request, userId: string) {
    const cookie: unknown = req.cookies?.refreshToken;
    if (typeof cookie !== "string") return false;
    const [record] = await db
        .select({ expiredAt: tokens.expiredAt, usedAt: tokens.usedAt })
        .from(tokens)
        .where(
            and(
                eq(tokens.tokenHash, createHash("sha256").update(cookie).digest("hex")),
                eq(tokens.type, "refresh"),
                eq(tokens.userId, userId),
            ),
        );
    return Boolean(record && !record.usedAt && record.expiredAt > new Date());
}

export const getTwoFactorStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { passwordHash } = await account(req.userId!);
        const status = await twoFactorService.status(req.userId!);
        res.json({ ...status, hasPassword: Boolean(passwordHash) });
    } catch (err) {
        next(err);
    }
};

export const startTwoFactorSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = await account(req.userId!);
        res.json(await twoFactorService.startSetup(req.userId!, email));
    } catch (err) {
        next(err);
    }
};

export const enableTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const data = enableTwoFactorSchema.parse(req.body);
        const user = await account(userId);
        await checkPassword(user.passwordHash, data.currentPassword);
        if (!(await hasSessionCookie(req, userId))) {
            throw new AppError(401, "Sessão inválida. Entre de novo.");
        }

        const { recoveryCodes, session } = await twoFactorService.enable(userId, data.code);
        res.cookie("refreshToken", session.refreshToken, refreshCookieOptions);
        await emailService.sendTwoFactorNotice(user.email, true);
        res.json({ recoveryCodes, token: session.accessToken });
    } catch (err) {
        next(err);
    }
};

export const regenerateRecoveryCodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const { code } = twoFactorCodeSchema.parse(req.body);
        if (!(await twoFactorService.isEnabled(userId))) {
            throw new AppError(409, "A verificação em duas etapas não está ativa.");
        }
        if (!(await twoFactorService.verify(userId, code))) {
            throw new AppError(403, "Código incorreto.");
        }
        res.json({ recoveryCodes: await twoFactorService.regenerateRecoveryCodes(userId) });
    } catch (err) {
        next(err);
    }
};

export const disableTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const data = disableTwoFactorSchema.parse(req.body);
        const user = await account(userId);
        await checkPassword(user.passwordHash, data.currentPassword);
        if (!(await twoFactorService.isEnabled(userId))) {
            throw new AppError(409, "A verificação em duas etapas não está ativa.");
        }
        if (!(await twoFactorService.verify(userId, data.code))) {
            throw new AppError(403, "Código incorreto.");
        }

        await twoFactorService.disable(userId);
        await emailService.sendTwoFactorNotice(user.email, false);
        res.json({ enabled: false });
    } catch (err) {
        next(err);
    }
};
