import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    uploadLimiter,
    telefoneCodigoLimiter,
    telefoneLimiter,
    twoFactorLimiter,
} from "../middlewares/rateLimit.ts";
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
    uploadBackground,
    removerBackground,
    trocarTelefone,
    pedirCodigoTelefone,
    verificarTelefone,
} from "../controllers/UserController.ts";
import {
    getTwoFactorStatus,
    startTwoFactorSetup,
    enableTwoFactor,
    regenerateRecoveryCodes,
    disableTwoFactor,
} from "../controllers/TwoFactorController.ts";
const router = Router();

router.get("/me", autenticar, getMe);
router.patch("/me", autenticar, updateMe);
router.post("/me/complete-profile", autenticar, completarPerfil);
router.put("/me/telefone", telefoneLimiter, autenticar, trocarTelefone);
router.post("/me/telefone/codigo", telefoneCodigoLimiter, autenticar, pedirCodigoTelefone);
router.post("/me/telefone/verificar", telefoneLimiter, autenticar, verificarTelefone);
router.get("/me/2fa", autenticar, getTwoFactorStatus);
router.post("/me/2fa/setup", twoFactorLimiter, autenticar, startTwoFactorSetup);
router.post("/me/2fa/enable", twoFactorLimiter, autenticar, enableTwoFactor);
router.post("/me/2fa/recovery-codes", twoFactorLimiter, autenticar, regenerateRecoveryCodes);
router.post("/me/2fa/disable", twoFactorLimiter, autenticar, disableTwoFactor);
router.post("/me/avatar", uploadLimiter, autenticar, uploadAvatar);
router.post("/me/cover", uploadLimiter, autenticar, uploadCover);
router.delete("/me/avatar", autenticar, removerAvatar);
router.delete("/me/cover", autenticar, removerCover);
router.post("/me/fundo", uploadLimiter, autenticar, uploadBackground);
router.delete("/me/fundo", autenticar, removerBackground);
router.get("/me/progresso", autenticar, getMyProgress);
router.put("/me/meta-semanal", autenticar, setWeeklyGoal);
router.delete("/me/meta-semanal", autenticar, clearWeeklyGoal);
router.get("/users", autenticar, exigirAdmin, listUsers);

// Perfil público compartilhável: qualquer pessoa vê, sem login.
router.get("/perfis/:username", getPublicProfile);

export default router;
