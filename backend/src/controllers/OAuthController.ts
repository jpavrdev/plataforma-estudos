import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { db } from "../../db.ts";
import { users, oauthAccounts } from "../../schema.ts";
import { and, eq } from "drizzle-orm";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";
import {
    provedorValido,
    provedorConfigurado,
    urlAutorizacao,
    trocarCodePorUsuario,
} from "../services/oauth.service.ts";

const STATE_COOKIE = "oauth_state";

// O state precisa voltar no callback, que é um redirect vindo do provedor (cross-site).
// Por isso o cookie é Lax (Strict não seria enviado nesse redirect e quebraria a validação).
const stateCookieOpts = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 10 * 60 * 1000, // 10 min
    path: "/",
};

// Mesmo cookie de refresh do login normal (as chamadas de /refresh são same-site).
const refreshCookieOpts = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    path: "/",
};

export const iniciarOAuth = (req: Request, res: Response) => {
    const provider = String(req.params.provider);
    if (!provedorValido(provider) || !provedorConfigurado(provider)) {
        return res.redirect(`${env.FRONTEND_URL}/?erro=provedor_indisponivel`);
    }
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, stateCookieOpts);
    res.redirect(urlAutorizacao(provider, state));
};

export const callbackOAuth = async (req: Request, res: Response) => {
    const provider = String(req.params.provider);
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const stateCookie = req.cookies?.[STATE_COOKIE] ?? null;
    res.clearCookie(STATE_COOKIE, { path: "/" });

    const falhar = (motivo: string) => res.redirect(`${env.FRONTEND_URL}/?erro=${motivo}`);

    if (!provedorValido(provider) || !provedorConfigurado(provider)) {
        return falhar("provedor_indisponivel");
    }
    if (!code || !state || !stateCookie || state !== stateCookie) {
        return falhar("oauth_invalido");
    }

    let dados;
    try {
        dados = await trocarCodePorUsuario(provider, code);
    } catch (e) {
        console.error("OAuth: erro ao trocar o code por usuário", e);
        return falhar("oauth_falhou");
    }
    if (!dados) return falhar("oauth_sem_email");

    // Já existe essa identidade do provedor? Então é login: usa o dono dela.
    const [contaExistente] = await db
        .select()
        .from(oauthAccounts)
        .where(
            and(
                eq(oauthAccounts.provider, provider),
                eq(oauthAccounts.providerId, dados.providerId),
            ),
        );

    let user;
    if (contaExistente) {
        [user] = await db.select().from(users).where(eq(users.id, contaExistente.userId));
    } else {
        // Sem identidade ainda: vincula a uma conta com o mesmo email (verificado) ou cria.
        [user] = await db.select().from(users).where(eq(users.email, dados.email));
        if (!user) {
            [user] = await db
                .insert(users)
                .values({
                    name: dados.name,
                    email: dados.email,
                    emailVerifiedAt: new Date(),
                })
                .returning();
        }
        await db
            .insert(oauthAccounts)
            .values({ userId: user.id, provider, providerId: dados.providerId })
            .onConflictDoNothing();
    }

    if (!user) return falhar("oauth_falhou");

    const { accessToken, refreshToken } = await authService.gerarEGravarTokens(user.id);
    res.cookie("refreshToken", refreshToken, refreshCookieOpts);

    // Conta de login social nova ainda não tem username nem nascimento/gênero/telefone.
    const precisaCompletar = !user.username || !user.birthDate || !user.gender || !user.phone;
    const destino = precisaCompletar ? "completar-perfil" : "home";
    res.redirect(`${env.FRONTEND_URL}/auth/callback#token=${accessToken}&destino=${destino}`);
};
