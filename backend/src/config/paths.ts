import path from "node:path";

// Folder for the images users upload (profile photo and cover).
// process.cwd() is /app both in dev (npm run dev) and in prod (node index.ts).
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const AVATARS_DIR = path.join(UPLOADS_DIR, "avatars");
export const COVERS_DIR = path.join(UPLOADS_DIR, "covers");
export const BACKGROUNDS_DIR = path.join(UPLOADS_DIR, "fundos");
export const COMMUNITY_DIR = path.join(UPLOADS_DIR, "comunidade");
// Books (EPUB) built from the tracks, cached with a content hash in the name.
export const BOOKS_DIR = path.join(UPLOADS_DIR, "livros");
