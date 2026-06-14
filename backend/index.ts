import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import jwt from "jsonwebtoken";
import { sql, eq } from "drizzle-orm";
import { users } from "./schema.ts";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

function autenticar(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
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
    const { name, email, password, birthDate, gender, phone } = req.body; //isso se chama desestruturação
    // Em vez de escrever req.body.name, req.body.email um por um, você "puxa" todos de uma vez para variáveis com o mesmo nome

    const passwordHash = await bcrypt.hash(password, 10); // password é o texto puro do usuario, 10 é o fator de custo
    // tem await também porque o hash é lento (tudo que demora é assincrono)

    const novo = await db.insert(users).values({
        name,
        email,
        passwordHash,
        birthDate,
        gender,
        phone
    }).returning({ id: users.id, name: users.name, email: users.email });

    res.json(novo);
});

app.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const encontrados = await db.select().from(users).where(eq(users.email, email));

    const user = encontrados[0];

    if (!user) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(password, user.passwordHash);

    if (!senhaCorreta) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
    }
    
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});