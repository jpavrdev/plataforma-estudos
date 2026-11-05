import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { resumeAnalysisLimiter } from "../middlewares/rateLimit.ts";
import {
    createAnalise,
    getAnalise,
    getAtsStatus,
    listAnalises,
} from "../controllers/AtsController.ts";

const router = Router();

router.get("/curriculo/status", authenticate, getAtsStatus);
router.get("/curriculo/analises", authenticate, listAnalises);
router.get("/curriculo/analises/:id", authenticate, getAnalise);
router.post("/curriculo/analises", authenticate, resumeAnalysisLimiter, createAnalise);

export default router;
