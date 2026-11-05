import { createHash, randomBytes, randomInt } from "node:crypto";
import QRCode from "qrcode";
import { and, count, eq, isNotNull, isNull, lt, or } from "drizzle-orm";
import { db } from "../../db.ts";
import { tokens, twoFactorAuth, twoFactorRecoveryCodes, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { authService } from "./auth.service.ts";
import { cifrar, decifrar } from "./cifra.ts";
import { base32, conferirTotp, novoSegredo, uriOtpauth } from "./totp.ts";

const EMISSOR = "ensina.dev";
const QTD_CODIGOS = 10;
// Sem i, l, o, 0 e 1, que se confundem na hora de digitar.
const ALFABETO_CODIGO = "abcdefghjkmnpqrstuvwxyz23456789";
const VALIDADE_DESAFIO_MS = 5 * 60 * 1000;
const DESAFIO_ENCERRADO = "O tempo para digitar o código acabou. Entre de novo.";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type MetodoDoisFatores = "app" | "recuperacao";

const sha256 = (texto: string) => createHash("sha256").update(texto).digest("hex");
const normalizarCodigo = (codigo: string) => codigo.toLowerCase().replace(/[^a-z0-9]/g, "");
const hashDoCodigo = (userId: string, codigo: string) => sha256(`${userId}:${codigo}`);

// Troca os códigos de recuperação do usuário por dez novos e devolve os novos
// em texto, a única vez em que eles aparecem.
async function gravarCodigos(tx: Tx, userId: string) {
    const codigos = Array.from({ length: QTD_CODIGOS }, () => {
        const letras = Array.from(
            { length: 10 },
            () => ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)],
        ).join("");
        return `${letras.slice(0, 5)}-${letras.slice(5)}`;
    });
    await tx.delete(twoFactorRecoveryCodes).where(eq(twoFactorRecoveryCodes.userId, userId));
    await tx.insert(twoFactorRecoveryCodes).values(
        codigos.map((codigo) => ({
            userId,
            codeHash: hashDoCodigo(userId, normalizarCodigo(codigo)),
        })),
    );
    return codigos;
}

export const doisFatoresService = {
    async ativo(userId: string) {
        const [linha] = await db
            .select({ enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        return Boolean(linha?.enabledAt);
    },

    async estado(userId: string) {
        const [linha] = await db
            .select({ enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        const [{ restantes }] = await db
            .select({ restantes: count() })
            .from(twoFactorRecoveryCodes)
            .where(
                and(
                    eq(twoFactorRecoveryCodes.userId, userId),
                    isNull(twoFactorRecoveryCodes.usedAt),
                ),
            );
        return {
            ativo: Boolean(linha?.enabledAt),
            ativadoEm: linha?.enabledAt ?? null,
            codigosRestantes: restantes,
        };
    },

    // Gera um segredo pendente e devolve o que o app autenticador precisa ler.
    async iniciarConfiguracao(userId: string, email: string) {
        if (await this.ativo(userId)) {
            throw new AppError(
                409,
                "A verificação em duas etapas já está ativa. Desative antes de configurar de novo.",
            );
        }
        const segredo = novoSegredo();
        const pendente = cifrar(segredo);
        await db
            .insert(twoFactorAuth)
            .values({ userId, pendingSecret: pendente })
            .onConflictDoUpdate({
                target: twoFactorAuth.userId,
                set: { pendingSecret: pendente, updatedAt: new Date() },
            });
        const uri = uriOtpauth(segredo, email, EMISSOR);
        const qrSvg = await QRCode.toString(uri, { type: "svg", margin: 1 });
        return { segredo: base32(segredo), uri, qrSvg };
    },

    // O primeiro código do app confirma a configuração. As sessões abertas antes
    // não passaram pelo código e caem todas; a atual volta já verificada.
    async ativar(userId: string, codigo: string) {
        const [linha] = await db
            .select({ pendente: twoFactorAuth.pendingSecret, enabledAt: twoFactorAuth.enabledAt })
            .from(twoFactorAuth)
            .where(eq(twoFactorAuth.userId, userId));
        if (linha?.enabledAt) {
            throw new AppError(409, "A verificação em duas etapas já está ativa.");
        }
        if (!linha?.pendente) throw new AppError(400, "Comece a configuração de novo.");
        const pendente = linha.pendente;

        const passo = conferirTotp(decifrar(pendente), codigo);
        if (passo === null) {
            throw new AppError(
                400,
                "Código incorreto. Confira se o horário do celular está certo e use o código atual.",
            );
        }

        return db.transaction(async (tx) => {
            const agora = new Date();
            const [ligado] = await tx
                .update(twoFactorAuth)
                .set({
                    secret: pendente,
                    pendingSecret: null,
                    enabledAt: agora,
                    lastStep: passo,
                    updatedAt: agora,
                })
                .where(
                    and(
                        eq(twoFactorAuth.userId, userId),
                        eq(twoFactorAuth.pendingSecret, pendente),
                        isNull(twoFactorAuth.enabledAt),
                    ),
                )
                .returning({ userId: twoFactorAuth.userId });
            if (!ligado) throw new AppError(409, "A configuração mudou no meio do caminho.");

            const codigos = await gravarCodigos(tx, userId);
            await tx
                .delete(tokens)
                .where(and(eq(tokens.userId, userId), eq(tokens.type, "refresh")));
            const sessao = await authService.gerarEGravarTokens(userId, tx, { mfa: true });
            return { codigos, sessao };
        });
    },

    // Código do app (cada um vale uma vez só) ou código de recuperação (que é
    // gasto). Devolve qual dos dois conferiu.
    async conferir(userId: string, entrada: string): Promise<MetodoDoisFatores | null> {
        const codigo = entrada.trim();
        if (/^\d{6}$/.test(codigo)) {
            const [linha] = await db
                .select({ segredo: twoFactorAuth.secret })
                .from(twoFactorAuth)
                .where(and(eq(twoFactorAuth.userId, userId), isNotNull(twoFactorAuth.enabledAt)));
            if (!linha?.segredo) return null;
            let segredo: Buffer;
            try {
                segredo = decifrar(linha.segredo);
            } catch (e) {
                console.error(`2FA: o segredo do usuário ${userId} não decifra`, e);
                return null;
            }
            const passo = conferirTotp(segredo, codigo);
            if (passo === null) return null;
            const [aceito] = await db
                .update(twoFactorAuth)
                .set({ lastStep: passo })
                .where(
                    and(
                        eq(twoFactorAuth.userId, userId),
                        or(isNull(twoFactorAuth.lastStep), lt(twoFactorAuth.lastStep, passo)),
                    ),
                )
                .returning({ userId: twoFactorAuth.userId });
            return aceito ? "app" : null;
        }

        const normalizado = normalizarCodigo(codigo);
        if (normalizado.length !== 10) return null;
        const [gasto] = await db
            .update(twoFactorRecoveryCodes)
            .set({ usedAt: new Date() })
            .where(
                and(
                    eq(twoFactorRecoveryCodes.userId, userId),
                    eq(twoFactorRecoveryCodes.codeHash, hashDoCodigo(userId, normalizado)),
                    isNull(twoFactorRecoveryCodes.usedAt),
                ),
            )
            .returning({ id: twoFactorRecoveryCodes.id });
        return gasto ? "recuperacao" : null;
    },

    novosCodigos: (userId: string) => db.transaction((tx) => gravarCodigos(tx, userId)),

    async desativar(userId: string) {
        await db.transaction(async (tx) => {
            await tx
                .delete(twoFactorRecoveryCodes)
                .where(eq(twoFactorRecoveryCodes.userId, userId));
            await tx.delete(twoFactorAuth).where(eq(twoFactorAuth.userId, userId));
        });
    },

    // Com 2FA, a senha (ou o login social) só abre um desafio de 5 minutos, e é
    // o código que fecha o login.
    async criarDesafio(userId: string) {
        const desafio = randomBytes(32).toString("hex");
        await db
            .delete(tokens)
            .where(
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.type, "login_2fa"),
                    lt(tokens.expiredAt, new Date()),
                ),
            );
        await db.insert(tokens).values({
            userId,
            tokenHash: sha256(desafio),
            type: "login_2fa",
            expiredAt: new Date(Date.now() + VALIDADE_DESAFIO_MS),
        });
        return desafio;
    },

    // Código errado conta na mesma trava da senha errada, e a senha certa não
    // zera o contador de quem tem 2FA: só o código certo zera.
    async resolverDesafio(desafio: string, codigo: string) {
        const [registro] = await db
            .select({
                id: tokens.id,
                userId: tokens.userId,
                expiredAt: tokens.expiredAt,
                usedAt: tokens.usedAt,
                lockedUntil: users.lockedUntil,
            })
            .from(tokens)
            .innerJoin(users, eq(users.id, tokens.userId))
            .where(and(eq(tokens.tokenHash, sha256(desafio)), eq(tokens.type, "login_2fa")));
        if (!registro || registro.usedAt || registro.expiredAt < new Date()) {
            throw new AppError(401, DESAFIO_ENCERRADO);
        }
        if (registro.lockedUntil && registro.lockedUntil > new Date()) {
            throw new AppError(429, "Muitas tentativas. Tente novamente mais tarde.");
        }

        const metodo = await this.conferir(registro.userId, codigo);
        if (!metodo) {
            await authService.registrarFalhaDeLogin(registro.userId);
            throw new AppError(401, "Código incorreto.");
        }

        const [fechado] = await db
            .update(tokens)
            .set({ usedAt: new Date() })
            .where(and(eq(tokens.id, registro.id), isNull(tokens.usedAt)))
            .returning({ id: tokens.id });
        if (!fechado) throw new AppError(401, DESAFIO_ENCERRADO);
        await authService.zerarFalhasDeLogin(registro.userId);
        return { userId: registro.userId, metodo };
    },
};
