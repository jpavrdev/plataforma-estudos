import { randomBytes } from "node:crypto";

// The browser sends no Authorization header when it opens a WebSocket, so the
// user's token has no way to travel there. The backend issues a short, single-use
// ticket in a regular HTTP call (that one authenticated), and the WebSocket opens
// with it. Since it lasts seconds and burns on first use, showing up in an access
// log does not compromise the account.
const TICKET_TTL_MS = 30 * 1000;

type Ticket = { userId: string; expiraEm: number };
const tickets = new Map<string, Ticket>();

function purgeExpired() {
    const now = Date.now();
    for (const [key, t] of tickets) if (t.expiraEm <= now) tickets.delete(key);
}

export function issueTicket(userId: string): { ticket: string; validadeSegundos: number } {
    purgeExpired();
    const ticket = randomBytes(32).toString("hex");
    tickets.set(ticket, { userId, expiraEm: Date.now() + TICKET_TTL_MS });
    return { ticket, validadeSegundos: TICKET_TTL_MS / 1000 };
}

export function consumeTicket(ticket: string): string | null {
    purgeExpired();
    const record = tickets.get(ticket);
    if (!record) return null;
    tickets.delete(ticket);
    return record.expiraEm > Date.now() ? record.userId : null;
}
