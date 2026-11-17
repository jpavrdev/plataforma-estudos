import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { analyzeResume, atsAnalysis, atsHistory, atsStatus } from "../services/ats.service.ts";

const analysisSchema = z.object({
    vaga: z.string(),
    tituloVaga: z.string().max(160).nullish(),
    pdf: z.string(),
});

export const getAtsStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atsStatus(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const createAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vaga, tituloVaga, pdf } = analysisSchema.parse(req.body);
        res.status(201).json(
            await analyzeResume(req.userId!, { vaga, tituloVaga, pdfBase64: pdf }),
        );
    } catch (err) {
        next(err);
    }
};

export const listAnalyses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atsHistory(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atsAnalysis(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
