import rateLimit from "express-rate-limit";

// Each sensitive endpoint has its own counter (a separate instance), so one does not
// use up the other's limit. Login and sign-up used to share a limiter, so failing
// sign-up a few times also locked login.
const createLimiter = (max: number, message: string) =>
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max,
        message: { erro: message },
        standardHeaders: true, // RateLimit-* headers (the modern standard)
        legacyHeaders: false,
        skip: () => process.env.NODE_ENV === "test", // no limits during the tests
    });

export const loginLimiter = createLimiter(10, "rateLimit.login");

export const registerLimiter = createLimiter(10, "rateLimit.register");

// Refresh is automatic (token rotation); it has to be much looser so it does not
// sign out someone using the app normally.
export const refreshLimiter = createLimiter(60, "rateLimit.generic");

export const verifyEmailLimiter = createLimiter(20, "rateLimit.attempts");

// Asking for a reset sends an email; kept low so it does not become a spam vector.
export const forgotPasswordLimiter = createLimiter(5, "rateLimit.passwordReset");

// Resending the verification also sends an email; same low cap as forgot-password.
export const resendVerificationLimiter = createLimiter(5, "rateLimit.verification");

// Sending an OTP (email or WhatsApp) also sends a message; low cap.
export const forgotPasswordOtpLimiter = createLimiter(5, "rateLimit.codes");

// Recovery phone: asking for a code sends a WhatsApp message, and changing it checks the password.
export const phoneCodeLimiter = createLimiter(5, "rateLimit.codes");

export const phoneLimiter = createLimiter(10, "rateLimit.attempts");

// 2FA codes, at login and on the profile. The account lock stops guessing per
// user; this one caps the volume per IP.
export const twoFactorLimiter = createLimiter(10, "rateLimit.twoFactor");

export const resetPasswordLimiter = createLimiter(20, "rateLimit.attempts");

// A loose per-IP cap on purpose: schools and labs share one IP, so this is a burst
// barrier against abuse, not a per-user limit. Auth has its own limiters.
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    message: { erro: "rateLimit.api" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "test" || req.path === "/health",
});

// Each ticket becomes a lab container, so the cap stops whoever keeps opening
// sessions without using them. Loose enough to reconnect after losing the network.
export const labTicketLimiter = createLimiter(30, "rateLimit.labs");

export const challengeRunLimiter = createLimiter(60, "rateLimit.runs");

export const uploadLimiter = createLimiter(30, "rateLimit.uploads");

// Posting in the community (post or comment) writes content; a cap per window
// holds spam and flooding without getting in the way of normal participation.
export const communityWriteLimiter = createLimiter(40, "rateLimit.community");

// Each analysis reads a PDF and may call the model; the monthly cap per supporter
// is in the service, and this is only the burst barrier.
export const resumeAnalysisLimiter = createLimiter(10, "rateLimit.resume");
