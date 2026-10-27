import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
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

router.get("/sorteios/ativo", autenticar, getSorteioAtivo);
router.post("/sorteios/:id/participacao", autenticar, postParticipacao);

router.get("/studio/sorteios", autenticar, exigirAdmin, listSorteiosStudio);
router.get("/studio/sorteios/:id", autenticar, exigirAdmin, getSorteioStudio);
router.post("/sorteios", autenticar, exigirAdmin, createSorteio);
router.patch("/sorteios/:id", autenticar, exigirAdmin, updateSorteio);
router.delete("/sorteios/:id", autenticar, exigirAdmin, deleteSorteio);
router.post("/sorteios/:id/sortear", autenticar, exigirAdmin, postSortear);

export default router;
