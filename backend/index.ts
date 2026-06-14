import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import { sql } from "drizzle-orm";

const app = express();

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.get("/db-test", async (req: Request, res: Response) => {
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);
    res.json({ result: result.rows[0] });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});