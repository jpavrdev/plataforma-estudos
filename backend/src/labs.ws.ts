import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "./config/env.ts";
import { consumirTicket } from "./services/lab.service.ts";

// Ponte entre o navegador e o serviço de labs. O backend fica no meio para
// conferir de quem é a sessão: o serviço de labs não é exposto, e quem chega
// nele já passou por aqui. Os bytes do terminal só atravessam.
export function ligarTerminalLabs(server: Server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (url.pathname !== "/labs/terminal") return;

        const userId = consumirTicket(url.searchParams.get("ticket") ?? "");
        if (!userId) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (navegador) => {
            // De quem é a sessão vai por cabeçalho na conexão interna, para o
            // serviço de labs poder limitar uma sessão por aluno.
            const lab = new WebSocket(`${env.LABS_URL}/sessao`, {
                headers: { "x-user-id": userId },
            });
            // O que o aluno digita antes do lab responder o handshake não pode
            // sumir, senão a primeira tecla se perde.
            const pendentes: Array<Buffer | string> = [];

            navegador.on("message", (dados, ehBinario) => {
                const carga = ehBinario ? (dados as Buffer) : dados.toString();
                if (lab.readyState === WebSocket.OPEN) lab.send(carga);
                else pendentes.push(carga);
            });
            lab.on("open", () => {
                for (const p of pendentes) lab.send(p);
                pendentes.length = 0;
            });
            lab.on("message", (dados, ehBinario) => {
                if (navegador.readyState === WebSocket.OPEN)
                    navegador.send(ehBinario ? (dados as Buffer) : dados.toString());
            });

            const fechar = () => {
                if (lab.readyState === WebSocket.OPEN) lab.close();
                if (navegador.readyState === WebSocket.OPEN) navegador.close();
            };
            navegador.on("close", fechar);
            lab.on("close", fechar);
            navegador.on("error", (e) => {
                console.error("[labs] erro no socket do navegador:", e.message);
                fechar();
            });
            lab.on("error", (e) => {
                console.error("[labs] serviço de labs indisponível:", e.message);
                if (navegador.readyState === WebSocket.OPEN) {
                    navegador.send(
                        JSON.stringify({
                            tipo: "erro",
                            mensagem: "O laboratório está indisponível. Tente de novo em instantes.",
                        }),
                    );
                }
                fechar();
            });
        });
    });
}
