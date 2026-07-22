import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    getComunicadoAtivo,
    respondComunicado,
    dismissComunicado,
    createComunicado,
    updateComunicado,
    deleteComunicado,
    listComunicadosStudio,
    getComunicadoStudio,
} from "../controllers/ComunicadoController.ts";

const router = Router();

router.get("/comunicados/ativo", autenticar, getComunicadoAtivo);
router.post("/comunicados/:id/responder", autenticar, respondComunicado);
router.post("/comunicados/:id/dispensar", autenticar, dismissComunicado);

router.get("/studio/comunicados", autenticar, exigirAdmin, listComunicadosStudio);
router.get("/studio/comunicados/:id", autenticar, exigirAdmin, getComunicadoStudio);
router.post("/comunicados", autenticar, exigirAdmin, createComunicado);
router.patch("/comunicados/:id", autenticar, exigirAdmin, updateComunicado);
router.delete("/comunicados/:id", autenticar, exigirAdmin, deleteComunicado);

export default router;
