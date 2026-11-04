import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { env } from "../config/env.ts";
import { authService } from "../services/auth.service.ts";
import { vincularContaSocial } from "../services/contaSocial.service.ts";
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

    const user = await vincularContaSocial(provider, dados);
    if (!user) return falhar("oauth_falhou");

    const { accessToken, refreshToken } = await authService.gerarEGravarTokens(user.id);
    res.cookie("refreshToken", refreshToken, refreshCookieOpts);

    const precisaCompletar = !user.username || !user.birthDate || !user.gender || !user.phone;
    const destino = precisaCompletar ? "completar-perfil" : "home";
    res.redirect(`${env.FRONTEND_URL}/auth/callback#token=${accessToken}&destino=${destino}`);
};
