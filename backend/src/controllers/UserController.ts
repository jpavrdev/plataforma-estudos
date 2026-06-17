import type { Request, Response } from "express";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";

export const getMe = async (req: Request, res: Response) => {
    const userId = req.userId;

    if(!userId) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const encontrados = await db.select().from(users).where(eq(users.id, userId));

    const user = encontrados[0];

    if(!user) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        birthDate: user.birthDate, 
        gender: user.gender, 
        phone: user.phone, 
        createdAt: user.createdAt 
    });
}

export const listUsers = async (_req: Request, res: Response) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
}