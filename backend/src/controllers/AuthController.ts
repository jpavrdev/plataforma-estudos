import { loginSchema, registerSchema } from "../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import { db } from "../../db.ts";
import { tokens, users } from "../../schema.ts";
import { createHash, randomBytes } from "node:crypto";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

const BCRYPT_COST = 10;

const JWT_SECRET = String(env.JWT_SECRET);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não definido");
}

const DUMMY_HASH = bcrypt.hashSync("uma_senha_qualquer_dummy", BCRYPT_COST);

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = registerSchema.parse(req.body);

        const passwordHash = await bcrypt.hash(dados.password, BCRYPT_COST);

        const novoUsuario = await db.transaction(async(tx) => {
            const usuarioCriado = await tx.insert(users).values({
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

            const tokenPuro = randomBytes(32).toString("hex");

            const tokenHash = createHash("sha256") // escolhe o algoritmo e cria o hash vazio
                            .update(tokenPuro) // joga o dado dentro
                            .digest("hex") // fecha e devolve o resultado

            const dataExpiracao = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await tx.insert(tokens).values({
                userId: usuarioCriado[0].id,
                tokenHash: tokenHash,
                expiredAt: dataExpiracao
            });

            return usuarioCriado;
        });

        res.status(201).json(novoUsuario[0]);
        
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

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email 
            } 
        });

    } catch (err) {
        next(err);
    }
};