import { and, count, desc, eq, gt, inArray, isNotNull, notInArray, sql, sum } from "drizzle-orm";
import { db } from "../../db.ts";
import {
    communityPosts,
    communityPostTags,
    communityLikes,
    communityComments,
    communityCommentLikes,
    userFollows,
    users,
    lessonProgress,
    questionAnswers,
    challengeSubmissions,
} from "../../schema.ts";
import { computeXp, levelFromXp } from "../domain/xp.ts";
import { activeSupporters, supportActive } from "./supporter.service.ts";
import { AppError } from "../errors/AppError.ts";
import type { z } from "zod";
import type { createPostSchema, commentSchema } from "../schemas/community.schema.ts";

type PostInput = z.infer<typeof createPostSchema>;

// Level of each user in the list, in 3 grouped queries (not one per author).
export async function userLevels(userIds: string[]): Promise<Map<string, number>> {
    const levels = new Map<string, number>();
    if (userIds.length === 0) return levels;
    const [lessons, correct, challenges] = await Promise.all([
        db
            .select({ userId: lessonProgress.userId, n: count() })
            .from(lessonProgress)
            .where(and(inArray(lessonProgress.userId, userIds), eq(lessonProgress.manual, false)))
            .groupBy(lessonProgress.userId),
        db
            .select({ userId: questionAnswers.userId, n: count() })
            .from(questionAnswers)
            .where(
                and(inArray(questionAnswers.userId, userIds), isNotNull(questionAnswers.acertouEm)),
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
    const toMap = (arr: { userId: string; n?: number | string; xp?: number | string | null }[]) =>
        new Map(arr.map((a) => [a.userId, Number(a.n ?? a.xp ?? 0)]));
    const lessonCounts = toMap(lessons);
    const correctCounts = toMap(correct);
    const challengeCounts = toMap(challenges);
    for (const id of userIds) {
        const xp = computeXp({
            aulas: lessonCounts.get(id) ?? 0,
            questoes: correctCounts.get(id) ?? 0,
            desafiosXp: challengeCounts.get(id) ?? 0,
        });
        levels.set(id, levelFromXp(xp));
    }
    return levels;
}

type PostRow = {
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

// Like and comment counts per post, in two grouped queries.
async function counts(ids: string[]) {
    if (ids.length === 0)
        return { likes: new Map<string, number>(), commentCount: new Map<string, number>() };
    const [likeRows, commentRows] = await Promise.all([
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
        likes: new Map(likeRows.map((l) => [l.postId, Number(l.n)])),
        commentCount: new Map(commentRows.map((c) => [c.postId, Number(c.n)])),
    };
}

// Enriches raw post rows with tags, counts, the user's like, the author's level
// and supporter badge. Preserves the order received.
async function assemblePosts(userId: string, rows: PostRow[]) {
    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];
    const authors = [...new Set(rows.map((r) => r.userId))];

    const [{ likes, commentCount }, tags, likedRows, levels, supporters] = await Promise.all([
        counts(ids),
        db
            .select({ postId: communityPostTags.postId, tag: communityPostTags.tag })
            .from(communityPostTags)
            .where(inArray(communityPostTags.postId, ids)),
        db
            .select({ postId: communityLikes.postId })
            .from(communityLikes)
            .where(and(eq(communityLikes.userId, userId), inArray(communityLikes.postId, ids))),
        userLevels(authors),
        activeSupporters(),
    ]);

    const tagsByPost = new Map<string, string[]>();
    for (const t of tags) {
        const arr = tagsByPost.get(t.postId) ?? [];
        arr.push(t.tag);
        tagsByPost.set(t.postId, arr);
    }
    const likedSet = new Set(likedRows.map((l) => l.postId));

    return rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        content: r.content,
        code: r.code,
        codeLanguage: r.codeLanguage,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
        tags: tagsByPost.get(r.id) ?? [],
        likes: likes.get(r.id) ?? 0,
        comentarios: commentCount.get(r.id) ?? 0,
        curtido: likedSet.has(r.id),
        autor: {
            name: r.authorName,
            username: r.authorUsername,
            avatarUrl: r.authorAvatar,
            level: levels.get(r.userId) ?? 1,
            apoiador: supporters.has(r.userId),
        },
    }));
}

const POST_COLUMNS = {
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

type FeedFilter =
    | "para-voce"
    | "recentes"
    | "em-alta"
    | "sem-resposta"
    | "seguindo"
    | "duvida"
    | "solucao"
    | "conquista";

export async function feed(userId: string, filter: FeedFilter, tag: string | null) {
    const conditions = [];
    if (filter === "duvida" || filter === "solucao" || filter === "conquista") {
        conditions.push(eq(communityPosts.kind, filter));
    }
    if (filter === "seguindo") {
        const followedRows = await db
            .select({ id: userFollows.followingId })
            .from(userFollows)
            .where(eq(userFollows.followerId, userId));
        const followedIds = followedRows.map((f) => f.id);
        conditions.push(
            followedIds.length > 0 ? inArray(communityPosts.userId, followedIds) : sql`false`,
        );
    }
    if (filter === "em-alta") {
        conditions.push(gt(communityPosts.createdAt, new Date(Date.now() - 14 * 86400000)));
    }
    if (tag) {
        const withTag = db
            .select({ postId: communityPostTags.postId })
            .from(communityPostTags)
            .where(eq(communityPostTags.tag, tag.toLowerCase()));
        conditions.push(inArray(communityPosts.id, withTag));
    }

    // "Em alta" and "sem resposta" sort/filter by count, done in JS over a larger
    // window; the other filters are already fine coming out ordered by date.
    const needsWindow = filter === "em-alta" || filter === "sem-resposta";
    const rows = (await db
        .select(POST_COLUMNS)
        .from(communityPosts)
        .innerJoin(users, eq(users.id, communityPosts.userId))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(communityPosts.createdAt))
        .limit(needsWindow ? 80 : 30)) as PostRow[];

    let posts = await assemblePosts(userId, rows);
    if (filter === "sem-resposta") {
        posts = posts.filter((p) => p.comentarios === 0).slice(0, 30);
    } else if (filter === "em-alta") {
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

export async function insertPost(userId: string, data: PostInput) {
    // Attaching an image is a supporter benefit; blocked here too (not only at
    // upload) so a URL reused from another post cannot bypass the rule.
    if (data.imageUrl && !(await supportActive(userId))) {
        throw new AppError(403, "community.imagesForSupporters");
    }
    const cleanTags = [
        ...new Set(
            (data.tags ?? []).map((t) => t.trim().toLowerCase()).filter((t) => TAG_RE.test(t)),
        ),
    ].slice(0, 5);

    const [post] = await db
        .insert(communityPosts)
        .values({
            userId,
            kind: data.kind,
            content: data.content.trim(),
            code: data.code?.trim() || null,
            codeLanguage: data.code?.trim() ? (data.codeLanguage ?? null) : null,
            imageUrl: data.imageUrl ?? null,
        })
        .returning();
    if (cleanTags.length) {
        await db
            .insert(communityPostTags)
            .values(cleanTags.map((tag) => ({ postId: post.id, tag })))
            .onConflictDoNothing();
    }
    return { id: post.id };
}

export async function togglePostLike(userId: string, postId: string) {
    const [post] = await db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
    if (!post) throw new AppError(404, "community.postNotFound");

    const removed = await db
        .delete(communityLikes)
        .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
        .returning({ id: communityLikes.id });
    if (removed.length === 0) {
        await db.insert(communityLikes).values({ postId, userId }).onConflictDoNothing();
    }
    const [{ n }] = await db
        .select({ n: count() })
        .from(communityLikes)
        .where(eq(communityLikes.postId, postId));
    return { curtido: removed.length === 0, likes: Number(n) };
}

export async function postDetail(userId: string, postId: string) {
    const rows = (await db
        .select(POST_COLUMNS)
        .from(communityPosts)
        .innerJoin(users, eq(users.id, communityPosts.userId))
        .where(eq(communityPosts.id, postId))) as PostRow[];
    const [post] = await assemblePosts(userId, rows);
    if (!post) throw new AppError(404, "community.postNotFound");

    const rawComments = await db
        .select({
            id: communityComments.id,
            userId: communityComments.userId,
            parentId: communityComments.parentId,
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

    const commentIds = rawComments.map((c) => c.id);
    const [levels, commentLikeRows, likedByMeRows] = await Promise.all([
        userLevels([...new Set(rawComments.map((c) => c.userId))]),
        commentIds.length
            ? db
                  .select({ commentId: communityCommentLikes.commentId, n: count() })
                  .from(communityCommentLikes)
                  .where(inArray(communityCommentLikes.commentId, commentIds))
                  .groupBy(communityCommentLikes.commentId)
            : [],
        commentIds.length
            ? db
                  .select({ commentId: communityCommentLikes.commentId })
                  .from(communityCommentLikes)
                  .where(
                      and(
                          eq(communityCommentLikes.userId, userId),
                          inArray(communityCommentLikes.commentId, commentIds),
                      ),
                  )
            : [],
    ]);
    const likesByComment = new Map(commentLikeRows.map((l) => [l.commentId, Number(l.n)]));
    const likedSet = new Set(likedByMeRows.map((l) => l.commentId));

    return {
        ...post,
        comentariosLista: rawComments.map((c) => ({
            id: c.id,
            parentId: c.parentId,
            content: c.content,
            createdAt: c.createdAt,
            likes: likesByComment.get(c.id) ?? 0,
            curtido: likedSet.has(c.id),
            autor: {
                name: c.authorName,
                username: c.authorUsername,
                avatarUrl: c.authorAvatar,
                level: levels.get(c.userId) ?? 1,
            },
        })),
    };
}

export async function insertComment(
    userId: string,
    postId: string,
    data: z.infer<typeof commentSchema>,
) {
    const [post] = await db
        .select({ id: communityPosts.id })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
    if (!post) throw new AppError(404, "community.postNotFound");

    // Reply to a comment: the thread is one level deep, so replying to a reply
    // hangs off that reply's top-level comment.
    let parentId: string | null = null;
    if (data.parentId) {
        const [parent] = await db
            .select({
                id: communityComments.id,
                postId: communityComments.postId,
                parentId: communityComments.parentId,
            })
            .from(communityComments)
            .where(eq(communityComments.id, data.parentId));
        if (!parent || parent.postId !== postId) {
            throw new AppError(404, "community.commentNotFound");
        }
        parentId = parent.parentId ?? parent.id;
    }

    const [c] = await db
        .insert(communityComments)
        .values({ postId, userId, parentId, content: data.content.trim() })
        .returning({ id: communityComments.id });
    return { id: c.id };
}

export async function toggleCommentLike(userId: string, commentId: string) {
    const [comment] = await db
        .select({ id: communityComments.id })
        .from(communityComments)
        .where(eq(communityComments.id, commentId));
    if (!comment) throw new AppError(404, "community.commentNotFound");

    const removed = await db
        .delete(communityCommentLikes)
        .where(
            and(
                eq(communityCommentLikes.commentId, commentId),
                eq(communityCommentLikes.userId, userId),
            ),
        )
        .returning({ id: communityCommentLikes.id });
    if (removed.length === 0) {
        await db.insert(communityCommentLikes).values({ commentId, userId }).onConflictDoNothing();
    }
    const [{ n }] = await db
        .select({ n: count() })
        .from(communityCommentLikes)
        .where(eq(communityCommentLikes.commentId, commentId));
    return { curtido: removed.length === 0, likes: Number(n) };
}

// Open questions: duvida posts that do not have any comment yet.
export async function openQuestions(): Promise<number> {
    const withComments = db.select({ postId: communityComments.postId }).from(communityComments);
    const [row] = await db
        .select({ n: count() })
        .from(communityPosts)
        .where(and(eq(communityPosts.kind, "duvida"), notInArray(communityPosts.id, withComments)));
    return Number(row?.n ?? 0);
}

export async function popularTags() {
    const rows = await db
        .select({ tag: communityPostTags.tag, n: count() })
        .from(communityPostTags)
        .groupBy(communityPostTags.tag)
        .orderBy(desc(count()))
        .limit(6);
    return rows.map((r) => ({ tag: r.tag, count: Number(r.n) }));
}

// Hot discussions: recent posts with the most replies.
export async function hotDiscussions() {
    const rows = await db
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
    return rows
        .filter((r) => Number(r.comentarios) > 0)
        .map((r) => ({
            id: r.id,
            titulo: r.content.length > 70 ? r.content.slice(0, 70) + "..." : r.content,
            comentarios: Number(r.comentarios),
            tag: r.tag,
        }));
}

// Follow suggestions: public-profile users the user does not follow yet.
export async function followSuggestions(userId: string) {
    const followedRows = await db
        .select({ id: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId));
    const exclude = [...followedRows.map((f) => f.id), userId];

    const candidates = await db
        .select({
            id: users.id,
            name: users.name,
            username: users.username,
            avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(and(notInArray(users.id, exclude), isNotNull(users.username)))
        .orderBy(desc(users.createdAt))
        .limit(30);
    if (candidates.length === 0) return [];

    const ids = candidates.map((c) => c.id);
    const [levels, answers] = await Promise.all([
        userLevels(ids),
        db
            .select({ userId: communityComments.userId, n: count() })
            .from(communityComments)
            .where(inArray(communityComments.userId, ids))
            .groupBy(communityComments.userId),
    ]);
    const answersMap = new Map(answers.map((a) => [a.userId, Number(a.n)]));

    return candidates
        .map((c) => ({
            username: c.username,
            name: c.name,
            avatarUrl: c.avatarUrl,
            level: levels.get(c.id) ?? 1,
            respostas: answersMap.get(c.id) ?? 0,
        }))
        .sort((a, b) => b.level - a.level || b.respostas - a.respostas)
        .slice(0, 3);
}

export async function followState(
    followerId: string,
    username: string,
): Promise<{ seguindo: boolean }> {
    const [target] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!target) throw new AppError(404, "user.notFound");
    if (target.id === followerId) return { seguindo: false };
    const [rel] = await db
        .select({ id: userFollows.id })
        .from(userFollows)
        .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, target.id)));
    return { seguindo: Boolean(rel) };
}

export async function follow(followerId: string, username: string) {
    const [target] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!target) throw new AppError(404, "user.notFound");
    if (target.id === followerId) throw new AppError(400, "community.cannotFollowSelf");
    await db
        .insert(userFollows)
        .values({ followerId, followingId: target.id })
        .onConflictDoNothing();
    return { seguindo: true };
}

export async function unfollow(followerId: string, username: string) {
    const [target] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username));
    if (!target) throw new AppError(404, "user.notFound");
    await db
        .delete(userFollows)
        .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, target.id)));
    return { seguindo: false };
}
