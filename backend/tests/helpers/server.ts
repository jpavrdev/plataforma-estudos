import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

/**
 * Sobe o app numa porta efêmera e devolve uma função `request` baseada em fetch.
 * O app é importado dinamicamente para garantir que as variáveis de ambiente
 * de teste (DATABASE_URL etc.) já estejam definidas antes de o db.ts conectar.
 */
export async function startTestServer() {
    const { app } = await import("../../app.ts");

    const server: Server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });

    const { port } = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${port}`;

    async function request(
        method: string,
        path: string,
        options: { body?: unknown; cookie?: string } = {},
    ) {
        const headers: Record<string, string> = {};
        if (options.body !== undefined) headers["Content-Type"] = "application/json";
        if (options.cookie) headers["Cookie"] = options.cookie;

        const res = await fetch(`${base}${path}`, {
            method,
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });

        const setCookie = res.headers.get("set-cookie");
        let json: any = null;
        const text = await res.text();
        if (text) {
            try { json = JSON.parse(text); } catch { json = text; }
        }

        return { status: res.status, body: json, setCookie };
    }

    async function close() {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }

    return { request, close, base };
}

/** Extrai o valor do refreshToken de um header Set-Cookie. */
export function extractRefreshCookie(setCookie: string | null): string | null {
    if (!setCookie) return null;
    const match = setCookie.match(/refreshToken=([^;]+)/);
    return match ? `refreshToken=${match[1]}` : null;
}
