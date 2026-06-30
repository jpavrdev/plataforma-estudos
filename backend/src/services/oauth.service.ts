import { env } from "../config/env.ts";

export type Provedor = "google" | "github";

interface DadosUsuario {
    providerId: string;
    email: string;
    name: string;
}

interface ConfigProvedor {
    clientId?: string;
    clientSecret?: string;
    authorizeUrl: string;
    tokenUrl: string;
    scope: string;
    buscarUsuario: (accessToken: string) => Promise<DadosUsuario | null>;
}

const CONFIGS: Record<Provedor, ConfigProvedor> = {
    google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scope: "openid email profile",
        async buscarUsuario(accessToken) {
            const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!r.ok) return null;
            const u = (await r.json()) as {
                sub?: string;
                email?: string;
                email_verified?: boolean;
                name?: string;
            };
            // Só aceita email já verificado pelo provedor.
            if (!u.sub || !u.email || u.email_verified === false) return null;
            return { providerId: u.sub, email: u.email.toLowerCase(), name: u.name || u.email };
        },
    },
    github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        authorizeUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        scope: "read:user user:email",
        async buscarUsuario(accessToken) {
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "ensina-dev",
            };
            const ur = await fetch("https://api.github.com/user", { headers });
            if (!ur.ok) return null;
            const u = (await ur.json()) as {
                id?: number;
                name?: string;
                login?: string;
                email?: string;
            };
            if (!u.id) return null;
            // O email do GitHub pode ser privado: busca o verificado em /user/emails.
            let email = u.email ?? null;
            const er = await fetch("https://api.github.com/user/emails", { headers });
            if (er.ok) {
                const emails = (await er.json()) as {
                    email: string;
                    primary: boolean;
                    verified: boolean;
                }[];
                const escolhido =
                    emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
                if (escolhido) email = escolhido.email;
            }
            if (!email) return null;
            return {
                providerId: String(u.id),
                email: email.toLowerCase(),
                name: u.name || u.login || email,
            };
        },
    },
};

export function provedorValido(p: string): p is Provedor {
    return p === "google" || p === "github";
}

export function provedorConfigurado(p: Provedor): boolean {
    const c = CONFIGS[p];
    return !!c.clientId && !!c.clientSecret;
}

function redirectUri(provider: Provedor): string {
    return `${env.OAUTH_CALLBACK_BASE}/auth/${provider}/callback`;
}

export function urlAutorizacao(provider: Provedor, state: string): string {
    const c = CONFIGS[provider];
    const params = new URLSearchParams({
        client_id: c.clientId!,
        redirect_uri: redirectUri(provider),
        scope: c.scope,
        state,
        response_type: "code",
    });
    if (provider === "google") {
        params.set("access_type", "online");
        params.set("prompt", "select_account");
    }
    return `${c.authorizeUrl}?${params.toString()}`;
}

export async function trocarCodePorUsuario(
    provider: Provedor,
    code: string,
): Promise<DadosUsuario | null> {
    const c = CONFIGS[provider];
    const tr = await fetch(c.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: c.clientId!,
            client_secret: c.clientSecret!,
            code,
            redirect_uri: redirectUri(provider),
            grant_type: "authorization_code",
        }),
    });
    if (!tr.ok) return null;
    const tj = (await tr.json()) as { access_token?: string };
    if (!tj.access_token) return null;
    return c.buscarUsuario(tj.access_token);
}
