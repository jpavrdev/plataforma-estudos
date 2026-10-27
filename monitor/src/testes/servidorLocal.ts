import { createServer, type RequestListener, type Server } from "node:http";

const PRIMEIRA_PORTA = 47100;
const ULTIMA_PORTA = 47199;

export interface ServidorLocal {
    url: string;
    porta: number;
    fechar(): Promise<void>;
}

export async function subirServidorLocal(atender: RequestListener): Promise<ServidorLocal> {
    for (let porta = PRIMEIRA_PORTA; porta <= ULTIMA_PORTA; porta++) {
        // Sem keep-alive, para o fetch não reaproveitar um socket do teste anterior na mesma porta.
        const servidor = createServer((requisicao, resposta) => {
            resposta.setHeader("connection", "close");
            atender(requisicao, resposta);
        });
        try {
            await escutar(servidor, porta);
            return { url: `http://127.0.0.1:${porta}`, porta, fechar: () => fechar(servidor) };
        } catch (erro) {
            if (!portaOcupada(erro)) throw erro;
            console.debug(`porta ${porta} ocupada, tentando a próxima`);
        }
    }
    throw new Error(`nenhuma porta livre entre ${PRIMEIRA_PORTA} e ${ULTIMA_PORTA}`);
}

function portaOcupada(erro: unknown): boolean {
    return erro instanceof Error && "code" in erro && erro.code === "EADDRINUSE";
}

function escutar(servidor: Server, porta: number): Promise<void> {
    return new Promise((resolve, reject) => {
        servidor.once("error", reject);
        servidor.listen(porta, "127.0.0.1", () => {
            servidor.off("error", reject);
            resolve();
        });
    });
}

function fechar(servidor: Server): Promise<void> {
    return new Promise((resolve, reject) => {
        servidor.close((erro) => (erro ? reject(erro) : resolve()));
        servidor.closeAllConnections();
    });
}
