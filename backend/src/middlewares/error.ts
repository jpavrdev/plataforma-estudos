import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.ts";
import { AppError } from "../errors/AppError.ts";
export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    // Domain error thrown by the services (404, 409, etc.)
    if (err instanceof AppError) {
        return res.status(err.status).json({ erro: err.message });
    }

    // Zod validation error
    if (err instanceof ZodError) {
        console.warn(
            "Validation rejected:",
            err.issues.map((i) => `${i.path.join(".")} (${i.message})`).join("; "),
        );
        if (env.NODE_ENV !== "development") {
            return res.status(400).json({
                erro: "common.invalidData",
            });
        } else {
            return res.status(400).json({
                erro: "common.invalidData",
                detalhes: err.issues,
            });
        }
    }

    // Custom errors or known database errors
    if (err.message === "Email já cadastrado") {
        return res.status(409).json({ erro: err.message });
    }

    // Errors that already carry an HTTP status (e.g. body-parser: body too large -> 413,
    // malformed JSON -> 400). Without this they would fall into the generic 500 below.
    const status =
        (err as { status?: number; statusCode?: number }).status ??
        (err as { status?: number; statusCode?: number }).statusCode;
    if (typeof status === "number" && status >= 400 && status < 500) {
        return res.status(status).json({
            erro: status === 413 ? "common.fileTooLarge" : "common.invalidRequest",
        });
    }

    // Generic error
    console.error("Unexpected error:", err);
    return res.status(500).json({ erro: "common.internalError" });
}
