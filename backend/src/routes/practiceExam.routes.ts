import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
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

router.get("/simulados", authenticate, listPracticeExams);
router.get("/me/simulado-attempts", authenticate, getMyAttempts);
router.post("/simulados/:slug/favoritar", authenticate, toggleFavorite);
router.get("/simulados/:slug/opcoes", authenticate, getAttemptOptions);
router.post("/simulados/:slug/attempts", authenticate, startAttempt);
router.get("/simulado-attempts/:id", authenticate, getAttempt);
router.put("/simulado-attempts/:id/answers/:questionId", authenticate, saveAnswer);
router.post("/simulado-attempts/:id/answers/:questionId/conferir", authenticate, checkAnswer);
router.post("/simulado-attempts/:id/submit", authenticate, submitAttempt);

// Admin: CRUD of exams and questions
router.get("/admin/simulados", authenticate, requireAdmin, adminListPracticeExams);
router.post("/simulados", authenticate, requireAdmin, createPracticeExam);
router.get("/admin/simulados/:slug", authenticate, requireAdmin, adminGetPracticeExam);
router.patch("/simulados/:slug", authenticate, requireAdmin, updatePracticeExam);
router.delete("/simulados/:slug", authenticate, requireAdmin, deletePracticeExam);
router.post("/simulados/:slug/questions", authenticate, requireAdmin, createExamQuestion);
router.put("/admin/simulados/:slug/questions", authenticate, requireAdmin, syncExamQuestions);
router.patch("/simulado-questions/:id", authenticate, requireAdmin, updateExamQuestion);
router.delete("/simulado-questions/:id", authenticate, requireAdmin, deleteExamQuestion);

export default router;
