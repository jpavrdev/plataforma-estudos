import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "../../db.ts";
import { env } from "../config/env.ts";
import jwt from "jsonwebtoken";
import { tokens } from "../../schema.ts";
import { and, eq, isNull, lt, sql } from "drizzle-orm";

const VALIDADE_OTP_MS = 10 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;
// Por conta: um código novo por minuto, no máximo 10 por dia, e cada código morre
// no quinto erro. São no máximo 50 palpites por dia, venham de quantos IPs vierem.
const INTERVALO_ENTRE_OTPS_MS = 60 * 1000;
const MAX_OTPS_POR_DIA = 10;
export const MAX_TENTATIVAS_OTP = 5;

const hashDoOtp = (userId: string, otp: string) =>
    createHash("sha256").update(`${userId}:${otp}`).digest("hex");

export const authService = {
    async gerarEGravarTokens(userId: string, tx: Pick<typeof db, "insert"> = db) {
        const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(refreshToken).digest("hex"),
            type: "refresh",
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        return { accessToken, refreshToken };
    },
    async gerarTokenVerificacao(userId: string, tx: Pick<typeof db, "insert"> = db) {
        const verificationToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(verificationToken).digest("hex"),
            type: "email_verification",
            expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        return verificationToken;
    },
    async gerarTokenResetSenha(userId: string, tx: Pick<typeof db, "insert"> = db) {
        const resetToken = randomBytes(40).toString("hex");

        await tx.insert(tokens).values({
            userId,
            tokenHash: createHash("sha256").update(resetToken).digest("hex"),
            type: "password_reset",
            expiredAt: new Date(Date.now() + 60 * 60 * 1000),
        });

        return resetToken;
    },
    // OTP de 6 dígitos para redefinir a senha. Guarda só o hash (com o userId no
    // meio, para não colidir entre usuários com o mesmo código) e mantém um único
    // OTP ativo por usuário. Devolve null quando a conta não pode receber outro
    // agora: menos de um minuto desde o último ou limite do dia atingido.
    async gerarOtpResetSenha(userId: string): Promise<string | null> {
        const doUsuario = and(eq(tokens.userId, userId), eq(tokens.type, "password_reset_otp"));
        const agora = Date.now();
        // Código de mais de um dia já não conta para o limite.
        await db
            .delete(tokens)
            .where(and(doUsuario, lt(tokens.expiredAt, new Date(agora - DIA_MS))));
        const recentes = await db
            .select({ tokenHash: tokens.tokenHash, expiredAt: tokens.expiredAt })
            .from(tokens)
            .where(doUsuario);
        const ultimo = Math.max(0, ...recentes.map((t) => t.expiredAt.getTime() - VALIDADE_OTP_MS));
        if (agora - ultimo < INTERVALO_ENTRE_OTPS_MS || recentes.length >= MAX_OTPS_POR_DIA) {
            return null;
        }

        // O hash é único na tabela, e os códigos do dia ficam guardados para o limite.
        const usados = new Set(recentes.map((t) => t.tokenHash));
        let otp = String(randomInt(100000, 1000000));
        while (usados.has(hashDoOtp(userId, otp))) otp = String(randomInt(100000, 1000000));

        await db.transaction(async (tx) => {
            // O anterior morre, mas continua contando no limite do dia.
            await tx
                .update(tokens)
                .set({ usedAt: new Date(agora) })
                .where(and(doUsuario, isNull(tokens.usedAt)));
            await tx.insert(tokens).values({
                userId,
                tokenHash: hashDoOtp(userId, otp),
                type: "password_reset_otp",
                expiredAt: new Date(agora + VALIDADE_OTP_MS),
            });
        });
        return otp;
    },
    // Confere o código contra o OTP ativo do usuário e devolve o id do token se
    // bater. Cada erro soma uma tentativa no próprio banco, para tentativas
    // simultâneas não se perderem, e no limite o código morre.
    async conferirOtpResetSenha(userId: string, otp: string): Promise<string | null> {
        const [ativo] = await db
            .select({ id: tokens.id, tokenHash: tokens.tokenHash, expiredAt: tokens.expiredAt })
            .from(tokens)
            .where(
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.type, "password_reset_otp"),
                    isNull(tokens.usedAt),
                ),
            );
        if (!ativo || ativo.expiredAt < new Date()) return null;

        const certo = timingSafeEqual(
            Buffer.from(hashDoOtp(userId, otp), "hex"),
            Buffer.from(ativo.tokenHash, "hex"),
        );
        if (certo) return ativo.id;

        const [contado] = await db
            .update(tokens)
            .set({ tentativas: sql`${tokens.tentativas} + 1` })
            .where(eq(tokens.id, ativo.id))
            .returning({ tentativas: tokens.tentativas });
        if (contado && contado.tentativas >= MAX_TENTATIVAS_OTP) {
            await db.update(tokens).set({ usedAt: new Date() }).where(eq(tokens.id, ativo.id));
        }
        return null;
    },
};
