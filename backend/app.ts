import { env } from "./src/config/env.ts";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.ts";
import userRoutes from "./src/routes/user.routes.ts";
import trailRoutes from "./src/routes/trail.routes.ts";
import simuladoRoutes from "./src/routes/simulado.routes.ts";
import desafioRoutes from "./src/routes/desafio.routes.ts";
import { errorMiddleware } from "./src/middlewares/error.ts";
import helmet from "helmet";
import cors from "cors";
import { UPLOADS_DIR } from "./src/config/paths.ts";

export const app = express();

app.set("trust proxy", 1);

app.use(cookieParser());
// Uploads de imagem trafegam como data URL (base64) em JSON e precisam de um
// limite maior que o padrao. Aplicado so nessas rotas; o json global segue enxuto.
app.use("/me/avatar", express.json({ limit: "6mb" }));
app.use("/me/cover", express.json({ limit: "6mb" }));
app.use(express.json());
app.use(helmet());
app.use(
    cors({
        origin: env.NODE_ENV === "production" ? env.FRONTEND_URL : true,
        credentials: true,
    }),
);

// Imagens enviadas pelos usuarios. Libera o carregamento cross-origin para o
// front (em dev fica em outra origem que o backend).
app.use(
    "/uploads",
    (_req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
    },
    express.static(UPLOADS_DIR),
);

app.use(authRoutes);
app.use(userRoutes);
app.use(trailRoutes);
app.use(simuladoRoutes);
app.use(desafioRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorMiddleware);
