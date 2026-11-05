import { Router } from "express";
import { env } from "../config/env.ts";
import { requireMonitorToken } from "../middlewares/monitor.ts";
import { getDependencias, getHealth } from "../controllers/HealthController.ts";

const router = Router();

router.get("/health", getHealth);

// Sem token a rota nem é registrada: o 404 é o mesmo de qualquer rota inexistente.
if (env.MONITOR_TOKEN) {
    router.get("/health/dependencias", requireMonitorToken(env.MONITOR_TOKEN), getDependencias);
}

export default router;
