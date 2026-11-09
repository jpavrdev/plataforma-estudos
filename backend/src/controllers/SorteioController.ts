import type { Request, Response, NextFunction } from "express";
import {
    raffleIdSchema,
    createRaffleSchema,
    updateRaffleSchema,
    raffleEntrySchema,
} from "../schemas/sorteio.schema.ts";
import {
    activeRaffle,
    enterRaffle,
    listRaffles,
    raffleDetail,
    insertRaffle,
    editRaffle,
    removeRaffle,
    drawRaffle,
} from "../services/sorteio.service.ts";

export const getActiveRaffle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await activeRaffle(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const postEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = raffleIdSchema.parse(req.params.id);
        const contatos = raffleEntrySchema.parse(req.body);
        res.status(201).json(await enterRaffle(id, req.userId!, contatos));
    } catch (err) {
        next(err);
    }
};

export const listStudioRaffles = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listRaffles());
    } catch (err) {
        next(err);
    }
};

export const getStudioRaffle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await raffleDetail(raffleIdSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createRaffle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createRaffleSchema.parse(req.body);
        res.status(201).json(await insertRaffle(data));
    } catch (err) {
        next(err);
    }
};

export const updateRaffle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = raffleIdSchema.parse(req.params.id);
        const data = updateRaffleSchema.parse(req.body);
        res.json(await editRaffle(id, data));
    } catch (err) {
        next(err);
    }
};

export const deleteRaffle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await removeRaffle(raffleIdSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const postDraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await drawRaffle(raffleIdSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};
