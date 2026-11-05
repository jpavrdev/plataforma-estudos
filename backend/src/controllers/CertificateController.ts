import type { Request, Response, NextFunction } from "express";
import { issueCertificateSchema } from "../schemas/certificate.schema.ts";
import {
    findCertificateStatus,
    createCertificate,
    checkCertificate,
    buildCertificatePdf,
} from "../services/certificate.service.ts";

export const getCertificateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await findCertificateStatus(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

export const issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cpf, name } = issueCertificateSchema.parse(req.body);
        const cert = await createCertificate(String(req.params.id), req.userId!, cpf, name);
        res.json({ code: cert.code, issuedAt: cert.issuedAt });
    } catch (err) {
        next(err);
    }
};

export const validateCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await checkCertificate(String(req.params.code)));
    } catch (err) {
        next(err);
    }
};

export const downloadCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { doc, filename } = await buildCertificatePdf(String(req.params.code), req.userId!);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        doc.pipe(res);
    } catch (err) {
        next(err);
    }
};
