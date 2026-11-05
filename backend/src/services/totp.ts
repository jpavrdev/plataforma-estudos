import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// RFC 6238 TOTP with the parameters every authenticator app accepts without
// extra setup: HMAC-SHA1, 6 digits and a 30-second step.
const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const newSecret = () => randomBytes(20);

// RFC 4648 base32 without the "=" padding, which is the otpauth:// format.
export function base32(bytes: Buffer): string {
    let value = 0;
    let bits = 0;
    let output = "";
    for (const byte of bytes) {
        value = ((value & 0xff) << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    return output;
}

export const currentStep = (nowMs = Date.now()) => Math.floor(nowMs / 1000 / STEP_SECONDS);

export function codeAtStep(secret: Buffer, step: number, digits = DIGITS): string {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(step));
    const hmac = createHmac("sha1", secret).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const number = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits;
    return String(number).padStart(digits, "0");
}

// Also accepts the previous and the next step, for a phone clock slightly
// ahead or behind. Returns the matching step, which the caller stores so the
// same code is never accepted twice.
export function verifyTotp(secret: Buffer, code: string, nowMs = Date.now()): number | null {
    if (!/^\d{6}$/.test(code)) return null;
    const current = currentStep(nowMs);
    for (const step of [current - 1, current, current + 1]) {
        if (timingSafeEqual(Buffer.from(codeAtStep(secret, step)), Buffer.from(code))) {
            return step;
        }
    }
    return null;
}

export function otpauthUri(secret: Buffer, account: string, issuer: string) {
    const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
    const params = new URLSearchParams({
        secret: base32(secret),
        issuer,
        algorithm: "SHA1",
        digits: String(DIGITS),
        period: String(STEP_SECONDS),
    });
    return `otpauth://totp/${label}?${params}`;
}
