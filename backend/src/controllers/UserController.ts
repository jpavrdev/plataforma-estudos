import type { Request, Response, NextFunction } from "express";
import { db } from "../../db.ts";
import { users, languages as languagesTable } from "../../schema.ts";
import { eq } from "drizzle-orm";
import { updateMeSchema, completarPerfilSchema, metaSemanalSchema } from "../schemas/auth.schema.ts";
import { AVATARS_DIR, COVERS_DIR, FUNDOS_DIR } from "../config/paths.ts";
import { salvarImagem, removerArquivoLocal } from "../services/imagens.ts";
import { streakDoUsuario } from "../services/streak.ts";
import { calcularEstatisticas } from "../services/stats.service.ts";
import { perfilPublico } from "../services/perfil-publico.service.ts";
import { progressoDoUsuario, definirMetaSemanal, limparMetaSemanal } from "../services/progresso.service.ts";
import { apoiadorAtivo } from "../services/apoiador.service.ts";

const publicUserColumns = {
    id: users.id,
    name: users.name,
    username: users.username,
    usernameChangedAt: users.usernameChangedAt,
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
    x: users.x,
    avatarUrl: users.avatarUrl,
    coverUrl: users.coverUrl,
    role: users.role,
    createdAt: users.createdAt,
    accent: users.accent,
    backgroundUrl: users.backgroundUrl,
    backgroundDim: users.backgroundDim,
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
        streak = await streakDoUsuario(userId);
    } catch (e) {
        console.error("getMe: falha ao calcular streak", e);
    }

    let level = 1;
    try {
        level = (await calcularEstatisticas(userId)).level;
    } catch (e) {
        console.error("getMe: falha ao calcular nível", e);
    }

    let apoiador = false;
    try {
        apoiador = await apoiadorAtivo(userId);
    } catch (e) {
        console.error("getMe: falha ao checar apoio", e);
    }

    res.json({ ...user, streak, level, apoiador });
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
            name?: string;
            username?: string;
            usernameChangedAt?: Date;
            bio?: string;
            location?: string;
            occupation?: string;
            languages?: string[];
            github?: string;
            linkedin?: string;
            x?: string;
        } = {};
        if (dados.name !== undefined) sets.name = dados.name;
        if (dados.bio !== undefined) sets.bio = dados.bio;
        if (dados.location !== undefined) sets.location = dados.location;
        if (dados.occupation !== undefined) sets.occupation = dados.occupation;
        if (dados.languages !== undefined) sets.languages = dados.languages;
        if (dados.github !== undefined) sets.github = dados.github;
        if (dados.linkedin !== undefined) sets.linkedin = dados.linkedin;
        if (dados.x !== undefined) sets.x = dados.x;

        // Username: só troca uma vez a cada 30 dias (a primeira troca é livre).
        if (dados.username !== undefined) {
            const novo = dados.username.toLowerCase();
            const [atual] = await db
                .select({ username: users.username, usernameChangedAt: users.usernameChangedAt })
                .from(users)
                .where(eq(users.id, userId));
            if (atual && novo !== atual.username) {
                const TRAVA_MS = 30 * 24 * 60 * 60 * 1000;
                if (atual.usernameChangedAt) {
                    const desde = Date.now() - atual.usernameChangedAt.getTime();
                    if (desde < TRAVA_MS) {
                        const libera = new Date(atual.usernameChangedAt.getTime() + TRAVA_MS);
                        return res.status(429).json({
                            erro: `Você só poderá mudar o usuário novamente em ${libera.toLocaleDateString("pt-BR")}.`,
                        });
                    }
                }
                const [existe] = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.username, novo));
                if (existe && existe.id !== userId) {
                    return res.status(409).json({ erro: "Esse nome de usuário já está em uso" });
                }
                sets.username = novo;
                sets.usernameChangedAt = new Date();
            }
        }

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

export const removerAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        const [atual] = await db
            .select({ avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ avatarUrl: null })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removerArquivoLocal(atual?.avatarUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removerCover = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        const [atual] = await db
            .select({ coverUrl: users.coverUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ coverUrl: null })
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

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await perfilPublico(String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const getMyProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bruto = String(req.query.periodo ?? "30");
        let periodo: number | null = bruto === "7" ? 7 : bruto === "tudo" ? null : 30;
        // Períodos longos são benefício de apoiador; sem apoio, cai no padrão de 30.
        if (bruto === "90" || bruto === "365") {
            periodo = (await apoiadorAtivo(req.userId!)) ? Number(bruto) : 30;
        }
        res.json(await progressoDoUsuario(req.userId!, periodo));
    } catch (err) {
        next(err);
    }
};

export const setWeeklyGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { kind, target } = metaSemanalSchema.parse(req.body);
        await definirMetaSemanal(req.userId!, kind, target);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const clearWeeklyGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await limparMetaSemanal(req.userId!);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};


export const uploadBackground = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        if (!(await apoiadorAtivo(userId))) {
            return res.status(403).json({ erro: "Imagem de fundo é um benefício de apoiador." });
        }
        const r = await salvarImagem(req.body?.image, FUNDOS_DIR, "/uploads/fundos", 10 * 1024 * 1024);
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        const [atual] = await db
            .select({ backgroundUrl: users.backgroundUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ backgroundUrl: r.url })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removerArquivoLocal(atual?.backgroundUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const removerBackground = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ erro: "Nao autenticado" });
    try {
        const [atual] = await db
            .select({ backgroundUrl: users.backgroundUrl })
            .from(users)
            .where(eq(users.id, userId));
        const [user] = await db
            .update(users)
            .set({ backgroundUrl: null })
            .where(eq(users.id, userId))
            .returning(publicUserColumns);
        await removerArquivoLocal(atual?.backgroundUrl ?? null);
        res.json(user);
    } catch (err) {
        next(err);
    }
};
