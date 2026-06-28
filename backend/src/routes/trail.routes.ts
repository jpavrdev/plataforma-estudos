import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    createTrail,
    createModule,
    createLesson,
    createQuestion,
    listTrails,
    getTrail,
    getLesson,
    getMyTrails,
    submitQuiz,
    setLessonPublished,
} from "../controllers/TrailController.ts";

const router = Router();

// Catálogo (admin cria, qualquer logado lê)
router.post("/trails", autenticar, exigirAdmin, createTrail);
router.post("/trails/:id/modules", autenticar, exigirAdmin, createModule);
router.post("/modules/:id/lessons", autenticar, exigirAdmin, createLesson);
router.post("/lessons/:id/questions", autenticar, exigirAdmin, createQuestion);
router.patch("/lessons/:id/published", autenticar, exigirAdmin, setLessonPublished);
router.get("/trails", autenticar, listTrails);
router.get("/trails/:id", autenticar, getTrail);
router.get("/lessons/:id", autenticar, getLesson);

// Progresso do aluno
router.get("/me/trails", autenticar, getMyTrails);
router.post("/lessons/:id/quiz", autenticar, submitQuiz);

export default router;
