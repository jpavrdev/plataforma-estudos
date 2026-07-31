import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import { desafioRunLimiter } from "../middlewares/rateLimit.ts";
import {
    getDesafioDoDia,
    getDesafios,
    getDesafio,
    runExemplos,
    submitDesafio,
    getSolucoes,
    getComentarios,
    postComentario,
    deleteComentario,
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
router.post("/desafios/:id/run", desafioRunLimiter, autenticar, runExemplos);
router.post("/desafios/:id/submit", desafioRunLimiter, autenticar, submitDesafio);
router.get("/desafios/:id/solucoes", autenticar, getSolucoes);
router.get("/desafios/:id/comentarios", autenticar, getComentarios);
router.post("/desafios/:id/comentarios", autenticar, postComentario);
router.delete("/desafios/comentarios/:commentId", autenticar, deleteComentario);

// Admin: CRUD de desafios e casos de teste.
router.get("/admin/desafios", autenticar, exigirAdmin, adminListDesafios);
router.post("/desafios", autenticar, exigirAdmin, createDesafio);
router.get("/admin/desafios/:id", autenticar, exigirAdmin, adminGetDesafio);
router.patch("/desafios/:id", autenticar, exigirAdmin, updateDesafio);
router.delete("/desafios/:id", autenticar, exigirAdmin, deleteDesafio);

export default router;
