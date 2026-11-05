import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { updateLocaleSchema } from "../schemas/locale.schema.ts";

// Saves in the account the language chosen on the screen: it follows the person to
// another device and decides the language of the emails.
export const updateLocale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { locale } = updateLocaleSchema.parse(req.body);
        await db.update(users).set({ locale }).where(eq(users.id, req.userId!));
        res.json({ locale });
    } catch (err) {
        next(err);
    }
};
