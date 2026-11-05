import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import { getVisaoGeral, getUsuariosCrm } from "../controllers/AdminController.ts";

const router = Router();

// Painel/CRM interno: leitura agregada, só admin.
router.get("/admin/overview", authenticate, requireAdmin, getVisaoGeral);
router.get("/admin/users", authenticate, requireAdmin, getUsuariosCrm);

export default router;
