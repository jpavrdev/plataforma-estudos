import type { Request, Response } from "express";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";

const publicUserColumns = {
    id: users.id,
    name: users.name,
    email: users.email,
    birthDate: users.birthDate,
    gender: users.gender,
    phone: users.phone,
    role: users.role,
    createdAt: users.createdAt
};

export const getMe = async (req: Request, res: Response) => {
    const userId = req.userId;

    if(!userId) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const encontrados = await db.select(publicUserColumns).from(users).where(eq(users.id, userId));

    const user = encontrados[0];

    if(!user) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json(user);
}

export const listUsers = async (_req: Request, res: Response) => {
    const allUsers = await db.select(publicUserColumns).from(users);

    res.json(allUsers);
}