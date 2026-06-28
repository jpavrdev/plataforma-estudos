import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    createTrail,
    updateTrail,
    deleteTrail,
    createModule,
    deleteModule,
    createLesson,
    createQuestion,
    listTrails,
    getTrail,
    getLesson,
    getMyTrails,
    getMyXp,
    submitQuiz,
    checkAnswer,
    setLessonPublished,
    getTrailStudio,
    getLessonStudio,
    saveLessonStudio,
    deleteLesson,
    listTags,
    createTag,
    updateTag,
    deleteTag,
} from "../controllers/TrailController.ts";

const router = Router();

// Catálogo (admin cria, qualquer logado lê)
router.post("/trails", autenticar, exigirAdmin, createTrail);
router.patch("/trails/:id", autenticar, exigirAdmin, updateTrail);
router.delete("/trails/:id", autenticar, exigirAdmin, deleteTrail);

// Tags (categorias): leitura para qualquer logado; escrita só admin
router.get("/tags", autenticar, listTags);
router.post("/tags", autenticar, exigirAdmin, createTag);
router.patch("/tags/:id", autenticar, exigirAdmin, updateTag);
router.delete("/tags/:id", autenticar, exigirAdmin, deleteTag);
router.post("/trails/:id/modules", autenticar, exigirAdmin, createModule);
router.post("/modules/:id/lessons", autenticar, exigirAdmin, createLesson);
router.delete("/modules/:id", autenticar, exigirAdmin, deleteModule);
router.post("/lessons/:id/questions", autenticar, exigirAdmin, createQuestion);
router.patch("/lessons/:id/published", autenticar, exigirAdmin, setLessonPublished);
router.get("/trails", autenticar, listTrails);
router.get("/trails/:id", autenticar, getTrail);
router.get("/lessons/:id", autenticar, getLesson);

// Estúdio (admin): edição de estrutura e conteúdo das aulas
router.get("/trails/:id/studio", autenticar, exigirAdmin, getTrailStudio);
router.get("/lessons/:id/studio", autenticar, exigirAdmin, getLessonStudio);
router.put("/lessons/:id/studio", autenticar, exigirAdmin, saveLessonStudio);
router.delete("/lessons/:id", autenticar, exigirAdmin, deleteLesson);

// Progresso do aluno
router.get("/me/trails", autenticar, getMyTrails);
router.get("/me/xp", autenticar, getMyXp);
router.post("/lessons/:id/quiz", autenticar, submitQuiz);
router.post("/lessons/:id/quiz/check", autenticar, checkAnswer);

export default router;
