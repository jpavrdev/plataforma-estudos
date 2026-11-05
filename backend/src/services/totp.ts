import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// TOTP da RFC 6238 com os parâmetros que todo app autenticador aceita sem
// configuração: HMAC-SHA1, 6 dígitos e passo de 30 segundos.
const PASSO_S = 30;
const DIGITOS = 6;
const ALFABETO_BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const novoSegredo = () => randomBytes(20);

// Base32 da RFC 4648 sem o preenchimento "=", que é o formato do otpauth://.
export function base32(bytes: Buffer): string {
    let valor = 0;
    let bits = 0;
    let saida = "";
    for (const byte of bytes) {
        valor = ((valor & 0xff) << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            saida += ALFABETO_BASE32[(valor >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) saida += ALFABETO_BASE32[(valor << (5 - bits)) & 31];
    return saida;
}

export const passoAtual = (agoraMs = Date.now()) => Math.floor(agoraMs / 1000 / PASSO_S);

export function codigoNoPasso(segredo: Buffer, passo: number, digitos = DIGITOS): string {
    const contador = Buffer.alloc(8);
    contador.writeBigUInt64BE(BigInt(passo));
    const hmac = createHmac("sha1", segredo).update(contador).digest();
    const deslocamento = hmac[hmac.length - 1] & 0x0f;
    const numero = (hmac.readUInt32BE(deslocamento) & 0x7fffffff) % 10 ** digitos;
    return String(numero).padStart(digitos, "0");
}

// Aceita também o passo anterior e o seguinte, para celular com o relógio um
// pouco adiantado ou atrasado. Devolve o passo que bateu, que quem chama grava
// para o mesmo código não entrar duas vezes.
export function conferirTotp(segredo: Buffer, codigo: string, agoraMs = Date.now()): number | null {
    if (!/^\d{6}$/.test(codigo)) return null;
    const atual = passoAtual(agoraMs);
    for (const passo of [atual - 1, atual, atual + 1]) {
        if (timingSafeEqual(Buffer.from(codigoNoPasso(segredo, passo)), Buffer.from(codigo))) {
            return passo;
        }
    }
    return null;
}

export function uriOtpauth(segredo: Buffer, conta: string, emissor: string) {
    const rotulo = `${encodeURIComponent(emissor)}:${encodeURIComponent(conta)}`;
    const parametros = new URLSearchParams({
        secret: base32(segredo),
        issuer: emissor,
        algorithm: "SHA1",
        digits: String(DIGITOS),
        period: String(PASSO_S),
    });
    return `otpauth://totp/${rotulo}?${parametros}`;
}
