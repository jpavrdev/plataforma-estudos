import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "../../db.ts";
import { env } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { tokens, users } from "../../schema.ts";
import { and, eq, isNull, lt, sql } from "drizzle-orm";

const OTP_VALIDITY_MS = 10 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// Per account: one new code per minute, at most 10 a day, and each code dies on
// the fifth mistake. That is at most 50 guesses a day, from however many IPs.
const OTP_INTERVAL_MS = 60 * 1000;
const MAX_OTPS_PER_DAY = 10;
export const MAX_OTP_ATTEMPTS = 5;
// Wrong password or wrong 2FA code: on the fifth failure in a row the account
// locks for 15 minutes and the counter starts over.
const MAX_FAILED_LOGINS = 5;

// The same session cookie everywhere a session is opened (the /refresh calls
// are same-site).
export const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
};

type CodeType = "password_reset_otp" | "phone_verification";

// The hash is unique across the whole table, so the type goes into it and codes of
// different types do not collide. The password one keeps the old format, so the
// codes already sent stay valid through the deploy.
const codeHash = (userId: string, codeType: CodeType, code: string) =>
    createHash("sha256")
        .update(
            codeType === "password_reset_otp"
                ? `${userId}:${code}`
                : `${userId}:${codeType}:${code}`,
        )
        .digest("hex");

// 6-digit code. Only the hash is stored, with a single active code per user and
// type. Returns null when the account cannot get another one now: less than a
// minute since the last one on the same channel, or the daily limit reached.
// The one-minute window is per channel (a channel switch must still deliver),
// while the daily cap counts every channel together.
async function createCode(
    userId: string,
    codeType: CodeType,
    channel: string | null = null,
): Promise<string | null> {
    const ofUser = and(eq(tokens.userId, userId), eq(tokens.type, codeType));
    const now = Date.now();
    // A code older than a day no longer counts toward the limit.
    await db.delete(tokens).where(and(ofUser, lt(tokens.expiredAt, new Date(now - DAY_MS))));
    const recent = await db
        .select({
            tokenHash: tokens.tokenHash,
            expiredAt: tokens.expiredAt,
            channel: tokens.channel,
        })
        .from(tokens)
        .where(ofUser);
    const created = (code: { expiredAt: Date }) => code.expiredAt.getTime() - OTP_VALIDITY_MS;
    // Codes without a channel (written before the column existed) block every
    // channel: where they went is unknown.
    const sameChannel = recent.filter((t) => t.channel === channel || t.channel === null);
    const last = Math.max(0, ...sameChannel.map(created));
    if (now - last < OTP_INTERVAL_MS || recent.length >= MAX_OTPS_PER_DAY) {
        return null;
    }

    // The day's codes stay stored for the limit, and the hash cannot repeat.
    const usedHashes = new Set(recent.map((t) => t.tokenHash));
    let code = String(randomInt(100000, 1000000));
    while (usedHashes.has(codeHash(userId, codeType, code))) {
        code = String(randomInt(100000, 1000000));
    }

    await db.transaction(async (tx) => {
        // The previous one dies, but still counts toward the daily limit.
        await tx
            .update(tokens)
            .set({ usedAt: new Date(now) })
            .where(and(ofUser, isNull(tokens.usedAt)));
        await tx.insert(tokens).values({
            userId,
            tokenHash: codeHash(userId, codeType, code),
            type: codeType,
            expiredAt: new Date(now + OTP_VALIDITY_MS),
            channel,
        });
    });
    return code;
}

// Checks the code against the user's active one and returns the token id on a match.
// Each mistake adds an attempt in the database itself, so simultaneous attempts are
// not lost, and at the limit the code dies.
async function checkCode(userId: string, codeType: CodeType, code: string): Promise<string | null> {
    const [active] = await db
        .select({ id: tokens.id, tokenHash: tokens.tokenHash, expiredAt: tokens.expiredAt })
        .from(tokens)
        .where(and(eq(tokens.userId, userId), eq(tokens.type, codeType), isNull(tokens.usedAt)));
    if (!active || active.expiredAt < new Date()) return null;

    const matches = timingSafeEqual(
        Buffer.from(codeHash(userId, codeType, code), "hex"),
        Buffer.from(active.tokenHash, "hex"),
    );
    if (matches) return active.id;

    const [counted] = await db
        .update(tokens)
        .set({ tentativas: sql`${tokens.tentativas} + 1` })
        .where(eq(tokens.id, active.id))
        .returning({ tentativas: tokens.tentativas });
    if (counted && counted.tentativas >= MAX_OTP_ATTEMPTS) {
        await db.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, active.id));
    }
    return null;
}

export const authService = {
    // mfa marks a session that went through the 2FA code; admin routes require it.
    async issueSessionTokens(
        userId: string,
        tx: Pick<typeof db, "insert"> = db,
        options: { mfa?: boolean } = {},
    ) {
        const accessToken = jwt.sign(
            { userId, ...(options.mfa ? { mfa: true } : {}) },
            env.JWT_SECRET,
            { expiresIn: "15m" },
        );
        const refreshToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
            type: "refresh",
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        return { accessToken, refreshToken };
    },
    async recordFailedLogin(userId: string) {
        const attempts = sql`${users.failedLoginAttempts} + 1`;
        await db
            .update(users)
            .set({
                failedLoginAttempts: sql`case when ${attempts} >= ${MAX_FAILED_LOGINS} then 0 else ${attempts} end`,
                lockedUntil: sql`case when ${attempts} >= ${MAX_FAILED_LOGINS} then now() + interval '15 minutes' else ${users.lockedUntil} end`,
            })
            .where(eq(users.id, userId));
    },
    async resetFailedLogins(userId: string) {
        await db
            .update(users)
            .set({ failedLoginAttempts: 0, lockedUntil: null })
            .where(eq(users.id, userId));
    },
    async createVerificationToken(userId: string, tx: Pick<typeof db, "insert"> = db) {
        const verificationToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(verificationToken).digest("hex"),
            type: "email_verification",
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        return verificationToken;
    },
    async createPasswordResetToken(userId: string, tx: Pick<typeof db, "insert"> = db) {
        const resetToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(resetToken).digest("hex"),
            type: "password_reset",
            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        });

        return resetToken;
    },
    // 6-digit code to reset the password, by email or WhatsApp.
    createPasswordResetCode: (userId: string, channel?: string | null) =>
        createCode(userId, "password_reset_otp", channel ?? null),
    checkPasswordResetCode: (userId: string, otp: string) =>
        checkCode(userId, "password_reset_otp", otp),
    // Code to confirm the recovery phone, with the same limits.
    createPhoneCode: (userId: string) => createCode(userId, "phone_verification"),
    checkPhoneCode: (userId: string, code: string) => checkCode(userId, "phone_verification", code),
};
