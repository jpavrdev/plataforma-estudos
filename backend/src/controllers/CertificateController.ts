import type { Request, Response, NextFunction } from "express";
import { emitirCertificadoSchema } from "../schemas/certificate.schema.ts";
import {
    statusCertificado,
    emitirCertificado,
    validarCertificado,
    pdfCertificado,
} from "../services/certificate.service.ts";

export const getCertificateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await statusCertificado(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

export const issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cpf } = emitirCertificadoSchema.parse(req.body);
        const cert = await emitirCertificado(String(req.params.id), req.userId!, cpf);
        res.json({ code: cert.code, issuedAt: cert.issuedAt });
    } catch (err) {
        next(err);
    }
};

export const validateCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await validarCertificado(String(req.params.code)));
    } catch (err) {
        next(err);
    }
};

export const downloadCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { doc, filename } = await pdfCertificado(String(req.params.code));
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        doc.pipe(res);
    } catch (err) {
        next(err);
    }
};
