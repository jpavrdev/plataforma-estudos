import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../../db.ts";
import { tokens, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import {
    ativarDoisFatoresSchema,
    codigoDoisFatoresSchema,
    desativarDoisFatoresSchema,
} from "../schemas/doisFatores.schema.ts";
import { opcoesCookieRefresh } from "../services/auth.service.ts";
import { doisFatoresService } from "../services/doisFatores.service.ts";
import { emailService } from "../services/email.service.ts";
import { verificarSenha } from "../services/password.service.ts";

async function conta(userId: string) {
    const [user] = await db
        .select({ email: users.email, passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userId));
    if (!user) throw new AppError(404, "Usuário não encontrado");
    return user;
}

// Conta só de login social não tem senha para conferir.
async function conferirSenha(passwordHash: string | null, senha: string | undefined) {
    if (!passwordHash) return;
    if (!senha || !(await verificarSenha(passwordHash, senha))) {
        throw new AppError(403, "Senha atual incorreta.");
    }
}

// Ativar recria a sessão atual. Sem o cookie de sessão junto, um access token
// vazado viraria uma sessão nova de 24 horas.
async function sessaoDoCookie(req: Request, userId: string) {
    const cookie: unknown = req.cookies?.refreshToken;
    if (typeof cookie !== "string") return false;
    const [registro] = await db
        .select({ expiredAt: tokens.expiredAt, usedAt: tokens.usedAt })
        .from(tokens)
        .where(
            and(
                eq(tokens.tokenHash, createHash("sha256").update(cookie).digest("hex")),
                eq(tokens.type, "refresh"),
                eq(tokens.userId, userId),
            ),
        );
    return Boolean(registro && !registro.usedAt && registro.expiredAt > new Date());
}

export const estadoDoisFatores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { passwordHash } = await conta(req.userId!);
        const estado = await doisFatoresService.estado(req.userId!);
        res.json({ ...estado, temSenha: Boolean(passwordHash) });
    } catch (err) {
        next(err);
    }
};

export const configurarDoisFatores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = await conta(req.userId!);
        res.json(await doisFatoresService.iniciarConfiguracao(req.userId!, email));
    } catch (err) {
        next(err);
    }
};

export const ativarDoisFatores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const dados = ativarDoisFatoresSchema.parse(req.body);
        const user = await conta(userId);
        await conferirSenha(user.passwordHash, dados.senhaAtual);
        if (!(await sessaoDoCookie(req, userId))) {
            throw new AppError(401, "Sessão inválida. Entre de novo.");
        }

        const { codigos, sessao } = await doisFatoresService.ativar(userId, dados.codigo);
        res.cookie("refreshToken", sessao.refreshToken, opcoesCookieRefresh);
        await emailService.enviarAvisoDoisFatores(user.email, true);
        res.json({ codigosRecuperacao: codigos, token: sessao.accessToken });
    } catch (err) {
        next(err);
    }
};

export const novosCodigosDoisFatores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const { codigo } = codigoDoisFatoresSchema.parse(req.body);
        if (!(await doisFatoresService.ativo(userId))) {
            throw new AppError(409, "A verificação em duas etapas não está ativa.");
        }
        if (!(await doisFatoresService.conferir(userId, codigo))) {
            throw new AppError(403, "Código incorreto.");
        }
        res.json({ codigosRecuperacao: await doisFatoresService.novosCodigos(userId) });
    } catch (err) {
        next(err);
    }
};

export const desativarDoisFatores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const dados = desativarDoisFatoresSchema.parse(req.body);
        const user = await conta(userId);
        await conferirSenha(user.passwordHash, dados.senhaAtual);
        if (!(await doisFatoresService.ativo(userId))) {
            throw new AppError(409, "A verificação em duas etapas não está ativa.");
        }
        if (!(await doisFatoresService.conferir(userId, dados.codigo))) {
            throw new AppError(403, "Código incorreto.");
        }

        await doisFatoresService.desativar(userId);
        await emailService.enviarAvisoDoisFatores(user.email, false);
        res.json({ ativo: false });
    } catch (err) {
        next(err);
    }
};
