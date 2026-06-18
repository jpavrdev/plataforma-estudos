import { loginSchema, registerSchema } from "../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import { db } from "../../db.ts";
import { users } from "../../schema.ts";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";

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

        res.status(201).json(novoUsuario);
        
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

        res.json({ accessToken, refreshToken, user });

    } catch (err) {
        next(err);
    }
};