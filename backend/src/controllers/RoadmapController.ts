import type { Request, Response, NextFunction } from "express";
import {
    concluirEstagio,
    listarRoadmaps,
    obterRoadmap,
    listarRoadmapsAdmin,
    obterRoadmapStudio,
    criarRoadmap,
    atualizarRoadmap,
    excluirRoadmap,
    criarEstagio,
    atualizarEstagio,
    excluirEstagio,
    adicionarRef,
    removerRef,
} from "../services/roadmap.service.ts";
import {
    createRoadmapSchema,
    updateRoadmapSchema,
    createStageSchema,
    updateStageSchema,
    createRefSchema,
} from "../schemas/roadmap.schema.ts";

// ===================== Leitura (aluno) =====================
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

// ===================== Admin: roadmaps =====================
export const listRoadmapsStudio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarRoadmapsAdmin());
    } catch (err) {
        next(err);
    }
};

export const getRoadmapStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await obterRoadmapStudio(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createRoadmapSchema.parse(req.body);
        res.status(201).json(await criarRoadmap(dados));
    } catch (err) {
        next(err);
    }
};

export const updateRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = updateRoadmapSchema.parse(req.body);
        res.json(await atualizarRoadmap(String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const deleteRoadmap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirRoadmap(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== Admin: estágios =====================
export const createStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createStageSchema.parse(req.body);
        res.status(201).json(await criarEstagio(String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const updateStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = updateStageSchema.parse(req.body);
        res.json(await atualizarEstagio(String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const deleteStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirEstagio(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== Admin: referências de conteúdo =====================
export const createStageRef = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createRefSchema.parse(req.body);
        res.status(201).json(await adicionarRef(String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const deleteStageRef = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removerRef(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const completeStage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await concluirEstagio(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};
