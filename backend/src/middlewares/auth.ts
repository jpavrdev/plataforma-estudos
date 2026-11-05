import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db.ts";
import { twoFactorAuth, users } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { env } from "../config/env.ts";

// Vem do env já validado (exige 32 caracteres e derruba o boot se faltar). Ler
// process.env aqui direto não protegia nada: String(undefined) vira "undefined",
// que é truthy, então a checagem passava e o token seria assinado com essa string.
const JWT_SECRET = env.JWT_SECRET;

interface UserPayload {
    userId: string;
    mfa?: boolean;
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
        req.mfa = payload.mfa === true;

        next();
    } catch {
        return res.status(401).json({ erro: "Token inválido" });
    }
}

// O que falta para a sessão usar as rotas de admin: o 2FA ligado e a sessão
// verificada pelo código. O /me usa o mesmo critério para o front barrar a área
// de admin, que tem telas que só leem rotas comuns.
export function pendenciaDoisFatores(doisFatoresEm: Date | null, mfa: boolean | undefined) {
    if (!env.ADMIN_EXIGE_2FA) return null;
    if (!doisFatoresEm) return "2fa_obrigatorio" as const;
    if (!mfa) return "2fa_sessao" as const;
    return null;
}

const MENSAGEM_PENDENCIA = {
    "2fa_obrigatorio":
        "Ative a verificação em duas etapas no seu perfil para usar as funções de administrador.",
    "2fa_sessao":
        "Entre de novo e confirme com o código do app autenticador para usar as funções de administrador.",
};

export async function exigirAdmin(req: Request, res: Response, next: NextFunction) {
    const idUsuario = req.userId;

    if (!idUsuario) {
        return res.status(401).json({ erro: "Não autenticado" });
    }

    const [registro] = await db
        .select({ role: users.role, doisFatoresEm: twoFactorAuth.enabledAt })
        .from(users)
        .leftJoin(twoFactorAuth, eq(twoFactorAuth.userId, users.id))
        .where(eq(users.id, idUsuario));

    if (!registro || registro.role !== "admin") {
        return res.status(403).json({ erro: "Usuário não é administrador" });
    }

    // Desligar o 2FA vale na hora, sem esperar o token marcado expirar.
    const pendencia = pendenciaDoisFatores(registro.doisFatoresEm, req.mfa);
    if (pendencia) {
        return res.status(403).json({ erro: MENSAGEM_PENDENCIA[pendencia], codigo: pendencia });
    }

    next();
}
