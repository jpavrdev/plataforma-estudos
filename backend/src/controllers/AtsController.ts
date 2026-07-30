import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { analisarCurriculo, analiseAts, historicoAts, statusAts } from "../services/ats.service.ts";

const analiseSchema = z.object({
    vaga: z.string(),
    tituloVaga: z.string().max(160).nullish(),
    pdf: z.string(),
});

export const getAtsStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await statusAts(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const createAnalise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vaga, tituloVaga, pdf } = analiseSchema.parse(req.body);
        res.status(201).json(
            await analisarCurriculo(req.userId!, { vaga, tituloVaga, pdfBase64: pdf }),
        );
    } catch (err) {
        next(err);
    }
};

export const listAnalises = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await historicoAts(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getAnalise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await analiseAts(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
