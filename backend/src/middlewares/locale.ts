import type { Request, Response, NextFunction } from "express";
import { localeFromHeader, type Locale } from "../i18n/locale.ts";
import { translateMessage } from "../i18n/messages.ts";

// The fields that carry text for people in the API answers. Their names stay the
// same in both languages; only the text changes.
const TEXT_FIELDS = ["erro", "mensagem"] as const;

function translateBody(locale: Locale, body: unknown) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    let translated: Record<string, unknown> | null = null;
    for (const field of TEXT_FIELDS) {
        const value = (body as Record<string, unknown>)[field];
        if (typeof value !== "string") continue;
        const text = translateMessage(locale, value);
        if (text !== value) {
            translated ??= { ...(body as Record<string, unknown>) };
            translated[field] = text;
        }
    }
    return translated ?? body;
}

// Reads the language of the request and translates the messages on their way out.
// Doing it in res.json covers in one place the errors thrown by the services, the
// answers written by the controllers and the rate limiters.
export function locale(req: Request, res: Response, next: NextFunction) {
    req.locale = localeFromHeader(req.get("x-locale"));
    const json = res.json.bind(res);
    res.json = (body: unknown) => json(translateBody(req.locale, body));
    next();
}
