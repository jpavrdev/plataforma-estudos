import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
import {
    createCharge,
    createRecurring,
    getSupportStatus,
    setAccent,
    gatewayWebhook,
    cancelSupport,
    setBackgroundDim,
    listSubscriptionsAdmin,
} from "../controllers/ApoioController.ts";

const router = Router();

router.get("/apoie/status", autenticar, getSupportStatus);
router.post("/apoie/cobranca", autenticar, createCharge);
router.post("/apoie/assinatura", autenticar, createRecurring);
router.delete("/apoie/assinatura", autenticar, cancelSupport);
router.patch("/me/accent", autenticar, setAccent);
router.patch("/me/fundo", autenticar, setBackgroundDim);

router.get("/studio/assinaturas", autenticar, exigirAdmin, listSubscriptionsAdmin);

// Chamado pelo AbacatePay; valida o segredo combinado na criação do webhook.
router.post("/webhooks/abacatepay", gatewayWebhook);

export default router;
