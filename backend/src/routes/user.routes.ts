import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    uploadLimiter,
    phoneCodeLimiter,
    phoneLimiter,
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
import { updateLocale } from "../controllers/LocaleController.ts";
const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.post("/me/complete-profile", authenticate, completarPerfil);
router.put("/me/locale", authenticate, updateLocale);
router.put("/me/telefone", phoneLimiter, authenticate, trocarTelefone);
router.post("/me/telefone/codigo", phoneCodeLimiter, authenticate, pedirCodigoTelefone);
router.post("/me/telefone/verificar", phoneLimiter, authenticate, verificarTelefone);
router.get("/me/2fa", authenticate, getTwoFactorStatus);
router.post("/me/2fa/setup", twoFactorLimiter, authenticate, startTwoFactorSetup);
router.post("/me/2fa/enable", twoFactorLimiter, authenticate, enableTwoFactor);
router.post("/me/2fa/recovery-codes", twoFactorLimiter, authenticate, regenerateRecoveryCodes);
router.post("/me/2fa/disable", twoFactorLimiter, authenticate, disableTwoFactor);
router.post("/me/avatar", uploadLimiter, authenticate, uploadAvatar);
router.post("/me/cover", uploadLimiter, authenticate, uploadCover);
router.delete("/me/avatar", authenticate, removerAvatar);
router.delete("/me/cover", authenticate, removerCover);
router.post("/me/fundo", uploadLimiter, authenticate, uploadBackground);
router.delete("/me/fundo", authenticate, removerBackground);
router.get("/me/progresso", authenticate, getMyProgress);
router.put("/me/meta-semanal", authenticate, setWeeklyGoal);
router.delete("/me/meta-semanal", authenticate, clearWeeklyGoal);
router.get("/users", authenticate, requireAdmin, listUsers);

// Perfil público compartilhável: qualquer pessoa vê, sem login.
router.get("/perfis/:username", getPublicProfile);

export default router;
