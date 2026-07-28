import type { Request, Response, NextFunction } from "express";
import { emitirTicket } from "../services/lab.service.ts";

export const criarTicketLab = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(emitirTicket(req.userId!));
    } catch (err) {
        next(err);
    }
};
