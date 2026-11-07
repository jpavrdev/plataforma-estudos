import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import {
    getSummary,
    getDecks,
    getStatistics,
    getHistory,
    getWeakPoints,
    getQueue,
    getTrailReview,
    getTrailReviewCount,
    postAnswer,
    postReport,
} from "../controllers/FlashcardController.ts";

const router = Router();

router.get("/flashcards/resumo", authenticate, getSummary);
router.get("/flashcards/fila", authenticate, getQueue);
router.get("/flashcards/baralhos", authenticate, getDecks);
router.get("/flashcards/estatisticas", authenticate, getStatistics);
router.get("/flashcards/historico", authenticate, getHistory);
router.get("/flashcards/pontos-fracos", authenticate, getWeakPoints);
// Review of a whole trail, offered on completing it. The count route comes first
// so "contagem" is not read as a trailId.
router.get("/flashcards/trilha/:trailId/contagem", authenticate, getTrailReviewCount);
router.get("/flashcards/trilha/:trailId", authenticate, getTrailReview);
router.post("/flashcards/:id/responder", authenticate, postAnswer);
router.post("/flashcards/:id/reportar", authenticate, postReport);

export default router;
