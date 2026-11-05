import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import { challengeRunLimiter } from "../middlewares/rateLimit.ts";
import {
    getDailyChallenge,
    getChallenges,
    getChallenge,
    runExamples,
    submitChallenge,
    getSolutions,
    getComments,
    postComment,
    deleteComment,
    adminListChallenges,
    adminGetChallenge,
    createChallenge,
    updateChallenge,
    deleteChallenge,
} from "../controllers/ChallengeController.ts";

const router = Router();

router.get("/desafios/hoje", authenticate, getDailyChallenge);
router.get("/desafios", authenticate, getChallenges);
router.get("/desafios/:id", authenticate, getChallenge);
router.post("/desafios/:id/run", challengeRunLimiter, authenticate, runExamples);
router.post("/desafios/:id/submit", challengeRunLimiter, authenticate, submitChallenge);
router.get("/desafios/:id/solucoes", authenticate, getSolutions);
router.get("/desafios/:id/comentarios", authenticate, getComments);
router.post("/desafios/:id/comentarios", authenticate, postComment);
router.delete("/desafios/comentarios/:commentId", authenticate, deleteComment);

// Admin: CRUD of challenges and test cases.
router.get("/admin/desafios", authenticate, requireAdmin, adminListChallenges);
router.post("/desafios", authenticate, requireAdmin, createChallenge);
router.get("/admin/desafios/:id", authenticate, requireAdmin, adminGetChallenge);
router.patch("/desafios/:id", authenticate, requireAdmin, updateChallenge);
router.delete("/desafios/:id", authenticate, requireAdmin, deleteChallenge);

export default router;
