import { db } from "../../db.ts";
import { featureFlags, featureFlagUsers } from "../../schema.ts";
import { and, eq } from "drizzle-orm";

// Resolução de acesso: on libera todo mundo, beta só quem está na allowlist e
// off bloqueia até quem está nela (kill switch instantâneo, sem deploy).

export async function featuresDoUsuario(userId: string): Promise<string[]> {
    const linhas = await db
        .select({
            key: featureFlags.key,
            status: featureFlags.status,
            naAllowlist: featureFlagUsers.id,
        })
        .from(featureFlags)
        .leftJoin(
            featureFlagUsers,
            and(eq(featureFlagUsers.flagId, featureFlags.id), eq(featureFlagUsers.userId, userId)),
        );
    return linhas
        .filter((l) => l.status === "on" || (l.status === "beta" && l.naAllowlist !== null))
        .map((l) => l.key);
}

export async function temFeature(userId: string, key: string): Promise<boolean> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    if (!flag || flag.status === "off") return false;
    if (flag.status === "on") return true;
    const [liberado] = await db
        .select({ id: featureFlagUsers.id })
        .from(featureFlagUsers)
        .where(and(eq(featureFlagUsers.flagId, flag.id), eq(featureFlagUsers.userId, userId)));
    return Boolean(liberado);
}
