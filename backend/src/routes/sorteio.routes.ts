import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    getSorteioAtivo,
    postParticipacao,
    listSorteiosStudio,
    getSorteioStudio,
    createSorteio,
    updateSorteio,
    deleteSorteio,
    postSortear,
} from "../controllers/SorteioController.ts";

const router = Router();

router.get("/sorteios/ativo", authenticate, getSorteioAtivo);
router.post("/sorteios/:id/participacao", authenticate, postParticipacao);

router.get("/studio/sorteios", authenticate, requireAdmin, listSorteiosStudio);
router.get("/studio/sorteios/:id", authenticate, requireAdmin, getSorteioStudio);
router.post("/sorteios", authenticate, requireAdmin, createSorteio);
router.patch("/sorteios/:id", authenticate, requireAdmin, updateSorteio);
router.delete("/sorteios/:id", authenticate, requireAdmin, deleteSorteio);
router.post("/sorteios/:id/sortear", authenticate, requireAdmin, postSortear);

export default router;
