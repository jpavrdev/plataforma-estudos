import type { Request, Response, NextFunction } from "express";
import {
    decks,
    countTrailReview,
    statistics,
    dailyQueue,
    sessionHistory,
    weakPoints,
    reportCard,
    answerCard,
    summary,
    trailReview,
    type Answer,
} from "../services/flashcard.service.ts";
import { AppError } from "../errors/AppError.ts";

const ANSWERS: Answer[] = ["errei", "dificil", "intermediaria", "facil"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Past two minutes the card was left open, not thought about.
const MAX_ANSWER_MS = 120_000;

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await summary(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Math.min(Number(req.query.limite) || 500, 500);
        // trilhas=id1,id2 and glossario=1 pick the deck. Without them, everything
        // comes. (Query parameter names are part of the API contract.)
        const deckList = String(req.query.trilhas ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => UUID.test(t));
        const includeGlossary = req.query.glossario === "1";
        res.json(
            await dailyQueue(req.userId!, limit, { trilhas: deckList, glossario: includeGlossary }),
        );
    } catch (err) {
        next(err);
    }
};

export const getDecks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await decks(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await statistics(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await sessionHistory(req.userId!, 20));
    } catch (err) {
        next(err);
    }
};

export const getWeakPoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await weakPoints(req.userId!, 5));
    } catch (err) {
        next(err);
    }
};

export const getTrailReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await trailReview(String(req.params.trailId)));
    } catch (err) {
        next(err);
    }
};

export const getTrailReviewCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await countTrailReview(String(req.params.trailId)));
    } catch (err) {
        next(err);
    }
};

export const postReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { origem: source, comentario: comment } = req.body ?? {};
        if (source !== "flashcard" && source !== "glossario" && source !== "entrevista")
            throw new AppError(400, "flashcard.invalidSource");
        const text =
            typeof comment === "string" && comment.trim()
                ? comment.trim().slice(0, 300)
                : undefined;
        res.json(await reportCard(req.userId!, source, String(req.params.id), text));
    } catch (err) {
        next(err);
    }
};

export const postAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { origem: source, resposta: answer, tempoMs } = req.body ?? {};
        if (source !== "flashcard" && source !== "glossario" && source !== "entrevista")
            throw new AppError(400, "flashcard.invalidSource");
        if (!ANSWERS.includes(answer)) throw new AppError(400, "flashcard.invalidAnswer");
        const elapsedMs = Number.isFinite(Number(tempoMs))
            ? Math.min(Math.max(0, Math.round(Number(tempoMs))), MAX_ANSWER_MS)
            : undefined;
        res.json(await answerCard(req.userId!, source, String(req.params.id), answer, elapsedMs));
    } catch (err) {
        next(err);
    }
};
