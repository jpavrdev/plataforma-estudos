import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import {
    getCertificateStatus,
    issueCertificate,
    validateCertificate,
    downloadCertificate,
} from "../controllers/CertificateController.ts";

const router = Router();

router.get("/trails/:id/certificado", autenticar, getCertificateStatus);
router.post("/trails/:id/certificado", autenticar, issueCertificate);

// Validação pública: é o link do QR Code que a faculdade confere, sem login.
router.get("/certificados/:code", validateCertificate);
router.get("/certificados/:code/pdf", downloadCertificate);

export default router;
