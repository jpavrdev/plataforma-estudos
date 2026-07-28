import { randomBytes } from "node:crypto";

// O navegador não manda cabeçalho de Authorization ao abrir um WebSocket, então
// o token do usuário não tem como viajar ali. O backend emite um ticket curto e
// de uso único numa chamada HTTP normal (essa sim autenticada), e o WebSocket
// abre com ele. Como vale segundos e queima no primeiro uso, aparecer em log de
// acesso não compromete a conta.
const VALIDADE_MS = 30 * 1000;

type Ticket = { userId: string; expiraEm: number };
const tickets = new Map<string, Ticket>();

function limpar() {
    const agora = Date.now();
    for (const [chave, t] of tickets) if (t.expiraEm <= agora) tickets.delete(chave);
}

export function emitirTicket(userId: string): { ticket: string; validadeSegundos: number } {
    limpar();
    const ticket = randomBytes(32).toString("hex");
    tickets.set(ticket, { userId, expiraEm: Date.now() + VALIDADE_MS });
    return { ticket, validadeSegundos: VALIDADE_MS / 1000 };
}

export function consumirTicket(ticket: string): string | null {
    limpar();
    const registro = tickets.get(ticket);
    if (!registro) return null;
    tickets.delete(ticket);
    return registro.expiraEm > Date.now() ? registro.userId : null;
}
