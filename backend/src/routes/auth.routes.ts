import { Router } from "express";
import { login, refresh, register, logout, verifyEmail } from "../controllers/AuthController.ts";
import { iniciarOAuth, callbackOAuth } from "../controllers/OAuthController.ts";
import {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    verifyEmailLimiter,
} from "../middlewares/rateLimit.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/register", registerLimiter, register);
router.post("/refresh", refreshLimiter, refresh);
router.post("/logout", refreshLimiter, logout);
router.post("/verify-email", verifyEmailLimiter, verifyEmail);

// Login social (OAuth): inicia o fluxo e trata o retorno do provedor.
router.get("/auth/:provider", iniciarOAuth);
router.get("/auth/:provider/callback", callbackOAuth);

export default router;
