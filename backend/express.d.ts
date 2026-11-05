import "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            // A sessão passou pelo código do 2FA (claim mfa do access token).
            mfa?: boolean;
        }
    }
}
