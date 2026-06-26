import { loginSchema, registerSchema, refreshSchema } from "../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import { db } from "../../db.ts";
import { users, tokens } from "../../schema.ts";
import { eq, and } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";
import { createHash } from "node:crypto";
import { emailService } from "../services/email.service.ts";

const BCRYPT_COST = 10;

// Lockout de conta: trava temporariamente após muitas senhas erradas.
const MAX_TENTATIVAS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

const JWT_SECRET = String(env.JWT_SECRET);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não definido");
}

const DUMMY_HASH = bcrypt.hashSync("uma_senha_qualquer_dummy", BCRYPT_COST);

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validação dos dados que chegam
        const dados = registerSchema.parse(req.body);

        // Criptografia da senha
        const passwordHash = await bcrypt.hash(dados.password, BCRYPT_COST);

        // Transação atômica: Cria o usuário e gera os tokens iniciais
        const novoUsuario = await db.transaction(async(tx) => {
            // Cria o usuário
            const [usuarioCriado] = await tx.insert(users).values({
                name: dados.name,
                email:dados.email,
                passwordHash,
                birthDate: dados.birthDate,
                gender: dados.gender,
                phone: dados.phone
            }).returning({ 
                id: users.id, 
                name: users.name, 
                email: users.email, 
                birthDate: users.birthDate, 
                gender: users.gender, 
                phone: users.phone 
            });

            const verificationToken = await authService.gerarTokenVerificacao(usuarioCriado.id, tx);

            return { user: usuarioCriado, verificationToken };

        });

        const { user, verificationToken } = novoUsuario;

        await emailService.enviarVerificacao(user.email, verificationToken);

        res.status(201).json({
            mensagem: "Conta criada. Verifique seu email para ativar o acesso.",
            user,
        });
        
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const dados = loginSchema.parse(req.body);

        const encontrados = await db.select().from(users).where(eq(users.email, dados.email));
        const user = encontrados[0];

        // Conta travada? Recusa antes de gastar bcrypt. Mensagem genérica (igual ao
        // rate limit) para não distinguir "travada" de "muitas tentativas por IP".
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(429).json({ erro: "Muitas tentativas. Tente novamente mais tarde." });
        }

        // Definimos qual hash será comparado. Se o usuário existir, usamos o dele.
        // Se não existir, usamos o DUMMY_HASH.
        const hashParaComparar = user ? user.passwordHash : DUMMY_HASH;

        const senhaCorreta = await bcrypt.compare(dados.password, hashParaComparar);

        if (!user || !senhaCorreta) {
            // Conta tentativas falhas só para usuário existente. Ao atingir o limite,
            // trava por LOCKOUT_MS e zera o contador (a próxima janela começa limpa).
            if (user) {
                const tentativas = user.failedLoginAttempts + 1;
                if (tentativas >= MAX_TENTATIVAS) {
                    await db.update(users)
                        .set({ failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) })
                        .where(eq(users.id, user.id));
                } else {
                    await db.update(users)
                        .set({ failedLoginAttempts: tentativas })
                        .where(eq(users.id, user.id));
                }
            }
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        // Senha correta: zera o contador se havia tentativas/lock pendentes.
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await db.update(users)
                .set({ failedLoginAttempts: 0, lockedUntil: null })
                .where(eq(users.id, user.id));
        }

        if (!user.emailVerifiedAt) {
            return res.status(403).json({ erro: "Verifique seu email antes de entrar" });
        }

        const { accessToken, refreshToken } = await authService.gerarEGravarTokens(user.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/"
        });

        res.json({ name: user.name, email: user.email, token: accessToken});

    } catch (err) {
        next(err);
    }
};

export const refresh = async(req: Request, res: Response, next: NextFunction) => {
    try {
        // VAlida a entrada
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ erro: "Refresh token inválido." });
        }

        // Hasheia igual ao token que gravamos no banco
        const hashCalculado = createHash("sha256").update(refreshToken).digest("hex");

        // Busca pelo hash
        const [registro] = await db.select({
            userId: tokens.userId,
            expiredAt: tokens.expiredAt,
            usedAt: tokens.usedAt
        }).from(tokens).where(eq(tokens.tokenHash, hashCalculado));

        // Caso não encontre
        if (!registro) {
            return res.status(401).json({ erro: "Refresh token inválido. "});
        }

        // Expiração
        if (registro.expiredAt < new Date()) {
            return res.status(401).json({ erro: "Refresh token inválido. "});
        }

        // Existe, não expirou, mas já foi usado
        if (registro.usedAt !== null) {
            // Roubo presumido. Revoga todos os tokens do usuário.
            await db.delete(tokens).where(eq(tokens.userId, registro.userId));
            return res.status(401).json({ erro: "Refresh token inválido" });
        }

        // Deletar token antigo e Gerar novo token (atomicidade)
        const novosTokens = await db.transaction(async (tx) => {
            await tx.update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, hashCalculado));
            return await authService.gerarEGravarTokens(registro.userId, tx);
        })

        // Adicionar novo token no cookie
        res.cookie("refreshToken", novosTokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/"
        });

        // Dar resposta no mesmo formato do login
        res.json({
            token: novosTokens.accessToken,
        });

    } catch(err) {
        next(err);
    }
};

export const logout = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // Revoga o token do banco se existir
        if(refreshToken) {
            const hashCalculado = createHash("sha256").update(refreshToken).digest("hex");
            await db.delete(tokens).where(eq(tokens.tokenHash, hashCalculado));
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ erro: "Token não fornecido" });
        }

        // Hasheia igual ao token que gravamos no banco
        const hashCalculado = createHash("sha256").update(token).digest("hex");

        // Busca pelo hash E pelo tipo (impede usar um refresh token aqui)
        const [registro] = await db.select({
            userId: tokens.userId,
            expiredAt: tokens.expiredAt,
            usedAt: tokens.usedAt
        }).from(tokens).where(
            and(
                eq(tokens.tokenHash, hashCalculado),
                eq(tokens.type, "email_verification")
            )
        );

        if (!registro) {
            return res.status(400).json({ erro: "Token inválido" });
        }

        if (registro.expiredAt < new Date()) {
            return res.status(400).json({ erro: "Token inválido" });
        }

        if (registro.usedAt !== null) {
            return res.status(400).json({ erro: "Token inválido" });
        }

        // Marca o token como usado e o email como verificado (atomicidade)
        await db.transaction(async (tx) => {
            await tx.update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, hashCalculado));

            await tx.update(users)
                .set({ emailVerifiedAt: new Date() })
                .where(eq(users.id, registro.userId));
        });

        res.json({ mensagem: "Email verificado com sucesso. Você já pode fazer login." });

    } catch (err) {
        next(err);
    }
};