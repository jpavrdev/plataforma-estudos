import type { Request, Response, NextFunction } from "express";
import { criarPostSchema, comentarSchema } from "../schemas/comunidade.schema.ts";
import { salvarImagem } from "../services/imagens.ts";
import { apoiadorAtivo } from "../services/apoiador.service.ts";
import { COMUNIDADE_DIR } from "../config/paths.ts";
import {
    feed,
    criarPost,
    alternarCurtida,
    detalhePost,
    comentar,
    tagsPopulares,
    discussoesEmAlta,
    sugestoesParaSeguir,
    duvidasAbertas,
    estadoSeguir,
    seguir,
    deixarDeSeguir,
} from "../services/comunidade.service.ts";

const FILTROS = [
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
        const filtroBruto = String(req.query.filtro ?? "para-voce");
        const filtro = (FILTROS as readonly string[]).includes(filtroBruto)
            ? (filtroBruto as (typeof FILTROS)[number])
            : "para-voce";
        const tag = req.query.tag ? String(req.query.tag).toLowerCase() : null;
        res.json(await feed(req.userId!, filtro, tag));
    } catch (err) {
        next(err);
    }
};

export const postar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = criarPostSchema.parse(req.body);
        res.status(201).json(await criarPost(req.userId!, dados));
    } catch (err) {
        next(err);
    }
};

export const enviarImagem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(await apoiadorAtivo(req.userId!))) {
            return res.status(403).json({ erro: "Enviar imagens na comunidade é um benefício de apoiador." });
        }
        const r = await salvarImagem(req.body?.image, COMUNIDADE_DIR, "/uploads/comunidade");
        if (!r.ok) return res.status(400).json({ erro: r.erro });
        res.json({ url: r.url });
    } catch (err) {
        next(err);
    }
};

export const curtir = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await alternarCurtida(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalhePost(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const comentarPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = comentarSchema.parse(req.body);
        res.status(201).json(await comentar(req.userId!, String(req.params.id), dados));
    } catch (err) {
        next(err);
    }
};

export const getBarraLateral = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [topicos, discussoes, sugestoes, duvidas] = await Promise.all([
            tagsPopulares(),
            discussoesEmAlta(),
            sugestoesParaSeguir(req.userId!),
            duvidasAbertas(),
        ]);
        res.json({ topicos, discussoes, sugestoes, duvidasAbertas: duvidas });
    } catch (err) {
        next(err);
    }
};

export const estadoSeguirUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estadoSeguir(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const seguirUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await seguir(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};

export const deixarDeSeguirUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await deixarDeSeguir(req.userId!, String(req.params.username)));
    } catch (err) {
        next(err);
    }
};
