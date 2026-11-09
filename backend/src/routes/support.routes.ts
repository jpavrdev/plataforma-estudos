import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    createCharge,
    createRecurring,
    getSupportStatus,
    setAccent,
    gatewayWebhook,
    cancelSupport,
    setBackgroundDim,
    listSubscriptionsAdmin,
} from "../controllers/SupportController.ts";

const router = Router();

router.get("/apoie/status", authenticate, getSupportStatus);
router.post("/apoie/cobranca", authenticate, createCharge);
router.post("/apoie/assinatura", authenticate, createRecurring);
router.delete("/apoie/assinatura", authenticate, cancelSupport);
router.patch("/me/accent", authenticate, setAccent);
router.patch("/me/fundo", authenticate, setBackgroundDim);

router.get("/studio/assinaturas", authenticate, requireAdmin, listSubscriptionsAdmin);

// Called by AbacatePay; validates the secret agreed when the webhook was created.
router.post("/webhooks/abacatepay", gatewayWebhook);

export default router;
