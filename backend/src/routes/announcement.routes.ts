import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
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

router.get("/comunicados/ativo", authenticate, getActiveAnnouncement);
router.post("/comunicados/:id/responder", authenticate, answerAnnouncement);
router.post("/comunicados/:id/dispensar", authenticate, dismissAnnouncement);

router.get("/studio/comunicados", authenticate, requireAdmin, listStudioAnnouncements);
router.get("/studio/comunicados/:id", authenticate, requireAdmin, getStudioAnnouncement);
router.post("/comunicados", authenticate, requireAdmin, createAnnouncement);
router.patch("/comunicados/:id", authenticate, requireAdmin, updateAnnouncement);
router.delete("/comunicados/:id", authenticate, requireAdmin, deleteAnnouncement);

export default router;
