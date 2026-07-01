import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    listSimulados,
    startAttempt,
    getAttempt,
    saveAnswer,
    submitAttempt,
    getMyAttempts,
    adminListSimulados,
    adminGetSimulado,
    createSimulado,
    updateSimulado,
    deleteSimulado,
    createSimuladoQuestion,
    updateSimuladoQuestion,
    deleteSimuladoQuestion,
    syncSimuladoQuestions,
} from "../controllers/SimuladoController.ts";

const router = Router();

router.get("/simulados", autenticar, listSimulados);
router.get("/me/simulado-attempts", autenticar, getMyAttempts);
router.post("/simulados/:slug/attempts", autenticar, startAttempt);
router.get("/simulado-attempts/:id", autenticar, getAttempt);
router.put("/simulado-attempts/:id/answers/:questionId", autenticar, saveAnswer);
router.post("/simulado-attempts/:id/submit", autenticar, submitAttempt);

// Admin: CRUD de simulados e questões
router.get("/admin/simulados", autenticar, exigirAdmin, adminListSimulados);
router.post("/simulados", autenticar, exigirAdmin, createSimulado);
router.get("/admin/simulados/:slug", autenticar, exigirAdmin, adminGetSimulado);
router.patch("/simulados/:slug", autenticar, exigirAdmin, updateSimulado);
router.delete("/simulados/:slug", autenticar, exigirAdmin, deleteSimulado);
router.post("/simulados/:slug/questions", autenticar, exigirAdmin, createSimuladoQuestion);
router.put("/admin/simulados/:slug/questions", autenticar, exigirAdmin, syncSimuladoQuestions);
router.patch("/simulado-questions/:id", autenticar, exigirAdmin, updateSimuladoQuestion);
router.delete("/simulado-questions/:id", autenticar, exigirAdmin, deleteSimuladoQuestion);

export default router;
