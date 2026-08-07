import type { Request, Response, NextFunction } from "express";
import {
    baralhos,
    contarRevisaoDaTrilha,
    estatisticas,
    filaDoDia,
    historicoSessoes,
    pontosFracos,
    responder,
    resumo,
    revisaoDaTrilha,
    type Resposta,
} from "../services/flashcard.service.ts";
import { AppError } from "../errors/AppError.ts";

const RESPOSTAS: Resposta[] = ["errei", "dificil", "intermediaria", "facil"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Acima de dois minutos a carta ficou aberta, não foi pensada.
const TEMPO_MAXIMO_MS = 120_000;

export const getResumo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await resumo(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getFila = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limite = Math.min(Number(req.query.limite) || 500, 500);
        // trilhas=id1,id2 e glossario=1 escolhem o baralho. Sem nada, vem tudo.
        const trilhas = String(req.query.trilhas ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => UUID.test(t));
        const glossario = req.query.glossario === "1";
        res.json(await filaDoDia(req.userId!, limite, { trilhas, glossario }));
    } catch (err) {
        next(err);
    }
};

export const getBaralhos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await baralhos(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getEstatisticas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estatisticas(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getHistorico = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await historicoSessoes(req.userId!, 20));
    } catch (err) {
        next(err);
    }
};

export const getPontosFracos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await pontosFracos(req.userId!, 5));
    } catch (err) {
        next(err);
    }
};

export const getRevisaoTrilha = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await revisaoDaTrilha(req.userId!, String(req.params.trailId)));
    } catch (err) {
        next(err);
    }
};

export const getContagemTrilha = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await contarRevisaoDaTrilha(req.userId!, String(req.params.trailId)));
    } catch (err) {
        next(err);
    }
};

export const postResposta = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { origem, resposta, tempoMs } = req.body ?? {};
        if (origem !== "flashcard" && origem !== "glossario")
            throw new AppError(400, "Origem inválida.");
        if (!RESPOSTAS.includes(resposta)) throw new AppError(400, "Resposta inválida.");
        const tempo = Number.isFinite(Number(tempoMs))
            ? Math.min(Math.max(0, Math.round(Number(tempoMs))), TEMPO_MAXIMO_MS)
            : undefined;
        res.json(await responder(req.userId!, origem, String(req.params.id), resposta, tempo));
    } catch (err) {
        next(err);
    }
};
