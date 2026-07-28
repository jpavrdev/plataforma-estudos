import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    forgotPasswordOtpSchema,
    resetPasswordOtpSchema,
} from "../schemas/auth.schema.ts";
import {
    hashSenha,
    verificarSenha,
    precisaRehash,
    getDummyHash,
} from "../services/password.service.ts";
import { db } from "../../db.ts";
import { users, tokens } from "../../schema.ts";
import { eq, and, isNull } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";
import { createHash } from "node:crypto";
import { emailService } from "../services/email.service.ts";
import { whatsappService } from "../services/whatsapp.service.ts";

// Lockout de conta: trava temporariamente após muitas senhas erradas.
const MAX_TENTATIVAS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validação dos dados que chegam
        const dados = registerSchema.parse(req.body);

        // Username normalizado (minúsculo) e único. O regex no schema já barra
        // qualquer caractere fora de [a-zA-Z0-9_], então é seguro contra injection.
        const username = dados.username.toLowerCase();
        const [existeUsername] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username));
        if (existeUsername) {
            return res.status(409).json({ erro: "Esse nome de usuário já está em uso" });
        }

        const [existeEmail] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, dados.email));
        if (existeEmail) {
            return res.status(409).json({ erro: "Este email já está em uso" });
        }

        // Criptografia da senha
        const passwordHash = await hashSenha(dados.password);

        // Transação atômica: Cria o usuário e gera os tokens iniciais
        const novoUsuario = await db.transaction(async (tx) => {
            // Cria o usuário
            const [usuarioCriado] = await tx
                .insert(users)
                .values({
                    name: dados.name,
                    username,
                    email: dados.email,
                    passwordHash,
                    birthDate: dados.birthDate,
                    gender: dados.gender,
                    phone: dados.phone,
                })
                .returning({
                    id: users.id,
                    name: users.name,
                    username: users.username,
                    email: users.email,
                    birthDate: users.birthDate,
                    gender: users.gender,
                    phone: users.phone,
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
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = loginSchema.parse(req.body);

        const encontrados = await db.select().from(users).where(eq(users.email, dados.email));
        const user = encontrados[0];

        // Conta travada? Recusa antes de gastar o hash. Mensagem genérica (igual ao
        // rate limit) para não distinguir "travada" de "muitas tentativas por IP".
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(429).json({ erro: "Muitas tentativas. Tente novamente mais tarde." });
        }

        // Definimos qual hash será comparado. Usuário com senha usa a dele; sem usuário
        // (ou conta só de login social, sem senha) cai num hash dummy e a comparação falha.
        const hashParaComparar = user?.passwordHash ?? (await getDummyHash());

        const senhaCorreta = await verificarSenha(hashParaComparar, dados.password);

        if (!user || !senhaCorreta) {
            // Conta tentativas falhas só para usuário existente. Ao atingir o limite,
            // trava por LOCKOUT_MS e zera o contador (a próxima janela começa limpa).
            if (user) {
                const tentativas = user.failedLoginAttempts + 1;
                if (tentativas >= MAX_TENTATIVAS) {
                    await db
                        .update(users)
                        .set({
                            failedLoginAttempts: 0,
                            lockedUntil: new Date(Date.now() + LOCKOUT_MS),
                        })
                        .where(eq(users.id, user.id));
                } else {
                    await db
                        .update(users)
                        .set({ failedLoginAttempts: tentativas })
                        .where(eq(users.id, user.id));
                }
            }
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        // Senha correta: zera o contador se havia tentativas/lock pendentes.
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await db
                .update(users)
                .set({ failedLoginAttempts: 0, lockedUntil: null })
                .where(eq(users.id, user.id));
        }

        // Migração transparente do hash: um bcrypt antigo vira argon2 no primeiro login.
        if (user.passwordHash && precisaRehash(user.passwordHash)) {
            const novoHash = await hashSenha(dados.password);
            await db.update(users).set({ passwordHash: novoHash }).where(eq(users.id, user.id));
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
            path: "/",
        });

        res.json({ name: user.name, email: user.email, token: accessToken });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // VAlida a entrada
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ erro: "Refresh token inválido." });
        }

        // Hasheia igual ao token que gravamos no banco
        const hashCalculado = createHash("sha256").update(refreshToken).digest("hex");

        // Busca pelo hash
        const [registro] = await db
            .select({
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(eq(tokens.tokenHash, hashCalculado));

        // Caso não encontre
        if (!registro) {
            return res.status(401).json({ erro: "Refresh token inválido. " });
        }

        // Expiração
        if (registro.expiredAt < new Date()) {
            return res.status(401).json({ erro: "Refresh token inválido. " });
        }

        // Existe, não expirou, mas já foi usado
        if (registro.usedAt !== null) {
            // Roubo presumido. Revoga todos os tokens do usuário.
            await db.delete(tokens).where(eq(tokens.userId, registro.userId));
            return res.status(401).json({ erro: "Refresh token inválido" });
        }

        // Deletar token antigo e Gerar novo token (atomicidade)
        const novosTokens = await db.transaction(async (tx) => {
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, hashCalculado));
            return await authService.gerarEGravarTokens(registro.userId, tx);
        });

        // Adicionar novo token no cookie
        res.cookie("refreshToken", novosTokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/",
        });

        // Dar resposta no mesmo formato do login
        res.json({
            token: novosTokens.accessToken,
        });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // Revoga o token do banco se existir
        if (refreshToken) {
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
        const [registro] = await db
            .select({
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, hashCalculado), eq(tokens.type, "email_verification")));

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
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(eq(tokens.tokenHash, hashCalculado));

            await tx
                .update(users)
                .set({ emailVerifiedAt: new Date() })
                .where(eq(users.id, registro.userId));
        });

        res.json({ mensagem: "Email verificado com sucesso. Você já pode fazer login." });
    } catch (err) {
        next(err);
    }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Resposta genérica, para não revelar se o email tem conta ou já foi verificado.
        const resposta = {
            mensagem: "Se houver uma conta pendente de confirmação com esse email, reenviamos o link.",
        };

        const [user] = await db
            .select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt })
            .from(users)
            .where(eq(users.email, email));

        // Só reenvia quando a conta existe e ainda não foi verificada.
        if (user && !user.emailVerifiedAt) {
            const token = await authService.gerarTokenVerificacao(user.id);
            await emailService.enviarVerificacao(user.email, token);
        }

        res.json(resposta);
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Resposta sempre genérica, para não revelar se o email tem conta.
        const resposta = {
            mensagem: "Se houver uma conta com esse email, enviamos um link para redefinir a senha.",
        };

        const [user] = await db
            .select({ id: users.id, passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.email, email));

        // Só envia quando a conta existe e tem senha (login social não tem o que redefinir).
        if (user && user.passwordHash) {
            const token = await authService.gerarTokenResetSenha(user.id);
            await emailService.enviarResetSenha(email, token);
        }

        res.json(resposta);
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);

        const hashCalculado = createHash("sha256").update(token).digest("hex");
        const [registro] = await db
            .select({
                id: tokens.id,
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, hashCalculado), eq(tokens.type, "password_reset")));

        if (!registro || registro.expiredAt < new Date() || registro.usedAt !== null) {
            return res.status(400).json({ erro: "Link inválido ou expirado. Peça um novo." });
        }

        const passwordHash = await hashSenha(password);

        await db.transaction(async (tx) => {
            // Consome o token de reset.
            await tx.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, registro.id));
            // Troca a senha.
            await tx.update(users).set({ passwordHash }).where(eq(users.id, registro.userId));
            // Revoga as sessões abertas (refresh tokens) por segurança.
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(
                    and(
                        eq(tokens.userId, registro.userId),
                        eq(tokens.type, "refresh"),
                        isNull(tokens.usedAt),
                    ),
                );
        });

        res.json({ mensagem: "Senha redefinida com sucesso. Você já pode fazer login." });
    } catch (err) {
        next(err);
    }
};

// Recuperação por código (OTP): o usuário escolhe receber por email ou WhatsApp.
export const forgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, canal } = forgotPasswordOtpSchema.parse(req.body);

        // Resposta genérica, para não revelar se o email tem conta.
        const resposta = {
            mensagem: "Se houver uma conta com esse email, enviamos um código para redefinir a senha.",
        };

        const [user] = await db
            .select({ id: users.id, phone: users.phone, passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.email, email));

        if (user && user.passwordHash) {
            const otp = await authService.gerarOtpResetSenha(user.id);
            // WhatsApp só se tiver telefone; senão cai no email para o código não se perder.
            if (canal === "whatsapp" && user.phone) {
                await whatsappService.enviarOtpReset(user.phone, otp);
            } else {
                await emailService.enviarOtpReset(email, otp);
            }
        }

        res.json(resposta);
    } catch (err) {
        next(err);
    }
};

export const resetPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password } = resetPasswordOtpSchema.parse(req.body);
        const generico = { erro: "Código inválido ou expirado. Peça um novo." };

        const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        if (!user) return res.status(400).json(generico);

        const hashCalculado = createHash("sha256").update(`${user.id}:${otp}`).digest("hex");
        const [registro] = await db
            .select({
                id: tokens.id,
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
            })
            .from(tokens)
            .where(and(eq(tokens.tokenHash, hashCalculado), eq(tokens.type, "password_reset_otp")));

        if (!registro || registro.expiredAt < new Date() || registro.usedAt !== null) {
            return res.status(400).json(generico);
        }

        const passwordHash = await hashSenha(password);

        await db.transaction(async (tx) => {
            await tx.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, registro.id));
            await tx.update(users).set({ passwordHash }).where(eq(users.id, registro.userId));
            // Revoga as sessões abertas (refresh tokens) por segurança.
            await tx
                .update(tokens)
                .set({ usedAt: new Date() })
                .where(
                    and(
                        eq(tokens.userId, registro.userId),
                        eq(tokens.type, "refresh"),
                        isNull(tokens.usedAt),
                    ),
                );
        });

        res.json({ mensagem: "Senha redefinida com sucesso. Você já pode fazer login." });
    } catch (err) {
        next(err);
    }
};
