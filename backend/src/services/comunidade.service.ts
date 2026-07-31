import { and, count, desc, eq, gt, inArray, notInArray, sql, sum, isNotNull } from "drizzle-orm";
import { db } from "../../db.ts";
import {
    communityPosts,
    communityPostTags,
    communityLikes,
    communityComments,
    userFollows,
    users,
    lessonProgress,
    questionAnswers,
    challengeSubmissions,
} from "../../schema.ts";
import { calcularXp, nivelPorXp } from "../domain/xp.ts";
import { apoiadoresAtivos, apoiadorAtivo } from "./apoiador.service.ts";
import { AppError } from "../errors/AppError.ts";
import type { z } from "zod";
import type { criarPostSchema, comentarSchema } from "../schemas/comunidade.schema.ts";

type DadosPost = z.infer<typeof criarPostSchema>;

// Nível de cada usuário da lista, em 3 queries agrupadas (não uma por autor).
export async function niveisDeUsuarios(userIds: string[]): Promise<Map<string, number>> {
    const niveis = new Map<string, number>();
    if (userIds.length === 0) return niveis;
    const [aulas, acertos, desafios] = await Promise.all([
        db
            .select({ userId: lessonProgress.userId, n: count() })
            .from(lessonProgress)
            .where(and(inArray(lessonProgress.userId, userIds), eq(lessonProgress.manual, false)))
            .groupBy(lessonProgress.userId),
        db
            .select({ userId: questionAnswers.userId, n: count() })
            .from(questionAnswers)
            .where(
                and(inArray(questionAnswers.userId, userIds), eq(questionAnswers.isCorrect, true)),
            )
            .groupBy(questionAnswers.userId),
        db
            .select({ userId: challengeSubmissions.userId, xp: sum(challengeSubmissions.xpEarned) })
            .from(challengeSubmissions)
            .where(
                and(
                    inArray(challengeSubmissions.userId, userIds),
                    gt(challengeSubmissions.xpEarned, 0),
                ),
            )
            .groupBy(challengeSubmissions.userId),
    ]);
    const paraMapa = (
        arr: { userId: string; n?: number | string; xp?: number | string | null }[],
    ) => new Map(arr.map((a) => [a.userId, Number(a.n ?? a.xp ?? 0)]));
    const a = paraMapa(aulas);
    const q = paraMapa(acertos);
    const d = paraMapa(desafios);
    for (const id of userIds) {
        const xp = calcularXp({
            aulas: a.get(id) ?? 0,
            questoes: q.get(id) ?? 0,
            desafiosXp: d.get(id) ?? 0,
        });
        niveis.set(id, nivelPorXp(xp));
    }
    return niveis;
}

type LinhaPost = {
    id: string;
    userId: string;
    kind: string;
    content: string;
    code: string | null;
    codeLanguage: string | null;
    imageUrl: string | null;
    createdAt: Date;
    authorName: string;
    authorUsername: string | null;
    authorAvatar: string | null;
};

// Contagem de curtidas e comentários por post, em duas queries agrupadas.
async function contagens(ids: string[]) {
    if (ids.length === 0)
        return { likes: new Map<string, number>(), comentarios: new Map<string, number>() };
    const [likes, comentarios] = await Promise.all([
        db
            .select({ postId: communityLikes.postId, n: count() })
            .from(communityLikes)
            .where(inArray(communityLikes.postId, ids))
            .groupBy(communityLikes.postId),
        db
            .select({ postId: communityComments.postId, n: count() })
            .from(communityComments)
            .where(inArray(communityComments.postId, ids))
            .groupBy(communityComments.postId),
    ]);
    return {
        likes: new Map(likes.map((l) => [l.postId, Number(l.n)])),
        comentarios: new Map(comentarios.map((c) => [c.postId, Number(c.n)])),
    };
}

// Enriquece linhas cruas de post com tags, contagens, curtida do usuário,
// nível do autor e selo de apoiador. Preserva a ordem recebida.
async function montarPosts(userId: string, linhas: LinhaPost[]) {
    const ids = linhas.map((l) => l.id);
    if (ids.length === 0) return [];
    const autores = [...new Set(linhas.map((l) => l.userId))];

    const [{ likes, comentarios }, tags, curtidos, niveis, apoiadores] = await Promise.all([
        contagens(ids),
        db
            .select({ postId: communityPostTags.postId, tag: communityPostTags.tag })
            .from(communityPostTags)
            .where(inArray(communityPostTags.postId, ids)),
        db
            .select({ postId: communityLikes.postId })
            .from(communityLikes)
            .where(and(eq(communityLikes.userId, userId), inArray(communityLikes.postId, ids))),
        niveisDeUsuarios(autores),
        apoiadoresAtivos(),
    ]);

    const tagsPorPost = new Map<string, string[]>();
    for (const t of tags) {
        const arr = tagsPorPost.get(t.postId) ?? [];
        arr.push(t.tag);
        tagsPorPost.set(t.postId, arr);
    }
    const curtidosSet = new Set(curtidos.map((c) => c.postId));

    return linhas.map((l) => ({
        id: l.id,
        kind: l.kind,
        content: l.content,
        code: l.code,
        codeLanguage: l.codeLanguage,
        imageUrl: l.imageUrl,
        createdAt: l.createdAt,
        tags: tagsPorPost.get(l.id) ?? [],
        likes: likes.get(l.id) ?? 0,
        comentarios: comentarios.get(l.id) ?? 0,
        curtido: curtidosSet.has(l.id),
        autor: {
            name: l.authorName,
            username: l.authorUsername,
            avatarUrl: l.authorAvatar,
            level: niveis.get(l.userId) ?? 1,
            apoiador: apoiadores.has(l.userId),
        },
    }));
}

const COLUNAS_POST = {
    id: communityPosts.id,
    userId: communityPosts.userId,
    kind: communityPosts.kind,
    content: communityPosts.content,
    code: communityPosts.code,
    codeLanguage: communityPosts.codeLanguage,
    imageUrl: communityPosts.imageUrl,
    createdAt: communityPosts.createdAt,
    authorName: users.name,
    authorUsername: users.username,
    authorAvatar: users.avatarUrl,
} as const;

type FiltroFeed =
    | "para-voce"
    | "recentes"
    | "em-alta"
    | "sem-resposta"
    | "seguindo"
    | "duvida"
    | "solucao"
    | "conquista";

export async function feed(userId: string, filtro: FiltroFeed, tag: string | null) {
    const cond = [];
    if (filtro === "duvida" || filtro === "solucao" || filtro === "conquista") {
        cond.push(eq(communityPosts.kind, filtro));
    }
    if (filtro === "seguindo") {
        const seguidos = await db
            .select({ id: userFollows.followingId })
            .from(userFollows)
            .where(eq(userFollows.followerId, userId));
        const idsSeguidos = seguidos.map((s) => s.id);
        cond.push(
            idsSeguidos.length > 0 ? inArray(communityPosts.userId, idsSeguidos) : sql`false`,
        );
    }
    if (filtro === "em-alta") {
        cond.push(gt(communityPosts.createdAt, new Date(Date.now() - 14 * 86400000)));
    }
    if (tag) {
        const comTag = db
            .select({ postId: communityPostTags.postId })
            .from(communityPostTags)
            .where(eq(communityPostTags.tag, tag.toLowerCase()));
        cond.push(inArray(communityPosts.id, comTag));
    }

    // "Em alta" e "sem resposta" ordenam/filtram por contagem, feita em JS sobre
    // uma janela maior; os demais filtros já saem prontos por data.
    const precisaJanela = filtro === "em-alta" || filtro === "sem-resposta";
    const linhas = (await db
        .select(COLUNAS_POST)
        .from(communityPosts)
        .innerJoin(users, eq(users.id, communityPosts.userId))
        .where(cond.length ? and(...cond) : undefined)
        .orderBy(desc(communityPosts.createdAt))
        .limit(precisaJanela ? 80 : 30)) as LinhaPost[];

    let posts = await montarPosts(userId, linhas);
    if (filtro === "sem-resposta") {
        posts = posts.filter((p) => p.comentarios === 0).slice(0, 30);
    } else if (filtro === "em-alta") {
        posts = posts
            .sort(
                (x, y) =>
                    y.likes + y.comentarios * 2 - (x.likes + x.comentarios * 2) ||
                    y.createdAt.getTime() - x.createdAt.getTime(),
            )
            .slice(0, 30);
    }
    return posts;
}

const TAG_RE = /^[a-z0-9-]{2,40}$/;

export async function criarPost(userId: string, dados: DadosPost) {
    // Anexar imagem é benefício de apoiador; barra aqui também (não só no upload)
    // para que uma URL reaproveitada de outro post não fure a regra.
    if (dados.imageUrl && !(await apoiadorAtivo(userId))) {
        throw new AppError(403, "Enviar imagens na comunidade é um benefício de apoiador.");
    }
    const tagsLimpa = [
        ...new Set(
            (dados.tags ?? []).map((t) => t.trim().toLowerCase()).filter((t) => TAG_RE.test(t)),
        ),
    ].slice(0, 5);

    const [post] = await db
        .insert(communityPosts)
        .values({
            userId,
            kind: dados.kind,
            content: dados.content.trim(),
            code: dados.code?.trim() || null,
            codeLanguage: dados.code?.trim() ? (dados.codeLanguage ?? null) : null,
            imageUrl: dados.imageUrl ?? null,
        })
        .returning();
    if (tagsLimpa.length) {
        await db
            .insert(communityPostTags)
            .values(tagsLimpa.map((tag) => ({ postId: post.id, tag })))
            .onConflictDoNothing();
    }
    return { id: post.id };
}

export async function alternarCurtida(userId: string, postId: string) {
    const [post] = await db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
    if (!post) throw new AppError(404, "Publicação não encontrada");

    const removidas = await db
        .delete(communityLikes)
        .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
        .returning({ id: communityLikes.id });
    if (removidas.length === 0) {
        await db.insert(communityLikes).values({ postId, userId }).onConflictDoNothing();
    }
    const [{ n }] = await db
        .select({ n: count() })
        .from(communityLikes)
        .where(eq(communityLikes.postId, postId));
    return { curtido: removidas.length === 0, likes: Number(n) };
}

export async function detalhePost(userId: string, postId: string) {
    const linhas = (await db
        .select(COLUNAS_POST)
        .from(communityPosts)
        .innerJoin(users, eq(users.id, communityPosts.userId))
        .where(eq(communityPosts.id, postId))) as LinhaPost[];
    const [post] = await montarPosts(userId, linhas);
    if (!post) throw new AppError(404, "Publicação não encontrada");

    const comentariosBrutos = await db
        .select({
            id: communityComments.id,
            userId: communityComments.userId,
            content: communityComments.content,
            createdAt: communityComments.createdAt,
            authorName: users.name,
            authorUsername: users.username,
            authorAvatar: users.avatarUrl,
        })
        .from(communityComments)
        .innerJoin(users, eq(users.id, communityComments.userId))
        .where(eq(communityComments.postId, postId))
        .orderBy(communityComments.createdAt);
    const niveis = await niveisDeUsuarios([...new Set(comentariosBrutos.map((c) => c.userId))]);

    return {
        ...post,
        comentariosLista: comentariosBrutos.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            autor: {
                name: c.authorName,
                username: c.authorUsername,
                avatarUrl: c.authorAvatar,
                level: niveis.get(c.userId) ?? 1,
            },
        })),
    };
}

export async function comentar(
    userId: string,
    postId: string,
    dados: z.infer<typeof comentarSchema>,
) {
    const [post] = await db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
    if (!post) throw new AppError(404, "Publicação não encontrada");
    const [c] = await db
        .insert(communityComments)
        .values({ postId, userId, content: dados.content.trim() })
        .returning({ id: communityComments.id });
    return { id: c.id };
}

// Dúvidas em aberto: posts do tipo dúvida que ainda não têm nenhum comentário.
export async function duvidasAbertas(): Promise<number> {
    const semResposta = db.select({ postId: communityComments.postId }).from(communityComments);
    const [linha] = await db
        .select({ n: count() })
        .from(communityPosts)
        .where(and(eq(communityPosts.kind, "duvida"), notInArray(communityPosts.id, semResposta)));
    return Number(linha?.n ?? 0);
}

export async function tagsPopulares() {
    const linhas = await db
        .select({ tag: communityPostTags.tag, n: count() })
        .from(communityPostTags)
        .groupBy(communityPostTags.tag)
        .orderBy(desc(count()))
        .limit(6);
    return linhas.map((l) => ({ tag: l.tag, count: Number(l.n) }));
}

// Discussões em alta: posts recentes com mais respostas.
export async function discussoesEmAlta() {
    const linhas = await db
        .select({
            id: communityPosts.id,
            content: communityPosts.content,
            comentarios: count(communityComments.id),
            tag: sql<string | null>`(
                SELECT ${communityPostTags.tag} FROM ${communityPostTags}
                WHERE ${communityPostTags.postId} = ${communityPosts.id} LIMIT 1
            )`,
        })
        .from(communityPosts)
        .leftJoin(communityComments, eq(communityComments.postId, communityPosts.id))
        .where(gt(communityPosts.createdAt, new Date(Date.now() - 30 * 86400000)))
        .groupBy(communityPosts.id)
        .orderBy(desc(count(communityComments.id)), desc(communityPosts.createdAt))
        .limit(4);
    return linhas
        .filter((l) => Number(l.comentarios) > 0)
        .map((l) => ({
            id: l.id,
            titulo: l.content.length > 70 ? l.content.slice(0, 70) + "..." : l.content,
            comentarios: Number(l.comentarios),
            tag: l.tag,
        }));
}

// Sugestões para seguir: usuários com perfil público que o usuário ainda não segue.
export async function sugestoesParaSeguir(userId: string) {
    const seguidos = await db
        .select({ id: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId));
    const excluir = [...seguidos.map((s) => s.id), userId];

    const candidatos = await db
        .select({
            id: users.id,
            name: users.name,
            username: users.username,
            avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(and(notInArray(users.id, excluir), isNotNull(users.username)))
        .orderBy(desc(users.createdAt))
        .limit(30);
    if (candidatos.length === 0) return [];

    const ids = candidatos.map((c) => c.id);
    const [niveis, respostas] = await Promise.all([
        niveisDeUsuarios(ids),
        db
            .select({ userId: communityComments.userId, n: count() })
            .from(communityComments)
            .where(inArray(communityComments.userId, ids))
            .groupBy(communityComments.userId),
    ]);
    const respostasMap = new Map(respostas.map((r) => [r.userId, Number(r.n)]));

    return candidatos
        .map((c) => ({
            username: c.username,
            name: c.name,
            avatarUrl: c.avatarUrl,
            level: niveis.get(c.id) ?? 1,
            respostas: respostasMap.get(c.id) ?? 0,
        }))
        .sort((a, b) => b.level - a.level || b.respostas - a.respostas)
        .slice(0, 3);
}

export async function estadoSeguir(
    followerId: string,
    username: string,
): Promise<{ seguindo: boolean }> {
    const [alvo] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!alvo) throw new AppError(404, "Usuário não encontrado");
    if (alvo.id === followerId) return { seguindo: false };
    const [rel] = await db
        .select({ id: userFollows.id })
        .from(userFollows)
        .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, alvo.id)));
    return { seguindo: Boolean(rel) };
}

export async function seguir(followerId: string, username: string) {
    const [alvo] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!alvo) throw new AppError(404, "Usuário não encontrado");
    if (alvo.id === followerId) throw new AppError(400, "Você não pode seguir a si mesmo.");
    await db.insert(userFollows).values({ followerId, followingId: alvo.id }).onConflictDoNothing();
    return { seguindo: true };
}

export async function deixarDeSeguir(followerId: string, username: string) {
    const [alvo] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!alvo) throw new AppError(404, "Usuário não encontrado");
    await db
        .delete(userFollows)
        .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, alvo.id)));
    return { seguindo: false };
}
