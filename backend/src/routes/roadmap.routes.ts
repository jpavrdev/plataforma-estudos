import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    listRoadmaps,
    getRoadmap,
    listRoadmapsStudio,
    getRoadmapStudio,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    createStage,
    updateStage,
    deleteStage,
    createStageRef,
    deleteStageRef,
    completeStage,
    getNextTrail,
    followRoadmap,
    recordRoadmapEntry,
} from "../controllers/RoadmapController.ts";

const router = Router();

// Reading (any logged-in user)
router.get("/roadmaps", authenticate, listRoadmaps);
router.get("/roadmaps/proxima-trilha/:trailId", authenticate, getNextTrail);

// Management from the studio (admin). It comes before "/roadmaps/:slug" and uses the
// "/studio" prefix so it does not collide with the student's detail route.
router.get("/studio/roadmaps", authenticate, requireAdmin, listRoadmapsStudio);
router.get("/studio/roadmaps/:id", authenticate, requireAdmin, getRoadmapStudio);
router.post("/roadmaps", authenticate, requireAdmin, createRoadmap);
router.patch("/roadmaps/:id", authenticate, requireAdmin, updateRoadmap);
router.delete("/roadmaps/:id", authenticate, requireAdmin, deleteRoadmap);
router.post("/roadmaps/:id/stages", authenticate, requireAdmin, createStage);
router.patch("/roadmap-stages/:id", authenticate, requireAdmin, updateStage);
router.delete("/roadmap-stages/:id", authenticate, requireAdmin, deleteStage);
router.post("/roadmap-stages/:id/concluir", authenticate, completeStage);
router.post("/roadmap-stages/:id/refs", authenticate, requireAdmin, createStageRef);
router.delete("/roadmap-stage-refs/:id", authenticate, requireAdmin, deleteStageRef);

router.post("/roadmaps/:slug/seguir", authenticate, followRoadmap);
router.post("/roadmaps/:slug/entrei", authenticate, recordRoadmapEntry);

// Student detail by slug (last, so it does not capture the routes above).
router.get("/roadmaps/:slug", authenticate, getRoadmap);

export default router;
