import type { Request, Response, NextFunction } from "express";
import {
    createTrailSchema,
    createModuleSchema,
    createLessonSchema,
    createQuestionSchema,
    submitQuizSchema,
    checkAnswerSchema,
    saveLessonStudioSchema,
    updateTrailSchema,
    createTagSchema,
    updateTagSchema,
    createLanguageSchema,
    updateLanguageSchema,
    createAchievementSchema,
    updateAchievementSchema,
} from "../schemas/trail.schemas.ts";
import { calcularStreak, diasAtivosDoUsuario, semanaAtividade } from "../services/streak.ts";
import { rankingGlobal } from "../services/ranking.ts";
import { atividadeRecente } from "../services/activity.service.ts";
import { listarTags, criarTag, atualizarTag, excluirTag } from "../services/tag.service.ts";
import {
    listarLinguagens,
    criarLinguagem,
    atualizarLinguagem,
    excluirLinguagem,
} from "../services/language.service.ts";
import { calcularEstatisticas } from "../services/stats.service.ts";
import {
    listarConquistas,
    criarConquista,
    atualizarConquista,
    excluirConquista,
    conquistasDoUsuario,
    feedComunidade,
} from "../services/achievement.service.ts";
import {
    criarTrilha,
    atualizarTrilha,
    excluirTrilha,
    listarTrilhas,
    trilhasDoUsuario,
    detalheDaTrilha,
} from "../services/trail.service.ts";
import { detalheDaAula } from "../services/lesson.service.ts";
import { corrigirQuiz, conferirResposta } from "../services/quiz.service.ts";
import {
    criarModulo,
    excluirModulo,
    criarAula,
    criarQuestao,
    definirPublicacao,
    estruturaDoEstudio,
    aulaParaEdicao,
    excluirAula,
    salvarAulaEstudio,
} from "../services/estudio.service.ts";

export const createTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTrailSchema.parse(req.body);
        res.status(201).json(await criarTrilha(dados));
    } catch (err) {
        next(err);
    }
};

// ===================== TAGS (categorias de trilha) =====================
export const listTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarTags());
    } catch (err) {
        next(err);
    }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createTagSchema.parse(req.body);
        res.status(201).json(await criarTag(dados.name));
    } catch (err) {
        next(err);
    }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateTagSchema.parse(req.body);
        res.json(await atualizarTag(id, dados.name));
    } catch (err) {
        next(err);
    }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirTag(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== LINGUAGENS (canônicas do perfil) =====================
export const listLanguages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarLinguagens());
    } catch (err) {
        next(err);
    }
};

export const createLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createLanguageSchema.parse(req.body);
        res.status(201).json(await criarLinguagem(dados.name));
    } catch (err) {
        next(err);
    }
};

export const updateLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateLanguageSchema.parse(req.body);
        res.json(await atualizarLinguagem(id, dados.name));
    } catch (err) {
        next(err);
    }
};

export const deleteLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirLinguagem(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// ===================== CONQUISTAS (catálogo, admin) =====================
export const listAchievements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarConquistas());
    } catch (err) {
        next(err);
    }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dados = createAchievementSchema.parse(req.body);
        res.status(201).json(await criarConquista(dados));
    } catch (err) {
        next(err);
    }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const dados = updateAchievementSchema.parse(req.body);
        res.json(await atualizarConquista(id, dados));
    } catch (err) {
        next(err);
    }
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirConquista(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Edita os dados da trilha (admin).
export const updateTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = updateTrailSchema.parse(req.body);
        res.json(await atualizarTrilha(trailId, dados));
    } catch (err) {
        next(err);
    }
};

// Exclui a trilha inteira (módulos, aulas, questões e progresso).
export const deleteTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirTrilha(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const dados = createModuleSchema.parse(req.body);
        res.status(201).json(await criarModulo(trailId, dados));
    } catch (err) {
        next(err);
    }
};

// Exclui um módulo e todas as suas aulas (questões, opções e progresso).
export const deleteModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirModulo(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moduleId = String(req.params.id);
        const dados = createLessonSchema.parse(req.body);
        res.status(201).json(await criarAula(moduleId, dados));
    } catch (err) {
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = createQuestionSchema.parse(req.body);
        res.status(201).json(await criarQuestao(lessonId, dados));
    } catch (err) {
        next(err);
    }
};

export const listTrails = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarTrilhas());
    } catch (err) {
        next(err);
    }
};

export const getMyTrails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "Não autenticado" });
        }
        res.json(await trilhasDoUsuario(userId));
    } catch (err) {
        next(err);
    }
};

// Retorna a trilha com módulos e aulas, cada aula com estado para o usuário.
// Estado sequencial na trilha toda: done | current | locked.
export const getTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDaTrilha(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

// Retorna a aula com conteúdo e questões SEM revelar a alternativa correta.
export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await detalheDaAula(String(req.params.id), req.userId!));
    } catch (err) {
        next(err);
    }
};

// Recebe as respostas, corrige no servidor e conclui a aula se acertar o mínimo.
export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = submitQuizSchema.parse(req.body);
        res.json(await corrigirQuiz(req.userId!, lessonId, dados));
    } catch (err) {
        next(err);
    }
};

// XP total do usuário: 50 por aula concluída + 10 por questão acertada (primeira vez).
export const getMyXp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await calcularEstatisticas(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Catálogo de conquistas com a marcação do que o usuário já desbloqueou.
export const getMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await conquistasDoUsuario(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Atividades recentes derivadas: aulas concluídas + conquistas desbloqueadas.
export const getMyActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atividadeRecente(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Feed da comunidade: quem desbloqueou cada conquista, mais recentes primeiro.
export const getCommunityAchievements = async (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        res.json(await feedComunidade());
    } catch (err) {
        next(err);
    }
};

// Ranking global por XP. Liga e nível usam o XP total; o leaderboard usa o
// período (week/month/all). XP = 50 por aula concluída + 10 por questão certa.
export const getRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const periodo = String(req.query.period ?? "all");
        res.json(await rankingGlobal(periodo, req.userId));
    } catch (err) {
        next(err);
    }
};

// Streak do usuário + os últimos 7 dias (para o card da home).
export const getMyStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dias = await diasAtivosDoUsuario(req.userId!);
        res.json({ streak: calcularStreak(dias), week: semanaAtividade(dias) });
    } catch (err) {
        next(err);
    }
};

// Verifica uma única resposta para o quiz em carrossel (feedback imediato), sem
// expor o gabarito das outras questões. Não grava nada: a conclusão da aula
// continua sendo decidida no submitQuiz.
export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { questionId, optionId } = checkAnswerSchema.parse(req.body);
        res.json(await conferirResposta(req.userId!, lessonId, questionId, optionId));
    } catch (err) {
        next(err);
    }
};

// Publica ou despublica uma aula (admin). Body: { published: boolean }
export const setLessonPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { published } = req.body;
        if (typeof published !== "boolean") {
            return res.status(400).json({ erro: "Campo 'published' deve ser booleano" });
        }

        res.json(await definirPublicacao(lessonId, published));
    } catch (err) {
        next(err);
    }
};

// ===================== ESTÚDIO (admin) =====================

// Estrutura do curso para o editor: módulos ordenados com suas aulas (inclui rascunhos).
export const getTrailStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estruturaDoEstudio(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

// Aula completa para edição: inclui o gabarito e a dificuldade (só admin).
export const getLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await aulaParaEdicao(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

// Exclui uma aula e tudo que depende dela.
export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirAula(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Salva a aula inteira (título, blocos de conteúdo e questões de uma vez). Substitui
// as questões por completo. Valida o conteúdo apenas quando vai publicar.
export const saveLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const dados = saveLessonStudioSchema.parse(req.body);
        await salvarAulaEstudio(lessonId, dados);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
