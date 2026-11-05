import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { env } from "../config/env.ts";
import { parseLocale } from "../i18n/locale.ts";
import { authService } from "../services/auth.service.ts";
import { linkSocialAccount } from "../services/socialAccount.service.ts";
import { twoFactorService } from "../services/twoFactor.service.ts";
import {
    isValidProvider,
    isProviderConfigured,
    authorizationUrl,
    exchangeCodeForUser,
} from "../services/oauth.service.ts";

const STATE_COOKIE = "oauth_state";
// The screen language goes along with the state: the callback is a redirect from
// the provider, without the X-Locale header, and a new account is born in it.
const LOCALE_COOKIE = "oauth_locale";

// The state has to come back in the callback, which is a redirect from the provider
// (cross-site). Hence a Lax cookie: Strict would not be sent on that redirect and
// would break the check.
const stateCookieOpts = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 10 * 60 * 1000, // 10 min
    path: "/",
};

// The same refresh cookie as the regular login (the /refresh calls are same-site).
const refreshCookieOpts = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    path: "/",
};

export const startOAuth = (req: Request, res: Response) => {
    const provider = String(req.params.provider);
    if (!isValidProvider(provider) || !isProviderConfigured(provider)) {
        return res.redirect(`${env.FRONTEND_URL}/?erro=provedor_indisponivel`);
    }
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, state, stateCookieOpts);
    const locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
    res.cookie(LOCALE_COOKIE, parseLocale(locale), stateCookieOpts);
    res.redirect(authorizationUrl(provider, state));
};

export const oauthCallback = async (req: Request, res: Response) => {
    const provider = String(req.params.provider);
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const stateCookie = req.cookies?.[STATE_COOKIE] ?? null;
    const locale = parseLocale(req.cookies?.[LOCALE_COOKIE]);
    res.clearCookie(STATE_COOKIE, { path: "/" });
    res.clearCookie(LOCALE_COOKIE, { path: "/" });

    const fail = (reason: string) => res.redirect(`${env.FRONTEND_URL}/?erro=${reason}`);

    if (!isValidProvider(provider) || !isProviderConfigured(provider)) {
        return fail("provedor_indisponivel");
    }
    if (!code || !state || !stateCookie || state !== stateCookie) {
        return fail("oauth_invalido");
    }

    let providerUser;
    try {
        providerUser = await exchangeCodeForUser(provider, code);
    } catch (e) {
        console.error("OAuth: failed to exchange the code for a user", e);
        return fail("oauth_falhou");
    }
    if (!providerUser) return fail("oauth_sem_email");

    const user = await linkSocialAccount(provider, providerUser, locale);
    if (!user) return fail("oauth_falhou");

    const needsProfile = !user.username || !user.birthDate || !user.gender || !user.phone;
    const destination = needsProfile ? "completar-perfil" : "home";

    // With 2FA the provider counts as the password: the session only comes after the code.
    if (await twoFactorService.isEnabled(user.id)) {
        const challenge = await twoFactorService.createChallenge(user.id);
        return res.redirect(
            `${env.FRONTEND_URL}/auth/callback#challenge=${challenge}&destino=${destination}`,
        );
    }

    const { accessToken, refreshToken } = await authService.issueSessionTokens(user.id);
    res.cookie("refreshToken", refreshToken, refreshCookieOpts);
    res.redirect(`${env.FRONTEND_URL}/auth/callback#token=${accessToken}&destino=${destination}`);
};
