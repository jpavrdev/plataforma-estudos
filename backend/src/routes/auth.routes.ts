import { Router } from "express";
import { login, refresh, register, logout, verifyEmail } from "../controllers/AuthController.ts";
import { loginLimiter } from "../middlewares/rateLimit.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/register", loginLimiter, register);
router.post("/refresh", loginLimiter, refresh);
router.post("/logout", loginLimiter, logout);
router.post("/verify-email", loginLimiter, verifyEmail);

export default router;
