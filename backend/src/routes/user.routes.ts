import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    getMe,
    updateMe,
    completarPerfil,
    uploadAvatar,
    uploadCover,
    listUsers,
} from "../controllers/UserController.ts";
const router = Router();

router.get("/me", autenticar, getMe);
router.patch("/me", autenticar, updateMe);
router.post("/me/complete-profile", autenticar, completarPerfil);
router.post("/me/avatar", autenticar, uploadAvatar);
router.post("/me/cover", autenticar, uploadCover);
router.get("/users", autenticar, exigirAdmin, listUsers);

export default router;
