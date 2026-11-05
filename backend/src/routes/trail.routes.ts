import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.ts";
import {
    createTrail,
    updateTrail,
    deleteTrail,
    createModule,
    deleteModule,
    createLesson,
    createQuestion,
    listTrails,
    getTrail,
    getTrailEpub,
    submitTrailReview,
    getLesson,
    getMyTrails,
    getMyXp,
    submitQuiz,
    checkAnswer,
    setLessonPublished,
    getTrailStudio,
    getLessonStudio,
    saveLessonStudio,
    deleteLesson,
    listTags,
    createTag,
    updateTag,
    deleteTag,
    listLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    listAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    grantAchievement,
    revokeAchievement,
    listAchievementHolders,
    listGlossary,
    createGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    getMyAchievements,
    getUnseenAchievements,
    getMyActivity,
    getCommunityAchievements,
    getRanking,
    getMyStreak,
    getPublicStats,
} from "../controllers/TrailController.ts";

const router = Router();

// Platform numbers for the home page, before any sign-in.
router.get("/estatisticas-publicas", getPublicStats);

// Catalog (the admin creates, anyone signed in reads)
router.post("/trails", authenticate, requireAdmin, createTrail);
router.patch("/trails/:id", authenticate, requireAdmin, updateTrail);
router.delete("/trails/:id", authenticate, requireAdmin, deleteTrail);

// Tags (categories): anyone signed in reads; only the admin writes
router.get("/tags", authenticate, listTags);
router.post("/tags", authenticate, requireAdmin, createTag);
router.patch("/tags/:id", authenticate, requireAdmin, updateTag);
router.delete("/tags/:id", authenticate, requireAdmin, deleteTag);

// Profile languages: anyone signed in reads; only the admin writes
router.get("/languages", authenticate, listLanguages);
router.post("/languages", authenticate, requireAdmin, createLanguage);
router.patch("/languages/:id", authenticate, requireAdmin, updateLanguage);
router.delete("/languages/:id", authenticate, requireAdmin, deleteLanguage);

// Achievements: anyone signed in reads; only the admin writes
router.get("/achievements", authenticate, listAchievements);
router.post("/achievements", authenticate, requireAdmin, createAchievement);
router.patch("/achievements/:id", authenticate, requireAdmin, updateAchievement);
router.delete("/achievements/:id", authenticate, requireAdmin, deleteAchievement);
router.get("/achievements/:id/holders", authenticate, requireAdmin, listAchievementHolders);
router.post("/achievements/:id/grant", authenticate, requireAdmin, grantAchievement);
router.delete("/achievements/:id/grant/:userId", authenticate, requireAdmin, revokeAchievement);

// Glossary: anyone signed in reads; only the admin writes
router.get("/glossary", authenticate, listGlossary);
router.post("/glossary", authenticate, requireAdmin, createGlossaryTerm);
router.patch("/glossary/:id", authenticate, requireAdmin, updateGlossaryTerm);
router.delete("/glossary/:id", authenticate, requireAdmin, deleteGlossaryTerm);
router.post("/trails/:id/modules", authenticate, requireAdmin, createModule);
router.post("/modules/:id/lessons", authenticate, requireAdmin, createLesson);
router.delete("/modules/:id", authenticate, requireAdmin, deleteModule);
router.post("/lessons/:id/questions", authenticate, requireAdmin, createQuestion);
router.patch("/lessons/:id/published", authenticate, requireAdmin, setLessonPublished);
router.get("/trails", authenticate, listTrails);
router.get("/trails/:id", authenticate, getTrail);
// The track as an EPUB book: same access rule as the content (being signed in is enough).
router.get("/trails/:id/epub", authenticate, getTrailEpub);
router.post("/trails/:id/review", authenticate, submitTrailReview);
router.get("/lessons/:id", authenticate, getLesson);

// Estúdio (admin): editing the structure and the content of the lessons
router.get("/trails/:id/studio", authenticate, requireAdmin, getTrailStudio);
router.get("/lessons/:id/studio", authenticate, requireAdmin, getLessonStudio);
router.put("/lessons/:id/studio", authenticate, requireAdmin, saveLessonStudio);
router.delete("/lessons/:id", authenticate, requireAdmin, deleteLesson);

// Student progress
router.get("/me/trails", authenticate, getMyTrails);
router.get("/me/xp", authenticate, getMyXp);
router.get("/me/achievements", authenticate, getMyAchievements);
router.get("/me/achievements/unseen", authenticate, getUnseenAchievements);
router.get("/me/activity", authenticate, getMyActivity);
router.get("/me/streak", authenticate, getMyStreak);
router.get("/community/achievements", authenticate, getCommunityAchievements);
router.get("/ranking", authenticate, getRanking);
router.post("/lessons/:id/quiz", authenticate, submitQuiz);
router.post("/lessons/:id/quiz/check", authenticate, checkAnswer);

export default router;
