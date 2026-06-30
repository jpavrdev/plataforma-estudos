import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { db } from "../../db.ts";
import { users, languages as languagesTable } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { updateMeSchema, completarPerfilSchema } from "../schemas/auth.schema.ts";
import { UPLOADS_DIR, AVATARS_DIR, COVERS_DIR } from "../config/paths.ts";
import { calcularStreak, diasAtivosDoUsuario } from "../services/streak.ts";
import { calcularEstatisticas } from "../services/stats.service.ts";

const publicUserColumns = {
    id: users.id,
    name: users.name,
    username: users.username,
    email: users.email,
    birthDate: users.birthDate,
    gender: users.gender,
    phone: users.phone,
    bio: users.bio,
    location: users.location,
    occupation: users.occupation,
    languages: users.languages,
    github: users.github,
    linkedin: users.linkedin,
    avatarUrl: users.avatarUrl,
    coverUrl: users.coverUrl,
    role: users.role,
    createdAt: users.createdAt,
};

export const getMe = async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const encontrados = await db.select(publicUserColumns).from(users).where(eq(users.id, userId));

    const user = encontrados[0];

    if (!user) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // streak e nível são derivados: se falharem, logamos e seguimos com o fallback
    // em vez de quebrar o perfil inteiro.
    let streak = 0;
    try {
        streak = calcularStreak(await diasAtivosDoUsuario(userId));
    } catch (e) {
        console.error("getMe: falha ao calcular streak", e);
    }

    let level = 1;
    try {
        level = (await calcularEstatisticas(userId)).level;
    } catch (e) {
        console.error("getMe: falha ao calcular nível", e);
    }

    res.json({ ...user, streak, level });
};

// Atualiza o próprio perfil (campos editáveis). Não toca em campos sensíveis.
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ erro: "Não autenticado" });
    }
    try {
        const dados = updateMeSchema.parse(req.body);
        // Linguagens precisam existir no conjunto canonico (gerenciado no admin),
        // pra manter os dados padronizados para analises futuras.
        if (dados.languages && dados.languages.length > 0) {
            const validas = await db.select({ name: languagesTable.name }).from(languagesTable);
            const conjunto = new Set(validas.map((l) => l.name));
            const invalida = dados.languages.find((l) => !conjunto.has(l));
            if (invalida) {
                return res.status(400).json({ erro: `Linguagem inválida: ${invalida}` });
            }
        }
        const sets: {
            bio?: string;
            location?: string;
            occupation?: string;
            languages?: string[];
            github?: string;
            linkedin?: string;
        } = {};
        if (dados.bio !== undefined) sets.bio = dados.bio;
        if (dados.location !== undefined) sets.location = dados.location;
        if (dados.occupation !== undefined) sets.occupation = dados.occupation;
        if (dados.languages !== undefined) sets.languages = dados.languages;
        if (dados.github !== undefined) sets.github = dados.github;
        if (dados.linkedin !== undefined) sets.linkedin = dados.linkedin;
        if (Object.keys(sets).length === 0) {
            return res.status(400).json({ erro: "Nada para atualizar" });
        }
        const [user] = await db
            .update(users)
            .set(sets)
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// Completa nascimento, gênero e telefone (ex.: após o primeiro login social).
export const completarPerfil = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ erro: "Não autenticado" });
    }
    try {
        const dados = completarPerfilSchema.parse(req.body);
        const username = dados.username.toLowerCase();
        const [existeUsername] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username));
        if (existeUsername && existeUsername.id !== userId) {
            return res.status(409).json({ erro: "Esse nome de usuário já está em uso" });
        }
        const [user] = await db
            .update(users)
            .set({
                username,
                birthDate: dados.birthDate,
                gender: dados.gender,
                phone: dados.phone,
            })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const MIME_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
};
const MAX_IMG_BYTES = 4 * 1024 * 1024; // 4MB

type ResultadoImagem = { ok: true; url: string } | { ok: false; erro: string };

// Decodifica uma data URL (base64) e grava em disco com nome aleatorio. O nome
// nunca vem do cliente, entao nao ha risco de path traversal nem sobrescrita.
async function salvarImagem(
    dataUrl: unknown,
    destDir: string,
    urlBase: string,
): Promise<ResultadoImagem> {
    if (typeof dataUrl !== "string") return { ok: false, erro: "Imagem ausente" };
    const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
    if (!m) return { ok: false, erro: "Formato de imagem invalido" };
    const ext = MIME_EXT[m[1].toLowerCase()];
    if (!ext) return { ok: false, erro: "Use uma imagem PNG, JPG ou WEBP" };
    const buffer = Buffer.from(m[2], "base64");
    if (buffer.length === 0) return { ok: false, erro: "Imagem vazia" };
    if (buffer.length > MAX_IMG_BYTES)
        return { ok: false, erro: "Imagem muito grande (maximo 4MB)" };
    await mkdir(destDir, { recursive: true });
    const nome = `${randomUUID()}.${ext}`;
    await writeFile(path.join(destDir, nome), buffer);
    return { ok: true, url: `${urlBase}/${nome}` };
}

// Remove (best-effort) o arquivo local antigo ao trocar a imagem, evitando orfaos.
async function removerArquivoLocal(url: string | null) {
    if (!url || !url.startsWith("/uploads/")) return;
    try {
        await unlink(path.join(UPLOADS_DIR, url.slice("/uploads/".length)));
    } catch {
        // arquivo ja removido ou inexistente: ignora
    }
}

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        const r = await salvarImagem(req.body?.image, AVATARS_DIR, "/uploads/avatars");
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [atual] = await db
            .select({ avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ avatarUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removerArquivoLocal(atual?.avatarUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const uploadCover = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        const r = await salvarImagem(req.body?.image, COVERS_DIR, "/uploads/covers");
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [atual] = await db
            .select({ coverUrl: users.coverUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ coverUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removerArquivoLocal(atual?.coverUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    const allUsers = await db.select(publicUserColumns).from(users);

    res.json(allUsers);
};
