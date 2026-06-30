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
