import { and, eq } from "drizzle-orm";
import { db } from "../../db.ts";
import {
    oauthAccounts,
    tokens,
    twoFactorAuth,
    twoFactorRecoveryCodes,
    users,
} from "../../schema.ts";
import type { DadosUsuario, Provedor } from "./oauth.service.ts";

// Acha ou cria o usuário de um login social. Uma conta com o mesmo email que
// nunca foi verificada pode ter sido criada por outra pessoa, para tomar a conta
// quando o dono do email entrar: ao adotá-la, o que foi preenchido no cadastro
// (senha, telefone, perfil, 2FA) e as sessões abertas são descartados, e o aluno
// completa o perfil de novo.
export async function vincularContaSocial(provider: Provedor, dados: DadosUsuario) {
    return db.transaction(async (tx) => {
        const [vinculo] = await tx
            .select({ userId: oauthAccounts.userId })
            .from(oauthAccounts)
            .where(
                and(
                    eq(oauthAccounts.provider, provider),
                    eq(oauthAccounts.providerId, dados.providerId),
                ),
            );
        if (vinculo) {
            const [user] = await tx.select().from(users).where(eq(users.id, vinculo.userId));
            return user;
        }

        let [user] = await tx.select().from(users).where(eq(users.email, dados.email));
        if (!user) {
            [user] = await tx
                .insert(users)
                .values({ name: dados.name, email: dados.email, emailVerifiedAt: new Date() })
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
                    name: dados.name,
                    username: null,
                    passwordHash: null,
                    phone: null,
                    birthDate: null,
                    gender: null,
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                    emailVerifiedAt: new Date(),
                })
                .where(eq(users.id, user.id))
                .returning();
        }
        await tx
            .insert(oauthAccounts)
            .values({ userId: user.id, provider, providerId: dados.providerId })
            .onConflictDoNothing();
        return user;
    });
}
