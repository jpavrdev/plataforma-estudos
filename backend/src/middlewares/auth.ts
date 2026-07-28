import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { env } from "../config/env.ts";

// Vem do env já validado (exige 32 caracteres e derruba o boot se faltar). Ler
// process.env aqui direto não protegia nada: String(undefined) vira "undefined",
// que é truthy, então a checagem passava e o token seria assinado com essa string.
const JWT_SECRET = env.JWT_SECRET;

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
