import { Router } from "express";
import {
    login,
    loginTwoFactor,
    refresh,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    forgotPasswordOtp,
    resetPasswordOtp,
} from "../controllers/AuthController.ts";
import { iniciarOAuth, callbackOAuth } from "../controllers/OAuthController.ts";
import {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    verifyEmailLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    resendVerificationLimiter,
    forgotPasswordOtpLimiter,
    twoFactorLimiter,
} from "../middlewares/rateLimit.ts";
import { sameOrigin } from "../middlewares/sameOrigin.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/login/2fa", twoFactorLimiter, loginTwoFactor);
router.post("/register", registerLimiter, register);
router.post("/refresh", sameOrigin, refreshLimiter, refresh);
router.post("/logout", sameOrigin, refreshLimiter, logout);
router.post("/verify-email", verifyEmailLimiter, verifyEmail);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.post("/forgot-password-otp", forgotPasswordOtpLimiter, forgotPasswordOtp);
router.post("/reset-password-otp", resetPasswordLimiter, resetPasswordOtp);
router.post("/resend-verification", resendVerificationLimiter, resendVerification);

// Login social (OAuth): inicia o fluxo e trata o retorno do provedor.
router.get("/auth/:provider", iniciarOAuth);
router.get("/auth/:provider/callback", callbackOAuth);

export default router;
