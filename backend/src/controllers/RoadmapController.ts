import type { Request, Response, NextFunction } from "express";
import { listarRoadmaps, obterRoadmap } from "../services/roadmap.service.ts";

export const listRoadmaps = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarRoadmaps(req.userId));
    } catch (err) {
        next(err);
    }
};

export const getRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = typeof req.params.slug === "string" ? req.params.slug : "";
        const roadmap = await obterRoadmap(slug, req.userId);
        if (!roadmap) return res.status(404).json({ erro: "Roadmap não encontrado" });
        res.json(roadmap);
    } catch (err) {
        next(err);
    }
};
