import type { Request, Response, NextFunction } from "express";
import {
    salvarRespostaSchema,
    createSimuladoSchema,
    updateSimuladoSchema,
    simuladoQuestionSchema,
    sincronizarQuestoesSchema,
} from "../schemas/simulado.schema.ts";
import {
    listarSimulados,
    iniciarTentativa,
    estadoDaTentativa,
    salvarResposta,
    enviarTentativa,
    historicoDoUsuario,
    listarSimuladosAdmin,
    detalheSimuladoAdmin,
    criarSimulado,
    atualizarSimulado,
    excluirSimulado,
    criarQuestaoSimulado,
    atualizarQuestaoSimulado,
    excluirQuestaoSimulado,
    sincronizarQuestoesSimulado,
} from "../services/simulado.service.ts";

export const listSimulados = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarSimulados());
    } catch (err) {
        next(err);
    }
};

export const startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await iniciarTentativa(req.userId!, String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const getAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estadoDaTentativa(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const saveAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { optionIds } = salvarRespostaSchema.parse(req.body);
        res.json(
            await salvarResposta(
                req.userId!,
                String(req.params.id),
                String(req.params.questionId),
                optionIds,
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await enviarTentativa(req.userId!, String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const getMyAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await historicoDoUsuario(req.userId!));
    } catch (err) {
        next(err);
    }
};

// ===================== ADMIN =====================
export const adminListSimulados = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarSimuladosAdmin());
    } catch (err) {
        next(err);
    }
};

export const adminGetSimulado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheSimuladoAdmin(String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const createSimulado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(await criarSimulado(createSimuladoSchema.parse(req.body)));
    } catch (err) {
        next(err);
    }
};

export const updateSimulado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(
            await atualizarSimulado(String(req.params.slug), updateSimuladoSchema.parse(req.body)),
        );
    } catch (err) {
        next(err);
    }
};

export const deleteSimulado = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await excluirSimulado(String(req.params.slug)));
    } catch (err) {
        next(err);
    }
};

export const createSimuladoQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(201).json(
            await criarQuestaoSimulado(
                String(req.params.slug),
                simuladoQuestionSchema.parse(req.body),
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const updateSimuladoQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(
            await atualizarQuestaoSimulado(
                String(req.params.id),
                simuladoQuestionSchema.parse(req.body),
            ),
        );
    } catch (err) {
        next(err);
    }
};

export const deleteSimuladoQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await excluirQuestaoSimulado(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

export const syncSimuladoQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { questions } = sincronizarQuestoesSchema.parse(req.body);
        res.json(await sincronizarQuestoesSimulado(String(req.params.slug), questions));
    } catch (err) {
        next(err);
    }
};
