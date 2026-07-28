import rateLimit from "express-rate-limit";

// Cada endpoint sensível tem o seu próprio contador (instância separada), para um
// não consumir o limite do outro. Antes login e cadastro dividiam o mesmo limiter,
// então errar o cadastro algumas vezes travava também o login.
const criarLimiter = (max: number, mensagem: string) =>
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max,
        message: { erro: mensagem },
        standardHeaders: true, // headers RateLimit-* (padrão moderno)
        legacyHeaders: false,
        skip: () => process.env.NODE_ENV === "test", // não limita durante os testes
    });

export const loginLimiter = criarLimiter(
    10,
    "Muitas tentativas de login. Tente novamente em alguns minutos.",
);

export const registerLimiter = criarLimiter(
    10,
    "Muitas tentativas de cadastro. Tente novamente em alguns minutos.",
);

// Refresh é automático (rotação de token); precisa ser bem mais folgado para
// não deslogar quem está usando o app normalmente.
export const refreshLimiter = criarLimiter(
    60,
    "Muitas requisições. Tente novamente em alguns minutos.",
);

export const verifyEmailLimiter = criarLimiter(
    20,
    "Muitas tentativas. Tente novamente em alguns minutos.",
);

// Pedir redefinição dispara email; mantém baixo para não virar vetor de spam.
export const forgotPasswordLimiter = criarLimiter(
    5,
    "Muitos pedidos de redefinição. Tente novamente em alguns minutos.",
);

// Reenviar verificação também dispara email; mesmo teto baixo do forgot-password.
export const resendVerificationLimiter = criarLimiter(
    5,
    "Muitos pedidos de verificação. Tente novamente em alguns minutos.",
);

export const resetPasswordLimiter = criarLimiter(
    20,
    "Muitas tentativas. Tente novamente em alguns minutos.",
);

// Teto por IP folgado de propósito: escola e lab saem por um mesmo IP, então é
// barreira anti-abuso em rajada, não limite por usuário. Auth tem os seus limiters.
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    message: { erro: "Muitas requisições em pouco tempo. Aguarde um instante." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "test" || req.path === "/health",
});

export const desafioRunLimiter = criarLimiter(
    60,
    "Muitas execuções seguidas. Aguarde um instante e tente de novo.",
);

export const uploadLimiter = criarLimiter(
    30,
    "Muitos envios de imagem. Aguarde alguns minutos.",
);

// Publicar na comunidade (post ou comentário) é escrita de conteúdo; teto por
// janela para conter spam/flood sem atrapalhar quem participa normalmente.
export const comunidadeEscritaLimiter = criarLimiter(
    40,
    "Você está publicando rápido demais. Aguarde alguns minutos.",
);
