import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import { desafioRunLimiter } from "../middlewares/rateLimit.ts";
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

router.get("/desafios/hoje", autenticar, getDailyChallenge);
router.get("/desafios", autenticar, getChallenges);
router.get("/desafios/:id", autenticar, getChallenge);
router.post("/desafios/:id/run", desafioRunLimiter, autenticar, runExamples);
router.post("/desafios/:id/submit", desafioRunLimiter, autenticar, submitChallenge);
router.get("/desafios/:id/solucoes", autenticar, getSolutions);
router.get("/desafios/:id/comentarios", autenticar, getComments);
router.post("/desafios/:id/comentarios", autenticar, postComment);
router.delete("/desafios/comentarios/:commentId", autenticar, deleteComment);

// Admin: CRUD of challenges and test cases.
router.get("/admin/desafios", autenticar, exigirAdmin, adminListChallenges);
router.post("/desafios", autenticar, exigirAdmin, createChallenge);
router.get("/admin/desafios/:id", autenticar, exigirAdmin, adminGetChallenge);
router.patch("/desafios/:id", autenticar, exigirAdmin, updateChallenge);
router.delete("/desafios/:id", autenticar, exigirAdmin, deleteChallenge);

export default router;
