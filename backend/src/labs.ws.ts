import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "./config/env.ts";
import { consumeTicket } from "./services/lab.service.ts";

// Bridge between the browser and the labs service. The backend sits in the middle
// to check who owns the session: the labs service is not exposed, and whoever
// reaches it has already gone through here. The terminal bytes only pass through.
export function attachLabTerminal(server: Server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (url.pathname !== "/labs/terminal") return;

        const userId = consumeTicket(url.searchParams.get("ticket") ?? "");
        if (!userId) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (browser) => {
            // Who owns the session goes in a header on the internal connection, so
            // the labs service can limit each student to one session.
            const lab = new WebSocket(`${env.LABS_URL}/sessao`, {
                headers: { "x-user-id": userId },
            });
            // What the student types before the lab answers the handshake cannot
            // vanish, or the first keystroke is lost.
            const pending: Array<Buffer | string> = [];

            browser.on("message", (data, isBinary) => {
                const payload = isBinary ? (data as Buffer) : data.toString();
                if (lab.readyState === WebSocket.OPEN) lab.send(payload);
                else pending.push(payload);
            });
            lab.on("open", () => {
                for (const p of pending) lab.send(p);
                pending.length = 0;
            });
            lab.on("message", (data, isBinary) => {
                if (browser.readyState === WebSocket.OPEN)
                    browser.send(isBinary ? (data as Buffer) : data.toString());
            });

            const close = () => {
                if (lab.readyState === WebSocket.OPEN) lab.close();
                if (browser.readyState === WebSocket.OPEN) browser.close();
            };
            browser.on("close", close);
            lab.on("close", close);
            browser.on("error", (e) => {
                console.error("[labs] browser socket error:", e.message);
                close();
            });
            lab.on("error", (e) => {
                console.error("[labs] labs service unavailable:", e.message);
                if (browser.readyState === WebSocket.OPEN) {
                    browser.send(
                        JSON.stringify({
                            tipo: "erro",
                            mensagem:
                                "O laboratório está indisponível. Tente de novo em instantes.",
                        }),
                    );
                }
                close();
            });
        });
    });
}
