import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos em milissegundos
    max: 10,
    message: { erro: "Muitas tentativas. Tente novamente mais tarde." },
    standardHeaders: true, // Envia headers RateLimit-* (É o padrão moderno de hoje)
    legacyHeaders: false, // Não envia os headers antigos
});