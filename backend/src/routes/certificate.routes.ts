import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import {
    getCertificateStatus,
    issueCertificate,
    validateCertificate,
    downloadCertificate,
} from "../controllers/CertificateController.ts";

const router = Router();

router.get("/trails/:id/certificado", authenticate, getCertificateStatus);
router.post("/trails/:id/certificado", authenticate, issueCertificate);

// Public validation: it is the QR code link that a college checks, with no login.
router.get("/certificados/:code", validateCertificate);
// The PDF has the full CPF, so only its owner can download it.
router.get("/certificados/:code/pdf", authenticate, downloadCertificate);

export default router;
