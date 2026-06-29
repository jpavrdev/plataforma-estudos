import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";

const JWT_SECRET = String(process.env.JWT_SECRET);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não definido");
}

interface UserPayload {
    userId: string;
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;

        req.userId = payload.userId;

        next();
    } catch {
        return res.status(401).json({ erro: "Token inválido" });
    }
}

export async function exigirAdmin(req: Request, res: Response, next: NextFunction) {
    const idUsuario = req.userId;

    if (!idUsuario) {
        return res.status(401).json({ erro: "Não autenticado" });
    }

    const [registro] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, idUsuario));

    if (!registro || registro.role !== "admin") {
        return res.status(403).json({ erro: "Usuário não é administrador" });
    }

    next();
}
