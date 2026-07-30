import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { analiseCurriculoLimiter } from "../middlewares/rateLimit.ts";
import {
    createAnalise,
    getAnalise,
    getAtsStatus,
    listAnalises,
} from "../controllers/AtsController.ts";

const router = Router();

router.get("/curriculo/status", autenticar, getAtsStatus);
router.get("/curriculo/analises", autenticar, listAnalises);
router.get("/curriculo/analises/:id", autenticar, getAnalise);
router.post("/curriculo/analises", autenticar, analiseCurriculoLimiter, createAnalise);

export default router;
