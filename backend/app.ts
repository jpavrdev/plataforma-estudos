import { env } from "./src/config/env.ts";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.ts";
import userRoutes from "./src/routes/user.routes.ts";
import { errorMiddleware } from "./src/middlewares/error.ts";
import helmet from "helmet";
import cors from "cors";

export const app = express();

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

app.use(errorMiddleware);
