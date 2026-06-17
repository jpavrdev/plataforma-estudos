import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { getMe, listUsers } from "../controllers/UserController.ts";
const router = Router();

router.get("/me", autenticar, getMe);
router.get("/users", listUsers);

export default router;