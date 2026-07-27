import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { UPLOADS_DIR } from "../config/paths.ts";

const MIME_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
};
export const MAX_IMG_BYTES = 4 * 1024 * 1024; // 4MB

export type ResultadoImagem = { ok: true; url: string } | { ok: false; erro: string };

// Decodifica uma data URL (base64) e grava em disco com nome aleatorio. O nome
// nunca vem do cliente, entao nao ha risco de path traversal nem sobrescrita.
export async function salvarImagem(
    dataUrl: unknown,
    destDir: string,
    urlBase: string,
    maxBytes = MAX_IMG_BYTES,
): Promise<ResultadoImagem> {
    if (typeof dataUrl !== "string") return { ok: false, erro: "Imagem ausente" };
    const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
    if (!m) return { ok: false, erro: "Formato de imagem invalido" };
    const ext = MIME_EXT[m[1].toLowerCase()];
    if (!ext) return { ok: false, erro: "Use uma imagem PNG, JPG ou WEBP" };
    const buffer = Buffer.from(m[2], "base64");
    if (buffer.length === 0) return { ok: false, erro: "Imagem vazia" };
    if (buffer.length > maxBytes)
        return { ok: false, erro: `Imagem muito grande (maximo ${Math.round(maxBytes / 1024 / 1024)}MB)` };
    await mkdir(destDir, { recursive: true });
    const nome = `${randomUUID()}.${ext}`;
    await writeFile(path.join(destDir, nome), buffer);
    return { ok: true, url: `${urlBase}/${nome}` };
}

// Remove (best-effort) o arquivo local antigo ao trocar a imagem, evitando orfaos.
export async function removerArquivoLocal(url: string | null) {
    if (!url || !url.startsWith("/uploads/")) return;
    try {
        await unlink(path.join(UPLOADS_DIR, url.slice("/uploads/".length)));
    } catch {
        // arquivo ja removido ou inexistente: ignora
    }
}
