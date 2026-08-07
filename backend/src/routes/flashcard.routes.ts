import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
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
} from "../controllers/FlashcardController.ts";

const router = Router();

router.get("/flashcards/resumo", autenticar, getResumo);
router.get("/flashcards/fila", autenticar, getFila);
router.get("/flashcards/baralhos", autenticar, getBaralhos);
router.get("/flashcards/estatisticas", autenticar, getEstatisticas);
router.get("/flashcards/historico", autenticar, getHistorico);
router.get("/flashcards/pontos-fracos", autenticar, getPontosFracos);
// Revisão de uma trilha inteira, oferecida ao concluí-la. A contagem vem antes na
// ordem das rotas para "contagem" não ser lido como um trailId.
router.get("/flashcards/trilha/:trailId/contagem", autenticar, getContagemTrilha);
router.get("/flashcards/trilha/:trailId", autenticar, getRevisaoTrilha);
router.post("/flashcards/:id/responder", autenticar, postResposta);

export default router;
