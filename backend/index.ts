import { env } from "./src/config/env.ts";
import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import cookieParser from "cookie-parser";
import { sql } from "drizzle-orm";
import authRoutes from "./src/routes/auth.routes.ts";
import userRoutes from "./src/routes/user.routes.ts";
import { errorMiddleware } from "./src/middlewares/error.ts";
import helmet from "helmet";
import cors from "cors";

const PORT = Number(env.PORT) || 3001;
const app = express();

app.set("trust proxy", 1);

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: env.NODE_ENV === "production"
    ? env.FRONTEND_URL
    : true,
    credentials: true,
}));

app.use(authRoutes);
app.use(userRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/db-test", async (_req: Request, res: Response) => {
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);
    res.json({ result: result.rows[0] });
});

app.use(errorMiddleware);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});