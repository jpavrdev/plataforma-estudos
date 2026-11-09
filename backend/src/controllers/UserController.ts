import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import { users, tokens, twoFactorAuth, languages as languagesTable } from "../../schema.ts";
import { and, eq, isNull, sql } from "drizzle-orm";
import {
    updateMeSchema,
    completeProfileSchema,
    weeklyGoalSchema,
    changePhoneSchema,
    phoneCodeSchema,
} from "../schemas/auth.schema.ts";
import { authService } from "../services/auth.service.ts";
import { emailService } from "../services/email.service.ts";
import { verifyPassword } from "../services/password.service.ts";
import { whatsappService } from "../services/whatsapp.service.ts";
import { AVATARS_DIR, COVERS_DIR, BACKGROUNDS_DIR } from "../config/paths.ts";
import { saveImage, removeLocalFile } from "../services/images.ts";
import { findUserStreak } from "../services/streak.ts";
import { computeUserStats } from "../services/stats.service.ts";
import { findPublicProfile } from "../services/publicProfile.service.ts";
import {
    findUserProgress,
    saveWeeklyGoal,
    removeWeeklyGoal,
} from "../services/progress.service.ts";
import { apoiadorAtivo } from "../services/supporter.service.ts";
import { userFeatures } from "../services/feature-flag.service.ts";
import { pendingTwoFactor } from "../middlewares/auth.ts";

const publicUserColumns = {
    id: users.id,
    name: users.name,
    username: users.username,
    usernameChangedAt: users.usernameChangedAt,
    email: users.email,
    birthDate: users.birthDate,
    gender: users.gender,
    phone: users.phone,
    phoneVerifiedAt: users.phoneVerifiedAt,
    bio: users.bio,
    location: users.location,
    occupation: users.occupation,
    languages: users.languages,
    github: users.github,
    linkedin: users.linkedin,
    x: users.x,
    avatarUrl: users.avatarUrl,
    coverUrl: users.coverUrl,
    role: users.role,
    createdAt: users.createdAt,
    accent: users.accent,
    backgroundUrl: users.backgroundUrl,
    backgroundDim: users.backgroundDim,
};

export const getMe = async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(404).json({ erro: "user.notFound" });
    }

    // temSenha tells the front end whether changing the phone asks for the current password.
    const found = await db
        .select({
            ...publicUserColumns,
            temSenha: sql<boolean>`${users.passwordHash} is not null`,
            locale: users.locale,
        })
        .from(users)
        .where(eq(users.id, userId));

    const user = found[0];

    if (!user) {
        return res.status(404).json({ erro: "user.notFound" });
    }

    // Streak and level are derived: if they fail, it logs and goes on with the fallback
    // instead of breaking the whole profile.
    let streak = 0;
    try {
        streak = await findUserStreak(userId);
    } catch (e) {
        console.error("getMe: failed to compute the streak", e);
    }

    let level = 1;
    try {
        level = (await computeUserStats(userId)).level;
    } catch (e) {
        console.error("getMe: failed to compute the level", e);
    }

    let isSupporter = false;
    try {
        isSupporter = await apoiadorAtivo(userId);
    } catch (e) {
        console.error("getMe: failed to check the support", e);
    }

    let features: string[] = [];
    try {
        features = await userFeatures(userId);
    } catch (e) {
        console.error("getMe: failed to list the features", e);
    }

    let pendingTwoFactorStep: ReturnType<typeof pendingTwoFactor> = null;
    if (user.role === "admin") {
        const [twoFactor] = await db
            .select({ enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        pendingTwoFactorStep = pendingTwoFactor(twoFactor?.enabledAt ?? null, req.mfa);
    }

    res.json({
        ...user,
        streak,
        level,
        apoiador: isSupporter,
        features,
        pendingTwoFactor: pendingTwoFactorStep,
    });
};

// Updates the user's own profile (editable fields). It does not touch sensitive fields.
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ erro: "common.notAuthenticated" });
    }
    try {
        const input = updateMeSchema.parse(req.body);
        // Languages have to exist in the canonical set (managed in the admin), to keep
        // the data standardized for future analysis.
        if (input.languages && input.languages.length > 0) {
            const validLanguages = await db
                .select({ name: languagesTable.name })
                .from(languagesTable);
            const validNames = new Set(validLanguages.map((l) => l.name));
            const invalidLanguage = input.languages.find((l) => !validNames.has(l));
            if (invalidLanguage) {
                return res.status(400).json({ erro: `Linguagem inválida: ${invalidLanguage}` });
            }
        }
        const sets: {
            name?: string;
            username?: string;
            usernameChangedAt?: Date;
            bio?: string;
            location?: string;
            occupation?: string;
            languages?: string[];
            github?: string;
            linkedin?: string;
            x?: string;
        } = {};
        if (input.name !== undefined) sets.name = input.name;
        if (input.bio !== undefined) sets.bio = input.bio;
        if (input.location !== undefined) sets.location = input.location;
        if (input.occupation !== undefined) sets.occupation = input.occupation;
        if (input.languages !== undefined) sets.languages = input.languages;
        if (input.github !== undefined) sets.github = input.github;
        if (input.linkedin !== undefined) sets.linkedin = input.linkedin;
        if (input.x !== undefined) sets.x = input.x;

        // Username: changes only once every 30 days (the first change is free).
        if (input.username !== undefined) {
            const newUsername = input.username.toLowerCase();
            const [current] = await db
                .select({ username: users.username, usernameChangedAt: users.usernameChangedAt })
                .from(users)
                .where(eq(users.id, userId));
            if (current && newUsername !== current.username) {
                const USERNAME_LOCK_MS = 30 * 24 * 60 * 60 * 1000;
                if (current.usernameChangedAt) {
                    const since = Date.now() - current.usernameChangedAt.getTime();
                    if (since < USERNAME_LOCK_MS) {
                        const unlockAt = new Date(
                            current.usernameChangedAt.getTime() + USERNAME_LOCK_MS,
                        );
                        return res.status(429).json({
                            erro: `Você só poderá mudar o usuário novamente em ${unlockAt.toLocaleDateString("pt-BR")}.`,
                        });
                    }
                }
                const [existing] = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.username, newUsername));
                if (existing && existing.id !== userId) {
                    return res.status(409).json({ erro: "auth.usernameTaken" });
                }
                sets.username = newUsername;
                sets.usernameChangedAt = new Date();
            }
        }

        if (Object.keys(sets).length === 0) {
            return res.status(400).json({ erro: "common.nothingToUpdate" });
        }
        const [user] = await db
            .update(users)
            .set(sets)
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const digitsOnly = (phone: string) => phone.replace(/\D/g, "");

// Fills in birth date, gender and phone (e.g. after the first social login).
export const completeProfile = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ erro: "common.notAuthenticated" });
    }
    try {
        const input = completeProfileSchema.parse(req.body);
        const username = input.username.toLowerCase();
        const [usernameTaken] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username));
        if (usernameTaken && usernameTaken.id !== userId) {
            return res.status(409).json({ erro: "auth.usernameTaken" });
        }
        // Here the phone only goes in when there is none yet; changing it asks for the
        // current password and goes through PUT /me/telefone.
        const [current] = await db
            .select({ phone: users.phone })
            .from(users)
            .where(eq(users.id, userId));
        if (current?.phone && digitsOnly(current.phone) !== digitsOnly(input.phone)) {
            return res.status(403).json({ erro: "profile.usePhoneSettings" });
        }
        const [user] = await db
            .update(users)
            .set({
                username,
                birthDate: input.birthDate,
                gender: input.gender,
                phone: input.phone,
            })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Changes the recovery phone. An account with a password confirms the current one:
// whoever got hold of a session for a few minutes cannot leave their own recovery
// channel there. The new number starts unverified, and the account email gets a notice.
export const changePhone = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const input = changePhoneSchema.parse(req.body);
        const [user] = await db
            .select({
                email: users.email,
                phone: users.phone,
                passwordHash: users.passwordHash,
                locale: users.locale,
            })
            .from(users)
            .where(eq(users.id, userId));
        if (!user) return res.status(404).json({ erro: "user.notFound" });

        const passwordMatches =
            !user.passwordHash ||
            (!!input.senhaAtual && (await verifyPassword(user.passwordHash, input.senhaAtual)));
        if (!passwordMatches) return res.status(403).json({ erro: "auth.wrongCurrentPassword" });

        if (user.phone && digitsOnly(user.phone) === digitsOnly(input.phone)) {
            const [same] = await db
                .select(publicUserColumns)
                .from(users)
                .where(eq(users.id, userId));
            return res.json(same);
        }

        const [updated] = await db.transaction(async (tx) => {
            // A code asked for the old number does not confirm the new one.
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(
                    and(
                        eq(tokens.userId, userId),
                        eq(tokens.type, "phone_verification"),
                        isNull(tokens.usedAt),
                    ),
                );
            return tx
                .update(users)
                .set({ phone: input.phone, phoneVerifiedAt: null })
                .where(eq(users.id, userId))
                .returning(publicUserColumns);
        });
        if (user.phone) await emailService.sendPhoneChangedNotice(user.email, user.locale);
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

// Sends over WhatsApp the code that confirms the recovery phone.
export const requestPhoneCode = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const [user] = await db
            .select({
                phone: users.phone,
                phoneVerifiedAt: users.phoneVerifiedAt,
                locale: users.locale,
            })
            .from(users)
            .where(eq(users.id, userId));
        if (!user?.phone) {
            return res.status(400).json({ erro: "profile.phoneRequired" });
        }
        if (user.phoneVerifiedAt) {
            return res.status(409).json({ erro: "profile.phoneAlreadyVerified" });
        }
        const code = await authService.createPhoneCode(userId);
        if (!code) {
            return res.status(429).json({ erro: "profile.codeCooldown" });
        }
        await whatsappService.sendPhoneCode(user.phone, code, user.locale);
        res.json({ mensagem: "profile.whatsappCodeSent" });
    } catch (err) {
        next(err);
    }
};

export const verifyPhone = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const { codigo: code } = phoneCodeSchema.parse(req.body);
        const tokenId = await authService.checkPhoneCode(userId, code);
        if (!tokenId) {
            return res.status(400).json({ erro: "auth.invalidCode" });
        }
        const [updated] = await db.transaction(async (tx) => {
            await tx.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, tokenId));
            return tx
                .update(users)
                .set({ phoneVerifiedAt: new Date() })
                .where(eq(users.id, userId))
                .returning(publicUserColumns);
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const r = await saveImage(req.body?.image, AVATARS_DIR, "/uploads/avatars");
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [current] = await db
            .select({ avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ avatarUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.avatarUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const uploadCover = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const r = await saveImage(req.body?.image, COVERS_DIR, "/uploads/covers");
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [current] = await db
            .select({ coverUrl: users.coverUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ coverUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.coverUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removeAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const [current] = await db
            .select({ avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ avatarUrl: null })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.avatarUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removeCover = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const [current] = await db
            .select({ coverUrl: users.coverUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ coverUrl: null })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.coverUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    const allUsers = await db.select(publicUserColumns).from(users);

    res.json(allUsers);
};

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findPublicProfile(String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const getMyProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawPeriod = String(req.query.periodo ?? "30");
        let period: number | null = rawPeriod === "7" ? 7 : rawPeriod === "tudo" ? null : 30;
        // Long periods are a supporter benefit; without it, it falls back to the default of 30.
        if (rawPeriod === "90" || rawPeriod === "365") {
            period = (await apoiadorAtivo(req.userId!)) ? Number(rawPeriod) : 30;
        }
        res.json(await findUserProgress(req.userId!, period));
    } catch (err) {
        next(err);
    }
};

export const setWeeklyGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { kind, target } = weeklyGoalSchema.parse(req.body);
        await saveWeeklyGoal(req.userId!, kind, target);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const clearWeeklyGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeWeeklyGoal(req.userId!);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const uploadBackground = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        if (!(await apoiadorAtivo(userId))) {
            return res.status(403).json({ erro: "support.backgroundForSupporters" });
        }
        const r = await saveImage(
            req.body?.image,
            BACKGROUNDS_DIR,
            "/uploads/fundos",
            10 * 1024 * 1024,
        );
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [current] = await db
            .select({ backgroundUrl: users.backgroundUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ backgroundUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.backgroundUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removeBackground = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "common.notAuthenticated" });
    try {
        const [current] = await db
            .select({ backgroundUrl: users.backgroundUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ backgroundUrl: null })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removeLocalFile(current?.backgroundUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};
