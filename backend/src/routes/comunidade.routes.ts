import { Router } from "express";
import { autenticar } from "../middlewares/auth.ts";
import { comunidadeEscritaLimiter, uploadLimiter } from "../middlewares/rateLimit.ts";
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

router.get("/comunidade/feed", autenticar, getFeed);
router.get("/comunidade/lateral", autenticar, getBarraLateral);
router.post("/comunidade/imagem", autenticar, uploadLimiter, enviarImagem);
router.post("/comunidade/posts", autenticar, comunidadeEscritaLimiter, postar);
router.get("/comunidade/posts/:id", autenticar, getPost);
router.post("/comunidade/posts/:id/curtir", autenticar, curtir);
router.post(
    "/comunidade/posts/:id/comentarios",
    autenticar,
    comunidadeEscritaLimiter,
    comentarPost,
);
router.post("/comunidade/comentarios/:id/curtir", autenticar, curtirComentario);
router.get("/comunidade/seguir/:username", autenticar, estadoSeguirUsuario);
router.post("/comunidade/seguir/:username", autenticar, seguirUsuario);
router.delete("/comunidade/seguir/:username", autenticar, deixarDeSeguirUsuario);

export default router;
