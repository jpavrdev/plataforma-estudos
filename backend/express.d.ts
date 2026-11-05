import "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            // The session went through the 2FA code (mfa claim of the access token).
            mfa?: boolean;
        }
    }
}
