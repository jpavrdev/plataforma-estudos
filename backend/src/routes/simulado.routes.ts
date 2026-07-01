import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import {
    listSimulados,
    startAttempt,
    getAttempt,
    saveAnswer,
    submitAttempt,
    getMyAttempts,
} from "../controllers/SimuladoController.ts";

const router = Router();

router.get("/simulados", autenticar, listSimulados);
router.get("/me/simulado-attempts", autenticar, getMyAttempts);
router.post("/simulados/:slug/attempts", autenticar, startAttempt);
router.get("/simulado-attempts/:id", autenticar, getAttempt);
router.put("/simulado-attempts/:id/answers/:questionId", autenticar, saveAnswer);
router.post("/simulado-attempts/:id/submit", autenticar, submitAttempt);

export default router;
