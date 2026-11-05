import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { getQueue, getSummary, getTopics } from "../controllers/InterviewController.ts";

const router = Router();

// Interview mode. Answering and reporting stay on the flashcard routes, with
// origem "entrevista": the scheduling engine is the same, and duplicating those
// routes would only create two paths to the same write.
router.get("/entrevista/topicos", autenticar, getTopics);
router.get("/entrevista/resumo", autenticar, getSummary);
router.get("/entrevista/fila", autenticar, getQueue);

export default router;
