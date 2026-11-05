import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { env } from "../config/env.ts";

// Os segredos do 2FA ficam cifrados no banco, para um dump sozinho não bastar
// para gerar códigos. A chave sai do JWT_SECRET, então trocar o JWT_SECRET
// invalida os segredos gravados: quem tem 2FA entra com um código de
// recuperação e configura de novo.
const chave = Buffer.from(hkdfSync("sha256", env.JWT_SECRET, "ensinadev", "segredo-2fa", 32));

export function cifrar(dado: Buffer): string {
    const iv = randomBytes(12);
    const cifra = createCipheriv("aes-256-gcm", chave, iv);
    const corpo = Buffer.concat([cifra.update(dado), cifra.final()]);
    const partes = [iv, cifra.getAuthTag(), corpo].map((p) => p.toString("base64"));
    return ["v1", ...partes].join(":");
}

export function decifrar(texto: string): Buffer {
    const [versao, iv, tag, corpo] = texto.split(":");
    if (versao !== "v1" || !iv || !tag || !corpo) {
        throw new Error("Segredo cifrado em formato desconhecido");
    }
    const decifra = createDecipheriv("aes-256-gcm", chave, Buffer.from(iv, "base64"));
    decifra.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decifra.update(Buffer.from(corpo, "base64")), decifra.final()]);
}
