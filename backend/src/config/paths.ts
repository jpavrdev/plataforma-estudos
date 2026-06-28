import path from "node:path";

// Diretorio onde ficam as imagens enviadas pelos usuarios (foto e capa do perfil).
// process.cwd() e /app tanto em dev (npm run dev) quanto em prod (node index.ts).
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const AVATARS_DIR = path.join(UPLOADS_DIR, "avatars");
export const COVERS_DIR = path.join(UPLOADS_DIR, "covers");
