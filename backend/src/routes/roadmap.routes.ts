import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
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
router.get("/roadmaps", autenticar, listRoadmaps);
router.get("/roadmaps/proxima-trilha/:trailId", autenticar, getNextTrail);

// Management from the studio (admin). It comes before "/roadmaps/:slug" and uses the
// "/studio" prefix so it does not collide with the student's detail route.
router.get("/studio/roadmaps", autenticar, exigirAdmin, listRoadmapsStudio);
router.get("/studio/roadmaps/:id", autenticar, exigirAdmin, getRoadmapStudio);
router.post("/roadmaps", autenticar, exigirAdmin, createRoadmap);
router.patch("/roadmaps/:id", autenticar, exigirAdmin, updateRoadmap);
router.delete("/roadmaps/:id", autenticar, exigirAdmin, deleteRoadmap);
router.post("/roadmaps/:id/stages", autenticar, exigirAdmin, createStage);
router.patch("/roadmap-stages/:id", autenticar, exigirAdmin, updateStage);
router.delete("/roadmap-stages/:id", autenticar, exigirAdmin, deleteStage);
router.post("/roadmap-stages/:id/concluir", autenticar, completeStage);
router.post("/roadmap-stages/:id/refs", autenticar, exigirAdmin, createStageRef);
router.delete("/roadmap-stage-refs/:id", autenticar, exigirAdmin, deleteStageRef);

router.post("/roadmaps/:slug/seguir", autenticar, followRoadmap);
router.post("/roadmaps/:slug/entrei", autenticar, recordRoadmapEntry);

// Student detail by slug (last, so it does not capture the routes above).
router.get("/roadmaps/:slug", autenticar, getRoadmap);

export default router;
