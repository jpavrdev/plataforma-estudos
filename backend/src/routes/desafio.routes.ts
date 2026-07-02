import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    getDesafioDoDia,
    getDesafios,
    getDesafio,
    runExemplos,
    submitDesafio,
    adminListDesafios,
    adminGetDesafio,
    createDesafio,
    updateDesafio,
    deleteDesafio,
} from "../controllers/DesafioController.ts";

const router = Router();

router.get("/desafios/hoje", autenticar, getDesafioDoDia);
router.get("/desafios", autenticar, getDesafios);
router.get("/desafios/:id", autenticar, getDesafio);
router.post("/desafios/:id/run", autenticar, runExemplos);
router.post("/desafios/:id/submit", autenticar, submitDesafio);

// Admin: CRUD de desafios e casos de teste.
router.get("/admin/desafios", autenticar, exigirAdmin, adminListDesafios);
router.post("/desafios", autenticar, exigirAdmin, createDesafio);
router.get("/admin/desafios/:id", autenticar, exigirAdmin, adminGetDesafio);
router.patch("/desafios/:id", autenticar, exigirAdmin, updateDesafio);
router.delete("/desafios/:id", autenticar, exigirAdmin, deleteDesafio);

export default router;
