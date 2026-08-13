import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { getFila, getResumo, getTopicos } from "../controllers/EntrevistaController.ts";

const router = Router();

// Modo entrevista. Responder e reportar continuam nas rotas de flashcards, com
// origem "entrevista": o motor de agendamento é o mesmo, e duplicar aquelas rotas
// só criaria dois caminhos para a mesma escrita.
router.get("/entrevista/topicos", autenticar, getTopicos);
router.get("/entrevista/resumo", autenticar, getResumo);
router.get("/entrevista/fila", autenticar, getFila);

export default router;
