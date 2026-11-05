import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";

// Whether the user has the admin role.
export async function isAdmin(userId: string): Promise<boolean> {
    const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    return u?.role === "admin";
}
