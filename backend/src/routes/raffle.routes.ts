import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    getActiveRaffle,
    postEntry,
    listStudioRaffles,
    getStudioRaffle,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    postDraw,
} from "../controllers/RaffleController.ts";

const router = Router();

router.get("/sorteios/ativo", authenticate, getActiveRaffle);
router.post("/sorteios/:id/participacao", authenticate, postEntry);

router.get("/studio/sorteios", authenticate, requireAdmin, listStudioRaffles);
router.get("/studio/sorteios/:id", authenticate, requireAdmin, getStudioRaffle);
router.post("/sorteios", authenticate, requireAdmin, createRaffle);
router.patch("/sorteios/:id", authenticate, requireAdmin, updateRaffle);
router.delete("/sorteios/:id", authenticate, requireAdmin, deleteRaffle);
router.post("/sorteios/:id/sortear", authenticate, requireAdmin, postDraw);

export default router;
