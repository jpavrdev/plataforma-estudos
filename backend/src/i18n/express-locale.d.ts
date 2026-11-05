import type { Locale } from "./locale.ts";

// Set by the locale middleware on every request.
declare global {
    namespace Express {
        interface Request {
            locale: Locale;
        }
    }
}
