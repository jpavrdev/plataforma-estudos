import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { labTicketLimiter } from "../middlewares/rateLimit.ts";
import { createLabTicket } from "../controllers/LabController.ts";

const router = Router();

// Single-use ticket to open the terminal WebSocket.
router.post("/labs/ticket", authenticate, labTicketLimiter, createLabTicket);

export default router;
