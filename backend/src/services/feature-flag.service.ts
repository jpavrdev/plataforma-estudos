import { db } from "../../db.ts";
import { featureFlags, featureFlagUsers } from "../../schema.ts";
import { and, eq } from "drizzle-orm";

// Access resolution: on releases everyone, beta only the allowlist, and off
// blocks even allowlisted users (an instant kill switch, no deploy needed).

export async function userFeatures(userId: string): Promise<string[]> {
    const rows = await db
        .select({
            key: featureFlags.key,
            status: featureFlags.status,
            inAllowlist: featureFlagUsers.id,
        })
        .from(featureFlags)
        .leftJoin(
            featureFlagUsers,
            and(eq(featureFlagUsers.flagId, featureFlags.id), eq(featureFlagUsers.userId, userId)),
        );
    return rows
        .filter((row) => row.status === "on" || (row.status === "beta" && row.inAllowlist !== null))
        .map((row) => row.key);
}

export async function hasFeature(userId: string, key: string): Promise<boolean> {
    const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, key));
    if (!flag || flag.status === "off") return false;
    if (flag.status === "on") return true;
    const [allowed] = await db
        .select({ id: featureFlagUsers.id })
        .from(featureFlagUsers)
        .where(and(eq(featureFlagUsers.flagId, flag.id), eq(featureFlagUsers.userId, userId)));
    return Boolean(allowed);
}
