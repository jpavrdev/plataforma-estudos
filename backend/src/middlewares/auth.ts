import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = String(process.env.JWT_SECRET);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não definido");
}

interface UserPayload {
    userId: string;
}

export function autenticar(req: Request, res: Response, next: Function) {
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
};