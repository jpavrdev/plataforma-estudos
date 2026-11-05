import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { communityWriteLimiter, uploadLimiter } from "../middlewares/rateLimit.ts";
import {
    getFeed,
    postar,
    enviarImagem,
    curtir,
    curtirComentario,
    getPost,
    comentarPost,
    getBarraLateral,
    estadoSeguirUsuario,
    seguirUsuario,
    deixarDeSeguirUsuario,
} from "../controllers/ComunidadeController.ts";

const router = Router();

router.get("/comunidade/feed", authenticate, getFeed);
router.get("/comunidade/lateral", authenticate, getBarraLateral);
router.post("/comunidade/imagem", authenticate, uploadLimiter, enviarImagem);
router.post("/comunidade/posts", authenticate, communityWriteLimiter, postar);
router.get("/comunidade/posts/:id", authenticate, getPost);
router.post("/comunidade/posts/:id/curtir", authenticate, curtir);
router.post("/comunidade/posts/:id/comentarios", authenticate, communityWriteLimiter, comentarPost);
router.post("/comunidade/comentarios/:id/curtir", authenticate, curtirComentario);
router.get("/comunidade/seguir/:username", authenticate, estadoSeguirUsuario);
router.post("/comunidade/seguir/:username", authenticate, seguirUsuario);
router.delete("/comunidade/seguir/:username", authenticate, deixarDeSeguirUsuario);

export default router;
