import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    uploadLimiter,
    telefoneCodigoLimiter,
    telefoneLimiter,
    doisFatoresLimiter,
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
    estadoDoisFatores,
    configurarDoisFatores,
    ativarDoisFatores,
    novosCodigosDoisFatores,
    desativarDoisFatores,
} from "../controllers/DoisFatoresController.ts";
const router = Router();

router.get("/me", autenticar, getMe);
router.patch("/me", autenticar, updateMe);
router.post("/me/complete-profile", autenticar, completarPerfil);
router.put("/me/telefone", telefoneLimiter, autenticar, trocarTelefone);
router.post("/me/telefone/codigo", telefoneCodigoLimiter, autenticar, pedirCodigoTelefone);
router.post("/me/telefone/verificar", telefoneLimiter, autenticar, verificarTelefone);
router.get("/me/2fa", autenticar, estadoDoisFatores);
router.post("/me/2fa/configurar", doisFatoresLimiter, autenticar, configurarDoisFatores);
router.post("/me/2fa/ativar", doisFatoresLimiter, autenticar, ativarDoisFatores);
router.post("/me/2fa/codigos", doisFatoresLimiter, autenticar, novosCodigosDoisFatores);
router.post("/me/2fa/desativar", doisFatoresLimiter, autenticar, desativarDoisFatores);
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
