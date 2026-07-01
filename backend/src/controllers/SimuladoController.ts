import type { Request, Response, NextFunction } from "express";
import { salvarRespostaSchema } from "../schemas/simulado.schema.ts";
import {
    listarSimulados,
    iniciarTentativa,
    estadoDaTentativa,
    salvarResposta,
    enviarTentativa,
    historicoDoUsuario,
} from "../services/simulado.service.ts";

export const listSimulados = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarSimulados());
    } catch (err) {
        next(err);
    }
};

export const startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await iniciarTentativa(req.userId!, String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const getAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estadoDaTentativa(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const saveAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { optionIds } = salvarRespostaSchema.parse(req.body);
        res.json(
            await salvarResposta(
                req.userId!,
                String(req.params.id),
                String(req.params.questionId),
                optionIds,
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await enviarTentativa(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getMyAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await historicoDoUsuario(req.userId!));
    } catch (err) {
        next(err);
    }
};
