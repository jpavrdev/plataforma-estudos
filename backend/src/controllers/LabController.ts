import type { Request, Response, NextFunction } from "express";
import { issueTicket } from "../services/lab.service.ts";

export const createLabTicket = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(issueTicket(req.userId!));
    } catch (err) {
        next(err);
    }
};
