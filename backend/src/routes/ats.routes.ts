import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { resumeAnalysisLimiter } from "../middlewares/rateLimit.ts";
import {
    createAnalysis,
    getAnalysis,
    getAtsStatus,
    listAnalyses,
} from "../controllers/AtsController.ts";

const router = Router();

router.get("/curriculo/status", authenticate, getAtsStatus);
router.get("/curriculo/analises", authenticate, listAnalyses);
router.get("/curriculo/analises/:id", authenticate, getAnalysis);
router.post("/curriculo/analises", authenticate, resumeAnalysisLimiter, createAnalysis);

export default router;
