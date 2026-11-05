import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import {
    getResumo,
    getBaralhos,
    getEstatisticas,
    getHistorico,
    getPontosFracos,
    getFila,
    getRevisaoTrilha,
    getContagemTrilha,
    postResposta,
    postReporte,
} from "../controllers/FlashcardController.ts";

const router = Router();

router.get("/flashcards/resumo", authenticate, getResumo);
router.get("/flashcards/fila", authenticate, getFila);
router.get("/flashcards/baralhos", authenticate, getBaralhos);
router.get("/flashcards/estatisticas", authenticate, getEstatisticas);
router.get("/flashcards/historico", authenticate, getHistorico);
router.get("/flashcards/pontos-fracos", authenticate, getPontosFracos);
// Revisão de uma trilha inteira, oferecida ao concluí-la. A contagem vem antes na
// ordem das rotas para "contagem" não ser lido como um trailId.
router.get("/flashcards/trilha/:trailId/contagem", authenticate, getContagemTrilha);
router.get("/flashcards/trilha/:trailId", authenticate, getRevisaoTrilha);
router.post("/flashcards/:id/responder", authenticate, postResposta);
router.post("/flashcards/:id/reportar", authenticate, postReporte);

export default router;
