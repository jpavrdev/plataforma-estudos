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

export type ImageResult = { ok: true; url: string } | { ok: false; erro: string };

// Decodes a data URL (base64) and writes it to disk with a random name. The name
// never comes from the client, so there is no risk of path traversal or overwriting.
export async function saveImage(
    dataUrl: unknown,
    destDir: string,
    baseUrl: string,
    maxBytes = MAX_IMG_BYTES,
): Promise<ImageResult> {
    if (typeof dataUrl !== "string") return { ok: false, erro: "image.missing" };
    const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
    if (!m) return { ok: false, erro: "image.invalidFormat" };
    const ext = MIME_EXT[m[1].toLowerCase()];
    if (!ext) return { ok: false, erro: "image.unsupportedType" };
    const buffer = Buffer.from(m[2], "base64");
    if (buffer.length === 0) return { ok: false, erro: "image.empty" };
    if (buffer.length > maxBytes)
        return { ok: false, erro: `Imagem muito grande (maximo ${Math.round(maxBytes / 1024 / 1024)}MB)` };
    await mkdir(destDir, { recursive: true });
    const fileName = `${randomUUID()}.${ext}`;
    await writeFile(path.join(destDir, fileName), buffer);
    return { ok: true, url: `${baseUrl}/${fileName}` };
}

// Removes (best effort) the old local file when the image changes, avoiding orphans.
export async function removeLocalFile(url: string | null) {
    if (!url || !url.startsWith("/uploads/")) return;
    try {
        await unlink(path.join(UPLOADS_DIR, url.slice("/uploads/".length)));
    } catch (e) {
        // Already removed or never there: the new image is saved anyway.
        console.warn("Could not remove the old image file:", url, e);
    }
}
