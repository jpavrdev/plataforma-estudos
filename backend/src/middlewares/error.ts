import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    // Se for erro do Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            erro: "Dados inválidos",
            detalhes: err.issues
        });
    }

    // Erros customizados ou erros de banco conhecidos
    if (err.message === "Email já cadastrado") {
        return res.status(409).json({ erro: err.message });
    }

    // Erro genérico
    console.error("Erro inesperado: ", err);
    return res.status(500).json({ erro: "Erro interno do servidor" });
}