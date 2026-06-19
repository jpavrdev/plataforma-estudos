import { loginSchema, registerSchema, refreshSchema } from "../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import { db } from "../../db.ts";
import { users, tokens } from "../../schema.ts";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";
import { createHash } from "node:crypto";

const BCRYPT_COST = 10;

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

            const { accessToken, refreshToken } = await authService.gerarEGravarTokens(usuarioCriado.id, tx);

            return { user: usuarioCriado, accessToken, refreshToken };

        });

        const { refreshToken, ...dadosResposta } = novoUsuario;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/refresh"
        });

        res.status(201).json(dadosResposta);
        
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const dados = loginSchema.parse(req.body);

        const encontrados = await db.select().from(users).where(eq(users.email, dados.email));
        const user = encontrados[0];

        // Definimos qual hash será comparado. Se o usuário existir, usamos o dele.
        // Se não existir, usamos o DUMMY_HASH.
        const hashParaComparar = user ? user.passwordHash : DUMMY_HASH;

        const senhaCorreta = await bcrypt.compare(dados.password, hashParaComparar);

        if (!user || !senhaCorreta) {
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        const { accessToken, refreshToken } = await authService.gerarEGravarTokens(user.id);

        res.json({ name: user.name, email: user.email, token: accessToken});

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/refresh"
        });

    } catch (err) {
        next(err);
    }
};

export const refresh = async(req: Request, res: Response, next: NextFunction) => {
    try {
        // VAlida a entrada
        const refreshToken = req.cookies.refreshToken;

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
        res.cookie("refreshToken", novosTokens, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24h
            path: "/refresh"
        });

        // Dar resposta no mesmo formato do login
        res.json({
            token: novosTokens.accessToken,
        });

    } catch(err) {
        next(err);
    }
};