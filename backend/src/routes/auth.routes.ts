import { Router } from "express";
import { login, refresh, register } from "../controllers/AuthController.ts";
import { loginLimiter } from "../middlewares/rateLimit.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/register", loginLimiter, register);
router.post("/refresh", refresh)

export default router;  