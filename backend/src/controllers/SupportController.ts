import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { env } from "../config/env.ts";
import {
    insertCharge,
    insertRecurringSubscription,
    supportStatus,
    processWebhook,
    editAccent,
    cancelActiveSupport,
    editBackgroundDim,
    listAdminSubscriptions,
} from "../services/supporter.service.ts";

const chargeSchema = z.object({ plan: z.enum(["mensal", "trimestral", "anual"]) });
const accentSchema = z.object({
    accent: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .nullable(),
});
const dimSchema = z.object({ dim: z.number().int().min(0).max(100) });

export const createCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { plan } = chargeSchema.parse(req.body);
        res.json(await insertCharge(req.userId!, plan));
    } catch (err) {
        next(err);
    }
};

export const createRecurring = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await insertRecurringSubscription(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const getSupportStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await supportStatus(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const setAccent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accent } = accentSchema.parse(req.body);
        res.json(await editAccent(req.userId!, accent));
    } catch (err) {
        next(err);
    }
};

export const gatewayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = String(req.query.webhookSecret ?? "");
        const expected = env.ABACATEPAY_WEBHOOK_SECRET;
        const match =
            Boolean(expected) &&
            crypto.timingSafeEqual(
                crypto.createHash("sha256").update(secret).digest(),
                crypto.createHash("sha256").update(expected!).digest(),
            );
        if (!match) {
            return res.status(401).json({ erro: "support.invalidSecret" });
        }
        res.json(await processWebhook((req.body ?? {}) as Record<string, unknown>));
    } catch (err) {
        next(err);
    }
};

export const cancelSupport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await cancelActiveSupport(req.userId!));
    } catch (err) {
        next(err);
    }
};

export const setBackgroundDim = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dim } = dimSchema.parse(req.body);
        res.json(await editBackgroundDim(req.userId!, dim));
    } catch (err) {
        next(err);
    }
};

export const listSubscriptionsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listAdminSubscriptions());
    } catch (err) {
        next(err);
    }
};
