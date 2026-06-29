/**
 * Erro de domínio com status HTTP e mensagem própria.
 * Os services lançam AppError para sinalizar 404/409/etc. sem depender
 * de req/res; o middleware de erro converte em resposta JSON.
 */
export class AppError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}
