import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    forgotPasswordOtpSchema,
    resetPasswordOtpSchema,
} from "../schemas/auth.schema.ts";
import {
    hashPassword,
    verifyPassword,
    needsRehash,
    getDummyHash,
} from "../services/password.service.ts";
import { db } from "../../db.ts";
import { users, tokens, oauthAccounts } from "../../schema.ts";
import { eq, and, isNull } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";
import { authService, refreshCookieOptions } from "../services/auth.service.ts";
import { twoFactorService } from "../services/twoFactor.service.ts";
import { twoFactorLoginSchema } from "../schemas/twoFactor.schema.ts";
import { createHash } from "node:crypto";
import { emailService } from "../services/email.service.ts";
import { whatsappService } from "../services/whatsapp.service.ts";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = registerSchema.parse(req.body);

        // The username is lowercased and unique. The schema regex already blocks any
        // character outside [a-zA-Z0-9_], so it is safe against injection.
        const username = input.username.toLowerCase();
        const [usernameTaken] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username));
        if (usernameTaken) {
            return res.status(409).json({ erro: "auth.usernameTaken" });
        }

        const [emailTaken] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.email));
        if (emailTaken) {
            return res.status(409).json({ erro: "auth.emailTaken" });
        }

        const passwordHash = await hashPassword(input.password);

        // Atomic: creates the user and the first tokens together.
        const created = await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    name: input.name,
                    username,
                    email: input.email,
                    passwordHash,
                    birthDate: input.birthDate,
                    gender: input.gender,
                    phone: input.phone,
                    locale: req.locale,
                })
                .returning({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    email: users.email,
                    birthDate: users.birthDate,
                    gender: users.gender,
                    phone: users.phone,
                });

            const verificationToken = await authService.createVerificationToken(createdUser.id, tx);

            return { user: createdUser, verificationToken };
        });

        const { user, verificationToken } = created;

        await emailService.sendVerification(user.email, verificationToken, req.locale);

        res.status(201).json({
            mensagem: "auth.accountCreated",
            user,
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const input = loginSchema.parse(req.body);

        const found = await db.select().from(users).where(eq(users.email, input.email));
        const user = found[0];

        // Locked account? Refuses before spending the hash. Generic message (the same as the
        // rate limit) so "locked" cannot be told apart from "too many attempts from this IP".
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(429).json({ erro: "auth.tooManyAttempts" });
        }

        // Picks the hash to compare. A user with a password uses theirs; no user (or a
        // social-only account without a password) falls on a dummy hash and the comparison fails.
        const hashToCompare = user?.passwordHash ?? (await getDummyHash());

        const passwordMatches = await verifyPassword(hashToCompare, input.password);

        if (!user || !passwordMatches) {
            // Failed attempts only count for existing users; the fifth one locks the account.
            if (user) await authService.recordFailedLogin(user.id);
            return res.status(401).json({ erro: "auth.invalidCredentials" });
        }

        // A right password resets the counter, except with 2FA: then only a right
        // code does, or a right password plus wrong codes would never lock the account.
        const hasTwoFactor = await twoFactorService.isEnabled(user.id);
        if (!hasTwoFactor && (user.failedLoginAttempts > 0 || user.lockedUntil)) {
            await authService.resetFailedLogins(user.id);
        }

        // Transparent hash migration: an old bcrypt hash becomes argon2 on the first login.
        if (user.passwordHash && needsRehash(user.passwordHash)) {
            const newHash = await hashPassword(input.password);
            await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
        }

        if (!user.emailVerifiedAt) {
            return res.status(403).json({ erro: "auth.verifyEmailFirst" });
        }

        if (hasTwoFactor) {
            return res.json({ challenge: await twoFactorService.createChallenge(user.id) });
        }

        const { accessToken, refreshToken } = await authService.issueSessionTokens(user.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/",
        });

        res.json({ name: user.name, email: user.email, token: accessToken });
    } catch (err) {
        next(err);
    }
};

// Second login step for 2FA accounts: the challenge opened by the password (or
// by the social login) plus an app code or a recovery code.
export const loginTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = twoFactorLoginSchema.parse(req.body);
        const { userId, method } = await twoFactorService.resolveChallenge(
            data.challenge,
            data.code,
        );
        const [user] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, userId));
        const { accessToken, refreshToken } = await authService.issueSessionTokens(userId, db, {
            mfa: true,
        });
        res.cookie("refreshToken", refreshToken, refreshCookieOptions);
        res.json({
            name: user.name,
            email: user.email,
            token: accessToken,
            ...(method === "recovery"
                ? {
                      recoveryCodesLeft: (await twoFactorService.status(userId)).recoveryCodesLeft,
                  }
                : {}),
        });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ erro: "auth.invalidRefreshToken" });
        }

        // Hashed the same way as the stored token.
        const computedHash = createHash("sha256").update(refreshToken).digest("hex");

        // Session tokens only: the verification and password ones (including the 6-digit
        // code, whose hash is of "<userId>:<code>") could come through the same cookie.
        const [record] = await db
            .select({
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, computedHash), eq(tokens.type, "refresh")));

        if (!record) {
            return res.status(401).json({ erro: "auth.invalidRefreshToken" });
        }

        if (record.expiredAt < new Date()) {
            return res.status(401).json({ erro: "auth.invalidRefreshToken" });
        }

        // It exists and has not expired, but was already used
        if (record.usedAt !== null) {
            // Presumed theft. Revokes all the user's tokens.
            await db.delete(tokens).where(eq(tokens.userId, record.userId));
            return res.status(401).json({ erro: "auth.invalidRefreshToken" });
        }

        const mfa = await twoFactorService.isEnabled(record.userId);

        // Drops the old token and creates the new one atomically.
        const newTokens = await db.transaction(async (tx) => {
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, computedHash));
            // With 2FA on, every live session went through the code: the older ones
            // are dropped when it gets enabled.
            return await authService.issueSessionTokens(record.userId, tx, { mfa });
        });

        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/",
        });

        // The same answer format as the login.
        res.json({
            token: newTokens.accessToken,
        });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const computedHash = createHash("sha256").update(refreshToken).digest("hex");
            await db
                .delete(tokens)
                .where(and(eq(tokens.tokenHash, computedHash), eq(tokens.type, "refresh")));
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ erro: "auth.missingToken" });
        }

        // Hashed the same way as the stored token.
        const computedHash = createHash("sha256").update(token).digest("hex");

        // Looks up by hash AND type (a refresh token cannot be used here).
        const [record] = await db
            .select({
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, computedHash), eq(tokens.type, "email_verification")));

        if (!record) {
            return res.status(400).json({ erro: "auth.invalidToken" });
        }

        if (record.expiredAt < new Date()) {
            return res.status(400).json({ erro: "auth.invalidToken" });
        }

        if (record.usedAt !== null) {
            return res.status(400).json({ erro: "auth.invalidToken" });
        }

        // Marks the token as used and the email as verified, atomically.
        await db.transaction(async (tx) => {
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, computedHash));

            await tx
                .update(users)
                .set({ emailVerifiedAt: new Date() })
                .where(eq(users.id, record.userId));
        });

        res.json({ mensagem: "auth.emailVerified" });
    } catch (err) {
        next(err);
    }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Generic answer, so it does not reveal whether the email has an account or was already verified.
        const genericAnswer = {
            mensagem: "auth.verificationResent",
        };

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                emailVerifiedAt: users.emailVerifiedAt,
                locale: users.locale,
            })
            .from(users)
            .where(eq(users.email, email));

        // Only resends when the account exists and is not verified yet.
        if (user && !user.emailVerifiedAt) {
            const token = await authService.createVerificationToken(user.id);
            await emailService.sendVerification(user.email, token, user.locale);
        }

        res.json(genericAnswer);
    } catch (err) {
        next(err);
    }
};

// Which provider the account signs in with today, only so the email speaks the
// reader's terms ("your account signs in with Google"). Returns null when there is
// none, and the text falls back to the generic form.
const PROVIDER_NAMES: Record<string, string> = { google: "Google", github: "GitHub" };

async function providerOf(userId: string): Promise<string | null> {
    const [account] = await db
        .select({ provider: oauthAccounts.provider })
        .from(oauthAccounts)
        .where(eq(oauthAccounts.userId, userId))
        .limit(1);
    if (!account) return null;
    return PROVIDER_NAMES[account.provider] ?? account.provider;
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Always a generic answer, so it does not reveal whether the email has an account.
        const genericAnswer = {
            mensagem: "auth.resetLinkSent",
        };

        const [user] = await db
            .select({ id: users.id, passwordHash: users.passwordHash, locale: users.locale })
            .from(users)
            .where(eq(users.email, email));

        // An account that came through social login has no password to reset, but has one
        // to CREATE. Its request used to be dropped silently: the person was told the link
        // had been sent and nothing ever arrived. Now the link goes out the same way, only
        // with the right text for that case.
        if (user) {
            const token = await authService.createPasswordResetToken(user.id);
            if (user.passwordHash) {
                await emailService.sendPasswordReset(email, token, user.locale);
            } else {
                const provider = await providerOf(user.id);
                await emailService.sendCreatePassword(email, token, provider, user.locale);
            }
        }

        res.json(genericAnswer);
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);

        const computedHash = createHash("sha256").update(token).digest("hex");
        const [record] = await db
            .select({
                id: tokens.id,
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, computedHash), eq(tokens.type, "password_reset")));

        if (!record || record.expiredAt < new Date() || record.usedAt !== null) {
            return res.status(400).json({ erro: "auth.invalidLink" });
        }

        const passwordHash = await hashPassword(password);

        await db.transaction(async (tx) => {
            await tx.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, record.id));
            await tx.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
            // Revokes the open sessions (refresh tokens) for safety.
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(
                    and(
                        eq(tokens.userId, record.userId),
                        eq(tokens.type, "refresh"),
                        isNull(tokens.usedAt),
                    ),
                );
        });

        const [owner] = await db
            .select({ email: users.email, locale: users.locale })
            .from(users)
            .where(eq(users.id, record.userId));
        if (owner) await emailService.sendPasswordChangedNotice(owner.email, owner.locale);

        res.json({ mensagem: "auth.passwordReset" });
    } catch (err) {
        next(err);
    }
};

// Recovery by code (OTP): the user chooses to receive it by email or WhatsApp.
export const forgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, canal: channel } = forgotPasswordOtpSchema.parse(req.body);

        // Generic answer, so it does not reveal whether the email has an account.
        const genericAnswer = {
            mensagem: "auth.resetCodeSent",
        };

        const [user] = await db
            .select({
                id: users.id,
                phone: users.phone,
                phoneVerifiedAt: users.phoneVerifiedAt,
                passwordHash: users.passwordHash,
                locale: users.locale,
            })
            .from(users)
            .where(eq(users.email, email));

        // Without a new code (a repeated request within a minute on the same
        // channel, or the daily limit), the answer is the same: the previous
        // code stays valid until it expires.
        const otp = user ? await authService.createPasswordResetCode(user.id, channel) : null;
        if (user && otp) {
            // WhatsApp only for a verified phone: a number never confirmed may belong to
            // someone else. Without it, it falls back to email so the code is not lost.
            if (channel === "whatsapp" && user.phone && user.phoneVerifiedAt) {
                await whatsappService.sendResetCode(user.phone, otp, user.locale);
            } else if (user.passwordHash) {
                await emailService.sendResetCode(email, otp, user.locale);
            } else {
                // Same fix as the link path: an account without a password gets the code to
                // create one, instead of the request dying silently.
                const provider = await providerOf(user.id);
                await emailService.sendCreatePasswordCode(email, otp, provider, user.locale);
            }
        }

        res.json(genericAnswer);
    } catch (err) {
        next(err);
    }
};

export const resetPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password } = resetPasswordOtpSchema.parse(req.body);
        const genericError = { erro: "auth.invalidCode" };

        const [user] = await db
            .select({ id: users.id, locale: users.locale })
            .from(users)
            .where(eq(users.email, email));
        if (!user) return res.status(400).json(genericError);

        const tokenId = await authService.checkPasswordResetCode(user.id, otp);
        if (!tokenId) return res.status(400).json(genericError);

        const passwordHash = await hashPassword(password);

        await db.transaction(async (tx) => {
            await tx.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, tokenId));
            await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
            // Revokes the open sessions (refresh tokens) for safety.
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(
                    and(
                        eq(tokens.userId, user.id),
                        eq(tokens.type, "refresh"),
                        isNull(tokens.usedAt),
                    ),
                );
        });

        await emailService.sendPasswordChangedNotice(email, user.locale);

        res.json({ mensagem: "auth.passwordReset" });
    } catch (err) {
        next(err);
    }
};
