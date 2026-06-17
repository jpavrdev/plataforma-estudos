import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import jwt from "jsonwebtoken";
import { sql, eq } from "drizzle-orm";
import { users, tokens } from "./schema.ts";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from "./validator.ts";
import { ZodError } from "zod";
import { randomBytes, createHash } from "node:crypto";

const BCRYPT_COST = 10;
const JWT_SECRET = String(process.env.JWT_SECRET);
const DUMMY_HASH = bcrypt.hashSync("uma_senha_qualquer_dummy", BCRYPT_COST);

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não definido");
}

const app = express();
app.use(express.json());

function autenticar(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        (req as any).userId = (payload as any).userId;
        next();
    } catch {
        return res.status(401).json({ erro: "Token inválido" });
    }
};

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.get("/db-test", async (req: Request, res: Response) => {
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);
    res.json({ result: result.rows[0] });
});

app.get("/me", autenticar, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const encontrados = await db.select().from(users).where(eq(users.id, userId));
    const user = encontrados[0];
    res.json({ id: user.id, name: user.name, email: user.email });
});

app.get("/users", async (req: Request, res: Response) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
});

app.post("/register", async (req: Request, res: Response) => {
    try {
        const dados = registerSchema.parse(req.body);

        const passwordHash = await bcrypt.hash(dados.password, BCRYPT_COST);

        const novoUsuario = await db.transaction(async (tx) => {
            const usuarioCriado = await tx.insert(users).values({
                name: dados.name,
                email: dados.email,
                passwordHash,
                birthDate: dados.birthDate,
                gender: dados.gender,
                phone: dados.phone
            }).returning({ id: users.id, name: users.name, email: users.email });

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

    } catch (err: unknown) {
        // Validação de dados do Zod
        if (err instanceof ZodError) {
            return res.status(400).json({ erro: "Dados inválidos", detalhes: err.issues });
        }

        // Verificação do erro de duplicidade do Drizzle/Postgres
        if (err && typeof err === "object") {
            // O Drizzle encapsula o erro do driver do Postgres na propriedade 'cause'
            const dbError = (err as any).cause || err;

            if (dbError.code === "23505") {
                return res.status(409).json({ erro: "Email já cadastrado" });
            }
        }

        console.error("Erro no cadastro:", err);
        res.status(500).json({ erro: "Erro ao criar usuário" });
    }
});

app.post("/login", async (req: Request, res: Response) => {
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

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            return res.status(400).json({ erro: "Dados inválidos", detalhes: err.issues });
        }

        console.error("Erro ao fazer login:", err);
        res.status(500).json({ erro: "Erro ao fazer login" });
    }

});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});