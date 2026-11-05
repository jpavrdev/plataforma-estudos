import type { Request, Response, NextFunction } from "express";
import {
    createTrailSchema,
    reviewTrailSchema,
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
    grantAchievementSchema,
    glossaryTermSchema,
} from "../schemas/trail.schemas.ts";
import { resumoSemana } from "../services/streak.ts";
import { rankingGlobal } from "../services/ranking.ts";
import { atividadeRecente } from "../services/activity.service.ts";
import { buildTrailBook } from "../services/book.service.ts";
import { listarTags, criarTag, atualizarTag, excluirTag } from "../services/tag.service.ts";
import {
    listarLinguagens,
    criarLinguagem,
    atualizarLinguagem,
    excluirLinguagem,
} from "../services/language.service.ts";
import { calcularEstatisticas, estatisticasPublicas } from "../services/stats.service.ts";
import {
    listarConquistas,
    criarConquista,
    atualizarConquista,
    excluirConquista,
    concederConquista,
    revogarConquista,
    usuariosComConquista,
    conquistasDoUsuario,
    conquistasNaoVistas,
    feedComunidade,
} from "../services/achievement.service.ts";
import {
    listarGlossario,
    criarTermo,
    atualizarTermo,
    excluirTermo,
} from "../services/glossary.service.ts";
import {
    insertTrail,
    editTrail,
    removeTrail,
    findTrails,
    findUserTrails,
    findTrailDetail,
    saveTrailReview,
} from "../services/trail.service.ts";
import { findLessonDetail } from "../services/lesson.service.ts";
import { gradeQuiz, verifyAnswer } from "../services/quiz.service.ts";
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
        const data = createTrailSchema.parse(req.body);
        res.status(201).json(await insertTrail(data));
    } catch (err) {
        next(err);
    }
};

// ===================== TAGS (track categories) =====================
export const listTags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarTags());
    } catch (err) {
        next(err);
    }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createTagSchema.parse(req.body);
        res.status(201).json(await criarTag(data.name));
    } catch (err) {
        next(err);
    }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const data = updateTagSchema.parse(req.body);
        res.json(await atualizarTag(id, data.name));
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

// ===================== LANGUAGES (the profile's canonical list) =====================
export const listLanguages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarLinguagens());
    } catch (err) {
        next(err);
    }
};

export const createLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createLanguageSchema.parse(req.body);
        res.status(201).json(await criarLinguagem(data.name));
    } catch (err) {
        next(err);
    }
};

export const updateLanguage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const data = updateLanguageSchema.parse(req.body);
        res.json(await atualizarLinguagem(id, data.name));
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

// ===================== ACHIEVEMENTS (catalog, admin) =====================
export const listAchievements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarConquistas());
    } catch (err) {
        next(err);
    }
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createAchievementSchema.parse(req.body);
        res.status(201).json(await criarConquista(data));
    } catch (err) {
        next(err);
    }
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const data = updateAchievementSchema.parse(req.body);
        res.json(await atualizarConquista(id, data));
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

// Grants or revokes an achievement (special occasion) to a user; lists who has it.
export const grantAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params.id);
        const { userId } = grantAchievementSchema.parse(req.body);
        await concederConquista(id, userId);
        res.status(201).json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const revokeAchievement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await revogarConquista(String(req.params.id), String(req.params.userId));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const listAchievementHolders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await usuariosComConquista(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

// ===================== Glossary =====================
export const listGlossary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await listarGlossario());
    } catch (err) {
        next(err);
    }
};

export const createGlossaryTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = glossaryTermSchema.parse(req.body);
        res.status(201).json(await criarTermo(data));
    } catch (err) {
        next(err);
    }
};

export const updateGlossaryTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = glossaryTermSchema.parse(req.body);
        res.json(await atualizarTermo(String(req.params.id), data));
    } catch (err) {
        next(err);
    }
};

export const deleteGlossaryTerm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirTermo(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Edits the track data (admin).
export const updateTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const data = updateTrailSchema.parse(req.body);
        res.json(await editTrail(trailId, data));
    } catch (err) {
        next(err);
    }
};

// Deletes the whole track (modules, lessons, questions and progress).
export const deleteTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeTrail(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const createModule = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trailId = String(req.params.id);
        const data = createModuleSchema.parse(req.body);
        res.status(201).json(await criarModulo(trailId, data));
    } catch (err) {
        next(err);
    }
};

// Deletes a module and all its lessons (questions, options and progress).
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
        const data = createLessonSchema.parse(req.body);
        res.status(201).json(await criarAula(moduleId, data));
    } catch (err) {
        next(err);
    }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const data = createQuestionSchema.parse(req.body);
        res.status(201).json(await criarQuestao(lessonId, data));
    } catch (err) {
        next(err);
    }
};

export const listTrails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const level = typeof req.query.level === "string" ? req.query.level : undefined;
        const category = typeof req.query.categoria === "string" ? req.query.categoria : undefined;
        res.json(await findTrails({ level, categoria: category }));
    } catch (err) {
        next(err);
    }
};

export const getMyTrails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ erro: "common.notAuthenticated" });
        }
        res.json(await findUserTrails(userId));
    } catch (err) {
        next(err);
    }
};

// Returns the track with modules and lessons, each lesson with its state for the user.
// The state follows the whole track in sequence: done | current | locked.
export const getTrail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = typeof req.query.lang === "string" ? req.query.lang : undefined;
        res.json(await findTrailDetail(String(req.params.id), req.userId!, lang));
    } catch (err) {
        next(err);
    }
};

// The track as an EPUB book, to read outside the platform. The file comes from the
// published content and is cached by hash, so downloading it again does not
// process the whole track again.
export const getTrailEpub = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = typeof req.query.lang === "string" ? req.query.lang : undefined;
        const { buffer, nome: fileName } = await buildTrailBook(String(req.params.id), lang);
        res.setHeader("Content-Type", "application/epub+zip");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Length", String(buffer.length));
        res.send(buffer);
    } catch (err) {
        next(err);
    }
};

export const submitTrailReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = reviewTrailSchema.parse(req.body);
        res.json(
            await saveTrailReview(
                String(req.params.id),
                req.userId!,
                data.stars,
                data.comment ?? null,
            ),
        );
    } catch (err) {
        next(err);
    }
};

// Returns the lesson with content and questions WITHOUT revealing the right option.
export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = typeof req.query.lang === "string" ? req.query.lang : undefined;
        res.json(await findLessonDetail(String(req.params.id), req.userId!, lang));
    } catch (err) {
        next(err);
    }
};

// Receives the answers, grades them on the server and completes the lesson when enough are right.
export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const data = submitQuizSchema.parse(req.body);
        res.json(await gradeQuiz(req.userId!, lessonId, data));
    } catch (err) {
        next(err);
    }
};

// The user's total XP: 50 per completed lesson + 10 per question answered right (the first time).
export const getMyXp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await calcularEstatisticas(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Platform numbers for the public home page (no sign-in). Aggregates only.
export const getPublicStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estatisticasPublicas());
    } catch (err) {
        next(err);
    }
};

// Achievement catalog, marking what the user already unlocked.
export const getMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await conquistasDoUsuario(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Newly unlocked achievements not notified yet (they feed the Steam-style toast).
export const getUnseenAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await conquistasNaoVistas(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Derived recent activity: completed lessons + unlocked achievements.
export const getMyActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await atividadeRecente(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Community feed: who unlocked each achievement, most recent first.
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

// Global XP ranking. League and level use the total XP; the leaderboard uses the
// period (week/month/all). XP = 50 per completed lesson + 10 per right answer.
export const getRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const period = String(req.query.period ?? "all");
        res.json(await rankingGlobal(period, req.userId));
    } catch (err) {
        next(err);
    }
};

// The user's streak + the last 7 days (for the home card).
export const getMyStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await resumoSemana(req.userId!));
    } catch (err) {
        next(err);
    }
};

// Checks a single answer for the carousel quiz (immediate feedback), without
// exposing the answer key of the other questions. It saves nothing: completing
// the lesson is still decided in submitQuiz.
export const checkAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { questionId, optionId } = checkAnswerSchema.parse(req.body);
        res.json(await verifyAnswer(req.userId!, lessonId, questionId, optionId));
    } catch (err) {
        next(err);
    }
};

// Publishes or unpublishes a lesson (admin). Body: { published: boolean }
export const setLessonPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const { published } = req.body;
        if (typeof published !== "boolean") {
            return res.status(400).json({ erro: "trail.publishedMustBeBoolean" });
        }

        res.json(await definirPublicacao(lessonId, published));
    } catch (err) {
        next(err);
    }
};

// ===================== ESTÚDIO (admin) =====================

// Course structure for the editor: ordered modules with their lessons (drafts included).
export const getTrailStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await estruturaDoEstudio(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

// Full lesson for editing: includes the answer key and the difficulty (admin only).
export const getLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(await aulaParaEdicao(String(req.params.id)));
    } catch (err) {
        next(err);
    }
};

// Deletes a lesson and everything that depends on it.
export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await excluirAula(String(req.params.id));
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// Saves the whole lesson (title, content blocks and questions at once). It replaces
// the questions completely. The content is validated only when publishing.
export const saveLessonStudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lessonId = String(req.params.id);
        const data = saveLessonStudioSchema.parse(req.body);
        await salvarAulaEstudio(lessonId, data);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
