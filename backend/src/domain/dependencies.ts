// Rules of the dependencies endpoint the external monitor reads. Each
// dependency's I/O comes in through the ports, so everything here runs in the
// tests with no network, database or disk.
import { createHash, timingSafeEqual } from "node:crypto";

export type CheckStatus = "ok" | "falha";

export interface DatabaseState {
    situacao: CheckStatus;
    latenciaMs?: number;
}

export interface WhatsappState {
    situacao: CheckStatus | "nao-configurado";
    estado?: string;
}

export interface DiskState {
    situacao: CheckStatus;
    usoPercentual?: number;
}

export interface LabsState {
    situacao: CheckStatus;
    sessoes?: number;
    max?: number;
}

export interface DependencyReport {
    banco: DatabaseState;
    whatsapp: WhatsappState;
    disco: DiskState;
    labs: LabsState;
}

// statfs fields, with the names Node returns.
export interface DiskSpace {
    blocks: number;
    bfree: number;
    bavail: number;
}

export interface DependencyPorts {
    consultarBanco(): Promise<unknown>;
    // null when the API runs without Evolution (dev).
    estadoDoWhatsapp(signal: AbortSignal): Promise<string | null>;
    espacoEmDisco(): Promise<DiskSpace>;
    // Body of the labs service /health; rejects when it does not answer 2xx.
    saudeDosLabs(signal: AbortSignal): Promise<unknown>;
}

export function tokenFromHeader(authorization: string | undefined): string | null {
    return authorization?.match(/^Bearer\s+(\S+)\s*$/i)?.[1] ?? null;
}

const digest = (value: string) => createHash("sha256").update(value).digest();

// timingSafeEqual requires buffers of the same length. Comparing the hashes solves
// that without letting the response time reveal the token's length.
export function tokenMatches(received: string | null, expected: string): boolean {
    if (!received || !expected) return false;
    return timingSafeEqual(digest(received), digest(expected));
}

export class TimeoutError extends Error {
    constructor(ms: number) {
        super(`no response within ${ms} ms`);
        this.name = "TimeoutError";
    }
}

// The signal is aborted on timeout so whoever can cancel (fetch) releases the
// connection instead of hanging on after the response has already gone out.
export async function withTimeout<T>(
    task: (signal: AbortSignal) => Promise<T>,
    ms: number,
): Promise<T> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            const error = new TimeoutError(ms);
            controller.abort(error);
            reject(error);
        }, ms);
    });
    try {
        return await Promise.race([task(controller.signal), timeout]);
    } finally {
        clearTimeout(timer);
    }
}

// Same math as df: the root reserve stays out of the total and the result is
// rounded up, so the number matches df -h on the server.
export function usagePercent({ blocks, bfree, bavail }: DiskSpace): number {
    const used = blocks - bfree;
    const total = used + bavail;
    if (total <= 0) throw new Error("statfs has no usable blocks");
    return Math.ceil((used * 100) / total);
}

export function createDependencyChecker(ports: DependencyPorts, timeoutMs: number) {
    async function database(): Promise<DatabaseState> {
        const start = performance.now();
        await ports.consultarBanco();
        return { situacao: "ok", latenciaMs: Math.round(performance.now() - start) };
    }

    async function whatsapp(signal: AbortSignal): Promise<WhatsappState> {
        const state = await ports.estadoDoWhatsapp(signal);
        if (state === null) return { situacao: "nao-configurado" };
        // Only an open connection delivers messages; "connecting" and "close" already count as failure.
        return { situacao: state === "open" ? "ok" : "falha", estado: state };
    }

    async function disk(): Promise<DiskState> {
        return { situacao: "ok", usoPercentual: usagePercent(await ports.espacoEmDisco()) };
    }

    async function labs(signal: AbortSignal): Promise<LabsState> {
        const body = await ports.saudeDosLabs(signal);
        const health =
            typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
        if (health.status !== "ok") throw new Error("the labs service did not answer status ok");
        const { sessoes: sessions, max } = health;
        return typeof sessions === "number" && typeof max === "number"
            ? { situacao: "ok", sessoes: sessions, max }
            : { situacao: "ok" };
    }

    // The reason only goes to the log: the body says what failed, never why.
    async function check<T>(
        name: string,
        probe: (signal: AbortSignal) => Promise<T>,
    ): Promise<T | { situacao: "falha" }> {
        try {
            return await withTimeout(probe, timeoutMs);
        } catch (error) {
            console.error(`[dependencies] ${name} failed:`, error);
            return { situacao: "falha" };
        }
    }

    return async function checkDependencies(): Promise<DependencyReport> {
        const [databaseState, whatsappState, diskState, labsState] = await Promise.all([
            check("database", database),
            check("whatsapp", whatsapp),
            check("disk", disk),
            check("labs", labs),
        ]);
        return {
            banco: databaseState,
            whatsapp: whatsappState,
            disco: diskState,
            labs: labsState,
        };
    };
}
