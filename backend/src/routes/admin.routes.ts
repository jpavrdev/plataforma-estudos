import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import { getOverview, getCrmUsers } from "../controllers/AdminController.ts";

const router = Router();

// Internal dashboard/CRM: aggregated reads, admin only.
router.get("/admin/overview", authenticate, requireAdmin, getOverview);
router.get("/admin/users", authenticate, requireAdmin, getCrmUsers);

export default router;
