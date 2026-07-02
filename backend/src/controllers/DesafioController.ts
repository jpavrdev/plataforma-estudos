import type { Request, Response, NextFunction } from "express";
import { executarDesafioSchema, criarDesafioSchema } from "../schemas/desafio.schema.ts";
import {
    desafioDoDia,
    listarDesafios,
    detalheDesafio,
    rodarExemplos,
    submeterDesafio,
    listarDesafiosAdmin,
    detalheDesafioAdmin,
    criarDesafio,
    atualizarDesafio,
    excluirDesafio,
} from "../services/desafio.service.ts";

export const getDesafioDoDia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await desafioDoDia(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getDesafios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarDesafios(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDesafio(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const runExemplos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = executarDesafioSchema.parse(req.body);
        res.json(await rodarExemplos(req.userId!, String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const submitDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = executarDesafioSchema.parse(req.body);
        res.json(await submeterDesafio(req.userId!, String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

// ---- admin ----

export const adminListDesafios = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarDesafiosAdmin());
    } catch (err) {
        next(err);
    }
};

export const adminGetDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDesafioAdmin(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await criarDesafio(criarDesafioSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const updateDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atualizarDesafio(String(req.params.id), criarDesafioSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const deleteDesafio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await excluirDesafio(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};
