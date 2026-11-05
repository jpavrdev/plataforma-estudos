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

// Public validation: it is the QR code link that a college checks, with no login.
router.get("/certificados/:code", validateCertificate);
// The PDF has the full CPF, so only its owner can download it.
router.get("/certificados/:code/pdf", autenticar, downloadCertificate);

export default router;
