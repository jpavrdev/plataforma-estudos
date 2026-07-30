import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { env } from "../config/env.ts";
import {
    criarCobranca,
    criarAssinaturaRecorrente,
    statusApoio,
    processarWebhook,
    definirAccent,
    cancelarApoio,
    definirVeuFundo,
    assinaturasAdmin,
} from "../services/apoiador.service.ts";

const cobrancaSchema = z.object({ plan: z.enum(["mensal", "trimestral", "anual"]) });
const accentSchema = z.object({ accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable() });
const veuSchema = z.object({ dim: z.number().int().min(0).max(100) });

export const createCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plan } = cobrancaSchema.parse(req.body);
        res.json(await criarCobranca(req.userId!, plan));
    } catch (err) {
        next(err);
    }
};

export const createRecurring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await criarAssinaturaRecorrente(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getSupportStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await statusApoio(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const setAccent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accent } = accentSchema.parse(req.body);
        res.json(await definirAccent(req.userId!, accent));
    } catch (err) {
        next(err);
    }
};

export const gatewayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const segredo = String(req.query.webhookSecret ?? "");
        const esperado = env.ABACATEPAY_WEBHOOK_SECRET;
        const bate =
            Boolean(esperado) &&
            crypto.timingSafeEqual(
                crypto.createHash("sha256").update(segredo).digest(),
                crypto.createHash("sha256").update(esperado!).digest(),
            );
        if (!bate) {
            return res.status(401).json({ erro: "Segredo inválido" });
        }
        res.json(await processarWebhook((req.body ?? {}) as Record<string, unknown>));
    } catch (err) {
        next(err);
    }
};

export const cancelSupport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await cancelarApoio(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const setBackgroundDim = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dim } = veuSchema.parse(req.body);
        res.json(await definirVeuFundo(req.userId!, dim));
    } catch (err) {
        next(err);
    }
};

export const listSubscriptionsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await assinaturasAdmin());
    } catch (err) {
        next(err);
    }
};
