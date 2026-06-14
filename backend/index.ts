import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import { sql } from "drizzle-orm";
import { users } from "./schema.ts";

const app = express();

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.get("/db-test", async (req: Request, res: Response) => {
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);
    res.json({ result: result.rows[0] });
});

app.get("/users", async (req: Request, res: Response) => {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
});

app.post("/users", async (req: Request, res: Response) => {
    const novo = await db.insert(users).values({
        name: "João Teste",
        email: "`teste${Date.now()}@email.com`",
        passwordHash: "hash_de_mentira",
        birthDate: "2000-04-25",
        gender: "masculino",
        phone: "98999999999"
    }).returning();
    res.json(novo);
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});