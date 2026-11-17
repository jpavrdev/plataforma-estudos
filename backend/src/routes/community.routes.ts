import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { communityWriteLimiter, uploadLimiter } from "../middlewares/rateLimit.ts";
import {
    getFeed,
    createPost,
    uploadImage,
    likePost,
    likeComment,
    getPost,
    createComment,
    getSidebar,
    getFollowState,
    followUser,
    unfollowUser,
} from "../controllers/CommunityController.ts";

const router = Router();

router.get("/comunidade/feed", authenticate, getFeed);
router.get("/comunidade/lateral", authenticate, getSidebar);
router.post("/comunidade/imagem", authenticate, uploadLimiter, uploadImage);
router.post("/comunidade/posts", authenticate, communityWriteLimiter, createPost);
router.get("/comunidade/posts/:id", authenticate, getPost);
router.post("/comunidade/posts/:id/curtir", authenticate, likePost);
router.post(
    "/comunidade/posts/:id/comentarios",
    authenticate,
    communityWriteLimiter,
    createComment,
);
router.post("/comunidade/comentarios/:id/curtir", authenticate, likeComment);
router.get("/comunidade/seguir/:username", authenticate, getFollowState);
router.post("/comunidade/seguir/:username", authenticate, followUser);
router.delete("/comunidade/seguir/:username", authenticate, unfollowUser);

export default router;
