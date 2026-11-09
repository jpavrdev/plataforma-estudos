import { Router } from "express";
import { env } from "../config/env.ts";
import { requireMonitorToken } from "../middlewares/monitor.ts";
import { getDependencies, getHealth } from "../controllers/HealthController.ts";

const router = Router();

router.get("/health", getHealth);

// Without a token the route is not even registered: the 404 is the same as any
// nonexistent route's.
if (env.MONITOR_TOKEN) {
    router.get("/health/dependencias", requireMonitorToken(env.MONITOR_TOKEN), getDependencies);
}

export default router;
