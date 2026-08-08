import { env } from "./src/config/env.ts";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.ts";
import userRoutes from "./src/routes/user.routes.ts";
import trailRoutes from "./src/routes/trail.routes.ts";
import simuladoRoutes from "./src/routes/simulado.routes.ts";
import desafioRoutes from "./src/routes/desafio.routes.ts";
import adminRoutes from "./src/routes/admin.routes.ts";
import roadmapRoutes from "./src/routes/roadmap.routes.ts";
import flashcardRoutes from "./src/routes/flashcard.routes.ts";
import comunicadoRoutes from "./src/routes/comunicado.routes.ts";
import certificateRoutes from "./src/routes/certificate.routes.ts";
import apoioRoutes from "./src/routes/apoio.routes.ts";
import comunidadeRoutes from "./src/routes/comunidade.routes.ts";
import labRoutes from "./src/routes/lab.routes.ts";
import atsRoutes from "./src/routes/ats.routes.ts";
import { errorMiddleware } from "./src/middlewares/error.ts";
import { apiLimiter } from "./src/middlewares/rateLimit.ts";
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
app.use("/me/fundo", express.json({ limit: "14mb" }));
app.use("/comunidade/imagem", express.json({ limit: "6mb" }));
app.use("/curriculo/analises", express.json({ limit: "8mb" }));
app.use(express.json());
app.use(helmet({ frameguard: { action: "deny" } }));
// Refletir a origem que chega, junto com credentials, deixaria qualquer site
// chamar a API autenticado como quem estivesse logado.
const ORIGENS =
    env.NODE_ENV === "production"
        ? [env.FRONTEND_URL]
        : [env.FRONTEND_URL, /^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

app.use(cors({ origin: ORIGENS, credentials: true }));

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
app.use(apiLimiter);
app.use(userRoutes);
app.use(trailRoutes);
app.use(simuladoRoutes);
app.use(desafioRoutes);
app.use(roadmapRoutes);
app.use(flashcardRoutes);
app.use(comunicadoRoutes);
app.use(certificateRoutes);
app.use(apoioRoutes);
app.use(comunidadeRoutes);
app.use(labRoutes);
app.use(atsRoutes);
app.use(adminRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorMiddleware);
