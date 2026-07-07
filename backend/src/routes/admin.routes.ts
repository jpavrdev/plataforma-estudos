import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import { getVisaoGeral, getUsuariosCrm } from "../controllers/AdminController.ts";

const router = Router();

// Painel/CRM interno: leitura agregada, só admin.
router.get("/admin/overview", autenticar, exigirAdmin, getVisaoGeral);
router.get("/admin/users", autenticar, exigirAdmin, getUsuariosCrm);

export default router;
