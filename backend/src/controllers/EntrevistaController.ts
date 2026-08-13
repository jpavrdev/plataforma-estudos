import type { Request, Response, NextFunction } from "express";
import { fila, nivelValido, resumo, topicos } from "../services/entrevista.service.ts";
import { AppError } from "../errors/AppError.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Sessão de entrevista é ensaio, não maratona: acima disso ninguém termina.
const LIMITE_MAXIMO = 60;

function nivelDaQuery(req: Request) {
    const nivel = nivelValido(req.query.nivel ? String(req.query.nivel) : undefined);
    if (!nivel) throw new AppError(400, "Nível inválido.");
    return nivel;
}

export const getTopicos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await topicos(req.userId!, nivelDaQuery(req)));
    } catch (err) {
        next(err);
    }
};

export const getResumo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await resumo(req.userId!, nivelDaQuery(req)));
    } catch (err) {
        next(err);
    }
};

export const getFila = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nivel = nivelDaQuery(req);
        const escolhidos = String(req.query.topicos ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => UUID.test(t));
        const pedido = Number(req.query.limite);
        const limite = Number.isFinite(pedido) && pedido > 0 ? Math.min(pedido, LIMITE_MAXIMO) : 20;
        res.json(await fila(req.userId!, { nivel, topicos: escolhidos, limite }));
    } catch (err) {
        next(err);
    }
};
