import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { listRoadmaps, getRoadmap } from "../controllers/RoadmapController.ts";

const router = Router();

router.get("/roadmaps", autenticar, listRoadmaps);
router.get("/roadmaps/:slug", autenticar, getRoadmap);

export default router;
