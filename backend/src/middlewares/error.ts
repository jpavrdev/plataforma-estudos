import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.ts";
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    // Se for erro do Zod
    if (err instanceof ZodError) {
        if (env.NODE_ENV !== "development") {
            return res.status(400).json({
                erro: "Dados inválidos",
            });
        } else {
            return res.status(400).json({
                erro: "Dados inválidos",
                detalhes: err.issues,
            });
        }
    }

    // Erros customizados ou erros de banco conhecidos
    if (err.message === "Email já cadastrado") {
        return res.status(409).json({ erro: err.message });
    }

    // Erros que ja carregam um status HTTP (ex.: body-parser: corpo grande -> 413,
    // JSON malformado -> 400). Sem isso, cairiam no 500 generico abaixo.
    const status =
        (err as { status?: number; statusCode?: number }).status ??
        (err as { status?: number; statusCode?: number }).statusCode;
    if (typeof status === "number" && status >= 400 && status < 500) {
        return res.status(status).json({
            erro: status === 413 ? "Arquivo muito grande" : "Requisição inválida",
        });
    }

    // Erro genérico
    console.error("Erro inesperado: ", err);
    return res.status(500).json({ erro: "Erro interno do servidor" });
}
