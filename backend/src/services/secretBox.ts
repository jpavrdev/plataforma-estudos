import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { env } from "../config/env.ts";

// 2FA secrets are stored encrypted, so a database dump alone is not enough to
// generate codes. The key is derived from JWT_SECRET: rotating JWT_SECRET
// invalidates the stored secrets, and whoever has 2FA signs in with a recovery
// code and sets it up again.
const key = Buffer.from(hkdfSync("sha256", env.JWT_SECRET, "ensinadev", "two-factor-secret", 32));

export function encrypt(data: Buffer): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const body = Buffer.concat([cipher.update(data), cipher.final()]);
    const parts = [iv, cipher.getAuthTag(), body].map((p) => p.toString("base64"));
    return ["v1", ...parts].join(":");
}

export function decrypt(text: string): Buffer {
    const [version, iv, tag, body] = text.split(":");
    if (version !== "v1" || !iv || !tag || !body) {
        throw new Error("Unknown encrypted secret format");
    }
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64")), decipher.final()]);
}
