import { env } from "./src/config/env.ts";
import http from "node:http";
import { app } from "./app.ts";
import { ligarTerminalLabs } from "./src/labs.ws.ts";

const PORT = Number(env.PORT) || 3001;

// O servidor sai do app para o terminal dos labs poder assinar o upgrade de
// WebSocket, que o Express sozinho não trata.
const server = http.createServer(app);
ligarTerminalLabs(server);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
