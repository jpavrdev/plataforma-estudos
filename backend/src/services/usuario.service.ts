import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";

// Indica se o usuário tem papel de administrador.
export async function ehAdmin(userId: string): Promise<boolean> {
    const [u] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
    return u?.role === "admin";
}
