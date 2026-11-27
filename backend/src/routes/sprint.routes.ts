import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { requireFeature } from "../middlewares/featureFlag.ts";
import {
    getCurrentSprint,
    getSprintTask,
    postSprintCode,
    postClaimTask,
    postReturnTask,
    postCompleteTask,
} from "../controllers/SprintController.ts";

// The sprint game lives behind the "projetos-guiados" flag: outside the beta
// the routes answer 404, as if the feature did not exist yet.
const gate = [authenticate, requireFeature("projetos-guiados")] as const;

const router = Router();

router.get("/sprints/current", ...gate, getCurrentSprint);
router.get("/sprints/tasks/:taskId", ...gate, getSprintTask);
router.post("/sprints/tasks/:taskId/code", ...gate, postSprintCode);
router.post("/sprints/tasks/:taskId/claim", ...gate, postClaimTask);
router.post("/sprints/tasks/:taskId/return", ...gate, postReturnTask);
router.post("/sprints/tasks/:taskId/complete", ...gate, postCompleteTask);

export default router;
