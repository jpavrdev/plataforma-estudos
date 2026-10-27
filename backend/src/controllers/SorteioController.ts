import type { Request, Response, NextFunction } from "express";
import {
    idSorteioSchema,
    criarSorteioSchema,
    atualizarSorteioSchema,
    participacaoSchema,
} from "../schemas/sorteio.schema.ts";
import {
    sorteioAtivo,
    salvarParticipacao,
    sairDoSorteio,
    listarSorteios,
    detalharSorteio,
    criarSorteio,
    atualizarSorteio,
    excluirSorteio,
    realizarSorteio,
} from "../services/sorteio.service.ts";

export const getSorteioAtivo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await sorteioAtivo(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const putParticipacao = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = idSorteioSchema.parse(req.params.id);
        const contatos = participacaoSchema.parse(req.body);
        res.json(await salvarParticipacao(id, req.userId!, contatos));
    } catch (err) {
        next(err);
    }
};

export const deleteParticipacao = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = idSorteioSchema.parse(req.params.id);
        res.json(await sairDoSorteio(id, req.userId!));
    } catch (err) {
        next(err);
    }
};

export const listSorteiosStudio = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarSorteios());
    } catch (err) {
        next(err);
    }
};

export const getSorteioStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalharSorteio(idSorteioSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createSorteio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = criarSorteioSchema.parse(req.body);
        res.status(201).json(await criarSorteio(dados));
    } catch (err) {
        next(err);
    }
};

export const updateSorteio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = idSorteioSchema.parse(req.params.id);
        const dados = atualizarSorteioSchema.parse(req.body);
        res.json(await atualizarSorteio(id, dados));
    } catch (err) {
        next(err);
    }
};

export const deleteSorteio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await excluirSorteio(idSorteioSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const postSortear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await realizarSorteio(idSorteioSchema.parse(req.params.id)));
    } catch (err) {
        next(err);
    }
};
