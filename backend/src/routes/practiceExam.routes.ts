import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    listPracticeExams,
    toggleFavorite,
    startAttempt,
    getAttemptOptions,
    getAttempt,
    saveAnswer,
    checkAnswer,
    submitAttempt,
    getMyAttempts,
    adminListPracticeExams,
    adminGetPracticeExam,
    createPracticeExam,
    updatePracticeExam,
    deletePracticeExam,
    createExamQuestion,
    updateExamQuestion,
    deleteExamQuestion,
    syncExamQuestions,
} from "../controllers/PracticeExamController.ts";

const router = Router();

router.get("/simulados", autenticar, listPracticeExams);
router.get("/me/simulado-attempts", autenticar, getMyAttempts);
router.post("/simulados/:slug/favoritar", autenticar, toggleFavorite);
router.get("/simulados/:slug/opcoes", autenticar, getAttemptOptions);
router.post("/simulados/:slug/attempts", autenticar, startAttempt);
router.get("/simulado-attempts/:id", autenticar, getAttempt);
router.put("/simulado-attempts/:id/answers/:questionId", autenticar, saveAnswer);
router.post("/simulado-attempts/:id/answers/:questionId/conferir", autenticar, checkAnswer);
router.post("/simulado-attempts/:id/submit", autenticar, submitAttempt);

// Admin: CRUD of exams and questions
router.get("/admin/simulados", autenticar, exigirAdmin, adminListPracticeExams);
router.post("/simulados", autenticar, exigirAdmin, createPracticeExam);
router.get("/admin/simulados/:slug", autenticar, exigirAdmin, adminGetPracticeExam);
router.patch("/simulados/:slug", autenticar, exigirAdmin, updatePracticeExam);
router.delete("/simulados/:slug", autenticar, exigirAdmin, deletePracticeExam);
router.post("/simulados/:slug/questions", autenticar, exigirAdmin, createExamQuestion);
router.put("/admin/simulados/:slug/questions", autenticar, exigirAdmin, syncExamQuestions);
router.patch("/simulado-questions/:id", autenticar, exigirAdmin, updateExamQuestion);
router.delete("/simulado-questions/:id", autenticar, exigirAdmin, deleteExamQuestion);

export default router;
