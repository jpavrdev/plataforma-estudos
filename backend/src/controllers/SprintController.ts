import type { Request, Response, NextFunction } from "express";
import {
    currentSprint,
    taskDetail,
    saveCode,
    claimTask,
    returnTask,
    completeTask,
} from "../services/sprint.service.ts";
import { AppError } from "../errors/AppError.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function taskId(req: Request): string {
    const id = String(req.params.taskId);
    if (!UUID.test(id)) throw new AppError(404, "sprint.taskNotFound");
    return id;
}

export const getCurrentSprint = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await currentSprint(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getSprintTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await taskDetail(req.userId!, taskId(req)));
    } catch (err) {
        next(err);
    }
};

export const postSprintCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = typeof req.body?.code === "string" ? req.body.code : null;
        if (code === null || code.length > 20_000) throw new AppError(400, "sprint.invalidCode");
        res.json(await saveCode(req.userId!, taskId(req), code));
    } catch (err) {
        next(err);
    }
};

export const postClaimTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await claimTask(req.userId!, taskId(req)));
    } catch (err) {
        next(err);
    }
};

export const postReturnTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await returnTask(req.userId!, taskId(req)));
    } catch (err) {
        next(err);
    }
};

export const postCompleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await completeTask(req.userId!, taskId(req)));
    } catch (err) {
        next(err);
    }
};
