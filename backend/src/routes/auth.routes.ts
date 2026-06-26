import { Router } from "express";
import { login, refresh, register, logout, verifyEmail } from "../controllers/AuthController.ts";
import { loginLimiter } from "../middlewares/rateLimit.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/register", loginLimiter, register);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);

export default router;  