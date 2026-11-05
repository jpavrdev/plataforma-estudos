import { Router } from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.ts";
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
router.post("/trails", autenticar, exigirAdmin, createTrail);
router.patch("/trails/:id", autenticar, exigirAdmin, updateTrail);
router.delete("/trails/:id", autenticar, exigirAdmin, deleteTrail);

// Tags (categories): anyone signed in reads; only the admin writes
router.get("/tags", autenticar, listTags);
router.post("/tags", autenticar, exigirAdmin, createTag);
router.patch("/tags/:id", autenticar, exigirAdmin, updateTag);
router.delete("/tags/:id", autenticar, exigirAdmin, deleteTag);

// Profile languages: anyone signed in reads; only the admin writes
router.get("/languages", autenticar, listLanguages);
router.post("/languages", autenticar, exigirAdmin, createLanguage);
router.patch("/languages/:id", autenticar, exigirAdmin, updateLanguage);
router.delete("/languages/:id", autenticar, exigirAdmin, deleteLanguage);

// Achievements: anyone signed in reads; only the admin writes
router.get("/achievements", autenticar, listAchievements);
router.post("/achievements", autenticar, exigirAdmin, createAchievement);
router.patch("/achievements/:id", autenticar, exigirAdmin, updateAchievement);
router.delete("/achievements/:id", autenticar, exigirAdmin, deleteAchievement);
router.get("/achievements/:id/holders", autenticar, exigirAdmin, listAchievementHolders);
router.post("/achievements/:id/grant", autenticar, exigirAdmin, grantAchievement);
router.delete("/achievements/:id/grant/:userId", autenticar, exigirAdmin, revokeAchievement);

// Glossary: anyone signed in reads; only the admin writes
router.get("/glossary", autenticar, listGlossary);
router.post("/glossary", autenticar, exigirAdmin, createGlossaryTerm);
router.patch("/glossary/:id", autenticar, exigirAdmin, updateGlossaryTerm);
router.delete("/glossary/:id", autenticar, exigirAdmin, deleteGlossaryTerm);
router.post("/trails/:id/modules", autenticar, exigirAdmin, createModule);
router.post("/modules/:id/lessons", autenticar, exigirAdmin, createLesson);
router.delete("/modules/:id", autenticar, exigirAdmin, deleteModule);
router.post("/lessons/:id/questions", autenticar, exigirAdmin, createQuestion);
router.patch("/lessons/:id/published", autenticar, exigirAdmin, setLessonPublished);
router.get("/trails", autenticar, listTrails);
router.get("/trails/:id", autenticar, getTrail);
// The track as an EPUB book: same access rule as the content (being signed in is enough).
router.get("/trails/:id/epub", autenticar, getTrailEpub);
router.post("/trails/:id/review", autenticar, submitTrailReview);
router.get("/lessons/:id", autenticar, getLesson);

// Estúdio (admin): editing the structure and the content of the lessons
router.get("/trails/:id/studio", autenticar, exigirAdmin, getTrailStudio);
router.get("/lessons/:id/studio", autenticar, exigirAdmin, getLessonStudio);
router.put("/lessons/:id/studio", autenticar, exigirAdmin, saveLessonStudio);
router.delete("/lessons/:id", autenticar, exigirAdmin, deleteLesson);

// Student progress
router.get("/me/trails", autenticar, getMyTrails);
router.get("/me/xp", autenticar, getMyXp);
router.get("/me/achievements", autenticar, getMyAchievements);
router.get("/me/achievements/unseen", autenticar, getUnseenAchievements);
router.get("/me/activity", autenticar, getMyActivity);
router.get("/me/streak", autenticar, getMyStreak);
router.get("/community/achievements", autenticar, getCommunityAchievements);
router.get("/ranking", autenticar, getRanking);
router.post("/lessons/:id/quiz", autenticar, submitQuiz);
router.post("/lessons/:id/quiz/check", autenticar, checkAnswer);

export default router;
