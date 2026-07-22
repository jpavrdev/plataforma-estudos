import type { Request, Response, NextFunction } from "express";
import {
    createComunicadoSchema,
    updateComunicadoSchema,
    responderComunicadoSchema,
} from "../schemas/comunicado.schema.ts";
import {
    comunicadoAtivo,
    responderComunicado,
    dispensarComunicado,
    criarComunicado,
    atualizarComunicado,
    excluirComunicado,
    listarComunicadosAdmin,
    resultadosComunicado,
} from "../services/comunicado.service.ts";

export const getComunicadoAtivo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await comunicadoAtivo(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const respondComunicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = responderComunicadoSchema.parse(req.body);
        res.json(await responderComunicado(String(req.params.id), req.userId!, dados));
    } catch (err) {
        next(err);
    }
};

export const dismissComunicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await dispensarComunicado(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

export const createComunicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createComunicadoSchema.parse(req.body);
        res.status(201).json(await criarComunicado(dados));
    } catch (err) {
        next(err);
    }
};

export const updateComunicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = updateComunicadoSchema.parse(req.body);
        res.json(await atualizarComunicado(String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const deleteComunicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirComunicado(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const listComunicadosStudio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarComunicadosAdmin());
    } catch (err) {
        next(err);
    }
};

export const getComunicadoStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await resultadosComunicado(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
