import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    getMe,
    updateMe,
    completarPerfil,
    uploadAvatar,
    uploadCover,
    removerAvatar,
    removerCover,
    listUsers,
    getPublicProfile,
    getMyProgress,
    setWeeklyGoal,
    clearWeeklyGoal,
} from "../controllers/UserController.ts";
const router = Router();

router.get("/me", autenticar, getMe);
router.patch("/me", autenticar, updateMe);
router.post("/me/complete-profile", autenticar, completarPerfil);
router.post("/me/avatar", autenticar, uploadAvatar);
router.post("/me/cover", autenticar, uploadCover);
router.delete("/me/avatar", autenticar, removerAvatar);
router.delete("/me/cover", autenticar, removerCover);
router.get("/me/progresso", autenticar, getMyProgress);
router.put("/me/meta-semanal", autenticar, setWeeklyGoal);
router.delete("/me/meta-semanal", autenticar, clearWeeklyGoal);
router.get("/users", autenticar, exigirAdmin, listUsers);

// Perfil público compartilhável: qualquer pessoa vê, sem login.
router.get("/perfis/:username", getPublicProfile);

export default router;
