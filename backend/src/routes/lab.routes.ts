import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { labTicketLimiter } from "../middlewares/rateLimit.ts";
import { criarTicketLab } from "../controllers/LabController.ts";

const router = Router();

// Ticket de uso único para abrir o WebSocket do terminal.
router.post("/labs/ticket", autenticar, labTicketLimiter, criarTicketLab);

export default router;
