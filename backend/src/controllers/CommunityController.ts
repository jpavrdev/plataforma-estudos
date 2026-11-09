import type { Request, Response, NextFunction } from "express";
import { createPostSchema, commentSchema } from "../schemas/community.schema.ts";
import { saveImage } from "../services/images.ts";
import { apoiadorAtivo } from "../services/supporter.service.ts";
import { COMMUNITY_DIR } from "../config/paths.ts";
import {
    feed,
    insertPost,
    togglePostLike,
    toggleCommentLike,
    postDetail,
    insertComment,
    popularTags,
    hotDiscussions,
    followSuggestions,
    openQuestions,
    followState,
    follow,
    unfollow,
} from "../services/community.service.ts";

const FILTERS = [
    "para-voce",
    "recentes",
    "em-alta",
    "sem-resposta",
    "seguindo",
    "duvida",
    "solucao",
    "conquista",
] as const;

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawFilter = String(req.query.filtro ?? "para-voce");
        const filter = (FILTERS as readonly string[]).includes(rawFilter)
            ? (rawFilter as (typeof FILTERS)[number])
            : "para-voce";
        const tag = req.query.tag ? String(req.query.tag).toLowerCase() : null;
        res.json(await feed(req.userId!, filter, tag));
    } catch (err) {
        next(err);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createPostSchema.parse(req.body);
        res.status(201).json(await insertPost(req.userId!, data));
    } catch (err) {
        next(err);
    }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(await apoiadorAtivo(req.userId!))) {
            return res.status(403).json({ erro: "community.imagesForSupporters" });
        }
        const saved = await saveImage(req.body?.image, COMMUNITY_DIR, "/uploads/comunidade");
        if (!saved.ok) return res.status(400).json({ erro: saved.erro });
        res.json({ url: saved.url });
    } catch (err) {
        next(err);
    }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await togglePostLike(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await postDetail(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await toggleCommentLike(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = commentSchema.parse(req.body);
        res.status(201).json(await insertComment(req.userId!, String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const getSidebar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [topics, discussions, suggestions, questions] = await Promise.all([
            popularTags(),
            hotDiscussions(),
            followSuggestions(req.userId!),
            openQuestions(),
        ]);
        res.json({
            topicos: topics,
            discussoes: discussions,
            sugestoes: suggestions,
            duvidasAbertas: questions,
        });
    } catch (err) {
        next(err);
    }
};

export const getFollowState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await followState(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await follow(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await unfollow(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};
