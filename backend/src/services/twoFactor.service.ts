import { createHash, randomBytes, randomInt } from "node:crypto";
import QRCode from "qrcode";
import { and, count, eq, isNotNull, isNull, lt, or } from "drizzle-orm";
import { db } from "../../db.ts";
import { tokens, twoFactorAuth, twoFactorRecoveryCodes, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { authService } from "./auth.service.ts";
import { decrypt, encrypt } from "./secretBox.ts";
import { base32, newSecret, otpauthUri, verifyTotp } from "./totp.ts";

const ISSUER = "ensina.dev";
const RECOVERY_CODE_COUNT = 10;
// No i, l, o, 0 or 1, which are easy to mistype.
const RECOVERY_CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const CHALLENGE_CLOSED = "O tempo para digitar o código acabou. Entre de novo.";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type TwoFactorMethod = "app" | "recovery";

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const normalizeCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");
const recoveryCodeHash = (userId: string, code: string) => sha256(`${userId}:${code}`);

// Replaces the user's recovery codes with ten new ones and returns them in
// plain text, the only time they are ever shown.
async function storeRecoveryCodes(tx: Tx, userId: string) {
    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => {
        const chars = Array.from(
            { length: 10 },
            () => RECOVERY_CODE_ALPHABET[randomInt(RECOVERY_CODE_ALPHABET.length)],
        ).join("");
        return `${chars.slice(0, 5)}-${chars.slice(5)}`;
    });
    await tx.delete(twoFactorRecoveryCodes).where(eq(twoFactorRecoveryCodes.userId, userId));
    await tx.insert(twoFactorRecoveryCodes).values(
        codes.map((code) => ({
            userId,
            codeHash: recoveryCodeHash(userId, normalizeCode(code)),
        })),
    );
    return codes;
}

export const twoFactorService = {
    async isEnabled(userId: string) {
        const [row] = await db
            .select({ enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        return Boolean(row?.enabledAt);
    },

    async status(userId: string) {
        const [row] = await db
            .select({ enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        const [{ left }] = await db
            .select({ left: count() })
            .from(twoFactorRecoveryCodes)
            .where(
                and(
                    eq(twoFactorRecoveryCodes.userId, userId),
                    isNull(twoFactorRecoveryCodes.usedAt),
                ),
            );
        return {
            enabled: Boolean(row?.enabledAt),
            enabledAt: row?.enabledAt ?? null,
            recoveryCodesLeft: left,
        };
    },

    // Creates a pending secret and returns what the authenticator app needs to read.
    async startSetup(userId: string, email: string) {
        if (await this.isEnabled(userId)) {
            throw new AppError(
                409,
                "A verificação em duas etapas já está ativa. Desative antes de configurar de novo.",
            );
        }
        const secret = newSecret();
        const pending = encrypt(secret);
        await db
            .insert(twoFactorAuth)
            .values({ userId, pendingSecret: pending })
            .onConflictDoUpdate({
                target: twoFactorAuth.userId,
                set: { pendingSecret: pending, updatedAt: new Date() },
            });
        const uri = otpauthUri(secret, email, ISSUER);
        const qrSvg = await QRCode.toString(uri, { type: "svg", margin: 1 });
        return { secret: base32(secret), uri, qrSvg };
    },

    // The first code from the app confirms the setup. Sessions opened before
    // never went through a code, so they are all dropped; the current one comes
    // back already verified.
    async enable(userId: string, code: string) {
        const [row] = await db
            .select({ pending: twoFactorAuth.pendingSecret, enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        if (row?.enabledAt) {
            throw new AppError(409, "A verificação em duas etapas já está ativa.");
        }
        if (!row?.pending) throw new AppError(400, "Comece a configuração de novo.");
        const pending = row.pending;

        let secret: Buffer;
        try {
            secret = decrypt(pending);
        } catch (e) {
            console.error(`2FA: pending secret of user ${userId} does not decrypt`, e);
            throw new AppError(400, "Comece a configuração de novo.");
        }
        const step = verifyTotp(secret, code);
        if (step === null) {
            throw new AppError(
                400,
                "Código incorreto. Confira se o horário do celular está certo e use o código atual.",
            );
        }

        return db.transaction(async (tx) => {
            const now = new Date();
            const [enabled] = await tx
                .update(twoFactorAuth)
                .set({
                    secret: pending,
                    pendingSecret: null,
                    enabledAt: now,
                    lastStep: step,
                    updatedAt: now,
                })
                .where(
                    and(
                        eq(twoFactorAuth.userId, userId),
                        eq(twoFactorAuth.pendingSecret, pending),
                        isNull(twoFactorAuth.enabledAt),
                    ),
                )
                .returning({ userId: twoFactorAuth.userId });
            if (!enabled) throw new AppError(409, "A configuração mudou no meio do caminho.");

            const recoveryCodes = await storeRecoveryCodes(tx, userId);
            await tx
                .delete(tokens)
                .where(and(eq(tokens.userId, userId), eq(tokens.type, "refresh")));
            const session = await authService.gerarEGravarTokens(userId, tx, { mfa: true });
            return { recoveryCodes, session };
        });
    },

    // An app code (each one is accepted only once) or a recovery code (which
    // gets spent). Returns which of the two matched.
    async verify(userId: string, input: string): Promise<TwoFactorMethod | null> {
        const code = input.trim();
        if (/^\d{6}$/.test(code)) {
            const [row] = await db
                .select({ secret: twoFactorAuth.secret })
                .from(twoFactorAuth)
                .where(and(eq(twoFactorAuth.userId, userId), isNotNull(twoFactorAuth.enabledAt)));
            if (!row?.secret) return null;
            let secret: Buffer;
            try {
                secret = decrypt(row.secret);
            } catch (e) {
                console.error(`2FA: secret of user ${userId} does not decrypt`, e);
                return null;
            }
            const step = verifyTotp(secret, code);
            if (step === null) return null;
            const [accepted] = await db
                .update(twoFactorAuth)
                .set({ lastStep: step })
                .where(
                    and(
                        eq(twoFactorAuth.userId, userId),
                        or(isNull(twoFactorAuth.lastStep), lt(twoFactorAuth.lastStep, step)),
                    ),
                )
                .returning({ userId: twoFactorAuth.userId });
            return accepted ? "app" : null;
        }

        const normalized = normalizeCode(code);
        if (normalized.length !== 10) return null;
        const [spent] = await db
            .update(twoFactorRecoveryCodes)
            .set({ usedAt: new Date() })
            .where(
                and(
                    eq(twoFactorRecoveryCodes.userId, userId),
                    eq(twoFactorRecoveryCodes.codeHash, recoveryCodeHash(userId, normalized)),
                    isNull(twoFactorRecoveryCodes.usedAt),
                ),
            )
            .returning({ id: twoFactorRecoveryCodes.id });
        return spent ? "recovery" : null;
    },

    regenerateRecoveryCodes: (userId: string) =>
        db.transaction((tx) => storeRecoveryCodes(tx, userId)),

    async disable(userId: string) {
        await db.transaction(async (tx) => {
            await tx
                .delete(twoFactorRecoveryCodes)
                .where(eq(twoFactorRecoveryCodes.userId, userId));
            await tx.delete(twoFactorAuth).where(eq(twoFactorAuth.userId, userId));
        });
    },

    // With 2FA, the password (or the social login) only opens a 5-minute
    // challenge, and the code is what completes the login.
    async createChallenge(userId: string) {
        const challenge = randomBytes(32).toString("hex");
        await db
            .delete(tokens)
            .where(
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.type, "login_2fa"),
                    lt(tokens.expiredAt, new Date()),
                ),
            );
        await db.insert(tokens).values({
            userId,
            tokenHash: sha256(challenge),
            type: "login_2fa",
            expiredAt: new Date(Date.now() + CHALLENGE_TTL_MS),
        });
        return challenge;
    },

    // A wrong code counts toward the same lock as a wrong password, and a right
    // password does not reset the counter for 2FA accounts: only a right code does.
    async resolveChallenge(challenge: string, code: string) {
        const [record] = await db
            .select({
                id: tokens.id,
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
                lockedUntil: users.lockedUntil,
            })
            .from(tokens)
            .innerJoin(users, eq(users.id, tokens.userId))
            .where(and(eq(tokens.tokenHash, sha256(challenge)), eq(tokens.type, "login_2fa")));
        if (!record || record.usedAt || record.expiredAt < new Date()) {
            throw new AppError(401, CHALLENGE_CLOSED);
        }
        if (record.lockedUntil && record.lockedUntil > new Date()) {
            throw new AppError(429, "Muitas tentativas. Tente novamente mais tarde.");
        }

        const method = await this.verify(record.userId, code);
        if (!method) {
            await authService.recordFailedLogin(record.userId);
            throw new AppError(401, "Código incorreto.");
        }

        const [closed] = await db
            .update(tokens)
            .set({ usedAt: new Date() })
            .where(and(eq(tokens.id, record.id), isNull(tokens.usedAt)))
            .returning({ id: tokens.id });
        if (!closed) throw new AppError(401, CHALLENGE_CLOSED);
        await authService.resetFailedLogins(record.userId);
        return { userId: record.userId, method };
    },
};
