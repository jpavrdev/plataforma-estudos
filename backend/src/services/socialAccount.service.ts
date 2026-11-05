import { and, eq } from "drizzle-orm";
import { db } from "../../db.ts";
import {
    oauthAccounts,
    tokens,
    twoFactorAuth,
    twoFactorRecoveryCodes,
    users,
} from "../../schema.ts";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locale.ts";
import type { ProviderUser, Provider } from "./oauth.service.ts";

// Finds or creates the user of a social login. An account with the same email that
// was never verified may have been created by someone else, to take over the account
// when the email owner signs in: on adopting it, what the sign-up filled in
// (password, phone, profile, 2FA) and the open sessions are dropped, and the student
// completes the profile again.
// The language is the one of the screen where the social login started, and it
// only goes into accounts created or adopted here.
export async function linkSocialAccount(
    provider: Provider,
    providerUser: ProviderUser,
    locale: Locale = DEFAULT_LOCALE,
) {
    return db.transaction(async (tx) => {
        const [link] = await tx
            .select({ userId: oauthAccounts.userId })
            .from(oauthAccounts)
            .where(
                and(
                    eq(oauthAccounts.provider, provider),
                    eq(oauthAccounts.providerId, providerUser.providerId),
                ),
            );
        if (link) {
            const [user] = await tx.select().from(users).where(eq(users.id, link.userId));
            return user;
        }

        let [user] = await tx.select().from(users).where(eq(users.email, providerUser.email));
        if (!user) {
            [user] = await tx
                .insert(users)
                .values({
                    name: providerUser.name,
                    email: providerUser.email,
                    emailVerifiedAt: new Date(),
                    locale,
                })
                .returning();
        } else if (!user.emailVerifiedAt) {
            await tx.delete(tokens).where(eq(tokens.userId, user.id));
            await tx
                .delete(twoFactorRecoveryCodes)
                .where(eq(twoFactorRecoveryCodes.userId, user.id));
            await tx.delete(twoFactorAuth).where(eq(twoFactorAuth.userId, user.id));
            [user] = await tx
                .update(users)
                .set({
                    name: providerUser.name,
                    username: null,
                    passwordHash: null,
                    phone: null,
                    birthDate: null,
                    gender: null,
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                    emailVerifiedAt: new Date(),
                    locale,
                })
                .where(eq(users.id, user.id))
                .returning();
        }
        await tx
            .insert(oauthAccounts)
            .values({ userId: user.id, provider, providerId: providerUser.providerId })
            .onConflictDoNothing();
        return user;
    });
}
