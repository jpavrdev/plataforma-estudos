import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    getActiveAnnouncement,
    answerAnnouncement,
    dismissAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    listStudioAnnouncements,
    getStudioAnnouncement,
} from "../controllers/AnnouncementController.ts";

const router = Router();

router.get("/comunicados/ativo", autenticar, getActiveAnnouncement);
router.post("/comunicados/:id/responder", autenticar, answerAnnouncement);
router.post("/comunicados/:id/dispensar", autenticar, dismissAnnouncement);

router.get("/studio/comunicados", autenticar, exigirAdmin, listStudioAnnouncements);
router.get("/studio/comunicados/:id", autenticar, exigirAdmin, getStudioAnnouncement);
router.post("/comunicados", autenticar, exigirAdmin, createAnnouncement);
router.patch("/comunicados/:id", autenticar, exigirAdmin, updateAnnouncement);
router.delete("/comunicados/:id", autenticar, exigirAdmin, deleteAnnouncement);

export default router;
