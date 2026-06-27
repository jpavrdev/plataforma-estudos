import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    createTrail,
    createLesson,
    listTrails,
    getTrail,
    getMyTrails,
    completeLesson,
} from "../controllers/TrailController.ts";

const router = Router();

// Catálogo (admin cria, qualquer logado lê)
router.post("/trails", autenticar, exigirAdmin, createTrail);
router.post("/trails/:id/lessons", autenticar, exigirAdmin, createLesson);
router.get("/trails", autenticar, listTrails);
router.get("/trails/:id", autenticar, getTrail);

// Progresso do aluno
router.get("/me/trails", autenticar, getMyTrails);
router.post("/lessons/:id/complete", autenticar, completeLesson);

export default router;
