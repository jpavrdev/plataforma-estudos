import { createHash, randomBytes } from "node:crypto";
import { db } from "../../db.ts";
import { env } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { tokens } from "../../schema.ts";

export const authService = {
    async gerarEGravarTokens(userId: string, tx: any = db) {
        const accessToken = jwt.sign({userId}, env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
            type: "refresh",
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        return { accessToken, refreshToken };
    }
};